import type { RefSection } from "./types.ts";

const raw = String.raw;

export const swift: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`print("Привіт, світе!")`, note: "У файлі `main.swift` код виконується зверху вниз без окремої функції `main`. `print` друкує значення й переходить на новий рядок." },
    { t: "Точка входу @main", code: raw`@main
struct App {
    static func main() {
        print("Hello")
    }
}`, note: "У проєктах із кількома файлами точку входу позначають атрибутом `@main` на типі зі статичним методом `main`." },
    { t: "Збірка й запуск", code: raw`swiftc main.swift -o hello
./hello

swift package init --type executable
swift run`, note: "`swiftc` компілює файл, а `swift package` і `swift run` працюють із проєктами Swift Package Manager. Команди виконують у терміналі." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "let і var", code: raw`let name = "Olena"
var score = 0
score += 10
let age: Int = 16
print(name, score, age)`, note: "`let` це константа, `var` змінна. Тип виводиться сам, а явний тип пишуть після двокрапки." },
    { t: "Базові типи", code: raw`let i: Int = 42
let d: Double = 3.14
let f: Float = 2.5
let b: Bool = true
let c: Character = "a"
let s: String = "text"
let t = (1, "one")
print(t.0, t.1)`, note: "Основні типи: `Int`, `Double`, `Float`, `Bool`, `Character`, `String`. Кортеж `(1, \"one\")` групує кілька значень, до них звертаються за номером." },
    { t: "Перетворення типів", code: raw`let x = 7
let y = Double(x) / 2
let n = Int("12")
let m = Int("abc")
print(y, n ?? 0, m ?? -1)`, note: "Типи не перетворюються неявно: пишіть `Double(x)`. `Int(\"12\")` повертає опціонал, бо рядок може бути не числом." },
  ] },
  { t: "Рядки", items: [
    { t: "Інтерполяція", code: raw`let name = "Swift"
let a = 3
let b = 4
print("Hello, \(name)!")
print("Sum: \(a + b)")`, note: "Вираз у `\\( )` підставляється в рядок. Рядки в Swift це значення: при присвоєнні вони копіюються." },
    { t: "Методи рядків", code: raw`let s = "Hello, World"
print(s.count)
print(s.uppercased())
print(s.lowercased())
print(s.hasPrefix("Hello"))
print(s.contains("o"))
print("a,b,c".split(separator: ","))`, note: "Довжину дає `count`, а не `length`. `hasPrefix` і `hasSuffix` перевіряють початок і кінець, `split` розбиває рядок на частини." },
    { t: "Багаторядкові рядки", code: raw`let text = """
    Line one
    Line two
    """
print(text)`, note: "Потрійні лапки задають текст на кілька рядків. Відступ закриваючих лапок прибирається з усіх рядків." },
  ] },
  { t: "Умови", items: [
    { t: "if і тернарний оператор", code: raw`let age = 16
if age < 12 {
    print("child")
} else if age < 18 {
    print("teen")
} else {
    print("adult")
}
let status = age >= 18 ? "adult" : "minor"`, note: "Дужки навколо умови не потрібні, а фігурні дужки обов'язкові. Умова має бути типу `Bool`, число замість нього не підходить." },
    { t: "switch", code: raw`let day = 6
switch day {
case 1...5:
    print("weekday")
case 6, 7:
    print("weekend")
default:
    print("unknown")
}`, note: "`switch` має покривати всі значення, тому часто потрібен `default`. `break` не потрібен: гілки не «провалюються»." },
    { t: "switch із кортежами", code: raw`let point = (2, 0)
switch point {
case (0, 0):
    print("origin")
case (let x, 0):
    print("on x axis at \(x)")
case (_, let y) where y > 0:
    print("above")
default:
    print("other")
}`, note: "У гілках можна розбирати кортежі, зв'язувати значення через `let` і додавати умову через `where`." },
  ] },
  { t: "Цикли", items: [
    { t: "for-in", code: raw`for i in 1...3 { print(i) }
for i in 0..<3 { print(i) }
for ch in "abc" { print(ch) }
for i in stride(from: 0, to: 10, by: 2) { print(i) }`, note: "`1...3` включає правий кінець, `0..<3` не включає. `stride` задає крок." },
    { t: "enumerated", code: raw`let items = ["a", "b", "c"]
for item in items { print(item) }
for (i, v) in items.enumerated() {
    print(i, v)
}`, note: "`enumerated` дає пари «індекс і елемент». Якщо змінна циклу не потрібна, її замінюють на `_`." },
    { t: "while, repeat, continue", code: raw`var n = 3
while n > 0 {
    print(n)
    n -= 1
}
repeat { n += 1 } while n < 3
for i in 1...10 {
    if i % 2 == 0 { continue }
    if i > 7 { break }
    print(i)
}`, note: "`repeat-while` перевіряє умову після тіла, тож виконається хоча б раз. `break` і `continue` працюють як в інших мовах." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення", code: raw`func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}
func square(_ x: Int) -> Int { x * x }
func hello() { print("hi") }

print(add(2, 3), square(4))`, note: "Результат вказують після `->`. Тіло з одного виразу може обійтися без `return`. `_` дозволяє викликати без імені аргумента." },
    { t: "Мітки аргументів", code: raw`func greet(person name: String, greeting: String = "Hello") -> String {
    "\(greeting), \(name)!"
}

print(greet(person: "Olena"))
print(greet(person: "Olena", greeting: "Hi"))`, note: "Параметр має зовнішню мітку для виклику (`person`) і внутрішнє ім'я (`name`). Типові значення дозволяють пропускати аргументи." },
    { t: "Variadic і inout", code: raw`func sum(_ nums: Int...) -> Int {
    nums.reduce(0, +)
}
func inc(_ x: inout Int) { x += 1 }

var v = 1
inc(&v)
print(sum(1, 2, 3), v)`, note: "`Int...` приймає будь-яку кількість аргументів. `inout` дозволяє змінити передану змінну, а при виклику додають `&`." },
    { t: "Кортеж як результат", code: raw`func minMax(_ a: [Int]) -> (min: Int, max: Int) {
    return (a.min() ?? 0, a.max() ?? 0)
}

let r = minMax([3, 1, 2])
print(r.min, r.max)`, note: "Функція може повернути кілька значень кортежем, а його елементам можна дати імена. `min()` повертає опціонал, бо масив може бути порожнім." },
  ] },
  { t: "Замикання", items: [
    { t: "Замикання й map, filter", code: raw`let double = { (x: Int) -> Int in x * 2 }
print(double(5))

let nums = [1, 2, 3, 4]
print(nums.map { $0 * 2 })
print(nums.filter { $0 % 2 == 0 })
print(nums.reduce(0, +))
print(nums.sorted { $0 > $1 })`, note: "Замикання пишуть у фігурних дужках, параметри можна позначати `$0`, `$1`. `map` перетворює, `filter` відбирає, `reduce` згортає." },
    { t: "Функція як параметр", code: raw`func applyTwice(_ x: Int, _ f: (Int) -> Int) -> Int {
    f(f(x))
}

print(applyTwice(3) { $0 + 1 })
print(applyTwice(3, { $0 * 2 }))`, note: "Тип функції записують як `(Int) -> Int`. Остання функція в списку аргументів може стояти після дужок (trailing closure)." },
  ] },
  { t: "Колекції", items: [
    { t: "Array", code: raw`var arr = [3, 1, 2]
arr.append(4)
arr.remove(at: 0)
print(arr, arr.count)
print(arr.sorted())
print(arr[0])`, note: "Масив змінний, якщо оголошений через `var`. Додавання робить `append`, видалення за індексом робить `remove(at:)`." },
    { t: "Dictionary і Set", code: raw`var ages = ["Olena": 16, "Max": 17]
ages["Anna"] = 15
print(ages["Olena"] ?? 0)
print(ages["Zed"] ?? 0)
for key in ages.keys.sorted() { print(key, ages[key] ?? 0) }

var set: Set = [1, 2, 3]
set.insert(3)
set.insert(4)
print(set.count, set.contains(2))`, note: "Звернення до словника за ключем повертає опціонал. Порядок ключів не гарантований, тому їх сортують. `Set` зберігає унікальні значення." },
    { t: "Корисні методи", code: raw`let nums = [5, 3, 8, 1]
print(nums.max() ?? 0)
print(nums.contains { $0 > 7 })
print(nums.allSatisfy { $0 > 0 })
print(nums.first ?? 0)
print(nums.map { String($0) }.joined(separator: ", "))`, note: "`allSatisfy` перевіряє всі елементи, `contains` шукає підходящий, `joined` склеює рядки. `max()` і `first` повертають опціонали." },
  ] },
  { t: "Структури, класи й enum", items: [
    { t: "struct", code: raw`struct Point {
    var x: Int
    var y: Int
    func sum() -> Int { x + y }
}

var a = Point(x: 1, y: 2)
var b = a
b.x = 10
print(a.x, b.x, a.sum())`, note: "Структура це тип-значення: при присвоєнні вона копіюється. Ініціалізатор за іменами полів створюється автоматично." },
    { t: "class", code: raw`class Person {
    let name: String
    var age: Int
    init(name: String, age: Int) {
        self.name = name
        self.age = age
    }
}

let p = Person(name: "Olena", age: 16)
let q = p
q.age = 17
print(p.age)`, note: "Клас це тип-посилання: `p` і `q` вказують на один об'єкт. Ініціалізатор `init` пишуть вручну, а `self` позначає поточний об'єкт." },
    { t: "enum з даними", code: raw`enum Shape {
    case circle(radius: Double)
    case rect(w: Double, h: Double)
}

let s = Shape.rect(w: 2, h: 3)
switch s {
case .circle(let r): print(r)
case .rect(let w, let h): print(w * h)
}`, note: "Варіанти `enum` можуть нести дані. У `switch` їх розбирають через `let`, а компілятор перевіряє, що всі варіанти враховані." },
  ] },
  { t: "Протоколи й розширення", items: [
    { t: "Протокол", code: raw`protocol Animal {
    var name: String { get }
    func sound() -> String
}

struct Dog: Animal {
    let name = "Rex"
    func sound() -> String { "Woof" }
}

let a: any Animal = Dog()
print(a.name, a.sound())`, note: "Протокол описує вимоги до типу. Структури, класи й enum його реалізують, а `any Animal` це значення будь-якого такого типу." },
    { t: "extension", code: raw`extension Int {
    var isEven: Bool { self % 2 == 0 }
}

extension String {
    func shout() -> String { uppercased() + "!" }
}

print(4.isEven, "hi".shout())`, note: "`extension` додає методи й обчислювані властивості до наявного типу, зокрема стандартного, без успадкування." },
  ] },
  { t: "Опціонали", items: [
    { t: "Optional і ??", code: raw`var name: String? = nil
print(name ?? "unknown")
name = "Swift"
print(name?.count ?? 0)
if let n = name {
    print(n)
}`, note: "Тип із `?` може містити `nil`. `??` дає значення за замовчуванням, `?.` безпечно звертається до члена, `if let` розгортає значення." },
    { t: "guard let", code: raw`func show(_ age: Int?) {
    guard let age = age else {
        print("no age")
        return
    }
    print(age)
}

show(nil)
show(16)`, note: "`guard` виходить із функції, якщо умова хибна. Розгорнуте значення залишається доступним далі, тож код без зайвої вкладеності." },
    { t: "Примусове розгортання", code: raw`let text: String? = "abc"
print(text!.count)
print(text?.uppercased() ?? "")`, note: "Знак `!` примусово розгортає опціонал, а для `nil` програма аварійно завершиться. Надійніше використовувати `if let`, `guard` або `??`." },
  ] },
  { t: "Помилки", items: [
    { t: "throws і throw", code: raw`enum AgeError: Error {
    case negative
    case tooBig(Int)
}

func check(_ age: Int) throws -> Int {
    if age < 0 { throw AgeError.negative }
    if age > 150 { throw AgeError.tooBig(age) }
    return age
}`, note: "Помилки це значення типів, що відповідають протоколу `Error`, зазвичай `enum`. Функцію, яка їх кидає, позначають `throws`." },
    { t: "do, try, catch", code: raw`enum E: Error { case bad }
func f(_ x: Int) throws -> Int {
    if x < 0 { throw E.bad }
    return x
}

do {
    print(try f(-1))
} catch E.bad {
    print("bad value")
} catch {
    print("other: \(error)")
}`, note: "Виклик функції з `throws` позначають `try` усередині `do`. Блоки `catch` обробляють різні помилки, а змінна `error` доступна неявно." },
    { t: "try? і defer", code: raw`enum E: Error { case bad }
func f(_ x: Int) throws -> Int {
    if x < 0 { throw E.bad }
    return x
}

let v = try? f(-1)
print(v ?? 0)

func work() {
    defer { print("cleanup") }
    print("work")
}
work()`, note: "`try?` перетворює помилку на `nil`. Блок `defer` виконується при виході з області видимості, навіть після `return`." },
  ] },
];
