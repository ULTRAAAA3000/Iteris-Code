import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02: readonly JsTask[] = [
  {
    ...base, id: "js-fib-let", lesson: "js/5", xp: 20,
    title: "n-те число Фібоначчі на змінних let",
    context: "Накопичувачі, лічильники й «попередні значення» у циклах — типова робота для let: значення змінюється на кожному кроці. Така пара змінних, що зсувається вперед, зустрічається в розрахунках, анімаціях і пагінації.",
    brief: [
      "Напишіть функцію <code>fib(n)</code>, яка повертає n-те число Фібоначчі: <code>fib(0)</code> це <code>0</code>, <code>fib(1)</code> це <code>1</code>, а далі кожне число дорівнює сумі двох попередніх (0, 1, 1, 2, 3, 5, 8…).",
      "Використайте цикл і дві змінні <code>let</code> для двох останніх чисел, без рекурсії.",
    ],
    starter: raw`function fib(n) {
  let previous = 0;
  let current = 1;
  // зсувайте пару previous і current уперед n разів
  return -1;
}
`,
    tests: raw`describe("fib", () => {
  it("перші числа", () => {
    expect(fib(0)).toBe(0);
    expect(fib(1)).toBe(1);
    expect(fib(2)).toBe(1);
    expect(fib(3)).toBe(2);
  });
  it("середні числа", () => {
    expect(fib(10)).toBe(55);
    expect(fib(20)).toBe(6765);
  });
  it("велике число без рекурсії", () => {
    expect(fib(50)).toBe(12586269025);
  });
});`,
  },
  {
    ...base, id: "js-type-of", lesson: "js/6", xp: 15,
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
    ...base, id: "js-cart-total", lesson: "js/7", xp: 30, premium: true,
    title: "Сума кошика",
    context: "Розрахунок суми замовлення — серце будь-якого інтернет-магазину. Помилка в копійках чи в обробці порожнього кошика коштує реальних грошей і довіри клієнтів.",
    brief: [
      "Напишіть <code>calculateTotal(items)</code>: сума <code>price × qty</code> лише для товарів, що є в наявності (<code>inStock !== false</code>).",
      "Якщо <code>qty</code> не вказано, вважайте його рівним 1. Порожній кошик дає 0. Результат округліть до 2 знаків: <code>0.1 + 0.2</code> має давати <code>0.3</code>. Вхідний масив змінювати не можна.",
    ],
    starter: raw`function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return total;
}
`,
    tests: raw`describe("calculateTotal", () => {
  it("рахує лише товари в наявності", () => {
    const items = [
      { price: 100, qty: 2, inStock: true },
      { price: 50, qty: 1, inStock: false },
    ];
    expect(calculateTotal(items)).toBe(200);
  });
  it("порожній кошик", () => {
    expect(calculateTotal([])).toBe(0);
  });
  it("qty за замовчуванням дорівнює 1", () => {
    expect(calculateTotal([{ price: 75 }])).toBe(75);
  });
  it("не накопичує похибку дробових чисел", () => {
    expect(calculateTotal([{ price: 0.1, qty: 1 }, { price: 0.2, qty: 1 }])).toBe(0.3);
  });
  it("не змінює вхідні дані", () => {
    const items = [{ price: 10, qty: 3, inStock: true }];
    const copy = JSON.parse(JSON.stringify(items));
    calculateTotal(items);
    expect(items).toEqual(copy);
  });
});`,
  },
  {
    ...base, id: "js-format-price", lesson: "js/8", xp: 25,
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
    ...base, id: "js-to-number", lesson: "js/9", xp: 25,
    title: "Суворе перетворення тексту на число",
    context: "Поля форм завжди віддають рядки, а Number(\"\") дає 0, тож порожнє поле «ціна» непомітно перетворюється на нуль. Надійне перетворення на межі програми відсіює порожнє, сміття й нескінченність.",
    brief: [
      "Напишіть <code>toNumberStrict(value)</code>, яка повертає число або <code>NaN</code>, якщо значення не можна вважати коректним числом.",
      "Рядок обрізайте від пробілів. Порожній рядок і рядок із самих пробілів дають <code>NaN</code>, а не <code>0</code>. Число повертається як є, але <code>Infinity</code> і <code>NaN</code> не коректні. Усе, що не є рядком чи числом (<code>null</code>, <code>undefined</code>, булеві), дає <code>NaN</code>.",
    ],
    starter: raw`function toNumberStrict(value) {
  return Number(value);
}
`,
    tests: raw`describe("toNumberStrict", () => {
  it("число з пробілами навколо", () => {
    expect(toNumberStrict(" 42 ")).toBe(42);
    expect(toNumberStrict("3.5")).toBe(3.5);
    expect(toNumberStrict("-7")).toBe(-7);
  });
  it("порожній рядок і пробіли дають NaN, а не 0", () => {
    expect(Number.isNaN(toNumberStrict(""))).toBe(true);
    expect(Number.isNaN(toNumberStrict("   "))).toBe(true);
  });
  it("сміття в рядку дає NaN", () => {
    expect(Number.isNaN(toNumberStrict("12px"))).toBe(true);
    expect(Number.isNaN(toNumberStrict("abc"))).toBe(true);
  });
  it("не рядки: число лишається числом, решта NaN", () => {
    expect(toNumberStrict(8)).toBe(8);
    expect(Number.isNaN(toNumberStrict(null))).toBe(true);
    expect(Number.isNaN(toNumberStrict(undefined))).toBe(true);
    expect(Number.isNaN(toNumberStrict(true))).toBe(true);
  });
  it("нескінченність і NaN не вважаються коректними", () => {
    expect(Number.isNaN(toNumberStrict("Infinity"))).toBe(true);
    expect(Number.isNaN(toNumberStrict(Infinity))).toBe(true);
    expect(Number.isNaN(toNumberStrict(NaN))).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-safe-city", lesson: "js/10", xp: 20,
    title: "Безпечне читання міста",
    context: "Дані користувачів із сервера майже завжди неповні: адреса може бути null, а місто — порожнім рядком. Падіння на таких даних — одна з найчастіших причин помилок у продакшені.",
    brief: [
      "Напишіть функцію <code>getCity(user)</code>, що повертає місто користувача (<code>user.address.city</code>).",
      "Якщо користувача, адреси чи міста немає, або місто порожнє, поверніть рядок «Невідомо». Функція не повинна кидати помилку.",
    ],
    starter: raw`function getCity(user) {
  return user.address.city;
}
`,
    tests: raw`describe("getCity", () => {
  it("повертає місто", () => {
    expect(getCity({ address: { city: "Дніпро" } })).toBe("Дніпро");
  });
  it("адреса дорівнює null", () => {
    expect(getCity({ address: null })).toBe("Невідомо");
  });
  it("адреси немає взагалі", () => {
    expect(getCity({})).toBe("Невідомо");
  });
  it("користувача немає (undefined і null)", () => {
    expect(getCity(undefined)).toBe("Невідомо");
    expect(getCity(null)).toBe("Невідомо");
  });
  it("місто — порожній рядок", () => {
    expect(getCity({ address: { city: "" } })).toBe("Невідомо");
  });
});`,
  },
  {
    ...base, id: "js-fizzbuzz", lesson: "js/11", xp: 20,
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
    ...base, id: "js-find-cell", lesson: "js/12", xp: 25,
    title: "Пошук клітинки в таблиці",
    context: "Пошук у двовимірних даних (таблиця, сітка гри, зображення) зупиняють на першому збігу: далі дивитися немає сенсу. Ранній вихід із вкладених циклів економить час на великих даних.",
    brief: [
      "Напишіть <code>findCell(matrix, value)</code>: функція шукає значення в масиві масивів і повертає пару <code>[рядок, стовпець]</code> першого знайденого збігу (перегляд рядок за рядком, зліва направо). Порівнюйте суворо (<code>===</code>).",
      "Якщо значення немає, поверніть <code>null</code>. Рядки можуть мати різну довжину. Скористайтеся міткою з <code>break</code> або ранім <code>return</code>.",
    ],
    starter: raw`function findCell(matrix, value) {
  for (let row = 0; row < matrix.length; row++) {
    // переберіть стовпці рядка row
  }
  return null;
}
`,
    tests: raw`describe("findCell", () => {
  it("знаходить значення", () => {
    const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    expect(findCell(grid, 5)).toEqual([1, 1]);
    expect(findCell(grid, 9)).toEqual([2, 2]);
    expect(findCell(grid, 1)).toEqual([0, 0]);
  });
  it("повертає перший збіг", () => {
    expect(findCell([[0, 7], [7, 7]], 7)).toEqual([0, 1]);
  });
  it("немає значення: null", () => {
    expect(findCell([[1, 2], [3, 4]], 99)).toBe(null);
    expect(findCell([], 1)).toBe(null);
  });
  it("рядки різної довжини", () => {
    expect(findCell([[1], [], [2, 3, 4]], 4)).toEqual([2, 2]);
  });
  it("суворе порівняння", () => {
    expect(findCell([["5"], [5]], 5)).toEqual([1, 0]);
  });
});`,
  },
  {
    ...base, id: "js-function-tools", lesson: "js/13", xp: 20,
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
    ...base, id: "js-params-kit", lesson: "js/14", xp: 25,
    title: "Rest, spread і параметри за замовчуванням",
    context: "Функції зі змінною кількістю аргументів і об'єкти налаштувань із запасними значеннями трапляються в кожній бібліотеці: від логера до компонента інтерфейсу. Тут ви напишете обидва види.",
    brief: [
      "Напишіть <code>sumAll(...numbers)</code>, яка повертає суму всіх аргументів (для порожнього виклику <code>0</code>).",
      "Напишіть <code>createUser(options)</code>: приймає об'єкт <code>{ name, role, active }</code> і повертає об'єкт із цими полями. Якщо <code>role</code> не передали, це <code>\"user\"</code>, якщо <code>active</code> не передали, це <code>true</code>. Виклик без аргументів теж має працювати (<code>name</code> тоді <code>undefined</code>). Передане <code>null</code> значенням за замовчуванням не замінюється.",
    ],
    starter: raw`function sumAll() {
  return 0;
}

function createUser(options) {
  return { name: options.name, role: options.role, active: options.active };
}
`,
    tests: raw`describe("sumAll", () => {
  it("без аргументів і з одним", () => {
    expect(sumAll()).toBe(0);
    expect(sumAll(5)).toBe(5);
  });
  it("кілька чисел", () => {
    expect(sumAll(1, 2, 3, 4)).toBe(10);
  });
  it("працює з розгорнутим масивом", () => {
    const nums = [1, 2, 3];
    expect(sumAll(...nums)).toBe(6);
  });
});
describe("createUser", () => {
  it("значення за замовчуванням", () => {
    expect(createUser({ name: "Оля" })).toEqual({ name: "Оля", role: "user", active: true });
  });
  it("власні значення", () => {
    expect(createUser({ name: "Іван", role: "admin", active: false })).toEqual({ name: "Іван", role: "admin", active: false });
  });
  it("виклик без аргументів", () => {
    expect(createUser()).toEqual({ name: undefined, role: "user", active: true });
  });
  it("null не замінюється значенням за замовчуванням", () => {
    expect(createUser({ name: "x", role: null }).role).toBe(null);
  });
});`,
  },
  {
    ...base, id: "js-callbacks-kit", lesson: "js/15", xp: 20,
    title: "Функція вищого порядку: times і makeMultiplier",
    context: "Передавати функції як значення й повертати їх із функцій потрібно щодня: так працюють методи масивів, таймери й обробники подій. Тут ви напишете дві маленькі «фабрики» такого стилю.",
    brief: [
      "Напишіть <code>times(n, fn)</code>: викликає <code>fn(i)</code> для <code>i</code> від <code>0</code> до <code>n - 1</code> і повертає масив результатів. Для <code>n = 0</code> це порожній масив.",
      "Напишіть <code>makeMultiplier(k)</code>, яка повертає функцію, що множить свій аргумент на <code>k</code>. Кожен створений множник працює незалежно.",
    ],
    starter: raw`function times(n, fn) {
  return [];
}

function makeMultiplier(k) {
  return (x) => x;
}
`,
    tests: raw`describe("times", () => {
  it("збирає результати колбека", () => {
    expect(times(3, (i) => i * 2)).toEqual([0, 2, 4]);
  });
  it("нуль разів: порожній масив", () => {
    expect(times(0, (i) => i)).toEqual([]);
  });
  it("колбек отримує індекс і викликається рівно n разів", () => {
    const seen = [];
    times(4, (i) => { seen.push(i); });
    expect(seen).toEqual([0, 1, 2, 3]);
  });
});
describe("makeMultiplier", () => {
  it("множить на k", () => {
    expect(makeMultiplier(3)(7)).toBe(21);
    expect(makeMultiplier(0)(5)).toBe(0);
  });
  it("множники незалежні", () => {
    const double = makeMultiplier(2);
    const triple = makeMultiplier(3);
    expect(double(10)).toBe(20);
    expect(triple(10)).toBe(30);
    expect(double(1)).toBe(2);
  });
});`,
  },
  {
    ...base, id: "js-counter-bug", lesson: "js/16", xp: 30,
    title: "Налагодження: лічильники плутаються",
    context: "Спільний стан, випадково винесений за межі функції, — класичний баг: два незалежні елементи інтерфейсу раптом починають змінювати одне й те саме значення. Знайти таке без розуміння замикань важко.",
    brief: [
      "Функція <code>makeCounter()</code> має створювати незалежні лічильники, але два лічильники зараз «ділять» одне число. Знайдіть причину й виправте.",
      "Також додайте метод <code>reset()</code>, що обнуляє лічильник. Метод <code>inc()</code> повертає нове значення.",
    ],
    starter: raw`let count = 0;

function makeCounter() {
  return {
    inc() {
      count++;
      return count;
    },
    get() {
      return count;
    },
  };
}
`,
    tests: raw`describe("makeCounter", () => {
  it("inc повертає нове значення", () => {
    const c = makeCounter();
    expect(c.inc()).toBe(1);
    expect(c.inc()).toBe(2);
  });
  it("лічильники незалежні", () => {
    const a = makeCounter();
    const b = makeCounter();
    a.inc();
    a.inc();
    b.inc();
    expect(a.get()).toBe(2);
    expect(b.get()).toBe(1);
  });
  it("reset обнуляє лише свій лічильник", () => {
    const a = makeCounter();
    const b = makeCounter();
    a.inc();
    b.inc();
    a.reset();
    expect(a.get()).toBe(0);
    expect(b.get()).toBe(1);
  });
  it("новий лічильник починається з нуля", () => {
    makeCounter().inc();
    expect(makeCounter().get()).toBe(0);
  });
});`,
  },
  {
    ...base, id: "js-tdz-fix", lesson: "js/17", xp: 20,
    title: "Виправте порядок: мертва зона",
    context: "Помилка «Cannot access before initialization» з'являється, коли змінну прочитали раніше за її оголошення, найчастіше після перенесення рядків. Уміння швидко побачити причину економить час на налагодженні.",
    brief: [
      "Функція <code>describeTotal(prices)</code> має повертати рядок <code>Разом: &lt;сума&gt;</code>, але падає з <code>ReferenceError</code>: змінна <code>total</code> читається до свого оголошення.",
      "Виправте функцію, змінивши порядок рядків. Масив <code>prices</code> змінювати не можна.",
    ],
    starter: raw`function describeTotal(prices) {
  const message = "Разом: " + total;
  const total = prices.reduce((sum, price) => sum + price, 0);
  return message;
}
`,
    tests: raw`describe("describeTotal", () => {
  it("сума кількох цін", () => {
    expect(describeTotal([10, 20, 30])).toBe("Разом: 60");
  });
  it("порожній список", () => {
    expect(describeTotal([])).toBe("Разом: 0");
  });
  it("одне число", () => {
    expect(describeTotal([5])).toBe("Разом: 5");
  });
  it("не змінює вхідний масив", () => {
    const prices = [1, 2];
    describeTotal(prices);
    expect(prices).toEqual([1, 2]);
  });
});`,
  },
  {
    ...base, id: "js-tree-kit", lesson: "js/18", xp: 30,
    title: "Рекурсія по дереву: глибина й листки",
    context: "Дерева зустрічаються всюди: папки з файлами, меню з підменю, коментарі з відповідями. Їх обходять рекурсією, бо кожне піддерево має ту саму форму, що й усе дерево.",
    brief: [
      "Вузол дерева це об'єкт <code>{ value, children }</code>, де <code>children</code> масив таких самих вузлів (порожній у листка). Напишіть <code>treeDepth(node)</code>: глибина дерева (листок має глибину <code>1</code>).",
      "Напишіть <code>countLeaves(node)</code>: кількість листків (вузлів без дітей). Обидві функції мають бути рекурсивними.",
    ],
    starter: raw`function treeDepth(node) {
  return 0;
}

function countLeaves(node) {
  return 0;
}
`,
    tests: raw`const sample = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4, children: [] }] },
    { value: 3, children: [] },
  ],
};
describe("treeDepth", () => {
  it("листок має глибину 1", () => {
    expect(treeDepth({ value: 1, children: [] })).toBe(1);
  });
  it("приклад із трьома рівнями", () => {
    expect(treeDepth(sample)).toBe(3);
  });
  it("довгий ланцюжок", () => {
    let chain = { value: 0, children: [] };
    for (let i = 1; i < 500; i++) chain = { value: i, children: [chain] };
    expect(treeDepth(chain)).toBe(500);
  });
});
describe("countLeaves", () => {
  it("одиночний вузол це листок", () => {
    expect(countLeaves({ value: 1, children: [] })).toBe(1);
  });
  it("приклад: листки 4 і 3", () => {
    expect(countLeaves(sample)).toBe(2);
  });
  it("широке дерево", () => {
    const wide = { value: 0, children: [1, 2, 3, 4].map((v) => ({ value: v, children: [] })) };
    expect(countLeaves(wide)).toBe(4);
    expect(treeDepth(wide)).toBe(2);
  });
});`,
  },
];
