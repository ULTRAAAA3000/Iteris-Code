import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08: readonly JsTask[] = [
  {
    ...base, id: "js-dates", lesson: "js/74", xp: 25,
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
    ...base, id: "js-format-in-zone", lesson: "js/75", xp: 25,
    title: "Формат дати в потрібному часовому поясі",
    context: "Той самий момент часу на годиннику в Токіо й у Нью-Йорку показує різні числа. Intl.DateTimeFormat з опцією timeZone знає правила кожного поясу, зокрема літній час, тож ручні зсуви не потрібні.",
    brief: [
      "Напишіть <code>formatInZone(date, timeZone)</code>, яка повертає рядок <code>YYYY-MM-DD HH:mm</code> (24-годинний формат, з нулями попереду) для моменту <code>date</code> у заданому поясі IANA (<code>\"UTC\"</code>, <code>\"Asia/Tokyo\"</code>, <code>\"America/New_York\"</code>).",
      "Скористайтеся <code>Intl.DateTimeFormat(\"en-US\", ...)</code> з <code>formatToParts</code>, щоб не залежати від порядку роздільників. Годину беріть із <code>hourCycle: \"h23\"</code>, щоб опівніч була <code>00</code>, а не <code>24</code>. Невідомий пояс має викликати <code>RangeError</code> (це робить сам <code>Intl</code>).",
    ],
    starter: raw`function formatInZone(date, timeZone) {
  return date.toISOString();
}
`,
    tests: raw`describe("formatInZone", () => {
  const moment = new Date("2024-03-15T23:30:00Z");
  it("UTC", () => {
    expect(formatInZone(moment, "UTC")).toBe("2024-03-15 23:30");
  });
  it("Токіо (+9) переносить на наступну добу", () => {
    expect(formatInZone(moment, "Asia/Tokyo")).toBe("2024-03-16 08:30");
  });
  it("Нью-Йорк у літній час (-4)", () => {
    expect(formatInZone(moment, "America/New_York")).toBe("2024-03-15 19:30");
  });
  it("Нью-Йорк узимку (-5)", () => {
    expect(formatInZone(new Date("2024-01-15T12:00:00Z"), "America/New_York")).toBe("2024-01-15 07:00");
  });
  it("опівніч показується як 00, а не 24", () => {
    expect(formatInZone(new Date("2024-01-01T00:05:00Z"), "UTC")).toBe("2024-01-01 00:05");
  });
  it("невідомий пояс: RangeError", () => {
    expect(() => formatInZone(moment, "Mars/Phobos")).toThrow(RangeError);
  });
});`,
  },
  {
    ...base, id: "js-stringify-sorted", lesson: "js/76", xp: 30,
    title: "JSON зі стабільним порядком ключів",
    context: "Для підписів, кешів і порівняння текстів JSON потрібен однаковий порядок ключів, незалежно від того, як об'єкт було створено. Цього домагаються сортуванням ключів у replacer.",
    brief: [
      "Напишіть <code>stringifySorted(value, space)</code>: працює як <code>JSON.stringify(value, null, space)</code>, але ключі всіх об'єктів (на будь-якій глибині, зокрема в елементах масивів) виводяться за алфавітом.",
      "Порядок елементів масивів не змінюється. Дати та інші значення з <code>toJSON</code> перетворюються як зазвичай. Скористайтеся функцією-replacer.",
    ],
    starter: raw`function stringifySorted(value, space) {
  return JSON.stringify(value, null, space);
}
`,
    tests: raw`describe("stringifySorted", () => {
  it("сортує ключі верхнього рівня", () => {
    expect(stringifySorted({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });
  it("сортує вкладені об'єкти, масиви лишає як є", () => {
    expect(stringifySorted({ z: { y: 1, x: 2 }, a: [{ d: 1, c: 2 }, 3, [{ f: 1, e: 2 }]] }))
      .toBe('{"a":[{"c":2,"d":1},3,[{"e":2,"f":1}]],"z":{"x":2,"y":1}}');
  });
  it("порядок елементів масиву зберігається", () => {
    expect(stringifySorted([3, 1, 2])).toBe("[3,1,2]");
  });
  it("відступи", () => {
    expect(stringifySorted({ b: 1, a: [1] }, 2)).toBe(JSON.stringify({ a: [1], b: 1 }, null, 2));
  });
  it("дати й примітиви", () => {
    expect(stringifySorted({ when: new Date(0), n: null, s: "x" })).toBe('{"n":null,"s":"x","when":"1970-01-01T00:00:00.000Z"}');
    expect(stringifySorted(5)).toBe("5");
  });
  it("однаковий текст для різного порядку створення", () => {
    expect(stringifySorted({ a: 1, b: 2 })).toBe(stringifySorted({ b: 2, a: 1 }));
  });
});`,
  },
  {
    ...base, id: "js-seeded-random", lesson: "js/77", xp: 30,
    title: "randomInt і shuffle з керованим генератором",
    context: "Випадковість, яку передають параметром, легко тестувати: підставляєте генератор з відомими числами й отримуєте відтворюваний результат. Тут генератор уже готовий, а вам треба написати функції навколо нього.",
    brief: [
      "Функція <code>createRng(seed)</code> (алгоритм mulberry32) уже написана: кожен виклик повертає наступне число з діапазону від 0 до 1 (1 не входить). Напишіть <code>randomInt(rng, min, max)</code>: ціле від <code>min</code> до <code>max</code> включно.",
      "Напишіть <code>shuffle(items, rng)</code>: повертає <b>новий</b> масив з тими самими елементами в іншому порядку за алгоритмом Фішера-Єйтса (для <code>i</code> від <code>n - 1</code> до <code>1</code> вибрати <code>j = Math.floor(rng() * (i + 1))</code> і поміняти місцями <code>i</code>-й та <code>j</code>-й). Вхідний масив змінювати не можна.",
    ],
    starter: raw`function createRng(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return min;
}

function shuffle(items, rng) {
  return items;
}
`,
    tests: raw`describe("createRng", () => {
  it("однаковий seed дає однакову послідовність", () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("значення в діапазоні [0, 1)", () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const x = rng();
      expect(x >= 0 && x < 1).toBe(true);
    }
  });
});
describe("randomInt", () => {
  it("межі включені", () => {
    expect(randomInt(() => 0, 1, 6)).toBe(1);
    expect(randomInt(() => 0.999999, 1, 6)).toBe(6);
  });
  it("середні значення", () => {
    expect(randomInt(() => 0.5, 1, 6)).toBe(4);
    expect(randomInt(() => 0.5, 10, 10)).toBe(10);
  });
  it("усі значення діапазону зустрічаються", () => {
    const rng = createRng(123);
    const seen = new Set();
    for (let i = 0; i < 300; i++) seen.add(randomInt(rng, 1, 6));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
describe("shuffle", () => {
  it("відомий результат для відомого генератора", () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
    expect(shuffle([1, 2, 3, 4], () => 0.999999)).toEqual([1, 2, 3, 4]);
  });
  it("не змінює вхідний масив і зберігає елементи", () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src, createRng(5));
    expect(src).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(out === src).toBe(false);
  });
  it("відтворюваність і порожній масив", () => {
    expect(shuffle([1, 2, 3, 4, 5, 6], createRng(9))).toEqual(shuffle([1, 2, 3, 4, 5, 6], createRng(9)));
    expect(shuffle([], createRng(1))).toEqual([]);
  });
});`,
  },
  {
    ...base, id: "js-regex-basics", lesson: "js/78", xp: 25,
    title: "Хештеги й перевірка кольору регулярними виразами",
    context: "Витягнути з тексту всі теги та перевірити формат значення — найтиповіші задачі для регулярних виразів. Для кирилиці й цифр у тегах потрібен клас символів з прапорцем u.",
    brief: [
      "Напишіть <code>extractHashtags(text)</code>: повертає масив унікальних хештегів без символу <code>#</code>, у нижньому регістрі, у порядку першої появи. Тег складається з літер будь-якої мови, цифр і підкреслення (<code>\\p{L}</code>, <code>\\p{N}</code>, <code>_</code>).",
      "Напишіть <code>isHexColor(str)</code>: <code>true</code>, якщо рядок цілком є кольором <code>#rgb</code> або <code>#rrggbb</code> (великі й малі літери <code>a–f</code> допустимі), інакше <code>false</code>.",
    ],
    starter: raw`function extractHashtags(text) {
  return [];
}

function isHexColor(str) {
  return false;
}
`,
    tests: raw`describe("extractHashtags", () => {
  it("кирилиця, унікальність, нижній регістр", () => {
    expect(extractHashtags("Привіт #Кіт і #пес, знову #кіт!")).toEqual(["кіт", "пес"]);
  });
  it("цифри й підкреслення", () => {
    expect(extractHashtags("#tag_1 та #2024")).toEqual(["tag_1", "2024"]);
  });
  it("порядок першої появи", () => {
    expect(extractHashtags("#b #a #b #c")).toEqual(["b", "a", "c"]);
  });
  it("тегів немає", () => {
    expect(extractHashtags("Звичайний текст без решітки")).toEqual([]);
    expect(extractHashtags("")).toEqual([]);
  });
});
describe("isHexColor", () => {
  it("коректні кольори", () => {
    expect(isHexColor("#fff")).toBe(true);
    expect(isHexColor("#FFAA00")).toBe(true);
    expect(isHexColor("#1a2B3c")).toBe(true);
  });
  it("некоректні кольори", () => {
    expect(isHexColor("fff")).toBe(false);
    expect(isHexColor("#ffff")).toBe(false);
    expect(isHexColor("#ggg")).toBe(false);
    expect(isHexColor("#12345g")).toBe(false);
    expect(isHexColor("")).toBe(false);
  });
  it("лише весь рядок, без зайвого навколо", () => {
    expect(isHexColor(" #fff")).toBe(false);
    expect(isHexColor("#fff\n#000")).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-regex-advanced", lesson: "js/79", xp: 30,
    title: "Групи, lookahead і replace",
    context: "Іменовані групи переставляють частини дати, lookahead розставляє роздільники розрядів, а зворотні посилання знаходять повтори слів. Це три класичні прийоми, які варто мати під рукою.",
    brief: [
      "Напишіть <code>reorderDates(text)</code>: усі дати виду <code>YYYY-MM-DD</code> (рівно 4-2-2 цифри) у тексті замінює на <code>DD.MM.YYYY</code>, решту тексту не чіпає. Використайте іменовані групи й замінник <code>$&lt;ім'я&gt;</code>.",
      "Напишіть <code>addThousands(n)</code>: приймає невід'ємне ціле (число чи рядок з цифр) і повертає рядок із пробілами між розрядами (<code>1234567</code> стає <code>\"1 234 567\"</code>). Використайте lookahead. Напишіть <code>repeatedWords(text)</code>: масив слів (малими літерами), які в тексті повторюються <b>підряд</b> (<code>\"це це\"</code>). Для меж слова з кирилицею використайте <code>(?&lt;!\\p{L})</code> та <code>(?!\\p{L})</code>.",
    ],
    starter: raw`function reorderDates(text) {
  return text;
}

function addThousands(n) {
  return String(n);
}

function repeatedWords(text) {
  return [];
}
`,
    tests: raw`describe("reorderDates", () => {
  it("змінює порядок частин дати", () => {
    expect(reorderDates("Зустріч 2024-03-15, дедлайн 2024-12-31.")).toBe("Зустріч 15.03.2024, дедлайн 31.12.2024.");
  });
  it("інший текст і неповні дати не чіпає", () => {
    expect(reorderDates("без дат")).toBe("без дат");
    expect(reorderDates("2024-3-5 та 12345-01-01x")).toBe("2024-3-5 та 12345-01-01x");
  });
});
describe("addThousands", () => {
  it("розряди", () => {
    expect(addThousands(1234567)).toBe("1 234 567");
    expect(addThousands("12345")).toBe("12 345");
    expect(addThousands(1000)).toBe("1 000");
  });
  it("малі числа без змін", () => {
    expect(addThousands(999)).toBe("999");
    expect(addThousands(0)).toBe("0");
    expect(addThousands(12)).toBe("12");
  });
  it("великі числа", () => {
    expect(addThousands("12345678")).toBe("12 345 678");
    expect(addThousands("100000")).toBe("100 000");
  });
});
describe("repeatedWords", () => {
  it("знаходить повтори підряд незалежно від регістру", () => {
    expect(repeatedWords("Це це дуже дуже добре і добре")).toEqual(["це", "дуже"]);
  });
  it("повторів немає", () => {
    expect(repeatedWords("кіт пес кіт")).toEqual([]);
    expect(repeatedWords("")).toEqual([]);
  });
  it("слова з тими самими літерами всередині не рахуються", () => {
    expect(repeatedWords("кіт кітка")).toEqual([]);
  });
});`,
  },
  {
    ...base, id: "js-build-url", lesson: "js/80", xp: 30,
    title: "Побудова й розбір адрес із параметрами",
    context: "Адреси з параметрами збирають із частин, і кодування має бути правильним: пробіли, кирилиця й амперсанди ламають ручне склеювання. Клас URL та URLSearchParams роблять це надійно.",
    brief: [
      "Напишіть <code>buildUrl(base, path, params)</code>: повертає рядок адреси. <code>path</code> додається до шляху <code>base</code> (незалежно від того, чи є скісна риска наприкінці бази або на початку шляху). Параметри <code>params</code> (об'єкт) додаються до запиту: значення <code>null</code> і <code>undefined</code> пропускаються, масив дає повторювані ключі, решта перетворюється на рядок.",
      "Напишіть <code>parseQuery(url)</code>: повертає об'єкт із параметрами запиту. Ключ, що зустрічається один раз, має рядкове значення, а повторюваний масив рядків у порядку появи.",
    ],
    starter: raw`function buildUrl(base, path, params = {}) {
  return base + path;
}

function parseQuery(url) {
  return {};
}
`,
    tests: raw`describe("buildUrl", () => {
  it("з'єднує базу й шлях незалежно від скісних рисок", () => {
    expect(buildUrl("https://api.example.com/v1", "users/42")).toBe("https://api.example.com/v1/users/42");
    expect(buildUrl("https://api.example.com/v1/", "users/42")).toBe("https://api.example.com/v1/users/42");
    expect(buildUrl("https://api.example.com/v1/", "/users/42")).toBe("https://api.example.com/v1/users/42");
  });
  it("кодує параметри й підтримує масиви", () => {
    const url = buildUrl("https://x.ua/api", "search", { q: "кіт пес", page: 2, tag: ["a", "b"] });
    expect(url).toBe("https://x.ua/api/search?q=%D0%BA%D1%96%D1%82+%D0%BF%D0%B5%D1%81&page=2&tag=a&tag=b");
  });
  it("null і undefined пропускаються, false і 0 ні", () => {
    const url = buildUrl("https://x.ua", "a", { skip: null, none: undefined, flag: false, zero: 0 });
    expect(url).toBe("https://x.ua/a?flag=false&zero=0");
  });
  it("спецсимволи у значенні кодуються", () => {
    const url = buildUrl("https://x.ua", "s", { q: "a&b#c" });
    expect(url).toBe("https://x.ua/s?q=a%26b%23c");
  });
});
describe("parseQuery", () => {
  it("прості параметри", () => {
    expect(parseQuery("https://x.ua/a?x=1&y=два")).toEqual({ x: "1", y: "два" });
  });
  it("повторювані ключі стають масивом", () => {
    expect(parseQuery("https://x.ua/a?tag=a&tag=b&q=1&tag=c")).toEqual({ tag: ["a", "b", "c"], q: "1" });
  });
  it("кодовані значення й відсутність запиту", () => {
    expect(parseQuery("https://x.ua/s?q=%D0%BA%D1%96%D1%82+%D0%BF%D0%B5%D1%81")).toEqual({ q: "кіт пес" });
    expect(parseQuery("https://x.ua/s")).toEqual({});
  });
});`,
  },
  {
    ...base, id: "js-unicode-kit", lesson: "js/81", xp: 30,
    title: "Графеми, байти й нормалізація",
    context: "Довжина тексту буває різною: у кодових одиницях, у видимих символах чи в байтах. Для лімітів у формі потрібні графеми, для розміру запиту байти, а для порівняння імен нормалізація.",
    brief: [
      "Напишіть <code>countGraphemes(str)</code>: кількість видимих символів (графем) через <code>Intl.Segmenter</code> з <code>granularity: \"grapheme\"</code>. Емодзі-сім'я, літера з окремим акцентом і прапор рахуються як один символ.",
      "Напишіть <code>byteLength(str)</code>: розмір рядка в байтах UTF-8 (через <code>TextEncoder</code>). Напишіть <code>sameText(a, b)</code>: <code>true</code>, якщо рядки збігаються після нормалізації NFC (тобто виглядають однаково).",
    ],
    starter: raw`function countGraphemes(str) {
  return str.length;
}

function byteLength(str) {
  return str.length;
}

function sameText(a, b) {
  return a === b;
}
`,
    tests: raw`describe("countGraphemes", () => {
  it("звичайний текст", () => {
    expect(countGraphemes("привіт")).toBe(6);
    expect(countGraphemes("")).toBe(0);
  });
  it("складні символи рахуються за один", () => {
    expect(countGraphemes("e\u0301")).toBe(1);
    expect(countGraphemes("😀")).toBe(1);
    expect(countGraphemes("👨‍👩‍👧")).toBe(1);
    expect(countGraphemes("🇺🇦")).toBe(1);
  });
  it("змішаний рядок", () => {
    expect(countGraphemes("a😀б")).toBe(3);
  });
});
describe("byteLength", () => {
  it("кирилиця займає по два байти", () => {
    expect(byteLength("Привіт")).toBe(12);
  });
  it("латиниця й емодзі", () => {
    expect(byteLength("abc")).toBe(3);
    expect(byteLength("😀")).toBe(4);
    expect(byteLength("")).toBe(0);
  });
});
describe("sameText", () => {
  it("однаково виглядають, але по-різному записані", () => {
    expect(sameText("\u00e9", "e\u0301")).toBe(true);
  });
  it("різні рядки", () => {
    expect(sameText("a", "b")).toBe(false);
    expect(sameText("é", "e")).toBe(false);
  });
  it("однакові рядки", () => {
    expect(sameText("кіт", "кіт")).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-settings-storage", lesson: "js/82", xp: 30,
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
    ...base, id: "js-pluralize-uk", lesson: "js/83", xp: 25,
    title: "Українські множинні форми й відносні дати",
    context: "«1 день, 2 дні, 5 днів» і «учора, завтра, через 3 дні» складно писати вручну без помилок. Intl.PluralRules та Intl.RelativeTimeFormat містять правила мови, і їх лише треба правильно підключити.",
    brief: [
      "Напишіть <code>pluralize(n, forms)</code>: <code>forms</code> це масив із трьох або чотирьох слів <code>[one, few, many, other]</code>. Категорію визначте через <code>Intl.PluralRules(\"uk\")</code>: <code>one</code> дає <code>forms[0]</code>, <code>few</code> дає <code>forms[1]</code>, <code>many</code> дає <code>forms[2]</code>, <code>other</code> (дробові числа) дає <code>forms[3]</code>, а якщо четвертої форми немає, то <code>forms[1]</code>. Повертайте лише слово без числа.",
      "Напишіть <code>relativeDays(n)</code>: підпис відносного дня для українців через <code>Intl.RelativeTimeFormat(\"uk\", { numeric: \"auto\" })</code> та одиницю <code>\"day\"</code> (<code>-1</code> це «учора», <code>0</code> «сьогодні», <code>3</code> «через 3 дні»).",
    ],
    starter: raw`function pluralize(n, forms) {
  return forms[0];
}

function relativeDays(n) {
  return String(n);
}
`,
    tests: raw`describe("pluralize", () => {
  const days = ["день", "дні", "днів", "дня"];
  it("1 і 21 це one", () => {
    expect(pluralize(1, days)).toBe("день");
    expect(pluralize(21, days)).toBe("день");
    expect(pluralize(101, days)).toBe("день");
  });
  it("2–4 і 22–24 це few", () => {
    expect(pluralize(2, days)).toBe("дні");
    expect(pluralize(4, days)).toBe("дні");
    expect(pluralize(23, days)).toBe("дні");
  });
  it("0, 5–20 і 25 це many", () => {
    expect(pluralize(0, days)).toBe("днів");
    expect(pluralize(5, days)).toBe("днів");
    expect(pluralize(11, days)).toBe("днів");
    expect(pluralize(14, days)).toBe("днів");
    expect(pluralize(25, days)).toBe("днів");
  });
  it("дробові числа та відсутня четверта форма", () => {
    expect(pluralize(1.5, days)).toBe("дня");
    expect(pluralize(1.5, ["день", "дні", "днів"])).toBe("дні");
  });
  it("інші слова", () => {
    const files = ["файл", "файли", "файлів"];
    expect(pluralize(1, files)).toBe("файл");
    expect(pluralize(3, files)).toBe("файли");
    expect(pluralize(12, files)).toBe("файлів");
  });
});
describe("relativeDays", () => {
  const rtf = new Intl.RelativeTimeFormat("uk", { numeric: "auto" });
  it("збігається з Intl для різних днів", () => {
    for (const n of [-5, -1, 0, 1, 3, 10]) {
      expect(relativeDays(n)).toBe(rtf.format(n, "day"));
    }
  });
  it("особливі слова для сьогодні, учора, завтра", () => {
    expect(relativeDays(0)).toBe(rtf.format(0, "day"));
    expect(relativeDays(0) === "0 днів тому").toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-date-math", lesson: "js/84", xp: 25,
    title: "Арифметика дат у форматі YYYY-MM-DD",
    context: "Календарні розрахунки без часових поясів зручно виконувати в UTC над рядками YYYY-MM-DD: додати дні, знайти початок тижня. Приховані за функціями, вони легко заміняться на Temporal.",
    brief: [
      "Напишіть <code>addDays(iso, n)</code>: повертає рядок <code>YYYY-MM-DD</code>, що на <code>n</code> днів пізніший за <code>iso</code> (<code>n</code> може бути від'ємним). Усі розрахунки робіть у UTC, щоб результат не залежав від поясу.",
      "Напишіть <code>startOfWeek(iso)</code>: повертає рядок дати понеділка того тижня, до якого належить <code>iso</code> (тиждень починається з понеділка; для неділі це понеділок за шість днів до неї).",
    ],
    starter: raw`function addDays(iso, n) {
  return iso;
}

function startOfWeek(iso) {
  return iso;
}
`,
    tests: raw`describe("addDays", () => {
  it("через межу місяця", () => {
    expect(addDays("2024-02-28", 2)).toBe("2024-03-01");
    expect(addDays("2024-01-31", 30)).toBe("2024-03-01");
  });
  it("через межу року", () => {
    expect(addDays("2023-12-31", 1)).toBe("2024-01-01");
  });
  it("віднімання й високосний лютий", () => {
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addDays("2023-03-01", -1)).toBe("2023-02-28");
  });
  it("нуль днів", () => {
    expect(addDays("2024-05-17", 0)).toBe("2024-05-17");
  });
  it("великий зсув", () => {
    expect(addDays("2024-01-01", 366)).toBe("2025-01-01");
  });
});
describe("startOfWeek", () => {
  it("п'ятниця", () => {
    expect(startOfWeek("2024-03-15")).toBe("2024-03-11");
  });
  it("понеділок повертає себе", () => {
    expect(startOfWeek("2024-03-11")).toBe("2024-03-11");
  });
  it("неділя належить тижню, що почався за шість днів до неї", () => {
    expect(startOfWeek("2024-03-17")).toBe("2024-03-11");
  });
  it("перетин місяця", () => {
    expect(startOfWeek("2024-03-01")).toBe("2024-02-26");
  });
});`,
  },
  {
    ...base, id: "js-month-days", lesson: "js/85", xp: 25,
    title: "Дні в місяці й перевірка існування дати",
    context: "Дата «30 лютого» не існує, але Date тихо перекладе її на березень. Перевірка після створення й обчислення кількості днів у місяці через нульовий день вирішують проблему без таблиць.",
    brief: [
      "Напишіть <code>isLeapYear(year)</code> і <code>daysInMonth(year, month)</code>, де <code>month</code> від <code>1</code> до <code>12</code>. Для невірного місяця (не ціле число або поза 1–12) <code>daysInMonth</code> кидає <code>RangeError</code>.",
      "Напишіть <code>isRealDate(year, month, day)</code>: <code>true</code>, якщо така дата існує в календарі (<code>2024, 2, 29</code> істинно, <code>2023, 2, 29</code> хибно). Підказка: нульовий день наступного місяця в <code>Date.UTC</code> дає останній день поточного.",
    ],
    starter: raw`function isLeapYear(year) {
  return false;
}

function daysInMonth(year, month) {
  return 30;
}

function isRealDate(year, month, day) {
  return true;
}
`,
    tests: raw`describe("isLeapYear", () => {
  it("правила високосних років", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});
describe("daysInMonth", () => {
  it("звичайні місяці", () => {
    expect(daysInMonth(2023, 1)).toBe(31);
    expect(daysInMonth(2023, 4)).toBe(30);
    expect(daysInMonth(2023, 12)).toBe(31);
  });
  it("лютий у звичайному й високосному році", () => {
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
  });
  it("некоректний місяць: RangeError", () => {
    expect(() => daysInMonth(2024, 0)).toThrow(RangeError);
    expect(() => daysInMonth(2024, 13)).toThrow(RangeError);
    expect(() => daysInMonth(2024, 1.5)).toThrow(RangeError);
  });
});
describe("isRealDate", () => {
  it("існуючі дати", () => {
    expect(isRealDate(2024, 2, 29)).toBe(true);
    expect(isRealDate(2023, 12, 31)).toBe(true);
    expect(isRealDate(2024, 1, 1)).toBe(true);
  });
  it("неіснуючі дати", () => {
    expect(isRealDate(2023, 2, 29)).toBe(false);
    expect(isRealDate(2024, 4, 31)).toBe(false);
    expect(isRealDate(2024, 13, 1)).toBe(false);
    expect(isRealDate(2024, 6, 0)).toBe(false);
  });
});`,
  },
];
