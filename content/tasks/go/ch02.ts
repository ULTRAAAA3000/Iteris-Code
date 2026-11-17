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
//__END__
];
