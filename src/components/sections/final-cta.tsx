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
  'lg:before:absolute lg:before:inset-y-2 lg:before:-left-10 lg:before:w-px lg:before:content-[""] lg:before:pointer-events-none lg:before:bg-[linear-gradient(180deg,transparent,rgb(20_84_126/0.18),transparent)]';

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
 * One wide tinted bezel, Editorial Split inside it: the sentence on the left,
 * the two ways to act on the right, a faded hairline between them from `lg`.
 * Light rather than an ink panel — the brand is bright (CLAUDE.md 4), and the
 * single dark card on this page is the liability card in `Advantages`, which
 * keeps its weight only as long as it stays the only one.
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
      /* No bottom padding: the footer opens with `mt-section-lg` of its own,
         and adding a second stack of macro whitespace here would push the
         footer a full viewport further down for no reason. */
      className="pt-section md:pt-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <Reveal distance={20} amount={0.15}>
          <Bezel
            radius="xl"
            inset="lg"
            tone="tinted"
            elevation="lg"
            innerClassName="p-10 md:p-14 lg:p-16 xl:p-20"
          >
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-x-20">
              <div className="lg:col-span-7">
                <Eyebrow>Nächster Schritt</Eyebrow>

                <h2
                  id="abschluss-titel"
                  className="mt-6 max-w-[20ch] text-title-xl"
                >
                  Der nächste Schritt ist ein Blick auf Ihr Objekt.
                </h2>

                <p className="mt-6 max-w-copy text-lead text-neutral-700">
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
                <Button href={primaryCta.href} size="lg">
                  {primaryCta.label}
                </Button>

                <p className="mt-8 text-body-sm text-neutral-500">
                  Oder direkt anrufen:
                </p>

                <a
                  href={company.phone.href}
                  className={cn(
                    'group mt-3 inline-flex items-center gap-4 rounded-pill',
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
                    className="text-title-md text-ink underline-offset-[6px] transition-colors duration-[var(--duration-swift)] ease-imperial-soft group-hover:text-brand-900 group-hover:underline"
                  >
                    {company.phone.display}
                  </span>
                </a>

                {businessHours ? (
                  <p className="mt-4 text-micro text-neutral-500">
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
