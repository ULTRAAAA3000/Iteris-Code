const BT = "`";

export const LESSONS_05 = [
  {
    t: "Інтерфейси",
    ch: "Інтерфейси та generics",
    easy: "Інтерфейс — це розетка: їй байдуже, чайник у неї вставлено чи лампа, головне, що вилка підходить. Код вимагає не «конкретний тип», а «щось, що вміє такі-то дії».",
    p: [
      "Уявіть, що треба порахувати загальну площу прямокутників, кіл і трикутників. Без інтерфейсів ви писали б три функції або одну з нескінченним <code>if</code> за типом. З інтерфейсом ви кажете: «мені підійде будь-що, що має метод <code>Area() float64</code>», і одна функція працює з усіма фігурами, навіть з тими, які хтось додасть через рік. Це і є <b>поліморфізм</b>: одна й та сама дія, різна поведінка залежно від того, що всередині.",
      "Інтерфейс у Go — це <b>набір сигнатур методів</b>: <code>type Shape interface { Area() float64 }</code>. Це тип, як і будь-який інший: його можна мати в змінній, параметрі, полі структури, елементі слайса. Але значення такого типу не «просто дані». Модель у голові така: <b>інтерфейсне значення — це пара (тип, значення)</b>. У першій комірці лежить конкретний тип (наприклад, <code>Rect</code>), у другій — самі дані (<code>{3, 4}</code>). Коли ви викликаєте <code>s.Area()</code>, Go дивиться на тип у парі й викликає метод саме цього типу.",
      "Зверніть увагу на головну відмінність від багатьох мов: у Go ви ніде не пишете «<code>Rect implements Shape</code>». Достатньо, щоб у типу <code>Rect</code> були всі потрібні методи, і він автоматично підходить під інтерфейс. Детально про це в наступному уроці; зараз важливо, що інтерфейс описує <i>поведінку</i>, а не походження типу. Тому інтерфейс можна оголосити там, де він потрібен, не чіпаючи вже написані типи.",
      "Приклад по сходинках. Спершу змінна типу <code>Shape</code> приймає по черзі <code>Rect</code> і <code>Circle</code>. Потім функція <code>totalArea(shapes []Shape)</code> проходить слайс фігур різних типів і додає площі: у слайсі лежать пари (тип, значення), і кожна відповідає по-своєму. Зверніть увагу: слайс <code>[]Shape</code> не можна отримати з <code>[]Rect</code> простим присвоєнням. Інтерфейсне значення має інший розмір і вигляд, тому елементи доведеться складати по одному.",
      "Пастка перша: тип, якому бракує бодай одного методу, інтерфейсу не відповідає, і компілятор скаже про це прямо: <code>Square does not implement Shape (missing method Perimeter)</code>. Це добре: помилка виявляється під час збирання, а не вночі на проді. Пастка друга: виклик методу на нульовому інтерфейсі (<code>var s Shape; s.Area()</code>) дає panic, бо в парі немає ні типу, ні значення, і викликати нічого. Про нульовий інтерфейс і його підступну версію поговоримо в уроці 41.",
      "Ідіома Go: <b>інтерфейси малі</b>. Один-два методи — норма, десять — майже завжди помилка проєктування. Назву одного методу інтерфейсу часто будують із методу: <code>Reader</code> має <code>Read</code>, <code>Stringer</code> має <code>String</code>, <code>Closer</code> має <code>Close</code>. Далі в курсі ви побачите, як ця дрібність дозволяє підставляти файл, мережу чи рядок у пам'яті в один і той самий код.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
}

type Rect struct{ W, H float64 }
type Circle struct{ R float64 }

func (r Rect) Area() float64   { return r.W * r.H }
func (c Circle) Area() float64 { return math.Pi * c.R * c.R }

func main() {
	var s Shape = Rect{3, 4}
	fmt.Printf("%.2f\n", s.Area())
	s = Circle{2}
	fmt.Printf("%.2f\n", s.Area())
	fmt.Printf("%T\n", s)
}
`,
      String.raw`package main

import "fmt"

type Animal interface {
	Name() string
	Speak() string
}

type Dog struct{}
type Cat struct{}

func (Dog) Name() string  { return "Пес" }
func (Dog) Speak() string { return "гав" }
func (Cat) Name() string  { return "Кіт" }
func (Cat) Speak() string { return "няв" }

func chorus(animals []Animal) {
	for _, a := range animals {
		fmt.Println(a.Name()+":", a.Speak())
	}
}

func main() {
	chorus([]Animal{Dog{}, Cat{}, Dog{}})
}
`,
      String.raw`// не компілюється: Square не має методу Perimeter, тож не є Shape
package main

import "fmt"

type Shape interface {
	Area() float64
	Perimeter() float64
}

type Square struct{ Side float64 }

func (s Square) Area() float64 { return s.Side * s.Side }

func main() {
	var s Shape = Square{2}
	fmt.Println(s.Area())
}
`,
      String.raw`// аварія: виклик методу на нульовому інтерфейсі (nil pointer dereference)
package main

import "fmt"

type Shape interface {
	Area() float64
}

func main() {
	var s Shape
	fmt.Println(s == nil)
	fmt.Println(s.Area())
}
`,
    ],
    note: "Інтерфейс описує поведінку (набір методів), а значення інтерфейсного типу — це пара (конкретний тип, значення). Виклик методу йде до методу конкретного типу з пари. Нульовий інтерфейс не має ні типу, ні значення, тому виклик методу на ньому дає panic.",
    work: "Інтерфейси стоять там, де код має працювати з різними реалізаціями: сховище даних (пам'ять чи база), логер (консоль чи файл), платіжний провайдер, відправник листів. У тестах справжню реалізацію підміняють заглушкою, бо функція приймає інтерфейс.",
    tasks: [
      "Чому слайс []Rect не можна передати у функцію, що очікує []Shape, хоча Rect реалізує Shape?",
      "Що лежить усередині змінної типу Shape, коли їй присвоєно Circle{2}, і що станеться при виклику методу на var s Shape без значення?",
    ],
  },
  {
    t: "Неявна реалізація і вбудовані інтерфейси",
    ch: "Інтерфейси та generics",
    easy: "У Go не треба підписувати «договір» з інтерфейсом: якщо тип вміє все, що в ньому описано, він уже підходить. Як чоловік, який просто вміє водити авто, ще до того, як побачив оголошення «потрібен водій».",
    p: [
      "У Java чи C# клас оголошує «я реалізую інтерфейс X». У Go такого ключового слова немає: <b>реалізація неявна</b>. Тип реалізує інтерфейс, якщо має всі його методи з точно такими сигнатурами. Це відкриває дві корисні речі. По-перше, інтерфейс можна написати <i>після</i> типу й навіть в іншому пакеті, не змінюючи чужий код. По-друге, залежність спрямована від споживача: той, кому щось потрібне, описує вимогу, а постачальник про неї навіть не знає.",
      "Тепер тонкий момент, на якому спотикаються всі: <b>набір методів</b> (method set). Для типу <code>T</code> у набір входять лише методи з отримувачем-значенням <code>(t T)</code>. Для типу <code>*T</code> — і методи з <code>(t T)</code>, і методи з <code>(t *T)</code>. Тому якщо <code>Speak</code> оголошено з отримувачем <code>*Dog</code>, то інтерфейс реалізує <code>&amp;Dog{}</code>, а <code>Dog{}</code> — ні. Компілятор скаже: <code>Dog does not implement Animal (method Speak has pointer receiver)</code>. Причина проста: значення в інтерфейсі лежить у копії, і Go не може гарантувати, що в нього можна взяти адресу.",
      "Практичне правило: якщо хоч один метод типу має отримувач-вказівник, то й інтерфейсу присвоюйте вказівник, <code>&amp;T{}</code>. Розкидати методи по обох видах отримувачів за звичкою не варто: це робить тип незручним. З уроку про методи ви вже знаєте: вказівник потрібен, коли метод змінює стан або структура велика.",
      "Інтерфейси можна <b>вбудовувати</b> один в одного: <code>type ReadWriter interface { Reader; Writer }</code>. Результат містить усі методи обох; це просто зручний запис об'єднання, а не успадкування. У стандартній бібліотеці так складено <code>io.ReadWriter</code>, <code>io.ReadCloser</code> і т.д. Малі інтерфейси комбінують, а не роздувають один великий.",
      "Тепер найпідступніше: <b>nil-інтерфейс проти інтерфейсу з nil-вказівником</b>. Інтерфейс дорівнює <code>nil</code> лише тоді, коли порожні обидві комірки пари: і тип, і значення. Якщо ви присвоїли інтерфейсу вказівник <code>*MyErr</code>, який випадково <code>nil</code>, то пара така: (тип <code>*MyErr</code>, значення <code>nil</code>). Тип не порожній, тож <code>err != nil</code> дає <code>true</code>! Класична помилка: функція оголошує <code>var p *MyErr</code>, повертає його як <code>error</code>, і перевірка <code>if err != nil</code> у викликача спрацьовує, хоч помилки немає.",
      "Захист простий: функція, що повертає інтерфейс, при «відсутності» має повертати літеральний <code>nil</code>, а не змінну конкретного типу. Ніколи не повертайте типізований nil-вказівник як інтерфейс. А якщо хочете переконатися, що тип реалізує інтерфейс, поставте на рівні пакета перевірку <code>var _ Animal = (*Dog)(nil)</code>: компілятор впаде одразу, якщо методів забракне.",
    ],
    code: [
      String.raw`package main

import "fmt"

type Reader interface{ Read() string }
type Writer interface{ Write(s string) }

type ReadWriter interface {
	Reader
	Writer
}

type Note struct{ text string }

func (n *Note) Read() string   { return n.text }
func (n *Note) Write(s string) { n.text += s }

var _ ReadWriter = (*Note)(nil)

func main() {
	var rw ReadWriter = &Note{}
	rw.Write("Привіт")
	rw.Write(", Go")
	fmt.Println(rw.Read())
	var r Reader = rw
	fmt.Println(r.Read())
}
`,
      String.raw`// не компілюється: метод з отримувачем *Dog не входить у набір методів значення Dog
package main

import "fmt"

type Animal interface{ Speak() string }

type Dog struct{ Name string }

func (d *Dog) Speak() string { return d.Name + ": гав!" }

func main() {
	var a Animal = Dog{"Рекс"}
	fmt.Println(a.Speak())
}
`,
      String.raw`package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "моя помилка" }

func bad(fail bool) error {
	var p *MyErr
	if fail {
		p = &MyErr{}
	}
	return p
}

func good(fail bool) error {
	if fail {
		return &MyErr{}
	}
	return nil
}

func main() {
	e1 := bad(false)
	fmt.Println(e1 == nil)
	fmt.Printf("%T\n", e1)
	e2 := good(false)
	fmt.Println(e2 == nil)
}
`,
    ],
    note: "Реалізація неявна: потрібні лише методи. Набір методів T містить методи значення, набір *T — і значення, і вказівника. Інтерфейс == nil лише коли порожні і тип, і значення, тому не повертайте типізований nil-вказівник як інтерфейс.",
    work: "Перевірку var _ Iface = (*T)(nil) ставлять у пакетах, щоб тип точно відповідав інтерфейсу. Пастка nil-вказівника в error зустрічається в реальному коді, і саме тому функції повертають чистий nil.",
    tasks: [
      "Чому Dog{} не реалізує інтерфейс, якщо Speak оголошено з отримувачем *Dog, а &Dog{} реалізує?",
      "Функція повертає змінну типу *MyErr зі значенням nil як error. Чому err != nil дає true і як цього уникнути?",
    ],
  },
  {
    t: "Порожній інтерфейс any і type assertion",
    ch: "Інтерфейси та generics",
    easy: "any — це коробка без етикетки: вкласти можна будь-що, але щоб користуватися вмістом, треба спершу відкрити коробку й переконатися, що там лежить саме те, що ви думаєте.",
    p: [
      "Інтерфейс без жодного методу, <code>interface{}</code>, задовольняє будь-який тип, адже вимог немає. З Go 1.18 для нього є псевдонім <code>any</code>: пишіть <code>any</code>, а не <code>interface{}</code>. Змінна типу <code>any</code> може містити <code>int</code>, рядок, слайс, структуру, функцію. Усередині, як і в усіх інтерфейсах, пара (тип, значення). Саме так працюють <code>fmt.Println(a ...any)</code> і функції, що приймають довільні дані.",
      "Ціна гнучкості: компілятор забуває, що всередині. Ви можете присвоїти <code>var x any = 42</code>, але <code>x + 1</code> не скомпілюється: у типі <code>any</code> немає операції додавання. Щоб дістати конкретне значення назад, потрібне <b>твердження типу</b> (type assertion): <code>n := x.(int)</code>. Ви стверджуєте: «у парі тип int», і Go перевіряє це під час виконання.",
      "Якщо твердження хибне, у простій формі <code>n := x.(int)</code> буде <b>panic</b>: <code>interface conversion: interface {} is string, not int</code>. Тому майже завжди вживають форму <b>comma-ok</b>: <code>n, ok := x.(int)</code>. Якщо тип збігся, <code>ok</code> дорівнює <code>true</code> і <code>n</code> містить значення; якщо ні, <code>ok</code> дорівнює <code>false</code>, а <code>n</code> — нульове значення типу, паніки немає. Це знайома вам схема з мапами (<code>v, ok := m[k]</code>).",
      "Твердження можна робити не лише до конкретного типу, а й <i>до іншого інтерфейсу</i>: <code>s, ok := x.(fmt.Stringer)</code> питає «чи вміє це значення викликати <code>String()</code>?». Так працюють багато бібліотечних функцій: вони приймають вузьке, а потім уточнюють можливості через assertion. Перевірка йде за набором методів, а не за іменем типу.",
      "Нагадаємо про nil: <code>var x any</code> без значення — це пара без типу, і будь-яке твердження <code>x.(int)</code> у формі comma-ok дасть <code>ok == false</code> (а проста форма — panic). Також пам'ятайте, що <code>x.(int)</code> точно перевіряє тип <code>int</code>: <code>int64</code>, <code>float64</code> чи власний <code>type ID int</code> не підійдуть.",
      "Коли користуватися <code>any</code>? Рідко. Типи — головна перевага Go, і кожне <code>any</code> віддає її назад. Виправдані випадки: функції форматування, роздруку, роботи з JSON невідомої форми, контейнери для довільних даних. Для решти є інтерфейси з методами й (з уроку 47) generics. Коли значень кілька різних типів і для кожного своя дія, зручніший <code>type switch</code> — про нього наступний урок.",
    ],
    code: [
      String.raw`package main

import "fmt"

func main() {
	var x any = 42
	fmt.Println(x)

	n, ok := x.(int)
	fmt.Println(n, ok)

	s, ok := x.(string)
	fmt.Printf("%q %v\n", s, ok)

	x = "привіт"
	s, ok = x.(string)
	fmt.Printf("%q %v\n", s, ok)
}
`,
      String.raw`// аварія: проста форма твердження типу при хибному типі
package main

import "fmt"

func main() {
	var x any = "привіт"
	n := x.(int)
	fmt.Println(n)
}
`,
      String.raw`package main

import (
	"fmt"
	"time"
)

type ID int

func (i ID) String() string { return fmt.Sprintf("#%d", int(i)) }

func main() {
	values := []any{1, "два", ID(3), 4.5, nil, 2 * time.Second}
	sum := 0
	for _, v := range values {
		if n, ok := v.(int); ok {
			sum += n
		}
		if s, ok := v.(fmt.Stringer); ok {
			fmt.Println("Stringer:", s.String())
		}
	}
	fmt.Println("сума int:", sum)
}
`,
    ],
    note: "any — те саме, що interface{}: приймає все, але втрачає інформацію про тип. Доступ до значення: v, ok := x.(T). Проста форма x.(T) при хибному типі дає panic, тож надійний код використовує comma-ok.",
    work: "any бачимо в fmt.Println, у розборі довільного JSON (map[string]any) і в універсальних контейнерах. Утім, у своєму коді перевага віддається конкретним типам, інтерфейсам з методами й generics.",
    tasks: [
      "Чим відрізняється n := x.(int) від n, ok := x.(int) і коли друга форма не панікує?",
      "Чи спрацює x.(int), якщо в x лежить значення типу int64(5)? А x.(fmt.Stringer) для значення типу ID з методом String()?",
    ],
  },
  {
    t: "type switch",
    ch: "Інтерфейси та generics",
    easy: "type switch — це сортувальник на пошті: бере посилку, дивиться на неї й кладе на потрібну полицю залежно від того, що всередині. Для кожного типу своя гілка.",
    p: [
      "Коли треба по-різному обробити кілька можливих типів у <code>any</code>, ланцюжок <code>if v, ok := x.(int); ok { ... } else if ...</code> швидко стає неприємним. Для цього є <b>type switch</b>: <code>switch v := x.(type) { case int: ... case string: ... }</code>. Це той самий <code>switch</code>, але гілки порівнюють не значення, а <i>тип</i> з пари (тип, значення) в інтерфейсі.",
      "Магія в змінній <code>v</code>: у кожній гілці вона <b>має тип цієї гілки</b>. У <code>case int</code> змінна <code>v</code> — звичайний <code>int</code>, тож можна писати <code>v + 1</code>. У <code>case string</code> — <code>string</code>, і доступний <code>len(v)</code>. Фактично Go робить за вас твердження типу в кожній гілці. Гілки перевіряються зверху вниз, спрацьовує перша підходяща.",
      "Особливі випадки. <code>case int, int64</code> — кілька типів в одній гілці: тут <code>v</code> зберігає тип початкового виразу (<code>any</code>), бо Go не знає, який саме. <code>case nil</code> ловить інтерфейс без значення. <code>default</code> спрацьовує, коли жодна гілка не збіглася; тут <code>v</code> теж має тип <code>any</code>, і разом із <code>%T</code> зручно повідомити, що за тип прийшов. Гілкою може бути й <i>інтерфейс</i>: <code>case fmt.Stringer:</code> ловить будь-який тип із методом <code>String()</code>. Порядок тут важливий: поставте широкий інтерфейс перед конкретним типом, і конкретний ніколи не спрацює.",
      "Типові пастки. Якщо оголосити <code>v := x.(type)</code>, але жодна гілка не використовує <code>v</code>, компілятор видасть <code>v declared and not used</code>; тоді пишіть просто <code>switch x.(type)</code>. Форма <code>x.(type)</code> поза <code>switch</code> не дозволена. Ще: <code>fallthrough</code> у type switch заборонено, кожна гілка самодостатня.",
      "Де це потрібно? Розбір значень невідомої форми (наприклад, результат JSON-розбору в <code>map[string]any</code>), виведення різних типів у спільному форматі, обхід дерева виразів, де вузли — різні структури. Утім, якщо ви застосовуєте type switch до своїх типів і постійно додаєте гілки, подумайте, чи не краще додати метод до інтерфейсу: тоді нова реалізація сама знає, як поводитися, і switch не треба переписувати.",
      "Підсумок трьох уроків: інтерфейс = пара (тип, значення); твердження типу витягує значення, comma-ok захищає від panic; type switch робить те саме для багатьох типів одразу. Далі розберемо інтерфейси, які Go вживає всюди: <code>Stringer</code>, <code>error</code>, <code>io.Closer</code>.",
    ],
    code: [
      String.raw`package main

import "fmt"

func describe(x any) string {
	switch v := x.(type) {
	case nil:
		return "порожньо"
	case int:
		return fmt.Sprintf("ціле, +1 = %d", v+1)
	case string:
		return fmt.Sprintf("рядок довжиною %d байт", len(v))
	case bool:
		return fmt.Sprintf("логічне %t", v)
	case []int:
		return fmt.Sprintf("слайс із %d елементів", len(v))
	default:
		return fmt.Sprintf("невідомий тип %T", v)
	}
}

func main() {
	for _, x := range []any{42, "go", true, []int{1, 2, 3}, nil, 3.5} {
		fmt.Println(describe(x))
	}
}
`,
      String.raw`package main

import "fmt"

type Celsius float64

func (c Celsius) String() string { return fmt.Sprintf("%.1f°C", float64(c)) }

func kind(x any) string {
	switch x.(type) {
	case int, int64:
		return "цілий"
	case fmt.Stringer:
		return "має String()"
	case error:
		return "помилка"
	}
	return "інше"
}

func main() {
	fmt.Println(kind(7))
	fmt.Println(kind(int64(7)))
	fmt.Println(kind(Celsius(21.5)))
	fmt.Println(kind(fmt.Errorf("збій")))
	fmt.Println(kind("текст"))
}
`,
      String.raw`// не компілюється: змінна v із type switch не використана в жодній гілці
package main

import "fmt"

func main() {
	var x any = 1
	switch v := x.(type) {
	case int:
		fmt.Println("int")
	case string:
		fmt.Println("string")
	}
}
`,
    ],
    note: "switch v := x.(type) порівнює тип у парі; у гілці з одним типом v має цей тип, у гілці з кількома типами або в default — тип початкового виразу. Гілки йдуть зверху вниз: широкі інтерфейси ставте нижче конкретних типів.",
    work: "Type switch використовують для розбору довільних даних, обходу абстрактних синтаксичних дерев і форматування значень різних типів. Якщо switch росте з кожним новим типом, час додати метод до інтерфейсу.",
    tasks: [
      "Який тип має змінна v у гілці case int, string та у default в switch v := x.(type)?",
      "Чому порядок гілок type switch важливий, коли одна з них — інтерфейс, наприклад fmt.Stringer?",
    ],
  },
];
