// Еталони завдань глави 2 «Основи мови» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_02 = {
  "ts-vars-inference": raw`const siteName = "Iteris";
let visitors = 0;

visitors = visitors + 3;
const rate = 0.5;
const income = visitors * rate;

console.log(siteName + ": " + visitors + " відвідувачів, дохід " + income);
`,
  "ts-basic-types": raw`const userName: string = "Оля";
const age: number = 29;
const isStudent: boolean = true;

console.log(userName + ", " + age + ", студент: " + (isStudent ? "так" : "ні"));
`,
  "ts-bigint-factorial": raw`function factorial(n: bigint): bigint {
  let result = 1n;
  for (let i = 2n; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log(factorial(5n).toString());
console.log(factorial(20n).toString());
console.log(factorial(25n).toString());
`,
  "ts-format-strings": raw`function formatName(first: string, last: string): string {
  const lastName = last[0].toUpperCase() + last.slice(1);
  const initial = first[0].toUpperCase();
  return ${"`"}${"$"}{lastName} ${"$"}{initial}.${"`"};
}

function slugify(title: string): string {
  return title.trim().toLowerCase().split(/\s+/).join("-");
}

console.log(formatName("олена", "коваль"));
console.log(slugify("  Мій перший   Пост "));
`,
  "ts-null-safe": raw`type User = { name: string; address?: { city?: string } };

function getCity(user: User | undefined): string {
  return user?.address?.city ?? "невідомо";
}

function visitsOrOne(visits: number | undefined): number {
  return visits ?? 1;
}

console.log(getCity({ name: "Анна", address: { city: "Львів" } }));
console.log(getCity({ name: "Олег" }));
console.log(getCity(undefined));
console.log(visitsOrOne(undefined), visitsOrOne(0), visitsOrOne(7));
`,
  "ts-unknown-safe": raw`function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

const samples: unknown[] = [42, "3.5", "abc", null, true, "", NaN];
for (const sample of samples) {
  console.log(toNumber(sample));
}
`,
  "ts-literal-config": raw`type Theme = "light" | "dark";

function applyTheme(theme: Theme, fontSize: number): string {
  return "Тема: " + theme + ", шрифт " + fontSize;
}

const settings = { theme: "dark", fontSize: 16 } as const;

console.log(applyTheme(settings.theme, settings.fontSize));
`,
  "ts-union-literals": raw`type Status = "idle" | "loading" | "done";

function statusLabel(status: Status): string {
  if (status === "idle") {
    return "Очікування";
  }
  if (status === "loading") {
    return "Завантаження";
  }
  return "Готово";
}

function formatId(id: string | number): string {
  return "#" + id;
}

console.log(statusLabel("idle"));
console.log(statusLabel("loading"));
console.log(statusLabel("done"));
console.log(formatId(7));
console.log(formatId("ab-12"));
`,
  "ts-narrowing": raw`function describe(value: string | number | string[]): string {
  if (typeof value === "string") {
    return "рядок довжиною " + value.length;
  }
  if (typeof value === "number") {
    return "число " + value.toFixed(2);
  }
  if (Array.isArray(value)) {
    return "масив з " + value.length + " елементів";
  }
  return "?";
}

console.log(describe("TypeScript"));
console.log(describe(3.14159));
console.log(describe(["a", "b", "c"]));
`,
  "ts-fizzbuzz": raw`function fizzBuzz(limit: number): string[] {
  const result: string[] = [];
  for (let i = 1; i <= limit; i++) {
    if (i % 15 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(String(i));
    }
  }
  return result;
}

console.log(fizzBuzz(15).join("\n"));
`,
  "ts-typed-functions": raw`function discount(price: number, percent: number): number {
  return price * (1 - percent / 100);
}

function average(numbers: number[]): number {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total / numbers.length;
}

console.log(discount(200, 15));
console.log(average([4, 8, 15, 16, 23, 42]));
`,
  "ts-params": raw`function sum(...numbers: number[]): number {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

function repeat(text: string, times = 2, separator?: string): string {
  const parts: string[] = [];
  for (let i = 0; i < times; i++) {
    parts.push(text);
  }
  return parts.join(separator ?? "");
}

console.log(sum(), sum(1, 2, 3));
console.log(repeat("ха"));
console.log(repeat("ха", 3, "-"));
`,
  "ts-callbacks": raw`type Predicate = (n: number) => boolean;

function filterNumbers(numbers: number[], predicate: Predicate): number[] {
  const result: number[] = [];
  for (const n of numbers) {
    if (predicate(n)) {
      result.push(n);
    }
  }
  return result;
}

function multiplier(factor: number): (n: number) => number {
  return (n) => n * factor;
}

const isEven: Predicate = (n) => n % 2 === 0;
console.log(filterNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isEven).join(","));
console.log(multiplier(3)(7));
`,
  "ts-overloads": raw`function reverse(value: string): string;
function reverse(value: number[]): number[];
function reverse(value: string | number[]): string | number[] {
  if (typeof value === "string") {
    return value.split("").reverse().join("");
  }
  return [...value].reverse();
}

console.log(reverse("abc"));
console.log(reverse([1, 2, 3]).join(","));
`,
};
