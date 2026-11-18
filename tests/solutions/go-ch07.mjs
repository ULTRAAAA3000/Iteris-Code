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
};
