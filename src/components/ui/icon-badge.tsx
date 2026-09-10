import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconBadgeTone = 'light' | 'dark';

export interface IconBadgeProps {
  children: ReactNode;
  size?: IconBadgeSize;
  /** `dark` for the brand-900 anchor sections and the filled bento tiles. */
  tone?: IconBadgeTone;
  className?: string;
}

const SIZE: Record<IconBadgeSize, string> = {
  sm: 'size-9',
  md: 'size-11',
  lg: 'size-14',
  xl: 'size-16',
};

/**
 * Two surfaces, one idiom.
 *
 * Light: brand-700 on brand-050, 5.18:1. Well past the 3:1 a graphic needs,
 * and the same pairing the eyebrow pill and the nested CTA arrow already use.
 *
 * Dark: the accent, filled. brand-900 on brand-300 measures 3.41:1, which
 * clears 3:1, and a filled accent circle is the brightest thing on a dark
 * surface rather than the dimmest. The alternative, a brand-300 glyph on a
 * white/10 wash, measures 2.65:1 and would have been the weaker mark as well
 * as the failing one. This is the same treatment the terminal node in Ablauf
 * carries, so the two dark contexts share one language.
 */
const TONE: Record<IconBadgeTone, string> = {
  light: 'bg-brand-050 text-brand-700 shadow-[var(--shadow-hairline-brand)]',
  dark: 'bg-brand-300 text-brand-900 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.35)]',
};

/**
 * The round container every icon on the site sits in (CLAUDE.md 5.9). Icons
 * standing free on a surface read as clip art; the same glyph inside a filled
 * circle reads as a mark the layout put there.
 *
 * Server component.
 */
export function IconBadge({
  children,
  size = 'md',
  tone = 'light',
  className,
}: IconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full',
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
