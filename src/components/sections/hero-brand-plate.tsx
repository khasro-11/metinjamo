import Image from 'next/image';

import { Bezel } from '@/components/ui';
import { company } from '@/config/company';
import { serviceCategories } from '@/content/services';

/**
 * The hero's brand plate: the full logo over an engraved line, framed like a
 * machined sign.
 *
 * It replaces the abstract window raster that stood here as a placeholder.
 * That field existed because CLAUDE.md 5.7 rules out stock photography and no
 * real object photography had been supplied; a plate carrying the actual
 * wordmark is not a placeholder, so the TODO it carried is gone with it.
 *
 * The source file is a raster of the logo on a white ground, which is why the
 * core stays `bg-white`: plate and image share one surface, so the frame reads
 * as a frame around the mark rather than as a card with a picture in it. The
 * double bezel and the ambient shadow are what give it edge and lift.
 *
 * TODO (client): once real photography of a betreutes Objekt is available
 * (CLAUDE.md 12), that photograph is the stronger hero visual and this plate
 * moves out. Until then the mark is the one honest image we own.
 *
 * Server component. Its entrance is the caller's <Entrance>.
 */

/**
 * Measured ink box of `imperialLogoBig.jpeg`, as fractions of the 1024 x 1024
 * source: x 0.062 to 0.938, y 0.353 to 0.646. So the mark is centred on both
 * axes, spans 87.7 % of the width and only 29.4 % of the height — the file is
 * two thirds empty white.
 *
 * `object-cover` in a landscape box is what removes that emptiness: the image
 * is scaled to the box width and the overflowing height is clipped evenly top
 * and bottom, because the mark is vertically centred. At 2.8:1 the visible
 * band is 35.7 % of the source height, which leaves 3.2 % of it as clear space
 * above and below the ink, roughly a tenth of the mark's own height. The core
 * padding supplies the rest of the air, which is why the crop can sit this
 * close. 3.4:1 is the hard limit: past it the band is narrower than the ink
 * and the wordmark loses its cap line.
 *
 * A replacement file therefore has to keep the mark centred, or this ratio has
 * to be re-measured with it.
 */
const PLATE_ASPECT = 'aspect-[2.8/1]';

/**
 * Rendered width of the image box: the plate caps at max-w-2xl (42rem), minus
 * the bezel inset (2 x 0.5rem) and the core padding (2 x 2rem at md), which
 * leaves 37rem. Below that the plate is the page measure less the same frame.
 *
 * The cap is a middle term, not a maximum. It sits between the CTA pair above
 * it and the chip row, so the first screen reads as one measure narrowing to
 * the buttons and then widening again to close on the mark. The full shell
 * width was tried and rejected: at ~600px of wordmark, directly under a header
 * that already carries the logo, the mark stops reading as a decision and
 * starts reading as a placeholder blown up to fill a hole.
 */
const PLATE_SIZES = '(min-width: 48rem) 37rem, calc(100vw - 6.5rem)';

const ALT = `Logo der ${company.legalName}: Wortmarke in Blau mit Fensterraster, Fensterabzieher und Sprühflasche`;

/**
 * The engraving rule between mark and caption.
 *
 * Same idiom as the band that seats the Vertrauensleiste under the hero: a 1px
 * gradient faded at both ends rather than a full-width border, so the line
 * does not butt into the core's rounded corners. Decorative, so `aria-hidden`.
 */
const ENGRAVING_RULE =
  'linear-gradient(90deg, transparent, rgb(15 27 36 / 0.10) 14%, rgb(15 27 36 / 0.10) 86%, transparent)';

/**
 * German numerals for the category count.
 *
 * The count is read off `serviceCategories` rather than typed into the
 * sentence, so restructuring the catalogue cannot leave the caption claiming a
 * number the page no longer shows. The map covers the plausible range and
 * falls back to the digit, which is still correct copy, just less even in a
 * line of prose.
 */
const NUMERALS: Record<number, string> = {
  3: 'Drei',
  4: 'Vier',
  5: 'Fünf',
  6: 'Sechs',
  7: 'Sieben',
};

const CATEGORY_COUNT = serviceCategories.length;
const CATEGORY_WORD = NUMERALS[CATEGORY_COUNT] ?? String(CATEGORY_COUNT);

/**
 * The caption, and why it says this and not something else.
 *
 * Two facts, both evidenced and neither of them already on the page. The
 * Vertrauensleiste immediately below carries the insurance cover, the register
 * entry, the opening hours and the service area, so repeating any of those
 * here would only be the next section said twice. The hero subline carries the
 * objects and the delivery promise. What is left, and what a Hausverwaltung
 * actually weighs when deciding whether one contractor can replace several, is
 * breadth and tenure.
 *
 * "aus einer Hand" is a statement about the catalogue, verifiable on this page:
 * the five categories are all quoted and all delivered by one company. It is
 * not a quality claim and needs no proof under section 5 UWG.
 *
 * The tenure clause is deliberately phrased as experience in the trade, not as
 * the age of the GmbH. CLAUDE.md 12 has that reference point open: if the GmbH
 * is younger than the predecessor business, "die GmbH besteht seit 6 Jahren"
 * would be false against the register extract a business customer can pull,
 * while "Erfahrung im Gebäudeservice" holds under both readings. Do not
 * tighten this wording before the client has settled the question.
 */
const CAPTION = `${CATEGORY_WORD} Leistungsbereiche aus einer Hand, ${company.yearsInBusiness} Erfahrung im Gebäudeservice.`;

export interface HeroBrandPlateProps {
  /** Layout classes for the bezel shell (width, centring). */
  className?: string;
}

export function HeroBrandPlate({ className }: HeroBrandPlateProps) {
  return (
    <Bezel
      radius="lg"
      inset="lg"
      tone="paper"
      elevation="xl"
      className={className}
      innerClassName="p-6 md:p-8"
    >
      <div className={`relative w-full overflow-hidden ${PLATE_ASPECT}`}>
        <Image
          src="/images/imperialLogoBig.jpeg"
          alt={ALT}
          fill
          sizes={PLATE_SIZES}
          // The plate sits inside the first screen, so it is eager: a lazy
          // logo would pop in after the copy has already settled.
          priority
          className="object-cover object-center"
        />
      </div>

      <div
        aria-hidden="true"
        className="mt-6 h-px w-full"
        style={{ backgroundImage: ENGRAVING_RULE }}
      />

      {/*
        neutral-700 (#4a4d50) on the white core measures 8.51:1, AAA at any
        size, so the caption is real copy rather than a grey micro-label.
      */}
      <p className="mt-6 text-center text-body-sm text-neutral-700">
        {CAPTION}
      </p>
    </Bezel>
  );
}
