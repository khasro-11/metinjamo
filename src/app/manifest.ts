import type { MetadataRoute } from 'next';

import { company } from '@/config/company';
import { SITE_DESCRIPTION } from '@/config/seo';

/**
 * Web app manifest.
 *
 * CLAUDE.md 4 lists the delivered file as `site.webmanifest`. It is generated
 * here instead, and therefore served at `/manifest.webmanifest`: a static JSON
 * file would have to repeat the company name and the site description as
 * literals, and CLAUDE.md 2 forbids restating company data anywhere outside
 * `company.ts`. The route name is a detail; a second, silently diverging copy
 * of the legal name is not. `metadata.manifest` in the root layout points at
 * whatever path this resolves to, so nothing else has to know.
 *
 * The manifest exists for the icons and the theme colour, not to pretend this
 * is an app. `minimal-ui` keeps browser navigation if anyone does pin the site
 * to a home screen — a four-page marketing site with no back button would be a
 * trap, and `standalone` is a claim about the product that is not true here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.legalName,
    short_name: company.shortName,
    description: SITE_DESCRIPTION,
    lang: 'de-DE',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'minimal-ui',
    orientation: 'portrait-primary',
    // Matches the top of every page (paper), so the Android task switcher and
    // the splash screen do not frame a light site in a colour it never uses.
    // Light only — CLAUDE.md 4 rules out a dark mode in v1.
    theme_color: '#fbfcfd',
    background_color: '#fbfcfd',
    categories: ['business'],
    /*
     * Only the delivered files are listed. No maskable cut is declared,
     * because none was delivered and the correct one is separate artwork with
     * the mark pulled inside the launcher's 80% safe circle, not one of these
     * relabelled. Without it a launcher falls back to framing the icon itself,
     * which is the honest outcome rather than a cropped mark.
     */
    icons: [
      { src: '/favicon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      { src: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' },
      { src: '/favicon-32x32.png', type: 'image/png', sizes: '32x32', purpose: 'any' },
    ],
  };
}
