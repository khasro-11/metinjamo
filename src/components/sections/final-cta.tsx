import { PhoneCallIcon } from '@phosphor-icons/react/dist/ssr/PhoneCall';

import { Bezel, Button, Eyebrow, Reveal } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * Divider between the copy and the action column. Faded at both ends like the
 * trust-bar column rules, and only from `lg`, where the card actually splits
 * into two blocks.
 */
const SPLIT_RULE =
  'lg:before:absolute lg:before:inset-y-2 lg:before:-left-10 lg:before:w-px lg:before:content-[""] lg:before:pointer-events-none lg:before:bg-[linear-gradient(180deg,transparent,rgb(255_255_255/0.20),transparent)]';

/** The regular business hours, for the line under the phone number. */
const businessHours = company.openingHours.find(
  (entry) => entry.kind === 'regular',
);

/**
 * Abschluss-CTA — the tenth and last landing-page section (CLAUDE.md 7),
 * sitting directly above the footer.
 *
 * ## What this section deliberately does not do
 *
 * No countdown, no "nur diesen Monat", no discount, no "Jetzt sichern!". A
 * Hausverwaltung awarding a cleaning contract is not an impulse buyer, and
 * urgency rhetoric at the end of a page that spent its whole length arguing
 * reliability would undo the argument in one line. The section closes by
 * repeating the offer calmly and getting out of the way.
 *
 * It also does not restate the value proposition. Everything above it has made
 * that case; a summary here would be the fourth time the visitor reads it.
 *
 * ## Composition
 *
 * Full-bleed brand-900, Editorial Split inside it: the sentence on the left,
 * the two ways to act on the right, a faded hairline between them from `lg`.
 *
 * This section used to argue for staying light, on the grounds that the one
 * dark card on the page was the liability card in `Advantages` and kept its
 * weight only by being the only one. That reasoning is spent: the page now
 * runs an alternating rhythm with two full-bleed brand-900 anchors
 * (CLAUDE.md 5.9), Ablauf and this one. They are what the eye holds on to
 * across ten sections, and the closing anchor is also what hands the reader
 * into the ink footer without a bright band in between.
 *
 * The panel inside stays a double bezel rather than dissolving into the
 * section: a white/9 shell around a core flush with the ground, so the plate
 * is drawn by its ring instead of by a second fill. That keeps brand-300
 * usable for the headline term, which it would not be on a raised core
 * (2.42:1 there, against 3.41:1 on the flush plate).
 *
 * Two actions, ranked, not balanced: the form is the primary button, the phone
 * number is a plain link underneath. Two equally weighted CTAs are a choice
 * the visitor has to make before acting.
 *
 * Server component. Motion lives in the Reveal leaves and in the CTA's own
 * magnetic pointer physics.
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="abschluss-titel"
      /* Symmetric padding now that the section carries a fill. While it was
         paper, its bottom padding was the footer's own `mt-section-lg` and a
         second stack would have pushed the footer a viewport further down. A
         coloured band cannot borrow the next element's margin: the fill would
         stop at the text instead of at the section boundary. The footer drops
         its top margin in return, so the total whitespace is unchanged. */
      className="bg-brand-900 pt-section pb-section md:pt-section-lg md:pb-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <Reveal distance={20} amount={0.15}>
          <Bezel
            radius="xl"
            inset="lg"
            tone="inkPlate"
            elevation="flat"
            /* p-10 at 360px left 216px of inner width, which is less than the
               246px the primary pill needs, so both the button label and the
               phone number wrapped. */
            innerClassName="p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20"
          >
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-x-20">
              <div className="lg:col-span-7">
                <Eyebrow tone="dark">Nächster Schritt</Eyebrow>

                {/* text-title-xl is 38px at its smallest, so brand-300's
                    3.41:1 on brand-900 clears the 3:1 large-text threshold. */}
                <h2
                  id="abschluss-titel"
                  className="mt-6 max-w-[20ch] text-title-xl text-paper"
                >
                  Der nächste Schritt ist ein{' '}
                  <span className="text-brand-300">Blick auf Ihr Objekt</span>.
                </h2>

                <p className="mt-6 max-w-copy text-lead text-brand-050">
                  Wir nennen keinen Preis, bevor wir gesehen haben, worum es
                  geht. Sagen Sie uns, was ansteht — den Rest klären wir vor
                  Ort, und Sie bekommen ein Angebot, das Sie in Ruhe prüfen
                  können.
                </p>
              </div>

              {/* `relative` anchors the split rule; `items-start` keeps the
                  pill from stretching to the column width. */}
              <div
                className={cn(
                  'relative flex flex-col items-start lg:col-span-5',
                  SPLIT_RULE,
                )}
              >
                {/* Secondary, not primary: the primary surface is
                    brand-900 itself and would disappear into this ground.
                    White on brand-900 with ink text is 17.46:1. */}
                <Button href={primaryCta.href} size="lg" variant="secondary">
                  {primaryCta.label}
                </Button>

                <p className="mt-8 text-body-sm text-brand-050/80">
                  Oder direkt anrufen:
                </p>

                <a
                  href={company.phone.href}
                  className={cn(
                    'group mt-3 inline-flex min-h-11 items-center gap-4 rounded-pill',
                    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                  )}
                >
                  {/* The nested round icon wrapper from the CTA idiom
                      (CLAUDE.md 5.8), so the phone link reads as a sibling of
                      the button above it rather than as body copy. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-full bg-white',
                      'text-brand-700 shadow-[var(--shadow-hairline-brand)]',
                      'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                      'group-hover:bg-brand-300 group-hover:text-brand-900',
                    )}
                  >
                    <PhoneCallIcon size={18} weight="light" />
                  </span>

                  <span
                    data-numeric
                    className="text-title-md text-paper underline-offset-[6px] transition-colors duration-[var(--duration-swift)] ease-imperial-soft group-hover:text-brand-300 group-hover:underline"
                  >
                    {company.phone.display}
                  </span>
                </a>

                {businessHours ? (
                  <p className="mt-4 text-micro text-brand-050/80">
                    {businessHours.daysLabel} {businessHours.timeLabel}. Akutfälle
                    auch außerhalb dieser Zeiten.
                  </p>
                ) : null}
              </div>
            </div>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
}
