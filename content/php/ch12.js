// Глава 12 курсу PHP «Проєкти» (уроки 106–110)
export const LESSONS_12 = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Аналіз тексту схожий на підрахунок голосів: бюлетені (слова) розкладають по стосах, рахують кожен стос і оголошують переможців. Головне зрозуміло визначити, що вважати бюлетенем, а що сміттям.",
    p: [
      "Перший проєкт невеликий, але в ньому вже є все потрібне: вхідні дані, чітко визначені правила, перетворення й звіт. Ми розіб'ємо текст на слова, пораховуємо частоти й виведемо найчастіші. Така задача зустрічається скрізь: від пошуку по сайту до перевірки, чи користувачі не вживають заборонені слова.",
      "Модель у голові: конвеєр із чотирьох кроків. <b>Нормалізація</b> приводить текст до єдиного вигляду, зокрема <code>mb_strtolower</code> робить літери малими. <b>Токенізація</b> розбиває його на слова, і для Unicode це <code>preg_match_all('/\\p{L}+/u', $text, $m)</code>: <code>\\p{L}</code> означає будь-яку літеру будь-якої мови, а прапорець <code>u</code> вмикає UTF-8. <b>Підрахунок</b> робить <code>array_count_values</code>. <b>Звіт</b> сортує й обрізає результат.",
      "Сортування за частотою з рівними значеннями дає приємну ідіому: <code>usort($keys, fn($a, $b) =&gt; [$counts[$b], $a] &lt;=&gt; [$counts[$a], $b])</code>. Масиви порівнюються поелементно: спершу за спаданням частоти, а за рівності за зростанням слова. Результат стабільний і передбачуваний, а це важливо для тестів, адже перевіряти нестабільний порядок неможливо.",
      "Головна пастка проєкту: байти проти символів. Функції <code>strlen</code>, <code>strtoupper</code>, <code>substr</code> рахують байти, а кирилична літера в UTF-8 займає два. Тому <code>strlen('вікно')</code> дає 10, а не 5, і <code>strtoupper</code> кирилицю не чіпає. Для тексту користуйтеся <code>mb_strlen</code>, <code>mb_strtolower</code>, <code>mb_strtoupper</code>. Друга пастка: <code>str_word_count</code> орієнтується на ASCII і для кирилиці не годиться.",
      "Ще дві пастки. Ключі масиву, що виглядають як цілі числа, PHP перетворює на <code>int</code>, тож слово <code>\"007\"</code> лишиться рядком, а <code>\"7\"</code> стане числом, і суворий тип параметра <code>string</code> зламається. Тому токени беруть лише з літер. І порожній вхід: аналізатор мусить або повертати порожній звіт, або кидати виключення з ясним повідомленням, але не друкувати «ділення на нуль» у середньому.",
      "Ідіоми. Розкладайте задачу на маленькі функції чи методи й дайте кожній одне завдання: <code>words()</code> повертає слова, <code>frequencies()</code> рахує, <code>top($n)</code> повертає перших. Токенізатор зручно зробити генератором: він віддає слова по одному, і довгий текст не потрібно тримати як масив. Вхід перевіряйте на краю, а решта коду може покладатися на коректні дані. Результат повертайте даними, а друкуйте окремо.",
      "Далі проєкти ускладнюються. Наступний це міні-API нотаток: там з'являться маршрутизація, репозиторій у пам'яті й виключення, які перетворюються на коди відповіді. Для нього знадобиться все, що ми вже зробили в главі про архітектуру.",
    ],
    code: [
      String.raw`<?php
$text = 'Мама мила раму. Мама мила Раму і вікно!';
preg_match_all('/\p{L}+/u', mb_strtolower($text), $m);
$words = $m[0];

echo count($words), "\n";
echo implode(',', $words), "\n";`,
      String.raw`<?php
$words = ['мама', 'мила', 'раму', 'мама', 'мила', 'раму', 'і', 'вікно'];
$counts = array_count_values($words);

$keys = array_keys($counts);
usort($keys, fn(string $a, string $b) => [$counts[$b], $a] <=> [$counts[$a], $b]);

foreach (array_slice($keys, 0, 3) as $word) {
    echo $word, ': ', $counts[$word], "\n";
}`,
      String.raw`<?php
// Поведінка, що дивує: байти проти символів
$word = 'вікно';
echo strlen($word), ' ', mb_strlen($word), "\n";
echo strtoupper($word), ' ', mb_strtoupper($word), "\n";
echo substr($word, 0, 1) === 'в' ? 'так' : 'ні', "\n";
echo mb_substr($word, 0, 1) === 'в' ? 'так' : 'ні', "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class TextAnalyzer
{
    public function __construct(private string $text)
    {
        if (trim($text) === '') {
            throw new InvalidArgumentException('Текст порожній');
        }
    }

    public function words(): Generator
    {
        preg_match_all('/\p{L}+/u', mb_strtolower($this->text), $m);
        foreach ($m[0] as $word) {
            yield $word;
        }
    }

    public function top(int $n): array
    {
        $counts = [];
        foreach ($this->words() as $word) {
            $counts[$word] = ($counts[$word] ?? 0) + 1;
        }
        $keys = array_keys($counts);
        usort($keys, fn(string $a, string $b) => [$counts[$b], $a] <=> [$counts[$a], $b]);
        $result = [];
        foreach (array_slice($keys, 0, $n) as $word) {
            $result[$word] = $counts[$word];
        }
        return $result;
    }
}

$analyzer = new TextAnalyzer('Той, хто шукає, знайде. Хто шукає, той знайде!');
foreach ($analyzer->top(3) as $word => $count) {
    echo "$word=$count\n";
}`,
      String.raw`<?php
// аварія: порожній текст відхилено виключенням, яке ніхто не ловить
declare(strict_types=1);

final class TextAnalyzer
{
    public function __construct(private string $text)
    {
        if (trim($text) === '') {
            throw new InvalidArgumentException('Текст порожній');
        }
    }
}

echo "Старт\n";
new TextAnalyzer("   \n");
echo "Кінець\n";`,
    ],
    note: "Аналіз тексту це конвеєр: нормалізація, токенізація через preg_match_all з прапорцем u, підрахунок і звіт. Для UTF-8 беріть mb_-функції, а сортування за частотою й словом робіть порівнянням масивів через оператор космічного корабля.",
    work: "Підрахунок слів і частот лежить в основі пошуку, тегів, перевірки спаму й аналізу відгуків. Така ж схема з нормалізацією, токенізацією та підрахунком застосовується до логів, назв товарів і запитів користувачів.",
    tasks: [
      "Чому для тексту українською варто використовувати mb_strlen і mb_strtolower, а не strlen і strtolower?",
      "Як відсортувати слова за спаданням частоти й за зростанням слова при рівній частоті?",
    ],
  },
  {
    t: "Проєкт: REST-API нотаток у пам'яті",
    ch: "Проєкти",
    easy: "API схоже на віконце реєстратури: ви кажете, що потрібно (метод і адресу), працівник знаходить потрібну картку й відповідає числом-статусом. Якщо картки немає, ввічливо каже «немає», а не мовчить.",
    p: [
      "У реальному вебі PHP отримує запит від сервера, а тут ми його імітуємо: метод, шлях і тіло задаємо масивом. Мета проєкту це власне API нотаток із чотирма діями: список, створення, читання за номером і видалення. Дані тримаємо в пам'яті, як у репозиторії з минулої глави. Так проєкт запускається будь-де й повністю перевіряється тестами.",
      "Модель у голові: запит проходить <b>маршрутизатор</b> (який дія для методу й шляху), <b>контролер</b> (розбір входу, формування відповіді), <b>сервіс</b> (правила) і <b>репозиторій</b> (збереження). Відповідь це пара: числовий статус і тіло. Для JSON є <code>json_encode($data, JSON_UNESCAPED_UNICODE)</code>, інакше кирилиця перетвориться на послідовності <code>\\u04...</code>.",
      "Маршрути зручно описувати регулярними виразами: <code>preg_match('#^/notes/(\\d+)$#', $path, $m)</code> одночасно перевіряє форму шляху й витягує номер. Вираз <code>match (true)</code> з умовами в гілках читається краще за ланцюжок <code>if</code>, а гілка <code>default</code> дає статус 404. Метод HTTP перевіряйте разом зі шляхом, бо той самий шлях з іншим методом означає іншу дію.",
      "Помилки подаються виключеннями власних класів: <code>NotFoundException</code> для відсутньої нотатки й <code>ValidationException</code> для поганого тіла. Репозиторій чи сервіс кидає їх, а контролер перекладає в статус: 404 і 422. Так бізнес-код не знає про HTTP. Вираз <code>$this-&gt;notes[$id] ?? throw new NotFoundException(...)</code> стисло виражає «знайти або кинути» (<code>throw</code> як вираз є з PHP 8.0).",
      "Пастки. Після <code>unset($this-&gt;notes[$id])</code> у масиві лишається прогалина в ключах, і <code>json_encode</code> такого масиву дасть не список, а об'єкт <code>{\"1\":...,\"3\":...}</code>. Перед відповіддю викличте <code>array_values</code>. Друга: номер зі шляху це рядок, і без суворих типів <code>\"7\"</code> тихо стане 7. Приводьте явно через <code>(int)</code> після того, як регулярний вираз гарантує цифри. Третя: <code>catch (Exception $e)</code> без розбору ковтає й справжні баги.",
      "Ідіоми. Відповідь це завжди одна й та сама структура, а не ряд різних <code>echo</code>. Створення повертає статус 201, видалення 204 без тіла, відсутність 404, помилка входу 422. Ідентифікатори видає репозиторій за лічильником, який зростає й після видалень, щоб старі номери не повторювалися. Класи роблять <code>final</code>, а залежності передають конструктором.",
      "Проєкт показує, що шарова архітектура працює навіть у малому. Наступний проєкт змінить акцент: не стільки структура, скільки потік даних. Ми обробимо великий набір записів конвеєром генераторів, де кожен етап бере значення по одному й не тримає все в пам'яті.",
    ],
    code: [
      String.raw`<?php
function route(string $method, string $path): string
{
    return match (true) {
        $method === 'GET' && $path === '/notes' => 'список',
        $method === 'POST' && $path === '/notes' => 'створення',
        $method === 'GET' && preg_match('#^/notes/(\d+)$#', $path, $m) === 1 => 'нотатка ' . $m[1],
        default => '404',
    };
}

echo route('GET', '/notes'), "\n";
echo route('POST', '/notes'), "\n";
echo route('GET', '/notes/7'), "\n";
echo route('DELETE', '/x'), "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class NotFoundException extends RuntimeException {}
final class ValidationException extends InvalidArgumentException {}

final class NoteRepository
{
    private array $notes = [];
    private int $nextId = 1;

    public function add(string $title): array
    {
        $note = ['id' => $this->nextId++, 'title' => $title];
        $this->notes[$note['id']] = $note;
        return $note;
    }

    public function find(int $id): array
    {
        return $this->notes[$id] ?? throw new NotFoundException("Нотатки $id немає");
    }

    public function all(): array
    {
        return array_values($this->notes);
    }
}

final class NoteController
{
    public function __construct(private NoteRepository $repo) {}

    public function handle(string $method, string $path, array $body = []): array
    {
        try {
            if ($method === 'GET' && $path === '/notes') {
                return [200, $this->repo->all()];
            }
            if ($method === 'POST' && $path === '/notes') {
                $title = trim((string) ($body['title'] ?? ''));
                if ($title === '') {
                    throw new ValidationException('Потрібна назва');
                }
                return [201, $this->repo->add($title)];
            }
            if ($method === 'GET' && preg_match('#^/notes/(\d+)$#', $path, $m) === 1) {
                return [200, $this->repo->find((int) $m[1])];
            }
            return [404, ['error' => 'Немає маршруту']];
        } catch (NotFoundException $e) {
            return [404, ['error' => $e->getMessage()]];
        } catch (ValidationException $e) {
            return [422, ['error' => $e->getMessage()]];
        }
    }
}

$api = new NoteController(new NoteRepository());
$calls = [
    ['POST', '/notes', ['title' => 'Купити хліб']],
    ['POST', '/notes', ['title' => '  ']],
    ['GET', '/notes/1'],
    ['GET', '/notes/9'],
];
foreach ($calls as $call) {
    [$status, $data] = $api->handle($call[0], $call[1], $call[2] ?? []);
    echo $status, ' ', json_encode($data, JSON_UNESCAPED_UNICODE), "\n";
}`,
      String.raw`<?php
// Поведінка, що дивує: прогалини в ключах після unset
$notes = [1 => 'a', 2 => 'b', 3 => 'c'];
unset($notes[2]);

echo json_encode($notes), "\n";               // об'єкт, а не список
echo json_encode(array_values($notes)), "\n"; // список

echo json_encode(['title' => 'Кава']), "\n";
echo json_encode(['title' => 'Кава'], JSON_UNESCAPED_UNICODE), "\n";`,
      String.raw`<?php
// аварія: виключення про відсутню нотатку не перекладено у відповідь
declare(strict_types=1);

final class NotFoundException extends RuntimeException {}

final class NoteRepository
{
    private array $notes = [1 => ['id' => 1, 'title' => 'Купити хліб']];

    public function find(int $id): array
    {
        return $this->notes[$id] ?? throw new NotFoundException("Нотатки $id немає");
    }
}

$repo = new NoteRepository();
echo $repo->find(1)['title'], "\n";
echo $repo->find(2)['title'], "\n";`,
    ],
    note: "API нотаток складається з маршрутизатора, контролера, сервісу й репозиторію в пам'яті. Помилки подаються виключеннями власних класів, а контролер перекладає їх у статуси 404 і 422. Перед json_encode списку викликайте array_values.",
    work: "Так влаштовано кожен REST-сервіс: Laravel і Symfony мають власні маршрутизатори, контролери й обробники виключень, що повертають 404 чи 422. Репозиторій у пам'яті дозволяє тестувати API без вебсервера й бази.",
    tasks: [
      "Чому контролер ловить виключення NotFoundException і перекладає його в статус 404, а не сервіс?",
      "Чому після unset елемента масиву json_encode може віддати об'єкт замість списку?",
    ],
  },
  {
    t: "Проєкт: конвеєр обробки даних на генераторах",
    ch: "Проєкти",
    easy: "Конвеєр на заводі: деталь рухається стрічкою від верстата до верстата, і кожен верстат бере по одній деталі. Склад не забивається заготовками, а брак зупиняє лише свою деталь.",
    p: [
      "У проєкті ми оброблятимемо журнал продажів: рядки CSV, серед яких трапляються зіпсовані. Треба розібрати рядки, відкинути брак, порахувати суми й виводити їх групами. Якби такий журнал мав мільйон рядків, масив на кожному етапі з'їв би пам'ять. Генератори дають ту саму логіку, але по одному елементу за раз.",
      "Модель у голові: кожен етап це функція, що приймає <code>iterable</code> і повертає <code>Generator</code>. Етапи вкладаються: <code>batch(valid(parse(lines($text))))</code>. Кінцевий <code>foreach</code> тягне значення, і кожен рядок проходить усі верстати, перш ніж почнеться наступний. Нічого не обчислюється, поки хтось не попросить наступне значення.",
      "Типові етапи: <b>джерело</b> віддає сирі рядки (<code>yield $i + 1 =&gt; $line</code>, ключ це номер рядка), <b>розбір</b> перетворює рядок на запис через <code>str_getcsv</code>, <b>фільтр</b> відкидає брак, <b>пакування</b> збирає записи в групи по <code>N</code> і віддає групу, коли вона повна, плюс остачу в кінці. Делегувати іншому генератору можна через <code>yield from</code>.",
      "Пастки. Генератор одноразовий: після завершення його не можна обійти вдруге, виключення «Cannot traverse an already closed generator». Якщо дані потрібні двічі, зберіть їх у масив або створіть генератор заново. Друга: <code>iterator_to_array</code> за замовчуванням зберігає ключі, тож однакові ключі від різних джерел перезаписують один одного. Передайте <code>false</code>, коли потрібен список. Третя: ліниві етапи відкладають помилки, і збій у розборі виникне не там, де ви склали ланцюжок.",
      "Обробку браку проєктують свідомо. Виключення всередині генератора обриває його, тож для окремого поганого рядка кращий інший шлях: <b>лічильник помилок</b> у спільному об'єкті або запис із полем <code>error</code>. Тоді конвеєр продовжує роботу, а звіт у кінці показує, скільки й які рядки пропущено. Критичні помилки, як недоступне джерело, лишайте виключеннями.",
      "Ідіоми. Давайте етапам короткі імена й типи <code>iterable</code> на вході, <code>Generator</code> на виході. Тестуйте кожен етап окремо на масиві, а не на файлі. Не змішуйте виведення з обробкою: <code>echo</code> лише на краю. Одну й ту саму стрічку джерела можна змінити без правок решти: масив у тесті, файл на сервері, відповідь API в проді.",
      "Конвеєр показує, чому генератори це інструмент проєктування, а не лише синтаксис. Наступний проєкт, кеш із TTL, повертає нас до класів, але додає нову залежність: час. Щоб перевіряти його без очікування, годинник теж стане залежністю, яку можна підмінити.",
    ],
    code: [
      String.raw`<?php
function lines(string $text): Generator
{
    foreach (explode("\n", $text) as $i => $line) {
        yield $i + 1 => $line;
    }
}

$log = "apple,3\npear,5\nplum,2";
foreach (lines($log) as $n => $line) {
    echo $n, ': ', $line, "\n";
}`,
      String.raw`<?php
declare(strict_types=1);

function lines(string $text): Generator
{
    foreach (explode("\n", $text) as $i => $line) {
        yield $i + 1 => $line;
    }
}

function parse(iterable $lines): Generator
{
    foreach ($lines as $n => $line) {
        [$name, $qty] = array_pad(str_getcsv($line), 2, '');
        yield $n => ['name' => $name, 'qty' => $qty];
    }
}

function valid(iterable $rows): Generator
{
    foreach ($rows as $n => $row) {
        if ($row['name'] !== '' && ctype_digit($row['qty'])) {
            yield $n => ['name' => $row['name'], 'qty' => (int) $row['qty']];
        }
    }
}

$log = "apple,3\nbroken\npear,x\nplum,2\n,7";
$total = 0;
foreach (valid(parse(lines($log))) as $n => $row) {
    echo "$n: {$row['name']} x{$row['qty']}\n";
    $total += $row['qty'];
}
echo "Разом: $total\n";`,
      String.raw`<?php
declare(strict_types=1);

function batch(iterable $items, int $size): Generator
{
    $chunk = [];
    foreach ($items as $item) {
        $chunk[] = $item;
        if (count($chunk) === $size) {
            yield $chunk;
            $chunk = [];
        }
    }
    if ($chunk !== []) {
        yield $chunk;
    }
}

function numbers(): Generator
{
    for ($i = 1; $i <= 7; $i++) {
        yield $i;
    }
}

foreach (batch(numbers(), 3) as $group) {
    echo implode('+', $group), ' = ', array_sum($group), "\n";
}`,
      String.raw`<?php
// Поведінка, що дивує: ключі при yield from й iterator_to_array
function inner(): Generator
{
    yield 1;
    yield 2;
}

function outer(): Generator
{
    yield from inner();
    yield 3;
}

echo json_encode(iterator_to_array(outer())), "\n";        // ключі збіглися
echo json_encode(iterator_to_array(outer(), false)), "\n"; // список`,
      String.raw`<?php
// аварія: генератор одноразовий, повторний обхід неможливий
function numbers(): Generator
{
    yield 1;
    yield 2;
}

$gen = numbers();
foreach ($gen as $n) {
    echo $n, "\n";
}
foreach ($gen as $n) {
    echo $n, "\n";
}`,
    ],
    note: "Конвеєр складається з етапів-генераторів: джерело, розбір, фільтр, пакування. Кожен бере значення по одному, тож пам'ять не росте. Генератор одноразовий, а iterator_to_array з ключами може втратити значення, тому передавайте false.",
    work: "Імпорт великих CSV, обробка логів і вивантаження з бази в пакетах працюють саме так: рядок за рядком через ланцюжок етапів. Бібліотеки на кшталт league/csv і пакетні завдання в Laravel користуються тим самим принципом.",
    tasks: [
      "Чому ланцюжок генераторів не з'їдає пам'ять навіть на мільйоні рядків?",
      "Що станеться, якщо обійти той самий генератор двічі, і як цього уникнути?",
    ],
  },
  {
    t: "Проєкт: кеш із TTL",
    ch: "Проєкти",
    adv: true,
    easy: "Молоко в холодильнику має термін придатності. Відкриваєте пакет, дивитеся на дату, і якщо вона минула, викидаєте й купуєте нове. Кеш із TTL робить так само: кожен запис має власну дату, а перевіряють його лише при відкритті.",
    p: [
      "Кеш зберігає результат дорогого обчислення, щоб не повторювати його. Але значення старіють, тому кожному записові дають <b>TTL</b> (time to live), тобто скільки секунд він вважається свіжим. У проєкті ми напишемо кеш у пам'яті з перевіркою терміну, методом <code>remember</code> і обмеженням розміру, а все перевіримо власними тестами.",
      "Головна проєктна ідея: <b>час це залежність</b>. Якщо кеш сам викликає <code>time()</code>, тест мусить спати, щоб запис застарів. Тому вводимо інтерфейс <code>Clock</code> з методом <code>now(): int</code>. Реальна реалізація повертає <code>time()</code>, а у тестах стоїть <code>FakeClock</code>, який рухають вручну методом <code>advance(60)</code>. Тести стають миттєвими й детермінованими.",
      "Записи зберігаємо як <code>[значення, час_закінчення]</code>. Перевірку виконуємо <b>ліниво</b>, під час читання: якщо <code>now() &gt;= expiresAt</code>, запис видаляємо й повідомляємо про промах. Окремого фонового очищення не потрібно. Метод <code>remember($key, $ttl, $producer)</code> повертає збережене значення або викликає функцію, зберігає результат і повертає його: це найчастіший спосіб користуватися кешем.",
      "Пастка номер один: <code>get</code> повертає <code>null</code> і для відсутнього, і для збереженого <code>null</code>. Розрізняйте їх методом <code>has</code> або внутрішнім маркером у масиві запису, а не лише перевіркою значення. Друга: <code>isset($data[$key])</code> дає <code>false</code> для запису зі значенням <code>null</code>, тоді як <code>array_key_exists</code> відповідає чесно. Третя: TTL нуль чи від'ємний це помилка виклику, і її краще відхилити виключенням <code>InvalidArgumentException</code>, ніж мовчки зберегти запис, що застаріє миттєво.",
      "Обмеження розміру потрібне, бо без нього кеш росте безкінечно. Проста політика це <b>LRU</b> (least recently used): при читанні запис переносять у кінець, а при переповненні видаляють перший. У PHP масив зберігає порядок вставки, тож «перенести в кінець» означає <code>unset</code> і повторне присвоєння, а «перший» дає <code>array_key_first</code>. Складність незначна, а поведінка відповідає очікуванням.",
      "Ідіоми. Дрібні тести без фреймворку: функція <code>check(string $name, bool $ok)</code> друкує <code>ok</code> або <code>FAIL</code>, а підсумок показує кількість збоїв. Кожна поведінка отримує окремий тест: свіжий запис, прострочений, <code>remember</code> викликає функцію один раз, переповнення видаляє давній запис. Статистику (хіти й промахи) тримайте в самому кеші, вона допомагає налаштовувати TTL.",
      "Кеш добре показує, як годинник, класи, виключення й тести працюють разом. Останній проєкт використає той самий прийом: обмежувач частоти запитів теж залежить від часу, і перевірити його можна лише з підмінним годинником.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

interface Clock
{
    public function now(): int;
}

final class FakeClock implements Clock
{
    public function __construct(private int $time = 0) {}

    public function now(): int
    {
        return $this->time;
    }

    public function advance(int $seconds): void
    {
        $this->time += $seconds;
    }
}

final class TtlCache
{
    private array $data = [];

    public function __construct(private Clock $clock) {}

    public function set(string $key, mixed $value, int $ttl): void
    {
        $this->data[$key] = [$value, $this->clock->now() + $ttl];
    }

    public function get(string $key, mixed $default = null): mixed
    {
        if (!array_key_exists($key, $this->data)) {
            return $default;
        }
        [$value, $expiresAt] = $this->data[$key];
        if ($this->clock->now() >= $expiresAt) {
            unset($this->data[$key]);
            return $default;
        }
        return $value;
    }
}

$clock = new FakeClock();
$cache = new TtlCache($clock);
$cache->set('rate', 41, 60);
echo $cache->get('rate', 'немає'), "\n";
$clock->advance(59);
echo $cache->get('rate', 'немає'), "\n";
$clock->advance(1);
echo $cache->get('rate', 'немає'), "\n";`,
      String.raw`<?php
// Поведінка, що дивує: null у кеші й isset
$data = ['empty' => [null, 100]];

echo isset($data['empty'][0]) ? 'isset: є' : 'isset: немає', "\n";
echo array_key_exists('empty', $data) ? 'ключ: є' : 'ключ: немає', "\n";

function get(array $data, string $key, mixed $default = null): mixed
{
    return $data[$key][0] ?? $default;
}

var_dump(get($data, 'empty', 'типове'));   // збережений null зник
var_dump(get($data, 'missing', 'типове'));`,
      String.raw`<?php
declare(strict_types=1);

final class Counter
{
    public int $calls = 0;
}

final class MiniCache
{
    private array $data = [];
    private int $now = 0;

    public function tick(int $seconds): void
    {
        $this->now += $seconds;
    }

    public function remember(string $key, int $ttl, callable $producer): mixed
    {
        if (isset($this->data[$key]) && $this->now < $this->data[$key][1]) {
            return $this->data[$key][0];
        }
        $value = $producer();
        $this->data[$key] = [$value, $this->now + $ttl];
        return $value;
    }
}

$counter = new Counter();
$cache = new MiniCache();
$load = function () use ($counter): string {
    $counter->calls++;
    return 'дорогий результат';
};

echo $cache->remember('report', 30, $load), "\n";
echo $cache->remember('report', 30, $load), "\n";
$cache->tick(30);
echo $cache->remember('report', 30, $load), "\n";
echo 'Викликів: ', $counter->calls, "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class LruCache
{
    private array $data = [];

    public function __construct(private int $max) {}

    public function set(string $key, mixed $value): void
    {
        unset($this->data[$key]);
        $this->data[$key] = $value;
        if (count($this->data) > $this->max) {
            unset($this->data[array_key_first($this->data)]);
        }
    }

    public function get(string $key): mixed
    {
        if (!array_key_exists($key, $this->data)) {
            return null;
        }
        $value = $this->data[$key];
        unset($this->data[$key]);
        $this->data[$key] = $value;
        return $value;
    }

    public function keys(): array
    {
        return array_keys($this->data);
    }
}

$cache = new LruCache(2);
$cache->set('a', 1);
$cache->set('b', 2);
$cache->get('a');
$cache->set('c', 3);
echo implode(',', $cache->keys()), "\n";`,
      String.raw`<?php
// аварія: нульовий TTL відхилено виключенням, яке ніхто не ловить
declare(strict_types=1);

final class TtlCache
{
    private array $data = [];

    public function set(string $key, mixed $value, int $ttl): void
    {
        if ($ttl <= 0) {
            throw new InvalidArgumentException('TTL має бути додатним');
        }
        $this->data[$key] = $value;
    }
}

$cache = new TtlCache();
$cache->set('ok', 1, 60);
echo "Перший запис є\n";
$cache->set('bad', 2, 0);
echo "Сюди не дійдемо\n";`,
    ],
    note: "Кеш із TTL зберігає значення разом із часом закінчення й перевіряє його ліниво під час читання. Час вводять інтерфейсом Clock, щоб у тестах підмінити його. Розрізняйте відсутній ключ і збережений null, а розмір обмежуйте політикою LRU.",
    work: "Кеш відповідей API, результатів запитів до бази й обчислених звітів є у кожному продакшен-застосунку. Інтерфейси кешу (PSR-6, PSR-16) і драйвери Redis та Memcached мають ті самі ідеї: ключ, значення, TTL.",
    tasks: [
      "Чому годинник краще передавати кешу як залежність, а не викликати time() усередині?",
      "Чим array_key_exists надійніший за isset, коли в кеші може лежати значення null?",
    ],
  },
  {
    t: "Проєкт: rate limiter і підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Обмежувач як охоронець біля дверей клубу: за годину пропускає не більше сотні гостей. Одні рахують усіх від початку години, інші дивляться, скільки зайшло за останні шістдесят хвилин, а ще можна роздавати жетони, що поволі повертаються.",
    p: [
      "Rate limiter обмежує, скільки разів клієнт може виконати дію за період: спроб входу, запитів до API, листів. Без нього один скрипт здатен перевантажити сервіс або вгадувати паролі. У проєкті ми напишемо три алгоритми, які мають спільний інтерфейс, і перевіримо їх тестами з підмінним годинником із попереднього проєкту.",
      "Модель у голові: метод <code>attempt(string $key): bool</code> повертає <code>true</code>, якщо дію дозволено й зараховано, і <code>false</code>, якщо ліміт вичерпано. Клієнтів розрізняє ключ, наприклад IP чи ідентифікатор користувача, а стан кожного ключа живе в масиві. Годинник знову залежність: <code>Clock</code>, а в тестах <code>FakeClock</code>.",
      "<b>Фіксоване вікно</b>: час ділиться на відрізки по <code>N</code> секунд, у кожному лічильник. Індекс вікна це <code>intdiv($now, $window)</code>. Це просто й дешево, але має слабкість: на межі двох вікон клієнт може зробити повний ліміт наприкінці одного й повний на початку наступного, тобто вдвічі більше за норму за короткий час.",
      "<b>Ковзне вікно</b> тримає список часових міток запитів. Перед перевіркою старі мітки (старші за <code>now - window</code>) відкидають, і якщо лишилося менше за ліміт, додають нову. Це точніше, але пам'ять росте з ліміту. <b>Відро жетонів</b> (token bucket) тримає запас жетонів до ємності й поповнює його з часом, тож дозволяє короткі сплески, а середню швидкість обмежує. Цілі секунди роблять поповнення точним без чисел із плаваючою комою.",
      "Пастки. Перша: числа з плаваючою комою в часі й токенах накопичують похибки, тому тримайте секунди цілими. Друга: гонки в багатопотокових середовищах, бо два запити одночасно читають лічильник; у реальному вебі стан зберігають у Redis з атомарними операціями, а масив у пам'яті годиться лише для одного процесу. Третя: ключ клієнта з підробного заголовка легко обійти, тож довіряйте тільки перевіреним даним.",
      "Ідіоми. Обмежувач повертає і рішення, і додаткові дані для відповіді: скільки спроб лишилося й коли можна повторити, адже для 429 корисно віддати заголовок <code>Retry-After</code>. Виключення <code>TooManyRequestsException</code> зручно кидати з проміжного шару й перекладати в 429 на краю. Кожен алгоритм перевіряйте тестами на межі: остання дозволена спроба, перша заборонена, момент після закінчення вікна.",
      "Це останній урок курсу, і він збирає все: класи й інтерфейси, виключення, генератори, масиви й рядки, тести, залежність від часу. Ви пройшли шлях від першого <code>echo</code> до шарової архітектури й проєктів. Далі корисно взяти фреймворк, Laravel чи Symfony, і впізнавати в ньому знайомі ідеї: контейнер, маршрути, середні шари, репозиторії, кеш і обмежувачі.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

final class FakeClock
{
    public function __construct(private int $time = 0) {}
    public function now(): int { return $this->time; }
    public function advance(int $seconds): void { $this->time += $seconds; }
}

final class FixedWindowLimiter
{
    private array $counts = [];

    public function __construct(private FakeClock $clock, private int $limit, private int $window) {}

    public function attempt(string $key): bool
    {
        $slot = intdiv($this->clock->now(), $this->window);
        $id = $key . '#' . $slot;
        $this->counts[$id] = ($this->counts[$id] ?? 0) + 1;
        return $this->counts[$id] <= $this->limit;
    }
}

$clock = new FakeClock();
$limiter = new FixedWindowLimiter($clock, 2, 10);
foreach ([0, 0, 0, 10] as $step) {
    $clock->advance($step);
    echo $limiter->attempt('ann') ? 'так' : 'ні', ' ';
}
echo "\n";`,
      String.raw`<?php
// Поведінка, що дивує: подвійний сплеск на межі фіксованих вікон
$limit = 3;
$window = 10;
$counts = [];
$allowed = 0;

foreach ([8, 9, 9, 10, 10, 10] as $t) {       // шість запитів за 3 секунди
    $slot = intdiv($t, $window);
    $counts[$slot] = ($counts[$slot] ?? 0) + 1;
    if ($counts[$slot] <= $limit) {
        $allowed++;
    }
}
echo "Дозволено $allowed із 6 за 3 секунди при ліміті $limit на $window\n";`,
      String.raw`<?php
declare(strict_types=1);

final class SlidingWindowLimiter
{
    private array $hits = [];

    public function __construct(private int $limit, private int $window) {}

    public function attempt(string $key, int $now): bool
    {
        $recent = array_filter(
            $this->hits[$key] ?? [],
            fn(int $t): bool => $t > $now - $this->window
        );
        if (count($recent) >= $this->limit) {
            $this->hits[$key] = array_values($recent);
            return false;
        }
        $recent[] = $now;
        $this->hits[$key] = array_values($recent);
        return true;
    }
}

$limiter = new SlidingWindowLimiter(3, 10);
foreach ([8, 9, 9, 10, 10, 10, 18, 19] as $t) {
    echo $t, ':', $limiter->attempt('ann', $t) ? 'так' : 'ні', ' ';
}
echo "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class TokenBucket
{
    private int $tokens;
    private int $last;

    public function __construct(private int $capacity, private int $interval, int $now)
    {
        $this->tokens = $capacity;
        $this->last = $now;
    }

    public function attempt(int $now): bool
    {
        $gained = intdiv($now - $this->last, $this->interval);
        if ($gained > 0) {
            $this->tokens = min($this->capacity, $this->tokens + $gained);
            $this->last += $gained * $this->interval;
        }
        if ($this->tokens === 0) {
            return false;
        }
        $this->tokens--;
        return true;
    }
}

$bucket = new TokenBucket(2, 5, 0);
foreach ([0, 1, 2, 5, 6, 10] as $t) {
    echo $t, ':', $bucket->attempt($t) ? 'так' : 'ні', ' ';
}
echo "\n";`,
      String.raw`<?php
// аварія: обмежувач кидає виключення, яке ніхто не перекладає в 429
declare(strict_types=1);

final class TooManyRequestsException extends RuntimeException {}

final class Guard
{
    private int $used = 0;

    public function __construct(private int $limit) {}

    public function check(): void
    {
        if (++$this->used > $this->limit) {
            throw new TooManyRequestsException('Забагато запитів');
        }
    }
}

$guard = new Guard(2);
for ($i = 1; $i <= 3; $i++) {
    $guard->check();
    echo "Запит $i дозволено\n";
}`,
    ],
    note: "Обмежувач частоти відповідає на attempt(key) так чи ні. Фіксоване вікно просте, але пропускає подвійний сплеск на межі, ковзне вікно точніше, відро жетонів дозволяє короткі сплески. Час подається залежністю, а тести рухають FakeClock.",
    work: "Ліміти застосовують до логіну, API, листів і завантажень: у Laravel це середній шар throttle, у хмарних API відповідь 429 з Retry-After. Продуктивні реалізації зберігають стан у Redis, а алгоритми лишаються такими ж.",
    tasks: [
      "Чому фіксоване вікно може пропустити вдвічі більше запитів на межі двох вікон?",
      "Чим відро жетонів відрізняється від ковзного вікна й що воно дозволяє?",
    ],
  },
];
