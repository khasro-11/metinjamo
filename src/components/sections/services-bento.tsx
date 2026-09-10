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
 * - `flagship` the largest tile. Wide photograph, copy in a full-width block.
 * - `column`   a tall tile; upright photograph, chips as a vertical list.
 * - `standard` the two-column default.
 * - `wide`     a full-row band, photograph as an upright panel on the left.
 */
type TileLayout = 'flagship' | 'column' | 'standard' | 'wide';

interface TileConfig {
  /** Grid placement from `md` up. Below 768px every tile is a full row. */
  readonly span: string;
  readonly layout: TileLayout;
  /**
   * Rendered width of this tile's photograph, per breakpoint.
   *
   * Written per tile rather than as one shared string, because the tiles are
   * deliberately unequal: the flagship renders at 756px on a wide screen and
   * the Hausmeister panel at 304px, so a single `100vw` would hand the small
   * tiles a file four times larger than they display. The lg values are the
   * measured column arithmetic: the shell is 78rem wide with 40px gutters, so
   * the grid is 1168px across, and a column of the six is
   * (1168 − 5 × 20) / 6 = 178px. Subtract the bezel inset the photograph sits
   * inside to get the numbers below.
   */
  readonly sizes: string;
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
 * Since every tile now carries a photograph, size is the *only* thing left
 * ranking them. There is no longer a light/dark split to lean on, so the
 * spans below are load-bearing rather than decorative and must stay unequal.
 *
 * Kept in the component, not in the content module: the catalogue is copy the
 * client reviews, this is layout. Total over `ServiceCategorySlug` for the
 * same reason as the icon map — a new category cannot ship without a place to
 * sit.
 */
const TILES: Record<ServiceCategorySlug, TileConfig> = {
  gebaeudereinigung: {
    span: 'md:col-span-2 lg:col-span-4 lg:row-span-2',
    layout: 'flagship',
    sizes:
      '(min-width: 1024px) 756px, (min-width: 768px) calc(100vw - 5rem), calc(100vw - 3rem)',
  },
  'abbruch-sanierung': {
    span: 'md:col-span-2 lg:col-span-2 lg:row-span-3',
    layout: 'column',
    sizes:
      '(min-width: 1024px) 360px, (min-width: 768px) calc(100vw - 5rem), calc(100vw - 3rem)',
  },
  'entruempelung-logistik': {
    span: 'lg:col-span-2',
    layout: 'standard',
    sizes:
      '(min-width: 1024px) 364px, (min-width: 768px) calc(50vw - 3.125rem), calc(100vw - 3rem)',
  },
  aussenbereich: {
    span: 'lg:col-span-2',
    layout: 'standard',
    sizes:
      '(min-width: 1024px) 364px, (min-width: 768px) calc(50vw - 3.125rem), calc(100vw - 3rem)',
  },
  hausmeisterservice: {
    span: 'md:col-span-2 lg:col-span-6',
    layout: 'wide',
    // The one photograph that is not full tile width at lg: there it is an
    // upright panel beside the copy, at 304px. Below lg the tile stacks and
    // the photograph is a full-width band again.
    sizes:
      '(min-width: 1024px) 304px, (min-width: 768px) calc(100vw - 5rem), calc(100vw - 3rem)',
  },
};

/**
 * The crop each layout takes.
 *
 * Ratios by default, because a photograph told to fill leftover height is
 * circular in the general case: the grid row is sized by its content and the
 * content by the row. A fixed ratio makes the crop identical on every render,
 * which is what makes the `position` values in the catalogue checkable.
 *
 * The two multi-row tiles are the exception, and they have to be. Both are
 * spanned across rows whose height is set by *other* tiles, so both receive
 * slack that has to go somewhere. Giving it to the copy block is what the
 * first build did and it is visibly wrong: the tall Abbruch tile opened a
 * void of dead brand-900 between its blurb and its chips, because `mt-auto`
 * pushed the chips to a baseline several hundred pixels down. Handing the
 * slack to the photograph instead absorbs it in the one element that has no
 * intrinsic height, and the copy keeps the density it was set at. The
 * `min-h` is the floor for the case where these tiles are the tallest thing
 * in their rows and there is no slack to absorb.
 */
const PHOTO_SHAPE: Record<TileLayout, string> = {
  flagship: 'aspect-[16/9] lg:aspect-auto lg:min-h-[22rem] lg:flex-1',
  // At md this tile is a full-width row rather than a narrow column, so the
  // upright crop would render a 615px-tall photograph over three lines of
  // copy. It only becomes upright at lg, where the tile actually is.
  column:
    'aspect-[4/3] md:aspect-[16/9] lg:aspect-auto lg:min-h-[18rem] lg:flex-1',
  standard: 'aspect-[16/10]',
  // A band until lg, an upright panel beside the copy above it, where it
  // stretches to whatever height the copy column ends up with.
  wide: 'aspect-[16/9] lg:aspect-auto lg:w-[19rem] lg:shrink-0',
};

/**
 * The copy block stops growing on the two tiles whose photograph grows
 * instead, so the slack lands in exactly one of the two zones.
 */
const COPY_GROWTH: Record<TileLayout, string> = {
  flagship: 'flex-1 lg:flex-none',
  column: 'flex-1 lg:flex-none',
  standard: 'flex-1',
  wide: 'flex-1',
};

/** Padding scales with the tile, so the flagship does not read as empty. */
const COPY_PADDING: Record<TileLayout, string> = {
  flagship: 'px-7 py-8 md:px-9 md:py-9',
  column: 'p-7 md:p-8',
  standard: 'p-7 md:p-8',
  wide: 'p-7 md:p-9',
};

/** `filter: url(#…)` target for the photographs. Rendered once per section. */
const DUOTONE_ID = 'imp-duotone-brand';

/**
 * Brand grade: a duotone mixed back over the untouched photograph at 45 %.
 *
 * This is a filter on the pixels, not a layer over them. There is no element
 * of any kind between the photograph and the viewer — no scrim, no wash, no
 * gradient, nothing translucent and nothing blue. That was checked in the
 * rendered DOM rather than assumed: every element in the page whose box
 * overlaps a photograph and paints anything at all was enumerated, and the
 * count is zero for all five.
 *
 * ## Why grade at all
 *
 * Five photographs from five different shoots: a lobby under warm artificial
 * light with an orange machine, grey concrete with hi-vis yellow, a yellow
 * van, sunlit green foliage, a white render facade. Ungraded they are five
 * unrelated colour worlds stacked in one grid, which is the thing the brief
 * asks to avoid. A hue rotation cannot fix it, because it moves every hue by
 * the same angle and so preserves exactly the differences that make the five
 * look unrelated.
 *
 * ## Why 45 % and not 100 %
 *
 * A full duotone collapses every pixel onto the line between brand-900 and
 * brand-300. It unifies perfectly and it also reads as a blue film laid over
 * the tiles, which is the one thing the client does not want. Mixing the
 * graded result back over the original at 45 % keeps the orange machine, the
 * yellow warning sign and the green lawn legible as themselves while pulling
 * the five towards one temperature. Photographs stay photographs; the grid
 * still reads as a series.
 *
 * Pipeline:
 *
 *   1. luma  = 0.2126 R + 0.7152 G + 0.0722 B, written to all three channels
 *   2. luma' = clamp(1.15 · luma − 0.07)
 *   3. duo   = shadow + luma' · (light − shadow)
 *   4. out   = 0.45 · duo + 0.55 · source
 *
 * Stage 2 is a mild contrast stretch. It used to be far stronger (1.4 and
 * −0.18), which was correct while the photograph sat under a 92 % scrim and
 * only its broadest shapes had to survive. Shown clean, that curve is simply
 * blown out.
 *
 * Stage 4 raises the brightest possible pixel well above brand-300, because
 * the source is no longer clamped away. That costs nothing here and it is
 * worth stating plainly: it is the reason the copy has its own opaque zone
 * instead of sitting on the picture. With type on the photograph this grade
 * would be unshippable; with the zones separated the grade is free to be
 * chosen on looks alone.
 *
 * brand-900 is (0.0784, 0.3294, 0.4941), brand-300 is (0.2706, 0.7020,
 * 0.9059), and the deltas in the third matrix are (0.1922, 0.3725, 0.4118).
 * The photographs are opaque JPEGs, so the arithmetic composite in stage 4
 * runs on alpha 1 throughout and premultiplication is a no-op.
 *
 * `color-interpolation-filters="sRGB"` is load-bearing: the SVG default is
 * linearRGB, which would apply the luma weights to linear-light values and
 * land somewhere other than the measured result. Every figure quoted here was
 * measured against this pipeline, in sRGB.
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
          <feFuncR type="linear" slope="1.15" intercept="-0.07" />
          <feFuncG type="linear" slope="1.15" intercept="-0.07" />
          <feFuncB type="linear" slope="1.15" intercept="-0.07" />
        </feComponentTransfer>
        <feColorMatrix
          type="matrix"
          values="0.192157 0 0 0 0.078431
                  0.372549 0 0 0 0.329412
                  0.411765 0 0 0 0.494118
                  0        0 0 1 0"
          result="duotone"
        />
        {/* out = 0.45 · duotone + 0.55 · source. The single number that
            decides how blue the section reads; see the note above. */}
        <feComposite
          in="duotone"
          in2="SourceGraphic"
          operator="arithmetic"
          k1="0"
          k2="0.45"
          k3="0.55"
          k4="0"
        />
      </filter>
    </svg>
  );
}

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
 * Contrast, measured: brand-050 on the white/12 wash over solid brand-900,
 * which composites to rgb(48, 105, 141), is 5.35:1. The chips are 13px so AA
 * is the bar that applies and it is cleared with room. Raising the wash to
 * white/16 was tried and is worse, not better: it lifts the chip ground to
 * rgb(58, 111, 147) and drops the text to 4.84:1. brand-300 measures 2.51:1
 * on the same ground and is therefore never used for chip text.
 */
function ServiceChips({
  category,
  layout,
}: {
  category: ServiceCategoryItem;
  layout: TileLayout;
}) {
  // The tall tile runs its six chips as a single column: at two columns wide
  // a wrapped row would break "Wasserschadensanierung" mid-word, and the tile
  // has the vertical room precisely because it is tall.
  const stacked = layout === 'column';

  return (
    <ul
      aria-labelledby={`${category.slug}-titel`}
      className={cn('flex flex-wrap gap-2', stacked && 'flex-col items-start')}
    >
      {category.items.map((item) => (
        <li
          key={item.slug}
          className="inline-flex items-center rounded-pill bg-white/[0.12] px-3 py-1.5 text-micro text-brand-050"
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
 * The photograph half of a tile.
 *
 * Nothing sits on top of it. No scrim, no wash, no gradient — the duotone is
 * a filter on the pixels themselves, not a layer over them, and it is the only
 * thing between the source file and the screen.
 *
 * `overflow-hidden` is here rather than only on the bezel core because of the
 * hover zoom: the core clips the tile's rounded corners, but a photograph
 * scaled to 1.03 inside a sub-rectangle of the core would otherwise grow into
 * the copy block below it. The bezel *shell* is never the clipper — it is the
 * outer frame, and clipping there would eat the frame.
 */
function CategoryPhoto({
  category,
  layout,
  sizes,
}: {
  category: ServiceCategoryItem;
  layout: TileLayout;
  sizes: string;
}) {
  const { src, alt, position } = category.image;

  return (
    <div className={cn('relative w-full overflow-hidden', PHOTO_SHAPE[layout])}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        // No `priority`: the section sits well below the fold on every
        // viewport, and five eager photographs would compete with the hero's
        // own LCP candidate for bandwidth.
        className={cn(
          'object-cover',
          // Transform only, house curve, and both the transition and the
          // transform are gated behind `motion-safe` so a reduced-motion
          // visitor gets neither the zoom nor a repaint.
          'motion-safe:transition-transform motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-imperial-soft)]',
          'motion-safe:group-hover:scale-[1.03]',
        )}
        style={{
          objectPosition: position,
          filter: `url(#${DUOTONE_ID})`,
        }}
      />
    </div>
  );
}

/**
 * One category tile: a photograph and a copy block, in two separate zones.
 *
 * The separation is the whole design, and it is not a stylistic preference.
 * All five photographs carry large near-white regions — the render facade, the
 * concrete, the sunlit grass, the shirt, the lobby floor — and after the grade
 * above those regions stay bright, because the grade deliberately does not
 * crush them. Type laid over a photograph would have to survive the brightest
 * of them as its ground. Even under the far darker full duotone that ground
 * was brand-300, which carries paper at only 2.31:1 and brand-050 at 2.13:1;
 * under the present 45 % grade it is brighter still. The usual fix is a
 * semi-transparent scrim, and the client has ruled that out, because it is
 * exactly what stops the photographs reading as photographs.
 *
 * So nothing is laid over anything. The photograph keeps its own rectangle at
 * full strength and the copy sits on the solid brand-900 core, where paper
 * measures 7.87:1 and brand-050 7.24:1, both AAA. The worst case for the type
 * is no longer a function of which picture was supplied, which also means a
 * later photograph cannot quietly break the contrast floor.
 *
 * The seam between the two zones is a white inset hairline, the same idiom the
 * `inkPlate` bezel tone uses. Without it a dark-bottomed photograph and the
 * brand-900 core merge into one shape and the tile loses its structure.
 */
function CategoryTile({
  category,
  index,
}: {
  category: ServiceCategoryItem;
  index: number;
}) {
  const { span, layout, sizes } = TILES[category.slug];
  const CategoryIcon = CATEGORY_ICONS[category.slug];
  const isFlagship = layout === 'flagship';
  const isColumn = layout === 'column';
  const isWide = layout === 'wide';

  const heading = (
    <h3
      id={`${category.slug}-titel`}
      className={cn(
        'mt-5 text-paper',
        isFlagship && 'text-title-md lg:text-title-lg',
        isColumn && 'text-title-md',
        isWide && 'text-title-md',
        layout === 'standard' && 'text-title-sm md:text-title-md',
      )}
    >
      {category.category}
    </h3>
  );

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
      <Bezel
        as="article"
        radius={isFlagship || isColumn ? 'xl' : 'lg'}
        inset={isFlagship || isColumn ? 'lg' : 'md'}
        tone="ink"
        elevation={isFlagship || isColumn ? 'lg' : 'sm'}
        // `group` drives the photograph's hover zoom from the whole tile, so
        // the picture reacts to the card the pointer is actually over.
        className="group h-full"
        innerClassName={cn(
          'flex h-full overflow-hidden',
          // The three-part split (photo, title, copy) only fits from lg. At
          // md this tile is a full-width row about 820px across, and photo
          // plus title column would leave the copy a 228px strip.
          isWide ? 'flex-col lg:flex-row lg:items-stretch' : 'flex-col',
        )}
      >
        <CategoryPhoto category={category} layout={layout} sizes={sizes} />

        <div
          className={cn(
            'flex shadow-[inset_0_1px_0_0_rgb(255_255_255/0.10)]',
            COPY_GROWTH[layout],
            isWide
              ? 'flex-col gap-6 lg:flex-row lg:items-start lg:gap-10'
              : 'flex-col',
            COPY_PADDING[layout],
          )}
        >
          {/* 18rem, not 15: "Hausmeisterservice" is a single 18-character
              word and at title-md it needs about 17rem to stay whole. A
              narrower column broke it across a line as "Hausmeisterservic /
              e", which no hyphenation setting can rescue. */}
          <div className={cn(isWide && 'lg:w-[18rem] lg:shrink-0')}>
            <IconBadge size={isFlagship || isColumn ? 'xl' : 'lg'} tone="dark">
              <CategoryIcon
                size={isFlagship || isColumn ? 30 : 24}
                weight="light"
              />
            </IconBadge>

            {heading}
          </div>

          <div className={cn('flex flex-col', isWide ? 'lg:flex-1' : 'flex-1')}>
            <p
              className={cn(
                'max-w-copy text-brand-050',
                isFlagship ? 'text-body' : 'text-body-sm',
                isWide ? 'mt-0 lg:mt-0' : 'mt-4',
              )}
            >
              {category.blurb}
            </p>

            {/* Pushed to the baseline of the tile so the chip blocks line up
                across a row of different copy lengths. */}
            <div className={cn('mt-auto', isColumn ? 'pt-8' : 'pt-6')}>
              <ServiceChips category={category} layout={layout} />
            </div>
          </div>
        </div>
      </Bezel>
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
 * The section ground is sand-100, not brand-050 (CLAUDE.md 5.9). Five
 * dark-blue photographic tiles on a blue ground merge into one field, and this
 * section sits directly above the full-bleed brand-900 anchor in Ablauf; the
 * warm ground is what keeps the two apart. sand-100 carries ink at 15.01:1 and
 * neutral-700 at 7.31:1, and the tile edge reads against it at 6.94:1.
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
      className="relative bg-sand-100 py-section md:py-section-lg"
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
              Fünf Bereiche, achtzehn Leistungen. Sie beauftragen einzelne davon
              oder legen mehrere in einen Vertrag — in beiden Fällen bleibt es
              bei einem Ansprechpartner für das ganze Objekt.
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
