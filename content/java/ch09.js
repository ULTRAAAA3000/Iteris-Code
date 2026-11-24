export const LESSONS_09 = [
  {
    t: "Структура проєкту: пакети, Maven і Gradle",
    ch: "Тестування й якість",
    easy: String.raw`Проєкт схожий на будинок із кімнатами за призначенням: код в одній, тести в іншій, ресурси в третій, а Maven чи Gradle — домовласник, який знає, де що лежить і яке обладнання потрібне для роботи.`,
    p: [
      String.raw`У реальному проєкті немає одного файла Main.java: код розкладено по пакетах і модулях, а збирають його інструментами Maven або Gradle. Вони компілюють код, завантажують залежності (бібліотеки), запускають тести, пакують результат у <code>.jar</code> і ведуть версії. Спільна ідея — угода про структуру каталогів, щоб інструмент і колеги знали, де що шукати, без довгих пояснень.`,
      String.raw`Стандартна структура (однакова для Maven і Gradle): <code>src/main/java</code> — основний код; <code>src/main/resources</code> — ресурси (конфігурації, шаблони); <code>src/test/java</code> — тести; <code>src/test/resources</code> — ресурси тестів. Пакети відповідають каталогам: клас <code>com.shop.orders.OrderService</code> лежить у файлі <code>src/main/java/com/shop/orders/OrderService.java</code>. Результат збирання потрапляє в <code>target</code> (Maven) чи <code>build</code> (Gradle) і не потрапляє в систему контролю версій.`,
      String.raw`Maven описує проєкт у файлі <code>pom.xml</code>: координати (<code>groupId</code>, <code>artifactId</code>, <code>version</code>), версія Java, залежності, плагіни. Життєвий цикл: <code>mvn compile</code>, <code>mvn test</code>, <code>mvn package</code>, <code>mvn clean install</code>. Залежності підтягуються з центрального репозиторію Maven Central, а транзитивні залежності (залежності ваших залежностей) — автоматично, що зручно, але потребує уваги до версій.`,
      String.raw`Gradle описує збирання скриптом (<code>build.gradle</code> на Groovy чи <code>build.gradle.kts</code> на Kotlin): плагіни (<code>java</code>, <code>application</code>), репозиторії, залежності, налаштування. Команди: <code>gradle build</code>, <code>gradle test</code>, <code>gradle run</code>. Gradle гнучкіший і швидший завдяки кешуванню й інкрементальній збірці; Maven простіший і декларативніший. Обидва широко використовуються, а середовища розробки розуміють обидва.`,
      String.raw`Залежності мають область дії: <code>compile</code> (потрібні скрізь), <code>test</code> (лише для тестів, наприклад JUnit), <code>runtime</code>, <code>provided</code>. Версії фіксують, щоб збірка була відтворюваною; для узгодженості версій використовують BOM (bill of materials) або каталоги версій. Конфлікти версій (дві бібліотеки потребують різних версій третьої) — класична проблема, яку діагностують командами <code>mvn dependency:tree</code> і <code>gradle dependencies</code>.`,
      String.raw`Модулі: великий проєкт ділять на кілька підпроєктів (api, service, web), кожен із власним збиранням, але з однією командою для всіх (multi-module у Maven, multi-project у Gradle). Також існують Java-модулі (JPMS, файл <code>module-info.java</code>), що обмежують доступ між пакетами, але в прикладних проєктах їх використовують рідше. Для запуску застосунку потрібен клас із <code>main</code> і метадані в маніфесті архіву jar.`,
      String.raw`Правила пакетів: назва починається з перевернутого домену, малими літерами й без підкреслень; пакети групують за функціями (<code>orders</code>, <code>payments</code>) чи за шарами (<code>controller</code>, <code>service</code>, <code>repository</code>); залежності мають іти в одному напрямку, без циклів між пакетами. Класи, які не повинні бути публічними, роблять package-private: так межі пакета працюють як інкапсуляція.`,
    ],
    code: [
      String.raw`// фрагмент: pom.xml (Maven), мінімальний проєкт із JUnit
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.shop</groupId>
  <artifactId>orders</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>`,
      String.raw`// фрагмент: build.gradle.kts (Gradle, Kotlin DSL)
plugins {
    java
    application
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(21))
}

application {
    mainClass.set("com.shop.orders.Main")
}

tasks.test {
    useJUnitPlatform()
}`,
      String.raw`// фрагмент: стандартна структура каталогів проєкту
orders/
  pom.xml                      (або build.gradle.kts)
  src/
    main/
      java/com/shop/orders/OrderService.java
      resources/application.properties
    test/
      java/com/shop/orders/OrderServiceTest.java
      resources/test-data.json
  target/                      (або build/): результат збирання, у git не додають`,
      String.raw`public class Main {
    public static void main(String[] args) {
        // клас без оголошення пакета лежить у «безіменному» пакеті, а клас JDK має пакет java.lang
        System.out.println("[" + Main.class.getPackageName() + "]");
        System.out.println(String.class.getPackageName());
        System.out.println(java.util.List.class.getName());
        System.out.println(java.util.Map.Entry.class.getSimpleName());
    }
}`,
      String.raw`// не компілюється: публічний клас Other має лежати у власному файлі Other.java
public class Main {
    public static void main(String[] args) {
        System.out.println(new Other());
    }
}

public class Other {
}`,
    ],
    note: String.raw`Код лежить у <code>src/main/java</code>, тести в <code>src/test/java</code>, а пакет відповідає каталогу. Maven описує збирання в <code>pom.xml</code>, Gradle — у скрипті; обидва підтягують залежності й запускають тести. Версії залежностей фіксують.`,
    work: String.raw`Уміння зорієнтуватися в структурі проєкту, знайти pom.xml чи build.gradle, запустити збірку й зрозуміти конфлікт залежностей — перше, чого вимагає нова робота. Також розуміння, де лежать тести й ресурси, економить години під час знайомства з чужим репозиторієм.`,
    tasks: [
      String.raw`Де за стандартною структурою лежить код тесту для класу com.shop.OrderService?`,
      String.raw`Для чого потрібна область залежності test?`,
    ],
  },
  {
    t: "assert і власний мінімальний тестовий стенд",
    ch: "Тестування й якість",
    easy: String.raw`Тест — це контрольна робота для коду: ви наперед пишете питання й правильні відповіді, а програма сама перевіряє, чи код їм відповідає. Власний міні-стенд показує, що всередині будь-якого тестового фреймворка немає магії.`,
    p: [
      String.raw`Автоматичний тест викликає код із відомими вхідними даними й порівнює результат з очікуваним. Він захищає від регресій: коли хтось змінює код, тести одразу показують, що зламалося. Без тестів кожна зміна є ризиком, і її доводиться перевіряти вручну. Тести також є документацією: за ними видно, як код має поводитися в різних ситуаціях, зокрема на межах.`,
      String.raw`Найпростіша перевірка — <code>assert умова : "повідомлення"</code>. Але <code>assert</code> вимкнено за замовчуванням (його вмикають прапорцем <code>-ea</code>), тому у власному «стенді» ми кидаємо власні <code>AssertionError</code>: <code>throw new AssertionError("expected 5 but was 4")</code>. <code>AssertionError</code> є <code>Error</code>, тож його не ловлять випадково під час звичайної обробки винятків, і він чітко відрізняється від помилок самої програми.`,
      String.raw`Структура тесту AAA: Arrange (підготувати дані), Act (викликати), Assert (перевірити). Одна поведінка — один тест, а назва розповідає, що перевіряється: <code>divideByZeroThrows</code> краще за <code>test1</code>. Тест має бути детермінованим (без залежності від часу, випадковості й порядку), швидким і незалежним від інших тестів, інакше він стане джерелом «плаваючих» збоїв.`,
      String.raw`Мінімальний тестовий стенд: метод <code>test(String name, Runnable body)</code> запускає тіло, ловить <code>AssertionError</code> (провал) та інші винятки (помилка), лічить результати й друкує звіт. Допоміжні методи <code>assertEquals(expected, actual)</code> і <code>assertTrue(condition)</code> кидають <code>AssertionError</code> із поясненням. Для винятків є <code>assertThrows(Class, Runnable)</code>. Це приблизно те, що роблять JUnit і TestNG, лише без анотацій.`,
      String.raw`Табличні тести (table-driven): дані подають як список рядків таблиці (<code>record Case(String input, String expected)</code>), а один цикл перевіряє всі. Так легко додавати нові випадки, а звіт показує, який саме випадок провалився. Для граничних значень (порожній рядок, нуль, мінус один, максимум) правило просте: кожну межу окремим рядком таблиці, і ніколи не покладайтеся на те, що «середній» приклад покриє крайні.`,
      String.raw`Що тестувати: основні сценарії, граничні випадки, помилки й винятки, які можна відтворити. Чого не тестувати: тривіальні геттери, код фреймворку, приватні деталі: перевіряйте поведінку через публічний інтерфейс. Тест, що ламається після рефакторингу без зміни поведінки, прив'язаний до реалізації й шкодить, бо відлякує від покращення коду.`,
      String.raw`Хороший звіт повідомляє, що саме не так: «expected 5 but was 4», а не просто «FAIL». Код повернення процесу (ненульовий при провалі) дозволяє серверу збірки зупинити конвеєр. У JUnit це робить фреймворк, а в нашому стенді можна завершити програму через <code>System.exit(1)</code>; у навчальних завданнях цього не роблять, щоб не обривати вивід.`,
    ],
    code: [
      String.raw`public class Main {
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

    public static void main(String[] args) {
        test("addition", () -> assertEquals(5, 2 + 3));
        test("subtraction", () -> assertEquals(1, 3 - 2));
        test("wrong on purpose", () -> assertEquals(7, 2 * 3));
        System.out.println("Passed: " + passed + ", Failed: " + failed);
    }
}`,
      String.raw`import java.util.List;

public class Main {
    record Case(String input, String expected) { }

    static String slugify(String s) {
        return s.trim().toLowerCase().replaceAll("\\s+", "-");
    }

    public static void main(String[] args) {
        List<Case> cases = List.of(
            new Case("Hello World", "hello-world"),
            new Case("  padded  ", "padded"),
            new Case("a  b   c", "a-b-c"),
            new Case("", ""));
        int failures = 0;
        for (Case c : cases) {
            String actual = slugify(c.input());
            if (!actual.equals(c.expected())) {
                failures++;
                System.out.println("FAIL [" + c.input() + "] expected [" + c.expected() + "] but was [" + actual + "]");
            }
        }
        System.out.println("failures: " + failures);
    }
}`,
      String.raw`public class Main {
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

    public static void main(String[] args) {
        assertThrows(ArithmeticException.class, () -> System.out.println(1 / (args.length)));
        assertThrows(NumberFormatException.class, () -> Integer.parseInt("x"));
        System.out.println("all assertThrows passed");
    }
}`,
      String.raw`// аварія: перевірка не пройшла, AssertionError не спійманий і завершує програму
public class Main {
    static void assertEquals(int expected, int actual) {
        if (expected != actual) {
            throw new AssertionError("expected " + expected + " but was " + actual);
        }
    }

    public static void main(String[] args) {
        assertEquals(4, 2 + 2);
        System.out.println("first check passed");
        assertEquals(5, 2 + 2);
    }
}`,
      String.raw`// не компілюється: тіло лямбди 5 не є оператором, а Runnable не повертає значення
public class Main {
    static void run(Runnable body) {
        body.run();
    }

    public static void main(String[] args) {
        run(() -> 5);
    }
}`,
    ],
    note: String.raw`Тест має три частини: підготувати, виконати, перевірити. Він повинен бути детермінованим і незалежним, а назва — розповідати, що перевіряється. <code>assert</code> вимкнений за замовчуванням, тому тестові перевірки кидають власний <code>AssertionError</code>.`,
    work: String.raw`Тести — обов'язкова вимога в професійних проєктах: pull request без тестів зазвичай не приймають. Розуміння того, як тестовий фреймворк влаштований зсередини, допомагає читати помилки JUnit, писати власні розширення й краще розуміти, чому тест падає саме так.`,
    tasks: [
      String.raw`Чим <code>assert</code> відрізняється від власного методу <code>assertEquals</code>, що кидає <code>AssertionError</code>?`,
      String.raw`Що таке табличні тести й чим вони зручні?`,
    ],
  },
  {
    t: "JUnit 5, заглушки й підміна залежностей",
    ch: "Тестування й якість",
    easy: String.raw`Заглушка — це дублер у кіно: він виходить замість зірки в небезпечній сцені. Код, що залежить від банку чи годинника, отримує «дублера» з наперед відомою поведінкою, і тест не залежить від справжніх систем.`,
    p: [
      String.raw`JUnit 5 — найпоширеніша бібліотека тестів для Java. Тест — це метод з анотацією <code>@Test</code> у класі з каталогу <code>src/test/java</code>. Перевірки — статичні методи <code>Assertions</code>: <code>assertEquals</code>, <code>assertTrue</code>, <code>assertThrows</code>, <code>assertAll</code>. Підготовка й завершення — <code>@BeforeEach</code>, <code>@AfterEach</code>, <code>@BeforeAll</code>, <code>@AfterAll</code>. Запуск — командою <code>mvn test</code> чи <code>gradle test</code> або кнопкою в середовищі розробки.`,
      String.raw`Корисні анотації: <code>@DisplayName("...")</code> дає читабельну назву, <code>@Disabled</code> вимикає тест, <code>@Nested</code> групує, <code>@Timeout</code> обмежує час, <code>@Tag</code> позначає (повільні, інтеграційні). Параметризовані тести (<code>@ParameterizedTest</code> з <code>@CsvSource</code>) замінюють табличні тести, написані вручну. Тести не повинні залежати від порядку виконання, а кожен має створювати власні дані: спільний стан — головна причина «плаваючих» тестів.`,
      String.raw`Залежності ускладнюють тестування: сервіс замовлень викликає платіжний шлюз, годинник, базу, а під час тесту не можна реально списувати гроші. Рішення — інверсія залежностей: клас отримує залежність через конструктор як інтерфейс (<code>PaymentGateway</code>), а в тесті підставляється заміна. Без інтерфейсу й конструктора підмінити нічого не вдасться, тому такий дизайн варто робити з самого початку.`,
      String.raw`Види замін (test doubles): <b>stub</b> повертає заготовлені відповіді; <b>fake</b> — спрощена робоча реалізація (мапа в пам'яті замість бази); <b>spy</b> запам'ятовує, як його викликали; <b>mock</b> перевіряє очікувані виклики; <b>dummy</b> — заповнювач, який не використовується. Для простих випадків їх пишуть вручну як невеликі класи чи лямбди, для складних користуються бібліотеками (Mockito).`,
      String.raw`Приклад: <code>OrderService(PaymentGateway gateway)</code>. У тесті <code>PaymentGateway</code> — заглушка, що повертає успіх чи відмову, і тест перевіряє результат (статус замовлення). Якщо потрібно переконатися, що шлюз викликали один раз із правильною сумою, замість заглушки беруть spy, який записує аргументи викликів. Так тест залишається швидким, детермінованим і не залежить від мережі.`,
      String.raw`Mockito дозволяє створювати заміни на льоту: <code>mock(PaymentGateway.class)</code>, <code>when(gateway.charge(100)).thenReturn(true)</code>, <code>verify(gateway).charge(100)</code>. Це зручно, але надмірні моки ведуть до тестів, що знають забагато про реалізацію. Рекомендація: перевіряти поведінку й результати, а не кожен внутрішній виклик, і використовувати fake там, де це можливо.`,
      String.raw`Піраміда тестів: багато швидких модульних тестів, менше інтеграційних (з реальною базою чи мережею), ще менше наскрізних. Модульні тести підміняють зовнішні системи; інтеграційні перевіряють, що вони справді працюють разом. Обидва типи потрібні, але співвідношення визначає швидкість і надійність збірки, тому тримайте основну масу перевірок на нижньому рівні піраміди. Якщо ж повільних тестів стає більше за швидкі, збірка перетворюється на очікування, і розробники починають її обходити, що знецінює всі тести.`,
    ],
    code: [
      String.raw`// фрагмент: тестовий клас JUnit 5 (потрібна залежність junit-jupiter)
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CalculatorTest {
    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();
    }

    @Test
    void addsTwoNumbers() {
        assertEquals(5, calc.add(2, 3));
    }

    @Test
    void divisionByZeroThrows() {
        assertThrows(ArithmeticException.class, () -> calc.divide(1, 0));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        OrderService ok = new OrderService(amount -> true);        // stub: завжди успіх
        OrderService declined = new OrderService(amount -> false); // stub: завжди відмова
        System.out.println(ok.checkout(500));
        System.out.println(declined.checkout(500));
        System.out.println(ok.checkout(0));
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
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        SpyGateway spy = new SpyGateway();
        OrderService service = new OrderService(spy);
        service.checkout(500);
        service.checkout(1200);
        service.checkout(-5);
        System.out.println(spy.amounts);          // spy запам'ятав усі виклики
    }
}

interface PaymentGateway {
    boolean charge(int amountCents);
}

class SpyGateway implements PaymentGateway {
    final List<Integer> amounts = new ArrayList<>();

    @Override
    public boolean charge(int amountCents) {
        amounts.add(amountCents);
        return true;
    }
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
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        UserRepository repo = new InMemoryUserRepository();    // fake: робоча реалізація в пам'яті
        repo.save(1, "Ira");
        repo.save(2, "Taras");
        System.out.println(repo.find(1) + " " + repo.find(3));
    }
}

interface UserRepository {
    void save(int id, String name);

    String find(int id);
}

class InMemoryUserRepository implements UserRepository {
    private final Map<Integer, String> data = new HashMap<>();

    @Override
    public void save(int id, String name) {
        data.put(id, name);
    }

    @Override
    public String find(int id) {
        return data.getOrDefault(id, "unknown");
    }
}`,
      String.raw`// не компілюється: заглушка не реалізувала метод charge інтерфейсу PaymentGateway
public class Main {
    public static void main(String[] args) {
        PaymentGateway gateway = new BrokenStub();
        System.out.println(gateway.charge(100));
    }
}

interface PaymentGateway {
    boolean charge(int amountCents);
}

class BrokenStub implements PaymentGateway {
}`,
    ],
    note: String.raw`Залежності (шлюз, годинник, база) передають через конструктор як інтерфейси, тоді тест підставляє stub, fake чи spy. Не перевіряйте кожен внутрішній виклик: тест має перевіряти поведінку, а не реалізацію.`,
    work: String.raw`У команді майже кожен сервіс має шар тестів із підміною зовнішніх систем: платіжні шлюзи, пошта, час. Хороший дизайн із залежностями через конструктор робить тести швидкими й стабільними, а помилки інтеграції виявляє окремий невеликий набір повільніших перевірок.`,
    tasks: [
      String.raw`Чим stub відрізняється від spy і fake?`,
      String.raw`Чому залежності краще передавати через конструктор як інтерфейси?`,
    ],
  },
  {
    t: "Бенчмарки: чому наївний замір бреше",
    ch: "Тестування й якість",
    adv: true,
    easy: String.raw`Заміряти швидкість — це як засікати час забігу: якщо людина щойно прокинулась і не розім'ялась, результат буде гіршим, ніж через годину. JVM теж має розминку, і наївний секундомір бреше.`,
    p: [
      String.raw`Типовий наївний замір: <code>long t = System.nanoTime(); doWork(); System.out.println(System.nanoTime() - t);</code>. Результат нестабільний і часто хибний. Причини: JVM компілює гарячий код у машинний під час виконання (JIT), тому перші запуски повільні; збирач сміття вмикається в довільний момент; операційна система перемикає потоки; кеші процесора заповнюються поступово. Один замір майже нічого не доводить.`,
      String.raw`Розминка (warm-up): перед виміром код запускають багато разів, щоб JIT його скомпілював. Потім вимірюють кілька серій і дивляться на розподіл (медіана, мінімум, відсотки), а не на одне число. Перший запуск програми — найповільніший, і саме його новачки зазвичай вимірюють. Також користуйтеся <code>System.nanoTime()</code> (монотонний), а не <code>currentTimeMillis()</code>, який залежить від системного годинника й може стрибати.`,
      String.raw`Усунення мертвого коду: якщо результат обчислення ніде не використовується, JIT може викинути все обчислення, і ви виміряєте «нічого». Тому результат потрібно «спожити»: накопичувати в змінну й вивести або записати в поле (у JMH для цього є <code>Blackhole</code>). Так само константи, відомі під час компіляції, JIT може обчислити наперед, а цикл із незмінним результатом — згорнути.`,
      String.raw`Інші спотворення: вбудовування методів (inlining) залежить від профілю виклику; передбачення розгалужень поводиться по-різному для різних даних; розмір даних впливає на кеш; паралельне навантаження змінює результат. Вимірюйте в умовах, схожих на реальні (дані, розміри, кількість потоків), а не на ідеальних іграшкових прикладах, бо швидкість на малих даних не переноситься на великі.`,
      String.raw`JMH (Java Microbenchmark Harness) — стандартний інструмент для мікробенчмарків від розробників JVM. Анотації <code>@Benchmark</code>, <code>@Warmup</code>, <code>@Measurement</code>, <code>@Fork</code>, <code>@State</code>, <code>@BenchmarkMode</code>. Він запускає кожен тест в окремому процесі, розігріває, багаторазово вимірює й виводить статистику з похибкою. Ручні секундоміри для серйозних порівнянь — прямий шлях до неправильних висновків.`,
      String.raw`Мікробенчмарки відповідають на вузькі питання («що швидше в цьому циклі: StringBuilder чи конкатенація?»), але не на питання про продуктивність системи. Для цього використовують профайлери (JFR, async-profiler, VisualVM), навантажувальне тестування й метрики в продакшні. Оптимізація без вимірювань — гадання: спершу виміряйте, де витрачається час, а потім оптимізуйте найповільніше місце.`,
      String.raw`Правила: оптимізуйте лише виміряні вузькі місця; порівнюйте варіанти на однакових даних; повторюйте виміри й дивіться на розкид; фіксуйте версію JDK і параметри; не вірте одному запуску. «Передчасна оптимізація — корінь усього зла»: спершу правильність і читабельність, а швидкість — там, де це справді потрібно й підтверджено вимірюванням.`,
    ],
    code: [
      String.raw`public class Main {
    static long work() {
        long sum = 0;
        for (int i = 1; i <= 1000; i++) {
            sum += (long) i * i;
        }
        return sum;
    }

    public static void main(String[] args) {
        long start = System.nanoTime();
        long result = work();
        long elapsed = System.nanoTime() - start;
        System.out.println(result);                    // результат використано
        System.out.println(elapsed >= 0);              // сам час нестабільний, тому його не друкуємо
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    static long sink;

    static long measureOnce(Runnable task) {
        long start = System.nanoTime();
        task.run();
        return System.nanoTime() - start;
    }

    public static void main(String[] args) {
        Runnable task = () -> {
            long s = 0;
            for (int i = 1; i <= 100_000; i++) {
                s += i % 7;
            }
            sink += s;                                 // споживаємо результат
        };
        for (int i = 0; i < 5; i++) {
            measureOnce(task);                         // розминка
        }
        List<Long> times = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            times.add(measureOnce(task));
        }
        Collections.sort(times);
        long median = times.get(times.size() / 2);
        System.out.println(median >= 0);
        System.out.println(sink);
    }
}`,
      String.raw`public class Main {
    static int[] data = new int[10_000];

    static int sumLoop() {
        int s = 0;
        for (int x : data) {
            s += x;
        }
        return s;
    }

    static int sumStream() {
        return java.util.Arrays.stream(data).sum();
    }

    public static void main(String[] args) {
        for (int i = 0; i < data.length; i++) {
            data[i] = i % 10;
        }
        // порівнюємо варіанти на однакових даних і переконуємося, що результати збігаються
        System.out.println(sumLoop() == sumStream());
        System.out.println(sumLoop());
    }
}`,
      String.raw`public class Main {
    static long cache;

    static void naive() {
        long unused = 0;                    // результат нікуди не йде: JIT може викинути цикл
        for (int i = 0; i < 1_000_000; i++) {
            unused += i;
        }
    }

    static void honest() {
        long used = 0;
        for (int i = 0; i < 1_000_000; i++) {
            used += i;
        }
        cache = used;                       // «споживаємо» результат, щоб обчислення не зникло
    }

    public static void main(String[] args) {
        naive();
        honest();
        System.out.println(cache);
    }
}`,
      String.raw`// не компілюється: currentTimeMillis це метод, а тут забули дужки
public class Main {
    public static void main(String[] args) {
        long start = System.currentTimeMillis;
        System.out.println(start);
    }
}`,
    ],
    note: String.raw`Наївний секундомір бреше: JIT, збирач сміття й кеші змінюють швидкість. Розігрівайте код, вимірюйте багато разів, дивіться на медіану й «споживайте» результат, щоб JIT не викинув обчислення. Для серйозних порівнянь використовуйте JMH.`,
    work: String.raw`Помилки в мікробенчмарках призводили до «оптимізацій», що нічого не прискорювали чи навіть уповільнювали код. У професійних командах продуктивність перевіряють профайлерами й навантажувальними тестами, а мікробенчмарки з JMH застосовують лише там, де вони справді потрібні.`,
    tasks: [
      String.raw`Чому перший вимір часу виконання майже завжди гірший за наступні?`,
      String.raw`Що таке «мертвий код» у мікробенчмарку і як від нього захиститися?`,
    ],
  },
  {
    t: "Випадкові тести з фіксованим seed",
    ch: "Тестування й якість",
    adv: true,
    easy: String.raw`Випадкові тести — це перевірка калькулятора на сотнях випадкових прикладів замість кількох вигаданих. А фіксований seed дозволяє повторити саме той невдалий випадок, який знайшов тест.`,
    p: [
      String.raw`Звичайні тести перевіряють кілька прикладів, які придумав автор, і він майже завжди обходить власні помилки. Тести на властивості (property-based) перевіряють загальні правила на багатьох випадкових вхідних даних: «сортування повертає впорядкований список тієї самої довжини», «розбір після форматування повертає початкове значення», «додавання комутативне». Вони знаходять випадки, про які ніхто не подумав.`,
      String.raw`Для відтворюваності генератор випадкових даних має мати фіксований seed: <code>new Random(42)</code>. Тоді тест щоразу бачить ті самі «випадкові» дані, і збій можна відтворити. Якщо хочете різноманітності, генеруйте seed окремо (з часу), але обов'язково друкуйте його в повідомленні про провал: «failed with seed 8731», щоб можна було повторити запуск і налагодити помилку.`,
      String.raw`Структура: цикл на N ітерацій; на кожній ітерації згенерувати вхідні дані (<code>randomList(random, maxSize)</code>), викликати код і перевірити властивість; при провалі показати вхід, що його спричинив. Допоміжні функції генерації — це «мова» вашого тесту: списки різних розмірів, рядки з цікавих символів (порожні, з пробілами, юнікод), числа на межах (0, мінус один, максимум).`,
      String.raw`Типові властивості: ідемпотентність (<code>f(f(x)) == f(x)</code>, наприклад нормалізація), інволюція (<code>reverse(reverse(x)) == x</code>), round-trip (<code>decode(encode(x)) == x</code>), інваріанти (сума після переказу незмінна), еквівалентність двох реалізацій (швидкої й простої «еталонної») та відсутність винятків на будь-яких допустимих даних. Знайти властивість — головна навичка такого тестування.`,
      String.raw`Скорочення контрприкладу (shrinking): якщо тест провалився на списку з 50 елементів, зрозуміти причину важко. Фреймворки автоматично зменшують вхід (видаляють елементи, зменшують числа), поки збій не лишається на мінімальному прикладі. Для власного тесту можна почати з малих розмірів (від 0 до 5) і поступово збільшувати: малий контрприклад з'явиться першим і буде найкорисніший.`,
      String.raw`Бібліотеки: jqwik, junit-quickcheck, QuickTheories для Java; ідея походить із Haskell QuickCheck. Вони дають генератори, скорочення й інтеграцію з JUnit. Але базові ідеї доступні з <code>Random</code> і звичайним циклом, і саме з цього корисно починати: ви побачите механізм, а не лише чорну скриньку.`,
      String.raw`Обмеження: випадкові тести не замінюють осмислених прикладів, а доповнюють їх. Властивість має бути чітко сформульована, а генератор — давати реалістичні дані, а не лише «сміття». Також час виконання має бути обмежений (сотні ітерацій, а не мільйони), а результат детермінований, інакше тест у конвеєрі стане джерелом шуму.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
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

    public static void main(String[] args) {
        Random random = new Random(42);
        boolean ok = true;
        for (int i = 0; i < 200; i++) {
            List<Integer> list = new ArrayList<>();
            int size = random.nextInt(6);
            for (int j = 0; j < size; j++) {
                list.add(random.nextInt(10));
            }
            List<Integer> sorted = new ArrayList<>(list);
            Collections.sort(sorted);
            ok &= isSorted(sorted) && sorted.size() == list.size();
        }
        System.out.println("sort property: " + ok);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random random = new Random(7);
        boolean involution = true;
        for (int i = 0; i < 100; i++) {
            List<Integer> list = new ArrayList<>();
            for (int j = random.nextInt(8); j > 0; j--) {
                list.add(random.nextInt(100));
            }
            List<Integer> copy = new ArrayList<>(list);
            Collections.reverse(copy);
            Collections.reverse(copy);
            involution &= copy.equals(list);              // reverse двічі дає початковий список
        }
        System.out.println(involution);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class Main {
    static int buggyMax(List<Integer> list) {
        return list.get(list.size() - 1);            // помилка: повертає останній, а не найбільший
    }

    public static void main(String[] args) {
        Random random = new Random(42);
        boolean found = false;
        for (int i = 0; i < 200 && !found; i++) {
            List<Integer> list = new ArrayList<>();
            for (int j = 1 + random.nextInt(5); j > 0; j--) {
                list.add(random.nextInt(10));
            }
            if (buggyMax(list) != Collections.max(list)) {
                found = true;
                System.out.println("counterexample found, seed 42");
            }
        }
        System.out.println(found);
    }
}`,
      String.raw`import java.util.Random;

public class Main {
    static int[] generate(long seed) {
        Random random = new Random(seed);
        int[] values = new int[5];
        for (int i = 0; i < values.length; i++) {
            values[i] = random.nextInt(100);
        }
        return values;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.equals(generate(42), generate(42)));    // відтворювано
        System.out.println(java.util.Arrays.equals(generate(42), generate(43)));    // інший seed, інші дані
    }
}`,
      String.raw`// аварія: властивість порушена для знайденого входу, тест завершується з повідомленням про seed
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class Main {
    static int buggyMax(List<Integer> list) {
        return list.get(list.size() - 1);
    }

    public static void main(String[] args) {
        long seed = 42;
        Random random = new Random(seed);
        for (int i = 0; i < 200; i++) {
            List<Integer> list = new ArrayList<>();
            for (int j = 1 + random.nextInt(5); j > 0; j--) {
                list.add(random.nextInt(10));
            }
            if (buggyMax(list) != Collections.max(list)) {
                throw new AssertionError("max property failed, seed " + seed + ", input " + list);
            }
        }
    }
}`,
    ],
    note: String.raw`Тест на властивості перевіряє загальне правило на багатьох випадкових входах. Фіксований seed робить збій відтворюваним, а повідомлення про провал має містити seed і вхідні дані. Починайте з малих розмірів, щоб контрприклад був коротким.`,
    work: String.raw`Тести на властивості знаходять помилки в парсерах, сортуваннях, кодуванні, фінансових розрахунках і структурах даних: там, де кількість комбінацій надто велика для ручних прикладів. Фіксований seed у конвеєрі збірки робить такі тести стабільними, а друк seed у разі провалу дозволяє відтворити помилку локально.`,
    tasks: [
      String.raw`Чому в тестах на випадкових даних важливо друкувати seed?`,
      String.raw`Назвіть три властивості, які можна перевірити для методу reverse.`,
    ],
  },
  {
    t: "Ідіоми Java і типові помилки",
    ch: "Тестування й якість",
    easy: String.raw`Ідіоми — це ввічливість у коді: вони не змінюють результат, але роблять його зрозумілим для колег, як правильний порядок слів у реченні.`,
    p: [
      String.raw`Ідіома — усталений спосіб записати типову дію. Колеги швидше читають код, що користується знайомими ідіомами, а помилки в нестандартному коді помітніші. Збірка таких правил — книга «Effective Java» Джошуа Блоха. Нижче — найкорисніші правила для початку, що закривають більшість зауважень на код-рев'ю.`,
      String.raw`Рядки й порівняння: рядки порівнюйте через <code>equals</code> (краще <code>"literal".equals(x)</code>, що безпечно для null); у циклах будуйте текст через <code>StringBuilder</code>; уникайте <code>new String(...)</code>. Для порівняння об'єктів, що можуть бути <code>null</code>, використовуйте <code>Objects.equals</code>. Перетворення чисел — <code>Integer.parseInt</code> із обробкою <code>NumberFormatException</code>. Константи виносьте в <code>static final</code> поля замість магічних чисел.`,
      String.raw`Null: не повертайте <code>null</code> там, де можна повернути порожню колекцію чи <code>Optional</code>; перевіряйте аргументи на вході (<code>Objects.requireNonNull</code>); не передавайте <code>null</code> як «значення за замовчуванням» у публічних API; уникайте булевих параметрів без назв (<code>process(true, false)</code> нічого не пояснює): беріть enum чи окремі методи з промовистими іменами.`,
      String.raw`Класи: поля робіть <code>private final</code>, де можливо; віддавайте незмінні копії колекцій (<code>List.copyOf</code>); перевизначайте <code>equals</code> і <code>hashCode</code> разом (або беріть <code>record</code>); віддавайте перевагу композиції над успадкуванням; тримайте методи короткими (екран-два); називайте методи дієсловами, а класи іменниками. Не використовуйте статичні змінні як спільний змінний стан: його важко тестувати й він небезпечний у потоках.`,
      String.raw`Колекції та цикли: оголошуйте змінні типами інтерфейсів (<code>List</code>, <code>Map</code>); використовуйте <code>for-each</code>, коли індекс не потрібен; не змінюйте колекцію під час обходу; віддавайте перевагу <code>removeIf</code>, <code>computeIfAbsent</code>, <code>merge</code>; для великих обсягів обирайте потоки чи цикли свідомо. Не користуйтеся застарілими класами (<code>Vector</code>, <code>Hashtable</code>, <code>Stack</code>, <code>Date</code>).`,
      String.raw`Помилки: не ковтайте винятки (порожній <code>catch</code>), не ловіть <code>Exception</code> без потреби, закривайте ресурси через try-with-resources, зберігайте причину при обгортанні, не використовуйте винятки для керування потоком. Журналюйте один раз і з контекстом, а не в кожному шарі. Перевіряйте код чек-листом: чи є тести, чи зрозумілі назви, чи немає дублювання, чи вхідні дані перевіряються.`,
      String.raw`Інструменти: форматер (Google Java Format, Spotless), лінтери й статичні аналізатори (Checkstyle, SpotBugs, PMD, Error Prone, SonarQube) знаходять сотні типових проблем автоматично. Підключіть їх до збирання, щоб ці розмови не займали час рев'ю. Домовлені стандарти стилю в команді важливіші за те, якими саме вони є: головне, щоб код у проєкті виглядав однаково. Такий порядок скорочує час входу нових людей у проєкт, бо вони читають код, схожий на той, що бачили раніше, і не витрачають увагу на дрібні розбіжності у форматуванні.`,
    ],
    code: [
      String.raw`public class Main {
    static String statusBad(int code) {
        if (code == 1) {
            return "NEW";
        }
        return null;                                   // викликач мусить пам'ятати про null
    }

    static String statusGood(int code) {
        return code == 1 ? "NEW" : "UNKNOWN";          // явне значення замість null
    }

    public static void main(String[] args) {
        String a = statusGood(2);
        System.out.println("UNKNOWN".equals(a));        // літерал першим: безпечно для null
        System.out.println(statusBad(2) == null);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static final double TAX_RATE = 0.2;                // іменована константа замість магічного числа

    static double withTax(double price) {
        return price * (1 + TAX_RATE);
    }

    public static void main(String[] args) {
        Inventory inv = new Inventory();
        inv.add("pen");
        List<String> view = inv.items();
        try {
            view.add("hack");                          // копія незмінна
        } catch (UnsupportedOperationException e) {
            System.out.println("cannot modify");
        }
        System.out.println(withTax(100) + " " + inv.items());
    }
}

class Inventory {
    private final List<String> items = new ArrayList<>();

    void add(String item) {
        items.add(item);
    }

    List<String> items() {
        return List.copyOf(items);                     // захисна копія
    }
}`,
      String.raw`public class Main {
    enum Priority { LOW, HIGH }

    static void notifyBad(boolean urgent, boolean email) {
        System.out.println(urgent + " " + email);
    }

    static void notifyGood(Priority priority, String channel) {
        System.out.println(priority + " via " + channel);
    }

    public static void main(String[] args) {
        notifyBad(true, false);                         // що означають true і false?
        notifyGood(Priority.HIGH, "sms");               // читається без пояснень
    }
}`,
      String.raw`// не компілюється: оператор після return недосяжний
public class Main {
    static int twice(int x) {
        return x * 2;
        System.out.println("never reached");
    }

    public static void main(String[] args) {
        System.out.println(twice(4));
    }
}`,
      String.raw`// аварія: equals викликано на null-змінній, а літерал, поставлений першим, цього б уникнув
public class Main {
    public static void main(String[] args) {
        String input = null;
        System.out.println("yes".equals(input));
        System.out.println(input.equals("yes"));
    }
}`,
    ],
    note: String.raw`Порівнюйте рядки через <code>equals</code> (краще з літералом першим), не повертайте <code>null</code> замість порожньої колекції, робіть поля <code>private final</code> і не ковтайте винятки. Домовлені стиль і статичні аналізатори в збиранні економлять час на рев'ю.`,
    work: String.raw`Ідіоми й стандарти коду — те, що відрізняє код, який приємно підтримувати, від коду, який бояться чіпати. На рев'ю такі зауваження найчастіші, а автоматичні перевірки в конвеєрі збірки прибирають їх із розмов, лишаючи місце для змістовного обговорення архітектури.`,
    tasks: [
      String.raw`Чому <code>"abc".equals(s)</code> безпечніше за <code>s.equals("abc")</code>?`,
      String.raw`Чому булевих параметрів без назв краще уникати?`,
    ],
  },
];
