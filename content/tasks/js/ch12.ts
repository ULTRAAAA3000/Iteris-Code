import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12: readonly JsTask[] = [
  {
    ...base, id: "js-text-analyzer", lesson: "js/106", xp: 50,
    title: "Проєкт: аналізатор тексту",
    context: "Проєкт на об'єднання рядків, регулярних виразів, Map і сортування: одна функція розбирає текст і повертає статистику зі словами, реченнями, найчастішими словами та часом читання.",
    brief: [
      "Напишіть <code>analyzeText(text, { top = 3 } = {})</code>. Слова: збіги <code>/[\\p{L}\\p{N}'’-]+/gu</code> у нижньому регістрі, що містять хоча б одну літеру чи цифру. Поверніть об'єкт: <code>words</code> (кількість слів), <code>uniqueWords</code> (унікальних), <code>sentences</code> (непорожні частини за роздільниками <code>. ! ? …</code>, що мають літеру чи цифру), <code>letters</code> (кількість символів <code>\\p{L}</code> у тексті).",
      "<code>averageWordLength</code>: сума літер і цифр у словах, поділена на кількість слів, округлена до двох знаків (для порожнього тексту <code>0</code>). <code>longestWord</code>: перше слово з найбільшою довжиною (за літерами й цифрами), або <code>\"\"</code>. <code>topWords</code>: масив <code>{ word, count }</code> для перших <code>top</code> слів за кількістю (за спаданням), при рівній кількості за алфавітом (<code>localeCompare</code> з <code>\"uk\"</code>). <code>readingMinutes</code>: <code>0</code> для порожнього тексту, інакше <code>Math.ceil(words / 200)</code>. На вході не рядок кидайте <code>TypeError</code>.",
    ],
    starter: raw`function analyzeText(text, { top = 3 } = {}) {
  return {
    words: 0,
    uniqueWords: 0,
    sentences: 0,
    letters: 0,
    averageWordLength: 0,
    longestWord: "",
    topWords: [],
    readingMinutes: 0,
  };
}
`,
    tests: raw`const sample = "Кіт сидить. Кіт спить! А пес? Пес гавкає.";
describe("analyzeText: основна статистика", () => {
  it("слова, унікальні слова, речення", () => {
    const out = analyzeText(sample);
    expect(out.words).toBe(8);
    expect(out.uniqueWords).toBe(6);
    expect(out.sentences).toBe(4);
  });
  it("літери й середня довжина слова", () => {
    const out = analyzeText(sample);
    expect(out.letters).toBe(30);
    expect(out.averageWordLength).toBe(3.75);
  });
  it("найдовше слово: перше з найдовших", () => {
    expect(analyzeText(sample).longestWord).toBe("сидить");
  });
  it("час читання", () => {
    expect(analyzeText(sample).readingMinutes).toBe(1);
    expect(analyzeText("слово ".repeat(200)).readingMinutes).toBe(1);
    expect(analyzeText("слово ".repeat(201)).readingMinutes).toBe(2);
  });
});
describe("analyzeText: частоти", () => {
  it("топ слів за кількістю й алфавітом", () => {
    expect(analyzeText(sample).topWords).toEqual([
      { word: "кіт", count: 2 },
      { word: "пес", count: 2 },
      { word: "а", count: 1 },
    ]);
  });
  it("параметр top", () => {
    expect(analyzeText(sample, { top: 1 }).topWords).toEqual([{ word: "кіт", count: 2 }]);
    expect(analyzeText(sample, { top: 10 }).topWords.length).toBe(6);
    expect(analyzeText(sample, { top: 0 }).topWords).toEqual([]);
  });
  it("регістр не має значення", () => {
    const out = analyzeText("Кіт КІТ кіт");
    expect(out.uniqueWords).toBe(1);
    expect(out.topWords).toEqual([{ word: "кіт", count: 3 }]);
  });
});
describe("analyzeText: граничні випадки", () => {
  it("порожній текст", () => {
    expect(analyzeText("")).toEqual({
      words: 0, uniqueWords: 0, sentences: 0, letters: 0,
      averageWordLength: 0, longestWord: "", topWords: [], readingMinutes: 0,
    });
  });
  it("лише розділові знаки", () => {
    const out = analyzeText("... !!! - ' ?");
    expect(out.words).toBe(0);
    expect(out.sentences).toBe(0);
    expect(out.longestWord).toBe("");
  });
  it("дефіс, апостроф і числа всередині слів", () => {
    const out = analyzeText("Кафе-бар, м'ята і 2024!");
    expect(out.words).toBe(4);
    expect(out.longestWord).toBe("кафе-бар");
    expect(out.letters).toBe(12);
  });
  it("речення з кількома знаками й без завершення", () => {
    expect(analyzeText("Невже?! Так... Без крапки").sentences).toBe(3);
  });
  it("не рядок: TypeError", () => {
    expect(() => analyzeText(null)).toThrow(TypeError);
    expect(() => analyzeText(42)).toThrow(TypeError);
  });
});`,
  },
  {
    ...base, id: "js-todo-app", lesson: "js/107", xp: 55,
    title: "Проєкт: список справ зі сховищем",
    context: "Ядро застосунку списку справ: правила, пошук, статистика й збереження в будь-яке сховище з getItem та setItem. Зіпсовані дані й помилки запису не повинні його ламати.",
    brief: [
      "Напишіть <code>createTodoApp(storage, { now, nextId } = {})</code>. При створенні читає масив справ зі <code>storage.getItem(\"todos\")</code> (JSON); якщо запису немає, JSON зіпсований чи значення не масив, стартує з порожнім списком. <code>now</code> за замовчуванням <code>() =&gt; Date.now()</code>; <code>nextId</code> за замовчуванням видає числа, що починаються з найбільшого наявного id плюс 1.",
      "Методи: <code>add(title)</code> (обрізає пробіли, порожня назва кидає <code>RangeError</code>, повертає копію справи <code>{ id, title, done: false, createdAt: now() }</code>), <code>toggle(id)</code> (кидає <code>Error</code> «Справу не знайдено: id», якщо немає; повертає копію), <code>remove(id)</code> (<code>true</code>/<code>false</code>), <code>clearDone()</code> (кількість видалених), <code>list({ status = \"all\", search = \"\" })</code> (<code>\"all\"</code>/<code>\"active\"</code>/<code>\"done\"</code>, інше кидає <code>RangeError</code>; пошук за підрядком без урахування регістру; повертає копії), <code>stats()</code> (<code>{ total, done, active }</code>). Після кожної <b>зміни</b> список записується у <code>setItem(\"todos\", JSON.stringify(...))</code>; якщо <code>setItem</code> кидає помилку, застосунок продовжує працювати.",
    ],
    starter: raw`function createTodoApp(storage, { now = () => Date.now(), nextId } = {}) {
  const todos = [];
  return {
    add(title) {
      return { id: 1, title, done: false, createdAt: now() };
    },
    toggle(id) {},
    remove(id) {
      return false;
    },
    clearDone() {
      return 0;
    },
    list() {
      return [];
    },
    stats() {
      return { total: 0, done: 0, active: 0 };
    },
  };
}
`,
    tests: raw`function fakeStorage(initial) {
  const data = initial === undefined ? {} : { todos: initial };
  return {
    data,
    writes: 0,
    getItem(key) { return key in data ? data[key] : null; },
    setItem(key, value) { this.writes++; data[key] = String(value); },
  };
}
const clock = () => 1000;
describe("додавання й правила", () => {
  it("додає справу з обрізаною назвою й часом", () => {
    const app = createTodoApp(fakeStorage(), { now: clock });
    expect(app.add("  Хліб  ")).toEqual({ id: 1, title: "Хліб", done: false, createdAt: 1000 });
    expect(app.add("Молоко").id).toBe(2);
  });
  it("порожня назва: RangeError без запису", () => {
    const storage = fakeStorage();
    const app = createTodoApp(storage, { now: clock });
    expect(() => app.add("   ")).toThrow(RangeError);
    expect(storage.writes).toBe(0);
    expect(app.stats().total).toBe(0);
  });
  it("власний генератор id", () => {
    let n = 100;
    const app = createTodoApp(fakeStorage(), { now: clock, nextId: () => ++n });
    expect(app.add("a").id).toBe(101);
  });
  it("toggle, remove, clearDone", () => {
    const app = createTodoApp(fakeStorage(), { now: clock });
    app.add("a");
    app.add("b");
    app.add("c");
    expect(app.toggle(1).done).toBe(true);
    expect(app.toggle(1).done).toBe(false);
    app.toggle(2);
    app.toggle(3);
    expect(app.clearDone()).toBe(2);
    expect(app.list().map((t) => t.id)).toEqual([1]);
    expect(app.remove(1)).toBe(true);
    expect(app.remove(1)).toBe(false);
  });
  it("toggle неіснуючої справи", () => {
    const storage = fakeStorage();
    const app = createTodoApp(storage, { now: clock });
    expect(() => app.toggle(5)).toThrow("Справу не знайдено: 5");
    expect(storage.writes).toBe(0);
  });
});
describe("список, пошук і статистика", () => {
  function filled() {
    const app = createTodoApp(fakeStorage(), { now: clock });
    app.add("Купити хліб");
    app.add("Написати звіт");
    app.add("Купити молоко");
    app.toggle(2);
    return app;
  }
  it("фільтри за статусом", () => {
    const app = filled();
    expect(app.list().length).toBe(3);
    expect(app.list({ status: "done" }).map((t) => t.id)).toEqual([2]);
    expect(app.list({ status: "active" }).map((t) => t.id)).toEqual([1, 3]);
    expect(() => app.list({ status: "інше" })).toThrow(RangeError);
  });
  it("пошук без урахування регістру", () => {
    const app = filled();
    expect(app.list({ search: "КУПИТИ" }).map((t) => t.id)).toEqual([1, 3]);
    expect(app.list({ search: "купити", status: "done" })).toEqual([]);
  });
  it("статистика", () => {
    expect(filled().stats()).toEqual({ total: 3, done: 1, active: 2 });
  });
  it("list повертає копії", () => {
    const app = filled();
    app.list()[0].title = "змінено ззовні";
    expect(app.list()[0].title).toBe("Купити хліб");
    const added = app.add("нова");
    added.title = "теж зовні";
    expect(app.list().at(-1).title).toBe("нова");
  });
});
describe("збереження", () => {
  it("записує після кожної зміни й відновлюється зі сховища", () => {
    const storage = fakeStorage();
    const app = createTodoApp(storage, { now: clock });
    app.add("a");
    app.add("b");
    app.toggle(1);
    expect(storage.writes).toBe(3);
    const restored = createTodoApp(storage, { now: clock });
    expect(restored.list().map((t) => [t.id, t.title, t.done])).toEqual([[1, "a", true], [2, "b", false]]);
    expect(restored.add("c").id).toBe(3);
  });
  it("зіпсовані й некоректні дані дають порожній список", () => {
    expect(createTodoApp(fakeStorage("{ зіпсовано"), { now: clock }).list()).toEqual([]);
    expect(createTodoApp(fakeStorage('{"a":1}'), { now: clock }).list()).toEqual([]);
    expect(createTodoApp(fakeStorage("null"), { now: clock }).stats().total).toBe(0);
  });
  it("помилка запису не ламає застосунок", () => {
    const storage = { getItem: () => null, setItem() { throw new Error("Quota"); } };
    const app = createTodoApp(storage, { now: clock });
    expect(app.add("a").title).toBe("a");
    expect(app.list().length).toBe(1);
    expect(app.toggle(1).done).toBe(true);
  });
  it("видалення й очищення теж зберігаються", () => {
    const storage = fakeStorage();
    const app = createTodoApp(storage, { now: clock });
    app.add("a");
    app.add("b");
    app.toggle(1);
    app.clearDone();
    app.remove(2);
    expect(JSON.parse(storage.data.todos)).toEqual([]);
  });
});`,
  },
  {
    ...base, id: "js-api-project", lesson: "js/108", xp: 60,
    title: "Проєкт: API-клієнт із кешем і повторами",
    context: "Клієнт із чіткими помилками, повторами з експоненційними паузами, кешем для GET та дедуплікацією об'єднує все з мережевих глав. Залежності передаються ззовні, тому тести працюють без мережі.",
    brief: [
      "Напишіть <code>createApiClient({ baseUrl, fetchFn, sleep, now, retries = 2, backoffMs = 100, ttlMs = 0 })</code> з методами <code>get(path, { params } = {})</code> та <code>post(path, body)</code>. Адресу складайте через <code>new URL(path, baseUrl)</code>; параметри <code>null</code>/<code>undefined</code> пропускайте. У <code>fetchFn</code> передається <b>рядок</b> адреси (<code>url.href</code>) і об'єкт <code>{ method, headers, body }</code>. Тіло відповіді розбирайте з тексту: порожнє дає <code>null</code>.",
      "Відповідь не з 2xx кидає <code>HttpError</code> (<code>name</code> <code>\"HttpError\"</code>, <code>status</code>, повідомлення <code>\"HTTP 404\"</code>, а якщо тіло JSON має рядкове поле <code>error</code>, то <code>\"HTTP 404: текст\"</code>). <code>get</code> повторює спробу при мережевій помилці (відхилення <code>fetchFn</code>), статусі <code>429</code> та будь-якому <code>5xx</code>: до <code>retries</code> повторів, перед повтором <code>await sleep(backoffMs * 2 ** номер_спроби)</code> (номер з нуля). Після вичерпання спроб кидається остання помилка. Інші 4xx кидаються одразу. <code>post</code> не повторюється, надсилає JSON з <code>Content-Type: application/json</code> і після успіху очищає кеш.",
      "Якщо <code>ttlMs &gt; 0</code>, успішні <code>get</code> кешуються за повною адресою на <code>ttlMs</code> мс (час із <code>now()</code>; запис свіжий, поки <code>now() - збережено &lt; ttlMs</code>). Одночасні <code>get</code> на ту саму адресу ділять один запит. Помилки не кешуються.",
    ],
    starter: raw`class HttpError extends Error {}

function createApiClient({ baseUrl, fetchFn, sleep = async () => {}, now = () => Date.now(), retries = 2, backoffMs = 100, ttlMs = 0 }) {
  return {
    async get(path, { params } = {}) {
      const response = await fetchFn(new URL(path, baseUrl).href, { method: "GET" });
      return response.json();
    },
    async post(path, body) {
      const response = await fetchFn(new URL(path, baseUrl).href, { method: "POST", body: JSON.stringify(body) });
      return response.json();
    },
  };
}
`,
    tests: raw`function scripted(steps) {
  const calls = [];
  const fetchFn = async (url, options) => {
    calls.push({ url, options });
    const step = steps.length > 1 ? steps.shift() : steps[0];
    if (step instanceof Error) throw step;
    return typeof step === "function" ? step() : new Response(step.status === 204 ? null : (step.body ?? ""), { status: step.status ?? 200 });
  };
  fetchFn.calls = calls;
  return fetchFn;
}
function make(steps, extra = {}) {
  const sleeps = [];
  const state = { time: 0 };
  const fetchFn = scripted(steps);
  const client = createApiClient({
    baseUrl: "https://api.test",
    fetchFn,
    sleep: async (ms) => { sleeps.push(ms); },
    now: () => state.time,
    ...extra,
  });
  return { client, fetchFn, sleeps, state };
}
describe("запити й розбір", () => {
  it("будує адресу з параметрами й повертає JSON", async () => {
    const { client, fetchFn } = make([{ body: '{"id":1}' }]);
    expect(await client.get("/users", { params: { page: 2, q: "кіт", skip: null, none: undefined } })).toEqual({ id: 1 });
    expect(fetchFn.calls[0].url).toBe("https://api.test/users?page=2&q=%D0%BA%D1%96%D1%82");
    expect(fetchFn.calls[0].options.method).toBe("GET");
  });
  it("порожнє тіло дає null", async () => {
    const { client } = make([{ status: 204 }]);
    expect(await client.get("/ping")).toBe(null);
  });
  it("post надсилає JSON", async () => {
    const { client, fetchFn } = make([{ status: 201, body: '{"id":5}' }]);
    expect(await client.post("/users", { name: "Оля" })).toEqual({ id: 5 });
    const { options } = fetchFn.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe('{"name":"Оля"}');
  });
});
describe("помилки", () => {
  it("404 одразу кидається без повторів", async () => {
    const { client, fetchFn, sleeps } = make([{ status: 404, body: '{"error":"Немає такого"}' }]);
    let caught;
    try {
      await client.get("/x");
    } catch (error) {
      caught = error;
    }
    expect(caught.name).toBe("HttpError");
    expect(caught.status).toBe(404);
    expect(caught.message).toBe("HTTP 404: Немає такого");
    expect(fetchFn.calls.length).toBe(1);
    expect(sleeps).toEqual([]);
  });
  it("повідомлення без тексту помилки", async () => {
    const { client } = make([{ status: 400, body: "<html>" }]);
    await expect(client.get("/x")).rejects.toThrow("HTTP 400");
  });
});
describe("повтори", () => {
  it("5xx повторюється з експоненційними паузами", async () => {
    const { client, fetchFn, sleeps } = make([{ status: 503 }, { status: 503 }, { status: 200, body: '"ok"' }]);
    expect(await client.get("/x")).toBe("ok");
    expect(fetchFn.calls.length).toBe(3);
    expect(sleeps).toEqual([100, 200]);
  });
  it("вичерпання спроб кидає останню помилку", async () => {
    const { client, fetchFn, sleeps } = make([{ status: 500 }], { retries: 3, backoffMs: 10 });
    let caught;
    try {
      await client.get("/x");
    } catch (error) {
      caught = error;
    }
    expect(caught.status).toBe(500);
    expect(fetchFn.calls.length).toBe(4);
    expect(sleeps).toEqual([10, 20, 40]);
  });
  it("429 і мережеві помилки повторюються", async () => {
    const a = make([{ status: 429 }, { body: "1" }]);
    expect(await a.client.get("/x")).toBe(1);
    const b = make([new TypeError("fetch failed"), { body: "2" }]);
    expect(await b.client.get("/x")).toBe(2);
    expect(b.fetchFn.calls.length).toBe(2);
  });
  it("мережева помилка після всіх спроб проходить без змін", async () => {
    const { client } = make([new TypeError("fetch failed")], { retries: 1 });
    await expect(client.get("/x")).rejects.toThrow(TypeError);
  });
  it("post не повторюється", async () => {
    const { client, fetchFn } = make([{ status: 500 }]);
    await expect(client.post("/x", {})).rejects.toThrow("HTTP 500");
    expect(fetchFn.calls.length).toBe(1);
  });
});
describe("кеш і дедуплікація", () => {
  it("кеш діє в межах TTL", async () => {
    const { client, fetchFn, state } = make([{ body: "1" }, { body: "2" }], { ttlMs: 100 });
    expect(await client.get("/x")).toBe(1);
    state.time = 99;
    expect(await client.get("/x")).toBe(1);
    expect(fetchFn.calls.length).toBe(1);
    state.time = 100;
    expect(await client.get("/x")).toBe(2);
  });
  it("кеш залежить від адреси й параметрів", async () => {
    const { client, fetchFn } = make([{ body: "1" }], { ttlMs: 100 });
    await client.get("/x", { params: { a: 1 } });
    await client.get("/x", { params: { a: 2 } });
    expect(fetchFn.calls.length).toBe(2);
  });
  it("без ttlMs кешу немає", async () => {
    const { client, fetchFn } = make([{ body: "1" }]);
    await client.get("/x");
    await client.get("/x");
    expect(fetchFn.calls.length).toBe(2);
  });
  it("одночасні запити ділять один виклик", async () => {
    const slow = () => new Promise((resolve) => setTimeout(() => resolve(new Response("7")), 10));
    const { client, fetchFn } = make([slow], { ttlMs: 50 });
    const results = await Promise.all([client.get("/x"), client.get("/x"), client.get("/x")]);
    expect(results).toEqual([7, 7, 7]);
    expect(fetchFn.calls.length).toBe(1);
  });
  it("помилки не кешуються", async () => {
    const { client, fetchFn } = make([{ status: 404 }, { body: "1" }], { ttlMs: 100 });
    await expect(client.get("/x")).rejects.toThrow("HTTP 404");
    expect(await client.get("/x")).toBe(1);
    expect(fetchFn.calls.length).toBe(2);
  });
  it("post очищає кеш", async () => {
    const { client, fetchFn } = make([{ body: "1" }, { status: 201, body: "{}" }, { body: "2" }], { ttlMs: 1000 });
    expect(await client.get("/x")).toBe(1);
    await client.post("/x", {});
    expect(await client.get("/x")).toBe(2);
    expect(fetchFn.calls.length).toBe(3);
  });
});`,
  },
  {
    ...base, id: "js-task-queue", lesson: "js/109", xp: 60,
    title: "Проєкт: черга задач із пріоритетами",
    context: "Диспетчер фонових задач: важливіші виконуються раніше, одночасно працює обмежена кількість, а помилка однієї задачі не зупиняє решту. Кожен, хто додав задачу, отримує свій проміс.",
    brief: [
      "Напишіть <code>createTaskQueue({ concurrency = 1 } = {})</code>. Нецілий або менший за 1 <code>concurrency</code> кидає <code>RangeError</code>. Метод <code>add(fn, { priority = 0 } = {})</code> повертає проміс із результатом <code>fn()</code> (<code>fn</code> може бути синхронною чи асинхронною; синхронний виняток теж відхиляє лише цей проміс).",
      "Задачі виконуються за спаданням <code>priority</code>, при рівному за порядком додавання. Одночасно працює не більше <code>concurrency</code> задач: щойно одна завершилась (успіхом чи помилкою), стартує наступна. Задача <b>не стартує синхронно</b> всередині <code>add</code>: спершу всі синхронні виклики <code>add</code> мають потрапити в чергу, щоб пріоритет врахувався. Властивості <code>size</code> (скільки чекає) і <code>running</code> (скільки виконується). Метод <code>onIdle()</code> повертає проміс, що виконується, коли нічого не чекає й не виконується (одразу, якщо вже так).",
    ],
    starter: raw`function createTaskQueue({ concurrency = 1 } = {}) {
  return {
    add(fn, options) {
      return Promise.resolve().then(fn);
    },
    onIdle() {
      return Promise.resolve();
    },
    get size() {
      return 0;
    },
    get running() {
      return 0;
    },
  };
}
`,
    tests: raw`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function job(log, name, ms = 5) {
  return async () => {
    log.push("старт " + name);
    await wait(ms);
    log.push("кінець " + name);
    return name;
  };
}
describe("порядок і результати", () => {
  it("повертає результат кожної задачі", async () => {
    const queue = createTaskQueue();
    expect(await queue.add(() => 42)).toBe(42);
    expect(await queue.add(async () => "async")).toBe("async");
  });
  it("за замовчуванням виконує по одній у порядку додавання", async () => {
    const log = [];
    const queue = createTaskQueue();
    const all = [queue.add(job(log, "a")), queue.add(job(log, "b")), queue.add(job(log, "c"))];
    await Promise.all(all);
    expect(log).toEqual(["старт a", "кінець a", "старт b", "кінець b", "старт c", "кінець c"]);
  });
  it("вищий пріоритет іде першим, рівні за порядком додавання", async () => {
    const log = [];
    const queue = createTaskQueue();
    const all = [
      queue.add(job(log, "перша")),
      queue.add(job(log, "звичайна"), { priority: 0 }),
      queue.add(job(log, "термінова"), { priority: 10 }),
      queue.add(job(log, "важлива"), { priority: 5 }),
      queue.add(job(log, "термінова 2"), { priority: 10 }),
    ];
    await Promise.all(all);
    const starts = log.filter((x) => x.startsWith("старт")).map((x) => x.slice(6));
    expect(starts).toEqual(["термінова", "термінова 2", "важлива", "перша", "звичайна"]);
  });
});
describe("паралелізм", () => {
  it("не перевищує concurrency і використовує його повністю", async () => {
    let active = 0;
    let max = 0;
    const queue = createTaskQueue({ concurrency: 3 });
    const all = Array.from({ length: 9 }, () =>
      queue.add(async () => {
        active++;
        max = Math.max(max, active);
        await wait(5);
        active--;
      }),
    );
    await Promise.all(all);
    expect(max).toBe(3);
  });
  it("size і running", async () => {
    const queue = createTaskQueue({ concurrency: 2 });
    const all = [1, 2, 3, 4].map(() => queue.add(() => wait(10)));
    await wait(1);
    expect(queue.running).toBe(2);
    expect(queue.size).toBe(2);
    await Promise.all(all);
    expect(queue.running).toBe(0);
    expect(queue.size).toBe(0);
  });
  it("некоректний concurrency", () => {
    expect(() => createTaskQueue({ concurrency: 0 })).toThrow(RangeError);
    expect(() => createTaskQueue({ concurrency: 1.5 })).toThrow(RangeError);
  });
});
describe("помилки й простій", () => {
  it("помилка однієї задачі не зупиняє чергу", async () => {
    const queue = createTaskQueue();
    const ok1 = queue.add(async () => "перша");
    const bad = queue.add(async () => { throw new Error("збій"); });
    const syncBad = queue.add(() => { throw new TypeError("синхронний збій"); });
    const ok2 = queue.add(async () => "остання");
    expect(await ok1).toBe("перша");
    await expect(bad).rejects.toThrow("збій");
    await expect(syncBad).rejects.toThrow(TypeError);
    expect(await ok2).toBe("остання");
  });
  it("onIdle чекає завершення всіх задач", async () => {
    const log = [];
    const queue = createTaskQueue({ concurrency: 2 });
    queue.add(job(log, "a", 15));
    queue.add(job(log, "b", 5));
    queue.add(job(log, "c", 5));
    await queue.onIdle();
    expect(log.filter((x) => x.startsWith("кінець")).length).toBe(3);
    expect(queue.running).toBe(0);
  });
  it("onIdle виконується одразу, якщо черга порожня", async () => {
    const queue = createTaskQueue();
    await queue.onIdle();
    expect(queue.size).toBe(0);
  });
  it("задача може додавати нові задачі", async () => {
    const log = [];
    const queue = createTaskQueue();
    queue.add(async () => {
      log.push("батьківська");
      queue.add(async () => { log.push("дочірня"); });
    });
    await queue.onIdle();
    expect(log).toEqual(["батьківська", "дочірня"]);
  });
});`,
  },
  {
    ...base, id: "js-rate-limiter", lesson: "js/110", xp: 60,
    title: "Проєкт: rate limiter зі ковзним вікном",
    context: "Обмежувач частоти захищає API від перевантаження: кожному ключу дозволено не більше запитів за вікно часу, а відмова повідомляє, скільки залишилось чекати. Годинник передається ззовні.",
    brief: [
      "Напишіть <code>createRateLimiter({ limit, windowMs, now = () =&gt; Date.now() })</code>. <code>limit</code> має бути цілим від 1, <code>windowMs</code> додатним числом, інакше <code>RangeError</code>. Метод <code>tryAcquire(key = \"default\")</code> повертає <code>{ allowed, remaining, retryAfterMs }</code> за алгоритмом <b>ковзного вікна</b>: враховуються дозволені запити цього ключа з міткою часу <b>строго пізнішою</b> за <code>now() - windowMs</code>.",
      "Якщо таких менше за <code>limit</code>, запит дозволено: записується мітка <code>now()</code>, <code>remaining</code> це скільки ще дозволено у вікні після цього, <code>retryAfterMs</code> це <code>0</code>. Інакше <code>allowed</code> це <code>false</code>, <code>remaining</code> це <code>0</code>, а <code>retryAfterMs</code> це <code>найстаріша_мітка + windowMs - now()</code>; відхилений запит мітки не додає. Ключі незалежні. Метод <code>reset(key = \"default\")</code> скидає лічильник ключа. Порожні записи не повинні накопичуватись у пам'яті: метод <code>size()</code> повертає кількість ключів із активними мітками на цей момент.",
    ],
    starter: raw`function createRateLimiter({ limit, windowMs, now = () => Date.now() }) {
  return {
    tryAcquire(key = "default") {
      return { allowed: true, remaining: limit, retryAfterMs: 0 };
    },
    reset(key = "default") {},
    size() {
      return 0;
    },
  };
}
`,
    tests: raw`function setup(limit = 3, windowMs = 1000) {
  const state = { time: 0 };
  const limiter = createRateLimiter({ limit, windowMs, now: () => state.time });
  return { state, limiter };
}
describe("createRateLimiter: основна поведінка", () => {
  it("дозволяє до limit запитів і рахує remaining", () => {
    const { limiter } = setup();
    expect(limiter.tryAcquire("u")).toEqual({ allowed: true, remaining: 2, retryAfterMs: 0 });
    expect(limiter.tryAcquire("u")).toEqual({ allowed: true, remaining: 1, retryAfterMs: 0 });
    expect(limiter.tryAcquire("u")).toEqual({ allowed: true, remaining: 0, retryAfterMs: 0 });
  });
  it("відхиляє зайві запити з часом очікування", () => {
    const { state, limiter } = setup();
    state.time = 100; limiter.tryAcquire("u");
    state.time = 200; limiter.tryAcquire("u");
    state.time = 300; limiter.tryAcquire("u");
    state.time = 400;
    expect(limiter.tryAcquire("u")).toEqual({ allowed: false, remaining: 0, retryAfterMs: 700 });
    state.time = 900;
    expect(limiter.tryAcquire("u")).toEqual({ allowed: false, remaining: 0, retryAfterMs: 200 });
  });
  it("вікно ковзає: стара мітка виходить за межі", () => {
    const { state, limiter } = setup();
    state.time = 0; limiter.tryAcquire("u");
    state.time = 500; limiter.tryAcquire("u");
    state.time = 600; limiter.tryAcquire("u");
    state.time = 999;
    expect(limiter.tryAcquire("u").allowed).toBe(false);
    state.time = 1000;
    const out = limiter.tryAcquire("u");
    expect(out.allowed).toBe(true);
    expect(out.remaining).toBe(0);
  });
  it("відхилений запит не продовжує блокування", () => {
    const { state, limiter } = setup(1, 1000);
    state.time = 0; limiter.tryAcquire("u");
    state.time = 500; expect(limiter.tryAcquire("u").allowed).toBe(false);
    state.time = 999; expect(limiter.tryAcquire("u").allowed).toBe(false);
    state.time = 1000; expect(limiter.tryAcquire("u").allowed).toBe(true);
  });
});
describe("createRateLimiter: ключі, скидання, конфігурація", () => {
  it("ключі незалежні, ключ за замовчуванням спільний", () => {
    const { limiter } = setup(1, 1000);
    expect(limiter.tryAcquire("a").allowed).toBe(true);
    expect(limiter.tryAcquire("b").allowed).toBe(true);
    expect(limiter.tryAcquire("a").allowed).toBe(false);
    expect(limiter.tryAcquire().allowed).toBe(true);
    expect(limiter.tryAcquire().allowed).toBe(false);
  });
  it("reset скидає лічильник ключа", () => {
    const { limiter } = setup(1, 1000);
    limiter.tryAcquire("a");
    limiter.tryAcquire("b");
    limiter.reset("a");
    expect(limiter.tryAcquire("a").allowed).toBe(true);
    expect(limiter.tryAcquire("b").allowed).toBe(false);
  });
  it("size рахує лише ключі з активними мітками", () => {
    const { state, limiter } = setup(2, 1000);
    limiter.tryAcquire("a");
    state.time = 600;
    limiter.tryAcquire("b");
    expect(limiter.size()).toBe(2);
    state.time = 1100;
    expect(limiter.size()).toBe(1);
    state.time = 1700;
    expect(limiter.size()).toBe(0);
  });
  it("некоректна конфігурація: RangeError", () => {
    expect(() => createRateLimiter({ limit: 0, windowMs: 1000 })).toThrow(RangeError);
    expect(() => createRateLimiter({ limit: 1.5, windowMs: 1000 })).toThrow(RangeError);
    expect(() => createRateLimiter({ limit: 5, windowMs: 0 })).toThrow(RangeError);
    expect(() => createRateLimiter({ limit: 5, windowMs: -10 })).toThrow(RangeError);
  });
  it("працює з реальним годинником за замовчуванням", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60000 });
    expect(limiter.tryAcquire("x").allowed).toBe(true);
    const second = limiter.tryAcquire("x");
    expect(second.allowed).toBe(false);
    expect(second.retryAfterMs > 59000 && second.retryAfterMs <= 60000).toBe(true);
  });
});`,
  },
];
