import { Button, CallButton, Entrance, Eyebrow } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta, serviceNav } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { STAGGER } from '@/lib/motion';

import { HeroVisual } from './hero-visual';

/**
 * Headline candidates put to the client. A wins: it carries the service term
 * (local SEO) and a promise in one line, breaks to exactly two lines at the
 * display size in a 7-column measure, and claims nothing that would need proof
 * under section 5 UWG.
 *
 * B: 'Ein fester Ansprechpartner für Ihre Objekte.'
 *    Sharpest B2B angle, but no service term, so it carries no search weight.
 * C: 'Reinigung und Pflege für Ihre Objekte.'
 *    Purely descriptive. Strongest keyword signal, weakest promise.
 */
const HEADLINE = 'Gebäudepflege, auf die Verlass ist.';

/**
 * TODO (client): confirm the three commitments in the second sentence. They
 * are operational promises the company can make, not measured claims, but
 * nothing goes live that the client has not signed off on.
 */
const SUBLINE =
  'Wir übernehmen die Reinigung und Pflege von Wohn- und Gewerbeobjekten. Feste Teams, feste Ansprechpartner, verbindliche Termine.';

/**
 * The chips are derived from the footer's service list rather than typed out a
 * second time, so the catalogue stays a one-file change once the client
 * confirms it.
 *
 * TODO (client): the catalogue itself is NOT confirmed (CLAUDE.md 12), and the
 * `#leistung-*` anchors do not exist until the Leistungen bento is built — the
 * chips are dead links until then. Nothing here may go live before sign-off:
 * advertising a service that is not offered is a section 5 UWG problem.
 */
const SERVICE_CHIPS = serviceNav.map((item) => ({
  label: item.label,
  href: `#leistung-${item.href.split('/').pop()}`,
}));

/**
 * Flow height of the sticky header pill: pt-6 (1.5rem) + bezel inset
 * (2 x 0.25rem) + the tallest pill child, the logo link at 3.125rem, + pb-3
 * (0.75rem). The hero is pulled up by exactly that and pads it back, so the
 * first screen measures a true 100dvh with the pill floating over the hero's
 * top padding, instead of 100dvh stacked below a header.
 */
const HEADER_SPACE = '5.875rem';

/**
 * The entrance ladder, in milliseconds.
 *
 * Deliberately much tighter than the scroll reveals further down the page. A
 * reveal can afford to be slow because the reader chose to scroll to it; the
 * hero is what someone stares at while deciding whether to stay, so the last
 * chip lands at 480ms rather than the 1.45s the old Reveal ladder needed. The
 * headline moves first and almost immediately, because it is the LCP element.
 *
 * Each step is a multiple of STAGGER.entrance so the rhythm is the scale's, not
 * a set of numbers picked by eye.
 */
const STEP = STAGGER.entrance * 1000;

const ENTER = {
  eyebrow: 0,
  headline: STEP,
  subline: STEP * 2,
  cta: STEP * 3,
  chips: STEP * 4,
  chipStagger: STEP / 2,
} as const;

const CHIP_CLASSES = cn(
  'inline-flex h-11 items-center rounded-pill bg-white px-5 text-body-sm text-neutral-700',
  'shadow-[var(--shadow-ambient-xs),var(--shadow-hairline)]',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'hover:bg-brand-050 hover:text-brand-900',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
);

/**
 * Landing hero. Editorial Split, Soft Structuralism.
 *
 * Copy sits in a 7-column measure, the window field in 5 — asymmetric rather
 * than a 50/50 split, so the headline gets a real line length and the image
 * field stays portrait. Below `lg` the two columns stack in reading order
 * (copy, field, chips) at full width, with no overlaps and no rotations to
 * unwind.
 *
 * Server component. Motion lives in the Reveal leaves and in HeroLight.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      style={{ marginTop: `-${HEADER_SPACE}` }}
      className={cn(
        'flex min-h-[100dvh] flex-col justify-center',
        'pt-[calc(5.875rem+2.5rem)] pb-16',
        'md:pt-[calc(5.875rem+4rem)] md:pb-24',
      )}
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <div className="lg:col-span-7">
            <Entrance delay={ENTER.eyebrow} distance={10}>
              <Eyebrow>
                Privat- und Gewerbekunden · {company.serviceArea.primary}
              </Eyebrow>
            </Entrance>

            <Entrance delay={ENTER.headline} className="mt-6">
              <h1 id="hero-title" className="text-title-xl">
                {HEADLINE}
              </h1>
            </Entrance>

            <Entrance delay={ENTER.subline} className="mt-6">
              <p className="max-w-copy text-lead text-neutral-700">{SUBLINE}</p>
            </Entrance>

            <Entrance
              delay={ENTER.cta}
              className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <Button href={primaryCta.href} size="lg">
                {primaryCta.label}
              </Button>

              <CallButton />
            </Entrance>
          </div>

          <HeroVisual className="mx-auto w-full max-w-[24rem] sm:max-w-[26rem] lg:col-span-5 lg:mx-0 lg:max-w-none" />
        </div>

        <nav aria-label="Leistungen" className="mt-14 md:mt-16">
          <ul className="flex flex-wrap gap-2.5">
            {SERVICE_CHIPS.map((chip, index) => (
              <Entrance
                as="li"
                key={chip.href}
                delay={ENTER.chips + index * ENTER.chipStagger}
                distance={10}
              >
                <a href={chip.href} className={CHIP_CLASSES}>
                  {chip.label}
                </a>
              </Entrance>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
