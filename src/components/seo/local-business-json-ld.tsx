import { absoluteUrl, company, regularOpeningHours } from '@/config/company';
import { SITE_DESCRIPTION } from '@/config/seo';
import { categoryAnchorHref, serviceCategories } from '@/content/services';

import { BUSINESS_ID, WEBSITE_ID, serviceNodeId } from './schema';

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
 * - `sameAs` — no Google Business Profile, no social account has been handed
 *   over yet. It is the single highest-value property still missing from this
 *   graph and goes in the moment the profile URL exists (CLAUDE.md 12).
 * - `potentialAction` / `SearchAction` on the site node — there is no site
 *   search to point it at.
 *
 * Rendered as a plain script tag rather than through next/script: it is static
 * markup with no execution and belongs in the initial HTML, where crawlers
 * read it without running JavaScript. Same idiom as `FaqJsonLd`.
 *
 * ## Shape of the offer catalogue
 *
 * Six `Service` nodes, one per category, each listing its individual services
 * as an `OfferCatalog` of its own (CLAUDE.md 7a). The alternative — twenty-one
 * flat `Service` nodes — would describe the business as twenty-one unrelated
 * offerings and would not match the page, where the individual services only
 * ever appear inside their category. `hasOfferCatalog` nests, so the two-level
 * catalogue survives into the graph instead of being flattened out of it.
 *
 * Node ids come from `./schema` and resolve to the landing-page anchor that
 * renders the same category, because that anchor is now the canonical location
 * of the offering.
 */

function buildSchema() {
  const business = {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: company.legalName,
    alternateName: company.shortName,
    url: absoluteUrl('/'),
    image: absoluteUrl(company.site.ogImage.path),
    /*
     * The square mark, not the wordmark: Google wants a logo it can crop into
     * a knowledge panel and a result row, and `logo-imperial.svg` is a wide
     * lockup that survives neither. This is the same artwork as the favicon,
     * which is also what a search result shows beside the domain, so the two
     * places a reader meets the brand in a SERP finally agree.
     */
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/favicon-512.png'),
      width: 512,
      height: 512,
    },
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
      itemListElement: serviceCategories.map((category) => ({
        '@type': 'Offer',
        itemOffered: { '@id': serviceNodeId(category.slug) },
      })),
    },
  };

  const serviceNodes = serviceCategories.map((category) => ({
    '@type': 'Service',
    '@id': serviceNodeId(category.slug),
    url: absoluteUrl(categoryAnchorHref(category.anchor, { absolute: true })),
    name: category.category,
    description: category.blurb,
    serviceType: category.category,
    provider: { '@id': BUSINESS_ID },
    areaServed: {
      '@type': 'Place',
      name: company.serviceArea.primary,
    },
    // The individual services, nested under the category rather than hoisted
    // to the top level. `name` is read straight from the catalogue, so
    // "Winterdienst (Räum- und Streupflicht)" reaches the graph with its
    // qualifier intact — the same string the bento chip shows.
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: category.category,
      itemListElement: category.items.map((item) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item.name,
          provider: { '@id': BUSINESS_ID },
        },
      })),
    },
  }));

  /*
   * Names the domain and hands it to the company as its publisher. Without it
   * the graph describes a business and, separately, a pile of services, with
   * nothing stating that this website is the business's own.
   */
  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: company.legalName,
    description: SITE_DESCRIPTION,
    inLanguage: 'de-DE',
    publisher: { '@id': BUSINESS_ID },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [website, business, ...serviceNodes],
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
