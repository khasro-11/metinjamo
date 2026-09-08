import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import Link from 'next/link';

import { SERVICE_ICONS } from '@/components/sections';
import { Bezel, Eyebrow, Reveal } from '@/components/ui';
import type { RelatedService } from '@/content/service-details';
import { getServiceBySlug, serviceHref } from '@/content/services';
import { cn } from '@/lib/cn';

const ROW = cn(
  'group grid gap-x-6 gap-y-2 px-6 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-8 md:py-8',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'hover:bg-brand-050/60',
  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-500',
);

function RelatedRow({
  related,
  icon: ServiceIcon,
}: {
  related: RelatedService;
  icon: Icon;
}) {
  const service = getServiceBySlug(related.slug);

  // The catalogue is the source of the name; `related.slug` is typed against
  // it, so this can only be null if the entry was removed mid-edit.
  if (!service) return null;

  return (
    <li className="shadow-[inset_0_-1px_0_0_rgb(15_27_36/0.07)] last:shadow-none">
      <Link href={serviceHref(service.slug)} className={ROW}>
        <span
          aria-hidden="true"
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-[1.125rem] bg-brand-050 text-brand-700',
            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
            'group-hover:bg-white',
          )}
        >
          <ServiceIcon size={22} weight="light" />
        </span>

        <span className="min-w-0">
          <span className="block text-title-sm text-ink underline-offset-[0.35em] group-hover:underline group-hover:decoration-brand-300 group-hover:decoration-1">
            {service.name}
          </span>
          <span className="mt-1.5 block max-w-copy text-body-sm text-neutral-700">
            {related.reason}
          </span>
        </span>

        {/* Nested CTA (CLAUDE.md 5.8): the arrow lives in its own round
            wrapper, never as a glyph appended to the label. Hidden below `sm`,
            where the row stacks and the affordance is the whole row. */}
        <span
          aria-hidden="true"
          className={cn(
            'hidden size-9 shrink-0 place-items-center rounded-full sm:grid',
            'bg-brand-050 text-brand-700',
            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
            'group-hover:bg-brand-300 group-hover:text-brand-900',
          )}
        >
          <ArrowRightIcon size={16} weight="light" />
        </span>
      </Link>
    </li>
  );
}

/**
 * "Verwandte Leistungen" — the services this one is usually ordered with.
 *
 * ## Why rows and not three cards
 *
 * Three equally sized feature cards side by side is a named prohibition
 * (CLAUDE.md 5.7), and here it would also be wrong on the merits: the point of
 * this block is not to re-advertise three services, it is to say *why* they
 * belong together on this particular object. That is a sentence, and sentences
 * want a row.
 *
 * ## Why the reasons are written per pair
 *
 * Each entry carries its own `reason` from `content/service-details.ts`
 * instead of reusing the target service's `benefit`. Eight pages repeating the
 * same three benefit lines is exactly the duplicate content these pages are
 * built to avoid — and "Winterdienst räumt Ihre Wege" is not an answer to
 * "warum steht das auf der Seite zur Grünpflege".
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function RelatedServices({
  related,
}: {
  related: readonly RelatedService[];
}) {
  if (related.length === 0) return null;

  return (
    <section
      id="verwandte-leistungen"
      aria-labelledby="verwandte-titel"
      className="pb-section md:pb-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="max-w-[46rem]">
          <Reveal distance={16}>
            <Eyebrow>Verwandte Leistungen</Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 id="verwandte-titel" className="mt-6 text-title-lg">
              Was an diesem Objekt meist dazukommt.
            </h2>
          </Reveal>
        </header>

        <Reveal delay={0.1} distance={20} amount={0.1} className="mt-10 md:mt-12">
          {/* The rows carry their own hover surface and hairlines, so the
              core has to clip them to its derived radius. */}
          <Bezel
            radius="lg"
            inset="md"
            tone="paper"
            elevation="md"
            innerClassName="overflow-hidden"
          >
            <ul>
              {related.map((entry) => (
                <RelatedRow
                  key={entry.slug}
                  related={entry}
                  icon={SERVICE_ICONS[entry.slug]}
                />
              ))}
            </ul>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
}
