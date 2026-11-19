const raw = String.raw;
const BT = "`";

export const SOLUTIONS_12 = {
  "go-project-textstats": raw`package main

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
	return strings.FieldsFunc(strings.ToLower(text), func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '\''
	})
}

func Frequencies(words []string) map[string]int {
	freq := make(map[string]int)
	for _, w := range words {
		freq[w]++
	}
	return freq
}

func Top(freq map[string]int, n int) []WordCount {
	list := make([]WordCount, 0, len(freq))
	for w, c := range freq {
		list = append(list, WordCount{w, c})
	}
	sort.Slice(list, func(i, j int) bool {
		if list[i].Count != list[j].Count {
			return list[i].Count > list[j].Count
		}
		return list[i].Word < list[j].Word
	})
	if n < len(list) {
		list = list[:n]
	}
	return list
}

func Longest(words []string) string {
	best := ""
	for _, w := range words {
		bl, wl := utf8.RuneCountInString(best), utf8.RuneCountInString(w)
		if wl > bl || (wl == bl && w < best) {
			best = w
		}
	}
	return best
}

func Sentences(text string) int {
	count, started := 0, false
	for _, r := range text {
		switch {
		case r == '.' || r == '!' || r == '?':
			if started {
				count++
				started = false
			}
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			started = true
		}
	}
	if started {
		count++
	}
	return count
}

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
  "go-project-notes-api": raw`//go:debug httpmuxgo121=0
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
	if strings.TrimSpace(in.Title) == "" {
		return errors.New("title is required")
	}
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
	var in input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if err := in.validate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, a.store.Create(in.Title, in.Body))
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	n, err := a.store.Get(id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, n)
}

func (a *API) remove(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := a.store.Delete(id); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
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
  "go-project-concurrent-map": raw`package main

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
	g.once.Do(func() {
		g.err = err
		g.cancel()
	})
}

func (g *Group) Go(f func(context.Context) error) {
	g.sem <- struct{}{}
	if err := g.ctx.Err(); err != nil {
		<-g.sem
		g.fail(err)
		return
	}
	g.wg.Add(1)
	go func() {
		defer func() {
			<-g.sem
			g.wg.Done()
		}()
		if err := f(g.ctx); err != nil {
			g.fail(err)
		}
	}()
}

func (g *Group) Wait() error {
	g.wg.Wait()
	g.cancel()
	return g.err
}

func Map[T, R any](ctx context.Context, in []T, limit int, fn func(context.Context, T) (R, error)) ([]R, error) {
	g, _ := WithContext(ctx, limit)
	out := make([]R, len(in))
	for i, v := range in {
		g.Go(func(ctx context.Context) error {
			r, err := fn(ctx, v)
			if err != nil {
				return err
			}
			out[i] = r
			return nil
		})
	}
	if err := g.Wait(); err != nil {
		return nil, err
	}
	return out, nil
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
  "go-project-ttl-cache": raw`package main

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
	c.mu.Lock()
	defer c.mu.Unlock()
	exp := c.now().Add(ttl)
	if el, ok := c.items[key]; ok {
		e := el.Value.(*entry[K, V])
		e.value, e.expires = value, exp
		c.ll.MoveToFront(el)
		return
	}
	c.items[key] = c.ll.PushFront(&entry[K, V]{key, value, exp})
	if c.ll.Len() > c.cap {
		c.remove(c.ll.Back())
	}
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	var zero V
	el, ok := c.items[key]
	if !ok {
		c.misses++
		return zero, false
	}
	e := el.Value.(*entry[K, V])
	if !c.now().Before(e.expires) {
		c.remove(el)
		c.misses++
		return zero, false
	}
	c.ll.MoveToFront(el)
	c.hits++
	return e.value, true
}

func (c *Cache[K, V]) Sweep() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	now, removed := c.now(), 0
	for el := c.ll.Back(); el != nil; {
		prev := el.Prev()
		if !now.Before(el.Value.(*entry[K, V]).expires) {
			c.remove(el)
			removed++
		}
		el = prev
	}
	return removed
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
  "go-project-rate-limiter": raw`package main

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
	l.mu.Lock()
	defer l.mu.Unlock()
	now := l.now()
	if n := int(now.Sub(l.last) / l.interval); n > 0 {
		l.tokens = min(l.burst, l.tokens+n)
		l.last = l.last.Add(time.Duration(n) * l.interval)
	}
	if l.tokens == l.burst {
		l.last = now
	}
	if l.tokens == 0 {
		return false, l.interval - now.Sub(l.last)
	}
	l.tokens--
	return true, 0
}

type Limiters struct {
	mu    sync.Mutex
	byKey map[string]*Limiter
	make  func() *Limiter
}

func (ls *Limiters) get(key string) *Limiter {
	ls.mu.Lock()
	defer ls.mu.Unlock()
	l, ok := ls.byKey[key]
	if !ok {
		l = ls.make()
		ls.byKey[key] = l
	}
	return l
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
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ok, wait := ls.get(clientIP(r)).Allow()
		if !ok {
			w.Header().Set("Retry-After", retrySeconds(wait))
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
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
};
