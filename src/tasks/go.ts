// Практичні завдання курсу Go: по одному на кожен із 11 уроків. Запускаються на сервері (runtime: "remote"),
// результат перевіряється за stdout і кодом (checks). Еталонні рішення лежать у tests/solutions.mjs.
// Правило заготовок: де можливо, main уже написаний і не змінюється, користувач дописує функцію або тип.
import type { RemoteTask } from "./types.ts";

const raw = String.raw;
const BT = "`";   // зворотний апостроф для тегів структур (у String.raw його не можна екранувати)
const base = { course: "go", runtime: "remote", lang: "go", file: "main.go", editorLang: "go", premium: false } as const;

export const GO_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "go-hello-module", lesson: "go/1", xp: 15,
    title: "Перша програма модуля hello",
    context: "Будь-який сервіс на Go починається з файлу main.go: пакет main і функція main. Саме з неї запускається програма, і саме її ви напишете першою в кожному проєкті.",
    brief: [
      "Програма має вивести два рядки: <code>Привіт, Go!</code> і <code>Модуль: example.com/hello</code>.",
      "Використайте <code>fmt.Println</code>. Натисніть «Запустити», код виконається на сервері, а результат з'явиться в терміналі.",
    ],
    starter: raw`package main

import "fmt"

func main() {
	// Виведіть два рядки: Привіт, Go! і Модуль: example.com/hello
	fmt.Println()
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, Go!»", has: "Привіт, Go!" },
      { on: "stdout", name: "Виводить «Модуль: example.com/hello»", has: "Модуль: example.com/hello" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, Go!\nМодуль: example.com/hello" },
    ],
  },
  {
    ...base, id: "go-first-program", lesson: "go/2", xp: 15,
    title: "Прості обчислення у виводі",
    context: "Програма не друкує готові відповіді, а обчислює їх. Навіть у найпростіших скриптах (ціна з податком, сума замовлення) спершу вираз, потім вивід.",
    brief: [
      "Виведіть першим рядком <code>2 + 3 = 5</code>, обчисливши суму виразом (<code>fmt.Println(\"2 + 3 =\", 2+3)</code>).",
      "Другим рядком виведіть значення виразу <code>(8 + 4) * 3</code>, лише число.",
    ],
    starter: raw`package main

import "fmt"

func main() {
	fmt.Println("Привіт, світе!")
	// TODO: виведіть 2 + 3 = 5 і результат (8 + 4) * 3
}
`,
    checks: [
      { on: "stdout", name: "Рядок «2 + 3 = 5»", has: "2 + 3 = 5" },
      { on: "stdout", name: "Результат (8 + 4) * 3 дорівнює 36", has: "36" },
      { on: "stdout", name: "Виводить лише два рядки", equals: "2 + 3 = 5\n36", hint: "Рядок «Привіт, світе!» із заготовки треба прибрати" },
    ],
  },
  {
    ...base, id: "go-order-total", lesson: "go/3", xp: 20,
    title: "Сума замовлення і типи",
    context: "Гроші й кількість майже завжди мають різні типи (дробове число і ціле). Go не змішує їх мовчки, а вимагає явного перетворення. Це рятує від тихих помилок у розрахунках.",
    brief: [
      "У заготовці ціна <code>price</code> має тип <code>float64</code>, кількість <code>qty</code> — <code>int</code>, і код не компілюється. Прочитайте помилку в терміналі й виправте її явним перетворенням типу.",
      "Виведіть <code>Разом: 599.97</code> (два знаки після коми), а наступним рядком типи змінних через <code>%T</code>: <code>float64 int</code>.",
    ],
    starter: raw`package main

import "fmt"

func main() {
	price := 199.99
	qty := 3
	fmt.Printf("Разом: %.2f\n", price*qty)
	// TODO: наступним рядком виведіть типи price і qty через %T
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 599.97»", has: "Разом: 599.97" },
      { on: "stdout", name: "Типи: float64 int", has: "float64 int" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 599.97\nfloat64 int" },
      { on: "source", name: "Є явне перетворення float64(…)", matches: "float64\\(\\s*qty\\s*\\)", hint: "Помножте price на float64(qty)" },
    ],
  },
  {
    ...base, id: "go-sum-product", lesson: "go/4", xp: 20,
    title: "Функція з двома результатами і цикл",
    context: "Функції в Go часто повертають кілька значень (результат і помилку, пару чисел). А цикл for — єдиний цикл мови, його вистачає на все.",
    brief: [
      "Допишіть функцію <code>sumAndProduct(a, b int) (int, int)</code>: вона повертає суму й добуток двох чисел.",
      "У <code>main</code> у циклі <code>for</code> виведіть парні числа від 1 до 20 в одному рядку через пробіл.",
    ],
    starter: raw`package main

import "fmt"

func sumAndProduct(a, b int) (int, int) {
	// TODO: поверніть суму й добуток
	return 0, 0
}

func main() {
	s, p := sumAndProduct(6, 7)
	fmt.Println("Сума:", s, "Добуток:", p)
	// TODO: у циклі for виведіть парні числа від 1 до 20 через пробіл в одному рядку
}
`,
    checks: [
      { on: "stdout", name: "Сума й добуток: 13 і 42", has: "Сума: 13 Добуток: 42" },
      { on: "stdout", name: "Парні числа від 2 до 20 в одному рядку", has: "2 4 6 8 10 12 14 16 18 20" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сума: 13 Добуток: 42\n2 4 6 8 10 12 14 16 18 20" },
      { on: "source", name: "Використано цикл for", matches: "\\bfor\\b" },
    ],
  },
  {
    ...base, id: "go-filter-evens", lesson: "go/5", xp: 25,
    title: "Фільтр парних чисел у слайсі",
    context: "Слайси — основний спосіб працювати зі списками даних: рядки таблиці, id із запиту, результати пошуку. Відфільтрувати й підсумувати слайс доводиться щодня.",
    brief: [
      "Допишіть <code>sum(nums []int) int</code> і <code>evens(nums []int) []int</code>: друга повертає новий слайс лише з парних чисел (у тому ж порядку).",
      "Підказка: наповнюйте результат через <code>append</code>.",
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
	fmt.Println("Сума:", sum(nums))
	fmt.Println("Парні:", evens(nums))
	fmt.Println("Скільки парних:", len(evens(nums)))
}
`,
    checks: [
      { on: "stdout", name: "Сума всіх чисел дорівнює 48", has: "Сума: 48" },
      { on: "stdout", name: "Парні: [2 4 10 8]", has: "Парні: [2 4 10 8]" },
      { on: "stdout", name: "Кількість парних дорівнює 4", has: "Скільки парних: 4" },
      { on: "source", name: "Слайс наповнюється через append", has: "append(" },
    ],
  },
  {
    ...base, id: "go-word-count", lesson: "go/6", xp: 30,
    title: "Частота слів і структура товару",
    context: "Підрахунок у мапі (скільки разів зустрівся ключ) і структури для опису сутностей (товар, користувач, замовлення) — основа майже будь-якого бекенду.",
    brief: [
      "Допишіть <code>wordCount(text string) map[string]int</code>: порахуйте, скільки разів кожне слово зустрічається в тексті (слова розділені пробілами, підійде <code>strings.Fields</code>, не забудьте додати <code>\"strings\"</code> в імпорти).",
      "Опишіть структуру <code>Product</code> з полями <code>Name string</code> і <code>Price float64</code>. Поки її немає, код не компілюється.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sort"
)

// TODO 1: опишіть структуру Product з полями Name (string) і Price (float64)

// TODO 2: порахуйте, скільки разів зустрічається кожне слово
func wordCount(text string) map[string]int {
	return nil
}

func main() {
	counts := wordCount("go is fun and go is fast")
	words := make([]string, 0, len(counts))
	for w := range counts {
		words = append(words, w)
	}
	sort.Strings(words)
	for _, w := range words {
		fmt.Println(w, counts[w])
	}

	products := []Product{{"Хліб", 25.5}, {"Молоко", 42}, {"Сир", 180}}
	fmt.Printf("%+v\n", products)
}
`,
    checks: [
      { on: "stdout", name: "Слово go зустрічається двічі", has: "go 2" },
      { on: "stdout", name: "Підрахунок усіх слів правильний", has: "and 1\nfast 1\nfun 1\ngo 2\nis 2" },
      { on: "stdout", name: "Товари виводяться з іменами полів", has: "[{Name:Хліб Price:25.5} {Name:Молоко Price:42} {Name:Сир Price:180}]" },
      { on: "source", name: "Описано структуру Product", matches: "type\\s+Product\\s+struct" },
    ],
  },
  {
    ...base, id: "go-animals-interface", lesson: "go/7", xp: 30,
    title: "Інтерфейс Animal і метод із вказівником",
    context: "Інтерфейси дозволяють писати код, якому байдуже, що саме перед ним: база даних чи файл, платіжна система А чи Б. Методи з вказівником змінюють стан об'єкта, а не його копії.",
    brief: [
      "Реалізуйте метод <code>Speak() string</code> для <code>Dog</code> (повертає <code>Рекс: гав!</code>, використайте поле <code>Name</code>) і для <code>Cat</code> (<code>Мурка: няв!</code>).",
      "Додайте до <code>Counter</code> метод <code>Inc()</code> з отримувачем-вказівником <code>*Counter</code>, що збільшує поле <code>n</code> на 1.",
    ],
    starter: raw`package main

import "fmt"

type Animal interface {
	Speak() string
}

type Dog struct{ Name string }
type Cat struct{ Name string }

// TODO: методи Speak для Dog і Cat (формат: "<Name>: гав!" і "<Name>: няв!")

type Counter struct{ n int }

// TODO: метод Inc з вказівником, що збільшує n на 1

func main() {
	animals := []Animal{Dog{"Рекс"}, Cat{"Мурка"}}
	for _, a := range animals {
		fmt.Println(a.Speak())
	}
	var c Counter
	c.Inc()
	c.Inc()
	c.Inc()
	fmt.Println("Лічильник:", c.n)
}
`,
    checks: [
      { on: "stdout", name: "Пес говорить «Рекс: гав!»", has: "Рекс: гав!" },
      { on: "stdout", name: "Кіт говорить «Мурка: няв!»", has: "Мурка: няв!" },
      { on: "stdout", name: "Лічильник дорівнює 3", has: "Лічильник: 3" },
      { on: "source", name: "Inc має отримувач-вказівник", matches: "func\\s*\\(\\s*\\w+\\s+\\*Counter\\s*\\)\\s*Inc", hint: "Запис виду func (c *Counter) Inc()" },
    ],
  },
  {
    ...base, id: "go-errors-defer", lesson: "go/8", xp: 35,
    title: "Помилка ділення і defer",
    context: "У Go помилки це звичайні значення, які функція повертає останнім результатом. Їх перевіряють на кожному кроці. А defer гарантує, що ресурс (файл, з'єднання) закриється, чим би не закінчилась функція.",
    brief: [
      "Допишіть <code>divide(a, b float64) (float64, error)</code>: при діленні на нуль поверніть готову помилку <code>ErrDivByZero</code>.",
      "У функції <code>process</code> додайте <code>defer fmt.Println(\"завершення\")</code> так, щоб рядок надрукувався останнім, після «робота».",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

var ErrDivByZero = errors.New("ділення на нуль")

func divide(a, b float64) (float64, error) {
	// TODO: при b == 0 поверніть ErrDivByZero
	return a / b, nil
}

func process() {
	// TODO: додайте defer fmt.Println("завершення")
	fmt.Println("початок")
	fmt.Println("робота")
}

func main() {
	process()
	if res, err := divide(10, 4); err == nil {
		fmt.Println("10 / 4 =", res)
	}
	_, err := divide(1, 0)
	if errors.Is(err, ErrDivByZero) {
		fmt.Println("помилка:", err)
	}
	wrapped := fmt.Errorf("обчислення звіту: %w", err)
	fmt.Println(wrapped)
	fmt.Println(errors.Is(wrapped, ErrDivByZero))
}
`,
    checks: [
      { on: "stdout", name: "defer спрацьовує останнім у process", has: "початок\nробота\nзавершення" },
      { on: "stdout", name: "Звичайне ділення: 10 / 4 = 2.5", has: "10 / 4 = 2.5" },
      { on: "stdout", name: "Ділення на нуль повертає ErrDivByZero", has: "помилка: ділення на нуль" },
      { on: "stdout", name: "Обгорнута помилка все ще розпізнається (true)", has: "обчислення звіту: ділення на нуль\ntrue" },
      { on: "source", name: "Використано defer", matches: "\\bdefer\\s" },
    ],
  },
  {
    ...base, id: "go-sum-squares", lesson: "go/9", xp: 35,
    title: "Квадрати в горутинах",
    context: "Горутини дозволяють робити багато справ одночасно: обробляти запити, завантажувати файли. Головне, щоб головна програма дочекалась їх і зібрала результати.",
    brief: [
      "Допишіть <code>square</code>: функція має порахувати <code>n*n</code>, надіслати результат у канал <code>ch</code> і повідомити <code>WaitGroup</code>, що закінчила (<code>wg.Done()</code>, зручно через <code>defer</code>).",
      "Поки <code>wg.Done()</code> не викликається, програма зависає: Go сам помітить це і зупинить її з помилкою deadlock.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
)

func square(n int, wg *sync.WaitGroup, ch chan<- int) {
	// TODO: надішліть n*n у ch і викличте wg.Done()
}

func main() {
	var wg sync.WaitGroup
	ch := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go square(i, &wg, ch)
	}
	wg.Wait()
	close(ch)

	sum := 0
	for v := range ch {
		sum += v
	}
	fmt.Println("Сума квадратів:", sum)
}
`,
    checks: [
      { on: "stdout", name: "Сума квадратів 1…5 дорівнює 55", has: "Сума квадратів: 55" },
      { on: "source", name: "Викликається wg.Done()", matches: "wg\\.Done\\(\\)" },
      { on: "source", name: "Результат надсилається в канал", matches: "ch\\s*<-" },
    ],
  },
  {
    ...base, id: "go-get-task-handler", lesson: "go/10", xp: 40,
    title: "Обробник GET /task?id= із JSON",
    context: "Типовий ендпоінт REST API: взяти параметр із запиту, знайти запис, віддати JSON або чесну помилку 404. У пісочниці немає мережі, тому обробник викликається напряму через httptest, так само працюють справжні тести серверів.",
    brief: [
      "Допишіть <code>getTask</code>: прочитайте <code>id</code> з <code>r.URL.Query()</code>, знайдіть задачу в <code>tasks</code> і віддайте її як JSON із заголовком <code>Content-Type: application/json</code>.",
      "Якщо id некоректний або задачі немає, відповідайте <code>http.Error(w, \"Задачу не знайдено\", http.StatusNotFound)</code>. Для перетворення рядка в число підключіть <code>strconv</code>.",
    ],
    starter: raw`package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

type Task struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
	Done  bool   ${BT}json:"done"${BT}
}

var tasks = []Task{{1, "Вивчити Go", false}, {2, "Написати сервер", true}}

// TODO: поверніть JSON однієї задачі за ?id= або 404
func getTask(w http.ResponseWriter, r *http.Request) {
	_ = json.NewEncoder(w)
}

func main() {
	// Сервер не запускаємо (в пісочниці немає мережі): httptest викликає обробник напряму
	for _, url := range []string{"/task?id=2", "/task?id=9"} {
		req := httptest.NewRequest("GET", url, nil)
		rec := httptest.NewRecorder()
		getTask(rec, req)
		fmt.Println(rec.Code, rec.Header().Get("Content-Type"), strings.TrimSpace(rec.Body.String()))
	}
}
`,
    checks: [
      { on: "stdout", name: "Знайдену задачу віддано як JSON зі статусом 200", has: '200 application/json {"id":2,"title":"Написати сервер","done":true}' },
      { on: "stdout", name: "Для відсутньої задачі статус 404 і повідомлення", has: "404 text/plain; charset=utf-8 Задачу не знайдено" },
      { on: "source", name: "Id читається з параметра запиту", has: "Query()" },
    ],
  },
  {
    ...base, id: "go-table-test", lesson: "go/11", xp: 40,
    title: "Табличний тест і виправлення помилки",
    context: "Табличний тест — головний стиль тестів у Go: таблиця випадків і цикл по ній. Нова помилка = новий рядок у таблиці. Тут ви напишете такий цикл самі й знайдете за його допомогою баг.",
    brief: [
      "У <code>main</code> пройдіть по таблиці <code>tests</code>. Для кожного випадку викличте <code>IsEven(tt.n)</code>: якщо збігається з <code>tt.want</code>, виведіть <code>ok   &lt;назва&gt;</code> і збільште <code>passed</code>, інакше <code>FAIL &lt;назва&gt;: отримано &lt;got&gt;, очікувалось &lt;want&gt;</code>.",
      "Один випадок спочатку не пройде: у <code>IsEven</code> є помилка з від'ємними числами. Знайдіть її за виводом тесту й виправте, щоб підсумок став «Пройдено 5 з 5».",
    ],
    starter: raw`package main

import "fmt"

// IsEven повідомляє, чи парне число. У ній є помилка: знайдіть її за допомогою таблиці
func IsEven(n int) bool {
	return n%2 != 1
}

type testCase struct {
	name string
	n    int
	want bool
}

func main() {
	tests := []testCase{
		{"нуль", 0, true},
		{"парне", 10, true},
		{"непарне", 7, false},
		{"від'ємне парне", -4, true},
		{"від'ємне непарне", -3, false},
	}
	passed := 0
	// TODO: пройдіть по таблиці tests (for _, tt := range tests) і виведіть ok або FAIL для кожного випадку,
	// збільшуйте passed, коли результат збігається з очікуваним

	fmt.Printf("Пройдено %d з %d\n", passed, len(tests))
}
`,
    checks: [
      { on: "stdout", name: "Кожен випадок виводиться як ok", has: "ok   нуль\nok   парне\nok   непарне\nok   від'ємне парне\nok   від'ємне непарне" },
      { on: "stdout", name: "Підсумок: Пройдено 5 з 5", has: "Пройдено 5 з 5" },
      { on: "stdout", name: "Жодного FAIL", has: "FAIL", not: true },
      { on: "source", name: "Цикл по таблиці", matches: "range\\s+tests" },
    ],
  },
];
