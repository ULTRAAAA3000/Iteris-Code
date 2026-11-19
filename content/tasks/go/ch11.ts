import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_11: readonly RemoteTask[] = [
  {
    ...base, id: "go-layers-flow", lesson: "go/100", xp: 30,
    title: "Сервіс нотаток: правила й помилки між шарами",
    context: "У справжньому бекенді правила живуть у сервісі, а handler лише перекладає помилки сервісу в HTTP-статуси. Так бізнес-логіку можна перевіряти без HTTP, а статуси змінювати, не торкаючись правил.",
    brief: [
      "Допишіть сервіс. <code>Create</code> обрізає пробіли через <code>strings.TrimSpace</code>; якщо заголовок порожній, повертає <code>ErrEmpty</code>, інакше зберігає нотатку в репозиторії. <code>Get</code> шукає нотатку; якщо її немає, повертає <code>fmt.Errorf(\"note %d: %w\", id, err)</code>, щоб зберегти ланцюжок помилок.",
      "Допишіть <code>statusOf</code>: через <code>errors.Is</code> перекладіть <code>ErrEmpty</code> у 400, <code>ErrNotFound</code> у 404, іншу помилку у 500, а <code>nil</code> у 200. Handler уже готовий і користується цією функцією.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
)

var (
	ErrNotFound = errors.New("not found")
	ErrEmpty    = errors.New("empty title")
)

type Note struct {
	ID    int
	Title string
}

type Repo struct {
	data map[int]Note
	next int
}

func NewRepo() *Repo { return &Repo{data: map[int]Note{}, next: 1} }

func (r *Repo) Save(title string) Note {
	n := Note{ID: r.next, Title: title}
	r.data[n.ID] = n
	r.next++
	return n
}

func (r *Repo) Find(id int) (Note, error) {
	n, ok := r.data[id]
	if !ok {
		return Note{}, ErrNotFound
	}
	return n, nil
}

type Service struct{ repo *Repo }

func (s *Service) Create(title string) (Note, error) {
	return Note{}, nil
}

func (s *Service) Get(id int) (Note, error) {
	return Note{}, nil
}

func statusOf(err error) int {
	return http.StatusOK
}

func handle(svc *Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var n Note
		var err error
		if r.Method == http.MethodPost {
			n, err = svc.Create(r.URL.Query().Get("title"))
		} else {
			id, _ := strconv.Atoi(r.URL.Query().Get("id"))
			n, err = svc.Get(id)
		}
		if err != nil {
			http.Error(w, err.Error(), statusOf(err))
			return
		}
		fmt.Fprintf(w, "%d:%s", n.ID, n.Title)
	}
}

func main() {
	h := handle(&Service{repo: NewRepo()})
	reqs := [][2]string{{"POST", "/note?title=Buy+milk"}, {"POST", "/note?title=+++"}, {"GET", "/note?id=1"}, {"GET", "/note?id=9"}}
	for _, q := range reqs {
		rec := httptest.NewRecorder()
		h(rec, httptest.NewRequest(q[0], q[1], nil))
		fmt.Println(rec.Code, strings.TrimSpace(rec.Body.String()))
	}
}
`,
    checks: [
      { on: "stdout", name: "Створення нотатки працює", has: "200 1:Buy milk", hint: "Create має обрізати заголовок і викликати repo.Save" },
      { on: "stdout", name: "Порожній заголовок дає 400", has: "400 empty title", hint: "Create повертає ErrEmpty, а statusOf через errors.Is відображає її в 400" },
      { on: "stdout", name: "Відсутня нотатка дає 404 з контекстом", has: "404 note 9: not found", hint: "Get обгортає помилку репозиторію через fmt.Errorf з %w, а statusOf перевіряє errors.Is(err, ErrNotFound)" },
      { on: "source", name: "Помилки порівнюються через errors.Is", has: "errors.Is(", hint: "Прямі == не бачать помилку, обгорнуту через %w" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "200 1:Buy milk\n400 empty title\n200 1:Buy milk\n404 note 9: not found" },
    ],
  },
  {
    ...base, id: "go-di-fake", lesson: "go/101", xp: 30,
    title: "Сервіс із ін'єкцією та фейком для тесту",
    context: "Щоб перевірити сервіс без реальної пошти чи бази, його залежність передають інтерфейсом, а в тесті підставляють фейк, що записує виклики. Саме так пишуться тести в продакшн-коді на Go.",
    brief: [
      "Допишіть конструктор <code>NewService(s Sender) *Service</code> і метод <code>Welcome(name string) error</code>. Порожнє ім'я дає <code>ErrNoName</code>. Інакше викличте <code>Send(name, \"Welcome, \"+name+\"!\")</code>; помилку надсилання обгорніть через <code>fmt.Errorf(\"welcome %s: %w\", name, err)</code>.",
      "Допишіть фейк <code>fakeSender.Send</code>: якщо <code>fail</code> увімкнено, поверніть <code>errors.New(\"smtp down\")</code>, інакше додайте у <code>sent</code> рядок <code>to+\"|\"+text</code> і поверніть <code>nil</code>.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

type Sender interface {
	Send(to, text string) error
}

var ErrNoName = errors.New("empty name")

type Service struct{ sender Sender }

func NewService(s Sender) *Service {
	return nil
}

func (s *Service) Welcome(name string) error {
	return nil
}

type fakeSender struct {
	sent []string
	fail bool
}

func (f *fakeSender) Send(to, text string) error {
	return nil
}

func main() {
	ok := &fakeSender{}
	svc := NewService(ok)
	fmt.Println(svc.Welcome("Olena"))
	fmt.Println(svc.Welcome(""))
	fmt.Println(ok.sent)
	bad := NewService(&fakeSender{fail: true})
	err := bad.Welcome("Taras")
	fmt.Println(err, errors.Is(err, ErrNoName))
}
`,
    checks: [
      { on: "stdout", name: "Фейк записав надіслане повідомлення", has: "[Olena|Welcome, Olena!]", hint: "Фейк додає to+\"|\"+text у f.sent, а сервіс викликає s.sender.Send" },
      { on: "stdout", name: "Порожнє ім'я відхилено до надсилання", has: "empty name", hint: "Перед викликом Send перевірте name == \"\" і поверніть ErrNoName" },
      { on: "stdout", name: "Помилка надсилання обгорнута з контекстом", has: "welcome Taras: smtp down false", hint: "fmt.Errorf(\"welcome %s: %w\", name, err)" },
      { on: "source", name: "Залежність зберігається в полі через конструктор", has: "&Service{", hint: "NewService повертає &Service{sender: s}" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "<nil>\nempty name\n[Olena|Welcome, Olena!]\nwelcome Taras: smtp down false" },
    ],
  },
  {
    ...base, id: "go-store-sync", lesson: "go/102", xp: 35,
    title: "Потокобезпечне сховище з мапою та RWMutex",
    context: "Сховище в пам'яті, яке читають і пишуть із багатьох горутин, вимагає захисту. Без нього сервіс падає з concurrent map writes, а дані тихо псуються.",
    brief: [
      "Допишіть <code>Add</code>: під <code>Lock</code> збільште <code>next</code>, збережіть ім'я під цим id і поверніть id. Допишіть <code>Get</code> під <code>RLock</code>.",
      "Допишіть <code>Names</code>: під <code>RLock</code> зберіть усі імена у <b>новий</b> слайс і відсортуйте його через <code>slices.Sort</code>. Мапа обходиться у випадковому порядку, тож без сортування вивід буде різним.",
    ],
    starter: raw`package main

import (
	"fmt"
	"strings"
	"sync"
)

type Store struct {
	mu    sync.RWMutex
	items map[int]string
	next  int
}

func NewStore() *Store { return &Store{items: map[int]string{}} }

func (s *Store) Add(name string) int {
	return 0
}

func (s *Store) Get(id int) (string, bool) {
	return "", false
}

func (s *Store) Names() []string {
	return nil
}

func main() {
	st := NewStore()
	var wg sync.WaitGroup
	for i := range 20 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			st.Add(fmt.Sprintf("item%02d", i))
		}()
	}
	wg.Wait()
	names := st.Names()
	fmt.Println(len(names), names)

	id := st.Add("extra")
	v, ok := st.Get(id)
	fmt.Println(id > 20, v, ok)
	_, ok = st.Get(999)
	fmt.Println(ok)

	if len(names) > 0 {
		names[0] = "changed"
	}
	fresh := st.Names()
	fmt.Println(strings.Join(fresh[:min(2, len(fresh))], ","))
}
`,
    checks: [
      { on: "stdout", name: "Усі 20 імен додано й відсортовано", has: "20 [item00 item01 item02", hint: "Add береться під Lock; Names збирає ключі мапи й викликає slices.Sort" },
      { on: "stdout", name: "Get знаходить доданий запис", has: "true extra true", hint: "Get читає мапу під RLock і повертає значення та ok" },
      { on: "stdout", name: "Names віддає копію, а не внутрішні дані", has: "extra,item00", hint: "Збирайте імена в новий слайс щоразу, тоді змінення результату не зачепить сховище" },
      { on: "source", name: "Читання під RLock", has: "RLock()", hint: "s.mu.RLock(); defer s.mu.RUnlock()" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "20 [" + Array.from({ length: 20 }, (_, i) => "item" + String(i).padStart(2, "0")).join(" ") + "]\ntrue extra true\nfalse\nextra,item00" },
    ],
  },
  {
    ...base, id: "go-config-load", lesson: "go/103", xp: 40,
    title: "Конфіг із прапорців і оточення з пріоритетами",
    context: "Кожен сервіс на старті збирає конфігурацію з кількох джерел і має чітко знати, що кого перекриває. Щоб це було тестованим, джерела передають параметрами: зріз аргументів і функцію lookup замість справжнього оточення.",
    brief: [
      "Допишіть <code>Load(args, lookup)</code>. Значення за замовчуванням: <code>Addr</code> <code>:8080</code>, <code>Workers</code> 4. Потім застосуйте оточення: <code>APP_ADDR</code> і <code>APP_WORKERS</code> (число через <code>strconv.Atoi</code>; помилку обгорніть як <code>fmt.Errorf(\"APP_WORKERS: %w\", err)</code>).",
      "Потім розберіть <code>args</code> через <code>flag.NewFlagSet</code> з <code>flag.ContinueOnError</code>: прапорці <code>-addr</code>, <code>-workers</code>, <code>-verbose</code>, а як значення за замовчуванням передайте <b>поточні</b> значення полів, щоб прапорець перекривав оточення. Наприкінці, якщо <code>Workers</code> менше 1, поверніть <code>errors.New(\"workers must be >= 1\")</code>.",
    ],
    starter: raw`package main

import (
	"errors"
	"flag"
	"fmt"
)

type Config struct {
	Addr    string
	Workers int
	Verbose bool
}

func Load(args []string, lookup func(string) (string, bool)) (Config, error) {
	cfg := Config{Addr: ":8080", Workers: 4}
	fs := flag.NewFlagSet("app", flag.ContinueOnError)
	_ = fs
	_ = errors.New
	return cfg, nil
}

func env(m map[string]string) func(string) (string, bool) {
	return func(k string) (string, bool) {
		v, ok := m[k]
		return v, ok
	}
}

func main() {
	cases := []struct {
		args []string
		env  map[string]string
	}{
		{nil, nil},
		{nil, map[string]string{"APP_ADDR": ":9000", "APP_WORKERS": "8"}},
		{[]string{"-addr", ":7000", "-verbose"}, map[string]string{"APP_ADDR": ":9000", "APP_WORKERS": "8"}},
		{[]string{"-workers", "0"}, nil},
		{nil, map[string]string{"APP_WORKERS": "abc"}},
	}
	for _, c := range cases {
		cfg, err := Load(c.args, env(c.env))
		if err != nil {
			fmt.Println("error:", err)
			continue
		}
		fmt.Printf("%+v\n", cfg)
	}
}
`,
    checks: [
      { on: "stdout", name: "Оточення перекриває значення за замовчуванням", has: "{Addr::9000 Workers:8 Verbose:false}", hint: "Спершу застосуйте APP_ADDR і APP_WORKERS до cfg, а вже потім розбирайте прапорці" },
      { on: "stdout", name: "Прапорець сильніший за оточення", has: "{Addr::7000 Workers:8 Verbose:true}", hint: "Передайте cfg.Addr і cfg.Workers як значення за замовчуванням у fs.StringVar і fs.IntVar" },
      { on: "stdout", name: "Валідація й помилка розбору оточення", has: "error: workers must be >= 1\nerror: APP_WORKERS: strconv.Atoi: parsing \"abc\": invalid syntax", hint: "Перевірте Workers після розбору прапорців, а помилку Atoi обгорніть з іменем змінної через %w" },
      { on: "source", name: "Використано окремий FlagSet зі зрізу аргументів", has: "fs.Parse(args)", hint: "fs.Parse(args), а не flag.Parse()" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "{Addr::8080 Workers:4 Verbose:false}\n{Addr::9000 Workers:8 Verbose:false}\n{Addr::7000 Workers:8 Verbose:true}\nerror: workers must be >= 1\nerror: APP_WORKERS: strconv.Atoi: parsing \"abc\": invalid syntax" },
    ],
  },
  {
    ...base, id: "go-sql-memdb", lesson: "go/104", xp: 55,
    title: "Репозиторій на database/sql: транзакція, Scan і NULL",
    context: "Репозиторій на database/sql завжди робить одне й те саме: транзакція з відкатом, цикл по рядках із Close і перевіркою Err, обробка NULL та ErrNoRows. У пісочниці немає бази, тому в заготовці є крихітний драйвер у пам'яті, а ви пишете код так, як із справжнім драйвером.",
    brief: [
      "Допишіть <code>AddAll</code>: почніть транзакцію <code>db.Begin()</code>, відкладіть <code>defer tx.Rollback()</code>, для кожного імені виконайте <code>tx.Exec(\"INSERT INTO users(name, email) VALUES(?, ?)\", name, nil)</code>. Якщо ім'я порожнє, поверніть <code>fmt.Errorf(\"позиція %d: порожнє ім'я\", i)</code> (відкат спрацює сам), інакше наприкінці <code>tx.Commit()</code>.",
      "Допишіть <code>Names</code>: <code>db.Query(\"SELECT id, name, email FROM users ORDER BY id\")</code>, <code>defer rs.Close()</code>, цикл <code>rs.Next()</code> із <code>Scan</code> у <code>int64</code>, <code>string</code>, <code>sql.NullString</code>, а наприкінці поверніть імена й <code>rs.Err()</code>.",
      "Допишіть <code>Email</code>: <code>QueryRow(\"SELECT id, name, email FROM users WHERE id = ?\", id).Scan(...)</code>. Помилку (зокрема <code>sql.ErrNoRows</code>) обгорніть як <code>fmt.Errorf(\"user %d: %w\", id, err)</code>. Якщо email дорівнює NULL, поверніть рядок <code>немає</code>.",
    ],
    starter: raw`package main

import (
	"database/sql"
	"database/sql/driver"
	"errors"
	"fmt"
	"io"
	"slices"
	"strings"
	"sync"
)

type row struct {
	id    int64
	name  string
	email any
}

var (
	mu     sync.Mutex
	table  []row
	nextID int64
)

type drv struct{}

func (drv) Open(string) (driver.Conn, error) { return &conn{}, nil }

type conn struct {
	inTx    bool
	pending []row
}

func (c *conn) Prepare(q string) (driver.Stmt, error) { return &stmt{c: c, q: q}, nil }
func (c *conn) Close() error                          { return nil }
func (c *conn) Begin() (driver.Tx, error)             { c.inTx = true; return c, nil }

func (c *conn) Commit() error {
	mu.Lock()
	defer mu.Unlock()
	for _, r := range c.pending {
		nextID++
		r.id = nextID
		table = append(table, r)
	}
	c.inTx, c.pending = false, nil
	return nil
}

func (c *conn) Rollback() error {
	c.inTx, c.pending = false, nil
	return nil
}

type result int64

func (r result) LastInsertId() (int64, error) { return int64(r), nil }
func (r result) RowsAffected() (int64, error) { return 1, nil }

type stmt struct {
	c *conn
	q string
}

func (s *stmt) Close() error  { return nil }
func (s *stmt) NumInput() int { return strings.Count(s.q, "?") }

func (s *stmt) Exec(args []driver.Value) (driver.Result, error) {
	if !strings.HasPrefix(s.q, "INSERT INTO users") {
		return nil, errors.New("memdb: не підтримується: " + s.q)
	}
	r := row{name: args[0].(string), email: args[1]}
	if s.c.inTx {
		s.c.pending = append(s.c.pending, r)
		return result(0), nil
	}
	mu.Lock()
	defer mu.Unlock()
	nextID++
	r.id = nextID
	table = append(table, r)
	return result(nextID), nil
}

func (s *stmt) Query(args []driver.Value) (driver.Rows, error) {
	mu.Lock()
	defer mu.Unlock()
	var out []row
	switch {
	case strings.Contains(s.q, "WHERE id = ?"):
		for _, r := range table {
			if r.id == args[0].(int64) {
				out = append(out, r)
			}
		}
	case strings.HasPrefix(s.q, "SELECT id, name, email FROM users"):
		out = slices.Clone(table)
	default:
		return nil, errors.New("memdb: не підтримується: " + s.q)
	}
	return &memRows{data: out}, nil
}

type memRows struct {
	data []row
	i    int
}

func (r *memRows) Columns() []string { return []string{"id", "name", "email"} }
func (r *memRows) Close() error      { return nil }

func (r *memRows) Next(dest []driver.Value) error {
	if r.i >= len(r.data) {
		return io.EOF
	}
	x := r.data[r.i]
	r.i++
	dest[0], dest[1], dest[2] = x.id, x.name, x.email
	return nil
}

func AddAll(db *sql.DB, names []string) error {
	return nil
}

func Names(db *sql.DB) ([]string, error) {
	return nil, nil
}

func Email(db *sql.DB, id int64) (string, error) {
	return "", nil
}

func main() {
	sql.Register("memdb", drv{})
	db, _ := sql.Open("memdb", "")
	defer db.Close()

	fmt.Println(AddAll(db, []string{"Olena", "Taras"}))
	fmt.Println(AddAll(db, []string{"Ira", "", "Max"}))
	names, err := Names(db)
	fmt.Println(names, err)

	db.Exec("INSERT INTO users(name, email) VALUES(?, ?)", "Dana", "dana@example.com")
	for _, id := range []int64{1, 3, 7} {
		e, err := Email(db, id)
		fmt.Printf("%d: %q %v\n", id, e, err)
	}
}
`,
    checks: [
      { on: "stdout", name: "Транзакція з помилкою відкочується, успішна зберігається", has: "<nil>\nпозиція 1: порожнє ім'я\n[Olena Taras] <nil>", hint: "Після помилки на порожньому імені return спрацює defer tx.Rollback(), тож Ira не потрапить у таблицю" },
      { on: "stdout", name: "NULL і значення розрізняються", has: "1: \"немає\" <nil>\n3: \"dana@example.com\" <nil>", hint: "Скануйте email у sql.NullString і дивіться на email.Valid" },
      { on: "stdout", name: "Відсутній рядок дає ErrNoRows з контекстом", has: "7: \"\" user 7: sql: no rows in result set", hint: "fmt.Errorf(\"user %d: %w\", id, err) після QueryRow(...).Scan(...)" },
      { on: "source", name: "Рядки закриваються й помилку ітерації перевірено", has: "rs.Err()", hint: "defer rs.Close() після Query і return out, rs.Err() після циклу" },
      { on: "source", name: "Транзакція завершується Commit", has: "tx.Commit()", hint: "Після успішного циклу викличте tx.Commit()" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "<nil>\nпозиція 1: порожнє ім'я\n[Olena Taras] <nil>\n1: \"немає\" <nil>\n3: \"dana@example.com\" <nil>\n7: \"\" user 7: sql: no rows in result set" },
    ],
  },
  {
    ...base, id: "go-observability", lesson: "go/105", xp: 45,
    title: "Request id у контексті та readiness",
    context: "Щоб знайти в логах усе, що стосується одного запиту, його позначають request id, який middleware кладе в контекст. А оркестратор дізнається, чи готовий сервіс, з readiness-ендпоінта. Обидва механізми є в кожному продакшн-сервісі.",
    brief: [
      "Допишіть <code>withRequestID</code>: візьміть id із заголовка <code>X-Request-ID</code>, а якщо його немає, згенеруйте <code>req-N</code>, де N це <code>a.seq.Add(1)</code>. Поставте id у заголовок відповіді <code>X-Request-ID</code>, покладіть у контекст запиту через <code>context.WithValue(r.Context(), ctxKey{}, id)</code> і передайте далі через <code>r.WithContext(ctx)</code>.",
      "Допишіть <code>health</code>: поки <code>a.ready</code> не встановлено, відповідайте <code>http.Error(w, \"not ready\", http.StatusServiceUnavailable)</code> і виходьте, інакше пишіть <code>ok</code>. Обробник <code>work</code> уже логує id з контексту.",
    ],
    starter: raw`//go:debug httpmuxgo121=0
package main

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync/atomic"
)

type ctxKey struct{}

func newLogger(w io.Writer) *slog.Logger {
	return slog.New(slog.NewTextHandler(w, &slog.HandlerOptions{
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey && len(groups) == 0 {
				return slog.Attr{}
			}
			return a
		},
	}))
}

func requestID(ctx context.Context) string {
	id, _ := ctx.Value(ctxKey{}).(string)
	return id
}

type App struct {
	log   *slog.Logger
	seq   atomic.Int64
	hits  atomic.Int64
	ready atomic.Bool
}

func (a *App) withRequestID(next http.Handler) http.Handler {
	return next
}

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}

func (a *App) work(w http.ResponseWriter, r *http.Request) {
	n := a.hits.Add(1)
	a.log.Info("work", "request_id", requestID(r.Context()))
	fmt.Fprintf(w, "hits=%d", n)
}

func main() {
	app := &App{log: newLogger(os.Stdout)}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /work", app.work)
	mux.HandleFunc("GET /healthz", app.health)
	h := app.withRequestID(mux)

	call := func(path, id string) {
		req := httptest.NewRequest("GET", path, nil)
		if id != "" {
			req.Header.Set("X-Request-ID", id)
		}
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		fmt.Println(rec.Code, rec.Header().Get("X-Request-ID"), strings.TrimSpace(rec.Body.String()))
	}
	call("/healthz", "")
	call("/work", "abc")
	call("/work", "")
	app.ready.Store(true)
	call("/healthz", "")
}
`,
    checks: [
      { on: "stdout", name: "Health повертає 503 до готовності й має згенерований id", has: "503 req-1 not ready", hint: "Згенерований id береться з лічильника a.seq, а до ready.Store(true) health відповідає 503" },
      { on: "stdout", name: "Request id із заголовка потрапляє в лог через контекст", has: "level=INFO msg=work request_id=abc\n200 abc hits=1", hint: "Покладіть id у контекст з ключем ctxKey{} і передайте next.ServeHTTP(w, r.WithContext(ctx))" },
      { on: "stdout", name: "Після готовності health дає 200", has: "200 req-3 ok", hint: "Лічильник seq збільшується лише для запитів без заголовка" },
      { on: "source", name: "Id передається через контекст запиту", has: "r.WithContext(", hint: "next.ServeHTTP(w, r.WithContext(ctx))" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "503 req-1 not ready\nlevel=INFO msg=work request_id=abc\n200 abc hits=1\nlevel=INFO msg=work request_id=req-2\n200 req-2 hits=2\n200 req-3 ok" },
    ],
  },
];
