/**
 * Single source of truth for all company data.
 *
 * Every visible occurrence of an address, phone number, registry entry or
 * opening hour on this site must be imported from here — never hardcoded and
 * never repeated with a different wording (imprint law, Google Business Profile
 * NAP consistency).
 *
 * Wording rules that go with this data:
 * - No "24/7 emergency service". Correct: urgent cases (water damage, winter
 *   service) can be reached by phone outside business hours.
 * - No "nationwide". Correct: Duisburg and surrounding area, further afield for
 *   larger contracts.
 * - Values that are still `null` render as `PENDING_LABEL` in the imprint —
 *   they are never invented and never silently omitted.
 */

export const PENDING_LABEL = "Angabe folgt";

/** schema.org DayOfWeek names — used verbatim when generating JSON-LD. */
export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

/**
 * `regular` entries map 1:1 to schema.org OpeningHoursSpecification.
 * `byArrangement` and `emergency` carry no fixed times and must NOT be emitted
 * as opening hours in JSON-LD — they are display-only notes.
 */
export type OpeningHoursKind = "regular" | "byArrangement" | "emergency";

export interface OpeningHoursEntry {
  readonly kind: OpeningHoursKind;
  /** Empty for entries that are not tied to specific weekdays. */
  readonly days: readonly Weekday[];
  /** German label for the day column, e.g. "Mo – Fr". */
  readonly daysLabel: string;
  /** 24h "HH:MM", or null when there are no fixed times. */
  readonly opens: string | null;
  readonly closes: string | null;
  /** German label for the time column. */
  readonly timeLabel: string;
}

export interface PostalAddress {
  readonly street: string;
  readonly postalCode: string;
  readonly city: string;
  readonly country: string;
  /** ISO 3166-1 alpha-2, for JSON-LD. */
  readonly countryCode: string;
  /** One-line rendering for footer and imprint. */
  readonly oneLine: string;
}

export interface SiteIdentity {
  /**
   * Canonical origin, no trailing slash. Consumed by `metadataBase`, the
   * sitemap, robots.txt and the LocalBusiness JSON-LD, so the site can never
   * publish two different canonical hosts.
   *
   * TODO (client): the production domain is NOT confirmed yet (CLAUDE.md 12).
   * This is the address the client already uses for mail; it is the best
   * available guess, and it is one line to change once the domain is decided.
   */
  readonly url: string;
  /** Open Graph card, 1200x630, served from /public. */
  readonly ogImage: {
    readonly path: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  };
}

export interface CompanyProfile {
  readonly site: SiteIdentity;
  readonly legalName: string;
  readonly shortName: string;
  readonly legalForm: string;
  readonly address: PostalAddress;
  readonly phone: {
    /** Human-readable, as printed on business cards. */
    readonly display: string;
    /** `tel:` href in E.164 — the only value allowed in an <a href>. */
    readonly href: string;
    /** Bare E.164, for JSON-LD `telephone`. */
    readonly e164: string;
  };
  readonly email: {
    readonly address: string;
    readonly href: string;
  };
  readonly managingDirector: {
    readonly name: string;
    /** Representation note for the imprint. */
    readonly representation: string;
  };
  readonly registry: {
    readonly court: string;
    readonly number: string;
    readonly seat: string;
    readonly shareCapital: string;
    /** Not issued to us yet — renders as PENDING_LABEL. */
    readonly vatId: string | null;
  };
  readonly liabilityInsurance: {
    readonly type: string;
    readonly coverage: string;
    /** Not supplied by the client yet — renders as PENDING_LABEL. */
    readonly insurer: string | null;
    readonly scope: string | null;
  };
  /** Responsible for editorial content under § 18 Abs. 2 MStV. */
  readonly editorialResponsible: {
    readonly name: string;
    readonly address: PostalAddress;
  };
  readonly openingHours: readonly OpeningHoursEntry[];
  readonly serviceArea: {
    readonly primary: string;
    readonly note: string;
    /** Sentence approved for body copy — do not paraphrase into "nationwide". */
    readonly sentence: string;
  };
}

const address: PostalAddress = {
  street: "Am Burgacker 20",
  postalCode: "47051",
  city: "Duisburg",
  country: "Deutschland",
  countryCode: "DE",
  oneLine: "Am Burgacker 20, 47051 Duisburg",
} as const;

export const company = {
  site: {
    url: "https://www.imperial-gmbh.com",
    ogImage: {
      path: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Imperial Gebäudeservice GmbH — Gebäudeservice in Duisburg und Umgebung",
    },
  },

  legalName: "Imperial Gebäudeservice GmbH",
  shortName: "Imperial Gebäudeservice",
  legalForm: "Gesellschaft mit beschränkter Haftung (GmbH)",

  address,

  phone: {
    display: "0151 200 669 40",
    href: "tel:+4915120066940",
    e164: "+4915120066940",
  },

  email: {
    address: "info@imperial-gmbh.com",
    href: "mailto:info@imperial-gmbh.com",
  },

  managingDirector: {
    name: "Metin Jamu",
    representation: "einzelvertretungsberechtigt",
  },

  registry: {
    court: "Amtsgericht Duisburg",
    number: "HRB 39367",
    seat: "Duisburg",
    shareCapital: "25.000 €",
    vatId: null,
  },

  liabilityInsurance: {
    type: "Betriebshaftpflicht",
    coverage: "10 Mio. € Deckungssumme",
    insurer: null,
    scope: null,
  },

  editorialResponsible: {
    name: "Metin Jamu",
    address,
  },

  openingHours: [
    {
      kind: "regular",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      daysLabel: "Mo – Fr",
      opens: "07:00",
      closes: "18:00",
      timeLabel: "07:00 – 18:00 Uhr",
    },
    {
      kind: "byArrangement",
      days: ["Saturday"],
      daysLabel: "Sa",
      opens: null,
      closes: null,
      timeLabel: "nach Absprache",
    },
    {
      kind: "emergency",
      days: [],
      daysLabel: "Akutfälle",
      opens: null,
      closes: null,
      timeLabel:
        "Wasserschaden und Winterdienst auch außerhalb der Geschäftszeiten — telefonisch",
    },
  ],

  serviceArea: {
    primary: "Duisburg und Umgebung",
    note: "Bei größeren Aufträgen auch darüber hinaus.",
    sentence:
      "Wir arbeiten in Duisburg und Umgebung, bei größeren Aufträgen auch weiter.",
  },
} as const satisfies CompanyProfile;

export type Company = typeof company;

/** One entry of `company.openingHours`, with its literal types preserved. */
export type OpeningHoursItem = Company['openingHours'][number];

/**
 * Opening hours that may legitimately become schema.org
 * OpeningHoursSpecification entries — `opens` and `closes` are non-null here.
 */
export const regularOpeningHours = company.openingHours.filter(
  (entry): entry is Extract<OpeningHoursItem, { kind: 'regular' }> =>
    entry.kind === 'regular',
);

/** Absolute URL for a site-relative path. One join, one place. */
export function absoluteUrl(path: string): string {
  return new URL(path, company.site.url).toString();
}
