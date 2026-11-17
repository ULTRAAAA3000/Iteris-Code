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
};
