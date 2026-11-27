// Еталонні рішення завдань Java, глава 09 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_09 = {
  "java-project-layout": raw`import java.util.List;

public class Main {
    enum Kind { MAIN, TEST, RESOURCE, OTHER }

    static Kind kindOf(String path) {
        if (path.startsWith("src/main/java/")) {
            return Kind.MAIN;
        }
        if (path.startsWith("src/test/java/")) {
            return Kind.TEST;
        }
        if (path.matches("src/(main|test)/resources/.*")) {
            return Kind.RESOURCE;
        }
        return Kind.OTHER;
    }

    static String packageOf(String path) {
        Kind kind = kindOf(path);
        if (kind != Kind.MAIN && kind != Kind.TEST) {
            return "-";
        }
        String rest = path.substring(path.indexOf("java/") + 5);
        int slash = rest.lastIndexOf('/');
        return slash < 0 ? "-" : rest.substring(0, slash).replace('/', '.');
    }

    static String classOf(String path) {
        String file = path.substring(path.lastIndexOf('/') + 1);
        return file.endsWith(".java") ? file.substring(0, file.length() - 5) : file;
    }

    public static void main(String[] args) {
        List<String> paths = List.of(
            "src/main/java/com/shop/orders/OrderService.java",
            "src/test/java/com/shop/orders/OrderServiceTest.java",
            "src/main/resources/application.properties",
            "pom.xml");
        for (String p : paths) {
            System.out.println(p + ": " + kindOf(p) + " " + packageOf(p) + " " + classOf(p));
        }
    }
}
`,
  "java-mini-test-runner": raw`public class Main {
    static int passed = 0;
    static int failed = 0;

    static void test(String name, Runnable body) {
        try {
            body.run();
            passed++;
            System.out.println("PASS " + name);
        } catch (AssertionError e) {
            failed++;
            System.out.println("FAIL " + name + ": " + e.getMessage());
        }
    }

    static void assertEquals(int expected, int actual) {
        if (expected != actual) {
            throw new AssertionError("expected " + expected + " but was " + actual);
        }
    }

    static void assertThrows(Class<? extends Throwable> type, Runnable body) {
        try {
            body.run();
        } catch (Throwable t) {
            if (type.isInstance(t)) {
                return;
            }
            throw new AssertionError("expected " + type.getSimpleName() + " but got " + t.getClass().getSimpleName());
        }
        throw new AssertionError("expected " + type.getSimpleName() + " but nothing was thrown");
    }

    static int add(int a, int b) {
        return a + b;
    }

    static int subtract(int a, int b) {
        return a + b;
    }

    static int divide(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        test("add", () -> assertEquals(5, add(2, 3)));
        test("divide by zero throws", () -> assertThrows(ArithmeticException.class, () -> divide(1, 0)));
        test("subtract", () -> assertEquals(1, subtract(3, 2)));
        System.out.println("Passed: " + passed + ", Failed: " + failed);
    }
}
`,
  "java-stub-spy": raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println(new OrderService(new AlwaysOk()).checkout(500));
        System.out.println(new OrderService(new AlwaysDecline()).checkout(500));
        SpyGateway spy = new SpyGateway();
        OrderService service = new OrderService(spy);
        System.out.println(service.checkout(0));
        service.checkout(500);
        service.checkout(1200);
        System.out.println("Spy calls: " + spy.amounts);
    }
}

interface PaymentGateway {
    boolean charge(int amountCents);
}

class OrderService {
    private final PaymentGateway gateway;

    OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    String checkout(int amountCents) {
        if (amountCents <= 0) {
            return "INVALID";
        }
        return gateway.charge(amountCents) ? "PAID" : "DECLINED";
    }
}

class AlwaysOk implements PaymentGateway {
    @Override
    public boolean charge(int amountCents) {
        return true;
    }
}

class AlwaysDecline implements PaymentGateway {
    @Override
    public boolean charge(int amountCents) {
        return false;
    }
}

class SpyGateway implements PaymentGateway {
    final List<Integer> amounts = new ArrayList<>();

    @Override
    public boolean charge(int amountCents) {
        amounts.add(amountCents);
        return true;
    }
}
`,
  "java-benchmark-helper": raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    static long sink;
    static int executions;

    static long sumSquares() {
        long s = 0;
        for (int i = 1; i <= 1000; i++) {
            s += (long) i * i;
        }
        return s;
    }

    static List<Long> measure(Runnable task, int warmup, int runs) {
        for (int i = 0; i < warmup; i++) {
            task.run();
        }
        List<Long> times = new ArrayList<>();
        for (int i = 0; i < runs; i++) {
            long start = System.nanoTime();
            task.run();
            times.add(System.nanoTime() - start);
        }
        return times;
    }

    static long median(List<Long> times) {
        List<Long> sorted = new ArrayList<>(times);
        Collections.sort(sorted);
        return sorted.get(sorted.size() / 2);
    }

    public static void main(String[] args) {
        Runnable task = () -> {
            sink += sumSquares();
            executions++;
        };
        List<Long> times = measure(task, 3, 5);
        System.out.println("Warmup runs: 3");
        System.out.println("Measured runs: " + times.size());
        System.out.println("Median >= 0: " + (median(times) >= 0));
        System.out.println("Executions: " + executions);
        System.out.println("Checksum: " + sink);
    }
}
`,
  "java-property-tests": raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class Main {
    static boolean isSorted(List<Integer> list) {
        for (int i = 1; i < list.size(); i++) {
            if (list.get(i - 1) > list.get(i)) {
                return false;
            }
        }
        return true;
    }

    static int buggyMax(List<Integer> list) {
        return list.get(list.size() - 1);
    }

    static List<Integer> randomList(Random random) {
        List<Integer> list = new ArrayList<>();
        for (int j = 1 + random.nextInt(5); j > 0; j--) {
            list.add(random.nextInt(10));
        }
        return list;
    }

    public static void main(String[] args) {
        Random random = new Random(42);
        boolean sortedOk = true;
        for (int i = 0; i < 200; i++) {
            List<Integer> list = randomList(random);
            List<Integer> sorted = new ArrayList<>(list);
            Collections.sort(sorted);
            sortedOk &= isSorted(sorted) && sorted.size() == list.size();
        }
        System.out.println("Sorted property: " + sortedOk);

        random = new Random(42);
        boolean found = false;
        for (int i = 0; i < 200 && !found; i++) {
            List<Integer> list = randomList(random);
            if (buggyMax(list) != Collections.max(list)) {
                found = true;
            }
        }
        System.out.println("Counterexample found: " + found);
        System.out.println("Seed: 42");
    }
}
`,
  "java-idioms-refactor": raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static final double TAX_RATE = 0.2;
    private static final List<String> NAMES = new ArrayList<>();

    static List<String> names() {
        return List.copyOf(NAMES);
    }

    static String statusText(int code) {
        if (code == 1) {
            return "NEW";
        }
        if (code == 2) {
            return "PAID";
        }
        return "UNKNOWN";
    }

    static boolean isPaid(String status) {
        return "PAID".equals(status);
    }

    static double withTax(double price) {
        return price * (1 + TAX_RATE);
    }

    public static void main(String[] args) {
        NAMES.add("Ira");
        NAMES.add("Taras");
        System.out.println(statusText(1));
        System.out.println(statusText(2));
        System.out.println(statusText(3));
        System.out.println("Paid: " + isPaid(statusText(2)));
        System.out.println("Tax: " + withTax(100));
        System.out.println("Names: " + names());
    }
}
`,
};
