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
  {
    ...base, id: "go-regexp-log", lesson: "go/80", xp: 40,
    title: "Розбір логу регулярними виразами",
    context: "Рядки журналу мають однакову форму, але різний зміст. Регулярний вираз з іменованими групами дістає з них рівень, користувача й повідомлення, а заміна маскує чутливі числа.",
    brief: [
      "Допишіть <code>lineRe</code> (одноразова компіляція) з іменованими групами <code>level</code>, <code>user</code>, <code>msg</code> для рядків виду <code>[INFO] ira: текст</code>. Функція <code>parse</code> має повертати значення груп через <code>FindStringSubmatch</code> і <code>SubexpIndex</code>, а для рядка без збігу <code>ok == false</code>.",
      "Допишіть <code>mask</code>: замініть кожну послідовність із чотирьох і більше цифр на <code>****</code> через <code>ReplaceAllString</code>. Допишіть <code>ids</code>: поверніть усі згадки виду <code>#12</code> через <code>FindAllString</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"regexp"
)

var lineRe = regexp.MustCompile(${BT}^$${BT})

func parse(line string) (level, user, msg string, ok bool) {
	return "", "", "", false
}

func mask(s string) string {
	return s
}

func ids(s string) []string {
	return nil
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
    checks: [
      { on: "stdout", name: "Рядок розібрано на групи", has: "true INFO ira вхід виконано", hint: "Групи: (?P<level>[A-Z]+), (?P<user>\\w+), (?P<msg>.*); значення береться з m[lineRe.SubexpIndex(\"level\")]" },
      { on: "stdout", name: "Нерозпізнаний рядок пропущено", has: "пропущено: сміття", hint: "Якщо FindStringSubmatch повернув nil, поверніть ok=false" },
      { on: "stdout", name: "Довгі числа замасковано", has: "картка ****, код 123", hint: "Шаблон \\d{4,}: три цифри коду не чіпаємо" },
      { on: "stdout", name: "Знайдено всі ідентифікатори", has: "[#12 #7 #300]", hint: "FindAllString(s, -1) з шаблоном #\\d+" },
      { on: "source", name: "Іменовані групи", matches: "\\(\\?P<", hint: "(?P<ім'я>...)" },
      { on: "source", name: "Знайдено всі збіги", matches: "FindAllString\\(", hint: "Метод, що повертає []string усіх збігів" },
    ],
  },
  {
    ...base, id: "go-template-invoice", lesson: "go/81", xp: 45,
    title: "Рахунок за шаблоном",
    context: "Рахунки, листи й звіти складають за шаблоном: дані окремо, форма окремо. Функція форматування грошей і цикл по позиціях роблять шаблон придатним для будь-якого замовлення.",
    brief: [
      "Розширте <code>tpl</code>: після заголовка виведіть через <code>{{range .Items}}</code> рядки <code>- Назва: К x ціна = сума</code> (ціну й суму через функцію <code>money</code>, суму дає метод <code>.Line</code>), а в кінці <code>Разом: ...</code> з методу <code>.Total</code>.",
      "У <code>render</code> зареєструйте <code>money</code> через <code>template.FuncMap</code> <b>до</b> <code>Parse</code> (формат <code>%.2f</code>) і поверніть і результат, і помилку розбору чи виконання.",
    ],
    starter: raw`package main

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

const tpl = "Рахунок для {{.Customer}}\n"

func render(tpl string, inv Invoice) (string, error) {
	t, err := template.New("inv").Parse(tpl)
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
    checks: [
      { on: "stdout", name: "Перша позиція з сумою", has: "- Чай: 2 x 45.50 = 91.00", hint: "У range крапка це Item: {{.Name}}: {{.Qty}} x {{money .Price}} = {{money .Line}}" },
      { on: "stdout", name: "Друга позиція", has: "- Кава: 1 x 120.00 = 120.00", hint: "money має форматувати через fmt.Sprintf(\"%.2f\", v)" },
      { on: "stdout", name: "Підсумок", has: "Разом: 211.00", hint: "Поза range крапка знову Invoice: {{money .Total}}" },
      { on: "stdout", name: "Помилка виконання повернена", has: "помилка шаблону: true", hint: "render має повертати err з Execute" },
      { on: "source", name: "Власна функція через FuncMap", matches: "template\\.FuncMap", hint: "t := template.New(\"inv\").Funcs(template.FuncMap{...}).Parse(tpl)" },
      { on: "source", name: "Цикл у шаблоні", matches: "\\{\\{-?\\s*range", hint: "{{range .Items}} ... {{end}}" },
    ],
  },
  {
    ...base, id: "go-slog-audit", lesson: "go/82", xp: 35,
    title: "Журнал платежів без часу",
    context: "У сервісах логи мають бути структурованими й передбачуваними: однакові ключі, рівні за важливістю, контекст сервісу в кожному записі. У тестах з них прибирають час, щоб порівнювати вивід.",
    brief: [
      "Допишіть <code>newLogger</code>: текстовий <code>slog</code>-обробник у <code>w</code> з мінімальним рівнем <code>level</code> і <code>ReplaceAttr</code>, що прибирає атрибут <code>time</code> (лише на верхньому рівні).",
      "Допишіть <code>handle</code>: для суми понад 1000 запис рівня <code>Warn</code> «велика сума», інакше <code>Info</code> «оплата», обидва з атрибутами <code>user</code> і <code>amount</code>; ще один запис <code>Debug</code> «деталі» має лишитися прихованим.",
    ],
    starter: raw`package main

import (
	"fmt"
	"io"
	"log"
	"log/slog"
	"os"
)

func newLogger(w io.Writer, level slog.Level) *slog.Logger {
	return slog.New(slog.NewTextHandler(w, nil))
}

func handle(l *slog.Logger, user string, amount int) {
	l.Info("оплата")
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
    checks: [
      { on: "stdout", name: "Звичайний запис без часу", has: "level=INFO msg=оплата service=pay user=ira amount=50", hint: "With додає service першим; потім user і amount з виклику; ReplaceAttr прибирає time" },
      { on: "stdout", name: "Велика сума як попередження", has: "level=WARN msg=\"велика сума\" service=pay user=taras amount=5000", hint: "Warn для amount > 1000; повідомлення з пробілом береться в лапки автоматично" },
      { on: "stdout", name: "Debug прихований, старий log працює", has: "[legacy] готово: 2", hint: "Рівень із HandlerOptions.Level: Debug нижчий за Info" },
      { on: "stdout", name: "Точний вивід", equals: "level=INFO msg=оплата service=pay user=ira amount=50\nlevel=WARN msg=\"велика сума\" service=pay user=taras amount=5000\n[legacy] готово: 2\nкінець", hint: "Жодних зайвих записів і жодного time=..." },
      { on: "source", name: "Прибрано час через ReplaceAttr", matches: "ReplaceAttr", hint: "&slog.HandlerOptions{Level: level, ReplaceAttr: ...}" },
      { on: "source", name: "Запис Debug присутній", matches: "\\.Debug\\(", hint: "l.Debug(\"деталі\", ...) має бути в handle, але не друкуватись" },
    ],
  },
  {
    ...base, id: "go-cli-args", lesson: "go/83", xp: 35,
    title: "Аргументи, змінні середовища й шляхи",
    context: "Кожна утиліта розбирає аргументи, читає змінні середовища й будує імена вихідних файлів. Якщо робити це функціями від зрізу, а не від глобального стану, їх легко перевірити.",
    brief: [
      "Допишіть <code>parseArgs</code>: створіть <code>flag.NewFlagSet</code> з <code>ContinueOnError</code>, мовчазним виводом (<code>io.Discard</code>) і прапорцями <code>-n</code> (int, типово 1), <code>-name</code> (типово «світ»), <code>-v</code>; після <code>Parse</code> повертайте <code>Config</code> із позиційними файлами з <code>fs.Args()</code>.",
      "Допишіть <code>reportPath</code> (з <code>data/b.csv</code> зробіть <code>data/b.report.txt</code> через <code>filepath</code>) і <code>envOr</code> (значення змінної, якщо вона задана через <code>LookupEnv</code>, інакше типове).",
    ],
    starter: raw`package main

import (
	"fmt"
	"os"
)

type Config struct {
	N       int
	Name    string
	Verbose bool
	Files   []string
}

func parseArgs(args []string) (Config, error) {
	return Config{}, nil
}

func reportPath(p string) string {
	return p
}

func envOr(key, def string) string {
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
    checks: [
      { on: "stdout", name: "Прапорці й позиційні аргументи розібрано", has: "3 Іра true [a.csv data/b.csv] <nil>", hint: "fs.Int(\"n\", 1, ...), fs.String(\"name\", \"світ\", ...), fs.Bool(\"v\", ...); Files = fs.Args()" },
      { on: "stdout", name: "Хибне значення дає помилку", has: "помилка: true", hint: "Parse повертає помилку для -n abc; поверніть її, не ковтайте" },
      { on: "stdout", name: "Шляхи звітів", has: "data/b.report.txt", hint: "filepath.Join(filepath.Dir(p), ім'я без розширення + \".report.txt\")" },
      { on: "stdout", name: "Звіт у поточній теці", has: "\na.report.txt\n", hint: "filepath.Dir(\"a.csv\") це \".\", а Join очищає шлях" },
      { on: "stdout", name: "Змінна середовища чи типове", has: "ua eu", hint: "v, ok := os.LookupEnv(key); якщо ok, поверніть v" },
      { on: "source", name: "Власний FlagSet", matches: "flag\\.NewFlagSet", hint: "flag.NewFlagSet(\"tool\", flag.ContinueOnError)" },
      { on: "source", name: "LookupEnv", matches: "os\\.LookupEnv", hint: "Метод пакета os, що повертає значення й ознаку наявності" },
    ],
  },
  {
    ...base, id: "go-fs-report", lesson: "go/84", xp: 45,
    title: "Обхід віртуальної файлової системи",
    context: "Утиліти для проєктів шукають файли за розширенням, пропускають службові теки й рахують рядки. Якщо вони приймають fs.FS, їх перевіряють на MapFS без диска, а в реальності підставляють os.DirFS.",
    brief: [
      "Допишіть <code>markdownFiles</code>: обійдіть дерево через <code>fs.WalkDir</code>, поверніть шляхи файлів із розширенням <code>.md</code> і не заходьте в теку <code>vendor</code> (<code>fs.SkipDir</code>).",
      "Допишіть <code>lines</code> (кількість рядків файлу через <code>fs.ReadFile</code>; помилку повертайте як є) та <code>pngs</code> (піддерево через <code>fs.Sub</code> і пошук <code>*.png</code> через <code>fs.Glob</code>).",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
	"io/fs"
	"testing/fstest"
)

func markdownFiles(fsys fs.FS) ([]string, error) {
	return nil, nil
}

func lines(fsys fs.FS, name string) (int, error) {
	return 0, nil
}

func pngs(fsys fs.FS, dir string) ([]string, error) {
	return nil, nil
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
    checks: [
      { on: "stdout", name: "Знайдено .md без vendor", has: "[README.md docs/guide.md] <nil>", hint: "У WalkDir для теки vendor повертайте fs.SkipDir; для файлів перевіряйте path.Ext(p) == \".md\"" },
      { on: "stdout", name: "Кількість рядків", has: "3 <nil>", hint: "strings.Split(string(data), \"\\n\") дає 3 рядки для guide.md" },
      { on: "stdout", name: "Відсутній файл розпізнається", has: "true", hint: "Поверніть помилку з fs.ReadFile без змін, щоб errors.Is(err, fs.ErrNotExist) спрацювало" },
      { on: "stdout", name: "PNG у піддереві", has: "[logo.png] <nil>", hint: "sub, err := fs.Sub(fsys, dir); fs.Glob(sub, \"*.png\"): шляхи відраховуються від dir" },
      { on: "source", name: "Обхід через WalkDir", matches: "fs\\.WalkDir\\(", hint: "fs.WalkDir(fsys, \".\", func(p string, d fs.DirEntry, err error) error {...})" },
      { on: "source", name: "Пропуск теки", matches: "fs\\.SkipDir", hint: "Спеціальна помилка, яку повертають для теки, в яку не треба заходити" },
      { on: "source", name: "Піддерево", matches: "fs\\.Sub\\(", hint: "Функція, що вертає fs.FS для вкладеної теки" },
    ],
  },
  {
    ...base, id: "go-unicode-text", lesson: "go/85", xp: 35,
    title: "Текст з кирилицею без ламаних літер",
    context: "Українські імена, заголовки й прев'ю ламаються, якщо різати рядок за байтами. Перша велика літера, розворот і обрізання за символами мають працювати з рунами.",
    brief: [
      "Допишіть <code>capitalize</code> (перша літера велика через <code>utf8.DecodeRuneInString</code> і <code>unicode.ToUpper</code>), <code>reverse</code> (розворот за рунами) і <code>truncate</code> (не більше n <b>символів</b>, а не байтів).",
      "Допишіть <code>stats</code>: порахуйте літери, цифри, пробіли й решту символів через <code>unicode.IsLetter</code>, <code>IsDigit</code>, <code>IsSpace</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"unicode/utf8"
)

func capitalize(s string) string {
	return s
}

func reverse(s string) string {
	return s
}

func truncate(s string, n int) string {
	return s
}

func stats(s string) (letters, digits, spaces, other int) {
	return 0, 0, 0, 0
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
    checks: [
      { on: "stdout", name: "Перша літера велика", has: "\"Їжак\" \"\" \"Go\"", hint: "r, size := utf8.DecodeRuneInString(s); string(unicode.ToUpper(r)) + s[size:]; для порожнього рядка поверніть s" },
      { on: "stdout", name: "Розворот за рунами", has: "тівирП", hint: "Перетворіть у []rune, поміняйте місцями з кінців, поверніть string(runes)" },
      { on: "stdout", name: "Статистика символів", has: "12 3 3 4", hint: "12 літер, 3 цифри, 3 пробіли, 4 решта (. : , !); перебирайте рядок через range" },
      { on: "stdout", name: "Обрізання за символами", has: "Дніпро ab", hint: "Рахуйте руни в range і зріжте s[:pos] на n-му символі" },
      { on: "stdout", name: "Після обрізання рядок коректний", has: "true", hint: "Різати можна лише на межі руни" },
      { on: "source", name: "Класифікація через unicode", matches: "unicode\\.IsLetter", hint: "unicode.IsLetter(r), unicode.IsDigit(r), unicode.IsSpace(r)" },
      { on: "source", name: "Декодування першої руни", matches: "utf8\\.DecodeRuneInString", hint: "Повертає руну й її розмір у байтах" },
    ],
  },
];
