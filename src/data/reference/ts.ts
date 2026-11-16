import type { RefSection } from "./types.ts";

const raw = String.raw;

export const ts: RefSection[] = [
  { t: "Основи", items: [
    { t: "Що додає TypeScript", code: raw`let age: number = 16;
let name: string = "Олена";
let ok: boolean = true;
age = "шістнадцять";   // помилка: рядок не number`, note: "TypeScript це JavaScript із типами. Помилки типів видно під час написання коду, а не в браузері." },
    { t: "Компіляція", code: raw`npm install -D typescript
npx tsc --init      # створити tsconfig.json
npx tsc             # перевірити й зібрати в JS`, note: "Браузер не виконує `.ts` напряму, код перетворюється на JavaScript." },
  ] },
  { t: "Типи", items: [
    { t: "Базові типи й вивід", code: raw`let n = 5;                  // тип виводиться сам: number
let list: number[] = [1, 2, 3];
let pair: [string, number] = ["вік", 16];   // кортеж
let anything: unknown = "текст";
let id: string | number = 7;                // об'єднання`, note: "Не пишіть тип там, де компілятор виводить його сам. `unknown` безпечніший за `any`." },
    { t: "Літеральні типи й enum", code: raw`type Level = "easy" | "medium" | "hard";
let lvl: Level = "easy";

enum Color { Red, Green, Blue }
console.log(Color.Green);   // 1`, note: "Літеральний тип дозволяє лише перелічені значення." },
  ] },
  { t: "Функції", items: [
    { t: "Типи параметрів і результату", code: raw`function add(a: number, b: number): number {
  return a + b;
}
const greet = (name: string, title?: string): string =>
  title ? title + " " + name : name;
function log(msg: string): void { console.log(msg); }`, note: "Знак `?` робить параметр необов'язковим. `void` означає, що значення не повертається." },
  ] },
  { t: "Інтерфейси й типи", items: [
    { t: "interface і type", code: raw`interface User {
  id: number;
  name: string;
  email?: string;        // необов'язкове поле
  readonly role: string; // лише читання
}
type Point = { x: number; y: number };

const u: User = { id: 1, name: "Олена", role: "admin" };`, note: "Інтерфейс описує форму об'єкта. Для об'єднань і простих псевдонімів використовують `type`." },
    { t: "Розширення й об'єднання", code: raw`interface Admin extends User {
  permissions: string[];
}
type Result = Success | Failure;   // одне з двох`, note: "`extends` додає поля до існуючого інтерфейсу." },
  ] },
  { t: "Звуження типів", items: [
    { t: "typeof, in, перевірки", code: raw`function show(v: string | number) {
  if (typeof v === "string") {
    return v.toUpperCase();   // тут v це string
  }
  return v.toFixed(2);        // а тут number
}`, note: "Після перевірки компілятор знає точніший тип змінної." },
  ] },
  { t: "Узагальнення", items: [
    { t: "Generics", code: raw`function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([1, 2, 3]);       // number | undefined
const s = first(["a", "b"]);      // string | undefined

interface Box<T> { value: T }`, note: "`<T>` це параметр типу: функція працює з будь-яким типом, зберігаючи його." },
  ] },
  { t: "Утилітарні типи", items: [
    { t: "Partial, Pick, Record", code: raw`type UserPatch = Partial<User>;          // усі поля необов'язкові
type Preview = Pick<User, "id" | "name">; // лише вибрані поля
type Without = Omit<User, "email">;       // усі, крім вказаних
const prices: Record<string, number> = { хліб: 24 };`, note: "Готові типи-перетворювачі економлять опис нових типів." },
  ] },
  { t: "Класи", items: [
    { t: "Модифікатори доступу", code: raw`class Account {
  private balance = 0;
  constructor(public owner: string) {}

  deposit(sum: number): void {
    this.balance += sum;
  }
  get total(): number { return this.balance; }
}`, note: "`public`, `private` та `protected` керують доступом. `public` у конструкторі одразу створює поле." },
  ] },
  { t: "Робота з API", items: [
    { t: "Типізований fetch", code: raw`interface Item { id: number; title: string }

async function load(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error("Помилка " + res.status);
  return (await res.json()) as Item[];
}`, note: "Відповідь сервера компілятор перевірити не може, тому тип вказують явно (`as`) або перевіряють дані." },
  ] },
];
