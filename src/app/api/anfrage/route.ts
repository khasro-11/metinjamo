/**
 * POST /api/anfrage — receives a quote request from the landing-page form and
 * delivers it to the company mailbox.
 *
 * The client already validated against `quoteRequestSchema`, and that check is
 * treated as worth nothing here: this endpoint is public, so the body is parsed
 * against the same schema again before anything is done with it.
 *
 * Delivery runs through EmailJS, called server-side — see `src/lib/emailjs.ts`
 * for why it is the REST API and not the browser SDK, and `docs/emailjs.md` for
 * the dashboard setup the credentials refer to.
 *
 * What this handler does NOT do, on purpose: no database write, no analytics
 * event, no third-party pixel, and no logging of names, addresses, phone
 * numbers or messages. The delivered mail is meant to be the only copy of the
 * request that exists — that is what the privacy note on the form promises, and
 * every log line below is written to keep it true.
 */

import {
  antiSpamSchema,
  checkRateLimit,
  looksAutomated,
} from '@/lib/anti-spam';
import {
  MailConfigError,
  MailDeliveryError,
  sendQuoteRequest,
} from '@/lib/emailjs';
import { quoteRequestSchema } from '@/lib/quote-request';

/**
 * Request-time only. The handler reads a body, so it could never be
 * prerendered anyway; stating it keeps the build output honest rather than
 * leaving it to inference.
 */
export const dynamic = 'force-dynamic';

/** Roughly 8 KB — the schema's own maxima put a valid body far below this. */
const MAX_BODY_BYTES = 8_192;

function json(
  body: unknown,
  status: number,
  headers: HeadersInit = {},
): Response {
  return Response.json(body, {
    status,
    // A quote request must never be cached by a CDN or a shared proxy.
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ ok: false, error: 'unsupported_media_type' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'payload_too_large' }, 413);
  }

  /*
   * Before the body is read, and before a single request is spent at the
   * provider. Delivery is metered, so the rate limit protects the form's
   * availability and not just the inbox.
   */
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.allowed) {
    return json({ ok: false, error: 'rate_limited' }, 429, {
      'Retry-After': String(rateLimit.retryAfterSeconds),
    });
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'payload_too_large' }, 413);
    }
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'malformed_json' }, 400);
  }

  /* --- bot checks ------------------------------------------------------- */

  const envelope = antiSpamSchema.safeParse(payload);

  if (!envelope.success || looksAutomated(envelope.data)) {
    /*
     * Answered with a success, not with an error.
     *
     * A bot that is told it was caught retries against the check it just
     * learned about; one that is told "thank you" moves on. The cost of the lie
     * is that a false positive loses a real request silently, which is why the
     * two thresholds are set where a person cannot trip them (empty hidden
     * field, three seconds on a five-step form) — and why this line exists, so
     * a suspected false positive is at least diagnosable from the platform log.
     */
    console.warn(
      `[anfrage] dropped as automated (reason=${
        envelope.success ? 'trap' : 'envelope'
      })`,
    );
    return json({ ok: true }, 200);
  }

  /* --- validation ------------------------------------------------------- */

  const parsed = quoteRequestSchema.safeParse(payload);

  if (!parsed.success) {
    // Field paths and messages only. The submitted *values* are never echoed
    // back and never logged — they are personal data, and an error response is
    // the easiest place to leak them into a proxy log by accident.
    return json(
      {
        ok: false,
        error: 'validation_failed',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      422,
    );
  }

  const quoteRequest = parsed.data;

  /* --- delivery --------------------------------------------------------- */

  try {
    const { confirmationSent } = await sendQuoteRequest(quoteRequest);

    // Non-identifying, so it stays useful for "does the form work at all"
    // without putting personal data into a platform log.
    console.info(
      `[anfrage] delivered: ${quoteRequest.serviceCategories.length} ` +
        `category/-ies, ${quoteRequest.services.length} service(s), ` +
        `frequency=${quoteRequest.frequency}, type=${quoteRequest.propertyType}, ` +
        `confirmation=${confirmationSent ? 'sent' : 'skipped'}`,
    );

    return json({ ok: true }, 200);
  } catch (cause) {
    if (cause instanceof MailConfigError) {
      /*
       * A deployment fault, not a visitor fault: the credentials are missing or
       * incomplete. Loud on purpose — silently dropping leads is the one failure
       * mode this endpoint must never have.
       */
      console.error(`[anfrage] NOT DELIVERED — ${cause.message}`);
      return json({ ok: false, error: 'mail_not_configured' }, 503);
    }

    if (cause instanceof MailDeliveryError) {
      console.error(
        `[anfrage] NOT DELIVERED — ${cause.message}` +
          (cause.status === null ? '' : ` (status ${cause.status})`),
      );
      return json({ ok: false, error: 'mail_failed' }, 502);
    }

    // Unexpected. The message may be anything, so only its type is logged.
    console.error(
      `[anfrage] NOT DELIVERED — unexpected ${
        cause instanceof Error ? cause.name : typeof cause
      }`,
    );
    return json({ ok: false, error: 'mail_failed' }, 502);
  }
}
