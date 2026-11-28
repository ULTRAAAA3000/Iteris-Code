// Завдання глави 10 «Мережа й сервіси» (уроки 92–99). Еталони: tests/solutions/ts-ch10.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";
const D = "$";

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "ts-http-client", lesson: "ts/92", xp: 40,
    title: "HTTP-клієнт з підставним fetch",
    context: "Клієнт, якому fetch передають параметром, тестується без мережі. Підставна функція запам'ятовує запити й повертає заготовлені відповіді, а помилки сервера перетворюються на єдиний тип HttpError.",
    brief: [
      "Допишіть <code>get</code>: адресу складіть через <code>new URL(path, baseUrl).href</code>, викличте <code>fetchFn</code> з методом <code>GET</code>. Якщо відповідь не <code>ok</code>, киньте <code>HttpError</code> із текстом <code>GET шлях → статус</code>. Інакше поверніть <code>validate(await reply.json())</code>.",
      "Допишіть <code>post</code>: метод <code>POST</code>, заголовок <code>Content-Type: application/json</code> і тіло <code>JSON.stringify(body)</code>; перевірка статусу й валідація такі самі. Валідатор <code>toUser</code> уже написано.",
    ],
    starter: raw`interface HttpReply {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type FetchInit = { method?: string; headers?: Record<string, string>; body?: string };
type FetchLike = (url: string, init?: FetchInit) => Promise<HttpReply>;

class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

class HttpClient {
  constructor(
    private baseUrl: string,
    private fetchFn: FetchLike,
  ) {}

  async get<T>(path: string, validate: (data: unknown) => T): Promise<T> {
    // TODO: url через new URL(path, this.baseUrl).href; fetchFn(url, { method: "GET" });
    // !reply.ok → throw new HttpError(reply.status, "GET " + path + " → " + reply.status); інакше validate(await reply.json())
    throw new Error("не реалізовано");
  }

  async post<T>(path: string, body: unknown, validate: (data: unknown) => T): Promise<T> {
    // TODO: method POST, headers { "Content-Type": "application/json" }, body JSON.stringify(body)
    throw new Error("не реалізовано");
  }
}

function toUser(data: unknown): { id: number; name: string } {
  const record = data as { id?: unknown; name?: unknown };
  if (typeof record.id !== "number" || typeof record.name !== "string") {
    throw new Error("некоректний користувач");
  }
  return { id: record.id, name: record.name };
}

const calls: string[] = [];
const fakeFetch: FetchLike = async (url, init) => {
  calls.push((init?.method ?? "GET") + " " + url + (init?.body ? " " + init.body : ""));
  if (url.endsWith("/users/1")) {
    return { ok: true, status: 200, json: async () => ({ id: 1, name: "Олена" }) };
  }
  if (url.endsWith("/users") && init?.method === "POST") {
    return { ok: true, status: 201, json: async () => ({ id: 2, name: "Ігор" }) };
  }
  return { ok: false, status: 404, json: async () => ({}) };
};

async function main(): Promise<void> {
  const client = new HttpClient("https://api.example/", fakeFetch);
  console.log(JSON.stringify(await client.get("users/1", toUser)));
  console.log(JSON.stringify(await client.post("users", { name: "Ігор" }, toUser)));
  try {
    await client.get("users/99", toUser);
  } catch (error) {
    console.log(error instanceof HttpError ? "HttpError " + error.statusCode : "інша помилка");
  }
  console.log(calls.join("\n"));
}

main().catch((error) => console.log("аварія: " + (error instanceof Error ? error.message : error)));
`,
    checks: [
      { on: "stdout", name: "Відповіді, помилка й журнал запитів", equals: "{\"id\":1,\"name\":\"Олена\"}\n{\"id\":2,\"name\":\"Ігор\"}\nHttpError 404\nGET https://api.example/users/1\nPOST https://api.example/users {\"name\":\"Ігор\"}\nGET https://api.example/users/99", hint: "get і post повертають перевірене значення, а при статусі не ok кидають HttpError зі статусом." },
      { on: "source", name: "Адреса через URL", matches: "new\\s+URL\\s*\\(", hint: "Складайте адресу через new URL(path, this.baseUrl).href." },
      { on: "source", name: "Тіло як JSON", matches: "JSON\\.stringify\\s*\\(", hint: "Тіло POST-запиту це JSON.stringify(body)." },
    ],
  },
  {
    ...base, id: "ts-api-types", lesson: "ts/93", xp: 40,
    title: "Типи для відповіді API і type guard",
    context: "Дані з мережі приходять як рядок JSON і мають тип unknown: компілятор не знає, що всередині. Тому відповідь типізують і перевіряють type guard'ом, перш ніж довіряти. У пісочниці немає мережі, тож відповідь це готовий рядок.",
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
      { on: "stdout", name: "Коректні дані: {data, error: null}", has: '{"data":{"id":1,"name":"Оля"},"error":null}', hint: "Для коректного користувача поверніть { data: користувач, error: null }." },
      { on: "stdout", name: "Некоректні дані: error «некоректні дані»", has: '{"data":null,"error":"некоректні дані"}', hint: "Якщо id не число, поверніть { data: null, error: \"некоректні дані\" }." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: '{"data":{"id":1,"name":"Оля"},"error":null}\n{"data":null,"error":"некоректні дані"}', hint: "Виводьте лише два рядки: по одному на кожен виклик parseUser." },
      { on: "source", name: "isUser це type guard", matches: "x\\s+is\\s+User", hint: "Тип результату isUser має бути предикатом: x is User." },
      { on: "source", name: "Використано JSON.parse", has: "JSON.parse(", hint: "Розберіть вхідний рядок через JSON.parse." },
    ],
  },
  {
    ...base, id: "ts-router", lesson: "ts/94", xp: 45,
    title: "Типізований маршрутизатор із 404 і 405",
    context: "Маршрутизатор зіставляє метод і шлях з обробником. Типи виводять назви параметрів зі шляху, а відсутній шлях і неправильний метод дають різні відповіді: 404 і 405.",
    brief: [
      "Допишіть <code>match(pattern, parts)</code>: сегменти шаблону й шляху мають збігатися за кількістю; сегмент, що починається з <code>:</code>, це параметр (значення розкодуйте через <code>decodeURIComponent</code>), решта збігаються дослівно. Якщо збігу немає, поверніть <code>null</code>.",
      "Допишіть <code>handle(method, path)</code>: розбийте шлях по <code>/</code> (порожні сегменти відкиньте), знайдіть перший маршрут зі збігом шляху й методу. Якщо шлях збігся, але метод інший, відповідь <code>405</code> («метод не дозволено»), якщо шляху нема, <code>404</code> («не знайдено»).",
    ],
    starter: raw`type ParamNames<P extends string> =
  P extends ${BT}${D}{string}:${D}{infer Name}/${D}{infer Rest}${BT} ? Name | ParamNames<${BT}/${D}{Rest}${BT}> :
  P extends ${BT}${D}{string}:${D}{infer Name}${BT} ? Name : never;
type Params<P extends string> = { [K in ParamNames<P>]: string };

interface Reply {
  status: number;
  body: string;
}
type Handler<P extends string> = (params: Params<P>) => Reply;
type AnyHandler = (params: Record<string, string>) => Reply;
interface Route {
  method: string;
  segments: string[];
  handler: AnyHandler;
}

function match(pattern: string[], parts: string[]): Record<string, string> | null {
  // TODO: однакова довжина; ":name" → params.name = decodeURIComponent(частина); інакше сегменти мають збігатися
  return null;
}

class Router {
  private routes: Route[] = [];

  add<P extends string>(method: string, pattern: P, handler: Handler<P>): this {
    this.routes.push({ method, segments: pattern.split("/").filter(Boolean), handler: handler as unknown as AnyHandler });
    return this;
  }

  get<P extends string>(pattern: P, handler: Handler<P>): this {
    return this.add("GET", pattern, handler);
  }

  handle(method: string, path: string): Reply {
    // TODO: parts = path.split("/").filter(Boolean); перший маршрут з match(...) і потрібним методом → handler(params);
    // шлях збігся, а метод інший → 405 "метод не дозволено"; нічого не збіглося → 404 "не знайдено"
    return { status: 0, body: "" };
  }
}

const router = new Router()
  .get("/users/me", () => ({ status: 200, body: "поточний користувач" }))
  .get("/users/:id", ({ id }) => ({ status: 200, body: "користувач " + id }))
  .get("/users/:id/posts/:postId", ({ id, postId }) => ({ status: 200, body: id + "/" + postId }))
  .add("POST", "/users", () => ({ status: 201, body: "створено" }));

const requests: Array<[string, string]> = [
  ["GET", "/users/me"],
  ["GET", "/users/42"],
  ["GET", "/users/42/posts/7/"],
  ["POST", "/users"],
  ["GET", "/users"],
  ["DELETE", "/users/1"],
  ["GET", "/nope"],
];

for (const [method, path] of requests) {
  const reply = router.handle(method, path);
  console.log(method + " " + path + " → " + reply.status + " " + reply.body);
}
`,
    checks: [
      { on: "stdout", name: "Відповіді маршрутизатора", equals: "GET /users/me → 200 поточний користувач\nGET /users/42 → 200 користувач 42\nGET /users/42/posts/7/ → 200 42/7\nPOST /users → 201 створено\nGET /users → 405 метод не дозволено\nDELETE /users/1 → 405 метод не дозволено\nGET /nope → 404 не знайдено", hint: "Конкретний маршрут /users/me реєструється першим; шлях зі зайвим слешем у кінці нормалізується відкиданням порожніх сегментів." },
      { on: "source", name: "Розбиття шляху", matches: "split\\s*\\(\\s*[\"']/[\"']\\s*\\)", hint: "Розбивайте шлях методом split(\"/\") і відкидайте порожні сегменти через filter(Boolean)." },
      { on: "source", name: "Параметри з двокрапкою", matches: "startsWith\\s*\\(\\s*[\"']:[\"']\\s*\\)|\\[0\\]\\s*===?\\s*[\"']:[\"']", hint: "Сегмент-параметр починається з двокрапки: pattern[i].startsWith(\":\")." },
    ],
  },
  {
    ...base, id: "ts-middleware", lesson: "ts/95", xp: 45,
    title: "Ланцюжок middleware з авторизацією й обробкою помилок",
    context: "Middleware виносить повторювані дії з обробників у окремі ланки. Порядок ланок визначає, що саме вони бачать: обробник помилок стоїть першим, а авторизація коротко замикає ланцюжок для чужих запитів.",
    brief: [
      "Допишіть <code>compose</code>: функція викликає ланки по черзі, передаючи кожній <code>next</code>, що запускає наступну ланку (<code>dispatch(index + 1)</code>); коли ланки закінчились, викликається сам обробник.",
      "Допишіть ланки: <code>authenticate</code> записує в <code>request.user</code> ім'я за токеном і викликає <code>next</code>; <code>requireUser</code> без користувача повертає 401 «потрібна авторизація», не викликаючи <code>next</code>; <code>catchErrors</code> перетворює помилку обробника на 500 «внутрішня помилка».",
    ],
    starter: raw`interface HttpRequest {
  path: string;
  token?: string;
  user?: string;
}
interface HttpReply {
  status: number;
  body: string;
}
type Next = () => Promise<HttpReply>;
type Middleware = (request: HttpRequest, next: Next) => Promise<HttpReply>;
type HttpHandler = (request: HttpRequest) => Promise<HttpReply>;

function compose(middlewares: Middleware[], handler: HttpHandler): HttpHandler {
  // TODO: dispatch(index): коли index дорівнює довжині списку, handler(request);
  // інакше middlewares[index](request, () => dispatch(index + 1))
  return handler;
}

const log: string[] = [];

const trace =
  (name: string): Middleware =>
  async (request, next) => {
    log.push("→ " + name);
    const reply = await next();
    log.push("← " + name);
    return reply;
  };

function authenticate(tokens: Record<string, string>): Middleware {
  // TODO: request.user = tokens[request.token ?? ""]; return next();
  return async (request, next) => next();
}

const requireUser: Middleware = async (request, next) => {
  // TODO: немає request.user → { status: 401, body: "потрібна авторизація" }, інакше next()
  return next();
};

const catchErrors: Middleware = async (request, next) => {
  // TODO: try { return await next(); } catch { return { status: 500, body: "внутрішня помилка" }; }
  return next();
};

const handler: HttpHandler = async (request) => {
  if (request.path === "/boom") {
    throw new Error("збій");
  }
  return { status: 200, body: "привіт, " + request.user };
};

const app = compose([catchErrors, trace("log"), authenticate({ t1: "Олена" }), requireUser], handler);

async function main(): Promise<void> {
  const requests: HttpRequest[] = [
    { path: "/", token: "t1" },
    { path: "/", token: "bad" },
    { path: "/boom", token: "t1" },
  ];
  for (const request of requests) {
    const reply = await app(request);
    console.log(reply.status, reply.body);
  }
  console.log(log.join(" "));
}

main().catch((error) => console.log("аварія: " + (error instanceof Error ? error.message : error)));
`,
    checks: [
      { on: "stdout", name: "Відповіді й порядок ланок", equals: "200 привіт, Олена\n401 потрібна авторизація\n500 внутрішня помилка\n→ log ← log → log ← log → log", hint: "catchErrors стоїть першим і ловить збій обробника, а trace не встигає записати вихід, бо помилка проходить повз." },
      { on: "source", name: "Виклик наступної ланки", matches: "next\\s*\\(", hint: "Ланки передають керування далі через next()." },
      { on: "source", name: "Помилка ловиться навколо next", matches: "try\\s*\\{[\\s\\S]*await\\s+next[\\s\\S]*\\}\\s*catch", hint: "Обгорніть await next() у try/catch в ланці catchErrors." },
    ],
  },
  {
    ...base, id: "ts-crud-api", lesson: "ts/96", xp: 45,
    title: "CRUD API завдань у пам'яті",
    context: "CRUD в пам'яті це серце навчального API: дані в Map, відповіді як об'єкти зі статусом і тілом. Обробники перевіряються прямими викликами, без мережі й бази даних.",
    brief: [
      "Методи <code>create</code> і <code>get</code> уже готові. Допишіть <code>update(id, patch)</code>: 404, якщо запису нема; 400 «некоректні поля», якщо <code>patch</code> не об'єкт, <code>title</code> не непорожній рядок чи <code>done</code> не булеве; інакше 200 з оновленим записом (<code>id</code> змінювати не можна).",
      "Допишіть <code>remove(id)</code> (204 з <code>null</code> або 404) та <code>list(done)</code>: без параметра всі записи за зростанням <code>id</code>, <code>\"true\"</code> чи <code>\"false\"</code> фільтрують за полем <code>done</code>, інше значення дає 400 «done має бути true або false».",
    ],
    starter: raw`interface Task {
  id: number;
  title: string;
  done: boolean;
}
interface Reply {
  status: number;
  body: unknown;
}

class TaskApi {
  private tasks = new Map<number, Task>();
  private nextId = 1;

  create(input: unknown): Reply {
    const title = typeof input === "object" && input !== null ? (input as { title?: unknown }).title : undefined;
    if (typeof title !== "string" || title.trim() === "") {
      return { status: 400, body: { error: "title обов'язковий" } };
    }
    const task: Task = { id: this.nextId++, title: title.trim(), done: false };
    this.tasks.set(task.id, task);
    return { status: 201, body: task };
  }

  get(id: number): Reply {
    const task = this.tasks.get(id);
    return task ? { status: 200, body: task } : { status: 404, body: { error: "не знайдено" } };
  }

  update(id: number, patch: unknown): Reply {
    // TODO: 404; перевірка patch (title? непорожній рядок, done? булеве) → 400 "некоректні поля"; 200 з оновленим записом
    return { status: 0, body: null };
  }

  remove(id: number): Reply {
    // TODO: видалили → { status: 204, body: null }, інакше 404 { error: "не знайдено" }
    return { status: 0, body: null };
  }

  list(done?: string): Reply {
    // TODO: done не undefined і не "true"/"false" → 400 { error: "done має бути true або false" };
    // інакше 200 і масив записів за зростанням id (з фільтром за done, якщо задано)
    return { status: 0, body: null };
  }
}

const api = new TaskApi();
const show = (reply: Reply): void => console.log(reply.status, JSON.stringify(reply.body));

show(api.create({ title: "купити хліб" }));
show(api.create({ title: "  " }));
show(api.create({ title: "вивчити TypeScript" }));
show(api.update(2, { done: true }));
show(api.update(2, { done: "так" }));
show(api.update(9, { done: true }));
show(api.list());
show(api.list("true"));
show(api.list("maybe"));
show(api.remove(1));
show(api.remove(1));
show(api.create({ title: "нове" }));
show(api.get(3));
`,
    checks: [
      { on: "stdout", name: "Усі відповіді API", equals: "201 {\"id\":1,\"title\":\"купити хліб\",\"done\":false}\n400 {\"error\":\"title обов'язковий\"}\n201 {\"id\":2,\"title\":\"вивчити TypeScript\",\"done\":false}\n200 {\"id\":2,\"title\":\"вивчити TypeScript\",\"done\":true}\n400 {\"error\":\"некоректні поля\"}\n404 {\"error\":\"не знайдено\"}\n200 [{\"id\":1,\"title\":\"купити хліб\",\"done\":false},{\"id\":2,\"title\":\"вивчити TypeScript\",\"done\":true}]\n200 [{\"id\":2,\"title\":\"вивчити TypeScript\",\"done\":true}]\n400 {\"error\":\"done має бути true або false\"}\n204 null\n404 {\"error\":\"не знайдено\"}\n201 {\"id\":3,\"title\":\"нове\",\"done\":false}\n200 {\"id\":3,\"title\":\"нове\",\"done\":false}", hint: "Лічильник id не повертається назад після видалення: новий запис отримує номер 3." },
      { on: "source", name: "Видалення з Map", matches: "\\.delete\\s*\\(", hint: "Видаляйте запис через this.tasks.delete(id): метод повертає true, якщо запис існував." },
      { on: "source", name: "Сортування за id", matches: "sort\\s*\\(", hint: "Список має бути впорядкований за зростанням id." },
    ],
  },
  {
    ...base, id: "ts-api-errors", lesson: "ts/97", xp: 40,
    title: "Відображення доменних помилок у відповіді API",
    context: "Доменні помилки не знають про HTTP. На краю API вони відображаються в коди статусу в одному місці, а вичерпний switch з перевіркою never не дає забути новий вид помилки.",
    brief: [
      "Допишіть <code>toApiError</code>: <code>not_found</code> дає 404 і повідомлення <code>ресурс не знайдено</code>, <code>validation</code> дає 400 і <code>некоректні поля: список через кому</code>, <code>conflict</code> дає 409 з власним повідомленням. У <code>default</code> присвойте помилку змінній типу <code>never</code>.",
      "Допишіть <code>validateSignup</code>: збирає <b>всі</b> помилки (пошта без <code>@</code>, вік менше 18, порожнє ім'я після <code>trim</code>), та <code>shouldRetry</code>: <code>true</code> для 5xx і 429.",
    ],
    starter: raw`type DomainError =
  | { kind: "not_found"; resource: string }
  | { kind: "validation"; fields: string[] }
  | { kind: "conflict"; message: string };

interface ApiError {
  status: number;
  code: string;
  message: string;
}

interface FieldError {
  field: string;
  message: string;
}

function toApiError(error: DomainError): ApiError {
  // TODO: switch (error.kind) з трьома гілками; у default: const unreachable: never = error;
  return { status: 0, code: "", message: "" };
}

function validateSignup(input: { email: string; age: number; name: string }): FieldError[] {
  // TODO: email без "@" → { field: "email", message: "некоректна пошта" };
  // age < 18 → { field: "age", message: "вік має бути від 18" };
  // порожнє name.trim() → { field: "name", message: "ім'я обов'язкове" }
  return [];
}

function shouldRetry(statusCode: number): boolean {
  // TODO: true для 5xx і 429
  return false;
}

const errors: DomainError[] = [
  { kind: "not_found", resource: "користувач" },
  { kind: "validation", fields: ["email", "age"] },
  { kind: "conflict", message: "пошта вже зайнята" },
];

for (const error of errors) {
  const apiError = toApiError(error);
  console.log(apiError.status, apiError.code, apiError.message);
}
console.log(JSON.stringify(validateSignup({ email: "oops", age: 12, name: " " })));
console.log(JSON.stringify(validateSignup({ email: "o@x.ua", age: 30, name: "Олена" })));
console.log([200, 404, 429, 503].map(shouldRetry).join(","));
`,
    checks: [
      { on: "stdout", name: "Відображення, валідація й повтори", equals: "404 not_found користувач не знайдено\n400 validation некоректні поля: email, age\n409 conflict пошта вже зайнята\n[{\"field\":\"email\",\"message\":\"некоректна пошта\"},{\"field\":\"age\",\"message\":\"вік має бути від 18\"},{\"field\":\"name\",\"message\":\"ім'я обов'язкове\"}]\n[]\nfalse,false,true,true", hint: "Коди: not_found 404, validation 400, conflict 409. Валідація збирає всі помилки, а повторювати можна лише 5xx і 429." },
      { on: "source", name: "Вичерпна перевірка never", matches: "never", hint: "У default присвойте error змінній типу never, щоб новий вид помилки не можна було забути." },
      { on: "source", name: "Є switch за kind", matches: "switch\\s*\\(\\s*error\\.kind\\s*\\)", hint: "Відображайте помилку через switch (error.kind)." },
    ],
  },
  {
    ...base, id: "ts-pagination", lesson: "ts/98", xp: 45,
    title: "Фільтрація, сортування й пагінація списку",
    context: "Порядок операцій визначає правильність сторінок: спершу фільтр, потім сортування, потім нарізання. Метадані про кількість записів і сторінок рахують після фільтра, але до нарізання.",
    brief: [
      "Допишіть <code>paginate(all, page, pageSize)</code>: нарізка <code>slice</code> від <code>(page - 1) * pageSize</code> і метадані <code>total</code>, <code>page</code>, <code>pageSize</code>, <code>totalPages</code> (<code>Math.ceil</code>).",
      "Допишіть <code>listTasks(query)</code>: відфільтруйте за <code>done</code> (якщо задано), відсортуйте за <code>title</code> (<code>localeCompare</code> з мовою <code>uk</code>) або <code>priority</code> (за зростанням чи спаданням). За однакового ключа порядок визначає <code>id</code>. Потім поверніть сторінку.",
    ],
    starter: raw`interface Task {
  id: number;
  title: string;
  priority: number;
  done: boolean;
}

const tasks: Task[] = [
  { id: 1, title: "Хліб", priority: 2, done: false },
  { id: 2, title: "Арбуз", priority: 5, done: false },
  { id: 3, title: "Молоко", priority: 1, done: true },
  { id: 4, title: "Сир", priority: 5, done: true },
  { id: 5, title: "Банани", priority: 3, done: false },
  { id: 6, title: "Яблука", priority: 3, done: true },
  { id: 7, title: "Борошно", priority: 1, done: false },
];

type SortKey = "title" | "priority";

interface Query {
  done?: boolean;
  sort?: SortKey;
  direction?: "asc" | "desc";
  page: number;
  pageSize: number;
}

interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function paginate<T>(all: T[], page: number, pageSize: number): Page<T> {
  // TODO: slice від (page - 1) * pageSize; total = all.length; totalPages = Math.ceil(total / pageSize)
  return { items: [], total: 0, page, pageSize, totalPages: 0 };
}

function listTasks(query: Query): Page<Task> {
  // TODO: фільтр за query.done (якщо задано) → копія масиву й sort: title через localeCompare(..., "uk"),
  // priority числом; напрямок desc міняє знак; однакові ключі за id → paginate(...)
  return paginate([], query.page, query.pageSize);
}

const show = (page: Page<Task>): void =>
  console.log(page.items.map((task) => task.id).join(",") + " | всього " + page.total + ", сторінок " + page.totalPages + ", сторінка " + page.page);

show(listTasks({ page: 1, pageSize: 3, sort: "title" }));
show(listTasks({ page: 3, pageSize: 3, sort: "title" }));
show(listTasks({ done: false, sort: "priority", direction: "desc", page: 1, pageSize: 10 }));
show(listTasks({ sort: "priority", page: 1, pageSize: 4 }));
show(listTasks({ page: 9, pageSize: 3 }));
`,
    checks: [
      { on: "stdout", name: "Сторінки, порядок і метадані", equals: "2,5,7 | всього 7, сторінок 3, сторінка 1\n6 | всього 7, сторінок 3, сторінка 3\n2,5,1,7 | всього 4, сторінок 1, сторінка 1\n3,7,1,5 | всього 7, сторінок 2, сторінка 1\n | всього 7, сторінок 3, сторінка 9", hint: "Спершу фільтр, потім сортування (за однакового ключа за id), потім нарізання; total рахується до нарізання." },
      { on: "source", name: "Нарізання через slice", matches: "\\.slice\\s*\\(", hint: "Сторінку нарізайте через all.slice(start, start + pageSize)." },
      { on: "source", name: "Сортування кирилиці", matches: "localeCompare\\s*\\(", hint: "Назви порівнюйте через a.title.localeCompare(b.title, \"uk\")." },
    ],
  },
  {
    ...base, id: "ts-rpc", lesson: "ts/99", xp: 50,
    title: "Типізований RPC із контракту",
    context: "Один контракт породжує типи клієнта й обробників сервера. Клієнт на Proxy перетворює виклики методів на запити транспорту, а невідомий метод, якого типи не бачать, відловлює перевірка під час виконання.",
    brief: [
      "Типи <code>Contract</code>, <code>In</code>, <code>Out</code>, <code>Client</code>, <code>Handlers</code> та самі обробники вже готові. Допишіть <code>localTransport(table)</code>: функція <code>(method, input)</code> знаходить обробник за іменем методу, а якщо його нема, кидає <code>Error(\"невідомий метод: ім'я\")</code>.",
      "Допишіть <code>createClient(call)</code> на <code>Proxy</code>: звернення до будь-якого методу повертає функцію, що викликає <code>call(ім'я методу, вхід)</code>. Звертайтеся до імені через <code>String(method)</code>.",
    ],
    starter: raw`interface Contract {
  getUser: { input: { id: number }; output: { id: number; name: string } };
  sum: { input: { numbers: number[] }; output: number };
  ping: { input: undefined; output: string };
}

type In<C, M extends keyof C> = C[M] extends { input: infer I } ? I : never;
type Out<C, M extends keyof C> = C[M] extends { output: infer O } ? O : never;
type Client<C> = { [M in keyof C]: (input: In<C, M>) => Promise<Out<C, M>> };
type Handlers<C> = { [M in keyof C]: (input: In<C, M>) => Out<C, M> | Promise<Out<C, M>> };

const handlers: Handlers<Contract> = {
  getUser: ({ id }) => ({ id, name: "user" + id }),
  sum: async ({ numbers }) => numbers.reduce((a, b) => a + b, 0),
  ping: () => "pong",
};

function localTransport<C>(table: Handlers<C>): (method: string, input: unknown) => Promise<unknown> {
  // TODO: const handler = (table as unknown as Record<string, ((i: unknown) => unknown) | undefined>)[method];
  // немає обробника → throw new Error("невідомий метод: " + method); інакше return handler(input)
  return async () => undefined;
}

function createClient<C>(call: (method: string, input: unknown) => Promise<unknown>): Client<C> {
  // TODO: new Proxy({} as Client<C>, { get: (_target, method) => (input: unknown) => call(String(method), input) })
  return {} as Client<C>;
}

const client = createClient<Contract>(localTransport<Contract>(handlers));

async function main(): Promise<void> {
  console.log(JSON.stringify(await client.getUser({ id: 7 })));
  console.log(await client.sum({ numbers: [1, 2, 3] }));
  console.log(await client.ping(undefined));
  try {
    await (client as unknown as Record<string, (input: unknown) => Promise<unknown>>).nope({});
  } catch (error) {
    console.log(error instanceof Error ? "Error: " + error.message : error);
  }
}

main().catch((error) => console.log("аварія: " + (error instanceof Error ? error.message : error)));
`,
    checks: [
      { on: "stdout", name: "Виклики й невідомий метод", equals: "{\"id\":7,\"name\":\"user7\"}\n6\npong\nError: невідомий метод: nope", hint: "Клієнт передає ім'я методу й вхід у транспорт, а транспорт шукає обробник за іменем і кидає помилку для невідомого." },
      { on: "source", name: "Клієнт на Proxy", matches: "new\\s+Proxy\\s*\\(", hint: "Створіть клієнта через new Proxy({} as Client<C>, { get: ... })." },
      { on: "source", name: "Повідомлення про невідомий метод", matches: "невідомий метод", hint: "Для методу без обробника киньте Error(\"невідомий метод: \" + method)." },
    ],
  },
];
