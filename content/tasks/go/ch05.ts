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
];
