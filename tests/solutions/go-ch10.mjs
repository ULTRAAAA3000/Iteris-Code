const raw = String.raw;
const BT = "`";

export const SOLUTIONS_10 = {
  "go-get-task-handler": raw`package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
)

type Task struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
	Done  bool   ${BT}json:"done"${BT}
}

var tasks = []Task{{1, "Вивчити Go", false}, {2, "Написати сервер", true}}

func getTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не дозволено", http.StatusMethodNotAllowed)
		return
	}
	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		http.Error(w, "Задачу не знайдено", http.StatusNotFound)
		return
	}
	for _, t := range tasks {
		if t.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(t)
			return
		}
	}
	http.Error(w, "Задачу не знайдено", http.StatusNotFound)
}

func main() {
	reqs := [][2]string{{"GET", "/task?id=2"}, {"GET", "/task?id=9"}, {"POST", "/task?id=1"}}
	for _, q := range reqs {
		rec := httptest.NewRecorder()
		getTask(rec, httptest.NewRequest(q[0], q[1], nil))
		fmt.Println(rec.Code, rec.Header().Get("Content-Type"), strings.TrimSpace(rec.Body.String()))
	}
}
`,
  "go-httptest-table": raw`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func hello(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "метод не дозволено", http.StatusMethodNotAllowed)
		return
	}
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "потрібне ім'я", http.StatusBadRequest)
		return
	}
	fmt.Fprintf(w, "Привіт, %s!", name)
}

func call(h http.HandlerFunc, method, url string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h(rec, httptest.NewRequest(method, url, nil))
	return rec
}

func main() {
	tests := []struct {
		name     string
		method   string
		url      string
		wantCode int
		wantBody string
	}{
		{"GET з ім'ям", "GET", "/hello?name=Olena", 200, "Привіт, Olena!"},
		{"GET без імені", "GET", "/hello", 400, "потрібне ім'я"},
		{"POST заборонено", "POST", "/hello?name=Olena", 405, "метод не дозволено"},
		{"інше ім'я", "GET", "/hello?name=Taras", 200, "Привіт, Taras!"},
	}
	passed := 0
	for _, tt := range tests {
		rec := call(hello, tt.method, tt.url)
		body := strings.TrimSpace(rec.Body.String())
		if rec.Code == tt.wantCode && body == tt.wantBody {
			fmt.Println("ok  ", tt.name)
			passed++
		} else {
			fmt.Printf("FAIL %s: %d %q\n", tt.name, rec.Code, body)
		}
	}
	fmt.Printf("Пройдено %d з %d\n", passed, len(tests))
}
`,
  "go-servemux-routes": raw`//go:debug httpmuxgo121=0
package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func newMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "home")
	})
	mux.HandleFunc("GET /tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "task ", r.PathValue("id"))
	})
	mux.HandleFunc("GET /tasks/new", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "form")
	})
	mux.HandleFunc("GET /files/{path...}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "file ", r.PathValue("path"))
	})
	return mux
}

func main() {
	mux := newMux()
	for _, q := range [][2]string{
		{"GET", "/"},
		{"GET", "/tasks/7"},
		{"GET", "/tasks/new"},
		{"GET", "/files/a/b.txt"},
		{"POST", "/tasks/7"},
		{"GET", "/nope"},
	} {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest(q[0], q[1], nil))
		fmt.Printf("%s %s -> %d %s [%s]\n", q[0], q[1], rec.Code, strings.TrimSpace(rec.Body.String()), rec.Header().Get("Allow"))
	}
}
`,
  "go-json-crud": raw`//go:debug httpmuxgo121=0
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
)

type Task struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
	Done  bool   ${BT}json:"done"${BT}
}

var (
	tasks  = map[int]Task{1: {1, "Вивчити Go", false}, 2: {2, "Написати сервер", true}}
	nextID = 3
)

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

func getTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.PathValue("id"))
	t, ok := tasks[id]
	if !ok {
		writeError(w, http.StatusNotFound, "задачу не знайдено")
		return
	}
	writeJSON(w, http.StatusOK, t)
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		writeError(w, http.StatusBadRequest, "некоректний JSON")
		return
	}
	if t.Title == "" {
		writeError(w, http.StatusBadRequest, "потрібна назва")
		return
	}
	t.ID = nextID
	nextID++
	tasks[t.ID] = t
	writeJSON(w, http.StatusCreated, t)
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.PathValue("id"))
	if _, ok := tasks[id]; !ok {
		writeError(w, http.StatusNotFound, "задачу не знайдено")
		return
	}
	delete(tasks, id)
	w.WriteHeader(http.StatusNoContent)
}

func do(h http.Handler, method, path, body string) {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, strings.NewReader(body)))
	fmt.Printf("%s %s -> %d %s\n", method, path, rec.Code, strings.TrimSpace(rec.Body.String()))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /tasks", createTask)
	mux.HandleFunc("GET /tasks/{id}", getTask)
	mux.HandleFunc("DELETE /tasks/{id}", deleteTask)

	do(mux, "POST", "/tasks", ${BT}{"title":"Купити хліб"}${BT})
	do(mux, "POST", "/tasks", "{зламано")
	do(mux, "POST", "/tasks", ${BT}{"title":""}${BT})
	do(mux, "GET", "/tasks/3", "")
	do(mux, "DELETE", "/tasks/3", "")
	do(mux, "DELETE", "/tasks/3", "")
}
`,
  "go-middleware-chain": raw`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (s *statusWriter) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		fmt.Printf("%s %s -> %d\n", r.Method, r.URL.Path, sw.status)
	})
}

func auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-API-Key") != "secret" {
			http.Error(w, "потрібен ключ", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/ok", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	})
	h := logging(auth(mux))

	for _, q := range []struct{ path, key string }{{"/ok", "secret"}, {"/missing", "secret"}, {"/ok", ""}} {
		req := httptest.NewRequest("GET", q.path, nil)
		if q.key != "" {
			req.Header.Set("X-API-Key", q.key)
		}
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		fmt.Println("тіло:", strings.TrimSpace(rec.Body.String()))
	}
}
`,
  "go-http-client-fake": raw`package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type fakeTransport struct{}

func (fakeTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	code, body := 200, "Hello"
	switch r.URL.Path {
	case "/missing":
		code, body = 404, "немає"
	case "/boom":
		code, body = 500, "збій"
	}
	return &http.Response{StatusCode: code, Body: io.NopCloser(strings.NewReader(body)), Header: make(http.Header), Request: r}, nil
}

func fetch(ctx context.Context, c *http.Client, url string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	resp, err := c.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("статус %d", resp.StatusCode)
	}
	b, err := io.ReadAll(resp.Body)
	return string(b), err
}

func main() {
	client := &http.Client{Transport: fakeTransport{}, Timeout: 2 * time.Second}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	for _, path := range []string{"/ok", "/missing", "/boom"} {
		body, err := fetch(ctx, client, "http://api.test"+path)
		if err != nil {
			fmt.Println("помилка:", err)
			continue
		}
		fmt.Println("ok:", body)
	}
}
`,
  "go-context-timeout": raw`package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync/atomic"
	"time"
)

type ctxKey int

const idKey ctxKey = 0

func withID(next http.Handler) http.Handler {
	var n atomic.Int64
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := fmt.Sprintf("req-%d", n.Add(1))
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), idKey, id)))
	})
}

func requestID(ctx context.Context) string {
	id, _ := ctx.Value(idKey).(string)
	return id
}

func slowQuery(ctx context.Context, d time.Duration) error {
	select {
	case <-time.After(d):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func search(w http.ResponseWriter, r *http.Request) {
	ms, _ := strconv.Atoi(r.URL.Query().Get("ms"))
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Millisecond)
	defer cancel()
	id := requestID(ctx)
	if err := slowQuery(ctx, time.Duration(ms)*time.Millisecond); err != nil {
		http.Error(w, id+" час вичерпано", http.StatusGatewayTimeout)
		return
	}
	fmt.Fprint(w, id, " готово")
}

func main() {
	h := withID(http.HandlerFunc(search))
	for _, url := range []string{"/search?ms=5", "/search?ms=500"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", url, nil))
		fmt.Println(rec.Code, strings.TrimSpace(rec.Body.String()))
	}
}
`,
  "go-graceful-shutdown": raw`package main

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type Server interface {
	ListenAndServe() error
	Shutdown(ctx context.Context) error
	Close() error
}

type fake struct {
	name string
	slow bool
	stop chan struct{}
	once sync.Once
}

func newFake(name string, slow bool) *fake {
	return &fake{name: name, slow: slow, stop: make(chan struct{})}
}

func (f *fake) ListenAndServe() error {
	<-f.stop
	return http.ErrServerClosed
}

func (f *fake) Shutdown(ctx context.Context) error {
	if f.slow {
		<-ctx.Done()
		return ctx.Err()
	}
	f.once.Do(func() { close(f.stop) })
	return nil
}

func (f *fake) Close() error {
	fmt.Println(f.name, "Close")
	f.once.Do(func() { close(f.stop) })
	return nil
}

func run(ctx context.Context, srv Server, grace time.Duration) error {
	errCh := make(chan error, 1)
	go func() { errCh <- srv.ListenAndServe() }()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	fmt.Println("зупинка")
	sctx, cancel := context.WithTimeout(context.Background(), grace)
	defer cancel()
	if err := srv.Shutdown(sctx); err != nil {
		srv.Close()
		return err
	}
	if err := <-errCh; err != http.ErrServerClosed {
		return err
	}
	return nil
}

func main() {
	signalled, cancel := context.WithCancel(context.Background())
	cancel()

	for _, srv := range []*fake{newFake("швидкий", false), newFake("завислий", true)} {
		err := run(signalled, srv, 20*time.Millisecond)
		if err != nil {
			fmt.Println(srv.name, "підсумок:", err)
		} else {
			fmt.Println(srv.name, "підсумок: ok")
		}
	}
}
`,
};
