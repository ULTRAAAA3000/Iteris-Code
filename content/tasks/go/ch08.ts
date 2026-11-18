import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "go-strings-report", lesson: "go/74", xp: 25,
    title: "Слаг і звіт із пар",
    context: "Розбір тексту й складання звіту — щоденна робота: з назви статті роблять URL-слаг, а рядки ключ=значення з конфігурації перетворюють на читабельний вивід.",
    brief: [
      "Допишіть <code>slug</code>: розбийте заголовок на слова через <code>strings.Fields</code>, з'єднайте їх через <code>strings.Join</code> дефісом і переведіть у нижній регістр.",
      "Допишіть <code>render</code>: для кожного елемента <code>ключ=значення</code> розріжте рядок через <code>strings.Cut</code>, приберіть пробіли з обох частин через <code>TrimSpace</code> і допишіть у <code>strings.Builder</code> рядок <code>ключ -> значення</code>. Елементи без знака <code>=</code> пропустіть.",
    ],
    starter: raw`package main

import (
	"fmt"
	"strings"
)

func slug(title string) string {
	return strings.ToLower(title)
}

func render(pairs []string) string {
	var b strings.Builder
	return b.String()
}

func main() {
	fmt.Println(slug("  Hello   Go World "))
	fmt.Print(render([]string{" a = 1", "без знака", "b=2 "}))
}
`,
    checks: [
      { on: "stdout", name: "Слаг зібрано", has: "hello-go-world", hint: "Fields прибирає зайві пробіли, Join з'єднує через \"-\"" },
      { on: "stdout", name: "Пари виведено", has: "a -> 1\nb -> 2", hint: "Після Cut обріжте обидві частини через TrimSpace; елементи з ok == false пропустіть" },
      { on: "source", name: "Використано strings.Cut", matches: "strings\\.Cut\\(", hint: "key, value, ok := strings.Cut(pair, \"=\")" },
      { on: "source", name: "Використано strings.Fields", matches: "strings\\.Fields\\(", hint: "strings.Fields розбиває за будь-якими пробілами" },
      { on: "source", name: "Звіт будується через Builder", matches: "(WriteString|Fprintf|Fprintln)\\(", hint: "Дописуйте в b через b.WriteString або fmt.Fprintf(&b, ...)" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "hello-go-world\na -> 1\nb -> 2" },
    ],
  },
  {
    ...base, id: "go-bufio-stats", lesson: "go/75", xp: 25,
    title: "Рядки й слова з тексту",
    context: "Утиліта типу wc читає потік і рахує рядки та слова. Читати треба з io.Reader, тоді функцію можна перевірити зі strings.NewReader, а в реальній програмі підставити os.Stdin або файл.",
    brief: [
      "Допишіть <code>stats(r io.Reader)</code>: прочитайте <code>bufio.Scanner</code> по рядках, порахуйте рядки (порожні теж) і слова (через <code>strings.Fields</code> кожного рядка).",
      "У <code>main</code> вивід іде через <code>bufio.Writer</code>. Без <code>Flush</code> нічого не з'явиться: додайте виклик у потрібному місці.",
    ],
    starter: raw`package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"
)

func stats(r io.Reader) (lines, words int) {
	return 0, 0
}

func main() {
	text := "один два три\n\nчотири п'ять\nшість сім вісім дев'ять\n"
	lines, words := stats(strings.NewReader(text))
	out := bufio.NewWriter(os.Stdout)
	fmt.Fprintf(out, "рядків: %d\n", lines)
	fmt.Fprintf(out, "слів: %d\n", words)
}
`,
    checks: [
      { on: "stdout", name: "Рядки пораховано", has: "рядків: 4", hint: "Кожен успішний Scan() — один рядок, навіть порожній" },
      { on: "stdout", name: "Слова пораховано", has: "слів: 9", hint: "len(strings.Fields(sc.Text())) для кожного рядка" },
      { on: "source", name: "Читання через bufio.Scanner", matches: "bufio\\.NewScanner\\(", hint: "sc := bufio.NewScanner(r)" },
      { on: "source", name: "Буфер виводу скинуто", matches: "\\.Flush\\(\\)", hint: "out.Flush() або defer out.Flush()" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "рядків: 4\nслів: 9" },
    ],
  },
  {
    ...base, id: "go-time-deadline", lesson: "go/76", xp: 30,
    title: "Дати проєкту: розбір, різниця, дедлайн",
    context: "У трекері завдань дати приходять рядками з форми. Їх треба розібрати, порахувати тривалість проєкту і показати дедлайн у зручному форматі. Усе це без time.Now(), на фіксованих датах.",
    brief: [
      "Допишіть <code>parseDate</code>: розберіть рядок за шаблоном <code>2006-01-02</code> через <code>time.Parse</code> і поверніть момент та помилку.",
      "Допишіть <code>daysBetween</code>: різниця двох моментів у повних добах (<code>Sub</code>, <code>Hours</code>, ділення на 24). Допишіть <code>deadline</code>: додайте задану кількість годин і відформатуйте результат як <code>02.01.2006 15:04</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"time"
)

func parseDate(s string) (time.Time, error) {
	return time.Time{}, nil
}

func daysBetween(a, b time.Time) int {
	return 0
}

func deadline(t time.Time, hours int) string {
	return ""
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
    checks: [
      { on: "stdout", name: "Різницю в днях пораховано", has: "днів у проєкті: 45", hint: "b.Sub(a).Hours() / 24, потім int(...)" },
      { on: "stdout", name: "Дедлайн відформатовано", has: "дедлайн: 16.04.2026 12:00", hint: "t.Add(time.Duration(hours) * time.Hour).Format(\"02.01.2006 15:04\")" },
      { on: "stdout", name: "Некоректну дату відхилено", has: "помилка для 13-го місяця: true", hint: "time.Parse поверне помилку, її треба віддати з parseDate, а не ковтнути" },
      { on: "source", name: "Розбір через time.Parse", matches: "time\\.Parse\\(\\s*\"2006-01-02\"", hint: "time.Parse(\"2006-01-02\", s)" },
      { on: "source", name: "Формат з еталонної дати", matches: "\\.Format\\(\\s*\"02\\.01\\.2006 15:04\"", hint: "Еталонна дата: 02.01.2006 15:04" },
      { on: "stdout", name: "Повний вивід", equals: "днів у проєкті: 45\nдедлайн: 16.04.2026 12:00\nдень тижня: Wednesday\nпомилка для 13-го місяця: true" },
    ],
  },
  {
    ...base, id: "go-math-toolkit", lesson: "go/77", xp: 30,
    title: "Округлення, допуск і кубики",
    context: "Гроші й відсотки округлюють до копійок, дробові числа порівнюють із допуском, а симуляції з генератором із seed перевіряють за властивостями, а не за конкретними числами.",
    brief: [
      "Допишіть <code>roundTo(x, places)</code>: округліть до <code>places</code> знаків через <code>math.Round</code> і <code>math.Pow(10, ...)</code>. Допишіть <code>almostEqual(a, b)</code>: модуль різниці менший за <code>1e-9</code>.",
      "Допишіть <code>dice(r, n)</code>: поверніть слайс із <code>n</code> кидків кубика (числа від 1 до 6) з генератора <code>r</code> через <code>r.Intn</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"math"
	"math/rand"
)

func roundTo(x float64, places int) float64 {
	return math.Trunc(x)
}

func almostEqual(a, b float64) bool {
	return a == b
}

func dice(r *rand.Rand, n int) []int {
	return nil
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
    checks: [
      { on: "stdout", name: "Округлення до знаків", has: "3.14 -3 1234.6", hint: "math.Round(x*p)/p, де p = math.Pow(10, float64(places))" },
      { on: "stdout", name: "Порівняння з допуском", has: "рівні: false true", hint: "math.Abs(a-b) < 1e-9" },
      { on: "stdout", name: "Кубики в межах 1..6", has: "кубики коректні: true", hint: "r.Intn(6) + 1 дає число від 1 до 6; зберіть n значень через append" },
      { on: "source", name: "Використано math.Round", matches: "math\\.Round\\(", hint: "Round округлює до найближчого цілого" },
      { on: "source", name: "Використано math.Abs", matches: "math\\.Abs\\(", hint: "Допуск перевіряють через модуль різниці" },
      { on: "stdout", name: "Повний вивід", equals: "3.14 -3 1234.6\nрівні: false true\nкубики коректні: true" },
    ],
  },
  {
    ...base, id: "go-json-product", lesson: "go/78", xp: 30,
    title: "Товар: теги й круговий рейс JSON",
    context: "Кожна відповідь API й кожен збережений файл налаштувань — це JSON. Теги на полях задають імена ключів і ховають службові дані, а Marshal/Unmarshal виконують переклад.",
    brief: [
      "Розставте теги в <code>Product</code>: ключі <code>name</code>, <code>price</code>, <code>stock</code>, <code>tags</code> (малими літерами); <code>stock</code> і <code>tags</code> пропускаються, коли порожні (<code>omitempty</code>); <code>Secret</code> не повинне потрапляти в JSON ні в який бік.",
      "Допишіть <code>encode</code> (Marshal у рядок) і <code>decode</code> (Unmarshal з рядка в <code>Product</code>, помилку поверніть). Пам'ятайте: Unmarshal потребує вказівника.",
    ],
    starter: raw`package main

import (
	"encoding/json"
	"fmt"
)

type Product struct {
	Name   string
	Price  float64
	Stock  int
	Secret string
	Tags   []string
}

func encode(p Product) (string, error) {
	_, err := json.Marshal(p)
	return "", err
}

func decode(s string) (Product, error) {
	var p Product
	_ = json.Unmarshal
	return p, nil
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
    checks: [
      { on: "stdout", name: "Marshal дає потрібний JSON", has: "{\"name\":\"Чай\",\"price\":45.5}", hint: "Теги: json:\"name\", json:\"price\"; omitempty прибирає порожні stock і tags; json:\"-\" ховає Secret" },
      { on: "stdout", name: "Unmarshal заповнює поля й ігнорує Secret", has: "Кава 120 3 [арабіка] \"\" <nil>", hint: "Поле з тегом json:\"-\" не заповнюється й під час розбору" },
      { on: "stdout", name: "Некоректний JSON дає помилку", has: "помилка: true", hint: "decode має повертати помилку з Unmarshal, а не ковтати її" },
      { on: "source", name: "Є omitempty", matches: "omitempty", hint: "json:\"stock,omitempty\"" },
      { on: "source", name: "Секретне поле виключено тегом", matches: "json:\"-\"", hint: "json:\"-\"" },
      { on: "source", name: "Розбір через Unmarshal з вказівником", matches: "json\\.Unmarshal\\(\\s*\\[\\]byte\\(s\\),\\s*&", hint: "json.Unmarshal([]byte(s), &p)" },
    ],
  },
  {
    ...base, id: "go-json-role", lesson: "go/79", xp: 45,
    title: "Роль як слово й суворий розбір",
    context: "У публічних API ролі передають словами, а не числами, а конфігурації розбирають суворо, щоб друкарська помилка в ключі не лишилась непоміченою. Обидва прийоми — це власний маршалер і Decoder.",
    brief: [
      "Допишіть <code>MarshalJSON</code> для <code>Role</code>: <code>Guest</code> стає <code>\"guest\"</code>, <code>Admin</code> стає <code>\"admin\"</code> (через <code>json.Marshal</code> від рядка).",
      "Допишіть <code>UnmarshalJSON</code> (приймач-вказівник): розберіть рядок, зіставте з ролями, для невідомого слова поверніть помилку. Допишіть <code>decodeStrict</code> через <code>json.NewDecoder</code> із <code>DisallowUnknownFields</code>.",
    ],
    starter: raw`package main

import (
	"encoding/json"
	"fmt"
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
	return []byte("0"), nil
}

func (r *Role) UnmarshalJSON(b []byte) error {
	return nil
}

func decodeStrict(s string) (User, error) {
	var u User
	err := json.Unmarshal([]byte(s), &u)
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
    checks: [
      { on: "stdout", name: "Роль серіалізується словом", has: "{\"name\":\"Іра\",\"role\":\"admin\"}", hint: "MarshalJSON: json.Marshal(\"admin\") для Admin і json.Marshal(\"guest\") для Guest" },
      { on: "stdout", name: "Слово розбирається в роль", has: "Тарас true <nil>", hint: "UnmarshalJSON: спершу json.Unmarshal(b, &s) у рядок, потім *r = Guest чи Admin" },
      { on: "stdout", name: "Невідома роль дає помилку", has: "невідома роль: true", hint: "Для невідомого слова поверніть fmt.Errorf(...)" },
      { on: "stdout", name: "Невідоме поле відхиляється", has: "json: unknown field \"extra\"", hint: "dec := json.NewDecoder(strings.NewReader(s)); dec.DisallowUnknownFields(); dec.Decode(&u)" },
      { on: "source", name: "Строгий режим Decoder", matches: "DisallowUnknownFields\\(\\)", hint: "Метод Decoder, який викликають до Decode" },
      { on: "source", name: "UnmarshalJSON з вказівником", matches: "func\\s*\\(\\s*\\w+\\s+\\*Role\\)\\s*UnmarshalJSON", hint: "Приймач має бути *Role" },
    ],
  },
];
