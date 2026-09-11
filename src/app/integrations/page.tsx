import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { integrationPages } from "@/lib/integration-pages";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
export const metadata = pageMetadata("/integrations", "Интеграции Rosta, CRM и POS в Кыргызстане | Automation Business", "Интеграции сайта с Rosta и CRM, обмен каталогом и оценка подключения банковских терминалов. Выберите сценарий и обсудите технические требования.");
export default function IntegrationsPage() { return <main className="shell section solution-page"><Breadcrumbs items={[{ name: "Главная", path: "/" }, { name: "Интеграции", path: "/integrations" }]} /><div className="section-head"><h1>Интеграции для автоматизации бизнеса</h1><p>Выберите сценарий обмена. Доступность методов, совместимость и состав работ проверяем до подключения.</p></div><div className="business-direction-grid">{integrationPages.map((page) => <Link key={page.slug} className="btn btn-outline business-direction-link" href={`/integrations/${page.slug}`}>{page.title}</Link>)}</div><Link prefetch={false} href="/#request" className="btn btn-primary">Обсудить интеграцию</Link></main>; }
