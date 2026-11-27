// Завдання глави 8 «Стандартна бібліотека» (уроки 74–85). Еталони: tests/solutions/ts-ch08.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "ts-module-exports", lesson: "ts/74", xp: 20,
    title: "Оформлення файлу як модуля",
    context: "Публічний інтерфейс модуля складається з його експортів. Явні export для типів, значень і класу за замовчуванням визначають, що можна використовувати з інших файлів.",
    brief: [
      "Файл поки що не є модулем. Додайте <code>export</code> до типу <code>Mode</code>, константи <code>MODES</code> і функції <code>parseMode</code>, а клас <code>Settings</code> експортуйте <b>за замовчуванням</b> (<code>export default class</code>).",
      "Допишіть <code>parseMode(text)</code>: вона приводить текст до нижнього регістру й повертає режим, якщо він є в <code>MODES</code>, інакше <code>null</code>.",
    ],
    starter: raw`// TODO: додайте export перед type Mode, const MODES і function parseMode
type Mode = "dev" | "prod" | "test";
const MODES: Mode[] = ["dev", "prod", "test"];

function parseMode(text: string): Mode | null {
  // TODO: text.toLowerCase(); якщо серед MODES є такий режим, повертаємо його, інакше null
  return null;
}

// TODO: зробіть клас експортом за замовчуванням: export default class Settings
class Settings {
  constructor(public mode: Mode) {}

  describe(): string {
    return "режим: " + this.mode;
  }
}

console.log(MODES.join(","));
console.log(parseMode("prod"), parseMode("DEV"), parseMode("x"));
console.log(new Settings("test").describe());
`,
    checks: [
      { on: "stdout", name: "Режими й розбір", equals: "dev,prod,test\nprod dev null\nрежим: test", hint: "parseMode має ігнорувати регістр: «DEV» дає dev, а невідомий режим дає null." },
      { on: "source", name: "Експорт типу", matches: "export\\s+type\\s+Mode", hint: "Додайте export перед type Mode." },
      { on: "source", name: "Експорт за замовчуванням", matches: "export\\s+default\\s+class\\s+Settings", hint: "Клас Settings експортується через export default class Settings." },
      { on: "source", name: "Експорт функції й константи", matches: "export\\s+const\\s+MODES[\\s\\S]*export\\s+function\\s+parseMode|export\\s+function\\s+parseMode[\\s\\S]*export\\s+const\\s+MODES", hint: "Експортуйте і const MODES, і function parseMode." },
    ],
  },
  {
    ...base, id: "ts-dates-utc", lesson: "ts/75", xp: 30,
    title: "Дати в UTC: додавання днів і різниця",
    context: "Терміни, розклади й звіти за період потребують арифметики з датами. Робота в UTC дає однаковий результат у будь-якому часовому поясі, а поточний час у завданні не потрібен.",
    brief: [
      "Допишіть чотири функції на методах UTC: <code>addDays(date, days)</code> повертає <b>нову</b> дату, <code>daysBetween(from, to)</code> рахує повні доби, <code>isoDate(date)</code> повертає рядок <code>РРРР-ММ-ДД</code>, <code>isWeekend(date)</code> перевіряє суботу чи неділю.",
      "Не змінюйте передану дату, а створюйте копію через <code>new Date(date.getTime())</code>. Для вихідних скористайтеся <code>getUTCDay()</code>: 0 це неділя, 6 субота.",
    ],
    starter: raw`function addDays(date: Date, days: number): Date {
  // TODO: копія дати, setUTCDate(getUTCDate() + days)
  return date;
}

function daysBetween(from: Date, to: Date): number {
  // TODO: Math.round((to.getTime() - from.getTime()) / 86_400_000)
  return 0;
}

function isoDate(date: Date): string {
  // TODO: перші 10 символів toISOString()
  return "";
}

function isWeekend(date: Date): boolean {
  // TODO: getUTCDay() дорівнює 0 або 6
  return false;
}

const start = new Date("2024-02-27T00:00:00Z");
const end = addDays(start, 5);
console.log(isoDate(end));
console.log(daysBetween(start, end));
console.log(isWeekend(new Date("2024-03-02T00:00:00Z")), isWeekend(new Date("2024-03-04T00:00:00Z")));
console.log(isoDate(addDays(new Date("2024-12-30T00:00:00Z"), 3)));
console.log(isoDate(start));
`,
    checks: [
      { on: "stdout", name: "Дати, різниця й вихідні", equals: "2024-03-03\n5\ntrue false\n2025-01-02\n2024-02-27", hint: "Початкова дата не повинна змінитися, а місяць і рік мають переноситися автоматично." },
      { on: "source", name: "Методи UTC", matches: "setUTCDate|getUTCDate", hint: "Додавайте дні через setUTCDate(getUTCDate() + days)." },
      { on: "source", name: "Вихідні через getUTCDay", matches: "getUTCDay\\s*\\(", hint: "День тижня дає getUTCDay(): 0 неділя, 6 субота." },
    ],
  },
  {
    ...base, id: "ts-json-parse", lesson: "ts/76", xp: 30,
    title: "Безпечний розбір JSON з перевіркою форми",
    context: "Усе, що прийшло ззовні, може мати будь-яку форму. Перевірка на межі перетворює unknown на справжній тип і не дає чужим даним зламати програму далеко від місця їх появи.",
    brief: [
      "Допишіть <code>isUser</code>: значення має бути об'єктом (не <code>null</code>), з числовим <code>id</code>, рядковим <code>nick</code> і масивом рядків <code>tags</code>. Допишіть <code>parseUser</code>: розбір у <code>try/catch</code>, а результат приймайте як <code>unknown</code>.",
      "Допишіть <code>pretty(value)</code>: текст JSON із відступом у два пробіли. Решту програми вже написано.",
    ],
    starter: raw`interface User {
  id: number;
  nick: string;
  tags: string[];
}

function isUser(value: unknown): value is User {
  // TODO: object, не null; id number; nick string; tags масив рядків
  return false;
}

function parseUser(text: string): User | null {
  // TODO: try { const data: unknown = JSON.parse(text); ... } catch { return null; }
  return null;
}

function pretty(value: unknown): string {
  // TODO: JSON.stringify з відступом 2
  return "";
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
    checks: [
      { on: "stdout", name: "Розбір і форматування", equals: "olena 1\nвідхилено\nвідхилено\nвідхилено\nвідхилено\n{\n  \"ok\": true,\n  \"list\": [\n    1,\n    2\n  ]\n}", hint: "Приймається лише повна форма User; усе інше, зокрема зламаний текст і null, дає null." },
      { on: "source", name: "Є try/catch навколо parse", matches: "try\\s*\\{[\\s\\S]*JSON\\.parse[\\s\\S]*\\}\\s*catch", hint: "Обгорніть JSON.parse у try/catch." },
      { on: "source", name: "Результат як unknown", matches: "unknown\\s*=\\s*JSON\\.parse", hint: "Запишіть результат у змінну типу unknown: const data: unknown = JSON.parse(text)." },
    ],
  },
  {
    ...base, id: "ts-regex-log", lesson: "ts/77", xp: 35,
    title: "Розбір журналу іменованими групами",
    context: "Журнали, імпортовані файли й копії з форм часто мають текстовий формат. Регулярний вираз з іменованими групами перетворює такі рядки на об'єкти, з якими легко працювати.",
    brief: [
      "Допишіть <code>parseLog(text)</code>: кожен рядок виду <code>2024-03-15 ERROR диск</code> розберіть виразом з іменованими групами <code>day</code>, <code>level</code>, <code>text</code> і поверніть масив записів. Некоректні рядки пропускайте. Скористайтеся <code>matchAll</code> з прапорцями <code>g</code> і <code>m</code>.",
      "Допишіть <code>countByLevel(entries)</code>: об'єкт «рівень → кількість записів». Не забувайте, що <code>match.groups</code> може бути <code>undefined</code>.",
    ],
    starter: raw`interface Entry {
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
  // TODO: /^(?<day>\d{4}-\d{2}-\d{2}) (?<level>[A-Z]+) (?<text>.+)$/gm і text.matchAll(...)
  return [];
}

function countByLevel(entries: Entry[]): Record<string, number> {
  // TODO: лічильник за entry.level
  return {};
}

const entries = parseLog(logText);
console.log(entries.length);
console.log(entries.map((entry) => entry.text).join(","));
console.log(JSON.stringify(countByLevel(entries)));
`,
    checks: [
      { on: "stdout", name: "Записи й підрахунок", equals: "4\nдиск,старт,мережа,пам'ять\n{\"ERROR\":2,\"INFO\":1,\"WARN\":1}", hint: "Рядок «некоректний рядок» не збігається з шаблоном і має бути пропущений." },
      { on: "source", name: "Іменовані групи", matches: "\\(\\?<\\w+>", hint: "Використайте іменовані групи на кшталт (?<day>...)." },
      { on: "source", name: "matchAll або exec", matches: "matchAll|\\.exec\\s*\\(", hint: "Зберіть усі збіги через text.matchAll(pattern)." },
    ],
  },
  {
    ...base, id: "ts-plural-uk", lesson: "ts/78", xp: 30,
    title: "Українська множина через Intl.PluralRules",
    context: "Інтерфейси мають писати «1 коментар», «2 коментарі», «5 коментарів». Правила множини вже є в платформі, тож писати їх вручну не потрібно.",
    brief: [
      "Допишіть <code>plural(count, forms)</code>: категорію дає <code>rules.select(count)</code>, а потрібне слово лежить у <code>forms</code> за цим ключем. Допишіть <code>label(count)</code>: число, доповнене нулями до трьох цифр через <code>padStart</code>, пробіл і слово у правильній формі.",
      "Форми слів уже передані в <code>label</code>. Результат виводиться по рядку на кожне число.",
    ],
    starter: raw`type Forms = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;

const rules = new Intl.PluralRules("uk");

function plural(count: number, forms: Forms): string {
  // TODO: forms[rules.select(count)] ?? forms.other
  return forms.other;
}

function label(count: number): string {
  const forms: Forms = { one: "коментар", few: "коментарі", many: "коментарів", other: "коментаря" };
  // TODO: число з нулями до 3 цифр (padStart), пробіл і plural(count, forms)
  return "";
}

console.log([1, 2, 5, 21, 22, 25].map(label).join("\n"));
`,
    checks: [
      { on: "stdout", name: "Форми множини", equals: "001 коментар\n002 коментарі\n005 коментарів\n021 коментар\n022 коментарі\n025 коментарів", hint: "1 і 21 це one, 2 і 22 це few, 5 і 25 це many; число доповнюється нулями до трьох цифр." },
      { on: "source", name: "Використано PluralRules", matches: "rules\\.select\\s*\\(", hint: "Категорію слова дає rules.select(count)." },
      { on: "source", name: "Доповнення нулями", matches: "padStart\\s*\\(", hint: "Скористайтеся String(count).padStart(3, \"0\")." },
    ],
  },
  {
    ...base, id: "ts-money-cents", lesson: "ts/79", xp: 35,
    title: "Гроші в копійках без втрати точності",
    context: "Дробові числа накопичують похибку, а гроші її не пробачають. Цілі копійки дають точну арифметику, а ділення на сто відбувається лише при показі.",
    brief: [
      "Допишіть <code>toCents(text)</code>: рядок <code>\"12.5\"</code> стає <code>1250</code>, <code>\"0.10\"</code> стає <code>10</code>, <code>\"12\"</code> стає <code>1200</code>. Розбийте рядок по крапці, а дробову частину доповніть до двох цифр через <code>padEnd</code>.",
      "Допишіть <code>sumPrices(texts)</code> (сума копійок) і <code>formatCents(cents)</code>: цілі гривні, крапка й дві цифри копійок, без жодного ділення на дробові числа.",
    ],
    starter: raw`function toCents(text: string): number {
  // TODO: split по ".", whole * 100 + перші дві цифри дробової частини (padEnd до 2)
  return 0;
}

function sumPrices(texts: string[]): number {
  // TODO: сума toCents для кожного тексту
  return 0;
}

function formatCents(cents: number): string {
  // TODO: Math.floor(cents / 100) + "." + остача від ділення на 100 з нулем попереду (padStart)
  return "";
}

console.log(toCents("0.10"), toCents("12"), toCents("12.5"));
console.log(formatCents(sumPrices(["0.10", "0.20", "1.05"])));
console.log(formatCents(5), formatCents(1999));
console.log(0.1 + 0.2 === 0.3, sumPrices(["0.10", "0.20"]) === 30);
`,
    checks: [
      { on: "stdout", name: "Копійки, сума й формат", equals: "10 1200 1250\n1.35\n0.05 19.99\nfalse true", hint: "Додавання цілих копійок точне: 10 + 20 дорівнює 30, на відміну від 0.1 + 0.2." },
      { on: "source", name: "Доповнення рядків", matches: "padEnd\\s*\\(", hint: "Дробову частину доповніть до двох цифр через padEnd(2, \"0\")." },
      { on: "source", name: "Нулі в копійках", matches: "padStart\\s*\\(", hint: "Для формату 0.05 копійки доповніть нулем через padStart(2, \"0\")." },
    ],
  },
  {
    ...base, id: "ts-iterable-range", lesson: "ts/80", xp: 35,
    title: "Власний ітерований NumberRange і zip",
    context: "Клас, що реалізує протокол ітерації, одразу працює з циклами, розгортанням і Set. Функції над Iterable приймають і масиви, і рядки, і власні колекції.",
    brief: [
      "Допишіть метод-генератор <code>*[Symbol.iterator]()</code> у класі <code>NumberRange</code>: він віддає числа від <code>from</code> до <code>to</code> включно з кроком <code>step</code>.",
      "Допишіть генератор <code>zip(first, second)</code>: візьміть ітератор у кожного джерела через <code>[Symbol.iterator]()</code>, і поки обидва дають значення (<code>next()</code>), віддавайте пари <code>[a, b]</code>. Коротше джерело обриває результат.",
    ],
    starter: raw`class NumberRange implements Iterable<number> {
  constructor(
    private from: number,
    private to: number,
    private step: number = 1,
  ) {}

  *[Symbol.iterator](): Generator<number> {
    // TODO: for (let n = from; n <= to; n += step) { yield n; }
  }
}

function* zip<A, B>(first: Iterable<A>, second: Iterable<B>): Generator<[A, B]> {
  // TODO: const a = first[Symbol.iterator](); const b = second[Symbol.iterator]();
  // у циклі беріть a.next() і b.next(); якщо хоч один done, завершіть; інакше yield [x.value, y.value]
}

const range = new NumberRange(1, 10, 3);
console.log([...range].join(","));
console.log(Math.max(...range), new Set(range).size);
console.log([...zip(range, ["a", "b", "c"])].map(([n, s]) => n + s).join(" "));
console.log([...zip("xyz", new Set([1, 2]))].length);
`,
    checks: [
      { on: "stdout", name: "Діапазон і пари", equals: "1,4,7,10\n10 4\n1a 4b 7c\n2", hint: "NumberRange(1, 10, 3) дає 1, 4, 7, 10, а zip зупиняється, коли закінчується коротше джерело." },
      { on: "source", name: "Протокол ітерації", matches: "Symbol\\.iterator", hint: "Реалізуйте *[Symbol.iterator]() у класі й користуйтеся first[Symbol.iterator]() у zip." },
      { on: "source", name: "Ручний виклик next", matches: "\\.next\\s*\\(", hint: "У zip викликайте next() в обох ітераторів і перевіряйте done." },
    ],
  },
  {
    ...base, id: "ts-immutable-cart", lesson: "ts/81", xp: 40,
    title: "Незмінні оновлення кошика",
    context: "Незмінні оновлення дозволяють зберігати історію станів і легко бачити, що змінилося. Помилки зі спільними вкладеними об'єктами в такому стилі зникають.",
    brief: [
      "Функції зараз <b>змінюють</b> кошик на місці. Перепишіть <code>addItem</code> і <code>renameOwner</code> так, щоб вони повертали <b>новий</b> кошик через розгортання і не чіпали вхідний, а <code>snapshot</code> робив глибоку копію через <code>structuredClone</code>.",
      "У <code>renameOwner</code> нове лише поле <code>owner</code>, тож масив <code>items</code> лишається спільним між кошиками. Це видно у виводі останнього рядка.",
    ],
    starter: raw`interface Item {
  title: string;
  price: number;
}

interface Cart {
  owner: { name: string };
  items: Item[];
}

function addItem(cart: Cart, item: Item): Cart {
  // TODO: повернути { ...cart, items: [...cart.items, item] }, не змінюючи cart
  cart.items.push(item);
  return cart;
}

function renameOwner(cart: Cart, name: string): Cart {
  // TODO: повернути { ...cart, owner: { ...cart.owner, name } }
  cart.owner.name = name;
  return cart;
}

function snapshot(cart: Cart): Cart {
  // TODO: структурована глибока копія
  return cart;
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
    checks: [
      { on: "stdout", name: "Оригінал незмінний", equals: "1 Олена\n2 Ігор\nfalse true\n1 Олена false", hint: "addItem і renameOwner не повинні змінювати вхідний кошик; snapshot повертає окремий об'єкт." },
      { on: "source", name: "Глибока копія", matches: "structuredClone\\s*\\(", hint: "У snapshot скористайтеся structuredClone(cart)." },
      { on: "source", name: "Розгортання без push", matches: "\\.\\.\\.cart", hint: "Нові кошики будуйте через { ...cart, ... } і не викликайте push на вхідному масиві." },
    ],
  },
  {
    ...base, id: "ts-url-query", lesson: "ts/82", xp: 30,
    title: "Побудова адреси й розбір параметрів",
    context: "Пошукові рядки, фільтри й пагінація складаються з параметрів запиту. URLSearchParams екранує значення, а читання з перевіркою не дає зламаному параметру потрапити в логіку.",
    brief: [
      "Допишіть <code>buildUrl(base, path, params)</code>: створіть <code>new URL(path, base)</code>, а для кожного параметра викличте <code>searchParams.set</code>. Якщо значення є масивом, додайте кожен елемент через <code>append</code>. Поверніть <code>href</code>.",
      "Допишіть <code>parseFilters(search)</code>: <code>page</code> це ціле число від 1 (інакше 1), а <code>tags</code> це всі значення параметра <code>tag</code> (<code>getAll</code>).",
    ],
    starter: raw`type Value = string | number | string[];

function buildUrl(base: string, path: string, params: Record<string, Value>): string {
  // TODO: new URL(path, base); set для рядків і чисел, append для кожного елемента масиву; повернути href
  return base;
}

function parseFilters(search: string): { page: number; tags: string[] } {
  // TODO: new URLSearchParams(search); page: ціле >= 1, інакше 1; tags: getAll("tag")
  return { page: 0, tags: [] };
}

console.log(buildUrl("https://shop.example/api/", "items", { q: "привіт світ", page: 2, tag: ["a", "b"] }));
console.log(JSON.stringify(parseFilters("?page=3&tag=x&tag=y")));
console.log(JSON.stringify(parseFilters("?page=abc")));
console.log(JSON.stringify(parseFilters("")));
`,
    checks: [
      { on: "stdout", name: "Адреса й фільтри", equals: "https://shop.example/api/items?q=%D0%BF%D1%80%D0%B8%D0%B2%D1%96%D1%82+%D1%81%D0%B2%D1%96%D1%82&page=2&tag=a&tag=b\n{\"page\":3,\"tags\":[\"x\",\"y\"]}\n{\"page\":1,\"tags\":[]}\n{\"page\":1,\"tags\":[]}", hint: "Кирилиця екранується автоматично, масив додається кількома append, а некоректна сторінка замінюється на 1." },
      { on: "source", name: "Використано searchParams", matches: "searchParams|URLSearchParams", hint: "Параметри складайте через url.searchParams, а не склеюванням рядків." },
      { on: "source", name: "Читання всіх тегів", matches: "getAll\\s*\\(", hint: "Усі значення параметра tag дає getAll(\"tag\")." },
    ],
  },
  {
    ...base, id: "ts-global-augment", lesson: "ts/83", xp: 35,
    title: "Розширення Array через declare global",
    context: "Розширення вбудованих типів потребує двох частин: оголошення типу й реалізації. Якщо забути одну з них, код або не скомпілюється, або впаде під час виконання.",
    brief: [
      "Файл уже є модулем (<code>export {}</code>). Допишіть у блок <code>declare global</code> метод <code>last(): T | undefined</code> для <code>Array&lt;T&gt;</code>.",
      "Додайте <b>реалізацію</b>: присвойте функцію в <code>Array.prototype.last</code>, що повертає останній елемент масиву (для порожнього <code>undefined</code>). Використайте параметр <code>this: unknown[]</code>.",
    ],
    starter: raw`export {};

declare global {
  interface Array<T> {
    // TODO: last(): T | undefined;
  }
}

// TODO: Array.prototype.last = function (this: unknown[]) { return this[this.length - 1]; };

console.log([1, 2, 3].last());
console.log(["a"].last());
console.log([].last());
`,
    checks: [
      { on: "stdout", name: "Останні елементи", equals: "3\na\nundefined", hint: "Для масиву з одного елемента це він сам, а для порожнього undefined." },
      { on: "source", name: "Є declare global", matches: "declare\\s+global", hint: "Розширення типів у модулі пишуть усередині declare global { ... }." },
      { on: "source", name: "Є реалізація", matches: "Array\\.prototype\\.last\\s*=", hint: "Присвойте функцію: Array.prototype.last = function (...) { ... }." },
    ],
  },
  {
    ...base, id: "ts-dom-fakes", lesson: "ts/84", xp: 35,
    title: "Валідація форми без DOM",
    context: "Логіка форми, що залежить від вузького інтерфейсу, тестується без браузера: замість справжніх елементів їй передають прості об'єкти потрібної форми.",
    brief: [
      "Типи полів уже виведено з DOM через <code>Pick</code>. Допишіть <code>validate(form)</code>: повертає масив повідомлень. Порожнє після <code>trim()</code> ім'я дає <code>ім'я обов'язкове</code>, пошта без <code>@</code> дає <code>некоректна пошта</code>, а відсутня згода дає <code>потрібна згода</code>.",
      "Функція <code>submit</code> уже готова. Справжній DOM не потрібен: у тесті поля задано звичайними об'єктами, які відповідають типам.",
    ],
    starter: raw`type TextField = Pick<HTMLInputElement, "value">;
type CheckField = Pick<HTMLInputElement, "checked">;

interface Form {
  name: TextField;
  email: TextField;
  agree: CheckField;
}

function validate(form: Form): string[] {
  // TODO: errors: порожнє name.value.trim() → "ім'я обов'язкове"; у email немає "@" → "некоректна пошта"; !agree.checked → "потрібна згода"
  return [];
}

function submit(form: Form): string {
  const errors = validate(form);
  return errors.length === 0 ? "надіслано: " + form.name.value.trim() : "помилки: " + errors.join("; ");
}

console.log(submit({ name: { value: " Олена " }, email: { value: "o@x.ua" }, agree: { checked: true } }));
console.log(submit({ name: { value: "  " }, email: { value: "oops" }, agree: { checked: false } }));
console.log(submit({ name: { value: "Ігор" }, email: { value: "no-at" }, agree: { checked: true } }));
`,
    checks: [
      { on: "stdout", name: "Результати перевірки", equals: "надіслано: Олена\nпомилки: ім'я обов'язкове; некоректна пошта; потрібна згода\nпомилки: некоректна пошта", hint: "Повідомлення додаються в порядку: ім'я, пошта, згода; для коректної форми масив порожній." },
      { on: "source", name: "Вузькі типи через Pick", matches: "Pick\\s*<\\s*HTMLInputElement", hint: "Типи полів мають лишатися вузькими: Pick<HTMLInputElement, ...>." },
      { on: "source", name: "Перевірка символу @", matches: "includes\\s*\\(\\s*[\"']@[\"']\\s*\\)|indexOf\\s*\\(\\s*[\"']@[\"']", hint: "Наявність @ перевіряйте через email.value.includes(\"@\")." },
    ],
  },
  {
    ...base, id: "ts-tsconfig-check", lesson: "ts/85", xp: 40,
    title: "Перевірка рекомендованих прапорців tsconfig",
    context: "tsconfig.json допускає коментарі, а звичайний JSON.parse їх не розуміє. Невеликий інструмент перевірки конфігурації показує, яких рекомендованих прапорців бракує проєкту.",
    brief: [
      "Допишіть <code>stripComments(text)</code>: приберіть блокові коментарі <code>/* ... */</code> і рядкові <code>// ...</code> до кінця рядка регулярними виразами. Допишіть <code>parseConfig(text)</code>: після очищення розберіть JSON у <code>try/catch</code>, а при помилці поверніть <code>null</code>.",
      "Допишіть <code>missingFlags(config, recommended)</code>: поверніть ті рекомендовані прапорці, які в <code>compilerOptions</code> не дорівнюють <code>true</code>. Поле <code>compilerOptions</code> має тип <code>unknown</code>, тож його треба звузити.",
    ],
    starter: raw`const configText = [
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
  // TODO: прибрати /* ... */ (з багаторядковими) і // до кінця рядка
  return text;
}

function parseConfig(text: string): Record<string, unknown> | null {
  // TODO: try { JSON.parse(stripComments(text)) ... } catch { return null; }
  return null;
}

function missingFlags(config: Record<string, unknown>, recommended: string[]): string[] {
  // TODO: звузьте config.compilerOptions до об'єкта й залиште прапорці, що не дорівнюють true
  return [];
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
    checks: [
      { on: "stdout", name: "Розбір і відсутні прапорці", equals: "розібрано\nnoUncheckedIndexedAccess\ntrue", hint: "Після видалення коментарів текст має стати коректним JSON; бракує лише noUncheckedIndexedAccess." },
      { on: "source", name: "Очищення регулярними виразами", matches: "replace\\s*\\(", hint: "Приберіть коментарі через text.replace(/.../g, \"\")." },
      { on: "source", name: "Розбір у try/catch", matches: "try\\s*\\{[\\s\\S]*JSON\\.parse[\\s\\S]*\\}\\s*catch", hint: "JSON.parse має бути в try/catch, а при помилці поверніть null." },
    ],
  },
];
