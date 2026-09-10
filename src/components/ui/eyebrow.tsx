import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { WindowMark } from './window-mark';

export type EyebrowVariant = 'pill' | 'bare';
/** `light` for the paper, brand-050 and sand-100 sections; `dark` for the two
 *  brand-900 anchor sections. */
export type EyebrowTone = 'light' | 'dark' | 'sand';

export interface EyebrowProps {
  children: ReactNode;
  as?: Extract<ElementType, 'p' | 'span' | 'div'>;
  variant?: EyebrowVariant;
  tone?: EyebrowTone;
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
 *
 * On the two brand-900 anchor sections the same pill inverts: brand-050 on a
 * white/10 wash measures 5.63:1, so 10px text stays AA there too. brand-700
 * would have been 1.4:1 on that ground, which is why the tone is a prop rather
 * than something a caller can forget.
 *
 * `sand` belongs to the one warm section. It is the only place the ochre
 * appears as type, and it is sand-700 rather than sand-500 doing it: on the
 * white/70 pill sand-700 measures 5.20:1 and sand-500 measures 2.32:1, so at
 * 10px only one of the two is legible. sand-500 stays on the window mark,
 * which is decorative.
 */
export function Eyebrow({
  children,
  as: Tag = 'p',
  variant = 'pill',
  tone = 'light',
  showMark = true,
  className,
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'inline-flex items-center gap-2 text-eyebrow uppercase',
        tone === 'dark' && 'text-brand-050',
        tone === 'sand' && 'text-sand-700',
        tone === 'light' && 'text-brand-700',
        variant === 'pill' && 'rounded-pill px-3 py-[0.4375rem]',
        variant === 'pill' &&
          tone === 'dark' &&
          'bg-white/10 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]',
        variant === 'pill' &&
          tone === 'sand' &&
          'bg-white/70 shadow-[inset_0_0_0_1px_rgb(133_101_18/0.16)]',
        variant === 'pill' &&
          tone === 'light' &&
          'bg-brand-050 shadow-[var(--shadow-hairline-brand)]',
        className,
      )}
    >
      {showMark ? (
        <WindowMark
          className={tone === 'sand' ? 'text-sand-500' : 'text-brand-300'}
        />
      ) : null}
      {/* The trailing tracking of the last glyph would otherwise push the
          text off-centre inside the pill. */}
      <span className="-mr-[0.2em]">{children}</span>
    </Tag>
  );
}
