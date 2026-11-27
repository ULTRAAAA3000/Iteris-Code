// Еталони завдань глави 8 «Стандартна бібліотека» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_08 = {
  "ts-module-exports": raw`export type Mode = "dev" | "prod" | "test";
export const MODES: Mode[] = ["dev", "prod", "test"];

export function parseMode(text: string): Mode | null {
  const value = text.toLowerCase();
  for (const mode of MODES) {
    if (mode === value) {
      return mode;
    }
  }
  return null;
}

export default class Settings {
  constructor(public mode: Mode) {}

  describe(): string {
    return "режим: " + this.mode;
  }
}

console.log(MODES.join(","));
console.log(parseMode("prod"), parseMode("DEV"), parseMode("x"));
console.log(new Settings("test").describe());
`,
  "ts-dates-utc": raw`function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

const start = new Date("2024-02-27T00:00:00Z");
const end = addDays(start, 5);
console.log(isoDate(end));
console.log(daysBetween(start, end));
console.log(isWeekend(new Date("2024-03-02T00:00:00Z")), isWeekend(new Date("2024-03-04T00:00:00Z")));
console.log(isoDate(addDays(new Date("2024-12-30T00:00:00Z"), 3)));
console.log(isoDate(start));
`,
  "ts-json-parse": raw`interface User {
  id: number;
  nick: string;
  tags: string[];
}

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.nick === "string" &&
    Array.isArray(record.tags) &&
    record.tags.every((tag) => typeof tag === "string")
  );
}

function parseUser(text: string): User | null {
  try {
    const data: unknown = JSON.parse(text);
    return isUser(data) ? data : null;
  } catch {
    return null;
  }
}

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

const inputs = [
  '{"id":1,"nick":"olena","tags":["admin"]}',
  '{"id":"2","nick":"ihor","tags":[]}',
  '{"id":3,"nick":"petro","tags":[1]}',
  "{ зламано",
  "null",
];

for (const input of inputs) {
  const user = parseUser(input);
  console.log(user === null ? "відхилено" : user.nick + " " + user.tags.length);
}
console.log(pretty({ ok: true, list: [1, 2] }));
`,
  "ts-regex-log": raw`interface Entry {
  day: string;
  level: string;
  text: string;
}

const logText = [
  "2024-03-15 ERROR диск",
  "2024-03-15 INFO старт",
  "2024-03-16 ERROR мережа",
  "некоректний рядок",
  "2024-03-17 WARN пам'ять",
].join("\n");

function parseLog(text: string): Entry[] {
  const pattern = /^(?<day>\d{4}-\d{2}-\d{2}) (?<level>[A-Z]+) (?<text>.+)$/gm;
  const entries: Entry[] = [];
  for (const match of text.matchAll(pattern)) {
    const groups = match.groups;
    if (groups) {
      entries.push({ day: groups.day, level: groups.level, text: groups.text });
    }
  }
  return entries;
}

function countByLevel(entries: Entry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    counts[entry.level] = (counts[entry.level] ?? 0) + 1;
  }
  return counts;
}

const entries = parseLog(logText);
console.log(entries.length);
console.log(entries.map((entry) => entry.text).join(","));
console.log(JSON.stringify(countByLevel(entries)));
`,
  "ts-plural-uk": raw`type Forms = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;

const rules = new Intl.PluralRules("uk");

function plural(count: number, forms: Forms): string {
  return forms[rules.select(count)] ?? forms.other;
}

function label(count: number): string {
  const forms: Forms = { one: "коментар", few: "коментарі", many: "коментарів", other: "коментаря" };
  return String(count).padStart(3, "0") + " " + plural(count, forms);
}

console.log([1, 2, 5, 21, 22, 25].map(label).join("\n"));
`,
  "ts-money-cents": raw`function toCents(text: string): number {
  const [whole, fraction = ""] = text.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
}

function sumPrices(texts: string[]): number {
  let total = 0;
  for (const text of texts) {
    total += toCents(text);
  }
  return total;
}

function formatCents(cents: number): string {
  return Math.floor(cents / 100) + "." + String(cents % 100).padStart(2, "0");
}

console.log(toCents("0.10"), toCents("12"), toCents("12.5"));
console.log(formatCents(sumPrices(["0.10", "0.20", "1.05"])));
console.log(formatCents(5), formatCents(1999));
console.log(0.1 + 0.2 === 0.3, sumPrices(["0.10", "0.20"]) === 30);
`,
  "ts-iterable-range": raw`class NumberRange implements Iterable<number> {
  constructor(
    private from: number,
    private to: number,
    private step: number = 1,
  ) {}

  *[Symbol.iterator](): Generator<number> {
    for (let n = this.from; n <= this.to; n += this.step) {
      yield n;
    }
  }
}

function* zip<A, B>(first: Iterable<A>, second: Iterable<B>): Generator<[A, B]> {
  const a = first[Symbol.iterator]();
  const b = second[Symbol.iterator]();
  while (true) {
    const x = a.next();
    const y = b.next();
    if (x.done || y.done) {
      return;
    }
    yield [x.value, y.value];
  }
}

const range = new NumberRange(1, 10, 3);
console.log([...range].join(","));
console.log(Math.max(...range), new Set(range).size);
console.log([...zip(range, ["a", "b", "c"])].map(([n, s]) => n + s).join(" "));
console.log([...zip("xyz", new Set([1, 2]))].length);
`,
  "ts-immutable-cart": raw`interface Item {
  title: string;
  price: number;
}

interface Cart {
  owner: { name: string };
  items: Item[];
}

function addItem(cart: Cart, item: Item): Cart {
  return { ...cart, items: [...cart.items, item] };
}

function renameOwner(cart: Cart, name: string): Cart {
  return { ...cart, owner: { ...cart.owner, name } };
}

function snapshot(cart: Cart): Cart {
  return structuredClone(cart);
}

const original: Cart = { owner: { name: "Олена" }, items: [{ title: "хліб", price: 30 }] };
const saved = snapshot(original);
const withMilk = addItem(original, { title: "молоко", price: 45 });
const renamed = renameOwner(withMilk, "Ігор");

console.log(original.items.length, original.owner.name);
console.log(withMilk.items.length, renamed.owner.name);
console.log(original === withMilk, renamed.items === withMilk.items);
console.log(saved.items.length, saved.owner.name, saved === original);
`,
  "ts-url-query": raw`type Value = string | number | string[];

function buildUrl(base: string, path: string, params: Record<string, Value>): string {
  const url = new URL(path, base);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url.href;
}

function parseFilters(search: string): { page: number; tags: string[] } {
  const params = new URLSearchParams(search);
  const rawPage = params.get("page");
  const page = rawPage === null ? 1 : Number(rawPage);
  return { page: Number.isInteger(page) && page >= 1 ? page : 1, tags: params.getAll("tag") };
}

console.log(buildUrl("https://shop.example/api/", "items", { q: "привіт світ", page: 2, tag: ["a", "b"] }));
console.log(JSON.stringify(parseFilters("?page=3&tag=x&tag=y")));
console.log(JSON.stringify(parseFilters("?page=abc")));
console.log(JSON.stringify(parseFilters("")));
`,
  "ts-global-augment": raw`export {};

declare global {
  interface Array<T> {
    last(): T | undefined;
  }
}

Array.prototype.last = function (this: unknown[]) {
  return this[this.length - 1];
};

console.log([1, 2, 3].last());
console.log(["a"].last());
console.log([].last());
`,
  "ts-dom-fakes": raw`type TextField = Pick<HTMLInputElement, "value">;
type CheckField = Pick<HTMLInputElement, "checked">;

interface Form {
  name: TextField;
  email: TextField;
  agree: CheckField;
}

function validate(form: Form): string[] {
  const errors: string[] = [];
  if (form.name.value.trim() === "") {
    errors.push("ім'я обов'язкове");
  }
  if (!form.email.value.includes("@")) {
    errors.push("некоректна пошта");
  }
  if (!form.agree.checked) {
    errors.push("потрібна згода");
  }
  return errors;
}

function submit(form: Form): string {
  const errors = validate(form);
  return errors.length === 0 ? "надіслано: " + form.name.value.trim() : "помилки: " + errors.join("; ");
}

console.log(submit({ name: { value: " Олена " }, email: { value: "o@x.ua" }, agree: { checked: true } }));
console.log(submit({ name: { value: "  " }, email: { value: "oops" }, agree: { checked: false } }));
console.log(submit({ name: { value: "Ігор" }, email: { value: "no-at" }, agree: { checked: true } }));
`,
  "ts-tsconfig-check": raw`const configText = [
  "{",
  "  // базові налаштування",
  '  "compilerOptions": {',
  '    "target": "ES2022",',
  '    "strict": true,',
  '    "noImplicitOverride": true /* корисно для класів */',
  "  },",
  '  "include": ["src"]',
  "}",
].join("\n");

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function parseConfig(text: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(stripComments(text));
    return typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function missingFlags(config: Record<string, unknown>, recommended: string[]): string[] {
  const options = config.compilerOptions;
  const flags: Record<string, unknown> = typeof options === "object" && options !== null ? (options as Record<string, unknown>) : {};
  return recommended.filter((flag) => flags[flag] !== true);
}

const config = parseConfig(configText);
if (config === null) {
  console.log("не вдалося розібрати");
} else {
  console.log("розібрано");
  console.log(missingFlags(config, ["strict", "noUncheckedIndexedAccess", "noImplicitOverride"]).join(","));
}
console.log(parseConfig("{ зламано") === null);
`,
};
