// ЧЕРНЕТКИ проєктів за ТЗ для курсу Go (підключені: PROGRAM_PROJECTS у index.ts). Еталони: tests/solutions/go-projects.mjs.
// Код користувача + harness складаються в один main.go (див. assemble у types.ts): імпорти starter мають покривати harness.
import type { ProgramProject } from "./program-types.ts";

const raw = String.raw;

// Спільна частина harness: запуск однієї перевірки в горутині з recover і тайм-аутом.
const RUNNER = raw`func harnessR(id string, f func() string) {
	ch := make(chan string, 1)
	go func() {
		defer func() {
			if e := recover(); e != nil {
				ch <- fmt.Sprint("паніка: ", e)
			}
		}()
		ch <- f()
	}()
	select {
	case m := <-ch:
		if m == "" {
			fmt.Println(id + " PASS")
		} else {
			fmt.Println(id + " FAIL: " + m)
		}
	case <-time.After(2 * time.Second):
		fmt.Println(id + " FAIL: перевищено час очікування (можливе зависання)")
	}
}
`;

const TASKS_HARNESS = RUNNER + raw`
func harnessTitles(ts []Task) string {
	t := []string{}
	for _, x := range ts {
		t = append(t, x.Title)
	}
	return fmt.Sprint(t)
}

func harnessIDs(ts []Task) string {
	t := []int{}
	for _, x := range ts {
		t = append(t, x.ID)
	}
	return fmt.Sprint(t)
}

func harnessCount(s *Store) string {
	p, d := s.Count()
	return fmt.Sprintf("%d/%d", p, d)
}

func harnessFill(s *Store, titles ...string) {
	for _, t := range titles {
		s.Add(t)
	}
}

func main() {
	harnessR("R1", func() string {
		s := NewStore()
		if s == nil {
			return "NewStore повернув nil"
		}
		if c := harnessCount(s); c != "0/0" {
			return "у новому сховищі Count має бути 0, 0, а не " + c
		}
		if len(s.Pending()) != 0 {
			return "у новому сховищі Pending має бути порожнім"
		}
		return ""
	})
	harnessR("R2", func() string {
		s := NewStore()
		for i, t := range []string{"Купити хліб", "  Полити квіти  ", "Зателефонувати"} {
			id, err := s.Add(t)
			if err != nil || id != i+1 {
				return fmt.Sprintf("Add(%q) повернув (%d, %v), очікувалось (%d, nil)", t, id, err, i+1)
			}
		}
		p := s.Pending()
		if got := harnessTitles(p); got != "[Купити хліб Полити квіти Зателефонувати]" {
			return "Pending містить назви " + got
		}
		if got := harnessIDs(p); got != "[1 2 3]" {
			return "id у Pending: " + got
		}
		return ""
	})
	harnessR("R3", func() string {
		s := NewStore()
		for _, t := range []string{"", "   "} {
			id, err := s.Add(t)
			if id != 0 || !errors.Is(err, ErrEmptyTitle) {
				return fmt.Sprintf("Add(%q) має повернути (0, ErrEmptyTitle), а повернув (%d, %v)", t, id, err)
			}
		}
		if c := harnessCount(s); c != "0/0" {
			return "після відхилених Add сховище має лишитися порожнім, Count = " + c
		}
		if id, _ := s.Add("Перша"); id != 1 {
			return fmt.Sprint("відхилений Add не повинен витрачати id: наступний id ", id, " замість 1")
		}
		return ""
	})
	harnessR("R4", func() string {
		s := NewStore()
		harnessFill(s, "a", "b", "c")
		if err := s.Done(2); err != nil {
			return fmt.Sprint("Done(2) повернув ", err)
		}
		p := s.Pending()
		if got := harnessIDs(p); got != "[1 3]" {
			return "після Done(2) у Pending мають бути id [1 3], а є " + got
		}
		if c := harnessCount(s); c != "2/1" {
			return "Count має бути 2, 1, а є " + c
		}
		return ""
	})
	harnessR("R5", func() string {
		s := NewStore()
		harnessFill(s, "a", "b")
		for _, id := range []int{0, 99, -1} {
			if err := s.Done(id); !errors.Is(err, ErrNotFound) {
				return fmt.Sprintf("Done(%d) має повернути ErrNotFound, а повернув %v", id, err)
			}
		}
		if err := s.Done(1); err != nil {
			return fmt.Sprint("перший Done(1) повернув ", err)
		}
		if err := s.Done(1); !errors.Is(err, ErrAlreadyDone) {
			return fmt.Sprint("повторний Done(1) має повернути ErrAlreadyDone, а повернув ", err)
		}
		if c := harnessCount(s); c != "1/1" {
			return "Count має бути 1, 1, а є " + c
		}
		return ""
	})
	harnessR("R6", func() string {
		s := NewStore()
		harnessFill(s, "a", "b", "c")
		if err := s.Remove(2); err != nil {
			return fmt.Sprint("Remove(2) повернув ", err)
		}
		if got := harnessTitles(s.Pending()); got != "[a c]" {
			return "після Remove(2) у Pending " + got
		}
		if err := s.Remove(2); !errors.Is(err, ErrNotFound) {
			return fmt.Sprint("повторний Remove(2) має повернути ErrNotFound, а повернув ", err)
		}
		s.Done(1)
		if err := s.Remove(1); err != nil {
			return fmt.Sprint("Remove виконаного завдання повернув ", err)
		}
		if c := harnessCount(s); c != "1/0" {
			return "після видалення Count має бути 1, 0, а є " + c
		}
		return ""
	})
	harnessR("R7", func() string {
		s := NewStore()
		harnessFill(s, "a", "b")
		s.Remove(2)
		if id, _ := s.Add("c"); id != 3 {
			return fmt.Sprint("id видаленого завдання не можна використовувати знову: отримали ", id, ", очікували 3")
		}
		s.Remove(1)
		if id, _ := s.Add("d"); id != 4 {
			return fmt.Sprint("наступний id має бути 4, а є ", id)
		}
		return ""
	})
	harnessR("R8", func() string {
		s := NewStore()
		harnessFill(s, "a", "b", "c")
		s.Done(2)
		p := s.Pending()
		if len(p) != 2 {
			return fmt.Sprint("Pending має містити 2 завдання, а містить ", len(p))
		}
		p[0].Title = "ЗМІНЕНО"
		p[1] = Task{}
		if got := harnessTitles(s.Pending()); got != "[a c]" {
			return "зміна результату Pending вплинула на сховище: " + got
		}
		s.Done(1)
		s.Done(3)
		if p := s.Pending(); len(p) != 0 {
			return "коли все виконано, Pending має бути порожнім"
		}
		return ""
	})
}
`;

const TEXT_HARNESS = RUNNER + raw`
func harnessSame(a, b []string) bool {
	return fmt.Sprint(a) == fmt.Sprint(b)
}

func harnessFreq(m map[string]int, want map[string]int) string {
	if m == nil {
		return "WordFreq повернула nil замість мапи"
	}
	if fmt.Sprint(m) != fmt.Sprint(want) {
		return fmt.Sprintf("отримали %v, очікували %v", m, want)
	}
	return ""
}

func main() {
	harnessR("R1", func() string {
		return harnessFreq(WordFreq("a b a c a b"), map[string]int{"a": 3, "b": 2, "c": 1})
	})
	harnessR("R2", func() string {
		if m := harnessFreq(WordFreq("Hello, hello! HELLO."), map[string]int{"hello": 3}); m != "" {
			return "Hello, hello! HELLO.: " + m
		}
		return harnessFreq(WordFreq("Привіт, світе! привіт (СВІТЕ) — «так»"), map[string]int{"привіт": 2, "світе": 2, "так": 1})
	})
	harnessR("R3", func() string {
		for _, t := range []string{"", "   ", "... !!! —"} {
			if m := harnessFreq(WordFreq(t), map[string]int{}); m != "" {
				return fmt.Sprintf("текст %q: %s", t, m)
			}
		}
		return ""
	})
	harnessR("R4", func() string {
		got := TopWords("яблуко груша яблуко слива груша яблуко", 2)
		if !harnessSame(got, []string{"яблуко", "груша"}) {
			return fmt.Sprint("TopWords(..., 2) повернула ", got, ", очікувалось [яблуко груша]")
		}
		got = TopWords("Go go GO rust Rust c", 1)
		if !harnessSame(got, []string{"go"}) {
			return fmt.Sprint("TopWords(..., 1) повернула ", got, ", очікувалось [go]")
		}
		return ""
	})
	harnessR("R5", func() string {
		got := TopWords("dog cat bird cat dog emu", 4)
		if !harnessSame(got, []string{"cat", "dog", "bird", "emu"}) {
			return fmt.Sprint("при рівній частоті слова мають іти за алфавітом: ", got, ", очікувалось [cat dog bird emu]")
		}
		got = TopWords("b a", 10)
		if !harnessSame(got, []string{"a", "b"}) {
			return fmt.Sprint("якщо n більше за кількість слів, треба повернути всі: ", got)
		}
		if got = TopWords("b a", 0); got == nil || len(got) != 0 {
			return fmt.Sprint("TopWords(..., 0) має повернути порожній (не nil) зріз, а повернула ", got)
		}
		return ""
	})
	harnessR("R6", func() string {
		yes := [][2]string{{"listen", "silent"}, {"Listen", "SILENT"}, {"Dormitory", "dirty room"}, {"ліс", "сіл"}}
		for _, p := range yes {
			if !IsAnagram(p[0], p[1]) {
				return fmt.Sprintf("IsAnagram(%q, %q) має бути true", p[0], p[1])
			}
		}
		no := [][2]string{{"hello", "world"}, {"aab", "abb"}, {"abc", "abcd"}, {"ліс", "ліси"}}
		for _, p := range no {
			if IsAnagram(p[0], p[1]) {
				return fmt.Sprintf("IsAnagram(%q, %q) має бути false", p[0], p[1])
			}
		}
		return ""
	})
	harnessR("R7", func() string {
		cases := [][2]string{{"abc", "cba"}, {"Привіт", "тівирП"}, {"héllo", "olléh"}, {"日本語", "語本日"}, {"a", "a"}}
		for _, c := range cases {
			if got := Reverse(c[0]); got != c[1] {
				return fmt.Sprintf("Reverse(%q) = %q, очікувалось %q", c[0], got, c[1])
			}
		}
		return ""
	})
	harnessR("R8", func() string {
		cases := [][2]string{{"hello wORLD", "Hello World"}, {"  рУст   і го  ", "Руст І Го"}, {"ліс", "Ліс"}, {"x", "X"}}
		for _, c := range cases {
			if got := Capitalize(c[0]); got != c[1] {
				return fmt.Sprintf("Capitalize(%q) = %q, очікувалось %q", c[0], got, c[1])
			}
		}
		if got := Capitalize(""); got != "" {
			return fmt.Sprintf("Capitalize(\"\") = %q, очікувалось порожній рядок", got)
		}
		return ""
	})
	harnessR("R9", func() string {
		for _, s := range []string{"Level", "А роза упала на лапу Азора", "kayak", "x"} {
			if !IsPalindrome(s) {
				return fmt.Sprintf("IsPalindrome(%q) має бути true", s)
			}
		}
		for _, s := range []string{"Привіт", "go lang", "ab", ""} {
			if IsPalindrome(s) {
				return fmt.Sprintf("IsPalindrome(%q) має бути false", s)
			}
		}
		return ""
	})
}
`;

const PIPE_HARNESS = RUNNER + raw`
// Читає канал до закриття, але не довше за 1 секунду. ok=false, якщо канал не закрився.
func harnessDrain(ch <-chan int) ([]int, bool) {
	res := []int{}
	limit := time.After(time.Second)
	for {
		select {
		case v, open := <-ch:
			if !open {
				return res, true
			}
			res = append(res, v)
		case <-limit:
			return res, false
		}
	}
}

func harnessSorted(a []int) []int {
	b := append([]int{}, a...)
	sort.Ints(b)
	return b
}

func main() {
	harnessR("R1", func() string {
		got, ok := harnessDrain(Generate(5, 6, 7))
		if !ok {
			return "канал від Generate не закрито (або Generate повернула nil)"
		}
		if fmt.Sprint(got) != "[5 6 7]" {
			return fmt.Sprint("Generate(5, 6, 7) віддала ", got)
		}
		got, ok = harnessDrain(Generate())
		if !ok || len(got) != 0 {
			return "Generate() без чисел має одразу закрити канал"
		}
		return ""
	})
	harnessR("R2", func() string {
		got, ok := harnessDrain(Square(Generate(2, 3, 4, -5)))
		if !ok {
			return "канал від Square не закрито після закриття вхідного"
		}
		if fmt.Sprint(got) != "[4 9 16 25]" {
			return fmt.Sprint("Square(Generate(2, 3, 4, -5)) віддала ", got, ", очікувалось [4 9 16 25]")
		}
		return ""
	})
	harnessR("R3", func() string {
		got, ok := harnessDrain(Merge(Generate(1, 2, 3), Generate(10, 20), Generate(100)))
		if !ok {
			return "канал від Merge не закрито після закриття всіх вхідних"
		}
		if fmt.Sprint(harnessSorted(got)) != "[1 2 3 10 20 100]" {
			return fmt.Sprint("Merge віддала ", harnessSorted(got), ", очікувалось [1 2 3 10 20 100]")
		}
		return ""
	})
	harnessR("R4", func() string {
		got, ok := harnessDrain(Merge())
		if !ok || len(got) != 0 {
			return "Merge() без каналів має повернути вже закритий канал"
		}
		got, ok = harnessDrain(Merge(Generate(), Generate(7), Generate()))
		if !ok || fmt.Sprint(got) != "[7]" {
			return fmt.Sprint("Merge із порожніми каналами віддала ", got, " (закрито: ", ok, "), очікувалось [7]")
		}
		return ""
	})
	harnessR("R5", func() string {
		got := Process([]int{3, 1, 2, -4}, 3)
		if fmt.Sprint(got) != "[1 4 9 16]" {
			return fmt.Sprint("Process([3 1 2 -4], 3) = ", got, ", очікувалось [1 4 9 16]")
		}
		return ""
	})
	harnessR("R6", func() string {
		in := []int{9, 8, 7}
		got := Process(in, 10)
		if fmt.Sprint(got) != "[49 64 81]" {
			return fmt.Sprint("Process([9 8 7], 10) = ", got, ", очікувалось [49 64 81]")
		}
		if fmt.Sprint(in) != "[9 8 7]" {
			return "Process не повинна змінювати вхідний зріз"
		}
		for _, w := range []int{0, -3} {
			if got := Process([]int{2, 1}, w); fmt.Sprint(got) != "[1 4]" {
				return fmt.Sprintf("Process із workers=%d має працювати як із 1 працівником, а повернула %v", w, got)
			}
		}
		if got := Process(nil, 4); got == nil || len(got) != 0 {
			return fmt.Sprint("Process(nil, 4) має повернути порожній (не nil) зріз, а повернула ", got)
		}
		return ""
	})
	harnessR("R7", func() string {
		nums := make([]int, 1000)
		want := make([]int, 1000)
		for i := range nums {
			nums[i] = 1000 - i
			want[i] = (i + 1) * (i + 1)
		}
		got := Process(nums, 8)
		if len(got) != 1000 {
			return fmt.Sprint("із 1000 чисел отримали ", len(got), " результатів")
		}
		for i := range got {
			if got[i] != want[i] {
				return fmt.Sprintf("результат №%d: %d, очікувалось %d (втрачено або продубльовано завдання?)", i, got[i], want[i])
			}
		}
		return ""
	})
	harnessR("R8", func() string {
		var c Counter
		var wg sync.WaitGroup
		for g := 0; g < 100; g++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				for i := 0; i < 1000; i++ {
					c.Inc()
				}
			}()
		}
		wg.Wait()
		if v := c.Value(); v != 100000 {
			return fmt.Sprint("після 100 горутин по 1000 викликів Inc значення ", v, ", очікувалось 100000")
		}
		return ""
	})
	harnessR("R9", func() string {
		full := make(chan int, 1)
		full <- 7
		if v, ok := WithTimeout(full, time.Second); !ok || v != 7 {
			return fmt.Sprintf("WithTimeout із готовим значенням 7 повернула (%d, %v)", v, ok)
		}
		start := time.Now()
		empty := make(chan int)
		if v, ok := WithTimeout(empty, 50*time.Millisecond); ok || v != 0 {
			return fmt.Sprintf("на порожньому каналі WithTimeout має повернути (0, false), а повернула (%d, %v)", v, ok)
		}
		if el := time.Since(start); el < 40*time.Millisecond || el > time.Second {
			return fmt.Sprint("WithTimeout має чекати приблизно задану тривалість, а чекала ", el)
		}
		return ""
	})
}
`;

const NOTE = "// Не видаляйте: потрібне для перевірок.";

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "go-tasks",
    lang: "go",
    lesson: "go/54",
    title: "Список завдань у пам'яті",
    xp: 60,
    context:
      "Невелике сховище з типом, методами та чітко названими помилками — це скелет майже кожного сервісу: від трекера завдань до кошика інтернет-магазину. Помилки як значення, які можна порівняти через errors.Is, є стандартним способом домовлятися з викликачем у Go.",
    brief: [
      "Невелика команда хоче вбудувати у свій інструмент простий облік завдань. Бази даних поки немає: усе тримається в пам'яті. Вам потрібно написати тип <code>Store</code>, який додає завдання, позначає їх виконаними, видаляє та віддає список того, що ще треба зробити.",
      "Клієнтський код розрізнятиме ситуації за помилками, тому назви помилок і порядок id зафіксовано нижче. Запустимо вашу програму й перевіримо кожну вимогу R1–R8: у заготовці вже є типи й заглушки методів, ваше завдання їх реалізувати.",
    ],
    contract: [
      "<code>type Task struct { ID int; Title string; Done bool }</code> і <code>type Store struct</code> (поля Store обираєте самі).",
      "<code>func NewStore() *Store</code>; методи з вказівником: <code>Add(title string) (int, error)</code>, <code>Done(id int) error</code>, <code>Remove(id int) error</code>, <code>Pending() []Task</code>, <code>Count() (pending, done int)</code>.",
      "Сентинел-помилки (пакетні змінні, створені через <code>errors.New</code>): <code>ErrNotFound</code>, <code>ErrEmptyTitle</code>, <code>ErrAlreadyDone</code>. Перевірки порівнюють їх через <code>errors.Is</code>.",
      "Імпорти й рядки <code>var _ = …</code> у заготовці потрібні перевіркам, не видаляйте їх.",
    ],
    requirements: [
      {
        id: "R1",
        text: "<code>NewStore()</code> повертає готове сховище (не <code>nil</code>): <code>Count()</code> дає <code>0, 0</code>, а <code>Pending()</code> порожній.",
        hint: "Створіть і поверніть &amp;Store{} та задайте початкове значення для лічильника id (наприклад, 1).",
      },
      {
        id: "R2",
        text: "<code>Add</code> прибирає пробіли по краях назви й повертає id 1, 2, 3 … підряд. <code>Add(\"  Полити квіти  \")</code> зберігає «Полити квіти». <code>Pending()</code> віддає завдання в порядку id.",
        hint: "Назву обробіть через strings.TrimSpace. Окреме поле nextID у Store збільшуйте після кожного вдалого додавання.",
      },
      {
        id: "R3",
        text: "<code>Add</code> із порожньою назвою або з самих пробілів повертає <code>(0, ErrEmptyTitle)</code>, нічого не додає і не витрачає id (наступне вдале додавання отримає id 1).",
        hint: "Перевірте назву до того, як змінювати nextID чи слайс.",
      },
      {
        id: "R4",
        text: "<code>Done(id)</code> позначає завдання виконаним і повертає <code>nil</code>: воно зникає з <code>Pending()</code>. Для трьох завдань після <code>Done(2)</code> у <code>Pending()</code> лишаються id 1 і 3, а <code>Count()</code> дає <code>2, 1</code>.",
        hint: "Знайдіть завдання за id у слайсі і змініть s.tasks[i].Done (а не копію з for range).",
      },
      {
        id: "R5",
        text: "<code>Done</code> для невідомого id (0, -1, 99) повертає <code>ErrNotFound</code>; повторний <code>Done</code> для вже виконаного — <code>ErrAlreadyDone</code>, і лічильники не змінюються.",
        hint: "Спершу шукайте завдання (немає — ErrNotFound), потім перевірте поле Done.",
      },
      {
        id: "R6",
        text: "<code>Remove(id)</code> видаляє завдання (також виконане) і повертає <code>nil</code>; невідомий або вже видалений id дає <code>ErrNotFound</code>. Після видалення <code>Count()</code> враховує лише наявні завдання.",
        hint: "Видалення зі слайса: s.tasks = append(s.tasks[:i], s.tasks[i+1:]...).",
      },
      {
        id: "R7",
        text: "Id не використовуються повторно: після додавання двох завдань і <code>Remove(2)</code> наступний <code>Add</code> повертає 3, а після <code>Remove(1)</code> — 4.",
        hint: "Не вираховуйте id як len(tasks)+1. Тримайте окремий лічильник, який лише росте.",
      },
      {
        id: "R8",
        text: "<code>Pending()</code> повертає копію: зміна елементів повернутого слайса не впливає на сховище. Коли всі завдання виконано, результат має довжину 0.",
        hint: "Збирайте результат у новому слайсі, а не віддавайте s.tasks. Task копіюється за значенням.",
      },
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
	"time"
)

` + NOTE + raw`
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

// Store тримає завдання в пам'яті. TODO: додайте потрібні поля.
type Store struct {
}

// NewStore створює порожнє сховище. TODO: реалізуйте.
func NewStore() *Store {
	return nil
}

// Add додає завдання: TODO прибрати пробіли, відхилити порожню назву, видати наступний id.
func (s *Store) Add(title string) (int, error) {
	return 0, nil
}

// Done позначає завдання виконаним. TODO: ErrNotFound, ErrAlreadyDone.
func (s *Store) Done(id int) error {
	return nil
}

// Remove видаляє завдання. TODO: ErrNotFound для невідомого id.
func (s *Store) Remove(id int) error {
	return nil
}

// Pending повертає невиконані завдання в порядку id (копію). TODO: реалізуйте.
func (s *Store) Pending() []Task {
	return nil
}

// Count повертає кількість невиконаних і виконаних завдань. TODO: реалізуйте.
func (s *Store) Count() (pending, done int) {
	return 0, 0
}
`,
    harness: TASKS_HARNESS,
  },
  {
    id: "go-texttools",
    lang: "go",
    lesson: "go/30",
    title: "Інструменти тексту",
    xp: 70,
    context:
      "Розбір тексту на слова, підрахунок частот і робота з рядками як із послідовністю символів трапляються у пошуку, аналітиці, обробці логів і форм. Помилки з кирилицею та Unicode в таких місцях — одна з найчастіших причин «зламаних» даних.",
    brief: [
      "Редакція онлайн-журналу збирає внутрішню бібліотеку для аналізу статей: які слова вживаються найчастіше, чи є два заголовки анаграмами, як гарно оформити заголовок. Тексти змішані: українська, англійська, іноді з розділовими знаками.",
      "Ви пишете набір функцій у пакеті <code>main</code>. Запустимо вашу програму й перевіримо кожну вимогу R1–R9. Особливу увагу приділіть детермінованості: однаковий вхід завжди має давати однаковий результат, навіть для слів із рівною частотою.",
    ],
    contract: [
      "<code>func WordFreq(text string) map[string]int</code>: слова розділені пробільними символами, переводяться в нижній регістр, з країв слова прибираються символи <code>.,!?;:\"'()«»—-</code> (стала <code>punct</code> уже є в заготовці); порожні слова відкидаються. Результат ніколи не <code>nil</code>.",
      "<code>func TopWords(text string, n int) []string</code>: до n найчастіших слів за спаданням частоти, при рівній частоті за алфавітом. Для <code>n &lt;= 0</code> повертає порожній (не <code>nil</code>) зріз.",
      "<code>func IsAnagram(a, b string) bool</code>: без урахування регістру й пробілів. <code>func Reverse(s string) string</code>: за символами (рунами). <code>func Capitalize(s string) string</code>: кожне слово з великої літери, решта малими; слова розділяються одним пробілом, зайві пробіли зникають. <code>func IsPalindrome(s string) bool</code>: без урахування регістру й пробілів, порожній рядок не паліндром.",
      "Імпорти й рядки <code>var _ = …</code> у заготовці потрібні перевіркам, не видаляйте їх.",
    ],
    requirements: [
      {
        id: "R1",
        text: "<code>WordFreq(\"a b a c a b\")</code> повертає <code>a:3, b:2, c:1</code>.",
        hint: "Розбийте текст через strings.Fields і для кожного слова збільшуйте лічильник у мапі: m[w]++.",
      },
      {
        id: "R2",
        text: "Регістр і розділові знаки по краях не впливають: <code>\"Hello, hello! HELLO.\"</code> дає <code>hello:3</code>; <code>\"Привіт, світе! привіт (СВІТЕ) — «так»\"</code> дає <code>привіт:2, світе:2, так:1</code>.",
        hint: "strings.ToLower працює і з кирилицею. Для країв слова є strings.Trim(w, punct). Окреме «—» після обрізання стане порожнім і його треба пропустити.",
      },
      {
        id: "R3",
        text: "Для порожнього тексту, тексту з самих пробілів або з самих розділових знаків (<code>\"... !!! —\"</code>) <code>WordFreq</code> повертає порожню мапу, не <code>nil</code>.",
        hint: "Створіть мапу через make(map[string]int) або літерал на початку функції й пропускайте порожні слова.",
      },
      {
        id: "R4",
        text: "<code>TopWords(\"яблуко груша яблуко слива груша яблуко\", 2)</code> повертає <code>[яблуко груша]</code>; <code>TopWords(\"Go go GO rust Rust c\", 1)</code> повертає <code>[go]</code>.",
        hint: "Зберіть унікальні слова зі WordFreq у слайс і відсортуйте sort.Slice за частотою спадно.",
      },
      {
        id: "R5",
        text: "При рівній частоті слова йдуть за алфавітом: <code>TopWords(\"dog cat bird cat dog emu\", 4)</code> дає <code>[cat dog bird emu]</code>. Якщо n більше за кількість різних слів — повертаються всі; при <code>n = 0</code> — порожній зріз.",
        hint: "У функції порівняння: якщо частоти різні — більша першою, інакше keys[i] &lt; keys[j]. Обріжте n до len(keys) перед keys[:n].",
      },
      {
        id: "R6",
        text: "<code>IsAnagram</code> без урахування регістру й пробілів: <code>(\"Listen\", \"SILENT\")</code>, <code>(\"Dormitory\", \"dirty room\")</code>, <code>(\"ліс\", \"сіл\")</code> дають <code>true</code>; <code>(\"aab\", \"abb\")</code>, <code>(\"abc\", \"abcd\")</code> дають <code>false</code>.",
        hint: "Порахуйте руни кожного рядка в map[rune]int (без пробілів, у нижньому регістрі) і порівняйте дві мапи.",
      },
      {
        id: "R7",
        text: "<code>Reverse</code> перевертає за символами: <code>\"Привіт\"</code> стає <code>\"тівирП\"</code>, <code>\"héllo\"</code> — <code>\"olléh\"</code>, <code>\"日本語\"</code> — <code>\"語本日\"</code>.",
        hint: "Перетворіть рядок на []rune, поміняйте місцями елементи з двох кінців і поверніть string(r). Байти (s[i]) для цього не годяться.",
      },
      {
        id: "R8",
        text: "<code>Capitalize(\"hello wORLD\")</code> повертає <code>\"Hello World\"</code>; <code>\"  рУст   і го  \"</code> повертає <code>\"Руст І Го\"</code>; порожній рядок лишається порожнім.",
        hint: "Для кожного слова з strings.Fields: перша руна через strings.ToUpper, решта через strings.ToLower; з'єднайте strings.Join(…, \" \").",
      },
      {
        id: "R9",
        text: "<code>IsPalindrome</code> без урахування регістру й пробілів: <code>\"Level\"</code> і <code>\"А роза упала на лапу Азора\"</code> дають <code>true</code>; <code>\"Привіт\"</code>, <code>\"ab\"</code> і порожній рядок дають <code>false</code>.",
        hint: "Приберіть пробіли (strings.ReplaceAll), переведіть у нижній регістр і порівняйте рядок зі своїм Reverse. Не забудьте випадок порожнього рядка.",
      },
    ],
    starter: raw`package main

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

` + NOTE + raw`
var _ = fmt.Sprint
var _ = time.Second
var _ = sort.Strings
var _ = strings.Fields

// punct: символи, які прибираються з країв слів.
const punct = ".,!?;:\"'()«»—-"

// WordFreq рахує, скільки разів зустрілося кожне слово. TODO: реалізуйте.
func WordFreq(text string) map[string]int {
	return nil
}

// TopWords повертає n найчастіших слів (при рівності за алфавітом). TODO: реалізуйте.
func TopWords(text string, n int) []string {
	return nil
}

// IsAnagram перевіряє, чи складаються рядки з тих самих літер. TODO: реалізуйте.
func IsAnagram(a, b string) bool {
	return false
}

// Reverse перевертає рядок за символами (рунами). TODO: реалізуйте.
func Reverse(s string) string {
	return ""
}

// Capitalize робить кожне слово з великої літери. TODO: реалізуйте.
func Capitalize(s string) string {
	return ""
}

// IsPalindrome перевіряє, чи рядок читається однаково в обидва боки. TODO: реалізуйте.
func IsPalindrome(s string) bool {
	return false
}
`,
    harness: TEXT_HARNESS,
  },
  {
    id: "go-pipeline",
    lang: "go",
    lesson: "go/72",
    title: "Конвеєр обробки",
    xp: 90,
    context:
      "Горутини й канали дозволяють обробляти багато завдань одночасно: так працюють завантажувачі файлів, парсери, фонові обробники черг. Складність у тому, щоб нічого не втратити, вчасно закрити канали й не зависнути.",
    brief: [
      "Сервіс обробки даних має швидко опрацьовувати великі пакети чисел. Вам потрібно зібрати з деталей конвеєр: генератор подає числа в канал, стадія підносить їх до квадрата, кілька каналів зливаються в один, а пул працівників обробляє пакет паралельно.",
      "Запустимо вашу програму й перевіримо кожну вимогу R1–R9. Порядок завершення горутин не детермінований, тому результати пулу повертаються відсортованими. Кожну перевірку обмежено у часі: якщо ваш код завис (наприклад, канал не закрито), вимога буде позначена як не виконана, а не підвісить усю програму.",
    ],
    contract: [
      "<code>func Generate(nums ...int) &lt;-chan int</code>: відправляє числа по черзі й закриває канал. <code>func Square(in &lt;-chan int) &lt;-chan int</code>: читає, відправляє квадрати, закриває свій канал, коли закрито вхідний.",
      "<code>func Merge(chs ...&lt;-chan int) &lt;-chan int</code>: віддає значення з усіх каналів в один; закривається, коли закрито всі вхідні (без жодного каналу — одразу закритий).",
      "<code>func Process(nums []int, workers int) []int</code>: пул із <code>workers</code> горутин підносить числа до квадрата; повертає результати за зростанням, завжди не <code>nil</code>; <code>workers &lt; 1</code> рахується як 1; вхідний зріз не змінюється.",
      "<code>type Counter struct</code> із методами <code>Inc()</code> і <code>Value() int</code>, безпечними для одночасного використання з багатьох горутин. <code>func WithTimeout(ch &lt;-chan int, d time.Duration) (int, bool)</code>: чекає одне значення не довше за <code>d</code>; при тайм-ауті повертає <code>(0, false)</code>.",
      "Імпорти й рядки <code>var _ = …</code> у заготовці потрібні перевіркам, не видаляйте їх.",
    ],
    requirements: [
      {
        id: "R1",
        text: "<code>Generate(5, 6, 7)</code> віддає в канал 5, 6, 7 саме в такому порядку й закриває його; <code>Generate()</code> без чисел закриває канал одразу.",
        hint: "Створіть канал, у горутині відправте числа й закрийте його (defer close(out)), а канал поверніть одразу.",
      },
      {
        id: "R2",
        text: "<code>Square(Generate(2, 3, 4, -5))</code> віддає 4, 9, 16, 25 по порядку й закривається після закриття вхідного каналу.",
        hint: "У горутині: for n := range in { out &lt;- n * n }, а після циклу close(out).",
      },
      {
        id: "R3",
        text: "<code>Merge</code> із трьох каналів (1, 2, 3), (10, 20) і (100) віддає всі шість значень (порядок довільний) і закривається, коли закрито всі три.",
        hint: "Для кожного вхідного каналу запустіть горутину, що пересилає значення в спільний вихід; sync.WaitGroup рахує їх, а ще одна горутина після wg.Wait() закриває вихід.",
      },
      {
        id: "R4",
        text: "<code>Merge()</code> без каналів повертає одразу закритий канал; <code>Merge</code> із порожніх і одного непорожнього каналу віддає лише його значення <code>[7]</code> і закривається.",
        hint: "Якщо wg.Add не викликано, wg.Wait() повернеться одразу. Тож загальна схема з WaitGroup уже покриває цей випадок.",
      },
      {
        id: "R5",
        text: "<code>Process([]int{3, 1, 2, -4}, 3)</code> повертає <code>[1 4 9 16]</code>.",
        hint: "Запустіть workers горутин, що читають із каналу завдань і пишуть квадрати в канал результатів. Після збору відсортуйте sort.Ints.",
      },
      {
        id: "R6",
        text: "Працівників більше, ніж чисел (<code>Process([9 8 7], 10)</code> дає <code>[49 64 81]</code>); <code>workers</code> 0 і -3 працюють як 1; <code>Process(nil, 4)</code> повертає порожній не <code>nil</code> зріз; вхідний зріз не змінюється.",
        hint: "На початку: if workers &lt; 1 { workers = 1 }. Результат починайте з res := []int{}, а не з var res []int.",
      },
      {
        id: "R7",
        text: "Великий пакет: для чисел 1000, 999, …, 1 і 8 працівників <code>Process</code> повертає рівно 1000 квадратів за зростанням (1, 4, 9, …, 1000000): нічого не втрачено й не продубльовано.",
        hint: "Канал результатів закривайте лише після того, як усі працівники завершилися (wg.Wait() в окремій горутині), а читайте його циклом for range.",
      },
      {
        id: "R8",
        text: "<code>Counter</code>: після 100 горутин, кожна з яких викликає <code>Inc()</code> 1000 разів, <code>Value()</code> дорівнює <code>100000</code>.",
        hint: "Додайте до Counter поле sync.Mutex і захищайте ним і Inc, і Value (Lock/Unlock, defer Unlock). Методи мають бути з вказівником.",
      },
      {
        id: "R9",
        text: "<code>WithTimeout</code>: якщо значення вже є (канал із 7) — повертає <code>(7, true)</code>; для порожнього каналу з тайм-аутом 50 мс — <code>(0, false)</code> приблизно за 50 мс.",
        hint: "Використайте select із двома гілками: отримання з ch та &lt;-time.After(d).",
      },
    ],
    starter: raw`package main

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

` + NOTE + raw`
var _ = fmt.Sprint
var _ = time.Second
var _ = sort.Ints
var _ sync.WaitGroup

// Generate відправляє числа в канал і закриває його. TODO: реалізуйте.
func Generate(nums ...int) <-chan int {
	return nil
}

// Square підносить числа з in до квадрата. TODO: реалізуйте.
func Square(in <-chan int) <-chan int {
	return nil
}

// Merge зливає кілька каналів в один. TODO: реалізуйте.
func Merge(chs ...<-chan int) <-chan int {
	return nil
}

// Process обробляє числа пулом із workers горутин і повертає квадрати за зростанням. TODO: реалізуйте.
func Process(nums []int, workers int) []int {
	return nil
}

// Counter — лічильник, безпечний для багатьох горутин. TODO: додайте захист.
type Counter struct {
	n int
}

// Inc збільшує лічильник на 1. TODO: реалізуйте.
func (c *Counter) Inc() {
}

// Value повертає поточне значення. TODO: реалізуйте.
func (c *Counter) Value() int {
	return 0
}

// WithTimeout чекає одне значення з ch не довше за d. TODO: реалізуйте.
func WithTimeout(ch <-chan int, d time.Duration) (int, bool) {
	return 0, false
}
`,
    harness: PIPE_HARNESS,
  },
];
