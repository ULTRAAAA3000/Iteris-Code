export const LESSONS_12 = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Аналіз тексту схожий на підрахунок голосів: спершу розбиваємо бюлетені на окремі голоси (слова), потім рахуємо, потім складаємо рейтинг. Якщо в двох кандидатів порівну, наперед домовляємося, хто вищий, інакше рейтинг щоразу різний.",
    p: [
      "Це перший із підсумкових проєктних уроків. Нової синтаксичної теми тут немає: ми збираємо вже знайоме (рядки, мапи, потоки, сортування) у невелику програму, яка читає текст і друкує звіт: скільки слів і скільки з них унікальних, які слова трапляються найчастіше, яке слово найдовше й скільки є речень. Такі звіти лежать в основі пошукових індексів, аналізу журналів і перевірки текстів.",
      "Спершу домовтеся про правила, адже «слово» не є очевидним поняттям. Ми вважаємо словом послідовність літер, цифр і апострофа, а все інше (пробіли, коми, дужки, тире) роздільником. Регістр не важливий: «The» і «the» одне слово. Рейтинг упорядковуємо за кількістю за спаданням, а за рівної кількості за словом за зростанням. Правила запишіть до коду: від них залежить кожна цифра звіту.",
      "Проєктування: розкладіть програму на маленькі функції, кожну з яких можна перевірити окремо. <code>words(text)</code> розбиває й нормалізує, <code>frequencies(words)</code> рахує, <code>top(freq, n)</code> сортує й обрізає, <code>longest(words)</code> шукає найдовше слово, <code>sentences(text)</code> рахує речення. Функції не друкують, а повертають значення: друкує лише <code>main</code>. Тоді кожну з них можна викликати на кількох прикладах і порівняти з відповіддю, порахованою вручну.",
      "Будуємо поетапно, і кожен крок можна запустити. Крок 1: розбиття за регулярним виразом <code>[^\\p{L}\\p{N}']+</code>, приведення до нижнього регістру через <code>toLowerCase(Locale.ROOT)</code> і відкидання порожніх рядків. Крок 2: частоти через <code>Map.merge(word, 1, Integer::sum)</code>. Крок 3: сортування компаратором із двох критеріїв: <code>comparingByValue().reversed().thenComparing(comparingByKey())</code>. Крок 4: найдовше слово й кількість речень.",
      "Типові помилки. Розбиття по пробілах (<code>split</code> із одним пробілом) лишає розділові знаки при словах, і «cat,» та «cat» стають різними ключами. Порівняння без приведення до нижнього регістру розщеплює частоти. Виклик <code>split</code> для порожнього рядка дає масив з одним порожнім елементом, тож порожній текст «має» одне слово, якщо не відкинути порожні. Сортування лише за кількістю лишає порядок рівних випадковим, бо <code>HashMap</code> не гарантує порядку обходу, і звіт відрізнятиметься від запуску до запуску.",
      "Довжину слова міряйте в символах Юнікоду (<code>codePointCount</code>), а не в одиницях UTF-16: символ поза базовою площиною, як-от емодзі, займає дві одиниці <code>char</code>, і <code>length()</code> порахує його за два. Для літер українського алфавіту різниці немає, але правильну звичку краще виробити одразу. Те саме з нижнім регістром: завжди вказуйте <code>Locale.ROOT</code>, щоб результат не залежав від мови операційної системи (у турецькій локалі велика «I» перетворюється не на «i»).",
      "Як перевірити результат. Складіть невеликий текст, відповідь для якого ви можете порахувати вручну, і порівняйте вивід із очікуваним. Додайте граничні випадки: порожній текст, текст лише з розділових знаків, слова з цифрами й апострофами, два слова однакової довжини. Якщо звіт збігається з розрахунком на папері, функції працюють, і їх можна застосовувати до справжнього тексту.",
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class Main {
    static List<String> words(String text) {
        List<String> result = new ArrayList<>();
        for (String w : text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}']+")) {
            if (!w.isEmpty()) {
                result.add(w);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(words("The cat, the HAT; it's (on) the mat!"));
        System.out.println(words("").size() + " " + words("...").size());
        System.out.println("".split(",").length);   // 1: порожній рядок дає один порожній елемент
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
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

    public static void main(String[] args) {
        List<String> words = List.of("b", "a", "c", "a", "b", "a", "d");
        System.out.println(top(frequencies(words), 3));
        System.out.println(top(frequencies(words), 10));
    }
}`,
      String.raw`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    private static final Pattern END = Pattern.compile("[\\p{L}\\p{N}][.!?]+");

    static int sentences(String text) {
        Matcher m = END.matcher(text);
        int count = 0;
        while (m.find()) {
            count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(sentences("One. Two! Three?"));
        System.out.println(sentences("Wait... what?! Really"));
        System.out.println(sentences("... !!!"));
    }
}`,
      String.raw`// не компілюється: Map.Entry не має природного порядку, для сортування потрібен Comparator
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> freq = Map.of("a", 3, "b", 1);
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(freq.entrySet());
        Collections.sort(entries);
        System.out.println(entries);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String word = "ab\uD83D\uDE00";   // два символи й емодзі; пишемо кодами, щоб вивід лишався ASCII
        System.out.println(word.length());                           // 4: емодзі займає дві одиниці char
        System.out.println(word.codePointCount(0, word.length()));   // 3: так рахує людина
    }
}`,
    ],
    note: "Правила розбору (що таке слово, який регістр, як упорядкувати рівні) запишіть до коду й перевіряйте на прикладах. Без другого критерію сортування звіт виходить різним від запуску до запуску, а довжину слова міряйте в символах Юнікоду.",
    work: "Підрахунок слів і частот стоїть за пошуковими індексами, аналізом журналів, перевіркою плагіату й хмарами тегів. Уміння розкласти задачу на малі функції з чіткими правилами для граничних випадків потрібне в будь-якому обробленні даних.",
    tasks: [
      "Чому за рівної кількості слів потрібен другий критерій сортування і що буде без нього?",
      "Чому довжину слова краще міряти через codePointCount, а не length?",
    ],
  },
  {
    t: "Проєкт: REST API нотаток",
    ch: "Проєкти",
    easy: "REST API нотаток — це нотатник із віконцем для відвідувачів: хтось просить записати, прочитати чи викреслити, а ви відповідаєте чітким кодом: готово, не знайдено або ви помилилися в запиті.",
    p: [
      "Другий проєкт збирає докупи все, що ми вивчили про сервіси: маршрутизацію, обробники, шари, JSON, коди статусів і сховище в пам'яті. Мережі в пісочниці немає, тому «сервер» тут це метод <code>handle(Request)</code>, який приймає запит як звичайний об'єкт і повертає відповідь. Справжній HTTP-сервер лише розбирає байти із сокета на такий самий <code>Request</code> і записує <code>Response</code> назад.",
      "Контракт API. <code>POST /notes</code> створює нотатку з тіла із полем <code>title</code> і відповідає 201 з новою нотаткою; <code>GET /notes</code> повертає масив; <code>GET /notes/{id}</code> читає (200 або 404); <code>DELETE /notes/{id}</code> видаляє (204 або 404). Усі помилки мають однаковий формат (об'єкт із полем <code>error</code>) і правильний статус: 400 для некоректного запиту, 404 для відсутнього ресурсу, 405 для невідомого методу.",
      "Розкладаємо на частини. Маршрутизатор дивиться на метод і шлях та вибирає обробник; обробники розбирають вхідні дані, звертаються до сховища й формують відповідь; сховище — це <code>ConcurrentHashMap</code> із <code>AtomicInteger</code> для ідентифікаторів. Допоміжні функції <code>json(note)</code> і <code>error(status, message)</code> збирають відповіді в одному місці, тому формат не розійдеться між обробниками.",
      "Валідація — перше, що роблять обробники: тіло має містити непорожнє поле <code>title</code> (після обрізання пробілів). Ідентифікатор зі шляху розбирають з обробкою <code>NumberFormatException</code>: нечисловий id це 400 із повідомленням про некоректний id, а не виняток, що вилітає з обробника. Помилка клієнта має ставати відповіддю 4xx, а не 500, бо 500 означає «зламався сервер».",
      "JSON робимо вручну: збираємо рядок з екрануванням лапок і зворотних скісних рисок, а поле <code>title</code> із запиту дістаємо регулярним виразом. Для навчання цього досить, і добре видно, як усе влаштовано; у справжніх проєктах це роблять бібліотеки (Jackson, Gson), бо ручний розбір легко зламати складним введенням.",
      "Порядок розробки. Спершу найпростіший шлях через усі шари (створення й читання), потім помилки (400 і 404), потім видалення й список, наприкінці маршрути з неправильними методами. Після кожного кроку запускайте програму: вона одразу друкує відповіді на серію запитів, і розбіжності видно в тексті.",
      "Типові помилки. Статус 200 на створення замість 201; тіло в відповіді 204; різні формати помилок в різних обробниках; нечисловий id, який кидає <code>NumberFormatException</code> і перетворюється на 500; відсутня відповідь 405 для відомого шляху з невідомим методом. Тримайте формування відповідей в одному місці, і ці помилки стануть рідкісними.",
    ],
    code: [
      String.raw`public class Main {
    record Request(String method, String path, String body) { }

    record Response(int status, String body) {
        @Override
        public String toString() { return status + " " + body; }
    }

    static Response handle(Request r) {
        String[] parts = r.path().split("/");   // "/notes/7" -> ["", "notes", "7"]
        if (parts.length >= 2 && parts[1].equals("notes")) {
            if (parts.length == 2) {
                return new Response(200, "collection " + r.method());
            }
            if (parts.length == 3) {
                return new Response(200, "item " + parts[2] + " " + r.method());
            }
        }
        return new Response(404, "{\"error\":\"not found\"}");
    }

    public static void main(String[] args) {
        System.out.println(handle(new Request("GET", "/notes", "")));
        System.out.println(handle(new Request("DELETE", "/notes/7", "")));
        System.out.println(handle(new Request("GET", "/users", "")));
    }
}`,
      String.raw`import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    record Note(int id, String title) { }

    record Response(int status, String body) {
        @Override
        public String toString() { return status + " " + body; }
    }

    static final ConcurrentHashMap<Integer, Note> NOTES = new ConcurrentHashMap<>();
    static final AtomicInteger IDS = new AtomicInteger();
    static final Pattern TITLE = Pattern.compile("\"title\"\\s*:\\s*\"([^\"]*)\"");

    static String json(Note n) {
        return "{\"id\":" + n.id() + ",\"title\":\"" + n.title() + "\"}";
    }

    static Response error(int status, String message) {
        return new Response(status, "{\"error\":\"" + message + "\"}");
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

    public static void main(String[] args) {
        System.out.println(create("{\"title\":\"Buy milk\"}"));
        System.out.println(create("{\"title\":\"   \"}"));
        System.out.println(create("{}"));
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    record Response(int status, String body) {
        @Override
        public String toString() { return (status + " " + body).trim(); }
    }

    static final Map<Integer, String> NOTES = new HashMap<>(Map.of(1, "Buy milk"));

    static Response get(String rawId) {
        int id;
        try {
            id = Integer.parseInt(rawId);
        } catch (NumberFormatException e) {
            return new Response(400, "{\"error\":\"invalid id\"}");
        }
        String title = NOTES.get(id);
        if (title == null) {
            return new Response(404, "{\"error\":\"not found\"}");
        }
        return new Response(200, "{\"id\":" + id + ",\"title\":\"" + title + "\"}");
    }

    static Response remove(int id) {
        return NOTES.remove(id) == null ? new Response(404, "{\"error\":\"not found\"}") : new Response(204, "");
    }

    public static void main(String[] args) {
        System.out.println(get("1"));
        System.out.println(get("abc"));
        System.out.println(get("9"));
        System.out.println(remove(1));
        System.out.println(remove(1));
    }
}`,
      String.raw`public class Main {
    static String escape(String s) {
        StringBuilder out = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                default -> out.append(c);
            }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        String title = "say \"hi\"\n";
        System.out.println("{\"title\":\"" + escape(title) + "\"}");
        System.out.println("{\"title\":\"" + title.trim() + "\"}");   // без екранування це вже не коректний JSON
    }
}`,
      String.raw`// аварія: нечисловий id не перевірено, NumberFormatException виходить за межі обробника, а клієнт мав би отримати 400
public class Main {
    static String get(String rawId) {
        int id = Integer.parseInt(rawId);
        return "200 note " + id;
    }

    public static void main(String[] args) {
        System.out.println(get("7"));
        System.out.println(get("seven"));
    }
}`,
    ],
    note: "Обробник API зводить помилки клієнта до відповідей 4xx з єдиним форматом, а коди статусів точні: 201 на створення, 204 на видалення, 404 для відсутнього ресурсу, 405 для невідомого методу. Нечисловий id це 400, а не виняток.",
    work: "Така структура (маршрутизатор, обробники, сховище, єдиний формат помилок) є в кожному REST-сервісі, а в Spring вона прихована за анотаціями. Знаючи, що відбувається під ними, ви швидше знаходите причину 400, 404 чи 500 у справжньому API.",
    tasks: [
      "Чому створення ресурсу повертає 201, а видалення 204, а не просто 200 для обох?",
      "Чому нечисловий id у шляху має давати 400, а не 500?",
    ],
  },
  {
    t: "Проєкт: конкурентний обробник",
    ch: "Проєкти",
    easy: "Конкурентний обробник схожий на касу з кількома віконцями: черга розбирається паралельно, але віконець рівно стільки, скільки задано, а чеки вишиковуються в тому порядку, в якому стояли клієнти.",
    p: [
      "Масову обробку (завантаження файлів, перевірку посилань, виклики зовнішнього API) запускають паралельно, але з обмеженням: необмежена кількість потоків вичерпає пам'ять чи зовнішній сервіс. Вимоги до такого обробника прості: не більше <code>limit</code> завдань одночасно, результати в тому ж порядку, що й вхідні дані, помилка завдання не губиться, а наприкінці всі потоки зупинено.",
      "Основа — пул потоків фіксованого розміру: <code>Executors.newFixedThreadPool(limit)</code>. Розмір пулу й є лімітом паралелізму: зайві завдання чекають у черзі. Кожне завдання подаємо через <code>submit</code> і отримуємо <code>Future</code>; список ф'ючерсів у порядку подачі дає змогу зібрати результати у вхідному порядку, незалежно від того, яке завдання завершилося першим.",
      "Результат читаємо методом <code>Future.get()</code>: він чекає завершення й повертає значення. Якщо завдання кинуло виняток, <code>get</code> кидає <code>ExecutionException</code> з причиною (<code>getCause()</code>). Саме тут вирішують, що робити з помилкою: загорнути у власний виняток із номером завдання, зупинити решту чи зібрати всі помилки. У нашому проєкті беремо помилку з найменшим номером, тоді результат передбачуваний.",
      "Зупинка пулу обов'язкова. Потоки <code>newFixedThreadPool</code> не є демонами: якщо пул не закрити, програма не завершиться, навіть коли <code>main</code> уже закінчився. Із Java 19 <code>ExecutorService</code> реалізує <code>AutoCloseable</code>, тож пул зручно відкрити в <code>try-with-resources</code>: наприкінці блоку викликається <code>close()</code>, що чекає завершення завдань. Для старіших версій використовують <code>try</code> із <code>finally</code> і <code>shutdown()</code>.",
      "Як перевірити, що ліміт виконується? Заведіть лічильник поточних завдань (<code>AtomicInteger</code>): на вході <code>incrementAndGet</code>, на виході <code>decrementAndGet</code>, а найбільше значення зберігайте через <code>accumulateAndGet(now, Math::max)</code>. Після роботи максимум не має перевищувати ліміт. А що завдання справді йдуть паралельно, покаже засувка <code>CountDownLatch</code>: два завдання чекають одне одного й проходять лише разом.",
      "Типові помилки. Забутий <code>shutdown</code> залишає програму висіти. <code>newCachedThreadPool</code> не обмежує кількість потоків і ламає ліміт. Збір результатів у спільний <code>ArrayList</code> з кількох потоків губить дані й порушує порядок. Блокувальне <code>get()</code> усередині завдання того ж пулу може призвести до взаємного блокування. Використання <code>parallelStream()</code> для блокувальних операцій займає спільний пул JVM і лишає менше контролю.",
      "Це підсумок попередніх тем: потоки, виконавці, <code>Future</code>, атомарні лічильники, засувки й коректне завершення. У виробничому коді таку роль виконують <code>CompletableFuture</code>, віртуальні потоки із семафором чи бібліотеки обмеження швидкості, але інваріанти ті самі: ліміт, порядок, помилки, зупинка. Якщо ви їх тримаєте в голові, будь-яка бібліотека паралельної обробки стає зрозумілою за кілька хвилин.",
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        try {
            List<Future<Integer>> futures = new ArrayList<>();
            for (int n = 1; n <= 6; n++) {
                final int value = n;
                futures.add(pool.submit(() -> value * value));
            }
            List<Integer> results = new ArrayList<>();
            for (Future<Integer> f : futures) {
                results.add(f.get());
            }
            System.out.println(results);   // порядок збігається з порядком подачі
        } finally {
            pool.shutdown();
        }
    }
}`,
      String.raw`import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            Future<String> a = pool.submit(() -> "first");
            Future<String> b = pool.submit(() -> "second");
            System.out.println(List.of(a.get(), b.get()));
        }   // close(): чекає завершення завдань і зупиняє пул (Java 19 і новіші)
        System.out.println("pool closed");
    }
}`,
      String.raw`import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newSingleThreadExecutor();
        try {
            Future<Integer> f = pool.submit(() -> {
                if (true) {
                    throw new IllegalStateException("boom");
                }
                return 1;
            });
            try {
                f.get();
            } catch (ExecutionException e) {
                System.out.println("wrapped: " + e.getClass().getSimpleName());
                System.out.println("cause: " + e.getCause());
            }
        } finally {
            pool.shutdown();
        }
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        AtomicInteger running = new AtomicInteger();
        AtomicInteger peak = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(3)) {
            List<Future<?>> futures = new ArrayList<>();
            for (int i = 0; i < 9; i++) {
                futures.add(pool.submit(() -> {
                    peak.accumulateAndGet(running.incrementAndGet(), Math::max);
                    try {
                        Thread.sleep(20);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    running.decrementAndGet();
                }));
            }
            for (Future<?> f : futures) {
                f.get();
            }
        }
        System.out.println("peak <= 3: " + (peak.get() <= 3));
    }
}`,
      String.raw`// не компілюється: Future.get() кидає перевірювані винятки InterruptedException і ExecutionException
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<Integer> f = pool.submit(() -> 42);
        System.out.println(f.get());
        pool.shutdown();
    }
}`,
    ],
    note: "Фіксований пул задає ліміт паралелізму, список Future зберігає порядок результатів, а get() перетворює помилку завдання на ExecutionException. Пул обов'язково зупиняйте (shutdown або try-with-resources), інакше програма не завершиться.",
    work: "Обмежений паралелізм потрібен усюди, де багато однотипних запитів: масове завантаження, перевірка посилань, обробка файлів, виклики API. Без ліміту така робота виснажує пам'ять і підключення, а без коректної зупинки пули лишають у робочих сервісах «висячі» потоки.",
    tasks: [
      "Чому розмір фіксованого пулу потоків одночасно є лімітом паралелізму?",
      "Що станеться з програмою, якщо пул потоків не зупинити, а метод main завершиться?",
    ],
  },
  {
    t: "Проєкт: кеш із TTL і generics",
    ch: "Проєкти",
    adv: true,
    easy: "Кеш — це столик біля робочого місця: найпотрібніше лежить під рукою, рідко вживане прибирають, а лежаче занадто довго викидають за терміном. Generics дають змогу користуватися таким столиком для будь-яких речей.",
    p: [
      "Кеш зберігає результати дорогих операцій (запит до бази, виклик API, обчислення), щоб не повторювати їх. Він має три головні властивості: обмежений розмір (інакше з'їсть пам'ять), термін життя записів TTL (дані застарівають) і метрики влучань та промахів. Кеш завжди є компромісом між швидкістю й актуальністю даних.",
      "Generics роблять кеш універсальним: <code>TtlCache&lt;K, V&gt;</code> працює з будь-якими ключами та значеннями й не потребує приведень типів. Запис зберігає значення й момент закінчення: <code>record Entry&lt;V&gt;(V value, long expiresAt)</code>. Ключі мають мати коректні <code>equals</code> і <code>hashCode</code>, а ще краще бути незмінними, як ми бачили в уроках про <code>HashMap</code> і <code>record</code>.",
      "Витіснення LRU (least recently used): коли місце закінчилося, видаляємо запис, яким найдавніше користувалися. У Java цю ідею дає <code>LinkedHashMap</code> із режимом доступу (<code>accessOrder = true</code>): кожен <code>get</code> і <code>put</code> переносить запис у кінець, а найдавніший лежить на початку. Видалити його можна через ітератор або перевизначивши <code>removeEldestEntry</code>.",
      "TTL і годинник. Термін життя міряють від моменту запису, а поточний час беруть із підставного джерела (<code>LongSupplier</code> чи <code>Clock</code>), а не з <code>System.currentTimeMillis()</code>: у перевірці годинник можна пересунути на потрібну мить і не чекати справжніх секунд. Запис вважають протермінованим, коли <code>now &gt;= expiresAt</code>; межу домовтеся брати включно й зафіксуйте це в перевірці.",
      "Ліниве й активне видалення. «Ліниве»: протермінований запис видаляють під час <code>get</code>, коли про нього запитали. Але записи, до яких не звертаються, лежатимуть вічно, тому додають метод <code>sweep()</code>, що проходить усю мапу й видаляє протерміновані. Видаляти під час обходу можна лише через <code>Iterator.remove()</code> або <code>removeIf</code>: пряме <code>map.remove</code> у циклі for-each кидає <code>ConcurrentModificationException</code>.",
      "Метрики. Лічильники <code>hits</code> і <code>misses</code> показують відсоток влучань: якщо він низький, кеш лише забирає пам'ять. Промахом рахуємо й той випадок, коли запис знайшли, але він протермінований. Ці числа корисно віддавати назовні (у журнал чи метрики), бо кеш без спостережуваності схожий на оптимізацію наосліп.",
      "Безпека потоків. <code>LinkedHashMap</code> не потокобезпечна, а в режимі доступу навіть читання змінює структуру. Для кількох потоків методи роблять <code>synchronized</code> або беруть готові рішення (Caffeine, Guava Cache). Тут ми залишаємо один потік, щоб побачити сам алгоритм, і пам'ятаємо про це обмеження.",
    ],
    code: [
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.LongSupplier;

public class Main {
    static class TtlCache<K, V> {
        private record Entry<V>(V value, long expiresAt) { }

        private final Map<K, Entry<V>> map = new HashMap<>();
        private final LongSupplier now;

        TtlCache(LongSupplier now) { this.now = now; }

        void put(K key, V value, long ttl) {
            map.put(key, new Entry<>(value, now.getAsLong() + ttl));
        }

        Optional<V> get(K key) {
            Entry<V> e = map.get(key);
            if (e == null || now.getAsLong() >= e.expiresAt()) {
                map.remove(key);
                return Optional.empty();
            }
            return Optional.of(e.value());
        }
    }

    public static void main(String[] args) {
        long[] clock = {0};
        TtlCache<String, Integer> cache = new TtlCache<>(() -> clock[0]);
        cache.put("a", 1, 100);
        System.out.println(cache.get("a"));
        clock[0] = 100;
        System.out.println(cache.get("a"));
    }
}`,
      String.raw`import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    static class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LruCache(int capacity) {
            super(16, 0.75f, true);   // true: порядок за останнім зверненням
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;
        }
    }

    public static void main(String[] args) {
        LruCache<String, Integer> cache = new LruCache<>(2);
        cache.put("a", 1);
        cache.put("b", 2);
        cache.get("a");      // a тепер найсвіжіший
        cache.put("c", 3);   // місця немає: витісняється b
        System.out.println(cache.keySet());
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Long> expiresAt = new HashMap<>(Map.of("a", 50L, "b", 150L, "c", 90L));
        long now = 100;
        int before = expiresAt.size();
        expiresAt.values().removeIf(t -> t <= now);
        System.out.println(before - expiresAt.size() + " removed, left " + expiresAt.keySet());
    }
}`,
      String.raw`// аварія: видалення з мапи просто в циклі for-each, ConcurrentModificationException
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Long> expiresAt = new HashMap<>(Map.of("a", 50L, "b", 150L, "c", 90L));
        for (String key : expiresAt.keySet()) {
            if (expiresAt.get(key) < 100) {
                expiresAt.remove(key);
            }
        }
        System.out.println(expiresAt);
    }
}`,
      String.raw`public class Main {
    static class Stats {
        private long hits;
        private long misses;

        void hit() { hits++; }

        void miss() { misses++; }

        String summary() {
            long total = hits + misses;
            long percent = total == 0 ? 0 : hits * 100 / total;
            return "hits=" + hits + " misses=" + misses + " ratio=" + percent + "%";
        }
    }

    public static void main(String[] args) {
        Stats stats = new Stats();
        stats.hit();
        stats.hit();
        stats.hit();
        stats.miss();
        System.out.println(stats.summary());
        System.out.println(new Stats().summary());   // без запитів ділення на нуль не відбувається
    }
}`,
    ],
    note: "Кеш обмежує розмір (LRU), термін життя (TTL з підставним годинником) і рахує влучання з промахами. Протерміновані записи видаляйте і при читанні, і окремим sweep, а видаляти під час обходу можна лише через ітератор чи removeIf.",
    work: "Кеші стоять перед базами даних і зовнішніми API майже в кожному сервісі. Підставний годинник робить перевірку TTL миттєвою, а метрики влучань показують, чи кеш взагалі вигідний, чи тільки з'їдає пам'ять і додає ризик застарілих даних.",
    tasks: [
      "Чим «ліниве» видалення протермінованих записів відрізняється від методу sweep і навіщо потрібні обидва?",
      "Чому TTL-кеш краще перевіряти з підставним годинником, а не через Thread.sleep?",
    ],
  },
  {
    t: "Проєкт: rate limiter і підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Rate limiter — це турнікет у метро: кожному дозволено проходити з певною швидкістю, а коли набігла юрба, частину людей просять зачекати й кажуть, скільки секунд.",
    p: [
      "Rate limiter обмежує, як часто клієнт може викликати сервіс. Він захищає від перевантаження (випадкового чи зловмисного), від перебору паролів і від того, щоб один клієнт займав усі ресурси. Коли ліміт перевищено, сервер відповідає статусом 429 Too Many Requests і підказує заголовком <code>Retry-After</code>, коли повторити запит.",
      "Алгоритм «відро жетонів» (token bucket). Відро вміщує до <code>burst</code> жетонів і поповнюється одним жетоном за кожен інтервал. Кожен запит забирає жетон; якщо відро порожнє, запит відхиляється. Так клієнт може зробити короткий сплеск (до burst запитів підряд), але в середньому не швидше, ніж один запит за інтервал.",
      "Рахувати можна без потоку-таймера: достатньо запам'ятати час останнього поповнення. Під час запиту визначаємо, скільки повних інтервалів минуло, додаємо стільки жетонів (не більше burst) і зсуваємо мітку часу на ці інтервали, а не на «зараз», щоб не втрачати дробову частину. Якщо відро повне, мітку часу ставимо на поточний момент.",
      "Годинник знову підставний: <code>LongSupplier now</code> у конструкторі. Тоді перевірка просто пересуває «час» і одразу бачить поведінку без жодного <code>sleep</code>. Для <code>Retry-After</code> рахуємо, скільки лишилося до наступного жетона: <code>interval - (now - last)</code>; у секундах округлюємо вгору, щоб клієнт не повернувся надто рано.",
      "Окремі клієнти мають окремі відра. Для кожного ключа (IP, ідентифікатор користувача, ключ API) тримають свій лімітер у <code>ConcurrentHashMap</code>, а створюють його атомарно через <code>computeIfAbsent</code>. Усередині лімітера метод <code>allow</code> робиться <code>synchronized</code>, бо «прочитати, порахувати, записати» не є атомарною послідовністю. У довгоживучому сервісі старі ключі треба прибирати, інакше мапа росте.",
      "Middleware. Лімітер вмикають як обгортку над обробником: на вході беруть ключ клієнта, питають <code>allow</code>, і якщо відмова, відповідають 429 з <code>Retry-After</code>, не викликаючи справжній обробник. Це приклад ланцюга з уроку про middleware: ту саму обгортку можна підключити до будь-якого маршруту, не змінюючи бізнес-код. Порядок обгорток теж має значення: лімітер зазвичай ставлять першим, щоб відхилені запити не витрачали ресурси на решту ланцюга.",
      "Підсумок курсу. Ви пройшли шлях від першого <code>System.out.println</code> до сервісу із шарами, потоками, помилками, тестами й обмеженням запитів. Далі логічно вивчати Spring Boot і JPA (вони ховають усе це за анотаціями), тестувати з JUnit і Mockito, збирати проєкти Maven чи Gradle, пакувати в Docker і писати власні невеликі сервіси. Головне вже є: розуміння того, що відбувається під капотом.",
    ],
    code: [
      String.raw`import java.util.function.LongSupplier;

public class Main {
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

        synchronized boolean allow() {
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
                return false;
            }
            tokens--;
            return true;
        }
    }

    public static void main(String[] args) {
        long[] clock = {0};
        TokenBucket bucket = new TokenBucket(2, 1000, () -> clock[0]);
        System.out.println(bucket.allow() + " " + bucket.allow() + " " + bucket.allow());
        clock[0] = 1500;
        System.out.println(bucket.allow() + " " + bucket.allow());
        clock[0] = 2000;
        System.out.println(bucket.allow());
    }
}`,
      String.raw`public class Main {
    static long retryAfterSeconds(long intervalMillis, long elapsedSinceLast) {
        long waitMillis = intervalMillis - elapsedSinceLast;
        return (waitMillis + 999) / 1000;   // округлення вгору до секунд
    }

    public static void main(String[] args) {
        System.out.println(retryAfterSeconds(1000, 0));     // 1
        System.out.println(retryAfterSeconds(1000, 500));   // 1
        System.out.println(retryAfterSeconds(2500, 100));   // 3
    }
}`,
      String.raw`import java.util.concurrent.ConcurrentHashMap;

public class Main {
    record Request(String client, String path) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    static Handler rateLimit(int perClient, Handler next) {
        ConcurrentHashMap<String, Integer> used = new ConcurrentHashMap<>();
        return request -> {
            int count = used.merge(request.client(), 1, Integer::sum);
            if (count > perClient) {
                return new Response(429, "Retry-After: 1");
            }
            return next.handle(request);
        };
    }

    public static void main(String[] args) {
        Handler limited = rateLimit(2, r -> new Response(200, "hello " + r.client()));
        for (String client : new String[] {"a", "a", "a", "b"}) {
            Response r = limited.handle(new Request(client, "/"));
            System.out.println(client + " -> " + r.status());
        }
    }
}`,
      String.raw`// не компілюється: лямбда не може посилатися на локальну змінну, яку змінюють; для підставного годинника беріть масив з одним елементом або AtomicLong
import java.util.function.LongSupplier;

public class Main {
    public static void main(String[] args) {
        long time = 0;
        LongSupplier clock = () -> time;
        time = 100;
        System.out.println(clock.getAsLong());
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    record Request(String client, String body) { }

    record Response(int status, String body) { }

    interface Handler {
        Response handle(Request request);
    }

    static class NoteRepository {
        private final Map<Integer, String> notes = new ConcurrentHashMap<>();
        private final AtomicInteger ids = new AtomicInteger();

        int save(String title) {
            int id = ids.incrementAndGet();
            notes.put(id, title);
            return id;
        }
    }

    static class NoteService {
        private final NoteRepository repository;

        NoteService(NoteRepository repository) { this.repository = repository; }

        int create(String title) {
            if (title.isBlank()) {
                throw new IllegalArgumentException("title is required");
            }
            return repository.save(title.trim());
        }
    }

    static Handler controller(NoteService service) {
        return r -> {
            try {
                return new Response(201, "id=" + service.create(r.body()));
            } catch (IllegalArgumentException e) {
                return new Response(400, e.getMessage());
            }
        };
    }

    static Handler logging(List<String> log, Handler next) {
        return r -> {
            Response response = next.handle(r);
            log.add(r.client() + " -> " + response.status());
            return response;
        };
    }

    public static void main(String[] args) {
        // корінь композиції: усе збирається в одному місці
        List<String> log = new ArrayList<>();
        Handler app = logging(log, controller(new NoteService(new NoteRepository())));

        System.out.println(app.handle(new Request("anna", "Buy milk")));
        System.out.println(app.handle(new Request("oleh", "   ")));
        System.out.println(log);
    }
}`,
    ],
    note: "Token bucket дозволяє короткий сплеск, але обмежує середню швидкість. Годинник підставний, лімітер на клієнта створюють через computeIfAbsent, метод allow синхронізований, а відмова несе статус 429 і Retry-After, округлений вгору.",
    work: "Обмеження частоти запитів є в кожному публічному API: воно захищає від перебору паролів, помилкових циклів у клієнтів і перевантаження. Той самий шаблон «обгортка над обробником» застосовують для автентифікації, кешування, метрик і журналювання.",
    tasks: [
      "Чому при поповненні відра мітку часу зсувають на цілу кількість інтервалів, а не ставлять на «зараз»?",
      "Навіщо у відповіді 429 потрібен заголовок Retry-After і чому секунди округлюють вгору?",
    ],
  },
];
