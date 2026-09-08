import { Bezel, Button, CallButton, Eyebrow, Reveal } from '@/components/ui';
import { company } from '@/config/company';
import { primaryCta } from '@/config/navigation';
import type { ServiceDetail } from '@/content/service-details';
import type { ServiceItem } from '@/content/services';

/** The regular business hours, for the line under the actions. */
const businessHours = company.openingHours.find(
  (entry) => entry.kind === 'regular',
);

/**
 * The closing call to action of a detail page.
 *
 * ## Why this is not `FinalCta`
 *
 * The landing page's closer argues for a site visit in general terms, because
 * the visitor has just read about eight services. Here they have read about
 * one, and the CTA has to pick that one up by name — otherwise the page ends
 * more vaguely than it began. The `ctaBody` line is written per service and
 * says what we need from the customer to quote *this* service: the number of
 * fenster, the abnahme date, the flächen for the winter plan.
 *
 * What it shares with `FinalCta` is the discipline: no countdown, no discount,
 * no "jetzt sichern". A Verwaltung awarding a contract is not an impulse
 * buyer, and urgency rhetoric would undo a page that spent its whole length
 * arguing reliability.
 *
 * Both actions lead to the landing page: the form lives at `/#angebot` and the
 * phone number is the same one everywhere.
 *
 * TODO: once the form can be opened with a service preselected, the primary
 * button should carry this service's slug into it — today it drops the visitor
 * on step one with nothing filled in.
 *
 * Server component. Motion lives in the Reveal leaf and in the CTA's own
 * magnetic pointer physics.
 */
export function ServiceCta({
  service,
  detail,
}: {
  service: ServiceItem;
  detail: ServiceDetail;
}) {
  return (
    <section
      aria-labelledby="anfrage-titel"
      /* No bottom padding: the footer opens with `mt-section-lg` of its own. */
      className="pb-4"
    >
      <div className="mx-auto w-full max-w-shell px-6 md:px-10">
        <Reveal distance={20} amount={0.15}>
          <Bezel
            radius="xl"
            inset="lg"
            tone="tinted"
            elevation="lg"
            innerClassName="p-10 md:p-14 lg:p-16"
          >
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-x-20">
              <div className="lg:col-span-7">
                <Eyebrow>Angebot</Eyebrow>

                <h2 id="anfrage-titel" className="mt-6 max-w-[22ch] text-title-xl">
                  {service.name} anfragen.
                </h2>

                <p className="mt-6 max-w-copy text-lead text-neutral-700">
                  {detail.ctaBody}
                </p>
              </div>

              <div className="flex flex-col items-start lg:col-span-5">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Button href={primaryCta.href} size="lg">
                    {primaryCta.label}
                  </Button>

                  <CallButton />
                </div>

                {businessHours ? (
                  <p className="mt-6 text-micro text-neutral-500">
                    {businessHours.daysLabel} {businessHours.timeLabel}.
                    Akutfälle auch außerhalb dieser Zeiten.
                  </p>
                ) : null}
              </div>
            </div>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
}
