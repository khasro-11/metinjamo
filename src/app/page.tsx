import {
  Advantages,
  ContactChannels,
  Faq,
  FinalCta,
  Hero,
  ProcessSteps,
  QuoteFormSection,
  ServicesBento,
  TrustBar,
} from '@/components/sections';
import { LocalBusinessJsonLd } from '@/components/seo';

// Section order follows CLAUDE.md 7.
//
// TODO: "Referenzen / Kundenstimmen" (section 8) is deliberately absent — it
// goes between ContactChannels and Faq, and only once real, released reference
// objects and real customer quotes exist (CLAUDE.md 8 and 12). Inventing them
// is a section 5 UWG problem, not just a copy problem.
export default function Home() {
  return (
    <main>
      {/* ProfessionalService + Service graph. The FAQPage node ships from the
          Faq section itself, next to the copy it describes. */}
      <LocalBusinessJsonLd />

      <Hero />
      <TrustBar />
      <ServicesBento />
      <ProcessSteps />
      <Advantages />
      <QuoteFormSection />
      <ContactChannels />
      <Faq />
      <FinalCta />
    </main>
  );
}
