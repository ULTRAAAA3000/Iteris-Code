// Практичні завдання глави «Помилки» (уроки 52–58). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "java-try-catch-parse", lesson: "java/52", xp: 25,
    title: "try/catch: сума коректних чисел",
    context: "Дані користувача часто містять сміття, і не кожен рядок можна перетворити на число. Спіймавши NumberFormatException, програма пропускає поганий рядок і продовжує роботу замість того, щоб упасти.",
    brief: [
      "У циклі розберіть кожен рядок через <code>Integer.parseInt</code> всередині <code>try</code>, додайте коректні числа до <code>sum</code>, а для поганих збільште лічильник <code>invalid</code> у блоці <code>catch (NumberFormatException e)</code>.",
      "Очікуваний вивід: <code>Sum: 52</code> і <code>Invalid: 2</code> (рядки <code>x7</code> і порожній).",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        String[] inputs = {"12", "x7", "", "40"};
        int sum = 0;
        int invalid = 0;
        for (String s : inputs) {
            // TODO: обгорніть розбір у try/catch і рахуйте некоректні рядки
            sum += Integer.parseInt(s);
        }
        System.out.println("Sum: " + sum);
        System.out.println("Invalid: " + invalid);
    }
}
`,
    checks: [
      { on: "stdout", name: "Сума коректних чисел: «Sum: 52»", has: "Sum: 52", hint: "12 + 40 = 52; некоректні рядки пропускаємо" },
      { on: "stdout", name: "Кількість некоректних: «Invalid: 2»", has: "Invalid: 2", hint: "У catch виконайте invalid++" },
      { on: "source", name: "Є catch для NumberFormatException", matches: "catch\\s*\\(\\s*NumberFormatException", hint: "catch (NumberFormatException e) { invalid++; }" },
    ],
  },
  {
    ...base, id: "java-checked-throws", lesson: "java/53", xp: 25,
    title: "Перевірювані винятки: throws і обгортання",
    context: "Метод, що працює з файлами чи мережею, оголошує перевірюваний виняток, а викликач вирішує: спіймати, замінити значенням за замовчуванням або обгорнути в неперевірюваний. Тут ви пройдете всі три шляхи.",
    brief: [
      "Допишіть <code>load(String name) throws IOException</code> (для порожнього імені кидає <code>IOException(\"name is empty\")</code>, інакше повертає <code>data of &lt;name&gt;</code>), <code>loadOrDefault(String)</code> (ловить виняток і повертає <code>default</code>) та <code>loadStrict(String)</code> (обгортає виняток у <code>IllegalStateException(\"cannot load\", e)</code>).",
      "Очікуваний вивід: <code>data of app</code>, <code>default</code> і <code>Strict: cannot load (cause: name is empty)</code>.",
    ],
    starter: raw`import java.io.IOException;

public class Main {
    static String load(String name) throws IOException {
        // TODO: порожнє ім'я: throw new IOException("name is empty"); інакше "data of " + name
        return "";
    }

    static String loadOrDefault(String name) {
        // TODO: спіймайте IOException і поверніть "default"
        return "";
    }

    static String loadStrict(String name) {
        // TODO: спіймайте IOException і киньте new IllegalStateException("cannot load", e)
        return "";
    }

    public static void main(String[] args) throws Exception {
        System.out.println(load("app"));
        System.out.println(loadOrDefault(""));
        try {
            loadStrict("");
        } catch (IllegalStateException e) {
            System.out.println("Strict: " + e.getMessage() + " (cause: " + e.getCause().getMessage() + ")");
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "Успішне завантаження: «data of app»", has: "data of app", hint: "return \"data of \" + name;" },
      { on: "stdout", name: "Значення за замовчуванням: «default»", has: "data of app\ndefault", hint: "У loadOrDefault спіймайте IOException і поверніть \"default\"" },
      { on: "stdout", name: "Обгортка з причиною", has: "Strict: cannot load (cause: name is empty)", hint: "throw new IllegalStateException(\"cannot load\", e);" },
      { on: "source", name: "load оголошує throws IOException", matches: "load\\s*\\([^)]*\\)\\s+throws\\s+IOException", hint: "static String load(String name) throws IOException" },
      { on: "source", name: "Причину передано в конструктор винятку", matches: "new\\s+IllegalStateException\\s*\\(\\s*\"cannot load\"\\s*,\\s*e\\s*\\)", hint: "Другим аргументом передайте e" },
    ],
  },
  {
    ...base, id: "java-exceptions-custom", lesson: "java/54", xp: 40,
    title: "Власний виняток InsufficientFundsException",
    context: "Перевірений виняток (checked exception) змушує того, хто викликає метод, подумати про помилку: компілятор не пропустить код без try/catch або throws. Блок finally виконується завжди.",
    brief: [
      "Опишіть клас <code>InsufficientFundsException extends Exception</code> (конструктор приймає повідомлення й передає його в <code>super</code>).",
      "Допишіть <code>withdraw(int balance, int amount)</code>: якщо коштів менше, ніж треба, кидає цей виняток з повідомленням <code>insufficient funds</code>, інакше повертає новий баланс. Метод оголошує <code>throws InsufficientFundsException</code>.",
    ],
    starter: raw`public class Main {
    // TODO: додайте throws InsufficientFundsException і перевірку balance < amount
    static int withdraw(int balance, int amount) {
        return balance - amount;
    }

    public static void main(String[] args) {
        try {
            System.out.println("Balance: " + withdraw(100, 30));
            System.out.println("Balance: " + withdraw(70, 500));
        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("Done");
        }
    }
}

// TODO: class InsufficientFundsException extends Exception
`,
    checks: [
      { on: "stdout", name: "Успішне зняття: Balance: 70", has: "Balance: 70\n", hint: "100 - 30 = 70" },
      { on: "stdout", name: "Виняток спіймано з повідомленням", has: "Error: insufficient funds", hint: "throw new InsufficientFundsException(\"insufficient funds\")" },
      { on: "stdout", name: "Блок finally виконався", has: "Done", hint: "finally виконується і після catch" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Balance: 70\nError: insufficient funds\nDone", hint: "Три рядки: баланс, помилка, Done" },
      { on: "source", name: "Власний виняток успадковує Exception", matches: "class\\s+InsufficientFundsException\\s+extends\\s+Exception", hint: "class InsufficientFundsException extends Exception { ... }" },
      { on: "source", name: "Метод оголошує throws", matches: "withdraw\\([^)]*\\)\\s+throws\\s+InsufficientFundsException", hint: "static int withdraw(int balance, int amount) throws InsufficientFundsException" },
    ],
  },
  {
    ...base, id: "java-exception-chain", lesson: "java/55", xp: 30,
    title: "Ланцюг причин: ConfigException",
    context: "Верхній рівень обгортає технічну помилку у свою, не втрачаючи початкової. Потім за ланцюгом причин можна дістатися першопричини, і саме її шукають у журналах під час інциденту.",
    brief: [
      "Допишіть <code>ConfigException(String, Throwable)</code>, <code>loadConfig</code> (ловить <code>IOException</code> із <code>readFile</code> і кидає <code>ConfigException(\"cannot load \" + name, e)</code>), <code>rootCause(Throwable)</code> і <code>depth(Throwable)</code> (кількість винятків у ланцюгу).",
      "Очікуваний вивід: <code>Top: cannot load config.cfg</code>, <code>Root: file not found</code> і <code>Depth: 2</code>.",
    ],
    starter: raw`import java.io.IOException;

public class Main {
    static void readFile(String name) throws IOException {
        throw new IOException("file not found");
    }

    static void loadConfig(String name) throws ConfigException {
        // TODO: викличте readFile, а IOException обгорніть у ConfigException з причиною
    }

    static Throwable rootCause(Throwable t) {
        // TODO: йдіть за getCause() до кінця
        return t;
    }

    static int depth(Throwable t) {
        // TODO: порахуйте всі винятки в ланцюгу, включно з першим
        return 0;
    }

    public static void main(String[] args) {
        try {
            loadConfig("config.cfg");
        } catch (ConfigException e) {
            System.out.println("Top: " + e.getMessage());
            System.out.println("Root: " + rootCause(e).getMessage());
            System.out.println("Depth: " + depth(e));
        }
    }
}

// TODO: class ConfigException extends Exception з конструктором (String message, Throwable cause)
`,
    checks: [
      { on: "stdout", name: "Верхнє повідомлення", has: "Top: cannot load config.cfg", hint: "new ConfigException(\"cannot load \" + name, e)" },
      { on: "stdout", name: "Першопричина", has: "Root: file not found", hint: "Ідіть за getCause(), доки він не стане null" },
      { on: "stdout", name: "Довжина ланцюга", has: "Depth: 2", hint: "ConfigException і IOException: два винятки" },
      { on: "source", name: "Причину передано в super(message, cause)", matches: "super\\s*\\(\\s*message\\s*,\\s*cause\\s*\\)", hint: "super(message, cause);" },
      { on: "source", name: "Використано getCause", has: "getCause()", hint: "t.getCause() у циклі" },
    ],
  },
  {
    ...base, id: "java-try-resources", lesson: "java/56", xp: 35,
    title: "try-with-resources: порядок закриття",
    context: "Ресурси треба закривати завжди, навіть при помилці, і в порядку, зворотному відкриттю. try-with-resources робить це автоматично, а блоки catch і finally виконуються вже після закриття.",
    brief: [
      "У <code>main</code> відкрийте два ресурси <code>Conn(\"A\")</code> і <code>Conn(\"B\")</code> в заголовку <code>try</code>, киньте всередині <code>IllegalStateException(\"boom\")</code>, спіймайте його й виведіть <code>caught: boom</code>, а у <code>finally</code> виведіть <code>finally</code>.",
      "Очікуваний порядок: <code>open A</code>, <code>open B</code>, <code>close B</code>, <code>close A</code>, <code>caught: boom</code>, <code>finally</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        // TODO: try (Conn a = ...; Conn b = ...) { throw ... } catch ... finally ...
    }
}

class Conn implements AutoCloseable {
    private final String name;

    Conn(String name) {
        this.name = name;
        System.out.println("open " + name);
    }

    @Override
    public void close() {
        System.out.println("close " + name);
    }
}
`,
    checks: [
      { on: "stdout", name: "Ресурси відкрито й закрито у зворотному порядку", has: "open A\nopen B\nclose B\nclose A", hint: "Ресурси закриваються у порядку, зворотному оголошенню" },
      { on: "stdout", name: "Catch виконується після закриття", has: "close A\ncaught: boom", hint: "У catch виведіть e.getMessage()" },
      { on: "stdout", name: "finally виконується останнім", has: "caught: boom\nfinally", hint: "Блок finally іде після catch" },
      { on: "source", name: "Ресурси в заголовку try", matches: "try\\s*\\(\\s*Conn\\s+\\w+\\s*=[\\s\\S]*;\\s*Conn\\s+\\w+\\s*=", hint: "try (Conn a = new Conn(\"A\"); Conn b = new Conn(\"B\")) { ... }" },
      { on: "source", name: "Є finally", has: "finally", hint: "finally { System.out.println(\"finally\"); }" },
    ],
  },
  {
    ...base, id: "java-npe-asserts", lesson: "java/57", xp: 30,
    title: "Перевірка аргументів і requireNonNull",
    context: "Помилки програмування краще виявляти на вході методу: порожнє ім'я замінити значенням за замовчуванням, некоректний вік відхилити, обов'язковий аргумент перевірити через requireNonNull зі зрозумілим повідомленням.",
    brief: [
      "Допишіть <code>greet(String)</code> (через <code>Objects.requireNonNullElse(name, \"guest\")</code>), <code>parseAge(String)</code> (від'ємний вік: <code>IllegalArgumentException(\"age must be &gt;= 0, got -5\")</code>) і <code>requireName(String)</code> (через <code>Objects.requireNonNull(name, \"name is required\")</code>).",
      "Очікуваний вивід: <code>Hello, Ira</code>, <code>Hello, guest</code>, <code>Age: 17</code>, <code>Error: age must be &gt;= 0, got -5</code>, <code>NPE: name is required</code>.",
    ],
    starter: raw`import java.util.Objects;

public class Main {
    static String greet(String name) {
        // TODO: Objects.requireNonNullElse(name, "guest")
        return "Hello, ?";
    }

    static int parseAge(String s) {
        // TODO: розберіть число; для від'ємного киньте IllegalArgumentException("age must be >= 0, got " + age)
        return 0;
    }

    static String requireName(String name) {
        // TODO: Objects.requireNonNull(name, "name is required")
        return name;
    }

    public static void main(String[] args) {
        System.out.println(greet("Ira"));
        System.out.println(greet(null));
        System.out.println("Age: " + parseAge("17"));
        try {
            parseAge("-5");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
        try {
            requireName(null);
        } catch (NullPointerException e) {
            System.out.println("NPE: " + e.getMessage());
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "Привітання зі значенням за замовчуванням", has: "Hello, Ira\nHello, guest", hint: "requireNonNullElse підставляє guest для null" },
      { on: "stdout", name: "Коректний вік: «Age: 17»", has: "Age: 17", hint: "Integer.parseInt(s.trim())" },
      { on: "stdout", name: "Некоректний вік відхилено", has: "Error: age must be >= 0, got -5", hint: "throw new IllegalArgumentException(\"age must be >= 0, got \" + age)" },
      { on: "stdout", name: "requireNonNull із повідомленням", has: "NPE: name is required", hint: "Objects.requireNonNull(name, \"name is required\")" },
      { on: "source", name: "Використано requireNonNullElse і requireNonNull", matches: "requireNonNullElse[\\s\\S]*requireNonNull\\s*\\(|requireNonNull\\s*\\([\\s\\S]*requireNonNullElse", hint: "Обидва методи класу Objects" },
    ],
  },
  {
    ...base, id: "java-optional-result", lesson: "java/58", xp: 35,
    title: "Optional у пошуку користувача",
    context: "Метод пошуку повертає Optional, і викликач одразу бачить, що користувача може не бути. Далі можна підставити значення за замовчуванням, перетворити знайдене або кинути зрозумілий виняток.",
    brief: [
      "Допишіть <code>findUser(String id)</code> (повертає <code>Optional.ofNullable(USERS.get(id))</code>), <code>displayName(String)</code> (ім'я або <code>guest</code>), <code>emailOf(String)</code> (адреса через <code>map(User::email)</code> або <code>no email</code>) і <code>requireUser(String)</code> (<code>orElseThrow</code> з <code>IllegalArgumentException(\"unknown user: \" + id)</code>).",
      "Очікуваний вивід: <code>Name: Ira</code>, <code>Name: guest</code>, <code>Email: ira@example.com</code> і <code>Error: unknown user: x9</code>.",
    ],
    starter: raw`import java.util.Map;
import java.util.Optional;

public class Main {
    record User(String name, String email) { }

    static final Map<String, User> USERS = Map.of("1", new User("Ira", "ira@example.com"));

    static Optional<User> findUser(String id) {
        // TODO: Optional.ofNullable(USERS.get(id))
        return null;
    }

    static String displayName(String id) {
        // TODO: ім'я користувача або "guest"
        return "";
    }

    static String emailOf(String id) {
        // TODO: адреса через map(User::email), інакше "no email"
        return "";
    }

    static User requireUser(String id) {
        // TODO: orElseThrow з IllegalArgumentException("unknown user: " + id)
        return null;
    }

    public static void main(String[] args) {
        System.out.println("Name: " + displayName("1"));
        System.out.println("Name: " + displayName("9"));
        System.out.println("Email: " + emailOf("1"));
        try {
            requireUser("x9");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "Ім'я існуючого й відсутнього користувача", has: "Name: Ira\nName: guest", hint: "findUser(id).map(User::name).orElse(\"guest\")" },
      { on: "stdout", name: "Адреса пошти", has: "Email: ira@example.com", hint: "findUser(id).map(User::email).orElse(\"no email\")" },
      { on: "stdout", name: "Виняток для невідомого користувача", has: "Error: unknown user: x9", hint: "findUser(id).orElseThrow(() -> new IllegalArgumentException(\"unknown user: \" + id))" },
      { on: "source", name: "Використано Optional.ofNullable", has: "Optional.ofNullable", hint: "Optional.ofNullable(USERS.get(id))" },
      { on: "source", name: "Використано orElse і orElseThrow", matches: "orElse\\([\\s\\S]*orElseThrow\\(|orElseThrow\\([\\s\\S]*orElse\\(", hint: "Обидва методи Optional" },
    ],
  },
];
