const BT = "`";

export const LESSONS_06 = [
  {
    t: "error як значення",
    ch: "Помилки",
    easy: "Помилка в Go — це не вибух, що летить по програмі, а записка, яку функція кладе поруч із результатом: «вийшло» (записки немає) або «не вийшло, ось чому». Ви читаєте записку одразу й вирішуєте, що робити далі.",
    p: [
      "Файл може не існувати, користувач може ввести «abc» замість числа, мережа може обірватися. Це не рідкісні катастрофи, а <b>звичайна частина роботи</b> будь-якої програми. У багатьох мовах для цього є винятки: помилка «летить» угору стеком викликів, і з рядка виклику не видно, що тут узагалі щось може піти не так. Go обрав інший шлях: помилка є <b>звичайним значенням</b>, яке функція повертає останнім результатом. Читаючи код, ви бачите кожну точку, де щось може зламатися, і кожного разу мусите вирішити, що з цим робити.",
      "Модель у голові проста. <code>error</code> — це вбудований інтерфейс з одним методом: <code>type error interface { Error() string }</code>. Будь-який тип, що має метод <code>Error() string</code>, є помилкою (неявна реалізація з глави про інтерфейси). Значення типу <code>error</code> — це пара (тип, значення), а <code>nil</code> означає «помилки немає». Тому функція, що може не вдатися, має сигнатуру на кшталт <code>func Parse(s string) (int, error)</code>: перший результат — те, що ви просили, другий — «записка». Домовленість така: якщо <code>err != nil</code>, інші результати не можна вважати достовірними (зазвичай там нульові значення).",
      "Створити помилку можна двома способами. <code>errors.New(\"текст\")</code> дає просту помилку з фіксованим текстом. <code>fmt.Errorf(\"вік %d поза межами\", n)</code> робить те саме, але з форматуванням, як <code>Printf</code>. Запам'ятайте тонкість: кожен виклик <code>errors.New</code> створює <b>нове окреме значення</b>. Дві помилки з однаковим текстом не рівні між собою; рівною є лише помилка сама собі. На цьому тримається ідея сентинел-помилок, про яку буде окремий урок. Ще одне правило стилю: текст помилки пишуть <b>з малої літери й без крапки в кінці</b>, бо його склеюватимуть у ланцюжок на кшталт «читання конфігурації: відкриття файлу: файл не знайдено».",
      "Перевірка виглядає завжди однаково: <code>if err != nil { ... }</code> одразу після виклику. Найпоширеніша ідіома — <b>раннє повернення</b>: при помилці ви одразу виходите з функції (<code>return 0, err</code>), а «щасливий шлях» тече донизу без зайвих відступів і без <code>else</code>. Порівняйте з вкладеними <code>if</code>, у яких справжня робота ховається на четвертому рівні відступу. Приклади нижче йдуть по сходинках: спочатку своя помилка в <code>divide</code>, потім помилка від бібліотеки (<code>strconv.Atoi</code>) з додаванням контексту, потім перевірка того, що значення помилок порівнюються за ідентичністю.",
      "Чому Go обійшовся без винятків? Тому що відмова — очікуваний результат, а не «виняткова ситуація». Явне повернення змушує дивитися на неї в місці виклику, не дає функції несподівано завершитися через три рівні вище й робить потік керування видимим. Ціна — багатослівність: <code>if err != nil</code> зустрічається всюди. Це свідомий компроміс, і досвідчені розробники швидко навчаються читати такий код очима. Для справді непередбачуваних програмних помилок (вихід за межі слайса, nil-вказівник) існує <code>panic</code>, але це окрема тема в уроці про panic і recover.",
      "Пастки. Перша: ігнорувати помилку через <code>_</code>. Запис <code>n, _ := strconv.Atoi(s)</code> мовчки дасть 0 для «abc», і баг проявиться далеко від джерела. Ігнорувати можна лише свідомо й з причиною (наприклад, помилка запису в <code>strings.Builder</code> неможлива за визначенням). Друга: користуватися результатом до перевірки <code>err</code>. Третя: оголосити <code>err</code> і не прочитати її. Компілятор це зупинить: <code>declared and not used: err</code>, і це чудово, бо змушує згадати про помилку. Четверта: повертати помилку без жодного контексту, коли викликач потім не розбере, де саме вона виникла.",
      "Підсумок для практики: функція, що може не вдатися, повертає <code>error</code> останнім; викликач перевіряє <code>err != nil</code> одразу; помилку створюють через <code>errors.New</code> або <code>fmt.Errorf</code>; текст з малої літери. Далі в курсі: власні типи помилок, які несуть не лише текст, а й дані, і обгортання помилок для ланцюжка контексту.",
    ],
    code: [
      String.raw`package main

import (
	"errors"
	"fmt"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("ділення на нуль")
	}
	return a / b, nil
}

func main() {
	res, err := divide(10, 4)
	fmt.Println(res, err)
	res, err = divide(1, 0)
	fmt.Println(res, err)
	if err != nil {
		fmt.Println("помилка:", err)
	}
}
`,
      String.raw`package main

import (
	"fmt"
	"strconv"
)

func sumAll(items []string) (int, error) {
	total := 0
	for i, s := range items {
		n, err := strconv.Atoi(s)
		if err != nil {
			return 0, fmt.Errorf("елемент %d: %v", i, err)
		}
		total += n
	}
	return total, nil
}

func main() {
	fmt.Println(sumAll([]string{"1", "2", "3"}))
	fmt.Println(sumAll([]string{"1", "два", "3"}))
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

func main() {
	a := errors.New("не знайдено")
	b := errors.New("не знайдено")
	fmt.Println(a == a, a == b, a.Error() == b.Error())

	var err error
	fmt.Println(err == nil)
	err = a
	fmt.Printf("%T %v\n", err, err != nil)
}
`,
      String.raw`// не компілюється: err оголошено, але ніде не прочитано
package main

import (
	"fmt"
	"strconv"
)

func main() {
	n, err := strconv.Atoi("42")
	fmt.Println(n)
}
`,
    ],
    note: "Функція повертає error останнім результатом; викликач перевіряє err != nil одразу й виходить раніше. Текст помилки з малої літери без крапки. Не ігноруйте err через _ без причини.",
    work: "Кожен виклик, що торкається файлу, мережі, бази даних чи розбору тексту, повертає error. Код на Go здебільшого складається з послідовності «зробити крок, перевірити err, піти далі», тож уміння швидко читати й писати такі блоки вирішує, наскільки зручно вам працювати з чужими проєктами.",
    tasks: [
      "Чому errors.New(\"x\") == errors.New(\"x\") дає false, хоча тексти однакові?",
      "Що станеться, якщо написати n, _ := strconv.Atoi(\"abc\") і чому така звичка небезпечна?",
    ],
  },
  {
    t: "Власні типи помилок",
    ch: "Помилки",
    easy: "Звичайна помилка — це наліпка з текстом. Власний тип помилки — це цілий конверт: у ньому і текст для людини, і окремі поля для програми (який код, яке поле, скільки чекати), щоб код міг відреагувати розумно.",
    p: [
      "Тексту помилки достатньо, поки її читає людина. Але часто програмі треба знати, <i>що саме</i> сталося: яке поле форми невалідне, який HTTP-код повернув сервер, скільки секунд чекати до повтору. Розбирати для цього рядок («якщо текст містить слово timeout…») крихко: змінили формулювання, і логіка зламалась. Рішення — <b>власний тип помилки</b>, який несе структуровані дані, а текст будує сам із них.",
      "Згадайте, що <code>error</code> — це інтерфейс з єдиним методом <code>Error() string</code>. Отже, помилкою може бути будь-який тип, який цей метод має. Зазвичай це структура: <code>type ValidationError struct { Field, Reason string }</code> і метод <code>func (e *ValidationError) Error() string { return e.Field + \": \" + e.Reason }</code>. Поля призначені для коду, <code>Error()</code> — для людини. Саме так влаштовані помилки стандартної бібліотеки: <code>*strconv.NumError</code> має поля <code>Func</code>, <code>Num</code>, <code>Err</code>, а <code>*fs.PathError</code> несе операцію й шлях до файлу.",
      "Який отримувач обрати? Загальноприйнята практика: <b>вказівник</b>. Метод пишемо як <code>func (e *ValidationError) Error() string</code>, а повертаємо <code>&ValidationError{...}</code>. Помилку не копіюють, вона стає незмінним «паспортом» події, а порівняння йде за ідентичністю. Тип із отримувачем-значенням теж допустимий (для дрібних незмінних структур), але змішувати форми не варто: у наступному уроці <code>errors.As</code> шукатиме саме той вигляд, який ви повертаєте, і плутанина між <code>T</code> і <code>*T</code> дає баги, які важко помітити.",
      "Як викликач дістає дані? Функція повертає звичайний <code>error</code>, а викликач перевіряє динамічний тип: <code>if ve, ok := err.(*ValidationError); ok { ... ve.Field ... }</code> (це знайоме твердження типу з глави про інтерфейси). Якщо типів помилок кілька, зручно скористатися <code>switch e := err.(type)</code>. Один мінус: твердження типу бачить лише <i>верхній</i> шар. Якщо помилку обгорнули в інший контекст, прямий <code>err.(*ValidationError)</code> уже не спрацює. Для цього існує <code>errors.As</code>, про нього в наступному уроці.",
      "Тепер головна пастка цього уроку: <b>nil-вказівник усередині error</b>. Допустимо, функція має тип результату <code>error</code>, а всередині є змінна <code>var e *MyErr</code>, і наприкінці ви пишете <code>return e</code>. Пам'ятаєте, що інтерфейсне значення — це пара (тип, значення)? Тут виходить пара (<code>*MyErr</code>, <code>nil</code>): тип заповнений, тому інтерфейс <b>не дорівнює</b> <code>nil</code>, і <code>err != nil</code> дає <code>true</code> навіть коли помилки немає. Викликач іде обробляти неіснуючу помилку, а виклик <code>err.Error()</code> на такому значенні може завершитися panic, якщо метод читає поля.",
      "Правило від цієї пастки одне: функція з результатом <code>error</code> має повертати <b>літеральний <code>nil</code></b> у щасливому випадку й готове значення помилки в іншому, а не змінну конкретного типу-вказівника. Не оголошуйте <code>var e *MyErr</code> для того, щоб потім повернути її як <code>error</code>. Якщо потрібно спершу накопичити помилку, тримайте змінну типу <code>error</code> і перед поверненням перевіряйте, що вона справді присвоєна.",
      "Ідіоми. Експортуйте тип помилки лише тоді, коли викликачам справді треба його розпізнавати (інакше достатньо <code>fmt.Errorf</code>), бо кожен експортований тип стає частиною вашого API. Назву закінчують на <code>Error</code> (<code>ValidationError</code>, <code>StatusError</code>). Логіку не будують на тексті, текст існує для людини. Далі: як додавати контекст до помилки, не втрачаючи її тип.",
    ],
    code: [
      String.raw`package main

import "fmt"

type ValidationError struct {
	Field  string
	Reason string
}

func (e *ValidationError) Error() string {
	return e.Field + ": " + e.Reason
}

func validate(name string, age int) error {
	if name == "" {
		return &ValidationError{Field: "name", Reason: "порожнє значення"}
	}
	if age < 0 {
		return &ValidationError{Field: "age", Reason: "від'ємний вік"}
	}
	return nil
}

func main() {
	err := validate("", 20)
	fmt.Println("повідомлення:", err)
	if ve, ok := err.(*ValidationError); ok {
		fmt.Println("поле:", ve.Field)
	}
	fmt.Println(validate("Ада", 36))
}
`,
      String.raw`package main

import "fmt"

type StatusError struct {
	Code int
	Msg  string
}

func (e *StatusError) Error() string {
	return fmt.Sprintf("статус %d: %s", e.Code, e.Msg)
}

func fetch(id int) error {
	switch id {
	case 1:
		return nil
	case 2:
		return &StatusError{404, "не знайдено"}
	default:
		return fmt.Errorf("невідомий id %d", id)
	}
}

func main() {
	for id := 1; id <= 3; id++ {
		switch e := fetch(id).(type) {
		case nil:
			fmt.Println(id, "успіх")
		case *StatusError:
			fmt.Println(id, "код", e.Code)
		default:
			fmt.Println(id, "інша помилка:", e)
		}
	}
}
`,
      String.raw`package main

import "fmt"

type MyErr struct{ Msg string }

func (e *MyErr) Error() string { return e.Msg }

func findBad(found bool) error {
	var e *MyErr
	if !found {
		e = &MyErr{"не знайдено"}
	}
	return e
}

func findGood(found bool) error {
	if !found {
		return &MyErr{"не знайдено"}
	}
	return nil
}

func main() {
	fmt.Println("погано:", findBad(true) == nil)
	fmt.Println("добре:", findGood(true) == nil)
	fmt.Printf("%T\n", findBad(true))
}
`,
      String.raw`// аварія: Error() читає поле через nil-вказівник, захований в error
package main

import "fmt"

type MyErr struct{ Msg string }

func (e *MyErr) Error() string { return e.Msg }

func find() error {
	var e *MyErr
	return e
}

func main() {
	err := find()
	if err != nil {
		fmt.Println("нібито помилка")
		fmt.Println(err.Error())
	}
}
`,
    ],
    note: "Власна помилка — тип із методом Error() string; зазвичай структура, а повертаємо вказівник. Дані беремо з полів, а не з тексту. Ніколи не повертайте змінну типу *MyErr як error: щасливий шлях завершуйте літеральним return nil.",
    work: "У реальних проєктах власні помилки з'являються там, де викликач має різну реакцію: ValidationError перетворюється на відповідь 400, NotFoundError на 404, а помилка з полем RetryAfter підказує, коли повторити запит. Стандартна бібліотека робить так само, наприклад з *fs.PathError.",
    tasks: [
      "Чому функція, що повертає error і завершується return e, де e має тип *MyErr і дорівнює nil, дає err != nil?",
      "Навіщо в ValidationError окремі поля Field і Reason, якщо їх можна було б просто вписати в текст помилки?",
    ],
  },
  {
    t: "Обгортання помилок: %w, errors.Is і errors.As",
    ch: "Помилки",
    easy: "Обгортання — це матрьошка: ви кладете помилку всередину нової, з поясненням «що я робив, коли це сталося». Зовні видно історію, а всередині досі лежить оригінал, який можна дістати й упізнати.",
    p: [
      "Помилка <code>open x.json: no such file</code> без контексту майже марна: який саме файл і навіщо його відкривали? Тому на кожному рівні програми до помилки додають пояснення: «завантаження профілю 42: читання кешу: open x.json: no such file». Але якщо просто склеїти текст (через <code>%v</code> чи <code>+</code>), оригінал зникає: лишається рядок, і викликач уже не може спитати «чи це була помилка «не знайдено»?». Потрібен спосіб додати контекст і <b>зберегти причину</b>. Це і є обгортання.",
      "Модель у голові: <b>ланцюжок</b>. Виклик <code>fmt.Errorf(\"завантаження профілю %d: %w\", id, err)</code> із дієсловом <code>%w</code> (wrap) повертає нову помилку, яка пам'ятає внутрішню й має метод <code>Unwrap() error</code>, що віддає її назад. Текст зовнішньої помилки складається з вашого контексту й тексту внутрішньої, тож у виводі видно всю історію. А от <code>%v</code> лише підставляє текст, і ланцюжок обривається. Запам'ятайте різницю: <code>%w</code> — «ось причина, її можна шукати», <code>%v</code> — «ось просто текст».",
      "Тепер як шукати в ланцюжку. <code>errors.Is(err, target)</code> іде по ланках зовні всередину й питає кожну: «ти дорівнюєш <code>target</code>?». Саме тому порівняння <code>err == ErrNotFound</code> після обгортання перестає працювати (зовнішня помилка вже інша), а <code>errors.Is(err, ErrNotFound)</code> працює. Тут <code>ErrNotFound</code> — помилка, оголошена на рівні пакета (<code>var ErrNotFound = errors.New(\"не знайдено\")</code>), якою можна позначати певну ситуацію; докладніше про такі значення в наступному уроці.",
      "<code>errors.As(err, &target)</code> робить подібне, але шукає за <b>типом</b> і ще й дає доступ до даних. Ви оголошуєте змінну потрібного типу (<code>var ve *ValidationError</code>), передаєте <b>її адресу</b>, і якщо в ланцюжку є помилка цього типу, <code>As</code> кладе її у змінну й поверне <code>true</code>. Це продовження уроку про власні типи: на відміну від прямого <code>err.(*ValidationError)</code>, який бачить лише верхню ланку, <code>As</code> проходить усі шари обгорток. Зверніть увагу на два рівні вказівників: змінна має тип <code>*ValidationError</code>, а в <code>As</code> передаємо <code>&amp;ve</code>.",
      "Свій тип помилки теж може брати участь у ланцюжку: достатньо поля з внутрішньою помилкою й методу <code>Unwrap() error</code>, який її повертає. Так роблять <code>*fs.PathError</code>, <code>*strconv.NumError</code> та інші: коли ви обгортаєте їх, <code>errors.Is(err, fs.ErrNotExist)</code> усе одно знаходить причину. Функція <code>errors.Unwrap(err)</code> просто робить один крок вглиб, але напряму вона потрібна рідко: майже завжди достатньо <code>Is</code> і <code>As</code>.",
      "Пастки. Перша: <code>%v</code> замість <code>%w</code>: текст гарний, а <code>errors.Is</code> повертає <code>false</code>. Друга: <code>==</code> чи <code>err.(*T)</code> після обгортання, що не бачать глибші ланки. Третя: <code>errors.As</code> із неправильним другим аргументом (не вказівник або <code>nil</code>) завершується panic з текстом <code>errors: target must be a non-nil pointer</code>; <code>go vet</code> ловить таке заздалегідь. Четверта, концептуальна: <code>%w</code> робить внутрішню помилку частиною вашого API, бо викликачі можуть її розпізнавати. Якщо не хочете цього зобов'язання (наприклад, не бажаєте світити помилку драйвера БД), використайте <code>%v</code> свідомо.",
      "Ідіома: контекст описує, що намагалася зробити <i>ця</i> функція («читання конфігурації %q»), без слів «помилка» чи «не вдалося» і без повторення того, що вже сказала внутрішня помилка. Далі: як обробляти кілька помилок одночасно й коли вибирати значення, а коли тип.",
    ],
    code: [
      String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("не знайдено")

func loadUser(id int) error {
	return fmt.Errorf("користувач %d: %w", id, ErrNotFound)
}

func main() {
	err := loadUser(7)
	fmt.Println(err)
	fmt.Println(err == ErrNotFound, errors.Is(err, ErrNotFound))

	plain := fmt.Errorf("користувач %d: %v", 7, ErrNotFound)
	fmt.Println(errors.Is(plain, ErrNotFound))
	fmt.Println(errors.Unwrap(err) == ErrNotFound)
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

type ValidationError struct{ Field string }

func (e *ValidationError) Error() string { return "невалідне поле " + e.Field }

func validate() error { return &ValidationError{"email"} }

func register() error {
	if err := validate(); err != nil {
		return fmt.Errorf("реєстрація: %w", err)
	}
	return nil
}

func main() {
	err := register()
	fmt.Println(err)

	_, ok := err.(*ValidationError)
	fmt.Println("пряме твердження:", ok)

	var ve *ValidationError
	if errors.As(err, &ve) {
		fmt.Println("errors.As знайшов поле:", ve.Field)
	}
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrTimeout = errors.New("тайм-аут")

type QueryError struct {
	Query string
	Err   error
}

func (e *QueryError) Error() string { return "запит " + e.Query + ": " + e.Err.Error() }
func (e *QueryError) Unwrap() error { return e.Err }

func main() {
	err := fmt.Errorf("звіт: %w", &QueryError{"SELECT 1", ErrTimeout})
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrTimeout))

	var qe *QueryError
	found := errors.As(err, &qe)
	fmt.Println(found, qe.Query)
}
`,
      String.raw`// аварія: другим аргументом errors.As має бути адреса змінної (&ve), а не сама змінна
package main

import (
	"errors"
	"fmt"
)

type ValidationError struct{ Field string }

func (e *ValidationError) Error() string { return "невалідне поле " + e.Field }

func main() {
	err := fmt.Errorf("реєстрація: %w", &ValidationError{"email"})
	var ve *ValidationError
	fmt.Println(errors.As(err, ve))
}
`,
    ],
    note: "%w обгортає й зберігає причину, %v лише копіює текст. Для значень: errors.Is(err, ErrX). Для типів: var t *T; errors.As(err, &t). Не порівнюйте err == ErrX і не робіть err.(*T) на обгорнутих помилках.",
    work: "Це основа обробки помилок у сервісах: нижні шари додають контекст через %w, а верхній (обробник запиту) через errors.Is і errors.As вирішує, що відповісти клієнтові: 404, 400 чи 500. Те саме з помилками стандартної бібліотеки: errors.Is(err, fs.ErrNotExist) працює крізь будь-яку кількість обгорток.",
    tasks: [
      "Чому після err = fmt.Errorf(\"ctx: %w\", ErrX) умова err == ErrX хибна, а errors.Is(err, ErrX) істинна?",
      "У чому різниця між err.(*ValidationError) і errors.As(err, &ve) для обгорнутої помилки?",
    ],
  },
  {
    t: "errors.Join і сентинел-помилки",
    ch: "Помилки",
    adv: true,
    easy: "Сентинел — це постійний «знак» на дорозі: помилка-значення, за якою код упізнає ситуацію («не знайдено», «вже існує»). А errors.Join — це кошик, у який збирають кілька помилок і повертають одним значенням.",
    p: [
      "Дві різні потреби. Перша: <b>кілька помилок водночас</b>. Валідація форми, де невалідні три поля; закриття кількох ресурсів, де збоїть і перше, і друге; обробка пачки елементів. Якщо повернути лише першу помилку, користувач виправлятиме форму по одній і лаятиметься. Друга потреба: розпізнавати типові ситуації («не знайдено», «вже існує», «кінець даних») без створення нового типу для кожної. Для першої є <code>errors.Join</code>, для другої сентинел-помилки.",
      "<code>errors.Join(errs...)</code> приймає будь-яку кількість помилок і повертає одну. Усі <code>nil</code> відкидаються, а якщо вхід порожній чи складається лише з <code>nil</code>, результат дорівнює <code>nil</code>. Текст об'єднаної помилки: тексти складових, кожен з нового рядка. Модель у голові змінюється з ланцюжка на <b>дерево</b>: <code>errors.Is</code> і <code>errors.As</code> обходять усі гілки. Типова ідіома: накопичувати <code>var errs []error</code>, у кінці <code>return errors.Join(errs...)</code>. Порожній слайс автоматично дає чистий <code>nil</code>, без жодної nil-пастки з минулого уроку. Подібне дерево дає й <code>fmt.Errorf</code> з кількома <code>%w</code> (Go 1.20+), але <code>Join</code> зручніший, коли кількість помилок наперед невідома.",
      "Сентинел (від англ. «вартовий») — це готова помилка, яку оголошують на рівні пакета: <code>var ErrNotFound = errors.New(\"не знайдено\")</code>. Функції повертають її прямо або обгорнуту, а викликачі розпізнають через <code>errors.Is(err, ErrNotFound)</code>. У стандартній бібліотеці їх повно: <code>io.EOF</code>, <code>os.ErrNotExist</code>, <code>sql.ErrNoRows</code>. Іменування: префікс <code>Err</code> для експортованих. Сентинел є <b>частиною публічного API</b>: коли ви його експортували, інші пишуть на нього код, тож змінити його означає зламати їх.",
      "Як вибрати між сентинелом і власним типом? Питання одне: <b>чи потрібні викликачу дані</b>. Якщо досить знати «що сталося» («не знайдено», «вже існує»), беріть сентинел: це дешево й просто. Якщо треба витягти значення (яке поле, який код, скільки чекати), потрібен тип. Контекст, що відрізняється від виклику до виклику (наприклад, ключ), у сентинел не вшивають: його додають обгорткою <code>fmt.Errorf(\"ключ %q: %w\", k, ErrNotFound)</code>, і сентинел лишається постійним. Є і третій варіант: не експортувати нічого. Якщо ніхто не має розрізняти цю помилку, достатньо звичайного <code>fmt.Errorf</code>: кожна експортована помилка — це зобов'язання на роки.",
      "Приклади нижче по сходинках: спочатку валідація з <code>Join</code>, потім маленьке сховище з двома сентинелами, потім дерево з <code>Join</code>, де <code>Is</code> і <code>As</code> знаходять складові з різних гілок. Зверніть увагу, як <code>switch { case errors.Is(err, ErrNotFound): ... }</code> читається майже як опис правил: це типовий вигляд обробника.",
      "Пастки. Перша: <code>err == ErrNotFound</code> без <code>errors.Is</code> ламається при першій же обгортці. Друга: <code>errors.Join</code> від <i>однієї</i> помилки все одно створює нову обгортку, тому <code>errors.Join(e) == e</code> дає <code>false</code> (а <code>Is</code> працює). Третя: сентинел із даними у тексті (<code>errors.New(fmt.Sprintf(\"id %d не знайдено\", id))</code> на кожен виклик) не можна розпізнати: це знову нова помилка щоразу. Створіть обгортку над постійним сентинелом або тип. Четверта: <code>Join</code> не додає контексту сам по собі, тож за потреби поєднуйте його з <code>fmt.Errorf</code>.",
      "Ідіома: <code>Join</code> особливо корисний, коли треба не втратити другу помилку, наприклад «обробка не вдалась» і «закриття теж не вдалось». Як саме поєднувати це з <code>defer</code>, побачимо в наступному уроці.",
    ],
    code: [
      String.raw`package main

import (
	"errors"
	"fmt"
)

func validate(name string, age int) error {
	var errs []error
	if name == "" {
		errs = append(errs, errors.New("ім'я порожнє"))
	}
	if age < 0 || age > 150 {
		errs = append(errs, fmt.Errorf("вік %d поза межами", age))
	}
	return errors.Join(errs...)
}

func main() {
	fmt.Println(validate("Ада", 36) == nil)
	fmt.Println(validate("", 200))
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

var (
	ErrNotFound = errors.New("не знайдено")
	ErrExists   = errors.New("вже існує")
)

type Store struct{ items map[string]int }

func (s *Store) Get(k string) (int, error) {
	v, ok := s.items[k]
	if !ok {
		return 0, fmt.Errorf("ключ %q: %w", k, ErrNotFound)
	}
	return v, nil
}

func (s *Store) Add(k string, v int) error {
	if _, ok := s.items[k]; ok {
		return fmt.Errorf("ключ %q: %w", k, ErrExists)
	}
	s.items[k] = v
	return nil
}

func main() {
	s := &Store{items: map[string]int{}}
	fmt.Println(s.Add("a", 1))
	err := s.Add("a", 2)
	fmt.Println(err, errors.Is(err, ErrExists), errors.Is(err, ErrNotFound))

	_, err = s.Get("b")
	switch {
	case errors.Is(err, ErrNotFound):
		fmt.Println("створюємо ключ b:", err)
	case err != nil:
		fmt.Println("інша помилка:", err)
	}
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrTimeout = errors.New("тайм-аут")

type CodeError struct{ Code int }

func (e *CodeError) Error() string { return fmt.Sprintf("код %d", e.Code) }

func main() {
	err := errors.Join(fmt.Errorf("запис: %w", ErrTimeout), &CodeError{500})
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrTimeout))

	var ce *CodeError
	if errors.As(err, &ce) {
		fmt.Println("знайдено код", ce.Code)
	}

	e1 := errors.New("одна")
	j := errors.Join(e1)
	fmt.Println(j == e1, errors.Is(j, e1))
	fmt.Println(errors.Join(nil, nil) == nil)
}
`,
    ],
    note: "errors.Join збирає кілька помилок в одну (дерево для Is і As); порожній набір дає nil. Сентинел: var ErrX = errors.New(...), розпізнається через errors.Is. Потрібні дані викликачу: тип. Лише факт: сентинел.",
    work: "Join використовують у валідації (повернути всі недоліки форми одразу), у закритті ресурсів і в пакетній обробці. Сентинели бачите всюди: io.EOF у циклах читання, sql.ErrNoRows у репозиторіях, власні ErrNotFound чи ErrConflict, які обробник перетворює на HTTP-статуси.",
    tasks: [
      "Коли для розпізнавання помилки краще сентинел, а коли власний тип?",
      "Чому errors.Join(errs...) зручно повертати зі слайса errs, навіть коли помилок не було?",
    ],
  },
  {
    t: "defer",
    ch: "Помилки",
    easy: "defer — це записка «не забудь прибрати», яку ви лишаєте собі одразу після того, як щось відкрили. Що б не сталося далі, перед виходом із функції всі записки виконаються, починаючи з останньої.",
    p: [
      "Ви відкрили файл, з'єднання чи захопили блокування. Тепер його треба звільнити на <b>кожному</b> шляху виходу з функції: у кінці, після раннього <code>return</code> при помилці, після ще одного <code>return</code> у середині. Якщо писати <code>Close()</code> перед кожним виходом, їх легко забути чи розсинхронізувати при правках. Оператор <code>defer</code> розв'язує це: ви ставите прибирання <i>поруч із відкриттям</i>, і Go сам виконає його, коли функція завершиться.",
      "Модель у голові: у кожного виклику функції є <b>стек відкладених викликів</b>. Рядок <code>defer f(x)</code> кладе виклик у цей стек, а коли функція завершується (через <code>return</code>, кінець тіла чи panic), Go виймає виклики з вершини стека по одному. Тому порядок <b>LIFO</b>: останній відкладений виконується першим. Це природно для ресурсів: відкрили A, потім B, а закриваємо B, потім A. Перший приклад нижче друкує «третій, другий, перший», хоча defer записані в порядку «перший, другий, третій».",
      "Тонкість номер один: <b>аргументи відкладеного виклику обчислюються одразу</b>, у момент рядка <code>defer</code>, а не при виконанні. Після <code>x := 1; defer fmt.Println(x); x = 2</code> надрукується 1. Якщо ж вам потрібне актуальне значення на момент виходу, відкладайте замикання: <code>defer func() { fmt.Println(x) }()</code> прочитає <code>x</code> уже під час виконання й побачить 2. Ці два варіанти ви зустрінете в реальному коді постійно, тож варто запам'ятати різницю.",
      "Ідіома для ресурсів: <code>f, err := os.Open(name); if err != nil { return err }; defer f.Close()</code>. Зверніть увагу на порядок: <code>defer</code> ставимо <b>після</b> перевірки помилки, бо при невдачі <code>f</code> може бути <code>nil</code>, і закривати нічого. Так само працюють розблокування (<code>mu.Unlock()</code>, про це в главі про конкурентність), закриття відповідей мережі, відкат транзакції. Файлів у Playground немає, тому в прикладах роль ресурсу грає власний тип із методом <code>Close</code>, що друкує повідомлення.",
      "Пастка номер один: <b>defer у циклі</b>. Відкладений виклик виконується при виході з <i>функції</i>, а не з ітерації. Якщо в циклі по тисячі файлів писати <code>defer f.Close()</code>, усі тисяча лишаться відкритими до кінця функції, і ви вичерпаєте ліміт дескрипторів. Рішення: винести тіло ітерації в окрему функцію (або викликати анонімну <code>func() { ... }()</code> прямо в циклі), щоб <code>defer</code> спрацьовував наприкінці кожної ітерації. Другий приклад показує обидва варіанти поруч.",
      "Тонкість номер два: <b>відкладені функції можуть змінювати іменовані результати</b>. Порядок такий: <code>return x</code> спершу присвоює значення результатам, потім виконуються defer, і лише тоді функція повертає управління. Тому <code>func double() (n int) { defer func() { n *= 2 }(); return 5 }</code> поверне 10. Це дозволяє, наприклад, додати контекст до помилки в одному місці (<code>if err != nil { err = fmt.Errorf(\"збереження: %w\", err) }</code>) або не втратити помилку закриття файлу при записі. Лишайте такі прийоми для справді доречних випадків: читабельність важливіша за хитрість.",
      "Ще пастки. <code>os.Exit</code> і <code>log.Fatal</code> завершують програму негайно, і відкладені виклики <b>не виконуються</b>. Вартість <code>defer</code> у сучасних версіях Go (з 1.14) мізерна, тож економити на ньому не треба. Далі: що робить Go, коли помилка настільки серйозна, що продовжувати нема сенсу, і як defer допомагає цю ситуацію перехопити.",
    ],
    code: [
      String.raw`package main

import "fmt"

func main() {
	fmt.Println("початок")
	defer fmt.Println("перший")
	defer fmt.Println("другий")
	defer fmt.Println("третій")

	x := 1
	defer fmt.Println("аргумент зафіксовано:", x)
	defer func() { fmt.Println("замикання бачить:", x) }()
	x = 2
	fmt.Println("кінець main, x =", x)
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

type Conn struct{ name string }

func Open(name string) (*Conn, error) {
	if name == "" {
		return nil, errors.New("порожнє ім'я")
	}
	fmt.Println("відкрито", name)
	return &Conn{name}, nil
}

func (c *Conn) Close() error {
	fmt.Println("закрито", c.name)
	return nil
}

func work(name string, fail bool) error {
	c, err := Open(name)
	if err != nil {
		return err
	}
	defer c.Close()
	if fail {
		return errors.New("збій роботи")
	}
	fmt.Println("працюємо з", c.name)
	return nil
}

func main() {
	fmt.Println(work("db", false))
	fmt.Println(work("cache", true))
	fmt.Println(work("", false))
}
`,
      String.raw`package main

import "fmt"

func loopBad() {
	for i := 1; i <= 3; i++ {
		defer fmt.Println("закрито", i)
		fmt.Println("відкрито", i)
	}
	fmt.Println("цикл завершено")
}

func loopGood() {
	for i := 1; i <= 3; i++ {
		func() {
			defer fmt.Println("закрито", i)
			fmt.Println("відкрито", i)
		}()
	}
	fmt.Println("цикл завершено")
}

func main() {
	fmt.Println("--- defer у циклі")
	loopBad()
	fmt.Println("--- defer в окремій функції")
	loopGood()
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

func double() (n int) {
	defer func() { n *= 2 }()
	return 5
}

func save(fail bool) (err error) {
	defer func() {
		if err != nil {
			err = fmt.Errorf("збереження: %w", err)
		}
	}()
	if fail {
		return errors.New("диск повний")
	}
	return nil
}

func main() {
	fmt.Println(double())
	fmt.Println(save(false))
	fmt.Println(save(true))
}
`,
    ],
    note: "defer відкладає виклик до виходу з функції; порядок LIFO; аргументи обчислюються одразу, замикання бачить актуальні значення. Ставте defer одразу після успішного відкриття. У циклі виносьте тіло в окрему функцію. defer може змінити іменований результат.",
    work: "defer — щоденний інструмент: закриття файлів і HTTP-відповідей, розблокування mutex, відкат транзакції в базі, зупинка таймера, запис «завершено» в лог із тривалістю. Читаючи чужий код, шукайте defer одразу після Open чи Lock: так видно, що ресурс не протече.",
    tasks: [
      "У якому порядку виконаються три defer і чому для ресурсів саме такий порядок підходить?",
      "Що надрукує x := 1; defer fmt.Println(x); x = 2, і як змінити код, щоб надрукувалось 2?",
    ],
  },
  {
    t: "panic і recover",
    ch: "Помилки",
    easy: "panic — це аварійна кнопка: «далі так працювати не можна». Програма негайно починає виходити з усіх функцій, виконуючи по дорозі defer. recover — страхувальна сітка, яку можна розкласти в defer, щоб зупинити падіння.",
    p: [
      "Є два види негараздів. Очікувані (файлу немає, ввід неправильний) оформлюються як <code>error</code>, і про них ви вже знаєте. Але є й такі, яким «просто не слід траплятися»: звернення за межі слайса, виклик методу через <code>nil</code>-вказівник, запис у <code>nil</code>-мапу, неможливий стан, що свідчить про помилку програміста. Для них у Go є <code>panic</code>: аварійна зупинка поточного потоку виконання.",
      "Модель у голові. Коли відбувається panic, звичайне виконання припиняється, і Go починає <b>розкручувати стек</b>: виходить із поточної функції, виконуючи її відкладені виклики (<code>defer</code>), потім із функції, що її викликала, і так далі. Якщо ніхто не зупинив падіння, програма друкує <code>panic: ...</code> разом із трасою стека й завершується з кодом 2. Зверніть увагу: defer виконуються й під час panic, саме тому вони підходять і для прибирання, і для перехоплення.",
      "Звідки береться panic? Із <b>runtime-помилок</b> самого Go: <code>index out of range [5] with length 3</code>, <code>invalid memory address or nil pointer dereference</code>, <code>integer divide by zero</code>, <code>assignment to entry in nil map</code>, твердження типу без <code>ok</code> на неправильному типі. А ще ви можете викликати її самі: <code>panic(\"текст\")</code> чи <code>panic(err)</code>, значення може бути будь-якого типу. Runtime-паніки несуть значення типу <code>runtime.Error</code>, який також є <code>error</code>, тож його можна вивести через <code>%v</code>.",
      "<code>recover()</code> — вбудована функція, яка <b>зупиняє розкручування</b> й повертає значення, передане в <code>panic</code> (або <code>nil</code>, якщо паніки немає). Є жорстка умова: вона працює лише тоді, коли викликана <b>безпосередньо у відкладеній функції</b>. Поза <code>defer</code> чи в допоміжній функції, яку викликає defer-замикання, <code>recover</code> просто повертає <code>nil</code> і нічого не зупиняє. Після успішного <code>recover</code> функція, у якій стояв <code>defer</code>, завершується нормально й повертає поточні значення іменованих результатів.",
      "Звідси головна ідіома: <b>перетворення panic на error</b> на межі, де падіння одного шматка не повинне вбити решту. Функція з іменованим результатом <code>err</code> має <code>defer func() { if r := recover(); r != nil { err = fmt.Errorf(\"перехоплено: %v\", r) } }()</code>. Так HTTP-сервер захищає себе: панік в одному обробнику перетворюється на відповідь 500, а не на падіння всього процесу; так <code>encoding/json</code> усередині користується panic для швидкого виходу з глибокої рекурсії, але назовні віддає звичайний <code>error</code>. Правило бібліотек: <b>panic не перетинає межу пакета</b>.",
      "Коли panic доречний? Для помилок програміста й неможливих станів (<code>default: panic(\"unreachable\")</code>), для ініціалізації при старті, коли без ресурсу програма жити не може (<code>regexp.MustCompile</code>, <code>template.Must</code>: префікс <code>Must</code> означає «паніка замість помилки», доречно для літералів, які ви самі написали), для неправильного використання API. Не доречний для звичайних збоїв: «файл не знайдено» чи «ввід неправильний» — це <code>error</code>. Якщо ви ловите panic, а причина не ваша, краще викликати <code>panic(r)</code> ще раз, ніж мовчки проковтнути.",
      "Пастки. Перша: <code>recover</code> не в тому місці (дивіться останній приклад: програма все одно падає). Друга: проковтування: порожній <code>recover()</code> ховає справжній баг, тож принаймні логуйте значення й трасу (<code>debug.Stack()</code>). Третя: <code>recover</code> не ловить фатальні помилки runtime, як-от вичерпання пам'яті чи <code>fatal error: all goroutines are asleep - deadlock!</code> (до цього дійдемо в главі про горутини). Четверта: <code>os.Exit</code> не є panic, його не перехопити. Далі: як скласти правила обробки помилок у цілому застосунку.",
    ],
    code: [
      String.raw`package main

import "fmt"

func try(name string, f func()) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("%s: перехоплено: %v\n", name, r)
		}
	}()
	f()
	fmt.Println(name + ": без аварії")
}

func main() {
	try("ділення", func() { a, b := 1, 0; fmt.Println(a / b) })
	try("індекс", func() { s := []int{1, 2, 3}; i := 5; fmt.Println(s[i]) })
	try("мапа", func() { var m map[string]int; m["a"] = 1 })
	try("своя", func() { panic("щось пішло не так") })
	try("нормально", func() {})
}
`,
      String.raw`package main

import "fmt"

func safeDivide(a, b int) (res int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("divide(%d, %d): %v", a, b, r)
		}
	}()
	return a / b, nil
}

func main() {
	fmt.Println(safeDivide(10, 2))
	fmt.Println(safeDivide(1, 0))
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

type appError struct{ msg string }

func guarded(f func()) (err error) {
	defer func() {
		r := recover()
		if r == nil {
			return
		}
		if ae, ok := r.(appError); ok {
			err = errors.New(ae.msg)
			return
		}
		panic(r)
	}()
	f()
	return nil
}

func main() {
	defer func() { fmt.Println("зовнішній recover:", recover()) }()
	fmt.Println(guarded(func() { panic(appError{"власна помилка"}) }))
	fmt.Println(guarded(func() {}))
	guarded(func() { var p *int; fmt.Println(*p) })
	fmt.Println("сюди не дійдемо")
}
`,
      String.raw`// аварія: recover викликано не безпосередньо у відкладеній функції, тому він нічого не зупиняє
package main

import "fmt"

func handle() {
	if r := recover(); r != nil {
		fmt.Println("перехоплено:", r)
	}
}

func main() {
	defer fmt.Println("defer усе одно виконується")
	defer func() { handle() }()
	panic("збій")
}
`,
    ],
    note: "panic розкручує стек, виконуючи defer; recover працює лише безпосередньо в defer-функції. Типова ідіома: перетворити panic на error на межі. Для звичайних збоїв використовуйте error, panic лише для помилок програміста й ініціалізації.",
    work: "Ви рідко пишете panic самі, зате часто покладаєтесь на recover у чужому коді: HTTP-сервер перехоплює panic в обробнику, щоб один поганий запит не зупинив усі, а middleware логує трасу й повертає 500. Конструкції MustCompile і Must бачите в ініціалізації пакетів.",
    tasks: [
      "Чому recover(), викликаний у функції handle(), яку викликає defer func() { handle() }(), не зупиняє panic?",
      "Коли доречно використати panic замість повернення error, а коли ні? Наведіть по одному прикладу.",
    ],
  },
  {
    t: "Стратегії обробки помилок",
    ch: "Помилки",
    adv: true,
    easy: "Створити помилку — півсправи. Важливо вирішити, хто і що з нею робить: нижні шари додають пояснення й передають вгору, а один відповідальний нагорі вирішує, що сказати користувачеві й що записати в лог.",
    p: [
      "Ви вже вмієте створювати, обгортати й розпізнавати помилки. Лишилося питання, що з ними робити в цілому застосунку. Без домовленості виходить типовий безлад: одна й та сама помилка записана в лог п'ять разів (на кожному рівні), десь її мовчки проковтнули, а користувач побачив сирий текст з бази даних. Стратегія — це кілька простих правил, що роблять обробку передбачуваною.",
      "Головне правило: <b>кожну помилку обробляють рівно один раз</b>. Обробка — це або (1) повернути вгору, додавши контекст, або (2) завершити її розповсюдження: залогувати чи показати користувачеві, або (3) відновитися (повторити спробу, взяти запасне значення). Анти-шаблон «залогував і повернув» робить обидва кроки: у логах з'являються дублікати однієї проблеми, і розібратися, скільки їх було насправді, неможливо. Тому нижні шари <b>повертають</b>, а логує той, хто приймає рішення: зазвичай верхній рівень (<code>main</code>, обробник запиту, воркер). Третій приклад показує різницю: «погано» дає три рядки логу для однієї події, «добре» один.",
      "Контекст. Кожен рівень, що повертає помилку вгору, додає через <code>%w</code> те, що робила <i>саме ця функція</i>, і ключові дані: <code>fmt.Errorf(\"оновлення профілю %d: %w\", id, err)</code>. У підсумку кінцевий текст читається як шлях: «оновлення профілю 42: читання з бази: тайм-аут». Не повторюйте те, що вже є всередині («не вдалося: не вдалося: ...»), не пишіть слів «помилка» чи «failed» у кожній ланці й не додавайте контекст, якого в цьому місці ще немає.",
      "<b>Межі шарів.</b> У типовому застосунку є шар зберігання (repository), бізнес-логіка (service) і транспорт (handler, про що детальніше в главі про архітектуру). Кожен шар має «свою мову» помилок. Репозиторій знає <code>sql.ErrNoRows</code>, сервіс говорить «користувача не знайдено», обробник — «статус 404». На межі шару помилку <b>перекладають</b>: сервіс розпізнає внутрішню помилку (<code>errors.Is</code>) і повертає доменну (<code>ErrUserNotFound</code>), обгорнуту контекстом. Так деталі реалізації (драйвер, текст SQL) не просочуються нагору, і заміна бази не зламає обробників. <b>Доменні помилки</b> оголошують там, де живе бізнес-логіка, як сентинели або типи, а обробник відображає їх у відповідь: <code>ErrNotFound</code> дає 404, <code>ErrInvalidID</code> дає 400, усе невідоме дає 500 з нейтральним текстом, а подробиці йдуть тільки в лог.",
      "<b>Повторні спроби.</b> Частину збоїв варто просто повторити: тайм-аут, відповідь 503, тимчасова втрата з'єднання. Але лише <i>тимчасові</i> помилки: повторювати невалідний ввід безглуздо. Позначити тимчасовість можна типом помилки (наприклад, <code>TransientError</code>), який перевіряють через <code>errors.As</code>. Правила: кількість спроб обмежена; між спробами пауза, що зростає (exponential backoff, зазвичай через <code>time.Sleep</code> або таймери, до яких дійдемо в главі про конкурентність); сама операція має бути безпечною для повтору (ідемпотентною); після вичерпання спроб повертають останню помилку з поясненням: <code>fmt.Errorf(\"після %d спроб: %w\", n, err)</code>. У прикладі нижче паузи прибрано, щоб вивід був миттєвим і детермінованим.",
      "Пастки. <b>Проковтнута помилка</b> (<code>_ = f()</code>, порожнє тіло <code>if err != nil {}</code>) найпідступніша: програма «працює», а дані тихо псуються. <b>Порівняння за текстом</b> (<code>strings.Contains(err.Error(), \"not found\")</code>) ламається при зміні формулювання: розпізнавайте через <code>Is</code> і <code>As</code>. <b>panic замість error</b> для звичайних збоїв. <b>Витік реалізації</b>: повернути клієнтові текст помилки драйвера БД. Забута помилка від <code>Close</code> при записі файлу, де вона може означати, що дані не збережені: тут допомагає іменований результат із минулих уроків.",
      "Короткий чеклист для кожної точки, де є <code>err != nil</code>: чи можу я впоратися сам (повторити, взяти запасний варіант)? Якщо ні, додаю контекст і повертаю. Це межа шару? Тоді перекладаю на «мову» цього шару. Це верх (<code>main</code>, обробник)? Тоді логую один раз і відповідаю користувачеві. Далі в курсі: конкурентність, де помилки доведеться передавати між горутинами, і правила стануть ще важливішими.",
    ],
    code: [
      String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("не знайдено")

var (
	errNoRows = errors.New("sql: no rows")
	errConn   = errors.New("з'єднання втрачено")
)

func repoFind(id int) (string, error) {
	switch id {
	case 1:
		return "Ада", nil
	case 3:
		return "", errConn
	}
	return "", errNoRows
}

func serviceUser(id int) (string, error) {
	name, err := repoFind(id)
	if errors.Is(err, errNoRows) {
		return "", fmt.Errorf("користувач %d: %w", id, ErrNotFound)
	}
	if err != nil {
		return "", fmt.Errorf("читання користувача %d: %w", id, err)
	}
	return name, nil
}

func handler(id int) string {
	name, err := serviceUser(id)
	switch {
	case err == nil:
		return "200 " + name
	case errors.Is(err, ErrNotFound):
		return "404 " + err.Error()
	default:
		fmt.Println("лог:", err)
		return "500 внутрішня помилка"
	}
}

func main() {
	for id := 1; id <= 3; id++ {
		fmt.Println(handler(id))
	}
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

type TransientError struct{ Err error }

func (e *TransientError) Error() string { return "тимчасова помилка: " + e.Err.Error() }
func (e *TransientError) Unwrap() error { return e.Err }

func retry(attempts int, op func(n int) error) error {
	var err error
	for n := 1; n <= attempts; n++ {
		err = op(n)
		if err == nil {
			return nil
		}
		var te *TransientError
		if !errors.As(err, &te) {
			return err
		}
		fmt.Println("спроба", n, "невдала, повторюємо")
	}
	return fmt.Errorf("після %d спроб: %w", attempts, err)
}

func main() {
	flaky := func(n int) error {
		if n < 3 {
			return &TransientError{errors.New("503")}
		}
		return nil
	}
	fmt.Println(retry(5, flaky))
	fmt.Println(retry(2, flaky))
	fmt.Println(retry(5, func(int) error { return errors.New("невалідний ввід") }))
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

func readDB() error { return errors.New("тайм-аут") }

func badLoad(id int) error {
	if err := readDB(); err != nil {
		fmt.Println("лог (рівень 1):", err)
		return err
	}
	return nil
}

func badUpdate(id int) error {
	if err := badLoad(id); err != nil {
		fmt.Println("лог (рівень 2):", err)
		return err
	}
	return nil
}

func goodLoad(id int) error {
	if err := readDB(); err != nil {
		return fmt.Errorf("профіль %d: %w", id, err)
	}
	return nil
}

func goodUpdate(id int) error {
	if err := goodLoad(id); err != nil {
		return fmt.Errorf("оновлення: %w", err)
	}
	return nil
}

func main() {
	if err := badUpdate(42); err != nil {
		fmt.Println("лог (рівень 3):", err)
	}
	fmt.Println("---")
	if err := goodUpdate(42); err != nil {
		fmt.Println("лог:", err)
	}
}
`,
    ],
    note: "Кожну помилку обробляйте один раз: або повертайте з контекстом (%w), або завершуйте (лог чи відповідь), але не обидва. На межі шарів перекладайте помилки на доменну мову. Повторюйте лише тимчасові збої, з обмеженням спроб.",
    work: "У справжньому сервісі це виглядає так: репозиторій повертає помилки бази, сервіс перетворює їх на доменні (ErrNotFound, ErrConflict), обробник через errors.Is обирає HTTP-статус і один раз пише в лог із ідентифікатором запиту. Така схема дозволяє змінити базу чи фреймворк, не переписуючи решту, і дає чисті логи.",
    tasks: [
      "Чому «залогувати помилку й повернути її» вважають анти-шаблоном і хто має логувати натомість?",
      "Навіщо на межі шару перекладати sql.ErrNoRows на власну доменну помилку, а не повертати її як є?",
    ],
  },
];
