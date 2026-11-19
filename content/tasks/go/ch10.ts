import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "go-get-task-handler", lesson: "go/92", xp: 40,
    title: "Обробник GET /task?id= із JSON",
    context: "Типовий ендпоінт REST API: взяти параметр із запиту, знайти запис, віддати JSON або чесну помилку. У пісочниці немає мережі, тому обробник викликається напряму через httptest, так само працюють справжні тести серверів.",
    brief: [
      "Допишіть <code>getTask</code>: якщо метод не <code>GET</code>, відповідайте <code>http.Error(w, \"Метод не дозволено\", http.StatusMethodNotAllowed)</code> і виходьте.",
      "Прочитайте <code>id</code> з <code>r.URL.Query()</code> (число через <code>strconv.Atoi</code>), знайдіть задачу в <code>tasks</code> і віддайте її як JSON із заголовком <code>Content-Type: application/json</code>. Якщо id некоректний або задачі немає, відповідайте <code>http.Error(w, \"Задачу не знайдено\", http.StatusNotFound)</code>.",
    ],
    starter: raw`package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

type Task struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
	Done  bool   ${BT}json:"done"${BT}
}

var tasks = []Task{{1, "Вивчити Go", false}, {2, "Написати сервер", true}}

func getTask(w http.ResponseWriter, r *http.Request) {
	_ = json.NewEncoder(w)
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
    checks: [
      { on: "stdout", name: "Знайдену задачу віддано як JSON зі статусом 200", has: '200 application/json {"id":2,"title":"Написати сервер","done":true}', hint: "Виставте Content-Type до того, як писати тіло, і закодуйте задачу через json.NewEncoder(w)" },
      { on: "stdout", name: "Для відсутньої задачі статус 404 і повідомлення", has: "404 text/plain; charset=utf-8 Задачу не знайдено", hint: "http.Error(w, \"Задачу не знайдено\", http.StatusNotFound), а далі return" },
      { on: "stdout", name: "Не-GET метод дає 405", has: "405 text/plain; charset=utf-8 Метод не дозволено", hint: "Порівняйте r.Method з http.MethodGet на початку обробника" },
      { on: "source", name: "Id читається з параметра запиту", has: "Query()", hint: "r.URL.Query().Get(\"id\")" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: '200 application/json {"id":2,"title":"Написати сервер","done":true}\n404 text/plain; charset=utf-8 Задачу не знайдено\n405 text/plain; charset=utf-8 Метод не дозволено' },
    ],
  },
  {
    ...base, id: "go-httptest-table", lesson: "go/93", xp: 30,
    title: "Табличний тест обробника",
    context: "Тести обробників у Go будуються однаково: допоміжна функція робить запит і повертає записник, а таблиця випадків перевіряє код і тіло. Так тестують справжні сервіси без відкриття порту.",
    brief: [
      "Допишіть <code>call</code>: створіть записник через <code>httptest.NewRecorder</code>, викличте <code>h</code> із запитом <code>httptest.NewRequest(method, url, nil)</code> і поверніть записник.",
      "У <code>main</code> пройдіть по таблиці: порівняйте <code>rec.Code</code> з <code>wantCode</code> і <code>strings.TrimSpace(rec.Body.String())</code> з <code>wantBody</code>. Збіг: виведіть <code>ok   &lt;назва&gt;</code> і збільште <code>passed</code>, інакше <code>FAIL &lt;назва&gt;</code>. Наприкінці виведіть <code>Пройдено N з M</code>.",
    ],
    starter: raw`package main

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
	return httptest.NewRecorder()
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
	_ = strings.TrimSpace
	fmt.Printf("Пройдено %d з %d\n", passed, len(tests))
}
`,
    checks: [
      { on: "stdout", name: "Перший випадок проходить", has: "ok   GET з ім'ям", hint: "У call викличте h(rec, httptest.NewRequest(...)) і поверніть rec" },
      { on: "stdout", name: "Випадки з помилками проходять", has: "ok   POST заборонено", hint: "Тіло з http.Error закінчується переносом рядка: використайте strings.TrimSpace" },
      { on: "stdout", name: "Підсумок", has: "Пройдено 4 з 4", hint: "Збільшуйте passed лише коли і код, і тіло збіглися" },
      { on: "source", name: "Використано NewRecorder", has: "httptest.NewRecorder()", hint: "Записник створюється всередині call" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "ok   GET з ім'ям\nok   GET без імені\nok   POST заборонено\nok   інше ім'я\nПройдено 4 з 4" },
    ],
  },
  {
    ...base, id: "go-servemux-routes", lesson: "go/94", xp: 30,
    title: "Маршрути ServeMux Go 1.22",
    context: "Сучасний ServeMux сам розрізняє методи й параметри шляху та відповідає 404 і 405. Правильні шаблони замінюють ручні перевірки r.Method і розбір рядка шляху.",
    brief: [
      "Допишіть <code>newMux</code> і зареєструйте: <code>GET /{$}</code> (відповідь <code>home</code>), <code>GET /tasks/{id}</code> (<code>task &lt;id&gt;</code> через <code>r.PathValue</code>), <code>GET /tasks/new</code> (<code>form</code>), <code>GET /files/{path...}</code> (<code>file &lt;path&gt;</code>).",
      "405 і 404 мультиплексор виставить сам: перевіряти метод вручну не потрібно. Дивіться на вивід у <code>main</code>: <code>POST /tasks/7</code> має дати 405 із заголовком <code>Allow</code>.",
    ],
    starter: raw`//go:debug httpmuxgo121=0
package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func newMux() *http.ServeMux {
	mux := http.NewServeMux()
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
    checks: [
      { on: "stdout", name: "Головна лише для /", has: "GET / -> 200 home []", hint: "Шаблон \"GET /{$}\" відповідає тільки точному шляху /" },
      { on: "stdout", name: "Параметр шляху", has: "GET /tasks/7 -> 200 task 7 []", hint: "r.PathValue(\"id\") у шаблоні \"GET /tasks/{id}\"" },
      { on: "stdout", name: "Літерал вужчий за змінну", has: "GET /tasks/new -> 200 form []", hint: "Шаблон /tasks/new специфічніший, ніж /tasks/{id}" },
      { on: "stdout", name: "Залишок шляху", has: "GET /files/a/b.txt -> 200 file a/b.txt []", hint: "Шаблон \"GET /files/{path...}\"" },
      { on: "stdout", name: "Автоматичні 405 і 404", has: "POST /tasks/7 -> 405 Method Not Allowed [GET, HEAD]\nGET /nope -> 404 404 page not found []", hint: "Окремий код для 404 і 405 писати не потрібно, лише правильні шаблони з методом" },
      { on: "source", name: "Використано PathValue", has: "PathValue(", hint: "Значення змінної дістається методом r.PathValue" },
    ],
  },
  {
    ...base, id: "go-json-crud", lesson: "go/95", xp: 45,
    title: "JSON API: створення і видалення",
    context: "Створення й видалення записів із правильними кодами 201, 204, 400 і 404 — основа будь-якого REST API. Помилки віддаються JSON-ом, щоб клієнт мав один формат відповіді.",
    brief: [
      "Допишіть <code>createTask</code>: прочитайте JSON через <code>json.NewDecoder(r.Body)</code>. Зламаний JSON дає <code>400</code> і <code>{\"error\":\"некоректний JSON\"}</code>, порожня назва дає <code>400</code> і <code>{\"error\":\"потрібна назва\"}</code>. Інакше призначте <code>ID = nextID</code>, збільште <code>nextID</code>, збережіть у <code>tasks</code> і відповідайте <code>201</code> та задачею.",
      "Допишіть <code>deleteTask</code>: id із <code>r.PathValue(\"id\")</code>. Якщо задачі немає, <code>404</code> і <code>{\"error\":\"задачу не знайдено\"}</code>; якщо є, видаліть її й відповідайте <code>204</code> без тіла. Допоміжні <code>writeJSON</code> і <code>writeError</code> уже написані.",
    ],
    starter: raw`//go:debug httpmuxgo121=0
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
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
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
    checks: [
      { on: "stdout", name: "Створення дає 201 і задачу з новим id", has: 'POST /tasks -> 201 {"id":3,"title":"Купити хліб","done":false}', hint: "Після Decode призначте ID, збережіть у мапу і writeJSON(w, http.StatusCreated, t)" },
      { on: "stdout", name: "Зламаний JSON і порожня назва дають 400", has: 'POST /tasks -> 400 {"error":"некоректний JSON"}\nPOST /tasks -> 400 {"error":"потрібна назва"}', hint: "Помилка Decode: некоректний JSON; потім перевірте t.Title == \"\"" },
      { on: "stdout", name: "Створену задачу видно через GET", has: 'GET /tasks/3 -> 200 {"id":3,"title":"Купити хліб","done":false}', hint: "Збережіть задачу в tasks[t.ID]" },
      { on: "stdout", name: "Видалення дає 204", has: "DELETE /tasks/3 -> 204", hint: "Для 204 достатньо w.WriteHeader(http.StatusNoContent), без тіла" },
      { on: "stdout", name: "Повторне видалення дає 404", has: 'DELETE /tasks/3 -> 404 {"error":"задачу не знайдено"}', hint: "Перед видаленням перевірте, чи є ключ у мапі, і відповідайте writeError" },
      { on: "source", name: "Тіло читається декодером", has: "json.NewDecoder(r.Body)", hint: "json.NewDecoder(r.Body).Decode(&t)" },
    ],
  },
];
