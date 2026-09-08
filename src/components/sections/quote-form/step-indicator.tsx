'use client';

import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { motion, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/cn';
import { quoteSteps } from '@/lib/quote-request';
import { DURATION, EASE_IMPERIAL } from '@/lib/motion';

export interface StepIndicatorProps {
  /** Zero-based index of the visible step. */
  current: number;
  /** Highest step the user has unlocked. Everything up to it is navigable. */
  furthest: number;
  onSelect: (index: number) => void;
  /** Locked while a submission is in flight. */
  disabled?: boolean;
}

/**
 * Progress rail above the form.
 *
 * Two renderings of one state, not two components: below `md` the five labels
 * do not fit at a legible size, so the rail collapses to a counter plus a bar
 * rather than shrinking type past the point of usefulness. Both are inside a
 * single `<nav>`; only one is ever in the layout.
 *
 * Completed steps stay clickable, which is the visible half of the promise
 * that going back costs nothing — the form state lives in react-hook-form and
 * survives every jump.
 */
export function StepIndicator({
  current,
  furthest,
  onSelect,
  disabled = false,
}: StepIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const total = quoteSteps.length;
  const progress = (current + 1) / total;

  const barTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: DURATION.base, ease: EASE_IMPERIAL };

  return (
    <nav aria-label="Fortschritt der Angebotsanfrage">
      {/* --- below md ---------------------------------------------------- */}
      <div className="md:hidden">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-eyebrow uppercase text-brand-700" data-numeric>
            Schritt {current + 1} von {total}
          </span>
          <span className="truncate text-body-sm font-medium text-ink">
            {quoteSteps[current].shortLabel}
          </span>
        </p>

        <div
          className={cn(
            'mt-3 h-1 w-full overflow-hidden rounded-pill',
            'bg-brand-050 shadow-[var(--shadow-hairline)]',
          )}
        >
          <motion.span
            aria-hidden="true"
            className="block h-full w-full origin-left rounded-pill bg-brand-900"
            initial={false}
            animate={{ scaleX: progress }}
            transition={barTransition}
          />
        </div>
      </div>

      {/* --- md and up ---------------------------------------------------- */}
      <ol className="hidden grid-cols-5 md:grid">
        {quoteSteps.map((step, index) => {
          const isCurrent = index === current;
          const isComplete = index < current;
          const isReachable = index <= furthest;

          return (
            <li key={step.id} className="relative flex flex-col items-center">
              {/* Connector to the previous chip. Spans exactly one cell width
                  (-50% to +50% of this cell), inset to clear both chips. */}
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute top-[1.125rem] left-[-50%] right-[50%]',
                    'mx-6 h-px -translate-y-1/2',
                    'transition-colors duration-[var(--duration-base)] ease-imperial',
                    index <= current ? 'bg-brand-500/60' : 'bg-ink/10',
                  )}
                />
              ) : null}

              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={disabled || !isReachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group flex w-full flex-col items-center gap-2.5 rounded-[1rem] px-1 py-2',
                  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                  'focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-brand-500',
                  isReachable && !disabled
                    ? 'cursor-pointer'
                    : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'relative z-10 grid size-9 place-items-center rounded-full text-micro',
                    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                    isCurrent &&
                      'bg-brand-900 text-paper shadow-[var(--shadow-ambient-brand)]',
                    isComplete &&
                      'bg-brand-050 text-brand-900 shadow-[var(--shadow-hairline-brand)] group-hover:bg-brand-300/40',
                    !isCurrent &&
                      !isComplete &&
                      'bg-white text-neutral-500 shadow-[var(--shadow-hairline)]',
                  )}
                >
                  {isComplete ? (
                    <CheckIcon size={17} weight="light" aria-hidden="true" />
                  ) : (
                    <span data-numeric>{index + 1}</span>
                  )}
                </span>

                <span
                  className={cn(
                    'text-micro',
                    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                    isCurrent
                      ? 'font-medium text-ink'
                      : isReachable
                        ? 'text-neutral-700'
                        : 'text-neutral-400',
                  )}
                >
                  {step.shortLabel}
                </span>

                {/* The chip already reads as "done"; the word is for anyone
                    who cannot see it. */}
                {isComplete ? (
                  <span className="sr-only">abgeschlossen</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
