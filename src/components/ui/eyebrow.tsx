import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { WindowMark } from './window-mark';

export type EyebrowVariant = 'pill' | 'bare';

export interface EyebrowProps {
  children: ReactNode;
  as?: Extract<ElementType, 'p' | 'span' | 'div'>;
  variant?: EyebrowVariant;
  /** Hide the window mark where the eyebrow sits inside an already busy row. */
  showMark?: boolean;
  className?: string;
}

/**
 * The label above an H2 (CLAUDE.md 5.8): 10px, uppercase, 0.2em tracking.
 *
 * Colour is brand-700 on brand-050 — 5.18:1, AA for text this small. The
 * uppercase tracking is a deliberate house rule from the brief, so the marker
 * is the brand's window motif rather than a generic bullet.
 */
export function Eyebrow({
  children,
  as: Tag = 'p',
  variant = 'pill',
  showMark = true,
  className,
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'inline-flex items-center gap-2 text-eyebrow uppercase text-brand-700',
        variant === 'pill' &&
          'rounded-pill bg-brand-050 px-3 py-[0.4375rem] shadow-[var(--shadow-hairline-brand)]',
        className,
      )}
    >
      {showMark ? <WindowMark className="text-brand-300" /> : null}
      {/* The trailing tracking of the last glyph would otherwise push the
          text off-centre inside the pill. */}
      <span className="-mr-[0.2em]">{children}</span>
    </Tag>
  );
}
