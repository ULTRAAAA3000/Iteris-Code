// Еталони завдань глави 10 «Мережа й сервіси» курсу TypeScript
const raw = String.raw;
const BT = "`";
const D = "$";

export const SOLUTIONS_10 = {
  "ts-http-client": raw`interface HttpReply {
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
    const url = new URL(path, this.baseUrl).href;
    const reply = await this.fetchFn(url, { method: "GET" });
    if (!reply.ok) {
      throw new HttpError(reply.status, "GET " + path + " → " + reply.status);
    }
    return validate(await reply.json());
  }

  async post<T>(path: string, body: unknown, validate: (data: unknown) => T): Promise<T> {
    const url = new URL(path, this.baseUrl).href;
    const reply = await this.fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!reply.ok) {
      throw new HttpError(reply.status, "POST " + path + " → " + reply.status);
    }
    return validate(await reply.json());
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
  "ts-router": raw`type ParamNames<P extends string> =
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
  if (pattern.length !== parts.length) {
    return null;
  }
  const found: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(":")) {
      found[pattern[i].slice(1)] = decodeURIComponent(parts[i]);
    } else if (pattern[i] !== parts[i]) {
      return null;
    }
  }
  return found;
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
    const parts = path.split("/").filter(Boolean);
    let pathMatched = false;
    for (const route of this.routes) {
      const found = match(route.segments, parts);
      if (!found) {
        continue;
      }
      pathMatched = true;
      if (route.method === method) {
        return route.handler(found);
      }
    }
    return pathMatched ? { status: 405, body: "метод не дозволено" } : { status: 404, body: "не знайдено" };
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
  "ts-middleware": raw`interface HttpRequest {
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
  return (request) => {
    const dispatch = (index: number): Promise<HttpReply> =>
      index === middlewares.length ? handler(request) : middlewares[index](request, () => dispatch(index + 1));
    return dispatch(0);
  };
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
  return async (request, next) => {
    request.user = tokens[request.token ?? ""];
    return next();
  };
}

const requireUser: Middleware = async (request, next) => {
  if (!request.user) {
    return { status: 401, body: "потрібна авторизація" };
  }
  return next();
};

const catchErrors: Middleware = async (request, next) => {
  try {
    return await next();
  } catch {
    return { status: 500, body: "внутрішня помилка" };
  }
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
  "ts-crud-api": raw`interface Task {
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
    const task = this.tasks.get(id);
    if (!task) {
      return { status: 404, body: { error: "не знайдено" } };
    }
    if (typeof patch !== "object" || patch === null) {
      return { status: 400, body: { error: "некоректні поля" } };
    }
    const fields = patch as { title?: unknown; done?: unknown };
    if (fields.title !== undefined && (typeof fields.title !== "string" || fields.title.trim() === "")) {
      return { status: 400, body: { error: "некоректні поля" } };
    }
    if (fields.done !== undefined && typeof fields.done !== "boolean") {
      return { status: 400, body: { error: "некоректні поля" } };
    }
    const next: Task = {
      id,
      title: typeof fields.title === "string" ? fields.title.trim() : task.title,
      done: typeof fields.done === "boolean" ? fields.done : task.done,
    };
    this.tasks.set(id, next);
    return { status: 200, body: next };
  }

  remove(id: number): Reply {
    return this.tasks.delete(id) ? { status: 204, body: null } : { status: 404, body: { error: "не знайдено" } };
  }

  list(done?: string): Reply {
    if (done !== undefined && done !== "true" && done !== "false") {
      return { status: 400, body: { error: "done має бути true або false" } };
    }
    const all = [...this.tasks.values()].sort((a, b) => a.id - b.id);
    return { status: 200, body: done === undefined ? all : all.filter((task) => task.done === (done === "true")) };
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
  "ts-api-errors": raw`type DomainError =
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
  switch (error.kind) {
    case "not_found":
      return { status: 404, code: "not_found", message: error.resource + " не знайдено" };
    case "validation":
      return { status: 400, code: "validation", message: "некоректні поля: " + error.fields.join(", ") };
    case "conflict":
      return { status: 409, code: "conflict", message: error.message };
    default: {
      const unreachable: never = error;
      return unreachable;
    }
  }
}

function validateSignup(input: { email: string; age: number; name: string }): FieldError[] {
  const errors: FieldError[] = [];
  if (!input.email.includes("@")) {
    errors.push({ field: "email", message: "некоректна пошта" });
  }
  if (input.age < 18) {
    errors.push({ field: "age", message: "вік має бути від 18" });
  }
  if (input.name.trim() === "") {
    errors.push({ field: "name", message: "ім'я обов'язкове" });
  }
  return errors;
}

function shouldRetry(statusCode: number): boolean {
  return statusCode >= 500 || statusCode === 429;
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
  "ts-pagination": raw`interface Task {
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
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    total: all.length,
    page,
    pageSize,
    totalPages: Math.ceil(all.length / pageSize),
  };
}

function compareBy(key: SortKey, a: Task, b: Task): number {
  return key === "title" ? a.title.localeCompare(b.title, "uk") : a.priority - b.priority;
}

function listTasks(query: Query): Page<Task> {
  const rows = query.done === undefined ? [...tasks] : tasks.filter((task) => task.done === query.done);
  const sign = query.direction === "desc" ? -1 : 1;
  const key = query.sort;
  rows.sort((a, b) => (key ? sign * compareBy(key, a, b) : 0) || a.id - b.id);
  return paginate(rows, query.page, query.pageSize);
}

const show = (page: Page<Task>): void =>
  console.log(page.items.map((task) => task.id).join(",") + " | всього " + page.total + ", сторінок " + page.totalPages + ", сторінка " + page.page);

show(listTasks({ page: 1, pageSize: 3, sort: "title" }));
show(listTasks({ page: 3, pageSize: 3, sort: "title" }));
show(listTasks({ done: false, sort: "priority", direction: "desc", page: 1, pageSize: 10 }));
show(listTasks({ sort: "priority", page: 1, pageSize: 4 }));
show(listTasks({ page: 9, pageSize: 3 }));
`,
  "ts-rpc": raw`interface Contract {
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
  return async (method, input) => {
    const handler = (table as unknown as Record<string, ((i: unknown) => unknown) | undefined>)[method];
    if (!handler) {
      throw new Error("невідомий метод: " + method);
    }
    return handler(input);
  };
}

function createClient<C>(call: (method: string, input: unknown) => Promise<unknown>): Client<C> {
  return new Proxy({} as Client<C>, { get: (_target, method) => (input: unknown) => call(String(method), input) });
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
};
