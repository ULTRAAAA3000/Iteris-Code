import type { RefSection } from "./types.ts";

const raw = String.raw;
const BT = "`";   // зворотний апостроф для тегів структур (у String.raw його не можна екранувати)

export const go: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`package main

import "fmt"

func main() {
    fmt.Println("Привіт, світе!")
}`, note: "Виконання починається з функції `main` пакета `main`. Невикористаний імпорт чи змінна це помилка компіляції." },
    { t: "Запуск і модулі", code: raw`go mod init example.com/app   # створити модуль
go run .                      # зібрати й запустити
go build                      # зібрати виконуваний файл
go fmt ./...                  # відформатувати код`, note: "Команди виконуються в терміналі в папці проєкту." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Оголошення", code: raw`var age int = 16
var name = "Олена"
city := "Дніпро"      // коротка форма (лише всередині функцій)
const Pi = 3.14
fmt.Println(age, name, city, Pi)`, note: "`:=` оголошує й присвоює разом, тип визначається сам." },
    { t: "Базові типи", code: raw`var i int = 42
var f float64 = 3.14
var s string = "текст"
var b bool = true
var r rune = 'я'      // один символ Unicode
var z int             // нульове значення: 0`, note: "Змінна без значення отримує «нульове»: 0, \"\", false, nil." },
    { t: "Перетворення типів", code: raw`x := 7
y := float64(x) / 2   // 3.5
n, err := strconv.Atoi("12")   // потрібен імпорт "strconv"
fmt.Println(y, n, err)`, note: "Go не перетворює типи неявно: `int` і `float64` треба зводити вручну." },
  ] },
  { t: "Умови", items: [
    { t: "if і switch", code: raw`if age < 12 {
    fmt.Println("дитина")
} else if age < 18 {
    fmt.Println("підліток")
} else {
    fmt.Println("дорослий")
}

switch day {
case "сб", "нд":
    fmt.Println("вихідний")
default:
    fmt.Println("будній")
}`, note: "Дужки навколо умови не потрібні, фігурні дужки обов'язкові. У `switch` не треба писати `break`." },
    { t: "if з коротким оголошенням", code: raw`if n, err := strconv.Atoi(text); err == nil {
    fmt.Println("число", n)
} else {
    fmt.Println("помилка:", err)
}`, note: "Змінні, оголошені в `if`, живуть лише в цьому блоці." },
  ] },
  { t: "Цикли", items: [
    { t: "for у трьох формах", code: raw`for i := 0; i < 3; i++ {   // класичний
    fmt.Println(i)
}
n := 0
for n < 3 {                 // як while
    n++
}
for {                       // нескінченний
    break
}`, note: "У Go єдиний цикл `for`." },
    { t: "range", code: raw`nums := []int{10, 20, 30}
for i, v := range nums {
    fmt.Println(i, v)
}
for _, ch := range "Go" {
    fmt.Println(string(ch))
}`, note: "`_` означає «ця змінна не потрібна»." },
  ] },
  { t: "Колекції", items: [
    { t: "Масив і зріз", code: raw`arr := [3]int{1, 2, 3}      // фіксована довжина
s := []int{1, 2, 3}         // зріз: розмір змінюється
s = append(s, 4)
fmt.Println(len(s), s[1:3], arr)`, note: "У щоденній роботі майже завжди використовують зрізи." },
    { t: "Мапа", code: raw`ages := map[string]int{"Оля": 16}
ages["Іван"] = 17
v, ok := ages["Петро"]       // ok == false, якщо ключа немає
delete(ages, "Оля")
fmt.Println(v, ok, len(ages))`, note: "Форма `v, ok := m[key]` дозволяє відрізнити відсутній ключ від нульового значення." },
  ] },
  { t: "Функції", items: [
    { t: "Параметри й кілька результатів", code: raw`func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("ділення на нуль")
    }
    return a / b, nil
}

res, err := divide(7, 2)`, note: "Функція може повертати кілька значень, останнім зазвичай іде `error`." },
    { t: "defer і анонімні функції", code: raw`func main() {
    defer fmt.Println("кінець")   // виконається при виході з main
    add := func(a, b int) int { return a + b }
    fmt.Println(add(2, 3))
}`, note: "`defer` відкладає виклик до завершення функції: зручно для закриття файлів." },
  ] },
  { t: "Структури й методи", items: [
    { t: "struct і метод", code: raw`type User struct {
    Name string
    Age  int
}

func (u User) Greet() string {
    return "Привіт, " + u.Name
}

u := User{Name: "Олена", Age: 16}
fmt.Println(u.Greet())`, note: "Метод це функція з отримувачем перед назвою. Для зміни полів отримувач має бути вказівником `*User`." },
    { t: "Інтерфейс", code: raw`type Shape interface {
    Area() float64
}

type Square struct{ Side float64 }

func (s Square) Area() float64 { return s.Side * s.Side }

var sh Shape = Square{3}
fmt.Println(sh.Area())`, note: "Тип реалізує інтерфейс автоматично, якщо має всі його методи." },
  ] },
  { t: "Горутини й канали", items: [
    { t: "go, канал, WaitGroup", code: raw`ch := make(chan int)
go func() {
    ch <- 42          // надіслати
}()
fmt.Println(<-ch)     // отримати

var wg sync.WaitGroup
wg.Add(1)
go func() { defer wg.Done() }()
wg.Wait()`, note: "`go` запускає функцію паралельно, канал передає дані між горутинами." },
  ] },
  { t: "Помилки", items: [
    { t: "Перевірка err", code: raw`f, err := os.Open("data.txt")
if err != nil {
    log.Fatal(err)
}
defer f.Close()`, note: "У Go помилки це значення, які повертають і перевіряють явно." },
    { t: "Власна помилка з контекстом", code: raw`if err != nil {
    return fmt.Errorf("читання конфіга: %w", err)
}`, note: "`%w` обгортає помилку, її можна розпізнати через `errors.Is` та `errors.As`." },
  ] },
  { t: "Теги структур (JSON)", items: [
    { t: "Теги й encoding/json", code: raw`type Item struct {
    ID    int    ${BT}json:"id"${BT}
    Title string ${BT}json:"title"${BT}
}

data, _ := json.Marshal(Item{1, "Хліб"})
fmt.Println(string(data))`, note: "Теги в зворотних апострофах задають імена полів у JSON." },
  ] },
];
