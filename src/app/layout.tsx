import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';

import { ConsentManager } from '@/components/consent';
import { SiteFooter, SiteHeader } from '@/components/layout';
import { company } from '@/config/company';
import { OPEN_GRAPH_BASE, SITE_DESCRIPTION, SITE_TITLE } from '@/config/seo';

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

/**
 * The hero headline only. Loaded as the variable face with no `weight`, so
 * the whole 400 to 900 range is available from one file and the display
 * weight can be tuned without a second request.
 */
const display = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  /*
   * The top of every page is paper: the header paints no background of its own
   * and the hero underneath it is white. A brand-coloured browser chrome would
   * sit above that as a navy band the page never picks up again.
   */
  themeColor: '#fbfcfd',
  /*
   * Light only (CLAUDE.md 4). Declared rather than left to default, because an
   * undeclared scheme invites a browser or an extension to force-darken form
   * controls into colours no contrast on this site was ever measured against.
   */
  colorScheme: 'light',
};

export const metadata: Metadata = {
  // Origin lives in company.ts, so metadata, sitemap, robots and the
  // LocalBusiness JSON-LD can never disagree about the canonical host.
  metadataBase: new URL(company.site.url),
  title: {
    default: SITE_TITLE,
    template: `%s | ${company.shortName}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: company.shortName,
  authors: [{ name: company.legalName, url: company.site.url }],
  creator: company.legalName,
  publisher: company.legalName,
  /*
   * Every phone number on this site is already an explicit `tel:` link. With
   * detection left on, iOS also linkifies the other digit runs in the imprint
   * (HRB 39367, the postal code, the share capital) into phone links that dial
   * nothing.
   */
  formatDetection: { telephone: false, address: false, email: false },
  /*
   * Defaults would serve a 160-character snippet and a thumbnail-sized image.
   * A local service business is found through its rich result, so the snippet
   * and the image preview are unthrottled here.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  /*
   * The client-delivered icon set, used as delivered (CLAUDE.md 4). The
   * `.ico` carries 16, 32, 48 and 64px frames, which covers every slot a
   * browser asks for, so no SVG cut is declared: there is none in the
   * delivery, and a vector rebuilt here would be a second copy of the mark
   * free to drift from these four files.
   *
   * `apple-touch-icon.png` is the one file not passed through byte for byte.
   * The delivered cut is transparent and iOS composites a transparent home
   * screen icon onto black, which would put a dark blue mark on a black tile.
   * It carries the same artwork on an opaque white ground, which is the
   * ground the logo is drawn for anyway: its mullions and its tools are white.
   *
   * The Next.js default `app/favicon.ico` is gone, or it would keep winning
   * the `/favicon.ico` route.
   */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  /*
   * No `alternates.canonical` and no `openGraph.url` here, deliberately.
   *
   * Metadata is inherited, so a canonical declared on the layout is emitted by
   * every page that does not set its own — which is how `/impressum` and
   * `/datenschutz` came to tell Google they were duplicates of the homepage
   * while the sitemap listed them as pages in their own right. Each route now
   * declares its own. A route that forgets one emits none, and an absent
   * canonical is a hint Google can work around; a wrong one is an instruction
   * to drop the page.
   *
   * These stay as the values a route inherits when it sets nothing of its own.
   * A route that DOES set its own goes through `routeMetadata`, because Next
   * replaces a nested metadata object rather than merging it.
   */
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // No Twitter/X account to attribute — `summary_large_image` alone is what
  // makes the card render at full width, and inventing a @handle would be a
  // claim about an account that does not exist.
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [company.site.ogImage.path],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body className="flex min-h-[100dvh] flex-col">
        {/* First tab stop on every page — the header holds six focus stops
            that a keyboard user should not have to walk past twice. */}
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[60] focus:-translate-x-1/2 focus:rounded-pill focus:bg-navy focus:px-6 focus:py-3 focus:text-body-sm focus:text-paper"
        >
          Zum Inhalt springen
        </a>

        <SiteHeader />

        {/* The body owns the remaining height so the footer sits at the
            bottom of short pages. */}
        <div id="inhalt" className="flex flex-1 flex-col">
          {children}
        </div>

        <SiteFooter />

        {/* Last in the body, so the banner sits at the end of the reading and
            tab order rather than in front of the page. It is not modal and
            does not take focus — see the component comment. */}
        <ConsentManager />
      </body>
    </html>
  );
}
