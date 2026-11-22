// Перетворення декларативних перевірок сторінки на тіло JS-перевірки для рушія проєктів (src/projects/sandbox.ts).
// Тіло виконується всередині сторінки користувача й має допоміжні $, $$, text, css, click, type, press, wait.
// Це лише збірка тексту, що лежить у закритому контенті; у публічну сторінку потрапляє тільки готовий рядок після входу.

export interface PageCheckDsl {
  /** CSS-селектор елементів */
  selector?: string;
  /** Залишити елементи, текст яких ВМІЩУЄ рядок */
  text?: string;
  /** Залишити елементи з атрибутом (за потреби з умовою: equals, has, matches) */
  attr?: { name: string; equals?: string; has?: string; matches?: string };
  /** Скільки має лишитись: число (рівно), { min, max } або нічого (щонайменше один) */
  count?: number | { min?: number; max?: number };
  /** Інвертувати: перевірка проходить, коли нічого не знайдено */
  not?: boolean;
  /** Перевірка за текстом документа: <!DOCTYPE html> + вихідний HTML сторінки; регулярний вираз */
  source?: { matches: string };
}

const j = JSON.stringify;

function one(c: PageCheckDsl): string {
  if (c.source) {
    const ok = `new RegExp(${j(c.source.matches)}).test(s)`;
    const msg = c.not ? `У коді є зайве: ${c.source.matches}` : `У коді не знайдено шаблон: ${c.source.matches}`;
    return `{ const s = (document.doctype ? "<!DOCTYPE html>" : "") + document.documentElement.outerHTML; const ok = ${ok}; if (${c.not ? "ok" : "!ok"}) bad.push(${j(msg)}); }`;
  }
  const lines = [`let els = $$(${j(c.selector)});`];
  if (c.text !== undefined) lines.push(`els = els.filter((e) => text(e).includes(${j(c.text)}));`);
  if (c.attr) {
    const a = c.attr;
    const cond = a.equals !== undefined ? `v === ${j(a.equals)}` : a.has !== undefined ? `v.includes(${j(a.has)})` : a.matches !== undefined ? `new RegExp(${j(a.matches)}).test(v)` : "true";
    lines.push(`els = els.filter((e) => { const v = e.getAttribute(${j(a.name)}); return v !== null && ${cond}; });`);
  }
  lines.push("const n = els.length;");
  const cnt = c.count;
  const okExpr = cnt === undefined ? "n >= 1" : typeof cnt === "number" ? `n === ${cnt}` : [cnt.min !== undefined ? `n >= ${cnt.min}` : "", cnt.max !== undefined ? `n <= ${cnt.max}` : ""].filter(Boolean).join(" && ") || "true";
  lines.push(`const ok = ${okExpr};`);
  const what = [c.selector, c.text !== undefined ? `з текстом «${c.text}»` : "", c.attr ? `з атрибутом ${c.attr.name}${c.attr.equals !== undefined ? `="${c.attr.equals}"` : c.attr.has !== undefined ? ` що містить «${c.attr.has}»` : c.attr.matches !== undefined ? ` за шаблоном ${c.attr.matches}` : ""}` : ""].filter(Boolean).join(" ");
  const want = cnt === undefined ? "" : typeof cnt === "number" ? `, очікувалось ${cnt}` : cnt.min !== undefined ? `, очікувалось не менше ${cnt.min}` : "";
  lines.push(`if (${c.not ? "ok" : "!ok"}) bad.push(${j((c.not ? "Зайве: " : "Не знайдено: ") + what)} + ${c.not ? '""' : j(want) + ' + " (знайдено " + n + ")"'});`);
  return `{ ${lines.join(" ")} }`;
}

/** Усі перевірки вимоги → тіло async-функції, що повертає true або рядок із поясненнями */
export function pageChecksToJs(checks: readonly PageCheckDsl[]): string {
  return `const bad = [];\n${checks.map(one).join("\n")}\nreturn bad.length ? bad.join("; ") : true;`;
}
