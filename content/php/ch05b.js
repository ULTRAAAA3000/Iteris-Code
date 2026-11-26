// Частина 05b курсу PHP: уроки 46–51
export const LESSONS_05b = [
  {
    t: "Stringable, Countable й ArrayAccess",
    ch: "Абстракція",
    easy: "Вбудовані інтерфейси схожі на універсальні роз'єми в побуті: підписав контракт, і об'єкт вмить підходить під <code>count()</code>, квадратні дужки чи рядкову конкатенацію, як звичайний масив або рядок.",
    p: [
      "Раніше ви писали власні інтерфейси, а PHP має й свої, які вбудовані в саму мову. Вони дозволяють об'єкту поводитися як рядок, як лічильний набір або як масив із квадратними дужками. Для коду, що користується таким об'єктом, різниці майже не видно, і це робить власні колекції дуже зручними.",
      "<code>Stringable</code> описує єдиний метод <code>__toString(): string</code>. Починаючи з PHP 8, будь-який клас, що має <code>__toString</code>, автоматично вважається реалізацією <code>Stringable</code>, навіть без слова <code>implements</code>. Тому тип параметра <code>string|Stringable</code> приймає і рядок, і об'єкт, який уміє перетворитися на рядок, а <code>instanceof Stringable</code> дає відповідь під час виконання.",
      "<code>Countable</code> вимагає метод <code>count(): int</code>. Після цього вбудована функція <code>count($obj)</code> викликає ваш метод і повертає його результат. Саме ви вирішуєте, що таке «кількість»: число елементів, рядків чи завершених кроків. Якщо ж передати у <code>count()</code> об'єкт без цього інтерфейсу, PHP 8 кине <code>TypeError</code>: раніше це давало тихе число 1, тож стара звичка тут шкодить.",
      "<code>ArrayAccess</code> складається з чотирьох методів: <code>offsetExists</code>, <code>offsetGet</code>, <code>offsetSet</code> і <code>offsetUnset</code>. Вони викликаються, коли ви пишете <code>isset($o['k'])</code>, <code>$o['k']</code>, <code>$o['k'] = 1</code> та <code>unset($o['k'])</code>. Запис без ключа, <code>$o[] = 1</code>, передає в <code>offsetSet</code> значення <code>null</code> замість ключа, тож цю гілку треба обробити окремо.",
      "Пастки. Сигнатури мають бути з типами: <code>offsetGet(mixed $offset): mixed</code>, <code>offsetSet(mixed $offset, mixed $value): void</code>, <code>count(): int</code>. Без них PHP 8.1 видає <code>Deprecated</code>. Об'єкт із <code>ArrayAccess</code> все одно не масив: <code>is_array</code> поверне <code>false</code>, а функції <code>array_map</code> чи <code>sort</code> його не приймуть. <code>isset</code> викликає лише <code>offsetExists</code>, а <code>empty</code> ще й <code>offsetGet</code>. Вкладений запис <code>$o['a']['b'] = 1</code> теж не працює як у масиві.",
      "Ідіоми. Зберігайте дані у приватному масиві й делегуйте йому всі операції. Замість «магії» перевіряйте ключі явно й кидайте виняток на відсутній ключ там, де це краще за мовчазний <code>null</code>. Три інтерфейси добре сполучаються в одній колекції: рядок для налагодження, кількість і доступ за ключем. Для обходу циклом <code>foreach</code> потрібен ще один інтерфейс, <code>IteratorAggregate</code>, його ви побачите пізніше.",
      "Ці інтерфейси роблять об'єкт схожим на вбудовані типи, але самі вони нічого не знають про те, що саме зберігається всередині. Наступний урок розповідає про замикання: об'єкти, які ховають у собі код і захоплені змінні. Їх можна передавати у функції як значення, і саме вони живлять колбеки колекцій.",
    ],
    code: [
      String.raw`<?php
class Money
{
    public function __construct(private int $cents) {}

    public function __toString(): string
    {
        return number_format($this->cents / 100, 2, ',', ' ') . " грн";
    }
}

function show(string|Stringable $value): void
{
    echo "Сума: ", $value, "\n";
}

$m = new Money(125050);
show($m);
show("нуль");
var_dump($m instanceof Stringable);
echo strlen((string) $m), "\n";`,
      String.raw`<?php
class Basket implements Countable
{
    private array $items = [];

    public function add(string $name, int $qty): void
    {
        $this->items[$name] = ($this->items[$name] ?? 0) + $qty;
    }

    public function count(): int
    {
        return array_sum($this->items);
    }
}

$b = new Basket();
$b->add("яблуко", 3);
$b->add("груша", 2);
$b->add("яблуко", 1);
echo count($b), "\n";
var_dump(count($b) > 5);`,
      String.raw`<?php
class Registry implements ArrayAccess, Countable
{
    private array $data = [];

    public function offsetExists(mixed $offset): bool
    {
        return isset($this->data[$offset]);
    }

    public function offsetGet(mixed $offset): mixed
    {
        return $this->data[$offset] ?? throw new OutOfBoundsException("Немає ключа $offset");
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        if ($offset === null) {
            $this->data[] = $value;
        } else {
            $this->data[$offset] = $value;
        }
    }

    public function offsetUnset(mixed $offset): void
    {
        unset($this->data[$offset]);
    }

    public function count(): int
    {
        return count($this->data);
    }
}

$r = new Registry();
$r["lang"] = "php";
$r[] = "перший";
$r[] = "другий";
echo $r["lang"], " ", $r[0], " ", $r[1], "\n";
var_dump(isset($r["lang"]), isset($r["x"]));
unset($r["lang"]);
echo count($r), "\n";
try {
    echo $r["lang"];
} catch (OutOfBoundsException $e) {
    echo "Помилка: ", $e->getMessage(), "\n";
}
var_dump(is_array($r));`,
      String.raw`<?php
// аварія: count() не приймає об'єкт, що не реалізує Countable (TypeError)
class Bag
{
    public array $items = [1, 2, 3];
}

$bag = new Bag();
echo "Рахуємо...\n";
echo count($bag), "\n";`,
    ],
    note: "Вбудовані інтерфейси підключають об'єкт до мови: <code>Stringable</code> для рядків, <code>Countable</code> для <code>count()</code>, <code>ArrayAccess</code> для квадратних дужок. Пишіть їхні методи з повними типами, інакше PHP 8.1 видасть Deprecated.",
    work: "Колекції в Laravel і Doctrine, об'єкти конфігурації та контейнери залежностей реалізують <code>ArrayAccess</code> і <code>Countable</code>, тому працюють як масиви: <code>$config['db']</code>, <code>count($collection)</code>. Value-об'єкти з <code>__toString</code> зручно підставляти в повідомлення журналу та шаблони.",
    tasks: [
      "Що зробить count() для об'єкта, який не реалізує Countable, у PHP 8?",
      "Який метод ArrayAccess викликається під час запису $o[] = 5 і що він отримає як ключ?",
    ],
  },
  {
    t: "Closure: bind, use і callable",
    ch: "Абстракція",
    easy: "Замикання схоже на записку з інструкцією, до якої степлером прикріплено кілька речей із вашої кишені. Куди б записку не віднесли, дії виконуються з тим набором, який ви взяли з собою.",
    p: [
      "Функцію можна зберегти в змінну й передати як звичайне значення. У PHP такою функцією-значенням є об'єкт класу <code>Closure</code>. Його створюють анонімною функцією: <code>function (int $x) { ... }</code> або короткою стрілкою <code>fn($x) =&gt; $x * 2</code>. Замикання передають у <code>array_map</code>, <code>usort</code>, у конструктор, повертають із функції.",
      "Ключове питання: звідки замикання бере зовнішні змінні. Анонімна функція не бачить змінних навколо себе сама, їх треба явно перелічити в <code>use ($a, $b)</code>. Вони захоплюються <i>за значенням</i> у момент створення: якщо потім змінити оригінал, замикання цього не помітить. Щоб бачити зміни, пишуть <code>use (&amp;$a)</code>, тоді передається посилання. Стрілка <code>fn</code> захоплює все потрібне автоматично, але теж за значенням, і складатися може лише з одного виразу.",
      "Слово <code>callable</code> позначає все, що можна викликати: замикання, ім'я функції рядком <code>'strlen'</code>, масив <code>[$obj, 'method']</code>, <code>['Class', 'staticMethod']</code> та об'єкти з методом <code>__invoke</code>. Перевірити можна через <code>is_callable</code>. Сучасніший запис, first-class callable, створює замикання з існуючої функції чи методу: <code>strlen(...)</code>, <code>$obj-&gt;method(...)</code>. Він коротший за рядки й масиви, і IDE його розуміє.",
      "Замикання в класі автоматично прив'язується до <code>$this</code>. Цю прив'язку змінюють методом <code>Closure::bind</code> або <code>bindTo</code>, а <code>call($obj, ...)</code> прив'язує й одразу викликає. Другий аргумент <code>bind</code> задає область видимості класу, і замикання отримує доступ до приватних властивостей чужого об'єкта. Так працюють тестові утиліти й гідратори, але в звичайному коді це зламує інкапсуляцію, тож вживайте цю силу обережно.",
      "Пастки. Захоплення за значенням дивує: змінна, змінена після створення замикання, у ньому лишається старою. Масив, захоплений за значенням, теж копіюється, тож додати до нього елемент усередині не вийде без посилання. Рядок-callable, якого не існує, дасть <code>Error</code> лише в момент виклику, а не під час створення. Статичне замикання <code>static function</code> не має <code>$this</code>, і <code>bindTo</code> з об'єктом для нього не спрацює.",
      "Ідіоми. Віддавайте перевагу <code>fn</code> для коротких перетворень і <code>function</code> з <code>use</code> там, де потрібна багатострокова логіка. Тип параметра <code>callable</code> або <code>Closure</code> описує, що саме ви очікуєте. Використання <code>strlen(...)</code> замість рядка <code>'strlen'</code> дає перевірку існування вже на етапі створення. Фабрики, що повертають замикання, створюють «налаштовані» функції, наприклад множник чи фільтр.",
      "Тепер ви вмієте передавати поведінку як дані, а це основа колекцій, подій і проміжних обробників. Просунутий матеріал глави покаже, як описувати типи таких колекцій у докблоках, навішувати на класи атрибути й досліджувати код рефлексією. Базовий рівень на цьому закінчується, далі розділ про помилки.",
    ],
    code: [
      String.raw`<?php
$double = function (int $x): int {
    return $x * 2;
};
$triple = fn(int $x): int => $x * 3;

echo $double(5), " ", $triple(5), "\n";
print_r(array_map($double, [1, 2, 3]));
print_r(array_map(strtoupper(...), ["a", "b"]));`,
      String.raw`<?php
$rate = 10;
$byValue = function (int $x) use ($rate): int {
    return $x * $rate;
};
$byRef = function (int $x) use (&$rate): int {
    return $x * $rate;
};
$arrow = fn(int $x): int => $x * $rate;

$rate = 100;
echo $byValue(2), "\n";
echo $byRef(2), "\n";
echo $arrow(2), "\n";

$counter = 0;
$inc = function () use (&$counter): void {
    $counter++;
};
$inc();
$inc();
echo "лічильник: $counter\n";`,
      String.raw`<?php
class Vault
{
    private string $secret = "42";
}

$peek = function (): string {
    return $this->secret;
};

$bound = Closure::bind($peek, new Vault(), Vault::class);
echo $bound(), "\n";
echo $peek->call(new Vault()), "\n";

class MathOps
{
    public static function square(int $x): int { return $x * $x; }
    public function cube(int $x): int { return $x ** 3; }
}
$callables = ["abs", [new MathOps(), "cube"], "MathOps::square", MathOps::square(...), fn($x) => -$x];
foreach ($callables as $c) {
    echo is_callable($c) ? "так " : "ні ", call_user_func($c, -3), "\n";
}`,
      String.raw`<?php
declare(strict_types=1);

function multiplier(int $factor): Closure
{
    return fn(int $x): int => $x * $factor;
}

function applyAll(array $items, callable ...$steps): array
{
    foreach ($steps as $step) {
        $items = array_map($step, $items);
    }
    return $items;
}

$result = applyAll([1, 2, 3], multiplier(10), fn(int $x): int => $x + 1);
echo implode(", ", $result), "\n";`,
      String.raw`<?php
// аварія: рядок-callable з неіснуючою функцією падає лише під час виклику
$handler = "no_such_function";
echo "створили\n";
var_dump(is_callable($handler));
$handler(1);`,
    ],
    note: "Замикання це об'єкт <code>Closure</code>. Змінні потрапляють у нього через <code>use</code> за значенням у момент створення, а <code>&amp;</code> дає посилання. <code>fn</code> захоплює автоматично, але теж за значенням.",
    work: "Замикання передають у <code>array_map</code> і <code>usort</code>, у маршрути та проміжні обробники фреймворків, у колбеки подій і запитів до бази. Фабрики замикань створюють налаштовані фільтри й правила валідації.",
    tasks: [
      "Чому зміна змінної після створення замикання з use без амперсанда не впливає на результат?",
      "Для чого потрібні Closure::bind і call, і чим вони небезпечні для інкапсуляції?",
    ],
  },
  {
    t: "Generics у докблоках: типізована колекція",
    ch: "Абстракція",
    adv: true,
    easy: "Докблок-шаблон схожий на етикетку на коробці: «тут лише яблука». Етикетка допомагає людям і програмам-перевіркам, але саму коробку не замикає, тож замок із перевіркою треба ставити окремо.",
    p: [
      "У PHP немає справжніх generics, як у Java чи Go: тип <code>array</code> не знає, що лежить усередині. Колекція <code>array</code> може містити числа, рядки й об'єкти разом, а помилка вилізе далеко від місця, де сюди потрапило сміття. Щоб описати «список замовлень» або «мапа рядок у число», спільнота домовилася писати типи в докблоках, а перевіряти їх статичними аналізаторами: PHPStan, Psalm і самою IDE.",
      "Основні позначення: <code>list&lt;int&gt;</code> це масив із послідовними ключами 0, 1, 2, <code>array&lt;string, int&gt;</code> це мапа з ключами-рядками, <code>class-string&lt;User&gt;</code> це рядок з іменем класу <code>User</code> або його нащадка. Шаблонний параметр оголошують тегом <code>@template T</code>, після чого пишуть <code>@param T $item</code>, <code>@return T</code>. Це лише коментар: інтерпретатор його ігнорує повністю.",
      "Тому типізована колекція складається з двох половин. Докблок каже аналізатору, що <code>TypedCollection</code> містить об'єкти одного класу <code>T</code>. А справжню перевірку виконує сам код: конструктор отримує <code>class-string</code>, а метод <code>add</code> звіряє об'єкт через <code>instanceof</code> і кидає виключення на чужий тип. Докблок без такої перевірки це лише побажання, а перевірка без докблока не дає аналізатору підказок.",
      "Колекцію зручно зробити <code>Countable</code> і <code>IteratorAggregate</code>: перший дає <code>count()</code>, другий дозволяє обхід у <code>foreach</code>, повертаючи <code>ArrayIterator</code> над масивом усередині. Метод <code>map</code> із позначкою <code>callable(T): U</code> описує, що колбек отримує елемент типу T і повертає значення якогось іншого типу U, яке вивчать вже аналізатори.",
      "Пастки. Докблок може брехати, і PHP цього не помітить: у функцію з <code>@param list&lt;int&gt;</code> та сигнатурою <code>array</code> спокійно потрапить масив рядків. У режимі без <code>strict_types</code> значення ще й тихо приводяться, тож неправильні дані проскочать далі. Сутність <code>@var</code> над змінною теж нічого не гарантує. Тому критичні межі, як-от додавання до колекції, перевіряйте кодом, а докблоки лишайте для документації й аналізу.",
      "Ідіоми. Запускайте PHPStan чи Psalm у CI, і докблоки перетворяться на реальні гарантії до запуску. Пишіть <code>list</code> там, де ключі йдуть підряд, і <code>array</code> з типами ключа й значення в решті випадків. Ім'я класу передавайте як <code>User::class</code>, а не як рядок із клавіатури: IDE перейменує його разом із класом. Для класів із одним типом елемента замість «універсальної» колекції часто достатньо окремого невеликого класу.",
      "Цей урок поєднав докблоки з перевіркою типу в коді. Наступний розповість про атрибути: це вже не коментар, а структуровані мітки, які PHP зберігає в самому класі й дозволяє зчитувати з програми. Так фреймворки отримують маршрути, правила валідації й інші налаштування без окремих конфігураційних файлів.",
    ],
    code: [
      String.raw`<?php
// Докблок ніщо не гарантує: PHP його не читає
/**
 * @param list<int> $ids
 */
function total(array $ids): int
{
    return array_sum($ids);
}

echo total([1, 2, 3]), "\n";
echo total(["10", "20"]), "\n";`,
      String.raw`<?php
declare(strict_types=1);

class Product
{
    public function __construct(public string $name, public int $price) {}
}

/**
 * @template T of object
 * @implements IteratorAggregate<int, T>
 */
final class TypedCollection implements Countable, IteratorAggregate
{
    /** @var list<T> */
    private array $items = [];

    /** @param class-string<T> $type */
    public function __construct(private string $type) {}

    /** @param T $item */
    public function add(object $item): void
    {
        if (!$item instanceof $this->type) {
            throw new InvalidArgumentException("Очікується {$this->type}, отримано " . $item::class);
        }
        $this->items[] = $item;
    }

    public function count(): int
    {
        return count($this->items);
    }

    /** @return ArrayIterator<int, T> */
    public function getIterator(): ArrayIterator
    {
        return new ArrayIterator($this->items);
    }
}

$products = new TypedCollection(Product::class);
$products->add(new Product("кава", 120));
$products->add(new Product("чай", 80));
foreach ($products as $p) {
    echo $p->name, ": ", $p->price, "\n";
}
echo count($products), "\n";`,
      String.raw`<?php
declare(strict_types=1);

/**
 * @template T
 */
final class ListOf
{
    /** @param list<T> $items */
    public function __construct(private array $items) {}

    /**
     * @template U
     * @param callable(T): U $fn
     * @return ListOf<U>
     */
    public function map(callable $fn): ListOf
    {
        return new ListOf(array_map($fn, $this->items));
    }

    /** @return list<T> */
    public function all(): array
    {
        return $this->items;
    }
}

$names = new ListOf(["ola", "ivan"]);
$lengths = $names->map(strlen(...));
$upper = $names->map(fn(string $s): string => ucfirst($s));
echo implode(",", $lengths->all()), " ", implode(",", $upper->all()), "\n";`,
      String.raw`<?php
// аварія: чужий тип у колекції, перевірка в коді кидає виключення
declare(strict_types=1);

class Cat {}
class Dog {}

final class TypedCollection
{
    private array $items = [];

    /** @param class-string $type */
    public function __construct(private string $type) {}

    public function add(object $item): void
    {
        if (!$item instanceof $this->type) {
            throw new InvalidArgumentException("Очікується {$this->type}, отримано " . $item::class);
        }
        $this->items[] = $item;
    }
}

$cats = new TypedCollection(Cat::class);
$cats->add(new Cat());
echo "кіт доданий\n";
$cats->add(new Dog());
echo "сюди не дійдемо\n";`,
    ],
    note: "Докблоки <code>@template</code>, <code>list&lt;T&gt;</code> і <code>class-string&lt;T&gt;</code> описують типи для аналізаторів, але PHP їх не виконує. Реальну перевірку типу елемента пишіть у коді, зазвичай через <code>instanceof</code> у методі додавання.",
    work: "У великих проєктах репозиторії та колекції описують докблоками <code>@return list&lt;Order&gt;</code>, а PHPStan у CI ловить помилки типів до запуску. Спільні бібліотеки колекцій комбінують докблоки з перевірками в конструкторах.",
    tasks: [
      "Чому PHP не відхилить масив рядків для параметра з докблоком list&lt;int&gt;?",
      "Яку роль відіграє class-string&lt;T&gt; у типізованій колекції, і де саме перевіряється тип елемента?",
    ],
  },
  {
    t: "Атрибути",
    ch: "Абстракція",
    adv: true,
    easy: "Атрибут це наклейка на коробці: «крихке», «цей бік вгору». Сама наклейка нічого не робить, але той, хто вміє її прочитати, поводиться з коробкою інакше, і зміст коробки від цього не змінюється.",
    p: [
      "Атрибути це структурована мітка над класом, методом, властивістю, параметром чи константою. Записується вона в квадратних дужках із решіткою: <code>#[Route('/users')]</code>. Для PHP 7 те саме писали в докблоках, а розбирали регулярними виразами. З PHP 8 атрибути вбудовані в мову, перевіряються парсером і зберігаються разом із класом.",
      "Атрибут це звичайний клас, який позначено власним атрибутом <code>#[Attribute]</code>. Аргументи в дужках передаються його конструктору: <code>#[Route('/users', method: 'POST')]</code> вміє іменовані аргументи. Прапорці <code>Attribute::TARGET_CLASS</code>, <code>TARGET_METHOD</code>, <code>TARGET_PROPERTY</code> обмежують, куди мітку можна вішати, а <code>Attribute::IS_REPEATABLE</code> дозволяє повторювати її кілька разів на одному елементі.",
      "Сам по собі атрибут нічого не робить. Створений об'єкт з'являється лише тоді, коли код його запитає. Зчитування йде через рефлексію (про неї наступний урок): <code>getAttributes()</code> повертає список описів, <code>getName()</code> і <code>getArguments()</code> дають ім'я й аргументи, а <code>newInstance()</code> справді створює об'єкт атрибута. Так фреймворк обходить класи, знаходить мітки й будує маршрути, правила валідації чи схему бази даних.",
      "Така відкладена модель має наслідки. Ім'я атрибута не перевіряється під час компіляції: якщо клас <code>#[Missing]</code> не існує, помилки не буде, поки хтось не викличе <code>newInstance()</code>. Тоді ж перевіряється й ціль: мітку з <code>TARGET_CLASS</code>, повішену на метод, зловить лише <code>newInstance()</code>, і кине <code>Error</code>. Також нічого не знає про атрибути <code>instanceof</code>: це не успадкування й не інтерфейс.",
      "Пастки. Аргументи атрибута мусять бути константними виразами: літерали, константи, <code>new</code> (з 8.1), але не змінні чи виклики функцій. Атрибути не успадковуються автоматично; метод-нащадок не отримує мітки батька, і шукати їх треба вручну. Не плутайте синтаксис із коментарем: рядок <code>#[...]</code> на одному рядку з кодом <i>не</i> коментар, у PHP 7 така решітка починала коментар, а в 8 вже ні.",
      "Ідіоми. Давайте атрибутам вузьке значення й короткі назви ролей: <code>Route</code>, <code>Column</code>, <code>Rule</code>. Вказуйте цілі через <code>TARGET_*</code>, щоб помилку було видно одразу. У самій мові вже є кілька атрибутів: <code>#[ReturnTypeWillChange]</code> гасить попередження для застарілих повернених типів, <code>#[Override]</code> з'явився в 8.3. Зчитування кешуйте, а не проходьте рефлексією на кожен запит.",
      "Читання атрибутів поки лишилося за лаштунками: ми скористалися кількома викликами рефлексії без пояснень. Наступний урок розкриває цей інструмент докладно: як за ім'ям класу дізнатися його методи, властивості й типи параметрів, і як на цьому будувати контейнери залежностей.",
    ],
    code: [
      String.raw`<?php
#[Attribute]
class Route
{
    public function __construct(public string $path, public string $method = "GET") {}
}

class UserController
{
    #[Route("/users")]
    public function list(): string { return "список"; }

    #[Route("/users/new", method: "POST")]
    public function create(): string { return "створено"; }

    public function helper(): void {}
}

$class = new ReflectionClass(UserController::class);
foreach ($class->getMethods() as $m) {
    foreach ($m->getAttributes(Route::class) as $attr) {
        $r = $attr->newInstance();
        echo $r->method, " ", $r->path, " -> ", $m->getName(), "\n";
    }
}`,
      String.raw`<?php
#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
class Rule
{
    public function __construct(public string $name, public int $value = 0) {}
}

class Form
{
    #[Rule("min", 3)]
    #[Rule("max", 10)]
    public string $login = "";
}

$prop = new ReflectionProperty(Form::class, "login");
foreach ($prop->getAttributes() as $attr) {
    echo $attr->getName(), " ", json_encode($attr->getArguments()), "\n";
}`,
      String.raw`<?php
#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
class Rule
{
    public function __construct(public string $name, public int $value = 0) {}
}

class Signup
{
    public function __construct(
        #[Rule("min", 3)] public string $login,
        #[Rule("min", 8)] public string $password,
    ) {}
}

function validate(object $obj): array
{
    $errors = [];
    foreach ((new ReflectionObject($obj))->getProperties() as $prop) {
        foreach ($prop->getAttributes(Rule::class) as $attr) {
            $rule = $attr->newInstance();
            $value = $prop->getValue($obj);
            if ($rule->name === "min" && strlen($value) < $rule->value) {
                $errors[] = $prop->getName() . ": менше " . $rule->value . " символів";
            }
        }
    }
    return $errors;
}

print_r(validate(new Signup("ola", "12345")));`,
      String.raw`<?php
// Ім'я атрибута не перевіряється, поки його не створять
#[Missing(1)]
class Tagged {}

$a = (new ReflectionClass(Tagged::class))->getAttributes()[0];
echo $a->getName(), " ", json_encode($a->getArguments()), "\n";
echo class_exists($a->getName()) ? "клас є" : "класу немає", "\n";`,
      String.raw`<?php
// аварія: атрибут для класів повішено на метод, newInstance() кидає Error
#[Attribute(Attribute::TARGET_CLASS)]
class OnlyClass {}

class Service
{
    #[OnlyClass]
    public function run(): void {}
}

$attr = (new ReflectionMethod(Service::class, "run"))->getAttributes()[0];
echo $attr->getName(), "\n";
$attr->newInstance();`,
    ],
    note: "Атрибут це клас із <code>#[Attribute]</code>, який вішають як мітку. Він створюється лише методом <code>newInstance()</code> через рефлексію, а правильність імені й цілі перевіряється саме тоді, а не під час компіляції.",
    work: "Symfony і Laravel зчитують атрибути для маршрутів, подій і прав доступу, ORM Doctrine описує ними колонки, валідатори перевіряють поля. Так конфігурація лежить поряд із кодом, а окремі YAML-файли не потрібні.",
    tasks: [
      "Коли саме PHP перевіряє, що клас атрибута існує і що його повішено на допустимий елемент?",
      "Яким прапорцем дозволити кілька однакових атрибутів на одному елементі?",
    ],
  },
  {
    t: "Рефлексія",
    ch: "Абстракція",
    adv: true,
    easy: "Рефлексія це технічний паспорт будинку: за ним можна дізнатися поверхи, кімнати й розміри, не заходячи всередину. Програма так само читає опис власних класів, методів і параметрів під час роботи.",
    p: [
      "Рефлексія дозволяє коду досліджувати сам себе: за ім'ям класу дізнатися його методи, властивості, батьків, інтерфейси, а за функцією побачити її параметри й типи. Звичайна програма знає свої класи наперед, а ось бібліотеки, які працюють із довільними класами користувача, без рефлексії не обійдуться. Їх приклади: контейнер залежностей, серіалізатор, система тестування.",
      "Набір класів невеликий і передбачуваний. <code>ReflectionClass</code> описує клас, <code>ReflectionObject</code> те саме, але для готового об'єкта, <code>ReflectionMethod</code> і <code>ReflectionFunction</code> описують виклики, <code>ReflectionProperty</code> властивість, <code>ReflectionParameter</code> параметр, <code>ReflectionNamedType</code> його тип. Створюють їх із імені класу чи функції: <code>new ReflectionClass(User::class)</code>.",
      "Що можна дізнатися. Клас: <code>getShortName()</code>, <code>isFinal()</code>, <code>getParentClass()</code>, <code>getInterfaceNames()</code>, <code>getMethods()</code>, <code>getProperties()</code>, <code>getConstructor()</code>. Параметр: <code>getName()</code>, <code>getType()</code>, <code>isOptional()</code>, <code>getDefaultValue()</code>. Об'єкт створюють без виклику new: <code>newInstance(...$args)</code>, <code>newInstanceArgs()</code>. Вирази <code>getAttributes()</code> із попереднього уроку теж частина цього API.",
      "Особливість рефлексії в тому, що вона ігнорує видимість. У PHP 8.1 <code>ReflectionProperty::getValue()</code> читає навіть <code>private</code>-властивість без жодних додаткових дій (старий <code>setAccessible(true)</code> тепер нічого не робить). Це корисно для тестів, налагоджувачів і гідраторів, але порушує інкапсуляцію: якщо ви користуєтесь цим у звичайному коді, подумайте, чи не потрібен публічний метод. Тому рефлексія зручна для інструментів, які мусять працювати з будь-яким класом: тестових фреймворків, контейнерів, серіалізаторів. Водночас вона обходить інкапсуляцію, і користуватися нею в бізнес-логіці означає ламати правила, які сам клас встановив для свого стану, тож тримайте її в інфраструктурному шарі.",
      "Пастки. Рефлексія повільніша за прямі виклики, тож результат у гарячому коді кешують. Неіснуючий клас дає <code>ReflectionException</code> уже в конструкторі. Метод <code>getType()</code> може повернути <code>null</code> (тип не вказано) або <code>ReflectionUnionType</code>, у якого немає <code>getName()</code>, тож перевіряйте клас типу, перш ніж викликати метод. Порядок <code>getMethods()</code> іде за оголошенням: спочатку методи самого класу, потім успадковані.",
      "Ідіоми. Автопідстановка залежностей: беремо конструктор, перебираємо параметри, для кожного типу-класу рекурсивно створюємо об'єкт. Ця схема на кількох рядках працює як ядро справжніх контейнерів. Для збору метаданих користуйтеся <code>getAttributes()</code>. Перед створенням об'єкта через <code>newInstance</code> перевіряйте <code>isInstantiable()</code>, щоб не натрапити на абстрактний клас чи інтерфейс.",
      "Рефлексія дала змогу бачити код зсередини. Завершує главу урок про типи, які вимагають кількох інтерфейсів одразу, про функції, що ніколи не повертаються, і про створення об'єктів у значеннях за замовчуванням. Це останні свіжі можливості PHP 8.1, що роблять сигнатури виразнішими.",
    ],
    code: [
      String.raw`<?php
interface Named {}

abstract class Base
{
    public function id(): int { return 1; }
}

final class User extends Base implements Named
{
    public string $name = "Оля";
    private int $age = 30;

    public function greet(): string { return "Привіт"; }
}

$rc = new ReflectionClass(User::class);
echo $rc->getShortName(), " final=", var_export($rc->isFinal(), true), "\n";
echo "батько: ", $rc->getParentClass()->getName(), "\n";
echo "інтерфейси: ", implode(",", $rc->getInterfaceNames()), "\n";
foreach ($rc->getMethods() as $m) {
    echo "метод ", $m->getName(), "\n";
}
foreach ($rc->getProperties() as $p) {
    echo "властивість ", $p->getName(), "\n";
}`,
      String.raw`<?php
function connect(string $host, int $port = 3306, ?string $user = null): void {}

$f = new ReflectionFunction("connect");
foreach ($f->getParameters() as $p) {
    $default = $p->isDefaultValueAvailable() ? var_export($p->getDefaultValue(), true) : "-";
    printf("%d %s %s %s %s\n", $p->getPosition(), $p->getName(), $p->getType(), $p->isOptional() ? "необов'язковий" : "обов'язковий", $default);
}
echo $f->getNumberOfRequiredParameters(), "\n";`,
      String.raw`<?php
class Wallet
{
    private int $balance = 500;
}

$w = new Wallet();
$prop = new ReflectionProperty(Wallet::class, "balance");
echo $prop->getValue($w), "\n";
$prop->setValue($w, 700);
echo $prop->getValue($w), "\n";`,
      String.raw`<?php
class Logger {}

class Mailer
{
    public function __construct(public Logger $logger) {}
}

class Signup
{
    public function __construct(public Mailer $mailer, public Logger $logger, public int $retries = 3) {}
}

function make(string $class): object
{
    $ctor = (new ReflectionClass($class))->getConstructor();
    if ($ctor === null) {
        return new $class();
    }
    $args = [];
    foreach ($ctor->getParameters() as $p) {
        $type = $p->getType();
        if ($type instanceof ReflectionNamedType && !$type->isBuiltin()) {
            $args[] = make($type->getName());
        } elseif ($p->isDefaultValueAvailable()) {
            $args[] = $p->getDefaultValue();
        } else {
            throw new LogicException("Не вдалося підставити " . $p->getName());
        }
    }
    return new $class(...$args);
}

$s = make(Signup::class);
echo get_class($s->mailer->logger), " ", $s->retries, "\n";`,
      String.raw`<?php
// аварія: клас не існує, конструктор рефлексії кидає ReflectionException
echo "шукаємо клас\n";
$rc = new ReflectionClass("NoSuchClass");
echo $rc->getName(), "\n";`,
    ],
    note: "Рефлексія за іменем читає опис класу, методів, властивостей і параметрів під час виконання. Вона бачить приватне й не питає дозволу, тож годиться для контейнерів і тестів, але не для звичайної бізнес-логіки.",
    work: "Контейнери залежностей будують об'єкти з типів конструктора, PHPUnit знаходить тестові методи, серіалізатори й ORM заповнюють приватні поля, а фреймворки зчитують атрибути з методів контролерів. Для звичайної бізнес-логіки рефлексія майже не потрібна, це інструмент авторів бібліотек.",
    tasks: [
      "Як отримати тип параметра конструктора і що повернеться, якщо тип не вказано?",
      "Чому ReflectionProperty::getValue() вдається прочитати приватну властивість, і чому цим не слід зловживати?",
    ],
  },
  {
    t: "Intersection-типи, never і new в ініціалізаторах",
    ch: "Абстракція",
    adv: true,
    easy: "Intersection-тип схожий на вимогу до кандидата: «має права категорії B <i>і</i> досвід від двох років». Одна вимога не рятує, потрібні обидві, і функція приймає лише тих, хто відповідає всім.",
    p: [
      "PHP 8.1 додав три можливості, які роблять сигнатури виразнішими. Перша, intersection-тип, записується через <code>&amp;</code>: <code>Countable&amp;ArrayAccess</code> означає, що значення має реалізувати <i>обидва</i> інтерфейси. Це протилежність union-типу <code>A|B</code>, де достатньо одного з двох.",
      "Intersection-тип приймає лише імена класів та інтерфейсів, тому <code>int&amp;string</code> чи <code>Countable&amp;null</code> неможливі. Параметр такого типу дозволяє функції викликати методи обох інтерфейсів без зайвих перевірок. Якщо передати об'єкт, що реалізує лише один із них, PHP кине <code>TypeError</code>. Поєднання з union, наприклад <code>(A&amp;B)|null</code>, з'явилося в PHP 8.2 (DNF-типи) і в 8.1 недоступне.",
      "Друга можливість, <code>never</code>, це повернений тип функції, що <i>ніколи не завершується нормально</i>: вона або кидає виключення, або викликає <code>exit</code>, або зациклюється. Типовий приклад: допоміжна функція <code>fail()</code> чи <code>redirect()</code>. Якщо така функція все ж дійде до кінця чи виконає <code>return</code>, PHP кине <code>TypeError</code>. Аналізатори розуміють, що код після її виклику недосяжний, і відповідно оцінюють типи.",
      "Третя, <code>new</code> в ініціалізаторах: тепер значенням за замовчуванням параметра може бути вираз <code>new Foo()</code>. Раніше довелося писати <code>?Foo $foo = null</code> і всередині <code>$foo ??= new Foo()</code>. Дозволено це також у статичних змінних, глобальних константах і аргументах атрибутів, а ось у властивостях і константах класу ні: там <code>new</code> лишається забороненим, і PHP повідомить про це фатальною помилкою.",
      "Пастки. <code>never</code> не те саме, що <code>void</code>: <code>void</code> функція повертається нормально, але без значення, а <code>never</code> не повертається зовсім. У параметрі за замовчуванням <code>new</code> виконується при кожному виклику, що пропустив аргумент, тож ви отримуєте новий об'єкт, а не спільний. Intersection-тип не можна змішувати з простими типами. Аргументи в такому <code>new</code> теж мусять бути константними виразами.",
      "Ідіоми. Залежності з розумними значеннями за замовчуванням пишіть так: <code>private Clock $clock = new SystemClock()</code>, і тест просто підставить інший об'єкт. Допоміжні функції винятків позначайте <code>never</code>. Intersection-типи корисні для «ролей» об'єкта, наприклад, <code>Countable&amp;Traversable</code> у функції, що рахує і обходить колекцію. У реальних проєктах вони трапляються нечасто, зате вчать мислити контрактами.",
      "На цьому глава про абстракцію завершена: інтерфейси, абстрактні класи, трейти, поліморфізм, магічні методи, замикання, рефлексія й сучасні типи. Далі глава «Помилки»: попередження, виключення, <code>try</code>, <code>catch</code> і власні винятки, які ми вже побіжно використовували.",
    ],
    code: [
      String.raw`<?php
function describe(Countable&ArrayAccess $box): string
{
    return "елементів: " . count($box) . ", перший: " . $box[0];
}

echo describe(new ArrayObject(["a", "b", "c"])), "\n";

class Pair implements Countable, ArrayAccess
{
    public function __construct(private array $d) {}
    public function count(): int { return count($this->d); }
    public function offsetExists(mixed $o): bool { return isset($this->d[$o]); }
    public function offsetGet(mixed $o): mixed { return $this->d[$o]; }
    public function offsetSet(mixed $o, mixed $v): void { $this->d[$o] = $v; }
    public function offsetUnset(mixed $o): void { unset($this->d[$o]); }
}
echo describe(new Pair([10, 20])), "\n";`,
      String.raw`<?php
function fail(string $message): never
{
    throw new RuntimeException($message);
}

function parsePort(string $value): int
{
    if (!ctype_digit($value)) {
        fail("Порт не число: $value");
    }
    return (int) $value;
}

echo parsePort("8080"), "\n";
try {
    parsePort("80a");
} catch (RuntimeException $e) {
    echo "Помилка: ", $e->getMessage(), "\n";
}`,
      String.raw`<?php
interface Clock
{
    public function now(): string;
}

class FixedClock implements Clock
{
    public function now(): string { return "2025-01-15"; }
}

class Logger
{
    public function __construct(private Clock $clock = new FixedClock()) {}

    public function log(string $message): string
    {
        return "[" . $this->clock->now() . "] " . $message;
    }
}

class OtherClock implements Clock
{
    public function now(): string { return "2030-12-31"; }
}

echo (new Logger())->log("старт"), "\n";
echo (new Logger(new OtherClock()))->log("інший час"), "\n";`,
      String.raw`<?php
// аварія: функція never дійшла до кінця без виключення, TypeError
function stop(): never
{
    echo "зупиняємо\n";
}

stop();
echo "сюди не дійдемо\n";`,
      String.raw`<?php
// фрагмент: DNF-типи (об'єднання з intersection) доступні з PHP 8.2
function size((Countable&ArrayAccess)|array|null $data): int
{
    return $data === null ? 0 : count($data);
}`,
    ],
    note: "<code>A&amp;B</code> вимагає обидва типи одразу, <code>never</code> означає «функція не повертається нормально», а <code>new</code> можна писати у значенні параметра за замовчуванням, але не у властивості чи константі класу.",
    work: "Тип <code>never</code> позначає допоміжні функції зупинки (<code>abort()</code>, <code>redirect()</code>) у фреймворках. Значення <code>new</code> за замовчуванням спрощують конструктори сервісів, а intersection-типи вимагають від залежності одразу кілька ролей. У коді з PHPStan такі типи допомагають ловити помилки ще до запуску.",
    tasks: [
      "Чим тип A&amp;B відрізняється від A|B у параметрі функції?",
      "Що станеться, якщо функція з типом never завершиться без виключення чи exit?",
    ],
  },
];
