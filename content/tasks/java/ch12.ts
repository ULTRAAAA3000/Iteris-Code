// Практичні завдання глави «Проєкти» (уроки 106–110). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Мережі тут немає: запити й відповіді — звичайні об'єкти в пам'яті, час задається підставним годинником, а чекання робиться через засувки, а не через sleep.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12: readonly RemoteTask[] = [
  {
    ...base, id: "java-project-textstats", lesson: "java/106", xp: 40,
    title: "Проєкт: звіт про текст",
    context: "Підрахунок слів, топ найчастіших і кількість речень лежать в основі пошукових індексів, аналізу журналів і перевірки текстів. Детермінований звіт можна порівнювати з відповіддю, порахованою вручну.",
    brief: [
      "Допишіть п'ять функцій. <code>words</code> розбиває текст на слова в нижньому регістрі (<code>Locale.ROOT</code>): слово складається з літер, цифр і апострофа, порожніх рядків немає. <code>frequencies</code> рахує частоти слів.",
      "<code>top(freq, n)</code> повертає до n рядків <code>слово=кількість</code>: за кількістю за спаданням, а за рівної кількості за словом за зростанням. <code>longest</code> шукає найдовше слово в символах Юнікоду (за рівної довжини менше за алфавітом). <code>sentences</code> рахує закінчення <code>.</code>, <code>!</code> чи <code>?</code> після літери або цифри; послідовність на кшталт <code>?!</code> чи <code>...</code> дає одне речення.",
      "Очікуваний звіт: <code>words: 20</code>, <code>unique: 10</code>, <code>top: [the=6, cat=3, hat=3]</code>, <code>longest: cat's</code>, <code>sentences: 5</code>, а для порожнього тексту <code>empty: 0 0</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    static List<String> words(String text) {
        // TODO: нижній регістр (Locale.ROOT), слово = літери, цифри й апостроф; порожні рядки відкиньте
        return new ArrayList<>();
    }

    static Map<String, Integer> frequencies(List<String> words) {
        // TODO: слово -> скільки разів трапилось
        return new HashMap<>();
    }

    static List<String> top(Map<String, Integer> freq, int n) {
        // TODO: до n рядків "слово=кількість": за кількістю за спаданням, за рівної кількості за словом за зростанням
        return new ArrayList<>();
    }

    static String longest(List<String> words) {
        // TODO: найдовше слово в символах Unicode; за рівної довжини менше за алфавітом; для порожнього списку ""
        return "";
    }

    static int sentences(String text) {
        // TODO: кількість закінчень .  !  ? після літери чи цифри; послідовність на кшталт ?! чи ... дає одне речення
        return 0;
    }

    public static void main(String[] args) {
        String text = "The cat and the hat. The cat sat! Is the hat on the cat? Yes... it's on the cat's hat?!";
        List<String> words = words(text);
        Map<String, Integer> freq = frequencies(words);
        System.out.println("words: " + words.size());
        System.out.println("unique: " + freq.size());
        System.out.println("top: " + top(freq, 3));
        System.out.println("longest: " + longest(words));
        System.out.println("sentences: " + sentences(text));
        System.out.println("empty: " + words("").size() + " " + sentences(""));
    }
}
`,
    checks: [
      { on: "stdout", name: "Слова й унікальні", has: "words: 20\nunique: 10", hint: "Розбийте за регулярним виразом із літер, цифр і апострофа, приведіть до нижнього регістру й відкиньте порожні рядки" },
      { on: "stdout", name: "Топ із двома критеріями", has: "top: [the=6, cat=3, hat=3]", hint: "Рівні кількості впорядкуйте за словом: comparingByValue().reversed().thenComparing(comparingByKey())" },
      { on: "stdout", name: "Найдовше слово", has: "longest: cat's", hint: "Апостроф входить до слова, довжину беріть через codePointCount" },
      { on: "stdout", name: "Речення рахуються за закінченнями", has: "sentences: 5", hint: "Регулярний вираз: літера чи цифра і далі один або більше знаків . ! ?" },
      { on: "stdout", name: "Порожній текст", has: "empty: 0 0", hint: "Порожній рядок не має давати слів: відкидайте порожні елементи після split" },
      { on: "source", name: "Локаль не залежить від системи", has: "Locale.ROOT", hint: "toLowerCase(Locale.ROOT)" },
    ],
  },
  {
    ...base, id: "java-project-notes-api", lesson: "java/107", xp: 50,
    title: "Проєкт: REST API нотаток",
    context: "CRUD над ресурсом із валідацією, точними кодами статусів і єдиним форматом помилок це щоденна робота бекенд-розробника. Обробник, який викликають напряму, перевіряється так само, як справжній сервер.",
    brief: [
      "Сховище, <code>json</code>, <code>error</code>, регулярний вираз <code>TITLE</code> і <code>main</code> готові. Допишіть <code>handle</code>: <code>POST /notes</code> створює, <code>GET /notes</code> повертає список, <code>GET /notes/{id}</code> і <code>DELETE /notes/{id}</code> працюють з однією нотаткою; відомий шлях з іншим методом дає <code>405</code>, невідомий шлях <code>404</code>.",
      "<code>create</code>: порожній після <code>trim</code> або відсутній <code>title</code> дає <code>400</code> і <code>title is required</code>, успіх дає <code>201</code> і JSON нотатки. <code>get</code> і <code>remove</code>: нечисловий id це <code>400 invalid id</code>, відсутня нотатка <code>404 not found</code>; <code>get</code> відповідає <code>200</code>, <code>remove</code> відповідає <code>204</code> без тіла. <code>list</code> повертає масив JSON за зростанням id.",
      "Нечисловий id не повинен кидати виняток із обробника: клієнт має отримати відповідь 4xx.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    record Request(String method, String path, String body) { }

    record Response(int status, String body) {
        @Override
        public String toString() {
            return (status + " " + body).trim();
        }
    }

    record Note(int id, String title) { }

    static final ConcurrentHashMap<Integer, Note> NOTES = new ConcurrentHashMap<>();
    static final AtomicInteger IDS = new AtomicInteger();
    static final Pattern TITLE = Pattern.compile("\"title\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");

    static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    static String json(Note n) {
        return "{\"id\":" + n.id() + ",\"title\":\"" + escape(n.title()) + "\"}";
    }

    static Response error(int status, String message) {
        return new Response(status, "{\"error\":\"" + message + "\"}");
    }

    static Response handle(Request r) {
        // TODO: маршрути: POST /notes, GET /notes, GET /notes/{id}, DELETE /notes/{id};
        // відомий шлях з іншим методом: 405 "method not allowed"; невідомий шлях: 404 "not found"
        return error(500, "not implemented");
    }

    static Response create(String body) {
        // TODO: поле title обов'язкове й непорожнє після trim (інакше 400 "title is required"); 201 і JSON нотатки
        return error(500, "not implemented");
    }

    static Response get(String rawId) {
        // TODO: нечисловий id: 400 "invalid id"; немає нотатки: 404 "not found"; інакше 200 і JSON
        return error(500, "not implemented");
    }

    static Response remove(String rawId) {
        // TODO: нечисловий id: 400 "invalid id"; немає нотатки: 404 "not found"; інакше 204 без тіла
        return error(500, "not implemented");
    }

    static Response list() {
        // TODO: 200 і масив JSON усіх нотаток за зростанням id: [{...},{...}]
        return error(500, "not implemented");
    }

    public static void main(String[] args) {
        String[][] calls = {
            {"POST", "/notes", "{\"title\":\"Buy milk\"}"},
            {"POST", "/notes", "{\"title\":\"   \"}"},
            {"POST", "/notes", "{\"oops\":1}"},
            {"GET", "/notes/1", ""},
            {"GET", "/notes/abc", ""},
            {"GET", "/notes/9", ""},
            {"POST", "/notes", "{\"title\":\"Write code\"}"},
            {"GET", "/notes", ""},
            {"DELETE", "/notes/1", ""},
            {"DELETE", "/notes/1", ""},
            {"PUT", "/notes/2", ""},
            {"GET", "/unknown", ""},
        };
        for (String[] c : calls) {
            System.out.println(c[0] + " " + c[1] + " -> " + handle(new Request(c[0], c[1], c[2])));
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "Створення повертає 201 із нотаткою", has: "POST /notes -> 201 {\"id\":1,\"title\":\"Buy milk\"}", hint: "create: розберіть title регулярним виразом TITLE і збережіть через IDS та NOTES" },
      { on: "stdout", name: "Валідація заголовка", has: "-> 400 {\"error\":\"title is required\"}\nPOST /notes -> 400 {\"error\":\"title is required\"}", hint: "Порожній і відсутній title дають однакову помилку 400" },
      { on: "stdout", name: "Читання, некоректний і відсутній id", has: "GET /notes/1 -> 200 {\"id\":1,\"title\":\"Buy milk\"}\nGET /notes/abc -> 400 {\"error\":\"invalid id\"}\nGET /notes/9 -> 404 {\"error\":\"not found\"}", hint: "Integer.parseInt у try з catch (NumberFormatException e): повертайте 400, а не кидайте виняток" },
      { on: "stdout", name: "Список за зростанням id", has: "GET /notes -> 200 [{\"id\":1,\"title\":\"Buy milk\"},{\"id\":2,\"title\":\"Write code\"}]", hint: "Відсортуйте значення мапи за id і з'єднайте JSON через кому в квадратних дужках" },
      { on: "stdout", name: "Видалення: 204, потім 404", has: "DELETE /notes/1 -> 204\nDELETE /notes/1 -> 404 {\"error\":\"not found\"}", hint: "remove повертає null, якщо запису не було" },
      { on: "stdout", name: "405 і 404 для маршрутів", has: "PUT /notes/2 -> 405 {\"error\":\"method not allowed\"}\nGET /unknown -> 404 {\"error\":\"not found\"}", hint: "Маршрут розпізнається за шляхом, а метод перевіряється окремо" },
    ],
  },
  {
    ...base, id: "java-project-parallel-map", lesson: "java/108", xp: 50,
    title: "Проєкт: паралельний map із лімітом",
    context: "Масову обробку (завантаження, перевірку посилань, виклики API) запускають із лімітом паралелізму, зберігають порядок результатів і не забувають зупинити пул. Саме це робить цей невеликий обробник.",
    brief: [
      "Допишіть <code>parallelMap(input, task, limit)</code>: створіть пул із <code>limit</code> потоків, подайте по одному завданню на елемент і поверніть результати в тому ж порядку, що й вхідні дані.",
      "Якщо завдання кинуло виняток, киньте <code>TaskFailedException</code> з текстом <code>task &lt;номер&gt; failed: &lt;повідомлення причини&gt;</code> і самою причиною; обирайте завдання з найменшим номером. Пул треба зупинити за будь-якого результату (<code>try-with-resources</code> або <code>finally</code>), інакше програма не завершиться.",
      "<code>main</code> перевіряє три речі: порядок результатів, те, що два завдання справді йдуть паралельно (засувка), і те, що одночасно працює не більше трьох.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

public class Main {
    static class TaskFailedException extends RuntimeException {
        TaskFailedException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    static <T, R> List<R> parallelMap(List<T> input, Function<T, R> task, int limit) throws InterruptedException {
        // TODO: пул потоків фіксованого розміру limit, по одному завданню на елемент, результати у вхідному порядку;
        // помилка завдання з найменшим номером: TaskFailedException("task <номер> failed: <повідомлення причини>", причина);
        // пул має бути зупинений за будь-якого результату
        return new ArrayList<>();
    }

    public static void main(String[] args) throws Exception {
        AtomicInteger running = new AtomicInteger();
        AtomicInteger peak = new AtomicInteger();
        CountDownLatch pair = new CountDownLatch(2);
        boolean[] together = {true};

        List<Integer> squares = parallelMap(List.of(1, 2, 3, 4, 5, 6, 7, 8), n -> {
            peak.accumulateAndGet(running.incrementAndGet(), Math::max);
            try {
                if (n <= 2) {
                    pair.countDown();
                    if (!pair.await(2, TimeUnit.SECONDS)) {
                        together[0] = false;
                    }
                } else {
                    Thread.sleep(10);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            running.decrementAndGet();
            return n * n;
        }, 3);

        System.out.println("results: " + squares);
        System.out.println("parallel: " + together[0]);
        System.out.println("within limit: " + (peak.get() <= 3));
        try {
            parallelMap(List.of(1, 2, 3, 4, 5), n -> {
                if (n >= 4) {
                    throw new IllegalStateException("boom at " + n);
                }
                return n;
            }, 2);
        } catch (TaskFailedException e) {
            System.out.println("error: " + e.getMessage());
            System.out.println("cause: " + e.getCause().getClass().getSimpleName());
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "Результати у вхідному порядку", has: "results: [1, 4, 9, 16, 25, 36, 49, 64]", hint: "Зберігайте Future у списку в порядку подачі й читайте get() по черзі" },
      { on: "stdout", name: "Завдання йдуть паралельно", has: "parallel: true", hint: "Пул має мати кілька потоків: два перші завдання чекають одне одного на засувці" },
      { on: "stdout", name: "Ліміт не перевищено", has: "within limit: true", hint: "Розмір фіксованого пулу і є лімітом" },
      { on: "stdout", name: "Помилка з найменшим номером", has: "error: task 3 failed: boom at 4\ncause: IllegalStateException", hint: "ExecutionException.getCause() дає початковий виняток" },
      { on: "source", name: "Пул із фіксованим розміром", has: "newFixedThreadPool", hint: "Executors.newFixedThreadPool(limit)" },
      { on: "source", name: "Пул зупиняється", matches: "shutdown\\s*\\(|try\\s*\\(\\s*(final\\s+)?ExecutorService", hint: "try-with-resources або finally із shutdown()" },
      { on: "source", name: "Без parallelStream", has: "parallelStream", not: true, hint: "Ліміт задає власний пул, а не спільний пул JVM" },
    ],
  },
  {
    ...base, id: "java-project-ttl-cache", lesson: "java/109", xp: 60,
    title: "Проєкт: generic-кеш з TTL, LRU та метриками",
    context: "Кеші з TTL і витісненням стоять перед базами й зовнішніми API. Підставний годинник робить перевірку часу миттєвою, а лічильники влучань і промахів показують, чи кеш узагалі вигідний.",
    brief: [
      "Заготовка має generic-тип <code>TtlCache&lt;K, V&gt;</code> на <code>LinkedHashMap</code> у режимі доступу, підставний годинник і лічильники. Допишіть <code>put(key, value, ttl)</code>: запис отримує термін <code>now + ttl</code>; якщо розмір перевищив <code>capacity</code>, видаліть найдавніше використаний запис (перший у мапі) через ітератор.",
      "<code>get(key)</code>: немає запису це промах; запис протермінований (<code>now &gt;= expiresAt</code>) видаляється й теж рахується промахом; інакше це влучання. <code>sweep()</code> видаляє всі протерміновані записи й повертає їх кількість (видаляйте через <code>removeIf</code> чи ітератор).",
      "Очікуваний вивід закінчується рядками <code>swept: 1</code>, <code>get e: Optional[5]</code> і <code>stats: hits=2 misses=2</code>.",
    ],
    starter: raw`import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.Set;
import java.util.function.LongSupplier;

public class Main {
    static class TtlCache<K, V> {
        private record Entry<V>(V value, long expiresAt) { }

        private final int capacity;
        private final LongSupplier now;
        private final LinkedHashMap<K, Entry<V>> map = new LinkedHashMap<>(16, 0.75f, true);
        private long hits;
        private long misses;

        TtlCache(int capacity, LongSupplier now) {
            this.capacity = capacity;
            this.now = now;
        }

        void put(K key, V value, long ttl) {
            // TODO: запис із терміном now + ttl (наявний ключ оновіть); якщо розмір став більшим за capacity, видаліть найдавніше використаний запис
        }

        Optional<V> get(K key) {
            // TODO: немає запису або now >= expiresAt: промах (протермінований запис видаліть); інакше влучання
            return Optional.empty();
        }

        int sweep() {
            // TODO: видаліть усі протерміновані записи й поверніть їх кількість
            return 0;
        }

        int size() {
            return map.size();
        }

        Set<K> keys() {
            return map.keySet();
        }

        String stats() {
            return "hits=" + hits + " misses=" + misses;
        }
    }

    public static void main(String[] args) {
        long[] clock = {0};
        TtlCache<String, Integer> cache = new TtlCache<>(2, () -> clock[0]);
        cache.put("a", 1, 100);
        cache.put("b", 2, 100);
        System.out.println("get a: " + cache.get("a"));
        cache.put("c", 3, 100);
        System.out.println("get b: " + cache.get("b"));
        System.out.println("keys: " + cache.keys());
        clock[0] = 100;
        System.out.println("get a: " + cache.get("a"));
        cache.put("d", 4, 50);
        cache.put("e", 5, 500);
        System.out.println("keys: " + cache.keys());
        clock[0] = 160;
        System.out.println("swept: " + cache.sweep());
        System.out.println("get e: " + cache.get("e"));
        System.out.println("stats: " + cache.stats());
    }
}
`,
    checks: [
      { on: "stdout", name: "Витіснення LRU", has: "get a: Optional[1]\nget b: Optional.empty\nkeys: [a, c]", hint: "Після get(a) запис a найсвіжіший, тому при переповненні йде b" },
      { on: "stdout", name: "Протермінований запис зникає при читанні", has: "get a: Optional.empty\nkeys: [d, e]", hint: "Межа включно: now >= expiresAt; запис видаліть із мапи" },
      { on: "stdout", name: "Sweep видаляє прострочене", has: "swept: 1\nget e: Optional[5]", hint: "removeIf по значеннях мапи, різниця розмірів дає кількість" },
      { on: "stdout", name: "Метрики", has: "stats: hits=2 misses=2", hint: "Промах: немає запису або запис протермінований" },
      { on: "source", name: "Видалення без ConcurrentModificationException", matches: "removeIf|\\.remove\\(\\)", hint: "removeIf або Iterator.remove() під час обходу" },
      { on: "source", name: "Годинник підставний", has: "System.currentTimeMillis", not: true, hint: "Час беріть із now.getAsLong()" },
    ],
  },
  {
    ...base, id: "java-project-rate-limiter", lesson: "java/110", xp: 60,
    title: "Проєкт: token bucket і middleware з відповіддю 429",
    context: "Rate limiter захищає API від перевантаження й перебору паролів. Підставний годинник робить його поведінку детермінованою, а відповідь 429 з Retry-After підказує клієнтам, коли повторити запит.",
    brief: [
      "Заготовка містить записи, <code>Limiters</code> і <code>main</code> з підставним годинником. Допишіть <code>TokenBucket.allow()</code> під <code>synchronized</code>: порахуйте <code>gained = (now - last) / intervalMillis</code>; якщо більше нуля, додайте стільки жетонів (не більше <code>burst</code>) і зсуньте <code>last</code> на <code>gained * intervalMillis</code>. Якщо відро повне, <code>last = now</code>.",
      "Без жетонів поверніть <code>Decision(false, секунди)</code>, де секунди це <code>intervalMillis - (now - last)</code>, округлені вгору до цілих; інакше заберіть жетон і поверніть <code>Decision(true, 0)</code>.",
      "Допишіть <code>Limiters.get(client)</code> (знайти або атомарно створити відро через <code>computeIfAbsent</code>) і <code>rateLimit</code>: при відмові відповідь <code>429</code> із текстом <code>Retry-After: &lt;секунди&gt;</code>, наступний обробник не викликається.",
    ],
    starter: raw`import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

public class Main {
    record Decision(boolean allowed, long retryAfterSeconds) { }

    record Request(String client, String path) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    static class TokenBucket {
        private final int burst;
        private final long intervalMillis;
        private final LongSupplier now;
        private int tokens;
        private long last;

        TokenBucket(int burst, long intervalMillis, LongSupplier now) {
            this.burst = burst;
            this.intervalMillis = intervalMillis;
            this.now = now;
            this.tokens = burst;
            this.last = now.getAsLong();
        }

        synchronized Decision allow() {
            // TODO: поповніть відро за минулі інтервали (не більше burst), зсуньте last на цілу кількість інтервалів;
            // якщо відро повне, last = now; без жетонів: Decision(false, секунди до наступного жетона, округлені вгору); інакше заберіть жетон
            return new Decision(true, 0);
        }
    }

    static class Limiters {
        private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();
        private final int burst;
        private final long intervalMillis;
        private final LongSupplier now;

        Limiters(int burst, long intervalMillis, LongSupplier now) {
            this.burst = burst;
            this.intervalMillis = intervalMillis;
            this.now = now;
        }

        TokenBucket get(String client) {
            // TODO: відро цього клієнта: знайдіть або атомарно створіть
            return null;
        }

        int size() {
            return buckets.size();
        }
    }

    static Handler rateLimit(Limiters limiters, Handler next) {
        // TODO: якщо відро відмовило, відповідайте 429 і "Retry-After: <секунди>" без виклику next
        return next;
    }

    public static void main(String[] args) {
        long[] clock = {0};
        Limiters limiters = new Limiters(2, 1000, () -> clock[0]);
        Handler app = rateLimit(limiters, r -> new Response(200, "ok " + r.path()));
        String[][] calls = {{"a", "/x"}, {"a", "/y"}, {"a", "/z"}, {"b", "/x"}};
        for (String[] c : calls) {
            Response r = app.handle(new Request(c[0], c[1]));
            System.out.println(c[0] + " " + c[1] + " -> " + r.status() + " " + r.body());
        }
        clock[0] = 600;
        Response early = app.handle(new Request("a", "/w"));
        System.out.println("a /w -> " + early.status() + " " + early.body());
        clock[0] = 1000;
        Response later = app.handle(new Request("a", "/w"));
        System.out.println("a /w -> " + later.status() + " " + later.body());
        System.out.println("clients: " + limiters.size());
    }
}
`,
    checks: [
      { on: "stdout", name: "Сплеск до burst і відмова", has: "a /x -> 200 ok /x\na /y -> 200 ok /y\na /z -> 429 Retry-After: 1", hint: "Два жетони на старті: третій запит відхиляється" },
      { on: "stdout", name: "Клієнти не заважають одне одному", has: "b /x -> 200 ok /x", hint: "Кожному клієнту своє відро: computeIfAbsent за ключем" },
      { on: "stdout", name: "Відро поповнюється з часом", has: "a /w -> 429 Retry-After: 1\na /w -> 200 ok /w", hint: "Через 600 мс жетона ще немає, через 1000 мс є один" },
      { on: "stdout", name: "Два клієнти в мапі", has: "clients: 2", hint: "Відро створюється один раз на клієнта" },
      { on: "source", name: "Лімітер на клієнта створюється атомарно", has: "computeIfAbsent", hint: "buckets.computeIfAbsent(client, key -> new TokenBucket(...))" },
      { on: "source", name: "Метод allow синхронізований", matches: "synchronized\\s+Decision\\s+allow", hint: "Читання, підрахунок і запис стану мають бути однією операцією" },
    ],
  },
];
