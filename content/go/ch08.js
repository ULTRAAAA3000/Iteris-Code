const BT = "`";

export const LESSONS_08 = [
  {
    t: "Пакет strings і strings.Builder",
    ch: "Стандартна бібліотека",
    easy: "Рядок у Go — це незмінна стрічка байтів, як надрукований рядок на папері: правити його на місці не можна, можна лише скласти новий. Пакет strings — набір ножиць і клею для таких стрічок: розрізати, склеїти, обрізати краї, знайти потрібний шматок. А strings.Builder — це чернетка, в яку швидко дописують, поки не скажуть «готово».",
    p: [
      "Майже кожна програма щось робить із текстом: розбирає рядок конфігурації, чистить ввід користувача, складає звіт, шукає слово. Рядкові операції настільки часті, що в Go для них є окремий пакет <code>strings</code> зі сотнею готових функцій. Без нього ви щоразу писали б цикл по байтах, помилялися на кордонах і плутали б байти з символами. Тому правило таке: перш ніж писати власний цикл по рядку, перевірте, чи немає потрібної функції в <code>strings</code>. Усі функції пакета працюють з UTF-8, тож кирилиця в них поводиться правильно. Єдине, на що слід зважати: індекси, які вони повертають, рахуються в <b>байтах</b>, а не в символах (про це був урок про рядки, байти й руни).",
      "Модель у голові проста: рядок <b>незмінний</b> (immutable). Жодна функція <code>strings</code> не змінює свій аргумент, кожна повертає <i>новий</i> рядок. Тому <code>strings.ToUpper(s)</code> без присвоєння нічого не робить: результат треба взяти, наприклад <code>s = strings.ToUpper(s)</code>. Це найчастіша помилка новачків. Друга половина моделі: функції діляться на кілька родин. <b>Пошук</b>: <code>Contains</code>, <code>HasPrefix</code>, <code>HasSuffix</code>, <code>Index</code>, <code>Count</code>. <b>Розрізання</b>: <code>Split</code>, <code>SplitN</code>, <code>Fields</code>, <code>Cut</code>. <b>Склеювання</b>: <code>Join</code>, <code>Repeat</code>. <b>Підчистка</b>: <code>TrimSpace</code>, <code>Trim</code>, <code>TrimPrefix</code>, <code>TrimSuffix</code>. <b>Заміна й регістр</b>: <code>Replace</code>, <code>ReplaceAll</code>, <code>ToUpper</code>, <code>ToLower</code>, <code>EqualFold</code>.",
      "Розбираючи текст, розрізняйте <code>Split</code> і <code>Fields</code>. <code>strings.Split(s, \",\")</code> ріже рівно по роздільнику й нічого не пропускає: з рядка <code>\"a,,b\"</code> вийдуть три шматки, середній порожній. А <code>strings.Fields(s)</code> ріже по <i>будь-яких</i> серіях пробільних символів (пробіл, табуляція, перенос рядка) і не повертає порожніх елементів, тому ідеальний для слів. Є й дрібна пастка: <code>strings.Split(\"\", \",\")</code> повертає слайс з одного порожнього рядка, а не порожній слайс, тоді як <code>strings.Fields(\"\")</code> дає порожній. Починаючи з Go 1.18 є зручна функція <code>strings.Cut(s, sep)</code>: вона розрізає рядок на «до» і «після» першого роздільника й повертає ще <code>ok</code>, чи знайдено роздільник. Для розбору <code>ключ=значення</code> вона краща за <code>Split</code>, бо не створює слайса й не ламається, якщо знак <code>=</code> ще раз зустрінеться у значенні.",
      "Порівняння без урахування регістру робіть через <code>strings.EqualFold(a, b)</code>, а не через <code>ToLower(a) == ToLower(b)</code>: перше не виділяє пам'ять під копії й коректніше працює з Unicode. Підчистку теж легко сплутати: <code>TrimPrefix(s, \"v\")</code> знімає префікс <i>як цілий підрядок</i> один раз, а <code>TrimLeft(s, \"ab\")</code> трактує другий аргумент як <b>набір символів</b> і знімає з початку все, що в наборі. Тому <code>TrimLeft(\"abcba\", \"ab\")</code> дасть <code>cba</code>, а не те, що ви можливо очікували. Для зняття розширення чи префікса використовуйте <code>TrimSuffix</code> і <code>TrimPrefix</code>. А <code>Replace(s, old, new, n)</code> замінює перші <code>n</code> входжень; <code>n = -1</code> замінює всі, і саме для цього є скорочення <code>ReplaceAll</code>.",
      "Тепер про склеювання. Оператор <code>+</code> для рядків зручний, але у циклі він дорогий: кожен <code>s += \"x\"</code> створює <b>новий</b> рядок і копіює в нього все, що було, тож складність виходить квадратичною: для 100 тисяч дописувань програма копіює гігабайти байтів. Для цього є <code>strings.Builder</code>: це буфер, у який дописують шматки (<code>WriteString</code>, <code>WriteByte</code>, <code>WriteRune</code>), а в кінці один раз беруть результат через <code>String()</code>, без зайвого копіювання. Нульове значення <code>var b strings.Builder</code> уже готове до роботи, ініціалізувати його не треба. Якщо ви наперед знаєте приблизний розмір, викличте <code>b.Grow(n)</code>, і буфер виділиться одразу. Оскільки <code>Builder</code> реалізує <code>io.Writer</code>, у нього можна друкувати через <code>fmt.Fprintf(&amp;b, ...)</code>, а це зручний спосіб збирати складні рядки.",
      "Пастки <code>Builder</code>. По-перше, його <b>не можна копіювати</b> після першого використання: Go виявить копію й викличе panic з повідомленням <code>illegal use of non-zero Builder copied by value</code>. Передавайте його за вказівником (<code>*strings.Builder</code>) або тримайте всередині структури. По-друге, не перестарайтеся: для двох-трьох шматків <code>+</code> або <code>fmt.Sprintf</code> цілком доречні й читабельніші, а <code>Builder</code> потрібен там, де склеювання відбувається в циклі або кількість шматків невідома. Для з'єднання готового слайса рядків є ще простіше <code>strings.Join(parts, sep)</code>, яке саме рахує потрібний розмір. Ідіома: збираєте шматки у слайс і робите один <code>Join</code>, або пишете у <code>Builder</code> і наприкінці <code>String()</code>.",
      "Підсумуємо ідіоми. Розбір рядка: <code>strings.TrimSpace</code> на вході, потім <code>Cut</code> або <code>Fields</code>. Перевірка форми: <code>HasPrefix</code>, <code>HasSuffix</code>, <code>Contains</code>. Нормалізація: <code>ToLower</code> плюс <code>TrimSpace</code>. Звіти й великі тексти: <code>Builder</code> чи <code>Join</code>. Усе це працює на рівні рядка як цілого; коли потрібно перебирати символи, використовуйте <code>for range</code> по рядку (він віддає руни), а коли потрібна складніша логіка шаблону, у наступних уроках з'являться <code>regexp</code> і <code>text/template</code>. У наступному уроці читатимемо текст по рядках і словах через <code>bufio</code>.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "  Go, Rust, Zig  "
	t := strings.TrimSpace(s)
	fmt.Printf("%q\n", t)

	parts := strings.Split(t, ", ")
	fmt.Println(len(parts), parts)
	fmt.Println(strings.Join(parts, " | "))

	fmt.Println(strings.Contains(t, "Rust"), strings.HasPrefix(t, "Go"), strings.HasSuffix(t, "Go"))
	fmt.Println(strings.Index(t, "Rust"), strings.Index(t, "C++"))
	fmt.Println(strings.ToUpper(t), strings.Repeat("=", 5))
	fmt.Println(strings.Replace("aaaa", "a", "b", 2), strings.ReplaceAll("aaaa", "a", "b"))

	fmt.Println(strings.Fields("  багато   пробілів\tі\nрядків "))
	fmt.Println(len(strings.Split("", ",")), len(strings.Fields("")))
}
`,
      String.raw`package main

import (
	"fmt"
	"strings"
)

func main() {
	line := "name = Артем"
	key, value, ok := strings.Cut(line, "=")
	fmt.Printf("%q %q %v\n", strings.TrimSpace(key), strings.TrimSpace(value), ok)

	_, _, ok = strings.Cut("без знака", "=")
	fmt.Println(ok)

	before, after, _ := strings.Cut("a/b/c", "/")
	fmt.Println(before, after)

	fmt.Println(strings.EqualFold("Go", "GO"), "Go" == "GO")
	fmt.Println(strings.TrimPrefix("v1.24", "v"), strings.TrimSuffix("main.go", ".go"))
	fmt.Println(strings.Trim("xxhixx", "x"), strings.TrimLeft("abcba", "ab"))
	fmt.Println(strings.Count("banana", "a"), strings.LastIndex("go gopher", "go"))
	fmt.Println(strings.SplitN("a,b,c,d", ",", 2))

	s := "go"
	strings.ToUpper(s)
	fmt.Println(s)
	s = strings.ToUpper(s)
	fmt.Println(s)
}
`,
      String.raw`package main

import (
	"fmt"
	"strings"
)

func concat(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += "x"
	}
	return s
}

func build(n int) string {
	var b strings.Builder
	b.Grow(n)
	for i := 0; i < n; i++ {
		b.WriteByte('x')
	}
	return b.String()
}

func report(names []string) string {
	var b strings.Builder
	for i, name := range names {
		fmt.Fprintf(&b, "%d. %s\n", i+1, name)
	}
	b.WriteString("разом: ")
	b.WriteRune('0' + rune(len(names)))
	return b.String()
}

func main() {
	fmt.Println(concat(1000) == build(1000))
	fmt.Println(report([]string{"Оля", "Ігор", "Марта"}))
}
`,
    ],
    note: "Рядки незмінні: функції strings повертають новий рядок, тому результат треба присвоїти. Split ріже строго по роздільнику (може дати порожні шматки), Fields — по будь-яких пробілах без порожніх. TrimLeft/TrimRight приймають набір символів, а TrimPrefix/TrimSuffix — цілий префікс чи суфікс. У циклі склеюйте через strings.Builder, а не через +=, і не копіюйте Builder.",
    work: "Розбір рядків конфігурації й заголовків (Cut по знаку =), нормалізація вводу (TrimSpace, ToLower, EqualFold), побудова SQL- чи HTML-фрагментів і звітів через Builder, підготовка слів для пошуку (Fields). У код-рев'ю цикл із s += ... над великим обсягом майже завжди просять замінити на Builder або Join.",
    tasks: [
      "Чим strings.Split(s, \" \") відрізняється від strings.Fields(s) для рядка з кількома пробілами підряд, і яку з функцій обрати для розбиття тексту на слова?",
      "Чому цикл s += частина повільний на великих обсягах і як strings.Builder це виправляє? Чому Builder не можна копіювати після початку роботи?",
    ],
  },
  {
    t: "bufio і читання тексту",
    ch: "Стандартна бібліотека",
    easy: "Читати файл чи ввід по одному байту — все одно що носити воду з колодязя чайною ложкою: кожен похід дорогий. bufio — це відро: воно набирає порцію наперед, а ви беретесь по рядку чи слову з відра. Так само bufio.Writer накопичує вивід і виливає його одним махом, коли ви скажете Flush.",
    p: [
      "Зазвичай програма отримує текст з джерела, яке <i>повільно віддає дані</i>: файл на диску, термінал, мережеве з'єднання. Кожне окреме звернення до такого джерела (системний виклик) коштує дорого, а читати побайтово — це мільйони викликів. До того ж самі по собі <code>io.Reader</code> і <code>io.Writer</code> (урок про них був у главі про інтерфейси) уміють лише «дай мені до N байтів» і «візьми ці байти»: рядків, слів і чисел вони не знають. Пакет <code>bufio</code> розв'язує обидві проблеми: ставить між вами й джерелом <b>буфер</b> у пам'яті та додає зручні операції над ним: прочитати рядок, слово, руну. Він «обгортає» будь-який <code>io.Reader</code> чи <code>io.Writer</code> і сам теж їх реалізує, тож усе складається, як цеглинки.",
      "Важливе зауваження про середовище. У реальній програмі текст зазвичай приходить зі стандартного вводу: <code>bufio.NewScanner(os.Stdin)</code>. У Go Playground і в нашому редакторі stdin немає, тому в усіх прикладах цього уроку ми імітуємо ввід через <code>strings.NewReader(text)</code>. Для коду це майже нічого не змінює: <code>strings.NewReader</code> повертає той самий інтерфейс <code>io.Reader</code>, що й <code>os.Stdin</code> чи <code>os.File</code>. Тому функції варто писати так, щоб вони приймали <code>io.Reader</code>, а не конкретний файл: тоді їх можна перевірити з рядком у тесті й без змін запустити з клавіатурою чи файлом.",
      "Найчастіший інструмент — <b>bufio.Scanner</b>. Створюєте його через <code>bufio.NewScanner(r)</code> і викликаєте <code>Scan()</code> у циклі: <code>for sc.Scan() { line := sc.Text() ... }</code>. Метод повертає <code>true</code>, поки є наступний «токен», а <code>Text()</code> віддає його без символу переносу рядка. За замовчуванням токен — це рядок, але функцією <code>sc.Split(bufio.ScanWords)</code> можна перемкнути режим на слова (їх розділяють пробільні символи), а <code>bufio.ScanRunes</code> віддає по руні. Після циклу <b>завжди</b> перевіряйте <code>sc.Err()</code>: <code>Scan()</code> повертає <code>false</code> і на кінці даних, і на помилці, і відрізнити їх можна лише так. Пам'ятайте також, що <code>sc.Text()</code> створює новий рядок на кожному кроці, а <code>sc.Bytes()</code> повертає слайс, який буде перезаписаний наступним <code>Scan()</code>, тому його треба копіювати, якщо ви його зберігаєте.",
      "Пастка Scanner: <b>обмеження розміру токена</b>. Буфер Scanner'а за замовчуванням тримає токен до 64 КБ. Якщо вам трапиться довший рядок (великий JSON в одному рядку, мінімізований файл), <code>Scan()</code> зупиниться з помилкою <code>bufio.Scanner: token too long</code>. Розв'язання: збільшити ліміт через <code>sc.Buffer(make([]byte, 0, 64*1024), 10*1024*1024)</code> до виклику <code>Scan()</code>. Коли довжина рядків непередбачувана або вам потрібні всі байти разом із роздільником, зручніший інший інструмент: <b>bufio.Reader</b>.",
      "<code>bufio.NewReader(r)</code> дає більш низькорівневе читання: <code>ReadString('\\n')</code> повертає рядок <i>разом</i> з роздільником, а на кінці даних повертає те, що встигло прочитатись, і помилку <code>io.EOF</code>. Тому останній рядок файлу без завершального переносу прийде <b>разом із io.EOF</b>, і пишуть так: обробити отриманий рядок (він може бути непорожнім), а потім перевірити, що <code>err == io.EOF</code>, і вийти. Є ще <code>ReadRune</code> (одна руна й її розмір у байтах), <code>ReadByte</code>, <code>Peek</code> (заглянути вперед без читання). А поєднання <code>fmt.Fscan(reader, &amp;x)</code> з <code>bufio.Reader</code> — класична ідіома для швидкого читання чисел у задачах: прямий <code>fmt.Fscan</code> без буфера був би надто повільним.",
      "Другий бік медалі — <b>bufio.Writer</b>. <code>bufio.NewWriter(w)</code> збирає записи в буфер (4 КБ за замовчуванням) і передає їх у <code>w</code> лише коли буфер заповнився або ви викликали <code>Flush()</code>. Звідси головна пастка: <b>без Flush частина або й увесь вивід може не потрапити</b> в призначення, бо останній неповний буфер лишиться в пам'яті. Тому ідіома: <code>out := bufio.NewWriter(os.Stdout)</code>, потім <code>defer out.Flush()</code> і друк через <code>fmt.Fprintln(out, ...)</code>. Виграш відчутний, коли ви друкуєте сотні тисяч рядків: замість сотень тисяч системних викликів їх стає лише кілька. Для кількох рядків виграшу немає, тож не ускладнюйте.",
      "Коротко про вибір. Рядки чи слова простого тексту: <code>Scanner</code>. Дуже довгі рядки або потрібен точний контроль над роздільником: <code>Reader</code>. Швидке читання чисел: <code>Reader</code> плюс <code>Fscan</code>. Багато виводу: <code>Writer</code> плюс <code>Flush</code>. А якщо файл невеликий і потрібен весь вміст відразу, достатньо <code>os.ReadFile</code> (про файли будемо говорити в уроці про пакет os). Скрізь джерело вказуємо як <code>io.Reader</code>, і код лишається придатним для перевірки без реальних файлів. Далі розглянемо роботу з часом.",
    ],
    code: [
      String.raw`package main

import (
	"bufio"
	"fmt"
	"strings"
)

func main() {
	text := "перший рядок\nдругий рядок\n\nчетвертий"
	sc := bufio.NewScanner(strings.NewReader(text))
	n := 0
	for sc.Scan() {
		n++
		fmt.Printf("%d: %q\n", n, sc.Text())
	}
	if err := sc.Err(); err != nil {
		fmt.Println("помилка:", err)
	}

	words := bufio.NewScanner(strings.NewReader("  один два\tтри\nчотири "))
	words.Split(bufio.ScanWords)
	count := 0
	for words.Scan() {
		count++
		fmt.Print(words.Text(), ";")
	}
	fmt.Println()
	fmt.Println("слів:", count)
}
`,
      String.raw`package main

import (
	"bufio"
	"fmt"
	"io"
	"strings"
)

func main() {
	r := bufio.NewReader(strings.NewReader("рядок 1\nрядок 2\nостанній без переводу"))
	for {
		line, err := r.ReadString('\n')
		fmt.Printf("%q err=%v\n", line, err)
		if err == io.EOF {
			break
		}
		if err != nil {
			return
		}
	}

	r2 := bufio.NewReader(strings.NewReader("Гоу"))
	ch, size, _ := r2.ReadRune()
	fmt.Println(string(ch), size)

	long := strings.Repeat("x", 70000)
	sc := bufio.NewScanner(strings.NewReader(long))
	fmt.Println(sc.Scan(), sc.Err())
	sc = bufio.NewScanner(strings.NewReader(long))
	sc.Buffer(make([]byte, 0, 1024), 1<<20)
	fmt.Println(sc.Scan(), len(sc.Text()), sc.Err())
}
`,
      String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	var sink strings.Builder
	w := bufio.NewWriter(&sink)
	fmt.Fprintln(w, "привіт")
	fmt.Println("до Flush:", sink.Len())
	w.Flush()
	fmt.Println("після Flush:", sink.Len())

	in := bufio.NewReader(strings.NewReader("3\n10 20 30\n"))
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var n int
	fmt.Fscan(in, &n)
	sum := 0
	for range n {
		var x int
		fmt.Fscan(in, &x)
		sum += x
	}
	fmt.Fprintln(out, "чисел:", n)
	fmt.Fprintln(out, "сума:", sum)
}
`,
    ],
    note: "У реальній програмі ввід бере os.Stdin, у Playground його немає, тому імітуйте через strings.NewReader і приймайте io.Reader. Після циклу Scan перевіряйте sc.Err(); токен довший за 64 КБ потребує sc.Buffer. ReadString повертає останній рядок разом з io.EOF. bufio.Writer без Flush може загубити вивід.",
    work: "Обробка логів і CSV-подібних файлів по рядках, читання великого вводу в задачах і консольних утилітах, швидкий вивід великих обсягів, обгортка над з'єднанням у мережевому коді. Функції, що приймають io.Reader, легко перевірити з strings.NewReader у тестах без жодного файла.",
    tasks: [
      "Чим відрізняються режими Scanner за замовчуванням (рядки) та bufio.ScanWords, і чому після циклу for sc.Scan() варто перевірити sc.Err()?",
      "Що станеться, якщо записати текст у bufio.Writer і не викликати Flush? Як це типово виправляють у main?",
    ],
  },
  {
    t: "time: дати й тривалості",
    ch: "Стандартна бібліотека",
    easy: "У пакеті time живуть два різні поняття, і їх не слід плутати. Момент часу (time.Time) — це точка на календарі, наприклад «15 березня 2026, 14:30». Тривалість (time.Duration) — довжина відрізка між двома точками, наприклад «півтори години». Різниця двох моментів дає тривалість, а момент плюс тривалість дає новий момент.",
    p: [
      "Робота з часом здається простою, доки не зіткнетеся з реальністю: різні часові пояси, переходи на літній час, місяці різної довжини, високосні роки. Пакет <code>time</code> бере це на себе, але щоб ним користуватися без сюрпризів, потрібна правильна модель. У ній два типи. <b>time.Time</b> описує момент часу (з точністю до наносекунди) разом із часовим поясом. <b>time.Duration</b> — це просто <code>int64</code>, кількість наносекунд, тож тривалість є звичайним числом із типом і методами. Саме тому в Go немає окремих «хвилин» чи «годин»: є константи <code>time.Nanosecond</code>, <code>Microsecond</code>, <code>Millisecond</code>, <code>Second</code>, <code>Minute</code>, <code>Hour</code>, на які множать число: <code>90 * time.Minute</code>.",
      "Тривалості друкуються зрозуміло: <code>fmt.Println(90*time.Minute)</code> виведе <code>1h30m0s</code>. З них можна дістати числа методами <code>Hours()</code>, <code>Minutes()</code>, <code>Seconds()</code> (вони повертають <code>float64</code>) і округлювати методами <code>Round</code> та <code>Truncate</code>. Рядок виду <code>\"1h15m30s\"</code> розбирає <code>time.ParseDuration</code>. Головна пастка пов'язана зі строгою типізацією: <code>time.Duration</code> і <code>int</code> — різні типи, тож змінну <code>n</code> типу <code>int</code> не можна просто помножити на <code>time.Second</code>: треба явне перетворення <code>time.Duration(n) * time.Second</code>. Компілятор відмовить із повідомленням про невідповідність типів. Константи (<code>2 * time.Second</code>) такої проблеми не мають.",
      "Моменти часу створюють так: <code>time.Date(2026, time.March, 15, 14, 30, 0, 0, time.UTC)</code>: рік, місяць (константа <code>time.March</code> або число), день, година, хвилина, секунда, наносекунда й часовий пояс. Звідти методами <code>Year()</code>, <code>Month()</code>, <code>Day()</code>, <code>Weekday()</code>, <code>YearDay()</code> дістають складові. Арифметика теж проста: <code>t.Add(36*time.Hour)</code> повертає новий момент (<code>Time</code> незмінний, як і рядок), а <code>t2.Sub(t1)</code> повертає <code>Duration</code>. Порівнюють через <code>Before</code>, <code>After</code> і <code>Equal</code>. Не порівнюйте моменти через <code>==</code>: структура <code>Time</code> містить і пояс, і додаткові поля, тож два однакові моменти в різних поясах операція <code>==</code> вважатиме різними, а <code>Equal</code> порівнює саме момент на осі часу.",
      "Календарна арифметика окрема: <code>t.AddDate(років, місяців, днів)</code> додає календарні одиниці, а не фіксовану кількість секунд. Різниця суттєва: «додати місяць» не означає «додати 30 діб». Якщо результат вийшов неіснуючою датою, Go її <b>нормалізує</b>: 31 січня плюс один місяць — це «31 лютого», яке перетворюється на 3 березня (у 2026 році). Для звичайних днів не використовуйте <code>Add(24*time.Hour)</code>, коли йдеться про календарну дату в поясі з літнім часом: доба тоді буває 23 чи 25 годин. Для підрахунку днів між двома датами в UTC ділять <code>Sub(...).Hours()</code> на 24, цього досить.",
      "Форматування в Go влаштоване незвично, і це треба запам'ятати. Замість <code>YYYY-MM-DD</code> використовується <b>еталонна дата</b>: <code>Mon Jan 2 15:04:05 MST 2006</code>, тобто «01/02 03:04:05PM '06 -0700». Ви показуєте, як виглядала б ця конкретна дата у вашому форматі. Рік пишеться як <code>2006</code>, місяць <code>01</code>, день <code>02</code>, година <code>15</code>, хвилини <code>04</code>, секунди <code>05</code>. Отже, <code>t.Format(\"2006-01-02 15:04:05\")</code> дає <code>2026-07-04 09:05:07</code>, а <code>\"02.01.2006\"</code> — українську форму <code>04.07.2026</code>. Є готові константи: <code>time.RFC3339</code>, <code>time.DateOnly</code>, <code>time.DateTime</code>, <code>time.TimeOnly</code>. Ті самі шаблони приймає <code>time.Parse(layout, text)</code>, який повертає момент у UTC і помилку: <code>time.Parse(\"2006-01-02\", \"2026-02-30\")</code> дасть помилку про вихід дня за діапазон. Помилку ніколи не ігноруйте: інакше отримаєте нульовий момент 0001-01-01.",
      "Часові пояси: <code>time.UTC</code> — універсальний пояс, відносно нього все й зберігайте. Конкретний пояс задають через <code>time.FixedZone(\"EEST\", 3*60*60)</code> (назва й зсув у секундах) або через <code>time.LoadLocation(\"Europe/Kyiv\")</code>, який читає базу поясів з системи (на мінімальних образах вона може бути відсутня, тому в нашому курсі користуємося <code>FixedZone</code>). Метод <code>t.In(zone)</code> показує <i>той самий момент</i> у іншому поясі: змінюється лише подання (години), але не момент, тож <code>t.Equal(t.In(zone))</code> істинне. <code>t.Unix()</code> дає секунди від 1 січня 1970 UTC, зручні для збереження й обміну.",
      "Зверніть увагу на нашу умову детермінованості: у прикладах і завданнях цього курсу ми не викликаємо <code>time.Now()</code>, бо вивід не повинен залежати від дня запуску. У реальному коді <code>time.Now()</code> потрібен постійно, але перевіряти його незручно, тому годинник часто передають у функцію як параметр або функцію <code>func() time.Time</code>. Ідіоми: зберігати й передавати в UTC, показувати користувачеві в його поясі, вимірювати інтервали через <code>time.Since(start)</code>, а в тестах будувати дати через <code>time.Date</code>. Таймери й тайм-аути ви вже бачили в главі про конкурентність; далі перейдемо до математики.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	d := 90*time.Minute + 30*time.Second
	fmt.Println(d, d.Hours(), d.Minutes(), int(d.Seconds()))
	fmt.Println(d.Round(time.Hour), d.Truncate(time.Hour))
	fmt.Println(time.Duration(1500) * time.Millisecond)

	pd, err := time.ParseDuration("1h15m30s")
	fmt.Println(pd, err)
	_, err = time.ParseDuration("пів години")
	fmt.Println(err != nil)

	n := 3
	wait := time.Duration(n) * time.Second
	fmt.Println(wait, wait == 3*time.Second)
}
`,
      String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2026, time.March, 15, 14, 30, 0, 0, time.UTC)
	fmt.Println(t)
	fmt.Println(t.Year(), t.Month(), t.Day(), t.Weekday(), t.YearDay())

	next := t.Add(36 * time.Hour)
	fmt.Println(next)
	fmt.Println(next.Sub(t), next.After(t), t.Before(next), t.Equal(t))

	fmt.Println(t.AddDate(0, 1, 20).Format("2006-01-02"))

	jan31 := time.Date(2026, time.January, 31, 0, 0, 0, 0, time.UTC)
	fmt.Println(jan31.AddDate(0, 1, 0).Format("2006-01-02"))

	deadline := time.Date(2026, time.December, 31, 0, 0, 0, 0, time.UTC)
	fmt.Println(int(deadline.Sub(t).Hours() / 24))
}
`,
      String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2026, 7, 4, 9, 5, 7, 0, time.UTC)
	fmt.Println(t.Format("2006-01-02 15:04:05"))
	fmt.Println(t.Format("02.01.2006"), t.Format("Jan 2, 2006 at 3:04PM"))
	fmt.Println(t.Format(time.RFC3339), t.Format(time.DateOnly))

	kyiv := time.FixedZone("EEST", 3*60*60)
	local := t.In(kyiv)
	fmt.Println(local.Format(time.RFC3339), local.Format("15:04 MST"))
	fmt.Println(local.Equal(t), local == t)

	p, err := time.Parse("2006-01-02", "2026-02-30")
	fmt.Println(p, err)
	p, err = time.Parse("02.01.2006 15:04", "25.12.2026 18:30")
	fmt.Println(p, err)
	fmt.Println(p.Weekday(), t.Unix())
}
`,
      String.raw`// не компілюється: int і time.Duration — різні типи, потрібне явне перетворення
package main

import (
	"fmt"
	"time"
)

func main() {
	seconds := 5
	wait := seconds * time.Second
	fmt.Println(wait)
}
`,
    ],
    note: "Duration — це наносекунди в int64: пишіть 90*time.Minute, а для змінної робіть time.Duration(n)*time.Second. Формат задає еталонна дата 2006-01-02 15:04:05, а не YYYY-MM-DD. Моменти порівнюйте через Equal, не ==. AddDate нормалізує неіснуючі дати (31 січня + місяць = 3 березня). Помилку time.Parse не ігноруйте.",
    work: "Терміни дедлайнів і підписок, відображення дат у кабінеті користувача, розбір дат із форм і API (RFC3339), підрахунок днів між подіями, тайм-аути запитів, TTL кешу. У тестах дати будують через time.Date, а у продакшні зберігають в UTC і перетворюють у пояс користувача лише для показу.",
    tasks: [
      "Чому вираз seconds * time.Second не компілюється, якщо seconds має тип int, і як записати правильно? Що вірно для константи 5 * time.Second?",
      "Що означає рядок формату 2006-01-02 15:04 у Go і чим він відрізняється від шаблонів YYYY-MM-DD в інших мовах?",
    ],
  },
  {
    t: "math і math/rand",
    ch: "Стандартна бібліотека",
    easy: "Пакет math — це інженерний калькулятор програми: корені, степені, округлення, модулі. А math/rand — гральний кубик: він видає числа, які здаються випадковими. Насправді кубик «заводний»: зі стартовим числом (seed) він завжди кидає одну й ту саму послідовність, тому в перевірках ми покладаємося не на конкретні числа, а на їхні властивості.",
    p: [
      "Базові арифметичні дії (<code>+ - * / %</code>) у мові вже є, а все складніше винесено в пакет <code>math</code>. Усі його функції працюють із <code>float64</code>: <code>math.Sqrt(2)</code>, <code>math.Pow(2, 10)</code>, <code>math.Abs(-3.5)</code>, <code>math.Hypot(3, 4)</code> (гіпотенуза, тут 5), <code>math.Cbrt(27)</code> (кубічний корінь), <code>math.Mod(7, 3)</code> (остача для дробових). Якщо у вас <code>int</code>, його треба явно перетворити: <code>math.Sqrt(float64(n))</code>. Це та сама строга типізація, що й скрізь у Go: числові типи не змішуються мовчки. Є й константи: <code>math.Pi</code>, <code>math.E</code>, а також межі цілих типів <code>math.MaxInt</code>, <code>math.MinInt64</code>, <code>math.MaxInt32</code>, <code>math.MaxUint8</code> і максимум <code>math.MaxFloat64</code>.",
      "Округлення має чотири функції, і їх плутають. <code>math.Floor(x)</code> — до меншого цілого (<code>Floor(-2.5)</code> = -3), <code>math.Ceil(x)</code> — до більшого (<code>Ceil(-2.5)</code> = -2), <code>math.Trunc(x)</code> відкидає дробову частину (<code>Trunc(-2.7)</code> = -2), <code>math.Round(x)</code> округлює до найближчого, а «половинки» — від нуля (<code>Round(2.5)</code> = 3 і <code>Round(-2.5)</code> = -3). Банківське округлення («половинки до парного») дає <code>RoundToEven</code>. Усі вони повертають <code>float64</code>, тож для цілого результату перетворюйте: <code>int(math.Round(x))</code>. Округлення до двох знаків після коми — ідіома <code>math.Round(x*100)/100</code>, а в загальному вигляді <code>math.Round(x*math.Pow(10, n))/math.Pow(10, n)</code>. Для <i>виводу</i> достатньо формату <code>%.2f</code>.",
      "Тепер про особливі значення. Дійсні числа за стандартом IEEE 754 мають <b>нескінченність</b> і <b>NaN</b> («не число»). Ділення дробового на нуль не призводить до panic: <code>1/zero</code> дає <code>+Inf</code>, <code>-1/zero</code> дає <code>-Inf</code>, а <code>0/0</code> та <code>math.Sqrt(-1)</code> дають <code>NaN</code>. Для цілих усе навпаки: ділення на нуль — це panic <code>integer divide by zero</code>. NaN особливий тим, що <b>не дорівнює навіть самому собі</b>: <code>nan == nan</code> дає <code>false</code>, тож перевіряють його функцією <code>math.IsNaN(x)</code>, а нескінченність — <code>math.IsInf(x, sign)</code>. Якщо NaN потрапить у розрахунок, він «заражає» всі подальші результати, тому перевіряйте вхідні дані, а не лише результат.",
      "Дробові числа неточні, і це не помилка Go, а властивість двійкового подання. У змінних <code>a := 0.1; b := 0.2</code> сума <code>a+b</code> дорівнює <code>0.30000000000000004</code>, і порівняння <code>a+b == 0.3</code> дає <code>false</code>. Тому дробові <b>не порівнюють через ==</b>: порівнюють із допуском, <code>math.Abs(a-b) &lt; 1e-9</code>. (Константи Go рахуються точно, тож <code>0.1 + 0.2 == 0.3</code> для констант істинне; різниця проявляється лише для змінних.) Для грошей дробові типи не використовують зовсім: зберігають копійки цілим числом. Переповнення цілих теж тихе: <code>var x int8 = math.MaxInt8; x++</code> дає -128, а не помилку (це було в уроці про числові типи); пакет <code>math</code> лише надає межі, щоб ви могли перевіряти їх заздалегідь.",
      "Випадкові числа. Пакет <code>math/rand</code> дає <b>псевдовипадкові</b> числа: послідовність повністю визначається початковим значенням (seed). Явний генератор створюють так: <code>r := rand.New(rand.NewSource(1))</code>; далі <code>r.Intn(n)</code> — ціле з проміжку <code>[0, n)</code>, <code>r.Float64()</code> — число з <code>[0, 1)</code>, <code>r.Perm(n)</code> — випадкова перестановка чисел від 0 до n-1, <code>r.Shuffle(len(s), swap)</code> — перемішування слайса. Два генератори з однаковим seed видають однакові послідовності, і це корисно для відтворюваних тестів і симуляцій. Але конкретні значення (наприклад, «з seed 1 перше число 81») залежать від версії та алгоритму, тому в перевірках покладайтеся на <i>властивості</i>: число потрапило в діапазон, перестановка містить усі елементи, перемішування не змінило суму.",
      "Починаючи з Go 1.20, глобальні функції <code>rand.Intn</code>, <code>rand.Float64</code> без явного виклику seed уже ініціалізуються випадково, тому «нагадувати» про <code>rand.Seed(time.Now().UnixNano())</code> більше не потрібно (ця функція позначена застарілою). У Go 1.22 з'явився новий пакет <b>math/rand/v2</b>: функції названо <code>IntN</code>, <code>Float64</code>, <code>Perm</code>, <code>Shuffle</code>, є універсальна <code>rand.N(d)</code> для будь-якого цілого типу чи <code>time.Duration</code>, а детермінований генератор створюється як <code>rand.New(rand.NewPCG(seed1, seed2))</code>. У нових проєктах надавайте перевагу v2; у цьому уроці обидва показано. Попередження: ні <code>math/rand</code>, ні v2 <b>не призначені для безпеки</b> (токени, паролі, ключі): для цього є <code>crypto/rand</code>.",
    ],
    code: [
      String.raw`package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println(math.Sqrt(2), math.Pow(2, 10), math.Cbrt(27), math.Hypot(3, 4))
	fmt.Println(math.Floor(-2.5), math.Ceil(-2.5), math.Trunc(-2.7))
	fmt.Println(math.Round(2.5), math.Round(-2.5), math.RoundToEven(2.5))
	fmt.Println(math.Abs(-3.5), math.Mod(7, 3), math.Max(2, 9), min(4, 2, 8))

	x := 3.14159
	fmt.Println(math.Round(x*100)/100, int(math.Round(x)))
	fmt.Printf("%.2f %.0f\n", x, x)
	fmt.Println(math.Sqrt(float64(49)), math.Pi)
}
`,
      String.raw`package main

import (
	"fmt"
	"math"
)

func main() {
	zero := 0.0
	fmt.Println(1/zero, -1/zero, zero/zero)

	nan := math.NaN()
	fmt.Println(nan == nan, math.IsNaN(nan), math.IsInf(1/zero, 1))
	fmt.Println(math.Sqrt(-1), math.Log(0))

	a, b := 0.1, 0.2
	fmt.Println(a+b, a+b == 0.3, math.Abs(a+b-0.3) < 1e-9)

	fmt.Println(math.MaxInt64, math.MinInt64, math.MaxInt32, math.MaxUint8)
	var x int8 = math.MaxInt8
	x++
	fmt.Println(x)
}
`,
      String.raw`package main

import (
	"fmt"
	"math/rand"
	"sort"
)

func main() {
	r1 := rand.New(rand.NewSource(1))
	r2 := rand.New(rand.NewSource(1))
	same := true
	for range 5 {
		if r1.Intn(100) != r2.Intn(100) {
			same = false
		}
	}
	fmt.Println("однакові послідовності:", same)

	r := rand.New(rand.NewSource(1))
	inRange := true
	for range 1000 {
		if v := r.Intn(6) + 1; v < 1 || v > 6 {
			inRange = false
		}
	}
	fmt.Println("кубик у межах 1..6:", inRange)

	p := r.Perm(5)
	sort.Ints(p)
	fmt.Println(p)

	nums := []int{1, 2, 3, 4, 5}
	r.Shuffle(len(nums), func(i, j int) { nums[i], nums[j] = nums[j], nums[i] })
	sum := 0
	for _, n := range nums {
		sum += n
	}
	fmt.Println(len(nums), sum)

	f := r.Float64()
	fmt.Println(f >= 0 && f < 1)
}
`,
      String.raw`package main

import (
	"fmt"
	"math/rand/v2"
	"slices"
)

func main() {
	r := rand.New(rand.NewPCG(1, 2))
	r2 := rand.New(rand.NewPCG(1, 2))
	fmt.Println(r.IntN(1000) == r2.IntN(1000))

	ok := true
	for range 1000 {
		if v := r.IntN(6) + 1; v < 1 || v > 6 {
			ok = false
		}
	}
	fmt.Println(ok)

	p := r.Perm(4)
	slices.Sort(p)
	fmt.Println(p)

	g := rand.IntN(10)
	fmt.Println(g >= 0 && g < 10)
}
`,
    ],
    note: "math працює з float64, цілі перетворюйте явно. Round/Floor/Ceil/Trunc ведуть себе по-різному на від'ємних. Дробові не порівнюють через ==, а через допуск; 1/0.0 дає Inf, 0/0 дає NaN (NaN != NaN), а цілочисельне ділення на нуль — panic. Випадкові числа з seed у перевірках оцінюють за властивостями, а не за значеннями; для безпеки є crypto/rand.",
    work: "Округлення цін і відсотків, відстані й геометрія, статистика (середнє, відхилення), перевірка меж перед переповненням, симуляції й перемішування вибірок, випадкові ідентифікатори тестових даних. Відтворюваний генератор із seed незамінний у тестах і баг-репортах: «ось seed, на якому падає».",
    tasks: [
      "Чому a+b == 0.3 для змінних a := 0.1, b := 0.2 дає false і як правильно порівнювати такі числа? Чим відрізняється поведінка 1/0.0 від цілочисельного 1/0?",
      "Чому в перевірках не слід спиратися на конкретні числа з rand.New(rand.NewSource(1)), і що перевіряють натомість?",
    ],
  },
  {
    t: "encoding/json",
    ch: "Стандартна бібліотека",
    easy: "JSON — це «загальна мова» для обміну даними між програмами: текст з фігурними дужками, ключами й значеннями. Marshal перекладає ваші структури Go в цей текст, Unmarshal — навпаки. Теги на полях структури — це ярлички, які кажуть, під яким іменем поле з'явиться в тексті і чи показувати його взагалі.",
    p: [
      "JSON (JavaScript Object Notation) — найпоширеніший формат обміну даними в вебі: відповіді API, конфігурації, повідомлення в чергах. Програма на Go працює зі структурами й типізованими значеннями, а по мережі ходить текст, тож потрібен переклад в обидва боки. Його виконує стандартний пакет <code>encoding/json</code>. <code>json.Marshal(v)</code> повертає <code>([]byte, error)</code> з JSON-текстом для будь-якого значення, а <code>json.Unmarshal(data, &amp;v)</code> розбирає текст у змінну, на яку вказує другий аргумент. Слово <i>marshal</i> тут означає «упакувати для передачі», <i>unmarshal</i> — «розпакувати». Пакет працює через <b>рефлексію</b> (reflect): він сам заглядає всередину ваших типів і перебирає поля, тому писати код серіалізації вручну не треба.",
      "Як структура стає JSON? Правило перше: бачать лише <b>експортовані</b> поля, тобто ті, що починаються з великої літери. Неекспортоване поле (<code>age int</code>) пакет не може прочитати через рефлексію, тому воно мовчки ігнорується й у Marshal, і в Unmarshal. Це найчастіша причина питання «чому моє поле порожнє». Правило друге: ім'я ключа за замовчуванням збігається з іменем поля (<code>Name</code> дає <code>\"Name\"</code>), а щоб задати інше, використовують <b>теги</b> (їх ми вже бачили в уроці про структури): <code>Name string `json:\"name\"`</code>. Правило третє: типи переходять так: <code>string</code> у рядок, числа в числа, <code>bool</code> у <code>true/false</code>, слайс і масив у масив JSON, структура й мапа з рядковими ключами в об'єкт, вказівник <code>nil</code> у <code>null</code>.",
      "Теги можуть мати опції через кому. <code>`json:\"email,omitempty\"`</code> пропускає поле, якщо воно має «порожнє» значення: <code>0</code>, <code>\"\"</code>, <code>false</code>, <code>nil</code>, порожній слайс чи мапу. <code>`json:\"-\"`</code> повністю виключає поле з JSON в обох напрямках: так ховають паролі й службові дані. Пастка <code>omitempty</code>: для числа <code>0</code> і для <code>false</code> поле зникне, навіть якщо це законне значення (кількість 0, прапорець вимкнено). Якщо різниця між «нуль» і «не задано» важлива, робіть поле вказівником (<code>*int</code>): <code>nil</code> зникає, а вказівник на нуль лишається. Ще одна тонкість: структура-значення (вкладена) не вважається порожньою для <code>omitempty</code>, тож вкладені структури зникають лише через вказівник.",
      "Вкладені структури, слайси й мапи просто складаються: <code>Address Address</code> стає вкладеним об'єктом, <code>[]Item</code> — масивом об'єктів, <code>map[string]int</code> — об'єктом, у якому ключі <b>відсортовано за алфавітом</b>, тож вивід детермінований (для мапи Go порядку не гарантує, але Marshal сам сортує ключі). Нюанс слайсів: <code>nil</code>-слайс перетворюється на <code>null</code>, а порожній <code>[]string{}</code> — на <code>[]</code>. Багатьом клієнтам API різниця важлива, тож у відповідях краще ініціалізувати слайс. Для людей і логів є <code>json.MarshalIndent(v, \"\", \"  \")</code>, яка додає відступи (перший аргумент — префікс кожного рядка, другий — одиниця відступу). Зверніть також увагу, що Marshal за замовчуванням екранує <code>&lt;</code>, <code>&gt;</code> і <code>&amp;</code> як <code>\\u003c</code> тощо (це захист для вставки в HTML); у вебі це безпечно, у конфігах тільки заважає, і вимикається через Encoder, про що в наступному уроці.",
      "Розбір (Unmarshal) має свої правила. Другий аргумент <b>мусить бути вказівником</b>: <code>json.Unmarshal(data, u)</code> замість <code>&amp;u</code> поверне помилку <code>json: Unmarshal(non-pointer main.User)</code>. Ключі зіставляються з полями <b>без урахування регістру</b>, тож <code>\"ID\"</code> і <code>\"id\"</code> потраплять в одне поле. Невідомі ключі за замовчуванням ігноруються (суворіший режим є в наступному уроці), а відсутні ключі просто залишають поле в нульовому значенні: звідси висновок, що для обов'язкових полів їх треба перевіряти після розбору. Помилки двох видів: синтаксична (<code>invalid character '}' looking for beginning of object key string</code>) і помилка типу (<code>cannot unmarshal string into Go struct field User.id of type int</code>). Другу пакет повертає після того, як розібрав усе, що зміг, тому частково заповнена структура може лишитися: не користуйтеся значенням, якщо <code>err != nil</code>.",
      "Коли структура даних заздалегідь невідома, розбирайте в <code>any</code> (<code>var v any</code>). Тоді JSON-об'єкт стає <code>map[string]any</code>, масив <code>[]any</code>, рядок <code>string</code>, <code>true/false</code> стає <code>bool</code>, <code>null</code> стає <code>nil</code>, а <b>кожне число стає float64</b>, навіть <code>3</code>. Отже, перевірка <code>m[\"n\"].(int)</code> завжди невдала, а правильно <code>m[\"n\"].(float64)</code>. Тут ховається серйозна пастка: <code>float64</code> точно зберігає цілі лише до 2<sup>53</sup>, тож велике число на кшталт <code>9007199254740993</code> (ідентифікатор з іншої системи) тихо стане <code>9.007199254740992e+15</code>. Якщо поле відоме, розбирайте в <code>int64</code>, і значення збережеться точно; для невідомих структур є <code>json.Number</code> (наступний урок). Розбір в <code>any</code> зручний для швидких скриптів і проксі, а для коду, що живе довго, описуйте структури: компілятор ловитиме помилки, а читачеві зрозуміло, що очікується.",
      "Ідіоми. Описуйте структуру з тегами, навіть якщо імена збігаються: так контракт з API видно в коді й не залежить від перейменування поля. Для відповіді API спочатку збирайте структуру, потім Marshal, а помилку перевіряйте (вона трапляється для каналів, функцій, циклічних вказівників, <code>NaN</code> і <code>Inf</code>). Окремо тримайте «зовнішні» структури (що йдуть в JSON) і внутрішню модель, якщо вони розходяться. Для великих потоків і файлів не читайте все в пам'ять: пакет має <code>Decoder</code> і <code>Encoder</code>, а для власних форматів інтерфейси <code>Marshaler</code> та <code>Unmarshaler</code>. Саме про них, а також про <code>RawMessage</code> і <code>Number</code>, наступний (просунутий) урок.",
    ],
    code: [
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

type Address struct {
	City string ${BT}json:"city"${BT}
	Zip  string ${BT}json:"zip,omitempty"${BT}
}

type User struct {
	ID       int            ${BT}json:"id"${BT}
	Name     string         ${BT}json:"name"${BT}
	Email    string         ${BT}json:"email,omitempty"${BT}
	Password string         ${BT}json:"-"${BT}
	age      int
	Tags     []string       ${BT}json:"tags"${BT}
	Address  Address        ${BT}json:"address"${BT}
	Boss     *User          ${BT}json:"boss"${BT}
	Meta     map[string]int ${BT}json:"meta,omitempty"${BT}
}

func main() {
	u := User{ID: 1, Name: "Оля", Password: "секрет", age: 30, Tags: []string{"go", "json"}, Address: Address{City: "Дніпро"}}
	b, err := json.Marshal(u)
	fmt.Println(string(b), err)

	u.Meta = map[string]int{"b": 2, "a": 1}
	u.Boss = &User{ID: 2, Name: "Ігор"}
	b, _ = json.MarshalIndent(u, "", "  ")
	fmt.Println(string(b))

	var nilTags []string
	b1, _ := json.Marshal(nilTags)
	b2, _ := json.Marshal([]string{})
	fmt.Println(string(b1), string(b2))

	b3, _ := json.Marshal("<b>&</b>")
	fmt.Println(string(b3))
	b4, err := json.Marshal(map[string]any{"ok": true, "n": 1.5, "list": []int{1, 2}})
	fmt.Println(string(b4), err)
	_, err = json.Marshal(make(chan int))
	fmt.Println(err)
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	ID   int      ${BT}json:"id"${BT}
	Name string   ${BT}json:"name"${BT}
	Tags []string ${BT}json:"tags"${BT}
}

func main() {
	data := []byte(${BT}{"ID": 7, "NAME": "Олег", "extra": true, "tags": ["a", "b"]}${BT})
	var u User
	err := json.Unmarshal(data, &u)
	fmt.Printf("%+v %v\n", u, err)

	err = json.Unmarshal([]byte(${BT}{"id": "сім"}${BT}), &u)
	fmt.Println(err)
	err = json.Unmarshal([]byte(${BT}{"id": 1,}${BT}), &u)
	fmt.Println(err)
	err = json.Unmarshal(data, u)
	fmt.Println(err)

	var empty User
	json.Unmarshal([]byte(${BT}{"name": "Лише ім'я"}${BT}), &empty)
	fmt.Printf("%+v %v\n", empty, empty.Tags == nil)
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	var v any
	err := json.Unmarshal([]byte(${BT}{"n": 3, "ok": true, "list": [1, "x", null], "obj": {"k": 1.5}}${BT}), &v)
	fmt.Println(err)

	m := v.(map[string]any)
	fmt.Printf("%T %v\n", m["n"], m["n"])
	fmt.Println(m)

	for _, x := range m["list"].([]any) {
		switch t := x.(type) {
		case float64:
			fmt.Println("число", t)
		case string:
			fmt.Println("рядок", t)
		case nil:
			fmt.Println("null")
		}
	}

	if n, ok := m["n"].(int); !ok {
		fmt.Println("int не вийшло", n)
	}

	var big any
	json.Unmarshal([]byte(${BT}9007199254740993${BT}), &big)
	fmt.Println(big)
	var exact int64
	json.Unmarshal([]byte(${BT}9007199254740993${BT}), &exact)
	fmt.Println(exact)
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

type Item struct {
	SKU   string  ${BT}json:"sku"${BT}
	Qty   int     ${BT}json:"qty"${BT}
	Price float64 ${BT}json:"price"${BT}
}

type Order struct {
	ID    int     ${BT}json:"id"${BT}
	Items []Item  ${BT}json:"items"${BT}
	Total float64 ${BT}json:"total"${BT}
	Note  string  ${BT}json:"note,omitempty"${BT}
}

func main() {
	input := ${BT}[{"id":1,"items":[{"sku":"A1","qty":2,"price":10.5},{"sku":"B2","qty":1,"price":4}]},{"id":2,"items":[]}]${BT}
	var orders []Order
	if err := json.Unmarshal([]byte(input), &orders); err != nil {
		fmt.Println("помилка:", err)
		return
	}
	for i := range orders {
		for _, it := range orders[i].Items {
			orders[i].Total += float64(it.Qty) * it.Price
		}
	}
	out, err := json.MarshalIndent(orders, "", "  ")
	if err != nil {
		fmt.Println("помилка:", err)
		return
	}
	fmt.Println(string(out))
}
`,
    ],
    note: "Marshal і Unmarshal бачать лише експортовані поля; ім'я ключа задає тег json:\"name\", а опції omitempty та \"-\" ховають поле. Unmarshal потребує вказівника, зіставляє ключі без урахування регістру й ігнорує невідомі. У any числа стають float64, великі цілі втрачають точність. nil-слайс це null, а порожній слайс це [].",
    work: "Відповіді та запити REST API, конфігурації застосунків, обмін повідомленнями між сервісами, логи у форматі JSON, збереження налаштувань у файлі. Типовий обробник: розібрати тіло запиту в структуру (Unmarshal або Decoder), перевірити обов'язкові поля, зібрати відповідь структурою й віддати через Marshal.",
    tasks: [
      "Чому неекспортоване поле структури (age int) не потрапляє в JSON і не заповнюється при Unmarshal? Що робить тег json:\"-\"?",
      "У що перетворюється число 3, якщо розібрати JSON у змінну типу any, і чому перевірка m[\"n\"].(int) не спрацює? Як змінюється точність великих цілих?",
    ],
  },
  {
    t: "JSON: власні маршалери й потокове кодування",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Стандартні правила JSON підходять у більшості випадків, але іноді формат даних інший: рівень журналу має бути словом «warn», а не числом 2. Тоді ви навчаєте свій тип самому перекладатися в JSON і назад. А коли даних багато, їх не вантажать цілком: Decoder і Encoder працюють як стрічка конвеєра, по одному елементу.",
    p: [
      "Стандартний <code>Marshal</code> влаштований за схемою «поле в ключ». Але реальні формати відхиляються від неї: числовий перелік (<code>Level</code> на <code>iota</code>) у JSON має бути рядком; грошова сума зберігається в копійках, а віддається як <code>\"12.50\"</code>; дата має свій формат; у відповідь треба додати обчислюване поле. Для цього пакет визначає два інтерфейси: <code>json.Marshaler</code> з методом <code>MarshalJSON() ([]byte, error)</code> і <code>json.Unmarshaler</code> з методом <code>UnmarshalJSON([]byte) error</code>. Якщо ваш тип їх реалізує, пакет сам викликає ці методи замість стандартної логіки, навіть коли значення лежить глибоко всередині іншої структури, слайса чи мапи. Це та сама ідея неявних інтерфейсів, яку ви знаєте з уроку про <code>Stringer</code>: достатньо мати метод потрібної форми.",
      "<b>MarshalJSON</b> повинен повернути <i>готовий коректний JSON</i> (байти), а не «просто текст». Найпростіший спосіб: зібрати Go-значення потрібного вигляду й викликати для нього <code>json.Marshal</code>, наприклад <code>return json.Marshal(levelNames[l])</code> віддасть <code>\"warn\"</code> з лапками. Метод зазвичай оголошують із <b>value receiver</b> (<code>func (l Level) MarshalJSON()</code>): тоді він працює і для значень, і для вказівників. Із pointer receiver він спрацює лише тоді, коли значення адресоване (поле структури, до якої є вказівник), і мовчки не спрацює для значення, переданого в <code>Marshal</code> копією. Помилка з методу піднімається нагору обгорнутою: <code>json: error calling MarshalJSON for type main.Level: ...</code>.",
      "<b>UnmarshalJSON</b> навпаки приймає сирі байти одного JSON-значення й має заповнити <code>*l</code>, тому тут receiver <b>завжди вказівник</b>. Типовий шаблон: розібрати байти у проміжний тип (<code>var s string; json.Unmarshal(b, &amp;s)</code>), перевірити його й записати результат у приймач. Зверніть увагу на дві речі. По-перше, валідацію варто робити саме тут: невідомий рівень дає помилку, і вона потрапить до того, хто викликав <code>Unmarshal</code>. По-друге, якщо метод викликається для <code>null</code>, за угодою він має нічого не міняти й не повертати помилки. Класична <b>пастка нескінченної рекурсії</b>: усередині <code>MarshalJSON</code> типу <code>T</code> не можна викликати <code>json.Marshal(t)</code> для того самого типу, бо пакет знову викличе ваш метод, і програма впаде зі stack overflow. Обхід: оголосити всередині метода локальний тип <code>type plain T</code>: він має ті самі поля, але <b>не успадковує методів</b>, тож пакет серіалізує його стандартно. У прикладі так до структури додається обчислюване поле <code>area</code>.",
      "Тепер про потоки. <code>Marshal</code> і <code>Unmarshal</code> працюють з одним значенням, яке цілком у пам'яті. Коли даних багато (лог на гігабайт, відповідь із мільйоном елементів) чи вони надходять із мережі, використовують <code>json.NewDecoder(r)</code> і <code>json.NewEncoder(w)</code>, що працюють над <code>io.Reader</code> і <code>io.Writer</code>. <code>dec.Decode(&amp;v)</code> читає <b>наступне</b> JSON-значення з потоку, тому ним розбирають формат NDJSON (по одному JSON на рядок): викликайте <code>Decode</code> у циклі, поки не отримаєте <code>io.EOF</code>. Для великого масиву читають токени: <code>dec.Token()</code> бере <code>[</code>, потім цикл <code>for dec.More() { dec.Decode(&amp;item) }</code> обробляє елементи по одному, нарешті <code>dec.Token()</code> бере <code>]</code>. Пам'яті для цього потрібно лише на один елемент.",
      "<code>Encoder</code> пише значення у <code>Writer</code> і після кожного додає <code>\\n</code>, тож це готовий NDJSON. Його налаштування: <code>enc.SetIndent(\"\", \" \")</code> для відступів і <code>enc.SetEscapeHTML(false)</code>, щоб символи <code>&lt;</code>, <code>&gt;</code>, <code>&amp;</code> лишалися як є (корисно для конфігів, логів і всього, що не вставляється в HTML). Для вхідних даних Decoder має <code>dec.DisallowUnknownFields()</code>: розбір завершиться помилкою <code>json: unknown field \"extra\"</code>, якщо в JSON є ключ, якого немає в структурі. Це чудовий захист від друкарських помилок у конфігах («timeuot» замість «timeout») і від прихованих змін контракту API. Для звичайного <code>Unmarshal</code> такого режиму немає, тому строгий розбір пишуть через Decoder навіть для рядка: <code>json.NewDecoder(strings.NewReader(s))</code>.",
      "Ще два інструменти для нестандартних ситуацій. <b>json.RawMessage</b> — це <code>[]byte</code>, який зберігає шматок JSON <i>нерозібраним</i>. Він ідеальний для «конвертів» (envelope): у повідомленні є поле <code>type</code>, за яким вирішується, у яку структуру розбирати поле <code>data</code>. Спочатку розбирають конверт із <code>Data json.RawMessage</code>, дивляться на <code>Type</code>, а потім другим <code>Unmarshal</code> розбирають <code>Data</code> у потрібний тип. Другий інструмент — <b>json.Number</b>: рядкове подання числа. Якщо викликати <code>dec.UseNumber()</code>, то числа в <code>any</code> стануть не <code>float64</code>, а <code>json.Number</code>, і великий ідентифікатор <code>9007199254740993</code> збережеться точно: <code>n.Int64()</code> дасть його, <code>n.Float64()</code> дасть дробове, а <code>n.String()</code> поверне початковий запис (<code>12.50</code> залишиться саме так). Для <code>Int64()</code> дробове число дає помилку, і це правильно.",
      "Підсумок вибору. Простий формат: теги. Свій формат типу: <code>MarshalJSON</code>/<code>UnmarshalJSON</code> (value receiver для першого, pointer для другого; уникайте рекурсії через <code>plain</code>). Потік чи великий вхід: <code>Decoder</code> з <code>Decode</code>/<code>Token</code>/<code>More</code> і <code>Encoder</code>. Суворість: <code>DisallowUnknownFields</code>. Відкладений вибір типу: <code>RawMessage</code>. Точні числа: <code>UseNumber</code>. Ще один варіант для типів, що перетворюються в рядок: <code>encoding.TextMarshaler</code>/<code>TextUnmarshaler</code>: їх пакет використовує й для ключів мапи. У главі про тестування застосуємо ці вміння, а наступним буде <code>regexp</code>.",
    ],
    code: [
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

type Level int

const (
	Debug Level = iota
	Info
	Warn
)

var levelNames = []string{"debug", "info", "warn"}

func (l Level) MarshalJSON() ([]byte, error) {
	if l < 0 || int(l) >= len(levelNames) {
		return nil, fmt.Errorf("невідомий рівень %d", int(l))
	}
	return json.Marshal(levelNames[l])
}

func (l *Level) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	for i, name := range levelNames {
		if name == s {
			*l = Level(i)
			return nil
		}
	}
	return fmt.Errorf("невідомий рівень %q", s)
}

type Entry struct {
	Level Level  ${BT}json:"level"${BT}
	Msg   string ${BT}json:"msg"${BT}
}

type Rect struct {
	W, H int
}

func (r Rect) MarshalJSON() ([]byte, error) {
	type plain Rect
	return json.Marshal(struct {
		plain
		Area int ${BT}json:"area"${BT}
	}{plain(r), r.W * r.H})
}

func main() {
	b, err := json.Marshal(Entry{Level: Warn, Msg: "диск майже повний"})
	fmt.Println(string(b), err)

	var e Entry
	err = json.Unmarshal([]byte(${BT}{"level":"info","msg":"старт"}${BT}), &e)
	fmt.Println(e.Level == Info, e.Msg, err)

	err = json.Unmarshal([]byte(${BT}{"level":"fatal","msg":"?"}${BT}), &e)
	fmt.Println(err)

	_, err = json.Marshal(Entry{Level: 9})
	fmt.Println(err)

	r, _ := json.Marshal(Rect{3, 4})
	fmt.Println(string(r))
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
)

type Event struct {
	Name string ${BT}json:"name"${BT}
	N    int    ${BT}json:"n"${BT}
}

func main() {
	stream := ${BT}{"name":"a","n":1}
{"name":"b","n":2}
{"name":"c","n":3}${BT}
	dec := json.NewDecoder(strings.NewReader(stream))
	total := 0
	for {
		var e Event
		err := dec.Decode(&e)
		if err == io.EOF {
			break
		}
		if err != nil {
			fmt.Println("помилка:", err)
			return
		}
		total += e.N
		fmt.Println("подія", e.Name)
	}
	fmt.Println("сума:", total)

	arr := json.NewDecoder(strings.NewReader(${BT}[{"name":"x","n":10},{"name":"y","n":20}]${BT}))
	if _, err := arr.Token(); err != nil {
		fmt.Println(err)
		return
	}
	for arr.More() {
		var e Event
		if err := arr.Decode(&e); err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println("з масиву:", e.Name, e.N)
	}
	arr.Token()

	strict := json.NewDecoder(strings.NewReader(${BT}{"name":"z","n":1,"extra":true}${BT}))
	strict.DisallowUnknownFields()
	var e Event
	fmt.Println(strict.Decode(&e))

	enc := json.NewEncoder(os.Stdout)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", " ")
	enc.Encode(map[string]any{"html": "<b>&</b>", "n": 1})
	enc.Encode(Event{"w", 5})
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
)

type Envelope struct {
	Type string          ${BT}json:"type"${BT}
	Data json.RawMessage ${BT}json:"data"${BT}
}

type Click struct {
	X, Y int
}

type Key struct {
	Code string
}

func handle(raw string) {
	var env Envelope
	if err := json.Unmarshal([]byte(raw), &env); err != nil {
		fmt.Println("помилка:", err)
		return
	}
	switch env.Type {
	case "click":
		var c Click
		if err := json.Unmarshal(env.Data, &c); err != nil {
			fmt.Println("помилка:", err)
			return
		}
		fmt.Printf("клік %d,%d\n", c.X, c.Y)
	case "key":
		var k Key
		if err := json.Unmarshal(env.Data, &k); err != nil {
			fmt.Println("помилка:", err)
			return
		}
		fmt.Println("клавіша", k.Code)
	default:
		fmt.Println("невідомий тип", env.Type, string(env.Data))
	}
}

func main() {
	handle(${BT}{"type":"click","data":{"X":10,"Y":20}}${BT})
	handle(${BT}{"type":"key","data":{"Code":"Enter"}}${BT})
	handle(${BT}{"type":"scroll","data":  [1, 2]}${BT})
	handle(${BT}{"type":"click","data":"не об'єкт"}${BT})
}
`,
      String.raw`package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

func main() {
	src := ${BT}{"id": 9007199254740993, "price": 12.50}${BT}

	var plain map[string]any
	json.Unmarshal([]byte(src), &plain)
	fmt.Println(plain["id"])

	dec := json.NewDecoder(strings.NewReader(src))
	dec.UseNumber()
	var exact map[string]any
	dec.Decode(&exact)
	id := exact["id"].(json.Number)
	n, err := id.Int64()
	fmt.Println(id, n, err)

	price := exact["price"].(json.Number)
	f, _ := price.Float64()
	_, err = price.Int64()
	fmt.Println(price.String(), f, err != nil)
}
`,
    ],
    note: "MarshalJSON зазвичай має value receiver, UnmarshalJSON обов'язково pointer receiver. Не викликайте json.Marshal для того самого типу всередині його MarshalJSON: використайте локальний type plain T. Decoder читає потік по одному значенню (Decode, Token, More), DisallowUnknownFields робить розбір суворим, RawMessage відкладає розбір, UseNumber зберігає точні числа.",
    work: "Власні формати перелічень, грошей і дат у публічних API, розбір NDJSON-логів і великих відповідей без завантаження в пам'ять, повідомлення з полем type, суворі конфігурації, що відхиляють помилки в іменах ключів, ідентифікатори з великих систем, які не вміщуються в float64.",
    tasks: [
      "Чому всередині MarshalJSON типу T виклик json.Marshal(t) призводить до нескінченної рекурсії і як цього уникнути за допомогою локального типу plain?",
      "У яких випадках варто брати json.Decoder замість Unmarshal і що дають DisallowUnknownFields, RawMessage та UseNumber?",
    ],
  },
];
