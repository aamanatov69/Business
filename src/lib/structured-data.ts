import {
  BRAND_ADDRESS, BRAND_CITY, BRAND_COUNTRY, BRAND_EMAIL, BRAND_LOGO_PATH,
  BRAND_PHONE, SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, SITE_URL,
} from "./seo";

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const businessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": BUSINESS_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: `${SITE_URL}${BRAND_LOGO_PATH}`,
  telephone: BRAND_PHONE,
  email: BRAND_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: BRAND_ADDRESS,
    addressLocality: BRAND_CITY,
    addressCountry: BRAND_COUNTRY,
  },
  areaServed: { "@type": "Country", name: "Кыргызстан" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BRAND_PHONE,
    contactType: "sales",
    availableLanguage: ["Russian", "Kyrgyz"],
    url: `${SITE_URL}/contacts`,
  },
};

export function webPageSchema(path: string, name: string, description: string, type = "WebPage") {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url, name, description,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
  };
}
