'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ElementType, ReactNode } from 'react';

import { DURATION, EASE_IMPERIAL } from '@/lib/motion';

/**
 * Only the tags we actually reveal. A lookup keeps the motion component
 * identity stable across renders — `motion.create(tag)` inside the body would
 * remount the subtree on every render.
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as const;

export type RevealTag = keyof typeof MOTION_TAGS;

export interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  /** Anchor target. Set it here rather than on a wrapper — the revealed
      element is the grid/flow item, so the jump lands on the real box. */
  id?: string;
  /** Seconds. Stagger siblings with `index * STAGGER.list`. */
  delay?: number;
  /** Travel in px. `0` gives a pure fade. */
  distance?: number;
  /** Reveal once (default) or every time the element re-enters the viewport. */
  once?: boolean;
  /** Fraction of the element that must be visible before it fires. */
  amount?: number;
  className?: string;
}

/**
 * Scroll reveal via Motion's `whileInView`, which is backed by
 * IntersectionObserver — never a scroll listener. Animates transform and
 * opacity only.
 *
 * Under `prefers-reduced-motion` the plain element is rendered instead: no
 * initial hidden state, so content is never trapped at opacity 0 if an
 * observer never fires.
 */
export function Reveal({
  children,
  as = 'div',
  id,
  delay = 0,
  distance = 24,
  once = true,
  amount = 0.3,
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = as as ElementType;
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      id={id}
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: DURATION.slow, delay, ease: EASE_IMPERIAL }}
    >
      {children}
    </MotionTag>
  );
}
