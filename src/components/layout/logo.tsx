import Image from 'next/image';

import { company } from '@/config/company';

/**
 * Intrinsic aspect ratios of the delivered files. Kept here so every call site
 * can pass a height and get a correct width without re-measuring the SVG.
 *
 * `logo.svg` and `logo-mark.svg` are the production copies. They are derived
 * from the client delivery, which survives untouched as `logo-imperial*.svg`,
 * and differ from it in exactly one respect: the trace painted #14688f /
 * #36aadb / #525353, three colours that are in no palette. They now carry the
 * three tokens CLAUDE.md 4 assigns to precisely these roles — blue-900 for the
 * wordmark, blue-300 for the icon accent, grey-700 for the subline — so the
 * mark is the one place the brand's three colours appear together rather than
 * a fourth, near-miss set that quietly disagrees with every surface around it.
 *
 * TODO (client): both files are auto-traced from the JPEG — ~97 KB and ~60 KB
 * of path data (99.7% of each file, no strippable metadata) for what should be
 * a few hundred bytes of vector. Ask for a clean, hand-built SVG before launch;
 * until then they are served unoptimised and rely on transport compression.
 */
const WORDMARK_RATIO = 3660 / 1268;
const MARK_RATIO = 1116 / 1252;

export interface LogoProps {
  /** Full wordmark, or the window icon on its own (mobile, favicon slots). */
  variant?: 'wordmark' | 'mark';
  /**
   * The white cut, for the ink footer and any brand-900 ground (CLAUDE.md 4).
   * The colour logo sets its wordmark in brand-900 and its subline in
   * neutral-700, neither of which survives a dark surface.
   */
  tone?: 'colour' | 'white';
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
  tone = 'colour',
  height = 28,
  priority = false,
  className,
}: LogoProps) {
  const isWordmark = variant === 'wordmark';
  const ratio = isWordmark ? WORDMARK_RATIO : MARK_RATIO;
  // The white cuts carry the same viewBox as their colour counterparts, so
  // the ratios above hold for both and the layout does not shift with tone.
  const src =
    tone === 'white'
      ? isWordmark
        ? '/logo-imperial-weiss.svg'
        : '/logo-imperial-mark-weiss.svg'
      : isWordmark
        ? '/logo.svg'
        : '/logo-mark.svg';

  return (
    <Image
      src={src}
      alt=""
      width={Math.round(height * ratio)}
      height={height}
      priority={priority}
      unoptimized
      /*
       * The height MUST be a real CSS length, not the `height` attribute.
       *
       * Both SVGs carry a viewBox and no width/height, so they have an
       * intrinsic ratio and no intrinsic size. The width/height next/image
       * writes into the markup are presentational hints, which every author
       * rule outranks — Tailwind's preflight `img { height: auto }` is on its
       * own enough to discard them. With both axes resolving to `auto` and no
       * intrinsic size to fall back on, the element paints at the CSS default
       * object size: ~380px wide for the wordmark instead of the 30px asked
       * for. Inside the header's `w-max` pill `max-width: 100%` then crushed
       * it back to nothing, so the logo disappeared entirely.
       *
       * An inline style is the fix rather than a utility class because it is
       * the one declaration a caller's `className` cannot accidentally
       * outrank. Width follows from the ratio.
       */
      style={{ height: `${height}px`, width: 'auto' }}
      className={className}
    />
  );
}

/** Accessible name for every link that wraps a bare logo. */
export const LOGO_LINK_LABEL = `${company.legalName} — zur Startseite`;
