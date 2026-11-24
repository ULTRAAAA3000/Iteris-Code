import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly JsTask[] = [
  {
    ...base, id: "js-parse-quantity", lesson: "js/52", xp: 20,
    title: "Перевірка кількості з різними видами помилок",
    context: "Функція, яка приймає кількість товару, має чітко відрізняти «передали не число» від «число, але недопустиме». Для цього використовують різні види помилок із зрозумілими повідомленнями.",
    brief: [
      "Напишіть <code>parseQuantity(value)</code>, яка повертає <code>value</code>, якщо це ціле число від <code>1</code> до <code>100</code> включно.",
      "Якщо <code>value</code> не є числом (<code>typeof</code>), киньте <code>TypeError</code>. Якщо це число, але воно не ціле, менше за 1, більше за 100 або <code>NaN</code>, киньте <code>RangeError</code>. У повідомленні обох помилок має бути отримане значення.",
    ],
    starter: raw`function parseQuantity(value) {
  return value;
}
`,
    tests: raw`describe("parseQuantity", () => {
  it("коректні значення повертаються", () => {
    expect(parseQuantity(1)).toBe(1);
    expect(parseQuantity(42)).toBe(42);
    expect(parseQuantity(100)).toBe(100);
  });
  it("не число: TypeError", () => {
    expect(() => parseQuantity("5")).toThrow(TypeError);
    expect(() => parseQuantity(null)).toThrow(TypeError);
    expect(() => parseQuantity(undefined)).toThrow(TypeError);
  });
  it("число поза допустимим діапазоном: RangeError", () => {
    expect(() => parseQuantity(0)).toThrow(RangeError);
    expect(() => parseQuantity(-3)).toThrow(RangeError);
    expect(() => parseQuantity(101)).toThrow(RangeError);
  });
  it("дробові й NaN: RangeError", () => {
    expect(() => parseQuantity(2.5)).toThrow(RangeError);
    expect(() => parseQuantity(NaN)).toThrow(RangeError);
  });
  it("повідомлення містить отримане значення", () => {
    expect(() => parseQuantity(101)).toThrow("101");
    expect(() => parseQuantity("abc")).toThrow("abc");
  });
});`,
  },
  {
    ...base, id: "js-validate-age", lesson: "js/53", xp: 30,
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
    ...base, id: "js-custom-errors", lesson: "js/54", xp: 30,
    title: "Власні класи помилок і cause",
    context: "Типізовані помилки дозволяють верхньому рівню відповісти по-різному: підсвітити поле форми, показати 404 чи записати збій у журнал. А поле cause зберігає початкову причину.",
    brief: [
      "Створіть класи <code>ValidationError(field, message)</code> (поле <code>field</code>, <code>name</code> дорівнює <code>\"ValidationError\"</code>) та <code>NotFoundError(resource)</code> (поле <code>resource</code>, <code>name</code> дорівнює <code>\"NotFoundError\"</code>, <code>message</code> це <code>resource + \" не знайдено\"</code>). Обидва успадковують від <code>Error</code>.",
      "Напишіть <code>describeError(error)</code>: для <code>ValidationError</code> повертає <code>\"Поле email: текст\"</code>, для <code>NotFoundError</code> <code>\"Не знайдено: ресурс\"</code>, для іншої <code>Error</code> <code>\"Помилка: текст\"</code>, для будь-чого іншого <code>\"Невідома помилка\"</code>. Напишіть <code>withContext(message, cause)</code>: повертає <code>Error</code> з цим повідомленням і полем <code>cause</code>.",
    ],
    starter: raw`class ValidationError extends Error {}

class NotFoundError extends Error {}

function describeError(error) {
  return "";
}

function withContext(message, cause) {
  return new Error(message);
}
`,
    tests: raw`describe("класи помилок", () => {
  it("ValidationError", () => {
    const e = new ValidationError("email", "Некоректна адреса");
    expect(e instanceof Error).toBe(true);
    expect(e instanceof ValidationError).toBe(true);
    expect(e.name).toBe("ValidationError");
    expect(e.field).toBe("email");
    expect(e.message).toBe("Некоректна адреса");
  });
  it("NotFoundError", () => {
    const e = new NotFoundError("замовлення");
    expect(e instanceof Error).toBe(true);
    expect(e.name).toBe("NotFoundError");
    expect(e.resource).toBe("замовлення");
    expect(e.message).toBe("замовлення не знайдено");
  });
});
describe("describeError", () => {
  it("за видом помилки", () => {
    expect(describeError(new ValidationError("email", "Некоректна адреса"))).toBe("Поле email: Некоректна адреса");
    expect(describeError(new NotFoundError("профіль"))).toBe("Не знайдено: профіль");
    expect(describeError(new TypeError("збій"))).toBe("Помилка: збій");
  });
  it("не помилка", () => {
    expect(describeError("рядок")).toBe("Невідома помилка");
    expect(describeError(null)).toBe("Невідома помилка");
  });
});
describe("withContext", () => {
  it("зберігає причину", () => {
    const original = new Error("ENOENT");
    const wrapped = withContext("Не вдалося завантажити профіль", original);
    expect(wrapped instanceof Error).toBe(true);
    expect(wrapped.message).toBe("Не вдалося завантажити профіль");
    expect(wrapped.cause === original).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-first-success", lesson: "js/55", xp: 30,
    title: "Перше успішне джерело з резервними",
    context: "Дані можна взяти з кешу, основного сервера чи дзеркала. Перебирати джерела по черзі, зупинитись на першому успішному й зібрати всі помилки, якщо не вдалося нічого, є звичайною задачею надійних систем.",
    brief: [
      "Напишіть асинхронну функцію <code>firstSuccess(tasks)</code>. Вона по черзі викликає функції з масиву <code>tasks</code> (кожна повертає проміс або значення) і повертає результат першої, що завершилась успішно. Наступні функції після успіху не викликаються.",
      "Якщо невдалими виявились усі (або масив порожній), функція відхиляється з <code>AggregateError</code>, у <code>errors</code> якого помилки в порядку спроб, а повідомлення <code>\"Усі джерела недоступні\"</code>.",
    ],
    starter: raw`async function firstSuccess(tasks) {
  return tasks[0]();
}
`,
    tests: raw`describe("firstSuccess", () => {
  it("повертає результат першого успішного і не викликає решту", async () => {
    const calls = [];
    const result = await firstSuccess([
      async () => { calls.push("a"); return "перше"; },
      async () => { calls.push("b"); return "друге"; },
    ]);
    expect(result).toBe("перше");
    expect(calls).toEqual(["a"]);
  });
  it("переходить до наступного після збою", async () => {
    const result = await firstSuccess([
      async () => { throw new Error("a"); },
      () => "синхронне значення",
      async () => "не дійде",
    ]);
    expect(result).toBe("синхронне значення");
  });
  it("усі невдалі: AggregateError з усіма помилками по порядку", async () => {
    let caught;
    try {
      await firstSuccess([
        async () => { throw new Error("a"); },
        async () => { throw new TypeError("b"); },
      ]);
    } catch (error) {
      caught = error;
    }
    expect(caught instanceof AggregateError).toBe(true);
    expect(caught.message).toBe("Усі джерела недоступні");
    expect(caught.errors.map((e) => e.message)).toEqual(["a", "b"]);
  });
  it("порожній список", async () => {
    await expect(firstSuccess([])).rejects.toThrow(AggregateError);
  });
});`,
  },
  {
    ...base, id: "js-safe-async", lesson: "js/56", xp: 30,
    title: "Безпечні асинхронні виклики без падіння",
    context: "Пакетна обробка не повинна зупинятися через один невдалий елемент. Обгортка, що перетворює виняток на результат, дозволяє зібрати успіхи й помилки окремо та нічого не втратити.",
    brief: [
      "Напишіть <code>attempt(fn)</code>: асинхронна функція, що викликає <code>fn()</code> (вона може бути синхронною чи асинхронною, кидати помилку чи відхиляти проміс) і повертає <code>{ ok: true, value }</code> або <code>{ ok: false, error }</code>. Сама <code>attempt</code> ніколи не відхиляється.",
      "Напишіть <code>collectResults(items, asyncFn)</code>: послідовно викликає <code>asyncFn(item)</code> для кожного елемента й повертає <code>{ values, errors }</code>, де <code>values</code> це успішні результати за порядком, а <code>errors</code> це масив <code>{ item, error }</code> для невдалих.",
    ],
    starter: raw`async function attempt(fn) {
  return { ok: true, value: await fn() };
}

async function collectResults(items, asyncFn) {
  return { values: [], errors: [] };
}
`,
    tests: raw`describe("attempt", () => {
  it("успіх", async () => {
    expect(await attempt(async () => 5)).toEqual({ ok: true, value: 5 });
    expect(await attempt(() => "синхронно")).toEqual({ ok: true, value: "синхронно" });
  });
  it("відхилений проміс", async () => {
    const result = await attempt(async () => { throw new Error("збій"); });
    expect(result.ok).toBe(false);
    expect(result.error.message).toBe("збій");
  });
  it("синхронний виняток", async () => {
    const result = await attempt(() => { throw new TypeError("синхронний"); });
    expect(result.ok).toBe(false);
    expect(result.error instanceof TypeError).toBe(true);
  });
});
describe("collectResults", () => {
  it("збирає успіхи й помилки окремо", async () => {
    const out = await collectResults([1, 2, 3, 4], async (n) => {
      if (n % 2 === 0) throw new Error("парне " + n);
      return n * 10;
    });
    expect(out.values).toEqual([10, 30]);
    expect(out.errors.map((e) => e.item)).toEqual([2, 4]);
    expect(out.errors[0].error.message).toBe("парне 2");
  });
  it("порожній вхід і виклик по порядку", async () => {
    expect(await collectResults([], async (x) => x)).toEqual({ values: [], errors: [] });
    const order = [];
    await collectResults(["a", "b"], async (x) => { order.push(x); });
    expect(order).toEqual(["a", "b"]);
  });
});`,
  },
  {
    ...base, id: "js-serialize-error", lesson: "js/57", xp: 30,
    title: "Серіалізатор помилок для звітів",
    context: "Системи моніторингу приймають помилки як JSON, а JSON.stringify(error) повертає порожній об'єкт. Універсальний серіалізатор збирає ім'я, повідомлення, стек і ланцюжок причин з будь-якого кинутого значення.",
    brief: [
      "Напишіть <code>serializeError(value)</code>. Для екземпляра <code>Error</code> поверніть об'єкт <code>{ name, message, stack }</code>. Якщо є <code>cause</code>, додайте поле <code>cause</code> з такою ж серіалізацією, а для <code>AggregateError</code> додайте масив <code>errors</code> із серіалізованими помилками.",
      "Для будь-якого значення, що не є <code>Error</code> (рядок, число, <code>null</code>), поверніть <code>{ name: \"NonError\", message: String(value) }</code>. Власні класи помилок мають зберегти своє <code>name</code>.",
    ],
    starter: raw`function serializeError(value) {
  return { name: "Error", message: String(value) };
}
`,
    tests: raw`describe("serializeError", () => {
  it("звичайна помилка", () => {
    const out = serializeError(new TypeError("не той тип"));
    expect(out.name).toBe("TypeError");
    expect(out.message).toBe("не той тип");
    expect(typeof out.stack).toBe("string");
  });
  it("власний клас зберігає ім'я", () => {
    class PaymentError extends Error {
      constructor(message) {
        super(message);
        this.name = "PaymentError";
      }
    }
    expect(serializeError(new PaymentError("відмова")).name).toBe("PaymentError");
  });
  it("не помилка", () => {
    expect(serializeError("просто текст")).toEqual({ name: "NonError", message: "просто текст" });
    expect(serializeError(404)).toEqual({ name: "NonError", message: "404" });
    expect(serializeError(null)).toEqual({ name: "NonError", message: "null" });
  });
  it("ланцюжок cause", () => {
    const e = new Error("зовнішня", { cause: new Error("внутрішня", { cause: "корінь" }) });
    const out = serializeError(e);
    expect(out.cause.message).toBe("внутрішня");
    expect(out.cause.cause).toEqual({ name: "NonError", message: "корінь" });
  });
  it("AggregateError", () => {
    const out = serializeError(new AggregateError([new Error("a"), "b"], "кілька"));
    expect(out.name).toBe("AggregateError");
    expect(out.errors.length).toBe(2);
    expect(out.errors[0].message).toBe("a");
    expect(out.errors[1]).toEqual({ name: "NonError", message: "b" });
  });
  it("без cause поле відсутнє", () => {
    expect("cause" in serializeError(new Error("x"))).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-result-type", lesson: "js/58", xp: 30,
    title: "Тип Result: ok, err і ланцюжки",
    context: "Очікувані помилки зручніше повертати, ніж кидати: тоді виклик змушений перевірити результат. Невеликий набір функцій ok, err, mapResult і unwrapOr дозволяє будувати безпечні конвеєри.",
    brief: [
      "Напишіть <code>ok(value)</code> (повертає <code>{ ok: true, value }</code>), <code>err(error)</code> (повертає <code>{ ok: false, error }</code>), <code>mapResult(result, fn)</code> (для успішного результату застосовує <code>fn</code> до значення й загортає в <code>ok</code>, збійний повертає без змін) і <code>unwrapOr(result, fallback)</code> (значення або запасне).",
      "Напишіть <code>parseJsonResult(text)</code>: повертає <code>ok(розібраний_об'єкт)</code> або <code>err(повідомлення_помилки)</code>, де повідомлення це рядок <code>error.message</code>. Функція не кидає винятків.",
    ],
    starter: raw`const ok = (value) => value;
const err = (error) => error;

function mapResult(result, fn) {
  return result;
}

function unwrapOr(result, fallback) {
  return fallback;
}

function parseJsonResult(text) {
  return JSON.parse(text);
}
`,
    tests: raw`describe("ok і err", () => {
  it("форма результатів", () => {
    expect(ok(5)).toEqual({ ok: true, value: 5 });
    expect(err("збій")).toEqual({ ok: false, error: "збій" });
  });
});
describe("mapResult", () => {
  it("застосовує функцію до успіху", () => {
    expect(mapResult(ok(2), (n) => n * 10)).toEqual({ ok: true, value: 20 });
  });
  it("збійний результат проходить без змін", () => {
    const failed = err("збій");
    let called = false;
    const out = mapResult(failed, () => { called = true; });
    expect(out).toEqual({ ok: false, error: "збій" });
    expect(called).toBe(false);
  });
});
describe("unwrapOr", () => {
  it("значення або запасне", () => {
    expect(unwrapOr(ok(7), 0)).toBe(7);
    expect(unwrapOr(err("x"), 0)).toBe(0);
    expect(unwrapOr(ok(undefined), "запас")).toBe(undefined);
  });
});
describe("parseJsonResult", () => {
  it("коректний JSON", () => {
    expect(parseJsonResult('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
  });
  it("некоректний JSON не кидає виняток", () => {
    const result = parseJsonResult("{ погано");
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe("string");
  });
  it("працює в ланцюжку", () => {
    const name = mapResult(parseJsonResult('{"user":"Оля"}'), (d) => d.user.toUpperCase());
    expect(unwrapOr(name, "?")).toBe("ОЛЯ");
    expect(unwrapOr(mapResult(parseJsonResult("не json"), (d) => d.user), "?")).toBe("?");
  });
});`,
  },
];
