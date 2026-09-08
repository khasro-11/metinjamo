# CLAUDE.md — Imperial Gebäudeservice GmbH

Verbindliche Arbeitsanweisung für Claude Code in diesem Repository.
**Vor jeder Aufgabe lesen.** Bei Konflikt zwischen dieser Datei und einer Chat-Anweisung gewinnt der Chat — aber sag mir explizit, wenn du abweichst.

---

## 1. Projekt

**Kunde:** Imperial Gebäudeservice GmbH, Duisburg
**Deliverable:** Marketing-Website mit Fokus Landing Page. Kein Dashboard, kein Kundenportal.
**Primäres Ziel:** Angebotsanfragen (Leads) über ein mehrstufiges Formular.
**Sekundär:** Anruf (Click-to-Call), E-Mail, WhatsApp.

**Zielgruppen, in dieser Reihenfolge:**

1. **B2B** — Hausverwaltungen, WEG-Verwalter, Facility-Manager, Gewerbeobjekte. Kaufen Zuverlässigkeit, Dokumentation, Haftungssicherheit.
2. **B2C** — Eigentümer, Vermieter, Privatkunden. Kaufen Vertrauen und schnelle Erreichbarkeit.

---

## 2. Firmendaten (Single Source of Truth)

Diese Werte gehören in `src/config/company.ts` und werden **überall** von dort importiert. Niemals hardcoden, niemals abweichend wiederholen.

```
Firma            Imperial Gebäudeservice GmbH
Anschrift        Am Burgacker 20, 47051 Duisburg
Telefon          0151 200 669 40   →  tel:+4915120066940
E-Mail           info@imperial-gmbh.com
Geschäftsführer  Metin Jamu (einzelvertretungsberechtigt)
Handelsregister  Amtsgericht Duisburg, HRB 39367
Sitz             Duisburg
Stammkapital     25.000 €
USt-IdNr.        TODO — liegt noch nicht vor
Haftpflicht      Betriebshaftpflicht, 10 Mio. € Deckungssumme
                 TODO — Versicherer und Geltungsbereich fehlen
Redaktionell     Metin Jamu, Anschrift wie oben
```

**Öffnungszeiten**

- Mo–Fr 07:00–18:00 Uhr
- Sa nach Absprache
- Akutfälle (Wasserschaden, Winterdienst) außerhalb der Zeiten telefonisch

**Einsatzgebiet:** Duisburg und Umgebung. Bei größeren Aufträgen auch darüber hinaus.

### Formulierungsregeln zu diesen Daten

- **Kein „24/7-Notfallservice".** Korrekt ist: _„Akutfälle wie Wasserschaden und Winterdienst auch außerhalb der Geschäftszeiten — telefonisch."_
- **Kein „deutschlandweit".** Korrekt: _„Duisburg und Umgebung, bei größeren Aufträgen auch weiter."_
- USt-IdNr. und Versicherer stehen im Impressum als _„Angabe folgt"_ — nicht erfinden, nicht weglassen.

---

## 3. Rechtliches (nicht verhandelbar)

- **Impressum-Überschrift: „Angaben gemäß § 5 DDG".** Das TMG wurde am 14.05.2024 durch das Digitale-Dienste-Gesetz abgelöst. Der vom Kunden gelieferte Text sagt noch „§ 5 TMG" — das ist veraltet und wird korrigiert.
- **EU-Streitschlichtung:** Hinweistext übernehmen. Der Link zur OS-Plattform ist seit deren Einstellung (Juli 2025) nicht mehr zu setzen — nur der Satz, dass wir nicht zur Teilnahme verpflichtet und nicht bereit sind.
- **Impressum + Datenschutzerklärung** aus dem Footer jeder Seite mit einem Klick erreichbar.
- **Fonts self-hosted.** Kein `<link>` zu Google Fonts (DSGVO).
- **Google Maps** nur nach Consent oder gar nicht — Standardlösung: statisches Kartenbild + OpenStreetMap-Link.
- **Consent-Banner** nur, wenn tatsächlich einwilligungspflichtige Dienste laufen. Ziel: so wenig Third-Party wie möglich, damit gar kein Banner nötig ist.
- **Formular:** Pflicht-Checkbox mit Link zur Datenschutzerklärung, Datensparsamkeit, kein Tracking-Pixel.
- **Analytics:** wenn überhaupt, cookieless (Plausible / self-hosted Umami). Vorher fragen.

---

## 4. Marke & Design-Tokens

Logo: Wortmarke „IMPERIAL" in Blau, „GEBÄUDE SERVICE GmbH" in Grau, dazu ein Fenster-Icon mit Abzieher und Sprühflasche in zwei Blautönen.

```css
--imp-blue-900: #14547e; /* tiefes Markenblau, Wortmarke */
--imp-blue-700: #1c6b9c;
--imp-blue-500: #2e86c1; /* primär */
--imp-blue-300: #45b3e7; /* helles Akzentblau aus dem Icon */
--imp-blue-050: #eaf4fa; /* Flächen, Hover */
--imp-grey-700: #4a4d50; /* Subline im Logo, Fließtext */
--imp-grey-400: #8a8f94;
--imp-paper: #fbfcfd; /* Seitenhintergrund, nicht reines Weiß */
--imp-ink: #0f1b24; /* Headlines */
```

- **Kein Dark Mode** in v1. Die Marke ist hell.
- Akzentblau `--imp-blue-300` sparsam: CTA-Hover, aktive States, Icon-Details. Nicht flächig.
- Das Logo-Icon (Fenster-Raster) darf als **dezentes Struktur-Motiv** aufgegriffen werden — z.B. als Grid-Rhythmus im Bento oder als Hairline-Kreuz in Karten. Nicht als Deko-Wasserzeichen überall.
- Logo als SVG in `public/logo.svg` + `public/logo-mark.svg` (nur Icon, für Favicon/Mobile-Nav). **TODO:** SVG-Version vom Kunden anfordern, das JPEG ist keine Produktionsdatei.

---

## 5. Design — verbindlicher Workflow

Diese Seite darf nicht wie eine Baukasten-Handwerkerseite aussehen. Anspruch: Agentur-Niveau, aber seriös.

### 5.1 Skills, die IMMER geladen werden

Bei **jeder** UI-Aufgabe — neue Seite, neue Section, neue Komponente, Styling-Änderung, Redesign — lädst du **zuerst** diese Skills, bevor eine Zeile Code entsteht:

```
/design-taste-frontend
/high-end-visual-design
```

Zusätzlich, wenn es um grundsätzliche visuelle Richtung geht:

```
frontend-design   (Anthropic-Skill)
```

**Nicht optional.** UI-Arbeit ohne diese Skills ist ungültig — abbrechen, Skills laden, neu anfangen.

### 5.2 Rollenverteilung

| Skill                    | Rolle                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `design-taste-frontend`  | **Strategie.** Design Read, Dials, System-Wahl, Architektur, Anti-Slop-Kontrolle, Pre-Flight-Check. |
| `high-end-visual-design` | **Ausführung.** Typo, Spacing, Double-Bezel, Motion-Choreografie, Micro-Interactions.               |
| `frontend-design`        | **Richtung.** Wenn die ästhetische Grundentscheidung noch offen ist.                                |

Bei Widerspruch: `design-taste-frontend` entscheidet **was**, `high-end-visual-design` entscheidet **wie es aussieht**. Bei Barrierefreiheit und Performance gewinnt immer die konservativere Regel.

### 5.3 Fester Design Read

Gib diesen Read vor jeder größeren UI-Ausgabe aus:

> _Reading this as: B2B/B2C Gebäudedienstleister-Landing für Hausverwaltungen und Eigentümer in Duisburg, mit einer trust-first-premium Sprache, leaning toward Tailwind v4 + Premium-Grotesk + zurückhaltende, schwere Motion._

### 5.4 Dials (bewusste Abweichung vom 8/6/4-Baseline)

```
DESIGN_VARIANCE: 7    # eigenständig, nicht experimentell
MOTION_INTENSITY: 5   # schwer und ruhig, keine Dauerschleifen
VISUAL_DENSITY: 4     # großzügig, aber scanbar
```

**Begründung, die zu respektieren ist:** Ein Gebäudedienstleister verkauft Verlässlichkeit. Awwwards-Chaos zerstört hier Vertrauen. Ziel ist „teuer und solide", nicht „Creative Studio".

### 5.5 Archetypen

- **Vibe:** primär **Soft Structuralism** — helle Flächen, massive Grotesk-Typo, extrem weiche diffuse Ambient-Shadows. Für „Über uns" / Referenzen optional **Editorial Luxury** mit warmem Neutralton und feinem Film-Grain.
- **Layout:** **Asymmetrical Bento** für Leistungen und Kennzahlen, **Editorial Split** für Hero und Über-uns.
- **Kein** Ethereal Glass / OLED-Dark-Tech. Passt nicht zur Branche.

### 5.6 Referenz-Umgang: service-uysal.de

Diese Seite ist **Struktur-Referenz, kein Design-Vorbild und keine Textquelle.**

**Übernehmen (Konzept):**

- Hero mit Leistungs-Chips, die zu Ankern springen
- Kennzahlen-Leiste direkt unter dem Hero
- Vorteile-Grid „Warum Kunden sich für uns entscheiden"
- Mehrstufiges Angebotsformular (Leistung → Frequenz → Kontakt → Absenden)
- Block „Weitere Kontaktmöglichkeiten"
- FAQ-Accordion
- Abschluss-CTA vor dem Footer

**Nicht übernehmen:**

- Keine Texte, Sätze oder Formulierungen kopieren — alles neu schreiben
- Keine Icons, Bilder oder Layout-1:1-Nachbauten
- Nicht deren Farbwelt — wir haben eigene Markenfarben
- Nicht das Rabatt-/Paketmodell, solange der Kunde das nicht bestätigt hat
- Kein Emoji im Telefon-Link in der Nav

### 5.7 Harte Verbote

- ❌ Inter, Roboto, Arial, Open Sans, Helvetica
- ❌ Lucide-Icons → **Phosphor Light**, eine Familie im ganzen Projekt
- ❌ Generische 1px-graue Borders, harte `shadow-md`
- ❌ AI-Purple-Gradients, zentrierter Hero über dunklem Mesh
- ❌ Drei gleich große Feature-Karten nebeneinander
- ❌ Stockfotos mit Headset-Lächeln oder generischen Putzeimern. Lieber abstrakte Flächen als schlechte Stockfotos.
- ❌ Emojis in Markup und sichtbarem Text
- ❌ Handgezeichnete SVG-Icons
- ❌ `linear` / `ease-in-out` → nur custom cubic-bezier, z.B. `cubic-bezier(0.32,0.72,0,1)`

### 5.8 Pflicht-Techniken

- **Double-Bezel** für alle Karten, Formularfelder, Bildcontainer: äußere Hülle + innerer Kern, konzentrisch berechnete Radien
- **Squircle-Radien** (`rounded-[2rem]` und abgeleitet)
- **Makro-Whitespace:** Sections `py-24` bis `py-40`
- **Eyebrow-Tags** vor jeder H2 (`text-[10px] uppercase tracking-[0.2em]`)
- **Scroll-Reveal** nur via `IntersectionObserver` oder Motion `whileInView` — nie `window.addEventListener('scroll')`
- **Nested CTA:** Pfeil-Icon immer im eigenen runden Wrapper im Button

---

## 6. Tech-Stack

```
Framework    Next.js (App Router, RSC als Default)
Styling      Tailwind v4  →  @tailwindcss/postcss, NICHT tailwindcss als PostCSS-Plugin
Motion       motion/react  (nicht framer-motion importieren)
Icons        @phosphor-icons/react, weight="light", global einheitlich
Fonts        next/font, self-hosted. Geist — vom Kunden bestätigt am 08.09.2026
Sprache      TypeScript, strict
Forms        react-hook-form + zod
Mail         TODO — Resend / SMTP / Formspree, mit Kunden klären
Hosting      TODO — Vercel / Hetzner / IONOS, mit Kunden klären
```

**RSC-Regeln**

- Alles mit Motion, Scroll-Listener oder Pointer-Physik ist ein isoliertes Leaf mit `'use client'` ganz oben
- Server Components rendern nur statische Layouts
- **Nie** `useState` für kontinuierliche Werte (Mausposition, Scroll-Progress) → `useMotionValue` / `useTransform` / `useScroll`

---

## 7. Seitenstruktur

```
/                       Landing Page (Hauptfokus)
/leistungen             Übersicht
/leistungen/[slug]      Detailseite je Leistung, eigene SEO-Landingpage
/ueber-uns              Unternehmen, Geschäftsführung, Werte
/referenzen             Objekte & Kundenstimmen   (erst wenn echte Inhalte da sind)
/kontakt                Formular, Kontaktdaten, Anfahrt
/impressum              Pflichtseite
/datenschutz            Pflichtseite
```

**Landing-Page-Sections in dieser Reihenfolge:**

1. Hero — Editorial Split, Leistungsversprechen + „Duisburg und Umgebung" + primärer CTA + Leistungs-Chips
2. Vertrauensleiste — 10 Mio. € Betriebshaftpflicht, GmbH mit HR-Eintrag, feste Erreichbarkeit _(nur belegbare Punkte)_
3. Leistungen — Asymmetrical Bento
4. Ablauf — 4 Schritte von Anfrage bis Ausführung
5. Warum Imperial — Vorteile-Grid
6. Angebotsanfrage — mehrstufiges Formular
7. Weitere Kontaktmöglichkeiten
8. Referenzen / Kundenstimmen _(nur echte)_
9. FAQ
10. Abschluss-CTA
11. Footer — Kontakt, Zeiten, Einsatzgebiet, Rechtliches

---

## 8. Content-Regeln

- **Keine erfundenen Angaben.** Keine Fantasie-Projektzahlen, keine „98 % Kundenzufriedenheit", keine Fake-Bewertungen, keine Zertifikate, die nicht vorliegen. In Deutschland ist das auch wettbewerbsrechtlich relevant (§ 5 UWG).
- Fehlende Inhalte als `{/* TODO: ... */}` markieren und mir am Ende der Aufgabe auflisten.
- **Sprache:** Deutsch, Sie-Form, sachlich-souverän. Keine Superlative ohne Beleg, kein Denglisch in der UI („Leistungen", nicht „Services"; „Angebot anfordern", nicht „Request a Quote").
- **Code, Variablen, Kommentare, Commits:** Englisch.

---

## 9. Qualitäts-Baseline

**Performance**

- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100
- Nur `transform` und `opacity` animieren — nie `top`, `left`, `width`, `height`
- `backdrop-blur` nur auf fixed/sticky Elementen, nie auf scrollenden Containern
- Noise-Overlay nur als `position: fixed; pointer-events: none` Pseudo-Element
- Bilder über `next/image`, moderne Formate, korrekte `sizes`

**Mobile**

- Mobile-First. Unter `768px` fallen asymmetrische Layouts auf `w-full`, Rotationen und negative Overlaps raus
- **Nie** `h-screen` → `min-h-[100dvh]`
- Touch-Targets ≥ 44×44px
- Telefonnummer immer als `tel:`-Link

**Barrierefreiheit**

- Kontrast mindestens WCAG AA, Fließtext Richtung AAA
- Focus-States sichtbar — dürfen premium gestaltet sein, nie entfernt
- `prefers-reduced-motion` respektieren: alle Reveals und Springs abschalten
- Semantisches HTML, saubere Heading-Hierarchie, echte `<label>`

**SEO / Local SEO**

- JSON-LD: `LocalBusiness` (bzw. `ProfessionalService`), `Service`, `FAQPage`, `BreadcrumbList`
- NAP-Daten identisch zum Google Business Profile
- Next.js `Metadata` API, pro Route eigener `title` + `description`
- `sitemap.xml`, `robots.txt`
- Deutsche Slugs ohne Umlaute (`ueber-uns`)
- Jede Leistung eigener echter Text — kein Duplicate Content, keine Städte-Doorway-Pages
- Alle Bilder mit sinnvollem deutschem `alt`

---

## 10. Arbeitsweise für Claude Code

1. **Design Read ausgeben** (5.3), bevor UI-Code entsteht
2. **Beide Design-Skills laden**, immer
3. **Section für Section**, nicht die ganze Seite auf einmal. Nach jeder Section kurz zeigen, was gebaut wurde
4. **Erst fragen, dann erfinden** — fehlende Daten sind `TODO`, keine Erfindung
5. **Maximal eine Klärungsfrage** auf einmal, nur wenn die Entscheidung wirklich offen ist
6. **Vor der Ausgabe:** Pre-Output-Checkliste aus `high-end-visual-design` §8 und Pre-Flight aus `design-taste-frontend` durchgehen, Ergebnis explizit bestätigen
7. **Keine neuen Dependencies** ohne kurze Begründung
8. Bestehende Struktur und Konventionen respektieren — kein ungefragtes Umbauen

---

## 11. Definition of Done (pro Section)

- [ ] Design Read passt, Dials eingehalten
- [ ] Keine verbotenen Fonts, Icons, Borders, Shadows, Layouts, Motion-Patterns
- [ ] Vibe- und Layout-Archetyp bewusst gewählt
- [ ] Double-Bezel bei allen Karten/Containern
- [ ] Custom cubic-bezier statt Default-Transitions
- [ ] Mobile < 768px sauber, keine Overlaps, `min-h-[100dvh]`
- [ ] `prefers-reduced-motion` berücksichtigt
- [ ] Semantisches HTML, Focus-States, AA-Kontrast
- [ ] Deutsche Texte in Sie-Form, keine erfundenen Angaben
- [ ] Firmendaten ausschließlich aus `company.ts`
- [ ] Nur `transform`/`opacity` animiert
- [ ] Rechtliche Links im Footer vorhanden

---

## 12. Offene Punkte (vom Kunden zu liefern)

- [ ] **Leistungskatalog** — welche Leistungen genau? (Unterhaltsreinigung, Treppenhaus, Glas, Grünpflege, Winterdienst, Hausmeister, Entrümpelung, Baureinigung …)
- [ ] Logo als **SVG** (aktuell nur JPEG)
- [ ] Gründungsjahr, Mitarbeiterzahl
- [ ] Echte Referenzobjekte + Freigabe zur Nennung
- [ ] Echte Kundenstimmen / Google-Bewertungen
- [ ] Eigene Fotos von Team und Objekten
- [ ] USt-IdNr.
- [ ] Versicherer + Geltungsbereich der Betriebshaftpflicht
- [ ] Domain, Hosting, Postfach für Formular-Zustellung
- [ ] WhatsApp-Business-Nummer — ja oder nein?
- [ ] Preis-/Paketmodell — ja oder nein?

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
