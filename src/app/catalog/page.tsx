import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { catalogCategories } from "@/lib/catalog-categories";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { CatalogCards } from "@/app/components/CatalogCards";
import { getPublicProducts } from "@/lib/server/public-catalog";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/catalog", "Торговое и кассовое оборудование в Бишкеке | Automation Business", "Каталог оборудования для магазина, кафе и склада в Кыргызстане: POS-терминалы, сканеры, чековые принтеры, весы и денежные ящики. Подбор под вашу программу.");
export default async function CatalogPage() {
  const products = await getPublicProducts();
  return <main className="shell section solution-page"><Breadcrumbs items={[{ name: "Главная", path: "/" }, { name: "Оборудование", path: "/catalog" }]} />
    <div className="section-head"><h1>Торговое и кассовое оборудование в Бишкеке</h1><p>Выберите категорию. Поможем проверить совместимость с вашей программой, подобрать комплект и уточнить стоимость.</p></div>
    <div className="business-direction-grid">{catalogCategories.map((category) => <Link className="btn btn-outline business-direction-link" href={`/catalog/${category.slug}`} key={category.slug}>{category.title}</Link>)}</div>
    <p><Link href="/solutions/pos-terminaly-i-kassy">Подбор POS-системы и кассового рабочего места</Link></p>
    {products.length ? <section><h2>Оборудование в каталоге</h2><CatalogCards products={products} /></section> : null}
    <Link className="btn btn-primary" prefetch={false} href="/#request">Подобрать оборудование</Link>
  </main>;
}
