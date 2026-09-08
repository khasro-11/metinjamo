'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneTilt';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { FormEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';

import { Bezel, Button } from '@/components/ui';
import { legalNav } from '@/config/navigation';
import { cn } from '@/lib/cn';
import {
  emptyQuoteRequest,
  quoteRequestSchema,
  quoteSteps,
  type QuoteRequest,
} from '@/lib/quote-request';

import { SubmissionError, SubmissionSuccess } from './result-panels';
import { StepIndicator } from './step-indicator';
import {
  StepContact,
  StepFrequency,
  StepProperty,
  StepReview,
  StepServices,
} from './steps';
import { DURATION, EASE_IMPERIAL } from '@/lib/motion';

const LAST_STEP = quoteSteps.length - 1;

const PRIVACY_HREF =
  legalNav.find((link) => link.href === '/datenschutz')?.href ?? '/datenschutz';

type Status = 'editing' | 'submitting' | 'success' | 'error';

/**
 * The multi-step quote request — the primary conversion path of the site.
 *
 * Shape of the thing:
 *
 * - **One form, five views.** `react-hook-form` holds every field from first
 *   render to submit; the step index only decides what is on screen. Going
 *   back is therefore free by construction — there is no per-step state to
 *   restore, because nothing was ever torn down. The review step reads the
 *   same store back out, which makes that guarantee visible.
 * - **Validation per step, schema in one place.** `quoteRequestSchema` is the
 *   only definition of a valid request; `trigger()` runs it against the
 *   current step's fields before advancing, and `app/api/anfrage` runs the
 *   whole thing again server-side, where it actually counts.
 * - **No page reload.** `handleSubmit` calls `preventDefault`, and the form's
 *   own `onSubmit` routes the event to "advance" or "send" depending on the
 *   step — so pressing Enter in a text field does the obvious thing instead
 *   of submitting a half-filled request.
 * - **Focus follows the step.** Every step change moves focus to the new
 *   heading through a callback ref, which fires when the incoming panel
 *   actually mounts — an effect would run while the outgoing panel is still
 *   animating out and find nothing to focus.
 */
export function QuoteForm() {
  const prefersReducedMotion = useReducedMotion();

  const methods = useForm<QuoteRequest>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: emptyQuoteRequest,
    // Errors appear once a field has been left, never while it is still being
    // typed into, and clear as soon as the input becomes valid again.
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const [step, setStep] = useState(0);
  /** Highest step reached — everything up to it stays navigable. */
  const [furthest, setFurthest] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<Status>('editing');

  const busy = status === 'submitting';

  /* --- focus ------------------------------------------------------------- */

  const wantsFocus = useRef(false);

  /**
   * Focuses the incoming heading, but only when a step change or a status
   * change asked for it — never on first mount, which would steal focus from
   * the page on load.
   */
  const headingRef = useCallback((node: HTMLHeadingElement | null) => {
    if (node && wantsFocus.current) {
      wantsFocus.current = false;
      node.focus();
    }
  }, []);

  /* --- navigation -------------------------------------------------------- */

  const goToStep = useCallback(
    (next: number) => {
      // Direction only drives which way the panel slides, so it is derived
      // from the step being left rather than tracked as its own history.
      setDirection(next > step ? 1 : -1);
      setStep(next);
      setFurthest((previous) => Math.max(previous, next));
      wantsFocus.current = true;
    },
    [step],
  );

  /** Validates the visible step, then advances. */
  const goForward = useCallback(async () => {
    const valid = await methods.trigger(quoteSteps[step].fields, {
      shouldFocus: true,
    });
    if (!valid) return;
    goToStep(step + 1);
  }, [goToStep, methods, step]);

  const goBack = useCallback(() => {
    if (step > 0) goToStep(step - 1);
  }, [goToStep, step]);

  /**
   * Jump from the indicator. Moving forward still has to clear the visible
   * step — the user may have gone back and emptied a field that was valid
   * when they first passed it.
   */
  const handleSelectStep = useCallback(
    async (index: number) => {
      if (index === step || busy) return;
      if (index > step) {
        const valid = await methods.trigger(quoteSteps[step].fields, {
          shouldFocus: true,
        });
        if (!valid) return;
      }
      goToStep(index);
    },
    [busy, goToStep, methods, step],
  );

  /* --- submission -------------------------------------------------------- */

  const sendRequest = useCallback(async (values: QuoteRequest) => {
    setStatus('submitting');

    try {
      const response = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      wantsFocus.current = true;
      setStatus('success');
    } catch {
      // Nothing is logged: the failure carries the user's own data, and a
      // console entry is the easiest way for it to end up somewhere it should
      // not be. The panel tells the user what happened; that is enough.
      wantsFocus.current = true;
      setStatus('error');
    }
  }, []);

  /**
   * Submit was rejected by the schema. If the offending field lives on an
   * earlier step, go there — `shouldFocusError` cannot focus an input that is
   * not currently mounted, and a submit button that silently does nothing is
   * the worst possible outcome here.
   */
  const handleInvalid = useCallback(
    (errors: FieldErrors<QuoteRequest>) => {
      const firstBrokenStep = quoteSteps.findIndex((candidate) =>
        candidate.fields.some((field) => field in errors),
      );

      if (firstBrokenStep >= 0 && firstBrokenStep !== step) {
        goToStep(firstBrokenStep);
      }
    },
    [goToStep, step],
  );

  /**
   * The submit handler is built at call time, not during render: both of the
   * callbacks it closes over read `wantsFocus`, and composing them while
   * rendering is exactly the ref access React warns about.
   */
  function runSubmit(event?: FormEvent<HTMLFormElement>) {
    void methods.handleSubmit(sendRequest, handleInvalid)(event);
  }

  /**
   * One entry point for both the "Weiter" button and implicit submission via
   * the Enter key, so the two can never diverge.
   */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (step !== LAST_STEP) {
      event.preventDefault();
      void goForward();
      return;
    }
    runSubmit(event);
  }

  function handleRetry() {
    setStatus('editing');
    runSubmit();
  }

  function handleBackToForm() {
    wantsFocus.current = true;
    setStatus('editing');
  }

  /* --- rendering --------------------------------------------------------- */

  const currentStep = quoteSteps[step];

  function renderStep() {
    switch (step) {
      case 0:
        return <StepServices step={currentStep} headingRef={headingRef} />;
      case 1:
        return <StepFrequency step={currentStep} headingRef={headingRef} />;
      case 2:
        return <StepProperty step={currentStep} headingRef={headingRef} />;
      case 3:
        return <StepContact step={currentStep} headingRef={headingRef} />;
      default:
        return (
          <StepReview
            step={currentStep}
            headingRef={headingRef}
            onEdit={(index) => void handleSelectStep(index)}
            privacyHref={PRIVACY_HREF}
          />
        );
    }
  }

  const stepBody = prefersReducedMotion ? (
    // No wrapper at all rather than a zero-duration animation: nothing can be
    // left stranded at opacity 0 if an animation never resolves.
    <div key={step}>{renderStep()}</div>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: direction * 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -20 }}
        transition={{
          duration: DURATION.base,
          ease: EASE_IMPERIAL,
          opacity: { duration: DURATION.swift },
        }}
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <Bezel
      radius="xl"
      inset="lg"
      tone="paper"
      elevation="xl"
      innerClassName="p-6 sm:p-9 md:p-11 lg:p-12"
    >
      {status === 'success' ? (
        <SubmissionSuccess headingRef={headingRef} />
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit} noValidate>
            <StepIndicator
              current={step}
              furthest={furthest}
              onSelect={(index) => void handleSelectStep(index)}
              disabled={busy}
            />

            <div
              aria-hidden="true"
              className="mt-7 h-px w-full bg-[linear-gradient(90deg,transparent,rgb(15_27_36/0.09),transparent)] md:mt-8"
            />

            {/* A floor under the panel so the card does not collapse and
                spring back while one step swaps for another. Height itself is
                never animated — only transform and opacity are. */}
            <div className="mt-8 min-h-[28rem] sm:min-h-[26rem] md:mt-10">
              {status === 'error' ? (
                <SubmissionError
                  headingRef={headingRef}
                  onRetry={handleRetry}
                  onBack={handleBackToForm}
                  busy={busy}
                />
              ) : (
                stepBody
              )}
            </div>

            {status === 'error' ? null : (
              <footer className="mt-10 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0 || busy}
                  className={cn(
                    'group inline-flex min-h-12 items-center justify-center gap-2.5',
                    'rounded-pill px-5 text-body-sm text-brand-900',
                    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                    'hover:bg-brand-050 focus-visible:outline-2',
                    'focus-visible:outline-offset-3 focus-visible:outline-brand-500',
                    // Hidden from the tree rather than removed, so the footer
                    // does not reflow between step one and step two.
                    step === 0 && 'invisible',
                    'disabled:pointer-events-none',
                    busy && step > 0 && 'opacity-55',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-full bg-brand-050',
                      'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                      'group-hover:bg-brand-300',
                    )}
                  >
                    <ArrowLeftIcon size={14} weight="light" />
                  </span>
                  Zurück
                </button>

                <Button
                  type="submit"
                  size="lg"
                  disabled={busy}
                  magnetic={!busy}
                  // `undefined` falls through to the Button's own default
                  // arrow, which is the right mark for "Weiter".
                  icon={step === LAST_STEP ? PaperPlaneTiltIcon : undefined}
                  className="w-full sm:w-auto"
                >
                  {step === LAST_STEP
                    ? busy
                      ? 'Wird gesendet …'
                      : 'Anfrage absenden'
                    : 'Weiter'}
                </Button>
              </footer>
            )}
          </form>
        </FormProvider>
      )}
    </Bezel>
  );
}
