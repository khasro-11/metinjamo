import type { Metadata } from 'next';

import { company } from '@/config/company';

/**
 * Site-level title and description.
 *
 * They live here rather than in `layout.tsx` because the web app manifest
 * needs the same two strings, and a description that drifts between the
 * `<meta>` tag and the manifest is the same class of mistake as a phone
 * number that drifts between the footer and the imprint.
 *
 * City and service area are read from `company.ts` (CLAUDE.md 2). Only the
 * copy around them is written here.
 */

/**
 * The homepage title, and the one string Google renders largest in the SERP.
 *
 * Keyword first, brand second, on purpose: nobody searches for "Imperial
 * Gebäudeservice GmbH" — they search for the service plus the city, and a
 * title that opens with an unknown legal name spends its most-weighted
 * position on a term with no search volume. The brand still appears, in the
 * half of the title a reader gets to once the result has caught their eye.
 *
 * 58 characters, so it survives the roughly 60-character SERP truncation
 * intact. Lengthening it means losing the brand off the end.
 */
export const SITE_TITLE = `Gebäudereinigung in ${company.address.city} | ${company.legalName}`;

/**
 * Names the four services with real search volume before naming the
 * audience, and closes on the action the whole site exists for. Kept under
 * 160 characters so Google has no reason to rewrite it.
 *
 * Every service named here is in the catalogue (CLAUDE.md 7a) and
 * "Winterdienst" is the term a Hausverwaltung actually searches for.
 */
export const SITE_DESCRIPTION = `Gebäudereinigung, Hausmeisterservice, Winterdienst, Entrümpelung für Hausverwaltungen, Gewerbe und Eigentümer in ${company.serviceArea.primary}. Angebot anfordern.`;

/**
 * The Open Graph fields that are true of every page: the card format, the
 * language, the publisher and the fallback image.
 *
 * Exported because it has to be spread, not inherited. Next.js replaces a
 * nested metadata object wholesale instead of deep-merging it, so a route that
 * declares `openGraph` to set its own URL silently drops `og:image`,
 * `og:site_name`, `og:type` and `og:locale` — the page keeps its canonical and
 * loses its preview card. Going through `routeMetadata` below is what stops
 * that from happening one route at a time.
 */
export const OPEN_GRAPH_BASE: NonNullable<Metadata['openGraph']> = {
  type: 'website',
  locale: 'de_DE',
  siteName: company.legalName,
  images: [
    {
      url: company.site.ogImage.path,
      width: company.site.ogImage.width,
      height: company.site.ogImage.height,
      alt: company.site.ogImage.alt,
    },
  ],
};

export interface RouteMetadataInput {
  /** Site-relative path, no origin. `metadataBase` supplies the host. */
  readonly path: string;
  /**
   * The social-card headline. Not the `<title>`: the title template that
   * appends the brand to a tab label never reaches Open Graph, so a page that
   * leaves this out ships the homepage's headline on every shared link.
   */
  readonly title: string;
  readonly description: string;
}

/**
 * The per-route half of a page's metadata: canonical URL and social card.
 *
 * Every route calls this. A canonical is only ever right for one URL, and
 * inheriting one from the layout is how `/impressum` and `/datenschutz` came
 * to declare themselves duplicates of the homepage while the sitemap listed
 * them as pages in their own right.
 */
export function routeMetadata({ path, title, description }: RouteMetadataInput): Metadata {
  return {
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title, description },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [company.site.ogImage.path],
    },
  };
}
