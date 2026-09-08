'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

/**
 * The light behind the hero's window raster.
 *
 * The composition is a light study, not an illustration: a paper-to-brand wash,
 * one diffuse daylight source in the upper right, and a broad sheen across the
 * glass. It is the one thing a building-services company actually sells a
 * picture of, and it stays abstract, so it cannot age into a wrong claim the
 * way a stock photo of a stranger with a squeegee would.
 *
 * Isolated as a client leaf purely because of the scroll drift. Scroll progress
 * comes from `useScroll` (IntersectionObserver / rAF inside Motion), never from
 * a scroll listener, and drives `y` on two layers — transform only, no repaint.
 * Under `prefers-reduced-motion` the layers render at their rest position.
 */
export function HeroLight() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Counter-drifting layers: the light source sinks while the sheen rises, so
  // the field reads as depth rather than as one flat image being panned.
  const glowY = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);
  const sheenY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(163deg, #ffffff 0%, #ffffff 34%, var(--color-brand-050) 100%)',
        }}
      />

      {/* Daylight. The accent blue appears here at low alpha, which is the
          sparse, non-flat use CLAUDE.md 4 reserves it for. */}
      <motion.div
        className="absolute inset-x-0 -inset-y-[10%]"
        style={{
          y: prefersReducedMotion ? undefined : glowY,
          backgroundImage:
            'radial-gradient(56% 44% at 72% 20%, rgb(69 179 231 / 0.32) 0%, rgb(69 179 231 / 0.11) 44%, transparent 74%)',
        }}
      />

      {/* Sheen across the pane. Wide and soft, so it reads as glass rather than
          as a gradient effect. */}
      <motion.div
        className="absolute inset-x-0 -inset-y-[10%]"
        style={{
          y: prefersReducedMotion ? undefined : sheenY,
          backgroundImage:
            'linear-gradient(107deg, transparent 36%, rgb(255 255 255 / 0.7) 50%, transparent 64%)',
        }}
      />

      {/* Weight at the bottom edge, so the field sits down rather than floating
          off the page. */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 0%, rgb(20 84 126 / 0.07) 100%)',
        }}
      />
    </div>
  );
}
