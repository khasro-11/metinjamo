/**
 * Consent state, as a tiny observable store.
 *
 * Free of React so it can be read from anywhere — a future embed wrapper, an
 * event handler, a route handler — and so the banner component stays
 * presentation.
 *
 * ## What this site actually stores, and why the banner is honest about it
 *
 * Today Imperial sets **no cookies at all**: no analytics, no pixels, no
 * third-party embeds, self-hosted fonts (see `app/layout.tsx`). The only thing
 * ever written to the browser is the decision below, in `localStorage`, under
 * `CONSENT_STORAGE_KEY`. That write is itself "strictly necessary" under § 25
 * Abs. 2 TDDDG — remembering that someone declined is the one thing you are
 * allowed to remember without asking — so it is in the `notwendig` category
 * and cannot be switched off.
 *
 * The `extern` category therefore governs a set that is currently **empty**.
 * That is deliberate and it is stated in the category description rather than
 * papered over: the banner must not imply tracking that does not happen, and a
 * consent UI that claims to gate services the site does not embed would be its
 * own false statement. What it does instead is bind the decision *in advance*
 * of the two services the project has already scoped but not built — a map for
 * the Anfahrt and a WhatsApp contact (see the commented block in
 * `sections/contact-channels.tsx`). The day either lands, it calls
 * `hasConsent('extern')` and is gated correctly from the first request.
 *
 * ## The rule for anything added later
 *
 * A script, iframe, pixel or font that reaches a third-party server must be
 * behind `hasConsent('extern')` — checked at load time, not merely hidden with
 * CSS. An `<iframe src>` that is in the DOM has already made the request, and
 * the consent was worth nothing.
 */

/**
 * Bumping this invalidates every stored decision and re-asks.
 *
 * Do it when the *substance* of what is being consented to changes — a new
 * category, or a real service entering `extern`. Not for copy edits: re-asking
 * people who already answered the same question is the thing that trains them
 * to click whatever makes the box disappear.
 */
export const CONSENT_VERSION = 1;

export const CONSENT_STORAGE_KEY = 'imperial.consent.v1';

/** Fired on `window` when something asks for the settings panel. */
export const CONSENT_SETTINGS_EVENT = 'imperial:consent-settings';

export type ConsentCategoryId = 'notwendig' | 'extern';

export interface ConsentCategory {
  readonly id: ConsentCategoryId;
  readonly title: string;
  /** One short paragraph. Describes what is stored, not why it is fine. */
  readonly description: string;
  /**
   * Granted unconditionally and rendered as a locked row rather than as a
   * pre-ticked box a user might think they can change.
   */
  readonly required: boolean;
}

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  {
    id: 'notwendig',
    title: 'Notwendig',
    description:
      'Speichert ausschließlich Ihre Entscheidung auf dieser Seite, damit wir Sie nicht bei jedem Besuch erneut fragen. Die Angabe bleibt in Ihrem Browser und wird nicht an uns übertragen. Ohne sie lässt sich Ihr Widerspruch nicht merken, deshalb ist diese Kategorie nicht abwählbar.',
    required: true,
  },
  {
    id: 'extern',
    title: 'Externe Inhalte',
    description:
      'Inhalte, die von fremden Servern geladen werden — etwa eine Karte zur Anfahrt oder ein Messenger-Kontakt. Dabei wird Ihre IP-Adresse an den jeweiligen Anbieter übertragen. Auf dieser Website ist derzeit kein solcher Dienst eingebunden; Ihre Auswahl greift, sobald einer hinzukommt.',
    required: false,
  },
] as const;

export type ConsentSelection = Readonly<Record<ConsentCategoryId, boolean>>;

export interface ConsentDecision {
  readonly version: number;
  /** ISO 8601. Used to re-ask after a version bump, not as legal proof. */
  readonly decidedAt: string;
  readonly selection: ConsentSelection;
}

/** Everything off except what cannot be switched off. */
export const MINIMAL_SELECTION: ConsentSelection = {
  notwendig: true,
  extern: false,
};

export const FULL_SELECTION: ConsentSelection = {
  notwendig: true,
  extern: true,
};

/* -------------------------------------------------------------------------
   Storage
   ------------------------------------------------------------------------- */

function isConsentDecision(value: unknown): value is ConsentDecision {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ConsentDecision>;
  if (candidate.version !== CONSENT_VERSION) return false;
  if (typeof candidate.decidedAt !== 'string') return false;
  const selection = candidate.selection as Partial<ConsentSelection> | undefined;
  if (typeof selection !== 'object' || selection === null) return false;
  return CONSENT_CATEGORIES.every(
    (category) => typeof selection[category.id] === 'boolean',
  );
}

/**
 * Every access is guarded.
 *
 * `localStorage` is not merely absent during SSR — it also *throws* on access
 * in a Safari private window and wherever site data is blocked, which is
 * exactly the population most likely to care about a consent banner. A throw
 * here would take the whole page down, so the failure mode is "undecided",
 * which re-asks and grants nothing.
 */
function readStoredDecision(): ConsentDecision | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isConsentDecision(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredDecision(decision: ConsentDecision | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (decision === null) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
    }
  } catch {
    // Storage blocked. The decision still holds for this page view through the
    // in-memory cache below; it simply will not survive a reload.
  }
}

/* -------------------------------------------------------------------------
   Store

   `useSyncExternalStore` calls `getSnapshot` on every render and compares the
   result by reference, so this has to hand back the *same object* until
   something actually changes. Hence the cache: parsing JSON on each call would
   return a new object every time and spin React into an infinite loop.
   ------------------------------------------------------------------------- */

let cache: ConsentDecision | null = null;
let cacheLoaded = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeToConsent(listener: () => void): () => void {
  listeners.add(listener);

  // Another tab answering the banner should settle this one too, rather than
  // leaving two windows of the same site disagreeing.
  function handleStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== CONSENT_STORAGE_KEY) return;
    cacheLoaded = false;
    emit();
  }

  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getConsentSnapshot(): ConsentDecision | null {
  if (!cacheLoaded) {
    cache = readStoredDecision();
    cacheLoaded = true;
  }
  return cache;
}

/**
 * The server has no storage and must not guess, so it always reports
 * "undecided". The manager additionally gates on a mount flag, so nothing is
 * server-rendered and a returning visitor never sees the banner at all.
 */
export function getConsentServerSnapshot(): ConsentDecision | null {
  return null;
}

export function saveConsent(selection: ConsentSelection): void {
  const decision: ConsentDecision = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    // `notwendig` is forced rather than trusted from the caller: it is not a
    // choice, and a selection that claims otherwise is malformed.
    selection: { ...selection, notwendig: true },
  };

  cache = decision;
  cacheLoaded = true;
  writeStoredDecision(decision);
  emit();
}

/** Back to undecided. Used by the "Entscheidung zurücksetzen" control. */
export function resetConsent(): void {
  cache = null;
  cacheLoaded = true;
  writeStoredDecision(null);
  emit();
}

/**
 * The gate for anything that talks to a third party.
 *
 * Returns `false` while undecided and while rendering on the server, so the
 * default is always "do not load".
 */
export function hasConsent(category: ConsentCategoryId): boolean {
  const decision = getConsentSnapshot();
  if (decision === null) return false;
  return decision.selection[category] === true;
}

/** Opens the settings panel from anywhere — the footer link uses this. */
export function openConsentSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_SETTINGS_EVENT));
}
