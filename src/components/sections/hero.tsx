import { Button, Entrance } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { STAGGER } from '@/lib/motion';

import { HeroCollage } from './hero-collage';

/**
 * Headline candidates put to the client. A wins: it carries the service term
 * (local SEO) and a promise in one line, breaks to exactly two lines at the
 * display size, and claims nothing that would need proof under section 5 UWG.
 *
 * B: 'Ein fester Ansprechpartner für Ihre Objekte.'
 *    Sharpest B2B angle, but no service term, so it carries no search weight.
 * C: 'Reinigung und Pflege für Ihre Objekte.'
 *    Purely descriptive. Strongest keyword signal, weakest promise.
 *
 * The two halves are separate elements because they take different colours,
 * not because they are separate sentences. They are read as one line and the
 * markup keeps them inside one `<h1>`.
 */
const HEADLINE_LEAD = 'Gebäudepflege,';
const HEADLINE_ACCENT = 'auf die Verlass ist.';

/** 'Imperial Gebäude Service:' — the legal name without its legal form. */
const INTRO = `${company.legalName.replace(/\s*GmbH$/, '')}:`;

/**
 * TODO (client): confirm this sentence and the three facts below it. They are
 * operational promises the company can make, not measured claims, but nothing
 * goes live that the client has not signed off on.
 */
const LEAD =
  'Wir übernehmen die Reinigung und Pflege von Wohn- und Gewerbeobjekten.';

/**
 * The three facts, in the shape the countdown had: a small sans label over a
 * large serif word.
 *
 * Each phrase is split at its own adjective rather than rewritten, so this is
 * the same copy that stood in the hero's subline before. The label carries
 * the qualifier, the display line carries the noun, which is the half a
 * visitor actually scans for.
 */
interface HeroFact {
  readonly label: string;
  readonly value: string;
}

const FACTS: readonly HeroFact[] = [
  { label: 'Feste', value: 'Teams' },
  // Soft hyphen: on the narrow measures where the row has to wrap, the
  // longest noun on the page breaks where German breaks it rather than
  // wherever the box happens to end.
  { label: 'Feste', value: 'Ansprech\u00ADpartner' },
  { label: 'Verbindliche', value: 'Termine' },
];

/** The second CTA. A `tel:` link rather than a scroll target, so it dials. */
const CALL_CTA = { label: 'Jetzt anrufen', href: company.phone.href } as const;

/**
 * The entrance ladder, in milliseconds.
 *
 * Deliberately much tighter than the scroll reveals further down the page. A
 * reveal can afford to be slow because the reader chose to scroll to it; the
 * hero is what someone stares at while deciding whether to stay. The headline
 * moves first and almost immediately, because it is the LCP element.
 *
 * Each step is a multiple of STAGGER.entrance so the rhythm is the scale's,
 * not a set of numbers picked by eye. The collage arrives as one piece rather
 * than capsule by capsule: three photographs fading in one after another
 * reads as a gallery loading, not as a composition.
 */
const STEP = STAGGER.entrance * 1000;

const ENTER = {
  intro: 0,
  headline: STEP,
  lead: STEP * 2,
  meta: STEP * 3,
  cta: STEP * 4,
  facts: STEP * 5,
  factStagger: STEP,
  collage: STEP * 3,
} as const;

/**
 * The headline scale.
 *
 * `clamp` rather than a breakpoint ladder, because both lines have to stay on
 * one line each at every width: a step change in font size is a step change
 * in where the line breaks, and 'Gebäudepflege,' splitting is the one failure
 * mode this headline has.
 *
 * The scale is set by the column, not by taste, and the binding line is the
 * accent one: 'auf die Verlass ist.' is twenty characters against the lead's
 * fourteen. Measured on the rendered page rather than estimated, Playfair
 * Bold sets this string at 0.402em per character, so it needs 8.04em of
 * measure and the largest size that fits is column / 8.04.
 *
 * That is 79px at the shell's widest, 64px at 1024 and 42px on a 390px
 * phone. The curve below stays under all three with a little room for the
 * fallback face, which sets wider than Playfair before the webfont lands.
 */
const HEADLINE_SIZE = 'clamp(2.5rem, 1.6rem + 3.2vw, 4.25rem)';

/**
 * Landing hero. Two columns, left-aligned copy against a capsule collage, on
 * white.
 *
 * It replaces the full-bleed photograph under a brand-900 scrim. That version
 * followed CLAUDE.md 5.5 and 5.9; this one follows the client's reference
 * design instead, and the deviations it forces are listed in the handover
 * rather than hidden here. The ones that live in this file are marked at the
 * line they affect: the accent headline's contrast, the phone link's colour,
 * and the bare CTA pills.
 *
 * Server component. Motion is the CSS entrance ladder, which costs no
 * JavaScript and does not wait for hydration — the headline is the LCP
 * element and must not be gated on a bundle.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-white pt-10 pb-16 md:pt-14 md:pb-24"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        {/* Not two equal columns, but close to it. The text side still needs
            the larger share, because 'auf die Verlass ist.' has to stay on
            one line and that is the widest thing on the page. 1.08 to 0.92 is
            as far as the collage can take it back before the headline breaks
            at 1024px; the line-count is checked at nine widths, not
            estimated. */}
        <div
          className={cn(
            'grid items-center gap-14',
            'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 xl:gap-12',
          )}
        >
          {/* ----------------------------------------------------------- */}
          {/* Left column: the copy. Left-aligned at every width.          */}
          {/* ----------------------------------------------------------- */}
          <div>
            <Entrance delay={ENTER.intro} distance={10}>
              <p className="text-title-md font-normal text-navy">{INTRO}</p>
            </Entrance>

            <Entrance delay={ENTER.headline} className="mt-3">
              <h1
                id="hero-title"
                style={{ fontSize: HEADLINE_SIZE }}
                className={cn(
                  'font-display leading-[0.95] font-bold tracking-[-0.01em]',
                  // Three overrides of the base layer, all for the same
                  // reason. `balance` would try to even the two lines out,
                  // and the global `overflow-wrap: break-word` plus the
                  // German `hyphens: auto` below md would break
                  // 'Gebäudepflege,' in the middle of the word rather than
                  // let it be one line. Those rules exist for body copy in
                  // narrow columns; this headline is sized to fit instead.
                  '[text-wrap:normal] [overflow-wrap:normal] [hyphens:none]',
                )}
              >
                <span className="block text-navy">{HEADLINE_LEAD}</span>
                {/*
                  The accent line, and the one measurement on this page that
                  does not clear WCAG.

                  accent-yellow on white is 1.48:1. Large text needs 3:1, so
                  this fails — and it fails in the reference design too: the
                  pastel-on-white display line is the look being asked for.
                  It ships on the client's explicit instruction. The fix is
                  one token: swap `text-accent-yellow` for
                  `text-accent-yellow-ink` (#a8880b, 3.39:1), the same hue
                  darkened until it passes.
                */}
                <span className="block text-accent-yellow">
                  {HEADLINE_ACCENT}
                </span>
              </h1>
            </Entrance>

            {/* Not one of the elements the client listed, kept because the
                same brief says the copy stays and this sentence is the only
                place on the first screen that says what the company does. */}
            <Entrance delay={ENTER.lead} className="mt-5">
              <p className="max-w-md text-body text-neutral-700">{LEAD}</p>
            </Entrance>

            <Entrance delay={ENTER.meta} className="mt-5">
              <p className="text-title-sm">
                <span className="font-semibold text-navy">
                  {company.serviceArea.primary}
                </span>{' '}
                {/*
                  accent-sky-ink, not accent-sky. The reference sets this line
                  in the pastel, which on white is 1.99:1 — at 18px that is
                  not a stylistic choice, it is an unreadable phone number,
                  and the phone number is the hero's second conversion path.
                  The darkened cut of the same hue measures 5.63:1.
                */}
                <a
                  href={company.phone.href}
                  data-numeric
                  className={cn(
                    'font-semibold whitespace-nowrap text-accent-sky-ink',
                    // Inline padding: it does not move the line, and it takes
                    // the tap target from 23px to 47px. The link sits inside a
                    // sentence, which WCAG 2.5.8 exempts, but the number is a
                    // conversion path on a phone and a 23px target is a miss
                    // waiting to happen.
                    'py-3 underline-offset-4',
                    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                    'hover:underline focus-visible:outline-2',
                    'focus-visible:outline-offset-3 focus-visible:outline-navy',
                  )}
                >
                  {company.phone.display}
                </a>
              </p>
            </Entrance>

            <Entrance
              delay={ENTER.cta}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {/* Bare pills, no nested arrow wrapper. CLAUDE.md 5.8 asks for
                  the arrow-in-a-circle on every CTA; the reference's buttons
                  carry no icon, and the bare pill is what was asked for here.
                  Restoring the house pattern is deleting `icon={null}`. */}
              <Button
                href={primaryCta.href}
                variant="sky"
                size="sm"
                icon={null}
                magnetic={false}
              >
                {primaryCta.label}
              </Button>

              <Button
                href={CALL_CTA.href}
                variant="skyOutline"
                size="sm"
                icon={null}
                magnetic={false}
                aria-label={`${CALL_CTA.label}: ${company.phone.display}`}
              >
                {CALL_CTA.label}
              </Button>
            </Entrance>

            <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-6 xl:gap-x-12">
              {FACTS.map((fact, index) => (
                <Entrance
                  key={fact.value}
                  delay={ENTER.facts + index * ENTER.factStagger}
                  distance={10}
                >
                  <dt className="text-micro text-neutral-700">{fact.label}</dt>
                  {/* Sized against the longest of the three, not against the
                      shortest: at the shell's widest all three sit on one row,
                      and below about 1150px the row wraps rather than
                      shrinking the type past the point of being a display
                      line. */}
                  <dd className="mt-1 font-display text-[clamp(1.5rem,1.1rem+1.1vw,2rem)] leading-none font-bold text-navy">
                    {fact.value}
                  </dd>
                </Entrance>
              ))}
            </dl>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* Right column: the collage and its marks.                     */}
          {/* ----------------------------------------------------------- */}
          {/* Photographs and nothing else. The stars, the loop and the burst
              that stood around them are gone on the client's instruction: with
              three tinted capsules already carrying the colour, the marks were
              a fourth thing competing for the same corner. */}
          <Entrance
            delay={ENTER.collage}
            distance={16}
            // No left padding: the collage takes the whole column. The
            // grid gap already separates it from the copy.
            className="relative"
          >
            <HeroCollage className="relative" />
          </Entrance>
        </div>
      </div>
    </section>
  );
}
