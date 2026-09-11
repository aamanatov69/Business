import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProducts } from "@/lib/server/public-catalog";
import { productPath } from "@/lib/catalog-categories";
import { pageMetadata } from "@/lib/page-metadata";
import { SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/app/components/JsonLd";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { CatalogCards } from "@/app/components/CatalogCards";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params; const product = (await getPublicProducts()).find((item) => item.id === id);
  if (!product) return {};
  return pageMetadata(productPath(id), `${product.name} купить в Бишкеке | Automation Business`, `${product.name}: запросите стоимость, комплектацию и совместимость с вашей кассовой программой. Консультация по торговому оборудованию в Кыргызстане.`);
}
export default async function ProductPage({ params }: Props) {
  const { id } = await params; const products = await getPublicProducts(); const product = products.find((item) => item.id === id);
  if (!product) notFound();
  const description = `${product.name}. ${product.category?.description || "Оборудование для автоматизации бизнеса."}`;
  const crumbs = [{ name: "Главная", path: "/" }, { name: "Оборудование", path: "/catalog" },
    ...(product.category ? [{ name: product.category.title, path: `/catalog/${product.category.slug}` }] : []), { name: product.name, path: productPath(id) }];
  return <main className="shell section solution-page"><Breadcrumbs items={crumbs} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name: product.name, description, url: `${SITE_URL}${productPath(id)}`, sku: product.sku || undefined, image: product.image ? new URL(product.image, SITE_URL).href : undefined }} />
    <h1>{product.name}</h1><div className="business-direction-grid">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt={product.name} width={560} height={420} decoding="async" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
      ) : null}
      <div><p>{description}</p><p>Стоимость, наличие и комплектацию уточняйте у менеджера.</p><Link className="btn btn-primary" prefetch={false} href="/#request">Узнать стоимость и наличие</Link></div>
    </div>
    <section><h2>Данные товара</h2><dl>{product.sku ? <><dt>Артикул</dt><dd>{product.sku}</dd></> : null}{product.barcode ? <><dt>Штрихкод</dt><dd>{product.barcode}</dd></> : null}{product.unit ? <><dt>Единица учета</dt><dd>{product.unit}</dd></> : null}</dl><p>Технические характеристики конкретной комплектации запросите перед покупкой.</p></section>
    <section><h2>Назначение и совместимость</h2><p>{product.category?.advice || "Укажите название программы и сценарий использования. Проверим необходимые интерфейсы и подключение оборудования до согласования заказа."}</p></section>
    <section><h2>Оборудование той же категории</h2><CatalogCards products={products.filter((item) => item.id !== id && item.category?.slug === product.category?.slug).slice(0, 4)} /><Link href="/catalog">Каталог оборудования</Link></section>
  </main>;
}
