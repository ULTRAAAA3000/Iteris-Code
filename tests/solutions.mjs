// Еталонні рішення завдань. Використовуються лише в тестах і НЕ потрапляють у збірку сайту.
const BASE = {
  "js-safe-city": `function getCity(user) {
  return user?.address?.city || "Невідомо";
}`,
  "js-counter-bug": `function makeCounter() {
  let count = 0;
  return {
    inc() { count++; return count; },
    get() { return count; },
    reset() { count = 0; },
  };
}`,
  "js-cart-total": `function calculateTotal(items) {
  const sum = items
    .filter((i) => i.inStock !== false)
    .reduce((s, i) => s + i.price * (i.qty ?? 1), 0);
  return Math.round(sum * 100) / 100;
}`,
  "js-group-by": `function groupBy(list, key) {
  const out = {};
  for (const item of list) {
    if (!(key in item)) continue;
    (out[item[key]] ??= []).push(item);
  }
  return out;
}`,
  "js-retry": `async function retry(fn, attempts) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new RangeError("attempts має бути цілим числом ≥ 1");
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(i); } catch (e) { lastError = e; }
  }
  throw lastError;
}`,
  // Go: повні програми (віддалені завдання). Перевіряються в tests/go-tasks.test.mjs
  "go-hello-module": `package main

import "fmt"

func main() {
	fmt.Println("Привіт, Go!")
	fmt.Println("Модуль: example.com/hello")
}
`,
  "go-first-program": `package main

import "fmt"

func main() {
	fmt.Println("2 + 3 =", 2+3)
	fmt.Println((8 + 4) * 3)
}
`,
  "go-order-total": `package main

import "fmt"

func main() {
	price := 199.99
	qty := 3
	fmt.Printf("Разом: %.2f\\n", price*float64(qty))
	fmt.Printf("%T %T\\n", price, qty)
}
`,
  "go-sum-product": `package main

import "fmt"

func sumAndProduct(a, b int) (int, int) {
	return a + b, a * b
}

func main() {
	s, p := sumAndProduct(6, 7)
	fmt.Println("Сума:", s, "Добуток:", p)
	for i := 2; i <= 20; i += 2 {
		fmt.Print(i, " ")
	}
	fmt.Println()
}
`,
  "go-filter-evens": `package main

import "fmt"

func sum(nums []int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func evens(nums []int) []int {
	var out []int
	for _, n := range nums {
		if n%2 == 0 {
			out = append(out, n)
		}
	}
	return out
}

func main() {
	nums := []int{5, 2, 9, 7, 4, 10, 3, 8}
	fmt.Println("Сума:", sum(nums))
	fmt.Println("Парні:", evens(nums))
	fmt.Println("Скільки парних:", len(evens(nums)))
}
`,
  "go-word-count": `package main

import (
	"fmt"
	"sort"
	"strings"
)

type Product struct {
	Name  string
	Price float64
}

func wordCount(text string) map[string]int {
	counts := map[string]int{}
	for _, w := range strings.Fields(text) {
		counts[w]++
	}
	return counts
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
	fmt.Printf("%+v\\n", products)
}
`,
  "go-animals-interface": `package main

import "fmt"

type Animal interface {
	Speak() string
}

type Dog struct{ Name string }
type Cat struct{ Name string }

func (d Dog) Speak() string { return d.Name + ": гав!" }
func (c Cat) Speak() string { return c.Name + ": няв!" }

type Counter struct{ n int }

func (c *Counter) Inc() { c.n++ }

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
  "go-errors-defer": `package main

import (
	"errors"
	"fmt"
)

var ErrDivByZero = errors.New("ділення на нуль")

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivByZero
	}
	return a / b, nil
}

func process() {
	defer fmt.Println("завершення")
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
  "go-sum-squares": `package main

import (
	"fmt"
	"sync"
)

func square(n int, wg *sync.WaitGroup, ch chan<- int) {
	defer wg.Done()
	ch <- n * n
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
  "go-get-task-handler": `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
)

type Task struct {
	ID    int    ${"`"}json:"id"${"`"}
	Title string ${"`"}json:"title"${"`"}
	Done  bool   ${"`"}json:"done"${"`"}
}

var tasks = []Task{{1, "Вивчити Go", false}, {2, "Написати сервер", true}}

func getTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err == nil {
		for _, t := range tasks {
			if t.ID == id {
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(t)
				return
			}
		}
	}
	http.Error(w, "Задачу не знайдено", http.StatusNotFound)
}

func main() {
	for _, url := range []string{"/task?id=2", "/task?id=9"} {
		req := httptest.NewRequest("GET", url, nil)
		rec := httptest.NewRecorder()
		getTask(rec, req)
		fmt.Println(rec.Code, rec.Header().Get("Content-Type"), strings.TrimSpace(rec.Body.String()))
	}
}
`,
  "go-table-test": `package main

import "fmt"

func IsEven(n int) bool {
	return n%2 == 0
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
	for _, tt := range tests {
		if got := IsEven(tt.n); got == tt.want {
			fmt.Println("ok  ", tt.name)
			passed++
		} else {
			fmt.Printf("FAIL %s: отримано %v, очікувалось %v\\n", tt.name, got, tt.want)
		}
	}
	fmt.Printf("Пройдено %d з %d\\n", passed, len(tests))
}
`,
};

// Еталони віддалених завдань лежать окремо по мовах: tests/solutions/<мова>.mjs
import { CPP } from "./solutions/cpp.mjs";
import { JAVA } from "./solutions/java.mjs";
import { JS } from "./solutions/js.mjs";
import { PASCAL } from "./solutions/pascal.mjs";
import { PHP } from "./solutions/php.mjs";
import { PYTHON } from "./solutions/python.mjs";
import { TS } from "./solutions/ts.mjs";

export const SOLUTIONS = { ...BASE, ...PYTHON, ...JAVA, ...CPP, ...PHP, ...PASCAL, ...TS, ...JS };

// Еталонні рішення проєктів за ТЗ (HTML, CSS і JS в одному файлі)
export const PROJECT_SOLUTIONS = {
  "js-todo": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Список справ</title>
  <style>
    body { font-family: sans-serif; max-width: 420px; margin: 24px auto; padding: 0 16px; }
    ul { list-style: none; padding: 0; }
    li { display: flex; justify-content: space-between; gap: 8px; padding: 6px 0; cursor: pointer; }
    li.done span { text-decoration: line-through; color: #888; }
  </style>
</head>
<body>
  <h1>Список справ</h1>
  <input id="task-input" type="text" placeholder="Нова справа">
  <button id="add-btn">Додати</button>
  <ul id="task-list"></ul>
  <p id="counter">Залишилось: 0</p>
  <script>
    const input = document.getElementById("task-input");
    const list = document.getElementById("task-list");
    const counter = document.getElementById("counter");
    const update = () => { counter.textContent = "Залишилось: " + list.querySelectorAll("li:not(.done)").length; };
    document.getElementById("add-btn").addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;
      const li = document.createElement("li");
      const span = document.createElement("span");
      const del = document.createElement("button");
      span.textContent = value;
      del.textContent = "×";
      del.className = "del";
      li.append(span, del);
      list.append(li);
      input.value = "";
      update();
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      if (e.target.closest(".del")) li.remove(); else li.classList.toggle("done");
      update();
    });
  </script>
</body>
</html>
`,
};
