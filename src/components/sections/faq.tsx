import { Eyebrow, Reveal } from '@/components/ui';
import { company } from '@/config/company';
import { faqItems } from '@/content/faq';

import { FaqAccordion } from './faq-accordion';

/**
 * `FAQPage` structured data (CLAUDE.md 9).
 *
 * Built from the same `faqItems` array the accordion renders, so the answer in
 * a rich result can never say something the page does not. Google treats a
 * mismatch as a policy violation, and a second hand-maintained copy of these
 * strings would drift within a week.
 *
 * Rendered as a plain script tag rather than through next/script: it is static
 * markup with no execution and belongs in the initial HTML, where crawlers
 * read it without running JavaScript.
 */
function FaqJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // The payload is our own build-time constant, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ — the ninth landing-page section (CLAUDE.md 7).
 *
 * Editorial Split with a rail that sticks from `lg`: the questions run in one
 * long column on the right while the header and the fallback ("nicht dabei?
 * rufen Sie an") stay in view beside them. The two sections above this one are
 * card fields, so this one is deliberately not — rules and whitespace instead
 * of a third grid of boxes.
 *
 * The rail repeats the sticky-header geometry from `Advantages` on purpose.
 * Two sections sharing one structural idea reads as a system; a third distinct
 * header treatment in a row reads as indecision.
 *
 * Below `lg` the rail returns to normal flow above the list and every row is
 * full width. Nothing overlaps, so there is nothing to unwind.
 *
 * Server component: the copy, the JSON-LD and the layout are static. Only the
 * open/closed state needs the browser, and it is isolated in the
 * `FaqAccordion` leaf.
 */
export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-titel"
      className="bg-brand-050 py-section md:py-section-lg"
    >
      <FaqJsonLd />

      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-x-14 xl:gap-x-20">
          {/* scroll-padding-top on html is 7rem for the floating header pill;
              the rail parks just below it. */}
          <header className="lg:col-span-4 lg:sticky lg:top-32">
            <Reveal distance={16}>
              <Eyebrow>Häufige Fragen</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="faq-titel" className="mt-6 text-title-lg">
                Was Verwaltungen und Eigentümer uns{' '}
                <span className="text-brand-700">vorher fragen</span>.
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-copy text-body text-neutral-700">
                Die Antworten hier sind so konkret, wie sie sein können, bevor
                wir Ihr Objekt gesehen haben. Alles Weitere klärt sich bei der
                Besichtigung.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-9 max-w-copy text-body-sm text-neutral-500">
                Ihre Frage ist nicht dabei? Rufen Sie an unter{' '}
                <a
                  href={company.phone.href}
                  data-numeric
                  className="text-brand-900 underline decoration-brand-300 decoration-1 underline-offset-4 transition-colors duration-[var(--duration-swift)] ease-imperial-soft hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500"
                >
                  {company.phone.display}
                </a>{' '}
                — das geht meist schneller als eine E-Mail.
              </p>
            </Reveal>
          </header>

          <Reveal
            delay={0.1}
            distance={20}
            amount={0.05}
            className="lg:col-span-8"
          >
            <FaqAccordion items={faqItems} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
