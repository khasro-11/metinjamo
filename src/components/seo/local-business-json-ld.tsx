import { absoluteUrl, company, regularOpeningHours } from '@/config/company';
import { serviceHref, services } from '@/content/services';

import { BUSINESS_ID, serviceNodeId } from './schema';

/**
 * `ProfessionalService` + `Service` structured data (CLAUDE.md 9).
 *
 * ## The rule this file follows
 *
 * Every value is read from `company.ts` or `content/services.ts`. Nothing is
 * typed out a second time, because structured data that contradicts the
 * visible page is a Google policy violation — and because the NAP block here
 * has to be byte-identical to the Google Business Profile and the imprint.
 *
 * ## What is deliberately NOT emitted
 *
 * - `aggregateRating` / `review` — there are no real reviews yet, and inventing
 *   them is both a manual-action risk and a section 5 UWG problem
 *   (CLAUDE.md 8). It goes in when real ratings exist, never before.
 * - `priceRange` — no price model is confirmed (CLAUDE.md 12).
 * - `geo` coordinates — not verified against the actual building.
 * - `openingHoursSpecification` for Saturday and for urgent cases. Those two
 *   entries carry no fixed times ("nach Absprache", "telefonisch"), and
 *   schema.org has no honest way to say that. Emitting them with invented
 *   hours would publish exactly the "24/7" claim CLAUDE.md 2 forbids, in the
 *   one place a customer never sees it. `regularOpeningHours` filters them out
 *   at the source.
 * - `foundingDate` / `numberOfEmployees` — still open with the client.
 *
 * Rendered as a plain script tag rather than through next/script: it is static
 * markup with no execution and belongs in the initial HTML, where crawlers
 * read it without running JavaScript. Same idiom as `FaqJsonLd`.
 *
 * The node ids come from `./schema`, which the `/leistungen/[slug]` pages use
 * as well. A service described here and described again on its own page has to
 * carry the same `@id`, or Google reads one offering as two.
 */

function buildSchema() {
  const business = {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: company.legalName,
    alternateName: company.shortName,
    url: absoluteUrl('/'),
    image: absoluteUrl(company.site.ogImage.path),
    telephone: company.phone.e164,
    email: company.email.address,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: company.address.countryCode,
    },
    areaServed: {
      '@type': 'Place',
      name: company.serviceArea.primary,
    },
    openingHoursSpecification: regularOpeningHours.map((entry) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: entry.days.map((day) => `https://schema.org/${day}`),
      opens: entry.opens,
      closes: entry.closes,
    })),
    // The one hard credential the company can evidence today.
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: company.liabilityInsurance.type,
      name: `${company.liabilityInsurance.type}, ${company.liabilityInsurance.coverage}`,
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'Handelsregister',
      value: `${company.registry.court}, ${company.registry.number}`,
    },
    founder: {
      '@type': 'Person',
      name: company.managingDirector.name,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Leistungen',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@id': serviceNodeId(service.slug) },
      })),
    },
  };

  /*
   * TODO (client, CLAUDE.md 12): the service catalogue itself is unconfirmed.
   * These nodes advertise the same eight services the bento renders, so they
   * are consistent with the page — but page and schema have to be signed off
   * together, not separately.
   */
  const serviceNodes = services.map((service) => ({
    '@type': 'Service',
    '@id': serviceNodeId(service.slug),
    // The detail page is the canonical description of the service; this node
    // is the short version of it, so it points there rather than at itself.
    url: absoluteUrl(serviceHref(service.slug)),
    name: service.name,
    description: service.benefit,
    serviceType: service.name,
    provider: { '@id': BUSINESS_ID },
    areaServed: {
      '@type': 'Place',
      name: company.serviceArea.primary,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [business, ...serviceNodes],
  };
}

export function LocalBusinessJsonLd() {
  return (
    <script
      type="application/ld+json"
      // The payload is our own build-time constant, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema()) }}
    />
  );
}
