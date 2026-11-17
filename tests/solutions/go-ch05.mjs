const raw = String.raw;
const BT = "`";

export const SOLUTIONS_05 = {
  "go-shapes-area": raw`package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
	Perimeter() float64
}

type Rect struct{ W, H float64 }
type Circle struct{ R float64 }

func (r Rect) Area() float64        { return r.W * r.H }
func (r Rect) Perimeter() float64   { return 2 * (r.W + r.H) }
func (c Circle) Area() float64      { return math.Pi * c.R * c.R }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.R }

func Total(shapes []Shape) float64 {
	sum := 0.0
	for _, s := range shapes {
		sum += s.Area()
	}
	return sum
}

func main() {
	shapes := []Shape{Rect{3, 4}, Circle{1}}
	for _, s := range shapes {
		fmt.Printf("Площа: %.2f, периметр: %.2f\n", s.Area(), s.Perimeter())
	}
	fmt.Printf("Сума площ: %.2f\n", Total(shapes))
}
`,
  "go-animals-interface": raw`package main

import "fmt"

type Animal interface {
	Speak() string
}

type Dog struct{ Name string }
type Cat struct{ Name string }

func (d Dog) Speak() string { return d.Name + ": гав!" }
func (c Cat) Speak() string { return c.Name + ": няв!" }

type Parrot struct {
	Name string
	Said int
}

func (p *Parrot) Speak() string {
	p.Said++
	return p.Name + ": привіт!"
}

func main() {
	p := &Parrot{Name: "Кеша"}
	animals := []Animal{Dog{"Рекс"}, Cat{"Мурка"}, p}
	for i := 0; i < 2; i++ {
		for _, a := range animals {
			fmt.Println(a.Speak())
		}
	}
	fmt.Println("Кеша говорив:", p.Said)
}
`,
  "go-any-assert": raw`package main

import "fmt"

func SumInts(vals []any) (sum, skipped int) {
	for _, v := range vals {
		if n, ok := v.(int); ok {
			sum += n
		} else {
			skipped++
		}
	}
	return sum, skipped
}

func AsString(v any) (string, bool) {
	s, ok := v.(string)
	return s, ok
}

func main() {
	sum, skipped := SumInts([]any{1, "два", 3, 4.5, 5, nil})
	fmt.Printf("Сума: %d, пропущено: %d\n", sum, skipped)
	s, ok := AsString("go")
	fmt.Printf("%q %v\n", s, ok)
	s, ok = AsString(42)
	fmt.Printf("%q %v\n", s, ok)
}
`,
  "go-type-switch": raw`package main

import "fmt"

func Describe(x any) string {
	switch v := x.(type) {
	case nil:
		return "нічого"
	case int:
		return fmt.Sprintf("ціле %d", v)
	case string:
		return fmt.Sprintf("рядок %q", v)
	case []int:
		return fmt.Sprintf("слайс із %d елементів", len(v))
	default:
		return fmt.Sprintf("невідомий тип %T", v)
	}
}

func main() {
	for _, x := range []any{42, "go", []int{1, 2, 3}, nil, 3.5} {
		fmt.Println(Describe(x))
	}
}
`,
  "go-money-stringer": raw`package main

import "fmt"

type Money int

func (m Money) String() string {
	return fmt.Sprintf("%d.%02d грн", int(m)/100, int(m)%100)
}

type NoFunds struct{ Need, Have Money }

func (e NoFunds) Error() string {
	return fmt.Sprintf("недостатньо коштів: потрібно %s, є %s", e.Need, e.Have)
}

func Withdraw(balance, amount Money) (Money, error) {
	if amount > balance {
		return balance, NoFunds{amount, balance}
	}
	return balance - amount, nil
}

func main() {
	b := Money(10050)
	fmt.Println(b)
	b, err := Withdraw(b, 2575)
	fmt.Println(b, err)
	_, err = Withdraw(b, 50000)
	fmt.Println("помилка:", err)
}
`,
  "go-line-counter-writer": raw`package main

import (
	"bytes"
	"fmt"
	"io"
	"strings"
)

type LineCounter struct {
	W     io.Writer
	Lines int
}

func (c *LineCounter) Write(p []byte) (int, error) {
	c.Lines += bytes.Count(p, []byte("\n"))
	return c.W.Write(p)
}

func main() {
	var buf bytes.Buffer
	lc := &LineCounter{W: &buf}
	n, err := io.Copy(lc, strings.NewReader("a\nb\nc\n"))
	fmt.Println(n, err, lc.Lines)
	fmt.Fprintf(lc, "x\ny")
	fmt.Println("Рядків:", lc.Lines)
	fmt.Printf("%q\n", buf.String())
}
`,
  "go-sort-interface": raw`package main

import (
	"fmt"
	"sort"
)

type Employee struct {
	Name   string
	Dept   string
	Salary int
}

type ByDeptSalary []Employee

func (b ByDeptSalary) Len() int      { return len(b) }
func (b ByDeptSalary) Swap(i, j int) { b[i], b[j] = b[j], b[i] }
func (b ByDeptSalary) Less(i, j int) bool {
	if b[i].Dept != b[j].Dept {
		return b[i].Dept < b[j].Dept
	}
	if b[i].Salary != b[j].Salary {
		return b[i].Salary > b[j].Salary
	}
	return b[i].Name < b[j].Name
}

func main() {
	staff := []Employee{
		{"Ann", "dev", 5000}, {"Bob", "ops", 3000}, {"Cid", "dev", 7000},
		{"Dan", "ops", 3000}, {"Eva", "dev", 5000},
	}
	sort.Sort(ByDeptSalary(staff))
	for _, e := range staff {
		fmt.Println(e.Dept, e.Name, e.Salary)
	}
	fmt.Println("відсортовано:", sort.IsSorted(ByDeptSalary(staff)))
}
`,
  "go-generic-funcs": raw`package main

import (
	"cmp"
	"fmt"
)

func Max[T cmp.Ordered](s []T) (T, bool) {
	var zero T
	if len(s) == 0 {
		return zero, false
	}
	m := s[0]
	for _, x := range s[1:] {
		if x > m {
			m = x
		}
	}
	return m, true
}

func IndexOf[T comparable](s []T, v T) int {
	for i, x := range s {
		if x == v {
			return i
		}
	}
	return -1
}

func Reverse[T any](s []T) []T {
	out := make([]T, len(s))
	for i, x := range s {
		out[len(s)-1-i] = x
	}
	return out
}

func main() {
	fmt.Println(Max([]int{3, 9, 4}))
	fmt.Println(Max([]string{"kiwi", "apple", "pear"}))
	fmt.Println(Max([]float64{}))
	fmt.Println(IndexOf([]string{"a", "b", "c"}, "c"))
	fmt.Println(IndexOf([]int{1, 2}, 7))
	orig := []int{1, 2, 3}
	fmt.Println(Reverse(orig), orig)
	fmt.Println(Reverse([]string{"a", "b"}))
}
`,
};
