import Image from 'next/image';

import { Bezel, Button, Eyebrow, Reveal } from '@/components/ui';
import { company } from '@/config/company';
import { cn } from '@/lib/cn';
import { primaryCta } from '@/config/navigation';

/**
 * H2 candidates put to the client. A wins: it states the differentiator and
 * carries the six years implicitly through "Jahr für Jahr", so the duration is
 * argued rather than displayed as a figure. It also names the exact thing a
 * Hausverwaltung is buying — continuity of personnel — in six words.
 *
 * B: 'Ein Gebäudeservice, den Sie beim Namen kennen.'
 *    Warmer and more B2C. Loses the operational claim.
 * C: 'Wir betreuen Objekte langfristig, nicht auftragsweise.'
 *    Sharpest B2B framing, but reads as a policy statement rather than as a
 *    sentence about people.
 */
/**
 * Split into segments so the closing phrase can carry the accent (CLAUDE.md
 * 5.9). brand-700 on sand-100 measures 4.97:1, AA at every size, and this
 * headline is text-title-lg, so it is well clear.
 */
const HEADLINE: readonly { text: string; key?: true }[] = [
  { text: 'Dieselben Leute, dieselben Objekte, ' },
  { text: 'Jahr für Jahr', key: true },
  { text: '.' },
];

/**
 * The portrait of the managing director.
 *
 * This frame used to be built around a constraint that no longer exists. The
 * old file was 276 x 295, a thumbnail, so the photo was matted: shown at 62 %
 * of the bezel core on a paper field with a painted-in daylight gradient,
 * because a wide mat around a small print reads as framing while the same
 * print stretched edge to edge reads as a low-resolution asset.
 *
 * The client has supplied the real file. At 1304 x 1330 it renders at roughly
 * three times the ~430px the frame gives it, so the mat, the gradient and the
 * inner hairline are all gone and the photograph fills the frame — which is
 * the composition this section was drawn for in the first place.
 *
 * The caption moved out of the frame and under it. With the photo filling the
 * core there is nowhere inside for type to sit, and nothing may be laid over a
 * photograph on this site (CLAUDE.md 5.9). A plate under the print is also
 * how a framed photograph is actually hung.
 */
const PORTRAIT = {
  src: '/metinjamu.png',
  width: 1304,
  height: 1330,
  alt: `${company.managingDirector.name}, Geschäftsführer der ${company.legalName}`,
  /**
   * The source is all but square (0.98) and the frame is 4:5, so the crop
   * takes about 240px off the width and nothing off the height. The subject
   * sits slightly right of centre — his head is centred on 55.6 % of the
   * frame — so the crop is biased there rather than left at 50 %, which would
   * shave his shoulder.
   */
  position: '55% center',
} as const;

/**
 * Rendered width of the frame's core: the capped frame width above, less the
 * bezel inset on both sides (2 x 0.5rem). It has to agree with those caps —
 * if the two drift, the browser picks a candidate for a box that does not
 * exist.
 */
const PORTRAIT_SIZES =
  '(min-width: 1280px) 304px, (min-width: 1024px) 272px, (min-width: 640px) 304px, 272px';

/**
 * The framed portrait: a double-bezel frame, the print, and the plate under
 * it.
 *
 * Server component, no JavaScript.
 */
function AboutPortrait({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <Bezel
        radius="xl"
        inset="lg"
        tone="paper"
        elevation="xl"
        innerClassName="relative aspect-[4/5] overflow-hidden"
      >
        <Image
          src={PORTRAIT.src}
          alt={PORTRAIT.alt}
          fill
          sizes={PORTRAIT_SIZES}
          style={{ objectPosition: PORTRAIT.position }}
          className="object-cover"
        />
      </Bezel>

      <figcaption className="mt-5 text-center">
        <span className="block text-title-sm text-ink">
          {company.managingDirector.name}
        </span>
        <span className="mt-1 block text-micro text-neutral-500">
          Geschäftsführer, {company.legalName}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Über uns. Editorial Split, Vibe: Editorial Luxury.
 *
 * The section's job is one claim: this company has been doing this for a while,
 * with its own people, here. Everything else on the page argues capability;
 * this argues continuity, which is what a Hausverwaltung renews a contract for.
 *
 * The six years are set as the eyebrow rather than as a figure in a badge. A
 * number badge would put "6" next to the "10 Mio. €" of the trust bar and read
 * as one more metric tile; as a dateline above the headline it reads as what it
 * is — a standing fact about the company, not a score.
 *
 * Layout, at lg:
 *
 *   |<-- 6 -->| 1 |<---- 5 ---->|
 *   +---------+   +-------------+
 *   | eyebrow |   |             |
 *   | H2      |   |   framed    |   <- dropped by 4rem against the copy
 *   | lead    |   |  portrait   |
 *   | body    |   |             |
 *   +---------+   |             |
 *   | [CTA]   |   +-------------+
 *   +---------+
 *
 * The empty column between the two blocks and the vertical offset of the field
 * are the composition: this is the only true split on the landing page — the
 * hero is a centred stack over a full-width band, the Leistungen bento is a
 * field, the Advantages header is a sticky rail — so the section reads as its
 * own kind of page rather than as a fourth variation of the same grid.
 *
 * The CTA is a grid item of its own rather than the last child of the copy
 * block, purely so the stacking order below lg is copy, then the man's face,
 * then the ask. With the CTA inside the copy block the portrait would land
 * after the button on every phone, which is where a face is worth least.
 *
 * Editorial Luxury here is structural, not chromatic: a lead paragraph at a
 * real measure and a matted, captioned print. It stays on the paper ground and
 * inside the brand palette — a warm cream plane would be a second ground for
 * one section and a colour the brand does not own.
 *
 * Facts in this section are limited to the four that are evidenced today:
 * the years in business, the service area, the register entry, and the
 * liability cover. No headcount, no project count, no satisfaction rate — none
 * of those exist, and inventing them is a section 5 UWG problem (CLAUDE.md 8).
 *
 * Server component. Motion lives in the Reveal leaves and in the CTA.
 */
export function About() {
  return (
    <section
      id="ueber-uns"
      aria-labelledby="ueber-uns-titel"
      /* The one warm surface on the page. This is the section about people
         rather than process, and sand is what separates it from the four
         blue-family grounds around it. ink 15.01:1, neutral-700 7.31:1,
         brand-700 4.97:1. */
      className="bg-tint-sky py-section md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-x-14 xl:gap-x-20">
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1">
            <Reveal distance={16}>
              {/* "über 6 Jahre in Duisburg" — the phrase comes from
                  company.ts verbatim, so the one place the duration is stated
                  is the one place it has to be changed. */}
              {/* The one place the ochre appears as type. This is the warm
                  section, and the duration is what makes it warm. */}
              <Eyebrow tone="sand">
                {company.yearsInBusiness} in {company.address.city}
              </Eyebrow>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 id="ueber-uns-titel" className="mt-6 text-title-lg">
                {HEADLINE.map((segment) => (
                  <span
                    key={segment.text}
                    className={segment.key ? 'text-brand-700' : undefined}
                  >
                    {segment.text}
                  </span>
                ))}
              </h2>
            </Reveal>

            {/* TODO (client): confirm that own staff are used without
                exception. The same claim carries the Advantages section, and
                if subcontractors are used for peak loads or for single trades,
                both places have to name that case — an absolute claim that
                does not hold is the worse risk. */}
            <Reveal delay={0.14}>
              <p className="mt-7 max-w-copy text-lead text-neutral-700">
                Wir arbeiten mit festen Teams. Wer Ihr Objekt betreut, bleibt
                derselbe und weiß nach kurzer Zeit, welche Tür klemmt, wo der
                Wasseranschluss sitzt und welcher Turnus im Leistungsverzeichnis
                steht.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-copy text-body text-neutral-700">
                Wechselnde Subunternehmer geben dieses Wissen bei jedem Wechsel
                wieder ab. Deshalb setzen wir eigene Kräfte ein. Und weil unser
                Sitz {company.registry.seat} ist, ist{' '}
                {company.serviceArea.primary} für uns keine Landkarte, sondern
                die Strecke, die wir ohnehin täglich fahren.{' '}
                {company.serviceArea.note}
              </p>
            </Reveal>
          </div>

          <Reveal
            delay={0.1}
            distance={20}
            amount={0.15}
            className={cn(
              // The frame is capped rather than left to fill its column. At
              // the shell's widest the five-column span is about 424px, and a
              // portrait at that size started competing with the headline
              // beside it instead of supporting it. Capped, it reads as a
              // print hung next to the text.
              'mx-auto w-full max-w-[18rem] sm:max-w-[20rem]',
              'lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2',
              'lg:mx-0 lg:mt-16 lg:max-w-[18rem] xl:max-w-[20rem]',
            )}
          >
            <AboutPortrait />
          </Reveal>

          <Reveal
            delay={0.26}
            className="lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:mt-9"
          >
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
