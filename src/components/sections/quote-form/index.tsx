import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr/LockKey';
import { MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';

import { Eyebrow, IconBadge, Reveal } from '@/components/ui';
import { company } from '@/config/company';

import { QuoteForm } from './quote-form';

export { QuoteForm } from './quote-form';

/**
 * Three lines of reassurance beside the headline — each one a fact this site
 * can stand behind, not a benefit claim. Nothing here promises a response time
 * or a price, because neither is agreed (CLAUDE.md 8 and 12).
 */
const ASSURANCES: readonly { icon: Icon; text: string }[] = [
  {
    icon: ClockIcon,
    text: 'Fünf kurze Schritte. Sie können jederzeit zurück, ohne etwas neu einzugeben.',
  },
  {
    icon: LockKeyIcon,
    text: 'Nur die Angaben, die wir für ein Angebot wirklich brauchen. Keine Adresse, kein Tracking.',
  },
  {
    icon: MapPinIcon,
    text: company.serviceArea.sentence,
  },
];

/**
 * Angebotsanfrage — the sixth landing-page section (CLAUDE.md 7), and the one
 * the whole page exists to reach. `#angebot` is the target of `primaryCta`, so
 * every CTA above lands here.
 *
 * Layout is an Editorial Split header over a single centred card, which is a
 * deliberate break from the rails and bento fields further up: a form is one
 * task, and a sticky column beside it would compete with the thing the visitor
 * is supposed to be doing. A flat brand-050 ground is what separates the
 * section instead.
 *
 * The tint used to be a gradient band faded out at both ends. That was the
 * right call while every section shared one paper ground, because a hard edge
 * would have been the only edge on the page. Now that the page runs an
 * alternating rhythm, a faded band reads as a section that could not commit:
 * the boundary above it lands mid-fade instead of at the section edge, so the
 * step from Uber uns into the form is the one step down the page you cannot
 * see. Flat fill, edge to edge.
 *
 * Server component. All interactivity is isolated in the `QuoteForm` leaf.
 */
export function QuoteFormSection() {
  return (
    <section
      id="angebot"
      aria-labelledby="angebot-titel"
      className="bg-brand-050 py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-14">
          <div className="lg:col-span-7">
            <Reveal distance={16}>
              <Eyebrow>Angebotsanfrage</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="angebot-titel" className="mt-6 text-title-lg">
                Sagen Sie uns, worum es geht — den Rest klären wir{' '}
                <span className="text-brand-700">am Objekt</span>.
              </h2>
            </Reveal>
          </div>

          {/* Offset down on lg so the two halves sit as an editorial split
              rather than as two columns starting on the same line. */}
          <Reveal delay={0.14} className="lg:col-span-5 lg:pt-16">
            <p className="max-w-copy text-body text-neutral-700">
              Ein belastbares Angebot entsteht nicht im Formular. Was wir hier
              brauchen, ist genug, um einzuschätzen, was Ihr Objekt braucht und
              wer sich bei Ihnen meldet.
            </p>

            <ul className="mt-7 grid gap-3.5">
              {ASSURANCES.map((assurance) => (
                <li key={assurance.text} className="flex items-start gap-3">
                  <IconBadge size="sm" className="mt-px">
                    <assurance.icon size={16} weight="light" />
                  </IconBadge>
                  <span className="text-body-sm text-neutral-700">
                    {assurance.text}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1} distance={20} amount={0.1} className="mt-14 md:mt-16">
          {/* Narrower than the shell: a form field wider than this stops being
              comfortable to scan, however much room the page has. */}
          <div className="mx-auto max-w-[62rem]">
            <QuoteForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
