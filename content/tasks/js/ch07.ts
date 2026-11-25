import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07: readonly JsTask[] = [
  {
    ...base, id: "js-schedule-order", lesson: "js/59", xp: 25,
    title: "Порядок: синхронно, мікрозадачі, таймер",
    context: "Щоб передбачувати порядок виконання, треба відчувати цикл подій: синхронний код іде першим, потім мікрозадачі в порядку постановки, а таймер ще пізніше. Тут ви запрограмуєте цей порядок на практиці.",
    brief: [
      "Напишіть <code>schedule(log)</code>, яка в такому порядку викликає: <code>setTimeout</code> (0 мс), що додає в масив <code>log</code> рядок <code>\"timeout\"</code>; <code>Promise.resolve().then</code>, що додає <code>\"promise\"</code>; <code>queueMicrotask</code>, що додає <code>\"micro\"</code>; і нарешті синхронно додає <code>\"sync\"</code>.",
      "Функція повертає проміс, який виконується значенням <code>log</code> після спрацювання таймера. Кінцевий вміст <code>log</code>: <code>[\"sync\", \"promise\", \"micro\", \"timeout\"]</code>. Одразу після виклику (до очікування) у масиві має бути лише <code>\"sync\"</code>.",
    ],
    starter: raw`function schedule(log) {
  log.push("timeout", "promise", "micro", "sync");
  return Promise.resolve(log);
}
`,
    tests: raw`describe("schedule", () => {
  it("кінцевий порядок", async () => {
    const log = [];
    await schedule(log);
    expect(log).toEqual(["sync", "promise", "micro", "timeout"]);
  });
  it("одразу після виклику є лише синхронний запис", () => {
    const log = [];
    schedule(log);
    expect(log).toEqual(["sync"]);
  });
  it("проміс виконується тим самим масивом", async () => {
    const log = [];
    const result = await schedule(log);
    expect(result === log).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-delay-timeout", lesson: "js/60", xp: 35,
    title: "Таймери: delay і timeout",
    context: "setTimeout працює з колбеками, а сучасний код працює з промісами. Обгортка delay перетворює очікування на проміс, а гонка (Promise.race) із таймером дає обмеження часу очікування: без нього повільний сервер зависить увесь інтерфейс.",
    brief: [
      "Напишіть <code>delay(ms, value)</code>: проміс, що виконується зі значенням <code>value</code> через <code>ms</code> мілісекунд (<code>setTimeout</code>).",
      "Напишіть <code>withTimeout(promise, ms)</code>: повертає результат <code>promise</code>, але якщо той не встиг за <code>ms</code>, відхиляється помилкою з повідомленням <code>timeout</code> (<code>Promise.race</code>).",
    ],
    starter: raw`function delay(ms, value) {
  return Promise.resolve(value);
}

function withTimeout(promise, ms) {
  return promise;
}
`,
    tests: raw`describe("delay", () => {
  it("виконується зі значенням", async () => {
    expect(await delay(10, "ok")).toBe("ok");
  });
  it("справді чекає", async () => {
    const t0 = Date.now();
    await delay(50, 1);
    expect(Date.now() - t0 >= 40).toBe(true);
  });
});
describe("withTimeout", () => {
  it("швидкий проміс проходить", async () => {
    expect(await withTimeout(delay(10, "fast"), 200)).toBe("fast");
  });
  it("повільний проміс відхиляється з timeout", async () => {
    await expect(withTimeout(delay(300, "slow"), 20)).rejects.toThrow("timeout");
  });
  it("помилка вихідного проміса пробивається", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 100)).rejects.toThrow("boom");
  });
});`,
  },
  {
    ...base, id: "js-promisify", lesson: "js/61", xp: 30,
    title: "promisify для функцій із колбеком",
    context: "Старі API приймають колбек у стилі error-first. Утиліта promisify перетворює їх на функції, що повертають проміс, і вони стають зручними для async/await.",
    brief: [
      "Напишіть <code>promisify(fn)</code>. Вона приймає функцію, чий <b>останній</b> аргумент це колбек <code>(error, value)</code>, і повертає нову функцію, яка приймає ті самі аргументи без колбека та повертає проміс.",
      "Якщо колбек отримав помилку (перший аргумент не <code>null</code> і не <code>undefined</code>), проміс відхиляється з нею, інакше виконується значенням <code>value</code>. Виняток, кинутий самою <code>fn</code> під час виклику, теж має відхилити проміс.",
    ],
    starter: raw`function promisify(fn) {
  return (...args) => Promise.resolve(args);
}
`,
    tests: raw`describe("promisify", () => {
  it("виконується значенням з колбека", async () => {
    const add = promisify((a, b, cb) => setTimeout(() => cb(null, a + b), 1));
    expect(await add(2, 3)).toBe(5);
  });
  it("відхиляється помилкою з колбека", async () => {
    const fail = promisify((cb) => cb(new Error("збій")));
    await expect(fail()).rejects.toThrow("збій");
  });
  it("синхронний колбек і порожнє значення", async () => {
    const done = promisify((cb) => cb(null));
    expect(await done()).toBe(undefined);
  });
  it("виняток у самій функції відхиляє проміс", async () => {
    const broken = promisify(() => { throw new TypeError("зламано"); });
    await expect(broken()).rejects.toThrow(TypeError);
  });
  it("повертає проміс і передає всі аргументи", async () => {
    const join = promisify((a, b, c, cb) => cb(null, [a, b, c].join("-")));
    const p = join("x", "y", "z");
    expect(p instanceof Promise).toBe(true);
    expect(await p).toBe("x-y-z");
  });
});`,
  },
  {
    ...base, id: "js-delay-promise", lesson: "js/62", xp: 30,
    title: "delay і timeout на промісах",
    context: "Пауза на промісі та тайм-аут для будь-якої асинхронної операції — дві утиліти, які вам знадобляться в кожному проєкті з мережею.",
    brief: [
      "Напишіть <code>delay(ms, value)</code>, що повертає проміс, який виконується значенням <code>value</code> через <code>ms</code> мілісекунд.",
      "Напишіть <code>timeout(promise, ms)</code>: якщо <code>promise</code> виконався за <code>ms</code> мс, повертає його результат; якщо повільніший, відхиляється з <code>Error(\"Тайм-аут\")</code>. Помилка самого <code>promise</code> передається далі без змін. Таймер після завершення треба скасувати.",
    ],
    starter: raw`function delay(ms, value) {
  return Promise.resolve(value);
}

function timeout(promise, ms) {
  return promise;
}
`,
    tests: raw`describe("delay", () => {
  it("виконується значенням після паузи", async () => {
    const start = Date.now();
    const value = await delay(30, "готово");
    expect(value).toBe("готово");
    expect(Date.now() - start >= 25).toBe(true);
  });
  it("без значення виконується undefined", async () => {
    expect(await delay(1)).toBe(undefined);
  });
});
describe("timeout", () => {
  it("швидкий проміс проходить", async () => {
    expect(await timeout(delay(5, "швидко"), 100)).toBe("швидко");
  });
  it("повільний проміс відхиляється", async () => {
    await expect(timeout(delay(80, "повільно"), 10)).rejects.toThrow("Тайм-аут");
  });
  it("помилка проміса не маскується", async () => {
    await expect(timeout(Promise.reject(new TypeError("власна")), 50)).rejects.toThrow(TypeError);
  });
});`,
  },
  {
    ...base, id: "js-run-sequentially", lesson: "js/63", xp: 30,
    title: "Послідовне виконання асинхронних задач",
    context: "Коли кожен крок залежить від попереднього або сервер не терпить паралельних запитів, задачі виконують по черзі й збирають результати. При першій помилці далі нічого не запускають.",
    brief: [
      "Напишіть <code>runSequentially(tasks)</code>: <code>tasks</code> масив функцій, що повертають проміс (або значення). Функція запускає їх <b>по черзі</b>, чекаючи завершення кожної, і повертає проміс із масивом результатів у порядку задач.",
      "Якщо якась задача відхиляється, проміс відхиляється тією ж помилкою, а наступні задачі не запускаються. Порожній масив дає порожній результат.",
    ],
    starter: raw`function runSequentially(tasks) {
  return Promise.all(tasks.map((task) => task()));
}
`,
    tests: raw`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
describe("runSequentially", () => {
  it("виконує по черзі й повертає результати за порядком", async () => {
    const events = [];
    const make = (name, ms) => async () => {
      events.push("старт " + name);
      await wait(ms);
      events.push("кінець " + name);
      return name;
    };
    const result = await runSequentially([make("a", 20), make("b", 5), make("c", 1)]);
    expect(result).toEqual(["a", "b", "c"]);
    expect(events).toEqual(["старт a", "кінець a", "старт b", "кінець b", "старт c", "кінець c"]);
  });
  it("порожній масив", async () => {
    expect(await runSequentially([])).toEqual([]);
  });
  it("зупиняється на першій помилці", async () => {
    const started = [];
    const tasks = [
      async () => { started.push(1); return 1; },
      async () => { started.push(2); throw new Error("збій другої"); },
      async () => { started.push(3); return 3; },
    ];
    await expect(runSequentially(tasks)).rejects.toThrow("збій другої");
    expect(started).toEqual([1, 2]);
  });
  it("приймає й синхронні функції", async () => {
    expect(await runSequentially([() => 1, async () => 2])).toEqual([1, 2]);
  });
});`,
  },
  {
    ...base, id: "js-load-modes", lesson: "js/64", xp: 30,
    title: "Паралельне й послідовне завантаження",
    context: "Незалежні запити треба запускати одночасно, а залежні чи обмежені сервером по черзі. Вибір між паралельним та послідовним режимом прямо впливає на час завантаження сторінки.",
    brief: [
      "Напишіть <code>loadAll(ids, load)</code>: викликає <code>load(id)</code> (повертає проміс) для всіх <code>ids</code> <b>одночасно</b> й повертає масив результатів у порядку <code>ids</code>.",
      "Напишіть <code>loadOneByOne(ids, load)</code>: викликає <code>load</code> строго по черзі (наступний виклик лише після завершення попереднього) і повертає масив результатів у порядку <code>ids</code>.",
    ],
    starter: raw`async function loadAll(ids, load) {
  const results = [];
  for (const id of ids) results.push(await load(id));
  return results;
}

async function loadOneByOne(ids, load) {
  return Promise.all(ids.map((id) => load(id)));
}
`,
    tests: raw`function makeLoader() {
  const stats = { active: 0, max: 0 };
  const load = async (id) => {
    stats.active++;
    stats.max = Math.max(stats.max, stats.active);
    await new Promise((resolve) => setTimeout(resolve, 10 + (id % 3)));
    stats.active--;
    return "дані " + id;
  };
  return { stats, load };
}
describe("loadAll", () => {
  it("запускає всі завантаження одночасно", async () => {
    const { stats, load } = makeLoader();
    await loadAll([1, 2, 3, 4], load);
    expect(stats.max).toBe(4);
  });
  it("зберігає порядок результатів", async () => {
    const { load } = makeLoader();
    expect(await loadAll([3, 1, 2], load)).toEqual(["дані 3", "дані 1", "дані 2"]);
  });
  it("порожній список", async () => {
    expect(await loadAll([], async (x) => x)).toEqual([]);
  });
});
describe("loadOneByOne", () => {
  it("ніколи не має двох активних завантажень", async () => {
    const { stats, load } = makeLoader();
    await loadOneByOne([1, 2, 3, 4], load);
    expect(stats.max).toBe(1);
  });
  it("зберігає порядок результатів", async () => {
    const { load } = makeLoader();
    expect(await loadOneByOne([3, 1, 2], load)).toEqual(["дані 3", "дані 1", "дані 2"]);
  });
});`,
  },
  {
    ...base, id: "js-settle-summary", lesson: "js/65", xp: 30,
    title: "Підсумок allSettled і запасне значення",
    context: "Для масової обробки потрібен звіт, у якому видно, що вдалося, а що ні, а для повільних джерел зручне запасне значення, якщо відповідь не встигла прийти за відведений час.",
    brief: [
      "Напишіть <code>summarize(promises)</code>: чекає всі проміси й повертає <code>{ fulfilled, rejected }</code>, де <code>fulfilled</code> масив значень успішних, а <code>rejected</code> масив причин невдалих, обидва у порядку вхідних промісів. Функція сама ніколи не відхиляється.",
      "Напишіть <code>withFallback(promise, ms, fallback)</code>: якщо <code>promise</code> виконується за <code>ms</code> мс, повертає його значення, інакше виконується значенням <code>fallback</code>. Якщо <code>promise</code> відхилився до завершення часу, відхилення передається далі.",
    ],
    starter: raw`async function summarize(promises) {
  return { fulfilled: await Promise.all(promises), rejected: [] };
}

function withFallback(promise, ms, fallback) {
  return promise;
}
`,
    tests: raw`const delay = (ms, value, fail) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));
describe("summarize", () => {
  it("розділяє успіхи й помилки за порядком", async () => {
    const out = await summarize([delay(10, "a"), delay(5, "e1", true), delay(1, "b"), delay(3, "e2", true)]);
    expect(out.fulfilled).toEqual(["a", "b"]);
    expect(out.rejected.map((e) => e.message)).toEqual(["e1", "e2"]);
  });
  it("приймає й прості значення", async () => {
    const out = await summarize([1, Promise.resolve(2)]);
    expect(out).toEqual({ fulfilled: [1, 2], rejected: [] });
  });
  it("порожній вхід", async () => {
    expect(await summarize([])).toEqual({ fulfilled: [], rejected: [] });
  });
});
describe("withFallback", () => {
  it("швидкий проміс повертає своє значення", async () => {
    expect(await withFallback(delay(5, "справжнє"), 50, "запасне")).toBe("справжнє");
  });
  it("повільний проміс замінюється запасним значенням", async () => {
    expect(await withFallback(delay(80, "справжнє"), 10, "запасне")).toBe("запасне");
  });
  it("швидке відхилення передається далі", async () => {
    await expect(withFallback(delay(1, "збій", true), 50, "запасне")).rejects.toThrow("збій");
  });
});`,
  },
  {
    ...base, id: "js-abortable-delay", lesson: "js/66", xp: 30,
    title: "Скасовувана затримка",
    context: "Затримка, яку можна перервати сигналом, потрібна всюди, де операції скасовують: пошук при зміні запиту, перехід на іншу сторінку, закриття діалогу. Головне при скасуванні зупинити таймер.",
    brief: [
      "Напишіть <code>delay(ms, signal)</code>. Без сигналу це звичайна пауза: проміс виконується через <code>ms</code> мс. Другий аргумент необов'язковий.",
      "Якщо сигнал уже подано, проміс відхиляється одразу з <code>signal.reason</code> (таймер не запускається). Якщо сигнал подано під час очікування, таймер зупиняється, і проміс відхиляється з <code>signal.reason</code>. Після нормального завершення слухач сигналу треба зняти.",
    ],
    starter: raw`function delay(ms, signal) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
`,
    tests: raw`describe("delay", () => {
  it("працює без сигналу", async () => {
    const start = Date.now();
    await delay(25);
    expect(Date.now() - start >= 20).toBe(true);
  });
  it("нормально завершується зі сигналом, який не подано", async () => {
    const controller = new AbortController();
    await delay(5, controller.signal);
    expect(controller.signal.aborted).toBe(false);
  });
  it("відхиляється при скасуванні під час очікування", async () => {
    const controller = new AbortController();
    const start = Date.now();
    const promise = delay(500, controller.signal);
    setTimeout(() => controller.abort(), 10);
    let caught;
    try {
      await promise;
    } catch (error) {
      caught = error;
    }
    expect(caught.name).toBe("AbortError");
    expect(Date.now() - start < 300).toBe(true);
  });
  it("власна причина скасування", async () => {
    const controller = new AbortController();
    const promise = delay(500, controller.signal);
    controller.abort(new Error("користувач скасував"));
    await expect(promise).rejects.toThrow("користувач скасував");
  });
  it("вже подано до початку", async () => {
    const signal = AbortSignal.abort(new RangeError("рано"));
    await expect(delay(5, signal)).rejects.toThrow(RangeError);
  });
});`,
  },
  {
    ...base, id: "js-async-paginate", lesson: "js/67", xp: 35,
    title: "Асинхронний генератор для пагінації",
    context: "API віддає дані сторінками, а споживачеві зручно бачити плаский потік елементів. Асинхронний генератор ховає пагінацію й запитує наступну сторінку лише тоді, коли попередні елементи вже використано.",
    brief: [
      "Напишіть асинхронний генератор <code>paginate(fetchPage)</code>. Функція <code>fetchPage(n)</code> (номер сторінки починається з <code>0</code>) повертає проміс <code>{ items, hasMore }</code>. Генератор по черзі віддає всі елементи всіх сторінок і зупиняється, коли <code>hasMore</code> дорівнює <code>false</code>.",
      "Сторінки запитуються <b>лише за потреби</b>: якщо споживач зупинився після першого елемента, друга сторінка не має завантажуватись. Напишіть також <code>collect(asyncIterable)</code>, що збирає всі елементи потоку в масив.",
    ],
    starter: raw`async function* paginate(fetchPage) {
  // віддавайте елементи сторінок
}

async function collect(asyncIterable) {
  return [];
}
`,
    tests: raw`const makeApi = (pages) => {
  const requested = [];
  const fetchPage = async (n) => {
    requested.push(n);
    await new Promise((resolve) => setTimeout(resolve, 2));
    return pages[n];
  };
  return { requested, fetchPage };
};
describe("paginate і collect", () => {
  it("віддає елементи всіх сторінок по порядку", async () => {
    const { fetchPage } = makeApi([
      { items: [1, 2], hasMore: true },
      { items: [3], hasMore: true },
      { items: [4, 5], hasMore: false },
    ]);
    expect(await collect(paginate(fetchPage))).toEqual([1, 2, 3, 4, 5]);
  });
  it("одна сторінка", async () => {
    const { requested, fetchPage } = makeApi([{ items: ["a"], hasMore: false }]);
    expect(await collect(paginate(fetchPage))).toEqual(["a"]);
    expect(requested).toEqual([0]);
  });
  it("порожні сторінки не заважають", async () => {
    const { fetchPage } = makeApi([
      { items: [], hasMore: true },
      { items: [7], hasMore: false },
    ]);
    expect(await collect(paginate(fetchPage))).toEqual([7]);
  });
  it("лінивість: зупинка споживача не вантажить решту сторінок", async () => {
    const { requested, fetchPage } = makeApi([
      { items: [1, 2], hasMore: true },
      { items: [3, 4], hasMore: false },
    ]);
    for await (const item of paginate(fetchPage)) {
      if (item === 1) break;
    }
    expect(requested).toEqual([0]);
  });
  it("collect працює з будь-яким асинхронним потоком", async () => {
    async function* gen() { yield "x"; yield "y"; }
    expect(await collect(gen())).toEqual(["x", "y"]);
  });
});`,
  },
  {
    ...base, id: "js-limit-pool", lesson: "js/68", xp: 35,
    title: "Пул задач з обмеженням паралелізму",
    context: "Сотні запитів одночасно перевантажують сервер і мережу. Пул дозволяє виконувати їх із фіксованою кількістю «працівників», не втрачаючи порядку результатів.",
    brief: [
      "Напишіть <code>runWithLimit(tasks, limit)</code>: <code>tasks</code> масив функцій, що повертають проміс. Функція виконує їх так, щоб одночасно працювало не більше <code>limit</code> задач, і повертає масив результатів у порядку <code>tasks</code>.",
      "Щойно якась задача завершилась, має стартувати наступна. Якщо <code>limit</code> не ціле число від <code>1</code>, проміс відхиляється з <code>RangeError</code>. Помилка будь-якої задачі відхиляє результат. Порожній масив дає порожній результат.",
    ],
    starter: raw`async function runWithLimit(tasks, limit) {
  return Promise.all(tasks.map((task) => task()));
}
`,
    tests: raw`function makeTasks(count) {
  const stats = { active: 0, max: 0 };
  const tasks = Array.from({ length: count }, (_, i) => async () => {
    stats.active++;
    stats.max = Math.max(stats.max, stats.active);
    await new Promise((resolve) => setTimeout(resolve, 5 + ((count - i) % 4)));
    stats.active--;
    return i * 10;
  });
  return { stats, tasks };
}
describe("runWithLimit", () => {
  it("не перевищує ліміт і використовує його повністю", async () => {
    const { stats, tasks } = makeTasks(10);
    await runWithLimit(tasks, 3);
    expect(stats.max).toBe(3);
  });
  it("результати йдуть у порядку задач", async () => {
    const { tasks } = makeTasks(7);
    expect(await runWithLimit(tasks, 2)).toEqual([0, 10, 20, 30, 40, 50, 60]);
  });
  it("ліміт більший за кількість задач", async () => {
    const { stats, tasks } = makeTasks(2);
    expect(await runWithLimit(tasks, 10)).toEqual([0, 10]);
    expect(stats.max).toBe(2);
  });
  it("порожній масив", async () => {
    expect(await runWithLimit([], 3)).toEqual([]);
  });
  it("некоректний ліміт: RangeError", async () => {
    await expect(runWithLimit([async () => 1], 0)).rejects.toThrow(RangeError);
    await expect(runWithLimit([async () => 1], 1.5)).rejects.toThrow(RangeError);
  });
  it("помилка задачі відхиляє результат", async () => {
    const tasks = [async () => 1, async () => { throw new Error("збій задачі"); }, async () => 3];
    await expect(runWithLimit(tasks, 2)).rejects.toThrow("збій задачі");
  });
});`,
  },
  {
    ...base, id: "js-retry", lesson: "js/69", xp: 40, premium: true,
    title: "Повтор запиту при збої",
    context: "Мережа ненадійна: запит до API іноді падає через тимчасовий збій. У справжніх проєктах невдалі запити повторюють кілька разів, перш ніж показати користувачу помилку.",
    brief: [
      "Напишіть асинхронну функцію <code>retry(fn, attempts)</code>: викликає <code>fn</code> до <code>attempts</code> разів, поки вона не виконається успішно, і повертає її результат.",
      "Якщо всі спроби невдалі, кинути останню помилку. Якщо <code>attempts</code> не ціле число ≥ 1, кинути <code>RangeError</code>.",
    ],
    starter: raw`async function retry(fn, attempts) {
  return fn();
}
`,
    tests: raw`describe("retry", () => {
  it("повертає результат з першої спроби", async () => {
    let calls = 0;
    const result = await retry(async () => { calls++; return "ok"; }, 3);
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });
  it("повторює після збоїв", async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      if (calls < 3) throw new Error("збій " + calls);
      return "ok";
    }, 5);
    expect(result).toBe("ok");
    expect(calls).toBe(3);
  });
  it("кидає останню помилку, коли спроби скінчилися", async () => {
    let calls = 0;
    await expect(retry(async () => { calls++; throw new Error("збій " + calls); }, 3)).rejects.toThrow("збій 3");
    expect(calls).toBe(3);
  });
  it("некоректна кількість спроб", async () => {
    await expect(retry(async () => 1, 0)).rejects.toThrow(RangeError);
    await expect(retry(async () => 1, 1.5)).rejects.toThrow(RangeError);
  });
});`,
  },
  {
    ...base, id: "js-debounce-throttle", lesson: "js/70", xp: 35,
    title: "Власні debounce і throttle",
    context: "Пошук під час набору та обробка прокручування потребують обмеження частоти викликів. Обидві утиліти зводяться до замикання з таймером або міткою часу.",
    brief: [
      "Напишіть <code>debounce(fn, ms)</code>: повертає функцію, що викликає <code>fn</code> з аргументами <b>останнього</b> виклику лише тоді, коли від нього минуло <code>ms</code> мс без нових викликів. У результата є метод <code>cancel()</code>, що скасовує відкладений виклик.",
      "Напишіть <code>throttle(fn, ms)</code>: повертає функцію, яка викликає <code>fn</code> одразу при першому виклику, а наступні виклики протягом <code>ms</code> мс ігнорує; після спливу інтервалу наступний виклик знову проходить.",
    ],
    starter: raw`function debounce(fn, ms) {
  return fn;
}

function throttle(fn, ms) {
  return fn;
}
`,
    tests: raw`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
describe("debounce", () => {
  it("серія викликів дає один виклик з останніми аргументами", async () => {
    const calls = [];
    const d = debounce((x) => calls.push(x), 30);
    d("а");
    d("ав");
    d("авт");
    expect(calls).toEqual([]);
    await wait(70);
    expect(calls).toEqual(["авт"]);
  });
  it("виклики з паузами рахуються окремо", async () => {
    const calls = [];
    const d = debounce((x) => calls.push(x), 20);
    d(1);
    await wait(50);
    d(2);
    await wait(50);
    expect(calls).toEqual([1, 2]);
  });
  it("cancel скасовує відкладений виклик", async () => {
    const calls = [];
    const d = debounce((x) => calls.push(x), 20);
    d("чернетка");
    d.cancel();
    await wait(50);
    expect(calls).toEqual([]);
  });
});
describe("throttle", () => {
  it("перший виклик одразу, наступні в межах інтервалу ігноруються", async () => {
    const calls = [];
    const t = throttle((x) => calls.push(x), 40);
    t(1);
    t(2);
    t(3);
    expect(calls).toEqual([1]);
  });
  it("після інтервалу виклик знову проходить", async () => {
    const calls = [];
    const t = throttle((x) => calls.push(x), 30);
    t("a");
    await wait(50);
    t("b");
    t("c");
    expect(calls).toEqual(["a", "b"]);
  });
});`,
  },
  {
    ...base, id: "js-predict-order", lesson: "js/71", xp: 25,
    title: "Передбачте порядок виконання",
    context: "Найкращий тест розуміння циклу подій — передбачити вивід коду, а потім порівняти з реальним. Тут тести самі запустять сценарії й звірять вашу відповідь з тим, що робить рушій.",
    brief: [
      "Сценарій 1: <code>log(\"A\"); setTimeout(() =&gt; log(\"B\"), 0); Promise.resolve().then(() =&gt; log(\"C\")); (async () =&gt; { log(\"D\"); await null; log(\"E\"); })(); log(\"F\");</code>. Функція <code>predictBasic()</code> повертає масив міток у порядку їх виведення.",
      "Сценарій 2: <code>async function first() { log(\"first:1\"); await second(); log(\"first:2\"); } async function second() { log(\"second\"); } log(\"1\"); first(); log(\"2\");</code>. Функція <code>predictNested()</code> повертає масив міток у порядку виведення (чекайте завершення всіх мікрозадач).",
    ],
    starter: raw`function predictBasic() {
  return [];
}

function predictNested() {
  return [];
}
`,
    tests: raw`describe("порядок виконання", () => {
  it("сценарій 1 збігається з реальним запуском", async () => {
    const actual = await new Promise((resolve) => {
      const out = [];
      const log = (x) => out.push(x);
      log("A");
      setTimeout(() => { log("B"); resolve(out); }, 0);
      Promise.resolve().then(() => log("C"));
      (async () => { log("D"); await null; log("E"); })();
      log("F");
    });
    expect(predictBasic()).toEqual(actual);
  });
  it("сценарій 2 збігається з реальним запуском", async () => {
    const out = [];
    const log = (x) => out.push(x);
    async function second() { log("second"); }
    async function first() { log("first:1"); await second(); log("first:2"); }
    log("1");
    first();
    log("2");
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(predictNested()).toEqual(out);
  });
  it("обидві відповіді мають однакову довжину з очікуваною", () => {
    expect(predictBasic().length).toBe(6);
    expect(predictNested().length).toBe(5);
  });
});`,
  },
  {
    ...base, id: "js-rpc-router", lesson: "js/72", xp: 30,
    title: "Протокол повідомлень для воркера",
    context: "Обмін повідомленнями з воркером зручно оформити як маленький RPC: запит із методом і параметрами, відповідь із результатом або помилкою та спільним id. Такий шар можна перевірити без жодного потоку.",
    brief: [
      "Напишіть <code>createRpc(handlers)</code>, що повертає асинхронну функцію <code>handle(message)</code>. Повідомлення має вигляд <code>{ id, method, params }</code> (<code>params</code> масив, за замовчуванням порожній).",
      "Для відомого методу <code>handle</code> викликає <code>handlers[method](...params)</code> (обробник може бути асинхронним) і повертає <code>{ id, result }</code>. Якщо метод невідомий, повертає <code>{ id, error: \"Невідомий метод: назва\" }</code>. Якщо обробник кинув помилку чи відхилився, повертає <code>{ id, error: повідомлення_помилки }</code>. <code>handle</code> сама ніколи не відхиляється.",
    ],
    starter: raw`function createRpc(handlers) {
  return async (message) => ({ id: message.id, result: undefined });
}
`,
    tests: raw`describe("createRpc", () => {
  const handlers = {
    sum: (...nums) => nums.reduce((a, b) => a + b, 0),
    greet: async (name) => "Привіт, " + name,
    fail: () => { throw new Error("зламано"); },
    reject: async () => { throw new TypeError("відхилено"); },
    constant: () => 42,
  };
  const handle = createRpc(handlers);
  it("синхронний обробник", async () => {
    expect(await handle({ id: 1, method: "sum", params: [1, 2, 3] })).toEqual({ id: 1, result: 6 });
  });
  it("асинхронний обробник", async () => {
    expect(await handle({ id: 2, method: "greet", params: ["Оля"] })).toEqual({ id: 2, result: "Привіт, Оля" });
  });
  it("params за замовчуванням порожній", async () => {
    expect(await handle({ id: 3, method: "constant" })).toEqual({ id: 3, result: 42 });
  });
  it("невідомий метод", async () => {
    expect(await handle({ id: 4, method: "nothing", params: [] })).toEqual({ id: 4, error: "Невідомий метод: nothing" });
  });
  it("помилки обробників перетворюються на відповідь", async () => {
    expect(await handle({ id: 5, method: "fail" })).toEqual({ id: 5, error: "зламано" });
    expect(await handle({ id: 6, method: "reject" })).toEqual({ id: 6, error: "відхилено" });
  });
  it("методи з прототипу не вважаються обробниками", async () => {
    const out = await handle({ id: 7, method: "toString" });
    expect(out.error).toBe("Невідомий метод: toString");
  });
});`,
  },
  {
    ...base, id: "js-atomic-counter", lesson: "js/73", xp: 30,
    title: "Атомарні лічильники на Atomics",
    context: "Лічильники й прапорці, спільні для кількох потоків, потребують атомарних операцій. Обгортка над Atomics ховає подробиці типізованого масиву й дає зрозумілий інтерфейс.",
    brief: [
      "Напишіть <code>createCounters(size)</code>, що створює <code>size</code> лічильників (на <code>Int32Array</code> над <code>ArrayBuffer</code>) і повертає об'єкт з методами <code>add(i, n)</code>, <code>get(i)</code> та <code>compareAndSet(i, expected, value)</code>.",
      "<code>add</code> збільшує лічильник <code>i</code> на <code>n</code> й повертає <b>нове</b> значення. <code>get</code> повертає поточне. <code>compareAndSet</code> записує <code>value</code>, лише якщо поточне значення дорівнює <code>expected</code>, і повертає <code>true</code> у разі успіху, інакше <code>false</code>. Використайте методи <code>Atomics</code>. Індекс поза межами має викликати <code>RangeError</code>.",
    ],
    starter: raw`function createCounters(size) {
  const data = new Int32Array(size);
  return {
    add(i, n) {
      data[i] += n;
    },
    get(i) {
      return data[i];
    },
    compareAndSet(i, expected, value) {
      return false;
    },
  };
}
`,
    tests: raw`describe("createCounters", () => {
  it("add повертає нове значення", () => {
    const c = createCounters(3);
    expect(c.add(0, 5)).toBe(5);
    expect(c.add(0, 2)).toBe(7);
    expect(c.add(0, -10)).toBe(-3);
  });
  it("get читає поточне значення, лічильники незалежні", () => {
    const c = createCounters(3);
    c.add(1, 4);
    expect(c.get(0)).toBe(0);
    expect(c.get(1)).toBe(4);
  });
  it("compareAndSet успішний при збігу", () => {
    const c = createCounters(1);
    c.add(0, 10);
    expect(c.compareAndSet(0, 10, 99)).toBe(true);
    expect(c.get(0)).toBe(99);
  });
  it("compareAndSet відмовляє, якщо значення інше", () => {
    const c = createCounters(1);
    c.add(0, 10);
    expect(c.compareAndSet(0, 5, 99)).toBe(false);
    expect(c.get(0)).toBe(10);
  });
  it("індекс поза межами: RangeError", () => {
    const c = createCounters(2);
    expect(() => c.add(5, 1)).toThrow(RangeError);
    expect(() => c.get(2)).toThrow(RangeError);
  });
});`,
  },
];
