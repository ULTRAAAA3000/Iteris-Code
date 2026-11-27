// Еталони завдань глави 4 «Типи користувача» курсу TypeScript
const raw = String.raw;
const BT = "`";
const D = "$";

export const SOLUTIONS_04 = {
  "ts-interfaces": raw`interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "Оля", email: "olya@example.com" },
  { id: 2, name: "Іван", email: "ivan@example.com" },
];

function formatUser(user: User): string {
  return ${BT}#${D}{user.id} ${D}{user.name} <${D}{user.email}>${BT};
}

for (const user of users) {
  console.log(formatUser(user));
}
`,
  "ts-optional-readonly": raw`interface Product {
  readonly id: number;
  name: string;
  price: number;
  discount?: number;
}

function finalPrice(product: Product): number {
  const discount = product.discount ?? 0;
  return product.price * (1 - discount / 100);
}

function rename(product: Product, name: string): Product {
  return { ...product, name };
}

const book: Product = { id: 1, name: "Книга", price: 200, discount: 25 };
const pen: Product = { id: 2, name: "Ручка", price: 20 };

console.log(finalPrice(book), finalPrice(pen));
const renamed = rename(book, "Підручник");
console.log(renamed.name, renamed.id, book.name);
`,
  "ts-extend-intersect": raw`interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}
type Timestamped = { createdAt: string };
type DogRecord = Dog & Timestamped;

const record: DogRecord = { name: "Рекс", breed: "лабрадор", createdAt: "2026-11-20" };

function describeDog(dog: DogRecord): string {
  return ${BT}${D}{dog.name} (${D}{dog.breed}), додано ${D}{dog.createdAt}${BT};
}

console.log(describeDog(record));
`,
  "ts-classes": raw`class BankAccount {
  balance: number;

  constructor(initial: number) {
    this.balance = initial;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount > this.balance) {
      return false;
    }
    this.balance -= amount;
    return true;
  }
}

const account = new BankAccount(100);
account.deposit(50);
console.log(account.withdraw(500));
console.log(account.withdraw(30));
console.log(account.balance);
`,
  "ts-access": raw`class Wallet {
  private balance = 0;

  constructor(readonly owner: string) {}

  add(amount: number): void {
    this.balance += amount;
  }

  spend(amount: number): boolean {
    if (amount > this.balance) {
      return false;
    }
    this.balance -= amount;
    return true;
  }

  show(): string {
    return ${BT}${D}{this.owner}: ${D}{this.balance}${BT};
  }
}

const wallet = new Wallet("Оля");
wallet.add(100);
console.log(wallet.spend(30));
console.log(wallet.spend(500));
console.log(wallet.show());
`,
  "ts-static-accessors": raw`class Temperature {
  private _celsius = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Нижче абсолютного нуля");
    }
    this._celsius = value;
  }

  get fahrenheit(): number {
    return this._celsius * 1.8 + 32;
  }

  static fromFahrenheit(f: number): Temperature {
    const t = new Temperature();
    t.celsius = (f - 32) / 1.8;
    return t;
  }
}

const t = Temperature.fromFahrenheit(212);
console.log(t.celsius, t.fahrenheit);
try {
  t.celsius = -300;
} catch (error) {
  console.log(error instanceof Error ? error.message : "невідома помилка");
}
console.log(t.celsius);
`,
  "ts-structural": raw`type XY = { x: number; y: number };

class Point {
  constructor(public x: number, public y: number) {}
}

function totalLength(items: { length: number }[]): number {
  let total = 0;
  for (const item of items) {
    total += item.length;
  }
  return total;
}

function distance(a: XY, b: XY): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

console.log(totalLength(["ab", [1, 2, 3], { length: 5 }]));
console.log(distance(new Point(0, 0), { x: 3, y: 4 }));
`,
  "ts-enum": raw`enum Level {
  Low = 1,
  Medium,
  High,
}

function levelName(level: Level): string {
  return Level[level];
}

function parseLevel(text: string): Level | undefined {
  switch (text.toLowerCase()) {
    case "low":
      return Level.Low;
    case "medium":
      return Level.Medium;
    case "high":
      return Level.High;
    default:
      return undefined;
  }
}

console.log(levelName(Level.Medium));
console.log(parseLevel("HIGH"));
console.log(parseLevel("zzz"));
`,
  "ts-abstract": raw`abstract class Shape {
  abstract area(): number;
  abstract title(): string;

  describe(): string {
    return this.title() + ": площа " + this.area().toFixed(2);
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  title(): string {
    return "Коло";
  }
}

class Rect extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  title(): string {
    return "Прямокутник";
  }
}

const shapes: Shape[] = [new Circle(1), new Rect(2, 3)];
for (const shape of shapes) {
  console.log(shape.describe());
}
`,
};
