// Еталонні рішення завдань Java, глава 05 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_05 = {
  "java-shapes-interface": raw`import java.util.List;

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

class Circle implements Shape {
    private final double r;

    Circle(double r) {
        this.r = r;
    }

    @Override
    public double area() {
        return Math.PI * r * r;
    }

    @Override
    public String name() {
        return "Circle";
    }
}

class Rect implements Shape {
    private final double w;
    private final double h;

    Rect(double w, double h) {
        this.w = w;
        this.h = h;
    }

    @Override
    public double area() {
        return w * h;
    }

    @Override
    public String name() {
        return "Rectangle";
    }
}
`,
  "java-default-methods": raw`public class Main {
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

    static Notifier defaultNotifier() {
        return new Sms();
    }
}

class Sms implements Notifier {
    @Override
    public String channel() {
        return "SMS";
    }
}

class Email implements Notifier {
    @Override
    public String channel() {
        return "EMAIL";
    }

    @Override
    public String send(String message) {
        return "[" + channel() + "] " + message.toUpperCase();
    }
}
`,
  "java-iterable-range": raw`import java.util.Iterator;
import java.util.NoSuchElementException;

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
        return new RangeIterator();
    }

    private class RangeIterator implements Iterator<Integer> {
        private int current = from;

        @Override
        public boolean hasNext() {
            return current < to;
        }

        @Override
        public Integer next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            int value = current;
            current += step;
            return value;
        }
    }
}
`,
  "java-sealed-shapes": raw`public class Main {
    static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.r() * c.r();
            case Rect r -> r.w() * r.h();
            case Square q -> q.side() * q.side();
        };
    }

    static String size(Shape s) {
        return switch (s) {
            case Square q when q.side() > 4 -> "big square";
            case Square q -> "square";
            case Rect r -> "rect";
            case Circle c -> "circle";
        };
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
  "java-comparators": raw`import java.util.ArrayList;
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
        byAge.sort(Comparator.comparingInt(Person::age).thenComparing(Person::name));
        byCity.sort(Comparator.comparing(Person::city).thenComparing(Person::age, Comparator.reverseOrder()));
        System.out.println("By age: " + names(byAge));
        System.out.println("By city: " + names(byCity));
    }
}
`,
  "java-lambdas-basic": raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Predicate<String> isLong = s -> s.length() > 4;
        Function<String, Integer> len = s -> s.length();
        BinaryOperator<Integer> add = (a, b) -> a + b;
        Supplier<String> greeting = () -> "Hello";
        System.out.println(isLong.test("lambda"));
        System.out.println(isLong.test("go"));
        System.out.println(len.apply("hello"));
        System.out.println(add.apply(2, 3));
        System.out.println(greeting.get());
        List<String> words = new ArrayList<>(List.of("a", "long", "lambdas"));
        words.removeIf(w -> w.length() < 4);
        System.out.println(words);
    }
}
`,
  "java-function-compose": raw`import java.util.function.Function;
import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Function<String, String> trim = String::trim;
        Function<String, String> upper = String::toUpperCase;
        Function<String, Integer> len = String::length;
        Predicate<String> nonBlank = Predicate.not(String::isBlank);
        Function<String, String> normalize = trim.andThen(upper);
        Function<String, Integer> trimmedLength = trim.andThen(len);
        System.out.println(normalize.apply("  hello  "));
        System.out.println(trimmedLength.apply("  hello  "));
        System.out.println(nonBlank.test("  "));
        System.out.println(nonBlank.test("x"));
    }
}
`,
  "java-generic-box": raw`import java.util.List;

public class Main {
    static <T> T firstOrDefault(List<T> list, T def) {
        return list.isEmpty() ? def : list.get(0);
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
    private final A first;
    private final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    A first() {
        return first;
    }

    B second() {
        return second;
    }

    Pair<B, A> swap() {
        return new Pair<>(second, first);
    }

    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
}
`,
  "java-generic-bounds": raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static <T extends Comparable<T>> T max(List<T> list) {
        T best = list.get(0);
        for (T x : list) {
            if (x.compareTo(best) > 0) {
                best = x;
            }
        }
        return best;
    }

    static double sum(List<? extends Number> list) {
        double total = 0;
        for (Number n : list) {
            total += n.doubleValue();
        }
        return total;
    }

    static void fillInts(List<? super Integer> out, int n) {
        for (int i = 0; i < n; i++) {
            out.add(i);
        }
    }

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
  "java-result-cache": raw`import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class Main {
    static Result<Integer> parse(String s) {
        if (s.matches("-?\\d+")) {
            return new Ok<>(Integer.parseInt(s));
        }
        return new Err<>("not a number: " + s);
    }

    static <T> String describe(Result<T> r) {
        return switch (r) {
            case Ok<T> ok -> "ok " + ok.value();
            case Err<T> err -> "error " + err.message();
        };
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
        return data.computeIfAbsent(key, k -> {
            loads++;
            return loader.apply(k);
        });
    }

    int loads() {
        return loads;
    }
}
`,
  "java-erasure-factory": raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Main {
    static <T> List<T> repeat(Supplier<T> factory, int n) {
        List<T> result = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            result.add(factory.get());
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(repeat(() -> "x", 3));
        List<StringBuilder> builders = repeat(StringBuilder::new, 2);
        System.out.println("Size: " + builders.size());
        System.out.println("Distinct: " + (builders.size() == 2 && builders.get(0) != builders.get(1)));
        List<String> strings = new ArrayList<>();
        List<Integer> numbers = new ArrayList<>();
        System.out.println("Same class: " + (strings.getClass() == numbers.getClass()));
    }
}
`,
  "java-reflection-inspect": raw`import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    static List<String> describe(Object o) throws Exception {
        List<String> lines = new ArrayList<>();
        for (Field f : o.getClass().getDeclaredFields()) {
            f.setAccessible(true);
            lines.add(f.getName() + "=" + f.get(o));
        }
        Collections.sort(lines);
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
};
