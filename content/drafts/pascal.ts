// Чернетки проєктів за ТЗ для курсу Pascal (Free Pascal 3.2, без readln: у пісочниці немає клавіатури). НЕ ПУБЛІКУЮТЬСЯ.
// Еталони й мутації для перевірки вимог: tests/solutions/drafts-pascal.mjs. Правила: Documentation/spec-drafts.md
import type { RemoteDraft } from "./types.ts";

const raw = String.raw;
/** Регулярний вираз-слово без урахування регістру: у Pascal While і while це одне й те саме */
const ci = (word: string): string => [...word].map((c) => `[${c.toLowerCase()}${c.toUpperCase()}]`).join("");

export const PASCAL_DRAFTS: readonly RemoteDraft[] = [
  {
    id: "pascal-guess-number", course: "pascal", runtime: "remote", lang: "pascal", xp: 45,
    after: "pascal/5", needs: ["умовний оператор", "цикли while і repeat", "функції", "процедури", "масиви як параметри", "константи"],
    title: "Проєкт: гра «Вгадай число» (симуляція)",
    context: "Цикл «спробуй, перевір, зупинись, коли вийшло або вичерпано спроби» живе в іграх, входах за паролем і повторних запитах до сервера. Це перший справжній алгоритм, де цикл має дві умови завершення.",
    brief: [
      "У пісочниці немає клавіатури, тому гра відбувається «на папері»: гравець уже зробив спроби, і вони лежать у масиві. Ваше завдання: функція-підказка й процедура, що програє гру за цими спробами.",
      "Процедура <code>Play</code> перебирає спроби по черзі, друкує підказку для кожної й зупиняється, коли число вгадано або вичерпано ліміт спроб (константа <code>MaxAttempts</code>). Масив завжди має 8 спроб, а користуватись треба не більше, ніж дозволяє ліміт.",
    ],
    contract: [
      "<code>function Hint(secret, guess: integer): string</code> повертає <code>Замало</code>, <code>Забагато</code> або <code>Вгадали!</code>",
      "<code>procedure Play(secret: integer; const guesses: TGuesses)</code>",
      "рядок спроби: <code>Спроба N: число - підказка</code>",
      "після перемоги: <code>Спроб: N</code>; після невдачі: <code>Спроби закінчились. Число було X</code>",
      "типи й константа <code>MaxAttempts = 5</code> уже описані",
    ],
    mockup: [
      "Гра 1", "Спроба 1: 50 - Забагато", "Спроба 2: 25 - Замало", "Спроба 3: 40 - Забагато", "Спроба 4: 37 - Вгадали!", "Спроб: 4",
      "Гра 2", "Спроба 1: 10 - Замало", "Спроба 2: 20 - Замало", "Спроба 3: 30 - Замало", "Спроба 4: 40 - Замало", "Спроба 5: 50 - Замало",
      "Спроби закінчились. Число було 90",
    ].join("\n"),
    starter: raw`program Main;
const
  MaxAttempts = 5;
type
  TGuesses = array[1..8] of integer;

// TODO: function Hint(secret, guess: integer): string
//       повертає 'Замало', 'Забагато' або 'Вгадали!'
// TODO: procedure Play(secret: integer; const guesses: TGuesses)
//       програє гру за спробами: підказка до кожної; зупинка після перемоги або коли вичерпано ліміт

var
  game1, game2: TGuesses;
  i: integer;
begin
  game1[1] := 50; game1[2] := 25; game1[3] := 40; game1[4] := 37;
  game1[5] := 10; game1[6] := 11; game1[7] := 12; game1[8] := 13;
  for i := 1 to 8 do
    game2[i] := i * 10;

  writeln('Гра 1');
  Play(37, game1);
  writeln('Гра 2');
  Play(90, game2);
end.
`,
    requirements: [
      { id: "R1", short: "Підказки «Замало» і «Забагато» за порівнянням", text: "<code>Hint</code> повертає <code>Замало</code>, коли спроба менша за загадане, і <code>Забагато</code>, коли більша.",
        hint: "Порівняйте <code>guess</code> із <code>secret</code>: менше, більше або рівне. Результат функції присвоюється її імені: <code>Hint := '…'</code>.",
        checks: [{ on: "stdout", has: "Спроба 1: 50 - Забагато\nСпроба 2: 25 - Замало\nСпроба 3: 40 - Забагато" }] },
      { id: "R2", short: "Перемога: «Вгадали!» і кількість спроб", text: "Коли число вгадано, друкується спроба з підказкою <code>Вгадали!</code>, а далі рядок <code>Спроб: N</code> з кількістю спроб.",
        hint: "Рахуйте спроби лічильником, який збільшується на кожному кроці циклу.",
        checks: [{ on: "stdout", has: "Спроба 4: 37 - Вгадали!\nСпроб: 4\n" }] },
      { id: "R3", short: "Після перемоги гра зупиняється", text: "Після вгаданого числа решта спроб з масиву ігнорується: жодних зайвих рядків.",
        hint: "В умові циклу має бути два пункти: «ще є спроби» <i>і</i> «число ще не вгадано».",
        checks: [{ on: "stdout", has: "Спроба 5: 10", not: true }] },
      { id: "R4", short: "Ліміт спроб і повідомлення про невдачу", text: "Якщо за <code>MaxAttempts</code> спроб число не вгадано, друкується <code>Спроби закінчились. Число було X</code>; шостої спроби немає.",
        hint: "Цикл мусить зупинитися, коли лічильник дійшов до ліміту, навіть якщо в масиві ще є спроби.",
        checks: [{ on: "stdout", has: "Спроба 5: 50 - Замало\nСпроби закінчились. Число було 90" }, { on: "stdout", has: "Спроба 6", not: true }] },
      { id: "R5", short: "Цикл while або repeat", text: "Гра програється циклом <code>while</code> або <code>repeat</code> (число спроб заздалегідь невідоме).",
        hint: "Цикл <code>for</code> має фіксовану кількість кроків, а тут вона залежить від того, коли число буде вгадано.",
        checks: [{ on: "source", matches: "\\b(?:" + ci("while") + "|" + ci("repeat") + ")\\b" }] },
      { id: "R6", short: "Ліміт береться з константи MaxAttempts", text: "Ліміт спроб береться з константи <code>MaxAttempts</code>, а не записаний числом у коді.",
        hint: "Порівняння <code>attempt &lt; MaxAttempts</code> дозволить змінити ліміт в одному місці.",
        checks: [{ on: "source", matches: "MaxAttempts[\\s\\S]*MaxAttempts" }] },
      { id: "R7", short: "Обидві гри збігаються з макетом", text: "Увесь вивід збігається з макетом: нічого зайвого й нічого пропущеного.",
        hint: "Порівняйте з макетом рядок за рядком: пробіл навколо дефіса й крапки теж важливі.",
        checks: [{ on: "stdout", equals: "Гра 1\nСпроба 1: 50 - Забагато\nСпроба 2: 25 - Замало\nСпроба 3: 40 - Забагато\nСпроба 4: 37 - Вгадали!\nСпроб: 4\nГра 2\nСпроба 1: 10 - Замало\nСпроба 2: 20 - Замало\nСпроба 3: 30 - Замало\nСпроба 4: 40 - Замало\nСпроба 5: 50 - Замало\nСпроби закінчились. Число було 90" }] },
    ],
  },
  {
    id: "pascal-number-toolkit", course: "pascal", runtime: "remote", lang: "pascal", xp: 50,
    after: "pascal/7", needs: ["функції з результатом", "процедури", "цикли while і for", "div і mod", "булевий тип"],
    title: "Проєкт: набір числових утиліт",
    context: "Маленькі перевірені підпрограми — цеглинки великих програм: «чи просте число», «найбільший спільний дільник», «сума цифр» у реальних проєктах лежать у бібліотеках. Тут ви зберете власну мінібібліотеку й побачите, як вона працює разом.",
    brief: [
      "Напишіть п'ять підпрограм за договором нижче. Готова головна програма викликає їх з різними числами, зокрема й з «крайніми» випадками (одиниця, нуль, число з нулями в кінці).",
      "Допоміжна функція <code>YesNo</code> уже є: вона перетворює <code>boolean</code> на слова «так» і «ні».",
    ],
    contract: [
      "<code>function IsPrime(n: integer): boolean</code>: просте число; числа менші за 2 не прості",
      "<code>function Gcd(a, b: integer): integer</code>: найбільший спільний дільник за алгоритмом Евкліда, <code>Gcd(0, 9) = 9</code>",
      "<code>function DigitSum(n: integer): integer</code>: сума цифр невід'ємного числа",
      "<code>function ReverseNumber(n: integer): integer</code>: цифри у зворотному порядку, <code>1200</code> стає <code>21</code>",
      "<code>procedure PrintPrimes(upTo: integer)</code>: друкує всі прості до <code>upTo</code> включно, <i>перед кожним</i> стоїть пробіл, перенесення рядка немає",
    ],
    mockup: [
      "IsPrime(1) = ні", "IsPrime(2) = так", "IsPrime(15) = ні", "IsPrime(97) = так", "Gcd(48, 18) = 6", "Gcd(17, 5) = 1", "Gcd(0, 9) = 9",
      "DigitSum(12345) = 15", "DigitSum(999) = 27", "DigitSum(0) = 0", "ReverseNumber(1234) = 4321", "ReverseNumber(1200) = 21", "ReverseNumber(7) = 7",
      "Прості до 30: 2 3 5 7 11 13 17 19 23 29", "Прості до 1:",
    ].join("\n"),
    starter: raw`program Main;

function YesNo(b: boolean): string;
begin
  if b then YesNo := 'так' else YesNo := 'ні';
end;

// TODO: function IsPrime(n: integer): boolean
// TODO: function Gcd(a, b: integer): integer
// TODO: function DigitSum(n: integer): integer
// TODO: function ReverseNumber(n: integer): integer
// TODO: procedure PrintPrimes(upTo: integer)  (перед кожним простим числом пробіл)

begin
  writeln('IsPrime(1) = ', YesNo(IsPrime(1)));
  writeln('IsPrime(2) = ', YesNo(IsPrime(2)));
  writeln('IsPrime(15) = ', YesNo(IsPrime(15)));
  writeln('IsPrime(97) = ', YesNo(IsPrime(97)));
  writeln('Gcd(48, 18) = ', Gcd(48, 18));
  writeln('Gcd(17, 5) = ', Gcd(17, 5));
  writeln('Gcd(0, 9) = ', Gcd(0, 9));
  writeln('DigitSum(12345) = ', DigitSum(12345));
  writeln('DigitSum(999) = ', DigitSum(999));
  writeln('DigitSum(0) = ', DigitSum(0));
  writeln('ReverseNumber(1234) = ', ReverseNumber(1234));
  writeln('ReverseNumber(1200) = ', ReverseNumber(1200));
  writeln('ReverseNumber(7) = ', ReverseNumber(7));
  write('Прості до 30:');
  PrintPrimes(30);
  writeln;
  write('Прості до 1:');
  PrintPrimes(1);
  writeln;
end.
`,
    requirements: [
      { id: "R1", short: "IsPrime: 1 ні, 2 так, 15 ні, 97 так", text: "<code>IsPrime</code> правильно визначає прості числа, зокрема одиницю (не проста) і двійку (проста).",
        hint: "Спершу відсікайте <code>n &lt; 2</code>. Дільники перевіряйте від 2, поки <code>d * d &lt;= n</code>.",
        checks: [{ on: "stdout", has: "IsPrime(1) = ні\nIsPrime(2) = так\nIsPrime(15) = ні\nIsPrime(97) = так" }] },
      { id: "R2", short: "Gcd за Евклідом: 6, 1 і 9", text: "<code>Gcd</code> знаходить найбільший спільний дільник, зокрема коли одне з чисел нуль.",
        hint: "Алгоритм Евкліда: поки <code>b &lt;&gt; 0</code>, замінюйте пару <code>(a, b)</code> на <code>(b, a mod b)</code>. Відповідь лишається в <code>a</code>.",
        checks: [{ on: "stdout", has: "Gcd(48, 18) = 6\nGcd(17, 5) = 1\nGcd(0, 9) = 9" }] },
      { id: "R3", short: "DigitSum: 15, 27 і 0", text: "<code>DigitSum</code> додає цифри числа, а для нуля повертає 0.",
        hint: "Остання цифра це <code>n mod 10</code>, а решта числа це <code>n div 10</code>. Повторюйте, доки <code>n &gt; 0</code>.",
        checks: [{ on: "stdout", has: "DigitSum(12345) = 15\nDigitSum(999) = 27\nDigitSum(0) = 0" }] },
      { id: "R4", short: "ReverseNumber: 4321, 21 і 7", text: "<code>ReverseNumber</code> розвертає цифри числа; нулі в кінці зникають (<code>1200</code> → <code>21</code>).",
        hint: "Нове число будуємо навпаки: <code>r := r * 10 + n mod 10</code>, а <code>n</code> скорочуємо через <code>div 10</code>.",
        checks: [{ on: "stdout", has: "ReverseNumber(1234) = 4321\nReverseNumber(1200) = 21\nReverseNumber(7) = 7" }] },
      { id: "R5", short: "PrintPrimes: прості до 30 і порожній список до 1", text: "<code>PrintPrimes</code> друкує прості числа до межі, перед кожним пробіл; для межі 1 нічого не друкує.",
        hint: "Проходьте числа від 2 до <code>upTo</code> і для кожного питайте <code>IsPrime</code>: це повторне використання вашої функції.",
        checks: [{ on: "stdout", matches: "Прості до 30: 2 3 5 7 11 13 17 19 23 29\nПрості до 1:(?:\n|$)" }] },
      { id: "R6", short: "Увесь вивід збігається з макетом", text: "Увесь вивід збігається з макетом.",
        hint: "Порівняйте з макетом рядок за рядком. Зайвий пробіл у кінці «Прості до 1:» теж помітний.",
        checks: [{ on: "stdout", equals: "IsPrime(1) = ні\nIsPrime(2) = так\nIsPrime(15) = ні\nIsPrime(97) = так\nGcd(48, 18) = 6\nGcd(17, 5) = 1\nGcd(0, 9) = 9\nDigitSum(12345) = 15\nDigitSum(999) = 27\nDigitSum(0) = 0\nReverseNumber(1234) = 4321\nReverseNumber(1200) = 21\nReverseNumber(7) = 7\nПрості до 30: 2 3 5 7 11 13 17 19 23 29\nПрості до 1:" }] },
    ],
  },
  {
    id: "pascal-student-cards", course: "pascal", runtime: "remote", lang: "pascal", xp: 55,
    after: "pascal/8", needs: ["записи (record)", "масиви записів", "процедури з var і const", "сортування (бульбашка)", "форматований вивід real"],
    title: "Проєкт: картотека студентів",
    context: "Записи в масиві — це проста «таблиця бази даних»: список товарів, учнів, замовлень. Підрахунок середнього, пошук найкращого й сортування — три операції, які потрібні майже з кожною таблицею.",
    brief: [
      "Опишіть підпрограми для картотеки з п'яти студентів. Тип запису <code>TStudent</code> і масив <code>TStudents</code> уже описані, а головна програма викликає ваші підпрограми й друкує звіт двічі: до і після сортування за балом.",
      "Дані студентів (їх заносить <code>FillStudents</code>): Olena, група 101, бал 4.5; Ihor, 102, 3.8; Marta, 101, 5.0; Taras, 103, 4.1; Sofia, 102, 3.2.",
    ],
    contract: [
      "<code>procedure FillStudents(var s: TStudents)</code>: заносить п'ятьох студентів у наведеному порядку",
      "<code>function Average(const s: TStudents): real</code>: середній бал",
      "<code>function BestIndex(const s: TStudents): integer</code>: номер студента з найвищим балом",
      "<code>function CountAbove(const s: TStudents; limit: real): integer</code>: скільки балів строго вище за межу",
      "<code>procedure SortByGrade(var s: TStudents)</code>: сортує за спаданням балу (метод бульбашки)",
      "<code>procedure PrintTable(const s: TStudents)</code>: рядки виду <code>1. Olena (101) 4.5</code>",
    ],
    mockup: [
      "Список:", "1. Olena (101) 4.5", "2. Ihor (102) 3.8", "3. Marta (101) 5.0", "4. Taras (103) 4.1", "5. Sofia (102) 3.2",
      "Середній бал: 4.12", "Кращий: Marta", "Балів вище 4.0: 3",
      "За балом:", "1. Marta (101) 5.0", "2. Olena (101) 4.5", "3. Taras (103) 4.1", "4. Ihor (102) 3.8", "5. Sofia (102) 3.2",
    ].join("\n"),
    starter: raw`program Main;
const
  Count = 5;
type
  TStudent = record
    name: string[12];
    group: integer;
    grade: real;
  end;
  TStudents = array[1..Count] of TStudent;

// TODO: procedure FillStudents(var s: TStudents)
// TODO: function Average(const s: TStudents): real
// TODO: function BestIndex(const s: TStudents): integer
// TODO: function CountAbove(const s: TStudents; limit: real): integer
// TODO: procedure SortByGrade(var s: TStudents)
// TODO: procedure PrintTable(const s: TStudents)

var
  students: TStudents;
begin
  FillStudents(students);
  writeln('Список:');
  PrintTable(students);
  writeln('Середній бал: ', Average(students):0:2);
  writeln('Кращий: ', students[BestIndex(students)].name);
  writeln('Балів вище 4.0: ', CountAbove(students, 4.0));
  SortByGrade(students);
  writeln('За балом:');
  PrintTable(students);
end.
`,
    requirements: [
      { id: "R1", short: "Заповнення й таблиця з п'яти студентів", text: "<code>FillStudents</code> заносить дані, а <code>PrintTable</code> друкує їх рядками <code>N. Ім'я (група) бал</code> з одним знаком після коми.",
        hint: "Поля запису читаються через крапку: <code>s[i].name</code>. Бал форматуйте як <code>s[i].grade:0:1</code>.",
        checks: [{ on: "stdout", has: "Список:\n1. Olena (101) 4.5\n2. Ihor (102) 3.8\n3. Marta (101) 5.0\n4. Taras (103) 4.1\n5. Sofia (102) 3.2\n" }] },
      { id: "R2", short: "Середній бал 4.12", text: "<code>Average</code> повертає середній бал усіх студентів.",
        hint: "Складіть усі <code>grade</code> і поділіть на кількість (константа <code>Count</code>). Ділення дробове: <code>/</code>.",
        checks: [{ on: "stdout", has: "Середній бал: 4.12\n" }] },
      { id: "R3", short: "Кращий студент: Marta", text: "<code>BestIndex</code> повертає номер студента з найвищим балом.",
        hint: "Запам'ятовуйте номер найкращого: починайте з 1 і міняйте його, коли знайшли вищий бал.",
        checks: [{ on: "stdout", has: "Кращий: Marta\n" }] },
      { id: "R4", short: "Балів строго вище 4.0: три", text: "<code>CountAbove</code> рахує студентів, чий бал <i>строго</i> вищий за межу.",
        hint: "Лічильник збільшуйте лише коли <code>grade &gt; limit</code>.",
        checks: [{ on: "stdout", has: "Балів вище 4.0: 3\n" }] },
      { id: "R5", short: "Сортування за спаданням балу", text: "Після <code>SortByGrade</code> таблиця йде від найвищого балу до найнижчого.",
        hint: "Бульбашка: двічі вкладений цикл, у якому сусідні записи міняються місцями, якщо порядок неправильний. Записи можна присвоювати цілком: <code>t := s[j]</code>.",
        checks: [{ on: "stdout", has: "За балом:\n1. Marta (101) 5.0\n2. Olena (101) 4.5\n3. Taras (103) 4.1\n4. Ihor (102) 3.8\n5. Sofia (102) 3.2" }] },
      { id: "R6", short: "SortByGrade змінює масив: параметр var", text: "<code>SortByGrade</code> отримує масив через <code>var</code>, тож сортує справжній масив, а не копію.",
        hint: "Без <code>var</code> процедура працює з копією, і після повернення порядок у головній програмі не змінюється.",
        checks: [{ on: "source", matches: ci("procedure") + "\\s+SortByGrade\\s*\\(\\s*" + ci("var") + "\\b" }] },
      { id: "R7", short: "Лише читаючі підпрограми беруть масив через const", text: "<code>Average</code> отримує масив через <code>const</code>: вона його лише читає.",
        hint: "Параметр <code>const</code> забороняє змінювати масив усередині функції й не копіює його.",
        checks: [{ on: "source", matches: ci("function") + "\\s+Average\\s*\\(\\s*" + ci("const") + "\\b" }] },
      { id: "R8", short: "Увесь звіт збігається з макетом", text: "Увесь вивід збігається з макетом.",
        hint: "Порівняйте з макетом рядок за рядком.",
        checks: [{ on: "stdout", equals: "Список:\n1. Olena (101) 4.5\n2. Ihor (102) 3.8\n3. Marta (101) 5.0\n4. Taras (103) 4.1\n5. Sofia (102) 3.2\nСередній бал: 4.12\nКращий: Marta\nБалів вище 4.0: 3\nЗа балом:\n1. Marta (101) 5.0\n2. Olena (101) 4.5\n3. Taras (103) 4.1\n4. Ihor (102) 3.8\n5. Sofia (102) 3.2" }] },
    ],
  },
];
