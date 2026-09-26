'use client';

import { CookieIcon } from '@phosphor-icons/react/dist/ssr/Cookie';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { Bezel, Button, WindowMark } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  CONSENT_CATEGORIES,
  CONSENT_SETTINGS_EVENT,
  FULL_SELECTION,
  MINIMAL_SELECTION,
  getConsentServerSnapshot,
  getConsentSnapshot,
  resetConsent,
  saveConsent,
  subscribeToConsent,
  type ConsentCategoryId,
  type ConsentSelection,
} from '@/lib/consent';
import { DURATION, EASE_IMPERIAL } from '@/lib/motion';

/**
 * Never fires — whether this is running in a browser cannot change for the
 * life of the tree. Same idiom as `layout/mobile-menu.tsx`.
 */
function subscribeNever(): () => void {
  return () => {};
}

function isFocusable(element: HTMLElement): boolean {
  return !element.hasAttribute('disabled') && element.tabIndex !== -1;
}

/* -------------------------------------------------------------------------
   Category row
   ------------------------------------------------------------------------- */

/**
 * A required category renders as a locked row, not as a ticked checkbox.
 *
 * A pre-ticked box that silently refuses to untick is the single most common
 * dark pattern in consent UIs, and it is the one supervisory authorities name
 * first. Saying "Immer aktiv" next to a padlock is the same information
 * without the false affordance.
 */
function CategoryRow({
  id,
  title,
  description,
  required,
  checked,
  onChange,
}: {
  id: ConsentCategoryId;
  title: string;
  description: string;
  required: boolean;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const inputId = `consent-${id}`;
  const descriptionId = `${inputId}-description`;

  const body = (
    <>
      <span className="flex items-start justify-between gap-4">
        <span className="text-body-sm font-medium text-ink">{title}</span>

        {required ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-brand-050 px-3 py-1 text-micro text-brand-700">
            <LockSimpleIcon size={12} weight="light" aria-hidden="true" />
            Immer aktiv
          </span>
        ) : (
          /* The track is drawn by the label; the control itself is a real
             checkbox kept sr-only, so native keyboard behaviour and the
             accessible role survive untouched. */
          <span
            aria-hidden="true"
            className={cn(
              'relative grid h-6 w-11 shrink-0 place-items-center rounded-pill',
              'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
              checked
                ? 'bg-brand-900'
                : 'bg-white shadow-[inset_0_0_0_1.5px_rgb(15_27_36/0.16)]',
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 size-5 rounded-full bg-white',
                'shadow-[var(--shadow-ambient-xs),var(--shadow-hairline)]',
                'transition-transform duration-[var(--duration-swift)] ease-imperial',
                checked && 'translate-x-5',
              )}
            />
          </span>
        )}
      </span>

      <span
        id={descriptionId}
        className="mt-2 block max-w-copy text-micro text-neutral-500"
      >
        {description}
      </span>
    </>
  );

  if (required) {
    return (
      <li>
        <div className="rounded-bezel-sm bg-brand-050/50 p-4 shadow-[var(--shadow-hairline-brand)] sm:p-5">
          {body}
        </div>
      </li>
    );
  }

  return (
    <li>
      <label
        htmlFor={inputId}
        className={cn(
          'group block cursor-pointer rounded-bezel-sm bg-white p-4 sm:p-5',
          'shadow-[var(--shadow-hairline)]',
          'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
          'hover:bg-brand-050/40',
          'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3',
          'has-[:focus-visible]:outline-brand-500',
        )}
      >
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
          aria-describedby={descriptionId}
          className="sr-only"
        />
        {body}
      </label>
    </li>
  );
}

/* -------------------------------------------------------------------------
   Manager
   ------------------------------------------------------------------------- */

/**
 * Cookie banner and consent settings.
 *
 * ## What it is honest about
 *
 * This site sets no cookies and embeds nothing third-party (see the module
 * comment in `lib/consent.ts`). The banner therefore does not claim that it
 * does. It states what is stored, names the one optional category, and says
 * outright that no such service is currently embedded — which is both true and
 * the reason a visitor is not being asked to decode a vendor list.
 *
 * ## Shape
 *
 * - **The banner is not modal.** It does not trap focus, does not scrim the
 *   page and does not steal focus on load. Nothing behind it is inert, because
 *   nothing behind it is loading anything that needs a decision first. Blocking
 *   the page to ask a question the page does not depend on is theatre.
 * - **The settings panel is modal**, because it is a task the user chose to
 *   start: focus trap, Escape to leave, focus returned to whatever opened it.
 * - **There is no X.** A dismiss that is neither accept nor reject leaves the
 *   question open while looking answered, and the usual implementation quietly
 *   treats it as acceptance. The two buttons are the only exits.
 * - **Accept and Reject are the same size, the same shape and the same weight,
 *   next to each other, in that order.** "Einstellungen" is deliberately
 *   quieter — it is not a third consent option, it is a detour.
 *
 * Portalled to `document.body` for the same reason the mobile menu is: an
 * ancestor with `backdrop-filter` becomes the containing block for fixed
 * descendants, and the header pill has one.
 */
export function ConsentManager() {
  const prefersReducedMotion = useReducedMotion();
  const headingId = useId();
  const panelHeadingId = useId();
  const panelDescriptionId = useId();

  const decision = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentSelection>(MINIMAL_SELECTION);

  const panelRef = useRef<HTMLDivElement>(null);
  /** Whatever opened the panel, so focus can go back to it. */
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openPanel = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    // Seed from the stored decision so reopening shows what is actually in
    // force, not a fresh set of defaults.
    setDraft(decision?.selection ?? MINIMAL_SELECTION);
    setPanelOpen(true);
  }, [decision]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  // The footer control lives in a server component and cannot call into this
  // tree directly, so it asks through a window event.
  useEffect(() => {
    function handleRequest() {
      openPanel();
    }

    window.addEventListener(CONSENT_SETTINGS_EVENT, handleRequest);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, handleRequest);
  }, [openPanel]);

  /* --- modal behaviour for the panel only -------------------------------- */

  useEffect(() => {
    if (!panelOpen) return;

    const body = document.body;
    const { overflow, paddingRight } = body.style;

    const gutter = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const stops = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])',
        ),
      ).filter(isFocusable);
      if (stops.length < 2) return;

      const active = document.activeElement as HTMLElement | null;
      const index = active ? stops.indexOf(active) : -1;
      const step = event.shiftKey ? -1 : 1;
      const next = index === -1 ? 0 : (index + step + stops.length) % stops.length;

      event.preventDefault();
      stops[next].focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [panelOpen, closePanel]);

  // Focus the panel heading when it opens. Safe to do here — unlike the banner,
  // this appears because the user asked for it.
  useEffect(() => {
    if (!panelOpen) return;
    const heading = panelRef.current?.querySelector<HTMLElement>('[data-panel-heading]');
    heading?.focus();
  }, [panelOpen]);

  /* --- actions ----------------------------------------------------------- */

  function acceptAll() {
    saveConsent(FULL_SELECTION);
    if (panelOpen) closePanel();
  }

  function rejectAll() {
    saveConsent(MINIMAL_SELECTION);
    if (panelOpen) closePanel();
  }

  function saveDraft() {
    saveConsent(draft);
    closePanel();
  }

  function handleReset() {
    resetConsent();
    closePanel();
  }

  /* --- rendering --------------------------------------------------------- */

  if (!mounted) return null;

  const bannerVisible = decision === null && !panelOpen;

  const bannerTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: DURATION.base, ease: EASE_IMPERIAL };

  const banner = (
    <AnimatePresence>
      {bannerVisible ? (
        <motion.div
          key="consent-banner"
          role="region"
          aria-labelledby={headingId}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={bannerTransition}
          className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <Bezel
            radius="lg"
            inset="md"
            tone="paper"
            elevation="xl"
            className="mx-auto w-full max-w-shell"
            innerClassName="p-6 sm:p-7 md:p-8"
          >
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="min-w-0">
                <h2
                  id={headingId}
                  className="flex items-center gap-2 text-eyebrow uppercase text-brand-700"
                >
                  <WindowMark className="text-brand-300" />
                  <span className="-mr-[0.2em]">Cookies und externe Inhalte</span>
                </h2>

                <p className="mt-4 max-w-copy text-body-sm text-neutral-700">
                  Diese Website speichert nur, was technisch notwendig ist — und
                  merkt sich Ihre Entscheidung hier. Externe Inhalte wie eine
                  Karte oder ein Messenger würden Daten an Dritte übertragen;
                  die laden wir nur, wenn Sie zustimmen.
                </p>

                <p className="mt-3 max-w-copy text-micro text-neutral-500">
                  Es sind keine Analyse- oder Werbedienste eingebunden. Näheres
                  in der{' '}
                  <Link
                    href="/datenschutz"
                    className="font-medium text-brand-900 underline decoration-navy/40 underline-offset-4 transition-colors duration-[var(--duration-swift)] ease-imperial-soft hover:decoration-brand-900"
                  >
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>

              {/*
                Accept and Reject: same size, same padding, same font weight,
                side by side. Neither is greyed out, neither is disguised as a
                link. "Einstellungen" sits below them and is visibly the
                quieter control, because it is not a consent choice.
              */}
              <div className="flex shrink-0 flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="md"
                    variant="primary"
                    icon={null}
                    magnetic={false}
                    onClick={acceptAll}
                    className="w-full sm:w-auto sm:min-w-[11rem]"
                  >
                    Alle akzeptieren
                  </Button>

                  <Button
                    size="md"
                    variant="secondary"
                    icon={null}
                    magnetic={false}
                    onClick={rejectAll}
                    className="w-full sm:w-auto sm:min-w-[11rem]"
                  >
                    Nur notwendige
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={openPanel}
                  className={cn(
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4',
                    'text-body-sm text-brand-900 underline-offset-4',
                    'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                    'hover:bg-brand-050 hover:underline',
                    'focus-visible:outline-2 focus-visible:outline-offset-2',
                    'focus-visible:outline-brand-500',
                  )}
                >
                  <CookieIcon size={16} weight="light" aria-hidden="true" />
                  Einstellungen
                </button>
              </div>
            </div>
          </Bezel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const panel = (
    <AnimatePresence>
      {panelOpen ? (
        <motion.div
          key="consent-panel"
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center sm:p-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.swift, ease: EASE_IMPERIAL }}
        >
          {/* Closing the scrim is equivalent to Escape: it abandons the panel
              without recording anything, and the banner comes back if the
              question is still open. */}
          <button
            type="button"
            aria-label="Einstellungen schließen"
            onClick={closePanel}
            className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-[2px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={panelHeadingId}
            aria-describedby={panelDescriptionId}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: DURATION.base, ease: EASE_IMPERIAL }}
            className="relative w-full max-w-2xl"
          >
            <Bezel
              radius="xl"
              inset="lg"
              tone="paper"
              elevation="xl"
              innerClassName="max-h-[85dvh] overflow-y-auto overscroll-contain p-6 sm:p-8 md:p-10"
            >
              <h2
                id={panelHeadingId}
                data-panel-heading=""
                tabIndex={-1}
                className="text-title-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
              >
                Welche Daten dürfen wir speichern?
              </h2>

              <p
                id={panelDescriptionId}
                className="mt-4 max-w-copy text-body-sm text-neutral-700"
              >
                Sie können Ihre Auswahl jederzeit ändern — der Link dazu steht
                dauerhaft im Fußbereich jeder Seite. Ohne Ihre Zustimmung wird
                nichts an Dritte übertragen.
              </p>

              <ul className="mt-8 flex flex-col gap-3">
                {CONSENT_CATEGORIES.map((category) => (
                  <CategoryRow
                    key={category.id}
                    id={category.id}
                    title={category.title}
                    description={category.description}
                    required={category.required}
                    checked={category.required || draft[category.id]}
                    onChange={(next) =>
                      setDraft((previous) => ({ ...previous, [category.id]: next }))
                    }
                  />
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  size="md"
                  variant="primary"
                  icon={null}
                  magnetic={false}
                  onClick={acceptAll}
                  className="w-full sm:w-auto sm:min-w-[11rem]"
                >
                  Alle akzeptieren
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  icon={null}
                  magnetic={false}
                  onClick={rejectAll}
                  className="w-full sm:w-auto sm:min-w-[11rem]"
                >
                  Nur notwendige
                </Button>

                <Button
                  size="md"
                  variant="ghost"
                  icon={null}
                  magnetic={false}
                  onClick={saveDraft}
                  className="w-full sm:w-auto"
                >
                  Auswahl speichern
                </Button>
              </div>

              {decision ? (
                <div
                  className="mt-8 pt-6"
                  style={{ boxShadow: 'inset 0 1px 0 0 rgb(20 18 58 / 0.12)' }}
                >
                  <p className="text-micro text-neutral-500">
                    Ihre Entscheidung ist in diesem Browser gespeichert.{' '}
                    <button
                      type="button"
                      onClick={handleReset}
                      className={cn(
                        'rounded-[0.25rem] font-medium text-brand-900 underline',
                        'decoration-navy/40 underline-offset-4',
                        'transition-colors duration-[var(--duration-swift)] ease-imperial-soft',
                        'hover:decoration-brand-900',
                        'focus-visible:outline-2 focus-visible:outline-offset-2',
                        'focus-visible:outline-brand-500',
                      )}
                    >
                      Zurücksetzen und erneut fragen
                    </button>
                  </p>
                </div>
              ) : null}
            </Bezel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(
    <>
      {banner}
      {panel}
    </>,
    document.body,
  );
}
