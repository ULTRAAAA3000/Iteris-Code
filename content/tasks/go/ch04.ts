// Практичні завдання глави «Структури й вказівники» (уроки 31–39). Запускаються на сервері, результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "go-struct-inventory", lesson: "go/31", xp: 20,
    title: "Склад: структура Product",
    context: "Записи про товари, користувачів чи замовлення в Go майже завжди зберігають слайсом структур. Уміння змінювати саме елементи слайсу, а не їхні копії, потрібне щодня.",
    brief: [
      "Доповніть структуру <code>Product</code> полями <code>Price</code> і <code>Qty</code> (обидва <code>int</code>), а також напишіть функції <code>total</code> і <code>restock</code>.",
      "<code>total</code> повертає суму <code>Price*Qty</code> по всіх товарах. <code>restock</code> збільшує <code>Qty</code> кожного товару на задане число прямо у слайсі.",
    ],
    starter: raw`package main

import "fmt"

type Product struct {
	Name string
}

func total(items []Product) int {
	return 0
}

func restock(items []Product, qty int) {
}

func main() {
	items := []Product{
		{Name: "Зошит", Price: 30, Qty: 4},
		{Name: "Ручка", Price: 12, Qty: 10},
	}
	restock(items, 5)
	for _, it := range items {
		fmt.Println(it.Name, it.Qty)
	}
	fmt.Println("Разом:", total(items))
}
`,
    checks: [
      { on: "stdout", name: "Кількість після поповнення: Зошит 9, Ручка 15", has: "Зошит 9\nРучка 15" },
      { on: "stdout", name: "Загальна вартість 450", has: "Разом: 450" },
      { on: "source", name: "Структуру Product оголошено з полями Price і Qty", matches: "type Product struct[\\s\\S]*Price[\\s\\S]*Qty", hint: "Додайте до структури два поля типу int" },
      { on: "source", name: "Елементи змінюються через індекс", matches: "items\\[i\\]\\.Qty", hint: "Змінна циклу range — копія елемента; змінюйте елемент слайсу за індексом" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Зошит 9\nРучка 15\nРазом: 450" },
    ],
  },
  {
    ...base, id: "go-pointers-swap", lesson: "go/32", xp: 25,
    title: "Вказівники: swap і поповнення рахунку",
    context: "Функція, що має змінити дані викликача (оновити рахунок, збільшити лічильник), отримує вказівник. А код, що приймає вказівник, мусить пам'ятати про nil.",
    brief: [
      "Перепишіть <code>swap</code> і <code>deposit</code> так, щоб вони приймали вказівники й справді змінювали оригінали: <code>swap</code> міняє два числа місцями, <code>deposit</code> додає суму до <code>Balance</code>.",
      "Функція <code>balanceOf</code> повертає баланс рахунку або <code>-1</code>, якщо їй передали <code>nil</code>.",
    ],
    starter: raw`package main

import "fmt"

type Account struct {
	Owner   string
	Balance int
}

func swap(a, b int) {
	a, b = b, a
}

func deposit(acc Account, sum int) {
	acc.Balance += sum
}

func balanceOf(acc Account) int {
	return acc.Balance
}

func main() {
	x, y := 3, 8
	swap(&x, &y)
	fmt.Println(x, y)

	acc := Account{Owner: "Ірина"}
	deposit(&acc, 100)
	deposit(&acc, 50)
	fmt.Println(acc.Owner, acc.Balance)

	var none *Account
	fmt.Println(balanceOf(none), balanceOf(&acc))
}
`,
    checks: [
      { on: "stdout", name: "swap поміняв числа: 8 3", has: "8 3" },
      { on: "stdout", name: "Рахунок після двох внесків: Ірина 150", has: "Ірина 150" },
      { on: "stdout", name: "balanceOf(nil) дає -1", has: "-1 150" },
      { on: "source", name: "swap і deposit приймають вказівники", matches: "func swap\\(\\w+,\\s*\\w+ \\*int\\)[\\s\\S]*func deposit\\(\\w+ \\*Account", hint: "Параметри мають бути типу *int та *Account" },
      { on: "source", name: "Є перевірка на nil", matches: "== nil|!= nil", hint: "Перш ніж читати поле через вказівник, переконайтеся, що він не nil" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "8 3\nІрина 150\n-1 150" },
    ],
  },
  {
    ...base, id: "go-methods-basics", lesson: "go/33", xp: 20,
    title: "Методи Rect і Celsius",
    context: "Поведінку типу описують методами: <code>order.Total()</code> читається природніше за <code>total(order)</code>. Цей самий механізм дозволяє додати методи й до простих типів на кшталт температури.",
    brief: [
      "Додайте до <code>Rect</code> методи <code>Area() int</code> та <code>Perimeter() int</code>.",
      "Додайте до <code>Celsius</code> метод <code>Fahrenheit() float64</code> за формулою <code>C*9/5 + 32</code>. Функцію <code>main</code> не змінюйте.",
    ],
    starter: raw`package main

import "fmt"

type Rect struct {
	W, H int
}

type Celsius float64

func main() {
	r := Rect{W: 6, H: 4}
	fmt.Println(r.Area(), r.Perimeter())
	fmt.Println(Celsius(100).Fahrenheit())
	fmt.Println(Celsius(-40).Fahrenheit())
}
`,
    checks: [
      { on: "stdout", name: "Площа й периметр: 24 20", has: "24 20" },
      { on: "stdout", name: "100 °C це 212 °F", has: "212" },
      { on: "source", name: "Area і Perimeter — методи Rect", matches: "func \\(\\w+ Rect\\) Area\\(\\) int[\\s\\S]*func \\(\\w+ Rect\\) Perimeter\\(\\) int|func \\(\\w+ Rect\\) Perimeter\\(\\) int[\\s\\S]*func \\(\\w+ Rect\\) Area\\(\\) int", hint: "Отримувач записують у дужках перед іменем методу" },
      { on: "source", name: "Fahrenheit — метод типу Celsius", matches: "func \\(\\w+ Celsius\\) Fahrenheit\\(\\) float64", hint: "Метод оголошується на власному типі Celsius" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "24 20\n212\n-40" },
    ],
  },
  {
    ...base, id: "go-receivers-counter", lesson: "go/34", xp: 25,
    title: "Лічильник і точка: який отримувач вибрати",
    context: "Типи зі станом (лічильник, кеш, сервіс) мають методи з вказівником, а малі незмінні значення (точка, гроші) передають за значенням. Помилка у виборі дає метод, який «нічого не робить».",
    brief: [
      "Зараз <code>Counter</code> має методи з отримувачем-значенням, тому <code>Inc</code> і <code>Add</code> змінюють лише копію. Виправте: усі три методи <code>Counter</code> мають бути з вказівником (методи одного типу узгоджуємо).",
      "Додайте до <code>Point</code> метод <code>Add(q Point) Point</code> з отримувачем-значенням: він не змінює точку, а повертає нову з сумою координат. Функцію <code>main</code> не змінюйте.",
    ],
    starter: raw`package main

import "fmt"

type Counter struct {
	N int
}

func (c Counter) Inc() {
	c.N++
}

func (c Counter) Add(n int) {
	c.N += n
}

func (c Counter) Value() int {
	return c.N
}

type Point struct {
	X, Y int
}

func main() {
	var c Counter
	c.Inc()
	c.Inc()
	c.Add(10)
	fmt.Println(c.Value())

	counters := []Counter{{}, {}}
	counters[1].Inc()
	fmt.Println(counters[0].Value(), counters[1].Value())

	p := Point{1, 2}.Add(Point{3, 4})
	fmt.Println(p)
}
`,
    checks: [
      { on: "stdout", name: "Лічильник після Inc, Inc, Add(10): 12", has: "12" },
      { on: "stdout", name: "Змінено лише другий лічильник у слайсі: 0 1", has: "0 1" },
      { on: "stdout", name: "Сума точок: {4 6}", has: "{4 6}" },
      { on: "source", name: "Методи Counter мають отримувач-вказівник", matches: "func \\(\\w+ \\*Counter\\) Inc\\(\\)", hint: "Щоб метод змінював оригінал, отримувач записують як *Counter" },
      { on: "source", name: "Усі методи Counter однакові: жодного з отримувачем-значенням", matches: "func \\(\\w+ Counter\\)", not: true, hint: "Якщо хоч один метод має вказівник, роблять так усі: і Add, і Value" },
      { on: "source", name: "Point.Add бере й повертає значення", matches: "func \\(\\w+ Point\\) Add\\(\\w+ Point\\) Point", hint: "Метод Add малого типу Point приймає Point і повертає нову Point" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "12\n0 1\n{4 6}" },
    ],
  },
  {
    ...base, id: "go-embedding-base", lesson: "go/35", xp: 25,
    title: "Вбудовування: спільна основа для статті й коментаря",
    context: "Спільні поля сутностей (ID, автор, дата створення) виносять у базову структуру й вбудовують, а не копіюють у кожен тип. Перекриття методу дозволяє додати власну поведінку, зберігши базову.",
    brief: [
      "Вбудуйте <code>Base</code> у <code>Article</code> і в <code>Comment</code> (вбудоване поле без імені, а не звичайне поле).",
      "Додайте до <code>Comment</code> власний метод <code>Info() string</code>, що повертає результат <code>Base.Info()</code>, далі двокрапку, пробіл і текст коментаря. Версія <code>Article</code> лишається просунутою з <code>Base</code>.",
    ],
    starter: raw`package main

import "fmt"

type Base struct {
	ID     int
	Author string
}

func (b Base) Info() string {
	return fmt.Sprintf("#%d від %s", b.ID, b.Author)
}

type Article struct {
	Title string
}

type Comment struct {
	Text string
}

func main() {
	a := Article{Base: Base{ID: 1, Author: "Ірина"}, Title: "Go"}
	c := Comment{Base: Base{ID: 2, Author: "Олег"}, Text: "Дякую"}
	fmt.Println(a.Info())
	fmt.Println(c.Info())
	fmt.Println(a.Author, c.Base.ID)
}
`,
    checks: [
      { on: "stdout", name: "Стаття: просунутий Info()", has: "#1 від Ірина" },
      { on: "stdout", name: "Коментар: Info() з дописаним текстом", has: "#2 від Олег: Дякую" },
      { on: "stdout", name: "Просунуте поле Author і явний доступ до Base.ID", has: "Ірина 2" },
      { on: "source", name: "Base вбудовано без імені поля", matches: "type Article struct \\{[^}]*\\n\\s*Base\\s*\\n", hint: "Вбудоване поле — це лише назва типу в рядку структури, без імені перед ним" },
      { on: "source", name: "Comment перекриває Info і викликає версію Base", matches: "func \\(\\w+ Comment\\) Info\\(\\) string[\\s\\S]*\\.Base\\.Info\\(\\)", hint: "Усередині власного Info() звертайтеся до вбудованої версії явно: через поле Base" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "#1 від Ірина\n#2 від Олег: Дякую\nІрина 2" },
    ],
  },
  {
    ...base, id: "go-iota-level", lesson: "go/36", xp: 25,
    title: "Рівні логування: enum на iota зі String()",
    context: "Рівні логування, статуси замовлень, ролі користувачів — усе це перелічувані типи. <code>iota</code> дає значення, а <code>String()</code> робить логи читабельними.",
    brief: [
      "Константи <code>Level</code> зараз записані числами вручну. Перепишіть блок на <code>iota</code> (значення мають лишитися 0, 1, 2, 3).",
      "Додайте метод <code>String()</code> з іменами <code>DEBUG</code>, <code>INFO</code>, <code>WARN</code>, <code>ERROR</code>. Для значення поза діапазоном поверніть <code>Level(N)</code> (число друкуйте через <code>%d</code> і <code>int(l)</code>, щоб не викликати <code>String()</code> рекурсивно).",
    ],
    starter: raw`package main

import "fmt"

type Level int

const (
	Debug Level = 0
	Info  Level = 1
	Warn  Level = 2
	Error Level = 3
)

func main() {
	fmt.Println(Debug, Info, Warn, Error)
	fmt.Printf("%v %d\n", Warn, Warn)
	fmt.Println(Level(9))
	fmt.Println(Warn >= Info)
}
`,
    checks: [
      { on: "stdout", name: "Імена рівнів: DEBUG INFO WARN ERROR", has: "DEBUG INFO WARN ERROR" },
      { on: "stdout", name: "%v дає ім'я, %d дає число: WARN 2", has: "WARN 2" },
      { on: "stdout", name: "Значення поза діапазоном: Level(9)", has: "Level(9)" },
      { on: "source", name: "Константи на iota", matches: "\\biota\\b", hint: "Перший рядок блоку: Debug Level = iota; решта рядків повторюють вираз" },
      { on: "source", name: "Є метод String() string на типі Level", matches: "func \\(\\w+ Level\\) String\\(\\) string", hint: "fmt викликає саме метод з таким ім'ям і підписом" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "DEBUG INFO WARN ERROR\nWARN 2\nLevel(9)\ntrue" },
    ],
  },
];
