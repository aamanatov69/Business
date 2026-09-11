import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { JsonLd } from "./JsonLd";
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${SITE_URL}${item.path}` })),
  }} /><nav className="solution-breadcrumbs" aria-label="Хлебные крошки">{items.map((item, i) => <span key={item.path}>
    {i > 0 ? " / " : ""}{i === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
  </span>)}</nav></>;
}
