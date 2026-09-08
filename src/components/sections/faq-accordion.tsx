'use client';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';

import { cn } from '@/lib/cn';

import type { FaqItem } from '@/content/faq';
import { DURATION, EASE_IMPERIAL } from '@/lib/motion';

/**
 * The faded hairline between rows. Same idiom as the trust-bar column rules
 * and the advantages band divider, so the site has one rule treatment rather
 * than three — and it is explicitly not the generic 1px grey border banned by
 * CLAUDE.md 5.7.
 */
const ROW_RULE =
  'linear-gradient(90deg, transparent, rgb(15 27 36 / 0.11) 6%, rgb(15 27 36 / 0.11) 94%, transparent)';

export interface FaqAccordionProps {
  items: readonly FaqItem[];
}

/**
 * FAQ accordion.
 *
 * ## Why this is a hairline list and not eight bezel cards
 *
 * CLAUDE.md 5.8 puts every *card* in a double bezel. These rows are not cards:
 * eight stacked bezels directly under the contact bento would be the third
 * card field in a row, and the section is meant to read as a quiet register at
 * the end of the page. So the rows are editorial — rules and whitespace.
 *
 * That is also what makes the motion clean. A `layout` animation resizes a box
 * with a scale transform, and anything painted on the scaling box (border
 * radius, hairlines, shadows) distorts while it runs, unless the painted
 * element carries its own `layout` and is counter-corrected. Here the `<li>`
 * that resizes is a transparent box with no paint at all, and every element
 * that *is* painted sits inside it with `layout` of its own. Nothing can
 * distort, because nothing decorative is ever the element being scaled.
 *
 * ## How the height animation works
 *
 * It does not animate `height` — the requirement, and CLAUDE.md 9, which
 * allows only `transform` and `opacity`.
 *
 * The panel is mounted or unmounted outright; the `<li>` grows or shrinks in
 * the DOM immediately, and Motion's `layout` prop animates that size change
 * with a transform (its layout projection measures before and after and
 * interpolates with `scale`/`translate`, never with a layout property). The
 * header and the panel each carry `layout="position"`, so they are translated
 * into place instead of being stretched by the parent's scale.
 *
 * There is deliberately no `AnimatePresence`: keeping the panel mounted during
 * an exit would hold the row at full height and make the collapse snap at the
 * end instead of gliding. Unmounting immediately also keeps the answer out of
 * the tab order the moment the row is closed, which is the behaviour a
 * keyboard user expects from `aria-expanded="false"`.
 *
 * ## Semantics
 *
 * WAI-ARIA APG accordion: an `<h3>` per row containing a real `<button>` with
 * `aria-expanded` and `aria-controls` pointing at the panel's `id`. Enter and
 * Space come free with the button element; Arrow keys, Home and End are added
 * on top, which is the pattern's optional-but-recommended keyboard support.
 *
 * The panels intentionally carry no `role="region"`. APG advises against it
 * once an accordion has more than roughly six panels, because every region is
 * a landmark and eight of them turn the landmark list into noise.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const prefersReducedMotion = useReducedMotion();
  const baseId = useId();

  /** Single-open. `null` means every row is closed, which is a valid state. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /**
   * Header buttons, for roving focus. A ref array rather than
   * `document.querySelector` so the accordion stays self-contained and works
   * if the section is ever rendered twice on one page.
   */
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const focusButton = useCallback(
    (index: number) => {
      const count = items.length;
      // Wraps in both directions — Arrow Down on the last row returns to the
      // first, which is what the APG pattern describes.
      const target = ((index % count) + count) % count;
      buttonsRef.current[target]?.focus();
    },
    [items.length],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusButton(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusButton(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusButton(0);
        break;
      case 'End':
        event.preventDefault();
        focusButton(items.length - 1);
        break;
      default:
        break;
    }
  }

  const layoutTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: DURATION.base, ease: EASE_IMPERIAL };

  return (
    <ul className="grid">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-frage-${index}`;
        const panelId = `${baseId}-antwort-${index}`;

        return (
          <motion.li
            key={item.question}
            layout
            transition={layoutTransition}
            /* Transparent and unpainted on purpose — see the note above. The
               rule is drawn by the header child, which is layout-corrected. */
            className="relative"
          >
            <motion.div layout="position" transition={layoutTransition}>
              <h3>
                <button
                  ref={(node) => {
                    buttonsRef.current[index] = node;
                  }}
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  /* Only while the panel exists. The panel is unmounted when
                     the row is closed (see the note above), and `aria-controls`
                     pointing at an id that is not in the document is an invalid
                     reference — screen readers announce a relationship the user
                     cannot follow, and it fails automated a11y validation. */
                  aria-controls={isOpen ? panelId : undefined}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  style={{ backgroundImage: ROW_RULE }}
                  className={cn(
                    'group flex w-full items-start gap-6 bg-top bg-no-repeat text-left',
                    // The rule is the button's own background image, sized to
                    // 1px tall at the top edge, so it can never end up in the
                    // wrong place when a row above it opens.
                    'bg-[length:100%_1px]',
                    // Clears 44px comfortably at every breakpoint.
                    'py-7 md:py-8',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                  )}
                >
                  <span
                    className={cn(
                      'flex-1 text-title-sm md:text-title-md',
                      'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                      isOpen
                        ? 'text-brand-900'
                        : 'text-ink group-hover:text-brand-900',
                    )}
                  >
                    {item.question}
                  </span>

                  {/* The nested round icon wrapper from the CTA idiom
                      (CLAUDE.md 5.8). Rotation is a transform, and the accent
                      blue appears only on the open state — the sparse use
                      CLAUDE.md 4 reserves it for. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
                      'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                      isOpen
                        ? 'bg-brand-300 text-brand-900'
                        : 'bg-brand-050 text-brand-700 group-hover:bg-brand-300 group-hover:text-brand-900',
                    )}
                  >
                    <CaretDownIcon
                      size={16}
                      weight="light"
                      className={cn(
                        'transition-transform duration-[var(--duration-base)] ease-imperial',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </span>
                </button>
              </h3>
            </motion.div>

            {isOpen ? (
              <motion.div
                id={panelId}
                layout="position"
                transition={layoutTransition}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                /* Sits in the question's own column — the caret keeps its
                   gutter on the right, so the answer needs no indent to read
                   as hanging off the question above it. */
                className="pb-9 md:pb-10"
              >
                <p className="max-w-copy text-body text-neutral-700">
                  {item.answer}
                </p>
              </motion.div>
            ) : null}
          </motion.li>
        );
      })}

      {/* Closes the register. Without it the last row's answer would end on
          open space and the list would look unfinished. */}
      <li aria-hidden="true" className="h-px" style={{ backgroundImage: ROW_RULE }} />
    </ul>
  );
}
