export const LESSONS_09 = [
  {
    t: "assert і перші перевірки",
    ch: "Тестування й якість",
    easy: "assert схожий на контролера на вході в метро: поки у вас є квиток, він мовчки киває й пропускає, а без квитка зупиняє весь потік. Так програма сама ловить власні хибні припущення.",
    p: [
      "Кожна програма спирається на припущення: сума не від'ємна, список не порожній, функція повернула саме ціле число. Поки припущення правдиве, ніхто його не помічає, а коли ламається, помилка проявляється далеко від причини. Конструкція <code>assert</code> дозволяє записати припущення прямо в коді й отримати гучний збій у тому самому місці, де воно порушилось.",
      "Модель у голові: <code>assert(умова)</code> обчислює вираз. Якщо він істинний, нічого не відбувається. Якщо хибний, кидається <code>AssertionError</code>. Другим аргументом можна передати текстовий опис, і він стане повідомленням помилки. Також можна передати готовий об'єкт виключення, наприклад <code>new InvalidArgumentException('...')</code>: тоді кинеться саме він.",
      "Поведінку керують два налаштування php.ini. <code>zend.assertions</code> дорівнює 1 у розробці (перевірки виконуються), 0 (код є, але пропускається) або -1 у продакшені (вирази взагалі не компілюються). <code>assert.exception</code> у PHP 8 за замовчуванням увімкнене, тож хибна умова кидає виключення, а не друкує попередження. Через це в робочому режимі assert може зникнути зовсім.",
      "Звідси головне правило: <code>assert</code> перевіряє помилки програміста, а не вхідні дані. Якщо користувач ввів некоректний вік, це очікувана ситуація, і для неї потрібні <code>if</code> та справжнє виключення, адже вони працюють завжди. А вираз усередині assert не повинен мати побічних ефектів: за вимкнених перевірок він не виконається, і програма поведе себе інакше.",
      "Пастки. Усередині <code>assert</code> працюють звичайні правила порівняння PHP: <code>\"1\" == \"01\"</code> і <code>\"10\" == \"1e1\"</code> істинні, бо числові рядки порівнюються як числа, а <code>null == false</code> теж істина. Тому для перевірок надійніший суворий оператор <code>===</code>: він порівнює ще й тип. Друга пастка: коротке повідомлення без контексту. Опис «помилка» не допоможе, а «знижка 10% від 200 дає 180» одразу вкаже на причину.",
      "Ідіоми. Пишіть assert для інваріантів: «після сортування масив не порожній», «індекс у межах». Перевіряйте результати малих функцій прямо під ними, поки пишете код. Повідомлення робіть конкретними, а порівняння суворими. Для умов, що залежать від зовнішнього світу, лишайте звичайні виключення.",
      "Один assert у рядку це добре, але десятки таких рядків без структури швидко втомлюють: перший збій зупиняє все, і ви не бачите решти. Це особливо помітно, коли перевірок багато, а причина збою ховається десь у середині списку. Наступний урок вирішує це: ми зберемо мінімальний стенд із функціями <code>test()</code> і <code>assertSame()</code>, який запускає перевірки по одній і показує підсумок.",
    ],
    code: [
      String.raw`<?php
// assert записує припущення: істинна умова нічого не друкує
$items = [3, 5, 8];
$total = array_sum($items);

assert($total === 16);
assert(count($items) === 3, 'у кошику три товари');

echo "Перевірки пройдені: сума $total\n";
`,
      String.raw`<?php
// аварія: хибний assert кидає AssertionError (zend.assertions=1, assert.exception=1)
function discount(int $price, int $percent): int
{
    return $price - intdiv($price * $percent, 100);
}

echo discount(200, 10), "\n";
assert(discount(200, 10) === 180, 'знижка 10% від 200 дає 180');
assert(discount(200, 50) === 90, 'знижка 50% від 200 дає 90');
echo "сюди ми не дійдемо\n";
`,
      String.raw`<?php
// поведінка, що дивує: == пропускає те, що === відхилив би
assert("1" == "01");
assert("10" == "1e1");
assert(100 == "1e2");
assert(null == false);
assert([] == false);
echo "усі п'ять нестрогих перевірок пройшли\n";

var_dump("1" === "01");
var_dump(100 === "1e2");
`,
      String.raw`<?php
declare(strict_types=1);

// assert з готовим виключенням: кидається саме воно
function average(array $nums): int
{
    assert($nums !== [], new InvalidArgumentException('масив порожній'));
    return intdiv(array_sum($nums), count($nums));
}

echo average([4, 6, 8]), "\n";

try {
    echo average([]), "\n";
} catch (InvalidArgumentException $e) {
    echo "Спіймано: ", $e->getMessage(), "\n";
}
`,
    ],
    note: "Хибний <code>assert</code> кидає <code>AssertionError</code>. Це перевірка припущень програміста, а не вхідних даних: у продакшені її вимикають через <code>zend.assertions=-1</code>. Порівнюйте через <code>===</code> і давайте повідомленню конкретний зміст.",
    work: "Assert ставлять на інваріанти в сервісах і бібліотеках: «сума замовлення не від'ємна», «масив відсортований». У розробці й на CI вони ловлять логічні помилки одразу, а в продакшені вимикаються без втрат швидкодії.",
    tasks: [
      "Що станеться з хибним assert, якщо zend.assertions дорівнює -1?",
      "Чому assert не годиться для перевірки введення користувача?",
    ],
  },
  {
    t: "Мінітестовий стенд: test() і assertSame",
    ch: "Тестування й якість",
    easy: "Тестовий стенд це випробувальна лабораторія для деталей: кожну деталь кладуть на свій стіл, пишуть «пройшла» чи «ні», і в кінці підраховують, скільки пішло в брак. Один збій не зупиняє інших.",
    p: [
      "Рядок assert зупиняє програму на першому ж збої. Для однієї перевірки цього досить, але коли їх двадцять, ви хочете побачити всі провалені одразу й дізнатись, яка саме. Потрібен маленький інструмент, який запускає кожну перевірку окремо, ловить помилку, друкує її й іде далі. Саме так працюють PHPUnit і Pest, і мінімальну версію ми напишемо самі за п'ятнадцять рядків.",
      "Модель у голові складається з двох функцій. <code>assertSame($expected, $actual)</code> порівнює значення через <code>!==</code> і, якщо вони різні, кидає <code>AssertionError</code> з поясненням. <code>test($name, $fn)</code> викликає замикання, ловить <code>Throwable</code> і друкує або <code>ok</code>, або <code>FAIL</code> з повідомленням. Звідси й виникає незалежність: виняток усередині одного тесту не доходить до наступного.",
      "Для повідомлення зручно використати <code>var_export($value, true)</code>: він повертає значення як PHP-літерал, тож <code>1</code> та <code>'1'</code> виглядають по-різному. Ця деталь важлива, бо рядок <code>'1'</code> без лапок на екрані мав би той самий вигляд, що й число. Підсумок рахуємо у статичних властивостях класу: вони живуть між викликами й не потребують <code>global</code>.",
      "Суворе порівняння тут свідоме. Оператор <code>==</code> вважає <code>1</code> і <code>'1'</code> рівними, а масиви з однаковими парами «ключ-значення» рівними незалежно від порядку. Така поблажливість у тесті небезпечна: код повернув рядок замість числа, а тест мовчить. <code>===</code> для масивів вимагає ще й однакового порядку та типів, тому <code>assertSame</code> чесніший.",
      "Пастки. Якщо в тесті не було жодного порівняння, він «проходить», хоча нічого не перевірив: стенд бачить лише відсутність винятку. Тому кожен тест мусить закінчуватись порівнянням. Також не ловіть у <code>test()</code> лише <code>Exception</code>: <code>TypeError</code> і <code>AssertionError</code> належать до <code>Error</code>, і пропустите їх. Саме тому стенд ловить <code>Throwable</code>.",
      "Ідіоми. Дайте тесту назву, що описує поведінку: «ПДВ 20% від 100 дає 120», а не «test1». Для CI завершуйте скрипт кодом виходу: <code>exit(1)</code>, якщо є провали, і 0, якщо їх немає, бо саме за кодом система збірки вирішує, чи збірка зелена. Один тест перевіряє одну річ: так за назвою збійного тесту одразу видно, що саме зламалось. Не робіть тести залежними від порядку запуску й від спільного стану, бо збій тоді з'являється лише в певній послідовності й важко відтворюється.",
      "Тепер ми вміємо перевіряти значення, що повертає функція. Але в хорошому коді важлива й поведінка у збої: функція кидає виключення на неправильні дані. Як перевірити, що виключення справді кинуто, а не просто не було помічено, розберемо в наступному уроці, додавши до стенда <code>assertThrows</code>.",
    ],
    code: [
      String.raw`<?php
// Найпростіший test(): запускає замикання й ловить будь-який збій
function test(string $name, callable $fn): void
{
    try {
        $fn();
        echo "ok   $name\n";
    } catch (Throwable $e) {
        echo "FAIL $name: ", $e->getMessage(), "\n";
    }
}

test('додавання', fn() => assert(2 + 3 === 5));
test('хибне очікування', fn() => assert(2 + 3 === 6, 'очікували 6'));
test('виняток у коді', fn() => intdiv(1, 0));
echo "кінець\n";
`,
      String.raw`<?php
// аварія: assertSame кидає AssertionError на першому розходженні
function assertSame(mixed $expected, mixed $actual, string $msg = ''): void
{
    if ($expected !== $actual) {
        $prefix = $msg === '' ? '' : "$msg: ";
        throw new AssertionError($prefix . 'очікували ' . var_export($expected, true) . ', отримали ' . var_export($actual, true));
    }
}

assertSame(4, 2 + 2);
assertSame('ab', 'a' . 'b', 'конкатенація');
echo "перші дві перевірки пройшли\n";
assertSame(1, '1', 'тип має значення');
echo "сюди не дійдемо\n";
`,
      String.raw`<?php
// поведінка, що дивує: == не бачить різниці, яку бачить ===
var_dump(1 == '1');
var_dump(1 === '1');

$a = ['x' => 1, 'y' => 2];
$b = ['y' => 2, 'x' => 1];
var_dump($a == $b);
var_dump($a === $b);
`,
      String.raw`<?php
// аварія: стенд завершується кодом 1, бо один тест провалено
final class Stand
{
    public static int $passed = 0;
    public static int $failed = 0;
}

function assertSame(mixed $expected, mixed $actual): void
{
    if ($expected !== $actual) {
        throw new AssertionError('очікували ' . var_export($expected, true) . ', отримали ' . var_export($actual, true));
    }
}

function test(string $name, callable $fn): void
{
    try {
        $fn();
        Stand::$passed++;
        echo "ok   $name\n";
    } catch (Throwable $e) {
        Stand::$failed++;
        echo "FAIL $name: ", $e->getMessage(), "\n";
    }
}

function withVat(int $net): int
{
    return $net + intdiv($net * 20, 100);
}

test('ПДВ 20% від 100', fn() => assertSame(120, withVat(100)));
test('нуль лишається нулем', fn() => assertSame(0, withVat(0)));
test('ПДВ від 10', fn() => assertSame(13, withVat(10)));

echo "пройдено: ", Stand::$passed, ", провалено: ", Stand::$failed, "\n";
exit(Stand::$failed > 0 ? 1 : 0);
`,
    ],
    note: "<code>test($name, $fn)</code> запускає замикання й ловить <code>Throwable</code>, <code>assertSame</code> порівнює через <code>!==</code>. Тест без жодного порівняння завжди «проходить», тож завершуйте кожен тест перевіркою, а скрипт кодом виходу.",
    work: "Так влаштований кожен тестовий фреймворк: PHPUnit, Pest, Codeception. Власний мінітестер стає у пригоді в скриптах, інструментах командного рядка, міграціях і навчальних задачах, коли підключати Composer не хочеться чи недоречно.",
    tasks: [
      "Чому assertSame використовує !==, а не !=?",
      "Чому test() ловить Throwable, а не лише Exception?",
    ],
  },
  {
    t: "Тестування виключень",
    ch: "Тестування й якість",
    easy: "Перевірити виняток це як випробувати вогнегасник: цікаво не те, що він стоїть на стіні, а що спрацьовує, коли справді загорілось, і гасить саме цей вогонь, а не будь-який інший.",
    p: [
      "Добра функція не лише повертає правильну відповідь на правильні дані, а й чітко відмовляє на неправильні: кидає виключення з потрібним класом і зрозумілим повідомленням. Це частина її контракту, і тому її треба тестувати так само уважно, як і щасливий шлях. Інакше завтра хтось замінить виняток на мовчазне повернення <code>null</code>, і жоден тест цього не помітить.",
      "Модель у голові: тест виняткового сценарію має три можливі результати. Виняток кинуто потрібного класу (тест пройшов), кинуто чужого класу (збій: код відмовив не так) або не кинуто взагалі (збій: код мовчки погодився). Хелпер <code>assertThrows($class, $fn)</code> розрізняє всі три випадки й повертає спійманий об'єкт, щоб ви могли перевірити повідомлення чи поля.",
      "Реалізація проста: викликаємо <code>$fn</code> усередині <code>try</code>, у <code>catch (Throwable $e)</code> перевіряємо <code>$e instanceof $class</code>. Збіг повертаємо, розбіжність обертаємо в <code>AssertionError</code>. Якщо виконання дійшло до кінця <code>try</code> без винятку, кидаємо <code>AssertionError</code> «виключення не було». Важливо, що це виключення кидається поза <code>try</code>, інакше воно було б зловлене власним catch.",
      "Пастки. Клас, який ви очікуєте, має бути точним. Якщо написати <code>Exception::class</code>, тест пройде для будь-якого нащадка, у тому числі зовсім не того. До того ж <code>TypeError</code>, <code>DivisionByZeroError</code> і <code>AssertionError</code> успадковані від <code>Error</code>, а не від <code>Exception</code>, тож <code>catch (Exception)</code> їх не бачить. Перевіряйте повідомлення або властивості винятку, а не лише клас: так видно, чому саме він кинутий.",
      "Друга пастка: тест виняткового шляху з побічними ефектами. Якщо функція списує гроші й лише потім кидає виняток, баланс уже змінений. Тому після <code>assertThrows</code> варто перевірити, що стан лишився недоторканим. І не зловживайте текстом повідомлення: рядок «Division by zero» належить рушієві PHP, а ваші повідомлення можна змінювати, тож надійніше ловити клас і структуровані поля.",
      "Ідіоми. Власні виключення успадковуйте від потрібного стандартного класу (<code>DomainException</code>, <code>InvalidArgumentException</code>) і зберігайте корисні дані в <code>public readonly</code> властивостях. Один тест перевіряє один сценарій збою. Перевіряйте також повідомлення чи поля винятку, якщо від них залежить поведінка, бо клас сам по собі може збігатися для різних причин. Назви тестів відповідають поведінці: «відмовляє, коли не вистачає грошей».",
      "Ми вміємо перевіряти і значення, і виключення. Залишається проблема масштабу: однакових за формою перевірок з різними даними бувають десятки, і дублювати тест для кожної пари вхід-результат нудно. Наступний урок покаже табличні тести: дані окремо, перевірка одна, а цикл проходить по набору.",
    ],
    code: [
      String.raw`<?php
// Спосіб без хелпера: ловимо виняток вручну й перевіряємо клас
function parseAge(string $s): int
{
    if (!ctype_digit($s)) {
        throw new InvalidArgumentException("вік має бути числом: $s");
    }
    return (int) $s;
}

$thrown = null;
try {
    parseAge('abc');
} catch (InvalidArgumentException $e) {
    $thrown = $e;
}

assert($thrown instanceof InvalidArgumentException);
echo get_class($thrown), ': ', $thrown->getMessage(), "\n";
`,
      String.raw`<?php
// Хелпер assertThrows: клас збігся, клас чужий або виняток не кинуто
function assertThrows(string $class, callable $fn): Throwable
{
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $class) {
            return $e;
        }
        throw new AssertionError("очікували $class, отримали " . get_class($e));
    }
    throw new AssertionError("очікували $class, але виключення не було");
}

$e = assertThrows(DivisionByZeroError::class, fn() => intdiv(1, 0));
echo get_class($e), ': ', $e->getMessage(), "\n";

try {
    assertThrows(InvalidArgumentException::class, fn() => intdiv(1, 0));
} catch (AssertionError $err) {
    echo "Чужий клас: ", $err->getMessage(), "\n";
}
`,
      String.raw`<?php
// аварія: код не кинув виняток, і assertThrows це виявив
function assertThrows(string $class, callable $fn): Throwable
{
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $class) {
            return $e;
        }
        throw new AssertionError("очікували $class, отримали " . get_class($e));
    }
    throw new AssertionError("очікували $class, але виключення не було");
}

function parsePercent(string $s): int
{
    return (int) $s;
}

assertThrows(InvalidArgumentException::class, fn() => parsePercent('abc'));
echo "сюди не дійдемо\n";
`,
      String.raw`<?php
declare(strict_types=1);

// поведінка, що дивує: TypeError не є Exception
try {
    strlen([]);
} catch (Exception $e) {
    echo "Exception спіймано\n";
} catch (Error $e) {
    echo get_class($e), " є Error, а не Exception\n";
}

var_dump(new TypeError() instanceof Exception);
var_dump(new TypeError() instanceof Throwable);
`,
      String.raw`<?php
// Реалістично: перевіряємо клас, поле винятку й незмінність стану
function assertThrows(string $class, callable $fn): Throwable
{
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $class) {
            return $e;
        }
        throw new AssertionError("очікували $class, отримали " . get_class($e));
    }
    throw new AssertionError("очікували $class, але виключення не було");
}

final class InsufficientFunds extends DomainException
{
    public function __construct(public readonly int $missing)
    {
        parent::__construct("не вистачає $missing");
    }
}

final class Account
{
    public function __construct(private int $balance) {}

    public function balance(): int
    {
        return $this->balance;
    }

    public function withdraw(int $sum): int
    {
        if ($sum > $this->balance) {
            throw new InsufficientFunds($sum - $this->balance);
        }
        $this->balance -= $sum;
        return $this->balance;
    }
}

$acc = new Account(100);
$e = assertThrows(InsufficientFunds::class, fn() => $acc->withdraw(130));
echo $e->getMessage(), ' / missing=', $e->missing, "\n";
assert($acc->balance() === 100, 'баланс не змінився');
echo 'після зняття 30: ', $acc->withdraw(30), "\n";
`,
    ],
    note: "<code>assertThrows($class, $fn)</code> розрізняє три випадки: кинуто потрібний клас, кинуто чужий, не кинуто нічого. Перевіряйте точний клас і поля винятку, а не загальний <code>Exception</code>: <code>TypeError</code> і подібні належать до <code>Error</code>.",
    work: "Тести відмов фіксують контракт: недостатньо коштів, порожній кошик, невалідний email. Коли хтось у рефакторингу змінює відмову на мовчазну поведінку, збірка падає ще на CI, і помилка не доходить до користувачів та не псує їхні дані.",
    tasks: [
      "Які три результати може мати тест, що очікує виняток?",
      "Чому catch (Exception) не ловить TypeError?",
    ],
  },
  {
    t: "Табличні тести: набори даних",
    ch: "Тестування й якість",
    easy: "Табличний тест схожий на екзаменаційну відомість: один і той самий білет, а в стовпчиках різні студенти з їхніми відповідями. Екзаменатор не пише новий білет для кожного, він просто проходить рядок за рядком.",
    p: [
      "Коли перевіряєш функцію, швидко з'являється купа однакових за формою тестів: вхід один, очікуваний результат інший. Якщо писати окремий виклик <code>test()</code> для кожної пари, код розростається, а нова пара коштує три рядки копіпасту. Табличний підхід виносить дані окремо від логіки: тест один, а випадків скільки завгодно.",
      "Модель у голові: масив, де кожен елемент це один випадок. Ключ служить назвою, значення це масив аргументів і очікуваного результату. Цикл <code>foreach</code> проходить набір і для кожного запускає <code>test(\"$name\", ...)</code>. У PHPUnit те саме називається data provider, тільки там метод повертає такий масив, а фреймворк сам запускає цикл.",
      "Приклад: функція <code>fizz($n)</code> повертає <code>'Fizz'</code> для кратних трьом, <code>'Buzz'</code> для кратних п'яти й число рядком в решті випадків. Таблиця <code>[3 =&gt; 'Fizz', 5 =&gt; 'Buzz', 15 =&gt; 'FizzBuzz', 7 =&gt; '7']</code> займає чотири рядки, а перевіряє чотири гілки логіки. Додати п'яту гілку означає дописати один рядок у таблицю.",
      "Назви випадків це половина користі. Якщо в таблиці є ключі на кшталт <code>'від'ємне число'</code> чи <code>'порожній рядок'</code>, то в звіті про збій одразу видно, який сценарій зламався. Без назв доведеться рахувати індекси. Корисно включати в таблицю межові значення: нуль, одиницю, максимум, порожній вхід, бо помилки живуть саме на межах.",
      "Пастки. Ключі масиву унікальні: якщо двічі написати <code>'нуль'</code> як ключ, другий випадок мовчки затре перший, і PHP не скаже ні слова, тож перевірка тихо зникне. Також цілі числа як ключі перетворюються на індекси, а рядок <code>'5'</code> стає числом <code>5</code>. Не змінюйте масив випадків по посиланню у <code>foreach (... as &amp;$row)</code>: після циклу посилання на останній елемент лишається живим.",
      "Ідіоми. Нехай очікуваний результат стоїть у кортежі першим або останнім, але завжди в одному й тому самому місці. Для виняткових випадків додайте окремий стовпчик із класом винятку. Лише одну дію на тест: таблиця не повинна змішувати перевірку значень і перевірку виключень. Хай розрахунок очікуваного результату буде записаний літерально, а не обчислений тією ж функцією, що й тестована.",
      "Ми навчились описувати поведінку чисельно й масово. Але реальний код рідко складається з чистих функцій: він викликає годинник, пошту, сховище. Щоб його теж тестувати без справжніх зовнішніх систем, потрібні замінники. Про стаби, фейки й моки, написані вручну без жодної бібліотеки, поговоримо в наступному уроці.",
    ],
    code: [
      String.raw`<?php
// Спершу без таблиці: повторюється один і той самий рядок
function fizz(int $n): string
{
    if ($n % 15 === 0) {
        return 'FizzBuzz';
    }
    if ($n % 3 === 0) {
        return 'Fizz';
    }
    if ($n % 5 === 0) {
        return 'Buzz';
    }
    return (string) $n;
}

assert(fizz(3) === 'Fizz');
assert(fizz(5) === 'Buzz');
assert(fizz(15) === 'FizzBuzz');
assert(fizz(7) === '7');
echo "чотири перевірки, чотири майже однакові рядки\n";
`,
      String.raw`<?php
// Табличний тест: назва випадку => [вхід, очікуване]
function test(string $name, callable $fn): void
{
    try {
        $fn();
        echo "ok   $name\n";
    } catch (Throwable $e) {
        echo "FAIL $name: ", $e->getMessage(), "\n";
    }
}

function assertSame(mixed $expected, mixed $actual): void
{
    if ($expected !== $actual) {
        throw new AssertionError('очікували ' . var_export($expected, true) . ', отримали ' . var_export($actual, true));
    }
}

function slug(string $s): string
{
    return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($s)), '-');
}

$cases = [
    'звичайні слова'    => ['Hello World', 'hello-world'],
    'зайві пробіли'     => ['  a   b  ', 'a-b'],
    'знаки пунктуації'  => ['Hi, there!', 'hi-there'],
    'порожній рядок'    => ['', ''],
];

foreach ($cases as $name => [$input, $expected]) {
    test("slug: $name", fn() => assertSame($expected, slug($input)));
}
`,
      String.raw`<?php
// поведінка, що дивує: повторений ключ мовчки затирає випадок
$cases = [
    'нуль'  => [0, 'zero'],
    'один'  => [1, 'one'],
    'нуль'  => [0, 'ZERO'],
];

echo count($cases), " випадки замість трьох\n";
echo $cases['нуль'][1], "\n";

$byNumber = [5 => 'a', '5' => 'b'];
echo count($byNumber), ' ', $byNumber[5], "\n";
`,
      String.raw`<?php
// аварія: у таблиці помилка, і назва випадку вказує на неї
function test(string $name, callable $fn): void
{
    try {
        $fn();
        echo "ok   $name\n";
    } catch (Throwable $e) {
        echo "FAIL $name: ", $e->getMessage(), "\n";
        $GLOBALS['failed'] = ($GLOBALS['failed'] ?? 0) + 1;
    }
}

function assertSame(mixed $expected, mixed $actual): void
{
    if ($expected !== $actual) {
        throw new AssertionError('очікували ' . var_export($expected, true) . ', отримали ' . var_export($actual, true));
    }
}

function clamp(int $v, int $lo, int $hi): int
{
    return max($lo, min($hi, $v));
}

$cases = [
    'усередині діапазону' => [5, 0, 10, 5],
    'нижче межі'          => [-3, 0, 10, 0],
    'вище межі'           => [42, 0, 10, 10],
    'рівно на межі'       => [10, 0, 10, 9],
];

foreach ($cases as $name => [$v, $lo, $hi, $expected]) {
    test("clamp: $name", fn() => assertSame($expected, clamp($v, $lo, $hi)));
}

exit(($GLOBALS['failed'] ?? 0) > 0 ? 1 : 0);
`,
    ],
    note: "Табличний тест відокремлює дані від логіки: масив, де ключ це назва, а значення це вхід і очікуване і один цикл. Давайте випадкам змістовні назви й межові значення, а ключі не повторюйте: дублікат мовчки затре попередній випадок.",
    work: "У PHPUnit це data provider, у Pest це <code>with()</code>, а в самописних скриптах просто масив. Так перевіряють валідатори, форматери, калькулятори цін, розбір рядків, де входів багато, а логіка одна.",
    tasks: [
      "Що станеться, якщо в масиві випадків двічі вжити один ключ?",
      "Навіщо давати кожному випадку в таблиці власну назву?",
    ],
  },
  {
    t: "Стаби й моки вручну",
    ch: "Тестування й якість",
    adv: true,
    easy: "Стаб це дублер у кіно: стоїть замість зірки в небезпечній сцені й виконує завчений рух. Мок ще й веде щоденник: хто підійшов, скільки разів і що сказав, а потім режисер звіряє записи.",
    p: [
      "Реальний код залежить від годинника, пошти, бази, зовнішнього API. Якщо тест викликає їх по-справжньому, він повільний, нестабільний і може надіслати лист клієнтам. Рішення: сховати залежність за інтерфейсом і в тесті підставити замінник. Це не потребує бібліотек: у PHP інтерфейс і анонімний клас пишуться за кілька рядків.",
      "Модель у голові: є чотири види замінників. <b>Стаб</b> повертає завчені відповіді й нічого не запам'ятовує. <b>Фейк</b> це спрощена робоча реалізація, наприклад сховище в масиві. <b>Шпигун</b> (spy) записує виклики, щоб ви перевірили їх після дії. <b>Мок</b> ще й заздалегідь знає очікування й падає, якщо виклики не збіглися. Межі між ними розмиті, головне розуміти ідею.",
      "Щоб підмінити залежність, клас має отримувати її ззовні, а не створювати всередині: <code>new</code> у конструкторі жорстко приклеює реальну реалізацію. Передавайте залежність через конструктор, а в типі пишіть інтерфейс. Тоді <code>new OrderService(new FakeClock(...), $spyMailer)</code> у тесті й справжні об'єкти у продакшені працюють з тим самим кодом.",
      "Анонімний клас <code>new class implements Clock { ... }</code> робить стаб прямо в тесті: без окремого файлу й без імені. Для запису викликів додайте публічний масив <code>$sent</code>, у який метод пушить аргументи. Після дії тест перевіряє <code>count($mailer-&gt;sent)</code> і зміст записів звичайним <code>assertSame</code>. Фіксований час нагадує ідею детермінованості з уроку про дати.",
      "Пастки. Надмірні моки: коли тест перевіряє, у якому порядку викликані внутрішні методи, він ламається при будь-якому рефакторингу, хоча поведінка не змінилась. Друга пастка: замінник розходиться зі справжнім об'єктом, тест зелений, а продакшен падає. Тому перевіряйте результат і видимі наслідки (лист пішов, запис збережено), а не внутрішні деталі, і мокайте лише межі системи.",
      "Ідіоми. Якщо можна, віддавайте перевагу фейку перед моком: він ближчий до реальності. Не мокайте те, чим володієте й що швидке: звичайні значення й прості класи беріть справжні. Для часу вводьте інтерфейс <code>Clock</code>, для випадковості інтерфейс генератора. Один тест налаштовує щонайбільше один-два замінники, інакше клас має забагато залежностей. Якщо замінників доводиться робити п'ять і більше, це сигнал, що клас робить забагато й його варто розділити.",
      "Ми можемо тестувати код ізольовано від зовнішнього світу. Лишається питання процесу: коли писати тест, до коду чи після, і чи можна автоматично знаходити помилки ще до запуску. Останній урок глави покаже цикл TDD, знайомство з PHPUnit і те, як статичний аналіз ловить помилки типів.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

// Залежність за інтерфейсом, у тесті фіксований час
interface Clock
{
    public function hour(): int;
}

final class Greeter
{
    public function __construct(private Clock $clock) {}

    public function greet(string $name): string
    {
        $part = $this->clock->hour() < 12 ? 'Доброго ранку' : 'Добрий день';
        return "$part, $name!";
    }
}

$morning = new class implements Clock {
    public function hour(): int { return 9; }
};
$evening = new class implements Clock {
    public function hour(): int { return 18; }
};

echo (new Greeter($morning))->greet('Олена'), "\n";
echo (new Greeter($evening))->greet('Олена'), "\n";
`,
      String.raw`<?php
declare(strict_types=1);

// Фейк: робоче сховище в масиві замість бази
interface Notes
{
    public function save(string $text): int;
    public function find(int $id): ?string;
}

final class InMemoryNotes implements Notes
{
    private array $rows = [];

    public function save(string $text): int
    {
        $id = count($this->rows) + 1;
        $this->rows[$id] = $text;
        return $id;
    }

    public function find(int $id): ?string
    {
        return $this->rows[$id] ?? null;
    }
}

$notes = new InMemoryNotes();
$id = $notes->save('купити хліб');
echo $id, ': ', $notes->find($id), "\n";
var_dump($notes->find(99));
`,
      String.raw`<?php
declare(strict_types=1);

// Шпигун: записує виклики, а тест перевіряє їх після дії
interface Mailer
{
    public function send(string $to, string $subject): void;
}

final class SpyMailer implements Mailer
{
    public array $sent = [];

    public function send(string $to, string $subject): void
    {
        $this->sent[] = [$to, $subject];
    }
}

final class Signup
{
    public function __construct(private Mailer $mailer) {}

    public function register(string $email): void
    {
        if (!str_contains($email, '@')) {
            throw new InvalidArgumentException("некоректний email: $email");
        }
        $this->mailer->send($email, 'Ласкаво просимо');
    }
}

$spy = new SpyMailer();
$signup = new Signup($spy);
$signup->register('ann@example.com');
assert(count($spy->sent) === 1);
assert($spy->sent[0] === ['ann@example.com', 'Ласкаво просимо']);
echo "надіслано листів: ", count($spy->sent), "\n";

try {
    $signup->register('нісенітниця');
} catch (InvalidArgumentException $e) {
    echo $e->getMessage(), "\n";
}
assert(count($spy->sent) === 1, 'на некоректний email лист не йде');
echo "після помилки листів досі ", count($spy->sent), "\n";
`,
      String.raw`<?php
// аварія: мок із очікуваною кількістю викликів виявляє зайвий лист
declare(strict_types=1);

final class MockMailer
{
    private int $calls = 0;

    public function __construct(private int $expected) {}

    public function send(string $to): void
    {
        $this->calls++;
    }

    public function verify(): void
    {
        if ($this->calls !== $this->expected) {
            throw new AssertionError("очікували викликів: {$this->expected}, було: {$this->calls}");
        }
    }
}

function notifyAll(MockMailer $m, array $emails): void
{
    foreach ($emails as $e) {
        $m->send($e);
        $m->send($e);
    }
}

$mock = new MockMailer(2);
notifyAll($mock, ['a@x.com', 'b@x.com']);
$mock->verify();
echo "сюди не дійдемо\n";
`,
    ],
    note: "Стаб повертає завчені відповіді, фейк це проста робоча реалізація, шпигун записує виклики, мок сам звіряє очікування. Залежності передавайте через конструктор за інтерфейсом, а перевіряйте видимий результат, не внутрішні деталі.",
    work: "Так тестують сервіси, що надсилають пошту, платять, читають годинник чи ходять у зовнішні API: у тесті підставляють фейкові Mailer, Gateway, Clock і перевіряють, що система зробила, не виконуючи справжніх дій.",
    tasks: [
      "Чим стаб відрізняється від шпигуна?",
      "Чому залежність передають у конструктор, а не створюють через new всередині?",
    ],
  },
  {
    t: "TDD, PHPUnit і статичний аналіз",
    ch: "Тестування й якість",
    adv: true,
    easy: "TDD схожий на малювання по контуру: спершу накреслюєш обрис майбутньої деталі, потім заповнюєш його фарбою рівно до ліній. Статичний аналіз працює як коректор, що підкреслює помилки ще до друку.",
    p: [
      "Досі ми писали тести після коду. TDD (test-driven development) обертає порядок: спершу тест, який падає, потім найпростіший код, щоб він пройшов, потім прибирання. Цикл називають «червоний, зелений, рефакторинг». Перевага в тому, що тест відразу фіксує бажаний контракт, а код не містить зайвого, бо кожен рядок з'явився заради тесту, що падав.",
      "Модель у голові: три такти по кілька хвилин. Червоний: пишете один тест на ще не існуючу поведінку й бачите, що він падає саме з очікуваною причиною. Зелений: пишете мінімум коду, навіть наївного, щоб тест пройшов. Рефакторинг: покращуєте структуру, не чіпаючи поведінки, а тести підтверджують, що нічого не зламано. Потім наступний тест.",
      "Те, що ми писали руками, у реальних проєктах робить PHPUnit. Його ставлять через Composer як залежність для розробки: <code>composer require --dev phpunit/phpunit</code>. Тест це клас із методами, назви яких починаються з <code>test</code> або які позначені атрибутом <code>#[Test]</code>. Усередині методи <code>assertSame</code>, <code>assertCount</code>, <code>expectException</code>, а набори даних віддає метод з атрибутом <code>#[DataProvider]</code>. Запуск: <code>vendor/bin/phpunit</code>.",
      "Статичний аналіз перевіряє код, не запускаючи його. PHPStan і Psalm читають типи, докблоки й потік керування та знаходять виклик неіснуючого методу, передачу рядка замість числа, значення <code>null</code>, яке ніхто не перевірив. Ці інструменти мають рівні суворості: PHPStan від 0 до 9, і на старті беруть невисокий рівень, поступово піднімаючи його. Команда виглядає як <code>vendor/bin/phpstan analyse src --level=6</code>.",
      "Пастки. Тест, що жодного разу не бачили червоним, може бути хибним: він завжди зелений. Тому в TDD червоний крок обов'язковий. Друга пастка: стовідсоткове покриття не означає якості, бо рядок виконано, але нічого не перевірено. І тести, і аналізатор нічого не гарантують там, де їх немає: типи в докблоках мовою PHP не примусові й можуть брехати, а оператор <code>==</code> усе одно подає сюрпризи.",
      "Ідіоми. Запускайте тести й аналізатор у CI на кожен запит на злиття. Додайте їх у <code>composer.json</code> як скрипти (<code>composer test</code>, <code>composer stan</code>). Пишіть тест першим для виправлення помилки: спочатку відтворіть її в тесті, потім виправляйте. Для старого коду вводьте аналізатор через baseline, що фіксує наявні помилки, щоб нові не з'являлися.",
      "Цим завершується глава про якість: від одного <code>assert</code> до стенда, табличних тестів, замінників і процесу TDD. Далі ми застосуємо ці навички в наступній главі, де будуємо запити й сервіси: клас <code>Request</code> і <code>Response</code>, маршрути й JSON-API, і кожну частину можна відразу покривати власними тестами.",
    ],
    code: [
      String.raw`<?php
// аварія: червоний крок TDD, тест написано, а функції ще немає
function test(string $name, callable $fn): void
{
    try {
        $fn();
        echo "ok   $name\n";
    } catch (Throwable $e) {
        echo "FAIL $name: ", get_class($e), ': ', $e->getMessage(), "\n";
        $GLOBALS['failed'] = true;
    }
}

test('перша літера велика', function () {
    assert(capitalize('привіт') === 'Привіт');
});

echo "червоний: тест падає, бо capitalize ще не існує\n";
exit(empty($GLOBALS['failed']) ? 0 : 1);
`,
      String.raw`<?php
// Зелений крок і рефакторинг: мінімальна реалізація, тести лишаються
function test(string $name, callable $fn): void
{
    try {
        $fn();
        echo "ok   $name\n";
    } catch (Throwable $e) {
        echo "FAIL $name: ", $e->getMessage(), "\n";
    }
}

function capitalize(string $s): string
{
    if ($s === '') {
        return '';
    }
    return mb_strtoupper(mb_substr($s, 0, 1)) . mb_substr($s, 1);
}

test('перша літера велика', fn() => assert(capitalize('привіт') === 'Привіт'));
test('порожній рядок', fn() => assert(capitalize('') === ''));
test('вже велика', fn() => assert(capitalize('Hello') === 'Hello'));
test('решта не змінюється', fn() => assert(capitalize('hELLO') === 'HELLO'));
`,
      String.raw`<?php
// фрагмент: клас PHPUnit 10+, запускається командою vendor/bin/phpunit
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CapitalizeTest extends TestCase
{
    public function testFirstLetterBecomesUpper(): void
    {
        $this->assertSame('Привіт', capitalize('привіт'));
    }

    #[DataProvider('cases')]
    public function testCases(string $input, string $expected): void
    {
        $this->assertSame($expected, capitalize($input));
    }

    public static function cases(): array
    {
        return [
            'порожній рядок' => ['', ''],
            'вже велика'     => ['Hello', 'Hello'],
        ];
    }

    public function testRejectsNonString(): void
    {
        $this->expectException(TypeError::class);
        capitalize(null);
    }
}
`,
      String.raw`// фрагмент: Composer, phpstan.neon і команди термінала
// composer require --dev phpunit/phpunit phpstan/phpstan
//
// phpstan.neon
// parameters:
//     level: 6
//     paths:
//         - src
//         - tests
//
// composer.json (скрипти)
// "scripts": {
//     "test": "phpunit",
//     "stan": "phpstan analyse"
// }
//
// запуск:  composer test   і   composer stan`,
      String.raw`<?php
declare(strict_types=1);

// Що ловить аналізатор: тип параметра суперечить виклику
function total(int $price, int $qty): int
{
    return $price * $qty;
}

echo total(100, 3), "\n";

// PHPStan на рівні 5 і вище вказав би на наступний рядок ще до запуску,
// а під час запуску PHP із strict_types кидає TypeError
try {
    echo total('100', 3), "\n";
} catch (TypeError $e) {
    echo "TypeError: ", $e->getMessage(), "\n";
}
`,
    ],
    note: "TDD це цикл «червоний, зелений, рефакторинг»: тест, що падає, мінімальний код, прибирання. PHPUnit автоматизує запуск, а PHPStan і Psalm ловлять помилки типів без запуску коду. Усе це краще крутити в CI.",
    work: "У кожному серйозному PHP-проєкті CI запускає PHPUnit і PHPStan на кожен запит на злиття. Помилку з продакшену відтворюють спершу тестом, що падає, і лише потім правлять код, щоб вона не повернулась.",
    tasks: [
      "Навіщо в TDD спершу бачити тест червоним?",
      "Що перевіряє статичний аналіз, не запускаючи програму?",
    ],
  },
];
