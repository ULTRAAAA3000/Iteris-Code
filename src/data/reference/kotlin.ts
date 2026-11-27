import type { RefSection } from "./types.ts";

const raw = String.raw;
const DS = "${";

export const kotlin: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`fun main() {
    println("Привіт, світе!")
}`, note: "Виконання починається з функції `main`. `println` друкує рядок і переходить на новий. Крапка з комою в кінці рядка не потрібна." },
    { t: "Збірка й запуск", code: raw`kotlinc hello.kt -include-runtime -d hello.jar
java -jar hello.jar

./gradlew run        # якщо проєкт на Gradle`, note: "Команди виконуються в терміналі. `kotlinc` це компілятор, а `java -jar` запускає зібраний файл. Для великих проєктів зручніший Gradle." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "val і var", code: raw`val name = "Olena"
var score = 0
score += 10
val age: Int = 16
println("$name $score $age")`, note: "`val` це незмінне значення, `var` змінна. Тип зазвичай виводиться сам, але його можна вказати після двокрапки." },
    { t: "Базові типи", code: raw`val i: Int = 42
val big: Long = 10_000_000_000L
val d: Double = 3.14
val f: Float = 2.5f
val b: Boolean = true
val c: Char = 'a'`, note: "Основні типи: `Int`, `Long`, `Double`, `Float`, `Boolean`, `Char`. Для `Long` додають `L`, для `Float` додають `f`, підкреслення розділяють розряди." },
    { t: "Перетворення типів", code: raw`val x = 7
val y = x.toDouble() / 2
val n = "12".toInt()
val m = "abc".toIntOrNull()
println("$y $n $m")`, note: "Неявних перетворень між числами немає: використовуйте `toDouble`, `toInt` тощо. `toIntOrNull` повертає `null` замість помилки." },
  ] },
  { t: "Рядки", items: [
    { t: "Шаблони рядків", code: raw`val name = "Kotlin"
val a = 3
val b = 4
println("Hello, $name!")
println("Sum: ${DS}a + b}")`, note: "`$name` підставляє змінну в рядок, а `${вираз}` обчислює довільний вираз усередині рядка." },
    { t: "Методи рядків", code: raw`val s = "Hello, World"
println(s.length)
println(s.uppercase())
println(s.substring(0, 5))
println(s.replace("World", "Kotlin"))
println(s.contains("World"))
println(s.split(", "))`, note: "Рядки незмінні: методи повертають новий рядок. `length` це властивість, тому дужок після неї немає." },
    { t: "Багаторядкові рядки", code: raw`val text = """
    Line one
    Line two
""".trimIndent()
println(text)`, note: "Потрійні лапки дозволяють писати текст на кілька рядків без екранування, а `trimIndent` прибирає спільні відступи." },
  ] },
  { t: "Умови", items: [
    { t: "if як вираз", code: raw`val age = 16
if (age < 12) println("child")
else if (age < 18) println("teen")
else println("adult")

val status = if (age >= 18) "adult" else "minor"
println(status)`, note: "У Kotlin `if` повертає значення, тому окремого тернарного оператора немає. Остання гілка має бути `else`, якщо результат зберігають." },
    { t: "when", code: raw`val day = 6
val kind = when (day) {
    1, 2, 3, 4, 5 -> "weekday"
    6, 7 -> "weekend"
    else -> "unknown"
}
println(kind)`, note: "`when` замінює `switch`: гілки не «провалюються», `break` не потрібен, а результат можна присвоїти змінній." },
    { t: "when з діапазонами й типами", code: raw`fun grade(n: Int) = when {
    n >= 90 -> "A"
    n in 50..89 -> "B"
    else -> "F"
}

fun kind(x: Any) = when (x) {
    is Int -> "int"
    is String -> "string"
    else -> "other"
}`, note: "`when` без аргумента перевіряє довільні умови. Гілки з `in` перевіряють діапазон, а з `is` перевіряють тип значення." },
  ] },
  { t: "Цикли", items: [
    { t: "for і діапазони", code: raw`for (i in 1..3) println(i)
for (i in 3 downTo 1) println(i)
for (i in 0 until 10 step 2) println(i)
for (ch in "abc") println(ch)`, note: "`1..3` включає обидва кінці, `until` не включає правий. `downTo` рахує вниз, `step` задає крок." },
    { t: "Індекси й елементи", code: raw`val items = listOf("a", "b", "c")
for (item in items) println(item)
for ((i, v) in items.withIndex()) println("$i: $v")
for (i in items.indices) println(i)`, note: "`withIndex` дає пари «індекс і елемент», а `indices` дає лише діапазон індексів колекції." },
    { t: "while, break і continue", code: raw`var n = 3
while (n > 0) {
    println(n)
    n--
}
for (i in 1..10) {
    if (i % 2 == 0) continue
    if (i > 7) break
    println(i)
}`, note: "`continue` переходить до наступної ітерації, `break` виходить із циклу. Є також `do { } while (умова)`." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення", code: raw`fun add(a: Int, b: Int): Int {
    return a + b
}

fun square(x: Int) = x * x

fun hello() {
    println("hi")
}`, note: "Тип параметрів пишуть після імені. Функцію з одним виразом можна скоротити до `= вираз`, а `Unit` як тип результату можна не вказувати." },
    { t: "Іменовані й типові аргументи", code: raw`fun greet(name: String, greeting: String = "Hello") = "$greeting, $name!"

println(greet("Olena"))
println(greet("Olena", greeting = "Hi"))
println(greet(greeting = "Hey", name = "Max"))`, note: "Параметри можуть мати типові значення, а аргументи можна передавати за іменем у будь-якому порядку." },
    { t: "vararg", code: raw`fun sum(vararg nums: Int): Int = nums.sum()

println(sum(1, 2, 3))
val arr = intArrayOf(4, 5)
println(sum(*arr))`, note: "`vararg` приймає змінну кількість аргументів. Масив передають у такий параметр із оператором `*`." },
  ] },
  { t: "Лямбди", items: [
    { t: "Лямбда й map, filter", code: raw`val double = { x: Int -> x * 2 }
println(double(5))

val nums = listOf(1, 2, 3, 4)
println(nums.map { it * 2 })
println(nums.filter { it % 2 == 0 })
println(nums.fold(0) { acc, x -> acc + x })`, note: "Лямбда записується у фігурних дужках, єдиний параметр називається `it`. `map` перетворює, `filter` відбирає, `fold` згортає." },
    { t: "Функція як параметр", code: raw`fun applyTwice(x: Int, f: (Int) -> Int): Int = f(f(x))

println(applyTwice(3) { it + 1 })
println(applyTwice(3, { it * 2 }))`, note: "Тип функції записують як `(Int) -> Int`. Якщо лямбда остання в списку аргументів, її виносять за дужки." },
  ] },
  { t: "Колекції", items: [
    { t: "Список", code: raw`val list = listOf(3, 1, 2)
println(list[0])
println(list.size)
println(list.sorted())

val mutable = mutableListOf(1, 2)
mutable.add(3)
mutable.removeAt(0)
println(mutable)`, note: "`listOf` створює незмінний список, `mutableListOf` змінний. Доступ до елемента за індексом: `list[0]`." },
    { t: "Map і Set", code: raw`val ages = mapOf("Olena" to 16, "Max" to 17)
println(ages["Olena"])
for ((name, age) in ages) println("$name: $age")

val m = mutableMapOf<String, Int>()
m["a"] = 1
println(m)
println(setOf(1, 2, 2, 3))`, note: "Пару створює `to`. Доступ за відсутнім ключем дає `null`. `Set` зберігає лише унікальні елементи." },
    { t: "Корисні методи", code: raw`val nums = listOf(5, 3, 8, 1)
println(nums.sorted())
println(nums.max())
println(nums.any { it > 7 })
println(nums.all { it > 0 })
println(nums.first())
println(nums.joinToString(", "))`, note: "`any` і `all` перевіряють умову для елементів, `joinToString` склеює елементи в один рядок із роздільником." },
  ] },
  { t: "Класи", items: [
    { t: "Клас", code: raw`class Person(val name: String, var age: Int) {
    fun greet() = "I am $name"
}

val p = Person("Olena", 16)
p.age += 1
println(p.greet())
println(p.age)`, note: "Властивості оголошують прямо в заголовку класу через `val` або `var`. Ключового слова `new` у Kotlin немає." },
    { t: "data class", code: raw`data class Point(val x: Int, val y: Int)

val a = Point(1, 2)
val b = a.copy(y = 5)
println(a)
println(b)
println(a == Point(1, 2))
val (x, y) = a`, note: "`data class` сам створює `toString`, `equals` і `copy`. Об'єкт можна розкласти на частини: `val (x, y) = a`." },
    { t: "Інтерфейс і успадкування", code: raw`interface Animal {
    fun sound(): String
}

open class Base {
    open fun hi() = "base"
}

class Dog : Animal, Base() {
    override fun sound() = "Woof"
    override fun hi() = "dog"
}`, note: "Класи за замовчуванням закриті: щоб успадкувати, потрібен `open`. Перевизначення позначають `override`." },
    { t: "enum і object", code: raw`enum class Color { RED, GREEN, BLUE }

object Config {
    const val VERSION = 1
}

println(Color.GREEN)
println(Color.entries.size)
println(Config.VERSION)`, note: "`enum class` задає набір констант, `entries` повертає їх список. `object` це клас з єдиним екземпляром (одинак)." },
  ] },
  { t: "Null-безпека", items: [
    { t: "Типи з null", code: raw`var name: String? = null
println(name?.length)
println(name ?: "unknown")
name = "Kotlin"
println(name?.length)`, note: "Тип із `?` може бути `null`. `?.` безпечно викликає метод, а `?:` (оператор Елвіса) дає значення за замовчуванням." },
    { t: "let і !!", code: raw`val text: String? = "abc"
text?.let { println(it.uppercase()) }
if (text != null) println(text.length)

val n: Int? = "12".toIntOrNull()
println(n!! + 1)`, note: "`?.let { }` виконує блок, лише якщо значення не `null`. Після перевірки `!= null` тип стає звичайним. `!!` кидає помилку для `null`." },
  ] },
  { t: "Помилки", items: [
    { t: "try, catch, finally", code: raw`try {
    val n = "abc".toInt()
    println(n)
} catch (e: NumberFormatException) {
    println("not a number")
} finally {
    println("done")
}`, note: "Блок `finally` виконується завжди. Винятки в Kotlin не треба оголошувати в підписі функції, перевірюваних винятків немає." },
    { t: "throw і require", code: raw`class MyError(message: String) : Exception(message)

fun checkAge(age: Int) {
    require(age >= 0) { "age < 0" }
    if (age > 150) throw MyError("too big")
    println(age)
}`, note: "`throw` кидає виняток, `require` перевіряє аргумент і кидає `IllegalArgumentException`. Власні винятки успадковують `Exception`." },
    { t: "try як вираз", code: raw`val n = try {
    "12".toInt()
} catch (e: NumberFormatException) {
    0
}
println(n)

val m = runCatching { "x".toInt() }.getOrDefault(-1)
println(m)`, note: "`try` повертає значення останнього виразу блоку. `runCatching` обгортає помилку в результат, а `getOrDefault` дає запасне значення." },
  ] },
  { t: "Розширення й scope-функції", items: [
    { t: "Функції розширення", code: raw`fun String.shout() = this.uppercase() + "!"

val Int.isEven: Boolean
    get() = this % 2 == 0

println("hi".shout())
println(4.isEven)`, note: "Функція розширення додає метод до наявного типу без успадкування. Усередині `this` це об'єкт, до якого її викликають." },
    { t: "let і apply", code: raw`val len = "hello".let { it.length }
println(len)

val sb = StringBuilder().apply {
    append("a")
    append("b")
}
println(sb)`, note: "`let` передає об'єкт як `it` і повертає результат лямбди. `apply` налаштовує об'єкт через `this` і повертає сам об'єкт." },
  ] },
  { t: "Корутини", items: [
    { t: "runBlocking і launch", code: raw`import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        delay(100)
        println("world")
    }
    println("Hello")
}`, note: "Потрібна бібліотека `kotlinx-coroutines-core`. `launch` запускає корутину, а `delay` призупиняє її, не блокуючи потік." },
    { t: "suspend і async", code: raw`import kotlinx.coroutines.*

suspend fun slow(x: Int): Int {
    delay(100)
    return x * 2
}

fun main() = runBlocking {
    val a = async { slow(1) }
    val b = async { slow(2) }
    println(a.await() + b.await())
}`, note: "`suspend`-функцію можна викликати лише з корутини. `async` запускає завдання паралельно, а `await` чекає на результат." },
  ] },
];
