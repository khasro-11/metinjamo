/* ==========================================================================

   ██  ENTWURF — NICHT FREIGEGEBEN  ██

   DIESER TEXT IST EIN ENTWURF UND MUSS VOR DEM LIVEGANG ANWALTLICH GEPRÜFT
   WERDEN.

   Es ist ein GERÜST: die Struktur stimmt, die Rechtsgrundlagen sind benannt,
   aber überall dort, wo ein konkreter Dienst oder eine konkrete Frist stehen
   muss, steht sichtbar <Pending>. Jede dieser Stellen ist ein Launch-Blocker.
   Die Seite darf nicht live gehen, solange auch nur eine davon übrig ist.

   Konkret noch zu klären (CLAUDE.md 6 und 12):
     - Cloudflare ist vollständig: Firmierung, Anschrift, Art der
       Bereitstellung, Auftragsverarbeitung und Rechtsgrundlage der
       US-Übermittlung stehen in Abschnitt 03 und 07, belegt gegen das Data
       Processing Addendum. Hier ist nichts mehr offen — Begründung der
       Formulierungen im Kommentar bei Abschnitt 03.
     - Umfang und Löschfrist der Server-Logfiles — aus den tatsächlichen
       Cloudflare-Einstellungen übernehmen, Abschnitt 04
     - Welche technisch notwendigen Cookies Cloudflare tatsächlich setzt —
       nach dem ersten produktiven Deploy im Browser prüfen, Abschnitt 09
     - Brevo: der Versandweg steht in Abschnitt 06 und 07. Offen sind die
       Vertragsentität, ihre Anschrift, der Verarbeitungsort und der AVV nach
       Art. 28 DSGVO. Diese Angaben werden NICHT geschätzt: Brevo tritt je
       nach Vertrag über eine deutsche oder eine französische Gesellschaft
       auf, und eine falsche Firmierung an dieser Stelle ist selbst ein
       Verstoß. Sie sind dem unterzeichneten Vertrag zu entnehmen. Schritt
       für Schritt in docs/brevo.md, Abschnitt 5.
     - Aufbewahrungsfristen: Anfragen ohne Auftrag vs. Handels- und
       steuerrechtliche Pflichten (§ 257 HGB, § 147 AO)
     - Stand-Datum dieser Erklärung, sobald der Text final ist
     - Datenschutzbeauftragter: nur zu benennen, wenn i.d.R. mind. 20
       Personen ständig mit automatisierter Verarbeitung befasst sind
       (§ 38 BDSG). Mitarbeiterzahl liegt noch nicht vor — deshalb hier
       bewusst KEINE Aussage.

   Bewusst NICHT enthalten, weil die Dienste nicht laufen: Analytics,
   Google Fonts, Google Maps, Social Plugins, WhatsApp. Kommt einer davon
   dazu, braucht er hier einen eigenen Abschnitt mit Zweck, Anbieter,
   Rechtsgrundlage und Speicherdauer.

   Zum Einwilligungsbanner (Abschnitt 09): es läuft seit der Einrichtung des
   Consent-Managers (lib/consent.ts). Technisch NOTWENDIG ist es derzeit
   nicht — die Seite setzt keine einwilligungspflichtigen Cookies und bindet
   keinen Drittdienst ein —, es ist eine Entscheidung des Kunden. Abschnitt 09
   sagt deshalb ausdrücklich, dass aktuell kein externer Dienst eingebunden
   ist. Diese Aussage ist eine Tatsachenbehauptung über den Code und muss
   fallen, sobald der erste Dienst hinter `hasConsent('extern')` scharf
   geschaltet wird.

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
import { BreadcrumbJsonLd } from '@/components/seo';
import { company } from '@/config/company';
import { routeMetadata } from '@/config/seo';
import { CONSENT_STORAGE_KEY } from '@/lib/consent';

const PAGE_TITLE = 'Datenschutzerklärung';
const PAGE_DESCRIPTION = `Wie ${company.legalName} personenbezogene Daten auf dieser Website verarbeitet: Verantwortlicher, Server-Logfiles, Kontaktaufnahme, Speicherdauer und Ihre Rechte nach der DSGVO.`;

/* Per-route canonical and Open Graph URL. See the note in impressum/page.tsx. */
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  ...routeMetadata({
    path: '/datenschutz',
    // The tab label gets the brand from the title template. Open Graph does
    // not, so the brand is spelled out for the shared link.
    title: `${PAGE_TITLE} | ${company.shortName}`,
    description: PAGE_DESCRIPTION,
  }),
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
      <BreadcrumbJsonLd trail={[{ name: PAGE_TITLE }]} />
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
              Diese Website wird von <strong>Cloudflare</strong> bereitgestellt.
              Beim Aufruf einer Seite verarbeitet Cloudflare in unserem Auftrag
              die Daten, die Ihr Browser technisch übermittelt — darunter Ihre
              IP-Adresse, ohne die keine Verbindung zustande käme.
            </p>
            <p>
              Cloudflare betreibt ein weltweit verteiltes Netz von
              Rechenzentren. Die Seite läuft als Programm in diesem Netz
              (Cloudflare Workers) und nicht auf einem einzelnen, festen
              Server; Ihre Anfrage wird an dem Standort bearbeitet, der
              verkehrstechnisch am nächsten liegt. Es gibt deshalb
              <strong> keinen einzelnen Serverstandort</strong>, den wir hier
              nennen könnten. Bei einem Aufruf aus Deutschland ist es
              üblicherweise ein europäischer Standort — technisch zugesichert
              ist das jedoch nicht.
            </p>
            <p>
              Anbieter ist die <strong>Cloudflare, Inc.</strong> mit Sitz in den
              USA. Ihre Daten können damit den Europäischen Wirtschaftsraum
              verlassen. Grundlage dieser Übermittlung sind die
              <strong> Standardvertragsklauseln der EU-Kommission</strong> nach
              Art. 46 Abs. 2 lit. c DSGVO.
            </p>
            <p>
              Der Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO
              liegt vor: Cloudflare führt ihn als <em>Data Processing
              Addendum</em> und macht ihn zum Bestandteil seiner
              Vertragsbedingungen. Er gilt damit mit dem Vertragsschluss, und
              die Standardvertragsklauseln sind darin enthalten.
            </p>
          </LegalProse>

          {/* Belegt am 28.09.2026 gegen das Data Processing Addendum von
              Cloudflare (cloudflare.com/cloudflare-customer-dpa/):

              - Annex 1 benennt als Datenimporteur "Cloudflare, Inc.,
                101 Townsend Street, San Francisco, CA 94107, USA". Eine
                abweichende EU-Gesellschaft für Kunden aus dem EWR sieht der
                DPA nicht vor — deshalb steht hier nur diese eine Firmierung.
              - Der DPA ist Bestandteil der Self-Serve Subscription Agreement
                und der Enterprise Terms. Er gilt also mit dem Vertragsschluss;
                ein gesondert unterzeichneter AVV ist nicht erforderlich. Damit
                ist Art. 28 DSGVO erfüllt und an dieser Stelle nichts offen.
              - Für Kunden, die Verantwortliche sind, bindet der DPA Modul Zwei
                der EU-Standardvertragsklauseln ein (Controller-to-Processor).

              Warum als Rechtsgrundlage die Standardvertragsklauseln stehen und
              NICHT der Angemessenheitsbeschluss: Cloudflare ist zusätzlich nach
              dem EU-US Data Privacy Framework zertifiziert (Teilnehmer 5666).
              Eine Zertifizierung kann aber auslaufen oder zurückgezogen werden,
              und dann wäre die Angabe hier falsch, ohne dass es jemand merkt —
              die Rezertifizierung war zuletzt zum 23.09.2026 fällig. Die
              SCC-Angabe ist unabhängig davon dauerhaft wahr, weil sie
              vertraglich gilt. Wer den Angemessenheitsbeschluss nach Art. 45
              DSGVO zusätzlich nennen will, muss vorher den Live-Status prüfen
              (dataprivacyframework.gov, Teilnehmer 5666) und die Angabe danach
              gepflegt halten. Nötig ist das nicht: die SCC tragen die
              Übermittlung allein.

              Unterauftragsverarbeiter von Cloudflare sind unter
              cloudflare.com/gdpr/subprocessors/ veröffentlicht. Bei der
              anwaltlichen Prüfung gegenlesen, ob sie in Abschnitt 07
              aufzuführen sind. */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Hosting-Anbieter">
                Cloudflare, Inc., 101 Townsend Street, San Francisco,
                CA 94107, USA
              </DataRow>

              <DataRow term="Art der Bereitstellung">
                Cloudflare Workers — Ausführung im weltweiten Cloudflare-Netz
              </DataRow>

              <DataRow term="Serverstandort">
                Kein fester Standort; Auslieferung aus dem verkehrstechnisch
                nächstgelegenen Rechenzentrum
              </DataRow>

              <DataRow term="Auftragsverarbeitung">
                Data Processing Addendum von Cloudflare, Bestandteil der
                Vertragsbedingungen (Art. 28 DSGVO)
              </DataRow>

              <DataRow term="Drittlandübermittlung">
                USA — auf Grundlage der EU-Standardvertragsklauseln nach
                Art. 46 Abs. 2 lit. c DSGVO
              </DataRow>
            </DataCard>
          </div>

          <LegalProse className="mt-6">
            <p>
              Rechtsgrundlage ist unser berechtigtes Interesse an einer sicher
              und zuverlässig bereitgestellten Website nach Art. 6 Abs. 1
              lit. f DSGVO.
            </p>
          </LegalProse>
        </LegalSection>

        {/* ---------------------------------------------------------------- */}
        <LegalSection {...sections.get('logfiles')}>
          <LegalProse>
            <p>
              Bei jedem Aufruf dieser Website werden automatisch Daten
              erhoben, die Ihr Browser übermittelt. Diese Daten werden nicht
              mit anderen Datenquellen zusammengeführt und dienen nicht dazu,
              Sie persönlich zu identifizieren.
            </p>
            <p>
              Die Protokollierung findet bei Cloudflare statt, weil dort die
              Verbindung Ihres Browsers endet (Abschnitt 03). Für unsere
              Serverroute — die Route, die eine Formularanfrage annimmt — haben
              wir zusätzlich die Protokollfunktion von Cloudflare aktiviert, um
              einen technischen Fehler beim Versand überhaupt bemerken zu
              können. In diese Protokolle schreiben wir bewusst <strong>keine
              Inhalte aus dem Formular</strong>: keinen Namen, keine Anschrift,
              keine Telefonnummer und keinen Nachrichtentext.
            </p>
          </LegalProse>

          {/* Der Satz zur eigenen Protokollierung ist eine Tatsachenbehauptung
              über zwei Dateien: "observability" in wrangler.jsonc schaltet die
              Workers Logs ein, und app/api/anfrage/route.ts entscheidet, was
              dort hineingeschrieben wird. Beide sind so gebaut, dass keine
              personenbezogene Angabe in einer Logzeile landet — auch Adressen
              in Fehlermeldungen des Mailanbieters werden vorher ersetzt. Wird
              dort eine Logzeile ergänzt, ist dieser Absatz mitzuprüfen.

              TODO (Projekt): Die Liste unten ist der branchenübliche Umfang und
              muss gegen die tatsächliche Cloudflare-Konfiguration geprüft
              werden — nicht ungeprüft übernehmen. Ebenso die Löschfrist: sie
              hängt am Tarif und an den Einstellungen des Kontos, nicht am
              Code. */}
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
              <DataRow term="Ort der Protokollierung">
                Cloudflare-Netz, kein fester Standort (Abschnitt 03)
              </DataRow>

              <DataRow term="Umfang der Protokollierung">
                <Pending>Gegen die Cloudflare-Konfiguration prüfen</Pending>
              </DataRow>

              <DataRow term="Speicherdauer der Logfiles">
                <Pending>
                  Frist in Tagen — aus den Cloudflare-Einstellungen übernehmen
                </Pending>
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
              <p>
                Damit die Anfrage unser Postfach erreicht, setzen wir den
                Dienst <strong>Brevo</strong> als Auftragsverarbeiter ein.
                Der Dienst wird ausschließlich von unserem Server aus
                angesprochen: <strong>Ihr Gerät baut zu ihm keine Verbindung
                auf</strong>, Ihre IP-Adresse wird ihm nicht übermittelt, und
                es wird zu diesem Zweck nichts in Ihrem Browser gespeichert.
                Übermittelt werden ausschließlich die Angaben, die Sie im
                Formular gemacht haben. Eine automatische Bestätigungsmail
                versenden wir nicht.
              </p>
              <p>
                Firmierung, Sitz und Verarbeitungsort des Anbieters tragen wir
                hier ein, sobald der Auftragsverarbeitungsvertrag geschlossen
                ist — siehe die Übersicht im Anschluss. Bis dahin steht an
                diesen Stellen bewusst ein Hinweis und keine Vermutung.
              </p>
              <p>
                Gegen automatisierte Massenzuschriften prüfen wir beim
                Absenden, ob ein für Sie unsichtbares Feld ausgefüllt wurde und
                wie lange das Formular geöffnet war, und begrenzen die Zahl der
                Anfragen pro Anschluss. Dazu speichern wir für höchstens zehn
                Minuten einen nicht zurückrechenbaren Prüfwert Ihrer
                IP-Adresse im Arbeitsspeicher — die Adresse selbst wird dabei
                nicht gespeichert. Rechtsgrundlage ist unser berechtigtes
                Interesse an der Funktionsfähigkeit des Formulars nach
                Art. 6 Abs. 1 lit. f DSGVO. Ein Captcha eines Drittanbieters
                setzen wir dafür nicht ein.
              </p>
            </LegalProse>

            {/* TODO (Kunde): AVV mit Brevo abschließen (Art. 28 DSGVO) und
                danach die vier <Pending>-Zeilen unten aus dem unterzeichneten
                Vertrag füllen.

                Hier stehen absichtlich KEINE Vorschlagswerte. Brevo tritt je
                nach Vertrag über eine deutsche oder eine französische
                Gesellschaft auf; welche unser Vertragspartner ist, ergibt sich
                erst aus dem Vertrag. Der Anbieter gibt die EU als
                Verarbeitungsort an — bestätigt der Vertrag das, entfällt die
                Zeile zur Drittlandübermittlung ersatzlos, und dann ist auch
                Abschnitt 07 entsprechend zu kürzen. Steht dort etwas anderes,
                braucht es eine Grundlage nach Art. 44 ff. DSGVO.

                Eine falsche Angabe an dieser Stelle ist selbst ein Verstoß.
                Anleitung: docs/brevo.md, Abschnitt 5. */}
            <div className="mt-6">
              <DataCard>
                <DataRow term="Zustellung der Anfrage">
                  Brevo — aufgerufen von unserem Server, nicht von Ihrem
                  Gerät
                </DataRow>

                <DataRow term="Firmierung und Sitz">
                  <Pending>Vertragsentität aus dem AV-Vertrag</Pending>
                </DataRow>

                <DataRow term="Anschrift des Anbieters">
                  <Pending>Aus dem AV-Vertrag zu übernehmen</Pending>
                </DataRow>

                <DataRow term="Auftragsverarbeitung">
                  <Pending>AV-Vertrag nach Art. 28 DSGVO — noch offen</Pending>
                </DataRow>

                <DataRow term="Ort der Verarbeitung">
                  <Pending>Aus dem AV-Vertrag zu übernehmen</Pending>
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
              sind der Hosting-Anbieter und Brevo, der Dienst, über den die
              Formularanfragen zugestellt werden (Abschnitt 06). Beide sind
              vertraglich an unsere Weisungen gebunden.
            </p>
            <p>
              Wir verkaufen keine Daten und geben sie nicht zu Werbezwecken an
              Dritte weiter. Eine Weitergabe an Behörden erfolgt nur, soweit
              wir dazu gesetzlich verpflichtet sind.
            </p>
          </LegalProse>

          {/* TODO (Projekt): Eine allgemeine Beschreibung reicht für die
              Informationspflicht nach Art. 13 Abs. 1 lit. e DSGVO nicht aus.
              Die Hosting-Zeile trägt jetzt eine Firmierung; abschließend ist
              die Liste erst, wenn auch die Zeile zum Mailversand eine trägt —
              siehe Abschnitt 06. */}
          <div className="mt-6">
            <DataCard>
              <DataRow term="Hosting">
                Cloudflare, Inc., San Francisco, USA — Bereitstellung der
                Website, Verarbeitung im weltweiten Netz (Abschnitt 03)
              </DataRow>

              <DataRow term="Zustellung der Formularanfragen">
                <Pending>Brevo — Vertragsentität und Verarbeitungsort aus dem
                AV-Vertrag</Pending>
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
              Werbe-Pixel und keine Reichweitenmessung.
            </p>
            <p>
              Technisch notwendige Cookies kann unser Hosting-Anbieter setzen,
              um automatisierte Zugriffe von echten Besuchern zu unterscheiden
              und die Website vor Überlastung zu schützen (Abschnitt 03). Sie
              dienen keiner Analyse und keiner Werbung, und sie sind nach
              § 25 Abs. 2 TDDDG nicht einwilligungspflichtig.
            </p>
            <p>
              Beim ersten Besuch fragen wir Sie über einen Hinweis am unteren
              Bildschirmrand, ob externe Inhalte geladen werden dürfen. Das
              betrifft Dienste, die von fremden Servern ausgeliefert werden —
              etwa eine Karte zur Anfahrt oder ein Messenger-Kontakt —, bei
              denen Ihre IP-Adresse an den jeweiligen Anbieter übertragen
              würde. <strong>Derzeit ist kein solcher Dienst eingebunden</strong>;
              Ihre Entscheidung greift, sobald einer hinzukommt. Bis dahin
              überträgt Ihr Gerät unabhängig von Ihrer Auswahl nichts an
              Dritte. Die Zustellung Ihrer Formularanfrage läuft über einen
              Dienstleister, der ausschließlich von unserem Server aus
              angesprochen wird und mit dem Ihr Browser keinen Kontakt hat —
              deshalb ist dafür keine Einwilligung erforderlich
              (Abschnitt 06).
            </p>
            <p>
              Ihre Auswahl speichern wir ausschließlich lokal in Ihrem Browser
              (<span data-numeric="">localStorage</span>, Schlüssel{' '}
              <span data-numeric="">{CONSENT_STORAGE_KEY}</span>). Diese
              Speicherung ist nach § 25 Abs. 2 TDDDG unbedingt erforderlich, um
              Ihren Widerspruch überhaupt merken zu können, und wird deshalb
              nicht von Ihrer Einwilligung abhängig gemacht. Die Angabe
              verlässt Ihr Gerät nicht und erreicht unseren Server nicht.
            </p>
            <p>
              Sie können Ihre Entscheidung jederzeit ändern oder zurücknehmen —
              über <strong>Cookie-Einstellungen</strong> im Fußbereich jeder
              Seite. Rechtsgrundlage für das Laden externer Inhalte wäre Ihre
              Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit
              § 25 Abs. 1 TDDDG.
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
              — und ggf. ein Consent-Banner.

              TODO (Projekt): Nach dem ersten produktiven Deploy im Browser
              nachsehen, welche Cookies Cloudflare tatsächlich setzt — bei
              aktiver Bot-Abwehr typischerweise __cf_bm — und sie im Absatz
              oben namentlich nennen, mit Zweck und Laufzeit. Setzt Cloudflare
              keines, gehört der Absatz gestrichen: eine Angabe über Cookies,
              die es nicht gibt, ist genauso falsch wie eine fehlende. */}
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
