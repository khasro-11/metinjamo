/**
 * Site navigation as data.
 *
 * Header, mobile overlay and footer all read from here, so a route rename or
 * a reordered menu is a one-file change and the three menus can never drift
 * apart.
 *
 * Target IA per the brief (CLAUDE.md 7): `/leistungen`, `/ueber-uns`,
 * `/kontakt`, `/impressum`, `/datenschutz` are real routes.
 *
 * Until a route exists, its header entry points at the landing-page section
 * that already carries the content, not at the future URL. A menu item that
 * resolves to 404 is worse than one that scrolls: the visitor loses the page
 * they were on, and a crawler records a broken link in the primary navigation.
 *
 * Anchors in force right now, each with the section that owns the id:
 *   Leistungen  -> #leistungen   (services-bento)
 *   Ablauf      -> #ablauf       (process-steps)
 *   Über uns    -> #ueber-uns    (about)
 *   Kontakt     -> #kontaktwege  (contact-channels)
 *
 * TODO: build `/leistungen`, `/ueber-uns` and `/kontakt` as real routes, then
 * move those entries back to the URLs. There are deliberately no per-service
 * detail routes: the catalogue is five categories, each an anchor on the
 * landing page (CLAUDE.md 7a).
 */

import { categoryAnchorHref, serviceCategories } from '@/content/services';

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/** Header links, in the order the client asked for. */
export const primaryNav: readonly NavLink[] = [
  { label: 'Leistungen', href: '/#leistungen' },
  { label: 'Ablauf', href: '/#ablauf' },
  { label: 'Über uns', href: '/#ueber-uns' },
  { label: 'Kontakt', href: '/#kontaktwege' },
] as const;

/**
 * Footer service column and hero chips.
 *
 * Derived from the catalogue in `content/services.ts` rather than typed out a
 * second time, so footer, hero chips and the Leistungen bento cannot drift
 * apart. The short names are used because these are tight rows.
 *
 * One entry per category, never per individual service: eighteen links in a
 * footer column is a sitemap dump, and the five categories are the addressable
 * units of the catalogue anyway.
 *
 * Every entry resolves to a bento tile's anchor on the landing page. The
 * leading slash matters — from `/impressum` a bare `#gebaeudereinigung` would
 * scroll the imprint rather than open the landing page.
 */
export const serviceNav: readonly NavLink[] = serviceCategories.map(
  (category) => ({
    label: category.shortName,
    href: categoryAnchorHref(category.anchor, { absolute: true }),
  }),
);

/** Reachable in one click from every page — legal requirement, not a choice. */
export const legalNav: readonly NavLink[] = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutzerklärung', href: '/datenschutz' },
] as const;

/** The one CTA that carries the site's primary goal. */
export const primaryCta = {
  label: 'Angebot anfordern',
  href: '/#angebot',
} as const;