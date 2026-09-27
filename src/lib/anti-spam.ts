/**
 * Bot protection for the quote form — honeypot, submit-timing and rate limit.
 *
 * SERVER-SIDE MODULE. Nothing here may be imported into a client component:
 * the thresholds are the whole defence, and shipping them to the browser hands
 * a bot the exact numbers to stay under.
 *
 * Why this exists at all, and why it is not a captcha (CLAUDE.md 6): a
 * third-party captcha would put a script from a foreign server onto the page
 * and therefore need a consent banner and its own DSGVO assessment. These
 * three checks track nobody, load nothing and cost the visitor nothing.
 *
 * Why it matters more now than before: delivery runs through EmailJS, whose
 * plans are metered. An unprotected form does not just produce junk mail — a
 * single bot burns the monthly quota, and every real request after that is
 * rejected by the provider. Spam protection here is availability protection.
 */

import { z } from 'zod';

import { HONEYPOT_FIELD } from '@/lib/quote-request';

/**
 * Anything faster than this was not typed by a person.
 *
 * Three seconds is the figure from the brief. For a five-step form it is very
 * generous — nobody picks a category, a frequency, an object type, a postal
 * code, a name, a mail address and a phone number in three seconds — so the
 * false-positive risk is effectively nil while it still catches the class of
 * bot that posts the moment it has seen the markup.
 */
export const MIN_SUBMIT_MS = 3_000;

/**
 * The two fields the form adds to the request on top of the quote itself.
 *
 * Both are required rather than optional. The only client this endpoint has is
 * our own form, which always sends them; treating them as optional would mean
 * a hand-crafted POST that simply omits them skips both checks.
 */
export const antiSpamSchema = z.object({
  /** Must arrive empty. A value means something filled a field no human sees. */
  [HONEYPOT_FIELD]: z.string().max(200),
  /** Milliseconds between the form mounting and the submit. */
  elapsedMs: z.number().int().nonnegative().finite(),
});

export type AntiSpamEnvelope = z.infer<typeof antiSpamSchema>;

/** `true` when the submission looks automated and should be dropped. */
export function looksAutomated(envelope: AntiSpamEnvelope): boolean {
  return (
    envelope[HONEYPOT_FIELD].trim().length > 0 ||
    envelope.elapsedMs < MIN_SUBMIT_MS
  );
}

/* -------------------------------------------------------------------------
   Rate limit
   ------------------------------------------------------------------------- */

/**
 * Five requests per ten minutes per client.
 *
 * Sized for the real use case rather than for a theoretical attacker: a
 * Hausverwaltung asking for two objects in one sitting, plus a retry after a
 * failed send, plus room for a shared office NAT. Above that it is not someone
 * requesting a quote.
 */
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60_000;

/**
 * Hard ceiling on tracked clients, so a distributed flood cannot grow this map
 * until the process runs out of memory. On overflow the whole map is dropped:
 * losing the counters for ten minutes is a far smaller problem than an OOM,
 * and the alternative (evicting one entry at a time) is exactly what an
 * attacker would exploit to keep their own entry alive.
 */
const MAX_TRACKED_CLIENTS = 5_000;

interface Bucket {
  count: number;
  /** Epoch ms at which this bucket is forgotten. */
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Per-process salt for the client hash.
 *
 * Random and never persisted, which means the stored value cannot be reversed
 * into an IP address even with the full map in hand, and the mapping changes
 * every time the process restarts. The counters are abuse prevention under
 * Art. 6 Abs. 1 lit. f DSGVO; keeping them pseudonymous is the data
 * minimisation that goes with that (Art. 5 Abs. 1 lit. c).
 */
const SALT = crypto.randomUUID();

/**
 * Identifies the caller from the proxy headers.
 *
 * Header order matters: `cf-connecting-ip` is set by Cloudflare itself and
 * cannot be spoofed from outside, so it is trusted first;
 * `x-forwarded-for` is a client-supplied list and only its first entry is of
 * any interest. Everything falls back to a single shared bucket rather than to
 * "unlimited" — locally that means the dev server shares one counter, which is
 * the conservative direction to fail in.
 */
function clientKey(request: Request): string {
  const headers = request.headers;

  const direct =
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0];

  return direct?.trim() || 'unknown';
}

/** Web Crypto rather than `node:crypto`, so this works on any runtime. */
async function fingerprint(request: Request): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${clientKey(request)}`);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export type RateLimitVerdict =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfterSeconds: number };

/**
 * Counts this request against the caller's window.
 *
 * In-process and therefore per-instance: two Worker isolates keep two separate
 * counters, and a redeploy resets both. That is a real limitation and it is
 * accepted on purpose for now — a limit that works within one isolate still
 * stops the single-script flood this is aimed at, and it needs no dependency
 * and no third party.
 *
 * Hosting is now decided (Cloudflare Workers), so the store that would fix
 * this is available and the limitation is no longer waiting on anything.
 *
 * TODO (project): move the counter into a Durable Object, Cloudflare KV or the
 * platform's own rate limiter, so the window holds across isolates. Note that
 * Cloudflare spreads requests over isolates per region, which makes the real
 * ceiling a multiple of MAX_PER_WINDOW rather than MAX_PER_WINDOW itself.
 */
export async function checkRateLimit(
  request: Request,
): Promise<RateLimitVerdict> {
  const now = Date.now();
  const key = await fingerprint(request);

  // Cheap sweep on the way in, so expired buckets are not kept alive by a
  // caller who never comes back.
  for (const [candidate, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(candidate);
  }

  if (buckets.size > MAX_TRACKED_CLIENTS) buckets.clear();

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  bucket.count += 1;

  if (bucket.count > MAX_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true };
}
