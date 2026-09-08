# services

The sections of a `/leistungen/[slug]` detail page, in page order:

| Component              | Section                                              |
| ---------------------- | ---------------------------------------------------- |
| `ServiceHero`          | Breadcrumb, H1, lead, actions, fact card             |
| `ServiceScope`         | Was genau dazugehört — including the boundaries      |
| `ServicePropertyTypes` | Für welche Objektarten                               |
| `ServiceWorkflow`      | Typischer Ablauf dieser Leistung                     |
| `RelatedServices`      | Verwandte Leistungen, mit Begründung je Paar         |
| `ServiceCta`           | Abschluss-CTA zum Formular                           |

Separate from `components/sections`, which holds the landing page's sections.
The two sets share the `components/ui` primitives and the token system, but
nothing else: a detail page that reused the landing page's bento and rail would
read as the landing page with different words.

All six are server components. Copy comes from `content/service-details.ts`,
names and slugs from `content/services.ts`, and nothing is hardcoded here.
