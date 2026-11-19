const BT = "`";

export const LESSONS_09 = [
  {
    t: "Пакети і структура проєкту",
    ch: "Тестування й якість",
    easy: "Пакет — це відділ великого магазину: у нього своя полиця, свій напис і свої правила. Що виставлено на вітрину (ім'я з великої літери), бачать усі покупці, а що лежить на складі (з малої), бачать лише працівники відділу. Файл go.mod — вивіска всього магазину, а import — перепустка до сусіднього відділу.",
    p: [
      "Програма на п'ятдесят рядків спокійно живе в одному файлі. Програма на п'ять тисяч уже ні: імена починають збігатися, будь-яка функція може торкнутися будь-чого, а зміна в одному місці ламає три інших. Пакети розв'язують саме цю проблему. Пакет — одиниця <b>компіляції</b>, <b>повторного використання</b> і <b>видимості</b> водночас. Він дає імені простір (<code>store.New</code> і <code>cache.New</code> не конфліктують) і кордон: усе, що ви не виставили назовні, можна змінювати, не питаючи нікого. Тому структура проєкту — це не естетика, а спосіб тримати зміни локальними. Про саму видимість за регістром ви вже чули в уроці про пакети й імпорти; тут ми дивимось на неї як на інструмент проєктування.",
      "Модель у голові така. <b>Пакет</b> — це всі файли <code>.go</code> в одній директорії, що починаються з однакового рядка <code>package name</code>. Файли пакета бачать приватні імена одне одного, ніби це один великий файл. <b>Модуль</b> — дерево пакетів із файлом <code>go.mod</code> у корені. У <code>go.mod</code> записано <i>шлях модуля</i> (<code>module example.com/myapp</code>) і версію Go. Шлях імпорту пакета — це шлях модуля плюс підкаталог: пакет у <code>internal/store</code> імпортується як <code>example.com/myapp/internal/store</code>. А от в коді ви звертаєтесь до нього за <b>іменем пакета</b>, тобто за рядком після <code>package</code>, зазвичай за останнім елементом шляху: <code>store.New()</code>. Створити модуль: <code>go mod init example.com/myapp</code>. У Go 1.24 в <code>go.mod</code> з'явилась директива <code>tool</code> для інструментів розробки (<code>go get -tool</code>, <code>go tool</code>), але для початку вам потрібні лише <code>module</code> і <code>go</code>.",
      "Видимість у Go задається <b>регістром першої літери</b>: <code>Server</code> експортується, <code>server</code> ні. Ніяких <code>public</code> чи <code>private</code>, ніяких <code>friend</code>: або видно всьому світу, або лише пакету. Це стосується типів, функцій, констант, змінних, полів структур і методів. Звідси ідіома: тип виставляє мінімум, а інваріанти охороняє конструктор. Якщо поле <code>items</code> приватне, ніхто ззовні не покладе в нього <code>nil</code>-мапу чи від'ємну кількість; пишуть <code>NewStore()</code>, який готує внутрішній стан. Експортуйте якомога менше: кожне експортоване ім'я — це обіцянка, яку потім важко порушити, бо від нього можуть залежати інші.",
      "Типова розкладка середнього проєкту виглядає так. Каталог <code>cmd/&lt;назва&gt;/</code> містить <code>main.go</code> для кожного виконуваного файлу: це <b>тонка</b> обгортка, що читає конфігурацію й збирає залежності. Каталог <code>internal/</code> тримає основний код. Особливість <code>internal</code> перевіряє сам компілятор: пакети в ньому можна імпортувати лише з коду, що лежить у батьківському каталозі від <code>internal</code> (тобто з вашого ж модуля), і ніхто ззовні не зможе залежати від ваших внутрішностей. Каталог <code>pkg/</code> позначає код, який ви свідомо пропонуєте іншим; у спільноті з ним сперечаються, і багато проєктів обходяться без нього. Головна порада: <b>не будуйте структуру наперед</b>. Маленький сервіс починають із <code>main.go</code> і кількох файлів у корені, а пакети виділяють, коли з'являється справжня межа відповідальності.",
      "Імена пакетів — окрема дисципліна. Пакет називають коротким іменником малими літерами, без підкреслень і без множини: <code>store</code>, <code>auth</code>, <code>slug</code>. Пакети <code>utils</code>, <code>common</code>, <code>helpers</code> нічого не кажуть про вміст і швидко стають смітником. Ім'я пакета читається разом із ім'ям у ньому: <code>store.New</code> звучить добре, а <code>store.NewStore</code> «заїкається» (так само <code>http.Server</code> замість <code>http.HTTPServer</code>). Пакет <code>main</code> особливий: він компілюється у виконуваний файл, повинен мати <code>func main()</code> і ніколи не імпортується іншими пакетами.",
      "Найпідступніша проблема структури — <b>цикл імпортів</b>. Якщо пакет <code>a</code> імпортує <code>b</code>, а <code>b</code> імпортує <code>a</code>, компілятор зупиняється з помилкою <code>import cycle not allowed</code>. Це не примха: циклічна залежність означає, що пакети неможливо зібрати й протестувати окремо. Є два способи розірвати цикл. Перший: винести спільне (типи, константи) у третій пакет, від якого залежать обидва. Другий: <b>інвертувати залежність</b>: пакет-споживач оголошує потрібний йому інтерфейс у собі, а інший пакет його реалізує, нічого не імпортуючи. Залежності мають текти в один бік: <code>cmd → internal/service → internal/store</code>.",
      "У Go Playground і в завданнях цього курсу є лише один файл <code>package main</code>, тому справжніх пакетів тут не буде. Ми покажемо структуру деревом і кодом із кількома пакетами (їх не можна запустити), а поруч дамо еквівалент в одному файлі, який запускається: усе лежить у <code>main</code>, а межі пакета позначені іменами й коментарями. Одне застереження: у єдиному пакеті приватні імена видно скрізь, тож правила експорту в Playground не перевірити, їх перевіряє лише справжній модуль. Далі в главі ми поговоримо про тести, які якраз і живуть поруч із пакетами.",
    ],
    code: [
      String.raw`myapp/
├── go.mod
├── cmd/
│   └── api/
│       └── main.go        // package main, тонка обгортка
├── internal/
│   ├── store/
│   │   └── store.go       // package store
│   └── auth/
│       └── auth.go        // package auth
└── pkg/
    └── slug/
        └── slug.go        // package slug (для чужого коду)

$ go mod init example.com/myapp
$ cat go.mod
module example.com/myapp

go 1.24

$ go build ./...
$ go run ./cmd/api
$ go vet ./...`,
      String.raw`// файл internal/store/store.go
package store

import "strings"

type Store struct {
	items map[string]int
}

func New() *Store {
	return &Store{items: make(map[string]int)}
}

func (s *Store) Put(key string, n int) {
	s.items[normalize(key)] = n
}

func (s *Store) Get(key string) (int, bool) {
	n, ok := s.items[normalize(key)]
	return n, ok
}

func normalize(key string) string {
	return strings.ToLower(strings.TrimSpace(key))
}

// файл cmd/api/main.go
package main

import (
	"fmt"

	"example.com/myapp/internal/store"
)

func main() {
	st := store.New()
	st.Put("  Apple ", 3)
	n, ok := st.Get("apple")
	fmt.Println(n, ok)
}

// store.normalize з main недоступна:
// cmd/api/main.go:9:46: name normalize not exported by package store
// пакети a і b, що імпортують одне одного:
// import cycle not allowed
// модуль example.com/other імпортує чужий internal:
// use of internal package example.com/myapp/internal/store not allowed`,
      String.raw`package main

import (
	"fmt"
	"strings"
)

type Store struct {
	items map[string]int
}

func NewStore() *Store {
	return &Store{items: make(map[string]int)}
}

func (s *Store) Put(key string, n int) {
	s.items[normalize(key)] = n
}

func (s *Store) Get(key string) (int, bool) {
	n, ok := s.items[normalize(key)]
	return n, ok
}

func normalize(key string) string {
	return strings.ToLower(strings.TrimSpace(key))
}

func main() {
	st := NewStore()
	st.Put("  Apple ", 3)
	n, ok := st.Get("apple")
	fmt.Println(n, ok)
	_, ok = st.Get("pear")
	fmt.Println(ok)
}`,
      String.raw`package main

import (
	"fmt"
	"unicode"
)

func isExported(name string) bool {
	for _, r := range name {
		return unicode.IsUpper(r)
	}
	return false
}

func main() {
	for _, n := range []string{"Server", "server", "_Hidden", "Ünit", "HTTPClient"} {
		fmt.Printf("%-10s експортується: %t\n", n, isExported(n))
	}
}`,
    ],
    note: "Пакет = каталог з однаковим package; експортується те, що починається з великої літери; <code>internal/</code> закритий для чужих модулів; цикл імпортів заборонений, тож залежності мають текти в один бік. Не створюйте структуру наперед і не називайте пакети <code>utils</code>.",
    work: "У реальних сервісах <code>cmd/&lt;app&gt;/main.go</code> лише збирає залежності й запускає програму, уся логіка лежить в <code>internal/</code>, а <code>go.mod</code> стає контрактом залежностей. На код-рев'ю регулярно питають: «навіщо це експортовано?» і «чому цей пакет імпортує той?». Структура з правильними межами дозволяє тестувати кожен пакет окремо.",
    tasks: [
      "Як компілятор Go визначає, чи ім'я експортується, і чому в мові немає ключових слів public і private?",
      "Пакети a і b імпортують один одного, і збірка падає. Назвіть два способи розірвати цикл і поясніть, чим вони відрізняються.",
    ],
  },
  {
    t: "Табличні тести",
    ch: "Тестування й якість",
    easy: "Табличний тест — це перелік контрольних питань і правильних відповідей, записаних у стовпчик. Ви один раз пишете «екзаменатора», який по черзі ставить кожне питання, а новий випадок додаєте одним рядком таблиці: без копіювання коду й без нового екзаменатора.",
    p: [
      "Тест — це виконуваний опис того, що має робити код. Без тестів кожна зміна стає лотереєю: ви правите функцію й не знаєте, що зламалось у трьох інших місцях. У Go тестування вбудоване в мову й інструменти: є пакет <code>testing</code> і команда <code>go test</code>, і більше нічого не потрібно. Фреймворків з «assert» немає за задумом: тест — це звичайна Go-функція, у якій ви порівнюєте результат із очікуваним звичайним <code>if</code> і повідомляєте про розбіжність. Читати такий тест так само просто, як і решту коду.",
      "Як це влаштовано. Тести лежать у файлах із суфіксом <code>_test.go</code> у тому ж каталозі, що й код. Звичайний збір (<code>go build</code>) їх ігнорує, а <code>go test</code> збирає окремий тестовий бінарник. Тест — функція виду <code>func TestXxx(t *testing.T)</code>: ім'я починається з <code>Test</code>, далі велика літера (<code>Testabs</code> не запуститься, а <code>TestAbs</code> запуститься). Файл може бути в тому ж пакеті (тоді тест бачить і приватне, це «білий ящик») або в пакеті з суфіксом <code>_test</code> (бачить лише експортоване, «чорний ящик»). Параметр <code>t</code> — контекст тесту: через нього повідомляють про провал, пишуть журнал і створюють підтести. Кожен тест виконується в окремій горутині.",
      "Як сказати про провал. <code>t.Errorf(...)</code> позначає тест проваленим, але <b>продовжує</b> виконання; <code>t.Fatalf(...)</code> дорівнює <code>Errorf</code> плюс негайна зупинка цього тесту (всередині це <code>runtime.Goexit</code>, тож відкладені виклики спрацюють). Правило вибору просте. Якщо подальші перевірки безглузді, бо без об'єкта немає що перевіряти (наприклад, конструктор повернув помилку), беріть <code>Fatalf</code>. Для порівняння значень беріть <code>Errorf</code>, щоб за один прогін побачити всі розбіжності, а не лише першу. Повідомлення в Go прийнято писати у вигляді <code>f(вхід) = отримано; want очікувалось</code>: так видно все потрібне без налагоджувача. І ще: не викликайте <code>t.Fatal</code> з іншої горутини, що ви запустили в тесті, це не зупинить тест, а лише ту горутину.",
      "Тепер про сам прийом. Побачивши, що ви пишете чотири майже однакові перевірки, зберіть вхідні дані в <b>таблицю</b>: зріз анонімних структур із полями <code>name</code> (назва випадку), входами і <code>want</code> (очікуване). Далі один цикл <code>for _, tt := range tests</code> викликає функцію й порівнює результат. Перевага у тому, що додавання випадку коштує один рядок, а помилка, знайдена в продакшені, потрапляє в таблицю як регресійний випадок і більше не повернеться непомітно. Для функцій із помилкою додайте поле <code>wantErr</code> і перевіряйте його через <code>errors.Is</code>. Змінна циклу від Go 1.22 своя на кожній ітерації, тож замикання й паралельні підтести всередині циклу безпечні (про них у наступному уроці).",
      "Що саме перевіряти. Тестуйте <b>поведінку</b>, а не реалізацію: тест, що ламається від рефакторингу без зміни поведінки, шкодить. Обов'язково охопіть межі: нуль, порожній рядок чи слайс, від'ємні числа, найбільше й найменше значення, невдалі шляхи з помилками. Складні значення порівнюйте не через <code>==</code> (слайси й мапи так не порівнюються), а через <code>slices.Equal</code>, <code>maps.Equal</code> або <code>reflect.DeepEqual</code>. Назви випадків робіть змістовними: коли щось впаде, ви побачите в звіті «від'ємне парне», а не «тест 4».",
      "Запуск. <code>go test ./...</code> проганяє весь модуль; <code>-v</code> показує кожен тест; <code>-run '^TestAbs$'</code> відбирає тести за регулярним виразом; <code>-count=1</code> вимикає кеш результатів; <code>-cover</code> показує покриття; <code>-race</code> вмикає детектор гонок; <code>-failfast</code> зупиняється на першому провалі. У Playground файл <code>_test.go</code> неможливий, тож тут ми пишемо той самий цикл «вручну» в <code>main</code> і виводимо <code>ok</code> або <code>FAIL</code>: вправа та сама, лише без запуску через <code>go test</code>. Також нагадаємо, що з Go 1.24 у <code>testing.T</code> є метод <code>t.Context()</code> (скасовується перед очищенням), але про нього пізніше.",
    ],
    code: [
      String.raw`package abs

import "testing"

func TestAbs(t *testing.T) {
	tests := []struct {
		name string
		in   int
		want int
	}{
		{"додатне", 5, 5},
		{"від'ємне", -5, 5},
		{"нуль", 0, 0},
	}
	for _, tt := range tests {
		got := Abs(tt.in)
		if got != tt.want {
			t.Errorf("%s: Abs(%d) = %d; want %d", tt.name, tt.in, got, tt.want)
		}
	}
}

func TestParse(t *testing.T) {
	cfg, err := Parse("a=1")
	if err != nil {
		t.Fatalf("Parse: %v", err)
	}
	if cfg.Count != 1 {
		t.Errorf("cfg.Count = %d; want 1", cfg.Count)
	}
}

$ go test ./...
$ go test -v -run '^TestAbs$' -count=1
$ go test -cover -race ./...`,
      String.raw`package main

import (
	"fmt"
	"runtime"
	"sync"
)

type T struct {
	name   string
	failed bool
}

func (t *T) Errorf(format string, args ...any) {
	t.failed = true
	fmt.Printf("    %s: %s\n", t.name, fmt.Sprintf(format, args...))
}

func (t *T) Fatalf(format string, args ...any) {
	t.Errorf(format, args...)
	runtime.Goexit()
}

func run(name string, fn func(t *T)) {
	t := &T{name: name}
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		fn(t)
	}()
	wg.Wait()
	status := "PASS"
	if t.failed {
		status = "FAIL"
	}
	fmt.Printf("--- %s: %s\n", status, name)
}

func Abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

func main() {
	run("TestErrorf", func(t *T) {
		t.Errorf("перша помилка")
		t.Errorf("друга помилка: видно обидві")
	})
	run("TestFatalf", func(t *T) {
		t.Fatalf("зупиняємось тут")
		t.Errorf("до цього рядка не дійдемо")
	})
	run("TestAbs", func(t *T) {
		if got := Abs(-3); got != 3 {
			t.Errorf("Abs(-3) = %d; want 3", got)
		}
	})
}`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrZero = errors.New("ділення на нуль")

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrZero
	}
	return a / b, nil
}

func main() {
	tests := []struct {
		name    string
		a, b    int
		want    int
		wantErr error
	}{
		{"націло", 10, 2, 5, nil},
		{"з остачею", 7, 2, 3, nil},
		{"від'ємне", -9, 3, -3, nil},
		{"нуль у знаменнику", 1, 0, 0, ErrZero},
	}
	failed := 0
	for _, tt := range tests {
		got, err := Divide(tt.a, tt.b)
		if !errors.Is(err, tt.wantErr) {
			fmt.Printf("FAIL %s: err = %v; want %v\n", tt.name, err, tt.wantErr)
			failed++
			continue
		}
		if got != tt.want {
			fmt.Printf("FAIL %s: Divide(%d, %d) = %d; want %d\n", tt.name, tt.a, tt.b, got, tt.want)
			failed++
			continue
		}
		fmt.Printf("ok   %s\n", tt.name)
	}
	fmt.Printf("провалено: %d з %d\n", failed, len(tests))
}`,
    ],
    note: "Тест — функція <code>TestXxx(t *testing.T)</code> у файлі <code>_test.go</code>. <code>Errorf</code> фіксує провал і йде далі, <code>Fatalf</code> зупиняє тест. Багато схожих перевірок збирайте в таблицю <code>[]struct{name, in, want}</code>, а кожну знайдену помилку додавайте рядком у таблицю.",
    work: "Табличні тести — стандарт у стандартній бібліотеці Go й у більшості компаній. Рецензент бачить у таблиці весь контракт функції одним поглядом, а CI запускає <code>go test -race ./...</code> на кожен пул-реквест. Баг із продакшену спершу відтворюють як новий рядок таблиці, і лише потім виправляють код.",
    tasks: [
      "Коли в тесті слід використовувати t.Fatalf, а коли t.Errorf, і чому повідомлення пишуть у вигляді «f(вхід) = got; want»?",
      "Чому тест із ім'ям Testabs не буде запущений командою go test, і які ще вимоги є до файлу й сигнатури тесту?",
    ],
  },
  {
    t: "Підтести, моки й інтерфейси",
    ch: "Тестування й якість",
    easy: "Підтест — це окремий пункт у великому екзамені: у нього своє ім'я, і його можна здати окремо. Мок (підробка) — це «манекен» замість справжнього партнера: щоб відпрацювати розмову з банком, вам не потрібен справжній банк, достатньо манекена, який відповідає заготовленими фразами й запам'ятовує, що йому сказали.",
    p: [
      "Хороший тест швидкий, детермінований й ізольований. Реальні залежності: мережа, пошта, база даних, годинник, випадкові числа, ламають усі три якості одразу. Тест, що надсилає справжній лист, повільний, залежить від сервера й падає в неділю вночі. Тому код проєктують так, щоб залежність можна було <b>підмінити</b> у тесті простішою підробкою. А щоб великий тест не перетворився на полотно з сорока перевірок, його ділять на <b>підтести</b>. Цей урок про обидва інструменти: <code>t.Run</code> і фейки через інтерфейси.",
      "Підтест створює метод <code>t.Run(name, func(t *testing.T) {...})</code>. Це тест усередині тесту з власним <code>t</code>: у звіті він називається <code>TestNotify/назва</code>, його можна запустити окремо командою <code>go test -run 'TestNotify/назва'</code>, а провал одного підтесту не зупиняє решту (<code>Fatalf</code> у підтесті зупиняє лише його). Пробіли в назві підтесту заміняються підкресленнями, тому в реальних тестах назви роблять без пробілів. Поєднання «таблиця випадків + <code>t.Run</code> для кожного» — стандарт: у звіті видно, <i>який саме</i> рядок таблиці провалився, і його можна перезапустити сам.",
      "Помічники в тестах мають три важливі методи. <code>t.Helper()</code> викликають першим рядком функції-помічника: тоді рядок провалу в звіті вказує на місце, де помічника <i>викликали</i>, а не на рядок усередині нього. <code>t.Cleanup(f)</code> реєструє функцію очищення: вона виконається після завершення тесту (і всіх його підтестів) у <b>зворотному порядку</b>, навіть якщо тест зупинив <code>Fatalf</code>. Для помічників вона краща за <code>defer</code>: <code>defer</code> спрацює при виході з самого помічника, тобто надто рано. <code>t.TempDir()</code> видає каталог, який Go сам видалить. У Go 1.24 додалися <code>t.Context()</code> (контекст, що скасовується перед очищенням) і <code>t.Chdir</code>.",
      "<code>t.Parallel()</code> у підтесті каже: «мене можна виконувати паралельно з іншими такими». Підтест призупиняється, поки батько не завершить послідовну частину, а далі всі паралельні підтести біжать разом (їхню кількість обмежує прапорець <code>-parallel</code>, за замовчуванням це <code>GOMAXPROCS</code>). До Go 1.22 для цього в циклі доводилось писати <code>tt := tt</code>, інакше всі підтести бачили б останній рядок таблиці. Тепер змінна циклу своя на кожній ітерації, і цей рядок не потрібен. Паралельні підтести не повинні ділити змінний стан без синхронізації, а запуск із <code>-race</code> швидко знайде забуті місця.",
      "Тепер про підробки. Інтерфейси в Go реалізуються <b>неявно</b>, тому той, хто <i>споживає</i> залежність, оголошує вузький інтерфейс сам: наприклад, <code>Sender</code> з одним методом <code>Send</code>. У продакшені підставляють справжню пошту, у тесті свій тип. Підробки бувають трьох видів. <b>Stub</b> просто повертає заготовлену відповідь. <b>Fake</b> простий, але робочий замінник (мапа в пам'яті замість бази). <b>Spy або mock</b> записує виклики, і після дії тест перевіряє, що саме відбулось. Бібліотеки генерації моків існують (gomock, mockery), але ручний мок на вісім рядків майже завжди достатній. Чим менше методів в інтерфейсі, тим легше мок; саме тому «малі інтерфейси» вважаються головною ідіомою Go. Годинник (<code>Now()</code>), генератор ідентифікаторів і джерело випадкових чисел так само виносять за інтерфейс.",
      "Пастки. Перша: інтерфейс оголошують там, де він <i>споживається</i>, а не там, де реалізований; інакше пакети зв'яжуться зайвими залежностями. Друга: мок із жорсткою перевіркою порядку й кількості кожного виклику робить тест <b>крихким</b>: він ламається від рефакторингу, хоча поведінка не змінилась. Перевіряйте результат і суттєві побічні ефекти, а не кожен внутрішній крок. Третя: метод із отримувачем-вказівником (<code>func (f *fake) Send</code>) належить лише типу <code>*fake</code>; значення <code>fake{}</code> інтерфейс не реалізує, і компілятор скаже <code>method Send has pointer receiver</code>. Закріпіть це перевіркою на етапі компіляції: <code>var _ Sender = (*fake)(nil)</code>. Четверта: фейки не замінюють інтеграційного тесту: хоча б один тест із справжньою залежністю все одно потрібен. У Playground ми симулюємо <code>testing.T</code> маленьким власним типом, щоб показати, як працюють <code>Run</code>, <code>Helper</code> і <code>Cleanup</code>.",
    ],
    code: [
      String.raw`package notify

import (
	"errors"
	"testing"
)

type fakeSender struct {
	sent   []string
	failOn string
}

func (f *fakeSender) Send(to, msg string) error {
	if to == f.failOn {
		return errors.New("fake: cannot send to " + to)
	}
	f.sent = append(f.sent, to+":"+msg)
	return nil
}

func newFake(t *testing.T, failOn string) *fakeSender {
	t.Helper()
	f := &fakeSender{failOn: failOn}
	t.Cleanup(func() { f.sent = nil })
	return f
}

func TestNotify(t *testing.T) {
	tests := []struct {
		name     string
		users    []string
		failOn   string
		wantSent int
		wantErr  bool
	}{
		{"all_ok", []string{"a", "b"}, "", 2, false},
		{"fail_on_second", []string{"a", "b", "c"}, "b", 1, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newFake(t, tt.failOn)
			n, err := Notify(f, tt.users, "hi")
			if (err != nil) != tt.wantErr {
				t.Fatalf("err = %v; wantErr %t", err, tt.wantErr)
			}
			if n != tt.wantSent {
				t.Errorf("sent = %d; want %d", n, tt.wantSent)
			}
		})
	}
}

$ go test -v -run 'TestNotify/fail_on_second'
$ go test -race -parallel 4 ./...`,
      String.raw`package main

import (
	"fmt"
	"time"
)

type Clock interface {
	Now() time.Time
}

type realClock struct{}

func (realClock) Now() time.Time {
	return time.Now()
}

type fixedClock struct {
	t time.Time
}

func (c fixedClock) Now() time.Time {
	return c.t
}

func Greeting(c Clock) string {
	h := c.Now().Hour()
	switch {
	case h < 6:
		return "Доброї ночі"
	case h < 12:
		return "Доброго ранку"
	case h < 18:
		return "Доброго дня"
	}
	return "Доброго вечора"
}

func main() {
	for _, h := range []int{3, 9, 15, 21} {
		c := fixedClock{time.Date(2026, 1, 2, h, 0, 0, 0, time.UTC)}
		fmt.Printf("%02d:00 %s\n", h, Greeting(c))
	}
}`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

type Mailer interface {
	Send(to, subject string) error
}

type mockMailer struct {
	calls []string
	err   error
}

func (m *mockMailer) Send(to, subject string) error {
	m.calls = append(m.calls, to+"|"+subject)
	return m.err
}

func Register(m Mailer, email string) error {
	if email == "" {
		return errors.New("порожній email")
	}
	if err := m.Send(email, "Вітаємо"); err != nil {
		return fmt.Errorf("лист не надіслано: %w", err)
	}
	return nil
}

type T struct {
	name     string
	failed   bool
	cleanups []func()
}

func (t *T) Helper() {}

func (t *T) Cleanup(f func()) {
	t.cleanups = append(t.cleanups, f)
}

func (t *T) Errorf(format string, args ...any) {
	t.failed = true
	fmt.Printf("    %s: %s\n", t.name, fmt.Sprintf(format, args...))
}

func (t *T) Run(name string, fn func(t *T)) {
	sub := &T{name: t.name + "/" + name}
	fn(sub)
	for i := len(sub.cleanups) - 1; i >= 0; i-- {
		sub.cleanups[i]()
	}
	status := "PASS"
	if sub.failed {
		status = "FAIL"
		t.failed = true
	}
	fmt.Printf("--- %s: %s\n", status, sub.name)
}

func assertCalls(t *T, m *mockMailer, want int) {
	t.Helper()
	if len(m.calls) != want {
		t.Errorf("викликів Send: %d; want %d", len(m.calls), want)
	}
}

func main() {
	root := &T{name: "TestRegister"}
	root.Run("успіх", func(t *T) {
		m := &mockMailer{}
		t.Cleanup(func() { fmt.Println("    cleanup: перший") })
		t.Cleanup(func() { fmt.Println("    cleanup: другий") })
		if err := Register(m, "a@x.io"); err != nil {
			t.Errorf("err = %v; want nil", err)
		}
		assertCalls(t, m, 1)
	})
	root.Run("збій пошти", func(t *T) {
		m := &mockMailer{err: errors.New("smtp down")}
		err := Register(m, "b@x.io")
		if !errors.Is(err, m.err) {
			t.Errorf("err = %v; want обгорнуту %v", err, m.err)
		}
		assertCalls(t, m, 1)
	})
	root.Run("порожній email", func(t *T) {
		m := &mockMailer{}
		if err := Register(m, ""); err == nil {
			t.Errorf("очікувалась помилка")
		}
		assertCalls(t, m, 0)
	})
}`,
      String.raw`// не компілюється: Send має отримувач-вказівник, тож значення fakeSender інтерфейс не реалізує
package main

import "fmt"

type Sender interface {
	Send(to string) error
}

type fakeSender struct {
	sent []string
}

func (f *fakeSender) Send(to string) error {
	f.sent = append(f.sent, to)
	return nil
}

var _ Sender = fakeSender{}

func main() {
	fmt.Println("сюди не дійдемо")
}`,
    ],
    note: "<code>t.Run</code> дає іменовані підтести, які можна запускати окремо; <code>t.Helper</code> виправляє рядок у звіті; <code>t.Cleanup</code> виконується в зворотному порядку. Залежність підміняйте <b>малим інтерфейсом</b>, оголошеним там, де його споживають, і фіксуйте реалізацію перевіркою <code>var _ I = (*T)(nil)</code>.",
    work: "У сервісах так тестують усе, що торкається зовнішнього світу: пошту, платежі, сховище, годинник. Ручний мок на кілька рядків читається краще за згенерований, а таблиця з <code>t.Run</code> дає в CI звіт, де одразу видно провалений випадок. Паралельні підтести з <code>-race</code> скорочують час прогону й заодно ловлять гонки.",
    tasks: [
      "Чим t.Cleanup кращий за defer усередині функції-помічника і в якому порядку виконуються кілька зареєстрованих очищень?",
      "Чому інтерфейс для мока варто оголошувати в пакеті-споживачі, і що означає помилка «method Send has pointer receiver»?",
    ],
  },
  {
    t: "Бенчмарки і профілювання",
    ch: "Тестування й якість",
    adv: true,
    easy: "Бенчмарк — це секундомір для коду: ви багато разів запускаєте одну дію й дивитесь, скільки часу й пам'яті вона з'їла. Профіль — це рентген: він показує, на якому саме рядку «пішов» час. Спершу міряємо, потім лікуємо; лікувати наосліп означає лікувати здорове.",
    p: [
      "Інтуїція щодо швидкодії підводить навіть досвідчених: «ця мапа точно повільніша за слайс», «конкатенація плюсом дорога», а на ділі виграш або програш виявляється зовсім в іншому місці. Тому золоте правило оптимізації: <b>спершу правильно, потім виміряно, потім швидко</b>. Без вимірювання ви не знаєте, чи оптимізація допомогла, і чи була проблема взагалі. Бенчмарк у Go — це тест, що вимірює час і пам'ять; він теж живе у файлі <code>_test.go</code> і запускається тією самою командою <code>go test</code>.",
      "Модель така. Бенчмарк — функція <code>func BenchmarkXxx(b *testing.B)</code>. Її тіло виконується <i>багато разів</i>: <code>go test</code> спершу запускає один прохід, потім збільшує число повторень <code>b.N</code> (1, 100, 10000…) доти, поки вимір не триватиме приблизно секунду (прапорець <code>-benchtime</code>; можна задати й точну кількість, наприклад <code>-benchtime=200x</code>). Класична форма: <code>for i := 0; i &lt; b.N; i++ { f() }</code>. У Go 1.24 з'явилась краща: <code>for b.Loop() { f() }</code>. Вона виконує налаштування перед циклом лише один раз, не рахує його у вимірі, а ще не дозволяє компілятору викинути виклик як «марний». Якщо ваш Go старший за 1.24, лишається <code>b.N</code>.",
      "Читаємо результат. Команда <code>go test -bench=. -benchmem -run=^$</code> (останній прапорець пропускає звичайні тести) друкує рядок на кшталт <code>BenchmarkConcat-8  1000000  1234 ns/op  2048 B/op  99 allocs/op</code>. Тут <code>-8</code> дорівнює <code>GOMAXPROCS</code>, далі кількість повторень, <code>ns/op</code> час на операцію, <code>B/op</code> байти пам'яті на операцію й <code>allocs/op</code> кількість виділень. Для оптимізації найкорисніше <b>виділення пам'яті</b>: їх число стабільне від запуску до запуску, а час «хитається» через інші процеси на машині. Для порівняння «було/стало» запускайте <code>-count=10</code> і віддайте вивід утиліті <code>benchstat</code>: вона скаже, чи різниця статистично значуща.",
      "Пастки бенчмарків. Перша: <b>оптимізатор викидає непотрібне</b>. Якщо результат виклику ніде не використаний, компілятор може прибрати весь виклик, і ви виміряєте нуль. Лікують присвоєнням у глобальну змінну (її зазвичай називають <code>sink</code>) або <code>b.Loop</code>. Друга: підготовка даних усередині циклу, що спотворює вимір; виносьте її перед циклом і викликайте <code>b.ResetTimer()</code> (<code>StopTimer</code> і <code>StartTimer</code> у циклі самі дорогі, їх уникайте). Третя: надто малий або незвично «зручний» вхід. Бенчмарк на трьох елементах нічого не скаже про мільйон. Четверта: порівняння результатів із різних машин чи при різному навантаженні. Мікробенчмарк показує лише вузьке місце, а не швидкість усієї програми.",
      "Бенчмарк відповідає на питання «наскільки повільно», а <b>профілювання</b> на питання «чому». Команда <code>go test -bench=. -cpuprofile cpu.out -memprofile mem.out</code> зберігає профілі, а <code>go tool pprof -http=:8080 cpu.out</code> відкриває інтерфейс із діаграмою (flame graph). В інтерактивному режимі <code>pprof</code> корисні команди <code>top</code> (найгарячіші функції), <code>list ІмяФункції</code> (час по рядках) і <code>web</code>. Розрізняйте <code>flat</code> (час у самій функції) та <code>cum</code> (разом із викликаними). У працюючому сервісі профіль знімають через пакет <code>net/http/pprof</code>. Цикл оптимізації завжди один: виміряв, подивився профіль, змінив <b>одну</b> річ, виміряв знову.",
      "Найчастіші виграші прості. Заздалегідь виділяйте ємність: <code>make([]T, 0, n)</code> замість нескінченного <code>append</code>, що щоразу перевиділяє масив. Збирайте рядки через <code>strings.Builder</code> із <code>Grow</code>, а не через <code>+=</code>. Уникайте зайвих перетворень <code>[]byte</code> та <code>string</code>. Використовуйте <code>sync.Pool</code> лише там, де профіль доводить користь. У Playground вимірювати час на сервері не варто, зате можна довести <b>властивість</b> через <code>testing.Benchmark</code>: ця функція запускає бенчмарк прямо з <code>main</code> й повертає <code>BenchmarkResult</code> з полями <code>N</code>, <code>AllocsPerOp()</code> та іншими. Викличте <code>testing.Init()</code> і <code>flag.Set(\"test.benchtime\", \"200x\")</code>, щоб кількість повторень була фіксованою, і друкуйте лише перевірки на кшталт «Builder робить менше виділень». Самі наносекунди у виводі нестабільні, а кількість виділень стабільна.",
    ],
    code: [
      String.raw`package concat

import (
	"strings"
	"testing"
)

var sink string

func BenchmarkPlus(b *testing.B) {
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		s := ""
		for j := 0; j < 100; j++ {
			s += "x"
		}
		sink = s
	}
}

func BenchmarkBuilder(b *testing.B) {
	for b.Loop() {
		var sb strings.Builder
		sb.Grow(100)
		for j := 0; j < 100; j++ {
			sb.WriteByte('x')
		}
		sink = sb.String()
	}
}

$ go test -bench=. -benchmem -run='^$'
BenchmarkPlus-8      ...   ns/op   5050 B/op   99 allocs/op
BenchmarkBuilder-8   ...   ns/op    112 B/op    1 allocs/op`,
      String.raw`package main

import (
	"flag"
	"fmt"
	"strings"
	"testing"
)

var sink string

func joinPlus(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += "x"
	}
	return s
}

func joinBuilder(n int) string {
	var b strings.Builder
	b.Grow(n)
	for i := 0; i < n; i++ {
		b.WriteByte('x')
	}
	return b.String()
}

func bench(f func() string) testing.BenchmarkResult {
	return testing.Benchmark(func(b *testing.B) {
		b.ReportAllocs()
		for i := 0; i < b.N; i++ {
			sink = f()
		}
	})
}

func main() {
	testing.Init()
	flag.Set("test.benchtime", "200x")
	plus := bench(func() string { return joinPlus(100) })
	builder := bench(func() string { return joinBuilder(100) })
	fmt.Println("N дорівнює benchtime:", plus.N == 200 && builder.N == 200)
	fmt.Println("Builder робить менше виділень:", builder.AllocsPerOp() < plus.AllocsPerOp())
	fmt.Println("Builder: одне виділення:", builder.AllocsPerOp() == 1)
	fmt.Println("плюс: виділення на кожне склеювання:", plus.AllocsPerOp() >= 90)
}`,
      String.raw`package main

import (
	"flag"
	"fmt"
	"testing"
)

var sink []int

func collect(n int) []int {
	var out []int
	for i := 0; i < n; i++ {
		out = append(out, i)
	}
	return out
}

func collectCap(n int) []int {
	out := make([]int, 0, n)
	for i := 0; i < n; i++ {
		out = append(out, i)
	}
	return out
}

func allocs(f func(int) []int) int64 {
	r := testing.Benchmark(func(b *testing.B) {
		b.ReportAllocs()
		for b.Loop() {
			sink = f(1000)
		}
	})
	return r.AllocsPerOp()
}

func main() {
	testing.Init()
	flag.Set("test.benchtime", "100x")
	grow, fixed := allocs(collect), allocs(collectCap)
	fmt.Println("append без ємності перевиділяє масив:", grow > 5)
	fmt.Println("make з ємністю: одне виділення:", fixed == 1)
	fmt.Println("результати однакові:", len(collect(1000)) == len(collectCap(1000)))
}`,
      String.raw`$ go test -bench=Builder -benchmem -count=10 -run='^$' > old.txt
$ go test -bench=Builder -benchmem -count=10 -run='^$' > new.txt
$ benchstat old.txt new.txt

$ go test -bench=. -cpuprofile cpu.out -memprofile mem.out -run='^$'
$ go tool pprof -http=:8080 cpu.out
$ go tool pprof cpu.out
(pprof) top
(pprof) list joinPlus
(pprof) web`,
    ],
    note: "Міряйте, перш ніж оптимізувати. Бенчмарк: <code>for b.Loop()</code> (Go 1.24) або <code>for i := 0; i &lt; b.N; i++</code>, результат пишіть у <code>sink</code>; <code>-benchmem</code> показує виділення пам'яті; профіль <code>pprof</code> відповідає, <i>чому</i> повільно. Порівнюйте через <code>-count=10</code> і <code>benchstat</code>.",
    work: "У реальних проєктах бенчмарки пишуть для гарячих шляхів (парсери, серіалізація, кеші), а в CI порівнюють їх із попереднім комітом через benchstat. Профіль зі справжнього сервісу (<code>net/http/pprof</code>) зазвичай знаходить вузьке місце зовсім не там, де його шукала інтуїція; один <code>make</code> із ємністю нерідко дає більше за тиждень «розумних» трюків.",
    tasks: [
      "Чому результат у бенчмарку присвоюють глобальній змінній sink і чим у цьому допомагає b.Loop з Go 1.24?",
      "Який показник бенчмарку стабільніший від запуску до запуску, час чи кількість виділень, і чому тому цей показник зручно довести в Playground?",
    ],
  },
  {
    t: "Fuzzing і Example-тести",
    ch: "Тестування й якість",
    adv: true,
    easy: "Fuzzing — це «стажер-вандал»: він без утоми підсовує вашій функції найдивніші входи (порожнє, величезне, з битими символами) і чекає, чи вона не зламається. Example-тест — це приклад у документації, який щоразу перевіряється: якщо код змінився, а приклад ні, тест почервоніє.",
    p: [
      "Звичайні тести перевіряють ті випадки, які ви <i>вигадали</i>. А помилки ховаються там, про що ви не подумали: порожній рядок, невалідний UTF-8, число на межі переповнення, дві крапки підряд. <b>Fuzzing</b> автоматизує цю вигадливість: інструмент сам породжує тисячі входів, шукає падіння (panic, зависання) і порушення заданих вами <i>властивостей</i>. Поруч із ним ми розглянемо <b>Example-тести</b>, які поєднують документацію й перевірку, та функцію <code>testing.AllocsPerRun</code>, що рахує виділення пам'яті.",
      "Модель fuzz-тесту. Це функція <code>func FuzzXxx(f *testing.F)</code> у файлі <code>_test.go</code>. Спершу <code>f.Add(...)</code> додає <b>початкові приклади</b> (seed corpus): типові й відомі проблемні входи. Далі <code>f.Fuzz(func(t *testing.T, s string) {...})</code> задає тіло, яке викликається з різними аргументами. Дозволені типи аргументів: <code>string</code>, <code>[]byte</code>, цілі, числа з плаваючою крапкою, <code>bool</code>, <code>rune</code>. Важливо: без прапорця <code>-fuzz</code> команда <code>go test</code> просто проганяє seed-приклади й збережені знахідки як звичайний тест, тож fuzz-тест нічого не коштує у CI. З прапорцем <code>go test -fuzz=FuzzReverse -fuzztime=30s</code> вмикається генерація: вона керується покриттям коду, тобто вхід, який відкрив нову гілку, запам'ятовується й мутується далі.",
      "Коли fuzzing знаходить збій, він <b>мінімізує</b> вхід до найкоротшого, що відтворює помилку, і записує його у файл <code>testdata/fuzz/FuzzXxx/&lt;хеш&gt;</code>. Цей файл треба закомітити: відтепер звичайний <code>go test</code> завжди перевіряє цей випадок, тож знахідка стає регресійним тестом. Сам кеш генерації лежить поза репозиторієм. Є обмеження: за один запуск <code>-fuzz</code> цілиться в один fuzz-тест, а тіло має бути швидким і детермінованим, без глобального стану й мережі, інакше fuzzing «знаходитиме» шум замість помилок.",
      "Проблема в тому, що fuzzing не знає правильної відповіді. Тож ми перевіряємо <b>властивості</b>, які мають виконуватись для будь-якого входу. Типові: функція не падає; <i>round-trip</i> (<code>Decode(Encode(x)) == x</code>); ідемпотентність (<code>Normalize(Normalize(x)) == Normalize(x)</code>); збіг із повільною, але очевидною еталонною реалізацією; інваріанти результату (довжина, валідність UTF-8). Класичний приклад: <code>Reverse</code>, що перевертає <i>байти</i>, ламає багатобайтові символи, і властивість «результат валідний UTF-8» одразу це викриває: на кирилиці чи ієрогліфах Reverse видає сміття. Виправлення, ви вже знаєте, працює через <code>[]rune</code>.",
      "<b>Example-тести</b> — функції <code>func ExampleXxx()</code> у <code>_test.go</code>. Якщо в кінці є коментар <code>// Output: ...</code>, <code>go test</code> перехоплює стандартний вивід і порівнює з коментарем (початкові й кінцеві пробіли ігноруються). Для довільного порядку рядків є <code>// Unordered output:</code>. Без коментаря приклад лише компілюється, але не запускається. Ім'я задає, до чого приклад належить: <code>ExampleReverse</code> до функції, <code>ExampleStore_Put</code> до методу, а суфікс із малої літери (<code>ExampleReverse_unicode</code>) додає ще один варіант. Усі вони показуються у документації на pkg.go.dev поруч із функцією. Це документація, яка не може застаріти непомітно.",
      "<code>testing.AllocsPerRun(runs, f)</code> повертає середню кількість виділень пам'яті за виклик <code>f</code>. Вона працює в звичайних тестах, тому «ця функція не виділяє пам'яті» або «не більше двох виділень» можна зафіксувати як тест-запобіжник від регресій, і він стабільніший за вимірювання часу. У Playground немає ні <code>-fuzz</code>, ні <code>_test.go</code>, тому ми робимо <b>ручний «фазер»</b>: детермінований генератор <code>rand.New(rand.NewSource(1))</code> породжує входи з невеликого алфавіту, цикл перевіряє властивість, а seed-приклади лежать в окремому зрізі. Це не заміна розумному fuzzing (справжній мутує входи за покриттям), але той самий спосіб думати: сформулюй властивість, нагодуй дивними входами, подивись контрприклад.",
    ],
    code: [
      String.raw`package rev

import (
	"fmt"
	"testing"
	"unicode/utf8"
)

func FuzzReverse(f *testing.F) {
	f.Add("hello")
	f.Add("Привіт, світе")
	f.Add("")
	f.Fuzz(func(t *testing.T, s string) {
		if !utf8.ValidString(s) {
			t.Skip()
		}
		r := Reverse(s)
		if !utf8.ValidString(r) {
			t.Errorf("Reverse(%q) = %q: невалідний UTF-8", s, r)
		}
		if back := Reverse(r); back != s {
			t.Errorf("Reverse(Reverse(%q)) = %q", s, back)
		}
	})
}

func ExampleReverse() {
	fmt.Println(Reverse("Go"))
	fmt.Println(Reverse("щука"))
	// Output:
	// oG
	// акуш
}

$ go test -fuzz=FuzzReverse -fuzztime=30s
$ go test -run=FuzzReverse/abc123
$ go test -run=ExampleReverse -v`,
      String.raw`package main

import (
	"fmt"
	"math/rand"
	"unicode/utf8"
)

func reverseBytes(s string) string {
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

func reverseRunes(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func gen(rng *rand.Rand) string {
	alphabet := []rune("abc Zб世é")
	out := make([]rune, rng.Intn(8))
	for i := range out {
		out[i] = alphabet[rng.Intn(len(alphabet))]
	}
	return string(out)
}

func fuzz(name string, rev func(string) string, seeds []string, rounds int) {
	rng := rand.New(rand.NewSource(1))
	inputs := append([]string{}, seeds...)
	for i := 0; i < rounds; i++ {
		inputs = append(inputs, gen(rng))
	}
	bad, first := 0, ""
	for _, s := range inputs {
		r := rev(s)
		if !utf8.ValidString(r) || rev(r) != s {
			if bad == 0 {
				first = s
			}
			bad++
		}
	}
	fmt.Printf("%s: входів %d, порушення знайдено: %t\n", name, len(inputs), bad > 0)
	if bad > 0 {
		fmt.Printf("  перший контрприклад: %q\n", first)
	}
}

func main() {
	seeds := []string{"", "hello", "Привіт"}
	fuzz("reverseBytes", reverseBytes, seeds, 200)
	fuzz("reverseRunes", reverseRunes, seeds, 200)
}`,
      String.raw`package main

import (
	"bytes"
	"fmt"
	"io"
	"strings"
	"testing"
)

var sink []byte

func Shout(s string) string {
	return strings.ToUpper(s) + "!"
}

func ExampleShout(w io.Writer) {
	fmt.Fprintln(w, Shout("go"))
	fmt.Fprintln(w, Shout("тест"))
}

func runExample(name string, ex func(io.Writer), want string) {
	var buf bytes.Buffer
	ex(&buf)
	got := strings.TrimSpace(buf.String())
	if got != strings.TrimSpace(want) {
		fmt.Printf("--- FAIL: %s\n    got %q; want %q\n", name, got, want)
		return
	}
	fmt.Printf("--- PASS: %s\n", name)
}

func main() {
	runExample("ExampleShout", ExampleShout, "GO!\nТЕСТ!")
	runExample("ExampleShout_stale", ExampleShout, "GO!")

	empty := testing.AllocsPerRun(100, func() {})
	one := testing.AllocsPerRun(100, func() { sink = make([]byte, 1024) })
	fmt.Println("порожня функція не виділяє пам'яті:", empty == 0)
	fmt.Println("make у глобальну змінну: одне виділення:", one == 1)
}`,
      String.raw`go test fuzz v1
string("Привіт")

$ ls testdata/fuzz/FuzzReverse
5f3a9c0d1e   <- мінімізований вхід, що викликав збій (комітимо)
$ go test            # seed і збережені знахідки йдуть як звичайний тест
$ go test -fuzz=FuzzReverse -fuzztime=1m`,
    ],
    note: "<code>FuzzXxx</code> з <code>f.Add</code> (seed) і <code>f.Fuzz</code> перевіряє <b>властивості</b>, а не конкретні відповіді; знахідки з <code>testdata/fuzz</code> комітять. <code>ExampleXxx</code> із <code>// Output:</code> одночасно документація й тест. <code>testing.AllocsPerRun</code> фіксує кількість виділень.",
    work: "Fuzzing застосовують до парсерів, декодерів, валідаторів і всього, що приймає чужі байти: саме так знаходять падіння на вході, який ніхто не вигадав. Example-тести є майже в кожному пакеті стандартної бібліотеки, і їх видно на pkg.go.dev, а <code>AllocsPerRun</code> у тестах охороняє гарячі функції від випадкових виділень.",
    tasks: [
      "Чому fuzz-тест не порівнює результат із «правильною відповіддю» і які властивості він перевіряє замість цього? Наведіть два приклади.",
      "Що відбувається, якщо в Example-функції немає коментаря // Output:, і навіщо комітити файли з testdata/fuzz?",
    ],
  },
  {
    t: "Ідіоми Go і лінтери",
    ch: "Тестування й якість",
    easy: "Ідіоми Go — це «правила дорожнього руху» мови: формально можна їхати й проти шерсти, але всі водії очікують певної поведінки. Лінтери — автоматичний інспектор, який помічає, що ви вийшли за розмітку, ще до того, як хтось постраждав.",
    p: [
      "Код читають значно частіше, ніж пишуть, тому в Go цінується <b>однаковість</b>: чужий код має виглядати майже як ваш. Ця культура спирається на інструменти, а не на суперечки в код-рев'ю. Стиль форматує машина, типові помилки знаходить статичний аналіз, а спільні домовленості записані в документах: <i>Effective Go</i> і <i>Go Code Review Comments</i>. Якість — це не лише тести: аналізатор знаходить помилки без запуску програми, на кожному коміті, безкоштовно.",
      "Інструменти за зростанням суворості. <code>gofmt</code> єдиний офіційний форматувальник без налаштувань: <code>gofmt -l .</code> показує невідформатовані файли, <code>gofmt -w .</code> виправляє (<code>go fmt</code> робить те саме). <code>goimports</code> (із <code>golang.org/x/tools</code>) — це gofmt плюс автоматичне додавання й прибирання імпортів. <code>go vet</code> входить у стандартний набір і шукає код, який компілюється, але майже напевно помилковий: неправильні формати <code>Printf</code>, копіювання <code>sync.Mutex</code>, недосяжний код, неправильні теги структур. У Go 1.24 vet також попереджає про виклик <code>Printf</code>-подібної функції з непостійним рядком формату без аргументів. <code>staticcheck</code> сторонній і глибший: зайвий код, застарілі API, помилки логіки. <code>golangci-lint</code> запускає десятки лінтерів разом за одним конфігом <code>.golangci.yml</code>; його ставлять у CI. Практичний порядок: gofmt і goimports при збереженні файлу в редакторі, vet і лінтери на кожному пул-реквесті.",
      "Тепер власне ідіоми. <b>Рання відмова (early return).</b> Обробляйте помилкові й крайні випадки на початку й виходьте, щоб «щасливий шлях» ішов рівно вниз по лівому краю. Вкладені <code>if { ... } else { ... }</code> з піраміди відступів майже завжди переписуються в плоский вигляд, а <code>else</code> після <code>return</code> зайвий. <b>Помилка останнім результатом і перевіряється одразу:</b> <code>(T, error)</code>, а не <code>(error, T)</code> (на таке скаржиться staticcheck), і одразу після виклику <code>if err != nil</code>. Ігнорувати помилку можна лише свідомо й із поясненням.",
      "<b>Нульове значення має бути корисним (zero value useful).</b> Гарний тип працює без конструктора: <code>var buf bytes.Buffer</code>, <code>var mu sync.Mutex</code>, <code>var wg sync.WaitGroup</code>, <code>var sb strings.Builder</code> готові до роботи одразу. Свої типи проєктуйте так само: якщо всередині мапа, створюйте її ліниво при першому записі (<code>if c.m == nil { c.m = make(...) }</code>), бо читання з nil-мапи безпечне, а запис ні. Те саме з <code>nil</code>-слайсом: це цілком нормальний порожній слайс, <code>append</code> працює без ініціалізації.",
      "<b>Приймайте інтерфейси, повертайте структури.</b> Параметри робіть вузькими інтерфейсами (<code>io.Reader</code> замість <code>*os.File</code>): функція стає придатною для файлу, мережі й <code>strings.NewReader</code> у тесті. Результати ж повертайте конкретними типами: так ви не обмежуєте розвиток, бо до структури можна додати метод, не зламавши нікого, а споживач сам вирішить, який інтерфейс йому потрібен. Інтерфейси тримайте малими, не передавайте вказівник на інтерфейс і не оголошуйте інтерфейс заздалегідь «про запас». Ще кілька дрібних ідіом: <code>MixedCaps</code> замість <code>snake_case</code>; абревіатури великими (<code>HTTPClient</code>, <code>userID</code>); отримувач метода з однієї-двох літер (<code>c *Counter</code>); коментар до експортованого імені починається з цього імені; сучасні конструкції Go 1.21–1.22 (<code>for i := range n</code>, <code>min</code>, <code>max</code>, пакети <code>slices</code> і <code>maps</code>) замість ручних циклів.",
      "Як жити з лінтерами. Не гасіть попередження наосліп: спершу зрозумійте, про що воно. Директиву <code>//nolint:назва // причина</code> залишайте лише для свідомих винятків і завжди з поясненням. Не вмикайте всі лінтери підряд: надлишок шуму змушує команду ігнорувати звіт. Домовтесь про конфіг, закомітьте його й запускайте в CI. У Playground є лише кнопка форматування, тому тут ми пишемо код у стилі gofmt вручну й показуємо інструменти блоком із командами. Далі в курсі ми застосуємо все це до мережі: HTTP-обробники, які тестуються через <code>httptest</code>.",
    ],
    code: [
      String.raw`$ gofmt -l .                     # які файли не відформатовані
$ gofmt -w .                     # виправити
$ goimports -w .                 # + розставити імпорти
$ go vet ./...                   # вбудований аналізатор
$ staticcheck ./...              # глибший аналіз
$ golangci-lint run              # багато лінтерів за одним конфігом

# .golangci.yml
version: "2"
linters:
  default: standard
  enable:
    - staticcheck
    - errcheck
    - revive`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

func labelNested(name string, age int) (string, error) {
	var result string
	var err error
	if name != "" {
		if age >= 0 {
			result = fmt.Sprintf("%s (%d)", name, age)
		} else {
			err = errors.New("вік від'ємний")
		}
	} else {
		err = errors.New("порожнє ім'я")
	}
	return result, err
}

func label(name string, age int) (string, error) {
	if name == "" {
		return "", errors.New("порожнє ім'я")
	}
	if age < 0 {
		return "", errors.New("вік від'ємний")
	}
	return fmt.Sprintf("%s (%d)", name, age), nil
}

func main() {
	for _, age := range []int{36, -1} {
		a, errA := labelNested("Ада", age)
		b, errB := label("Ада", age)
		fmt.Println(a == b, errA == nil, errB == nil)
	}
	_, err := label("", 1)
	fmt.Println(err)
}`,
      String.raw`package main

import (
	"fmt"
	"io"
	"strings"
	"sync"
)

type Counter struct {
	mu sync.Mutex
	m  map[string]int
}

func (c *Counter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.m == nil {
		c.m = make(map[string]int)
	}
	c.m[key]++
}

func (c *Counter) Get(key string) int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.m[key]
}

type Summary struct {
	Words int
	Lines int
}

func Count(r io.Reader) (*Summary, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	text := string(data)
	return &Summary{Words: len(strings.Fields(text)), Lines: strings.Count(text, "\n")}, nil
}

func main() {
	var c Counter
	c.Inc("a")
	c.Inc("a")
	c.Inc("b")
	fmt.Println(c.Get("a"), c.Get("b"), c.Get("z"))

	s, err := Count(strings.NewReader("раз два\nтри\n"))
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Printf("слів %d, рядків %d\n", s.Words, s.Lines)
}`,
      String.raw`package main

import "fmt"

func main() {
	name := "Go"
	fmt.Printf("%d\n", name)
	// go vet скаже: fmt.Printf format %d has arg name of wrong type string
}`,
    ],
    note: "<code>gofmt</code> знімає суперечки про стиль, <code>go vet</code> і лінтери шукають помилки без запуску. Ідіоми: рання відмова замість вкладених <code>else</code>, <code>error</code> останнім результатом, корисне нульове значення, приймай інтерфейси й повертай структури.",
    work: "У кожній команді Go є CI-крок із <code>gofmt</code>, <code>go vet</code> і <code>golangci-lint</code>: пул-реквест не зливається, поки він червоний. Це економить години код-рев'ю на дрібницях, а ще нові люди швидко вчаться «говорити з акцентом» команди, просто виправляючи попередження лінтера.",
    tasks: [
      "Яку роль у вашому робочому процесі грають gofmt, go vet і golangci-lint, і на якому етапі краще запускати кожен?",
      "Поясніть ідіоми «нульове значення має бути корисним» і «приймай інтерфейси, повертай структури», навівши по одному прикладу.",
    ],
  },
];
