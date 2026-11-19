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
  "go-regexp-log": raw`package main

import (
	"fmt"
	"regexp"
)

var lineRe = regexp.MustCompile(${BT}^\[(?P<level>[A-Z]+)\] (?P<user>\w+): (?P<msg>.*)$${BT})
var longNum = regexp.MustCompile(${BT}\d{4,}${BT})
var idRe = regexp.MustCompile(${BT}#\d+${BT})

func parse(line string) (level, user, msg string, ok bool) {
	m := lineRe.FindStringSubmatch(line)
	if m == nil {
		return "", "", "", false
	}
	return m[lineRe.SubexpIndex("level")], m[lineRe.SubexpIndex("user")], m[lineRe.SubexpIndex("msg")], true
}

func mask(s string) string {
	return longNum.ReplaceAllString(s, "****")
}

func ids(s string) []string {
	return idRe.FindAllString(s, -1)
}

func main() {
	lines := []string{"[INFO] ira: вхід виконано", "сміття", "[ERROR] taras: диск #12 повний"}
	for _, l := range lines {
		level, user, msg, ok := parse(l)
		if !ok {
			fmt.Println("пропущено:", l)
			continue
		}
		fmt.Println(ok, level, user, msg)
	}
	fmt.Println(mask("картка 4111111111111111, код 123"))
	fmt.Println(ids("задачі #12, #7 і #300"))
}
`,
  "go-template-invoice": raw`package main

import (
	"fmt"
	"strings"
	"text/template"
)

type Item struct {
	Name  string
	Qty   int
	Price float64
}

func (i Item) Line() float64 {
	return float64(i.Qty) * i.Price
}

type Invoice struct {
	Customer string
	Items    []Item
}

func (inv Invoice) Total() float64 {
	sum := 0.0
	for _, it := range inv.Items {
		sum += it.Line()
	}
	return sum
}

const tpl = "Рахунок для {{.Customer}}\n" +
	"{{range .Items}}- {{.Name}}: {{.Qty}} x {{money .Price}} = {{money .Line}}\n{{end}}" +
	"Разом: {{money .Total}}\n"

func render(tpl string, inv Invoice) (string, error) {
	t, err := template.New("inv").Funcs(template.FuncMap{
		"money": func(v float64) string { return fmt.Sprintf("%.2f", v) },
	}).Parse(tpl)
	if err != nil {
		return "", err
	}
	var b strings.Builder
	if err := t.Execute(&b, inv); err != nil {
		return "", err
	}
	return b.String(), nil
}

func main() {
	inv := Invoice{"Іра", []Item{{"Чай", 2, 45.5}, {"Кава", 1, 120}}}
	out, err := render(tpl, inv)
	fmt.Print(out)
	fmt.Println(err)
	_, err = render("{{.Missing}}", inv)
	fmt.Println("помилка шаблону:", err != nil)
}
`,
  "go-slog-audit": raw`package main

import (
	"fmt"
	"io"
	"log"
	"log/slog"
	"os"
)

func newLogger(w io.Writer, level slog.Level) *slog.Logger {
	return slog.New(slog.NewTextHandler(w, &slog.HandlerOptions{
		Level: level,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey && len(groups) == 0 {
				return slog.Attr{}
			}
			return a
		},
	}))
}

func handle(l *slog.Logger, user string, amount int) {
	l.Debug("деталі", "user", user)
	if amount > 1000 {
		l.Warn("велика сума", "user", user, "amount", amount)
		return
	}
	l.Info("оплата", "user", user, "amount", amount)
}

func main() {
	l := newLogger(os.Stdout, slog.LevelInfo).With("service", "pay")
	handle(l, "ira", 50)
	handle(l, "taras", 5000)

	legacy := log.New(os.Stdout, "[legacy] ", 0)
	legacy.Printf("готово: %d", 2)
	fmt.Println("кінець")
}
`,
  "go-cli-args": raw`package main

import (
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	N       int
	Name    string
	Verbose bool
	Files   []string
}

func parseArgs(args []string) (Config, error) {
	fs := flag.NewFlagSet("tool", flag.ContinueOnError)
	fs.SetOutput(io.Discard)
	n := fs.Int("n", 1, "кількість")
	name := fs.String("name", "світ", "ім'я")
	v := fs.Bool("v", false, "докладно")
	if err := fs.Parse(args); err != nil {
		return Config{}, err
	}
	return Config{N: *n, Name: *name, Verbose: *v, Files: fs.Args()}, nil
}

func reportPath(p string) string {
	base := strings.TrimSuffix(filepath.Base(p), filepath.Ext(p))
	return filepath.Join(filepath.Dir(p), base+".report.txt")
}

func envOr(key, def string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return def
}

func main() {
	cfg, err := parseArgs([]string{"-n", "3", "-v", "--name=Іра", "a.csv", "data/b.csv"})
	fmt.Println(cfg.N, cfg.Name, cfg.Verbose, cfg.Files, err)
	_, err = parseArgs([]string{"-n", "abc"})
	fmt.Println("помилка:", err != nil)
	for _, f := range cfg.Files {
		fmt.Println(reportPath(f))
	}
	os.Setenv("APP_REGION", "ua")
	fmt.Println(envOr("APP_REGION", "eu"), envOr("APP_UNSET_X", "eu"))
}
`,
  "go-fs-report": raw`package main

import (
	"errors"
	"fmt"
	"io/fs"
	"path"
	"strings"
	"testing/fstest"
)

func markdownFiles(fsys fs.FS) ([]string, error) {
	var out []string
	err := fs.WalkDir(fsys, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			if d.Name() == "vendor" {
				return fs.SkipDir
			}
			return nil
		}
		if path.Ext(p) == ".md" {
			out = append(out, p)
		}
		return nil
	})
	return out, err
}

func lines(fsys fs.FS, name string) (int, error) {
	data, err := fs.ReadFile(fsys, name)
	if err != nil {
		return 0, err
	}
	return len(strings.Split(string(data), "\n")), nil
}

func pngs(fsys fs.FS, dir string) ([]string, error) {
	sub, err := fs.Sub(fsys, dir)
	if err != nil {
		return nil, err
	}
	return fs.Glob(sub, "*.png")
}

func main() {
	fsys := fstest.MapFS{
		"README.md":     {Data: []byte("# Проєкт\nперший рядок")},
		"docs/guide.md": {Data: []byte("# Гід\nкрок один\nкрок два")},
		"docs/logo.png": {Data: []byte{0, 1, 2}},
		"vendor/lib.md": {Data: []byte("# чужий\n")},
	}
	files, err := markdownFiles(fsys)
	fmt.Println(files, err)
	n, err := lines(fsys, "docs/guide.md")
	fmt.Println(n, err)
	_, err = lines(fsys, "немає.md")
	fmt.Println(errors.Is(err, fs.ErrNotExist))
	list, err := pngs(fsys, "docs")
	fmt.Println(list, err)
}
`,
  "go-unicode-text": raw`package main

import (
	"fmt"
	"unicode"
	"unicode/utf8"
)

func capitalize(s string) string {
	r, size := utf8.DecodeRuneInString(s)
	if r == utf8.RuneError {
		return s
	}
	return string(unicode.ToUpper(r)) + s[size:]
}

func reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func truncate(s string, n int) string {
	i := 0
	for pos := range s {
		if i == n {
			return s[:pos]
		}
		i++
	}
	return s
}

func stats(s string) (letters, digits, spaces, other int) {
	for _, r := range s {
		switch {
		case unicode.IsLetter(r):
			letters++
		case unicode.IsDigit(r):
			digits++
		case unicode.IsSpace(r):
			spaces++
		default:
			other++
		}
	}
	return
}

func main() {
	fmt.Printf("%q %q %q\n", capitalize("їжак"), capitalize(""), capitalize("go"))
	fmt.Println(reverse("Привіт"))
	l, d, sp, o := stats("Go 1.24: привіт, світ!")
	fmt.Println(l, d, sp, o)
	fmt.Println(truncate("Дніпро — місто", 6), truncate("ab", 5))
	fmt.Println(utf8.ValidString(truncate("Дніпро", 3)))
}
`,
};
