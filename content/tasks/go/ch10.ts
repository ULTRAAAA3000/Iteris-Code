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
  {
    ...base, id: "go-middleware-chain", lesson: "go/96", xp: 35,
    title: "Middleware: логування і ключ доступу",
    context: "Логування й перевірка ключа живуть у middleware, щоб кожен обробник не повторював їх. Тут ви напишете два шари й побачите, як порядок ланцюжка впливає на лог.",
    brief: [
      "Допишіть <code>auth</code>: якщо заголовок <code>X-API-Key</code> не дорівнює <code>secret</code>, відповідайте <code>http.Error(w, \"потрібен ключ\", http.StatusUnauthorized)</code> і не викликайте <code>next</code>.",
      "Допишіть <code>logging</code>: підставте обгортку <code>statusWriter</code> (вона запам'ятовує статус у <code>WriteHeader</code>, початково 200), викличте <code>next</code> і виведіть <code>METHOD path -> статус</code>. Ланцюжок у <code>main</code> уже складено: <code>logging</code> зовнішній, щоб бачити й 401.",
    ],
    starter: raw`package main

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

func logging(next http.Handler) http.Handler {
	return next
}

func auth(next http.Handler) http.Handler {
	return next
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
    checks: [
      { on: "stdout", name: "Успішний запит залогований зі статусом 200", has: "GET /ok -> 200\nтіло: ok", hint: "Лог друкується після next.ServeHTTP, коли статус уже відомий" },
      { on: "stdout", name: "Статус 404 від мультиплексора теж видно", has: "GET /missing -> 404", hint: "Передайте в next обгортку sw, а не оригінальний w" },
      { on: "stdout", name: "Без ключа 401 і в логу, і в тілі", has: "GET /ok -> 401\nтіло: потрібен ключ", hint: "У auth після http.Error обов'язково return" },
      { on: "source", name: "Статус перехоплюється у WriteHeader", has: "WriteHeader(", hint: "func (s *statusWriter) WriteHeader(code int) { s.status = code; ... }" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "GET /ok -> 200\nтіло: ok\nGET /missing -> 404\nтіло: 404 page not found\nGET /ok -> 401\nтіло: потрібен ключ" },
    ],
  },
  {
    ...base, id: "go-http-client-fake", lesson: "go/97", xp: 35,
    title: "Клієнт: статус, Body і контекст",
    context: "Клієнтський код має перевіряти статус і закривати тіло. Мережі в пісочниці немає, тому сервер підмінено фейковим RoundTripper: так тестують клієнтів і у справжніх проєктах.",
    brief: [
      "Допишіть <code>fetch(ctx, c, url)</code>: створіть запит через <code>http.NewRequestWithContext</code>, виконайте <code>c.Do</code>, закрийте тіло через <code>defer resp.Body.Close()</code>.",
      "Якщо статус не <code>200</code>, поверніть помилку <code>fmt.Errorf(\"статус %d\", resp.StatusCode)</code>. Інакше прочитайте тіло через <code>io.ReadAll</code> і поверніть його рядком.",
    ],
    starter: raw`package main

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
	return "", nil
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
    checks: [
      { on: "stdout", name: "Успішна відповідь повертає тіло", has: "ok: Hello", hint: "Після перевірки статусу прочитайте resp.Body через io.ReadAll" },
      { on: "stdout", name: "404 перетворено на помилку", has: "помилка: статус 404", hint: "Для Go 404 не помилка транспорту: перевірте resp.StatusCode самі" },
      { on: "stdout", name: "500 перетворено на помилку", has: "помилка: статус 500", hint: "fmt.Errorf(\"статус %d\", resp.StatusCode)" },
      { on: "source", name: "Тіло закривається", has: "Body.Close()", hint: "defer resp.Body.Close() одразу після перевірки err" },
      { on: "source", name: "Запит створено з контекстом", has: "NewRequestWithContext(", hint: "http.NewRequestWithContext(ctx, http.MethodGet, url, nil)" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "ok: Hello\nпомилка: статус 404\nпомилка: статус 500" },
    ],
  },
  {
    ...base, id: "go-context-timeout", lesson: "go/98", xp: 40,
    title: "Контекст запиту: id і тайм-аут",
    context: "Обробник має обмежувати свій час і знати id запиту, що прийшов через middleware. Усе це несе контекст: значення з типізованим ключем і скасування за строком.",
    brief: [
      "Допишіть <code>requestID(ctx)</code>: дістаньте значення за ключем <code>idKey</code> через <code>ctx.Value</code> і приведіть до <code>string</code> (з <code>, _</code>). Допишіть <code>slowQuery(ctx, d)</code>: <code>select</code> на <code>time.After(d)</code> (повернути <code>nil</code>) і <code>ctx.Done()</code> (повернути <code>ctx.Err()</code>).",
      "У <code>search</code> створіть <code>context.WithTimeout(r.Context(), 30*time.Millisecond)</code> із <code>defer cancel()</code>. Якщо <code>slowQuery</code> повернув помилку, відповідайте <code>http.Error(w, id+\" час вичерпано\", http.StatusGatewayTimeout)</code>, інакше напишіть <code>&lt;id&gt; готово</code>.",
    ],
    starter: raw`package main

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
	return ""
}

func slowQuery(ctx context.Context, d time.Duration) error {
	return nil
}

func search(w http.ResponseWriter, r *http.Request) {
	ms, _ := strconv.Atoi(r.URL.Query().Get("ms"))
	_ = ms
	fmt.Fprint(w, "готово")
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
    checks: [
      { on: "stdout", name: "Швидкий запит успішний, id з контексту", has: "200 req-1 готово", hint: "id дістається через ctx.Value(idKey).(string) і додається у відповідь" },
      { on: "stdout", name: "Повільний запит дає 504", has: "504 req-2 час вичерпано", hint: "slowQuery має повернути ctx.Err(), коли спрацював таймер контексту" },
      { on: "source", name: "Ліміт часу через WithTimeout", has: "WithTimeout(", hint: "ctx, cancel := context.WithTimeout(r.Context(), 30*time.Millisecond); defer cancel()" },
      { on: "source", name: "Очікування скасування через ctx.Done()", has: "ctx.Done()", hint: "select { case <-time.After(d): ... case <-ctx.Done(): ... }" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "200 req-1 готово\n504 req-2 час вичерпано" },
    ],
  },
  {
    ...base, id: "go-graceful-shutdown", lesson: "go/99", xp: 45,
    title: "Коректна зупинка сервера",
    context: "Сервіс має зупинятися по сигналу, дати запитам завершитись і примусово закритися, якщо вони зависли. Логіка винесена в функцію над інтерфейсом, тож її можна перевірити з моком без мережі.",
    brief: [
      "Допишіть <code>run(ctx, srv, grace)</code>: запустіть <code>srv.ListenAndServe()</code> у горутині з результатом у буферизований канал. Дочекайтесь <code>ctx.Done()</code> або помилки з каналу, виведіть <code>зупинка</code>.",
      "Викличте <code>srv.Shutdown</code> із <i>новим</i> контекстом <code>context.WithTimeout(context.Background(), grace)</code>. Якщо він повернув помилку, викличте <code>srv.Close()</code> і поверніть цю помилку. Інакше дочекайтесь результату горутини: <code>http.ErrServerClosed</code> означає успіх (поверніть <code>nil</code>).",
    ],
    starter: raw`package main

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
    checks: [
      { on: "stdout", name: "Швидкий сервер зупиняється без помилки", has: "зупинка\nшвидкий підсумок: ok", hint: "Після успішного Shutdown дочекайтесь помилки з каналу й порівняйте її з http.ErrServerClosed" },
      { on: "stdout", name: "Завислий викликає Close і дає тайм-аут", has: "завислий Close\nзавислий підсумок: context deadline exceeded", hint: "Якщо Shutdown повернув помилку, викличте srv.Close() і поверніть її" },
      { on: "source", name: "Shutdown із тайм-аутом", has: "WithTimeout(", hint: "context.WithTimeout(context.Background(), grace) для Shutdown" },
      { on: "source", name: "Нормальна зупинка не вважається помилкою", has: "http.ErrServerClosed", hint: "ListenAndServe після Shutdown повертає http.ErrServerClosed" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "зупинка\nшвидкий підсумок: ok\nзупинка\nзавислий Close\nзавислий підсумок: context deadline exceeded" },
    ],
  },
];
