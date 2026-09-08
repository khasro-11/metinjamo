import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SiteFooter, SiteHeader } from '@/components/layout';
import { company } from '@/config/company';

import './globals.css';

// next/font downloads and self-hosts the files at build time — no runtime
// request to Google, no <link> to fonts.googleapis.com (GDPR).
const sans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const TITLE = `${company.legalName} — Gebäudereinigung in ${company.address.city}`;
const DESCRIPTION = `Gebäudeservice für Hausverwaltungen, Gewerbeobjekte und Eigentümer in ${company.serviceArea.primary}.`;

export const metadata: Metadata = {
  // Origin lives in company.ts, so metadata, sitemap, robots and the
  // LocalBusiness JSON-LD can never disagree about the canonical host.
  metadataBase: new URL(company.site.url),
  title: {
    default: TITLE,
    template: `%s | ${company.shortName}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: company.legalName,
    url: '/',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: company.site.ogImage.path,
        width: company.site.ogImage.width,
        height: company.site.ogImage.height,
        alt: company.site.ogImage.alt,
      },
    ],
  },
  // No Twitter/X account to attribute — `summary_large_image` alone is what
  // makes the card render at full width, and inventing a @handle would be a
  // claim about an account that does not exist.
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [company.site.ogImage.path],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-[100dvh] flex-col">
        {/* First tab stop on every page — the floating pill holds six focus
            stops that a keyboard user should not have to walk past twice. */}
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[60] focus:-translate-x-1/2 focus:rounded-pill focus:bg-brand-900 focus:px-6 focus:py-3 focus:text-body-sm focus:text-paper"
        >
          Zum Inhalt springen
        </a>

        <SiteHeader />

        {/* The header is sticky, so the page body has to own the remaining
            height for the footer to sit at the bottom of short pages. */}
        <div id="inhalt" className="flex flex-1 flex-col">
          {children}
        </div>

        <SiteFooter />
      </body>
    </html>
  );
}
