// Еталони чернеток проєктів Go: повний код користувача (без func main), що проходить усі вимоги.
const raw = String.raw;

const tasks = raw`package main

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// Не видаляйте: потрібне для перевірок.
var _ = fmt.Sprint
var _ = time.Second

var (
	ErrNotFound    = errors.New("завдання не знайдено")
	ErrEmptyTitle  = errors.New("порожня назва")
	ErrAlreadyDone = errors.New("завдання вже виконано")
)

type Task struct {
	ID    int
	Title string
	Done  bool
}

type Store struct {
	tasks  []Task
	nextID int
}

func NewStore() *Store {
	return &Store{nextID: 1}
}

func (s *Store) Add(title string) (int, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return 0, ErrEmptyTitle
	}
	id := s.nextID
	s.nextID++
	s.tasks = append(s.tasks, Task{ID: id, Title: title})
	return id, nil
}

func (s *Store) find(id int) int {
	for i, t := range s.tasks {
		if t.ID == id {
			return i
		}
	}
	return -1
}

func (s *Store) Done(id int) error {
	i := s.find(id)
	if i < 0 {
		return ErrNotFound
	}
	if s.tasks[i].Done {
		return ErrAlreadyDone
	}
	s.tasks[i].Done = true
	return nil
}

func (s *Store) Remove(id int) error {
	i := s.find(id)
	if i < 0 {
		return ErrNotFound
	}
	s.tasks = append(s.tasks[:i], s.tasks[i+1:]...)
	return nil
}

func (s *Store) Pending() []Task {
	res := []Task{}
	for _, t := range s.tasks {
		if !t.Done {
			res = append(res, t)
		}
	}
	return res
}

func (s *Store) Count() (pending, done int) {
	for _, t := range s.tasks {
		if t.Done {
			done++
		} else {
			pending++
		}
	}
	return
}
`;

const texttools = raw`package main

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

// Не видаляйте: потрібне для перевірок.
var _ = fmt.Sprint
var _ = time.Second

const punct = ".,!?;:\"'()«»—-"

func words(text string) []string {
	var res []string
	for _, w := range strings.Fields(strings.ToLower(text)) {
		w = strings.Trim(w, punct)
		if w != "" {
			res = append(res, w)
		}
	}
	return res
}

func WordFreq(text string) map[string]int {
	m := map[string]int{}
	for _, w := range words(text) {
		m[w]++
	}
	return m
}

func TopWords(text string, n int) []string {
	m := WordFreq(text)
	keys := make([]string, 0, len(m))
	for w := range m {
		keys = append(keys, w)
	}
	sort.Slice(keys, func(i, j int) bool {
		if m[keys[i]] != m[keys[j]] {
			return m[keys[i]] > m[keys[j]]
		}
		return keys[i] < keys[j]
	})
	if n < 0 {
		n = 0
	}
	if n > len(keys) {
		n = len(keys)
	}
	return keys[:n]
}

func letters(s string) map[rune]int {
	m := map[rune]int{}
	for _, r := range strings.ToLower(s) {
		if r != ' ' {
			m[r]++
		}
	}
	return m
}

func IsAnagram(a, b string) bool {
	x, y := letters(a), letters(b)
	if len(x) != len(y) {
		return false
	}
	for r, c := range x {
		if y[r] != c {
			return false
		}
	}
	return true
}

func Reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func Capitalize(s string) string {
	ws := strings.Fields(s)
	for i, w := range ws {
		r := []rune(w)
		ws[i] = strings.ToUpper(string(r[0])) + strings.ToLower(string(r[1:]))
	}
	return strings.Join(ws, " ")
}

func IsPalindrome(s string) bool {
	clean := strings.ReplaceAll(strings.ToLower(s), " ", "")
	return clean != "" && clean == Reverse(clean)
}
`;

const pipeline = raw`package main

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// Не видаляйте: потрібне для перевірок.
var _ = fmt.Sprint
var _ = time.Second
var _ = sort.Ints
var _ sync.WaitGroup

func Generate(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, n := range nums {
			out <- n
		}
	}()
	return out
}

func Square(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for n := range in {
			out <- n * n
		}
	}()
	return out
}

func Merge(chs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for _, c := range chs {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}()
	}
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}

func Process(nums []int, workers int) []int {
	if workers < 1 {
		workers = 1
	}
	jobs := make(chan int)
	results := make(chan int)
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for n := range jobs {
				results <- n * n
			}
		}()
	}
	go func() {
		for _, n := range nums {
			jobs <- n
		}
		close(jobs)
	}()
	go func() {
		wg.Wait()
		close(results)
	}()
	res := []int{}
	for v := range results {
		res = append(res, v)
	}
	sort.Ints(res)
	return res
}

type Counter struct {
	mu sync.Mutex
	n  int
}

func (c *Counter) Inc() {
	c.mu.Lock()
	c.n++
	c.mu.Unlock()
}

func (c *Counter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.n
}

func WithTimeout(ch <-chan int, d time.Duration) (int, bool) {
	select {
	case v := <-ch:
		return v, true
	case <-time.After(d):
		return 0, false
	}
}
`;

export default { "go-tasks": tasks, "go-texttools": texttools, "go-pipeline": pipeline };
