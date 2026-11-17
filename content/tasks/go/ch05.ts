import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "go-shapes-area", lesson: "go/40", xp: 20,
    title: "Фігури через інтерфейс Shape",
    context: "Функція, що приймає інтерфейс, працює з будь-якою реалізацією: так пишуть код для різних сховищ, логерів чи платіжних систем. Тут ту саму функцію підсумовування застосуємо до різних фігур.",
    brief: [
      "Реалізуйте методи <code>Area()</code> і <code>Perimeter()</code> для <code>Rect</code> і <code>Circle</code> (для кола використайте <code>math.Pi</code>), щоб обидва типи відповідали інтерфейсу <code>Shape</code>.",
      "Допишіть <code>Total(shapes []Shape)</code>: сума площ усіх фігур зі слайса.",
    ],
    starter: raw`package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
	Perimeter() float64
}

type Rect struct{ W, H float64 }
type Circle struct{ R float64 }

func (r Rect) Area() float64        { return 0 }
func (r Rect) Perimeter() float64   { return 0 }
func (c Circle) Area() float64      { return math.Pi * 0 }
func (c Circle) Perimeter() float64 { return 0 }

func Total(shapes []Shape) float64 {
	return 0
}

func main() {
	shapes := []Shape{Rect{3, 4}, Circle{1}}
	for _, s := range shapes {
		fmt.Printf("Площа: %.2f, периметр: %.2f\n", s.Area(), s.Perimeter())
	}
	fmt.Printf("Сума площ: %.2f\n", Total(shapes))
}
`,
    checks: [
      { on: "stdout", name: "Прямокутник: площа 12.00, периметр 14.00", has: "Площа: 12.00, периметр: 14.00" },
      { on: "stdout", name: "Коло: площа 3.14, периметр 6.28", has: "Площа: 3.14, периметр: 6.28" },
      { on: "stdout", name: "Сума площ 15.14", has: "Сума площ: 15.14", hint: "Пройдіть по слайсу Shape циклом і додайте s.Area()" },
      { on: "source", name: "Використано math.Pi", matches: "math\\.Pi\\s*\\*\\s*\\w+\\.R", hint: "Площа кола: math.Pi * c.R * c.R" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Площа: 12.00, периметр: 14.00\nПлоща: 3.14, периметр: 6.28\nСума площ: 15.14" },
    ],
  },
  {
    ...base, id: "go-animals-interface", lesson: "go/41", xp: 30,
    title: "Animal: значення проти вказівника",
    context: "У реальному коді частина типів має стан і тому реалізує інтерфейс через вказівник. Якщо покласти в інтерфейс значення замість вказівника, код не скомпілюється, це одна з найчастіших плутанин новачків.",
    brief: [
      "Реалізуйте <code>Speak() string</code> для <code>Dog</code> (<code>Рекс: гав!</code>) і <code>Cat</code> (<code>Мурка: няв!</code>) з отримувачем-значенням, використайте поле <code>Name</code>.",
      "Для <code>Parrot</code> метод <code>Speak</code> має отримувач <b>*Parrot</b>: збільшує лічильник <code>Said</code> і повертає <code>Кеша: привіт!</code>. Тому в слайс <code>[]Animal</code> кладемо <code>p</code>, вказівник.",
    ],
    starter: raw`package main

import "fmt"

type Animal interface {
	Speak() string
}

type Dog struct{ Name string }
type Cat struct{ Name string }

type Parrot struct {
	Name string
	Said int
}

func main() {
	p := &Parrot{Name: "Кеша"}
	animals := []Animal{Dog{"Рекс"}, Cat{"Мурка"}, p}
	for i := 0; i < 2; i++ {
		for _, a := range animals {
			fmt.Println(a.Speak())
		}
	}
	fmt.Println("Кеша говорив:", p.Said)
}
`,
    checks: [
      { on: "stdout", name: "Пес говорить «Рекс: гав!»", has: "Рекс: гав!" },
      { on: "stdout", name: "Кіт говорить «Мурка: няв!»", has: "Мурка: няв!" },
      { on: "stdout", name: "Папуга говорить «Кеша: привіт!»", has: "Кеша: привіт!" },
      { on: "stdout", name: "Папуга запам'ятав 2 виклики", has: "Кеша говорив: 2", hint: "Метод Speak має змінювати p.Said, тож отримувач — вказівник" },
      { on: "source", name: "Speak для Parrot з отримувачем-вказівником", matches: "func\\s*\\(\\s*\\w+\\s+\\*Parrot\\s*\\)\\s*Speak", hint: "Запис виду func (p *Parrot) Speak() string" },
    ],
  },
  {
    ...base, id: "go-any-assert", lesson: "go/42", xp: 25,
    title: "Сума цілих із []any",
    context: "Дані невідомої форми (розібраний JSON, значення з конфігурації) приходять як any. Безпечно дістати з них тип можна лише через comma-ok, інакше програма впаде на першому ж несподіваному значенні.",
    brief: [
      "<code>SumInts(vals []any) (sum, skipped int)</code> додає всі значення типу <code>int</code>, а інші лише лічить у <code>skipped</code>. Паніки бути не має.",
      "<code>AsString(v any) (string, bool)</code> повертає рядок і <code>true</code>, якщо всередині <code>string</code>, інакше <code>\"\"</code> і <code>false</code>. Скористайтеся формою comma-ok.",
    ],
    starter: raw`package main

import "fmt"

func SumInts(vals []any) (sum, skipped int) {
	return 0, 0
}

func AsString(v any) (string, bool) {
	return "", false
}

func main() {
	sum, skipped := SumInts([]any{1, "два", 3, 4.5, 5, nil})
	fmt.Printf("Сума: %d, пропущено: %d\n", sum, skipped)
	s, ok := AsString("go")
	fmt.Printf("%q %v\n", s, ok)
	s, ok = AsString(42)
	fmt.Printf("%q %v\n", s, ok)
}
`,
    checks: [
      { on: "stdout", name: "Сума цілих 9, пропущено 3", has: "Сума: 9, пропущено: 3" },
      { on: "stdout", name: "AsString(\"go\") дає «go» і true", has: "\"go\" true" },
      { on: "stdout", name: "AsString(42) дає порожній рядок і false", has: "\"\" false" },
      { on: "source", name: "Є твердження типу .(int) у формі comma-ok", matches: "\\w+\\s*,\\s*\\w+\\s*:?=\\s*\\w+\\.\\(int\\)", hint: "n, ok := v.(int)" },
      { on: "source", name: "Є твердження .(string)", matches: "\\.\\(string\\)" },
    ],
  },
  {
    ...base, id: "go-type-switch", lesson: "go/43", xp: 25,
    title: "Describe через type switch",
    context: "Type switch розбирає значення різних типів в одному місці: так пишуть форматери, обходи дерев і розбір розібраного JSON.",
    brief: [
      "Допишіть <code>Describe(x any) string</code> через <code>switch v := x.(type)</code>. Результати: <code>nil</code> дає <code>нічого</code>; <code>int</code> дає <code>ціле N</code>; <code>string</code> дає <code>рядок \"S\"</code> (у лапках); <code>[]int</code> дає <code>слайс із N елементів</code>; решта дають <code>невідомий тип T</code> (через <code>%T</code>).",
    ],
    starter: raw`package main

import "fmt"

func Describe(x any) string {
	return "?"
}

func main() {
	for _, x := range []any{42, "go", []int{1, 2, 3}, nil, 3.5} {
		fmt.Println(Describe(x))
	}
}
`,
    checks: [
      { on: "stdout", name: "Ціле: «ціле 42»", has: "ціле 42" },
      { on: "stdout", name: "Рядок у лапках: «рядок \"go\"»", has: "рядок \"go\"" },
      { on: "stdout", name: "Слайс: «слайс із 3 елементів»", has: "слайс із 3 елементів" },
      { on: "stdout", name: "nil і невідомий тип", has: "нічого\nневідомий тип float64" },
      { on: "source", name: "Використано type switch", matches: "\\.\\(type\\)", hint: "switch v := x.(type) { case int: ... }" },
      { on: "source", name: "Є гілка case nil", matches: "case\\s+nil\\b" },
    ],
  },
  {
    ...base, id: "go-money-stringer", lesson: "go/44", xp: 25,
    title: "Money: Stringer і власна помилка",
    context: "Типи з власним String() гарно виглядають у логах, а власні типи помилок несуть контекст: скільки не вистачило, чого немає. Обидва рішення спираються на малі стандартні інтерфейси.",
    brief: [
      "<code>Money</code> зберігає копійки. Метод <code>String()</code> має повертати формат <code>100.50 грн</code> (гривні, крапка, дві цифри копійок). Не друкуйте отримувача через <code>%v</code> всередині методу.",
      "<code>NoFunds</code> реалізує <code>error</code>: <code>недостатньо коштів: потрібно 500.00 грн, є 74.75 грн</code>. <code>Withdraw(balance, amount Money) (Money, error)</code> повертає новий баланс, або старий баланс і <code>NoFunds</code>, якщо коштів замало.",
    ],
    starter: raw`package main

import "fmt"

type Money int

func (m Money) String() string {
	return ""
}

type NoFunds struct{ Need, Have Money }

func (e NoFunds) Error() string {
	return ""
}

func Withdraw(balance, amount Money) (Money, error) {
	return balance, nil
}

func main() {
	b := Money(10050)
	fmt.Println(b)
	b, err := Withdraw(b, 2575)
	fmt.Println(b, err)
	_, err = Withdraw(b, 50000)
	fmt.Println("помилка:", err)
}
`,
    checks: [
      { on: "stdout", name: "Money друкується як 100.50 грн", has: "100.50 грн\n" },
      { on: "stdout", name: "Після зняття 74.75 грн і nil-помилка", has: "74.75 грн <nil>" },
      { on: "stdout", name: "Помилка нестачі коштів із сумами", has: "помилка: недостатньо коштів: потрібно 500.00 грн, є 74.75 грн", hint: "У Error() скористайтеся форматуванням Money через %s або %v: тип уже має String()" },
      { on: "source", name: "Метод String() для Money", matches: "func\\s*\\(\\s*\\w+\\s+Money\\s*\\)\\s*String\\(\\)\\s*string" },
      { on: "source", name: "Метод Error() для NoFunds", matches: "func\\s*\\(\\s*\\w+\\s+\\*?NoFunds\\s*\\)\\s*Error\\(\\)\\s*string" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "100.50 грн\n74.75 грн <nil>\nпомилка: недостатньо коштів: потрібно 500.00 грн, є 74.75 грн" },
    ],
  },
  {
    ...base, id: "go-line-counter-writer", lesson: "go/45", xp: 30,
    title: "Writer-обгортка LineCounter",
    context: "Обгортки навколо io.Writer роблять підрахунок байтів, логування, стиснення без жодних змін у решті коду. Це основний спосіб розширювати потоки даних у Go.",
    brief: [
      "Допишіть метод <code>Write</code> для <code>*LineCounter</code>: він має передати байти вкладеному <code>W</code>, додати до <code>Lines</code> кількість символів переведення рядка <code>\\n</code> у <code>p</code> і повернути результат запису в <code>W</code>.",
      "Для підрахунку скористайтеся <code>bytes.Count</code>. Тоді <code>io.Copy</code> і <code>fmt.Fprintf</code> працюватимуть із вашою обгорткою як зі звичайним Writer.",
    ],
    starter: raw`package main

import (
	"bytes"
	"fmt"
	"io"
	"strings"
)

type LineCounter struct {
	W     io.Writer
	Lines int
}

func (c *LineCounter) Write(p []byte) (int, error) {
	return len(p), nil
}

func main() {
	var buf bytes.Buffer
	lc := &LineCounter{W: &buf}
	n, err := io.Copy(lc, strings.NewReader("a\nb\nc\n"))
	fmt.Println(n, err, lc.Lines)
	fmt.Fprintf(lc, "x\ny")
	fmt.Println("Рядків:", lc.Lines)
	fmt.Printf("%q\n", buf.String())
}
`,
    checks: [
      { on: "stdout", name: "io.Copy переніс 6 байтів, 3 рядки", has: "6 <nil> 3" },
      { on: "stdout", name: "Після Fprintf усього 4 переведення рядка", has: "Рядків: 4", hint: "Лічіть bytes.Count(p, []byte(\"\\n\")) у кожному виклику Write і додавайте до c.Lines" },
      { on: "stdout", name: "Дані дійшли до вкладеного буфера", has: "\"a\\nb\\nc\\nx\\ny\"", hint: "Передайте p далі: c.W.Write(p)" },
      { on: "source", name: "Write на *LineCounter", matches: "func\\s*\\(\\s*\\w+\\s+\\*LineCounter\\s*\\)\\s*Write\\(" },
      { on: "source", name: "Використано bytes.Count", matches: "bytes\\.Count\\(" },
    ],
  },
  {
    ...base, id: "go-sort-interface", lesson: "go/46", xp: 40,
    title: "Сортування штату через sort.Interface",
    context: "Звіти майже завжди сортують за кількома ключами: спершу відділ, потім зарплата за спаданням. sort.Interface дозволяє описати такий порядок один раз і не залежати від типу даних.",
    brief: [
      "Реалізуйте методи <code>Len</code>, <code>Swap</code> і <code>Less</code> для <code>ByDeptSalary</code>. Порядок: відділ за зростанням, у відділі зарплата за спаданням, при рівності за іменем за зростанням.",
      "Відсортуйте штат через <code>sort.Sort</code> і перевірте результат через <code>sort.IsSorted</code>. Порівняння має бути строгим.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sort"
)

type Employee struct {
	Name   string
	Dept   string
	Salary int
}

type ByDeptSalary []Employee

func (b ByDeptSalary) Len() int           { return 0 }
func (b ByDeptSalary) Swap(i, j int)      {}
func (b ByDeptSalary) Less(i, j int) bool { return false }

func main() {
	staff := []Employee{
		{"Ann", "dev", 5000}, {"Bob", "ops", 3000}, {"Cid", "dev", 7000},
		{"Dan", "ops", 3000}, {"Eva", "dev", 5000},
	}
	sort.Sort(ByDeptSalary(staff))
	for _, e := range staff {
		fmt.Println(e.Dept, e.Name, e.Salary)
	}
	fmt.Println("відсортовано:", sort.IsSorted(ByDeptSalary(staff)))
}
`,
    checks: [
      { on: "stdout", name: "Спершу відділ dev, найбільша зарплата вгорі", has: "dev Cid 7000\ndev Ann 5000\ndev Eva 5000" },
      { on: "stdout", name: "Відділ ops, рівні зарплати за іменем", has: "ops Bob 3000\nops Dan 3000", hint: "Каскад у Less: відділ, потім Salary за спаданням, потім Name" },
      { on: "stdout", name: "IsSorted повертає true", has: "відсортовано: true" },
      { on: "source", name: "Swap міняє елементи місцями", matches: "\\w+\\[i\\]\\s*,\\s*\\w+\\[j\\]\\s*=\\s*\\w+\\[j\\]\\s*,\\s*\\w+\\[i\\]", hint: "b[i], b[j] = b[j], b[i]" },
      { on: "source", name: "Len повертає довжину слайса", matches: "Len\\(\\)\\s*int\\s*\\{\\s*return\\s+len\\(" },
    ],
  },
  {
    ...base, id: "go-generic-funcs", lesson: "go/47", xp: 30,
    title: "Узагальнені Max, IndexOf і Reverse",
    context: "Допоміжні функції для слайсів потрібні в кожному проєкті. Generics дозволяють написати їх один раз для int, string, float64 і власних типів, не втрачаючи перевірок компілятора.",
    brief: [
      "<code>Max</code> повертає найбільший елемент і <code>true</code>, а для порожнього слайса нульове значення й <code>false</code>. Обмеження: <code>cmp.Ordered</code> (не забудьте імпорт <code>cmp</code>).",
      "<code>IndexOf</code> повертає індекс першого збігу або <code>-1</code> (обмеження <code>comparable</code>). <code>Reverse</code> повертає новий слайс у зворотному порядку й не змінює вхідний (достатньо <code>any</code>).",
    ],
    starter: raw`package main

import "fmt"

func Max[T any](s []T) (T, bool) {
	var zero T
	return zero, false
}

func IndexOf[T any](s []T, v T) int {
	return -1
}

func Reverse[T any](s []T) []T {
	return s
}

func main() {
	fmt.Println(Max([]int{3, 9, 4}))
	fmt.Println(Max([]string{"kiwi", "apple", "pear"}))
	fmt.Println(Max([]float64{}))
	fmt.Println(IndexOf([]string{"a", "b", "c"}, "c"))
	fmt.Println(IndexOf([]int{1, 2}, 7))
	orig := []int{1, 2, 3}
	fmt.Println(Reverse(orig), orig)
	fmt.Println(Reverse([]string{"a", "b"}))
}
`,
    checks: [
      { on: "stdout", name: "Max для int і string", has: "9 true\npear true" },
      { on: "stdout", name: "Max для порожнього слайса: нуль і false", has: "0 false" },
      { on: "stdout", name: "IndexOf знаходить і не знаходить", has: "2\n-1" },
      { on: "stdout", name: "Reverse не чіпає оригінал", has: "[3 2 1] [1 2 3]\n[b a]", hint: "Створіть out := make([]T, len(s)) і заповніть його з кінця" },
      { on: "source", name: "Max обмежено cmp.Ordered", matches: "\\[\\s*\\w+\\s+cmp\\.Ordered\\s*\\]" },
      { on: "source", name: "IndexOf обмежено comparable", matches: "\\[\\s*\\w+\\s+comparable\\s*\\]" },
    ],
  },
];
