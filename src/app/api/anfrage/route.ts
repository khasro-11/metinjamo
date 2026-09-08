/**
 * POST /api/anfrage — receives a quote request from the landing-page form.
 *
 * The client already validated against `quoteRequestSchema`, and that check is
 * treated as worth nothing here: this endpoint is public, so the body is parsed
 * against the same schema again before anything is done with it.
 *
 * Nothing is sent anywhere yet. See the DELIVERY block below.
 */

import { quoteRequestSchema } from '@/lib/quote-request';

/**
 * Request-time only. The handler reads a body, so it could never be
 * prerendered anyway; stating it keeps the build output honest rather than
 * leaving it to inference.
 */
export const dynamic = 'force-dynamic';

/** Roughly 8 KB — the schema's own maxima put a valid body far below this. */
const MAX_BODY_BYTES = 8_192;

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    // A quote request must never be cached by a CDN or a shared proxy.
    headers: { 'Cache-Control': 'no-store' },
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

  /* ======================================================================
     TODO — MAIL PROVIDER. Nothing leaves this process until this is wired.
     ======================================================================

     `quoteRequest` is validated and ready to send. What is still missing is a
     decision the client has to make (CLAUDE.md 6 and 12): Resend, plain SMTP
     on the company mailbox, or a form service. Hosting is undecided too, and
     the two answers are related.

     Whatever is chosen, this is what has to happen here:

       1. Send the request to the company mailbox. The subject line should
          carry the postal code and the first service, so the inbox stays
          sortable without opening every mail. Set Reply-To to
          `quoteRequest.email` so a reply reaches the customer rather than the
          sending domain.
       2. Send a confirmation to `quoteRequest.email` restating what was
          submitted. Under Art. 13 DSGVO the sender has to be told what is
          stored, why and for how long — the confirmation mail is the normal
          place for that, and it links the Datenschutzerklärung.
       3. Throw on failure, and return 502 rather than 202. The form's success
          panel tells the customer their request has arrived; claiming that
          falsely is worse than showing the error state.

     Three things still have to be settled here before going live:
       - Spam protection. No third-party captcha without a DSGVO assessment; a
         submit-timing check plus a honeypot field covers most of it and
         tracks nobody. Left out rather than half-built.
       - Rate limiting per IP. Needs the hosting decision first — the store
         depends on the platform.
       - Retention. The mailbox becomes the record of the request, so how long
         it is kept has to match what the Datenschutzerklärung states.

     Deliberately NOT done here: no database write, no analytics event, no
     third-party pixel, and no logging of names, addresses or messages. The
     only copy of this data should be the mail — that is what the form's
     privacy note promises.
     ====================================================================== */

  // Non-identifying, so it stays useful for "does the form work at all"
  // without putting personal data into a platform log.
  console.info(
    `[anfrage] validated request: ${quoteRequest.services.length} service(s), ` +
      `frequency=${quoteRequest.frequency}, type=${quoteRequest.propertyType}`,
  );

  // 202: accepted and valid, but delivery genuinely has not happened yet.
  return json({ ok: true }, 202);
}
