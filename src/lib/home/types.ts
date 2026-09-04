export type FeatureCard = {
  title: string;
  description: string;
  points: string[];
  imageUrl: string;
  imageAlt: string;
};

export type IndustryCard = {
  title: string;
  imageUrl: string;
  imageAlt: string;
};

export type ProductCard = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type TrustedOrganization = {
  name: string;
  logoSrc?: string;
};

export type SeoHubItem = {
  key: string;
  href: string;
  label: string;
};

export type SeoHubGroup = {
  id: string;
  tag: string;
  title: string;
  description: string;
  items: SeoHubItem[];
  footerLink?: {
    href: string;
    label: string;
  };
};

export type HomeClientProps = {
  seoHubGroups?: SeoHubGroup[];
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type HeroBoardImage = {
  src: string;
  alt: string;
  className: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type NavItem = {
  href: string;
  label: string;
};

export type EquipmentCatalogItem = {
  id: string;
  title: string;
  description: string;
  shortLabel: string;
  inStock: number | null;
  unit: string;
};
