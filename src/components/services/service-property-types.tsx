import { Bezel, Eyebrow, Reveal } from '@/components/ui';
import type { ServiceDetail } from '@/content/service-details';
import { cn } from '@/lib/cn';

/**
 * "Für welche Objektarten" — one tinted panel, not a row of cards.
 *
 * The three or four entries are variants of one answer, so they are set as a
 * description list inside a single container rather than as separate boxes.
 * That also keeps CLAUDE.md 5.7 satisfied by construction: there is no row of
 * equally sized feature cards here to fall into, because there is only one
 * card.
 *
 * `subgrid` puts every term and every body on the same two axes without
 * hardcoding a label column width, so a long property type ("WEG-Anlagen mit
 * mehreren Aufgängen") does not push its own row out of alignment with the
 * others.
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function ServicePropertyTypes({ detail }: { detail: ServiceDetail }) {
  return (
    <section
      id="objektarten"
      aria-labelledby="objektarten-titel"
      className="pb-section md:pb-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal distance={16}>
              <Eyebrow>Objektarten</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="objektarten-titel" className="mt-6 text-title-lg">
                Für welche Objekte wir das übernehmen.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:col-span-5">
            <p className="max-w-copy text-body text-neutral-700">
              {detail.propertyTypesIntro}
            </p>
          </Reveal>
        </header>

        <Reveal delay={0.1} distance={20} amount={0.1} className="mt-12 md:mt-14">
          <Bezel
            radius="xl"
            inset="lg"
            tone="tinted"
            elevation="md"
            innerClassName="p-8 md:p-12 lg:p-14"
          >
            <dl className="grid gap-x-12 md:grid-cols-[minmax(0,18rem)_1fr]">
              {detail.propertyTypes.map((type, index) => (
                <div
                  key={type.title}
                  className={cn(
                    'grid gap-2 py-6 first:pt-0 last:pb-0 md:col-span-2 md:grid-cols-subgrid md:gap-x-12 md:py-8',
                    index > 0 &&
                      'shadow-[inset_0_1px_0_0_rgb(20_84_126/0.14)]',
                  )}
                >
                  <dt className="text-title-sm text-ink">{type.title}</dt>
                  <dd className="max-w-copy text-body text-neutral-700">
                    {type.body}
                  </dd>
                </div>
              ))}
            </dl>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
}
