import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "go-pkg-visibility", lesson: "go/86", xp: 30,
    title: "Видимість і правило internal",
    context: "Кордони пакетів перевіряє компілятор: експортується лише те, що з великої літери, а internal закритий для чужих модулів. У Playground пакетів немає, тому правила доведеться запровадити самим на рядках: так видно, як вони влаштовані.",
    brief: [
      "Допишіть <code>isExported(name)</code>: ім'я експортується, якщо його <b>перша руна</b> велика літера Unicode (<code>unicode.IsUpper</code>). Порожнє ім'я не експортується.",
      "Допишіть <code>canImport(importer, target)</code> за правилом <code>internal</code>: якщо шлях <code>target</code> містить <code>/internal/</code>, його можна імпортувати лише з коду, чий шлях дорівнює батьківському шляху (усе до <code>/internal/</code>) або починається з нього плюс <code>/</code>. Для решти шляхів відповідь завжди <code>true</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"strings"
	"unicode"
)

func isExported(name string) bool {
	return false
}

func canImport(importer, target string) bool {
	return true
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
	_ = strings.Index
	_ = unicode.IsUpper
}
`,
    checks: [
      { on: "stdout", name: "Експорт за першою літерою", has: "\"Server\": true\n\"server\": false\n\"_Hidden\": false\n\"Ünit\": true\n\"\": false", hint: "Візьміть першу руну через for _, r := range name і поверніть unicode.IsUpper(r); для порожнього рядка цикл не виконається" },
      { on: "stdout", name: "Свій модуль імпортує internal", has: "example.com/app/cmd/api -> true\nexample.com/app -> true", hint: "Батьківський шлях: target[:strings.Index(target, \"/internal/\")]; importer має дорівнювати йому або починатися з нього + \"/\"" },
      { on: "stdout", name: "Чужий код не імпортує internal", has: "example.com/appx/cmd -> false\nexample.com/other/tool -> false", hint: "Префікс «example.com/app» без слеша збігається з «example.com/appx»: порівнюйте з parent + \"/\"" },
      { on: "stdout", name: "Звичайний пакет відкритий усім", has: "example.com/other/tool -> false\ntrue", hint: "Для шляхів без /internal/ повертайте true" },
      { on: "source", name: "Використано unicode.IsUpper", matches: "unicode\\.IsUpper\\(", hint: "Експорт у Go визначається великою літерою першого символу" },
      { on: "source", name: "Використано strings.HasPrefix або Index", matches: "strings\\.(HasPrefix|Index|Contains)\\(", hint: "Розбирайте шлях функціями пакета strings" },
    ],
  },
  {
    ...base, id: "go-table-test", lesson: "go/87", xp: 40,
    title: "Табличний тест і виправлення помилки",
    context: "Табличний тест — головний стиль тестів у Go: таблиця випадків і цикл по ній. Нова помилка = новий рядок у таблиці. Тут ви напишете такий цикл самі, у форматі <code>go test -v</code>, і знайдете за ним баг.",
    brief: [
      "У <code>main</code> пройдіть по таблиці <code>tests</code>. Для кожного випадку викличте <code>Sign(tt.n)</code>: якщо результат збігається з <code>tt.want</code>, виведіть <code>ok   &lt;назва&gt;</code> і збільште <code>passed</code>, інакше виведіть <code>FAIL &lt;назва&gt;: Sign(&lt;n&gt;) = &lt;got&gt;; want &lt;want&gt;</code>.",
      "Один випадок спочатку не пройде: у <code>Sign</code> є помилка з нулем. Знайдіть її за виводом тесту й виправте, щоб підсумок став «Пройдено 5 з 5».",
    ],
    starter: raw`package main

import "fmt"

func Sign(n int) int {
	if n > 0 {
		return 1
	}
	return -1
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

	fmt.Printf("Пройдено %d з %d\n", passed, len(tests))
}
`,
    checks: [
      { on: "stdout", name: "Кожен випадок виводиться як ok", has: "ok   нуль\nok   додатне\nok   від'ємне\nok   одиниця\nok   мінус одиниця", hint: "Для кожного tt виведіть fmt.Printf(\"ok   %s\\n\", tt.name), коли got == tt.want" },
      { on: "stdout", name: "Підсумок: Пройдено 5 з 5", has: "Пройдено 5 з 5", hint: "Збільшуйте passed на кожному успішному випадку; а нуль має давати 0" },
      { on: "stdout", name: "Жодного FAIL", has: "FAIL", not: true, hint: "Спершу побачте FAIL для нуля, потім виправте Sign" },
      { on: "source", name: "Цикл по таблиці", matches: "range\\s+tests", hint: "for _, tt := range tests { ... }" },
      { on: "source", name: "Повідомлення про провал у форматі got/want", matches: "FAIL", hint: "У гілці провалу друкуйте FAIL, назву, отримане й очікуване" },
    ],
  },
  {
    ...base, id: "go-fake-sender", lesson: "go/88", xp: 30,
    title: "Фейк через інтерфейс",
    context: "Щоб перевірити розсилку без справжньої пошти, залежність ховають за малим інтерфейсом, а в тесті підставляють фейк, що запам'ятовує виклики й уміє «ламатися» на потрібній адресі.",
    brief: [
      "Допишіть метод <code>Send</code> для <code>*fakeSender</code>: якщо <code>to</code> дорівнює <code>failOn</code>, поверніть <code>errFake</code>, інакше додайте у <code>sent</code> запис <code>to:msg</code> і поверніть <code>nil</code>.",
      "Додайте перевірку на етапі компіляції, що <code>*fakeSender</code> реалізує <code>Sender</code>: <code>var _ Sender = (*fakeSender)(nil)</code>.",
    ],
    starter: raw`package main

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

func (f *fakeSender) Send(to, msg string) error {
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
    checks: [
      { on: "stdout", name: "Успішна розсилка записана у фейк", has: "3 <nil> [a:hi b:hi c:hi]", hint: "У гілці успіху: f.sent = append(f.sent, to+\":\"+msg)" },
      { on: "stdout", name: "Збій на другому адресаті", has: "1 notify b: fake: send failed [a:hi]", hint: "Якщо to == f.failOn, поверніть errFake і нічого не записуйте" },
      { on: "stdout", name: "Помилку можна розпізнати через errors.Is", has: "[a:hi]\ntrue", hint: "Notify обгортає помилку через %w, тож errFake має бути поверненою без змін" },
      { on: "source", name: "Перевірка реалізації інтерфейсу", matches: "var\\s+_\\s+Sender\\s*=\\s*\\(\\*fakeSender\\)\\(nil\\)", hint: "var _ Sender = (*fakeSender)(nil)" },
      { on: "source", name: "Фейк записує виклики", matches: "append\\(f\\.sent", hint: "Запам'ятовуйте кожен успішний виклик у f.sent" },
    ],
  },
  {
    ...base, id: "go-bench-allocs", lesson: "go/89", xp: 45,
    title: "Виміряти виділення пам'яті через testing.Benchmark",
    context: "Час у бенчмарку хитається, а кількість виділень стабільна, тому оптимізацію доводять саме нею. testing.Benchmark дозволяє зробити це прямо з main.",
    brief: [
      "Допишіть <code>allocsPerOp(f)</code>: запустіть <code>testing.Benchmark</code>, у ньому викличте <code>b.ReportAllocs()</code> і в циклі <code>b.N</code> (або <code>b.Loop()</code>) присвойте результат <code>f()</code> у <code>sink</code>, щоб компілятор його не викинув.",
      "Поверніть <code>r.AllocsPerOp()</code>. Тоді <code>main</code> покаже, що <code>+=</code> виділяє пам'ять на кожне склеювання, а <code>Builder</code> з <code>Grow</code> обходиться одним виділенням. Часи не друкуємо.",
    ],
    starter: raw`package main

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
	return 0
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
    checks: [
      { on: "stdout", name: "Плюс виділяє пам'ять на кожному кроці", has: "плюс виділяє на кожне склеювання: true", hint: "AllocsPerOp для += у циклі зі 100 кроків близько 99" },
      { on: "stdout", name: "Builder робить одне виділення", has: "Builder: одне виділення: true", hint: "Поверніть r.AllocsPerOp() із результату testing.Benchmark" },
      { on: "stdout", name: "Builder економніший", has: "Builder економніший: true" },
      { on: "source", name: "Використано testing.Benchmark", matches: "testing\\.Benchmark\\(", hint: "r := testing.Benchmark(func(b *testing.B) { ... })" },
      { on: "source", name: "Цикл бенчмарку", matches: "b\\.N|b\\.Loop\\(", hint: "for i := 0; i < b.N; i++ або for b.Loop()" },
      { on: "source", name: "Результат пишеться в sink", matches: "sink\\s*=\\s*f\\(\\)", hint: "sink = f() не дає оптимізатору викинути виклик" },
    ],
  },
  {
    ...base, id: "go-fuzz-reverse", lesson: "go/90", xp: 45,
    title: "Ручний фазер для Reverse",
    context: "Fuzzing перевіряє властивості на сотнях автоматично породжених входів. У Playground fuzz-тестів немає, але детермінований генератор і цикл дають ту саму ідею: знайти вхід, на якому властивість ламається.",
    brief: [
      "Допишіть <code>property(s)</code>: вона має повертати <code>true</code>, коли <code>Reverse(s)</code> є валідним UTF-8 (<code>utf8.ValidString</code>) і подвійне перевертання повертає початковий рядок (<code>Reverse(Reverse(s)) == s</code>).",
      "Із цією властивістю фазер знайде порушення: <code>Reverse</code> перевертає байти й ламає кирилицю та ієрогліфи. Перепишіть <code>Reverse</code> через <code>[]rune</code>, щоб порушень стало <code>0</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"math/rand"
	"unicode/utf8"
)

var _ = utf8.ValidString

func Reverse(s string) string {
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

func property(s string) bool {
	return false
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
    checks: [
      { on: "stdout", name: "Перевірено всі входи", has: "перевірено входів: 203", hint: "Цей рядок друкує main, змінювати кількість входів не треба" },
      { on: "stdout", name: "Порушень немає", has: "порушень: 0", hint: "Спершу property має справді перевіряти, потім виправте Reverse (байти ламають багатобайтові символи)" },
      { on: "source", name: "Властивість перевіряє валідність UTF-8", matches: "utf8\\.ValidString\\(", hint: "utf8.ValidString(Reverse(s))" },
      { on: "source", name: "Властивість перевіряє подвійне перевертання", matches: "Reverse\\(Reverse\\(", hint: "Reverse(Reverse(s)) == s" },
      { on: "source", name: "Reverse працює з рунами", matches: "\\[\\]rune\\(s\\)", hint: "r := []rune(s), поміняйте місцями елементи й поверніть string(r)" },
    ],
  },
  {
    ...base, id: "go-idioms-refactor", lesson: "go/91", xp: 35,
    title: "Ідіоматичний рефакторинг",
    context: "Лінтери й рев'ю щодня вимагають одного: плоский код із раннім виходом, error останнім і типи, що працюють без конструктора.",
    brief: [
      "Перепишіть <code>makeLabel</code> з ранніми <code>return</code> без жодного <code>else</code> і змініть сигнатуру на <code>(string, error)</code>: <code>error</code> має бути останнім. Оновіть виклик у <code>main</code>.",
      "Зробіть <code>Registry</code> придатним без конструктора: у <code>Add</code> ліниво створіть мапу, якщо вона <code>nil</code>, щоб <code>var r Registry</code> працював.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

func makeLabel(name string, age int) (error, string) {
	var err error
	var label string
	if name != "" {
		if age >= 0 {
			label = fmt.Sprintf("%s (%d)", name, age)
		} else {
			err = errors.New("вік від'ємний")
		}
	} else {
		err = errors.New("порожнє ім'я")
	}
	return err, label
}

type Registry struct {
	m map[string]int
}

func (r *Registry) Add(key string) {
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
		err, label := makeLabel(p.name, p.age)
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
    checks: [
      { on: "stdout", name: "Мітки й помилки виведено", has: "Ада (36)\nпомилка: вік від'ємний\nпомилка: порожнє ім'я", hint: "Перевіряйте name == \"\" і age < 0 на початку, кожну гілку завершуйте return" },
      { on: "stdout", name: "Registry працює з нульовим значенням", has: "a=2 b=1 c=0", hint: "У Add: if r.m == nil { r.m = make(map[string]int) }" },
      { on: "source", name: "error останній у результатах", matches: "makeLabel\\(name string, age int\\) \\(string, error\\)", hint: "func makeLabel(name string, age int) (string, error)" },
      { on: "source", name: "Немає else", matches: "\\belse\\b", not: true, hint: "Після return else не потрібен: виходьте раніше" },
      { on: "source", name: "Лінива ініціалізація мапи", matches: "r\\.m\\s*==\\s*nil", hint: "Створіть мапу лише тоді, коли вона ще nil" },
    ],
  },
];
