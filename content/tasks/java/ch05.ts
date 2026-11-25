// Практичні завдання глави «Інтерфейси та generics» (уроки 40–51). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "java-shapes-interface", lesson: "java/40", xp: 35,
    title: "Інтерфейс Shape і поліморфізм",
    context: "Інтерфейс описує, що вміє об'єкт, не уточнюючи як. Код працює зі списком Shape, і йому байдуже, кружечок там чи прямокутник: кожен сам знає, як рахувати площу.",
    brief: [
      "Інтерфейс <code>Shape</code> уже описаний. Реалізуйте його в класах <code>Circle</code> (радіус) та <code>Rect</code> (ширина й висота): <code>name()</code> повертає <code>Circle</code> / <code>Rectangle</code>, а <code>area()</code> площу.",
      "У <code>main</code> фігури лежать у списку типу <code>List&lt;Shape&gt;</code>, і цикл не знає, яка саме перед ним.",
    ],
    starter: raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(2), new Rect(3, 4));
        for (Shape s : shapes) {
            System.out.printf("%s: %.2f%n", s.name(), s.area());
        }
    }
}

interface Shape {
    double area();
    String name();
}

// TODO: class Circle implements Shape (конструктор Circle(double r))
// TODO: class Rect implements Shape (конструктор Rect(double w, double h))
`,
    checks: [
      { on: "stdout", name: "Circle: 12.57", has: "Circle: 12.57", hint: "Площа кола: Math.PI * r * r" },
      { on: "stdout", name: "Rectangle: 12.00", has: "Rectangle: 12.00", hint: "Площа прямокутника: w * h; name() повертає Rectangle" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Circle: 12.57\nRectangle: 12.00", hint: "Рівно два рядки: спершу коло, потім прямокутник" },
      { on: "source", name: "Обидва класи реалізують Shape", matches: "class\\s+Circle\\s+implements\\s+Shape[\\s\\S]*class\\s+Rect\\s+implements\\s+Shape", hint: "class Circle implements Shape { ... } і class Rect implements Shape { ... }" },
    ],
  },
  {
    ...base, id: "java-default-methods", lesson: "java/41", xp: 25,
    title: "default- і static-методи: Notifier",
    context: "Default-метод дає стандартну поведінку, яку клас може залишити або перевизначити, а статичний метод інтерфейсу годиться для фабрики. Так інтерфейс стає зручнішим, не ламаючи реалізації.",
    brief: [
      "Допишіть класи <code>Sms</code> (канал <code>SMS</code>) і <code>Email</code> (канал <code>EMAIL</code>), які реалізують <code>Notifier</code>. Метод <code>send</code> в <code>Sms</code> лишіть стандартним, а в <code>Email</code> перевизначте, щоб повідомлення виводилося великими літерами.",
      "Додайте в інтерфейс статичний метод <code>defaultNotifier()</code>, який повертає <code>new Sms()</code>. Очікуваний вивід: <code>[SMS] hello</code>, <code>[EMAIL] HELLO</code>, <code>[SMS] hi</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        System.out.println(new Sms().send("hello"));
        System.out.println(new Email().send("hello"));
        System.out.println(Notifier.defaultNotifier().send("hi"));
    }
}

interface Notifier {
    String channel();

    default String send(String message) {
        return "[" + channel() + "] " + message;
    }

    // TODO: static Notifier defaultNotifier() { return new Sms(); }
}

// TODO: class Sms implements Notifier: channel() повертає "SMS"
// TODO: class Email implements Notifier: channel() повертає "EMAIL", send() перевизначає повідомлення в UPPER CASE
`,
    checks: [
      { on: "stdout", name: "SMS використовує стандартний send", has: "[SMS] hello", hint: "Sms не перевизначає send(), діє default-метод" },
      { on: "stdout", name: "Email перевизначає send", has: "[EMAIL] HELLO", hint: "return \"[\" + channel() + \"] \" + message.toUpperCase();" },
      { on: "stdout", name: "Статичний фабричний метод повертає SMS", has: "[SMS] hi", hint: "static Notifier defaultNotifier() { return new Sms(); }" },
      { on: "source", name: "Обидва класи реалізують Notifier", matches: "class\\s+Sms\\s+implements\\s+Notifier[\\s\\S]*class\\s+Email\\s+implements\\s+Notifier", hint: "class Sms implements Notifier і class Email implements Notifier" },
      { on: "source", name: "Є статичний метод інтерфейсу", matches: "static\\s+Notifier\\s+defaultNotifier", hint: "Його оголошують усередині interface Notifier" },
    ],
  },
  {
    ...base, id: "java-iterable-range", lesson: "java/42", xp: 30,
    title: "Iterable: власний діапазон",
    context: "Клас, що реалізує Iterable, можна обходити циклом for-each, як списки. Діапазон із кроком — зручний приклад: числа не зберігаються, а обчислюються під час обходу.",
    brief: [
      "У класі <code>Range</code> реалізуйте <code>iterator()</code>: поверніть екземпляр внутрішнього класу, що зберігає поточне значення, а <code>hasNext()</code> перевіряє <code>current &lt; to</code>, <code>next()</code> повертає значення й збільшує його на <code>step</code>.",
      "Очікуваний вивід: <code>0 2 4 6 8</code> і <code>Sum: 20</code>.",
    ],
    starter: raw`import java.util.Collections;
import java.util.Iterator;

public class Main {
    public static void main(String[] args) {
        Range even = new Range(0, 10, 2);
        int sum = 0;
        for (int x : even) {
            System.out.print(x + " ");
            sum += x;
        }
        System.out.println();
        System.out.println("Sum: " + sum);
    }
}

class Range implements Iterable<Integer> {
    private final int from;
    private final int to;
    private final int step;

    Range(int from, int to, int step) {
        this.from = from;
        this.to = to;
        this.step = step;
    }

    @Override
    public Iterator<Integer> iterator() {
        // TODO: внутрішній клас RangeIterator implements Iterator<Integer>
        return Collections.emptyIterator();
    }
}
`,
    checks: [
      { on: "stdout", name: "Числа діапазону: 0 2 4 6 8", has: "0 2 4 6 8", hint: "Починайте з from, додавайте step, доки current < to" },
      { on: "stdout", name: "Сума: «Sum: 20»", has: "Sum: 20", hint: "0 + 2 + 4 + 6 + 8 = 20" },
      { on: "source", name: "Є ітератор із hasNext і next", matches: "hasNext\\s*\\([\\s\\S]*next\\s*\\(", hint: "Iterator<Integer> вимагає обох методів" },
      { on: "source", name: "Порожній ітератор прибрано", matches: "emptyIterator\\s*\\(\\s*\\)\\s*;", not: true, hint: "Поверніть new RangeIterator() замість Collections.emptyIterator()" },
    ],
  },
  {
    ...base, id: "java-sealed-shapes", lesson: "java/43", xp: 35,
    title: "sealed Shape і switch з образцами",
    context: "Запечатана ієрархія фігур дозволяє компілятору перевірити, що switch охоплює всі випадки. Додавши нову фігуру, ви одразу побачите всі місця, де її не оброблено.",
    brief: [
      "Допишіть <code>area(Shape s)</code> як switch-вираз за образцями (<code>Circle</code>, <code>Rect</code>, <code>Square</code>) без гілки <code>default</code>, а <code>size(Shape s)</code> із гілкою <code>case Square q when q.side() &gt; 4</code>, що повертає <code>big square</code>.",
      "Очікуваний вивід: <code>12.57</code>, <code>12.00</code>, <code>25.00</code> (площі) і <code>big square</code>, <code>rect</code>, <code>circle</code>.",
    ],
    starter: raw`public class Main {
    static double area(Shape s) {
        // TODO: switch-вираз за образцями без default
        return 0;
    }

    static String size(Shape s) {
        // TODO: Square із side() > 4 дає "big square", Rect дає "rect", Circle дає "circle", Square дає "square"
        return "?";
    }

    public static void main(String[] args) {
        Shape[] shapes = {new Circle(2), new Rect(3, 4), new Square(5)};
        for (Shape s : shapes) {
            System.out.printf("%.2f%n", area(s));
        }
        System.out.println(size(new Square(5)));
        System.out.println(size(new Rect(1, 1)));
        System.out.println(size(new Circle(1)));
    }
}

sealed interface Shape permits Circle, Rect, Square {
}

record Circle(double r) implements Shape {
}

record Rect(double w, double h) implements Shape {
}

record Square(double side) implements Shape {
}
`,
    checks: [
      { on: "stdout", name: "Площі фігур", has: "12.57\n12.00\n25.00", hint: "Circle: PI * r * r, Rect: w * h, Square: side * side" },
      { on: "stdout", name: "Опис розміру", has: "big square\nrect\ncircle", hint: "Гілка з when має стояти перед загальною гілкою Square" },
      { on: "source", name: "Є switch з образцями", matches: "case\\s+Circle\\s+\\w+", hint: "case Circle c -> ..." },
      { on: "source", name: "Є умова when", matches: "\\bwhen\\b", hint: "case Square q when q.side() > 4 -> \"big square\";" },
      { on: "source", name: "Гілки default немає", matches: "\\bdefault\\b", not: true, hint: "Для sealed-типу компілятор перевірить повноту без default" },
    ],
  },
  {
    ...base, id: "java-comparators", lesson: "java/44", xp: 30,
    title: "Comparator: сортування людей",
    context: "Звіти сортують за кількома критеріями: спершу місто, потім вік. Ланцюжки Comparator.comparing(...).thenComparing(...) пишуться в один рядок і читаються як опис правила.",
    brief: [
      "Відсортуйте копію <code>byAge</code> за віком за зростанням, а при рівному віці за іменем (<code>comparingInt</code> і <code>thenComparing</code>).",
      "Копію <code>byCity</code> відсортуйте за містом, а в межах міста за віком за спаданням. Очікуваний вивід: <code>By age: [Anna, Oleh, Ira, Taras]</code> і <code>By city: [Ira, Anna, Taras, Oleh]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Main {
    record Person(String name, String city, int age) { }

    static List<String> names(List<Person> people) {
        List<String> result = new ArrayList<>();
        for (Person p : people) {
            result.add(p.name());
        }
        return result;
    }

    public static void main(String[] args) {
        List<Person> people = List.of(
            new Person("Ira", "Kyiv", 30), new Person("Oleh", "Lviv", 25),
            new Person("Anna", "Kyiv", 22), new Person("Taras", "Lviv", 30));
        List<Person> byAge = new ArrayList<>(people);
        List<Person> byCity = new ArrayList<>(people);
        // TODO: відсортуйте byAge за віком, потім за іменем
        // TODO: відсортуйте byCity за містом, потім за віком за спаданням
        System.out.println("By age: " + names(byAge));
        System.out.println("By city: " + names(byCity));
    }
}
`,
    checks: [
      { on: "stdout", name: "Сортування за віком, потім за іменем", has: "By age: [Anna, Oleh, Ira, Taras]", hint: "Comparator.comparingInt(Person::age).thenComparing(Person::name)" },
      { on: "stdout", name: "Сортування за містом, потім за віком за спаданням", has: "By city: [Ira, Anna, Taras, Oleh]", hint: "comparing(Person::city).thenComparing(Person::age, Comparator.reverseOrder())" },
      { on: "source", name: "Використано Comparator.comparing", matches: "Comparator\\s*\\.\\s*comparing", hint: "Comparator.comparing(...) або comparingInt(...)" },
      { on: "source", name: "Використано thenComparing", has: "thenComparing", hint: "Другий критерій додає thenComparing" },
    ],
  },
  {
    ...base, id: "java-lambdas-basic", lesson: "java/45", xp: 30,
    title: "Лямбди: Predicate, Function, BinaryOperator, Supplier",
    context: "Лямбда передає поведінку як значення. Стандартні інтерфейси з java.util.function покривають більшість потреб: перевірка, перетворення, об'єднання двох значень і створення значення.",
    brief: [
      "Заповніть чотири змінні лямбдами: <code>isLong</code> (рядок довший за 4 символи), <code>len</code> (довжина рядка), <code>add</code> (сума двох чисел) і <code>greeting</code> (повертає <code>Hello</code>).",
      "Ще видаліть зі списку слова коротші за 4 символи через <code>removeIf</code>. Очікуваний вивід: <code>true</code>, <code>false</code>, <code>5</code>, <code>5</code>, <code>Hello</code> і <code>[long, lambdas]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Predicate<String> isLong = null;          // TODO: s -> s.length() > 4
        Function<String, Integer> len = null;     // TODO
        BinaryOperator<Integer> add = null;       // TODO
        Supplier<String> greeting = null;         // TODO
        System.out.println(isLong.test("lambda"));
        System.out.println(isLong.test("go"));
        System.out.println(len.apply("hello"));
        System.out.println(add.apply(2, 3));
        System.out.println(greeting.get());
        List<String> words = new ArrayList<>(List.of("a", "long", "lambdas"));
        // TODO: removeIf: слова коротші за 4 символи
        System.out.println(words);
    }
}
`,
    checks: [
      { on: "stdout", name: "Predicate: true і false", has: "true\nfalse", hint: "\"lambda\" довше за 4 символи, \"go\" коротше" },
      { on: "stdout", name: "Function і BinaryOperator: 5 і 5", has: "5\n5", hint: "len: s -> s.length(); add: (a, b) -> a + b" },
      { on: "stdout", name: "Supplier повертає Hello", has: "Hello", hint: "() -> \"Hello\"" },
      { on: "stdout", name: "removeIf лишає довгі слова", has: "[long, lambdas]", hint: "words.removeIf(w -> w.length() < 4)" },
      { on: "source", name: "Використано щонайменше чотири лямбди", matches: "->[\\s\\S]*->[\\s\\S]*->[\\s\\S]*->", hint: "Кожна змінна й removeIf потребують власної лямбди" },
    ],
  },
  {
    ...base, id: "java-function-compose", lesson: "java/46", xp: 30,
    title: "Посилання на методи і композиція функцій",
    context: "Конвеєр дрібних функцій — основа декларативного коду: обрізати пробіли, привести регістр, порахувати довжину. Посилання на методи роблять цей запис коротким, а andThen з'єднує кроки.",
    brief: [
      "Створіть функції через посилання на методи: <code>trim</code> (<code>String::trim</code>), <code>upper</code> (<code>String::toUpperCase</code>), <code>len</code> (<code>String::length</code>) і предикат <code>nonBlank</code> (<code>Predicate.not(String::isBlank)</code>).",
      "Складіть <code>normalize = trim.andThen(upper)</code> та <code>trimmedLength = trim.andThen(len)</code>. Очікуваний вивід: <code>HELLO</code>, <code>5</code>, <code>false</code> і <code>true</code>.",
    ],
    starter: raw`import java.util.function.Function;
import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Function<String, String> trim = null;         // TODO: String::trim
        Function<String, String> upper = null;        // TODO: String::toUpperCase
        Function<String, Integer> len = null;         // TODO: String::length
        Predicate<String> nonBlank = null;            // TODO: Predicate.not(String::isBlank)
        Function<String, String> normalize = null;    // TODO: trim.andThen(upper)
        Function<String, Integer> trimmedLength = null;   // TODO: trim.andThen(len)
        System.out.println(normalize.apply("  hello  "));
        System.out.println(trimmedLength.apply("  hello  "));
        System.out.println(nonBlank.test("  "));
        System.out.println(nonBlank.test("x"));
    }
}
`,
    checks: [
      { on: "stdout", name: "normalize дає HELLO", has: "HELLO", hint: "Спершу trim, потім toUpperCase" },
      { on: "stdout", name: "trimmedLength дає 5", has: "HELLO\n5", hint: "Довжина рядка після обрізання пробілів" },
      { on: "stdout", name: "Предикат: false для пробілів і true для x", has: "false\ntrue", hint: "Predicate.not(String::isBlank)" },
      { on: "source", name: "Використано String::trim і andThen", matches: "String::trim[\\s\\S]*andThen|andThen[\\s\\S]*String::trim", hint: "Посилання на метод і композиція" },
      { on: "source", name: "Використано Predicate.not", has: "Predicate.not", hint: "Predicate.not(String::isBlank)" },
    ],
  },
  {
    ...base, id: "java-generic-box", lesson: "java/47", xp: 30,
    title: "Узагальнені Pair і firstOrDefault",
    context: "Узагальнений клас Pair<A, B> зберігає два значення різних типів із перевіркою на етапі компіляції. Узагальнений метод працює з будь-яким типом елемента без приведень.",
    brief: [
      "Допишіть клас <code>Pair&lt;A, B&gt;</code> (поля, конструктор, <code>first()</code>, <code>second()</code>, <code>swap()</code> типу <code>Pair&lt;B, A&gt;</code>, <code>toString</code> формату <code>(a, 1)</code>) і метод <code>firstOrDefault(List&lt;T&gt;, T)</code>.",
      "Очікуваний вивід: <code>Pair: (a, 1)</code>, <code>Swapped: (1, a)</code>, <code>First: x</code> і <code>Default: none</code>.",
    ],
    starter: raw`import java.util.List;

public class Main {
    static <T> T firstOrDefault(List<T> list, T def) {
        // TODO: перший елемент або def для порожнього списку
        return def;
    }

    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("a", 1);
        System.out.println("Pair: " + p);
        System.out.println("Swapped: " + p.swap());
        System.out.println("First: " + firstOrDefault(List.of("x", "y"), "none"));
        System.out.println("Default: " + firstOrDefault(List.<String>of(), "none"));
    }
}

class Pair<A, B> {
    // TODO: приватні фінальні поля first і second, конструктор, first(), second(), swap(), toString()
}
`,
    checks: [
      { on: "stdout", name: "Pair виводиться як (a, 1)", has: "Pair: (a, 1)", hint: "toString: \"(\" + first + \", \" + second + \")\"" },
      { on: "stdout", name: "swap міняє місцями", has: "Swapped: (1, a)", hint: "Pair<B, A> swap() { return new Pair<>(second, first); }" },
      { on: "stdout", name: "firstOrDefault: x і none", has: "First: x\nDefault: none", hint: "list.isEmpty() ? def : list.get(0)" },
      { on: "source", name: "Pair узагальнений за двома типами", matches: "class\\s+Pair\\s*<\\s*A\\s*,\\s*B\\s*>", hint: "class Pair<A, B> { ... }" },
      { on: "source", name: "swap повертає Pair<B, A>", matches: "Pair\\s*<\\s*B\\s*,\\s*A\\s*>\\s+swap", hint: "Типи в результаті міняються місцями" },
    ],
  },
  {
    ...base, id: "java-generic-bounds", lesson: "java/48", xp: 30,
    title: "Обмеження типів: max, sum, fill",
    context: "Обмеження дозволяють писати універсальний код: максимум серед будь-яких порівнянних елементів, сума будь-яких чисел, заповнення списку будь-якого надтипу. Правило PECS підказує, коли ставити extends, а коли super.",
    brief: [
      "Допишіть <code>max(List&lt;T&gt;)</code> із обмеженням <code>T extends Comparable&lt;T&gt;</code>, <code>sum(List&lt;? extends Number&gt;)</code> і <code>fillInts(List&lt;? super Integer&gt;, int n)</code>, що додає числа від 0 до n - 1.",
      "Очікуваний вивід: <code>Max: 9</code>, <code>Max: pear</code>, <code>Sum: 7.5</code> і <code>Filled: [0, 1, 2]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    // TODO: static <T extends Comparable<T>> T max(List<T> list)

    // TODO: static double sum(List<? extends Number> list)

    // TODO: static void fillInts(List<? super Integer> out, int n)

    public static void main(String[] args) {
        System.out.println("Max: " + max(List.of(3, 9, 4)));
        System.out.println("Max: " + max(List.of("kiwi", "pear", "fig")));
        System.out.println("Sum: " + sum(List.of(1, 2.5, 4)));
        List<Number> numbers = new ArrayList<>();
        fillInts(numbers, 3);
        System.out.println("Filled: " + numbers);
    }
}
`,
    checks: [
      { on: "stdout", name: "Максимум чисел і рядків", has: "Max: 9\nMax: pear", hint: "Порівнюйте через compareTo і зберігайте найбільший" },
      { on: "stdout", name: "Сума чисел різних типів: «Sum: 7.5»", has: "Sum: 7.5", hint: "Складайте n.doubleValue()" },
      { on: "stdout", name: "Заповнення списку надтипу", has: "Filled: [0, 1, 2]", hint: "out.add(i) у циклі від 0 до n - 1" },
      { on: "source", name: "max обмежений Comparable", matches: "T\\s+extends\\s+Comparable\\s*<\\s*T\\s*>", hint: "static <T extends Comparable<T>> T max(List<T> list)" },
      { on: "source", name: "Використано ? extends і ? super", matches: "\\?\\s+extends\\s+Number[\\s\\S]*\\?\\s+super\\s+Integer", hint: "sum читає (extends), fillInts записує (super)" },
    ],
  },
  {
    ...base, id: "java-result-cache", lesson: "java/49", xp: 35,
    title: "Result і Cache на generics",
    context: "Result замість винятку описує очікувану помилку, а Cache із завантажувачем не рахує двічі те саме. Обидва типи узагальнені, тому працюють із будь-якими даними.",
    brief: [
      "Допишіть <code>parse(String)</code>: для рядка з цифр поверніть <code>new Ok&lt;&gt;(число)</code>, інакше <code>new Err&lt;&gt;(\"not a number: \" + s)</code>, і <code>describe(Result&lt;T&gt;)</code> як switch за образцями (<code>ok ...</code> або <code>error ...</code>).",
      "У <code>Cache.get</code> зверніться до завантажувача лише якщо значення немає (<code>computeIfAbsent</code> із лічильником). Очікуваний вивід: <code>ok 42</code>, <code>error not a number: x1</code>, <code>Value: A</code> і <code>Loads: 1</code>.",
    ],
    starter: raw`import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class Main {
    static Result<Integer> parse(String s) {
        // TODO: Ok(число), якщо s складається з цифр (s.matches("-?\\d+")), інакше Err
        return new Err<>("todo");
    }

    static <T> String describe(Result<T> r) {
        // TODO: switch за образцями: "ok " + значення або "error " + повідомлення
        return "?";
    }

    public static void main(String[] args) {
        System.out.println(describe(parse("42")));
        System.out.println(describe(parse("x1")));
        Cache<String, String> cache = new Cache<>(key -> key.toUpperCase());
        cache.get("a");
        System.out.println("Value: " + cache.get("a"));
        System.out.println("Loads: " + cache.loads());
    }
}

sealed interface Result<T> permits Ok, Err {
}

record Ok<T>(T value) implements Result<T> {
}

record Err<T>(String message) implements Result<T> {
}

class Cache<K, V> {
    private final Map<K, V> data = new HashMap<>();
    private final Function<K, V> loader;
    private int loads;

    Cache(Function<K, V> loader) {
        this.loader = loader;
    }

    V get(K key) {
        // TODO: computeIfAbsent: викликайте loader і збільшуйте loads лише для нових ключів
        return null;
    }

    int loads() {
        return loads;
    }
}
`,
    checks: [
      { on: "stdout", name: "Успішний розбір: «ok 42»", has: "ok 42", hint: "new Ok<>(Integer.parseInt(s))" },
      { on: "stdout", name: "Помилка розбору: «error not a number: x1»", has: "error not a number: x1", hint: "new Err<>(\"not a number: \" + s)" },
      { on: "stdout", name: "Значення з кешу: «Value: A»", has: "Value: A", hint: "loader.apply(key) повертає верхній регістр" },
      { on: "stdout", name: "Завантажувач викликано один раз: «Loads: 1»", has: "Loads: 1", hint: "Другий виклик get бере значення з мапи" },
      { on: "source", name: "describe використовує switch з образцями", matches: "case\\s+Ok\\s*<\\s*T\\s*>\\s+\\w+", hint: "case Ok<T> ok -> ...; case Err<T> err -> ...;" },
      { on: "source", name: "Cache використовує computeIfAbsent", has: "computeIfAbsent", hint: "data.computeIfAbsent(key, k -> { loads++; return loader.apply(k); })" },
    ],
  },
  {
    ...base, id: "java-erasure-factory", lesson: "java/50", xp: 30,
    title: "Фабрика замість new T() і стирання типів",
    context: "Через стирання типів у узагальненому коді не можна написати new T(). Замість цього передають фабрику Supplier<T>: так створюють нові об'єкти будь-якого типу без рефлексії.",
    brief: [
      "Допишіть <code>repeat(Supplier&lt;T&gt; factory, int n)</code>: список із <code>n</code> об'єктів, створених викликом <code>factory.get()</code>.",
      "У <code>main</code> виведіть ще <code>Same class: true</code> для порівняння <code>getClass()</code> двох списків із різними параметрами типу. Очікуваний вивід: <code>[x, x, x]</code>, <code>Size: 2</code>, <code>Distinct: true</code> і <code>Same class: true</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Main {
    static <T> List<T> repeat(Supplier<T> factory, int n) {
        // TODO: створіть n об'єктів через factory.get()
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(repeat(() -> "x", 3));
        List<StringBuilder> builders = repeat(StringBuilder::new, 2);
        System.out.println("Size: " + builders.size());
        System.out.println("Distinct: " + (builders.size() == 2 && builders.get(0) != builders.get(1)));
        List<String> strings = new ArrayList<>();
        List<Integer> numbers = new ArrayList<>();
        // TODO: виведіть Same class: та результат strings.getClass() == numbers.getClass()
    }
}
`,
    checks: [
      { on: "stdout", name: "repeat створює три рядки", has: "[x, x, x]", hint: "У циклі result.add(factory.get())" },
      { on: "stdout", name: "Два різні об'єкти StringBuilder", has: "Size: 2\nDistinct: true", hint: "Кожен виклик factory.get() створює новий об'єкт" },
      { on: "stdout", name: "Параметри типу стерті: «Same class: true»", has: "Same class: true", hint: "strings.getClass() == numbers.getClass()" },
      { on: "source", name: "Використано factory.get()", has: "factory.get()", hint: "Фабрика замість new T()" },
    ],
  },
  {
    ...base, id: "java-reflection-inspect", lesson: "java/51", xp: 30,
    title: "Рефлексія: опис полів об'єкта",
    context: "Універсальні інструменти (логери, серіалізатори, перевірки) описують об'єкти, не знаючи їхнього класу: вони за допомогою рефлексії читають поля за іменами й типами.",
    brief: [
      "Допишіть <code>describe(Object o)</code>: для кожного поля з <code>getDeclaredFields()</code> зробіть <code>setAccessible(true)</code>, прочитайте значення й додайте рядок <code>name=value</code> у список, а потім відсортуйте список.",
      "Очікуваний вивід для <code>User</code>: <code>age=30</code>, <code>name=Ira</code>. Метод оголошує <code>throws Exception</code>, бо рефлексія кидає перевірювані винятки.",
    ],
    starter: raw`import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    static List<String> describe(Object o) throws Exception {
        List<String> lines = new ArrayList<>();
        // TODO: для кожного поля (o.getClass().getDeclaredFields()): setAccessible(true), name=value, потім відсортуйте lines
        return lines;
    }

    public static void main(String[] args) throws Exception {
        for (String line : describe(new User("Ira", 30))) {
            System.out.println(line);
        }
    }
}

class User {
    private final String name;
    private final int age;

    User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
`,
    checks: [
      { on: "stdout", name: "Поля описано й відсортовано", has: "age=30\nname=Ira", hint: "Рядки виду name=value, відсортовані через Collections.sort" },
      { on: "source", name: "Використано getDeclaredFields", has: "getDeclaredFields", hint: "o.getClass().getDeclaredFields()" },
      { on: "source", name: "Використано setAccessible і get", matches: "setAccessible[\\s\\S]*\\.get\\(", hint: "f.setAccessible(true); f.get(o)" },
    ],
  },
];
