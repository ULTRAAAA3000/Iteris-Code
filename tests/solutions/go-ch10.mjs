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
};
