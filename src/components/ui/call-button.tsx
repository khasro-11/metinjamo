'use client';

import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';

import { company } from '@/config/company';

import { Button } from './button';
import type { ButtonSize, ButtonVariant } from './button';

export interface CallButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * The click-to-call CTA, as its own client leaf.
 *
 * It exists because of a hard boundary rule, not for styling: `Button` is a
 * client component and its `icon` prop takes a component reference, which
 * cannot be serialised across the server/client boundary. A server parent
 * writing `icon={PhoneIcon}` fails at prerender with "Functions cannot be
 * passed directly to Client Components". Resolving the icon on this side of the
 * boundary lets every page that needs a phone CTA — the hero, the 404 — stay a
 * server component.
 *
 * The visible label is the number itself; the accessible name adds the verb
 * that a sighted user reads off the phone icon.
 */
export function CallButton({
  variant = 'secondary',
  size = 'lg',
  className,
}: CallButtonProps) {
  return (
    <Button
      href={company.phone.href}
      variant={variant}
      size={size}
      icon={PhoneIcon}
      className={className}
      aria-label={`Anrufen: ${company.phone.display}`}
    >
      <span data-numeric>{company.phone.display}</span>
    </Button>
  );
}
