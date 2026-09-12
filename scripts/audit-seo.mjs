import { writeFile, mkdir } from "node:fs/promises";

// Read-only crawl of rendered HTML. Usage: node scripts/audit-seo.mjs [origin]
const origin = process.argv[2] || "http://127.0.0.1:3100";
const reportName = new URL(origin).hostname === "automationbusines.com" ? "seo-crawl-live.json" : "seo-crawl.json";
const canonicalOrigin = "https://automationbusines.com";
const decode = (text) => text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const errors = [];
const warnings = [];
const pages = [];
const get = (path) => fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(20000), headers: { "user-agent": "SEO-Audit/1.0" } });
const sitemapResponse = await get("/sitemap.xml");
if (sitemapResponse.status !== 200) throw new Error(`Sitemap HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
const sitemapPaths = new Set(locations.map((url) => new URL(url).pathname));
if (!locations.length) errors.push("Sitemap is empty");
if (locations.length !== new Set(locations).size) errors.push("Duplicate sitemap URLs");
for (const url of locations) if (new URL(url).origin !== canonicalOrigin || new URL(url).search) errors.push(`Invalid sitemap URL: ${url}`);
const queue = [...sitemapPaths];
const seen = new Set();
const titles = new Map();
const descriptions = new Map();
while (queue.length && seen.size < 250) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const response = await get(path);
  if (response.status !== 200) { errors.push(`${path}: HTTP ${response.status}`); continue; }
  const html = await response.text();
  const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attributes(m[0]));
  const meta = (key) => metas.find((m) => m.name === key || m.property === key)?.content || "";
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || "");
  const description = meta("description");
  const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attributes(m[0])).find((link) => link.rel === "canonical")?.href;
  const noindex = /noindex/.test(meta("robots"));
  const h1Count = [...html.matchAll(/<h1(?:\s|>)/g)].length;
  const schemas = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { schemas.push(JSON.parse(match[1])); } catch { errors.push(`${path}: invalid JSON-LD`); }
  }
  if (sitemapPaths.has(path) && noindex) errors.push(`${path}: noindex URL in sitemap`);
  if (!noindex) {
    if (!title || !description) errors.push(`${path}: missing title or description`);
    if (h1Count !== 1) errors.push(`${path}: ${h1Count} H1 elements`);
    if (!canonical || new URL(canonical).origin !== canonicalOrigin || new URL(canonical).pathname !== path || new URL(canonical).search) errors.push(`${path}: incorrect canonical ${canonical}`);
    if (meta("og:title") !== title || meta("og:description") !== description) warnings.push(`${path}: social metadata differs from title/description`);
    if (!schemas.length) errors.push(`${path}: missing JSON-LD`);
    for (const [value, map, name] of [[title, titles, "title"], [description, descriptions, "description"]]) {
      if (map.has(value)) errors.push(`${path}: duplicate ${name} with ${map.get(value)}`);
      map.set(value, path);
    }
    // Lengths flag editorial review, not a Google character limit.
    if (title.length > 85 || description.length > 200) warnings.push(`${path}: review metadata length (${title.length}/${description.length})`);
  }
  if (/\?{4}|\uFFFD/.test(title + description)) errors.push(`${path}: damaged metadata encoding`);
  for (const match of html.matchAll(/<a\b[^>]*>/g)) {
    const href = attributes(match[0]).href;
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    const linked = new URL(href, origin);
    if (linked.search || /\.[a-z0-9]+$/i.test(linked.pathname) || /^\/(api|foto)(\/|$)/.test(linked.pathname) || linked.pathname === "/integrations/rosta") continue;
    if (!seen.has(linked.pathname)) queue.push(linked.pathname);
  }
  pages.push({ path, status: response.status, title, description, canonical, noindex, h1Count, schemaTypes: schemas.map((s) => s["@type"]) });
}
if (queue.some((path) => !seen.has(path))) errors.push("Crawl limit reached");
for (const path of ["/foto", "/integrations/rosta", "/countries/kazakhstan/crm"]) {
  const response = await get(path);
  const html = await response.text();
  const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attributes(m[0]));
  if (response.status !== 200 || !metas.some((m) => m.name === "robots" && /noindex/.test(m.content))) errors.push(`${path}: missing noindex or unexpected status`);
}
for (const path of ["/seo-audit-missing-page", "/blog/seo-audit-missing", "/catalog/product/seo-audit-missing"]) {
  const response = await get(path);
  if (response.status !== 404) errors.push(`${path}: expected 404, got ${response.status}`);
}
for (const [path, destination] of [["/countries/kyrgyzstan", "/"], ["/countries/kyrgyzstan/crm", "/solutions/crm-dlya-biznesa"]]) {
  const response = await get(path);
  if (response.status !== 301 || response.headers.get("location") !== `${canonicalOrigin}${destination}`) errors.push(`${path}: incorrect legacy redirect`);
}
const queryResponse = await get("/?category=pos&utm_source=seo-audit");
const queryHtml = await queryResponse.text();
if (!queryHtml.includes(`rel="canonical" href="${canonicalOrigin}"`) && !queryHtml.includes(`rel="canonical" href="${canonicalOrigin}/"`)) errors.push("Query URL does not canonicalize to home");
const robots = await (await get("/robots.txt")).text();
if (!robots.includes(`${canonicalOrigin}/sitemap.xml`)) errors.push("Missing sitemap in robots.txt");
const report = { checkedAt: new Date().toISOString(), origin, sitemapUrls: locations.length, crawledPages: pages.length, errors, warnings, pages };
await mkdir("reports", { recursive: true });
await writeFile(`reports/${reportName}`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ sitemapUrls: locations.length, crawledPages: pages.length, errors, warnings }, null, 2));
process.exitCode = errors.length ? 1 : 0;
