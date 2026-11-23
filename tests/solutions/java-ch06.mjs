// Еталонні рішення завдань Java, глава 06 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_06 = {
  "java-try-catch-parse": raw`public class Main {
    public static void main(String[] args) {
        String[] inputs = {"12", "x7", "", "40"};
        int sum = 0;
        int invalid = 0;
        for (String s : inputs) {
            try {
                sum += Integer.parseInt(s);
            } catch (NumberFormatException e) {
                invalid++;
            }
        }
        System.out.println("Sum: " + sum);
        System.out.println("Invalid: " + invalid);
    }
}
`,
  "java-checked-throws": raw`import java.io.IOException;

public class Main {
    static String load(String name) throws IOException {
        if (name.isEmpty()) {
            throw new IOException("name is empty");
        }
        return "data of " + name;
    }

    static String loadOrDefault(String name) {
        try {
            return load(name);
        } catch (IOException e) {
            return "default";
        }
    }

    static String loadStrict(String name) {
        try {
            return load(name);
        } catch (IOException e) {
            throw new IllegalStateException("cannot load", e);
        }
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
  "java-exceptions-custom": raw`public class Main {
    static int withdraw(int balance, int amount) throws InsufficientFundsException {
        if (balance < amount) {
            throw new InsufficientFundsException("insufficient funds");
        }
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

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) {
        super(message);
    }
}
`,
  "java-exception-chain": raw`import java.io.IOException;

public class Main {
    static void readFile(String name) throws IOException {
        throw new IOException("file not found");
    }

    static void loadConfig(String name) throws ConfigException {
        try {
            readFile(name);
        } catch (IOException e) {
            throw new ConfigException("cannot load " + name, e);
        }
    }

    static Throwable rootCause(Throwable t) {
        while (t.getCause() != null) {
            t = t.getCause();
        }
        return t;
    }

    static int depth(Throwable t) {
        int count = 1;
        while (t.getCause() != null) {
            t = t.getCause();
            count++;
        }
        return count;
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

class ConfigException extends Exception {
    ConfigException(String message, Throwable cause) {
        super(message, cause);
    }
}
`,
  "java-try-resources": raw`public class Main {
    public static void main(String[] args) {
        try (Conn a = new Conn("A"); Conn b = new Conn("B")) {
            throw new IllegalStateException("boom");
        } catch (IllegalStateException e) {
            System.out.println("caught: " + e.getMessage());
        } finally {
            System.out.println("finally");
        }
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
  "java-npe-asserts": raw`import java.util.Objects;

public class Main {
    static String greet(String name) {
        return "Hello, " + Objects.requireNonNullElse(name, "guest");
    }

    static int parseAge(String s) {
        int age = Integer.parseInt(s.trim());
        if (age < 0) {
            throw new IllegalArgumentException("age must be >= 0, got " + age);
        }
        return age;
    }

    static String requireName(String name) {
        return Objects.requireNonNull(name, "name is required");
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
  "java-optional-result": raw`import java.util.Map;
import java.util.Optional;

public class Main {
    record User(String name, String email) { }

    static final Map<String, User> USERS = Map.of("1", new User("Ira", "ira@example.com"));

    static Optional<User> findUser(String id) {
        return Optional.ofNullable(USERS.get(id));
    }

    static String displayName(String id) {
        return findUser(id).map(User::name).orElse("guest");
    }

    static String emailOf(String id) {
        return findUser(id).map(User::email).orElse("no email");
    }

    static User requireUser(String id) {
        return findUser(id).orElseThrow(() -> new IllegalArgumentException("unknown user: " + id));
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
};
