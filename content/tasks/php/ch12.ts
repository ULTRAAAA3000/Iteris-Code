// Практичні завдання глави «Проєкти» (уроки 106–110). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12: readonly RemoteTask[] = [
  {
    ...base, id: "php-text-analyzer", lesson: "php/106", xp: 50,
    title: "Аналізатор тексту на генераторі",
    context: "Аналіз тексту поєднує клас, лінивий генератор слів і перевірку вхідних даних. Допишіть методи TextAnalyzer так, щоб самоперевірки наприкінці програми показали ok.",
    brief: [
      "У класі <code>TextAnalyzer</code> замініть місця з <code>TODO</code>. <code>words()</code> це генератор: слова з букв і цифр у нижньому регістрі (працюйте з юнікодом: <code>mb_strtolower</code>, <code>preg_match_all</code> із прапором <code>u</code>). <code>frequencies()</code> повертає <code>слово =&gt; кількість</code>. <code>top($n)</code> дає <code>$n</code> найчастіших: спершу більша кількість, за рівності слово за абеткою, ключі зберігаються; для <code>$n &lt; 1</code> кидає <code>InvalidArgumentException('n має бути додатним')</code>.",
      "<code>longest()</code> повертає найдовше слово (при рівності перше), <code>sentenceCount()</code> рахує групи знаків <code>.</code>, <code>!</code>, <code>?</code>. Решту програми (друк і функція <code>check</code>) не змінюйте: очікується 12 рядків виводу, кожен завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class TextAnalyzer
{
    public function __construct(private string $text) {}

    /** Слова в нижньому регістрі, по одному (лінивий генератор). */
    public function words(): Generator
    {
        // TODO: знайдіть слова (букви й цифри, юнікод) у нижньому регістрі та віддайте кожне через yield
        yield from [];
    }

    /** @return array<string,int> слово => кількість */
    public function frequencies(): array
    {
        // TODO: порахуйте слова з words(): слово => кількість
        return [];
    }

    /** @return array<string,int> n найчастіших: за кількістю спадно, за словом зростно */
    public function top(int $n): array
    {
        // TODO: n < 1 кидає InvalidArgumentException('n має бути додатним');
        // інакше n найчастіших: кількість спадно, за рівності слово за абеткою; збережіть ключі
        return [];
    }

    public function longest(): string
    {
        // TODO: найдовше слово (за mb_strlen), при рівності перше
        return '';
    }

    public function sentenceCount(): int
    {
        // TODO: кількість груп знаків . ! ? у тексті
        return 0;
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
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "Слів: 18\nУнікальних: 12\nв: 3\nлис: 3\nживе: 2\nНайдовше: знайшов\nРечень: 4\nПомилка: n має бути додатним\nok: top обмежує кількість\nok: порожній текст\nok: регістр не важливий\nok: top(0) кидає виключення", hint: "Дванадцять рядків: підсумки, топ-3, найдовше слово, речення, помилка й чотири перевірки." },
      { on: "stdout", name: "Слова пораховано генератором", has: "Слів: 18\nУнікальних: 12", hint: "Слів має бути 18, унікальних 12: регістр не впливає." },
      { on: "stdout", name: "Топ упорядковано за кількістю й абеткою", has: "в: 3\nлис: 3\nживе: 2", hint: "Для рівних кількостей порівнюйте слова: масив [кількість спадно, слово зростно] зручно порівняти через &lt;=&gt;." },
      { on: "stdout", name: "Усі самоперевірки пройдено", matches: "^(?!.*FAIL)(?=.*ok: top\\(0\\))", hint: "Жоден рядок не має починатися з FAIL: перевірте top(0) та порожній текст." },
      { on: "source", name: "Слова віддаються через yield", matches: "yield", hint: "words() має бути генератором: використайте yield." },
    ],
  },
  {
    ...base, id: "php-notes-api", lesson: "php/107", xp: 55,
    title: "REST-API нотаток у пам'яті",
    context: "Маленький API без фреймворку: маршрутизатор, сховище в пам'яті й виключення, що перетворюються на HTTP-статуси. Саме така будова лежить в основі справжніх застосунків.",
    brief: [
      "Дороблюйте <code>NoteStore</code> і <code>NotesApi</code>. <code>find($id)</code> повертає нотатку або кидає <code>HttpError(404, \"note $id not found\")</code>; <code>remove($id)</code> видаляє нотатку й для відсутньої дає той самий 404. <code>title()</code> обрізає пробіли й для порожнього заголовка кидає <code>HttpError(422, 'title required')</code>.",
      "<code>handle()</code> викликає <code>route()</code> і перетворює <code>HttpError</code> на пару <code>[статус, ['error' =&gt; повідомлення]]</code>. Решта (генератор <code>each()</code>, маршрути, друк запитів у форматі <code>МЕТОД шлях -&gt; статус json</code> і дві самоперевірки) уже написана. Кожен рядок виводу завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
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
        // TODO: поверніть нотатку або киньте HttpError(404, "note $id not found")
        return [];
    }

    public function remove(int $id): void
    {
        // TODO: видаліть нотатку; якщо її немає, має бути той самий 404

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
        // TODO: викличте route() і перетворіть HttpError на [статус, ['error' => повідомлення]]
        return $this->route($method, $path, $body);
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
        // TODO: обрізаний title; порожній це HttpError(422, 'title required')
        return (string) ($body['title'] ?? '');
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
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "POST /notes -> 201 {\"id\":1,\"title\":\"Купити молоко\",\"body\":\"2 літри\"}\nPOST /notes -> 201 {\"id\":2,\"title\":\"Відпустка\",\"body\":\"\"}\nPOST /notes -> 422 {\"error\":\"title required\"}\nGET /notes -> 200 [{\"id\":1,\"title\":\"Купити молоко\",\"body\":\"2 літри\"},{\"id\":2,\"title\":\"Відпустка\",\"body\":\"\"}]\nGET /notes/2 -> 200 {\"id\":2,\"title\":\"Відпустка\",\"body\":\"\"}\nDELETE /notes/1 -> 204 -\nGET /notes/1 -> 404 {\"error\":\"note 1 not found\"}\nPATCH /notes -> 405 {\"error\":\"method not allowed\"}\nGET /nope -> 404 {\"error\":\"route not found\"}\nok: нові id не повторюються\nok: повторне видалення дає 404", hint: "Дев'ять рядків запитів і два рядки перевірок." },
      { on: "stdout", name: "Порожній заголовок дає 422", has: "POST /notes -> 422 {\"error\":\"title required\"}", hint: "Тіло відповіді має вигляд {\"error\":\"title required\"}, статус 422." },
      { on: "stdout", name: "Відсутня нотатка дає 404", has: "GET /notes/1 -> 404 {\"error\":\"note 1 not found\"}", hint: "find() кидає HttpError, а handle() ловить його й повертає статус." },
      { on: "stdout", name: "Самоперевірки ok", matches: "^(?!.*FAIL)(?=.*ok: повторне видалення)", hint: "Повторне видалення має давати 404, а не тихий успіх." },
      { on: "source", name: "Виключення ловляться в handle", matches: "catch\\s*\\(\\s*HttpError", hint: "Піймайте HttpError у handle()." },
    ],
  },
  {
    ...base, id: "php-generator-pipeline", lesson: "php/108", xp: 55,
    title: "Конвеєр обробки даних на генераторах",
    context: "Конвеєр із генераторів читає, розбирає, фільтрує й групує дані по одному рядку, не тримаючи все в пам'яті. Помилки в рядках не мають зупиняти весь потік.",
    brief: [
      "Допишіть <code>parse()</code>, <code>onlyMin()</code> і <code>batch()</code>. <code>parse()</code> віддає <code>parseRow($line)</code>, а <code>RowException</code> ловить і додає до <code>$stats-&gt;errors</code> рядок <code>\"Рядок $no: повідомлення\"</code>, потік іде далі. <code>onlyMin()</code> пропускає рядки з <code>qty</code> менше мінімуму. <code>batch()</code> віддає масиви по <code>$size</code> елементів (остання може бути коротшою), а для <code>$size &lt; 1</code> кидає <code>InvalidArgumentException</code>.",
      "Усе має бути лінивим: після першої партії з джерела прочитано рівно стільки рядків, скільки потрібно для неї. Друк і самоперевірки не змінюйте; кожен рядок виводу завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
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
        // TODO: віддайте parseRow($line); RowException ловіть і додавайте "Рядок $no: повідомлення" до $stats->errors
        yield parseRow($line);
    }
}

function onlyMin(iterable $rows, int $minQty): Generator
{
    foreach ($rows as $row) {
        // TODO: віддавайте лише рядки з qty не менше $minQty
        yield $row;
    }
}

function batch(iterable $rows, int $size): Generator
{
    // TODO: size < 1 кидає InvalidArgumentException
    // TODO: накопичуйте рядки й віддавайте масив щоразу, коли набралось $size; не забудьте неповну останню партію
    foreach ($rows as $row) {
        yield [$row];
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
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "Лінива партія: 2 рядки, прочитано 2\nПартія 1: 8.50\nПартія 2: 10.00\nНекоректних: 2\nРядок 3: wrong field count\nРядок 4: bad quantity\nРазом: 18.50\nok: порожній вхід без партій\nok: остання неповна партія\nok: size 0 кидає виключення", hint: "Лінива партія, дві партії із сумами, помилки, підсумок і три перевірки." },
      { on: "stdout", name: "Лінивість збережено", has: "Лінива партія: 2 рядки, прочитано 2", hint: "Не збирайте все в масив: batch() бере з parse() лише потрібні рядки." },
      { on: "stdout", name: "Помилки не зупиняють конвеєр", has: "Рядок 3: wrong field count\nРядок 4: bad quantity", hint: "Ловіть RowException всередині циклу generator-а, а не навколо foreach зовні." },
      { on: "stdout", name: "Підсумок правильний", has: "Разом: 18.50", hint: "Рядки з qty менше 2 відкидаються, решта групується по двоє." },
      { on: "source", name: "Виключення ловляться в parse", matches: "catch\\s*\\(\\s*RowException", hint: "Піймайте RowException у parse()." },
    ],
  },
  {
    ...base, id: "php-ttl-cache", lesson: "php/109", xp: 55,
    title: "Кеш із TTL і підміною годинника",
    context: "Кеш із часом життя записів потребує годинника. Якщо годинник передати ззовні, час можна підмінити, і поведінку кешу легко перевірити без очікування.",
    brief: [
      "Допишіть у <code>TtlCache</code>: <code>checkTtl()</code> (для <code>$ttl &lt; 1</code> кидає <code>InvalidArgumentException('ttl має бути додатним')</code>), <code>alive()</code> (запис існує й момент завершення <b>строго більший</b> за <code>now()</code>), <code>remember()</code> (живий запис повертає через <code>get()</code>, інакше лічить промах, викликає <code>$make</code> і зберігає результат) та <code>purge()</code> (видаляє прострочене, повертає кількість).",
      "Сценарій і самоперевірки вже написані: годинник це замикання над змінною <code>$now</code>. Зверніть увагу, що значення <code>0</code> це не відсутність запису. Кожен рядок виводу завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
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
        // TODO: ttl < 1 кидає InvalidArgumentException('ttl має бути додатним')
    }

    private function now(): int
    {
        return ($this->clock)();
    }

    private function alive(string $key): bool
    {
        // TODO: запис існує й момент завершення строго більший за now()
        return isset($this->items[$key]);
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
        // TODO: живий запис повертайте через get(); інакше лічіть промах, викличте $make, збережіть і поверніть
        return $make();
    }

    /** Видаляє прострочене, повертає скільки видалено. */
    public function purge(): int
    {
        // TODO: залиште лише живі записи й поверніть, скільки видалено
        return 0;
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
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "a на 100: 1\na на 109: 1\na на 110: 'немає'\nb на 110: 2\nОбчислень: 2\nВидалено: 2\nЖиві: x\nhits=4 misses=3\nПомилка: ttl має бути додатним\nok: нуль це не відсутність\nok: має false після спливу", hint: "Скінчення строку, remember, purge, лічильники, помилка й дві перевірки." },
      { on: "stdout", name: "Запис гине рівно в момент строку", has: "a на 109: 1\na на 110: 'немає'", hint: "Запис із ttl 10, створений на 100, на 110 уже прострочений: порівнюйте строго." },
      { on: "stdout", name: "remember рахує обчислення", has: "Обчислень: 2", hint: "Другий виклик у межах TTL не викликає $make, а після спливу викликає знову." },
      { on: "stdout", name: "purge й лічильники", has: "Видалено: 2\nЖиві: x\nhits=4 misses=3", hint: "Промах лічиться й у get(), і в remember(), коли запису немає." },
      { on: "stdout", name: "Самоперевірки ok", matches: "^(?!.*FAIL)(?=.*ok: має false)", hint: "Нуль не є відсутністю; після спливу has() дає false." },
    ],
  },
  {
    ...base, id: "php-rate-limiter", lesson: "php/110", xp: 60,
    title: "Rate limiter зі ковзним вікном",
    context: "Обмежувач запитів завершує курс: клас зі станом, годинник ззовні, виключення з даними для клієнта, генератор звіту й самоперевірки. Усе, що ви вивчили, в одній програмі.",
    brief: [
      "Допишіть <code>RateLimiter::hit($key)</code>: у журналі ключа лишайте моменти <b>пізніші</b> за <code>$now - window</code>; якщо їх уже <code>limit</code>, киньте <code>TooManyRequests($key, найстаріший + window - $now)</code>; інакше запишіть <code>$now</code> і поверніть, скільки запитів ще лишилось. Конструктор для <code>limit</code> чи <code>window</code> менших за 1 кидає <code>InvalidArgumentException</code>.",
      "У генераторі <code>run()</code> віддавайте <code>\"t=$time $key OK, лишилось N\"</code> або, піймавши <code>TooManyRequests</code>, <code>\"t=$time $key ВІДМОВА, повторити через M\"</code>. Підрахунок відмов, три самоперевірки й фінальний рядок уже є. Кожен рядок виводу завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
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
        // TODO: limit або window менші за 1 кидають InvalidArgumentException
    }

    /** Реєструє запит. Повертає скільки запитів ще лишилось; кидає TooManyRequests. */
    public function hit(string $key): int
    {
        $now = ($this->clock)();
        // TODO: залиште в $this->log[$key] лише моменти пізніші за $now - window;
        // якщо їх уже limit, киньте TooManyRequests($key, найстаріший + window - $now);
        // інакше запишіть $now і поверніть, скільки запитів лишилось
        return $this->limit;
    }
}

/** Прогін подій [час, ключ] через ліміт: віддає рядки звіту. */
function run(RateLimiter $limiter, iterable $events, int &$now): Generator
{
    foreach ($events as [$time, $key]) {
        $now = $time;
        // TODO: yield "t=$time $key OK, лишилось N" або, піймавши TooManyRequests,
        // yield "t=$time $key ВІДМОВА, повторити через M"
        yield "t=$time $key ?";
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
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "t=0 a OK, лишилось 2\nt=1 a OK, лишилось 1\nt=2 a OK, лишилось 0\nt=3 a ВІДМОВА, повторити через 7\nt=3 b OK, лишилось 2\nt=9 a ВІДМОВА, повторити через 1\nt=10 a OK, лишилось 0\nt=11 a OK, лишилось 0\nt=12 a OK, лишилось 0\nВідмов: 2\nok: вікно ковзає\nok: ключі незалежні\nok: limit 0 кидає виключення\nКурс завершено", hint: "Дев'ять рядків подій, число відмов, три перевірки й підсумок курсу." },
      { on: "stdout", name: "Відмова з часом очікування", has: "t=3 a ВІДМОВА, повторити через 7", hint: "Найстарішим був запит на t=0, вікно 10: чекати 0 + 10 - 3." },
      { on: "stdout", name: "Вікно ковзає", has: "t=10 a OK, лишилось 0", hint: "Моменти, що дорівнюють now - window, у вікно вже не входять." },
      { on: "stdout", name: "Ключі незалежні", has: "t=3 b OK, лишилось 2", hint: "Журнал веде окремо для кожного ключа." },
      { on: "stdout", name: "Усі перевірки ok", matches: "^(?!.*FAIL)(?=.*ok: limit 0).*Курс завершено$", hint: "Жодного FAIL; конструктор має відхиляти limit 0." },
      { on: "source", name: "Виключення кидається", matches: "throw\\s+new\\s+TooManyRequests", hint: "hit() має кидати TooManyRequests." },
    ],
  },
];
