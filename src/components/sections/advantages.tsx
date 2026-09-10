import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { PhoneCallIcon } from '@phosphor-icons/react/dist/ssr/PhoneCall';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/ssr/SlidersHorizontal';
import { UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';

import { Bezel, Button, Eyebrow, Reveal } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * `band`  — icon and title in a fixed left block, copy to its right from `md`.
 *           Reserved for the two full-width rows, which would otherwise read
 *           as a stacked headline floating over an empty half.
 * `stack` — the default column composition for the narrower cards.
 */
type AdvantageLayout = 'band' | 'stack';

interface Advantage {
  readonly icon: Icon;
  readonly title: string;
  readonly body: string;
  /**
   * A second, muted line. Used only where the honest version of the claim
   * needs its own limit stated next to it, rather than buried in the body.
   */
  readonly qualifier?: string;
  /** Pulled out large. Only the insurance card carries one. */
  readonly figure?: string;
  readonly layout: AdvantageLayout;
  /** Grid placement on the six-column field. Below `md` every card is a row. */
  readonly span: string;
  /** The one dark card in the section — see ADVANTAGES below. */
  readonly emphasis?: 'lead' | 'proof';
}

/**
 * Six reasons, each traceable to something the company can evidence or to a
 * practice it controls. No project counts, no satisfaction rates, no
 * certificates — inventing any of those is a section 5 UWG problem, not just a
 * copy problem (CLAUDE.md 8).
 *
 * Card 6 is the one that most sites get wrong: the claim it is tempted into is
 * "24/7-Notfallservice", which is false here. CLAUDE.md 2 fixes the wording,
 * and the qualifier turns that limit into the argument instead of hiding it.
 */
const ADVANTAGES: readonly Advantage[] = [
  {
    icon: UsersThreeIcon,
    title: 'Immer dieselben Leute in Ihrem Objekt',
    body: 'Sie bekommen einen festen Ansprechpartner und ein Team, das Ihr Objekt kennt. Zugänge, Schlüsselregelungen und Besonderheiten erklären Sie einmal, nicht bei jedem Einsatz neu.',
    // TODO (client): confirm this holds without exception. If subcontractors
    // are used for peak loads or for single trades, the sentence has to name
    // that case — an absolute claim that does not hold is the worse risk.
    qualifier:
      'Wir arbeiten mit eigenen Kräften statt mit wechselnden Subunternehmern.',
    layout: 'band',
    span: 'md:col-span-6',
    emphasis: 'lead',
  },
  {
    icon: ClipboardTextIcon,
    title: 'Nachvollziehbar, was wann gemacht wurde',
    // TODO (client): in which form is the work documented — Leistungsnachweis,
    // Protokoll, Fotodoku? — and in which rhythm does the client receive it?
    // Naming the artefact is worth more to a WEG-Verwalter than the generic
    // word, and it is the difference between a practice and a promise.
    body: 'Die ausgeführten Arbeiten werden dokumentiert. Gegenüber Beirat und Eigentümergemeinschaft haben Sie damit eine Grundlage, die über die Rechnung hinausgeht.',
    layout: 'stack',
    span: 'md:col-span-3',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Abgesichert, bevor etwas passiert',
    // The figure is read from company.ts rather than repeated here, so the
    // trust bar, this card and the imprint can never state three different
    // coverage sums.
    figure: company.liabilityInsurance.coverage,
    body: 'Ein Schaden am Treppenhaus oder an der Fassade ist selten. Gedeckt sein muss er trotzdem — und die Verwaltung muss das gegenüber der Eigentümergemeinschaft belegen können.',
    // TODO (client): insurer and scope are still null in company.ts. Once they
    // arrive they belong here as the qualifier, because "10 Mio." without a
    // named policy is the weakest form of this argument.
    layout: 'stack',
    span: 'md:col-span-3',
    emphasis: 'proof',
  },
  {
    icon: SlidersHorizontalIcon,
    title: 'Leistungsumfang nach Objekt, nicht nach Paket',
    body: 'Wir nehmen den Bedarf vor Ort auf und stellen daraus das Leistungsverzeichnis zusammen. Ein Treppenhaus mit sechs Parteien braucht einen anderen Turnus als ein Bürohaus mit Publikumsverkehr. Abgerechnet wird, was im Verzeichnis steht.',
    layout: 'stack',
    span: 'md:col-span-3 lg:col-span-4',
  },
  {
    icon: MapPinIcon,
    title: 'Kurze Wege, weil wir hier sitzen',
    body: `Unser Sitz ist ${company.address.city}, unser Einsatzgebiet ist ${company.serviceArea.primary}. Kurzfristige Termine scheitern nicht an der Anfahrt.`,
    qualifier: company.serviceArea.note,
    layout: 'stack',
    span: 'md:col-span-3 lg:col-span-2',
  },
  {
    icon: PhoneCallIcon,
    title: 'Erreichbar, wenn es nicht bis Montag warten kann',
    // CLAUDE.md 2, verbatim in substance: urgent cases (water damage, winter
    // service) outside business hours, BY PHONE. Never "24/7".
    body: 'Wasserschaden und Winterdienst richten sich nicht nach Geschäftszeiten. Akutfälle dieser Art erreichen Sie auch außerhalb der Geschäftszeiten telefonisch.',
    qualifier:
      'Ein Rund-um-die-Uhr-Versprechen geben wir dafür nicht ab. Wir sagen lieber genau, wofür wir außerhalb der Zeiten ans Telefon gehen.',
    layout: 'band',
    span: 'md:col-span-6',
  },
];

/**
 * Divider inside the band cards, between the title block and the copy. Faded
 * at both ends like the trust-bar column rules, so the two sections share one
 * hairline idiom instead of inventing a second one.
 *
 * Only from `md`, where the band actually splits into two blocks.
 */
const BAND_RULE = cn(
  'relative',
  'md:before:absolute md:before:inset-y-1 md:before:-left-5 md:before:w-px',
  'md:before:content-[""] md:before:pointer-events-none',
  'md:before:bg-[linear-gradient(180deg,transparent,rgb(15_27_36/0.12),transparent)]',
);

function AdvantageCard({ item, index }: { item: Advantage; index: number }) {
  const isBand = item.layout === 'band';
  const isLead = item.emphasis === 'lead';
  const isProof = item.emphasis === 'proof';

  return (
    <Reveal
      as="li"
      // Reading order, not grid order, and capped so the closing band does not
      // arrive noticeably after the rest of the field.
      delay={Math.min(index, 4) * 0.07}
      distance={16}
      amount={0.2}
      className={item.span}
    >
      <Bezel
        as="article"
        radius={isLead ? 'xl' : 'lg'}
        inset={isLead ? 'lg' : 'md'}
        tone={isProof ? 'ink' : isLead ? 'tinted' : 'paper'}
        elevation={isLead ? 'lg' : isProof ? 'md' : 'sm'}
        className="h-full"
        innerClassName={cn(
          'flex h-full flex-col overflow-hidden',
          isLead ? 'p-8 md:p-10 lg:p-11' : 'p-7 md:p-8',
          isBand && 'md:flex-row md:items-start md:gap-10',
        )}
      >
        <div className={cn(isBand && 'md:w-[17rem] md:shrink-0')}>
          <item.icon
            size={isLead ? 30 : 26}
            weight="light"
            aria-hidden="true"
            className={isProof ? 'text-brand-300' : 'text-brand-700'}
          />

          <h3
            className={cn(
              'mt-5',
              isLead ? 'text-title-md lg:text-title-lg' : 'text-title-sm',
              // Heading colour is inherited from the base layer, which sets
              // ink — the dark card has to opt out of it explicitly.
              isProof && 'text-paper',
            )}
          >
            {item.title}
          </h3>
        </div>

        <div className={cn('flex flex-col', isBand ? 'md:flex-1' : 'flex-1', isBand && BAND_RULE)}>
          {item.figure ? (
            <p
              data-numeric
              className="mt-6 text-title-md text-paper md:mt-7"
            >
              {item.figure}
            </p>
          ) : null}

          <p
            className={cn(
              'max-w-copy',
              isLead ? 'text-body md:text-lead' : 'text-body-sm',
              // paper at 85% over brand-900 measures 6.2:1 — AA for body copy.
              isProof ? 'text-paper/85' : 'text-neutral-700',
              isBand ? 'mt-6 md:mt-0' : 'mt-4',
            )}
          >
            {item.body}
          </p>

          {item.qualifier ? (
            <p
              className={cn(
                'mt-auto max-w-copy pt-5 text-micro',
                isProof ? 'text-brand-050/80' : 'text-neutral-500',
              )}
            >
              {item.qualifier}
            </p>
          ) : null}
        </div>
      </Bezel>
    </Reveal>
  );
}

/**
 * Warum Imperial — the fifth landing-page section (CLAUDE.md 7).
 *
 * Editorial Split, Soft Structuralism. The header is a rail that sticks
 * alongside the field from `lg` instead of sitting above it, which is what
 * keeps this section from reading as a third top-header grid after the
 * Leistungen bento and the Ablauf rail.
 *
 * The field itself is six columns and deliberately uneven:
 *
 *   lg                 md
 *   +-----------+      +-----+
 *   |     1     |      |  1  |
 *   +-----+-----+      +--+--+
 *   |  2  |  3  |      |2 |3 |
 *   +---+-+-----+      +--+--+
 *   |   4   | 5 |      |4 |5 |
 *   +-------+---+      +--+--+
 *   |     6     |      |  6  |
 *   +-----------+      +-----+
 *
 * Every row sums to six, so no orphan cell is left over, but no two rows are
 * cut the same way — a three-by-two of identical cards is the templated
 * default this section is shaped to avoid (CLAUDE.md 5.7). Card 1 is the
 * tinted lead, card 3 is the only ink card on the page: the liability cover is
 * the single hard proof in the set, and it is the one a Hausverwaltung checks
 * first.
 *
 * Below 768px every span override drops out, the rail returns to normal flow
 * above the field, and the bands recompose as plain stacks — no overlaps and
 * nothing to unwind.
 *
 * Server component. Motion lives in the Reveal leaves and in the CTA.
 */
export function Advantages() {
  return (
    <section
      id="warum-imperial"
      aria-labelledby="warum-imperial-titel"
      className="bg-paper py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-x-14 xl:gap-x-20">
          {/* scroll-padding-top on html is 7rem for the floating header pill;
              the rail parks just below it. */}
          <header className="lg:col-span-4 lg:sticky lg:top-32">
            <Reveal distance={16}>
              <Eyebrow>Warum Imperial</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="warum-imperial-titel" className="mt-6 text-title-lg">
                Warum Kunden sich für{' '}
                <span className="text-brand-700">Imperial</span> entscheiden.
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-copy text-body text-neutral-700">
                Eine Reinigung ist schnell beauftragt. Der Unterschied zeigt
                sich im zweiten Jahr: ob dieselben Leute kommen, ob
                nachvollziehbar bleibt, was gemacht wurde, und ob jemand
                rangeht, wenn es eilig wird.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-9">
                {/* Magnetism off: the rail is sticky, and a pill that pulls
                    toward the cursor while the page scrolls under it reads as
                    a glitch rather than as physics. */}
                <Button
                  href={primaryCta.href}
                  variant="secondary"
                  size="md"
                  magnetic={false}
                >
                  {primaryCta.label}
                </Button>
              </div>
            </Reveal>
          </header>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-6 md:gap-5 lg:col-span-8">
            {ADVANTAGES.map((item, index) => (
              <AdvantageCard key={item.title} item={item} index={index} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
