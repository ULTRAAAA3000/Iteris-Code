import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "go-goroutine-cubes", lesson: "go/59", xp: 20,
    title: "Куби в горутинах",
    context: "Сервер не обслуговує клієнтів по черзі: кожен запит отримує свою горутину. Але main має дочекатися їх, інакше програма закриється раніше, ніж горутини щось зроблять.",
    brief: [
      "Допишіть <code>cube</code>: після запису результату в <code>res[i]</code> вона має повідомити main, надіславши <code>struct{}{}</code> у канал <code>done</code>.",
      "У <code>main</code> виклик <code>cube</code> зараз виконується в самій main і тому зависає. Запустіть кожен виклик як горутину через <code>go</code>. Кожна горутина пише лише у свою комірку, тож гонки немає.",
    ],
    starter: raw`package main

import "fmt"

func cube(i int, res []int, done chan<- struct{}) {
	res[i] = i * i * i
	// TODO: повідомте main, що ця горутина закінчила
}

func main() {
	const n = 5
	res := make([]int, n)
	done := make(chan struct{})
	for i := range n {
		cube(i, res, done)
	}
	for range n {
		<-done
	}
	fmt.Println(res)
}
`,
    checks: [
      { on: "stdout", name: "Усі куби пораховано", has: "[0 1 8 27 64]", hint: "Програма має дійти до Println: горутини повинні надсилати у done" },
      { on: "source", name: "cube запускається як горутина", matches: "\\bgo\\s+cube\\(", hint: "go cube(i, res, done)" },
      { on: "source", name: "Горутина сповіщає main через канал", matches: "done\\s*<-\\s*struct\\s*\\{\\s*\\}\\s*\\{\\s*\\}", hint: "done <- struct{}{}" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "[0 1 8 27 64]" },
    ],
  },
  {
    ...base, id: "go-chan-halves", lesson: "go/60", xp: 25,
    title: "Сума двох половин через канали",
    context: "Канал дозволяє горутині повернути результат тому, хто її запустив. Так велику роботу ділять на частини: кожна горутина рахує своє, а головна збирає відповіді.",
    brief: [
      "Допишіть <code>sum(nums []int, out chan int)</code>: порахуйте суму елементів і надішліть її в <code>out</code>.",
      "Нічого більше змінювати не треба: <code>main</code> ділить слайс навпіл, запускає по горутині на половину й чекає відповіді на двох окремих каналах, тому порядок виводу завжди однаковий.",
    ],
    starter: raw`package main

import "fmt"

func sum(nums []int, out chan int) {
	total := 0
	for _, n := range nums {
		total += n
	}
	// TODO: надішліть total у канал out
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8}
	half := len(nums) / 2
	left := make(chan int)
	right := make(chan int)
	go sum(nums[:half], left)
	go sum(nums[half:], right)
	l := <-left
	r := <-right
	fmt.Println("ліва:", l)
	fmt.Println("права:", r)
	fmt.Println("разом:", l+r)
}
`,
    checks: [
      { on: "stdout", name: "Сума лівої половини", has: "ліва: 10", hint: "Результат треба надіслати: out <- total" },
      { on: "stdout", name: "Сума правої половини", has: "права: 26" },
      { on: "stdout", name: "Загальна сума", has: "разом: 36" },
      { on: "source", name: "Є надсилання в канал", matches: "out\\s*<-\\s*total", hint: "out <- total" },
      { on: "source", name: "Використано канал і горутини", matches: "chan\\s+int[\\s\\S]*go\\s+sum", hint: "Заготовка вже містить chan int і go sum, не видаляйте їх" },
    ],
  },
  {
    ...base, id: "go-buffered-queue", lesson: "go/61", xp: 20,
    title: "Черга замовлень у буфері",
    context: "Буферизований канал працює як черга між тим, хто створює роботу, і тим, хто її виконує. Ємність буфера визначає, скільки замовлень можна прийняти, не чекаючи виконавця.",
    brief: [
      "У <code>main</code> три замовлення надсилаються в канал, а виконавця ще немає, тому з небуферизованим каналом програма зависає. Створіть канал із буфером на 3 елементи.",
      "Решта коду вже готова: вона друкує <code>len</code> і <code>cap</code> і забирає замовлення в порядку надходження (FIFO).",
    ],
    starter: raw`package main

import "fmt"

func main() {
	queue := make(chan string)
	queue <- "кава"
	queue <- "чай"
	queue <- "какао"
	fmt.Println("у черзі:", len(queue), "з", cap(queue))
	fmt.Println("видано:", <-queue)
	fmt.Println("залишилось:", len(queue))
	fmt.Println("видано:", <-queue)
	fmt.Println("видано:", <-queue)
	fmt.Println("залишилось:", len(queue))
}
`,
    checks: [
      { on: "stdout", name: "Буфер вміщає три замовлення", has: "у черзі: 3 з 3", hint: "Другим аргументом make задайте ємність: make(chan string, 3)" },
      { on: "stdout", name: "Замовлення видаються за чергою", has: "видано: кава\nзалишилось: 2\nвидано: чай\nвидано: какао\nзалишилось: 0" },
      { on: "source", name: "Канал має буфер", matches: "make\\(\\s*chan\\s+string\\s*,\\s*3\\s*\\)", hint: "make(chan string, 3)" },
      { on: "source", name: "Використано len і cap", matches: "len\\(queue\\)[\\s\\S]*cap\\(queue\\)|cap\\(queue\\)[\\s\\S]*len\\(queue\\)", hint: "len(queue) і cap(queue) уже є в заготовці" },
    ],
  },
  {
    ...base, id: "go-close-range", lesson: "go/62", xp: 30,
    title: "Генератор із close і range",
    context: "Коли джерело даних закінчується, воно закриває канал, а споживач через range сам завершує цикл. Так будують конвеєри й потокове читання без жодних прапорців.",
    brief: [
      "Допишіть <code>gen(n int) &lt;-chan int</code>: створіть канал, у горутині надішліть у нього квадрати чисел від 1 до n, закрийте канал і поверніть його як канал лише для читання.",
      "Закривати має той, хто надсилає, і найкраще через <code>defer close(out)</code> усередині горутини. Без <code>close</code> цикл <code>range</code> у main зависне.",
    ],
    starter: raw`package main

import "fmt"

func gen(n int) <-chan int {
	out := make(chan int)
	// TODO: у горутині надішліть квадрати 1..n і закрийте канал
	return out
}

func main() {
	sum := 0
	for v := range gen(5) {
		fmt.Println(v)
		sum += v
	}
	fmt.Println("сума:", sum)
}
`,
    checks: [
      { on: "stdout", name: "Генератор віддає квадрати", has: "1\n4\n9\n16\n25", hint: "for i := 1; i <= n; i++ { out <- i * i }" },
      { on: "stdout", name: "Цикл range завершується й видає суму", has: "сума: 55", hint: "Без close(out) цикл range ніколи не закінчиться" },
      { on: "source", name: "Канал закривається", matches: "close\\(\\s*out\\s*\\)", hint: "defer close(out) на початку горутини" },
      { on: "source", name: "Надсилання відбувається в горутині", matches: "go\\s+func\\s*\\(", hint: "go func() { ... }()" },
      { on: "source", name: "Повертається канал лише для читання", has: "<-chan int" },
    ],
  },
  {
    ...base, id: "go-select-wait", lesson: "go/63", xp: 30,
    title: "Не блокуватися: select, default і тайм-аут",
    context: "Запит до повільного сервісу не може чекати вічно. select із default дає неблокуючу перевірку, а time.After обмежує очікування в часі. Це основа тайм-аутів у реальних сервісах.",
    brief: [
      "Допишіть <code>tryRecv</code>: через <code>select</code> з гілкою <code>default</code> спробуйте прочитати з каналу й поверніть <code>(значення, true)</code> або <code>(\"\", false)</code>, якщо там порожньо.",
      "Допишіть <code>waitOr</code>: через <code>select</code> чекайте або значення з каналу, або <code>time.After(d)</code>. Після тайм-ауту поверніть <code>\"тайм-аут\"</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"time"
)

func tryRecv(ch <-chan string) (string, bool) {
	return "", false
}

func waitOr(ch <-chan string, d time.Duration) string {
	return ""
}

func main() {
	ready := make(chan string, 1)
	ready <- "посилка"
	empty := make(chan string)

	v, ok := tryRecv(ready)
	fmt.Println(v, ok)
	v, ok = tryRecv(empty)
	fmt.Printf("%q %v\n", v, ok)

	ready <- "лист"
	fmt.Println(waitOr(ready, time.Second))
	fmt.Println(waitOr(empty, 20*time.Millisecond))
}
`,
    checks: [
      { on: "stdout", name: "tryRecv читає готове значення", has: "посилка true", hint: "case v := <-ch: return v, true" },
      { on: "stdout", name: "tryRecv не блокується на порожньому каналі", has: "\"\" false", hint: "default: return \"\", false" },
      { on: "stdout", name: "waitOr повертає значення, якщо воно є", has: "лист" },
      { on: "stdout", name: "waitOr повертає тайм-аут", has: "тайм-аут", hint: "case <-time.After(d): return \"тайм-аут\"" },
      { on: "source", name: "Використано select", has: "select" },
      { on: "source", name: "Є гілка default і time.After", matches: "default:[\\s\\S]*time\\.After|time\\.After[\\s\\S]*default:", hint: "Потрібні обидві: default у tryRecv і time.After у waitOr" },
    ],
  },
  {
    ...base, id: "go-sum-squares", lesson: "go/64", xp: 35,
    title: "Квадрати в горутинах",
    context: "Горутини дозволяють робити багато справ одночасно: обробляти запити, завантажувати файли. Головне, щоб головна програма дочекалась їх і зібрала результати.",
    brief: [
      "Допишіть <code>square</code>: функція має порахувати <code>n*n</code>, надіслати результат у канал <code>ch</code> і повідомити <code>WaitGroup</code>, що закінчила (<code>wg.Done()</code>, зручно через <code>defer</code>).",
      "Поки <code>wg.Done()</code> не викликається, <code>wg.Wait()</code> чекає вічно, і Go зупиняє програму з помилкою deadlock. Порядок надходження результатів не важливий, бо сума від нього не залежить.",
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
	fmt.Println("сума квадратів:", sum)
}
`,
    checks: [
      { on: "stdout", name: "Сума квадратів 1..5", has: "сума квадратів: 55", hint: "1+4+9+16+25 = 55: усі п'ять горутин мають надіслати результат і викликати Done" },
      { on: "source", name: "Горутини сповіщають WaitGroup", matches: "wg\\.Done\\(\\)", hint: "defer wg.Done() на початку square" },
      { on: "source", name: "Результат надсилається в канал", matches: "ch\\s*<-\\s*n\\s*\\*\\s*n", hint: "ch <- n * n" },
      { on: "source", name: "Використано sync.WaitGroup і go", matches: "sync\\.WaitGroup[\\s\\S]*go\\s+square", hint: "Не видаляйте wg.Add(1) і go square(...)" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "сума квадратів: 55" },
    ],
  },
  {
    ...base, id: "go-safe-counter", lesson: "go/65", xp: 35,
    title: "Потокобезпечний лічильник",
    context: "Звичайна мапа ламається, коли в неї пишуть кілька горутин одразу: Go навіть зупиняє програму з fatal error. Мʼютекс робить доступ по черзі, і саме так захищають кеші, лічильники й реєстри в реальних сервісах.",
    brief: [
      "У структурі <code>SafeCounter</code> уже є <code>sync.Mutex</code>. Захистіть ним методи <code>Inc</code> і <code>Value</code>: <code>Lock</code> на початку, а <code>Unlock</code> через <code>defer</code>.",
      "Методи мають отримувач-вказівник, щоб мʼютекс не копіювався. Після виправлення 100 горутин на ключ <code>a</code> і 50 на ключ <code>b</code> дадуть точні числа, перевірте ще й через <code>go run -race</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
)

type SafeCounter struct {
	mu sync.Mutex
	m  map[string]int
}

func (c *SafeCounter) Inc(key string) {
	c.m[key]++
}

func (c *SafeCounter) Value(key string) int {
	return c.m[key]
}

func main() {
	c := &SafeCounter{m: make(map[string]int)}
	var wg sync.WaitGroup
	for i := 0; i < 150; i++ {
		key := "a"
		if i >= 100 {
			key = "b"
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Inc(key)
		}()
	}
	wg.Wait()
	fmt.Println("a:", c.Value("a"))
	fmt.Println("b:", c.Value("b"))
}
`,
    checks: [
      { on: "stdout", name: "Лічильник a точний", has: "a: 100", hint: "Без замка частина збільшень губиться або програма падає з concurrent map writes" },
      { on: "stdout", name: "Лічильник b точний", has: "b: 50" },
      { on: "source", name: "Замок береться", matches: "c\\.mu\\.Lock\\(\\)", hint: "c.mu.Lock() на початку методу" },
      { on: "source", name: "Замок знімається через defer", matches: "defer\\s+c\\.mu\\.Unlock\\(\\)", hint: "Одразу після Lock: defer c.mu.Unlock()" },
      { on: "source", name: "Замок і в Inc, і в Value", matches: "Lock\\(\\)[\\s\\S]*Lock\\(\\)", hint: "Читання мапи теж треба захистити, інакше це гонка" },
      { on: "source", name: "Отримувач-вказівник", has: "(c *SafeCounter)" },
    ],
  },
];
