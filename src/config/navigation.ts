/**
 * Site navigation as data.
 *
 * Header, mobile overlay and footer all read from here, so a route rename or
 * a reordered menu is a one-file change and the three menus can never drift
 * apart.
 *
 * Target IA per the brief: `/leistungen`, `/ueber-uns`, `/kontakt`,
 * `/impressum`, `/datenschutz` are real routes; "Ablauf" exists only as a
 * landing-page section and is therefore an anchor.
 *
 * TODO: `/leistungen`, `/ueber-uns` and `/kontakt` are still unbuilt and
 * resolve to 404. The `/leistungen/[slug]` detail pages exist.
 */

import { serviceHref, services } from '@/content/services';

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/** Header links, in the order the client asked for. */
export const primaryNav: readonly NavLink[] = [
  { label: 'Leistungen', href: '/leistungen' },
  { label: 'Ablauf', href: '/#ablauf' },
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Kontakt', href: '/kontakt' },
] as const;

/**
 * Footer service column and hero chips.
 *
 * Derived from the catalogue in `content/services.ts` rather than typed out a
 * second time, so header, footer, hero chips and the Leistungen bento cannot
 * drift apart. The short names are used because these are tight rows.
 *
 * Every entry now resolves: `/leistungen/[slug]` is built and prerendered from
 * the same catalogue.
 *
 * TODO (client): the catalogue itself is NOT confirmed yet (CLAUDE.md 12), so
 * the pages behind these links are drafts awaiting sign-off.
 */
export const serviceNav: readonly NavLink[] = services.map((service) => ({
  label: service.shortName,
  href: serviceHref(service.slug),
}));

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
