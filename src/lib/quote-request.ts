/**
 * The quote request, as one schema.
 *
 * Imported by both the client form (`components/sections/quote-form/*`) and the
 * route handler (`app/api/anfrage/route.ts`), so the browser and the server can
 * never disagree about what a valid request is: client validation is a courtesy
 * to the user, the server check is the one that counts.
 *
 * Free of React and of anything Node-only for exactly that reason.
 *
 * Data minimisation (Art. 5 Abs. 1 lit. c DSGVO) is a design constraint here,
 * not a footnote. Every field has to earn a place by being needed to write a
 * quote:
 *   - services / frequency / propertyType — what is being quoted, and at what
 *     cadence. Without these there is no offer to make.
 *   - postalCode — decides whether the object is in the service area at all.
 *     Required, but the *street* address is not: that is only needed once an
 *     appointment is actually agreed, and is therefore deliberately absent.
 *   - name / email / phone — the reply. Phone is required because a quote for a
 *     building is settled in a call, not in a form.
 *   - companyName / location / size / message — optional, and labelled as such.
 * There is no budget field, no "how did you hear about us", no marketing
 * consent, and no hidden identifier of any kind.
 */

import { z } from 'zod';

import {
  getCategoryOfItem,
  SERVICE_CATEGORY_SLUGS,
  SERVICE_ITEM_SLUGS,
  type ServiceCategorySlug,
  type ServiceItemSlug,
} from '@/content/services';

/**
 * Optional free text. Empty string is the "not provided" value rather than
 * `undefined`: it is what an untouched controlled input holds, so the form,
 * the wire format and the schema all agree without a transform in between.
 * Consumers treat `''` as absent — see `hasValue` below.
 */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Bitte kürzen Sie diese Angabe auf höchstens ${max} Zeichen.`);
}

/** True when an optional field was actually filled in. */
export function hasValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export const quoteRequestSchema = z.object({
  /*
   * Step one is two-stage (CLAUDE.md 7a): the visitor picks categories, and
   * picking one opens its individual services.
   *
   * The category is the required answer and the individual services are an
   * optional refinement, not the other way round. That is a deliberate call
   * about what this form is for: a Hausverwaltung that wants Gebäudereinigung
   * should not have to tick four boxes to say so, and the actual scope is
   * settled at the Besichtigung anyway. Requiring the leaf level would cost
   * leads to buy a precision the quote does not depend on.
   */
  serviceCategories: z
    .array(z.enum(SERVICE_CATEGORY_SLUGS as ServiceCategorySlug[]))
    .min(1, { error: 'Bitte wählen Sie mindestens einen Bereich aus.' }),

  services: z.array(z.enum(SERVICE_ITEM_SLUGS as ServiceItemSlug[])),

  frequency: z.enum(
    [
      'einmalig',
      'woechentlich',
      'mehrmals-woechentlich',
      'monatlich',
      'saisonal',
      'beratung',
    ],
    { error: 'Bitte wählen Sie aus, wie oft die Leistung erbracht werden soll.' },
  ),

  propertyType: z.enum(
    ['wohnanlage', 'gewerbeobjekt', 'einfamilienhaus', 'sonstiges'],
    { error: 'Bitte wählen Sie aus, um welche Art von Objekt es sich handelt.' },
  ),

  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, {
      error: 'Bitte geben Sie eine fünfstellige Postleitzahl an.',
    }),

  location: optionalText(80),
  size: optionalText(120),

  name: z
    .string()
    .trim()
    .min(2, { error: 'Bitte nennen Sie uns Ihren Namen.' })
    .max(120, { error: 'Bitte kürzen Sie Ihren Namen auf höchstens 120 Zeichen.' }),

  email: z.email({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' }),

  // Deliberately permissive: +49, 0049, spaces, slashes and dashes are all
  // ways people write the same number, and rejecting a real number because of
  // its formatting costs a lead. The server does not dial it, a person does.
  phone: z
    .string()
    .trim()
    .regex(/^[+0][\d\s/().-]{5,24}$/, {
      error:
        'Bitte geben Sie eine Telefonnummer an, unter der wir Sie erreichen.',
    }),

  companyName: optionalText(120),
  message: optionalText(2000),

  // Refined rather than `z.literal(true)` so the inferred type stays `boolean`
  // and an unchecked box is representable in form state. The refinement still
  // makes "unchecked" a schema violation on the server, not just a UI state:
  // consent has to be given, and a request without it is rejected there too.
  privacyAccepted: z.boolean().refine((accepted) => accepted === true, {
    error:
      'Bitte bestätigen Sie, dass Sie die Datenschutzerklärung zur Kenntnis genommen haben.',
  }),
})
  /*
   * An individual service may only arrive with its category.
   *
   * The UI cannot produce a violation — the checkboxes for a category's
   * services are only rendered once that category is selected, and
   * deselecting it clears them. This is the server's own check on the same
   * rule, because the route handler validates the raw body and a hand-crafted
   * POST is not bound by what the form renders. Without it the confirmation
   * mail could list a service under a category the sender never chose.
   */
  .refine(
    (value) =>
      value.services.every((slug) => {
        const category = getCategoryOfItem(slug);
        return (
          category !== undefined &&
          value.serviceCategories.includes(category.slug)
        );
      }),
    {
      path: ['services'],
      error:
        'Bitte wählen Sie zuerst den Bereich aus, zu dem die Leistung gehört.',
    },
  );

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

/** Field names, for per-step validation. */
export type QuoteRequestField = keyof QuoteRequest;

/* -------------------------------------------------------------------------
   Option catalogues

   The labels live next to the schema rather than in the markup so that the
   confirmation step and a later mail template can render a stored value back
   as German prose without a second lookup table drifting out of sync.
   ------------------------------------------------------------------------- */

export interface ChoiceOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
  /** One short line under the label. Never a second sentence. */
  readonly hint: string;
}

export type Frequency = QuoteRequest['frequency'];
export type PropertyType = QuoteRequest['propertyType'];

export const frequencyOptions: readonly ChoiceOption<Frequency>[] = [
  {
    value: 'einmalig',
    label: 'Einmalig',
    hint: 'Ein Termin, zum Beispiel nach Auszug oder nach dem Bau.',
  },
  {
    value: 'woechentlich',
    label: 'Wöchentlich',
    hint: 'Ein fester Turnus pro Woche.',
  },
  {
    value: 'mehrmals-woechentlich',
    label: 'Mehrmals wöchentlich',
    hint: 'Für Objekte mit Publikumsverkehr oder hoher Frequenz.',
  },
  {
    value: 'monatlich',
    label: 'Monatlich',
    hint: 'Ein Turnus pro Monat oder in längeren Abständen.',
  },
  {
    value: 'saisonal',
    label: 'Saisonal',
    hint: 'Über eine Saison, etwa Winterdienst oder Grünpflege.',
  },
  {
    value: 'beratung',
    label: 'Erst einmal beraten lassen',
    hint: 'Sie wissen noch nicht, was Ihr Objekt braucht. Wir schauen es uns an.',
  },
];

export const propertyTypeOptions: readonly ChoiceOption<PropertyType>[] = [
  {
    value: 'wohnanlage',
    label: 'Wohnanlage',
    hint: 'Mehrfamilienhaus, WEG oder Wohnungsbestand.',
  },
  {
    value: 'gewerbeobjekt',
    label: 'Gewerbeobjekt',
    hint: 'Büro, Praxis, Ladenlokal oder Halle.',
  },
  {
    value: 'einfamilienhaus',
    label: 'Einfamilienhaus',
    hint: 'Eigenes Haus oder vermietete Einheit.',
  },
  {
    value: 'sonstiges',
    label: 'Sonstiges',
    hint: 'Passt nichts davon, beschreiben Sie es kurz in Schritt 4.',
  },
];

/** German label for a stored value. Falls back to the raw value. */
export function frequencyLabel(value: Frequency | undefined): string {
  return frequencyOptions.find((o) => o.value === value)?.label ?? '';
}

export function propertyTypeLabel(value: PropertyType | undefined): string {
  return propertyTypeOptions.find((o) => o.value === value)?.label ?? '';
}

/**
 * Blank form state.
 *
 * Every field is present and controlled from the very first render, which is
 * what lets the user move back and forth without losing anything: no field is
 * ever unmounted into `undefined` and then remounted empty.
 *
 * The two choice fields start as `undefined` rather than as a pre-selected
 * option — pre-selecting one would submit an answer the user never gave.
 */
export const emptyQuoteRequest = {
  serviceCategories: [] as ServiceCategorySlug[],
  services: [] as ServiceItemSlug[],
  frequency: undefined as Frequency | undefined,
  propertyType: undefined as PropertyType | undefined,
  postalCode: '',
  location: '',
  size: '',
  name: '',
  email: '',
  phone: '',
  companyName: '',
  message: '',
  privacyAccepted: false,
};

/* -------------------------------------------------------------------------
   Steps
   ------------------------------------------------------------------------- */

export interface QuoteStep {
  /** Stable key — used for anchors, ids and the AnimatePresence key. */
  readonly id: string;
  /** Full heading inside the step. */
  readonly title: string;
  /** Short label in the indicator rail, where space is tight. */
  readonly shortLabel: string;
  /** One line of orientation under the heading. */
  readonly description: string;
  /**
   * Validated before the step may be left. The last step lists no fields —
   * it is gated by `handleSubmit` against the whole schema instead.
   */
  readonly fields: readonly QuoteRequestField[];
}

export const quoteSteps: readonly QuoteStep[] = [
  {
    id: 'leistungen',
    title: 'Welche Leistungen brauchen Sie?',
    shortLabel: 'Leistungen',
    description:
      'Wählen Sie einen oder mehrere Bereiche. Zu jedem Bereich können Sie danach einzelne Leistungen angeben, müssen es aber nicht.',
    fields: ['serviceCategories', 'services'],
  },
  {
    id: 'turnus',
    title: 'Wie oft soll das passieren?',
    shortLabel: 'Turnus',
    description:
      'Eine ungefähre Angabe reicht. Sind Sie unsicher, wählen Sie die Beratung.',
    fields: ['frequency'],
  },
  {
    id: 'objekt',
    title: 'Um welches Objekt geht es?',
    shortLabel: 'Objekt',
    description:
      'Die Postleitzahl brauchen wir, um die Anfahrt einzuschätzen. Eine Straße erfragen wir erst, wenn ein Termin steht.',
    fields: ['propertyType', 'postalCode', 'location', 'size'],
  },
  {
    id: 'kontakt',
    title: 'Wie erreichen wir Sie?',
    shortLabel: 'Kontakt',
    description:
      'Wir melden uns zu den Geschäftszeiten. Für Rückfragen zum Objekt ist ein Anruf meist der kürzeste Weg.',
    fields: ['name', 'email', 'phone', 'companyName', 'message'],
  },
  {
    id: 'absenden',
    title: 'Passt alles so?',
    shortLabel: 'Absenden',
    description:
      'Prüfen Sie Ihre Angaben. Über „Zurück" können Sie jeden Schritt noch ändern.',
    fields: [],
  },
];
