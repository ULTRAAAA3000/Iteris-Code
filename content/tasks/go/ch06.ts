import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;
const BT = "`";

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "go-error-value", lesson: "go/52", xp: 20,
    title: "Розбір віку: помилка як значення",
    context: "Будь-який ввід користувача може бути сміттям. Функція, що повертає (результат, error), дозволяє викликачу самому вирішити, як реагувати: показати повідомлення, повторити запит або перервати роботу.",
    brief: [
      "Допишіть <code>parseAge(s string) (int, error)</code>: якщо рядок не є числом, поверніть помилку через <code>fmt.Errorf</code> з текстом <code>вік \"abc\": не число</code> (підставте сам рядок через <code>%q</code>).",
      "Якщо число поза межами 0..150, поверніть готову помилку <code>ErrAge</code>. Помилку від <code>strconv.Atoi</code> не ігноруйте.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
	"strconv"
)

var ErrAge = errors.New("вік поза межами 0..150")

func parseAge(s string) (int, error) {
	n, _ := strconv.Atoi(s)
	return n, nil
}

func main() {
	for _, s := range []string{"36", "abc", "-5", "200"} {
		age, err := parseAge(s)
		if err != nil {
			fmt.Println("помилка:", err)
			continue
		}
		fmt.Println("вік:", age)
	}
}
`,
    checks: [
      { on: "stdout", name: "Коректний вік проходить", has: "вік: 36" },
      { on: "stdout", name: "Нечислове значення дає помилку з контекстом", has: "помилка: вік \"abc\": не число", hint: "fmt.Errorf(\"вік %q: не число\", s)" },
      { on: "stdout", name: "Вік поза межами дає ErrAge", has: "помилка: вік поза межами 0..150", hint: "Поверніть 0, ErrAge, коли n < 0 або n > 150" },
      { on: "source", name: "Помилку Atoi перевірено", matches: "Atoi\\(\\w+\\)\\s*if\\s+err\\s*!=\\s*nil", hint: "n, err := strconv.Atoi(s); if err != nil { ... }" },
      { on: "source", name: "Помилку Atoi не ігноровано через _", matches: "\\w+\\s*,\\s*_\\s*:?=\\s*strconv\\.Atoi", not: true, hint: "Замініть _ на err і перевірте її" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "вік: 36\nпомилка: вік \"abc\": не число\nпомилка: вік поза межами 0..150\nпомилка: вік поза межами 0..150" },
    ],
  },
  {
    ...base, id: "go-custom-error", lesson: "go/53", xp: 25,
    title: "Помилка недостатніх коштів",
    context: "Коли викликачу треба не лише текст, а й дані про відмову (скільки не вистачає, який код), використовують власний тип помилки. Так працюють платіжні, валідаційні та мережеві бібліотеки.",
    brief: [
      "Реалізуйте для <code>*InsufficientFundsError</code> метод <code>Error()</code>: <code>недостатньо коштів: потрібно 100, є 50</code> (значення беріть з полів <code>Need</code> і <code>Have</code>).",
      "Допишіть <code>withdraw(balance, amount int) (int, error)</code>: якщо коштів мало, поверніть <code>&amp;InsufficientFundsError{...}</code>, інакше новий залишок і <code>nil</code>.",
    ],
    starter: raw`package main

import "fmt"

type InsufficientFundsError struct{ Need, Have int }

func (e *InsufficientFundsError) Error() string {
	return ""
}

func withdraw(balance, amount int) (int, error) {
	return balance - amount, nil
}

func main() {
	for _, amount := range []int{20, 100} {
		left, err := withdraw(50, amount)
		if err != nil {
			fmt.Println("помилка:", err)
			if fe, ok := err.(*InsufficientFundsError); ok {
				fmt.Println("не вистачає:", fe.Need-fe.Have)
			}
			continue
		}
		fmt.Println("залишок:", left)
	}
}
`,
    checks: [
      { on: "stdout", name: "Успішне зняття лишає 30", has: "залишок: 30" },
      { on: "stdout", name: "Текст власної помилки", has: "помилка: недостатньо коштів: потрібно 100, є 50", hint: "fmt.Sprintf з e.Need і e.Have" },
      { on: "stdout", name: "Поля помилки доступні викликачу", has: "не вистачає: 50", hint: "Поверніть &InsufficientFundsError{Need: amount, Have: balance}" },
      { on: "source", name: "Метод Error з отримувачем-вказівником", matches: "func\\s*\\(\\s*\\w+\\s+\\*InsufficientFundsError\\s*\\)\\s*Error\\(\\)\\s*string" },
      { on: "source", name: "Повертається вказівник на структуру", matches: "&InsufficientFundsError\\{", hint: "Покладіть у результат error вказівник, а не значення" },
    ],
  },
  {
    ...base, id: "go-wrap-errors", lesson: "go/54", xp: 30,
    title: "Конфіг: обгортання без втрати причини",
    context: "Нижні шари додають контекст, а верхній за допомогою errors.Is і errors.As вирішує, що робити. Якщо при обгортанні втратити причину, обробник бачить лише рядок і не може відрізнити «не знайдено» від «синтаксичної помилки».",
    brief: [
      "Функція <code>loadConfig</code> додає контекст, але використовує <code>%v</code>, тому <code>errors.Is</code> і <code>errors.As</code> у <code>main</code> нічого не знаходять. Виправте обгортання так, щоб причина зберігалась.",
      "Нічого іншого змінювати не треба: після виправлення <code>main</code> має розпізнати і сентинел <code>ErrNotFound</code>, і тип <code>*ParseError</code> з номером рядка.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("не знайдено")

type ParseError struct{ Line int }

func (e *ParseError) Error() string {
	return fmt.Sprintf("синтаксис у рядку %d", e.Line)
}

func load(name string) error {
	switch name {
	case "missing":
		return ErrNotFound
	case "broken":
		return &ParseError{Line: 3}
	}
	return nil
}

func loadConfig(name string) error {
	if err := load(name); err != nil {
		return fmt.Errorf("конфіг %q: %v", name, err)
	}
	return nil
}

func main() {
	for _, name := range []string{"ok", "missing", "broken"} {
		err := loadConfig(name)
		var pe *ParseError
		switch {
		case err == nil:
			fmt.Println(name, "- ok")
		case errors.Is(err, ErrNotFound):
			fmt.Println(name, "- немає файлу:", err)
		case errors.As(err, &pe):
			fmt.Println(name, "- помилка в рядку", pe.Line, "-", err)
		default:
			fmt.Println(name, "- інше:", err)
		}
	}
}
`,
    checks: [
      { on: "stdout", name: "Успішний випадок", has: "ok - ok" },
      { on: "stdout", name: "errors.Is знаходить ErrNotFound крізь обгортку", has: "missing - немає файлу: конфіг \"missing\": не знайдено", hint: "Дієслово для обгортання: %w" },
      { on: "stdout", name: "errors.As знаходить *ParseError і його поле Line", has: "broken - помилка в рядку 3 - конфіг \"broken\": синтаксис у рядку 3" },
      { on: "source", name: "Використано %w", matches: "Errorf\\([^)]*%w", hint: "fmt.Errorf(\"...: %w\", ..., err)" },
      { on: "source", name: "Контекст не обриває ланцюжок через %v", matches: "Errorf\\([^)]*%v", not: true },
    ],
  },
  {
    ...base, id: "go-join-sentinel", lesson: "go/55", xp: 30,
    title: "Валідація користувача: усі помилки одразу",
    context: "Форма реєстрації, що показує лише першу помилку, дратує користувачів. Збираючи всі недоліки через errors.Join і позначаючи їх сентинелами, ви даєте і повний звіт, і змогу коду розпізнати кожну проблему.",
    brief: [
      "Допишіть <code>validateUser(u User) error</code>: за кожну проблему додайте відповідний сентинел (<code>ErrNoName</code>, <code>ErrBadAge</code>, <code>ErrNoEmail</code>) у слайс <code>[]error</code>.",
      "Поверніть <code>errors.Join(errs...)</code>: для коректного користувача це має бути <code>nil</code>. Вік коректний у межах 0..150, email має містити <code>@</code>.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
	"strings"
)

var (
	ErrNoName  = errors.New("ім'я порожнє")
	ErrBadAge  = errors.New("вік поза межами 0..150")
	ErrNoEmail = errors.New("email без @")
)

type User struct {
	Name  string
	Age   int
	Email string
}

func validateUser(u User) error {
	_ = strings.Contains
	return nil
}

func main() {
	users := []User{{"Ада", 36, "ada@x.io"}, {"", 200, "bad"}, {"Лін", -1, "lin@x.io"}}
	for i, u := range users {
		err := validateUser(u)
		if err == nil {
			fmt.Printf("користувач %d: ок\n", i)
			continue
		}
		fmt.Printf("користувач %d:\n%v\n", i, err)
		fmt.Println("ім'я:", errors.Is(err, ErrNoName), "вік:", errors.Is(err, ErrBadAge), "email:", errors.Is(err, ErrNoEmail))
	}
}
`,
    checks: [
      { on: "stdout", name: "Коректний користувач проходить (nil)", has: "користувач 0: ок" },
      { on: "stdout", name: "Три помилки зібрано в одну", has: "користувач 1:\nім'я порожнє\nвік поза межами 0..150\nemail без @\nім'я: true вік: true email: true", hint: "Для кожної проблеми зробіть errs = append(errs, ErrXxx)" },
      { on: "stdout", name: "errors.Is розрізняє окрему помилку", has: "користувач 2:\nвік поза межами 0..150\nім'я: false вік: true email: false" },
      { on: "source", name: "Використано errors.Join", matches: "errors\\.Join\\(\\s*errs\\.\\.\\.\\s*\\)", hint: "return errors.Join(errs...)" },
      { on: "source", name: "Помилки накопичуються в слайсі", matches: "append\\(\\s*errs\\s*,", hint: "var errs []error" },
    ],
  },
  {
    ...base, id: "go-errors-defer", lesson: "go/56", xp: 35,
    title: "Ресурс, що завжди закривається",
    context: "Ресурс (файл, з'єднання, блокування) потрібно звільнити на будь-якому шляху виходу: і при успіху, і при помилці. defer ставить прибирання поруч із відкриттям, а зміна іменованого результату дозволяє додати контекст до помилки в одному місці.",
    brief: [
      "У <code>process</code> закриття відбувається лише на щасливому шляху, тому при <code>fail</code> з'єднання лишається відкритим. Замініть явний <code>c.Close()</code> на <code>defer c.Close()</code> одразу після відкриття.",
      "Додайте ще один <code>defer</code> із замиканням, яке змінює іменований результат <code>err</code>: якщо помилка є, обгорніть її через <code>fmt.Errorf(\"обробка %q: %w\", name, err)</code>.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

var ErrBroken = errors.New("збій")

type Conn struct{ Name string }

func Open(name string) *Conn {
	fmt.Println("відкрито", name)
	return &Conn{name}
}

func (c *Conn) Close() { fmt.Println("закрито", c.Name) }

func process(name string, fail bool) (err error) {
	c := Open(name)
	if fail {
		return ErrBroken
	}
	fmt.Println("працюємо з", c.Name)
	c.Close()
	return nil
}

func main() {
	fmt.Println(process("db", false))
	err := process("cache", true)
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrBroken))
}
`,
    checks: [
      { on: "stdout", name: "Успішний шлях: ресурс закрито рівно раз, після роботи", has: "відкрито db\nпрацюємо з db\nзакрито db\n<nil>" },
      { on: "stdout", name: "При збої ресурс усе одно закривається", has: "відкрито cache\nзакрито cache", hint: "Поставте defer c.Close() одразу після Open" },
      { on: "stdout", name: "Помилка отримала контекст і лишилась розпізнаваною", has: "обробка \"cache\": збій\ntrue", hint: "defer func() { if err != nil { err = fmt.Errorf(...%w...) } }()" },
      { on: "source", name: "Закриття відкладено через defer", matches: "defer\\s+c\\.Close\\(\\)" },
      { on: "source", name: "Є defer із замиканням для результату", matches: "defer\\s+func\\s*\\(\\s*\\)\\s*\\{" },
    ],
  },
  {
    ...base, id: "go-panic-recover", lesson: "go/57", xp: 30,
    title: "safeCall: panic у error",
    context: "Одна несподівана аварія не повинна зупиняти весь застосунок. Серверні обробники, виконавці завдань і плагіни обгортають небезпечний код у функцію, що перехоплює panic і повертає звичайну помилку.",
    brief: [
      "Допишіть <code>safeCall(f func()) (err error)</code>: у відкладеній функції викличте <code>recover()</code> і, якщо панікували, запишіть в <code>err</code> текст <code>перехоплено: &lt;значення&gt;</code> через <code>fmt.Errorf</code>.",
      "Зараз відкладена функція викликає <code>recover()</code>, але ігнорує результат, тож помилка губиться. Після виправлення програма має пережити всі чотири виклики й дійти до «програма жива».",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

func safeCall(f func()) (err error) {
	defer func() {
		recover()
	}()
	f()
	return nil
}

func main() {
	fmt.Println(safeCall(func() { fmt.Println("все гаразд") }))
	fmt.Println(safeCall(func() { var m map[string]int; m["x"] = 1 }))
	fmt.Println(safeCall(func() { panic(errors.New("власна помилка")) }))
	fmt.Println(safeCall(func() { s := []int{1}; i := 3; _ = s[i] }))
	fmt.Println("програма жива")
}
`,
    checks: [
      { on: "stdout", name: "Звичайний виклик не дає помилки", has: "все гаразд\n<nil>" },
      { on: "stdout", name: "Запис у nil-мапу перетворено на помилку", has: "перехоплено: assignment to entry in nil map" },
      { on: "stdout", name: "panic зі значенням error перехоплено", has: "перехоплено: власна помилка" },
      { on: "stdout", name: "Вихід за межі слайса перехоплено", has: "перехоплено: runtime error: index out of range [3] with length 1" },
      { on: "stdout", name: "Програма дожила до кінця", has: "програма жива" },
      { on: "source", name: "Результат recover() зберігається й використовується", matches: "\\w+\\s*:?=\\s*recover\\(\\)", hint: "if r := recover(); r != nil { err = ... }" },
    ],
  },
  {
    ...base, id: "go-error-strategy", lesson: "go/58", xp: 40,
    title: "Шари й HTTP-статуси для помилок",
    context: "У сервісі кожен шар говорить своєю мовою помилок: база повертає «немає рядків», бізнес-логіка каже «користувача не знайдено», а обробник перетворює це на статус 404. Правильні межі не дають деталям бази просочитись до клієнта.",
    brief: [
      "У <code>findUser</code> розпізнайте <code>errNoRows</code> через <code>errors.Is</code> і поверніть доменну помилку <code>fmt.Errorf(\"користувач %d: %w\", id, ErrUserNotFound)</code>. Будь-яку іншу помилку репозиторію обгорніть контекстом <code>читання користувача %d: %w</code>.",
      "Допишіть <code>statusFor(err error) int</code>: <code>nil</code> дає 200, <code>ErrUserNotFound</code> дає 404, <code>ErrInvalidID</code> дає 400, усе інше 500. Користуйтеся <code>errors.Is</code>, не текстом помилки.",
    ],
    starter: raw`package main

import (
	"errors"
	"fmt"
)

var (
	ErrUserNotFound = errors.New("не знайдено")
	ErrInvalidID    = errors.New("некоректний id")
	errNoRows       = errors.New("sql: no rows")
	errConn         = errors.New("з'єднання втрачено")
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

func findUser(id int) (string, error) {
	if id <= 0 {
		return "", ErrInvalidID
	}
	name, err := repoFind(id)
	return name, err
}

func statusFor(err error) int {
	return 200
}

func main() {
	for _, id := range []int{1, 2, 3, -1} {
		name, err := findUser(id)
		status := statusFor(err)
		if err != nil {
			fmt.Printf("%d -> %d (%v)\n", id, status, err)
			continue
		}
		fmt.Printf("%d -> %d %s\n", id, status, name)
	}
}
`,
    checks: [
      { on: "stdout", name: "Успіх: 200", has: "1 -> 200 Ада" },
      { on: "stdout", name: "errNoRows перекладено на доменну помилку, статус 404", has: "2 -> 404 (користувач 2: не знайдено)", hint: "errors.Is(err, errNoRows), потім fmt.Errorf(... %w, ErrUserNotFound)" },
      { on: "stdout", name: "Інша помилка репозиторію: контекст і 500", has: "3 -> 500 (читання користувача 3: з'єднання втрачено)" },
      { on: "stdout", name: "Некоректний id: 400", has: "-1 -> 400 (некоректний id)" },
      { on: "source", name: "Статус визначається через errors.Is", matches: "errors\\.Is\\(\\s*err\\s*,\\s*ErrUserNotFound\\s*\\)", hint: "switch { case errors.Is(err, ErrUserNotFound): ... }" },
      { on: "source", name: "Не порівнюється текст помилки", matches: "err\\.Error\\(\\)", not: true },
    ],
  },
];
