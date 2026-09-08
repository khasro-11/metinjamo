import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { PhoneCallIcon } from '@phosphor-icons/react/dist/ssr/PhoneCall';
import { PhoneIncomingIcon } from '@phosphor-icons/react/dist/ssr/PhoneIncoming';
import { SirenIcon } from '@phosphor-icons/react/dist/ssr/Siren';
import Link from 'next/link';

import { Bezel, Eyebrow, Reveal, WindowMark } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * A way to reach us, plus the one sentence that says when it is the RIGHT way.
 *
 * That sentence is the whole point of the section. Three buttons labelled
 * "Anrufen", "Schreiben", "Rückruf" are a switchboard; the same three with a
 * criterion attached are a recommendation, and a Hausverwaltung with a
 * Leistungsverzeichnis in the inbox picks a different channel than an owner
 * standing in a flooded basement.
 */
interface Channel {
  readonly icon: Icon;
  readonly title: string;
  /** When this channel is the right one. Exactly one sentence. */
  readonly when: string;
  /** The value the visitor acts on — phone number, address, or a CTA label. */
  readonly actionLabel: string;
  readonly href: string;
  /** Figures get tabular numerals. */
  readonly numeric?: boolean;
  /** `true` for `tel:` / `mailto:`, which hand off to another application. */
  readonly external: boolean;
  /** The lead card: wider, tinted, and the only one that sets its value large. */
  readonly emphasis?: boolean;
}

/**
 * Three channels, no more. A fourth (WhatsApp) is prepared below but stays
 * commented out until the number is confirmed — see the TODO there.
 *
 * Nothing here promises a response time. No "Rückruf innerhalb von 30 Minuten",
 * no "wir melden uns noch heute": neither is agreed with the client, and a
 * response-time claim that does not hold is a section 5 UWG problem, not just a
 * copy problem (CLAUDE.md 8).
 */
const CHANNELS: readonly Channel[] = [
  {
    icon: PhoneCallIcon,
    title: 'Direkt anrufen',
    // CLAUDE.md 2: urgent cases outside business hours are reachable BY PHONE,
    // and only by phone. That is exactly why this card leads the section.
    when: 'Der richtige Weg, wenn es eilig ist oder Sie die Lage lieber einmal kurz schildern, statt sie aufzuschreiben — bei Akutfällen ohnehin der einzige, der außerhalb der Geschäftszeiten funktioniert.',
    actionLabel: company.phone.display,
    href: company.phone.href,
    numeric: true,
    external: true,
    emphasis: true,
  },
  {
    icon: EnvelopeSimpleIcon,
    title: 'E-Mail schreiben',
    when: 'Der richtige Weg, wenn Sie Unterlagen mitschicken: Leistungsverzeichnis, Objektliste, Grundriss oder Fotos der Flächen.',
    actionLabel: company.email.address,
    href: company.email.href,
    external: true,
  },
  {
    icon: PhoneIncomingIcon,
    title: 'Rückruf vereinbaren',
    // Honest about the mechanism: the form has a free-text `message` field
    // (see lib/quote-request.ts), so "sagen Sie uns, wann" is something the
    // visitor can actually do. There is no dedicated time-slot picker, and
    // this sentence does not pretend there is.
    when: 'Der richtige Weg, wenn Sie tagsüber schlecht telefonieren können — im Formular sagen Sie uns im Nachrichtenfeld, wann Sie am besten erreichbar sind.',
    actionLabel: 'Zum Formular',
    href: primaryCta.href,
    external: false,
  },
];

/*
  TODO (client, CLAUDE.md 12): WhatsApp. Uncomment as a fourth entry in
  CHANNELS above once the WhatsApp-Business number is confirmed AND the
  privacy policy covers it — a WhatsApp link is a data transfer to Meta and
  needs its own paragraph in the Datenschutzerklärung before it goes live.

  The number is NOT necessarily company.phone: WhatsApp Business usually runs
  on a separate line, so this needs its own field in company.ts rather than
  reusing the office number.

  Import `WhatsappLogoIcon` from '@phosphor-icons/react/dist/ssr/WhatsappLogo'
  when activating.

  {
    icon: WhatsappLogoIcon,
    title: 'Per WhatsApp',
    when: 'Der richtige Weg, wenn ein Foto mehr sagt als eine Beschreibung — Schaden, Fläche oder Zustand einmal abfotografiert und geschickt.',
    actionLabel: 'Chat öffnen',
    href: 'https://wa.me/…', // TODO: company.whatsapp.href
    external: true,
  },
*/

/** The nested round wrapper from the CTA idiom (CLAUDE.md 5.8), reused here. */
const ACTION_ICON = cn(
  'grid size-9 shrink-0 place-items-center rounded-full',
  'bg-brand-050 text-brand-700',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'group-hover:bg-brand-300 group-hover:text-brand-900',
);

function ChannelCard({ channel, index }: { channel: Channel; index: number }) {
  const { emphasis } = channel;

  const action = (
    <>
      <span
        data-numeric={channel.numeric ? '' : undefined}
        className={cn(
          'underline-offset-4 group-hover:underline',
          emphasis ? 'text-title-md text-ink' : 'text-body font-medium text-ink',
        )}
      >
        {channel.actionLabel}
      </span>
      <ArrowUpRightIcon
        size={16}
        weight="light"
        aria-hidden="true"
        className={ACTION_ICON}
      />
    </>
  );

  /**
   * The whole card is clickable, but the accessible name stays the link text
   * rather than the entire card content: the `::after` overlay carries the hit
   * area, the anchor carries the label. Focus therefore rings the value, not
   * the card — which is also the more precise focus indicator.
   */
  const actionClasses = cn(
    'group mt-auto inline-flex items-center gap-4 pt-8',
    'rounded-pill focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
    'after:absolute after:inset-0 after:content-[""]',
  );

  return (
    <Reveal
      as="li"
      delay={index * 0.08}
      distance={16}
      amount={0.2}
      className={cn(emphasis && 'sm:col-span-2')}
    >
      <Bezel
        as="article"
        radius={emphasis ? 'xl' : 'lg'}
        inset={emphasis ? 'lg' : 'md'}
        tone={emphasis ? 'tinted' : 'paper'}
        elevation={emphasis ? 'md' : 'sm'}
        interactive
        className="h-full"
        innerClassName={cn(
          'relative flex h-full flex-col',
          emphasis ? 'p-8 md:p-10' : 'p-7 md:p-8',
        )}
      >
        <channel.icon
          size={emphasis ? 28 : 24}
          weight="light"
          aria-hidden="true"
          className="text-brand-700"
        />

        <h3
          className={cn(
            'mt-5',
            emphasis ? 'text-title-md' : 'text-title-sm',
          )}
        >
          {channel.title}
        </h3>

        <p className="mt-3 max-w-copy text-body-sm text-neutral-700">
          {channel.when}
        </p>

        {channel.external ? (
          <a href={channel.href} className={actionClasses}>
            {action}
          </a>
        ) : (
          <Link href={channel.href} className={actionClasses}>
            {action}
          </Link>
        )}
      </Bezel>
    </Reveal>
  );
}

/**
 * Erreichbarkeit panel: the hours, then the one qualification that keeps the
 * hours honest.
 *
 * Values come from `company.openingHours` verbatim — `daysLabel` and
 * `timeLabel` are the display strings company.ts owns for exactly this block,
 * the same ones the footer renders, so the site can never publish two
 * different sets of opening hours (imprint + Google Business Profile NAP).
 */
function AvailabilityPanel() {
  const scheduled = company.openingHours.filter(
    (entry) => entry.kind !== 'emergency',
  );
  const emergency = company.openingHours.find(
    (entry) => entry.kind === 'emergency',
  );

  return (
    <Bezel
      as="aside"
      radius="lg"
      inset="md"
      tone="paper"
      elevation="sm"
      className="h-full"
      innerClassName="flex h-full flex-col p-7 md:p-8"
    >
      <h3 className="flex items-center gap-2 text-eyebrow uppercase text-brand-700">
        <WindowMark className="text-brand-300" />
        <span className="-mr-[0.2em]">Erreichbarkeit</span>
      </h3>

      {/* A description list, not a two-column div grid: the day range is the
          term, the time is its definition, and subgrid keeps both columns on
          one axis without hardcoding a label width. */}
      <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
        {scheduled.map((entry) => (
          <div
            key={entry.daysLabel}
            className="col-span-2 grid grid-cols-subgrid items-baseline"
          >
            <dt className="text-body-sm text-neutral-500">{entry.daysLabel}</dt>
            <dd
              data-numeric={entry.opens ? '' : undefined}
              className="text-body font-medium text-ink"
            >
              {entry.timeLabel}
            </dd>
          </div>
        ))}
      </dl>

      {emergency ? (
        <div
          className="mt-8 flex gap-4 pt-8"
          style={{
            boxShadow: 'inset 0 1px 0 0 rgb(20 84 126 / 0.12)',
          }}
        >
          <SirenIcon
            size={22}
            weight="light"
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand-700"
          />

          <div>
            <p className="text-body-sm font-medium text-ink">
              {emergency.daysLabel}
            </p>
            <p className="mt-2 max-w-copy text-body-sm text-neutral-700">
              {emergency.timeLabel}.
            </p>
            {/* The limit travels with the claim, in the same block. CLAUDE.md 2
                bans "24/7-Notfallservice" outright, and the honest version is
                stronger anyway: it says what we actually pick up the phone for. */}
            <p className="mt-3 max-w-copy text-micro text-neutral-500">
              Einen Rund-um-die-Uhr-Service versprechen wir nicht. Für diese
              beiden Fälle gehen wir auch abends und am Wochenende ans Telefon.
            </p>
          </div>
        </div>
      ) : null}

      <p className="mt-auto max-w-copy pt-8 text-micro text-neutral-500">
        <span className="text-brand-700">Einsatzgebiet:</span>{' '}
        {company.serviceArea.primary}. {company.serviceArea.note}
      </p>
    </Bezel>
  );
}

/**
 * Weitere Kontaktmöglichkeiten — the seventh landing-page section
 * (CLAUDE.md 7), sitting directly under the Angebotsanfrage.
 *
 * It exists because the form is not everyone's channel. A Verwalter with a
 * finished Leistungsverzeichnis will attach it to a mail, and someone with
 * water running down a stairwell will not fill in five steps. So the section
 * does not repeat the CTA — it sorts the alternatives by situation.
 *
 * Asymmetrical Bento, 12 columns from `lg`:
 *
 *   +---------------------------+-----------+
 *   |        Anrufen (8)        |           |
 *   +-------------+-------------+ Zeiten (4)|
 *   |  E-Mail (4) | Rückruf (4) |           |
 *   +-------------+-------------+-----------+
 *
 * The channel cards are one `<ul>` (they are a list of alternatives) and the
 * hours are an `<aside>` beside it (they are not a channel) — the two are
 * nested rather than flattened into one grid, so the list semantics survive
 * without a `display: contents` hack that assistive tech would drop.
 *
 * Below `lg` the aside moves under the cards, below `sm` the lead card gives
 * up its span and everything is a plain stack. Nothing overlaps, nothing
 * rotates, so there is nothing to unwind on mobile.
 *
 * Server component. Motion lives in the Reveal leaves; the cards are links,
 * not scripts.
 */
export function ContactChannels() {
  return (
    <section
      id="kontaktwege"
      aria-labelledby="kontaktwege-titel"
      className="py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal distance={16}>
              <Eyebrow>Weitere Kontaktmöglichkeiten</Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="kontaktwege-titel" className="mt-6 text-title-lg">
                Lieber sprechen als tippen? Auch gut.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:col-span-5">
            <p className="max-w-copy text-body text-neutral-700">
              Das Formular ist der schnellste Weg zu einem Angebot, aber nicht
              der einzige. Welcher Weg für Sie der richtige ist, hängt davon ab,
              was Sie in der Hand haben und wie eilig es ist.
            </p>
          </Reveal>
        </header>

        <div className="mt-14 grid gap-6 md:mt-16 lg:grid-cols-12 lg:gap-5">
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8 lg:gap-5">
            {CHANNELS.map((channel, index) => (
              <ChannelCard
                key={channel.title}
                channel={channel}
                index={index}
              />
            ))}
          </ul>

          <Reveal
            delay={0.16}
            distance={16}
            amount={0.15}
            className="lg:col-span-4"
          >
            <AvailabilityPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
