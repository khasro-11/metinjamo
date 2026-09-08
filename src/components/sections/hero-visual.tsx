import { Bezel } from '@/components/ui';

import { HeroLight } from './hero-light';

/**
 * TODO (client): this is a placeholder composition. Replace with real
 * photography of an actual object or team as soon as the client supplies it
 * (see CLAUDE.md 12). Target: one portrait 4:5 shot, ~1400x1750, served through
 * next/image with `priority`. Until then an abstract, on-brand field is the
 * correct call — CLAUDE.md 5.7 rules out stock photography outright, and a
 * generic bucket-and-squeegee stock image would do more damage to a
 * trust-first brief than no photo at all.
 */

/** Fine raster: 4 x 4 panes. Row-major, so index 6 is row 2 / column 3. */
const PANE_COUNT = 16;

/**
 * Two tinted panes, deliberately off-centre. They give the field a focal point
 * so it reads as a composition rather than as an evenly-filled pattern, and
 * they echo the two blues of the logo icon.
 */
const TINTED_PANES: Readonly<Record<number, string>> = {
  6: 'rgb(69 179 231 / 0.16)',
  9: 'rgb(20 84 126 / 0.055)',
};

/** Pane hairline and the heavier 2 x 2 mullion, both drawn in brand ink. */
const PANE_LINE = 'inset 0 0 0 1px rgb(20 84 126 / 0.05)';
const MULLION_LINE = 'inset 0 0 0 1px rgb(20 84 126 / 0.13)';

export interface HeroVisualProps {
  /** Layout classes for the bezel shell (grid placement, width). */
  className?: string;
}

/**
 * The hero image field: a double-bezel frame around the window raster from the
 * logo icon, scaled up from marker to motif.
 *
 * The raster is the subject of the image, not decoration sprinkled over the
 * layout — the brand mark is a window, and this is that window at object size.
 * Its geometry is two nested grids: a 4 x 4 pane hairline and a 2 x 2 mullion,
 * which is the cross of the logo icon.
 *
 * Server component. Only the light behind it needs the browser.
 */
export function HeroVisual({ className }: HeroVisualProps) {
  return (
    <Bezel
      radius="xl"
      inset="lg"
      tone="paper"
      elevation="xl"
      className={className}
      innerClassName="relative aspect-[4/5] overflow-hidden"
    >
      <HeroLight />

      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-4 grid-rows-4"
      >
        {Array.from({ length: PANE_COUNT }, (_, index) => (
          <div
            key={index}
            style={{
              boxShadow: PANE_LINE,
              backgroundColor: TINTED_PANES[index],
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
