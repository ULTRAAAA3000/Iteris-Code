const BT = "`";

export const LESSONS_10 = [
  {
    t: "net/http: перший обробник",
    ch: "Мережа й сервіси",
    easy: "HTTP-сервер — це адміністратор на ресепшені: йому приносять запит-анкету (<code>*http.Request</code>), а він пише відповідь на бланку (<code>http.ResponseWriter</code>). Обробник — це правило, за яким адміністратор заповнює бланк: що вказати в шапці, який поставити статус і що написати в тексті.",
    p: [
      "Майже кожен сервіс сьогодні розмовляє по HTTP: мобільний застосунок просить список задач, браузер відкриває сторінку, інший мікросервіс питає ціну. Пакет <code>net/http</code> зі стандартної бібліотеки вміє й приймати такі запити, і відповідати на них, тож для невеликого API не потрібні сторонні фреймворки. Без нього довелося б самому розбирати текст протоколу з сокета. Усе, що ви напишете як сервер, зводиться до однієї дії: отримати запит і сформувати відповідь.",
      "Модель у голові така. Інтерфейс <code>http.Handler</code> має єдиний метод <code>ServeHTTP(w http.ResponseWriter, r *http.Request)</code>. Запит <code>r</code> уже розібраний: у ньому метод (<code>r.Method</code>), адреса (<code>r.URL.Path</code>, <code>r.URL.Query()</code>), заголовки (<code>r.Header</code>) і тіло (<code>r.Body</code>). Відповідь <code>w</code> ви наповнюєте: заголовки, статус-код і тіло. <code>ResponseWriter</code> водночас реалізує <code>io.Writer</code>, тому в нього пишуть через <code>fmt.Fprint(w, ...)</code>, <code>w.Write</code> чи <code>json.NewEncoder(w)</code> (про JSON в урок про API). Зверніть увагу: <code>r</code> це вказівник, а <code>w</code> інтерфейс.",
      "Щоб не оголошувати тип заради однієї функції, є адаптер <code>http.HandlerFunc</code>: це тип функції з сигнатурою обробника, у якого вже є метод <code>ServeHTTP</code>, що просто викликає саму функцію. Тому звичайну функцію <code>func(w http.ResponseWriter, r *http.Request)</code> можна передати всюди, де чекають <code>Handler</code>, обернувши в <code>http.HandlerFunc(f)</code>. Той самий прийом ви бачили з <code>sort.Slice</code> і функціями-значеннями. Власний тип зі станом теж можна зробити обробником: достатньо метода <code>ServeHTTP</code> (зазвичай із вказівниковим отримувачем, якщо стан змінюється).",
      "Порядок дій усередині обробника має значення. Спершу виставляють заголовки через <code>w.Header().Set(...)</code>, потім за потреби викликають <code>w.WriteHeader(code)</code>, і лише тоді пишуть тіло. Перший же виклик <code>Write</code> без <code>WriteHeader</code> неявно відправляє статус 200, після цього заголовки й статус уже змінити неможливо: наступний <code>WriteHeader</code> ігнорується (справжній сервер ще й скаржиться в лог «superfluous WriteHeader»). Статуси беріть із констант: <code>http.StatusOK</code>, <code>StatusCreated</code>, <code>StatusBadRequest</code>, <code>StatusNotFound</code>, <code>StatusMethodNotAllowed</code>. Читаються краще за «магічні» числа, а тест звірить їх зі стандартом.",
      "Про <code>Content-Type</code>. Якщо ви його не виставили, сервер вгадає тип за першими байтами тіла (для звичайного тексту це <code>text/plain; charset=utf-8</code>). Для JSON або HTML краще завжди казати явно: <code>w.Header().Set(\"Content-Type\", \"application/json\")</code>. Для помилок є готова <code>http.Error(w, msg, code)</code>: вона ставить <code>text/plain</code>, статус і пише повідомлення з переносом рядка, але <b>не</b> зупиняє обробник. Після неї обов'язково пишіть <code>return</code>, інакше код піде далі й спробує записати ще одну відповідь. Це найчастіша пастка в перших обробниках.",
      "Запустити сервер у «бойовому» режимі — це <code>http.ListenAndServe(addr, handler)</code> або, краще, власний <code>&amp;http.Server{...}</code> із тайм-аутами: без <code>ReadHeaderTimeout</code> повільний клієнт може тримати з'єднання вічно. У Playground і в наших завданнях порт слухати не вийде, тому обробник викликають напряму: створюють запит через <code>httptest.NewRequest</code>, «записник» відповіді через <code>httptest.NewRecorder</code> і викликають <code>handler(rec, req)</code>. Так робляться й справжні тести серверів, тож ви вчитеся одразу правильному способу. Далі: детальніше про <code>httptest</code>, потім про маршрутизацію.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func hello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, %s!", r.URL.Query().Get("name"))
}

func main() {
	req := httptest.NewRequest("GET", "/hello?name=Olena", nil)
	rec := httptest.NewRecorder()
	hello(rec, req)
	fmt.Println(rec.Code)
	fmt.Println(rec.Body.String())
}
`,
      String.raw`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type counter struct{ hits int }

func (c *counter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET")
		http.Error(w, "метод не дозволено", http.StatusMethodNotAllowed)
		return
	}
	c.hits++
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	fmt.Fprintf(w, "відвідувань: %d", c.hits)
}

func main() {
	var h http.Handler = &counter{}
	ping := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	})

	for _, method := range []string{"GET", "GET", "POST"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(method, "/", nil))
		fmt.Println(rec.Code, rec.Header().Get("Content-Type"), rec.Body.String())
	}

	rec := httptest.NewRecorder()
	ping.ServeHTTP(rec, httptest.NewRequest("GET", "/ping", nil))
	fmt.Println(rec.Code, rec.Body.String())
}
`,
      String.raw`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func late(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "тіло")
	w.Header().Set("X-Late", "1")
	w.WriteHeader(http.StatusTeapot)
}

func main() {
	rec := httptest.NewRecorder()
	late(rec, httptest.NewRequest("GET", "/", nil))
	res := rec.Result()
	fmt.Println("статус:", res.StatusCode)
	fmt.Printf("X-Late: %q\n", res.Header.Get("X-Late"))
	fmt.Println("тип:", res.Header.Get("Content-Type"))
}
`,
      String.raw`// лише компіляція: справжній сервер слухає порт, у Playground це неможливо
package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello")
	})

	srv := &http.Server{
		Addr:              ":8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}
`,
    ],
    note: "Порядок такий: заголовки, потім <code>WriteHeader</code>, потім тіло. Після першого <code>Write</code> статус уже 200, а після <code>http.Error</code> не забудьте <code>return</code>.",
    work: "Кожен ендпоінт справжнього сервісу (здоров'я, список, створення) — це обробник із такою сигнатурою. Фреймворки (chi, gin, echo) лише обгортають ту саму пару <code>ResponseWriter</code> і <code>*Request</code>, тож що розумієте тут, працює скрізь. Перевіряти обробники через <code>httptest</code> без порту прийнято в усіх командах.",
    tasks: [
      "Чому після виклику <code>http.Error</code> в обробнику потрібен <code>return</code>, і що станеться, якщо його забути?",
      "Який статус отримає клієнт, якщо обробник спершу зробить <code>w.Write</code>, а потім <code>w.WriteHeader(404)</code>? Чому?",
    ],
  },
  {
    t: "httptest і тестування обробників",
    ch: "Мережа й сервіси",
    easy: "Перевіряти обробник через справжній сервер — як тестувати двері, щоразу будуючи під них будинок. <code>httptest</code> дає макет: вигаданий запит на вході й «записник» на виході, у який видно все, що обробник відповів.",
    p: [
      "Обробник — це звичайна функція, а тести найкраще працюють з функціями, які можна викликати без зайвого оточення. Тому в Go прийнято перевіряти HTTP-код, не запускаючи сервер: без порту, без мережі, без гонки за вільну адресу. Пакет <code>net/http/httptest</code> дає два головні інструменти. <code>httptest.NewRequest(method, target, body)</code> створює готовий серверний запит: тут можна задати метод, шлях із параметрами та тіло. <code>httptest.NewRecorder()</code> створює реалізацію <code>ResponseWriter</code>, яка запам'ятовує все, що в неї записали.",
      "Модель проста: <b>запит → обробник → записник</b>. Ви будуєте запит, створюєте записник, викликаєте <code>h.ServeHTTP(rec, req)</code> (або просто <code>h(rec, req)</code>, якщо це функція) і дивитеся в поля записника. <code>rec.Code</code> показує статус, <code>rec.Body</code> (це <code>*bytes.Buffer</code>) показує тіло, <code>rec.Header()</code> показує заголовки, які виставив обробник. Якщо потрібна відповідь у вигляді справжнього <code>*http.Response</code> (як її побачив би клієнт), викличте <code>rec.Result()</code>: це знімок на момент виклику, там є <code>StatusCode</code>, <code>Header</code> і <code>Body</code>, який читають через <code>io.ReadAll</code>.",
      "Тіло запиту передають третім аргументом як <code>io.Reader</code>. Для тексту підходить <code>strings.NewReader(\"...\")</code>, для JSON теж: <code>strings.NewReader(\u0060{\"title\":\"x\"}\u0060)</code>. Якщо тіла немає, передайте <code>nil</code>. Заголовки додають звичайно: <code>req.Header.Set(\"Content-Type\", \"application/json\")</code>. Зверніть увагу, що <code>NewRequest</code> призначений для <i>серверного</i> боку і при некоректних даних (наприклад, зламаному URL) панікує, бо це помилка в самому тесті. Для клієнтського запиту існує <code>http.NewRequest</code>, що повертає <code>error</code>.",
      "Тестів зазвичай багато, тож їх пишуть табличним способом: таблиця випадків із полями <code>method</code>, <code>url</code>, <code>body</code>, <code>wantCode</code>, <code>wantBody</code> і цикл по ній. Повторюваний код (створити запит, записник, викликати обробник) виносять у маленьку допоміжну функцію, яка повертає <code>*httptest.ResponseRecorder</code>. У нашому Playground немає пакета <code>testing</code> у вигляді окремого файлу, тому цикл пишемо в <code>main</code> і друкуємо <code>ok</code> або <code>FAIL</code>; у справжньому проєкті той самий цикл живе в <code>func TestXxx(t *testing.T)</code> у файлі <code>_test.go</code> і викликає <code>t.Errorf</code>.",
      "Інколи потрібен справжній сервер: перевірити клієнтський код або поведінку, яку записник не відтворить (тайм-аути, перенаправлення, реальні заголовки з'єднання). Тоді є <code>httptest.NewServer(handler)</code>: він піднімає тестовий сервер на вільному порту <code>127.0.0.1</code> і дає адресу в <code>srv.URL</code>. Після тесту обов'язково <code>defer srv.Close()</code>. Локально через <code>go run</code> це працює, а от у Playground і в обмежених середовищах мережа, навіть локальна, може бути недоступна, тому в уроках основою беремо <code>NewRecorder</code>, а <code>NewServer</code> показуємо лише як приклад. Правило вибору: хочете перевірити обробник, беріть записник; хочете перевірити клієнта, беріть тестовий сервер.",
      "Пастки. Перша: перевіряти <code>rec.Code</code>, коли обробник нічого не писав: за замовчуванням там 200, тож «порожній» обробник «проходить» тест на успіх. Тому перевіряйте ще й тіло. Друга: порівнювати тіло з точністю до символу, не пам'ятаючи, що <code>json.Encoder</code> та <code>http.Error</code> додають перенос рядка в кінці: використовуйте <code>strings.TrimSpace</code> або <code>strings.Contains</code>. Третя: використовувати один записник для кількох викликів: створюйте новий на кожен запит. Далі: маршрутизація, де обробник потрібно обрати за методом і шляхом.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
)

func upper(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "тільки POST", http.StatusMethodNotAllowed)
		return
	}
	b, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "помилка читання", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	fmt.Fprint(w, strings.ToUpper(string(b)))
}

func main() {
	req := httptest.NewRequest("POST", "/upper", strings.NewReader("hello"))
	rec := httptest.NewRecorder()
	upper(rec, req)

	res := rec.Result()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(res.StatusCode, res.Header.Get("Content-Type"))
	fmt.Println(string(body))
}
`,
      String.raw`package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
)

func upper(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "тільки POST", http.StatusMethodNotAllowed)
		return
	}
	b, _ := io.ReadAll(r.Body)
	fmt.Fprint(w, strings.ToUpper(string(b)))
}

func call(h http.HandlerFunc, method, url, body string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h(rec, httptest.NewRequest(method, url, strings.NewReader(body)))
	return rec
}

func main() {
	tests := []struct {
		name     string
		method   string
		body     string
		wantCode int
		wantBody string
	}{
		{"POST рядок", "POST", "go", 200, "GO"},
		{"POST порожнє тіло", "POST", "", 200, ""},
		{"GET заборонено", "GET", "", 405, "тільки POST"},
	}

	passed := 0
	for _, tt := range tests {
		rec := call(upper, tt.method, "/upper", tt.body)
		got := strings.TrimSpace(rec.Body.String())
		if rec.Code == tt.wantCode && got == tt.wantBody {
			fmt.Println("ok  ", tt.name)
			passed++
		} else {
			fmt.Printf("FAIL %s: %d %q\n", tt.name, rec.Code, got)
		}
	}
	fmt.Printf("Пройдено %d з %d\n", passed, len(tests))
}
`,
      String.raw`// лише компіляція: тестовий сервер відкриває порт, у Playground мережі може не бути
package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
)

func main() {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "pong")
	}))
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/ping")
	if err != nil {
		fmt.Println("помилка:", err)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(resp.StatusCode, string(body))
}
`,
    ],
    note: "Обробник перевіряють без мережі: <code>NewRequest</code> на вході, <code>NewRecorder</code> на виході. Новий записник на кожен запит, а тіло порівнюйте через <code>TrimSpace</code>.",
    work: "У кожному Go-сервісі тести обробників починаються з пари <code>NewRequest</code> і <code>NewRecorder</code>: вони швидкі й не залежать від мережі, тому йдуть у CI на кожен коміт. <code>NewServer</code> беруть для тестів HTTP-клієнтів і для інтеграційних перевірок.",
    tasks: [
      "Чому записник створюють заново на кожен запит у таблиці випадків?",
      "Коли замість <code>NewRecorder</code> варто взяти <code>httptest.NewServer</code>, і що обов'язково треба викликати після тесту?",
    ],
  },
  {
    t: "Маршрутизація: ServeMux",
    ch: "Мережа й сервіси",
    easy: "Мультиплексор — це сортувальник пошти: дивиться на адресу й метод листа та кладе його в потрібну скриньку. Чим точніше написано адресу на скриньці, тим вищий її пріоритет.",
    p: [
      "Один сервер приймає запити на десятки адрес: <code>/tasks</code>, <code>/tasks/7</code>, <code>/health</code>. Хтось має вирішувати, який обробник викликати для якого запиту. Це робить <code>http.ServeMux</code> («мультиплексор»): таблиця «шаблон → обробник». Сам <code>ServeMux</code> теж реалізує <code>http.Handler</code>, тож його передають серверу як єдиний обробник, а він уже розкидає запити далі. Створюють його через <code>http.NewServeMux()</code>, а обробники додають методами <code>mux.Handle(pattern, handler)</code> і <code>mux.HandleFunc(pattern, func)</code>.",
      "Починаючи з <b>Go 1.22</b> шаблон може містити метод і змінні частини шляху, і сторонні маршрутизатори для простих API вже не обов'язкові. Формат: <code>\"[МЕТОД ]/шлях\"</code>. Приклади: <code>\"GET /tasks\"</code>, <code>\"POST /tasks\"</code>, <code>\"GET /tasks/{id}\"</code>. Фрагмент у фігурних дужках захоплює один сегмент шляху, а значення дістають у обробнику через <code>r.PathValue(\"id\")</code>. Це завжди рядок, тож число перетворюйте через <code>strconv.Atoi</code> і обробляйте помилку. Шаблон без методу відповідає будь-якому методу. Шаблон із <code>GET</code> відповідає ще й <code>HEAD</code>. Пам'ятайте, що нові шаблони діють, якщо у <code>go.mod</code> вказано <code>go 1.22</code> або новіше; рядок <code>//go:debug httpmuxgo121=0</code> над <code>package main</code> у наших прикладах вмикає нову поведінку й без <code>go.mod</code> (у сучасному модулі він зайвий, але нешкідливий).",
      "Є два спеціальні різновиди. <code>{name...}</code> в кінці шаблону захоплює <b>весь залишок</b> шляху з похилими рисками: для <code>\"GET /files/{path...}\"</code> запит <code>/files/a/b.txt</code> дасть <code>PathValue(\"path\") == \"a/b.txt\"</code>. А <code>{$}</code> в кінці прив'язує шаблон до <b>точного</b> шляху: <code>\"GET /{$}\"</code> відповідає лише <code>/</code>, тоді як шаблон <code>\"/\"</code> без нього відповідає всім шляхам, що не знайшли кращої пари. Тому для головної сторінки пишуть саме <code>/{$}</code>, інакше вона перехопить і неіснуючі адреси.",
      "Що робити, коли під запит підходить кілька шаблонів? Діє правило <b>найспецифічнішого</b>: перемагає той, що відповідає вужчій множині запитів. Літерали вужчі за змінні, тож <code>/tasks/new</code> виграє в <code>/tasks/{id}</code>, а <code>/tasks/{id}</code> виграє в <code>/tasks/{path...}</code>. Порядок реєстрації не має значення. Якщо два шаблони перетинаються, а жоден не вужчий (наприклад, <code>/a/{x}</code> і <code>/{y}/b</code>, обидва підходять до <code>/a/b</code>), реєстрація <b>панікує</b>: помилка маршрутів виявляється одразу при старті, а не у «бойовому» запиті. Це добра властивість: колізії неможливо не помітити.",
      "Автоматичні відповіді теж варто знати. Якщо шлях відомий, але для цього методу шаблонів немає, <code>ServeMux</code> сам відповідає <b>405 Method Not Allowed</b> і виставляє заголовок <code>Allow</code> з переліком дозволених методів (наприклад, <code>GET, HEAD</code>). Якщо шляху немає зовсім, відповідь <b>404</b> із текстом «404 page not found». Тобто перевіряти <code>r.Method</code> вручну в кожному обробнику більше не треба: достатньо вказати метод у шаблоні. Окрема дрібниця: шаблон, що закінчується на <code>/</code> (наприклад, <code>/static/</code>), відповідає всьому піддереву, а шаблон без кінцевої риски лише точному шляху.",
      "Типові пастки. Перша: забути, що <code>PathValue</code> повертає порожній рядок, якщо змінної з такою назвою в шаблоні немає, і не вмикає жодної помилки (друк назви з помилкою дає тихий баг). Друга: дати змінним однакові імена в одному шаблоні, це також паніка. Третя: очікувати, що <code>\"/\"</code> означає «лише головна». Четверта: звертатися до <code>http.DefaultServeMux</code> (функції <code>http.HandleFunc</code>) у бібліотечному коді: це глобальна змінна, тож будь-який імпортований пакет може зареєструвати там свої маршрути. Створюйте власний <code>NewServeMux</code>. Далі: на цьому каркасі будуємо JSON API з CRUD.",
    ],
    code: [
      String.raw`//go:debug httpmuxgo121=0
package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func serve(h http.Handler, method, path string) {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, nil))
	fmt.Printf("%s %s -> %d %s\n", method, path, rec.Code, strings.TrimSpace(rec.Body.String()))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /tasks", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "список")
	})
	mux.HandleFunc("GET /tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "задача %s", r.PathValue("id"))
	})

	serve(mux, "GET", "/tasks")
	serve(mux, "GET", "/tasks/42")
	serve(mux, "POST", "/tasks")
	serve(mux, "GET", "/other")
}
`,
      String.raw`//go:debug httpmuxgo121=0
package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func serve(h http.Handler, method, path string) {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, nil))
	fmt.Printf("%s %s -> %d %s\n", method, path, rec.Code, strings.TrimSpace(rec.Body.String()))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "головна")
	})
	mux.HandleFunc("GET /tasks/new", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "форма")
	})
	mux.HandleFunc("GET /tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "задача ", r.PathValue("id"))
	})
	mux.HandleFunc("GET /files/{path...}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "файл ", r.PathValue("path"))
	})

	serve(mux, "GET", "/")
	serve(mux, "GET", "/tasks/new")
	serve(mux, "GET", "/tasks/5")
	serve(mux, "GET", "/files/img/logo.png")
	serve(mux, "GET", "/missing")

	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("DELETE", "/tasks/5", nil))
	fmt.Println(rec.Code, rec.Header().Get("Allow"))
}
`,
      String.raw`// аварія: шаблони /a/{x} і /{y}/b перетинаються, жоден не вужчий, тож реєстрація панікує
//go:debug httpmuxgo121=0
package main

import (
	"fmt"
	"net/http"
)

func main() {
	h := func(w http.ResponseWriter, r *http.Request) {}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /a/{x}", h)
	fmt.Println("перший зареєстровано")
	mux.HandleFunc("GET /{y}/b", h)
	fmt.Println("сюди не дійдемо")
}
`,
    ],
    note: "Шаблон Go 1.22: <code>\"МЕТОД /шлях/{змінна}\"</code>. Перемагає найспецифічніший, порядок реєстрації не важливий, а головну сторінку пишіть як <code>/{$}</code>.",
    work: "Для невеликих сервісів і внутрішніх API стандартного <code>ServeMux</code> тепер вистачає: методи й параметри шляху вбудовані, а 404 і 405 з <code>Allow</code> робляться автоматично. Багато команд відмовилися від зовнішніх роутерів саме через це.",
    tasks: [
      "Чим шаблон <code>\"GET /{$}\"</code> відрізняється від <code>\"GET /\"</code>?",
      "Які шаблони виграють для запиту <code>GET /tasks/new</code>, якщо зареєстровано <code>/tasks/{id}</code> і <code>/tasks/new</code>, і чому порядок реєстрації не має значення?",
    ],
  },
  {
    t: "JSON API: CRUD",
    ch: "Мережа й сервіси",
    easy: "CRUD — чотири дії з будь-яким записом: створити, прочитати, оновити, видалити. JSON API — це касир, який приймає й видає такі записи у форматі JSON і щоразу чесно каже статус: «готово», «такого немає» або «ви щось не так заповнили».",
    p: [
      "Більшість сервісів зводяться до одного: тримати набір записів (задачі, замовлення, нотатки) і дозволяти клієнтам працювати з ними через HTTP. Чотири операції CRUD накладаються на методи: <code>POST /tasks</code> створює, <code>GET /tasks</code> і <code>GET /tasks/{id}</code> читають, <code>PUT /tasks/{id}</code> оновлює, <code>DELETE /tasks/{id}</code> видаляє. Обмін відбувається у форматі JSON, тож усі обробники роблять схожі кроки: прочитати JSON із тіла, перевірити, змінити сховище й відповісти JSON із правильним статусом. Сховище в цьому уроці в пам'яті (мапа), справжню базу ми підключимо пізніше.",
      "Для читання тіла запиту беруть <code>json.NewDecoder(r.Body).Decode(&amp;v)</code>, для відповіді <code>json.NewEncoder(w).Encode(v)</code>. Обидва працюють із потоком і не вимагають проміжного <code>[]byte</code>. Структури описують із тегами: <code>Title string \u0060json:\"title\"\u0060</code>. Корисна страховка: <code>dec.DisallowUnknownFields()</code> відхиляє JSON з невідомими полями, тож друкарська помилка клієнта («titel») не зникає мовчки. А від надмірно великих тіл захищає <code>http.MaxBytesReader(w, r.Body, 1&lt;&lt;20)</code>, який обрізає читання на заданій межі. Порожнє тіло дає помилку <code>io.EOF</code>, і її теж слід перетворити на 400.",
      "Статус-код — частина контракту, а не прикраса. <b>201 Created</b> віддають після успішного створення (в тілі новий запис, за бажанням заголовок <code>Location</code>). <b>200 OK</b> — успішне читання й оновлення. <b>204 No Content</b> — успіх без тіла, класика для видалення. <b>400 Bad Request</b> — клієнт надіслав сміття (зламаний JSON, порожня обов'язкова назва, нечислове id). <b>404 Not Found</b> — запису з таким id немає. Для 405 нічого писати не потрібно: його виставить <code>ServeMux</code>, якщо ви вказали метод у шаблоні. Не плутайте помилку клієнта (4xx) із помилкою сервера (5xx): 500 означає, що зламалося щось у нас.",
      "Помилки теж віддають як JSON, щоб клієнт мав один формат для розбору: наприклад <code>{\"error\":\"задачу не знайдено\"}</code>. Для цього пишуть два маленькі помічники: <code>writeJSON(w, code, v)</code> і <code>writeError(w, code, msg)</code>. Порядок усередині <code>writeJSON</code> фіксований: спершу <code>Content-Type</code>, потім <code>WriteHeader(code)</code>, і тільки тоді <code>Encode</code>. Помічники прибирають повторення, і код обробників читається як опис логіки, а не як різанина із заголовків. Кожна гілка помилки закінчується <code>return</code>, інакше обробник напише дві відповіді.",
      "Сховище й конкурентність. Сервер обслуговує кожен запит в окремій горутині, тож мапа, до якої звертаються з кількох запитів, має бути захищена. Звичайний варіант: структура зі <code>sync.Mutex</code>, мапою й лічильником наступного id, а обробники її методи. Блокуйте на мінімум часу й завжди через <code>defer mu.Unlock()</code>. Без м'ютекса отримаєте data race, який виявляє <code>go test -race</code>. Зверніть увагу й на порядок у списку: мапа не гарантує порядку обходу, тож перед відповіддю відсортуйте записи за id, інакше відповідь буде різною за запуск (і тест «блимає»).",
      "Типові пастки: забути <code>return</code> після <code>writeError</code>; вважати, що <code>PathValue</code> числовий (<code>strconv.Atoi</code> і помилка 400); писати статус після тіла; віддавати <code>nil</code>-слайс і отримувати <code>null</code> замість <code>[]</code> (створюйте <code>make([]Task, 0)</code>, якщо клієнтові потрібен порожній масив); довіряти id із тіла замість id із шляху при оновленні. Ідіома: в обробнику спершу відсікайте помилки й виходьте рано, а «щасливий» шлях лишайте в кінці без вкладеності. Перевіряється такий API так само, як у попередніх уроках: <code>httptest</code>, запит, записник, перевірка коду й JSON-тіла. Далі: проміжні шари (middleware), які загортають обробники.",
    ],
    code: [
      String.raw`package main

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

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

func main() {
	h := func(w http.ResponseWriter, r *http.Request) {
		var in Task
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			writeError(w, http.StatusBadRequest, "некоректний JSON")
			return
		}
		in.ID = 1
		writeJSON(w, http.StatusCreated, in)
	}

	for _, body := range []string{${BT}{"title":"Вивчити Go"}${BT}, "{зламано"} {
		rec := httptest.NewRecorder()
		h(rec, httptest.NewRequest("POST", "/tasks", strings.NewReader(body)))
		fmt.Println(rec.Code, strings.TrimSpace(rec.Body.String()))
	}
}
`,
      String.raw`//go:debug httpmuxgo121=0
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sort"
	"strconv"
	"strings"
	"sync"
)

type Task struct {
	ID    int    ${BT}json:"id"${BT}
	Title string ${BT}json:"title"${BT}
	Done  bool   ${BT}json:"done"${BT}
}

type store struct {
	mu    sync.Mutex
	tasks map[int]Task
	next  int
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

func (s *store) create(w http.ResponseWriter, r *http.Request) {
	var in Task
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Title == "" {
		writeError(w, http.StatusBadRequest, "потрібна назва")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	in.ID = s.next
	s.next++
	s.tasks[in.ID] = in
	writeJSON(w, http.StatusCreated, in)
}

func (s *store) list(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]Task, 0, len(s.tasks))
	for _, t := range s.tasks {
		out = append(out, t)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	writeJSON(w, http.StatusOK, out)
}

func (s *store) get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "некоректний id")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[id]
	if !ok {
		writeError(w, http.StatusNotFound, "задачу не знайдено")
		return
	}
	writeJSON(w, http.StatusOK, t)
}

func (s *store) update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "некоректний id")
		return
	}
	var in Task
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "некоректний JSON")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tasks[id]; !ok {
		writeError(w, http.StatusNotFound, "задачу не знайдено")
		return
	}
	in.ID = id
	s.tasks[id] = in
	writeJSON(w, http.StatusOK, in)
}

func (s *store) remove(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "некоректний id")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tasks[id]; !ok {
		writeError(w, http.StatusNotFound, "задачу не знайдено")
		return
	}
	delete(s.tasks, id)
	w.WriteHeader(http.StatusNoContent)
}

func do(h http.Handler, method, path, body string) {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, strings.NewReader(body)))
	fmt.Printf("%s %s -> %d %s\n", method, path, rec.Code, strings.TrimSpace(rec.Body.String()))
}

func main() {
	s := &store{tasks: map[int]Task{}, next: 1}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /tasks", s.create)
	mux.HandleFunc("GET /tasks", s.list)
	mux.HandleFunc("GET /tasks/{id}", s.get)
	mux.HandleFunc("PUT /tasks/{id}", s.update)
	mux.HandleFunc("DELETE /tasks/{id}", s.remove)

	do(mux, "POST", "/tasks", ${BT}{"title":"Вивчити Go"}${BT})
	do(mux, "POST", "/tasks", ${BT}{"title":"Написати API"}${BT})
	do(mux, "PUT", "/tasks/1", ${BT}{"title":"Вивчити Go","done":true}${BT})
	do(mux, "GET", "/tasks", "")
	do(mux, "DELETE", "/tasks/2", "")
	do(mux, "GET", "/tasks/2", "")
	do(mux, "GET", "/tasks/abc", "")
	do(mux, "POST", "/tasks", ${BT}{"title":""}${BT})
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Task struct {
	Title string ${BT}json:"title"${BT}
	Done  bool   ${BT}json:"done"${BT}
}

func decode(body string) (Task, error) {
	var t Task
	dec := json.NewDecoder(strings.NewReader(body))
	dec.DisallowUnknownFields()
	err := dec.Decode(&t)
	return t, err
}

func main() {
	for _, body := range []string{
		${BT}{"title":"ok","done":true}${BT},
		${BT}{"titel":"друкарська помилка"}${BT},
		"",
		${BT}{"title":"обірвано"${BT},
	} {
		t, err := decode(body)
		fmt.Printf("%+v | %v\n", t, err)
	}
}
`,
    ],
    note: "CRUD це методи плюс коди: POST дає 201, GET і PUT дають 200, DELETE дає 204, відсутній запис це 404, поганий ввід це 400. Після кожної помилки <code>return</code>, а помилки віддавайте теж JSON-ом.",
    work: "Так виглядає ядро будь-якого REST-сервісу: нотатки, товари, користувачі. Змінюється лише сховище (мапа, потім база даних) і шари навколо: логування, автентифікація, валідація. Перевірка через <code>httptest</code> дозволяє змінювати все це, не боячись зламати контракт.",
    tasks: [
      "Який статус і яке тіло має віддати <code>DELETE /tasks/5</code>, якщо задача існує, і якщо її немає?",
      "Чому мапу задач у сховищі треба захищати м'ютексом і для чого перед відповіддю сортувати записи списку?",
    ],
  },
];
