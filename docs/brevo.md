# Brevo einrichten — Zustellung der Formularanfragen

Der Code ist fertig. Was hier beschrieben wird, ist die Einrichtung des
Brevo-Accounts und das Setzen von zwei Umgebungsvariablen. Solange das nicht
passiert ist, antwortet `POST /api/anfrage` mit `503 mail_not_configured`, und
das Formular zeigt eine Fehlermeldung — es behauptet nie, eine Anfrage sei
angekommen, wenn sie es nicht ist.

Beteiligte Dateien:

| Datei                                      | Rolle                                              |
| ------------------------------------------ | -------------------------------------------------- |
| `src/lib/brevo.ts`                         | Der API-Aufruf, Konfiguration, Fehlerklassen       |
| `src/lib/quote-mail.ts`                    | Inhalt beider Mails, Plain-Text-Varianten          |
| `src/lib/mail-templates/*.ts`              | Das HTML beider Mails                              |
| `src/lib/mail-template.ts`                 | Platzhalter füllen und escapen                     |
| `src/app/api/anfrage/route.ts`             | Endpunkt, Validierung, Spamschutz                  |

> **Hinweis zur Menüführung:** die unten genannten Menüpunkte entsprechen der
> Brevo-Oberfläche zum Zeitpunkt der Einrichtung. Benennungen dort ändern sich
> gelegentlich — die Begriffe „API key", „Senders" und „Domains" bleiben aber
> die Suchbegriffe, über die man ankommt.

---

## 0. Vorab: warum serverseitig

Brevo wird ausschließlich von unserem Server aufgerufen, nie aus dem Browser des
Besuchers. Das ist keine Geschmacksfrage:

Würde die Seite die Mail im Browser abschicken, baute das Gerät des Besuchers
eine Verbindung zu `api.brevo.com` auf und übertrüge dabei seine IP-Adresse an
einen Dritten — bevor er irgendetwas bestätigt hat. Das wäre
einwilligungspflichtig und erzwänge ein Consent-Banner (Claude.md 3). So spricht
nur unser Server mit Brevo, der Browser des Besuchers erfährt nichts davon, und
genau das sagt die Datenschutzerklärung in Abschnitt 06 zu.

Der zweite Grund: ein Brevo-API-Key ist **kein** Public Key. Er darf senden,
Kontakte lesen und das Kontingent verbrauchen. Im Browser wäre er für jeden
lesbar, der die Entwicklerwerkzeuge öffnet.

---

## 1. API-Key erzeugen

1. In Brevo einloggen.
2. Oben rechts auf den Accountnamen → **SMTP & API** (alternativ direkt
   `app.brevo.com/settings/keys/api`).
3. Reiter **API keys** → **Generate a new API key**.
4. Name: etwas, das den Einsatzort nennt, z. B. `imperial-website-formular`.
   Der Name ist nur für dich — er taucht nirgends in einer Mail auf.
5. Den Wert **sofort kopieren**. Er beginnt mit `xkeysib-` und wird nach dem
   Schließen des Dialogs nie wieder angezeigt.

Dieser Wert ist `BREVO_API_KEY`.

> Getrennte Keys für lokale Entwicklung und Produktion sind sinnvoll: dann kann
> man einen davon zurückziehen, ohne das Formular auf der Live-Seite abzuschalten.

---

## 2. Absender verifizieren — der Schritt, der über Zustellbarkeit entscheidet

Brevo verschickt nur von Adressen, die im Account bekannt sind.

1. **Settings → Senders, Domains & Dedicated IPs.**
2. Reiter **Senders** → **Add a sender**, Name und Adresse eintragen
   (z. B. `info@imperial-gmbh.com`). Brevo schickt eine Bestätigungsmail an
   diese Adresse; der Link darin muss geklickt werden.
3. Reiter **Domains** → die Domain hinzufügen und die von Brevo angezeigten
   DNS-Einträge beim Domain-Anbieter setzen. Das sind **DKIM** und ein
   **SPF**-Eintrag, dazu ein Brevo-Code-Record.
4. Zusätzlich eine **DMARC**-Policy setzen, wenn noch keine existiert. Für den
   Anfang genügt `v=DMARC1; p=none; rua=mailto:info@imperial-gmbh.com` — das
   überwacht nur und blockiert nichts.

Die verifizierte Adresse ist `BREVO_SENDER_EMAIL`.

**Warum beide Schritte nötig sind, nicht nur der erste:**

| Zustand                             | Folge                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| Absender nicht verifiziert          | Brevo **lehnt ab**. Formular zeigt Fehler. Sichtbar.     |
| Verifiziert, Domain nicht signiert  | Mail geht raus und landet im **Spam**. Unsichtbar.        |
| Verifiziert + SPF/DKIM/DMARC        | Zustellung in den Posteingang.                            |

Der Mittelfall ist der gefährliche: das Formular meldet Erfolg, die Anfrage ist
weg. Eine Anfrage im Spam-Ordner ist ein verlorener Auftrag.

> **Nicht die Adresse des Anfragenden als Absender eintragen.** Sie kommt als
> `Reply-To` in die Mail, damit „Antworten" im Postfach beim Kunden landet. Als
> Absender wäre sie eine von unserer Domain signierte Mail, die vorgibt, von
> seiner zu kommen — genau das weisen SPF und DMARC zurück. `src/lib/brevo.ts`
> setzt das korrekt, es ist nur nichts, was man später „vereinfachen" sollte.

---

## 3. Umgebungsvariablen setzen

Namen und Bedeutung stehen kommentiert in [`.env.example`](../.env.example).
Pflicht sind zwei, die übrigen drei haben brauchbare Vorgaben.

| Variable                  | Pflicht | Leer bedeutet                                   |
| ------------------------- | ------- | ----------------------------------------------- |
| `BREVO_API_KEY`           | ja      | —                                               |
| `BREVO_SENDER_EMAIL`      | ja      | —                                               |
| `BREVO_SENDER_NAME`       | nein    | `legalName` aus `company.ts`                    |
| `BREVO_TO_EMAIL`          | nein    | `info@imperial-gmbh.com` aus `company.ts`       |
| `BREVO_SEND_CONFIRMATION` | nein    | keine Bestätigungsmail an den Anfragenden       |

**Lokal:** in `.env.local`. Die Datei ist per `.gitignore` ausgeschlossen.

**Cloudflare Workers:** Worker → Settings → **Variables and Secrets**.
`BREVO_API_KEY` als **Secret** anlegen, nicht als Plaintext-Variable. Der
OpenNext-Adapter schreibt alle Worker-Variablen pro Request in `process.env`,
deshalb liest `src/lib/brevo.ts` sie unverändert — im Code ist nichts zu ändern.

**Lokale Cloudflare-Vorschau** (`npm run preview`) liest nicht `.env.local`,
sondern `.dev.vars` im Projektwurzelverzeichnis. Gleiche Namen, gleiche Werte;
die Datei ist ebenfalls gitignoriert.

> ⚠️ `npm run deploy` (Deploy von der eigenen Maschine) backt vorhandene
> `.env*`-Dateien in das Worker-Bundle. Der API-Key aus `.env.local` landet damit
> im deployten Code statt als Secret. Nur als Notfallweg benutzen — der Build im
> Cloudflare-Dashboard hat das Problem nicht, weil `.env.local` nicht im
> Repository liegt.

---

## 4. Prüfen

```bash
npm run dev
```

Formular auf der Startseite ausfüllen und absenden. Die fünf Schritte müssen
dabei wirklich durchlaufen werden — unter 3 Sekunden Gesamtdauer verwirft die
Zeitfalle die Anfrage und antwortet trotzdem mit `200` (siehe
`src/lib/anti-spam.ts`).

Erwartet:

- Erfolgsmeldung im Formular
- Mail in `info@imperial-gmbh.com`, Betreff
  `Angebotsanfrage · <PLZ> · <Kategorie>`
- im Terminal eine Zeile
  `[anfrage] delivered: … messageId=<…>`
- unter **Transactional → Logs** in Brevo derselbe Versand, auffindbar über die
  `messageId`

Fehlerbilder:

| Antwort                     | Ursache                                              |
| --------------------------- | ---------------------------------------------------- |
| `503 mail_not_configured`   | `BREVO_API_KEY` oder `BREVO_SENDER_EMAIL` fehlt      |
| `502 mail_failed`, `unauthorized` | Key falsch, abgelaufen oder zurückgezogen      |
| `502 mail_failed`, Absender | `BREVO_SENDER_EMAIL` in Brevo nicht verifiziert      |
| `429 rate_limited`          | mehr als 5 Anfragen in 10 Minuten vom selben Anschluss |

Die Logzeilen enthalten **keine** personenbezogenen Daten — kein Name, keine
Adresse, keine Telefonnummer, kein Nachrichtentext. Adressen in
Fehlermeldungen des Anbieters werden vor dem Logging ersetzt
(`redactAddresses` in `src/lib/brevo.ts`). Bitte keine Logzeile hinzufügen,
die das aufweicht.

---

## 5. Datenschutz — noch offen

**Der AV-Vertrag nach Art. 28 DSGVO muss abgeschlossen sein, bevor der Dienst
produktiv läuft.** Brevo ist Auftragsverarbeiter: er verarbeitet die Daten aus
dem Formular in unserem Auftrag.

Zu tun:

1. AV-Vertrag (Data Processing Agreement) mit Brevo abschließen. Brevo stellt
   ihn über die Rechtstexte im Account bzw. über den Support bereit.
2. **Die Angaben in der Datenschutzerklärung gegen den unterzeichneten Vertrag
   prüfen** und die `<Pending>`-Stellen in
   [`src/app/datenschutz/page.tsx`](../src/app/datenschutz/page.tsx),
   Abschnitte 06 und 07, ersetzen:
   - **Vertragsentität und Sitz.** Je nach Vertrag ist das die deutsche oder die
     französische Brevo-Gesellschaft. Nicht raten — die Firmierung steht im
     Vertrag.
   - **Anschrift des Anbieters.**
   - **Ort der Verarbeitung.** Brevo gibt die EU an. Steht es so im Vertrag,
     entfällt der Abschnitt zur Drittlandübermittlung; steht dort etwas anderes,
     muss er geschrieben werden.
   - **Unterauftragsverarbeiter**, soweit der Vertrag sie benennt.

Eine falsche Angabe an dieser Stelle ist selbst ein Datenschutzverstoß. Das ist
der Grund, warum dort sichtbare Platzhalter stehen statt plausibler Vermutungen.

Kein Consent-Banner erforderlich: der Dienst wird nur serverseitig angesprochen,
der Browser des Besuchers baut zu ihm keine Verbindung auf (siehe Abschnitt 0).

---

## 6. Kontingent

Brevos kostenloser Tarif erlaubt eine feste Zahl transaktionaler Mails pro Tag
(zum Zeitpunkt der Einrichtung 300). **Vor dem Livegang im Account gegenprüfen**,
Preismodelle ändern sich.

Pro Anfrage geht **eine** Mail raus, solange `BREVO_SEND_CONFIRMATION` leer
bleibt. Mit Bestätigungsmail sind es zwei, also die halbe Reichweite.

Ist das Kontingent erschöpft, lehnt Brevo ab, der Endpunkt antwortet mit `502`
und der Besucher sieht die Fehlermeldung. Das ist gewollt: besser eine sichtbare
Fehlermeldung mit Telefonnummer daneben als eine Erfolgsmeldung für eine Anfrage,
die niemand bekommt.

---

## 7. Mailvorlagen ändern

Die Vorlagen liegen **im Repository**, nicht in Brevo:

- `src/lib/mail-templates/anfrage-intern.ts` — die interne Benachrichtigung
- `src/lib/mail-templates/anfrage-bestaetigung.ts` — die Bestätigung

Das ist Absicht. Eine Vorlage im Dashboard des Anbieters kann nichts importieren;
jede Firmenangabe, die man dort hineinschreibt, wäre eine zweite Kopie von
`company.ts`, die niemand mitpflegt (Claude.md 2). So sind die Vorlagen normale
Dateien, im Diff nachvollziehbar, und ein Deploy genügt.

Regeln beim Ändern:

- Platzhalter sind `{{snake_case}}` und müssen einen Eintrag in
  `NotificationParams` bzw. `ConfirmationParams` haben
  (`src/lib/quote-mail.ts`). Ein Platzhalter ohne Gegenstück lässt den Versand
  **fehlschlagen** statt eine leere Zeile zu verschicken — das ist gewollt.
- Werte werden beim Einsetzen HTML-escaped. Kein Markup in Platzhaltern.
- Tabellenlayout und Inline-Styles beibehalten: Outlook rendert mit der
  Word-Engine und kennt weder Flexbox noch Grid noch externes CSS.
- Wird eine Zeile hinzugefügt, gehört sie auch in die Plain-Text-Variante in
  `quote-mail.ts` — sonst driften die beiden Fassungen auseinander.
