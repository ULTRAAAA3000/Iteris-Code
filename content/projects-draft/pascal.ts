// ЧЕРНЕТКИ Pascal-проєктів за ТЗ (Free Pascal 3.2). Не підключені до сайту (див. types.ts і Documentation/project-drafts.md).
// Код користувача це оголошення й підпрограми БЕЗ основного блоку begin…end.; harness дописується після нього,
// має власний основний блок і друкує «R1 PASS» або «R1 FAIL: причина». Підпрограми повертають значення, а не друкують:
// у Pascal перехопити вивід процедури не вийде, тож перевіряємо результати.
// УВАГА: у Free Pascal (режим за замовчуванням) тип integer має 16 біт, тобто до 32767. Усі числа в тестах тримаємо в цих межах (або беремо longint/int64).
import type { ProgramProject } from "./types.ts";

const raw = String.raw;

// Спільні допоміжні засоби harness: IcEqInt / IcEqStr / IcEqBool / IcNear збирають першу помилку вимоги, IcDone друкує підсумок
const HELPERS = raw`
var
  icFail: string;

procedure IcFailWith(msg: string);
begin
  if icFail = '' then icFail := msg;
end;

procedure IcEqInt(what: string; expected, got: int64);
var
  a, b: string;
begin
  if expected <> got then
  begin
    str(expected, a);
    str(got, b);
    IcFailWith(what + ': очікувалось ' + a + ', отримано ' + b);
  end;
end;

procedure IcEqStr(what, expected, got: string);
begin
  if expected <> got then
    IcFailWith(what + ': очікувалось «' + expected + '», отримано «' + got + '»');
end;

procedure IcEqBool(what: string; expected, got: boolean);
begin
  if expected <> got then
  begin
    if expected then IcFailWith(what + ': очікувалось так') else IcFailWith(what + ': очікувалось ні');
  end;
end;

procedure IcNear(what: string; expected, got: real);
var
  a, b: string;
begin
  if not (abs(expected - got) <= 0.000001) then
  begin
    str(expected:0:4, a);
    str(got:0:4, b);
    IcFailWith(what + ': очікувалось ' + a + ', отримано ' + b);
  end;
end;

procedure IcDone(id: string);
begin
  if icFail = '' then writeln(id, ' PASS') else writeln(id, ' FAIL: ', icFail);
  icFail := '';
end;
`;

/* ============================== 1. Гра «Вгадай число» ============================== */

const guessStarter = raw`program Main;
const
  MaxAttempts = 5;
type
  TGuesses = array[1..8] of integer;

// Гра «Вгадай число» на готових спробах. Тіла нижче лише заглушки, щоб програма збиралась.

// TODO: 'Замало', 'Забагато' або 'Вгадали!' залежно від того, як guess відноситься до secret
function Hint(secret, guess: integer): string;
begin
  Hint := '';
end;

// TODO: номер спроби (1…limit), на якій число вгадано; 0, якщо не вгадано за limit спроб
function PlayGame(secret: integer; const guesses: TGuesses; limit: integer): integer;
begin
  PlayGame := -1;
end;

// TODO: бали за перемогу: (limit - attempt + 1) * 10; якщо attempt = 0 (не вгадали), то 0
function Score(attempt, limit: integer): integer;
begin
  Score := -1;
end;
`;

const guessHarness = HELPERS + raw`
procedure MakeGuesses(var g: TGuesses; a, b, c, d, e, f, h, k: integer);
begin
  g[1] := a; g[2] := b; g[3] := c; g[4] := d; g[5] := e; g[6] := f; g[7] := h; g[8] := k;
end;

var
  g: TGuesses;
begin
  icFail := '';

  IcEqStr('Hint(37, 50)', 'Забагато', Hint(37, 50));
  IcEqStr('Hint(37, 25)', 'Замало', Hint(37, 25));
  IcEqStr('Hint(37, 37)', 'Вгадали!', Hint(37, 37));
  IcEqStr('Hint(1, 2)', 'Забагато', Hint(1, 2));
  IcEqStr('Hint(100, 99)', 'Замало', Hint(100, 99));
  IcDone('R1');

  MakeGuesses(g, 50, 25, 40, 37, 10, 11, 12, 13);
  IcEqInt('вгадано з четвертої спроби', 4, PlayGame(37, g, MaxAttempts));
  MakeGuesses(g, 7, 1, 2, 3, 4, 5, 6, 8);
  IcEqInt('вгадано з першої спроби', 1, PlayGame(7, g, MaxAttempts));
  MakeGuesses(g, 1, 2, 3, 4, 90, 6, 7, 8);
  IcEqInt('вгадано з останньої дозволеної спроби', 5, PlayGame(90, g, MaxAttempts));
  IcDone('R2');

  MakeGuesses(g, 10, 37, 37, 37, 37, 37, 37, 37);
  IcEqInt('перше влучання, повторні ігноруються', 2, PlayGame(37, g, MaxAttempts));
  MakeGuesses(g, 37, 37, 37, 37, 37, 37, 37, 37);
  IcEqInt('влучання з першої, решта ігнорується', 1, PlayGame(37, g, 8));
  IcDone('R3');

  MakeGuesses(g, 10, 20, 30, 40, 50, 60, 70, 80);
  IcEqInt('не вгадано', 0, PlayGame(90, g, MaxAttempts));
  MakeGuesses(g, 1, 2, 3, 4, 5, 90, 7, 8);
  IcEqInt('вгадано, але після ліміту', 0, PlayGame(90, g, MaxAttempts));
  IcDone('R4');

  MakeGuesses(g, 1, 2, 3, 90, 5, 6, 7, 8);
  IcEqInt('ліміт 3, влучання на 4-й', 0, PlayGame(90, g, 3));
  IcEqInt('ліміт 4, влучання на 4-й', 4, PlayGame(90, g, 4));
  MakeGuesses(g, 1, 2, 3, 4, 5, 6, 90, 8);
  IcEqInt('ліміт 8, влучання на 7-й', 7, PlayGame(90, g, 8));
  IcEqInt('ліміт 6, влучання на 7-й', 0, PlayGame(90, g, 6));
  IcDone('R5');

  IcEqInt('Score(1, 5)', 50, Score(1, 5));
  IcEqInt('Score(4, 5)', 20, Score(4, 5));
  IcEqInt('Score(5, 5)', 10, Score(5, 5));
  IcEqInt('Score(0, 5)', 0, Score(0, 5));
  IcEqInt('Score(2, 8)', 70, Score(2, 8));
  IcDone('R6');
end.
`;

/* ============================== 2. Набір числових утиліт ============================== */

const toolkitStarter = raw`program Main;

// Числові утиліти. Тіла нижче лише заглушки, щоб програма збиралась.

// TODO: чи просте число (числа менші за 2 не прості)
function IsPrime(n: integer): boolean;
begin
  IsPrime := true;
end;

// TODO: найбільший спільний дільник за алгоритмом Евкліда; Gcd(0, 9) = 9
function Gcd(a, b: integer): integer;
begin
  Gcd := -1;
end;

// TODO: сума цифр невід'ємного числа
function DigitSum(n: integer): integer;
begin
  DigitSum := -1;
end;

// TODO: цифри у зворотному порядку; нулі в кінці зникають (1200 -> 21)
function ReverseNumber(n: integer): integer;
begin
  ReverseNumber := -1;
end;

// TODO: скільки простих чисел від 2 до upTo включно (скористайтесь IsPrime)
function PrimeCount(upTo: integer): integer;
begin
  PrimeCount := -1;
end;

// TODO: найменше спільне кратне; для нуля 0 (скористайтесь Gcd)
function Lcm(a, b: integer): integer;
begin
  Lcm := -1;
end;
`;

const toolkitHarness = HELPERS + raw`
begin
  icFail := '';

  IcEqBool('IsPrime(1)', false, IsPrime(1));
  IcEqBool('IsPrime(0)', false, IsPrime(0));
  IcEqBool('IsPrime(-7)', false, IsPrime(-7));
  IcEqBool('IsPrime(2)', true, IsPrime(2));
  IcEqBool('IsPrime(3)', true, IsPrime(3));
  IcEqBool('IsPrime(4)', false, IsPrime(4));
  IcEqBool('IsPrime(15)', false, IsPrime(15));
  IcEqBool('IsPrime(97)', true, IsPrime(97));
  IcEqBool('IsPrime(7919)', true, IsPrime(7919));
  IcEqBool('IsPrime(7917)', false, IsPrime(7917));
  IcDone('R1');

  IcEqInt('Gcd(48, 18)', 6, Gcd(48, 18));
  IcEqInt('Gcd(17, 5)', 1, Gcd(17, 5));
  IcEqInt('Gcd(0, 9)', 9, Gcd(0, 9));
  IcEqInt('Gcd(9, 0)', 9, Gcd(9, 0));
  IcEqInt('Gcd(100, 10)', 10, Gcd(100, 10));
  IcEqInt('Gcd(270, 192)', 6, Gcd(270, 192));
  IcDone('R2');

  IcEqInt('DigitSum(12345)', 15, DigitSum(12345));
  IcEqInt('DigitSum(999)', 27, DigitSum(999));
  IcEqInt('DigitSum(0)', 0, DigitSum(0));
  IcEqInt('DigitSum(7)', 7, DigitSum(7));
  IcEqInt('DigitSum(10000)', 1, DigitSum(10000));
  IcDone('R3');

  IcEqInt('ReverseNumber(1234)', 4321, ReverseNumber(1234));
  IcEqInt('ReverseNumber(1200)', 21, ReverseNumber(1200));
  IcEqInt('ReverseNumber(7)', 7, ReverseNumber(7));
  IcEqInt('ReverseNumber(0)', 0, ReverseNumber(0));
  IcEqInt('ReverseNumber(10000)', 1, ReverseNumber(10000));
  IcDone('R4');

  IcEqInt('PrimeCount(30)', 10, PrimeCount(30));
  IcEqInt('PrimeCount(1)', 0, PrimeCount(1));
  IcEqInt('PrimeCount(2)', 1, PrimeCount(2));
  IcEqInt('PrimeCount(100)', 25, PrimeCount(100));
  IcEqInt('PrimeCount(1000)', 168, PrimeCount(1000));
  IcDone('R5');

  IcEqInt('Lcm(4, 6)', 12, Lcm(4, 6));
  IcEqInt('Lcm(21, 6)', 42, Lcm(21, 6));
  IcEqInt('Lcm(0, 5)', 0, Lcm(0, 5));
  IcEqInt('Lcm(7, 13)', 91, Lcm(7, 13));
  IcEqInt('Lcm(100, 75)', 300, Lcm(100, 75));
  IcDone('R6');
end.
`;

/* ============================== 3. Картотека студентів ============================== */

const cardsStarter = raw`program Main;
const
  Count = 5;
type
  TStudent = record
    name: string[12];
    group: integer;
    grade: real;
  end;
  TStudents = array[1..Count] of TStudent;

// Картотека з п'яти студентів. Тіла нижче лише заглушки, щоб програма збиралась.

// TODO: занести студентів у такому порядку: Olena (група 101, бал 4.5), Ihor (102, 3.8), Marta (101, 5.0), Taras (103, 4.1), Sofia (102, 3.2)
procedure FillStudents(var s: TStudents);
begin
end;

// TODO: рядок таблиці виду '1. Olena (101) 4.5' (номер, ім'я, група в дужках, бал з одним знаком після коми)
function RowText(const st: TStudent; index: integer): string;
begin
  RowText := '';
end;

// TODO: середній бал усіх студентів
function Average(const s: TStudents): real;
begin
  Average := -1;
end;

// TODO: номер студента з найвищим балом (при однакових перший)
function BestIndex(const s: TStudents): integer;
begin
  BestIndex := 0;
end;

// TODO: скільки студентів мають бал СТРОГО вищий за limit
function CountAbove(const s: TStudents; limit: real): integer;
begin
  CountAbove := -1;
end;

// TODO: відсортувати масив за спаданням балу методом бульбашки (змінюється сам масив)
procedure SortByGrade(var s: TStudents);
begin
end;
`;

const cardsHarness = HELPERS + raw`
procedure IcSet(var st: TStudent; n: string; g: integer; mark: real);
begin
  st.name := n;
  st.group := g;
  st.grade := mark;
end;

procedure IcGrades(var s: TStudents; a, b, c, d, e: real);
var
  i: integer;
begin
  IcSet(s[1], 'A', 1, a);
  IcSet(s[2], 'B', 2, b);
  IcSet(s[3], 'C', 3, c);
  IcSet(s[4], 'D', 4, d);
  IcSet(s[5], 'E', 5, e);
  i := 0;
end;

procedure IcCheckStudent(const s: TStudents; i: integer; n: string; g: integer; mark: real);
var
  w: string;
begin
  str(i, w);
  IcEqStr('студент ' + w + ': імʼя', n, s[i].name);
  IcEqInt('студент ' + w + ': група', g, s[i].group);
  IcNear('студент ' + w + ': бал', mark, s[i].grade);
end;

var
  s, t: TStudents;
  st: TStudent;
begin
  icFail := '';

  FillStudents(s);
  IcCheckStudent(s, 1, 'Olena', 101, 4.5);
  IcCheckStudent(s, 2, 'Ihor', 102, 3.8);
  IcCheckStudent(s, 3, 'Marta', 101, 5.0);
  IcCheckStudent(s, 4, 'Taras', 103, 4.1);
  IcCheckStudent(s, 5, 'Sofia', 102, 3.2);
  IcDone('R1');

  IcSet(st, 'Olena', 101, 4.5);
  IcEqStr('RowText 1', '1. Olena (101) 4.5', RowText(st, 1));
  IcSet(st, 'Marta', 101, 5.0);
  IcEqStr('RowText 3', '3. Marta (101) 5.0', RowText(st, 3));
  IcSet(st, 'Ivan', 7, 4.04);
  IcEqStr('RowText округлення вниз', '4. Ivan (7) 4.0', RowText(st, 4));
  IcSet(st, 'Anna', 12, 3.96);
  IcEqStr('RowText округлення вгору', '5. Anna (12) 4.0', RowText(st, 5));
  IcDone('R2');

  FillStudents(s);
  IcNear('середній бал', 4.12, Average(s));
  IcGrades(t, 3, 3, 3, 3, 3);
  IcNear('усі однакові', 3.0, Average(t));
  IcGrades(t, 1, 2, 3, 4, 5);
  IcNear('1..5', 3.0, Average(t));
  IcDone('R3');

  FillStudents(s);
  IcEqInt('кращий у картотеці', 3, BestIndex(s));
  IcGrades(t, 4, 5, 5, 3, 2);
  IcEqInt('при однакових перший', 2, BestIndex(t));
  IcGrades(t, 1, 2, 3, 4, 5);
  IcEqInt('кращий останній', 5, BestIndex(t));
  IcDone('R4');

  FillStudents(s);
  IcEqInt('вище 4.0', 3, CountAbove(s, 4.0));
  IcEqInt('вище 5.0', 0, CountAbove(s, 5.0));
  IcEqInt('вище 0', 5, CountAbove(s, 0));
  IcEqInt('вище 4.1 (рівний не рахується)', 2, CountAbove(s, 4.1));
  IcDone('R5');

  FillStudents(s);
  SortByGrade(s);
  IcCheckStudent(s, 1, 'Marta', 101, 5.0);
  IcCheckStudent(s, 2, 'Olena', 101, 4.5);
  IcCheckStudent(s, 3, 'Taras', 103, 4.1);
  IcCheckStudent(s, 4, 'Ihor', 102, 3.8);
  IcCheckStudent(s, 5, 'Sofia', 102, 3.2);
  IcDone('R6');

  IcGrades(t, 5, 4, 3, 2, 1);
  SortByGrade(t);
  IcCheckStudent(t, 1, 'A', 1, 5);
  IcCheckStudent(t, 5, 'E', 5, 1);
  IcGrades(t, 1, 2, 3, 4, 5);
  SortByGrade(t);
  IcCheckStudent(t, 1, 'E', 5, 5);
  IcCheckStudent(t, 3, 'C', 3, 3);
  IcCheckStudent(t, 5, 'A', 1, 1);
  IcGrades(t, 2, 2, 2, 2, 2);
  SortByGrade(t);
  IcNear('сума після сортування однакових', 10.0, t[1].grade + t[2].grade + t[3].grade + t[4].grade + t[5].grade);
  IcDone('R7');
end.
`;

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "pascal-guess-number", lang: "pascal", lesson: "pascal/5", xp: 45,
    title: "Проєкт: гра «Вгадай число» (на готових спробах)",
    context: "Цикл «спробуй, перевір, зупинись, коли вийшло або вичерпано спроби» живе в іграх, входах за паролем і повторних запитах до сервера. Це перший справжній алгоритм, де цикл має дві умови завершення.",
    brief: [
      "У пісочниці немає клавіатури, тому гра відбувається «на папері»: гравець уже зробив спроби, і вони лежать у масиві. Ваше завдання: функція-підказка, функція, що програє гру за спробами, і функція підрахунку балів. Головної програми не пишіть: її дописує перевірка й викликає ваші функції з різними даними.",
      "<code>PlayGame</code> перебирає спроби по черзі й зупиняється, коли число вгадано або вичерпано ліміт <code>limit</code>. Масив завжди має 8 спроб, але користуватись можна не більше, ніж дозволяє ліміт. Константа <code>MaxAttempts = 5</code> описана в заготовці.",
    ],
    contract: [
      "<code>function Hint(secret, guess: integer): string</code> повертає <code>Замало</code>, <code>Забагато</code> або <code>Вгадали!</code>",
      "<code>function PlayGame(secret: integer; const guesses: TGuesses; limit: integer): integer</code>: номер спроби, на якій вгадано, або 0",
      "<code>function Score(attempt, limit: integer): integer</code>: бали <code>(limit - attempt + 1) * 10</code>, для невдачі (<code>attempt = 0</code>) нуль",
    ],
    requirements: [
      { id: "R1", text: "<code>Hint</code> повертає <code>Замало</code>, коли спроба менша за загадане, <code>Забагато</code>, коли більша, і <code>Вгадали!</code>, коли рівна.",
        hint: "Порівняйте <code>guess</code> із <code>secret</code>: менше, більше або рівне. Результат функції присвоюється її імені: <code>Hint := '…'</code>." },
      { id: "R2", text: "<code>PlayGame</code> повертає номер спроби, на якій число вгадано (із першої, з четвертої, з останньої дозволеної).",
        hint: "Лічильник спроб і цикл <code>while</code>: на кожному кроці порівняйте спробу із загаданим числом." },
      { id: "R3", text: "Після першого влучання гра зупиняється: повторні влучання в масиві ігноруються.",
        hint: "Щойно число вгадано, запишіть номер спроби в результат і вийдіть із функції (<code>exit</code>) або з циклу." },
      { id: "R4", text: "Якщо число не вгадано за ліміт спроб, <code>PlayGame</code> повертає 0 (навіть якщо влучання є в масиві пізніше за ліміт).",
        hint: "Цикл має зупинитися на <code>limit</code>-й спробі, навіть коли в масиві ще є елементи. Результат за замовчуванням 0." },
      { id: "R5", text: "Ліміт береться з параметра <code>limit</code>, а не записаний числом у коді; масив має лише 8 елементів, тож цикл не виходить за його межі.",
        hint: "У умові циклу порівнюйте лічильник із параметром: <code>i &lt;= limit</code>. Масив закінчується на восьмому елементі." },
      { id: "R6", text: "<code>Score</code> нараховує бали за швидкість: чим раніше вгадано, тим більше; за невдачу 0.",
        hint: "Формула <code>(limit - attempt + 1) * 10</code>. Окремо оброблюйте <code>attempt = 0</code>." },
    ],
    starter: guessStarter,
    harness: guessHarness,
  },
  {
    id: "pascal-number-toolkit", lang: "pascal", lesson: "pascal/7", xp: 50,
    title: "Проєкт: набір числових утиліт",
    context: "Маленькі перевірені підпрограми є цеглинками великих програм: «чи просте число», «найбільший спільний дільник», «сума цифр» у реальних проєктах лежать у бібліотеках. Тут ви зберете власну мінібібліотеку, у якій одні функції користуються іншими.",
    brief: [
      "Напишіть шість підпрограм за договором нижче. Головної програми не пишіть: її дописує перевірка й викликає ваші підпрограми з різними числами, зокрема й з «крайніми» випадками (одиниця, нуль, число з нулями в кінці).",
      "<code>PrimeCount</code> має користуватись вашою <code>IsPrime</code>, а <code>Lcm</code> вашою <code>Gcd</code>: так підпрограми працюють разом.",
    ],
    contract: [
      "<code>function IsPrime(n: integer): boolean</code>: просте число; числа менші за 2 не прості",
      "<code>function Gcd(a, b: integer): integer</code>: найбільший спільний дільник за алгоритмом Евкліда, <code>Gcd(0, 9) = 9</code>",
      "<code>function DigitSum(n: integer): integer</code>: сума цифр невід'ємного числа",
      "<code>function ReverseNumber(n: integer): integer</code>: цифри у зворотному порядку, <code>1200</code> стає <code>21</code>",
      "<code>function PrimeCount(upTo: integer): integer</code>: скільки простих від 2 до <code>upTo</code> включно",
      "<code>function Lcm(a, b: integer): integer</code>: найменше спільне кратне, для нуля 0",
    ],
    requirements: [
      { id: "R1", text: "<code>IsPrime</code> правильно визначає прості числа, зокрема 0, 1 і від'ємні (не прості), двійку (проста) та велике просте 7919.",
        hint: "Спершу відсікайте <code>n &lt; 2</code>. Дільники перевіряйте від 2, поки <code>d * d &lt;= n</code>." },
      { id: "R2", text: "<code>Gcd</code> знаходить найбільший спільний дільник, зокрема коли одне з чисел нуль.",
        hint: "Алгоритм Евкліда: поки <code>b &lt;&gt; 0</code>, замінюйте пару <code>(a, b)</code> на <code>(b, a mod b)</code>. Відповідь лишається в <code>a</code>." },
      { id: "R3", text: "<code>DigitSum</code> додає цифри числа, а для нуля повертає 0.",
        hint: "Остання цифра це <code>n mod 10</code>, а решта числа це <code>n div 10</code>. Повторюйте, доки <code>n &gt; 0</code>." },
      { id: "R4", text: "<code>ReverseNumber</code> розвертає цифри числа; нулі в кінці зникають (<code>1200</code> → <code>21</code>).",
        hint: "Нове число будуємо навпаки: <code>r := r * 10 + n mod 10</code>, а <code>n</code> скорочуємо через <code>div 10</code>." },
      { id: "R5", text: "<code>PrimeCount</code> рахує прості числа до межі включно (1 дає 0, 2 дає 1, 100 дає 25, 1000 дає 168).",
        hint: "Проходьте числа від 2 до <code>upTo</code> і для кожного питайте <code>IsPrime</code>: це повторне використання вашої функції." },
      { id: "R6", text: "<code>Lcm</code> повертає найменше спільне кратне (через <code>Gcd</code>); для нуля повертає 0.",
        hint: "Формула <code>a div Gcd(a, b) * b</code>: спершу ділення, щоб число не вийшло за межі <code>integer</code>. Нуль обробіть окремо." },
    ],
    starter: toolkitStarter,
    harness: toolkitHarness,
  },
  {
    id: "pascal-student-cards", lang: "pascal", lesson: "pascal/8", xp: 55,
    title: "Проєкт: картотека студентів",
    context: "Записи в масиві це проста «таблиця бази даних»: список товарів, учнів, замовлень. Підрахунок середнього, пошук найкращого й сортування є трьома операціями, які потрібні майже з кожною таблицею.",
    brief: [
      "Опишіть підпрограми для картотеки з п'яти студентів. Тип запису <code>TStudent</code> і масив <code>TStudents</code> уже описані. Головної програми не пишіть: її дописує перевірка й викликає ваші підпрограми.",
      "Дані студентів (їх заносить <code>FillStudents</code>): Olena, група 101, бал 4.5; Ihor, 102, 3.8; Marta, 101, 5.0; Taras, 103, 4.1; Sofia, 102, 3.2. Імена записуйте латиницею, як у таблиці.",
    ],
    contract: [
      "<code>procedure FillStudents(var s: TStudents)</code>: заносить п'ятьох студентів у наведеному порядку",
      "<code>function RowText(const st: TStudent; index: integer): string</code>: рядок виду <code>1. Olena (101) 4.5</code>",
      "<code>function Average(const s: TStudents): real</code>: середній бал",
      "<code>function BestIndex(const s: TStudents): integer</code>: номер студента з найвищим балом, при однакових перший",
      "<code>function CountAbove(const s: TStudents; limit: real): integer</code>: скільки балів <i>строго</i> вище за межу",
      "<code>procedure SortByGrade(var s: TStudents)</code>: сортує за спаданням балу (метод бульбашки)",
    ],
    requirements: [
      { id: "R1", text: "<code>FillStudents</code> заносить у масив п'ятьох студентів із вказаними іменами, групами й балами.",
        hint: "Поля запису читаються й присвоюються через крапку: <code>s[1].name := 'Olena';</code>. Масив передається через <code>var</code>, щоб зміни лишилися." },
      { id: "R2", text: "<code>RowText</code> формує рядок <code>N. Ім'я (група) бал</code> з одним знаком після коми.",
        hint: "Числа в рядок перетворює <code>str(x, s)</code>, а для дробових задайте формат: <code>str(st.grade:0:1, s)</code>." },
      { id: "R3", text: "<code>Average</code> повертає середній бал усіх студентів.",
        hint: "Складіть усі <code>grade</code> і поділіть на кількість (константа <code>Count</code>). Ділення дробове: <code>/</code>." },
      { id: "R4", text: "<code>BestIndex</code> повертає номер студента з найвищим балом, а при однакових балах перший.",
        hint: "Запам'ятовуйте номер найкращого: починайте з 1 і міняйте його лише коли знайшли <i>строго</i> вищий бал." },
      { id: "R5", text: "<code>CountAbove</code> рахує студентів, чий бал <i>строго</i> вищий за межу (рівний межі не рахується).",
        hint: "Лічильник збільшуйте лише коли <code>grade &gt; limit</code>." },
      { id: "R6", text: "<code>SortByGrade</code> сортує масив за спаданням балу, а записи переміщуються цілком (ім'я, група й бал лишаються разом).",
        hint: "Бульбашка: двічі вкладений цикл; сусідні записи міняються місцями через допоміжну змінну типу <code>TStudent</code>. Параметр має бути <code>var</code>." },
      { id: "R7", text: "Сортування правильно працює і на вже відсортованому, і на зворотному порядку, і коли всі бали однакові.",
        hint: "Зовнішній цикл має зробити достатньо проходів: на зворотному порядку потрібні всі <code>Count - 1</code>." },
    ],
    starter: cardsStarter,
    harness: cardsHarness,
  },
];
