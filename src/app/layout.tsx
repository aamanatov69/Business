import {
  BRAND_ADDRESS,
  BRAND_CITY,
  BRAND_COUNTRY,
  BRAND_EMAIL,
  BRAND_LOGO_PATH,
  BRAND_PHONE,
  BRAND_POSTAL_CODE,
  CIS_COUNTRIES,
  CORE_SEO_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [...CORE_SEO_KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
    languages: {
      ru: SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: BRAND_LOGO_PATH, type: "image/png" },
    ],
    apple: [{ url: BRAND_LOGO_PATH, type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  other: {
    "geo.region": "KG-GB",
    "geo.placename": `${BRAND_CITY}, Кыргызстан`,
    "geo.position": "42.82699;74.61044",
    ICBM: "42.82699, 74.61044",
    language: SITE_LANGUAGE,
  },
  category: "business software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eef4ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${BRAND_LOGO_PATH}`,
    email: BRAND_EMAIL,
    telephone: BRAND_PHONE,
    areaServed: [...CIS_COUNTRIES],
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND_ADDRESS,
      addressLocality: BRAND_CITY,
      postalCode: BRAND_POSTAL_CODE,
      addressCountry: BRAND_COUNTRY,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND_PHONE,
        contactType: "sales",
        availableLanguage: ["Russian", "Kyrgyz"],
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KGS",
    },
    description: SITE_DESCRIPTION,
  };

  return (
    <html lang="ru" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <div className="site-content">{children}</div>
        <footer className="site-footer" aria-label="Контакты и реквизиты">
          <h2 className="site-footer-title">Контакты и адрес</h2>
          <div className="shell site-footer-inner">
            <p className="site-footer-address">{BRAND_ADDRESS}</p>
            <div className="site-footer-phones" aria-label="Номера телефонов">
              <details className="site-footer-phone-chooser">
                <summary className="site-footer-link">{BRAND_PHONE}</summary>
                <div className="site-footer-actions" aria-label="Способы связи">
                  <a
                    className="site-footer-action"
                    href={`tel:${BRAND_PHONE.replace(/\s+/g, "")}`}
                  >
                    Позвонить
                  </a>
                  <a
                    className="site-footer-action"
                    href="https://wa.me/996559474999"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
              </details>
              <details className="site-footer-phone-chooser">
                <summary className="site-footer-link">+996 990 474 999</summary>
                <div className="site-footer-actions" aria-label="Способы связи">
                  <a className="site-footer-action" href="tel:+996990474999">
                    Позвонить
                  </a>
                  <a
                    className="site-footer-action"
                    href="https://wa.me/996990474999"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
              </details>
            </div>
            <a
              className="site-footer-link"
              href={`mailto:${BRAND_EMAIL}`}
              target="_self"
            >
              {BRAND_EMAIL}
            </a>
            <p className="site-footer-copy">
              © 2026 Все права защищены. Разработано AutomationBusines
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
