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
  "go-receivers-counter": raw`package main

import "fmt"

type Counter struct {
	N int
}

func (c *Counter) Inc() {
	c.N++
}

func (c *Counter) Add(n int) {
	c.N += n
}

func (c *Counter) Value() int {
	return c.N
}

type Point struct {
	X, Y int
}

func (p Point) Add(q Point) Point {
	return Point{p.X + q.X, p.Y + q.Y}
}

func main() {
	var c Counter
	c.Inc()
	c.Inc()
	c.Add(10)
	fmt.Println(c.Value())

	counters := []Counter{{}, {}}
	counters[1].Inc()
	fmt.Println(counters[0].Value(), counters[1].Value())

	p := Point{1, 2}.Add(Point{3, 4})
	fmt.Println(p)
}
`,
  "go-embedding-base": raw`package main

import "fmt"

type Base struct {
	ID     int
	Author string
}

func (b Base) Info() string {
	return fmt.Sprintf("#%d від %s", b.ID, b.Author)
}

type Article struct {
	Base
	Title string
}

type Comment struct {
	Base
	Text string
}

func (c Comment) Info() string {
	return c.Base.Info() + ": " + c.Text
}

func main() {
	a := Article{Base: Base{ID: 1, Author: "Ірина"}, Title: "Go"}
	c := Comment{Base: Base{ID: 2, Author: "Олег"}, Text: "Дякую"}
	fmt.Println(a.Info())
	fmt.Println(c.Info())
	fmt.Println(a.Author, c.Base.ID)
}
`,
  "go-iota-level": raw`package main

import "fmt"

type Level int

const (
	Debug Level = iota
	Info
	Warn
	Error
)

var levelNames = [...]string{"DEBUG", "INFO", "WARN", "ERROR"}

func (l Level) String() string {
	if l < 0 || int(l) >= len(levelNames) {
		return fmt.Sprintf("Level(%d)", int(l))
	}
	return levelNames[l]
}

func main() {
	fmt.Println(Debug, Info, Warn, Error)
	fmt.Printf("%v %d\n", Warn, Warn)
	fmt.Println(Level(9))
	fmt.Println(Warn >= Info)
}
`,
  "go-compare-copy": raw`package main

import (
	"fmt"
	"reflect"
)

type Point struct {
	X, Y int
}

func distinct(pts []Point) int {
	seen := map[Point]bool{}
	for _, p := range pts {
		seen[p] = true
	}
	return len(seen)
}

type Team struct {
	Name    string
	Members []string
}

func (t Team) Clone() Team {
	members := make([]string, len(t.Members))
	copy(members, t.Members)
	t.Members = members
	return t
}

type User struct {
	Name  string ${BT}json:"name"${BT}
	Email string ${BT}json:"email,omitempty"${BT}
	Age   int    ${BT}json:"-"${BT}
}

func main() {
	pts := []Point{{1, 2}, {3, 4}, {1, 2}, {3, 4}, {5, 6}}
	fmt.Println(distinct(pts))

	a := Team{"Alpha", []string{"Ірина", "Олег"}}
	b := a.Clone()
	b.Members[0] = "Марко"
	fmt.Println(a.Members, b.Members)

	t := reflect.TypeOf(User{})
	for i := range t.NumField() {
		f := t.Field(i)
		fmt.Printf("%s %q\n", f.Name, f.Tag.Get("json"))
	}
}
`,
  "go-functional-options": raw`package main

import "fmt"

type Server struct {
	host    string
	port    int
	tls     bool
	timeout int
}

type Option func(*Server)

func WithPort(p int) Option {
	return func(s *Server) {
		s.port = p
	}
}

func WithTLS() Option {
	return func(s *Server) {
		s.tls = true
	}
}

func WithTimeout(sec int) Option {
	return func(s *Server) {
		s.timeout = sec
	}
}

func NewServer(host string, opts ...Option) *Server {
	s := &Server{host: host, port: 8080, timeout: 30}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

func main() {
	a := NewServer("localhost")
	b := NewServer("example.com", WithPort(443), WithTLS(), WithTimeout(5))
	c := NewServer("x.io", WithPort(1), WithPort(9000))
	fmt.Printf("%+v\n", *a)
	fmt.Printf("%+v\n", *b)
	fmt.Println(c.port)
}
`,
  "go-memory-layout": raw`package main

import (
	"fmt"
	"unsafe"
)

type Bad struct {
	Active bool
	ID     int64
	Flag   bool
	Count  int32
	Small  int8
}

type Good struct {
	ID     int64
	Count  int32
	Active bool
	Flag   bool
	Small  int8
}

func savedBytes(n int) uintptr {
	return uintptr(n) * (unsafe.Sizeof(Bad{}) - unsafe.Sizeof(Good{}))
}

func main() {
	fmt.Println(unsafe.Sizeof(Bad{}), unsafe.Sizeof(Good{}))
	fmt.Println(savedBytes(1000000))
}
`,
};
