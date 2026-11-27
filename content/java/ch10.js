export const LESSONS_10 = [
  {
    t: "HTTP: запит, відповідь і статус-коди",
    ch: "Мережа й сервіси",
    easy: String.raw`HTTP — це листування за чіткими правилами: клієнт пише лист з адресою, дією й вкладенням, а сервер відповідає листом зі статусом і змістом. Усе це — просто текст у визначеному форматі.`,
    p: [
      String.raw`HTTP — протокол прикладного рівня «запит-відповідь»: клієнт (браузер, програма) надсилає запит, сервер повертає відповідь. Кожен запит незалежний (протокол не має стану), а все потрібне передається в самому запиті. Поверх нього працюють вебсайти, REST API, мобільні застосунки та більшість мікросервісів. Транспортом є TCP (HTTP/1.1, HTTP/2) або QUIC (HTTP/3), але ми працюємо на рівні повідомлень.`,
      String.raw`Запит складається з рядка запиту (<code>GET /users/42?lang=uk HTTP/1.1</code>), заголовків (<code>Host: example.com</code>, <code>Accept: application/json</code>), порожнього рядка й необов'язкового тіла. Метод вказує дію, шлях — ресурс, а параметри запиту (query) йдуть після знака питання парами <code>ключ=значення</code>, розділеними амперсандом. Спеціальні символи кодуються у відсотковий формат (<code>%20</code> для пробілу).`,
      String.raw`Методи: <code>GET</code> (прочитати, без змін), <code>POST</code> (створити чи виконати дію), <code>PUT</code> (замінити повністю), <code>PATCH</code> (змінити частково), <code>DELETE</code> (видалити), а ще <code>HEAD</code> і <code>OPTIONS</code>. Безпечні методи (GET, HEAD) не змінюють стан сервера; ідемпотентні (GET, PUT, DELETE) можна повторювати без додаткових наслідків. Ця різниця важлива для повторних спроб і кешування.`,
      String.raw`Відповідь: рядок статусу (<code>HTTP/1.1 200 OK</code>), заголовки (<code>Content-Type: application/json; charset=utf-8</code>, <code>Content-Length: 27</code>), порожній рядок і тіло. Рядки відокремлені парою символів <code>\r\n</code> (CRLF). Тіло може мати будь-який формат: JSON, HTML, зображення; тип вказує заголовок <code>Content-Type</code>, а довжину — <code>Content-Length</code>.`,
      String.raw`Статус-коди групуються: 1xx — інформаційні; 2xx — успіх (<code>200 OK</code>, <code>201 Created</code>, <code>204 No Content</code>); 3xx — перенаправлення (<code>301</code>, <code>302</code>, <code>304 Not Modified</code>); 4xx — помилка клієнта (<code>400 Bad Request</code>, <code>401 Unauthorized</code>, <code>403 Forbidden</code>, <code>404 Not Found</code>, <code>405 Method Not Allowed</code>, <code>409 Conflict</code>, <code>429 Too Many Requests</code>); 5xx — помилка сервера (<code>500</code>, <code>502</code>, <code>503 Service Unavailable</code>). Правильний код — частина контракту API.`,
      String.raw`Заголовки передають метадані: <code>Content-Type</code>, <code>Authorization</code> (токен), <code>Cookie</code>, <code>Accept-Language</code>, <code>Cache-Control</code>, <code>ETag</code>, <code>Location</code> (адреса нового ресурсу після 201). Імена заголовків нечутливі до регістру, а один заголовок може повторюватись. Не кладіть секрети в URL: адреса потрапляє в журнали, історію браузера й проксі, а заголовки й тіло — значно рідше.`,
      String.raw`Безпека й надійність: HTTPS шифрує трафік; валідуйте всі вхідні дані (шлях, query, заголовки, тіло); обмежуйте розмір тіла й кількість заголовків; ніколи не будуйте SQL чи шлях файла прямо зі вхідного рядка; задавайте тайм-аути. У цій главі ми будуємо спрощений сервер у пам'яті, щоб зрозуміти ці ідеї без мережі.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        String request = "POST /notes HTTP/1.1\r\n"
            + "Host: example.com\r\n"
            + "Content-Type: text/plain\r\n"
            + "Content-Length: 8\r\n"
            + "\r\n"
            + "Buy milk";
        System.out.println(request.replace("\r\n", "|"));
        System.out.println(request.lines().count());
    }
}`,
      String.raw`import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String raw = "GET /users/42?lang=uk HTTP/1.1\r\nHost: example.com\r\nAccept: application/json\r\n\r\n";
        String[] lines = raw.split("\r\n");
        String[] first = lines[0].split(" ");
        System.out.println(first[0] + " " + first[1] + " " + first[2]);
        Map<String, String> headers = new TreeMap<>();
        for (int i = 1; i < lines.length && !lines[i].isEmpty(); i++) {
            int colon = lines[i].indexOf(':');
            headers.put(lines[i].substring(0, colon).toLowerCase(), lines[i].substring(colon + 1).trim());
        }
        System.out.println(headers);
    }
}`,
      String.raw`import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        String encoded = URLEncoder.encode("Kyiv & Lviv", StandardCharsets.UTF_8);
        System.out.println(encoded);
        System.out.println(URLDecoder.decode("a%20b%2Bc+d", StandardCharsets.UTF_8));
        String query = "q=java&page=2";
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            System.out.println(kv[0] + " -> " + kv[1]);
        }
    }
}`,
      String.raw`import java.nio.charset.StandardCharsets;

public class Main {
    static String response(int status, String reason, String body) {
        return "HTTP/1.1 " + status + " " + reason + "\r\n"
            + "Content-Type: text/plain\r\n"
            + "Content-Length: " + body.getBytes(StandardCharsets.UTF_8).length + "\r\n"
            + "\r\n" + body;
    }

    public static void main(String[] args) {
        System.out.println(response(200, "OK", "hello").replace("\r\n", "|"));
        System.out.println(response(404, "Not Found", "no such note").replace("\r\n", "|"));
    }
}`,
      String.raw`// аварія: відсоткове кодування обірване на символі %, URLDecoder кидає IllegalArgumentException
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        System.out.println(URLDecoder.decode("50%25", StandardCharsets.UTF_8));
        System.out.println(URLDecoder.decode("100%", StandardCharsets.UTF_8));
    }
}`,
    ],
    note: String.raw`Запит — це рядок запиту, заголовки й тіло; відповідь — рядок статусу, заголовки й тіло. Код статусу повідомляє результат: 2xx успіх, 4xx помилка клієнта, 5xx помилка сервера. Безпечні й ідемпотентні методи (GET, PUT, DELETE) можна повторювати.`,
    work: String.raw`Знання HTTP потрібне щодня: читання журналів, налагодження API через curl чи браузер, розуміння відповідей 4xx і 5xx, проєктування контрактів між сервісами. Правильні методи й коди статусів роблять API очікуваним для клієнтів і дозволяють працювати кешам, балансувальникам і повторним спробам.`,
    tasks: [
      String.raw`Чим безпечні методи відрізняються від ідемпотентних?`,
      String.raw`Який код статусу відповідає за відсутній ресурс, а який за недопустимий метод?`,
    ],
  },
  {
    t: "Обробник запиту без сокетів",
    ch: "Мережа й сервіси",
    easy: String.raw`Обробник — це касир: йому дають чек із запитом (що хоче клієнт), а він повертає відповідь. Йому байдуже, звідки прийшов клієнт: з телефону, з тесту чи з іншого сервера.`,
    p: [
      String.raw`Щоб зрозуміти вебсервіс, відкиньте мережу. Серцевина будь-якого серверного застосунку — функція <code>Response handle(Request request)</code>: вона отримує розібраний запит і повертає відповідь. Сокети, потоки й розбір байтів — це лише оболонка навколо неї. Якщо ядро відокремлено від мережі, його легко тестувати: просто викликаєш метод і перевіряєш відповідь, не піднімаючи жодного порту.`,
      String.raw`Моделі даних: <code>record Request(String method, String path, Map&lt;String, String&gt; headers, String body)</code> і <code>record Response(int status, Map&lt;String, String&gt; headers, String body)</code>. Незмінні record ідеально підходять: запит після розбору не змінюється, а відповідь створюється один раз. Додайте зручні фабрики: <code>Response.ok(body)</code>, <code>Response.notFound()</code>, <code>Response.json(status, body)</code>, щоб не повторювати заголовки.`,
      String.raw`Інтерфейс <code>Handler</code> з єдиним методом <code>handle</code> є функціональним, тому обробник можна записати лямбдою: <code>Handler hello = req -&gt; Response.ok("Hello");</code>. Складніші обробники — класи із залежностями (сервіси, репозиторії), які отримують через конструктор. Одна функція — одна відповідальність: обробник розбирає запит, викликає бізнес-логіку й формує відповідь, не змішуючи ці кроки.`,
      String.raw`Помилки теж частина контракту. Бізнес-логіка кидає винятки (<code>NotFoundException</code>, <code>ValidationException</code>), а верхній шар перетворює їх на відповіді: <code>NotFoundException</code> дає 404, <code>ValidationException</code> — 400, будь-що інше — 500 без технічних деталей у тілі. Так внутрішня логіка не знає про HTTP, а клієнти отримують зрозумілі коди й повідомлення.`,
      String.raw`Єдиний обробник помилок: метод <code>safe(Handler h)</code> повертає новий обробник, що обгортає виклик у try/catch і зіставляє винятки з відповідями. Це перша ластівка шаблону middleware (йому присвячено окремий урок). Тут же перевіряють вхідні дані: відсутнє тіло, неправильний JSON — відповідь 400 з поясненням, а не виняток, що дійшов до клієнта як 500.`,
      String.raw`Тестування: виклик <code>handler.handle(new Request("GET", "/hello", Map.of(), ""))</code> і перевірка <code>response.status()</code> та <code>body()</code> — швидкий детермінований тест без мережі й портів. Так у справжніх проєктах працюють тести контролерів (MockMvc у Spring), а інтеграційні тести з реальним сервером лишаються для кількох наскрізних сценаріїв, де потрібна перевірка мережевого шару.`,
      String.raw`Типові помилки: змішувати розбір HTTP з бізнес-логікою; повертати 200 з повідомленням про помилку в тілі; віддавати клієнту stack trace; забувати <code>Content-Type</code>; не обмежувати розмір тіла. Кожне правило просте: обробник маленький, помилки зіставляються централізовано, а відповіді завжди мають статус і тип вмісту. Додайте до цього короткий набір тестів на кожну гілку відповіді: коди 200, 400, 404 і 500, і зміни не зламають контракт непомітно.`,
    ],
    code: [
      String.raw`import java.util.Map;

public class Main {
    record Request(String method, String path, Map<String, String> headers, String body) { }

    record Response(int status, Map<String, String> headers, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    public static void main(String[] args) {
        Handler hello = req -> new Response(200, Map.of("Content-Type", "text/plain"), "Hello from " + req.path());
        Response r = hello.handle(new Request("GET", "/hello", Map.of(), ""));
        System.out.println(r.status() + " " + r.body());
    }
}`,
      String.raw`import java.util.Map;

public class Main {
    record Response(int status, Map<String, String> headers, String body) {
        static Response ok(String body) {
            return new Response(200, Map.of("Content-Type", "text/plain"), body);
        }

        static Response json(int status, String body) {
            return new Response(status, Map.of("Content-Type", "application/json"), body);
        }

        static Response notFound() {
            return json(404, "{\"error\":\"not found\"}");
        }
    }

    public static void main(String[] args) {
        System.out.println(Response.ok("hi"));
        System.out.println(Response.notFound().status());
        System.out.println(Response.json(201, "{}").headers());
    }
}`,
      String.raw`import java.util.Map;

public class Main {
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
                return new Response(500, "Server error");       // без технічних деталей
            }
        };
    }

    public static void main(String[] args) {
        Handler failing = req -> {
            throw new NotFoundException("user 7");
        };
        System.out.println(safe(failing).handle(new Request("GET", "/users/7")));
        Handler broken = req -> {
            throw new IllegalStateException("db down");
        };
        System.out.println(safe(broken).handle(new Request("GET", "/x")));
    }
}`,
      String.raw`public class Main {
    record Request(String method, String path, String body) { }

    record Response(int status, String body) { }

    static Response createNote(Request req) {
        if (req.body() == null || req.body().isBlank()) {
            return new Response(400, "{\"error\":\"title is required\"}");
        }
        return new Response(201, "{\"title\":\"" + req.body().trim() + "\"}");
    }

    public static void main(String[] args) {
        System.out.println(createNote(new Request("POST", "/notes", "  ")));
        System.out.println(createNote(new Request("POST", "/notes", "Buy milk")));
    }
}`,
      String.raw`// не компілюється: лямбда обробника повертає String, а інтерфейс Handler вимагає Response
public class Main {
    record Response(int status, String body) { }

    interface Handler {
        Response handle(String path);
    }

    public static void main(String[] args) {
        Handler h = path -> "hello " + path;
        System.out.println(h.handle("/x"));
    }
}`,
    ],
    note: String.raw`Серцевина сервера — функція від запиту до відповіді, незалежна від мережі. Бізнес-логіка кидає винятки, а єдине місце перетворює їх на статус-коди: 404, 400, а все інше 500 без технічних деталей.`,
    work: String.raw`Відокремлення обробників від мережі — основа тестованих сервісів: фреймворки на кшталт Spring викликають ваші методи так само, як ви вручну викликаєте handler. Централізована обробка помилок гарантує, що клієнт завжди отримує зрозумілий статус і не бачить внутрішніх подробиць.`,
    tasks: [
      String.raw`Чому обробник запиту зручно тестувати без мережі?`,
      String.raw`Навіщо централізувати перетворення винятків на статус-коди?`,
    ],
  },
  {
    t: "Маршрутизація: шлях, метод і параметри",
    ch: "Мережа й сервіси",
    easy: String.raw`Маршрутизатор — це швейцар у готелі: за номером кімнати (шлях) і побажанням (метод) він знає, до якого працівника направити гостя, а якщо такої кімнати немає, ввічливо каже «немає».`,
    p: [
      String.raw`Маршрутизатор зіставляє пару (метод, шлях) з обробником: <code>GET /users</code> — список, <code>GET /users/{id}</code> — один, <code>POST /users</code> — створити, <code>DELETE /users/{id}</code> — видалити. Без нього довелося б писати великий ланцюжок if в єдиному обробнику. Таблиця маршрутів робить сервіс прозорим: усі адреси видно в одному місці, і нову додати просто.`,
      String.raw`Шаблон шляху розбивають на сегменти: <code>/users/{id}</code> перетворюється на <code>["users", "{id}"]</code>. Сегмент у фігурних дужках — змінна, решта — літерали. Щоб зіставити шлях запиту, розбивають його так само й порівнюють сегмент за сегментом: кількість має збігатися, літерали бути рівними, а змінні захоплюють значення в мапу параметрів (<code>id</code> дорівнює <code>"42"</code>).`,
      String.raw`Параметри шляху (path params) ідентифікують ресурс (<code>/users/42</code>), параметри запиту (query) уточнюють вибірку (<code>/users?role=admin&amp;page=2</code>). Значення завжди рядки: їх перетворюють на числа з перевіркою (<code>Integer.parseInt</code> із відповіддю 400 при помилці). Не довіряйте їм: перевіряйте діапазони, довжину, дозволені символи, адже саме тут починається більшість атак на веб-застосунки.`,
      String.raw`Статуси маршрутизації: шлях не знайдено — 404; шлях є, але метод не дозволений — 405 Method Not Allowed із заголовком <code>Allow: GET, POST</code>. Різниця важлива для клієнта: 404 означає «такого ресурсу немає», 405 — «ресурс є, але так із ним не можна». Для цього маршрутизатор спершу знаходить збіг за шляхом, а потім вибирає обробник за методом.`,
      String.raw`Порядок і конфлікти: <code>/users/me</code> і <code>/users/{id}</code> обидва збігаються зі шляхом <code>/users/me</code>. Типове правило: літерал специфічніший за змінну й має пріоритет. Простіше (і надійніше) — зберігати маршрути в порядку реєстрації та вибирати перший збіг, але тоді конкретні маршрути реєструють раніше за загальні. Дублікати маршрутів краще забороняти вже під час реєстрації.`,
      String.raw`Нормалізація шляху: завершальна коса риска (<code>/users/</code> проти <code>/users</code>), подвійні скісні, регістр, відсоткове кодування (<code>%2F</code> усередині сегмента не повинно ділити шлях), <code>..</code> та інші спроби вийти за межі. Нормалізуйте й перевіряйте шлях до зіставлення з маршрутами, а не після: це закриває цілий клас вразливостей і робить поведінку передбачуваною.`,
      String.raw`Реалізація маршрутизатора з нуля навчає того, що роблять Spring MVC, Javalin чи JAX-RS: анотації <code>@GetMapping("/users/{id}")</code> і <code>@PathVariable</code> — це те саме зіставлення, зашите в рефлексію. Розуміючи механізм, ви без труднощів розберете помилки 404 і 405 у фреймворку й напишете власний мінімальний роутер для невеликого сервісу.`,
    ],
    code: [
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
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

    public static void main(String[] args) {
        System.out.println(match("/users/{id}", "/users/42"));
        System.out.println(match("/users/{id}/notes/{note}", "/users/3/notes/9"));
        System.out.println(match("/users/{id}", "/orders/42"));
    }
}`,
      String.raw`import java.util.ArrayList;
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

    static class Router {
        private final List<Route> routes = new ArrayList<>();

        void add(String method, String pattern, Handler handler) {
            routes.add(new Route(method, pattern, handler));
        }

        Response handle(Request req) {
            boolean pathMatched = false;
            for (Route r : routes) {
                Map<String, String> params = match(r.pattern(), req.path());
                if (params == null) {
                    continue;
                }
                pathMatched = true;
                if (r.method().equals(req.method())) {
                    return r.handler().handle(params);
                }
            }
            return pathMatched ? new Response(405, "method not allowed") : new Response(404, "not found");
        }
    }

    static Map<String, String> match(String pattern, String path) {
        String[] p = pattern.split("/");
        String[] s = path.split("/");
        if (p.length != s.length) {
            return null;
        }
        Map<String, String> params = new HashMap<>();
        for (int i = 0; i < p.length; i++) {
            if (p[i].startsWith("{")) {
                params.put(p[i].substring(1, p[i].length() - 1), s[i]);
            } else if (!p[i].equals(s[i])) {
                return null;
            }
        }
        return params;
    }

    public static void main(String[] args) {
        Router router = new Router();
        router.add("GET", "/users/{id}", params -> new Response(200, "user " + params.get("id")));
        System.out.println(router.handle(new Request("GET", "/users/42")));
        System.out.println(router.handle(new Request("POST", "/users/42")));
        System.out.println(router.handle(new Request("GET", "/other")));
    }
}`,
      String.raw`public class Main {
    static String idOrError(String raw) {
        try {
            int id = Integer.parseInt(raw);
            if (id <= 0) {
                return "400 id must be positive";
            }
            return "200 user " + id;
        } catch (NumberFormatException e) {
            return "400 id must be a number";
        }
    }

    public static void main(String[] args) {
        System.out.println(idOrError("42"));
        System.out.println(idOrError("abc"));
        System.out.println(idOrError("-5"));
    }
}`,
      String.raw`public class Main {
    static String normalize(String path) {
        String p = path.replaceAll("/+", "/");
        if (p.length() > 1 && p.endsWith("/")) {
            p = p.substring(0, p.length() - 1);
        }
        return p;
    }

    public static void main(String[] args) {
        System.out.println(normalize("/users/"));
        System.out.println(normalize("//users///42/"));
        System.out.println(normalize("/"));
        System.out.println(java.nio.file.Path.of("/users/../admin").normalize());
    }
}`,
      String.raw`// аварія: повторна реєстрація того самого маршруту виявляється під час запуску, а не мовчки перезаписує попередній
import java.util.HashSet;
import java.util.Set;

public class Main {
    static final Set<String> REGISTERED = new HashSet<>();

    static void add(String method, String pattern) {
        String key = method + " " + pattern;
        if (!REGISTERED.add(key)) {
            throw new IllegalStateException("duplicate route: " + key);
        }
    }

    public static void main(String[] args) {
        add("GET", "/users/{id}");
        add("POST", "/users");
        add("GET", "/users/{id}");
    }
}`,
    ],
    note: String.raw`Маршрутизатор зіставляє метод і шлях із шаблоном <code>/users/{id}</code>: літерали мають збігтися, змінні захоплюють значення. Немає шляху — 404, шлях є, а метод інший — 405 із заголовком Allow. Нормалізуйте й перевіряйте шлях до зіставлення.`,
    work: String.raw`Таблиця маршрутів — карта вашого API: за нею клієнти й колеги дізнаються, що доступно. Помилки в маршрутах дають дивні 404 і 405 у продакшні, а неправильна нормалізація шляху — вразливості, тому такий код пишуть уважно й покривають тестами.`,
    tasks: [
      String.raw`Чим 404 відрізняється від 405 і що має містити відповідь 405?`,
      String.raw`Як змінна <code>{id}</code> у шаблоні потрапляє в обробник?`,
    ],
  },
  {
    t: "JSON API: CRUD у пам'яті",
    ch: "Мережа й сервіси",
    easy: String.raw`CRUD — це чотири дії із записником: Create (записати), Read (прочитати), Update (виправити), Delete (викреслити). JSON API виконує їх через методи HTTP, а записник лежить у пам'яті.`,
    p: [
      String.raw`CRUD (Create, Read, Update, Delete) — базові операції над ресурсами. У REST-стилі їх виражають методами HTTP і шляхами: <code>POST /notes</code> створює (201 Created із заголовком <code>Location: /notes/7</code>), <code>GET /notes/7</code> читає (200 чи 404), <code>GET /notes</code> дає список, <code>PUT /notes/7</code> замінює, <code>PATCH</code> змінює частково, <code>DELETE /notes/7</code> видаляє (204 No Content). Саме так працює більшість сучасних API.`,
      String.raw`Ресурс — іменник у множині (<code>/notes</code>, <code>/users</code>), а дію виражає метод, а не шлях: адреса <code>/notes/7/delete</code> — антипатерн. Колекція й елемент мають різні шляхи, вкладені ресурси записують як <code>/users/3/notes</code>. Ідентифікатор — частина шляху, а фільтри, сортування й сторінки — у query: <code>/notes?tag=java&amp;page=2&amp;size=20</code>. Така угода робить API передбачуваним.`,
      String.raw`Сховище в пам'яті: <code>Map&lt;Integer, Note&gt;</code> (<code>ConcurrentHashMap</code> для потоків) і лічильник ідентифікаторів (<code>AtomicInteger</code>). Це «fake-репозиторій», зручний для навчання й тестів: замінивши його реалізацію на базу, ви не змінюєте обробники. Репозиторій має інтерфейс з методами <code>save</code>, <code>findById</code>, <code>findAll</code> і <code>delete</code>.`,
      String.raw`Формат тіла — JSON: <code>{"id": 7, "title": "Buy milk", "done": false}</code>. У реальних проєктах JSON обробляє бібліотека (Jackson), у нашому випадку — мінімальний серіалізатор і парсер з попередньої глави. Тіло відповіді на створення повертає створений ресурс із присвоєним id; на помилку — об'єкт <code>{"error": "..."}</code> з коректним статусом. Єдиний формат помилок спрощує роботу клієнтів.`,
      String.raw`Валідація: для POST перевіряйте, що тіло — валідний JSON, є обов'язкові поля, довжини в межах; помилка — 400 (або 422) із зрозумілим повідомленням. Для відсутнього ресурсу — 404. Для конфлікту (дублікат унікального поля) — 409. Для неочікуваних помилок — 500 без деталей. Узгоджені коди статусів роблять клієнтський код простим і однаковим для всіх ресурсів.`,
      String.raw`Ідемпотентність: PUT і DELETE ідемпотентні — повторний виклик дає той самий стан (DELETE після видалення дає 404 або 204, але стан не змінюється). POST неідемпотентний: повторення створить дублікат. Для критичних операцій (платежі) клієнт надсилає ключ ідемпотентності (заголовок <code>Idempotency-Key</code>), а сервер запам'ятовує результат і повертає його при повторі.`,
      String.raw`Версіонування й еволюція: додавайте поля, але не прибирайте й не змінюйте їх значення без нової версії (<code>/v2/notes</code> чи заголовок). Документуйте API специфікацією (OpenAPI). Для великих колекцій обов'язкова пагінація: ніколи не повертайте «все». У цьому уроці ми реалізуємо мінімальний CRUD, на якому всі ці ідеї видно найкраще.`,
    ],
    code: [
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    record Note(int id, String title, boolean done) { }

    static class NoteStore {
        private final Map<Integer, Note> notes = new HashMap<>();
        private final AtomicInteger nextId = new AtomicInteger(1);

        Note create(String title) {
            Note n = new Note(nextId.getAndIncrement(), title, false);
            notes.put(n.id(), n);
            return n;
        }

        Note get(int id) {
            return notes.get(id);
        }

        boolean delete(int id) {
            return notes.remove(id) != null;
        }
    }

    public static void main(String[] args) {
        NoteStore store = new NoteStore();
        System.out.println(store.create("Buy milk"));
        System.out.println(store.create("Write code"));
        System.out.println(store.get(2));
        System.out.println(store.delete(1) + " " + store.delete(1));
    }
}`,
      String.raw`import java.util.Map;

public class Main {
    record Response(int status, Map<String, String> headers, String body) { }

    static Response created(int id, String title) {
        String json = "{\"id\":" + id + ",\"title\":\"" + title + "\",\"done\":false}";
        return new Response(201, Map.of("Location", "/notes/" + id, "Content-Type", "application/json"), json);
    }

    public static void main(String[] args) {
        Response r = created(7, "Buy milk");
        System.out.println(r.status() + " " + r.headers().get("Location"));
        System.out.println(r.body());
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    record Response(int status, String body) { }

    static final Map<Integer, String> NOTES = new HashMap<>(Map.of(1, "Buy milk"));

    static Response getNote(int id) {
        String title = NOTES.get(id);
        if (title == null) {
            return new Response(404, "{\"error\":\"note " + id + " not found\"}");
        }
        return new Response(200, "{\"id\":" + id + ",\"title\":\"" + title + "\"}");
    }

    public static void main(String[] args) {
        System.out.println(getNote(1));
        System.out.println(getNote(9));
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    static final Map<Integer, String> NOTES = new HashMap<>(Map.of(1, "Buy milk"));

    static int delete(int id) {
        return NOTES.remove(id) != null ? 204 : 404;
    }

    public static void main(String[] args) {
        System.out.println(delete(1));          // 204: видалено
        System.out.println(delete(1));          // 404: вже немає, стан не змінився
        System.out.println(NOTES.size());
    }
}`,
      String.raw`// аварія: обробник не перевірив, що нотатки немає, і звернувся до неї через null, NullPointerException
import java.util.HashMap;
import java.util.Map;

public class Main {
    record Note(int id, String title) { }

    public static void main(String[] args) {
        Map<Integer, Note> notes = new HashMap<>();
        notes.put(1, new Note(1, "Buy milk"));
        System.out.println(notes.get(1).title());
        System.out.println(notes.get(99).title());
    }
}`,
    ],
    note: String.raw`Ресурс — іменник у множині, дія — метод HTTP: POST створює (201 і Location), GET читає, PUT замінює, DELETE видаляє (204). Помилки мають статус і єдиний формат тіла; великі колекції віддають сторінками.`,
    work: String.raw`CRUD-API — найчастіша серверна задача в прикладній Java. Правильні статуси, пагінація, єдиний формат помилок і валідація відрізняють API, яким приємно користуватися, від API, який доводиться обходити. Сховище в пам'яті зручне для тестів і прототипів.`,
    tasks: [
      String.raw`Чому створення ресурсу повертає 201 із заголовком Location?`,
      String.raw`Чим PUT відрізняється від PATCH і яка з цих операцій ідемпотентна?`,
    ],
  },
  {
    t: "Middleware: ланцюг обробників",
    ch: "Мережа й сервіси",
    easy: String.raw`Middleware — це шарова охорона навколо будинку: кожен охоронець перевіряє пропуск, записує час і пропускає далі. Усередині будинку працівникові не треба знати, скільки охоронців стоїть зовні.`,
    p: [
      String.raw`Middleware — це обробник, що обгортає інший обробник і додає наскрізну поведінку: журналювання, автентифікацію, вимірювання часу, обмеження швидкості, стиснення, CORS, обробку помилок. Усередині самих обробників бізнес-логіка не засмічується цими питаннями. Це шаблон Decorator: новий обробник, що викликає старий і додає щось до чи після виклику.`,
      String.raw`У нашій моделі middleware — функція від обробника до обробника: <code>interface Middleware { Handler wrap(Handler next); }</code>. Реалізація: <code>return req -&gt; { ...до...; Response r = next.handle(req); ...після...; return r; }</code>. Можна зупинити ланцюжок, не викликаючи <code>next</code> (наприклад, повернути 401). Також можна змінити запит перед передачею далі та відповідь після отримання, що відкриває велику гнучкість.`,
      String.raw`Ланцюжок: <code>Handler app = chain(core, logging, auth, timing)</code>. Порядок важливий: перший у списку найзовнішній — він бачить запит першим, а відповідь останнім. Автентифікація має стояти раніше за бізнес-логіку, журналювання — найзовнішнім (щоб бачити й відмови), обробка винятків — зовні від усіх, щоб ловити помилки будь-якого шару. Неправильний порядок дає підступні помилки, які важко помітити.`,
      String.raw`Реалізація <code>chain</code>: проходимо по middleware у зворотному порядку й послідовно обгортаємо: <code>Handler h = core; for (int i = mws.size() - 1; i &gt;= 0; i--) h = mws.get(i).wrap(h);</code>. Тоді перший елемент списку опиняється найзовнішнім. Це класичне зведення, що повторюється в Servlet-фільтрах, Spring-інтерцепторах і HTTP-клієнтах: той самий принцип, лише інші назви.`,
      String.raw`Типові middleware: <b>logging</b> (метод, шлях, статус, тривалість), <b>auth</b> (перевірка заголовка <code>Authorization</code>; 401 без токена, 403 без прав), <b>rate limit</b> (429 після перевищення), <b>errors</b> (перетворення винятків), <b>cors</b> (заголовки <code>Access-Control-...</code>), <b>request id</b> (ідентифікатор для трасування), <b>timeout</b>. Кожен — окрема маленька одиниця з одним призначенням і власними тестами.`,
      String.raw`Спільні дані між шарами: middleware додає в запит атрибути (ідентифікатор користувача після автентифікації), і далі обробник їх читає. У нашій моделі запит незмінний, тому middleware створює новий запит із доданим заголовком чи атрибутом (<code>req.withHeader("X-User", "ira")</code>). Не використовуйте глобальні змінні: у багатопотоковому сервері вони ламаються й змішують дані різних користувачів.`,
      String.raw`Тестування: кожен middleware перевіряють ізольовано з простим обробником-заглушкою: наприклад, auth без токена не викликає <code>next</code> і повертає 401. Потім окремий тест перевіряє порядок у ланцюжку. Помилки в порядку (журналювання після автентифікації не бачить відмов; обробник помилок усередині не ловить винятків зовнішніх шарів) — типові й підступні, тому порядок варто зафіксувати тестом.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    record Request(String method, String path) { }

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

    public static void main(String[] args) {
        List<String> log = new ArrayList<>();
        Handler core = req -> new Response(200, "ok");
        Handler app = logging(log).wrap(core);
        System.out.println(app.handle(new Request("GET", "/ping")));
        System.out.println(log);
    }
}`,
      String.raw`public class Main {
    record Request(String path, String token) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    interface Middleware {
        Handler wrap(Handler next);
    }

    static Middleware auth(String expected) {
        return next -> req -> {
            if (!expected.equals(req.token())) {
                return new Response(401, "unauthorized");      // next не викликається
            }
            return next.handle(req);
        };
    }

    public static void main(String[] args) {
        Handler secret = req -> new Response(200, "secret data");
        Handler protectedApp = auth("t0ken").wrap(secret);
        System.out.println(protectedApp.handle(new Request("/secret", "t0ken")));
        System.out.println(protectedApp.handle(new Request("/secret", null)));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    interface Handler {
        String handle(String request);
    }

    interface Middleware {
        Handler wrap(Handler next);
    }

    static Middleware tag(String name, List<String> trace) {
        return next -> req -> {
            trace.add("before " + name);
            String r = next.handle(req);
            trace.add("after " + name);
            return r;
        };
    }

    static Handler chain(Handler core, List<Middleware> middlewares) {
        Handler h = core;
        for (int i = middlewares.size() - 1; i >= 0; i--) {     // з кінця: перший стане найзовнішнім
            h = middlewares.get(i).wrap(h);
        }
        return h;
    }

    public static void main(String[] args) {
        List<String> trace = new ArrayList<>();
        Handler app = chain(req -> {
            trace.add("core");
            return "done";
        }, List.of(tag("A", trace), tag("B", trace)));
        app.handle("x");
        System.out.println(trace);        // [before A, before B, core, after B, after A]
    }
}`,
      String.raw`import java.util.Map;

public class Main {
    record Request(String path, Map<String, String> headers) {
        Request withHeader(String name, String value) {
            java.util.Map<String, String> copy = new java.util.HashMap<>(headers);
            copy.put(name, value);
            return new Request(path, Map.copyOf(copy));
        }
    }

    interface Handler {
        String handle(Request request);
    }

    public static void main(String[] args) {
        Handler core = req -> "hello, " + req.headers().getOrDefault("X-User", "anonymous");
        Handler withUser = req -> core.handle(req.withHeader("X-User", "ira"));    // middleware збагачує запит
        System.out.println(core.handle(new Request("/", Map.of())));
        System.out.println(withUser.handle(new Request("/", Map.of())));
    }
}`,
      String.raw`// не компілюється: після умови в лямбді немає return на всіх шляхах
public class Main {
    interface Handler {
        String handle(String request);
    }

    public static void main(String[] args) {
        Handler h = request -> {
            if (request.isEmpty()) {
                return "empty";
            }
        };
        System.out.println(h.handle("x"));
    }
}`,
    ],
    note: String.raw`Middleware — це функція від обробника до обробника: вона виконує щось до й після next і може не викликати next узагалі. Перший у ланцюжку найзовнішній, тому порядок важливий: журналювання й обробка помилок зовні, автентифікація раніше за бізнес-логіку.`,
    work: String.raw`Наскрізні питання (безпека, журнали, метрики, ліміти) реалізують middleware чи фільтрами в кожному фреймворку: Servlet Filter, Spring Interceptor, Express middleware, клієнтські інтерцептори. Розуміння шаблону дозволяє швидко орієнтуватися в будь-якому з них і дописувати власні.`,
    tasks: [
      String.raw`У якому порядку виконаються «до» і «після» частини двох вкладених middleware?`,
      String.raw`Чому middleware автентифікації не повинен викликати next без токена?`,
    ],
  },
  {
    t: "HttpClient і тайм-аути",
    ch: "Мережа й сервіси",
    easy: String.raw`HttpClient — це кур'єр, що відносить ваші листи на інші сервери й приносить відповіді. Але кур'єра треба обмежити в часі: якщо адресат мовчить, чекати вічно не можна.`,
    p: [
      String.raw`З Java 11 у JDK є сучасний клієнт <code>java.net.http.HttpClient</code>: він підтримує HTTP/1.1 і HTTP/2, синхронні й асинхронні виклики, тайм-аути, перенаправлення, проксі. Клієнт незмінний і потокобезпечний: його створюють один раз і використовують повторно, як пул з'єднань. Створення нового клієнта на кожен запит — помилка продуктивності, яка проявляється лише під навантаженням.`,
      String.raw`Побудова клієнта: <code>HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).followRedirects(HttpClient.Redirect.NORMAL).build()</code>. Запит: <code>HttpRequest.newBuilder(URI.create("https://example.com/api")).GET().header("Accept", "application/json").timeout(Duration.ofSeconds(5)).build()</code>. Для POST використовують <code>POST(BodyPublishers.ofString(json))</code> і заголовок <code>Content-Type</code>.`,
      String.raw`Відправлення: <code>HttpResponse&lt;String&gt; r = client.send(request, BodyHandlers.ofString());</code> блокує потік і повертає відповідь; з неї читають <code>r.statusCode()</code>, <code>r.body()</code>, <code>r.headers()</code>. Асинхронно: <code>client.sendAsync(...)</code> повертає <code>CompletableFuture&lt;HttpResponse&lt;String&gt;&gt;</code>. Разом із віртуальними потоками блокуючий <code>send</code> цілком прийнятний навіть для великої кількості паралельних викликів.`,
      String.raw`Тайм-аути обов'язкові: <code>connectTimeout</code> (встановлення з'єднання) і <code>timeout</code> на запит (очікування відповіді). Без них один завислий сервіс блокує потоки й завалює ваш сервіс каскадом. Винятки: <code>HttpConnectTimeoutException</code>, <code>HttpTimeoutException</code>, <code>IOException</code> (мережа), <code>InterruptedException</code> (переривання). Їх обробляють окремо від бізнес-помилок.`,
      String.raw`Статус-код не кидає виняток: відповідь 404 чи 500 — це нормальна відповідь, і її перевіряє ваш код (<code>statusCode() &gt;= 400</code>). Типова помилка — розбирати тіло без перевірки статусу. Розрізняйте: помилка клієнта (4xx) — не повторювати; тимчасова помилка сервера (502, 503, 504) чи тайм-аут — можна повторити з відкладом, бо наступна спроба цілком може вдатись.`,
      String.raw`Повторні спроби (retry): експоненційна затримка (100 мс, 200, 400 і так далі) з випадковим джиттером, обмежена кількість спроб, повтор лише для ідемпотентних запитів і тимчасових помилок. Без обмежень і джиттера повтори від багатьох клієнтів створюють «лавину» й добивають сервіс, що падає. Ще корисні circuit breaker (розрив ланцюга: тимчасово не викликати зламаний сервіс) та bulkhead.`,
      String.raw`Безпека й гігієна: використовуйте HTTPS, перевіряйте сертифікати, не логуйте токени, обмежуйте розмір відповіді, не довіряйте тілу (валідуйте) і не будуйте URL зі сирих користувацьких рядків без кодування (<code>URLEncoder</code>). У тестах підміняйте клієнт інтерфейсом чи локальним сервером, щоб не залежати від реальної мережі. Нарешті, логуйте тривалість і статуси зовнішніх викликів: без метрик помилки таких інтеграцій помічають зі значним запізненням.`,
    ],
    code: [
      String.raw`import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;

public class Main {
    public static void main(String[] args) {
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com/api/users?role=admin"))
            .GET()
            .header("Accept", "application/json")
            .timeout(Duration.ofSeconds(5))
            .build();
        System.out.println(request.method() + " " + request.uri());
        System.out.println(request.headers().firstValue("Accept").orElse("none"));
        System.out.println(request.timeout().orElseThrow().toSeconds());
    }
}`,
      String.raw`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.time.Duration;

public class Main {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
        HttpRequest post = HttpRequest.newBuilder(URI.create("https://example.com/notes"))
            .header("Content-Type", "application/json")
            .POST(BodyPublishers.ofString("{\"title\":\"Buy milk\"}"))
            .timeout(Duration.ofSeconds(5))
            .build();
        System.out.println(client.connectTimeout().orElseThrow().toSeconds());
        System.out.println(post.method() + " " + post.bodyPublisher().isPresent());
    }
}`,
      String.raw`// лише компіляція: цей приклад надсилає запит у мережу, тому під час перевірки його не запускають
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;

public class Main {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com/"))
            .timeout(Duration.ofSeconds(5))
            .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            System.out.println("error " + response.statusCode());
        } else {
            System.out.println(response.body().length());
        }
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.IntSupplier;

public class Main {
    static int retry(IntSupplier call, int maxAttempts, List<Long> delays) {
        int status = 0;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            status = call.getAsInt();
            if (status < 500) {
                return status;                              // успіх чи помилка клієнта: не повторюємо
            }
            if (attempt < maxAttempts) {
                delays.add(100L << (attempt - 1));          // 100, 200, 400 мс: експоненційна затримка
            }
        }
        return status;
    }

    public static void main(String[] args) {
        int[] responses = {503, 503, 200};
        int[] index = {0};
        List<Long> delays = new ArrayList<>();
        System.out.println(retry(() -> responses[index[0]++], 5, delays));
        System.out.println(delays);
    }
}`,
      String.raw`// не компілюється: send кидає перевірювані IOException і InterruptedException, а метод main їх не оголосив
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;

public class Main {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com/")).build();
        client.send(request, BodyHandlers.ofString());
    }
}`,
    ],
    note: String.raw`Один HttpClient використовують повторно. Тайм-аути на з'єднання й запит обов'язкові, а статус 4xx чи 5xx — це відповідь, а не виняток: перевіряйте його самі. Повторюйте лише ідемпотентні запити й тимчасові помилки, з відкладом і джиттером.`,
    work: String.raw`Майже кожен сервіс викликає інші сервіси: платіжні шлюзи, пошту, внутрішні API. Саме відсутність тайм-аутів і безмежні повтори є частими причинами каскадних збоїв, коли падіння однієї залежності валить усю систему. Тому налаштування клієнта — частина проєктування надійності.`,
    tasks: [
      String.raw`Чому HttpClient створюють один раз, а не на кожен запит?`,
      String.raw`Чому повторні спроби без обмежень і джиттера небезпечні?`,
    ],
  },
  {
    t: "HttpServer із JDK",
    ch: "Мережа й сервіси",
    adv: true,
    easy: String.raw`HttpServer із JDK — це маленький вбудований офіс прийому: ви вказуєте, на якому порту він приймає відвідувачів і який працівник обслуговує яку адресу. Для навчання й невеликих інструментів цього цілком вистачає.`,
    p: [
      String.raw`У JDK є вбудований простий HTTP-сервер: клас <code>com.sun.net.httpserver.HttpServer</code> (модуль <code>jdk.httpserver</code>). Він не призначений для великих продакшн-систем, але зручний для тестів, прототипів, внутрішніх інструментів і розуміння того, як усе працює. Для серйозних сервісів використовують Jetty, Tomcat, Netty, Undertow або фреймворки (Spring Boot, Javalin, Micronaut, Quarkus), які вбудовують такі сервери.`,
      String.raw`Створення: <code>HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);</code> (другий параметр — розмір черги з'єднань). Порт 0 означає «будь-який вільний порт»: його дізнаються через <code>server.getAddress().getPort()</code>, що зручно в тестах. Контексти: <code>server.createContext("/hello", exchange -&gt; { ... })</code>. Запуск — <code>server.start()</code>, зупинка — <code>server.stop(delaySeconds)</code>.`,
      String.raw`Обробник — <code>HttpHandler</code> з методом <code>handle(HttpExchange exchange)</code>. Через <code>exchange</code> читають метод (<code>getRequestMethod()</code>), URI (<code>getRequestURI()</code>), заголовки (<code>getRequestHeaders()</code>), тіло (<code>getRequestBody()</code>), а відповідь формують так: <code>exchange.getResponseHeaders().set(...)</code>, <code>exchange.sendResponseHeaders(200, bytes.length)</code>, запис у <code>getResponseBody()</code> і <code>close()</code>. Забути закрити обмін — типова причина зависань.`,
      String.raw`Контекст за шляхом працює за префіксом: <code>/api</code> обробляє й <code>/api/users</code>. Свій маршрутизатор із попередніх уроків можна підключити одним контекстом <code>/</code>: <code>exchange</code> перетворюється на наш <code>Request</code>, викликається <code>router.handle</code>, а <code>Response</code> записується назад. Так ядро лишається незалежним від конкретного сервера, і його можна перенести на інший без переписування бізнес-логіки.`,
      String.raw`Потоки: за замовчуванням сервер використовує один потік-диспетчер, і обробники виконуються послідовно. Для паралельності задають виконавця: <code>server.setExecutor(Executors.newFixedThreadPool(8))</code> або віртуальні потоки (<code>newVirtualThreadPerTaskExecutor()</code>). Тоді обробники повинні бути потокобезпечними: спільний стан захищають (ConcurrentHashMap, атомарні змінні).`,
      String.raw`Тіло відповіді: довжину повідомляють у <code>sendResponseHeaders</code> (для невідомої довжини — 0, і тоді використовується chunked-кодування); кодування тексту — явно UTF-8; заголовок <code>Content-Type</code> — завжди. Для запитів із тілом читайте обмежену кількість байтів, щоб клієнт не міг вичерпати пам'ять. Помилки в обробнику перехоплюйте й перетворюйте на 500, інакше з'єднання буде обірване без пояснень.`,
      String.raw`Тестування: підняти сервер на порту 0, викликати його <code>HttpClient</code> з того ж тесту й перевірити відповіді, а потім зупинити в <code>finally</code>. У нашому навчальному середовищі мережа недоступна, тому приклади цього уроку лише компілюються, а завдання працюють із запитами в пам'яті. Якщо хочете побачити реальні відповіді, запустіть приклади локально на своєму комп'ютері. Корисно також спробувати змінити порт, додати ще один контекст і подивитися відповіді в браузері та через curl: це швидко формує інтуїцію про те, як сервер зіставляє адреси з обробниками.`,
    ],
    code: [
      String.raw`// лише компіляція: сервер відкриває порт, тому під час перевірки його не запускають
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/hello", exchange -> {
            byte[] body = "Hello, HTTP!".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        });
        server.start();
        System.out.println("listening on " + server.getAddress().getPort());
    }
}`,
      String.raw`// лише компіляція: сервер з виконавцем і вибором методу
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public class Main {
    static void reply(HttpExchange exchange, int status, String text) throws IOException {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();                                   // обмін обов'язково закривають
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);   // порт 0: будь-який вільний
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.createContext("/notes", exchange -> {
            if (!"GET".equals(exchange.getRequestMethod())) {
                reply(exchange, 405, "method not allowed");
                return;
            }
            reply(exchange, 200, "notes list");
        });
        server.start();
        server.stop(0);
    }
}`,
      String.raw`// лише компіляція: тест піднімає сервер на вільному порту й викликає його HttpClient
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;

public class Main {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/ping", exchange -> {
            byte[] body = "pong".getBytes();
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            int port = server.getAddress().getPort();
            var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/ping")).build();
            System.out.println(HttpClient.newHttpClient().send(request, BodyHandlers.ofString()).body());
        } finally {
            server.stop(0);
        }
    }
}`,
      String.raw`import java.net.URI;

public class Main {
    public static void main(String[] args) {
        URI uri = URI.create("/search?q=java%20streams&page=2");
        System.out.println(uri.getPath());
        System.out.println(uri.getRawQuery());
        System.out.println(uri.getQuery());               // вже декодований рядок
        for (String pair : uri.getRawQuery().split("&")) {
            System.out.println(pair);
        }
    }
}`,
      String.raw`// аварія: порт має бути від 0 до 65535, InetSocketAddress кидає IllegalArgumentException
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) {
        System.out.println(new InetSocketAddress(8080).getPort());
        System.out.println(new InetSocketAddress(-1).getPort());
    }
}`,
    ],
    note: String.raw`<code>HttpServer</code> із JDK — простий сервер для тестів і прототипів. Обмін обов'язково закривають, довжину відповіді повідомляють у <code>sendResponseHeaders</code>, а для паралельності задають виконавця. Для продакшну беруть повноцінні сервери й фреймворки.`,
    work: String.raw`Вбудований сервер зручний для невеликих утиліт, імітації зовнішніх сервісів у тестах і розуміння основ. Фреймворки приховують ці деталі, але стеки викликів і помилки в продакшні все одно проходять через такі самі поняття: обмін, обробник, виконавець і закриття з'єднання.`,
    tasks: [
      String.raw`Для чого порт 0 під час створення тестового сервера?`,
      String.raw`Чому треба закривати HttpExchange після відповіді?`,
    ],
  },
  {
    t: "Коректне завершення сервера",
    ch: "Мережа й сервіси",
    adv: true,
    easy: String.raw`Коректне завершення — це закриття магазину: нових покупців уже не пускають, а ті, що вже стоять біля каси, обслуговуються до кінця. Лише потім вимикають світло.`,
    p: [
      String.raw`Сервер зупиняють постійно: під час оновлення, масштабування, перезапуску. Різке вбивство процесу обриває запити, що виконуються: користувач отримує помилку, транзакція залишається напівзавершеною, дані можуть бути пошкоджені. Коректне завершення (graceful shutdown) означає: перестати приймати нові запити, дати поточним завершитися, звільнити ресурси й лише тоді вийти.`,
      String.raw`Сигнали: операційна система повідомляє процес про зупинку сигналом SIGTERM (його надсилає Kubernetes чи systemd), а після таймера — SIGKILL, який перехопити не можна. У Java на SIGTERM спрацьовують shutdown hooks: <code>Runtime.getRuntime().addShutdownHook(new Thread(() -&gt; ...))</code>. Хук має бути швидким і не кидати невідловлених винятків; у ньому викликають <code>server.stop(...)</code> і закривають пули потоків.`,
      String.raw`Алгоритм: прапорець <code>stopping</code> (<code>volatile</code> чи <code>AtomicBoolean</code>); нові запити після нього отримують <code>503 Service Unavailable</code> (балансувальник відправить їх на інші екземпляри); лічильник запитів «в польоті» (<code>AtomicInteger</code>) зменшується по завершенню; чекаємо нуля з тайм-аутом; після тайм-ауту примусово перериваємо. Саме такий шаблон використовують усі серйозні сервери й фреймворки.`,
      String.raw`Пули потоків: <code>executor.shutdown()</code> — не приймати нових завдань, дочекатись наявних (<code>awaitTermination</code> із лімітом), а якщо не вклались — <code>shutdownNow()</code> і ще одна коротка пауза. Фонові планувальники, споживачі черг і з'єднання з базою закривають у порядку, зворотному запуску: спочатку вхід (HTTP), потім внутрішні воркери, потім ресурси (пул з'єднань).`,
      String.raw`Перевірки готовності (readiness) і живості (liveness): під час зупинки сервіс першим ділом повідомляє, що не готовий приймати трафік (<code>/ready</code> повертає 503), щоб балансувальник перестав слати запити, а вже потім чекає завершення поточних. Затримка між «не готовий» і початком зупинки (кілька секунд) дозволяє мережі перестати показувати цей екземпляр клієнтам.`,
      String.raw`Тайм-аути й повторні спроби на клієнті доповнюють сервер: ідемпотентні запити, що обірвались, клієнт може повторити на іншому екземплярі. Тривалі операції проєктують із можливістю відновлення: при перериванні результат не втрачається (контрольні точки, ідемпотентні завдання, черги з підтвердженням). Без цього жодне graceful завершення не врятує від втрат при аварії.`,
      String.raw`Тестування завершення: запустити повільний запит, ініціювати зупинку, переконатися, що поточний запит завершився успішно, а новий отримав 503. Це можна зробити детерміновано засувками (<code>CountDownLatch</code>) без sleep. Помилки тут проявляються лише під час розгортань і масштабування, тому тест на коректне завершення — дешева страховка від болючих інцидентів у майбутньому. Додайте його до збірки одразу, поки код завершення простий, бо пізніше він обростає виняткам і його важче перевірити.`,
    ],
    code: [
      String.raw`import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static class Server {
        private final AtomicBoolean stopping = new AtomicBoolean();
        private final AtomicInteger inFlight = new AtomicInteger();

        int handle(Runnable work) {
            if (stopping.get()) {
                return 503;                                // нові запити після зупинки відхиляються
            }
            inFlight.incrementAndGet();
            try {
                work.run();
                return 200;
            } finally {
                inFlight.decrementAndGet();
            }
        }

        void beginShutdown() {
            stopping.set(true);
        }

        int inFlight() {
            return inFlight.get();
        }
    }

    public static void main(String[] args) {
        Server server = new Server();
        System.out.println(server.handle(() -> { }));
        server.beginShutdown();
        System.out.println(server.handle(() -> { }));
        System.out.println(server.inFlight());
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Thread hook = new Thread(() -> System.out.println("shutdown hook: closing resources"));
        Runtime.getRuntime().addShutdownHook(hook);        // спрацює при нормальному завершенні JVM
        System.out.println("main finished");
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    static void stop(ExecutorService pool) throws InterruptedException {
        pool.shutdown();                                     // не приймати нових завдань
        if (!pool.awaitTermination(2, TimeUnit.SECONDS)) {
            pool.shutdownNow();                              // тайм-аут: перервати активні
            pool.awaitTermination(1, TimeUnit.SECONDS);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        pool.execute(() -> System.out.println("task finished"));
        stop(pool);
        System.out.println(pool.isTerminated());
    }
}`,
      String.raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicBoolean stopping = new AtomicBoolean();
        CountDownLatch started = new CountDownLatch(1);
        Thread worker = new Thread(() -> {
            started.countDown();
            while (!stopping.get()) {
                Thread.onSpinWait();
            }
            System.out.println("worker saw stop flag and exits");
        });
        worker.start();
        started.await();
        stopping.set(true);
        worker.join();
    }
}`,
      String.raw`// аварія: той самий хук не можна зареєструвати двічі, IllegalArgumentException
public class Main {
    public static void main(String[] args) {
        Thread hook = new Thread(() -> System.out.println("bye"));
        Runtime.getRuntime().addShutdownHook(hook);
        System.out.println("registered once");
        Runtime.getRuntime().addShutdownHook(hook);
    }
}`,
    ],
    note: String.raw`Коректне завершення: прапорець «зупиняємось», 503 для нових запитів, лічильник запитів у польоті, очікування з тайм-аутом, потім закриття пулів і ресурсів у зворотному порядку. На SIGTERM спрацьовують shutdown hooks, а SIGKILL перехопити не можна.`,
    work: String.raw`У Kubernetes і подібних системах екземпляри сервісів перезапускаються постійно, тож коректне завершення — норма, а не розкіш. Помилки в ньому проявляються як рідкісні 502 і 504 під час кожного розгортання, і їх шукають довго, бо вони зникають, коли намагаєшся відтворити.`,
    tasks: [
      String.raw`Чому нові запити під час зупинки відхиляють кодом 503, а не просто ігнорують?`,
      String.raw`У якому порядку закривають вхід, воркери й ресурси під час зупинки?`,
    ],
  },
];
