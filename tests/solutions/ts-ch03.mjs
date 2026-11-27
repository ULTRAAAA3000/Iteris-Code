// Еталони завдань глави 3 «Колекції» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_03 = {
  "ts-arrays-basic": raw`function largest(numbers: number[]): number | undefined {
  return numbers.length === 0 ? undefined : Math.max(...numbers);
}

function last(numbers: number[]): number | undefined {
  return numbers.at(-1);
}

console.log(largest([3, 9, 2]));
console.log(largest([]));
console.log(last([4, 5, 6]));
console.log(last([]));
`,
  "ts-array-methods": raw`type Product = { name: string; price: number; inStock: boolean };

const products: Product[] = [
  { name: "Хліб", price: 30, inStock: true },
  { name: "Молоко", price: 45, inStock: false },
  { name: "Сир", price: 120, inStock: true },
  { name: "Кава", price: 200, inStock: true },
];

function inStockNames(items: Product[]): string[] {
  return items.filter((p) => p.inStock).map((p) => p.name);
}

function totalPrice(items: Product[]): number {
  return items.filter((p) => p.inStock).reduce((sum, p) => sum + p.price, 0);
}

function firstExpensive(items: Product[], limit: number): Product | undefined {
  return items.find((p) => p.price > limit);
}

console.log(inStockNames(products).join(", "));
console.log(totalPrice(products));
console.log(firstExpensive(products, 100)?.name ?? "немає");
console.log(firstExpensive(products, 500)?.name ?? "немає");
`,
  "ts-readonly": raw`function addItem(list: readonly string[], item: string): string[] {
  return [...list, item];
}

function removeItem(list: readonly string[], item: string): string[] {
  return list.filter((x) => x !== item);
}

const original: readonly string[] = ["a", "b", "c"];

console.log(addItem(original, "d").join(","));
console.log(removeItem(original, "b").join(","));
console.log(original.length);
`,
  "ts-tuples": raw`function minMax(numbers: number[]): [min: number, max: number] {
  return [Math.min(...numbers), Math.max(...numbers)];
}

function splitName(full: string): [first: string, last: string] {
  const [first = "", last = ""] = full.split(" ");
  return [first, last];
}

const [min, max] = minMax([4, 9, 2, 7]);
console.log(min, max);

const [first, last] = splitName("Олена Коваль");
console.log(last + " " + first);
`,
  "ts-dictionary": raw`function invert(map: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(map)) {
    result[value] = key;
  }
  return result;
}

function getOrDefault(map: Record<string, number>, key: string, fallback: number): number {
  return Object.hasOwn(map, key) ? map[key] : fallback;
}

const prices: Record<string, number> = { хліб: 30, молоко: 45 };

console.log(JSON.stringify(invert({ a: "x", b: "y" })));
console.log(getOrDefault(prices, "хліб", 0));
console.log(getOrDefault(prices, "сир", -1));
console.log(getOrDefault(prices, "constructor", -1));
`,
  "ts-map-set": raw`function uniqueSorted(words: string[]): string[] {
  return [...new Set(words)].sort();
}

function groupByLength(words: string[]): Map<number, string[]> {
  const groups = new Map<number, string[]>();
  for (const word of words) {
    const group = groups.get(word.length) ?? [];
    group.push(word);
    groups.set(word.length, group);
  }
  return groups;
}

console.log(uniqueSorted(["b", "a", "b", "c", "a"]).join(","));
for (const [length, group] of groupByLength(["to", "be", "or", "not", "to", "be"])) {
  console.log(length, group.join(","));
}
`,
  "ts-destructuring": raw`type Settings = { theme: string; fontSize: number };
type Overrides = { theme?: string; fontSize?: number };

function swapPair(pair: [number, number]): [number, number] {
  const [a, b] = pair;
  return [b, a];
}

function mergeSettings(defaults: Settings, overrides: Overrides): Settings {
  return { ...defaults, ...overrides };
}

function splitHead(list: number[]): [number | undefined, number[]] {
  const [head, ...tail] = list;
  return [head, tail];
}

console.log(swapPair([1, 2]).join(","));
console.log(JSON.stringify(mergeSettings({ theme: "light", fontSize: 14 }, { fontSize: 18 })));
const [head, tail] = splitHead([1, 2, 3]);
console.log(head, tail.join(","));
`,
  "ts-sorting": raw`type Person = { name: string; age: number };

function sortAscending(numbers: readonly number[]): number[] {
  return [...numbers].sort((a, b) => a - b);
}

function sortPeople(people: Person[]): Person[] {
  return [...people].sort((a, b) => b.age - a.age || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
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
  "ts-word-frequency": raw`function topWords(text: string, limit: number): [string, number][] {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/);
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, limit);
}

const text = "Кіт бачить кота. Кіт їсть, кіт спить! Кота не видно.";
for (const [word, count] of topWords(text, 4)) {
  console.log(word + ": " + count);
}
`,
  "ts-object-entries": raw`function mapValues(
  obj: Record<string, number>,
  fn: (value: number) => number,
): Record<string, number> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]));
}

function totalValues(obj: Record<string, number>): number {
  return Object.values(obj).reduce((sum, value) => sum + value, 0);
}

const prices: Record<string, number> = { a: 1, b: 2, c: 3 };
console.log(JSON.stringify(mapValues(prices, (v) => v * 10)));
console.log(totalValues(prices));
console.log(JSON.stringify(prices));
`,
  "ts-matrix": raw`function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? 1 : 0)));
}

function transpose(m: number[][]): number[][] {
  if (m.length === 0) {
    return [];
  }
  return m[0].map((_, c) => m.map((row) => row[c]));
}

const toText = (m: number[][]): string => m.map((row) => row.join(" ")).join("\n");

console.log(toText(identity(3)));
console.log(toText(transpose([[1, 2, 3], [4, 5, 6]])));
`,
  "ts-safe-access": raw`function firstOr(list: string[], fallback: string): string {
  return list.at(0) ?? fallback;
}

function nth(list: number[], index: number): number | undefined {
  return index >= 0 && index < list.length ? list[index] : undefined;
}

function requireItem(list: string[], index: number): string {
  const item = list.at(index);
  if (item === undefined) {
    throw new Error("Немає елемента " + index);
  }
  return item;
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
};
