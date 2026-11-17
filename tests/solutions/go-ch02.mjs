const raw = String.raw;
const BT = "`";

export const SOLUTIONS_02 = {
  "go-variables-zero": raw`package main

import "fmt"

func main() {
	a, b := 3, 8
	a, b = b, a
	fmt.Println(a, b)

	var count int
	var label string
	var ready bool
	fmt.Printf("%d %q %t\n", count, label, ready)

	level := 1
	if a > b {
		level = 5
		fmt.Println("усередині:", level)
	}
	fmt.Println("зовні:", level)
}
`,
  "go-numeric-types": raw`package main

import (
	"fmt"
	"math"
)

func percent(done, total int) float64 {
	return float64(done) / float64(total) * 100
}

func wrap(x uint8, add int) uint8 {
	return x + uint8(add)
}

func equal(x, y float64) bool {
	return math.Abs(x-y) < 1e-9
}

func main() {
	fmt.Println(percent(3, 4))
	fmt.Println(wrap(250, 10))
	a, b := 0.1, 0.2
	fmt.Println(equal(a+b, 0.3))
}
`,
  "go-const-iota": raw`package main

import "fmt"

const (
	Debug = iota + 1
	Info
	Warn
	Error
)

const (
	_  = iota
	KB = 1 << (10 * iota)
	MB
	GB
)

func main() {
	fmt.Println(Debug, Info, Warn, Error)
	fmt.Println(KB, MB, GB)
	fmt.Println(GB / MB)
}
`,
  "go-strings-runes": raw`package main

import (
	"fmt"
	"unicode/utf8"
)

func lens(s string) (int, int) {
	return len(s), utf8.RuneCountInString(s)
}

func countRune(s string, target rune) int {
	n := 0
	for _, r := range s {
		if r == target {
			n++
		}
	}
	return n
}

func firstRune(s string) rune {
	for _, r := range s {
		return r
	}
	return 0
}

func main() {
	b, r := lens("Дніпро")
	fmt.Println("байтів:", b, "символів:", r)
	fmt.Println("літер о:", countRune("Дніпро — місто", 'о'))
	fmt.Println("перша:", string(firstRune("Дніпро")))
}
`,
  "go-order-total": raw`package main

import (
	"fmt"
	"strconv"
)

func main() {
	price, _ := strconv.ParseFloat("199.99", 64)
	qty, _ := strconv.Atoi("3")
	fmt.Printf("Разом: %.2f\n", price*float64(qty))
	fmt.Printf("%T %T\n", price, qty)

	_, err := strconv.Atoi("3x")
	fmt.Println("помилка:", err)
}
`,
  "go-fmt-receipt": raw`package main

import (
	"fmt"
	"os"
)

func row(name string, qty int, price float64) string {
	return fmt.Sprintf("%-8s|%3d|%8.2f", name, qty, price)
}

func main() {
	fmt.Println(row("Хліб", 2, 25.5))
	fmt.Println(row("Молоко", 10, 9.9))
	fmt.Fprintf(os.Stdout, "%d = %x = %b\n", 255, 255, 255)
}
`,
  "go-if-category": raw`package main

import (
	"fmt"
	"strconv"
)

func category(age int) string {
	if age < 0 {
		return "помилка"
	}
	if age < 12 {
		return "дитина"
	}
	if age < 18 {
		return "підліток"
	}
	return "дорослий"
}

func parseAge(s string) string {
	if n, err := strconv.Atoi(s); err == nil {
		return category(n)
	}
	return "не число"
}

func main() {
	fmt.Println(category(-1))
	fmt.Println(category(5))
	fmt.Println(category(15))
	fmt.Println(category(40))
	fmt.Println(parseAge("17"))
	fmt.Println(parseAge("abc"))
}
`,
  "go-switch-calendar": raw`package main

import "fmt"

func daysIn(month int, leap bool) int {
	switch month {
	case 1, 3, 5, 7, 8, 10, 12:
		return 31
	case 4, 6, 9, 11:
		return 30
	case 2:
		if leap {
			return 29
		}
		return 28
	default:
		return 0
	}
}

func rating(score int) string {
	switch {
	case score >= 90:
		return "відмінно"
	case score >= 75:
		return "добре"
	case score >= 60:
		return "задовільно"
	default:
		return "незадовільно"
	}
}

func main() {
	fmt.Println(daysIn(1, false), daysIn(4, false), daysIn(2, false), daysIn(2, true), daysIn(13, false))
	fmt.Println(rating(95), rating(80), rating(60), rating(10))
}
`,
  "go-for-forms": raw`package main

import "fmt"

func sumTo(n int) int {
	sum := 0
	for i := 1; i <= n; i++ {
		sum += i
	}
	return sum
}

func steps(n int) int {
	count := 0
	for n != 1 {
		if n%2 == 0 {
			n /= 2
		} else {
			n = 3*n + 1
		}
		count++
	}
	return count
}

func repeat(s string, k int) string {
	result := ""
	for range k {
		result += s
	}
	return result
}

func main() {
	fmt.Println(sumTo(100), steps(6), steps(27))
	fmt.Println(repeat("ab", 3))
}
`,
  "go-loop-control": raw`package main

import "fmt"

func oddSumUnder(max int) int {
	sum := 0
	for i := 1; ; i++ {
		if i%2 == 0 {
			continue
		}
		if sum+i > max {
			break
		}
		sum += i
	}
	return sum
}

func search(target int) string {
	result := "немає"
outer:
	for a := 1; a < 10; a++ {
		for b := a; b < 10; b++ {
			if a*b == target {
				result = fmt.Sprintf("%dx%d", a, b)
				break outer
			}
		}
	}
	return result
}

func countPrimes(limit int) int {
	count := 0
next:
	for n := 2; n < limit; n++ {
		for d := 2; d*d <= n; d++ {
			if n%d == 0 {
				continue next
			}
		}
		count++
	}
	return count
}

func main() {
	fmt.Println(oddSumUnder(50))
	fmt.Println(search(36), search(7), search(100))
	fmt.Println(countPrimes(20))
}
`,
  "go-sum-product": raw`package main

import "fmt"

func sumAndProduct(a, b int) (int, int) {
	return a + b, a * b
}

func sumAndProductUpTo(n int) (int, int) {
	sum, product := 0, 1
	for i := 1; i <= n; i++ {
		sum += i
		product *= i
	}
	return sum, product
}

func addTen(n int) int {
	n += 10
	return n
}

func main() {
	s, p := sumAndProduct(6, 7)
	fmt.Println("Сума:", s, "Добуток:", p)
	s, p = sumAndProductUpTo(5)
	fmt.Println("До 5:", s, p)
	x := 5
	y := addTen(x)
	fmt.Println("x:", x, "y:", y)
}
`,
  "go-variadic-named": raw`package main

import "fmt"

func minMax(nums ...int) (lo, hi int) {
	for i, n := range nums {
		if i == 0 || n < lo {
			lo = n
		}
		if i == 0 || n > hi {
			hi = n
		}
	}
	return
}

func joinWith(sep string, parts ...string) string {
	result := ""
	for i, p := range parts {
		if i > 0 {
			result += sep
		}
		result += p
	}
	return result
}

func main() {
	lo, hi := minMax(4, -2, 9, 3)
	fmt.Println(lo, hi)
	data := []int{7, 1, 8}
	lo, hi = minMax(data...)
	fmt.Println(lo, hi)
	fmt.Println(joinWith(", ", "Go", "Rust", "C"))
	fmt.Printf("[%s]\n", joinWith("-"))
}
`,
  "go-closure-counter": raw`package main

import "fmt"

func makeCounter(start, step int) func() int {
	cur := start
	return func() int {
		v := cur
		cur += step
		return v
	}
}

func makeAdder(k int) func(int) int {
	return func(n int) int {
		return n + k
	}
}

func apply(n int, f func(int) int) int {
	return f(n)
}

func main() {
	c1 := makeCounter(0, 5)
	c2 := makeCounter(100, -1)
	fmt.Println(c1(), c1(), c1())
	fmt.Println(c2(), c2())
	fmt.Println(apply(7, makeAdder(3)))
	fmt.Println(apply(7, func(n int) int { return n * n }))
}
`,
  "go-recursion": raw`package main

import "fmt"

var calls int

func power(base, exp int) int {
	if exp == 0 {
		return 1
	}
	return base * power(base, exp-1)
}

func sumDigits(n int) int {
	if n < 10 {
		return n
	}
	return n%10 + sumDigits(n/10)
}

func fib(n int) int {
	calls++
	if n < 2 {
		return n
	}
	return fib(n-1) + fib(n-2)
}

func main() {
	fmt.Println(power(2, 10), power(3, 4))
	fmt.Println(sumDigits(98765))
	r := fib(10)
	fmt.Println(r, calls)
}
`,
//__END__
};
