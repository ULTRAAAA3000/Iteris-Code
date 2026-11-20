// Еталони завдань глави 1 «Початок» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_01 = {
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
  "ts-runtime-check": raw`function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}

const samples: unknown[] = [5, -1, "7", NaN, null, 0.5];
for (const value of samples) {
  console.log(isPositiveNumber(value));
}
`,
  "ts-strict-fix": raw`function double(x: number): number {
  return x * 2;
}

let title: string | null = null;

console.log(double(21));
title = "Готово";
console.log(title);
`,
};
