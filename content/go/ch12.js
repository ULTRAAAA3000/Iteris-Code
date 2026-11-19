const BT = "`";

export const LESSONS_12 = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Аналіз тексту схожий на підрахунок голосів: спершу розбиваємо бюлетені на окремі голоси (слова), потім рахуємо, потім складаємо рейтинг. А якщо в двох кандидатів порівну, треба наперед домовитися, хто стоїть вище, інакше рейтинг щоразу буде різний.",
    p: [
      "Це перший із підсумкових проєктних уроків. Тут немає нової синтаксичної теми: ми збираємо вже знайоме (рядки, руни, мапи, сортування, <code>bufio</code>) у невелику програму. Задача: прочитати текст і надрукувати звіт, у якому є кількість слів, кількість унікальних слів, топ-N найчастіших, найдовше слово й кількість речень. Звучить просто, але саме тут ховаються пастки, на яких спотикаються й досвідчені: регістр, розділові знаки, кирилиця й порядок виводу.",
      "Спершу розберіть задачу й домовтеся про правила, адже «слово» не є очевидним поняттям. Ми вважаємо словом послідовність літер, цифр і апострофа, а все інше (пробіли, коми, дужки, тире) роздільником. Регістр не важливий: «The» і «the» одне слово. Топ-N сортуємо за кількістю за спаданням, а за рівної кількості за алфавітом, бо мапа в Go обходиться у випадковому порядку, і без другого критерію звіт щоразу виглядатиме інакше. Найдовше слово міряємо в <b>рунах</b>, а не в байтах: «привіт» має 6 рун і 12 байтів, тож <code>len</code> дасть хибний результат. Записати такі домовленості до коду корисно: вони стають вашим тестом.",
      "Проєктування: розкладіть програму на маленькі функції, кожну з яких можна перевірити окремо. <code>Words(text) []string</code> розбиває й нормалізує, <code>Frequencies(words) map[string]int</code> рахує, <code>Top(freq, n) []WordCount</code> сортує, <code>Longest(words) string</code> шукає рекордсмена, <code>Sentences(text) int</code> лічить речення. Окремо стоїть читання: функція приймає <code>io.Reader</code>, а не рядок чи файл. Тоді в тесті ми передаємо <code>strings.NewReader</code>, а в реальній програмі <code>os.Stdin</code> чи відкритий файл, і код аналізу не змінюється. Це та сама ідея малих інтерфейсів, що й у главі про інтерфейси.",
      "Будуємо поетапно, і кожен крок можна запустити. Крок 1: розбиття на слова через <code>strings.FieldsFunc</code> з перевіркою <code>unicode.IsLetter</code>, <code>unicode.IsDigit</code> і апострофа. Крок 2: мапа частот і топ-N із <code>sort.Slice</code> та двома критеріями. Крок 3: найдовше слово та речення, потім склеювання в один звіт. Цей порядок «від ядра до оболонки» дає змогу весь час бачити працюючу програму. Якщо ж написати все одразу й запустити в кінці, помилку доведеться шукати в усьому коді.",
      "Типові помилки. Розбиття через <code>strings.Fields</code> лишає розділові знаки при словах: «cat,» і «cat» стають різними ключами. Порівняння слів без <code>strings.ToLower</code> розщеплює частоти. Сортування лише за кількістю робить порядок нестабільним: <code>sort.Slice</code> не гарантує стабільності, і два слова з однаковою частотою можуть помінятися місцями між запусками. Підрахунок довжини через <code>len</code> порушує кирилицю. Підрахунок речень через <code>strings.Count(text, \".\")</code> помилиться на «?!» і трикрапці; надійніше йти по рунах і рахувати речення в момент закінчення, якщо в ньому вже були літери.",
      "Як перевірити результат. Складіть невеликий текст, відповідь для якого ви можете порахувати вручну, і порівняйте вивід із очікуваним. Додайте граничні випадки: порожній текст, текст лише з розділових знаків, слова із цифрами й апострофами, два слова однакової довжини. У Playground немає файлів чи stdin, тому текст завжди береться з рядка через <code>strings.NewReader</code>, і це чудово: вивід детермінований, а тест не залежить від зовнішнього світу. Наступний проєкт розширить ідею до сервісу: ті самі шари, але вже з HTTP.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"strings"
	"unicode"
)

func Words(text string) []string {
	return strings.FieldsFunc(strings.ToLower(text), func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '\''
	})
}

func main() {
	text := "The cat, the DOG; it's 2 o'clock. Привіт, світ!"
	words := Words(text)
	fmt.Println(len(words), words)
	fmt.Println(strings.Fields(text))
}
`,
      String.raw`package main

import (
	"fmt"
	"sort"
	"strings"
	"unicode"
	"unicode/utf8"
)

type WordCount struct {
	Word  string
	Count int
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

func main() {
	words := Words("red blue red green blue red go go go go")
	fmt.Println(Top(Frequencies(words), 3))
	fmt.Println(Longest(words), Longest([]string{"привіт", "hello", "світ"}))
	fmt.Println(len("привіт"), utf8.RuneCountInString("привіт"))
}
`,
      String.raw`package main

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

type Report struct {
	Total, Unique, Sentences int
	Top                      []WordCount
	Longest                  string
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

func Analyze(r io.Reader, n int) Report {
	text := readAll(r)
	words := Words(text)
	freq := map[string]int{}
	rep := Report{Total: len(words), Sentences: Sentences(text)}
	for _, w := range words {
		freq[w]++
		if l, b := utf8.RuneCountInString(w), utf8.RuneCountInString(rep.Longest); l > b || (l == b && w < rep.Longest) {
			rep.Longest = w
		}
	}
	rep.Unique = len(freq)
	for w, c := range freq {
		rep.Top = append(rep.Top, WordCount{w, c})
	}
	sort.Slice(rep.Top, func(i, j int) bool {
		a, b := rep.Top[i], rep.Top[j]
		return a.Count > b.Count || (a.Count == b.Count && a.Word < b.Word)
	})
	if len(rep.Top) > n {
		rep.Top = rep.Top[:n]
	}
	return rep
}

func main() {
	cases := map[string]string{
		"empty":  "",
		"signs":  "?!... ,,,",
		"normal": "Go is fun. Is Go hard?\nNo, Go is simple!",
	}
	for _, name := range []string{"empty", "signs", "normal"} {
		rep := Analyze(strings.NewReader(cases[name]), 2)
		fmt.Printf("%s: %+v\n", name, rep)
	}
}
`,
    ],
    note: "Правила розбору (що таке слово, який регістр, як упорядкувати рівні) запишіть до коду й додайте до тесту. Без другого критерію сортування звіт виходить різним від запуску до запуску, а довжину слова міряйте в рунах.",
    work: "Так влаштовані підрахунок слів у пошукових індексах, перевірка плагіату, аналіз логів і «хмари слів». Функція, яка приймає <code>io.Reader</code>, однаково працює на рядку в тесті, файлі на диску й мережевому потоці, а детермінований порядок виводу робить звіт придатним для порівняння в автоматичних тестах.",
    tasks: [
      "Чому в топ-N потрібен другий критерій сортування за словом і що буде без нього?",
      "Чому <code>Analyze</code> приймає <code>io.Reader</code>, а не ім'я файлу чи рядок, і чим це допомагає в тесті?",
    ],
  },
  {
    t: "Проєкт: REST API нотаток",
    ch: "Проєкти",
    easy: "API нотаток це як шафа з підписаними комірками й черговий біля неї. Клієнт просить «покласти», «дати», «викинути» нотатку за номером, а черговий відповідає не лише змістом, а й чітким кодом: «зроблено», «такої немає», «ви просите дивне».",
    p: [
      "Тепер збираємо сервіс. Вимоги такі: нотатка має <code>id</code>, заголовок і текст. API вміє створити нотатку (<code>POST /notes</code>), показати список (<code>GET /notes</code>), показати одну (<code>GET /notes/{id}</code>), оновити (<code>PUT /notes/{id}</code>) і видалити (<code>DELETE /notes/{id}</code>). Дані живуть у пам'яті. Перш ніж писати код, випишіть таблицю «запит, відповідь, статус»: успіх створення це 201, успішне видалення 204, відсутня нотатка 404, поганий JSON або порожній заголовок 400, нечисловий id теж 400. Така таблиця й буде основою тестів.",
      "Проєктування за шарами з попередньої глави, але стисло, бо все лежить в одному файлі. <b>Store</b> зберігає нотатки в <code>map[int]Note</code>, а доступ до мапи захищає <code>sync.RWMutex</code>: читання (<code>Get</code>, <code>List</code>) беруть <code>RLock</code> і можуть іти паралельно, записи (<code>Create</code>, <code>Update</code>, <code>Delete</code>) беруть <code>Lock</code>. Кожен HTTP-запит виконується у своїй горутині, тож без м'ютекса звичайна мапа дала б data race. <b>API</b> містить обробники й нічого не знає про те, як улаштоване сховище. Валідація живе окремим методом <code>validate</code>, щоб її можна було перевірити без HTTP.",
      "Маршрутизація: з Go 1.22 <code>http.ServeMux</code> розуміє шаблони на кшталт <code>\"GET /notes/{id}\"</code>, а значення дістається через <code>r.PathValue(\"id\")</code>. Це завжди рядок, тож його треба розібрати через <code>strconv.Atoi</code> і відповісти 400 на сміття. Якщо шлях зареєстровано, а метод ні, мультиплексор сам відповість 405 і заголовком <code>Allow</code>. Нові шаблони вмикаються рядком <code>//go:debug httpmuxgo121=0</code> над <code>package main</code> (у модулі з <code>go 1.22</code> і новішим він зайвий, але нашим одинарним файлам потрібен), тому він є в усіх прикладах цього уроку.",
      "Поетапна збірка. Крок 1: тип <code>Note</code> із JSON-тегами й <code>Store</code> з м'ютексом, перевірений прямо з <code>main</code>. Крок 2: допоміжні <code>writeJSON</code> і <code>writeError</code>, щоб кожна відповідь мала <code>Content-Type</code>, статус і єдиний формат помилки <code>{\"error\":\"…\"}</code>. Крок 3: обробники по одному, кожен розбирає запит, викликає сховище й перекладає помилку на статус. Крок 4: маршрути в одному місці, <code>routes()</code>, що повертає <code>http.Handler</code>. Крок 5: тести через <code>httptest.NewRecorder</code>, що працюють без мережі. Порядок важливий: кожен крок запускається окремо, тож помилка завжди в останньому доданому шарі.",
      "Типові помилки. Спершу <code>w.WriteHeader(201)</code> і лише потім заголовки: заголовки після <code>WriteHeader</code> уже не діють, тому <code>Content-Type</code> ставте першим. Ігнорування помилки <code>Decode</code>: порожнє чи зламане тіло дає нульову структуру, яка тихо проходить далі. Читання мапи без блокування в одному з методів: програма працює на ноутбуці й падає з «concurrent map read and map write» на навантаженні. Повернення вмісту мапи в довільному порядку: список для клієнта має бути відсортований за <code>id</code>. І нарешті, віддавати <code>nil</code>-слайс у JSON: вийде <code>null</code> замість <code>[]</code>, клієнтам на JavaScript від цього боляче; створюйте слайс через <code>make</code>.",
      "Як перевірити. Допоміжна функція <code>do(handler, метод, шлях, тіло)</code> будує запит через <code>httptest.NewRequest</code>, виконує його й повертає код і тіло; далі тестова таблиця прогоняє сценарій «створити, прочитати, оновити, видалити, прочитати знову» й порівнює відповіді. Перевірте не лише щасливий шлях: неіснуючий id, нечисловий id, порожній заголовок, зламаний JSON, неправильний метод. Саме негативні випадки відрізняють справжній API від демонстрації. Для гонок використовуйте <code>go test -race</code> на своїй машині: Playground дає лише детермінований вивід, але на ваших серверах цей прапорець ловить пропущені блокування.",
    ],
    code: [
      String.raw`package main

import (
	"errors"
	"fmt"
	"sort"
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

func NewStore() *Store {
	return &Store{items: map[int]Note{}, next: 1}
}

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

func (s *Store) Delete(id int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.items[id]; !ok {
		return ErrNotFound
	}
	delete(s.items, id)
	return nil
}

func main() {
	s := NewStore()
	s.Create("Milk", "2 bottles")
	s.Create("Go", "finish project")
	fmt.Println(s.Get(2))
	fmt.Println(s.Get(9))
	fmt.Println(s.Delete(1), s.Delete(1))
	fmt.Println(s.List())
}
`,
      String.raw`//go:debug httpmuxgo121=0
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
)

type Note struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
}

var notes = map[int]Note{1: {1, "Milk"}}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func getNote(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}
	n, ok := notes[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, n)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /notes/{id}", getNote)
	for _, q := range [][2]string{
		{"GET", "/notes/1"},
		{"GET", "/notes/7"},
		{"GET", "/notes/abc"},
		{"POST", "/notes/1"},
		{"GET", "/other"},
	} {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest(q[0], q[1], nil))
		fmt.Printf("%s %s -> %d %s %q\n", q[0], q[1], rec.Code, rec.Header().Get("Allow"), strings.TrimSpace(rec.Body.String()))
	}
}
`,
      String.raw`//go:debug httpmuxgo121=0
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

func (s *Store) Update(id int, title, body string) (Note, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.items[id]; !ok {
		return Note{}, ErrNotFound
	}
	n := Note{ID: id, Title: title, Body: body}
	s.items[id] = n
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
	if len(in.Title) > 20 {
		return errors.New("title is too long")
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

func parseID(r *http.Request) (int, bool) {
	id, err := strconv.Atoi(r.PathValue("id"))
	return id, err == nil && id > 0
}

func decode(w http.ResponseWriter, r *http.Request) (input, bool) {
	var in input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return in, false
	}
	if err := in.validate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return in, false
	}
	return in, true
}

func (a *API) create(w http.ResponseWriter, r *http.Request) {
	if in, ok := decode(w, r); ok {
		writeJSON(w, http.StatusCreated, a.store.Create(in.Title, in.Body))
	}
}

func (a *API) list(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, a.store.List())
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	id, ok := parseID(r)
	if !ok {
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

func (a *API) update(w http.ResponseWriter, r *http.Request) {
	id, ok := parseID(r)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	in, ok := decode(w, r)
	if !ok {
		return
	}
	n, err := a.store.Update(id, in.Title, in.Body)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, n)
}

func (a *API) remove(w http.ResponseWriter, r *http.Request) {
	id, ok := parseID(r)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := a.store.Delete(id); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (a *API) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /notes", a.create)
	mux.HandleFunc("GET /notes", a.list)
	mux.HandleFunc("GET /notes/{id}", a.get)
	mux.HandleFunc("PUT /notes/{id}", a.update)
	mux.HandleFunc("DELETE /notes/{id}", a.remove)
	return mux
}

func do(h http.Handler, method, path, body string) (int, string) {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec.Code, strings.TrimSpace(rec.Body.String())
}

func main() {
	h := (&API{store: NewStore()}).routes()
	steps := []struct {
		method, path, body string
		code               int
		want               string
	}{
		{"POST", "/notes", ${BT}{"title":"Milk","body":"2 bottles"}${BT}, 201, ${BT}{"id":1,"title":"Milk","body":"2 bottles"}${BT}},
		{"POST", "/notes", ${BT}{"title":"  "}${BT}, 400, ${BT}{"error":"title is required"}${BT}},
		{"POST", "/notes", "{", 400, ${BT}{"error":"invalid json"}${BT}},
		{"PUT", "/notes/1", ${BT}{"title":"Bread"}${BT}, 200, ${BT}{"id":1,"title":"Bread","body":""}${BT}},
		{"GET", "/notes/1", "", 200, ${BT}{"id":1,"title":"Bread","body":""}${BT}},
		{"GET", "/notes/5", "", 404, ${BT}{"error":"not found"}${BT}},
		{"GET", "/notes/x", "", 400, ${BT}{"error":"invalid id"}${BT}},
		{"DELETE", "/notes/1", "", 204, ""},
		{"GET", "/notes", "", 200, "[]"},
	}
	for _, s := range steps {
		code, body := do(h, s.method, s.path, s.body)
		if code == s.code && body == s.want {
			fmt.Println("ok  ", s.method, s.path, code)
		} else {
			fmt.Println("FAIL", s.method, s.path, code, body)
		}
	}
}
`,
    ],
    note: "Статус-код це частина контракту. Заголовки виставляйте до <code>WriteHeader</code>, помилки <code>Decode</code> та <code>Atoi</code> обробляйте завжди, а кожен доступ до спільної мапи робіть під <code>RWMutex</code>: читання під <code>RLock</code>, запис під <code>Lock</code>.",
    work: "Такий каркас лежить в основі більшості внутрішніх сервісів: CRUD над ресурсом, єдиний формат помилок, тести через <code>httptest</code> без запуску сервера. Пам'ять легко замінити на базу даних, змінивши лише <code>Store</code>, а таблиця «запит, відповідь, статус» стає документацією для команди фронтенду.",
    tasks: [
      "Чому <code>Get</code> і <code>List</code> беруть <code>RLock</code>, а <code>Create</code> і <code>Delete</code> беруть <code>Lock</code>, і що станеться, якщо прибрати блокування?",
      "Який статус-код має отримати клієнт для створення, видалення, відсутньої нотатки й нечислового id? Що відповість мультиплексор на <code>POST /notes/1</code>?",
    ],
  },
  {
    t: "Проєкт: конкурентний обробник",
    ch: "Проєкти",
    easy: "Конкурентний обробник схожий на касу в магазині з обмеженою кількістю кас: покупців багато, кас три, а якщо в одного касира зламався апарат, керівник зупиняє решту й не пускає нових покупців. Чек кожному видають у порядку черги, хоч касири закінчують у різний час.",
    p: [
      "Задача: є список вхідних даних (URL, файли, рядки) і повільна функція, яку треба застосувати до кожного елемента. Послідовно це довго, а запустити горутину на кожен елемент теж погано: їх може бути мільйон. Потрібен обробник із чотирма властивостями: результати лежать <b>у порядку входу</b>, одночасно працює не більше N завдань, перша помилка <b>скасовує</b> решту роботи, а зовнішній <code>context</code> теж може скасувати все. Це робить знайомий вам пакет <code>golang.org/x/sync/errgroup</code>, а ми побудуємо його аналог із нуля, щоб зрозуміти, як він працює.",
      "Модель у голові: група (<code>Group</code>) містить <code>WaitGroup</code> для очікування, канал-семафор ємності N для обмеження паралелізму, похідний контекст із <code>cancel</code> і «першу помилку» під <code>sync.Once</code>. Метод <code>Go(f)</code> займає місце в семафорі (блокується, коли всі N зайняті), перевіряє, чи контекст ще живий, і лише тоді запускає горутину. Горутина виконує <code>f(ctx)</code>; якщо та повернула помилку, група один раз запам'ятовує її й викликає <code>cancel</code>. Метод <code>Wait()</code> чекає на всі горутини й повертає першу помилку. Робота з <code>sync.Once</code> гарантує, що перемагає саме перша помилка, а не остання.",
      "Порядок результатів розв'язується просто й без блокувань: заздалегідь створіть слайс результатів довжиною <code>len(in)</code> і нехай завдання з номером i пише лише в <code>out[i]</code>. Різні горутини торкаються різних елементів, тому гонки немає, а порядок гарантований за побудовою, незалежно від того, хто закінчив першим. Не збирайте результати з каналу в порядку надходження: вони прийдуть у довільному порядку, і доведеться сортувати. Це та сама ідея, що в worker pool із глави про конкурентність, але з індексами замість каналу результатів.",
      "Поетапна збірка. Крок 1: найпростіший паралельний <code>Map</code> без обмежень і без помилок, лише <code>WaitGroup</code> і запис за індексом. Крок 2: <code>Group</code> із першою помилкою й <code>cancel</code>. Крок 3: семафор для обмеження паралелізму та перевірка контексту перед запуском кожного завдання. Крок 4: узагальнений <code>Map[T, R any]</code>, що користується групою. Після кожного кроку програму можна запустити: так легко побачити, який саме шар щось зламав. Зверніть увагу на порядок у <code>Go</code>: спершу займаємо слот у семафорі й лише потім перевіряємо контекст, бо слот звільняється після завершення попереднього завдання, а це якраз і є момент, коли скасування вже могло статися.",
      "Типові помилки. Горутина, що ігнорує <code>ctx</code>, не зупиниться після скасування: довгі завдання мають час від часу перевіряти <code>ctx.Done()</code> або передавати контекст у виклики, які його розуміють. Запис у спільний слайс через <code>append</code> із кількох горутин це гонка, а запис за фіксованим індексом безпечний. Забутий <code>cancel</code> залишає контекст «висіти»: тому <code>Wait</code> завжди викликає його наприкінці. Перехоплення змінної циклу в замиканні: з Go 1.22 кожна ітерація має свій <code>i</code> та <code>v</code>, тож замикання безпечні, а в старих версіях потрібна була копія. Нарешті, семафор без <code>defer</code> для звільнення слота: паніка в завданні назавжди забирає місце.",
      "Як перевірити детерміновано, коли горутини недетерміновані? Не покладайтеся на час. Для «першої помилки» поставте ліміт 1: завдання йдуть по одному, і після помилки наступні не стартують, тож лічильник запущених завдань точний. Для обмеження паралелізму ведіть <code>atomic</code>-лічильник завдань «у польоті» й фіксуйте максимум: він не має перевищити N, а друкувати треба саме булеву перевірку, а не число, бо точний пік залежить від планувальника. Для скасування передайте вже скасований контекст і переконайтеся, що жодне завдання не стартувало. На своїй машині додайте <code>go test -race</code> і <code>goleak</code>, щоб упіймати гонки й витоки горутин.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"sync"
)

func MapUnbounded(in []int, f func(int) int) []int {
	out := make([]int, len(in))
	var wg sync.WaitGroup
	for i, v := range in {
		wg.Add(1)
		go func() {
			defer wg.Done()
			out[i] = f(v)
		}()
	}
	wg.Wait()
	return out
}

func main() {
	in := []int{1, 2, 3, 4, 5, 6}
	fmt.Println(MapUnbounded(in, func(x int) int { return x * x }))
}
`,
      String.raw`package main

import (
	"context"
	"errors"
	"fmt"
	"sync"
)

type Group struct {
	ctx    context.Context
	cancel context.CancelFunc
	wg     sync.WaitGroup
	once   sync.Once
	err    error
}

func WithContext(parent context.Context) (*Group, context.Context) {
	ctx, cancel := context.WithCancel(parent)
	return &Group{ctx: ctx, cancel: cancel}, ctx
}

func (g *Group) Go(f func(context.Context) error) {
	g.wg.Add(1)
	go func() {
		defer g.wg.Done()
		if err := f(g.ctx); err != nil {
			g.once.Do(func() {
				g.err = err
				g.cancel()
			})
		}
	}()
}

func (g *Group) Wait() error {
	g.wg.Wait()
	g.cancel()
	return g.err
}

func main() {
	g, _ := WithContext(context.Background())
	g.Go(func(ctx context.Context) error {
		return errors.New("disk full")
	})
	for i := 1; i <= 3; i++ {
		g.Go(func(ctx context.Context) error {
			<-ctx.Done()
			return fmt.Errorf("task %d stopped: %w", i, ctx.Err())
		})
	}
	err := g.Wait()
	fmt.Println(err)
	fmt.Println(errors.Is(err, context.Canceled))
}
`,
      String.raw`package main

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"
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
	enter := func() {
		n := running.Add(1)
		for {
			p := peak.Load()
			if n <= p || peak.CompareAndSwap(p, n) {
				break
			}
		}
	}
	words := []string{"go", "rust", "zig", "c", "java", "lua"}
	lens, err := Map(context.Background(), words, 2, func(ctx context.Context, w string) (int, error) {
		enter()
		defer running.Add(-1)
		return len(w), nil
	})
	fmt.Println(lens, err, peak.Load() <= 2)

	_, err = Map(context.Background(), []int{1, 2, 3, 4, 5}, 1, func(ctx context.Context, n int) (int, error) {
		started.Add(1)
		if n == 3 {
			return 0, errors.New("bad item 3")
		}
		return n, nil
	})
	fmt.Println(err, started.Load())
}
`,
    ],
    note: "Порядок результатів гарантує запис за індексом, а не збирання з каналу. Перша помилка один раз фіксується через <code>sync.Once</code> і скасовує контекст, а завдання самі мусять поважати <code>ctx</code>. Обмеження паралелізму це канал-семафор.",
    work: "Так працюють масові завантаження, генерація мініатюр, перевірка тисяч посилань і пакетні виклики зовнішніх API з лімітом. У виробничому коді зазвичай беруть <code>errgroup</code> із <code>SetLimit</code>, але розуміння, як він влаштований, допомагає знайти витоки горутин і правильно скасовувати роботу.",
    tasks: [
      "Чому запис <code>out[i] = r</code> з різних горутин безпечний, а <code>out = append(out, r)</code> ні, і як це дає потрібний порядок результатів?",
      "Чому в <code>Go</code> спершу займають слот семафора, а вже потім перевіряють контекст? Що станеться з завданнями після першої помилки?",
    ],
  },
  {
    t: "Проєкт: кеш із TTL і generics",
    ch: "Проєкти",
    adv: true,
    easy: "Кеш це холодильник на кухні: найчастіше потрібне лежить поруч, а в комору за ним ходити довго. У кожного продукту є термін придатності (TTL), а місця мало, тому коли холодильник повний, викидають те, чим давно не користувалися.",
    p: [
      "Кеш зберігає результати дорогих операцій (запит до бази, виклик чужого API, обчислення), щоб не повторювати їх. Але кеш, що ніколи не забуває, віддає застарілі дані й росте без меж. Тому в ньому два механізми: <b>TTL</b> (час життя запису; після нього запис вважається відсутнім) і <b>ємність</b> з витісненням (коли місця не лишилось, видаляємо найдавніше використаний запис, політика LRU). Додайте метрики <i>hit</i> і <i>miss</i>: без них неможливо знати, чи кеш узагалі допомагає.",
      "Проєктування. Кеш має бути типобезпечним, тому це generic-тип <code>Cache[K comparable, V any]</code>: ключем може бути будь-який порівнюваний тип (його вимагає мапа), значенням що завгодно. Найважливіше рішення: <b>годинник інжектується</b>. Замість <code>time.Now()</code> усередині кеш приймає <code>now func() time.Time</code>. У проді передаємо <code>time.Now</code>, а в тесті власний «фальшивий» годинник, який ми зсуваємо вручну. Тоді тест на TTL не спить і не залежить від швидкості машини, а вивід детермінований. Це той самий прийом, що й інжекція залежностей із глави про архітектуру, застосований до часу.",
      "Що вважати протермінованим. Запис дійсний, поки <code>now.Before(expires)</code>, тобто в момент <code>expires</code> він уже недійсний. Протермінований запис можна видаляти двома способами. <b>Ліниво</b>: під час <code>Get</code> виявили, що термін минув, видалили й повернули miss. <b>Активно</b>: окремий метод <code>Sweep</code> проходить по всіх записах і прибирає прострочені (його викликають за таймером у фоновій горутині). Лише лінивого видалення мало: запис, до якого ніхто не звертається, лежав би в пам'яті вічно. Лише активного теж мало: між проходами <code>Get</code> віддав би прострочене. Тому комбінують обидва.",
      "Конкурентність. Для простого кеша з TTL підходить <code>sync.RWMutex</code>: <code>Get</code> бере <code>RLock</code> і може йти паралельно, а <code>Set</code> і <code>Sweep</code> беруть <code>Lock</code>. Метрики тоді роблять через <code>atomic.Int64</code>, бо їх оновлюють під <code>RLock</code>. Та щойно з'являється LRU, <code>Get</code> починає <b>змінювати</b> структуру (переносить запис на початок списку), тож читання вже не читання, і потрібен звичайний <code>sync.Mutex</code>. Це чесний компроміс: ми платимо паралелізмом читань за політику витіснення. Продуктивні кеші (наприклад, ristretto) обходять це шардуванням, але це вже оптимізація.",
      "Поетапна збірка. Крок 1: <code>Cache</code> лише з мапою й TTL та фальшивим годинником. Крок 2: <code>RWMutex</code>, <code>Sweep</code>, лічильники hit/miss. Крок 3: ємність і LRU на основі <code>container/list</code> (двозв'язний список) і мапи <code>map[K]*list.Element</code>: мапа дає пошук за O(1), список дає порядок використання й видалення з кінця за O(1). Елементи списку мають тип <code>any</code>, тому зберігаємо в них вказівник на <code>entry[K, V]</code>, де є й ключ (його треба, щоб видалити запис із мапи при витісненні), і значення, і термін придатності.",
      "Типові помилки. Видалення з мапи під <code>RLock</code> це гонка, а видаляти можна лише під <code>Lock</code>. Забутий <code>Set</code> для наявного ключа: треба оновити значення й TTL і перенести запис на початок, а не додати дубль. Порівняння <code>now.After(expires)</code> замість <code>!now.Before(expires)</code> дає зайву мить життя запису. Ітерація по списку з видаленням: візьміть <code>Prev()</code> до видалення, бо після <code>Remove</code> зв'язки елемента обнуляються. Повернення нульового значення без прапорця <code>ok</code>: клієнт не відрізнить «немає» від «нуль». І головне: тест із <code>time.Sleep</code> повільний і нестабільний, тоді як фальшивий годинник робить його миттєвим і точним.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"time"
)

type fakeClock struct{ t time.Time }

func (f *fakeClock) Now() time.Time          { return f.t }
func (f *fakeClock) Advance(d time.Duration) { f.t = f.t.Add(d) }

type entry[V any] struct {
	value   V
	expires time.Time
}

type Cache[K comparable, V any] struct {
	items map[K]entry[V]
	now   func() time.Time
}

func New[K comparable, V any](now func() time.Time) *Cache[K, V] {
	return &Cache[K, V]{items: map[K]entry[V]{}, now: now}
}

func (c *Cache[K, V]) Set(key K, value V, ttl time.Duration) {
	c.items[key] = entry[V]{value: value, expires: c.now().Add(ttl)}
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	e, ok := c.items[key]
	if !ok || !c.now().Before(e.expires) {
		var zero V
		return zero, false
	}
	return e.value, true
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	c := New[string, int](clk.Now)
	c.Set("a", 1, 10*time.Second)
	fmt.Println(c.Get("a"))
	clk.Advance(9 * time.Second)
	fmt.Println(c.Get("a"))
	clk.Advance(time.Second)
	fmt.Println(c.Get("a"))
}
`,
      String.raw`package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type fakeClock struct{ t time.Time }

func (f *fakeClock) Now() time.Time          { return f.t }
func (f *fakeClock) Advance(d time.Duration) { f.t = f.t.Add(d) }

type entry[V any] struct {
	value   V
	expires time.Time
}

type Stats struct{ Hits, Misses int64 }

type Cache[K comparable, V any] struct {
	mu     sync.RWMutex
	items  map[K]entry[V]
	now    func() time.Time
	hits   atomic.Int64
	misses atomic.Int64
}

func New[K comparable, V any](now func() time.Time) *Cache[K, V] {
	return &Cache[K, V]{items: map[K]entry[V]{}, now: now}
}

func (c *Cache[K, V]) Set(key K, value V, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = entry[V]{value: value, expires: c.now().Add(ttl)}
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	e, ok := c.items[key]
	c.mu.RUnlock()
	if !ok || !c.now().Before(e.expires) {
		c.misses.Add(1)
		var zero V
		return zero, false
	}
	c.hits.Add(1)
	return e.value, true
}

func (c *Cache[K, V]) Sweep() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	now, removed := c.now(), 0
	for k, e := range c.items {
		if !now.Before(e.expires) {
			delete(c.items, k)
			removed++
		}
	}
	return removed
}

func (c *Cache[K, V]) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.items)
}

func (c *Cache[K, V]) Stats() Stats {
	return Stats{c.hits.Load(), c.misses.Load()}
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	c := New[int, string](clk.Now)
	c.Set(1, "short", 5*time.Second)
	c.Set(2, "long", time.Minute)
	c.Get(1)
	c.Get(3)
	clk.Advance(10 * time.Second)
	_, ok := c.Get(1)
	fmt.Println(ok, c.Len())
	fmt.Println(c.Sweep(), c.Len())
	fmt.Printf("%+v\n", c.Stats())
}
`,
      String.raw`package main

import (
	"container/list"
	"fmt"
	"sync"
	"time"
)

type entry[K comparable, V any] struct {
	key     K
	value   V
	expires time.Time
}

type Cache[K comparable, V any] struct {
	mu    sync.Mutex
	cap   int
	now   func() time.Time
	ll    *list.List
	items map[K]*list.Element
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
		return zero, false
	}
	e := el.Value.(*entry[K, V])
	if !c.now().Before(e.expires) {
		c.remove(el)
		return zero, false
	}
	c.ll.MoveToFront(el)
	return e.value, true
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

func main() {
	t0 := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)
	c := New[string, int](3, func() time.Time { return t0 })
	for i, k := range []string{"a", "b", "c"} {
		c.Set(k, i, time.Hour)
	}
	fmt.Println(c.Keys())
	c.Get("a")
	fmt.Println(c.Keys())
	c.Set("d", 3, time.Hour)
	fmt.Println(c.Keys())
	_, ok := c.Get("b")
	fmt.Println(ok)
}
`,
    ],
    note: "Час інжектуйте функцією <code>now func() time.Time</code>, а не викликайте <code>time.Now()</code> всередині, і тест на TTL стане миттєвим та точним. Протермінований запис недійсний уже в момент <code>expires</code>. Щойно <code>Get</code> переносить запис у списку LRU, він змінює дані й потребує <code>Mutex</code>.",
    work: "Кеші з TTL стоять перед базами й зовнішніми API, зберігають сесії, розв'язані DNS-імена, токени доступу й результати дорогих запитів. Метрики hit/miss показують, чи виправдовує кеш свою пам'ять, а інжектований годинник дає змогу перевіряти поведінку на «завтра» без очікування. У продакшні такі кеші беруть із бібліотек (<code>ristretto</code>, <code>bigcache</code>), але їхня логіка саме така.",
    tasks: [
      "Навіщо кешу інжектований годинник замість <code>time.Now()</code> і як це змінює тест, що перевіряє термін життя запису?",
      "Чому з LRU <code>Get</code> не можна виконувати під <code>RLock</code>, і чому для лінивого видалення прострочених записів недостатньо самого <code>Get</code>?",
    ],
  },
  {
    t: "Проєкт: rate limiter і підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Rate limiter схожий на турнікет у метро з жетонами: у скриньці є кілька жетонів, новий з'являється через рівні проміжки часу, а коли жетони скінчилися, треба почекати. Хто прийшов першим, може пройти одразу кількома, але довго «в запас» жетони не копляться.",
    p: [
      "Rate limiter обмежує, як часто клієнт може звертатися до сервісу. Без нього один скрипт-«сканер» або помилка в чужому циклі вичерпують ресурси сервера й шкодять усім. Найпоширеніший алгоритм називається <b>token bucket</b> («відро з жетонами»). Відро має ємність <code>burst</code>, і спочатку воно повне. Кожен запит забирає один жетон. Нові жетони додаються з постійною швидкістю (наприклад, один на секунду), але понад ємність не накопичуються. Якщо жетонів немає, запит відхиляють зі статусом 429 і підказкою, через скільки секунд повторити. Так клієнт може зробити короткий сплеск запитів, але в середньому не перевищує заданої швидкості.",
      "Модель у голові: лімітеру не потрібна горутина, що «підкидає» жетони. Достатньо запам'ятати, скільки жетонів було й коли ми востаннє їх рахували, а під час наступного запиту обчислити, скільки часу минуло і скільки жетонів за цей час мало з'явитися. Це <b>ліниве поповнення</b>. Щоб уникнути похибок із плаваючою комою, зручно зберігати не швидкість, а інтервал на один жетон (<code>time.Duration</code>) і рахувати цілу кількість нових жетонів діленням <code>now.Sub(last) / interval</code>. Коли відро знову повне, початок відліку скидаємо на «зараз», інакше простій накопичив би час «про запас». Усе це захищає <code>sync.Mutex</code>, бо запити приходять із різних горутин.",
      "Як і в кеші з попереднього уроку, годинник інжектується: лімітер приймає <code>now func() time.Time</code>. Тоді тест не спить і не залежить від швидкості машини. Фальшивий годинник зсуваємо вручну на 500 мс, на секунду, на десять секунд, і кожна відповідь «пропустив чи відхилив» передбачувана до крапки. Тест складається з таблиці кроків «на скільки зсунути час і що очікуємо». Він працює за мікросекунди й завжди дає той самий результат, тоді як тест із <code>time.Sleep</code> повільний і періодично падає на завантаженому сервері.",
      "Міддлвар. Лімітер сам по собі нічого не знає про HTTP. Обгортка <code>RateLimit(next)</code> визначає клієнта (за IP з <code>r.RemoteAddr</code> через <code>net.SplitHostPort</code>, за API-ключем чи користувачем), знаходить або створює для нього власний лімітер у мапі під м'ютексом, питає <code>Allow()</code> і за відмови пише <code>429 Too Many Requests</code> із заголовком <code>Retry-After</code>, а інакше викликає <code>next</code>. Те, що це звичайний <code>func(http.Handler) http.Handler</code>, дозволяє поєднувати його з іншими міддлварами з глави про мережу й тестувати через <code>httptest</code> разом з іншою обгорткою.",
      "Підводні камені. Мапа лімітерів росте разом з кількістю клієнтів: без прибирання давно не активних записів це витік пам'яті, а вирішити його можна тим самим TTL-кешем із попереднього уроку. IP за зворотним проксі однаковий для всіх, і тоді довіряти потрібно заголовку <code>X-Forwarded-For</code> лише від власного проксі, бо інакше клієнт підставить будь-яке значення. Лімітер у пам'яті одного процесу не діє між репліками: для кількох серверів лічильник тримають у Redis або на шлюзі. У виробничому коді зазвичай беруть <code>golang.org/x/time/rate</code>, але тепер ви знаєте, що всередині. І остання пастка: Retry-After округлюйте <b>вгору</b>, щоб клієнт не повернувся на мить раніше.",
      "Підсумок курсу. Ви пройшли дванадцять глав. «Початок» і «Основи мови» дали модулі, типи, керування й функції. «Колекції» навчили слайсів, мап і сортування, «Структури й вказівники» методів і композиції, «Інтерфейси та generics» абстракцій без успадкування. «Помилки» показали <code>error</code> як значення, обгортання й <code>defer</code>, а «Конкурентність» горутини, канали, <code>sync</code> і <code>context</code>. Стандартна бібліотека, тестування, мережа й архітектура склали вашу робочу скриньку, а проєкти цієї глави зібрали все докупи: аналіз тексту, REST API, паралельний обробник, кеш і лімітер.",
      "Що вчити далі. <b>gRPC</b> і Protocol Buffers: типізовані контракти між сервісами замість ручного JSON. <b>SQL і sqlc</b>: пишете запити на SQL, а інструмент генерує типобезпечний Go-код; додайте міграції й <code>pgx</code>. <b>Kubernetes і контейнери</b>: Dockerfile у кілька етапів, readiness і liveness із глави про спостережуваність, коректне завершення. <b>Профілювання</b>: <code>pprof</code>, <code>go tool trace</code>, бенчмарки з <code>benchstat</code>, щоб оптимізувати за вимірами, а не за відчуттями. <b>Документація</b>: коментарі для <code>go doc</code>, Example-тести, README. І <b>читання чужого коду</b>: стандартна бібліотека (<code>net/http</code>, <code>sync</code>, <code>bufio</code>), тести відомих проєктів, <code>go doc</code> для будь-якого пакета. Це найкращий спосіб дізнатися, як пишуть ті, хто пише добре. Бажаємо легкої роботи з Go.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
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

func (l *Limiter) Allow() bool {
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
		return false
	}
	l.tokens--
	return true
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	l := NewLimiter(time.Second, 3, clk.Now)
	for i := 0; i < 5; i++ {
		fmt.Print(l.Allow(), " ")
	}
	fmt.Println()
	clk.Advance(2 * time.Second)
	for i := 0; i < 3; i++ {
		fmt.Print(l.Allow(), " ")
	}
	fmt.Println()
}
`,
      String.raw`package main

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

func RateLimit(ls *Limiters, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ok, wait := ls.get(clientIP(r)).Allow()
		if !ok {
			secs := int((wait + time.Second - 1) / time.Second)
			w.Header().Set("Retry-After", strconv.Itoa(secs))
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	ls := &Limiters{byKey: map[string]*Limiter{}, make: func() *Limiter {
		return NewLimiter(time.Second, 2, clk.Now)
	}}
	h := RateLimit(ls, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	}))
	call := func(addr string) {
		req := httptest.NewRequest("GET", "/", nil)
		req.RemoteAddr = addr
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		fmt.Println(addr, rec.Code, rec.Header().Get("Retry-After"))
	}
	call("10.0.0.1:5000")
	call("10.0.0.1:5001")
	call("10.0.0.1:5002")
	call("10.0.0.2:6000")
	clk.Advance(time.Second)
	call("10.0.0.1:5003")
}
`,
      String.raw`package main

import (
	"fmt"
	"time"
)

type fakeClock struct{ t time.Time }

func (f *fakeClock) Now() time.Time          { return f.t }
func (f *fakeClock) Advance(d time.Duration) { f.t = f.t.Add(d) }

type Limiter struct {
	interval time.Duration
	burst    int
	tokens   int
	last     time.Time
	now      func() time.Time
}

func NewLimiter(interval time.Duration, burst int, now func() time.Time) *Limiter {
	return &Limiter{interval: interval, burst: burst, tokens: burst, last: now(), now: now}
}

func (l *Limiter) Allow() bool {
	now := l.now()
	if n := int(now.Sub(l.last) / l.interval); n > 0 {
		l.tokens = min(l.burst, l.tokens+n)
		l.last = l.last.Add(time.Duration(n) * l.interval)
	}
	if l.tokens == l.burst {
		l.last = now
	}
	if l.tokens == 0 {
		return false
	}
	l.tokens--
	return true
}

func main() {
	clk := &fakeClock{t: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	l := NewLimiter(time.Second, 2, clk.Now)
	steps := []struct {
		advance time.Duration
		want    bool
	}{
		{0, true},
		{0, true},
		{0, false},
		{500 * time.Millisecond, false},
		{500 * time.Millisecond, true},
		{0, false},
		{10 * time.Second, true},
		{0, true},
		{0, false},
	}
	failed := 0
	for i, s := range steps {
		clk.Advance(s.advance)
		if got := l.Allow(); got != s.want {
			fmt.Printf("FAIL step %d: got %v, want %v\n", i, got, s.want)
			failed++
		}
	}
	if failed == 0 {
		fmt.Println("ok: all", len(steps), "steps")
	}
}
`,
    ],
    note: "Token bucket поповнюється ліниво: зберігайте кількість жетонів і час останнього підрахунку, а не запускайте горутину. Годинник інжектуйте, <code>Retry-After</code> округлюйте вгору, а мапу лімітерів за клієнтами не забувайте прибирати, інакше вона росте безмежно.",
    work: "Rate limiter стоїть на API-шлюзах, у публічних API, формах входу (проти перебору паролів) і перед дорогими зовнішніми викликами, щоб не перевищити чужі квоти. У виробництві зазвичай беруть <code>golang.org/x/time/rate</code> або шлюз із Redis, але принцип той самий. Уміння писати детерміновані тести з інжектованим часом стане в пригоді в будь-якому коді, що залежить від годинника.",
    tasks: [
      "Чому token bucket не потребує окремої горутини для поповнення і яку роль грає поле <code>last</code>?",
      "Навіщо міддлвар дає <code>Retry-After</code> і чому його округлюють вгору? Яку проблему створює мапа лімітерів за клієнтами без прибирання?",
    ],
  },
];
