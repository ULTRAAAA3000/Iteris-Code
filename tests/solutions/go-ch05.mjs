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
  "go-generic-stack": raw`package main

import "fmt"

type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(v T) {
	s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	last := len(s.items) - 1
	v := s.items[last]
	s.items = s.items[:last]
	return v, true
}

func (s *Stack[T]) Len() int {
	return len(s.items)
}

type Number interface {
	~int | ~float64
}

func SumStack[T Number](s *Stack[T]) T {
	var total T
	for _, x := range s.items {
		total += x
	}
	return total
}

type Score int

func main() {
	var s Stack[int]
	s.Push(1)
	s.Push(2)
	s.Push(3)
	fmt.Println(s.Len())
	v, ok := s.Pop()
	fmt.Println(v, ok)
	fmt.Println(s.Len(), SumStack(&s))

	var scores Stack[Score]
	scores.Push(10)
	scores.Push(5)
	fmt.Println(SumStack(&scores))

	var f Stack[float64]
	f.Push(1.5)
	f.Push(2.25)
	fmt.Println(SumStack(&f))

	var words Stack[string]
	w, ok := words.Pop()
	fmt.Printf("%q %v\n", w, ok)
}
`,
  "go-generic-collections": raw`package main

import "fmt"

func Map[T, U any](s []T, f func(T) U) []U {
	out := make([]U, 0, len(s))
	for _, x := range s {
		out = append(out, f(x))
	}
	return out
}

func Filter[T any](s []T, keep func(T) bool) []T {
	var out []T
	for _, x := range s {
		if keep(x) {
			out = append(out, x)
		}
	}
	return out
}

func Reduce[T, A any](s []T, init A, f func(A, T) A) A {
	acc := init
	for _, x := range s {
		acc = f(acc, x)
	}
	return acc
}

type Set[T comparable] map[T]struct{}

func (s Set[T]) Add(v T) {
	s[v] = struct{}{}
}

func (s Set[T]) Has(v T) bool {
	_, ok := s[v]
	return ok
}

func (s Set[T]) Len() int {
	return len(s)
}

func Unique[T comparable](s []T) []T {
	seen := Set[T]{}
	var out []T
	for _, v := range s {
		if !seen.Has(v) {
			seen.Add(v)
			out = append(out, v)
		}
	}
	return out
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6}
	fmt.Println(Map(nums, func(n int) int { return n * n }))
	fmt.Println(Map(nums, func(n int) string { return fmt.Sprintf("#%d", n) }))
	fmt.Println(Filter(nums, func(n int) bool { return n%2 == 0 }))
	fmt.Println(Reduce(nums, 0, func(acc, n int) int { return acc + n }))
	words := []string{"go", "rust", "c"}
	fmt.Println(Reduce(words, 0, func(acc int, w string) int { return acc + len(w) }))
	fmt.Println(nums)

	s := Set[string]{}
	s.Add("go")
	s.Add("go")
	s.Add("rust")
	fmt.Println(s.Len(), s.Has("go"), s.Has("c"))
	fmt.Println(Unique([]int{3, 1, 3, 2, 1}))
	fmt.Println(Unique([]string{"a", "a", "b"}))
}
`,
  "go-interface-design": raw`package main

import (
	"fmt"
	"maps"
	"slices"
)

type NameGetter interface {
	Get(id int) (string, bool)
}

type MemStore struct{ names map[int]string }

func NewMemStore() *MemStore {
	return &MemStore{names: map[int]string{1: "Оля", 2: "Тарас"}}
}

func (m *MemStore) Get(id int) (string, bool) {
	n, ok := m.names[id]
	return n, ok
}

func (m *MemStore) Put(id int, name string) { m.names[id] = name }
func (m *MemStore) Delete(id int)           { delete(m.names, id) }
func (m *MemStore) List() []string          { return slices.Sorted(maps.Values(m.names)) }

type Greeter struct{ names NameGetter }

func NewGreeter(n NameGetter) *Greeter { return &Greeter{names: n} }

func (g *Greeter) Greet(id int) string {
	if name, ok := g.names.Get(id); ok {
		return "Привіт, " + name + "!"
	}
	return "Привіт, незнайомцю!"
}

type stub struct{}

func (stub) Get(id int) (string, bool) { return "Тест", id == 7 }

func main() {
	g := NewGreeter(NewMemStore())
	fmt.Println(g.Greet(1))
	fmt.Println(g.Greet(9))
	t := NewGreeter(stub{})
	fmt.Println(t.Greet(7))
	fmt.Println(t.Greet(1))
}
`,
  "go-reflect-fields": raw`package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Name  string ${BT}json:"name" validate:"required"${BT}
	Email string ${BT}json:"email" validate:"required"${BT}
	Age   int    ${BT}json:"age"${BT}
	token string
}

func Describe(v any) []string {
	val := reflect.Indirect(reflect.ValueOf(v))
	if val.Kind() != reflect.Struct {
		return []string{"не структура: " + val.Kind().String()}
	}
	t := val.Type()
	var out []string
	for i := range t.NumField() {
		f := t.Field(i)
		if !f.IsExported() {
			continue
		}
		out = append(out, fmt.Sprintf("%s (%s) json=%s %#v", f.Name, f.Type, f.Tag.Get("json"), val.Field(i).Interface()))
	}
	return out
}

func MissingRequired(v any) []string {
	val := reflect.Indirect(reflect.ValueOf(v))
	if val.Kind() != reflect.Struct {
		return nil
	}
	t := val.Type()
	var out []string
	for i := range t.NumField() {
		f := t.Field(i)
		if f.Tag.Get("validate") == "required" && val.Field(i).IsZero() {
			out = append(out, f.Name)
		}
	}
	return out
}

func main() {
	u := User{Name: "Ada", Age: 36, token: "x"}
	for _, line := range Describe(u) {
		fmt.Println(line)
	}
	fmt.Println(MissingRequired(u))
	fmt.Println(MissingRequired(&User{Name: "Bob", Email: "b@x.ua"}))
	fmt.Println(Describe(42))
}
`,
};
