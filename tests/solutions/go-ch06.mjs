const raw = String.raw;
const BT = "`";

export const SOLUTIONS_06 = {
  "go-error-value": raw`package main

import (
	"errors"
	"fmt"
	"strconv"
)

var ErrAge = errors.New("вік поза межами 0..150")

func parseAge(s string) (int, error) {
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0, fmt.Errorf("вік %q: не число", s)
	}
	if n < 0 || n > 150 {
		return 0, ErrAge
	}
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
  "go-custom-error": raw`package main

import "fmt"

type InsufficientFundsError struct{ Need, Have int }

func (e *InsufficientFundsError) Error() string {
	return fmt.Sprintf("недостатньо коштів: потрібно %d, є %d", e.Need, e.Have)
}

func withdraw(balance, amount int) (int, error) {
	if amount > balance {
		return balance, &InsufficientFundsError{Need: amount, Have: balance}
	}
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
  "go-wrap-errors": raw`package main

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
		return fmt.Errorf("конфіг %q: %w", name, err)
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
  "go-join-sentinel": raw`package main

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
	var errs []error
	if u.Name == "" {
		errs = append(errs, ErrNoName)
	}
	if u.Age < 0 || u.Age > 150 {
		errs = append(errs, ErrBadAge)
	}
	if !strings.Contains(u.Email, "@") {
		errs = append(errs, ErrNoEmail)
	}
	return errors.Join(errs...)
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
  "go-errors-defer": raw`package main

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
	defer c.Close()
	defer func() {
		if err != nil {
			err = fmt.Errorf("обробка %q: %w", name, err)
		}
	}()
	if fail {
		return ErrBroken
	}
	fmt.Println("працюємо з", c.Name)
	return nil
}

func main() {
	fmt.Println(process("db", false))
	err := process("cache", true)
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrBroken))
}
`,
  "go-panic-recover": raw`package main

import (
	"errors"
	"fmt"
)

func safeCall(f func()) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("перехоплено: %v", r)
		}
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
  "go-error-strategy": raw`package main

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
	if errors.Is(err, errNoRows) {
		return "", fmt.Errorf("користувач %d: %w", id, ErrUserNotFound)
	}
	if err != nil {
		return "", fmt.Errorf("читання користувача %d: %w", id, err)
	}
	return name, nil
}

func statusFor(err error) int {
	switch {
	case err == nil:
		return 200
	case errors.Is(err, ErrUserNotFound):
		return 404
	case errors.Is(err, ErrInvalidID):
		return 400
	}
	return 500
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
};
