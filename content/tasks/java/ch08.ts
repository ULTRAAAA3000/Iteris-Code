// Практичні завдання глави «Стандартна бібліотека» (уроки 74–85). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Тут немає читання з диска чи мережі: усі дані вбудовано в код, а дати й випадкові числа детерміновані.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "java-stringbuilder-report", lesson: "java/74", xp: 25,
    title: "StringBuilder і текстовий блок",
    context: "Звіт, що складається в циклі, не варто будувати через +=: кожне додавання копіює весь текст. StringBuilder робить це ефективно, а текстовий блок зручний для вбудованого JSON.",
    brief: [
      "Замініть конкатенацію <code>report +=</code> на <code>StringBuilder</code>: кожен рядок має вигляд <code>Pen x3</code> (ім'я, пробіл, <code>x</code>, кількість).",
      "Потім створіть <code>json</code> як текстовий блок <code>{\"items\": %d}</code> і підставте кількість позицій через <code>formatted(names.length)</code>. Вивід: три рядки позицій, <code>Total: 16</code> і <code>{\"items\": 3}</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        String[] names = {"Pen", "Ink", "Book"};
        int[] qty = {3, 12, 1};
        String report = "";
        int total = 0;
        // TODO: замініть конкатенацію на StringBuilder
        for (int i = 0; i < names.length; i++) {
            report += names[i] + " x" + qty[i] + "\n";
            total += qty[i];
        }
        System.out.print(report);
        System.out.println("Total: " + total);
        // TODO: текстовий блок із JSON {"items": 3}: підставте names.length через formatted
        String json = "";
        System.out.print(json);
    }
}
`,
    checks: [
      { on: "stdout", name: "Звіт і підсумок", has: "Pen x3\nInk x12\nBook x1\nTotal: 16", hint: "Кожен рядок завершується переносом, а підсумок друкується окремо" },
      { on: "stdout", name: "JSON із текстового блоку", has: "Total: 16\n{\"items\": 3}", hint: "formatted(names.length) підставляє число замість %d" },
      { on: "source", name: "Використано StringBuilder", has: "StringBuilder", hint: "StringBuilder sb = new StringBuilder(); sb.append(...)" },
      { on: "source", name: "Використано текстовий блок", has: "\"\"\"", hint: "Потрійні лапки на окремому рядку" },
      { on: "source", name: "Використано formatted", has: ".formatted(", hint: "\"\"\" ... \"\"\".formatted(names.length)" },
    ],
  },
  {
    ...base, id: "java-scanner-parse", lesson: "java/75", xp: 25,
    title: "Scanner: числа, слова й CSV",
    context: "Scanner розбирає текст на токени: числа додають, слова збирають окремо, а для списків через кому змінюють роздільник. Так читають прості конфігурації й введення користувача.",
    brief: [
      "У циклі <code>while (sc.hasNext())</code> додавайте числа до <code>sum</code> (перевірка <code>hasNextInt()</code>), а слова — до списку <code>words</code>.",
      "Для рядка <code>a, b ,c</code> задайте роздільник <code>\\\\s*,\\\\s*</code> через <code>useDelimiter</code>. Очікуваний вивід: <code>Sum: 20</code>, <code>Words: [apples, pears, plums]</code>, <code>Items: [a, b, c]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("3 apples 5 pears 12 plums");
        int sum = 0;
        List<String> words = new ArrayList<>();
        // TODO: while (sc.hasNext()): числа додайте до sum, слова до words
        System.out.println("Sum: " + sum);
        System.out.println("Words: " + words);

        Scanner csv = new Scanner("a, b ,c");     // TODO: useDelimiter("\\s*,\\s*")
        List<String> items = new ArrayList<>();
        while (csv.hasNext()) {
            items.add(csv.next());
        }
        System.out.println("Items: " + items);
    }
}
`,
    checks: [
      { on: "stdout", name: "Сума чисел: «Sum: 20»", has: "Sum: 20", hint: "3 + 5 + 12 = 20" },
      { on: "stdout", name: "Слова: [apples, pears, plums]", has: "Words: [apples, pears, plums]", hint: "Якщо hasNextInt() хибне, беріть next() як слово" },
      { on: "stdout", name: "CSV-елементи без пробілів: [a, b, c]", has: "Items: [a, b, c]", hint: "csv.useDelimiter(\"\\\\s*,\\\\s*\")" },
      { on: "source", name: "Є перевірка hasNextInt і useDelimiter", matches: "hasNextInt[\\s\\S]*useDelimiter|useDelimiter[\\s\\S]*hasNextInt", hint: "Обидва методи Scanner" },
    ],
  },
  {
    ...base, id: "java-time-dates", lesson: "java/76", xp: 30,
    title: "java.time: арифметика, різниця й формат",
    context: "Дати рахують незмінні типи java.time: додати місяць, дізнатися день тижня, порахувати дні між датами, відформатувати й розібрати рядок. Дані фіксовані, тому результат завжди однаковий.",
    brief: [
      "Для <code>2026-01-31</code> додайте місяць (<code>plusMonths</code>), для <code>2026-11-20</code> визначте день тижня, порахуйте дні між <code>2026-01-01</code> і <code>2026-12-31</code> (<code>ChronoUnit.DAYS.between</code>), створіть <code>Duration.ofMinutes(90)</code>.",
      "Відформатуйте <code>2026-11-20</code> шаблоном <code>dd.MM.yyyy</code> і розберіть рядок <code>05.03.2025</code> тим самим шаблоном.",
    ],
    starter: raw`import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2026, 1, 31);
        LocalDate next = null;                       // TODO: start.plusMonths(1)
        System.out.println("Next month: " + next);

        DayOfWeek day = null;                        // TODO: день тижня для 2026-11-20
        System.out.println("Day: " + day);

        long days = 0;                               // TODO: ChronoUnit.DAYS.between(2026-01-01, 2026-12-31)
        System.out.println("Days: " + days);

        Duration duration = null;                    // TODO: Duration.ofMinutes(90)
        System.out.println("Duration: " + duration);

        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        String formatted = null;                     // TODO: LocalDate.of(2026, 11, 20).format(f)
        System.out.println("Formatted: " + formatted);

        LocalDate parsed = null;                     // TODO: LocalDate.parse("05.03.2025", f)
        System.out.println("Parsed: " + parsed);
    }
}
`,
    checks: [
      { on: "stdout", name: "Додавання місяця до 31 січня", has: "Next month: 2026-02-28", hint: "plusMonths притискає день до кінця лютого" },
      { on: "stdout", name: "День тижня й кількість днів", has: "Day: FRIDAY\nDays: 364", hint: "20 листопада 2026 року це п'ятниця; між 1 січня й 31 грудня 364 дні" },
      { on: "stdout", name: "Тривалість: PT1H30M", has: "Duration: PT1H30M", hint: "Duration.ofMinutes(90)" },
      { on: "stdout", name: "Формат і розбір", has: "Formatted: 20.11.2026\nParsed: 2025-03-05", hint: "Шаблон dd.MM.yyyy: dd день, MM місяць, yyyy рік" },
    ],
  },
  {
    ...base, id: "java-bigdecimal-invoice", lesson: "java/77", xp: 30,
    title: "BigDecimal: рахунок із податком і Random із seed",
    context: "Гроші рахують у BigDecimal із явним округленням, щоб не втрачати копійки. А тестові дані генерують із фіксованим seed, щоб збій можна було відтворити.",
    brief: [
      "Порахуйте <code>subtotal</code> (<code>19.99 * 3 + 5.50 * 2</code> на BigDecimal із рядків), <code>tax</code> (20% від суми, <code>setScale(2, RoundingMode.HALF_UP)</code>) і <code>total</code>.",
      "Ще створіть <code>new Random(42)</code> і виведіть три числа <code>nextInt(100)</code> через пробіл. Очікуваний вивід: <code>Subtotal: 70.97</code>, <code>Tax: 14.19</code>, <code>Total: 85.16</code> і <code>Rolls: 30 63 48</code>.",
    ],
    starter: raw`import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        BigDecimal subtotal = BigDecimal.ZERO;       // TODO: 19.99 * 3 + 5.50 * 2 (числа створюйте з рядків)
        BigDecimal tax = BigDecimal.ZERO;            // TODO: subtotal * 0.20, округлення до 2 знаків HALF_UP
        BigDecimal total = subtotal.add(tax);
        System.out.println("Subtotal: " + subtotal);
        System.out.println("Tax: " + tax);
        System.out.println("Total: " + total);

        Random random = new Random(0);               // TODO: seed 42
        System.out.println("Rolls: " + random.nextInt(100) + " " + random.nextInt(100) + " " + random.nextInt(100));
    }
}
`,
    checks: [
      { on: "stdout", name: "Сума без податку: «Subtotal: 70.97»", has: "Subtotal: 70.97", hint: "new BigDecimal(\"19.99\").multiply(BigDecimal.valueOf(3)) плюс 5.50 * 2" },
      { on: "stdout", name: "Податок з округленням: «Tax: 14.19»", has: "Tax: 14.19", hint: "70.97 * 0.20 = 14.194; setScale(2, RoundingMode.HALF_UP)" },
      { on: "stdout", name: "Разом: «Total: 85.16»", has: "Total: 85.16", hint: "subtotal.add(tax)" },
      { on: "stdout", name: "Випадкові числа з seed 42", has: "Rolls: 30 63 48", hint: "new Random(42): послідовність завжди однакова" },
      { on: "source", name: "Числа BigDecimal створено з рядків", matches: "new\\s+BigDecimal\\s*\\(\\s*\"19\\.99\"", hint: "new BigDecimal(\"19.99\")" },
    ],
  },
  {
    ...base, id: "java-optional-chain", lesson: "java/78", xp: 30,
    title: "Optional: ланцюжок і ifPresentOrElse",
    context: "Користувач може не мати адреси, а адреса — міста. Ланцюжок Optional замінює вкладені перевірки на null й дозволяє підставити значення за замовчуванням.",
    brief: [
      "Допишіть <code>cityOf(User)</code>: через <code>Optional.ofNullable(u).map(User::address).map(Address::city).orElse(\"unknown\")</code> (користувач і адреса можуть бути <code>null</code>).",
      "Допишіть <code>show(Optional&lt;String&gt;)</code> через <code>ifPresentOrElse</code>: <code>present: &lt;ім'я&gt;</code> або <code>absent</code>.",
    ],
    starter: raw`import java.util.Optional;

public class Main {
    record Address(String city) { }

    record User(String name, Address address) { }

    static String cityOf(User u) {
        // TODO: Optional.ofNullable(u).map(...).map(...).orElse("unknown")
        return "?";
    }

    static void show(Optional<String> name) {
        // TODO: ifPresentOrElse: "present: " + n або "absent"
    }

    public static void main(String[] args) {
        System.out.println(cityOf(new User("Ira", new Address("Kyiv"))));
        System.out.println(cityOf(new User("Bob", null)));
        System.out.println(cityOf(null));
        show(Optional.of("Ira"));
        show(Optional.empty());
    }
}
`,
    checks: [
      { on: "stdout", name: "Місто існуючого користувача", has: "Kyiv\n", hint: "map(User::address).map(Address::city)" },
      { on: "stdout", name: "Відсутня адреса й відсутній користувач", has: "Kyiv\nunknown\nunknown", hint: "ofNullable(u) безпечний і для null-користувача" },
      { on: "stdout", name: "Обидві гілки ifPresentOrElse", has: "present: Ira\nabsent", hint: "ifPresentOrElse(n -> System.out.println(\"present: \" + n), () -> System.out.println(\"absent\"))" },
      { on: "source", name: "Використано ofNullable, map і orElse", matches: "ofNullable[\\s\\S]*map\\([\\s\\S]*orElse\\(", hint: "Optional.ofNullable(u).map(...).orElse(...)" },
      { on: "source", name: "Використано ifPresentOrElse", has: "ifPresentOrElse", hint: "Optional.ifPresentOrElse(consumer, runnable)" },
    ],
  },
  {
    ...base, id: "java-stream-basics", lesson: "java/79", xp: 30,
    title: "Stream: filter, map, sorted, reduce",
    context: "Конвеєр потоку відповідає на питання про дані без явних циклів: які слова довгі, яка сума квадратів парних чисел, чи є слова довші за п'ять літер.",
    brief: [
      "З слів відфільтруйте довші за 3 символи, перетворіть на верхній регістр і відсортуйте. Для чисел від 1 до 10 знайдіть суму квадратів парних (<code>IntStream</code>).",
      "Ще виведіть <code>anyMatch</code> для довжини понад 5 і максимальну довжину слова. Очікуваний вивід: <code>Words: [CODE, JAVA, LAMBDA, STREAM]</code>, <code>Sum: 220</code>, <code>Has long: true</code>, <code>Max length: 6</code>.",
    ],
    starter: raw`import java.util.List;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        List<String> words = List.of("java", "stream", "api", "code", "lambda");
        List<String> result = List.of();         // TODO: filter(len > 3), map(toUpperCase), sorted(), toList()
        int sum = 0;                             // TODO: IntStream.rangeClosed(1, 10): парні, квадрати, sum()
        boolean hasLong = false;                 // TODO: anyMatch(len > 5)
        int maxLength = 0;                       // TODO: mapToInt(String::length).max().getAsInt()
        System.out.println("Words: " + result);
        System.out.println("Sum: " + sum);
        System.out.println("Has long: " + hasLong);
        System.out.println("Max length: " + maxLength);
    }
}
`,
    checks: [
      { on: "stdout", name: "Слова після конвеєра", has: "Words: [CODE, JAVA, LAMBDA, STREAM]", hint: "filter, map(String::toUpperCase), sorted(), toList()" },
      { on: "stdout", name: "Сума квадратів парних: «Sum: 220»", has: "Sum: 220", hint: "4 + 16 + 36 + 64 + 100" },
      { on: "stdout", name: "anyMatch і максимальна довжина", has: "Has long: true\nMax length: 6", hint: "stream і lambda мають по 6 символів" },
      { on: "source", name: "Використано потоки", matches: "\\.stream\\(\\)[\\s\\S]*\\.filter\\(", hint: "words.stream().filter(...)" },
      { on: "source", name: "Використано IntStream", has: "IntStream", hint: "IntStream.rangeClosed(1, 10)" },
    ],
  },
  {
    ...base, id: "java-stream-collect", lesson: "java/80", xp: 35,
    title: "Collectors: groupingBy, joining, flatMap",
    context: "Групування й агрегація — основа звітів: імена за містами, кількість у групах, середній вік, унікальні теги з вкладених списків. Колектори замінюють ручні цикли з мапами.",
    brief: [
      "Згрупуйте імена за містом (<code>groupingBy</code> із <code>mapping</code> і <code>TreeMap::new</code>), порахуйте людей у групах (<code>counting</code>), середній вік (<code>averagingInt</code>), склейте імена через <code>joining(\", \")</code>.",
      "З вкладених списків тегів зробіть відсортований набір унікальних значень через <code>flatMap</code>.",
    ],
    starter: raw`import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class Main {
    record Person(String name, String city, int age) { }

    public static void main(String[] args) {
        List<Person> people = List.of(
            new Person("Ira", "Kyiv", 30), new Person("Oleh", "Lviv", 25),
            new Person("Anna", "Kyiv", 22), new Person("Taras", "Lviv", 30));
        Map<String, List<String>> byCity = new TreeMap<>();   // TODO: groupingBy + mapping
        Map<String, Long> counts = new TreeMap<>();            // TODO: groupingBy + counting
        Map<String, Double> avg = new TreeMap<>();             // TODO: groupingBy + averagingInt
        String names = "";                                     // TODO: joining(", ")
        List<List<String>> tagLists = List.of(List.of("java", "fun"), List.of("java", "lambda"));
        List<String> tags = List.of();                         // TODO: flatMap, distinct, sorted
        System.out.println("By city: " + byCity);
        System.out.println("Count: " + counts);
        System.out.println("Avg: " + avg);
        System.out.println("Names: " + names);
        System.out.println("Tags: " + tags);
    }
}
`,
    checks: [
      { on: "stdout", name: "Імена за містами", has: "By city: {Kyiv=[Ira, Anna], Lviv=[Oleh, Taras]}", hint: "groupingBy(Person::city, TreeMap::new, mapping(Person::name, toList()))" },
      { on: "stdout", name: "Кількість і середній вік", has: "Count: {Kyiv=2, Lviv=2}\nAvg: {Kyiv=26.0, Lviv=27.5}", hint: "counting() і averagingInt(Person::age)" },
      { on: "stdout", name: "Склеєні імена", has: "Names: Ira, Oleh, Anna, Taras", hint: "map(Person::name).collect(Collectors.joining(\", \"))" },
      { on: "stdout", name: "Унікальні теги", has: "Tags: [fun, java, lambda]", hint: "tagLists.stream().flatMap(List::stream).distinct().sorted().toList()" },
      { on: "source", name: "Використано groupingBy і flatMap", matches: "groupingBy[\\s\\S]*flatMap|flatMap[\\s\\S]*groupingBy", hint: "Обидві операції з уроку" },
    ],
  },
  {
    ...base, id: "java-regex-extract", lesson: "java/81", xp: 30,
    title: "Регулярні вирази: журнал, пошта, маска",
    context: "Регулярні вирази витягують дані з журналів, перевіряють формати й приховують чутливі цифри. Шаблон зберігають у константі, а групи дають доступ до частин збігу.",
    brief: [
      "З рядків журналу витягніть дату й повідомлення лише для рівня <code>ERROR</code> (шаблон із групами, <code>Matcher.find</code>), виведіть <code>2026-11-20: disk full</code>.",
      "Перевірте пошту через <code>matches</code> (<code>ira@example.com</code> — <code>true</code>, <code>bad@</code> — <code>false</code>) і замаскуйте цифри в <code>card 1234 5678</code> через <code>replaceAll</code>.",
    ],
    starter: raw`import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    static final Pattern ERROR = null;   // TODO: Pattern.compile("(\\d{4}-\\d{2}-\\d{2}) ERROR (.+)")

    static boolean validEmail(String s) {
        // TODO: s.matches("[\\w.]+@[\\w.]+\\.\\w+")
        return false;
    }

    public static void main(String[] args) {
        List<String> lines = List.of("2026-11-20 ERROR disk full", "2026-11-21 INFO ok", "2026-11-22 ERROR timeout");
        for (String line : lines) {
            // TODO: Matcher m = ERROR.matcher(line); якщо m.find(): виведіть група1 + ": " + група2
        }
        System.out.println("Valid: " + validEmail("ira@example.com"));
        System.out.println("Valid: " + validEmail("bad@"));
        String masked = "card 1234 5678";      // TODO: replaceAll("\\d", "*")
        System.out.println("Masked: " + masked);
    }
}
`,
    checks: [
      { on: "stdout", name: "Лише рядки з ERROR", has: "2026-11-20: disk full\n2026-11-22: timeout", hint: "Група 1 це дата, група 2 повідомлення" },
      { on: "stdout", name: "Перевірка пошти", has: "Valid: true\nValid: false", hint: "[\\w.]+@[\\w.]+\\.\\w+ відхиляє bad@" },
      { on: "stdout", name: "Маска цифр", has: "Masked: card **** ****", hint: "replaceAll(\"\\\\d\", \"*\")" },
      { on: "source", name: "Використано Pattern, Matcher і matches", matches: "(?=[\\s\\S]*Pattern\\.compile)(?=[\\s\\S]*\\.find\\(\\))(?=[\\s\\S]*matches\\()", hint: "Pattern.compile, matcher.find(), String.matches" },
    ],
  },
  {
    ...base, id: "java-json-build", lesson: "java/82", xp: 30,
    title: "JSON вручну: escape і toJson",
    context: "Мінімальний серіалізатор показує, що саме роблять бібліотеки: екранують спеціальні символи в рядках і рекурсивно будують об'єкти й масиви. Порядок ключів тут фіксований, тож результат передбачуваний.",
    brief: [
      "Допишіть <code>escape(String)</code> (лапка, зворотна скісна, <code>\\n</code>, <code>\\t</code>) і <code>toJson(Object)</code> (switch за образцями: <code>null</code>, <code>String</code>, <code>Number</code>, <code>Boolean</code>, <code>Map</code>, <code>List</code>).",
      "Очікуваний вивід: компактний JSON <code>{\"name\":\"Ira \\\"Z\\\"\",\"age\":30,\"tags\":[\"a\",\"b\"],\"active\":true,\"note\":null}</code> і екранований рядок <code>a\\nb\\t\\\"q\\\"</code>.",
    ],
    starter: raw`import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    static String escape(String s) {
        // TODO: замініть \, ", переноси й табуляції на екрановані послідовності
        return s;
    }

    static String toJson(Object v) {
        // TODO: switch (v) { case null ... case String s ... case Number n ... case Boolean b ... case Map<?, ?> m ... case List<?> l ... }
        return String.valueOf(v);
    }

    public static void main(String[] args) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", "Ira \"Z\"");
        data.put("age", 30);
        data.put("tags", List.of("a", "b"));
        data.put("active", true);
        data.put("note", null);
        System.out.println(toJson(data));
        System.out.println(escape("a\nb\t\"q\""));
    }
}
`,
    checks: [
      { on: "stdout", name: "Повний JSON-об'єкт", has: raw`{"name":"Ira \"Z\"","age":30,"tags":["a","b"],"active":true,"note":null}`, hint: "Рядки в лапках з екрануванням, числа й булеві без лапок, null як слово" },
      { on: "stdout", name: "Екранований рядок", has: raw`a\nb\t\"q\"`, hint: "Лапка стає \\\", перенос \\n, табуляція \\t" },
      { on: "source", name: "Є switch з образцями", matches: "case\\s+String\\s+\\w+[\\s\\S]*case\\s+Number\\s+\\w+", hint: "case String s -> ...; case Number n -> ...;" },
      { on: "source", name: "Рекурсивні виклики toJson", matches: "toJson\\([\\s\\S]*toJson\\(", hint: "Для Map і List викликайте toJson для вкладених значень" },
    ],
  },
  {
    ...base, id: "java-json-parse", lesson: "java/83", xp: 40,
    title: "JSON вручну: рекурсивний спуск",
    context: "Парсер JSON складається з кількох методів, що викликають один одного: значення, об'єкт, масив. Вкладеність вирішує рекурсія, а перший символ значення визначає, який метод викликати.",
    brief: [
      "У класі <code>JsonParser</code> уже є допоміжні методи, рядки, числа й літерали. Допишіть <code>parseValue</code> (за першим символом), <code>parseArray</code> і <code>parseObject</code>.",
      "Очікуваний вивід для <code>{\"a\":[1,2,3],\"b\":{\"c\":true},\"d\":\"x\"}</code>: <code>a: [1, 2, 3]</code>, <code>b.c: true</code>, <code>d: x</code>, <code>sum: 6</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        Object parsed = JsonParser.parse("{\"a\":[1,2,3],\"b\":{\"c\":true},\"d\":\"x\"}");
        Map<String, Object> root = (Map<String, Object>) parsed;
        List<Object> a = (List<Object>) root.get("a");
        Map<String, Object> b = (Map<String, Object>) root.get("b");
        long sum = 0;
        for (Object n : a) {
            sum += (Long) n;
        }
        System.out.println("a: " + a);
        System.out.println("b.c: " + b.get("c"));
        System.out.println("d: " + root.get("d"));
        System.out.println("sum: " + sum);
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
        // TODO: skipWs(); за peek(): '{' parseObject, '[' parseArray, '"' parseString, t/f/n parseLiteral, цифра або '-' parseNumber
        return null;
    }

    private Map<String, Object> parseObject() {
        // TODO: expect('{'); порожній об'єкт; цикл: ключ parseString, expect(':'), parseValue, кома або '}'
        return null;
    }

    private List<Object> parseArray() {
        // TODO: expect('['); порожній масив; цикл: parseValue, кома або ']'
        return null;
    }

    private String parseString() {
        expect('"');
        StringBuilder sb = new StringBuilder();
        while (pos < text.length()) {
            char c = text.charAt(pos++);
            if (c == '"') {
                return sb.toString();
            }
            sb.append(c);
        }
        throw error("unterminated string");
    }

    private Object parseNumber() {
        int start = pos;
        while (pos < text.length() && "+-.eE0123456789".indexOf(text.charAt(pos)) >= 0) {
            pos++;
        }
        String number = text.substring(start, pos);
        return number.contains(".") ? (Object) Double.parseDouble(number) : (Object) Long.parseLong(number);
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
}
`,
    checks: [
      { on: "stdout", name: "Масив чисел", has: "a: [1, 2, 3]", hint: "parseArray викликає parseValue для кожного елемента" },
      { on: "stdout", name: "Вкладений об'єкт і рядок", has: "b.c: true\nd: x", hint: "parseObject: ключ, двокрапка, значення (рекурсія), кома або }" },
      { on: "stdout", name: "Сума елементів масиву", has: "sum: 6", hint: "Числа без крапки парсяться як Long" },
      { on: "source", name: "parseValue розрізняє типи за першим символом", matches: "case\\s+'\\{'[\\s\\S]*case\\s+'\\['|'\\{'[\\s\\S]*'\\['", hint: "'{' для об'єкта, '[' для масиву, '\"' для рядка" },
      { on: "source", name: "Методи викликають один одного рекурсивно", matches: "parseValue\\s*\\(\\s*\\)[\\s\\S]*parseValue\\s*\\(\\s*\\)[\\s\\S]*parseValue\\s*\\(\\s*\\)", hint: "parseObject і parseArray викликають parseValue" },
    ],
  },
  {
    ...base, id: "java-path-ops", lesson: "java/84", xp: 30,
    title: "Path: шляхи без диска і безпечне з'єднання",
    context: "Операції над шляхами не торкаються диска: їх можна перевіряти без файлів. Особливо важлива перевірка, що ім'я від користувача не виводить за межі базового каталогу.",
    brief: [
      "Для <code>base = /data/app</code> побудуйте повний шлях <code>logs/app.log</code>, виведіть ім'я файла, батьківський каталог, нормалізований <code>/data/app/../app/x</code> та відносний шлях від <code>base</code> до файла.",
      "Допишіть <code>safe(base, name)</code>: <code>base.resolve(name).normalize().startsWith(base)</code>. Очікуваний вивід: <code>Safe ok.txt: true</code> і <code>Safe ../etc/passwd: false</code>.",
    ],
    starter: raw`import java.nio.file.Path;

public class Main {
    static boolean safe(Path base, String name) {
        // TODO: base.resolve(name).normalize().startsWith(base)
        return true;
    }

    public static void main(String[] args) {
        Path base = Path.of("/data/app");
        Path full = base;                                // TODO: base.resolve("logs/app.log")
        System.out.println("Full: " + full);
        System.out.println("Name: " + full.getFileName());
        System.out.println("Parent: " + full.getParent());
        Path normalized = Path.of("/data/app/../app/x");   // TODO: .normalize()
        System.out.println("Normalized: " + normalized);
        System.out.println("Relative: " + base.relativize(full));
        System.out.println("Safe ok.txt: " + safe(base, "ok.txt"));
        System.out.println("Safe ../etc/passwd: " + safe(base, "../etc/passwd"));
    }
}
`,
    checks: [
      { on: "stdout", name: "Повний шлях, ім'я й батьківський каталог", has: "Full: /data/app/logs/app.log\nName: app.log\nParent: /data/app/logs", hint: "base.resolve(\"logs/app.log\"), getFileName(), getParent()" },
      { on: "stdout", name: "Нормалізація й відносний шлях", has: "Normalized: /data/app/x\nRelative: logs/app.log", hint: "normalize() прибирає .., relativize рахує відносний шлях" },
      { on: "stdout", name: "Безпечне з'єднання", has: "Safe ok.txt: true\nSafe ../etc/passwd: false", hint: "Після normalize шлях має лишатися в base: startsWith(base)" },
      { on: "source", name: "Використано resolve, normalize і startsWith", matches: "resolve[\\s\\S]*normalize[\\s\\S]*startsWith", hint: "base.resolve(name).normalize().startsWith(base)" },
    ],
  },
  {
    ...base, id: "java-unicode-bytes", lesson: "java/85", xp: 30,
    title: "Unicode: символи, байти й Locale",
    context: "Довжина тексту в символах, у байтах і в code point — різні числа. А формат чисел залежить від локалі: для обміну між системами зазначайте її явно.",
    brief: [
      "Для слова <code>\\u0457\\u0436\\u0430\\u043a</code> виведіть кількість символів і байтів UTF-8, для емодзі <code>\\uD83D\\uDE00</code> — довжину, кількість code point і байтів, перевірте round-trip через <code>getBytes</code> та <code>new String</code>.",
      "Відформатуйте <code>1234567.891</code> через <code>String.format</code> із <code>Locale.US</code> і <code>Locale.GERMANY</code> (<code>%,.2f</code>).",
    ],
    starter: raw`import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        String word = "\u0457\u0436\u0430\u043a";
        String emoji = "\uD83D\uDE00";
        System.out.println("Chars: " + 0);                 // TODO: word.length()
        System.out.println("Bytes: " + 0);                 // TODO: байти word у UTF-8
        System.out.println("Emoji length: " + 0);          // TODO: emoji.length()
        System.out.println("Emoji code points: " + 0);     // TODO: emoji.codePointCount(0, emoji.length())
        System.out.println("Emoji bytes: " + 0);           // TODO: байти emoji у UTF-8
        boolean same = false;                              // TODO: new String(word.getBytes(UTF_8), UTF_8).equals(word)
        System.out.println("Roundtrip: " + same);
        double value = 1234567.891;
        System.out.println("US: " + "");                   // TODO: String.format(Locale.US, "%,.2f", value)
        System.out.println("DE: " + "");                   // TODO: String.format(Locale.GERMANY, "%,.2f", value)
    }
}
`,
    checks: [
      { on: "stdout", name: "Символи й байти слова", has: "Chars: 4\nBytes: 8", hint: "У UTF-8 кожна літера кирилиці займає 2 байти" },
      { on: "stdout", name: "Емодзі: довжина 2, code point 1, байтів 4", has: "Emoji length: 2\nEmoji code points: 1\nEmoji bytes: 4", hint: "Сурогатна пара: дві одиниці UTF-16, один code point" },
      { on: "stdout", name: "Round-trip без втрат", has: "Roundtrip: true", hint: "getBytes(StandardCharsets.UTF_8) і new String(bytes, StandardCharsets.UTF_8)" },
      { on: "stdout", name: "Формат чисел за локалями", has: "US: 1,234,567.89\nDE: 1.234.567,89", hint: "String.format(Locale.US, \"%,.2f\", value) і Locale.GERMANY" },
      { on: "source", name: "Кодування вказано явно", has: "StandardCharsets.UTF_8", hint: "Не покладайтеся на кодування за замовчуванням" },
    ],
  },
];
