// Завдання глави 3 «Колекції» (уроки 19–30). Еталони: tests/solutions/ts-ch03.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "ts-arrays-basic", lesson: "ts/19", xp: 15,
    title: "Найбільше й останнє: безпечна робота з масивом",
    context: "Порожній масив трапляється частіше, ніж здається: порожній кошик, порожня відповідь пошуку. Функції, що повертають number або undefined, чесно описують цей випадок і змушують викликача його обробити.",
    brief: [
      "Допишіть <code>largest(numbers: number[]): number | undefined</code>: найбільше число або <code>undefined</code>, якщо масив порожній.",
      "Допишіть <code>last(numbers: number[]): number | undefined</code>: останній елемент, а для порожнього масиву <code>undefined</code>. Скористайтеся методом <code>at</code>.",
    ],
    starter: raw`function largest(numbers: number[]): number | undefined {
  // TODO: найбільше число або undefined для порожнього масиву
  return undefined;
}

function last(numbers: number[]): number | undefined {
  // TODO: останній елемент через at()
  return undefined;
}

console.log(largest([3, 9, 2]));
console.log(largest([]));
console.log(last([4, 5, 6]));
console.log(last([]));
`,
    checks: [
      { on: "stdout", name: "9, undefined, 6, undefined", equals: "9\nundefined\n6\nundefined", hint: "Для порожнього масиву поверніть undefined, а не 0 чи -Infinity." },
      { on: "source", name: "Використано at", matches: "\\.at\\(", hint: "Останній елемент дає numbers.at(-1)." },
      { on: "source", name: "Найбільше шукається через Math.max або цикл", matches: "Math\\.max|for\\s*\\(", hint: "Скористайтеся Math.max(...numbers) або переберіть числа циклом." },
    ],
  },
  {
    ...base, id: "ts-array-methods", lesson: "ts/20", xp: 25,
    title: "Каталог товарів: filter, reduce і find",
    context: "Типовий звіт по замовленнях це відібрати потрібні записи, дістати поля й підрахувати суму. Саме для цього створені методи масивів, а типи на кожному кроці виводяться автоматично.",
    brief: [
      "Допишіть <code>inStockNames</code>, що повертає назви товарів у наявності, <code>totalPrice</code>, що додає ціни товарів у наявності, та <code>firstExpensive</code>, що знаходить перший товар дорожчий за ліміт.",
      "Використайте <code>filter</code>, <code>map</code>, <code>reduce</code> та <code>find</code>. Результат <code>firstExpensive</code> має бути <code>Product | undefined</code>.",
    ],
    starter: raw`type Product = { name: string; price: number; inStock: boolean };

const products: Product[] = [
  { name: "Хліб", price: 30, inStock: true },
  { name: "Молоко", price: 45, inStock: false },
  { name: "Сир", price: 120, inStock: true },
  { name: "Кава", price: 200, inStock: true },
];

function inStockNames(items: Product[]): string[] {
  // TODO: назви товарів у наявності
  return [];
}

function totalPrice(items: Product[]): number {
  // TODO: сума цін товарів у наявності
  return 0;
}

function firstExpensive(items: Product[], limit: number): Product | undefined {
  // TODO: перший товар дорожчий за limit
  return undefined;
}

console.log(inStockNames(products).join(", "));
console.log(totalPrice(products));
console.log(firstExpensive(products, 100)?.name ?? "немає");
console.log(firstExpensive(products, 500)?.name ?? "немає");
`,
    checks: [
      { on: "stdout", name: "Назви, сума й пошук", equals: "Хліб, Сир, Кава\n350\nСир\nнемає", hint: "Сума товарів у наявності: 30 + 120 + 200 = 350." },
      { on: "source", name: "Використано filter і map", matches: "\\.filter\\([\\s\\S]*\\.map\\(|\\.map\\([\\s\\S]*\\.filter\\(", hint: "Спершу filter(...), потім map(...)." },
      { on: "source", name: "Використано reduce з початковим значенням", matches: "\\.reduce\\([\\s\\S]*,\\s*0\\s*\\)", hint: "Початкове значення reduce це 0." },
      { on: "source", name: "Використано find", matches: "\\.find\\(", hint: "Для пошуку першого підхожого товару є find." },
    ],
  },
  {
    ...base, id: "ts-readonly", lesson: "ts/21", xp: 20,
    title: "Незмінні операції зі списком",
    context: "Функції, що змінюють вхідні дані, породжують складні для пошуку баги. Параметр readonly дає гарантію, що ваш масив не зіпсують, а нові значення повертаються новим масивом.",
    brief: [
      "Функції <code>addItem</code> і <code>removeItem</code> мають приймати <code>readonly string[]</code> і не змінювати його. Вони повертають <b>новий</b> масив: з доданим елементом і без вказаного елемента.",
      "Вихідний масив <code>original</code> після викликів має лишитися незмінним, тож у програмі виводиться його довжина.",
    ],
    starter: raw`function addItem(list: string[], item: string): string[] {
  list.push(item);
  return list;
}

function removeItem(list: string[], item: string): string[] {
  // TODO: новий масив без item
  return list;
}

const original: readonly string[] = ["a", "b", "c"];

console.log(addItem(original, "d").join(","));
console.log(removeItem(original, "b").join(","));
console.log(original.length);
`,
    checks: [
      { on: "stdout", name: "Додавання, видалення й незмінний оригінал", equals: "a,b,c,d\na,c\n3", hint: "Оригінал має лишитися з трьох елементів." },
      { on: "source", name: "Параметри readonly string[]", matches: "readonly\\s+string\\[\\]", hint: "Запишіть параметр як list: readonly string[]." },
      { on: "source", name: "Масив не змінюється через push", matches: "^(?![\\s\\S]*\\.push\\()[\\s\\S]*$", hint: "Не використовуйте push: створіть новий масив через spread чи filter." },
    ],
  },
  {
    ...base, id: "ts-tuples", lesson: "ts/22", xp: 20,
    title: "Кортежі: мінімум і максимум, ім'я та прізвище",
    context: "Кортеж зручний, коли функція повертає кілька значень різних типів. Деструктуризація дає кожному значенню ім'я, а типи гарантують, що ви не переплутаєте порядок.",
    brief: [
      "Допишіть <code>minMax(numbers: number[]): [min: number, max: number]</code>, що повертає найменше й найбільше число.",
      "Допишіть <code>splitName(full: string): [first: string, last: string]</code>, що ділить повне ім'я за пробілом.",
    ],
    starter: raw`function minMax(numbers: number[]): [min: number, max: number] {
  // TODO
  return [0, 0];
}

function splitName(full: string): [first: string, last: string] {
  // TODO
  return ["", ""];
}

const [min, max] = minMax([4, 9, 2, 7]);
console.log(min, max);

const [first, last] = splitName("Олена Коваль");
console.log(last + " " + first);
`,
    checks: [
      { on: "stdout", name: "2 9 і «Коваль Олена»", equals: "2 9\nКоваль Олена", hint: "minMax([4, 9, 2, 7]) дає [2, 9]." },
      { on: "source", name: "Іменований кортеж для minMax", matches: "\\[\\s*min\\s*:\\s*number\\s*,\\s*max\\s*:\\s*number\\s*\\]", hint: "Залишіть тип результату [min: number, max: number]." },
      { on: "source", name: "Ім'я ділиться за пробілом", matches: "split\\(\\s*[\"'] [\"']\\s*\\)", hint: "Скористайтеся full.split(\" \")." },
    ],
  },
  {
    ...base, id: "ts-dictionary", lesson: "ts/23", xp: 20,
    title: "Словники: обернути й безпечно прочитати",
    context: "Словники використовують для кешів, перекладів і таблиць відповідності. Безпечне читання з перевіркою наявності ключа уберігає від повернення сміття з прототипу замість відсутнього значення.",
    brief: [
      "Допишіть <code>invert</code>, що міняє місцями ключі й значення словника рядків. Допишіть <code>getOrDefault</code>, що повертає значення за ключем або запасне, коли ключа немає.",
      "Для перевірки наявності ключа використайте <code>Object.hasOwn</code>: тоді ключі на кшталт <code>constructor</code> теж оброблятимуться правильно.",
    ],
    starter: raw`function invert(map: Record<string, string>): Record<string, string> {
  // TODO: ключі стають значеннями, а значення ключами
  return {};
}

function getOrDefault(map: Record<string, number>, key: string, fallback: number): number {
  // TODO: значення за ключем або fallback
  return fallback;
}

const prices: Record<string, number> = { хліб: 30, молоко: 45 };

console.log(JSON.stringify(invert({ a: "x", b: "y" })));
console.log(getOrDefault(prices, "хліб", 0));
console.log(getOrDefault(prices, "сир", -1));
console.log(getOrDefault(prices, "constructor", -1));
`,
    checks: [
      { on: "stdout", name: "Обернений словник і читання", equals: "{\"x\":\"a\",\"y\":\"b\"}\n30\n-1\n-1", hint: "Для ключа constructor має вийти -1: використайте Object.hasOwn." },
      { on: "source", name: "Використано Object.hasOwn", matches: "Object\\.hasOwn\\(", hint: "Перевірте наявність: Object.hasOwn(map, key)." },
      { on: "source", name: "Перебір пар через Object.entries", matches: "Object\\.entries\\(", hint: "Для invert зручно перебрати Object.entries(map)." },
    ],
  },
  {
    ...base, id: "ts-map-set", lesson: "ts/24", xp: 25,
    title: "Унікальні слова й групування за довжиною",
    context: "Set прибирає дублі, а Map групує дані за ключем. Ця пара інструментів потрібна для індексів, тегів і звітів, коли треба швидко знайти все, що має спільну ознаку.",
    brief: [
      "Допишіть <code>uniqueSorted(words: string[]): string[]</code>: унікальні слова за алфавітом (скористайтеся <code>Set</code>).",
      "Допишіть <code>groupByLength(words: string[]): Map&lt;number, string[]&gt;</code>: ключ довжина слова, значення список слів цієї довжини в порядку появи.",
    ],
    starter: raw`function uniqueSorted(words: string[]): string[] {
  // TODO: унікальні слова за алфавітом
  return [];
}

function groupByLength(words: string[]): Map<number, string[]> {
  // TODO: Map<довжина, слова>
  return new Map();
}

console.log(uniqueSorted(["b", "a", "b", "c", "a"]).join(","));
for (const [length, group] of groupByLength(["to", "be", "or", "not", "to", "be"])) {
  console.log(length, group.join(","));
}
`,
    checks: [
      { on: "stdout", name: "Унікальні слова й групи", equals: "a,b,c\n2 to,be,or,to,be\n3 not", hint: "Група довжини 2 містить усі двосимвольні слова в порядку появи, зі повторами." },
      { on: "source", name: "Використано Set", matches: "new\\s+Set\\b", hint: "Дублі прибере new Set(words)." },
      { on: "source", name: "Використано Map і get з ??", matches: "\\.get\\([^)]*\\)\\s*\\?\\?", hint: "Читайте групу через map.get(key) ?? [] і додавайте слово." },
    ],
  },
  {
    ...base, id: "ts-destructuring", lesson: "ts/25", xp: 20,
    title: "Деструктуризація, spread і rest",
    context: "Обмін значень, злиття налаштувань і відокремлення голови списку записуються в один рядок, якщо знати деструктуризацію та spread. Типи при цьому переходять до змінних автоматично.",
    brief: [
      "Допишіть <code>swapPair</code> (поміняти місцями два числа), <code>mergeSettings</code> (налаштування за замовчуванням, поверх них зміни) і <code>splitHead</code> (перший елемент і решта списку).",
      "Використайте деструктуризацію, spread та rest, а не індекси й цикли.",
    ],
    starter: raw`type Settings = { theme: string; fontSize: number };
type Overrides = { theme?: string; fontSize?: number };

function swapPair(pair: [number, number]): [number, number] {
  // TODO
  return pair;
}

function mergeSettings(defaults: Settings, overrides: Overrides): Settings {
  // TODO
  return defaults;
}

function splitHead(list: number[]): [number | undefined, number[]] {
  // TODO
  return [undefined, list];
}

console.log(swapPair([1, 2]).join(","));
console.log(JSON.stringify(mergeSettings({ theme: "light", fontSize: 14 }, { fontSize: 18 })));
const [head, tail] = splitHead([1, 2, 3]);
console.log(head, tail.join(","));
`,
    checks: [
      { on: "stdout", name: "Обмін, злиття й голова зі списком", equals: "2,1\n{\"theme\":\"light\",\"fontSize\":18}\n1 2,3", hint: "Злиття: { ...defaults, ...overrides }." },
      { on: "source", name: "Використано spread об'єктів", matches: "\\.\\.\\.defaults[\\s\\S]*\\.\\.\\.overrides", hint: "Запишіть { ...defaults, ...overrides }." },
      { on: "source", name: "Використано rest у деструктуризації", matches: "\\[\\s*\\w+\\s*,\\s*\\.\\.\\.\\w+\\s*\\]\\s*=", hint: "Запишіть const [head, ...tail] = list;" },
    ],
  },
  {
    ...base, id: "ts-sorting", lesson: "ts/26", xp: 25,
    title: "Сортування без побічних ефектів",
    context: "Сортування змінює масив на місці, тому вихідні дані легко зіпсувати. Безпечний шаблон це копія, компаратор і явне порівняння, а числа без компаратора впорядковуються неправильно.",
    brief: [
      "Допишіть <code>sortAscending(numbers: readonly number[]): number[]</code>: числа за зростанням, вхідний масив не змінюється.",
      "Допишіть <code>sortPeople(people: Person[]): Person[]</code>: спершу старші (вік за спаданням), при однаковому віці за алфавітом імені. Вхідний масив теж не змінюється.",
    ],
    starter: raw`type Person = { name: string; age: number };

function sortAscending(numbers: readonly number[]): number[] {
  // TODO: копія й компаратор
  return [];
}

function sortPeople(people: Person[]): Person[] {
  // TODO: вік за спаданням, потім ім'я
  return [];
}

const nums = [10, 9, 1];
console.log(sortAscending(nums).join(","), nums.join(","));

const people: Person[] = [
  { name: "Ivan", age: 30 },
  { name: "Olha", age: 25 },
  { name: "Anna", age: 30 },
];
console.log(sortPeople(people).map((p) => p.name + ":" + p.age).join(" "));
`,
    checks: [
      { on: "stdout", name: "Сортування чисел і людей", equals: "1,9,10 10,9,1\nAnna:30 Ivan:30 Olha:25", hint: "Вихідний масив nums має лишитися 10,9,1." },
      { on: "source", name: "Числовий компаратор", matches: "\\(\\s*a\\s*,\\s*b\\s*\\)\\s*=>\\s*a\\s*-\\s*b", hint: "Для чисел за зростанням: (a, b) => a - b." },
      { on: "source", name: "Масив копіюється перед sort", matches: "\\[\\s*\\.\\.\\.\\w+\\s*\\]\\s*\\.sort|\\.slice\\(\\)\\s*\\.sort", hint: "Спершу скопіюйте: [...numbers].sort(...)." },
    ],
  },
  {
    ...base, id: "ts-word-frequency", lesson: "ts/27", xp: 30,
    title: "Частотний словник слів",
    context: "Підрахунок частот лежить в основі аналітики, пошуку й підказок. Розбити текст, порахувати слова в Map і відсортувати результат це шаблон, який повторюється в безлічі реальних задач.",
    brief: [
      "Допишіть <code>topWords(text: string, limit: number): [string, number][]</code>: нормалізуйте текст (нижній регістр, без розділових знаків), розбийте на слова, порахуйте в <code>Map</code>, відсортуйте за кількістю за спаданням, а при рівності за алфавітом (порівнюйте слова через <code>&lt;</code> та <code>&gt;</code>), поверніть перші <code>limit</code> пар.",
      "Програма друкує результат у форматі <code>слово: кількість</code>.",
    ],
    starter: raw`function topWords(text: string, limit: number): [string, number][] {
  // TODO: нормалізація, підрахунок у Map, сортування, перші limit
  return [];
}

const text = "Кіт бачить кота. Кіт їсть, кіт спить! Кота не видно.";
for (const [word, count] of topWords(text, 4)) {
  console.log(word + ": " + count);
}
`,
    checks: [
      { on: "stdout", name: "Чотири найчастіші слова", equals: "кіт: 3\nкота: 2\nбачить: 1\nвидно: 1", hint: "При однаковій кількості слова йдуть за алфавітом: «бачить» перед «видно»." },
      { on: "source", name: "Підрахунок у Map", matches: "new\\s+Map\\b", hint: "Лічильники зручно тримати в Map<string, number>." },
      { on: "source", name: "Нормалізація: toLowerCase", matches: "toLowerCase\\(\\)", hint: "Слова «Кіт» і «кіт» мають рахуватися разом." },
    ],
  },
  {
    ...base, id: "ts-object-entries", lesson: "ts/28", xp: 30,
    title: "Перетворення значень об'єкта",
    context: "Змінити всі значення словника, наприклад застосувати знижку до цін, найзручніше через пари: перетворити об'єкт на масив пар, обробити їх і зібрати назад. Так вихідний об'єкт лишається недоторканим.",
    brief: [
      "Допишіть <code>mapValues(obj, fn)</code>: повертає новий словник із тими самими ключами, а значення пропущено через <code>fn</code>. Допишіть <code>totalValues(obj)</code>: сума всіх значень.",
      "Скористайтеся <code>Object.entries</code> та <code>Object.fromEntries</code>.",
    ],
    starter: raw`function mapValues(
  obj: Record<string, number>,
  fn: (value: number) => number,
): Record<string, number> {
  // TODO: Object.entries, map, Object.fromEntries
  return {};
}

function totalValues(obj: Record<string, number>): number {
  // TODO: сума значень
  return 0;
}

const prices: Record<string, number> = { a: 1, b: 2, c: 3 };
console.log(JSON.stringify(mapValues(prices, (v) => v * 10)));
console.log(totalValues(prices));
console.log(JSON.stringify(prices));
`,
    checks: [
      { on: "stdout", name: "Нові значення, сума й незмінний оригінал", equals: "{\"a\":10,\"b\":20,\"c\":30}\n6\n{\"a\":1,\"b\":2,\"c\":3}", hint: "Оригінал prices не змінюється: створюйте новий об'єкт." },
      { on: "source", name: "Використано Object.fromEntries", matches: "Object\\.fromEntries\\(", hint: "Зберіть результат через Object.fromEntries(...)." },
      { on: "source", name: "Використано Object.entries", matches: "Object\\.entries\\(", hint: "Отримайте пари через Object.entries(obj)." },
    ],
  },
  {
    ...base, id: "ts-matrix", lesson: "ts/29", xp: 30,
    title: "Одинична матриця й транспонування",
    context: "Сітки використовують в іграх, таблицях і обробці зображень. Правильно створити таблицю, щоб рядки не ділили одне посилання, і вміти транспонувати її це базові прийоми роботи з матрицями.",
    brief: [
      "Допишіть <code>identity(n: number): number[][]</code>: квадратна матриця розміру <code>n</code> з одиницями на головній діагоналі й нулями в решті. Рядки мають бути окремими масивами.",
      "Допишіть <code>transpose(m: number[][]): number[][]</code>: рядки стають стовпцями.",
    ],
    starter: raw`function identity(n: number): number[][] {
  // TODO
  return [];
}

function transpose(m: number[][]): number[][] {
  // TODO
  return [];
}

const toText = (m: number[][]): string => m.map((row) => row.join(" ")).join("\n");

console.log(toText(identity(3)));
console.log(toText(transpose([[1, 2, 3], [4, 5, 6]])));
`,
    checks: [
      { on: "stdout", name: "Одинична 3x3 і транспонована 3x2", equals: "1 0 0\n0 1 0\n0 0 1\n1 4\n2 5\n3 6", hint: "Транспонована матриця 2x3 має три рядки по два числа." },
      { on: "source", name: "Рядки створюються окремо через Array.from", matches: "Array\\.from\\(", hint: "Створюйте рядки через Array.from({ length: n }, () => ...)." },
      { on: "source", name: "Немає fill із спільним масивом", matches: "^(?![\\s\\S]*fill\\(\\s*\\[)[\\s\\S]*$", hint: "fill([]) розділяє один масив між усіма рядками." },
    ],
  },
  {
    ...base, id: "ts-safe-access", lesson: "ts/30", xp: 30,
    title: "Безпечний доступ до елементів",
    context: "Вихід за межі масиву належить до найчастіших причин аварій. Функції, що чесно повертають undefined або кидають зрозумілу помилку, роблять місця доступу за індексом безпечними й передбачуваними.",
    brief: [
      "Допишіть <code>firstOr(list, fallback)</code>: перший елемент або запасне значення. Допишіть <code>nth(list, index)</code>: елемент за індексом або <code>undefined</code>, якщо індекс поза межами. Допишіть <code>requireItem(list, index)</code>: елемент або <code>Error</code> з текстом <code>Немає елемента N</code>.",
      "Напишіть реалізації без оператора <code>!</code>.",
    ],
    starter: raw`function firstOr(list: string[], fallback: string): string {
  // TODO
  return fallback;
}

function nth(list: number[], index: number): number | undefined {
  // TODO: undefined, якщо індекс поза межами
  return undefined;
}

function requireItem(list: string[], index: number): string {
  // TODO: кинути Error("Немає елемента " + index)
  return "";
}

console.log(firstOr(["а"], "—"), firstOr([], "—"));
console.log(nth([5, 6, 7], 1), nth([5, 6, 7], 7));
try {
  console.log(requireItem(["x", "y"], 1));
  requireItem(["x"], 3);
} catch (error) {
  console.log(error instanceof Error ? error.message : "невідома помилка");
}
`,
    checks: [
      { on: "stdout", name: "Запасне значення, nth і помилка", equals: "а —\n6 undefined\ny\nНемає елемента 3", hint: "requireItem(['x'], 3) має кинути Error з текстом «Немає елемента 3»." },
      { on: "source", name: "Кидається Error", matches: "throw\\s+new\\s+Error\\(", hint: "Кидайте помилку: throw new Error(...)." },
      { on: "source", name: "Без оператора !", matches: "^(?![\\s\\S]*\\w!\\.|[\\s\\S]*\\]!)[\\s\\S]*$", hint: "Не використовуйте ! для приховування undefined: перевірте значення явно." },
    ],
  },
];
