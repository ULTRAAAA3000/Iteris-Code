import type { RefSection } from "./types.ts";

const raw = String.raw;

export const csharp: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`Console.WriteLine("Привіт, світе!");
Console.WriteLine("Вік: " + 16);`, note: "З C# 9 код можна писати без класу й `Main`: це інструкції верхнього рівня. Типи, оголошені у файлі, пишуть після них." },
    { t: "Класична форма з Main", code: raw`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Привіт, світе!");
    }
}`, note: "Виконання починається з методу `Main`. Директива `using System;` підключає простір імен, у якому живе `Console`." },
    { t: "Команди dotnet", code: raw`dotnet new console -o Hello   # створити проєкт
cd Hello
dotnet run                    # зібрати й запустити
dotnet build                  # лише зібрати`, note: "Команди виконуються в терміналі. Проєкт описує файл `.csproj`, а код лежить у `Program.cs`." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Оголошення", code: raw`int age = 16;
var name = "Олена";
const double Pi = 3.14;
string? city = null;
age += 1;
Console.WriteLine($"{name}, {age}, {Pi}");`, note: "`var` виводить тип із початкового значення. `const` це стала, а `string?` дозволяє значенню бути `null`." },
    { t: "Базові типи", code: raw`int i = 42;
long big = 10_000_000_000;
double d = 3.14;
decimal price = 9.99m;
float f = 1.5f;
bool ok = true;
char c = 'A';
string s = "текст";`, note: "`decimal` призначений для грошей, `double` для звичайних дробів. Суфікси `m` і `f` задають тип літерала, а `_` розділяє розряди." },
    { t: "Перетворення типів", code: raw`int n = int.Parse("12");
bool ok = int.TryParse("abc", out int m);
int y = (int)3.9;
string s = 42.ToString();
long z = Convert.ToInt64("5");
Console.WriteLine($"{n} {ok} {m} {y} {s} {z}");`, note: "`Parse` кидає виняток на поганому тексті, `TryParse` повертає `false`. Явне приведення `(int)` відкидає дробову частину." },
  ] },
  { t: "Рядки", items: [
    { t: "Інтерполяція й літерали", code: raw`string name = "Олена";
int age = 16;
Console.WriteLine($"{name} має {age} років");
Console.WriteLine($"{3.14159:F2} {age,5} {age:D4}");
string path = @"C:\temp\file.txt";
string multi = """
    Перший рядок
    Другий рядок
    """;`, note: "`$\"...{x}\"` підставляє значення, після `:` задають формат. `@\"...\"` не обробляє `\\`, а `\"\"\"...\"\"\"` це багаторядковий сирий рядок." },
    { t: "Методи рядків", code: raw`string s = "  Hello, C#  ";
string t = s.Trim();
Console.WriteLine(t.ToUpper());
Console.WriteLine(t.Replace("C#", "світ"));
Console.WriteLine(string.Join("|", t.Split(',')));
Console.WriteLine(t.Contains("C#"));
Console.WriteLine(t.Substring(0, 5));
Console.WriteLine(t.Length);`, note: "Рядки незмінні: `Trim`, `Replace`, `ToUpper` повертають новий рядок. `Split` ділить текст, а `string.Join` склеює частини." },
    { t: "StringBuilder", code: raw`using System.Text;

var sb = new StringBuilder();
sb.Append("a").Append(1).AppendLine("!");
sb.Insert(0, ">");
Console.WriteLine(sb.ToString());`, note: "`StringBuilder` зручний, коли рядок збирають по частинах у циклі: він не створює новий рядок на кожну зміну." },
  ] },
  { t: "Умови", items: [
    { t: "if і тернарний оператор", code: raw`int n = 7;
if (n % 2 == 0) Console.WriteLine("парне");
else if (n > 5) Console.WriteLine("непарне й більше 5");
else Console.WriteLine("непарне");
string kind = n < 0 ? "мінус" : "плюс";`, note: "Умова в круглих дужках має бути типу `bool`. Запис `умова ? a : b` вибирає одне з двох значень." },
    { t: "switch", code: raw`int day = 6;
switch (day)
{
    case 6:
    case 7:
        Console.WriteLine("вихідний");
        break;
    default:
        Console.WriteLine("будній");
        break;
}`, note: "Кожна гілка `case` закінчується `break`. Кілька міток поспіль ділять одну гілку, `default` ловить решту значень." },
    { t: "Вираз switch", code: raw`int day = 6;
string type = day switch
{
    >= 1 and <= 5 => "будній",
    6 or 7 => "вихідний",
    _ => "невідомо"
};
Console.WriteLine(type);`, note: "`switch` як вираз повертає значення. Шаблони `and`, `or` і порівняння роблять його компактнішим, а `_` означає «усе інше»." },
    { t: "Шаблони is", code: raw`object o = 42;
if (o is int x && x > 10)
    Console.WriteLine($"велике {x}");
if (o is not string)
    Console.WriteLine("не рядок");`, note: "`is` перевіряє тип і може одразу оголосити змінну (`int x`). Заперечення записують як `is not`." },
  ] },
  { t: "Цикли", items: [
    { t: "for, while, do", code: raw`for (int i = 0; i < 3; i++)
    Console.WriteLine(i);
int n = 3;
while (n > 0) n--;
do { n++; } while (n < 3);`, note: "`do ... while` перевіряє умову після тіла, тож тіло виконається принаймні раз." },
    { t: "foreach", code: raw`int[] nums = { 10, 20, 30 };
foreach (int v in nums)
    Console.WriteLine(v);
foreach (char ch in "C#")
    Console.WriteLine(ch);`, note: "`foreach` проходить по будь-якій колекції та по рядку. Змінну циклу в тілі змінювати не можна." },
    { t: "break і continue", code: raw`for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0) continue;
    if (i > 7) break;
    Console.WriteLine(i);
}`, note: "`continue` переходить до наступної ітерації, `break` повністю виходить із циклу." },
  ] },
  { t: "Методи", items: [
    { t: "Оголошення", code: raw`static int Add(int a, int b) => a + b;
static void Greet(string name)
{
    Console.WriteLine($"Привіт, {name}!");
}
Console.WriteLine(Add(2, 3));
Greet("Олена");`, note: "Тип результату пишуть перед назвою, `void` означає «нічого не повертає». Запис `=>` це скорочення для методу з одним виразом." },
    { t: "Параметри", code: raw`static double Area(double w, double h = 1) => w * h;
static bool TryDiv(int a, int b, out int result)
{
    result = b == 0 ? 0 : a / b;
    return b != 0;
}
Console.WriteLine(Area(h: 2, w: 3));
Console.WriteLine(Area(5));
if (TryDiv(10, 2, out int q)) Console.WriteLine(q);`, note: "Параметр може мати значення за замовчуванням і викликатися за іменем. `out` повертає додаткове значення через параметр." },
    { t: "Лямбди й делегати", code: raw`Func<int, int> square = x => x * x;
Action<string> say = s => Console.WriteLine(s);
Predicate<int> even = n => n % 2 == 0;
say("ok");
Console.WriteLine(square(5));
Console.WriteLine(even(4));`, note: "`Func` повертає значення, `Action` ні, `Predicate` повертає `bool`. Лямбда `x => ...` це короткий запис анонімного методу." },
    { t: "Кортежі", code: raw`static (int Min, int Max) Order(int a, int b) =>
    (Math.Min(a, b), Math.Max(a, b));
var (lo, hi) = Order(5, 2);
Console.WriteLine($"{lo} {hi}");`, note: "Кортеж `(A, B)` дозволяє повернути кілька значень, а `var (x, y) = ...` розпаковує їх у змінні." },
  ] },
  { t: "Колекції", items: [
    { t: "Масив і List", code: raw`int[] arr = { 1, 2, 3 };
int[] zeros = new int[5];
var list = new List<int> { 1, 2, 3 };
list.Add(4);
list.Remove(1);
List<string> names = ["Оля", "Іван"];
Console.WriteLine($"{arr.Length} {list.Count} {names[0]}");`, note: "Масив має фіксовану довжину (`Length`), а `List<T>` росте (`Count`). Запис `[...]` це вираз колекції з C# 12." },
    { t: "Dictionary", code: raw`var ages = new Dictionary<string, int>
{
    ["Оля"] = 16,
    ["Іван"] = 17
};
ages["Оля"]++;
ages.Add("Петро", 18);
if (ages.TryGetValue("Оля", out int age)) Console.WriteLine(age);
Console.WriteLine(ages.ContainsKey("Ганна"));
foreach (var (name, a) in ages) Console.WriteLine($"{name}: {a}");`, note: "`Dictionary` зберігає пари ключ-значення. `TryGetValue` безпечно читає значення, `Add` кидає виняток на повторний ключ." },
    { t: "HashSet, Stack, Queue", code: raw`var set = new HashSet<int> { 1, 2, 2, 3 };
Console.WriteLine(set.Count);
var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
Console.WriteLine(stack.Pop());
var queue = new Queue<string>();
queue.Enqueue("a");
Console.WriteLine(queue.Dequeue());`, note: "`HashSet` не зберігає дублікатів, `Stack` працює за принципом «останній прийшов, перший пішов», а `Queue` за «перший прийшов, перший пішов»." },
    { t: "Індекси й діапазони", code: raw`int[] a = { 1, 2, 3, 4, 5 };
Console.WriteLine(a[^1]);
int[] part = a[1..3];
Console.WriteLine(string.Join(",", part));
string s = "Hello";
Console.WriteLine(s[1..4]);`, note: "`^1` це індекс з кінця, а `a..b` діапазон від `a` до `b` не включно. Працює для масивів і рядків." },
  ] },
  { t: "Класи, записи, перелічення", items: [
    { t: "Клас", code: raw`var p = new Point(3, 4);
Console.WriteLine($"{p} {p.Dist()}");

class Point
{
    public int X, Y;
    public Point(int x, int y) { X = x; Y = y; }
    public double Dist() => Math.Sqrt(X * X + Y * Y);
    public override string ToString() => $"({X}, {Y})";
}`, note: "Клас містить поля, конструктор і методи. `override ToString` задає текстове подання об'єкта. У файлі з інструкціями верхнього рівня клас пишуть після них." },
    { t: "record", code: raw`var u = new User("Олена", 16);
var u2 = u with { Age = 17 };
Console.WriteLine(u);
Console.WriteLine(u == u2);

record User(string Name, int Age);`, note: "`record` це незмінний тип даних із порівнянням за значенням. Вираз `with` робить копію зі зміненою властивістю." },
    { t: "enum і struct", code: raw`Color c = Color.Green;
Console.WriteLine($"{c} {(int)c}");
var pt = new Pair(1, 2);
Console.WriteLine(pt.A + pt.B);

enum Color { Red, Green, Blue }
struct Pair
{
    public int A, B;
    public Pair(int a, int b) { A = a; B = b; }
}`, note: "`enum` це набір іменованих констант, які нумеруються з нуля. `struct` це тип-значення: копіюється при присвоєнні." },
    { t: "Первинний конструктор", code: raw`var d = new Dog("Рекс");
d.Bark();

class Dog(string name)
{
    public void Bark() => Console.WriteLine($"{name}: гав!");
}`, note: "З C# 12 параметри конструктора можна вказати прямо в заголовку класу, а потім використовувати в його методах." },
  ] },
  { t: "Властивості", items: [
    { t: "Автовластивості", code: raw`var acc = new Account { Owner = "Оля" };
acc.Balance = 100;
Console.WriteLine($"{acc.Owner} {acc.Balance} {acc.IsRich}");

class Account
{
    public string Owner { get; init; } = "";
    public decimal Balance { get; set; }
    public bool IsRich => Balance > 50;
}`, note: "Властивість `{ get; set; }` замінює поле з методами доступу. `init` дозволяє задати значення лише при створенні, а `=>` робить обчислювану властивість." },
    { t: "Власний get і set", code: raw`var t = new Temp();
t.Celsius = -300;
Console.WriteLine(t.Celsius);

class Temp
{
    private double _c;
    public double Celsius
    {
        get => _c;
        set => _c = value < -273.15 ? -273.15 : value;
    }
}`, note: "У `set` доступне неявне значення `value`. Так у властивість додають перевірку, а приховане поле зазвичай починають з `_`." },
  ] },
  { t: "Інтерфейси й успадкування", items: [
    { t: "Інтерфейс", code: raw`IShape s = new Circle(2);
Console.WriteLine(s.Area());

interface IShape { double Area(); }
class Circle(double r) : IShape
{
    public double Area() => Math.PI * r * r;
}`, note: "Інтерфейс описує методи, які зобов'язаний реалізувати клас. Змінна типу інтерфейсу може тримати об'єкт будь-якого такого класу." },
    { t: "Успадкування й virtual", code: raw`Animal a = new Cat();
a.Speak();

class Animal
{
    public virtual void Speak() => Console.WriteLine("...");
}
class Cat : Animal
{
    public override void Speak() => Console.WriteLine("Няв");
}`, note: "Клас успадковує інший після `:`. Метод із `virtual` можна перевизначити через `override`, і викличеться версія реального типу." },
  ] },
  { t: "LINQ", items: [
    { t: "Where, Select, ToList", code: raw`using System.Linq;

int[] v = { 1, 2, 3, 4, 5, 6 };
var sq = v.Where(x => x % 2 == 0).Select(x => x * x).ToList();
Console.WriteLine(string.Join(", ", sq));`, note: "LINQ працює з будь-якою колекцією (потрібен `using System.Linq`). `Where` відбирає, `Select` перетворює, `ToList` збирає результат." },
    { t: "Sum, Max, Any", code: raw`int[] v = { 3, 8, 1 };
Console.WriteLine(v.Sum());
Console.WriteLine(v.Max());
Console.WriteLine(v.Average());
Console.WriteLine(v.Any(x => x > 5));
Console.WriteLine(v.First(x => x > 1));
Console.WriteLine(v.Count(x => x < 5));`, note: "Методи `Sum`, `Max`, `Average`, `Count` рахують результат, `Any` і `All` перевіряють умову, `First` бере перший підходящий елемент." },
    { t: "OrderBy і GroupBy", code: raw`string[] words = { "pear", "fig", "apple", "fig" };
var sorted = words.OrderBy(w => w.Length).ThenBy(w => w);
var groups = words.GroupBy(w => w).Select(g => $"{g.Key}:{g.Count()}");
Console.WriteLine(string.Join(" ", sorted));
Console.WriteLine(string.Join(" ", groups));`, note: "`OrderBy` сортує, `ThenBy` додає другий ключ. `GroupBy` групує елементи за ключем, який доступний як `g.Key`." },
    { t: "Запит from ... select", code: raw`var q = from x in new[] { 1, 2, 3, 4 }
        where x > 1
        select x * 10;
Console.WriteLine(string.Join(",", q));`, note: "Це інший запис тих самих операцій, схожий на SQL. Усередині він перетворюється на виклики `Where` і `Select`." },
  ] },
  { t: "Обробка помилок", items: [
    { t: "try, catch, finally", code: raw`try
{
    int n = int.Parse("abc");
}
catch (FormatException e)
{
    Console.WriteLine($"Помилка: {e.Message}");
}
finally
{
    Console.WriteLine("кінець");
}`, note: "Код, що може впасти, пишуть у `try`. `catch` ловить виняток певного типу, а `finally` виконується завжди." },
    { t: "throw", code: raw`static void Check(int age)
{
    if (age < 0) throw new ArgumentException("Некоректний вік");
}
try { Check(-1); }
catch (ArgumentException e)
{
    Console.WriteLine(e.Message);
}`, note: "Виняток створюють і викидають через `throw new ...`. Для помилок у аргументах є `ArgumentException`." },
    { t: "Nullable", code: raw`string? name = null;
Console.WriteLine(name?.Length);
Console.WriteLine(name ?? "немає");
name ??= "Олена";
Console.WriteLine(name.Length);
int? maybe = null;
Console.WriteLine(maybe.HasValue);
Console.WriteLine(maybe.GetValueOrDefault(5));`, note: "`?.` пропускає виклик на `null`, `??` дає запасне значення, `??=` присвоює, якщо там `null`. `int?` це число, яке може бути порожнім." },
    { t: "using і Dispose", code: raw`using System.IO;

using var reader = new StringReader("a\nb");
Console.WriteLine(reader.ReadLine());
using (var w = new StringWriter())
{
    w.Write("x");
    Console.WriteLine(w);
}`, note: "`using` сам викликає `Dispose` і звільняє ресурс (файл, потік) наприкінці блока або області видимості." },
  ] },
  { t: "async і await", items: [
    { t: "async-метод", code: raw`Console.WriteLine(await GetNumberAsync());

static async Task<int> GetNumberAsync()
{
    await Task.Delay(100);
    return 42;
}`, note: "Метод з `async` повертає `Task<T>`. Оператор `await` чекає результат, не блокуючи потік. У `Main` та інструкціях верхнього рівня він теж дозволений." },
    { t: "Task.WhenAll", code: raw`var t1 = Task.Run(() => 1 + 1);
var t2 = Task.Run(() => 2 + 2);
int[] results = await Task.WhenAll(t1, t2);
Console.WriteLine(results[0] + results[1]);`, note: "`Task.Run` запускає роботу у фоні, а `Task.WhenAll` чекає, поки завершаться всі завдання, і повертає масив результатів." },
  ] },
  { t: "Простори імен і пакети", items: [
    { t: "namespace", code: raw`namespace Shop.Models;

public class Product
{
    public string Title { get; set; } = "";
}`, note: "`namespace` групує типи й уникає конфліктів назв. Запис із крапкою з комою діє на весь файл і з'явився в C# 10." },
    { t: "using і псевдоніми", code: raw`using Shop.Models;
using static System.Math;
using Json = System.Text.Json.JsonSerializer;

var p = new Product { Title = "Книга" };
Console.WriteLine(Sqrt(16));`, note: "`using` підключає простір імен, `using static` дозволяє викликати статичні методи без назви класу, а `Json =` створює скорочену назву." },
    { t: "NuGet-пакети", code: raw`dotnet add package Newtonsoft.Json
dotnet add reference ../Lib/Lib.csproj
dotnet restore`, note: "Зовнішні бібліотеки підключають як NuGet-пакети. Команди змінюють `.csproj`, а `restore` завантажує залежності." },
  ] },
];
