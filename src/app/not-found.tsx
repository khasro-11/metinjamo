import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import Link from 'next/link';

import { Bezel, Button, CallButton, Entrance, Eyebrow } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * 404, for both `notFound()` and any unmatched URL in the app.
 *
 * No `metadata` export: Next supports that on `global-not-found` only, and the
 * root layout's title template already produces a sensible tab label. The
 * framework injects `noindex` for anything answering 404, so nothing has to be
 * declared here to keep the page out of the index.
 *
 * The page renders inside the root layout, so the header and footer come with
 * it — which is the point. Someone who mistyped a URL should land somewhere
 * that is obviously still Imperial, with the phone number one tap away.
 *
 * Every destination below is a route that exists TODAY. `/leistungen`,
 * `/ueber-uns` and `/kontakt` are still unbuilt (see config/navigation.ts), and
 * sending a visitor from one 404 to another is the one thing this page must not
 * do — so the service and contact links point at the landing-page anchors until
 * those routes ship.
 *
 * Server component. The entrance is CSS, so the whole page is zero JavaScript.
 */

/** Milliseconds. Same ladder shape as the hero, same reason: this is above the fold. */
const ENTER = { eyebrow: 0, headline: 40, lead: 80, actions: 120, aside: 160 };

/** 3 x 3, so a single centre pane can go missing without the grid looking broken. */
const PANE_COUNT = 9;
const MISSING_PANE = 4;

const PANE_LINE = 'inset 0 0 0 1px rgb(20 84 126 / 0.06)';

const LINK_ROW = cn(
  'group flex items-center justify-between gap-4 py-4',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'hover:text-brand-900',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
  'focus-visible:rounded-[0.5rem]',
);

const ONWARD_LINKS = [
  { label: 'Leistungen', href: '/#leistungen' },
  { label: 'Ablauf', href: '/#ablauf' },
  { label: 'Häufige Fragen', href: '/#faq' },
  { label: 'Kontaktmöglichkeiten', href: '/#kontaktwege' },
] as const;

export default function NotFound() {
  return (
    <main
      /* `flex-1` inside the layout's content wrapper, not a viewport height:
         the footer still has to sit below this, and on a short viewport the
         page has to be allowed to grow rather than clip. */
      className={cn(
        'flex flex-1 flex-col justify-center',
        'py-section md:py-section-lg',
      )}
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <div className="lg:col-span-7">
            <Entrance delay={ENTER.eyebrow} distance={10}>
              <Eyebrow>Fehler 404</Eyebrow>
            </Entrance>

            <Entrance delay={ENTER.headline} className="mt-6">
              <h1 className="text-title-xl">Diese Seite gibt es nicht.</h1>
            </Entrance>

            <Entrance delay={ENTER.lead} className="mt-6">
              <p className="max-w-copy text-lead text-neutral-700">
                Möglicherweise hat sich die Adresse geändert oder in der
                Schreibweise ist etwas verrutscht. Über die Startseite finden
                Sie alles Weitere — oder Sie rufen einfach an.
              </p>
            </Entrance>

            <Entrance
              delay={ENTER.actions}
              className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <Button href="/" size="lg">
                Zur Startseite
              </Button>

              <CallButton />
            </Entrance>
          </div>

          <Entrance
            delay={ENTER.aside}
            distance={14}
            className="lg:col-span-5 lg:justify-self-end lg:w-full lg:max-w-[24rem]"
          >
            <Bezel radius="lg" inset="md" tone="paper" elevation="lg">
              <div className="px-6 py-7 sm:px-8">
                {/*
                  The brand mark at object size, with one pane gone. It carries
                  the message without a word of copy and without an illustration
                  that would have to be drawn — the geometry is the logo's own.
                */}
                <div
                  aria-hidden="true"
                  className="grid aspect-[4/3] w-full grid-cols-3 grid-rows-3 overflow-hidden rounded-[1rem] bg-brand-050/70"
                >
                  {Array.from({ length: PANE_COUNT }, (_, index) => (
                    <div
                      key={index}
                      style={{ boxShadow: PANE_LINE }}
                      className={
                        index === MISSING_PANE ? 'bg-paper' : undefined
                      }
                    />
                  ))}
                </div>

                <p className="mt-7 text-body-sm font-medium text-ink">
                  Weiter zu
                </p>

                <ul className="mt-1">
                  {ONWARD_LINKS.map((link) => (
                    <li
                      key={link.href}
                      /* Inset hairline between rows, never a 1px grey border. */
                      className="shadow-[inset_0_-1px_0_0_rgb(15_27_36/0.07)] last:shadow-none"
                    >
                      <Link href={link.href} className={LINK_ROW}>
                        <span className="text-body-sm text-neutral-700 transition-colors duration-[var(--duration-swift)] ease-imperial-soft group-hover:text-brand-900">
                          {link.label}
                        </span>

                        <span
                          aria-hidden="true"
                          className={cn(
                            'grid size-8 shrink-0 place-items-center rounded-full',
                            'bg-brand-050 text-brand-700',
                            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                            'group-hover:bg-brand-300 group-hover:text-brand-900',
                          )}
                        >
                          <ArrowUpRightIcon size={15} weight="light" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Bezel>
          </Entrance>
        </div>
      </div>
    </main>
  );
}
