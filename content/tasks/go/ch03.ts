// Практичні завдання глави «Колекції» (уроки 19–30). Запускаються на сервері, результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "go-arrays-fixed", lesson: "go/19", xp: 20,
    title: "Масиви: копіювання й порівняння",
    context: "Масив у Go є значенням: його копіюють і порівнюють цілком. Коли ви передаєте в функцію невеликий фіксований набір (колір RGB, координати, хеш), важливо знати, що оригінал лишиться цілим.",
    brief: [
      "Допишіть <code>doubled(a [4]int) [4]int</code>: повертає масив із подвоєними елементами, а вхідний не змінює.",
      "Допишіть <code>same(a, b [4]int) bool</code>: чи рівні масиви (скористайтеся оператором <code>==</code>).",
    ],
    starter: raw`package main

import "fmt"

func doubled(a [4]int) [4]int {
	// TODO: подвійте кожен елемент і поверніть результат
	return [4]int{}
}

func same(a, b [4]int) bool {
	// TODO: порівняйте масиви
	return false
}

func main() {
	orig := [4]int{1, 2, 3, 4}
	d := doubled(orig)
	fmt.Println(orig, d)
	fmt.Println(same(orig, d), same(orig, [4]int{1, 2, 3, 4}))
}
`,
    checks: [
      { on: "stdout", name: "Подвоєний масив: [2 4 6 8]", has: "[1 2 3 4] [2 4 6 8]", hint: "Змініть елементи в копії (параметр a уже є копією) і поверніть її" },
      { on: "stdout", name: "Порівняння: false true", has: "false true", hint: "Масиви одного типу порівнюються через ==" },
      { on: "source", name: "Використано оператор ==", matches: "==", hint: "return a == b" },
      { on: "stdout", name: "Рівно два рядки виводу", equals: "[1 2 3 4] [2 4 6 8]\nfalse true" },
    ],
  },
  {
    ...base, id: "go-slices-basics", lesson: "go/20", xp: 20,
    title: "Слайси: make і зрізання",
    context: "Майже кожна функція на Go приймає або повертає слайс. Створити слайс потрібного розміру й відрізати від нього частину доводиться постійно: наприклад, прибрати службові рядки з початку й кінця файлу.",
    brief: [
      "Допишіть <code>countdown(n int) []int</code>: створіть слайс через <code>make([]int, n)</code> і заповніть його числами <code>n, n-1, …, 1</code>.",
      "Допишіть <code>trim(s []int) []int</code>: поверніть слайс без першого й останнього елемента. Якщо елементів менше трьох, поверніть порожній слайс, але <b>не nil</b>.",
    ],
    starter: raw`package main

import "fmt"

func countdown(n int) []int {
	// TODO: make + цикл
	return nil
}

func trim(s []int) []int {
	// TODO: зріз без першого й останнього
	return nil
}

func main() {
	c := countdown(5)
	fmt.Println(c)
	fmt.Println(trim(c))
	t := trim([]int{1, 2})
	fmt.Println(len(t), t == nil)
}
`,
    checks: [
      { on: "stdout", name: "countdown(5) дає [5 4 3 2 1]", has: "[5 4 3 2 1]" },
      { on: "stdout", name: "trim відкидає краї: [4 3 2]", has: "[4 3 2]", hint: "s[1:len(s)-1]" },
      { on: "stdout", name: "Короткий слайс дає порожній не-nil: 0 false", has: "0 false", hint: "s[:0] або []int{} — порожній, але не nil" },
      { on: "source", name: "Слайс створено через make", has: "make(" },
      { on: "stdout", name: "Рівно три рядки виводу", equals: "[5 4 3 2 1]\n[4 3 2]\n0 false" },
    ],
  },
  {
    ...base, id: "go-filter-evens", lesson: "go/21", xp: 25,
    title: "Фільтр парних чисел у слайсі",
    context: "Слайси — основний спосіб працювати зі списками даних: рядки таблиці, id із запиту, результати пошуку. Відфільтрувати й підсумувати слайс доводиться щодня, а виділяти пам'ять із запасом уміють не всі.",
    brief: [
      "Допишіть <code>sum(nums []int) int</code> і <code>evens(nums []int) []int</code>: друга повертає новий слайс лише з парних чисел (у тому ж порядку).",
      "Створіть результат із запасом <code>make([]int, 0, len(nums))</code> і наповнюйте через <code>append</code>. Вхідний слайс змінювати не можна.",
    ],
    starter: raw`package main

import "fmt"

func sum(nums []int) int {
	// TODO
	return 0
}

func evens(nums []int) []int {
	// TODO: повертайте новий слайс із парних чисел
	return nil
}

func main() {
	nums := []int{5, 2, 9, 7, 4, 10, 3, 8}
	e := evens(nums)
	fmt.Println("Сума:", sum(nums))
	fmt.Println("Парні:", e)
	fmt.Println("Скільки парних:", len(e), cap(e) >= len(e))
	fmt.Println("Вхідний:", nums)
}
`,
    checks: [
      { on: "stdout", name: "Сума всіх чисел дорівнює 48", has: "Сума: 48" },
      { on: "stdout", name: "Парні: [2 4 10 8]", has: "Парні: [2 4 10 8]" },
      { on: "stdout", name: "Кількість парних дорівнює 4", has: "Скільки парних: 4 true" },
      { on: "stdout", name: "Вхідний слайс не змінився", has: "Вхідний: [5 2 9 7 4 10 3 8]" },
      { on: "source", name: "Слайс наповнюється через append", has: "append(" },
      { on: "source", name: "Результат створено із запасом місткості", matches: "make\\(\\[\\]int,\\s*0,", hint: "make([]int, 0, len(nums))" },
    ],
  },
  {
    ...base, id: "go-slice-copy", lesson: "go/22", xp: 25,
    title: "Копіювання слайсів без сюрпризів",
    context: "Коли ви віддаєте слайс «в чужі руки» (у кеш, іншому модулю), він не має ділити пам'ять із вашим. Помилка тут дає найнеприємніші баги: дані міняються самі собою.",
    brief: [
      "Допишіть <code>removeAt(s []int, i int) []int</code>: поверніть <b>новий</b> слайс без елемента з індексом <code>i</code>, не змінюючи <code>s</code>.",
      "Допишіть <code>firstThree(big []int) []int</code>: поверніть незалежну копію перших трьох елементів (щоб великий масив можна було звільнити).",
    ],
    starter: raw`package main

import "fmt"

func removeAt(s []int, i int) []int {
	// TODO: не змінюйте s
	return s
}

func firstThree(big []int) []int {
	// TODO: поверніть копію, а не зріз
	return big[:3]
}

func main() {
	orig := []int{10, 20, 30, 40, 50}
	r := removeAt(orig, 1)
	fmt.Println(r, orig)
	head := firstThree(orig)
	head[0] = 99
	fmt.Println(head, orig[0])
}
`,
    checks: [
      { on: "stdout", name: "removeAt видаляє елемент, оригінал цілий", has: "[10 30 40 50] [10 20 30 40 50]", hint: "Створіть новий слайс і наповніть його через append(…, s[:i]...) та append(…, s[i+1:]...)" },
      { on: "stdout", name: "firstThree — незалежна копія", has: "[99 20 30] 10", hint: "Зміна head[0] не повинна зачепити orig" },
      { on: "source", name: "Використано copy або append для нового слайса", matches: "copy\\(|append\\(" },
      { on: "stdout", name: "Рівно два рядки виводу", equals: "[10 30 40 50] [10 20 30 40 50]\n[99 20 30] 10" },
    ],
  },
  // NEXT
];
