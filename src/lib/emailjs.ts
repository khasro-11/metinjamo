/**
 * Delivery of a quote request through the EmailJS REST API.
 *
 * SERVER-SIDE MODULE. Every credential below is read from a variable WITHOUT
 * the `NEXT_PUBLIC_` prefix, which is what keeps them out of the client bundle.
 * Nothing in here may be imported from a component marked `'use client'`.
 *
 * Why the REST API and not `@emailjs/browser`
 * -------------------------------------------
 * EmailJS is normally used from the browser with a public key. That is the
 * wrong shape for this site, on three counts:
 *
 *   1. Data protection. A browser-side send means the visitor's own device
 *      opens a connection to `api.emailjs.com` — a transfer of their IP address
 *      to a third country, from their machine, before they have agreed to
 *      anything. That needs a consent banner. Called from the server, the only
 *      party talking to EmailJS is us: the visitor's browser never hears of
 *      them, and no banner is required (CLAUDE.md 3).
 *   2. Validation. `app/api/anfrage` re-validates the whole request against
 *      `quoteRequestSchema` because it is the check that actually counts. If
 *      the browser sent the mail itself, that check would be decorative.
 *   3. Credentials. The public key is visible to anyone who opens devtools, and
 *      a public key alone is enough to send mail through the account. With the
 *      private key held server-side, the account cannot be driven from outside.
 *
 * Why no dependency (CLAUDE.md 10.7): `@emailjs/nodejs` wraps the same two HTTP
 * calls this file makes, and adds its own client-side rate limiter and block
 * list that we do not use. One `fetch` against a documented endpoint is less
 * code than the integration would be.
 *
 * Dashboard prerequisite: EmailJS disables API access for non-browser callers
 * by default. "Allow EmailJS API for non-browser applications" has to be
 * enabled under Account → Security, or every request comes back rejected. See
 * `docs/emailjs.md`.
 */

import {
  renderQuoteMail,
  type ConfirmationParams,
  type NotificationParams,
} from '@/lib/quote-mail';
import type { QuoteRequest } from '@/lib/quote-request';

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * A slow provider must not hold a serverless invocation open until the platform
 * kills it — the form would sit on "Wird gesendet …" and the visitor would
 * never learn whether their request arrived.
 */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * EmailJS documents a limit of one request per second. Two sends back to back
 * would sit exactly on that edge, so the confirmation waits before going out.
 * It costs one second of wall clock on a submit that happens a few times a day.
 */
const RATE_LIMIT_GAP_MS = 1_100;

interface EmailJsConfig {
  readonly serviceId: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly notificationTemplateId: string;
  /** Optional: without it, only the internal notification goes out. */
  readonly confirmationTemplateId: string | null;
}

/** Configuration is missing or incomplete — a deployment problem, not a user one. */
export class MailConfigError extends Error {
  constructor(missing: readonly string[]) {
    super(`EmailJS is not configured. Missing: ${missing.join(', ')}`);
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
 * Reads the environment at call time, not at module scope.
 *
 * Module scope is evaluated during the build, where none of these variables
 * exist — reading there would make a missing credential a build failure instead
 * of the runtime error it actually is.
 */
function readConfig(): EmailJsConfig {
  const env = process.env;

  const required = {
    EMAILJS_SERVICE_ID: env.EMAILJS_SERVICE_ID,
    EMAILJS_PUBLIC_KEY: env.EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY: env.EMAILJS_PRIVATE_KEY,
    EMAILJS_TEMPLATE_ID_NOTIFICATION: env.EMAILJS_TEMPLATE_ID_NOTIFICATION,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);

  if (missing.length > 0) throw new MailConfigError(missing);

  return {
    serviceId: required.EMAILJS_SERVICE_ID!.trim(),
    publicKey: required.EMAILJS_PUBLIC_KEY!.trim(),
    privateKey: required.EMAILJS_PRIVATE_KEY!.trim(),
    notificationTemplateId: required.EMAILJS_TEMPLATE_ID_NOTIFICATION!.trim(),
    confirmationTemplateId:
      env.EMAILJS_TEMPLATE_ID_CONFIRMATION?.trim() || null,
  };
}

/** One send. Resolves on success, throws `MailDeliveryError` otherwise. */
async function sendTemplate(
  config: EmailJsConfig,
  templateId: string,
  templateParams: NotificationParams | ConfirmationParams,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: templateId,
        user_id: config.publicKey,
        // The private key. Required because API access for non-browser callers
        // is what this whole module depends on.
        accessToken: config.privateKey,
        template_params: templateParams,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (cause) {
    const reason =
      cause instanceof Error && cause.name === 'TimeoutError'
        ? `no response within ${REQUEST_TIMEOUT_MS} ms`
        : 'network error';

    throw new MailDeliveryError(`EmailJS unreachable (${reason})`);
  }

  if (!response.ok) {
    /*
     * The body is EmailJS's own diagnostic ("The Public Key is required", "The
     * template ID not found", …). It is read because without it a 400 is
     * unfixable, and truncated because it is about to be logged: the provider
     * echoes template variables in some errors, and those carry the sender's
     * personal data.
     */
    const detail = (await response.text().catch(() => '')).slice(0, 200);

    throw new MailDeliveryError(
      `EmailJS rejected the request${detail ? `: ${detail}` : ''}`,
      response.status,
    );
  }
}

export interface DeliveryResult {
  /** `false` when no confirmation template is configured, or it failed. */
  readonly confirmationSent: boolean;
}

/**
 * Sends the internal notification and, if configured, the customer's
 * confirmation.
 *
 * The two are deliberately not equal. The notification is the lead — if it does
 * not arrive, the request is lost and the caller must be told, so a failure
 * here throws. The confirmation is a courtesy: a visitor whose request reached
 * the company but who did not get their copy has still been helped, and turning
 * that into an error state would tell them to submit again and produce a
 * duplicate lead. It is therefore best effort, and the result says which it was.
 *
 * The visitor's data is never logged, here or in the callers: the mail is meant
 * to be the only copy that exists (see the privacy note on the form).
 */
export async function sendQuoteRequest(
  request: QuoteRequest,
): Promise<DeliveryResult> {
  const config = readConfig();
  const { notification, confirmation } = renderQuoteMail(request);

  await sendTemplate(config, config.notificationTemplateId, notification);

  if (!config.confirmationTemplateId) return { confirmationSent: false };

  await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_GAP_MS));

  try {
    await sendTemplate(config, config.confirmationTemplateId, confirmation);
    return { confirmationSent: true };
  } catch (cause) {
    // Message only, and the provider's message is already truncated. The
    // recipient address is not logged.
    console.error(
      `[anfrage] confirmation mail failed: ${
        cause instanceof Error ? cause.message : 'unknown error'
      }`,
    );
    return { confirmationSent: false };
  }
}
