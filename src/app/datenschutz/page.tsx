/* ==========================================================================

   ██  ENTWURF — NICHT FREIGEGEBEN  ██

   DIESER TEXT IST EIN ENTWURF UND MUSS VOR DEM LIVEGANG ANWALTLICH GEPRÜFT
   WERDEN.

   Es ist ein GERÜST: die Struktur stimmt, die Rechtsgrundlagen sind benannt,
   aber überall dort, wo ein konkreter Dienst oder eine konkrete Frist stehen
   muss, steht sichtbar <Pending>. Jede dieser Stellen ist ein Launch-Blocker.
   Die Seite darf nicht live gehen, solange auch nur eine davon übrig ist.

   Konkret noch zu klären (CLAUDE.md 6 und 12):
     - Hosting-Anbieter + Auftragsverarbeitungsvertrag (Art. 28 DSGVO)
     - Serverstandort
     - Umfang und Löschfrist der Server-Logfiles — hängt am Hoster
     - Mail-Zustellung des Formulars (Resend / SMTP / Formular-Dienst)
       + AVV; siehe den DELIVERY-Block in app/api/anfrage/route.ts
     - Aufbewahrungsfristen: Anfragen ohne Auftrag vs. Handels- und
       steuerrechtliche Pflichten (§ 257 HGB, § 147 AO)
     - Stand-Datum dieser Erklärung, sobald der Text final ist
     - Datenschutzbeauftragter: nur zu benennen, wenn i.d.R. mind. 20
       Personen ständig mit automatisierter Verarbeitung befasst sind
       (§ 38 BDSG). Mitarbeiterzahl liegt noch nicht vor — deshalb hier
       bewusst KEINE Aussage.

   Bewusst NICHT enthalten, weil die Dienste nicht laufen: Cookies,
   Analytics, Google Fonts, Google Maps, Social Plugins, WhatsApp. Kommt
   einer davon dazu, braucht er hier einen eigenen Abschnitt — und ggf. ein
   Consent-Banner (CLAUDE.md 3).

   ========================================================================== */

import type { Metadata } from 'next';

import {
  DataCard,
  DataRow,
  ExternalValue,
  LegalBody,
  LegalHeader,
  LegalLink,
  LegalList,
  LegalPage,
  LegalProse,
  LegalSection,
  LegalSubsection,
  LegalToc,
  Pending,
  createSectionIndex,
} from '@/components/legal';
import { company } from '@/config/company';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: `Wie ${company.legalName} personenbezogene Daten auf dieser Website verarbeitet: Verantwortlicher, Server-Logfiles, Kontaktaufnahme, Speicherdauer und Ihre Rechte nach der DSGVO.`,
};

const sections = createSectionIndex([
  { id: 'verantwortlicher', title: 'Verantwortlicher' },
  { id: 'grundsaetze', title: 'Grundsätze und Rechtsgrundlagen' },
  { id: 'hosting', title: 'Hosting und Bereitstellung der Website' },
  { id: 'logfiles', title: 'Server-Logfiles' },
  { id: 'verschluesselung', title: 'Verschlüsselte Übertragung' },
  { id: 'kontakt', title: 'Kontaktaufnahme' },
  { id: 'empfaenger', title: 'Empfänger Ihrer Daten' },
  { id: 'speicherdauer', title: 'Speicherdauer und Löschung' },
  { id: 'drittdienste', title: 'Cookies, Tracking und Drittdienste' },
  { id: 'rechte', title: 'Ihre Rechte' },
  { id: 'beschwerde', title: 'Beschwerderecht bei der Aufsichtsbehörde' },
  { id: 'aenderungen', title: 'Änderungen dieser Erklärung' },
] as const);

/**
 * /datenschutz
 *
 * Written against what this site actually does, not against a generator
 * template. That distinction matters: a privacy policy that lists Google
 * Analytics on a site without Analytics is as wrong as one that omits a
 * service that is running.
 *
 * What the site does today: it serves static pages, it self-hosts its fonts,
 * it sets no cookies, and it has exactly one endpoint that receives personal
 * data — POST /api/anfrage, the quote form. The field list in section 6 is
 * kept in sync with `lib/quote-request.ts` by hand; if a field is added
 * there, it has to be added here too.
 *
 * Server component, no client JavaScript.
 */
export default function DatenschutzPage() {
  const { address } = company;

  return (
    <LegalPage>
      <LegalHeader
        eyebrow="Rechtliches"
        title="Datenschutzerklärung"
        lead="Diese Erklärung beschreibt, welche personenbezogenen Daten beim Besuch dieser Website und bei einer Anfrage an uns verarbeitet werden, auf welcher Rechtsgrundlage das geschieht und welche Rechte Sie dabei haben."
      >
        <LegalToc label="Inhalt" sections={sections.all} />
      </LegalHeader>

      <LegalBody>
        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('verantwortlicher')}>
          <LegalProse>
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung
              (DSGVO) für die Verarbeitung auf dieser Website ist:
            </p>
          </LegalProse>

          <div className="mt-6">
            <DataCard>
              <DataRow term="Verantwortlicher">
                <address className="not-italic">
                  <span className="block font-medium">{company.legalName}</span>
                  <span className="block">{address.street}</span>
                  <span className="block">
                    {address.postalCode} {address.city}
                  </span>
                </address>
              </DataRow>

              <DataRow term="Vertreten durch">
                {company.managingDirector.name}, Geschäftsführer
              </DataRow>

              <DataRow term="Telefon">
                <ExternalValue href={company.phone.href} numeric>
                  {company.phone.display}
                </ExternalValue>
              </DataRow>

              <DataRow term="E-Mail">
                <ExternalValue href={company.email.href}>
                  {company.email.address}
                </ExternalValue>
              </DataRow>
            </DataCard>
          </div>

          <LegalProse className="mt-6">
            <p>
              Bei Fragen zum Datenschutz erreichen Sie uns unter den oben
              genannten Kontaktdaten.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('grundsaetze')}>
          <LegalProse>
            <p>
              Wir verarbeiten personenbezogene Daten nur, soweit das für den
              Betrieb dieser Website oder für die Bearbeitung Ihrer Anfrage
              erforderlich ist. Es gilt der Grundsatz der Datenminimierung
              nach Art. 5 Abs. 1 lit. c DSGVO: Wir fragen nichts ab, was wir
              für ein Angebot nicht brauchen.
            </p>
            <p>Als Rechtsgrundlagen kommen dabei in Betracht:</p>
          </LegalProse>

          <div className="mt-5">
            <LegalList
              items={[
                <>
                  <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> — Durchführung
                  vorvertraglicher Maßnahmen und Erfüllung eines Vertrags. Das
                  betrifft alles, was zur Erstellung eines Angebots und zur
                  Abwicklung eines Auftrags nötig ist.
                </>,
                <>
                  <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> — berechtigtes
                  Interesse. Darunter fällt der technisch sichere Betrieb
                  dieser Website sowie die Beantwortung von Anfragen, die
                  keinen Vertragsbezug haben.
                </>,
                <>
                  <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> — Erfüllung
                  gesetzlicher Pflichten, insbesondere handels- und
                  steuerrechtlicher Aufbewahrungspflichten.
                </>,
              ]}
            />
          </div>

          <LegalProse className="mt-6">
            <p>
              Eine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO holen wir
              derzeit an keiner Stelle ein, weil diese Website keine
              einwilligungspflichtigen Dienste einsetzt.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('hosting')}>
          <LegalProse>
            <p>
              Diese Website wird bei einem externen Dienstleister gehostet.
              Beim Aufruf einer Seite verarbeitet dieser Anbieter in unserem
              Auftrag die Daten, die Ihr Browser technisch übermittelt.
            </p>
          </LegalProse>

          {/* TODO (Kunde/Projekt, CLAUDE.md 6 und 12): Hosting ist noch nicht
              entschieden — Vercel, Hetzner oder IONOS. Vor dem Livegang hier
              eintragen: Firmierung und Anschrift des Anbieters, Serverstandort,
              und der Hinweis auf den Auftragsverarbeitungsvertrag. Bei einem
              Anbieter mit US-Bezug zusätzlich: Rechtsgrundlage der Übermittlung
              (Angemessenheitsbeschluss / Standardvertragsklauseln). */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Hosting-Anbieter">
                <Pending>Anbieter und Anschrift — noch offen</Pending>
              </DataRow>

              <DataRow term="Serverstandort">
                <Pending>Standort — noch offen</Pending>
              </DataRow>

              <DataRow term="Auftragsverarbeitung">
                <Pending>AV-Vertrag nach Art. 28 DSGVO — noch offen</Pending>
              </DataRow>
            </DataCard>
          </div>

          <LegalProse className="mt-6">
            <p>
              Rechtsgrundlage ist unser berechtigtes Interesse an einer sicher
              und zuverlässig bereitgestellten Website nach Art. 6 Abs. 1
              lit. f DSGVO. Mit dem Anbieter schließen wir einen Vertrag über
              die Auftragsverarbeitung nach Art. 28 DSGVO.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('logfiles')}>
          <LegalProse>
            <p>
              Bei jedem Aufruf dieser Website erhebt der Server automatisch
              Daten, die Ihr Browser übermittelt. Diese Daten werden nicht mit
              anderen Datenquellen zusammengeführt und dienen nicht dazu, Sie
              persönlich zu identifizieren.
            </p>
          </LegalProse>

          {/* TODO (Projekt): Der tatsächliche Umfang der Logfiles hängt vom
              Hoster ab und ist erst nach dessen Auswahl belegbar. Die Liste
              unten ist der branchenübliche Umfang und muss gegen die
              tatsächliche Konfiguration geprüft werden — nicht ungeprüft
              übernehmen. Ebenso die Löschfrist. */}
          <div className="mt-5">
            <LegalList
              items={[
                'aufgerufene Seite oder Datei',
                'Datum und Uhrzeit des Abrufs',
                'übertragene Datenmenge und Meldung über den Abrufstatus',
                'verwendeter Browsertyp und dessen Version',
                'Betriebssystem des zugreifenden Systems',
                'IP-Adresse in gekürzter oder vollständiger Form',
              ]}
            />
          </div>

          <LegalProse className="mt-6">
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser
              berechtigtes Interesse liegt im technischen Betrieb, in der
              Fehleranalyse und in der Abwehr von Angriffen.
            </p>
          </LegalProse>

          <div className="mt-6">
            <DataCard>
              <DataRow term="Umfang der Protokollierung">
                <Pending>Gegen Hoster-Konfiguration prüfen</Pending>
              </DataRow>

              <DataRow term="Speicherdauer der Logfiles">
                <Pending>Frist in Tagen — noch offen</Pending>
              </DataRow>
            </DataCard>
          </div>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('verschluesselung')}>
          <LegalProse>
            <p>
              Diese Website wird über eine verschlüsselte Verbindung
              ausgeliefert (TLS). Sie erkennen das an der Adresszeile Ihres
              Browsers, die mit <strong>https://</strong> beginnt. Damit sind
              die Daten, die Sie an uns übermitteln — insbesondere über das
              Anfrageformular — auf dem Transportweg vor dem Mitlesen durch
              Dritte geschützt.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('kontakt')}>
          {/* Anker `formular` ist die Zieladresse für den Consent-Link im
              Angebotsformular (components/sections/quote-form/steps.tsx).
              TODO: dort `/datenschutz#formular` statt `/datenschutz` setzen,
              sobald diese Seite freigegeben ist. */}
          <LegalSubsection id="formular" title="Angebotsformular">
            <LegalProse>
              <p>
                Wenn Sie uns über das Angebotsformular eine Anfrage schicken,
                verarbeiten wir die Angaben, die Sie dort machen, um Ihre
                Anfrage zu beantworten und Ihnen ein Angebot zu erstellen.
              </p>
              <p>Verarbeitet werden:</p>
            </LegalProse>

            <div className="mt-5">
              <LegalList
                items={[
                  <>
                    <strong>Angaben zum Objekt</strong> — gewünschte
                    Leistungen, Häufigkeit, Art des Objekts, Postleitzahl
                    sowie, falls angegeben, Ort und Größe der Flächen.
                  </>,
                  <>
                    <strong>Kontaktdaten</strong> — Name, E-Mail-Adresse und
                    Telefonnummer, damit wir Ihnen antworten können, sowie,
                    falls angegeben, der Name Ihres Unternehmens.
                  </>,
                  <>
                    <strong>Ihre Nachricht</strong>, sofern Sie das
                    Nachrichtenfeld ausfüllen.
                  </>,
                ]}
              />
            </div>

            <LegalProse className="mt-6">
              <p>
                Pflichtfelder sind als solche gekennzeichnet. Die Postleitzahl
                brauchen wir, um zu prüfen, ob das Objekt in unserem
                Einsatzgebiet liegt; die vollständige Anschrift fragen wir
                bewusst nicht ab, sondern erst dann, wenn tatsächlich ein
                Termin zustande kommt.
              </p>
              <p>
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, da die
                Verarbeitung der Durchführung vorvertraglicher Maßnahmen
                dient. Betrifft Ihre Anfrage keinen möglichen Vertrag, ist
                Rechtsgrundlage unser berechtigtes Interesse an der
                Beantwortung von Anfragen nach Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p>
                Die Bestätigung, die Sie im Formular setzen, ist eine
                Kenntnisnahme dieser Erklärung und keine Einwilligung nach
                Art. 6 Abs. 1 lit. a DSGVO. Das Formular setzt keine Cookies,
                bindet kein Captcha eines Drittanbieters ein und überträgt
                keine Daten an Werbenetzwerke.
              </p>
            </LegalProse>

            {/* TODO (Kunde/Projekt): Der Versandweg des Formulars steht noch
                nicht fest — siehe den DELIVERY-Block in
                app/api/anfrage/route.ts. Sobald der Dienst gewählt ist, hier
                eintragen: Firmierung, Anschrift, AV-Vertrag und, falls der
                Anbieter außerhalb der EU verarbeitet, die Rechtsgrundlage der
                Übermittlung. */}
            <div className="mt-6">
              <DataCard>
                <DataRow term="Zustellung der Anfrage">
                  <Pending>Mail-Dienstleister — noch offen</Pending>
                </DataRow>

                <DataRow term="Auftragsverarbeitung">
                  <Pending>AV-Vertrag nach Art. 28 DSGVO — noch offen</Pending>
                </DataRow>
              </DataCard>
            </div>
          </LegalSubsection>

          <LegalSubsection title="Telefon">
            <LegalProse>
              <p>
                Wenn Sie uns anrufen, verarbeiten wir Ihre Telefonnummer sowie
                die Angaben, die Sie uns im Gespräch machen, um Ihr Anliegen
                zu bearbeiten. Gespräche werden nicht aufgezeichnet.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO,
                andernfalls Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </LegalProse>
          </LegalSubsection>

          <LegalSubsection title="E-Mail">
            <LegalProse>
              <p>
                Wenn Sie uns eine E-Mail schreiben, verarbeiten wir Ihre
                E-Mail-Adresse und den Inhalt Ihrer Nachricht einschließlich
                etwaiger Anhänge, um Ihr Anliegen zu bearbeiten.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO,
                andernfalls Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p>
                Bitte beachten Sie: Eine unverschlüsselt versendete E-Mail
                kann auf dem Übertragungsweg grundsätzlich von Dritten
                mitgelesen werden. Für vertrauliche Angaben nutzen Sie daher
                besser das Telefon.
              </p>
            </LegalProse>
          </LegalSubsection>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('empfaenger')}>
          <LegalProse>
            <p>
              Ihre Daten werden innerhalb unseres Unternehmens nur an die
              Personen weitergegeben, die sie zur Bearbeitung Ihrer Anfrage
              oder zur Ausführung eines Auftrags benötigen.
            </p>
            <p>
              Darüber hinaus geben wir Daten an Dienstleister weiter, die für
              uns als Auftragsverarbeiter nach Art. 28 DSGVO tätig sind — das
              sind der Hosting-Anbieter und der Dienst, über den die
              Formularanfragen zugestellt werden. Beide sind vertraglich an
              unsere Weisungen gebunden.
            </p>
            <p>
              Wir verkaufen keine Daten und geben sie nicht zu Werbezwecken an
              Dritte weiter. Eine Weitergabe an Behörden erfolgt nur, soweit
              wir dazu gesetzlich verpflichtet sind.
            </p>
          </LegalProse>

          {/* TODO (Projekt): Sobald Hosting und Mailversand feststehen, hier
              eine abschließende Liste der Auftragsverarbeiter mit Firmierung
              und Zweck ergänzen. Eine allgemeine Beschreibung reicht für die
              Informationspflicht nach Art. 13 Abs. 1 lit. e DSGVO nicht aus. */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Auftragsverarbeiter">
                <Pending>Abschließende Liste — noch offen</Pending>
              </DataRow>
            </DataCard>
          </div>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('speicherdauer')}>
          <LegalProse>
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie es für
              den jeweiligen Zweck erforderlich ist oder wie es gesetzliche
              Aufbewahrungspflichten vorschreiben. Danach werden die Daten
              gelöscht.
            </p>
          </LegalProse>

          {/* TODO (Kunde): Alle drei Fristen sind noch nicht festgelegt und
              dürfen nicht geschätzt werden. Sie müssen zu der Praxis passen,
              die im Postfach tatsächlich gelebt wird — die Erklärung darf
              nichts versprechen, was organisatorisch nicht eingehalten wird.
              Zu berücksichtigen: § 257 HGB und § 147 AO für alles, was zu
              einem Auftrag geführt hat. */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Anfragen ohne Auftrag">
                <Pending>Frist — noch offen</Pending>
              </DataRow>

              <DataRow term="Anfragen mit Auftrag">
                <Pending>Frist nach § 257 HGB / § 147 AO — noch offen</Pending>
              </DataRow>

              <DataRow term="Server-Logfiles">
                <Pending>Frist — noch offen, siehe Abschnitt 04</Pending>
              </DataRow>
            </DataCard>
          </div>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('drittdienste')}>
          <LegalProse>
            <p>
              Diese Website setzt <strong>keine Cookies</strong>, die nicht
              technisch notwendig sind, und verwendet weder Analyse- noch
              Tracking-Werkzeuge. Es gibt kein Nutzerprofil, kein
              Werbe-Pixel und keine Reichweitenmessung. Aus demselben Grund
              benötigt diese Seite kein Einwilligungsbanner.
            </p>
            <p>
              Die verwendeten Schriften werden von unserem eigenen Server
              ausgeliefert. Es besteht dadurch keine Verbindung zu Servern
              Dritter, und Ihre IP-Adresse wird zu diesem Zweck nicht an
              Dritte übertragen.
            </p>
            <p>
              Es sind keine Karten-, Video- oder Social-Media-Dienste
              eingebunden.
            </p>
          </LegalProse>

          {/* TODO (Projekt): Dieser Abschnitt ist eine Tatsachenbehauptung über
              den Code und muss bei jeder Änderung mitgeprüft werden. Sobald
              Analytics, eine Karte, ein Captcha oder ein WhatsApp-Link dazu
              kommt (CLAUDE.md 12), braucht der Dienst hier einen eigenen
              Abschnitt mit Zweck, Anbieter, Rechtsgrundlage und Speicherdauer
              — und ggf. ein Consent-Banner. */}
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('rechte')}>
          <LegalProse>
            <p>
              Sie haben als betroffene Person jederzeit die folgenden Rechte
              uns gegenüber:
            </p>
          </LegalProse>

          <div className="mt-5">
            <LegalList
              items={[
                <>
                  <strong>Auskunft</strong> (Art. 15 DSGVO) — darüber, ob und
                  welche Daten wir zu Ihnen verarbeiten.
                </>,
                <>
                  <strong>Berichtigung</strong> (Art. 16 DSGVO) — unrichtige
                  Daten müssen wir korrigieren, unvollständige ergänzen.
                </>,
                <>
                  <strong>Löschung</strong> (Art. 17 DSGVO) — soweit keine
                  Aufbewahrungspflicht entgegensteht.
                </>,
                <>
                  <strong>Einschränkung der Verarbeitung</strong> (Art. 18
                  DSGVO).
                </>,
                <>
                  <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) —
                  Herausgabe Ihrer Daten in einem gängigen, maschinenlesbaren
                  Format.
                </>,
                <>
                  <strong>Widerspruch</strong> (Art. 21 DSGVO) — gegen
                  Verarbeitungen, die wir auf ein berechtigtes Interesse
                  stützen.
                </>,
              ]}
            />
          </div>

          <LegalProse className="mt-6">
            <p>
              Für die Ausübung dieser Rechte genügt eine formlose Nachricht an
              die unter{' '}
              <LegalLink href="#verantwortlicher">
                Verantwortlicher
              </LegalLink>{' '}
              genannten Kontaktdaten. Die Ausübung ist für Sie kostenlos.
            </p>
            <p>
              <strong>Hinweis zum Widerspruchsrecht:</strong> Verarbeiten wir
              Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO, können Sie
              der Verarbeitung aus Gründen widersprechen, die sich aus Ihrer
              besonderen Situation ergeben. Wir verarbeiten die Daten dann
              nicht mehr, es sei denn, wir können zwingende schutzwürdige
              Gründe nachweisen, die Ihre Interessen überwiegen, oder die
              Verarbeitung dient der Geltendmachung oder Verteidigung von
              Rechtsansprüchen.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('beschwerde')}>
          <LegalProse>
            <p>
              Unabhängig von den vorgenannten Rechten haben Sie nach Art. 77
              DSGVO das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung
              Ihrer Daten gegen die DSGVO verstößt.
            </p>
            <p>
              Für uns als Unternehmen mit Sitz in {company.address.city} ist
              das die Aufsichtsbehörde des Landes Nordrhein-Westfalen:
            </p>
          </LegalProse>

          {/* TODO (vor Freigabe): Anschrift und Kontaktdaten der LDI NRW noch
              einmal gegen die Website der Behörde prüfen — Behördenadressen
              ändern sich, und eine falsche Angabe hier läuft der
              Informationspflicht aus Art. 13 DSGVO zuwider. */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Aufsichtsbehörde">
                <address className="not-italic">
                  <span className="block font-medium">
                    Landesbeauftragte für Datenschutz und Informationsfreiheit
                    Nordrhein-Westfalen
                  </span>
                  <span className="block">Kavalleriestraße 2 – 4</span>
                  <span className="block">40213 Düsseldorf</span>
                </address>
              </DataRow>
            </DataCard>
          </div>

          <LegalProse className="mt-6">
            <p>
              Sie können sich auch an die Aufsichtsbehörde Ihres
              gewöhnlichen Aufenthaltsorts oder Ihres Arbeitsplatzes wenden.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('aenderungen')}>
          <LegalProse>
            <p>
              Wir passen diese Datenschutzerklärung an, sobald sich die
              Verarbeitung auf dieser Website ändert — etwa weil ein neuer
              Dienst hinzukommt — oder sich die Rechtslage ändert. Es gilt
              jeweils die hier veröffentlichte Fassung.
            </p>
            <p>
              Das{' '}
              <LegalLink href="/impressum">Impressum</LegalLink> mit den
              vollständigen Angaben zum Anbieter finden Sie auf einer eigenen
              Seite.
            </p>
          </LegalProse>

          {/* TODO (vor Freigabe): Stand-Datum ergänzen, sobald der Text
              anwaltlich geprüft und final ist. Bewusst kein Platzhalter-Datum —
              ein erfundenes "Stand" ist schlechter als gar keines. */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Stand">
                <Pending>Datum bei Freigabe eintragen</Pending>
              </DataRow>
            </DataCard>
          </div>
        </LegalSection>
      </LegalBody>
    </LegalPage>
  );
}
