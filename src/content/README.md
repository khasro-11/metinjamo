# content

Editorial content as typed TS modules, kept out of the components so copy can
be reviewed without touching markup.

- `services.ts` — the service catalogue. Single source of truth for the footer
  column, the hero chips, the Leistungen bento, the `/leistungen/[slug]` routes
  and the quote form. Pure data, no React: presentation (icons, bento tile
  sizes) is keyed by `ServiceSlug` next to the markup that uses it.

  **The catalogue is not client-confirmed yet** (CLAUDE.md 12). See the module
  header for the open questions.

- `service-details.ts` — the long-form copy behind each `/leistungen/[slug]`
  page: headline, lead, Leistungsumfang, Objektarten, Ablauf, verwandte
  Leistungen und die Metadaten. A total record over `ServiceSlug`, so a new
  service cannot ship a detail page without its own text. Every page is written
  from scratch; nothing here is a template with the noun swapped.

- `faq.ts` — the landing-page FAQ. One source for the accordion and the
  `FAQPage` JSON-LD next to it.

TODO: process steps and references land here next.
