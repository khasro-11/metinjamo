import { absoluteUrl, company } from '@/config/company';
import type { ServiceItem } from '@/content/services';
import { serviceHref } from '@/content/services';

import { BUSINESS_ID, serviceNodeId } from './schema';

/**
 * `Service` + `BreadcrumbList` structured data for one `/leistungen/[slug]`
 * page (CLAUDE.md 9).
 *
 * ## Why `name` and `description` are the catalogue's, not the page's
 *
 * This node carries the same `@id` as the service's entry in the landing
 * page's offer catalogue, because it is the same offering. Two nodes sharing
 * an id must not disagree about what they describe, so both read `name` and
 * `benefit` straight from `content/services.ts`. The detail page's own long
 * copy — headline, lead, scope — is the human version of the same thing and
 * stays out of the graph rather than becoming a second, slightly different
 * description of one service.
 *
 * ## The breadcrumb
 *
 * Start › Leistungen › this service. The middle crumb deliberately points at
 * the landing page's Leistungen section rather than at `/leistungen`: that
 * index route is in the target IA (CLAUDE.md 7) but is not built, and a
 * breadcrumb that resolves to a 404 is worse than one level less of depth.
 *
 * TODO: repoint the middle crumb at `/leistungen` in the same commit that
 * ships the overview page.
 */

const SERVICES_INDEX_HREF = '/#leistungen';

function buildSchema(service: ServiceItem) {
  const pageUrl = absoluteUrl(serviceHref(service.slug));

  const serviceNode = {
    '@type': 'Service',
    '@id': serviceNodeId(service.slug),
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    name: service.name,
    description: service.benefit,
    serviceType: service.name,
    provider: { '@id': BUSINESS_ID },
    areaServed: {
      '@type': 'Place',
      name: company.serviceArea.primary,
    },
  };

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Leistungen',
        item: absoluteUrl(SERVICES_INDEX_HREF),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: pageUrl,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [serviceNode, breadcrumb],
  };
}

export function ServiceJsonLd({ service }: { service: ServiceItem }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own build-time constant, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(service)) }}
    />
  );
}

export { SERVICES_INDEX_HREF };
