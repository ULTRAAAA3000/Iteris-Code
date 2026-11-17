// Еталонні рішення завдань TypeScript (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const TS = {
  "ts-hello-types": raw`const greeting: string = "Привіт, TypeScript!";

console.log(greeting);
`,
  "ts-annotate-js": raw`function add(a: number, b: number): number {
  return a + b;
}

function shout(text: string): string {
  return text.toUpperCase() + "!";
}

console.log(add(2, 3));
console.log(shout("hello"));
`,
  "ts-basic-types": raw`const scores: number[] = [90, 75, 60];
const pair: [string, number] = ["Оля", 25];
let flag: boolean = true;

console.log("Сума: " + scores.reduce((a, b) => a + b, 0));
console.log(pair[0]);
console.log(flag);
`,
  "ts-typed-functions": raw`function discount(price: number, percent: number = 10): number {
  return price * (1 - percent / 100);
}

function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

console.log(discount(200));
console.log(discount(200, 25));
console.log(sum(4, 8, 15));
`,
  "ts-union-literals": raw`type Status = "active" | "blocked" | "pending";

function label(s: Status): string {
  switch (s) {
    case "active":
      return "Активний";
    case "blocked":
      return "Заблокований";
    case "pending":
      return "Очікує";
  }
}

function formatId(id: string | number): string {
  return "ID-" + id;
}

console.log(label("active"));
console.log(label("pending"));
console.log(formatId(42));
console.log(formatId("a7"));
`,
  "ts-narrowing": raw`type Circle = { radius: number };
type Square = { side: number };

function describe(x: string | number | null): string {
  if (typeof x === "string") return "рядок з " + x.length + " символів";
  if (typeof x === "number") return "число " + x.toFixed(2) + " з двома знаками";
  return "немає значення";
}

function area(shape: Circle | Square): number {
  if ("radius" in shape) return 3 * shape.radius * shape.radius;
  return shape.side * shape.side;
}

console.log(describe("hello"));
console.log(describe(3.14159));
console.log(describe(null));
console.log(area({ radius: 2 }));
console.log(area({ side: 4 }));
`,
  "ts-interfaces": raw`interface User {
  readonly id: number;
  name: string;
  age: number;
  email?: string;
}

function greet(user: User): string {
  return "Привіт, " + user.name + "!" + (user.email ? " (" + user.email + ")" : "");
}

const olya: User = { id: 1, name: "Оля", age: 25, email: "olya@example.com" };
const ivan: User = { id: 2, name: "Іван", age: 30 };

console.log(greet(olya));
console.log(greet(ivan));
`,
  "ts-extend-intersect": raw`interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

type Base = { id: number; title: string };
type Timestamps = { createdAt: string };

type Post = Base & Timestamps;

const rex: Dog = { name: "Рекс", breed: "лабрадор" };
const post: Post = { id: 1, title: "Привіт", createdAt: "2026-11-16" };

console.log(rex.name + " " + rex.breed);
console.log(post.id + " " + post.title + " " + post.createdAt);
`,
  "ts-classes": raw`interface Payable {
  pay(amount: number): boolean;
}

class Account implements Payable {
  constructor(private balance: number) {}

  pay(amount: number): boolean {
    if (amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }

  getBalance(): number {
    return this.balance;
  }
}

const acc = new Account(100);
console.log(acc.pay(30));
console.log(acc.pay(500));
console.log(acc.getBalance());
`,
  "ts-generics": raw`function first<T>(items: T[]): T | undefined {
  return items[0];
}

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  get size(): number {
    return this.items.length;
  }
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
  "ts-utility-types": raw`interface User {
  id: number;
  name: string;
  email: string;
}

function update(user: User, patch: Partial<User>): User {
  return { ...user, ...patch };
}

type Preview = Pick<User, "name" | "email">;

const user: User = { id: 1, name: "Оля", email: "olya@example.com" };
const preview: Preview = { name: user.name, email: user.email };
const stock: Record<string, number> = { apple: 5, pear: 0 };

console.log(JSON.stringify(update(user, { name: "Олена" })));
console.log(JSON.stringify(preview));
console.log(JSON.stringify(stock));
`,
  "ts-api-types": raw`interface User {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null && typeof (x as User).id === "number" && typeof (x as User).name === "string";
}

function parseUser(json: string): ApiResponse<User> {
  const parsed: unknown = JSON.parse(json);
  if (isUser(parsed)) return { data: parsed, error: null };
  return { data: null, error: "некоректні дані" };
}

console.log(JSON.stringify(parseUser('{"id": 1, "name": "Оля"}')));
console.log(JSON.stringify(parseUser('{"id": "x"}')));
`,
};
