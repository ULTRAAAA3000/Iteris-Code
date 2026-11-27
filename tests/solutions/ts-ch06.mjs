// Еталони завдань глави 6 «Помилки й безпека типів» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_06 = {
  "ts-try-catch": raw`function messageOf(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function parseJson(text: string, fallback: unknown): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    return fallback;
  }
}

console.log(messageOf(new Error("збій")));
console.log(messageOf("рядок"));
console.log(messageOf(42));
console.log(JSON.stringify(parseJson('{"a":1}', null)));
console.log(JSON.stringify(parseJson("{ зламано", "запасне")));
`,
  "ts-custom-errors": raw`class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAge(age: number): number {
  if (!(age >= 0 && age <= 150)) {
    throw new ValidationError("age", "Вік має бути від 0 до 150");
  }
  return age;
}

function loadAge(text: string): number {
  try {
    return validateAge(Number(text));
  } catch (error) {
    throw new Error("Не вдалося прочитати вік", { cause: error });
  }
}

try {
  console.log(validateAge(30));
  validateAge(200);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.field + ": " + error.message);
  }
}

try {
  loadAge("-5");
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
    console.log(error.cause instanceof ValidationError ? "причина: " + error.cause.field : "без причини");
  }
}
`,
  "ts-discriminated": raw`type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: string }
  | { status: "error"; message: string };

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}

function describeState(state: LoadState): string {
  switch (state.status) {
    case "idle":
      return "очікування";
    case "loading":
      return "завантаження";
    case "done":
      return "готово: " + state.data;
    case "error":
      return "помилка: " + state.message;
  }
}

console.log(area({ kind: "circle", radius: 1 }).toFixed(2));
console.log(area({ kind: "rect", width: 2, height: 3 }));
console.log(describeState({ status: "done", data: "дані" }));
console.log(describeState({ status: "error", message: "збій" }));
console.log(describeState({ status: "loading" }));
`,
  "ts-exhaustive": raw`type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; a: number; b: number; c: number };

function assertNever(value: never): never {
  throw new Error("Необроблений варіант: " + JSON.stringify(value));
}

function perimeter(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return 2 * Math.PI * shape.radius;
    case "rect":
      return 2 * (shape.width + shape.height);
    case "triangle":
      return shape.a + shape.b + shape.c;
    default:
      return assertNever(shape);
  }
}

const labels: Record<Shape["kind"], string> = {
  circle: "Коло",
  rect: "Прямокутник",
  triangle: "Трикутник",
};

console.log(perimeter({ kind: "circle", radius: 1 }).toFixed(2));
console.log(perimeter({ kind: "rect", width: 2, height: 3 }).toFixed(2));
console.log(perimeter({ kind: "triangle", a: 3, b: 4, c: 5 }).toFixed(2));
console.log(labels.triangle);
`,
  "ts-result": raw`type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parsePort(text: string): Result<number, string> {
  const port = Number(text);
  if (text.trim() === "" || !Number.isInteger(port)) {
    return { ok: false, error: "Порт має бути числом" };
  }
  if (port < 1 || port > 65535) {
    return { ok: false, error: "Порт має бути від 1 до 65535" };
  }
  return { ok: true, value: port };
}

function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
}

for (const input of ["8080", "0", "abc", "70000"]) {
  const result = parsePort(input);
  console.log(result.ok ? "порт " + result.value : "помилка: " + result.error);
}

const doubled = mapResult(parsePort("21"), (n) => n * 2);
console.log(doubled.ok ? doubled.value : doubled.error);
`,
  "ts-type-guards": raw`interface User {
  id: number;
  name: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

function parseUsers(data: unknown): User[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(isUser);
}

console.log(isStringArray(["а", "б"]));
console.log(isStringArray(["а", 1]));

const data: unknown = JSON.parse('[{"id":1,"name":"Оля"},{"id":"x","name":1},{"id":2,"name":"Іван"},null]');
const users = parseUsers(data);
console.log(users.map((u) => u.name).join(","));
console.log(users.length);
`,
  "ts-assertions": raw`function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIsString(value: unknown, message: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(message);
  }
}

function parseConfig(data: unknown): { host: string; port: number } {
  assert(typeof data === "object" && data !== null, "Конфігурація має бути об'єктом");
  const host = "host" in data ? data.host : undefined;
  const port = "port" in data ? data.port : undefined;
  assertIsString(host, "host має бути рядком");
  assert(typeof port === "number", "Немає порту");
  return { host, port };
}

for (const input of [{ host: "localhost", port: 8080 }, { host: "localhost" }, { host: 5, port: 1 }]) {
  try {
    const config = parseConfig(input);
    console.log(config.host + ":" + config.port);
  } catch (error) {
    console.log(error instanceof Error ? error.message : "невідома помилка");
  }
}
`,
};
