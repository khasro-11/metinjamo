import Image from 'next/image';

import { Bezel, Button, Eyebrow, Reveal } from '@/components/ui';
import { company } from '@/config/company';
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
 * The intrinsic size is the constraint that shapes the whole frame below.
 * 276 x 295 is a thumbnail: filling the 438px-wide bezel core with it would
 * upscale it 1.6x on a normal display and 3.2x on a retina one, which on a
 * trust-first brief looks like a photo lifted off someone's phone — the exact
 * impression the section exists to avoid.
 *
 * So the photo is matted instead of stretched. At 62% of the core it renders
 * at roughly its native pixel width, which is sharp at 1x and merely soft at
 * 2x, and a wide mat around a small print reads as a deliberate framing rather
 * than as a low-resolution asset.
 *
 * TODO (client): supply the original file, ideally >= 1400px on the long edge.
 * With that in hand the photo can fill the frame edge to edge and the mat can
 * go — that is the composition this section was drawn for.
 */
const PORTRAIT = {
  src: '/metinjamu.jpg',
  width: 276,
  height: 295,
  alt: `${company.managingDirector.name}, Geschäftsführer der ${company.legalName}`,
} as const;

/**
 * Rendered width of the print, as a fraction of the bezel core. Kept in one
 * place because the `sizes` attribute below has to agree with it — if they
 * drift, the browser picks a candidate for the wrong box.
 */
const PRINT_WIDTH = '62%';

/**
 * At lg the core is ~438px wide (a 5-column span of the 78rem shell), so the
 * print lands at ~272px. Below that the field is capped at 25rem and then
 * tracks the viewport.
 */
const PRINT_SIZES = '(min-width: 1024px) 275px, (min-width: 640px) 240px, 55vw';

/**
 * The framed portrait: a double-bezel frame, a paper mat, the print, and the
 * caption under it — the order a photograph is actually hung in.
 *
 * The abstract window raster that stood here before is gone. It was the
 * placeholder for this photo, and keeping brand motif and portrait in one
 * frame would put two subjects in a picture that has room for one.
 *
 * Server component, no JavaScript.
 */
function AboutPortrait({ className }: { className?: string }) {
  return (
    <Bezel
      as="figure"
      radius="xl"
      inset="lg"
      tone="paper"
      elevation="xl"
      className={className}
      innerClassName="relative flex aspect-[4/5] flex-col items-center justify-center gap-7 overflow-hidden px-[10%]"
    >
      {/* Daylight falling in from the top left, the way it does through a
          stairwell window. Static gradient — nothing here animates. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_18%_8%,var(--color-brand-050)_0%,rgb(234_244_250/0.35)_46%,transparent_78%)]"
      />

      {/* The print sits on the mat with its own hairline and a soft ambient
          shadow, so it reads as a physical object laid on the surface rather
          than as a cropped div. Its own aspect is kept — no crop, no squeeze. */}
      <div
        style={{ width: PRINT_WIDTH }}
        className="relative overflow-hidden rounded-bezel-sm shadow-[var(--shadow-ambient-md),var(--shadow-hairline)]"
      >
        <Image
          src={PORTRAIT.src}
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          alt={PORTRAIT.alt}
          sizes={PRINT_SIZES}
          className="h-auto w-full"
        />
      </div>

      <figcaption className="relative text-center">
        <span className="block text-title-sm text-ink">
          {company.managingDirector.name}
        </span>
        <span className="mt-1 block text-micro text-neutral-500">
          Geschäftsführer, {company.legalName}
        </span>
      </figcaption>
    </Bezel>
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
      className="bg-sand-100 py-section md:py-section-lg"
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
            className="mx-auto w-full max-w-[22rem] sm:max-w-[25rem] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:mx-0 lg:mt-16 lg:max-w-none"
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
