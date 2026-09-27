/**
 * Turns a validated quote request into the variables the two EmailJS templates
 * interpolate.
 *
 * SERVER-SIDE MODULE.
 *
 * Why the prose lives here and not in the EmailJS dashboard: the templates over
 * there cannot import anything, so any company detail written into them would
 * be a second copy of `company.ts` that nobody diffs — exactly what the single
 * source of truth rule exists to prevent (CLAUDE.md 2). The dashboard therefore
 * holds layout and placeholders only; every value, every label and every German
 * sentence that depends on data comes from here.
 *
 * Absent optional fields render as an em dash rather than as an empty string,
 * so a row in the mail reads "Firma — " instead of looking like a template that
 * failed to fill in.
 */

import { company, absoluteUrl } from '@/config/company';
import { getServiceCategory, getServiceItem } from '@/content/services';
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
 * template parameters rather than as prose typed into the EmailJS dashboard so
 * that `company.ts` stays the only place they are written down.
 */
function formatRegistry(): string {
  const { seat, court, number } = company.registry;

  return `Sitz ${seat} · ${court}, ${number}`;
}

/**
 * The selected services, nested under their categories.
 *
 * Nesting rather than a flat list is the point: a category can be chosen
 * without any individual service (the form allows it on purpose), and eighteen
 * possible slugs printed in a row loses which of the five areas each one was
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

   Flat records of short strings, which is all the EmailJS API accepts. Keys
   are snake_case because that is what reads naturally as `{{customer_name}}`
   inside a template, and they are part of the contract with the dashboard:
   renaming one here silently empties a row in the delivered mail.
   ------------------------------------------------------------------------- */

export interface NotificationParams {
  readonly subject: string;
  /** Goes into the template's Reply-To, so a reply reaches the customer. */
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
}

export interface ConfirmationParams {
  /** The template's To field. The only dynamic recipient in the setup. */
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
}

/** Both parameter sets from one request, sharing one timestamp. */
export function renderQuoteMail(
  request: QuoteRequest,
  at: Date = new Date(),
): {
  readonly notification: NotificationParams;
  readonly confirmation: ConfirmationParams;
} {
  const submittedAt = formatSubmittedAt(at);
  const servicesBlock = formatServices(request);
  const frequency = frequencyLabel(request.frequency);
  const propertyType = propertyTypeLabel(request.propertyType);

  return {
    notification: {
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
    },

    confirmation: {
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
    },
  };
}
