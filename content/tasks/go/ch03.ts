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
  {
    ...base, id: "go-slices-pkg", lesson: "go/23", xp: 30,
    title: "Пакет slices: видалення й унікальні значення",
    context: "Прибрати значення зі списку чи залишити лише унікальні ID доводиться в кожному проєкті. Готові функції пакета slices роблять це коротше й без помилок на одиницю, а Clone береже вхідні дані від зміни.",
    brief: [
      "Допишіть <code>without(s []int, v int) []int</code>: поверніть новий слайс без першого входження <code>v</code>. Вхідний слайс змінювати не можна; якщо <code>v</code> немає, поверніть копію.",
      "Допишіть <code>uniqueSorted(s []int) []int</code>: поверніть відсортований слайс без дублікатів, вхідний не змінюйте. Використайте <code>slices.Clone</code>, <code>slices.Sort</code> і <code>slices.Compact</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"slices"
)

func without(s []int, v int) []int {
	// TODO: Clone + Index + Delete
	return s
}

func uniqueSorted(s []int) []int {
	// TODO: Clone + Sort + Compact
	return s
}

func main() {
	nums := []int{5, 3, 5, 1, 3, 9, 1}
	fmt.Println(without(nums, 3), nums)
	fmt.Println(without(nums, 42))
	fmt.Println(uniqueSorted(nums), nums)
	fmt.Println(slices.Max(nums))
}
`,
    checks: [
      { on: "stdout", name: "without прибирає лише перше входження", has: "[5 5 1 3 9 1] [5 3 5 1 3 9 1]", hint: "i := slices.Index(c, v); якщо i >= 0, c = slices.Delete(c, i, i+1) для копії c" },
      { on: "stdout", name: "Якщо значення немає, повертається копія без змін", has: "[5 3 5 1 3 9 1]\n[1 3 5 9] [5 3 5 1 3 9 1]", hint: "Перевірте i >= 0 перед Delete: Index повертає -1" },
      { on: "stdout", name: "uniqueSorted: [1 3 5 9], вхідний цілий", has: "[1 3 5 9] [5 3 5 1 3 9 1]", hint: "Compact прибирає лише сусідні дублікати, тому спершу Sort" },
      { on: "source", name: "Використано slices.Clone, Compact і Delete", matches: "slices\\.Clone[\\s\\S]*slices\\.Compact|slices\\.Compact[\\s\\S]*slices\\.Clone", hint: "Потрібні обидві функції пакета slices" },
      { on: "source", name: "Використано slices.Delete", has: "slices.Delete(" },
      { on: "stdout", name: "Рівно чотири рядки виводу", equals: "[5 5 1 3 9 1] [5 3 5 1 3 9 1]\n[5 3 5 1 3 9 1]\n[1 3 5 9] [5 3 5 1 3 9 1]\n9" },
    ],
  },
  {
    ...base, id: "go-matrix", lesson: "go/24", xp: 30,
    title: "Матриця: створення і транспонування",
    context: "Двовимірні таблиці потрібні для ігрових полів, зображень і табличних даних. Головна складність: кожен рядок [][]int створюється окремо, і саме тут новачки отримують panic.",
    brief: [
      "Допишіть <code>newMatrix(rows, cols int) [][]int</code>: створіть таблицю, де клітинка <code>[i][j]</code> дорівнює <code>i*cols + j</code>. Кожен рядок створюйте через <code>make</code>.",
      "Допишіть <code>transpose(m [][]int) [][]int</code>: поверніть нову таблицю, де рядки й стовпці поміняно місцями. Вхідну не змінюйте; для порожньої таблиці поверніть <code>nil</code>.",
    ],
    starter: raw`package main

import "fmt"

func newMatrix(rows, cols int) [][]int {
	// TODO: зовнішній make, потім make для кожного рядка
	return nil
}

func transpose(m [][]int) [][]int {
	// TODO: t[j][i] = m[i][j]
	return m
}

func main() {
	m := newMatrix(2, 3)
	fmt.Println(m)
	t := transpose(m)
	fmt.Println(t)
	fmt.Println(len(t), len(t[0]), transpose(nil) == nil)
	t[0][0] = 100
	fmt.Println(m[0][0])
}
`,
    checks: [
      { on: "stdout", name: "newMatrix(2, 3) дає [[0 1 2] [3 4 5]]", has: "[[0 1 2] [3 4 5]]", hint: "m[i][j] = i*cols + j у вкладених циклах" },
      { on: "stdout", name: "Транспонована: [[0 3] [1 4] [2 5]]", has: "[[0 3] [1 4] [2 5]]", hint: "Нова таблиця має len(m[0]) рядків по len(m) елементів" },
      { on: "stdout", name: "Розміри 3 2 і nil для порожньої: true", has: "3 2 true", hint: "Спершу if len(m) == 0 { return nil }" },
      { on: "stdout", name: "Оригінал не змінився після запису в копію: 0", has: "true\n0", hint: "Створіть нові рядки, не використовуйте рядки m" },
      { on: "source", name: "Рядки створюються через make", matches: "make\\(\\[\\]int", hint: "m[i] = make([]int, cols)" },
      { on: "stdout", name: "Рівно чотири рядки виводу", equals: "[[0 1 2] [3 4 5]]\n[[0 3] [1 4] [2 5]]\n3 2 true\n0" },
    ],
  },
  {
    ...base, id: "go-map-basics", lesson: "go/25", xp: 20,
    title: "Мапа цін: наявність ключа й видалення",
    context: "У кеші, конфігурації чи каталозі товарів постійно запитують «чи є такий ключ?». Відрізнити відсутній ключ від ключа з нульовим значенням можна лише через comma-ok.",
    brief: [
      "Допишіть <code>describe(m map[string]int, key string) string</code>: якщо ключ є, поверніть <code>\"ключ=значення\"</code> (навіть коли значення 0), інакше <code>\"ключ відсутній\"</code>. Скористайтеся формою <code>v, ok := m[key]</code>.",
      "Допишіть <code>remove(m map[string]int, keys ...string)</code>: видаліть усі вказані ключі через <code>delete</code>.",
    ],
    starter: raw`package main

import "fmt"

func describe(m map[string]int, key string) string {
	// TODO: comma-ok
	return ""
}

func remove(m map[string]int, keys ...string) {
	// TODO: delete для кожного ключа
}

func main() {
	m := map[string]int{"яблуко": 5, "груша": 0, "слива": 3}
	fmt.Println(describe(m, "груша"))
	fmt.Println(describe(m, "ківі"))
	remove(m, "яблуко", "ківі")
	fmt.Println(m, len(m))
}
`,
    checks: [
      { on: "stdout", name: "Нульове значення відрізняється від відсутнього ключа: груша=0", has: "груша=0", hint: "Змінна ok показує, чи є ключ, незалежно від значення" },
      { on: "stdout", name: "Відсутній ключ: ківі відсутній", has: "ківі відсутній" },
      { on: "stdout", name: "Після видалення: map[груша:0 слива:3] 2", has: "map[груша:0 слива:3] 2", hint: "delete(m, k) для кожного k; видалення неіснуючого ключа безпечне" },
      { on: "source", name: "Використано comma-ok", matches: ",\\s*ok\\s*:?=", hint: "v, ok := m[key]" },
      { on: "source", name: "Використано delete", has: "delete(" },
      { on: "stdout", name: "Рівно три рядки виводу", equals: "груша=0\nківі відсутній\nmap[груша:0 слива:3] 2" },
    ],
  },
  {
    ...base, id: "go-set-group", lesson: "go/26", xp: 25,
    title: "Множина й групування слів",
    context: "Порахувати унікальні значення й розкласти елементи по групах — типова робота з даними: унікальні відвідувачі, замовлення за клієнтом, файли за розширенням.",
    brief: [
      "Допишіть <code>distinct(words []string) int</code>: поверніть кількість унікальних слів. Побудуйте множину на <code>map[string]struct{}</code>.",
      "Допишіть <code>groupByLen(words []string) map[int][]string</code>: розкладіть слова за довжиною (у байтах, <code>len(w)</code>), зберігаючи порядок появи.",
    ],
    starter: raw`package main

import "fmt"

func distinct(words []string) int {
	// TODO: множина map[string]struct{}
	return 0
}

func groupByLen(words []string) map[int][]string {
	// TODO: groups[len(w)] = append(...)
	return nil
}

func main() {
	words := []string{"go", "is", "fun", "go", "and", "fast", "is"}
	fmt.Println(distinct(words))
	fmt.Println(groupByLen(words))
	fmt.Println(len(groupByLen(nil)))
}
`,
    checks: [
      { on: "stdout", name: "Унікальних слів 5", has: "5\n", hint: "Додавайте слова в множину й повертайте len(set)" },
      { on: "stdout", name: "Групи за довжиною", has: "map[2:[go is go is] 3:[fun and] 4:[fast]]", hint: "groups[n] = append(groups[n], w): для нового ключа append почне з nil-слайса" },
      { on: "stdout", name: "Для порожнього вводу груп немає: 0", has: "\n0", hint: "Не повертайте nil-мапу, яку потім пишуть: створіть мапу через make" },
      { on: "source", name: "Множина на map[string]struct{}", matches: "map\\[string\\]struct\\{\\}", hint: "set := map[string]struct{}{}" },
      { on: "stdout", name: "Рівно три рядки виводу", equals: "5\nmap[2:[go is go is] 3:[fun and] 4:[fast]]\n0" },
    ],
  },
  {
    ...base, id: "go-range-all", lesson: "go/27", xp: 25,
    title: "range: ключі мапи й символи рядка",
    context: "Обхід мапи дає випадковий порядок, а рядок із кирилицею має більше байтів, ніж символів. Обидва факти ламають наївний код, тому звіти й підрахунки будують через відсортовані ключі та range по рунах.",
    brief: [
      "Допишіть <code>sortedKeys(m map[string]int) []string</code>: поверніть ключі мапи за алфавітом. Обійдіть мапу через <code>range</code>, а потім відсортуйте слайс (<code>sort.Strings</code>).",
      "Допишіть <code>countRunes(s string) int</code>: порахуйте символи рядка (не байти!) через <code>for range</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sort"
)

func sortedKeys(m map[string]int) []string {
	// TODO: збір ключів у слайс і сортування
	_ = sort.Strings
	return nil
}

func countRunes(s string) int {
	// TODO: range по рядку
	return len(s)
}

func main() {
	stock := map[string]int{"яблуко": 5, "груша": 0, "слива": 3, "ківі": 8}
	for _, k := range sortedKeys(stock) {
		fmt.Println(k, stock[k])
	}
	text := "Привіт, світе"
	fmt.Println(len(text), countRunes(text))
}
`,
    checks: [
      { on: "stdout", name: "Ключі за алфавітом: груша, яблуко, ківі, слива", has: "груша 0\nківі 8\nслива 3\nяблуко 5", hint: "Зберіть ключі в слайс і викличте sort.Strings перед циклом виводу" },
      { on: "stdout", name: "Байтів 24, символів 13", has: "24 13", hint: "Рахуйте кроки range: він іде по рунах" },
      { on: "source", name: "Використано range", has: "range" },
      { on: "source", name: "Ключі сортуються", matches: "sort\\.Strings\\(|slices\\.Sort\\(" },
      { on: "stdout", name: "Рівно п'ять рядків виводу", equals: "груша 0\nківі 8\nслива 3\nяблуко 5\n24 13" },
    ],
  },
  {
    ...base, id: "go-sorting", lesson: "go/28", xp: 25,
    title: "Сортування: за спаданням і за двома критеріями",
    context: "Сортування «за кількома полями» (спершу за довжиною, потім за алфавітом) і без псування вхідних даних потрібне щоразу, коли ви готуєте список для користувача чи для звіту.",
    brief: [
      "Допишіть <code>sortedDesc(nums []int) []int</code>: поверніть <b>новий</b> слайс, відсортований за спаданням. Вхідний лишається без змін.",
      "Допишіть <code>byLenThenAlpha(words []string) []string</code>: поверніть новий слайс, відсортований за довжиною, а за однакової довжини за алфавітом.",
    ],
    starter: raw`package main

import "fmt"

func sortedDesc(nums []int) []int {
	// TODO: копія + сортування за спаданням
	return nums
}

func byLenThenAlpha(words []string) []string {
	// TODO: копія + порівняння за двома критеріями
	return words
}

func main() {
	nums := []int{5, 2, 9, 2, 7}
	fmt.Println(sortedDesc(nums), nums)
	words := []string{"pear", "fig", "apple", "kiwi", "date", "banana", "plum"}
	fmt.Println(byLenThenAlpha(words))
	fmt.Println(words)
}
`,
    checks: [
      { on: "stdout", name: "За спаданням, вхідний цілий", has: "[9 7 5 2 2] [5 2 9 2 7]", hint: "Clone, потім sort.Slice з > або slices.SortFunc із cmp.Compare(b, a)" },
      { on: "stdout", name: "Спершу за довжиною, потім за алфавітом", has: "[fig date kiwi pear plum apple banana]", hint: "Якщо довжини рівні, порівняйте самі рядки" },
      { on: "stdout", name: "Вхідний слайс слів не змінено", has: "[pear fig apple kiwi date banana plum]" },
      { on: "source", name: "Використано sort або slices для сортування", matches: "sort\\.Slice|slices\\.Sort|sort\\.Sort" },
      { on: "stdout", name: "Рівно три рядки виводу", equals: "[9 7 5 2 2] [5 2 9 2 7]\n[fig date kiwi pear plum apple banana]\n[pear fig apple kiwi date banana plum]" },
    ],
  },
  // NEXT
];
