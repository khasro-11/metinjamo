'use client';

import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
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
import { services } from '@/content/services';
import { cn } from '@/lib/cn';
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

export function StepServices({ step, headingRef }: StepBodyProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteRequest>();

  const error = errors.services?.message;
  const errorId = error ? 'services-error' : undefined;

  return (
    <StepFrame step={step} headingRef={headingRef}>
      {/* A group, not a fieldset: a legend would duplicate the heading that
          already names this step, so `aria-labelledby` points at the real one
          instead of at a second copy of it. */}
      <ChoiceGrid
        role="group"
        labelledBy={`${step.id}-titel`}
        describedBy={errorId}
        className="sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service, index) => (
          <ChoiceCard
            key={service.slug}
            type="checkbox"
            value={service.slug}
            label={service.name}
            // The first card is wide on `lg`, which turns eight items into
            // nine cells — three even rows instead of a five-plus-three
            // orphan, and an asymmetry that echoes the Leistungen bento.
            className={index === 0 ? 'lg:col-span-2' : undefined}
            {...register('services')}
          />
        ))}
      </ChoiceGrid>

      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}

      <p className="mt-6 max-w-copy text-micro text-neutral-500">
        Sie können mehrere Leistungen kombinieren. Was davon sinnvoll ist,
        klären wir bei der Besichtigung.
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

  const selectedServices = (values.services ?? [])
    .map((slug) => services.find((service) => service.slug === slug)?.name)
    .filter((name) => name !== undefined);

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
              <SummaryRow
                label="Ausgewählt"
                value={selectedServices.join('\n')}
              />
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
