/**
 * The service catalogue, as data.
 *
 * This module is the single source of truth for what Imperial sells. The
 * footer column, the hero chips, the Leistungen bento, the `/leistungen/[slug]`
 * detail routes and the quote form all read from here, so adding or renaming a
 * service is a one-file change and the five surfaces can never drift apart.
 *
 * Deliberately free of React: the quote form is a client component, and an
 * `icon: Icon` field here would drag eight Phosphor modules into its bundle for
 * data it never renders. Icons and bento tile sizes are presentation and live
 * next to the markup that uses them, keyed by slug and typed against
 * `ServiceSlug`, so a new entry here fails to compile until it is given both.
 *
 * TODO (client, CLAUDE.md 12): this catalogue is NOT confirmed. It is the
 * candidate list from the briefing, not a verified offering. Nothing here may
 * go live before sign-off — advertising a service that is not actually sold is
 * a section 5 UWG problem, not just a copy problem. Specifically to confirm:
 * - which of the eight are really offered, and under which names;
 * - Winterdienst: are call-outs documented per event, as `benefit` promises?
 * - Unterhaltsreinigung / Grünpflege: is a fixed agreed cycle really the model?
 * - is a single combined contract across services actually on offer?
 */

/**
 * Who a service is primarily written for. Drives ordering and grouping later
 * (detail pages, form) — the brief ranks B2B first, B2C second.
 */
export type ServiceAudience = 'b2b' | 'b2c';

export interface Service {
  /** URL segment. German, no umlauts (CLAUDE.md 9). Also the anchor key. */
  readonly slug: string;
  /** Canonical name: detail page H1, form option, bento tile title. */
  readonly name: string;
  /** Shortened for tight rows — header nav, hero chips, footer column. */
  readonly shortName: string;
  /**
   * One to two sentences of customer value. What the client gets, not what we
   * do — no feature lists, no figures, no superlatives.
   */
  readonly benefit: string;
  readonly audience: readonly ServiceAudience[];
}

/**
 * Order is editorial, not alphabetical: the two services a Hausverwaltung
 * signs first lead, the occasional and project-driven ones close.
 */
export const services = [
  {
    slug: 'unterhaltsreinigung',
    name: 'Unterhaltsreinigung',
    shortName: 'Unterhaltsreinigung',
    benefit:
      'Ihre Objekte bleiben dauerhaft vorzeigbar, ohne dass Sie hinterhertelefonieren müssen. Ein festes Team übernimmt den vereinbarten Turnus und kennt Ihr Gebäude, statt jedes Mal neu eingewiesen zu werden.',
    audience: ['b2b', 'b2c'],
  },
  {
    slug: 'treppenhausreinigung',
    name: 'Treppenhausreinigung',
    shortName: 'Treppenhaus',
    benefit:
      'Das Treppenhaus ist der erste Eindruck Ihrer Immobilie und der häufigste Anlass für Beschwerden. Wir halten es im festen Rhythmus sauber, damit die Verwaltung sich nicht mehr damit befassen muss.',
    audience: ['b2b'],
  },
  {
    slug: 'glasreinigung',
    name: 'Glas- und Rahmenreinigung',
    shortName: 'Glasreinigung',
    benefit:
      'Fenster, Rahmen und Glasflächen werden wieder klar, innen wie außen. Umfang und Intervall legen wir vorher am Objekt fest, damit die Kosten planbar bleiben.',
    audience: ['b2b', 'b2c'],
  },
  {
    slug: 'gruenpflege',
    name: 'Grünpflege und Außenanlagen',
    shortName: 'Grünpflege',
    benefit:
      'Rasen, Hecken und Wege bleiben über die ganze Saison gepflegt, ohne dass Sie jede Runde einzeln beauftragen. Wir richten uns nach dem Wachstum, nicht nach dem Kalender.',
    audience: ['b2b', 'b2c'],
  },
  {
    slug: 'winterdienst',
    name: 'Winterdienst',
    shortName: 'Winterdienst',
    benefit:
      'Die Räum- und Streupflicht bleibt bei Ihnen, die Arbeit übernehmen wir. Wir räumen in den vereinbarten Zeitfenstern und halten die Einsätze fest, damit Sie im Streitfall etwas in der Hand haben.',
    audience: ['b2b', 'b2c'],
  },
  {
    slug: 'hausmeisterservice',
    name: 'Hausmeisterservice',
    shortName: 'Hausmeister',
    benefit:
      'Ein Ansprechpartner für Kontrollgänge, Kleinreparaturen, Müllmanagement und alles, was sonst zwischen den Gewerken liegen bleibt. Sie rufen einmal an, statt drei Firmen zu koordinieren.',
    audience: ['b2b'],
  },
  {
    slug: 'entruempelung',
    name: 'Entrümpelung und Haushaltsauflösung',
    shortName: 'Entrümpelung',
    benefit:
      'Wohnungen, Keller und Dachböden werden geräumt und besenrein übergeben, damit die Einheit wieder vermietbar ist. Verwertbares wird getrennt, der Rest ordnungsgemäß entsorgt.',
    audience: ['b2c', 'b2b'],
  },
  {
    slug: 'bauendreinigung',
    name: 'Bauendreinigung',
    shortName: 'Bauendreinigung',
    benefit:
      'Nach dem letzten Gewerk übernehmen wir die Feinreinigung, damit die Abnahme nicht an Staub und Klebeband scheitert. Die Termine richten sich nach Ihrem Bauzeitenplan.',
    audience: ['b2b'],
  },
] as const satisfies readonly Service[];

/** Literal union of every slug — the key type for icon and tile maps. */
export type ServiceSlug = (typeof services)[number]['slug'];

/** One entry of `services`, with its literal types preserved. */
export type ServiceItem = (typeof services)[number];

/** Prefix of every bento tile id. The hero chips jump to these. */
export const SERVICE_ANCHOR_PREFIX = 'leistung';

/** Landing-page anchor of a service's bento tile. */
export function serviceAnchorId(slug: string): string {
  return `${SERVICE_ANCHOR_PREFIX}-${slug}`;
}

/** Route of a service's detail page. */
export function serviceHref(slug: string): string {
  return `/leistungen/${slug}`;
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return services.find((service) => service.slug === slug);
}
