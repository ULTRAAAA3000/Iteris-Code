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
//__END__
};
