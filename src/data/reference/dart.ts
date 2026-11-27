import type { RefSection } from "./types.ts";

const raw = String.raw;
const DS = "${";

export const dart: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`void main() {
  print('Привіт, світе!');
}`, note: "Виконання починається з функції `main`. `print` друкує рядок і переходить на новий. Кожну інструкцію завершує крапка з комою." },
    { t: "Збірка й запуск", code: raw`dart create my_app
cd my_app
dart run

dart run hello.dart
dart compile exe bin/my_app.dart`, note: "`dart create` створює проєкт, `dart run` запускає його або окремий файл, а `dart compile exe` збирає самостійний виконуваний файл." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "var, final і const", code: raw`void main() {
  var name = 'Olena';
  int score = 0;
  score += 10;
  final age = 16;
  const pi = 3.14;
  print('$name $score $age $pi');
}`, note: "`var` виводить тип сам, але потім його не можна змінити. `final` задається один раз під час роботи, а `const` це константа часу компіляції." },
    { t: "Базові типи", code: raw`void main() {
  int i = 42;
  double d = 3.14;
  String s = 'text';
  bool ok = true;
  num n = 5;
  n = 2.5;
  print('${DS}i.runtimeType} ${DS}d.runtimeType} $n $ok $s');
}`, note: "Основні типи: `int`, `double`, `String`, `bool`. Тип `num` об'єднує `int` та `double`. Значення `runtimeType` показує тип під час виконання." },
    { t: "Перетворення типів", code: raw`void main() {
  int a = int.parse('12');
  int? b = int.tryParse('abc');
  double d = 7 / 2;
  int q = 7 ~/ 2;
  String s = 42.toString();
  double e = 3.toDouble();
  print('$a $b $d $q $s $e');
}`, note: "Оператор `/` завжди дає `double`, а `~/` це цілочисельне ділення. `int.tryParse` повертає `null` замість помилки, а `int.parse` викликає виняток." },
    { t: "Записи", code: raw`void main() {
  var (x, y) = (3, 4);
  print(x + y);
  var user = (name: 'Olena', age: 16);
  print(user.name);
  var pair = (1, 'one');
  print(pair.$1);
}`, note: "Запис (record) це легка група значень у дужках. До іменованих полів звертаються через крапку, до позиційних через `$1`, `$2`. Запис можна розкласти на змінні." },
  ] },
  { t: "Рядки", items: [
    { t: "Інтерполяція", code: raw`void main() {
  var name = 'Dart';
  var a = 3;
  var b = 4;
  print('Hello, $name!');
  print('Sum: ${DS}a + b}');
  print('Length: ${DS}name.length}');
}`, note: "`$name` підставляє змінну в рядок, а `${вираз}` обчислює довільний вираз. Лапки можна брати як одинарні, так і подвійні." },
    { t: "Методи рядків", code: raw`void main() {
  var s = 'Hello, World';
  print(s.length);
  print(s.toUpperCase());
  print(s.substring(0, 5));
  print(s.replaceAll('World', 'Dart'));
  print(s.contains('World'));
  print(s.split(', '));
}`, note: "Рядки незмінні: методи повертають новий рядок. `length` це властивість, тому дужок після неї немає. Метод `split` повертає список." },
    { t: "Багаторядкові й сирі рядки", code: raw`void main() {
  var text = '''Line one
Line two''';
  print(text);
  var path = r'C:\new\dir';
  print(path);
  print('ab' * 3);
}`, note: "Потрійні лапки дозволяють писати рядок на кілька рядків. Префікс `r` робить рядок сирим: зворотні скісні риски не екрануються. Оператор `*` повторює рядок." },
  ] },
  { t: "Умови", items: [
    { t: "if і тернарний оператор", code: raw`void main() {
  var age = 16;
  if (age < 12) {
    print('child');
  } else if (age < 18) {
    print('teen');
  } else {
    print('adult');
  }
  var status = age >= 18 ? 'adult' : 'minor';
  print(status);
}`, note: "Умова береться в круглі дужки й має бути типу `bool`: `0` чи порожній рядок хибними не вважаються. Скорочений варіант це `умова ? a : b`." },
    { t: "switch як вираз", code: raw`void main() {
  var day = 6;
  var kind = switch (day) {
    1 || 2 || 3 || 4 || 5 => 'weekday',
    6 || 7 => 'weekend',
    _ => 'unknown',
  };
  print(kind);
}`, note: "У Dart 3 `switch` може повертати значення. Гілки записують через `=>`, кілька значень поєднують `||`, а `_` це гілка за замовчуванням." },
    { t: "Патерни й умови в switch", code: raw`String grade(int n) => switch (n) {
  >= 90 => 'A',
  >= 50 => 'B',
  _ => 'F',
};

void main() {
  print(grade(95));
  Object x = 5;
  if (x case int n when n > 3) print('big $n');
}`, note: "Патерни порівнюють значення з умовою: `>= 90` перевіряє діапазон. Конструкція `case int n when ...` перевіряє тип, зберігає значення в `n` та додає умову." },
  ] },
  { t: "Цикли", items: [
    { t: "for і for-in", code: raw`void main() {
  for (var i = 0; i < 3; i++) {
    print(i);
  }
  for (var f in ['apple', 'pear']) {
    print(f);
  }
  [1, 2].forEach((n) => print(n * 10));
}`, note: "Класичний `for` має ініціалізацію, умову й крок. Цикл `for-in` обходить елементи колекції, а `forEach` приймає функцію для кожного елемента." },
    { t: "while і do-while", code: raw`void main() {
  var n = 3;
  while (n > 0) {
    print(n);
    n--;
  }
  do {
    n++;
  } while (n < 3);
  print(n);
}`, note: "`while` перевіряє умову перед кожним проходом, а `do-while` після, тому його тіло виконається хоча б один раз." },
    { t: "break і continue", code: raw`void main() {
  for (var i = 0; i < 10; i++) {
    if (i.isOdd) continue;
    if (i > 6) break;
    print(i);
  }
}`, note: "`break` негайно виходить із циклу, а `continue` пропускає решту поточної ітерації. Властивість `isOdd` перевіряє непарність числа." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення й стрілка", code: raw`int add(int a, int b) {
  return a + b;
}

int square(int x) => x * x;

void main() {
  print(add(2, 3));
  print(square(4));
}`, note: "Тип результату пишуть перед іменем, а `void` означає, що значення немає. Запис `=> вираз` це скорочення для функції з одним `return`." },
    { t: "Необов'язкові й іменовані параметри", code: raw`String greet(String name, [String hi = 'Hello']) => '$hi, $name!';

String connect({required String host, int port = 80}) => '$host:$port';

void main() {
  print(greet('Ann'));
  print(greet('Ann', 'Hi'));
  print(connect(host: 'localhost', port: 8080));
}`, note: "Позиційні параметри в `[ ]` можна пропускати. Параметри у `{ }` передають за іменем, а `required` робить такий параметр обов'язковим." },
    { t: "Функції як значення", code: raw`void apply(int x, int Function(int) f) => print(f(x));

void main() {
  var nums = [1, 2, 3, 4];
  print(nums.map((n) => n * n).toList());
  print(nums.where((n) => n.isEven).toList());
  print(nums.fold(0, (a, b) => a + b));
  apply(3, (v) => v + 1);
}`, note: "Функцію можна передати як аргумент. Методи `map`, `where` і `fold` приймають лямбду. Тип параметра-функції записують як `int Function(int)`." },
  ] },
  { t: "Колекції-літерали", items: [
    { t: "List", code: raw`void main() {
  var a = [3, 1, 2];
  a.add(4);
  a.addAll([5, 6]);
  a.sort();
  print(a);
  print(a.length);
  print('${DS}a.first} ${DS}a.last} ${DS}a[1]}');
  print(a.contains(2));
}`, note: "Список створюється літералом `[ ]`. Метод `add` додає елемент, `sort` сортує на місці, а `first` та `last` дають крайні елементи." },
    { t: "Map", code: raw`void main() {
  Map<String, int> prices = {'apple': 3, 'pear': 5};
  prices['plum'] = 7;
  print(prices['apple']);
  print(prices['none']);
  print(prices.containsKey('pear'));
  prices.forEach((k, v) => print('$k = $v'));
  for (var e in prices.entries) {
    print(e.key);
  }
}`, note: "Map зберігає пари ключ і значення. Відсутній ключ дає `null`. Пари обходять через `forEach` або через `entries`, де є `key` та `value`." },
    { t: "Set і spread", code: raw`void main() {
  var s = {1, 2, 3};
  s.add(2);
  print(s.length);
  var base = [1, 2];
  var more = [...base, 3, 4];
  var admin = true;
  var menu = ['home', if (admin) 'admin', for (var i in base) 'item$i'];
  print(more);
  print(menu);
}`, note: "Множина `{ }` не має дублікатів. Оператор `...` розгортає колекцію в іншу, а `if` і `for` всередині літерала додають елементи за умовою." },
  ] },
  { t: "Класи й enum", items: [
    { t: "Клас і конструктор", code: raw`class Person {
  final String name;
  int age;
  Person(this.name, this.age);
  Person.baby(this.name) : age = 0;

  String get info => '$name ($age)';
  void birthday() => age++;
}

void main() {
  var p = Person('Olena', 16);
  p.birthday();
  print(p.info);
  print(Person.baby('Ann').age);
}`, note: "Запис `Person(this.name, this.age)` присвоює поля прямо з параметрів. Іменований конструктор `Person.baby` дає інший спосіб створення, а `get` оголошує обчислювану властивість." },
    { t: "Успадкування й abstract", code: raw`abstract class Animal {
  String speak();
}

class Dog extends Animal {
  @override
  String speak() => 'Woof!';
}

void main() {
  Animal a = Dog();
  print(a.speak());
}`, note: "`extends` задає батьківський клас, а `@override` позначає перевизначений метод. Абстрактний клас не можна створити напряму, він лише задає контракт." },
    { t: "enum", code: raw`enum Color { red, green, blue }

enum Planet {
  earth(1.0),
  mars(0.38);

  final double gravity;
  const Planet(this.gravity);
}

void main() {
  print(Color.red.name);
  print(Color.values.length);
  print(Planet.mars.gravity);
}`, note: "`enum` описує фіксований набір значень, `values` повертає їх список, а `name` дає ім'я. Перелік може мати поля та конструктор." },
  ] },
  { t: "Null-безпека", items: [
    { t: "Типи з ? та оператори", code: raw`String? find(bool ok) => ok ? 'Olena' : null;

void main() {
  String? a = find(false);
  String? b = find(true);
  print(a);
  print(a?.length);
  print(a ?? 'unknown');
  print(b!.length);
}`, note: "Тип із `?`, наприклад `String?`, може бути `null`. Оператор `?.` безпечно викликає метод, `??` задає запасне значення, а `!` стверджує, що значення не `null`." },
    { t: "Перевірка на null і late", code: raw`late String config;

void show(String? s) {
  if (s == null) {
    print('empty');
    return;
  }
  print(s.length);
}

void main() {
  show(null);
  show('abc');
  config = 'ready';
  print(config);
}`, note: "Після перевірки `s == null` компілятор знає, що `s` не `null`, і дозволяє `s.length`. Ключове слово `late` відкладає ініціалізацію до першого використання." },
  ] },
  { t: "async/await і Future", items: [
    { t: "Future, async і await", code: raw`Future<String> fetchName() async {
  await Future.delayed(Duration(milliseconds: 100));
  return 'Olena';
}

Future<void> main() async {
  print('start');
  var name = await fetchName();
  print(name);
}`, note: "`Future` це значення, яке з'явиться пізніше. Функція з `async` повертає `Future`, а `await` чекає на результат і не блокує решту програми." },
    { t: "Future.wait і помилки", code: raw`Future<int> parse(String s) async => int.parse(s);

Future<void> main() async {
  var all = await Future.wait([parse('1'), parse('2')]);
  print(all);
  try {
    print(await parse('abc'));
  } catch (e) {
    print('error: $e');
  }
}`, note: "`Future.wait` чекає на всі операції й повертає список результатів. Помилку майбутнього значення можна перехопити звичайним `try/catch` навколо `await`." },
    { t: "Stream", code: raw`Stream<int> count(int n) async* {
  for (var i = 1; i <= n; i++) {
    yield i;
  }
}

Future<void> main() async {
  await for (var v in count(3)) {
    print(v);
  }
}`, note: "`Stream` видає послідовність значень з часом. Генератор `async*` віддає їх через `yield`, а цикл `await for` отримує значення по одному." },
  ] },
  { t: "Помилки", items: [
    { t: "try, on, catch, finally", code: raw`void main() {
  try {
    print(int.parse('abc'));
  } on FormatException {
    print('Помилка формату');
  } catch (e) {
    print('other: $e');
  } finally {
    print('done');
  }
}`, note: "`on Тип` перехоплює помилку певного класу, `catch (e)` будь-яку іншу. Блок `finally` виконується завжди, незалежно від того, була помилка чи ні." },
    { t: "throw і власні винятки", code: raw`class NegativeException implements Exception {
  final String message;
  NegativeException(this.message);
}

void check(int x) {
  if (x < 0) throw NegativeException('negative: $x');
}

void main() {
  try {
    check(-1);
  } on NegativeException catch (e) {
    print(e.message);
  }
}`, note: "`throw` викликає виняток. Власний клас винятку оформлюють через `implements Exception`, а `on ... catch (e)` дає доступ до об'єкта помилки." },
  ] },
];
