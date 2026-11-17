// Практичні завдання курсу Pascal (Free Pascal): по одному на кожен урок. Запускаються на сервері (runtime: "remote").
// Еталони: tests/solutions/pascal.mjs. Без readln: клавіатури в пісочниці немає, дані задаються в коді.
// Довжину рядків із кирилицею не перевіряємо (у стандартному режимі FPC це байти), тому рядкові вправи на латиниці.
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "pascal", runtime: "remote", lang: "pascal", file: "main.pas", editorLang: "pascal", premium: false } as const;

export const PASCAL_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "pascal-hello-fpc", lesson: "pascal/1", xp: 15,
    title: "Перевірка Free Pascal: перша програма",
    context: "Після встановлення компілятора першим запускають найпростішу програму: так видно, що збірка працює. У Pascal це заголовок program, блок begin ... end і крапка в кінці.",
    brief: [
      "Виведіть два рядки через <code>writeln</code>: <code>Привіт, Pascal!</code> і <code>FPC працює</code>.",
    ],
    starter: raw`program Main;
begin
  // Виведіть два рядки: Привіт, Pascal! і FPC працює
  writeln;
end.
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, Pascal!»", has: "Привіт, Pascal!" },
      { on: "stdout", name: "Виводить «FPC працює»", has: "FPC працює" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, Pascal!\nFPC працює" },
    ],
  },
  {
    ...base, id: "pascal-structure", lesson: "pascal/2", xp: 15,
    title: "Структура програми: обчислення у writeln",
    context: "Програма на Pascal має чітку структуру: заголовок, розділ опису змінних (var), основний блок. writeln приймає список значень через кому: текст і результати виразів друкуються підряд.",
    brief: [
      "Виведіть два рядки: <code>2 + 3 = 5</code> і <code>(8 + 4) * 3 = 36</code>. Числа в кінці обчисліть виразом всередині <code>writeln</code>, не пишіть готову відповідь.",
    ],
    starter: raw`program Main;
begin
  writeln('Привіт, світе!');
  // TODO: виведіть 2 + 3 = 5 і (8 + 4) * 3 = 36, обчисливши результати виразами
end.
`,
    checks: [
      { on: "stdout", name: "Рядок «2 + 3 = 5»", has: "2 + 3 = 5" },
      { on: "stdout", name: "Рядок «(8 + 4) * 3 = 36»", has: "(8 + 4) * 3 = 36" },
      { on: "stdout", name: "Виводить лише два рядки", equals: "2 + 3 = 5\n(8 + 4) * 3 = 36", hint: "Рядок «Привіт, світе!» із заготовки треба прибрати" },
      { on: "source", name: "Результат обчислюється виразом у writeln", matches: "writeln\\s*\\([^)]*,\\s*\\(?\\s*(2\\s*\\+\\s*3|8\\s*\\+\\s*4)" },
    ],
  },
  {
    ...base, id: "pascal-vars-total", lesson: "pascal/3", xp: 20,
    title: "Змінні, формат числа, div і mod",
    context: "Дробове число без формату Pascal показує в науковому вигляді (5.99E+002). Запис total:0:2 задає ширину й два знаки після коми. А div і mod дають цілу частину і залишок від ділення цілих.",
    brief: [
      "Виведіть <code>Разом: 599.97</code> (<code>total:0:2</code>) і наступним рядком результати <code>17 div 5</code> і <code>17 mod 5</code> через пробіл: <code>3 2</code>.",
    ],
    starter: raw`program Main;
var
  price: real;
  qty: integer;
  total: real;
begin
  price := 199.99;
  qty := 3;
  total := price * qty;
  // TODO: Разом: 599.97 (формат total:0:2), а наступним рядком 17 div 5 і 17 mod 5 через пробіл
  writeln('Разом: ', total);
end.
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 599.97»", has: "Разом: 599.97" },
      { on: "stdout", name: "div і mod: 3 2", has: "3 2" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 599.97\n3 2" },
      { on: "source", name: "Використано формат :0:2", has: ":0:2" },
    ],
  },
  {
    ...base, id: "pascal-if-for", lesson: "pascal/4", xp: 25,
    title: "Цикл for та умова if",
    context: "for перебирає діапазон, if вирішує, що робити з кожним значенням. Разом вони дають відбір потрібних елементів, що є основою обробки даних.",
    brief: [
      "У циклі <code>for</code> виведіть в один рядок через пробіл парні числа від 2 до 20 (<code>write</code> без переносу; перевірка парності: <code>i mod 2 = 0</code>).",
      "Потім для числа <code>n = 7</code> виведіть через <code>if ... then ... else</code> слово <code>парне</code> або <code>непарне</code>: <code>7 непарне</code>.",
    ],
    starter: raw`program Main;
var
  i, n: integer;
begin
  for i := 1 to 20 do
  begin
    // TODO: якщо i парне, вивести i і пробіл (write)
  end;
  writeln;

  n := 7;
  // TODO: if n mod 2 = 0 then ... else ...; виведіть "7 непарне"
end.
`,
    checks: [
      { on: "stdout", name: "Парні числа: 2 4 6 ... 20", has: "2 4 6 8 10 12 14 16 18 20" },
      { on: "stdout", name: "7 непарне", has: "7 непарне" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2 4 6 8 10 12 14 16 18 20\n7 непарне" },
      { on: "source", name: "Використано if ... then ... else", matches: "\\bif\\b[\\s\\S]*\\bthen\\b[\\s\\S]*\\belse\\b" },
    ],
  },
  {
    ...base, id: "pascal-while-repeat", lesson: "pascal/5", xp: 25,
    title: "Цикли while і repeat",
    context: "while перевіряє умову перед кожним кроком, repeat ... until після. Обидва потрібні, коли кількість кроків невідома наперед: розбір числа за цифрами, чекання результату, підбір значення.",
    brief: [
      "Циклом <code>while</code> обчисліть суму цифр числа <code>12345</code> (<code>n mod 10</code> і <code>n div 10</code>) і виведіть <code>Сума цифр: 15</code>.",
      "Циклом <code>repeat ... until</code> порахуйте, скільки разів треба помножити 1 на 2, щоб стало більше 1000, і виведіть <code>Степінь: 10</code>.",
    ],
    starter: raw`program Main;
var
  n, sum, p, steps: integer;
begin
  n := 12345;
  sum := 0;
  // TODO: while n > 0 do ... (додати останню цифру, відкинути її)
  writeln('Сума цифр: ', sum);

  p := 1;
  steps := 0;
  // TODO: repeat ... until p > 1000 (множити p на 2, рахувати кроки)
  writeln('Степінь: ', steps);
end.
`,
    checks: [
      { on: "stdout", name: "Сума цифр 12345: 15", has: "Сума цифр: 15" },
      { on: "stdout", name: "Степінь двійки: 10", has: "Степінь: 10" },
      { on: "source", name: "Використано while", matches: "\\bwhile\\b" },
      { on: "source", name: "Використано repeat ... until", matches: "\\brepeat\\b[\\s\\S]*\\buntil\\b" },
    ],
  },
  {
    ...base, id: "pascal-arrays-stats", lesson: "pascal/6", xp: 30,
    title: "Масив: мінімум, максимум і сума",
    context: "Масив зберігає багато значень одного типу під одним іменем. Пройти його циклом, знайти найбільше, найменше й підсумок це базова задача обробки даних.",
    brief: [
      "Пройдіть масив <code>nums</code> циклом <code>for</code> і виведіть три рядки: <code>Макс: 10</code>, <code>Мін: 2</code> і <code>Сума: 48</code>.",
    ],
    starter: raw`program Main;
const
  nums: array[1..8] of integer = (5, 2, 9, 7, 4, 10, 3, 8);
var
  i, max, min, sum: integer;
begin
  max := nums[1];
  min := nums[1];
  sum := 0;
  // TODO: цикл по масиву: оновлюйте max, min і sum
  writeln('Макс: ', max);
  writeln('Мін: ', min);
  writeln('Сума: ', sum);
end.
`,
    checks: [
      { on: "stdout", name: "Макс: 10", has: "Макс: 10" },
      { on: "stdout", name: "Мін: 2", has: "Мін: 2" },
      { on: "stdout", name: "Сума: 48", has: "Сума: 48" },
      { on: "source", name: "Масив обходиться індексом nums[i]", matches: "nums\\s*\\[\\s*i\\s*\\]" },
    ],
  },
  {
    ...base, id: "pascal-subprograms", lesson: "pascal/7", xp: 35,
    title: "Функція, процедура і параметр var",
    context: "Підпрограми прибирають дублювання: function повертає значення, procedure просто виконує дію. Параметр var передає змінну за посиланням, тому процедура змінює саму змінну, а не її копію.",
    brief: [
      "Допишіть <code>function Factorial(n: integer): int64</code>: факторіал числа (<code>Factorial(5) = 120</code>).",
      "Допишіть <code>procedure Swap(var a, b: integer)</code>: обмін значень двох змінних, і <code>procedure PrintLine(c: char; n: integer)</code>: виводить символ <code>c</code> рівно <code>n</code> разів в один рядок.",
    ],
    starter: raw`program Main;
var
  x, y: integer;

function Factorial(n: integer): int64;
begin
  // TODO
  Factorial := 0;
end;

procedure Swap(var a, b: integer);
begin
  // TODO: поміняти a і b місцями
end;

procedure PrintLine(c: char; n: integer);
begin
  // TODO: вивести символ c рівно n разів і перейти на новий рядок
end;

begin
  writeln(Factorial(5));
  writeln(Factorial(10));
  x := 1;
  y := 2;
  Swap(x, y);
  writeln(x, ' ', y);
  PrintLine('-', 5);
end.
`,
    checks: [
      { on: "stdout", name: "5! дорівнює 120", has: "120\n" },
      { on: "stdout", name: "10! дорівнює 3628800", has: "3628800" },
      { on: "stdout", name: "Swap міняє значення: 2 1", has: "2 1" },
      { on: "stdout", name: "PrintLine виводить п'ять дефісів", has: "-----" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "120\n3628800\n2 1\n-----" },
      { on: "source", name: "Параметри Swap передаються через var", matches: "procedure\\s+Swap\\s*\\(\\s*var\\b" },
    ],
  },
  {
    ...base, id: "pascal-record-strings", lesson: "pascal/8", xp: 40,
    title: "Запис Product і рядкові функції",
    context: "Запис (record) об'єднує кілька полів різних типів в одну сутність: товар, учень, замовлення. А вбудовані Length, Copy і Pos дають основні операції над рядками: довжина, вирізка й пошук підрядка.",
    brief: [
      "Опишіть тип <code>TProduct = record name: string; price: real; end;</code> у розділі <code>type</code>. Поки типу немає, код не компілюється.",
      "Виведіть через <code>Pos</code>, <code>Copy</code> і <code>Length</code> інформацію про рядок <code>s</code>: <code>Pos: 8</code> (позиція слова <code>Pascal</code>), <code>Copy: Hello</code> (перші 5 символів) і <code>Length: 13</code>.",
    ],
    starter: raw`program Main;

// TODO: type TProduct = record name: string; price: real; end;

var
  products: array[1..2] of TProduct;
  total: real;
  i: integer;
  s: string;
begin
  products[1].name := 'Bread';
  products[1].price := 25.5;
  products[2].name := 'Milk';
  products[2].price := 42;

  total := 0;
  for i := 1 to 2 do
  begin
    writeln(products[i].name, ': ', products[i].price:0:2);
    total := total + products[i].price;
  end;
  writeln('Total: ', total:0:2);

  s := 'Hello, Pascal';
  // TODO: Pos: 8, Copy: Hello, Length: 13 (через Pos, Copy, Length)
end.
`,
    checks: [
      { on: "stdout", name: "Товари виводяться з цінами", has: "Bread: 25.50\nMilk: 42.00" },
      { on: "stdout", name: "Сума цін: 67.50", has: "Total: 67.50" },
      { on: "stdout", name: "Pos: 8", has: "Pos: 8" },
      { on: "stdout", name: "Copy: Hello", has: "Copy: Hello" },
      { on: "stdout", name: "Length: 13", has: "Length: 13" },
      { on: "source", name: "Описано запис TProduct", matches: "TProduct\\s*=\\s*record" },
    ],
  },
];
