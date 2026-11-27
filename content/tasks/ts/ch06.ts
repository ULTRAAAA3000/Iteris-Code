// Завдання глави 6 «Помилки й безпека типів» (уроки 52–58). Еталони: tests/solutions/ts-ch06.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "ts-try-catch", lesson: "ts/52", xp: 20,
    title: "Безпечне читання помилок і розбір JSON",
    context: "Кинути можна що завгодно, тому змінна в catch має тип unknown. Допоміжна функція, що з будь-якої помилки робить текст, і безпечний розбір JSON із запасним значенням потрібні майже в кожному застосунку.",
    brief: [
      "Допишіть <code>messageOf(error: unknown): string</code>: для <code>Error</code> повертає <code>message</code>, для решти значення <code>String(error)</code>.",
      "Допишіть <code>parseJson(text: string, fallback: unknown): unknown</code>: розбирає JSON, а якщо текст некоректний, повертає <code>fallback</code>. Використайте <code>try/catch</code>.",
    ],
    starter: raw`function messageOf(error: unknown): string {
  // TODO: Error → message, інше → String(error)
  return "";
}

function parseJson(text: string, fallback: unknown): unknown {
  // TODO: try/catch навколо JSON.parse
  return fallback;
}

console.log(messageOf(new Error("збій")));
console.log(messageOf("рядок"));
console.log(messageOf(42));
console.log(JSON.stringify(parseJson('{"a":1}', null)));
console.log(JSON.stringify(parseJson("{ зламано", "запасне")));
`,
    checks: [
      { on: "stdout", name: "Повідомлення й розбір", equals: "збій\nрядок\n42\n{\"a\":1}\n\"запасне\"", hint: "Некоректний JSON має повернути fallback, а не кинути помилку." },
      { on: "source", name: "Є перевірка instanceof Error", matches: "instanceof\\s+Error", hint: "Спершу перевірте error instanceof Error." },
      { on: "source", name: "Використано try/catch", matches: "try\\s*\\{[\\s\\S]*\\}\\s*catch", hint: "Обгорніть JSON.parse у try/catch." },
    ],
  },
  {
    ...base, id: "ts-custom-errors", lesson: "ts/53", xp: 25,
    title: "Власна помилка валідації та cause",
    context: "Помилки валідації несуть назву поля, а техніка cause дозволяє загорнути низькорівневу помилку у зрозуміле повідомлення, не втрачаючи оригінал. Так розрізняють причини збоїв і прості в діагностиці.",
    brief: [
      "Напишіть клас <code>ValidationError extends Error</code> з публічним полем <code>field</code> та ім'ям <code>ValidationError</code>. Допишіть <code>validateAge(age)</code>: вік від 0 до 150 повертається, інакше кидається <code>ValidationError(\"age\", \"Вік має бути від 0 до 150\")</code>.",
      "<code>loadAge(text)</code> перетворює текст на число, викликає <code>validateAge</code> і будь-яку помилку загортає в <code>new Error(\"Не вдалося прочитати вік\", { cause: error })</code>.",
    ],
    starter: raw`// TODO: class ValidationError extends Error { field, name }

function validateAge(age: number): number {
  // TODO
  return age;
}

function loadAge(text: string): number {
  // TODO: try/catch, обгорніть помилку з cause
  return validateAge(Number(text));
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
    checks: [
      { on: "stdout", name: "Вік, помилка валідації й причина", equals: "30\nage: Вік має бути від 0 до 150\nНе вдалося прочитати вік\nпричина: age", hint: "loadAge має кинути нову Error, а оригінал покласти в cause." },
      { on: "source", name: "ValidationError успадковує Error", matches: "class\\s+ValidationError\\s+extends\\s+Error", hint: "Запишіть class ValidationError extends Error { ... }." },
      { on: "source", name: "Використано cause", matches: "\\{\\s*cause\\s*:\\s*error\\s*\\}|\\{\\s*cause\\s*\\}", hint: "Запишіть new Error(\"...\", { cause: error })." },
    ],
  },
  {
    ...base, id: "ts-discriminated", lesson: "ts/54", xp: 25,
    title: "Фігури й стани: дискримінантні об'єднання",
    context: "Різні варіанти даних, як-от фігури чи стани завантаження, зручно описувати union-ом із міткою. Тоді перевірка мітки відкриває саме ті поля, які є в цьому варіанті, і неможливі комбінації не виникають.",
    brief: [
      "Допишіть <code>area(shape: Shape): number</code>: для кола <code>PI * r²</code>, для прямокутника <code>ширина * висота</code>. Допишіть <code>describeState(state: LoadState): string</code>: <code>done</code> дає <code>готово: дані</code>, <code>error</code> дає <code>помилка: повідомлення</code>, решта стани коротким словом.",
    ],
    starter: raw`type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: string }
  | { status: "error"; message: string };

function area(shape: Shape): number {
  // TODO
  return 0;
}

function describeState(state: LoadState): string {
  // TODO
  return "";
}

console.log(area({ kind: "circle", radius: 1 }).toFixed(2));
console.log(area({ kind: "rect", width: 2, height: 3 }));
console.log(describeState({ status: "done", data: "дані" }));
console.log(describeState({ status: "error", message: "збій" }));
console.log(describeState({ status: "loading" }));
`,
    checks: [
      { on: "stdout", name: "Площі й описи станів", equals: "3.14\n6\nготово: дані\nпомилка: збій\nзавантаження", hint: "Для loading поверніть слово «завантаження»." },
      { on: "source", name: "Розгалуження за міткою kind", matches: "shape\\.kind\\s*===|switch\\s*\\(\\s*shape\\.kind", hint: "Перевірте shape.kind, щоб звузити тип." },
      { on: "source", name: "Розгалуження за міткою status", matches: "state\\.status\\s*===|switch\\s*\\(\\s*state\\.status", hint: "Перевірте state.status, щоб звузити тип." },
    ],
  },
  {
    ...base, id: "ts-exhaustive", lesson: "ts/55", xp: 25,
    title: "Вичерпна перевірка: периметр і підписи",
    context: "Коли з'являється новий варіант, компілятор має нагадати про кожне місце, яке його не розглядає. assertNever і Record за мітками роблять це автоматично, і забутий випадок стає помилкою, а не багом.",
    brief: [
      "У заготовці додано варіант <code>triangle</code>, і код не компілюється: функція <code>perimeter</code> його не розглядає, а в словнику <code>labels</code> немає ключа. Допишіть гілку для трикутника (сума трьох сторін) і підпис <code>Трикутник</code>.",
    ],
    starter: raw`type Shape =
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
    default:
      return assertNever(shape);
  }
}

const labels: Record<Shape["kind"], string> = {
  circle: "Коло",
  rect: "Прямокутник",
};

console.log(perimeter({ kind: "circle", radius: 1 }).toFixed(2));
console.log(perimeter({ kind: "rect", width: 2, height: 3 }).toFixed(2));
console.log(perimeter({ kind: "triangle", a: 3, b: 4, c: 5 }).toFixed(2));
console.log(labels.triangle);
`,
    checks: [
      { on: "stdout", name: "Периметри й підпис трикутника", equals: "6.28\n10.00\n12.00\nТрикутник", hint: "Периметр трикутника це a + b + c." },
      { on: "source", name: "Є гілка для triangle", matches: "case\\s+[\"']triangle[\"']\\s*:", hint: "Додайте case \"triangle\": ... у switch." },
      { on: "source", name: "assertNever збережено", matches: "assertNever\\s*\\(\\s*shape\\s*\\)", hint: "Лишіть default: return assertNever(shape)." },
    ],
  },
  {
    ...base, id: "ts-result", lesson: "ts/56", xp: 30,
    title: "Result: розбір порту без виключень",
    context: "Некоректне введення користувача це очікувана ситуація, а не аварія. Тип Result описує її прямо в сигнатурі, тож викликач мусить розглянути і успіх, і помилку, і не може випадково проігнорувати збій.",
    brief: [
      "Допишіть <code>parsePort(text: string): Result&lt;number, string&gt;</code>: порт це ціле число від 1 до 65535. Для нечислового тексту помилка <code>Порт має бути числом</code>, для виходу за межі <code>Порт має бути від 1 до 65535</code>.",
      "Допишіть <code>mapResult</code>, що застосовує функцію до значення, а помилку передає без змін.",
    ],
    starter: raw`type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parsePort(text: string): Result<number, string> {
  // TODO
  return { ok: false, error: "не реалізовано" };
}

function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  // TODO
  return result as unknown as Result<U, E>;
}

for (const input of ["8080", "0", "abc", "70000"]) {
  const result = parsePort(input);
  console.log(result.ok ? "порт " + result.value : "помилка: " + result.error);
}

const doubled = mapResult(parsePort("21"), (n) => n * 2);
console.log(doubled.ok ? doubled.value : doubled.error);
`,
    checks: [
      { on: "stdout", name: "Порти, помилки та перетворення", equals: "порт 8080\nпомилка: Порт має бути від 1 до 65535\nпомилка: Порт має бути числом\nпомилка: Порт має бути від 1 до 65535\n42", hint: "\"abc\" це не число, а 0 та 70000 виходять за межі діапазону." },
      { on: "source", name: "Немає кидання помилок", matches: "^(?![\\s\\S]*\\bthrow\\b)[\\s\\S]*$", hint: "У цій задачі помилки повертаються як значення, без throw." },
      { on: "source", name: "Перевірка діапазону", matches: "65535", hint: "Максимальний порт 65535." },
    ],
  },
  {
    ...base, id: "ts-type-guards", lesson: "ts/57", xp: 30,
    title: "Type guards: перевірка форми даних",
    context: "Дані з JSON приходять як unknown, і лише власна перевірка перетворює їх на точний тип. Type guard один раз описує форму й повторно використовується в фільтрах, розборі відповідей і валідації.",
    brief: [
      "Допишіть <code>isStringArray(value: unknown): value is string[]</code>, <code>isUser(value: unknown): value is User</code> (поле <code>id</code> число, <code>name</code> рядок) та <code>parseUsers(data: unknown): User[]</code>, яка повертає лише коректних користувачів з масиву.",
    ],
    starter: raw`interface User {
  id: number;
  name: string;
}

function isStringArray(value: unknown): value is string[] {
  // TODO: масив, усі елементи рядки
  return false;
}

function isUser(value: unknown): value is User {
  // TODO: об'єкт із числовим id та рядковим name
  return false;
}

function parseUsers(data: unknown): User[] {
  // TODO: лише коректні користувачі
  return [];
}

console.log(isStringArray(["а", "б"]));
console.log(isStringArray(["а", 1]));

const data: unknown = JSON.parse('[{"id":1,"name":"Оля"},{"id":"x","name":1},{"id":2,"name":"Іван"},null]');
const users = parseUsers(data);
console.log(users.map((u) => u.name).join(","));
console.log(users.length);
`,
    checks: [
      { on: "stdout", name: "Перевірки масиву й коректні користувачі", equals: "true\nfalse\nОля,Іван\n2", hint: "Некоректні елементи (id рядок, null) мають відкидатися." },
      { on: "source", name: "isUser має тип-предикат", matches: "value\\s+is\\s+User", hint: "Лишіть сигнатуру isUser(value: unknown): value is User." },
      { on: "source", name: "Використано filter із guard", matches: "\\.filter\\(\\s*isUser\\s*\\)", hint: "Відфільтруйте масив через data.filter(isUser)." },
    ],
  },
  {
    ...base, id: "ts-assertions", lesson: "ts/58", xp: 30,
    title: "Assertion functions: валідація конфігурації",
    context: "Валідацію на початку функції зручно писати послідовністю тверджень: після кожного тип звужується, а код лишається плоским. Невдала перевірка зупиняє програму із зрозумілим повідомленням про те, що саме не так.",
    brief: [
      "Допишіть тіла <code>assert(condition, message)</code> та <code>assertIsString(value, message)</code>: вони кидають <code>Error(message)</code>, якщо умова не виконана. Сигнатури з <code>asserts</code> вже написані.",
      "Допишіть <code>parseConfig(data: unknown)</code>, що використовує ці функції: об'єкт, <code>host</code> рядок (<code>host має бути рядком</code>), <code>port</code> число (<code>Немає порту</code>).",
    ],
    starter: raw`function assert(condition: unknown, message: string): asserts condition {
  // TODO: кинути Error(message), якщо умова хибна
}

function assertIsString(value: unknown, message: string): asserts value is string {
  // TODO: кинути Error(message), якщо value не рядок
}

function parseConfig(data: unknown): { host: string; port: number } {
  // TODO: перевірки через assert та assertIsString
  return { host: "", port: 0 };
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
    checks: [
      { on: "stdout", name: "Конфігурація й дві помилки", equals: "localhost:8080\nНемає порту\nhost має бути рядком", hint: "Перевіряйте host раніше за port: для третього прикладу має вийти помилка про host." },
      { on: "source", name: "Використано asserts у сигнатурах", matches: "asserts\\s+condition[\\s\\S]*asserts\\s+value\\s+is\\s+string", hint: "Лишіть сигнатури з asserts." },
      { on: "source", name: "parseConfig викликає assertIsString", matches: "assertIsString\\s*\\(\\s*host", hint: "Перевірте host через assertIsString(host, ...)." },
    ],
  },
];
