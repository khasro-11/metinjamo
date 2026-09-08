/**
 * Joins class names, dropping falsy entries.
 *
 * Deliberately not clsx + tailwind-merge: the primitives in `components/ui`
 * expose dedicated variant props instead of expecting callers to override
 * utilities, so there is nothing to de-duplicate and no dependency to add.
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ');
}
