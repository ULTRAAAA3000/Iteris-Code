// Завдання глави 4 «Типи користувача» (уроки 31–39). Еталони: tests/solutions/ts-ch04.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "ts-interfaces", lesson: "ts/31", xp: 20,
    title: "Опишіть користувача інтерфейсом",
    context: "Дані користувача пересуваються між десятками функцій. Інтерфейс описує їхню форму в одному місці, і редактор підказує поля, а компілятор не дає звернутися до неіснуючого поля чи забути обов'язкове.",
    brief: [
      "Оголосіть <code>interface User</code> з полями <code>id</code> (число), <code>name</code> і <code>email</code> (рядки). Типізуйте масив <code>users</code> та функцію <code>formatUser(user: User): string</code>.",
      "Функція повертає рядок формату <code>#1 Оля &lt;olya@example.com&gt;</code>: номер, ім'я та пошта в кутових дужках.",
    ],
    starter: raw`const users = [
  { id: 1, name: "Оля", email: "olya@example.com" },
  { id: 2, name: "Іван", email: "ivan@example.com" },
];

function formatUser(user) {
  // TODO: "#1 Оля <olya@example.com>"
  return "";
}

for (const user of users) {
  console.log(formatUser(user));
}
`,
    checks: [
      { on: "stdout", name: "Два відформатовані користувачі", equals: "#1 Оля <olya@example.com>\n#2 Іван <ivan@example.com>", hint: "Формат: #id ім'я <пошта>. Кутові дужки це звичайні символи в рядку." },
      { on: "source", name: "Оголошено interface User", matches: "interface\\s+User\\s*\\{", hint: "Запишіть interface User { id: number; name: string; email: string }." },
      { on: "source", name: "formatUser типізована", matches: "formatUser\\s*\\(\\s*user\\s*:\\s*User\\s*\\)\\s*:\\s*string", hint: "Запишіть function formatUser(user: User): string." },
    ],
  },
  {
    ...base, id: "ts-optional-readonly", lesson: "ts/32", xp: 20,
    title: "Ціна зі знижкою та перейменування без мутації",
    context: "Необов'язкові поля й readonly описують реальні дані: знижка буває не завжди, а ідентифікатор не повинен змінюватися. Функція, що не мутує вхід, а повертає нову копію, безпечніша для спільних даних.",
    brief: [
      "Допишіть <code>finalPrice(product)</code>: ціна з урахуванням необов'язкової знижки у відсотках (якщо поля <code>discount</code> немає, ціна не змінюється).",
      "Допишіть <code>rename(product, name)</code>: повертає <b>новий</b> об'єкт з іншою назвою, а вихідний не змінює.",
    ],
    starter: raw`interface Product {
  readonly id: number;
  name: string;
  price: number;
  discount?: number;
}

function finalPrice(product: Product): number {
  // TODO: врахуйте необов'язкову знижку у відсотках
  return 0;
}

function rename(product: Product, name: string): Product {
  // TODO: поверніть новий об'єкт, не змінюючи product
  return product;
}

const book: Product = { id: 1, name: "Книга", price: 200, discount: 25 };
const pen: Product = { id: 2, name: "Ручка", price: 20 };

console.log(finalPrice(book), finalPrice(pen));
const renamed = rename(book, "Підручник");
console.log(renamed.name, renamed.id, book.name);
`,
    checks: [
      { on: "stdout", name: "Ціни й перейменування", equals: "150 20\nПідручник 1 Книга", hint: "Знижка 25% від 200 це 150. Вихідний book має лишитися «Книга»." },
      { on: "source", name: "Знижка розглядається як необов'язкова", matches: "discount\\s*\\?\\?|discount\\s*(!==|===|==|!=)\\s*(undefined|null)|product\\.discount\\s*\\)|product\\.discount\\s*\\?", hint: "Перевірте, чи задано discount, або використайте ??." },
      { on: "source", name: "Нова копія через spread", matches: "\\.\\.\\.product", hint: "Створіть копію: { ...product, name }." },
    ],
  },
  {
    ...base, id: "ts-extend-intersect", lesson: "ts/33", xp: 25,
    title: "Собака із запису: extends і перетин",
    context: "Моделі даних будуються з повторюваних частин: спільні поля, домішки з датами та прапорцями. Розширення й перетини дозволяють скласти потрібний тип без копіювання полів у кожен інтерфейс.",
    brief: [
      "Оголосіть <code>interface Animal</code> (поле <code>name</code>), <code>interface Dog extends Animal</code> (додає <code>breed</code>), <code>type Timestamped</code> (поле <code>createdAt</code>) і <code>type DogRecord = Dog &amp; Timestamped</code>.",
      "Типізуйте <code>describeDog(record: DogRecord): string</code>, що повертає <code>Рекс (лабрадор), додано 2026-11-20</code>.",
    ],
    starter: raw`// TODO: інтерфейси Animal і Dog, тип Timestamped, перетин DogRecord

const record = { name: "Рекс", breed: "лабрадор", createdAt: "2026-11-20" };

function describeDog(dog) {
  return "";
}

console.log(describeDog(record));
`,
    checks: [
      { on: "stdout", name: "Опис собаки", equals: "Рекс (лабрадор), додано 2026-11-20", hint: "Формат: ім'я (порода), додано дата." },
      { on: "source", name: "Dog розширює Animal", matches: "interface\\s+Dog\\s+extends\\s+Animal", hint: "Запишіть interface Dog extends Animal { breed: string }." },
      { on: "source", name: "DogRecord це перетин Dog і Timestamped", matches: "type\\s+DogRecord\\s*=\\s*Dog\\s*&\\s*Timestamped", hint: "Запишіть type DogRecord = Dog & Timestamped;" },
    ],
  },
  {
    ...base, id: "ts-classes", lesson: "ts/34", xp: 25,
    title: "Банківський рахунок: клас з методами",
    context: "Рахунок, кошик чи з'єднання зручно описувати класом: дані й операції над ними лежать разом. Метод зняття коштів повертає булеве значення, щоб викликач знав, чи вдалася операція.",
    brief: [
      "Напишіть клас <code>BankAccount</code>: поле <code>balance</code> (число) з початковим значенням із конструктора, метод <code>deposit(amount: number): void</code> та метод <code>withdraw(amount: number): boolean</code>.",
      "<code>withdraw</code> повертає <code>false</code> і нічого не знімає, якщо коштів недостатньо, інакше знімає суму й повертає <code>true</code>.",
    ],
    starter: raw`// TODO: клас BankAccount з полем balance, конструктором, deposit і withdraw

const account = new BankAccount(100);
account.deposit(50);
console.log(account.withdraw(500));
console.log(account.withdraw(30));
console.log(account.balance);
`,
    checks: [
      { on: "stdout", name: "false, true і залишок 120", equals: "false\ntrue\n120", hint: "100 + 50 = 150; зняття 500 не вдається; після зняття 30 лишається 120." },
      { on: "source", name: "Оголошено клас BankAccount", matches: "class\\s+BankAccount\\b", hint: "Запишіть class BankAccount { ... }." },
      { on: "source", name: "withdraw повертає boolean", matches: "withdraw\\s*\\(\\s*amount\\s*:\\s*number\\s*\\)\\s*:\\s*boolean", hint: "Запишіть withdraw(amount: number): boolean." },
    ],
  },
  {
    ...base, id: "ts-access", lesson: "ts/35", xp: 25,
    title: "Гаманець із прихованим балансом",
    context: "Приховане поле зберігає інваріанти: баланс не можна записати ззовні в обхід правил. Параметр-властивість скорочує конструктор, а публічний інтерфейс лишається маленьким і зрозумілим.",
    brief: [
      "Напишіть клас <code>Wallet</code> із приватним полем <code>balance</code> (спочатку 0) і публічним readonly-полем <code>owner</code>, яке створюється як параметр-властивість конструктора.",
      "Методи: <code>add(amount)</code> додає суму, <code>spend(amount): boolean</code> знімає, якщо вистачає коштів, <code>show(): string</code> повертає <code>власник: баланс</code>.",
    ],
    starter: raw`// TODO: клас Wallet

const wallet = new Wallet("Оля");
wallet.add(100);
console.log(wallet.spend(30));
console.log(wallet.spend(500));
console.log(wallet.show());
`,
    checks: [
      { on: "stdout", name: "true, false і «Оля: 70»", equals: "true\nfalse\nОля: 70", hint: "Після add(100) і spend(30) на балансі 70; spend(500) не вдається." },
      { on: "source", name: "Баланс приватний", matches: "private\\s+balance", hint: "Оголосіть private balance = 0;" },
      { on: "source", name: "Власник як readonly параметр-властивість", matches: "constructor\\s*\\(\\s*(public\\s+)?readonly\\s+owner\\s*:\\s*string", hint: "Запишіть constructor(readonly owner: string)." },
    ],
  },
  {
    ...base, id: "ts-static-accessors", lesson: "ts/36", xp: 25,
    title: "Температура: геттери, сеттер і фабричний метод",
    context: "Сеттер перевіряє значення на вході, геттер обчислює похідні величини, а статичний фабричний метод створює об'єкт із зручного формату. Разом вони не дозволяють довести клас до неправильного стану.",
    brief: [
      "Допишіть клас <code>Temperature</code>: приватне поле, геттер і сеттер <code>celsius</code> (сеттер кидає <code>Error</code> з текстом <code>Нижче абсолютного нуля</code> для значень менших за -273.15), геттер <code>fahrenheit</code> та статичний метод <code>fromFahrenheit(f: number)</code>.",
      "Формули: <code>f = c * 1.8 + 32</code>, <code>c = (f - 32) / 1.8</code>.",
    ],
    starter: raw`class Temperature {
  // TODO: приватне поле, геттер/сеттер celsius, геттер fahrenheit, static fromFahrenheit
}

const t = Temperature.fromFahrenheit(212);
console.log(t.celsius, t.fahrenheit);
try {
  t.celsius = -300;
} catch (error) {
  console.log(error instanceof Error ? error.message : "невідома помилка");
}
console.log(t.celsius);
`,
    checks: [
      { on: "stdout", name: "100 212, помилка, 100", equals: "100 212\nНижче абсолютного нуля\n100", hint: "Після невдалого присвоєння значення має лишитися 100." },
      { on: "source", name: "Є static fromFahrenheit", matches: "static\\s+fromFahrenheit\\s*\\(", hint: "Запишіть static fromFahrenheit(f: number): Temperature." },
      { on: "source", name: "Є геттер і сеттер celsius", matches: "get\\s+celsius\\s*\\([\\s\\S]*set\\s+celsius\\s*\\(", hint: "Потрібні get celsius() і set celsius(value: number)." },
    ],
  },
  {
    ...base, id: "ts-structural", lesson: "ts/37", xp: 25,
    title: "Мінімальні форми аргументів",
    context: "Функція, що описує лише потрібні їй поля, приймає найрізноманітніші значення: рядки, масиви, екземпляри класів, звичайні об'єкти. Це робить код універсальним і легким для перевірки в тестах.",
    brief: [
      "Допишіть <code>totalLength(items: { length: number }[]): number</code>: сума довжин усіх елементів. Підійде рядок, масив чи будь-який об'єкт із полем <code>length</code>.",
      "Допишіть <code>distance(a: XY, b: XY): number</code>: відстань між двома точками. Екземпляр класу <code>Point</code> та звичайний об'єкт мають підходити однаково.",
    ],
    starter: raw`type XY = { x: number; y: number };

class Point {
  constructor(public x: number, public y: number) {}
}

function totalLength(items: { length: number }[]): number {
  // TODO
  return 0;
}

function distance(a: XY, b: XY): number {
  // TODO
  return 0;
}

console.log(totalLength(["ab", [1, 2, 3], { length: 5 }]));
console.log(distance(new Point(0, 0), { x: 3, y: 4 }));
`,
    checks: [
      { on: "stdout", name: "Сума довжин 10 і відстань 5", equals: "10\n5", hint: "2 + 3 + 5 = 10, а відстань між (0,0) та (3,4) дорівнює 5." },
      { on: "source", name: "Параметр описано формою з length", matches: "length\\s*:\\s*number", hint: "Лишіть тип { length: number }[]." },
      { on: "source", name: "Відстань через Math.hypot або sqrt", matches: "Math\\.hypot|Math\\.sqrt", hint: "Скористайтеся Math.hypot(dx, dy)." },
    ],
  },
  {
    ...base, id: "ts-enum", lesson: "ts/38", xp: 30,
    title: "Рівні доступу: enum і розбір тексту",
    context: "Числові переліки зручні, коли значення зберігаються як числа, а в інтерфейсі потрібні назви. Зворотне відображення дає ім'я за числом, а розбір тексту перетворює дані ззовні на значення переліку.",
    brief: [
      "Для переліку <code>Level</code> допишіть <code>levelName(level: Level): string</code>: ім'я рівня через зворотне відображення переліку. Допишіть <code>parseLevel(text: string): Level | undefined</code>: <code>low</code>, <code>medium</code>, <code>high</code> (у будь-якому регістрі) дають відповідний рівень, інакше <code>undefined</code>.",
    ],
    starter: raw`enum Level {
  Low = 1,
  Medium,
  High,
}

function levelName(level: Level): string {
  // TODO: ім'я за числом через Level[level]
  return "?";
}

function parseLevel(text: string): Level | undefined {
  // TODO: "low" | "medium" | "high" без урахування регістру
  return undefined;
}

console.log(levelName(Level.Medium));
console.log(parseLevel("HIGH"));
console.log(parseLevel("zzz"));
`,
    checks: [
      { on: "stdout", name: "Medium, 3 і undefined", equals: "Medium\n3\nundefined", hint: "High має значення 3, а невідомий текст дає undefined." },
      { on: "source", name: "Зворотне відображення", matches: "Level\\s*\\[\\s*level\\s*\\]", hint: "Ім'я за числом дає Level[level]." },
      { on: "source", name: "Регістр не враховується", matches: "toLowerCase\\(\\)", hint: "Приведіть текст до нижнього регістру перед порівнянням." },
    ],
  },
  {
    ...base, id: "ts-abstract", lesson: "ts/39", xp: 30,
    title: "Фігури: абстрактний клас і нащадки",
    context: "Коли кілька класів мають спільний контракт і спільну частину логіки, її виносять в абстрактний базовий клас. Нащадки реалізують лише мінливі кроки, а компілятор перевіряє, що нічого не забуто.",
    brief: [
      "Абстрактний клас <code>Shape</code> уже написаний. Допишіть класи <code>Circle</code> (радіус) і <code>Rect</code> (ширина та висота), які успадковують <code>Shape</code> і реалізують <code>area()</code> та <code>title()</code>.",
      "Назви: <code>Коло</code> та <code>Прямокутник</code>. Метод <code>describe()</code> базового класу сформує рядки <code>Коло: площа 3.14</code> і <code>Прямокутник: площа 6.00</code>.",
    ],
    starter: raw`abstract class Shape {
  abstract area(): number;
  abstract title(): string;

  describe(): string {
    return this.title() + ": площа " + this.area().toFixed(2);
  }
}

// TODO: class Circle extends Shape (радіус) і class Rect extends Shape (ширина, висота)

const shapes: Shape[] = [new Circle(1), new Rect(2, 3)];
for (const shape of shapes) {
  console.log(shape.describe());
}
`,
    checks: [
      { on: "stdout", name: "Площі кола й прямокутника", equals: "Коло: площа 3.14\nПрямокутник: площа 6.00", hint: "Площа кола це Math.PI * r ** 2, прямокутника w * h." },
      { on: "source", name: "Circle успадковує Shape", matches: "class\\s+Circle\\s+extends\\s+Shape", hint: "Запишіть class Circle extends Shape." },
      { on: "source", name: "Rect успадковує Shape", matches: "class\\s+Rect\\s+extends\\s+Shape", hint: "Запишіть class Rect extends Shape." },
    ],
  },
];
