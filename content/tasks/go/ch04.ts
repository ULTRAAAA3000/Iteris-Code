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
];
