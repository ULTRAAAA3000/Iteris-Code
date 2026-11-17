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
  {
    t: "Stringer, error та інші стандартні інтерфейси",
    ch: "Інтерфейси та generics",
    easy: "Стандартні інтерфейси — це загальноприйняті «вилки й розетки» Go: якщо ваш тип має метод <code>String()</code>, то <code>fmt</code> вміє його красиво друкувати, а якщо <code>Error()</code> — то він годиться як помилка.",
    p: [
      "У стандартній бібліотеці є кілька крихітних інтерфейсів, на яких тримається більша частина Go-коду. <code>fmt.Stringer</code> — це <code>interface { String() string }</code>: «я вмію описати себе рядком». <code>error</code> — вбудований тип-інтерфейс <code>interface { Error() string }</code>: «я вмію описати, що пішло не так». <code>io.Closer</code> — <code>interface { Close() error }</code>: «мене треба закрити, коли закінчили». У кожного рівно один метод, і саме тому їх так легко реалізувати.",
      "Навіщо це потрібно? Пакет <code>fmt</code> нічого не знає про ваші типи, але вміє перевіряти, чи є в значення метод <code>String()</code> або <code>Error()</code>. Модель у голові: <code>Println</code> отримує значення як <code>any</code>, тобто пару (тип, значення), і за типом у парі шукає метод. Якщо знаходить <code>Error()</code>, друкує його результат; інакше, якщо знаходить <code>String()</code>, друкує його; інакше виводить поля стандартним способом. Так <code>fmt.Println(t)</code> для <code>Celsius(21.5)</code> друкує «21.5°C», а не просто число.",
      "Правила для <code>fmt</code> трохи тонші, ніж здається. Метод <code>String()</code> застосовується для дієслів <code>%v</code>, <code>%s</code>, <code>%q</code> (і <code>Print</code>/<code>Println</code>), але не для <code>%d</code>: це числове дієслово, і воно друкує сире значення. Метод викликається і для елементів слайса чи полів структури, якщо вони доступні для fmt. Якщо в типу є обидва методи, <code>Error()</code> має пріоритет над <code>String()</code>.",
      "<code>error</code> — це просто інтерфейс, тому будь-який ваш тип стає помилкою, щойно отримає метод <code>Error() string</code>. Значення <code>nil</code> означає «помилки немає», і тому функції повертають <code>error</code> другим результатом: <code>if err != nil { ... }</code>. Прості помилки створюють через <code>errors.New(\"текст\")</code> і <code>fmt.Errorf(\"файл %s: не знайдено\", name)</code>. Власний тип корисний, коли разом із текстом треба нести дані: номер рядка, код, ім'я поля. Глибше про помилки (обгортання, <code>errors.Is</code>, <code>errors.As</code>) буде в наступній главі; тут важливо лише, що <code>error</code> — звичайний інтерфейс.",
      "Пастка перша: отримувач. Якщо <code>String()</code> оголошено на <code>*T</code>, то значення <code>T</code> цей метод <i>не має</i> у своєму наборі методів, і <code>Println(t)</code> надрукує поля, а <code>Println(&amp;t)</code> викличе метод (див. приклад 4). Це те саме правило, що й у уроці про неявну реалізацію. Для <code>Stringer</code> та <code>error</code> здебільшого обирають отримувач-значення: тоді працюють і значення, і вказівник. Пастка друга: нескінченна рекурсія. Якщо всередині <code>String()</code> написати <code>fmt.Sprintf(\"%v\", c)</code> для самого отримувача, <code>fmt</code> знову викличе <code>String()</code>, і програма впаде з переповненням стека. Усередині методу форматуйте поля або перетворюйте значення до базового типу: <code>float64(c)</code>.",
      "Ідіоми. Назви типів-помилок закінчують на <code>Error</code> (<code>ParseError</code>), а змінні-помилки зазвичай називають <code>err</code>. Повертайте помилку як інтерфейс <code>error</code>, а не як конкретний тип: функція з результатом <code>*MyErr</code>, що повернула нульовий вказівник, дасть «непорожній» <code>error</code> (про цю підступність було в уроці про <code>any</code>). Для ресурсів, які треба закрити, використовуйте <code>io.Closer</code>: функція, що приймає <code>io.Closer</code>, закриє і файл, і з'єднання. Далі розглянемо пару ще важливіших інтерфейсів: <code>io.Reader</code> та <code>io.Writer</code>.",
    ],
    code: [
      String.raw`package main

import "fmt"

type Celsius float64

func (c Celsius) String() string { return fmt.Sprintf("%.1f°C", float64(c)) }

type Point struct{ X, Y int }

func (p Point) String() string { return fmt.Sprintf("(%d; %d)", p.X, p.Y) }

func main() {
	t := Celsius(21.55)
	fmt.Println(t)
	fmt.Printf("%v | %s\n", t, t)
	pts := []Point{{1, 2}, {3, 4}}
	fmt.Println(pts)
	fmt.Printf("%d\n", pts[0])
	var s fmt.Stringer = Point{5, 6}
	fmt.Println(s.String())
}
`,
      String.raw`package main

import (
	"errors"
	"fmt"
)

type ParseError struct {
	Line int
	Msg  string
}

func (e ParseError) Error() string {
	return fmt.Sprintf("рядок %d: %s", e.Line, e.Msg)
}

func parse(line int, s string) (int, error) {
	if s == "" {
		return 0, ParseError{line, "порожнє значення"}
	}
	n := 0
	for _, r := range s {
		if r < '0' || r > '9' {
			return 0, ParseError{line, fmt.Sprintf("недопустимий символ %q", r)}
		}
		n = n*10 + int(r-'0')
	}
	return n, nil
}

func main() {
	for i, s := range []string{"42", "", "4x2"} {
		n, err := parse(i+1, s)
		if err != nil {
			fmt.Println("помилка:", err)
			continue
		}
		fmt.Println("число:", n)
	}
	simple := errors.New("простий збій")
	var err error = simple
	fmt.Println(err, err == simple)
	fmt.Println(fmt.Errorf("файл %s не знайдено", "a.txt"))
}
`,
      String.raw`package main

import (
	"fmt"
	"io"
)

type Conn struct{ Name string }

func (c *Conn) Close() error {
	fmt.Println("закрито", c.Name)
	return nil
}

func closeAll(items []io.Closer) {
	for _, it := range items {
		if err := it.Close(); err != nil {
			fmt.Println("помилка закриття:", err)
		}
	}
}

func main() {
	closeAll([]io.Closer{&Conn{"db"}, &Conn{"cache"}})
}
`,
      String.raw`package main

import "fmt"

type Temp struct{ V int }

func (t *Temp) String() string { return "Temp!" }

func main() {
	t := Temp{1}
	fmt.Println(t)
	fmt.Println(&t)
}
`,
    ],
    note: "fmt шукає у значенні методи Error() і String(): Error() головніший, String() не діє для %d. Метод із отримувачем *T не входить до набору методів значення T. Усередині String() не друкуйте отримувача через %v: це нескінченна рекурсія.",
    work: "String() роблять для типів, які часто потрапляють у логи й повідомлення (ID, гроші, статуси); власні типи error несуть код і контекст помилки; io.Closer дозволяє закривати різні ресурси однаковим кодом.",
    tasks: [
      "Чому fmt.Println(t) для значення t типу T не викликає String(), оголошений на *T, а fmt.Println(&t) викликає?",
      "Що станеться, якщо всередині методу String() написати fmt.Sprintf(\"%v\", отримувач) і чому?",
    ],
  },
  {
    t: "io.Reader і io.Writer",
    ch: "Інтерфейси та generics",
    easy: "<code>io.Reader</code> — це кран, з якого тече потік байтів, а <code>io.Writer</code> — раковина, куди він стікає. Між ними можна ставити фільтри, і жоден кран не цікавить, що за раковина внизу.",
    p: [
      "Дані в програмах приходять звідусіль: файл, мережа, рядок у пам'яті, відповідь сервера. Якби кожне джерело мало свій спосіб читання, кожна функція обробки мусила б знати про всіх. Go вирішив це двома дрібними інтерфейсами: <code>io.Reader</code> має один метод <code>Read(p []byte) (n int, err error)</code>, а <code>io.Writer</code> — <code>Write(p []byte) (n int, err error)</code>. Усе, що вміє віддавати чи приймати байти, відповідає одному з них, і функція, написана для <code>io.Reader</code>, працює з будь-яким джерелом.",
      "Контракт <code>Read</code> варто зрозуміти точно. Ви передаєте буфер <code>p</code>, метод заповнює його <i>скільки зміг</i> і повертає кількість записаних байтів <code>n</code>. Коли дані скінчилися, повертається спеціальна помилка <code>io.EOF</code> — це не збій, а сигнал «кінець потоку». Головне правило: спершу обробіть <code>n</code> байтів, і лише потім дивіться на <code>err</code>, бо <code>Read</code> має право повернути <code>n &gt; 0</code> разом із <code>io.EOF</code>. Для <code>Write</code> контракт простіший: запишіть усі байти або поверніть помилку; якщо <code>n &lt; len(p)</code>, помилка обов'язкова.",
      "Готові реалізації, які треба знати. <code>strings.NewReader(s)</code> робить Reader із рядка (зручно в тестах і прикладах без файлів). <code>bytes.Buffer</code> — і Reader, і Writer: пишете в нього, потім читаєте або беріть <code>buf.String()</code>. <code>os.Stdout</code> — це <code>*os.File</code>, і він теж <code>io.Writer</code>; <code>fmt.Println(x)</code> — це лише скорочення від <code>fmt.Fprintln(os.Stdout, x)</code>. Функції сімейства <code>Fprint*</code> приймають будь-який Writer, тому один і той самий код виводить у консоль, у буфер чи у файл.",
      "Що з цим робити. <code>io.Copy(dst, src)</code> переливає все з Reader у Writer шматками й повертає кількість байтів; <code>io.ReadAll(r)</code> збирає все в один <code>[]byte</code> (обережно з великими потоками: усе опиниться в пам'яті). Модель «труби» складається з таких цеглинок: Reader → обробка → Writer. Складність у тому, що самі цеглинки крихітні, а будівля виходить велика.",
      "Сила інтерфейсів проявляється в <b>обгортках</b>. Створіть структуру, що тримає інший <code>io.Writer</code>, і в її методі <code>Write</code> щось зробіть із байтами (переведіть у верхній регістр, порахуйте, відфільтруйте), а потім передайте далі. Для зовнішнього коду обгортка — такий самий Writer, і її можна вставити в будь-який ланцюжок, нічого не змінюючи. Так працюють шифрування, стиснення, підрахунок байтів, логування в стандартній бібліотеці. Те саме з Reader: обгортка читає з вкладеного Reader і змінює дані дорогою.",
      "Пастки. По-перше, <code>strings.NewReader</code> повертає <code>*strings.Reader</code>: метод <code>Read</code> має отримувач-вказівник (бо Reader запам'ятовує позицію), тож значення <code>strings.Reader{}</code> інтерфейсу <code>io.Reader</code> не відповідає, і компілятор скаже про це. По-друге, Reader одноразовий: після <code>io.ReadAll</code> повторне читання дасть порожній результат, бо позиція вже в кінці. По-третє, у циклі читання не порівнюйте <code>n</code> з нулем замість перевірки <code>io.EOF</code>: це може закінчитись нескінченним циклом. Ідіома: приймайте <code>io.Reader</code> і <code>io.Writer</code> замість <code>*os.File</code>, тоді функцію просто тестувати. Далі розглянемо ще один знайомий інтерфейс, <code>sort.Interface</code>.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"io"
	"strings"
)

func main() {
	r := strings.NewReader("привіт, Go!")
	buf := make([]byte, 8)
	for {
		n, err := r.Read(buf)
		fmt.Printf("n=%d %q\n", n, buf[:n])
		if err == io.EOF {
			break
		}
	}
}
`,
      String.raw`package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"strings"
)

func main() {
	fmt.Fprintln(os.Stdout, "це те саме, що Println")

	var buf bytes.Buffer
	fmt.Fprintf(&buf, "x=%d;", 42)
	buf.WriteString("y=7")
	fmt.Println(buf.String())

	n, err := io.Copy(os.Stdout, strings.NewReader("з рядка в консоль\n"))
	fmt.Println(n, err)

	data, _ := io.ReadAll(strings.NewReader("усе одразу"))
	fmt.Println(len(data), string(data))
}
`,
      String.raw`package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"strings"
)

type upperWriter struct{ w io.Writer }

func (u upperWriter) Write(p []byte) (int, error) {
	_, err := u.w.Write(bytes.ToUpper(p))
	return len(p), err
}

func main() {
	uw := upperWriter{os.Stdout}
	fmt.Fprintln(uw, "привіт, hello")
	io.Copy(uw, strings.NewReader("копія через обгортку\n"))
}
`,
      String.raw`// не компілюється: strings.Reader має метод Read з отримувачем *Reader, значення йому не відповідає
package main

import (
	"fmt"
	"io"
	"strings"
)

func main() {
	var r io.Reader = strings.Reader{}
	fmt.Println(r)
}
`,
    ],
    note: "Read: спершу обробіть n байтів, потім дивіться на err; io.EOF означає кінець потоку, а не збій. Writer мусить записати всі байти або повернути помилку. Reader одноразовий. Приймайте io.Reader/io.Writer замість конкретних типів.",
    work: "Файли, HTTP-тіла, стиснення, шифрування, логи й тести в Go спираються на io.Reader/io.Writer. Обробник, що приймає io.Writer, у тесті отримує bytes.Buffer, а в продакшені os.Stdout чи файл.",
    tasks: [
      "Чому в циклі читання треба спершу використати n прочитаних байтів, а вже потім перевіряти err на io.EOF?",
      "Як зробити Writer-обгортку, що рахує записані байти, і чому її можна підставити туди, де очікують io.Writer?",
    ],
  },
  {
    t: "sort.Interface і власне порівняння",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: "Щоб відсортувати колоду карт, не обов'язково знати, що на картах: досить уміти сказати, яка з двох вища, і поміняти їх місцями. <code>sort.Interface</code> — це саме така пара умінь плюс «скільки карт».",
    p: [
      "Алгоритм сортування не повинен знати про ваші дані: йому потрібні лише три операції. Скільки елементів (<code>Len() int</code>), чи має елемент <code>i</code> стояти раніше за елемент <code>j</code> (<code>Less(i, j int) bool</code>) і як поміняти два елементи місцями (<code>Swap(i, j int)</code>). Ці три методи разом — інтерфейс <code>sort.Interface</code>. Функція <code>sort.Sort(data)</code> приймає будь-що з цими методами: слайс структур, колекцію в мапі з індексами, навіть список, який лежить не в пам'яті. Це типовий приклад «малого інтерфейсу», з яким алгоритм відділений від даних.",
      "Як це виглядає на практиці. Для слайса <code>[]Person</code> оголошують новий тип <code>type byAge []Person</code> і дають йому три методи: <code>Len</code> повертає <code>len(a)</code>, <code>Swap</code> міняє <code>a[i], a[j] = a[j], a[i]</code>, <code>Less</code> порівнює потрібні поля. Потім <code>sort.Sort(byAge(people))</code>: перетворення типу не копіює дані, а лише дає той самий слайс нові методи. Для іншого порядку пишуть інший тип (<code>byName</code>), і дані лишаються тими самими. Модель у голові: сортування крутиться навколо індексів, а ви пояснюєте, що означає «менше».",
      "Кілька ключів порівнюють у <code>Less</code> каскадом: спершу головний ключ, а коли вони рівні, наступний. Наприклад, <code>if a[i].Dept != a[j].Dept { return a[i].Dept &lt; a[j].Dept }; return a[i].Salary &gt; a[j].Salary</code>. Для зворотного порядку для готових типів є <code>sort.Reverse</code>: <code>sort.Sort(sort.Reverse(sort.IntSlice(x)))</code>. Для простих випадків є <code>sort.Ints</code>, <code>sort.Strings</code>, <code>sort.Float64s</code>. Перевірити, що слайс уже відсортований, можна через <code>sort.IsSorted</code> або <code>slices.IsSorted</code>.",
      "Стабільність. <code>sort.Sort</code> <b>нестабільне</b>: елементи, що вважаються рівними, можуть опинитися в іншому порядку, ніж були. Якщо порядок рівних важливий (наприклад, спершу ви відсортували за іменем, тепер за відділом, і хочете, щоб імена всередині відділу лишились по порядку), використовуйте <code>sort.Stable</code> або <code>sort.SliceStable</code>. Нестабільний варіант швидший за пам'яттю й може дати інший порядок рівних на різних версіях Go, тому не покладайтеся на нього в тестах, де є рівні ключі.",
      "Тритомний інтерфейс на кожен тип — це багато церемоній, тому є легші шляхи. <code>sort.Slice(s, func(i, j int) bool { ... })</code> приймає слайс будь-якого типу й функцію <code>less</code> за індексами; вона працює через рефлексію, тож трохи повільніша. Сучасний варіант із Go 1.21 — <code>slices.SortFunc(s, func(a, b T) int { ... })</code>: функція отримує самі елементи й повертає від'ємне, нуль чи додатне число, як <code>cmp.Compare(a, b)</code>. Вона швидша, безпечніша за типами, а для кількох ключів зручна комбінація <code>cmp.Or(cmp.Compare(a.Dept, b.Dept), cmp.Compare(b.Salary, a.Salary))</code> (Go 1.22). Загальна порада: у новому коді беріть <code>slices.SortFunc</code>, а <code>sort.Interface</code> лишайте для структур даних із нетривіальним доступом.",
      "Пастки. Якщо типу бракує одного з трьох методів, <code>sort.Sort</code> не скомпілюється: <code>does not implement sort.Interface (missing method Swap)</code>. Функція <code>Less</code> має задавати <i>строгий</i> порядок: «менше», а не «менше або дорівнює». Якщо написати <code>&lt;=</code>, рівні елементи вважаються меншими один за одного, і результат стає непередбачуваним для стабільного сортування. Ще одна помилка — писати <code>Less</code> без урахування вже зміненого стану: Less і Swap працюють з поточним станом слайса, а не з початковим. Далі переходимо до generics: вони якраз дозволяють писати такі функції один раз для всіх типів.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"sort"
)

type Person struct {
	Name string
	Age  int
}

type byAge []Person

func (a byAge) Len() int           { return len(a) }
func (a byAge) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a byAge) Less(i, j int) bool { return a[i].Age < a[j].Age }

func main() {
	people := []Person{{"Оля", 31}, {"Іван", 25}, {"Марія", 28}}
	sort.Sort(byAge(people))
	fmt.Println(people)
	fmt.Println(sort.IsSorted(byAge(people)))

	nums := []int{5, 2, 8, 1}
	sort.Sort(sort.Reverse(sort.IntSlice(nums)))
	fmt.Println(nums)
}
`,
      String.raw`package main

import (
	"cmp"
	"fmt"
	"slices"
	"sort"
)

type Item struct {
	Group string
	Price int
}

func main() {
	items := []Item{{"b", 5}, {"a", 9}, {"b", 2}, {"a", 3}}

	sort.Slice(items, func(i, j int) bool {
		if items[i].Group != items[j].Group {
			return items[i].Group < items[j].Group
		}
		return items[i].Price < items[j].Price
	})
	fmt.Println(items)

	slices.SortFunc(items, func(a, b Item) int {
		return cmp.Or(cmp.Compare(a.Group, b.Group), cmp.Compare(b.Price, a.Price))
	})
	fmt.Println(items)
}
`,
      String.raw`package main

import (
	"fmt"
	"sort"
)

type Task struct {
	Name     string
	Priority int
}

func main() {
	tasks := []Task{{"a", 2}, {"b", 1}, {"c", 2}, {"d", 1}, {"e", 2}}
	sort.SliceStable(tasks, func(i, j int) bool {
		return tasks[i].Priority < tasks[j].Priority
	})
	fmt.Println(tasks)
}
`,
      String.raw`// не компілюється: типу бракує методу Swap, тому він не відповідає sort.Interface
package main

import (
	"fmt"
	"sort"
)

type nums []int

func (n nums) Len() int           { return len(n) }
func (n nums) Less(i, j int) bool { return n[i] < n[j] }

func main() {
	x := nums{3, 1, 2}
	sort.Sort(x)
	fmt.Println(x)
}
`,
    ],
    note: "sort.Interface: Len, Less, Swap. Less має бути строгим («менше»), sort.Sort нестабільне, для стабільності беріть sort.Stable/SliceStable. У новому коді найчастіше досить slices.SortFunc із cmp.Compare.",
    work: "Сортування звітів за кількома полями, топ-N за рейтингом, упорядкування черги за пріоритетом. sort.Interface зустрічається в бібліотеках і на структурах даних, а у прикладному коді його здебільшого заміняє slices.SortFunc.",
    tasks: [
      "Які три методи потрібні для sort.Interface і що робить кожен із них?",
      "Чим sort.Sort відрізняється від sort.Stable і коли різниця помітна?",
    ],
  },
  {
    t: "Generics: функції",
    ch: "Інтерфейси та generics",
    easy: "Generic-функція — це шаблон конверта: «лист розміром T». Один раз описуєте, як упакувати, а що саме лежить усередині (число, рядок, структура), вирішує той, хто викликає.",
    p: [
      "Припустімо, потрібна функція «більше з двох». Для <code>int</code> одна, для <code>float64</code> друга, для <code>string</code> третя, і тіла однакові. Раніше в Go обирали між копіюванням і <code>any</code> із твердженнями типів, яке втрачає перевірки компілятора. З версії 1.18 є <b>generics</b>: функція має <b>параметр типу</b>, який пишуть у квадратних дужках перед звичайними параметрами: <code>func Max[T cmp.Ordered](a, b T) T</code>. Тут <code>T</code> — ім'я типу-заповнювача, а <code>cmp.Ordered</code> — його <b>обмеження</b> (constraint): допустимі лише типи, для яких визначено <code>&lt;</code>, <code>&gt;</code>.",
      "Обмеження — це суть generics. Без нього компілятор не знав би, що можна робити зі значенням типу <code>T</code>. Тому з <code>T any</code> можна лише присвоювати, передавати й повертати значення, але не порівнювати й не додавати. Три найчастіші обмеження: <code>any</code> (будь-який тип, нічого не вимагає), <code>comparable</code> (типи, які можна порівнювати через <code>==</code>: числа, рядки, bool, вказівники, структури з такими полями) і <code>cmp.Ordered</code> (числа й рядки, для яких працює <code>&lt;</code>). Є ще й <code>constraints</code>-подібні набори, але для старту цих трьох досить.",
      "Виклик. Найчастіше тип писати не треба: компілятор <b>виводить</b> його з аргументів: <code>Max(3, 7)</code> дає <code>T = int</code>, <code>Max(\"a\", \"b\")</code> — <code>T = string</code>. Явно вказують так: <code>Max[float64](1, 2.5)</code>. Явний варіант потрібен, коли вивести нема з чого (наприклад, функція повертає <code>T</code>, а параметрів типу <code>T</code> немає) або коли хочете інший тип, ніж за замовчуванням. Для змішаних аргументів на кшталт <code>Max(1, 2.5)</code> літерали-константи підлаштовуються під спільний тип <code>float64</code>, а ось змінні різних типів дадуть помилку.",
      "Модель у голові: для кожного набору типів, із якими функцію викликали, компілятор (концептуально) створює окрему версію, як ніби ви самі написали <code>MaxInt</code>, <code>MaxString</code>. Тому під час виконання немає ні рефлексії, ні твердження типів, а помилки типів ловляться на етапі збирання. Дрібна пастка: нульове значення <code>T</code> отримують через <code>var zero T</code>, бо для <code>any</code> не можна написати <code>nil</code> чи <code>0</code>. Типова ідіома: <code>func First[T any](s []T) (T, bool)</code> повертає нуль і <code>false</code> на порожньому слайсі.",
      "Приклади по сходинках. Найпростіший: <code>Max</code> з <code>cmp.Ordered</code>. Далі <code>Index[T comparable](s []T, v T) int</code> шукає елемент за <code>==</code>: для <code>[]string</code> і <code>[]int</code> один код. І <code>Reverse[T any](s []T) []T</code>, якому порівняння не потрібні, тому достатньо <code>any</code>. Обирайте <b>найслабше обмеження, яке дозволяє тіло функції</b>: тоді вона працює з найбільшою кількістю типів.",
      "Коли generics <i>не</i> потрібні. Якщо функція лише викликає методи значення, інтерфейс простіший: <code>func Print(s fmt.Stringer)</code> не потребує <code>[T fmt.Stringer]</code>. Якщо тип один, нічого узагальнювати. Не кидайтесь переписувати все: «два-три однакові цикли» інколи читаються краще за абстракцію. А з готового вже є потрібне: вбудовані <code>min</code>, <code>max</code> (Go 1.21), пакети <code>slices</code> (<code>slices.Contains</code>, <code>slices.Index</code>, <code>slices.Max</code>) і <code>maps</code>. Пастки покажемо в прикладі 4: <code>T any</code> не підтримує оператор <code>+</code>, і компілятор скаже про це прямо. Далі: generic-типи, наприклад <code>Stack[T]</code>.",
    ],
    code: [
      String.raw`package main

import (
	"cmp"
	"fmt"
)

func Max[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func main() {
	fmt.Println(Max(3, 7))
	fmt.Println(Max("яблуко", "банан"))
	fmt.Println(Max[float64](1, 2.5))
	fmt.Println(max(3, 7, 5))
}
`,
      String.raw`package main

import "fmt"

func Index[T comparable](s []T, v T) int {
	for i, x := range s {
		if x == v {
			return i
		}
	}
	return -1
}

type Point struct{ X, Y int }

func main() {
	fmt.Println(Index([]string{"a", "b", "c"}, "c"))
	fmt.Println(Index([]int{10, 20}, 5))
	fmt.Println(Index([]Point{{1, 2}, {3, 4}}, Point{3, 4}))
}
`,
      String.raw`package main

import "fmt"

func First[T any](s []T) (T, bool) {
	if len(s) == 0 {
		var zero T
		return zero, false
	}
	return s[0], true
}

func Reverse[T any](s []T) []T {
	out := make([]T, len(s))
	for i, x := range s {
		out[len(s)-1-i] = x
	}
	return out
}

func main() {
	fmt.Println(First([]int{7, 8}))
	fmt.Println(First([]string{}))
	fmt.Println(Reverse([]string{"a", "b", "c"}))
}
`,
      String.raw`// не компілюється: оператор + не визначений для T з обмеженням any
package main

import "fmt"

func Sum[T any](s []T) T {
	var total T
	for _, x := range s {
		total += x
	}
	return total
}

func main() {
	fmt.Println(Sum([]int{1, 2, 3}))
}
`,
    ],
    note: "func F[T Обмеження](...) — параметр типу в квадратних дужках. Обмеження визначає, що можна робити з T: any (нічого), comparable (==), cmp.Ordered (&lt; &gt;). Тип зазвичай виводиться сам; обирайте найслабше обмеження, яке підходить.",
    work: "Допоміжні функції для слайсів і мап (пошук, перетворення, мін/макс), що не залежать від типу елементів, пишуть generic-ом, а у стандартній бібліотеці вони вже є в slices і maps.",
    tasks: [
      "Чому з параметром T any не можна написати a &lt; b, і яке обмеження це дозволяє?",
      "Коли компілятор виводить параметр типу сам, а коли його треба вказати явно?",
    ],
  },
  {
    t: "Generics: типи й обмеження",
    ch: "Інтерфейси та generics",
    easy: "Generic-функція — це рецепт, а generic-тип — форма для випічки: форма одна, а тісто (int, string, власна структура) кожен кладе своє. Обмеження — напис на формі: «лише для борошняного тіста».",
    p: [
      "Попередній урок узагальнював функції. Але однаково влаштовані й <b>структури даних</b>: стек, черга, кеш, реєстр. Без generics лишалось два погані шляхи: зберігати <code>[]any</code> (кожне читання потребує твердження типу, а компілятор не завадить покласти в «стек чисел» рядок) або копіювати код для <code>IntStack</code>, <code>StringStack</code> тощо. Generic-тип виглядає так: <code>type Stack[T any] struct { items []T }</code>. Після імені в квадратних дужках іде список параметрів типу з обмеженнями, так само, як у функції.",
      "Модель у голові: <code>Stack</code> без підстановки — не тип, а «рецепт типу». Тип з'являється, коли підставлено аргумент: <code>Stack[int]</code> і <code>Stack[string]</code> — це два <b>різні</b> типи, між собою несумісні. Для типів компілятор не виводить аргумент сам (виведення працює лише для викликів функцій), тому в оголошенні змінної пишуть явно: <code>var s Stack[int]</code>. Нульове значення такого стека одразу придатне до роботи, бо nil-слайс усередині годиться для <code>append</code>. Зручний конструктор: <code>func NewStack[T any]() *Stack[T]</code>, його викликають як <code>NewStack[string]()</code>.",
      "<b>Методи.</b> У приймачі параметр типу <b>повторюють</b>: <code>func (s *Stack[T]) Push(v T)</code>. Тут <code>T</code> не оголошується заново, а називає параметр самого типу, тому в методах його можна вживати як звичайний тип, зокрема <code>var zero T</code> для нульового значення. Приймач, як і раніше, вказівник, якщо метод змінює стан: <code>Push</code> і <code>Pop</code> міняють слайс усередині, отже, потрібен <code>*Stack[T]</code>. Важлива межа: <b>метод не може мати власних параметрів типу</b>. Запис <code>func (s *Stack[T]) Map[U any](...)</code> не скомпілюється; такий випадок розв'язують звичайною generic-функцією <code>Map[T, U any](s *Stack[T], ...)</code>. Причина проста: набір методів типу має бути відомий наперед, щоб тип міг реалізовувати інтерфейси.",
      "<b>Власні обмеження.</b> Обмеження — це інтерфейс, але такий, що може перелічувати типи: <code>type Number interface { ~int | ~int64 | ~float64 }</code>. Вертикальна риска означає «або» (union). Тильда <code>~int</code> читається так: «будь-який тип, чий <i>базовий</i> тип int», тобто й <code>int</code>, і <code>type Score int</code>. Без тильди підійшов би лише точно <code>int</code>, а <code>Score</code> компілятор відхилив би повідомленням на кшталт <code>Score does not satisfy Number (possible missing ~ for int in Number)</code>. Тому в переліках майже завжди ставлять тильду. У тілі функції з <code>T Number</code> доступні лише операції, спільні для всіх членів переліку: <code>+</code>, <code>&lt;</code>, конвертація <code>float64(x)</code>.",
      "Обмеження комбінують. Можна додати методи й вбудувати <code>comparable</code>: <code>type Entity interface { comparable; ID() string }</code> вимагає і <code>==</code>, і метод <code>ID</code>. Тоді <code>Registry[T Entity]</code> зможе порівнювати елементи й викликати <code>ID()</code>. Інтерфейс з переліком типів (з <code>|</code> або <code>~</code>) можна вживати <b>лише як обмеження</b>: <code>var n Number</code> дасть помилку <code>cannot use type Number outside a type constraint</code>. Для звичайних змінних інтерфейси з методів лишаються такими, як у попередніх уроках.",
      "Ідіоми й пастки. Обирайте найслабше обмеження: контейнеру, який лише зберігає елементи, достатньо <code>any</code>; <code>comparable</code> потрібен, коли є <code>==</code> або ключі мапи; перелік з тильдами, коли потрібна арифметика. Нульове значення завжди через <code>var zero T</code>. Не вигадуйте параметрів типу «про запас»: якщо стек потрібен лише для int, пишіть звичайний тип. Пам'ятайте й про вартість: повідомлення компілятора про generics довші, а код складніший для читання, ніж конкретний. У наступному уроці на цих блоках зберемо Map, Filter, Set.",
    ],
    code: [
      String.raw`package main

import "fmt"

type Stack[T any] struct {
	items []T
}

func NewStack[T any]() *Stack[T] {
	return &Stack[T]{}
}

func (s *Stack[T]) Push(v T) {
	s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	last := len(s.items) - 1
	v := s.items[last]
	s.items = s.items[:last]
	return v, true
}

func (s *Stack[T]) Len() int { return len(s.items) }

func main() {
	var ints Stack[int]
	ints.Push(1)
	ints.Push(2)
	fmt.Println(ints.Len())
	fmt.Println(ints.Pop())

	names := NewStack[string]()
	names.Push("Оля")
	fmt.Println(names.Pop())
	fmt.Println(names.Pop())
}
`,
      String.raw`package main

import "fmt"

type Number interface {
	~int | ~int64 | ~float64
}

type Celsius float64

func Sum[T Number](s []T) T {
	var total T
	for _, x := range s {
		total += x
	}
	return total
}

func Average[T Number](s []T) float64 {
	if len(s) == 0 {
		return 0
	}
	return float64(Sum(s)) / float64(len(s))
}

func main() {
	fmt.Println(Sum([]int{1, 2, 3}))
	fmt.Println(Sum([]Celsius{20.5, 1.5}))
	fmt.Println(Average([]int{1, 2}))
}
`,
      String.raw`package main

import "fmt"

type Entity interface {
	comparable
	ID() string
}

type User struct{ Name string }

func (u User) ID() string { return "user:" + u.Name }

type Registry[T Entity] struct {
	items []T
}

func (r *Registry[T]) Add(e T) bool {
	for _, x := range r.items {
		if x == e {
			return false
		}
	}
	r.items = append(r.items, e)
	return true
}

func (r *Registry[T]) IDs() []string {
	out := make([]string, 0, len(r.items))
	for _, x := range r.items {
		out = append(out, x.ID())
	}
	return out
}

func main() {
	r := &Registry[User]{}
	fmt.Println(r.Add(User{"ada"}), r.Add(User{"bob"}), r.Add(User{"ada"}))
	fmt.Println(r.IDs())
}
`,
      String.raw`// не компілюється: метод не може мати власних параметрів типу
package main

import "fmt"

type Stack[T any] struct{ items []T }

func (s *Stack[T]) Map[U any](f func(T) U) []U {
	out := make([]U, 0, len(s.items))
	for _, x := range s.items {
		out = append(out, f(x))
	}
	return out
}

func main() {
	s := Stack[int]{items: []int{1, 2}}
	fmt.Println(s.Map(func(n int) string { return "x" }))
}
`,
    ],
    note: "type Stack[T any] struct{...}: тип з параметром, у методах приймач (s *Stack[T]). Метод не має власних параметрів типу. Обмеження-перелік: ~int | ~float64 (тильда пускає і власні типи на основі int). Такий інтерфейс лише для обмежень, не для змінних.",
    work: "Generic-типи пишуть для контейнерів і обгорток: кеш з обмеженням ключа comparable, черга задач, пул, результат Optional/Result, реєстр сутностей. Числові обмеження з тильдою зустрічаються в допоміжних бібліотеках для сум, середніх, мін/макс.",
    tasks: [
      "Чому Stack[int] і Stack[string] — різні типи й чому метод не може мати власний параметр типу?",
      "Яка різниця між обмеженнями int | float64 і ~int | ~float64 для типу type Score int?",
    ],
  },
  {
    t: "Generics на практиці: Map, Filter, Set",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: "Map, Filter і Reduce — три операції конвеєра над списком: «перетвори кожен», «залиш потрібні», «зведи до одного». Set — мішок без повторів: питання лише «є чи нема».",
    p: [
      "Цикли над слайсами повторюються постійно: «зробити з кожного елемента щось», «залишити лише ті, що підходять», «звести до однієї суми». Тіла відрізняються, а скелет однаковий. Generics дозволяють написати скелет один раз і передавати відмінну частину функцією. Одразу застереження: у Go простий цикл <code>for</code> часто читається краще за ланцюжок викликів, тому узагальнюють лише тоді, коли шаблон справді повторюється або типи громіздкі.",
      "<b>Map</b>: <code>func Map[T, U any](s []T, f func(T) U) []U</code>. Два параметри типу: <code>T</code> (елемент входу) і <code>U</code> (елемент виходу). Обидва компілятор виводить сам: з <code>s</code> бере <code>T</code>, а з типу повернення функції-літерала <code>func(n int) string</code> бере <code>U = string</code>. <b>Filter</b>: <code>func Filter[T any](s []T, keep func(T) bool) []T</code>, один параметр типу. <b>Reduce</b>: <code>func Reduce[T, A any](s []T, init A, f func(A, T) A) A</code>, де акумулятор <code>A</code> може бути іншого типу, ніж елемент: наприклад, сума довжин рядків (<code>T = string</code>, <code>A = int</code>).",
      "Деталі реалізації, які відрізняють акуратний код. У <code>Map</code> довжина результату відома наперед, тож виділяйте пам'ять одразу: <code>out := make([]U, 0, len(s))</code>, це одна алокація замість кількох. Обидві функції повертають <b>новий</b> слайс і не чіпають вхідний: інакше виклик <code>Filter</code> несподівано зіпсував би чужі дані. У стандартній бібліотеці Go 1.24 готових <code>Map</code> і <code>Filter</code> для слайсів немає, але є <code>slices.IndexFunc</code>, <code>slices.ContainsFunc</code>, <code>slices.DeleteFunc</code>, <code>slices.SortFunc</code> та <code>slices.Collect</code> для ітераторів (Go 1.23).",
      "<b>Set.</b> Окремого типу множини в Go немає. Ідіома: мапа, де значення нічого не важить: <code>type Set[T comparable] map[T]struct{}</code>. Порожня структура <code>struct{}</code> займає нуль байтів. Параметр <code>comparable</code> обов'язковий, бо ключі мапи мають порівнюватися. Методи: <code>Add</code> (<code>s[v] = struct{}{}</code>), <code>Has</code> (<code>_, ok := s[v]</code>), <code>Len</code> (<code>len(s)</code>). Приймач — значення, не вказівник, бо мапа вже посилання. Але <code>Set[string]{}</code> треба ініціалізувати: запис у nil-мапу — аварія. Порядок обходу мапи випадковий, тож для стабільного виводу сортуйте ключі: <code>slices.Sorted(maps.Keys(s))</code> (Go 1.23, потрібен <code>cmp.Ordered</code>).",
      "<b>Pair</b>: <code>type Pair[K comparable, V any] struct { Key K; Val V }</code> — generic-тип із двома параметрами. Корисний, коли треба повернути або зберегти два значення разом: <code>Zip</code> двох слайсів, мапа, розгорнута в слайс пар для сортування. Різниця у виведенні: у функції (<code>Zip(keys, vals)</code>) типи виводяться, а в літералі структури їх пишуть явно: <code>Pair[string, int]{\"a\", 1}</code>.",
      "Пастки. <code>Set[[]int]</code> не скомпілюється: слайс не <code>comparable</code>, а повідомлення <code>[]int does not satisfy comparable</code> показує це прямо. Якщо у <code>Reduce</code> літерал початкового значення <code>0</code> не збігається з бажаним типом акумулятора, вкажіть його явно: <code>Reduce[string, float64](...)</code>. І головне питання: <b>коли узагальнювати</b>. Практичне правило: спершу напишіть для конкретного типу, а узагальнюйте, коли з'явиться другий випадок із тим самим тілом. Не варто, коли вистачає інтерфейсу (<code>io.Reader</code>), коли тип один, коли це бізнес-логіка. Далі: як проєктувати власні інтерфейси.",
    ],
    code: [
      String.raw`package main

import "fmt"

func Map[T, U any](s []T, f func(T) U) []U {
	out := make([]U, 0, len(s))
	for _, x := range s {
		out = append(out, f(x))
	}
	return out
}

func Filter[T any](s []T, keep func(T) bool) []T {
	var out []T
	for _, x := range s {
		if keep(x) {
			out = append(out, x)
		}
	}
	return out
}

func Reduce[T, A any](s []T, init A, f func(A, T) A) A {
	acc := init
	for _, x := range s {
		acc = f(acc, x)
	}
	return acc
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6}
	fmt.Println(Map(nums, func(n int) int { return n * n }))
	fmt.Println(Map(nums, func(n int) string { return fmt.Sprintf("#%d", n) }))
	fmt.Println(Filter(nums, func(n int) bool { return n%2 == 0 }))
	fmt.Println(Reduce(nums, 0, func(acc, n int) int { return acc + n }))
	words := []string{"go", "rust", "c"}
	fmt.Println(Reduce(words, 0, func(acc int, w string) int { return acc + len(w) }))
}
`,
      String.raw`package main

import (
	"cmp"
	"fmt"
	"maps"
	"slices"
)

type Set[T comparable] map[T]struct{}

func (s Set[T]) Add(v T)      { s[v] = struct{}{} }
func (s Set[T]) Has(v T) bool { _, ok := s[v]; return ok }

func Sorted[T cmp.Ordered](s Set[T]) []T {
	return slices.Sorted(maps.Keys(s))
}

func Unique[T comparable](s []T) []T {
	seen := Set[T]{}
	var out []T
	for _, v := range s {
		if !seen.Has(v) {
			seen.Add(v)
			out = append(out, v)
		}
	}
	return out
}

func main() {
	s := Set[string]{}
	s.Add("go")
	s.Add("go")
	s.Add("rust")
	s.Add("c")
	fmt.Println(len(s), s.Has("go"), s.Has("java"))
	fmt.Println(Sorted(s))
	fmt.Println(Unique([]int{3, 1, 3, 2, 1}))
}
`,
      String.raw`package main

import "fmt"

type Pair[K comparable, V any] struct {
	Key K
	Val V
}

func Zip[K comparable, V any](keys []K, vals []V) []Pair[K, V] {
	n := min(len(keys), len(vals))
	out := make([]Pair[K, V], 0, n)
	for i := range n {
		out = append(out, Pair[K, V]{keys[i], vals[i]})
	}
	return out
}

func main() {
	ps := Zip([]string{"a", "b", "c"}, []int{1, 2})
	fmt.Println(ps)
	fmt.Printf("%+v\n", ps[0])
	p := Pair[string, bool]{"ok", true}
	fmt.Println(p.Key, p.Val)
}
`,
      String.raw`// не компілюється: слайс не comparable, ключем мапи (отже, елементом Set) бути не може
package main

import "fmt"

type Set[T comparable] map[T]struct{}

func main() {
	s := Set[[]int]{}
	fmt.Println(len(s))
}
`,
    ],
    note: "Map[T, U any], Filter[T any], Reduce[T, A any] пишуть один раз; Set[T comparable] = map[T]struct{}. Результат нового слайса, вхідний не чіпаємо. Узагальнюйте, коли тіло справді повторюється; один тип або інтерфейс простіші.",
    work: "У проєктах такі допоміжні функції лежать у пакеті utils: перетворення списку записів на список id, фільтрація за умовою, унікальні значення, групування. Set зручний для перевірки «вже бачили» під час обробки даних і для прав доступу.",
    tasks: [
      "Чому в Set[T] параметр має обмеження comparable, а в Map[T, U] достатньо any?",
      "Чим Reduce відрізняється від Map за типами параметрів і навіщо йому окремий параметр A?",
    ],
  },
  {
    t: "Проєктування інтерфейсів",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: "Розетка не знає, що до неї вмикають: чайник, зарядку чи лампу. Їй потрібен лише штекер. Добрий інтерфейс у Go схожий на штекер: описує мінімум, потрібний споживачеві, і нічого зайвого.",
    p: [
      "Інтерфейси в Go реалізуються <b>неявно</b> (уроки 40–41): тип не оголошує, що він «implements», досить мати потрібні методи. Через це їх проєктують інакше, ніж у мовах із явною реалізацією. Інтерфейс не обов'язково створювати заздалегідь разом із типом: його можна описати пізніше й деінде, там, де він справді потрібен. Без цього розуміння з'являються «інтерфейси-слони» на десяток методів, які неможливо підмінити в тесті, бо кожен фейк змушений реалізовувати всі десять.",
      "<b>Малі інтерфейси.</b> У стандартній бібліотеці взірці крихітні: <code>io.Reader</code> і <code>io.Writer</code> мають по одному методу, <code>fmt.Stringer</code> один, <code>sort.Interface</code> три. Прислів'я Роба Пайка: чим більший інтерфейс, тим слабша абстракція. Чим менше методів, тим більше типів його задовольняє і тим легше його підмінити. Складніші вимоги збирають вбудовуванням: <code>type ReadWriter interface { Reader; Writer }</code>. Імена одно- й двометодних інтерфейсів зазвичай закінчуються на «-er»: <code>Reader</code>, <code>Closer</code>, <code>NameGetter</code>.",
      "<b>Інтерфейс на стороні споживача.</b> Інтерфейс описує той код, який <i>використовує</i> значення, а не той, що його створює. Пакет зі сховищем віддає конкретну структуру з усіма методами (<code>Get</code>, <code>Put</code>, <code>Delete</code>, <code>List</code>). А пакет із бізнес-логікою оголошує в себе інтерфейс лише з тих методів, які реально викликає, наприклад із єдиного <code>Get</code>. Структура сховища реалізує його, не знаючи про його існування, тож жодної залежності від постачальника. Ми працюємо в одному файлі, але принцип той самий: інтерфейс стоїть там, де його викликають.",
      "<b>«Приймай інтерфейс, повертай структуру».</b> Параметри функцій і конструкторів роблять інтерфейсами: викликач передасть файл, буфер чи фейк. Повертають зазвичай <b>конкретний тип</b>: викликач бачить усі його поля й методи і сам вирішує, до якого інтерфейсу його звузити. Якщо конструктор повертає інтерфейс, усе, чого в ньому немає, для викликача зникає (приклад 4: <code>s.Put undefined</code>), а повернути структуру з інтерфейсом, який вона реалізує, завжди можна пізніше. Винятки: фабрика, що повертає різні реалізації залежно від умови, і стандартний <code>error</code>.",
      "<b>Готовність до моків.</b> Якщо залежність описана малим інтерфейсом, у тесті її замінюють фейком на кілька рядків, без жодних фреймворків: <code>type fakeNames map[int]string</code> із методом <code>Get</code>. Це й критерій якості дизайну: якщо фейк довелося б писати на двадцять методів, інтерфейс завеликий або описаний не на тій стороні. У прикладі 3 тест такого фейка написано вручну циклом із виводом <code>ok</code>/<code>FAIL</code>, як і прийнято в цьому курсі, де немає окремих <code>_test.go</code>.",
      "Ідіоми й пастки. Не створюйте інтерфейс «про запас» для єдиної реалізації, поки його ніхто не підміняє: це зайва індирекція, а не гнучкість (стиль <code>IUserService</code> із Java в Go не прижився). Перевірку реалізації під час компіляції пишуть так: <code>var _ NameGetter = (*MemStore)(nil)</code>. Якщо метод зникне, помилка вкаже саме на це місце, а не на виклик за тисячу рядків. Не додавайте до інтерфейсу метод лише тому, що він «є в типі». Далі: пакет <code>reflect</code>, який дивиться на значення під час виконання.",
    ],
    code: [
      String.raw`package main

import "fmt"

type NameGetter interface {
	Get(id int) (string, bool)
}

type MemStore struct{ names map[int]string }

func NewMemStore() *MemStore {
	return &MemStore{names: map[int]string{1: "Оля", 2: "Тарас"}}
}

func (m *MemStore) Get(id int) (string, bool) {
	n, ok := m.names[id]
	return n, ok
}

func (m *MemStore) Put(id int, name string) { m.names[id] = name }

var _ NameGetter = (*MemStore)(nil)

type Greeter struct{ names NameGetter }

func NewGreeter(n NameGetter) *Greeter { return &Greeter{names: n} }

func (g *Greeter) Greet(id int) string {
	if name, ok := g.names.Get(id); ok {
		return "Привіт, " + name + "!"
	}
	return "Привіт, незнайомцю!"
}

func main() {
	store := NewMemStore()
	store.Put(3, "Іра")
	g := NewGreeter(store)
	fmt.Println(g.Greet(1))
	fmt.Println(g.Greet(3))
	fmt.Println(g.Greet(9))
}
`,
      String.raw`package main

import "fmt"

type Reader interface{ Read() (string, bool) }
type Writer interface{ Write(s string) }
type ReadWriter interface {
	Reader
	Writer
}

type Queue struct{ items []string }

func (q *Queue) Write(s string) { q.items = append(q.items, s) }

func (q *Queue) Read() (string, bool) {
	if len(q.items) == 0 {
		return "", false
	}
	s := q.items[0]
	q.items = q.items[1:]
	return s, true
}

var _ ReadWriter = (*Queue)(nil)

type printer struct{}

func (printer) Write(s string) { fmt.Println("->", s) }

func Relay(from Reader, to Writer) int {
	n := 0
	for {
		s, ok := from.Read()
		if !ok {
			return n
		}
		to.Write(s)
		n++
	}
}

func main() {
	in := &Queue{}
	in.Write("a")
	in.Write("b")
	out := &Queue{}
	fmt.Println(Relay(in, out), out.items)

	in.Write("x")
	Relay(in, printer{})
}
`,
      String.raw`package main

import "fmt"

type NameGetter interface {
	Get(id int) (string, bool)
}

type Greeter struct{ names NameGetter }

func NewGreeter(n NameGetter) *Greeter { return &Greeter{names: n} }

func (g *Greeter) Greet(id int) string {
	if name, ok := g.names.Get(id); ok {
		return "Привіт, " + name + "!"
	}
	return "Привіт, незнайомцю!"
}

type fakeNames map[int]string

func (f fakeNames) Get(id int) (string, bool) {
	n, ok := f[id]
	return n, ok
}

func main() {
	g := NewGreeter(fakeNames{7: "Тест"})
	cases := []struct {
		id   int
		want string
	}{
		{7, "Привіт, Тест!"},
		{8, "Привіт, незнайомцю!"},
	}
	for _, c := range cases {
		if got := g.Greet(c.id); got == c.want {
			fmt.Println("ok", c.id)
		} else {
			fmt.Println("FAIL", c.id, got)
		}
	}
}
`,
      String.raw`// не компілюється: конструктор повернув інтерфейс, і метод Put структури став недоступним
package main

import "fmt"

type Getter interface {
	Get(id int) (string, bool)
}

type MemStore struct{ names map[int]string }

func (m *MemStore) Get(id int) (string, bool) {
	n, ok := m.names[id]
	return n, ok
}

func (m *MemStore) Put(id int, name string) { m.names[id] = name }

func NewMemStore() Getter {
	return &MemStore{names: map[int]string{}}
}

func main() {
	s := NewMemStore()
	s.Put(1, "Оля")
	fmt.Println(s.Get(1))
}
`,
    ],
    note: "Інтерфейс малий (1–3 методи), описується там, де його використовують, а не там, де реалізують. Функції приймають інтерфейс, конструктори повертають структуру. Якщо фейк для тесту довгий, інтерфейс завеликий.",
    work: "У сервісах бізнес-логіка залежить від малих інтерфейсів (сховище, відправник листів, годинник), а в тестах їх підміняють фейками на кілька рядків. Конкретні клієнти бази й HTTP повертають структури, щоб викликач бачив усі їхні можливості.",
    tasks: [
      "Чому інтерфейс у Go зручніше оголошувати на стороні споживача, а не поруч із типом, що його реалізує?",
      "Чому конструктор зазвичай повертає структуру, а не інтерфейс, і коли виняток виправданий?",
    ],
  },
  {
    t: "reflect: основи",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: "Звичайний код працює з типами, відомими під час написання. reflect схожий на рентген: показує, з чого складається значення, коли програма вже працює. Корисно, але повільно й вимагає обережності.",
    p: [
      "Є функції, які мають працювати зі значеннями, чий тип автор не знає: <code>encoding/json</code>, <code>fmt.Printf(\"%v\")</code>, ORM, валідатори, шаблонізатори. Їм потрібно під час виконання з'ясувати, що це структура, які в неї поля, які теги. Без цього лишається лише type switch над заздалегідь відомим набором типів. Для таких задач існує пакет <code>reflect</code>. Прикладний код його майже не потребує: це інструмент авторів бібліотек, і знати його варто, щоб розуміти, як працює <code>json</code>.",
      "Модель у голові. Значення в <code>any</code> — це пара «тип + дані» (уроки про <code>any</code>). <code>reflect</code> дозволяє розкрити цю пару. <code>reflect.TypeOf(x)</code> повертає <code>reflect.Type</code>, опис типу: <code>Name()</code>, <code>Kind()</code>, <code>NumField()</code>, <code>Field(i)</code>, <code>Elem()</code>. <code>reflect.ValueOf(x)</code> повертає <code>reflect.Value</code>, обгортку над даними: <code>Kind()</code>, <code>Int()</code>, <code>String()</code>, <code>Field(i)</code>, <code>IsZero()</code>, <code>Interface()</code> (повернення до <code>any</code>).",
      "<b>Type і Kind.</b> Тип конкретний, наприклад <code>main.Celsius</code>. Kind — це «порода»: <code>float64</code>, <code>struct</code>, <code>slice</code>, <code>map</code>, <code>ptr</code>, <code>string</code>. Для <code>type Celsius float64</code> тип — <code>main.Celsius</code>, а Kind — <code>float64</code>. <code>Name()</code> порожній для безіменних типів на кшталт <code>[]int</code> чи <code>*User</code>. Код майже завжди розгалужується саме за <code>Kind</code>. Типова пастка: <code>ValueOf(&amp;u)</code> має Kind <code>ptr</code>, а не <code>struct</code>; щоб дістатися до структури, викликають <code>.Elem()</code> (або <code>reflect.Indirect</code>).",
      "<b>Обхід полів і теги.</b> Тег — рядок у зворотних апострофах після типу поля: <code>json:\"name\" validate:\"required\"</code>. Читається він через <code>f.Tag.Get(\"json\")</code>; <code>f.Tag.Lookup</code> додатково каже, чи ключ узагалі є. Обхід: <code>t := reflect.TypeOf(u)</code>, далі <code>for i := range t.NumField()</code> (цикл за числом, Go 1.22) і <code>t.Field(i)</code> дає <code>Name</code>, <code>Type</code>, <code>Tag</code>, а <code>v.Field(i)</code> дає значення. Неекспортовані поля (з малої літери) видно за ім'ям і типом, але <code>Interface()</code> на їхньому значенні спричиняє аварію. Перевіряйте <code>f.IsExported()</code> (або <code>v.Field(i).CanInterface()</code>) перед читанням.",
      "<b>Зміна значень.</b> <code>reflect.ValueOf(u)</code> працює з <i>копією</i>, тому <code>SetInt</code> на ній завершується аварією <code>using unaddressable value</code> (приклад 4). Щоб змінювати, передайте вказівник і розгорніть його: <code>reflect.ValueOf(&amp;u).Elem()</code>. Тоді <code>CanSet()</code> стане <code>true</code> для експортованих полів, і працюють <code>SetInt</code>, <code>SetString</code>, <code>FieldByName(\"Age\")</code>. Саме так бібліотеки заповнюють вашу структуру даними з JSON.",
      "<b>Ціна й застереження.</b> Рефлексія в рази повільніша за прямий код і ховає помилки від компілятора: виклик <code>Int()</code> на рядку чи <code>Field(5)</code> на структурі з трьох полів дає аварію вже під час роботи, а не під час збирання. Код із ним важче читати. Правило: <code>reflect</code> — крайній засіб. Спершу спробуйте звичайний інтерфейс, type switch або generics. Якщо без нього не обійтися, тримайте його в одному місці, завжди перевіряйте <code>Kind</code> перед викликом методів, що очікують певний вид, і не використовуйте в гарячих циклах. Далі: глава про помилки.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"reflect"
)

type Celsius float64

type User struct{ Name string }

func describe(x any) {
	t := reflect.TypeOf(x)
	fmt.Printf("%v | name=%q | kind=%v\n", t, t.Name(), t.Kind())
}

func main() {
	describe(42)
	describe("hi")
	describe(Celsius(36.6))
	describe([]int{1})
	describe(User{"Ada"})
	describe(&User{"Ada"})
}
`,
      String.raw`package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Name  string ${BT}json:"name" validate:"required"${BT}
	Age   int    ${BT}json:"age"${BT}
	token string
}

func main() {
	u := User{"Ada", 36, "secret"}
	t := reflect.TypeOf(u)
	v := reflect.ValueOf(u)
	for i := range t.NumField() {
		f := t.Field(i)
		if !f.IsExported() {
			fmt.Println(f.Name, "- неекспортоване, пропускаємо")
			continue
		}
		fmt.Println(f.Name, f.Type, f.Tag.Get("json"), f.Tag.Get("validate"), v.Field(i).Interface())
	}
}
`,
      String.raw`package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{"Ada", 36}
	e := reflect.ValueOf(&u).Elem()
	fmt.Println(e.Kind(), e.CanSet())
	e.FieldByName("Age").SetInt(37)
	e.FieldByName("Name").SetString("Ada L.")
	fmt.Println(u)
}
`,
      String.raw`// аварія: reflect.ValueOf(u) працює з копією, і SetInt на ній заборонений
package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{"Ada", 36}
	v := reflect.ValueOf(u)
	fmt.Println(v.Field(1).CanSet())
	v.Field(1).SetInt(37)
	fmt.Println(u)
}
`,
    ],
    note: "reflect.TypeOf дає тип (Name, Kind, Field), reflect.ValueOf дає значення (Field, Interface, Set…). Теги: f.Tag.Get(\"json\"). Змінювати можна лише через вказівник: ValueOf(&amp;x).Elem(). Це крайній засіб: повільно, без перевірок компілятора.",
    work: "Рефлексією користуються бібліотеки: encoding/json, ORM, валідатори полів за тегами, генератори форм і документації. У прикладному коді її пишуть рідко, зате розуміння допомагає читати чужі бібліотеки й розбирати, чому json пропускає поля з малої літери.",
    tasks: [
      "Чим відрізняються Type і Kind для типу type Celsius float64, і навіщо розгалужувати код саме за Kind?",
      "Чому SetInt на reflect.ValueOf(u) завершується аварією і що потрібно змінити, щоб поле можна було змінити?",
    ],
  },
];
