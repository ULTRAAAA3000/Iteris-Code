export const LESSONS_11 = [
  {
    t: "Шари: controller, service, repository",
    ch: "Архітектура",
    easy: "Ресторан працює шарами: офіціант приймає замовлення й нічого не готує, кухар готує, а склад зберігає продукти. Кожен робить свою справу й знає лише про сусіда за ланцюжком.",
    p: [
      "Програма, де розбір запиту, бізнес-правила й збереження даних змішані в одному методі, швидко стає нечитабельною. Змінюєте формат запиту, і є ризик зламати правила; змінюєте сховище, і доводиться переписувати все підряд. Шари розділяють відповідальності так, що кожну частину можна розуміти, змінювати й перевіряти окремо.",
      "Три класичні шари. <b>Controller</b> (контролер) знає про протокол: розбирає вхідні дані, викликає сервіс і перетворює результат або виняток на відповідь зі статусом. <b>Service</b> (сервіс) містить бізнес-правила: що можна, що ні, в якому порядку. <b>Repository</b> (репозиторій) знає лише, як зберегти й знайти об'єкти, а про запити й правила нічого не відає. Дані між шарами ходять як прості об'єкти домену, наприклад <code>record Note</code>.",
      "Напрям залежностей один: контролер → сервіс → репозиторій. Нижній шар не знає про верхній: репозиторій не викликає сервіс, а сервіс не знає, що дані прийшли з HTTP, а не з консолі чи перевірки. Саме це правило дає головну вигоду: сервіс можна випробувати без жодного запиту, а репозиторій підмінити, не чіпаючи правил.",
      "Репозиторій описують інтерфейсом: <code>NoteRepository</code> із методами <code>save</code> і <code>findById</code>. Сервіс залежить від інтерфейсу, а не від конкретного класу, тож реалізацію в пам'яті згодом можна замінити на базу даних. Інтерфейс «замовляє» той, хто ним користується, тому його зручно тримати поруч із сервісом, а не поруч із реалізацією.",
      "Помилки теж мають шари. Сервіс кидає доменні винятки (<code>InvalidNoteException</code>, <code>NoteNotFoundException</code>), які нічого не знають про коди статусів. Контролер перетворює їх на відповіді: перший на 400, другий на 404, а будь-який інший на 500 без технічних подробиць. Так правила лишаються чистими, а відповідність «виняток → статус» зібрана в одному місці.",
      "Типові помилки. «Товстий контролер» містить правила й працює зі сховищем напряму, тому без HTTP його не перевірити. Протікання шарів: репозиторій повертає внутрішні типи бази, а контролер ними користується. Зайві шари: клас-прокладка, що лише пересилає виклики, додає шум без користі. Починайте з тонких шарів і вводьте абстракції, коли справді з'являється друга реалізація чи складне правило.",
      "Шари не закон, а інструмент. У маленькій програмі сервіс може складатися з трьох рядків, і це нормально. У великій ті самі межі рятують від хаосу, особливо коли над кодом працює команда. Далі ми побачимо, як з'єднувати шари через конструктор і як зробити сховище безпечним для потоків.",
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static final List<String> STORE = new ArrayList<>();

    // розбір, правила й збереження в одному методі: так починає майже кожен проєкт
    static String handle(String request) {
        if (!request.startsWith("POST /notes ")) {
            return "404";
        }
        String title = request.substring("POST /notes ".length()).trim();
        if (title.isEmpty() || title.length() > 20) {
            return "400";
        }
        STORE.add(title);
        return "201 id=" + STORE.size();
    }

    public static void main(String[] args) {
        System.out.println(handle("POST /notes Buy milk"));
        System.out.println(handle("POST /notes    "));
        System.out.println(handle("GET /notes"));
        System.out.println(STORE);
    }
}`,
      String.raw`import java.util.ArrayList;
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

    static class NoteService {
        private final NoteRepository repository;

        NoteService(NoteRepository repository) { this.repository = repository; }

        Note create(String title) {
            if (title == null || title.isBlank() || title.length() > 20) {
                throw new InvalidNoteException("title must be 1-20 chars");
            }
            return repository.save(title.trim());
        }
    }

    static class NoteController {
        private final NoteService service;

        NoteController(NoteService service) { this.service = service; }

        String post(String title) {
            try {
                Note note = service.create(title);
                return "201 id=" + note.id();
            } catch (InvalidNoteException e) {
                return "400 " + e.getMessage();
            }
        }
    }

    public static void main(String[] args) {
        NoteController controller = new NoteController(new NoteService(new InMemoryNoteRepository()));
        System.out.println(controller.post("Buy milk"));
        System.out.println(controller.post("  "));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class Main {
    record Note(int id, String title) { }

    interface NoteRepository {
        Note save(String title);
        Optional<Note> findById(int id);
    }

    static class NoteService {
        private final NoteRepository repository;

        NoteService(NoteRepository repository) { this.repository = repository; }

        Note create(String title) {
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("empty title");
            }
            return repository.save(title.trim());
        }
    }

    // підробка для перевірки: запам'ятовує, що в неї просили зберегти
    static class FakeRepository implements NoteRepository {
        final List<String> saved = new ArrayList<>();

        public Note save(String title) {
            saved.add(title);
            return new Note(saved.size(), title);
        }

        public Optional<Note> findById(int id) { return Optional.empty(); }
    }

    public static void main(String[] args) {
        FakeRepository fake = new FakeRepository();
        NoteService service = new NoteService(fake);
        service.create("  hello ");
        try {
            service.create(" ");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }
        System.out.println(fake.saved);   // правило спрацювало до репозиторію, без жодного HTTP
    }
}`,
      String.raw`// не компілюється: контролер лізе через сервіс у репозиторій, а поле repo приватне (класи верхнього рівня не бачать чужих private)
public class Main {
    public static void main(String[] args) {
        new Controller().post(new Service());
    }
}

class Repo {
    void save(String title) { System.out.println("saved " + title); }
}

class Service {
    private final Repo repo = new Repo();

    void create(String title) { repo.save(title); }
}

class Controller {
    void post(Service service) {
        service.repo.save("x");
    }
}`,
    ],
    note: "Залежності йдуть лише згори вниз: контролер знає сервіс, сервіс знає інтерфейс репозиторію, а не навпаки. Правила живуть у сервісі, протокол у контролері, зберігання в репозиторії, і кожну частину можна перевірити окремо.",
    work: "У корпоративній Java поділ на контролер, сервіс і репозиторій є стандартом (Spring влаштований саме так), тож нові люди знаходять потрібний код за кілька хвилин. Тонкі шари полегшують зміни: протокол чи базу даних міняють, не торкаючись бізнес-правил.",
    tasks: [
      "Чому репозиторій не повинен знати про контролер, а сервіс про коди HTTP-статусів?",
      "Що піде не так, якщо правила перевірки назви нотатки перенести з сервісу в контролер?",
    ],
  },
  {
    t: "Залежності через конструктор",
    ch: "Архітектура",
    easy: "Лампу, вкручену в стелю назавжди, не замінити без ремонту, а лампа з патроном просто вкручується інша. Залежність через конструктор схожа на патрон: клас отримує потрібне ззовні й нічого не вибирає сам.",
    p: [
      "Залежність — це інший об'єкт, без якого клас не працює: сервісу потрібен репозиторій, репозиторію з'єднання, обробнику годинник. Є два способи її отримати: створити всередині (<code>new</code> у полі чи конструкторі) або прийняти ззовні. Перший спосіб жорстко прив'язує клас до однієї реалізації, другий лишає вибір тому, хто клас створює.",
      "Ін'єкція через конструктор — це отримання залежностей параметрами конструктора й збереження їх у <code>final</code>-полях. Клас більше не знає, звідки взялася залежність і яка вона насправді: йому достатньо інтерфейсу. Переваги очевидні: залежності видно в сигнатурі, об'єкт після створення повністю готовий, поля незмінні, а підміна в перевірках зводиться до одного параметра.",
      "Хто ж тоді створює об'єкти? Єдине місце складання називають коренем композиції (composition root), зазвичай це метод <code>main</code> або окремий клас <code>App</code>. Там створюють репозиторій, передають його сервісу, сервіс контролеру. Усі <code>new</code> зосереджені в одному місці, а решта коду лише оголошує, що їй потрібно. Це «ручне» впровадження залежностей, і для більшості програм його цілком вистачає.",
      "DI-контейнери (Spring, Guice, Dagger) автоматизують те саме: за типами параметрів конструкторів вони самі будують граф об'єктів. Принцип від цього не змінюється, і навіть документація Spring радить ін'єкцію через конструктор. Навчившись збирати програму вручну, ви розумієте, що саме робить фреймворк, і легко читаєте його налаштування.",
      "Залежності бувають неочевидними: поточний час, випадкові числа, змінні середовища, файлова система. Якщо метод усередині викликає <code>Instant.now()</code>, результат щоразу інший, і перевірити його важко. Передайте <code>Clock</code> (у перевірках підійде <code>Clock.fixed</code>), і час стає звичайним параметром. Так само з <code>Random</code>: приймайте його ззовні, і перевірка задасть потрібне початкове значення.",
      "Типові помилки. Створення залежності в полі (<code>private final Repo repo = new Repo()</code>) блокує підміну. Статичні виклики на кшталт <code>Database.getInstance()</code> роблять залежність невидимою. Забагато параметрів конструктора (п'ять і більше) натякає, що клас робить забагато й його варто розділити. Циклічні залежності (A потребує B, а B потребує A) вказують на помилку проєктування: винесіть спільну частину в третій клас.",
      "Не варто перетворювати на залежність усе підряд: рядок чи список передають як звичайні дані, а інтерфейс вводять там, де справді є кілька реалізацій або потрібна підміна в перевірках. Мета проста: клас має бути зрозумілим за своїм конструктором і зручним для перевірки без запуску всієї програми.",
    ],
    code: [
      String.raw`public class Main {
    static class SmsSender {
        void send(String to, String text) {
            System.out.println("SMS to " + to + ": " + text);
        }
    }

    // залежність створена всередині: підмінити SmsSender, не правлячи клас, неможливо
    static class Notifier {
        private final SmsSender sender = new SmsSender();

        void welcome(String user) { sender.send(user, "welcome"); }
    }

    public static void main(String[] args) {
        new Notifier().welcome("anna");
    }
}`,
      String.raw`public class Main {
    interface Sender {
        void send(String to, String text);
    }

    static class SmsSender implements Sender {
        public void send(String to, String text) { System.out.println("SMS to " + to + ": " + text); }
    }

    static class EmailSender implements Sender {
        public void send(String to, String text) { System.out.println("EMAIL to " + to + ": " + text); }
    }

    static class Notifier {
        private final Sender sender;

        Notifier(Sender sender) { this.sender = sender; }

        void welcome(String user) { sender.send(user, "welcome"); }
    }

    public static void main(String[] args) {
        // корінь композиції: тут, і лише тут, вирішується, яку реалізацію взяти
        new Notifier(new SmsSender()).welcome("anna");
        new Notifier(new EmailSender()).welcome("anna");
    }
}`,
      String.raw`import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

public class Main {
    static class Session {
        private final Instant started;

        Session(Instant started) { this.started = started; }

        boolean expired(Clock clock, long ttlSeconds) {
            return clock.instant().isAfter(started.plusSeconds(ttlSeconds));
        }
    }

    public static void main(String[] args) {
        Instant start = Instant.parse("2026-01-01T10:00:00Z");
        Clock after30 = Clock.fixed(start.plusSeconds(30), ZoneOffset.UTC);
        Clock after90 = Clock.fixed(start.plusSeconds(90), ZoneOffset.UTC);
        Session session = new Session(start);
        System.out.println(session.expired(after30, 60));   // false
        System.out.println(session.expired(after90, 60));   // true
        // у справжній програмі корінь композиції передасть Clock.systemUTC()
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    interface Sender {
        void send(String to, String text);
    }

    static class RecordingSender implements Sender {
        final List<String> log = new ArrayList<>();

        public void send(String to, String text) { log.add(to + ":" + text); }
    }

    static class Notifier {
        private final Sender sender;

        Notifier(Sender sender) { this.sender = sender; }

        void welcome(String user) { sender.send(user, "welcome"); }
    }

    public static void main(String[] args) {
        RecordingSender fake = new RecordingSender();
        new Notifier(fake).welcome("anna");
        System.out.println(fake.log.equals(List.of("anna:welcome")) ? "ok" : "FAIL");
    }
}`,
      String.raw`// аварія: кожен клас створює іншого у власному конструкторі, і стек викликів переповнюється (StackOverflowError)
public class Main {
    static class A {
        final B b = new B();
    }

    static class B {
        final A a = new A();
    }

    public static void main(String[] args) {
        new A();
    }
}`,
    ],
    note: "Залежності приймайте параметрами конструктора й зберігайте у final-полях, а <code>new</code> лишайте для кореня композиції. Час, випадкові числа й середовище теж залежності: передавайте <code>Clock</code>, <code>Random</code> і мапу змінних, а не викликайте їх усередині.",
    work: "Ін'єкція через конструктор лежить в основі Spring і всіх сучасних Java-проєктів: контейнер лише автоматизує складання графа об'єктів. Класи з видимими залежностями легко перевіряти заглушками, тому на рев'ю часто просять прибрати <code>new</code> і статичні виклики з бізнес-логіки.",
    tasks: [
      "Чим ін'єкція через конструктор краща за створення залежності через new у полі класу?",
      "Навіщо передавати в клас Clock, а не викликати Instant.now() усередині його методів?",
    ],
  },
  {
    t: "Репозиторій у пам'яті з ConcurrentHashMap",
    ch: "Архітектура",
    easy: "ConcurrentHashMap — це комора з багатьма дверима: кілька людей одночасно беруть і кладуть різні речі, і не треба стояти в одній черзі до єдиного комірника.",
    p: [
      "Репозиторій у пам'яті — найпростіше сховище: дані живуть, поки працює програма. Для навчання, прототипів і перевірок цього досить, а інтерфейс репозиторію дає змогу згодом замінити його на базу даних, не чіпаючи сервіс. Але коли із сервером працює багато потоків, звичайна <code>HashMap</code> небезпечна: паралельні зміни можуть загубити записи чи зіпсувати внутрішню структуру.",
      "<code>ConcurrentHashMap</code> безпечна для потоків: окремі операції <code>get</code>, <code>put</code> і <code>remove</code> атомарні, а читання не блокують одне одного. Вона не бере єдиний замок на всю мапу, тому різні ключі змінюються паралельно. Ключів і значень <code>null</code> вона не приймає (буде <code>NullPointerException</code>): так «немає запису» й «запис зі значенням null» ніколи не плутаються.",
      "Ідентифікатори видає <code>AtomicLong</code> чи <code>AtomicInteger</code>: <code>incrementAndGet()</code> повертає унікальне число навіть при гонці потоків. Звичайний <code>nextId++</code> небезпечний: два потоки можуть прочитати те саме значення й видати однакові id. Пара «мапа плюс атомарний лічильник» — це основа простого репозиторію.",
      "Найтонше місце — послідовність «перевірити, потім зробити». Код <code>if (!map.containsKey(k)) map.put(k, v)</code> безпечний у кожному виклику окремо, але разом не атомарний: між перевіркою й записом інший потік устигне вставити свій запис. Для цього є атомарні методи <code>putIfAbsent</code>, <code>computeIfAbsent</code>, <code>compute</code>, <code>merge</code> і <code>replace</code>: вони виконують перевірку й зміну як одну операцію.",
      "Змінювати значення теж треба атомарно. Замість «прочитав, змінив, записав» пишіть <code>map.merge(key, 1, Integer::sum)</code> чи <code>map.compute(id, ...)</code>: функція виконується під захистом ключа. Усередині таких функцій не робіть довгих чи блокувальних дій і не змінюйте саму мапу: це може призвести до зависання.",
      "Віддавайте знімки, а не «живі» вигляди. Метод <code>findAll()</code> не повинен повертати <code>map.values()</code>: це «живий» вигляд (view) мапи, що змінюється під час обходу й відкриває внутрішній стан. Повертайте копію (<code>List.copyOf</code> або новий список) і, якщо потрібен порядок, сортуйте за id. Обхід <code>ConcurrentHashMap</code> не кидає <code>ConcurrentModificationException</code>, але може побачити лише частину змін, зроблених одночасно.",
      "Обмеження. Усе пропадає із завершенням програми, а пам'ять без очищення росте без меж. Для нескладних сценаріїв це прийнятна ціна, а для даних, що мають жити довше, потрібна база. І навіть найкраща колекція не робить безпечною <i>послідовність</i> кількох операцій (наприклад, «зменшити баланс одного рахунку й збільшити інший»): для цього потрібен спільний замок або транзакція.",
    ],
    code: [
      String.raw`import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

public class Main {
    record Note(long id, String title) { }

    interface NoteRepository {
        Note save(String title);
        Optional<Note> findById(long id);
        List<Note> findAll();
        boolean delete(long id);
    }

    static class InMemoryNoteRepository implements NoteRepository {
        private final ConcurrentMap<Long, Note> notes = new ConcurrentHashMap<>();
        private final AtomicLong nextId = new AtomicLong();

        public Note save(String title) {
            Note note = new Note(nextId.incrementAndGet(), title);
            notes.put(note.id(), note);
            return note;
        }

        public Optional<Note> findById(long id) {
            return Optional.ofNullable(notes.get(id));
        }

        public List<Note> findAll() {
            return notes.values().stream().sorted(Comparator.comparingLong(Note::id)).toList();
        }

        public boolean delete(long id) {
            return notes.remove(id) != null;
        }
    }

    public static void main(String[] args) {
        NoteRepository repo = new InMemoryNoteRepository();
        repo.save("a");
        repo.save("b");
        repo.save("c");
        System.out.println(repo.delete(2) + " " + repo.delete(2));
        System.out.println(repo.findAll());
        System.out.println(repo.findById(3).map(Note::title).orElse("none"));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<Long, String> store = new ConcurrentHashMap<>();
        AtomicLong ids = new AtomicLong();
        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 4; t++) {
            Thread thread = new Thread(() -> {
                for (int i = 0; i < 1000; i++) {
                    store.put(ids.incrementAndGet(), "note");
                }
            });
            threads.add(thread);
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        System.out.println(store.size());
        System.out.println(ids.get());
    }
}`,
      String.raw`import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>();
        System.out.println(stock.putIfAbsent("apple", 5));   // null: запису не було
        System.out.println(stock.putIfAbsent("apple", 9));   // 5: запис уже є, не перезаписано
        stock.merge("apple", 3, Integer::sum);
        stock.compute("pear", (k, old) -> old == null ? 1 : old + 1);
        stock.compute("pear", (k, old) -> old == null ? 1 : old + 1);
        System.out.println(stock.get("apple") + " " + stock.get("pear"));
        System.out.println(stock.computeIfAbsent("kiwi", k -> k.length()));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<Integer, String> map = new ConcurrentHashMap<>();
        map.put(1, "a");
        var live = map.values();
        List<String> copy = new ArrayList<>(map.values());
        map.put(2, "b");
        System.out.println(live.size() + " " + copy.size());   // 2 1: живий вигляд бачить зміни, копія ні
    }
}`,
      String.raw`// аварія: ConcurrentHashMap не приймає null ні як ключ, ні як значення (NullPointerException)
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
        map.put("a", "x");
        System.out.println(map.get("a"));
        map.put("b", null);
    }
}`,
    ],
    note: "ConcurrentHashMap безпечна поодинці для get і put, але послідовність «перевірити, потім записати» не атомарна. Для неї є putIfAbsent, computeIfAbsent, compute і merge. Ідентифікатори видавайте через AtomicLong, а null у таку мапу класти не можна.",
    work: "Репозиторій у пам'яті — стандартна заглушка в перевірках і основа прототипів, кешів та сховищ сесій. Під навантаженням саме неатомарні «перевірив, потім змінив» дають рідкісні помилки, які важко відтворити, тому варто добре знати атомарні методи мапи.",
    tasks: [
      "Чому nextId++ небезпечний у репозиторії, яким користуються кілька потоків, а AtomicLong ні?",
      "Чим putIfAbsent відрізняється від пари containsKey і put?",
    ],
  },
  {
    t: "Конфігурація: Properties і змінні середовища",
    ch: "Архітектура",
    adv: true,
    easy: "Конфігурація — це пульт керування: порт, ліміти й адреси змінюють ручками, не розбираючи програму. Значення за замовчуванням задає початкове положення, а змінна середовища тимчасово його перекриває.",
    p: [
      "Що не варто зашивати в код: адреси сервісів, порти, тайм-аути, ліміти, перемикачі функцій і особливо паролі й токени. Вони різні для розробника, тестового й робочого середовищ, і змінювати їх треба без нової збірки. Це принцип «конфігурація відокремлена від коду» з методології Twelve-Factor App; секрети беруть лише із середовища чи спеціального сховища, ніколи з репозиторію.",
      "<code>java.util.Properties</code> — стара, проста й досі жива структура: мапа рядків у рядки з методами <code>load</code> (читає формат <code>ключ=значення</code>, рядки з <code>#</code> є коментарями), <code>getProperty(key)</code> і <code>getProperty(key, default)</code>. Читати можна з файлу, з ресурсу збірки чи, як у наших прикладах, зі <code>StringReader</code>, щоб приклад не залежав від диска.",
      "Змінні середовища (<code>System.getenv()</code>) — стандартний спосіб налаштовувати контейнери й хмарні сервіси: <code>APP_HTTP_PORT=9090 java -jar app.jar</code>. Типовий порядок пріоритетів: значення за замовчуванням у коді, потім файл, потім змінна середовища, потім аргумент командного рядка. Чим «ближче до запуску», тим вищий пріоритет. Імена змінних зазвичай пишуть великими літерами з підкресленнями.",
      "Налаштування завантажують один раз на старті й збирають в незмінний об'єкт (<code>record AppConfig</code>) із типізованими полями. Решта коду отримує готовий <code>AppConfig</code> через конструктор, а не читає <code>System.getenv</code> сама: так залежність видима, а перевірка підставляє будь-які значення. Саме функція завантаження приймає мапу середовища параметром: у програмі це <code>System.getenv()</code>, у перевірці звичайна <code>Map</code>.",
      "Fail fast: некоректна конфігурація має зупинити програму одразу на старті зі зрозумілим повідомленням, а не через годину під навантаженням. Перевіряйте обов'язкові ключі, розбирайте числа з обробкою <code>NumberFormatException</code>, обмежуйте діапазони (порт від 1 до 65535, тайм-аут більший за нуль). Повідомлення має називати ключ і хибне значення, але не містити секретів.",
      "Секрети. Ніколи не друкуйте пароль чи токен у журнал і не віддавайте їх у <code>toString</code> запису конфігурації: перевизначте його або маскуйте значення. Не комітьте файли з секретами: у репозиторії лежить лише приклад (<code>app.example.properties</code>), а справжній файл потрапляє в <code>.gitignore</code>. На робочих серверах секрети передають змінними середовища чи спеціалізованими сховищами.",
      "Існують і потужніші рішення: YAML-файли, профілі Spring, бібліотеки на кшталт Typesafe Config. Ідея в них та сама: шари значень, порядок пріоритетів, перетворення типів і перевірка. Розібравшись із <code>Properties</code> і змінними середовища, ви розумієте, що відбувається під капотом цих інструментів.",
    ],
    code: [
      String.raw`import java.io.IOException;
import java.io.StringReader;
import java.util.Properties;

public class Main {
    public static void main(String[] args) throws IOException {
        String text = """
            # server settings
            http.port=8080
            http.host=localhost
            feature.cache=true
            """;
        Properties props = new Properties();
        props.load(new StringReader(text));
        System.out.println(props.getProperty("http.port"));
        System.out.println(props.getProperty("http.timeout", "30"));   // значення за замовчуванням
        System.out.println(props.getProperty("missing"));              // null
    }
}`,
      String.raw`import java.io.IOException;
import java.io.StringReader;
import java.util.Map;
import java.util.Properties;

public class Main {
    record AppConfig(String host, int port, boolean cache) {
        static AppConfig load(Properties file, Map<String, String> env) {
            String host = file.getProperty("http.host", "localhost");
            String portText = env.getOrDefault("APP_HTTP_PORT", file.getProperty("http.port", "8080"));
            int port;
            try {
                port = Integer.parseInt(portText.trim());
            } catch (NumberFormatException e) {
                throw new IllegalStateException("http.port is not a number: " + portText);
            }
            if (port < 1 || port > 65535) {
                throw new IllegalStateException("http.port out of range: " + port);
            }
            boolean cache = Boolean.parseBoolean(file.getProperty("feature.cache", "false"));
            return new AppConfig(host, port, cache);
        }
    }

    public static void main(String[] args) throws IOException {
        Properties file = new Properties();
        file.load(new StringReader("http.port=8080\nfeature.cache=true\n"));
        System.out.println(AppConfig.load(file, Map.of()));
        System.out.println(AppConfig.load(file, Map.of("APP_HTTP_PORT", "9090")));
    }
}`,
      String.raw`// аварія: порт заданий не числом, і програма зупиняється на старті зі зрозумілим повідомленням
import java.util.Map;

public class Main {
    static int readPort(Map<String, String> env) {
        String text = env.getOrDefault("APP_HTTP_PORT", "8080");
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            throw new IllegalStateException("APP_HTTP_PORT is not a number: " + text);
        }
    }

    public static void main(String[] args) {
        System.out.println(readPort(Map.of()));
        System.out.println(readPort(Map.of("APP_HTTP_PORT", "eighty")));
    }
}`,
      String.raw`// лише компіляція: у програмі середовище читають із System.getenv(), а результат залежить від машини запуску
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, String> env = System.getenv();
        String port = env.getOrDefault("APP_HTTP_PORT", "8080");
        System.out.println("port = " + port);
    }
}`,
      String.raw`public class Main {
    record DbConfig(String url, String user, String password) {
        @Override
        public String toString() {
            return "DbConfig[url=" + url + ", user=" + user + ", password=***]";
        }
    }

    public static void main(String[] args) {
        DbConfig config = new DbConfig("jdbc:h2:mem:test", "app", "s3cret");
        System.out.println(config);
        System.out.println(config.password().length());
    }
}`,
    ],
    note: "Конфігурацію завантажують один раз у незмінний запис із типами й перевірками: помилка на старті краща за збій через годину. Секрети беріть із середовища, не друкуйте в журнал і не комітьте в репозиторій.",
    work: "Дванадцятифакторний підхід є стандартом для контейнерів: один образ, різні значення змінних для розробки, тестування й робочого середовища. Помилки конфігурації (не той порт, відсутній пароль) часто стають причиною збоїв після розгортання, тому їх ловлять fail-fast ще на старті.",
    tasks: [
      "У якому порядку зазвичай накладають значення: за замовчуванням, файл, змінна середовища?",
      "Чому функція завантаження конфігурації приймає мапу середовища параметром, а не викликає System.getenv усередині?",
    ],
  },
  {
    t: "JDBC: як це працює",
    ch: "Архітектура",
    adv: true,
    easy: "JDBC — це розетка стандартної форми: програма вставляє вилку з одним набором методів, а за розеткою може бути будь-яка база даних, якщо до неї є драйвер-перехідник.",
    p: [
      "JDBC (Java Database Connectivity) — стандартний API у пакеті <code>java.sql</code> для роботи з реляційними базами. Програма говорить з інтерфейсами <code>Connection</code>, <code>PreparedStatement</code> і <code>ResultSet</code>, а реалізацію постачає драйвер конкретної бази (PostgreSQL, MySQL, H2, SQLite) окремою бібліотекою. Тому код майже не залежить від СУБД: змінюються лише рядок підключення й драйвер.",
      "Підключення задає URL на кшталт <code>jdbc:postgresql://host:5432/app</code>, ім'я користувача й пароль. Метод <code>DriverManager.getConnection</code> знаходить драйвер за префіксом URL і повертає <code>Connection</code>. Якщо драйвера немає, буде <code>SQLException</code> із повідомленням «No suitable driver». Підключення дороге, тому в реальних застосунках їх беруть із пулу (<code>DataSource</code>, наприклад HikariCP), а не відкривають щоразу.",
      "Запит виконує <code>PreparedStatement</code>: SQL із заповнювачами <code>?</code>, значення підставляють методами <code>setString</code>, <code>setLong</code>, <code>setInt</code> (нумерація з 1). Для вибірки є <code>executeQuery()</code>, що дає <code>ResultSet</code>, для зміни <code>executeUpdate()</code>, що повертає кількість змінених рядків. Курсор <code>ResultSet</code> стоїть перед першим рядком, тому читання починається з <code>next()</code>, а значення беруть за назвою чи номером колонки.",
      "Заповнювачі <code>?</code> — головний захист від SQL-ін'єкції. Якщо склеювати текст запиту зі значенням, введення <code>x' OR '1'='1</code> змінить сенс запиту й віддасть усі рядки. Заповнювач передає значення окремо від тексту SQL, тому база трактує його лише як дані. Назви таблиць і колонок параметрами бути не можуть: їх перевіряють за списком дозволених значень.",
      "Ресурси JDBC треба закривати: <code>Connection</code>, <code>PreparedStatement</code> і <code>ResultSet</code> реалізують <code>AutoCloseable</code>, тож їх відкривають у <code>try-with-resources</code>. Витік підключень швидко вичерпує пул, і застосунок «зависає». Усі помилки JDBC — це перевірюваний <code>SQLException</code>: ловіть його на межі репозиторію й перетворюйте на власний виняток, щоб верхні шари не залежали від JDBC. Для великих вибірок корисно задавати <code>setFetchSize</code> і читати рядки по одному, а не завантажувати все в пам'ять.",
      "Транзакції. За замовчуванням кожен запит фіксується окремо (<code>autoCommit</code> увімкнено). Для кількох пов'язаних змін автофіксацію вимикають (<code>setAutoCommit(false)</code>), після успіху викликають <code>commit()</code>, а в разі помилки <code>rollback()</code>. Так «списати з одного рахунку й зарахувати на інший» виконується повністю або зовсім ні.",
      "У нашому курсі це матеріал для читання: у пісочниці немає драйвера й бази, тому приклади з підключенням позначені як фрагменти. Інтерфейс репозиторію з попередніх уроків при цьому зберігається: замінивши реалізацію в пам'яті на JDBC-реалізацію, ви не змінюєте ні сервіс, ні контролер. Над JDBC на практиці зазвичай стоять JdbcTemplate, JPA чи jOOQ, але в основі все одно він.",
    ],
    code: [
      String.raw`// фрагмент: потрібен драйвер бази, а в пісочниці його немає
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

class JdbcNoteRepository {
    private final DataSource dataSource;

    JdbcNoteRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    List<String> findTitles(String tag) {
        String sql = "SELECT title FROM notes WHERE tag = ? ORDER BY id";
        try (Connection c = dataSource.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, tag);
            try (ResultSet rs = ps.executeQuery()) {
                List<String> titles = new ArrayList<>();
                while (rs.next()) {
                    titles.add(rs.getString("title"));
                }
                return titles;
            }
        } catch (SQLException e) {
            throw new IllegalStateException("query failed", e);
        }
    }
}`,
      String.raw`// фрагмент: переказ суми між рахунками в одній транзакції (потрібна база)
try (Connection c = dataSource.getConnection()) {
    c.setAutoCommit(false);
    try (PreparedStatement debit = c.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ?");
         PreparedStatement credit = c.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
        debit.setLong(1, amount);
        debit.setLong(2, fromId);
        debit.executeUpdate();
        credit.setLong(1, amount);
        credit.setLong(2, toId);
        credit.executeUpdate();
        c.commit();
    } catch (SQLException e) {
        c.rollback();
        throw e;
    }
}`,
      String.raw`import java.sql.DriverManager;
import java.sql.SQLException;

public class Main {
    public static void main(String[] args) {
        try {
            DriverManager.getConnection("jdbc:nodb://localhost/app", "user", "pass");
        } catch (SQLException e) {
            System.out.println("no driver, state " + e.getSQLState());
        }
    }
}`,
      String.raw`public class Main {
    // так робити не можна: значення стає частиною тексту SQL
    static String unsafe(String title) {
        return "SELECT * FROM notes WHERE title = '" + title + "'";
    }

    // так правильно: SQL лишається сталим, значення передається окремо
    static final String SAFE = "SELECT * FROM notes WHERE title = ?";

    public static void main(String[] args) {
        System.out.println(unsafe("milk"));
        System.out.println(unsafe("x' OR '1'='1"));
        System.out.println(SAFE);
    }
}`,
      String.raw`// не компілюється: SQLException перевірюваний, його треба перехопити або оголосити в throws
import java.sql.DriverManager;

public class Main {
    public static void main(String[] args) {
        DriverManager.getConnection("jdbc:nodb://localhost/app");
    }
}`,
    ],
    note: "JDBC працює через інтерфейси java.sql, а драйвер бази лежить окремою бібліотекою. Значення завжди передавайте заповнювачами ?, а не склеюванням рядків, і закривайте Connection, PreparedStatement та ResultSet у try-with-resources.",
    work: "Навіть коли ви працюєте з JPA чи Spring Data, помилки з підключеннями, транзакціями й повільними запитами розслідують на рівні JDBC. SQL-ін'єкції досі лишаються серед найпоширеніших уразливостей, а параметризовані запити закривають їх повністю.",
    tasks: [
      "Чому PreparedStatement із заповнювачами захищає від SQL-ін'єкції, а склеювання рядків ні?",
      "Що станеться з пулом підключень, якщо Connection не закривати?",
    ],
  },
  {
    t: "Логування і спостережуваність",
    ch: "Архітектура",
    adv: true,
    easy: "Журнал — це чорна скринька літака: у звичайному польоті про неї не згадують, а коли щось пішло не так, лише вона розповідає, що відбувалося. Метрики — прилади на панелі, що показують стан просто зараз.",
    p: [
      "Спостережуваність (observability) — це здатність зрозуміти, що відбувається всередині працюючої системи, дивлячись лише на її зовнішні сигнали. Основних сигналів три: журнали (що сталося), метрики (скільки й як швидко) і трасування (шлях запиту через сервіси). У цьому уроці ми зосередимося на журналах і найпростіших метриках, бо без них не розслідувати жодну аварію на сервері.",
      "<code>System.out.println</code> для сервера не годиться: немає рівнів, часу, джерела повідомлення, його не вимкнути й не перенаправити. У JDK є <code>java.util.logging</code> (клас <code>Logger</code>), а в проєктах найчастіше беруть фасад SLF4J із реалізацією Logback чи Log4j2. Ідея в усіх однакова: логер із назвою (зазвичай це ім'я класу), рівень, обробник (куди писати) і форматер (як виглядає рядок).",
      "Рівні від найтяжчого: <code>SEVERE</code> (у інших бібліотеках ERROR) — операція не вдалася й потрібне втручання; <code>WARNING</code> — щось дивне, але система працює; <code>INFO</code> — важливі події життєвого циклу, як-от старт, завершення чи виконана бізнес-операція; <code>FINE</code> (DEBUG) і нижчі — подробиці для розробника, на сервері зазвичай вимкнені. Рівнем керують конфігурацією, тому не коментуйте виклики, а змінюйте поріг.",
      "Що писати. Повідомлення має бути зрозумілим без коду: подія, ідентифікатор об'єкта й причина, наприклад <code>note created id=7 user=anna</code>. Структурований формат «ключ=значення» (або JSON) легко шукати й підраховувати. Виняток передавайте окремим параметром (<code>logger.log(Level.SEVERE, message, e)</code>), щоб у журнал потрапив весь stack trace, а не лише текст. Не записуйте один виняток на кількох шарах: журналюйте там, де його обробляють остаточно.",
      "Чого не писати: паролів, токенів, номерів карток і персональних даних. Журнали читає багато людей, і вони довго зберігаються. Не збирайте дорогі рядки на вимкнених рівнях: <code>logger.fine(supplier)</code> із <code>Supplier</code> обчислює повідомлення лише тоді, коли рівень активний. І не пишіть повідомлення в гарячому циклі на кожній ітерації: журнал теж коштує часу.",
      "Контекст запиту. Щоб у журналі, де перемішані повідомлення від багатьох запитів, знайти потрібні, кожному запиту дають ідентифікатор (<code>requestId</code>) і додають його до кожного рядка. Для передавання без зайвих параметрів використовують <code>ThreadLocal</code> (у бібліотеках для цього є MDC із SLF4J). Важливо очищати значення у <code>finally</code>: потік із пулу живе довго й інакше принесе чужий ідентифікатор у наступний запит.",
      "Метрики: лічильник (кількість запитів і помилок), датчик (поточне число з'єднань), гістограма (розподіл часу відповіді). У JDK для лічильників під навантаженням є <code>LongAdder</code>, а в проєктах зазвичай Micrometer чи клієнт Prometheus. Базовий набір для сервера: запити за статусами, затримка (p50, p95, p99), кількість помилок і насиченість ресурсів (пул потоків, черга). За ними будують сповіщення: аварію краще побачити на графіку, ніж у скаргах користувачів.",
    ],
    code: [
      String.raw`import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class Main {
    // власний обробник: пише в stdout без часу, щоб вивід приклада був стабільним
    static class ConsoleHandler extends Handler {
        @Override
        public void publish(LogRecord r) {
            if (isLoggable(r)) {
                System.out.println(r.getLevel() + " [" + r.getLoggerName() + "] " + r.getMessage());
            }
        }

        @Override
        public void flush() { }

        @Override
        public void close() { }
    }

    public static void main(String[] args) {
        Logger log = Logger.getLogger("notes.service");
        log.setUseParentHandlers(false);   // інакше повідомлення піде ще й у стандартний обробник (stderr)
        log.addHandler(new ConsoleHandler());
        log.setLevel(Level.INFO);

        log.info("note created id=7");
        log.warning("title was trimmed id=7");
        log.fine("details for developers");   // нижче порога INFO: не з'явиться
    }
}`,
      String.raw`import java.util.logging.Level;
import java.util.logging.Logger;

public class Main {
    static int calls = 0;

    static String expensive() {
        calls++;
        return "state dump";
    }

    public static void main(String[] args) {
        Logger log = Logger.getLogger("demo");
        log.setUseParentHandlers(false);
        log.setLevel(Level.INFO);

        log.fine("dump: " + expensive());         // рядок збирається, хоча FINE вимкнено
        log.fine(() -> "dump: " + expensive());   // Supplier не викликається
        System.out.println(calls);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();
    static final List<String> LINES = new ArrayList<>();

    static void log(String message) {
        LINES.add("req=" + REQUEST_ID.get() + " " + message);
    }

    static void handle(String id, String user) {
        REQUEST_ID.set(id);
        try {
            log("start user=" + user);
            log("done");
        } finally {
            REQUEST_ID.remove();   // інакше значення «приживеться» в потоці з пулу
        }
    }

    public static void main(String[] args) {
        handle("a1", "anna");
        handle("b2", "oleh");
        LINES.forEach(System.out::println);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.LongAdder;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        LongAdder requests = new LongAdder();
        LongAdder errors = new LongAdder();
        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 4; t++) {
            Thread thread = new Thread(() -> {
                for (int i = 1; i <= 500; i++) {
                    requests.increment();
                    if (i % 50 == 0) {
                        errors.increment();
                    }
                }
            });
            threads.add(thread);
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        System.out.println("requests=" + requests.sum() + " errors=" + errors.sum());
    }
}`,
      String.raw`// аварія: помилка в самому форматі повідомлення (%d і рядок) кидає виняток і валить обробник запиту
public class Main {
    public static void main(String[] args) {
        String user = "anna";
        System.out.println(String.format("user %s ok", user));
        System.out.println(String.format("user %d ok", user));
    }
}`,
    ],
    note: "Журнал має рівні, час і контекст: пишіть подію, ідентифікатор і причину, передавайте виняток окремим параметром, не логуйте секрети й дорогі рядки на вимкнених рівнях. Метрики-лічильники відповідають на питання «скільки», журнал на питання «що саме сталося».",
    work: "Усі серйозні розслідування аварій починаються з журналів і графіків. Хороший журнал з ідентифікатором запиту дозволяє знайти причину за хвилини, а відсутність метрик означає, що про проблему дізнаються від користувачів, а не зі сповіщення.",
    tasks: [
      "Для чого додавати ідентифікатор запиту до кожного рядка журналу?",
      "Чому виклик logger.fine із Supplier-лямбдою економить ресурси, коли рівень FINE вимкнено?",
    ],
  },
];
