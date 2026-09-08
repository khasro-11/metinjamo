/**
 * The motion scale, in one place.
 *
 * The same numbers exist twice by necessity: CSS transitions read the
 * `--duration-*` / `--ease-*` custom properties from globals.css, Motion reads
 * plain JS values. They are mirrored here so a change to the scale is a change
 * to two files that sit next to each other in review, instead of to fourteen
 * component files. Before this module every animated component declared its own
 * `EASE_IMPERIAL` tuple and picked a duration by feel — five identical copies
 * of the curve and eight durations that were on no scale at all.
 *
 * Seconds, because that is Motion's unit. CSS keeps milliseconds.
 */

/** cubic-bezier(0.32, 0.72, 0, 1) — the house curve. Mirrors `--ease-imperial`. */
export const EASE_IMPERIAL: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** cubic-bezier(0.22, 1, 0.36, 1) — the softer sibling. Mirrors `--ease-imperial-soft`. */
export const EASE_IMPERIAL_SOFT: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

/**
 * Three tiers, and a rule for which is which. Anything that does not fit one of
 * them is a sign the interaction itself needs rethinking, not a fourth number.
 *
 * `swift`  — pointer feedback. Every hover and focus on the site, without
 *            exception: colour, shadow and the card lift all run at this
 *            duration so the parts of one element never desynchronise under
 *            the same pointer event.
 * `base`   — a state the user changed: an accordion opening, a step advancing,
 *            a panel closing, a form step swapping.
 * `slow`   — orchestrated arrivals. Scroll reveals and the mobile overlay
 *            opening. Nothing the user waits on.
 */
export const DURATION = {
  swift: 0.2,
  base: 0.42,
  slow: 0.76,
} as const;

/**
 * Delay between siblings in a staggered group, in seconds.
 *
 * `list` is for content the reader scrolls to and reads at leisure. `entrance`
 * is tighter because it is spent on the first screen, where every millisecond
 * is a millisecond the visitor spends looking at an incomplete page.
 */
export const STAGGER = {
  list: 0.06,
  entrance: 0.04,
} as const;

/** Motion transition for the tier, ready to spread into a `transition` prop. */
export function transitionOf(
  tier: keyof typeof DURATION,
  delay = 0,
): { duration: number; delay: number; ease: [number, number, number, number] } {
  return { duration: DURATION[tier], delay, ease: EASE_IMPERIAL };
}
