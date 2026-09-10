'use client';

import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui';
import { company } from '@/config/company';
import { legalNav, primaryCta, primaryNav } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { DURATION, EASE_IMPERIAL, STAGGER } from '@/lib/motion';

/** Half the gap between the two burger lines, in px. */
const BURGER_OFFSET = 4.5;

/** The regular hours, for the line under the phone number. */
const businessHours = company.openingHours.find(
  (entry) => entry.kind === 'regular',
);

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
} as const;

/**
 * Drives the stagger. Children inherit `open`/`closed` from here, so the
 * reveal order is declared once instead of as delay arithmetic per link.
 */
const listVariants = {
  closed: {},
  open: { transition: { staggerChildren: STAGGER.list, delayChildren: 0.1 } },
} as const;

/**
 * Mask reveal: the line rides up from behind the bottom edge of an
 * `overflow-hidden` parent. Transform only, no height or clip animation.
 */
const lineVariants = {
  closed: { y: '115%' },
  open: { y: '0%' },
} as const;

// Closing is a state the user changed, opening is an orchestrated arrival:
// the two tiers of the scale, not two numbers picked to feel right.
const CLOSED_TRANSITION = { duration: DURATION.base, ease: EASE_IMPERIAL } as const;
const OPEN_TRANSITION = { duration: DURATION.slow, ease: EASE_IMPERIAL } as const;

/** Hairline between the link list and the actions, faded out at both ends. */
const DIVIDER =
  'h-px w-full bg-[linear-gradient(90deg,transparent,rgb(20_84_126/0.18),transparent)]';

/**
 * Never fires, because whether this component is running in a browser cannot
 * change for the life of the tree. It exists because `useSyncExternalStore`
 * takes a subscribe function, and this is the hook that answers "has this
 * hydrated yet" without a state write inside an effect.
 */
function subscribeNever(): () => void {
  return () => {};
}

function isFocusable(element: HTMLElement): boolean {
  return !element.hasAttribute('disabled') && element.tabIndex !== -1;
}

/**
 * Mobile navigation: a burger whose two lines rotate into an X, and a
 * full-screen overlay with a staggered mask reveal.
 *
 * ## Why the overlay is rendered through a portal
 *
 * It used to be a plain `fixed inset-0` element rendered where this component
 * sits, which is inside the header pill. The pill carries `backdrop-blur-xl`,
 * and an ancestor with a `backdrop-filter` becomes the containing block for
 * any `position: fixed` descendant. So `inset: 0` resolved against the pill
 * rather than against the viewport: the overlay was laid out 178x58 px inside
 * the header, clipped to the pill's box, with 789 px of menu scrolling inside
 * 58 px of visible height. Tapping the burger produced no menu at all, only a
 * washed-out header. Measured at 320, 390, 768 and 1023 px.
 *
 * A portal to `document.body` takes the overlay out of that subtree entirely,
 * so no filter, transform or `contain` added to the header later can capture
 * it again. This is the fix for the bug; everything else here is the same
 * component with its rough edges taken off.
 *
 * ## Focus
 *
 * The portal also moves the overlay to the end of the document, after the
 * header. Tabbing off the trigger would otherwise land in the page behind the
 * overlay, so the trap below builds its cycle as `[trigger, ...panel stops]`
 * explicitly, in both directions. The trigger stays inside the cycle on
 * purpose: it is the X, and it is the only control that closes the overlay
 * with a pointer.
 *
 * `aria-modal` is deliberately not set. It tells assistive tech to treat
 * everything outside the dialog as inert, which would put that X out of reach
 * for exactly the users who depend on it. What this element does claim is all
 * true: the Tab cycle is trapped, Escape closes and returns focus, a click on
 * the backdrop closes, and any navigation closes.
 */
export function MobileMenu({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const menuId = useId();

  /**
   * The route the menu was opened on, rather than a plain boolean.
   *
   * Openness is then derived: any navigation, a link in the panel or the
   * browser's back button, makes the stored route stale and closes the
   * overlay, with no effect synchronising state against the router.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn === pathname;

  /**
   * `createPortal` needs a DOM. Rendering nothing on the server is correct
   * rather than merely safe: the overlay is closed on first paint anyway.
   *
   * `useSyncExternalStore` with a server snapshot of `false` and a client
   * snapshot of `true` is the hook built for exactly this question, and it
   * keeps the answer out of an effect, where a state write would both lint
   * as an error and cost a second render on every mount.
   */
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenedOn(null), []);

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const { overflow, paddingRight } = body.style;

    // Between 768 and 1023 px the burger is still shown and the window has a
    // real scrollbar. Locking the body removes it, and without compensation
    // the whole page jumps sideways by its width the moment the menu opens.
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpenedOn(null);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel || !trigger) return;

      const stops = [
        trigger,
        ...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ].filter(isFocusable);
      if (stops.length < 2) return;

      /*
       * Every Tab is driven from here, rather than only the two at the ends of
       * the cycle.
       *
       * Intercepting just the boundaries is the usual shape of a focus trap
       * and it does not work once the panel is portalled: the panel is then
       * the last thing in the document and the trigger is up in the header, so
       * a natural Tab off the trigger walks the entire page in between and
       * never reaches a boundary the handler would catch. Measured before this
       * change: Tab from the X landed on the hero's service chips.
       *
       * Focus sitting outside the set at all, which is what a click on the
       * backdrop leaves behind, enters at the top of the cycle.
       */
      const active = document.activeElement as HTMLElement | null;
      const index = active ? stops.indexOf(active) : -1;
      const step = event.shiftKey ? -1 : 1;
      const next =
        index === -1
          ? 0
          : (index + step + stops.length) % stops.length;

      event.preventDefault();
      stops[next].focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Under reduced motion the overlay still appears and disappears, it just
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
    : ({ variants: lineVariants, transition } as const);

  const overlay = (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          id={menuId}
          ref={panelRef}
          role="dialog"
          aria-label="Menü"
          variants={overlayVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={transition}
          /* Closes on a tap into empty space.
             Not `event.target === event.currentTarget`: the content column
             inside is `w-full min-h-full`, so it covers the overlay edge to
             edge and that identity check never became true. Asking whether
             the tap landed on a control is the question actually being asked,
             and it holds wherever the column happens to end. */
          onClick={(event) => {
            if (!(event.target as HTMLElement).closest('a,button')) close();
          }}
          className={cn(
            'fixed inset-0 z-40 overflow-y-auto overscroll-contain',
            /* The only two places a backdrop-blur is allowed on this site are
               this overlay and the header pill: both are out of scroll flow,
               so the blur rasterises once instead of on every scrolled frame.
               95% rather than the 85% this carried before, because the page
               behind it is no longer uniformly light. Over the ink footer the
               surface lands on #EFF1F2, where ink measures 15.41:1 and
               neutral-700 7.51:1. At 85% neutral-500 fell to 4.3:1, which is
               why no muted grey is used below. */
            'bg-paper/95 backdrop-blur-2xl',
          )}
        >
          <motion.div
            {...(prefersReducedMotion
              ? {}
              : ({
                  variants: listVariants,
                  initial: 'closed',
                  animate: 'open',
                  exit: 'closed',
                } as const))}
            /* min-h-full, not h-full: on a landscape phone the content is
               taller than the viewport and has to be allowed to grow so the
               overlay scrolls it, instead of being clipped at 100%. */
            className="mx-auto flex min-h-full w-full max-w-shell flex-col px-6 pb-10"
          >
            {/* Clears the floating pill, which stays above the overlay. */}
            <div aria-hidden="true" className="h-24 shrink-0" />

            <nav aria-label="Seiten">
              <ul className="flex flex-col">
                {primaryNav.map((item) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.span {...reveal} className="block">
                      <Link
                        href={item.href}
                        onClick={close}
                        className={cn(
                          'flex min-h-14 items-center py-1 text-title-lg text-ink sm:text-title-xl',
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
            </nav>

            <motion.div {...reveal} className="mt-8 flex flex-col gap-6">
              <span aria-hidden="true" className={DIVIDER} />

              <Button href={primaryCta.href} onClick={close} magnetic={false}>
                {primaryCta.label}
              </Button>

              <div className="flex flex-col gap-2">
                <a
                  href={company.phone.href}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-3 self-start rounded-pill pr-4',
                    'text-body text-neutral-700 transition-colors',
                    'duration-[var(--duration-swift)] ease-imperial-soft',
                    'hover:text-brand-900 focus-visible:outline-2',
                    'focus-visible:outline-offset-3 focus-visible:outline-brand-500',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-050 text-brand-700 shadow-[var(--shadow-hairline-brand)]"
                  >
                    <PhoneIcon size={17} weight="light" />
                  </span>
                  <span data-numeric>{company.phone.display}</span>
                </a>

                {businessHours ? (
                  <p className="text-micro text-neutral-700">
                    {businessHours.daysLabel} {businessHours.timeLabel}
                  </p>
                ) : null}
              </div>
            </motion.div>

            {/* `mt-auto` parks this at the bottom when there is room and lets
                it sit directly under the actions when there is not. */}
            <motion.ul
              {...reveal}
              className="mt-auto flex flex-wrap items-center gap-x-6 pt-10 text-micro text-neutral-700"
            >
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      'inline-flex min-h-11 items-center underline-offset-4',
                      'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                      'hover:text-brand-900 hover:underline focus-visible:outline-2',
                      'focus-visible:outline-offset-3 focus-visible:outline-brand-500',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpenedOn(isOpen ? null : pathname)}
        aria-expanded={isOpen}
        /* Set only while the overlay is mounted. AnimatePresence removes it on
           close, and a dangling `aria-controls` is an invalid reference. */
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
              className="absolute inset-x-0 top-1/2 -mt-[0.75px] block h-[1.5px] rounded-full bg-current"
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

      {mounted ? createPortal(overlay, document.body) : null}
    </div>
  );
}
