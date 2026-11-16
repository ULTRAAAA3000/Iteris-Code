// Еталонні рішення завдань Pascal (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const PASCAL = {
  "pascal-hello-fpc": raw`program Main;
begin
  writeln('Привіт, Pascal!');
  writeln('FPC працює');
end.
`,
  "pascal-structure": raw`program Main;
begin
  writeln('2 + 3 = ', 2 + 3);
  writeln('(8 + 4) * 3 = ', (8 + 4) * 3);
end.
`,
  "pascal-vars-total": raw`program Main;
var
  price: real;
  qty: integer;
  total: real;
begin
  price := 199.99;
  qty := 3;
  total := price * qty;
  writeln('Разом: ', total:0:2);
  writeln(17 div 5, ' ', 17 mod 5);
end.
`,
  "pascal-if-for": raw`program Main;
var
  i, n: integer;
begin
  for i := 1 to 20 do
  begin
    if i mod 2 = 0 then
      write(i, ' ');
  end;
  writeln;

  n := 7;
  if n mod 2 = 0 then
    writeln(n, ' парне')
  else
    writeln(n, ' непарне');
end.
`,
  "pascal-while-repeat": raw`program Main;
var
  n, sum, p, steps: integer;
begin
  n := 12345;
  sum := 0;
  while n > 0 do
  begin
    sum := sum + n mod 10;
    n := n div 10;
  end;
  writeln('Сума цифр: ', sum);

  p := 1;
  steps := 0;
  repeat
    p := p * 2;
    steps := steps + 1;
  until p > 1000;
  writeln('Степінь: ', steps);
end.
`,
  "pascal-arrays-stats": raw`program Main;
const
  nums: array[1..8] of integer = (5, 2, 9, 7, 4, 10, 3, 8);
var
  i, max, min, sum: integer;
begin
  max := nums[1];
  min := nums[1];
  sum := 0;
  for i := 1 to 8 do
  begin
    if nums[i] > max then max := nums[i];
    if nums[i] < min then min := nums[i];
    sum := sum + nums[i];
  end;
  writeln('Макс: ', max);
  writeln('Мін: ', min);
  writeln('Сума: ', sum);
end.
`,
  "pascal-subprograms": raw`program Main;
var
  x, y: integer;

function Factorial(n: integer): int64;
var
  i: integer;
  r: int64;
begin
  r := 1;
  for i := 2 to n do
    r := r * i;
  Factorial := r;
end;

procedure Swap(var a, b: integer);
var
  t: integer;
begin
  t := a;
  a := b;
  b := t;
end;

procedure PrintLine(c: char; n: integer);
var
  i: integer;
begin
  for i := 1 to n do
    write(c);
  writeln;
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
  "pascal-record-strings": raw`program Main;

type
  TProduct = record
    name: string;
    price: real;
  end;

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
  writeln('Pos: ', Pos('Pascal', s));
  writeln('Copy: ', Copy(s, 1, 5));
  writeln('Length: ', Length(s));
end.
`,
};
