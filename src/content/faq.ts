/**
 * The landing-page FAQ, as data.
 *
 * One source for two consumers: the accordion in `sections/faq.tsx` and the
 * `FAQPage` JSON-LD emitted next to it (CLAUDE.md 9). Google requires the
 * structured answer to match the answer a visitor actually sees, so these
 * strings must never be paraphrased on the way into the markup — which is why
 * they are plain strings here and not JSX.
 *
 * Deliberately free of React, like `content/services.ts`.
 *
 * ## Rules that shaped the wording
 *
 * - Every answer is written from scratch. Nothing is lifted from a competitor
 *   page, and no sentence is a rewrite of one (CLAUDE.md 5.6).
 * - No invented facts. Where the client has not confirmed something — contract
 *   terms, the insurer, how winter call-outs are documented — the answer
 *   describes the process we control and a TODO marks what is still missing.
 *   An invented commitment here is a section 5 UWG problem, not a copy problem.
 * - Never "24/7", never "deutschlandweit" (CLAUDE.md 2).
 * - Sie-Form, sachlich. An FAQ that sells is not an FAQ.
 *
 * ## Order
 *
 * Editorial, following the questions a Hausverwaltung asks in sequence: what
 * do you do, will you do it our way, how do we start, what are we signing —
 * and only then the where, the when, and the two risk questions that decide
 * the contract.
 */

import { company } from '@/config/company';
import { serviceCategories } from '@/content/services';

export interface FaqItem {
  /** Phrased as the visitor would ask it, not as a headline. */
  readonly question: string;
  /** Plain text. Rendered verbatim and emitted verbatim as JSON-LD. */
  readonly answer: string;
}

export const faqItems: readonly FaqItem[] = [
  {
    question: 'Welche Leistungen übernehmen Sie?',
    // Built from the catalogue rather than typed out, so this answer cannot
    // fall behind content/services.ts. It ships as FAQPage JSON-LD as well as
    // visible copy, and a stale list here would put services into the search
    // result that the page no longer offers.
    //
    // Category names only. Naming all eighteen individual services would make
    // this the longest answer in the FAQ by a wide margin and bury the second
    // sentence, which is the one that actually answers what a Verwalter is
    // asking. The individual services are one scroll away, in the bento.
    answer: `${serviceCategories
      .map((category) => category.category)
      .join(', ')}. Dahinter stehen achtzehn einzelne Leistungen, die Sie auf der Seite unter „Leistungen“ im Detail sehen. In den meisten Objekten ist es nicht eine einzelne davon, sondern eine Kombination aus zwei oder drei, die in einem gemeinsamen Leistungsverzeichnis zusammenlaufen.`,
  },
  {
    question: 'Können wir den Leistungsumfang auf unser Objekt zuschneiden?',
    answer:
      'Ja, und das ist bei uns der Normalfall. Wir arbeiten nicht mit fertigen Paketen, sondern nehmen den Bedarf bei der Besichtigung auf: Flächen, Zugänge, Turnus, Besonderheiten. Ein Treppenhaus mit sechs Parteien braucht einen anderen Rhythmus als ein Bürohaus mit Publikumsverkehr. Daraus entsteht das Leistungsverzeichnis, und abgerechnet wird, was darin steht.',
  },
  {
    question: 'Wie läuft eine Anfrage bei Ihnen ab?',
    // Mirrors the four steps in sections/process-steps.tsx. If that section
    // changes, this answer changes with it — two different descriptions of the
    // same process is the kind of drift an FAQ is supposed to prevent.
    //
    // TODO (client, CLAUDE.md 8): "die Besichtigung ist kostenlos und
    // unverbindlich" is a binding commitment, not a description, and it is NOT
    // confirmed. It appears in exactly two places — here and in step 2 of
    // sections/process-steps.tsx — and this answer additionally ships as
    // FAQPage JSON-LD, so a wrong version of it also lands in the search
    // result. Both occurrences change together or neither does.
    answer:
      'In vier Schritten. Sie stellen die Anfrage über das Formular oder telefonisch. Wir sehen uns das Objekt an und nehmen den Bedarf vor Ort auf; die Besichtigung ist kostenlos und unverbindlich. Danach bekommen Sie ein schriftliches Angebot mit Leistungsverzeichnis und festem Preis. Sagen Sie zu, legen wir zum vereinbarten Termin los, und Sie haben einen festen Ansprechpartner.',
  },
  {
    question: 'Wie lange sind wir vertraglich gebunden?',
    // TODO (client): minimum term, notice period and any trial arrangement are
    // NOT confirmed. This answer therefore commits only to something we
    // control — that the term is written into the offer before signature — and
    // states no figure. Replace with the real terms once they exist; do not
    // guess at "drei Monate" or "jederzeit kündbar".
    answer:
      'Laufzeit und Kündigungsfrist stehen im Angebot, nicht im Kleingedruckten. Sie sehen beides, bevor Sie unterschreiben, und wir sprechen sie bei der Besichtigung durch. Wir binden niemanden länger, als es für die Planung der Einsätze nötig ist — was das für Ihr Objekt konkret heißt, hängt vom Leistungsumfang ab und steht dann schwarz auf weiß im Angebot.',
  },
  {
    question: 'In welchem Gebiet sind Sie im Einsatz?',
    answer: `Unser Sitz ist ${company.address.city}, unser Einsatzgebiet ist ${company.serviceArea.primary}. ${company.serviceArea.note} Ob Ihr Objekt dazugehört, klärt ein kurzer Anruf schneller als eine Postleitzahlenliste — fragen Sie einfach an.`,
  },
  {
    question: 'Sind Sie auch außerhalb der Geschäftszeiten erreichbar?',
    // CLAUDE.md 2, verbatim in substance: NO "24/7-Notfallservice". The two
    // named cases and the channel are the whole claim, and the limit is stated
    // in the same answer rather than left to the reader.
    answer:
      'Regulär erreichen Sie uns montags bis freitags von 07:00 bis 18:00 Uhr, samstags nach Absprache. Akutfälle wie ein Wasserschaden oder ein kurzfristiger Winterdiensteinsatz richten sich nicht nach Geschäftszeiten — dafür erreichen Sie uns auch außerhalb dieser Zeiten telefonisch. Einen Rund-um-die-Uhr-Service über alle Leistungen hinweg bieten wir bewusst nicht an, weil wir ihn nicht in jeder Nacht zuverlässig halten könnten.',
  },
  {
    question: 'Wie sind Sie versichert?',
    // TODO (client, CLAUDE.md 12): insurer and scope are still null in
    // company.ts. Until they arrive the answer names the coverage sum, which
    // is confirmed, and says how the proof is delivered — it does not name a
    // policy that has not been shown to us.
    answer: `Wir haben eine ${company.liabilityInsurance.type} mit ${company.liabilityInsurance.coverage}. Für eine Hausverwaltung ist das selten die spannendste Frage, aber es ist die, die gegenüber der Eigentümergemeinschaft belegt werden muss. Den Nachweis reichen wir zum Angebot mit, sodass Sie ihn zu den Unterlagen legen können, bevor der erste Einsatz stattfindet.`,
  },
  {
    question: 'Übernehmen Sie im Winter auch die Räum- und Streupflicht?',
    // Legally the Räum- und Streupflicht sits with the Eigentümer / the
    // municipality's Satzung and can be transferred by contract. This answer
    // says that and points at the contract; it does not give legal advice and
    // it does not claim the duty simply "moves" to us.
    // TODO (client): confirm how call-outs are documented per event — see the
    // Winterdienst TODO in content/services.ts. A Verwalter needs that record
    // exactly when a claim is made, and naming the artefact here is worth more
    // than the promise.
    answer:
      'Wir übernehmen den Winterdienst: Räumen und Streuen der vereinbarten Flächen und Wege. Die Räum- und Streupflicht selbst liegt zunächst beim Eigentümer beziehungsweise ergibt sich aus der Satzung der Gemeinde; sie kann vertraglich auf einen Dienstleister übertragen werden. Was genau übertragen wird — welche Flächen, in welchem Zeitfenster, ab welcher Schneehöhe — gehört ausdrücklich in den Vertrag, und genau das legen wir vorher gemeinsam fest.',
  },
];
