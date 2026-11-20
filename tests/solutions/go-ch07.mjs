const raw = String.raw;

export const SOLUTIONS_07 = {
  "go-goroutine-cubes": raw`package main

import "fmt"

func cube(i int, res []int, done chan<- struct{}) {
	res[i] = i * i * i
	done <- struct{}{}
}

func main() {
	const n = 5
	res := make([]int, n)
	done := make(chan struct{})
	for i := range n {
		go cube(i, res, done)
	}
	for range n {
		<-done
	}
	fmt.Println(res)
}
`,
  "go-chan-halves": raw`package main

import "fmt"

func sum(nums []int, out chan int) {
	total := 0
	for _, n := range nums {
		total += n
	}
	out <- total
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
  "go-buffered-queue": raw`package main

import "fmt"

func main() {
	queue := make(chan string, 3)
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
  "go-close-range": raw`package main

import "fmt"

func gen(n int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for i := 1; i <= n; i++ {
			out <- i * i
		}
	}()
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
  "go-select-wait": raw`package main

import (
	"fmt"
	"time"
)

func tryRecv(ch <-chan string) (string, bool) {
	select {
	case v := <-ch:
		return v, true
	default:
		return "", false
	}
}

func waitOr(ch <-chan string, d time.Duration) string {
	select {
	case v := <-ch:
		return v
	case <-time.After(d):
		return "тайм-аут"
	}
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
  "go-sum-squares": raw`package main

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
	fmt.Println("сума квадратів:", sum)
}
`,
  "go-safe-counter": raw`package main

import (
	"fmt"
	"sync"
)

type SafeCounter struct {
	mu sync.Mutex
	m  map[string]int
}

func (c *SafeCounter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.m[key]++
}

func (c *SafeCounter) Value(key string) int {
	c.mu.Lock()
	defer c.mu.Unlock()
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
  "go-atomic-hits": raw`package main

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
	setup.Do(initConfig)
	hits.Add(1)
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
  "go-context-slow-square": raw`package main

import (
	"context"
	"fmt"
	"time"
)

func slowSquare(ctx context.Context, n int, d time.Duration) (int, error) {
	select {
	case <-time.After(d):
		return n * n, nil
	case <-ctx.Done():
		return 0, ctx.Err()
	}
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
  "go-worker-pool-squares": raw`package main

import (
	"fmt"
	"sync"
)

type job struct{ idx, n int }
type result struct{ idx, sq int }

func worker(jobs <-chan job, results chan<- result, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		results <- result{j.idx, j.n * j.n}
	}
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
  "go-pipeline-merge": raw`package main

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
	for _, c := range chans {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}()
	}
	go func() {
		wg.Wait()
		close(out)
	}()
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
  "go-replica-answer": raw`package main

import (
	"fmt"
	"sync"
)

func ask(replicas int) int {
	results := make(chan int, replicas)
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
  "go-semaphore-group": raw`package main

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
	g.sem <- struct{}{}
	g.wg.Add(1)
	go func() {
		defer g.wg.Done()
		defer func() { <-g.sem }()
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
  "go-timeout-ticker": raw`package main

import (
	"fmt"
	"time"
)

func WithTimeout(d time.Duration, f func() string) (string, bool) {
	res := make(chan string, 1)
	go func() { res <- f() }()
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case v := <-res:
		return v, true
	case <-timer.C:
		return "", false
	}
}

func Collect(n int, every time.Duration) []int {
	tk := time.NewTicker(every)
	defer tk.Stop()
	var out []int
	for len(out) < n {
		<-tk.C
		out = append(out, len(out)+1)
	}
	return out
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
  "go-publish-config": raw`package main

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

func (h *Holder) Publish(c *Config) { h.p.Store(c) }
func (h *Holder) Current() *Config  { return h.p.Load() }

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
};
