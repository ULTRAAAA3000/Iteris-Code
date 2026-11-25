// Еталони чернеток Pascal-проєктів: повний код користувача (без основного блоку begin…end.), що проходить усі вимоги harness.
const raw = String.raw;

const guess = raw`program Main;
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

function PlayGame(secret: integer; const guesses: TGuesses; limit: integer): integer;
var
  i: integer;
begin
  PlayGame := 0;
  i := 1;
  while (i <= limit) and (i <= 8) do
  begin
    if guesses[i] = secret then
    begin
      PlayGame := i;
      exit;
    end;
    i := i + 1;
  end;
end;

function Score(attempt, limit: integer): integer;
begin
  if attempt = 0 then
    Score := 0
  else
    Score := (limit - attempt + 1) * 10;
end;
`;

const toolkit = raw`program Main;

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

function PrimeCount(upTo: integer): integer;
var
  i, n: integer;
begin
  n := 0;
  for i := 2 to upTo do
    if IsPrime(i) then
      n := n + 1;
  PrimeCount := n;
end;

function Lcm(a, b: integer): integer;
begin
  if (a = 0) or (b = 0) then
    Lcm := 0
  else
    Lcm := a div Gcd(a, b) * b;
end;
`;

const cards = raw`program Main;
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

function RowText(const st: TStudent; index: integer): string;
var
  idx, grp, gr: string;
begin
  str(index, idx);
  str(st.group, grp);
  str(st.grade:0:1, gr);
  RowText := idx + '. ' + st.name + ' (' + grp + ') ' + gr;
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
`;

export default { "pascal-guess-number": guess, "pascal-number-toolkit": toolkit, "pascal-student-cards": cards };
