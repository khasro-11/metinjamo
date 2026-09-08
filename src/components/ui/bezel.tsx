import type { CSSProperties, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type BezelRadius = 'sm' | 'md' | 'lg' | 'xl';
export type BezelInset = 'sm' | 'md' | 'lg';
export type BezelTone = 'paper' | 'tinted' | 'ink';
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
};

const SHELL_SURFACE: Record<BezelTone, string> = {
  paper: 'bg-brand-050/55',
  tinted: 'bg-brand-050',
  ink: 'bg-brand-900',
};

const CORE_RING: Record<BezelTone, string> = {
  paper: 'var(--shadow-bevel), var(--shadow-hairline)',
  tinted: 'var(--shadow-bevel)',
  ink: 'inset 0 0 0 1px rgb(255 255 255 / 0.08)',
};

const CORE_SURFACE: Record<BezelTone, string> = {
  paper: 'bg-white',
  tinted: 'bg-white/70',
  ink: 'bg-brand-900 text-paper',
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
