'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui';
import { primaryCta, primaryNav } from '@/config/navigation';
import { cn } from '@/lib/cn';

import { LOGO_LINK_LABEL, Logo } from './logo';
import { MobileMenu } from './mobile-menu';

function isActive(pathname: string, href: string): boolean {
  // Anchors point at sections of a page, never at a page — they are never the
  // "current page" for the purposes of aria-current.
  if (href.includes('#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Flat site header: logo left, links right, outline CTA at the end.
 *
 * ## What changed, and what it costs
 *
 * This replaces the floating glass pill from CLAUDE.md 5.5, on the client's
 * instruction and after the reference design. Three consequences worth
 * knowing:
 *
 * 1. The logo is now on the LEFT, sharing the hero's container and gutters,
 *    so it sits flush with the left edge of the headline. 5.5 asks for the
 *    logo on the right; the reference puts it on the left and so does this.
 * 2. The bar is in the flow rather than `sticky`, because a flat bar "im
 *    selben Container wie der Hero-Inhalt" is a bar that scrolls away with
 *    the hero. That means the primary CTA is only reachable at the top of
 *    the page. Making it sticky again is adding `sticky top-0 z-50 bg-white`
 *    to the `<header>`; nothing else here assumes one or the other.
 * 3. With no dark ground to sit on, the two-state glass and the white logo
 *    cut are gone, along with the scroll listener that drove them. The
 *    header no longer reads scroll position at all.
 *
 * Still a client component, but now only because `usePathname` decides which
 * link is the current page and because the mobile overlay lives here.
 */
export function SiteHeader() {
  const pathname = usePathname();

  // The bar carries no background of its own. It is in the flow, so it sits
  // on whatever section is behind it; a white fill left a visible seam on the
  // legal pages, whose ground is paper (#fbfcfd) rather than white.
  return (
    <header className="w-full">
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <div className="flex h-20 items-center justify-between gap-6 md:h-24">
          {/* Flush with the left edge of the hero headline, because the
              header shares the hero's container and its gutters. */}
          <Link
            href="/"
            aria-label={LOGO_LINK_LABEL}
            className={cn(
              'flex shrink-0 items-center rounded-[1rem] py-2',
              'focus-visible:outline-2 focus-visible:outline-offset-4',
              'focus-visible:outline-navy',
            )}
          >
            <Logo variant="wordmark" height={38} priority />
          </Link>

          <nav
            aria-label="Hauptnavigation"
            className="hidden items-center gap-8 lg:flex xl:gap-10"
          >
            <ul className="flex items-center gap-8 xl:gap-10">
              {primaryNav.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex h-11 items-center rounded-[0.75rem] text-body text-navy',
                        'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                        'hover:text-accent-sky-ink',
                        'focus-visible:outline-2 focus-visible:outline-offset-4',
                        'focus-visible:outline-navy',
                        active && 'text-accent-sky-ink',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* The outline pill, the reference's "Contact Us". Its ring is
                navy at 17.84:1 on white, so the control's boundary clears
                the 3:1 that WCAG 1.4.11 asks of it several times over. */}
            <Button
              href={primaryCta.href}
              variant="navyOutline"
              size="sm"
              icon={null}
              magnetic={false}
            >
              {primaryCta.label}
            </Button>
          </nav>

          {/* Below lg the whole right-hand side is the burger. The phone
              number that used to live in this bar is now in the hero, and
              the overlay carries it as well. */}
          <MobileMenu className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
