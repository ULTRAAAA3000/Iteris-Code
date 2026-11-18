const raw = String.raw;
const BT = "`";

export const SOLUTIONS_08 = {
  "go-strings-report": raw`package main

import (
	"fmt"
	"strings"
)

func slug(title string) string {
	return strings.ToLower(strings.Join(strings.Fields(title), "-"))
}

func render(pairs []string) string {
	var b strings.Builder
	for _, p := range pairs {
		key, value, ok := strings.Cut(p, "=")
		if !ok {
			continue
		}
		fmt.Fprintf(&b, "%s -> %s\n", strings.TrimSpace(key), strings.TrimSpace(value))
	}
	return b.String()
}

func main() {
	fmt.Println(slug("  Hello   Go World "))
	fmt.Print(render([]string{" a = 1", "без знака", "b=2 "}))
}
`,
  "go-bufio-stats": raw`package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"
)

func stats(r io.Reader) (lines, words int) {
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		lines++
		words += len(strings.Fields(sc.Text()))
	}
	return lines, words
}

func main() {
	text := "один два три\n\nчотири п'ять\nшість сім вісім дев'ять\n"
	lines, words := stats(strings.NewReader(text))
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()
	fmt.Fprintf(out, "рядків: %d\n", lines)
	fmt.Fprintf(out, "слів: %d\n", words)
}
`,
  "go-time-deadline": raw`package main

import (
	"fmt"
	"time"
)

func parseDate(s string) (time.Time, error) {
	return time.Parse("2006-01-02", s)
}

func daysBetween(a, b time.Time) int {
	return int(b.Sub(a).Hours() / 24)
}

func deadline(t time.Time, hours int) string {
	return t.Add(time.Duration(hours) * time.Hour).Format("02.01.2006 15:04")
}

func main() {
	start, _ := parseDate("2026-03-01")
	end, _ := parseDate("2026-04-15")
	fmt.Println("днів у проєкті:", daysBetween(start, end))
	fmt.Println("дедлайн:", deadline(end, 36))
	fmt.Println("день тижня:", end.Weekday())
	_, err := parseDate("2026-13-01")
	fmt.Println("помилка для 13-го місяця:", err != nil)
}
`,
  "go-math-toolkit": raw`package main

import (
	"fmt"
	"math"
	"math/rand"
)

func roundTo(x float64, places int) float64 {
	p := math.Pow(10, float64(places))
	return math.Round(x*p) / p
}

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < 1e-9
}

func dice(r *rand.Rand, n int) []int {
	out := make([]int, 0, n)
	for range n {
		out = append(out, r.Intn(6)+1)
	}
	return out
}

func main() {
	fmt.Println(roundTo(3.14159, 2), roundTo(-2.5, 0), roundTo(1234.5678, 1))
	x, y := 0.1, 0.2
	fmt.Println("рівні:", x+y == 0.3, almostEqual(x+y, 0.3))
	r := rand.New(rand.NewSource(42))
	rolls := dice(r, 100)
	ok := len(rolls) == 100
	for _, v := range rolls {
		if v < 1 || v > 6 {
			ok = false
		}
	}
	fmt.Println("кубики коректні:", ok)
}
`,
  "go-json-product": raw`package main

import (
	"encoding/json"
	"fmt"
)

type Product struct {
	Name   string   ${BT}json:"name"${BT}
	Price  float64  ${BT}json:"price"${BT}
	Stock  int      ${BT}json:"stock,omitempty"${BT}
	Secret string   ${BT}json:"-"${BT}
	Tags   []string ${BT}json:"tags,omitempty"${BT}
}

func encode(p Product) (string, error) {
	b, err := json.Marshal(p)
	return string(b), err
}

func decode(s string) (Product, error) {
	var p Product
	err := json.Unmarshal([]byte(s), &p)
	return p, err
}

func main() {
	s, _ := encode(Product{Name: "Чай", Price: 45.5, Secret: "pw"})
	fmt.Println(s)
	p, err := decode(${BT}{"name":"Кава","price":120,"stock":3,"tags":["арабіка"],"secret":"hack"}${BT})
	fmt.Printf("%s %.0f %d %v %q %v\n", p.Name, p.Price, p.Stock, p.Tags, p.Secret, err)
	_, err = decode(${BT}{"name":${BT})
	fmt.Println("помилка:", err != nil)
}
`,
  "go-json-role": raw`package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Role int

const (
	Guest Role = iota
	Admin
)

type User struct {
	Name string ${BT}json:"name"${BT}
	Role Role   ${BT}json:"role"${BT}
}

func (r Role) MarshalJSON() ([]byte, error) {
	if r == Admin {
		return json.Marshal("admin")
	}
	return json.Marshal("guest")
}

func (r *Role) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	switch s {
	case "guest":
		*r = Guest
	case "admin":
		*r = Admin
	default:
		return fmt.Errorf("невідома роль %q", s)
	}
	return nil
}

func decodeStrict(s string) (User, error) {
	var u User
	dec := json.NewDecoder(strings.NewReader(s))
	dec.DisallowUnknownFields()
	err := dec.Decode(&u)
	return u, err
}

func main() {
	b, _ := json.Marshal(User{Name: "Іра", Role: Admin})
	fmt.Println(string(b))

	var back User
	err := json.Unmarshal([]byte(${BT}{"name":"Тарас","role":"guest"}${BT}), &back)
	fmt.Println(back.Name, back.Role == Guest, err)

	err = json.Unmarshal([]byte(${BT}{"name":"Х","role":"root"}${BT}), &back)
	fmt.Println("невідома роль:", err != nil)

	_, err = decodeStrict(${BT}{"name":"Я","role":"admin","extra":1}${BT})
	fmt.Println(err)
}
`,
};
