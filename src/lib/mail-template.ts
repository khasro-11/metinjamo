/**
 * Fills the `{{snake_case}}` placeholders in the mail templates under
 * `src/lib/mail-templates/`.
 *
 * SERVER-SIDE MODULE.
 *
 * This is deliberately not a template engine. It does two things — substitute
 * and escape — because that is all the two templates need, and because a
 * dependency that renders attacker-influenced text into an outgoing document is
 * exactly the kind of thing worth not having (Claude.md 10.7).
 *
 * Escaping is not optional here and not a nicety. `customer_name`,
 * `customer_message` and `customer_company` are free text a stranger typed into
 * a public form. Interpolated raw, `<a href="https://…">Rechnung</a>` in the
 * message field would arrive in the company's inbox as a working link, and a
 * `"` inside a value that lands in `href="tel:{{customer_phone}}"` would break
 * out of the attribute. This module is the boundary where that stops being
 * possible, so it escapes every value, in every position, with no opt-out — a
 * "raw" escape hatch would only ever be used by mistake.
 *
 * A placeholder with no matching parameter throws instead of rendering empty.
 * The previous provider-dashboard setup failed the other way: a renamed
 * parameter left a silent blank row in a mail nobody was diffing, and the first
 * sign of it was a lead arriving without a phone number. Failing the send is
 * worse for one request and better for every following one, and the route
 * already treats a delivery failure as loud (see `app/api/anfrage/route.ts`).
 */

/** Matches `{{ key }}` with optional inner whitespace. */
const PLACEHOLDER = /\{\{\s*([a-z0-9_]+)\s*\}\}/gi;

/**
 * The five characters that can change the meaning of markup.
 *
 * `'` is included because an attribute quoted with single quotes is legal HTML
 * and appears in these templates' inline styles; leaving it out would make the
 * escaping depend on which quote style the template happens to use.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** A placeholder in the template has no corresponding parameter. */
export class MailTemplateError extends Error {
  constructor(missing: readonly string[]) {
    super(`Unresolved mail template placeholder(s): ${missing.join(', ')}`);
    this.name = 'MailTemplateError';
  }
}

/**
 * Renders one template.
 *
 * Parameters the template does not use are ignored on purpose: `subject`,
 * `reply_to` and `to_email` are part of the Brevo envelope rather than of the
 * body, and they travel in the same parameter object so that the whole mail is
 * described in one place.
 */
export function renderMailTemplate(
  html: string,
  params: Readonly<Record<string, string>>,
): string {
  const missing: string[] = [];

  const rendered = html.replace(PLACEHOLDER, (_match, rawKey: string) => {
    const key = rawKey.toLowerCase();
    const value = params[key];

    if (value === undefined) {
      missing.push(key);
      return '';
    }

    return escapeHtml(value);
  });

  if (missing.length > 0) {
    // De-duplicated: a template that uses `{{customer_phone}}` three times
    // would otherwise name it three times in the log line.
    throw new MailTemplateError([...new Set(missing)]);
  }

  return rendered;
}
