// Завдання глави 2 «Основи мови» (уроки 5–18). Еталони: tests/solutions/ts-ch02.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "ts-vars-inference", lesson: "ts/5", xp: 15,
    title: "Лічильник відвідувачів: const, let і виведення типів",
    context: "У щоденному коді з типами майже не пишуть анотацій: їх виводить компілятор. Важливо вибрати між const і let, бо від цього залежить, чи можна змінити значення і який тип отримає змінна.",
    brief: [
      "Змінна <code>visitors</code> оголошена через <code>let</code>, її треба збільшити на три. Оголосіть <code>const rate = 0.5</code> (дохід від одного відвідувача) та <code>const income = visitors * rate</code>.",
      "Програма має вивести рядок <code>Iteris: 3 відвідувачів, дохід 1.5</code>. Анотації типів писати не потрібно: усе виведеться саме.",
    ],
    starter: raw`const siteName = "Iteris";
let visitors = 0;

// TODO: збільште visitors на 3
// TODO: оголосіть const rate = 0.5
// TODO: оголосіть const income = visitors * rate

console.log(siteName + ": " + visitors + " відвідувачів, дохід " + income);
`,
    checks: [
      { on: "stdout", name: "Виводить «Iteris: 3 відвідувачів, дохід 1.5»", equals: "Iteris: 3 відвідувачів, дохід 1.5", hint: "Після зміни visitors має бути 3, а дохід 3 * 0.5 = 1.5." },
      { on: "source", name: "Ставка оголошена через const", matches: "const\\s+rate\\s*=\\s*0\\.5", hint: "Запишіть: const rate = 0.5;" },
      { on: "source", name: "Дохід обчислено з visitors і rate", matches: "const\\s+income\\s*=\\s*visitors\\s*\\*\\s*rate", hint: "Запишіть: const income = visitors * rate;" },
    ],
  },
  {
    ...base, id: "ts-basic-types", lesson: "ts/6", xp: 15,
    title: "Профіль користувача: базові типи",
    context: "Імена, вік і прапорці це найпростіші дані будь-якого застосунку. Коли тип записано, компілятор не дасть сплутати число з текстом, що часто стається, коли значення приходить із форми як рядок.",
    brief: [
      "У заготовці змінні <code>age</code> і <code>isStudent</code> мають значення не того типу, і код не компілюється. Виправте значення: вік це число <code>29</code>, а <code>isStudent</code> це булеве <code>true</code>. Анотації типів лишіть.",
      "Програма має вивести <code>Оля, 29, студент: так</code>.",
    ],
    starter: raw`const userName: string = "Оля";
const age: number = "29";
const isStudent: boolean = "так";

console.log(userName + ", " + age + ", студент: " + (isStudent ? "так" : "ні"));
`,
    checks: [
      { on: "stdout", name: "Виводить «Оля, 29, студент: так»", equals: "Оля, 29, студент: так", hint: "age має бути числом 29, а isStudent значенням true." },
      { on: "source", name: "age: number зі значенням 29", matches: "age\\s*:\\s*number\\s*=\\s*29\\b", hint: "Запишіть: const age: number = 29;" },
      { on: "source", name: "isStudent: boolean зі значенням true", matches: "isStudent\\s*:\\s*boolean\\s*=\\s*true\\b", hint: "Запишіть: const isStudent: boolean = true;" },
    ],
  },
  {
    ...base, id: "ts-bigint-factorial", lesson: "ts/7", xp: 25,
    title: "Факторіал на bigint",
    context: "Факторіал швидко виходить за межі безпечних цілих у number, і результат стає неточним. Для таких обчислень, а також для великих ідентифікаторів, використовують bigint, що зберігає будь-яке ціле точно.",
    brief: [
      "Допишіть <code>factorial(n: bigint): bigint</code>, яка повертає добуток чисел від 1 до <code>n</code>. Для <code>0n</code> факторіал дорівнює <code>1n</code>.",
      "Програма виводить <code>factorial(5n)</code>, <code>factorial(20n)</code> та <code>factorial(25n)</code>. Останнє число вже не поміщається в number, але bigint порахує його точно.",
    ],
    starter: raw`function factorial(n: bigint): bigint {
  // TODO: добуток 1 * 2 * ... * n
  return 1n;
}

console.log(factorial(5n).toString());
console.log(factorial(20n).toString());
console.log(factorial(25n).toString());
`,
    checks: [
      { on: "stdout", name: "Факторіали 5, 20 і 25", equals: "120\n2432902008176640000\n15511210043330985984000000", hint: "25! дорівнює 15511210043330985984000000. Множте bigint на bigint: result *= i." },
      { on: "source", name: "Використано bigint-літерали з n", matches: "\\d+n\\b", hint: "Усі числа в обчисленні мають бути bigint: 1n, 2n і так далі." },
      { on: "source", name: "Без перетворення в number", matches: "^(?![\\s\\S]*Number\\()[\\s\\S]*$", hint: "Не перетворюйте bigint на number: точність втратиться." },
    ],
  },
  {
    ...base, id: "ts-format-strings", lesson: "ts/8", xp: 20,
    title: "Форматування імені та slug",
    context: "Імена потрібно показувати акуратно, а заголовки перетворювати на адреси сторінок. Саме такі дрібні рядкові функції з'являються в будь-якому проєкті, і шаблонні літерали роблять їх читабельними.",
    brief: [
      "Допишіть <code>formatName(first: string, last: string): string</code>: прізвище з великої літери, потім пробіл, потім перша літера імені великою і крапка. Приклад: <code>олена</code> і <code>коваль</code> дають <code>Коваль О.</code>.",
      "Допишіть <code>slugify(title: string): string</code>: обрізає пробіли по краях, переводить у нижній регістр і з'єднує слова дефісами (кілька пробілів поспіль це один роздільник).",
    ],
    starter: raw`function formatName(first: string, last: string): string {
  // TODO: "Коваль О."
  return "";
}

function slugify(title: string): string {
  // TODO: "мій-перший-пост"
  return "";
}

console.log(formatName("олена", "коваль"));
console.log(slugify("  Мій перший   Пост "));
`,
    checks: [
      { on: "stdout", name: "Виводить «Коваль О.» і «мій-перший-пост»", equals: "Коваль О.\nмій-перший-пост", hint: "Для великої першої літери: s[0].toUpperCase() + s.slice(1)." },
      { on: "source", name: "Використано шаблонний літерал", matches: "`[^`]*\\$\\{", hint: "Склейте частини через шаблонний літерал: зворотні апострофи й ${...}." },
      { on: "source", name: "Використано trim", matches: "\\.trim\\(\\)", hint: "Прибрати пробіли по краях допоможе trim()." },
    ],
  },
  {
    ...base, id: "ts-null-safe", lesson: "ts/9", xp: 20,
    title: "Безпечне читання вкладених полів",
    context: "Відповіді API часто мають необов'язкові вкладені поля. Ланцюжок ?. разом із ?? дає безпечне читання з запасним значенням, і не потрібні гори перевірок if для кожного рівня вкладеності.",
    brief: [
      "Допишіть <code>getCity(user: User | undefined): string</code>: вона повертає місто користувача або <code>невідомо</code>, якщо користувача, адреси чи міста немає.",
      "Допишіть <code>visitsOrOne(visits: number | undefined): number</code>: повертає кількість візитів, а якщо значення немає, то <code>1</code>. Нуль це нормальне значення і лишається нулем.",
    ],
    starter: raw`type User = { name: string; address?: { city?: string } };

function getCity(user: User | undefined): string {
  // TODO: безпечне читання user.address.city
  return "";
}

function visitsOrOne(visits: number | undefined): number {
  // TODO: 1, якщо значення немає, але 0 лишається 0
  return 0;
}

console.log(getCity({ name: "Анна", address: { city: "Львів" } }));
console.log(getCity({ name: "Олег" }));
console.log(getCity(undefined));
console.log(visitsOrOne(undefined), visitsOrOne(0), visitsOrOne(7));
`,
    checks: [
      { on: "stdout", name: "Міста та візити виводяться правильно", equals: "Львів\nневідомо\nневідомо\n1 0 7", hint: "visitsOrOne(0) має повернути 0, а не 1: використайте ??, а не ||." },
      { on: "source", name: "Використано ланцюжок ?.", matches: "\\?\\.", hint: "Читайте так: user?.address?.city." },
      { on: "source", name: "Використано ??", matches: "\\?\\?", hint: "Запасне значення підставляйте через ??." },
    ],
  },
  {
    ...base, id: "ts-unknown-safe", lesson: "ts/10", xp: 25,
    title: "Безпечне перетворення unknown на число",
    context: "Дані з форм, JSON і зовнішніх бібліотек приходять без гарантій. Тип unknown змушує перевірити значення, перш ніж ним користуватися, і саме так пишуть захищений код на межі програми.",
    brief: [
      "Допишіть <code>toNumber(value: unknown): number | null</code>. Число (не <code>NaN</code>) повертається як є. Рядок з числом (наприклад <code>\"3.5\"</code>) перетворюється на число. Усе інше, зокрема порожній рядок і <code>NaN</code>, дає <code>null</code>.",
      "Тип параметра має лишитися <code>unknown</code>, не <code>any</code>.",
    ],
    starter: raw`function toNumber(value: unknown): number | null {
  // TODO: число, числовий рядок або null
  return null;
}

const samples: unknown[] = [42, "3.5", "abc", null, true, "", NaN];
for (const sample of samples) {
  console.log(toNumber(sample));
}
`,
    checks: [
      { on: "stdout", name: "Результати для семи значень", equals: "42\n3.5\nnull\nnull\nnull\nnull\nnull", hint: "Порожній рядок і NaN також дають null: Number(\"\") це 0, тож порожній рядок відсійте окремо." },
      { on: "source", name: "Параметр має тип unknown", matches: "toNumber\\s*\\(\\s*value\\s*:\\s*unknown", hint: "Лишіть сигнатуру: toNumber(value: unknown)." },
      { on: "source", name: "Є перевірки typeof", matches: "typeof\\s+value", hint: "Розгляньте окремо typeof value === \"number\" та \"string\"." },
    ],
  },
  {
    ...base, id: "ts-literal-config", lesson: "ts/11", xp: 20,
    title: "Налаштування з літеральними типами",
    context: "Режими інтерфейсу, ролі й статуси мають обмежений набір значень. Літеральні типи не дають передати зайве, а as const зберігає точні типи значень у спільному об'єкті налаштувань.",
    brief: [
      "Функція <code>applyTheme</code> приймає лише <code>\"light\"</code> або <code>\"dark\"</code>, але <code>settings.theme</code> має тип <code>string</code>, тому код не компілюється.",
      "Виправте оголошення <code>settings</code> так, щоб поле зберегло літеральний тип. Програма має вивести <code>Тема: dark, шрифт 16</code>.",
    ],
    starter: raw`type Theme = "light" | "dark";

function applyTheme(theme: Theme, fontSize: number): string {
  return "Тема: " + theme + ", шрифт " + fontSize;
}

const settings = { theme: "dark", fontSize: 16 };

console.log(applyTheme(settings.theme, settings.fontSize));
`,
    checks: [
      { on: "stdout", name: "Виводить «Тема: dark, шрифт 16»", equals: "Тема: dark, шрифт 16", hint: "Після виправлення типів програма має скомпілюватися й вивести цей рядок." },
      { on: "source", name: "Використано as const", matches: "as\\s+const", hint: "Додайте as const після об'єкта: { ... } as const." },
      { on: "source", name: "Без as any і without приведення типу", matches: "^(?![\\s\\S]*\\bas\\s+any\\b)[\\s\\S]*$", hint: "Не обходьте перевірку через as any: правильне рішення це as const." },
    ],
  },
  {
    ...base, id: "ts-union-literals", lesson: "ts/12", xp: 20,
    title: "Статуси й ідентифікатори: union-типи",
    context: "Статус завантаження, режим доступу та ідентифікатор, що буває числом або рядком, це типові union-типи. Вони чесно описують допустимі варіанти, а компілятор слідкує, щоб ви не забули жодного.",
    brief: [
      "Допишіть <code>statusLabel(status: Status): string</code>: <code>idle</code> дає <code>Очікування</code>, <code>loading</code> дає <code>Завантаження</code>, <code>done</code> дає <code>Готово</code>.",
      "Допишіть <code>formatId(id: string | number): string</code>, що повертає <code>#</code> та ідентифікатор. Параметр має бути union-типом.",
    ],
    starter: raw`type Status = "idle" | "loading" | "done";

function statusLabel(status: Status): string {
  // TODO: український підпис для кожного статусу
  return "?";
}

function formatId(id: string | number): string {
  // TODO: "#" + id
  return "?";
}

console.log(statusLabel("idle"));
console.log(statusLabel("loading"));
console.log(statusLabel("done"));
console.log(formatId(7));
console.log(formatId("ab-12"));
`,
    checks: [
      { on: "stdout", name: "Три підписи й два ідентифікатори", equals: "Очікування\nЗавантаження\nГотово\n#7\n#ab-12", hint: "Розгляньте кожен статус окремо: if або switch." },
      { on: "source", name: "Параметр id — union string | number", matches: "formatId\\s*\\(\\s*id\\s*:\\s*string\\s*\\|\\s*number", hint: "Лишіть сигнатуру formatId(id: string | number)." },
      { on: "source", name: "Усі три статуси розглянуто", matches: "idle[\\s\\S]*loading[\\s\\S]*done[\\s\\S]*Очікування", hint: "Для кожного зі статусів idle, loading, done потрібна своя гілка." },
    ],
  },
  {
    ...base, id: "ts-narrowing", lesson: "ts/13", xp: 25,
    title: "Опис значення після звуження типу",
    context: "Параметр з union-типом можна використати, лише розібравши його варіанти. Звуження через typeof та Array.isArray дає доступ до методів кожного типу і гарантує, що жоден варіант не забули.",
    brief: [
      "Допишіть <code>describe(value: string | number | string[]): string</code>. Для рядка поверніть <code>рядок довжиною N</code>. Для числа <code>число X.XX</code> (дві цифри після коми). Для масиву <code>масив з N елементів</code>.",
      "Скористайтеся звуженням: <code>typeof</code> для рядка й числа та <code>Array.isArray</code> для масиву.",
    ],
    starter: raw`function describe(value: string | number | string[]): string {
  // TODO: звузьте тип і поверніть опис
  return "?";
}

console.log(describe("TypeScript"));
console.log(describe(3.14159));
console.log(describe(["a", "b", "c"]));
`,
    checks: [
      { on: "stdout", name: "Опис рядка, числа й масиву", equals: "рядок довжиною 10\nчисло 3.14\nмасив з 3 елементів", hint: "Для числа використайте value.toFixed(2)." },
      { on: "source", name: "Використано typeof", matches: "typeof\\s+value", hint: "Перевірте typeof value === \"string\" та \"number\"." },
      { on: "source", name: "Використано Array.isArray", matches: "Array\\.isArray", hint: "Масив розпізнають через Array.isArray(value)." },
    ],
  },
  {
    ...base, id: "ts-fizzbuzz", lesson: "ts/14", xp: 20,
    title: "FizzBuzz з типами",
    context: "Цикл із умовами це основа будь-якої обробки списків. FizzBuzz показує все разом: цикл, умови, перетворення чисел на текст і повернення типізованого масиву.",
    brief: [
      "Допишіть <code>fizzBuzz(limit: number): string[]</code>. Для кожного числа від 1 до <code>limit</code> додайте в масив: <code>FizzBuzz</code> для кратних 15, <code>Fizz</code> для кратних 3, <code>Buzz</code> для кратних 5, а інакше саме число як рядок.",
      "Програма виводить результат для 15, кожен елемент з нового рядка.",
    ],
    starter: raw`function fizzBuzz(limit: number): string[] {
  const result: string[] = [];
  // TODO: цикл від 1 до limit
  return result;
}

console.log(fizzBuzz(15).join("\n"));
`,
    checks: [
      { on: "stdout", name: "Правильні 15 рядків", equals: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", hint: "Спочатку перевіряйте кратність 15, інакше FizzBuzz ніколи не спрацює." },
      { on: "source", name: "Використано цикл", matches: "\\bfor\\s*\\(|\\bwhile\\s*\\(", hint: "Потрібен цикл for або while від 1 до limit." },
      { on: "source", name: "Використано оператор залишку %", matches: "%", hint: "Кратність перевіряють залишком: i % 3 === 0." },
    ],
  },
  {
    ...base, id: "ts-typed-functions", lesson: "ts/15", xp: 25,
    title: "Типізовані функції: знижка й середнє",
    context: "Типи параметрів і результату роблять функцію зрозумілою без читання тіла: редактор підкаже, що передавати. Заготовка не компілюється в суворому режимі, поки параметри не описано.",
    brief: [
      "Додайте типи: <code>discount(price: number, percent: number): number</code> повертає ціну після знижки у відсотках, <code>average(numbers: number[]): number</code> повертає середнє арифметичне.",
      "Програма виводить <code>170</code> (знижка 15% від 200) та <code>18</code> (середнє шести чисел).",
    ],
    starter: raw`function discount(price, percent) {
  // TODO: ціна після знижки
  return 0;
}

function average(numbers) {
  // TODO: середнє арифметичне
  return 0;
}

console.log(discount(200, 15));
console.log(average([4, 8, 15, 16, 23, 42]));
`,
    checks: [
      { on: "stdout", name: "Виводить 170 і 18", equals: "170\n18", hint: "Знижка: price * (1 - percent / 100). Середнє: сума поділена на кількість." },
      { on: "source", name: "Типи discount", matches: "discount\\s*\\(\\s*price\\s*:\\s*number\\s*,\\s*percent\\s*:\\s*number\\s*\\)\\s*:\\s*number", hint: "Запишіть: function discount(price: number, percent: number): number." },
      { on: "source", name: "Типи average", matches: "average\\s*\\(\\s*numbers\\s*:\\s*number\\[\\]\\s*\\)\\s*:\\s*number", hint: "Запишіть: function average(numbers: number[]): number." },
    ],
  },
  {
    ...base, id: "ts-params", lesson: "ts/16", xp: 20,
    title: "Параметри за замовчуванням, необов'язкові й rest",
    context: "Допоміжні функції зазвичай мають розумні значення за замовчуванням і приймають довільну кількість аргументів. Правильно записані параметри роблять виклики короткими, а типи не дозволяють помилитися.",
    brief: [
      "Допишіть <code>sum(...numbers: number[]): number</code>: сума всіх аргументів, для порожнього виклику <code>0</code>.",
      "Допишіть <code>repeat(text: string, times = 2, separator?: string): string</code>: повторює <code>text</code> стільки разів, скільки вказано (за замовчуванням двічі), з'єднуючи роздільником (за замовчуванням порожнім).",
    ],
    starter: raw`function sum(...numbers: number[]): number {
  // TODO
  return -1;
}

function repeat(text: string, times = 2, separator?: string): string {
  // TODO
  return "";
}

console.log(sum(), sum(1, 2, 3));
console.log(repeat("ха"));
console.log(repeat("ха", 3, "-"));
`,
    checks: [
      { on: "stdout", name: "Суми та повтори", equals: "0 6\nхаха\nха-ха-ха", hint: "Для порожнього sum() має вийти 0, а repeat(\"ха\") це «хаха»." },
      { on: "source", name: "Є rest-параметр", matches: "\\.\\.\\.numbers\\s*:\\s*number\\[\\]", hint: "Збирайте аргументи так: ...numbers: number[]." },
      { on: "source", name: "Є значення за замовчуванням і необов'язковий параметр", matches: "times\\s*=\\s*2[\\s\\S]*separator\\s*\\?\\s*:\\s*string", hint: "Залишіть сигнатуру repeat(text, times = 2, separator?: string)." },
    ],
  },
  {
    ...base, id: "ts-callbacks", lesson: "ts/17", xp: 25,
    title: "Колбеки й функції-фабрики",
    context: "Колбеки відокремлюють «що перебирати» від «що з цим робити», а функції-фабрики створюють налаштовані обробники. Обидва прийоми постійно зустрічаються в обробці списків і подій.",
    brief: [
      "Допишіть <code>filterNumbers(numbers: number[], predicate: Predicate): number[]</code>: повертає лише ті числа, для яких <code>predicate</code> дає <code>true</code>.",
      "Допишіть <code>multiplier(factor: number): (n: number) =&gt; number</code>, що повертає функцію множення на <code>factor</code>.",
    ],
    starter: raw`type Predicate = (n: number) => boolean;

function filterNumbers(numbers: number[], predicate: Predicate): number[] {
  // TODO: залиште лише підхожі числа
  return [];
}

function multiplier(factor: number): (n: number) => number {
  // TODO: поверніть функцію множення
  return (n) => n;
}

const isEven: Predicate = (n) => n % 2 === 0;
console.log(filterNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isEven).join(","));
console.log(multiplier(3)(7));
`,
    checks: [
      { on: "stdout", name: "Парні числа й добуток", equals: "2,4,6,8,10\n21", hint: "multiplier(3)(7) має дати 21." },
      { on: "source", name: "Викликається predicate", matches: "predicate\\s*\\(", hint: "Для кожного числа викличте predicate(n)." },
      { on: "source", name: "Функція повертає функцію", matches: "return\\s*\\(?\\s*n\\s*\\)?\\s*=>\\s*n\\s*\\*\\s*factor", hint: "Поверніть (n) => n * factor." },
    ],
  },
  {
    ...base, id: "ts-overloads", lesson: "ts/18", xp: 30,
    title: "Перевантаження: reverse для рядка й масиву",
    context: "Бібліотечні функції часто працюють з різними типами й повертають відповідний результат. Перевантаження дозволяють точно описати, що для рядка повернеться рядок, а для масиву масив.",
    brief: [
      "Допишіть реалізацію перевантаженої функції <code>reverse</code>. Для рядка вона повертає розгорнутий рядок, для масиву чисел новий розгорнутий масив (вхідний не змінюється).",
      "Дві сигнатури-перевантаження вже написані: не змінюйте їх.",
    ],
    starter: raw`function reverse(value: string): string;
function reverse(value: number[]): number[];
function reverse(value: string | number[]): string | number[] {
  // TODO: розверніть рядок або масив
  return value;
}

console.log(reverse("abc"));
console.log(reverse([1, 2, 3]).join(","));
`,
    checks: [
      { on: "stdout", name: "cba і 3,2,1", equals: "cba\n3,2,1", hint: "Для рядка: split(\"\").reverse().join(\"\"). Для масиву: [...value].reverse()." },
      { on: "source", name: "Перевантаження для рядка збережено", matches: "function\\s+reverse\\s*\\(\\s*value\\s*:\\s*string\\s*\\)\\s*:\\s*string\\s*;", hint: "Не видаляйте першу сигнатуру." },
      { on: "source", name: "Перевантаження для масиву збережено", matches: "function\\s+reverse\\s*\\(\\s*value\\s*:\\s*number\\[\\]\\s*\\)\\s*:\\s*number\\[\\]\\s*;", hint: "Не видаляйте другу сигнатуру." },
    ],
  },
];
