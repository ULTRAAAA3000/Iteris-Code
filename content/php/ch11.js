// Глава 11 курсу PHP «Архітектура» (уроки 100–105)
export const LESSONS_11 = [
  {
    t: "Шари: контролер, сервіс і репозиторій",
    ch: "Архітектура",
    easy: "Ресторан працює шарами: офіціант приймає замовлення, кухар готує за правилами кухні, комірник видає продукти. Офіціант не стоїть біля плити, а кухар не розносить тарілки. Кожен знає лише свою роботу.",
    p: [
      "Поки програма вміщається в один файл на сотню рядків, неважливо, де що лежить. Але щойно з'являються маршрути, правила й збереження даних, код перетворюється на клубок: обробка запиту поруч із перевірками, перевірки поруч зі збереженням. Змінити одне означає зачепити все. Шари дають кожній відповідальності власне місце, тож правка в одному місці не ламає решту.",
      "Модель у голові: три шари й стрілки лише вниз. <b>Контролер</b> приймає запит, перетворює його на виклики сервісу й повертає відповідь. <b>Сервіс</b> містить бізнес-правила: що можна, що ні, що порахувати. Він нічого не знає про HTTP. <b>Репозиторій</b> лише зберігає й читає дані та не знає правил. Контролер залежить від сервісу, сервіс від репозиторію, і ніколи навпаки.",
      "У PHP кожен шар це клас, а залежності приходять через конструктор: <code>public function __construct(private BookRepository $books) {}</code>. Клас не створює потрібні йому об'єкти сам через <code>new</code> і не тягне дані з глобальних змінних. Суперглобали на кшталт <code>$_POST</code> читає лише край програми, а далі вглиб іде звичайний масив або типізовані аргументи.",
      "Помилки теж мають шар. Сервіс сигналізує про порушення правил виключенням, наприклад <code>InvalidArgumentException</code>. Контролер ловить його й перекладає мовою відповіді: код 422 і текст. Так сервіс лишається придатним і для консольної команди, і для вебу, адже не знає, як саме покажуть помилку. Репозиторій про такі речі не думає зовсім.",
      "Пастки. Перша: «товстий контролер», у якому живуть і перевірки, і розрахунки. Друга: сервіс, що сам викликає <code>echo</code>, після чого його не повторно використати. Третя: репозиторій, який перевіряє права доступу, бо правила розповзаються по шарах. Четверта: <code>new</code> усередині методів, через що підмінити залежність на тестову неможливо. Без <code>declare(strict_types=1)</code> ще й рядок <code>\"42\"</code> тихо перетвориться на число там, де мало бути явно.",
      "Ідіоми. Один публічний метод шару відповідає одному сценарію й має промовисту назву: <code>addBook</code>, а не <code>process</code>. Оголошуйте класи <code>final</code>, якщо не плануєте спадкування, і завжди вказуйте типи параметрів та результату. Не вигадуйте шар заради шару: у крихітній програмі достатньо двох. Але в проєкті, який росте, межі краще провести заздалегідь, бо потім їх проводять болісно.",
      "У прикладах сервіс залежить від конкретного класу репозиторію: <code>BookRepository</code>. Поки сховище лише масив у пам'яті, це нормально. Але якщо завтра дані підуть у базу, доведеться переписувати сервіс. Щоб міняти сховище без змін у правилах, потрібен договір між шарами. У наступному уроці його дає інтерфейс, а разом з ним з'являється репозиторій у пам'яті для тестів.",
    ],
    code: [
      String.raw`<?php
// Усе в одному місці: правила, збереження й відповідь перемішані
function handle(array $request): string
{
    static $books = [];
    if ($request['action'] === 'add') {
        $title = trim($request['title']);
        if ($title === '') {
            return 'Назва порожня';
        }
        $books[] = $title;
        return 'Додано: ' . $title;
    }
    return implode(', ', $books);
}

echo handle(['action' => 'add', 'title' => ' PHP ']), "\n";
echo handle(['action' => 'add', 'title' => '']), "\n";
echo handle(['action' => 'list']), "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class BookRepository
{
    private array $rows = [];
    private int $nextId = 1;

    public function add(string $title): array
    {
        $row = ['id' => $this->nextId++, 'title' => $title];
        $this->rows[$row['id']] = $row;
        return $row;
    }

    public function all(): array
    {
        return array_values($this->rows);
    }
}

final class BookService
{
    public function __construct(private BookRepository $books) {}

    public function add(string $title): array
    {
        $title = trim($title);
        if ($title === '') {
            throw new InvalidArgumentException('Назва порожня');
        }
        return $this->books->add($title);
    }

    public function list(): array
    {
        return $this->books->all();
    }
}

$service = new BookService(new BookRepository());
$service->add(' PHP ');
$service->add('Composer');
echo json_encode($service->list(), JSON_UNESCAPED_UNICODE), "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class BookRepository
{
    private array $rows = [];

    public function add(string $title): array
    {
        $row = ['id' => count($this->rows) + 1, 'title' => $title];
        $this->rows[] = $row;
        return $row;
    }

    public function all(): array
    {
        return $this->rows;
    }
}

final class BookService
{
    public function __construct(private BookRepository $books) {}

    public function add(string $title): array
    {
        $title = trim($title);
        if ($title === '') {
            throw new InvalidArgumentException('Назва порожня');
        }
        return $this->books->add($title);
    }

    public function list(): array
    {
        return $this->books->all();
    }
}

final class BookController
{
    public function __construct(private BookService $service) {}

    public function handle(array $request): array
    {
        try {
            return match ($request['action'] ?? '') {
                'add' => ['status' => 201, 'body' => $this->service->add((string) ($request['title'] ?? ''))],
                'list' => ['status' => 200, 'body' => $this->service->list()],
                default => ['status' => 404, 'body' => 'Невідома дія'],
            };
        } catch (InvalidArgumentException $e) {
            return ['status' => 422, 'body' => $e->getMessage()];
        }
    }
}

$controller = new BookController(new BookService(new BookRepository()));
$requests = [
    ['action' => 'add', 'title' => 'PHP'],
    ['action' => 'add', 'title' => '  '],
    ['action' => 'list'],
    ['action' => 'drop'],
];
foreach ($requests as $request) {
    $response = $controller->handle($request);
    echo $response['status'], ' ', json_encode($response['body'], JSON_UNESCAPED_UNICODE), "\n";
}`,
      String.raw`<?php
// аварія: у суворому режимі число замість рядка в сервісі дає TypeError
declare(strict_types=1);

final class BookService
{
    public function add(string $title): string
    {
        return 'Додано: ' . trim($title);
    }
}

$service = new BookService();
echo $service->add('PHP'), "\n";
echo $service->add(42), "\n";`,
    ],
    note: "Контролер приймає запит і формує відповідь, сервіс тримає бізнес-правила, репозиторій лише зберігає. Залежності йдуть вниз і приходять через конструктор, а про порушення правил сервіс повідомляє виключенням, яке перекладає контролер.",
    work: "Так влаштовані контролери Laravel і Symfony: маршрут викликає контролер, той звертається до сервісу замовлень чи оплат, а сервіс до репозиторію або моделі. Завдяки шарам правила тестують без вебсервера й бази.",
    tasks: [
      "Яку роль у шарах виконує сервіс і чого він не повинен знати?",
      "Чому залежності краще отримувати через конструктор, а не створювати через new всередині методів?",
    ],
  },
  {
    t: "Репозиторій у пам'яті й інтерфейси",
    ch: "Архітектура",
    easy: "Розетка не питає, що за прилад до неї вставлять: їй досить, щоб вилка підходила. Інтерфейс у коді це така розетка: сервіс вимагає лише форму вилки, а чи стоїть за нею пам'ять, чи база, не його справа.",
    p: [
      "Сервіс із минулого уроку залежав від конкретного класу репозиторію. Через це підмінити сховище, наприклад пам'ять на базу або справжній репозиторій на тестовий, не можна без правок сервісу. Рішення таке: сервіс залежить не від класу, а від договору. У PHP договір описує <b>інтерфейс</b>: перелік методів із типами, без реалізації.",
      "Модель у голові: інтерфейс це список обіцянок. Клас, що <code>implements</code> інтерфейс, мусить виконати всі обіцянки, інакше PHP не дасть завантажити файл. Сервіс у конструкторі просить тип інтерфейсу й отримує будь-який об'єкт, що його реалізує. Так працює поліморфізм: код той самий, поведінка залежить від того, який об'єкт передали.",
      "<b>Репозиторій у пам'яті</b> зберігає записи в масиві властивості. Він чудовий для тестів і прототипів: швидкий, без зовнішніх ресурсів, а стан зникає разом з об'єктом. Методи типові: <code>find(int $id): ?Book</code>, <code>save(Book $b): void</code>, <code>all(): array</code>. Повернення <code>null</code> для відсутнього запису, а не помилка, залишає рішення за сервісом.",
      "Пастка з об'єктами. Масиви в PHP копіюються за значенням, а об'єкти передаються за дескриптором: дві змінні вказують на той самий об'єкт. Якщо репозиторій віддає той самий об'єкт, який лежить у його масиві, то зміна поза репозиторієм непомітно змінить збережений запис. Захищайтеся незмінними об'єктами з <code>readonly</code>-властивостями або повертайте копії, а зміни проводьте через метод <code>save</code>.",
      "Друга пастка: інтерфейс не перевіряє зміст, лише сигнатури. Дві реалізації можуть поводитися по-різному, наприклад одна повертає <code>null</code>, а інша кидає виключення, і сервіс зламається саме на підміні. Домовляйтеся про поведінку в документації до інтерфейсу й перевіряйте її однаковими тестами для обох реалізацій. Також не додавайте в інтерфейс методів «про всяк випадок»: чим він ширший, тим важче його реалізувати.",
      "Ідіоми. Називайте інтерфейс за роллю: <code>BookRepository</code>, а реалізацію за способом: <code>InMemoryBookRepository</code>. Тип параметра пишіть за інтерфейсом, а <code>new</code> з конкретним класом лишайте в одному місці, на краю програми. Надійний спосіб для даних: незмінний об'єкт-значення з <code>readonly</code>, який не можна випадково змінити.",
      "Тепер шари з'єднуються без жорсткої прив'язки, але ми й далі вручну пишемо <code>require</code> для кожного файла класу. У реальному проєкті класів сотні, і підключати їх по одному неможливо. Наступний урок про Composer і стандарт PSR-4: як за іменем класу PHP сам знаходить потрібний файл.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

interface Greeter
{
    public function greet(string $name): string;
}

final class UkrainianGreeter implements Greeter
{
    public function greet(string $name): string
    {
        return "Привіт, $name!";
    }
}

final class EnglishGreeter implements Greeter
{
    public function greet(string $name): string
    {
        return "Hello, $name!";
    }
}

function welcome(Greeter $greeter): void
{
    echo $greeter->greet('Олена'), "\n";
}

welcome(new UkrainianGreeter());
welcome(new EnglishGreeter());`,
      String.raw`<?php
declare(strict_types=1);

final class Book
{
    public function __construct(
        public readonly int $id,
        public readonly string $title,
    ) {}
}

interface BookRepository
{
    public function find(int $id): ?Book;
    public function save(Book $book): void;
    public function all(): array;
}

final class InMemoryBookRepository implements BookRepository
{
    /** @var array<int, Book> */
    private array $books = [];

    public function find(int $id): ?Book
    {
        return $this->books[$id] ?? null;
    }

    public function save(Book $book): void
    {
        $this->books[$book->id] = $book;
    }

    public function all(): array
    {
        return array_values($this->books);
    }
}

$repo = new InMemoryBookRepository();
$repo->save(new Book(1, 'PHP'));
$repo->save(new Book(2, 'Composer'));
echo $repo->find(2)?->title, "\n";
var_dump($repo->find(9));
echo count($repo->all()), "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class Book
{
    public function __construct(public readonly int $id, public readonly string $title) {}
}

interface BookRepository
{
    public function find(int $id): ?Book;
    public function save(Book $book): void;
}

final class InMemoryBookRepository implements BookRepository
{
    private array $books = [];

    public function find(int $id): ?Book { return $this->books[$id] ?? null; }
    public function save(Book $book): void { $this->books[$book->id] = $book; }
}

// Обгортка додає журнал і не змінює правил сервісу
final class LoggingBookRepository implements BookRepository
{
    public array $log = [];

    public function __construct(private BookRepository $inner) {}

    public function find(int $id): ?Book
    {
        $this->log[] = "find($id)";
        return $this->inner->find($id);
    }

    public function save(Book $book): void
    {
        $this->log[] = "save({$book->id})";
        $this->inner->save($book);
    }
}

final class BookService
{
    public function __construct(private BookRepository $books) {}

    public function rename(int $id, string $title): Book
    {
        $old = $this->books->find($id) ?? throw new RuntimeException("Книги $id немає");
        $new = new Book($old->id, $title);
        $this->books->save($new);
        return $new;
    }
}

$repo = new LoggingBookRepository(new InMemoryBookRepository());
$repo->save(new Book(1, 'PHP'));
$service = new BookService($repo);
echo $service->rename(1, 'PHP 8')->title, "\n";
try {
    $service->rename(5, 'X');
} catch (RuntimeException $e) {
    echo $e->getMessage(), "\n";
}
echo implode(' ', $repo->log), "\n";`,
      String.raw`<?php
// аварія: клас обіцяв інтерфейс, але не реалізував усі методи
interface BookRepository
{
    public function find(int $id): ?string;
    public function all(): array;
}

final class BrokenRepository implements BookRepository
{
    public function find(int $id): ?string
    {
        return null;
    }
}

echo "Створюю репозиторій\n";
$repo = new BrokenRepository();`,
    ],
    note: "Інтерфейс описує договір із методів і типів, а сервіс просить саме його, а не конкретний клас. Репозиторій у пам'яті зручний для тестів. Об'єкти передаються за дескриптором, тому незмінні значення з readonly безпечніші.",
    work: "У проєктах на Laravel і Symfony сервіси просять інтерфейс репозиторію, а контейнер підставляє реалізацію: у проді з базою, у тестах у пам'яті. Так перевіряють бізнес-правила за мілісекунди, без підняття бази даних.",
    tasks: [
      "Що вимагає PHP від класу, який реалізує інтерфейс?",
      "Чому репозиторій у пам'яті зручніший за базу в тестах сервісу?",
    ],
  },
  {
    t: "Composer і автозавантаження PSR-4",
    ch: "Архітектура",
    easy: "Бібліотекар за шифром на формулярі знає, на якій полиці лежить книга: розділ, стелаж, місце. Автозавантаження робить те саме з класом: за повним іменем вираховує шлях до файла й дістає його, коли клас вперше знадобився.",
    p: [
      "Поки програма мала один файл, нам вистачало одного <code>require</code>. У проєкті з сотнями класів ручне підключення стає рутиною, у якій легко забути файл або підключити його двічі. Автозавантаження вирішує це: коли PHP зустрічає невідомий клас, він викликає зареєстровану функцію, а та підключає потрібний файл. Звідси в проєкті жодного <code>require</code> на класи.",
      "Модель у голові: правило PSR-4 це відповідність префікса простору імен каталогу. Якщо префікс <code>App\\</code> відповідає каталогу <code>src/</code>, то решта імені стає підкаталогами, а останній сегмент іменем файла. Клас <code>App\\Models\\User</code> лежить у <code>src/Models/User.php</code>: префікс замінили на каталог, кожен <code>\\</code> на <code>/</code> і дописали <code>.php</code>.",
      "<b>Composer</b> це менеджер залежностей PHP. Правила автозавантаження ви описуєте в <code>composer.json</code> у розділі <code>autoload</code> ключем <code>psr-4</code>: <code>\"App\\\\\": \"src/\"</code>. Подвійні слеші потрібні, бо це JSON. Команда <code>composer dump-autoload</code> збирає файл <code>vendor/autoload.php</code>, і одного рядка <code>require __DIR__ . '/vendor/autoload.php';</code> у точці входу досить для всього проєкту.",
      "Усередині все побудовано на <code>spl_autoload_register</code>: вона приймає функцію, яку PHP викличе з повним іменем невідомого класу. Власний автозавантажувач виконує три кроки: знаходить префікс, будує шлях, а якщо файл існує, підключає його. Composer додає оптимізації: карти класів і швидкі перевірки, але принцип той самий. Кілька префіксів у проєкті звично: <code>App\\</code> для коду й <code>Tests\\</code> для тестів.",
      "Пастки. Регістр має значення: на Linux файл <code>user.php</code> не збігається з класом <code>User</code>, і працює лише там, де ФС нечутлива до регістру. Один файл містить один клас, названий так само, як файл. Простір імен у файлі має збігатися з каталогом, інакше клас не знайдеться, і PHP кине <code>Error: Class not found</code>. Після додавання нового префікса в <code>composer.json</code> не забудьте виконати <code>composer dump-autoload</code>.",
      "Ідіоми. Тримайте код у <code>src/</code>, а точку входу в <code>public/index.php</code>. Залежності ставте командою <code>composer require</code>, а <code>vendor/</code> додайте до <code>.gitignore</code>. Для довгих префіксів обирайте найдовший збіг: <code>App\\Http\\</code> має перемагати <code>App\\</code>. Ім'я класу в рядку отримуйте через <code>Foo::class</code>, а не пишіть руками.",
      "Тепер класи самі знаходять дорогу до свого файла, а шари з'єднуються інтерфейсами. Лишається питання: хто збирає об'єкти докупи, коли в сервісі п'ять залежностей, а в кожної ще кілька? Писати суцільні <code>new</code> втомлює. Далі ми розберемо контейнер залежностей, який будує ці ланцюжки автоматично.",
    ],
    code: [
      fragmentJson(),
      String.raw`<?php
// Перетворення імені класу на шлях за правилом PSR-4
function classToPath(string $class, string $prefix, string $dir): string
{
    $relative = substr($class, strlen($prefix));
    return $dir . str_replace('\\', '/', $relative) . '.php';
}

echo classToPath('App\Models\User', 'App\\', 'src/'), "\n";
echo classToPath('App\Services\Mailer', 'App\\', 'src/'), "\n";
echo classToPath('Tests\UserTest', 'Tests\\', 'tests/'), "\n";`,
      String.raw`<?php
// Власний автозавантажувач: кілька префіксів, виграє найдовший
$map = [
    'App\\' => 'src/',
    'App\Http\\' => 'src/Web/',
    'Tests\\' => 'tests/',
];

function resolvePath(string $class, array $map): ?string
{
    $best = null;
    foreach ($map as $prefix => $dir) {
        if (str_starts_with($class, $prefix) && ($best === null || strlen($prefix) > strlen($best))) {
            $best = $prefix;
        }
    }
    if ($best === null) {
        return null;
    }
    return $map[$best] . str_replace('\\', '/', substr($class, strlen($best))) . '.php';
}

spl_autoload_register(function (string $class) use ($map): void {
    $path = resolvePath($class, $map);
    echo "Автозавантаження $class: ", $path ?? 'префікс не знайдено', "\n";
});

var_dump(class_exists('App\Models\User'));
var_dump(class_exists('App\Http\Kernel'));
var_dump(class_exists('Vendor\Lib\Thing'));`,
      String.raw`<?php
// аварія: файла класу немає, автозавантажувач нічого не підключив
spl_autoload_register(function (string $class): void {
    echo "Шукаю файл для $class\n";
});

$user = new App\Models\User();
echo "Сюди ми не дійдемо\n";`,
    ],
    note: "За PSR-4 префікс простору імен відповідає каталогу, а решта імені перетворюється на підкаталоги й назву файла. Composer описує це в composer.json, а spl_autoload_register викликає завантажувач, коли клас невідомий.",
    work: "Кожен сучасний PHP-проєкт починається з composer.json і vendor/autoload.php. Саме PSR-4 дозволяє підключати тисячі класів пакетів без жодного require, а спільні правила роблять код читабельним для будь-якого PHP-розробника.",
    tasks: [
      "Яким правилом PSR-4 ім'я класу App\\Models\\User перетворюється на шлях до файла?",
      "Що робить spl_autoload_register і коли PHP викликає зареєстровану функцію?",
    ],
  },
  {
    t: "DI-контейнер своїми руками",
    ch: "Архітектура",
    adv: true,
    easy: "Контейнер схожий на бригадира, який знає, кому що видати. Каменяр просить цеглу, бригадир сам дістає її зі складу й не видає двічі те, що вже привезли. Робітник не їздить по цеглу, а лише називає, що йому потрібно.",
    p: [
      "У шарах із попередніх уроків кожен клас просить залежності через конструктор, і хтось мусить їх зібрати. У маленькій програмі це робить вручну одне місце на краю: <code>new Controller(new Service(new Repo()))</code>. Коли класів стає двадцять, складання перетворюється на довгий ланцюжок, у якому легко помилитися порядком. Контейнер залежностей бере цю роботу на себе й зберігає знання про складання в одному місці.",
      "Модель у голові: контейнер це реєстр рецептів. Ключ це ідентифікатор (зазвичай ім'я класу), значення це <b>фабрика</b>, тобто функція, що вміє створити об'єкт. Метод <code>get($id)</code> знаходить рецепт, викликає його й повертає результат. Фабриці передають сам контейнер, щоб вона могла попросити в нього вже готові залежності, тож ланцюжок розгортається сам.",
      "Зазвичай об'єкт створюють один раз і віддають той самий при кожному запиті: це <b>спільний екземпляр</b>. У коді це один рядок: <code>$this-&gt;instances[$id] ??= ($this-&gt;factories[$id])($this)</code>. Оператор <code>??=</code> викликає фабрику лише тоді, коли екземпляра ще немає. Об'єкти в PHP передаються за дескриптором, тому всі, хто отримав сервіс, працюють з одним і тим самим об'єктом.",
      "Далі можна обійтися без ручних рецептів: <b>автоскладання</b> через рефлексію. <code>ReflectionClass</code> дає конструктор, а <code>getParameters()</code> типи його параметрів. Для кожного параметра з типом-класом контейнер сам викликає <code>get</code>. Це саме те, що роблять контейнери Laravel і Symfony, лише з великою кількістю додаткових можливостей. Скалярні параметри на кшталт <code>string $dsn</code> так не заповнити: для них потрібен явний рецепт.",
      "Пастки. Перша: <b>цикл залежностей</b>. Якщо <code>A</code> просить <code>B</code>, а <code>B</code> просить <code>A</code>, звичайна рекурсія не завершиться, тому тримайте список класів, що зараз створюються, і кидайте виключення при повторі. Друга: контейнер як <i>локатор сервісів</i>. Коли клас сам викликає <code>$container-&gt;get(...)</code> у середині методу, залежності знову стають прихованими. Контейнер має працювати лише на краю, а класи отримують усе через конструктор.",
      "Ідіоми. Невідомий ідентифікатор це помилка програміста, тож кидайте зрозуміле виключення з назвою сервісу, а не повертайте <code>null</code>. Типізуйте <code>get</code> як <code>object</code> або через шаблони в коментарях. Реєструйте скалярні налаштування окремими фабриками, які читають конфігурацію. Не робіть контейнер глобальним синглтоном: передавайте його лише туди, де збирається програма.",
      "У прикладах конфігурацію ми поки що вписували у фабрики прямо. Реальні налаштування, такі як хост бази чи рівень журналу, живуть в окремій структурі, а сервіси мають звітувати про події. У наступному уроці ми зберемо конфігурацію з вкладених масивів і додамо логер у дусі PSR-3, який контейнер зможе роздавати всім шарам.",
    ],
    code: [
      String.raw`<?php
// Складання вручну: порядок важливий, а місце одне
final class Logger
{
    public function log(string $message): void
    {
        echo "[log] $message\n";
    }
}

final class Mailer
{
    public function __construct(private Logger $logger) {}

    public function send(string $to): void
    {
        $this->logger->log("лист для $to");
    }
}

$mailer = new Mailer(new Logger());
$mailer->send('ann@example.com');`,
      String.raw`<?php
final class Container
{
    private array $factories = [];
    private array $instances = [];

    public function set(string $id, callable $factory): void
    {
        $this->factories[$id] = $factory;
    }

    public function get(string $id): object
    {
        if (!isset($this->factories[$id])) {
            throw new RuntimeException("Невідомий сервіс: $id");
        }
        return $this->instances[$id] ??= ($this->factories[$id])($this);
    }
}

final class Logger {}
final class Mailer
{
    public function __construct(public readonly Logger $logger) {}
}

$c = new Container();
$c->set(Logger::class, fn(Container $c) => new Logger());
$c->set(Mailer::class, fn(Container $c) => new Mailer($c->get(Logger::class)));

var_dump($c->get(Logger::class) === $c->get(Logger::class));
var_dump($c->get(Mailer::class)->logger === $c->get(Logger::class));`,
      String.raw`<?php
final class AutoContainer
{
    private array $instances = [];
    private array $resolving = [];

    public function get(string $class): object
    {
        if (isset($this->instances[$class])) {
            return $this->instances[$class];
        }
        if (isset($this->resolving[$class])) {
            throw new LogicException("Цикл залежностей на $class");
        }
        $this->resolving[$class] = true;

        $ctor = (new ReflectionClass($class))->getConstructor();
        $args = [];
        foreach ($ctor?->getParameters() ?? [] as $param) {
            $type = $param->getType();
            if (!$type instanceof ReflectionNamedType || $type->isBuiltin()) {
                throw new LogicException("Потрібен явний рецепт для \${$param->getName()}");
            }
            $args[] = $this->get($type->getName());
        }

        unset($this->resolving[$class]);
        return $this->instances[$class] = new $class(...$args);
    }
}

final class Repo {}
final class Service { public function __construct(public Repo $repo) {} }
final class Controller { public function __construct(public Service $service) {} }

class A { public function __construct(public B $b) {} }
class B { public function __construct(public A $a) {} }

$c = new AutoContainer();
$ctl = $c->get(Controller::class);
echo get_class($ctl->service->repo), "\n";

try {
    $c->get(A::class);
} catch (LogicException $e) {
    echo $e->getMessage(), "\n";
}`,
      String.raw`<?php
// аварія: запит невідомого сервісу, виключення ніхто не ловить
final class Container
{
    private array $factories = [];

    public function get(string $id): object
    {
        if (!isset($this->factories[$id])) {
            throw new RuntimeException("Невідомий сервіс: $id");
        }
        return ($this->factories[$id])($this);
    }
}

$c = new Container();
echo "Запитуємо сервіс\n";
$c->get('mailer');
echo "Сюди не дійдемо\n";`,
    ],
    note: "Контейнер зберігає фабрики за ідентифікатором і віддає спільні екземпляри. Автоскладання через ReflectionClass читає типи конструктора, а список створюваних класів ловить цикли. Викликати get усередині бізнес-класів не слід: контейнер працює на краю.",
    work: "Контейнер служби у Laravel і Symfony саме так збирає контролери, сервіси й репозиторії за типами конструктора. Власний мінімальний контейнер часто пишуть у невеликих бібліотеках і консольних утилітах, де важкий фреймворк був би зайвим.",
    tasks: [
      "Навіщо контейнер зберігає створені екземпляри й що дає оператор ??= у методі get?",
      "Чому цикл залежностей між двома класами треба виявляти явно?",
    ],
  },
  {
    t: "Конфігурація масивами й логер у дусі PSR-3",
    ch: "Архітектура",
    adv: true,
    easy: "Конфігурація це табличка з налаштуваннями на пульті: яскравість, гучність, мова. Логер це бортовий журнал: кожна подія отримує рівень важливості, а на пульті ви обираєте, що з журналу взагалі варто читати.",
    p: [
      "Хост бази, рівень журналу, режим налагодження не повинні бути вписані в код. Їх виносять у конфігурацію, яку легко змінити без правки класів і яка відрізняється між розробкою й продакшеном. Найпростіший спосіб у PHP це вкладений асоціативний масив. Він типізований самою мовою, швидко читається й не потребує жодних бібліотек.",
      "Модель у голові: конфігурація це дерево. Доступ за «точковим» ключем <code>'db.port'</code> розбиває ключ через <code>explode('.', $key)</code> і спускається по рівнях. Якщо на якомусь кроці ключа немає, повертається значення за замовчуванням. Перевіряти наявність треба через <code>array_key_exists</code>, адже значення може бути законним <code>null</code> чи <code>false</code>.",
      "Тут чекає перша пастка. Запис <code>$cfg['debug'] ?: true</code> для <code>false</code> дасть <code>true</code>, бо скорочений Elvis-оператор розрізняє лише «порожнє» й «непорожнє». Оператор <code>??</code> реагує тільки на відсутність або <code>null</code>, тож для значень за замовчуванням потрібен саме він. Друга: налаштування з оточення приходять рядками. Рядок <code>\"false\"</code> у булевому контексті істинний, тому для логічних значень користуйтеся <code>filter_var($v, FILTER_VALIDATE_BOOLEAN)</code>.",
      "Логер це клас із методом <code>log($level, $message, $context)</code>. Стандарт <b>PSR-3</b> описує інтерфейс <code>Psr\\Log\\LoggerInterface</code> з вісьмома рівнями від <code>debug</code> до <code>emergency</code> і зручними методами на кшталт <code>error()</code>. У прикладах ми пишемо власний мінімальний інтерфейс за тим самим зразком, бо пакета в пісочниці немає. Головна ідея PSR-3: сервіс залежить від інтерфейсу, а куди йдуть записи, вирішує реалізація.",
      "Контекст це масив даних поруч із повідомленням. Повідомлення містить заповнювачі <code>{user}</code>, а логер підставляє значення через <code>strtr</code>. Так текст лишається сталим і його легко групувати, а змінні частини приходять окремо. Пастка: значення-масив чи об'єкт без <code>__toString</code> не перетвориться на рядок, а <code>(string) $array</code> дає попередження «Array to string conversion». Тому перевіряйте <code>is_scalar</code> або кодуйте через <code>json_encode</code>.",
      "Ідіоми. Рівні мають порядок, тому в конфігурації задають мінімальний рівень, а логер відкидає записи нижчої важливості. Реалізацій може бути кілька: у пам'ять для тестів, у файл, у стандартний потік. Інтерфейс логера передають у конструктор сервісів, як будь-яку залежність, а не викликають глобальні функції. Не логуйте паролі й токени: контекст часто потрапляє у спільні системи збирання логів.",
      "Тепер у нас є повний набір для невеликого застосунку: шари, інтерфейси, автозавантаження, контейнер, конфігурація й журнал. Лишається найбільший зовнішній залежний шар: збереження в реальній базі даних. Наступний урок показує PDO: як підключатися, надсилати запити без ризику ін'єкцій і працювати з транзакціями.",
    ],
    code: [
      String.raw`<?php
function config(array $cfg, string $key, mixed $default = null): mixed
{
    $value = $cfg;
    foreach (explode('.', $key) as $part) {
        if (!is_array($value) || !array_key_exists($part, $value)) {
            return $default;
        }
        $value = $value[$part];
    }
    return $value;
}

$cfg = [
    'app' => ['name' => 'Iteris', 'debug' => false],
    'db' => ['host' => 'localhost', 'port' => 3306],
];

echo config($cfg, 'app.name'), "\n";
echo config($cfg, 'db.port'), "\n";
echo config($cfg, 'db.user', 'root'), "\n";
echo var_export(config($cfg, 'app.debug', true), true), "\n";`,
      String.raw`<?php
// Поведінка, що дивує: false, порожній рядок і рядок "false"
$cfg = ['debug' => false];

echo var_export($cfg['debug'] ?: true, true), "\n";   // Elvis ламає false
echo var_export($cfg['debug'] ?? true, true), "\n";   // ?? лишає false

$env = ['APP_DEBUG' => 'false'];
echo var_export((bool) $env['APP_DEBUG'], true), "\n";
echo var_export(filter_var($env['APP_DEBUG'], FILTER_VALIDATE_BOOLEAN), true), "\n";`,
      String.raw`<?php
declare(strict_types=1);

interface LoggerInterface
{
    public function log(string $level, string $message, array $context = []): void;
}

final class MemoryLogger implements LoggerInterface
{
    private const LEVELS = ['debug' => 0, 'info' => 1, 'warning' => 2, 'error' => 3];

    public array $lines = [];

    public function __construct(private string $minLevel = 'debug') {}

    public function log(string $level, string $message, array $context = []): void
    {
        if (self::LEVELS[$level] < self::LEVELS[$this->minLevel]) {
            return;
        }
        $replace = [];
        foreach ($context as $key => $value) {
            $replace['{' . $key . '}'] = is_scalar($value) ? (string) $value : json_encode($value);
        }
        $this->lines[] = strtoupper($level) . ': ' . strtr($message, $replace);
    }
}

$logger = new MemoryLogger('info');
$logger->log('debug', 'Деталі {id}', ['id' => 1]);
$logger->log('info', 'Вхід користувача {user}', ['user' => 'ann']);
$logger->log('error', 'Збій {data}', ['data' => ['code' => 500]]);

echo implode("\n", $logger->lines), "\n";`,
      String.raw`<?php
declare(strict_types=1);

interface LoggerInterface
{
    public function info(string $message): void;
}

final class EchoLogger implements LoggerInterface
{
    public function __construct(private string $prefix) {}

    public function info(string $message): void
    {
        echo $this->prefix, $message, "\n";
    }
}

final class Registration
{
    public function __construct(private LoggerInterface $logger) {}

    public function register(string $email): void
    {
        $this->logger->info("Зареєстровано $email");
    }
}

$config = ['log' => ['prefix' => '[app] ']];
$prefix = $config['log']['prefix'] ?? '';
(new Registration(new EchoLogger($prefix)))->register('ann@example.com');`,
      String.raw`<?php
// аварія: порт з оточення прийшов рядком, а суворі типи не приводять його до int
declare(strict_types=1);

function connect(string $host, int $port): string
{
    return "$host:$port";
}

$env = ['DB_HOST' => 'localhost', 'DB_PORT' => '3306'];
echo connect($env['DB_HOST'], (int) $env['DB_PORT']), "\n";
echo connect($env['DB_HOST'], $env['DB_PORT']), "\n";`,
    ],
    note: "Вкладений масив з точковим доступом і оператором ?? дає просту конфігурацію. Логер у дусі PSR-3 має рівні, заповнювачі в повідомленні й контекст. Сервіси залежать від інтерфейсу логера, а мінімальний рівень задає налаштування.",
    work: "Файли конфігурації у Laravel (config/app.php) повертають саме вкладені масиви, а Monolog, що реалізує PSR-3, є стандартом для журналів у PHP. Рівні й контекст дають змогу фільтрувати помилки продакшену й групувати їх у системах моніторингу.",
    tasks: [
      "Чим оператор ?? відрізняється від ?: у значеннях за замовчуванням для конфігурації?",
      "Що дає логеру масив контексту й заповнювачі у повідомленні?",
    ],
  },
  {
    t: "База даних: PDO",
    ch: "Архітектура",
    adv: true,
    easy: "База даних це склад, а PDO єдиний віконце видачі з однаковими правилами для будь-якого складу. Ви подаєте бланк із порожніми клітинками, а значення передаєте окремо, і працівник не сприйме їх за частину наказу.",
    p: [
      "Рано чи пізно дані мають пережити перезапуск програми, а масив у пам'яті не переживе. Для цього репозиторій підключають до реляційної бази. У PHP для такої роботи існує розширення <b>PDO</b> (PHP Data Objects): єдиний інтерфейс до MySQL, PostgreSQL, SQLite та інших. Змінивши лише рядок підключення, ви часто зберігаєте решту коду.",
      "У пісочниці курсу бази немає, тому всі приклади цього уроку це фрагменти без запуску, а завдання немає. Модель у голові: <code>PDO</code> це з'єднання, <code>PDOStatement</code> це підготовлений запит. Спершу <code>prepare</code> надсилає базі шаблон SQL із заповнювачами, потім <code>execute</code> передає значення окремо. База ніколи не змішує дані з командою.",
      "Підключення описує рядок <code>DSN</code>: <code>mysql:host=localhost;dbname=app;charset=utf8mb4</code>. Третім аргументом конструктора передають параметри. Три з них варто ставити завжди: <code>ATTR_ERRMODE =&gt; ERRMODE_EXCEPTION</code>, щоб помилки SQL ставали виключеннями <code>PDOException</code>, <code>ATTR_DEFAULT_FETCH_MODE =&gt; FETCH_ASSOC</code> для масивів з іменами колонок і <code>ATTR_EMULATE_PREPARES =&gt; false</code> для справжніх підготовлених запитів.",
      "Головна пастка це <b>SQL-ін'єкція</b>. Якщо скласти запит з рядка користувача конкатенацією, то значення <code>' OR '1'='1</code> змінює сенс команди. Заповнювачі <code>:email</code> чи <code>?</code> повністю це виключають, бо значення передаються як дані. Імена таблиць і колонок заповнювачами не підставляються, їх перевіряють за білим списком. Друга пастка: за замовчуванням помилки у PDO тихі, тож без режиму виключень збій SQL можна пропустити.",
      "Кілька змін, що мусять відбутися разом, виконують у <b>транзакції</b>: <code>beginTransaction()</code>, потім <code>commit()</code>, а при помилці <code>rollBack()</code>. Переказ грошей зі списанням і зарахуванням має або пройти повністю, або не відбутися зовсім. Типова ідіома: блок <code>try</code> із <code>commit</code> у кінці й <code>rollBack</code> у <code>catch</code>, після якого виключення кидають далі.",
      "Ідіоми. Виконання запиту повертає рядки через <code>fetch()</code> по одному, <code>fetchAll()</code> усі разом або <code>fetchColumn()</code> одне значення. Ідентифікатор щойно вставленого рядка дає <code>lastInsertId()</code>. SQL-код ховають у репозиторії за інтерфейсом, тож сервіс не бачить PDO. Не відкривайте нове з'єднання на кожен запит і не логуйте пароль із DSN.",
      "Цим глава про архітектуру завершена: у вас є шари, інтерфейси, автозавантаження, контейнер, конфігурація, логер і доступ до бази. У наступній главі ми зберемо знання докупи в завершених проєктах, і першим буде аналіз тексту, де знадобляться рядкові функції й масиви, а клас-репозиторій із пам'яті замінить базу.",
    ],
    code: [
      String.raw`<?php
// фрагмент: підключення до бази, потрібне розширення pdo_mysql і запущений сервер
$pdo = new PDO(
    'mysql:host=localhost;dbname=app;charset=utf8mb4',
    'app_user',
    'secret',
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);`,
      String.raw`<?php
// фрагмент: підготовлені запити з іменованими заповнювачами
$stmt = $pdo->prepare('INSERT INTO users (email, name) VALUES (:email, :name)');
$stmt->execute(['email' => 'ann@example.com', 'name' => 'Ганна']);
echo $pdo->lastInsertId();

$stmt = $pdo->prepare('SELECT id, name FROM users WHERE email = :email');
$stmt->execute(['email' => 'ann@example.com']);
$user = $stmt->fetch();           // масив ['id' => ..., 'name' => ...] або false
$count = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();`,
      String.raw`<?php
// фрагмент: ін'єкція проти заповнювача
$email = "' OR '1'='1";

// НЕПРАВИЛЬНО: значення стало частиною SQL
$rows = $pdo->query("SELECT * FROM users WHERE email = '$email'")->fetchAll();

// ПРАВИЛЬНО: значення передається окремо від команди
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$rows = $stmt->fetchAll();`,
      String.raw`<?php
// фрагмент: транзакція й репозиторій поверх PDO
final class AccountRepository
{
    public function __construct(private PDO $pdo) {}

    public function transfer(int $from, int $to, int $amount): void
    {
        $this->pdo->beginTransaction();
        try {
            $sql = 'UPDATE accounts SET balance = balance + :delta WHERE id = :id';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['delta' => -$amount, 'id' => $from]);
            $stmt->execute(['delta' => $amount, 'id' => $to]);
            $this->pdo->commit();
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}`,
    ],
    note: "PDO дає єдиний інтерфейс до баз: підключення з режимом виключень, підготовлені запити із заповнювачами проти ін'єкцій і транзакції з commit та rollBack. SQL ховають у репозиторії за інтерфейсом, тож сервіс про PDO не знає.",
    work: "Eloquent у Laravel і Doctrine у Symfony працюють поверх PDO. Знання підготовлених запитів і транзакцій допомагає писати складні звіти сирим SQL і розуміти, що саме ORM надсилає базі й чому запит повільний чи небезпечний.",
    tasks: [
      "Чому підготовлений запит із заповнювачами захищає від SQL-ін'єкції, а конкатенація рядка ні?",
      "Що робить rollBack і коли його викликають у транзакції?",
    ],
  },
];

function fragmentJson() {
  return String.raw`<?php
// фрагмент: файл composer.json і команди термінала, не PHP-програма
// composer.json
// {
//     "require": { "php": "^8.1" },
//     "autoload": {
//         "psr-4": {
//             "App\\": "src/",
//             "Tests\\": "tests/"
//         }
//     }
// }
//
// $ composer dump-autoload
// <?php  // public/index.php
// require __DIR__ . '/../vendor/autoload.php';
// $user = new App\Models\User();  // файл src/Models/User.php`;
}
