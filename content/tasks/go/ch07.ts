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
  {
    ...base, id: "go-atomic-hits", lesson: "go/66", xp: 30,
    title: "Лічильник запитів і одна ініціалізація",
    context: "У сервісі сотні запитів обробляються одночасно. Лічильник метрик має рахувати точно без замка, а конфіг мусить прочитатися рівно один раз, навіть якщо перші запити прийшли в одну мить.",
    brief: [
      "Допишіть <code>handle</code>: ініціалізацію <code>initConfig</code> виконуйте лише через <code>setup.Do(...)</code>, щоб вона відбулася один раз, а лічильник <code>hits</code> збільшуйте атомарно через <code>hits.Add(1)</code>.",
      "<code>main</code> запускає 50 горутин. Правильно написаний <code>handle</code> дасть рівно 50 запитів і одну ініціалізацію незалежно від планувальника.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

var (
	hits  atomic.Int64
	inits atomic.Int64
	setup sync.Once
)

func initConfig() {
	inits.Add(1)
}

func handle() {
	// TODO: ініціалізація один раз через setup.Do, а потім hits.Add(1)
	initConfig()
}

func main() {
	var wg sync.WaitGroup
	for range 50 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			handle()
		}()
	}
	wg.Wait()
	fmt.Println("запитів:", hits.Load())
	fmt.Println("ініціалізацій:", inits.Load())
}
`,
    checks: [
      { on: "stdout", name: "Усі запити пораховано", has: "запитів: 50", hint: "Кожен виклик handle має зробити hits.Add(1)" },
      { on: "stdout", name: "Ініціалізація одна", has: "ініціалізацій: 1", hint: "initConfig має виконатися лише раз: загорніть її в setup.Do" },
      { on: "source", name: "Once.Do", matches: "setup\\.Do\\(", hint: "setup.Do(initConfig)" },
      { on: "source", name: "Атомарне збільшення", matches: "hits\\.Add\\(1\\)", hint: "hits.Add(1)" },
      { on: "stdout", name: "Точний вивід", equals: "запитів: 50\nініціалізацій: 1" },
    ],
  },
  {
    ...base, id: "go-context-slow-square", lesson: "go/67", xp: 30,
    title: "Квадрат, який слухає context",
    context: "Довга операція без перевірки контексту продовжує працювати, коли клієнт давно пішов. Функція, що приймає ctx, зобовʼязана вчасно зупинитися й повернути причину.",
    brief: [
      "Допишіть <code>slowSquare(ctx, n, d)</code>: вона чекає тривалість <code>d</code> (через <code>time.After(d)</code>) і тоді повертає <code>n*n</code> і <code>nil</code>. Якщо раніше закриється <code>ctx.Done()</code>, поверніть <code>0</code> і <code>ctx.Err()</code>.",
      "Використайте <code>select</code> з двома гілками. <code>main</code> перевіряє успіх, тайм-аут і ручне скасування. Усі тривалості підібрані так, що вивід завжди однаковий.",
    ],
    starter: raw`package main

import (
	"context"
	"fmt"
	"time"
)

func slowSquare(ctx context.Context, n int, d time.Duration) (int, error) {
	// TODO: select між time.After(d) і ctx.Done()
	return n * n, nil
}

func main() {
	v, err := slowSquare(context.Background(), 7, time.Millisecond)
	fmt.Println(v, err)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Millisecond)
	defer cancel()
	v, err = slowSquare(ctx, 7, time.Hour)
	fmt.Println(v, err)

	ctx2, cancel2 := context.WithCancel(context.Background())
	cancel2()
	v, err = slowSquare(ctx2, 7, time.Hour)
	fmt.Println(v, err)
}
`,
    checks: [
      { on: "stdout", name: "Успішний виклик", has: "49 <nil>", hint: "Якщо ctx живий, після time.After(d) поверніть n*n, nil" },
      { on: "stdout", name: "Тайм-аут контексту", has: "0 context deadline exceeded", hint: "У гілці <-ctx.Done() поверніть 0, ctx.Err()" },
      { on: "stdout", name: "Ручне скасування", has: "0 context canceled" },
      { on: "source", name: "Слухає ctx.Done()", matches: "<-\\s*ctx\\.Done\\(\\)", hint: "case <-ctx.Done():" },
      { on: "source", name: "Повертає ctx.Err()", has: "ctx.Err()" },
      { on: "stdout", name: "Точний вивід", equals: "49 <nil>\n0 context deadline exceeded\n0 context canceled" },
    ],
  },
  {
    ...base, id: "go-worker-pool-squares", lesson: "go/68", xp: 30,
    title: "Пул із трьох працівників",
    context: "Пул працівників обмежує паралельність і працює з чергою завдань. Цінність у тому, що вивід лишається однаковим при кожному запуску, хоч завдання виконують різні горутини.",
    brief: [
      "Допишіть <code>worker</code>: у циклі <code>for j := range jobs</code> надсилайте в <code>results</code> значення <code>result{j.idx, j.n * j.n}</code>. Завдання й результат несуть індекс, тому <code>main</code> складає квадрати в потрібному порядку.",
      "<code>main</code> уже запускає трьох працівників, закриває <code>jobs</code> і <code>results</code> у правильний момент. Ваша частина лише тіло воркера.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
)

type job struct{ idx, n int }
type result struct{ idx, sq int }

func worker(jobs <-chan job, results chan<- result, wg *sync.WaitGroup) {
	defer wg.Done()
	// TODO: читайте jobs, поки канал не закрито, і надсилайте result{j.idx, j.n * j.n}
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8}
	jobs := make(chan job, len(nums))
	results := make(chan result, len(nums))
	var wg sync.WaitGroup
	for range 3 {
		wg.Add(1)
		go worker(jobs, results, &wg)
	}
	for i, n := range nums {
		jobs <- job{i, n}
	}
	close(jobs)
	wg.Wait()
	close(results)
	squares := make([]int, len(nums))
	total := 0
	for r := range results {
		squares[r.idx] = r.sq
		total += r.sq
	}
	fmt.Println(squares)
	fmt.Println("сума:", total)
}
`,
    checks: [
      { on: "stdout", name: "Квадрати в порядку індексів", has: "[1 4 9 16 25 36 49 64]", hint: "Кожен результат має нести індекс завдання: result{j.idx, ...}" },
      { on: "stdout", name: "Сума квадратів", has: "сума: 204" },
      { on: "source", name: "Цикл range по jobs", matches: "range\\s+jobs", hint: "for j := range jobs { ... }" },
      { on: "source", name: "Надсилання результату", matches: "results\\s*<-", hint: "results <- result{...}" },
      { on: "stdout", name: "Точний вивід", equals: "[1 4 9 16 25 36 49 64]\nсума: 204" },
    ],
  },
  {
    ...base, id: "go-pipeline-merge", lesson: "go/69", xp: 40,
    title: "Fan-in: функція merge",
    context: "Коли повільну стадію конвеєра розмножують на кількох працівників, їхні вихідні канали треба злити в один. Це fan-in, і він має коректно закритися, інакше споживач чекатиме вічно.",
    brief: [
      "Допишіть <code>merge(chans ...&lt;-chan int) &lt;-chan int</code>: для кожного вхідного каналу запустіть горутину, що копіює значення в спільний <code>out</code>, а окрема горутина після <code>wg.Wait()</code> закриває <code>out</code>.",
      "Зараз заготовка повертає вже закритий канал. Замініть цей рядок справжнім злиттям. <code>main</code> сортує результат, тому порядок злиття не впливає на вивід.",
    ],
    starter: raw`package main

import (
	"fmt"
	"slices"
	"sync"
)

func gen(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, n := range nums {
			out <- n
		}
	}()
	return out
}

func square(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for n := range in {
			out <- n * n
		}
	}()
	return out
}

func merge(chans ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	out := make(chan int)
	// TODO: для кожного каналу з chans запустіть горутину-копіювальника (wg.Add, defer wg.Done),
	// а після wg.Wait() закрийте out в окремій горутині
	_ = &wg
	close(out)
	return out
}

func main() {
	in := gen(1, 2, 3, 4, 5, 6)
	var got []int
	for v := range merge(square(in), square(in)) {
		got = append(got, v)
	}
	slices.Sort(got)
	fmt.Println(got)
	fmt.Println("отримано:", len(got))
}
`,
    checks: [
      { on: "stdout", name: "Усі значення злито", has: "[1 4 9 16 25 36]", hint: "Кожен вхідний канал треба прочитати до кінця й переслати в out" },
      { on: "stdout", name: "Кількість значень", has: "отримано: 6" },
      { on: "source", name: "Горутини-копіювальники", matches: "for\\s+_,\\s*\\w+\\s*:=\\s*range\\s+chans[\\s\\S]*go\\s+func", hint: "На кожен канал із chans окрема горутина" },
      { on: "source", name: "Закриття після wg.Wait()", matches: "wg\\.Wait\\(\\)\\s*\\n\\s*close\\(out\\)", hint: "go func() { wg.Wait(); close(out) }()" },
      { on: "stdout", name: "Точний вивід", equals: "[1 4 9 16 25 36]\nотримано: 6" },
    ],
  },
  {
    ...base, id: "go-replica-answer", lesson: "go/70", xp: 30,
    title: "Репліки без витоку",
    context: "Сервіс питає кілька реплік і бере першу відповідь. Якщо решта реплік застрягають на надсиланні, горутини витікають і з часом з'їдають памʼять або підвішують програму.",
    brief: [
      "У <code>ask</code> кожна репліка надсилає відповідь у канал <code>results</code>, а функція бере лише першу. Зараз канал без буфера, і дві інші репліки застрягають, тому <code>wg.Wait()</code> зависає.",
      "Виправте витік: дайте відправникам місце в буфері, щоб кожна репліка могла надіслати й завершитись. Після цього <code>wg.Wait()</code> доводить, що жодна горутина не залишилась.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
)

func ask(replicas int) int {
	results := make(chan int)
	var wg sync.WaitGroup
	for range replicas {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results <- 42
		}()
	}
	answer := <-results
	wg.Wait()
	return answer
}

func main() {
	fmt.Println("відповідь:", ask(3))
	fmt.Println("відповідь:", ask(5))
	fmt.Println("усі репліки завершилися")
}
`,
    checks: [
      { on: "stdout", name: "Відповіді отримано", has: "відповідь: 42", hint: "Програма має дійти до виводу: зараз вона зависає на wg.Wait()" },
      { on: "stdout", name: "Усі репліки завершилися", has: "усі репліки завершилися" },
      { on: "source", name: "Канал має буфер", matches: "make\\(chan int,\\s*\\w+\\)|<-\\s*ctx\\.Done\\(\\)", hint: "make(chan int, replicas): місце для кожного відправника" },
      { on: "source", name: "Очікування через WaitGroup", has: "wg.Wait()" },
      { on: "stdout", name: "Точний вивід", equals: "відповідь: 42\nвідповідь: 42\nусі репліки завершилися" },
    ],
  },
  {
    ...base, id: "go-semaphore-group", lesson: "go/71", xp: 45,
    title: "Group з лімітом паралельності",
    context: "У бібліотеках поширена група горутин, що обмежує кількість одночасних завдань і повертає першу помилку. Пакета errgroup тут немає, тож суть доведеться відтворити самому на семафорі-каналі.",
    brief: [
      "Допишіть метод <code>Go</code>: <b>перед</b> запуском горутини займіть місце в семафорі <code>g.sem &lt;- struct{}{}</code>, а всередині горутини звільняйте його через <code>defer func() { &lt;-g.sem }()</code>.",
      "Решта групи вже готова: <code>Wait</code>, збір першої помилки через <code>sync.Once</code>. <code>main</code> рахує порушення ліміту 2 і має отримати нуль. Завдання 4 повертає помилку, інші дають квадрати.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

type Group struct {
	wg   sync.WaitGroup
	sem  chan struct{}
	once sync.Once
	err  error
}

func NewGroup(limit int) *Group {
	return &Group{sem: make(chan struct{}, limit)}
}

func (g *Group) Go(f func() error) {
	// TODO: займіть місце в g.sem до запуску горутини, а звільніть через defer
	g.wg.Add(1)
	go func() {
		defer g.wg.Done()
		if err := f(); err != nil {
			g.once.Do(func() { g.err = err })
		}
	}()
}

func (g *Group) Wait() error {
	g.wg.Wait()
	return g.err
}

func main() {
	const limit = 2
	g := NewGroup(limit)
	var active, violations atomic.Int64
	results := make([]int, 6)
	for i := range results {
		g.Go(func() error {
			if active.Add(1) > limit {
				violations.Add(1)
			}
			defer active.Add(-1)
			if i == 4 {
				return fmt.Errorf("завдання %d: збій", i)
			}
			results[i] = i * i
			return nil
		})
	}
	err := g.Wait()
	fmt.Println("помилка:", err)
	fmt.Println(results)
	fmt.Println("порушень ліміту:", violations.Load())
}
`,
    checks: [
      { on: "stdout", name: "Перша помилка збережена", has: "помилка: завдання 4: збій" },
      { on: "stdout", name: "Решта завдань виконана", has: "[0 1 4 9 0 25]" },
      { on: "stdout", name: "Ліміт не порушено", has: "порушень ліміту: 0", hint: "Ліміт діє, лише якщо місце береться в g.sem і звільняється після f()" },
      { on: "source", name: "Місце береться до go", matches: "g\\.sem\\s*<-\\s*struct\\s*\\{\\s*\\}\\s*\\{\\s*\\}[\\s\\S]*go\\s+func", hint: "g.sem <- struct{}{} має стояти перед go func()" },
      { on: "source", name: "Місце звільняється", matches: "<-\\s*g\\.sem", hint: "defer func() { <-g.sem }()" },
    ],
  },
  {
    ...base, id: "go-timeout-ticker", lesson: "go/72", xp: 30,
    title: "Тайм-аут і Ticker",
    context: "Запит без ліміту часу може підвісити програму назавжди, а періодичну роботу (опитування, heartbeat) без Ticker доводиться вигадувати вручну. Обидва прийоми стоять на каналах пакета time.",
    brief: [
      "Допишіть <code>WithTimeout</code>: запустіть <code>f</code> у горутині, результат віддайте в канал з буфером 1 (щоб запізнілий працівник не завис), а в <code>select</code> порівняйте його з каналом таймера <code>time.NewTimer</code>. Не забудьте <code>defer timer.Stop()</code>.",
      "Допишіть <code>Collect</code>: створіть <code>time.NewTicker</code>, зупиніть його через <code>defer</code> і зберіть <code>n</code> тіків у слайс <code>[1 2 ... n]</code>. Вивід не залежить від реального часу: інтервали лише кілька мілісекунд.",
    ],
    starter: raw`package main

import (
	"fmt"
	"time"
)

func WithTimeout(d time.Duration, f func() string) (string, bool) {
	// TODO: запустіть f у горутині з буферизованим каналом результату (ємність 1)
	// і виберіть у select між результатом та таймером
	return "", false
}

func Collect(n int, every time.Duration) []int {
	// TODO: створіть time.NewTicker, зупиніть його через defer і зберіть n тіків: 1, 2, ..., n
	return nil
}

func main() {
	block := make(chan struct{})
	v, ok := WithTimeout(50*time.Millisecond, func() string { return "ok" })
	fmt.Printf("швидке: %q %v\n", v, ok)
	v, ok = WithTimeout(10*time.Millisecond, func() string { <-block; return "пізно" })
	fmt.Printf("повільне: %q %v\n", v, ok)
	close(block)
	fmt.Println(Collect(4, 3*time.Millisecond))
}
`,
    checks: [
      { on: "stdout", name: "Швидка робота встигає", has: "швидке: \"ok\" true", hint: "Якщо результат прийшов раніше за таймер, поверніть його і true" },
      { on: "stdout", name: "Повільна робота дає тайм-аут", has: "повільне: \"\" false", hint: "У гілці таймера поверніть порожній рядок і false" },
      { on: "stdout", name: "Ticker збирає тіки", has: "[1 2 3 4]", hint: "Читайте з tk.C у циклі, доки не набереться n значень" },
      { on: "source", name: "Явний таймер із зупинкою", matches: "NewTimer[\\s\\S]*Stop\\(\\)", hint: "timer := time.NewTimer(d); defer timer.Stop()" },
      { on: "source", name: "Ticker зупиняється", matches: "NewTicker[\\s\\S]*defer\\s+\\w+\\.Stop\\(\\)", hint: "defer tk.Stop() одразу після створення" },
      { on: "source", name: "Канал результату з буфером", matches: "make\\(chan string,\\s*1\\)", hint: "make(chan string, 1), щоб горутина не зависла після тайм-ауту" },
    ],
  },
  {
    ...base, id: "go-publish-config", lesson: "go/73", xp: 35,
    title: "Безпечна публікація конфігу",
    context: "Конфіг, що оновлюється на льоту, читають десятки горутин. Звичайне присвоєння вказівника тут гонка даних; atomic.Pointer дає ланцюжок happens-before і читачі бачать завжди цілий об'єкт.",
    brief: [
      "Допишіть <code>Publish</code>: збережіть конфіг у <code>h.p</code> через <code>Store</code>. Допишіть <code>Current</code>: поверніть значення через <code>Load</code>.",
      "Конфіг будується повністю до публікації й після неї не змінюється: для нової версії створюється новий об'єкт. Тоді читачі бачать або стару, або нову версію, але ніколи половину. Перевірте себе через <code>go run -race</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

type Config struct {
	Name  string
	Limit int
}

type Holder struct{ p atomic.Pointer[Config] }

func (h *Holder) Publish(c *Config) {
	// TODO: збережіть c у h.p через Store
}

func (h *Holder) Current() *Config {
	// TODO: поверніть актуальний конфіг через Load
	return &Config{}
}

func main() {
	var h Holder
	h.Publish(&Config{Name: "v1", Limit: 10})
	var wg sync.WaitGroup
	out := make([]string, 3)
	for i := range out {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c := h.Current()
			out[i] = fmt.Sprint(c.Name, ":", c.Limit)
		}()
	}
	wg.Wait()
	fmt.Println(out)
	h.Publish(&Config{Name: "v2", Limit: 20})
	c := h.Current()
	fmt.Println(c.Name, c.Limit)
}
`,
    checks: [
      { on: "stdout", name: "Читачі бачать першу версію", has: "[v1:10 v1:10 v1:10]", hint: "Current має повертати той конфіг, який зберіг Publish" },
      { on: "stdout", name: "Нова версія замінює стару", has: "v2 20", hint: "Другий Publish має замінити вказівник" },
      { on: "source", name: "Публікація через Store", matches: "\\.Store\\(", hint: "h.p.Store(c)" },
      { on: "source", name: "Читання через Load", matches: "\\.Load\\(", hint: "return h.p.Load()" },
    ],
  },
];
