import Link from "next/link";
import { notFound } from "next/navigation";
import { integrationPages } from "@/lib/integration-pages";
import { pageMetadata } from "@/lib/page-metadata";
import { SITE_URL } from "@/lib/seo";
import { BUSINESS_ID } from "@/lib/structured-data";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { JsonLd } from "@/app/components/JsonLd";
import { publicLinkLabel } from "@/lib/public-links";
export const dynamicParams = false;
export function generateStaticParams() { return integrationPages.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) { const { slug } = await params; const page = integrationPages.find((p) => p.slug === slug); return page ? pageMetadata(`/integrations/${slug}`, page.title, page.description) : {}; }
export default async function IntegrationPage({ params }: Props) {
  const { slug } = await params; const page = integrationPages.find((p) => p.slug === slug); if (!page) notFound();
  return <main className="shell section solution-page"><Breadcrumbs items={[{ name: "Главная", path: "/" }, { name: "Интеграции", path: "/integrations" }, { name: page.title, path: `/integrations/${slug}` }]} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", "@id": `${SITE_URL}/integrations/${slug}#service`, name: page.title, description: page.description, url: `${SITE_URL}/integrations/${slug}`, areaServed: "KG", provider: { "@id": BUSINESS_ID } }} />
    <div className="section-head"><h1>{page.title}</h1><p>{page.intro}</p><Link className="btn btn-primary" prefetch={false} href="/#request">Получить консультацию по интеграции</Link></div>
    {page.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
    <nav aria-label="Связанные решения"><h2>Связанные решения</h2><div className="business-direction-grid">{page.related.map((href) => <Link className="btn btn-outline" href={href} key={href}>{publicLinkLabel(href)}</Link>)}</div></nav>
  </main>;
}
