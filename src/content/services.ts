/**
 * The service catalogue, as data.
 *
 * This module is the single source of truth for what Imperial sells. The hero
 * chips, the Leistungen bento, the footer column, the quote form and the
 * JSON-LD offer catalogue all read from here, so adding or renaming a service
 * is a one-file change and the five surfaces can never drift apart.
 *
 * ## Two levels, on purpose
 *
 * The catalogue is five categories holding eighteen individual services. That
 * shape is the content, not a convenience: eighteen equally-weighted entries
 * is an unreadable bento and an unanswerable first form step, while five
 * categories is a decision a visitor can actually make in one glance. The
 * individual services are what proves the category is real, so they are always
 * shown *inside* their category and never on their own.
 *
 * There are no per-service pages. Every category lives on the landing page and
 * on `/leistungen`, reachable through its own anchor (CLAUDE.md 9). Eighteen
 * thin detail pages would be duplicate content in the sense Google means it.
 *
 * Deliberately free of React: the quote form is a client component, and an
 * `icon: Icon` field here would drag five Phosphor modules into its bundle for
 * data it never renders. Icons and bento tile sizes are presentation and live
 * next to the markup that uses them, keyed by slug and typed against
 * `ServiceCategorySlug`, so a new entry here fails to compile until it is
 * given both.
 *
 * ## Wording rules that are load-bearing here
 *
 * - "Winterdienst" always carries "Räum- und Streupflicht" (CLAUDE.md 7a).
 *   For a Hausverwaltung that phrase is the entire buying argument, because it
 *   is the statutory duty they are outsourcing. It is part of the name, not a
 *   footnote, so it cannot be dropped by a surface that only renders names.
 * - Nothing in `abbruch-sanierung` claims a certificate, a Meisterbrief or
 *   hazardous-material clearance (asbestos, KMF). None of that is evidenced,
 *   and in this trade an unbacked claim is a section 5 UWG problem, not a copy
 *   problem. The blurb therefore describes coordination and sequencing, which
 *   is true and is also what a Verwalter is actually buying.
 * - No figures, no superlatives, no "24/7", no "deutschlandweit".
 */

/** Category identifier. German, no umlauts. Also the landing-page anchor. */
export type ServiceCategorySlug =
  | 'gebaeudereinigung'
  | 'abbruch-sanierung'
  | 'entruempelung-logistik'
  | 'aussenbereich'
  | 'hausmeisterservice';

export interface ServiceItem {
  /** Stable key. Submitted by the form, so it must not change casually. */
  readonly slug: string;
  /** Exactly as it is shown. Chips, form checkboxes and JSON-LD share it. */
  readonly name: string;
}

export interface ServiceCategory {
  readonly slug: ServiceCategorySlug;
  /** Full name: bento tile title, form group label, JSON-LD `Service` name. */
  readonly category: string;
  /** Shortened for tight rows — hero chips and the footer column. */
  readonly shortName: string;
  /** Landing-page anchor id, without the `#`. Deep links point here. */
  readonly anchor: string;
  /**
   * One sentence of customer value. What the client gets, not what we do.
   * No feature list — the feature list is `items`, directly underneath.
   */
  readonly blurb: string;
  readonly items: readonly ServiceItem[];
}

/**
 * Order is fixed by the client and is not alphabetical (CLAUDE.md 7a).
 * Gebäudereinigung leads because it is the core business and the thing the
 * logo depicts; Hausmeisterservice closes because it is the wrapper the other
 * four are bought through once a Verwalter has more than one object.
 */
export const serviceCategories = [
  {
    slug: 'gebaeudereinigung',
    category: 'Gebäudereinigung',
    shortName: 'Gebäudereinigung',
    anchor: 'gebaeudereinigung',
    blurb:
      'Ihre Objekte bleiben dauerhaft vorzeigbar, ohne dass Sie hinterhertelefonieren müssen. Ein festes Team übernimmt den vereinbarten Turnus und kennt Ihr Gebäude, statt jedes Mal neu eingewiesen zu werden.',
    items: [
      { slug: 'glas-fensterreinigung', name: 'Glas- und Fensterreinigung' },
      { slug: 'unterhaltsreinigung', name: 'Unterhaltsreinigung' },
      { slug: 'grundreinigung', name: 'Grundreinigung' },
      { slug: 'baureinigung', name: 'Baureinigung' },
    ],
  },
  {
    slug: 'abbruch-sanierung',
    category: 'Abbruch & Sanierung',
    shortName: 'Abbruch & Sanierung',
    anchor: 'abbruch-sanierung',
    // Coordination, sequencing and a single point of contact. No claim about
    // qualifications, and none about hazardous materials — see the header.
    blurb:
      'Vom Rückbau bis zur fertigen Fläche aus einer Hand. Sie koordinieren nicht vier Gewerke nacheinander, sondern haben einen Ansprechpartner, der die Reihenfolge kennt und die Übergaben verantwortet.',
    items: [
      { slug: 'gebaeudesanierung', name: 'Gebäudesanierung' },
      { slug: 'entkernung', name: 'Entkernung' },
      { slug: 'wasserschadensanierung', name: 'Wasserschadensanierung' },
      { slug: 'trockenlegung', name: 'Trockenlegung' },
      { slug: 'trockenbauarbeiten', name: 'Trockenbauarbeiten' },
      { slug: 'fliesenarbeiten', name: 'Fliesenarbeiten' },
    ],
  },
  {
    slug: 'entruempelung-logistik',
    category: 'Entrümpelung & Logistik',
    shortName: 'Entrümpelung',
    anchor: 'entruempelung-logistik',
    blurb:
      'Wohnungen, Keller und Dachböden werden geräumt und besenrein übergeben, damit die Einheit wieder vermietbar ist. Verwertbares wird getrennt, der Rest ordnungsgemäß entsorgt.',
    items: [
      { slug: 'umzuege', name: 'Durchführung von Umzügen' },
      { slug: 'entruempelung', name: 'Entrümpelung' },
      { slug: 'sperrmuellentsorgung', name: 'Sperrmüllentsorgung' },
    ],
  },
  {
    slug: 'aussenbereich',
    category: 'Außenbereich & Gelände',
    shortName: 'Außenbereich',
    anchor: 'aussenbereich',
    blurb:
      'Das Gelände bleibt über das ganze Jahr in einem Zustand, den Sie niemandem erklären müssen. Im Sommer nach dem Wachstum, im Winter nach dem Wetter, beides ohne Einzelbeauftragung.',
    items: [
      { slug: 'garten-landschaftsbau', name: 'Garten- und Landschaftsbau' },
      { slug: 'gruenpflege', name: 'Grünpflege' },
      // The parenthesis is part of the name and travels with it everywhere.
      // See the wording rules in the module header.
      {
        slug: 'winterdienst',
        name: 'Winterdienst (Räum- und Streupflicht)',
      },
    ],
  },
  {
    slug: 'hausmeisterservice',
    category: 'Hausmeisterservice',
    shortName: 'Hausmeisterservice',
    anchor: 'hausmeisterservice',
    blurb:
      'Ein Ansprechpartner für Kontrollgänge, Kleinreparaturen, Müllmanagement und alles, was sonst zwischen den Gewerken liegen bleibt. Sie rufen einmal an, statt drei Firmen zu koordinieren.',
    items: [
      {
        slug: 'technische-immobilienbetreuung',
        name: 'Technische Immobilienbetreuung',
      },
      { slug: 'allgemeine-objektbetreuung', name: 'Allgemeine Objektbetreuung' },
    ],
  },
] as const satisfies readonly ServiceCategory[];

/** One entry of `serviceCategories`, with its literal types preserved. */
export type ServiceCategoryItem = (typeof serviceCategories)[number];

/** Literal union of every individual service slug — the form's value type. */
export type ServiceItemSlug =
  (typeof serviceCategories)[number]['items'][number]['slug'];

/** Every category slug, in catalogue order. */
export const SERVICE_CATEGORY_SLUGS = serviceCategories.map(
  (category) => category.slug,
) as readonly ServiceCategorySlug[];

/** Every individual service slug, flattened in catalogue order. */
export const SERVICE_ITEM_SLUGS = serviceCategories.flatMap((category) =>
  category.items.map((item) => item.slug),
) as readonly ServiceItemSlug[];

/**
 * Which category an individual service belongs to.
 *
 * Built once here rather than re-derived at each call site: the form validates
 * that no individual service arrives without its category, and doing that with
 * a nested `find` per submitted value would be the same lookup written twice.
 */
const CATEGORY_BY_ITEM = new Map<string, ServiceCategoryItem>(
  serviceCategories.flatMap((category) =>
    category.items.map((item) => [item.slug, category] as const),
  ),
);

export function getServiceCategory(
  slug: string,
): ServiceCategoryItem | undefined {
  return serviceCategories.find((category) => category.slug === slug);
}

export function getCategoryOfItem(
  itemSlug: string,
): ServiceCategoryItem | undefined {
  return CATEGORY_BY_ITEM.get(itemSlug);
}

export function getServiceItem(itemSlug: string): ServiceItem | undefined {
  return getCategoryOfItem(itemSlug)?.items.find(
    (item) => item.slug === itemSlug,
  );
}

/**
 * Landing-page anchor of a category, as an href.
 *
 * Anchor ids are the bare category slug (`#gebaeudereinigung`), fixed by the
 * brief. They are the only addressable unit of the catalogue, so hero chips,
 * footer links, breadcrumbs and any external deep link all resolve through
 * this one function.
 */
export function categoryAnchorHref(
  slug: string,
  { absolute = false }: { absolute?: boolean } = {},
): string {
  return `${absolute ? '/' : ''}#${slug}`;
}

/** Comma-joined service names of one category. Used in prose and in JSON-LD. */
export function categoryItemNames(category: ServiceCategoryItem): string {
  return category.items.map((item) => item.name).join(', ');
}
