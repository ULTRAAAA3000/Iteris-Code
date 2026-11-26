import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly JsTask[] = [
  {
    ...base, id: "js-parse-http", lesson: "js/92", xp: 30,
    title: "Розбір HTTP-відповіді й класу статусу",
    context: "Перш ніж fetch і сервери ховали подробиці, відповідь HTTP була звичайним текстом. Розібрати її вручну найкращий спосіб зрозуміти будову протоколу: рядок статусу, заголовки, порожній рядок і тіло.",
    brief: [
      "Напишіть <code>parseResponse(raw)</code>. Вхід це текст відповіді з розділювачами <code>\\r\\n</code>: рядок <code>HTTP/1.1 404 Not Found</code>, заголовки <code>Ім'я: значення</code>, порожній рядок і тіло. Поверніть <code>{ status, statusText, headers, body }</code>: <code>status</code> число, <code>statusText</code> решта рядка статусу (може містити кілька слів), <code>headers</code> об'єкт із <b>малими літерами</b> в іменах (значення без крайніх пробілів; у значенні може бути двокрапка), <code>body</code> рядок після порожнього рядка (може бути порожнім).",
      "Напишіть <code>statusClass(code)</code>, що повертає <code>\"info\"</code> (100–199), <code>\"success\"</code> (200–299), <code>\"redirect\"</code> (300–399), <code>\"client-error\"</code> (400–499), <code>\"server-error\"</code> (500–599) і <code>\"unknown\"</code> для решти.",
    ],
    starter: raw`function parseResponse(raw) {
  return { status: 0, statusText: "", headers: {}, body: "" };
}

function statusClass(code) {
  return "unknown";
}
`,
    tests: raw`describe("parseResponse", () => {
  it("статус і текст статусу", () => {
    const out = parseResponse("HTTP/1.1 404 Not Found\r\n\r\n");
    expect(out.status).toBe(404);
    expect(out.statusText).toBe("Not Found");
  });
  it("заголовки в нижньому регістрі й двокрапка у значенні", () => {
    const raw = "HTTP/1.1 301 Moved Permanently\r\nContent-Type: text/html\r\nLocation: https://x.ua/a\r\nX-Id:   5  \r\n\r\n";
    expect(parseResponse(raw).headers).toEqual({ "content-type": "text/html", location: "https://x.ua/a", "x-id": "5" });
  });
  it("тіло після порожнього рядка", () => {
    const raw = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"id\":7}";
    const out = parseResponse(raw);
    expect(out.body).toBe('{"id":7}');
    expect(JSON.parse(out.body).id).toBe(7);
  });
  it("тіло може містити порожні рядки", () => {
    const out = parseResponse("HTTP/1.1 200 OK\r\n\r\nперший\r\n\r\nдругий");
    expect(out.body).toBe("перший\r\n\r\nдругий");
  });
  it("порожнє тіло", () => {
    expect(parseResponse("HTTP/1.1 204 No Content\r\nX-A: 1\r\n\r\n").body).toBe("");
  });
});
describe("statusClass", () => {
  it("класи статусів", () => {
    expect(statusClass(100)).toBe("info");
    expect(statusClass(200)).toBe("success");
    expect(statusClass(204)).toBe("success");
    expect(statusClass(301)).toBe("redirect");
    expect(statusClass(404)).toBe("client-error");
    expect(statusClass(503)).toBe("server-error");
  });
  it("межі та невідомі коди", () => {
    expect(statusClass(199)).toBe("info");
    expect(statusClass(399)).toBe("redirect");
    expect(statusClass(599)).toBe("server-error");
    expect(statusClass(99)).toBe("unknown");
    expect(statusClass(600)).toBe("unknown");
  });
});`,
  },
  {
    ...base, id: "js-fetch-json", lesson: "js/93", xp: 30,
    title: "getJson: перевірка статусу й розбір відповіді",
    context: "fetch не відхиляється на 404 чи 500, тому кожен виклик має перевірити ok і лише потім розбирати тіло. Функція getJson збирає ці кроки й приймає fetch параметром, щоб її можна було тестувати без мережі.",
    brief: [
      "Напишіть асинхронну <code>getJson(fetchFn, url)</code>. Вона викликає <code>fetchFn(url)</code>. Якщо відповідь неуспішна (<code>!response.ok</code>), кидає <code>Error</code> з повідомленням <code>\"HTTP &lt;статус&gt;\"</code> і властивістю <code>status</code>.",
      "Інакше розбирає тіло як JSON і повертає значення. Якщо тіло не є коректним JSON, кидає <code>Error</code> з повідомленням <code>\"Некоректний JSON у відповіді\"</code> (а не сирий <code>SyntaxError</code>). Помилка самого <code>fetchFn</code> передається далі без змін.",
    ],
    starter: raw`async function getJson(fetchFn, url) {
  const response = await fetchFn(url);
  return response.json();
}
`,
    tests: raw`const respond = (body, status = 200) => async () => new Response(body, { status });
describe("getJson", () => {
  it("розбирає успішну відповідь", async () => {
    expect(await getJson(respond('{"id":1,"name":"Оля"}'), "/users/1")).toEqual({ id: 1, name: "Оля" });
  });
  it("передає адресу у fetchFn", async () => {
    const urls = [];
    await getJson(async (url) => { urls.push(url); return new Response("[]"); }, "/list");
    expect(urls).toEqual(["/list"]);
  });
  it("HTTP-помилка з кодом", async () => {
    let caught;
    try {
      await getJson(respond("Not Found", 404), "/x");
    } catch (error) {
      caught = error;
    }
    expect(caught.message).toBe("HTTP 404");
    expect(caught.status).toBe(404);
  });
  it("серверна помилка", async () => {
    await expect(getJson(respond("", 503), "/x")).rejects.toThrow("HTTP 503");
  });
  it("некоректний JSON", async () => {
    await expect(getJson(respond("<html>не json</html>"), "/x")).rejects.toThrow("Некоректний JSON у відповіді");
  });
  it("мережева помилка проходить без змін", async () => {
    const failing = async () => { throw new TypeError("fetch failed"); };
    await expect(getJson(failing, "/x")).rejects.toThrow(TypeError);
  });
});`,
  },
  {
    ...base, id: "js-post-json", lesson: "js/94", xp: 30,
    title: "postJson: надсилання JSON і розбір помилок",
    context: "POST із JSON вимагає правильного методу, заголовка й тіла, а при помилці сервер часто повертає в тілі пояснення. Хороший клієнт показує це пояснення замість голого статусу.",
    brief: [
      "Напишіть асинхронну <code>postJson(fetchFn, url, data, headers = {})</code>: викликає <code>fetchFn(url, options)</code>, де <code>options</code> це <code>{ method: \"POST\", headers, body }</code>. Заголовки це <code>\"Content-Type\": \"application/json\"</code> плюс додаткові з аргументу <code>headers</code> (вони можуть перекривати), тіло <code>JSON.stringify(data)</code>.",
      "Успішну відповідь повертає розібраною як JSON. Якщо відповідь неуспішна, кидає <code>Error</code>: повідомлення береться з поля <code>error</code> тіла відповіді (якщо тіло є JSON з таким полем), інакше це <code>\"HTTP &lt;статус&gt;\"</code>. Нерозбірливе тіло не повинно ламати обробку помилки.",
    ],
    starter: raw`async function postJson(fetchFn, url, data, headers = {}) {
  const response = await fetchFn(url, { method: "POST", body: data });
  return response.json();
}
`,
    tests: raw`function recorder(response) {
  const calls = [];
  const fn = async (url, options) => {
    calls.push({ url, options });
    return response();
  };
  fn.calls = calls;
  return fn;
}
describe("postJson", () => {
  it("формує запит", async () => {
    const f = recorder(() => new Response('{"id":9}', { status: 201 }));
    await postJson(f, "/users", { name: "Оля" });
    const { url, options } = f.calls[0];
    expect(url).toBe("/users");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe('{"name":"Оля"}');
  });
  it("повертає розібрану відповідь", async () => {
    const f = recorder(() => new Response('{"id":9}', { status: 201 }));
    expect(await postJson(f, "/users", {})).toEqual({ id: 9 });
  });
  it("додаткові заголовки зливаються й можуть перекривати", async () => {
    const f = recorder(() => new Response("{}"));
    await postJson(f, "/x", {}, { Authorization: "Bearer t", "Content-Type": "application/vnd.api+json" });
    expect(f.calls[0].options.headers.Authorization).toBe("Bearer t");
    expect(f.calls[0].options.headers["Content-Type"]).toBe("application/vnd.api+json");
  });
  it("повідомлення помилки береться з тіла", async () => {
    const f = recorder(() => new Response('{"error":"Некоректний email"}', { status: 422 }));
    await expect(postJson(f, "/users", {})).rejects.toThrow("Некоректний email");
  });
  it("без пояснення в тілі використовується статус", async () => {
    await expect(postJson(recorder(() => new Response("<html>bad gateway</html>", { status: 502 })), "/x", {})).rejects.toThrow("HTTP 502");
    await expect(postJson(recorder(() => new Response('{"other":1}', { status: 400 })), "/x", {})).rejects.toThrow("HTTP 400");
  });
});`,
  },
  {
    ...base, id: "js-api-client", lesson: "js/95", xp: 35,
    title: "Клієнт API: GET і POST",
    context: "Запит до API це три кроки: відправити, перевірити статус, розібрати JSON. Забути перевірку статусу найпоширеніша помилка: fetch не падає на 404 і 500. Тут fetch передається параметром (так код тестується без мережі).",
    brief: [
      "Напишіть <code>getUser(fetchFn, id)</code>: GET на <code>/api/users/&lt;id&gt;</code>; якщо відповідь не успішна (<code>!res.ok</code>), кидає <code>Error</code> з повідомленням <code>HTTP &lt;status&gt;</code>, інакше повертає розібраний JSON (<code>res.json()</code>).",
      "Напишіть <code>createUser(fetchFn, data)</code>: POST на <code>/api/users</code> із заголовком <code>Content-Type: application/json</code> і тілом <code>JSON.stringify(data)</code>; результат обробляється так само, як у <code>getUser</code>.",
    ],
    starter: raw`async function getUser(fetchFn, id) {
  return null;
}

async function createUser(fetchFn, data) {
  return null;
}
`,
    tests: raw`function fakeFetch(status, body) {
  const calls = [];
  const fn = async (url, options) => {
    calls.push({ url, options });
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  fn.calls = calls;
  return fn;
}
describe("getUser", () => {
  it("GET за адресою з id і розбір JSON", async () => {
    const f = fakeFetch(200, { id: 7, name: "Оля" });
    expect(await getUser(f, 7)).toEqual({ id: 7, name: "Оля" });
    expect(f.calls[0].url).toBe("/api/users/7");
  });
  it("статус помилки кидає Error з кодом", async () => {
    await expect(getUser(fakeFetch(404, {}), 1)).rejects.toThrow("HTTP 404");
    await expect(getUser(fakeFetch(500, {}), 1)).rejects.toThrow("HTTP 500");
  });
});
describe("createUser", () => {
  it("POST із JSON-тілом і заголовком", async () => {
    const f = fakeFetch(201, { id: 9 });
    expect(await createUser(f, { name: "Іван" })).toEqual({ id: 9 });
    const { url, options } = f.calls[0];
    expect(url).toBe("/api/users");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe('{"name":"Іван"}');
  });
  it("помилка сервера кидає Error", async () => {
    await expect(createUser(fakeFetch(400, {}), {})).rejects.toThrow("HTTP 400");
  });
});`,
  },
  {
    ...base, id: "js-render-list", lesson: "js/96", xp: 25,
    title: "Безпечне формування HTML зі списку",
    context: "Розмітку з даних користувача не можна склеювати без екранування, інакше з'являється XSS. Функція, яка екранує кожне значення, безпечна для будь-яких рядків.",
    brief: [
      "Напишіть <code>escapeHtml(text)</code>: замінює <code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>\"</code> та <code>'</code> на <code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;gt;</code>, <code>&amp;quot;</code> та <code>&amp;#39;</code>. Значення спершу перетворюється на рядок.",
      "Напишіть <code>renderList(items)</code>: <code>items</code> масив <code>{ text, done }</code>. Повертає рядок <code>&lt;ul&gt;...&lt;/ul&gt;</code>, у якому кожен елемент це <code>&lt;li&gt;текст&lt;/li&gt;</code> (текст екранований), а для <code>done: true</code> додається атрибут <code>class=\"done\"</code>: <code>&lt;li class=\"done\"&gt;текст&lt;/li&gt;</code>. Порожній масив дає <code>&lt;ul&gt;&lt;/ul&gt;</code>.",
    ],
    starter: raw`function escapeHtml(text) {
  return String(text);
}

function renderList(items) {
  return "<ul>" + items.map((item) => "<li>" + item.text + "</li>").join("") + "</ul>";
}
`,
    tests: raw`describe("escapeHtml", () => {
  it("екранує спецсимволи", () => {
    expect(escapeHtml('<b>"a" & \'b\'</b>')).toBe("&lt;b&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/b&gt;");
  });
  it("амперсанд екранується один раз", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
  it("не рядки перетворюються на рядки", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(null)).toBe("null");
  });
});
describe("renderList", () => {
  it("список із позначкою виконаного", () => {
    expect(renderList([{ text: "Хліб", done: true }, { text: "Молоко", done: false }]))
      .toBe('<ul><li class="done">Хліб</li><li>Молоко</li></ul>');
  });
  it("текст екранується", () => {
    expect(renderList([{ text: "<script>alert(1)</script>" }])).toBe("<ul><li>&lt;script&gt;alert(1)&lt;/script&gt;</li></ul>");
  });
  it("порожній список", () => {
    expect(renderList([])).toBe("<ul></ul>");
  });
});`,
  },
  {
    ...base, id: "js-validate-form", lesson: "js/97", xp: 30,
    title: "Валідація форми за правилами",
    context: "Перевірку полів форми зручно описати правилами й виконувати чистою функцією. Тоді її легко тестувати без DOM, а в інтерфейсі лишається лише показати повідомлення біля потрібних полів.",
    brief: [
      "Напишіть <code>validateForm(values, rules)</code>. <code>rules</code> це об'єкт <code>{ поле: { required, min, pattern } }</code>. Поле вважається порожнім, якщо значення <code>undefined</code>, <code>null</code> чи рядок із самих пробілів.",
      "Для порожнього поля з <code>required: true</code> повідомлення <code>\"Поле обов'язкове\"</code>. Непорожнє поле: якщо задано <code>min</code> і число менше за нього, повідомлення <code>\"Мінімум \" + min</code>; якщо задано <code>pattern</code> (регулярний вираз) і значення не збігається, <code>\"Некоректний формат\"</code>. Для кожного поля максимум одне повідомлення (перше, що спрацювало). Поверніть <code>{ valid, errors }</code>, де <code>errors</code> об'єкт полів із повідомленнями.",
    ],
    starter: raw`function validateForm(values, rules) {
  return { valid: true, errors: {} };
}
`,
    tests: raw`const rules = {
  name: { required: true },
  email: { required: true, pattern: /^\S+@\S+\.\S+$/ },
  age: { min: 18 },
};
describe("validateForm", () => {
  it("коректна форма", () => {
    expect(validateForm({ name: "Оля", email: "o@x.ua", age: 20 }, rules)).toEqual({ valid: true, errors: {} });
  });
  it("обов'язкові порожні поля", () => {
    const out = validateForm({ name: "  ", email: undefined, age: 20 }, rules);
    expect(out.valid).toBe(false);
    expect(out.errors).toEqual({ name: "Поле обов'язкове", email: "Поле обов'язкове" });
  });
  it("шаблон і мінімум", () => {
    const out = validateForm({ name: "Оля", email: "oops", age: "15" }, rules);
    expect(out.errors).toEqual({ email: "Некоректний формат", age: "Мінімум 18" });
  });
  it("необов'язкове порожнє поле не перевіряється далі", () => {
    expect(validateForm({ name: "Оля", email: "o@x.ua" }, rules).valid).toBe(true);
    expect(validateForm({ name: "Оля", email: "o@x.ua", age: "" }, rules).valid).toBe(true);
  });
  it("нуль не вважається порожнім", () => {
    const out = validateForm({ qty: 0 }, { qty: { required: true, min: 1 } });
    expect(out.errors).toEqual({ qty: "Мінімум 1" });
  });
  it("одне повідомлення на поле", () => {
    const out = validateForm({ code: "" }, { code: { required: true, pattern: /^\d+$/ } });
    expect(out.errors).toEqual({ code: "Поле обов'язкове" });
  });
});`,
  },
  {
    ...base, id: "js-request-cache", lesson: "js/98", xp: 40,
    title: "Кеш запитів з TTL і дедуплікацією",
    context: "Кеш, що пам'ятає відповіді на обмежений час і об'єднує одночасні запити в один, зменшує навантаження на сервер без складних бібліотек. Помилки не повинні закріплюватись у кеші.",
    brief: [
      "Напишіть <code>createCachedFetcher(load, options)</code>, де <code>load(key)</code> асинхронно завантажує значення, а <code>options</code> це <code>{ ttlMs, now }</code> (<code>now</code> функція повертає поточний час у мс, за замовчуванням <code>Date.now</code>). Повертає об'єкт з методами <code>get(key)</code> та <code>clear()</code>.",
      "<code>get(key)</code> повертає проміс зі значенням: якщо в кеші є свіжий запис (від збереження минуло менше за <code>ttlMs</code>), <code>load</code> не викликається; одночасні виклики з тим самим ключем ділять один запит; помилка <code>load</code> не кешується (наступний <code>get</code> спробує знову). <code>clear()</code> очищає кеш.",
    ],
    starter: raw`function createCachedFetcher(load, { ttlMs, now = () => Date.now() } = {}) {
  return {
    get: (key) => load(key),
    clear() {},
  };
}
`,
    tests: raw`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function setup(ttlMs = 100) {
  const state = { time: 0, calls: [] };
  const load = async (key) => {
    state.calls.push(key);
    await wait(5);
    return key + ":" + state.calls.length;
  };
  const fetcher = createCachedFetcher(load, { ttlMs, now: () => state.time });
  return { state, fetcher };
}
describe("createCachedFetcher", () => {
  it("повторний запит у межах TTL бере кеш", async () => {
    const { state, fetcher } = setup();
    expect(await fetcher.get("a")).toBe("a:1");
    state.time = 99;
    expect(await fetcher.get("a")).toBe("a:1");
    expect(state.calls).toEqual(["a"]);
  });
  it("після TTL запит оновлюється", async () => {
    const { state, fetcher } = setup();
    await fetcher.get("a");
    state.time = 100;
    expect(await fetcher.get("a")).toBe("a:2");
    expect(state.calls).toEqual(["a", "a"]);
  });
  it("різні ключі не заважають одне одному", async () => {
    const { state, fetcher } = setup();
    await fetcher.get("a");
    await fetcher.get("b");
    expect(state.calls).toEqual(["a", "b"]);
  });
  it("одночасні запити ділять один виклик", async () => {
    const { state, fetcher } = setup();
    const results = await Promise.all([fetcher.get("a"), fetcher.get("a"), fetcher.get("a")]);
    expect(results).toEqual(["a:1", "a:1", "a:1"]);
    expect(state.calls).toEqual(["a"]);
  });
  it("помилки не кешуються", async () => {
    let n = 0;
    const flaky = async () => {
      n++;
      if (n === 1) throw new Error("збій");
      return "готово";
    };
    const fetcher = createCachedFetcher(flaky, { ttlMs: 1000, now: () => 0 });
    await expect(fetcher.get("k")).rejects.toThrow("збій");
    expect(await fetcher.get("k")).toBe("готово");
    expect(n).toBe(2);
  });
  it("clear очищає кеш", async () => {
    const { state, fetcher } = setup();
    await fetcher.get("a");
    fetcher.clear();
    await fetcher.get("a");
    expect(state.calls).toEqual(["a", "a"]);
  });
});`,
  },
  {
    ...base, id: "js-router", lesson: "js/99", xp: 40,
    title: "Роутер без мережі: шляхи, параметри, 404 і 405",
    context: "Логіку маршрутизації варто відокремити від транспорту: чиста функція за методом і адресою вибирає обробник. Її легко тестувати, а підключити до http.createServer можна одним рядком.",
    brief: [
      "Напишіть <code>createRouter()</code>, що повертає об'єкт з методами <code>add(method, pattern, handler)</code> і <code>handle(method, url)</code>. Шаблон шляху може містити параметри <code>:name</code> (<code>/users/:id</code>), які збігаються з одним сегментом без скісних рисок.",
      "<code>handle</code> розбирає адресу (шлях і необов'язковий запит <code>?a=1</code>, запит ігнорується при зіставленні) і викликає обробник як <code>handler({ params, query })</code>, де <code>query</code> це об'єкт із <code>URLSearchParams</code>. Повертає <code>{ status: 200, body: результат_обробника }</code>. Якщо шлях знайдено, але метод не зареєстрований, поверніть <code>{ status: 405, allow: [...методи] }</code>. Якщо шляху немає взагалі, <code>{ status: 404 }</code>. Методи нечутливі до регістру.",
    ],
    starter: raw`function createRouter() {
  return {
    add(method, pattern, handler) {},
    handle(method, url) {
      return { status: 404 };
    },
  };
}
`,
    tests: raw`function makeRouter() {
  const router = createRouter();
  router.add("GET", "/users", () => ["список"]);
  router.add("GET", "/users/:id", ({ params }) => ({ id: params.id }));
  router.add("POST", "/users", () => "створено");
  router.add("GET", "/posts/:postId/comments/:commentId", ({ params }) => params);
  return router;
}
describe("createRouter", () => {
  it("статичний шлях", () => {
    expect(makeRouter().handle("GET", "/users")).toEqual({ status: 200, body: ["список"] });
  });
  it("параметр шляху", () => {
    expect(makeRouter().handle("GET", "/users/42")).toEqual({ status: 200, body: { id: "42" } });
  });
  it("кілька параметрів", () => {
    expect(makeRouter().handle("GET", "/posts/7/comments/9").body).toEqual({ postId: "7", commentId: "9" });
  });
  it("параметри запиту передаються обробнику, але не заважають зіставленню", () => {
    const router = createRouter();
    router.add("GET", "/search", ({ query }) => query);
    expect(router.handle("GET", "/search?q=кіт&page=2")).toEqual({ status: 200, body: { q: "кіт", page: "2" } });
  });
  it("метод нечутливий до регістру", () => {
    expect(makeRouter().handle("get", "/users").status).toBe(200);
  });
  it("404 для невідомого шляху", () => {
    expect(makeRouter().handle("GET", "/nothing")).toEqual({ status: 404 });
    expect(makeRouter().handle("GET", "/users/1/extra")).toEqual({ status: 404 });
  });
  it("405 для відомого шляху з іншим методом", () => {
    const out = makeRouter().handle("DELETE", "/users");
    expect(out.status).toBe(405);
    expect([...out.allow].sort()).toEqual(["GET", "POST"]);
  });
  it("параметр не збігається з порожнім сегментом", () => {
    expect(makeRouter().handle("GET", "/users/").status).toBe(404);
  });
});`,
  },
];
