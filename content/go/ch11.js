const BT = "`";

export const LESSONS_11 = [
  {
    t: "Шари: handler, service, repository",
    ch: "Архітектура",
    easy: "Шари — це як ресторан: офіціант (handler) приймає замовлення й не вміє готувати, кухар (service) знає рецепти й правила, комора (repository) знає лише, де що лежить. Кожен робить свою роботу й не лізе в чужу.",
    p: [
      "Поки сервіс складається з трьох обробників, увесь код легко тримати в голові: розібрати запит, сходити в мапу, записати відповідь. Але вже на десятому ендпоінті в одній функції змішуються три різні речі: протокол (статуси, заголовки, JSON), правила («заголовок не порожній», «ім'я унікальне») і доступ до даних (мапа, файл, SQL). Таку функцію не протестувати без HTTP, не повторно використати з консольної команди й страшно міняти: правка SQL ламає статуси, а нова вимога до статусів зачіпає SQL. Шари розв'язують це розділенням відповідальностей.",
      "Модель у голові: три шари, залежності йдуть тільки <b>вниз</b>. <b>Handler</b> (транспорт) розбирає запит, перетворює його на виклик сервісу й формує відповідь: статус, заголовки, JSON. <b>Service</b> (бізнес-логіка) містить правила й оркеструє роботу, але нічого не знає про <code>http.Request</code>. <b>Repository</b> (сховище) вміє зберегти й знайти дані, не знаючи ні про HTTP, ні про бізнес-правила. Потік запиту такий: клієнт, handler, service, repository, і назад у зворотному порядку. Якщо завтра замінити JSON на gRPC, зміниться лише верхній шар, а якщо мапу на PostgreSQL, то лише нижній.",
      "Окреме питання: якими типами шари обмінюються. Є <b>доменна модель</b> (те, чим оперує бізнес, наприклад <code>User</code> із хешем пароля й прапорцем адміна) і <b>DTO</b> (data transfer object) для зовнішнього світу: <code>createUserRequest</code> і <code>userResponse</code> з тегами <code>json</code>. Віддавати доменну структуру напряму в JSON небезпечно: наступне додане поле (<code>PasswordHash</code>) тихо потрапить у відповідь. А читати JSON просто в доменну структуру теж погано: клієнт надішле <code>\"admin\": true</code>, і ви отримаєте так звану mass assignment уразливість. DTO стають чітким контрактом, а перетворення між ними й доменом лежить в одному місці, у невеликих функціях <code>toResponse</code>.",
      "Помилки теж проходять крізь шари, і тут діє правило: кожен шар говорить своєю мовою. Репозиторій повертає доменну сентинел-помилку <code>ErrNotFound</code>, а не <code>sql.ErrNoRows</code> чи «key not found»: деталі сховища не повинні просочуватися вгору. Сервіс додає контекст через <code>fmt.Errorf(\"note %d: %w\", id, err)</code>, зберігаючи ланцюжок. Handler на самому верху перекладає помилку в статус через <code>errors.Is</code>: <code>ErrNotFound</code> дає 404, помилка валідації 400, усе невідоме 500. Для 500 клієнту віддають загальний текст, а справжню причину пишуть у лог: внутрішній текст помилки може розкрити структуру бази.",
      "Типові пастки. Перша: «товстий handler», що містить SQL і правила: шарів формально три, а розділення немає. Друга: service, який приймає <code>*http.Request</code> або повертає статус-код: він прив'язався до транспорту, і його вже не перевикористати. Третя: handler, що ходить у repository напряму повз service, бо «там же лише читання»; щойно з'явиться правило (наприклад, приховувати видалені записи), доведеться шукати всі такі місця. Четверта, зворотна: шари заради шарів. Для скрипта на п'ятдесят рядків три пакети це шум; шар виправдовується тоді, коли йому є що ховати.",
      "У реальному проєкті шари живуть у різних пакетах (<code>internal/handler</code>, <code>internal/service</code>, <code>internal/repo</code>), а імпорти спрямовані вниз. У нашому уроці все лежить в одному файлі <code>package main</code>, бо Playground не підтримує кілька файлів, але межі лишаються: ці три типи не звертаються до внутрішностей один одного поза своїми методами. Збирають шари конструкторами (<code>NewService(repo)</code>), де залежності передають аргументами. Як зробити ці залежності замінними й тестованими через інтерфейси, розглянемо в наступному уроці.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
)

type Note struct {
	ID    int
	Title string
}

type Repo struct{ data map[int]Note }

func (r *Repo) Find(id int) (Note, bool) {
	n, ok := r.data[id]
	return n, ok
}

type Service struct{ repo *Repo }

func (s *Service) Title(id int) (string, bool) {
	n, ok := s.repo.Find(id)
	return strings.ToUpper(n.Title), ok
}

type Handler struct{ svc *Service }

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		http.Error(w, "некоректний id", http.StatusBadRequest)
		return
	}
	title, ok := h.svc.Title(id)
	if !ok {
		http.Error(w, "не знайдено", http.StatusNotFound)
		return
	}
	fmt.Fprint(w, title)
}

func main() {
	repo := &Repo{data: map[int]Note{1: {1, "buy milk"}, 2: {2, "learn go"}}}
	h := &Handler{svc: &Service{repo: repo}}
	for _, url := range []string{"/note?id=1", "/note?id=7", "/note?id=x"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", url, nil))
		fmt.Println(rec.Code, strings.TrimSpace(rec.Body.String()))
	}
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	ID           int
	Email        string
	PasswordHash string
	IsAdmin      bool
}

type createUserRequest struct {
	Email    string ${BT}json:"email"${BT}
	Password string ${BT}json:"password"${BT}
}

type userResponse struct {
	ID    int    ${BT}json:"id"${BT}
	Email string ${BT}json:"email"${BT}
}

func toResponse(u User) userResponse {
	return userResponse{ID: u.ID, Email: u.Email}
}

func main() {
	var req createUserRequest
	body := "{\"email\":\"a@b.ua\",\"password\":\"qwerty\",\"is_admin\":true}"
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		fmt.Println(err)
		return
	}
	u := User{ID: 1, Email: req.Email, PasswordHash: "hash(" + req.Password + ")"}
	out, _ := json.Marshal(toResponse(u))
	fmt.Println(string(out))
	fmt.Println(u.IsAdmin, u.PasswordHash)
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

var (
	ErrNotFound = errors.New("not found")
	ErrInvalid  = errors.New("invalid")
)

type Repo struct{ data map[int]string }

func (r *Repo) Get(id int) (string, error) {
	v, ok := r.data[id]
	if !ok {
		return "", ErrNotFound
	}
	return v, nil
}

type Service struct{ repo *Repo }

func (s *Service) Get(id int) (string, error) {
	if id <= 0 {
		return "", fmt.Errorf("id %d: %w", id, ErrInvalid)
	}
	v, err := s.repo.Get(id)
	if err != nil {
		return "", fmt.Errorf("service get %d: %w", id, err)
	}
	return v, nil
}

func statusOf(err error) int {
	switch {
	case err == nil:
		return 200
	case errors.Is(err, ErrInvalid):
		return 400
	case errors.Is(err, ErrNotFound):
		return 404
	default:
		return 500
	}
}

func main() {
	svc := &Service{repo: &Repo{data: map[int]string{1: "перша"}}}
	for _, id := range []int{1, 5, -1} {
		_, err := svc.Get(id)
		fmt.Println(id, statusOf(err), err)
	}
}
`,
    ],
    note: "Залежності йдуть лише вниз: handler знає service, service знає repository. Кожен шар перекладає помилки на свою мову, а DTO відокремлюють зовнішній контракт від домену.",
    work: "Майже кожен бекенд на Go (і не тільки) має цю трійку під різними іменами: controller, usecase, store. Розділення дає змогу тестувати правила без HTTP і бази, а також міняти сховище (мапа, PostgreSQL, Redis) без переписування обробників. Код-рев'ю теж простішає: одразу видно, чи не просочилася робота з SQL у handler.",
    tasks: [
      "Чому репозиторій повертає власну <code>ErrNotFound</code>, а не помилку конкретної бази, і хто саме перетворює її на статус 404?",
      "Яку проблему створює пряме кодування доменної структури <code>User</code> у JSON-відповідь і як її розв'язують DTO?",
    ],
  },
  {
    t: "Залежності й інтерфейси",
    ch: "Архітектура",
    easy: "Залежність — це інструмент, який потрібен майстрові. Поганий майстер сам іде до магазину й купує конкретний дриль; хороший отримує інструмент на вході й не питає, чий він. Тоді в тесті можна дати йому іграшковий дриль.",
    p: [
      "Сервіс, який сам створює все, що йому потрібно (<code>sql.Open</code> у конструкторі, <code>http.Get</code> усередині методу, глобальна змінна <code>db</code>), приріс до конкретних реалізацій. Його не перевірити без справжньої бази й пошти, не запустити паралельно в тестах (глобальна змінна одна на всіх) і не підмінити, коли сховище зміниться. Залежності треба <b>отримувати ззовні</b>. Це і є ін'єкція залежностей, і в Go вона дуже проста: жодних контейнерів і рефлексії, лише аргументи конструктора.",
      "Конструкторна ін'єкція виглядає так: <code>func NewService(repo Repo, mail Notifier) *Service</code>. Конструктор зберігає отримане в полях структури, методи користуються полями. Сервіс не знає, чи за <code>Repo</code> стоїть мапа, PostgreSQL чи фейк. Усе, що йому потрібно, оголошено в сигнатурі конструктора, тож залежності видно відразу, а не ховаються в тілах методів. Якщо конструктор приймає п'ять-шість залежностей, це сигнал, що сервіс робить забагато.",
      "Головна ідіома Go: <b>інтерфейс оголошує той, хто його використовує</b>, а не той, хто реалізує. Оскільки реалізація неявна (тип просто має потрібні методи), пакет із <code>Service</code> може оголосити вузький <code>type Notifier interface { Notify(to, msg string) error }</code> лише з тим, що йому справді потрібно, і підійде будь-який тип із таким методом, навіть із чужого пакета. Звідси два правила: інтерфейси малі (один-три методи) і «приймай інтерфейси, повертай структури». Конструктор конкретного сховища повертає <code>*PostgresRepo</code>, а не інтерфейс. Інтерфейс «про всяк випадок» без другої реалізації й без фейка в тесті не потрібен.",
      "Де ж усе збирається? У <b>композиційному корені</b>, тобто в <code>main</code> (або функції <code>run</code>, яку <code>main</code> викликає). Це єдине місце, що знає всі конкретні типи: створює сховище, передає його в сервіс, сервіс у handler, handler у маршрутизатор. Решта коду бачить лише інтерфейси. Тому <code>main</code> може виглядати нудно й довго: це нормально, там немає логіки, лише проводка. Глобальні змінні для залежностей (<code>var db *sql.DB</code>, <code>var logger</code>) шкодять: зв'язок прихований, тести заважають один одному. Глобальними лишаються константи й сентинел-помилки.",
      "Така архітектура окупається в тестах. <b>Фейк</b> — це проста ручна реалізація інтерфейсу: структура, що записує виклики й за потреби повертає помилку. Він живе у файлі тесту й займає десять рядків; бібліотеки для моків зазвичай не потрібні. Те саме для недетермінованих речей: час віддають як інтерфейс <code>Clock</code> із методом <code>Now()</code>, і тест підставляє фіксований годинник. У Playground немає <code>_test.go</code>, тому ми перевіряємо вручну: таблиця випадків, цикл, вивід <code>ok</code> чи <code>FAIL</code>, але ідея та сама, що й у справжньому <code>go test</code>.",
      "Пастки. Якщо метод оголошено з вказівниковим отримувачем (<code>func (c *Console) Notify</code>), інтерфейс реалізує <code>*Console</code>, а не <code>Console</code>, і компілятор скаже «method Notify has pointer receiver». Щоб помилка вилазила при збірці, а не там, де сервіс уперше отримає тип, пишуть перевірку <code>var _ Notifier = (*Console)(nil)</code>. Також не робіть інтерфейси з десяти методів: фейк до них писати боляче, і це підказка, що інтерфейс надто широкий. Далі побудуємо повноцінне сховище, яке безпечно працює з багатьох горутин.",
    ],
    code: [
      String.raw`package main

import "fmt"

type Notifier interface {
	Notify(to, msg string) error
}

type SignupService struct {
	notifier Notifier
}

func NewSignupService(n Notifier) *SignupService {
	return &SignupService{notifier: n}
}

func (s *SignupService) Register(email string) error {
	return s.notifier.Notify(email, "Ласкаво просимо!")
}

type ConsoleNotifier struct{}

func (ConsoleNotifier) Notify(to, msg string) error {
	fmt.Printf("лист для %s: %s\n", to, msg)
	return nil
}

func main() {
	svc := NewSignupService(ConsoleNotifier{})
	if err := svc.Register("olena@example.com"); err != nil {
		fmt.Println("помилка:", err)
	}
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
	"strings"
)

var ErrBadEmail = errors.New("bad email")

type Notifier interface {
	Notify(to, msg string) error
}

type SignupService struct{ notifier Notifier }

func NewSignupService(n Notifier) *SignupService { return &SignupService{notifier: n} }

func (s *SignupService) Register(email string) error {
	if !strings.Contains(email, "@") {
		return fmt.Errorf("register %q: %w", email, ErrBadEmail)
	}
	if err := s.notifier.Notify(email, "welcome"); err != nil {
		return fmt.Errorf("register %q: %w", email, err)
	}
	return nil
}

type fakeNotifier struct {
	sent []string
	err  error
}

func (f *fakeNotifier) Notify(to, msg string) error {
	if f.err != nil {
		return f.err
	}
	f.sent = append(f.sent, to)
	return nil
}

func main() {
	smtpDown := errors.New("smtp down")
	tests := []struct {
		name     string
		email    string
		fakeErr  error
		wantErr  error
		wantSent int
	}{
		{"успіх", "a@b.ua", nil, nil, 1},
		{"поганий email", "abc", nil, ErrBadEmail, 0},
		{"пошта лежить", "a@b.ua", smtpDown, smtpDown, 0},
	}
	for _, tt := range tests {
		f := &fakeNotifier{err: tt.fakeErr}
		err := NewSignupService(f).Register(tt.email)
		if !errors.Is(err, tt.wantErr) || len(f.sent) != tt.wantSent {
			fmt.Println("FAIL -", tt.name, err, f.sent)
			continue
		}
		fmt.Println("ok   -", tt.name)
	}
}
`,
      String.raw`package main

import (
	"fmt"
	"io"
	"os"
	"time"
)

type Clock interface{ Now() time.Time }

type staticClock struct{ t time.Time }

func (c staticClock) Now() time.Time { return c.t }

type Store interface {
	Save(name string, at time.Time)
}

type logStore struct{ out io.Writer }

func (s logStore) Save(name string, at time.Time) {
	fmt.Fprintf(s.out, "збережено %s о %s\n", name, at.Format("15:04 02.01.2006"))
}

type Service struct {
	store Store
	clock Clock
}

func NewService(st Store, c Clock) *Service { return &Service{store: st, clock: c} }

func (s *Service) Add(name string) { s.store.Save(name, s.clock.Now()) }

func main() {
	clock := staticClock{time.Date(2026, 11, 19, 9, 30, 0, 0, time.UTC)}
	svc := NewService(logStore{os.Stdout}, clock)
	svc.Add("звіт")
	svc.Add("план")
}
`,
      String.raw`// не компілюється: Notify має вказівниковий отримувач, тож інтерфейс реалізує *ConsoleNotifier, а не ConsoleNotifier
package main

import "fmt"

type Notifier interface {
	Notify(to, msg string) error
}

type ConsoleNotifier struct{}

func (c *ConsoleNotifier) Notify(to, msg string) error {
	fmt.Println(to, msg)
	return nil
}

var _ Notifier = ConsoleNotifier{}

func main() {}
`,
    ],
    note: "Залежності приходять в конструктор, інтерфейс оголошує споживач (малий, з тим, що йому потрібно), а збирає все лише <code>main</code>. Жодних глобальних змінних для залежностей.",
    work: "Так влаштований практично будь-який підтримуваний Go-сервіс: <code>main</code> створює клієнт бази, сховище, сервіси й handler'и та з'єднує їх. Завдяки цьому тести швидкі (без бази й мережі), а заміна компонента (поштовий провайдер, кеш, джерело часу) означає нову реалізацію одного інтерфейсу та зміну одного рядка в <code>main</code>.",
    tasks: [
      "Чому інтерфейс у Go прийнято оголошувати в пакеті-споживачі, а не поруч із реалізацією, і чим це допомагає тестам?",
      "Чому не варто тримати <code>*sql.DB</code> чи логер у глобальній змінній, і де саме створюють такі залежності?",
    ],
  },
  {
    t: "In-memory сховище з sync",
    ch: "Архітектура",
    easy: "Сховище в пам'яті з мьютексом — це кімната з одним ключем на двері запису: щоб щось змінити, треба взяти ключ, а подивитися можуть одразу багато людей. І віддавати назовні краще фотокопію папки, а не оригінал.",
    p: [
      "Сховище в пам'яті на основі мапи корисне скрізь, де не потрібна постійність: прототип API, кеш, тестова реалізація репозиторію з минулого уроку. Але є підступ: HTTP-сервер обробляє кожен запит у власній горутині, тож ваше сховище читають і пишуть одночасно. Звичайна мапа цього не витримує: паралельний запис дає <code>fatal error: concurrent map writes</code>, і програма падає без можливості перехопити це через <code>recover</code>. Отже, доступ до мапи треба синхронізувати.",
      "Модель у голові: структура <code>Store</code> містить дані й мьютекс, який їх охороняє: <code>mu sync.RWMutex</code>, <code>items map[int]Item</code>, <code>next int</code>. Правило читається просто: мьютекс записують безпосередньо над полями, які він захищає, і торкаються цих полів лише під замком. Для запису беруть <code>mu.Lock()</code>, для читання <code>mu.RLock()</code>: читачів може бути багато одночасно, а письменник завжди сам. Розблокування пишуть через <code>defer mu.Unlock()</code> одразу після блокування, щоб ранній <code>return</code> не лишив замок закритим. Структуру з мьютексом не копіюють (<code>go vet</code> про це попередить), тому конструктор <code>NewStore()</code> повертає вказівник.",
      "Друге правило: <b>копії при віддачі</b>. Структура <code>Item</code> із полем <code>Tags []string</code> копіюється за значенням, але слайс усередині ділить той самий масив. Якщо <code>Get</code> віддасть <code>Item</code> як є, викликач зможе змінити <code>item.Tags[0]</code> уже без замка, і виникне гонка, а також зіпсується стан у сховищі. Тому слайси й мапи при віддачі (і при прийнятті) копіюють: <code>slices.Clone(s)</code> повертає незалежну копію зрізу, <code>maps.Clone(m)</code> копію мапи (обидві функції з Go 1.21). Просте значення на кшталт <code>int</code> чи <code>string</code> копіювати окремо не потрібно, воно вже копія.",
      "Генерація id. Лічильник <code>next</code> зростає під тим самим <code>Lock</code>, що й запис у мапу, тому два одночасні <code>Add</code> ніколи не отримають однаковий id: перевірка й вставка відбуваються як одна неподільна дія. Інша ідіома: порядок обходу мапи в Go випадковий, тож <code>List()</code> збирає значення у слайс і сортує його: <code>slices.SortFunc(out, func(a, b Item) int { return cmp.Compare(a.ID, b.ID) })</code>. Функція <code>cmp.Compare</code> повертає −1, 0 або 1, і саме таку функцію порівняння приймає <code>SortFunc</code>. Сортований вивід робить і API, і тести детермінованими.",
      "Перевірка гонок: запускайте тести й програму з прапорцем <code>-race</code> (<code>go test -race ./...</code>, <code>go run -race .</code>). Детектор гонок стежить за доступами до пам'яті під час виконання й друкує «WARNING: DATA RACE» зі стеками обох горутин. Він сповільнює програму в кілька разів, тому його вмикають у тестах і CI, а не в продакшні. Важливо: детектор ловить лише гонки, що справді відбулися під час запуску, тож тест має створювати конкурентне навантаження. Ще одна пастка: <code>sync.Mutex</code> не реентерабельний. Якщо метод під замком викликає інший метод, що знову бере той самий замок, настане deadlock. Для внутрішніх викликів роблять окремі методи без блокування, а зовнішні беруть замок один раз.",
      "<code>sync.Map</code> не заміна мапи з мьютексом, а інструмент для двох вузьких випадків: ключ записують один раз і потім багато читають (кеші) або різні горутини працюють із різними ключами. Вона нетипізована (ключі й значення <code>any</code>), має методи <code>Load</code>, <code>Store</code>, <code>LoadOrStore</code>, <code>Delete</code>, <code>Range</code>, а порядок <code>Range</code> не гарантований. У решті випадків <code>map</code> із <code>RWMutex</code> простіша, типобезпечна й дає змогу виконувати складні операції під одним замком. Далі в курсі сховище стає шаром репозиторію, а справжня база даних прийде тоді, коли in-memory вже не вистачає.",
    ],
    code: [
      String.raw`package main

import (
	"cmp"
	"fmt"
	"slices"
	"sync"
)

type Item struct {
	ID   int
	Name string
	Tags []string
}

type Store struct {
	mu    sync.RWMutex
	items map[int]Item
	next  int
}

func NewStore() *Store { return &Store{items: map[int]Item{}} }

func (s *Store) Add(name string, tags []string) Item {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.next++
	it := Item{ID: s.next, Name: name, Tags: slices.Clone(tags)}
	s.items[it.ID] = it
	return it
}

func (s *Store) Get(id int) (Item, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	it, ok := s.items[id]
	it.Tags = slices.Clone(it.Tags)
	return it, ok
}

func (s *Store) List() []Item {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Item, 0, len(s.items))
	for _, it := range s.items {
		it.Tags = slices.Clone(it.Tags)
		out = append(out, it)
	}
	slices.SortFunc(out, func(a, b Item) int { return cmp.Compare(a.ID, b.ID) })
	return out
}

func main() {
	s := NewStore()
	a := s.Add("чай", []string{"напій", "гарячий"})
	s.Add("кава", nil)
	got, _ := s.Get(a.ID)
	got.Tags[0] = "ЗМІНЕНО"
	again, _ := s.Get(a.ID)
	fmt.Println(again.Tags)
	for _, it := range s.List() {
		fmt.Println(it.ID, it.Name, it.Tags)
	}
}
`,
      String.raw`package main

import (
	"fmt"
	"maps"
	"slices"
	"sync"
)

type Visits struct {
	mu sync.RWMutex
	n  map[string]int
}

func (v *Visits) Hit(page string) {
	v.mu.Lock()
	v.n[page]++
	v.mu.Unlock()
}

func (v *Visits) Snapshot() map[string]int {
	v.mu.RLock()
	defer v.mu.RUnlock()
	return maps.Clone(v.n)
}

func main() {
	v := &Visits{n: map[string]int{}}
	pages := []string{"/", "/about", "/blog"}
	var wg sync.WaitGroup
	for i := range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			v.Hit(pages[i%3])
		}()
	}
	wg.Wait()
	snap := v.Snapshot()
	for _, page := range slices.Sorted(maps.Keys(snap)) {
		fmt.Println(page, snap[page])
	}
}
`,
      String.raw`package main

import (
	"fmt"
	"slices"
)

type Cart struct{ items []string }

func (c *Cart) Items() []string { return c.items }

func (c *Cart) ItemsCopy() []string { return slices.Clone(c.items) }

func main() {
	c := &Cart{items: []string{"a", "b"}}
	x := c.Items()
	x[0] = "ЗЛАМАНО"
	fmt.Println(c.items)
	y := c.ItemsCopy()
	y[1] = "ок"
	fmt.Println(c.items)
}
`,
      String.raw`package main

import (
	"fmt"
	"slices"
	"sync"
)

func main() {
	var ids sync.Map
	for _, name := range []string{"go", "rust", "go", "zig"} {
		_, loaded := ids.LoadOrStore(name, "id-"+name)
		fmt.Println(name, "уже було:", loaded)
	}
	ids.Delete("zig")
	var keys []string
	ids.Range(func(k, _ any) bool {
		keys = append(keys, k.(string))
		return true
	})
	slices.Sort(keys)
	for _, k := range keys {
		v, _ := ids.Load(k)
		fmt.Println(k, v)
	}
}
`,
    ],
    note: "Мьютекс охороняє поля поруч із собою: <code>Lock</code> для запису, <code>RLock</code> для читання, <code>defer Unlock</code> одразу. Слайси й мапи віддавайте копіями, порядок мапи сортуйте самі.",
    work: "Так виглядає тестова реалізація репозиторію, локальний кеш, лічильники відвідувань, реєстр сесій у пам'яті. Інколи in-memory сховище в продакшні й лишається: для даних, що можна втратити. Правило «охороняю поля мьютексом, віддаю копії» переходить без змін до будь-якої структури зі спільним станом.",
    tasks: [
      "Чому метод <code>Get</code>, що повертає структуру з полем-слайсом, має клонувати цей слайс, навіть якщо сама структура копіюється за значенням?",
      "Чому <code>List()</code> сортує результат, а не просто обходить мапу, і чому <code>go run -race</code> може не показати гонку на тривіальному тесті?",
    ],
  },
  {
    t: "Конфігурація: flag і змінні середовища",
    ch: "Архітектура",
    adv: true,
    easy: "Конфігурація — це ручки налаштувань на пральній машині: сама програма не змінюється, а адресу, тайм-аут чи режим налагодження крутять ззовні. Є заводські значення, є налаштування в оточенні, а найвищий пріоритет має те, що людина вказала просто зараз у командному рядку.",
    p: [
      "Одну й ту саму збірку запускають на ноутбуці, у тестовому стенді й у продакшні, і в кожному місці різні адреса, порт, тайм-аути, рівень логів, рядок підключення до бази. Зашивати ці значення в код означає перекомпільовувати програму для кожного середовища, а секрети опиняться в репозиторії. Методологія <b>12-factor</b> радить: конфігурацію тримати в оточенні, а не в коді, і давати змогу перекривати її з командного рядка. У Go для цього вистачає двох пакетів стандартної бібліотеки: <code>flag</code> і <code>os</code>.",
      "Модель у голові: один тип <code>Config</code> збирає всі налаштування, а функція <code>Load(args, lookup)</code> перетворює «сирі» джерела (аргументи командного рядка й оточення) на готовий <code>Config</code> або повертає помилку. Далі застосунок отримує <code>Config</code> як звичайну залежність (див. урок про ін'єкцію) і більше ніде не читає <code>os.Args</code> чи <code>os.Getenv</code>. Це дає два виграші: у тестах підставляють потрібний конфіг без зміни справжнього оточення, а всі налаштування видно в одному місці.",
      "Пакет <code>flag</code> має глобальний набір прапорців <code>flag.CommandLine</code>, який читає <code>os.Args</code> і при помилці викликає <code>os.Exit</code>. Це незручно для тестів, тому правильно створювати власний набір: <code>fs := flag.NewFlagSet(\"app\", flag.ContinueOnError)</code> і викликати <code>fs.Parse(args)</code> зі зрізу рядків. Режим <code>ContinueOnError</code> повертає помилку замість завершення програми, а <code>fs.SetOutput(io.Discard)</code> вимикає друк довідки в stderr. Прапорці оголошують методами <code>StringVar</code>, <code>IntVar</code>, <code>BoolVar</code>, <code>DurationVar</code>: перший аргумент вказує на поле конфігу, третій задає значення за замовчуванням. Після <code>Parse</code> <code>fs.Args()</code> дає позиційні аргументи.",
      "Змінні середовища читає <code>os.LookupEnv(key)</code>: вона повертає <code>(значення, ok)</code> і тим відрізняє «не задано» від «задано порожнім». <code>os.Getenv</code> цього не розрізняє. Щоб конфіг був тестованим, <code>Load</code> приймає не <code>os.LookupEnv</code> напряму, а параметр <code>lookup func(string) (string, bool)</code>: у <code>main</code> передають <code>os.LookupEnv</code>, а в тестах і прикладах функцію над звичайною мапою, без залежності від реального оточення. Значення оточення завжди рядки, тому їх перетворюють (<code>strconv.Atoi</code>, <code>ParseBool</code>, <code>time.ParseDuration</code>) і в разі помилки додають ім'я змінної: <code>fmt.Errorf(\"APP_TIMEOUT: %w\", err)</code>.",
      "Пріоритети: <b>прапорець &gt; змінна оточення &gt; значення за замовчуванням</b>. Найпростіший спосіб це реалізувати: спершу заповнити <code>Config</code> значеннями за замовчуванням, потім застосувати оточення, а потім передати <b>поточні</b> значення полів як дефолти до <code>flag</code>. Тоді те, що користувач не вказав прапорцем, лишається таким, яким воно було, а вказане перекриває все. Останній крок це валідація. Метод <code>Validate()</code> перевіряє значення (порожня адреса, від'ємний тайм-аут) і збирає всі помилки разом через <code>errors.Join</code>, щоб людина виправила їх за один раз.",
      "Пастки. Булевий прапорець не бере значення через пробіл: <code>-debug false</code> увімкне debug, а <code>false</code> стане позиційним аргументом; вимикають так: <code>-debug=false</code>. Розбір зупиняється на першому аргументі без дефіса. Секрети (паролі, токени) краще не передавати аргументами, бо їх видно в списку процесів; для них використовують оточення або файл. І не читайте оточення в глибині коду: помилка в конфігурації має спливати при старті, а не посеред обробки запиту. Далі в цій главі розглянемо роботу з базою даних через <code>database/sql</code>.",
    ],
    code: [
      String.raw`package main

import (
	"flag"
	"fmt"
	"io"
	"time"
)

type Config struct {
	Addr    string
	Timeout time.Duration
	Debug   bool
}

func parseFlags(args []string) (Config, []string, error) {
	cfg := Config{Addr: ":8080", Timeout: 5 * time.Second}
	fs := flag.NewFlagSet("app", flag.ContinueOnError)
	fs.SetOutput(io.Discard)
	fs.StringVar(&cfg.Addr, "addr", cfg.Addr, "адреса")
	fs.DurationVar(&cfg.Timeout, "timeout", cfg.Timeout, "тайм-аут")
	fs.BoolVar(&cfg.Debug, "debug", false, "режим налагодження")
	if err := fs.Parse(args); err != nil {
		return Config{}, nil, err
	}
	return cfg, fs.Args(), nil
}

func main() {
	for _, args := range [][]string{
		{"-addr", ":9000", "-debug"},
		{"-timeout", "abc"},
		{"-debug", "false"},
	} {
		cfg, rest, err := parseFlags(args)
		fmt.Printf("%+v %v %v\n", cfg, rest, err)
	}
}
`,
      String.raw`package main

import (
	"fmt"
	"strconv"
	"time"
)

type Config struct {
	Addr    string
	Timeout time.Duration
	Debug   bool
}

type lookupFunc func(string) (string, bool)

func fromEnv(cfg *Config, lookup lookupFunc) error {
	if v, ok := lookup("APP_ADDR"); ok {
		cfg.Addr = v
	}
	if v, ok := lookup("APP_TIMEOUT"); ok {
		d, err := time.ParseDuration(v)
		if err != nil {
			return fmt.Errorf("APP_TIMEOUT: %w", err)
		}
		cfg.Timeout = d
	}
	if v, ok := lookup("APP_DEBUG"); ok {
		b, err := strconv.ParseBool(v)
		if err != nil {
			return fmt.Errorf("APP_DEBUG: %w", err)
		}
		cfg.Debug = b
	}
	return nil
}

func mapLookup(m map[string]string) lookupFunc {
	return func(key string) (string, bool) {
		v, ok := m[key]
		return v, ok
	}
}

func main() {
	envs := []map[string]string{
		{},
		{"APP_ADDR": ":9000", "APP_TIMEOUT": "250ms", "APP_DEBUG": "true"},
		{"APP_TIMEOUT": "soon"},
		{"APP_ADDR": ""},
	}
	for _, env := range envs {
		cfg := Config{Addr: ":8080", Timeout: 5 * time.Second}
		err := fromEnv(&cfg, mapLookup(env))
		fmt.Printf("%+v %v\n", cfg, err)
	}
}
`,
      String.raw`package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"time"
)

type Config struct {
	Addr    string
	Timeout time.Duration
}

func (c Config) Validate() error {
	var errs []error
	if c.Addr == "" {
		errs = append(errs, errors.New("addr is empty"))
	}
	if c.Timeout <= 0 {
		errs = append(errs, errors.New("timeout must be positive"))
	}
	return errors.Join(errs...)
}

func Load(args []string, lookup func(string) (string, bool)) (Config, error) {
	cfg := Config{Addr: ":8080", Timeout: 5 * time.Second}
	if v, ok := lookup("APP_ADDR"); ok {
		cfg.Addr = v
	}
	fs := flag.NewFlagSet("app", flag.ContinueOnError)
	fs.SetOutput(io.Discard)
	fs.StringVar(&cfg.Addr, "addr", cfg.Addr, "")
	fs.DurationVar(&cfg.Timeout, "timeout", cfg.Timeout, "")
	if err := fs.Parse(args); err != nil {
		return Config{}, err
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func main() {
	env := func(m map[string]string) func(string) (string, bool) {
		return func(k string) (string, bool) { v, ok := m[k]; return v, ok }
	}
	cases := []struct {
		name string
		args []string
		env  map[string]string
	}{
		{"лише дефолти", nil, nil},
		{"оточення", nil, map[string]string{"APP_ADDR": ":9000"}},
		{"прапорець сильніший", []string{"-addr", ":7000"}, map[string]string{"APP_ADDR": ":9000"}},
		{"невалідне", []string{"-addr", "", "-timeout", "-1s"}, nil},
	}
	for _, c := range cases {
		cfg, err := Load(c.args, env(c.env))
		if err != nil {
			fmt.Printf("%s: помилки:\n%v\n", c.name, err)
			continue
		}
		fmt.Printf("%s: %+v\n", c.name, cfg)
	}
}
`,
      String.raw`// лише компіляція: читає справжні os.Args і оточення, тож вивід залежить від запуску
package main

import (
	"flag"
	"fmt"
	"os"
	"time"
)

func passed(name string) bool {
	found := false
	flag.Visit(func(f *flag.Flag) {
		if f.Name == name {
			found = true
		}
	})
	return found
}

func main() {
	addr := flag.String("addr", ":8080", "адреса")
	timeout := flag.Duration("timeout", 5*time.Second, "тайм-аут")
	flag.Parse()

	if v, ok := os.LookupEnv("APP_ADDR"); ok && !passed("addr") {
		*addr = v
	}
	fmt.Println(*addr, *timeout, flag.Args())
}
`,
    ],
    note: "Порядок джерел: значення за замовчуванням, потім оточення, потім прапорці. Для тестів беріть <code>flag.NewFlagSet</code> зі зрізом аргументів і <code>lookup</code>-функцію замість <code>os.LookupEnv</code>.",
    work: "У контейнерах і хмарі конфігурація майже завжди приходить зі змінних оточення (Docker, Kubernetes, systemd), а прапорці зручні локально й у CLI-утилітах. Єдиний <code>Config</code> із валідацією при старті дає швидку відмову з чітким повідомленням замість дивної поведінки посеред роботи. Бібліотеки на кшталт <code>envconfig</code> чи <code>viper</code> лише автоматизують ту саму схему.",
    tasks: [
      "Чому функція <code>Load</code> приймає параметр <code>lookup func(string) (string, bool)</code>, а не викликає <code>os.LookupEnv</code> напряму?",
      "Як реалізувати пріоритет «прапорець вищий за оточення, а оточення вище за значення за замовчуванням», не перевіряючи вручну, які прапорці були задані?",
    ],
  },
  {
    t: "database/sql: як це працює",
    ch: "Архітектура",
    adv: true,
    easy: "<code>database/sql</code> — це розетка зі стандартним гніздом: сам пакет знає, як користуватися електрикою (запити, транзакції, пул з'єднань), а конкретний драйвер це вилка під потрібну базу. Міняєте драйвер і майже не чіпаєте решту коду.",
    p: [
      "Майже кожному сервісу потрібна справжня база даних, а в Go роботу з реляційними базами стандартизує пакет <code>database/sql</code>. Він не вміє розмовляти з жодною базою: це шар над <b>драйверами</b>. Драйвер (SQLite, PostgreSQL, MySQL) окремий пакет, що реалізує інтерфейси з <code>database/sql/driver</code> і реєструє себе в <code>init()</code>. Тому драйвер підключають «порожнім» імпортом: <code>import _ \"modernc.org/sqlite\"</code>. Без цього імпорту <code>sql.Open</code> повідомить <i>unknown driver (forgotten import?)</i>: найчастіша помилка початківця (див. перший приклад).",
      "Центральний тип <code>*sql.DB</code> — це не одне з'єднання, а <b>пул з'єднань</b>, безпечний для використання з багатьох горутин. Його створюють один раз на програму (у композиційному корені, як залежність) і передають далі; відкривати й закривати <code>DB</code> на кожен запит неправильно. <code>sql.Open</code> лише готує пул і майже нічого не перевіряє, а реальну перевірку з'єднання робить <code>db.Ping()</code>. Пул налаштовують через <code>SetMaxOpenConns</code>, <code>SetMaxIdleConns</code> і <code>SetConnMaxLifetime</code>: без обмеження навантаження може відкрити більше з'єднань, ніж витримає база.",
      "Три основні операції. <code>Exec</code> виконує запит без рядків у відповіді (INSERT, UPDATE, DELETE) і повертає <code>sql.Result</code> з <code>LastInsertId()</code> та <code>RowsAffected()</code>. <code>QueryRow</code> очікує <b>один</b> рядок: результат одразу скануємо <code>.Scan(&amp;a, &amp;b)</code>, а якщо рядків немає, <code>Scan</code> повертає <code>sql.ErrNoRows</code>, яку перевіряють через <code>errors.Is</code> і зазвичай перетворюють на доменну <code>ErrNotFound</code>. <code>Query</code> повертає <code>*sql.Rows</code> для багатьох рядків. Цикл виглядає так: <code>defer rows.Close()</code>, <code>for rows.Next() { rows.Scan(...) }</code>, а після циклу <code>rows.Err()</code>. Незакритий <code>Rows</code> тримає з'єднання з пулу, тож пул поступово вичерпується, а <code>rows.Err()</code> показує помилку, яка обірвала ітерацію.",
      "<b>Плейсхолдери проти SQL-ін'єкцій.</b> Значення в запит передають окремими аргументами: <code>db.Query(\"... WHERE name = ?\", name)</code>. Драйвер надсилає текст запиту й значення окремо, тож база ніколи не сприйме значення як частину SQL. Склеювання рядків (<code>\"... WHERE name = '\" + name + \"'\"</code>) дозволяє вводу <code>x' OR '1'='1</code> змінити сенс запиту: це класична SQL-ін'єкція. Позначка плейсхолдера залежить від драйвера: <code>?</code> у SQLite і MySQL, <code>$1</code>, <code>$2</code> у PostgreSQL. Через плейсхолдер можна підставити лише <i>значення</i>, але не імена таблиць чи колонок; для них використовують перевірку за білим списком.",
      "<b>NULL.</b> У SQL колонка може не мати значення, а звичайні <code>string</code> чи <code>int</code> цього виразити не можуть: <code>Scan</code> поверне помилку. Для таких колонок використовують <code>sql.NullString</code>, <code>sql.NullInt64</code> (поле <code>Valid</code> каже, чи є значення) або вказівник <code>*string</code>, який лишається <code>nil</code>. <b>Транзакції:</b> <code>tx, err := db.BeginTx(ctx, nil)</code>, далі <code>defer tx.Rollback()</code> і <code>tx.Commit()</code> наприкінці. Rollback після успішного Commit нешкідливий (поверне <code>sql.ErrTxDone</code>), тож цей патерн гарантує відкат при будь-якому ранньому <code>return</code>. Усередині транзакції працюють лише через <code>tx</code>, а не через <code>db</code>, бо інакше запит піде в інше з'єднання. Для запитів із тайм-аутом є версії з контекстом: <code>QueryContext</code>, <code>ExecContext</code>.",
      "<b>Чому тут немає справжньої бази.</b> У Playground немає ні мережі, ні файлів, ні драйверів, тож є два способи показати <code>database/sql</code>: лише компіляція коду з <code>sql.Open(\"sqlite\", ...)</code> або власний мінімальний драйвер у пам'яті. Простіше було б перше, але воно нічого не запускає. Тому другий приклад містить крихітний драйвер на кількох фіксованих запитах: він показує живі <code>Exec</code>, <code>QueryRow</code>, <code>Scan</code>, NULL і відкат транзакції. Читати код драйвера не обов'язково, зверніть увагу лише на код у <code>main</code>: він ідентичний тому, що ви напишете з будь-якою справжньою базою. Наступний урок про логи й спостережуваність, потім проєкти.",
    ],
    code: [
      String.raw`package main

import (
	"database/sql"
	"fmt"
)

func main() {
	db, err := sql.Open("sqlite", "app.db")
	fmt.Println(db != nil, err)
	if db != nil {
		fmt.Println(db.Ping())
	}
}
`,
      String.raw`package main

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

func main() {
	sql.Register("memdb", drv{})
	db, err := sql.Open("memdb", "")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	res, _ := db.Exec("INSERT INTO users(name, email) VALUES(?, ?)", "Olena", "olena@example.com")
	id, _ := res.LastInsertId()
	fmt.Println("вставлено id:", id)
	db.Exec("INSERT INTO users(name, email) VALUES(?, ?)", "Taras", nil)

	var name string
	var email sql.NullString
	err = db.QueryRow("SELECT id, name, email FROM users WHERE id = ?", 2).Scan(&id, &name, &email)
	fmt.Println(id, name, email.Valid, err)

	err = db.QueryRow("SELECT id, name, email FROM users WHERE id = ?", 42).Scan(&id, &name, &email)
	fmt.Println(errors.Is(err, sql.ErrNoRows), err)

	tx, _ := db.Begin()
	tx.Exec("INSERT INTO users(name, email) VALUES(?, ?)", "Ghost", nil)
	tx.Rollback()

	rs, err := db.Query("SELECT id, name, email FROM users ORDER BY id")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer rs.Close()
	for rs.Next() {
		if err := rs.Scan(&id, &name, &email); err != nil {
			fmt.Println(err)
			return
		}
		if email.Valid {
			fmt.Println(id, name, email.String)
		} else {
			fmt.Println(id, name, "NULL")
		}
	}
	fmt.Println("rows.Err:", rs.Err())
}
`,
      String.raw`// лише компіляція: потрібен справжній драйвер і файл бази, у Playground їх немає
package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

func transfer(ctx context.Context, db *sql.DB, from, to int64, amount int) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, "UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, from); err != nil {
		return fmt.Errorf("списання: %w", err)
	}
	if _, err := tx.ExecContext(ctx, "UPDATE accounts SET balance = balance + ? WHERE id = ?", amount, to); err != nil {
		return fmt.Errorf("зарахування: %w", err)
	}
	return tx.Commit()
}

func main() {
	db, err := sql.Open("sqlite", "file:app.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	fmt.Println(transfer(ctx, db, 1, 2, 100))
}
`,
      String.raw`package main

import "fmt"

func main() {
	name := "x' OR '1'='1"

	bad := "SELECT id FROM users WHERE name = '" + name + "'"
	fmt.Println(bad)

	good := "SELECT id FROM users WHERE name = ?"
	fmt.Println(good, "| аргументи:", []any{name})
}
`,
    ],
    note: "<code>*sql.DB</code> це пул: створюйте один раз. Значення передавайте плейсхолдерами, а не склеюванням. <code>defer rows.Close()</code> і <code>rows.Err()</code> обов'язкові, а транзакція завжди починається з <code>defer tx.Rollback()</code>.",
    work: "Усі Go-сервіси з SQL-базою (PostgreSQL, MySQL, SQLite) працюють через цей пакет, безпосередньо або через обгортки sqlx, pgx і sqlc, що стоять на тій самій моделі. Правильний пул, закриті <code>Rows</code> та плейсхолдери відрізняють надійний сервіс від такого, що під навантаженням «вичерпує з'єднання» або вразливий до ін'єкцій.",
    tasks: [
      "Що станеться з пулом з'єднань, якщо забути <code>rows.Close()</code> після <code>db.Query</code>, і яку помилку перевіряють після циклу <code>for rows.Next()</code>?",
      "Чим плейсхолдер <code>?</code> принципово відрізняється від склеювання рядка із SQL і які значення через плейсхолдер підставити не можна?",
    ],
  },
  {
    t: "Структуровані логи й спостережуваність",
    ch: "Архітектура",
    adv: true,
    easy: "Спостережуваність — це приладова панель авто: логи розповідають, що саме сталося, метрики показують, скільки й наскільки швидко, а health-ендпоінти це лампочка «двигун працює». Без панелі проблему помічають лише тоді, коли машина стала.",
    p: [
      "Сервіс у продакшні ви не бачите: ні екрана, ні налагоджувача. Усе, що ви знаєте про його стан, це те, що він сам про себе повідомив. Спостережуваність (observability) складається з трьох опор: <b>логи</b> (що відбулося), <b>метрики</b> (скільки й як часто) і <b>трасування</b> (куди йшов конкретний запит між компонентами). Додатково потрібні <b>health-ендпоінти</b>, щоб оркестратор знав, чи живий процес і чи готовий він приймати трафік. Усе це легко додати на початку й дуже складно потім.",
      "<b>Структуровані логи.</b> Рядок на кшталт «user 7 created» зручний людині, але машині складно знайти всі записи для користувача 7. Структурований лог — це повідомлення з ключами й значеннями: <code>msg=\"user created\" id=7</code> (або JSON). Пакет <code>log/slog</code> (Go 1.21) робить саме це: <code>log.Info(\"user created\", \"id\", 7)</code>. Є рівні (<code>Debug</code>, <code>Info</code>, <code>Warn</code>, <code>Error</code>), за замовчуванням Debug відсікається. <code>NewTextHandler</code> друкує <code>key=value</code>, <code>NewJSONHandler</code> друкує JSON. <code>log.With(\"component\", \"users\")</code> повертає логер, що додає поле до кожного запису, а <code>slog.Group</code> групує поля. Для детермінованого виводу в навчальних прикладах ми прибираємо час через <code>ReplaceAttr</code>; у продакшні час потрібен.",
      "Модель у голові: логер це <b>залежність</b> (див. урок про ін'єкцію). Сервіс отримує <code>*slog.Logger</code> у конструкторі, а не користується глобальним. Щоб зв'язати всі записи одного запиту, використовують <b>request id</b>: middleware бере <code>X-Request-ID</code> із заголовка (або генерує новий), додає його у відповідь, створює <code>base.With(\"request_id\", id)</code> і кладе цей логер у <code>context</code> запиту. Будь-який шар нижче дістає логер із контексту й автоматично друкує той самий id. Тоді в логах можна знайти <i>всі</i> записи одного звернення. Ключ контексту завжди власного типу (<code>type ctxKey struct{}</code>), щоб не конфліктувати з чужими пакетами.",
      "<b>Метрики.</b> Найпростіші метрики це лічильники: кількість запитів, кількість помилок 5xx. У програмі, де лічильник змінюють багато горутин, вистачає <code>atomic.Int64</code> (методи <code>Add</code> і <code>Load</code>), який не потребує мьютекса. Щоб рахувати за статусом, middleware обгортає <code>ResponseWriter</code> у власну структуру, що запам'ятовує код у <code>WriteHeader</code>. Лічильники віддають текстом на <code>/metrics</code>: Prometheus уміє забирати формат <code>name value</code> рядок за рядком. Правила: метрика лише зростає (лічильник), а різноманітність міток (id користувача) не роблять мітками, бо кожне значення створює нову часову послідовність.",
      "<b>Health-ендпоінти.</b> Оркестратор (Kubernetes, балансувальник) перевіряє два питання. <code>/healthz</code> (liveness): «процес живий?» і відповідає <code>200</code>, поки він не завис; якщо ні, його перезапускають. <code>/readyz</code> (readiness): «готовий приймати трафік?»: 503, поки не встановлено з'єднання з базою або не завершився прогрів кешу, і 200 після цього. Прапорець готовності зручно тримати в <code>atomic.Bool</code>. Не змішуйте ці два: якщо liveness залежатиме від бази, проблема бази призведе до перезапуску всіх екземплярів.",
      "<b>Трасування</b> розширює ідею request id. Запит проходить кілька компонентів, а кожна ділянка роботи це <i>span</i> з власним id, ім'ям і посиланням на батьківський span; усі spans одного запиту мають спільний trace id. У справжніх системах цим займається OpenTelemetry, який також передає trace id у заголовках між сервісами, але механіка та сама: контекст несе поточний span, а новий span створюється від нього. Останній приклад показує цю ідею без бібліотек. Пастки: не логуйте паролі, токени й персональні дані; не логуйте помилку і тут, і вище по стеку (запис дублюється), а обробляйте її в одному місці; <code>slog</code> приймає пари «ключ, значення», тож непарна кількість аргументів дасть запис <code>!BADKEY</code>. Далі в курсі проєкти, де зібрано все пройдене.",
    ],
    code: [
      String.raw`package main

import (
	"io"
	"log/slog"
	"os"
)

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

func main() {
	log := newLogger(os.Stdout)
	log.Info("старт", "port", 8080)
	log.Debug("цього не буде видно")

	users := log.With("component", "users")
	users.Info("user created", "id", 7, "email", "a@b.ua")
	users.Warn("слабкий пароль", slog.Group("req", "ip", "10.0.0.1", "attempt", 3))
	users.Error("збій збереження", "err", io.ErrUnexpectedEOF)
}
`,
      String.raw`package main

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
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

func loggerFrom(ctx context.Context, def *slog.Logger) *slog.Logger {
	if l, ok := ctx.Value(ctxKey{}).(*slog.Logger); ok {
		return l
	}
	return def
}

func withRequestID(base *slog.Logger, next http.Handler) http.Handler {
	var seq atomic.Int64
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-ID")
		if id == "" {
			id = fmt.Sprintf("req-%d", seq.Add(1))
		}
		w.Header().Set("X-Request-ID", id)
		l := base.With("request_id", id)
		ctx := context.WithValue(r.Context(), ctxKey{}, l)
		l.Info("запит", "method", r.Method, "path", r.URL.Path)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func main() {
	base := newLogger(os.Stdout)
	hello := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		loggerFrom(r.Context(), base).Info("обробляю")
		fmt.Fprint(w, "hello")
	})
	h := withRequestID(base, hello)

	for _, id := range []string{"abc-1", ""} {
		req := httptest.NewRequest("GET", "/hello", nil)
		if id != "" {
			req.Header.Set("X-Request-ID", id)
		}
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		fmt.Println(rec.Code, rec.Header().Get("X-Request-ID"))
	}
}
`,
      String.raw`//go:debug httpmuxgo121=0
package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
)

type Metrics struct {
	requests atomic.Int64
	errors   atomic.Int64
	ready    atomic.Bool
}

type statusWriter struct {
	http.ResponseWriter
	code int
}

func (s *statusWriter) WriteHeader(code int) {
	s.code = code
	s.ResponseWriter.WriteHeader(code)
}

func (m *Metrics) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sw := &statusWriter{ResponseWriter: w, code: 200}
		next.ServeHTTP(sw, r)
		m.requests.Add(1)
		if sw.code >= 500 {
			m.errors.Add(1)
		}
	})
}

func (m *Metrics) Expose(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "requests_total %d\nerrors_total %d\n", m.requests.Load(), m.errors.Load())
}

func (m *Metrics) Ready(w http.ResponseWriter, r *http.Request) {
	if !m.ready.Load() {
		http.Error(w, "not ready", http.StatusServiceUnavailable)
		return
	}
	fmt.Fprint(w, "ready")
}

func main() {
	m := &Metrics{}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) { fmt.Fprint(w, "ok") })
	mux.HandleFunc("GET /readyz", m.Ready)
	mux.HandleFunc("GET /metrics", m.Expose)
	mux.HandleFunc("GET /boom", func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "boom", http.StatusInternalServerError)
	})
	h := m.Middleware(mux)

	call := func(path string) {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", path, nil))
		fmt.Printf("%s -> %d %q\n", path, rec.Code, rec.Body.String())
	}
	call("/healthz")
	call("/readyz")
	m.ready.Store(true)
	call("/readyz")
	call("/boom")
	call("/metrics")
}
`,
      String.raw`package main

import (
	"context"
	"fmt"
	"sync/atomic"
)

type spanKey struct{}

type Span struct {
	Trace, ID, Parent, Name string
}

var counter atomic.Int64

func StartSpan(ctx context.Context, name string) (context.Context, *Span) {
	s := &Span{ID: fmt.Sprintf("s%d", counter.Add(1)), Name: name}
	if p, ok := ctx.Value(spanKey{}).(*Span); ok {
		s.Trace, s.Parent = p.Trace, p.ID
	} else {
		s.Trace = "t1"
	}
	fmt.Printf("trace=%s span=%s parent=%q name=%s\n", s.Trace, s.ID, s.Parent, s.Name)
	return context.WithValue(ctx, spanKey{}, s), s
}

func repoFind(ctx context.Context) {
	_, span := StartSpan(ctx, "repo.find")
	_ = span
}

func serviceGet(ctx context.Context) {
	ctx, _ = StartSpan(ctx, "service.get")
	repoFind(ctx)
}

func main() {
	ctx, _ := StartSpan(context.Background(), "http GET /note")
	serviceGet(ctx)
}
`,
    ],
    note: "Логер це залежність, а не глобальна змінна. Request id кладіть у контекст разом із логером, лічильники робіть через <code>atomic</code>, а <code>/healthz</code> і <code>/readyz</code> не плутайте.",
    work: "Кожен сервіс у Kubernetes має liveness і readiness, метрики для Prometheus і структуровані JSON-логи, які збирає Loki, ELK чи хмарний лог. Коли користувач скаржиться «щось не працює», request id дає змогу за хвилину знайти весь шлях його запиту, а графіки помилок 5xx повідомляють про проблему раніше за користувачів.",
    tasks: [
      "Чим відрізняються liveness (<code>/healthz</code>) і readiness (<code>/readyz</code>) і чому не варто перевіряти базу даних у liveness?",
      "Навіщо кладуть у контекст запиту логер із полем <code>request_id</code>, і чому ключ контексту має власний тип?",
    ],
  },
];
