import type { CSSProperties, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type EntranceTag =
  | 'div'
  | 'p'
  | 'li'
  | 'span'
  | 'nav'
  | 'header'
  | 'section';

export interface EntranceProps {
  children: ReactNode;
  as?: EntranceTag;
  /** Milliseconds. Stagger siblings with `index * 40`. */
  delay?: number;
  /** Travel in px. `0` gives a pure fade. */
  distance?: number;
  className?: string;
}

/**
 * The above-the-fold counterpart to <Reveal>.
 *
 * Same visual grammar — a short rise on the house curve — but driven entirely
 * by CSS, so it costs no JavaScript and, crucially, does not wait for any.
 * <Reveal> serialises `opacity: 0` into the SSR HTML and only lifts it once
 * React has hydrated and an IntersectionObserver has fired; used on the hero
 * that leaves the first screen empty for the whole of hydration. This animates
 * from the first paint instead.
 *
 * The rule for which to use is the fold, not the effect:
 *
 *   above the fold, visible on load  ->  <Entrance>
 *   below the fold, reached by scroll ->  <Reveal>
 *
 * Reduced motion is handled by the global reset in globals.css, which zeroes
 * both the duration and the delay, so the content is simply there.
 *
 * Server component by design. Making this a client component would defeat its
 * entire purpose.
 */
export function Entrance({
  children,
  as: Tag = 'div',
  delay = 0,
  distance = 12,
  className,
}: EntranceProps) {
  const Element = Tag as ElementType;

  return (
    <Element
      className={cn('imp-enter', className)}
      style={
        {
          '--enter-delay': `${delay}ms`,
          '--enter-distance': `${distance}px`,
        } as CSSProperties
      }
    >
      {children}
    </Element>
  );
}
