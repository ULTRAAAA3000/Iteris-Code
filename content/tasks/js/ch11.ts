import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_11: readonly JsTask[] = [
  {
    ...base, id: "js-layered-todo", lesson: "js/100", xp: 35,
    title: "Сервіс справ поверх репозиторію",
    context: "Бізнес-правила списку справ мають жити окремо від сховища: сервіс працює лише з методами репозиторію, тому підміна пам'яті на файл чи базу не торкається логіки.",
    brief: [
      "Напишіть <code>createMemoryRepository()</code>: об'єкт із методами <code>all()</code> (масив усіх справ у порядку додавання), <code>find(id)</code> (справа або <code>null</code>), <code>save(item)</code> (зберігає або замінює за <code>item.id</code>, повертає <code>item</code>) і <code>remove(id)</code> (<code>true</code>, якщо було видалено).",
      "Напишіть <code>createTodoService(repository, nextId)</code> із методами <code>add(title)</code> (обрізає пробіли; порожня назва кидає <code>RangeError</code>; повертає збережену справу <code>{ id, title, done: false }</code>, id бере з <code>nextId()</code>), <code>toggle(id)</code> (змінює <code>done</code> і зберігає; якщо немає справи, кидає <code>Error</code> «Справу не знайдено: id»), <code>remove(id)</code> та <code>list(status = \"all\")</code> (<code>\"all\"</code>, <code>\"active\"</code> або <code>\"done\"</code>; інше значення кидає <code>RangeError</code>). Сервіс має використовувати лише методи репозиторію.",
    ],
    starter: raw`function createMemoryRepository() {
  return { all: () => [], find: () => null, save: (item) => item, remove: () => false };
}

function createTodoService(repository, nextId) {
  return {
    add(title) {
      return { id: nextId(), title, done: false };
    },
    toggle(id) {},
    remove(id) {},
    list(status = "all") {
      return [];
    },
  };
}
`,
    tests: raw`function setup() {
  let id = 0;
  const repository = createMemoryRepository();
  const service = createTodoService(repository, () => ++id);
  return { repository, service };
}
describe("createMemoryRepository", () => {
  it("зберігає, знаходить, замінює й видаляє", () => {
    const repo = createMemoryRepository();
    repo.save({ id: 1, title: "a" });
    repo.save({ id: 2, title: "b" });
    repo.save({ id: 1, title: "змінено" });
    expect(repo.all()).toEqual([{ id: 1, title: "змінено" }, { id: 2, title: "b" }]);
    expect(repo.find(2).title).toBe("b");
    expect(repo.find(9)).toBe(null);
    expect(repo.remove(1)).toBe(true);
    expect(repo.remove(1)).toBe(false);
    expect(repo.all().length).toBe(1);
  });
});
describe("createTodoService", () => {
  it("додає справи з обрізаною назвою й ідентифікатором", () => {
    const { service } = setup();
    expect(service.add("  Хліб  ")).toEqual({ id: 1, title: "Хліб", done: false });
    expect(service.add("Молоко").id).toBe(2);
  });
  it("порожня назва: RangeError", () => {
    const { service } = setup();
    expect(() => service.add("   ")).toThrow(RangeError);
    expect(() => service.add("")).toThrow(RangeError);
    expect(service.list().length).toBe(0);
  });
  it("перемикає стан і зберігає", () => {
    const { service, repository } = setup();
    service.add("Хліб");
    expect(service.toggle(1).done).toBe(true);
    expect(repository.find(1).done).toBe(true);
    expect(service.toggle(1).done).toBe(false);
  });
  it("невідома справа", () => {
    const { service } = setup();
    expect(() => service.toggle(99)).toThrow("Справу не знайдено: 99");
  });
  it("фільтри списку", () => {
    const { service } = setup();
    service.add("a");
    service.add("b");
    service.add("c");
    service.toggle(2);
    expect(service.list().map((t) => t.id)).toEqual([1, 2, 3]);
    expect(service.list("done").map((t) => t.id)).toEqual([2]);
    expect(service.list("active").map((t) => t.id)).toEqual([1, 3]);
    expect(() => service.list("інше")).toThrow(RangeError);
  });
  it("видалення", () => {
    const { service } = setup();
    service.add("a");
    expect(service.remove(1)).toBe(true);
    expect(service.list().length).toBe(0);
  });
  it("працює з будь-яким репозиторієм (шпигун)", () => {
    const calls = [];
    const fake = {
      all: () => [{ id: 5, title: "x", done: false }],
      find: (id) => { calls.push("find " + id); return { id, title: "x", done: false }; },
      save: (item) => { calls.push("save " + item.id); return item; },
      remove: () => true,
    };
    const service = createTodoService(fake, () => 7);
    service.toggle(5);
    service.add("новий");
    expect(calls).toEqual(["find 5", "save 5", "save 7"]);
    expect(service.list().length).toBe(1);
  });
});`,
  },
  {
    ...base, id: "js-di-container", lesson: "js/101", xp: 40,
    title: "Контейнер залежностей із виявленням циклів",
    context: "Контейнер створює залежності на вимогу, кешує їх і слідкує, щоб вони не залежали одна від одної по колу. Зрозуміла помилка для циклу набагато краща за нескінченну рекурсію.",
    brief: [
      "Напишіть <code>createContainer()</code> з методами <code>register(name, factory)</code> і <code>resolve(name)</code>. Фабрика викликається з аргументом-контейнером (<code>factory(container)</code>), щоб могла запитувати інші залежності.",
      "<code>resolve</code> створює екземпляр при першому запиті й кешує (наступні виклики повертають той самий об'єкт). Невідома назва кидає <code>Error</code> з повідомленням <code>\"Невідома залежність: назва\"</code>. Циклічна залежність кидає <code>Error</code> <code>\"Циклічна залежність: a -&gt; b -&gt; a\"</code> (шлях через <code>\" -&gt; \"</code>). Після помилки контейнер лишається придатним.",
    ],
    starter: raw`function createContainer() {
  const factories = new Map();
  return {
    register(name, factory) {
      factories.set(name, factory);
    },
    resolve(name) {
      return factories.get(name)(this);
    },
  };
}
`,
    tests: raw`describe("createContainer", () => {
  it("створює залежності й передає контейнер у фабрику", () => {
    const c = createContainer();
    c.register("config", () => ({ port: 80 }));
    c.register("server", (container) => ({ port: container.resolve("config").port }));
    expect(c.resolve("server")).toEqual({ port: 80 });
  });
  it("кешує екземпляри", () => {
    const c = createContainer();
    let created = 0;
    c.register("db", () => ({ n: ++created }));
    const first = c.resolve("db");
    expect(c.resolve("db") === first).toBe(true);
    expect(created).toBe(1);
  });
  it("створює лише те, що запитали", () => {
    const c = createContainer();
    let created = 0;
    c.register("lazy", () => ++created);
    expect(created).toBe(0);
    c.resolve("lazy");
    expect(created).toBe(1);
  });
  it("невідома залежність", () => {
    const c = createContainer();
    expect(() => c.resolve("nothing")).toThrow("Невідома залежність: nothing");
  });
  it("циклічна залежність із шляхом", () => {
    const c = createContainer();
    c.register("a", (x) => x.resolve("b"));
    c.register("b", (x) => x.resolve("c"));
    c.register("c", (x) => x.resolve("a"));
    expect(() => c.resolve("a")).toThrow("Циклічна залежність: a -> b -> c -> a");
  });
  it("самозалежність", () => {
    const c = createContainer();
    c.register("self", (x) => x.resolve("self"));
    expect(() => c.resolve("self")).toThrow("Циклічна залежність: self -> self");
  });
  it("після помилки контейнер працює далі", () => {
    const c = createContainer();
    c.register("a", (x) => x.resolve("b"));
    c.register("b", (x) => x.resolve("a"));
    c.register("ok", () => "fine");
    expect(() => c.resolve("a")).toThrow();
    expect(c.resolve("ok")).toBe("fine");
    expect(() => c.resolve("a")).toThrow("Циклічна залежність: a -> b -> a");
  });
});`,
  },
  {
    ...base, id: "js-event-emitter", lesson: "js/102", xp: 40,
    title: "Власний EventEmitter",
    context: "Видавець подій не знає слухачів: вони підписуються й відписуються самі. Реалізація на Map і масиві дає глибоке розуміння EventEmitter, DOM-подій і підписок у сховищах.",
    brief: [
      "Напишіть клас <code>Emitter</code> з методами: <code>on(name, fn)</code>, <code>off(name, fn)</code>, <code>once(name, fn)</code> (усі три повертають <code>this</code>), <code>emit(name, ...args)</code> та <code>listenerCount(name)</code>.",
      "Слухачі викликаються по черзі підписки з аргументами <code>emit</code>. <code>emit</code> повертає <code>true</code>, якщо були слухачі, інакше <code>false</code>. Слухач-не-функція кидає <code>TypeError</code>. <code>once</code> спрацьовує один раз, а <code>off</code> має знімати й <code>once</code>-слухача за оригінальною функцією. Відписка під час емісії не ламає обхід (працюйте з копією). Подія <code>\"error\"</code> без слухачів кидає переданий аргумент (якщо це <code>Error</code>) або <code>Error</code>.",
    ],
    starter: raw`class Emitter {
  on(name, fn) {
    return this;
  }
  off(name, fn) {
    return this;
  }
  once(name, fn) {
    return this;
  }
  emit(name, ...args) {
    return false;
  }
  listenerCount(name) {
    return 0;
  }
}
`,
    tests: raw`describe("Emitter", () => {
  it("викликає слухачів по порядку з аргументами", () => {
    const e = new Emitter();
    const log = [];
    e.on("order", (id, total) => log.push("a " + id + " " + total));
    e.on("order", (id) => log.push("b " + id));
    expect(e.emit("order", 1, 100)).toBe(true);
    expect(log).toEqual(["a 1 100", "b 1"]);
  });
  it("emit без слухачів повертає false", () => {
    expect(new Emitter().emit("nothing")).toBe(false);
  });
  it("методи ланцюжкові", () => {
    const e = new Emitter();
    const fn = () => {};
    expect(e.on("a", fn)).toBe(e);
    expect(e.once("a", fn)).toBe(e);
    expect(e.off("a", fn)).toBe(e);
  });
  it("once спрацьовує лише раз", () => {
    const e = new Emitter();
    let n = 0;
    e.once("x", () => n++);
    e.emit("x");
    e.emit("x");
    expect(n).toBe(1);
    expect(e.listenerCount("x")).toBe(0);
  });
  it("off відписує звичайних слухачів і once за оригіналом", () => {
    const e = new Emitter();
    let n = 0;
    const fn = () => n++;
    e.on("x", fn);
    e.off("x", fn);
    e.once("y", fn);
    e.off("y", fn);
    e.emit("x");
    e.emit("y");
    expect(n).toBe(0);
  });
  it("listenerCount", () => {
    const e = new Emitter();
    e.on("a", () => {});
    e.on("a", () => {});
    e.on("b", () => {});
    expect(e.listenerCount("a")).toBe(2);
    expect(e.listenerCount("b")).toBe(1);
    expect(e.listenerCount("c")).toBe(0);
  });
  it("відписка під час емісії не пропускає слухачів", () => {
    const e = new Emitter();
    const log = [];
    const first = () => {
      log.push("first");
      e.off("x", first);
    };
    e.on("x", first);
    e.on("x", () => log.push("second"));
    e.emit("x");
    e.emit("x");
    expect(log).toEqual(["first", "second", "second"]);
  });
  it("слухач має бути функцією", () => {
    expect(() => new Emitter().on("x", 5)).toThrow(TypeError);
  });
  it("подія error без слухачів кидає помилку", () => {
    const e = new Emitter();
    const boom = new RangeError("збій");
    let caught;
    try {
      e.emit("error", boom);
    } catch (error) {
      caught = error;
    }
    expect(caught === boom).toBe(true);
    e.on("error", () => {});
    expect(e.emit("error", boom)).toBe(true);
  });
});`,
  },
  {
    ...base, id: "js-store", lesson: "js/103", xp: 45,
    title: "Store: createStore і combineReducers",
    context: "Ядро Redux займає кілька десятків рядків: стан у замиканні, редюсер як чиста функція, підписники й перевірка дій. Написавши його, ви розумієте всі бібліотеки стану.",
    brief: [
      "Напишіть <code>createStore(reducer, initialState)</code>, що повертає <code>{ getState, dispatch, subscribe }</code>. Якщо <code>initialState</code> не передано (<code>undefined</code>), початковий стан обчислюється як <code>reducer(undefined, { type: \"@@init\" })</code>.",
      "<code>dispatch(action)</code> кидає <code>TypeError</code>, якщо дія не об'єкт з рядковим <code>type</code>; кидає <code>Error</code>, якщо редюсер повернув <code>undefined</code>; зберігає новий стан і викликає підписників <b>лише якщо стан змінився</b> (<code>!==</code>); повертає дію. <code>subscribe(fn)</code> повертає функцію відписки; відписка під час розсилки не ламає обхід. Напишіть також <code>combineReducers(map)</code>: повертає редюсер, що веде стан об'єктом за ключами карти й повертає <b>той самий</b> об'єкт, якщо жоден ключ не змінився.",
    ],
    starter: raw`function createStore(reducer, initialState) {
  let state = initialState;
  return {
    getState: () => state,
    dispatch(action) {
      return action;
    },
    subscribe(listener) {
      return () => {};
    },
  };
}

function combineReducers(reducers) {
  return (state = {}, action) => state;
}
`,
    tests: raw`const counter = (state = 0, action) => {
  if (action.type === "inc") return state + 1;
  if (action.type === "add") return state + action.value;
  return state;
};
describe("createStore", () => {
  it("початковий стан", () => {
    expect(createStore(counter, 5).getState()).toBe(5);
    expect(createStore(counter).getState()).toBe(0);
  });
  it("dispatch змінює стан і повертає дію", () => {
    const store = createStore(counter);
    const action = { type: "add", value: 4 };
    expect(store.dispatch(action)).toBe(action);
    expect(store.getState()).toBe(4);
  });
  it("підписники викликаються з новим станом", () => {
    const store = createStore(counter);
    const seen = [];
    store.subscribe((s) => seen.push(s));
    store.dispatch({ type: "inc" });
    store.dispatch({ type: "inc" });
    expect(seen).toEqual([1, 2]);
  });
  it("без змін стану підписники мовчать", () => {
    const store = createStore(counter);
    let calls = 0;
    store.subscribe(() => calls++);
    store.dispatch({ type: "unknown" });
    expect(calls).toBe(0);
  });
  it("відписка", () => {
    const store = createStore(counter);
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.dispatch({ type: "inc" });
    off();
    store.dispatch({ type: "inc" });
    expect(calls).toBe(1);
  });
  it("відписка під час розсилки не пропускає інших підписників", () => {
    const store = createStore(counter);
    const log = [];
    const off = store.subscribe(() => { log.push("a"); off(); });
    store.subscribe(() => log.push("b"));
    store.dispatch({ type: "inc" });
    store.dispatch({ type: "inc" });
    expect(log).toEqual(["a", "b", "b"]);
  });
  it("некоректні дії", () => {
    const store = createStore(counter);
    expect(() => store.dispatch({})).toThrow(TypeError);
    expect(() => store.dispatch(null)).toThrow(TypeError);
    expect(() => store.dispatch({ type: 5 })).toThrow(TypeError);
  });
  it("редюсер не повернув стан", () => {
    const store = createStore(() => undefined, 1);
    expect(() => store.dispatch({ type: "x" })).toThrow(Error);
    expect(store.getState()).toBe(1);
  });
});
describe("combineReducers", () => {
  const name = (state = "", action) => (action.type === "rename" ? action.value : state);
  it("збирає стан за ключами", () => {
    const root = combineReducers({ counter, name });
    let state = root(undefined, { type: "@@init" });
    expect(state).toEqual({ counter: 0, name: "" });
    state = root(state, { type: "inc" });
    state = root(state, { type: "rename", value: "Оля" });
    expect(state).toEqual({ counter: 1, name: "Оля" });
  });
  it("без змін повертає той самий об'єкт", () => {
    const root = combineReducers({ counter, name });
    const state = root(undefined, { type: "@@init" });
    expect(root(state, { type: "nothing" }) === state).toBe(true);
  });
  it("працює разом із store", () => {
    const store = createStore(combineReducers({ counter, name }));
    store.dispatch({ type: "add", value: 3 });
    expect(store.getState()).toEqual({ counter: 3, name: "" });
  });
});`,
  },
  {
    ...base, id: "js-pricing-strategies", lesson: "js/104", xp: 35,
    title: "Реєстр цінових стратегій",
    context: "Правила знижок змінюються частіше за решту коду. Таблиця стратегій дозволяє додавати їх без правок ядра, а перевірка назви захищає від мовчазних помилок.",
    brief: [
      "Напишіть <code>createPricer()</code> з методами <code>register(name, fn)</code> (<code>fn(order)</code> повертає суму), <code>calculate(name, order)</code> та <code>names()</code> (масив зареєстрованих назв). Сума округлюється до двох знаків: <code>Math.round(x * 100) / 100</code>.",
      "Одразу доступні вбудовані стратегії: <code>\"regular\"</code> (<code>price * qty</code>), <code>\"bulk\"</code> (10% знижки, якщо <code>qty</code> не менше за 10) та <code>\"coupon\"</code> (знижка <code>order.percent</code> відсотків; відсоток поза 0–100 кидає <code>RangeError</code>). Невідома назва в <code>calculate</code> кидає <code>RangeError</code> «Невідома стратегія: назва» (назви на кшталт <code>\"constructor\"</code> теж невідомі). <code>register</code> не дозволяє повторно використати існуючу назву: кидає <code>Error</code>.",
    ],
    starter: raw`function createPricer() {
  return {
    register(name, fn) {},
    calculate(name, order) {
      return order.price * order.qty;
    },
    names() {
      return [];
    },
  };
}
`,
    tests: raw`describe("createPricer", () => {
  it("звичайна ціна", () => {
    expect(createPricer().calculate("regular", { price: 100, qty: 2 })).toBe(200);
  });
  it("оптова знижка від 10 одиниць", () => {
    const p = createPricer();
    expect(p.calculate("bulk", { price: 100, qty: 9 })).toBe(900);
    expect(p.calculate("bulk", { price: 100, qty: 10 })).toBe(900);
    expect(p.calculate("bulk", { price: 99.99, qty: 10 })).toBe(899.91);
  });
  it("купон", () => {
    const p = createPricer();
    expect(p.calculate("coupon", { price: 100, qty: 1, percent: 25 })).toBe(75);
    expect(p.calculate("coupon", { price: 10, qty: 3, percent: 0 })).toBe(30);
    expect(() => p.calculate("coupon", { price: 10, qty: 1, percent: 101 })).toThrow(RangeError);
    expect(() => p.calculate("coupon", { price: 10, qty: 1, percent: -5 })).toThrow(RangeError);
  });
  it("власні стратегії", () => {
    const p = createPricer();
    p.register("flat", ({ qty }) => qty * 5);
    expect(p.calculate("flat", { price: 999, qty: 3 })).toBe(15);
    expect(p.names()).toEqual(["regular", "bulk", "coupon", "flat"]);
  });
  it("невідома стратегія", () => {
    const p = createPricer();
    expect(() => p.calculate("black-friday", { price: 1, qty: 1 })).toThrow(RangeError);
    expect(() => p.calculate("black-friday", { price: 1, qty: 1 })).toThrow("Невідома стратегія: black-friday");
    expect(() => p.calculate("constructor", { price: 1, qty: 1 })).toThrow(RangeError);
  });
  it("повторна реєстрація назви заборонена", () => {
    const p = createPricer();
    expect(() => p.register("regular", () => 0)).toThrow(Error);
    p.register("x", () => 1);
    expect(() => p.register("x", () => 2)).toThrow(Error);
  });
  it("реєстри незалежні", () => {
    const a = createPricer();
    const b = createPricer();
    a.register("only-a", () => 1);
    expect(b.names().includes("only-a")).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-feature-flags", lesson: "js/105", xp: 40,
    title: "Шари конфігурації й feature flags",
    context: "Конфігурацію збирають із шарів, а нові функції вмикають поступово для відсотка користувачів. Детермінований хеш гарантує, що один користувач завжди бачить те саме.",
    brief: [
      "Напишіть <code>mergeConfig(...layers)</code>: глибоко зливає об'єкти зліва направо (пізніші перекривають ранні). Вкладені прості об'єкти зливаються за ключами, а масиви та інші значення замінюються цілком. Вхідні об'єкти не змінюються.",
      "Напишіть <code>createFlags(config)</code> з методом <code>isEnabled(name, userId)</code>. Невідомий прапорець або <code>enabled: false</code> дає <code>false</code> (навіть для обраних користувачів). Якщо користувач у списку <code>users</code>, <code>true</code>. Якщо <code>rollout</code> не задано, <code>true</code>. Інакше <code>true</code>, коли <code>bucket &lt; rollout</code>, де <code>bucket</code> це число 0–99: хеш рядка <code>name + \":\" + userId</code>, обчислений як <code>hash = (hash * 31 + код_символу) &gt;&gt;&gt; 0</code> для кожного символу (початок <code>0</code>), далі <code>hash % 100</code>.",
    ],
    starter: raw`function mergeConfig(...layers) {
  return Object.assign({}, ...layers);
}

function createFlags(config) {
  return {
    isEnabled(name, userId) {
      return false;
    },
  };
}
`,
    tests: raw`describe("mergeConfig", () => {
  it("пізніші шари перекривають ранні", () => {
    expect(mergeConfig({ a: 1, b: 2 }, { b: 3 }, { c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
  });
  it("вкладені об'єкти зливаються глибоко", () => {
    const out = mergeConfig({ db: { host: "localhost", pool: 5 }, port: 3000 }, { db: { host: "db.internal" } });
    expect(out).toEqual({ db: { host: "db.internal", pool: 5 }, port: 3000 });
  });
  it("масиви замінюються цілком", () => {
    expect(mergeConfig({ tags: ["a", "b"] }, { tags: ["c"] })).toEqual({ tags: ["c"] });
  });
  it("вхідні об'єкти не змінюються", () => {
    const base = { db: { host: "x" } };
    const out = mergeConfig(base, { db: { host: "y" } });
    expect(base).toEqual({ db: { host: "x" } });
    expect(out.db === base.db).toBe(false);
  });
  it("порожній виклик і примітив поверх об'єкта", () => {
    expect(mergeConfig()).toEqual({});
    expect(mergeConfig({ a: { b: 1 } }, { a: 5 })).toEqual({ a: 5 });
  });
});
describe("createFlags", () => {
  const config = {
    all: { enabled: true },
    off: { enabled: false, users: ["admin"] },
    vip: { enabled: true, rollout: 0, users: ["admin"] },
    none: { enabled: true, rollout: 0 },
    full: { enabled: true, rollout: 100 },
    part: { enabled: true, rollout: 30 },
  };
  const flags = createFlags(config);
  it("простий прапорець і невідомий", () => {
    expect(flags.isEnabled("all", "u1")).toBe(true);
    expect(flags.isEnabled("missing", "u1")).toBe(false);
  });
  it("вимкнений прапорець вимкнений для всіх", () => {
    expect(flags.isEnabled("off", "admin")).toBe(false);
  });
  it("список обраних користувачів", () => {
    expect(flags.isEnabled("vip", "admin")).toBe(true);
    expect(flags.isEnabled("vip", "u1")).toBe(false);
  });
  it("розгортання 0 і 100 відсотків", () => {
    for (let i = 0; i < 50; i++) {
      expect(flags.isEnabled("none", "user" + i)).toBe(false);
      expect(flags.isEnabled("full", "user" + i)).toBe(true);
    }
  });
  it("результат стабільний для того самого користувача", () => {
    for (let i = 0; i < 50; i++) {
      expect(flags.isEnabled("part", "user" + i)).toBe(flags.isEnabled("part", "user" + i));
    }
  });
  it("частка увімкнених близька до відсотка розгортання", () => {
    let enabled = 0;
    for (let i = 0; i < 2000; i++) if (flags.isEnabled("part", "user" + i)) enabled++;
    expect(enabled > 450 && enabled < 750).toBe(true);
  });
  it("відомі значення хешу", () => {
    const probe = createFlags({ x: { enabled: true, rollout: 17 } });
    const results = ["a", "b", "c", "d", "e", "f"].map((id) => probe.isEnabled("x", id));
    expect(results).toEqual([true, true, false, false, false, false]);
  });
});`,
  },
];
