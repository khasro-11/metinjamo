import Image from 'next/image';

import { company } from '@/config/company';
import { cn } from '@/lib/cn';

/**
 * Intrinsic aspect ratios of the delivered files. Kept here so every call site
 * can pass a height and get a correct width without re-measuring the SVG.
 *
 * TODO (client): both files are auto-traced from the JPEG — ~97 KB and ~60 KB
 * of path data for what should be a few hundred bytes of vector. Ask for a
 * clean, hand-built SVG before launch; until then they are served unoptimised
 * and rely on transport compression.
 */
const WORDMARK_RATIO = 3660 / 1268;
const MARK_RATIO = 1116 / 1252;

export interface LogoProps {
  /** Full wordmark, or the window icon on its own (mobile, favicon slots). */
  variant?: 'wordmark' | 'mark';
  /** Rendered height in px. Width follows from the intrinsic ratio. */
  height?: number;
  /** Above-the-fold instances only — the header, not the footer. */
  priority?: boolean;
  className?: string;
}

/**
 * The brand logo as an image.
 *
 * `unoptimized` is deliberate: Next refuses SVG through the image optimiser
 * unless `dangerouslyAllowSVG` is set globally, and loosening that for the
 * whole project to serve two first-party files would be the wrong trade. The
 * files are already vectors, so there is nothing for the optimiser to do.
 *
 * Decorative by default — the accessible name comes from the surrounding link,
 * which avoids a doubled "Imperial Gebäudeservice GmbH, Zur Startseite" for
 * screen reader users. Pass `alt` deliberately only where the logo stands
 * alone.
 */
export function Logo({
  variant = 'wordmark',
  height = 28,
  priority = false,
  className,
}: LogoProps) {
  const isWordmark = variant === 'wordmark';
  const ratio = isWordmark ? WORDMARK_RATIO : MARK_RATIO;

  return (
    <Image
      src={isWordmark ? '/logo.svg' : '/logo-mark.svg'}
      alt=""
      width={Math.round(height * ratio)}
      height={height}
      priority={priority}
      unoptimized
      className={cn('w-auto', className)}
    />
  );
}

/** Accessible name for every link that wraps a bare logo. */
export const LOGO_LINK_LABEL = `${company.legalName} — zur Startseite`;
