import type { CSSProperties, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type BezelRadius = 'sm' | 'md' | 'lg' | 'xl';
export type BezelInset = 'sm' | 'md' | 'lg';
/**
 * `paper` and `tinted` are the two light-section surfaces; `ink` is a filled
 * brand-900 card sitting on a light ground.
 *
 * `inkPlate` and `inkRaised` are the two surfaces a card needs when the
 * *section itself* is brand-900. They share a shell so the outer ring reads
 * identically across a row, and differ only in the core: a plate sits flush
 * with the ground, a raised core lifts off it. Measured on brand-900:
 * plate carries white at 8.08:1 and brand-050 at 7.24:1 (AAA both), raised
 * carries white at 5.75:1 and brand-050 at 5.15:1 (AA both). brand-300 falls
 * to 2.42:1 on a raised core, so on these tones it is a graphic tone only,
 * never text.
 */
export type BezelTone = 'paper' | 'tinted' | 'ink' | 'inkPlate' | 'inkRaised';
export type BezelElevation = 'flat' | 'sm' | 'md' | 'lg' | 'xl';

export interface BezelProps {
  children: ReactNode;
  /** Rendered element of the outer shell. */
  as?: Extract<
    ElementType,
    'div' | 'section' | 'article' | 'aside' | 'li' | 'figure' | 'form' | 'label'
  >;
  /** Outer shell radius. The core radius is derived from it. */
  radius?: BezelRadius;
  /** Gap between shell and core — the visible frame width. */
  inset?: BezelInset;
  tone?: BezelTone;
  elevation?: BezelElevation;
  /**
   * Opt-in hover lift. Off by default: a transition on every card is the
   * generic default and reads as templated.
   */
  interactive?: boolean;
  /** Classes for the outer shell (layout, width, grid placement). */
  className?: string;
  /** Classes for the inner core (padding, content layout). */
  innerClassName?: string;
}

const RADIUS: Record<BezelRadius, string> = {
  sm: 'var(--radius-bezel-sm)',
  md: 'var(--radius-bezel-md)',
  lg: 'var(--radius-bezel-lg)',
  xl: 'var(--radius-bezel-xl)',
};

const INSET: Record<BezelInset, string> = {
  sm: 'var(--bezel-inset-sm)',
  md: 'var(--bezel-inset-md)',
  lg: 'var(--bezel-inset-lg)',
};

/**
 * Shadows are composed into a single `box-shadow` value per element rather
 * than stacked as several `shadow-[…]` utilities — two arbitrary shadow
 * utilities on one element resolve by stylesheet order, not by class order,
 * so the result would be non-deterministic.
 */
const SHELL_AMBIENT: Record<BezelElevation, string | null> = {
  flat: null,
  sm: 'var(--shadow-ambient-sm)',
  md: 'var(--shadow-ambient-md)',
  lg: 'var(--shadow-ambient-lg)',
  xl: 'var(--shadow-ambient-xl)',
};

const SHELL_RING: Record<BezelTone, string> = {
  paper: 'var(--shadow-hairline)',
  tinted: 'var(--shadow-hairline-brand)',
  ink: 'inset 0 0 0 1px rgb(255 255 255 / 0.12)',
  inkPlate: 'inset 0 0 0 1px rgb(255 255 255 / 0.10)',
  inkRaised: 'inset 0 0 0 1px rgb(255 255 255 / 0.14)',
};

/**
 * The two light shells are a translucent brand-ink wash, not a fixed tint.
 *
 * They used to be `bg-brand-050/55` and `bg-brand-050`, which worked while
 * every section shared one paper ground. Once Leistungen, Angebotsformular and
 * FAQ sit on brand-050 themselves, an absolute brand-050 shell is the same
 * colour as the section behind it: the outer ring disappears and the double
 * bezel collapses into a single white card on three of eleven sections.
 *
 * A wash darkens whatever is behind it by a fixed amount instead, so the shell
 * stays one visible step below its ground on paper, on brand-050 and on
 * sand-100 alike. On paper the result is within a point or two of the old
 * value, so nothing above the fold shifts.
 */
const SHELL_SURFACE: Record<BezelTone, string> = {
  paper: 'bg-brand-900/[0.045]',
  tinted: 'bg-brand-900/[0.09]',
  ink: 'bg-brand-900',
  inkPlate: 'bg-white/[0.09]',
  inkRaised: 'bg-white/[0.09]',
};

const CORE_RING: Record<BezelTone, string> = {
  paper: 'var(--shadow-bevel), var(--shadow-hairline)',
  tinted: 'var(--shadow-bevel)',
  ink: 'inset 0 0 0 1px rgb(255 255 255 / 0.08)',
  // The bevel on the light tones is a white top edge. On a dark ground the
  // same read comes from a faint top highlight rather than a full ring.
  inkPlate: 'inset 0 1px 0 0 rgb(255 255 255 / 0.07)',
  inkRaised: 'inset 0 1px 0 0 rgb(255 255 255 / 0.10)',
};

const CORE_SURFACE: Record<BezelTone, string> = {
  paper: 'bg-white',
  tinted: 'bg-white/70',
  ink: 'bg-brand-900 text-paper',
  inkPlate: 'bg-brand-900 text-paper',
  inkRaised: 'bg-white/[0.05] text-paper',
};

/**
 * Double-bezel container: an outer shell wrapping an inner core, with radii
 * that stay concentric by construction (`core = shell − inset`, computed in
 * `.imp-bezel-core`). Every card, form field and image container on the site
 * goes through this, so corner geometry is never eyeballed twice.
 *
 * Server component — no state, no motion.
 */
export function Bezel({
  children,
  as: Tag = 'div',
  radius = 'md',
  inset = 'md',
  tone = 'paper',
  elevation = 'md',
  interactive = false,
  className,
  innerClassName,
}: BezelProps) {
  const shellStyle = {
    '--bezel-radius': RADIUS[radius],
    '--bezel-inset': INSET[inset],
    boxShadow: [SHELL_AMBIENT[elevation], SHELL_RING[tone]]
      .filter(Boolean)
      .join(', '),
  } as CSSProperties;

  return (
    <Tag
      style={shellStyle}
      className={cn(
        'imp-bezel',
        SHELL_SURFACE[tone],
        interactive && 'imp-lift',
        className,
      )}
    >
      <div
        style={{ boxShadow: CORE_RING[tone] }}
        className={cn('imp-bezel-core', CORE_SURFACE[tone], innerClassName)}
      >
        {children}
      </div>
    </Tag>
  );
}
