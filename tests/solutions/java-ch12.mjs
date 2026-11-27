// Еталонні рішення завдань Java, глава 12 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_12 = {
  "java-project-textstats": raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    private static final Pattern END = Pattern.compile("[\\p{L}\\p{N}][.!?]+");

    static List<String> words(String text) {
        List<String> result = new ArrayList<>();
        for (String w : text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}']+")) {
            if (!w.isEmpty()) {
                result.add(w);
            }
        }
        return result;
    }

    static Map<String, Integer> frequencies(List<String> words) {
        Map<String, Integer> freq = new HashMap<>();
        for (String w : words) {
            freq.merge(w, 1, Integer::sum);
        }
        return freq;
    }

    static List<String> top(Map<String, Integer> freq, int n) {
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(freq.entrySet());
        entries.sort(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()));
        List<String> result = new ArrayList<>();
        for (Map.Entry<String, Integer> e : entries.subList(0, Math.min(n, entries.size()))) {
            result.add(e.getKey() + "=" + e.getValue());
        }
        return result;
    }

    static String longest(List<String> words) {
        String best = "";
        for (String w : words) {
            int len = w.codePointCount(0, w.length());
            int bestLen = best.codePointCount(0, best.length());
            if (len > bestLen || (len == bestLen && w.compareTo(best) < 0)) {
                best = w;
            }
        }
        return best;
    }

    static int sentences(String text) {
        Matcher m = END.matcher(text);
        int count = 0;
        while (m.find()) {
            count++;
        }
        return count;
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
  "java-project-notes-api": raw`import java.util.ArrayList;
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
        String[] parts = r.path().split("/");
        if (parts.length < 2 || !parts[1].equals("notes") || parts.length > 3) {
            return error(404, "not found");
        }
        String method = r.method();
        if (parts.length == 2) {
            return switch (method) {
                case "POST" -> create(r.body());
                case "GET" -> list();
                default -> error(405, "method not allowed");
            };
        }
        return switch (method) {
            case "GET" -> get(parts[2]);
            case "DELETE" -> remove(parts[2]);
            default -> error(405, "method not allowed");
        };
    }

    static Response create(String body) {
        Matcher m = TITLE.matcher(body);
        if (!m.find() || m.group(1).isBlank()) {
            return error(400, "title is required");
        }
        Note note = new Note(IDS.incrementAndGet(), m.group(1).trim());
        NOTES.put(note.id(), note);
        return new Response(201, json(note));
    }

    static Integer parseId(String rawId) {
        try {
            return Integer.parseInt(rawId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static Response get(String rawId) {
        Integer id = parseId(rawId);
        if (id == null) {
            return error(400, "invalid id");
        }
        Note note = NOTES.get(id);
        return note == null ? error(404, "not found") : new Response(200, json(note));
    }

    static Response remove(String rawId) {
        Integer id = parseId(rawId);
        if (id == null) {
            return error(400, "invalid id");
        }
        return NOTES.remove(id) == null ? error(404, "not found") : new Response(204, "");
    }

    static Response list() {
        List<String> items = new ArrayList<>();
        NOTES.values().stream().sorted(Comparator.comparingInt(Note::id)).forEach(n -> items.add(json(n)));
        return new Response(200, "[" + String.join(",", items) + "]");
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
  "java-project-parallel-map": raw`import java.util.ArrayList;
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
        try (ExecutorService pool = Executors.newFixedThreadPool(limit)) {
            List<Future<R>> futures = new ArrayList<>();
            for (T item : input) {
                futures.add(pool.submit(() -> task.apply(item)));
            }
            List<R> results = new ArrayList<>();
            for (int i = 0; i < futures.size(); i++) {
                try {
                    results.add(futures.get(i).get());
                } catch (ExecutionException e) {
                    throw new TaskFailedException("task " + i + " failed: " + e.getCause().getMessage(), e.getCause());
                }
            }
            return results;
        }
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
  "java-project-ttl-cache": raw`import java.util.Iterator;
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
            map.put(key, new Entry<>(value, now.getAsLong() + ttl));
            if (map.size() > capacity) {
                Iterator<K> eldest = map.keySet().iterator();
                eldest.next();
                eldest.remove();
            }
        }

        Optional<V> get(K key) {
            Entry<V> entry = map.get(key);
            if (entry == null) {
                misses++;
                return Optional.empty();
            }
            if (now.getAsLong() >= entry.expiresAt()) {
                map.remove(key);
                misses++;
                return Optional.empty();
            }
            hits++;
            return Optional.of(entry.value());
        }

        int sweep() {
            long time = now.getAsLong();
            int before = map.size();
            map.values().removeIf(e -> time >= e.expiresAt());
            return before - map.size();
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
  "java-project-rate-limiter": raw`import java.util.concurrent.ConcurrentHashMap;
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
            long time = now.getAsLong();
            long gained = (time - last) / intervalMillis;
            if (gained > 0) {
                tokens = (int) Math.min(burst, tokens + gained);
                last += gained * intervalMillis;
            }
            if (tokens == burst) {
                last = time;
            }
            if (tokens == 0) {
                long wait = intervalMillis - (time - last);
                return new Decision(false, (wait + 999) / 1000);
            }
            tokens--;
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
            return buckets.computeIfAbsent(client, key -> new TokenBucket(burst, intervalMillis, now));
        }

        int size() {
            return buckets.size();
        }
    }

    static Handler rateLimit(Limiters limiters, Handler next) {
        return request -> {
            Decision decision = limiters.get(request.client()).allow();
            if (!decision.allowed()) {
                return new Response(429, "Retry-After: " + decision.retryAfterSeconds());
            }
            return next.handle(request);
        };
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
};
