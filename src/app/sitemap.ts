import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/config/company';

/**
 * sitemap.xml (CLAUDE.md 9).
 *
 * It lists what actually exists. `/leistungen`, `/ueber-uns`, `/referenzen`
 * and `/kontakt` are in the target IA (CLAUDE.md 7) but are not built yet, and
 * a sitemap that advertises 404s is worse than a short one — Search Console
 * reports them as errors and the crawler learns to distrust the file.
 *
 * The eight `/leistungen/[slug]` entries that used to be generated from the
 * catalogue are gone with the routes themselves (CLAUDE.md 7a). Their URLs are
 * redirected in `next.config.ts` rather than listed here: a sitemap is a list
 * of canonical destinations, and a redirecting URL is not one.
 *
 * The five service categories are anchors on the landing page, not URLs. They
 * are deliberately absent — `#gebaeudereinigung` is the same document as `/`,
 * and listing fragments would ask Google to index one page five times.
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
