// Еталони чернеток проєктів Pascal і мутації для перевірки вимог. У сайт не потрапляє.
const raw = String.raw;

export const PASCAL_SOLUTIONS = {
  "pascal-guess-number": raw`program Main;
const
  MaxAttempts = 5;
type
  TGuesses = array[1..8] of integer;

function Hint(secret, guess: integer): string;
begin
  if guess < secret then
    Hint := 'Замало'
  else if guess > secret then
    Hint := 'Забагато'
  else
    Hint := 'Вгадали!';
end;

procedure Play(secret: integer; const guesses: TGuesses);
var
  attempt: integer;
  won: boolean;
begin
  attempt := 0;
  won := false;
  while (attempt < MaxAttempts) and not won do
  begin
    attempt := attempt + 1;
    writeln('Спроба ', attempt, ': ', guesses[attempt], ' - ', Hint(secret, guesses[attempt]));
    won := guesses[attempt] = secret;
  end;
  if won then
    writeln('Спроб: ', attempt)
  else
    writeln('Спроби закінчились. Число було ', secret);
end;

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

  "pascal-number-toolkit": raw`program Main;

function YesNo(b: boolean): string;
begin
  if b then YesNo := 'так' else YesNo := 'ні';
end;

function IsPrime(n: integer): boolean;
var
  d: integer;
begin
  if n < 2 then
  begin
    IsPrime := false;
    exit;
  end;
  d := 2;
  while d * d <= n do
  begin
    if n mod d = 0 then
    begin
      IsPrime := false;
      exit;
    end;
    d := d + 1;
  end;
  IsPrime := true;
end;

function Gcd(a, b: integer): integer;
var
  t: integer;
begin
  while b <> 0 do
  begin
    t := a mod b;
    a := b;
    b := t;
  end;
  Gcd := a;
end;

function DigitSum(n: integer): integer;
var
  s: integer;
begin
  s := 0;
  while n > 0 do
  begin
    s := s + n mod 10;
    n := n div 10;
  end;
  DigitSum := s;
end;

function ReverseNumber(n: integer): integer;
var
  r: integer;
begin
  r := 0;
  while n > 0 do
  begin
    r := r * 10 + n mod 10;
    n := n div 10;
  end;
  ReverseNumber := r;
end;

procedure PrintPrimes(upTo: integer);
var
  i: integer;
begin
  for i := 2 to upTo do
    if IsPrime(i) then
      write(' ', i);
end;

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

  "pascal-student-cards": raw`program Main;
const
  Count = 5;
type
  TStudent = record
    name: string[12];
    group: integer;
    grade: real;
  end;
  TStudents = array[1..Count] of TStudent;

procedure SetStudent(var st: TStudent; n: string; g: integer; mark: real);
begin
  st.name := n;
  st.group := g;
  st.grade := mark;
end;

procedure FillStudents(var s: TStudents);
begin
  SetStudent(s[1], 'Olena', 101, 4.5);
  SetStudent(s[2], 'Ihor', 102, 3.8);
  SetStudent(s[3], 'Marta', 101, 5.0);
  SetStudent(s[4], 'Taras', 103, 4.1);
  SetStudent(s[5], 'Sofia', 102, 3.2);
end;

function Average(const s: TStudents): real;
var
  i: integer;
  sum: real;
begin
  sum := 0;
  for i := 1 to Count do
    sum := sum + s[i].grade;
  Average := sum / Count;
end;

function BestIndex(const s: TStudents): integer;
var
  i, best: integer;
begin
  best := 1;
  for i := 2 to Count do
    if s[i].grade > s[best].grade then
      best := i;
  BestIndex := best;
end;

function CountAbove(const s: TStudents; limit: real): integer;
var
  i, n: integer;
begin
  n := 0;
  for i := 1 to Count do
    if s[i].grade > limit then
      n := n + 1;
  CountAbove := n;
end;

procedure SortByGrade(var s: TStudents);
var
  i, j: integer;
  t: TStudent;
begin
  for i := 1 to Count - 1 do
    for j := 1 to Count - i do
      if s[j].grade < s[j + 1].grade then
      begin
        t := s[j];
        s[j] := s[j + 1];
        s[j + 1] := t;
      end;
end;

procedure PrintTable(const s: TStudents);
var
  i: integer;
begin
  for i := 1 to Count do
    writeln(i, '. ', s[i].name, ' (', s[i].group, ') ', s[i].grade:0:1);
end;

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
};

export const PASCAL_MUTATIONS = {
  "pascal-guess-number": [
    { fails: ["R1", "R7"], replace: [["Hint := 'Замало'", "Hint := 'Забагато'"]] },
    { fails: ["R2", "R7"], replace: [["writeln('Спроб: ', attempt)", "writeln('Всього: ', attempt)"]] },
    { fails: ["R3", "R7"], replace: [["while (attempt < MaxAttempts) and not won do", "while attempt < MaxAttempts do"]] },
    { fails: ["R4", "R6", "R7"], replace: [["(attempt < MaxAttempts)", "(attempt < 8)"]] },
    { fails: ["R5", "R7"], replace: [["while (attempt < MaxAttempts) and not won do", "if (attempt < MaxAttempts) and not won then"]] },
    // той самий результат, але ліміт записано числом: поводження не змінилось, тож падає лише R6
    { fails: ["R6"], replace: [["(attempt < MaxAttempts)", "(attempt < 5)"]] },
  ],
  "pascal-number-toolkit": [
    { fails: ["R1", "R6"], replace: [["if n < 2 then", "if n < 1 then"]] },
    { fails: ["R2", "R6"], replace: [["while b <> 0 do", "while b > 1 do"]] },
    { fails: ["R3", "R6"], replace: [["s := s + n mod 10;", "s := s + n mod 9;"]] },
    { fails: ["R4", "R6"], replace: [["r := r * 10 + n mod 10;", "r := r + n mod 10;"]] },
    { fails: ["R5", "R6"], replace: [["for i := 2 to upTo do", "for i := 2 to upTo div 2 do"]] },
  ],
  "pascal-student-cards": [
    { fails: ["R1", "R8"], replace: [["SetStudent(s[2], 'Ihor', 102, 3.8);", "SetStudent(s[2], 'Ihor', 102, 3.9);"]] },
    { fails: ["R2", "R8"], replace: [["Average := sum / Count;", "Average := sum / (Count + 1);"]] },
    { fails: ["R3", "R8"], replace: [["if s[i].grade > s[best].grade then", "if s[i].grade < s[best].grade then"]] },
    { fails: ["R4", "R8"], replace: [["if s[i].grade > limit then", "if s[i].grade >= 4.5 then"]] },
    { fails: ["R5", "R8"], replace: [["if s[j].grade < s[j + 1].grade then", "if s[j].grade > s[j + 1].grade then"]] },
    { fails: ["R6", "R5", "R8"], replace: [["procedure SortByGrade(var s: TStudents);", "procedure SortByGrade(s: TStudents);"]] },
    { fails: ["R7"], replace: [["function Average(const s: TStudents): real;", "function Average(s: TStudents): real;"]] },
  ],
};
