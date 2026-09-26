import Image from 'next/image';

import { cn } from '@/lib/cn';

/**
 * The hero's picture collage: three stadium capsules, each on its own tinted
 * ground, staggered rather than aligned.
 *
 * ## The images are placeholders
 *
 * TODO (client, CLAUDE.md 12): every path below is a stand-in taken from the
 * service catalogue's own photography so the composition renders with real
 * pixels instead of grey boxes. They are scenes, and the reference wants
 * portraits. Replace them here and nowhere else — the paths are collected in
 * `CAPSULES` for exactly that reason.
 *
 * If the replacements are cut-out PNGs, add `overflow-visible` to the capsule
 * and let the subject break the top edge: the capsule keeps its own
 * background, so a figure rising out of it reads as intended rather than as
 * a clipping bug. With the current full-bleed photographs the capsule clips,
 * which is why `overflow-hidden` is the default.
 *
 * ## Why the geometry is written as percentages
 *
 * Above `md` the three capsules are absolutely positioned inside one
 * aspect-ratio box, so the whole composition scales as a unit and the
 * stagger survives every viewport width without a media query per capsule.
 * Below `md` it collapses to a plain three-column grid with no overlaps and
 * no absolute positioning, per CLAUDE.md 9.
 *
 * Server component.
 */

interface Capsule {
  readonly src: string;
  /** Empty: the capsules are decoration for a headline that says the same. */
  readonly alt: string;
  /** Tinted ground behind the photograph, from the summit palette. */
  readonly tone: string;
  /** Placement inside the aspect box, from `lg` up. */
  readonly position: string;
  /**
   * Shape in the collapsed row below `lg`. An aspect ratio rather than a
   * fixed height: with `h-64` and friends the capsules were taller than
   * they were wide on a phone and rounder than they were tall on a tablet,
   * because the column width triples across that range while the height
   * stays put. A ratio keeps the stadium shape at every width, and the three
   * differing ratios are what give the row its rhythm.
   */
  readonly shape: string;
  readonly sizes: string;
  readonly priority?: boolean;
}

const CAPSULES: readonly Capsule[] = [
  {
    src: '/images/gebaeudereinigung.jpeg',
    alt: '',
    tone: 'bg-accent-yellow',
    position: 'top-[10%] left-0 h-[78%] w-[48%]',
    shape: 'aspect-[5/8]',
    sizes: '(min-width: 1280px) 16rem, (min-width: 1024px) 17vw, 33vw',
    // The tallest capsule is the largest image in the first screen, so it is
    // the one that can become the LCP element on a wide display.
    priority: true,
  },
  {
    src: '/images/hausmeisterservice.jpeg',
    alt: '',
    tone: 'bg-accent-lilac',
    position: 'top-0 left-[56%] h-[42%] w-[42%]',
    shape: 'aspect-[5/6]',
    sizes: '(min-width: 1280px) 14rem, (min-width: 1024px) 15vw, 33vw',
  },
  {
    src: '/images/aussenbereich.jpeg',
    alt: '',
    tone: 'bg-accent-sky',
    position: 'top-[50%] left-[52%] h-[48%] w-[44%]',
    shape: 'aspect-[5/7]',
    sizes: '(min-width: 1280px) 15rem, (min-width: 1024px) 16vw, 33vw',
  },
];

/**
 * The capsule, as a shell and a core.
 *
 * Fully rounded top and bottom, i.e. the stadium shape, written as a single
 * radius rather than four corner utilities so a capsule can never end up
 * half-rounded when its aspect ratio changes. A pill radius stays concentric
 * on its own, so the core needs no derived value the way a squircle does.
 *
 * The tint sits on the shell and the photograph on the core, with the shell's
 * padding between them. Without that padding the picture covers the capsule
 * edge to edge and the colour the client asked for is never visible at all:
 * the reference's capsules show their ground because the figures in them are
 * cut out, and these are full-bleed scenes. The rim is what carries the
 * colour until cut-out PNGs exist, and it happens to be the double-bezel
 * CLAUDE.md 5.8 asks of every image container anyway.
 */
/*
 * No `position` utility here on purpose. The desktop list adds `absolute`,
 * and a `relative` baked into the shell would collide with it: two position
 * utilities on one element resolve by stylesheet order rather than by class
 * order, `relative` won, and all three capsules fell back into the flow. The
 * measured result was a 488 x 819 box instead of 488 x 488, with the third
 * capsule running 153px past the bottom of the section and being clipped by
 * its `overflow-hidden`. The core below supplies the containing block that
 * the filled <Image> needs, so the shell never needed one.
 */
const CAPSULE_SHELL = 'rounded-[9999px] p-2 lg:p-2.5';
const CAPSULE_CORE = 'relative h-full w-full overflow-hidden rounded-[9999px]';

export interface HeroCollageProps {
  className?: string;
}

export function HeroCollage({ className }: HeroCollageProps) {
  return (
    <div className={className}>
      {/* Below `lg`: a plain row, ends aligned to the baseline so the
          differing heights read as a deliberate rhythm rather than as three
          misaligned boxes. No overlaps, no absolute positioning.

          The breakpoint is `lg`, not `md`, because it has to be the same one
          the hero splits into two columns at. With the composition starting
          at `md` the tablet range got the staggered layout at full container
          width: capsules about 400px across, decorations positioned for a
          column half that wide, and a hero three viewports tall. */}
      <ul className="grid grid-cols-3 items-end gap-3 lg:hidden">
        {CAPSULES.map((capsule) => (
          <li
            key={capsule.src}
            className={cn(CAPSULE_SHELL, capsule.tone, capsule.shape)}
          >
            <div className={CAPSULE_CORE}>
              <Image
                src={capsule.src}
                alt={capsule.alt}
                fill
                sizes="33vw"
                priority={capsule.priority}
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>

      {/* From `lg`: the staggered composition. */}
      {/* 4/5 rather than the 6/7 this started at: the box is taller, so
          every capsule grows with it rather than with the column alone.
          Not 3/4, which was tried and measured — at that ratio the
          composition ran to 833px and pushed the bottom of the collage past
          the fold on a 900px window. */}
      <ul className="relative hidden aspect-[4/5] w-full lg:block">
        {CAPSULES.map((capsule) => (
          <li
            key={capsule.src}
            className={cn(
              'absolute',
              CAPSULE_SHELL,
              capsule.tone,
              capsule.position,
            )}
          >
            <div className={CAPSULE_CORE}>
              <Image
                src={capsule.src}
                alt={capsule.alt}
                fill
                sizes={capsule.sizes}
                priority={capsule.priority}
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
