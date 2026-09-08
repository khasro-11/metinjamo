import { cn } from '@/lib/cn';

/**
 * The window raster from the logo icon, reduced to a hairline cross in a
 * squircle. Used as a structural marker (eyebrow bullet, card corner) — the
 * brand's own motif instead of a generic dot or em dash.
 */
export function WindowMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className={cn('size-2.5 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <rect x="0.5" y="0.5" width="9" height="9" rx="2" />
      <path d="M5 0.5v9M0.5 5h9" />
    </svg>
  );
}
