// Еталонні рішення завдань Java, глава 11 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_11 = {
  "java-layers-notes": raw`import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class Main {
    record Note(int id, String title) { }

    interface NoteRepository {
        Note save(String title);
        Optional<Note> findById(int id);
    }

    static class InMemoryNoteRepository implements NoteRepository {
        private final List<Note> notes = new ArrayList<>();

        public Note save(String title) {
            Note note = new Note(notes.size() + 1, title);
            notes.add(note);
            return note;
        }

        public Optional<Note> findById(int id) {
            return notes.stream().filter(n -> n.id() == id).findFirst();
        }
    }

    static class InvalidNoteException extends RuntimeException {
        InvalidNoteException(String message) { super(message); }
    }

    static class NoteNotFoundException extends RuntimeException {
        NoteNotFoundException(String message) { super(message); }
    }

    static class NoteService {
        private final NoteRepository repository;

        NoteService(NoteRepository repository) { this.repository = repository; }

        Note create(String title) {
            String clean = title == null ? "" : title.trim();
            if (clean.isEmpty() || clean.length() > 20) {
                throw new InvalidNoteException("title must be 1-20 chars");
            }
            return repository.save(clean);
        }

        Note get(int id) {
            return repository.findById(id).orElseThrow(() -> new NoteNotFoundException("note " + id));
        }
    }

    static class NoteController {
        private final NoteService service;

        NoteController(NoteService service) { this.service = service; }

        String post(String title) {
            try {
                return "201 id=" + service.create(title).id();
            } catch (InvalidNoteException e) {
                return "400 " + e.getMessage();
            }
        }

        String get(int id) {
            try {
                return "200 " + service.get(id).title();
            } catch (NoteNotFoundException e) {
                return "404 " + e.getMessage();
            }
        }
    }

    public static void main(String[] args) {
        NoteController controller = new NoteController(new NoteService(new InMemoryNoteRepository()));
        System.out.println(controller.post("Buy milk"));
        System.out.println(controller.post("  Write code  "));
        System.out.println(controller.post("   "));
        System.out.println(controller.post("this title is definitely too long"));
        System.out.println(controller.get(2));
        System.out.println(controller.get(9));
    }
}
`,
  "java-di-composition": raw`import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class Main {
    interface Sender {
        void send(String to, String text);
    }

    static class MemorySender implements Sender {
        final List<String> sent = new ArrayList<>();

        public void send(String to, String text) {
            sent.add(to + " <- " + text);
        }
    }

    static class OrderService {
        private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneOffset.UTC);

        private final Sender sender;
        private final Clock clock;

        OrderService(Sender sender, Clock clock) {
            this.sender = sender;
            this.clock = clock;
        }

        void place(String customer, int amount) {
            String time = HH_MM.format(clock.instant());
            sender.send(customer, "order " + amount + " at " + time);
        }
    }

    public static void main(String[] args) {
        MemorySender sender = new MemorySender();
        Clock clock = Clock.fixed(Instant.parse("2026-03-01T09:05:00Z"), ZoneOffset.UTC);
        OrderService service = new OrderService(sender, clock);
        service.place("anna", 3);
        service.place("oleh", 12);
        sender.sent.forEach(System.out::println);
    }
}
`,
  "java-inmemory-repo": raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class Main {
    record Note(long id, String title) { }

    static class InMemoryNoteRepository {
        private final ConcurrentHashMap<Long, Note> notes = new ConcurrentHashMap<>();
        private final AtomicLong nextId = new AtomicLong();

        Note save(String title) {
            Note note = new Note(nextId.incrementAndGet(), title);
            notes.put(note.id(), note);
            return note;
        }

        Optional<Note> findById(long id) {
            return Optional.ofNullable(notes.get(id));
        }

        boolean delete(long id) {
            return notes.remove(id) != null;
        }

        Optional<Note> rename(long id, String title) {
            return Optional.ofNullable(notes.computeIfPresent(id, (key, old) -> new Note(key, title)));
        }

        int size() {
            return notes.size();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        InMemoryNoteRepository repo = new InMemoryNoteRepository();
        Set<Long> ids = ConcurrentHashMap.newKeySet();
        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 4; t++) {
            Thread thread = new Thread(() -> {
                for (int i = 0; i < 250; i++) {
                    ids.add(repo.save("n" + i).id());
                }
            });
            threads.add(thread);
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        System.out.println("saved: " + repo.size());
        System.out.println("unique ids: " + ids.size());
        System.out.println("max id: " + Collections.max(ids));
        System.out.println("delete 5: " + repo.delete(5));
        System.out.println("delete 5 again: " + repo.delete(5));
        System.out.println("find 5: " + repo.findById(5).map(Note::title).orElse("none"));
        System.out.println("rename 6: " + repo.rename(6, "renamed").orElseThrow());
        System.out.println("rename 5: " + repo.rename(5, "x").isPresent());
    }
}
`,
  "java-config-loader": raw`import java.io.IOException;
import java.io.StringReader;
import java.util.Map;
import java.util.Properties;

public class Main {
    record AppConfig(String host, int port, int timeoutMs, boolean debug) {
        static AppConfig load(Properties file, Map<String, String> env) {
            String host = file.getProperty("http.host", "localhost");
            String portText = env.getOrDefault("APP_HTTP_PORT", file.getProperty("http.port", "8080"));
            String timeoutText = env.getOrDefault("APP_TIMEOUT_MS", file.getProperty("timeout.ms", "3000"));
            boolean debug = Boolean.parseBoolean(file.getProperty("debug", "false"));
            int port = number("port", portText);
            int timeoutMs = number("timeout", timeoutText);
            if (port < 1 || port > 65535) {
                throw new IllegalStateException("port out of range: " + port);
            }
            return new AppConfig(host, port, timeoutMs, debug);
        }

        private static int number(String name, String text) {
            try {
                return Integer.parseInt(text.trim());
            } catch (NumberFormatException e) {
                throw new IllegalStateException(name + " is not a number: " + text);
            }
        }
    }

    public static void main(String[] args) throws IOException {
        Properties file = new Properties();
        file.load(new StringReader("http.host=example.org\nhttp.port=8081\ndebug=true\n"));
        System.out.println(AppConfig.load(file, Map.of()));
        System.out.println(AppConfig.load(file, Map.of("APP_HTTP_PORT", "9000", "APP_TIMEOUT_MS", "1500")));
        System.out.println(AppConfig.load(new Properties(), Map.of()));
        for (String bad : new String[] {"abc", "0", "70000"}) {
            try {
                AppConfig.load(new Properties(), Map.of("APP_HTTP_PORT", bad));
            } catch (IllegalStateException e) {
                System.out.println("error: " + e.getMessage());
            }
        }
    }
}
`,
  "java-sql-binder": raw`import java.util.Arrays;
import java.util.List;

public class Main {
    static String bind(String sql, List<Object> params) {
        int placeholders = (int) sql.chars().filter(ch -> ch == '?').count();
        if (placeholders != params.size()) {
            throw new IllegalArgumentException("expected " + placeholders + " params, got " + params.size());
        }
        StringBuilder out = new StringBuilder();
        int next = 0;
        for (char ch : sql.toCharArray()) {
            if (ch != '?') {
                out.append(ch);
                continue;
            }
            Object value = params.get(next++);
            if (value == null) {
                out.append("NULL");
            } else if (value instanceof String s) {
                out.append('\'').append(s.replace("'", "''")).append('\'');
            } else {
                out.append(value);
            }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        System.out.println(bind("SELECT * FROM notes WHERE id = ? AND title = ?", List.of(7, "it's")));
        System.out.println(bind("UPDATE notes SET title = ? WHERE id = ?", Arrays.<Object>asList(null, 3)));
        System.out.println(bind("SELECT 1", List.of()));
        try {
            bind("SELECT * FROM notes WHERE id = ? AND tag = ?", List.of(1));
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
`,
  "java-logging-requests": raw`import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

public class Main {
    enum Level { DEBUG, INFO, WARN, ERROR }

    static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();

    static String currentRequest() {
        String id = REQUEST_ID.get();
        return id == null ? "-" : id;
    }

    static void withRequest(String id, Runnable action) {
        REQUEST_ID.set(id);
        try {
            action.run();
        } finally {
            REQUEST_ID.remove();
        }
    }

    static class Logger {
        private final String name;
        private final Level threshold;
        private final List<String> sink;
        private final Map<Level, Integer> counts = new EnumMap<>(Level.class);

        Logger(String name, Level threshold, List<String> sink) {
            this.name = name;
            this.threshold = threshold;
            this.sink = sink;
        }

        void log(Level level, String message) {
            if (level.compareTo(threshold) < 0) {
                return;
            }
            sink.add(level + " " + name + " [req=" + currentRequest() + "] " + message);
            counts.merge(level, 1, Integer::sum);
        }

        void debug(String message) { log(Level.DEBUG, message); }

        void info(String message) { log(Level.INFO, message); }

        void warn(String message) { log(Level.WARN, message); }

        void error(String message) { log(Level.ERROR, message); }

        int count(Level level) {
            return counts.getOrDefault(level, 0);
        }
    }

    public static void main(String[] args) {
        List<String> sink = new ArrayList<>();
        Logger log = new Logger("notes", Level.INFO, sink);
        log.debug("hidden");
        log.info("started");
        withRequest("a1", () -> {
            log.info("note created id=7");
            log.error("save failed id=8");
        });
        log.warn("done");
        sink.forEach(System.out::println);
        System.out.println(log.count(Level.INFO) + " " + log.count(Level.WARN) + " " + log.count(Level.ERROR) + " " + log.count(Level.DEBUG));
        System.out.println("request id after: " + currentRequest());
    }
}
`,
};
