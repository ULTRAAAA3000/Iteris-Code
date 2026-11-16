import type { RefSection } from "./types.ts";

const raw = String.raw;

export const pascal: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`program Hello;
begin
  writeln('Привіт, світе!');
end.`, note: "Програма починається з `program`, тіло між `begin` і `end.` (з крапкою). Рядки беруть в одинарні лапки." },
    { t: "Коментарі", code: raw`// однорядковий
{ багаторядковий }
(* ще один спосіб *)`, note: "Pascal не розрізняє великі й малі літери: `Begin` і `begin` те саме." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Опис змінних", code: raw`var
  age: integer;
  price: real;
  name: string;
  ok: boolean;
  letter: char;
const
  Pi = 3.14;`, note: "Змінні описують у розділі `var` до `begin`. Присвоєння записують як `:=`." },
    { t: "Присвоєння й арифметика", code: raw`age := 16;
price := 24.5;
writeln(7 div 2, ' ', 7 mod 2, ' ', 7 / 2:0:1);`, note: "`div` це ділення націло, `mod` остача, `/` завжди дає дріб. Запис `x:0:1` задає формат виводу." },
  ] },
  { t: "Ввід і вивід", items: [
    { t: "readln і writeln", code: raw`var name: string; age: integer;
begin
  write('Ім''я: ');
  readln(name);
  readln(age);
  writeln(name, ', вам ', age);
end.`, note: "Щоб записати одинарну лапку всередині рядка, її подвоюють: `''`." },
  ] },
  { t: "Умови", items: [
    { t: "if і case", code: raw`if age < 12 then
  writeln('дитина')
else if age < 18 then
  writeln('підліток')
else
  writeln('дорослий');

case n of
  1: writeln('один');
  2, 3: writeln('два або три');
else
  writeln('інше');
end;`, note: "Перед `else` крапку з комою не ставлять. Кілька дій об'єднують у `begin ... end`." },
    { t: "Логічні оператори", code: raw`if (x > 0) and (x < 10) then writeln('у діапазоні');
if not (x = 5) or (x > 100) then writeln('так');`, note: "Порівняння записують через `=`, нерівність через `<>`. Кожну умову беруть у дужки." },
  ] },
  { t: "Цикли", items: [
    { t: "for, while, repeat", code: raw`for i := 1 to 5 do
  write(i, ' ');

for i := 5 downto 1 do
  write(i, ' ');

while n > 0 do
  n := n - 1;

repeat
  n := n + 1;
until n >= 3;`, note: "`repeat ... until` виконується хоча б раз і завершується, коли умова стає істинною." },
  ] },
  { t: "Масиви", items: [
    { t: "Одновимірний масив", code: raw`var a: array[1..5] of integer;
    i: integer;
begin
  for i := 1 to 5 do
    a[i] := i * i;
  writeln(a[3]);
end.`, note: "Межі індексів задаються явно: `[1..5]`." },
  ] },
  { t: "Процедури й функції", items: [
    { t: "procedure і function", code: raw`procedure Hello(name: string);
begin
  writeln('Привіт, ', name);
end;

function Add(a, b: integer): integer;
begin
  Add := a + b;
end;`, note: "Функція повертає значення, присвоєне її імені (або змінній `Result`). Опис процедур іде перед головним `begin`." },
    { t: "Параметри-змінні", code: raw`procedure Inc(var x: integer);
begin
  x := x + 1;
end;`, note: "`var` перед параметром передає саму змінну, а не копію." },
  ] },
  { t: "Рядки", items: [
    { t: "Робота з рядками", code: raw`s := 'Pascal';
writeln(length(s), ' ', s[1], ' ', copy(s, 2, 3));
writeln(upcase(s[1]), pos('sc', s));
s := s + ' 7';`, note: "Індексація рядка починається з 1. `copy(s, з, скільки)` вирізає частину, `pos` шукає підрядок." },
  ] },
  { t: "Записи", items: [
    { t: "record", code: raw`type
  TUser = record
    name: string;
    age: integer;
  end;
var u: TUser;
begin
  u.name := 'Олена';
  u.age := 16;
  writeln(u.name, ' ', u.age);
end.`, note: "Запис об'єднує кілька полів різних типів в одну змінну." },
  ] },
];
