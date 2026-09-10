'use client';

import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

import { Button } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta, primaryNav } from '@/config/navigation';
import { cn } from '@/lib/cn';

import { LOGO_LINK_LABEL, Logo } from './logo';
import { MobileMenu } from './mobile-menu';

/** Scroll distance over which the pill settles into its denser state, in px. */
const SETTLE_DISTANCE = 72;

/**
 * Hairline separator, drawn as a gradient so it fades out at both ends instead
 * of butting into the pill's padding.
 */
const DIVIDER_CLASSES =
  'h-6 w-px shrink-0 bg-gradient-to-b from-transparent via-ink/12 to-transparent';

function isActive(pathname: string, href: string): boolean {
  // Anchors point at sections of a page, never at a page — they are never the
  // "current page" for the purposes of aria-current.
  if (href.includes('#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Floating glass pill, offset from the top edge and centred on its own width —
 * not an edge-to-edge sticky bar.
 *
 * Reading order: the mark on the left, then the menu, then the two contact
 * actions, with the burger taking the far right below `lg`. DOM order matches
 * that visual order at every breakpoint — the burger is placed last in the
 * markup rather than reordered visually, so the tab sequence never disagrees
 * with what the eye follows.
 *
 * The sticky element keeps its top padding while pinned, so the pill stays
 * clear of the viewport edge instead of snapping flush on the first scroll.
 * `backdrop-blur` is confined to this element and to the mobile overlay: both
 * are taken out of scroll flow, so the blur is rasterised once rather than on
 * every scrolled frame.
 *
 * A client leaf by necessity — scroll progress, the burger morph and the
 * overlay all need the browser. It pulls its data from static config, so
 * nothing but the interaction crosses the boundary.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Scroll drives opacity on a separate layer rather than mutating the pill's
  // own background or shadow — opacity composites, a shadow repaints.
  const settledOpacity = useTransform(scrollY, [0, SETTLE_DISTANCE], [0, 1]);

  return (
    <header className="pointer-events-none sticky top-0 z-50 pt-6 pb-3">
      <div
        className={cn(
          'imp-bezel pointer-events-auto relative mx-auto w-max max-w-[calc(100%-2rem)]',
          'bg-white/55 backdrop-blur-xl',
        )}
        style={
          {
            '--bezel-radius': 'var(--radius-pill)',
            '--bezel-inset': 'var(--bezel-inset-sm)',
            boxShadow: 'var(--shadow-ambient-sm), var(--shadow-hairline)',
          } as CSSProperties
        }
      >
        {/* The settled state, faded in on scroll. Denser glass, deeper
            ambient shadow — the pill reads as lifting off the page. */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-pill bg-white/45"
          style={{
            opacity: prefersReducedMotion ? 1 : settledOpacity,
            boxShadow: 'var(--shadow-ambient-md), var(--shadow-hairline-brand)',
          }}
        />

        <div className="imp-bezel-core relative flex items-center gap-2 bg-white/40 pl-4 pr-1.5 shadow-[var(--shadow-bevel)] sm:pl-5">
          <Link
            href="/"
            aria-label={LOGO_LINK_LABEL}
            className={cn(
              'flex min-w-11 shrink-0 items-center rounded-pill py-[0.4375rem] pr-1',
              'focus-visible:outline-2 focus-visible:outline-offset-4',
              'focus-visible:outline-brand-500',
            )}
          >
            {/* 36px of art + 2 x 0.4375rem of padding = a 50px link, which is
                exactly the 3.125rem the hero's HEADER_SPACE reserves for the
                tallest pill child. Growing the mark therefore costs padding,
                not pill height — the alternative is editing a magic number in
                two files and re-deriving the hero's negative top margin. */}
            <Logo variant="mark" height={36} priority className="lg:hidden" />
            <Logo
              variant="wordmark"
              height={36}
              priority
              className="hidden lg:block"
            />
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex h-11 items-center rounded-pill px-3.5 text-body-sm',
                        'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                        'focus-visible:outline-2 focus-visible:outline-offset-2',
                        'focus-visible:outline-brand-500',
                        active
                          ? 'bg-brand-050 text-brand-900'
                          : 'text-neutral-700 hover:bg-brand-050/70 hover:text-brand-900',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <span aria-hidden="true" className={cn('hidden lg:block', DIVIDER_CLASSES)} />

          <a
            href={company.phone.href}
            className={cn(
              'hidden h-11 shrink-0 items-center gap-2.5 rounded-pill px-3.5 text-body-sm',
              'text-neutral-700 transition-colors duration-[var(--duration-swift)]',
              'ease-imperial-soft hover:bg-brand-050/70 hover:text-brand-900',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-brand-500 lg:inline-flex',
            )}
          >
            <PhoneIcon size={16} weight="light" aria-hidden="true" />
            <span data-numeric>{company.phone.display}</span>
          </a>

          {/* Compact call target below lg, where the number itself would blow
              the pill past the viewport. */}
          <a
            href={company.phone.href}
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-full text-brand-900',
              'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
              'hover:bg-brand-050 focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-brand-500 lg:hidden',
            )}
          >
            <PhoneIcon size={19} weight="light" aria-hidden="true" />
            <span className="sr-only">
              Anrufen: {company.phone.display}
            </span>
          </a>

          <span className="hidden sm:block">
            <Button href={primaryCta.href} size="md" magnetic={false}>
              {primaryCta.label}
            </Button>
          </span>

          <MobileMenu className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
