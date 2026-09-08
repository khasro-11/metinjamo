import { Eyebrow, Reveal } from '@/components/ui';
import type { ServiceDetail } from '@/content/service-details';
import { cn } from '@/lib/cn';

/**
 * "Was genau dazugehört" — the section a Hausverwaltung reads before it reads
 * anything else on the page.
 *
 * ## Why this is a list and not a card field
 *
 * The landing page already spends a full section on a bento of cards. A second
 * grid of boxes here would read as the same section twice, and it would push
 * the scope items into equal-sized tiles although they are not equal: some
 * describe a whole area of work, some draw a boundary. Rules and whitespace
 * instead, with the sticky header rail this site already uses in `Advantages`
 * and `Faq` — two sections sharing one structural idea read as a system.
 *
 * ## Why several items say what is *not* included
 *
 * Because that is the sentence the customer needs. A scope list that only ever
 * adds is a scope list nobody can price against, and the boundaries are where
 * cleaning contracts actually go wrong: who fills the soap, who moves the bin,
 * whether the treppenhaus windows are in. Naming them here, and naming the
 * service they belong to instead, is the whole reason the detail pages exist.
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function ServiceScope({ detail }: { detail: ServiceDetail }) {
  return (
    <section
      id="umfang"
      aria-labelledby="umfang-titel"
      className="py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-x-14 xl:gap-x-20">
          {/* scroll-padding-top on html is 7rem for the floating header pill;
              the rail parks just below it. */}
          <header className="lg:col-span-4 lg:sticky lg:top-32">
            <Reveal distance={16}>
              <Eyebrow>Leistungsumfang</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="umfang-titel" className="mt-6 text-title-lg">
                Was dazugehört.
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-copy text-body text-neutral-700">
                {detail.scopeIntro}
              </p>
            </Reveal>
          </header>

          <ul className="lg:col-span-8">
            {detail.scope.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                delay={Math.min(index, 4) * 0.06}
                distance={16}
                amount={0.15}
                /* Inset hairline between rows, never a 1px grey border
                   (CLAUDE.md 5.7). `first:` keeps the rule off the top, where
                   the section already breaks. */
                className={cn(
                  'py-8 first:pt-0 md:py-10 md:first:pt-0',
                  'shadow-[inset_0_1px_0_0_rgb(15_27_36/0.07)] first:shadow-none',
                )}
              >
                <h3 className="text-title-sm text-ink md:text-title-md">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-copy text-body text-neutral-700">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
