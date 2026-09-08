import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import Link from 'next/link';

import { SERVICES_INDEX_HREF } from '@/components/seo';
import { Bezel, Button, CallButton, Entrance } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta } from '@/config/navigation';
import type { ServiceAudience, ServiceItem } from '@/content/services';
import type { ServiceDetail } from '@/content/service-details';
import { cn } from '@/lib/cn';

/**
 * Milliseconds. Same ladder as the landing hero and the 404 page: the first
 * screen assembles in one short sequence, top to bottom, and then stops.
 */
const ENTER = {
  breadcrumb: 0,
  headline: 40,
  lead: 80,
  actions: 120,
  aside: 160,
} as const;

/**
 * Who the service is written for, in the reader's words. Derived from the
 * catalogue's `audience` rather than repeated as prose per service, so a
 * service that is re-scoped from B2B to both cannot keep saying the old thing
 * on its own page. Order follows the array, which follows the brief's ranking.
 */
const AUDIENCE_LABEL: Record<ServiceAudience, string> = {
  b2b: 'Hausverwaltungen und Gewerbe',
  b2c: 'Eigentümer und Vermieter',
};

/** 3 x 3, the logo's window raster. The mark occupies the centre pane. */
const PANE_COUNT = 9;
const CENTRE_PANE = 4;
const PANE_LINE = 'inset 0 0 0 1px rgb(20 84 126 / 0.06)';

const CRUMB_LINK = cn(
  'rounded-[0.375rem] underline-offset-4 transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'hover:text-brand-900 hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
);

/**
 * Start › Leistungen › this service.
 *
 * Rendered as well as emitted (the `BreadcrumbList` node lives in
 * `ServiceJsonLd`), because a breadcrumb only in the markup helps the crawler
 * and nobody else. The last crumb is not a link and carries `aria-current`:
 * it is the page you are on.
 *
 * The middle crumb points at the landing page's Leistungen section — the
 * `/leistungen` overview route is not built yet, and sending a visitor from a
 * real page to a 404 is the one thing a breadcrumb must not do. Same reasoning
 * as the onward links on the 404 page itself.
 */
function Breadcrumb({ service }: { service: ServiceItem }) {
  return (
    <nav aria-label="Brotkrumennavigation">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-neutral-500">
        <li>
          <Link href="/" className={CRUMB_LINK}>
            Startseite
          </Link>
        </li>
        <li aria-hidden="true" className="text-neutral-400">
          /
        </li>
        <li>
          <Link href={SERVICES_INDEX_HREF} className={CRUMB_LINK}>
            Leistungen
          </Link>
        </li>
        <li aria-hidden="true" className="text-neutral-400">
          /
        </li>
        <li aria-current="page" className="text-brand-900">
          {service.name}
        </li>
      </ol>
    </nav>
  );
}

function FactRow({ term, value }: { term: string; value: string }) {
  return (
    <div
      className={cn(
        'grid gap-1 py-4 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-baseline sm:gap-6',
        'shadow-[inset_0_-1px_0_0_rgb(15_27_36/0.07)] last:shadow-none',
      )}
    >
      <dt className="text-micro uppercase tracking-[0.14em] text-neutral-500">
        {term}
      </dt>
      <dd className="text-body-sm text-ink">{value}</dd>
    </div>
  );
}

/**
 * The detail page's opening screen — Editorial Split (CLAUDE.md 5.5).
 *
 * The copy column carries the whole argument; the aside is a fact card, not a
 * decoration. Its three rows are the questions a visitor asks before reading
 * further — how is this booked, where do you work, is this meant for me — and
 * every value is derived: `engagement` from the page's own content, the other
 * two from `company.ts` and the catalogue. Nothing here is written twice.
 *
 * The mark sits in the centre pane of the window raster from the logo icon.
 * It is the same geometry the 404 page uses with a pane missing, which is
 * deliberate: one motif, two states.
 *
 * No `Eyebrow` above the H1. The breadcrumb already says what kind of page
 * this is, and a label repeating it would be the third piece of chrome above
 * the headline. The H2s further down keep their eyebrows (CLAUDE.md 5.8).
 *
 * Server component. The entrance is CSS, so the first screen paints without
 * waiting for hydration — the reason `Entrance` exists rather than `Reveal`.
 */
export function ServiceHero({
  service,
  detail,
  icon: ServiceIcon,
}: {
  service: ServiceItem;
  detail: ServiceDetail;
  icon: Icon;
}) {
  const audience = service.audience
    .map((entry) => AUDIENCE_LABEL[entry])
    .join(', ');

  return (
    <section aria-labelledby="leistung-titel" className="pt-12 md:pt-16">
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <Entrance delay={ENTER.breadcrumb} distance={8}>
          <Breadcrumb service={service} />
        </Entrance>

        <div className="mt-10 grid items-start gap-12 md:mt-14 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <div className="lg:col-span-7">
            <Entrance delay={ENTER.headline}>
              <h1 id="leistung-titel" className="text-title-xl">
                {detail.headline}
              </h1>
            </Entrance>

            <Entrance delay={ENTER.lead} className="mt-7">
              <p className="max-w-copy text-lead text-neutral-700">
                {detail.lead}
              </p>
            </Entrance>

            <Entrance
              delay={ENTER.actions}
              className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <Button href={primaryCta.href} size="lg">
                {primaryCta.label}
              </Button>

              <CallButton />
            </Entrance>
          </div>

          <Entrance
            delay={ENTER.aside}
            distance={14}
            className="lg:col-span-5 lg:justify-self-end lg:w-full lg:max-w-[26rem]"
          >
            <Bezel radius="lg" inset="md" tone="paper" elevation="lg">
              <div className="px-6 py-7 sm:px-8">
                <div
                  aria-hidden="true"
                  className="grid aspect-[4/3] w-full grid-cols-3 grid-rows-3 overflow-hidden rounded-[1rem] bg-brand-050/70"
                >
                  {Array.from({ length: PANE_COUNT }, (_, index) => (
                    <div
                      key={index}
                      style={{ boxShadow: PANE_LINE }}
                      className={
                        index === CENTRE_PANE
                          ? 'grid place-items-center bg-paper text-brand-700'
                          : undefined
                      }
                    >
                      {index === CENTRE_PANE ? (
                        <ServiceIcon size={30} weight="light" />
                      ) : null}
                    </div>
                  ))}
                </div>

                <dl className="mt-6">
                  <FactRow term="Beauftragung" value={detail.engagement} />
                  <FactRow
                    term="Einsatzgebiet"
                    value={company.serviceArea.primary}
                  />
                  <FactRow term="Für wen" value={audience} />
                </dl>
              </div>
            </Bezel>
          </Entrance>
        </div>
      </div>
    </section>
  );
}
