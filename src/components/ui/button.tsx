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

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

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
};

const SIZE: Record<ButtonSize, string> = {
  // Both clear the 44px touch target.
  md: 'h-12 gap-3 text-body-sm',
  lg: 'h-14 gap-4 text-body',
};

/**
 * Padding is picked once, not layered — emitting `pr-2` from the size map and
 * `pr-8` from an icon check would leave two competing utilities on the same
 * element, resolved by stylesheet order rather than by class order.
 */
const SIZE_PADDING: Record<ButtonSize, { withIcon: string; plain: string }> = {
  md: { withIcon: 'pl-6 pr-2', plain: 'px-6' },
  lg: { withIcon: 'pl-8 pr-2.5', plain: 'px-8' },
};

const ICON_WRAPPER_SIZE: Record<ButtonSize, string> = {
  md: 'size-8',
  lg: 'size-10',
};

const ICON_PX: Record<ButtonSize, number> = { md: 15, lg: 17 };

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
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500',
    'disabled:pointer-events-none disabled:opacity-55',
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
