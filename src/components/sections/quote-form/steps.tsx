'use client';

import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode, Ref } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  ChoiceCard,
  ConsentField,
  ConsentLink,
  FieldError,
  TextAreaField,
  TextField,
} from '@/components/ui/field';
import {
  getCategoryOfItem,
  getServiceCategory,
  getServiceItem,
  serviceCategories,
} from '@/content/services';
import { cn } from '@/lib/cn';
import { EASE_IMPERIAL } from '@/lib/motion';
import {
  frequencyLabel,
  frequencyOptions,
  hasValue,
  propertyTypeLabel,
  propertyTypeOptions,
  quoteSteps,
  type QuoteRequest,
  type QuoteStep,
} from '@/lib/quote-request';

/* ---------------------------------------------------------------------------
   Frame
   --------------------------------------------------------------------------- */

export interface StepBodyProps {
  step: QuoteStep;
  /**
   * Callback ref that focuses the heading when the step mounts. A callback ref
   * rather than an effect: with `AnimatePresence mode="wait"` the new heading
   * does not exist until the outgoing one has finished leaving, so an effect
   * keyed on the step index would run against a null ref.
   */
  headingRef: Ref<HTMLHeadingElement>;
}

/**
 * Heading, orientation line and body of one step.
 *
 * The heading carries `tabIndex={-1}` so focus can be moved to it on every
 * step change. Its focus ring is deliberately *not* suppressed: browsers only
 * match `:focus-visible` on a programmatically focused element when the last
 * interaction was a keyboard one, so a mouse user sees nothing and a keyboard
 * user sees the same ring as everywhere else on the site.
 */
function StepFrame({
  step,
  headingRef,
  children,
}: StepBodyProps & { children: ReactNode }) {
  return (
    <div>
      <h3
        id={`${step.id}-titel`}
        ref={headingRef}
        tabIndex={-1}
        className="text-title-md"
      >
        {step.title}
      </h3>

      <p className="mt-3 max-w-copy text-body-sm text-neutral-500">
        {step.description}
      </p>

      <div className="mt-8">{children}</div>
    </div>
  );
}

/**
 * Grid of choice cards, and the accessible group around them.
 *
 * The grouping role sits on the grid itself rather than on a `display:
 * contents` wrapper — that value is still dropped from the accessibility tree
 * by some browser and screen-reader pairings, which would take the role and
 * its label with it.
 */
function ChoiceGrid({
  role,
  labelledBy,
  describedBy,
  className,
  children,
}: {
  role: 'group' | 'radiogroup';
  labelledBy: string;
  describedBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={role}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn('grid gap-3 sm:gap-4', className)}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   1 — Leistungen
   --------------------------------------------------------------------------- */

/**
 * The individual services of one category, revealed once the category is
 * ticked.
 *
 * Height is animated from `0` to `auto` through Motion rather than through a
 * `max-height` guess, so a two-item category and a six-item one both open to
 * exactly their own height with no dead space and no clipping. Motion animates
 * this off the main thread and reads the target height itself, which is the
 * one case where animating a layout property is the correct trade: the
 * alternative is a hardcoded maximum that is wrong for four of the five
 * categories.
 *
 * `aria-hidden` is deliberately absent. The wrapper is unmounted when the
 * category is closed, so there is nothing to hide from the accessibility tree,
 * and the checkboxes inside are real inputs in the tab order whenever they are
 * on screen.
 */
function CategoryServices({
  category,
}: {
  category: (typeof serviceCategories)[number];
}) {
  const { register } = useFormContext<QuoteRequest>();
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={reduce ? undefined : { height: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: EASE_IMPERIAL }}
      className="overflow-hidden"
    >
      <fieldset className="mt-3 rounded-bezel-md bg-brand-050/70 px-5 py-4 shadow-[var(--shadow-hairline-brand)]">
        <legend className="px-1 text-micro text-neutral-500">
          Einzelne Leistungen in {category.category}, optional
        </legend>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
          {category.items.map((item) => (
            <label
              key={item.slug}
              className="group inline-flex min-h-11 cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                value={item.slug}
                className="peer sr-only"
                {...register('services')}
              />

              <span
                aria-hidden="true"
                className={cn(
                  'grid size-[1.125rem] shrink-0 place-items-center rounded-[0.4rem]',
                  'bg-white shadow-[inset_0_0_0_1.5px_rgb(15_27_36/0.16)]',
                  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                  'group-hover:shadow-[inset_0_0_0_1.5px_var(--color-brand-300)]',
                  'peer-checked:bg-brand-900',
                  'peer-checked:shadow-[inset_0_0_0_1.5px_var(--color-brand-900)]',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
                  'peer-focus-visible:outline-brand-500',
                )}
              >
                {/* Transform and opacity only — the mark scales up out of the
                    box rather than the box changing size. */}
                <span
                  className={cn(
                    'scale-50 opacity-0',
                    'transition-[transform,opacity] duration-[var(--duration-swift)] ease-imperial',
                    // `group-has-`, not `peer-checked:`: this span is a
                    // grandchild of the input, and the sibling combinator
                    // `peer-*` compiles to cannot reach it. Same idiom as
                    // ChoiceCard.
                    'group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100',
                  )}
                >
                  <CheckIcon size={13} weight="light" className="text-brand-300" />
                </span>
              </span>

              <span className="text-body-sm text-ink">{item.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </motion.div>
  );
}

/**
 * Step one, in two stages: the five categories first, and the individual
 * services of a category once that category is selected (CLAUDE.md 7a).
 *
 * Eighteen checkboxes in one flat list was the alternative and is the wrong
 * shape for the first thing the form asks. It is a wall, it hides the
 * structure the rest of the site teaches, and it makes the cheapest possible
 * answer ("Gebäudereinigung") cost four clicks.
 *
 * The category selection is watched rather than held in `useState`: react-hook-form
 * already owns this value, and a second copy in component state is exactly the
 * kind of duplicate that drifts when the user jumps back from the review step.
 */
export function StepServices({ step, headingRef }: StepBodyProps) {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<QuoteRequest>();

  const selectedCategories =
    useWatch({ control, name: 'serviceCategories' }) ?? [];

  const error = errors.serviceCategories?.message ?? errors.services?.message;
  const errorId = error ? 'services-error' : undefined;

  /**
   * Closing a category drops the individual services that belonged to it.
   *
   * Without this, unticking a category would leave its services in form state:
   * invisible, unremovable, and still on their way to the inbox. The schema
   * rejects exactly that combination on the server, so leaving them would also
   * turn a stale checkbox into a validation error the user cannot see the
   * cause of.
   */
  const handleCategoryToggle = (slug: string, checked: boolean) => {
    if (checked) return;

    setValue(
      'services',
      (getValues('services') ?? []).filter(
        (itemSlug) => getCategoryOfItem(itemSlug)?.slug !== slug,
      ),
      { shouldValidate: false },
    );
  };

  return (
    <StepFrame step={step} headingRef={headingRef}>
      {/* A group, not a fieldset: a legend would duplicate the heading that
          already names this step, so `aria-labelledby` points at the real one
          instead of at a second copy of it. */}
      <ChoiceGrid
        role="group"
        labelledBy={`${step.id}-titel`}
        describedBy={errorId}
        className="sm:grid-cols-2"
      >
        {serviceCategories.map((category, index) => {
          const isOpen = selectedCategories.includes(category.slug);

          return (
            <div
              key={category.slug}
              // Gebäudereinigung is the core business and leads the catalogue,
              // so it takes the full row rather than sharing one. That also
              // turns five cards into six cells: three even rows instead of a
              // four-plus-one orphan, and an asymmetry that echoes the bento.
              className={index === 0 ? 'sm:col-span-2' : undefined}
            >
              <ChoiceCard
                type="checkbox"
                value={category.slug}
                label={category.category}
                hint={`${category.items.length} Leistungen`}
                {...register('serviceCategories', {
                  onChange: (event) =>
                    handleCategoryToggle(
                      event.target.value,
                      event.target.checked,
                    ),
                })}
              />

              <AnimatePresence initial={false}>
                {isOpen ? <CategoryServices category={category} /> : null}
              </AnimatePresence>
            </div>
          );
        })}
      </ChoiceGrid>

      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}

      <p className="mt-6 max-w-copy text-micro text-neutral-500">
        Sie können mehrere Bereiche kombinieren. Wenn Sie keine einzelnen
        Leistungen anhaken, klären wir den Umfang bei der Besichtigung.
      </p>
    </StepFrame>
  );
}

/* ---------------------------------------------------------------------------
   2 — Turnus
   --------------------------------------------------------------------------- */

export function StepFrequency({ step, headingRef }: StepBodyProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteRequest>();

  const error = errors.frequency?.message;
  const errorId = error ? 'frequency-error' : undefined;

  return (
    <StepFrame step={step} headingRef={headingRef}>
      <ChoiceGrid
        role="radiogroup"
        labelledBy={`${step.id}-titel`}
        describedBy={errorId}
        className="sm:grid-cols-2"
      >
        {frequencyOptions.map((option) => (
          <ChoiceCard
            key={option.value}
            type="radio"
            value={option.value}
            label={option.label}
            hint={option.hint}
            // "Erst einmal beraten lassen" is a different kind of answer from
            // the five cadences above it, so it gets its own row rather than
            // sitting in the grid as a sixth cadence.
            className={
              option.value === 'beratung' ? 'sm:col-span-2' : undefined
            }
            {...register('frequency')}
          />
        ))}
      </ChoiceGrid>

      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </StepFrame>
  );
}

/* ---------------------------------------------------------------------------
   3 — Objekt
   --------------------------------------------------------------------------- */

export function StepProperty({ step, headingRef }: StepBodyProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteRequest>();

  const typeError = errors.propertyType?.message;
  const typeErrorId = typeError ? 'propertyType-error' : undefined;

  return (
    <StepFrame step={step} headingRef={headingRef}>
      {/* This step holds four controls, so the radio group needs its own
          label rather than borrowing the step heading the way steps one and
          two do. */}
      <p id="objektart-label" className="text-body-sm font-medium text-ink">
        Art des Objekts
      </p>

      <ChoiceGrid
        role="radiogroup"
        labelledBy="objektart-label"
        describedBy={typeErrorId}
        className="mt-3 sm:grid-cols-2"
      >
        {propertyTypeOptions.map((option) => (
          <ChoiceCard
            key={option.value}
            type="radio"
            value={option.value}
            label={option.label}
            hint={option.hint}
            {...register('propertyType')}
          />
        ))}
      </ChoiceGrid>

      {typeError ? (
        <FieldError id={typeErrorId!}>{typeError}</FieldError>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <TextField
          id="postalCode"
          label="Postleitzahl"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          placeholder="47051"
          error={errors.postalCode?.message}
          {...register('postalCode')}
        />

        <TextField
          id="location"
          label="Ort oder Stadtteil"
          optional
          autoComplete="address-level2"
          placeholder="Duisburg-Mitte"
          error={errors.location?.message}
          {...register('location')}
        />
      </div>

      <TextField
        id="size"
        label="Ungefähre Größe"
        optional
        className="mt-5"
        placeholder="z. B. 12 Parteien, 4 Etagen, rund 400 m²"
        hint="Eine grobe Angabe genügt. Sie hilft uns, den Aufwand vorab einzuschätzen."
        error={errors.size?.message}
        {...register('size')}
      />

      {/* Data minimisation, said out loud: the street address is the field a
          user expects here and does not have to give. */}
      <p className="mt-6 max-w-copy text-micro text-neutral-500">
        Die genaue Adresse brauchen wir erst, wenn ein Besichtigungstermin
        feststeht.
      </p>
    </StepFrame>
  );
}

/* ---------------------------------------------------------------------------
   4 — Kontakt
   --------------------------------------------------------------------------- */

export function StepContact({ step, headingRef }: StepBodyProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteRequest>();

  return (
    <StepFrame step={step} headingRef={headingRef}>
      <div className="grid gap-5">
        <TextField
          id="name"
          label="Name"
          autoComplete="name"
          placeholder="Vor- und Nachname"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="email"
            label="E-Mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@beispiel.de"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            id="phone"
            label="Telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0203 1234567"
            hint="Rückfragen zum Objekt klären sich am Telefon meist in zwei Minuten."
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <TextField
          id="companyName"
          label="Unternehmen oder Verwaltung"
          optional
          autoComplete="organization"
          placeholder="Musterverwaltung GmbH"
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <TextAreaField
          id="message"
          label="Nachricht"
          optional
          placeholder="Besonderheiten am Objekt, Wunschtermine, Fragen zum Ablauf …"
          hint="Alles, was uns hilft, ein belastbares Angebot zu schreiben."
          error={errors.message?.message}
          {...register('message')}
        />
      </div>
    </StepFrame>
  );
}

/* ---------------------------------------------------------------------------
   5 — Absenden
   --------------------------------------------------------------------------- */

interface SummaryGroupProps {
  title: string;
  /** Step to jump back to. */
  stepIndex: number;
  onEdit: (index: number) => void;
  children: ReactNode;
}

function SummaryGroup({ title, stepIndex, onEdit, children }: SummaryGroupProps) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="text-eyebrow uppercase text-brand-700">{title}</h4>

        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className={cn(
            // -mr/-my keep the 44px hit area without pushing the row apart.
            '-my-2 -mr-2 inline-flex min-h-11 shrink-0 items-center gap-1.5',
            'rounded-[0.75rem] px-2 text-micro text-brand-900',
            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
            'hover:bg-brand-050 focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          )}
        >
          <PencilSimpleIcon size={14} weight="light" aria-hidden="true" />
          Ändern
          <span className="sr-only">: {title}</span>
        </button>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
        {children}
      </dl>
    </div>
  );
}

/** One summary row. Renders nothing when the value was left empty. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!hasValue(value)) return null;

  return (
    <>
      <dt className="text-micro text-neutral-500">{label}</dt>
      <dd className="text-body-sm whitespace-pre-line text-ink">{value}</dd>
    </>
  );
}

export interface StepReviewProps extends StepBodyProps {
  onEdit: (index: number) => void;
  privacyHref: string;
}

/**
 * Review and consent.
 *
 * The summary is not decoration: it is where "back and forward without losing
 * anything" becomes visible. Everything entered in steps one to four is read
 * back from form state, and each block links to the step that produced it.
 */
export function StepReview({
  step,
  headingRef,
  onEdit,
  privacyHref,
}: StepReviewProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<QuoteRequest>();

  const values = useWatch({ control });

  /*
   * The summary mirrors the two stages of step one: one line per selected
   * category, with the individual services the visitor picked inside it.
   *
   * A category chosen without any individual service is shown on its own,
   * because that is a complete and valid answer — not an incomplete one. It
   * deliberately does not print "alle Leistungen": the visitor did not say
   * that, and reading it back to them as if they had is how a summary turns
   * into a claim they never made.
   */
  const selectedItems = values.services ?? [];

  const serviceSummary = (values.serviceCategories ?? []).map((slug) => {
    const category = getServiceCategory(slug);
    const picked = selectedItems
      .filter((itemSlug) => getCategoryOfItem(itemSlug)?.slug === slug)
      .map((itemSlug) => getServiceItem(itemSlug)?.name)
      .filter((name) => name !== undefined);

    return {
      slug,
      label: category?.category ?? slug,
      detail: picked.join(', '),
    };
  });

  const placeLine = [values.postalCode, values.location]
    .filter((part) => hasValue(part))
    .join(' · ');

  return (
    <StepFrame step={step} headingRef={headingRef}>
      <div
        className={cn(
          'imp-bezel bg-brand-050/70 shadow-[var(--shadow-hairline-brand)]',
          '[--bezel-radius:var(--radius-bezel-lg)]',
          '[--bezel-inset:var(--bezel-inset-md)]',
        )}
      >
        <div className="imp-bezel-core bg-white/80 px-5 py-1 shadow-[var(--shadow-bevel)] sm:px-7">
          <div className="divide-y divide-ink/[0.07]">
            <SummaryGroup title="Leistungen" stepIndex={0} onEdit={onEdit}>
              {serviceSummary.map((entry) => (
                <SummaryRow
                  key={entry.slug}
                  label={entry.label}
                  value={entry.detail || 'Umfang wird am Objekt bestimmt'}
                />
              ))}
            </SummaryGroup>

            <SummaryGroup title="Turnus" stepIndex={1} onEdit={onEdit}>
              <SummaryRow
                label="Häufigkeit"
                value={frequencyLabel(values.frequency)}
              />
            </SummaryGroup>

            <SummaryGroup title="Objekt" stepIndex={2} onEdit={onEdit}>
              <SummaryRow
                label="Art"
                value={propertyTypeLabel(values.propertyType)}
              />
              <SummaryRow label="Standort" value={placeLine} />
              <SummaryRow label="Größe" value={values.size ?? ''} />
            </SummaryGroup>

            <SummaryGroup title="Kontakt" stepIndex={3} onEdit={onEdit}>
              <SummaryRow label="Name" value={values.name ?? ''} />
              <SummaryRow label="Unternehmen" value={values.companyName ?? ''} />
              <SummaryRow label="E-Mail" value={values.email ?? ''} />
              <SummaryRow label="Telefon" value={values.phone ?? ''} />
              <SummaryRow label="Nachricht" value={values.message ?? ''} />
            </SummaryGroup>
          </div>
        </div>
      </div>

      <ConsentField
        id="privacyAccepted"
        className="mt-6"
        error={errors.privacyAccepted?.message}
        {...register('privacyAccepted')}
      >
        Ich habe die{' '}
        <ConsentLink href={privacyHref}>Datenschutzerklärung</ConsentLink> zur
        Kenntnis genommen.
      </ConsentField>

      <p className="mt-4 max-w-copy text-micro text-neutral-500">
        Ihre Angaben nutzen wir ausschließlich, um Ihre Anfrage zu bearbeiten.
        Sie werden nicht für Werbung verwendet und nicht an Dritte
        weitergegeben.
      </p>
    </StepFrame>
  );
}

/** The steps in order, so the form can index into them without a switch. */
export const STEP_COUNT = quoteSteps.length;
