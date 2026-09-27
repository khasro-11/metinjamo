# EmailJS einrichten — Zustellung der Formularanfragen

Diese Anleitung ist der einzige Schritt, der **nicht** im Code passieren kann.
Solange sie nicht abgearbeitet ist, antwortet `POST /api/anfrage` mit
`503 mail_not_configured`, und das Formular zeigt dem Besucher seine
Fehlermeldung mit der Telefonnummer. Es behauptet nie, eine Anfrage sei
angekommen, wenn sie es nicht ist.

Zeitbedarf: etwa 20 Minuten. Nötig ist ein Zugang zum Postfach
`info@imperial-gmbh.com`.

---

## 0. Vorab: warum serverseitig

EmailJS wird normalerweise direkt im Browser benutzt. Hier nicht. Der Aufruf
läuft über unseren eigenen Server, aus zwei Gründen:

- **Datenschutz.** Beim Browser-Versand würde das Gerät des Besuchers eine
  Verbindung zu `api.emailjs.com` aufbauen und dabei seine IP-Adresse in ein
  Drittland übertragen — bevor er irgendetwas bestätigt hat. Das wäre
  einwilligungspflichtig und würde ein Cookie-Banner erzwingen. Serverseitig
  spricht ausschließlich unser Server mit EmailJS; der Browser des Besuchers
  erfährt von dem Dienst nichts.
- **Missbrauch.** Der Public Key ist in den Entwicklertools jedes Besuchers
  lesbar und genügt allein, um über den Account Mails zu verschicken. Mit dem
  Private Key auf dem Server ist der Account von außen nicht ansteuerbar.

Die technische Folge: **Schritt 1 ist nicht optional.** EmailJS blockiert
API-Aufrufe, die nicht aus einem Browser kommen, standardmäßig.

---

## 1. Account → Security

Im EmailJS-Dashboard unter **Account → Security**:

- [ ] **„Allow EmailJS API for non-browser applications"** aktivieren.
      Ohne diesen Haken wird jeder Aufruf aus dem Server abgelehnt.
- [ ] **„Use Private Key"** aktivieren.
- [ ] **Private Key** kopieren → wird später `EMAILJS_PRIVATE_KEY`.
- [ ] Unter **Account → General** den **Public Key** kopieren → später
      `EMAILJS_PUBLIC_KEY`.

> Der Private Key gibt vollen Sendezugriff auf den Account. Er gehört
> ausschließlich in die Umgebungsvariablen des Hostings — nie ins Repository,
> nie in eine Datei, die committet wird, nie in eine E-Mail.

---

## 2. Service anlegen

**Email Services → Add New Service**, dann das Postfach
`info@imperial-gmbh.com` verbinden (per SMTP des Providers oder über den
passenden Anbieter-Eintrag).

- [ ] Service anlegen und mit einer Testmail aus dem Dashboard prüfen.
- [ ] **Service ID** kopieren → später `EMAILJS_SERVICE_ID`.

Wichtig für die Zustellbarkeit: Die Absenderadresse muss zu der Domain
gehören, für die SPF und DKIM gesetzt sind. Eine Anfrage, die im Spam landet,
ist genauso verloren wie eine, die nie gesendet wurde.

---

## 3. Vorlage 1 — interne Benachrichtigung (Pflicht)

**Email Templates → Create New Template.** Name z. B. `anfrage-intern`.

| Feld | Wert |
| --- | --- |
| To email | `info@imperial-gmbh.com` |
| From name | `Website Imperial Gebäudeservice` |
| From email | die Adresse des Service aus Schritt 2 |
| **Reply To** | `{{reply_to}}` |
| Subject | `{{subject}}` |

Der Betreff wird im Code gebaut und sieht so aus:
`Angebotsanfrage · 47051 · Gebäudereinigung`. Damit ist der Posteingang nach
Postleitzahl und Bereich sortierbar, ohne eine einzige Mail zu öffnen.

`Reply To` ist die wichtigste Zeile dieser Vorlage: Eine Antwort geht damit an
den Kunden und nicht an die eigene Absenderadresse.

**Content** — es gibt zwei Varianten. Nimm die HTML-Fassung:

- **HTML (empfohlen):** [`email-templates/anfrage-intern.html`](./email-templates/anfrage-intern.html).
  Im Template-Editor auf die Code-Ansicht umschalten, den kompletten Inhalt
  ersetzen, Datei einfügen. Telefonnummer und E-Mail sind dort tapbare Links,
  damit ein Rückruf vom Telefon aus ein Tap ist.
- **Text (Fallback):** der Block unten. Funktional identisch, nur ohne Layout.

```
Neue Angebotsanfrage über die Website.
Eingegangen am {{submitted_at}}.

LEISTUNGEN
{{services_block}}

TURNUS
{{frequency}}

OBJEKT
Art:            {{property_type}}
PLZ:            {{postal_code}}
Ort / Lage:     {{location}}
Größe / Umfang: {{size}}

KONTAKT
Name:    {{customer_name}}
Firma:   {{customer_company}}
E-Mail:  {{customer_email}}
Telefon: {{customer_phone}}

NACHRICHT
{{customer_message}}

--
Eine Antwort auf diese E-Mail geht direkt an {{customer_email}}.
```

- [ ] Vorlage speichern.
- [ ] **Template ID** kopieren → später `EMAILJS_TEMPLATE_ID_NOTIFICATION`.

> `{{services_block}}` muss in `<pre>…</pre>` stehen. Der Block enthält
> Zeilenumbrüche und Einrückungen, und normales HTML wirft beides weg — die
> Leistungen stehen dann in einer einzigen Zeile. Die HTML-Vorlagen machen das
> schon richtig; wer das Markup selbst anfasst, darf es nicht herausnehmen.

Nicht ausgefüllte optionale Felder kommen als `—` an, nicht als Leerstelle.
Eine Zeile `Firma: —` ist eine Aussage; eine leere Zeile sieht wie ein Fehler
aus.

---

## 4. Vorlage 2 — Bestätigung an den Kunden (empfohlen)

Name z. B. `anfrage-bestaetigung`.

| Feld | Wert |
| --- | --- |
| **To email** | `{{to_email}}` |
| From name | `Imperial Gebäudeservice GmbH` |
| From email | die Adresse des Service aus Schritt 2 |
| Reply To | `info@imperial-gmbh.com` |
| Subject | `{{subject}}` |

**Content** — auch hier zwei Varianten:

- **HTML (empfohlen):** [`email-templates/anfrage-bestaetigung.html`](./email-templates/anfrage-bestaetigung.html).
  Diese Mail ist die erste, die der Kunde von uns sieht, und sie trägt die
  Markenfarben. Sie enthält außerdem die Pflichtangaben nach § 35a GmbHG
  (Firma, Sitz, Registergericht, HR-Nummer, Geschäftsführer) — eine
  Geschäftsmail einer GmbH ist ein Geschäftsbrief und braucht sie.
- **Text (Fallback):** der Block unten. Ohne die Pflichtangaben, deshalb nur
  zum Testen geeignet.

```
Guten Tag {{customer_name}},

vielen Dank für Ihre Anfrage. Sie ist am {{submitted_at}} bei uns eingegangen.
Wir sehen sie uns an und melden uns zu den Geschäftszeiten bei Ihnen.

Das haben Sie uns übermittelt:

LEISTUNGEN
{{services_block}}

TURNUS
{{frequency}}

OBJEKT
Art: {{property_type}}
PLZ: {{postal_code}}

Stimmt etwas davon nicht, antworten Sie einfach auf diese E-Mail.
Lieber direkt sprechen? {{company_phone}}, {{office_hours}}.

Mit freundlichen Grüßen
{{company_name}}


Ihre Angaben verwenden wir ausschließlich, um Ihre Anfrage zu bearbeiten und
Ihnen ein Angebot zu machen. Wir geben sie nicht zu Werbezwecken weiter.
Einzelheiten zu Zweck, Rechtsgrundlage, Speicherdauer und zu Ihren Rechten —
Auskunft, Berichtigung, Löschung, Widerspruch — finden Sie hier:
{{privacy_url}}

{{company_name}} · {{company_email}} · {{company_phone}}
```

- [ ] Vorlage speichern.
- [ ] **Template ID** kopieren → später `EMAILJS_TEMPLATE_ID_CONFIRMATION`.

Diese Vorlage ist die einzige mit einem dynamischen Empfänger. Sie ist
optional: Fehlt die Variable, geht nur die interne Benachrichtigung raus und
alles andere funktioniert unverändert. Scheitert der Versand der Bestätigung,
gilt die Anfrage trotzdem als zugestellt — die interne Mail ist die Anfrage,
die Bestätigung ist die Höflichkeit. Alles andere würde den Kunden auffordern,
noch einmal abzusenden, und eine doppelte Anfrage erzeugen.

Keine Antwortzeit in Stunden versprechen. „Zu den Geschäftszeiten" ist eine
Zusage, die gehalten werden kann.

---

## 5. Umgebungsvariablen setzen

Lokal in `.env.local`, in Produktion in den Einstellungen des Hostings. Die
Vorlage steht in [`.env.example`](../.env.example).

```
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID_NOTIFICATION=template_xxxxxxx
EMAILJS_TEMPLATE_ID_CONFIRMATION=template_yyyyyyy
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxxxx
```

Keiner dieser Namen trägt das Präfix `NEXT_PUBLIC_`, und das ist keine
Formsache: `NEXT_PUBLIC_` ist genau der Schalter, der eine Variable in das
JavaScript-Bundle des Browsers schreibt. Ein Private Key mit diesem Präfix
wäre öffentlich.

Nach jeder Änderung an `.env.local` den Dev-Server neu starten.

---

## 6. Prüfen

```bash
npm run dev
```

1. `http://localhost:3000/#angebot` öffnen, das Formular echt ausfüllen und
   absenden. Der Zeitfilter verwirft alles, was schneller als drei Sekunden
   abgeschickt wird.
2. Erwartet: die Erfolgsmeldung im Formular, eine Mail in
   `info@imperial-gmbh.com`, eine Mail an die angegebene Adresse.
3. Im Terminal steht eine Zeile `[anfrage] delivered: …` — ohne Namen, Adresse
   oder Nachricht. Das ist Absicht.

Wenn etwas fehlt, steht der Grund im Terminal:

| Logzeile | Bedeutung |
| --- | --- |
| `NOT DELIVERED — EmailJS is not configured. Missing: …` | Die genannte Variable fehlt oder ist leer. |
| `NOT DELIVERED — EmailJS rejected the request: …` | Antwort von EmailJS im Klartext — meist eine falsche ID oder Schritt 1 nicht erledigt. |
| `NOT DELIVERED — EmailJS unreachable (…)` | Netzwerk oder Zeitüberschreitung. |
| `dropped as automated (reason=trap)` | Honeypot gefüllt oder unter drei Sekunden abgesendet. |
| `confirmation mail failed: …` | Die interne Mail ist raus, die Bestätigung nicht. Vorlage 2 prüfen. |

Der Fall `429 rate_limited` greift ab der sechsten Anfrage in zehn Minuten vom
selben Anschluss. Beim Testen also entweder warten oder den Dev-Server neu
starten — der Zähler liegt im Arbeitsspeicher.

---

## 7. Datenschutz — noch offen

Mit EmailJS kommt ein Auftragsverarbeiter dazu. Zwei Punkte sind noch zu
erledigen und **keiner davon ist Code**:

- [ ] **Auftragsverarbeitungsvertrag abschließen.** EmailJS stellt ihn unter
      <https://www.emailjs.com/legal/data-protection-agreement/> bereit. Ohne
      AVV nach Art. 28 DSGVO darf der Dienst nicht produktiv laufen.
- [ ] **Firmierung, Sitz und Rechtsgrundlage des Drittlandtransfers aus dem
      abgeschlossenen AVV in die Datenschutzerklärung übernehmen.** Der
      Abschnitt „Empfänger Ihrer Daten" hat dafür einen markierten Platzhalter.
      Im veröffentlichten AVV firmiert der Anbieter als *EmailJS Pte Ltd*, er
      behält sich eine Übermittlung in die USA vor und stützt sie auf die
      EU-Standardvertragsklauseln. Diese Angaben sind aus der Website
      entnommen und müssen gegen den tatsächlich abgeschlossenen Vertrag
      geprüft werden, bevor sie in der Erklärung stehen — eine falsche Angabe
      dort ist selbst ein Verstoß.

Ebenfalls noch offen, unabhängig von EmailJS: die **Aufbewahrungsfrist** für
Anfragen. Der Posteingang ist der Speicherort der Anfrage. Was die
Datenschutzerklärung als Frist nennt, muss im Postfach auch tatsächlich
gelebt werden.

---

## 8. Kontingent

EmailJS zählt Sendungen, und jede Anfrage verbraucht **zwei** davon (intern +
Bestätigung). Der kostenlose Tarif liegt bei 200 Sendungen im Monat, also bei
etwa 100 Anfragen. Ist das Kontingent erschöpft, lehnt EmailJS ab, der
Endpunkt antwortet mit `502` und der Besucher sieht die Fehlermeldung mit der
Telefonnummer.

- [ ] Vor dem Livegang entscheiden, ob der kostenlose Tarif reicht.
- [ ] Eine Erinnerung einrichten, das Kontingent im Dashboard zu beobachten.
      EmailJS meldet sich nicht von selbst, wenn es knapp wird.
