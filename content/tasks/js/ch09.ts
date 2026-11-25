import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly JsTask[] = [
  {
    ...base, id: "js-find-cycle", lesson: "js/86", xp: 35,
    title: "Цикли залежностей і перевірка конфігурації",
    context: "Циклічні імпорти ламають запуск програми, а відсутня змінна середовища проявляється випадково й пізно. Автоматичні перевірки на старті знаходять обидві проблеми одразу.",
    brief: [
      "Напишіть <code>findCycle(deps)</code>: <code>deps</code> це об'єкт, де ключ це назва модуля, а значення масив назв модулів, від яких він залежить. Поверніть масив-шлях першого знайденого циклу, у якому перший і останній елементи збігаються (наприклад, <code>[\"a\", \"b\", \"c\", \"a\"]</code>), або <code>null</code>, якщо циклів немає. Модулі, яких немає серед ключів, вважаються залежностями без залежностей.",
      "Напишіть <code>loadConfig(env)</code>: обов'язкова змінна <code>DATABASE_URL</code>; якщо її немає або вона порожня, киньте <code>Error</code> з повідомленням <code>\"Не задано змінні середовища: DATABASE_URL\"</code>. Повертає <code>{ databaseUrl, port, mode }</code>, де <code>port</code> це число з <code>PORT</code> (за замовчуванням <code>3000</code>), а <code>mode</code> це <code>\"production\"</code>, коли <code>NODE_ENV</code> дорівнює <code>\"production\"</code>, інакше <code>\"development\"</code>.",
    ],
    starter: raw`function findCycle(deps) {
  return null;
}

function loadConfig(env) {
  return {};
}
`,
    tests: raw`describe("findCycle", () => {
  it("без циклів", () => {
    expect(findCycle({ app: ["orders", "shared"], orders: ["shared"], shared: [] })).toBe(null);
    expect(findCycle({})).toBe(null);
  });
  it("простий цикл із трьох модулів", () => {
    expect(findCycle({ a: ["b"], b: ["c"], c: ["a"] })).toEqual(["a", "b", "c", "a"]);
  });
  it("модуль залежить сам від себе", () => {
    expect(findCycle({ a: ["a"] })).toEqual(["a", "a"]);
  });
  it("цикл не на початку обходу", () => {
    expect(findCycle({ x: ["a"], a: ["b"], b: ["a"] })).toEqual(["a", "b", "a"]);
  });
  it("залежності без власних записів", () => {
    expect(findCycle({ a: ["lib"], b: ["lib", "a"] })).toBe(null);
  });
  it("ромб без циклу не плутається з циклом", () => {
    expect(findCycle({ top: ["l", "r"], l: ["base"], r: ["base"], base: [] })).toBe(null);
  });
});
describe("loadConfig", () => {
  it("значення за замовчуванням", () => {
    expect(loadConfig({ DATABASE_URL: "postgres://db" })).toEqual({ databaseUrl: "postgres://db", port: 3000, mode: "development" });
  });
  it("порт і режим із середовища", () => {
    expect(loadConfig({ DATABASE_URL: "x", PORT: "8080", NODE_ENV: "production" })).toEqual({ databaseUrl: "x", port: 8080, mode: "production" });
  });
  it("відсутня обов'язкова змінна", () => {
    expect(() => loadConfig({})).toThrow("Не задано змінні середовища: DATABASE_URL");
    expect(() => loadConfig({ DATABASE_URL: "" })).toThrow("DATABASE_URL");
  });
});`,
  },
  {
    ...base, id: "js-mini-expect", lesson: "js/87", xp: 35,
    title: "Власний мініфреймворк перевірок",
    context: "Щоб зрозуміти, як працюють expect, toBe та toEqual у Vitest, корисно написати їх самому. Перевірка, що не пройшла, просто кидає помилку, а .not інвертує результат.",
    brief: [
      "Напишіть <code>myExpect(actual)</code>, що повертає об'єкт із перевірками <code>toBe(expected)</code> (порівняння через <code>Object.is</code>), <code>toEqual(expected)</code> (глибоке порівняння об'єктів і масивів) та <code>toThrow(expected)</code> (<code>actual</code> тут функція; без аргументу перевіряє, що вона кинула помилку; з рядком, що повідомлення містить цей рядок; з класом, що помилка є його екземпляром).",
      "Якщо перевірка не пройшла, кидається звичайна <code>Error</code>. У результата є також властивість <code>not</code> з тими самими методами, але з інвертованою логікою: <code>myExpect(1).not.toBe(2)</code> проходить, а <code>myExpect(1).not.toBe(1)</code> кидає помилку.",
    ],
    starter: raw`function myExpect(actual) {
  const noop = { toBe() {}, toEqual() {}, toThrow() {} };
  return { ...noop, not: noop };
}
`,
    tests: raw`const fails = (fn) => {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
};
describe("toBe", () => {
  it("проходить для збігу й падає для різниці", () => {
    expect(fails(() => myExpect(1).toBe(1))).toBe(false);
    expect(fails(() => myExpect(1).toBe(2))).toBe(true);
  });
  it("порівняння через Object.is", () => {
    expect(fails(() => myExpect(NaN).toBe(NaN))).toBe(false);
    expect(fails(() => myExpect({}).toBe({}))).toBe(true);
    expect(fails(() => myExpect(0).toBe(-0))).toBe(true);
  });
});
describe("toEqual", () => {
  it("глибоке порівняння", () => {
    expect(fails(() => myExpect({ a: [1, { b: 2 }] }).toEqual({ a: [1, { b: 2 }] }))).toBe(false);
    expect(fails(() => myExpect({ a: [1, { b: 2 }] }).toEqual({ a: [1, { b: 3 }] }))).toBe(true);
  });
  it("різна кількість ключів і масив проти об'єкта", () => {
    expect(fails(() => myExpect({ a: 1 }).toEqual({ a: 1, b: 2 }))).toBe(true);
    expect(fails(() => myExpect([]).toEqual({}))).toBe(true);
    expect(fails(() => myExpect([1, 2]).toEqual([1, 2]))).toBe(false);
  });
});
describe("toThrow", () => {
  it("кидає чи ні", () => {
    expect(fails(() => myExpect(() => { throw new Error("x"); }).toThrow())).toBe(false);
    expect(fails(() => myExpect(() => 1).toThrow())).toBe(true);
  });
  it("за повідомленням і за класом", () => {
    const boom = () => { throw new TypeError("поганий тип"); };
    expect(fails(() => myExpect(boom).toThrow("поганий"))).toBe(false);
    expect(fails(() => myExpect(boom).toThrow("інший текст"))).toBe(true);
    expect(fails(() => myExpect(boom).toThrow(TypeError))).toBe(false);
    expect(fails(() => myExpect(boom).toThrow(RangeError))).toBe(true);
  });
});
describe("not", () => {
  it("інвертує перевірки", () => {
    expect(fails(() => myExpect(1).not.toBe(2))).toBe(false);
    expect(fails(() => myExpect(1).not.toBe(1))).toBe(true);
    expect(fails(() => myExpect({ a: 1 }).not.toEqual({ a: 2 }))).toBe(false);
    expect(fails(() => myExpect({ a: 1 }).not.toEqual({ a: 1 }))).toBe(true);
    expect(fails(() => myExpect(() => 1).not.toThrow())).toBe(false);
    expect(fails(() => myExpect(() => { throw new Error("x"); }).not.toThrow())).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-spy", lesson: "js/88", xp: 35,
    title: "Власний шпигун: createSpy і spyOn",
    context: "Шпигун записує виклики функції: аргументи, результати, кількість. spyOn підставляє такого шпигуна замість методу об'єкта й дозволяє потім повернути оригінал.",
    brief: [
      "Напишіть <code>createSpy(impl)</code>: повертає функцію-шпигуна, яка викликає <code>impl</code> (за замовчуванням нічого не робить і повертає <code>undefined</code>), записує аргументи кожного виклику в масив <code>spy.calls</code>, а повернуті значення в <code>spy.results</code>. Метод <code>spy.mockReturnValue(value)</code> змушує шпигуна повертати <code>value</code> (замість <code>impl</code>), а <code>spy.reset()</code> очищає записані виклики й результати.",
      "Напишіть <code>spyOn(obj, method)</code>: замінює <code>obj[method]</code> шпигуном, який записує виклики й викликає оригінал з правильним <code>this</code> та повертає його результат. У шпигуна є метод <code>restore()</code>, що повертає оригінал. Якщо методу немає або це не функція, кидайте <code>TypeError</code>.",
    ],
    starter: raw`function createSpy(impl = () => undefined) {
  return impl;
}

function spyOn(obj, method) {
  return obj[method];
}
`,
    tests: raw`describe("createSpy", () => {
  it("записує аргументи й результати", () => {
    const spy = createSpy((x) => x * 2);
    expect(spy(5)).toBe(10);
    expect(spy(7)).toBe(14);
    expect(spy.calls).toEqual([[5], [7]]);
    expect(spy.results).toEqual([10, 14]);
  });
  it("за замовчуванням повертає undefined", () => {
    const spy = createSpy();
    expect(spy("a", "b")).toBe(undefined);
    expect(spy.calls).toEqual([["a", "b"]]);
  });
  it("mockReturnValue", () => {
    const spy = createSpy(() => 1);
    spy.mockReturnValue(42);
    expect(spy()).toBe(42);
    expect(spy.results).toEqual([42]);
  });
  it("reset очищає записи", () => {
    const spy = createSpy();
    spy(1);
    spy(2);
    spy.reset();
    expect(spy.calls).toEqual([]);
    expect(spy.results).toEqual([]);
  });
});
describe("spyOn", () => {
  it("записує виклики й викликає оригінал із this", () => {
    const user = { name: "Оля", greet(greeting) { return greeting + ", " + this.name; } };
    const spy = spyOn(user, "greet");
    expect(user.greet("Привіт")).toBe("Привіт, Оля");
    expect(spy.calls).toEqual([["Привіт"]]);
    expect(spy.results).toEqual(["Привіт, Оля"]);
  });
  it("restore повертає оригінал", () => {
    const logger = { log() { return "оригінал"; } };
    const original = logger.log;
    const spy = spyOn(logger, "log");
    expect(logger.log === original).toBe(false);
    spy.restore();
    expect(logger.log === original).toBe(true);
    expect(logger.log()).toBe("оригінал");
  });
  it("немає такого методу: TypeError", () => {
    expect(() => spyOn({ a: 1 }, "a")).toThrow(TypeError);
    expect(() => spyOn({}, "nothing")).toThrow(TypeError);
  });
});`,
  },
  {
    ...base, id: "js-string-calculator", lesson: "js/89", xp: 35,
    title: "Калькулятор рядків: ката для TDD",
    context: "Класична ката для тренування TDD: вимоги додаються по одній, і кожна потребує невеликого узагальнення коду. Працюйте за схемою «червоний, зелений, рефакторинг».",
    brief: [
      "Напишіть <code>add(text)</code>: порожній рядок дає <code>0</code>; числа розділені комою або символом нового рядка (<code>\"1\\n2,3\"</code> дає <code>6</code>); власний роздільник задається першим рядком <code>//роздільник\\n</code> (<code>\"//;\\n1;2\"</code> дає <code>3</code>).",
      "Числа більші за <code>1000</code> ігноруються. Якщо є від'ємні числа, киньте <code>Error</code> з повідомленням <code>\"Від'ємні числа заборонені: -1, -2\"</code> (усі від'ємні через кому з пробілом, у порядку появи).",
    ],
    starter: raw`function add(text) {
  return 0;
}
`,
    tests: raw`describe("add", () => {
  it("порожній рядок", () => {
    expect(add("")).toBe(0);
  });
  it("одне число", () => {
    expect(add("5")).toBe(5);
  });
  it("кілька чисел через кому", () => {
    expect(add("1,2")).toBe(3);
    expect(add("1,2,3,4")).toBe(10);
  });
  it("новий рядок як роздільник", () => {
    expect(add("1\n2,3")).toBe(6);
  });
  it("власний роздільник", () => {
    expect(add("//;\n1;2")).toBe(3);
    expect(add("//|\n4|5|6")).toBe(15);
    expect(add("//.\n1.2.3")).toBe(6);
  });
  it("числа понад 1000 ігноруються", () => {
    expect(add("2,1001")).toBe(2);
    expect(add("1000,1")).toBe(1001);
  });
  it("від'ємні числа заборонені", () => {
    expect(() => add("1,-2,3,-4")).toThrow("Від'ємні числа заборонені: -2, -4");
    expect(() => add("-1")).toThrow("Від'ємні числа заборонені: -1");
  });
});`,
  },
  {
    ...base, id: "js-fake-timers", lesson: "js/90", xp: 40,
    title: "Підроблений годинник для тестів",
    context: "Тести з реальним очікуванням повільні та нестабільні. Підроблений годинник виконує таймери за командою tick, і debounce на 300 мс перевіряється за мить.",
    brief: [
      "Напишіть <code>createFakeClock()</code>, що повертає об'єкт із методами <code>now()</code> (поточний «час», починається з <code>0</code>), <code>setTimeout(fn, ms)</code> (повертає числовий id; <code>ms</code> за замовчуванням <code>0</code>), <code>clearTimeout(id)</code> та <code>tick(ms)</code>.",
      "<code>tick(ms)</code> посуває час уперед на <code>ms</code> і виконує всі таймери, чий час настав, за порядком часу (за рівного часу за порядком створення). Таймери, заплановані <b>під час</b> виконання колбека, теж спрацьовують, якщо їхній час потрапляє в проміжок. Під час виконання колбека <code>now()</code> повертає час саме цього таймера, а після <code>tick</code> на <code>ms</code> більше, ніж до нього.",
    ],
    starter: raw`function createFakeClock() {
  let time = 0;
  return {
    now: () => time,
    setTimeout(fn, ms = 0) {
      return 0;
    },
    clearTimeout(id) {},
    tick(ms) {
      time += ms;
    },
  };
}
`,
    tests: raw`describe("createFakeClock", () => {
  it("починається з нуля й посувається", () => {
    const clock = createFakeClock();
    expect(clock.now()).toBe(0);
    clock.tick(250);
    expect(clock.now()).toBe(250);
  });
  it("виконує таймери за порядком часу", () => {
    const clock = createFakeClock();
    const log = [];
    clock.setTimeout(() => log.push("200"), 200);
    clock.setTimeout(() => log.push("100"), 100);
    clock.tick(150);
    expect(log).toEqual(["100"]);
    clock.tick(100);
    expect(log).toEqual(["100", "200"]);
  });
  it("рівний час: за порядком створення", () => {
    const clock = createFakeClock();
    const log = [];
    clock.setTimeout(() => log.push("a"), 50);
    clock.setTimeout(() => log.push("b"), 50);
    clock.setTimeout(() => log.push("c"), 10);
    clock.tick(50);
    expect(log).toEqual(["c", "a", "b"]);
  });
  it("clearTimeout скасовує", () => {
    const clock = createFakeClock();
    const log = [];
    const id = clock.setTimeout(() => log.push("x"), 10);
    clock.setTimeout(() => log.push("y"), 20);
    clock.clearTimeout(id);
    clock.tick(100);
    expect(log).toEqual(["y"]);
  });
  it("таймер виконується лише раз", () => {
    const clock = createFakeClock();
    let count = 0;
    clock.setTimeout(() => count++, 10);
    clock.tick(10);
    clock.tick(10);
    expect(count).toBe(1);
  });
  it("вкладені таймери спрацьовують у межах того самого tick", () => {
    const clock = createFakeClock();
    const log = [];
    clock.setTimeout(() => {
      log.push("перший @" + clock.now());
      clock.setTimeout(() => log.push("вкладений @" + clock.now()), 30);
    }, 20);
    clock.tick(60);
    expect(log).toEqual(["перший @20", "вкладений @50"]);
    expect(clock.now()).toBe(60);
  });
  it("вкладений таймер, що не встигає, чекає наступного tick", () => {
    const clock = createFakeClock();
    const log = [];
    clock.setTimeout(() => clock.setTimeout(() => log.push("пізно"), 100), 10);
    clock.tick(50);
    expect(log).toEqual([]);
    clock.tick(100);
    expect(log).toEqual(["пізно"]);
  });
  it("id унікальні, нуль мілісекунд спрацьовує на найближчому tick", () => {
    const clock = createFakeClock();
    const a = clock.setTimeout(() => {});
    const b = clock.setTimeout(() => {});
    expect(a === b).toBe(false);
    let ran = false;
    clock.setTimeout(() => { ran = true; });
    clock.tick(0);
    expect(ran).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-fix-average", lesson: "js/91", xp: 35,
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
