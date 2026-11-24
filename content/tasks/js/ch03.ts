import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03: readonly JsTask[] = [
  {
    ...base, id: "js-array-rotate", lesson: "js/19", xp: 20,
    title: "Циклічний зсув масиву",
    context: "Карусель зображень, черга по колу, розклад із зсувом по днях: усе це обертання списку. Щоб не зіпсувати вхідні дані, зсув повертає новий масив і не змінює початковий.",
    brief: [
      "Напишіть <code>rotate(arr, k)</code>: повертає <b>новий</b> масив, зсунутий циклічно вліво на <code>k</code> позицій. Для <code>rotate([1, 2, 3, 4], 1)</code> результат <code>[2, 3, 4, 1]</code>.",
      "<code>k</code> може бути більше за довжину масиву, нульовим або від'ємним (від'ємне зсуває вправо). Порожній масив дає порожній масив. Вхідний масив змінювати не можна.",
    ],
    starter: raw`function rotate(arr, k) {
  return arr;
}
`,
    tests: raw`describe("rotate", () => {
  it("зсув вліво на одну позицію", () => {
    expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1]);
  });
  it("нуль і повний круг", () => {
    expect(rotate([1, 2, 3, 4], 0)).toEqual([1, 2, 3, 4]);
    expect(rotate([1, 2, 3, 4], 4)).toEqual([1, 2, 3, 4]);
  });
  it("k більше за довжину", () => {
    expect(rotate([1, 2, 3, 4], 6)).toEqual([3, 4, 1, 2]);
  });
  it("від'ємне k зсуває вправо", () => {
    expect(rotate([1, 2, 3, 4], -1)).toEqual([4, 1, 2, 3]);
  });
  it("порожній масив", () => {
    expect(rotate([], 3)).toEqual([]);
  });
  it("вхідний масив не змінюється", () => {
    const src = [1, 2, 3];
    const out = rotate(src, 1);
    expect(src).toEqual([1, 2, 3]);
    expect(out === src).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-chunk-unique", lesson: "js/20", xp: 25,
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
    ...base, id: "js-adult-names", lesson: "js/21", xp: 20,
    title: "Відбір дорослих і пошук за id",
    context: "Відібрати з відповіді сервера потрібних людей і знайти одну за ідентифікатором — найпоширеніша робота зі списками. Метод filter із map і метод find роблять це в один рядок.",
    brief: [
      "Напишіть <code>adultNames(users)</code>: повертає масив імен користувачів, яким 18 років або більше, у початковому порядку. Користувач має вигляд <code>{ id, name, age }</code>.",
      "Напишіть <code>findById(users, id)</code>: повертає знайденого користувача або <code>null</code> (не <code>undefined</code>), якщо такого немає. Цикли використовувати не обов'язково.",
    ],
    starter: raw`function adultNames(users) {
  return [];
}

function findById(users, id) {
  return undefined;
}
`,
    tests: raw`const users = [
  { id: 1, name: "Оля", age: 17 },
  { id: 2, name: "Іван", age: 18 },
  { id: 3, name: "Марія", age: 31 },
];
describe("adultNames", () => {
  it("лише повнолітні, у вихідному порядку", () => {
    expect(adultNames(users)).toEqual(["Іван", "Марія"]);
  });
  it("порожній результат", () => {
    expect(adultNames([{ id: 9, name: "Дитина", age: 5 }])).toEqual([]);
    expect(adultNames([])).toEqual([]);
  });
  it("не змінює вхідний масив", () => {
    adultNames(users);
    expect(users).toHaveLength(3);
  });
});
describe("findById", () => {
  it("знаходить користувача", () => {
    expect(findById(users, 3).name).toBe("Марія");
  });
  it("не знайдено: null", () => {
    expect(findById(users, 99)).toBe(null);
    expect(findById([], 1)).toBe(null);
  });
});`,
  },
  {
    ...base, id: "js-order-stats", lesson: "js/22", xp: 25,
    title: "Підсумок замовлення через reduce і some",
    context: "Сума кошика, кількість одиниць товару, прапорець «є безкоштовна позиція»: типовий підсумок замовлення, який збирають одним проходом згортки та логічними запитами до списку.",
    brief: [
      "Напишіть <code>orderStats(items)</code>. Елемент має вигляд <code>{ name, price, qty }</code> (ціна й кількість цілі). Функція повертає об'єкт <code>{ total, count, hasFree }</code>.",
      "<code>total</code> це сума <code>price * qty</code>, <code>count</code> це сума всіх <code>qty</code>, <code>hasFree</code> це <code>true</code>, якщо є позиція з ціною <code>0</code>. Для порожнього списку: <code>{ total: 0, count: 0, hasFree: false }</code>.",
    ],
    starter: raw`function orderStats(items) {
  return { total: 0, count: 0, hasFree: false };
}
`,
    tests: raw`describe("orderStats", () => {
  it("рахує суму й кількість", () => {
    const items = [
      { name: "хліб", price: 30, qty: 2 },
      { name: "молоко", price: 45, qty: 3 },
    ];
    expect(orderStats(items)).toEqual({ total: 195, count: 5, hasFree: false });
  });
  it("помічає безкоштовну позицію", () => {
    const items = [
      { name: "подарунок", price: 0, qty: 1 },
      { name: "кава", price: 80, qty: 1 },
    ];
    expect(orderStats(items)).toEqual({ total: 80, count: 2, hasFree: true });
  });
  it("порожній список", () => {
    expect(orderStats([])).toEqual({ total: 0, count: 0, hasFree: false });
  });
  it("не змінює вхідні дані", () => {
    const items = [{ name: "a", price: 1, qty: 1 }];
    orderStats(items);
    expect(items).toEqual([{ name: "a", price: 1, qty: 1 }]);
  });
});`,
  },
  {
    ...base, id: "js-pick-omit", lesson: "js/23", xp: 25,
    title: "pick і omit для об'єктів",
    context: "Перед відправкою на сервер з об'єкта залишають дозволені поля, а перед показом прибирають службові, наприклад пароль. Саме для цього пишуть пару функцій pick і omit.",
    brief: [
      "Напишіть <code>pick(obj, keys)</code>: новий об'єкт лише з указаними ключами. Ключі, яких у <code>obj</code> немає, пропускаються (не створюйте поля зі значенням <code>undefined</code>).",
      "Напишіть <code>omit(obj, keys)</code>: новий об'єкт без указаних ключів. Вхідний об'єкт обидві функції змінювати не повинні. Підказка: <code>Object.entries</code> та <code>Object.fromEntries</code>.",
    ],
    starter: raw`function pick(obj, keys) {
  return obj;
}

function omit(obj, keys) {
  return obj;
}
`,
    tests: raw`const user = { id: 1, name: "Оля", password: "secret", age: 17 };
describe("pick", () => {
  it("залишає вказані ключі", () => {
    expect(pick(user, ["id", "name"])).toEqual({ id: 1, name: "Оля" });
  });
  it("відсутні ключі пропускаються", () => {
    expect(pick(user, ["name", "email"])).toEqual({ name: "Оля" });
    expect("email" in pick(user, ["email"])).toBe(false);
  });
  it("повертає новий об'єкт", () => {
    const out = pick(user, ["id"]);
    expect(out === user).toBe(false);
  });
});
describe("omit", () => {
  it("прибирає вказані ключі", () => {
    expect(omit(user, ["password"])).toEqual({ id: 1, name: "Оля", age: 17 });
  });
  it("зайві ключі ігноруються", () => {
    expect(omit(user, ["nothing"])).toEqual(user);
  });
  it("не змінює вхідний об'єкт", () => {
    omit(user, ["password", "age"]);
    expect(Object.keys(user)).toEqual(["id", "name", "password", "age"]);
  });
});`,
  },
  {
    ...base, id: "js-immutable-update", lesson: "js/24", xp: 25,
    title: "Незмінне оновлення вкладених даних",
    context: "У стані інтерфейсу дані не змінюють на місці: створюють нову версію, а незмінені частини лишають спільними. Так легко зрозуміти, що змінилося, і не зламати те, що вам не належить.",
    brief: [
      "Напишіть <code>updateCity(user, city)</code>: повертає нового користувача, у якого <code>address.city</code> дорівнює <code>city</code>. Решта полів, зокрема <code>address.street</code> і <code>tags</code>, лишаються. Початковий об'єкт і його <code>address</code> змінювати не можна.",
      "Напишіть <code>addItem(list, item)</code>: повертає новий масив з доданим наприкінці елементом. Початковий масив не змінюється.",
    ],
    starter: raw`function updateCity(user, city) {
  user.address.city = city;
  return user;
}

function addItem(list, item) {
  list.push(item);
  return list;
}
`,
    tests: raw`describe("updateCity", () => {
  const make = () => ({ name: "Оля", address: { city: "Дніпро", street: "Центральна" }, tags: ["a"] });
  it("повертає користувача з новим містом", () => {
    expect(updateCity(make(), "Львів")).toEqual({ name: "Оля", address: { city: "Львів", street: "Центральна" }, tags: ["a"] });
  });
  it("не змінює оригінал", () => {
    const user = make();
    updateCity(user, "Львів");
    expect(user.address.city).toBe("Дніпро");
  });
  it("створює новий об'єкт і новий address, а tags лишає спільним", () => {
    const user = make();
    const next = updateCity(user, "Львів");
    expect(next === user).toBe(false);
    expect(next.address === user.address).toBe(false);
    expect(next.tags === user.tags).toBe(true);
  });
});
describe("addItem", () => {
  it("додає в кінець нового масиву", () => {
    expect(addItem([1, 2], 3)).toEqual([1, 2, 3]);
  });
  it("не змінює оригінал", () => {
    const list = [1];
    const next = addItem(list, 2);
    expect(list).toEqual([1]);
    expect(next === list).toBe(false);
  });
});`,
  },
  {
    ...base, id: "js-word-map", lesson: "js/25", xp: 25,
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
    ...base, id: "js-sort-people", lesson: "js/26", xp: 25,
    title: "Сортування людей за кількома критеріями",
    context: "Рейтинги й таблиці майже завжди сортують за кількома ключами: спершу за балами, потім за іменем. Українські імена правильно порівнюються лише з урахуванням мови, а не за кодами символів.",
    brief: [
      "Напишіть <code>sortPeople(people)</code>: повертає <b>новий</b> масив людей <code>{ name, age }</code>, відсортований за віком від старших до молодших, а при однаковому віці за іменем в алфавітному порядку української мови.",
      "Вхідний масив змінювати не можна. Для порівняння імен використайте <code>localeCompare</code> з мовою <code>\"uk\"</code>.",
    ],
    starter: raw`function sortPeople(people) {
  return people.sort((a, b) => a.age - b.age);
}
`,
    tests: raw`describe("sortPeople", () => {
  it("за віком від старших до молодших", () => {
    const out = sortPeople([{ name: "Оля", age: 20 }, { name: "Іван", age: 30 }, { name: "Марія", age: 25 }]);
    expect(out.map((p) => p.age)).toEqual([30, 25, 20]);
  });
  it("при рівному віці за алфавітом української мови", () => {
    const out = sortPeople([
      { name: "Яків", age: 20 },
      { name: "Іван", age: 20 },
      { name: "Анна", age: 20 },
      { name: "Богдан", age: 20 },
    ]);
    expect(out.map((p) => p.name)).toEqual(["Анна", "Богдан", "Іван", "Яків"]);
  });
  it("не змінює вхідний масив", () => {
    const src = [{ name: "Б", age: 1 }, { name: "А", age: 2 }];
    const out = sortPeople(src);
    expect(src.map((p) => p.name)).toEqual(["Б", "А"]);
    expect(out === src).toBe(false);
  });
  it("порожній масив", () => {
    expect(sortPeople([])).toEqual([]);
  });
});`,
  },
  {
    ...base, id: "js-modern-arrays", lesson: "js/27", xp: 25,
    title: "Безпечні методи: with і toSorted",
    context: "Сучасні методи масивів повертають копію й не псують вхідні дані, що ідеально для стану інтерфейсу. Тут ви застосуєте їх для заміни елемента й вибору найкращих результатів.",
    brief: [
      "Напишіть <code>replaceAt(arr, index, value)</code>: повертає новий масив із заміненим елементом. Якщо <code>index</code> виходить за межі масиву, функція кидає <code>RangeError</code> (метод <code>with</code> робить це сам).",
      "Напишіть <code>topScores(scores, n)</code>: повертає <code>n</code> найбільших чисел за спаданням. Якщо <code>n</code> більше за довжину масиву, повертаються всі числа. Вхідний масив змінювати не можна. Підказка: <code>toSorted</code> і <code>slice</code>.",
    ],
    starter: raw`function replaceAt(arr, index, value) {
  arr[index] = value;
  return arr;
}

function topScores(scores, n) {
  return scores.sort((a, b) => b - a).slice(0, n);
}
`,
    tests: raw`describe("replaceAt", () => {
  it("замінює елемент у копії", () => {
    expect(replaceAt([1, 2, 3], 1, "x")).toEqual([1, "x", 3]);
  });
  it("не змінює оригінал", () => {
    const src = [1, 2, 3];
    replaceAt(src, 0, 9);
    expect(src).toEqual([1, 2, 3]);
  });
  it("індекс поза межами: RangeError", () => {
    expect(() => replaceAt([1, 2], 5, 0)).toThrow(RangeError);
  });
});
describe("topScores", () => {
  it("n найбільших за спаданням", () => {
    expect(topScores([5, 1, 9, 3], 2)).toEqual([9, 5]);
  });
  it("n більше за довжину", () => {
    expect(topScores([2, 1], 5)).toEqual([2, 1]);
  });
  it("не змінює вхідний масив", () => {
    const src = [5, 1, 9];
    topScores(src, 2);
    expect(src).toEqual([5, 1, 9]);
  });
});`,
  },
  {
    ...base, id: "js-count-nodes", lesson: "js/28", xp: 30,
    title: "Підрахунок вузлів графа з циклами",
    context: "Обхід структур із взаємними посиланнями (друзі, залежності модулів, DOM) без позначки «вже були» зациклюється. Множина відвіданих вузлів, зокрема слабка, дозволяє безпечно пройти такий граф.",
    brief: [
      "Вузол графа це об'єкт <code>{ links: [...] }</code>, де <code>links</code> масив інших вузлів. Вузли можуть посилатися один на одного по колу.",
      "Напишіть <code>countNodes(start)</code>: кількість різних вузлів, досяжних зі <code>start</code> (разом із самим <code>start</code>). Кожен вузол рахується один раз, а цикли не повинні зациклювати функцію. Скористайтеся <code>Set</code> або <code>WeakSet</code>.",
    ],
    starter: raw`function countNodes(start) {
  return 0;
}
`,
    tests: raw`describe("countNodes", () => {
  it("одиночний вузол", () => {
    expect(countNodes({ links: [] })).toBe(1);
  });
  it("ланцюжок", () => {
    const c = { links: [] };
    const b = { links: [c] };
    const a = { links: [b] };
    expect(countNodes(a)).toBe(3);
  });
  it("цикл між двома вузлами", () => {
    const a = { links: [] };
    const b = { links: [a] };
    a.links.push(b);
    expect(countNodes(a)).toBe(2);
  });
  it("вузол, на який веде кілька шляхів, рахується раз", () => {
    const shared = { links: [] };
    const left = { links: [shared] };
    const right = { links: [shared] };
    const root = { links: [left, right] };
    expect(countNodes(root)).toBe(4);
  });
  it("посилання на себе", () => {
    const self = { links: [] };
    self.links.push(self);
    expect(countNodes(self)).toBe(1);
  });
});`,
  },
  {
    ...base, id: "js-hex-bytes", lesson: "js/29", xp: 30,
    title: "Байти й шістнадцяткові рядки",
    context: "Хеші, ключі та вміст файлів показують шістнадцятковим рядком, а приймають назад як байти. Перетворення в обидва боки це типове завдання під час роботи з двійковими даними.",
    brief: [
      "Напишіть <code>toHex(bytes)</code>: приймає <code>Uint8Array</code> і повертає рядок із двох малих шістнадцяткових цифр на кожен байт без роздільників: <code>[10, 255]</code> дає <code>\"0aff\"</code>.",
      "Напишіть <code>fromHex(text)</code>: приймає такий рядок і повертає <code>Uint8Array</code>. Порожній рядок дає порожній масив.",
    ],
    starter: raw`function toHex(bytes) {
  return "";
}

function fromHex(text) {
  return new Uint8Array(0);
}
`,
    tests: raw`describe("toHex", () => {
  it("два символи на байт", () => {
    expect(toHex(new Uint8Array([10, 255, 0, 16]))).toBe("0aff0010");
  });
  it("порожній масив", () => {
    expect(toHex(new Uint8Array([]))).toBe("");
  });
});
describe("fromHex", () => {
  it("розбирає пари цифр", () => {
    const out = fromHex("0aff0010");
    expect(out instanceof Uint8Array).toBe(true);
    expect(Array.from(out)).toEqual([10, 255, 0, 16]);
  });
  it("порожній рядок", () => {
    expect(fromHex("").length).toBe(0);
  });
  it("зворотне перетворення", () => {
    const src = [1, 2, 3, 250];
    expect(Array.from(fromHex(toHex(new Uint8Array(src))))).toEqual(src);
  });
});`,
  },
  {
    ...base, id: "js-group-by", lesson: "js/30", xp: 30, premium: true,
    title: "Групування записів",
    context: "Групування списку за полем — щоденна задача: замовлення за статусом, користувачі за містом, події за днем. Ця функція зустрічається майже в кожному звіті та дашборді.",
    brief: [
      "Напишіть <code>groupBy(list, key)</code>, що повертає об'єкт, де ключ — значення поля <code>key</code>, а значення — масив елементів із цим полем.",
      "Порядок елементів у групах зберігається. Елементи без цього поля пропускаються. Для порожнього списку результат — порожній об'єкт. Вхідні дані не змінюються.",
    ],
    starter: raw`function groupBy(list, key) {
  return {};
}
`,
    tests: raw`describe("groupBy", () => {
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
];
