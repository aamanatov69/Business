import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogCategories } from "@/lib/catalog-categories";
import { pageMetadata } from "@/lib/page-metadata";
import { getPublicProducts } from "@/lib/server/public-catalog";
import { CatalogCards } from "@/app/components/CatalogCards";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ category: string }> };
export async function generateMetadata({ params }: Props) {
  const { category } = await params; const entry = catalogCategories.find((item) => item.slug === category);
  if (!entry) return {};
  return pageMetadata(`/catalog/${category}`, `${entry.title} в Бишкеке | Automation Business`, `${entry.description} Подбор оборудования в Бишкеке и Кыргызстане: совместимость с кассой, комплектация и консультация перед покупкой.`);
}
export default async function CategoryPage({ params }: Props) {
  const { category } = await params; const entry = catalogCategories.find((item) => item.slug === category);
  if (!entry) notFound();
  const products = (await getPublicProducts()).filter((item) => item.category?.slug === category);
  return <main className="shell section solution-page"><Breadcrumbs items={[{ name: "Главная", path: "/" }, { name: "Оборудование", path: "/catalog" }, { name: entry.title, path: `/catalog/${category}` }]} />
    <div className="section-head"><h1>{entry.title} в Бишкеке</h1><p>{entry.description}</p></div>
    <section><h2>Как выбрать оборудование</h2><p>{entry.advice}</p></section>
    {products.length ? <CatalogCards products={products} /> : <p>Обсудите доступные модели и комплектацию с менеджером — подберем оборудование под вашу задачу.</p>}
    <section><h2>Проверка совместимости перед покупкой</h2><p>Сообщите название кассовой программы и модели имеющегося оборудования. Срок поставки, стоимость и подключение согласуются для выбранного комплекта.</p><Link className="btn btn-primary" prefetch={false} href="/#request">Получить подбор оборудования</Link></section>
    <Link href="/catalog">Все категории оборудования</Link>
  </main>;
}
