// Заголовок, опис і канонічна адреса в <head> оновлюються разом зі сторінкою: так вкладка, закладка й пошуковик бачать актуальні дані.
export interface Meta { title: string; desc: string; path: string; noindex?: boolean }

function tag(selector: string, make: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) { el = make(); document.head.appendChild(el); }
  return el;
}
const el = <K extends keyof HTMLElementTagNameMap>(name: K, attrs: Record<string, string>) => () => {
  const e = document.createElement(name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

export function setMeta(m: Meta): void {
  document.title = m.title;
  const canon = tag('link[rel="canonical"]', el("link", { rel: "canonical", href: location.origin + "/" }));
  const url = new URL(m.path, canon.getAttribute("href") || location.origin).href;   // origin береться з готової сторінки (SITE_URL)
  canon.setAttribute("href", url);
  tag('meta[name="description"]', el("meta", { name: "description", content: "" })).setAttribute("content", m.desc);
  for (const [prop, val] of [["og:title", m.title], ["og:description", m.desc], ["og:url", url]] as const) {
    tag(`meta[property="${prop}"]`, el("meta", { property: prop, content: "" })).setAttribute("content", val);
  }
  for (const [name, val] of [["twitter:title", m.title], ["twitter:description", m.desc]] as const) {
    const t = document.head.querySelector(`meta[name="${name}"]`);
    if (t) t.setAttribute("content", val);
  }
  const robots = document.head.querySelector('meta[name="robots"]');
  if (m.noindex) tag('meta[name="robots"]', el("meta", { name: "robots", content: "noindex" })).setAttribute("content", "noindex");
  else robots?.remove();
}
