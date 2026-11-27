const raw = String.raw;

export const SOLUTIONS_12 = {
  "php-text-analyzer": raw`<?php
declare(strict_types=1);

final class TextAnalyzer
{
    public function __construct(private string $text) {}

    /** Слова в нижньому регістрі, по одному (лінивий генератор). */
    public function words(): Generator
    {
        preg_match_all('/[\p{L}\p{N}]+/u', mb_strtolower($this->text), $m);
        foreach ($m[0] as $word) {
            yield $word;
        }
    }

    /** @return array<string,int> слово => кількість */
    public function frequencies(): array
    {
        $freq = [];
        foreach ($this->words() as $word) {
            $freq[$word] = ($freq[$word] ?? 0) + 1;
        }
        return $freq;
    }

    /** @return array<string,int> n найчастіших: за кількістю спадно, за словом зростно */
    public function top(int $n): array
    {
        if ($n < 1) {
            throw new InvalidArgumentException('n має бути додатним');
        }
        $freq = $this->frequencies();
        uksort($freq, fn(string $a, string $b): int => [$freq[$b], $a] <=> [$freq[$a], $b]);
        return array_slice($freq, 0, $n, true);
    }

    public function longest(): string
    {
        $best = '';
        foreach ($this->words() as $word) {
            if (mb_strlen($word) > mb_strlen($best)) {
                $best = $word;
            }
        }
        return $best;
    }

    public function sentenceCount(): int
    {
        return preg_match_all('/[.!?]+/', $this->text);
    }
}

function check(string $name, callable $fn): void
{
    try {
        echo ($fn() === true ? 'ok' : 'FAIL'), ": $name\n";
    } catch (Throwable $e) {
        echo "FAIL: $name (", $e::class, ")\n";
    }
}

function throws(callable $fn, string $class): bool
{
    try {
        $fn();
    } catch (Throwable $e) {
        return $e instanceof $class;
    }
    return false;
}

$text = 'Лис біг лісом. Лис знайшов нору! Хто живе в норі? Лис живе в лісі, а нора в лісі.';
$a = new TextAnalyzer($text);

echo 'Слів: ', iterator_count($a->words()), "\n";
echo 'Унікальних: ', count($a->frequencies()), "\n";
foreach ($a->top(3) as $word => $count) {
    echo "$word: $count\n";
}
echo 'Найдовше: ', $a->longest(), "\n";
echo 'Речень: ', $a->sentenceCount(), "\n";

try {
    $a->top(0);
} catch (InvalidArgumentException $e) {
    echo 'Помилка: ', $e->getMessage(), "\n";
}

check('top обмежує кількість', fn() => count($a->top(2)) === 2);
check('порожній текст', fn() => (new TextAnalyzer(''))->frequencies() === []);
check('регістр не важливий', fn() => (new TextAnalyzer('Мир мир МИР'))->frequencies() === ['мир' => 3]);
check('top(0) кидає виключення', fn() => throws(fn() => (new TextAnalyzer('а'))->top(0), InvalidArgumentException::class));
`,
  "php-notes-api": raw`<?php
declare(strict_types=1);

final class HttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}

final class NoteStore
{
    /** @var array<int,array{id:int,title:string,body:string}> */
    private array $notes = [];
    private int $next = 1;

    public function add(string $title, string $body): array
    {
        $note = ['id' => $this->next++, 'title' => $title, 'body' => $body];
        $this->notes[$note['id']] = $note;
        return $note;
    }

    public function find(int $id): array
    {
        return $this->notes[$id] ?? throw new HttpError(404, "note $id not found");
    }

    public function remove(int $id): void
    {
        $this->find($id);
        unset($this->notes[$id]);
    }

    /** Нотатки по одній, у порядку створення. */
    public function each(): Generator
    {
        foreach ($this->notes as $id => $note) {
            yield $id => $note;
        }
    }
}

final class NotesApi
{
    public function __construct(private NoteStore $store) {}

    /** @return array{0:int,1:?array} статус і тіло відповіді */
    public function handle(string $method, string $path, array $body = []): array
    {
        try {
            return $this->route($method, $path, $body);
        } catch (HttpError $e) {
            return [$e->status, ['error' => $e->getMessage()]];
        }
    }

    private function route(string $method, string $path, array $body): array
    {
        if ($path === '/notes') {
            return match ($method) {
                'GET' => [200, array_values(iterator_to_array($this->store->each()))],
                'POST' => [201, $this->store->add($this->title($body), (string) ($body['body'] ?? ''))],
                default => throw new HttpError(405, 'method not allowed'),
            };
        }
        if (preg_match('#^/notes/(\d+)$#', $path, $m)) {
            $id = (int) $m[1];
            return match ($method) {
                'GET' => [200, $this->store->find($id)],
                'DELETE' => $this->delete($id),
                default => throw new HttpError(405, 'method not allowed'),
            };
        }
        throw new HttpError(404, 'route not found');
    }

    private function title(array $body): string
    {
        $title = trim((string) ($body['title'] ?? ''));
        if ($title === '') {
            throw new HttpError(422, 'title required');
        }
        return $title;
    }

    private function delete(int $id): array
    {
        $this->store->remove($id);
        return [204, null];
    }
}

$api = new NotesApi(new NoteStore());
$requests = [
    ['POST', '/notes', ['title' => 'Купити молоко', 'body' => '2 літри']],
    ['POST', '/notes', ['title' => 'Відпустка']],
    ['POST', '/notes', ['title' => '  ']],
    ['GET', '/notes'],
    ['GET', '/notes/2'],
    ['DELETE', '/notes/1'],
    ['GET', '/notes/1'],
    ['PATCH', '/notes'],
    ['GET', '/nope'],
];
foreach ($requests as $req) {
    [$status, $data] = $api->handle(...$req);
    $json = $data === null ? '-' : json_encode($data, JSON_UNESCAPED_UNICODE);
    echo "$req[0] $req[1] -> $status $json\n";
}

function check(string $name, callable $fn): void
{
    try {
        echo ($fn() === true ? 'ok' : 'FAIL'), ": $name\n";
    } catch (Throwable $e) {
        echo "FAIL: $name (", $e::class, ")\n";
    }
}

check('нові id не повторюються', function () use ($api) {
    [, $n] = $api->handle('POST', '/notes', ['title' => 'Ще']);
    return $n['id'] === 3;
});
check('повторне видалення дає 404', fn() => $api->handle('DELETE', '/notes/1')[0] === 404);
`,
  "php-generator-pipeline": raw`<?php
declare(strict_types=1);

final class RowException extends RuntimeException {}

final class Stats
{
    public int $read = 0;
    /** @var string[] */
    public array $errors = [];
}

/** Джерело: рядки по одному, ключ це номер рядка. */
function source(array $lines, Stats $stats): Generator
{
    foreach ($lines as $i => $line) {
        $stats->read++;
        yield $i + 1 => $line;
    }
}

function parseRow(string $line): array
{
    $f = explode(',', $line);
    if (count($f) !== 4) {
        throw new RowException('wrong field count');
    }
    if (!ctype_digit($f[2])) {
        throw new RowException('bad quantity');
    }
    return ['item' => $f[1], 'qty' => (int) $f[2], 'price' => (float) $f[3]];
}

/** Розбирає рядки; погані пропускає й записує в $stats->errors. */
function parse(iterable $lines, Stats $stats): Generator
{
    foreach ($lines as $no => $line) {
        try {
            yield parseRow($line);
        } catch (RowException $e) {
            $stats->errors[] = "Рядок $no: " . $e->getMessage();
        }
    }
}

function onlyMin(iterable $rows, int $minQty): Generator
{
    foreach ($rows as $row) {
        if ($row['qty'] >= $minQty) {
            yield $row;
        }
    }
}

function batch(iterable $rows, int $size): Generator
{
    if ($size < 1) {
        throw new InvalidArgumentException('size must be positive');
    }
    $chunk = [];
    foreach ($rows as $row) {
        $chunk[] = $row;
        if (count($chunk) === $size) {
            yield $chunk;
            $chunk = [];
        }
    }
    if ($chunk) {
        yield $chunk;
    }
}

function sum(array $rows): float
{
    return array_sum(array_map(fn(array $r): float => $r['qty'] * $r['price'], $rows));
}

$lines = [
    '2025-01-01,apple,3,1.50',
    '2025-01-01,pear,2,2.00',
    'broken line',
    '2025-01-02,apple,x,1.50',
    '2025-01-02,kiwi,5,0.80',
    '2025-01-03,apple,4,1.50',
    '2025-01-03,pear,1,2.00',
];

// Лінивість: беремо лише першу партію
$lazy = new Stats();
$first = batch(parse(source($lines, $lazy), $lazy), 2)->current();
echo 'Лінива партія: ', count($first), ' рядки, прочитано ', $lazy->read, "\n";

// Повний прохід
$stats = new Stats();
$total = 0.0;
foreach (batch(onlyMin(parse(source($lines, $stats), $stats), 2), 2) as $n => $rows) {
    $s = sum($rows);
    $total += $s;
    echo 'Партія ', $n + 1, ': ', number_format($s, 2), "\n";
}
echo 'Некоректних: ', count($stats->errors), "\n";
foreach ($stats->errors as $e) {
    echo $e, "\n";
}
echo 'Разом: ', number_format($total, 2), "\n";

function check(string $name, callable $fn): void
{
    try {
        echo ($fn() === true ? 'ok' : 'FAIL'), ": $name\n";
    } catch (Throwable $e) {
        echo "FAIL: $name (", $e::class, ")\n";
    }
}

check('порожній вхід без партій', fn() => iterator_to_array(batch([], 3), false) === []);
check('остання неповна партія', fn() => array_map('count', iterator_to_array(batch([1, 2, 3], 2), false)) === [2, 1]);
check('size 0 кидає виключення', function () {
    try {
        iterator_to_array(batch([1], 0));
    } catch (InvalidArgumentException) {
        return true;
    }
    return false;
});
`,
  "php-ttl-cache": raw`<?php
declare(strict_types=1);

final class TtlCache
{
    /** @var array<string,array{0:mixed,1:int}> ключ => [значення, момент завершення] */
    private array $items = [];
    public int $hits = 0;
    public int $misses = 0;

    /** @param Closure():int $clock поточний час у секундах */
    public function __construct(private Closure $clock, private int $defaultTtl = 60)
    {
        $this->checkTtl($defaultTtl);
    }

    private function checkTtl(int $ttl): void
    {
        if ($ttl < 1) {
            throw new InvalidArgumentException('ttl має бути додатним');
        }
    }

    private function now(): int
    {
        return ($this->clock)();
    }

    private function alive(string $key): bool
    {
        return isset($this->items[$key]) && $this->items[$key][1] > $this->now();
    }

    public function set(string $key, mixed $value, ?int $ttl = null): void
    {
        $ttl ??= $this->defaultTtl;
        $this->checkTtl($ttl);
        $this->items[$key] = [$value, $this->now() + $ttl];
    }

    public function has(string $key): bool
    {
        return $this->alive($key);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        if (!$this->alive($key)) {
            unset($this->items[$key]);
            $this->misses++;
            return $default;
        }
        $this->hits++;
        return $this->items[$key][0];
    }

    /** Повертає кеш або обчислює й запам'ятовує. */
    public function remember(string $key, callable $make, ?int $ttl = null): mixed
    {
        if ($this->alive($key)) {
            return $this->get($key);
        }
        $this->misses++;
        $value = $make();
        $this->set($key, $value, $ttl);
        return $value;
    }

    /** Видаляє прострочене, повертає скільки видалено. */
    public function purge(): int
    {
        $before = count($this->items);
        $this->items = array_filter($this->items, fn(array $e): bool => $e[1] > $this->now());
        return $before - count($this->items);
    }

    /** Живі ключі по одному. */
    public function keys(): Generator
    {
        foreach ($this->items as $key => $_) {
            if ($this->alive((string) $key)) {
                yield $key;
            }
        }
    }
}

function check(string $name, callable $fn): void
{
    try {
        echo ($fn() === true ? 'ok' : 'FAIL'), ": $name\n";
    } catch (Throwable $e) {
        echo "FAIL: $name (", $e::class, ")\n";
    }
}

$now = 100;
$cache = new TtlCache(function () use (&$now): int { return $now; }, 10);

$cache->set('a', 1);
$cache->set('b', 2, 30);
echo 'a на 100: ', var_export($cache->get('a'), true), "\n";
$now = 109;
echo 'a на 109: ', var_export($cache->get('a'), true), "\n";
$now = 110;
echo 'a на 110: ', var_export($cache->get('a', 'немає'), true), "\n";
echo 'b на 110: ', var_export($cache->get('b'), true), "\n";

$calls = 0;
$make = function () use (&$calls): string {
    $calls++;
    return 'дорого';
};
$cache->remember('x', $make);
$cache->remember('x', $make);
$now = 125;
$cache->remember('x', $make);
echo 'Обчислень: ', $calls, "\n";

$cache->set('y', 0, 5);
$now = 131;
echo 'Видалено: ', $cache->purge(), "\n";
echo 'Живі: ', implode(',', iterator_to_array($cache->keys(), false)), "\n";
echo 'hits=', $cache->hits, ' misses=', $cache->misses, "\n";

try {
    $cache->set('z', 1, 0);
} catch (InvalidArgumentException $e) {
    echo 'Помилка: ', $e->getMessage(), "\n";
}

check('нуль це не відсутність', function () use ($cache, &$now) {
    $cache->set('zero', 0, 5);
    return $cache->has('zero') && $cache->get('zero', 'default') === 0;
});
check('має false після спливу', function () use ($cache, &$now) {
    $now += 5;
    return $cache->has('zero') === false;
});
`,
  "php-rate-limiter": raw`<?php
declare(strict_types=1);

final class TooManyRequests extends RuntimeException
{
    public function __construct(public readonly string $key, public readonly int $retryAfter)
    {
        parent::__construct("ліміт для $key вичерпано");
    }
}

final class RateLimiter
{
    /** @var array<string,int[]> ключ => моменти дозволених запитів у вікні */
    private array $log = [];

    public function __construct(private Closure $clock, private int $limit, private int $window)
    {
        if ($limit < 1 || $window < 1) {
            throw new InvalidArgumentException('limit і window мають бути додатними');
        }
    }

    /** Реєструє запит. Повертає скільки запитів ще лишилось; кидає TooManyRequests. */
    public function hit(string $key): int
    {
        $now = ($this->clock)();
        $recent = array_values(array_filter(
            $this->log[$key] ?? [],
            fn(int $t): bool => $t > $now - $this->window,
        ));
        if (count($recent) >= $this->limit) {
            $this->log[$key] = $recent;
            throw new TooManyRequests($key, $recent[0] + $this->window - $now);
        }
        $recent[] = $now;
        $this->log[$key] = $recent;
        return $this->limit - count($recent);
    }
}

/** Прогін подій [час, ключ] через ліміт: віддає рядки звіту. */
function run(RateLimiter $limiter, iterable $events, int &$now): Generator
{
    foreach ($events as [$time, $key]) {
        $now = $time;
        try {
            $left = $limiter->hit($key);
            yield "t=$time $key OK, лишилось $left";
        } catch (TooManyRequests $e) {
            yield "t=$time $key ВІДМОВА, повторити через {$e->retryAfter}";
        }
    }
}

function check(string $name, callable $fn): void
{
    try {
        echo ($fn() === true ? 'ok' : 'FAIL'), ": $name\n";
    } catch (Throwable $e) {
        echo "FAIL: $name (", $e::class, ")\n";
    }
}

$now = 0;
$limiter = new RateLimiter(function () use (&$now): int { return $now; }, 3, 10);
$events = [[0, 'a'], [1, 'a'], [2, 'a'], [3, 'a'], [3, 'b'], [9, 'a'], [10, 'a'], [11, 'a'], [12, 'a']];

$denied = 0;
foreach (run($limiter, $events, $now) as $line) {
    echo $line, "\n";
    if (str_contains($line, 'ВІДМОВА')) {
        $denied++;
    }
}
echo 'Відмов: ', $denied, "\n";

check('вікно ковзає', function () {
    $t = 0;
    $l = new RateLimiter(function () use (&$t): int { return $t; }, 1, 5);
    $l->hit('k');
    $t = 5;
    return $l->hit('k') === 0;
});
check('ключі незалежні', function () {
    $t = 0;
    $l = new RateLimiter(function () use (&$t): int { return $t; }, 1, 5);
    $l->hit('a');
    return $l->hit('b') === 0;
});
check('limit 0 кидає виключення', function () {
    try {
        new RateLimiter(fn(): int => 0, 0, 5);
    } catch (InvalidArgumentException) {
        return true;
    }
    return false;
});
echo "Курс завершено\n";
`,
};
