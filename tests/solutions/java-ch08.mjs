// Еталонні рішення завдань Java, глава 08 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_08 = {
  "java-stringbuilder-report": raw`public class Main {
    public static void main(String[] args) {
        String[] names = {"Pen", "Ink", "Book"};
        int[] qty = {3, 12, 1};
        StringBuilder report = new StringBuilder();
        int total = 0;
        for (int i = 0; i < names.length; i++) {
            report.append(names[i]).append(" x").append(qty[i]).append('\n');
            total += qty[i];
        }
        System.out.print(report);
        System.out.println("Total: " + total);
        String json = """
            {"items": %d}
            """.formatted(names.length);
        System.out.print(json);
    }
}
`,
  "java-scanner-parse": raw`import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("3 apples 5 pears 12 plums");
        int sum = 0;
        List<String> words = new ArrayList<>();
        while (sc.hasNext()) {
            if (sc.hasNextInt()) {
                sum += sc.nextInt();
            } else {
                words.add(sc.next());
            }
        }
        System.out.println("Sum: " + sum);
        System.out.println("Words: " + words);

        Scanner csv = new Scanner("a, b ,c").useDelimiter("\\s*,\\s*");
        List<String> items = new ArrayList<>();
        while (csv.hasNext()) {
            items.add(csv.next());
        }
        System.out.println("Items: " + items);
    }
}
`,
  "java-time-dates": raw`import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2026, 1, 31);
        LocalDate next = start.plusMonths(1);
        System.out.println("Next month: " + next);

        DayOfWeek day = LocalDate.of(2026, 11, 20).getDayOfWeek();
        System.out.println("Day: " + day);

        long days = ChronoUnit.DAYS.between(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));
        System.out.println("Days: " + days);

        Duration duration = Duration.ofMinutes(90);
        System.out.println("Duration: " + duration);

        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        String formatted = LocalDate.of(2026, 11, 20).format(f);
        System.out.println("Formatted: " + formatted);

        LocalDate parsed = LocalDate.parse("05.03.2025", f);
        System.out.println("Parsed: " + parsed);
    }
}
`,
  "java-bigdecimal-invoice": raw`import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        BigDecimal subtotal = new BigDecimal("19.99").multiply(BigDecimal.valueOf(3))
            .add(new BigDecimal("5.50").multiply(BigDecimal.valueOf(2)));
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);
        System.out.println("Subtotal: " + subtotal);
        System.out.println("Tax: " + tax);
        System.out.println("Total: " + total);

        Random random = new Random(42);
        System.out.println("Rolls: " + random.nextInt(100) + " " + random.nextInt(100) + " " + random.nextInt(100));
    }
}
`,
  "java-optional-chain": raw`import java.util.Optional;

public class Main {
    record Address(String city) { }

    record User(String name, Address address) { }

    static String cityOf(User u) {
        return Optional.ofNullable(u).map(User::address).map(Address::city).orElse("unknown");
    }

    static void show(Optional<String> name) {
        name.ifPresentOrElse(n -> System.out.println("present: " + n), () -> System.out.println("absent"));
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
  "java-stream-basics": raw`import java.util.List;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        List<String> words = List.of("java", "stream", "api", "code", "lambda");
        List<String> result = words.stream()
            .filter(w -> w.length() > 3)
            .map(String::toUpperCase)
            .sorted()
            .toList();
        int sum = IntStream.rangeClosed(1, 10).filter(n -> n % 2 == 0).map(n -> n * n).sum();
        boolean hasLong = words.stream().anyMatch(w -> w.length() > 5);
        int maxLength = words.stream().mapToInt(String::length).max().getAsInt();
        System.out.println("Words: " + result);
        System.out.println("Sum: " + sum);
        System.out.println("Has long: " + hasLong);
        System.out.println("Max length: " + maxLength);
    }
}
`,
  "java-stream-collect": raw`import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class Main {
    record Person(String name, String city, int age) { }

    public static void main(String[] args) {
        List<Person> people = List.of(
            new Person("Ira", "Kyiv", 30), new Person("Oleh", "Lviv", 25),
            new Person("Anna", "Kyiv", 22), new Person("Taras", "Lviv", 30));
        Map<String, List<String>> byCity = people.stream().collect(
            Collectors.groupingBy(Person::city, TreeMap::new, Collectors.mapping(Person::name, Collectors.toList())));
        Map<String, Long> counts = people.stream().collect(
            Collectors.groupingBy(Person::city, TreeMap::new, Collectors.counting()));
        Map<String, Double> avg = people.stream().collect(
            Collectors.groupingBy(Person::city, TreeMap::new, Collectors.averagingInt(Person::age)));
        String names = people.stream().map(Person::name).collect(Collectors.joining(", "));
        List<List<String>> tagLists = List.of(List.of("java", "fun"), List.of("java", "lambda"));
        List<String> tags = tagLists.stream().flatMap(List::stream).distinct().sorted().toList();
        System.out.println("By city: " + byCity);
        System.out.println("Count: " + counts);
        System.out.println("Avg: " + avg);
        System.out.println("Names: " + names);
        System.out.println("Tags: " + tags);
    }
}
`,
  "java-regex-extract": raw`import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    static final Pattern ERROR = Pattern.compile("(\\d{4}-\\d{2}-\\d{2}) ERROR (.+)");

    static boolean validEmail(String s) {
        return s.matches("[\\w.]+@[\\w.]+\\.\\w+");
    }

    public static void main(String[] args) {
        List<String> lines = List.of("2026-11-20 ERROR disk full", "2026-11-21 INFO ok", "2026-11-22 ERROR timeout");
        for (String line : lines) {
            Matcher m = ERROR.matcher(line);
            if (m.find()) {
                System.out.println(m.group(1) + ": " + m.group(2));
            }
        }
        System.out.println("Valid: " + validEmail("ira@example.com"));
        System.out.println("Valid: " + validEmail("bad@"));
        String masked = "card 1234 5678".replaceAll("\\d", "*");
        System.out.println("Masked: " + masked);
    }
}
`,
  "java-json-build": raw`import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    static String escape(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\t' -> sb.append("\\t");
                default -> sb.append(c);
            }
        }
        return sb.toString();
    }

    static String toJson(Object v) {
        return switch (v) {
            case null -> "null";
            case String s -> "\"" + escape(s) + "\"";
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
  "java-json-parse": raw`import java.util.ArrayList;
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
  "java-path-ops": raw`import java.nio.file.Path;

public class Main {
    static boolean safe(Path base, String name) {
        return base.resolve(name).normalize().startsWith(base);
    }

    public static void main(String[] args) {
        Path base = Path.of("/data/app");
        Path full = base.resolve("logs/app.log");
        System.out.println("Full: " + full);
        System.out.println("Name: " + full.getFileName());
        System.out.println("Parent: " + full.getParent());
        Path normalized = Path.of("/data/app/../app/x").normalize();
        System.out.println("Normalized: " + normalized);
        System.out.println("Relative: " + base.relativize(full));
        System.out.println("Safe ok.txt: " + safe(base, "ok.txt"));
        System.out.println("Safe ../etc/passwd: " + safe(base, "../etc/passwd"));
    }
}
`,
  "java-unicode-bytes": raw`import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        String word = "\u0457\u0436\u0430\u043a";
        String emoji = "\uD83D\uDE00";
        System.out.println("Chars: " + word.length());
        System.out.println("Bytes: " + word.getBytes(StandardCharsets.UTF_8).length);
        System.out.println("Emoji length: " + emoji.length());
        System.out.println("Emoji code points: " + emoji.codePointCount(0, emoji.length()));
        System.out.println("Emoji bytes: " + emoji.getBytes(StandardCharsets.UTF_8).length);
        boolean same = new String(word.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8).equals(word);
        System.out.println("Roundtrip: " + same);
        double value = 1234567.891;
        System.out.println("US: " + String.format(Locale.US, "%,.2f", value));
        System.out.println("DE: " + String.format(Locale.GERMANY, "%,.2f", value));
    }
}
`,
};
