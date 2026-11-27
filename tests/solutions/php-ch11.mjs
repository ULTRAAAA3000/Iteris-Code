const raw = String.raw;

export const SOLUTIONS_11 = {
  "php-layers-tasks": raw`<?php
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
        $title = trim($title);
        if ($title === '') {
            throw new InvalidArgumentException('Назва порожня');
        }
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
  "php-repo-interface": raw`<?php
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

    public function save(Note $note): void { $this->notes[$note->id] = $note; }

    public function find(int $id): ?Note { return $this->notes[$id] ?? null; }

    public function all(): array { return array_values($this->notes); }
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
  "php-psr4-path": raw`<?php
namespace App\Models {
    class User {}
}

namespace {
    function classToPath(string $class): string
    {
        $relative = substr($class, strlen('App\\'));
        return 'src/' . str_replace('\\', '/', $relative) . '.php';
    }

    echo \App\Models\User::class . PHP_EOL;
    echo classToPath(\App\Models\User::class) . PHP_EOL;
    echo classToPath('App\Services\Mailer') . PHP_EOL;
}
`,
  "php-di-container": raw`<?php
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
        if (!isset($this->factories[$id])) {
            throw new RuntimeException("Невідомий сервіс: $id");
        }
        return $this->instances[$id] ??= ($this->factories[$id])($this);
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
  "php-config-logger": raw`<?php
declare(strict_types=1);

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

final class MemoryLogger
{
    private const LEVELS = ['debug' => 0, 'info' => 1, 'warning' => 2, 'error' => 3];

    public array $lines = [];

    public function __construct(private string $minLevel) {}

    public function log(string $level, string $message, array $context = []): void
    {
        if (self::LEVELS[$level] < self::LEVELS[$this->minLevel]) {
            return;
        }
        $replace = [];
        foreach ($context as $key => $value) {
            $replace['{' . $key . '}'] = (string) $value;
        }
        $this->lines[] = strtoupper($level) . ': ' . strtr($message, $replace);
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
};
