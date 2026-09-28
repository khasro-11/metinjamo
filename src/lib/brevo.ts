/**
 * Delivery of a quote request through the Brevo transactional email API (v3).
 *
 * SERVER-SIDE MODULE. Every credential below is read from a variable WITHOUT
 * the `NEXT_PUBLIC_` prefix, which is what keeps it out of the client bundle.
 * Nothing in here may be imported from a component marked `'use client'`.
 *
 * Why the call is made from the server
 * -----------------------------------
 * The visitor's browser never talks to Brevo. Three reasons, and the first one
 * is the one that matters legally:
 *
 *   1. Data protection. A browser-side send would open a connection from the
 *      visitor's own device to `api.brevo.com` — a transfer of their IP address
 *      to a third party, from their machine, before they have agreed to
 *      anything. That needs a consent banner. Called from the server, the only
 *      party talking to Brevo is us: the visitor's browser never hears of them,
 *      and no banner is required (CLAUDE.md 3). The privacy notice on the form
 *      says exactly this, so it has to stay true.
 *   2. Validation. `app/api/anfrage` re-validates the whole request against
 *      `quoteRequestSchema` because it is the check that actually counts. If
 *      the browser sent the mail itself, that check would be decorative.
 *   3. Credentials. A Brevo API key is not a public key — it can send mail,
 *      read contacts and spend the account's quota. It never leaves the server.
 *
 * Why `fetch` and not `@getbrevo/brevo` (CLAUDE.md 6, 10.7)
 * --------------------------------------------------------
 * The official SDK is a generated client on top of axios. It would add a
 * dependency tree to a bundle that is redeployed to Cloudflare Workers on every
 * push, in exchange for wrapping the single HTTP call this file makes. The repo
 * already speaks to a mail provider over `fetch`, and the route's error
 * handling is built around the two error classes below rather than around an
 * SDK's exception shape. There is no argument for the dependency, so there
 * isn't one.
 *
 * Deployment prerequisite: `BREVO_SENDER_EMAIL` has to be a sender Brevo has
 * verified — ideally an address on a domain authenticated with SPF, DKIM and
 * DMARC. Brevo refuses an unverified sender outright, and an unauthenticated
 * one is delivered but lands in spam, which for this form is the same as not
 * being delivered. Step by step in `docs/brevo.md`.
 */

import {
  renderQuoteMail,
  type ConfirmationParams,
  type NotificationParams,
} from '@/lib/quote-mail';
import { renderMailTemplate } from '@/lib/mail-template';
import { CONFIRMATION_HTML } from '@/lib/mail-templates/anfrage-bestaetigung';
import { INTERNAL_NOTIFICATION_HTML } from '@/lib/mail-templates/anfrage-intern';
import type { QuoteRequest } from '@/lib/quote-request';
import { company } from '@/config/company';

const ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * A slow provider must not hold a serverless invocation open until the platform
 * kills it — the form would sit on "Wird gesendet …" and the visitor would
 * never learn whether their request arrived.
 */
const REQUEST_TIMEOUT_MS = 10_000;

interface BrevoConfig {
  readonly apiKey: string;
  /** Must be a verified sender in the Brevo account. */
  readonly senderEmail: string;
  readonly senderName: string;
  /** Where the lead goes. Defaults to the address in `company.ts`. */
  readonly recipientEmail: string;
  /** `false` unless explicitly switched on — see `readConfig`. */
  readonly sendConfirmation: boolean;
}

/** Configuration is missing or incomplete — a deployment problem, not a user one. */
export class MailConfigError extends Error {
  constructor(missing: readonly string[]) {
    super(`Brevo is not configured. Missing: ${missing.join(', ')}`);
    this.name = 'MailConfigError';
  }
}

/** The provider refused or could not be reached. */
export class MailDeliveryError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'MailDeliveryError';
    this.status = status;
  }
}

/**
 * Removes anything shaped like an email address from a string.
 *
 * Applied to every provider message before it is logged. Brevo quotes the
 * offending value back in some 400s ("… is not a valid email address"), and the
 * offending value can be the enquirer's own address, which would put personal
 * data into a platform log that the rest of this code path takes care to keep
 * clean. The diagnostic value sits in the error code and the sentence, not in
 * the address.
 */
function redactAddresses(text: string): string {
  return text.replace(/[^\s<>"',;]+@[^\s<>"',;]+/g, '[address redacted]');
}

/**
 * Reads the environment at call time, not at module scope.
 *
 * Module scope is evaluated during the build, where none of these variables
 * exist — reading there would make a missing credential a build failure instead
 * of the runtime error it actually is.
 */
function readConfig(): BrevoConfig {
  const env = process.env;

  const required = {
    BREVO_API_KEY: env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL: env.BREVO_SENDER_EMAIL,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);

  if (missing.length > 0) throw new MailConfigError(missing);

  /*
   * The recipient is not a secret and not a deployment decision — it is the
   * company's own address, and `company.ts` is the single source of truth for
   * it (CLAUDE.md 2). The environment variable exists so that a staging
   * deployment can send somewhere else without editing code; unset, which is
   * the normal case, the lead goes where the imprint says it goes.
   */
  const recipientEmail =
    env.BREVO_TO_EMAIL?.trim() || company.email.address;

  return {
    apiKey: required.BREVO_API_KEY!.trim(),
    senderEmail: required.BREVO_SENDER_EMAIL!.trim(),
    senderName: env.BREVO_SENDER_NAME?.trim() || company.legalName,
    recipientEmail,
    /*
     * Opt-in, and it ships unset: the client decided against an auto-reply.
     * That is a decision, not an oversight — please do not "complete" it by
     * turning this on. Only the two explicit spellings count, so a leftover
     * `BREVO_SEND_CONFIRMATION=false` or `=0` reads as off rather than as a
     * non-empty string that happens to be truthy.
     */
    sendConfirmation: ['1', 'true'].includes(
      (env.BREVO_SEND_CONFIRMATION ?? '').trim().toLowerCase(),
    ),
  };
}

/** The subset of Brevo's payload this module uses. */
interface BrevoPayload {
  readonly sender: { readonly email: string; readonly name: string };
  readonly to: readonly { readonly email: string; readonly name?: string }[];
  readonly replyTo: { readonly email: string; readonly name?: string };
  readonly subject: string;
  readonly htmlContent: string;
  readonly textContent: string;
  /** Visible in Brevo's own log. Category only — never anything identifying. */
  readonly tags: readonly string[];
}

/**
 * One send. Resolves with Brevo's message id, throws `MailDeliveryError`
 * otherwise.
 *
 * The message id is the handle for looking a send up in Brevo's transactional
 * log ("did it bounce?"), and it carries no personal data, which is what makes
 * it safe for the route to log.
 */
async function send(
  config: BrevoConfig,
  payload: BrevoPayload,
): Promise<string | null> {
  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (cause) {
    const reason =
      cause instanceof Error && cause.name === 'TimeoutError'
        ? `no response within ${REQUEST_TIMEOUT_MS} ms`
        : 'network error';

    throw new MailDeliveryError(`Brevo unreachable (${reason})`);
  }

  if (!response.ok) {
    /*
     * Brevo answers a rejection with `{ code, message }`. Both are read because
     * without them a 400 is unfixable — "unauthorized" (wrong key) and
     * "sender_not_valid" (unverified sender) are the two that actually happen,
     * and they need completely different fixes. Redacted and truncated because
     * this string is about to be logged.
     */
    const detail = await response
      .json()
      .then((body: unknown) => {
        if (typeof body !== 'object' || body === null) return '';
        const { code, message } = body as Record<string, unknown>;

        return [code, message]
          .filter((part): part is string => typeof part === 'string')
          .join(': ');
      })
      .catch(() => '');

    throw new MailDeliveryError(
      `Brevo rejected the request${
        detail ? `: ${redactAddresses(detail).slice(0, 200)}` : ''
      }`,
      response.status,
    );
  }

  // A 201 carries `{ messageId }`. Its absence is not an error — the mail was
  // accepted either way, and the id is only a convenience for tracing.
  return await response
    .json()
    .then((body: unknown) =>
      typeof body === 'object' &&
      body !== null &&
      typeof (body as { messageId?: unknown }).messageId === 'string'
        ? (body as { messageId: string }).messageId
        : null,
    )
    .catch(() => null);
}

function notificationPayload(
  config: BrevoConfig,
  params: NotificationParams,
  text: string,
): BrevoPayload {
  return {
    /*
     * The sender is us, never the enquirer. Putting their address in `From`
     * would be a mail signed by our domain claiming to come from theirs, which
     * SPF and DMARC exist to reject — the notification would be filtered at the
     * very moment it matters. `replyTo` is the correct field for "answer this
     * person", and it makes the reply button in the inbox do the right thing.
     */
    sender: { email: config.senderEmail, name: config.senderName },
    to: [{ email: config.recipientEmail, name: company.shortName }],
    replyTo: { email: params.reply_to, name: params.customer_name },
    subject: params.subject,
    htmlContent: renderMailTemplate(INTERNAL_NOTIFICATION_HTML, params),
    textContent: text,
    tags: ['angebotsanfrage', 'intern'],
  };
}

function confirmationPayload(
  config: BrevoConfig,
  params: ConfirmationParams,
  text: string,
): BrevoPayload {
  return {
    sender: { email: config.senderEmail, name: config.senderName },
    to: [{ email: params.to_email, name: params.customer_name }],
    // A reply to the confirmation is a reply to the company, so it goes to the
    // address the imprint and the footer print — not to the technical sender.
    replyTo: { email: company.email.address, name: company.shortName },
    subject: params.subject,
    htmlContent: renderMailTemplate(CONFIRMATION_HTML, params),
    textContent: text,
    tags: ['angebotsanfrage', 'bestaetigung'],
  };
}

export interface DeliveryResult {
  /** Brevo's id for the notification, for looking the send up in their log. */
  readonly messageId: string | null;
  /** `false` when the confirmation is switched off, or when it failed. */
  readonly confirmationSent: boolean;
}

/**
 * Sends the internal notification and, if switched on, the enquirer's
 * confirmation.
 *
 * The two are deliberately not equal. The notification is the lead — if it does
 * not arrive, the request is lost and the caller must be told, so a failure
 * here throws. The confirmation is a courtesy: a visitor whose request reached
 * the company but who did not get their copy has still been helped, and turning
 * that into an error state would tell them to submit again and produce a
 * duplicate lead. It is therefore best effort, and the result says which it was.
 *
 * No gap between the two sends, unlike the provider this replaced: Brevo's
 * transactional limits are measured in hundreds per hour, not one per second,
 * so there is nothing here to pace.
 *
 * The visitor's data is never logged, here or in the callers: the mail is meant
 * to be the only copy that exists (see the privacy note on the form).
 */
export async function sendQuoteRequest(
  request: QuoteRequest,
): Promise<DeliveryResult> {
  const config = readConfig();
  const { notification, confirmation } = renderQuoteMail(request);

  const messageId = await send(
    config,
    notificationPayload(config, notification.params, notification.text),
  );

  if (!config.sendConfirmation) return { messageId, confirmationSent: false };

  try {
    await send(
      config,
      confirmationPayload(config, confirmation.params, confirmation.text),
    );
    return { messageId, confirmationSent: true };
  } catch (cause) {
    // Message only, and it has already been redacted and truncated. The
    // recipient address is not logged.
    console.error(
      `[anfrage] confirmation mail failed: ${
        cause instanceof Error ? cause.message : 'unknown error'
      }`,
    );
    return { messageId, confirmationSent: false };
  }
}
