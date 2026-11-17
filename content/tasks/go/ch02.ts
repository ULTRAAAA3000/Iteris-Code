// Практичні завдання глави «Основи мови» (уроки 5–18). Запускаються на сервері, результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "go-variables-zero", lesson: "go/5", xp: 15,
    title: "Змінні, нулі й затінення",
    context: "Затінена змінна (особливо err) і забуті нульові значення — найчастіші дрібні баги на код-рев'ю. Корисно навчитися бачити їх одразу.",
    brief: [
      "Поміняйте <code>a</code> і <code>b</code> місцями <b>однією інструкцією</b> перед першим виводом: має надрукуватися <code>8 3</code>.",
      "У блоку <code>if</code> замість зміни зовнішньої змінної <code>level</code> створюється нова (затінення). Виправте так, щоб після блоку надрукувалося <code>зовні: 5</code>.",
    ],
    starter: raw`package main

import "fmt"

func main() {
	a, b := 3, 8
	// TODO: поміняйте a і b місцями однією інструкцією
	fmt.Println(a, b)

	var count int
	var label string
	var ready bool
	fmt.Printf("%d %q %t\n", count, label, ready)

	level := 1
	if a > b {
		level := 5
		fmt.Println("усередині:", level)
	}
	fmt.Println("зовні:", level)
}
`,
    checks: [
      { on: "stdout", name: "Після обміну виводиться «8 3»", has: "8 3", hint: "Множинне присвоєння: a, b = b, a" },
      { on: "stdout", name: "Нульові значення: 0 \"\" false", has: "0 \"\" false" },
      { on: "stdout", name: "Зовнішня змінна змінилася: «зовні: 5»", has: "зовні: 5", hint: "Усередині if пишіть level = 5, а не level := 5" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "8 3\n0 \"\" false\nусередині: 5\nзовні: 5" },
      { on: "source", name: "Обмін однією інструкцією", matches: "a,\\s*b\\s*=\\s*b,\\s*a" },
    ],
  },
  {
    ...base, id: "go-numeric-types", lesson: "go/6", xp: 25,
    title: "Відсотки, переповнення й порівняння дробів",
    context: "Лічильники, що «обертаються», відсотки, що завжди нуль, і порівняння дробових сум на рівність — три джерела тихих помилок у звітах і біллінгу.",
    brief: [
      "Виправте <code>percent</code>: <code>percent(3, 4)</code> має дати <code>75</code>. Зараз ділення цілочисельне, тож виходить 0.",
      "Допишіть <code>wrap</code>: додайте <code>add</code> до <code>x</code> у типі <code>uint8</code> (<code>wrap(250, 10)</code> дає <code>4</code>, бо число обертається по колу).",
      "Зробіть <code>equal</code> стійкою до похибки: <code>0.1 + 0.2</code> і <code>0.3</code> мають вважатися рівними (використайте <code>math.Abs</code> і допуск <code>1e-9</code>).",
    ],
    starter: raw`package main

import (
	"fmt"
	"math"
)

func percent(done, total int) float64 {
	return float64(done / total * 100)
}

func wrap(x uint8, add int) uint8 {
	// TODO: додайте add до x у типі uint8
	return 0
}

func equal(x, y float64) bool {
	// TODO: порівняйте з допуском 1e-9
	return x == y
}

func main() {
	fmt.Println(percent(3, 4))
	fmt.Println(wrap(250, 10))
	a, b := 0.1, 0.2
	fmt.Println(equal(a+b, 0.3))
	_ = math.Abs
}
`,
    checks: [
      { on: "stdout", name: "75 відсотків", has: "75", hint: "Перетворіть done і total на float64 до ділення" },
      { on: "stdout", name: "uint8: 250 + 10 = 4", has: "\n4\n", hint: "x + uint8(add)" },
      { on: "stdout", name: "0.1 + 0.2 дорівнює 0.3 з допуском", has: "true" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "75\n4\ntrue" },
      { on: "source", name: "Допуск через math.Abs", matches: "math\\.Abs\\(" },
    ],
  },
  {
    ...base, id: "go-const-iota", lesson: "go/7", xp: 20,
    title: "Рівні логування й розміри на iota",
    context: "Рівні логування, коди станів і розміри файлів майже завжди описують константами з iota, а не купою окремих чисел.",
    brief: [
      "Оголосіть <code>Debug</code>, <code>Info</code>, <code>Warn</code>, <code>Error</code> через <code>iota</code> так, щоб вони дорівнювали <code>1 2 3 4</code> (нуль має лишатися «не задано»).",
      "Оголосіть <code>KB</code>, <code>MB</code>, <code>GB</code> одним блоком як ступені 1024, використавши <code>1 &lt;&lt; (10 * iota)</code> і пропущений нуль.",
    ],
    starter: raw`package main

import "fmt"

const (
	Debug = 0
	Info  = 0
	Warn  = 0
	Error = 0
)

const (
	KB = 1
	MB = 1
	GB = 1
)

func main() {
	fmt.Println(Debug, Info, Warn, Error)
	fmt.Println(KB, MB, GB)
	fmt.Println(GB / MB)
}
`,
    checks: [
      { on: "stdout", name: "Рівні: 1 2 3 4", has: "1 2 3 4", hint: "Debug = iota + 1, далі просто імена" },
      { on: "stdout", name: "Розміри: 1024 1048576 1073741824", has: "1024 1048576 1073741824" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "1 2 3 4\n1024 1048576 1073741824\n1024" },
      { on: "source", name: "Використано iota", matches: "\\biota\\b" },
      { on: "source", name: "Ступені 1024 через зсув", matches: "<<\\s*\\(\\s*10\\s*\\*\\s*iota\\s*\\)" },
    ],
  },
  {
    ...base, id: "go-strings-runes", lesson: "go/8", xp: 25,
    title: "Байти проти символів",
    context: "Кирилиця й емодзі в реальних даних ламають код, який рахує довжину за байтами. Розрізняти байти й руни потрібно в кожній валідації тексту.",
    brief: [
      "Допишіть <code>lens(s)</code>: вона повертає кількість байтів і кількість символів. Для <code>Дніпро</code> це <code>12</code> і <code>6</code>.",
      "Допишіть <code>countRune(s, target)</code>, що рахує, скільки разів руна зустрічається в рядку (обходьте рядок через <code>range</code>), і <code>firstRune(s)</code>, що повертає першу руну.",
    ],
    starter: raw`package main

import (
	"fmt"
	"unicode/utf8"
)

func lens(s string) (int, int) {
	// TODO: байти й символи
	_ = utf8.RuneCountInString
	return 0, 0
}

func countRune(s string, target rune) int {
	// TODO: пройдіть рядок через range
	return 0
}

func firstRune(s string) rune {
	// TODO: поверніть першу руну (не перший байт)
	return 0
}

func main() {
	b, r := lens("Дніпро")
	fmt.Println("байтів:", b, "символів:", r)
	fmt.Println("літер о:", countRune("Дніпро — місто", 'о'))
	fmt.Println("перша:", string(firstRune("Дніпро")))
}
`,
    checks: [
      { on: "stdout", name: "12 байтів і 6 символів", has: "байтів: 12 символів: 6", hint: "len(s) і utf8.RuneCountInString(s)" },
      { on: "stdout", name: "Літера «о» зустрічається двічі", has: "літер о: 2" },
      { on: "stdout", name: "Перша руна — «Д»", has: "перша: Д", hint: "for _, r := range s { return r }" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "байтів: 12 символів: 6\nлітер о: 2\nперша: Д" },
      { on: "source", name: "Рядок обходиться через range", matches: "range\\s+s\\b" },
    ],
  },
  {
    ...base, id: "go-order-total", lesson: "go/9", xp: 20,
    title: "Сума замовлення: рядки, числа й типи",
    context: "Ціна й кількість майже завжди приходять текстом (форма, CSV, запит), а рахувати треба числами різних типів. Go не змішує їх мовчки, а вимагає явного перетворення.",
    brief: [
      "Заготовка не компілюється: <code>price</code> має тип <code>float64</code>, <code>qty</code> — <code>int</code>. Прочитайте помилку в терміналі й виправте її явним перетворенням типу.",
      "Виведіть <code>Разом: 599.97</code> (два знаки після коми), наступним рядком типи змінних через <code>%T</code> (<code>float64 int</code>); третім рядком уже наявний вивід помилки розбору.",
    ],
    starter: raw`package main

import (
	"fmt"
	"strconv"
)

func main() {
	price, _ := strconv.ParseFloat("199.99", 64)
	qty, _ := strconv.Atoi("3")
	fmt.Printf("Разом: %.2f\n", price*qty)
	// TODO: наступним рядком виведіть типи price і qty через %T

	_, err := strconv.Atoi("3x")
	fmt.Println("помилка:", err)
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 599.97»", has: "Разом: 599.97" },
      { on: "stdout", name: "Типи: float64 int", has: "float64 int" },
      { on: "stdout", name: "Помилка розбору «3x»", has: "помилка: strconv.Atoi: parsing \"3x\": invalid syntax" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 599.97\nfloat64 int\nпомилка: strconv.Atoi: parsing \"3x\": invalid syntax" },
      { on: "source", name: "Є явне перетворення float64(…)", matches: "float64\\(\\s*qty\\s*\\)", hint: "Помножте price на float64(qty)" },
    ],
  },
  {
    ...base, id: "go-fmt-receipt", lesson: "go/10", xp: 25,
    title: "Рядок чека з вирівнюванням",
    context: "Звіти, чеки й таблиці в консолі мають рівні колонки. Ширина й точність у fmt роблять це одним форматним рядком, без ручного додавання пробілів.",
    brief: [
      "Допишіть <code>row(name string, qty int, price float64) string</code> через <code>fmt.Sprintf</code>: назва вирівняна ліворуч у 8 позиціях, потім <code>|</code>, кількість у 3 позиціях праворуч, <code>|</code>, ціна у 8 позиціях з двома знаками після коми.",
      "Приклад: <code>Хліб    |  2|   25.50</code>. Останнім рядком у <code>main</code> виведіть через <code>fmt.Fprintf(os.Stdout, …)</code> число 255 так: <code>255 = ff = 11111111</code> (десяткове, шістнадцяткове, двійкове).",
    ],
    starter: raw`package main

import (
	"fmt"
	"os"
)

func row(name string, qty int, price float64) string {
	// TODO: Sprintf із шириною: ім'я ліворуч (8), кількість праворуч (3), ціна (8, два знаки)
	return ""
}

func main() {
	fmt.Println(row("Хліб", 2, 25.5))
	fmt.Println(row("Молоко", 10, 9.9))
	// TODO: Fprintf(os.Stdout, ...): 255 = ff = 11111111
	_ = os.Stdout
}
`,
    checks: [
      { on: "stdout", name: "Перший рядок: Хліб    |  2|   25.50", has: "Хліб    |  2|   25.50" },
      { on: "stdout", name: "Другий рядок: Молоко  | 10|    9.90", has: "Молоко  | 10|    9.90" },
      { on: "stdout", name: "Числа в різних системах", has: "255 = ff = 11111111", hint: "%d, %x і %b" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Хліб    |  2|   25.50\nМолоко  | 10|    9.90\n255 = ff = 11111111" },
      { on: "source", name: "Рядок формується через Sprintf", matches: "fmt\\.Sprintf\\(" },
      { on: "source", name: "Вивід через Fprintf до os.Stdout", matches: "fmt\\.Fprintf\\(\\s*os\\.Stdout" },
    ],
  },
  {
    ...base, id: "go-if-category", lesson: "go/11", xp: 20,
    title: "Вікові категорії й розбір віку",
    context: "Перевірки введення, ранній вихід із функції та розбір рядка в короткому <code>if</code> — основа обробки будь-якої форми чи запиту.",
    brief: [
      "Допишіть <code>category(age int) string</code> із раннім виходом через <code>return</code>: менше нуля — <code>помилка</code>, до 12 — <code>дитина</code>, до 18 — <code>підліток</code>, інакше — <code>дорослий</code>.",
      "Допишіть <code>parseAge(s string) string</code>: розберіть рядок у <b>короткому оголошенні в <code>if</code></b>. Якщо розбір вдався — поверніть <code>category(n)</code>, інакше <code>не число</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"strconv"
)

func category(age int) string {
	// TODO: ранні return для кожної категорії
	return ""
}

func parseAge(s string) string {
	// TODO: if n, err := ...; err != nil { ... }
	_, _ = strconv.Atoi(s)
	return ""
}

func main() {
	fmt.Println(category(-1))
	fmt.Println(category(5))
	fmt.Println(category(15))
	fmt.Println(category(40))
	fmt.Println(parseAge("17"))
	fmt.Println(parseAge("abc"))
}
`,
    checks: [
      { on: "stdout", name: "Категорії: помилка, дитина, підліток, дорослий", has: "помилка\nдитина\nпідліток\nдорослий", hint: "Перевіряйте від меншого до більшого: if age < 0 { return … }" },
      { on: "stdout", name: "Рядок «17» дає «підліток»", has: "підліток\nне число", hint: "if n, err := strconv.Atoi(s); err == nil { return category(n) }" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "помилка\nдитина\nпідліток\nдорослий\nпідліток\nне число" },
      { on: "source", name: "Коротке оголошення в if", matches: "if\\s+\\w+,\\s*\\w+\\s*:=" },
    ],
  },
  {
    ...base, id: "go-switch-calendar", lesson: "go/12", xp: 20,
    title: "Дні в місяці та оцінки",
    context: "Таблиці відповідності (код → текст, місяць → кількість днів, бал → оцінка) у Go природно пишуться через <code>switch</code>.",
    brief: [
      "Допишіть <code>daysIn(month int, leap bool) int</code> через <code>switch</code> зі значеннями через кому: 31 день у місяцях 1, 3, 5, 7, 8, 10, 12; 30 — у 4, 6, 9, 11; лютий (2) має 28 або 29 днів залежно від <code>leap</code>; для інших номерів поверніть 0.",
      "Допишіть <code>rating(score int) string</code> через <b>switch без виразу</b>: від 90 — <code>відмінно</code>, від 75 — <code>добре</code>, від 60 — <code>задовільно</code>, інакше <code>незадовільно</code>.",
    ],
    starter: raw`package main

import "fmt"

func daysIn(month int, leap bool) int {
	// TODO: switch month { case 1, 3, ...: }
	return 0
}

func rating(score int) string {
	// TODO: switch без виразу
	return ""
}

func main() {
	fmt.Println(daysIn(1, false), daysIn(4, false), daysIn(2, false), daysIn(2, true), daysIn(13, false))
	fmt.Println(rating(95), rating(80), rating(60), rating(10))
}
`,
    checks: [
      { on: "stdout", name: "Дні: 31 30 28 29 0", has: "31 30 28 29 0", hint: "Лютий: if leap { return 29 }, інакше 28; default → 0" },
      { on: "stdout", name: "Оцінки за балами", has: "відмінно добре задовільно незадовільно", hint: "case score >= 90: … — гілки зверху вниз, від найвищого порогу" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "31 30 28 29 0\nвідмінно добре задовільно незадовільно" },
      { on: "source", name: "Використано switch", matches: "\\bswitch\\b" },
      { on: "source", name: "Кілька значень в одному case", matches: "case\\s+\\d+,\\s*\\d+" },
    ],
  },
  {
    ...base, id: "go-for-forms", lesson: "go/13", xp: 25,
    title: "Три форми циклу for",
    context: "Сума, обчислення «поки не» й повторення N разів — три найчастіші причини писати цикл. У кожного своя форма <code>for</code>.",
    brief: [
      "Допишіть <code>sumTo(n int) int</code> класичним циклом із трьома частинами: сума чисел від 1 до <code>n</code>.",
      "Допишіть <code>steps(n int) int</code> циклом із умовою: скільки кроків потрібно, щоб за правилом «парне діли на 2, непарне множ на 3 і додай 1» дійти до 1. Для 6 це 8 кроків.",
      "Допишіть <code>repeat(s string, k int) string</code>: склейте <code>s</code> рівно <code>k</code> разів через <code>for range</code> за <b>цілим числом</b> (Go 1.22).",
    ],
    starter: raw`package main

import "fmt"

func sumTo(n int) int {
	// TODO: for i := 1; i <= n; i++
	return 0
}

func steps(n int) int {
	// TODO: for n != 1 { ... }
	return 0
}

func repeat(s string, k int) string {
	// TODO: for range k
	return ""
}

func main() {
	fmt.Println(sumTo(100), steps(6), steps(27))
	fmt.Println(repeat("ab", 3))
}
`,
    checks: [
      { on: "stdout", name: "Суми й кроки: 5050 8 111", has: "5050 8 111", hint: "У steps: якщо n%2 == 0 { n /= 2 } інакше { n = 3*n + 1 }, і лічильник кроків" },
      { on: "stdout", name: "Повтор рядка: ababab", has: "ababab", hint: "result += s на кожній ітерації" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "5050 8 111\nababab" },
      { on: "source", name: "Класичний цикл із трьома частинами", matches: "for\\s+\\w+\\s*:=\\s*\\w+;" },
      { on: "source", name: "Цикл за цілим числом: for range", matches: "for\\s+(\\w+\\s*:=\\s*)?range\\s+\\w+" },
    ],
  },
  {
    ...base, id: "go-loop-control", lesson: "go/14", xp: 30,
    title: "Пошук пари й прості числа з мітками",
    context: "Вихід із вкладених циклів і відсів зайвого — щоденні задачі при обробці таблиць, сіток і журналів. Мітки роблять це явним.",
    brief: [
      "Допишіть <code>oddSumUnder(max int) int</code>: додавайте непарні числа 1, 3, 5, … (парні пропускайте через <code>continue</code>), але зупиніться через <code>break</code>, щойно наступна сума перевищила б <code>max</code>. Для 50 результат 49.",
      "Допишіть <code>search(target int) string</code>: у вкладених циклах <code>a</code> від 1 до 9 і <code>b</code> від <code>a</code> до 9 знайдіть першу пару з <code>a*b == target</code>, запишіть її як <code>4x9</code> і вийдіть з обох циклів через <code>break</code> із міткою. Якщо пари немає, поверніть <code>немає</code>.",
      "Допишіть <code>countPrimes(limit int) int</code>: кількість простих чисел менших за <code>limit</code>; для відсіву складених використайте <code>continue</code> із міткою зовнішнього циклу.",
    ],
    starter: raw`package main

import "fmt"

func oddSumUnder(max int) int {
	// TODO: continue для парних, break при перевищенні
	return 0
}

func search(target int) string {
	// TODO: outer: for a ... { for b ... { break outer } }
	return ""
}

func countPrimes(limit int) int {
	// TODO: next: for n ... { for d ... { continue next } }
	return 0
}

func main() {
	fmt.Println(oddSumUnder(50))
	fmt.Println(search(36), search(7), search(100))
	fmt.Println(countPrimes(20))
}
`,
    checks: [
      { on: "stdout", name: "Сума непарних: 49", has: "49\n", hint: "Перед додаванням перевірте sum+i > max, і тоді break" },
      { on: "stdout", name: "Пошук пар: 4x9 1x7 немає", has: "4x9 1x7 немає", hint: "Результат запишіть у змінну й зробіть break outer" },
      { on: "stdout", name: "Простих менше 20: вісім", has: "\n8" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "49\n4x9 1x7 немає\n8" },
      { on: "source", name: "break з міткою", matches: "break\\s+\\w+" },
      { on: "source", name: "continue з міткою", matches: "continue\\s+\\w+" },
    ],
  },
  {
    ...base, id: "go-sum-product", lesson: "go/15", xp: 20,
    title: "Два результати, цикл і передача за значенням",
    context: "Функції в Go часто повертають кілька значень (результат і ознаку, пару чисел), а параметри завжди копіюються. Цей урок про те й про інше.",
    brief: [
      "Допишіть <code>sumAndProduct(a, b int) (int, int)</code>: сума й добуток двох чисел.",
      "Допишіть <code>sumAndProductUpTo(n int) (int, int)</code>: у циклі <code>for</code> порахуйте суму й добуток усіх чисел від 1 до n. Для 5 це 15 і 120.",
      "Допишіть <code>addTen(n int) int</code>: збільште параметр на 10 і поверніть його. Змінна <code>x</code> у <code>main</code> при цьому має лишитися незмінною.",
    ],
    starter: raw`package main

import "fmt"

func sumAndProduct(a, b int) (int, int) {
	// TODO: поверніть суму й добуток
	return 0, 0
}

func sumAndProductUpTo(n int) (int, int) {
	// TODO: цикл for від 1 до n
	return 0, 0
}

func addTen(n int) int {
	// TODO: збільште n на 10 і поверніть
	return 0
}

func main() {
	s, p := sumAndProduct(6, 7)
	fmt.Println("Сума:", s, "Добуток:", p)
	s, p = sumAndProductUpTo(5)
	fmt.Println("До 5:", s, p)
	x := 5
	y := addTen(x)
	fmt.Println("x:", x, "y:", y)
}
`,
    checks: [
      { on: "stdout", name: "Сума й добуток: 13 і 42", has: "Сума: 13 Добуток: 42", hint: "return a + b, a * b" },
      { on: "stdout", name: "Сума й добуток до 5: 15 і 120", has: "До 5: 15 120", hint: "Почніть із sum := 0 і product := 1, на кожній ітерації оновлюйте обидві" },
      { on: "stdout", name: "Параметр не змінює x: x: 5 y: 15", has: "x: 5 y: 15", hint: "Функція змінює свою копію n, а x у main лишається 5" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сума: 13 Добуток: 42\nДо 5: 15 120\nx: 5 y: 15" },
      { on: "source", name: "Використано цикл for", matches: "\\bfor\\b" },
    ],
  },
  {
    ...base, id: "go-variadic-named", lesson: "go/16", xp: 25,
    title: "Мінімум і максимум із variadic та іменованими результатами",
    context: "Функції зі змінною кількістю аргументів і названими результатами пишуть у утилітах і логерах: сигнатура сама пояснює, що повертається.",
    brief: [
      "Допишіть <code>minMax(nums ...int) (lo, hi int)</code> з іменованими результатами: найменше й найбільше з аргументів. Пройдіть значення через <code>range</code>, перше значення береться як початкове (<code>i == 0</code>).",
      "Допишіть <code>joinWith(sep string, parts ...string) string</code>: склейте частини через роздільник; без частин поверніть порожній рядок.",
      "У <code>main</code> уже є виклики з розгортанням <code>data...</code>: перевірте, що вони працюють.",
    ],
    starter: raw`package main

import "fmt"

func minMax(nums ...int) (int, int) {
	// TODO: названі результати (lo, hi int) і цикл range
	return 0, 0
}

func joinWith(sep string, parts ...string) string {
	// TODO: склейте частини через sep
	return ""
}

func main() {
	lo, hi := minMax(4, -2, 9, 3)
	fmt.Println(lo, hi)
	data := []int{7, 1, 8}
	lo, hi = minMax(data...)
	fmt.Println(lo, hi)
	fmt.Println(joinWith(", ", "Go", "Rust", "C"))
	fmt.Printf("[%s]\n", joinWith("-"))
}
`,
    checks: [
      { on: "stdout", name: "Мінімум і максимум: -2 9", has: "-2 9", hint: "Якщо i == 0 || n < lo, то lo = n; так само для hi" },
      { on: "stdout", name: "Розгортання списку: 1 8", has: "1 8", hint: "minMax(data...) передає елементи списку як окремі аргументи" },
      { on: "stdout", name: "Склейка: Go, Rust, C", has: "Go, Rust, C", hint: "Роздільник додавайте перед кожною частиною, крім першої" },
      { on: "stdout", name: "Порожній виклик дає порожній рядок", has: "[]" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "-2 9\n1 8\nGo, Rust, C\n[]" },
      { on: "source", name: "Іменовані результати (lo, hi int)", matches: "\\(\\s*lo\\s*,\\s*hi\\s+int\\s*\\)", hint: "Назвіть результати в сигнатурі minMax" },
    ],
  },
  {
    ...base, id: "go-closure-counter", lesson: "go/17", xp: 30,
    title: "Лічильник-замикання і функція як аргумент",
    context: "Замикання тримають стан без глобальних змінних, а функції-параметри роблять код гнучким: так влаштовані генератори ідентифікаторів, обробники й middleware.",
    brief: [
      "Допишіть <code>makeCounter(start, step int) func() int</code>: кожен виклик повернутої функції дає поточне значення й збільшує його на <code>step</code>. Лічильники від різних викликів незалежні.",
      "Допишіть <code>makeAdder(k int) func(int) int</code>: функція, що додає <code>k</code> до свого аргумента.",
      "Допишіть <code>apply(n int, f func(int) int) int</code>: застосуйте <code>f</code> до <code>n</code>.",
    ],
    starter: raw`package main

import "fmt"

func makeCounter(start, step int) func() int {
	// TODO: змінна поза замиканням і функція, що її змінює
	return func() int { return 0 }
}

func makeAdder(k int) func(int) int {
	// TODO: поверніть функцію, що додає k
	return func(n int) int { return n }
}

func apply(n int, f func(int) int) int {
	// TODO: викличте f
	return 0
}

func main() {
	c1 := makeCounter(0, 5)
	c2 := makeCounter(100, -1)
	fmt.Println(c1(), c1(), c1())
	fmt.Println(c2(), c2())
	fmt.Println(apply(7, makeAdder(3)))
	fmt.Println(apply(7, func(n int) int { return n * n }))
}
`,
    checks: [
      { on: "stdout", name: "Перший лічильник: 0 5 10", has: "0 5 10", hint: "Значення зберігайте в змінній поза return func(), а всередині спершу запам'ятайте його, потім додайте step" },
      { on: "stdout", name: "Незалежний лічильник: 100 99", has: "100 99", hint: "Кожен виклик makeCounter має створювати власну змінну" },
      { on: "stdout", name: "Функція-аргумент: 10 і 49", has: "10\n49", hint: "apply має повертати f(n)" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "0 5 10\n100 99\n10\n49" },
      { on: "source", name: "Повертається анонімна функція", matches: "return\\s+func\\(" },
    ],
  },
  {
    ...base, id: "go-recursion", lesson: "go/18", xp: 30,
    title: "Рекурсія: степінь, сума цифр і Фібоначчі",
    context: "Рекурсія природна для вкладених даних, а підрахунок викликів показує, чому наївна подвійна рекурсія дорога. Цю інтуїцію потім використовують і для обходу дерев.",
    brief: [
      "Допишіть <code>power(base, exp int) int</code> рекурсивно: база <code>exp == 0</code> дає 1, крок множить <code>base</code> на <code>power(base, exp-1)</code>.",
      "Допишіть <code>sumDigits(n int) int</code> рекурсивно: для <code>n &lt; 10</code> це саме <code>n</code>, інакше остання цифра плюс сума цифр решти.",
      "Допишіть <code>fib(n int) int</code>: на вході кожного виклику збільшуйте глобальний <code>calls</code>, база <code>n &lt; 2</code>, крок <code>fib(n-1) + fib(n-2)</code>. Для <code>fib(10)</code> буде 177 викликів.",
    ],
    starter: raw`package main

import "fmt"

var calls int

func power(base, exp int) int {
	// TODO: база exp == 0, крок base * power(base, exp-1)
	return 0
}

func sumDigits(n int) int {
	// TODO: база n < 10, крок n%10 + sumDigits(n/10)
	return 0
}

func fib(n int) int {
	// TODO: calls++, база n < 2, крок fib(n-1) + fib(n-2)
	return 0
}

func main() {
	fmt.Println(power(2, 10), power(3, 4))
	fmt.Println(sumDigits(98765))
	r := fib(10)
	fmt.Println(r, calls)
}
`,
    checks: [
      { on: "stdout", name: "Степені: 1024 81", has: "1024 81", hint: "power(base, 0) = 1; інакше base * power(base, exp-1)" },
      { on: "stdout", name: "Сума цифр 98765: 35", has: "\n35\n", hint: "n%10 — остання цифра, n/10 — решта числа" },
      { on: "stdout", name: "fib(10) = 55 за 177 викликів", has: "55 177", hint: "calls++ має бути першим рядком fib, до перевірки бази" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "1024 81\n35\n55 177" },
      { on: "source", name: "power викликає себе у return", matches: "return[^\\n]*\\bpower\\(" },
      { on: "source", name: "sumDigits викликає себе у return", matches: "return[^\\n]*\\bsumDigits\\(" },
    ],
  },
//__END__
];
