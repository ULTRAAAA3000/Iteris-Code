// Практичні завдання глави «Тестування й якість» (уроки 86–91). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Тут немає залежності від часу, диска й мережі: тести стенду, випадкові дані з seed і розбір шляхів детерміновані.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "java-project-layout", lesson: "java/86", xp: 25,
    title: "Структура проєкту: вид файла, пакет, клас",
    context: "Інструменти збирання знаходять код за угодою про каталоги: основний код у src/main/java, тести в src/test/java, ресурси в resources. За шляхом файла можна відновити пакет і клас.",
    brief: [
      "Допишіть <code>kindOf</code> (<code>MAIN</code> для <code>src/main/java/...</code>, <code>TEST</code> для <code>src/test/java/...</code>, <code>RESOURCE</code> для <code>src/main|test/resources/...</code>, інакше <code>OTHER</code>), <code>packageOf</code> (каталоги після <code>java/</code> через крапку, а для решти <code>-</code>) і <code>classOf</code> (ім'я файла без <code>.java</code>).",
      "Очікуваний вивід для чотирьох шляхів: <code>... MAIN com.shop.orders OrderService</code> і подібні рядки.",
    ],
    starter: raw`import java.util.List;

public class Main {
    enum Kind { MAIN, TEST, RESOURCE, OTHER }

    static Kind kindOf(String path) {
        // TODO: src/main/java/ MAIN, src/test/java/ TEST, src/main|test/resources/ RESOURCE, інакше OTHER
        return Kind.OTHER;
    }

    static String packageOf(String path) {
        // TODO: для MAIN і TEST: каталоги після "java/" без імені файла, розділені крапками; інакше "-"
        return "-";
    }

    static String classOf(String path) {
        // TODO: ім'я файла; для .java без розширення
        return path;
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
    checks: [
      { on: "stdout", name: "Основний код: MAIN, пакет і клас", has: "OrderService.java: MAIN com.shop.orders OrderService", hint: "Шлях починається з src/main/java/: пакет com.shop.orders, клас OrderService" },
      { on: "stdout", name: "Тест: TEST", has: "OrderServiceTest.java: TEST com.shop.orders OrderServiceTest", hint: "src/test/java/ позначає тестовий код" },
      { on: "stdout", name: "Ресурс і інший файл", has: "application.properties: RESOURCE - application.properties\npom.xml: OTHER - pom.xml", hint: "Для не-Java файлів пакет «-», а клас дорівнює імені файла" },
      { on: "source", name: "Використано startsWith і substring", matches: "startsWith[\\s\\S]*substring|substring[\\s\\S]*startsWith", hint: "path.startsWith(\"src/main/java/\"), path.substring(...)" },
    ],
  },
  {
    ...base, id: "java-mini-test-runner", lesson: "java/87", xp: 35,
    title: "Власний мінімальний тестовий стенд",
    context: "Тестовий фреймворк на ділі простий: запустити тіло тесту, спіймати провал, вивести звіт і порахувати результати. Тут ви напишете його ядро й перевірите код із навмисною помилкою.",
    brief: [
      "Допишіть <code>test(name, body)</code> (виконує <code>body</code>, для <code>AssertionError</code> друкує <code>FAIL name: повідомлення</code>, інакше <code>PASS name</code>, лічить <code>passed</code> і <code>failed</code>), <code>assertEquals(int, int)</code> (кидає <code>AssertionError(\"expected X but was Y\")</code>) та <code>assertThrows(type, body)</code>.",
      "Метод <code>subtract</code> має помилку навмисно: стенд повинен її знайти. Очікуваний вивід: <code>PASS add</code>, <code>PASS divide by zero throws</code>, <code>FAIL subtract: expected 1 but was 5</code>, <code>Passed: 2, Failed: 1</code>.",
    ],
    starter: raw`public class Main {
    static int passed = 0;
    static int failed = 0;

    // TODO: запустіть body; AssertionError означає провал; друкуйте PASS або FAIL і лічіть результати
    static void test(String name, Runnable body) {
    }

    // TODO: кидайте AssertionError("expected " + expected + " but was " + actual)
    static void assertEquals(int expected, int actual) {
    }

    // TODO: body має кинути виняток типу type, інакше AssertionError
    static void assertThrows(Class<? extends Throwable> type, Runnable body) {
    }

    static int add(int a, int b) {
        return a + b;
    }

    static int subtract(int a, int b) {
        return a + b;           // помилка навмисно
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
    checks: [
      { on: "stdout", name: "Успішні тести: PASS", has: "PASS add\nPASS divide by zero throws", hint: "Якщо body.run() не кинув AssertionError, друкуйте PASS name" },
      { on: "stdout", name: "Провал із поясненням", has: "FAIL subtract: expected 1 but was 5", hint: "Повідомлення бере assertEquals: expected 1 but was 5" },
      { on: "stdout", name: "Підсумок: Passed: 2, Failed: 1", has: "Passed: 2, Failed: 1", hint: "Збільшуйте passed або failed у методі test" },
      { on: "source", name: "Ловиться AssertionError", has: "catch (AssertionError", hint: "try { body.run(); ... } catch (AssertionError e) { ... }" },
    ],
  },
  {
    ...base, id: "java-stub-spy", lesson: "java/88", xp: 35,
    title: "Заглушки й spy замість справжнього шлюзу",
    context: "Сервіс замовлень залежить від платіжного шлюзу. У тесті справжній шлюз підміняють заглушками, що завжди погоджуються чи відмовляють, і spy, який записує суми викликів.",
    brief: [
      "Допишіть три реалізації <code>PaymentGateway</code>: <code>AlwaysOk</code> (завжди <code>true</code>), <code>AlwaysDecline</code> (завжди <code>false</code>) і <code>SpyGateway</code> (записує кожну суму в <code>amounts</code> і повертає <code>true</code>).",
      "Очікуваний вивід: <code>PAID</code>, <code>DECLINED</code>, <code>INVALID</code> і <code>Spy calls: [500, 1200]</code> (для суми 0 шлюз не викликається).",
    ],
    starter: raw`import java.util.ArrayList;
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
        return false;      // TODO: завжди true
    }
}

class AlwaysDecline implements PaymentGateway {
    @Override
    public boolean charge(int amountCents) {
        return true;       // TODO: завжди false
    }
}

class SpyGateway implements PaymentGateway {
    final List<Integer> amounts = new ArrayList<>();

    @Override
    public boolean charge(int amountCents) {
        // TODO: запишіть amountCents у amounts і поверніть true
        return false;
    }
}
`,
    checks: [
      { on: "stdout", name: "Заглушка-згода й заглушка-відмова", has: "PAID\nDECLINED\nINVALID", hint: "AlwaysOk повертає true, AlwaysDecline false; для суми 0 сервіс повертає INVALID" },
      { on: "stdout", name: "Spy записав суми викликів", has: "Spy calls: [500, 1200]", hint: "amounts.add(amountCents); return true;" },
      { on: "source", name: "Spy додає суми у список", matches: "amounts\\.add\\(\\s*amountCents\\s*\\)", hint: "amounts.add(amountCents);" },
    ],
  },
  {
    ...base, id: "java-benchmark-helper", lesson: "java/89", xp: 30,
    title: "Помічник для заміру: розминка, повтори, медіана",
    context: "Чесний замір має розминку, кілька повторів і медіану замість одного числа. Результат завдання потрібно «споживати», інакше JIT може викинути обчислення, і виміряється нічого.",
    brief: [
      "Допишіть <code>measure(task, warmup, runs)</code>: спершу <code>warmup</code> запусків без запису, потім <code>runs</code> запусків із записом тривалості (<code>System.nanoTime()</code>) у список. Допишіть <code>median(times)</code> на відсортованій копії.",
      "Завдання виконується 3 + 5 разів, тому <code>executions</code> дорівнює 8, а <code>sink</code> накопичує суму квадратів 8 разів. Очікуваний вивід: <code>Measured runs: 5</code>, <code>Median &gt;= 0: true</code>, <code>Executions: 8</code>, <code>Checksum: 2670668000</code>.",
    ],
    starter: raw`import java.util.ArrayList;
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
        // TODO: warmup запусків без запису, потім runs запусків із записом тривалості
        return new ArrayList<>();
    }

    static long median(List<Long> times) {
        // TODO: відсортуйте копію й поверніть середній елемент
        return -1;
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
    checks: [
      { on: "stdout", name: "Кількість вимірів: «Measured runs: 5»", has: "Measured runs: 5", hint: "Записуйте тривалість лише для runs запусків після розминки" },
      { on: "stdout", name: "Медіана невід'ємна", has: "Median >= 0: true", hint: "Відсортуйте копію списку й візьміть елемент з індексом size() / 2" },
      { on: "stdout", name: "Розминка теж виконує завдання", has: "Executions: 8\nChecksum: 2670668000", hint: "Усього 3 + 5 запусків, і кожен додає 333833500" },
      { on: "source", name: "Використано System.nanoTime", has: "System.nanoTime()", hint: "long start = System.nanoTime(); task.run(); long elapsed = System.nanoTime() - start;" },
    ],
  },
  {
    ...base, id: "java-property-tests", lesson: "java/90", xp: 35,
    title: "Випадкові тести з seed: властивість і контрприклад",
    context: "Тест на властивості перевіряє правило на сотнях випадкових входів. Фіксований seed робить запуск відтворюваним, а помилковий метод швидко знаходиться контрприкладом.",
    brief: [
      "Допишіть <code>isSorted</code> і у двох циклах по 200 ітерацій з <code>new Random(42)</code>: перевірте, що відсортована копія впорядкована й має ту саму довжину, а також знайдіть вхід, на якому <code>buggyMax</code> дає не те, що <code>Collections.max</code>.",
      "Очікуваний вивід: <code>Sorted property: true</code>, <code>Counterexample found: true</code>, <code>Seed: 42</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class Main {
    static boolean isSorted(List<Integer> list) {
        // TODO: кожен елемент не більший за наступний
        return false;
    }

    static int buggyMax(List<Integer> list) {
        return list.get(list.size() - 1);       // помилка навмисно
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
        boolean sortedOk = false;
        // TODO: sortedOk = true; 200 ітерацій: randomList, копія sorted (Collections.sort), перевірка isSorted і розміру
        System.out.println("Sorted property: " + sortedOk);

        random = new Random(42);
        boolean found = false;
        // TODO: до 200 ітерацій: якщо buggyMax(list) != Collections.max(list), found = true і вихід із циклу
        System.out.println("Counterexample found: " + found);
        System.out.println("Seed: 42");
    }
}
`,
    checks: [
      { on: "stdout", name: "Властивість сортування виконується", has: "Sorted property: true", hint: "Для кожного випадкового списку відсортована копія має бути впорядкованою й тієї самої довжини" },
      { on: "stdout", name: "Контрприклад для buggyMax знайдено", has: "Counterexample found: true", hint: "Порівнюйте buggyMax(list) із Collections.max(list)" },
      { on: "stdout", name: "Seed надруковано для відтворення", has: "Seed: 42", hint: "Seed завжди друкують у звіті про результат" },
      { on: "source", name: "Генератор із фіксованим seed", has: "new Random(42)", hint: "Random random = new Random(42);" },
      { on: "source", name: "Є порівняння з Collections.max", has: "Collections.max", hint: "Еталонна реалізація для порівняння" },
    ],
  },
  {
    ...base, id: "java-idioms-refactor", lesson: "java/91", xp: 35,
    title: "Рефакторинг за ідіомами",
    context: "Код працює, але має типові огріхи: null замість значення, порівняння рядків через ==, магічне число й відкритий змінюваний стан. Вивід має лишитися таким самим (крім явного значення замість null).",
    brief: [
      "Виправте: <code>statusText</code> замість <code>null</code> повертає <code>\"UNKNOWN\"</code>; <code>isPaid</code> порівнює через <code>equals</code> (літерал першим); число <code>1.2</code> винесіть у константу <code>TAX_RATE</code> (<code>static final</code>); список імен зробіть <code>private static final</code> і віддавайте копію через <code>List.copyOf</code>.",
      "Очікуваний вивід: <code>NEW</code>, <code>PAID</code>, <code>UNKNOWN</code>, <code>Paid: true</code>, <code>Tax: 120.0</code>, <code>Names: [Ira, Taras]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<String> names = new ArrayList<>();          // відкритий змінюваний статичний стан

    static String statusText(int code) {
        if (code == 1) {
            return "NEW";
        }
        if (code == 2) {
            return "PAID";
        }
        return null;                                        // null замість зрозумілого значення
    }

    static boolean isPaid(String status) {
        return status == "PAID";                            // порівняння посилань
    }

    static double withTax(double price) {
        return price * 1.2;                                 // магічне число
    }

    public static void main(String[] args) {
        names.add("Ira");
        names.add("Taras");
        System.out.println(statusText(1));
        System.out.println(statusText(2));
        System.out.println(statusText(3));
        System.out.println("Paid: " + isPaid(statusText(2)));
        System.out.println("Tax: " + withTax(100));
        System.out.println("Names: " + names);
    }
}
`,
    checks: [
      { on: "stdout", name: "Статуси без null", has: "NEW\nPAID\nUNKNOWN", hint: "return \"UNKNOWN\"; замість return null;" },
      { on: "stdout", name: "Решта виводу не змінилась", has: "Paid: true\nTax: 120.0\nNames: [Ira, Taras]", hint: "Рефакторинг не змінює поведінку" },
      { on: "source", name: "Рядки порівнюються через equals", matches: "\"PAID\"\\.equals\\(|\\.equals\\(\\s*\"PAID\"", hint: "\"PAID\".equals(status)" },
      { on: "source", name: "Порівняння через == прибрано", matches: "==\\s*\"", not: true, hint: "Оператор == порівнює посилання, а не вміст рядків" },
      { on: "source", name: "Немає return null", matches: "return\\s+null\\s*;", not: true, hint: "Повертайте явне значення чи Optional" },
      { on: "source", name: "Є іменована константа TAX_RATE", matches: "static\\s+final\\s+double\\s+TAX_RATE", hint: "static final double TAX_RATE = 0.2;" },
      { on: "source", name: "Список приватний і віддається копією", matches: "private\\s+static\\s+final\\s+List[\\s\\S]*List\\.copyOf", hint: "private static final List<String> NAMES ... List.copyOf(NAMES)" },
    ],
  },
];
