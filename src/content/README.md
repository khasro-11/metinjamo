# content

Editorial content as typed TS modules, kept out of the components so copy can
be reviewed without touching markup.

- `services.ts` — the service catalogue: five categories holding eighteen
  individual services (CLAUDE.md 7a). Single source of truth for the footer
  column, the hero chips, the Leistungen bento, the quote form and the JSON-LD
  offer catalogue. Pure data, no React: presentation (icons, bento tile sizes)
  is keyed by `ServiceCategorySlug` next to the markup that uses it.

  Categories are the addressable unit. Each carries an `anchor` that resolves
  to its bento tile on the landing page; there are deliberately no
  `/leistungen/[slug]` detail routes, and the eight that used to exist are
  redirected to those anchors in `next.config.ts`.

- `faq.ts` — the landing-page FAQ. One source for the accordion and the
  `FAQPage` JSON-LD next to it.

TODO: process steps and references land here next.
