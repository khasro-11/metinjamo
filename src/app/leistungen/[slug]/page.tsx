import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SERVICE_ICONS } from '@/components/sections';
import { ServiceJsonLd } from '@/components/seo';
import {
  RelatedServices,
  ServiceCta,
  ServiceHero,
  ServicePropertyTypes,
  ServiceScope,
  ServiceWorkflow,
} from '@/components/services';
import { company } from '@/config/company';
import { getServiceDetail } from '@/content/service-details';
import { getServiceBySlug, serviceHref, services } from '@/content/services';

/**
 * `/leistungen/[slug]` — one SEO landing page per service (CLAUDE.md 7).
 *
 * ## What makes this a template and not a generator
 *
 * The layout is shared; the content is not. Every page's headline, lead, scope
 * list, property types, workflow and cross-links are written for that service
 * in `content/service-details.ts`, and the sections differ in length because
 * the services do. Eight pages produced from one text with the noun swapped
 * would be duplicate content in the sense Google means it, and a worse read
 * than the bento tile they came from (CLAUDE.md 9).
 *
 * There are no city variants. The service area is one value in `company.ts`,
 * it appears once per page in the hero fact card, and Doorway-Pages for the
 * surrounding towns are explicitly out.
 *
 * ## Rendering
 *
 * `generateStaticParams` prerenders all eight at build time and
 * `dynamicParams = false` turns anything else into a 404 instead of a
 * request-time render — the catalogue is a fixed list in the bundle, so a
 * ninth slug is a typo, never a new page. The `notFound()` below is what
 * narrows `ServiceItem | undefined` for TypeScript; with `dynamicParams`
 * disabled it is unreachable in production.
 *
 * The whole route is a server component. The only JavaScript on the page comes
 * from the CTA buttons and the scroll reveals, both isolated in leaves.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

type RouteParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  // Unreachable with `dynamicParams = false`; returning empty metadata rather
  // than throwing keeps the 404 a 404 instead of a build error.
  if (!service) return {};

  const detail = getServiceDetail(service.slug);
  const path = serviceHref(service.slug);
  // The root layout's title template appends the company name to `title`, but
  // not to `openGraph.title` — social cards get no template, so the name is
  // written in here once.
  const socialTitle = `${detail.metaTitle} | ${company.shortName}`;

  return {
    title: detail.metaTitle,
    description: detail.metaDescription,
    alternates: { canonical: path },
    // Metadata fields are replaced rather than deep-merged, so the shared
    // image and locale from the root layout have to be repeated here or the
    // service pages would ship an Open Graph card without an image.
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      siteName: company.legalName,
      url: path,
      title: socialTitle,
      description: detail.metaDescription,
      images: [
        {
          url: company.site.ogImage.path,
          width: company.site.ogImage.width,
          height: company.site.ogImage.height,
          alt: company.site.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: detail.metaDescription,
      images: [company.site.ogImage.path],
    },
  };
}

export default async function ServiceDetailPage({ params }: RouteParams) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) notFound();

  const detail = getServiceDetail(service.slug);

  return (
    <main>
      {/* Service + BreadcrumbList. The Service node shares its `@id` with the
          landing page's offer catalogue — one offering, described twice. */}
      <ServiceJsonLd service={service} />

      <ServiceHero
        service={service}
        detail={detail}
        icon={SERVICE_ICONS[service.slug]}
      />
      <ServiceScope detail={detail} />
      <ServicePropertyTypes detail={detail} />
      <ServiceWorkflow detail={detail} />
      <RelatedServices related={detail.related} />
      <ServiceCta service={service} detail={detail} />
    </main>
  );
}
