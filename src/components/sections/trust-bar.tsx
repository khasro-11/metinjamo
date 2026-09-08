import { CertificateIcon } from '@phosphor-icons/react/dist/ssr/Certificate';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { PhoneCallIcon } from '@phosphor-icons/react/dist/ssr/PhoneCall';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';

import { Reveal } from '@/components/ui';
import type { Weekday } from '@/config/company';
import { company, regularOpeningHours } from '@/config/company';
import { cn } from '@/lib/cn';

/**
 * German weekday abbreviations.
 *
 * Deliberately derived from the structured `days` array rather than reusing
 * `daysLabel` / `timeLabel` from company.ts: those are display strings and
 * spell their ranges with an en dash, which is banned in visible copy
 * (design-taste-frontend 9.G). Reading the structured fields keeps company.ts
 * the single source of truth for the DATA while this section owns the
 * TYPOGRAPHY, so neither rule has to give way.
 */
const WEEKDAY_SHORT: Record<Weekday, string> = {
  Monday: 'Mo',
  Tuesday: 'Di',
  Wednesday: 'Mi',
  Thursday: 'Do',
  Friday: 'Fr',
  Saturday: 'Sa',
  Sunday: 'So',
};

function formatDayRange(days: readonly Weekday[]): string {
  if (days.length === 0) return '';
  const first = WEEKDAY_SHORT[days[0]];
  if (days.length === 1) return first;
  return `${first} bis ${WEEKDAY_SHORT[days[days.length - 1]]}`;
}

const businessHours = regularOpeningHours[0];

interface TrustFact {
  readonly icon: Icon;
  /** The reassurance, set in ink. */
  readonly claim: string;
  /** The proof underneath it, set muted. */
  readonly proof: string;
  /** Figures get tabular numerals so the row lines up. */
  readonly numeric?: boolean;
}

/**
 * Every entry is a fact the client can evidence today: an insurance policy, a
 * register entry, published opening hours, a service area. There are no
 * project counts, no satisfaction rates and no reviews here, because none
 * exist yet, and inventing them would be a section 5 UWG problem, not just a
 * copy problem. The commented metrics slot below is where those go once they
 * are real.
 */
const TRUST_FACTS: readonly TrustFact[] = [
  {
    icon: ShieldCheckIcon,
    claim: company.liabilityInsurance.coverage,
    proof: company.liabilityInsurance.type,
    numeric: true,
  },
  {
    icon: CertificateIcon,
    // A characterisation of the register entry below it, not a separate claim.
    claim: 'Eingetragene GmbH',
    proof: `${company.registry.court}, ${company.registry.number}`,
  },
  {
    icon: ClockIcon,
    claim: `${formatDayRange(businessHours.days)}, ${businessHours.opens} bis ${businessHours.closes} Uhr`,
    proof: 'Feste Erreichbarkeit',
    numeric: true,
  },
  {
    icon: PhoneCallIcon,
    // CLAUDE.md 2: never "24/7 emergency service". The limits travel with the
    // claim, in the same tile: which cases, and by which channel.
    claim: 'Akutfälle außerhalb der Zeiten',
    proof: 'Wasserschaden und Winterdienst, telefonisch',
  },
  {
    icon: MapPinIcon,
    claim: company.serviceArea.primary,
    proof: company.serviceArea.note,
  },
];

/**
 * Hairline between the columns, centred in the gutter and faded at both ends
 * so it does not butt into the row edges. Same idiom as the header separator.
 *
 * Vertical rules exist only from `lg`, where the facts actually sit side by
 * side. Below that the columns stack and whitespace does the grouping, which
 * is the quieter choice and avoids rules that would land in the wrong place
 * at the two-column breakpoint.
 */
const COLUMN_RULE = cn(
  'relative',
  'lg:before:absolute lg:before:inset-y-0 lg:before:-left-5 lg:before:w-px',
  'lg:before:content-[""] lg:before:pointer-events-none',
  'lg:before:bg-[linear-gradient(180deg,transparent,rgb(15_27_36/0.12),transparent)]',
  'lg:first:before:hidden',
);

/**
 * The reassurance band under the hero.
 *
 * A hairline colonnade, not a card row: five plain columns divided by faded
 * rules. design-taste-frontend 4.4 reserves elevation for real hierarchy, and
 * these facts are peers, so they get whitespace and rules instead of five
 * bezels competing with the hero directly above them.
 *
 * No visible heading and no eyebrow. This is a zone the reader scans on the
 * way past, so the accessible name carries the label instead.
 *
 * Server component. Only the reveal leaves need the browser.
 */
export function TrustBar() {
  return (
    <section
      aria-labelledby="vertrauen-titel"
      /* Asymmetric on purpose, and the only section that is. The top is tight
         because this band belongs to the hero — it is the hero's claim being
         evidenced, not a new topic. The bottom is the standard section
         boundary, so the step into Leistungen is the same size as every other
         step down the page. */
      className="pt-16 pb-section md:pt-20 md:pb-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <h2 id="vertrauen-titel" className="sr-only">
          Absicherung und Erreichbarkeit
        </h2>

        {/* Seats the band under the hero without drawing a hard edge. */}
        <div
          aria-hidden="true"
          className="h-px w-full"
          style={{
            backgroundImage:
              'linear-gradient(90deg, transparent, rgb(15 27 36 / 0.10) 18%, rgb(15 27 36 / 0.10) 82%, transparent)',
          }}
        />

        {/*
          TODO (client): metrics slot. Uncomment as a block once REAL figures
          exist and are signed off (CLAUDE.md 12: founding year, headcount,
          objects under contract). Do not activate it with estimates or round
          numbers: an invented figure here is exactly the section 5 UWG risk
          this whole section is built to avoid. Values belong in company.ts,
          not in this file.

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:gap-x-10">
            {METRICS.map((metric, index) => (
              <Reveal
                as="div"
                key={metric.label}
                delay={index * 0.06}
                distance={12}
                className={COLUMN_RULE}
              >
                <dt className="text-micro text-neutral-500">{metric.label}</dt>
                <dd
                  data-numeric
                  className="mt-2 text-title-lg text-ink"
                >
                  {metric.value}
                </dd>
              </Reveal>
            ))}
          </dl>

          <div
            aria-hidden="true"
            className="mt-14 h-px w-full"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent, rgb(15 27 36 / 0.10) 18%, rgb(15 27 36 / 0.10) 82%, transparent)',
            }}
          />
        */}

        <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-5 lg:gap-x-10">
          {TRUST_FACTS.map((fact, index) => (
            <Reveal
              as="li"
              key={fact.claim}
              delay={index * 0.06}
              distance={12}
              className={cn(
                COLUMN_RULE,
                // Five items, five cells: the last one spans the orphan column
                // at the two-column breakpoint rather than leaving a gap.
                index === TRUST_FACTS.length - 1 && 'sm:col-span-2 lg:col-span-1',
              )}
            >
              <fact.icon
                size={22}
                weight="light"
                aria-hidden="true"
                className="text-brand-700"
              />

              <p
                data-numeric={fact.numeric ? '' : undefined}
                className="mt-4 text-body-sm font-medium text-ink"
              >
                {fact.claim}
              </p>

              <p className="mt-1 text-micro text-neutral-500">{fact.proof}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
