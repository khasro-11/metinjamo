/**
 * Turns a validated quote request into the values the two mail templates
 * interpolate, and into the plain-text alternative that travels beside each
 * HTML body.
 *
 * SERVER-SIDE MODULE.
 *
 * Why every company detail and every German sentence is written here rather
 * than in a mail provider's template editor: a template over there cannot
 * import anything, so any company detail typed into it becomes a second copy of
 * `company.ts` that nobody diffs — exactly what the single source of truth rule
 * exists to prevent (CLAUDE.md 2). Since the move to Brevo the templates are
 * ordinary files in this repo (`src/lib/mail-templates/`), reviewed in a diff
 * like the rest of the code, which is what makes that rule cheap to keep.
 *
 * Why a plain-text part exists at all: a transactional mail sent as HTML only
 * is a spam signal, and this one has to arrive — a filtered notification is a
 * lost lead. It is also the version that actually gets read when the inbox is a
 * phone held in one hand on a site visit.
 *
 * Absent optional fields render as an em dash rather than as an empty string,
 * so a row in the mail reads "Firma — " instead of looking like a template that
 * failed to fill in.
 */

import { company, absoluteUrl } from '@/config/company';
import {
  getServiceCategory,
  getServiceItem,
  hasSubServices,
} from '@/content/services';
import {
  frequencyLabel,
  hasValue,
  propertyTypeLabel,
  type QuoteRequest,
} from '@/lib/quote-request';

/** Placeholder for an optional field the sender left blank. */
const ABSENT = '—';

function orAbsent(value: string | undefined): string {
  return hasValue(value) ? value.trim() : ABSENT;
}

/**
 * German timestamp in the company's own timezone.
 *
 * Pinned to Europe/Berlin rather than to the server's locale: the process runs
 * in whatever region the platform puts it, and a lead timestamped in UTC is
 * misread by an hour or two every single time someone looks at the inbox.
 */
function formatSubmittedAt(at: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(at);
}

/** "Mo – Fr 07:00 – 18:00 Uhr, Sa nach Absprache" — from company.ts. */
function formatOfficeHours(): string {
  return company.openingHours
    .filter((entry) => entry.kind !== 'emergency')
    .map((entry) => `${entry.daysLabel} ${entry.timeLabel}`)
    .join(', ');
}

/**
 * Firma, Sitz, Registergericht und Handelsregisternummer in einer Zeile.
 *
 * Not decoration. An email a GmbH sends in the course of business is a
 * Geschäftsbrief, and § 35a GmbHG requires it to carry the firm, its seat, the
 * register court, the register number and every managing director. The
 * confirmation mail is therefore not free to omit them, and they travel as
 * template parameters rather than as prose inside the template so that
 * `company.ts` stays the only place they are written down.
 */
function formatRegistry(): string {
  const { seat, court, number } = company.registry;

  return `Sitz ${seat} · ${court}, ${number}`;
}

/**
 * The selected services, nested under their categories.
 *
 * Nesting rather than a flat list is the point: a category can be chosen
 * without any individual service (the form allows it on purpose), and twenty-one
 * possible slugs printed in a row loses which of the six areas each one was
 * picked under. The categories come out in catalogue order, not in the order
 * the visitor happened to tick them, so two requests are comparable at a
 * glance.
 */
function formatServices(request: QuoteRequest): string {
  return request.serviceCategories
    .map((slug) => getServiceCategory(slug))
    .filter((category): category is NonNullable<typeof category> =>
      category !== undefined,
    )
    .map((category) => {
      const picked = request.services
        .map((itemSlug) => getServiceItem(itemSlug))
        .filter((item): item is NonNullable<typeof item> => item !== undefined)
        // Read from the category rather than from the submitted order, so the
        // nesting follows the catalogue the client approved.
        .filter((item) => category.items.some((own) => own.slug === item.slug));

      // A single-service category is complete as it is; a "none selected"
      // line under it would read as a missing answer.
      if (!hasSubServices(category)) return category.category;

      const lines =
        picked.length > 0
          ? picked.map((item) => `    · ${item.name}`)
          : ['    (keine einzelnen Leistungen ausgewählt)'];

      return [category.category, ...lines].join('\n');
    })
    .join('\n\n');
}

/**
 * Subject line of the internal notification.
 *
 * Postal code first after the label, then the leading category: those are the
 * two things that decide whether a request is even in the service area and who
 * picks it up, which makes the inbox sortable without opening anything. A
 * second category is counted rather than listed — the subject has to stay
 * readable in a mail-client column.
 */
function formatSubject(request: QuoteRequest): string {
  const [first, ...rest] = request.serviceCategories;
  const lead = getServiceCategory(first)?.category ?? first;
  const more =
    rest.length > 0
      ? ` +${rest.length} weitere${rest.length === 1 ? 'r' : ''} Bereich${
          rest.length === 1 ? '' : 'e'
        }`
      : '';

  return `Angebotsanfrage · ${request.postalCode} · ${lead}${more}`;
}

/* -------------------------------------------------------------------------
   Template parameter sets

   Flat records of short strings. Keys are snake_case because that is what
   reads naturally as `{{customer_name}}` inside a template, and they are the
   contract with the files in `src/lib/mail-templates/`: renaming one here
   without renaming it there makes the next send throw (`renderMailTemplate`),
   which is the point. The provider-dashboard setup this replaced answered a
   rename the other way — with a blank row in a mail nobody was diffing.
   Declared with `type` and not `interface`, which is not cosmetic: only an
   object type literal gets an implicit index signature, and that is what lets
   these be handed to `renderMailTemplate` as a `Record<string, string>` without
   a cast. Rewriting either one as an `interface` breaks the build.
   ------------------------------------------------------------------------- */

export type NotificationParams = {
  readonly subject: string;
  /** Becomes the mail's Reply-To, so hitting reply reaches the customer. */
  readonly reply_to: string;
  readonly submitted_at: string;
  readonly services_block: string;
  readonly frequency: string;
  readonly property_type: string;
  readonly postal_code: string;
  readonly location: string;
  readonly size: string;
  readonly customer_name: string;
  readonly customer_company: string;
  readonly customer_email: string;
  readonly customer_phone: string;
  readonly customer_message: string;
};

export type ConfirmationParams = {
  /** The recipient. The only dynamic address in the setup. */
  readonly to_email: string;
  readonly subject: string;
  readonly customer_name: string;
  readonly submitted_at: string;
  readonly services_block: string;
  readonly frequency: string;
  readonly property_type: string;
  readonly postal_code: string;
  readonly company_name: string;
  readonly company_address: string;
  readonly company_phone: string;
  readonly company_email: string;
  /** "Sitz Duisburg · Amtsgericht Duisburg, HRB 39367" (§ 35a GmbHG). */
  readonly company_registry: string;
  /** Every managing director has to be named (§ 35a GmbHG). */
  readonly company_director: string;
  readonly office_hours: string;
  readonly privacy_url: string;
};

/* -------------------------------------------------------------------------
   Plain-text alternatives

   Not a stripped-down copy of the HTML. A text part is read in a monospaced
   column with no styling to carry hierarchy, so the order and the labels do
   that work instead: in the notification the two things somebody acts on —
   phone and email — come before the object data, exactly as in the HTML.

   These are the one place where a German sentence exists twice, once here and
   once in the markup. That is the price of a text part and it is worth paying;
   what keeps it honest is that every *value* still comes from the parameter
   object, so no fact can drift between the two versions, only phrasing.
   ------------------------------------------------------------------------- */

/** Right-pads a label so the values line up in a monospaced client. */
function row(label: string, value: string): string {
  return `${label.padEnd(11)}${value}`;
}

function renderNotificationText(params: NotificationParams): string {
  return [
    'NEUE ANGEBOTSANFRAGE',
    `Eingegangen am ${params.submitted_at}`,
    '',
    '--- Kontakt ---',
    row('Name', params.customer_name),
    row('Telefon', params.customer_phone),
    row('E-Mail', params.customer_email),
    row('Firma', params.customer_company),
    '',
    '--- Objekt ---',
    row('Objektart', params.property_type),
    row('Frequenz', params.frequency),
    row('Ort', `${params.postal_code} ${params.location}`),
    row('Größe', params.size),
    '',
    '--- Leistungen ---',
    params.services_block,
    '',
    '--- Nachricht ---',
    params.customer_message,
    '',
    `Antwort an ${params.reply_to}`,
  ].join('\n');
}

function renderConfirmationText(params: ConfirmationParams): string {
  return [
    `Guten Tag ${params.customer_name},`,
    '',
    'vielen Dank für Ihre Anfrage. Sie ist bei uns eingegangen, und wir melden',
    'uns zeitnah mit einem Angebot bei Ihnen.',
    '',
    `Eingegangen am ${params.submitted_at}`,
    '',
    '--- Ihre Angaben ---',
    row('Objektart', params.property_type),
    row('Frequenz', params.frequency),
    row('PLZ', params.postal_code),
    '',
    'Angefragte Leistungen:',
    params.services_block,
    '',
    '--- Wenn es schneller gehen soll ---',
    row('Telefon', params.company_phone),
    row('E-Mail', params.company_email),
    row('Zeiten', params.office_hours),
    '',
    `Wie wir mit Ihren Daten umgehen: ${params.privacy_url}`,
    '',
    // § 35a GmbHG: an outgoing business letter names firm, seat, register
    // court, register number and every managing director. This mail is one.
    '---',
    params.company_name,
    params.company_address,
    params.company_registry,
    `Geschäftsführer: ${params.company_director}`,
  ].join('\n');
}

/* ------------------------------------------------------------------------- */

/** One mail: the values its template interpolates, plus its text part. */
export interface RenderedMail<TParams> {
  readonly params: TParams;
  /** Plain-text alternative, sent alongside the rendered HTML body. */
  readonly text: string;
}

/**
 * Both mails from one request, sharing one timestamp.
 *
 * The confirmation is built even when it will not be sent
 * (`BREVO_SEND_CONFIRMATION` is unset by default — the client decided against
 * an auto-reply). Building it unconditionally costs nothing measurable and
 * means the switch cannot be flipped onto code that was never exercised.
 */
export function renderQuoteMail(
  request: QuoteRequest,
  at: Date = new Date(),
): {
  readonly notification: RenderedMail<NotificationParams>;
  readonly confirmation: RenderedMail<ConfirmationParams>;
} {
  const submittedAt = formatSubmittedAt(at);
  const servicesBlock = formatServices(request);
  const frequency = frequencyLabel(request.frequency);
  const propertyType = propertyTypeLabel(request.propertyType);

  const notification: NotificationParams = {
    subject: formatSubject(request),
    reply_to: request.email,
    submitted_at: submittedAt,
    services_block: servicesBlock,
    frequency,
    property_type: propertyType,
    postal_code: request.postalCode,
    location: orAbsent(request.location),
    size: orAbsent(request.size),
    customer_name: request.name,
    customer_company: orAbsent(request.companyName),
    customer_email: request.email,
    customer_phone: request.phone,
    customer_message: orAbsent(request.message),
  };

  const confirmation: ConfirmationParams = {
    to_email: request.email,
    subject: `Ihre Anfrage bei ${company.shortName}`,
    customer_name: request.name,
    submitted_at: submittedAt,
    services_block: servicesBlock,
    frequency,
    property_type: propertyType,
    postal_code: request.postalCode,
    company_name: company.legalName,
    company_address: company.address.oneLine,
    company_phone: company.phone.display,
    company_email: company.email.address,
    company_registry: formatRegistry(),
    company_director: company.managingDirector.name,
    office_hours: formatOfficeHours(),
    privacy_url: absoluteUrl('/datenschutz'),
  };

  return {
    notification: {
      params: notification,
      text: renderNotificationText(notification),
    },
    confirmation: {
      params: confirmation,
      text: renderConfirmationText(confirmation),
    },
  };
}
