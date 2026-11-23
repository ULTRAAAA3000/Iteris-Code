// ЧЕРНЕТКИ проєктів за ТЗ для TypeScript. Не підключені до сайту (див. types.ts).
// Код користувача (типи, функції, класи без виклику) і harness лежать в одному файлі main.ts; harness друкує «R<n> PASS» або «R<n> FAIL: причина».
// Типи перевіряє компілятор: якщо користувач відступив від контракту (назви, сигнатури), програма не збереться, і всі вимоги будуть червоними.
import type { ProgramProject } from "./types.ts";

// Спільний початок harness. Без імпортів, без export (код користувача й harness живуть в одному файлі-скрипті).
const HELPERS = `function _r(id: string, fn: () => void): void {
  try {
    fn();
    console.log(id + " PASS");
  } catch (e) {
    console.log(id + " FAIL: " + (e instanceof Error ? e.message : String(e)).replace(/\\n/g, " "));
  }
}

// Порівняння за значенням: порядок ключів в об'єктах не важливий
function _canon(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(_canon);
  if (v !== null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, _canon(o[k])]));
  }
  return v;
}

function _eq(got: unknown, exp: unknown): void {
  const a = JSON.stringify(_canon(got));
  const b = JSON.stringify(_canon(exp));
  if (a !== b) throw new Error("очікувалось " + b + ", отримано " + a);
}

function _throws(fn: () => unknown, ctor: new (...a: never[]) => Error, what: string): void {
  try {
    fn();
  } catch (e) {
    if (e instanceof ctor) return;
    throw new Error(what + ": очікувалась " + ctor.name + ", отримано " + String(e));
  }
  throw new Error(what + ": очікувалась помилка " + ctor.name + ", але її не було");
}
`;

const orderHarness = `${HELPERS}
_r("R1", () => {
  _eq(lineTotal({ kind: "product", name: "Мишка", price: 350, qty: 2 }), 700);
  _eq(lineTotal({ kind: "product", name: "Ручка", price: 12.5, qty: 4 }), 50);
  _eq(lineTotal({ kind: "product", name: "Папір", price: 99, qty: 1 }), 99);
});

_r("R2", () => {
  _eq(lineTotal({ kind: "service", name: "Налаштування", hours: 1.5, rate: 400 }), 600);
  _eq(lineTotal({ kind: "service", name: "Монтаж", hours: 3, rate: 250 }), 750);
});

_r("R3", () => {
  _eq(discountRate("NONE"), 0);
  _eq(discountRate("STUDENT"), 0.1);
  _eq(discountRate("VIP"), 0.2);
});

const mixed: Item[] = [
  { kind: "product", name: "Мишка", price: 350, qty: 2 },
  { kind: "service", name: "Налаштування", hours: 1.5, rate: 400 },
];

_r("R4", () => {
  _eq(orderTotal(mixed, "NONE"), 1300);
  _eq(orderTotal([], "NONE"), 0);
  _eq(orderTotal([], "VIP"), 0);
});

_r("R5", () => {
  _eq(orderTotal(mixed, "STUDENT"), 1170);
  _eq(orderTotal(mixed, "VIP"), 1040);
  const odd: Item[] = [{ kind: "product", name: "Олівець", price: 33.33, qty: 3 }];
  _eq(orderTotal(odd, "STUDENT"), 89.99);
  _eq(orderTotal(odd, "VIP"), 79.99);
  const sums: Item[] = [
    { kind: "product", name: "А", price: 10.1, qty: 1 },
    { kind: "product", name: "Б", price: 20.2, qty: 1 },
  ];
  _eq(orderTotal(sums, "NONE"), 30.3);
});

_r("R6", () => {
  _throws(() => lineTotal({ kind: "product", name: "А", price: 10, qty: 0 }), RangeError, "qty = 0");
  _throws(() => lineTotal({ kind: "product", name: "А", price: 10, qty: -1 }), RangeError, "qty = -1");
  _throws(() => lineTotal({ kind: "product", name: "А", price: 10, qty: 1.5 }), RangeError, "qty = 1.5");
  _throws(() => lineTotal({ kind: "product", name: "А", price: -5, qty: 1 }), RangeError, "price = -5");
  _throws(() => lineTotal({ kind: "service", name: "Б", hours: 0, rate: 100 }), RangeError, "hours = 0");
  _throws(() => lineTotal({ kind: "service", name: "Б", hours: -2, rate: 100 }), RangeError, "hours = -2");
  _throws(() => lineTotal({ kind: "service", name: "Б", hours: 1, rate: -1 }), RangeError, "rate = -1");
  _throws(() => orderTotal([{ kind: "product", name: "А", price: 10, qty: 0 }], "NONE"), RangeError, "orderTotal з поганим рядком");
});

_r("R7", () => {
  _eq(describe({ kind: "product", name: "Мишка", price: 350, qty: 2 }), "Мишка ×2 = 700.00 грн");
  _eq(describe({ kind: "product", name: "Ручка", price: 12.5, qty: 3 }), "Ручка ×3 = 37.50 грн");
  _eq(describe({ kind: "service", name: "Налаштування", hours: 1.5, rate: 400 }), "Налаштування, 1.5 год = 600.00 грн");
});

_r("R8", () => {
  const list: Item[] = [
    { kind: "product", name: "Ручка", price: 12, qty: 5 },
    { kind: "service", name: "Монтаж", hours: 2, rate: 300 },
    { kind: "product", name: "Кабель", price: 300, qty: 2 },
    { kind: "product", name: "Папір", price: 50, qty: 1 },
  ];
  const best = mostExpensive(list);
  _eq(best === undefined ? null : best.name, "Монтаж");
  _eq(mostExpensive([]), undefined);
  _eq(mostExpensive([list[3]!])?.name, "Папір");
});
`;

const repoHarness = `${HELPERS}
interface Note extends Entity { text: string }

function _tasks(): Repository<Task> {
  return new Repository<Task>();
}

_r("R1", () => {
  const repo = _tasks();
  const a = repo.add({ title: "Купити хліб", done: false, tags: ["дім"] });
  const b = repo.add({ title: "Написати звіт", done: true, tags: [] });
  const c = repo.add({ title: "Полити квіти", done: false, tags: ["дім", "ранок"] });
  _eq(a, { id: 1, title: "Купити хліб", done: false, tags: ["дім"] });
  _eq(b.id, 2);
  _eq(c.id, 3);
  _eq(repo.count(), 3);
});

_r("R2", () => {
  const repo = _tasks();
  repo.add({ title: "Один", done: false, tags: [] });
  repo.add({ title: "Два", done: false, tags: [] });
  _eq(repo.get(2)?.title, "Два");
  _eq(repo.get(1)?.title, "Один");
  _eq(repo.get(3), undefined);
  _eq(repo.get(0), undefined);
});

_r("R3", () => {
  const repo = _tasks();
  const input = { title: "Оригінал", done: false, tags: ["a"] };
  repo.add(input);
  input.title = "Змінено ззовні";
  _eq(repo.get(1)?.title, "Оригінал");
  const list = repo.all() as Task[];
  list.pop();
  _eq(repo.count(), 1);
  _eq(repo.all().length, 1);
});

_r("R4", () => {
  const repo = _tasks();
  repo.add({ title: "Дослідити", done: false, tags: ["x"] });
  const updated = repo.update(1, { done: true });
  _eq(updated, { id: 1, title: "Дослідити", done: true, tags: ["x"] });
  _eq(repo.get(1), { id: 1, title: "Дослідити", done: true, tags: ["x"] });
  const renamed = repo.update(1, { title: "Дослідив", tags: [] });
  _eq(renamed, { id: 1, title: "Дослідив", done: true, tags: [] });
});

_r("R5", () => {
  const repo = _tasks();
  repo.add({ title: "Перше", done: false, tags: [] });
  const sneaky = { id: 99, title: "Нова назва" } as unknown as Partial<Omit<Task, "id">>;
  const res = repo.update(1, sneaky);
  _eq(res.id, 1);
  _eq(repo.get(99), undefined);
  _eq(repo.get(1)?.title, "Нова назва");
});

_r("R6", () => {
  const repo = _tasks();
  repo.add({ title: "Є", done: false, tags: [] });
  let msg = "";
  try {
    repo.update(42, { done: true });
  } catch (e) {
    if (!(e instanceof Error)) throw new Error("кинуто не Error");
    msg = e.message;
  }
  if (msg === "") throw new Error("update неіснуючого id має кидати Error");
  if (!msg.includes("42")) throw new Error("у повідомленні має бути id: " + msg);
});

_r("R7", () => {
  const repo = _tasks();
  repo.add({ title: "А", done: false, tags: [] });
  repo.add({ title: "Б", done: false, tags: [] });
  repo.add({ title: "В", done: false, tags: [] });
  _eq(repo.remove(2), true);
  _eq(repo.remove(2), false);
  _eq(repo.remove(77), false);
  _eq(repo.get(2), undefined);
  _eq(repo.count(), 2);
  const d = repo.add({ title: "Г", done: false, tags: [] });
  _eq(d.id, 4);
});

_r("R8", () => {
  const repo = _tasks();
  repo.add({ title: "Хліб", done: false, tags: ["дім"] });
  repo.add({ title: "Звіт", done: true, tags: ["робота"] });
  repo.add({ title: "Квіти", done: false, tags: ["дім"] });
  _eq(repo.find((t) => !t.done).map((t) => t.title), ["Хліб", "Квіти"]);
  _eq(repo.find((t) => t.tags.includes("робота")).map((t) => t.id), [2]);
  _eq(repo.find((t) => t.title === "Немає"), []);
  _eq(repo.all().map((t) => t.id), [1, 2, 3]);
});

_r("R9", () => {
  const notes = new Repository<Note>();
  const n = notes.add({ text: "Нотатка" });
  _eq(n, { id: 1, text: "Нотатка" });
  notes.update(1, { text: "Оновлена" });
  _eq(notes.get(1)?.text, "Оновлена");
  _eq(notes.find((x) => x.text.startsWith("Оно")).length, 1);
});
`;

const apiHarness = `${HELPERS}
const _ok = { id: 1, name: "Марія", email: "maria@example.com", role: "admin" };

function _unwrap(r: Result<User>): User {
  if (!r.ok) throw new Error("очікувався успіх, отримано помилку: " + r.error);
  return r.value;
}

_r("R1", () => {
  _eq(isUser(_ok), true);
  _eq(isUser({ id: 7, name: "Ігор", email: "i@x.ua", role: "viewer" }), true);
  _eq(isUser({ ..._ok, extra: "дозволено" }), true);
  _eq(isUser({ ..._ok, role: "editor" }), true);
});

_r("R2", () => {
  for (const bad of [null, undefined, 42, "рядок", [], [_ok], true]) _eq(isUser(bad), false);
  _eq(isUser({ ..._ok, id: "1" }), false);
  _eq(isUser({ ..._ok, id: 0 }), false);
  _eq(isUser({ ..._ok, id: -5 }), false);
  _eq(isUser({ ..._ok, id: 1.5 }), false);
  _eq(isUser({ ..._ok, name: "   " }), false);
  _eq(isUser({ ..._ok, name: 5 }), false);
  _eq(isUser({ ..._ok, email: "bez-sobaky" }), false);
  _eq(isUser({ ..._ok, email: "a@" }), false);
  _eq(isUser({ ..._ok, email: "@b.ua" }), false);
  _eq(isUser({ ..._ok, email: "a@@b.ua" }), false);
  _eq(isUser({ ..._ok, role: "root" }), false);
  _eq(isUser({ id: 1, name: "Х", email: "x@y.ua" }), false);
});

_r("R3", () => {
  const r = parseUser(_ok);
  _eq(r.ok, true);
  _eq(_unwrap(r), _ok);
  _eq(_unwrap(parseUser({ ..._ok, role: "viewer" })).role, "viewer");
});

_r("R4", () => {
  const msg = (x: unknown): string => {
    const r = parseUser(x);
    return r.ok ? "OK" : r.error;
  };
  _eq(msg(null), "не об'єкт");
  _eq(msg("рядок"), "не об'єкт");
  _eq(msg([1, 2]), "не об'єкт");
  _eq(msg({ ..._ok, id: "1" }), "невірне поле: id");
  _eq(msg({ ..._ok, name: "" }), "невірне поле: name");
  _eq(msg({ ..._ok, email: "x" }), "невірне поле: email");
  _eq(msg({ ..._ok, role: "boss" }), "невірне поле: role");
  _eq(msg({ id: 0, name: "", email: "", role: "" }), "невірне поле: id");
});

const _json = JSON.stringify([
  { id: 1, name: "Марія", email: "m@x.ua", role: "admin" },
  { id: 2, name: "Ігор", email: "i@x.ua", role: "viewer" },
]);

_r("R5", () => {
  const r = parseUsers(_json);
  if (!r.ok) throw new Error("очікувався успіх: " + r.error);
  _eq(r.value.length, 2);
  _eq(r.value[1]!.name, "Ігор");
  const empty = parseUsers("[]");
  if (!empty.ok) throw new Error("порожній масив має бути успіхом: " + empty.error);
  _eq(empty.value, []);
});

_r("R6", () => {
  const e = (s: string): string => {
    const r = parseUsers(s);
    return r.ok ? "OK" : r.error;
  };
  _eq(e("{ це не json"), "некоректний JSON");
  _eq(e(""), "некоректний JSON");
  _eq(e('{"id":1}'), "очікувався масив");
  _eq(e("null"), "очікувався масив");
  _eq(e('"рядок"'), "очікувався масив");
});

_r("R7", () => {
  const e = (s: string): string => {
    const r = parseUsers(s);
    return r.ok ? "OK" : r.error;
  };
  const list = [
    { id: 1, name: "А", email: "a@x.ua", role: "admin" },
    { id: 2, name: "Б", email: "b@x.ua", role: "editor" },
    { id: 3, name: "В", email: "немає", role: "viewer" },
    { id: "4", name: "Г", email: "g@x.ua", role: "viewer" },
  ];
  _eq(e(JSON.stringify(list)), "елемент 2: невірне поле: email");
  _eq(e(JSON.stringify([5])), "елемент 0: не об'єкт");
  _eq(e(JSON.stringify([list[0], null])), "елемент 1: не об'єкт");
});

_r("R8", () => {
  const users: User[] = [
    { id: 1, name: "А", email: "a@x.ua", role: "viewer" },
    { id: 2, name: "Б", email: "b@x.ua", role: "admin" },
    { id: 3, name: "В", email: "c@x.ua", role: "viewer" },
  ];
  const g = groupByRole(users);
  _eq(g.viewer.map((u) => u.id), [1, 3]);
  _eq(g.admin.map((u) => u.id), [2]);
  _eq(g.editor, []);
  _eq(Object.keys(g).sort(), ["admin", "editor", "viewer"]);
  _eq(Object.keys(groupByRole([])).length, 3);
});

_r("R9", () => {
  const good: Result<number> = { ok: true, value: 5 };
  const bad: Result<number> = { ok: false, error: "збій" };
  _eq(unwrapOr(good, 0), 5);
  _eq(unwrapOr(bad, -1), -1);
  const s: Result<string> = { ok: false, error: "x" };
  _eq(unwrapOr(s, "запасне"), "запасне");
  const arr: Result<string[]> = { ok: true, value: [] };
  _eq(unwrapOr(arr, ["не те"]), []);
});
`;

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "ts-order-calc",
    lang: "ts",
    lesson: "ts/6",
    title: "Проєкт: калькулятор замовлення",
    xp: 50,
    context:
      "У замовленні поруч лежать різні за природою рядки: товари (ціна × кількість) і послуги (години × ставка). У TypeScript це класичне об'єднання з тегом (discriminated union): компілятор сам стежить, щоб ви розібрали кожен варіант.",
    brief: [
      "Магазин техніки продає товари й послуги монтажу. Напишіть модуль розрахунку замовлення: сума рядка, знижка за типом клієнта, підсумок із округленням, короткий опис рядка й пошук найдорожчого.",
      "Спочатку описано типи, потім функції. Дані некоректного рядка (нульова кількість, від'ємна ціна) не повинні тихо потрапляти в суму: це помилка, а не «0 грн».",
    ],
    contract: [
      "<code>type Discount = \"NONE\" | \"STUDENT\" | \"VIP\"</code>;",
      "<code>type Item</code> — об'єднання з полем <code>kind</code>: <code>{ kind: \"product\"; name: string; price: number; qty: number }</code> або <code>{ kind: \"service\"; name: string; hours: number; rate: number }</code>;",
      "<code>lineTotal(item: Item): number</code>: товар — <code>price × qty</code>, послуга — <code>hours × rate</code>;",
      "<code>discountRate(d: Discount): number</code>: <code>NONE</code> — 0, <code>STUDENT</code> — 0.1, <code>VIP</code> — 0.2;",
      "<code>orderTotal(items: Item[], d: Discount): number</code>: сума рядків мінус знижка, округлена до копійок (2 знаки);",
      "<code>describe(item: Item): string</code>: товар — <code>Мишка ×2 = 700.00 грн</code>, послуга — <code>Налаштування, 1.5 год = 600.00 грн</code>;",
      "<code>mostExpensive(items: Item[]): Item | undefined</code>: рядок із найбільшою сумою (при рівності — перший), для порожнього списку <code>undefined</code>.",
    ],
    requirements: [
      { id: "R1", text: "<code>lineTotal</code> для товару повертає <code>price × qty</code>.", hint: "Спершу переконайтесь, що <code>item.kind === \"product\"</code>: після цього TypeScript дозволяє читати <code>price</code> і <code>qty</code>." },
      { id: "R2", text: "<code>lineTotal</code> для послуги повертає <code>hours × rate</code>.", hint: "Другий варіант об'єднання: після перевірки <code>kind</code> компілятор знає, що це послуга." },
      { id: "R3", text: "<code>discountRate</code> повертає 0, 0.1 і 0.2 для <code>NONE</code>, <code>STUDENT</code> і <code>VIP</code>.", hint: "Зручно написати <code>switch</code> за значенням: тоді компілятор попередить, якщо додати новий тип знижки й забути про нього." },
      { id: "R4", text: "<code>orderTotal</code> без знижки додає суми всіх рядків; для порожнього замовлення результат 0.", hint: "<code>reduce</code> із початковим значенням <code>0</code> спрацьовує й для порожнього масиву." },
      { id: "R5", text: "<code>orderTotal</code> застосовує знижку й округлює до двох знаків без похибок з плаваючою комою.", hint: "<code>Math.round(x * 100) / 100</code>. Округлюйте один раз, наприкінці, а не після кожного рядка." },
      { id: "R6", text: "Некоректні рядки (кількість не додатна або не ціла, від'ємна ціна чи ставка, години не додатні) кидають <code>RangeError</code>; це видно й у <code>orderTotal</code>.", hint: "<code>throw new RangeError(\"…\")</code>. Перевіряйте дані на початку <code>lineTotal</code>: <code>orderTotal</code> тоді отримає помилку автоматично." },
      { id: "R7", text: "<code>describe</code> повертає рядок за форматом із договору; сума з двома знаками після крапки.", hint: "<code>toFixed(2)</code> дає рядок із двома знаками. Для товару пишіть «×» разом із кількістю без пробілу." },
      { id: "R8", text: "<code>mostExpensive</code> повертає найдорожчий рядок (при рівності перший) і <code>undefined</code> для порожнього списку.", hint: "Порівнюйте строго «більше», тоді при рівності залишається перший. Тип результату <code>Item | undefined</code> змусить обробити порожній масив." },
    ],
    starter: `type Discount = "NONE" | "STUDENT" | "VIP";

type Item =
  | { kind: "product"; name: string; price: number; qty: number }
  | { kind: "service"; name: string; hours: number; rate: number };

// TODO: сума одного рядка (товар: price × qty, послуга: hours × rate); некоректні дані — RangeError
function lineTotal(item: Item): number {
  return -1;
}

// TODO: NONE → 0, STUDENT → 0.1, VIP → 0.2
function discountRate(d: Discount): number {
  return -1;
}

// TODO: сума рядків мінус знижка, округлена до 2 знаків
function orderTotal(items: Item[], d: Discount): number {
  return -1;
}

// TODO: «Мишка ×2 = 700.00 грн» або «Налаштування, 1.5 год = 600.00 грн»
function describe(item: Item): string {
  return "";
}

// TODO: найдорожчий рядок (при рівності перший) або undefined
function mostExpensive(items: Item[]): Item | undefined {
  return items[items.length - 1];
}
`,
    harness: orderHarness,
  },
  {
    id: "ts-repository",
    lang: "ts",
    lesson: "ts/10",
    title: "Проєкт: типізоване сховище",
    xp: 60,
    context:
      "Майже кожен застосунок зберігає списки сутностей: завдання, нотатки, користувачів. Замість окремого коду для кожної сутності пишуть одне узагальнене (generic) сховище, а утилітарні типи <code>Omit</code> і <code>Partial</code> описують, що можна передати.",
    brief: [
      "Напишіть клас <code>Repository&lt;T&gt;</code>: сховище в пам'яті для будь-якої сутності з числовим <code>id</code>. Ідентифікатори видає саме сховище, починаючи з 1, і не використовує повторно.",
      "Сховище не повинно залежати від того, що робить зовнішній код зі своїми об'єктами: збережене має бути окремою копією, а список, що повертається, не повинен давати доступу до внутрішнього масиву.",
    ],
    contract: [
      "<code>interface Entity { id: number }</code>, <code>interface Task extends Entity { title: string; done: boolean; tags: string[] }</code> (вже в заготовці);",
      "<code>class Repository&lt;T extends Entity&gt;</code> із методами:",
      "<code>add(item: Omit&lt;T, \"id\"&gt;): T</code> — зберігає копію, видає наступний <code>id</code> (1, 2, 3, …), повертає збережений об'єкт;",
      "<code>get(id: number): T | undefined</code>;",
      "<code>update(id: number, patch: Partial&lt;Omit&lt;T, \"id\"&gt;&gt;): T</code> — зливає зміни, повертає оновлений об'єкт; <code>id</code> змінити не можна; якщо запису немає, кидає <code>Error</code> із <code>id</code> у повідомленні;",
      "<code>remove(id: number): boolean</code> — <code>true</code>, якщо запис був;",
      "<code>find(pred: (item: T) =&gt; boolean): T[]</code> та <code>all(): readonly T[]</code> (копія списку, у порядку додавання);",
      "<code>count(): number</code>.",
    ],
    requirements: [
      { id: "R1", text: "<code>add</code> повертає збережений об'єкт із полем <code>id</code>: 1, 2, 3, …; <code>count()</code> показує кількість.", hint: "Тримайте приватний лічильник <code>private nextId = 1</code> і збільшуйте його після кожного додавання." },
      { id: "R2", text: "<code>get(id)</code> повертає запис або <code>undefined</code>.", hint: "Метод <code>find</code> масиву вже повертає <code>undefined</code>, якщо нічого не знайдено." },
      { id: "R3", text: "Збережений запис не залежить від об'єкта, переданого в <code>add</code>; зміна списку, отриманого з <code>all()</code>, не чіпає сховище.", hint: "Зберігайте копію: <code>{ ...item, id }</code>. У <code>all()</code> повертайте <code>[...this.items]</code>." },
      { id: "R4", text: "<code>update</code> зливає зміни з наявним записом, повертає оновлений запис і зберігає його.", hint: "<code>{ ...old, ...patch, id: old.id }</code>, потім замініть запис у масиві." },
      { id: "R5", text: "<code>update</code> ніколи не змінює <code>id</code>, навіть якщо в патчі він є.", hint: "Після розгортання патча поверніть старий <code>id</code>: у TypeScript типи не захищають від зайвих полів, що прийшли з JSON." },
      { id: "R6", text: "<code>update</code> неіснуючого <code>id</code> кидає <code>Error</code>, у повідомленні якого є цей <code>id</code>.", hint: "<code>throw new Error(\"запис \" + id + \" не знайдено\")</code>." },
      { id: "R7", text: "<code>remove</code> повертає <code>true</code>, якщо запис видалено, і <code>false</code>, якщо його не було; видалені <code>id</code> повторно не видаються.", hint: "Лічильник <code>nextId</code> не зменшується при видаленні. Для пошуку позиції зручний <code>findIndex</code>." },
      { id: "R8", text: "<code>find</code> повертає записи, що задовольняють умову, у порядку додавання; якщо таких немає, порожній масив.", hint: "<code>this.items.filter(pred)</code>. Передавайте користувачу копії списку, а не внутрішній масив." },
      { id: "R9", text: "Те саме сховище працює з іншою сутністю: <code>Repository&lt;Note&gt;</code>, де <code>Note</code> має лише <code>id</code> і <code>text</code>.", hint: "Усередині класу не згадуйте <code>Task</code> та його поля: працюйте лише з <code>T</code> і <code>Entity</code>." },
    ],
    starter: `interface Entity {
  id: number;
}

interface Task extends Entity {
  title: string;
  done: boolean;
  tags: string[];
}

class Repository<T extends Entity> {
  // TODO: приватні поля: масив записів і лічильник id

  // TODO: зберегти копію, видати id, повернути збережений запис
  add(item: Omit<T, "id">): T {
    return { ...item, id: 0 } as unknown as T;
  }

  // TODO: запис за id або undefined
  get(id: number): T | undefined {
    return undefined;
  }

  // TODO: злити зміни, id не міняти; немає запису — Error з id у повідомленні
  update(id: number, patch: Partial<Omit<T, "id">>): T {
    return { ...patch, id: 0 } as unknown as T;
  }

  // TODO: true, якщо запис був
  remove(id: number): boolean {
    return false;
  }

  // TODO: записи, що задовольняють умову
  find(pred: (item: T) => boolean): T[] {
    return [];
  }

  // TODO: копія списку у порядку додавання
  all(): readonly T[] {
    return [];
  }

  count(): number {
    return -1;
  }
}
`,
    harness: repoHarness,
  },
  {
    id: "ts-api-parser",
    lang: "ts",
    lesson: "ts/12",
    title: "Проєкт: безпечний розбір відповіді API",
    xp: 60,
    context:
      "Дані із сервера приходять як <code>unknown</code>: TypeScript не знає, що всередині, і не може за вас гарантувати форму. Перевірка під час виконання (type guard) і тип-результат <code>Result</code> роблять помилки явними: функція не кидає несподіваних винятків, а повертає або значення, або пояснення.",
    brief: [
      "Бекенд повертає JSON зі списком користувачів. Напишіть шар, який перетворює «сирий» рядок JSON на типізований список або зрозумілу помилку. Жодних <code>any</code>: усе, що прийшло ззовні, має тип <code>unknown</code>, поки його не перевірено.",
      "Помилки мають точні тексти: за ними інтерфейс показуватиме повідомлення. Перевіряйте поля в порядку <code>id</code>, <code>name</code>, <code>email</code>, <code>role</code>: повідомлення стосується першого поганого.",
    ],
    contract: [
      "<code>interface User { id: number; name: string; email: string; role: \"admin\" | \"editor\" | \"viewer\" }</code> та <code>type Result&lt;T&gt; = { ok: true; value: T } | { ok: false; error: string }</code> (вже в заготовці);",
      "<code>isUser(x: unknown): x is User</code>: <code>id</code> — ціле число більше 0; <code>name</code> — непорожній рядок без урахування пробілів; <code>email</code> — рядок виду <code>текст@текст</code> рівно з однією «@» і без пробілів; <code>role</code> — одне з трьох значень; зайві поля дозволені;",
      "<code>parseUser(x: unknown): Result&lt;User&gt;</code>: помилки <code>не об'єкт</code> (для не-об'єктів, <code>null</code> і масивів) або <code>невірне поле: id</code> (і так само <code>name</code>, <code>email</code>, <code>role</code>);",
      "<code>parseUsers(json: string): Result&lt;User[]&gt;</code>: <code>некоректний JSON</code>, <code>очікувався масив</code> або <code>елемент N: …</code> (N з нуля, далі помилка <code>parseUser</code>);",
      "<code>groupByRole(users: User[]): Record&lt;User[\"role\"], User[]&gt;</code> — завжди три ключі, порядок користувачів зберігається;",
      "<code>unwrapOr&lt;T&gt;(r: Result&lt;T&gt;, fallback: T): T</code>.",
    ],
    requirements: [
      { id: "R1", text: "<code>isUser</code> повертає <code>true</code> для коректних користувачів, зокрема із зайвими полями.", hint: "Спочатку перевірте, що <code>x</code> — об'єкт і не <code>null</code>, потім читайте поля через <code>(x as Record&lt;string, unknown&gt;)</code>." },
      { id: "R2", text: "<code>isUser</code> повертає <code>false</code> для <code>null</code>, масивів, примітивів та об'єктів із поганим <code>id</code>, <code>name</code>, <code>email</code> або <code>role</code>.", hint: "<code>typeof v.id === \"number\" &amp;&amp; Number.isInteger(v.id) &amp;&amp; v.id &gt; 0</code>. Для пошти допоможе регулярний вираз <code>/^[^@\\s]+@[^@\\s]+$/</code>." },
      { id: "R3", text: "<code>parseUser</code> для коректного значення повертає <code>{ ok: true, value }</code> з тими самими полями.", hint: "Використайте <code>isUser</code> усередині: якщо він пройшов, TypeScript уже знає тип <code>User</code>." },
      { id: "R4", text: "<code>parseUser</code> повертає точні тексти помилок: <code>не об'єкт</code> і <code>невірне поле: …</code> для першого поганого поля.", hint: "Перевіряйте поля по одному у вказаному порядку й повертайте помилку одразу, як знайшли першу." },
      { id: "R5", text: "<code>parseUsers</code> з коректним JSON-масивом повертає <code>ok: true</code> і список користувачів; <code>\"[]\"</code> — теж успіх.", hint: "<code>JSON.parse</code> повертає <code>unknown</code> (через присвоєння змінній типу <code>unknown</code>): не приписуйте йому тип без перевірки." },
      { id: "R6", text: "<code>parseUsers</code> повертає <code>некоректний JSON</code> для зламаного тексту та <code>очікувався масив</code>, якщо JSON — не масив.", hint: "<code>JSON.parse</code> кидає виняток: обгорніть його в <code>try/catch</code>. Масив перевіряйте через <code>Array.isArray</code>." },
      { id: "R7", text: "Помилка елемента має вигляд <code>елемент N: …</code> з номером першого поганого елемента (від нуля).", hint: "Ідіть по масиву з індексом і зупиняйтесь на першій помилці: <code>\"елемент \" + i + \": \" + r.error</code>." },
      { id: "R8", text: "<code>groupByRole</code> завжди повертає три ключі <code>admin</code>, <code>editor</code>, <code>viewer</code>; користувачі в групі — у вхідному порядку.", hint: "Почніть з об'єкта <code>{ admin: [], editor: [], viewer: [] }</code> і додавайте кожного користувача у свою групу." },
      { id: "R9", text: "<code>unwrapOr</code> повертає значення при <code>ok: true</code> і запасне значення при помилці; працює з будь-яким типом.", hint: "Узагальнений параметр <code>T</code> зв'язує тип результату із типом запасного значення." },
    ],
    starter: `interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// TODO: перевірка форми об'єкта під час виконання (x — будь-що, наприклад, з JSON)
function isUser(x: unknown): x is User {
  return typeof x === "string";
}

// TODO: Result<User>: помилки «не об'єкт» або «невірне поле: <ім'я поля>»
function parseUser(x: unknown): Result<User> {
  return { ok: false, error: "TODO" };
}

// TODO: розібрати JSON-рядок зі списком; помилки: «некоректний JSON», «очікувався масив», «елемент N: …»
function parseUsers(json: string): Result<User[]> {
  return { ok: false, error: "TODO" };
}

// TODO: розкласти користувачів за ролями (три ключі завжди)
function groupByRole(users: User[]): Record<User["role"], User[]> {
  return { admin: [], editor: [], viewer: [] };
}

// TODO: значення з Result або запасне
function unwrapOr<T>(r: Result<T>, fallback: T): T {
  return fallback;
}
`,
    harness: apiHarness,
  },
];
