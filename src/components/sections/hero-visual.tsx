import { Bezel } from '@/components/ui';

import { HeroLight } from './hero-light';

/**
 * TODO (client): this is a placeholder composition. Replace with real
 * photography of an actual object or team as soon as the client supplies it
 * (see CLAUDE.md 12). Target for the wide slot: one landscape shot, ~2400x960,
 * served through next/image with `priority`. Until then an abstract, on-brand
 * field is the correct call — CLAUDE.md 5.7 rules out stock photography
 * outright, and a generic bucket-and-squeegee stock image would do more damage
 * to a trust-first brief than no photo at all.
 */

export type HeroVisualRatio = 'portrait' | 'wide';

/** Pane hairline and the heavier 2 x 2 mullion, both drawn in brand ink. */
const PANE_LINE = 'inset 0 0 0 1px rgb(20 84 126 / 0.05)';
const MULLION_LINE = 'inset 0 0 0 1px rgb(20 84 126 / 0.13)';

/** The two blues of the logo icon, at surface alpha. */
const TINT_ACCENT = 'rgb(69 179 231 / 0.16)';
const TINT_DEEP = 'rgb(20 84 126 / 0.055)';

interface RasterLayout {
  /** Aspect of the inner core, responsive. */
  readonly aspect: string;
  /** Literal grid classes — never composed at runtime, so Tailwind sees them. */
  readonly grid: string;
  readonly paneCount: number;
  /**
   * Row-major pane indices that carry a tint. Deliberately off-centre: they
   * give the field a focal point so it reads as a composition rather than as
   * an evenly-filled pattern.
   */
  readonly tinted: Readonly<Record<number, string>>;
}

const LAYOUTS: Record<HeroVisualRatio, RasterLayout> = {
  // 4 x 4. Index 6 is row 2 / column 3, index 9 row 3 / column 2.
  portrait: {
    aspect: 'aspect-[4/5]',
    grid: 'grid-cols-4 grid-rows-4',
    paneCount: 16,
    tinted: { 6: TINT_ACCENT, 9: TINT_DEEP },
  },
  // 8 x 4. The panes stay near-square at every breakpoint, so the raster reads
  // as one window rather than as a row of letterboxes. Index 13 sits just under
  // the daylight source HeroLight puts at 72% / 20%; index 18 is the
  // counterweight in the lower left.
  wide: {
    aspect: 'aspect-[3/2] sm:aspect-[2/1] lg:aspect-[5/2]',
    grid: 'grid-cols-8 grid-rows-4',
    paneCount: 32,
    tinted: { 13: TINT_ACCENT, 18: TINT_DEEP },
  },
};

export interface HeroVisualProps {
  /** Portrait for a split layout, wide for a full-measure band under the copy. */
  ratio?: HeroVisualRatio;
  /** Layout classes for the bezel shell (grid placement, width). */
  className?: string;
}

/**
 * The hero image field: a double-bezel frame around the window raster from the
 * logo icon, scaled up from marker to motif.
 *
 * The raster is the subject of the image, not decoration sprinkled over the
 * layout — the brand mark is a window, and this is that window at object size.
 * Its geometry is two nested grids: a pane hairline and a 2 x 2 mullion, which
 * is the cross of the logo icon and stays a cross at both ratios.
 *
 * Server component. Only the light behind it needs the browser.
 */
export function HeroVisual({ ratio = 'wide', className }: HeroVisualProps) {
  const layout = LAYOUTS[ratio];

  return (
    <Bezel
      radius="xl"
      inset="lg"
      tone="paper"
      elevation="xl"
      className={className}
      innerClassName={`relative overflow-hidden ${layout.aspect}`}
    >
      <HeroLight />

      <div
        aria-hidden="true"
        className={`absolute inset-0 grid ${layout.grid}`}
      >
        {Array.from({ length: layout.paneCount }, (_, index) => (
          <div
            key={index}
            style={{
              boxShadow: PANE_LINE,
              backgroundColor: layout.tinted[index],
            }}
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 grid-rows-2"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} style={{ boxShadow: MULLION_LINE }} />
        ))}
      </div>
    </Bezel>
  );
}
