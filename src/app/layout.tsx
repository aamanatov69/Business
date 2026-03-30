import {
  BRAND_EMAIL,
  BRAND_PHONE,
  SITE_DESCRIPTION,
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
  keywords: [
    "автоматизация бизнеса",
    "POS система",
    "CRM для бизнеса",
    "учет склада",
    "финансовая аналитика",
    "автоматизация кафе",
    "автоматизация магазина",
    "автоматизация СТО",
    "amoCRM интеграция",
    "Кыргызстан",
  ],
  alternates: {
    canonical: "/",
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
    email: BRAND_EMAIL,
    telephone: BRAND_PHONE,
    areaServed: "KG",
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
    inLanguage: "ru",
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
            <p className="site-footer-address">Улица Мадиева 23/1 Кок-Жар</p>
            <div className="site-footer-phones" aria-label="Номера телефонов">
              <details className="site-footer-phone-chooser">
                <summary className="site-footer-link">+996 559 474 999</summary>
                <div className="site-footer-actions" aria-label="Способы связи">
                  <a className="site-footer-action" href="tel:+996559474999">
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
              href="https://mail.google.com/mail/?view=cm&fs=1&to=automat.busines@gmail.com&su=%D0%97%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D1%81%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0"
              target="_self"
            >
              automat.busines@gmail.com
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
