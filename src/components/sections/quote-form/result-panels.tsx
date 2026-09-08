'use client';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { PhoneCallIcon } from '@phosphor-icons/react/dist/ssr/PhoneCall';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import type { ReactNode, Ref } from 'react';

import { Button } from '@/components/ui';
import { company } from '@/config/company';
import { cn } from '@/lib/cn';

/**
 * The round icon plate both panels open with. A nested wrapper rather than a
 * bare glyph, so the result state uses the same "icon inside its own disc"
 * idiom as the CTA buttons instead of inventing a second one.
 */
function ResultMark({
  tone,
  children,
}: {
  tone: 'brand' | 'danger';
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-16 place-items-center rounded-full',
        tone === 'brand'
          ? 'bg-brand-050 shadow-[var(--shadow-hairline-brand)]'
          : 'bg-danger-050 shadow-[inset_0_0_0_1px_rgb(156_47_39/0.18)]',
      )}
    >
      <span
        className={cn(
          'grid size-10 place-items-center rounded-full',
          tone === 'brand'
            ? 'bg-brand-900 text-brand-300 shadow-[var(--shadow-ambient-brand)]'
            : 'bg-danger-700 text-danger-050',
        )}
      >
        {children}
      </span>
    </span>
  );
}

/** The phone line both panels fall back to. Values come from company.ts. */
function PhoneFallback({ className }: { className?: string }) {
  const officeHours = company.openingHours[0];

  return (
    <p className={cn('text-body-sm text-neutral-700', className)}>
      Lieber direkt sprechen? Rufen Sie uns an unter{' '}
      <a
        href={company.phone.href}
        className={cn(
          'rounded-[0.25rem] font-medium whitespace-nowrap text-brand-900',
          'underline decoration-brand-300 underline-offset-4',
          'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
          'hover:decoration-brand-900',
        )}
      >
        {company.phone.display}
      </a>
      , {officeHours.daysLabel} {officeHours.timeLabel}.
    </p>
  );
}

export interface SubmissionSuccessProps {
  headingRef: Ref<HTMLHeadingElement>;
}

/**
 * Success.
 *
 * Deliberately makes no promise the company has not agreed to: no response
 * time in hours, no ticket number, no "one of our experts". It states what
 * was received, what happens next in general terms, and how to reach a person
 * faster — all of which are true today.
 *
 * TODO (client, CLAUDE.md 12): if a binding response time is agreed ("wir
 * melden uns innerhalb von 24 Stunden"), it belongs in the second paragraph.
 * Until then it stays out — an unmet promise here is a § 5 UWG problem.
 *
 * TODO (delivery): this panel tells the customer their request has arrived.
 * That only becomes true once the mail provider in `app/api/anfrage/route.ts`
 * is wired up; the route currently validates and returns 202 without sending
 * anything. This form must not go live before that TODO is closed.
 */
export function SubmissionSuccess({ headingRef }: SubmissionSuccessProps) {
  return (
    <div className="py-6 text-center sm:py-10">
      <div className="flex justify-center">
        <ResultMark tone="brand">
          <CheckIcon size={24} weight="light" />
        </ResultMark>
      </div>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 text-title-md sm:text-title-lg"
      >
        Ihre Anfrage ist angekommen.
      </h3>

      <p className="mx-auto mt-5 max-w-copy text-body text-neutral-700">
        Wir sehen uns Ihre Angaben an und melden uns zu den Geschäftszeiten bei
        Ihnen. Für Rückfragen zum Objekt rufen wir in der Regel an — das klärt
        sich schneller als über mehrere Mails.
      </p>

      <p className="mx-auto mt-4 max-w-copy text-body-sm text-neutral-500">
        Ein Angebot schreiben wir erst, wenn wir das Objekt gesehen oder
        ausreichend beschrieben bekommen haben. Pauschalpreise ohne
        Objektkenntnis wären nicht belastbar.
      </p>

      <div className="mt-9 flex justify-center">
        <Button
          href={company.phone.href}
          variant="secondary"
          size="md"
          icon={PhoneCallIcon}
          magnetic={false}
        >
          {company.phone.display}
        </Button>
      </div>
    </div>
  );
}

export interface SubmissionErrorProps {
  headingRef: Ref<HTMLHeadingElement>;
  onRetry: () => void;
  onBack: () => void;
  /** True while the retry request is in flight. */
  busy: boolean;
}

/**
 * Failure.
 *
 * The form state behind this panel is untouched, and the copy says so: the
 * single worst thing a failed submission can do is make the user believe four
 * steps of typing are gone. Both ways out are offered — retry, or go back to
 * the answers and use the phone instead.
 */
export function SubmissionError({
  headingRef,
  onRetry,
  onBack,
  busy,
}: SubmissionErrorProps) {
  return (
    <div className="py-6 text-center sm:py-10">
      <div className="flex justify-center">
        <ResultMark tone="danger">
          <WarningCircleIcon size={24} weight="light" />
        </ResultMark>
      </div>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 text-title-md sm:text-title-lg"
      >
        Das Senden hat nicht geklappt.
      </h3>

      <p className="mx-auto mt-5 max-w-copy text-body text-neutral-700">
        Ihre Anfrage hat uns nicht erreicht — vermutlich lag es an der
        Verbindung.{' '}
        <strong className="font-medium text-ink">
          Ihre Angaben sind vollständig erhalten
        </strong>{' '}
        und stehen unverändert im Formular.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          onClick={onRetry}
          disabled={busy}
          icon={ArrowClockwiseIcon}
          size="md"
          magnetic={false}
        >
          {busy ? 'Wird gesendet …' : 'Erneut senden'}
        </Button>

        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className={cn(
            'inline-flex min-h-11 items-center rounded-pill px-5 text-body-sm',
            'text-brand-900',
            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
            'hover:bg-brand-050 focus-visible:outline-2',
            'focus-visible:outline-offset-3 focus-visible:outline-brand-500',
            'disabled:pointer-events-none disabled:opacity-55',
          )}
        >
          Zurück zu meinen Angaben
        </button>
      </div>

      <PhoneFallback className="mx-auto mt-8 max-w-copy" />
    </div>
  );
}
