export const LESSONS_07a = [
  {
    t: "Функціональний стиль: композиція й чисті функції",
    ch: "Генератори, ітератори й Fibers",
    easy: "Чиста функція схожа на кухонний комбайн: поклали ті самі продукти й отримали той самий фарш, і нічого іншого на кухні не змінилось. Складаєш такі прилади в ланцюжок і маєш готову страву.",
    p: [
      "Звичайний код часто міняє все навколо: збільшує глобальний лічильник, дописує в масив, друкує. Тому результат функції залежить не лише від аргументів, а й від того, що було викликано раніше. Такі функції важко перевіряти й переносити. Функціональний стиль пропонує інший підхід: писати малі функції, що лише обчислюють значення, і з'єднувати їх у більші.",
      "Модель у голові: <b>чиста функція</b> задовольняє дві умови. Для тих самих аргументів вона завжди повертає те саме, а крім повернення, нічого не робить: не пише у файл, не змінює глобальні змінні, не друкує. Усе, що функції потрібно, приходить через параметри, усе, що вона дає, йде через <code>return</code>. Такі функції легко тестувати: подали вхід, порівняли вихід.",
      "Композиція це послідовне застосування: результат однієї функції стає входом наступної. У PHP це робить <code>array_map</code> (перетворити кожен елемент), <code>array_filter</code> (залишити потрібні) і <code>array_reduce</code> (звести масив до одного значення). Функції передають як значення: замикання <code>function ($x) { … }</code>, ім'я функції рядком або ім'я вбудованої на кшталт <code>'trim'</code>. Власну композицію пишуть як функцію, що приймає кілька функцій через <code>...$fns</code> і повертає нову, яка пропускає значення через усі по черзі.",
      "Масиви в PHP передаються за значенням, тому <code>array_map</code> не псує вхідний масив, а повертає новий. Це зручно для чистоти: джерело лишається недоторканим. Але пам'ятайте про гарантію: чистота тримається, лише коли ви самі її не порушуєте. Замикання, яке пише у змінну через <code>use (&amp;$total)</code>, знову перетворює функцію на брудну, і порядок викликів починає впливати на результат.",
      "Пастки. <code>array_filter</code> зберігає ключі: після відсіювання індекси можуть мати прогалини, і <code>json_encode</code> віддасть об'єкт замість масиву. Якщо потрібен список, огорніть результат у <code>array_values</code>. Другу пастку дає нестрогість: без <code>declare(strict_types=1)</code> рядок <code>\"5\"</code> мовчки стане числом 5, а <code>\"abc\"</code> лише тоді дасть <code>TypeError</code>. Типізовані параметри й суворі типи роблять контракт чистої функції відчутним.",
      "Ідіоми. Давайте функціям описові імена й не змішуйте обчислення з виводом: функція повертає рядок, а <code>echo</code> робить окремий шар на краю програми. Для <code>array_reduce</code> завжди вказуйте початкове значення третім аргументом, інакше для порожнього масиву отримаєте <code>null</code>. Ланцюжок із трьох-чотирьох маленьких кроків читається краще за один цикл із вкладеними умовами.",
      "Проте <code>array_map</code> і <code>array_filter</code> працюють із масивами, тобто тримають усі дані в пам'яті одразу, а кожен крок будує новий масив. Для великих або нескінченних потоків це дороге. Далі ми розберемо, як PHP обходить колекцію по одному елементу: спершу інтерфейс <code>Iterator</code>, а потім генератори, які дадуть ті самі ланцюжки без проміжних масивів.",
    ],
    code: [
      String.raw`<?php
// Чиста функція: результат залежить лише від аргументів
function withTax(int $price, int $percent): int
{
    return $price + intdiv($price * $percent, 100);
}

// Брудна функція: змінює стан поза собою
$calls = 0;
function withTaxCounted(int $price): int
{
    global $calls;
    $calls++;
    return $price + intdiv($price * 20, 100);
}

echo withTax(1000, 20), " ", withTax(1000, 20), "\n";
echo withTaxCounted(1000), " ", withTaxCounted(1000), " викликів: $calls\n";`,
      String.raw`<?php
$prices = [120, 45, 300, 80, 15];

$cheap = array_filter($prices, function (int $p): bool {
    return $p < 100;
});
echo json_encode($cheap), "\n";               // ключі збережено: об'єкт
echo json_encode(array_values($cheap)), "\n"; // список

$total = array_reduce(
    array_map(function (int $p): int { return $p * 2; }, $prices),
    function (int $sum, int $p): int { return $sum + $p; },
    0
);
echo "Разом: $total\n";`,
      String.raw`<?php
function compose(callable ...$fns): callable
{
    return function ($value) use ($fns) {
        foreach ($fns as $fn) {
            $value = $fn($value);
        }
        return $value;
    };
}

$slug = compose(
    'trim',
    'mb_strtolower',
    function (string $s): string { return preg_replace('/\s+/', '-', $s); },
);

echo $slug("  Hello Big World  "), "\n";
echo $slug("  PHP   Generators "), "\n";`,
      String.raw`<?php
// аварія: у суворому режимі рядок замість int дає TypeError
declare(strict_types=1);

function double(int $x): int
{
    return $x * 2;
}

echo double(21), "\n";
echo double("5"), "\n";`,
    ],
    note: "Чиста функція залежить лише від аргументів і нічого не змінює поза собою. Складайте малі функції через <code>array_map</code>, <code>array_filter</code>, <code>array_reduce</code>, пам'ятаючи, що <code>array_filter</code> зберігає ключі, а <code>array_reduce</code> потребує початкового значення.",
    work: "У застосунках так рахують підсумки замовлення, форматують назви, чистять і нормалізують вхідні дані. Дрібні чисті функції легко покрити тестами, а в колекціях Laravel те саме читається як ланцюжок викликів map, filter, reduce.",
    tasks: [
      "Які дві умови робить функцію чистою?",
      "Чому після array_filter варто викликати array_values, коли потрібен список?",
    ],
  },
  {
    t: "Ітератори: інтерфейс Iterator і foreach",
    ch: "Генератори, ітератори й Fibers",
    easy: "Ітератор схожий на закладку в книзі: книга лежить у шафі, а закладка знає, яка сторінка зараз, уміє перейти до наступної й сказати, що сторінки закінчились. Читати можна й чужу книгу.",
    p: [
      "Цикл <code>foreach</code> звично працює з масивами, але вміє обходити й об'єкти. Нам цього мало: хочеться, щоб власний клас, наприклад черга завдань чи сторінки відповіді API, обходився в <code>foreach</code> так само природно, як масив, і при цьому не мусив одразу віддавати всі дані.",
      "Модель у голові: <code>foreach</code> не знає, що за колекція перед ним, а лише ставить їй п'ять запитань. Для цього існує інтерфейс <code>Iterator</code>, що вимагає методів <code>rewind()</code> (стати на початок), <code>valid()</code> (чи є поточний елемент), <code>current()</code> (значення), <code>key()</code> (ключ) і <code>next()</code> (перейти далі). Об'єкт сам зберігає позицію, тому його й називають ітератором.",
      "Порядок викликів незмінний. На початку циклу <code>foreach</code> викликає <code>rewind()</code>, потім перед кожним кроком <code>valid()</code>; якщо там <code>true</code>, бере <code>current()</code> і <code>key()</code>, виконує тіло циклу, а після нього викликає <code>next()</code>. Коли <code>valid()</code> повертає <code>false</code>, цикл завершується. Якщо вставити в кожен метод <code>echo</code>, цю послідовність видно наочно, і вона допомагає зрозуміти, чому позицію не можна ховати поза об'єктом.",
      "Типи методів мають збігатися з інтерфейсом: <code>current(): mixed</code>, <code>key(): mixed</code>, <code>next(): void</code>, <code>rewind(): void</code>, <code>valid(): bool</code>. Починаючи з PHP 8.1, відсутні або несумісні типи дають <i>Deprecated</i>, а у функціях із <code>declare(strict_types=1)</code> неправильне значення, що повертається, перетворюється на <code>TypeError</code>. Сам <code>Iterator</code> успадковує <code>Traversable</code>, а під нього підпадають і масиви-обгортки вроді <code>ArrayIterator</code>.",
      "Пастки. Найчастіша: забути скинути позицію в <code>rewind()</code>, і другий <code>foreach</code> по тому ж об'єкту нічого не виведе. Друга: у <code>valid()</code> перевіряти не те, що треба, наприклад порівняння <code>if ($this-&gt;pos)</code> нестрого вважає позицію 0 «хибною». Пишіть явні умови зі строгим порівнянням. І не плутайте ітератор із масивом: <code>count()</code> до нього без інтерфейсу <code>Countable</code> не застосуєш, а до елемента за індексом <code>[]</code> не звернешся.",
      "Ідіоми. Зберігайте у властивостях лише позицію й дані (або джерело), а обчислюйте значення в <code>current()</code>. Один об'єкт-ітератор вміє обходити тільки одну позицію одночасно, тож для двох незалежних обходів знадобиться два об'єкти. Готові ітератори, як <code>ArrayIterator</code>, вже є в стандартній бібліотеці SPL, ми побачимо їх згодом.",
      "Писати п'ять методів заради простого обходу виснажливо, а стан легко зіпсувати. Тому в PHP є коротший шлях: функція з ключовим словом <code>yield</code> сама стає ітератором, і PHP пише ці п'ять методів за вас. Це генератори, наступна тема.",
    ],
    code: [
      String.raw`<?php
class Countdown implements Iterator
{
    private int $current;

    public function __construct(private int $from) {
        $this->current = $from;
    }

    public function rewind(): void { $this->current = $this->from; }
    public function valid(): bool { return $this->current > 0; }
    public function current(): mixed { return $this->current; }
    public function key(): mixed { return $this->from - $this->current; }
    public function next(): void { $this->current--; }
}

foreach (new Countdown(3) as $k => $v) {
    echo "$k => $v\n";
}
echo "Пуск!\n";`,
      String.raw`<?php
class Trace implements Iterator
{
    private int $i = 0;

    public function __construct(private array $items) {}

    public function rewind(): void { echo "rewind\n"; $this->i = 0; }
    public function valid(): bool { echo "valid\n"; return $this->i < count($this->items); }
    public function current(): mixed { echo "current\n"; return $this->items[$this->i]; }
    public function key(): mixed { echo "key\n"; return $this->i; }
    public function next(): void { echo "next\n"; $this->i++; }
}

foreach (new Trace(['a', 'b']) as $k => $v) {
    echo "-- тіло: $k=$v\n";
}`,
      String.raw`<?php
class Page implements Iterator
{
    private int $i = 0;

    public function __construct(private array $rows) {}

    public function rewind(): void { $this->i = 0; }
    public function valid(): bool { return isset($this->rows[$this->i]); }
    public function current(): mixed { return $this->rows[$this->i]; }
    public function key(): mixed { return $this->i; }
    public function next(): void { $this->i++; }
}

$page = new Page(["Оля", "Іван", "Марта"]);
echo implode(", ", iterator_to_array($page)), "\n";
echo "Елементів: ", iterator_count($page), "\n";
var_dump($page instanceof Traversable);`,
      String.raw`<?php
// аварія: у суворому режимі current() повертає рядок замість int
declare(strict_types=1);

class Nums implements Iterator
{
    private int $i = 0;

    public function rewind(): void { $this->i = 0; }
    public function valid(): bool { return $this->i < 2; }
    public function current(): int { return "число " . $this->i; }
    public function key(): int { return $this->i; }
    public function next(): void { $this->i++; }
}

foreach (new Nums() as $n) {
    echo $n, "\n";
}`,
    ],
    note: "<code>foreach</code> викликає <code>rewind</code>, потім для кожного кроку <code>valid</code>, <code>current</code>, <code>key</code>, а після тіла <code>next</code>. Позицію зберігає сам об'єкт, тому <code>rewind</code> обов'язково скидає її, а типи методів мають збігатися з інтерфейсом.",
    work: "Власні ітератори пишуть для обходу сторінок API, курсорів бази даних, рядків великого файлу й колекцій у бібліотеках. Обхід лишається звичним foreach, а справжня робота з даними ховається всередині класу.",
    tasks: [
      "У якому порядку foreach викликає методи інтерфейсу Iterator?",
      "Чому rewind мусить скидати позицію, коли об'єкт обходять двічі?",
    ],
  },
  {
    t: "Генератори: yield",
    ch: "Генератори, ітератори й Fibers",
    easy: "Генератор це кухар, який готує наступну страву лише тоді, коли гість попросив. Він не накриває на стіл одразу всіма блюдами, а видає порцію, ставить роботу на паузу й чекає нового запиту.",
    p: [
      "Клас-ітератор потребує п'яти методів і змінних для позиції, хоча за суттю вам потрібен простий цикл, який видає значення по одному. Генератор дозволяє написати саме цей цикл. Функція, у тілі якої є слово <code>yield</code>, не виконується одразу: виклик лише створює об'єкт класу <code>Generator</code>, а ця штука вже реалізує <code>Iterator</code>.",
      "Модель у голові: виконання функції ставлять на паузу. Коли <code>foreach</code> просить перший елемент, PHP запускає тіло до першого <code>yield</code>, віддає значення й завмирає, зберігаючи локальні змінні та місце в коді. Коли цикл просить наступний, тіло продовжується з того ж місця до наступного <code>yield</code>. Коли функція доходить до кінця, обхід завершується. Звідси слово «ліниве»: робота виконується лише на запит.",
      "Головний виграш у пам'яті. Функція, що будує масив з мільйона рядків, тримає всі мільйон у пам'яті. Генератор тримає лише поточний рядок. Крім того, перше значення з'являється одразу, ще до того, як обчислено решту. Це легко побачити, якщо вставити <code>echo</code> у функцію: повідомлення генератора й тіла циклу чергуються.",
      "Обхід генератора й коротший за клас, і суворіший: це одноразовий потік. Після завершення, а також після початку обходу, повернутись назад не можна. Повторний <code>foreach</code> по уже завершеному генератору кидає виняток <code>Exception</code> із текстом про закритий генератор. Якщо потрібен другий прохід, викликайте генератор-функцію знову й отримуйте новий об'єкт.",
      "Пастки. Виклик <code>gen()</code> без <code>foreach</code> нічого не виконує: у тілі не з'явиться жодного побічного ефекту, поки його не почнуть читати. Ще одна: генератор не можна передати туди, де чекають масив. <code>count($gen)</code> чи <code>$gen[0]</code> дадуть помилку типу, а <code>array_map</code> не прийме його взагалі. Щоб отримати масив, є <code>iterator_to_array()</code>, але це знову витрата пам'яті на все одразу.",
      "Ідіоми. Тип повернення генератор-функції оголошують як <code>Generator</code> або ширше <code>iterable</code>, і це вказує читачеві, що значення йдуть потоком. У PHP немає окремого слова для оголошення генератора: його визнають лише за наявністю <code>yield</code>. Якщо в тілі є й <code>return</code>, воно просто закриває потік. Читання великого файлу, пагінація й перебір даних, що надходять з мережі, ідеальні кандидати.",
      "Поки що ми віддавали лише значення, а ключі PHP нумерував сам: 0, 1, 2. Наступний урок про те, як самим призначати ключі, і про <code>yield from</code>, що дозволяє делегувати частину роботи іншому генератору чи масиву.",
    ],
    code: [
      String.raw`<?php
function countTo(int $n): Generator
{
    for ($i = 1; $i <= $n; $i++) {
        yield $i;
    }
}

foreach (countTo(4) as $num) {
    echo $num, " ";
}
echo "\n";
var_dump(countTo(2) instanceof Iterator);`,
      String.raw`<?php
function noisy(): Generator
{
    echo "старт\n";
    yield "A";
    echo "після A\n";
    yield "B";
    echo "кінець\n";
}

$gen = noisy();          // нічого не друкує: тіло ще не запускалось
echo "створено\n";
foreach ($gen as $v) {
    echo "отримали $v\n";
}`,
      String.raw`<?php
function lines(string $text): Generator
{
    foreach (explode("\n", $text) as $line) {
        $line = trim($line);
        if ($line !== '') {
            yield $line;
        }
    }
}

$log = "ok\n\nwarn\n  error  \n";
$n = 0;
foreach (lines($log) as $line) {
    $n++;
    echo "$n: $line\n";
}
echo implode("|", iterator_to_array(lines($log))), "\n";`,
      String.raw`<?php
// аварія: генератор вичерпано, другий foreach кидає Exception
function three(): Generator
{
    yield 1;
    yield 2;
    yield 3;
}

$g = three();
foreach ($g as $v) {
    echo $v, " ";
}
echo "\n";
foreach ($g as $v) {
    echo $v, " ";
}`,
    ],
    note: "Функція з <code>yield</code> повертає об'єкт <code>Generator</code> і виконується порціями: до чергового <code>yield</code>, потім пауза. Обхід одноразовий, повторний <code>foreach</code> по вичерпаному генератору кидає виняток, а масивних функцій до нього застосувати не можна.",
    work: "Генератори читають великі CSV, логи й вибірки з бази по одному рядку замість завантаження всього в пам'ять. Також вони годують експортери, імпортери та черги: першу порцію можна обробити ще до того, як прочитано решту.",
    tasks: [
      "Що відбувається в момент виклику генератор-функції, до початку foreach?",
      "Чому другий foreach по тому самому генератору завершується винятком?",
    ],
  },
  {
    t: "Ключі в генераторах і yield from",
    ch: "Генератори, ітератори й Fibers",
    easy: "Ключ у генераторі схожий на номерок у гардеробі: його можна видати самому, а можна довірити лічильнику. А <code>yield from</code> це коли адміністратор передає чергу іншому працівнику й просто пересилає його видачу далі.",
    p: [
      "У минулому уроці генератор видавав лише значення, а PHP сам нумерував їх із нуля. Але <code>foreach</code> уміє працювати й з ключами, тому генератор може віддавати пари: звичний запис для цього <code>yield $key =&gt; $value</code>. Так можна віддати рядки з їх номерами, імена полів зі значеннями або ідентифікатори записів.",
      "Модель у голові: кожен <code>yield</code> видає пару ключ-значення. Якщо ключ не вказано, PHP бере наступне ціле число після найбільшого цілого ключа, що вже був, як при додаванні до масиву. Явні ключі можуть бути будь-якого типу: рядки, числа, навіть масиви й об'єкти. Це більше, ніж дозволяє масив, і <code>foreach</code> приймає всі, але <code>iterator_to_array</code> потім змушена складати їх у масив і вже вимагає ключів-скалярів.",
      "Ще одна задача: генератор часто хочеться скласти з кількох. Без <code>yield from</code> довелося б писати вкладений <code>foreach</code> і для кожного елемента окремий <code>yield</code>. Запис <code>yield from $other</code> робить усе одним рядком: усі значення з масиву чи іншого генератора передаються назовні так, ніби ви віддали їх самі. Це і є делегування.",
      "Тут ховається відома пастка ключів. <code>yield from</code> зберігає ключі внутрішнього джерела, а не продовжує вашу нумерацію. Тому, склавши два масиви з ключами 0, 1, ви отримаєте ключі 0, 1, 0, 1. <code>foreach</code> нічого не втрачає, але <code>iterator_to_array($gen)</code> за замовчуванням зберігає ключі, і пізніші значення перезаписують ранні. Масив стає коротшим, ніж ви очікували, і жодного попередження не буде.",
      "Лікується це другим аргументом: <code>iterator_to_array($gen, false)</code> відкидає ключі й повертає звичайний список. Якщо ж ключі потрібні, робіть їх унікальними, наприклад додавайте префікс або використовуйте ідентифікатори записів. Не покладайтеся на те, що нумерація продовжиться після <code>yield from</code> сама.",
      "Ідіоми. Для асоціативних даних, як-от пари «поле-значення» з рядка конфігурації, <code>yield $name =&gt; $value</code> читається краще за побудову проміжного масиву. Для обходу дерева каталогів чи вкладених списків <code>yield from</code> зручно викликати рекурсивно: функція делегує підгілку самій собі. Це набагато коротше за ручні стеки.",
      "Тепер у нас є потік значень з ключами й засіб склеювати потоки. Наступний крок природний: ставити такі генератори ланцюжком, щоб один читав, другий фільтрував, а третій перетворював, і при цьому жоден не тримав усі дані. Це конвеєри.",
    ],
    code: [
      String.raw`<?php
function config(string $text): Generator
{
    foreach (explode(";", $text) as $pair) {
        [$name, $value] = explode("=", $pair);
        yield trim($name) => trim($value);
    }
}

foreach (config("host=localhost; port=3306; debug=on") as $name => $value) {
    echo "$name -> $value\n";
}`,
      String.raw`<?php
function gen(): Generator
{
    yield 'a' => 1;
    yield 2;      // наступний цілий ключ: 0
    yield 3;      // 1
    yield 'z' => 4;
    yield 5;      // 2
}

foreach (gen() as $k => $v) {
    echo "[$k] $v\n";
}`,
      String.raw`<?php
function letters(): Generator
{
    yield 'a';
    yield 'b';
}

function digits(): Generator
{
    yield 1;
    yield 2;
}

function all(): Generator
{
    yield from letters();
    yield from digits();
    yield from [10, 20];
}

// Поведінка, що дивує: ключі кожного джерела починаються з нуля
foreach (all() as $k => $v) {
    echo "$k:$v ";
}
echo "\n";
echo count(iterator_to_array(all())), " елементи зі збереженими ключами\n";
echo count(iterator_to_array(all(), false)), " елементів без ключів\n";`,
      String.raw`<?php
function walk(array $tree, string $path = ''): Generator
{
    foreach ($tree as $name => $child) {
        if (is_array($child)) {
            yield from walk($child, "$path$name/");
        } else {
            yield "$path$name" => $child;
        }
    }
}

$files = ['src' => ['a.php' => 10, 'lib' => ['b.php' => 20]], 'README' => 5];
foreach (walk($files) as $file => $size) {
    echo "$file ($size)\n";
}`,
      String.raw`<?php
// аварія: ключ-масив не можна покласти в масив через iterator_to_array
function pairs(): Generator
{
    yield [1, 2] => 'точка';
}

foreach (pairs() as $k => $v) {
    echo implode(",", $k), " => $v\n";
}
var_dump(iterator_to_array(pairs()));`,
    ],
    note: "<code>yield $k =&gt; $v</code> видає пару, без ключа PHP нумерує сам. <code>yield from</code> делегує масиву чи генератору й зберігає їхні ключі, тому <code>iterator_to_array</code> може перезаписати значення, а <code>iterator_to_array($g, false)</code> повертає список.",
    work: "У роботі yield from обходять вкладені структури: дерева каталогів, меню, категорії. А пари ключ-значення зручно віддавати, коли читаєш рядки конфігурації чи вирізаєш поля із записів, не будуючи проміжних масивів.",
    tasks: [
      "Який ключ отримає значення після yield без явного ключа?",
      "Чому iterator_to_array після yield from може повернути коротший масив, ніж очікували?",
    ],
  },
  {
    t: "Конвеєри на генераторах",
    ch: "Генератори, ітератори й Fibers",
    easy: "Конвеєр на заводі пропускає одну деталь за раз: одна ділянка миє, друга фарбує, третя пакує. Склад не засипаний напівфабрикатами, бо кожна деталь іде далі, щойно її торкнулася попередня ділянка.",
    p: [
      "Типова задача: взяти рядки журналу, лишити помилки, дістати з них час і показати перші десять. Через масивні функції це чотири проміжні масиви, кожен розміром із вхідні дані. Генератори вирішують це інакше: кожен крок пише як окрему функцію, що приймає потік і повертає новий потік.",
      "Модель у голові: кожна ланка конвеєра це генератор, який у <code>foreach</code> читає попередню ланку й віддає перероблені елементи. Нічого не виконується, поки хтось не почне читати останню ланку. Тоді вона тягне елемент із попередньої, та з наступної, і так до джерела. Виходить, що через увесь ланцюжок проходить один елемент за раз, а потім наступний, і в пам'яті живе лише поточний.",
      "Ланки пишуть однакового вигляду: <code>function filterBy(iterable $src, callable $f): Generator</code> з циклом <code>foreach ($src as $k =&gt; $v) { if ($f($v)) yield $k =&gt; $v; }</code>. Параметр типу <code>iterable</code> приймає і масив, і генератор, і будь-який <code>Traversable</code>, тож ланки сполучаються довільно. Ланцюжок складають вкладеними викликами або кроками через проміжні змінні: <code>$a = read(); $b = parse($a); $c = keep($b);</code>.",
      "Чергування стає видимим, якщо додати у кожну ланку <code>echo</code>. Для кожного елемента ви побачите «прочитано, відфільтровано, перетворено», потім наступний. Це ж пояснює, чому ранній вихід економить роботу: якщо споживач зупинився після третього елемента, решта джерела не читається зовсім. Масивні функції цього не вміють, вони завжди проходять усе.",
      "Пастки. По-перше, <code>array_map</code>, <code>array_filter</code> і <code>count</code> не приймають генератор: <code>TypeError</code> повідомить, що очікувався масив. Для потоків пишіть власні ланки або використовуйте SPL. По-друге, потік одноразовий: якщо результат конвеєра потрібен двічі, перша ланка вичерпається на першому проході. По-третє, ключі проходять наскрізь, тож після фільтра вони можуть мати діри, і це нормально, доки ви не зберете їх у масив.",
      "Ідіоми. Давайте ланкам короткі дієслівні назви: <code>lines</code>, <code>nonEmpty</code>, <code>parse</code>, <code>take</code>. Побічні дії, як-от запис чи вивід, залишайте на самому кінці у фінальному <code>foreach</code>. Це повертає нас до чистих функцій: кожна ланка залежить тільки від свого входу, її можна перевірити окремо, передавши звичайний масив.",
      "У всіх наших конвеєрах потік поки скінченний. А що, якщо джерело безкінечне, наприклад послідовність натуральних чисел чи рядки потоку, що ніколи не закривається? Генератор це дозволяє, і ліниві обчислення тут розкриваються повністю. Це тема наступного уроку.",
    ],
    code: [
      String.raw`<?php
function lines(string $text): Generator
{
    foreach (explode("\n", $text) as $line) {
        yield $line;
    }
}

function onlyErrors(iterable $src): Generator
{
    foreach ($src as $line) {
        if (str_starts_with($line, 'ERROR')) {
            yield $line;
        }
    }
}

function message(iterable $src): Generator
{
    foreach ($src as $line) {
        yield trim(substr($line, strlen('ERROR:')));
    }
}

$log = "INFO: старт\nERROR: диск повний\nINFO: ок\nERROR: немає зв'язку";
foreach (message(onlyErrors(lines($log))) as $m) {
    echo "- $m\n";
}`,
      String.raw`<?php
function source(): Generator
{
    foreach ([1, 2, 3, 4] as $n) {
        echo "читаємо $n\n";
        yield $n;
    }
}

function evens(iterable $src): Generator
{
    foreach ($src as $n) {
        if ($n % 2 === 0) {
            echo "парне $n\n";
            yield $n;
        }
    }
}

function squares(iterable $src): Generator
{
    foreach ($src as $n) {
        yield $n * $n;
    }
}

foreach (squares(evens(source())) as $s) {
    echo "результат $s\n";
}`,
      String.raw`<?php
function readRows(array $rows): Generator
{
    foreach ($rows as $row) {
        yield $row;
    }
}

function parse(iterable $rows): Generator
{
    foreach ($rows as $i => $row) {
        [$name, $price] = explode(";", $row);
        yield $i => ['name' => $name, 'price' => (int) $price];
    }
}

function expensive(iterable $items, int $min): Generator
{
    foreach ($items as $i => $item) {
        if ($item['price'] >= $min) {
            yield $i => $item;
        }
    }
}

$rows = ["чай;50", "кава;120", "вода;20", "сік;150"];
foreach (expensive(parse(readRows($rows)), 100) as $i => $item) {
    echo "рядок $i: {$item['name']} за {$item['price']}\n";
}`,
      String.raw`<?php
// аварія: array_filter не приймає генератор, лише масив
function numbers(): Generator
{
    yield 1;
    yield 2;
    yield 3;
}

$even = array_filter(numbers(), function (int $n): bool {
    return $n % 2 === 0;
});
echo count($even), "\n";`,
    ],
    note: "Конвеєр складається з генераторів, кожен із яких читає <code>iterable</code> й віддає перероблені елементи. Через усі ланки проходить один елемент за раз, а робота починається лише в момент читання. Масивні функції генератор не приймають.",
    work: "Так будують імпорт великих CSV і журналів: читаємо рядок, відкидаємо сміття, розбираємо, перевіряємо, зберігаємо. Пам'ять не росте разом із файлом, а помилку в рядку видно відразу, не чекаючи завершення всього завантаження.",
    tasks: [
      "У якому порядку проходять елементи через ланки конвеєра з генераторів?",
      "Чому array_filter не підходить для генератора, і що робити замість нього?",
    ],
  },
  {
    t: "Нескінченні генератори й ліниві обчислення",
    ch: "Генератори, ітератори й Fibers",
    easy: "Нескінченний генератор це кран, який може текти вічно: води в ньому завжди вдосталь. Ви ж набираєте лише склянку й закручуєте кран. Небезпечно тільки спробувати вмістити весь потік у відро.",
    p: [
      "Масив мусить бути скінченним: він займає пам'ять під кожен елемент. Генератор нічого наперед не зберігає, а лише знає правило отримання наступного значення. Тому він може описувати послідовності без кінця: натуральні числа, числа Фібоначчі, ідентифікатори, що ростуть, або події, які надходять без зупинки.",
      "Модель у голові: нескінченний генератор це цикл <code>while (true)</code> із <code>yield</code> усередині. Він ніколи не завершується сам, але це не завада, бо тіло виконується лише на запит. Хто керує обходом, той і вирішує, коли зупинитись: <code>break</code> у <code>foreach</code>, ліміт у споживачі або проміжна ланка, яка вчасно припиняє читати.",
      "Ліниві обчислення означають, що значення рахується в останній момент і лише якщо воно справді потрібне. Візьміть перші п'ять квадратів парних чисел: джерело видає 1, 2, 3, 4…, фільтр лишає парні, ланка квадратів перетворює, а обмежувач зупиняється після п'ятого. Жодне зайве число не обчислюється, і ви не знали наперед, скільки вхідних знадобиться.",
      "Обмежувач пишуть як звичайний генератор: рахує віддані елементи й виходить через <code>return</code>, щойно ліміт досягнуто. Важлива дрібниця: зупиняйтесь одразу після віддачі останнього потрібного, а не перед віддачею наступного. Інакше ви примусите джерело обчислити зайве значення, а якщо воно ще й видає побічний ефект, наприклад читає рядок, той прочитаний рядок буде втрачено.",
      "Пастки. <code>iterator_to_array</code>, <code>implode</code> чи звичайний <code>foreach</code> без <code>break</code> на нескінченному генераторі ніколи не закінчаться. Зазвичай програма впирається в обмеження пам'яті або часу й аварійно завершується. Так само <code>count</code> до потоку не застосуєш, бо кінця немає. Завжди перевіряйте: чи є в конвеєрі ланка, що гарантовано обмежить обсяг?",
      "Ідіоми. Нескінченні джерела пишуть окремо від логіки їх використання: <code>naturals()</code>, <code>fibonacci()</code>, <code>repeatValue($x)</code>. Ліміт вказують у споживачі через спільну ланку <code>take($n)</code>. Для цілком скінченних, але великих послідовностей підходить звичайний <code>range()</code> всередині <code>foreach</code>, проте він будує масив, а ось генератор лічильника не будує нічого.",
      "У нас уже є кілька ланок для конвеєрів, і писати їх щоразу вручну втомливо. У стандартній бібліотеці PHP є готові ітератори з обмеженням, фільтрацією й склеюванням. Далі ми познайомимось із ними, а також з інтерфейсом <code>IteratorAggregate</code>, що спрощує створення власних колекцій.",
    ],
    code: [
      String.raw`<?php
function naturals(int $from = 1): Generator
{
    while (true) {
        yield $from++;
    }
}

foreach (naturals() as $n) {
    if ($n > 5) {
        break;
    }
    echo $n, " ";
}
echo "\n";`,
      String.raw`<?php
function fibonacci(): Generator
{
    [$a, $b] = [0, 1];
    while (true) {
        yield $a;
        [$a, $b] = [$b, $a + $b];
    }
}

function take(iterable $src, int $n): Generator
{
    if ($n <= 0) {
        return;
    }
    foreach ($src as $k => $v) {
        yield $k => $v;
        if (--$n === 0) {
            return;
        }
    }
}

echo implode(", ", iterator_to_array(take(fibonacci(), 10), false)), "\n";`,
      String.raw`<?php
function naturals(): Generator
{
    $n = 1;
    while (true) {
        echo "[рахуємо $n]";
        yield $n++;
    }
}

function where(iterable $src, callable $f): Generator
{
    foreach ($src as $v) {
        if ($f($v)) {
            yield $v;
        }
    }
}

// перше число, що ділиться на 7 і більше за 20
foreach (where(naturals(), function (int $n): bool { return $n > 20 && $n % 7 === 0; }) as $found) {
    echo "\nзнайшли $found\n";
    break;
}`,
      String.raw`<?php
// аварія: від'ємний ліміт кидає необроблений виняток
function limit(iterable $src, int $n): Generator
{
    if ($n < 0) {
        throw new InvalidArgumentException("ліміт не може бути від'ємним: $n");
    }
    if ($n === 0) {
        return;
    }
    foreach ($src as $v) {
        yield $v;
        if (--$n === 0) {
            return;
        }
    }
}

function forever(): Generator
{
    while (true) {
        yield "x";
    }
}

echo implode("", iterator_to_array(limit(forever(), 3), false)), "\n";
echo implode("", iterator_to_array(limit(forever(), -1), false)), "\n";`,
    ],
    note: "Нескінченний генератор це <code>while (true)</code> із <code>yield</code>: він безпечний, бо працює на запит. Обмежте споживача через <code>break</code> чи ланку <code>take</code>. Без обмеження <code>iterator_to_array</code> чи <code>implode</code> не завершаться.",
    work: "Так пишуть генератори ідентифікаторів, лічильників повторних спроб, потоки подій і опитування стану. Споживач бере стільки значень, скільки йому треба, а розрахунок решти навіть не починається. Це дешево за пам'яттю й зручно для тестів: потік можна урізати до кількох елементів. Головне лише пам'ятати про умову зупинки у споживача, інакше цикл ніколи не завершиться, а програма зависне або вичерпає ліміт часу.",
    tasks: [
      "Чому нескінченний генератор не підвішує програму, поки його не читають до кінця?",
      "Що станеться, якщо викликати iterator_to_array на нескінченному генераторі без обмежувача?",
    ],
  },
  {
    t: "IteratorAggregate і SPL-ітератори",
    ch: "Генератори, ітератори й Fibers",
    easy: "IteratorAggregate це бібліотекар, який сам не читає вам книгу вголос, а видає читача: ось людина, яка пройде всі сторінки. SPL-ітератори це набір готових читачів: один пропускає сторінки, інший читає лише частину.",
    p: [
      "Ітератор, який ми писали вручну, поєднує дві ролі: він і колекція, і курсор. Через це одним об'єктом не обійти дані двічі одночасно, бо позиція одна. Для власних колекцій краще розділити ролі: колекція зберігає дані, а курсор створюється на кожен обхід окремо.",
      "Модель у голові: інтерфейс <code>IteratorAggregate</code> має один метод <code>getIterator(): Traversable</code>, який повертає новий ітератор. <code>foreach</code> бачить такий об'єкт, викликає цей метод і далі ходить по тому, що повернуто. Найпростіший спосіб написати <code>getIterator</code> це зробити його генератором: ставите <code>yield</code> у тілі, а тип повернення лишається <code>Traversable</code> або <code>Generator</code>. Кожен виклик створює свіжий генератор, тож колекцію можна обходити скільки завгодно разів.",
      "Альтернатива: повернути готовий ітератор зі стандартної бібліотеки SPL. Найвживаніший <code>ArrayIterator</code> обгортає масив. Він використовується, коли колекція тримає дані масивом, і вам треба лише віддати їх назовні: <code>return new ArrayIterator($this-&gt;items);</code>. Масив при цьому не копіюється одразу, а передається за значенням із відкладеним копіюванням.",
      "Решта SPL це обгортки-адаптери, які вміють стояти в ланцюжку. <code>LimitIterator($it, $offset, $count)</code> пропускає перші елементи й зупиняється після заданої кількості. <code>CallbackFilterIterator($it, $fn)</code> лишає елементи, для яких функція дала <code>true</code> (вона отримує значення, ключ і сам ітератор). Допоміжні функції <code>iterator_to_array</code> і <code>iterator_count</code> зводять результат до масиву чи числа. Усі вони приймають будь-який <code>Traversable</code>, зокрема й ваш агрегат.",
      "Пастки. Повернути з <code>getIterator</code> звичайний масив не можна: тип <code>Traversable</code> масив не задовольняє, і PHP кине <code>TypeError</code>. Обгорніть його в <code>ArrayIterator</code>. Далі, <code>LimitIterator</code> перемотує джерело на початку, тому для генератора, що вже почали читати, це спричинить виняток; обгортайте свіжий. І пам'ятайте, що <code>CallbackFilterIterator</code> зберігає ключі, як і <code>array_filter</code>.",
      "Ідіоми. Колекцію, яку читають у <code>foreach</code>, робіть <code>IteratorAggregate</code> з генератором усередині: це найкоротший код без проблем із одночасною позицією. Тип параметра для коду, що лише читає елементи, ставте <code>iterable</code> або <code>Traversable</code>, щоб приймати і масиви, і колекції. Для великих джерел віддавайте потік, а масив будуйте лише на самому краю.",
      "Тепер у нас є всі цеглини: генератори, агрегати й адаптери SPL. Лишилось упакувати їх у зручний власний клас із методами <code>map</code>, <code>filter</code> і <code>take</code>, що ланцюжком, як у Laravel, але з лінивим виконанням. Це збираємо в наступному уроці.",
    ],
    code: [
      String.raw`<?php
class Playlist implements IteratorAggregate
{
    private array $songs = [];

    public function add(string $title): static
    {
        $this->songs[] = $title;
        return $this;
    }

    public function getIterator(): Generator
    {
        foreach ($this->songs as $i => $title) {
            yield $i + 1 => $title;
        }
    }
}

$p = (new Playlist())->add("Intro")->add("Verse")->add("Outro");
foreach ($p as $n => $title) {
    echo "$n. $title\n";
}
foreach ($p as $n => $title) {   // знову: курсор новий
    echo $n;
}
echo "\n";`,
      String.raw`<?php
class Bag implements IteratorAggregate, Countable
{
    public function __construct(private array $items) {}

    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->items);
    }

    public function count(): int
    {
        return count($this->items);
    }
}

$bag = new Bag(['x' => 1, 'y' => 2, 'z' => 3]);
echo count($bag), " елементи\n";
foreach ($bag as $k => $v) {
    echo "$k=$v ";
}
echo "\n";
echo implode(",", array_keys(iterator_to_array($bag))), "\n";`,
      String.raw`<?php
$it = new ArrayIterator([5, 12, 7, 20, 3, 18, 40]);

$big = new CallbackFilterIterator($it, function (int $v, int $k): bool {
    return $v >= 10;
});
$firstTwo = new LimitIterator($big, 0, 2);

echo implode(", ", iterator_to_array($firstTwo, false)), "\n";
echo "Усього великих: ", iterator_count($big), "\n";

$window = new LimitIterator($it, 2, 3);
foreach ($window as $k => $v) {
    echo "[$k]=$v ";
}
echo "\n";`,
      String.raw`<?php
// аварія: getIterator повертає масив, а потрібен Traversable
class Broken implements IteratorAggregate
{
    public function __construct(private array $items) {}

    public function getIterator(): Traversable
    {
        return $this->items;
    }
}

foreach (new Broken([1, 2, 3]) as $v) {
    echo $v, "\n";
}`,
    ],
    note: "<code>IteratorAggregate</code> має один метод <code>getIterator(): Traversable</code>, який повертає свіжий ітератор, найчастіше генератор або <code>ArrayIterator</code>. Адаптери SPL, як <code>LimitIterator</code> і <code>CallbackFilterIterator</code>, обгортають будь-який Traversable.",
    work: "Колекції моделей, результати запитів і пакети даних у фреймворках реалізують IteratorAggregate, щоб працювати в foreach. Адаптери SPL використовують для пагінації, відсіювання й обмеження потоку без власних циклів. Користувач класу бачить лише звичайний foreach, а спосіб зберігання даних можна змінювати непомітно для нього, навіть переходячи від масиву до генератора.",
    tasks: [
      "Навіщо IteratorAggregate, якщо є Iterator?",
      "Чому getIterator не може повернути звичайний масив?",
    ],
  },
  {
    t: "Лінива колекція: map, filter і take",
    ch: "Генератори, ітератори й Fibers",
    easy: "Лінива колекція це список доручень, а не готова робота: ви пишете «помити, нарізати, взяти п'ять», і на кухні нічого не відбувається, поки не крикнули «подавай». Тоді все йде одразу й лише потрібне.",
    p: [
      "Збираємо досвід уроку в одну річ: власний клас із методами <code>map</code>, <code>filter</code> і <code>take</code>, що виконуються ліниво. Користувач пише ланцюжок викликів, як у звичних колекціях, а під капотом нічого не обчислюється, доки результат не попросять через <code>foreach</code> чи <code>toArray()</code>.",
      "Модель у голові: колекція це обгортка навколо джерела <code>iterable</code>. Кожен метод-перетворювач не змінює себе, а повертає <i>нову</i> колекцію, джерелом якої є генератор поверх попереднього джерела. Колекція реалізує <code>IteratorAggregate</code>, а її <code>getIterator()</code> віддає джерело. Отже, ланцюжок <code>from($data)-&gt;filter(...)-&gt;map(...)-&gt;take(3)</code> будує вкладені генератори, а не масиви.",
      "Конструктор роблять приватним, а створення через статичний <code>from(iterable $src)</code>. Метод <code>map(callable $f)</code> повертає <code>new static((function () use ($f) { foreach ($this-&gt;src as $k =&gt; $v) yield $k =&gt; $f($v); })())</code>: безіменна функція викликається одразу й віддає генератор. Аналогічно <code>filter</code> і <code>take</code>. Фінальний <code>toArray()</code> викликає <code>iterator_to_array($this-&gt;getIterator(), false)</code>.",
      "Незмінність тут важлива: кожен виклик створює новий об'єкт, тому можна тримати базову колекцію й будувати з неї різні гілки, не боячись побічних ефектів. Проте пастка в тому, що <i>джерело-генератор</i> одноразове. Якщо колекція зроблена зі свіжого генератора, перший обхід його вичерпає, а другий кине виняток. Лікується тим, що джерелом є масив або викликана функція, а не готовий генератор.",
      "Інша пастка стосується порядку кроків. <code>take</code> після <code>map</code> обчислить функцію лише для потрібних елементів, а <code>take</code> перед ним тим більше. Якщо ж помістити у <code>map</code> побічний ефект, на кшталт <code>echo</code>, видно, що він виконується порційно, а не на кожному елементі підряд. Для нескінченного джерела обов'язково поставте <code>take</code> до <code>toArray</code>, інакше програма не завершиться.",
      "Ідіоми. Не копіюйте методи Laravel Collection усі, а реалізуйте мінімум і додавайте за потреби: <code>map</code>, <code>filter</code>, <code>take</code>, <code>values</code>, <code>toArray</code>, <code>first</code>. Тип параметра <code>iterable</code> дозволяє будувати колекцію і з масиву, і з генератора, і з іншої колекції. Тримайте перетворювачі чистими, щоб ланцюжок можна було переставляти.",
      "Це завершує перший блок глави: ми пройшли шлях від чистих функцій і масивних перетворень до лінивих потоків і власної колекції. Далі розглянемо, як зберігати вже порахований результат, щоб не повторювати дорогі обчислення, і як відкладати їх до першого звернення.",
    ],
    code: [
      String.raw`<?php
final class Lazy implements IteratorAggregate
{
    private function __construct(private iterable $src) {}

    public static function from(iterable $src): static
    {
        return new static($src);
    }

    public function getIterator(): Traversable
    {
        yield from $this->src;
    }

    public function map(callable $f): static
    {
        $src = $this->src;
        return new static((function () use ($src, $f) {
            foreach ($src as $k => $v) {
                yield $k => $f($v);
            }
        })());
    }

    public function toArray(): array
    {
        return iterator_to_array($this->getIterator(), false);
    }
}

$names = Lazy::from(["оля", "іван"])->map('mb_strtoupper');
echo implode(", ", $names->toArray()), "\n";`,
      String.raw`<?php
final class Lazy implements IteratorAggregate
{
    private function __construct(private iterable $src) {}

    public static function from(iterable $src): static { return new static($src); }

    public function getIterator(): Traversable { yield from $this->src; }

    public function map(callable $f): static
    {
        $src = $this->src;
        return new static((function () use ($src, $f) {
            foreach ($src as $k => $v) { yield $k => $f($v); }
        })());
    }

    public function filter(callable $f): static
    {
        $src = $this->src;
        return new static((function () use ($src, $f) {
            foreach ($src as $k => $v) { if ($f($v)) { yield $k => $v; } }
        })());
    }

    public function take(int $n): static
    {
        $src = $this->src;
        return new static((function () use ($src, $n) {
            if ($n <= 0) { return; }
            foreach ($src as $k => $v) {
                yield $k => $v;
                if (--$n === 0) { return; }
            }
        })());
    }

    public function toArray(): array { return iterator_to_array($this->getIterator(), false); }
}

$result = Lazy::from([3, 8, 5, 12, 7, 20, 9])
    ->filter(function (int $n): bool { return $n > 4; })
    ->map(function (int $n): int { echo "(рахуємо $n)"; return $n * 10; })
    ->take(3)
    ->toArray();
echo "\n", implode(" ", $result), "\n";`,
      String.raw`<?php
final class Lazy implements IteratorAggregate
{
    private function __construct(private iterable $src) {}

    public static function from(iterable $src): static { return new static($src); }

    public function getIterator(): Traversable { yield from $this->src; }

    public function map(callable $f): static
    {
        $src = $this->src;
        return new static((function () use ($src, $f) {
            foreach ($src as $k => $v) { yield $k => $f($v); }
        })());
    }

    public function take(int $n): static
    {
        $src = $this->src;
        return new static((function () use ($src, $n) {
            if ($n <= 0) { return; }
            foreach ($src as $k => $v) {
                yield $k => $v;
                if (--$n === 0) { return; }
            }
        })());
    }

    public function toArray(): array { return iterator_to_array($this->getIterator(), false); }
}

function naturals(): Generator
{
    $n = 1;
    while (true) { yield $n++; }
}

$firstSquares = Lazy::from(naturals())
    ->map(function (int $n): int { return $n * $n; })
    ->take(6);
echo implode(", ", $firstSquares->toArray()), "\n";`,
      String.raw`<?php
// аварія: колекція зроблена з готового генератора, другий обхід неможливий
final class Lazy implements IteratorAggregate
{
    public function __construct(private iterable $src) {}

    public function getIterator(): Traversable { yield from $this->src; }

    public function toArray(): array { return iterator_to_array($this->getIterator(), false); }
}

function items(): Generator
{
    yield 1;
    yield 2;
}

$c = new Lazy(items());
echo count($c->toArray()), "\n";
echo count($c->toArray()), "\n";`,
    ],
    note: "Лінива колекція обгортає <code>iterable</code>, а кожен <code>map</code>, <code>filter</code> і <code>take</code> повертає нову колекцію з вкладеним генератором. Обчислення починаються лише в <code>toArray</code> чи <code>foreach</code>. Джерело-генератор одноразове, тому для повторних обходів тримайте масив.",
    work: "Таку абстракцію використовують в Laravel LazyCollection і подібних бібліотеках для обробки великих вибірок і файлів. Ланцюжок читається як звичайна колекція, а пам'ять не росте, бо елементи йдуть по одному.",
    tasks: [
      "Чому методи map, filter і take повертають нову колекцію, а не змінюють поточну?",
      "Коли саме в лінивій колекції виконується код функції з map?",
    ],
  },
];
