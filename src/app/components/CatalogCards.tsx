import Link from "next/link";
import type { getPublicProducts } from "@/lib/server/public-catalog";
import { productPath } from "@/lib/catalog-categories";
export function CatalogCards({ products }: { products: Awaited<ReturnType<typeof getPublicProducts>> }) {
  return <div className="catalog-market-grid">{products.map((product) => <article className="catalog-market-card" key={product.id}>
    <Link href={productPath(product.id)}>
      <div className="catalog-market-image-wrap">{product.image ? (
        // External images come from the existing managed catalog; avoid proxying arbitrary hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt={product.name} width={320} height={240} loading="lazy" decoding="async" style={{ width: "100%", height: 240, objectFit: "contain" }} />
      ) : <span>Фото уточняйте у менеджера</span>}</div>
      <h2 style={{ fontSize: "1.1rem", padding: 16 }}>{product.name}</h2>
    </Link>
    <p style={{ padding: "0 16px 16px" }}>Стоимость и комплектация — по запросу</p>
  </article>)}</div>;
}
