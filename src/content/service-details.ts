/**
 * The editorial content of the `/leistungen/[slug]` detail pages.
 *
 * `services.ts` answers "what do we sell" in two sentences — enough for a
 * bento tile, a footer link and a form option. This module answers the four
 * questions a Hausverwaltung actually has before it asks for a quote: what is
 * in it, for which kind of property, how does it run, and what usually goes
 * with it. Kept separate from the catalogue for the same reason the catalogue
 * is kept free of React: the eight short benefit lines are reviewed as a set,
 * these eight long texts are reviewed one at a time.
 *
 * ## The rule every string here follows
 *
 * Each page is written from scratch for its own service. No sentence is a
 * find-and-replace of another page's sentence, no section is filled by pattern
 * — the number of scope items, property types and workflow steps differs per
 * service because the services differ. Eight pages built from one template
 * with the noun swapped is duplicate content in the sense Google means it and
 * a bad read in the sense a customer means it (CLAUDE.md 9).
 *
 * Nothing here is a city landing page. There is one service area, it is named
 * in `company.serviceArea`, and it appears once per page. Doorway pages for
 * Moers, Oberhausen and Mülheim are explicitly out (CLAUDE.md 9).
 *
 * No invented facts. Where the client has not confirmed a commercial or
 * operational detail, the sentence describes the process we control and a
 * TODO marks what is still open. Legal references (§ 39 BNatSchG on hedge
 * cutting periods, the delegable-but-not-transferable nature of the winter
 * clearing duty) are statements of general law, not claims about this company.
 *
 * ## TODO (client, CLAUDE.md 12)
 *
 * Every page here depends on the catalogue in `services.ts` being confirmed
 * first — reviewing these texts before the offering is signed off is reviewing
 * the wrong thing. Beyond that, writing them surfaced these open questions.
 * Each is phrased in the copy so that nothing is claimed either way; answering
 * them makes the pages more concrete, not merely more correct.
 *
 * - Unterhaltsreinigung: werden Verbrauchsmaterialien (Seife, Papier)
 *   gestellt und nachgefüllt — immer, als Option, oder gar nicht?
 * - Glasreinigung: welche Höhenzugangstechnik steht zur Verfügung, und wo
 *   liegt die tatsächliche Grenze der Erreichbarkeit?
 * - Grünpflege: ist der Abtransport des Grünschnitts eingepreist oder wird er
 *   getrennt abgerechnet?
 * - Winterdienst: welche Zeitfenster werden vertraglich zugesagt, in welcher
 *   Form wird dokumentiert (Papier, Foto, digital), und bis wann werden
 *   Saisonverträge angenommen?
 * - Hausmeisterservice: wo verläuft die Grenze zwischen Kleinreparatur und
 *   Fachgewerk, wie wird Material abgerechnet, und wie ist die
 *   Schlüsselverwahrung geregelt?
 * - Entrümpelung: wird ein Entsorgungsnachweis ausgestellt, und wird
 *   Verwertbares auf den Preis angerechnet?
 * - Bauendreinigung: werden Baugrob- und Zwischenreinigung überhaupt
 *   angeboten? Der Text grenzt sie derzeit als eigene Leistung ab.
 */

import type { ServiceSlug } from './services';

/** A named block of the "was ist enthalten" list. */
export interface ServiceScopeItem {
  readonly title: string;
  /**
   * One to three sentences. Several of these deliberately state a boundary —
   * what is *not* included and where it belongs instead. A scope list that
   * only adds is a scope list the customer cannot trust.
   */
  readonly body: string;
}

/** One kind of property the service is written for. */
export interface ServicePropertyType {
  readonly title: string;
  readonly body: string;
}

/** One step of the service's own execution sequence. */
export interface ServiceWorkflowStep {
  readonly title: string;
  readonly body: string;
}

/**
 * A cross-link, with the reason it is a cross-link. The reason is written per
 * pair rather than pulled from the target's `benefit`: "warum das zusammen
 * gehört" is a different statement than "was das ist", and reusing the benefit
 * line on eight pages would be the duplicate content this module exists to
 * avoid.
 */
export interface RelatedService {
  readonly slug: ServiceSlug;
  readonly reason: string;
}

export interface ServiceDetail {
  /** H1. A statement about the service, never a repeat of `service.name`. */
  readonly headline: string;
  /** The hero paragraph. Says why the service is the way it is. */
  readonly lead: string;
  /**
   * How the service is normally engaged — the third row of the hero card.
   * Short noun phrase, no promise: "Fester Turnus", not "ab 14-tägig".
   */
  readonly engagement: string;
  /** Sentence above the scope list. Frames what the list is and is not. */
  readonly scopeIntro: string;
  readonly scope: readonly ServiceScopeItem[];
  readonly propertyTypesIntro: string;
  readonly propertyTypes: readonly ServicePropertyType[];
  readonly workflow: readonly ServiceWorkflowStep[];
  readonly related: readonly RelatedService[];
  /** Closing CTA copy. Names this service, not "unsere Leistungen". */
  readonly ctaBody: string;
  /** <title>, before the layout template appends the company name. */
  readonly metaTitle: string;
  /** <meta name="description">. Unique per page, ~150 characters. */
  readonly metaDescription: string;
}

/**
 * Total over `ServiceSlug`: a service added to the catalogue fails to compile
 * until it has a page's worth of copy, which is the point — a link in the
 * footer that resolves to an empty detail page is worse than no link.
 */
export const serviceDetails: Record<ServiceSlug, ServiceDetail> = {
  /* ---------------------------------------------------------------------- */

  unterhaltsreinigung: {
    headline: 'Unterhaltsreinigung für Objekte, die täglich benutzt werden.',
    lead: 'Die laufende Reinigung ist selten anspruchsvoll und fast immer der Grund, warum eine Verwaltung den Dienstleister wechselt: Sie muss jede Woche stattfinden, in derselben Qualität, ohne Erinnerung. Wir übernehmen sie im vereinbarten Turnus mit einem festen Team, das Ihr Gebäude kennt.',
    engagement: 'Fester Turnus, laufender Vertrag',
    scopeIntro:
      'Der Umfang wird bei der Besichtigung festgelegt und steht danach im Leistungsverzeichnis. Abgerechnet wird, was darin steht — nicht mehr, aber auch nicht weniger.',
    scope: [
      {
        title: 'Böden und Verkehrsflächen',
        body: 'Kehren sowie Feucht- und Nassreinigung von Fluren, Eingangsbereichen und Treppen, abgestimmt auf den Belag. Feinsteinzeug, Linoleum und geöltes Holz vertragen nicht dasselbe Verfahren, und der falsche Reiniger ist auf Dauer teurer als die Reinigung.',
      },
      {
        title: 'Sanitärbereiche',
        body: 'Reinigung und Desinfektion von Becken, WC und Armaturen, dazu Spiegel und Fliesenspiegel. Ob wir auch die Verbrauchsmaterialien nachfüllen und stellen, wird gesondert vereinbart.',
      },
      {
        title: 'Handkontaktflächen',
        body: 'Türklinken, Handläufe, Lichtschalter, Klingeltableau und Briefkastenanlage. Der Teil der Reinigung, der niemandem auffällt, solange er stattfindet.',
      },
      {
        title: 'Küchen und Teeküchen',
        body: 'Arbeitsflächen, Spülen, Fronten und Geräte von außen. Die Innenreinigung von Kühlschrank, Backofen oder Mikrowelle ist ein eigener Posten und kein stillschweigender Bestandteil des Turnus.',
      },
      {
        title: 'Abfallbehälter in den gereinigten Bereichen',
        body: 'Leeren und Beutelwechsel. Das Bereitstellen der großen Tonnen zur Abholung gehört dagegen zum Hausmeisterservice — es ist eine Termin-, keine Reinigungsleistung.',
      },
    ],
    propertyTypesIntro:
      'Der Turnus richtet sich nach der Nutzung, nicht nach der Quadratmeterzahl. Diese vier Fälle sehen wir am häufigsten.',
    propertyTypes: [
      {
        title: 'Wohnanlagen und WEG',
        body: 'Gemeinschaftsflächen, für die die Verwaltung gegenüber Eigentümern begründen können muss, was wann gemacht wurde.',
      },
      {
        title: 'Büro- und Verwaltungsgebäude',
        body: 'Flächen mit festen Arbeitszeiten. Gereinigt wird davor oder danach, damit niemand über einen Wischmopp steigen muss.',
      },
      {
        title: 'Praxen und Kanzleien',
        body: 'Viel Publikumsverkehr auf kleiner Fläche. Hier entscheidet die Frequenz über das Ergebnis, nicht der Umfang der einzelnen Runde.',
      },
      {
        title: 'Gewerbeeinheiten im Bestand',
        body: 'Ladenlokale und kleine Betriebe, für die sich eine eigene Reinigungskraft nicht rechnet.',
      },
    ],
    workflow: [
      {
        title: 'Flächen aufnehmen',
        body: 'Wir gehen das Objekt ab und notieren Beläge, Zugänge, Wasser- und Stromanschlüsse sowie den Schlüsselweg. Ohne diese Runde ist jeder Preis geraten.',
      },
      {
        title: 'Leistungsverzeichnis und Turnus',
        body: 'Jede Fläche bekommt eine Frequenz — manche wöchentlich, manche monatlich. Daraus entsteht ein Plan, den Sie gegenlesen, bevor jemand anfängt.',
      },
      {
        title: 'Team einweisen',
        body: 'Dieselben Personen übernehmen das Objekt dauerhaft und werden vor Ort eingewiesen, nicht per Zettel. Wechselnde Kräfte sind der häufigste Grund für schwankende Qualität.',
      },
      {
        title: 'Laufender Betrieb',
        body: 'Die Runden laufen nach Plan. Was dabei auffällt — ein defektes Treppenhauslicht, eine offene Kellertür, ein tropfender Hahn — melden wir Ihnen, statt daran vorbeizuwischen.',
      },
    ],
    related: [
      {
        slug: 'treppenhausreinigung',
        reason:
          'Im Mehrfamilienhaus ist das Treppenhaus meist der Bereich, um den es zuerst geht. Er läuft häufig im selben Turnus mit.',
      },
      {
        slug: 'glasreinigung',
        reason:
          'Fenster und Glastüren brauchen ein anderes Intervall als Böden und stehen deshalb als eigener Posten im Verzeichnis.',
      },
      {
        slug: 'hausmeisterservice',
        reason:
          'Für alles, was keine Reinigung ist: Kontrollgänge, Tonnen, Kleinreparaturen, Ansprechpartner vor Ort.',
      },
    ],
    ctaBody:
      'Sagen Sie uns, um welches Objekt es geht und in welchem Rhythmus Sie sich die Reinigung vorstellen. Den Rest nehmen wir bei der Besichtigung auf.',
    metaTitle: 'Unterhaltsreinigung in Duisburg',
    metaDescription:
      'Laufende Unterhaltsreinigung für Wohnanlagen, Büros und Gewerbe in Duisburg und Umgebung: fester Turnus, festes Team, Leistungsverzeichnis statt Pauschale.',
  },

  /* ---------------------------------------------------------------------- */

  treppenhausreinigung: {
    headline: 'Treppenhausreinigung im festen Rhythmus.',
    lead: 'Das Treppenhaus ist die Fläche, die alle Parteien teilen und niemand freiwillig übernimmt. Es ist deshalb der häufigste Beschwerdegrund in der Verwaltung — und die Leistung, die sich am einfachsten aus der Hand geben lässt.',
    engagement: 'Wöchentlich oder vierzehntägig',
    scopeIntro:
      'Ein Aufgang besteht aus mehr als Stufen. Was zur Runde gehört, wird vorher festgelegt, damit später nicht über den Kellerabgang diskutiert wird.',
    scope: [
      {
        title: 'Treppenläufe und Podeste',
        body: 'Kehren und Feuchtreinigung einschließlich Stufenkanten, Ecken und der Fläche unter dem Handlauf — dort liegt der Schmutz, den ein flüchtiger Durchgang stehen lässt.',
      },
      {
        title: 'Handläufe und Geländer',
        body: 'Feucht abgewischt. Das ist die Fläche im Haus, die jede Partei mehrmals täglich anfasst.',
      },
      {
        title: 'Hauseingang und Windfang',
        body: 'Eingangstür, Sauberlaufzone und der Bereich, in dem sich Laub, Streugut und Werbung sammeln.',
      },
      {
        title: 'Kellerabgang und Nebenflächen',
        body: 'Waschküche, Trockenraum und Fahrradkeller, sofern sie im Verzeichnis stehen. Diese Flächen laufen meist in einem längeren Intervall als der Aufgang selbst — sie werden seltener benutzt und schmutzen langsamer.',
      },
      {
        title: 'Verglasung im Aufgang',
        body: 'Treppenhausfenster und Glasbausteine gehören zur Glas- und Rahmenreinigung und werden separat und in eigenem Intervall beauftragt. Wir führen sie hier auf, weil sie sonst regelmäßig stillschweigend erwartet werden.',
      },
    ],
    propertyTypesIntro:
      'Entscheidend ist, wie viele Personen den Aufgang benutzen und wofür.',
    propertyTypes: [
      {
        title: 'Mehrfamilienhäuser im Bestand',
        body: 'Der Regelfall: ein Aufgang, ein Kellerabgang, eine überschaubare Zahl von Parteien.',
      },
      {
        title: 'WEG-Anlagen mit mehreren Aufgängen',
        body: 'Mehrere gleichartige Häuser, ein Leistungsverzeichnis, ein Ansprechpartner — statt einer Kehrwoche, an die sich die Hälfte nicht hält.',
      },
      {
        title: 'Gemischt genutzte Häuser',
        body: 'Gewerbe im Erdgeschoss, Wohnungen darüber. Der Aufgang wird deutlich stärker frequentiert und braucht in der Regel einen kürzeren Turnus.',
      },
    ],
    workflow: [
      {
        title: 'Aufgang begehen',
        body: 'Vom Dachboden bis in den Keller, mit Notiz zu Belägen, Etagenzahl, Zugängen und der Frage, wo Wasser entnommen werden kann.',
      },
      {
        title: 'Turnus festlegen',
        body: 'Wöchentlich, vierzehntägig oder in eigenem Rhythmus für Keller und Nebenflächen. Der Takt folgt der Parteienzahl und der Nutzung, nicht einer Pauschale.',
      },
      {
        title: 'Feste Runde, feste Person',
        body: 'Der Aufgang wird immer von derselben Kraft übernommen. Wer ein Haus kennt, sieht Abweichungen — eine neue Kraft sieht nur Stufen.',
      },
    ],
    related: [
      {
        slug: 'unterhaltsreinigung',
        reason:
          'Wenn außer dem Aufgang weitere Gemeinschaftsflächen dazukommen, laufen beide Leistungen in einem Verzeichnis zusammen.',
      },
      {
        slug: 'glasreinigung',
        reason:
          'Die Fenster im Treppenhaus sind ausdrücklich nicht Teil der Aufgangsreinigung und werden hier beauftragt.',
      },
      {
        slug: 'winterdienst',
        reason:
          'Ab November kommt die Fläche vor dem Aufgang dazu. Räumen und Reinigen lassen sich in einer Runde verbinden.',
      },
    ],
    ctaBody:
      'Nennen Sie uns Adresse, Etagenzahl und den gewünschten Turnus — für ein Treppenhaus reicht das meist schon, um einen Besichtigungstermin zu machen.',
    metaTitle: 'Treppenhausreinigung in Duisburg',
    metaDescription:
      'Treppenhausreinigung für Mehrfamilienhäuser und WEG-Anlagen in Duisburg und Umgebung: fester Turnus, feste Reinigungskraft, klar abgegrenzter Umfang.',
  },

  /* ---------------------------------------------------------------------- */

  glasreinigung: {
    headline: 'Glas, Rahmen und Falz — nicht nur die Scheibe.',
    lead: 'Eine Fensterreinigung, die nur das Glas erfasst, sieht zwei Wochen lang gut aus. Der Schmutz sitzt im Rahmen und in der Falz, und beim nächsten Regen läuft er wieder über die Scheibe. Deshalb ist der Rahmen bei uns kein Zusatz, sondern Teil der Leistung.',
    engagement: 'Einzeltermin oder festes Intervall',
    scopeIntro:
      'Der Preis entsteht aus der Zahl und Art der Elemente, nicht aus der Quadratmeterzahl der Fassade. Erfasst wird:',
    scope: [
      {
        title: 'Glasflächen innen und außen',
        body: 'Beidseitige Reinigung, sofern beide Seiten zugänglich sind. Wo nur die Innenseite erreichbar ist, sagen wir das vor dem Angebot.',
      },
      {
        title: 'Rahmen, Falze und Dichtungen',
        body: 'Der Bereich, in dem sich Staub, Pollen und Insekten sammeln. Wird er ausgelassen, hält das Ergebnis nur bis zum ersten Regen.',
      },
      {
        title: 'Fensterbänke',
        body: 'Innen- und Außenbänke im selben Durchgang, weil sie sonst der sichtbarste Rest der Reinigung sind.',
      },
      {
        title: 'Glastüren und Eingangsanlagen',
        body: 'Türen mit Publikumsverkehr sammeln in Tagen, was ein Fenster in Monaten sammelt. Sie bekommen in der Regel ein eigenes, kürzeres Intervall.',
      },
      {
        title: 'Erreichbarkeit',
        body: 'Was ohne Hubarbeitsbühne, Gerüst oder Seilzugangstechnik erreichbar ist, klären wir vor dem Angebot. Ist eine Fläche nicht darunter, sagen wir es, statt sie stillschweigend einzupreisen.',
      },
    ],
    propertyTypesIntro:
      'Der Turnus hängt weniger vom Gebäude ab als von der Lage: eine Straßenfront an einer Hauptverkehrsachse schmutzt in einem anderen Tempo als ein Hoffenster.',
    propertyTypes: [
      {
        title: 'Wohnanlagen',
        body: 'Treppenhausverglasung, Haustüren und die Fenster der Gemeinschaftsflächen. Wohnungsfenster nur, wenn die Eigentümer das gemeinsam beauftragen.',
      },
      {
        title: 'Ladenlokale und Schaufenster',
        body: 'Die Fläche, über die ein Geschäft beurteilt wird, bevor jemand hineingeht. Meist mehrmals im Monat.',
      },
      {
        title: 'Büro- und Praxisräume',
        body: 'Größere Elementzahlen bei gleichem Fenstertyp. Hier ist die Terminabstimmung mit den Nutzern der aufwendigere Teil.',
      },
    ],
    workflow: [
      {
        title: 'Elemente zählen',
        body: 'Wir erfassen die Fenster nach Art und Größe — Flügel, Festverglasung, Türen, Sprossen. Danach steht der Preis; vorher wäre er eine Schätzung.',
      },
      {
        title: 'Zugang abstimmen',
        body: 'Innen brauchen wir Termine mit den Nutzern, außen einen freien Standplatz und, je nach Höhe, eine Genehmigung für die Aufstellfläche. Beides wird vorher geklärt, nicht am Tag des Termins.',
      },
      {
        title: 'Reinigung in einem Durchgang',
        body: 'Glas, Rahmen und Bank je Element nacheinander, damit kein Element zweimal angefasst wird und keines vergessen ist.',
      },
      {
        title: 'Intervall vereinbaren',
        body: 'Nach dem ersten Durchgang wissen beide Seiten, wie schnell die Flächen zusetzen. Erst dann legen wir ein Intervall fest, statt eines zu behaupten.',
      },
    ],
    related: [
      {
        slug: 'unterhaltsreinigung',
        reason:
          'Wenn die Innenflächen ohnehin laufend gereinigt werden, lässt sich der Fenstertermin in denselben Vertrag legen.',
      },
      {
        slug: 'bauendreinigung',
        reason:
          'Nach einer Baustelle sind Folienreste und Zementschleier auf dem Glas ein eigenes Thema und gehören dorthin.',
      },
      {
        slug: 'treppenhausreinigung',
        reason:
          'Die Aufgangsreinigung endet an der Verglasung. Zusammen beauftragt, kommt beides im abgestimmten Takt.',
      },
    ],
    ctaBody:
      'Für ein belastbares Angebot brauchen wir die Zahl der Fenster und ein Bild von der Zugänglichkeit. Beides nehmen wir vor Ort auf.',
    metaTitle: 'Glas- und Rahmenreinigung in Duisburg',
    metaDescription:
      'Fenster-, Rahmen- und Glasreinigung für Wohnanlagen, Ladenlokale und Büros in Duisburg und Umgebung. Preis nach Elementen, Zugänglichkeit vorher geklärt.',
  },

  /* ---------------------------------------------------------------------- */

  gruenpflege: {
    headline: 'Außenanlagen, die über die ganze Saison gepflegt bleiben.',
    lead: 'Grünpflege lässt sich nicht sinnvoll in gleich große Monatsscheiben teilen. Im Mai wächst der Rasen doppelt so schnell wie im August, und für Hecken gelten gesetzliche Schnittzeiten. Wir arbeiten deshalb nach Wachstum innerhalb eines vereinbarten Rahmens statt nach starrem Kalender.',
    engagement: 'Saisonvertrag, Einsätze nach Wachstum',
    scopeIntro:
      'Was zur Pflege gehört, hängt an der Anlage. Diese Positionen kommen in fast jedem Pflegeplan vor.',
    scope: [
      {
        title: 'Rasenflächen',
        body: 'Mähen, Kanten abstechen, Schnittgut aufnehmen. Die Schnitthöhe richtet sich nach der Witterung — in einer Trockenperiode zu kurz gemäht, erholt sich die Fläche über Wochen nicht.',
      },
      {
        title: 'Hecken und Sträucher',
        body: 'Form- und Pflegeschnitt. Zwischen dem 1. März und dem 30. September lässt § 39 BNatSchG nur schonende Form- und Pflegeschnitte zu; ein starker Rückschnitt wird deshalb auf den Herbst gelegt und nicht aus Termingründen vorgezogen.',
      },
      {
        title: 'Wege, Zufahrten und Beläge',
        body: 'Kehren, Wildkraut aus den Fugen entfernen, Zugänge und Stellplätze freihalten. Auf versiegelten Flächen arbeiten wir mechanisch oder thermisch — der Einsatz von Herbiziden ist dort ohnehin unzulässig.',
      },
      {
        title: 'Laub',
        body: 'Im Herbst in mehreren Durchgängen statt in einem. Ein einzelner Termin trifft den richtigen Zeitpunkt nie, und nasses Laub auf einem Gehweg ist eine Haftungsfrage.',
      },
      {
        title: 'Entsorgung des Grünschnitts',
        body: 'Abtransport und ordnungsgemäße Entsorgung, wenn am Objekt keine Fläche zum Kompostieren zur Verfügung steht.',
      },
    ],
    propertyTypesIntro:
      'Ob eine Anlage einmal oder zwölfmal im Jahr angefahren wird, entscheidet weniger die Größe als die Nutzung.',
    propertyTypes: [
      {
        title: 'Wohnanlagen mit Gemeinschaftsgrün',
        body: 'Rasen, Hecke und Wege, die allen gehören und deshalb von niemandem gemacht werden.',
      },
      {
        title: 'Gewerbeobjekte mit Vorfläche',
        body: 'Parkplatz, Zufahrt und der Streifen davor. Hier ist die Fläche Teil des Auftritts und wird entsprechend häufiger angefahren.',
      },
      {
        title: 'Einzelgrundstücke',
        body: 'Eigentümer und Vermieter, die ein Grundstück nicht selbst pflegen — etwa weil sie nicht am Ort wohnen.',
      },
    ],
    workflow: [
      {
        title: 'Anlage aufnehmen',
        body: 'Flächen, Bewuchs, Baumbestand, Zugang zu Wasser und Strom sowie die Frage, wohin das Schnittgut kann.',
      },
      {
        title: 'Pflegeplan über die Saison',
        body: 'Kein fixer Kalender, sondern ein Rahmen: wie viele Mähgänge, in welchen Korridoren die Schnitte liegen, was im Herbst zusätzlich anfällt.',
      },
      {
        title: 'Einsätze nach Wachstum',
        body: 'Wir kommen innerhalb des vereinbarten Rahmens dann, wenn die Fläche es braucht. In einem nassen Frühjahr sind das mehr Termine als in einem trockenen.',
      },
      {
        title: 'Rückmeldung zum Saisonende',
        body: 'Am Ende steht, was tatsächlich gemacht wurde und was für die nächste Saison ansteht — ein abgängiger Strauch, eine Wurzel im Weg, eine Fläche, die dauerhaft zu nass ist.',
      },
    ],
    related: [
      {
        slug: 'winterdienst',
        reason:
          'Dieselben Flächen, andere Jahreszeit. In einem Vertrag entfällt der zweite Dienstleister ab November.',
      },
      {
        slug: 'hausmeisterservice',
        reason:
          'Wenn außer dem Grün auch Kontrollgänge, Tonnen und Kleinreparaturen anfallen, gehört beides zusammen.',
      },
      {
        slug: 'unterhaltsreinigung',
        reason:
          'Innen und außen aus einer Hand — für Verwaltungen meist der Grund, überhaupt zu bündeln.',
      },
    ],
    ctaBody:
      'Sagen Sie uns, wo die Anlage liegt und was ungefähr dazugehört. Wir sehen sie uns an und schlagen einen Pflegeplan für die Saison vor.',
    metaTitle: 'Grünpflege und Außenanlagen in Duisburg',
    metaDescription:
      'Rasen, Hecken, Wege und Laub für Wohnanlagen und Gewerbeobjekte in Duisburg und Umgebung. Pflegeplan über die Saison, Einsätze nach Wachstum.',
  },

  /* ---------------------------------------------------------------------- */

  winterdienst: {
    headline: 'Winterdienst, dessen Einsätze sich belegen lassen.',
    lead: 'Die Räum- und Streupflicht liegt beim Eigentümer. Sie lässt sich vertraglich übertragen, aber nicht abgeben — wer beauftragt, bleibt zur Überwachung verpflichtet. Was ein Winterdienst deshalb liefern muss, ist nicht nur eine freie Fläche, sondern ein Nachweis, dass sie zur richtigen Zeit frei war.',
    engagement: 'Saisonvertrag, vor dem ersten Frost',
    scopeIntro:
      'Welche Flächen geräumt werden, steht vor der Saison in einem Flächenplan. Was dort nicht eingezeichnet ist, wird auch nicht geräumt — das ist der Punkt, an dem Winterdienstverträge sonst auseinandergehen.',
    scope: [
      {
        title: 'Gehwege am Grundstück',
        body: 'Geräumt auf der ortsüblichen Breite, sodass zwei Personen aneinander vorbeigehen können. Welche Breite und welche Zeiten Ihre Gemeinde vorschreibt, richtet sich nach der örtlichen Straßenreinigungssatzung.',
      },
      {
        title: 'Zugänge und Hauszuwege',
        body: 'Der Weg von der Straße bis zur Haustür, dazu Zugänge zu Müllstandplatz, Tiefgarage und Nebeneingängen, soweit im Plan verzeichnet.',
      },
      {
        title: 'Stellplätze und Zufahrten',
        body: 'Sofern beauftragt. Größere Flächen werden maschinell geräumt; dafür muss auf dem Grundstück eine Fläche vereinbart sein, auf der der Schnee liegen darf.',
      },
      {
        title: 'Streuen',
        body: 'Abstumpfende Streumittel als Regelfall. Auf Gehwegen ist Streusalz in vielen Kommunen eingeschränkt oder untersagt; welche Vorgabe für Ihr Objekt gilt, klären wir vor Vertragsschluss.',
      },
      {
        title: 'Dokumentation der Einsätze',
        body: 'Jeder Einsatz wird mit Datum, Uhrzeit und Fläche festgehalten. Das ist die Unterlage, die Sie im Streitfall brauchen — nicht die Erinnerung an einen Anruf.',
      },
    ],
    propertyTypesIntro:
      'Der Bedarf entscheidet sich daran, wer bei Glätte auf der Fläche unterwegs ist.',
    propertyTypes: [
      {
        title: 'Wohnanlagen und WEG',
        body: 'Gehweg, Zuwege und Müllstandplatz. Für die Verwaltung ist der Nachweis oft wichtiger als der Räumvorgang selbst.',
      },
      {
        title: 'Gewerbeobjekte mit Kundenverkehr',
        body: 'Parkplatz, Zufahrt und Eingang müssen zu Öffnungsbeginn frei sein, nicht irgendwann am Vormittag.',
      },
      {
        title: 'Vermietete Einzelobjekte',
        body: 'Auch wenn die Pflicht im Mietvertrag auf die Mieter übertragen ist, bleibt der Eigentümer in der Kontrolle. Erfüllt sie niemand zuverlässig, fällt sie faktisch zurück.',
      },
    ],
    workflow: [
      {
        title: 'Vertrag vor der Saison',
        body: 'Der Winterdienst wird vor dem ersten Frost vereinbart, nicht beim ersten Schneefall. Wie lange wir für die kommende Saison noch Objekte aufnehmen können, sagen wir Ihnen auf Anfrage.',
      },
      {
        title: 'Flächenplan und Ablagefläche',
        body: 'Wir zeichnen die zu räumenden Flächen ein und legen fest, wohin der Schnee kommt. Ohne Ablagefläche ist eine Zufahrt nach dem dritten Schneefall nicht mehr räumbar.',
      },
      {
        title: 'Kontrolle und Einsatz',
        body: 'Bei angekündigtem Schneefall und bei Glätte innerhalb der vereinbarten Zeitfenster. Die Fenster stehen im Vertrag, damit beide Seiten dieselbe Erwartung haben.',
      },
      {
        title: 'Nachweis',
        body: 'Nach dem Einsatz wird er dokumentiert. Die Aufstellung geht an Sie und nicht erst dann, wenn jemand danach fragt.',
      },
    ],
    related: [
      {
        slug: 'gruenpflege',
        reason:
          'Dieselben Außenflächen zwischen März und Oktober. Zusammen vergeben, betreut sie über das Jahr dasselbe Team.',
      },
      {
        slug: 'hausmeisterservice',
        reason:
          'Wer ohnehin regelmäßig am Objekt ist, sieht Glätte, bevor sie gemeldet wird.',
      },
      {
        slug: 'treppenhausreinigung',
        reason:
          'Im Winter tragen die Bewohner Streugut und Nässe in den Aufgang. Beides in einer Hand spart Wege.',
      },
    ],
    ctaBody:
      'Nennen Sie uns das Objekt und die Flächen, um die es geht. Für den Winterdienst ist der frühe Termin der wichtige — geklärt wird er vor der Saison, nicht in ihr.',
    metaTitle: 'Winterdienst in Duisburg',
    metaDescription:
      'Räum- und Streudienst für Wohnanlagen, Gewerbe und Einzelobjekte in Duisburg und Umgebung. Flächenplan vor der Saison, jeder Einsatz dokumentiert.',
  },

  /* ---------------------------------------------------------------------- */

  hausmeisterservice: {
    headline: 'Ein Ansprechpartner für das, was zwischen den Gewerken liegt.',
    lead: 'Vieles an einem Gebäude ist zu klein für einen Handwerker und zu regelmäßig, um es dem Zufall zu überlassen. Genau dieser Bereich ist der Hausmeisterservice: der Teil der Objektbetreuung, für den sonst drei Firmen und vier Telefonate nötig sind.',
    engagement: 'Fester Turnus, Aufgabenliste je Objekt',
    scopeIntro:
      'Der Umfang wird als Aufgabenliste vereinbart, nicht als Sammelbegriff. Diese Liste ist später auch die Grundlage der Abrechnung.',
    scope: [
      {
        title: 'Kontrollgänge',
        body: 'Regelmäßige Begehung von Keller, Dachboden, Technikräumen, Treppenhaus und Außenflächen. Der Zweck ist, einen Schaden zu finden, bevor er gemeldet wird.',
      },
      {
        title: 'Kleinreparaturen',
        body: 'Leuchtmittel, Türschließer, klemmende Beschläge, lose Schilder, tropfende Armaturen. Was darüber hinausgeht, geben wir an das Fachgewerk ab — mit einer Beschreibung, mit der der Handwerker beim ersten Anfahren etwas anfangen kann.',
      },
      {
        title: 'Müllmanagement',
        body: 'Tonnen zur Abholung stellen und zurückholen, Standplatz sauber halten, falsch abgestellten Sperrmüll melden statt ihn stillschweigend zu entsorgen.',
      },
      {
        title: 'Ablesungen und Zählerstände',
        body: 'Turnusmäßige Ablesung und Weitergabe an die Verwaltung, in der Form, die Ihre Abrechnung braucht.',
      },
      {
        title: 'Ansprechpartner vor Ort',
        body: 'Für Mieter und für Handwerker: Termine annehmen, Zugang ermöglichen, Zustand nach dem Einsatz prüfen.',
      },
    ],
    propertyTypesIntro:
      'Der Hausmeisterservice lohnt sich dort, wo dauerhaft jemand zuständig sein muss, aber keine ganze Stelle anfällt.',
    propertyTypes: [
      {
        title: 'Wohnanlagen ohne eigenen Hausmeister',
        body: 'Objekte, in denen bisher die Verwaltung selbst oder ein hilfsbereiter Eigentümer eingesprungen ist.',
      },
      {
        title: 'Objekte in auswärtiger Verwaltung',
        body: 'Wenn die Verwaltung nicht am Ort sitzt, ist der Hausmeister das Auge vor Ort — und die Person, die einen Zustand beschreiben kann.',
      },
      {
        title: 'Gewerbeobjekte mit Technikräumen',
        body: 'Regelmäßige Sichtkontrolle von Heizung, Lüftung und Zählern. Prüfpflichtige Anlagen bleiben beim Fachbetrieb; wir kontrollieren, wir prüfen nicht.',
      },
    ],
    workflow: [
      {
        title: 'Objekt begehen und Aufgaben festhalten',
        body: 'Wir gehen das Gebäude mit Ihnen ab und schreiben auf, was zur Betreuung gehört und was ausdrücklich nicht. Die zweite Hälfte ist die wichtigere.',
      },
      {
        title: 'Turnus und Erreichbarkeit',
        body: 'Wie oft jemand am Objekt ist und über welchen Weg Sie und die Bewohner ihn erreichen. Feste Zeiten sind belastbarer als ständige Verfügbarkeit.',
      },
      {
        title: 'Laufende Betreuung',
        body: 'Die Runden laufen nach Liste. Alles darüber hinaus wird vorher abgestimmt, nicht nachträglich in Rechnung gestellt.',
      },
      {
        title: 'Rückmeldung an die Verwaltung',
        body: 'Was erledigt wurde, was aufgefallen ist und was ein Fachbetrieb übernehmen sollte — in einer Form, die Sie an Eigentümer weiterreichen können.',
      },
    ],
    related: [
      {
        slug: 'unterhaltsreinigung',
        reason:
          'Die häufigste Kombination in der Wohnungswirtschaft: eine Firma für Reinigung und Betreuung, ein Ansprechpartner.',
      },
      {
        slug: 'gruenpflege',
        reason:
          'Rasen, Hecke und Wege gehören für die meisten Objekte ohnehin zur Betreuung dazu.',
      },
      {
        slug: 'winterdienst',
        reason:
          'Im Winter die Fortsetzung derselben Zuständigkeit — mit derselben Person am Objekt.',
      },
    ],
    ctaBody:
      'Beschreiben Sie uns das Objekt und was dort regelmäßig liegen bleibt. Daraus wird bei der Besichtigung eine Aufgabenliste.',
    metaTitle: 'Hausmeisterservice in Duisburg',
    metaDescription:
      'Kontrollgänge, Kleinreparaturen, Müllmanagement und Ansprechpartner vor Ort für Wohn- und Gewerbeobjekte in Duisburg und Umgebung.',
  },

  /* ---------------------------------------------------------------------- */

  entruempelung: {
    headline: 'Geräumt, getrennt, besenrein übergeben.',
    lead: 'Eine Entrümpelung ist selten nur eine Transportfrage. Meist steht ein Termin dahinter — eine Wohnungsübergabe, ein Verkauf, eine Nachlassregelung — und der bestimmt, wie schnell es gehen muss und was am Ende belegt sein soll.',
    engagement: 'Einmalig, Festpreis nach Besichtigung',
    scopeIntro:
      'Was mitgeht und was bleibt, wird vorher festgelegt. Bei einer Haushaltsauflösung ist das der Teil, über den am meisten gesprochen wird — zu Recht.',
    scope: [
      {
        title: 'Räumung der Einheit',
        body: 'Wohnung, Keller, Dachboden, Garage oder Gewerbeeinheit, vollständig oder nach abgestimmter Liste.',
      },
      {
        title: 'Demontage',
        body: 'Einbauküche, Teppichboden, Regale, Trennwände und Lampen, wenn sie mit heraus sollen. Was mit dem Gebäude verbunden ist, wird vorher gesondert benannt.',
      },
      {
        title: 'Trennung vor dem Abtransport',
        body: 'Verwertbares, Sperrmüll, Elektroaltgeräte und schadstoffhaltige Abfälle werden getrennt. Das ist keine Sortierarbeit aus Ordnungsliebe, sondern die Voraussetzung für eine ordnungsgemäße Entsorgung.',
      },
      {
        title: 'Persönliche Unterlagen sichern',
        body: 'Dokumente, Fotos, Schlüssel und offensichtliche Wertgegenstände werden ausgesondert und Ihnen übergeben, nicht entsorgt. Bei Nachlässen ist das erfahrungsgemäß der Punkt, an dem es sonst schiefgeht.',
      },
      {
        title: 'Besenreine Übergabe',
        body: 'Die Einheit wird gekehrt und geleert übergeben, sodass die Wohnungsabnahme oder die nächste Handwerkerrunde daran anschließen kann.',
      },
    ],
    propertyTypesIntro:
      'Die Menge lässt sich aus der Ferne nicht schätzen, die Situation dagegen schon. Diese vier kommen am häufigsten vor.',
    propertyTypes: [
      {
        title: 'Wohnungen vor der Neuvermietung',
        body: 'Zeitkritisch, weil der Nachmieter meist schon feststeht und die Handwerker danach kommen.',
      },
      {
        title: 'Nachlässe und Haushaltsauflösungen',
        body: 'Oft mit mehreren Beteiligten und ohne Ortskenntnis. Hier zählt vor allem, dass nichts verschwindet, was jemand noch sucht.',
      },
      {
        title: 'Keller- und Dachbodenflächen',
        body: 'Herrenlose Abteile in Mehrfamilienhäusern, die eine Verwaltung räumen lassen muss, bevor sie neu zugeteilt werden können.',
      },
      {
        title: 'Gewerbeeinheiten und Lager',
        body: 'Ladenlokale nach der Aufgabe, Lagerflächen nach dem Umzug. Meist größere Mengen bei einfacherem Zugang.',
      },
    ],
    workflow: [
      {
        title: 'Besichtigung',
        body: 'Menge, Etage, Aufzug, Treppenbreite und Standplatz für das Fahrzeug entscheiden über den Aufwand. Ein Preis am Telefon wäre geraten.',
      },
      {
        title: 'Festpreis und Termin',
        body: 'Sie bekommen einen Preis für die vereinbarte Räumung und ein Datum. Kommt während der Räumung Unerwartetes zutage, sprechen wir darüber, bevor wir es einladen.',
      },
      {
        title: 'Räumung an einem Stück',
        body: 'In der Regel an einem Tag, damit das Treppenhaus nicht über eine Woche blockiert ist und die Nachbarn nicht dreimal ausweichen müssen.',
      },
      {
        title: 'Übergabe',
        body: 'Gemeinsamer Rundgang durch die leere Einheit. Was noch fehlt, wird sofort erledigt.',
      },
    ],
    related: [
      {
        slug: 'unterhaltsreinigung',
        reason:
          'Nach der Räumung folgt bei einer Neuvermietung meist die Grundreinigung der leeren Einheit.',
      },
      {
        slug: 'bauendreinigung',
        reason:
          'Wenn nach der Räumung noch renoviert wird, kommt die Feinreinigung erst nach dem letzten Gewerk.',
      },
      {
        slug: 'hausmeisterservice',
        reason:
          'Für Verwaltungen, die die Kellerabteile danach dauerhaft im Blick behalten wollen.',
      },
    ],
    ctaBody:
      'Sagen Sie uns, welche Einheit geräumt werden soll und bis wann. Wir sehen sie uns an und nennen einen Festpreis.',
    metaTitle: 'Entrümpelung und Haushaltsauflösung in Duisburg',
    metaDescription:
      'Wohnungen, Keller, Dachböden und Gewerbeeinheiten in Duisburg und Umgebung räumen lassen: getrennte Entsorgung, Festpreis nach Besichtigung, besenreine Übergabe.',
  },

  /* ---------------------------------------------------------------------- */

  bauendreinigung: {
    headline: 'Die Reinigung, an der die Abnahme nicht scheitern soll.',
    lead: 'Am Ende einer Baustelle steht selten ein Schmutzproblem, sondern ein Terminproblem. Die Bauendreinigung liegt zwischen dem letzten Gewerk und der Abnahme — und beide Termine verschieben sich. Wir planen deshalb nach Ihrem Bauzeitenplan und nicht nach unserem.',
    engagement: 'Projektbezogen, nach Bauzeitenplan',
    scopeIntro:
      'Gemeint ist die Feinreinigung nach dem letzten Gewerk. Baugrob- und Zwischenreinigung während der Bauphase sind eigene Leistungen und werden getrennt beauftragt.',
    scope: [
      {
        title: 'Bauschutz und Rückstände entfernen',
        body: 'Abdeckfolien, Klebebänder, Aufkleber, Etiketten, Farbspritzer und Mörtelreste auf Böden, Fliesen, Sanitärobjekten und Beschlägen.',
      },
      {
        title: 'Fenster, Rahmen und Beschläge',
        body: 'Glasreinigung einschließlich Folienresten und Zementschleier, nach dem Gerüstabbau. Danach kommt kein Gewerk mehr, das nachschmutzt — deshalb steht dieser Schritt am Ende und nicht in der Mitte.',
      },
      {
        title: 'Böden nach Belag',
        body: 'Grundreinigung und Erstpflege nach Herstellerangabe, damit die Fläche in dem Zustand übergeben wird, den die Gewährleistung voraussetzt.',
      },
      {
        title: 'Sanitär und Einbauten',
        body: 'Objekte, Armaturen, Spiegel und Einbaumöbel innen wie außen, einschließlich der Schubladen und Schränke, in die während der Bauphase Staub gefallen ist.',
      },
      {
        title: 'Feinreinigung aller Oberflächen',
        body: 'Türblätter, Zargen, Schalter, Steckdosen, Heizkörper und Sockelleisten. Der Teil, den eine Abnahme tatsächlich anfasst.',
      },
    ],
    propertyTypesIntro:
      'Der Aufwand hängt weniger an der Fläche als daran, wie viele Gewerke wie lange in dem Raum gearbeitet haben.',
    propertyTypes: [
      {
        title: 'Neubau im Wohnungsbau',
        body: 'Mehrere gleichartige Einheiten, sequenziell abgenommen. Hier zählt, dass die zuerst gereinigte Wohnung am Abnahmetag noch sauber ist.',
      },
      {
        title: 'Sanierte Bestandswohnungen',
        body: 'Einzelne Einheiten im bewohnten Haus. Treppenhaus und Nachbarwohnungen sind Teil der Aufgabe, auch wenn sie nicht Teil der Baustelle waren.',
      },
      {
        title: 'Ausgebaute Gewerbeflächen',
        body: 'Ladenlokale und Büros vor der Übergabe an den Mieter, oft mit sehr knappem Zeitfenster zwischen Fertigstellung und Eröffnung.',
      },
    ],
    workflow: [
      {
        title: 'Abstimmung mit dem Bauzeitenplan',
        body: 'Wir setzen den Termin an das Ende der Gewerkeliste, nicht an ein Datum. Verschiebt sich das letzte Gewerk, verschiebt sich die Reinigung mit.',
      },
      {
        title: 'Begehung nach dem letzten Gewerk',
        body: 'Erst wenn niemand mehr arbeitet, lässt sich der tatsächliche Aufwand sehen — insbesondere bei Böden und Glas.',
      },
      {
        title: 'Reinigung in einem Durchgang',
        body: 'Von oben nach unten und von innen nach außen, damit keine gereinigte Fläche noch einmal zugestaubt wird.',
      },
      {
        title: 'Kontrollgang vor der Abnahme',
        body: 'Wir gehen die Flächen mit Ihnen oder der Bauleitung ab, bevor der Abnahmetermin läuft. Was noch offen ist, wird sofort erledigt statt auf einen Zweittermin geschoben.',
      },
    ],
    related: [
      {
        slug: 'glasreinigung',
        reason:
          'Wenn nur das Glas betroffen ist — etwa nach einem Fenstertausch — ist die reguläre Glasreinigung der passende Auftrag.',
      },
      {
        slug: 'entruempelung',
        reason:
          'Muss vor dem Umbau erst geräumt werden, gehört das an den Anfang desselben Projekts.',
      },
      {
        slug: 'unterhaltsreinigung',
        reason:
          'Nach der Übergabe beginnt der laufende Betrieb. Viele Objekte gehen direkt in einen Turnusvertrag über.',
      },
    ],
    ctaBody:
      'Nennen Sie uns das Objekt und den geplanten Abnahmetermin. Je früher wir im Bauzeitenplan stehen, desto verlässlicher liegt der Reinigungstermin richtig.',
    metaTitle: 'Bauendreinigung in Duisburg',
    metaDescription:
      'Feinreinigung nach dem letzten Gewerk für Neubau, Sanierung und Gewerbeausbau in Duisburg und Umgebung. Termin nach Bauzeitenplan, Kontrollgang vor der Abnahme.',
  },
};

/** The detail content for a slug. Total record, so this never returns undefined. */
export function getServiceDetail(slug: ServiceSlug): ServiceDetail {
  return serviceDetails[slug];
}
