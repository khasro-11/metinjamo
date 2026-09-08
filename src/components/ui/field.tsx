'use client';

import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import type {
  InputHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

/* ---------------------------------------------------------------------------
   Ring system

   Every field is a double bezel, so the state ring sits on the *shell* while
   the input is the core. Two rules keep that deterministic:

   1. The ring is one custom property, `--field-ring`, and exactly one utility
      ever sets it — the caller picks base / checked / error in JS. Two
      arbitrary `shadow-[…]` utilities on one element would resolve by
      stylesheet order rather than by class order (see the note in bezel.tsx),
      and a field that sometimes shows its error ring is worse than no ring.
   2. Focus is an `outline`, not a shadow. A different property cannot collide
      with the ring, and it reuses the exact treatment `:focus-visible` already
      applies globally — 2px brand-500 at 3px offset — so a focused field looks
      like every other focused thing on the site, just drawn around the shell
      instead of around the inner input.

   All ring values are non-inset with zero offset, so the browser interpolates
   between them instead of snapping.
   --------------------------------------------------------------------------- */

const SHELL_BASE = cn(
  'imp-bezel block',
  '[--bezel-radius:var(--radius-bezel-sm)] [--bezel-inset:var(--bezel-inset-sm)]',
  'bg-brand-050/60',
  'transition-shadow duration-[var(--duration-swift)] ease-imperial-soft',
  '[--field-glow:0_10px_28px_-20px_rgb(15_27_36/0.28)]',
  'has-[:focus-visible]:[--field-glow:0_14px_34px_-16px_rgb(46_134_193/0.45)]',
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3',
  'has-[:focus-visible]:outline-brand-500',
  'shadow-[var(--field-ring),var(--field-glow)]',
);

const RING_NEUTRAL = '[--field-ring:0_0_0_1px_rgb(15_27_36/0.07)]';
const RING_ERROR = '[--field-ring:0_0_0_1.5px_var(--color-danger-700)]';
const RING_CHECKED = 'has-[:checked]:[--field-ring:0_0_0_1.5px_var(--color-brand-500)]';

const CORE_BASE = cn(
  'imp-bezel-core bg-white shadow-[var(--shadow-bevel)]',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
);

/** 52px — clears the 44px touch target with room for the bezel inset. */
const CONTROL_HEIGHT = 'h-[3.25rem]';

/* ---------------------------------------------------------------------------
   Label, hint and error
   --------------------------------------------------------------------------- */

interface FieldMessageIds {
  readonly hintId?: string;
  readonly errorId?: string;
}

/** `aria-describedby` value, or undefined when there is nothing to point at. */
function describedBy({ hintId, errorId }: FieldMessageIds): string | undefined {
  const ids = [hintId, errorId].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-body-sm font-medium text-ink">
      {children}
      {optional ? (
        // Data minimisation is only credible if the user can see which fields
        // they are free to skip, so "optional" is stated rather than implied
        // by the absence of an asterisk.
        <span className="ml-1.5 font-normal text-neutral-500">(optional)</span>
      ) : null}
    </label>
  );
}

function FieldHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-micro text-neutral-500">
      {children}
    </p>
  );
}

/**
 * The error line. Icon plus text, never colour alone — `--color-danger-700` is
 * the only non-brand hue on the site and it is not allowed to be the sole
 * carrier of the message.
 *
 * `role="alert"` is on the element that only exists while there is an error,
 * so it is announced when it appears rather than on every render.
 */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-micro text-danger-700"
    >
      <WarningCircleIcon
        size={15}
        weight="light"
        aria-hidden="true"
        className="mt-px shrink-0"
      />
      <span>{children}</span>
    </p>
  );
}

/* ---------------------------------------------------------------------------
   Text and textarea
   --------------------------------------------------------------------------- */

interface TextFieldBaseProps {
  id: string;
  label: string;
  /** One line under the field. Not a substitute for the label. */
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
}

export type TextFieldProps = TextFieldBaseProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'className' | 'aria-describedby' | 'aria-invalid'
  > & { ref?: Ref<HTMLInputElement> };

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...input
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>

      <div className={cn(SHELL_BASE, 'mt-2', error ? RING_ERROR : RING_NEUTRAL)}>
        <input
          {...input}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ hintId, errorId })}
          className={cn(
            CORE_BASE,
            CONTROL_HEIGHT,
            'w-full px-4 text-body text-ink',
            'placeholder:text-neutral-400 focus-visible:outline-none',
          )}
        />
      </div>

      {hint ? <FieldHint id={hintId!}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </div>
  );
}

export type TextAreaFieldProps = TextFieldBaseProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'id' | 'className' | 'aria-describedby' | 'aria-invalid'
  > & { ref?: Ref<HTMLTextAreaElement> };

export function TextAreaField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...textarea
}: TextAreaFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>

      <div className={cn(SHELL_BASE, 'mt-2', error ? RING_ERROR : RING_NEUTRAL)}>
        <textarea
          {...textarea}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ hintId, errorId })}
          className={cn(
            CORE_BASE,
            'block min-h-[9rem] w-full resize-y px-4 py-3.5 text-body text-ink',
            'placeholder:text-neutral-400 focus-visible:outline-none',
          )}
        />
      </div>

      {hint ? <FieldHint id={hintId!}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Choice card
   --------------------------------------------------------------------------- */

export interface ChoiceCardProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'type' | 'children'
  > {
  type: 'checkbox' | 'radio';
  label: string;
  /** One short line under the label. */
  hint?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * A selectable card wrapping a real `<input>`.
 *
 * The input is `sr-only` rather than `hidden` or `appearance-none`: it keeps
 * its native role, its native keyboard behaviour (arrow keys inside a radio
 * group, space to toggle) and its place in the tab order, and the card is
 * merely its label. Nothing here reimplements a control.
 *
 * State flows from `:checked` through `group-has-[…]` on the label, so the
 * visuals follow the DOM rather than a React copy of it — the card cannot
 * disagree with the input it describes.
 */
export function ChoiceCard({
  type,
  label,
  hint,
  className,
  ref,
  ...input
}: ChoiceCardProps) {
  const isRadio = type === 'radio';

  return (
    <label
      className={cn(
        SHELL_BASE,
        RING_NEUTRAL,
        RING_CHECKED,
        'group relative cursor-pointer',
        className,
      )}
    >
      <input {...input} ref={ref} type={type} className="peer sr-only" />

      <span
        className={cn(
          CORE_BASE,
          'flex h-full items-start gap-3.5 p-4 sm:p-5',
          'group-has-[:checked]:bg-brand-050',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'mt-px grid size-[1.375rem] shrink-0 place-items-center',
            isRadio ? 'rounded-full' : 'rounded-[0.5rem]',
            'bg-white shadow-[inset_0_0_0_1.5px_rgb(15_27_36/0.16)]',
            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
            'group-hover:shadow-[inset_0_0_0_1.5px_var(--color-brand-300)]',
            'group-has-[:checked]:bg-brand-900',
            'group-has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--color-brand-900)]',
          )}
        >
          {/* Transform and opacity only — the mark scales up out of the box
              rather than the box changing size. */}
          <span
            className={cn(
              'scale-50 opacity-0',
              'transition-[transform,opacity] duration-[var(--duration-swift)] ease-imperial',
              'group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100',
              isRadio && 'size-[0.5rem] rounded-full bg-brand-300',
            )}
          >
            {isRadio ? null : (
              <CheckIcon size={15} weight="light" className="text-brand-300" />
            )}
          </span>
        </span>

        <span className="min-w-0">
          <span className="block text-body-sm font-medium text-ink">{label}</span>
          {hint ? (
            <span className="mt-1 block text-micro text-neutral-500">{hint}</span>
          ) : null}
        </span>
      </span>
    </label>
  );
}

/* ---------------------------------------------------------------------------
   Consent checkbox
   --------------------------------------------------------------------------- */

export interface ConsentFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'type' | 'children'
  > {
  id: string;
  /** Full sentence, including the link element. */
  children: ReactNode;
  error?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * The mandatory privacy checkbox.
 *
 * The link sits inside the `<label>` so the accessible name is the whole
 * sentence rather than a version with a hole in it. That makes the label's
 * click-to-toggle behaviour fight the link, so the anchor stops the click from
 * propagating — the one place on the site where that is the correct trade.
 */
export function ConsentField({
  id,
  children,
  error,
  className,
  ref,
  ...input
}: ConsentFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label
        className={cn(
          SHELL_BASE,
          error ? RING_ERROR : RING_NEUTRAL,
          'group cursor-pointer',
        )}
      >
        <input
          {...input}
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="peer sr-only"
        />

        <span className={cn(CORE_BASE, 'flex items-start gap-3.5 p-4 sm:p-5')}>
          <span
            aria-hidden="true"
            className={cn(
              'mt-px grid size-[1.375rem] shrink-0 place-items-center rounded-[0.5rem]',
              'bg-white shadow-[inset_0_0_0_1.5px_rgb(15_27_36/0.16)]',
              'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
              'group-hover:shadow-[inset_0_0_0_1.5px_var(--color-brand-300)]',
              'group-has-[:checked]:bg-brand-900',
              'group-has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--color-brand-900)]',
            )}
          >
            <span
              className={cn(
                'scale-50 opacity-0',
                'transition-[transform,opacity] duration-[var(--duration-swift)] ease-imperial',
                'group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100',
              )}
            >
              <CheckIcon size={15} weight="light" className="text-brand-300" />
            </span>
          </span>

          <span className="text-body-sm text-neutral-700">{children}</span>
        </span>
      </label>

      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </div>
  );
}

/**
 * Anchor for use inside `ConsentField`. Opens in a new tab and swallows the
 * click, so following it neither toggles the checkbox nor unmounts a form the
 * user has spent four steps filling in.
 */
export function ConsentLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  function keepFormState(event: ReactMouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={keepFormState}
      className={cn(
        'rounded-[0.25rem] font-medium text-brand-900 underline decoration-brand-300',
        'underline-offset-4 transition-colors duration-[var(--duration-swift)]',
        'ease-imperial-soft hover:decoration-brand-900',
      )}
    >
      {children}
      <span className="sr-only"> (öffnet in einem neuen Tab)</span>
    </a>
  );
}
