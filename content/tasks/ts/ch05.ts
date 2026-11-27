// Завдання глави 5 «Абстракція: generics і система типів» (уроки 40–51). Еталони: tests/solutions/ts-ch05.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";   // зворотний апостроф у прикладах
const D = "$";    // знак долара для ${...} у прикладах

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "ts-generics", lesson: "ts/40", xp: 25,
    title: "Узагальнені функції: перший, повтор, обмін",
    context: "Функції, що працюють з будь-яким типом і зберігають його в результаті, лежать в основі бібліотек. Параметр типу T зв'язує тип входу з типом виходу, тож ніяких any і зайвих приведень не потрібно.",
    brief: [
      "Зробіть узагальненими всі три функції. <code>firstItem&lt;T&gt;(items: T[]): T | undefined</code> повертає перший елемент. <code>repeat&lt;T&gt;(value: T, times: number): T[]</code> повторює значення. <code>swap&lt;T&gt;(pair: [T, T]): [T, T]</code> міняє елементи місцями.",
      "Усі параметри мають бути з типами, без <code>any</code>.",
    ],
    starter: raw`function firstItem(items) {
  // TODO
  return undefined;
}

function repeat(value, times) {
  // TODO
  return [];
}

function swap(pair) {
  // TODO
  return pair;
}

console.log(firstItem(["а", "б"]), firstItem<number>([]));
console.log(repeat("ха", 3).join("-"));
console.log(swap([1, 2]).join(","));
`,
    checks: [
      { on: "stdout", name: "Перший елемент, повтор і обмін", equals: "а undefined\nха-ха-ха\n2,1", hint: "firstItem<number>([]) має дати undefined." },
      { on: "source", name: "firstItem і repeat узагальнені", matches: "function\\s+firstItem\\s*<\\s*T\\s*>[\\s\\S]*function\\s+repeat\\s*<\\s*T\\s*>", hint: "Запишіть function firstItem<T>(...) та function repeat<T>(...)." },
      { on: "source", name: "swap узагальнена, без any", matches: "^(?![\\s\\S]*\\bany\\b)[\\s\\S]*function\\s+swap\\s*<\\s*T\\s*>[\\s\\S]*$", hint: "Запишіть function swap<T>(pair: [T, T]): [T, T] і не використовуйте any." },
    ],
  },
  {
    ...base, id: "ts-constraints", lesson: "ts/41", xp: 25,
    title: "Обмеження: найдовше, пошук за id, сума за полем",
    context: "Обмеження extends дозволяють писати універсальні утиліти для всіх записів із полем id чи колекцій із length, зберігаючи точний тип результату. Саме так створюють спільні допоміжні функції для різних сутностей.",
    brief: [
      "Допишіть <code>longest</code> (приймає два значення з полем <code>length</code>, повертає довше), <code>findById</code> (шукає в масиві записів із числовим <code>id</code>) та <code>sumBy</code> (сума значень, які дістає функція з кожного елемента).",
      "Використайте <code>extends</code> для <code>longest</code> і <code>findById</code>; результат <code>findById</code> має зберегти тип елемента.",
    ],
    starter: raw`type Product = { id: number; name: string; price: number };

function longest(a, b) {
  // TODO
  return a;
}

function findById(items, id) {
  // TODO
  return undefined;
}

function sumBy(items, getValue) {
  // TODO
  return 0;
}

console.log(longest("abc", "de"));
console.log(longest([1, 2], [1, 2, 3]).join(","));

const products: Product[] = [
  { id: 1, name: "Хліб", price: 30 },
  { id: 2, name: "Сир", price: 120 },
];
console.log(findById(products, 2)?.name ?? "немає");
console.log(sumBy(products, (p) => p.price));
`,
    checks: [
      { on: "stdout", name: "Найдовше, пошук і сума", equals: "abc\n1,2,3\nСир\n150", hint: "sumBy додає getValue(item) для кожного елемента." },
      { on: "source", name: "longest з обмеженням length", matches: "longest\\s*<\\s*T\\s+extends\\s*\\{\\s*length\\s*:\\s*number\\s*\\}\\s*>", hint: "Запишіть longest<T extends { length: number }>(a: T, b: T): T." },
      { on: "source", name: "findById з обмеженням id", matches: "findById\\s*<\\s*T\\s+extends\\s*\\{\\s*id\\s*:\\s*number\\s*\\}\\s*>", hint: "Запишіть findById<T extends { id: number }>(items: T[], id: number): T | undefined." },
    ],
  },
  {
    ...base, id: "ts-generic-classes", lesson: "ts/42", xp: 30,
    title: "Узагальнений стек і коробка",
    context: "Стеки, черги й обгортки відповідей використовуються з різними типами даних. Узагальнений клас описує поведінку один раз, а компілятор стежить, щоб у стек чисел не потрапили рядки.",
    brief: [
      "Напишіть клас <code>Stack&lt;T&gt;</code> з приватним масивом, методами <code>push(item: T): void</code>, <code>pop(): T | undefined</code>, <code>peek(): T | undefined</code> та геттером <code>size</code>.",
      "Оголосіть <code>interface Box&lt;T&gt; { value: T }</code> і функцію <code>unbox&lt;T&gt;(box: Box&lt;T&gt;): T</code>.",
    ],
    starter: raw`// TODO: class Stack<T>, interface Box<T>, function unbox<T>

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.peek());
console.log(stack.pop());
console.log(stack.size);

const box: Box<string> = { value: "привіт" };
console.log(unbox(box));
`,
    checks: [
      { on: "stdout", name: "peek, pop, size і unbox", equals: "3\n3\n2\nпривіт", hint: "peek не видаляє елемент, а pop видаляє." },
      { on: "source", name: "Узагальнений клас Stack<T>", matches: "class\\s+Stack\\s*<\\s*T\\s*>", hint: "Запишіть class Stack<T> { ... }." },
      { on: "source", name: "Узагальнений інтерфейс Box<T>", matches: "interface\\s+Box\\s*<\\s*T\\s*>", hint: "Запишіть interface Box<T> { value: T }." },
    ],
  },
  {
    ...base, id: "ts-multi-generics", lesson: "ts/43", xp: 25,
    title: "Кілька параметрів типу й типи за замовчуванням",
    context: "Перетворення списків і об'єднання даних із різних джерел потребують двох і більше параметрів типу. Значення за замовчуванням роблять типові випадки короткими, а складні лишають доступними.",
    brief: [
      "Допишіть <code>mapArray&lt;T, U&gt;(items: T[], fn: (item: T) =&gt; U): U[]</code>, <code>zip&lt;A, B&gt;(first: A[], second: B[]): [A, B][]</code> і тип <code>Pair&lt;A, B = A&gt;</code>.",
      "<code>Pair&lt;number&gt;</code> без другого аргументу має означати пару двох чисел.",
    ],
    starter: raw`// TODO: type Pair<A, B = A> = [A, B]

function mapArray(items, fn) {
  // TODO
  return [];
}

function zip(first, second) {
  // TODO
  return [];
}

const same: Pair<number> = [1, 2];
console.log(mapArray([1, 2, 3], (n) => "№" + n).join(","));
console.log(JSON.stringify(zip(["а", "б"], [1, 2])));
console.log(same.join(","));
`,
    checks: [
      { on: "stdout", name: "Перетворення, zip і пара", equals: "№1,№2,№3\n[[\"а\",1],[\"б\",2]]\n1,2", hint: "zip будує пари за однаковими індексами." },
      { on: "source", name: "Два параметри типу в mapArray", matches: "mapArray\\s*<\\s*T\\s*,\\s*U\\s*>", hint: "Запишіть mapArray<T, U>(...)." },
      { on: "source", name: "Pair із типом за замовчуванням", matches: "type\\s+Pair\\s*<\\s*A\\s*,\\s*B\\s*=\\s*A\\s*>", hint: "Запишіть type Pair<A, B = A> = [A, B];" },
    ],
  },
  {
    ...base, id: "ts-keyof", lesson: "ts/44", xp: 25,
    title: "Ключі конфігурації: keyof і typeof",
    context: "Функції, що приймають назву налаштування, не повинні приймати довільний рядок. Тип ключів, отриманий з самого об'єкта, підказує допустимі назви в редакторі й ловить друкарські помилки ще до запуску.",
    brief: [
      "Оголосіть <code>type ConfigKey = keyof typeof config</code>. Допишіть <code>keysOf&lt;T extends object&gt;(obj: T): (keyof T)[]</code>, що повертає ключі об'єкта з точним типом.",
      "Програма виводить кожен ключ у форматі <code>ключ=значення</code>.",
    ],
    starter: raw`const config = { host: "localhost", port: 3000, debug: false };

// TODO: type ConfigKey = keyof typeof config

function keysOf(obj: object): string[] {
  // TODO: узагальнена версія з точним типом ключів
  return Object.keys(obj);
}

function describe(key: ConfigKey): string {
  return key + "=" + String(config[key]);
}

for (const key of keysOf(config)) {
  console.log(describe(key));
}
`,
    checks: [
      { on: "stdout", name: "Три налаштування", equals: "host=localhost\nport=3000\ndebug=false", hint: "describe(key) вже готова: потрібно лише виправити типи." },
      { on: "source", name: "ConfigKey з keyof typeof", matches: "type\\s+ConfigKey\\s*=\\s*keyof\\s+typeof\\s+config", hint: "Запишіть type ConfigKey = keyof typeof config;" },
      { on: "source", name: "keysOf повертає (keyof T)[]", matches: "keysOf\\s*<\\s*T\\s+extends\\s+object\\s*>\\s*\\(\\s*obj\\s*:\\s*T\\s*\\)\\s*:\\s*\\(\\s*keyof\\s+T\\s*\\)\\s*\\[\\]", hint: "Запишіть function keysOf<T extends object>(obj: T): (keyof T)[]." },
    ],
  },
  {
    ...base, id: "ts-get-prop", lesson: "ts/45", xp: 25,
    title: "Типізований доступ до полів: getProp і pluck",
    context: "Сортування за полем, вибірка стовпця, читання налаштувань потребують функції, яка приймає ключ об'єкта й повертає значення з точним типом поля. Типи T[K] роблять це безпечним без жодних приведень.",
    brief: [
      "Допишіть <code>getProp&lt;T, K extends keyof T&gt;(obj: T, key: K): T[K]</code> та <code>pluck&lt;T, K extends keyof T&gt;(items: T[], key: K): T[K][]</code>, що збирає значення одного поля з усіх елементів.",
      "Результат <code>pluck(people, \"age\")</code> має бути масивом чисел, а не <code>unknown[]</code>.",
    ],
    starter: raw`interface Person {
  name: string;
  age: number;
}

function getProp(obj: Person, key: string): unknown {
  // TODO
  return "?";
}

function pluck(items: Person[], key: string): unknown[] {
  // TODO
  return [];
}

const people: Person[] = [
  { name: "Оля", age: 25 },
  { name: "Іван", age: 30 },
];

console.log(getProp(people[0], "name"));
console.log(pluck(people, "age").join(","));
console.log(pluck(people, "name").join(","));
`,
    checks: [
      { on: "stdout", name: "Ім'я, вікові дані та імена", equals: "Оля\n25,30\nОля,Іван", hint: "pluck повертає items.map((item) => item[key])." },
      { on: "source", name: "getProp із обмеженням keyof", matches: "getProp\\s*<\\s*T\\s*,\\s*K\\s+extends\\s+keyof\\s+T\\s*>[\\s\\S]*:\\s*T\\[K\\]", hint: "Запишіть getProp<T, K extends keyof T>(obj: T, key: K): T[K]." },
      { on: "source", name: "pluck повертає T[K][]", matches: "T\\[K\\]\\[\\]", hint: "Результат pluck має тип T[K][]." },
    ],
  },
  {
    ...base, id: "ts-utility-types", lesson: "ts/46", xp: 25,
    title: "Публічний користувач: Omit, Pick і Partial",
    context: "Паролі та службові поля не повинні потрапляти у відповіді сервера, а оновлення зазвичай містять лише змінені поля. Утилітарні типи описують такі варіанти моделі без копіювання й ручної синхронізації.",
    brief: [
      "Оголосіть <code>type PublicUser = Omit&lt;User, \"password\"&gt;</code> та <code>type UserSummary = Pick&lt;User, \"id\" | \"name\"&gt;</code>. Допишіть <code>toPublic</code> (без пароля), <code>applyChanges(user, changes: Partial&lt;User&gt;)</code> (нова копія із змінами) та <code>summarize</code>.",
    ],
    starter: raw`interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// TODO: type PublicUser = Omit<User, "password">
// TODO: type UserSummary = Pick<User, "id" | "name">

function toPublic(user: User): PublicUser {
  // TODO: без поля password
  return user;
}

function applyChanges(user: User, changes: Partial<User>): User {
  // TODO
  return user;
}

function summarize(user: User): UserSummary {
  // TODO
  return user;
}

const user: User = { id: 1, name: "Оля", email: "olya@example.com", password: "секрет" };
console.log(JSON.stringify(toPublic(user)));
console.log(applyChanges(user, { name: "Олена" }).name);
console.log(JSON.stringify(summarize(user)));
`,
    checks: [
      { on: "stdout", name: "Публічний користувач, зміни та короткий опис", equals: "{\"id\":1,\"name\":\"Оля\",\"email\":\"olya@example.com\"}\nОлена\n{\"id\":1,\"name\":\"Оля\"}", hint: "toPublic і summarize мають повертати нові об'єкти лише з потрібними полями." },
      { on: "source", name: "PublicUser через Omit", matches: "type\\s+PublicUser\\s*=\\s*Omit\\s*<\\s*User\\s*,\\s*[\"']password[\"']\\s*>", hint: "Запишіть type PublicUser = Omit<User, \"password\">;" },
      { on: "source", name: "UserSummary через Pick", matches: "type\\s+UserSummary\\s*=\\s*Pick\\s*<\\s*User\\s*,\\s*[\"']id[\"']\\s*\\|\\s*[\"']name[\"']\\s*>", hint: "Запишіть type UserSummary = Pick<User, \"id\" | \"name\">;" },
    ],
  },
  {
    ...base, id: "ts-satisfies", lesson: "ts/47", xp: 25,
    title: "Теми оформлення: satisfies замість анотації",
    context: "Таблиці тем і маршрутів мають відому форму, а доступ до їхніх ключів повинен бути перевірений. Оператор satisfies зберігає точні ключі, тож друкарську помилку в назві теми видно ще при компіляції.",
    brief: [
      "Зараз <code>themes</code> має анотацію <code>Record&lt;string, Theme&gt;</code>, тому помилка в назві теми <code>themes.ligth</code> компілюється, але падає під час виконання. Замініть анотацію на <code>satisfies Record&lt;string, Theme&gt;</code> і виправте друкарську помилку.",
      "Програма має вивести <code>#111111</code> та <code>#0066cc</code>.",
    ],
    starter: raw`type Theme = { background: string; accent: string };

const themes: Record<string, Theme> = {
  light: { background: "#ffffff", accent: "#0066cc" },
  dark: { background: "#111111", accent: "#66aaff" },
};

console.log(themes.dark.background);
console.log(themes.ligth.accent);
`,
    checks: [
      { on: "stdout", name: "Фон темної теми й акцент світлої", equals: "#111111\n#0066cc", hint: "Правильна назва теми light." },
      { on: "source", name: "Використано satisfies Record<string, Theme>", matches: "satisfies\\s+Record\\s*<\\s*string\\s*,\\s*Theme\\s*>", hint: "Запишіть } satisfies Record<string, Theme>;" },
      { on: "source", name: "Друкарську помилку виправлено", matches: "^(?![\\s\\S]*themes\\.ligth)[\\s\\S]*$", hint: "Замініть themes.ligth на themes.light." },
    ],
  },
  {
    ...base, id: "ts-mapped", lesson: "ts/48", xp: 30,
    title: "Власні відображені типи: Nullable і Getters",
    context: "Повторюване перетворення форми, наприклад усі поля можуть бути порожніми чи всі стають функціями, описують один раз відображеним типом. Він автоматично відстежує зміни вихідної моделі.",
    brief: [
      "Визначте <code>type Nullable&lt;T&gt;</code> (кожне поле може бути ще й <code>null</code>) та <code>type Getters&lt;T&gt;</code> (кожне поле стає функцією без аргументів, що повертає значення). Допишіть <code>makeGetters</code>.",
    ],
    starter: raw`type Nullable<T> = T;
type Getters<T> = T;

interface User {
  id: number;
  name: string;
}

function makeGetters<T extends object>(obj: T): Getters<T> {
  // TODO: для кожного ключа створіть функцію-геттер
  return obj;
}

const draft: Nullable<User> = { id: 1, name: null };
const getters = makeGetters({ id: 1, name: "Оля" });
console.log(draft.name, getters.id(), getters.name());
`,
    checks: [
      { on: "stdout", name: "null, 1 і Оля", equals: "null 1 Оля", hint: "Геттер повертає значення поля під тим самим ключем." },
      { on: "source", name: "Nullable як відображений тип", matches: "type\\s+Nullable\\s*<\\s*T\\s*>\\s*=\\s*\\{\\s*\\[\\s*K\\s+in\\s+keyof\\s+T\\s*\\]\\s*:\\s*T\\[K\\]\\s*\\|\\s*null", hint: "Запишіть { [K in keyof T]: T[K] | null }." },
      { on: "source", name: "Getters як відображений тип", matches: "type\\s+Getters\\s*<\\s*T\\s*>\\s*=\\s*\\{\\s*\\[\\s*K\\s+in\\s+keyof\\s+T\\s*\\]\\s*:\\s*\\(\\s*\\)\\s*=>\\s*T\\[K\\]", hint: "Запишіть { [K in keyof T]: () => T[K] }." },
    ],
  },
  {
    ...base, id: "ts-conditional", lesson: "ts/49", xp: 30,
    title: "Умовні типи: Flatten і compact",
    context: "Умовні типи вибирають тип залежно від іншого типу: елемент масиву чи сам тип, значення без null. Такі перетворення вбудовані в стандартні утиліти, і їх корисно вміти написати самостійно.",
    brief: [
      "Визначте <code>type Flatten&lt;T&gt;</code>: для масиву тип його елемента, а для решти сам <code>T</code>. Допишіть <code>compact&lt;T&gt;(items: (T | null | undefined)[]): NonNullable&lt;T&gt;[]</code>, що відкидає <code>null</code> та <code>undefined</code>.",
    ],
    starter: raw`type Flatten<T> = T;

function compact<T>(items: (T | null | undefined)[]): NonNullable<T>[] {
  // TODO: відкиньте null і undefined
  return [];
}

const first: Flatten<string[]> = "рядок";
const second: Flatten<number> = 5;
console.log(first, second, compact([1, null, 2, undefined]).join(","));
`,
    checks: [
      { on: "stdout", name: "рядок 5 1,2", equals: "рядок 5 1,2", hint: "compact([1, null, 2, undefined]) дає [1, 2]." },
      { on: "source", name: "Flatten — умовний тип", matches: "type\\s+Flatten\\s*<\\s*T\\s*>\\s*=\\s*T\\s+extends\\s+unknown\\[\\]\\s*\\?", hint: "Запишіть type Flatten<T> = T extends unknown[] ? T[number] : T;" },
      { on: "source", name: "Є перевірка на null і undefined", matches: "null[\\s\\S]*undefined|undefined[\\s\\S]*null", hint: "Відкидайте і null, і undefined: item !== null && item !== undefined." },
    ],
  },
  {
    ...base, id: "ts-infer", lesson: "ts/50", xp: 30,
    title: "Розбір типів через infer",
    context: "Типи елемента масиву, результату й першого аргументу функції можна не описувати вручну, а витягувати з існуючих типів. Так типи автоматично слідують за кодом і не розходяться з ним.",
    brief: [
      "Визначте <code>ElementOf&lt;T&gt;</code> (тип елемента масиву), <code>ReturnOf&lt;T&gt;</code> (тип результату функції) та <code>FirstArg&lt;T&gt;</code> (тип першого аргументу) через умовні типи з <code>infer</code>.",
      "Зараз усі три дорівнюють <code>unknown</code>, тому звернення до <code>letter.toUpperCase()</code> не компілюється.",
    ],
    starter: raw`type ElementOf<T> = unknown;
type ReturnOf<T> = unknown;
type FirstArg<T> = unknown;

function makeUser(id: number, name: string) {
  return { id, name };
}

const letter: ElementOf<string[]> = "а";
const user: ReturnOf<typeof makeUser> = { id: 1, name: "Оля" };
const arg: FirstArg<typeof makeUser> = 5;

console.log(letter.toUpperCase(), user.name, arg + 1);
`,
    checks: [
      { on: "stdout", name: "А Оля 6", equals: "А Оля 6", hint: "Після правильних типів програма має вивести цей рядок." },
      { on: "source", name: "ElementOf використовує infer", matches: "type\\s+ElementOf\\s*<\\s*T\\s*>\\s*=\\s*T\\s+extends\\s*\\(\\s*infer\\s+U\\s*\\)\\s*\\[\\]", hint: "Запишіть T extends (infer U)[] ? U : never." },
      { on: "source", name: "ReturnOf використовує infer R", matches: "infer\\s+R", hint: "Запишіть T extends (...args: never[]) => infer R ? R : never." },
    ],
  },
  {
    ...base, id: "ts-template-types", lesson: "ts/51", xp: 30,
    title: "Шаблонні літеральні типи: події й геттери",
    context: "Імена подій і методів мають чітку структуру: on і назва з великої літери, get і назва поля. Шаблонні типи описують такі формати точно й підказують допустимі значення в редакторі.",
    brief: [
      "Визначте <code>EventName&lt;T extends string&gt;</code> як <code>on</code> плюс <code>Capitalize&lt;T&gt;</code> та <code>Getters&lt;T&gt;</code> з перейменуванням ключів: для кожного ключа <code>K</code> метод <code>getK</code> (з великої літери), що повертає <code>T[K]</code>.",
    ],
    starter: raw`type EventName<T extends string> = string;
type Getters<T> = {};

interface Person {
  name: string;
  age: number;
}

const person: Getters<Person> = { getName: () => "Оля", getAge: () => 29 };
const handler: EventName<"click"> = "onClick";

console.log(person.getName(), person.getAge(), handler);
`,
    checks: [
      { on: "stdout", name: "Оля 29 onClick", equals: "Оля 29 onClick", hint: "Після правильних типів програма має вивести цей рядок." },
      { on: "source", name: "EventName із Capitalize", matches: "on\\$\\{\\s*Capitalize\\s*<\\s*T\\s*>\\s*\\}", hint: "Запишіть type EventName<T extends string> = `on${Capitalize<T>}`;" },
      { on: "source", name: "Getters перейменовує ключі через as", matches: "\\[\\s*K\\s+in\\s+keyof\\s+T\\s+as\\s+`get\\$\\{", hint: "Запишіть [K in keyof T as `get${Capitalize<K & string>}`]." },
    ],
  },
];
