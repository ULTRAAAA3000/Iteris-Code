// Практичні завдання курсу TypeScript: по одному на кожен урок. Запускаються на сервері (runtime: "remote"):
// компілятор tsc перевіряє типи (помилка типу видно в терміналі як помилка компіляції), потім програма виконується.
// Еталони: tests/solutions/ts.mjs. Один файл: import/export із різних файлів у пісочниці недоступні.
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "ts", runtime: "remote", lang: "ts", file: "main.ts", editorLang: "typescript", premium: false } as const;

export const TS_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "ts-hello-types", lesson: "ts/1", xp: 15,
    title: "Перший запуск і перша помилка типу",
    context: "Головна відмінність TypeScript: помилку типу видно ще до запуску програми. Компілятор не дасть записати число в змінну, оголошену як рядок.",
    brief: [
      "У заготовці змінна <code>greeting</code> оголошена як <code>string</code>, але їй присвоєно число: код не компілюється. Прочитайте помилку в терміналі й виправте її: запишіть у змінну рядок <code>Привіт, TypeScript!</code> і виведіть його через <code>console.log</code>.",
    ],
    starter: raw`const greeting: string = 42;

console.log(greeting);
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, TypeScript!»", has: "Привіт, TypeScript!" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, TypeScript!" },
      { on: "source", name: "Змінна має тип string", matches: "greeting\\s*:\\s*string" },
    ],
  },
  {
    ...base, id: "ts-annotate-js", lesson: "ts/2", xp: 15,
    title: "Із JavaScript у TypeScript: додайте типи",
    context: "Перехід на TypeScript починається з анотацій типів параметрів і результату функцій. Після цього компілятор ловить виклики з неправильними аргументами.",
    brief: [
      "Функції <code>add</code> і <code>shout</code> написані як звичайний JavaScript. Додайте типи: <code>add(a: number, b: number): number</code> і <code>shout(text: string): string</code>.",
      "Виведіть <code>5</code> і <code>HELLO!</code>.",
    ],
    starter: raw`function add(a, b) {
  return a + b;
}

function shout(text) {
  return text.toUpperCase() + "!";
}

console.log(add(2, 3));
console.log(shout("hello"));
`,
    checks: [
      { on: "stdout", name: "add(2, 3) дає 5", has: "5\n" },
      { on: "stdout", name: "shout(\"hello\") дає HELLO!", has: "HELLO!" },
      { on: "source", name: "Параметри add мають тип number", matches: "add\\s*\\(\\s*a\\s*:\\s*number\\s*,\\s*b\\s*:\\s*number\\s*\\)\\s*:\\s*number" },
      { on: "source", name: "Параметр shout має тип string", matches: "shout\\s*\\(\\s*text\\s*:\\s*string\\s*\\)\\s*:\\s*string" },
    ],
  },
  {
    ...base, id: "ts-basic-types", lesson: "ts/3", xp: 20,
    title: "Базові типи: масив, кортеж, boolean",
    context: "Масив чисел, пара «ім'я і вік», прапорець: базові типи описують форму даних, і компілятор стежить, щоб її не порушили.",
    brief: [
      "Виправте помилки типів: <code>pair</code> має тип кортежу <code>[string, number]</code>, тому другим елементом має бути число, а не рядок.",
      "Виведіть сумму <code>scores</code> (<code>Сума: 225</code>), ім'я з пари (<code>Оля</code>) і значення <code>flag</code> (<code>true</code>) трьома рядками.",
    ],
    starter: raw`const scores: number[] = [90, 75, 60];
const pair: [string, number] = ["Оля", "25"];
let flag: boolean = true;

// TODO: виведіть суму scores, ім'я з pair і flag
`,
    checks: [
      { on: "stdout", name: "Сума: 225", has: "Сума: 225" },
      { on: "stdout", name: "Ім'я з кортежу: Оля", has: "Сума: 225\nОля" },
      { on: "stdout", name: "Значення прапорця: true", has: "Оля\ntrue" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сума: 225\nОля\ntrue" },
      { on: "source", name: "pair лишається кортежем [string, number]", matches: "pair\\s*:\\s*\\[\\s*string\\s*,\\s*number\\s*\\]" },
    ],
  },
  {
    ...base, id: "ts-typed-functions", lesson: "ts/4", xp: 20,
    title: "Типізація функцій: необов'язкові та rest-параметри",
    context: "Необов'язковий параметр і значення за замовчуванням роблять функцію зручною, а rest-параметр приймає будь-яку кількість аргументів. Типи гарантують, що з ними працюють правильно.",
    brief: [
      "Допишіть <code>discount(price: number, percent: number = 10): number</code>: ціна після знижки (за замовчуванням 10 %).",
      "Допишіть <code>sum(...nums: number[]): number</code>: сума будь-якої кількості чисел.",
    ],
    starter: raw`function discount(price: number, percent: number = 10): number {
  // TODO
  return price;
}

function sum(...nums: number[]): number {
  // TODO
  return 0;
}

console.log(discount(200));
console.log(discount(200, 25));
console.log(sum(4, 8, 15));
`,
    checks: [
      { on: "stdout", name: "Знижка 10 % за замовчуванням: 180", has: "180\n" },
      { on: "stdout", name: "Знижка 25 %: 150", has: "180\n150\n" },
      { on: "stdout", name: "Сума трьох чисел: 27", has: "150\n27" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "180\n150\n27" },
    ],
  },
  {
    ...base, id: "ts-union-literals", lesson: "ts/5", xp: 25,
    title: "Union-типи і літеральні типи",
    context: "Статус замовлення це не «будь-який рядок», а одне з кількох значень. Літеральний тип описує їх явно, і компілятор не пропустить помилку в написанні.",
    brief: [
      "Тип <code>Status</code> уже описаний. Допишіть <code>label(s: Status): string</code> через <code>switch</code>: <code>active</code> дає <code>Активний</code>, <code>blocked</code> дає <code>Заблокований</code>, <code>pending</code> дає <code>Очікує</code>.",
      "Допишіть <code>formatId(id: string | number): string</code>: повертає <code>ID-</code> і значення. Виклик <code>label(\"deleted\")</code> у заготовці помилковий: приберіть його.",
    ],
    starter: raw`type Status = "active" | "blocked" | "pending";

function label(s: Status): string {
  // TODO: switch за значенням s
  return "";
}

function formatId(id: string | number): string {
  // TODO
  return "";
}

console.log(label("active"));
console.log(label("pending"));
console.log(label("deleted"));
console.log(formatId(42));
console.log(formatId("a7"));
`,
    checks: [
      { on: "stdout", name: "active: Активний", has: "Активний" },
      { on: "stdout", name: "pending: Очікує", has: "Активний\nОчікує" },
      { on: "stdout", name: "Ідентифікатори: ID-42 і ID-a7", has: "ID-42\nID-a7" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Активний\nОчікує\nID-42\nID-a7" },
      { on: "source", name: "Некоректний виклик label(\"deleted\") прибрано", has: "deleted", not: true },
    ],
  },
  {
    ...base, id: "ts-narrowing", lesson: "ts/6", xp: 25,
    title: "Звуження типів: typeof, null і in",
    context: "Значення з union-типу не можна використовувати, поки компілятор не знає, що саме це: string чи number, є значення чи null. Перевірка typeof або if (x) звужує тип і відкриває потрібні методи.",
    brief: [
      "Допишіть <code>describe(x: string | number | null): string</code>: для рядка <code>рядок з N символів</code>, для числа <code>число N з двома знаками</code> (<code>toFixed(2)</code>), для <code>null</code> <code>немає значення</code>.",
      "Допишіть <code>area(shape: Circle | Square): number</code>: якщо в об'єкті є поле <code>radius</code> (оператор <code>in</code>), це коло (<code>3 * radius * radius</code> для простоти), інакше квадрат (<code>side * side</code>).",
    ],
    starter: raw`type Circle = { radius: number };
type Square = { side: number };

function describe(x: string | number | null): string {
  // TODO: typeof x === "string" / "number", інакше null
  return "";
}

function area(shape: Circle | Square): number {
  // TODO: "radius" in shape
  return 0;
}

console.log(describe("hello"));
console.log(describe(3.14159));
console.log(describe(null));
console.log(area({ radius: 2 }));
console.log(area({ side: 4 }));
`,
    checks: [
      { on: "stdout", name: "Рядок: рядок з 5 символів", has: "рядок з 5 символів" },
      { on: "stdout", name: "Число: число 3.14 з двома знаками", has: "число 3.14 з двома знаками" },
      { on: "stdout", name: "null: немає значення", has: "немає значення" },
      { on: "stdout", name: "Площі: 12 і 16", has: "немає значення\n12\n16" },
      { on: "source", name: "Використано typeof", has: "typeof" },
      { on: "source", name: "Використано оператор in", matches: "\"radius\"\\s+in\\s+shape|'radius'\\s+in\\s+shape" },
    ],
  },
  {
    ...base, id: "ts-interfaces", lesson: "ts/7", xp: 30,
    title: "Інтерфейс User: необов'язкові й readonly поля",
    context: "Інтерфейс описує форму об'єкта: які поля є, яких типів, які необов'язкові, які не можна змінювати. Так описують дані користувача, замовлення, відповіді API.",
    brief: [
      "Опишіть <code>interface User</code>: <code>readonly id: number</code>, <code>name: string</code>, <code>age: number</code> та необов'язкове <code>email?: string</code>.",
      "Допишіть <code>greet(user: User): string</code>: <code>Привіт, &lt;name&gt;!</code>, а якщо email є, додайте <code> (&lt;email&gt;)</code>.",
    ],
    starter: raw`// TODO: interface User з полями id (readonly), name, age і необов'язковим email

function greet(user: User): string {
  // TODO
  return "";
}

const olya: User = { id: 1, name: "Оля", age: 25, email: "olya@example.com" };
const ivan: User = { id: 2, name: "Іван", age: 30 };

console.log(greet(olya));
console.log(greet(ivan));
`,
    checks: [
      { on: "stdout", name: "Привітання з email", has: "Привіт, Оля! (olya@example.com)" },
      { on: "stdout", name: "Привітання без email", has: "Привіт, Іван!" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Привіт, Оля! (olya@example.com)\nПривіт, Іван!" },
      { on: "source", name: "Поле id позначено readonly", matches: "readonly\\s+id\\s*:\\s*number" },
      { on: "source", name: "Поле email необов'язкове", matches: "email\\s*\\?\\s*:\\s*string" },
    ],
  },
  {
    ...base, id: "ts-extend-intersect", lesson: "ts/8", xp: 30,
    title: "Розширення інтерфейсів і перетин типів",
    context: "Спільні поля виносять у базовий тип, а потім розширюють: Dog це Animal плюс порода. Перетин (&) склеює кілька типів в один: пост це основа плюс мітка часу.",
    brief: [
      "Опишіть <code>interface Dog extends Animal</code> з додатковим полем <code>breed: string</code>.",
      "Опишіть <code>type Post = Base &amp; Timestamps</code> (перетин уже описаних типів).",
    ],
    starter: raw`interface Animal {
  name: string;
}

// TODO: interface Dog extends Animal з полем breed: string

type Base = { id: number; title: string };
type Timestamps = { createdAt: string };

// TODO: type Post = Base & Timestamps

const rex: Dog = { name: "Рекс", breed: "лабрадор" };
const post: Post = { id: 1, title: "Привіт", createdAt: "2026-11-16" };

console.log(rex.name + " " + rex.breed);
console.log(post.id + " " + post.title + " " + post.createdAt);
`,
    checks: [
      { on: "stdout", name: "Dog має поля Animal і breed", has: "Рекс лабрадор" },
      { on: "stdout", name: "Post поєднує поля обох типів", has: "1 Привіт 2026-11-16" },
      { on: "source", name: "Dog розширює Animal", matches: "interface\\s+Dog\\s+extends\\s+Animal" },
      { on: "source", name: "Post це перетин типів", matches: "type\\s+Post\\s*=\\s*Base\\s*&\\s*Timestamps" },
    ],
  },
  {
    ...base, id: "ts-classes", lesson: "ts/9", xp: 35,
    title: "Клас з private-полем і implements",
    context: "Модифікатори доступу не дають зовнішньому коду зіпсувати внутрішній стан: баланс рахунку змінюється лише через методи. Інтерфейс гарантує, що клас вміє потрібне.",
    brief: [
      "Опишіть клас <code>Account implements Payable</code> з приватним полем <code>balance</code> (задається в конструкторі через <code>private balance: number</code>), методом <code>pay(amount: number): boolean</code> (знімає суму і повертає <code>true</code>, якщо коштів вистачає, інакше <code>false</code>) і геттером-методом <code>getBalance(): number</code>.",
    ],
    starter: raw`interface Payable {
  pay(amount: number): boolean;
}

// TODO: class Account implements Payable

const acc = new Account(100);
console.log(acc.pay(30));
console.log(acc.pay(500));
console.log(acc.getBalance());
`,
    checks: [
      { on: "stdout", name: "Оплата 30 проходить (true)", has: "true\n" },
      { on: "stdout", name: "Оплата 500 відхиляється (false)", has: "true\nfalse" },
      { on: "stdout", name: "Баланс після оплати: 70", has: "false\n70" },
      { on: "source", name: "Клас реалізує Payable", matches: "class\\s+Account\\s+implements\\s+Payable" },
      { on: "source", name: "Баланс приватний", matches: "private\\s+balance\\s*:\\s*number" },
    ],
  },
  {
    ...base, id: "ts-generics", lesson: "ts/10", xp: 35,
    title: "Узагальнення: first<T> і Stack<T>",
    context: "Узагальнення (generics) дозволяють написати функцію чи клас один раз для будь-якого типу й не втратити перевірку типів: перший елемент масиву чисел це число, масиву рядків це рядок.",
    brief: [
      "Допишіть <code>first&lt;T&gt;(items: T[]): T | undefined</code>: перший елемент або <code>undefined</code>.",
      "Допишіть клас <code>Stack&lt;T&gt;</code> з методами <code>push(item: T): void</code>, <code>pop(): T | undefined</code> і властивістю-геттером <code>size</code> (кількість елементів).",
    ],
    starter: raw`function first<T>(items: T[]): T | undefined {
  // TODO
  return undefined;
}

class Stack<T> {
  private items: T[] = [];
  // TODO: push, pop і get size()
}

console.log(first([10, 20, 30]));
console.log(first(["a", "b"]));
console.log(first([]));

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
console.log(stack.size);
console.log(stack.pop());
console.log(stack.size);
`,
    checks: [
      { on: "stdout", name: "first для чисел і рядків: 10 і a", has: "10\na\n" },
      { on: "stdout", name: "first для порожнього масиву: undefined", has: "a\nundefined" },
      { on: "stdout", name: "Стек: розмір 2, pop дає 2, розмір 1", has: "undefined\n2\n2\n1" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "10\na\nundefined\n2\n2\n1" },
      { on: "source", name: "Клас Stack узагальнений", matches: "class\\s+Stack\\s*<\\s*T\\s*>" },
    ],
  },
  {
    ...base, id: "ts-utility-types", lesson: "ts/11", xp: 35,
    title: "Утилітарні типи: Partial, Pick, Record",
    context: "Утилітарні типи будують нові типи з існуючих: Partial робить усі поля необов'язковими (зручно для оновлення), Pick бере лише потрібні поля, Record описує словник.",
    brief: [
      "Допишіть <code>update(user: User, patch: Partial&lt;User&gt;): User</code>: нова копія користувача з оновленими полями (<code>{ ...user, ...patch }</code>).",
      "Опишіть <code>type Preview = Pick&lt;User, \"name\" | \"email\"&gt;</code> і словник <code>stock: Record&lt;string, number&gt;</code> із залишками <code>apple: 5</code>, <code>pear: 0</code>.",
    ],
    starter: raw`interface User {
  id: number;
  name: string;
  email: string;
}

function update(user: User, patch: Partial<User>): User {
  // TODO
  return user;
}

// TODO: type Preview = Pick<User, "name" | "email">

const user: User = { id: 1, name: "Оля", email: "olya@example.com" };
const preview: Preview = { name: user.name, email: user.email };
// TODO: const stock: Record<string, number> = ...

console.log(JSON.stringify(update(user, { name: "Олена" })));
console.log(JSON.stringify(preview));
console.log(JSON.stringify(stock));
`,
    checks: [
      { on: "stdout", name: "update змінює лише вказані поля", has: '{"id":1,"name":"Олена","email":"olya@example.com"}' },
      { on: "stdout", name: "Preview містить два поля", has: '{"name":"Оля","email":"olya@example.com"}' },
      { on: "stdout", name: "Словник залишків", has: '{"apple":5,"pear":0}' },
      { on: "source", name: "Використано Partial", has: "Partial<User>" },
      { on: "source", name: "Використано Pick і Record", matches: "Pick\\s*<[\\s\\S]*Record\\s*<" },
    ],
  },
  {
    ...base, id: "ts-api-types", lesson: "ts/12", xp: 40,
    title: "Типи для відповіді API і type guard",
    context: "Дані з мережі приходять як рядок JSON і мають тип unknown: компілятор не знає, що всередині. Тому типізують відповідь і додають перевірку (type guard), перш ніж довіряти даним. У пісочниці немає мережі, тому відповідь це готовий рядок; у справжньому проєкті це результат fetch.",
    brief: [
      "Інтерфейс <code>ApiResponse&lt;T&gt;</code> описаний. Допишіть type guard <code>isUser(x: unknown): x is User</code>: перевіряє, що <code>x</code> це об'єкт з числом <code>id</code> та рядком <code>name</code>.",
      "Допишіть <code>parseUser(json: string): ApiResponse&lt;User&gt;</code>: розберіть JSON; якщо це користувач, поверніть <code>{ data, error: null }</code>, інакше <code>{ data: null, error: \"некоректні дані\" }</code>.",
    ],
    starter: raw`interface User {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

function isUser(x: unknown): x is User {
  // TODO: x це об'єкт з number id і string name
  return false;
}

function parseUser(json: string): ApiResponse<User> {
  // TODO: JSON.parse, перевірка через isUser
  return { data: null, error: "не реалізовано" };
}

console.log(JSON.stringify(parseUser('{"id": 1, "name": "Оля"}')));
console.log(JSON.stringify(parseUser('{"id": "x"}')));
`,
    checks: [
      { on: "stdout", name: "Коректні дані: {data, error: null}", has: '{"data":{"id":1,"name":"Оля"},"error":null}' },
      { on: "stdout", name: "Некоректні дані: error «некоректні дані»", has: '{"data":null,"error":"некоректні дані"}' },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: '{"data":{"id":1,"name":"Оля"},"error":null}\n{"data":null,"error":"некоректні дані"}' },
      { on: "source", name: "isUser це type guard", matches: "x\\s+is\\s+User" },
      { on: "source", name: "Використано JSON.parse", has: "JSON.parse(" },
    ],
  },
];
