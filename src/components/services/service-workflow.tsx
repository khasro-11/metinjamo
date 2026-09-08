import { Eyebrow, Reveal } from '@/components/ui';
import type { ServiceDetail } from '@/content/service-details';
import { cn } from '@/lib/cn';

/**
 * "Typischer Ablauf" — the service's own execution sequence.
 *
 * ## Why this is numbered and the landing page's Ablauf is not
 *
 * Numbered markers are only honest when the content really is a sequence, and
 * both of these are — but they are different sequences. The landing page
 * describes the commercial path every customer walks once (Anfrage,
 * Besichtigung, Angebot, Start). This describes how one service is actually
 * run, and it differs per page: a Winterdienst starts with a Flächenplan
 * before the first frost, an Entrümpelung ends with a Rundgang through an
 * empty flat.
 *
 * Because the landing page already owns the rail-with-nodes treatment, this
 * one is set as a plain ordered list with the ordinal in a left rail. Same
 * information, different device — repeating the rail here would make the two
 * sequences look like the same one told twice.
 *
 * The ordinal is `aria-hidden`: an `<ol>` already conveys position to
 * assistive technology, so reading "null eins" before every step would be
 * noise.
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function ServiceWorkflow({ detail }: { detail: ServiceDetail }) {
  return (
    <section
      id="ablauf"
      aria-labelledby="ablauf-titel"
      className="pb-section md:pb-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="max-w-[46rem]">
          <Reveal distance={16}>
            <Eyebrow>Ablauf</Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 id="ablauf-titel" className="mt-6 text-title-lg">
              Wie ein Auftrag konkret läuft.
            </h2>
          </Reveal>
        </header>

        <ol className="mt-12 md:mt-14">
          {detail.workflow.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={Math.min(index, 4) * 0.08}
              distance={18}
              amount={0.2}
              className={cn(
                'grid gap-x-8 gap-y-3 py-8 first:pt-0 md:grid-cols-12 md:gap-x-12 md:py-10',
                'shadow-[inset_0_1px_0_0_rgb(15_27_36/0.07)] first:shadow-none',
              )}
            >
              <div className="md:col-span-4 md:flex md:items-baseline md:gap-5">
                <span
                  aria-hidden="true"
                  data-numeric
                  className="text-eyebrow uppercase text-brand-700 md:shrink-0"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3 className="mt-2 text-title-sm text-ink md:mt-0 md:text-title-md">
                  {step.title}
                </h3>
              </div>

              <p className="max-w-copy text-body text-neutral-700 md:col-span-7 md:col-start-6">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
