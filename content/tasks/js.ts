// Практичні завдання курсу JavaScript (разом з js-safe-city та іншими в index.ts): код виконується в браузері, у Web Worker,
// а перевірка це тести в стилі Vitest. Еталони: tests/solutions/js.mjs. Завдання про DOM і події потребують
// режиму з попереднім переглядом сторінки і додаються окремо. У тестах немає зворотних апострофів: це текст у String.raw.
import type { JsTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "js", premium: false } as const;

export const JS_TASKS: readonly JsTask[] = [
  {
    ...base, id: "js-hello-default", lesson: "js/1", xp: 15,
    title: "Привітання зі значенням за замовчуванням",
    context: "Перша функція, яку пише кожен: приймає ім'я й повертає привітання. Значення за замовчуванням рятує, коли ім'я не передали: замість «Привіт, undefined!» буде нормальний текст.",
    brief: [
      "Напишіть функцію <code>hello(name)</code>, що повертає рядок <code>Привіт, &lt;name&gt;!</code>.",
      "Якщо ім'я не передали, використайте <code>світе</code>: <code>hello()</code> дає <code>Привіт, світе!</code>. Підказка: параметр за замовчуванням <code>name = \"світе\"</code>.",
    ],
    starter: raw`function hello(name) {
  return "Привіт!";
}
`,
    tests: raw`describe("hello", () => {
  it("вітає за іменем", () => {
    expect(hello("Оля")).toBe("Привіт, Оля!");
  });
  it("без імені: світе", () => {
    expect(hello()).toBe("Привіт, світе!");
  });
  it("порожній рядок це теж ім'я", () => {
    expect(hello("")).toBe("Привіт, !");
  });
  it("інше ім'я", () => {
    expect(hello("Іван")).toBe("Привіт, Іван!");
  });
});`,
  },
  {
    ...base, id: "js-type-of", lesson: "js/2", xp: 15,
    title: "Точний тип значення",
    context: "typeof у JavaScript має відомі дивацтва: для null дає \"object\", а для масиву теж \"object\". У реальних перевірках даних із форм і API потрібен точніший визначник.",
    brief: [
      "Напишіть <code>typeOf(value)</code>: поверніть <code>\"null\"</code> для <code>null</code>, <code>\"array\"</code> для масиву, а для всього іншого результат <code>typeof</code>.",
    ],
    starter: raw`function typeOf(value) {
  return typeof value;
}
`,
    tests: raw`describe("typeOf", () => {
  it("прості типи", () => {
    expect(typeOf(5)).toBe("number");
    expect(typeOf("a")).toBe("string");
    expect(typeOf(true)).toBe("boolean");
    expect(typeOf(undefined)).toBe("undefined");
  });
  it("null це null, а не object", () => {
    expect(typeOf(null)).toBe("null");
  });
  it("масив це array", () => {
    expect(typeOf([1, 2])).toBe("array");
    expect(typeOf([])).toBe("array");
  });
  it("об'єкт і функція", () => {
    expect(typeOf({})).toBe("object");
    expect(typeOf(function () {})).toBe("function");
  });
});`,
  },
  {
    ...base, id: "js-fizzbuzz", lesson: "js/4", xp: 20,
    title: "FizzBuzz: масив результатів",
    context: "Цикл із умовою всередині: перебрати числа й для кожного вирішити, що з ним робити. Так обробляють рядки таблиці, елементи кошика, записи з бази.",
    brief: [
      "Напишіть <code>fizzBuzz(n)</code>: масив із <code>n</code> елементів для чисел від 1 до <code>n</code>. Для кратних 3 це <code>\"Fizz\"</code>, для кратних 5 <code>\"Buzz\"</code>, для кратних обом <code>\"FizzBuzz\"</code>, в інших випадках саме число (як число, не рядок).",
    ],
    starter: raw`function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    result.push(i);
  }
  return result;
}
`,
    tests: raw`describe("fizzBuzz", () => {
  it("перші п'ять", () => {
    expect(fizzBuzz(5)).toEqual([1, 2, "Fizz", 4, "Buzz"]);
  });
  it("до п'ятнадцяти", () => {
    expect(fizzBuzz(15)).toEqual([1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]);
  });
  it("нуль дає порожній масив", () => {
    expect(fizzBuzz(0)).toEqual([]);
  });
  it("числа лишаються числами, а не рядками", () => {
    expect(typeof fizzBuzz(2)[0]).toBe("number");
  });
});`,
  },
  {
    ...base, id: "js-function-tools", lesson: "js/5", xp: 20,
    title: "Функції, що повертають функції",
    context: "Функції в JavaScript це значення: їх передають, повертають, зберігають. Так роблять фабрики (makeAdder) і обгортки (applyTwice), на яких тримаються колбеки, обробники подій і middleware.",
    brief: [
      "Напишіть <code>makeAdder(n)</code>: повертає функцію, яка додає <code>n</code> до свого аргументу.",
      "Напишіть <code>applyTwice(fn, x)</code>: застосовує функцію <code>fn</code> до <code>x</code> двічі: <code>fn(fn(x))</code>.",
    ],
    starter: raw`function makeAdder(n) {
  return function (x) {
    return x;
  };
}

function applyTwice(fn, x) {
  return x;
}
`,
    tests: raw`describe("makeAdder", () => {
  it("повертає функцію", () => {
    const add5 = makeAdder(5);
    expect(typeof add5).toBe("function");
    expect(add5(10)).toBe(15);
  });
  it("окремі лічильники не плутаються", () => {
    expect(makeAdder(1)(1)).toBe(2);
    expect(makeAdder(100)(1)).toBe(101);
  });
  it("від'ємні числа", () => {
    expect(makeAdder(-3)(10)).toBe(7);
  });
});
describe("applyTwice", () => {
  it("застосовує двічі", () => {
    expect(applyTwice((x) => x * 2, 3)).toBe(12);
    expect(applyTwice(makeAdder(3), 1)).toBe(7);
  });
});`,
  },
  {
    ...base, id: "js-format-price", lesson: "js/6", xp: 25,
    title: "Форматування ціни: рядки та числа",
    context: "Ціну потрібно показати людині в звичному вигляді: з пропусками між тисячами, комою й двома знаками. Це типова задача, де плутаються toFixed, округлення та заміна символів.",
    brief: [
      "Напишіть <code>formatPrice(n)</code>: рядок виду <code>1 234,50 грн</code>: два знаки після коми (<code>toFixed(2)</code>), кома замість крапки, звичайний пропуск між тисячами, слово <code>грн</code> через пропуск.",
      "Підказка: розділіть ціле й дробове, а тисячі розбийте регулярним виразом <code>/\\B(?=(\\d{3})+(?!\\d))/g</code>.",
    ],
    starter: raw`function formatPrice(n) {
  return n.toFixed(2) + " грн";
}
`,
    tests: raw`describe("formatPrice", () => {
  it("тисячі й копійки", () => {
    expect(formatPrice(1234.5)).toBe("1 234,50 грн");
  });
  it("мільйони", () => {
    expect(formatPrice(1234567.891)).toBe("1 234 567,89 грн");
  });
  it("менше тисячі", () => {
    expect(formatPrice(999)).toBe("999,00 грн");
    expect(formatPrice(0)).toBe("0,00 грн");
  });
  it("округлення до тисячі", () => {
    expect(formatPrice(999.999)).toBe("1 000,00 грн");
  });
});`,
  },
  {
    ...base, id: "js-chunk-unique", lesson: "js/7", xp: 25,
    title: "Масиви: розбиття на частини й унікальні значення",
    context: "Розбити список на сторінки по N елементів і прибрати дублікати: дві найчастіші операції з масивами в інтерфейсах (пагінація, теги, фільтри).",
    brief: [
      "Напишіть <code>chunk(arr, size)</code>: масив масивів завдовжки <code>size</code> (останній може бути коротшим). Вхідний масив змінювати не можна.",
      "Напишіть <code>unique(arr)</code>: новий масив без повторів, порядок першої появи зберігається.",
    ],
    starter: raw`function chunk(arr, size) {
  return [arr];
}

function unique(arr) {
  return arr;
}
`,
    tests: raw`describe("chunk", () => {
  it("ділить на частини", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("розмір більший за масив", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });
  it("порожній масив", () => {
    expect(chunk([], 3)).toEqual([]);
  });
  it("не змінює вхідний масив", () => {
    const src = [1, 2, 3];
    chunk(src, 2);
    expect(src).toEqual([1, 2, 3]);
  });
});
describe("unique", () => {
  it("прибирає повтори, порядок зберігається", () => {
    expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  });
  it("рядки й порожній масив", () => {
    expect(unique(["a", "b", "a"])).toEqual(["a", "b"]);
    expect(unique([])).toEqual([]);
  });
});`,
  },
  {
    ...base, id: "js-word-map", lesson: "js/10", xp: 25,
    title: "Map: частота слів",
    context: "Map зберігає пари «ключ: значення» з будь-якими ключами і пам'ятає порядок вставки. Підрахунок частоти (слова, голоси, події) це її основне застосування.",
    brief: [
      "Напишіть <code>wordFrequency(text)</code>: повертає <code>Map</code>, де ключ це слово (малими літерами), а значення це кількість його появ. Слова розділені пробілами, зайві пробіли ігноруються.",
      "Порядок у <code>Map</code> це порядок першої появи слова в тексті.",
    ],
    starter: raw`function wordFrequency(text) {
  return new Map();
}
`,
    tests: raw`describe("wordFrequency", () => {
  it("рахує слова", () => {
    expect([...wordFrequency("a b a")]).toEqual([["a", 2], ["b", 1]]);
  });
  it("регістр не важливий, зайві пробіли ігноруються", () => {
    expect([...wordFrequency("  Go go  GO  rust ")]).toEqual([["go", 3], ["rust", 1]]);
  });
  it("порожній текст", () => {
    expect(wordFrequency("").size).toBe(0);
  });
  it("повертає саме Map", () => {
    expect(wordFrequency("x") instanceof Map).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-dates", lesson: "js/11", xp: 25,
    title: "Дата й час: різниця днів і вихідні",
    context: "Дати найчастіше ламаються через часові пояси. Тому для розрахунків беруть UTC: різниця днів між двома датами не повинна залежати від того, де запущено код.",
    brief: [
      "Напишіть <code>daysBetween(a, b)</code>: на скільки цілих днів дата <code>b</code> пізніше за <code>a</code> (рядки виду <code>2026-11-16</code>; результат може бути від'ємним).",
      "Напишіть <code>isWeekend(dateStr)</code>: <code>true</code> для суботи й неділі. Рахуйте через UTC (<code>getUTCDay</code>), щоб результат не залежав від часового поясу.",
    ],
    starter: raw`function daysBetween(a, b) {
  return 0;
}

function isWeekend(dateStr) {
  return false;
}
`,
    tests: raw`describe("daysBetween", () => {
  it("різниця в днях", () => {
    expect(daysBetween("2026-11-16", "2026-11-20")).toBe(4);
  });
  it("через межу місяця й року", () => {
    expect(daysBetween("2026-12-30", "2027-01-02")).toBe(3);
  });
  it("та сама дата і від'ємна різниця", () => {
    expect(daysBetween("2026-11-16", "2026-11-16")).toBe(0);
    expect(daysBetween("2026-11-20", "2026-11-16")).toBe(-4);
  });
});
describe("isWeekend", () => {
  it("субота й неділя", () => {
    expect(isWeekend("2026-11-14")).toBe(true);
    expect(isWeekend("2026-11-15")).toBe(true);
  });
  it("будні", () => {
    expect(isWeekend("2026-11-16")).toBe(false);
    expect(isWeekend("2026-11-20")).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-stack-class", lesson: "js/13", xp: 30,
    title: "Клас Stack: this і приватні дані",
    context: "Клас об'єднує дані й методи, які з ними працюють. Стек (останній зайшов, перший вийшов) стоїть за кнопкою «Назад», історією змін, розбором дужок.",
    brief: [
      "Опишіть клас <code>Stack</code> із методами <code>push(x)</code> (додає й повертає новий розмір), <code>pop()</code> (знімає верхній елемент, а для порожнього стека повертає <code>undefined</code>), <code>peek()</code> (дивиться верхній, не знімаючи) і властивістю <code>size</code> (геттер).",
      "Елементи зберігайте в приватному полі <code>#items</code>: ззовні воно недоступне.",
    ],
    starter: raw`class Stack {
  // TODO: приватне поле #items, push, pop, peek і get size
}
`,
    tests: raw`describe("Stack", () => {
  it("push і size", () => {
    const s = new Stack();
    expect(s.size).toBe(0);
    expect(s.push("a")).toBe(1);
    expect(s.push("b")).toBe(2);
    expect(s.size).toBe(2);
  });
  it("pop знімає верхній", () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    expect(s.pop()).toBe(2);
    expect(s.pop()).toBe(1);
    expect(s.pop()).toBeUndefined();
  });
  it("peek не знімає", () => {
    const s = new Stack();
    s.push("x");
    expect(s.peek()).toBe("x");
    expect(s.size).toBe(1);
  });
  it("окремі стеки не ділять дані", () => {
    const a = new Stack();
    const b = new Stack();
    a.push(1);
    expect(b.size).toBe(0);
  });
});`,
  },
  {
    ...base, id: "js-validate-age", lesson: "js/14", xp: 30,
    title: "Власна помилка і безпечний JSON",
    context: "Помилки неминучі: некоректний ввід, зламаний JSON. Правило таке: не падати, а повернути зрозумілий результат або кинути помилку з чітким типом, яку можна відрізнити від інших.",
    brief: [
      "Опишіть клас <code>ValidationError</code> (успадковує <code>Error</code>, <code>name</code> дорівнює <code>\"ValidationError\"</code>) і функцію <code>validateAge(age)</code>: для цілого числа від 0 до 150 повертає його, інакше кидає <code>ValidationError</code> із повідомленням <code>Некоректний вік</code>.",
      "Напишіть <code>parseJson(text)</code>: повертає <code>{ ok: true, value }</code> для коректного JSON і <code>{ ok: false, error: \"Некоректний JSON\" }</code>, якщо розібрати не вдалось. Функція сама не кидає помилок.",
    ],
    starter: raw`// TODO: class ValidationError extends Error

function validateAge(age) {
  return age;
}

function parseJson(text) {
  return { ok: true, value: JSON.parse(text) };
}
`,
    tests: raw`describe("validateAge", () => {
  it("коректний вік повертається", () => {
    expect(validateAge(25)).toBe(25);
    expect(validateAge(0)).toBe(0);
    expect(validateAge(150)).toBe(150);
  });
  it("некоректний вік кидає ValidationError", () => {
    expect(() => validateAge(-1)).toThrow("Некоректний вік");
    expect(() => validateAge(151)).toThrow("Некоректний вік");
    expect(() => validateAge(2.5)).toThrow("Некоректний вік");
    expect(() => validateAge("25")).toThrow("Некоректний вік");
  });
  it("тип помилки відрізняється від звичайної", () => {
    let err;
    try { validateAge(-5); } catch (e) { err = e; }
    expect(err instanceof ValidationError).toBe(true);
    expect(err instanceof Error).toBe(true);
    expect(err.name).toBe("ValidationError");
  });
});
describe("parseJson", () => {
  it("коректний JSON", () => {
    expect(parseJson('{"a": 1}')).toEqual({ ok: true, value: { a: 1 } });
  });
  it("зламаний JSON не кидає помилку", () => {
    expect(parseJson("{oops")).toEqual({ ok: false, error: "Некоректний JSON" });
  });
});`,
  },
  {
    ...base, id: "js-settings-storage", lesson: "js/18", xp: 30,
    title: "Налаштування в JSON: збереження і читання",
    context: "localStorage зберігає лише рядки, тому об'єкти перед записом перетворюють у JSON, а при читанні розбирають назад. Головне: не впасти, якщо запису ще немає або в ньому сміття. У воркері немає справжнього localStorage, тому сховище передається параметром (так код ще й легше тестувати).",
    brief: [
      "Напишіть <code>saveSettings(storage, settings)</code>: записує об'єкт у сховище під ключем <code>\"settings\"</code> як JSON (<code>storage.setItem</code>).",
      "Напишіть <code>loadSettings(storage)</code>: читає й розбирає JSON (<code>storage.getItem</code>), а якщо запису немає або JSON зламаний, повертає <code>{ theme: \"light\", lang: \"uk\" }</code>.",
    ],
    starter: raw`function saveSettings(storage, settings) {
  // TODO
}

function loadSettings(storage) {
  return {};
}
`,
    tests: raw`function fakeStorage(initial) {
  const data = { ...initial };
  return {
    data,
    getItem(k) { return k in data ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
  };
}
describe("settings", () => {
  it("збереження й читання повертає той самий об'єкт", () => {
    const st = fakeStorage();
    saveSettings(st, { theme: "dark", lang: "en" });
    expect(typeof st.data.settings).toBe("string");
    expect(loadSettings(st)).toEqual({ theme: "dark", lang: "en" });
  });
  it("порожнє сховище: значення за замовчуванням", () => {
    expect(loadSettings(fakeStorage())).toEqual({ theme: "light", lang: "uk" });
  });
  it("зламаний JSON не валить програму", () => {
    expect(loadSettings(fakeStorage({ settings: "{oops" }))).toEqual({ theme: "light", lang: "uk" });
  });
  it("повторне збереження перезаписує старе", () => {
    const st = fakeStorage();
    saveSettings(st, { theme: "dark", lang: "uk" });
    saveSettings(st, { theme: "light", lang: "en" });
    expect(loadSettings(st)).toEqual({ theme: "light", lang: "en" });
  });
});`,
  },
  {
    ...base, id: "js-delay-timeout", lesson: "js/19", xp: 35,
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
    ...base, id: "js-api-client", lesson: "js/21", xp: 35,
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
    ...base, id: "js-fix-average", lesson: "js/22", xp: 35,
    title: "Налагодження: знайдіть помилки в average",
    context: "Налагодження це спосіб мислення: відтворити помилку, звузити місце, перевірити гіпотезу. Тут функція дає неправильні результати. Додайте console.log, подивіться на проміжні значення в терміналі та знайдіть причину.",
    brief: [
      "Функція <code>average(nums)</code> має повертати середнє арифметичне чисел, а для порожнього масиву <code>0</code>. Зараз вона дає неправильні числа, а на порожньому масиві повертає <code>NaN</code>.",
      "Знайдіть і виправте помилки (їх дві). Використовуйте <code>console.log</code> і запускайте тести: вивід з'явиться в терміналі.",
    ],
    starter: raw`function average(nums) {
  let sum = 0;
  for (let i = 1; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
}
`,
    tests: raw`describe("average", () => {
  it("рахує середнє", () => {
    expect(average([2, 4, 6])).toBe(4);
    expect(average([10, 20])).toBe(15);
  });
  it("перший елемент враховується", () => {
    expect(average([9, 1])).toBe(5);
  });
  it("порожній масив дає 0, а не NaN", () => {
    expect(average([])).toBe(0);
  });
  it("один елемент", () => {
    expect(average([7])).toBe(7);
  });
});`,
  },
];
