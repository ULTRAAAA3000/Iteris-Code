import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_12: readonly RemoteTask[] = [
  {
    ...base, id: "go-project-textstats", lesson: "go/106", xp: 40,
    title: "Проєкт: звіт про текст",
    context: "Підрахунок слів, топ найчастіших і статистика речень лежать в основі пошукових індексів, аналізу логів і перевірки текстів. Детермінований звіт можна порівнювати тестами й показувати користувачам.",
    brief: [
      "Заготовка читає текст через <code>strings.NewReader</code> і друкує звіт. Допишіть п'ять функцій. <code>Words</code> розбиває текст на слова в нижньому регістрі: слово складається з літер, цифр і апострофа (<code>strings.FieldsFunc</code> та пакет <code>unicode</code>). <code>Frequencies</code> рахує частоти.",
      "<code>Top(freq, n)</code> повертає до n пар «слово, кількість», відсортованих за кількістю за спаданням, а за рівної кількості за словом за зростанням. <code>Longest</code> шукає найдовше слово за кількістю рун (за рівної довжини бере менше за алфавітом). <code>Sentences</code> рахує речення: закінчення <code>.</code>, <code>!</code> або <code>?</code> після хоча б однієї літери чи цифри; послідовність на кшталт <code>?!</code> дає одне речення.",
    ],
    starter: raw`package main

import (
	"bufio"
	"fmt"
	"io"
	"sort"
	"strings"
	"unicode"
	"unicode/utf8"
)

type WordCount struct {
	Word  string
	Count int
}

func readAll(r io.Reader) string {
	var lines []string
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		lines = append(lines, sc.Text())
	}
	return strings.Join(lines, " ")
}

func Words(text string) []string {
	return nil
}

func Frequencies(words []string) map[string]int {
	return nil
}

func Top(freq map[string]int, n int) []WordCount {
	return nil
}

func Longest(words []string) string {
	return ""
}

func Sentences(text string) int {
	return 0
}

var _ = sort.Slice
var _ = unicode.IsLetter
var _ = utf8.RuneCountInString

func main() {
	input := "The cat sat. The dog sat!\nIs the cat happy?\nПривіт, світ; привіт."
	text := readAll(strings.NewReader(input))
	words := Words(text)
	freq := Frequencies(words)
	fmt.Printf("words=%d unique=%d\n", len(words), len(freq))
	var parts []string
	for _, wc := range Top(freq, 3) {
		parts = append(parts, fmt.Sprintf("%s=%d", wc.Word, wc.Count))
	}
	fmt.Println("top:", strings.Join(parts, " "))
	best := Longest(words)
	fmt.Printf("longest: %s (%d)\n", best, utf8.RuneCountInString(best))
	fmt.Printf("sentences=%d\n", Sentences(text))
}
`,
    checks: [
      { on: "stdout", name: "Слова розібрано й пораховано", has: "words=13 unique=8", hint: "Розбийте lower-case текст через FieldsFunc: роздільник це все, що не літера, не цифра й не апостроф" },
      { on: "stdout", name: "Топ-3 із детермінованим порядком", has: "top: the=3 cat=2 sat=2", hint: "Сортуйте за кількістю за спаданням, а за рівної кількості за словом за зростанням" },
      { on: "stdout", name: "Найдовше слово міряється в рунах", has: "longest: привіт (6)", hint: "Довжину слова дає utf8.RuneCountInString, len рахує байти" },
      { on: "stdout", name: "Речення пораховано", has: "sentences=4", hint: "Лічіть закінчення речення лише тоді, коли перед ним уже була літера чи цифра" },
      { on: "source", name: "Порядок задає sort", has: "sort.Slice(", hint: "Мапу не можна сортувати: перенесіть пари у слайс і відсортуйте його" },
      { on: "stdout", name: "Повний звіт", equals: "words=13 unique=8\ntop: the=3 cat=2 sat=2\nlongest: привіт (6)\nsentences=4" },
    ],
  },
  {
    ...base, id: "go-project-notes-api", lesson: "go/107", xp: 50,
    title: "Проєкт: REST API нотаток",
    context: "CRUD над ресурсом із валідацією, правильними статус-кодами й тестами через httptest це щоденна робота бекенд-розробника. Єдиний формат помилок і суворі коди роблять API передбачуваним для клієнтів.",
    brief: [
      "Сховище з <code>RWMutex</code>, <code>writeJSON</code>, <code>writeError</code> і маршрути вже готові. Допишіть <code>validate</code>: порожній (після <code>strings.TrimSpace</code>) заголовок дає помилку <code>title is required</code>.",
      "Допишіть три обробники. <code>create</code> розбирає JSON (помилка дає 400 <code>invalid json</code>), викликає <code>validate</code> (400 із текстом помилки) і відповідає 201 із новою нотаткою. <code>get</code> бере <code>r.PathValue(\"id\")</code>: нечисловий id це 400 <code>invalid id</code>, відсутня нотатка 404 <code>not found</code>, інакше 200. <code>remove</code> видаляє нотатку: 404, якщо її немає, інакше 204 без тіла.",
    ],
    starter: raw`//go:debug httpmuxgo121=0
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sort"
	"strconv"
	"strings"
	"sync"
)

var ErrNotFound = errors.New("not found")

type Note struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
	Body  string ${BT}json:"body"${BT}
}

type Store struct {
	mu    sync.RWMutex
	items map[int]Note
	next  int
}

func NewStore() *Store { return &Store{items: map[int]Note{}, next: 1} }

func (s *Store) Create(title, body string) Note {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := Note{ID: s.next, Title: title, Body: body}
	s.items[n.ID] = n
	s.next++
	return n
}

func (s *Store) Get(id int) (Note, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	n, ok := s.items[id]
	if !ok {
		return Note{}, ErrNotFound
	}
	return n, nil
}

func (s *Store) Delete(id int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.items[id]; !ok {
		return ErrNotFound
	}
	delete(s.items, id)
	return nil
}

func (s *Store) List() []Note {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Note, 0, len(s.items))
	for _, n := range s.items {
		out = append(out, n)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out
}

type input struct {
	Title string ${BT}json:"title"${BT}
	Body  string ${BT}json:"body"${BT}
}

func (in input) validate() error {
	return nil
}

type API struct{ store *Store }

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

func (a *API) create(w http.ResponseWriter, r *http.Request) {
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
}

func (a *API) remove(w http.ResponseWriter, r *http.Request) {
}

func (a *API) list(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, a.store.List())
}

func (a *API) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /notes", a.create)
	mux.HandleFunc("GET /notes", a.list)
	mux.HandleFunc("GET /notes/{id}", a.get)
	mux.HandleFunc("DELETE /notes/{id}", a.remove)
	return mux
}

var _ = strconv.Atoi
var _ = strings.TrimSpace

func main() {
	h := (&API{store: NewStore()}).routes()
	steps := [][3]string{
		{"POST", "/notes", ${BT}{"title":"Milk","body":"2 bottles"}${BT}},
		{"POST", "/notes", ${BT}{"title":"  "}${BT}},
		{"POST", "/notes", "{"},
		{"GET", "/notes/1", ""},
		{"GET", "/notes/7", ""},
		{"GET", "/notes/abc", ""},
		{"DELETE", "/notes/1", ""},
		{"DELETE", "/notes/1", ""},
		{"GET", "/notes", ""},
	}
	for _, s := range steps {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(s[0], s[1], strings.NewReader(s[2])))
		body := strings.TrimSpace(rec.Body.String())
		if body == "" {
			body = "(empty)"
		}
		fmt.Printf("%s %s -> %d %s\n", s[0], s[1], rec.Code, body)
	}
}
`,
    checks: [
      { on: "stdout", name: "Створення: 201 і JSON нотатки", has: 'POST /notes -> 201 {"id":1,"title":"Milk","body":"2 bottles"}', hint: "create: Decode у input, validate, потім writeJSON зі статусом 201 і результатом store.Create" },
      { on: "stdout", name: "Валідація: 400 для порожнього заголовка", has: '-> 400 {"error":"title is required"}', hint: "validate повертає помилку, коли TrimSpace(Title) порожній; create віддає її текст у writeError" },
      { on: "stdout", name: "Зламаний JSON: 400", has: '-> 400 {"error":"invalid json"}', hint: "Якщо Decode повернув помилку, відповідайте 400 і не йдіть далі" },
      { on: "stdout", name: "Читання: 200, 404 і 400 для сміттєвого id", has: 'GET /notes/7 -> 404 {"error":"not found"}', hint: "PathValue повертає рядок: Atoi дає 400 для abc, а ErrNotFound зі сховища дає 404" },
      { on: "stdout", name: "Видалення: 204, потім 404", has: 'DELETE /notes/1 -> 204 (empty)', hint: "Після успішного Delete викличте лише w.WriteHeader(http.StatusNoContent)" },
      { on: "source", name: "Id береться з шляху", has: "PathValue(", hint: "Значення {id} дістається через r.PathValue" },
      { on: "stdout", name: "Повний сценарій", equals: raw`POST /notes -> 201 {"id":1,"title":"Milk","body":"2 bottles"}
POST /notes -> 400 {"error":"title is required"}
POST /notes -> 400 {"error":"invalid json"}
GET /notes/1 -> 200 {"id":1,"title":"Milk","body":"2 bottles"}
GET /notes/7 -> 404 {"error":"not found"}
GET /notes/abc -> 400 {"error":"invalid id"}
DELETE /notes/1 -> 204 (empty)
DELETE /notes/1 -> 404 {"error":"not found"}
GET /notes -> 200 []` },
    ],
  },
  {
    ...base, id: "go-project-concurrent-map", lesson: "go/108", xp: 50,
    title: "Проєкт: паралельний Map із лімітом і скасуванням",
    context: "Масову обробку (завантаження, перевірку посилань, виклики API) запускають із лімітом паралелізму, зберігають порядок результатів і зупиняють усе після першої помилки. Саме цю роль у виробничому коді виконує errgroup.",
    brief: [
      "Заготовка містить групу з контекстом, семафором і <code>Wait</code>. Допишіть <code>fail(err)</code>: через <code>sync.Once</code> запам'ятайте першу помилку й викличте <code>cancel</code>. Допишіть <code>Go(f)</code>: займіть слот у семафорі (<code>g.sem</code>), якщо контекст уже скасований, звільніть слот і викличте <code>fail(ctx.Err())</code>, інакше запустіть горутину, що виконує <code>f(g.ctx)</code>, при помилці викликає <code>fail</code> і завжди звільняє слот та <code>wg.Done()</code>.",
      "Допишіть <code>Map[T, R any]</code>: створіть групу з лімітом, слайс результатів довжиною <code>len(in)</code>, запускайте по одному завданню на елемент і записуйте результат за його індексом. Якщо <code>Wait</code> повернув помилку, повертайте <code>nil</code> і її.",
    ],
    starter: raw`package main

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type Group struct {
	ctx    context.Context
	cancel context.CancelFunc
	wg     sync.WaitGroup
	sem    chan struct{}
	once   sync.Once
	err    error
}

func WithContext(parent context.Context, limit int) (*Group, context.Context) {
	ctx, cancel := context.WithCancel(parent)
	return &Group{ctx: ctx, cancel: cancel, sem: make(chan struct{}, limit)}, ctx
}

func (g *Group) fail(err error) {
}

func (g *Group) Go(f func(context.Context) error) {
}

func (g *Group) Wait() error {
	g.wg.Wait()
	g.cancel()
	return g.err
}

func Map[T, R any](ctx context.Context, in []T, limit int, fn func(context.Context, T) (R, error)) ([]R, error) {
	return nil, nil
}

func main() {
	var started, running, peak atomic.Int64

	squares, err := Map(context.Background(), []int{1, 2, 3, 4, 5, 6}, 3, func(ctx context.Context, n int) (int, error) {
		return n * n, nil
	})
	fmt.Println(squares, err)

	_, err = Map(context.Background(), []int{1, 2, 3, 4, 5}, 1, func(ctx context.Context, n int) (int, error) {
		started.Add(1)
		if n == 3 {
			return 0, errors.New("bad 3")
		}
		return n, nil
	})
	fmt.Printf("err=%v started=%d\n", err, started.Load())

	_, _ = Map(context.Background(), make([]int, 8), 2, func(ctx context.Context, n int) (int, error) {
		cur := running.Add(1)
		for {
			p := peak.Load()
			if cur <= p || peak.CompareAndSwap(p, cur) {
				break
			}
		}
		time.Sleep(time.Millisecond)
		running.Add(-1)
		return n, nil
	})
	fmt.Println("peak<=2:", peak.Load() <= 2)

	started.Store(0)
	cancelled, stop := context.WithCancel(context.Background())
	stop()
	_, err = Map(cancelled, []int{1, 2, 3}, 2, func(ctx context.Context, n int) (int, error) {
		started.Add(1)
		return n, nil
	})
	fmt.Printf("err=%v started=%d\n", err, started.Load())
}
`,
    checks: [
      { on: "stdout", name: "Результати в порядку входу", has: "[1 4 9 16 25 36] <nil>", hint: "Кожне завдання пише лише в out[i] свого індексу: порядок завершення горутин не має значення" },
      { on: "stdout", name: "Перша помилка зупиняє наступні завдання", has: "err=bad 3 started=3", hint: "fail викликає cancel; Go після отримання слота бачить ctx.Err() і не запускає завдання" },
      { on: "stdout", name: "Паралелізм обмежений семафором", has: "peak<=2: true", hint: "Перед запуском горутини надішліть struct{}{} у g.sem, а наприкінці горутини прочитайте з нього" },
      { on: "stdout", name: "Скасований контекст нічого не запускає", has: "err=context canceled started=0", hint: "Якщо g.ctx.Err() не nil, не запускайте горутину, а передайте помилку у fail" },
      { on: "source", name: "Завдання виконуються в горутинах", has: "go func", hint: "Go має запускати f в окремій горутині" },
      { on: "stdout", name: "Повний вивід", equals: "[1 4 9 16 25 36] <nil>\nerr=bad 3 started=3\npeak<=2: true\nerr=context canceled started=0" },
    ],
  },
  {
    ...base, id: "go-project-ttl-cache", lesson: "go/109", xp: 60,
    title: "Проєкт: generic-кеш з TTL, LRU та метриками",
    context: "Кеші з TTL і витісненням стоять перед базами й зовнішніми API. Інжектований годинник робить перевірку часу миттєвою, а метрики hit/miss показують, чи кеш взагалі вигідний.",
    brief: [
      "Заготовка має generic-тип <code>Cache[K comparable, V any]</code> з фальшивим годинником, списком LRU (<code>container/list</code>), мапою, <code>remove</code>, <code>Keys</code>, <code>Len</code> і <code>Stats</code>. Допишіть <code>Set(key, value, ttl)</code>: для наявного ключа оновіть значення й термін та перенесіть запис на початок; для нового додайте на початок і, якщо довжина списку перевищила <code>cap</code>, видаліть найдавніший (<code>c.ll.Back()</code>).",
      "Допишіть <code>Get(key)</code>: якщо ключа немає, це miss; якщо запис протермінований (<code>!now.Before(expires)</code>), видаліть його й порахуйте miss; інакше перенесіть на початок, порахуйте hit і поверніть значення. Допишіть <code>Sweep()</code>: видаліть усі прострочені записи й поверніть їх кількість (збережіть <code>Prev()</code> до видалення).",
    ],
    starter: raw`package main

import (
	"container/list"
	"fmt"
	"sync"
	"time"
)

type fakeClock struct{ t time.Time }

func (f *fakeClock) Now() time.Time          { return f.t }
func (f *fakeClock) Advance(d time.Duration) { f.t = f.t.Add(d) }

type entry[K comparable, V any] struct {
	key     K
	value   V
	expires time.Time
}

type Cache[K comparable, V any] struct {
	mu           sync.Mutex
	cap          int
	now          func() time.Time
	ll           *list.List
	items        map[K]*list.Element
	hits, misses int
}

func New[K comparable, V any](capacity int, now func() time.Time) *Cache[K, V] {
	return &Cache[K, V]{cap: capacity, now: now, ll: list.New(), items: map[K]*list.Element{}}
}

func (c *Cache[K, V]) remove(el *list.Element) {
	delete(c.items, el.Value.(*entry[K, V]).key)
	c.ll.Remove(el)
}

func (c *Cache[K, V]) Set(key K, value V, ttl time.Duration) {
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	var zero V
	return zero, false
}

func (c *Cache[K, V]) Sweep() int {
	return 0
}

func (c *Cache[K, V]) Len() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.ll.Len()
}

func (c *Cache[K, V]) Keys() []K {
	c.mu.Lock()
	defer c.mu.Unlock()
	var keys []K
	for el := c.ll.Front(); el != nil; el = el.Next() {
		keys = append(keys, el.Value.(*entry[K, V]).key)
	}
	return keys
}

func (c *Cache[K, V]) Stats() (hits, misses int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.hits, c.misses
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	c := New[string, int](2, clk.Now)
	s := 10 * time.Second
	c.Set("a", 1, s)
	c.Set("b", 2, s)
	v, ok := c.Get("a")
	fmt.Println("a:", v, ok)
	c.Set("c", 3, s)
	v, ok = c.Get("b")
	fmt.Println("b:", v, ok)
	fmt.Println("order:", c.Keys())
	clk.Advance(5 * time.Second)
	c.Set("a", 10, s)
	fmt.Println("order:", c.Keys())
	clk.Advance(6 * time.Second)
	v, ok = c.Get("a")
	fmt.Println("a:", v, ok)
	fmt.Println("swept:", c.Sweep(), "len:", c.Len())
	c.Set("d", 4, time.Second)
	clk.Advance(2 * time.Second)
	v, ok = c.Get("d")
	fmt.Println("d:", v, ok, "len:", c.Len())
	h, m := c.Stats()
	fmt.Printf("hits=%d misses=%d\n", h, m)
}
`,
    checks: [
      { on: "stdout", name: "Hit повертає значення", has: "a: 1 true", hint: "Get знаходить запис у мапі, перевіряє термін і повертає e.value та true" },
      { on: "stdout", name: "Ємність витісняє найдавніший запис", has: "b: 0 false", hint: "Після вставки третього ключа при cap=2 видаліть c.ll.Back(), бо a щойно використовували" },
      { on: "stdout", name: "Порядок LRU і оновлення TTL", has: "order: [a c]", hint: "Set для наявного ключа оновлює значення, термін і викликає MoveToFront" },
      { on: "stdout", name: "Sweep прибирає прострочені записи", has: "swept: 1 len: 1", hint: "Прострочений запис: !now.Before(expires); перед remove запам'ятайте el.Prev()" },
      { on: "stdout", name: "Get лінивo видаляє прострочене", has: "d: 0 false len: 1", hint: "Коли Get бачить прострочений запис, він викликає remove і рахує miss" },
      { on: "stdout", name: "Метрики hit і miss", has: "hits=2 misses=2", hint: "hits збільшується лише при успішному Get, misses при відсутньому й при простроченому" },
      { on: "stdout", name: "Повний вивід", equals: "a: 1 true\nb: 0 false\norder: [c a]\norder: [a c]\na: 10 true\nswept: 1 len: 1\nd: 0 false len: 1\nhits=2 misses=2" },
    ],
  },
  {
    ...base, id: "go-project-rate-limiter", lesson: "go/110", xp: 60,
    title: "Проєкт: token bucket і міддлвар із 429",
    context: "Rate limiter захищає API від перевантаження й перебору паролів. Інжектований годинник робить його поведінку детермінованою, а міддлвар із Retry-After дає клієнтам зрозумілу підказку, коли повторити запит.",
    brief: [
      "Заготовка містить структуру лімітера, <code>NewLimiter</code> (повне відро, <code>last = now()</code>), <code>clientIP</code> і <code>retrySeconds</code>. Допишіть <code>Allow() (bool, time.Duration)</code> під <code>Mutex</code>: рахуйте <code>n := now.Sub(l.last) / l.interval</code>; якщо n більше нуля, додайте n жетонів (не більше <code>burst</code>) і зсуньте <code>last</code> на <code>n*interval</code>. Якщо відро повне, встановіть <code>last = now</code>. Без жетонів поверніть <code>false</code> і час очікування <code>interval - now.Sub(last)</code>; інакше заберіть жетон і поверніть <code>true, 0</code>.",
      "Допишіть <code>Limiters.get(key)</code>: під м'ютексом знайдіть лімітер клієнта або створіть через <code>ls.make()</code> і збережіть. Допишіть <code>RateLimit(ls, next)</code>: за відмови виставте <code>Retry-After</code> (через <code>retrySeconds</code>) і відповідайте <code>http.StatusTooManyRequests</code>, інакше викликайте <code>next</code>.",
    ],
    starter: raw`package main

import (
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"strconv"
	"sync"
	"time"
)

type fakeClock struct{ t time.Time }

func (f *fakeClock) Now() time.Time          { return f.t }
func (f *fakeClock) Advance(d time.Duration) { f.t = f.t.Add(d) }

type Limiter struct {
	mu       sync.Mutex
	interval time.Duration
	burst    int
	tokens   int
	last     time.Time
	now      func() time.Time
}

func NewLimiter(interval time.Duration, burst int, now func() time.Time) *Limiter {
	return &Limiter{interval: interval, burst: burst, tokens: burst, last: now(), now: now}
}

func (l *Limiter) Allow() (bool, time.Duration) {
	return true, 0
}

type Limiters struct {
	mu    sync.Mutex
	byKey map[string]*Limiter
	make  func() *Limiter
}

func (ls *Limiters) get(key string) *Limiter {
	return nil
}

func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func retrySeconds(wait time.Duration) string {
	return strconv.Itoa(int((wait + time.Second - 1) / time.Second))
}

func RateLimit(ls *Limiters, next http.Handler) http.Handler {
	return next
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	ls := &Limiters{byKey: map[string]*Limiter{}, make: func() *Limiter {
		return NewLimiter(2*time.Second, 2, clk.Now)
	}}
	h := RateLimit(ls, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	}))
	call := func(addr string) {
		req := httptest.NewRequest("GET", "/", nil)
		req.RemoteAddr = addr
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		retry := rec.Header().Get("Retry-After")
		if retry == "" {
			retry = "-"
		}
		fmt.Printf("%s %d retry=%s\n", clientIP(req), rec.Code, retry)
	}
	call("10.0.0.1:5000")
	call("10.0.0.1:5001")
	call("10.0.0.1:5002")
	call("10.0.0.2:6000")
	clk.Advance(time.Second)
	call("10.0.0.1:5003")
	clk.Advance(time.Second)
	call("10.0.0.1:5004")
	call("10.0.0.1:5005")
}
`,
    checks: [
      { on: "stdout", name: "Сплеск у межах burst проходить", has: "10.0.0.1 200 retry=-", hint: "Відро спочатку повне: перші burst запитів мають отримати true" },
      { on: "stdout", name: "Перевищення дає 429 з Retry-After", has: "10.0.0.1 429 retry=2", hint: "Без жетонів Allow повертає interval - now.Sub(last), а міддлвар кладе retrySeconds(wait) у заголовок" },
      { on: "stdout", name: "Клієнти мають окремі відра", has: "10.0.0.2 200 retry=-", hint: "get створює лімітер для кожного ключа окремо й зберігає його в мапі" },
      { on: "stdout", name: "Час поповнює жетони, а відлік іде від last", has: "10.0.0.1 429 retry=1", hint: "Через 1 с із 2 с інтервалу жетона ще немає: n дорівнює нулю, чекати лишилось interval - 1 с" },
      { on: "source", name: "Відповідь 429 через стандартну константу", has: "StatusTooManyRequests", hint: "Використайте http.StatusTooManyRequests і http.Error" },
      { on: "source", name: "Заголовок Retry-After", has: "Retry-After", hint: "Виставте w.Header().Set(\"Retry-After\", ...) до http.Error" },
      { on: "stdout", name: "Повний вивід", equals: "10.0.0.1 200 retry=-\n10.0.0.1 200 retry=-\n10.0.0.1 429 retry=2\n10.0.0.2 200 retry=-\n10.0.0.1 429 retry=1\n10.0.0.1 200 retry=-\n10.0.0.1 429 retry=2" },
    ],
  },
];
