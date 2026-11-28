// Глава 10 «Мережа й сервіси» (уроки 92–99). Тексти українською; у p, easy, note, work, tasks дозволені лише теги code, b, i, а < > & екрануємо.
const raw = String.raw;
const BT = "`";
const D = "$";

export const LESSONS_10 = [
  {
    t: "Типізований HTTP-клієнт з підставним fetch",
    ch: "Мережа й сервіси",
    easy: "Мережевий клієнт не мусить знати, звідки приходять відповіді: зі справжнього <code>fetch</code> чи з підставної функції. Якщо fetch передавати параметром, клієнт тестується без мережі й однаково працює всюди.",
    p: [
      "Запити до серверів зазвичай роблять функцією <code>fetch</code>: вона приймає адресу й параметри та повертає проміс із відповіддю. Відповідь має статус (<code>status</code>, <code>ok</code>), заголовки й тіло, яке читають методами <code>json()</code> чи <code>text()</code>. Але <code>fetch</code> це зовнішня залежність: вона звертається до мережі, тож в автоматичних тестах і в навчальній пісочниці недоступна.",
      "Рішення відоме з розділу про тести: <b>залежність передають параметром</b>. Клієнт отримує функцію <code>fetchFn</code> замість звернення до глобального <code>fetch</code>. У бойовому коді передають справжній <code>fetch</code>, у тесті підставну функцію, що повертає заготовлені відповіді. Тип такої функції описують самі, вузько: лише те, що клієнту справді потрібно від відповіді.",
      "Вузький тип відповіді виглядає так: об'єкт із полями <code>ok</code>, <code>status</code> і методом <code>json()</code>, що повертає <code>Promise&lt;unknown&gt;</code>. Тип <code>FetchLike</code> описує функцію, що приймає адресу та необов'язкові параметри й повертає такий проміс. Справжній <code>fetch</code> сумісний із цим типом за структурою, а підставна функція проста. Не оголошуйте власні типи з іменами <code>Response</code> чи <code>Request</code>: вони вже існують глобально.",
      "Клієнт інкапсулює повторюване: базову адресу, заголовки, перетворення тіла на JSON, перевірку статусу. Метод <code>get</code> будує адресу через <code>new URL(path, baseUrl)</code>, викликає <code>fetchFn</code>, і якщо відповідь не <code>ok</code>, кидає помилку зі статусом. Інакше повертає результат <code>reply.json()</code>. Зверніть увагу: <code>json()</code> повертає <code>unknown</code>, тож тип результату поки що лише обіцянка, яку ще треба перевірити.",
      "Про цю обіцянку: узагальнення <code>get&lt;T&gt;</code> без перевірки лише <i>приписує</i> тип, а не гарантує його. Чесніший варіант приймає <b>функцію-валідатор</b> <code>(data: unknown) =&gt; T</code>, що кидає помилку для неправильної форми. У наступному уроці ми побудуємо такі валідатори, а тут клієнт приймає їх параметром, тож тип результату справжній, а не декоративний.",
      "Помилки мережі та помилки сервера це різні речі. Відмова проміса (мережа впала) та відповідь зі статусом 500 потребують різної реакції. Хороший клієнт перетворює обидва випадки на власний клас помилки зі статусом і дозволяє перевизначити тайм-аут через <code>AbortSignal</code>. Так викликач бачить єдину форму збою й може вирішити, чи повторювати запит.",
      "Метод <code>post</code> додає тіло: <code>JSON.stringify(data)</code> і заголовок <code>Content-Type: application/json</code>. Заголовки зручно зливати: базові плюс специфічні для виклику. Дрібниця, яка рятує від багів: завжди кодувати параметри адреси через <code>URL</code> і <code>searchParams</code>, а не склеюванням рядків, як у уроці про <code>URL</code>. І не забувайте, що <code>fetch</code> не вважає статус 404 чи 500 відмовою проміса: перевіряти <code>ok</code> мусите ви.",
    ],
    code: [
      raw`interface HttpReply {
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
    const reply = await this.fetchFn(url, { method: "GET", headers: { Accept: "application/json" } });
    if (!reply.ok) {
      throw new HttpError(reply.status, "GET " + path + " → " + reply.status);
    }
    return validate(await reply.json());
  }
}

const fakeFetch: FetchLike = async (url) => {
  if (url.endsWith("/users/1")) {
    return { ok: true, status: 200, json: async () => ({ id: 1, name: "Олена" }) };
  }
  return { ok: false, status: 404, json: async () => ({}) };
};

const toName = (data: unknown): string => String((data as { name?: unknown }).name);
const client = new HttpClient("https://api.example/", fakeFetch);

async function main(): Promise<void> {
  console.log(await client.get("users/1", toName));
  try {
    await client.get("users/9", toName);
  } catch (error) {
    console.log(error instanceof HttpError ? "HttpError " + error.statusCode : "інша помилка");
  }
}

main();
`,
      raw`type FetchInit = { method?: string; headers?: Record<string, string>; body?: string };

const requests: string[] = [];

async function recordingFetch(url: string, init?: FetchInit) {
  requests.push((init?.method ?? "GET") + " " + url);
  if (init?.body) {
    requests.push("тіло: " + init.body);
  }
  if (init?.headers) {
    requests.push("заголовки: " + Object.keys(init.headers).join(", "));
  }
  return { ok: true, status: 201, json: async () => ({ created: true }) };
}

async function postJson(url: string, data: unknown): Promise<unknown> {
  const reply = await recordingFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return reply.json();
}

postJson("https://api.example/tasks", { title: "хліб" }).then((result) => {
  console.log(result);
  console.log(requests.join("\n"));
});
`,
      raw`class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function describe(error: unknown): string {
  if (error instanceof HttpError) {
    return "сервер відповів " + error.statusCode;
  }
  return "мережа: " + (error instanceof Error ? error.message : String(error));
}

async function call(kind: "ok" | "server" | "network"): Promise<string> {
  if (kind === "server") {
    throw new HttpError(500, "збій сервера");
  }
  if (kind === "network") {
    throw new Error("з'єднання перервано");
  }
  return "успіх";
}

async function main(): Promise<void> {
  for (const kind of ["ok", "server", "network"] as const) {
    try {
      console.log(await call(kind));
    } catch (error) {
      console.log(describe(error));
    }
  }
}

main();
`,
      raw`// не компілюється: підставна функція повертає не HttpReply, а об'єкт без status і json
interface HttpReply {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type FetchLike = (url: string) => Promise<HttpReply>;

const bad: FetchLike = async () => ({ ok: true });
console.log(bad);
`,
      raw`interface HttpReply {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type FetchLike = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<HttpReply>;

const real: FetchLike = fetch;
console.log(typeof real, real === fetch);
`,
    ],
    note: "Передавайте <code>fetch</code> параметром і описуйте його вузьким типом: клієнт стає тестованим і незалежним від середовища. <code>fetch</code> не відхиляє проміс при статусі 404 чи 500, тому перевіряйте <code>ok</code> самі, а результат валідуйте.",
    work: "Клієнт з підставним <code>fetch</code> тестується без серверів і працює однаково в браузері, у Node.js та на периферійних платформах. Єдина форма помилки з кодом статусу спрощує повтори, повідомлення користувачу й журнали.",
    tasks: [
      "Навіщо передавати <code>fetch</code> параметром, а не викликати глобальний?",
      "Чому клієнт має самостійно перевіряти <code>ok</code>, і чому тип результату <code>json()</code> це <code>unknown</code>?",
    ],
  },
  {
    t: "DTO і валідація даних на межі: від unknown до типу",
    ch: "Мережа й сервіси",
    easy: "Дані з мережі це запечатаний пакет: поки ви його не перевірили, ви не знаєте, що всередині. Валідація на межі перетворює «щось невідоме» (<code>unknown</code>) на надійний тип, і далі програма працює без сюрпризів.",
    p: [
      "<b>DTO</b> (data transfer object) це форма даних, якими обмінюються через мережу чи файли: тіло відповіді API, повідомлення черги. Вона визначається не вашим кодом, а зовнішнім світом, тож ви її не контролюєте. Сервер може змінити поле, додати <code>null</code>, повернути помилку замість даних. Якщо довіряти формі без перевірки, збій проявиться далеко від місця, де неправильні дані зайшли.",
      "Межа програми це місце, де зовнішні дані заходять у вашу логіку: відповідь API, прочитаний файл, ввід користувача, змінні середовища. Принцип: <b>усе, що перетинає межу, є <code>unknown</code> до перевірки</b>. На межі стоїть перетворення (parsing) в типізоване значення. Усередині програми код працює вже з довіреними типами й не повторює перевірок. Це підхід «розбирай, а не перевіряй».",
      "Найпростіша перевірка це <b>type guard</b> <code>isUser(x: unknown): x is User</code>. Він звужує <code>unknown</code> до <code>User</code>, якщо форма правильна. Проблема guard: він повертає лише <code>true</code> чи <code>false</code>, не пояснюючи, <i>що</i> саме не так. Для діагностики корисніший <b>парсер</b>, що повертає <code>Result</code>: або значення, або повідомлення з указанням шляху до поля.",
      "Парсер складають із маленьких частин: <code>parseString</code>, <code>parseNumber</code>, <code>parseArray(parseItem)</code>, <code>parseObject</code> зі схемою полів. Кожен приймає <code>unknown</code> і повертає <code>Result</code>. Складені разом, вони самі виводять тип результату. Так працюють бібліотеки на кшталт zod: ви описуєте схему, а тип отримуєте автоматично, і схема з типом ніколи не розходяться.",
      "Завжди перевіряйте <b>вкладену структуру</b>, а не лише верхній рівень. Об'єкт <code>{ id: 1, tags: [1, 2] }</code> проходить перевірку «є <code>id</code>», але ламає код, який очікує <code>tags: string[]</code>. Також розрізняйте відсутнє поле, <code>null</code> і порожній рядок. І не забувайте про числа: <code>typeof NaN</code> це <code>'number'</code>, тож для коректності додавайте <code>Number.isFinite</code>.",
      "Що робити із зайвими полями? Зазвичай їх відкидають, щоб у домені були лише відомі дані. А з відсутніми необов'язковими? Задають значення за замовчуванням на межі, а не по всьому коду. Так внутрішній тип лишається простим: без <code>undefined</code>, які треба перевіряти всюди. Перетворення DTO у доменний тип (наприклад, рядок дати в <code>Date</code>) теж відбувається на межі.",
      "Типова помилка: <code>const user = (await reply.json()) as User</code>. Приведення <code>as</code> лише змушує компілятор мовчати, дані не перевіряються. Якщо сервер змінить форму, помилка вибухне пізніше й у незрозумілому місці. Замініть приведення парсером. Це трохи більше коду, але він окупається першим же інцидентом із сервером, що змінив формат відповіді.",
    ],
    code: [
      raw`interface User {
  id: number;
  name: string;
}

function isUser(x: unknown): x is User {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as User).id === "number" &&
    typeof (x as User).name === "string"
  );
}

console.log(isUser({ id: 1, name: "Оля" }), isUser({ id: "1", name: "Оля" }), isUser(null), isUser({ id: 1 }));
`,
      raw`type Result<T> = { ok: true; value: T } | { ok: false; error: string };
type Parser<T> = (input: unknown, path?: string) => Result<T>;

const parseString: Parser<string> = (input, path = "значення") =>
  typeof input === "string" ? { ok: true, value: input } : { ok: false, error: path + ": очікувався рядок" };

const parseNumber: Parser<number> = (input, path = "значення") =>
  typeof input === "number" && Number.isFinite(input)
    ? { ok: true, value: input }
    : { ok: false, error: path + ": очікувалось число" };

function parseArray<T>(item: Parser<T>): Parser<T[]> {
  return (input, path = "масив") => {
    if (!Array.isArray(input)) {
      return { ok: false, error: path + ": очікувався масив" };
    }
    const values: T[] = [];
    for (let i = 0; i < input.length; i++) {
      const parsed = item(input[i], path + "[" + i + "]");
      if (!parsed.ok) {
        return parsed;
      }
      values.push(parsed.value);
    }
    return { ok: true, value: values };
  };
}

function parseObject<T extends object>(shape: { [K in keyof T]: Parser<T[K]> }): Parser<T> {
  return (input, path = "об'єкт") => {
    if (typeof input !== "object" || input === null) {
      return { ok: false, error: path + ": очікувався об'єкт" };
    }
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(shape) as Array<keyof T & string>) {
      const parsed = shape[key]((input as Record<string, unknown>)[key], path + "." + key);
      if (!parsed.ok) {
        return parsed;
      }
      result[key] = parsed.value;
    }
    return { ok: true, value: result as T };
  };
}

const parseUser = parseObject<{ id: number; name: string; tags: string[] }>({
  id: parseNumber,
  name: parseString,
  tags: parseArray(parseString),
});

console.log(parseUser({ id: 1, name: "Олена", tags: ["a"] }));
console.log(parseUser({ id: 1, name: "Олена", tags: ["a", 2] }));
console.log(parseUser({ id: "1" }));
console.log(parseUser(null));
`,
      raw`const payload: unknown = JSON.parse('{"id":"7","name":"Олена"}');

const user = payload as { id: number; name: string };
console.log(user.id + 1);
console.log(typeof user.id);
`,
      raw`// не компілюється: unknown не можна використовувати без перевірки форми
const data: unknown = JSON.parse('{"id":1,"name":"Олена"}');
console.log(data.name);
`,
      raw`interface UserDto {
  id: number;
  name: string;
  birthday?: string | null;
}

interface User {
  id: number;
  name: string;
  birthday: Date | null;
}

function toUser(dto: UserDto): User {
  return { id: dto.id, name: dto.name.trim(), birthday: dto.birthday ? new Date(dto.birthday) : null };
}

console.log(toUser({ id: 1, name: " Олена ", birthday: "1990-05-17T00:00:00Z" }).birthday?.getUTCFullYear());
console.log(toUser({ id: 2, name: "Ігор" }).birthday);
`,
    ],
    note: "Усе, що прийшло ззовні, це <code>unknown</code>. Перетворюйте його в тип на межі парсером, що повертає <code>Result</code> з указанням шляху до помилки. Приведення <code>as</code> нічого не перевіряє й лише ховає проблему.",
    work: "Відповіді сторонніх API змінюються без попередження. Парсер на межі ловить розбіжність одразу й каже, яке саме поле не збігається, а решта програми працює з типами, яким можна довіряти.",
    tasks: [
      "Чому приведення <code>as User</code> до результату <code>json()</code> небезпечне?",
      "Чим парсер із <code>Result</code> корисніший за простий type guard?",
    ],
  },
  {
    t: "Типізований маршрутизатор",
    ch: "Мережа й сервіси",
    easy: "Маршрутизатор це диспетчер: за методом і шляхом запиту він вибирає потрібний обробник. Типи допомагають витягнути параметри зі шляху, як-от <code>/users/:id</code>, і не дають помилитися в їхніх назвах.",
    p: [
      "Сервер отримує запити виду «метод + шлях», наприклад <code>GET /users/42</code>. <b>Маршрутизатор</b> (router) зіставляє їх із таблицею маршрутів і викликає потрібний обробник. Маршрут описується методом, шаблоном шляху з параметрами (<code>/users/:id</code>) та функцією-обробником. Невідомий шлях дає відповідь 404, відомий шлях із неправильним методом дає 405.",
      "Шаблон шляху розбивають на сегменти за <code>/</code>. Сегмент, що починається з двокрапки, це параметр, інші мають збігатися дослівно. Реальний шлях розбивають так само й порівнюють сегменти: кількість має збігатися, а параметри збираються в об'єкт <code>{ id: '42' }</code>. Значення параметрів це рядки, і число треба перетворити й перевірити окремо.",
      "Цікава частина це типи. Шаблонні літеральні типи й умовні типи дозволяють <b>вивести назви параметрів зі шляху на рівні типів</b>: з рядка <code>'/users/:id/posts/:postId'</code> тип виводить назви <code>'id'</code> і <code>'postId'</code>. Тоді обробник отримує об'єкт <code>params</code> саме з цими полями, а звернення до неіснуючого параметра не скомпілюється. Так типізують сучасні маршрутизатори.",
      "Виведення працює через рекурсивний умовний тип із <code>infer</code> усередині шаблонного літерального типу: тип шукає двокрапку, захоплює назву до наступного слеша й повторює пошук у решті рядка. Ви вже знаєте <code>infer</code> і шаблонні літеральні типи з розділу про систему типів, тут їх застосовано до рядків-шляхів. Розбирати формулу в голові не обов'язково, головне розуміти ефект: назви параметрів із літерала шляху стають полями типу, і редактор підказує їх в обробнику.",
      "Реєстрація маршрутів: метод <code>router.get('/users/:id', handler)</code> додає запис і, завдяки узагальненню на рядок шляху, типізує <code>params</code> в обробнику. Метод <code>handle(method, path)</code> шукає збіг. Порядок реєстрації важливий: перший підходящий виграє, тому конкретніші маршрути, як-от <code>/users/me</code>, реєструють перед параметричними на кшталт <code>/users/:id</code>.",
      "Обробник повертає відповідь у вигляді простого об'єкта зі статусом і тілом. Це не залежить від справжнього сервера, і маршрутизатор можна тестувати, просто викликавши <code>handle</code> без жодної мережі. Така ізольованість спрощує тести й дає змогу під'єднати той самий маршрутизатор до різних серверів: Node.js, периферійних платформ, тестового стенда.",
      "Остерігайтеся підводних каменів: завершальний слеш (<code>/users/</code> і <code>/users</code>) краще нормалізувати; не забувайте про кодування символів у параметрах (<code>decodeURIComponent</code>); параметр не має містити слеш; для неоднозначних збігів потрібне правило пріоритету. А ще: типи виводяться з літералів, тому шаблон шляху має бути літералом, а не змінною типу <code>string</code>.",
    ],
    code: [
      raw`type ParamNames<P extends string> =
  P extends ${BT}${D}{string}:${D}{infer Name}/${D}{infer Rest}${BT} ? Name | ParamNames<${BT}/${D}{Rest}${BT}> :
  P extends ${BT}${D}{string}:${D}{infer Name}${BT} ? Name : never;

type Params<P extends string> = { [K in ParamNames<P>]: string };

const params: Params<"/users/:id/posts/:postId"> = { id: "42", postId: "7" };
console.log(params.id, params.postId);
`,
      raw`type ParamNames<P extends string> =
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
  .add("POST", "/users", () => ({ status: 201, body: "створено" }));

for (const [method, path] of [["GET", "/users/me"], ["GET", "/users/42"], ["POST", "/users"], ["GET", "/users"], ["GET", "/nope"]]) {
  const reply = router.handle(method, path);
  console.log(method + " " + path + " → " + reply.status + " " + reply.body);
}
`,
      raw`// не компілюється: у шляху параметр названо id, а в обробнику читають userId
type ParamNames<P extends string> =
  P extends ${BT}${D}{string}:${D}{infer Name}/${D}{infer Rest}${BT} ? Name | ParamNames<${BT}/${D}{Rest}${BT}> :
  P extends ${BT}${D}{string}:${D}{infer Name}${BT} ? Name : never;
type Params<P extends string> = { [K in ParamNames<P>]: string };
interface Reply {
  status: number;
  body: string;
}

declare class Router {
  get<P extends string>(pattern: P, handler: (params: Params<P>) => Reply): this;
}

declare const router: Router;
router.get("/users/:id", (params) => ({ status: 200, body: params.userId }));
`,
      raw`function normalize(path: string): string {
  const clean = path.split("?")[0];
  return "/" + clean.split("/").filter(Boolean).map(decodeURIComponent).join("/");
}

console.log(normalize("/users/"));
console.log(normalize("//users//42?x=1"));
console.log(normalize("/search/привіт%20світ"));
`,
    ],
    note: "Маршрут це метод, шаблон шляху й обробник. Параметри <code>:id</code> збираються в об'єкт, а їхні назви можна вивести на рівні типів. Конкретніші маршрути реєструйте перед параметричними, а відсутній шлях і неправильний метод розрізняйте як 404 і 405.",
    work: "Маршрутизатори лежать в основі веб-серверів і API. Типізовані параметри шляху не дозволяють помилитися в назві й форматі параметра, а ізольований <code>handle</code> тестується звичайними викликами без запуску сервера, що робить такі перевірки швидкими й надійними.",
    tasks: [
      "Чим відрізняється відповідь 404 від 405 у маршрутизаторі?",
      "Чому конкретніші маршрути, як-от <code>/users/me</code>, треба реєструвати перед <code>/users/:id</code>?",
    ],
  },
  {
    t: "Middleware: ланцюжок обробників",
    ch: "Мережа й сервіси",
    easy: "Middleware це конвеєр навколо обробника: кожна ланка може подивитися на запит, змінити його, передати далі чи зупинити, а потім обробити відповідь на зворотному шляху. Журнал, авторизація й обробка помилок це типові ланки.",
    p: [
      "Багато дій потрібні для кожного запиту: записати в журнал, перевірити авторизацію, обмежити частоту, обробити помилки, виміряти час. Дублювати їх у кожному обробнику не варто. <b>Middleware</b> виносить їх в окремі ланки, що обертають обробник. Запит проходить крізь ланцюжок ланок до обробника, а відповідь повертається назад тим самим шляхом, як у цибулини з шарами.",
      "Типова сигнатура: ланка це функція, що приймає запит і функцію <code>next</code>, яка запускає решту ланцюжка, а повертає проміс відповіді. Ланка може виконати код <i>до</i> <code>next()</code> (перевірити запит), викликати <code>next()</code> й отримати відповідь, виконати код <i>після</i> (змінити відповідь), або взагалі не викликати <code>next()</code> і одразу повернути свою відповідь.",
      "Складання ланцюжка: функція <code>compose(middlewares, handler)</code> повертає функцію, що обробляє запит. Найпростіша реалізація використовує індекс: <code>dispatch(i)</code> викликає <code>middlewares[i]</code> з <code>next = () =&gt; dispatch(i + 1)</code>. Коли індекс дійшов до кінця списку, викликається сам обробник. Усього кілька рядків, а виходить універсальний механізм, на якому тримаються Express і Koa. Важливо, що <code>next</code> повертає проміс: саме тому ланка може дочекатися відповіді й обробити її на зворотному шляху.",
      "Порядок ланок важливий. Ланка журналу перед авторизацією побачить усі запити, а після неї лише авторизовані. Ланка обробки помилок має стояти <i>першою</i> (зовнішньою), щоб ловити помилки всіх решти. Виконання нагадує вкладені виклики: «вхід A, вхід B, обробник, вихід B, вихід A». Це легко побачити, якщо ланки друкують повідомлення до й після <code>next()</code>.",
      "Ланки можуть передавати дані далі через <b>контекст</b>: об'єкт запиту розширюється полями, які додали попередні ланки, наприклад <code>request.user</code>. Типізувати це непросто, бо тип змінюється по ланцюжку. Прості рішення: необов'язкове поле у запиті з перевіркою в обробнику або узагальнений тип ланки, що описує, яке саме поле вона додає.",
      "Ланка може <b>коротко замкнути</b> ланцюжок: не викликати <code>next()</code> і повернути відповідь 401, якщо немає токена. Обробник тоді взагалі не виконується. Також ланка може перехопити помилку через <code>try/catch</code> навколо <code>await next()</code> і перетворити її на відповідь 500 з безпечним повідомленням, а подробиці записати в журнал.",
      "Помилки реалізації: забути викликати <code>next()</code> (запит «зависає»), викликати його двічі (обробник виконається двічі), забути <code>await</code> (код «після» виконається до завершення обробника). Усі ці випадки легко перевірити тестом, що записує порядок викликів у масив і порівнює його з очікуваним, адже саме порядок і є поведінкою ланцюжка. Цей прийом знайомий за Express, Koa та Hono; тут ви побачите його зсередини.",
    ],
    code: [
      raw`interface HttpRequest {
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

const logger =
  (name: string): Middleware =>
  async (request, next) => {
    console.log("вхід", name);
    const reply = await next();
    console.log("вихід", name);
    return reply;
  };

const app = compose([logger("A"), logger("B")], async () => {
  console.log("обробник");
  return { status: 200, body: "ok" };
});

app({ path: "/" }).then((reply) => console.log(reply.status));
`,
      raw`interface HttpRequest {
  path: string;
  token?: string;
}
interface HttpReply {
  status: number;
  body: string;
}
type Middleware = (request: HttpRequest, next: () => Promise<HttpReply>) => Promise<HttpReply>;
type HttpHandler = (request: HttpRequest) => Promise<HttpReply>;

function compose(middlewares: Middleware[], handler: HttpHandler): HttpHandler {
  return (request) => {
    const dispatch = (index: number): Promise<HttpReply> =>
      index === middlewares.length ? handler(request) : middlewares[index](request, () => dispatch(index + 1));
    return dispatch(0);
  };
}

const requireToken: Middleware = async (request, next) => {
  if (!request.token) {
    return { status: 401, body: "потрібен токен" };
  }
  return next();
};

const app = compose([requireToken], async () => {
  console.log("обробник виконано");
  return { status: 200, body: "секрет" };
});

async function main(): Promise<void> {
  const withToken = await app({ path: "/", token: "t" });
  const withoutToken = await app({ path: "/" });
  console.log(withToken.status, withToken.body);
  console.log(withoutToken.status, withoutToken.body);
}

main();
`,
      raw`interface HttpRequest {
  path: string;
}
interface HttpReply {
  status: number;
  body: string;
}
type Middleware = (request: HttpRequest, next: () => Promise<HttpReply>) => Promise<HttpReply>;
type HttpHandler = (request: HttpRequest) => Promise<HttpReply>;

function compose(middlewares: Middleware[], handler: HttpHandler): HttpHandler {
  return (request) => {
    const dispatch = (index: number): Promise<HttpReply> =>
      index === middlewares.length ? handler(request) : middlewares[index](request, () => dispatch(index + 1));
    return dispatch(0);
  };
}

const catchErrors: Middleware = async (request, next) => {
  try {
    return await next();
  } catch (error) {
    console.log("у журнал:", error instanceof Error ? error.message : String(error));
    return { status: 500, body: "внутрішня помилка" };
  }
};

const app = compose([catchErrors], async (request) => {
  if (request.path === "/boom") {
    throw new Error("збій у обробнику");
  }
  return { status: 200, body: "ok" };
});

async function main(): Promise<void> {
  for (const path of ["/", "/boom"]) {
    const reply = await app({ path });
    console.log(path, reply.status, reply.body);
  }
}

main();
`,
      raw`// не компілюється: ланка має повертати HttpReply, а не рядок
interface HttpRequest {
  path: string;
}
interface HttpReply {
  status: number;
  body: string;
}
type Middleware = (request: HttpRequest, next: () => Promise<HttpReply>) => Promise<HttpReply>;

const bad: Middleware = async (request, next) => "ok";
console.log(bad);
`,
      raw`interface HttpReply {
  status: number;
  body: string;
}
type Middleware = (path: string, next: () => Promise<HttpReply>) => Promise<HttpReply>;

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sloppy: Middleware = async (path, next) => {
  const reply = next();
  console.log("код після next, але без await");
  return reply;
};

const careful: Middleware = async (path, next) => {
  const reply = await next();
  console.log("код після next, з await");
  return reply;
};

const handler = async (): Promise<HttpReply> => {
  await pause(5);
  console.log("обробник завершився");
  return { status: 200, body: "ok" };
};

async function main(): Promise<void> {
  await sloppy("/", handler);
  await careful("/", handler);
}

main();
`,
    ],
    note: "Ланка отримує запит і <code>next</code>, може діяти до й після виклику, а може не викликати <code>next</code> і відповісти сама. Порядок має значення: обробник помилок ставте першим. Не забувайте <code>await next()</code>.",
    work: "Журнал запитів, авторизація, обмеження частоти, стиснення, CORS і обробка помилок у веб-серверах реалізуються саме як ланцюжок middleware. Один раз написана ланка діє на всі маршрути без копіювання коду.",
    tasks: [
      "Що станеться, якщо ланка не викличе <code>next()</code>?",
      "Чому ланку обробки помилок ставлять першою в ланцюжку?",
    ],
  },
  {
    t: "JSON API в пам'яті: CRUD",
    ch: "Мережа й сервіси",
    easy: "CRUD це чотири дії над даними: створити, прочитати, оновити, видалити. API в пам'яті це маленький «сервер» без мережі й бази: дані лежать у <code>Map</code>, а запити обробляє звичайна функція. Ідеально для тестів і навчання.",
    p: [
      "Майже кожен веб-сервіс будується навколо CRUD: Create (створити), Read (прочитати), Update (оновити), Delete (видалити). REST-API відповідає їм методами HTTP: <code>POST /tasks</code> створює, <code>GET /tasks</code> і <code>GET /tasks/:id</code> читають, <code>PATCH /tasks/:id</code> оновлює, <code>DELETE /tasks/:id</code> видаляє. Правильні коди відповідей: 201 після створення, 200 для читання, 204 без тіла після видалення, 404 для відсутнього запису.",
      "Для навчання й тестів зручне сховище <b>в пам'яті</b>: <code>Map&lt;number, Task&gt;</code> замість бази. Ідентифікатори видає лічильник. Така реалізація повністю детермінована, швидка й не потребує нічого, окрім коду. Крім того, вона дає чисте розділення шарів: коли потрібна справжня база, ви заміните лише сховище, а решта коду лишиться. Про це ми докладніше поговоримо в розділі про архітектуру.",
      "Типи даних розділяють на три. <b>Сутність</b> <code>Task</code> з усіма полями, включно з <code>id</code>. <b>Вхід для створення</b> <code>NewTask</code>: лише поля, які задає клієнт, без <code>id</code>. <b>Вхід для оновлення</b> <code>TaskPatch</code>: <code>Partial</code> змінюваних полів. Утилітарні типи з розділу про систему типів записують це в два рядки: <code>Omit&lt;Task, 'id'&gt;</code> і <code>Partial&lt;NewTask&gt;</code>.",
      "Створення: перевірити вхід (на межі, як у попередніх уроках), видати новий <code>id</code>, зберегти, повернути створений об'єкт зі статусом 201. Оновлення: знайти за <code>id</code>, повернути 404, якщо немає, злити поля <code>{ ...existing, ...patch }</code>, зберегти й повернути. Злиття не повинно дозволяти змінювати <code>id</code>: типом <code>TaskPatch</code> це заборонено, але на межі такі поля теж варто відкидати.",
      "Читання списку зазвичай підтримує фільтри: <code>GET /tasks?done=true</code>. Параметри запиту приходять рядками, тому <code>'true'</code> треба перетворити на булеве значення й перевірити коректність. Невідомі значення краще відхиляти з 400, ніж тихо ігнорувати: так клієнт швидше помітить власну помилку. Порядок результатів також має бути визначеним, наприклад за <code>id</code>.",
      "Видалення за змістом ідемпотентне, але відповіді відрізняються: перше видалення дає 204, повторне 404 (або теж 204, якщо ви обираєте суворішу ідемпотентність). Головне, щоб це було чітким правилом API й описаним у документації. Ще одна тонкість: після видалення лічильник <code>id</code> не повинен видавати той самий номер повторно, інакше старі посилання вказуватимуть на чужі дані.",
      "Спільна структура відповіді полегшує клієнтам життя: об'єкт зі статусом і тілом для всіх, а помилки в єдиній формі з полем <code>error</code>. Обробники CRUD, як і маршрутизатор, є звичайними функціями, тож перевіряються прямими викликами. Це перетворює тести на швидкі однорядкові перевірки без сервера, мережі й бази даних.",
    ],
    code: [
      raw`interface Task {
  id: number;
  title: string;
  done: boolean;
}
type NewTask = Omit<Task, "id">;
type TaskPatch = Partial<NewTask>;

class TaskStore {
  private tasks = new Map<number, Task>();
  private nextId = 1;

  create(input: NewTask): Task {
    const task: Task = { id: this.nextId++, ...input };
    this.tasks.set(task.id, task);
    return task;
  }

  list(): Task[] {
    return [...this.tasks.values()];
  }

  get(id: number): Task | undefined {
    return this.tasks.get(id);
  }

  update(id: number, patch: TaskPatch): Task | undefined {
    const current = this.tasks.get(id);
    if (!current) {
      return undefined;
    }
    const next: Task = { ...current, ...patch, id };
    this.tasks.set(id, next);
    return next;
  }

  remove(id: number): boolean {
    return this.tasks.delete(id);
  }
}

const store = new TaskStore();
store.create({ title: "хліб", done: false });
store.create({ title: "молоко", done: false });
console.log(store.update(2, { done: true }));
console.log(store.remove(1), store.remove(1));
console.log(store.list());
`,
      raw`interface Task {
  id: number;
  title: string;
  done: boolean;
}
interface Reply {
  status: number;
  body: unknown;
}

const tasks = new Map<number, Task>();
let nextId = 1;

function createTask(input: unknown): Reply {
  const title = typeof input === "object" && input !== null ? (input as { title?: unknown }).title : undefined;
  if (typeof title !== "string" || title.trim() === "") {
    return { status: 400, body: { error: "title обов'язковий" } };
  }
  const task: Task = { id: nextId++, title: title.trim(), done: false };
  tasks.set(task.id, task);
  return { status: 201, body: task };
}

function getTask(id: number): Reply {
  const task = tasks.get(id);
  return task ? { status: 200, body: task } : { status: 404, body: { error: "не знайдено" } };
}

function removeTask(id: number): Reply {
  return tasks.delete(id) ? { status: 204, body: null } : { status: 404, body: { error: "не знайдено" } };
}

const replies = [createTask({ title: " хліб " }), createTask({ title: "" }), getTask(1), getTask(5), removeTask(1), removeTask(1)];
for (const reply of replies) {
  console.log(reply.status, JSON.stringify(reply.body));
}
`,
      raw`function parseDone(value: string | null): boolean | undefined | null {
  if (value === null) {
    return undefined;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}

for (const query of ["", "?done=true", "?done=false", "?done=maybe"]) {
  console.log(JSON.stringify(query), parseDone(new URLSearchParams(query).get("done")));
}
`,
      raw`// не компілюється: TaskPatch не містить id, тому змінити його через оновлення не можна
interface Task {
  id: number;
  title: string;
  done: boolean;
}
type NewTask = Omit<Task, "id">;
type TaskPatch = Partial<NewTask>;

declare function updateTask(id: number, patch: TaskPatch): Task | undefined;

updateTask(1, { id: 5 });
`,
      raw`const items = new Map<number, string>();

function addBad(value: string): number {
  const id = items.size + 1;
  items.set(id, value);
  return id;
}

addBad("a");
addBad("b");
items.delete(1);

console.log("новий id:", addBad("c"));
console.log("записи:", [...items.entries()]);
`,
    ],
    note: "CRUD відповідає методам POST, GET, PATCH, DELETE і кодам 201, 200, 204, 404. Розділяйте типи сутності, входу для створення й оновлення через <code>Omit</code> та <code>Partial</code>, а ідентифікатори видавайте лічильником, а не за розміром колекції.",
    work: "Майже кожен бекенд має CRUD для своїх сутностей. Версія в пам'яті дозволяє відточити логіку й тести за хвилини, а потім замінити лише шар сховища на справжню базу, не переписуючи обробники.",
    tasks: [
      "Навіщо розділяти типи <code>Task</code>, <code>NewTask</code> і <code>TaskPatch</code>?",
      "Чому ідентифікатор не можна обчислювати як <code>size + 1</code> після видалень?",
    ],
  },
  {
    t: "Помилки API: коди й відображення помилок",
    ch: "Мережа й сервіси",
    easy: "Коли щось іде не так, API має відповісти зрозуміло: правильним кодом і короткою причиною. Доменні помилки програми відображаються в HTTP-коди в одному місці, і клієнт щоразу бачить однакову форму помилки.",
    p: [
      "Клієнт API розрізняє успіх і невдачу за <b>кодом статусу</b>. Основні групи: 2xx успіх (200 OK, 201 створено, 204 без вмісту), 4xx помилка клієнта (400 некоректний запит, 401 не авторизований, 403 заборонено, 404 не знайдено, 409 конфлікт), 5xx помилка сервера (500, 503). Правильний код дозволяє клієнту діяти без розбору тексту помилки.",
      "Усередині програми помилки зручно виражати <b>доменними типами</b>, а не HTTP-кодами: «не знайдено», «некоректні дані», «конфлікт». Бізнес-логіка не повинна знати про HTTP: вона повертає або кидає саме доменну помилку. Це дозволяє повторно використовувати логіку в інших місцях, як-от консоль чи черги, де коди HTTP не мають змісту.",
      "На краю, у шарі API, відбувається <b>відображення</b> (mapping) доменної помилки у відповідь: «не знайдено» у 404, «некоректні дані» у 400 зі списком полів, «конфлікт» у 409. Для невідомих помилок відповідь 500 із загальним повідомленням. Відображення пишуть в одному місці, найчастіше у middleware обробки помилок із попереднього уроку, тож усі обробники його використовують автоматично.",
      "Типи допомагають зробити відображення вичерпним. Якщо доменні помилки утворюють <b>дискримінантне об'єднання</b> за полем <code>kind</code>, то функція відображення зі <code>switch</code> та перевіркою на <code>never</code> не скомпілюється, поки ви не обробите новий вид помилки. Так додавання нового типу помилки неможливо забути оновити в шарі API.",
      "Форма відповіді про помилку має бути єдиною: об'єкт з машинним <code>code</code> і людським <code>message</code>, а за потреби з масивом <code>details</code>. Машинний код стабільний і призначений програмам, а повідомлення може змінюватися й перекладатися. Не віддавайте клієнту внутрішні деталі: трасування стека, тексти SQL, шляхи файлів. Їх записують у журнал, а клієнту дають загальну відповідь.",
      "Помилки валідації корисно збирати <b>всі разом</b>, а не зупинятися на першій: клієнт одразу бачить, які поля виправити. Формат зі списком пар «поле й повідомлення» дозволяє підсвітити поля у формі. Це відрізняється від поведінки <code>throw</code> на першій проблемі, тому функції, що повертають масив помилок або <code>Result</code>, зручніші за винятки.",
      "Не змішуйте 4xx і 5xx. Код 4xx означає «вина клієнта, повторювати той самий запит безглуздо», а 5xx «вина сервера, можна повторити пізніше». Саме за цим розрізненням працюють автоматичні повтори в HTTP-клієнтах, як в уроці про backoff. Неправильний код змушує клієнт даремно повторювати або, навпаки, не повторювати те, що можна було повторити.",
    ],
    code: [
      raw`type DomainError =
  | { kind: "not_found"; resource: string }
  | { kind: "validation"; fields: string[] }
  | { kind: "conflict"; message: string };

interface ApiError {
  status: number;
  code: string;
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
  }
}

console.log(toApiError({ kind: "not_found", resource: "користувача" }));
console.log(toApiError({ kind: "validation", fields: ["email", "age"] }));
console.log(toApiError({ kind: "conflict", message: "пошта вже зайнята" }));
`,
      raw`// не компілюється: до об'єднання додали вид timeout, а switch його не обробляє
type DomainError = { kind: "not_found" } | { kind: "validation" } | { kind: "timeout" };

function httpStatus(error: DomainError): number {
  switch (error.kind) {
    case "not_found":
      return 404;
    case "validation":
      return 400;
    default: {
      const unreachable: never = error;
      return unreachable;
    }
  }
}

console.log(httpStatus({ kind: "not_found" }));
`,
      raw`class AppError extends Error {
  constructor(
    public httpStatus: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function toReply(error: unknown): { status: number; body: { error: { code: string; message: string } } } {
  if (error instanceof AppError) {
    return { status: error.httpStatus, body: { error: { code: error.code, message: error.message } } };
  }
  console.log("у журнал:", error instanceof Error ? error.message : String(error));
  return { status: 500, body: { error: { code: "internal", message: "внутрішня помилка" } } };
}

console.log(JSON.stringify(toReply(new AppError(404, "not_found", "користувача немає"))));
console.log(JSON.stringify(toReply(new Error("SELECT * FROM secrets"))));
`,
      raw`interface FieldError {
  field: string;
  message: string;
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

console.log(validateSignup({ email: "oops", age: 12, name: "" }));
console.log(validateSignup({ email: "o@x.ua", age: 30, name: "Олена" }));
`,
      raw`function shouldRetry(statusCode: number): boolean {
  return statusCode >= 500 || statusCode === 429;
}

console.log([200, 400, 404, 429, 500, 503].map((code) => code + ":" + shouldRetry(code)).join(" "));
`,
    ],
    note: "Доменні помилки відображайте в HTTP-коди в одному місці, а форму відповіді тримайте єдиною. Вичерпний <code>switch</code> із <code>never</code> не дає забути новий вид помилки. Не віддавайте клієнту внутрішні деталі, а повторювати можна лише 5xx і 429.",
    work: "Передбачувані коди й однакова форма помилок дозволяють клієнтам, мобільним застосункам і автоматичним повторам реагувати правильно. Внутрішні деталі при цьому лишаються в журналі й не відкривають зловмисникам нічого зайвого.",
    tasks: [
      "Навіщо відокремлювати доменні помилки від HTTP-кодів і де їх відображають?",
      "Чому корисно збирати всі помилки валідації разом, а не повертати першу?",
    ],
  },
  {
    t: "Пагінація й сортування на типах",
    ch: "Мережа й сервіси",
    adv: true,
    easy: "Коли записів тисячі, їх віддають порціями (сторінками) у певному порядку. Типи допомагають описати, за якими полями можна сортувати, і не дають попросити сортування за неіснуючим полем.",
    p: [
      "Список у тисячі записів не можна віддати одним запитом: це довго й дорого. Тому API віддає <b>сторінки</b>. Є два основні підходи: за зсувом (<code>page</code> і <code>pageSize</code>, або <code>offset</code> і <code>limit</code>) та за курсором (<code>after</code> з ідентифікатором останнього запису). Перший простіший і дозволяє перейти на довільну сторінку, другий стабільніший при змінах даних і швидший для великих таблиць.",
      "Пагінація за зсувом: сторінка <code>page</code> (рахуючи з 1) розміру <code>size</code> починається з індексу <code>(page - 1) * size</code>, тобто це <code>items.slice(start, start + size)</code>. Відповідь містить дані й метадані: <code>total</code> (усього записів), <code>page</code>, <code>pageSize</code> і <code>totalPages</code> (<code>Math.ceil(total / size)</code>). Типізована форма: узагальнений інтерфейс <code>Page&lt;T&gt;</code> із цими полями та масивом <code>items: T[]</code>.",
      "Параметри з адреси приходять рядками й потребують <b>валідації</b>: <code>page</code> має бути цілим від 1, <code>pageSize</code> від 1 до максимуму, наприклад 100: без верхньої межі хтось запросить мільйон записів. Некоректні значення або замінюють значеннями за замовчуванням, або відхиляють із 400. Правило не повинно бути мовчазним сюрпризом, тому його документують разом з API.",
      "Сортування: клієнт передає поле й напрямок, наприклад <code>sort=name</code> чи <code>sort=-createdAt</code>. Небезпека в тому, що довільний рядок як ім'я поля дозволить сортувати за чимось, чого не мало бути. Типове рішення: <b>білий список</b> полів. На типах: масив <code>const sortable = ['title', 'priority'] as const</code> і тип <code>(typeof sortable)[number]</code> дають об'єднання допустимих ключів, а невідомий ключ не скомпілюється.",
      "Узагальнена функція сортування може мати вигляд <code>sortBy&lt;T, K extends keyof T&gt;(items: T[], key: K)</code>. Порівняння залежить від типу значення: рядки через <code>localeCompare</code>, числа відніманням, дати через <code>getTime</code>. Обмеження <code>K extends keyof T</code> не дозволяє передати неіснуюче поле, і компілятор перевіряє це навіть для викликів із констант.",
      "Стабільність сортування: якщо два записи рівні за ключем, їхній відносний порядок має бути передбачуваним, інакше сторінки «пливуть» (запис опиняється на двох сторінках або зникає). Метод <code>sort</code> у сучасних середовищах стабільний, але додатковий критерій за <code>id</code> робить порядок детермінованим, навіть коли ключ збігається. Для курсорної пагінації це обов'язково.",
      "Порядок операцій: спершу <b>фільтрація</b>, потім <b>сортування</b>, потім <b>нарізання</b> сторінки. Якщо нарізати до сортування, на сторінці опиняться випадкові записи. Метадані <code>total</code> рахують після фільтрації, але до нарізання. Остерігайтеся сторінки за межами діапазону: запит <code>page=100</code> при двох сторінках повертає порожній список (не помилку), а <code>totalPages</code> підказує клієнту, що далі нічого немає.",
    ],
    code: [
      raw`interface Page<T> {
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

const numbers = Array.from({ length: 23 }, (_, i) => i + 1);
console.log(paginate(numbers, 1, 10).items.length);
console.log(paginate(numbers, 3, 10).items);
console.log(paginate(numbers, 9, 10).items);
console.log(paginate(numbers, 1, 10).totalPages);
`,
      raw`interface Task {
  id: number;
  title: string;
  priority: number;
  due: Date;
}

const sortable = ["title", "priority", "due"] as const;
type SortKey = (typeof sortable)[number];

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b, "uk");
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  return 0;
}

function sortBy(items: Task[], key: SortKey, direction: "asc" | "desc" = "asc"): Task[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((x, y) => sign * compareValues(x[key], y[key]) || x.id - y.id);
}

const tasks: Task[] = [
  { id: 1, title: "Хліб", priority: 2, due: new Date("2024-03-03T00:00:00Z") },
  { id: 2, title: "Арбуз", priority: 5, due: new Date("2024-03-01T00:00:00Z") },
  { id: 3, title: "Молоко", priority: 2, due: new Date("2024-03-02T00:00:00Z") },
];

console.log(sortBy(tasks, "title").map((task) => task.title).join(","));
console.log(sortBy(tasks, "priority", "desc").map((task) => task.id).join(","));
console.log(sortBy(tasks, "due").map((task) => task.id).join(","));
`,
      raw`function parsePaging(search: string): { page: number; pageSize: number } {
  const params = new URLSearchParams(search);
  const toInt = (value: string | null, fallback: number): number => {
    const n = Number(value);
    return value !== null && Number.isInteger(n) ? n : fallback;
  };
  const page = Math.max(1, toInt(params.get("page"), 1));
  const pageSize = Math.min(100, Math.max(1, toInt(params.get("pageSize"), 20)));
  return { page, pageSize };
}

console.log(parsePaging(""));
console.log(parsePaging("?page=3&pageSize=500"));
console.log(parsePaging("?page=-2&pageSize=0"));
console.log(parsePaging("?page=abc"));
`,
      raw`// не компілюється: поля createdAt немає у білому списку SortKey
const sortable = ["title", "priority", "due"] as const;
type SortKey = (typeof sortable)[number];

declare function sortBy(key: SortKey): void;

sortBy("title");
sortBy("createdAt");
`,
      raw`const values = [5, 3, 9, 1, 7, 2];

const wrong = values.slice(0, 3).sort((a, b) => a - b);
const right = [...values].sort((a, b) => a - b).slice(0, 3);

console.log("неправильно (спершу нарізали):", wrong);
console.log("правильно (спершу відсортували):", right);
`,
    ],
    note: "Порядок такий: фільтрація, сортування, нарізання. Параметри сторінки валідуйте й обмежуйте зверху, а поля сортування беріть із білого списку, який описується типом. Додатковий критерій за <code>id</code> робить порядок стабільним.",
    work: "Списки замовлень, повідомлень і записів у кожному застосунку віддаються сторінками. Правильна валідація параметрів і детермінований порядок захищають сервер від надмірних запитів, а користувачів від сторінок, що «пливуть» і показують один запис двічі.",
    tasks: [
      "Чому порядок має бути «фільтрація, сортування, нарізання», а не інакше?",
      "Як білий список полів сортування реалізується на типах?",
    ],
  },
  {
    t: "Виведення типів API: типізований RPC",
    ch: "Мережа й сервіси",
    adv: true,
    easy: "RPC це виклик віддаленої функції так, ніби вона локальна. Якщо опис API записати як тип, клієнт автоматично знає назви методів, типи аргументів і результатів, і помилитись у виклику стає складно.",
    p: [
      "<b>RPC</b> (remote procedure call) це стиль API, де клієнт викликає «процедури» сервера за іменем: <code>api.getUser({ id: 1 })</code> замість ручного складання адреси й розбору відповіді. Усередині це все одно запит по мережі, але для програміста це звичайний асинхронний виклик. Найцінніше, що тип такого виклику може бути <i>виведений з опису сервера</i>, і клієнт та сервер не розходяться.",
      "Основа це єдиний опис контракту: тип, що відображає назви методів на типи входу та виходу. Із нього виводять усе інше: тип клієнта, тип обробників сервера, типи викликів. Контракт один, тож клієнт і сервер синхронні за побудовою: зміна в контракті одразу ламає компіляцію там, де код не оновлено, а не в продакшені, коли хтось уже натиснув кнопку.",
      "Тип клієнта виводять відображеним типом: для кожного методу контракту клієнт має функцію, що приймає вхід цього методу й повертає проміс його виходу. Допоміжні типи <code>In</code> і <code>Out</code> витягують вхід та вихід через <code>infer</code>. Звернення до неіснуючого методу чи передача неправильного входу не скомпілюється. Це той самий підхід, що у відомих бібліотеках на кшталт tRPC.",
      "Сервер також типізується з контракту: тип обробників вимагає <i>всі</i> методи контракту, кожен із правильними типами входу й виходу, а результат дозволяє повертати як значення, так і проміс. Додали новий метод у контракт, і код сервера не збереться, доки його не реалізують. Так компілятор стежить за повнотою реалізації замість вас.",
      "Між клієнтом і сервером стоїть <b>транспорт</b>: функція, що доставляє ім'я методу й вхід і повертає вихід. Справжній транспорт використовує <code>fetch</code>, тестовий викликає обробники напряму. Клієнт створюють через <code>Proxy</code>: будь-яке звернення <code>client.getUser(x)</code> перетворюється на виклик <code>transport('getUser', x)</code>. Тип клієнта описує інтерфейс, а реалізація проста й універсальна.",
      "Валідація на сервері все одно потрібна. Типи існують лише під час компіляції: з мережі може прийти будь-що, у тому числі виклик неіснуючого методу, який типи не відловлять. Контракт часто доповнюють <b>схемами валідації</b> для входу, з яких і виводять тип, як у бібліотеці zod. Тоді тип і перевірка не розходяться, бо схема одна. У цьому уроці ми показуємо типи, а перевірку на межі ви вже вмієте писати.",
      "Обмеження підходу: клієнт і сервер мають ділити спільні типи (монорепозиторій або опублікований пакет), версії контракту потрібно узгоджувати, а загальні помилки та автентифікація складаються окремо. Але для внутрішніх API це чудовий компроміс: відсутність дублювання типів, миттєва реакція компілятора на зміни й автодоповнення для всіх викликів.",
    ],
    code: [
      raw`interface Contract {
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

function localTransport<C>(table: Handlers<C>) {
  return async (method: string, input: unknown): Promise<unknown> => {
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
  console.log(await client.getUser({ id: 7 }));
  console.log(await client.sum({ numbers: [1, 2, 3] }), await client.ping(undefined));
}

main();
`,
      raw`// не компілюється: вхід має неправильний тип, а метод deleteUser не входить у контракт
interface Contract {
  getUser: { input: { id: number }; output: { id: number; name: string } };
}
type In<C, M extends keyof C> = C[M] extends { input: infer I } ? I : never;
type Out<C, M extends keyof C> = C[M] extends { output: infer O } ? O : never;
type Client<C> = { [M in keyof C]: (input: In<C, M>) => Promise<Out<C, M>> };

declare const client: Client<Contract>;

client.getUser({ id: "7" });
client.deleteUser({ id: 7 });
`,
      raw`// не компілюється: в обробниках бракує методу ping із контракту
interface Contract {
  sum: { input: { numbers: number[] }; output: number };
  ping: { input: undefined; output: string };
}
type In<C, M extends keyof C> = C[M] extends { input: infer I } ? I : never;
type Out<C, M extends keyof C> = C[M] extends { output: infer O } ? O : never;
type Handlers<C> = { [M in keyof C]: (input: In<C, M>) => Out<C, M> | Promise<Out<C, M>> };

const handlers: Handlers<Contract> = {
  sum: ({ numbers }) => numbers.reduce((a, b) => a + b, 0),
};
console.log(handlers);
`,
      raw`type Handlers = Record<string, (input: unknown) => unknown>;

const table: Handlers = {
  ping: () => "pong",
};

async function transport(method: string, input: unknown): Promise<unknown> {
  const handler = table[method];
  if (!handler) {
    throw new Error("невідомий метод: " + method);
  }
  return handler(input);
}

async function main(): Promise<void> {
  console.log(await transport("ping", undefined));
  try {
    await transport("nope", {});
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }
}

main();
`,
      raw`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

interface Contract {
  sum: { input: { numbers: number[] }; output: number };
  ping: { input: undefined; output: string };
}
type In<C, M extends keyof C> = C[M] extends { input: infer I } ? I : never;
type Out<C, M extends keyof C> = C[M] extends { output: infer O } ? O : never;
type Client<C> = { [M in keyof C]: (input: In<C, M>) => Promise<Out<C, M>> };

type _t1 = Expect<Equal<In<Contract, "sum">, { numbers: number[] }>>;
type _t2 = Expect<Equal<Out<Contract, "ping">, string>>;
type _t3 = Expect<Equal<Awaited<ReturnType<Client<Contract>["sum"]>>, number>>;
type _t4 = Expect<Equal<keyof Client<Contract>, "sum" | "ping">>;

console.log("типи клієнта виведено з контракту");
`,
    ],
    note: "Один контракт «метод → вхід і вихід» породжує типи клієнта й обробників сервера, тож вони не розходяться. Бракуючий метод, неправильний вхід чи неіснуючий виклик ловить компілятор, а невідомий метод із мережі ловить перевірка під час виконання.",
    work: "У проєктах із клієнтом і сервером на TypeScript спільний контракт економить сотні рядків дублюваних типів і ловить розбіжності при збірці. Так працюють сучасні бібліотеки типобезпечних API, і ця ж ідея лежить в основі автоматично згенерованих клієнтів для внутрішніх сервісів команди.",
    tasks: [
      "Як з одного контракту виводяться типи і клієнта, і обробників сервера?",
      "Чому типи не замінюють валідацію вхідних даних на сервері?",
    ],
  },
];
