import { absoluteUrl, company } from '@/config/company';

/**
 * `BreadcrumbList` structured data (CLAUDE.md 9).
 *
 * What it buys: Google replaces the raw URL line in a result with the crumb
 * trail, so `/impressum` shows as "Imperial Gebäudeservice > Impressum"
 * instead of a bare path. On a site this flat that is the whole benefit, and
 * it is the reason the trail is only ever two levels deep here.
 *
 * The landing page deliberately does NOT render one. A breadcrumb whose only
 * item is the page it sits on describes nothing, and Google ignores
 * single-item trails.
 *
 * `item` is omitted on the last crumb on purpose: schema.org treats the final
 * element as the current page, and pointing it at its own URL is the most
 * common way this markup fails validation.
 *
 * Plain script tag rather than next/script, same as the other JSON-LD on the
 * site: static markup, no execution, and it belongs in the initial HTML where
 * a crawler reads it without running JavaScript.
 */

export interface BreadcrumbTrailItem {
  readonly name: string;
  /** Site-relative path. Omitted for the current page, which carries no link. */
  readonly path?: string;
}

function buildSchema(trail: readonly BreadcrumbTrailItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: company.shortName,
        item: absoluteUrl('/'),
      },
      ...trail.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.name,
        ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
      })),
    ],
  };
}

/** Everything below the landing page. Pass the trail without the home crumb. */
export function BreadcrumbJsonLd({ trail }: { trail: readonly BreadcrumbTrailItem[] }) {
  return (
    <script
      type="application/ld+json"
      // Build-time constants from company.ts and the caller, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(trail)) }}
    />
  );
}
