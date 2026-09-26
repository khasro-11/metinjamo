'use client';

import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'sky'
  | 'skyOutline'
  | 'navyOutline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon inside the nested round wrapper. `null` renders a plain pill. */
  icon?: Icon | null;
  /** Magnetic pointer physics. Disable inside dense rows or sticky bars. */
  magnetic?: boolean;
  className?: string;
}

export type ButtonProps = ButtonBaseProps &
  (
    | ({ href: string } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        'className' | 'children' | 'href'
      >)
    | ({ href?: never } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'className' | 'children'
      >)
  );

const SURFACE: Record<ButtonVariant, string> = {
  // brand-900 on paper is 7.9:1 — AAA.
  primary:
    'bg-brand-900 text-paper shadow-[var(--shadow-ambient-brand)] hover:bg-brand-700',
  secondary:
    'bg-white text-ink shadow-[var(--shadow-ambient-sm),var(--shadow-hairline)] hover:bg-brand-050',
  ghost: 'bg-transparent text-brand-900 hover:bg-brand-050',

  /* --- The three summit-palette variants -------------------------------
     Used by the hero and the header only, for now.

     `sky` is the filled primary. Navy on accent-sky measures 8.95:1, which
     is why the lettering is dark rather than white: white on that pastel
     would be 2.2:1 and unreadable.

     The two outline variants carry their ring in the text-safe cut of the
     hue rather than the pastel. A control's boundary has to clear 3:1
     against what surrounds it (WCAG 1.4.11), and accent-sky on white is
     1.99:1 — the pill would be a suggestion of a button rather than a
     button. accent-sky-ink is 5.63:1 and navy is 17.84:1. */
  sky: 'bg-accent-sky text-navy hover:bg-accent-sky/85',
  skyOutline:
    'bg-transparent text-navy shadow-[inset_0_0_0_1px_var(--color-accent-sky-ink)] hover:bg-accent-sky/15',
  navyOutline:
    'bg-transparent text-navy shadow-[inset_0_0_0_1px_var(--color-navy)] hover:bg-navy hover:text-paper',
};

/**
 * The accent blue appears here and almost nowhere else — CTA hover is exactly
 * the sparse use CLAUDE.md 4 reserves it for.
 */
const ICON_WRAPPER: Record<ButtonVariant, string> = {
  primary:
    'bg-white/15 text-paper group-hover:bg-brand-300 group-hover:text-brand-900',
  secondary:
    'bg-brand-050 text-brand-700 group-hover:bg-brand-300 group-hover:text-brand-900',
  ghost:
    'bg-brand-050 text-brand-700 group-hover:bg-brand-300 group-hover:text-brand-900',
  sky: 'bg-white/45 text-navy group-hover:bg-white',
  skyOutline: 'bg-accent-sky/25 text-navy group-hover:bg-accent-sky/45',
  navyOutline: 'bg-navy/10 text-navy group-hover:bg-white/20 group-hover:text-paper',
};

/**
 * The focus ring is variant-driven, not a single shared class.
 *
 * A focus indicator has to clear 3:1 against what surrounds it, and the two
 * palettes on this site need different rings to do that. brand-500 manages
 * 3.86:1 on paper, which covers the three brand variants. The summit
 * variants sit on white next to pastels, where brand-500 is the wrong hue
 * and barely separates from accent-sky; navy is 17.84:1 there.
 */
const FOCUS: Record<ButtonVariant, string> = {
  primary: 'focus-visible:outline-brand-500',
  secondary: 'focus-visible:outline-brand-500',
  ghost: 'focus-visible:outline-brand-500',
  sky: 'focus-visible:outline-navy',
  skyOutline: 'focus-visible:outline-navy',
  navyOutline: 'focus-visible:outline-navy',
};

const SIZE: Record<ButtonSize, string> = {
  // All three clear the 44px touch target.
  sm: 'h-11 gap-2.5 text-body-sm',
  md: 'h-12 gap-3 text-body-sm',
  lg: 'h-14 gap-4 text-body',
};

/**
 * Padding is picked once, not layered — emitting `pr-2` from the size map and
 * `pr-8` from an icon check would leave two competing utilities on the same
 * element, resolved by stylesheet order rather than by class order.
 */
const SIZE_PADDING: Record<ButtonSize, { withIcon: string; plain: string }> = {
  sm: { withIcon: 'pl-5 pr-1.5', plain: 'px-5' },
  md: { withIcon: 'pl-6 pr-2', plain: 'px-6' },
  lg: { withIcon: 'pl-6 pr-2 sm:pl-8 sm:pr-2.5', plain: 'px-6 sm:px-8' },
};

const ICON_WRAPPER_SIZE: Record<ButtonSize, string> = {
  sm: 'size-8',
  md: 'size-8',
  lg: 'size-10',
};

const ICON_PX: Record<ButtonSize, number> = { sm: 14, md: 15, lg: 17 };

/** Max travel of the magnetic pull, in px. */
const MAGNET_STRENGTH = 12;

function isInternalHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#');
}

/**
 * Pill CTA with a nested icon wrapper and magnetic hover physics.
 *
 * The magnet lives on an outer wrapper, so the interactive element stays a
 * plain `<button>` / `<Link>` / `<a>` — keyboard, focus ring and routing are
 * untouched by the animation. Pointer offset drives a spring rather than
 * component state; the arrow wrapper trails at a higher factor so it reads as
 * leading the cursor.
 *
 * Magnetism is skipped for coarse pointers and under `prefers-reduced-motion`.
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'lg',
    icon: IconComponent = ArrowRightIcon,
    magnetic = true,
    className,
    ...rest
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);

  const spring = { stiffness: 260, damping: 24, mass: 0.6 } as const;
  const springX = useSpring(pullX, spring);
  const springY = useSpring(pullY, spring);
  const arrowX = useTransform(springX, (value) => value * 0.45);

  const magnetActive = magnetic && !prefersReducedMotion;

  function handlePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    if (!magnetActive || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetY = event.clientY - (bounds.top + bounds.height / 2);
    // Normalised to [-1, 1] inside the element, then scaled. Vertical travel
    // is damped — the pill is much wider than it is tall.
    pullX.set((offsetX / (bounds.width / 2)) * MAGNET_STRENGTH);
    pullY.set((offsetY / (bounds.height / 2)) * MAGNET_STRENGTH * 0.5);
  }

  function releaseMagnet() {
    pullX.set(0);
    pullY.set(0);
  }

  const classes = cn(
    'group relative inline-flex items-center justify-center rounded-pill font-medium',
    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
    'focus-visible:outline-2 focus-visible:outline-offset-3',
    'disabled:pointer-events-none disabled:opacity-55',
    FOCUS[variant],
    SIZE[size],
    IconComponent ? SIZE_PADDING[size].withIcon : SIZE_PADDING[size].plain,
    SURFACE[variant],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {IconComponent ? (
        <motion.span
          aria-hidden="true"
          style={{ x: arrowX }}
          className={cn(
            'grid shrink-0 place-items-center rounded-full',
            'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
            ICON_WRAPPER_SIZE[size],
            ICON_WRAPPER[variant],
          )}
        >
          <IconComponent size={ICON_PX[size]} weight="light" />
        </motion.span>
      ) : null}
    </>
  );

  let control: ReactNode;

  if (typeof props.href === 'string') {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    control = isInternalHref(href) ? (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    );
  } else {
    const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;

    control = (
      <button {...buttonProps} type={buttonProps.type ?? 'button'} className={classes}>
        {content}
      </button>
    );
  }

  return (
    <motion.span
      className="inline-flex"
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={releaseMagnet}
      onPointerCancel={releaseMagnet}
    >
      {control}
    </motion.span>
  );
}
