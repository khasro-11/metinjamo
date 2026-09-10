import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { WindowMark } from '@/components/ui';
import { company } from '@/config/company';
import { legalNav, primaryNav, serviceNav } from '@/config/navigation';
import { cn } from '@/lib/cn';

import { LOGO_LINK_LABEL, Logo } from './logo';

/**
 * Shared link treatment. Underline appears on hover rather than sitting there
 * permanently — four columns of permanently underlined links read as a
 * sitemap dump, not as a footer.
 */
const LINK_CLASS = cn(
  'inline-flex min-h-11 items-center text-body-sm text-brand-050 underline-offset-4',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'hover:text-brand-300 hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500',
);

/**
 * Column label. Uses the eyebrow scale from the token set, marked with the
 * window motif from the logo icon so the four columns share one rhythm.
 * Deliberately not the `<Eyebrow>` primitive: these are real headings, and
 * that component is typed to non-heading elements.
 */
function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-eyebrow uppercase text-brand-300">
      <WindowMark className="text-brand-300" />
      <span className="-mr-[0.2em]">{children}</span>
    </h2>
  );
}

/** Icon gutter for the contact rows, so labels align on a single axis. */
function ContactRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-white/[0.08] text-brand-300 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.10)]"
      >
        {icon}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Site footer.
 *
 * Every value shown here — address, phone, mail, hours, service area — is read
 * from `company.ts`. That is what keeps the footer, the imprint and the Google
 * Business Profile telling the same story, which is both a legal and a local
 * SEO requirement.
 *
 * Ink ground, closing the section rhythm from CLAUDE.md 5.9: the page steps
 * from the brand-900 Abschluss-CTA into the darkest surface it has, so the
 * bottom of the page reads as an end rather than as one more band. Measured on
 * ink: paper 17.00:1, brand-050 16.4:1, brand-300 7.36:1, neutral-400 5.35:1.
 * brand-700, which carried the column headings and the inline accents while
 * the footer was brand-050, drops to 2.2:1 here and is gone from this file.
 *
 * The top margin is gone with it. The Abschluss-CTA now carries its own bottom
 * padding, because a filled band cannot end at its text.
 *
 * Server component: no state, no motion, nothing to hydrate.
 */
export function SiteFooter() {
  // Evaluated when the page is rendered. A fully static build freezes this at
  // build time, which is the accepted trade for not shipping a client
  // component to print a year.
  const year = new Date().getFullYear();

  const scheduled = company.openingHours.filter(
    (entry) => entry.kind !== 'emergency',
  );
  const emergency = company.openingHours.find(
    (entry) => entry.kind === 'emergency',
  );

  return (
    <footer
      className="bg-ink"
      style={{ boxShadow: 'inset 0 1px 0 0 rgb(255 255 255 / 0.10)' }}
    >
      <div className="mx-auto max-w-shell px-6 py-section md:px-10 md:py-section-md">
        {/* Asymmetric on purpose — the brand and contact columns carry more
            text than the two link lists and are given the width for it. */}
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={LOGO_LINK_LABEL}
              className="self-start rounded-bezel-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
            >
              {/* Larger than in the header: the pill rations vertical space,
                  the footer's brand column does not, and this is the block
                  that has to read as the signature of the page. */}
              <Logo variant="wordmark" tone="white" height={46} />
            </Link>

            <p className="max-w-copy text-body text-brand-050">
              Gebäudeservice für Hausverwaltungen, Gewerbeobjekte und
              Eigentümer.
            </p>

            <p className="max-w-copy text-body-sm text-neutral-400">
              {company.serviceArea.sentence}
            </p>

            {/* A verified fact from company.ts, not a marketing promise —
                the one trust signal in the footer that is actually provable. */}
            <p className="max-w-copy text-micro text-neutral-400">
              {company.liabilityInsurance.type} mit{' '}
              {company.liabilityInsurance.coverage}.
            </p>
          </div>

          <nav aria-label="Footer-Navigation" className="flex flex-col gap-5">
            <ColumnHeading>Menü</ColumnHeading>
            <ul className="flex flex-col gap-0.5">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* One link per category, not per individual service: eighteen rows
              here would be a sitemap dump. Each resolves to a bento tile
              anchor on the landing page (CLAUDE.md 7a). */}
          <nav aria-label="Leistungen" className="flex flex-col gap-5">
            <ColumnHeading>Leistungen</ColumnHeading>
            <ul className="flex flex-col gap-0.5">
              {serviceNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-5">
            <ColumnHeading>Kontakt</ColumnHeading>

            <div className="flex flex-col gap-4">
              <ContactRow
                icon={<MapPinIcon size={15} weight="light" />}
              >
                <address className="text-body-sm not-italic text-brand-050">
                  {company.address.street}
                  <br />
                  {company.address.postalCode} {company.address.city}
                </address>
              </ContactRow>

              <ContactRow icon={<PhoneIcon size={15} weight="light" />}>
                <a
                  href={company.phone.href}
                  className={LINK_CLASS}
                  data-numeric
                >
                  {company.phone.display}
                </a>
              </ContactRow>

              <ContactRow icon={<EnvelopeIcon size={15} weight="light" />}>
                <a href={company.email.href} className={cn(LINK_CLASS, 'break-all')}>
                  {company.email.address}
                </a>
              </ContactRow>
            </div>

            {/* Hours as a description list: the day is the term, the time is
                its definition. A two-column div grid would say nothing. */}
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-body-sm">
              {scheduled.map((entry) => (
                <div key={entry.daysLabel} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="text-neutral-400">{entry.daysLabel}</dt>
                  <dd className="text-brand-050">{entry.timeLabel}</dd>
                </div>
              ))}
            </dl>

            {emergency ? (
              <p className="max-w-copy text-micro text-neutral-400">
                <span className="text-brand-300">{emergency.daysLabel}:</span>{' '}
                {emergency.timeLabel}
              </p>
            ) : null}

            <p className="max-w-copy text-micro text-neutral-400">
              <span className="text-brand-300">Einsatzgebiet:</span>{' '}
              {company.serviceArea.primary}. {company.serviceArea.note}
            </p>
          </div>
        </div>

        <div
          className="mt-16 flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ boxShadow: 'inset 0 1px 0 0 rgb(255 255 255 / 0.10)' }}
        >
          <p className="text-micro text-neutral-400">
            © {year} {company.legalName}
          </p>

          <nav aria-label="Rechtliches">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex min-h-11 items-center',
                      'text-micro text-neutral-400 underline-offset-4',
                      'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                      'hover:text-brand-300 hover:underline',
                      'focus-visible:outline-2 focus-visible:outline-offset-3',
                      'focus-visible:outline-brand-500',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
