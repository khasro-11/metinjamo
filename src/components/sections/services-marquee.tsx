import { PauseIcon } from '@phosphor-icons/react/dist/ssr/Pause';
import { PlayIcon } from '@phosphor-icons/react/dist/ssr/Play';
import Link from 'next/link';

import { serviceNav } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * The running band of service categories, directly under the hero.
 *
 * ## What it is for
 *
 * Two jobs at once. It is the deep-link row the hero lost in the rebuild —
 * CLAUDE.md 9 wants every category reachable by its own anchor from the first
 * screen, and the chips that used to do that are gone. And it is the dark
 * band the page rhythm lost with them: CLAUDE.md 5.9 asks for no more than
 * two light sections in a row, and with a white hero the run was hero, trust
 * bar, and only then the warm ground of Leistungen. Navy here puts the break
 * back where the table wants it.
 *
 * Five links, from `serviceNav`, which reads `content/services.ts`. The order
 * is the catalogue's and is not this component's to change (CLAUDE.md 7a).
 *
 * ## Why there is a stop button
 *
 * Content that moves by itself, runs longer than five seconds and sits beside
 * other content needs a way to stop it (WCAG 2.2.2). Hovering is not that
 * way, because it does not exist for a keyboard. So the band carries a real
 * control: a checkbox, hidden visually, whose label is the button and whose
 * checked state pauses the animation through a sibling selector. No
 * JavaScript, and therefore no client boundary — see globals.css.
 *
 * Under `prefers-reduced-motion` the band does not animate at all and the
 * second copy is removed, so it degrades to a centred list of five links.
 *
 * Server component.
 */

/**
 * One pass of the list, in seconds.
 *
 * The track is content-width at every viewport, so this is a real pixel
 * speed rather than a speed that changes with the window. Slow enough to read
 * a two-word category at a glance and not so slow that the band reads as
 * broken.
 */
const DURATION = '34s';

const ITEM_TEXT =
  'font-display text-[clamp(1.25rem,0.85rem+1.35vw,2rem)] leading-none font-bold';

/**
 * One copy of the list.
 *
 * The second copy exists only to make the loop seamless, so it is
 * `aria-hidden` and its categories are plain text rather than links: a
 * duplicated link set would double the tab stops and announce every category
 * twice, and `aria-hidden` on something focusable is invalid anyway.
 */
function Lane({ interactive }: { interactive: boolean }) {
  return (
    <ul
      aria-hidden={interactive ? undefined : true}
      className={cn(
        'imp-marquee-track flex w-max shrink-0 items-center',
        'gap-6 pr-6 md:gap-10 md:pr-10',
        !interactive && 'imp-marquee-dup',
      )}
      style={{ '--marquee-duration': DURATION } as React.CSSProperties}
    >
      {serviceNav.map((service) => (
        <li key={service.href} className="flex shrink-0 items-center gap-6 md:gap-10">
          {interactive ? (
            <Link
              href={service.href}
              className={cn(
                ITEM_TEXT,
                // The hit area, not the text box. Measured on a phone the
                // link was 20px tall, which fails both the 24px WCAG 2.5.8
                // minimum and the 44px this project sets itself. The padding
                // grows the target and the negative margin gives the height
                // straight back, so the band does not get taller.
                '-my-3 py-3',
                // Navy on accent-sky is 8.93:1. The hover is an underline
                // rather than a colour: every other tone in the palette that
                // is not navy falls under 3:1 on this ground, so there is no
                // second colour here that a link could legibly change to.
                'text-navy underline-offset-[0.2em] decoration-navy/50',
                'decoration-[0.08em] transition-colors',
                'duration-[var(--duration-swift)] ease-imperial-soft',
                'hover:underline focus-visible:outline-2',
                'focus-visible:outline-offset-4 focus-visible:outline-navy',
              )}
            >
              {service.label}
            </Link>
          ) : (
            <span className={cn(ITEM_TEXT, 'text-navy')}>{service.label}</span>
          )}

          {/* The separator, and it is deliberately the plainest thing that
              can separate two words: a hairline. The six-point sparkle that
              stood here was a second graphic idea competing with the type in
              a band eighty pixels tall. A rule does the one job and stops. */}
          <span
            aria-hidden="true"
            className="imp-marquee-rule h-[1.05em] w-px shrink-0 bg-navy/35"
          />
        </li>
      ))}
    </ul>
  );
}

const STOP_ID = 'lauftext-anhalten';

export function ServicesMarquee() {
  return (
    <section
      aria-labelledby="leistungen-lauftext"
      className="imp-marquee relative isolate overflow-hidden bg-accent-sky py-5 md:py-7"
    >
      <h2 id="leistungen-lauftext" className="sr-only">
        Unsere Leistungsbereiche
      </h2>

      {/* First in the DOM so the sibling selectors in globals.css can reach
          both the lane and the label from it. */}
      <input
        id={STOP_ID}
        type="checkbox"
        className="imp-marquee-stop sr-only"
      />

      <nav
        aria-label="Leistungsbereiche"
        className={cn(
          'imp-marquee-lane flex overflow-hidden',
          // Both edges fade out, so a category never appears cut off by the
          // viewport and the stop control has a clean field to sit on. The
          // right stop is a breakpoint rather than one value: the control is
          // a fixed 36 to 40px, which is a tenth of a phone and a fortieth of
          // a desktop, so the same percentage leaves the category legible
          // underneath it on one and over-fades the band on the other.
          '[mask-image:linear-gradient(90deg,transparent,#000_5%,#000_62%,transparent_92%)]',
          'md:[mask-image:linear-gradient(90deg,transparent,#000_4%,#000_80%,transparent_96%)]',
        )}
      >
        <Lane interactive />
        <Lane interactive={false} />
      </nav>

      <label
        htmlFor={STOP_ID}
        className={cn(
          'imp-marquee-control absolute top-1/2 right-3 z-10 grid size-9 md:right-6 md:size-10',
          '-translate-y-1/2 cursor-pointer place-items-center rounded-full',
          // Opaque navy rather than a white wash: the control sits over the
          // track, and a translucent fill let the category underneath read
          // straight through it. The ring is what separates it from the band
          // it is now the same colour as.
          // Solid navy on the pastel band, which is the reverse of what it
          // was: the control has to occlude the track running under it, and
          // on a light ground the thing that occludes is the dark one.
          'bg-navy text-paper shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)]',
          'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
          'hover:bg-accent-sky-ink',
        )}
      >
        <PauseIcon
          size={16}
          weight="light"
          aria-hidden="true"
          className="imp-marquee-pause"
        />
        <PlayIcon
          size={16}
          weight="light"
          aria-hidden="true"
          className="imp-marquee-play"
        />
        <span className="sr-only">Lauftext anhalten</span>
      </label>
    </section>
  );
}
