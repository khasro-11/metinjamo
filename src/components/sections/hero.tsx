import { Button, CallButton, Entrance, Eyebrow } from "@/components/ui";
import { company } from "@/config/company";
import { primaryCta, serviceNav } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { STAGGER } from "@/lib/motion";

import { HeroVisual } from "./hero-visual";

/**
 * Headline candidates put to the client. A wins: it carries the service term
 * (local SEO) and a promise in one line, breaks to exactly two lines at the
 * display size in a centred 4xl measure, and claims nothing that would need
 * proof under section 5 UWG.
 *
 * B: 'Ein fester Ansprechpartner für Ihre Objekte.'
 *    Sharpest B2B angle, but no service term, so it carries no search weight.
 * C: 'Reinigung und Pflege für Ihre Objekte.'
 *    Purely descriptive. Strongest keyword signal, weakest promise.
 */

/**
 * Headline tones, and the contrast that decides where each may be used.
 * Measured against --color-paper (#fbfcfd), the hero's only background:
 *
 *   ink        #0f1b24  17.00:1  AAA at any size
 *   deep       #1c6b9c   5.63:1  AA at any size, AAA as large text
 *   bright     #2e86c1   3.86:1  AA for LARGE text only (>= 24px / 18.66px bold)
 *
 * `bright` is therefore admissible in the H1 — text-title-xl is 38px to 64px —
 * and nowhere near a small label. The eyebrow keeps brand-700 for exactly that
 * reason: brand-500 measures 3.55:1 on the brand-050 pill at 10px and fails.
 *
 * The accent blue (#45b3e7) is 2.31:1 and never carries text. It appears only
 * as the rule under an already-legible word — decorative, never the sole
 * carrier of meaning.
 */
type HeadlineTone = "ink" | "deep" | "bright";

const TONE_CLASS: Record<HeadlineTone, string> = {
  ink: "text-ink",
  deep: "text-brand-700",
  bright: "text-brand-500",
};

interface HeadlineSegment {
  readonly text: string;
  readonly tone?: HeadlineTone;
  /** Hairline rule in the accent blue, sized in em so it tracks fluid type. */
  readonly underline?: boolean;
}

/**
 * Two colour distributions over the same words.
 *
 * `leading` front-loads the colour: the searched-for category term carries the
 * deep blue, the promise word the bright one, and ink holds the connective
 * tissue between them. The eye lands on "Gebäudepflege" first, which is also
 * what the page ranks for.
 *
 * `trailing` inverts the weighting: the opening stays ink and the whole promise
 * clause turns, with the bright blue reserved for the pivot word. Reads more
 * editorial and puts the emotional payload, not the category, in colour.
 *
 * TODO (client): pick one. Switching is this one constant.
 */
const HEADLINE_VARIANTS = {
  leading: [
    { text: "Gebäudepflege", tone: "deep" },
    { text: ", auf die " },
    { text: "Verlass", tone: "bright", underline: true },
    { text: " ist." },
  ],
  trailing: [
    { text: "Gebäudepflege, auf die " },
    { text: "Verlass", tone: "bright", underline: true },
    { text: " ist.", tone: "deep" },
  ],
} as const satisfies Record<string, readonly HeadlineSegment[]>;

const HEADLINE: readonly HeadlineSegment[] = HEADLINE_VARIANTS.leading;

/**
 * TODO (client): confirm the three commitments in the second sentence. They
 * are operational promises the company can make, not measured claims, but
 * nothing goes live that the client has not signed off on.
 */
const SUBLINE =
  "Wir übernehmen die Reinigung und Pflege von Wohn- und Gewerbeobjekten. Feste Teams, feste Ansprechpartner, verbindliche Termine.";

/**
 * One chip per service category, derived from the same `serviceNav` the footer
 * column renders rather than typed out a second time (CLAUDE.md 7a).
 *
 * Five chips, not eighteen: the chips are a navigation aid on the first
 * screen, and a wrapped block of eighteen labels would take more vertical room
 * than the headline it sits under. Each one jumps to its category's bento
 * tile, where the individual services are listed.
 *
 * `serviceNav` hrefs are absolute (`/#gebaeudereinigung`) so they also work
 * from the legal pages. In the hero we are always on `/`, and the leading
 * slash is harmless.
 */
const SERVICE_CHIPS = serviceNav;

/**
 * Flow height of the sticky header pill: pt-6 (1.5rem) + bezel inset
 * (2 x 0.25rem) + the tallest pill child, the logo link at 3.125rem, + pb-3
 * (0.75rem). The hero is pulled up by exactly that and pads it back, so the
 * first screen measures a true 100dvh with the pill floating over the hero's
 * top padding, instead of 100dvh stacked below a header.
 */
const HEADER_SPACE = "6.875rem";

/**
 * The entrance ladder, in milliseconds.
 *
 * Deliberately much tighter than the scroll reveals further down the page. A
 * reveal can afford to be slow because the reader chose to scroll to it; the
 * hero is what someone stares at while deciding whether to stay. The headline
 * moves first and almost immediately, because it is the LCP element.
 *
 * Each step is a multiple of STAGGER.entrance so the rhythm is the scale's, not
 * a set of numbers picked by eye. The visual comes last: it is the one element
 * on the first screen that carries no information.
 */
const STEP = STAGGER.entrance * 1000;

const ENTER = {
  eyebrow: 0,
  headline: STEP,
  subline: STEP * 2,
  cta: STEP * 3,
  chips: STEP * 4,
  chipStagger: STEP / 2,
  visual: STEP * 8,
} as const;

const CHIP_CLASSES = cn(
  "inline-flex h-11 items-center rounded-pill bg-white px-5 text-body-sm text-neutral-700",
  "shadow-[var(--shadow-ambient-xs),var(--shadow-hairline)]",
  "transition-colors duration-[var(--duration-swift)] ease-imperial-soft",
  "hover:bg-brand-050 hover:text-brand-900",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
);

/** Accent rule under a single word. Thickness and offset in em, so it scales. */
const UNDERLINE_CLASSES =
  "underline decoration-brand-300 decoration-[0.055em] underline-offset-[0.14em]";

/**
 * Landing hero. Centred stack, Soft Structuralism.
 *
 * Everything the visitor reads sits on one centre axis in a 4xl measure —
 * eyebrow, headline, subline, CTAs, service chips — with the window field
 * below it at the full shell width. The two measures are the composition: a
 * narrow column of copy over a wide band of image, rather than a split.
 *
 * The background is the page's own paper. No mesh, no blob, nothing behind the
 * type — on a trust-first brief the headline's own contrast is the effect.
 *
 * Server component. Motion lives in the CSS entrance and in HeroLight.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      style={{ marginTop: `-${HEADER_SPACE}` }}
      className={cn(
        "flex min-h-[100dvh] flex-col justify-center",
        "pt-[calc(5.875rem+2.5rem)] pb-16",
        "md:pt-[calc(5.875rem+4rem)] md:pb-24",
      )}
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Entrance delay={ENTER.eyebrow} distance={10}>
            <Eyebrow>
              Privat- und Gewerbekunden · {company.serviceArea.primary}
            </Eyebrow>
          </Entrance>

          <Entrance delay={ENTER.headline} className="mt-6">
            <h1 id="hero-title" className="text-title-xl">
              {HEADLINE.map((segment, index) => (
                <span
                  key={index}
                  className={cn(
                    TONE_CLASS[segment.tone ?? "ink"],
                    segment.underline && UNDERLINE_CLASSES,
                  )}
                >
                  {segment.text}
                </span>
              ))}
            </h1>
          </Entrance>

          <Entrance delay={ENTER.subline} className="mt-6 w-full">
            <p className="mx-auto max-w-copy text-lead text-neutral-700">
              {SUBLINE}
            </p>
          </Entrance>

          <Entrance
            delay={ENTER.cta}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>

            <CallButton />
          </Entrance>

          <nav aria-label="Leistungen" className="mt-10 w-full md:mt-12">
            <ul className="flex flex-wrap justify-center gap-2.5">
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

        <Entrance delay={ENTER.visual} distance={16} className="mt-14 md:mt-20">
          <HeroVisual ratio="wide" className="w-full" />
        </Entrance>
      </div>
    </section>
  );
}
