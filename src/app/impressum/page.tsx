/* ==========================================================================

   ██  ENTWURF — NICHT FREIGEGEBEN  ██

   DIESER TEXT IST EIN ENTWURF UND MUSS VOR DEM LIVEGANG ANWALTLICH GEPRÜFT
   WERDEN.

   Er ist nach bestem Wissen aus den vom Kunden gelieferten Daten und den
   Vorgaben in CLAUDE.md 2 und 3 gesetzt, ersetzt aber keine Rechtsberatung.
   Ein unvollständiges oder falsches Impressum ist abmahnfähig (§ 5 DDG,
   § 5a UWG).

   Offen und vor der Freigabe zu klären:
     - USt-IdNr. (§ 27a UStG) liegt noch nicht vor  →  rendert "Angabe folgt"
     - Versicherer und räumlicher Geltungsbereich der Betriebshaftpflicht
       fehlen                                       →  rendert "Angabe folgt"
     - Aufsichtsbehörde / Gewerbeanmeldung: prüfen, ob für das konkrete
       Leistungsspektrum eine Angabe nach § 5 Abs. 1 Nr. 3 DDG nötig ist
       (Handwerksrolle Gebäudereiniger-Handwerk?) — noch nicht mit dem
       Kunden geklärt, deshalb hier bewusst NICHT behauptet.

   ========================================================================== */

import type { Metadata } from 'next';

import {
  DataCard,
  DataRow,
  ExternalValue,
  LegalBody,
  LegalHeader,
  LegalPage,
  LegalProse,
  LegalSection,
  Pending,
  createSectionIndex,
} from '@/components/legal';
import { PENDING_LABEL, company } from '@/config/company';

export const metadata: Metadata = {
  title: 'Impressum',
  description: `Anbieterkennzeichnung nach § 5 DDG für ${company.legalName}, ${company.address.oneLine}.`,
};

/**
 * Section order follows the sequence a reader — and a Prüfer — expects in a
 * German imprint: who, how to reach them, under which registration, then the
 * tax, insurance and editorial statements, then consumer arbitration.
 */
const sections = createSectionIndex([
  { id: 'anbieter', title: 'Angaben gemäß § 5 DDG' },
  { id: 'kontakt', title: 'Kontakt' },
  { id: 'register', title: 'Registereintrag' },
  { id: 'umsatzsteuer', title: 'Umsatzsteuer-Identifikationsnummer' },
  { id: 'versicherung', title: 'Betriebshaftpflichtversicherung' },
  { id: 'redaktion', title: 'Redaktionell verantwortlich' },
  { id: 'streitschlichtung', title: 'EU-Streitschlichtung' },
] as const);

/**
 * /impressum
 *
 * Every value on this page comes from `config/company.ts` (CLAUDE.md 2). The
 * imprint and the Google Business Profile have to carry byte-identical NAP
 * data, and the only way to guarantee that is to never type an address twice.
 *
 * The heading says DDG, not TMG: the Telemediengesetz was replaced by the
 * Digitale-Dienste-Gesetz on 14.05.2024. The text the client supplied still
 * cited § 5 TMG — that citation is outdated and is corrected here.
 *
 * Server component, no client JavaScript.
 */
export default function ImpressumPage() {
  const { address, registry, liabilityInsurance, editorialResponsible } =
    company;

  return (
    <LegalPage>
      <LegalHeader
        eyebrow="Rechtliches"
        title="Impressum"
        lead="Anbieterkennzeichnung nach § 5 Digitale-Dienste-Gesetz (DDG) und Angabe der nach § 18 Abs. 2 MStV verantwortlichen Person."
      />

      <LegalBody>
        <LegalSection {...sections.get('anbieter')}>
          <LegalProse>
            <p>Anbieter dieser Website ist:</p>
          </LegalProse>

          <div className="mt-6">
            <DataCard>
              <DataRow term="Anbieter">
                {/* <address> is the semantically correct element for the
                    contact details of the page's owner. Reset to upright —
                    browsers italicise it by default. */}
                <address className="not-italic">
                  <span className="block font-medium">{company.legalName}</span>
                  <span className="block">{address.street}</span>
                  <span className="block">
                    {address.postalCode} {address.city}
                  </span>
                  <span className="block">{address.country}</span>
                </address>
              </DataRow>

              <DataRow term="Vertreten durch">
                {company.managingDirector.name}, Geschäftsführer,{' '}
                {company.managingDirector.representation}
              </DataRow>
            </DataCard>
          </div>
        </LegalSection>

        <LegalSection {...sections.get('kontakt')}>
          <DataCard>
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
        </LegalSection>

        <LegalSection {...sections.get('register')}>
          <DataCard>
            <DataRow term="Registergericht">{registry.court}</DataRow>
            <DataRow term="Registernummer">{registry.number}</DataRow>
            <DataRow term="Sitz der Gesellschaft">{registry.seat}</DataRow>
            <DataRow term="Stammkapital">{registry.shareCapital}</DataRow>
          </DataCard>
        </LegalSection>

        <LegalSection {...sections.get('umsatzsteuer')}>
          <LegalProse>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a
              Umsatzsteuergesetz:
            </p>
          </LegalProse>

          {/* TODO (Kunde): USt-IdNr. liegt noch nicht vor (CLAUDE.md 12).
              Sobald sie da ist, `registry.vatId` in config/company.ts setzen —
              dieser Block schaltet dann automatisch um. Nicht erfinden. */}
          <p className="mt-5">
            {registry.vatId ? (
              <span data-numeric="" className="text-body text-ink">
                {registry.vatId}
              </span>
            ) : (
              <Pending>{PENDING_LABEL}</Pending>
            )}
          </p>
        </LegalSection>

        <LegalSection {...sections.get('versicherung')}>
          <DataCard>
            {/* One row, not two: `coverage` in company.ts already reads
                "10 Mio. € Deckungssumme", so splitting it across a
                "Deckungssumme" label would print the word twice. */}
            <DataRow term="Art und Umfang">
              {liabilityInsurance.type} mit {liabilityInsurance.coverage}
            </DataRow>

            {/* TODO (Kunde): Versicherer und räumlicher Geltungsbereich fehlen
                (CLAUDE.md 2 und 12). In config/company.ts nachtragen. */}
            <DataRow term="Versicherer">
              {liabilityInsurance.insurer ?? <Pending>{PENDING_LABEL}</Pending>}
            </DataRow>

            <DataRow term="Räumlicher Geltungsbereich">
              {liabilityInsurance.scope ?? <Pending>{PENDING_LABEL}</Pending>}
            </DataRow>
          </DataCard>
        </LegalSection>

        <LegalSection {...sections.get('redaktion')}>
          <LegalProse>
            <p>
              Verantwortlich für den redaktionellen Inhalt nach § 18 Abs. 2
              des Medienstaatsvertrags (MStV):
            </p>
          </LegalProse>

          <div className="mt-6">
            <DataCard>
              <DataRow term="Verantwortlich">
                <address className="not-italic">
                  <span className="block font-medium">
                    {editorialResponsible.name}
                  </span>
                  <span className="block">
                    {editorialResponsible.address.street}
                  </span>
                  <span className="block">
                    {editorialResponsible.address.postalCode}{' '}
                    {editorialResponsible.address.city}
                  </span>
                </address>
              </DataRow>
            </DataCard>
          </div>
        </LegalSection>

        <LegalSection {...sections.get('streitschlichtung')}>
          <LegalProse>
            <p>
              Wir sind nicht verpflichtet und nicht bereit, an einem
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>

            {/* Bewusst KEIN Link zur OS-Plattform (CLAUDE.md 3): die
                Europäische Kommission hat sie im Juli 2025 eingestellt, der
                früher übliche Verweis geht seitdem ins Leere. */}
            <p>
              Die Online-Streitbeilegungsplattform der Europäischen Kommission
              wurde im Juli 2025 eingestellt. Ein Verweis darauf entfällt
              deshalb.
            </p>
          </LegalProse>
        </LegalSection>
      </LegalBody>
    </LegalPage>
  );
}
