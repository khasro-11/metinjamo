'use client';

import { cn } from '@/lib/cn';
import { openConsentSettings } from '@/lib/consent';

/**
 * The permanent way back into the consent settings.
 *
 * Art. 7 Abs. 3 DSGVO requires that withdrawing consent be as easy as giving
 * it, which in practice means a control that is always reachable rather than a
 * banner that never returns. It sits in the footer legal row on every page,
 * next to Impressum and Datenschutzerklärung.
 *
 * A client leaf on purpose: the footer is a server component and stays one.
 * This button is the only hydrated thing in it, and all it does is dispatch
 * the event `ConsentManager` listens for.
 *
 * Styling is copied from the footer's own legal links rather than shared
 * through a constant — `site-footer.tsx` builds that class list inline for its
 * `<Link>` elements, and exporting it to be imported back would couple a
 * server component and a client component for four utilities.
 */
export function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className={cn(
        'inline-flex min-h-11 items-center',
        // The footer is a light ground now, where neutral-400 is 3.03:1
        // and below AA at this size.
        'text-micro text-neutral-500 underline-offset-4',
        'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
        'hover:text-navy hover:underline',
        'focus-visible:outline-2 focus-visible:outline-offset-3',
        'focus-visible:outline-brand-500',
        className,
      )}
    >
      Cookie-Einstellungen
    </button>
  );
}
