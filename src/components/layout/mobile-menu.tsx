'use client';

import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import { company } from '@/config/company';
import { legalNav, primaryCta, primaryNav } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { DURATION, EASE_IMPERIAL, STAGGER } from '@/lib/motion';

/** Half the gap between the two burger lines, in px. */
const BURGER_OFFSET = 4.5;

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
} as const;

/**
 * Drives the stagger. Children inherit `open`/`closed` from here, so the
 * reveal order is declared once instead of as a delay arithmetic per link.
 */
const listVariants = {
  closed: {},
  open: { transition: { staggerChildren: STAGGER.list, delayChildren: 0.12 } },
} as const;

/**
 * Mask reveal: the line rides up from behind the bottom edge of an
 * `overflow-hidden` parent. Transform only — no height or clip animation.
 */
const lineVariants = {
  closed: { y: '115%' },
  open: { y: '0%' },
} as const;

// Closing is a state the user changed, opening is an orchestrated arrival —
// the two tiers of the scale, not two numbers picked to feel right.
const CLOSED_TRANSITION = { duration: DURATION.base, ease: EASE_IMPERIAL } as const;
const OPEN_TRANSITION = { duration: DURATION.slow, ease: EASE_IMPERIAL } as const;

function isFocusable(element: HTMLElement): boolean {
  return !element.hasAttribute('disabled') && element.tabIndex !== -1;
}

/**
 * Mobile navigation: a burger whose two lines rotate into an X, and a
 * full-screen overlay with a staggered mask reveal.
 *
 * The overlay is `fixed`, which is the only place `backdrop-blur` is allowed
 * to live — a blur on a scrolling container repaints every frame.
 */
export function MobileMenu({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const menuId = useId();

  /**
   * The route the menu was opened on, rather than a plain boolean.
   *
   * Openness is then derived: any navigation — a link in the panel, or the
   * browser's back button — makes the stored route stale and closes the
   * overlay, with no effect synchronising state against the router.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn === pathname;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenedOn(null), []);

  useEffect(() => {
    if (!isOpen) return;

    // Locking the body is what keeps the page behind the overlay from
    // scrolling under the blur on iOS.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpenedOn(null);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      // Focus trap. The trigger stays in the cycle so the X is always one
      // Shift+Tab away from the first link.
      const panel = panelRef.current;
      if (!panel) return;

      const stops = [
        ...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ].filter(isFocusable);
      if (stops.length === 0) return;

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === triggerRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Under reduced motion the overlay still appears and disappears — it just
  // does so without travel and without the stagger, so nothing is left
  // stranded at opacity 0 if a transition never completes.
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : isOpen
      ? OPEN_TRANSITION
      : CLOSED_TRANSITION;

  /**
   * Applied to every staggered element. Emptied under reduced motion so no
   * element is handed a variant name that resolves to nothing.
   */
  const reveal = prefersReducedMotion
    ? {}
    : ({
        variants: lineVariants,
        transition,
      } as const);

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpenedOn(isOpen ? null : pathname)}
        aria-expanded={isOpen}
        /* Set only while the overlay is mounted — AnimatePresence removes it
           on close, and a dangling `aria-controls` is an invalid reference. */
        aria-controls={isOpen ? menuId : undefined}
        aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
        className={cn(
          'relative z-10 grid size-11 place-items-center rounded-full',
          'text-ink transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
          'hover:bg-brand-050 focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-brand-500',
        )}
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          {[
            { closed: -BURGER_OFFSET, rotate: 45 },
            { closed: BURGER_OFFSET, rotate: -45 },
          ].map((line) => (
            <motion.span
              key={line.rotate}
              className="absolute inset-x-0 top-1/2 block h-[1.5px] -mt-[0.75px] rounded-full bg-current"
              initial={false}
              animate={
                isOpen
                  ? { y: 0, rotate: line.rotate }
                  : { y: line.closed, rotate: 0 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: DURATION.base, ease: EASE_IMPERIAL }
              }
            />
          ))}
        </span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={menuId}
            ref={panelRef}
            role="dialog"
            /*
             * Deliberately NOT `aria-modal="true"`.
             *
             * The only control that closes this overlay is the burger/X, and it
             * lives in the header pill — outside this element, floating above
             * it on a higher z-index. `aria-modal` tells assistive tech to
             * treat everything outside the dialog as inert, which would put the
             * close button out of reach for exactly the users who depend on it.
             *
             * The dialog behaviour that is actually implementable here is: the
             * Tab cycle is trapped (with the trigger deliberately inside the
             * cycle), Escape closes and returns focus, and any navigation
             * closes. That is what this element claims, and all of it is true.
             */
            aria-label="Hauptmenü"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={transition}
            className={cn(
              'fixed inset-0 z-40 flex flex-col overflow-y-auto',
              'bg-paper/85 backdrop-blur-2xl',
            )}
          >
            {/* Clears the floating pill, which stays above the overlay. */}
            <div className="h-24 shrink-0" />

            <motion.nav
              {...(prefersReducedMotion
                ? {}
                : ({
                    variants: listVariants,
                    initial: 'closed',
                    animate: 'open',
                    exit: 'closed',
                  } as const))}
              aria-label="Hauptmenü"
              className="mx-auto flex w-full max-w-shell flex-1 flex-col px-6"
            >
              <ul className="flex flex-col">
                {primaryNav.map((item) => (
                  <li key={item.href} className="overflow-hidden py-1">
                    <motion.span {...reveal} className="block">
                      <Link
                        href={item.href}
                        onClick={close}
                        className={cn(
                          'inline-flex items-baseline gap-4 py-2 text-title-xl text-ink',
                          'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                          'hover:text-brand-700 focus-visible:outline-2',
                          'focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.span>
                  </li>
                ))}
              </ul>

              <motion.div {...reveal} className="mt-10 flex flex-col gap-4">
                <Button href={primaryCta.href} onClick={close} magnetic={false}>
                  {primaryCta.label}
                </Button>

                <a
                  href={company.phone.href}
                  className={cn(
                    'inline-flex items-center gap-3 self-start rounded-pill py-2 pr-4',
                    'text-body text-neutral-700 transition-colors',
                    'duration-[var(--duration-swift)] ease-imperial-soft',
                    'hover:text-brand-900 focus-visible:outline-2',
                    'focus-visible:outline-offset-3 focus-visible:outline-brand-500',
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-brand-050 text-brand-700">
                    <PhoneIcon size={17} weight="light" aria-hidden="true" />
                  </span>
                  {company.phone.display}
                </a>
              </motion.div>

              <motion.ul
                {...reveal}
                className="mt-auto flex flex-wrap gap-x-6 gap-y-2 py-10 text-micro text-neutral-500"
              >
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="underline-offset-4 hover:text-brand-900 hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
