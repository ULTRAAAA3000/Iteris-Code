// Завдання глави 9 «Тестування й якість» (уроки 86–91). Еталони: tests/solutions/ts-ch09.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "ts-clamp-table", lesson: "ts/86", xp: 30,
    title: "Табличний тест для clamp",
    context: "Табличні тести перебирають багато випадків одним циклом і показують, який саме рядок таблиці упав. Помилкові входи перевіряють окремо, через очікуваний виняток.",
    brief: [
      "Допишіть <code>clamp(value, min, max)</code>: повертає число, обмежене діапазоном. Якщо <code>min</code> більше за <code>max</code>, кидайте <code>RangeError</code>.",
      "Допишіть <code>runTable</code>: перебирає таблицю <code>cases</code>, порівнює результат з очікуваним і збирає повідомлення про невдачі. Допишіть <code>assertThrows</code>: повертає <code>true</code>, якщо функція кинула виняток.",
    ],
    starter: raw`function clamp(value: number, min: number, max: number): number {
  // TODO: RangeError, якщо min > max; інакше значення між min і max (Math.min / Math.max)
  return value;
}

type Case = [value: number, min: number, max: number, expected: number];

const cases: Case[] = [
  [5, 0, 10, 5],
  [-3, 0, 10, 0],
  [42, 0, 10, 10],
  [0, 0, 0, 0],
  [7, 7, 7, 7],
  [3.5, 0, 3, 3],
];

function runTable(): { passed: number; failures: string[] } {
  // TODO: для кожного випадку порівняйте clamp(...) з expected;
  // невдачі додавайте як "clamp(v, min, max): очікувалось E, отримано A"
  return { passed: 0, failures: [] };
}

function assertThrows(action: () => unknown): boolean {
  // TODO: true, якщо action кидає виняток (try/catch)
  return false;
}

const result = runTable();
console.log("пройдено:", result.passed, "з", cases.length);
for (const failure of result.failures) {
  console.log(failure);
}
console.log(assertThrows(() => clamp(1, 5, 0)), assertThrows(() => clamp(1, 0, 5)));
`,
    checks: [
      { on: "stdout", name: "Усі випадки пройшли", equals: "пройдено: 6 з 6\ntrue false", hint: "clamp має обмежувати значення діапазоном, а при min > max кидати RangeError." },
      { on: "source", name: "Обмеження через Math", matches: "Math\\.(min|max)", hint: "Скористайтеся Math.min(Math.max(value, min), max)." },
      { on: "source", name: "Перевірка винятку через try/catch", matches: "try\\s*\\{[\\s\\S]*\\}\\s*catch", hint: "assertThrows має викликати action у try/catch." },
    ],
  },
  {
    ...base, id: "ts-spy-mailer", lesson: "ts/87", xp: 35,
    title: "Шпигун і стійке розсилання листів",
    context: "Розсилка не повинна зупинятися через один невдалий лист. Шпигун дозволяє перевірити, скільки було спроб і з якими аргументами, а підставна функція імітує збій.",
    brief: [
      "Допишіть узагальнений <code>spy(fn)</code>: повертає <code>wrapped</code> (така сама функція, що спершу <b>записує</b> аргументи в масив <code>calls</code>, а потім викликає <code>fn</code>) і сам масив <code>calls</code>.",
      "Допишіть <code>notifyAll(mailer, emails, text)</code>: надсилає кожному адресату, ловить помилки й повертає кількість невдач. Збій одного листа не має зупиняти решту.",
    ],
    starter: raw`interface Mailer {
  send(to: string, text: string): void;
}

function spy<A extends unknown[], R>(fn: (...args: A) => R): { wrapped: (...args: A) => R; calls: A[] } {
  // TODO: calls: A[]; wrapped записує args у calls ДО виклику fn, потім повертає fn(...args)
  return { wrapped: fn, calls: [] };
}

function notifyAll(mailer: Mailer, emails: string[], text: string): number {
  // TODO: для кожного email: try { mailer.send(email, text) } catch { збільшити лічильник невдач }
  return 0;
}

const delivered: string[] = [];
const sender = spy((to: string, text: string): void => {
  if (to.startsWith("bad")) {
    throw new Error("відхилено " + to);
  }
  delivered.push(to + ":" + text);
});

const failures = notifyAll({ send: sender.wrapped }, ["a@x.ua", "bad@x.ua", "b@x.ua"], "Привіт");
console.log("збоїв:", failures);
console.log("спроб:", sender.calls.length);
console.log(delivered.join(" | "));
console.log(JSON.stringify(sender.calls[1]));
`,
    checks: [
      { on: "stdout", name: "Збої, спроби й аргументи", equals: "збоїв: 1\nспроб: 3\na@x.ua:Привіт | b@x.ua:Привіт\n[\"bad@x.ua\",\"Привіт\"]", hint: "Виклик записується до fn, тому невдала спроба теж потрапляє в calls; розсилка триває після збою." },
      { on: "source", name: "Шпигун записує виклики", matches: "calls\\.push\\s*\\(", hint: "Усередині wrapped додавайте args у масив calls через push." },
      { on: "source", name: "Збій ловиться", matches: "try\\s*\\{[\\s\\S]*\\}\\s*catch", hint: "Кожну відправку обгорніть у try/catch." },
    ],
  },
  {
    ...base, id: "ts-type-tests", lesson: "ts/88", xp: 40,
    title: "Утилітарні типи, перевірені тестами типів",
    context: "Утилітарні типи пишуть один раз, а ламаються вони тихо. Тест типів на Equal і Expect фіксує очікувану форму, і компілятор перевіряє її при кожній збірці.",
    brief: [
      "Нижче вже є перевірки типів. Допишіть три типи так, щоб усі вони скомпілювалися: <code>Nullable&lt;T&gt;</code> це <code>T | null</code>, <code>ValuesOf&lt;T&gt;</code> це значення всіх властивостей (<code>T[keyof T]</code>), <code>Mutable&lt;T&gt;</code> знімає <code>readonly</code> з усіх полів (<code>-readonly</code>).",
      "Директива <code>@ts-expect-error</code> перевіряє, що запис у <code>readonly</code>-поле заборонено, а змінна типу <code>Mutable&lt;Config&gt;</code> дозволяє запис.",
    ],
    starter: raw`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

// TODO: виправте три типи нижче
type Nullable<T> = T; // має бути T | null
type ValuesOf<T> = unknown; // має бути T[keyof T]
type Mutable<T> = T; // має бути { -readonly [K in keyof T]: T[K] }

type Config = { readonly host: string; readonly port: number };

type _t1 = Expect<Equal<Nullable<string>, string | null>>;
type _t2 = Expect<Equal<ValuesOf<Config>, string | number>>;
type _t3 = Expect<Equal<Mutable<Config>, { host: string; port: number }>>;

const frozen: Config = { host: "localhost", port: 80 };
// @ts-expect-error у Config поля лише для читання
frozen.port = 8080;

const editable: Mutable<Config> = { host: "localhost", port: 80 };
editable.port = 8080;

console.log(editable.port, frozen.port);
`,
    checks: [
      { on: "stdout", name: "Типи скомпілювались і програма працює", equals: "8080 8080", hint: "Усі три перевірки Expect мають компілюватися. Типи нічого не заморожують: обидва записи під час виконання проходять." },
      { on: "source", name: "Знято readonly", matches: "-readonly", hint: "У Mutable використайте -readonly у відображеному типі." },
      { on: "source", name: "Значення за ключами", matches: "T\\[keyof\\s+T\\]", hint: "ValuesOf<T> це T[keyof T]." },
      { on: "source", name: "Додано null", matches: "\\|\\s*null", hint: "Nullable<T> це T | null." },
    ],
  },
  {
    ...base, id: "ts-async-tests", lesson: "ts/89", xp: 40,
    title: "Власний запускач асинхронних тестів",
    context: "Запускач тестів має дочекатися кожного тесту, обмежити його час і показати підсумок. Так завислий або забутий без await тест не приховує результатів решти.",
    brief: [
      "Допишіть <code>assertRejects(promise)</code>: чекає на проміс у <code>try/catch</code>; якщо проміс виконався, кидає <code>new Error(\"проміс виконався, а мав відхилитись\")</code>.",
      "Допишіть <code>runTests(tests, timeoutMs)</code>: тести виконуються <b>по черзі</b>, кожен обгорнутий у <code>Promise.race</code> із тайм-аутом (повідомлення <code>не завершився за N мс</code>). Повертає рядок із рядками <code>ok назва</code> чи <code>FAIL назва: причина</code> та підсумком <code>пройдено: X з Y</code>.",
    ],
    starter: raw`type TestFn = () => Promise<void> | void;

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assertRejects(promise: Promise<unknown>): Promise<void> {
  // TODO: try { await promise } catch { return } і далі throw new Error("проміс виконався, а мав відхилитись")
}

async function runTests(tests: Record<string, TestFn>, timeoutMs: number): Promise<string> {
  // TODO: для кожного тесту по черзі: Promise.race між await test() і таймером на timeoutMs;
  // успіх: "ok назва"; помилка: "FAIL назва: повідомлення"; наприкінці "пройдено: X з Y"; рядки з'єднайте через "\n"
  return "";
}

const tests: Record<string, TestFn> = {
  "додавання": () => {
    if (1 + 1 !== 2) {
      throw new Error("математика зламалась");
    }
  },
  "асинхронне читання": async () => {
    await pause(1);
  },
  "відхилення": async () => {
    await assertRejects(Promise.reject(new Error("збій")));
  },
  "падіння": async () => {
    await pause(1);
    throw new Error("навмисно");
  },
  "виконаний замість відхилення": async () => {
    await assertRejects(Promise.resolve(1));
  },
  "зависання": () => new Promise<void>(() => {}),
};

runTests(tests, 20).then((summary) => console.log(summary));
`,
    checks: [
      { on: "stdout", name: "Звіт запускача", equals: "ok додавання\nok асинхронне читання\nok відхилення\nFAIL падіння: навмисно\nFAIL виконаний замість відхилення: проміс виконався, а мав відхилитись\nFAIL зависання: не завершився за 20 мс\nпройдено: 3 з 6", hint: "Тест, що завис, має отримати тайм-аут, а assertRejects має падати на виконаному промісі." },
      { on: "source", name: "Тайм-аут через race", matches: "Promise\\.race\\s*\\(", hint: "Обгорніть тест у Promise.race з промісом, що відхиляється через timeoutMs." },
      { on: "source", name: "Очікування тестів", matches: "await\\s+", hint: "Кожен тест і assertRejects чекайте через await." },
    ],
  },
  {
    ...base, id: "ts-test-factory", lesson: "ts/90", xp: 40,
    title: "Фабрика замовлень з DeepPartial",
    context: "Фабрика тестових даних скорочує тест до суті. Вкладений клієнт перевизначається частково, а масиви копіюються, щоб тести не ділили змінний стан.",
    brief: [
      "Допишіть <code>makeOrder(overrides)</code>: унікальний <code>id</code> із лічильника <code>nextId++</code>; значення за замовчуванням: клієнт <code>Олена</code> віком 30, товари <code>[\"хліб\"]</code>, <code>paid: false</code>. Вкладений <code>customer</code> зливайте окремо, а масив <code>items</code> <b>копіюйте</b>.",
      "Допишіть варіант <code>makePaid</code>: те саме замовлення, але з <code>paid: true</code>; решту полів можна перевизначити.",
    ],
    starter: raw`interface Customer {
  name: string;
  age: number;
}

interface Order {
  id: number;
  customer: Customer;
  items: string[];
  paid: boolean;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

let nextId = 1;

function makeOrder(overrides: DeepPartial<Order> = {}): Order {
  // TODO: id: nextId++; за замовчуванням customer { name: "Олена", age: 30 }, items ["хліб"], paid false;
  // накладіть ...overrides, customer злийте окремо, items скопіюйте
  return { id: 0, customer: { name: "", age: 0 }, items: [], paid: false };
}

const makePaid = (overrides: DeepPartial<Order> = {}): Order => {
  // TODO: makeOrder з paid: true і рештою перевизначень
  return makeOrder(overrides);
};

const a = makeOrder();
const b = makeOrder({ customer: { age: 17 } });
const c = makePaid({ items: ["молоко", "сир"] });

console.log(a.id, b.id, c.id);
console.log(b.customer.name, b.customer.age);
console.log(c.paid, c.items.join(","));
console.log(a.items === makeOrder().items, a.items.join(","));
`,
    checks: [
      { on: "stdout", name: "Фабрика й варіант", equals: "1 2 3\nОлена 17\ntrue молоко,сир\nfalse хліб", hint: "id беруться з лічильника, вкладений клієнт зливається по полях, а items кожного замовлення окрема копія." },
      { on: "source", name: "Лічильник id", matches: "nextId\\+\\+|nextId\\s*\\+=\\s*1", hint: "Унікальний id беріть із лічильника: nextId++." },
      { on: "source", name: "Накладання перевизначень", matches: "\\.\\.\\.overrides", hint: "Накладіть значення через розгортання ...overrides." },
    ],
  },
  {
    ...base, id: "ts-property-test", lesson: "ts/91", xp: 45,
    title: "Тест властивостей з генератором із зерном",
    context: "Тести властивостей шукають помилки у випадках, які автор прикладів не передбачив. Генератор із зерном робить падіння відтворюваним: достатньо знати число.",
    brief: [
      "Допишіть <code>dedupeSorted(items)</code>: масив без дублікатів, відсортований за зростанням. Допишіть <code>checkProperty(gen, property, runs)</code>: для зерен 1…<code>runs</code> створюйте вхід <code>gen(makeRandom(seed))</code> і перевіряйте властивість. При першому порушенні поверніть <code>{ ok: false, seed, value }</code>, інакше <code>{ ok: true }</code>.",
      "Генератори <code>makeRandom</code>, <code>int</code> і <code>arrayOf</code> вже готові. Остання властивість навмисно хибна («результат завжди непорожній»), і тест має знайти її контрприклад.",
    ],
    starter: raw`function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Gen<T> = (random: () => number) => T;

const int = (min: number, max: number): Gen<number> => (random) => min + Math.floor(random() * (max - min + 1));
const arrayOf = <T>(gen: Gen<T>, maxLength: number): Gen<T[]> => (random) =>
  Array.from({ length: Math.floor(random() * (maxLength + 1)) }, () => gen(random));

type CheckResult<T> = { ok: true } | { ok: false; seed: number; value: T };

function dedupeSorted(items: number[]): number[] {
  // TODO: унікальні значення за зростанням (Set і sort з порівнянням чисел)
  return items;
}

function checkProperty<T>(gen: Gen<T>, property: (value: T) => boolean, runs: number): CheckResult<T> {
  // TODO: for (let seed = 1; seed <= runs; seed++): value = gen(makeRandom(seed)); якщо !property(value) повернути { ok: false, seed, value }
  return { ok: true };
}

function report(label: string, result: CheckResult<number[]>): string {
  return result.ok ? "ok " + label : "FAIL " + label + ": зерно " + result.seed + ", вхід " + JSON.stringify(result.value);
}

const numbers = arrayOf(int(-5, 5), 8);
const properties: Array<[string, (items: number[]) => boolean]> = [
  ["строго зростає", (items) => {
    const result = dedupeSorted(items);
    return result.every((x, i) => i === 0 || result[i - 1] < x);
  }],
  ["містить усі значення", (items) => {
    const result = dedupeSorted(items);
    return items.every((x) => result.includes(x));
  }],
  ["ідемпотентність", (items) => {
    const result = dedupeSorted(items);
    return JSON.stringify(dedupeSorted(result)) === JSON.stringify(result);
  }],
  ["результат непорожній", (items) => dedupeSorted(items).length > 0],
];

for (const [label, property] of properties) {
  console.log(report(label, checkProperty(numbers, property, 200)));
}
`,
    checks: [
      { on: "stdout", name: "Властивості й контрприклад", equals: "ok строго зростає\nok містить усі значення\nok ідемпотентність\nFAIL результат непорожній: зерно 7, вхід []", hint: "Три властивості виконуються, а хибна падає на зерні 7, де згенеровано порожній масив." },
      { on: "source", name: "Генерація з зерном", matches: "makeRandom\\s*\\(\\s*seed\\s*\\)", hint: "Для кожного зерна створюйте вхід через gen(makeRandom(seed))." },
      { on: "source", name: "Дублікати прибираються", matches: "new\\s+Set", hint: "Унікальні значення дає new Set(items)." },
    ],
  },
];
