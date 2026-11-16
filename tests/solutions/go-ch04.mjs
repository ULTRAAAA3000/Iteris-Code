const raw = String.raw;
const BT = "`";

export const SOLUTIONS_04 = {
  "go-struct-inventory": raw`package main

import "fmt"

type Product struct {
	Name  string
	Price int
	Qty   int
}

func total(items []Product) int {
	sum := 0
	for _, it := range items {
		sum += it.Price * it.Qty
	}
	return sum
}

func restock(items []Product, qty int) {
	for i := range items {
		items[i].Qty += qty
	}
}

func main() {
	items := []Product{
		{Name: "Зошит", Price: 30, Qty: 4},
		{Name: "Ручка", Price: 12, Qty: 10},
	}
	restock(items, 5)
	for _, it := range items {
		fmt.Println(it.Name, it.Qty)
	}
	fmt.Println("Разом:", total(items))
}
`,
  "go-pointers-swap": raw`package main

import "fmt"

type Account struct {
	Owner   string
	Balance int
}

func swap(a, b *int) {
	*a, *b = *b, *a
}

func deposit(acc *Account, sum int) {
	acc.Balance += sum
}

func balanceOf(acc *Account) int {
	if acc == nil {
		return -1
	}
	return acc.Balance
}

func main() {
	x, y := 3, 8
	swap(&x, &y)
	fmt.Println(x, y)

	acc := Account{Owner: "Ірина"}
	deposit(&acc, 100)
	deposit(&acc, 50)
	fmt.Println(acc.Owner, acc.Balance)

	var none *Account
	fmt.Println(balanceOf(none), balanceOf(&acc))
}
`,
  "go-methods-basics": raw`package main

import "fmt"

type Rect struct {
	W, H int
}

func (r Rect) Area() int {
	return r.W * r.H
}

func (r Rect) Perimeter() int {
	return 2 * (r.W + r.H)
}

type Celsius float64

func (c Celsius) Fahrenheit() float64 {
	return float64(c)*9/5 + 32
}

func main() {
	r := Rect{W: 6, H: 4}
	fmt.Println(r.Area(), r.Perimeter())
	fmt.Println(Celsius(100).Fahrenheit())
	fmt.Println(Celsius(-40).Fahrenheit())
}
`,
};
