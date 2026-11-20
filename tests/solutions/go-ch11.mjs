const raw = String.raw;
const BT = "`";

export const SOLUTIONS_11 = {
  "go-layers-flow": raw`package main

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
	title = strings.TrimSpace(title)
	if title == "" {
		return Note{}, ErrEmpty
	}
	return s.repo.Save(title), nil
}

func (s *Service) Get(id int) (Note, error) {
	n, err := s.repo.Find(id)
	if err != nil {
		return Note{}, fmt.Errorf("note %d: %w", id, err)
	}
	return n, nil
}

func statusOf(err error) int {
	switch {
	case err == nil:
		return http.StatusOK
	case errors.Is(err, ErrEmpty):
		return http.StatusBadRequest
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
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
  "go-di-fake": raw`package main

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
	return &Service{sender: s}
}

func (s *Service) Welcome(name string) error {
	if name == "" {
		return ErrNoName
	}
	if err := s.sender.Send(name, "Welcome, "+name+"!"); err != nil {
		return fmt.Errorf("welcome %s: %w", name, err)
	}
	return nil
}

type fakeSender struct {
	sent []string
	fail bool
}

func (f *fakeSender) Send(to, text string) error {
	if f.fail {
		return errors.New("smtp down")
	}
	f.sent = append(f.sent, to+"|"+text)
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
  "go-store-sync": raw`package main

import (
	"fmt"
	"slices"
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
	s.mu.Lock()
	defer s.mu.Unlock()
	s.next++
	s.items[s.next] = name
	return s.next
}

func (s *Store) Get(id int) (string, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.items[id]
	return v, ok
}

func (s *Store) Names() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]string, 0, len(s.items))
	for _, v := range s.items {
		out = append(out, v)
	}
	slices.Sort(out)
	return out
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
  "go-config-load": raw`package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"strconv"
)

type Config struct {
	Addr    string
	Workers int
	Verbose bool
}

func Load(args []string, lookup func(string) (string, bool)) (Config, error) {
	cfg := Config{Addr: ":8080", Workers: 4}
	if v, ok := lookup("APP_ADDR"); ok {
		cfg.Addr = v
	}
	if v, ok := lookup("APP_WORKERS"); ok {
		n, err := strconv.Atoi(v)
		if err != nil {
			return Config{}, fmt.Errorf("APP_WORKERS: %w", err)
		}
		cfg.Workers = n
	}
	fs := flag.NewFlagSet("app", flag.ContinueOnError)
	fs.SetOutput(io.Discard)
	fs.StringVar(&cfg.Addr, "addr", cfg.Addr, "")
	fs.IntVar(&cfg.Workers, "workers", cfg.Workers, "")
	fs.BoolVar(&cfg.Verbose, "verbose", cfg.Verbose, "")
	if err := fs.Parse(args); err != nil {
		return Config{}, err
	}
	if cfg.Workers < 1 {
		return Config{}, errors.New("workers must be >= 1")
	}
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
  "go-sql-memdb": raw`package main

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
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for i, name := range names {
		if name == "" {
			return fmt.Errorf("позиція %d: порожнє ім'я", i)
		}
		if _, err := tx.Exec("INSERT INTO users(name, email) VALUES(?, ?)", name, nil); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func Names(db *sql.DB) ([]string, error) {
	rs, err := db.Query("SELECT id, name, email FROM users ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rs.Close()
	var out []string
	for rs.Next() {
		var id int64
		var name string
		var email sql.NullString
		if err := rs.Scan(&id, &name, &email); err != nil {
			return nil, err
		}
		out = append(out, name)
	}
	return out, rs.Err()
}

func Email(db *sql.DB, id int64) (string, error) {
	var name string
	var email sql.NullString
	err := db.QueryRow("SELECT id, name, email FROM users WHERE id = ?", id).Scan(&id, &name, &email)
	if err != nil {
		return "", fmt.Errorf("user %d: %w", id, err)
	}
	if !email.Valid {
		return "немає", nil
	}
	return email.String, nil
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
  "go-observability": raw`//go:debug httpmuxgo121=0
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
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-ID")
		if id == "" {
			id = fmt.Sprintf("req-%d", a.seq.Add(1))
		}
		w.Header().Set("X-Request-ID", id)
		ctx := context.WithValue(r.Context(), ctxKey{}, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	if !a.ready.Load() {
		http.Error(w, "not ready", http.StatusServiceUnavailable)
		return
	}
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
};
