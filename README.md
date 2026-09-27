# Imperial Gebäudeservice GmbH — Website

Marketing-Website mit Fokus auf die Landing Page. Primäres Ziel ist die
Angebotsanfrage über das mehrstufige Formular, sekundär Anruf und E-Mail.

Diese Datei ist bewusst auf Deutsch — der Abschnitt
[Vor dem Livegang](#vor-dem-livegang) geht so, wie er ist, an den Kunden. Code,
Kommentare und Commits bleiben englisch (CLAUDE.md 8).

Die verbindliche Arbeitsanweisung für Design, Recht und Inhalte steht in
[`Claude.md`](./Claude.md). Bei Widersprüchen zwischen dieser README und
`Claude.md` gilt `Claude.md`.

---

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC als Default, Turbopack) |
| Sprache | TypeScript, strict |
| Styling | Tailwind v4 über `@tailwindcss/postcss` |
| Motion | `motion/react` |
| Icons | `@phosphor-icons/react`, durchgehend `weight="light"` |
| Fonts | Geist, self-hosted über `next/font` — kein Request an Google |
| Formular | react-hook-form + zod |

Voraussetzung: **Node.js ≥ 20.9** (LTS empfohlen).

---

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build |
| `npm run start` | Produktions-Build lokal ausliefern (vorher `build`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Vor jedem Commit sollten `lint`, `typecheck` und `build` grün sein. Es gibt noch
keine automatisierte Test-Suite — der Build ist aktuell das einzige Netz.

Environment-Variablen: Der Mailversand des Formulars braucht fünf davon. Die
Vorlage steht in [`.env.example`](./.env.example), die Einrichtung in
[`docs/emailjs.md`](./docs/emailjs.md). Ohne sie läuft die Seite normal, nur das
Formular antwortet mit einer Fehlermeldung statt mit einer Erfolgsmeldung —
siehe [Formular](#formular--api).

### Interne Referenzseite

`/styleguide` zeigt Tokens, Typo-Skala, Bezel-Varianten und Motion-Tiers. Die
Seite ist über `robots.ts` und eigene Metadaten von der Indexierung
ausgenommen, aber **öffentlich erreichbar** — vor dem Livegang entscheiden, ob
sie bleibt (siehe Checkliste unten).

---

## Aufbau

```
src/
  app/
    page.tsx           Landing Page — setzt nur die Sections zusammen
    layout.tsx         Fonts, Metadaten-Defaults, Header/Footer, Skip-Link
    not-found.tsx      404
    globals.css        Design-Tokens (Farbe, Typo, Spacing, Radien, Motion)
    impressum/         Pflichtseite
    datenschutz/       Pflichtseite
    api/anfrage/       POST-Endpunkt des Formulars
    sitemap.ts         sitemap.xml — listet nur, was existiert
    robots.ts          robots.txt
    styleguide/        interne Design-Referenz
  components/
    sections/          die Blöcke der Landing Page, in der Reihenfolge aus Claude.md 7
    layout/            Header, mobiles Menü, Footer, Logo
    ui/                Bezel, Button, Eyebrow, Felder, Reveal, Entrance
    legal/             Layout-Bausteine der Rechtsseiten
    seo/               JSON-LD
  config/              company.ts, navigation.ts
  content/             services.ts, faq.ts
  lib/                 cn.ts, motion.ts, quote-request.ts
                       emailjs.ts, quote-mail.ts, anti-spam.ts  (Mailversand)
docs/
  emailjs.md           Einrichtung des Mailversands — Dashboard-Schritte
```

### Zwei Regeln, die beim Weiterbauen wichtig sind

**1. Firmendaten kommen ausschließlich aus `src/config/company.ts`.**
Telefonnummer, Anschrift, Handelsregister, Öffnungszeiten, Einsatzgebiet — nie
im Markup wiederholen. Metadaten, Sitemap, JSON-LD, Header, Footer und
Impressum lesen alle aus derselben Datei, damit die NAP-Daten für das Google
Business Profile nicht auseinanderlaufen können.

**2. Reveal oder Entrance — die Wahl entscheidet der Seitenfalz, nicht der Effekt.**

| | |
| --- | --- |
| `<Reveal>` | unterhalb des Falzes, wird erscrollt. Client-Komponente, IntersectionObserver. |
| `<Entrance>` | oberhalb des Falzes, beim Laden sichtbar. Server-Komponente, reines CSS. |

`<Reveal>` schreibt `opacity: 0` in das SSR-Markup und hebt das erst auf, wenn
React hydriert **und** der Observer gefeuert hat. Above the fold heißt das: eine
leere Seite für die Dauer der Hydration. `<Entrance>` animiert ab dem ersten
Paint, ohne JavaScript. Für Hero und 404 ist deshalb `<Entrance>` Pflicht.

### Motion-Skala

Die Skala steht doppelt, weil CSS und Motion verschiedene Einheiten lesen: als
`--duration-*` / `--ease-*` in `src/app/globals.css` und als JS-Werte in
`src/lib/motion.ts`. Wer eine ändert, ändert beide.

| Tier | Dauer | Wofür |
| --- | --- | --- |
| `swift` | 200 ms | **Jeder** Hover und Focus — Farbe, Schatten und der Karten-Lift. Ausnahmslos, damit Teile eines Elements unter demselben Pointer-Event nicht auseinanderlaufen. |
| `base` | 420 ms | Ein Zustand, den der Nutzer geändert hat: Accordion, Formularschritt, Panel. |
| `slow` | 760 ms | Inszenierte Auftritte: Scroll-Reveals, mobiles Overlay. |

Easing ist immer `--ease-imperial` oder `--ease-imperial-soft`. Kein `linear`,
kein `ease-in-out`. Eine vierte Dauer ist ein Zeichen dafür, dass die
Interaktion überdacht gehört, nicht dass die Skala eine Zahl braucht.

---

## Wo Inhalte gepflegt werden

| Was | Datei |
| --- | --- |
| Firmendaten, Öffnungszeiten, Einsatzgebiet, Domain, OG-Bild | `src/config/company.ts` |
| Leistungskatalog (Namen, Slugs, Beschreibungen) | `src/content/services.ts` |
| FAQ-Einträge | `src/content/faq.ts` |
| Menüs (Header, Footer, mobil), primärer CTA | `src/config/navigation.ts` |
| Impressum | `src/app/impressum/page.tsx` |
| Datenschutzerklärung | `src/app/datenschutz/page.tsx` |
| Design-Tokens | `src/app/globals.css` |
| Logo | `public/logo*.svg` |

**Fließtext der Landing-Page-Sections steht noch in den Komponenten selbst**
(`src/components/sections/*.tsx`), jeweils als benannte Konstante am Dateikopf.
Das ist eine bewusste Zwischenstufe, solange die Texte in Review sind. Sobald
sie freigegeben sind, gehören sie nach `src/content/` — dann kann Copy geändert
werden, ohne Markup anzufassen.

Header, Footer, Hero-Chips und Bento lesen den Leistungskatalog aus
`content/services.ts`. Eine Leistung hinzuzufügen ist deshalb eine
Ein-Datei-Änderung — **aber** jede Leistung braucht anschließend ihre eigene
`/leistungen/[slug]`-Seite mit eigenem Text, sonst zeigen die Links ins Leere
und es entsteht Duplicate Content.

Kein CMS. Inhalte werden im Code gepflegt und deployt. Falls der Kunde Texte
selbst ändern will, ist das eine eigene Entscheidung mit eigenem Aufwand — sie
ist bisher nicht getroffen.

---

## Formular / API

Der Ablauf: `QuoteForm` (Client) validiert gegen `src/lib/quote-request.ts` und
schickt an `POST /api/anfrage`. Der Endpunkt validiert **dieselbe** Schema-Datei
noch einmal, weil er öffentlich ist.

Zugestellt wird über **EmailJS**, und zwar **serverseitig** über deren
REST-API (`src/lib/emailjs.ts`) — nicht über das Browser-SDK. Der Grund steht
ausführlich im Kopf der Datei: beim Versand aus dem Browser würde das Gerät des
Besuchers eine Verbindung zu `api.emailjs.com` aufbauen und dabei seine
IP-Adresse in ein Drittland übertragen, bevor er irgendetwas bestätigt hat. Das
wäre einwilligungspflichtig und würde ein Cookie-Banner erzwingen. So spricht
nur unser Server mit dem Dienst.

Pro Anfrage gehen zwei Mails raus:

| Mail | Verhalten bei Fehlschlag |
| --- | --- |
| interne Benachrichtigung an `info@imperial-gmbh.com`, `Reply-To` auf den Absender | `502`, das Formular zeigt die Fehlermeldung mit der Telefonnummer |
| Bestätigung an den Absender | wird nur geloggt; die Anfrage gilt als zugestellt |

Die Unterscheidung ist Absicht: die interne Mail **ist** die Anfrage. Die
Bestätigung ist Höflichkeit — sie zum Fehler zu machen würde den Kunden
auffordern, noch einmal abzusenden, und eine doppelte Anfrage erzeugen.

Der Inhalt beider Mails wird in `src/lib/quote-mail.ts` gebaut, nicht im
EmailJS-Dashboard. Die Vorlagen dort enthalten nur Platzhalter — jede
Firmenangabe kommt aus `company.ts`, sonst wäre die Vorlage eine zweite Kopie
davon, die niemand mitpflegt.

> **Ohne die fünf Umgebungsvariablen antwortet der Endpunkt mit
> `503 mail_not_configured`** und das Formular zeigt seine Fehlermeldung. Es
> behauptet nie, eine Anfrage sei angekommen, wenn sie es nicht ist.
> Einrichtung: [`docs/emailjs.md`](./docs/emailjs.md).

**Spamschutz** (`src/lib/anti-spam.ts`): ein Honeypot-Feld, eine Zeitprüfung
(unter 3 s = verworfen) und ein Rate-Limit von 5 Anfragen pro 10 Minuten pro
Anschluss. Kein Captcha eines Drittanbieters — das bräuchte ein Banner und eine
eigene DSGVO-Prüfung. Eine als automatisiert erkannte Anfrage bekommt `200`
und keine Mail: ein Bot, dem man sagt, dass er erkannt wurde, versucht es
anders. Die Zeile `dropped as automated` im Log macht den Fall trotzdem
auffindbar.

Das Rate-Limit liegt im Arbeitsspeicher des Prozesses und ist damit
**pro Instanz** — zwei Serverless-Instanzen zählen getrennt, ein Deploy setzt
zurück. Das ist bewusst so: der gemeinsame Speicher, der das lösen würde, hängt
an der Hosting-Entscheidung. Der TODO dazu steht in der Datei.

Noch offen: die **Aufbewahrungsfrist** für Anfragen. Der Posteingang ist der
Speicherort — was die Datenschutzerklärung als Frist nennt, muss dort auch
gelebt werden.

---

## Deployment

Hosting ist **Cloudflare Workers**, deployt über den OpenNext-Adapter
(`@opennextjs/cloudflare`). Die Konfiguration liegt in
[`wrangler.jsonc`](./wrangler.jsonc) und [`open-next.config.ts`](./open-next.config.ts);
beide Dateien sind kommentiert und erklären die jeweilige Entscheidung.

**Warum Workers und nicht Cloudflare Pages:** Pages liefert statische Dateien
aus. `POST /api/anfrage` ist aber eine Serverroute — sie validiert den Body
erneut, begrenzt die Rate und ruft EmailJS mit dem Private Key. Ein statischer
Export (`output: 'export'`) kann diese Route nicht mitnehmen. Genau daran
scheiterte der erste Deployversuch: die Build-Einstellung erwartete ein
Verzeichnis `out/`, Next schreibt aber `.next/`, und `out/` entsteht nur beim
statischen Export.

### Einstellungen im Cloudflare-Dashboard

Workers & Pages → Create → Workers → **Import a repository** → `metinjamo`.

| Einstellung      | Wert                            |
| ---------------- | ------------------------------- |
| Build command    | `npx opennextjs-cloudflare build` |
| Deploy command   | `npx opennextjs-cloudflare deploy` |
| Build output dir | *leer lassen*                   |

Das Ausgabeverzeichnis wird **nicht** gesetzt. Wohin deployt wird, steht in
`wrangler.jsonc` (`main` und `assets.directory`) — ein Wert im Dashboard
überschreibt das und bricht den Deploy.

### Umgebungsvariablen

Die vier `EMAILJS_*`-Werte gehören als **Secrets** an den Worker (Settings →
Variables and Secrets), nicht als Plaintext-Variablen. Namen und Bedeutung:
[`docs/emailjs.md`](./docs/emailjs.md). Der Adapter schreibt alle Worker-Variablen
pro Request in `process.env`, deshalb liest `src/lib/emailjs.ts` sie unverändert
weiter — im Code ist dafür nichts zu ändern.

`EMAILJS_TEMPLATE_ID_CONFIRMATION` bleibt leer bzw. ungesetzt: gegen die
Bestätigungsmail an den Absender wurde entschieden.

### Checkliste beim ersten Deploy

1. `company.site.url` in `src/config/company.ts` auf die echte Domain setzen.
   Sie speist `metadataBase`, Canonicals, OG-URLs, `sitemap.xml` und `robots.txt`
   — steht sie falsch, zeigen alle absoluten URLs auf die falsche Domain.
2. Domain verbinden, HTTPS erzwingen, `www` und Apex auf eine Variante
   umleiten (die kanonische Variante muss zu `company.site.url` passen).
3. Die vier `EMAILJS_*`-Secrets setzen. Danach eine echte Testanfrage absenden
   und prüfen, dass die Mail ankommt.
4. `/sitemap.xml` und `/robots.txt` im Browser prüfen, Sitemap in der Google
   Search Console einreichen.

### Lokal

`npm run preview` baut den Worker und startet ihn in der echten
Workers-Laufzeit (workerd) — der einzige Weg, das Verhalten vor dem Deploy zu
sehen; `npm run dev` läuft weiter unter Node.

`npm run deploy` deployt von der eigenen Maschine aus. **Nur als Notfallweg
benutzen:** der Build backt vorhandene `.env*`-Dateien in das Worker-Bundle
(`.open-next/cloudflare/next-env.mjs`), der EmailJS Private Key aus
`.env.local` landet damit im deployten Code statt als Cloudflare-Secret. Der
Build im Dashboard hat dieses Problem nicht, weil `.env.local` nicht im
Repository liegt.

### Logs

`observability` ist in `wrangler.jsonc` aktiviert, sonst wären die Zeilen aus
`app/api/anfrage/route.ts` nur in einem Live-Tail zu sehen. `NOT DELIVERED` ist
die einzige Spur, die eine fehlende Zugangsdatei oder eine abgelehnte Sendung
hinterlässt — und `dropped as automated` die einzige, die ein falsch aussortierter
echter Interessent hinterlässt. Personenbezogene Daten werden bewusst nicht
geloggt; wer eine Logzeile ergänzt, prüft das vorher.

Es gibt **kein Analytics und keine Third-Party-Skripte**, deshalb aktuell auch
kein Consent-Banner. Das ist eine bewusste Entscheidung (Claude.md 3). Wer
Analytics ergänzt, prüft vorher, ob damit ein Banner nötig wird — cookieless
(Plausible, self-hosted Umami) vermeidet das.

---

## Vor dem Livegang

### Blocker — ohne diese Punkte darf die Seite nicht online

- [ ] **EmailJS einrichten** — Dashboard, zwei Vorlagen, fünf
      Umgebungsvariablen. Anleitung: [`docs/emailjs.md`](./docs/emailjs.md).
      Der Code ist fertig; ohne die Einrichtung antwortet das Formular mit
      einer Fehlermeldung und es geht keine Anfrage verloren, aber es kommt
      auch keine an.
- [ ] **AV-Vertrag mit EmailJS** abschließen (Art. 28 DSGVO) und Firmierung
      samt Sitz in die Datenschutzerklärung übernehmen, Abschnitte 06 und 07.
      Ohne AVV darf der Dienst nicht produktiv laufen.
- [ ] **Kontingent bei EmailJS prüfen.** Jede Anfrage verbraucht zwei
      Sendungen; der kostenlose Tarif reicht für etwa 100 Anfragen im Monat.
      Ist es erschöpft, sieht der Besucher die Fehlermeldung.
- [ ] **Leistungskatalog vom Kunden bestätigen** (`src/content/services.ts`).
      Der aktuelle Katalog ist ein Vorschlag. Eine beworbene Leistung, die nicht
      angeboten wird, ist ein Problem nach § 5 UWG.
- [ ] **Aussagen in Hero, Ablauf und Vorteile freigeben lassen.** Die
      betroffenen Sätze sind im Code mit `TODO (client)` markiert — unter
      anderem „unter zwei Minuten", die kostenlose Besichtigung, feste Teams
      und die Form der Leistungsnachweise.
- [ ] **Domain festlegen** und `company.site.url` setzen.
- [x] ~~**Hosting entscheiden**~~ — Cloudflare Workers, siehe Abschnitt
      Deployment.
- [ ] **Cloudflare in der Datenschutzerklärung nachtragen** und AV-Vertrag
      abschließen (Art. 28 DSGVO). Die Erklärung nennt bisher keinen Hoster;
      damit fehlen Firmierung, Sitz, die Logfile-Angaben und das Stand-Datum.
      Ohne diesen Punkt darf die Seite nicht live gehen.
- [ ] **Rate-Limit in einen gemeinsamen Speicher verschieben.** Es liegt im
      Arbeitsspeicher der Worker-Isolate und zählt damit pro Isolate, nicht pro
      Besucher — bei Cloudflare sind das je nach Region mehrere. Der TODO steht
      in `src/lib/anti-spam.ts`; die naheliegende Lösung ist jetzt ein
      Durable Object oder Cloudflare KV.
- [ ] **USt-IdNr.** nachtragen oder die Zeile im Impressum begründet entfernen.
- [ ] **Versicherer und Geltungsbereich** der Betriebshaftpflicht ergänzen. Die
      Deckungssumme wird auf der Seite genannt; wer sie nennt, sollte sie
      belegen können.
- [ ] **Anschrift der LDI NRW** im Datenschutz vervollständigen.

### Vor dem Livegang zu klären

- [ ] `/leistungen`, `/leistungen/[slug]`, `/ueber-uns`, `/kontakt` bauen. Bis
      dahin laufen die Links aus Header und Footer ins 404 — die 404-Seite
      führt deshalb nur auf Anker der Startseite zurück.
- [ ] Neue Routen in `src/app/sitemap.ts` ergänzen.
- [ ] **Logo als echtes SVG** vom Kunden anfordern. Die aktuellen Dateien sind
      aus dem JPEG nachgezeichnet (~97 KB / ~60 KB) und keine Produktionsdateien.
- [ ] **Hero-Bild:** aktuell eine abstrakte Fläche als Platzhalter. Ersetzen,
      sobald eigene Fotos vorliegen — Hochformat 4:5, ca. 1400 × 1750,
      über `next/image` mit `priority`. Keine Stockfotos (Claude.md 5.7).
- [ ] **Referenzen und Kundenstimmen:** Die Section fehlt bewusst, bis echte,
      freigegebene Inhalte vorliegen. Erfundene bleiben erfunden.
- [ ] **Kennzahlen-Leiste** in `trust-bar.tsx` ist auskommentiert und wird erst
      aktiviert, wenn Gründungsjahr, Mitarbeiterzahl und Objektzahl real sind.
- [ ] **WhatsApp:** ja oder nein? Der vorbereitete Block in
      `contact-channels.tsx` ist auskommentiert.
- [ ] **Preis- oder Paketmodell:** ja oder nein?
- [ ] `/styleguide` behalten oder entfernen. Nicht indexiert, aber öffentlich.
- [ ] Lighthouse gegen den Produktions-Build fahren. Ziel: Performance ≥ 90,
      Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] Google Business Profile anlegen bzw. abgleichen — die NAP-Daten müssen
      **zeichengleich** zu `company.ts` sein.
