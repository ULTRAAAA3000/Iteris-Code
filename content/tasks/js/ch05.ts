import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05: readonly JsTask[] = [
  {
    ...base, id: "js-range-iterable", lesson: "js/40", xp: 25,
    title: "Власний діапазон як ітерований об'єкт",
    context: "Діапазон чисел зручно віддавати як ітерований об'єкт, а не готовий масив: значення створюються лише під час обходу, а діапазон можна пройти скільки завгодно разів.",
    brief: [
      "Напишіть <code>range(start, end, step = 1)</code>, що повертає <b>ітерований об'єкт</b> (не масив) з числами від <code>start</code> до <code>end</code> (<code>end</code> не входить). Він має працювати з <code>for...of</code> і розгортанням.",
      "Додатний крок іде вгору, від'ємний вниз (<code>range(3, 0, -1)</code> дає <code>3, 2, 1</code>). Крок <code>0</code> кидає <code>RangeError</code>. Діапазон можна проходити багаторазово.",
    ],
    starter: raw`function range(start, end, step = 1) {
  return [];
}
`,
    tests: raw`describe("range", () => {
  it("зростаюча послідовність без кінця", () => {
    expect([...range(1, 4)]).toEqual([1, 2, 3]);
  });
  it("з кроком", () => {
    expect([...range(0, 10, 5)]).toEqual([0, 5]);
    expect([...range(0, 1, 0.25)]).toEqual([0, 0.25, 0.5, 0.75]);
  });
  it("спадна послідовність", () => {
    expect([...range(3, 0, -1)]).toEqual([3, 2, 1]);
  });
  it("порожній діапазон", () => {
    expect([...range(5, 5)]).toEqual([]);
    expect([...range(5, 1)]).toEqual([]);
  });
  it("це ітерований об'єкт, а не масив, і його можна обходити повторно", () => {
    const r = range(1, 3);
    expect(Array.isArray(r)).toBe(false);
    expect(typeof r[Symbol.iterator]).toBe("function");
    expect([...r]).toEqual([1, 2]);
    expect([...r]).toEqual([1, 2]);
  });
  it("нульовий крок: RangeError", () => {
    expect(() => range(0, 5, 0)).toThrow(RangeError);
  });
});`,
  },
  {
    ...base, id: "js-generators-kit", lesson: "js/41", xp: 30,
    title: "Генератори: fibonacci і take",
    context: "Нескінченні послідовності безпечні, поки з них беруть скінченну кількість. Ліниві генератори дозволяють описати весь потік чисел і відрізати від нього лише потрібну частину.",
    brief: [
      "Напишіть генератор <code>fibonacci()</code>, що віддає нескінченну послідовність чисел Фібоначчі: <code>0, 1, 1, 2, 3, 5, …</code>.",
      "Напишіть генератор <code>take(iterable, n)</code>, що віддає перші <code>n</code> значень будь-якого ітерованого об'єкта й зупиняється. Він не повинен просити в джерела більше значень, ніж потрібно. Для <code>n = 0</code> нічого не віддається.",
    ],
    starter: raw`function* fibonacci() {
  // віддавайте числа нескінченно
}

function* take(iterable, n) {
  // віддайте перші n значень
}
`,
    tests: raw`describe("fibonacci", () => {
  it("перші числа", () => {
    expect([...take(fibonacci(), 8)]).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
  });
  it("працює як ітератор", () => {
    const f = fibonacci();
    expect(f.next()).toEqual({ value: 0, done: false });
    expect(f.next()).toEqual({ value: 1, done: false });
  });
});
describe("take", () => {
  it("бере перші n значень масиву", () => {
    expect([...take([10, 20, 30, 40], 2)]).toEqual([10, 20]);
  });
  it("якщо значень менше за n, віддає всі", () => {
    expect([...take([1, 2], 5)]).toEqual([1, 2]);
  });
  it("нуль значень", () => {
    expect([...take([1, 2, 3], 0)]).toEqual([]);
  });
  it("лінивість: не просить зайвого", () => {
    let produced = 0;
    function* source() {
      while (true) {
        produced++;
        yield produced;
      }
    }
    expect([...take(source(), 3)]).toEqual([1, 2, 3]);
    expect(produced).toBe(3);
  });
});`,
  },
  {
    ...base, id: "js-money-primitive", lesson: "js/42", xp: 25,
    title: "Клас Money з перетворенням на примітив",
    context: "Об'єкт, який уміє поводитись і як число в обчисленнях, і як красивий текст у виводі, зручніший за простий контейнер. Для цього є спеціальний символ Symbol.toPrimitive.",
    brief: [
      "Напишіть клас <code>Money</code>, що зберігає суму (число) у полі <code>amount</code>. Реалізуйте <code>[Symbol.toPrimitive](hint)</code>: для підказки <code>\"string\"</code> повертайте текст на кшталт <code>\"12.50 грн\"</code> (два знаки після коми), для інших підказок число.",
      "Також додайте геттер <code>[Symbol.toStringTag]</code>, що повертає <code>\"Money\"</code>, щоб <code>Object.prototype.toString.call(m)</code> давав <code>[object Money]</code>.",
    ],
    starter: raw`class Money {
  constructor(amount) {
    this.amount = amount;
  }
}
`,
    tests: raw`describe("Money", () => {
  it("число в математиці", () => {
    const m = new Money(12.5);
    expect(+m).toBe(12.5);
    expect(m * 2).toBe(25);
    expect(m + 1).toBe(13.5);
  });
  it("порівняння як числа", () => {
    expect(new Money(20) > new Money(5)).toBe(true);
    expect(new Money(1) < 2).toBe(true);
  });
  it("текст із двома знаками і валютою", () => {
    expect(String(new Money(12.5))).toBe("12.50 грн");
    expect(String(new Money(3))).toBe("3.00 грн");
  });
  it("тег типу", () => {
    expect(Object.prototype.toString.call(new Money(1))).toBe("[object Money]");
  });
  it("сума доступна як поле", () => {
    expect(new Money(7).amount).toBe(7);
  });
});`,
  },
  {
    ...base, id: "js-pipe-curry", lesson: "js/43", xp: 30,
    title: "pipe і curry",
    context: "Конвеєри з маленьких функцій та налаштовувані часткові виклики — основа функціонального стилю. Дві утиліти pipe і curry зустрічаються майже в кожній бібліотеці для обробки даних.",
    brief: [
      "Напишіть <code>pipe(...fns)</code>: повертає функцію, що пропускає значення крізь <code>fns</code> зліва направо. Для порожнього списку вона повертає значення без змін.",
      "Напишіть <code>curry(fn)</code>: повертає карровану версію, яка збирає аргументи (по одному чи кількома за раз), доки їх не стане стільки, скільки оголошено в <code>fn.length</code>, і тоді викликає <code>fn</code>.",
    ],
    starter: raw`function pipe(...fns) {
  return (x) => x;
}

function curry(fn) {
  return fn;
}
`,
    tests: raw`describe("pipe", () => {
  it("зліва направо", () => {
    const f = pipe((x) => x + 1, (x) => x * 2, String);
    expect(f(3)).toBe("8");
  });
  it("без функцій повертає вхід", () => {
    expect(pipe()(5)).toBe(5);
  });
  it("одна функція", () => {
    expect(pipe((s) => s.trim())("  a ")).toBe("a");
  });
});
describe("curry", () => {
  const add3 = (a, b, c) => a + b + c;
  it("по одному аргументу", () => {
    expect(curry(add3)(1)(2)(3)).toBe(6);
  });
  it("по кілька аргументів за раз", () => {
    const c = curry(add3);
    expect(c(1, 2)(3)).toBe(6);
    expect(c(1)(2, 3)).toBe(6);
    expect(c(1, 2, 3)).toBe(6);
  });
  it("часткові функції можна використовувати повторно", () => {
    const add10 = curry(add3)(10);
    expect(add10(1)(1)).toBe(12);
    expect(add10(2)(2)).toBe(14);
  });
  it("працює в конвеєрі з map", () => {
    const mul = curry((a, b) => a * b);
    expect([1, 2, 3].map(mul(10))).toEqual([10, 20, 30]);
  });
});`,
  },
  {
    ...base, id: "js-memoize-once", lesson: "js/44", xp: 25,
    title: "Декоратори memoize і once",
    context: "Кеш результатів і одноразовий запуск: два найпростіші декоратори. Обидва зберігають стан у замиканні й не змінюють оригінальну функцію, лише додають їй пам'ять.",
    brief: [
      "Напишіть <code>memoize(fn)</code>: повертає функцію, яка кешує результати за аргументами (<code>JSON.stringify(args)</code> як ключ). Для повторного виклику з тими самими аргументами оригінал не викликається.",
      "Напишіть <code>once(fn)</code>: повертає функцію, яка викликає <code>fn</code> лише при першому виклику, а всі наступні повертають збережений результат (аргументи наступних викликів ігноруються).",
    ],
    starter: raw`function memoize(fn) {
  return fn;
}

function once(fn) {
  return fn;
}
`,
    tests: raw`describe("memoize", () => {
  it("не викликає функцію вдруге з тими самими аргументами", () => {
    let calls = 0;
    const square = memoize((n) => { calls++; return n * n; });
    expect(square(4)).toBe(16);
    expect(square(4)).toBe(16);
    expect(calls).toBe(1);
  });
  it("різні аргументи рахуються окремо", () => {
    let calls = 0;
    const add = memoize((a, b) => { calls++; return a + b; });
    expect(add(1, 2)).toBe(3);
    expect(add(2, 1)).toBe(3);
    expect(add(1, 2)).toBe(3);
    expect(calls).toBe(2);
  });
  it("кешує й значення undefined", () => {
    let calls = 0;
    const nothing = memoize(() => { calls++; });
    nothing();
    nothing();
    expect(calls).toBe(1);
  });
});
describe("once", () => {
  it("виконується лише раз і повертає той самий результат", () => {
    let calls = 0;
    const init = once((name) => { calls++; return "ініт " + name; });
    expect(init("a")).toBe("ініт a");
    expect(init("b")).toBe("ініт a");
    expect(calls).toBe(1);
  });
  it("незалежні обгортки", () => {
    const a = once(() => 1);
    const b = once(() => 2);
    expect(a()).toBe(1);
    expect(b()).toBe(2);
  });
});`,
  },
  {
    ...base, id: "js-lazy-loader", lesson: "js/45", xp: 30,
    title: "Ліниве завантаження з кешем проміса",
    context: "Важкі модулі підвантажують лише тоді, коли вони потрібні, і лише один раз, навіть якщо кілька частин програми попросили їх одночасно. Для цього зберігають не результат, а проміс завантаження.",
    brief: [
      "Напишіть <code>createLazy(loader)</code>, що повертає функцію <code>get()</code>. Вона повертає проміс зі значенням, яке дає асинхронна функція <code>loader</code>.",
      "<code>loader</code> викликається лише раз, навіть якщо <code>get()</code> викликали кілька разів поспіль чи одночасно: усі отримують той самий проміс. Якщо <code>loader</code> відхилився, невдача не кешується, і наступний виклик <code>get()</code> пробує знову.",
    ],
    starter: raw`function createLazy(loader) {
  return () => loader();
}
`,
    tests: raw`describe("createLazy", () => {
  it("викликає завантажувач один раз", async () => {
    let calls = 0;
    const get = createLazy(async () => { calls++; return "модуль"; });
    expect(await get()).toBe("модуль");
    expect(await get()).toBe("модуль");
    expect(calls).toBe(1);
  });
  it("паралельні виклики ділять один запит", async () => {
    let calls = 0;
    const get = createLazy(() => new Promise((resolve) => setTimeout(() => { calls++; resolve(42); }, 10)));
    const [a, b] = await Promise.all([get(), get()]);
    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(calls).toBe(1);
  });
  it("не викликає завантажувач до першого get()", () => {
    let calls = 0;
    createLazy(async () => { calls++; });
    expect(calls).toBe(0);
  });
  it("після помилки наступний виклик пробує знову", async () => {
    let calls = 0;
    const get = createLazy(async () => {
      calls++;
      if (calls === 1) throw new Error("збій");
      return "ok";
    });
    await expect(get()).rejects.toThrow("збій");
    expect(await get()).toBe("ok");
    expect(calls).toBe(2);
  });
});`,
  },
  {
    ...base, id: "js-proxy-kit", lesson: "js/46", xp: 30,
    title: "Proxy: значення за замовчуванням і лише читання",
    context: "Проксі дозволяє додати до об'єкта поведінку, не змінюючи його самого: підставити запасне значення для відсутніх ключів або заборонити будь-які зміни. Так працюють обгортки конфігурацій.",
    brief: [
      "Напишіть <code>withDefault(obj, fallback)</code>: повертає проксі, у якого читання відсутнього ключа дає <code>fallback</code>, а наявні ключі читаються як є. Запис проходить у вихідний об'єкт.",
      "Напишіть <code>readOnly(obj)</code>: повертає проксі, де читання працює, а будь-який запис чи видалення властивості кидає <code>TypeError</code>. Вихідний об'єкт не змінюється.",
    ],
    starter: raw`function withDefault(obj, fallback) {
  return obj;
}

function readOnly(obj) {
  return obj;
}
`,
    tests: raw`describe("withDefault", () => {
  it("наявні ключі читаються як є", () => {
    const p = withDefault({ a: 1, b: 0 }, "нема");
    expect(p.a).toBe(1);
    expect(p.b).toBe(0);
  });
  it("відсутній ключ дає запасне значення", () => {
    const p = withDefault({ a: 1 }, "нема");
    expect(p.zzz).toBe("нема");
  });
  it("запис потрапляє у вихідний об'єкт", () => {
    const source = {};
    const p = withDefault(source, 0);
    p.count = 5;
    expect(source.count).toBe(5);
    expect(p.count).toBe(5);
  });
});
describe("readOnly", () => {
  it("читання працює", () => {
    const p = readOnly({ x: 1 });
    expect(p.x).toBe(1);
    expect("x" in p).toBe(true);
  });
  it("запис кидає TypeError", () => {
    const source = { x: 1 };
    const p = readOnly(source);
    expect(() => { p.x = 2; }).toThrow(TypeError);
    expect(() => { p.y = 2; }).toThrow(TypeError);
    expect(source).toEqual({ x: 1 });
  });
  it("видалення кидає TypeError", () => {
    const p = readOnly({ x: 1 });
    expect(() => { delete p.x; }).toThrow(TypeError);
  });
});`,
  },
  {
    ...base, id: "js-reflect-log", lesson: "js/47", xp: 30,
    title: "Журнал звернень через Proxy і Reflect",
    context: "Обгортка, що записує кожне звернення до об'єкта, допомагає налагоджувати чужий код і будувати реактивні системи. Щоб не змінити поведінку цілі, операції пересилають через Reflect.",
    brief: [
      "Напишіть <code>logged(target, log)</code>: повертає проксі над <code>target</code>, який додає до масиву <code>log</code> рядки <code>\"get ключ\"</code>, <code>\"set ключ\"</code>, <code>\"has ключ\"</code> та <code>\"delete ключ\"</code> для відповідних операцій.",
      "Сама операція виконується як звичайно через <code>Reflect</code>: значення читаються й записуються в ціль, а результати збігаються з тими, які були б без проксі.",
    ],
    starter: raw`function logged(target, log) {
  return target;
}
`,
    tests: raw`describe("logged", () => {
  it("записує читання", () => {
    const log = [];
    const p = logged({ a: 1 }, log);
    expect(p.a).toBe(1);
    expect(log).toEqual(["get a"]);
  });
  it("записує запис і зміна доходить до цілі", () => {
    const log = [];
    const source = {};
    const p = logged(source, log);
    p.x = 10;
    expect(source.x).toBe(10);
    expect(log).toEqual(["set x"]);
  });
  it("записує in і delete", () => {
    const log = [];
    const p = logged({ k: 1 }, log);
    expect("k" in p).toBe(true);
    expect("zzz" in p).toBe(false);
    delete p.k;
    expect(log).toEqual(["has k", "has zzz", "delete k"]);
  });
  it("порядок усіх операцій зберігається", () => {
    const log = [];
    const p = logged({ n: 1 }, log);
    p.n = p.n + 1;
    expect(log).toEqual(["get n", "set n"]);
    expect(p.n).toBe(2);
  });
});`,
  },
  {
    ...base, id: "js-shape-check", lesson: "js/48", xp: 30,
    title: "Перевірка форми даних за схемою",
    context: "Дані з API чи форми потрібно перевіряти на вході: чи є всі поля й чи правильного типу. Проста схема та рекурсивний валідатор закривають більшість таких перевірок без сторонніх бібліотек.",
    brief: [
      "Напишіть <code>matchesShape(value, shape)</code>. Схема це об'єкт, у якому значення це або назва типу (<code>\"string\"</code>, <code>\"number\"</code>, <code>\"boolean\"</code>, <code>\"function\"</code>, <code>\"array\"</code>, <code>\"object\"</code>, <code>\"any\"</code>), або вкладена схема.",
      "<code>\"object\"</code> означає непорожнє посилання на об'єкт, що не є масивом; <code>\"array\"</code> перевіряється через <code>Array.isArray</code>; <code>\"any\"</code> приймає будь-що, зокрема відсутнє поле. Додаткові поля в <code>value</code> не заважають. Якщо <code>value</code> не об'єкт, а схема вимагає полів, результат <code>false</code>.",
    ],
    starter: raw`function matchesShape(value, shape) {
  return false;
}
`,
    tests: raw`describe("matchesShape", () => {
  it("прості типи", () => {
    expect(matchesShape({ id: 1, name: "Оля" }, { id: "number", name: "string" })).toBe(true);
    expect(matchesShape({ id: "1", name: "Оля" }, { id: "number", name: "string" })).toBe(false);
  });
  it("відсутнє поле не проходить, а any проходить", () => {
    expect(matchesShape({ id: 1 }, { id: "number", name: "string" })).toBe(false);
    expect(matchesShape({ id: 1 }, { id: "number", extra: "any" })).toBe(true);
  });
  it("вкладені схеми", () => {
    const shape = { user: { name: "string", tags: "array" } };
    expect(matchesShape({ user: { name: "Оля", tags: [] } }, shape)).toBe(true);
    expect(matchesShape({ user: { name: "Оля", tags: "a" } }, shape)).toBe(false);
    expect(matchesShape({ user: null }, shape)).toBe(false);
  });
  it("object, function і boolean", () => {
    expect(matchesShape({ o: {}, f() {}, b: false }, { o: "object", f: "function", b: "boolean" })).toBe(true);
    expect(matchesShape({ o: [] }, { o: "object" })).toBe(false);
    expect(matchesShape({ o: null }, { o: "object" })).toBe(false);
  });
  it("додаткові поля не заважають", () => {
    expect(matchesShape({ a: 1, b: 2, c: 3 }, { a: "number" })).toBe(true);
  });
  it("не об'єкт на вході", () => {
    expect(matchesShape(null, { a: "any" })).toBe(false);
    expect(matchesShape(5, { a: "number" })).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-parse-jsdoc", lesson: "js/49", xp: 25,
    title: "Розбір JSDoc-коментаря",
    context: "Генератори документації й редактори читають теги JSDoc, щоб показати підказки та перевірити типи. Розібрати кілька основних тегів можна однією регуляркою.",
    brief: [
      "Напишіть <code>parseJsDoc(text)</code>, яка розбирає текст JSDoc-коментаря й повертає <code>{ params, returns }</code>. <code>params</code> це масив <code>{ type, name }</code> у порядку появи тегів <code>@param {тип} ім'я</code>; <code>returns</code> це тип із тега <code>@returns {тип}</code> (або <code>@return</code>) чи <code>null</code>, якщо тега немає.",
      "Необов'язкові параметри записують у квадратних дужках (<code>[name]</code> або <code>[name=\"x\"]</code>): ім'я в результаті без дужок і значення за замовчуванням. Тип може містити пробіли й знак <code>|</code>.",
    ],
    starter: raw`function parseJsDoc(text) {
  return { params: [], returns: null };
}
`,
    tests: raw`describe("parseJsDoc", () => {
  it("параметри і результат", () => {
    const doc = "/**\n * Додає числа.\n * @param {number} a перший\n * @param {number} b другий\n * @returns {number} сума\n */";
    expect(parseJsDoc(doc)).toEqual({
      params: [{ type: "number", name: "a" }, { type: "number", name: "b" }],
      returns: "number",
    });
  });
  it("тип-об'єднання з пробілами", () => {
    const doc = "* @param {string | number} id\n* @return {boolean}";
    expect(parseJsDoc(doc)).toEqual({ params: [{ type: "string | number", name: "id" }], returns: "boolean" });
  });
  it("необов'язкові параметри без дужок у імені", () => {
    const doc = "@param {string} [greeting] привіт\n@param {number} [n=5] кількість";
    expect(parseJsDoc(doc).params).toEqual([{ type: "string", name: "greeting" }, { type: "number", name: "n" }]);
  });
  it("немає тегів", () => {
    expect(parseJsDoc("/** Просто опис */")).toEqual({ params: [], returns: null });
  });
  it("лише результат", () => {
    expect(parseJsDoc("@returns {string[]}")).toEqual({ params: [], returns: "string[]" });
  });
});`,
  },
  {
    ...base, id: "js-html-tag", lesson: "js/50", xp: 30,
    title: "Тег html з екрануванням вставок",
    context: "Коли дані користувача потрапляють у HTML без екранування, виникає вразливість XSS. Тегований шаблон, що екранує всі вставки автоматично, не дозволяє про це забути.",
    brief: [
      "Напишіть тег-функцію <code>html(strings, ...values)</code>. Вона склеює статичні частини <code>strings</code> із вставленими значеннями, екрануючи в <b>значеннях</b> символи <code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>\"</code> та <code>'</code> (відповідно <code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;gt;</code>, <code>&amp;quot;</code>, <code>&amp;#39;</code>).",
      "Статичні частини лишаються без змін. Значення перетворюються на рядок (<code>String(value)</code>). Тестувати функцію можна прямим викликом: <code>html([\"&lt;p&gt;\", \"&lt;/p&gt;\"], \"&lt;b&gt;\")</code>.",
    ],
    starter: raw`function html(strings, ...values) {
  return strings.join("");
}
`,
    tests: raw`describe("html", () => {
  it("екранує небезпечні символи у вставці", () => {
    expect(html(["<p>", "</p>"], "<b>")).toBe("<p>&lt;b&gt;</p>");
  });
  it("статичні частини не чіпає", () => {
    expect(html(["<div class='a'>", "</div>"], "текст")).toBe("<div class='a'>текст</div>");
  });
  it("лапки й амперсанд", () => {
    expect(html(["", ""], 'a "b" & c')).toBe("a &quot;b&quot; &amp; c");
    expect(html(["", ""], "it's")).toBe("it&#39;s");
  });
  it("числа й кілька вставок", () => {
    expect(html(["", " + ", " = ", ""], 1, 2, 3)).toBe("1 + 2 = 3");
  });
  it("без вставок", () => {
    expect(html(["лише текст"])).toBe("лише текст");
  });
  it("null і undefined стають текстом", () => {
    expect(html(["", "|", ""], null, undefined)).toBe("null|undefined");
  });
});`,
  },
  {
    ...base, id: "js-lazy-pipeline", lesson: "js/51", xp: 25,
    title: "Ліниві квадрати парних чисел",
    context: "Коли джерело нескінченне або величезне, потрібно брати лише початок результату й не обробляти решту. Ліниві конвеєри на ітераторах роблять це природно.",
    brief: [
      "Напишіть <code>firstEvenSquares(iterable, n)</code>: з ітерованого джерела (воно може бути нескінченним) бере парні числа, підносить кожне до квадрата й повертає <b>масив</b> перших <code>n</code> таких значень.",
      "Якщо парних чисел менше за <code>n</code>, повертаються всі. Для <code>n = 0</code> порожній масив. Функція не повинна просити в джерела зайвих значень після того, як потрібну кількість зібрано.",
    ],
    starter: raw`function firstEvenSquares(iterable, n) {
  const result = [];
  // переглядайте значення джерела по одному й зупиніться, коли набрали n
  return result;
}
`,
    tests: raw`describe("firstEvenSquares", () => {
  it("зі скінченного масиву", () => {
    expect(firstEvenSquares([1, 2, 3, 4, 5, 6], 2)).toEqual([4, 16]);
  });
  it("з нескінченного генератора", () => {
    function* naturals() {
      let n = 1;
      while (true) yield n++;
    }
    expect(firstEvenSquares(naturals(), 3)).toEqual([4, 16, 36]);
  });
  it("парних менше за n", () => {
    expect(firstEvenSquares([1, 2, 3], 5)).toEqual([4]);
  });
  it("нуль значень", () => {
    expect(firstEvenSquares([2, 4], 0)).toEqual([]);
  });
  it("лінивість: джерело не вичерпується", () => {
    let pulled = 0;
    function* counting() {
      while (true) {
        pulled++;
        yield pulled;
      }
    }
    expect(firstEvenSquares(counting(), 2)).toEqual([4, 16]);
    expect(pulled < 6).toBe(true);
  });
});`,
  },
];
