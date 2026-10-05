import type { Task } from "./types.ts";

export type { Task };

export const TASKS: readonly Task[] = [
  {
    id: "js-safe-city",
    lesson: "js/3",
    course: "js",
    title: "Безпечне читання міста",
    premium: false,
    xp: 20,
    context:
      "Дані користувачів із сервера майже завжди неповні: адреса може бути null, а місто — порожнім рядком. Падіння на таких даних — одна з найчастіших причин помилок у продакшені.",
    brief: [
      "Напишіть функцію <code>getCity(user)</code>, що повертає місто користувача (<code>user.address.city</code>).",
      "Якщо користувача, адреси чи міста немає, або місто порожнє, поверніть рядок «Невідомо». Функція не повинна кидати помилку.",
    ],
    starter: `function getCity(user) {
  return user.address.city;
}
`,
    tests: `describe("getCity", () => {
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
    id: "js-counter-bug",
    lesson: "js/12",
    course: "js",
    title: "Налагодження: лічильники плутаються",
    premium: false,
    xp: 30,
    context:
      "Спільний стан, випадково винесений за межі функції, — класичний баг: два незалежні елементи інтерфейсу раптом починають змінювати одне й те саме значення. Знайти таке без розуміння замикань важко.",
    brief: [
      "Функція <code>makeCounter()</code> має створювати незалежні лічильники, але два лічильники зараз «ділять» одне число. Знайдіть причину й виправте.",
      "Також додайте метод <code>reset()</code>, що обнуляє лічильник. Метод <code>inc()</code> повертає нове значення.",
    ],
    starter: `let count = 0;

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
    tests: `describe("makeCounter", () => {
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
    id: "js-cart-total",
    lesson: "js/8",
    course: "js",
    title: "Сума кошика",
    premium: true,
    xp: 30,
    context:
      "Розрахунок суми замовлення — серце будь-якого інтернет-магазину. Помилка в копійках чи в обробці порожнього кошика коштує реальних грошей і довіри клієнтів.",
    brief: [
      "Напишіть <code>calculateTotal(items)</code>: сума <code>price × qty</code> лише для товарів, що є в наявності (<code>inStock !== false</code>).",
      "Якщо <code>qty</code> не вказано, вважайте його рівним 1. Порожній кошик дає 0. Результат округліть до 2 знаків: <code>0.1 + 0.2</code> має давати <code>0.3</code>. Вхідний масив змінювати не можна.",
    ],
    starter: `function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return total;
}
`,
    tests: `describe("calculateTotal", () => {
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
    id: "js-group-by",
    lesson: "js/9",
    course: "js",
    title: "Групування записів",
    premium: true,
    xp: 30,
    context:
      "Групування списку за полем — щоденна задача: замовлення за статусом, користувачі за містом, події за днем. Ця функція зустрічається майже в кожному звіті та дашборді.",
    brief: [
      "Напишіть <code>groupBy(list, key)</code>, що повертає об'єкт, де ключ — значення поля <code>key</code>, а значення — масив елементів із цим полем.",
      "Порядок елементів у групах зберігається. Елементи без цього поля пропускаються. Для порожнього списку результат — порожній об'єкт. Вхідні дані не змінюються.",
    ],
    starter: `function groupBy(list, key) {
  return {};
}
`,
    tests: `describe("groupBy", () => {
  const orders = [
    { id: 1, status: "new" },
    { id: 2, status: "paid" },
    { id: 3, status: "new" },
  ];
  it("групує за полем", () => {
    expect(groupBy(orders, "status")).toEqual({
      new: [{ id: 1, status: "new" }, { id: 3, status: "new" }],
      paid: [{ id: 2, status: "paid" }],
    });
  });
  it("зберігає порядок у групах", () => {
    expect(groupBy(orders, "status").new.map((o) => o.id)).toEqual([1, 3]);
  });
  it("пропускає елементи без поля", () => {
    expect(groupBy([{ id: 1 }, { id: 2, status: "x" }], "status")).toEqual({ x: [{ id: 2, status: "x" }] });
  });
  it("порожній список", () => {
    expect(groupBy([], "status")).toEqual({});
  });
  it("не змінює вхідні дані", () => {
    const copy = JSON.parse(JSON.stringify(orders));
    groupBy(orders, "status");
    expect(orders).toEqual(copy);
  });
});`,
  },
  {
    id: "js-retry",
    lesson: "js/20",
    course: "js",
    title: "Повтор запиту при збої",
    premium: true,
    xp: 40,
    context:
      "Мережа ненадійна: запит до API іноді падає через тимчасовий збій. У справжніх проєктах невдалі запити повторюють кілька разів, перш ніж показати користувачу помилку.",
    brief: [
      "Напишіть асинхронну функцію <code>retry(fn, attempts)</code>: викликає <code>fn</code> до <code>attempts</code> разів, поки вона не виконається успішно, і повертає її результат.",
      "Якщо всі спроби невдалі, кинути останню помилку. Якщо <code>attempts</code> не ціле число ≥ 1, кинути <code>RangeError</code>.",
    ],
    starter: `async function retry(fn, attempts) {
  return fn();
}
`,
    tests: `describe("retry", () => {
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
];

export const taskById = (id: string): Task | undefined => TASKS.find((t) => t.id === id);
export const taskForLesson = (lessonId: string): Task | undefined => TASKS.find((t) => t.lesson === lessonId);
