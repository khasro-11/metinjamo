import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { NotePencilIcon } from '@phosphor-icons/react/dist/ssr/NotePencil';

import { Bezel, Eyebrow, Reveal } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ProcessStep {
  readonly icon: Icon;
  readonly title: string;
  readonly body: string;
}

/**
 * Four steps, in the order a Hausverwaltung actually experiences them.
 *
 * Every sentence describes a process the client controls, not an outcome we
 * would have to prove: no turnaround promises, no satisfaction claims, no
 * numbers. The four TODOs below are the only statements here that are the
 * client's to confirm rather than ours to write.
 */
const STEPS: readonly ProcessStep[] = [
  {
    icon: NotePencilIcon,
    title: 'Anfrage stellen',
    // TODO (client): "unter zwei Minuten" is a claim about our own form —
    // re-measure once the multi-step form (CLAUDE.md 7, section 6) is final
    // and drop the sentence if it no longer holds.
    body: 'Über das Formular oder am Telefon. Objektart, gewünschte Leistung und Rhythmus genügen für den Anfang, ausgefüllt ist das Formular in unter zwei Minuten.',
  },
  {
    icon: BuildingsIcon,
    title: 'Objekt ansehen',
    // TODO (client): confirm that the on-site visit is in fact free of charge
    // and non-binding in every case, including objects outside Duisburg.
    body: 'Wir kommen vorbei und nehmen den Bedarf vor Ort auf: Flächen, Zugänge, Turnus, Besonderheiten. Die Besichtigung ist kostenlos und unverbindlich.',
  },
  {
    icon: FileTextIcon,
    title: 'Festes Angebot',
    // TODO (client): confirm the pricing practice this sentence commits to —
    // written quote, fixed price, no line items billed on top.
    body: 'Sie bekommen ein schriftliches Angebot mit klarem Leistungsverzeichnis und festem Preis. Was nicht darin steht, wird auch nicht berechnet.',
  },
  {
    icon: CalendarCheckIcon,
    title: 'Start und laufende Betreuung',
    // TODO (client): in which form are the works documented (Leistungsnachweis,
    // Protokoll, Fotodoku)? Naming it is worth more to a WEG-Verwalter than
    // the generic word.
    body: 'Zum vereinbarten Termin legen wir los. Sie haben einen festen Ansprechpartner, und die ausgeführten Arbeiten werden dokumentiert.',
  },
];

/**
 * The rail geometry, in one place: the node is 2.75rem square, so its centre
 * sits at 1.375rem on both axes. Every rail offset below is derived from that
 * pair, which is why the horizontal and the vertical line meet their nodes at
 * exactly the same point.
 */
const NODE_CENTRE = '1.375rem';
/** Node box (2.75rem) plus a 0.5rem breathing gap before the line starts. */
const RAIL_START = '3.25rem';

/**
 * Directional fade: dense at the node it leaves, light at the node it
 * approaches. Brand-tinted rather than the neutral hairline used for the
 * trust-bar rules — this line carries meaning (sequence), it is not a divider.
 */
const RAIL_HORIZONTAL =
  'linear-gradient(90deg, rgb(20 84 126 / 0.22), rgb(20 84 126 / 0.07))';
const RAIL_VERTICAL =
  'linear-gradient(180deg, rgb(20 84 126 / 0.22), rgb(20 84 126 / 0.07))';

const NODE_BASE =
  'grid size-11 shrink-0 place-items-center rounded-[1.125rem]';

/**
 * The step marker sitting on the rail. It carries the icon, so the card below
 * does not repeat it — the node is the only place a step is marked, which is
 * what lets the card hold nothing but a title and one sentence.
 *
 * The terminal node is filled: step 4 is not a station you pass through, it is
 * where the relationship stays.
 */
function StepNode({ icon: StepIcon, terminal }: { icon: Icon; terminal: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        boxShadow: terminal
          ? 'inset 0 0 0 1px rgb(255 255 255 / 0.14), var(--shadow-ambient-sm)'
          : 'var(--shadow-bevel), var(--shadow-hairline), var(--shadow-ambient-xs)',
      }}
      className={cn(
        NODE_BASE,
        'absolute left-0 top-0 lg:static',
        terminal ? 'bg-brand-900 text-paper' : 'bg-white text-brand-700',
      )}
    >
      <StepIcon size={20} weight="light" />
    </span>
  );
}

function StepItem({ step, index }: { step: ProcessStep; index: number }) {
  const isLast = index === STEPS.length - 1;

  return (
    <Reveal
      as="li"
      // Staggered along the rail, so the sequence assembles in the direction
      // it is meant to be read.
      delay={index * 0.09}
      distance={18}
      amount={0.25}
      className="relative pl-[3.75rem] lg:flex lg:flex-col lg:pl-0"
    >
      <StepNode icon={step.icon} terminal={isLast} />

      {/* Rail segments. Two elements rather than one rotated line: the
          horizontal and the vertical run only at the breakpoint they belong
          to, and neither is drawn after the last node — the sequence has to
          end somewhere visible. */}
      {isLast ? null : (
        <>
          <span
            aria-hidden="true"
            style={{
              top: RAIL_START,
              left: NODE_CENTRE,
              backgroundImage: RAIL_VERTICAL,
            }}
            className="pointer-events-none absolute -bottom-8 w-px lg:hidden"
          />
          <span
            aria-hidden="true"
            style={{
              top: NODE_CENTRE,
              left: RAIL_START,
              backgroundImage: RAIL_HORIZONTAL,
            }}
            className="pointer-events-none absolute hidden h-px -right-4 lg:block"
          />
        </>
      )}

      <Bezel
        as="article"
        radius="lg"
        inset="md"
        tone={isLast ? 'tinted' : 'paper'}
        elevation={isLast ? 'md' : 'sm'}
        className="lg:mt-8 lg:flex-1"
        innerClassName={cn(
          'relative flex h-full flex-col overflow-hidden p-6 sm:p-7 md:p-8',
          // From md the card is wide enough that a stacked title over one
          // sentence reads as an empty box, so title and copy sit side by
          // side — until lg, where the column is narrow again.
          'md:flex-row md:items-start md:gap-10 lg:flex-col lg:gap-0',
        )}
      >
        {/* The ordinal, as tone rather than as text. Clipped by the core so it
            reads as a printed number the card was cut out of. The <ol> already
            carries the position for assistive tech, so this is decorative. */}
        <span
          aria-hidden="true"
          data-numeric
          className={cn(
            'pointer-events-none absolute -top-4 right-3 select-none font-medium leading-none',
            // Alpha, not the opaque brand-050 tint: the numeral has to keep
            // the same distance from its surface on the white cards and on
            // the tinted terminal card, where an opaque tint would vanish.
            'text-[5.5rem] tracking-[-0.05em] text-brand-900/[0.075] md:right-6 md:text-[6.5rem] lg:right-4 lg:text-[7rem]',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <h3 className="relative text-title-sm text-ink md:w-[15rem] md:shrink-0 md:text-title-md lg:w-auto">
          {step.title}
        </h3>

        <p className="relative mt-3 max-w-copy text-body-sm text-neutral-700 md:mt-0 md:flex-1 lg:mt-4 lg:flex-none">
          {step.body}
        </p>
      </Bezel>
    </Reveal>
  );
}

/**
 * Ablauf — the fourth landing-page section (CLAUDE.md 7).
 *
 * A progression rail, not a card row: four nodes on one continuous line, each
 * hanging its own card. Horizontal from `lg`, a vertical timeline below it —
 * the same geometry read on the other axis, so nothing about the sequence
 * changes on a phone.
 *
 * The four columns are deliberately unequal (`1fr 1fr 1fr 1.15fr`) and the
 * last card is tinted and elevated. That is the one asymmetry in the section
 * and it is load-bearing: three finite steps, then a state that continues.
 * Four identical cards in a row is the templated default this section is
 * shaped to avoid (CLAUDE.md 5.7).
 *
 * `id="ablauf"` is the target of the header nav anchor in `config/navigation`.
 *
 * Server component. Motion lives in the Reveal leaves.
 */
export function ProcessSteps() {
  return (
    <section
      id="ablauf"
      aria-labelledby="ablauf-titel"
      className="py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal distance={16}>
              <Eyebrow>Ablauf</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="ablauf-titel" className="mt-6 text-title-lg">
                Von der Anfrage bis zur laufenden Betreuung.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:col-span-5">
            <p className="max-w-copy text-body text-neutral-700">
              Wir nennen keinen Preis, bevor wir das Objekt gesehen haben.
              Danach wissen Sie, wer kommt, was gemacht wird und was es kostet.
            </p>
          </Reveal>
        </header>

        <ol className="mt-14 grid grid-cols-1 gap-y-10 md:mt-16 lg:grid-cols-[1fr_1fr_1fr_1.15fr] lg:gap-x-6 lg:gap-y-0">
          {STEPS.map((step, index) => (
            <StepItem key={step.title} step={step} index={index} />
          ))}
        </ol>
      </div>
    </section>
  );
}
