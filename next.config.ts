import path from 'node:path';

import type { NextConfig } from 'next';

/**
 * Retired `/leistungen/[slug]` detail pages.
 *
 * The catalogue was restructured into five categories that all live on the
 * landing page (CLAUDE.md 7a), so the eight per-service routes are gone. They
 * were prerendered and listed in the sitemap, which means crawlers and any
 * link already pointing at them have to land somewhere real instead of on a
 * 404 — dropping indexed URLs without a redirect throws away whatever ranking
 * they had built and reports as an error in Search Console.
 *
 * Each old slug maps to the category that actually absorbed its content, not
 * to a generic index: a visitor who clicked "Winterdienst" gets the tile that
 * lists Winterdienst, scrolled into view by the anchor. `permanent: true` is a
 * 308, which is the correct signal here because the move is not provisional.
 *
 * The trailing catch-all is the safety net for anything else under the old
 * prefix (a typo, an old campaign URL, a stale slug we have forgotten). It is
 * listed last, so the eight specific rules win.
 */
const RETIRED_SERVICE_ROUTES: Record<string, string> = {
  unterhaltsreinigung: 'gebaeudereinigung',
  treppenhausreinigung: 'gebaeudereinigung',
  glasreinigung: 'gebaeudereinigung',
  bauendreinigung: 'gebaeudereinigung',
  gruenpflege: 'aussenbereich',
  winterdienst: 'aussenbereich',
  entruempelung: 'entruempelung-logistik',
  hausmeisterservice: 'hausmeisterservice',
};

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles above the repo.
  turbopack: { root: path.resolve(__dirname) },

  async redirects() {
    return [
      ...Object.entries(RETIRED_SERVICE_ROUTES).map(([slug, anchor]) => ({
        source: `/leistungen/${slug}`,
        destination: `/#${anchor}`,
        permanent: true,
      })),
      {
        source: '/leistungen/:slug*',
        destination: '/#leistungen',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
