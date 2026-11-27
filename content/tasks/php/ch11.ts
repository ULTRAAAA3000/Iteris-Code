// Практичні завдання глави «Архітектура», уроки 100–105 (105 без завдання). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_11: readonly RemoteTask[] = [
  {
    ...base, id: "php-layers-tasks", lesson: "php/100", xp: 30,
    title: "Три шари для списку завдань",
    context: "Контролер, сервіс і репозиторій мають окремі ролі. Правила перевірки належать сервісу: він сам вирішує, що назва допустима, а про помилку повідомляє виключенням.",
    brief: [
      "Репозиторій і контролер уже готові. Допишіть метод <code>TaskService::add(string $title): string</code>: обріжте пробіли за краями (<code>trim</code>), для порожньої назви киньте <code>InvalidArgumentException('Назва порожня')</code>, інакше збережіть її в репозиторії й поверніть обрізану назву.",
      "Програма обробляє чотири запити й друкує по рядку <code>статус тіло</code>, кожен завершується <code>\\n</code>. Очікується: <code>201 Купити хліб</code>, <code>422 Назва порожня</code>, <code>201 Прочитати PHP</code> і <code>200 Купити хліб, Прочитати PHP</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class TaskRepository
{
    private array $titles = [];

    public function add(string $title): void
    {
        $this->titles[] = $title;
    }

    public function titles(): array
    {
        return $this->titles;
    }
}

final class TaskService
{
    public function __construct(private TaskRepository $tasks) {}

    public function add(string $title): string
    {
        // TODO: trim, перевірка на порожнє (InvalidArgumentException), збереження
        $this->tasks->add($title);
        return $title;
    }

    public function titles(): array
    {
        return $this->tasks->titles();
    }
}

final class TaskController
{
    public function __construct(private TaskService $service) {}

    public function handle(array $request): array
    {
        try {
            return match ($request['action']) {
                'add' => [201, $this->service->add($request['title'])],
                default => [200, implode(', ', $this->service->titles())],
            };
        } catch (InvalidArgumentException $e) {
            return [422, $e->getMessage()];
        }
    }
}

$controller = new TaskController(new TaskService(new TaskRepository()));
$requests = [
    ['action' => 'add', 'title' => ' Купити хліб '],
    ['action' => 'add', 'title' => '   '],
    ['action' => 'add', 'title' => 'Прочитати PHP'],
    ['action' => 'list'],
];
foreach ($requests as $request) {
    [$status, $body] = $controller->handle($request);
    echo $status, ' ', $body, "\n";
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "201 Купити хліб\n422 Назва порожня\n201 Прочитати PHP\n200 Купити хліб, Прочитати PHP", hint: "Чотири рядки; назву зберігаємо без пробілів за краями, порожню відхиляємо." },
      { on: "stdout", name: "Порожня назва дає 422", has: "422 Назва порожня", hint: "Після trim порожній рядок треба відхилити виключенням, яке контролер перекладе в 422." },
      { on: "stdout", name: "Пробіли обрізано", has: "201 Купити хліб\n", hint: "Перед збереженням викличте trim, тоді в рядку не буде зайвих пробілів." },
      { on: "source", name: "Правило виражено виключенням", matches: "throw\\s+new\\s+InvalidArgumentException", hint: "Сервіс не друкує помилку, а кидає виключення." },
    ],
  },
  {
    ...base, id: "php-repo-interface", lesson: "php/101", xp: 30,
    title: "Репозиторій у пам'яті за інтерфейсом",
    context: "Сервіс просить інтерфейс репозиторію й не знає, що за ним: масив у пам'яті чи база. Вам потрібно реалізувати варіант у пам'яті, а обгортка лише для читання вже написана.",
    brief: [
      "Допишіть <code>InMemoryNoteRepository</code>, що реалізує <code>NoteRepository</code>: <code>save</code> кладе нотатку в масив за її <code>id</code>, <code>find</code> повертає нотатку або <code>null</code>, <code>all</code> повертає список нотаток (<code>array_values</code>).",
      "Очікуваний вивід, кожен рядок із <code>\\n</code>: <code>Хліб</code>, <code>немає запису 9</code>, <code>2</code>, <code>Лише читання</code>, <code>2</code>. Обгортка <code>ReadOnlyNoteRepository</code> кидає виключення при збереженні, тож кількість нотаток не зростає.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class Note
{
    public function __construct(public readonly int $id, public readonly string $title) {}
}

interface NoteRepository
{
    public function save(Note $note): void;
    public function find(int $id): ?Note;
    public function all(): array;
}

final class InMemoryNoteRepository implements NoteRepository
{
    private array $notes = [];

    // TODO: збережіть нотатку за її id
    public function save(Note $note): void {}

    // TODO: поверніть нотатку або null
    public function find(int $id): ?Note { return null; }

    // TODO: поверніть список нотаток
    public function all(): array { return []; }
}

final class ReadOnlyNoteRepository implements NoteRepository
{
    public function __construct(private NoteRepository $inner) {}

    public function save(Note $note): void { throw new LogicException('Лише читання'); }
    public function find(int $id): ?Note { return $this->inner->find($id); }
    public function all(): array { return $this->inner->all(); }
}

final class NoteService
{
    public function __construct(private NoteRepository $repo) {}

    public function add(int $id, string $title): void
    {
        $this->repo->save(new Note($id, $title));
    }

    public function title(int $id): string
    {
        return $this->repo->find($id)?->title ?? "немає запису $id";
    }
}

$repo = new InMemoryNoteRepository();
$service = new NoteService($repo);
$service->add(1, 'Молоко');
$service->add(2, 'Хліб');
echo $service->title(2), "\n";
echo $service->title(9), "\n";
echo count($repo->all()), "\n";

try {
    (new NoteService(new ReadOnlyNoteRepository($repo)))->add(3, 'Сир');
} catch (LogicException $e) {
    echo $e->getMessage(), "\n";
}
echo count($repo->all()), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Хліб\nнемає запису 9\n2\nЛише читання\n2", hint: "П'ять рядків: знайдена назва, відсутній запис, кількість, повідомлення обгортки, кількість без змін." },
      { on: "stdout", name: "find повертає збережену нотатку", has: "Хліб", hint: "save має покласти нотатку в масив, а find дістати її за id." },
      { on: "stdout", name: "Відсутній запис дає null", has: "немає запису 9", hint: "Для відсутнього ключа find повертає null: скористайтеся ?? null." },
      { on: "source", name: "Клас підписав договір", matches: "InMemoryNoteRepository\\s+implements\\s+NoteRepository", hint: "Клас має реалізувати інтерфейс NoteRepository." },
    ],
  },
  {
    ...base, id: "php-psr4-path", lesson: "php/102", xp: 40,
    title: "Автозавантаження PSR-4: від класу до файла",
    context: "Composer знаходить файл класу за його простором імен за правилом PSR-4: префікс App\\ відповідає папці src/, а решта шляху це підпапки й ім'я файла. Це правило однакове для всіх сучасних PHP-проєктів.",
    brief: [
      "Допишіть <code>classToPath(string $class)</code>: прибрати префікс <code>App\\</code>, замінити <code>\\</code> на <code>/</code>, додати каталог <code>src/</code> на початку і розширення <code>.php</code> в кінці. Наприклад, <code>App\\Models\\User</code> дає <code>src/Models/User.php</code>.",
      "Програма друкує три рядки: повне ім'я класу <code>App\\Models\\User</code> (через <code>::class</code>), шлях до нього й шлях до <code>App\\Services\\Mailer</code>. Кожен рядок завершується переведенням рядка.",
    ],
    starter: raw`<?php
namespace App\Models {
    class User {}
}

namespace {
    function classToPath(string $class): string
    {
        // TODO: App\Models\User -> src/Models/User.php
        return $class;
    }

    echo \App\Models\User::class . PHP_EOL;
    echo classToPath(\App\Models\User::class) . PHP_EOL;
    echo classToPath('App\Services\Mailer') . PHP_EOL;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "App\\Models\\User\nsrc/Models/User.php\nsrc/Services/Mailer.php", hint: "Три рядки: ім'я класу, потім два шляхи з каталогом src/ і розширенням .php." },
      { on: "stdout", name: "Повне ім'я класу береться через ::class", has: "App\\Models\\User\n", hint: "Перший рядок виводу це ім'я класу, яке дає конструкція Клас::class." },
      { on: "stdout", name: "App\\Models\\User дає src/Models/User.php", has: "src/Models/User.php", hint: "Відітніть префікс App\\, а решту перетворіть на шлях." },
      { on: "stdout", name: "App\\Services\\Mailer дає src/Services/Mailer.php", has: "src/Services/Mailer.php", hint: "Правило не залежить від імені класу: працює для будь-якого простору імен." },
      { on: "source", name: "Зворотні слеші замінюються на /", matches: "str_replace\\s*\\(", hint: "Для заміни роздільників простору імен на слеші шляху підійде str_replace." },
    ],
  },
  {
    ...base, id: "php-di-container", lesson: "php/103", xp: 45,
    title: "Контейнер із спільними екземплярами",
    context: "Контейнер залежностей зберігає фабрики за ідентифікатором і віддає один і той самий екземпляр при кожному запиті. Невідомий ідентифікатор це помилка програміста, і про неї треба повідомити виключенням.",
    brief: [
      "Допишіть <code>Container::get(string $id): object</code>: якщо фабрики для <code>$id</code> немає, киньте <code>RuntimeException(\"Невідомий сервіс: $id\")</code>. Інакше викличте фабрику (передавши їй сам контейнер) лише один раз і запам'ятайте результат у <code>$this-&gt;instances</code>, щоб наступні виклики повертали той самий об'єкт.",
      "Програма друкує чотири рядки: <code>same: yes</code> або <code>same: no</code> для двох викликів <code>get(Logger::class)</code>, <code>chain: yes</code> або <code>chain: no</code> (чи <code>Mailer</code> отримав той самий Logger), <code>created: N</code> (скільки разів створено Logger) і текст виключення для невідомого сервісу. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

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
        // TODO: виняток для невідомого $id; фабрика викликається один раз
        $factory = $this->factories[$id] ?? fn() => new stdClass();
        return $factory($this);
    }
}

final class Logger
{
    public static int $created = 0;

    public function __construct()
    {
        self::$created++;
    }
}

final class Mailer
{
    public function __construct(public readonly Logger $logger) {}
}

$c = new Container();
$c->set(Logger::class, fn(Container $c) => new Logger());
$c->set(Mailer::class, fn(Container $c) => new Mailer($c->get(Logger::class)));

echo 'same: ', $c->get(Logger::class) === $c->get(Logger::class) ? 'yes' : 'no', "\n";
echo 'chain: ', $c->get(Mailer::class)->logger === $c->get(Logger::class) ? 'yes' : 'no', "\n";
echo 'created: ', Logger::$created, "\n";
try {
    $c->get('cache');
} catch (RuntimeException $e) {
    echo $e->getMessage(), "\n";
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "same: yes\nchain: yes\ncreated: 1\nНевідомий сервіс: cache", hint: "Чотири рядки: однаковий екземпляр, ланцюжок, один Logger на всю програму й повідомлення про невідомий сервіс." },
      { on: "stdout", name: "Екземпляр спільний", has: "same: yes", hint: "Результат фабрики треба запам'ятати в масиві й віддавати при наступних викликах." },
      { on: "stdout", name: "Logger створено один раз", has: "created: 1", hint: "Фабрику викликайте лише тоді, коли екземпляра в масиві ще немає." },
      { on: "stdout", name: "Невідомий сервіс дає виключення", has: "Невідомий сервіс: cache", hint: "Перевірте наявність фабрики до її виклику й киньте RuntimeException." },
      { on: "source", name: "Використано throw new RuntimeException", matches: "throw\\s+new\\s+RuntimeException", hint: "Про помилку повідомляйте виключенням, а не поверненням null." },
    ],
  },
  {
    ...base, id: "php-config-logger", lesson: "php/104", xp: 45,
    title: "Конфігурація й логер із рівнями",
    context: "Налаштування живуть у вкладеному масиві з доступом за точковим ключем, а логер відкидає записи нижче мінімального рівня й підставляє значення контексту у заповнювачі повідомлення.",
    brief: [
      "Допишіть <code>config(array $cfg, string $key, mixed $default = null)</code>: розбийте ключ за <code>.</code>, спускайтеся вглиб через <code>array_key_exists</code> і поверніть <code>$default</code>, якщо шляху немає (значення <code>false</code> чи <code>null</code> теж законні). Також допишіть <code>MemoryLogger::log</code>: якщо рівень нижчий за мінімальний, нічого не робіть, інакше додайте у <code>$lines</code> рядок <code>РІВЕНЬ: повідомлення</code> (рівень великими літерами), де <code>{ключ}</code> замінено значенням із контексту через <code>strtr</code>.",
      "Програма друкує спершу чотири значення конфігурації по рядку: <code>Iteris</code>, <code>3306</code>, <code>root</code> (значення за замовчуванням) і <code>false</code> (через <code>var_export</code>). Далі друкує рядки журналу: <code>INFO: Вхід ann</code> і <code>ERROR: Збій 500</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function config(array $cfg, string $key, mixed $default = null): mixed
{
    // TODO: спуск по ключах, розділених крапкою; array_key_exists, не ??
    return $default;
}

final class MemoryLogger
{
    private const LEVELS = ['debug' => 0, 'info' => 1, 'warning' => 2, 'error' => 3];

    public array $lines = [];

    public function __construct(private string $minLevel) {}

    public function log(string $level, string $message, array $context = []): void
    {
        // TODO: відкинути нижчі за minLevel; підставити {ключ} через strtr
        $this->lines[] = $message;
    }
}

$cfg = [
    'app' => ['name' => 'Iteris', 'debug' => false],
    'db' => ['port' => 3306],
    'log' => ['level' => 'info'],
];

echo config($cfg, 'app.name'), "\n";
echo config($cfg, 'db.port'), "\n";
echo config($cfg, 'db.user', 'root'), "\n";
echo var_export(config($cfg, 'app.debug', true), true), "\n";

$logger = new MemoryLogger(config($cfg, 'log.level', 'debug'));
$logger->log('debug', 'Деталі {id}', ['id' => 1]);
$logger->log('info', 'Вхід {user}', ['user' => 'ann']);
$logger->log('error', 'Збій {code}', ['code' => 500]);
echo implode("\n", $logger->lines), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Iteris\n3306\nroot\nfalse\nINFO: Вхід ann\nERROR: Збій 500", hint: "Шість рядків: чотири значення конфігурації, потім два записи журналу, без запису рівня debug." },
      { on: "stdout", name: "Значення false не підмінюється типовим", has: "root\nfalse\n", hint: "Наявність ключа перевіряйте через array_key_exists, бо false законне значення." },
      { on: "stdout", name: "Заповнювачі підставлено", has: "INFO: Вхід ann", hint: "Складіть масив пар {ключ} => значення й передайте його в strtr." },
      { on: "stdout", name: "Запис debug відкинуто", matches: "^(?![\\s\\S]*Деталі)", hint: "Порівняйте числові пріоритети рівня запису й мінімального рівня за таблицею LEVELS." },
      { on: "source", name: "Використано array_key_exists", has: "array_key_exists", hint: "Саме ця функція розрізняє відсутній ключ і значення false чи null." },
    ],
  },
];
