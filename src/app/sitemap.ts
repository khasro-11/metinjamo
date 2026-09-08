import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/config/company';
import { serviceHref, services } from '@/content/services';

/**
 * sitemap.xml (CLAUDE.md 9).
 *
 * It lists what actually exists. `/leistungen`, `/ueber-uns`, `/referenzen`
 * and `/kontakt` are in the target IA (CLAUDE.md 7) but are not built yet, and
 * a sitemap that advertises 404s is worse than a short one — Search Console
 * reports them as errors and the crawler learns to distrust the file.
 *
 * The eight `/leistungen/[slug]` pages are derived from the catalogue rather
 * than typed out, so a service added to `content/services.ts` is in the
 * sitemap in the same commit that gives it a page.
 *
 * TODO: add each remaining route here as it ships.
 */

interface SitemapEntry {
  readonly path: string;
  readonly changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  readonly priority: number;
}

const ROUTES: readonly SitemapEntry[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  // The service pages are the site's ranking surface after the landing page:
  // each one answers a different search, so they sit above the legal pages and
  // just below the front door.
  ...services.map(
    (service): SitemapEntry => ({
      path: serviceHref(service.slug),
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  ),
  // Legal pages are indexable — they are part of the trust surface a
  // Hausverwaltung checks — but they are not what the site ranks on.
  { path: '/impressum', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/datenschutz', changeFrequency: 'yearly', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // One timestamp per build, not per entry: the pages are static and ship
  // together, so claiming different modification dates would be fiction.
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
