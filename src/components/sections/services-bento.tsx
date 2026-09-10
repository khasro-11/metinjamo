import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { BroomIcon } from '@phosphor-icons/react/dist/ssr/Broom';
import { HammerIcon } from '@phosphor-icons/react/dist/ssr/Hammer';
import { PlantIcon } from '@phosphor-icons/react/dist/ssr/Plant';
import { ToolboxIcon } from '@phosphor-icons/react/dist/ssr/Toolbox';
import { TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import Image from 'next/image';

import { Bezel, Eyebrow, IconBadge, Reveal } from '@/components/ui';
import type {
  ServiceCategoryItem,
  ServiceCategorySlug,
} from '@/content/services';
import { serviceCategories } from '@/content/services';
import { cn } from '@/lib/cn';

/**
 * Icons live here, not in `content/services.ts`: they are presentation, and
 * keeping them out of the data module means the client-side quote form can
 * import the catalogue without pulling five Phosphor modules into its bundle.
 *
 * Typed as a total record over `ServiceCategorySlug`, so adding a category to
 * the catalogue is a compile error until it has an icon.
 *
 * One family, one weight (`light`) throughout — CLAUDE.md 5.7.
 */
const CATEGORY_ICONS: Record<ServiceCategorySlug, Icon> = {
  gebaeudereinigung: BroomIcon,
  'abbruch-sanierung': HammerIcon,
  'entruempelung-logistik': TruckIcon,
  aussenbereich: PlantIcon,
  hausmeisterservice: ToolboxIcon,
};

/**
 * How a tile composes itself. The shape drives the composition rather than the
 * other way round: a tile four columns wide reads badly as a tall stack, and a
 * two-column tile has no room for a side-by-side split.
 *
 * - `image`  the flagship. Photograph behind the copy, chips over the scrim.
 * - `column` a tall tile whose chips run as a vertical list, not as a wrap.
 * - `standard` the two-column default.
 * - `wide`   a full-row band, icon and title beside the copy.
 */
type TileLayout = 'image' | 'column' | 'standard' | 'wide';

interface TileConfig {
  /** Grid placement from `md` up. Below 768px every tile is a full row. */
  readonly span: string;
  readonly layout: TileLayout;
  /**
   * Filled brand-900 instead of a light surface. Two of five, so the field has
   * a hierarchy instead of five equal cards (CLAUDE.md 5.9).
   *
   * brand-900 rather than brand-500, which the brief also offered: white on
   * brand-500 measures 3.97:1 and ink on it 4.40:1, so a brand-500 tile
   * carries no body copy in either direction. brand-900 carries paper at
   * 7.87:1 and brand-050 at 7.24:1, both AAA.
   */
  readonly dark?: true;
}

/**
 * The bento: five unequal tiles on a six-column field, one per category.
 *
 *   lg                              md
 *   +-----------------+-------+     +---------+
 *   |                 |       |     |    A    |
 *   |   A  Reinigung  |   B   |     +---------+
 *   |      (4 x 2)    | Abbr. |     |    B    |
 *   |                 | (2x3) |     +----+----+
 *   +--------+--------+       |     | C  | D  |
 *   |   C    |   D    |       |     +----+----+
 *   +--------+--------+-------+     |    E    |
 *   |      E  Hausmeister     |     +---------+
 *   +-------------------------+
 *
 * Every row sums to six at `lg` and to two at `md`, so no orphan cell is ever
 * left over: A and B fill rows one and two, row three is C plus D plus B's
 * third row, and E closes the field. Auto-placement produces exactly this from
 * catalogue order, which is fixed by the client and must not be reordered for
 * layout reasons — so the layout was chosen to fit the order instead.
 *
 * Sizes follow the brief: Gebäudereinigung is the largest tile because it is
 * the core business and the thing the logo depicts, and Abbruch & Sanierung is
 * the tall one because six individual services do not fit in a short tile.
 *
 * Kept in the component, not in the content module: the catalogue is copy the
 * client reviews, this is layout. Total over `ServiceCategorySlug` for the
 * same reason as the icon map — a new category cannot ship without a place to
 * sit.
 */
const TILES: Record<ServiceCategorySlug, TileConfig> = {
  gebaeudereinigung: {
    span: 'md:col-span-2 lg:col-span-4 lg:row-span-2',
    layout: 'image',
    dark: true,
  },
  'abbruch-sanierung': {
    span: 'md:col-span-2 lg:col-span-2 lg:row-span-3',
    layout: 'column',
    dark: true,
  },
  'entruempelung-logistik': { span: 'lg:col-span-2', layout: 'standard' },
  aussenbereich: { span: 'lg:col-span-2', layout: 'standard' },
  // Deliberately light, although a filled closer would be the obvious move:
  // the next section is a full-bleed brand-900 anchor, and a dark band sitting
  // directly on top of it would erase the boundary between the two.
  hausmeisterservice: { span: 'md:col-span-2 lg:col-span-6', layout: 'wide' },
};

/** Padding scales with the tile, so the flagship does not read as empty. */
const TILE_PADDING: Record<TileLayout, string> = {
  // The copy block only — the image bleeds to the core edge. The top padding
  // is oversized and matched to `--scrim-ramp`, so the gradient finishes
  // fading in above the first line of type rather than behind it.
  image: 'px-7 pb-7 pt-14 md:px-9 md:pb-9 lg:pt-20',
  column: 'p-7 md:p-8',
  standard: 'p-7 md:p-8',
  wide: 'p-7 md:p-9',
};

/**
 * The window raster from the logo icon, blown up as a structural motif on the
 * tall tile only (CLAUDE.md 4: a rhythm device, not a watermark on
 * everything). Hairlines in accent blue at low alpha, so it never competes
 * with the copy sitting over it.
 */
function WindowField({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    >
      <rect x="0.5" y="0.5" width="119" height="79" rx="10" />
      <path d="M40 0.5v79M80 0.5v79M0.5 40h119" />
    </svg>
  );
}

/** `filter: url(#…)` target for the image tile. Rendered once per section. */
const DUOTONE_ID = 'imp-duotone-brand';

/**
 * Duotone in brand colours.
 *
 * The photo is off-brand on its own — a warm skin tone and a sky blue that is
 * not one of ours. A hue rotation cannot fix that, because it moves every hue
 * by the same angle and leaves the skin tone somewhere unpredictable. A colour
 * matrix collapses the image to one axis instead: every pixel is mapped onto
 * the line between brand-900 and brand-300 by its luma, so nothing off-brand
 * can survive whatever the source happens to contain.
 *
 * Three stages:
 *
 *   1. luma  = 0.2126 R + 0.7152 G + 0.0722 B, written to all three channels
 *   2. luma' = clamp(1.4 · luma − 0.18)
 *   3. out   = shadow + luma' · (light − shadow)
 *
 * Stage 2 is a contrast stretch, and it is the difference between a legible
 * photograph and a blue smear. brand-900 and brand-300 are both mid-tones —
 * luminance 0.10 and 0.42 — so mapping a full-range photograph between them
 * compresses it into a third of the available range. Widening the input first
 * gives that third something to separate: without it the hand and the squeegee
 * dissolve into the foam.
 *
 * Stages 1 and 3 are linear and would compose into a single matrix, but stage
 * 2 must sit between them and must clamp. Unclamped, a stretched highlight
 * lands past brand-300 — bright enough to take the copy below from 7.04:1 down
 * to 6.88:1. `feComponentTransfer` clamps each function's result to [0, 1] per
 * spec, which is what keeps brand-300 the true ceiling and the contrast floor
 * where it was measured.
 *
 * brand-900 is (0.0784, 0.3294, 0.4941), brand-300 is (0.2706, 0.7020,
 * 0.9059), and the deltas in the third matrix are (0.1922, 0.3725, 0.4118).
 *
 * `color-interpolation-filters="sRGB"` is load-bearing: the SVG default is
 * linearRGB, which would apply the luma weights to linear-light values and
 * land somewhere other than the measured result. Every contrast figure quoted
 * here was measured against this pipeline, in sRGB.
 */
function DuotoneFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute size-0 overflow-hidden"
    >
      <filter
        id={DUOTONE_ID}
        colorInterpolationFilters="sRGB"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
      >
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0
                  0.2126 0.7152 0.0722 0 0
                  0.2126 0.7152 0.0722 0 0
                  0      0      0      1 0"
        />
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.4" intercept="-0.18" />
          <feFuncG type="linear" slope="1.4" intercept="-0.18" />
          <feFuncB type="linear" slope="1.4" intercept="-0.18" />
        </feComponentTransfer>
        <feColorMatrix
          type="matrix"
          values="0.192157 0 0 0 0.078431
                  0.372549 0 0 0 0.329412
                  0.411765 0 0 0 0.494118
                  0        0 0 1 0"
        />
      </filter>
    </svg>
  );
}

/**
 * The scrim under the copy on the image tile: transparent at 54 % of the tile
 * height, full strength by 72 %, and held there to the bottom edge — so the
 * whole copy block sits on the plateau rather than part-way up a ramp.
 *
 * Stops follow a smoothstep rather than a straight line. A linear alpha ramp
 * over this distance shows a visible edge where it starts.
 *
 * 0.92 rather than 1, so the glass still reads through behind the text. That
 * costs contrast, so the floor was checked rather than assumed: after the
 * duotone above, no pixel can be lighter than brand-300, and brand-300 under
 * 92 % brand-900 composites to rgb(24, 92, 134), which carries paper at 7.02:1
 * and brand-050 at 6.46:1. Both are AAA for the title and AA for the body, and
 * the floor holds for any image that ever replaces this one.
 */
const IMAGE_SCRIM = [
  'linear-gradient(to top',
  'rgb(20 84 126 / 0.92) 0',
  'rgb(20 84 126 / 0.92) calc(100% - var(--scrim-ramp))',
  'rgb(20 84 126 / 0.62) calc(100% - var(--scrim-ramp) * 0.62)',
  'rgb(20 84 126 / 0.22) calc(100% - var(--scrim-ramp) * 0.28)',
  'rgb(20 84 126 / 0) 100%)',
].join(', ');

/**
 * Below `lg` the copy sits under the photo rather than on it, so the photo
 * needs its own short fade at the lower edge — without it the image ends on a
 * hard horizontal cut against the filled core.
 */
const IMAGE_FOOT_FADE =
  'linear-gradient(to top, rgb(20 84 126) 0, rgb(20 84 126 / 0) 100%)';

/* ---------------------------------------------------------------------------
   Individual services
   --------------------------------------------------------------------------- */

/**
 * The individual services of a category, as chips.
 *
 * This is what makes a category tile a claim rather than a heading: "Abbruch &
 * Sanierung" alone says nothing a competitor does not also say, and the six
 * chips under it are the specific answer. They are plain text, not links —
 * there is nothing to link to since the detail routes were retired
 * (CLAUDE.md 7a), and a chip that looks interactive but is not is worse than a
 * chip that does not.
 *
 * Rendered as a real `<ul>` inside the tile's `<article>`, so a screen reader
 * announces "list, 6 items" rather than reading a run-on line. The list is
 * labelled by the tile heading, which is the category name.
 *
 * Contrast, measured:
 *   light tiles  brand-900 on brand-050  7.24:1   AAA
 *   dark tiles   brand-050 on the white/12 wash over brand-900, which
 *                composites to rgb(48, 105, 141): 5.33:1   AA, and the chips
 *                are 13px so AA is the bar that applies. brand-300 would have
 *                been 2.51:1 on that same ground and is therefore never used
 *                for chip text on the dark tiles.
 */
function ServiceChips({
  category,
  dark,
  layout,
}: {
  category: ServiceCategoryItem;
  dark: boolean;
  layout: TileLayout;
}) {
  // The tall tile runs its six chips as a single column: at two columns wide
  // a wrapped row would break "Wasserschadensanierung" mid-word, and the tile
  // has the vertical room precisely because it is tall.
  const stacked = layout === 'column';

  return (
    <ul
      aria-labelledby={`${category.slug}-titel`}
      className={cn(
        'flex flex-wrap gap-2',
        stacked && 'flex-col items-start',
      )}
    >
      {category.items.map((item) => (
        <li
          key={item.slug}
          className={cn(
            'inline-flex items-center rounded-pill px-3 py-1.5 text-micro',
            dark
              ? 'bg-white/[0.12] text-brand-050'
              : 'bg-brand-050 text-brand-900',
          )}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------------------
   Tiles
   --------------------------------------------------------------------------- */

/**
 * The flagship tile. Same double bezel and same filled core as the other dark
 * tile, but the core is given over to the photograph.
 *
 * Two arrangements, not two components. From `lg` the photo is taken out of
 * flow and fills the whole two-row tile, with the copy laid over its lower
 * edge; below that the tile is one row high, so the photo takes a 16:9 band at
 * the top and the copy sits beneath it on the filled core.
 *
 * No icon badge, unlike its siblings: the badge exists to give a text-only
 * tile something to look at, and this one has a photograph.
 *
 * `object-position` sits right of centre because the tile crops horizontally.
 * At 85 % the squeegee and the hand stay inside the frame at every width the
 * tile takes; centring it would cut the blade off. The vertical 45 % is for
 * the 16:9 band, which crops the other way and would otherwise take the arm
 * instead of the hand.
 */
function CategoryImageTile({ category }: { category: ServiceCategoryItem }) {
  return (
    <Bezel
      as="article"
      radius="xl"
      inset="lg"
      tone="ink"
      elevation="lg"
      className="h-full"
      innerClassName="relative flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-video w-full lg:absolute lg:inset-0 lg:aspect-auto">
        <Image
          src="/images/glasreinigung.jpg"
          alt="Eine Hand zieht mit einem Abzieher über eine eingeschäumte Fensterscheibe."
          fill
          sizes="(min-width: 1024px) 760px, (min-width: 768px) 92vw, calc(100vw - 3rem)"
          className="object-cover object-[85%_45%]"
          style={{ filter: `url(#${DUOTONE_ID})` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 lg:hidden"
          style={{ backgroundImage: IMAGE_FOOT_FADE }}
        />
      </div>

      <div
        className={cn(
          'relative flex flex-1 flex-col [--scrim-ramp:3rem]',
          'lg:mt-auto lg:flex-none lg:[--scrim-ramp:5rem]',
          TILE_PADDING.image,
        )}
        style={{ backgroundImage: IMAGE_SCRIM }}
      >
        <h3
          id={`${category.slug}-titel`}
          className="text-title-md text-paper lg:text-title-lg"
        >
          {category.category}
        </h3>

        <p className="mt-4 max-w-copy text-body text-brand-050">
          {category.blurb}
        </p>

        <div className="mt-7">
          <ServiceChips category={category} dark layout="image" />
        </div>
      </div>
    </Bezel>
  );
}

function CategoryTile({
  category,
  index,
}: {
  category: ServiceCategoryItem;
  index: number;
}) {
  const { span, layout, dark = false } = TILES[category.slug];
  const CategoryIcon = CATEGORY_ICONS[category.slug];
  const isColumn = layout === 'column';
  const isWide = layout === 'wide';

  return (
    <Reveal
      as="li"
      // The anchor the hero chips, the footer column and every external deep
      // link resolve to. It sits on the grid item itself, so the jump lands on
      // the real box rather than on a wrapper with no height.
      id={category.anchor}
      // Staggered by position, not by grid row: the tiles enter in reading
      // order, and the cap keeps the last one from arriving late.
      delay={Math.min(index, 5) * 0.06}
      distance={16}
      amount={0.15}
      className={cn('scroll-mt-28', span)}
    >
      {layout === 'image' ? (
        <CategoryImageTile category={category} />
      ) : (
        <Bezel
          as="article"
          radius={isColumn ? 'xl' : 'lg'}
          inset={isColumn ? 'lg' : 'md'}
          tone={dark ? 'ink' : 'paper'}
          elevation={isColumn ? 'lg' : 'sm'}
          className="h-full"
          innerClassName={cn(
            'relative flex h-full overflow-hidden',
            isWide
              ? 'flex-col gap-6 md:flex-row md:items-start md:gap-10'
              : 'flex-col',
            TILE_PADDING[layout],
          )}
        >
          {isColumn ? (
            <WindowField
              className={cn(
                'pointer-events-none absolute -right-10 -bottom-8 w-56',
                // brand-300 at 25% reads as a faint blue line on a white tile.
                // On a filled brand-900 tile the same alpha is a visible light
                // grid crossing the copy, so the motif has to step back where
                // the ground stepped forward.
                dark ? 'text-brand-300/10' : 'text-brand-300/25',
                'md:-right-12 md:w-72',
              )}
            />
          ) : null}

          <div className={cn('relative', isWide && 'md:w-[17rem] md:shrink-0')}>
            <IconBadge size={isColumn ? 'xl' : 'lg'} tone={dark ? 'dark' : 'light'}>
              <CategoryIcon size={isColumn ? 30 : 24} weight="light" />
            </IconBadge>

            <h3
              id={`${category.slug}-titel`}
              className={cn(
                'mt-5',
                dark ? 'text-paper' : 'text-ink',
                isColumn ? 'text-title-md' : 'text-title-sm md:text-title-md',
              )}
            >
              {category.category}
            </h3>
          </div>

          <div
            className={cn(
              'relative flex flex-col',
              isWide ? 'md:flex-1' : 'flex-1',
            )}
          >
            <p
              className={cn(
                'max-w-copy text-body-sm',
                dark ? 'text-brand-050' : 'text-neutral-700',
                isWide ? 'mt-0' : 'mt-4',
              )}
            >
              {category.blurb}
            </p>

            {/* Pushed to the baseline of the tile so the chip blocks line up
                across a row of different copy lengths. */}
            <div className={cn('mt-auto', isColumn ? 'pt-8' : 'pt-6')}>
              <ServiceChips category={category} dark={dark} layout={layout} />
            </div>
          </div>
        </Bezel>
      )}
    </Reveal>
  );
}

/**
 * Leistungen — Asymmetrical Bento, Soft Structuralism.
 *
 * Five tiles in four sizes, one per category (CLAUDE.md 7a). Eighteen
 * equally-sized tiles, one per individual service, was the obvious reading of
 * the catalogue and is the wrong one: it is unreadable, it flattens the
 * hierarchy the client's own ordering encodes, and it would put
 * "Sperrmüllentsorgung" at the same visual weight as the core business. The
 * individual services are chips inside their category instead, which is also
 * where a visitor looks for them.
 *
 * The flagship, the tall tile and the full-width closer break the grid on
 * purpose: three equal cards in a row is the templated default this section
 * exists to avoid (CLAUDE.md 5.7).
 *
 * Below 768px the whole field collapses to one column at `gap-6` and every
 * `col-span` and `row-span` override drops out, so nothing overlaps and no
 * tile ends up holding a side-by-side split at 360px.
 *
 * Each tile carries `id="<category>"`, the jump target for the hero chips and
 * the footer column. `scroll-mt-28` on the grid item clears the floating
 * header pill.
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function ServicesBento() {
  return (
    <section
      id="leistungen"
      aria-labelledby="leistungen-titel"
      /* First tint of the page. brand-050 carries ink at 15.65:1 and
         neutral-700 at 7.62:1, so nothing in the section loses contrast
         against paper. */
      className="relative bg-brand-050 py-section md:py-section-lg"
    >
      <DuotoneFilter />

      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal distance={16}>
              <Eyebrow>Leistungen</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="leistungen-titel" className="mt-6 text-title-lg">
                Was wir für <span className="text-brand-700">Ihre Objekte</span>{' '}
                übernehmen.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:col-span-5">
            {/* TODO (client): confirm that services can in fact be combined
                into one contract before this sentence goes live. */}
            <p className="max-w-copy text-body text-neutral-700">
              Fünf Bereiche, achtzehn Leistungen. Sie beauftragen einzelne
              davon oder legen mehrere in einen Vertrag — in beiden Fällen
              bleibt es bei einem Ansprechpartner für das ganze Objekt.
            </p>
          </Reveal>
        </header>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 md:gap-5 lg:grid-cols-6">
          {serviceCategories.map((category, index) => (
            <CategoryTile
              key={category.slug}
              category={category}
              index={index}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
