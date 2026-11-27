// Глава 8 «Стандартна бібліотека» (уроки 74–85). Тексти українською; у p, easy, note, work, tasks дозволені лише теги code, b, i, а < > & екрануємо.
const raw = String.raw;

export const LESSONS_08 = [
  {
    t: "Модулі: import, export і type-only імпорти",
    ch: "Стандартна бібліотека",
    easy: "Модуль це окрема коробка з кодом: усе, що ви не винесли назовні, лишається всередині. Через <code>export</code> ви кладете на полицю потрібні речі, а через <code>import</code> беруть їх в іншому файлі.",
    p: [
      "Кожен файл, у якому є <code>import</code> чи <code>export</code>, у TypeScript стає <b>модулем</b> зі власною областю видимості: змінні та функції всередині не потрапляють у глобальний простір. Файл без жодного імпорту чи експорту вважається звичайним скриптом, і його оголошення видно всюди. Тому, щоб файл гарантовано став модулем, іноді додають порожній рядок <code>export {}</code>.",
      "Експортувати можна іменовано: <code>export function area() {}</code>, <code>export const PI = 3.14</code>, <code>export interface Shape {}</code>. Імпорт має ті самі імена у фігурних дужках: <code>import { area, PI } from './geometry'</code>. Імена можна змінювати: <code>import { area as calcArea }</code>. Усі експорти можна зібрати під одним іменем: <code>import * as geo from './geometry'</code>.",
      "Є ще <b>експорт за замовчуванням</b>: <code>export default class Parser {}</code>. Імпортують його без дужок і під будь-яким іменем: <code>import Parser from './parser'</code>. Багато команд уникає default-експортів, бо вони дозволяють імпортувати той самий об'єкт під різними іменами, і пошук по коду ускладнюється. Іменовані експорти зручніші для рефакторингу й підказок редактора.",
      "Типи теж експортуються й імпортуються, але на відміну від значень вони <b>зникають під час компіляції</b>. Щоб це було явно, використовують <code>import type { User } from './types'</code>. Такий імпорт гарантовано стирається з JavaScript, і ним не можна скористатися як значенням: <code>new User()</code> не скомпілюється. Можна змішувати в одному рядку: <code>import { type User, loadUser } from './api'</code>.",
      "Навіщо це потрібно? По-перше, ясність: з першого погляду видно, що імпорт лише для типів. По-друге, надійність під час збирання: інструменти, що компілюють файли по одному (esbuild, Babel), не знають, чи є <code>User</code> типом чи значенням, і явна позначка <code>type</code> допомагає їм безпечно прибрати імпорт. Прапорець <code>verbatimModuleSyntax</code> у tsconfig змушує завжди писати <code>type</code> для типів.",
      "Файл-«барель» <code>index.ts</code> збирає експорти папки: <code>export * from './a'; export { b } from './b'; export type { C } from './c'</code>. Так споживач пише один імпорт замість п'яти. Але з бочками не перестарайтеся: у великих проєктах вони створюють циклічні залежності й уповільнюють збірку, бо змушують завантажувати все підряд навіть тоді, коли потрібна одна функція.",
      "Остерігайтеся <b>циклічних імпортів</b>: коли <code>a.ts</code> імпортує <code>b.ts</code>, а той назад <code>a.ts</code>. Під час виконання одна зі сторін може отримати ще не ініціалізоване значення. Розривайте цикл, виносячи спільне в третій модуль. Також пам'ятайте, що в наших завданнях є лише один файл, тому приклади з кількох файлів позначені як фрагменти, а в завданні ви працюватимете з експортами в межах одного файлу.",
    ],
    code: [
      raw`// фрагмент: два файли, geometry.ts і main.ts
// --- geometry.ts ---
export const PI = 3.14159;

export function circleArea(radius: number): number {
  return PI * radius ** 2;
}

export interface Shape {
  kind: "circle" | "square";
  size: number;
}

// --- main.ts ---
import { circleArea, type Shape } from "./geometry";

const shape: Shape = { kind: "circle", size: 2 };
console.log(circleArea(shape.size).toFixed(2));
`,
      raw`export const VERSION = "1.0";

export function greet(userName: string): string {
  return "Привіт, " + userName;
}

export default class Counter {
  count = 0;

  next(): number {
    return ++this.count;
  }
}

const counter = new Counter();
console.log(greet("Олена"), VERSION, counter.next(), counter.next());
`,
      raw`// фрагмент: файл index.ts збирає експорти папки (барель), а споживач імпортує з одного місця
export * from "./geometry";
export { Counter } from "./counter";
export type { User } from "./types";

// у іншому файлі:
import { circleArea, Counter, type User } from "./index";
`,
      raw`// не компілюється: модуль не знайдено, у шляху друкарська помилка
import { circleArea } from "./geometri";

console.log(circleArea(2));
`,
    ],
    note: "Файл з <code>import</code> чи <code>export</code> стає модулем зі своєю областю видимості. Типи імпортуйте через <code>import type</code>: вони зникають із JavaScript. Віддавайте перевагу іменованим експортам, а циклічні імпорти розривайте третім модулем.",
    work: "У кожному реальному проєкті код ділиться на десятки модулів. Чіткі експорти задають публічний інтерфейс модуля, а <code>import type</code> робить зрозумілим, які залежності існують лише на рівні типів і не потрапляють у підсумкову збірку.",
    tasks: [
      "Чим іменований експорт відрізняється від експорту за замовчуванням і який з них зручніший для рефакторингу?",
      "Що гарантує <code>import type</code> і чому ним не можна створити значення через <code>new</code>?",
    ],
  },
  {
    t: "Дата й час: Date без now()",
    ch: "Стандартна бібліотека",
    easy: "Дата в JavaScript це число: кількість мілісекунд від півночі 1 січня 1970 року за UTC. Усе інше, як-от день, місяць чи гарний рядок, це лише спосіб показати це число людині.",
    p: [
      "Об'єкт <code>Date</code> зберігає один момент часу як число мілісекунд від епохи Unix (1970-01-01T00:00:00Z). Метод <code>getTime()</code> повертає це число. Дві дати порівнюють саме за ним: оператори <code>&lt;</code> і <code>&gt;</code> працюють, бо дати приводяться до чисел, а ось <code>===</code> порівнює посилання на об'єкти й дасть <code>false</code> для двох різних об'єктів з однаковим часом.",
      "Створюють дати кількома способами: <code>new Date(мс)</code>, <code>new Date('2024-03-15T10:30:00Z')</code> (рядок ISO 8601), <code>new Date(2024, 2, 15)</code> (рік, місяць, день у <b>локальному</b> часовому поясі) та <code>Date.UTC(2024, 2, 15)</code> (число мілісекунд для UTC). Найнадійніший формат для обміну даними це ISO-рядок із літерою <code>Z</code> наприкінці, що означає UTC.",
      "Найвідоміша пастка: <b>місяці нумеруються з нуля</b>. <code>new Date(2024, 0, 31)</code> це 31 січня. А якщо до 31 січня додати місяць, то 31 лютого не існує, і результатом буде 2 березня: надлишок переноситься на наступний місяць. Така автоматична «нормалізація» зручна для арифметики, але легко призводить до помилок, якщо її не очікувати.",
      "Друга пастка це <b>часові пояси</b>. Методи <code>getDate()</code> і <code>getHours()</code> працюють у локальному поясі комп'ютера, тому той самий код дає різні результати у Києві та Нью-Йорку. Для передбачуваності використовуйте методи UTC: <code>getUTCDate()</code>, <code>getUTCHours()</code>, <code>setUTCDate()</code>, <code>toISOString()</code>. Локальний пояс потрібен лише для показу користувачу.",
      "Для арифметики з днями найпростіше працювати зі значеннями UTC: <code>d.setUTCDate(d.getUTCDate() + 7)</code> додає тиждень, переносячи місяці автоматично. Різницю між датами обчислюють у мілісекундах: <code>(b.getTime() - a.getTime()) / 86_400_000</code> дасть дні. Це правильно для UTC; у локальному поясі через перехід на літній час доба інколи триває 23 чи 25 годин.",
      "Некоректна дата не кидає помилку: вона стає <b>Invalid Date</b>, об'єктом, чий <code>getTime()</code> дорівнює <code>NaN</code>. Перевіряють це через <code>Number.isNaN(d.getTime())</code>. Але парсер у різних середовищах поводиться по-різному зі «сумнівними» рядками на кшталт 30 лютого: деякі переносять його на 1 березня, інші відхиляють, тож не покладайтеся на нього для валідації. Виклик <code>toISOString()</code> на некоректній даті кидає <code>RangeError</code>.",
      "Чому в завданнях немає <code>Date.now()</code> і <code>new Date()</code> без аргументів? Бо поточний час щоразу інший, і вивід програми стає непередбачуваним. У тестах поточний час передають параметром або підміняють «годинником» (функція, що повертає дату), а в бойовому коді передають <code>() =&gt; new Date()</code>. Для складних задач із календарями беруть спеціальні бібліотеки або новий стандарт Temporal, що поступово з'являється в середовищах.",
    ],
    code: [
      raw`const moment = new Date(Date.UTC(2024, 2, 15, 10, 30));
console.log(moment.toISOString());
console.log(moment.getTime());
console.log(moment.getUTCFullYear(), moment.getUTCMonth(), moment.getUTCDate());

const same = new Date(moment.getTime());
console.log(moment === same, moment.getTime() === same.getTime());
`,
      raw`const d = new Date(Date.UTC(2024, 0, 31));
d.setUTCMonth(1);
console.log("31 січня + місяць:", d.toISOString().slice(0, 10));

const e = new Date(Date.UTC(2024, 1, 29));
e.setUTCDate(e.getUTCDate() + 1);
console.log("29 лютого + день:", e.toISOString().slice(0, 10));
`,
      raw`function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

const start = new Date("2024-02-27T00:00:00Z");
const end = addDays(start, 5);
console.log(end.toISOString().slice(0, 10), daysBetween(start, end));
`,
      raw`function parseDate(text: string): Date | null {
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

const broken = new Date("2024-13-01");
console.log(broken.getTime(), String(broken));
console.log(parseDate("2024-05-01")?.toISOString(), parseDate("не дата"));
`,
      raw`// аварія: toISOString на некоректній даті кидає RangeError
const broken = new Date("2024-13-01");
console.log("спроба форматування");
console.log(broken.toISOString());
`,
    ],
    note: "Дата це число мілісекунд від 1970 року за UTC. Місяці нумеруються з нуля, надлишок днів переноситься на наступний місяць. Використовуйте методи UTC, перевіряйте <code>getTime()</code> на <code>NaN</code>, а поточний час передавайте параметром.",
    work: "Терміни, розклади, журнали подій і звіти за період потребують акуратної роботи з датами. Типові помилки із часовими поясами й нульовими місяцями спливають лише в продакшені, тож зберігайте час у UTC і форматуйте його лише при показі користувачу.",
    tasks: [
      "Чому <code>new Date(2024, 1, 31)</code> дає не помилку, а 2 березня?",
      "Як перевірити, що рядок не перетворився на <code>Invalid Date</code>?",
    ],
  },
  {
    t: "JSON: parse, stringify і типи",
    ch: "Стандартна бібліотека",
    easy: "JSON це текст, у який можна «запакувати» дані, щоб передати їх мережею чи зберегти у файл. <code>JSON.stringify</code> пакує, <code>JSON.parse</code> розпаковує, а TypeScript нагадує, що розпаковане спершу треба перевірити.",
    p: [
      "<b>JSON</b> (JavaScript Object Notation) це текстовий формат для даних: об'єкти, масиви, рядки, числа, <code>true</code>, <code>false</code> і <code>null</code>. Він є спільною мовою обміну між програмами, мережею та файлами. <code>JSON.stringify(value)</code> перетворює значення на рядок, а <code>JSON.parse(text)</code> повертає з рядка значення.",
      "У типах <code>JSON.parse</code> повертає <b><code>any</code></b>, бо компілятор не може знати, що в тексті. Це небезпечна діра: можна написати <code>const user: User = JSON.parse(text)</code>, і ніхто не перевірить, що там справді користувач. Хороша практика: приймати результат як <code>unknown</code> і перевіряти форму вручну (type guard) або бібліотекою валідації. Тоді типи стають правдою, а не побажанням.",
      "<code>JSON.parse</code> кидає <code>SyntaxError</code> на некоректному тексті, тому його обгортають у <code>try/catch</code>, як у розділі про помилки. Частий випадок це порожній рядок, обрізана відповідь сервера чи текст з одинарними лапками замість подвійних. Зручна допоміжна функція повертає <code>null</code> замість винятку й не змушує кожного викликача писати свій <code>try</code>.",
      "<code>JSON.stringify</code> приймає два необов'язкові аргументи: <b>replacer</b> (функція чи масив ключів, які залишити) і <b>відступ</b>. Виклик <code>JSON.stringify(obj, null, 2)</code> дає гарно відформатований текст із відступом у два пробіли: це зручно для журналів і конфігураційних файлів. Другий аргумент <code>null</code> означає, що фільтрації немає.",
      "Не все, що є в JavaScript, потрапляє в JSON. Властивості зі значенням <code>undefined</code>, функції й символи <b>пропускаються</b>, у масивах стають <code>null</code>. <code>NaN</code> і <code>Infinity</code> перетворюються на <code>null</code>. <code>Date</code> стає рядком ISO, а після <code>parse</code> лишається рядком, не датою. <code>Map</code> і <code>Set</code> перетворюються на порожній об'єкт. Тому «туди й назад» не завжди повертає початкове значення.",
      "Дві ситуації кидають помилку: <b>BigInt</b> (<code>TypeError: Do not know how to serialize a BigInt</code>) і <b>циклічні посилання</b>, коли об'єкт посилається сам на себе. Для власних типів можна визначити метод <code>toJSON()</code>, що повертає потрібне подання. А при читанні другий аргумент <code>parse</code>, <b>reviver</b>, дозволяє перетворювати значення, наприклад, рядки дат назад на <code>Date</code>.",
      "Правило для меж програми: усе, що прийшло ззовні (мережа, файли, ввід), вважайте <code>unknown</code>. Перевіряйте форму, а вже потім користуйтеся типами. Це «ворота» між небезпечним світом і типізованою логікою. Ми повернемося до цього в розділі про мережу, де побудуємо повноцінну валідацію на межі, а поки навчимося писати такі перевірки вручну.",
    ],
    code: [
      raw`interface User {
  id: number;
  nick: string;
  tags: string[];
}

const user: User = { id: 1, nick: "olena", tags: ["admin", "dev"] };
const text = JSON.stringify(user);
console.log(text);
console.log(JSON.stringify(user, null, 2));

const copy: unknown = JSON.parse(text);
console.log(copy);
`,
      raw`interface User {
  id: number;
  nick: string;
}

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.id === "number" && typeof record.nick === "string";
}

function parseUser(text: string): User | null {
  try {
    const data: unknown = JSON.parse(text);
    return isUser(data) ? data : null;
  } catch {
    return null;
  }
}

console.log(parseUser('{"id":1,"nick":"olena"}'));
console.log(parseUser('{"id":"1","nick":"olena"}'));
console.log(parseUser("{ зламано"));
`,
      raw`const sample = {
  when: new Date(0),
  skip: undefined,
  run() {},
  ratio: NaN,
  set: new Set([1]),
  list: [undefined, 1],
};

console.log(JSON.stringify(sample));
`,
      raw`// не компілюється: після parse як unknown властивості читати не можна без перевірки
const data: unknown = JSON.parse('{"id":1}');
console.log(data.id);
`,
      raw`// аварія: BigInt не серіалізується в JSON
console.log("серіалізуємо");
console.log(JSON.stringify({ big: 10n }));
`,
    ],
    note: "<code>JSON.parse</code> повертає <code>any</code>, тому приймайте результат як <code>unknown</code> і перевіряйте форму. Функції, <code>undefined</code> і символи зникають, <code>Date</code> стає рядком, а <code>BigInt</code> і цикли кидають помилку.",
    work: "Відповіді серверів, конфігураційні файли, локальні сховища й повідомлення черг передаються як JSON. Перевірка форми на вході не дає чужим некоректним даним потрапити в логіку програми й зламати її далеко від місця, де вони з'явилися.",
    tasks: [
      "Чому результат <code>JSON.parse</code> краще приймати як <code>unknown</code>, а не як свій тип?",
      "Що станеться з <code>Date</code>, <code>undefined</code> і функціями при <code>JSON.stringify</code>?",
    ],
  },
  {
    t: "Регулярні вирази: RegExp й іменовані групи",
    ch: "Стандартна бібліотека",
    easy: "Регулярний вираз це шаблон для пошуку в тексті, як трафарет: збігається все, що пройшло крізь отвори. Іменовані групи дають кожному вирізаному шматку назву, і код читається майже як речення.",
    p: [
      "<b>Регулярний вираз</b> (<code>RegExp</code>) описує шаблон для пошуку в рядках. Літерал пишуть між скісними рисками: <code>/\\d{4}-\\d{2}/</code>. Основні елементи: <code>\\d</code> цифра, <code>\\s</code> пробіл, <code>.</code> будь-який символ, <code>+</code> один чи більше, <code>*</code> нуль чи більше, <code>?</code> необов'язково, <code>[abc]</code> набір, <code>^</code> і <code>$</code> початок і кінець рядка. Для складнішого шаблону є й конструктор <code>new RegExp(рядок)</code>.",
      "Для роботи є кілька методів. <code>regex.test(text)</code> повертає <code>true</code> або <code>false</code>. <code>text.match(regex)</code> повертає перший збіг або всі збіги, якщо є прапорець <code>g</code>. <code>text.matchAll(regex)</code> віддає ітератор усіх збігів із деталями. <code>text.replace(regex, ...)</code> замінює, а <code>text.split(regex)</code> розбиває рядок за шаблоном.",
      "<b>Групи</b> у круглих дужках захоплюють частини збігу. А <b>іменовані групи</b> <code>(?&lt;year&gt;\\d{4})</code> дають кожній частині ім'я: результат <code>match.groups.year</code> читається набагато зрозуміліше, ніж <code>match[1]</code>. У TypeScript поле <code>match.groups</code> має тип «словник рядків або <code>undefined</code>», тож його доводиться перевірити перед використанням.",
      "Прапорці змінюють поведінку: <code>g</code> шукає всі збіги, <code>i</code> ігнорує регістр, <code>m</code> робить <code>^</code> і <code>$</code> межами рядків, <code>u</code> вмикає Unicode, <code>y</code> шукає з певної позиції. Для української мови прапорець <code>u</code> разом із класом <code>\\p{L}</code> (будь-яка літера) обов'язковий: клас <code>\\w</code> розпізнає лише латинські літери, цифри та підкреслення й пропустить кирилицю.",
      "Найпідступніша пастка: регулярний вираз із прапорцем <code>g</code> чи <code>y</code> має стан <code>lastIndex</code>. Метод <code>test</code> на такому виразі запам'ятовує, де зупинився, і наступний виклик почне пошук звідти. Результат чергується між <code>true</code> і <code>false</code> на однаковому вході. Не зберігайте в змінній на рівні модуля вираз із <code>g</code> для <code>test</code>: створюйте його заново або скидайте <code>lastIndex = 0</code>.",
      "У <code>replace</code> другим аргументом можна передати <b>функцію</b>: вона отримає збіг і групи й поверне заміну. Так перетворюють дати, обчислюють значення прямо в тексті. У рядку заміни працюють посилання на групи: <code>$1</code> і <code>$&lt;назва&gt;</code>. Для заміни всіх входжень простого рядка зручніше <code>replaceAll</code>, що не потребує регулярного виразу взагалі.",
      "Остерігайтеся складних виразів: вони нечитабельні й важкі для налагодження, а деякі шаблони дають <b>катастрофічний backtracking</b>, коли тривіальний на вигляд вхід «вішає» програму. Для розбору структурованих форматів, як-от JSON чи HTML, регулярні вирази не підходять. Робіть їх короткими, давайте групам імена й обов'язково перевіряйте на прикладах, особливо на крайніх випадках.",
    ],
    code: [
      raw`const date = /^\d{4}-\d{2}-\d{2}$/;
console.log(date.test("2024-03-15"), date.test("15.03.2024"));
console.log("a1b22c333".match(/\d+/g));
console.log("2024-03-15".replace(/-/g, "/"));
console.log("один  два   три".split(/\s+/));
console.log("привіт world".match(/\w+/g));
console.log("привіт world".match(/\p{L}+/gu));
`,
      raw`const log = "2024-03-15 ERROR диск; 2024-03-16 INFO старт; 2024-03-17 ERROR мережа";
const pattern = /(?<day>\d{4}-\d{2}-\d{2}) (?<level>[A-Z]+) (?<text>\p{L}+)/gu;

for (const match of log.matchAll(pattern)) {
  const groups = match.groups;
  if (groups) {
    console.log(groups.day, groups.level, groups.text);
  }
}
`,
      raw`const digits = /\d/g;
console.log(digits.test("1"), digits.lastIndex);
console.log(digits.test("1"), digits.lastIndex);
digits.lastIndex = 0;
console.log(digits.test("1"));

const safe = /\d/;
console.log(safe.test("1"), safe.test("1"));
`,
      raw`// не компілюється: groups може бути undefined, тому звертатися до year напряму не можна
const match = "2024-03".match(/(?<year>\d{4})/);
console.log(match?.groups.year);
`,
      raw`const prices = "хліб 30, молоко 45";
console.log(prices.replace(/\d+/g, (value) => String(Number(value) * 2)));

const swapped = "2024-03-15".replace(/(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/, "$<d>.$<m>.$<y>");
console.log(swapped);
`,
    ],
    note: "Іменовані групи роблять розбір читабельним, а <code>match.groups</code> може бути <code>undefined</code>. Прапорець <code>g</code> робить <code>test</code> залежним від стану через <code>lastIndex</code>. Для кирилиці беріть <code>\\p{L}</code> із прапорцем <code>u</code>, а не <code>\\w</code>.",
    work: "Регулярні вирази розбирають журнали, валідують ввід, витягують дані з тексту та масово замінюють фрагменти. Іменовані групи й короткі шаблони дозволяють підтримувати такий код місяцями без розшифровування власних «заклинань».",
    tasks: [
      "Чому метод <code>test</code> на виразі з прапорцем <code>g</code> може давати різні результати для того самого рядка?",
      "Чим іменована група краща за номерну і чому <code>match.groups</code> треба перевіряти?",
    ],
  },
  {
    t: "Рядкові методи й Intl",
    ch: "Стандартна бібліотека",
    easy: "Рядки це не лише текст, а й набір зручних інструментів: обрізати, доповнити, замінити, порівняти. А <code>Intl</code> уміє показувати числа, дати й множину так, як це звично у вашій мові.",
    p: [
      "Рядки в JavaScript <b>незмінні</b>: кожен метод повертає новий рядок, а оригінал лишається незайманим. Тому результат завжди треба зберегти: виклик <code>text.trim()</code> без присвоєння нічого не змінить. Тип <code>string</code> примітивний, але має методи завдяки тимчасовій обгортці, про яку вам зазвичай не потрібно думати.",
      "Щоденні методи: <code>trim()</code> прибирає пробіли по краях, <code>toUpperCase()</code> і <code>toLowerCase()</code> змінюють регістр, <code>includes</code>, <code>startsWith</code>, <code>endsWith</code> перевіряють вміст, <code>slice(from, to)</code> вирізає частину, <code>split(sep)</code> розбиває на масив, а <code>join</code> у масивів склеює назад. Метод <code>replaceAll(a, b)</code> замінює всі входження рядка без регулярного виразу, а <code>at(-1)</code> бере останній символ.",
      "Для вирівнювання є <code>padStart(len, fill)</code> і <code>padEnd</code>: <code>'7'.padStart(3, '0')</code> дає <code>007</code>. Корисно для номерів, часу й таблиць. Метод <code>repeat(n)</code> повторює рядок. Будьте уважні з <code>length</code>: вона рахує одиниці UTF-16, а не «символи, які бачить людина», тож емодзі й деякі літери з діакритикою займають по дві одиниці.",
      "Порівнювати рядки для сортування варто через <code>a.localeCompare(b, 'uk')</code>, а не операторами <code>&lt;</code> і <code>&gt;</code>. Оператори порівнюють коди символів, тому великі літери опиняються перед малими, а українські «і» та «ї» стають у списку не на своє місце. Метод <code>localeCompare</code> враховує правила мови й повертає від'ємне число, нуль або додатне.",
      "Об'єкт <code>Intl</code> це вбудована інтернаціоналізація. <code>Intl.NumberFormat</code> форматує числа й валюти, <code>Intl.DateTimeFormat</code> дати й час, <code>Intl.PluralRules</code> визначає форму множини, а <code>Intl.ListFormat</code> складає списки на кшталт «a, b і c». Налаштування задають мовою й параметрами: <code>new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })</code>.",
      "Українська множина складніша за англійську: слова змінюються в кількох формах. Метод <code>new Intl.PluralRules('uk').select(n)</code> повертає категорію <code>one</code> (1, 21, 31), <code>few</code> (2–4, 22–24), <code>many</code> (0, 5–20, 25–30) або <code>other</code> (дробові числа). За цією категорією підставляють потрібне слово: «1 файл», «2 файли», «5 файлів». Не пишіть такі правила вручну: вони вже є в платформі.",
      "Остерігайтеся залежності від середовища: результат <code>Intl</code> залежить від мови й даних, які встановлено в системі, а формати, наприклад проміжки між тисячами, можуть містити нерозривний пробіл замість звичайного. У тестах фіксуйте мову та часовий пояс (<code>timeZone: 'UTC'</code>) і не порівнюйте результати «на око»: невидимі символи ламають перевірки рівності.",
    ],
    code: [
      raw`const text = "  Привіт, світе!  ";
const clean = text.trim();

console.log(clean.toUpperCase(), clean.length);
console.log(clean.slice(0, 6), clean.at(-1), clean.includes("світ"));
console.log("7".padStart(3, "0"), "a-b-c".replaceAll("-", "+"));
console.log("a,b,c".split(",").join(" | "));
console.log("оригінал не змінився:", JSON.stringify(text));
`,
      raw`const words = ["яблуко", "Банан", "ананас", "їжак", "інжир"];

console.log([...words].sort());
console.log([...words].sort((a, b) => a.localeCompare(b, "uk")));
`,
      raw`const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
console.log(usd.format(1234.5));
console.log(new Intl.NumberFormat("en-US").format(1234567.891));

const day = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", dateStyle: "long" });
console.log(day.format(new Date(Date.UTC(2024, 2, 5))));

console.log(new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(["a", "b", "c"]));
`,
      raw`const rules = new Intl.PluralRules("uk");
const forms: Record<string, string> = { one: "файл", few: "файли", many: "файлів", other: "файлу" };

function files(count: number): string {
  return count + " " + forms[rules.select(count)];
}

console.log([0, 1, 2, 5, 11, 21, 22, 25, 1.5].map(files).join("; "));
`,
      raw`// не компілюється: рядки незмінні, символ за індексом присвоїти не можна
const word = "кіт";
word[0] = "К";
console.log(word);
`,
    ],
    note: "Рядки незмінні: методи повертають нові значення. Для сортування кирилиці беріть <code>localeCompare</code>, а форму множини дає <code>Intl.PluralRules</code>. У тестах фіксуйте мову й часовий пояс, бо <code>Intl</code> залежить від середовища.",
    work: "Інтерфейси мають показувати «1 файл», «2 файли», «5 файлів», правильно сортувати списки імен і форматувати суми та дати. Готові інструменти платформи роблять це без бібліотек і без помилок у граматиці.",
    tasks: [
      "Чому <code>text.trim()</code> без присвоєння результату нічого не змінює?",
      "Чому для сортування українських слів краще <code>localeCompare('uk')</code>, ніж оператори порівняння?",
    ],
  },
  {
    t: "Math, Number і числа з плаваючою точкою",
    ch: "Стандартна бібліотека",
    easy: "Комп'ютер зберігає дробові числа двійковим способом, тому 0,1 плюс 0,2 не дорівнює рівно 0,3. Це не помилка програми, а властивість формату, яку потрібно знати й обходити.",
    p: [
      "Усі числа в JavaScript це 64-бітні числа з плаваючою крапкою за стандартом IEEE 754. Цілі та дробові зберігаються в одному форматі <code>number</code>. Цілі числа точні до <code>Number.MAX_SAFE_INTEGER</code> (близько дев'яти квадрильйонів), а більші вже втрачають точність. Для справді великих цілих є окремий тип <code>bigint</code> із суфіксом <code>n</code>.",
      "Знамените <code>0.1 + 0.2</code> дає <code>0.30000000000000004</code>. Причина в тому, що 0,1 неможливо записати скінченним двійковим дробом, як 1/3 неможливо записати скінченним десятковим. Тому порівнювати дробові числа через <code>===</code> небезпечно. Порівнюють із допуском: <code>Math.abs(a - b) &lt; Number.EPSILON</code> для чисел близько одиниці, а для інших масштабів допуск обирають свій.",
      "Для грошей дробові числа не підходять. Надійний підхід: зберігати <b>цілу кількість найменших одиниць</b>, тобто копійок чи центів, і ділити на 100 лише при показі. Тоді додавання й віднімання точні. Ціну <code>0.10</code> зберігають як <code>10</code>. При розборі тексту потрібно акуратно перетворити його на копійки, а не множити дріб на 100 вручну без округлення.",
      "Округлення: <code>Math.round</code> округлює до найближчого цілого, а «половинки» до більшого, тож <code>Math.round(2.5)</code> дає 3, а <code>Math.round(-2.5)</code> дає -2. Також є <code>floor</code> (вниз), <code>ceil</code> (вгору), <code>trunc</code> (відкинути дріб). Метод <code>toFixed(n)</code> повертає <b>рядок</b> із фіксованою кількістю знаків, і через двійкове подання <code>(1.005).toFixed(2)</code> дає <code>'1.00'</code>, а не очікуване <code>'1.01'</code>.",
      "Перетворення рядків на числа: <code>Number('12px')</code> дає <code>NaN</code>, а <code>parseInt('12px')</code> дає 12, бо читає початок рядка. У <code>parseInt</code> завжди передавайте основу: <code>parseInt(text, 10)</code>. Для перевірок використовуйте <code>Number.isNaN</code> (точний) замість глобальної <code>isNaN</code>, що спершу приводить значення до числа й дає несподівані результати. Також є <code>Number.isInteger</code> і <code>Number.isFinite</code>.",
      "<code>NaN</code> єдине значення, що не дорівнює самому собі: <code>NaN === NaN</code> це <code>false</code>. Спеціальні значення <code>Infinity</code> і <code>-Infinity</code> з'являються при діленні на нуль без жодної помилки. Ці значення «заражають» обчислення: будь-яка операція з <code>NaN</code> дає <code>NaN</code>. Тому перевіряйте вхідні числа на межі, а не в кінці довгого обчислення, коли причину вже не знайти.",
      "У TypeScript усі ці випадки мають один тип <code>number</code>, і компілятор вас не захистить: <code>NaN</code> теж <code>number</code>. Захист це дисципліна: чисті функції, що перевіряють вхід; цілі копійки для грошей; допуск при порівнянні. Для точної десяткової арифметики в серйозних фінансових системах використовують спеціальні бібліотеки з десятковими числами.",
    ],
    code: [
      raw`console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
console.log(Number.MAX_SAFE_INTEGER, Number.isSafeInteger(2 ** 53));
console.log(9007199254740993n + 2n);
`,
      raw`console.log(Math.round(2.5), Math.round(-2.5), Math.floor(-2.5), Math.ceil(2.1), Math.trunc(-2.9));
console.log((1.005).toFixed(2), typeof (1.5).toFixed(1));
`,
      raw`function toCents(text: string): number {
  const [whole, fraction = ""] = text.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
}

function format(cents: number): string {
  return (cents / 100).toFixed(2);
}

const total = toCents("0.10") + toCents("0.20");
console.log(total, format(total));
console.log(0.1 * 3, toCents("0.10") * 3);
`,
      raw`console.log(Number("12px"), parseInt("12px", 10), parseFloat("3.14abc"), Number(""), Number("  42  "));
console.log(Number.isNaN(NaN), isNaN("abc" as unknown as number), Number.isNaN("abc" as unknown as number));
const notNumber = Number("abc");
console.log(notNumber === notNumber, 1 / 0, -1 / 0, 0 / 0);
`,
      raw`// не компілюється: додавання рядка й числа дає рядок, а не число
const input: string = "5";
const total: number = input + 1;
console.log(total);
`,
    ],
    note: "Дробові числа неточні: порівнюйте з допуском, а гроші зберігайте цілими копійками. <code>toFixed</code> повертає рядок, <code>parseInt</code> завжди з основою, а перевіряти на <code>NaN</code> слід через <code>Number.isNaN</code>.",
    work: "Ціни, податки, відсотки й статистика роблять із чисел помилки, які непомітні в тестових даних і накопичуються на тисячах операцій. Знання про плаваючу крапку допомагає не втратити копійки у звітах і не показати користувачу «19.990000000000002».",
    tasks: [
      "Чому <code>0.1 + 0.2 === 0.3</code> дає <code>false</code> і як порівнювати такі числа?",
      "Чому гроші краще зберігати цілою кількістю копійок, а не дробовим числом?",
    ],
  },
  {
    t: "Iterable<T> й протокол ітератора",
    ch: "Стандартна бібліотека",
    easy: "Об'єкт ітерований, якщо вміє віддавати свої елементи по одному: його можна пройти циклом <code>for...of</code>, розгорнути й розібрати на частини. Масиви, рядки, <code>Map</code> і <code>Set</code> уже вміють це робити.",
    p: [
      "<b>Протокол ітерації</b> це домовленість: об'єкт має метод з ім'ям <code>[Symbol.iterator]()</code>, який повертає <b>ітератор</b>, тобто об'єкт з методом <code>next()</code>. Кожен виклик <code>next()</code> повертає <code>{ value, done }</code>: наступне значення й ознаку завершення. У типах це <code>Iterable&lt;T&gt;</code> і <code>Iterator&lt;T&gt;</code>. Усе, що відповідає цьому протоколу, працює з <code>for...of</code>.",
      "Вбудовані ітеровані: масиви, рядки (за символами Unicode), <code>Map</code> (пари <code>[ключ, значення]</code>), <code>Set</code>, результат <code>matchAll</code>, <code>map.keys()</code> та інші. Звичайні об'єкти ітерованими <b>не є</b>: цикл <code>for (const x of {a: 1})</code> не скомпілюється. Для них використовують <code>Object.keys</code>, <code>Object.values</code> чи <code>Object.entries</code>, що повертають масиви.",
      "Споживачі ітерованих: цикл <code>for...of</code>, розгортання <code>[...iterable]</code> і <code>f(...iterable)</code>, деструктуризація <code>const [a, b] = iterable</code>, <code>Array.from(iterable)</code>, конструктори <code>new Set(iterable)</code> і <code>new Map(entries)</code>, а також <code>Promise.all</code>. Тому, зробивши власний клас ітерованим, ви відкриваєте для нього всі ці можливості одразу.",
      "Найзручніший спосіб зробити клас ітерованим це метод-генератор: <code>*[Symbol.iterator]() { yield ... }</code>. Він повертає генератор, який є ітератором, а <code>yield</code> віддає елементи. Метод має тип <code>Generator&lt;T&gt;</code>, а сам клас стає сумісним з <code>Iterable&lt;T&gt;</code>. Ручна реалізація <code>next()</code> потрібна рідко, наприклад для особливої поведінки на межах. Зручність генератора в тому, що весь стан, як-от поточне число в діапазоні, живе у звичайних локальних змінних, і вам не потрібно зберігати його в полях ітератора.",
      "У параметрах функцій краще приймати <code>Iterable&lt;T&gt;</code>, а не <code>T[]</code>, якщо функції потрібно лише пройти елементи. Тоді вона працює з масивом, множиною, генератором і будь-яким власним ітерованим об'єктом. Така функція не знає, чи дані вже лежать у пам'яті, чи обчислюються на льоту, і це робить її універсальною.",
      "Ітератор одноразовий: пройдений до кінця, він вичерпаний. А ітероване (масив, <code>Set</code>) на кожен цикл створює новий ітератор, тому проходиться багато разів. Проблеми виникають, коли зберігають ітератор, наприклад результат <code>set.values()</code>, і намагаються пройти його вдруге: другий прохід порожній. Зберігайте саме ітероване або перетворюйте його на масив.",
      "У сучасних версіях JavaScript ітератори отримують «ліниві» методи <code>map</code>, <code>filter</code>, <code>take</code>, <code>toArray</code>, але підтримка поки різна, тому в навчальному коді ми їх уникаємо. Корисний і дешевий прийом: <code>Array.from(iterable, mapFn)</code> перетворює ітероване на масив за один виклик, а <code>for...of</code> із <code>break</code> дає змогу зупинитись достроково.",
    ],
    code: [
      raw`const countdown: Iterable<number> = {
  [Symbol.iterator](): Iterator<number> {
    let current = 3;
    return {
      next(): IteratorResult<number> {
        if (current > 0) {
          return { value: current--, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

console.log([...countdown]);
for (const n of countdown) {
  console.log("тік", n);
}
`,
      raw`class NumberRange implements Iterable<number> {
  constructor(
    private from: number,
    private to: number,
    private step: number = 1,
  ) {}

  *[Symbol.iterator](): Generator<number> {
    for (let n = this.from; n <= this.to; n += this.step) {
      yield n;
    }
  }
}

const range = new NumberRange(1, 10, 3);
console.log([...range], Array.from(range, (n) => n * n));
console.log(new Set(range).size, Math.max(...range));
const [first, second] = range;
console.log(first, second);
`,
      raw`const letters = new Map([
  ["a", 1],
  ["b", 2],
]);
for (const [key, value] of letters) {
  console.log(key, value);
}

console.log([..."привіт"].length, [...new Set([1, 1, 2])]);

const settings = { theme: "dark", size: 12 };
for (const [key, value] of Object.entries(settings)) {
  console.log(key, value);
}
`,
      raw`// не компілюється: звичайний об'єкт не ітерований
const settings = { theme: "dark", size: 12 };

for (const item of settings) {
  console.log(item);
}
`,
      raw`const set = new Set([1, 2, 3]);
const values = set.values();

console.log([...values]);
console.log([...values]);
console.log([...set], [...set]);
`,
    ],
    note: "Ітероване має <code>[Symbol.iterator]()</code>, що повертає ітератор з <code>next()</code>. Клас легко зробити ітерованим методом-генератором. Звичайні об'єкти не ітеровані, а збережений ітератор вдруге порожній.",
    work: "Власні колекції, обгортки над даними й потокові джерела роблять ітерованими, щоб вони працювали з циклами, розгортанням, <code>Set</code>, <code>Map</code> і <code>Array.from</code> без додаткового коду. Функції, що приймають <code>Iterable</code>, зручніші в багаторазовому використанні, бо не вимагають від викликача створювати проміжні масиви лише заради передачі даних.",
    tasks: [
      "Які два методи мають бути в об'єкта, щоб він був ітерованим, і що повертає <code>next()</code>?",
      "Чому збережений ітератор <code>set.values()</code> вдруге виявляється порожнім, а сам <code>Set</code> ні?",
    ],
  },
  {
    t: "structuredClone, копіювання й незмінність",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Скопіювати об'єкт можна «поверхнево»: лише верхню полицю, а вкладені коробки лишаються спільними, або «глибоко»: усе до дна. Плутанина між цими двома способами породжує дуже підступні помилки.",
    p: [
      "Об'єкти й масиви в JavaScript передаються за <b>посиланням</b>: присвоєння <code>const b = a</code> не копіює дані, а дає два імені одному об'єкту. Зміна через одне ім'я видна через інше. Тому для незалежної копії потрібне явне копіювання. Є два рівні: поверхневе й глибоке, і вибір між ними залежить від вкладеності ваших даних.",
      "<b>Поверхневу</b> копію роблять розгортанням: <code>{ ...obj }</code>, <code>[...arr]</code> чи <code>Object.assign({}, obj)</code>. Верхній рівень копіюється, а вкладені об'єкти й масиви лишаються <i>тими самими</i>. Тому зміна вкладеного поля копії змінить і оригінал. Для плоских даних цього достатньо, а для вкладених це типова пастка, яку легко не помітити в тестах. Особливо підступно, коли «копію» віддають іншому модулю, а він починає її змінювати, і дані ламаються в зовсім іншій частині програми, ніж та, де ви шукаєте причину.",
      "<b>Глибоку</b> копію робить вбудована функція <code>structuredClone(value)</code>. Вона рекурсивно копіює об'єкти, масиви, <code>Date</code>, <code>Map</code>, <code>Set</code>, регулярні вирази, а також коректно обробляє циклічні посилання. Вона є в сучасних браузерах і в Node.js, а в типах TypeScript описана в <code>lib.dom</code>.",
      "Старий прийом <code>JSON.parse(JSON.stringify(x))</code> теж робить глибоку копію, але з втратами: <code>Date</code> стає рядком, <code>undefined</code> і функції зникають, <code>Map</code> і <code>Set</code> стають порожніми об'єктами, а <code>NaN</code> перетворюється на <code>null</code>. Тому <code>structuredClone</code> набагато кращий, коли він доступний у вашому середовищі. У старих середовищах без нього часто використовують бібліотечні функції глибокого копіювання, але для більшості сучасних застосунків вбудованої функції цілком достатньо.",
      "Обмеження <code>structuredClone</code>: він не вміє копіювати <b>функції</b> і кидає <code>DataCloneError</code>; не зберігає <b>прототипи</b>, тож екземпляр класу перетворюється на звичайний об'єкт без методів; не переносить геттери й сеттери. Для даних (записи, стан, відповіді API) це нормально, а для об'єктів із поведінкою потрібен власний метод <code>clone()</code>.",
      "Альтернатива копіюванню це <b>незмінність</b>: замість зміни існуючого об'єкта створюйте новий із потрібними змінами: <code>{ ...state, count: state.count + 1 }</code>. Для вкладених даних оновлюють лише шлях до зміни: <code>{ ...state, user: { ...state.user, nick: 'x' } }</code>. Невиправлені гілки лишаються спільними, і це економить пам'ять. Саме так працюють стани у сучасних інтерфейсах.",
      "TypeScript допомагає: <code>readonly</code> на властивостях, <code>ReadonlyArray&lt;T&gt;</code> і утиліта <code>Readonly&lt;T&gt;</code> забороняють змінювати дані на рівні типів, але лише <b>поверхнево</b> й лише під час компіляції. Під час виконання <code>Object.freeze</code> теж заморожує тільки верхній рівень. Для справжньої глибокої незмінності застосовують рекурсивний тип <code>DeepReadonly</code> або власну рекурсивну заморозку.",
    ],
    code: [
      raw`const original = { title: "Звіт", author: { name: "Олена" }, tags: ["a"] };
const alias = original;
const shallow = { ...original };

alias.title = "Змінено через alias";
shallow.author.name = "Ігор";
shallow.tags.push("b");

console.log(original.title, original.author.name, original.tags);
console.log(shallow.title);
`,
      raw`const source = { created: new Date(0), ids: new Set([1, 2]), nested: { deep: [1, 2] } };
const clone = structuredClone(source);

clone.nested.deep.push(3);
clone.ids.add(9);

console.log(source.nested.deep, [...source.ids]);
console.log(clone.created instanceof Date, clone.created === source.created);
`,
      raw`class Counter {
  count = 0;

  inc(): void {
    this.count++;
  }
}

const counter = new Counter();
counter.inc();

const copy = structuredClone(counter);
console.log(copy, typeof (copy as Counter).inc);

try {
  structuredClone({ run() {} });
} catch (error) {
  console.log(error instanceof Error ? error.name : error);
}
`,
      raw`interface State {
  count: number;
  user: { nick: string; tags: string[] };
}

const state: State = { count: 0, user: { nick: "olena", tags: ["a"] } };
const next: State = { ...state, count: state.count + 1, user: { ...state.user, nick: "ihor" } };

console.log(state.count, state.user.nick, next.count, next.user.nick);
console.log("tags спільні:", state.user.tags === next.user.tags);
`,
      raw`// не компілюється: Readonly забороняє присвоєння властивостям
const config: Readonly<{ port: number }> = { port: 80 };
config.port = 8080;
console.log(config);
`,
    ],
    note: "Присвоєння об'єкта дає друге ім'я, розгортання копіює лише верхній рівень, а глибоку копію робить <code>structuredClone</code>. Він не копіює функції та методи класів. Надійніше оновлювати дані незмінно, створюючи нові об'єкти.",
    work: "Стан застосунків, історія змін, «скасувати/повторити» й порівняння версій спираються на коректне копіювання. Незмінні оновлення дозволяють швидко з'ясувати, що саме змінилося, а помилки зі спільними вкладеними об'єктами зникають.",
    tasks: [
      "Чому зміна вкладеного поля в поверхневій копії <code>{ ...obj }</code> змінює й оригінал?",
      "Які дані <code>structuredClone</code> не зможе скопіювати або скопіює не повністю?",
    ],
  },
  {
    t: "URL і URLSearchParams",
    ch: "Стандартна бібліотека",
    easy: "Адреса сайту це структура з частин: протокол, хост, шлях, параметри. Об'єкт <code>URL</code> розкладає рядок на ці частини, а <code>URLSearchParams</code> складає й розбирає параметри запиту, не змушуючи вас вручну екранувати символи.",
    p: [
      "Рядок адреси здається простим, але має чітку структуру: <code>https://example.com:8080/a/b?x=1&amp;y=2#top</code>. Це протокол (<code>https:</code>), хост (<code>example.com</code>), порт, шлях (<code>/a/b</code>), параметри запиту (після <code>?</code>) і фрагмент (після <code>#</code>). Розбирати таку структуру регулярними виразами чи розбиттям рядків ненадійно, тому є вбудований клас <code>URL</code>.",
      "Виклик <code>new URL(text)</code> розбирає адресу й дає властивості: <code>protocol</code>, <code>hostname</code>, <code>port</code>, <code>pathname</code>, <code>search</code>, <code>hash</code>, <code>origin</code>, <code>href</code>. Якщо рядок не є коректною абсолютною адресою, конструктор кидає <code>TypeError</code>. Тому адреси від користувача розбирають у <code>try/catch</code>. У нових середовищах є ще <code>URL.canParse(text)</code>, що перевіряє це без винятку.",
      "Другий аргумент задає базу для відносних адрес: <code>new URL('../c?q=1', 'https://e.com/a/b/d')</code> дає <code>https://e.com/a/c?q=1</code>. Так само поводиться браузер із посиланнями на сторінці. Це зручніше й безпечніше, ніж склеювати рядки: об'єкт сам обробляє крапки в шляху, слеші й повторювані роздільники.",
      "Параметри запиту зручно читати через <code>url.searchParams</code>, об'єкт <code>URLSearchParams</code>. Методи: <code>get(name)</code> повертає перше значення або <code>null</code>, <code>getAll(name)</code> усі значення, а ще <code>has</code>, <code>append</code>, <code>set</code>, <code>delete</code>, <code>sort</code>, <code>toString()</code>. Для обходу є <code>forEach((value, key) =&gt; ...)</code>, а коли в tsconfig підключено бібліотеку <code>dom.iterable</code>, об'єкт стає ітерованим і працює в циклі <code>for...of</code> та з <code>Object.fromEntries</code>.",
      "Найважливіша перевага це <b>автоматичне екранування</b>. Символи на кшталт пробілу, <code>&amp;</code>, <code>=</code>, а також кирилиця мають бути закодовані у відсотковій формі, інакше адреса зламається. <code>URLSearchParams</code> робить це сам. Не склеюйте параметри вручну через <code>+</code>: один зайвий амперсанд у значенні зіпсує запит або відкриє вразливість, коли значення прийшло від користувача.",
      "Зверніть увагу: <code>get</code> завжди повертає <b>рядок або null</b>, навіть для чисел. Виклик <code>params.get('page')</code> дає <code>'3'</code>, а не 3, тож число треба перетворити й перевірити на <code>NaN</code> та допустимий діапазон. Відсутній параметр і порожній (<code>?page=</code>) відрізняються: перший дає <code>null</code>, другий порожній рядок. Саме тут часто ховаються помилки валідації. Хороше правило: ніколи не довіряйте параметрам із адреси, а перетворюйте їх на потрібний тип одним місцем, у спеціальній функції, і перевіряйте діапазон.",
      "У TypeScript <code>URL</code> і <code>URLSearchParams</code> описані у <code>lib.dom</code>, а в Node.js це глобальні класи. Для побудови адреси задавайте частини окремо: <code>url.pathname = '/search'</code>, <code>url.searchParams.set('q', text)</code>, а потім беріть <code>url.href</code>. Не використовуйте імена <code>URL</code> чи <code>URLSearchParams</code> для власних типів, щоб не конфліктувати з вбудованими оголошеннями.",
    ],
    code: [
      raw`const address = new URL("https://example.com:8080/a/b?x=1&y=2&x=3#top");
console.log(address.protocol, address.hostname, address.port);
console.log(address.pathname, address.search, address.hash);
console.log(address.origin);
console.log(address.searchParams.get("x"), address.searchParams.getAll("x"), address.searchParams.get("z"));
console.log(new URL("../c?q=1", "https://e.com/a/b/d").href);
`,
      raw`const search = new URL("https://shop.example/search");
search.searchParams.set("q", "привіт світ");
search.searchParams.set("note", "1&2=3");
search.searchParams.append("tag", "a");
search.searchParams.append("tag", "b");

console.log(search.href);
search.searchParams.forEach((value, key) => {
  console.log(key, "=", value);
});
`,
      raw`function readPage(params: URLSearchParams): number {
  const rawPage = params.get("page");
  const page = rawPage === null ? 1 : Number(rawPage);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

for (const query of ["", "?page=3", "?page=", "?page=abc", "?page=2.5"]) {
  console.log(JSON.stringify(query), readPage(new URLSearchParams(query)));
}
`,
      raw`// не компілюється: get повертає string | null, а не number
const params = new URLSearchParams("page=3");
const page: number = params.get("page");
console.log(page);
`,
      raw`// аварія: new URL кидає TypeError, якщо рядок не є абсолютною адресою
console.log("розбираємо адресу");
const broken = new URL("не адреса");
console.log(broken.href);
`,
    ],
    note: "Клас <code>URL</code> розбирає адресу на частини й кидає <code>TypeError</code> на некоректному рядку. <code>URLSearchParams</code> сам екранує значення, а його <code>get</code> завжди повертає рядок або <code>null</code>, тому числа перевіряйте самі.",
    work: "Пошукові рядки, фільтри, пагінація, посилання з параметрами й виклики API будують через <code>URL</code>. Це захищає від зламаних адрес, зайвих амперсандів і помилок кодування кирилиці у значеннях, які вводить користувач.",
    tasks: [
      "Чому параметри запиту краще збирати через <code>URLSearchParams</code>, а не склеювати рядки вручну?",
      "Чим відрізняється відсутній параметр <code>?page</code> від порожнього <code>?page=</code> при читанні через <code>get</code>?",
    ],
  },
  {
    t: "Файли оголошень .d.ts і declare",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Файл оголошень це паспорт для коду без паспорта: він описує, що існує й які в цього типи, але не містить самого коду. Завдяки таким файлам TypeScript розуміє бібліотеки, написані на звичайному JavaScript.",
    p: [
      "Файл із розширенням <code>.d.ts</code> містить лише <b>оголошення типів</b>, без виконуваного коду. Це «опис інтерфейсу» для коду, що існує деінде: для бібліотеки на JavaScript, глобальної змінної, яку додає сторінка, чи модуля, що підключається збирачем. Компілятор читає такі файли й знає, які функції є, що вони приймають і що повертають.",
      "Ключове слово <code>declare</code> каже: «це існує десь у середовищі, не створюй його, лише повір на слово». Оголошення <code>declare const VERSION: string;</code> описує глобальну змінну, <code>declare function greet(name: string): string;</code> функцію, <code>declare class Parser { parse(text: string): unknown }</code> клас. У JavaScript така інструкція зникає, тож за наявність значення відповідаєте ви: якщо його нема, під час виконання буде <code>ReferenceError</code>.",
      "Для бібліотек із npm типи беруть із пакетів <code>@types/...</code>, наприклад <code>@types/node</code>, або з самої бібліотеки, якщо вона постачає свої <code>.d.ts</code>. Якщо типів нема, можна написати власні: <code>declare module 'old-lib' { export function run(x: number): string; }</code>. Тоді імпорт <code>import { run } from 'old-lib'</code> отримає типи, а компілятор не скаржитиметься на відсутність оголошення.",
      "Розширювати чужі типи дозволяє <b>злиття оголошень</b>. Інтерфейси з однаковою назвою об'єднуються: можна додати свої методи до <code>Array</code> чи <code>String</code>. Але у файлі-модулі, де є <code>import</code> чи <code>export</code>, глобальні розширення пишуть усередині блока <code>declare global { ... }</code>. Це зручно, наприклад, щоб додати поле до <code>Window</code> у браузері чи метод до вбудованого типу.",
      "Додавання методів до вбудованих типів вимагає двох частин. Перша це <b>тип</b>: <code>declare global { interface String { capitalize(): string } }</code>. Друга це <b>реалізація</b>: присвоєння функції в <code>String.prototype.capitalize</code>. Якщо забути другу, код скомпілюється, а під час виконання впаде з <code>TypeError</code>. Тип без реалізації це обіцянка, яку ніхто не виконав. Загалом розширення вбудованих прототипів вважають поганою практикою, бо вони можуть конфліктувати між бібліотеками.",
      "Розрізняйте оголошення й реалізацію: файл <code>.ts</code> містить і те й інше, файл <code>.d.ts</code> лише оголошення. Прапорець <code>declaration: true</code> змушує компілятор створювати <code>.d.ts</code> поруч зі скомпільованим <code>.js</code>, щоб інші проєкти могли користуватися вашою бібліотекою з типами. Поле <code>types</code> у <code>package.json</code> вказує, де лежить головний файл оголошень пакета.",
      "Типові помилки: оголосити через <code>declare</code> те, чого нема (отримаєте <code>ReferenceError</code>); написати оголошення, що не збігається з реальністю (отримаєте тихі помилки типів); забути <code>export {}</code>, і файл стане глобальним скриптом з усіма наслідками. Пишіть оголошення за документацією, а не «з голови», і покривайте їх тестами типів, про які ми поговоримо в наступному розділі.",
    ],
    code: [
      raw`// лише компіляція: declare лише описує значення, самого значення тут немає
declare const VERSION: string;
declare function greet(userName: string): string;
declare class Parser {
  parse(text: string): unknown;
}

const label: string = greet("Олена") + VERSION;
const parser = new Parser();
const result: unknown = parser.parse("{}");
console.log(label, result);
`,
      raw`export {};

declare global {
  interface String {
    capitalize(): string;
  }
}

String.prototype.capitalize = function (this: string): string {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

console.log("привіт".capitalize(), "world".capitalize());
`,
      raw`// лише компіляція: власні оголошення для бібліотеки без типів
declare module "old-lib" {
  export function run(x: number): string;
  export const version: string;
}
`,
      raw`// не компілюється: метод не оголошено в інтерфейсі String
console.log("привіт".capitalize());
`,
      raw`// аварія: declare лише обіцяє значення, а в середовищі його нема
declare const CONFIG: { port: number };

console.log("читаємо конфігурацію");
console.log(CONFIG.port);
`,
    ],
    note: "<code>declare</code> лише описує існуюче, а <code>.d.ts</code> містить тільки оголошення. Для розширення вбудованих типів у модулі потрібен <code>declare global</code>, а для роботи методу ще й реалізація. Оголошення без значення дає <code>ReferenceError</code>.",
    work: "Файли оголошень дозволяють безпечно користуватися бібліотеками на чистому JavaScript, глобальними змінними сторінок і старим кодом. Вони ж є «обкладинкою» ваших власних пакетів: за ними редактори дають підказки користувачам вашої бібліотеки.",
    tasks: [
      "Що означає <code>declare</code> і чому за наявність оголошеного значення відповідає розробник?",
      "Навіщо потрібен блок <code>declare global</code> у файлі, де є <code>export</code>?",
    ],
  },
  {
    t: "DOM-типи без DOM: лише компіляція",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Типи DOM описують сторінку: кнопки, поля, події. У Node.js сторінки немає, але самі типи в компіляторі є, і їх можна використовувати, щоб перевіряти код для браузера, навіть не відкриваючи браузер.",
    p: [
      "TypeScript за замовчуванням підключає бібліотеку типів <code>lib.dom</code>: опис браузерного середовища з класами <code>HTMLElement</code>, <code>HTMLInputElement</code>, <code>MouseEvent</code>, значеннями <code>document</code>, <code>window</code> і функцією <code>fetch</code>. Вона потрібна, щоб код для браузера компілювався з перевіркою типів. Але лише як <b>опис</b>: сам DOM існує тільки в браузері, а в Node.js виклик <code>document.getElementById</code> завершиться <code>ReferenceError</code>.",
      "Через це навчальні приклади з DOM мають маркер «лише компіляція»: ми перевіряємо, що код проходить типи, але не запускаємо його. Для вас це хороша навичка: писати код інтерфейсу, який компілюється, навіть коли немає сторінки. А справжня перевірка поведінки відбувається в браузері або в тестовому середовищі з емуляцією DOM, наприклад jsdom.",
      "Пошук елементів у DOM повертає тип із <code>null</code>: <code>document.getElementById('id')</code> має тип <code>HTMLElement | null</code>, бо елемента може не бути. TypeScript змушує перевірити: <code>if (el) { ... }</code> або явно сказати «я впевнений» через <code>!</code> чи приведення. Вибір за тегом <code>document.querySelector('input')</code> повертає вужчий тип, а для довільних селекторів потрібне узагальнення: <code>querySelector&lt;HTMLInputElement&gt;('#email')</code>.",
      "Обробники подій теж типізовані: <code>element.addEventListener('click', (event) =&gt; { ... })</code> знає, що <code>event</code> це <code>MouseEvent</code>, бо назву події 'click' пов'язано з типом через спеціальну мапу. Для <code>'input'</code> це загальний <code>Event</code>, для <code>'keydown'</code> <code>KeyboardEvent</code>. Така типобезпека не дозволить звернутися до властивості <code>key</code> у події кліку.",
      "Поле <code>event.target</code> має загальний тип <code>EventTarget | null</code>, тому щоб прочитати <code>value</code> поля, потрібне звуження: <code>if (event.target instanceof HTMLInputElement) { event.target.value }</code>. Використовуйте <code>event.currentTarget</code>, коли обробник навішено саме на цей елемент, і приведення <code>as</code> лише тоді, коли справді впевнені: <code>instanceof</code> безпечніше, бо перевіряється під час виконання.",
      "Головний прийом для тестованого коду: <b>залежати від вузького інтерфейсу, а не від усього DOM</b>. Функція, що читає значення форми, може приймати <code>Pick&lt;HTMLInputElement, 'value' | 'checked'&gt;</code>: їй потрібні лише ці дві властивості. Тоді в тесті вона отримує звичайний об'єкт <code>{ value: 'x', checked: true }</code>, а в браузері справжній елемент. Структурна типізація TypeScript робить таке «підставлення» безкоштовним.",
      "Остерігайтеся ставити DOM-типи там, де їх немає. Код для Node.js (сервер, скрипти) не повинен покладатися на <code>document</code> чи <code>window</code>. Для цього в tsconfig налаштовують <code>lib</code> без <code>dom</code> і підключають <code>@types/node</code>, тоді компілятор сам попередить про випадкове використання браузерних глобалів. Розділяйте код на логіку, незалежну від середовища, і тонкий шар, що торкається DOM.",
    ],
    code: [
      raw`// лише компіляція: у Node.js немає document, тому код лише перевіряється типами
const title = document.getElementById("title");
if (title) {
  title.textContent = "Привіт";
}

const email = document.querySelector<HTMLInputElement>("#email");
console.log(email?.value.length);
`,
      raw`// лише компіляція: тип події залежить від її назви
const button = document.querySelector("button");
button?.addEventListener("click", (event) => {
  console.log(event.clientX, event.button);
});

document.addEventListener("keydown", (event) => {
  console.log(event.key);
});
`,
      raw`// лише компіляція: event.target треба звузити перед читанням value
document.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    console.log(target.value.trim());
  }
});
`,
      raw`type FormFields = Pick<HTMLInputElement, "value" | "checked">;

function summarize(field: FormFields): string {
  return (field.checked ? "так" : "ні") + ": " + field.value.trim();
}

console.log(summarize({ value: "  Олена ", checked: true }));
console.log(summarize({ value: "Ігор", checked: false }));
`,
      raw`// не компілюється: у події кліку немає властивості key
document.addEventListener("click", (event) => {
  console.log(event.key);
});
`,
    ],
    note: "Типи DOM існують лише в компіляторі, у Node.js самого DOM немає. Результати пошуку містять <code>null</code>, тип події залежить від її назви, а <code>event.target</code> звужують через <code>instanceof</code>. Для тестів залежіть від вузького <code>Pick</code>.",
    work: "Логіку форм, валідації й обробників можна перевірити без браузера, якщо вона залежить від маленького інтерфейсу, а не від усього DOM. Така розділена архітектура швидше тестується й легше переноситься між середовищами.",
    tasks: [
      "Чому <code>document.getElementById</code> повертає тип з <code>null</code> і що з цим робити?",
      "Яка перевага в функції, що приймає <code>Pick&lt;HTMLInputElement, 'value'&gt;</code>, а не весь елемент?",
    ],
  },
  {
    t: "tsconfig: важливі прапорці",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Файл tsconfig.json це пульт керування компілятором: тут вмикають суворість, обирають цільову версію JavaScript і кажуть, які файли брати. Кілька правильних перемикачів ловлять цілі класи помилок ще до запуску.",
    p: [
      "Файл <code>tsconfig.json</code> лежить у корені проєкту й описує, як компілювати: які файли входять (<code>include</code>, <code>exclude</code>), у яку версію JavaScript перетворювати (<code>target</code>), які бібліотеки типів підключати (<code>lib</code>), який формат модулів (<code>module</code>) і наскільки суворо перевіряти типи. Запуск <code>tsc</code> без аргументів читає цей файл. Команда <code>tsc --init</code> створює заготовку з коментарями до кожного прапорця, і її зручно використовувати як довідник, але зайве з неї краще прибрати, щоб конфігурація лишалась короткою та зрозумілою для всієї команди.",
      "Найважливіший прапорець це <code>strict</code>. Він вмикає цілу групу суворих перевірок: <code>strictNullChecks</code> (<code>null</code> і <code>undefined</code> не належать до інших типів), <code>noImplicitAny</code> (не можна лишати тип невизначеним), <code>strictFunctionTypes</code>, <code>strictPropertyInitialization</code>, <code>useUnknownInCatchVariables</code> та інші. У нових проєктах <code>strict: true</code> має бути завжди; без нього половина користі TypeScript втрачається.",
      "Окремі корисні перевірки поза <code>strict</code>: <code>noUncheckedIndexedAccess</code> робить результат індексного доступу типом <code>T | undefined</code>, <code>exactOptionalPropertyTypes</code> розрізняє «відсутнє поле» й «поле зі значенням undefined», <code>noImplicitOverride</code> вимагає слова <code>override</code> у перевизначених методах, <code>noFallthroughCasesInSwitch</code> ловить забуті <code>break</code>, а <code>noImplicitReturns</code> вимагає повертати значення на всіх шляхах.",
      "<code>target</code> і <code>lib</code> часто плутають. <code>target</code> каже, у яку версію JavaScript <i>перекласти синтаксис</i> (стрілкові функції, <code>?.</code>, класи). <code>lib</code> каже, які <i>вбудовані API</i> вважати існуючими (<code>Promise</code>, <code>Map</code>, <code>Intl</code>, DOM). Нова версія <code>target</code> не додає нових API: якщо середовище їх не має, вони не з'являться від налаштування, і потрібен поліфіл.",
      "Налаштування модулів: <code>module</code> задає формат виводу (<code>commonjs</code>, <code>esnext</code>, <code>nodenext</code>), а <code>moduleResolution</code> спосіб пошуку файлів за іменами імпортів. Для Node.js сучасний вибір <code>nodenext</code>, для проєктів зі збирачем, як-от Vite чи esbuild, <code>bundler</code>. Прапорець <code>esModuleInterop</code> полегшує імпорт старих CommonJS-пакетів, а <code>resolveJsonModule</code> дозволяє імпортувати файли <code>.json</code>.",
      "Допоміжні прапорці: <code>skipLibCheck</code> пропускає перевірку чужих <code>.d.ts</code> і прискорює збірку, <code>noEmit</code> лише перевіряє типи без створення файлів (зручно, коли збирає інший інструмент), <code>sourceMap</code> дає відповідність між скомпільованим і початковим кодом для налагодження, <code>declaration</code> створює <code>.d.ts</code>, а <code>outDir</code> і <code>rootDir</code> керують розташуванням виводу.",
      "Типова порада: починайте зі <code>strict: true</code> і не вимикайте його при першій складності; додавайте суворіші прапорці поступово. Для великого старого коду вмикайте строгість <b>по одному прапорцю</b>, виправляючи помилки хвилями. Також корисно наслідувати налаштування через <code>extends</code> від спільної бази й не копіювати великі конфіги між проєктами, адже розбіжності між копіями рано чи пізно призводять до ситуації, коли той самий код компілюється в одному пакеті й падає в іншому. Пам'ятайте, що <code>tsconfig</code> дозволяє коментарі, на відміну від звичайного JSON.",
    ],
    code: [
      raw`// фрагмент: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
`,
      raw`// фрагмент: термінал
npx tsc --init
npx tsc --noEmit
npx tsc --watch
`,
      raw`// не компілюється: параметри без типів, а noImplicitAny (входить у strict) забороняє неявний any
function add(a, b) {
  return a + b;
}

console.log(add(1, 2));
`,
      raw`// не компілюється: strictNullChecks забороняє присвоїти null рядку
const title: string = null;
console.log(title);
`,
      raw`const options: Record<string, unknown> = { target: "ES2022", strict: true, skipLibCheck: true };
const recommended = ["strict", "noUncheckedIndexedAccess", "noImplicitOverride"];

const missing = recommended.filter((flag) => options[flag] !== true);
console.log("не вистачає:", missing.join(", "));
`,
    ],
    note: "Починайте зі <code>strict: true</code> і додавайте суворіші прапорці поступово. <code>target</code> змінює синтаксис, а <code>lib</code> вказує існуючі API. <code>noEmit</code> лише перевіряє типи, а <code>skipLibCheck</code> прискорює збірку.",
    work: "Правильний tsconfig це перший рядок захисту проєкту: він вмикає перевірки, що ловлять помилки з <code>null</code>, індексами й забутими гілками ще до запуску. Спільна база через <code>extends</code> тримає однакові правила в усіх пакетах команди.",
    tasks: [
      "Яку роль відіграє прапорець <code>strict</code> і які перевірки він вмикає?",
      "Чим <code>target</code> відрізняється від <code>lib</code> у tsconfig?",
    ],
  },
];
