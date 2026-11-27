// Еталони завдань глави 5 «Абстракція: generics і система типів» курсу TypeScript
const raw = String.raw;
const BT = "`";
const D = "$";

export const SOLUTIONS_05 = {
  "ts-generics": raw`function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}

function repeat<T>(value: T, times: number): T[] {
  return Array.from({ length: times }, () => value);
}

function swap<T>(pair: [T, T]): [T, T] {
  const [a, b] = pair;
  return [b, a];
}

console.log(firstItem(["а", "б"]), firstItem<number>([]));
console.log(repeat("ха", 3).join("-"));
console.log(swap([1, 2]).join(","));
`,
  "ts-constraints": raw`type Product = { id: number; name: string; price: number };

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

function sumBy<T>(items: T[], getValue: (item: T) => number): number {
  let total = 0;
  for (const item of items) {
    total += getValue(item);
  }
  return total;
}

console.log(longest("abc", "de"));
console.log(longest([1, 2], [1, 2, 3]).join(","));

const products: Product[] = [
  { id: 1, name: "Хліб", price: 30 },
  { id: 2, name: "Сир", price: 120 },
];
console.log(findById(products, 2)?.name ?? "немає");
console.log(sumBy(products, (p) => p.price));
`,
  "ts-generic-classes": raw`class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items.at(-1);
  }

  get size(): number {
    return this.items.length;
  }
}

interface Box<T> {
  value: T;
}

function unbox<T>(box: Box<T>): T {
  return box.value;
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.peek());
console.log(stack.pop());
console.log(stack.size);

const box: Box<string> = { value: "привіт" };
console.log(unbox(box));
`,
  "ts-multi-generics": raw`type Pair<A, B = A> = [A, B];

function mapArray<T, U>(items: T[], fn: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of items) {
    result.push(fn(item));
  }
  return result;
}

function zip<A, B>(first: A[], second: B[]): [A, B][] {
  return first.map((item, index) => [item, second[index]]);
}

const same: Pair<number> = [1, 2];
console.log(mapArray([1, 2, 3], (n) => "№" + n).join(","));
console.log(JSON.stringify(zip(["а", "б"], [1, 2])));
console.log(same.join(","));
`,
  "ts-keyof": raw`const config = { host: "localhost", port: 3000, debug: false };

type ConfigKey = keyof typeof config;

function keysOf<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

function describe(key: ConfigKey): string {
  return key + "=" + String(config[key]);
}

for (const key of keysOf(config)) {
  console.log(describe(key));
}
`,
  "ts-get-prop": raw`interface Person {
  name: string;
  age: number;
}

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const people: Person[] = [
  { name: "Оля", age: 25 },
  { name: "Іван", age: 30 },
];

console.log(getProp(people[0], "name"));
console.log(pluck(people, "age").join(","));
console.log(pluck(people, "name").join(","));
`,
  "ts-utility-types": raw`interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, "password">;
type UserSummary = Pick<User, "id" | "name">;

function toPublic(user: User): PublicUser {
  const { password, ...rest } = user;
  return rest;
}

function applyChanges(user: User, changes: Partial<User>): User {
  return { ...user, ...changes };
}

function summarize(user: User): UserSummary {
  return { id: user.id, name: user.name };
}

const user: User = { id: 1, name: "Оля", email: "olya@example.com", password: "секрет" };
console.log(JSON.stringify(toPublic(user)));
console.log(applyChanges(user, { name: "Олена" }).name);
console.log(JSON.stringify(summarize(user)));
`,
  "ts-satisfies": raw`type Theme = { background: string; accent: string };

const themes = {
  light: { background: "#ffffff", accent: "#0066cc" },
  dark: { background: "#111111", accent: "#66aaff" },
} satisfies Record<string, Theme>;

console.log(themes.dark.background);
console.log(themes.light.accent);
`,
  "ts-mapped": raw`type Nullable<T> = { [K in keyof T]: T[K] | null };
type Getters<T> = { [K in keyof T]: () => T[K] };

interface User {
  id: number;
  name: string;
}

function makeGetters<T extends object>(obj: T): Getters<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = () => (obj as Record<string, unknown>)[key];
  }
  return result as Getters<T>;
}

const draft: Nullable<User> = { id: 1, name: null };
const getters = makeGetters({ id: 1, name: "Оля" });
console.log(draft.name, getters.id(), getters.name());
`,
  "ts-conditional": raw`type Flatten<T> = T extends unknown[] ? T[number] : T;

function compact<T>(items: (T | null | undefined)[]): NonNullable<T>[] {
  const result: NonNullable<T>[] = [];
  for (const item of items) {
    if (item !== null && item !== undefined) {
      result.push(item);
    }
  }
  return result;
}

const first: Flatten<string[]> = "рядок";
const second: Flatten<number> = 5;
console.log(first, second, compact([1, null, 2, undefined]).join(","));
`,
  "ts-infer": raw`type ElementOf<T> = T extends (infer U)[] ? U : never;
type ReturnOf<T> = T extends (...args: never[]) => infer R ? R : never;
type FirstArg<T> = T extends (first: infer A, ...rest: never[]) => unknown ? A : never;

function makeUser(id: number, name: string) {
  return { id, name };
}

const letter: ElementOf<string[]> = "а";
const user: ReturnOf<typeof makeUser> = { id: 1, name: "Оля" };
const arg: FirstArg<typeof makeUser> = 5;

console.log(letter.toUpperCase(), user.name, arg + 1);
`,
  "ts-template-types": raw`type EventName<T extends string> = ${BT}on${D}{Capitalize<T>}${BT};
type Getters<T> = {
  [K in keyof T as ${BT}get${D}{Capitalize<K & string>}${BT}]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

const person: Getters<Person> = { getName: () => "Оля", getAge: () => 29 };
const handler: EventName<"click"> = "onClick";

console.log(person.getName(), person.getAge(), handler);
`,
};
