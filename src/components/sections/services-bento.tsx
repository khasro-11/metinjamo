import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { BroomIcon } from '@phosphor-icons/react/dist/ssr/Broom';
import { HammerIcon } from '@phosphor-icons/react/dist/ssr/Hammer';
import { PlantIcon } from '@phosphor-icons/react/dist/ssr/Plant';
import { SnowflakeIcon } from '@phosphor-icons/react/dist/ssr/Snowflake';
import { SprayBottleIcon } from '@phosphor-icons/react/dist/ssr/SprayBottle';
import { StairsIcon } from '@phosphor-icons/react/dist/ssr/Stairs';
import { ToolboxIcon } from '@phosphor-icons/react/dist/ssr/Toolbox';
import { TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import Link from 'next/link';

import { Bezel, Eyebrow, Reveal } from '@/components/ui';
import type { ServiceItem, ServiceSlug } from '@/content/services';
import { serviceAnchorId, serviceHref, services } from '@/content/services';
import { cn } from '@/lib/cn';

/**
 * Icons live here, not in `content/services.ts`: they are presentation, and
 * keeping them out of the data module means the client-side quote form can
 * import the catalogue without pulling eight Phosphor modules into its bundle.
 *
 * Typed as a total record over `ServiceSlug`, so adding a service to the
 * catalogue is a compile error until it has an icon. Exported for the
 * `/leistungen/[slug]` detail pages, which must use the same mark.
 *
 * One family, one weight (`light`) throughout — CLAUDE.md 5.7.
 */
export const SERVICE_ICONS: Record<ServiceSlug, Icon> = {
  unterhaltsreinigung: BroomIcon,
  treppenhausreinigung: StairsIcon,
  glasreinigung: SprayBottleIcon,
  gruenpflege: PlantIcon,
  winterdienst: SnowflakeIcon,
  hausmeisterservice: ToolboxIcon,
  entruempelung: TruckIcon,
  bauendreinigung: HammerIcon,
};

/**
 * How a tile composes itself. The shape drives the composition rather than the
 * other way round: a tile four columns wide reads badly as a tall stack, and a
 * two-column tile has no room for a side-by-side split.
 */
type TileLayout = 'feature' | 'wide' | 'standard';

interface TileConfig {
  /** Grid placement from `md` up. Below 768px every tile is a full row. */
  readonly span: string;
  readonly layout: TileLayout;
}

/**
 * The bento itself: deliberately unequal tiles on a six-column field.
 *
 *   lg               md
 *   +--------+--+    +-----+
 *   |        |B |    |  A  |
 *   |   A    +--+    +--+--+
 *   |        |C |    |B |C |
 *   +--+-----+--+    +--+--+
 *   |D |   E    |    |  D  |
 *   +--+--+-----+    +-----+
 *   |   F    |G |    |  E  |  ...
 *   +--------+--+
 *   |     H     |
 *   +-----------+
 *
 * Every row sums to six at `lg` and to two at `md`, so no orphan cell is ever
 * left over. The four-by-two feature tile carries the service that a
 * Hausverwaltung signs first; the full-width closer takes the project work.
 *
 * Kept in the component, not in the content module: the catalogue is copy the
 * client reviews, this is layout. Total over `ServiceSlug` for the same reason
 * as the icon map — a new service cannot ship without a place to sit.
 */
const TILES: Record<ServiceSlug, TileConfig> = {
  unterhaltsreinigung: {
    span: 'md:col-span-2 lg:col-span-4 lg:row-span-2',
    layout: 'feature',
  },
  treppenhausreinigung: { span: 'lg:col-span-2', layout: 'standard' },
  glasreinigung: { span: 'lg:col-span-2', layout: 'standard' },
  gruenpflege: { span: 'md:col-span-2 lg:col-span-2', layout: 'standard' },
  winterdienst: { span: 'md:col-span-2 lg:col-span-4', layout: 'wide' },
  hausmeisterservice: { span: 'md:col-span-2 lg:col-span-4', layout: 'wide' },
  entruempelung: { span: 'md:col-span-2 lg:col-span-2', layout: 'standard' },
  bauendreinigung: { span: 'md:col-span-2 lg:col-span-6', layout: 'wide' },
};

/** Padding scales with the tile, so the feature block does not read as empty. */
const TILE_PADDING: Record<TileLayout, string> = {
  feature: 'p-8 md:p-10 lg:p-12',
  wide: 'p-7 md:p-9',
  standard: 'p-7 md:p-8',
};

/**
 * The window raster from the logo icon, blown up as a structural motif on the
 * feature tile only (CLAUDE.md 4: a rhythm device, not a watermark on
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

const LINK_CLASSES = cn(
  'group/link inline-flex min-h-11 items-center gap-3 rounded-pill text-body-sm font-medium text-brand-900',
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500',
);

const LINK_ICON_CLASSES = cn(
  'grid size-8 shrink-0 place-items-center rounded-full bg-brand-050 text-brand-700',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'group-hover/link:bg-brand-300 group-hover/link:text-brand-900',
);

/**
 * The nested CTA in text form (CLAUDE.md 5.8): the arrow sits in its own round
 * wrapper, never as a literal arrow glyph appended to the label.
 *
 * The visible label repeats on all eight tiles, so the service name is carried
 * into the accessible name — a screen reader list of links reads eight
 * distinct entries instead of "Mehr erfahren" eight times.
 */
function ServiceLink({ service }: { service: ServiceItem }) {
  return (
    <Link href={serviceHref(service.slug)} className={LINK_CLASSES}>
      <span className="underline decoration-brand-300 decoration-1 underline-offset-[0.35em]">
        Mehr erfahren
        <span className="sr-only"> über {service.name}</span>
      </span>
      <span aria-hidden="true" className={LINK_ICON_CLASSES}>
        <ArrowRightIcon size={15} weight="light" />
      </span>
    </Link>
  );
}

function ServiceTile({ service, index }: { service: ServiceItem; index: number }) {
  const { span, layout } = TILES[service.slug];
  const ServiceIcon = SERVICE_ICONS[service.slug];
  const isFeature = layout === 'feature';
  const isWide = layout === 'wide';

  return (
    <Reveal
      as="li"
      id={serviceAnchorId(service.slug)}
      // Staggered by position, not by grid row: the tiles enter in reading
      // order, and the cap keeps the last one from arriving late.
      delay={Math.min(index, 5) * 0.06}
      distance={16}
      amount={0.15}
      className={span}
    >
      <Bezel
        as="article"
        radius={isFeature ? 'xl' : 'lg'}
        inset={isFeature ? 'lg' : 'md'}
        tone={isFeature ? 'tinted' : 'paper'}
        elevation={isFeature ? 'lg' : 'sm'}
        className="h-full"
        innerClassName={cn(
          'relative flex h-full overflow-hidden',
          isWide ? 'flex-col gap-6 md:flex-row md:items-center md:gap-10' : 'flex-col',
          TILE_PADDING[layout],
        )}
      >
        {isFeature ? (
          <WindowField
            className={cn(
              'pointer-events-none absolute -right-10 -bottom-8 w-64 text-brand-300/25',
              'md:-right-12 md:w-80 lg:w-96',
            )}
          />
        ) : null}

        <div className={cn('relative', isWide && 'md:w-[17rem] md:shrink-0')}>
          <ServiceIcon
            size={isFeature ? 34 : 26}
            weight="light"
            aria-hidden="true"
            className="text-brand-700"
          />

          <h3
            className={cn(
              'mt-5 text-ink',
              isFeature ? 'text-title-lg' : 'text-title-sm md:text-title-md',
            )}
          >
            {service.name}
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
              'max-w-copy text-neutral-700',
              isFeature ? 'text-lead' : 'text-body-sm',
              isWide ? 'mt-0' : 'mt-4',
            )}
          >
            {service.benefit}
          </p>

          {/* Pushed to the baseline of the tile so the links line up across a
              row of different content lengths. */}
          <div className={cn('mt-auto', isFeature ? 'pt-10' : 'pt-6')}>
            <ServiceLink service={service} />
          </div>
        </div>
      </Bezel>
    </Reveal>
  );
}

/**
 * Leistungen — Asymmetrical Bento, Soft Structuralism.
 *
 * Eight tiles in five sizes. The feature block, the two wide bands and the
 * full-width closer break the grid on purpose: three equal cards in a row is
 * the templated default this section exists to avoid (CLAUDE.md 5.7).
 *
 * Below 768px the whole field collapses to one column at `gap-6` and every
 * `col-span` override drops out, so nothing overlaps and no tile ends up
 * holding a side-by-side split at 360px.
 *
 * Each tile carries `id="leistung-<slug>"`, the jump target for the hero
 * chips. `scroll-padding-top` on `html` clears the floating header pill.
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function ServicesBento() {
  return (
    <section
      id="leistungen"
      aria-labelledby="leistungen-titel"
      className="py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal distance={16}>
              <Eyebrow>Leistungen</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="leistungen-titel" className="mt-6 text-title-lg">
                Was wir für Ihre Objekte übernehmen.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:col-span-5">
            {/* TODO (client): confirm that services can in fact be combined
                into one contract before this sentence goes live. */}
            <p className="max-w-copy text-body text-neutral-700">
              Sie können einzelne Leistungen beauftragen oder mehrere in einen
              Vertrag legen. In beiden Fällen bleibt es bei einem
              Ansprechpartner für das ganze Objekt.
            </p>
          </Reveal>
        </header>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 md:gap-5 lg:grid-cols-6">
          {services.map((service, index) => (
            <ServiceTile key={service.slug} service={service} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
