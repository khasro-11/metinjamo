import Link from 'next/link';
import type { ReactNode } from 'react';

import { Bezel, Eyebrow, WindowMark } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Layout primitives shared by /impressum and /datenschutz.
 *
 * These two pages are reference documents, not marketing surfaces. Someone
 * arrives here to check one fact — who runs this site, how long a request is
 * kept — and leaves again. Three consequences run through everything below:
 *
 *  1. **Zero client JavaScript.** No <Reveal>, no accordion, no scroll spy.
 *     Legal text that fades in on scroll is text you cannot Ctrl+F, cannot
 *     print reliably and cannot read with a screen reader in peace. The
 *     `prefers-reduced-motion` requirement (CLAUDE.md 9) is met here by there
 *     being no motion to reduce.
 *  2. **Set measure, not container width.** Running text is capped at
 *     `max-w-legal` (~67ch, see globals.css) — comfortably under the
 *     70-character ceiling these pages are set to.
 *  3. **Editorial Split as the section grid.** The number and heading sit in
 *     a left rail from `lg`, the text in a column of its own. That is what
 *     turns twelve sections into something scannable instead of a wall.
 */

/* -------------------------------------------------------------------------
   Section registry
   ---------------------------------------------------------------------- */

export interface LegalSectionMeta {
  readonly id: string;
  readonly title: string;
}

/**
 * Numbering and the table of contents are derived from one list, so a
 * reordered or renamed section can never leave the ToC pointing at a heading
 * that no longer says the same thing. `get()` throws on an unknown id, and
 * because both pages are statically rendered that failure surfaces at build
 * time rather than in production.
 */
export function createSectionIndex<const T extends readonly LegalSectionMeta[]>(
  sections: T,
) {
  return {
    all: sections,
    get(id: T[number]['id']) {
      const position = sections.findIndex((section) => section.id === id);
      if (position < 0) {
        throw new Error(`Unknown legal section id: ${id}`);
      }
      return { ...sections[position], index: position + 1 };
    },
  };
}

/* -------------------------------------------------------------------------
   Page frame
   ---------------------------------------------------------------------- */

/** The shared page gutter, identical to the landing-page sections. */
const SHELL = 'mx-auto w-full max-w-shell px-6 md:px-10';

export function LegalPage({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}

export function LegalHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** Optional slot under the lead — used for the table of contents. */
  children?: ReactNode;
}) {
  return (
    <header className="py-section md:py-section-md">
      <div className={SHELL}>
        <Eyebrow>{eyebrow}</Eyebrow>

        <h1 className="mt-6 max-w-legal text-title-xl">{title}</h1>

        <p className="mt-6 max-w-legal text-lead text-neutral-700">{lead}</p>

        {children}
      </div>
    </header>
  );
}

/** Holds the section stack and draws the hairline rhythm between sections. */
export function LegalBody({ children }: { children: ReactNode }) {
  return (
    <div className={cn(SHELL, 'pb-section-lg md:pb-section-xl')}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Sections
   ---------------------------------------------------------------------- */

export function LegalSection({
  id,
  index,
  title,
  children,
}: LegalSectionMeta & { index: number; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titel`}
      /* Divider as an inset hairline, never a 1px grey border (CLAUDE.md 5.7).
         `first:shadow-none` keeps the rule off the top of the stack, where the
         page header already provides the break. */
      className={cn(
        'grid gap-6 pt-14 lg:grid-cols-12 lg:gap-10 lg:pt-20',
        'shadow-[inset_0_1px_0_0_rgb(15_27_36_/_0.06)] first:shadow-none first:pt-0',
      )}
    >
      <header className="lg:col-span-4">
        <p
          data-numeric=""
          aria-hidden="true"
          className="text-eyebrow uppercase text-brand-700"
        >
          {String(index).padStart(2, '0')}
        </p>
        <h2 id={`${id}-titel`} className="mt-3 text-title-md lg:sticky lg:top-28">
          {title}
        </h2>
      </header>

      <div className="max-w-legal lg:col-span-8">{children}</div>
    </section>
  );
}

/** Third level, inside a section. Kept visually much quieter than the H2. */
export function LegalSubsection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="mt-10 first:mt-0">
      <h3 className="text-title-sm">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * Running text. Vertical rhythm is owned here rather than repeated as
 * `mt-4` on every paragraph in both pages.
 */
export function LegalProse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'space-y-4 text-body text-neutral-700',
        '[&_strong]:font-medium [&_strong]:text-ink',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Bulleted list. The marker is the brand window mark, not a generic disc. */
export function LegalList({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul className="space-y-3 text-body text-neutral-700">
      {items.map((item, position) => (
        <li key={position} className="flex gap-3">
          <WindowMark className="mt-[0.6em] text-brand-300" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------
   Data blocks
   ---------------------------------------------------------------------- */

/**
 * Label/value card for structured facts — registry entry, insurance, the
 * controller's address. A description list rather than a table: these are
 * term/definition pairs, and subgrid keeps both columns on one axis without
 * hardcoding a label width.
 */
export function DataCard({ children }: { children: ReactNode }) {
  return (
    <Bezel
      radius="lg"
      inset="md"
      tone="paper"
      elevation="sm"
      innerClassName="p-6 md:p-8"
    >
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[minmax(0,10rem)_1fr]">
        {children}
      </dl>
    </Bezel>
  );
}

export function DataRow({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div className="sm:col-span-2 sm:grid sm:grid-cols-subgrid sm:items-baseline">
      <dt className="text-body-sm text-neutral-500">{term}</dt>
      <dd className="mt-1 text-body text-ink sm:mt-0">{children}</dd>
    </div>
  );
}

/**
 * A value that is deliberately not filled in yet.
 *
 * Two jobs at once. On the imprint it renders `PENDING_LABEL` ("Angabe
 * folgt") — the wording CLAUDE.md 2 requires for the VAT ID and the insurer,
 * which must be neither invented nor silently dropped. On the privacy policy
 * it names the service or the retention period that still has to be decided,
 * so the gap is visible to the client reviewing the draft instead of hiding
 * in a source comment.
 *
 * Every occurrence is a launch blocker. None of them may still be on the page
 * when it goes live.
 */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-pill px-3 py-1',
        'bg-brand-050 text-body-sm text-brand-700',
        'shadow-[var(--shadow-hairline-brand)]',
      )}
    >
      <WindowMark className="text-brand-300" />
      <span className="-mr-[0.1em]">{children}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------
   Links
   ---------------------------------------------------------------------- */

const LINK_CLASS = cn(
  'text-brand-900 underline decoration-brand-300 underline-offset-4',
  'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
  'hover:decoration-brand-700',
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500',
);

/** In-page or in-site link. */
export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  );
}

/** `tel:` / `mailto:` — hands off to another application, so not a <Link>. */
export function ExternalValue({
  href,
  numeric = false,
  children,
}: {
  href: string;
  numeric?: boolean;
  children: ReactNode;
}) {
  return (
    <a href={href} data-numeric={numeric ? '' : undefined} className={LINK_CLASS}>
      {children}
    </a>
  );
}

/* -------------------------------------------------------------------------
   Table of contents
   ---------------------------------------------------------------------- */

/**
 * Plain anchor list — no scroll spy, no client component. `scroll-padding-top`
 * in globals.css already clears the floating header, so a jump lands on the
 * heading rather than under the nav.
 */
export function LegalToc({
  label,
  sections,
}: {
  label: string;
  sections: readonly LegalSectionMeta[];
}) {
  return (
    <nav aria-label={label} className="mt-12 md:mt-14">
      <Bezel
        radius="lg"
        inset="md"
        tone="tinted"
        elevation="sm"
        className="max-w-3xl"
        innerClassName="p-6 md:p-8"
      >
        <h2 className="flex items-center gap-2 text-eyebrow uppercase text-brand-700">
          <WindowMark className="text-brand-300" />
          <span className="-mr-[0.2em]">{label}</span>
        </h2>

        <ol className="mt-6 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {sections.map((section, position) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  'group flex gap-3 rounded-bezel-sm py-3 text-body-sm',
                  'text-neutral-700 transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                  'hover:text-brand-900',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                )}
              >
                <span
                  data-numeric=""
                  aria-hidden="true"
                  className="shrink-0 text-brand-700"
                >
                  {String(position + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 underline-offset-4 group-hover:underline">
                  {section.title}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </Bezel>
    </nav>
  );
}
