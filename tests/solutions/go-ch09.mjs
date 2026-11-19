const raw = String.raw;
const BT = "`";

export const SOLUTIONS_09 = {
  "go-pkg-visibility": raw`package main

import (
	"fmt"
	"strings"
	"unicode"
)

func isExported(name string) bool {
	for _, r := range name {
		return unicode.IsUpper(r)
	}
	return false
}

func canImport(importer, target string) bool {
	i := strings.Index(target, "/internal/")
	if i < 0 {
		return true
	}
	parent := target[:i]
	return importer == parent || strings.HasPrefix(importer, parent+"/")
}

func main() {
	for _, n := range []string{"Server", "server", "_Hidden", "Ünit", ""} {
		fmt.Printf("%q: %t\n", n, isExported(n))
	}
	target := "example.com/app/internal/store"
	for _, imp := range []string{
		"example.com/app/cmd/api",
		"example.com/app",
		"example.com/appx/cmd",
		"example.com/other/tool",
	} {
		fmt.Printf("%s -> %t\n", imp, canImport(imp, target))
	}
	fmt.Println(canImport("example.com/other/tool", "example.com/app/pkg/slug"))
}
`,
  "go-table-test": raw`package main

import "fmt"

func Sign(n int) int {
	if n > 0 {
		return 1
	}
	if n < 0 {
		return -1
	}
	return 0
}

type testCase struct {
	name string
	n    int
	want int
}

func main() {
	tests := []testCase{
		{"нуль", 0, 0},
		{"додатне", 10, 1},
		{"від'ємне", -7, -1},
		{"одиниця", 1, 1},
		{"мінус одиниця", -1, -1},
	}
	passed := 0
	for _, tt := range tests {
		got := Sign(tt.n)
		if got != tt.want {
			fmt.Printf("FAIL %s: Sign(%d) = %d; want %d\n", tt.name, tt.n, got, tt.want)
			continue
		}
		fmt.Printf("ok   %s\n", tt.name)
		passed++
	}
	fmt.Printf("Пройдено %d з %d\n", passed, len(tests))
}
`,
  "go-fake-sender": raw`package main

import (
	"errors"
	"fmt"
)

var errFake = errors.New("fake: send failed")

type Sender interface {
	Send(to, msg string) error
}

func Notify(s Sender, users []string, msg string) (int, error) {
	sent := 0
	for _, u := range users {
		if err := s.Send(u, msg); err != nil {
			return sent, fmt.Errorf("notify %s: %w", u, err)
		}
		sent++
	}
	return sent, nil
}

type fakeSender struct {
	sent   []string
	failOn string
}

var _ Sender = (*fakeSender)(nil)

func (f *fakeSender) Send(to, msg string) error {
	if to == f.failOn {
		return errFake
	}
	f.sent = append(f.sent, to+":"+msg)
	return nil
}

func main() {
	ok := &fakeSender{}
	n, err := Notify(ok, []string{"a", "b", "c"}, "hi")
	fmt.Println(n, err, ok.sent)

	bad := &fakeSender{failOn: "b"}
	n, err = Notify(bad, []string{"a", "b", "c"}, "hi")
	fmt.Println(n, err, bad.sent)
	fmt.Println(errors.Is(err, errFake))
}
`,
  "go-bench-allocs": raw`package main

import (
	"flag"
	"fmt"
	"strings"
	"testing"
)

var sink string

func joinPlus(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += "x"
	}
	return s
}

func joinBuilder(n int) string {
	var b strings.Builder
	b.Grow(n)
	for i := 0; i < n; i++ {
		b.WriteByte('x')
	}
	return b.String()
}

func allocsPerOp(f func() string) int64 {
	r := testing.Benchmark(func(b *testing.B) {
		b.ReportAllocs()
		for i := 0; i < b.N; i++ {
			sink = f()
		}
	})
	return r.AllocsPerOp()
}

func main() {
	testing.Init()
	flag.Set("test.benchtime", "200x")
	plus := allocsPerOp(func() string { return joinPlus(100) })
	builder := allocsPerOp(func() string { return joinBuilder(100) })
	fmt.Println("плюс виділяє на кожне склеювання:", plus >= 90)
	fmt.Println("Builder: одне виділення:", builder == 1)
	fmt.Println("Builder економніший:", builder < plus)
}
`,
  "go-fuzz-reverse": raw`package main

import (
	"fmt"
	"math/rand"
	"unicode/utf8"
)

func Reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func property(s string) bool {
	r := Reverse(s)
	return utf8.ValidString(r) && Reverse(Reverse(s)) == s
}

func main() {
	rng := rand.New(rand.NewSource(1))
	alphabet := []rune("abc Zб世é")
	inputs := []string{"", "hello", "Привіт"}
	for i := 0; i < 200; i++ {
		out := make([]rune, rng.Intn(8))
		for j := range out {
			out[j] = alphabet[rng.Intn(len(alphabet))]
		}
		inputs = append(inputs, string(out))
	}
	bad := 0
	for _, s := range inputs {
		if !property(s) {
			bad++
		}
	}
	fmt.Printf("перевірено входів: %d\n", len(inputs))
	fmt.Printf("порушень: %d\n", bad)
}
`,
  "go-idioms-refactor": raw`package main

import (
	"errors"
	"fmt"
)

func makeLabel(name string, age int) (string, error) {
	if name == "" {
		return "", errors.New("порожнє ім'я")
	}
	if age < 0 {
		return "", errors.New("вік від'ємний")
	}
	return fmt.Sprintf("%s (%d)", name, age), nil
}

type Registry struct {
	m map[string]int
}

func (r *Registry) Add(key string) {
	if r.m == nil {
		r.m = make(map[string]int)
	}
	r.m[key]++
}

func (r *Registry) Count(key string) int {
	return r.m[key]
}

func main() {
	people := []struct {
		name string
		age  int
	}{{"Ада", 36}, {"Грейс", -1}, {"", 5}}
	for _, p := range people {
		label, err := makeLabel(p.name, p.age)
		if err != nil {
			fmt.Println("помилка:", err)
			continue
		}
		fmt.Println(label)
	}

	var r Registry
	r.Add("a")
	r.Add("a")
	r.Add("b")
	fmt.Printf("a=%d b=%d c=%d\n", r.Count("a"), r.Count("b"), r.Count("c"))
}
`,
};
