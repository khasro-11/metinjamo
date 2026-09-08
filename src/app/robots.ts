import type { MetadataRoute } from 'next';

import { absoluteUrl, company } from '@/config/company';

/**
 * robots.txt (CLAUDE.md 9).
 *
 * Everything a visitor can reach is indexable — this is a local-SEO site, and
 * the whole point is to be found. Two exceptions:
 *
 * - `/styleguide` is an internal design reference, not a page for customers.
 *   It already carries `robots: { index: false }` in its own metadata; the
 *   disallow here keeps it out of the crawl budget as well.
 * - `/api/` takes a POST with personal data and answers nothing useful to a
 *   crawler.
 *
 * No `crawlDelay`, no per-agent blocks: there is nothing here worth the
 * maintenance, and a wrong agent rule is how a site accidentally
 * de-indexes itself.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/styleguide'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: company.site.url,
  };
}
