// Еталонні рішення завдань Java, глава 10 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_10 = {
  "java-http-parse": raw`import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    record Request(String method, String path, Map<String, String> query, Map<String, String> headers, String body) { }

    static Request parseRequest(String raw) {
        int split = raw.indexOf("\r\n\r\n");
        String head = raw.substring(0, split);
        String body = raw.substring(split + 4);
        String[] lines = head.split("\r\n");
        String[] first = lines[0].split(" ");
        String target = first[1];
        String path = target;
        String queryText = "";
        int mark = target.indexOf('?');
        if (mark >= 0) {
            path = target.substring(0, mark);
            queryText = target.substring(mark + 1);
        }
        Map<String, String> query = new TreeMap<>();
        if (!queryText.isEmpty()) {
            for (String pair : queryText.split("&")) {
                String[] kv = pair.split("=", 2);
                String value = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
                query.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8), value);
            }
        }
        Map<String, String> headers = new TreeMap<>();
        for (int i = 1; i < lines.length; i++) {
            int colon = lines[i].indexOf(':');
            headers.put(lines[i].substring(0, colon).toLowerCase(), lines[i].substring(colon + 1).trim());
        }
        return new Request(first[0], path, query, headers, body);
    }

    static String formatResponse(int status, String reason, String body) {
        return "HTTP/1.1 " + status + " " + reason + "\r\n"
            + "Content-Type: text/plain\r\n"
            + "Content-Length: " + body.getBytes(StandardCharsets.UTF_8).length + "\r\n"
            + "\r\n" + body;
    }

    public static void main(String[] args) {
        String raw = "POST /notes?draft=true&tag=a%20b HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\n\r\n{\"title\":\"x\"}";
        Request r = parseRequest(raw);
        System.out.println("Method: " + r.method());
        System.out.println("Path: " + r.path());
        System.out.println("Query: " + r.query());
        System.out.println("Host: " + r.headers().get("host"));
        System.out.println("Body: " + r.body());
        System.out.println(formatResponse(404, "Not Found", "Not found").replace("\r\n", "|"));
    }
}
`,
  "java-handler-errors": raw`public class Main {
    record Request(String method, String path) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    static class NotFoundException extends RuntimeException {
        NotFoundException(String message) {
            super(message);
        }
    }

    static Handler safe(Handler inner) {
        return req -> {
            try {
                return inner.handle(req);
            } catch (NotFoundException e) {
                return new Response(404, "Not found: " + e.getMessage());
            } catch (IllegalArgumentException e) {
                return new Response(400, "Bad request: " + e.getMessage());
            } catch (RuntimeException e) {
                return new Response(500, "Server error");
            }
        };
    }

    public static void main(String[] args) {
        Handler ok = req -> new Response(200, "hello");
        Handler missing = req -> {
            throw new NotFoundException("user 7");
        };
        Handler bad = req -> {
            throw new IllegalArgumentException("empty name");
        };
        Handler broken = req -> {
            throw new IllegalStateException("db password is secret");
        };
        for (Handler h : new Handler[] {ok, missing, bad, broken}) {
            Response r = safe(h).handle(new Request("GET", "/x"));
            System.out.println(r.status() + " " + r.body());
        }
    }
}
`,
  "java-router": raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    record Request(String method, String path) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Map<String, String> params);
    }

    record Route(String method, String pattern, Handler handler) { }

    static Map<String, String> match(String pattern, String path) {
        String[] p = pattern.split("/");
        String[] s = path.split("/");
        if (p.length != s.length) {
            return null;
        }
        Map<String, String> params = new HashMap<>();
        for (int i = 0; i < p.length; i++) {
            if (p[i].startsWith("{") && p[i].endsWith("}")) {
                params.put(p[i].substring(1, p[i].length() - 1), s[i]);
            } else if (!p[i].equals(s[i])) {
                return null;
            }
        }
        return params;
    }

    static class Router {
        private final List<Route> routes = new ArrayList<>();

        void add(String method, String pattern, Handler handler) {
            routes.add(new Route(method, pattern, handler));
        }

        Response handle(Request req) {
            boolean pathMatched = false;
            for (Route route : routes) {
                Map<String, String> params = match(route.pattern(), req.path());
                if (params == null) {
                    continue;
                }
                pathMatched = true;
                if (route.method().equals(req.method())) {
                    return route.handler().handle(params);
                }
            }
            return pathMatched ? new Response(405, "method not allowed") : new Response(404, "not found");
        }
    }

    public static void main(String[] args) {
        Router router = new Router();
        router.add("GET", "/users/me", p -> new Response(200, "me"));
        router.add("GET", "/users/{id}", p -> new Response(200, "user " + p.get("id")));
        router.add("GET", "/users", p -> new Response(200, "all users"));
        String[][] calls = {{"GET", "/users/42"}, {"GET", "/users/me"}, {"GET", "/users"}, {"POST", "/users/42"}, {"GET", "/nothing"}};
        for (String[] c : calls) {
            Response r = router.handle(new Request(c[0], c[1]));
            System.out.println(c[0] + " " + c[1] + " -> " + r.status() + " " + r.body());
        }
    }
}
`,
  "java-notes-api": raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    record Request(String method, String path, String body) { }

    record Response(int status, String body) { }

    static class NotesApi {
        private final Map<Integer, String> titles = new HashMap<>();
        private int nextId = 1;

        private static String json(int id, String title) {
            return "{\"id\":" + id + ",\"title\":\"" + title + "\",\"done\":false}";
        }

        private static Response error(int status, String message) {
            return new Response(status, "{\"error\":\"" + message + "\"}");
        }

        Response handle(Request req) {
            if (req.path().equals("/notes") && req.method().equals("POST")) {
                String title = req.body() == null ? "" : req.body().trim();
                if (title.isEmpty()) {
                    return error(400, "title is required");
                }
                int id = nextId++;
                titles.put(id, title);
                return new Response(201, json(id, title));
            }
            if (req.path().startsWith("/notes/")) {
                int id;
                try {
                    id = Integer.parseInt(req.path().substring("/notes/".length()));
                } catch (NumberFormatException e) {
                    return error(400, "invalid id");
                }
                if (req.method().equals("GET")) {
                    String title = titles.get(id);
                    return title == null ? error(404, "note " + id + " not found") : new Response(200, json(id, title));
                }
                if (req.method().equals("DELETE")) {
                    return titles.remove(id) == null ? error(404, "note " + id + " not found") : new Response(204, "");
                }
            }
            return error(404, "not found");
        }
    }

    static void call(NotesApi api, String method, String path, String body) {
        Response r = api.handle(new Request(method, path, body));
        System.out.println((r.status() + " " + r.body()).trim());
    }

    public static void main(String[] args) {
        NotesApi api = new NotesApi();
        call(api, "POST", "/notes", "Buy milk");
        call(api, "GET", "/notes/1", "");
        call(api, "GET", "/notes/9", "");
        call(api, "DELETE", "/notes/1", "");
        call(api, "GET", "/notes/1", "");
        call(api, "POST", "/notes", "   ");
        call(api, "GET", "/notes/abc", "");
    }
}
`,
  "java-middleware-chain": raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    record Request(String method, String path, String token) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    interface Middleware {
        Handler wrap(Handler next);
    }

    static Middleware logging(List<String> log) {
        return next -> req -> {
            log.add("-> " + req.method() + " " + req.path());
            Response r = next.handle(req);
            log.add("<- " + r.status());
            return r;
        };
    }

    static Middleware auth(String expected) {
        return next -> req -> {
            if (!expected.equals(req.token())) {
                return new Response(401, "unauthorized");
            }
            return next.handle(req);
        };
    }

    static Handler chain(Handler core, List<Middleware> middlewares) {
        Handler h = core;
        for (int i = middlewares.size() - 1; i >= 0; i--) {
            h = middlewares.get(i).wrap(h);
        }
        return h;
    }

    public static void main(String[] args) {
        List<String> log = new ArrayList<>();
        Handler core = req -> new Response(200, "secret data");
        Handler app = chain(core, List.of(logging(log), auth("t0ken")));
        System.out.println(app.handle(new Request("GET", "/secret", "t0ken")).status());
        System.out.println(app.handle(new Request("GET", "/secret", null)).status());
        System.out.println(log);
    }
}
`,
  "java-retry-backoff": raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Main {
    record Response(int status) { }

    record Result(int status, int attempts, List<Long> delays) { }

    static Result retry(Supplier<Response> call, int maxAttempts) {
        List<Long> delays = new ArrayList<>();
        int status = 0;
        int attempt = 0;
        while (attempt < maxAttempts) {
            attempt++;
            status = call.get().status();
            if (status < 500) {
                break;
            }
            if (attempt < maxAttempts) {
                delays.add(100L << (attempt - 1));
            }
        }
        return new Result(status, attempt, delays);
    }

    static Supplier<Response> sequence(int... statuses) {
        int[] index = {0};
        return () -> new Response(statuses[Math.min(index[0]++, statuses.length - 1)]);
    }

    static void show(String label, Result r) {
        System.out.println(label + ": status=" + r.status() + " attempts=" + r.attempts() + " delays=" + r.delays());
    }

    public static void main(String[] args) {
        show("Case 1", retry(sequence(503, 503, 200), 5));
        show("Case 2", retry(sequence(503), 3));
        show("Case 3", retry(sequence(404), 5));
    }
}
`,
  "java-query-parse": raw`import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    static Map<String, List<String>> parseQuery(String raw) {
        Map<String, List<String>> result = new TreeMap<>();
        for (String pair : raw.split("&")) {
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String value = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            result.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
        }
        return result;
    }

    static String buildQuery(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append('&');
            }
            sb.append(URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8))
                .append('=')
                .append(URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println("Query: " + parseQuery("q=a%20b&a=1&a=2&flag&empty="));
        Map<String, String> params = new TreeMap<>();
        params.put("name", "Ira Z");
        params.put("city", "Kyiv & Lviv");
        System.out.println("Built: " + buildQuery(params));
    }
}
`,
  "java-graceful-shutdown": raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

public class Main {
    static class GracefulServer {
        private final AtomicBoolean stopping = new AtomicBoolean();
        private final AtomicInteger inFlight = new AtomicInteger();

        int handle(Supplier<Integer> work) {
            if (stopping.get()) {
                return 503;
            }
            inFlight.incrementAndGet();
            try {
                return work.get();
            } finally {
                inFlight.decrementAndGet();
            }
        }

        boolean shutdown(long timeoutMs) throws InterruptedException {
            stopping.set(true);
            long deadline = System.currentTimeMillis() + timeoutMs;
            while (inFlight.get() > 0 && System.currentTimeMillis() < deadline) {
                Thread.sleep(5);
            }
            return inFlight.get() == 0;
        }

        boolean isStopping() {
            return stopping.get();
        }

        int inFlight() {
            return inFlight.get();
        }
    }

    public static void main(String[] args) throws Exception {
        GracefulServer server = new GracefulServer();
        CountDownLatch entered = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        int[] first = new int[1];
        Thread slow = new Thread(() -> first[0] = server.handle(() -> {
            entered.countDown();
            try {
                release.await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return 200;
        }));
        slow.start();
        entered.await();
        System.out.println("In flight: " + server.inFlight());
        boolean[] completed = new boolean[1];
        Thread stopper = new Thread(() -> {
            try {
                completed[0] = server.shutdown(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        stopper.start();
        for (int i = 0; i < 1000 && !server.isStopping(); i++) {
            Thread.sleep(1);
        }
        System.out.println("New request: " + server.handle(() -> 200));
        release.countDown();
        slow.join();
        stopper.join();
        System.out.println("Shutdown completed: " + completed[0]);
        System.out.println("First request: " + first[0]);
        System.out.println("In flight: " + server.inFlight());
    }
}
`,
};
