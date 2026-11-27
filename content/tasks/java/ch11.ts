// Практичні завдання глави «Архітектура» (уроки 100–105). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Бази й мережі тут немає: шари з'єднуються через конструктор, сховище лежить у пам'яті, а час і середовище передаються параметрами.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_11: readonly RemoteTask[] = [
  {
    ...base, id: "java-layers-notes", lesson: "java/100", xp: 30,
    title: "Три шари: контролер, сервіс, репозиторій",
    context: "Контролер приймає запит, сервіс застосовує правила, репозиторій зберігає. Коли кожен шар робить лише своє, правила можна перевірити без HTTP, а сховище замінити без переписування логіки.",
    brief: [
      "Допишіть <code>NoteService</code>: <code>create</code> обрізає пробіли, відхиляє порожню й задовгу (понад 20 символів) назву через <code>InvalidNoteException</code> із повідомленням <code>title must be 1-20 chars</code> і зберігає нотатку через репозиторій; <code>get</code> кидає <code>NoteNotFoundException</code> із повідомленням <code>note &lt;id&gt;</code>, якщо нотатки немає.",
      "Допишіть <code>NoteController</code>: правил у ньому немає, лише перетворення. <code>post</code> повертає <code>201 id=&lt;id&gt;</code>, <code>get</code> повертає <code>200 &lt;назва&gt;</code>, а доменні винятки він перетворює на <code>400 ...</code> і <code>404 ...</code> із текстом винятку.",
      "Очікуваний вивід: <code>201 id=1</code>, <code>201 id=2</code>, двічі <code>400 title must be 1-20 chars</code>, <code>200 Write code</code> і <code>404 note 9</code>.",
    ],
    starter: raw`import java.util.ArrayList;
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
            // TODO: назва після обрізання пробілів має містити від 1 до 20 символів, інакше виняток для некоректної назви; потім збережіть нотатку
            return null;
        }

        Note get(int id) {
            // TODO: якщо нотатки немає, кидайте виняток «не знайдено» з текстом "note <id>"
            return null;
        }
    }

    static class NoteController {
        private final NoteService service;

        NoteController(NoteService service) { this.service = service; }

        String post(String title) {
            // TODO: "201 id=<id>"; помилку правил перетворіть на "400 <повідомлення>"
            return "";
        }

        String get(int id) {
            // TODO: "200 <назва>"; відсутню нотатку перетворіть на "404 <повідомлення>"
            return "";
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
    checks: [
      { on: "stdout", name: "Нотатки створюються через усі три шари", has: "201 id=1\n201 id=2", hint: "Сервіс обрізає пробіли й викликає repository.save, контролер формує рядок 201 id=<id>" },
      { on: "stdout", name: "Некоректна назва дає 400", has: "400 title must be 1-20 chars\n400 title must be 1-20 chars", hint: "Порожня й задовга назва: сервіс кидає виняток, контролер перетворює його на 400 з текстом винятку" },
      { on: "stdout", name: "Читання й відсутня нотатка", has: "200 Write code\n404 note 9", hint: "findById повертає Optional: orElseThrow із NoteNotFoundException(\"note \" + id)" },
      { on: "source", name: "Правила перевірки лежать у сервісі", has: "throw new InvalidNoteException", hint: "Виняток кидає сервіс, а не контролер" },
      { on: "source", name: "Контролер перехоплює доменні винятки", has: "catch (NoteNotFoundException", hint: "Контролер перетворює NoteNotFoundException на відповідь 404" },
    ],
  },
  {
    ...base, id: "java-di-composition", lesson: "java/101", xp: 25,
    title: "Залежності через конструктор: сервіс замовлень",
    context: "Сервіс, який сам викликає Instant.now() чи створює відправника, неможливо перевірити. Коли залежності приходять через конструктор, у перевірці вони підміняються, а вивід стає передбачуваним.",
    brief: [
      "Допишіть конструктор <code>OrderService(Sender sender, Clock clock)</code>: обидві залежності зберігайте в <code>private final</code>-полях.",
      "Метод <code>place(customer, amount)</code> бере час із <code>clock</code> у форматі <code>HH:mm</code> (UTC) і надсилає клієнту текст <code>order &lt;amount&gt; at &lt;HH:mm&gt;</code>. Викликати <code>Instant.now()</code> чи створювати власний <code>Clock</code> усередині сервісу не можна: час приходить ззовні.",
      "Очікуваний вивід: <code>anna &lt;- order 3 at 09:05</code> і <code>oleh &lt;- order 12 at 09:05</code>.",
    ],
    starter: raw`import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
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
        // TODO: поля для обох залежностей

        OrderService(Sender sender, Clock clock) {
            // TODO: збережіть залежності
        }

        void place(String customer, int amount) {
            // TODO: час із годинника у форматі HH:mm (UTC), потім надішліть клієнту "order <amount> at <HH:mm>"
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
    checks: [
      { on: "stdout", name: "Повідомлення з часом із годинника", equals: "anna <- order 3 at 09:05\noleh <- order 12 at 09:05", hint: "DateTimeFormatter.ofPattern(\"HH:mm\").withZone(ZoneOffset.UTC).format(clock.instant())" },
      { on: "source", name: "Відправник приходить через конструктор у final-поле", matches: "private\\s+final\\s+Sender\\s+\\w+\\s*;", hint: "private final Sender sender; і присвоєння в конструкторі" },
      { on: "source", name: "Годинник теж лежить у final-полі", matches: "private\\s+final\\s+Clock\\s+\\w+\\s*;", hint: "private final Clock clock;" },
      { on: "source", name: "Час не береться з Instant.now()", has: "Instant.now(", not: true, hint: "Беріть clock.instant(): годинник підставляється ззовні" },
    ],
  },
  {
    ...base, id: "java-inmemory-repo", lesson: "java/102", xp: 35,
    title: "Репозиторій у пам'яті для багатьох потоків",
    context: "Сервер обробляє запити в багатьох потоках, а сховище в пам'яті спільне для всіх. Атомарні операції мапи й лічильника не дають загубити записи чи видати однакові id.",
    brief: [
      "Допишіть <code>InMemoryNoteRepository</code> на <code>ConcurrentHashMap&lt;Long, Note&gt;</code> і <code>AtomicLong</code>: <code>save</code> видає унікальні id <code>1, 2, 3, ...</code>, <code>findById</code> повертає <code>Optional</code>, <code>delete</code> каже, чи було що видаляти, <code>size</code> повертає кількість нотаток.",
      "Метод <code>rename</code> змінює назву наявної нотатки <b>атомарно</b>, одним викликом мапи, без окремих <code>get</code> і <code>put</code>, і повертає нову нотатку; якщо нотатки немає, повертає порожній <code>Optional</code>. Блоків <code>synchronized</code> не використовуйте.",
      "<code>main</code> запускає чотири потоки по 250 збережень, тож id мають лишитися унікальними: <code>saved: 1000</code>, <code>unique ids: 1000</code>, <code>max id: 1000</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    record Note(long id, String title) { }

    static class InMemoryNoteRepository {
        // TODO: сховище id -> Note, безпечне для потоків, і атомарний лічильник ідентифікаторів

        Note save(String title) {
            // TODO: нова нотатка з унікальним id: 1, 2, 3, ...
            return null;
        }

        Optional<Note> findById(long id) {
            return Optional.empty();
        }

        boolean delete(long id) {
            return false;
        }

        Optional<Note> rename(long id, String title) {
            // TODO: атомарно замініть назву, якщо нотатка є, без окремих get і put
            return Optional.empty();
        }

        int size() {
            return 0;
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
    checks: [
      { on: "stdout", name: "Тисяча збережень без втрат і дублів", has: "saved: 1000\nunique ids: 1000\nmax id: 1000", hint: "Лічильник id має бути AtomicLong: incrementAndGet() видає унікальні числа навіть при гонці потоків" },
      { on: "stdout", name: "Видалення й пошук", has: "delete 5: true\ndelete 5 again: false\nfind 5: none", hint: "remove повертає попереднє значення: null, якщо запису не було" },
      { on: "stdout", name: "Атомарне перейменування", has: "rename 6: Note[id=6, title=renamed]\nrename 5: false", hint: "computeIfPresent(id, (key, old) -> new Note(key, title)) повертає нове значення або null" },
      { on: "source", name: "Лічильник атомарний", has: "AtomicLong", hint: "private final AtomicLong nextId = new AtomicLong();" },
      { on: "source", name: "Перейменування через атомарний метод мапи", has: "computeIfPresent", hint: "Перевірка наявності й заміна мають бути однією операцією" },
      { on: "source", name: "Без synchronized", has: "synchronized", not: true, hint: "Безпеку потоків дає ConcurrentHashMap, окремий замок не потрібен" },
    ],
  },
  {
    ...base, id: "java-config-loader", lesson: "java/103", xp: 35,
    title: "Завантаження конфігурації з файлу й середовища",
    context: "Порт, хост і тайм-аут не зашивають у код: їх читають із файлу налаштувань і змінних середовища. Неправильне значення має зупиняти програму одразу, з повідомленням, що пояснює причину.",
    brief: [
      "Допишіть <code>AppConfig.load(file, env)</code>. Ключі файлу: <code>http.host</code> (за замовчуванням <code>localhost</code>), <code>http.port</code> (<code>8080</code>), <code>timeout.ms</code> (<code>3000</code>), <code>debug</code> (<code>false</code>). Змінні середовища перекривають файл: <code>APP_HTTP_PORT</code> і <code>APP_TIMEOUT_MS</code>.",
      "Некоректний порт: якщо це не число, кидайте <code>IllegalStateException</code> із текстом <code>port is not a number: &lt;значення&gt;</code>, а якщо поза діапазоном від 1 до 65535, то <code>port out of range: &lt;порт&gt;</code>. Мапу середовища отримуйте параметром, <code>System.getenv</code> не викликайте.",
      "Очікуваний вивід містить <code>AppConfig[host=example.org, port=9000, timeoutMs=1500, debug=true]</code> і три повідомлення про помилки порту.",
    ],
    starter: raw`import java.io.IOException;
import java.io.StringReader;
import java.util.Map;
import java.util.Properties;

public class Main {
    record AppConfig(String host, int port, int timeoutMs, boolean debug) {
        static AppConfig load(Properties file, Map<String, String> env) {
            // TODO: значення за замовчуванням, потім файл, потім змінні середовища (для порту й тайм-ауту);
            // порт не число: IllegalStateException("port is not a number: <значення>"); порт поза діапазоном 1..65535: IllegalStateException("port out of range: <порт>")
            return null;
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
    checks: [
      { on: "stdout", name: "Значення з файлу", has: "AppConfig[host=example.org, port=8081, timeoutMs=3000, debug=true]", hint: "Тайм-ауту у файлі немає, тому береться значення за замовчуванням 3000" },
      { on: "stdout", name: "Середовище перекриває файл", has: "AppConfig[host=example.org, port=9000, timeoutMs=1500, debug=true]", hint: "env.getOrDefault(\"APP_HTTP_PORT\", значення з файлу)" },
      { on: "stdout", name: "Усе за замовчуванням", has: "AppConfig[host=localhost, port=8080, timeoutMs=3000, debug=false]", hint: "file.getProperty(ключ, значення за замовчуванням)" },
      { on: "stdout", name: "Помилки порту зрозумілі", has: "error: port is not a number: abc\nerror: port out of range: 0\nerror: port out of range: 70000", hint: "Integer.parseInt у try з catch (NumberFormatException e), потім перевірка діапазону" },
      { on: "source", name: "Середовище приходить параметром", has: "System.getenv", not: true, hint: "Функція читає лише передану мапу env: так її можна перевірити з будь-якими значеннями" },
    ],
  },
  {
    ...base, id: "java-sql-binder", lesson: "java/104", xp: 30,
    title: "Підстановка параметрів у SQL для журналу",
    context: "У журналі корисно бачити запит із підставленими значеннями, а справжній драйвер передає їх окремо. Така функція також перевіряє, що кількість заповнювачів збігається з кількістю параметрів.",
    brief: [
      "Допишіть <code>bind(sql, params)</code>: кожен заповнювач <code>?</code> замініть значенням. <code>String</code> береться в одинарні лапки, а лапки всередині рядка подвоюються (<code>it's</code> стає <code>'it''s'</code>); <code>null</code> стає <code>NULL</code>; решта значень друкується як є.",
      "Якщо кількість заповнювачів не збігається з кількістю параметрів, кидайте <code>IllegalArgumentException</code> із текстом <code>expected &lt;N&gt; params, got &lt;M&gt;</code>. Перевірка має спрацювати до підстановки.",
      "Очікуваний вивід: <code>SELECT * FROM notes WHERE id = 7 AND title = 'it''s'</code>, <code>UPDATE notes SET title = NULL WHERE id = 3</code>, <code>SELECT 1</code> і <code>expected 2 params, got 1</code>.",
    ],
    starter: raw`import java.util.Arrays;
import java.util.List;

public class Main {
    static String bind(String sql, List<Object> params) {
        // TODO: порахуйте заповнювачі ? і порівняйте з кількістю параметрів;
        // при розбіжності: IllegalArgumentException("expected <N> params, got <M>");
        // рядок беріть в одинарні лапки (лапки всередині подвоюйте), null перетворюйте на NULL, решту друкуйте як є
        return sql;
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
    checks: [
      { on: "stdout", name: "Рядок у лапках, лапки подвоєно", has: "SELECT * FROM notes WHERE id = 7 AND title = 'it''s'", hint: "s.replace(\"'\", \"''\") і обгортка в одинарні лапки; число друкується без лапок" },
      { on: "stdout", name: "null стає NULL", has: "UPDATE notes SET title = NULL WHERE id = 3", hint: "Перевірте значення на null до виклику String.valueOf" },
      { on: "stdout", name: "Запит без параметрів лишається як є", has: "SELECT 1", hint: "Нуль заповнювачів і порожній список параметрів: розбіжності немає" },
      { on: "stdout", name: "Розбіжність кількості параметрів", has: "expected 2 params, got 1", hint: "Кількість ? у запиті: sql.chars().filter(ch -> ch == '?').count()" },
    ],
  },
  {
    ...base, id: "java-logging-requests", lesson: "java/105", xp: 35,
    title: "Міні-логер з рівнями, запитом і лічильниками",
    context: "Рівні відсікають зайве, ідентифікатор запиту зв'язує рядки одного запиту, а лічильники дають метрики. Разом це мінімум спостережуваності, з якого починається розслідування аварії.",
    brief: [
      "Допишіть <code>Logger.log</code>: повідомлення з рівнем нижче порога <code>threshold</code> ігнорується; інакше в <code>sink</code> додається рядок <code>&lt;РІВЕНЬ&gt; &lt;ім'я&gt; [req=&lt;id&gt;] &lt;повідомлення&gt;</code>, а лічильник цього рівня збільшується. Рівнів, що не пройшли поріг, лічильник не рахує.",
      "Допишіть <code>withRequest(id, action)</code>: ідентифікатор запиту ставиться в <code>ThreadLocal</code> на час виконання дії й <b>гарантовано</b> очищається, навіть якщо дія кинула виняток. Без запиту <code>currentRequest()</code> повертає <code>-</code>.",
      "Очікуваний вивід: чотири рядки журналу (<code>DEBUG</code> пропущено), підсумок лічильників <code>2 1 1 0</code> (INFO, WARN, ERROR, DEBUG) і рядок <code>request id after: -</code>.",
    ],
    starter: raw`import java.util.ArrayList;
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
        // TODO: поставте ідентифікатор, виконайте дію і гарантовано очистіть значення
        action.run();
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
            // TODO: нижче порога ігноруємо; інакше рядок "<РІВЕНЬ> <ім'я> [req=<id>] <повідомлення>" у sink і +1 до лічильника рівня
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
    checks: [
      { on: "stdout", name: "Рядки журналу з рівнем, іменем і запитом", has: "INFO notes [req=-] started\nINFO notes [req=a1] note created id=7\nERROR notes [req=a1] save failed id=8\nWARN notes [req=-] done", hint: "level + \" \" + name + \" [req=\" + currentRequest() + \"] \" + message; DEBUG нижче порога INFO" },
      { on: "stdout", name: "Лічильники рівнів", has: "2 1 1 0", hint: "level.compareTo(threshold) < 0: вийдіть із методу; лічильник збільшуйте через counts.merge(level, 1, Integer::sum)" },
      { on: "stdout", name: "Ідентифікатор запиту очищено", has: "request id after: -", hint: "Після withRequest у ThreadLocal нічого не лишається" },
      { on: "source", name: "Очищення у finally", has: "REQUEST_ID.remove()", hint: "try { action.run(); } finally { REQUEST_ID.remove(); }" },
    ],
  },
];
