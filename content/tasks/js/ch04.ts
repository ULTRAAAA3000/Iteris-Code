import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly JsTask[] = [
  {
    ...base, id: "js-calculator", lesson: "js/31", xp: 20,
    title: "Калькулятор із ланцюжком методів",
    context: "Бібліотеки запитів і будівники налаштувань дозволяють з'єднувати виклики в ланцюжок, бо кожен метод повертає сам об'єкт. Ланцюжок читається як речення й не потребує проміжних змінних.",
    brief: [
      "Напишіть функцію <code>createCalculator(start = 0)</code>, що повертає об'єкт із методами <code>add(n)</code>, <code>subtract(n)</code>, <code>multiply(n)</code> і <code>result()</code>.",
      "Перші три методи змінюють накопичене значення й повертають <code>this</code>, щоб можна було писати <code>calc.add(5).multiply(2)</code>. Метод <code>result()</code> повертає поточне число. Кожен калькулятор має власний стан.",
    ],
    starter: raw`function createCalculator(start = 0) {
  return {
    value: start,
    add(n) {
      this.value += n;
    },
    result() {
      return this.value;
    },
  };
}
`,
    tests: raw`describe("createCalculator", () => {
  it("початкове значення", () => {
    expect(createCalculator().result()).toBe(0);
    expect(createCalculator(10).result()).toBe(10);
  });
  it("ланцюжок викликів", () => {
    expect(createCalculator().add(5).multiply(2).subtract(3).result()).toBe(7);
  });
  it("методи повертають той самий об'єкт", () => {
    const calc = createCalculator(1);
    expect(calc.add(1)).toBe(calc);
    expect(calc.multiply(3)).toBe(calc);
    expect(calc.subtract(1)).toBe(calc);
  });
  it("калькулятори незалежні", () => {
    const a = createCalculator(1);
    const b = createCalculator(100);
    a.add(1);
    expect(a.result()).toBe(2);
    expect(b.result()).toBe(100);
  });
});`,
  },
  {
    ...base, id: "js-proto-chain", lesson: "js/32", xp: 25,
    title: "Довжина ланцюжка прототипів",
    context: "Щоб розібратися, звідки в об'єкта береться метод, треба пройти його ланцюжок прототипів до кінця. Саме це роблять інструменти налагодження, показуючи розділ Prototype.",
    brief: [
      "Напишіть <code>chainLength(obj)</code>: скільки прототипів у ланцюжку об'єкта до <code>null</code>. Для <code>{}</code> це <code>1</code> (лише <code>Object.prototype</code>), для масиву <code>2</code>, для <code>Object.create(null)</code> це <code>0</code>.",
      "Напишіть <code>hasInherited(obj, key)</code>: <code>true</code>, якщо властивість <code>key</code> доступна через ланцюжок, але <b>не є власною</b> властивістю об'єкта.",
    ],
    starter: raw`function chainLength(obj) {
  return 0;
}

function hasInherited(obj, key) {
  return false;
}
`,
    tests: raw`describe("chainLength", () => {
  it("звичайний об'єкт", () => {
    expect(chainLength({})).toBe(1);
  });
  it("масив має два прототипи", () => {
    expect(chainLength([])).toBe(2);
  });
  it("об'єкт без прототипу", () => {
    expect(chainLength(Object.create(null))).toBe(0);
  });
  it("власний ланцюжок", () => {
    const a = {};
    const b = Object.create(a);
    const c = Object.create(b);
    expect(chainLength(c)).toBe(3);
  });
});
describe("hasInherited", () => {
  it("успадкована властивість", () => {
    const base = { eats: true };
    const dog = Object.create(base);
    dog.name = "Рекс";
    expect(hasInherited(dog, "eats")).toBe(true);
  });
  it("власна властивість не вважається успадкованою", () => {
    const dog = Object.create({ eats: true });
    dog.name = "Рекс";
    expect(hasInherited(dog, "name")).toBe(false);
  });
  it("немає такої властивості", () => {
    expect(hasInherited({}, "nothing")).toBe(false);
    expect(hasInherited({}, "toString")).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-stack-class", lesson: "js/33", xp: 30,
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
    ...base, id: "js-bank-account", lesson: "js/34", xp: 30,
    title: "Банківський рахунок із приватним балансом",
    context: "Гроші на рахунку не повинні змінюватися в обхід правил: баланс ховають усередині об'єкта, а змінюють лише методами, які перевіряють суму. Статичний лічильник показує, скільки рахунків створено.",
    brief: [
      "Напишіть клас <code>Account</code> з приватним полем <code>#balance</code> (початково <code>0</code>), методами <code>deposit(n)</code>, <code>withdraw(n)</code> і <code>getBalance()</code>.",
      "<code>deposit</code> і <code>withdraw</code> кидають <code>RangeError</code> для суми, що не є додатним числом. <code>withdraw</code> кидає звичайну <code>Error</code>, якщо коштів не вистачає. Обидва методи повертають <code>this</code>. Статичне поле <code>Account.count</code> збільшується на кожен створений рахунок.",
    ],
    starter: raw`class Account {
  balance = 0;
  deposit(n) {
    this.balance += n;
  }
  getBalance() {
    return this.balance;
  }
}
`,
    tests: raw`describe("Account", () => {
  it("поповнення й зняття", () => {
    const acc = new Account();
    acc.deposit(100);
    acc.withdraw(30);
    expect(acc.getBalance()).toBe(70);
  });
  it("методи повертають this", () => {
    const acc = new Account();
    expect(acc.deposit(10).withdraw(5).getBalance()).toBe(5);
  });
  it("некоректна сума: RangeError", () => {
    const acc = new Account();
    expect(() => acc.deposit(0)).toThrow(RangeError);
    expect(() => acc.deposit(-5)).toThrow(RangeError);
    expect(() => acc.withdraw("10")).toThrow(RangeError);
  });
  it("недостатньо коштів", () => {
    const acc = new Account();
    acc.deposit(10);
    expect(() => acc.withdraw(50)).toThrow("Недостатньо коштів");
    expect(acc.getBalance()).toBe(10);
  });
  it("баланс прихований", () => {
    const acc = new Account();
    acc.deposit(10);
    expect(acc.balance).toBe(undefined);
    expect(Object.keys(acc)).toEqual([]);
  });
  it("статичний лічильник рахунків", () => {
    const before = Account.count;
    new Account();
    new Account();
    expect(Account.count).toBe(before + 2);
  });
});`,
  },
  {
    ...base, id: "js-shapes", lesson: "js/35", xp: 30,
    title: "Фігури: наслідування й поліморфізм",
    context: "Коли різні типи об'єктів мають спільний інтерфейс, код працює з ними однаково: порахувати загальну площу можна одним циклом, не знаючи, які саме це фігури.",
    brief: [
      "Базовий клас <code>Shape</code> уже написаний: він зберігає <code>name</code>, а метод <code>describe()</code> використовує <code>this.area()</code>. Створіть нащадків <code>Rectangle(w, h)</code> з назвою <code>\"прямокутник\"</code> та <code>Circle(r)</code> з назвою <code>\"коло\"</code>, у кожного реалізуйте <code>area()</code>.",
      "Також напишіть <code>totalArea(shapes)</code>, що повертає суму площ масиву фігур. Конструктори нащадків мають викликати <code>super</code>.",
    ],
    starter: raw`class Shape {
  constructor(name) {
    this.name = name;
  }
  area() {
    throw new Error("не реалізовано");
  }
  describe() {
    return this.name + ": " + this.area().toFixed(2);
  }
}

function totalArea(shapes) {
  return 0;
}
`,
    tests: raw`describe("Rectangle", () => {
  it("площа й опис", () => {
    const r = new Rectangle(2, 3);
    expect(r.area()).toBe(6);
    expect(r.describe()).toBe("прямокутник: 6.00");
  });
  it("є різновидом Shape", () => {
    expect(new Rectangle(1, 1) instanceof Shape).toBe(true);
  });
});
describe("Circle", () => {
  it("площа й опис", () => {
    const c = new Circle(1);
    expect(c.area()).toBeCloseTo(Math.PI, 5);
    expect(c.describe()).toBe("коло: 3.14");
  });
  it("є різновидом Shape", () => {
    expect(new Circle(2) instanceof Shape).toBe(true);
  });
});
describe("totalArea", () => {
  it("сума площ різних фігур", () => {
    expect(totalArea([new Rectangle(2, 3), new Rectangle(1, 4)])).toBe(10);
    expect(totalArea([new Rectangle(1, 1), new Circle(1)])).toBeCloseTo(1 + Math.PI, 5);
  });
  it("порожній список", () => {
    expect(totalArea([])).toBe(0);
  });
});`,
  },
  {
    ...base, id: "js-temperature", lesson: "js/36", xp: 25,
    title: "Температура: геттери й сеттери",
    context: "Одну й ту саму величину часто подають у різних одиницях. Геттери й сеттери дозволяють тримати одне джерело правди та перераховувати решту на льоту, перевіряючи допустимі межі.",
    brief: [
      "Напишіть клас <code>Temperature</code>. Конструктор приймає градуси за Цельсієм. Приватне поле зберігає значення, а доступ відкритий через властивості <code>celsius</code> і <code>fahrenheit</code> (геттер і сеттер для кожної).",
      "Формула: <code>F = C * 9 / 5 + 32</code>. Значення нижче абсолютного нуля (<code>-273.15</code> °C) не допускаються: і в конструкторі, і в сеттерах кидайте <code>RangeError</code>.",
    ],
    starter: raw`class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }
}
`,
    tests: raw`describe("Temperature", () => {
  it("читає Цельсій і Фаренгейт", () => {
    const t = new Temperature(25);
    expect(t.celsius).toBe(25);
    expect(t.fahrenheit).toBe(77);
  });
  it("запис у Фаренгейтах змінює Цельсій", () => {
    const t = new Temperature(0);
    t.fahrenheit = 212;
    expect(t.celsius).toBe(100);
    t.fahrenheit = 32;
    expect(t.celsius).toBe(0);
  });
  it("запис у Цельсіях", () => {
    const t = new Temperature(0);
    t.celsius = -40;
    expect(t.fahrenheit).toBe(-40);
  });
  it("нижче абсолютного нуля: RangeError", () => {
    expect(() => new Temperature(-300)).toThrow(RangeError);
    const t = new Temperature(10);
    expect(() => { t.celsius = -273.16; }).toThrow(RangeError);
    expect(() => { t.fahrenheit = -500; }).toThrow(RangeError);
    expect(t.celsius).toBe(10);
  });
  it("значення не видно як звичайне поле", () => {
    expect(Object.keys(new Temperature(5))).toEqual([]);
  });
});`,
  },
  {
    ...base, id: "js-deep-equal", lesson: "js/37", xp: 35,
    title: "Глибоке порівняння значень",
    context: "Оператор === порівнює об'єкти за посиланням, а тестам, кешам і перевіркам змін потрібне порівняння за змістом. Бібліотеки на кшталт lodash мають для цього isEqual, а тут ви напишете її самі.",
    brief: [
      "Напишіть <code>deepEqual(a, b)</code>: повертає <code>true</code>, якщо значення збігаються за змістом. Примітиви порівнюються як у <code>Object.is</code> (тобто <code>NaN</code> рівне <code>NaN</code>), масиви й прості об'єкти порівнюються рекурсивно, поле за полем, а дати за моментом часу.",
      "Масив і об'єкт ніколи не рівні між собою. Об'єкти з різною кількістю ключів не рівні. Порядок ключів неважливий.",
    ],
    starter: raw`function deepEqual(a, b) {
  return a === b;
}
`,
    tests: raw`describe("deepEqual", () => {
  it("примітиви", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual(1, "1")).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
  });
  it("прості об'єкти й порядок ключів", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });
  it("вкладені структури", () => {
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false);
  });
  it("масиви", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([], {})).toBe(false);
  });
  it("дати за моментом часу", () => {
    expect(deepEqual(new Date(5), new Date(5))).toBe(true);
    expect(deepEqual(new Date(5), new Date(6))).toBe(false);
  });
  it("null не плутається з об'єктом", () => {
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-counter-factory", lesson: "js/38", xp: 25,
    title: "Фабрика лічильника з історією",
    context: "Фабрична функція ховає стан у замиканні й віддає назовні тільки потрібні операції. Додана історія змін показує, чому наружу варто віддавати копію, а не внутрішній масив.",
    brief: [
      "Напишіть фабрику <code>createCounter(start = 0)</code>, що повертає об'єкт із методами <code>inc()</code>, <code>dec()</code>, <code>value()</code> та <code>history()</code>. Використовуйте змінні всередині функції, а не класи.",
      "<code>inc()</code> і <code>dec()</code> змінюють значення на 1 і повертають нове значення. <code>history()</code> повертає масив усіх значень лічильника після змін у порядку їх виникнення (початкове значення не входить). Змінення повернутого масиву не повинно впливати на лічильник.",
    ],
    starter: raw`function createCounter(start = 0) {
  return {
    inc() {
      return start;
    },
  };
}
`,
    tests: raw`describe("createCounter", () => {
  it("лічить вгору й вниз", () => {
    const c = createCounter();
    expect(c.inc()).toBe(1);
    expect(c.inc()).toBe(2);
    expect(c.dec()).toBe(1);
    expect(c.value()).toBe(1);
  });
  it("початкове значення", () => {
    const c = createCounter(10);
    expect(c.value()).toBe(10);
    expect(c.dec()).toBe(9);
  });
  it("історія значень після змін", () => {
    const c = createCounter(5);
    c.inc();
    c.inc();
    c.dec();
    expect(c.history()).toEqual([6, 7, 6]);
  });
  it("історія повертається копією", () => {
    const c = createCounter();
    c.inc();
    const h = c.history();
    h.push(999);
    expect(c.history()).toEqual([1]);
  });
  it("лічильники незалежні, а стан прихований", () => {
    const a = createCounter();
    const b = createCounter();
    a.inc();
    expect(b.value()).toBe(0);
    expect(Object.keys(a).sort()).toEqual(["dec", "history", "inc", "value"]);
  });
});`,
  },
  {
    ...base, id: "js-lru-cache", lesson: "js/39", xp: 35,
    title: "Кеш LRU з обмеженим розміром",
    context: "Кеш без меж непомітно з'їдає пам'ять. LRU-кеш тримає лише певну кількість записів і першими викидає ті, до яких довго не зверталися. Так працюють кеші браузерів, баз даних і CDN.",
    brief: [
      "Напишіть клас <code>LRUCache</code>. Конструктор приймає <code>limit</code> (максимум записів). Методи: <code>get(key)</code> повертає значення або <code>undefined</code> і робить запис «свіжим»; <code>set(key, value)</code> додає або оновлює запис; властивість <code>size</code> повертає кількість записів.",
      "Коли записів стає більше за <code>limit</code>, видаляється запис, до якого зверталися (читали чи записували) найдавніше. Підказка: <code>Map</code> зберігає порядок вставки, а перший ключ дає <code>map.keys().next().value</code>.",
    ],
    starter: raw`class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    return this.map.get(key);
  }
  set(key, value) {
    this.map.set(key, value);
  }
  get size() {
    return this.map.size;
  }
}
`,
    tests: raw`describe("LRUCache", () => {
  it("зберігає й повертає значення", () => {
    const cache = new LRUCache(2);
    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("none")).toBe(undefined);
    expect(cache.size).toBe(1);
  });
  it("викидає найдавніший запис при переповненні", () => {
    const cache = new LRUCache(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.get("a")).toBe(undefined);
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
    expect(cache.size).toBe(2);
  });
  it("читання робить запис свіжим", () => {
    const cache = new LRUCache(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a");
    cache.set("c", 3);
    expect(cache.get("b")).toBe(undefined);
    expect(cache.get("a")).toBe(1);
  });
  it("оновлення існуючого ключа не збільшує розмір", () => {
    const cache = new LRUCache(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 10);
    cache.set("c", 3);
    expect(cache.get("a")).toBe(10);
    expect(cache.get("b")).toBe(undefined);
    expect(cache.size).toBe(2);
  });
});`,
  },
];
