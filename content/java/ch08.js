export const LESSONS_08 = [
  {
    t: "String, StringBuilder і текстові блоки",
    ch: "Стандартна бібліотека",
    easy: String.raw`String — це кам'яна табличка, а StringBuilder — дошка з крейдою: на табличці кожна правка вимагає нової, а на дошці ви стираєте й дописуєте на місці, не витрачаючи нових табличок.`,
    p: [
      String.raw`Рядки незмінні, тому конкатенація в циклі <code>s += x</code> щоразу створює новий рядок і копіює старий: для n ітерацій це квадратична робота. Для побудови тексту частинами використовують <code>StringBuilder</code> — змінюваний буфер, у який дописують <code>append(...)</code>, а наприкінці дістають результат викликом <code>toString()</code>. Це стандартний прийом для циклів, генерації звітів, JSON та SQL, і про нього треба пам'ятати щоразу, коли текст росте в циклі.`,
      String.raw`Основні методи: <code>append(x)</code> (для будь-яких типів), <code>insert(i, x)</code>, <code>delete(from, to)</code>, <code>deleteCharAt(i)</code>, <code>replace(from, to, s)</code>, <code>reverse()</code>, <code>setCharAt(i, c)</code>, <code>setLength(n)</code>, <code>length()</code>, <code>charAt(i)</code>, <code>indexOf</code>. Методи повертають сам <code>StringBuilder</code>, тому їх ланцюжать: <code>sb.append("a").append(1).append('b')</code>. Такий запис читається як послідовність кроків і не потребує проміжних змінних.`,
      String.raw`<code>StringBuffer</code> — старіший синхронізований варіант: усі методи виконуються під замком, тому він повільніший. У новому коді його не використовують, бо <code>StringBuilder</code> достатньо: змінюваний буфер рідко ділиться між потоками. Початкову місткість можна задати: <code>new StringBuilder(1000)</code>. Це лише підказка про розмір внутрішнього масиву, а не довжина рядка, і вона дозволяє зменшити кількість перевиділень пам'яті.`,
      String.raw`Інші корисні методи <code>String</code> (Java 11 і новіші): <code>isBlank()</code>, <code>strip()</code>, <code>stripLeading()</code>, <code>stripTrailing()</code>, <code>lines()</code> (потік рядків), <code>repeat(n)</code>, <code>chars()</code>. Статичні <code>String.join(sep, items)</code>, <code>String.valueOf(x)</code>, <code>String.format(...)</code>. З Java 15 з'явилися <code>formatted(...)</code>, <code>stripIndent()</code> та <code>translateEscapes()</code>, які зручно поєднувати з текстовими блоками.`,
      String.raw`Текстові блоки (Java 15) — багаторядкові літерали в потрійних лапках <code>"""</code>. Відкривальні лапки мають стояти на своєму рядку, а текст починається з наступного. Відступ, спільний для всіх рядків (за найменшим), прибирається автоматично, а положення закривальних лапок впливає на розрахунок. Лапки всередині екранувати не потрібно, а перенесення рядка записується як звичайний перехід на новий рядок у коді.`,
      String.raw`Додаткові керування в текстових блоках: зворотна скісна в кінці рядка скасовує перенесення (рядок «склеюється» з наступним), <code>\s</code> зберігає кінцевий пробіл, а потрійні лапки всередині блоку екранують як <code>\"""</code>. Текстові блоки ідеально підходять для JSON, SQL, HTML, регулярних виразів і шаблонів: код не засмічений плюсами й <code>\n</code>, а формат тексту видно прямо в джерелі.`,
      String.raw`Порівняння й пам'ять: літерали рядків зберігаються в пулі, тому <code>"a" == "a"</code> зазвичай істинне, а <code>new String("a") == "a"</code> — хибне; порівнюйте вміст завжди через <code>equals</code>. Оператор <code>+</code> із константами компілятор обчислює сам, а для змінних у циклі він створює <code>StringBuilder</code> лише всередині одного виразу, а не між ітераціями, тому ручний <code>StringBuilder</code> для циклів усе одно потрібен.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        sb.append("Java").append(' ').append(21).append('!');
        System.out.println(sb);
        sb.insert(0, ">> ").reverse();
        System.out.println(sb);
        sb.reverse().setLength(7);
        System.out.println(sb + " " + sb.length());
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            if (sb.length() > 0) {
                sb.append(", ");
            }
            sb.append(i * i);                  // один буфер на весь цикл
        }
        System.out.println(sb);
        String joined = String.join("-", "a", "b", "c");
        System.out.println(joined + " " + "ab".repeat(2) + " " + "  x ".strip());
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String name = "Ira";
        String json = """
            {
              "name": "%s",
              "age": %d
            }
            """.formatted(name, 30);
        System.out.print(json);
        System.out.println(json.lines().count());
    }
}`,
      String.raw`// не компілюється: після відкривальних лапок текстового блоку має бути перехід на новий рядок
public class Main {
    public static void main(String[] args) {
        String text = """hello""";
        System.out.println(text);
    }
}`,
      String.raw`// аварія: індекс 10 виходить за межі буфера довжиною 3, StringIndexOutOfBoundsException
public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("abc");
        System.out.println(sb.length());
        sb.deleteCharAt(10);
    }
}`,
    ],
    note: String.raw`Для збирання тексту в циклі беріть <code>StringBuilder</code>, а не <code>+=</code>. Текстовий блок у потрійних лапках зберігає переноси рядків, а спільний відступ прибирає сам. Порівнюйте рядки через <code>equals</code>.`,
    work: String.raw`StringBuilder застосовують у генерації звітів, шаблонів SQL і JSON, а текстові блоки — для вбудованих фрагментів JSON, SQL та HTML у коді й тестах. Запис багаторядкових даних без плюсів та екранування зменшує кількість помилок і робить тести читабельними.`,
    tasks: [
      String.raw`Чому конкатенація в циклі через <code>+=</code> повільна для великих обсягів?`,
      String.raw`Як текстовий блок визначає, який відступ прибрати?`,
    ],
  },
  {
    t: "Scanner і читання тексту",
    ch: "Стандартна бібліотека",
    easy: String.raw`Scanner — це людина з олівцем, що читає текст і вирізає з нього слова та числа: їй байдуже, звідки текст, чи це клавіатура, чи рядок у пам'яті.`,
    p: [
      String.raw`Клас <code>Scanner</code> (пакет java.util) розбирає текст на частини за роздільником (за замовчуванням це пробіли й переноси) і перетворює їх на числа й рядки. Створення: <code>new Scanner(System.in)</code> для консолі, <code>new Scanner(String)</code> для рядка, <code>new Scanner(Path)</code> для файла. У наших завданнях введення з клавіатури немає, тому Scanner використовуємо з рядками, і поведінка від цього не змінюється.`,
      String.raw`Методи читання: <code>nextInt()</code>, <code>nextLong()</code>, <code>nextDouble()</code>, <code>next()</code> (одне слово), <code>nextLine()</code> (весь рядок до переносу). Перевірки: <code>hasNext()</code>, <code>hasNextInt()</code>, <code>hasNextLine()</code>. Типовий цикл: <code>while (sc.hasNextInt()) sum += sc.nextInt();</code> читає числа, поки вони є. Перевірка наперед дозволяє уникнути винятків і не вгадувати, скільки значень залишилось.`,
      String.raw`Класична пастка: після <code>nextInt()</code> курсор стоїть перед переносом рядка, тому наступний <code>nextLine()</code> поверне порожній рядок (залишок поточного рядка). Лікування: викликати додатковий <code>nextLine()</code> для «з'їдання» залишку або читати все через <code>nextLine()</code> і розбирати вручну через <code>Integer.parseInt</code>. Це найчастіша плутанина під час консольного введення, і вона бентежить навіть досвідчених програмістів.`,
      String.raw`Помилки: <code>nextInt()</code> для нечислового токена кидає <code>InputMismatchException</code> і не зсуває курсор (токен лишається в тексті), тож цикл без <code>hasNextInt()</code> може зациклитись. Кінець даних дає <code>NoSuchElementException</code>. Завжди перевіряйте наявність наступного токена, а для користувацького введення обробляйте помилки й повідомляйте, що саме не так із введеним.`,
      String.raw`Роздільник можна змінити: <code>sc.useDelimiter(",")</code> або регулярним виразом <code>useDelimiter("\\s*,\\s*")</code>: так читають CSV-подібні рядки. Також є <code>useLocale(Locale.US)</code>: розбір дробових чисел залежить від локалі (кома чи крапка). Для передбачуваного розбору задавайте локаль явно, інакше програма поводитиметься по-різному на комп'ютерах користувачів із різними налаштуваннями.`,
      String.raw`Scanner зручний, але повільний для великих обсягів: для швидкого читання файлів використовують <code>BufferedReader</code> із методом <code>readLine()</code> чи <code>Files.lines</code>. Для змагань із програмування й великих файлів Scanner непридатний. Закривайте Scanner (<code>try-with-resources</code>), особливо над файлами; але не закривайте <code>System.in</code>, якщо він ще потрібен програмі.`,
      String.raw`Об'єкт <code>BufferedReader</code> над <code>StringReader</code> дозволяє читати рядки з тексту: <code>new BufferedReader(new StringReader(text))</code>, а його <code>lines()</code> повертає потік рядків. Для розбору тексту без читання з пристроїв є також <code>String.split</code>, <code>text.lines()</code> і регулярні вирази. Вибір залежить від складності: простий поділ — split, послідовне зчитування типізованих значень — Scanner. Для великих текстів і складних форматів краще брати спеціалізовані парсери, бо Scanner повільний і не знає структури даних.`,
    ],
    code: [
      String.raw`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("10 20 abc 30");
        int sum = 0;
        while (sc.hasNext()) {
            if (sc.hasNextInt()) {
                sum += sc.nextInt();
            } else {
                System.out.println("skip " + sc.next());
            }
        }
        System.out.println(sum);
    }
}`,
      String.raw`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("first line\nsecond line\nthird");
        while (sc.hasNextLine()) {
            String line = sc.nextLine();
            System.out.println(line.length() + ": " + line);
        }
    }
}`,
      String.raw`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("42\nhello world\n");
        int n = sc.nextInt();
        String rest = sc.nextLine();          // залишок рядка після числа: порожній
        String line = sc.nextLine();          // справжній наступний рядок
        System.out.println(n + " [" + rest + "] [" + line + "]");
    }
}`,
      String.raw`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("a, b ,c").useDelimiter("\\s*,\\s*");
        while (sc.hasNext()) {
            System.out.println("[" + sc.next() + "]");
        }
    }
}`,
      String.raw`// аварія: токен abc не є числом, nextInt() кидає InputMismatchException
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("12 abc");
        System.out.println(sc.nextInt());
        System.out.println(sc.nextInt());
    }
}`,
    ],
    note: String.raw`<code>nextLine()</code> після <code>nextInt()</code> повертає залишок поточного рядка, а не наступний. Перед читанням перевіряйте <code>hasNextInt()</code>, бо <code>nextInt()</code> для не числа кидає <code>InputMismatchException</code>.`,
    work: String.raw`Scanner використовують у консольних утилітах, навчальних програмах і швидких скриптах, а для розбору конфігів і даних із файлів частіше беруть BufferedReader, split і спеціалізовані парсери. Дані із зовнішнього світу завжди валідують: нечисловий токен чи порожній рядок — звичайна ситуація, а не виняток.`,
    tasks: [
      String.raw`Чому після <code>nextInt()</code> наступний <code>nextLine()</code> повертає порожній рядок?`,
      String.raw`Як зчитати всі числа з рядка, ігноруючи слова?`,
    ],
  },
  {
    t: "java.time: дати й тривалості",
    ch: "Стандартна бібліотека",
    easy: String.raw`java.time — це календар і годинник, які не плутають дату з часом і поясом: окремі типи для дня, моменту й проміжку, і всі вони незмінні, тож їх безпечно передавати будь-куди.`,
    p: [
      String.raw`Старі <code>Date</code> і <code>Calendar</code> мали багато проблем: змінюваність, нумерацію місяців з нуля, плутанину поясів. З Java 8 є пакет <code>java.time</code> із чіткими типами. <code>LocalDate</code> — дата без часу, <code>LocalTime</code> — час без дати, <code>LocalDateTime</code> — дата й час без пояса, <code>ZonedDateTime</code> — із поясом, <code>Instant</code> — момент на шкалі часу (UTC), <code>OffsetDateTime</code> — зі зсувом від UTC.`,
      String.raw`Створення: <code>LocalDate.of(2026, 11, 20)</code>, <code>LocalDate.parse("2026-11-20")</code>, <code>LocalDate.now()</code> (залежить від годинника: у тестах використовують <code>Clock</code>), перелічення <code>Month.NOVEMBER</code> та <code>DayOfWeek</code>. Місяці нумеруються з 1. Усі типи незмінні: <code>plusDays(5)</code> повертає нову дату, а стару не змінює, тому дату можна безпечно передавати в інші методи.`,
      String.raw`Арифметика: <code>plusDays</code>, <code>minusMonths</code>, <code>plusWeeks</code>, <code>withDayOfMonth(1)</code>, <code>getDayOfWeek()</code>, <code>isLeapYear()</code>, <code>lengthOfMonth()</code>, а також <code>isBefore</code>, <code>isAfter</code>, <code>equals</code>. Додавання місяця до 31 січня дає останній день лютого, а не помилку: бібліотека коректно «притискає» день до кінця місяця й не створює неіснуючих дат.`,
      String.raw`Тривалості: <code>Duration</code> — проміжок у годинах, хвилинах, секундах (<code>Duration.ofMinutes(90)</code>, <code>between(t1, t2)</code>), <code>Period</code> — у роках, місяцях, днях (<code>Period.between(d1, d2)</code>). Для кількості днів між датами є <code>ChronoUnit.DAYS.between(d1, d2)</code>. Різниця між Duration і Period суттєва: місяць не має фіксованої кількості секунд, тому їх не змішують.`,
      String.raw`Формат і розбір: <code>DateTimeFormatter.ofPattern("dd.MM.yyyy")</code> для виводу й розбору, <code>DateTimeFormatter.ISO_LOCAL_DATE</code> для стандартного формату. Літери шаблону чутливі до регістру: <code>MM</code> — місяць, <code>mm</code> — хвилини, <code>yyyy</code> — рік, <code>HH</code> — 24-годинний формат. Некоректний рядок дає <code>DateTimeParseException</code>. Назви місяців залежать від локалі (<code>Locale</code>).`,
      String.raw`Часові пояси: <code>ZoneId.of("Europe/Kyiv")</code>, <code>ZonedDateTime.now(zone)</code>, <code>instant.atZone(zone)</code>. Зберігати й передавати моменти краще як <code>Instant</code> або в UTC, а в пояс користувача перетворювати лише для показу. Переходи на літній час роблять деякі години неіснуючими чи повторюваними: <code>ZonedDateTime</code> їх враховує, а <code>LocalDateTime</code> — ні.`,
      String.raw`Тестованість: <code>LocalDate.now()</code> читає системний годинник, і тест залежить від дня запуску. Рішення — передавати <code>Clock</code>: <code>LocalDate.now(clock)</code>, а в тестах використовувати <code>Clock.fixed(...)</code>. Також не зберігайте дати рядками у внутрішньому коді: беріть типи, а розбір і форматування виконуйте на краях системи, де дані входять чи виходять. Так внутрішній код лишається незалежним від форматів і локалей, а помилки розбору виникають в одному місці й мають зрозумілі повідомлення.`,
    ],
    code: [
      String.raw`import java.time.DayOfWeek;
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate d = LocalDate.of(2026, 1, 31);
        System.out.println(d.plusMonths(1));              // 2026-02-28
        System.out.println(d.plusDays(30) + " " + d.getDayOfWeek());
        System.out.println(d.getDayOfWeek() == DayOfWeek.SATURDAY);
        System.out.println(LocalDate.of(2024, 2, 1).lengthOfMonth() + " " + d.isLeapYear());
    }
}`,
      String.raw`import java.time.Duration;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate a = LocalDate.of(2026, 1, 1);
        LocalDate b = LocalDate.of(2026, 12, 31);
        System.out.println(ChronoUnit.DAYS.between(a, b));
        System.out.println(Period.between(a, b));
        System.out.println(Duration.ofMinutes(90));
        System.out.println(Duration.ofMinutes(90).toHours() + " " + Duration.ofSeconds(3725).toMinutesPart());
    }
}`,
      String.raw`import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        LocalDate d = LocalDate.of(2026, 11, 20);
        System.out.println(d.format(f));
        System.out.println(LocalDate.parse("05.03.2025", f));
    }
}`,
      String.raw`import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

public class Main {
    public static void main(String[] args) {
        Clock fixed = Clock.fixed(Instant.parse("2026-11-20T10:15:30Z"), ZoneOffset.UTC);
        System.out.println(LocalDate.now(fixed));          // тест не залежить від справжньої дати
        System.out.println(Instant.now(fixed));
    }
}`,
      String.raw`// аварія: тринадцятого місяця не існує, DateTimeParseException
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        System.out.println(LocalDate.parse("2026-11-20"));
        System.out.println(LocalDate.parse("2026-13-40"));
    }
}`,
    ],
    note: String.raw`Типи <code>java.time</code> незмінні: <code>plusDays</code> повертає нову дату. Місяці нумеруються з 1, а <code>MM</code> у шаблоні — місяць, <code>mm</code> — хвилини. Для тестів передавайте <code>Clock</code>, а моменти зберігайте як <code>Instant</code>.`,
    work: String.raw`Помилки з датами й поясами — одні з найдорожчих у реальних системах: неправильні терміни платежів, зсув на годину після переходу на літній час, звіти за «не той» день. Тому команди зберігають моменти в UTC, використовують java.time замість старих класів і фіксують годинник у тестах.`,
    tasks: [
      String.raw`Чим <code>Duration</code> відрізняється від <code>Period</code>?`,
      String.raw`Чому в тестах замість <code>LocalDate.now()</code> краще передавати <code>Clock</code>?`,
    ],
  },
  {
    t: "Math, Random із seed і BigDecimal",
    ch: "Стандартна бібліотека",
    easy: String.raw`Math — це калькулятор, Random із seed — лототрон, що за однакового початкового числа видає однакові кулі, а BigDecimal — бухгалтерські рахунки, які не помиляються на копійках.`,
    p: [
      String.raw`Клас <code>Math</code> містить статичні функції: <code>abs</code>, <code>max</code>, <code>min</code>, <code>pow</code>, <code>sqrt</code>, <code>cbrt</code>, <code>floor</code>, <code>ceil</code>, <code>round</code>, <code>signum</code>, <code>hypot</code>, тригонометрію й логарифми. Для цілих є перевірені <code>addExact</code>, <code>multiplyExact</code>, <code>toIntExact</code>, що кидають виняток при переповненні, та <code>floorDiv</code>/<code>floorMod</code>, які коректно працюють із від'ємними числами. Константи: <code>Math.PI</code>, <code>Math.E</code>.`,
      String.raw`Нюанси: <code>Math.abs(Integer.MIN_VALUE)</code> лишається від'ємним (переповнення), <code>Math.round(-2.5)</code> дає <code>-2</code> (округлення до більшого), оператор <code>%</code> для від'ємних дає від'ємну остачу, а <code>floorMod(-7, 3)</code> дає <code>2</code>. Результат <code>sqrt(-1)</code> — <code>NaN</code>, а ділення дробових чисел на нуль дає нескінченність без винятку. Ці випадки варто пам'ятати, бо вони дивують.`,
      String.raw`Випадкові числа: <code>java.util.Random</code> — псевдовипадковий генератор, детермінований за seed. <code>new Random(42)</code> завжди дає ту саму послідовність, що ідеально для відтворюваних тестів і симуляцій. Методи: <code>nextInt()</code>, <code>nextInt(bound)</code> (від 0 до bound мінус один), <code>nextInt(from, to)</code> (Java 17 і новіші), <code>nextDouble()</code>, <code>nextBoolean()</code>, <code>nextGaussian()</code>. Без seed послідовність щоразу інша.`,
      String.raw`Для безпеки Random непридатний: його стан можна відновити за кількома значеннями. Паролі, токени й ключі генерують через <code>java.security.SecureRandom</code>. У багатопотоковому коді замість спільного Random використовують <code>ThreadLocalRandom.current()</code>, швидший і без конкуренції, але без seed, тому для відтворюваних тестів не підходить. Також <code>Collections.shuffle(list, new Random(seed))</code> дає відтворюване перемішування.`,
      String.raw`Точні десяткові обчислення: <code>BigDecimal</code> зберігає число як невелике ціле (unscaled value) і масштаб (кількість знаків після коми). Створюйте його з рядка: <code>new BigDecimal("0.1")</code> або <code>BigDecimal.valueOf(0.1)</code>, а не <code>new BigDecimal(0.1)</code> (останнє переносить двійкову похибку). Операції: <code>add</code>, <code>subtract</code>, <code>multiply</code>, <code>divide</code>, <code>compareTo</code>, <code>negate</code>.`,
      String.raw`Ділення й округлення: <code>divide</code> без вказання масштабу кидає <code>ArithmeticException</code>, якщо результат нескінченний (1/3). Задавайте масштаб і режим: <code>a.divide(b, 2, RoundingMode.HALF_UP)</code>, а також <code>setScale(2, RoundingMode.HALF_EVEN)</code> («банківське» округлення). Порівнюйте через <code>compareTo</code>, а не <code>equals</code>: <code>2.0</code> і <code>2.00</code> не рівні за <code>equals</code> через різний масштаб, але рівні за <code>compareTo</code>.`,
      String.raw`<code>BigInteger</code> — цілі довільної довжини (факторіал 50, криптографія): <code>add</code>, <code>multiply</code>, <code>pow</code>, <code>mod</code>, <code>gcd</code>, <code>isProbablePrime</code>. Обидва класи незмінні й повільніші за примітиви, тому їх вживають там, де потрібна точність: гроші, податки, науково-технічні розрахунки з великими числами, де помилка округлення недопустима. У кожному такому випадку зафіксуйте правила округлення в коді й тестах, щоб результат не залежав від настрою чи платформи.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(Math.max(3, 9) + " " + Math.pow(2, 10) + " " + Math.sqrt(144));
        System.out.println(Math.floor(-2.5) + " " + Math.ceil(-2.5) + " " + Math.round(-2.5));
        System.out.println(-7 % 3 + " " + Math.floorMod(-7, 3));
        System.out.println(Math.toIntExact(123456L));
    }
}`,
      String.raw`import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random a = new Random(42);
        Random b = new Random(42);
        System.out.println(a.nextInt(100) + " " + b.nextInt(100));      // однакові: однаковий seed
        System.out.println(a.nextInt(100) + " " + b.nextInt(100));
        int dice = new Random(7).nextInt(6) + 1;
        System.out.println(dice >= 1 && dice <= 6);
    }
}`,
      String.raw`import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        BigDecimal price = new BigDecimal("19.99");
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(3));
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        System.out.println(subtotal + " " + tax + " " + subtotal.add(tax));
        System.out.println(new BigDecimal("2.0").equals(new BigDecimal("2.00")));
        System.out.println(new BigDecimal("2.0").compareTo(new BigDecimal("2.00")));
    }
}`,
      String.raw`// аварія: результат 1/3 нескінченний, а масштаб не задано, ArithmeticException
import java.math.BigDecimal;

public class Main {
    public static void main(String[] args) {
        BigDecimal a = BigDecimal.ONE;
        BigDecimal b = new BigDecimal(3);
        System.out.println(a.divide(b, 4, java.math.RoundingMode.HALF_UP));
        System.out.println(a.divide(b));
    }
}`,
      String.raw`import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        BigInteger f = BigInteger.ONE;
        for (int i = 2; i <= 30; i++) {
            f = f.multiply(BigInteger.valueOf(i));          // не вміщується в long
        }
        System.out.println(f);
        System.out.println(f.bitLength() + " " + BigInteger.valueOf(97).isProbablePrime(20));
    }
}`,
    ],
    note: String.raw`<code>new Random(seed)</code> дає відтворювану послідовність, а паролі генерують через <code>SecureRandom</code>. Гроші рахують у <code>BigDecimal</code>, створеному з рядка, ділять із явним масштабом і режимом округлення, а порівнюють через <code>compareTo</code>.`,
    work: String.raw`Фінансові розрахунки, податки та курси валют виконують у BigDecimal або в цілих копійках, а випадкові дані для тестів генерують із фіксованим seed, щоб збій можна було відтворити. SecureRandom обов'язковий для будь-чого, що пов'язане з безпекою.`,
    tasks: [
      String.raw`Чому <code>new BigDecimal(0.1)</code> небезпечніший за <code>new BigDecimal("0.1")</code>?`,
      String.raw`Для чого в тестах задають seed генератору випадкових чисел?`,
    ],
  },
  {
    t: "Optional",
    ch: "Стандартна бібліотека",
    easy: String.raw`Optional — це чесна відповідь «може бути, а може й ні»: замість того щоб повернути порожнечу під виглядом значення, метод віддає коробку, і ви самі вирішуєте, що робити, якщо вона порожня.`,
    p: [
      String.raw`Основи Optional ми бачили в главі про помилки, а тут розглянемо його докладніше. <code>Optional&lt;T&gt;</code> — незмінна обгортка для значення, що може бути відсутнім. Створення: <code>Optional.of(x)</code> (x не може бути null, інакше <code>NullPointerException</code>), <code>Optional.ofNullable(x)</code> (null стає порожнім Optional), <code>Optional.empty()</code>. Помилка з <code>Optional.of(null)</code> компілятором не виявляється, тому будьте уважні, коли значення може бути відсутнім.`,
      String.raw`Читання: <code>orElse(def)</code> завжди обчислює запасне значення (навіть коли воно не потрібне), а <code>orElseGet(supplier)</code> — лише коли Optional порожній: для дорогих обчислень (запит до бази, створення об'єкта) беріть саме orElseGet. Метод <code>orElseThrow()</code> без аргументів (Java 10) кидає <code>NoSuchElementException</code>, а <code>orElseThrow(() -&gt; new MyException(...))</code> — власний виняток. Метод <code>get()</code> без перевірки не використовуйте.`,
      String.raw`Перетворення: <code>map(f)</code> застосовує функцію до значення, якщо воно є, і обертає результат; <code>flatMap(f)</code> потрібен, коли <code>f</code> сам повертає Optional (щоб не вийшов Optional в Optional); <code>filter(predicate)</code> перетворює значення на порожнє, якщо умова не виконана; <code>or(supplier)</code> (Java 9) дає запасний Optional. Разом вони замінюють вкладені перевірки на null.`,
      String.raw`Дії: <code>ifPresent(consumer)</code> виконує дію, коли значення є; <code>ifPresentOrElse(consumer, runnable)</code> (Java 9) виконує або дію, або запасну гілку; <code>isPresent()</code>, <code>isEmpty()</code> (Java 11). Ланцюжки <code>map/filter/orElse</code> читаються як опис перетворення: «взяти користувача, його адресу, місто, або "unknown"», і не потребують ні тимчасових змінних, ні кількох if.`,
      String.raw`Optional і потоки: <code>optional.stream()</code> (Java 9) перетворює його на потік із нуля чи одного елемента, що зручно для <code>flatMap(Optional::stream)</code>: відкинути порожні й розпакувати наявні. Для примітивів є <code>OptionalInt</code>, <code>OptionalLong</code>, <code>OptionalDouble</code>: їх повертають <code>IntStream.max()</code>, <code>average()</code> та інші методи потоків, коли результату може не бути, наприклад для порожнього потоку.`,
      String.raw`Антипатерни: параметр методу типу Optional (використовуйте перевантаження чи перевірку), поле класу Optional (він не серіалізується й подвоює кількість об'єктів), Optional у колекціях, код <code>if (opt.isPresent()) opt.get()</code> замість map чи ifPresent, повернення <code>null</code> із методу, що має повертати Optional, і <code>Optional.of(x)</code> для значення, яке може бути null. Optional призначений саме для результатів методів.`,
      String.raw`Чи завжди його використовувати? Для ситуацій «може не знайтись» — так. Для обов'язкових значень — ні: беріть <code>Objects.requireNonNull</code>. Для колекцій повертайте порожні колекції, а не Optional. Optional коштує додатковий об'єкт, тому в гарячих циклах із мільйонами викликів його використовують обережно, а в звичайному прикладному коді різниця непомітна й читабельність важливіша за мікрооптимізацію.`,
    ],
    code: [
      String.raw`import java.util.Optional;

public class Main {
    static int calls = 0;

    static String expensive() {
        calls++;
        return "computed";
    }

    public static void main(String[] args) {
        Optional<String> present = Optional.of("value");
        System.out.println(present.orElse(expensive()));       // expensive() викликається завжди
        System.out.println(present.orElseGet(Main::expensive)); // лише для порожнього
        System.out.println(calls);
    }
}`,
      String.raw`import java.util.Optional;

public class Main {
    record Address(String city) { }

    record User(String name, Address address) { }

    static Optional<Address> addressOf(User u) {
        return Optional.ofNullable(u.address());
    }

    public static void main(String[] args) {
        User ira = new User("Ira", new Address("Kyiv"));
        User bob = new User("Bob", null);
        System.out.println(addressOf(ira).map(Address::city).orElse("unknown"));
        System.out.println(addressOf(bob).map(Address::city).orElse("unknown"));
        System.out.println(Optional.of(ira).flatMap(Main::addressOf).isPresent());
        System.out.println(Optional.of(7).filter(n -> n > 10).isPresent());
    }
}`,
      String.raw`import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<String> name = Optional.of("Ira");
        name.ifPresentOrElse(n -> System.out.println("present: " + n), () -> System.out.println("absent"));
        Optional<String> none = Optional.empty();
        none.ifPresentOrElse(n -> System.out.println("present: " + n), () -> System.out.println("absent"));
        System.out.println(none.or(() -> Optional.of("backup")).get());
    }
}`,
      String.raw`import java.util.List;
import java.util.Optional;

public class Main {
    static Optional<Integer> parse(String s) {
        try {
            return Optional.of(Integer.parseInt(s));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public static void main(String[] args) {
        List<Integer> numbers = List.of("1", "x", "3", "y", "5").stream()
            .map(Main::parse)
            .flatMap(Optional::stream)          // порожні відкидаються, наявні розпаковуються
            .toList();
        System.out.println(numbers);
    }
}`,
      String.raw`// аварія: Optional.of не приймає null, NullPointerException
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        String maybe = null;
        System.out.println(Optional.ofNullable(maybe).isPresent());
        System.out.println(Optional.of(maybe));
    }
}`,
    ],
    note: String.raw`<code>orElse</code> завжди обчислює запасне значення, а <code>orElseGet</code> — лише коли Optional порожній. <code>flatMap</code> потрібен, коли функція сама повертає Optional. Optional призначений для результатів методів, а не для полів і параметрів.`,
    work: String.raw`Репозиторії й сервіси повертають Optional із методів пошуку, а ланцюжки map і orElse роблять код читабельним без вкладених if. Помилки трапляються, коли Optional використовують як поле чи параметр або викликають get без перевірки: на рев'ю їх завжди позначають.`,
    tasks: [
      String.raw`Чим <code>orElse</code> відрізняється від <code>orElseGet</code> і коли різниця важлива?`,
      String.raw`Коли потрібен <code>flatMap</code>, а не <code>map</code> для Optional?`,
    ],
  },
  {
    t: "Stream API: основи",
    ch: "Стандартна бібліотека",
    easy: String.raw`Stream — це конвеєр на заводі: сировина (дані) рухається стрічкою, на кожній станції її фільтрують чи перетворюють, а наприкінці збирають виріб. Сам конвеєр нічого не зберігає й нічого не робить, доки не запустять останню станцію.`,
    p: [
      String.raw`Stream API (Java 8) — декларативний спосіб обробки колекцій: замість циклу з умовами ви описуєте, що зробити з елементами: <code>list.stream().filter(...).map(...).collect(...)</code>. Потік (<code>Stream&lt;T&gt;</code>) не є структурою даних: він не зберігає елементи й не змінює джерело, а лише описує обробку. Отримати його можна з колекції (<code>stream()</code>), масиву (<code>Arrays.stream</code>), <code>Stream.of(...)</code>, <code>IntStream.range(0, n)</code>, <code>String.chars()</code> або <code>Files.lines</code>.`,
      String.raw`Операції бувають проміжні (повертають потік: <code>filter</code>, <code>map</code>, <code>sorted</code>, <code>distinct</code>, <code>limit</code>, <code>skip</code>, <code>peek</code>, <code>flatMap</code>) і термінальні (запускають обробку й повертають результат: <code>collect</code>, <code>forEach</code>, <code>count</code>, <code>sum</code>, <code>reduce</code>, <code>anyMatch</code>, <code>findFirst</code>, <code>toList</code>). Без термінальної операції нічого не виконується: проміжні операції ледачі. Вони виконуються поелементно, а не крок за кроком над усією колекцією.`,
      String.raw`Операція <code>filter(predicate)</code> лишає елементи за умовою; <code>map(function)</code> перетворює кожен; <code>sorted()</code> чи <code>sorted(comparator)</code> сортує; <code>distinct()</code> прибирає дублікати (через equals); <code>limit(n)</code> і <code>skip(n)</code> беруть чи пропускають. Приклад: <code>names.stream().filter(n -&gt; n.length() &gt; 3).map(String::toUpperCase).sorted().toList()</code> — «довгі імена у верхньому регістрі за абеткою». Такий запис читається як речення.`,
      String.raw`Термінальні операції: <code>toList()</code> (Java 16, незмінний список), <code>collect(Collectors.toList())</code>, <code>count()</code>, <code>forEach(...)</code>, <code>reduce(identity, op)</code> (зведення до одного значення), <code>min</code> та <code>max(comparator)</code> (повертають Optional), <code>anyMatch</code>, <code>allMatch</code>, <code>noneMatch</code> (з коротким замиканням), <code>findFirst</code> і <code>findAny</code> (Optional). Саме вони «запускають» конвеєр.`,
      String.raw`Примітивні потоки <code>IntStream</code>, <code>LongStream</code>, <code>DoubleStream</code> уникають упаковки й мають <code>sum()</code>, <code>average()</code>, <code>max()</code>, <code>summaryStatistics()</code>. Перехід: <code>mapToInt(Integer::intValue)</code> і <code>boxed()</code> назад. Вираз <code>IntStream.rangeClosed(1, 5).sum()</code> дає суму від 1 до 5. Для чисел зазвичай обирають саме IntStream, а не Stream&lt;Integer&gt;, бо так менше пам'яті й швидше.`,
      String.raw`Потік одноразовий: після термінальної операції його не можна використати знову (<code>IllegalStateException</code>: stream has already been operated upon or closed). Лямбди в потоках мають бути без побічних ефектів і не змінювати джерело: змінювати зовнішні змінні з <code>forEach</code> чи <code>map</code> — ознака неправильного використання, особливо для паралельних потоків, де порядок виконання не гарантований.`,
      String.raw`Коли потоки, а коли цикл: потоки читаються краще для конвеєрів «відфільтруй, перетвори, збери», але цикл простіший для складної логіки з кількома змінними, раннім виходом чи винятками (лямбди не кидають перевірені винятки). Налагодження потоків складніше (допомагає <code>peek</code>). Не перетворюйте все на потоки без потреби: головне — зрозумілість коду для того, хто читатиме його після вас.`,
    ],
    code: [
      String.raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ira", "Oleh", "Anna", "Taras", "Bo");
        List<String> result = names.stream()
            .filter(n -> n.length() > 3)
            .map(String::toUpperCase)
            .sorted()
            .toList();
        System.out.println(result);
    }
}`,
      String.raw`import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        System.out.println(IntStream.rangeClosed(1, 5).sum());
        System.out.println(IntStream.range(0, 10).filter(n -> n % 2 == 0).boxed().toList());
        System.out.println(IntStream.of(3, 8, 1).max().getAsInt());
        System.out.println(IntStream.of(2, 4, 6).average().orElse(0));
        System.out.println(IntStream.of(5, 7, 9).summaryStatistics());
    }
}`,
      String.raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);
        System.out.println(nums.stream().count());
        System.out.println(nums.stream().reduce(0, Integer::sum));
        System.out.println(nums.stream().anyMatch(n -> n > 5) + " " + nums.stream().allMatch(n -> n > 1));
        System.out.println(nums.stream().filter(n -> n % 2 == 1).map(n -> n * n).toList());
        System.out.println(nums.stream().findFirst().get());
    }
}`,
      String.raw`import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) {
        Stream<Integer> lazy = Stream.of(1, 2, 3).peek(n -> System.out.println("seen " + n));
        System.out.println("pipeline built, nothing printed yet");
        long count = lazy.count();                  // термінальна операція запускає обробку
        System.out.println(count);
    }
}`,
      String.raw`// аварія: потік вже використано термінальною операцією, повторне використання кидає IllegalStateException
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) {
        Stream<String> s = Stream.of("a", "b", "c");
        System.out.println(s.count());
        System.out.println(s.count());
    }
}`,
    ],
    note: String.raw`Проміжні операції ледачі й виконуються лише з термінальною, а потік можна використати один раз. Лямбди в потоках не мають змінювати зовнішній стан. Для чисел беріть <code>IntStream</code>, для результатів без вмісту — <code>Optional</code>.`,
    work: String.raw`Stream API використовують для обробки колекцій у сервісах: фільтрація й перетворення записів, підрахунок, групування, формування відповідей. Читати такі конвеєри потрібно вміти навіть тоді, коли самі ви надаєте перевагу циклам, бо вони трапляються майже в кожній кодовій базі на сучасній Java.`,
    tasks: [
      String.raw`Чому проміжні операції Stream нічого не виконують без термінальної?`,
      String.raw`Чим <code>map</code> відрізняється від <code>filter</code>?`,
    ],
  },
  {
    t: "Stream API: collect, groupingBy і flatMap",
    ch: "Стандартна бібліотека",
    easy: String.raw`collect — це фінальна пакувальна станція конвеєра: за вашою інструкцією (колектором) вона складає все в список, у множину, у мапу чи навіть групує елементи за кольорами.`,
    p: [
      String.raw`Термінальна операція <code>collect(Collector)</code> збирає елементи потоку в результат. Клас <code>Collectors</code> має готові колектори: <code>toList()</code>, <code>toSet()</code>, <code>toMap(keyFn, valueFn)</code>, <code>joining(sep, prefix, suffix)</code>, <code>counting()</code>, <code>summingInt</code>, <code>averagingInt</code>, <code>groupingBy</code>, <code>partitioningBy</code>. Їх імпортують статично (<code>import static java.util.stream.Collectors.*;</code>): тоді записи коротші, але в нашому курсі ми частіше пишемо <code>Collectors.</code> явно.`,
      String.raw`Колектор <code>joining(", ")</code> склеює рядки: <code>names.stream().collect(Collectors.joining(", ", "[", "]"))</code>. Колектор <code>toMap</code> будує мапу: <code>toMap(User::id, Function.identity())</code>; при дубльованих ключах він кидає <code>IllegalStateException</code>, тому або додають об'єднувач (третій аргумент: <code>(a, b) -&gt; a</code>), або групують. Результуючу мапу можна задати четвертим аргументом (наприклад, <code>TreeMap::new</code>).`,
      String.raw`<code>groupingBy(classifier)</code> групує елементи за ключем: <code>words.stream().collect(groupingBy(String::length))</code> дає <code>Map&lt;Integer, List&lt;String&gt;&gt;</code>. Другий аргумент — «колектор низхідного потоку»: <code>groupingBy(String::length, counting())</code> рахує елементи в групі, <code>groupingBy(Person::city, mapping(Person::name, toList()))</code> збирає лише імена. Це еквівалент SQL GROUP BY, що замінює ручні цикли з <code>computeIfAbsent</code>.`,
      String.raw`<code>partitioningBy(predicate)</code> ділить елементи на дві групи — <code>true</code> і <code>false</code>: <code>partitioningBy(n -&gt; n % 2 == 0)</code>. Цікаві складені колектори: <code>summarizingInt</code> (кількість, сума, мінімум, максимум, середнє разом), <code>teeing</code> (Java 12: два колектори з об'єднанням результатів), <code>collectingAndThen(toList(), Collections::unmodifiableList)</code> для постобробки результату.`,
      String.raw`<code>flatMap</code> розгортає вкладені структури: якщо кожен елемент породжує потік, flatMap «розплющує» їх в один. Приклад: <code>orders.stream().flatMap(o -&gt; o.items().stream())</code> дає всі позиції всіх замовлень; <code>Arrays.stream(text.split(" "))</code> розбиває рядки на слова. Різниця з <code>map</code>: map дає потік потоків, а flatMap — потік елементів, і саме його потрібно, коли вкладеність зайва.`,
      String.raw`Інші операції: <code>reduce</code> для складних підсумків, <code>mapMulti</code> (Java 16) для нерегулярного розгортання, <code>takeWhile</code> і <code>dropWhile</code> (Java 9) для впорядкованих даних, <code>Stream.iterate</code> і <code>Stream.generate</code> для нескінченних потоків разом із <code>limit</code>. Пам'ятайте, що нескінченний потік без <code>limit</code> чи короткого замикання зависне й спожиє всю пам'ять.`,
      String.raw`Паралельні потоки (<code>parallelStream()</code>, <code>parallel()</code>) діляють роботу між ядрами, але підходять лише для великих даних із незалежними операціями без побічних ефектів. Для малих колекцій вони повільніші через накладні витрати. Не змінюйте спільний стан у лямбдах паралельного потоку. Перш ніж вмикати паралелізм, виміряйте результат: це не безкоштовне прискорення, а інструмент для окремих випадків. Для більшості щоденних задач вистачає звичайного послідовного потоку, а читабельний код цінніший за мікровиграш у швидкодії.`,
    ],
    code: [
      String.raw`import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Main {
    record User(int id, String name) { }

    public static void main(String[] args) {
        List<String> names = List.of("Ira", "Oleh", "Anna");
        System.out.println(names.stream().collect(Collectors.joining(", ", "[", "]")));
        List<User> users = List.of(new User(1, "Ira"), new User(2, "Oleh"));
        System.out.println(users.stream().collect(Collectors.toMap(User::id, Function.identity())));
    }
}`,
      String.raw`import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class Main {
    record Person(String name, String city, int age) { }

    public static void main(String[] args) {
        List<Person> people = List.of(new Person("Ira", "Kyiv", 30), new Person("Oleh", "Lviv", 25),
            new Person("Anna", "Kyiv", 22), new Person("Taras", "Lviv", 30));
        Map<String, List<String>> names = people.stream().collect(Collectors.groupingBy(Person::city, TreeMap::new,
            Collectors.mapping(Person::name, Collectors.toList())));
        Map<String, Long> counts = people.stream().collect(Collectors.groupingBy(Person::city, TreeMap::new,
            Collectors.counting()));
        Map<String, Double> averages = people.stream().collect(Collectors.groupingBy(Person::city, TreeMap::new,
            Collectors.averagingInt(Person::age)));
        System.out.println(names);
        System.out.println(counts);
        System.out.println(averages);
    }
}`,
      String.raw`import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5, 6, 7);
        System.out.println(nums.stream().collect(Collectors.partitioningBy(n -> n % 2 == 0)));
        System.out.println(nums.stream().collect(Collectors.summarizingInt(Integer::intValue)));
    }
}`,
      String.raw`import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> lines = List.of("java is fun", "streams are fun");
        List<String> words = lines.stream()
            .flatMap(line -> Arrays.stream(line.split(" ")))     // потік потоків розплющується
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        System.out.println(words);
    }
}`,
      String.raw`// аварія: toMap без об'єднувача кидає IllegalStateException при дубльованому ключі
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> words = List.of("apple", "avocado", "banana");
        System.out.println(words.stream().collect(Collectors.toMap(w -> w.charAt(0), w -> w, (a, b) -> a)));
        System.out.println(words.stream().collect(Collectors.toMap(w -> w.charAt(0), w -> w)));
    }
}`,
    ],
    note: String.raw`<code>groupingBy</code> із низхідним колектором (<code>counting</code>, <code>mapping</code>) замінює ручні цикли з мапами. <code>toMap</code> падає на дублікатах ключів без об'єднувача, а <code>flatMap</code> розплющує вкладені потоки в один.`,
    work: String.raw`Групування й агрегація даних — основа звітів: кількість замовлень за статусом, сума продажів за містом, топ товарів. Колектори роблять такі запити короткими й зрозумілими, а знання їх обмежень (дублікати в toMap, порожні групи, пам'ять) запобігає типовим помилкам у продакшн-звітах.`,
    tasks: [
      String.raw`Чим <code>map</code> відрізняється від <code>flatMap</code> у потоці?`,
      String.raw`Як згрупувати слова за довжиною і порахувати кількість у кожній групі?`,
    ],
  },
  {
    t: "Регулярні вирази",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: String.raw`Регулярний вираз — це шаблон для пошуку в тексті, як маска для фарбування: вона описує форму шуканого, а не конкретні слова, і все, що підходить під форму, знаходиться.`,
    p: [
      String.raw`Регулярні вирази (regex) описують набори рядків: <code>\d+</code> — одна й більше цифр, <code>[a-z]+</code> — малі літери, <code>\s*</code> — пробіли. У Java вони живуть у пакеті <code>java.util.regex</code> (<code>Pattern</code>, <code>Matcher</code>), а також доступні через методи <code>String</code>: <code>matches</code>, <code>split</code>, <code>replaceAll</code>, <code>replaceFirst</code>. У рядкових літералах Java зворотну скісну подвоюють: шаблон <code>\d+</code> записується як <code>"\\d+"</code>.`,
      String.raw`Базові конструкції: клас символів <code>[abc]</code>, діапазон <code>[a-z0-9]</code>, заперечення <code>[^0-9]</code>, скорочення <code>\d</code> (цифра), <code>\w</code> (буква, цифра чи підкреслення), <code>\s</code> (пробіл), крапка (будь-який символ, крім переносу), якорі <code>^</code> і <code>$</code>, межа слова <code>\b</code>. Квантори: <code>*</code> (нуль і більше), <code>+</code> (один і більше), <code>?</code> (нуль або один), <code>{n}</code>, <code>{n,m}</code>. Альтернатива <code>a|b</code> та групи у круглих дужках.`,
      String.raw`Метод <code>String.matches(regex)</code> перевіряє, чи весь рядок відповідає шаблону. Для часткового пошуку й вилучення використовують <code>Pattern.compile(regex)</code> та <code>Matcher</code>: <code>find()</code> шукає наступний збіг, <code>group()</code> повертає знайдений текст, <code>start()</code> та <code>end()</code> дають позиції, <code>matches()</code> — повний збіг, <code>lookingAt()</code> — збіг із початку. Компіляція шаблону дорога: зберігайте <code>Pattern</code> у статичній константі й використовуйте повторно.`,
      String.raw`Групи захоплення: шаблон <code>(\d{4})-(\d{2})-(\d{2})</code> дає групи 1, 2, 3 — рік, місяць, день, які читають через <code>m.group(1)</code>. Іменовані групи (<code>(?&lt;year&gt;\d{4})</code>) і <code>m.group("year")</code> читаються краще. Група без захоплення <code>(?:...)</code> лише групує. У заміні посилаються на групи через долар і номер: <code>replaceAll("(\\w+)@(\\w+)", "$2 at $1")</code> міняє частини місцями.`,
      String.raw`Жадібність: квантори за замовчуванням жадібні й беруть якомога більше: шаблон <code>&lt;.+&gt;</code> на рядку <code>&lt;a&gt;&lt;b&gt;</code> захоплює все. Лінивий варіант <code>&lt;.+?&gt;</code> бере якомога менше, а присвійний <code>++</code> не повертає символи. Класична помилка новачка — жадібність, що «з'їдає» більше потрібного, і лікується вона саме ледачим квантором чи точнішим класом символів.`,
      String.raw`Небезпеки: «катастрофічне повернення» (catastrophic backtracking) — вираз на кшталт <code>(a+)+b</code> на довгому рядку без літери b може працювати експоненційно довго й завішувати сервіс (так звана ReDoS-атака). Не пишіть вкладені квантори без потреби, обмежуйте довжину вхідних даних і не приймайте регулярні вирази від користувача. Також regex не підходить для розбору вкладених структур (HTML, JSON): для них беруть парсери.`,
      String.raw`Корисні прапорці: <code>Pattern.CASE_INSENSITIVE</code>, <code>MULTILINE</code>, <code>DOTALL</code>, <code>UNICODE_CASE</code>; вбудований запис <code>(?i)</code>. Для читабельності розбивайте складний вираз на частини з коментарями й тестуйте на прикладах (валідних і невалідних). Якщо вираз довший за рядок і ви його не розумієте, розгляньте простіший спосіб: <code>split</code>, <code>indexOf</code> чи власний розбір.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println("12345".matches("\\d+"));
        System.out.println("12a45".matches("\\d+"));
        System.out.println("card 1234 5678".replaceAll("\\d", "*"));
        System.out.println(java.util.Arrays.toString("a1b22c333".split("\\d+")));
    }
}`,
      String.raw`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    private static final Pattern PRICE = Pattern.compile("(\\w+): (\\d+)");

    public static void main(String[] args) {
        Matcher m = PRICE.matcher("pen: 5, ink: 12, book: 40");
        int total = 0;
        while (m.find()) {
            System.out.println(m.group(1) + " costs " + m.group(2));
            total += Integer.parseInt(m.group(2));
        }
        System.out.println(total);
    }
}`,
      String.raw`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    public static void main(String[] args) {
        Pattern p = Pattern.compile("(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})");
        Matcher m = p.matcher("Released on 2026-11-20.");
        if (m.find()) {
            System.out.println(m.group("year") + " / " + m.group("month") + " / " + m.group("day"));
        }
        System.out.println("a@b.com x@y.org".replaceAll("(\\w+)@(\\w+)", "$2 at $1"));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String html = "<b>bold</b> and <i>italic</i>";
        System.out.println(html.replaceAll("<.+>", "#"));      // жадібно: з'їдає все від першого < до останнього >
        System.out.println(html.replaceAll("<.+?>", "#"));     // лінивий квантор: кожен тег окремо
    }
}`,
      String.raw`// аварія: у шаблоні не закрито дужку, PatternSyntaxException
import java.util.regex.Pattern;

public class Main {
    public static void main(String[] args) {
        System.out.println(Pattern.compile("\\d+").matcher("42").matches());
        Pattern.compile("(\\d+");
    }
}`,
    ],
    note: String.raw`У Java зворотну скісну в шаблоні подвоюють: <code>"\\d+"</code>. <code>matches</code> перевіряє весь рядок, а для пошуку потрібні <code>Matcher.find</code> і групи. Квантори жадібні за замовчуванням, а вкладені квантори небезпечні катастрофічним поверненням.`,
    work: String.raw`Регулярні вирази перевіряють формати (пошта, телефон, номер), чистять і витягують дані з тексту, розбирають журнали. Водночас вони часто є джерелом уразливостей і важко читаються, тому в командах діє правило: простий regex із тестами або парсер для складних форматів.`,
    tasks: [
      String.raw`Чим <code>matches</code> відрізняється від <code>find</code>?`,
      String.raw`Що таке жадібний квантор і як зробити його лінивим?`,
    ],
  },
  {
    t: "JSON вручну: побудова й екранування",
    ch: "Стандартна бібліотека",
    easy: String.raw`JSON — це зручна транспортна коробка для даних: усе всередині має лежати в чітких лапках і дужках. Якщо в тексті є лапка чи перенос рядка, її треба «загорнути» (екранувати), інакше коробка розірветься.`,
    p: [
      String.raw`JSON (JavaScript Object Notation) — текстовий формат обміну даними: об'єкти <code>{"name": "Ira", "age": 30}</code>, масиви <code>[1, 2, 3]</code>, рядки в подвійних лапках, числа та літерали <code>true</code>, <code>false</code>, <code>null</code>. Це мова більшості веб-API. У Java зазвичай користуються бібліотеками (Jackson, Gson), але розуміння формату й ручна побудова корисні і для тестів, і для розуміння того, що роблять бібліотеки під капотом.`,
      String.raw`Правила формату: ключі — завжди рядки в подвійних лапках; одинарні лапки не допускаються; після останнього елемента коми бути не може; коментарів немає; числа без провідних нулів і без <code>NaN</code> чи <code>Infinity</code>. Порядок ключів не гарантований, а текст кодується в UTF-8. Пробіли між елементами необов'язкові: вони лише полегшують читання людиною.`,
      String.raw`Екранування в рядках: лапка <code>"</code> стає <code>\"</code>, зворотна скісна <code>\</code> — <code>\\</code>, перенос рядка — <code>\n</code>, табуляція — <code>\t</code>, повернення каретки — <code>\r</code>, а керівні символи з кодом менше 32 — <code>\u00XX</code>. Забути екранування — класична причина зламаного JSON і вразливостей (ін'єкція у JSON). Ніколи не будуйте JSON простою склейкою користувацьких рядків без екранування.`,
      String.raw`Функція екранування: пройти по символах і для кожного спеціального вивести відповідну послідовність. Це добре робить <code>StringBuilder</code> та <code>switch</code> за символом. Варто винести її в окремий метод <code>escape(String)</code> і написати для нього тести з лапками, зворотними скісними й переносами. Українські літери в UTF-8 екранувати не обов'язково: їх можна записувати як є, якщо канал передачі підтримує UTF-8.`,
      String.raw`Побудова структури: об'єкт — це пари <code>"ключ": значення</code> через коми у фігурних дужках, масив — значення через коми у квадратних. Прості типи: рядок (з екрануванням), число (<code>String.valueOf</code>), булеве, <code>null</code>. Вкладеність вирішується рекурсією: метод <code>toJson(Object)</code> перевіряє тип (<code>Map</code>, <code>List</code>, <code>String</code>, <code>Number</code>, <code>Boolean</code>, <code>null</code>) і діє відповідно. Саме так працює простий серіалізатор, і switch з образцями тут дуже доречний.`,
      String.raw`Для читабельності є «гарний» вивід із відступами й переносами (pretty print), а для передачі — компактний. Порядок ключів для стабільних тестів фіксують: <code>TreeMap</code> чи <code>LinkedHashMap</code>. Числа типу <code>double</code> виводяться за правилами Java (запис <code>1.0E10</code> теж коректне JSON-число); для грошей і великих цілих краще передавати рядки або <code>BigDecimal</code>, щоб не втрачати точність у клієнтів.`,
      String.raw`Безпека й обмеження: ручне формування JSON придатне для простих випадків і тестів, а у виробничому коді відповідальність за правильність екранування, Unicode й порядок краще передати перевіреній бібліотеці. Проте знати формат і вміти написати мінімальний серіалізатор корисно: це ілюструє рекурсію, StringBuilder і роботу з типами в одному невеликому завданні, а ще допомагає читати чужі відповіді API без страху.`,
    ],
    code: [
      String.raw`public class Main {
    static String escape(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\t' -> sb.append("\\t");
                case '\r' -> sb.append("\\r");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(escape("say \"hi\"\n"));
        System.out.println(escape("C:\\temp\tfile"));
    }
}`,
      String.raw`public class Main {
    static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    public static void main(String[] args) {
        String name = "Ira \"Z\"";
        String json = "{\"name\": \"" + escape(name) + "\", \"age\": " + 30 + ", \"active\": " + true + "}";
        System.out.println(json);
    }
}`,
      String.raw`import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    static String toJson(Object v) {
        return switch (v) {
            case null -> "null";
            case String s -> "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
            case Number n -> String.valueOf(n);
            case Boolean b -> String.valueOf(b);
            case Map<?, ?> m -> {
                StringBuilder sb = new StringBuilder("{");
                boolean first = true;
                for (Map.Entry<?, ?> e : m.entrySet()) {
                    if (!first) {
                        sb.append(',');
                    }
                    first = false;
                    sb.append(toJson(String.valueOf(e.getKey()))).append(':').append(toJson(e.getValue()));
                }
                yield sb.append('}').toString();
            }
            case List<?> l -> {
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < l.size(); i++) {
                    if (i > 0) {
                        sb.append(',');
                    }
                    sb.append(toJson(l.get(i)));
                }
                yield sb.append(']').toString();
            }
            default -> throw new IllegalArgumentException("unsupported type: " + v.getClass().getName());
        };
    }

    public static void main(String[] args) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", "Ira");
        data.put("tags", List.of("a", "b"));
        data.put("active", true);
        data.put("note", null);
        System.out.println(toJson(data));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String compact = "{\"a\":[1,2],\"b\":{\"c\":true}}";
        StringBuilder pretty = new StringBuilder();
        int depth = 0;
        for (char c : compact.toCharArray()) {
            switch (c) {
                case '{', '[' -> {
                    pretty.append(c).append('\n');
                    depth++;
                    pretty.append("  ".repeat(depth));
                }
                case '}', ']' -> {
                    pretty.append('\n');
                    depth--;
                    pretty.append("  ".repeat(depth)).append(c);
                }
                case ',' -> pretty.append(",\n").append("  ".repeat(depth));
                default -> pretty.append(c);
            }
        }
        System.out.println(pretty);
    }
}`,
      String.raw`// аварія: серіалізатор не знає тип Object і кидає IllegalArgumentException
import java.util.List;

public class Main {
    static String toJson(Object v) {
        return switch (v) {
            case String s -> "\"" + s + "\"";
            case Number n -> String.valueOf(n);
            case List<?> l -> "[" + l.size() + " items]";
            default -> throw new IllegalArgumentException("unsupported type: " + v.getClass().getName());
        };
    }

    public static void main(String[] args) {
        System.out.println(toJson("ok"));
        System.out.println(toJson(new Object()));
    }
}`,
    ],
    note: String.raw`У JSON ключі й рядки завжди в подвійних лапках, останньої коми немає, а спеціальні символи (<code>"</code>, <code>\</code>, переноси) треба екранувати. Не склеюйте JSON із користувацьких рядків без екранування: це джерело поламок і вразливостей.`,
    work: String.raw`Навіть коли JSON створюють бібліотеки, інженери постійно дивляться на сирі відповіді API, пишуть тестові фікстури й шукають помилки формату. Розуміння правил екранування допомагає знаходити причини зламаних відповідей, а мінімальний серіалізатор — зрозуміти, що саме робить Jackson під капотом.`,
    tasks: [
      String.raw`Які символи в JSON-рядку обов'язково екранують і чому?`,
      String.raw`Чому небезпечно будувати JSON простою склейкою з користувацьких рядків?`,
    ],
  },
  {
    t: "JSON вручну: розбір рекурсивним спуском",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: String.raw`Рекурсивний спуск — це читання тексту з олівцем: дивитесь на поточний символ, вирішуєте, що це (об'єкт, масив, число), і розбираєте частину, викликаючи той самий метод для вкладеного.`,
    p: [
      String.raw`Розбір JSON — це перетворення тексту на структури: <code>Map&lt;String, Object&gt;</code>, <code>List&lt;Object&gt;</code>, <code>String</code>, <code>Long</code> чи <code>Double</code>, <code>Boolean</code>, <code>null</code>. Рекурсивний спуск (recursive descent) — найпростіший метод: для кожної граматичної конструкції пишуть окремий метод (<code>parseValue</code>, <code>parseObject</code>, <code>parseArray</code>, <code>parseString</code>, <code>parseNumber</code>), і вони викликають один одного за потреби.`,
      String.raw`Основа парсера — позиція в тексті (<code>pos</code>) і кілька допоміжних методів: <code>peek()</code> (поточний символ), <code>skipWhitespace()</code> (пропустити пробіли), <code>expect(char)</code> (перевірити й з'їсти очікуваний символ, інакше кинути помилку з позицією). Така дисципліна дає зрозумілі повідомлення про помилки й робить код передбачуваним: кожен метод залишає позицію одразу після того, що розібрав.`,
      String.raw`Метод <code>parseValue</code> дивиться на перший значущий символ: фігурна дужка означає об'єкт, квадратна — масив, подвійна лапка — рядок, літери <code>t</code>, <code>f</code>, <code>n</code> — літерали true, false, null, цифра або мінус — число. Усе інше — синтаксична помилка. Саме тут видно, чому граматика JSON зручна для розбору: перший символ однозначно визначає тип значення, і вгадувати нічого не потрібно.`,
      String.raw`Метод <code>parseObject</code>: з'їсти <code>{</code>; якщо далі <code>}</code> — це порожній об'єкт; інакше цикл: прочитати ключ-рядок, двокрапку, значення (рекурсивний виклик!), а потім кому (продовжити) або <code>}</code> (завершити). Метод <code>parseArray</code> працює аналогічно з квадратними дужками. Вкладеність вирішується автоматично завдяки рекурсії: стек викликів дзеркалить структуру документа, і ніяких явних стеків не потрібно.`,
      String.raw`Метод <code>parseString</code> читає до закривальної лапки, обробляючи екранування: <code>\"</code>, <code>\\</code>, <code>\n</code>, <code>\t</code>, <code>\uXXXX</code>. Число збирають із символів цифр, знака, крапки та експоненти й перетворюють через <code>Double.parseDouble</code> (чи <code>Long.parseLong</code>, якщо крапки немає). Після розбору всього значення перевіряють, що далі лише пробіли: «сміття» наприкінці документа — це помилка.`,
      String.raw`Обробка помилок: кидайте власний виняток із позицією (повідомлення на кшталт «unexpected character at 17»). Не покладайтеся на <code>StackOverflowError</code> для глибоко вкладених документів: ставте обмеження глибини. Також захищайтеся від дуже великих вхідних даних: у виробничому коді розбір недовірених JSON-документів має мати обмеження на розмір і вкладеність, інакше один запит може вичерпати пам'ять.`,
      String.raw`Висновок: така реалізація навчальна й не замінює Jackson чи Gson, які швидші, підтримують відображення на класи, потокове читання й безліч крайніх випадків. Проте техніка рекурсивного спуску універсальна: нею розбирають арифметичні вирази, конфігурації, SQL, мови розмітки. Розуміючи її, ви легко прочитаєте будь-який простий парсер і напишете власний, коли готової бібліотеки немає. Закріпіть розуміння, дописавши парсер для власного простого формату, наприклад рядків ключ=значення з вкладеними секціями.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Object v = JsonParser.parse("{\"a\":[1,2,{\"b\":true}],\"s\":\"x\"}");
        System.out.println(v);
    }
}

class JsonParser {
    private final String text;
    private int pos;

    private JsonParser(String text) {
        this.text = text;
    }

    static Object parse(String text) {
        JsonParser p = new JsonParser(text);
        Object value = p.parseValue();
        p.skipWs();
        if (p.pos != text.length()) {
            throw p.error("unexpected trailing data");
        }
        return value;
    }

    private IllegalArgumentException error(String message) {
        return new IllegalArgumentException(message + " at " + pos);
    }

    private char peek() {
        return pos < text.length() ? text.charAt(pos) : '\0';
    }

    private void skipWs() {
        while (pos < text.length() && Character.isWhitespace(text.charAt(pos))) {
            pos++;
        }
    }

    private void expect(char c) {
        skipWs();
        if (peek() != c) {
            throw error("expected '" + c + "'");
        }
        pos++;
    }

    private Object parseValue() {
        skipWs();
        char c = peek();
        return switch (c) {
            case '{' -> parseObject();
            case '[' -> parseArray();
            case '"' -> parseString();
            case 't', 'f', 'n' -> parseLiteral();
            default -> {
                if (c == '-' || Character.isDigit(c)) {
                    yield parseNumber();
                }
                throw error("unexpected character '" + c + "'");
            }
        };
    }

    private Map<String, Object> parseObject() {
        Map<String, Object> map = new LinkedHashMap<>();
        expect('{');
        skipWs();
        if (peek() == '}') {
            pos++;
            return map;
        }
        while (true) {
            skipWs();
            String key = parseString();
            expect(':');
            map.put(key, parseValue());
            skipWs();
            if (peek() == ',') {
                pos++;
                continue;
            }
            expect('}');
            return map;
        }
    }

    private List<Object> parseArray() {
        List<Object> list = new ArrayList<>();
        expect('[');
        skipWs();
        if (peek() == ']') {
            pos++;
            return list;
        }
        while (true) {
            list.add(parseValue());
            skipWs();
            if (peek() == ',') {
                pos++;
                continue;
            }
            expect(']');
            return list;
        }
    }

    private String parseString() {
        expect('"');
        StringBuilder sb = new StringBuilder();
        while (pos < text.length()) {
            char c = text.charAt(pos++);
            if (c == '"') {
                return sb.toString();
            }
            if (c == '\\') {
                char e = text.charAt(pos++);
                switch (e) {
                    case 'n' -> sb.append('\n');
                    case 't' -> sb.append('\t');
                    default -> sb.append(e);
                }
            } else {
                sb.append(c);
            }
        }
        throw error("unterminated string");
    }

    private Object parseNumber() {
        int start = pos;
        while (pos < text.length() && "+-.eE0123456789".indexOf(text.charAt(pos)) >= 0) {
            pos++;
        }
        String number = text.substring(start, pos);
        return number.contains(".") || number.contains("e") || number.contains("E")
            ? (Object) Double.parseDouble(number) : (Object) Long.parseLong(number);
    }

    private Object parseLiteral() {
        if (text.startsWith("true", pos)) {
            pos += 4;
            return true;
        }
        if (text.startsWith("false", pos)) {
            pos += 5;
            return false;
        }
        if (text.startsWith("null", pos)) {
            pos += 4;
            return null;
        }
        throw error("unknown literal");
    }
}`,
      String.raw`public class Main {
    static int pos;

    // розбір вкладених масивів чисел рекурсивним спуском: повертає суму всіх чисел
    static int sumArray(String s) {
        pos++;                                       // пропускаємо '['
        int sum = 0;
        while (s.charAt(pos) != ']') {
            char c = s.charAt(pos);
            if (c == '[') {
                sum += sumArray(s);                  // вкладений масив: той самий метод
            } else if (c == ',') {
                pos++;
            } else {
                int start = pos;
                while (Character.isDigit(s.charAt(pos))) {
                    pos++;
                }
                sum += Integer.parseInt(s.substring(start, pos));
            }
        }
        pos++;                                       // пропускаємо ']'
        return sum;
    }

    public static void main(String[] args) {
        pos = 0;
        System.out.println(sumArray("[1,[2,3],[4,[5]]]"));       // 15
    }
}`,
      String.raw`public class Main {
    static int depthOf(String json) {
        int depth = 0;
        int max = 0;
        for (char c : json.toCharArray()) {
            if (c == '{' || c == '[') {
                depth++;
                max = Math.max(max, depth);
            } else if (c == '}' || c == ']') {
                depth--;
            }
        }
        return max;
    }

    public static void main(String[] args) {
        System.out.println(depthOf("{\"a\":[1,{\"b\":[2]}]}"));      // 4
        System.out.println(depthOf("[]"));
        System.out.println(depthOf("{\"a\":1}"));
    }
}`,
      String.raw`// аварія: замість числа в масиві стоїть літера x, розбір числа кидає NumberFormatException
public class Main {
    static int pos;

    static int sumArray(String s) {
        pos++;
        int sum = 0;
        while (s.charAt(pos) != ']') {
            char c = s.charAt(pos);
            if (c == ',') {
                pos++;
            } else {
                int start = pos;
                while (Character.isDigit(s.charAt(pos))) {
                    pos++;
                }
                sum += Integer.parseInt(s.substring(start, pos));
            }
        }
        pos++;
        return sum;
    }

    public static void main(String[] args) {
        pos = 0;
        System.out.println(sumArray("[1,2]"));
        pos = 0;
        System.out.println(sumArray("[1,x]"));
    }
}`,
    ],
    note: String.raw`Рекурсивний спуск: один метод на кожну конструкцію, а вкладеність вирішує рекурсія. Перший значущий символ визначає тип значення, а помилки повідомляють позицію. Для виробничого коду краще брати перевірену бібліотеку.`,
    work: String.raw`Писати парсери рекурсивним спуском доводиться для невеликих мов і форматів: конфігурації, прості шаблони, вирази фільтрів. Розуміння цієї техніки допомагає й у роботі з готовими бібліотеками: ви знаєте, звідки беруться повідомлення про помилки й чому глибоке вкладення може бути проблемою.`,
    tasks: [
      String.raw`Чому перший символ значення однозначно визначає його тип у JSON?`,
      String.raw`Як рекурсія допомагає розібрати вкладені масиви й об'єкти?`,
    ],
  },
  {
    t: "Файли: Path і Files",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: String.raw`Path — це адреса файла на карті диска, а Files — кур'єр, що вміє принести, віднести й перевірити. Спершу ви записуєте адресу, потім просите кур'єра щось зробити за нею.`,
    p: [
      String.raw`Сучасне API файлів міститься в пакеті <code>java.nio.file</code>: <code>Path</code> описує шлях, а <code>Files</code> виконує операції. Створення шляху: <code>Path.of("data", "file.txt")</code> (Java 11) або <code>Paths.get(...)</code>. Методи шляху: <code>getFileName()</code>, <code>getParent()</code>, <code>resolve("x")</code> (приєднати), <code>resolveSibling</code>, <code>relativize</code>, <code>normalize()</code>, <code>toAbsolutePath()</code>, <code>startsWith</code>. Path нічого не робить із диском: файла може й не існувати.`,
      String.raw`Читання: <code>Files.readString(path)</code> (весь файл як рядок, Java 11), <code>Files.readAllLines(path)</code> (список рядків), <code>Files.lines(path)</code> (потік рядків, який треба закривати через try-with-resources), <code>Files.readAllBytes</code>, <code>Files.newBufferedReader</code>. Для великих файлів беріть потокове читання, а не повне завантаження в пам'ять. Кодування за замовчуванням — UTF-8, і краще вказувати його явно.`,
      String.raw`Запис: <code>Files.writeString(path, text)</code>, <code>Files.write(path, lines)</code>, <code>Files.newBufferedWriter</code>. Параметри <code>StandardOpenOption.APPEND</code>, <code>CREATE</code>, <code>TRUNCATE_EXISTING</code> керують поведінкою: за замовчуванням файл створюється й перезаписується. Для дописування додайте <code>APPEND</code>. Надійний запис: спершу у тимчасовий файл, потім <code>Files.move(tmp, target, REPLACE_EXISTING, ATOMIC_MOVE)</code>, щоб читачі ніколи не бачили напівзаписаний файл.`,
      String.raw`Операції з файлами й каталогами: <code>exists</code>, <code>isDirectory</code>, <code>size</code>, <code>createDirectories</code>, <code>copy</code>, <code>move</code>, <code>delete</code>, <code>deleteIfExists</code>, <code>createTempFile</code>, <code>createTempDirectory</code>. Обхід: <code>Files.list(dir)</code> (один рівень), <code>Files.walk(dir)</code> (рекурсивно), <code>Files.find</code>. Потоки обходу тримають дескриптор каталогу відкритим, тому їх закривають так само, як і потоки рядків.`,
      String.raw`Винятки: майже всі методи кидають перевірюваний <code>IOException</code> (його підтипи <code>NoSuchFileException</code>, <code>AccessDeniedException</code>, <code>FileAlreadyExistsException</code>). Їх обробляють по-різному залежно від причини: відсутній файл — повідомити користувачеві чи створити, відмова в доступі — звернутися до адміністратора. Не ковтайте їх мовчки, а логуйте разом зі шляхом, щоб причину можна було знайти.`,
      String.raw`Безпека шляхів: ніколи не склеюйте шлях із користувацьких рядків без перевірки: значення <code>../../etc/passwd</code> дозволяє вийти за межі каталогу (path traversal). Нормалізуйте шлях і перевіряйте, що <code>base.resolve(name).normalize().startsWith(base)</code>. Також уникайте жорстко зашитих абсолютних шляхів: беріть їх із конфігурації. Роздільники операційної системи Path обробляє самостійно.`,
      String.raw`У тестах використовуйте тимчасові каталоги (<code>Files.createTempDirectory</code>), які прибирають за собою. У нашому навчальному середовищі запис на диск може бути недоступним, тому завдання зосереджені на операціях над шляхами, а приклади працюють із тимчасовими файлами. Старе API <code>java.io.File</code> залишається в багатьох проєктах, але <code>Path</code> і <code>Files</code> надійніші й зручніші. Тому в новому коді віддавайте перевагу саме їм, а старе API залишайте лише там, де його вимагають бібліотеки.`,
    ],
    code: [
      String.raw`import java.nio.file.Path;

public class Main {
    public static void main(String[] args) {
        Path base = Path.of("/data", "app");
        Path log = base.resolve("logs").resolve("app.log");
        System.out.println(log);
        System.out.println(log.getFileName() + " " + log.getParent());
        System.out.println(base.relativize(log));
        System.out.println(Path.of("/data/app/../app/x").normalize());
    }
}`,
      String.raw`import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("demo", ".txt");
        Files.writeString(file, "line one\nline two\n");
        System.out.println(Files.readString(file).length());
        System.out.println(Files.readAllLines(file));
        System.out.println(Files.size(file));
        Files.delete(file);
        System.out.println(Files.exists(file));
    }
}`,
      String.raw`import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("log", ".txt");
        Files.writeString(file, "a\n");
        Files.writeString(file, "b\n", StandardOpenOption.APPEND);
        try (Stream<String> lines = Files.lines(file)) {          // потік треба закрити
            System.out.println(lines.map(String::toUpperCase).toList());
        }
        Files.deleteIfExists(file);
    }
}`,
      String.raw`import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("tree");
        Files.createDirectories(dir.resolve("sub"));
        Files.writeString(dir.resolve("a.txt"), "1");
        Files.writeString(dir.resolve("sub").resolve("b.txt"), "22");
        try (Stream<Path> walk = Files.walk(dir)) {
            System.out.println(walk.filter(Files::isRegularFile).count());
        }
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(java.util.Comparator.reverseOrder()).forEach(p -> p.toFile().delete());
        }
        System.out.println(Files.exists(dir));
    }
}`,
      String.raw`// аварія: файла не існує, readString кидає NoSuchFileException
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws IOException {
        Path missing = Path.of("definitely-missing-file.txt");
        System.out.println(Files.exists(missing));
        System.out.println(Files.readString(missing));
    }
}`,
    ],
    note: String.raw`<code>Path</code> лише описує шлях, а операції виконує <code>Files</code>. Потоки <code>Files.lines</code> і <code>Files.walk</code> закривайте, а шляхи з користувацьких даних нормалізуйте й перевіряйте на вихід за межі каталогу.`,
    work: String.raw`Читання конфігурацій, імпорт і експорт даних, журнали, тимчасові файли й резервні копії — типові операції з файлами. Помилки трапляються в кодуванні, у забутих закриттях потоків і в небезпечному склеюванні шляхів, тому на рев'ю до таких місць ставляться особливо уважно.`,
    tasks: [
      String.raw`Чим <code>Path</code> відрізняється від <code>Files</code>?`,
      String.raw`Як перевірити, що шлях із користувацького імені не виходить за межі базового каталогу?`,
    ],
  },
  {
    t: "Unicode, кодування і Locale",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: String.raw`Кодування — це шифр, за яким текст перетворюється на байти: якщо відправник і одержувач користуються різними шифрами, замість «привіт» виходять ієрогліфи. Unicode — єдина таблиця всіх символів світу, а Locale підказує, як писати дати й числа в конкретній країні.`,
    p: [
      String.raw`Unicode присвоює кожному символу число (code point): літера A — U+0041, українська «ї» — U+0457, емодзі-усмішка — U+1F600. Кодування перетворюють code point на байти: UTF-8 (від одного до чотирьох байтів, сумісне з ASCII), UTF-16 (два або чотири байти), UTF-32. Java зберігає <code>String</code> як UTF-16, а файли й мережа майже завжди використовують UTF-8.`,
      String.raw`Тип <code>char</code> — це 16-бітна одиниця UTF-16, а не символ. Символи за межами базової площини (емодзі, рідкісні ієрогліфи) займають два <code>char</code> (сурогатну пару). Тому довжина рядка з одного емодзі дорівнює 2, а <code>charAt</code> може повернути половину символу. Для коректної роботи є <code>codePointAt</code>, <code>codePointCount</code>, <code>codePoints()</code>, <code>Character.charCount</code> та <code>appendCodePoint</code> у StringBuilder.`,
      String.raw`Перетворення рядків у байти й назад завжди з явним кодуванням: <code>text.getBytes(StandardCharsets.UTF_8)</code> і <code>new String(bytes, StandardCharsets.UTF_8)</code>. Виклик без кодування використовує кодування за замовчуванням (UTF-8 з Java 18), але покладатися на нього в старих системах небезпечно. Довжина в байтах і довжина в символах — різні речі: слово «їжак» має 4 символи, а в UTF-8 займає 8 байтів.`,
      String.raw`Помилки кодування: якщо прочитати байти UTF-8 як ISO-8859-1, виходить «mojibake» (нечитабельні послідовності замість літер). Невалідні послідовності байтів замінюються символом заміни U+FFFD. Коли у виводі з'являється знак питання, це кодування консолі, яке не підтримує символ: тому в наших завданнях вивід лише ASCII. Надійний підхід — завжди вказувати UTF-8 при читанні й записі та налаштувати термінал.`,
      String.raw`Нормалізація: один і той самий видимий символ може мати різні подання (літера «é» як один code point чи як «e» з комбінованим акцентом). Для порівняння й пошуку нормалізують: <code>Normalizer.normalize(s, Normalizer.Form.NFC)</code>. Регістр: <code>toUpperCase()</code> залежить від локалі (турецька літера i), тому для технічних рядків беруть <code>toUpperCase(Locale.ROOT)</code>. Порівняння без урахування регістру — <code>equalsIgnoreCase</code> або <code>Collator</code> для людського порядку.`,
      String.raw`<code>Locale</code> описує мовні й регіональні правила: <code>Locale.US</code>, <code>Locale.of("uk", "UA")</code> (Java 19), <code>Locale.forLanguageTag("uk-UA")</code>. Від неї залежать формат чисел (<code>1,234.56</code> чи <code>1.234,56</code>), дат і валюти, порядок сортування, регістр. Класи <code>NumberFormat</code>, <code>DecimalFormat</code>, <code>DateTimeFormatter</code> та <code>String.format(Locale, ...)</code> приймають локаль. Коли формат важливий для машин (файли, API), використовують <code>Locale.ROOT</code> чи <code>Locale.US</code>.`,
      String.raw`Практичні правила: усюди явно вказуйте UTF-8; не рахуйте символи через <code>length()</code>, якщо можливі емодзі чи комбіновані символи; технічні рядки обробляйте з <code>Locale.ROOT</code>, а тексти для користувача — з його локаллю; тестуйте на нетривіальних даних (кирилиця, емодзі, апострофи). Ці дрібниці вирішують, чи програма коректно працює для користувачів усього світу.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        String word = "\u0457\u0436\u0430\u043a";            // чотири символи кирилицею
        String emoji = "\uD83D\uDE00";                        // один символ, дві одиниці UTF-16
        System.out.println(word.length());
        System.out.println(emoji.length() + " " + emoji.codePointCount(0, emoji.length()));
        System.out.println(emoji.codePointAt(0));
    }
}`,
      String.raw`import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        String word = "\u0457\u0436\u0430\u043a";
        byte[] bytes = word.getBytes(StandardCharsets.UTF_8);
        System.out.println(bytes.length);                      // 8 байтів на 4 символи
        String back = new String(bytes, StandardCharsets.UTF_8);
        System.out.println(back.equals(word));
        String wrong = new String(bytes, StandardCharsets.ISO_8859_1);
        System.out.println(wrong.length() + " " + wrong.equals(word));
    }
}`,
      String.raw`import java.text.Normalizer;

public class Main {
    public static void main(String[] args) {
        String composed = "\u00e9";                  // один code point
        String decomposed = "e\u0301";               // літера e плюс комбінований акцент
        System.out.println(composed.equals(decomposed));
        String a = Normalizer.normalize(composed, Normalizer.Form.NFC);
        String b = Normalizer.normalize(decomposed, Normalizer.Form.NFC);
        System.out.println(a.equals(b));
    }
}`,
      String.raw`import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        double value = 1234567.891;
        System.out.println(String.format(Locale.US, "%,.2f", value));
        System.out.println(String.format(Locale.GERMANY, "%,.2f", value));
        System.out.println("title".toUpperCase(Locale.ROOT));
    }
}`,
      String.raw`// аварія: кодування з такою назвою не існує, UnsupportedCharsetException
import java.nio.charset.Charset;

public class Main {
    public static void main(String[] args) {
        System.out.println(Charset.forName("UTF-8").name());
        System.out.println(Charset.forName("no-such-charset"));
    }
}`,
    ],
    note: String.raw`<code>String</code> зберігається в UTF-16, тому символи за межами базової площини (емодзі) займають два <code>char</code>. Кодування вказуйте явно (<code>StandardCharsets.UTF_8</code>), технічні рядки обробляйте з <code>Locale.ROOT</code>, а число байтів і число символів не плутайте.`,
    work: String.raw`Проблеми кодування й локалі дають найдивніші помилки в продакшні: «кракозябри» в іменах, неправильне сортування, збій розбору чисел у користувачів з іншою локаллю, зламані емодзі в довжині поля. Явне UTF-8 та Locale.ROOT для технічних даних — прості правила, що вирішують більшість таких історій.`,
    tasks: [
      String.raw`Чому довжина рядка з одним емодзі дорівнює 2?`,
      String.raw`Чому для технічних рядків краще викликати <code>toUpperCase(Locale.ROOT)</code>?`,
    ],
  },
];
