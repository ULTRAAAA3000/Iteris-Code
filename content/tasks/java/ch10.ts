// Практичні завдання глави «Мережа й сервіси» (уроки 92–99). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Мережі тут немає: запити й відповіді — звичайні об'єкти в пам'яті, а чекання робиться через засувки, а не через sleep.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "java-http-parse", lesson: "java/92", xp: 30,
    title: "HTTP: розбір запиту й формування відповіді",
    context: "HTTP-запит — це текст: рядок запиту, заголовки, порожній рядок і тіло. Розібравши його вручну, ви побачите, що саме робить будь-який сервер, перш ніж викликати вашу бізнес-логіку.",
    brief: [
      "Допишіть <code>parseRequest(raw)</code>: метод і шлях (без query), параметри query у <code>TreeMap</code> (значення декодуйте через <code>URLDecoder</code>), заголовки (імена в нижньому регістрі) і тіло після порожнього рядка.",
      "Допишіть <code>formatResponse(status, reason, body)</code> зі <code>Content-Type: text/plain</code> і <code>Content-Length</code> у байтах UTF-8 (рядки через <code>\\r\\n</code>). Очікуваний вивід містить <code>Query: {draft=true, tag=a b}</code> та відповідь <code>HTTP/1.1 404 Not Found|Content-Type: text/plain|Content-Length: 9||Not found</code>.",
    ],
    starter: raw`import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    record Request(String method, String path, Map<String, String> query, Map<String, String> headers, String body) { }

    static Request parseRequest(String raw) {
        // TODO: відокремте тіло за "\r\n\r\n"; перший рядок: метод, ціль, версія; ціль ділиться на шлях і query;
        // параметри query декодуйте URLDecoder; заголовки: ім'я у нижньому регістрі
        return null;
    }

    static String formatResponse(int status, String reason, String body) {
        // TODO: HTTP/1.1 <status> <reason>, Content-Type: text/plain, Content-Length (байти UTF-8), порожній рядок, тіло
        return "";
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
    checks: [
      { on: "stdout", name: "Метод і шлях без query", has: "Method: POST\nPath: /notes", hint: "Шлях — частина цілі до знака питання" },
      { on: "stdout", name: "Параметри query декодовано", has: "Query: {draft=true, tag=a b}", hint: "URLDecoder.decode(value, StandardCharsets.UTF_8): %20 стає пробілом" },
      { on: "stdout", name: "Заголовок і тіло", has: "Host: example.com\nBody: {\"title\":\"x\"}", hint: "Тіло починається після порожнього рядка \\r\\n\\r\\n" },
      { on: "stdout", name: "Відповідь із довжиною в байтах", has: "HTTP/1.1 404 Not Found|Content-Type: text/plain|Content-Length: 9||Not found", hint: "body.getBytes(StandardCharsets.UTF_8).length" },
      { on: "source", name: "Використано URLDecoder", has: "URLDecoder", hint: "Значення query передаються у відсотковому кодуванні" },
    ],
  },
  {
    ...base, id: "java-handler-errors", lesson: "java/93", xp: 30,
    title: "Обробник із єдиним перетворенням винятків",
    context: "Бізнес-логіка кидає винятки, а верхній шар перетворює їх на відповіді: 404, 400 або 500. Для 500 клієнт не повинен бачити технічних подробиць, наприклад пароль у повідомленні.",
    brief: [
      "Допишіть <code>safe(Handler)</code>: <code>NotFoundException</code> дає <code>404</code> і <code>Not found: &lt;повідомлення&gt;</code>, <code>IllegalArgumentException</code> — <code>400</code> і <code>Bad request: ...</code>, будь-який інший <code>RuntimeException</code> — <code>500</code> і лише <code>Server error</code>.",
      "Очікуваний вивід: <code>200 hello</code>, <code>404 Not found: user 7</code>, <code>400 Bad request: empty name</code>, <code>500 Server error</code>.",
    ],
    starter: raw`public class Main {
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
        // TODO: try/catch у новому обробнику: NotFoundException 404, IllegalArgumentException 400, RuntimeException 500
        return inner;
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
    checks: [
      { on: "stdout", name: "Успіх, 404 і 400", has: "200 hello\n404 Not found: user 7\n400 Bad request: empty name", hint: "Повідомлення винятку додається після префікса" },
      { on: "stdout", name: "500 без технічних подробиць", has: "500 Server error", hint: "Не вставляйте getMessage() у відповідь 500" },
      { on: "source", name: "Порядок catch: вужчі типи раніше за ширші", matches: "catch\\s*\\(\\s*NotFoundException[\\s\\S]*catch\\s*\\(\\s*IllegalArgumentException[\\s\\S]*catch\\s*\\(\\s*RuntimeException", hint: "NotFoundException, потім IllegalArgumentException, потім RuntimeException" },
    ],
  },
  {
    ...base, id: "java-router", lesson: "java/94", xp: 40,
    title: "Маршрутизатор із параметрами шляху",
    context: "Маршрутизатор зіставляє метод і шлях із таблицею: літерали мають збігтися, змінні в дужках захоплюють значення. Якщо шлях є, а метод інший, повертається 405, інакше 404.",
    brief: [
      "Допишіть <code>match(pattern, path)</code>: сегменти за <code>/</code>, кількість збігається, <code>{name}</code> захоплює значення, літерали рівні; <code>null</code>, якщо не збіглося.",
      "Допишіть <code>Router.handle</code>: перший маршрут зі збігом шляху й методу виконується; збіг шляху з іншим методом дає <code>405 method not allowed</code>; інакше <code>404 not found</code>. Конкретний маршрут <code>/users/me</code> зареєстровано раніше за <code>/users/{id}</code>.",
    ],
    starter: raw`import java.util.ArrayList;
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
        // TODO: розбийте за "/"; кількість сегментів має збігатися; {name} захоплює значення; літерали рівні
        return null;
    }

    static class Router {
        private final List<Route> routes = new ArrayList<>();

        void add(String method, String pattern, Handler handler) {
            routes.add(new Route(method, pattern, handler));
        }

        Response handle(Request req) {
            // TODO: перший збіг шляху й методу; збіг шляху з іншим методом дає 405; інакше 404
            return new Response(404, "not found");
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
    checks: [
      { on: "stdout", name: "Параметр шляху: «user 42»", has: "GET /users/42 -> 200 user 42", hint: "{id} захоплює 42" },
      { on: "stdout", name: "Конкретний маршрут і колекція", has: "GET /users/me -> 200 me\nGET /users -> 200 all users", hint: "/users/me зареєстровано раніше за /users/{id}, тож виграє він" },
      { on: "stdout", name: "405 для чужого методу й 404 для невідомого шляху", has: "POST /users/42 -> 405 method not allowed\nGET /nothing -> 404 not found", hint: "Запам'ятайте, що шлях збігся, навіть якщо метод інший" },
      { on: "source", name: "Є розбір сегментів за /", matches: "split\\(\\s*\"/\"", hint: "pattern.split(\"/\"), path.split(\"/\")" },
    ],
  },
  {
    ...base, id: "java-notes-api", lesson: "java/95", xp: 40,
    title: "CRUD-API нотаток у пам'яті",
    context: "Мінімальний REST-сервіс: створення, читання й видалення нотаток із правильними статусами (201, 200, 204, 404, 400) і єдиним форматом помилок у JSON. Сховищем служить мапа в пам'яті.",
    brief: [
      "Допишіть <code>NotesApi.handle(Request)</code>: <code>POST /notes</code> (тіло — заголовок; порожнє дає 400 <code>{\"error\":\"title is required\"}</code>, інакше 201 і JSON нотатки), <code>GET /notes/{id}</code> (200 або 404 <code>{\"error\":\"note N not found\"}</code>), <code>DELETE /notes/{id}</code> (204 або 404).",
      "Нечисловий id дає 400 <code>{\"error\":\"invalid id\"}</code>. Формат нотатки: <code>{\"id\":1,\"title\":\"Buy milk\",\"done\":false}</code>.",
    ],
    starter: raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    record Request(String method, String path, String body) { }

    record Response(int status, String body) { }

    static class NotesApi {
        private final Map<Integer, String> titles = new HashMap<>();
        private int nextId = 1;

        Response handle(Request req) {
            // TODO: POST /notes, GET /notes/{id}, DELETE /notes/{id} за описом; інше: 404 {"error":"not found"}
            return new Response(404, "{\"error\":\"not found\"}");
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
    checks: [
      { on: "stdout", name: "Створення: 201 із JSON нотатки", has: "201 {\"id\":1,\"title\":\"Buy milk\",\"done\":false}", hint: "Присвойте id з лічильника й поверніть створену нотатку" },
      { on: "stdout", name: "Читання й відсутня нотатка", has: "200 {\"id\":1,\"title\":\"Buy milk\",\"done\":false}\n404 {\"error\":\"note 9 not found\"}", hint: "GET за існуючим id дає 200, за відсутнім 404" },
      { on: "stdout", name: "Видалення: 204, повторне читання 404", has: "204\n404 {\"error\":\"note 1 not found\"}", hint: "DELETE видаляє з мапи й повертає 204 без тіла" },
      { on: "stdout", name: "Валідація: порожній заголовок і некоректний id", has: "400 {\"error\":\"title is required\"}\n400 {\"error\":\"invalid id\"}", hint: "isBlank() для порожнього заголовка; NumberFormatException для id" },
      { on: "source", name: "Нечисловий id ловиться через NumberFormatException", has: "NumberFormatException", hint: "try { Integer.parseInt(...) } catch (NumberFormatException e) { ... }" },
    ],
  },
  {
    ...base, id: "java-middleware-chain", lesson: "java/96", xp: 35,
    title: "Middleware: auth і ланцюг",
    context: "Наскрізні функції не змішують із бізнес-логікою: журналювання бачить усі запити, автентифікація зупиняє неавторизованих. Ланцюг збирають так, щоб перший у списку був найзовнішнім.",
    brief: [
      "Допишіть <code>auth(expected)</code>: якщо <code>token</code> не дорівнює очікуваному, поверніть <code>401 unauthorized</code> і не викликайте <code>next</code>. Допишіть <code>chain(core, middlewares)</code>: обгортайте у зворотному порядку.",
      "Журнал має показати й відхилений запит. Очікуваний вивід: <code>200</code>, <code>401</code> і <code>[-&gt; GET /secret, &lt;- 200, -&gt; GET /secret, &lt;- 401]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
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
        // TODO: якщо !expected.equals(req.token()): повернути 401 "unauthorized" без next.handle
        return next -> next;
    }

    static Handler chain(Handler core, List<Middleware> middlewares) {
        // TODO: обгорніть core у зворотному порядку, щоб перший middleware став найзовнішнім
        return core;
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
    checks: [
      { on: "stdout", name: "Авторизований запит і відмова", has: "200\n401", hint: "Без токена auth повертає 401 і не викликає next" },
      { on: "stdout", name: "Журнал бачить обидва запити", has: "[-> GET /secret, <- 200, -> GET /secret, <- 401]", hint: "logging має бути найзовнішнім: першим у списку" },
      { on: "source", name: "Ланцюг збирається у зворотному порядку", matches: "for\\s*\\([^)]*--[^)]*\\)|size\\(\\)\\s*-\\s*1", hint: "for (int i = middlewares.size() - 1; i >= 0; i--) h = middlewares.get(i).wrap(h);" },
      { on: "source", name: "Є 401 у auth", has: "401", hint: "new Response(401, \"unauthorized\")" },
    ],
  },
  {
    ...base, id: "java-retry-backoff", lesson: "java/97", xp: 35,
    title: "Повторні спроби з експоненційною затримкою",
    context: "Клієнт повторює запит лише при тимчасових помилках сервера (5xx), із зростаючою затримкою, а помилки клієнта (4xx) не повторює. Затримки тут лише записуються, а не виконуються, тож результат детермінований.",
    brief: [
      "Допишіть <code>retry(call, maxAttempts)</code>: виконуйте <code>call.get()</code>; якщо статус менший за 500, повертайте результат; після невдалої спроби (не останньої) запишіть затримку <code>100L &lt;&lt; (attempt - 1)</code> мс.",
      "Очікуваний вивід: <code>Case 1: status=200 attempts=3 delays=[100, 200]</code>, <code>Case 2: status=503 attempts=3 delays=[100, 200]</code>, <code>Case 3: status=404 attempts=1 delays=[]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Main {
    record Response(int status) { }

    record Result(int status, int attempts, List<Long> delays) { }

    static Result retry(Supplier<Response> call, int maxAttempts) {
        // TODO: до maxAttempts спроб; status < 500 завершує; після невдалої не останньої спроби delays.add(100L << (attempt - 1))
        return new Result(0, 0, List.of());
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
    checks: [
      { on: "stdout", name: "Успіх після двох тимчасових помилок", has: "Case 1: status=200 attempts=3 delays=[100, 200]", hint: "Затримки 100 і 200 мс записуються між спробами 1-2 та 2-3" },
      { on: "stdout", name: "Вичерпано спроби", has: "Case 2: status=503 attempts=3 delays=[100, 200]", hint: "Після останньої спроби затримка не додається" },
      { on: "stdout", name: "Помилка клієнта не повторюється", has: "Case 3: status=404 attempts=1 delays=[]", hint: "Статус менше за 500 повертається одразу" },
      { on: "source", name: "Експоненційна затримка зсувом", matches: "100L\\s*<<\\s*\\(?\\s*attempt", hint: "100L << (attempt - 1)" },
    ],
  },
  {
    ...base, id: "java-query-parse", lesson: "java/98", xp: 30,
    title: "Query-рядок: розбір і побудова",
    context: "Параметри запиту передаються у відсотковому кодуванні, а ключ може повторюватись або не мати значення. Розбір і побудова query-рядка потрібні в будь-якому сервері й клієнті.",
    brief: [
      "Допишіть <code>parseQuery(raw)</code>: пари через <code>&amp;</code>, ключ і значення декодуйте <code>URLDecoder</code>, значення зберігайте в списках (повторний ключ додає значення, ключ без <code>=</code> має порожнє значення), результат у <code>TreeMap</code>.",
      "Допишіть <code>buildQuery(params)</code>: пари <code>ключ=значення</code> із <code>URLEncoder</code> через <code>&amp;</code> у порядку ключів. Очікуваний вивід: <code>Query: {a=[1, 2], empty=[], flag=[], q=[a b]}</code> і <code>Built: city=Kyiv+%26+Lviv&amp;name=Ira+Z</code>.",
    ],
    starter: raw`import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    static Map<String, List<String>> parseQuery(String raw) {
        // TODO: split("&"), кожну пару ділить split("=", 2); декодуйте URLDecoder; повторні ключі додають значення
        return new TreeMap<>();
    }

    static String buildQuery(Map<String, String> params) {
        // TODO: пари ключ=значення з URLEncoder.encode(..., StandardCharsets.UTF_8) через &
        return "";
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
    checks: [
      { on: "stdout", name: "Розібраний query зі списками значень", has: "Query: {a=[1, 2], empty=[], flag=[], q=[a b]}", hint: "computeIfAbsent(key, k -> new ArrayList<>()).add(value)" },
      { on: "stdout", name: "Побудований query з кодуванням", has: "Built: city=Kyiv+%26+Lviv&name=Ira+Z", hint: "URLEncoder: пробіл стає +, амперсанд %26" },
      { on: "source", name: "Використано URLDecoder і URLEncoder", matches: "URLDecoder\\.decode[\\s\\S]*URLEncoder\\.encode|URLEncoder\\.encode[\\s\\S]*URLDecoder\\.decode", hint: "Обидва класи java.net" },
    ],
  },
  {
    ...base, id: "java-graceful-shutdown", lesson: "java/99", xp: 40,
    title: "Коректне завершення сервера",
    context: "Під час зупинки сервер перестає приймати нові запити (503), але чекає, поки завершаться ті, що вже виконуються. Поведінку перевіряють без sleep: засувки точно відтворюють порядок подій.",
    brief: [
      "Допишіть <code>GracefulServer</code>: <code>stopping</code> (<code>AtomicBoolean</code>), <code>inFlight</code> (<code>AtomicInteger</code>), <code>handle</code> (503 після зупинки; інакше лічильник, робота, зменшення у <code>finally</code>), <code>shutdown(timeoutMs)</code> (ставить прапорець і чекає нуля до тайм-ауту) і геттери.",
      "Очікуваний вивід: <code>In flight: 1</code>, <code>New request: 503</code>, <code>Shutdown completed: true</code>, <code>First request: 200</code>, <code>In flight: 0</code>.",
    ],
    starter: raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

public class Main {
    static class GracefulServer {
        // TODO: поля AtomicBoolean stopping і AtomicInteger inFlight

        int handle(Supplier<Integer> work) {
            // TODO: якщо stopping: 503; інакше inFlight++, work.get(), inFlight-- у finally
            return work.get();
        }

        boolean shutdown(long timeoutMs) throws InterruptedException {
            // TODO: stopping = true; чекайте (Thread.sleep(5) у циклі), поки inFlight не стане 0, не довше timeoutMs
            return true;
        }

        boolean isStopping() {
            return false;
        }

        int inFlight() {
            return 0;
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
    checks: [
      { on: "stdout", name: "Повільний запит у польоті", has: "In flight: 1", hint: "inFlight збільшується перед виконанням роботи" },
      { on: "stdout", name: "Новий запит після зупинки: 503", has: "New request: 503", hint: "Після shutdown(...) прапорець stopping істинний" },
      { on: "stdout", name: "Зупинка дочекалась поточного запиту", has: "Shutdown completed: true\nFirst request: 200\nIn flight: 0", hint: "shutdown повертає true, коли inFlight став нулем до тайм-ауту" },
      { on: "source", name: "Лічильник зменшується у finally", matches: "finally\\s*\\{[\\s\\S]*decrementAndGet", hint: "try { return work.get(); } finally { inFlight.decrementAndGet(); }" },
      { on: "source", name: "Використано AtomicBoolean і AtomicInteger", matches: "AtomicBoolean[\\s\\S]*AtomicInteger|AtomicInteger[\\s\\S]*AtomicBoolean", hint: "Прапорець і лічильник для потокобезпеки" },
    ],
  },
];
