// ЧЕРНЕТКИ проєктів за ТЗ для PHP. Не підключені до сайту (див. types.ts).
// Код користувача починається з <?php і не закривається тегом ?>, harness дописується після нього і теж є PHP-кодом.
// Форми й сесії в консолі недоступні, тому дані форми імітуємо масивом, як $_POST; бази даних і мережі в пісочниці немає.
import type { ProgramProject } from "./types.ts";

// Спільний початок harness: помічники друкують «R<n> PASS» або «R<n> FAIL: причина» і ніколи не валять весь запуск.
// _eq порівнює за значенням: 100.0 і 100 однакові, порядок ключів в асоціативних масивах неважливий (порядок списків важливий).
const HELPERS = `function _canon($v) {
    if (is_float($v)) {
        return $v == floor($v) && abs($v) < 1e15 ? (int)$v : $v;
    }
    if (is_array($v)) {
        $out = array_map('_canon', $v);
        if (!array_is_list($out)) ksort($out);
        return $out;
    }
    return $v;
}

function _json($v): string {
    return json_encode(_canon($v), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
}

function _eq($got, $exp): void {
    if (_json($got) !== _json($exp)) {
        throw new Exception("очікувалось " . _json($exp) . ", отримано " . _json($got));
    }
}

function _throws(string $cls, callable $fn, string $what): void {
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $cls) return;
        throw new Exception($what . ": очікувалась " . $cls . ", отримано " . get_class($e));
    }
    throw new Exception($what . ": очікувалась помилка " . $cls . ", але її не було");
}

function _r(string $id, callable $fn): void {
    try {
        $fn();
        echo $id . " PASS\\n";
    } catch (Throwable $e) {
        echo $id . " FAIL: " . str_replace("\\n", " ", $e->getMessage()) . "\\n";
    }
}
`;

const cartHarness = `${HELPERS}
$_mouse = ['sku' => 'M1', 'name' => 'Мишка', 'price' => 350.0, 'qty' => 2];
$_pad = ['sku' => 'B7', 'name' => 'Блокнот', 'price' => 40.0, 'qty' => 3];
$_cable = ['sku' => 'K2', 'name' => 'Кабель', 'price' => 60.0, 'qty' => 2];
$_cart = [$_mouse, $_pad, $_cable];

_r("R1", function () use ($_mouse, $_pad) {
    $c = addToCart([], 'M1', 'Мишка', 350, 2);
    _eq($c, [$_mouse]);
    $c = addToCart($c, 'B7', 'Блокнот', 40.0, 3);
    _eq($c, [$_mouse, $_pad]);
    $c = addToCart([], 'B7', 'Блокнот', 40);
    _eq($c[0]['qty'], 1);
    _eq(count($c), 1);
});

_r("R2", function () use ($_mouse, $_pad) {
    $c = addToCart([$_mouse, $_pad], 'M1', 'Мишка', 350, 3);
    _eq(count($c), 2);
    _eq($c[0]['qty'], 5);
    _eq($c[1], $_pad);
    $c = addToCart($c, 'M1', 'Мишка (нова ціна)', 999, 1);
    _eq($c[0]['qty'], 6);
    _eq($c[0]['price'], 350);
    _eq($c[0]['name'], 'Мишка');
});

_r("R3", function () use ($_mouse) {
    _throws(InvalidArgumentException::class, fn() => addToCart([], 'A', 'А', 10, 0), "кількість 0");
    _throws(InvalidArgumentException::class, fn() => addToCart([$_mouse], 'M1', 'Мишка', 350, -2), "кількість -2");
    _throws(InvalidArgumentException::class, fn() => addToCart([], 'A', 'А', -1, 1), "ціна -1");
    _eq(count(addToCart([], 'A', 'А', 0, 1)), 1);
});

_r("R4", function () use ($_mouse, $_pad, $_cable) {
    _eq(removeFromCart([$_mouse, $_pad, $_cable], 'M1'), [$_pad, $_cable]);
    _eq(removeFromCart([$_mouse, $_pad, $_cable], 'B7'), [$_mouse, $_cable]);
    _eq(removeFromCart([$_mouse], 'M1'), []);
    _eq(removeFromCart([$_mouse, $_pad], 'XX'), [$_mouse, $_pad]);
    _eq(removeFromCart([], 'M1'), []);
});

_r("R5", function () use ($_cart) {
    _eq(cartTotal($_cart), 700 + 120 + 120);
    _eq(cartTotal([]), 0);
    $odd = [['sku' => 'a', 'name' => 'А', 'price' => 19.99, 'qty' => 3], ['sku' => 'b', 'name' => 'Б', 'price' => 0.1, 'qty' => 3]];
    _eq(cartTotal($odd), 60.27);
    if (!is_float(cartTotal([]))) throw new Exception("cartTotal має повертати float");
});

_r("R6", function () {
    _eq(applyPromo(1300, 'SALE10'), 1170);
    _eq(applyPromo(1300, ' sale10 '), 1170);
    _eq(applyPromo(33.33, 'SALE10'), 30);
    _eq(applyPromo(1300, 'SAVE50'), 1250);
    _eq(applyPromo(30, 'save50'), 0);
    _eq(applyPromo(50, 'SAVE50'), 0);
    _throws(InvalidArgumentException::class, fn() => applyPromo(100, 'HELLO'), "невідомий код");
    _throws(InvalidArgumentException::class, fn() => applyPromo(100, ''), "порожній код");
});

_r("R7", function () use ($_cart) {
    _eq(cartSummary($_cart), "Блокнот × 3 = 120.00\\nКабель × 2 = 120.00\\nМишка × 2 = 700.00\\nРазом: 940.00");
    _eq(cartSummary([]), "Кошик порожній");
    $one = [['sku' => 'a', 'name' => 'Хліб', 'price' => 25.5, 'qty' => 1]];
    _eq(cartSummary($one), "Хліб × 1 = 25.50\\nРазом: 25.50");
});

_r("R8", function () use ($_cart) {
    $rev = array_reverse($_cart);
    _eq(topItems($_cart, 2), ['Мишка', 'Блокнот']);
    _eq(topItems($rev, 2), ['Мишка', 'Блокнот']);
    _eq(topItems($rev, 10), ['Мишка', 'Блокнот', 'Кабель']);
    _eq(topItems($_cart, 0), []);
    _eq(topItems([], 3), []);
    _eq(topItems($_cart, 1), ['Мишка']);
});
`;

const formHarness = `${HELPERS}
function _good(array $over = []): array {
    return $over + [
        'name' => 'Марія', 'email' => 'maria@example.com', 'password' => 'qwerty123', 'password2' => 'qwerty123',
        'age' => '25', 'agree' => 'on',
    ];
}

function _errs(array $over): array {
    return validateRegistration(_good($over));
}

_r("R1", function () {
    _eq(cleanText("  Марія   Іванівна "), "Марія Іванівна");
    _eq(cleanText("<b>Іван</b>"), "Іван");
    _eq(cleanText("Олег\\n\\tПетренко"), "Олег Петренко");
    _eq(cleanText("<script>alert(1)</script>Ок"), "alert(1)Ок");
    _eq(cleanText(""), "");
    _eq(cleanText("   "), "");
});

_r("R2", function () {
    _eq(validateRegistration(_good()), []);
    _eq(validateRegistration(_good(['agree' => '1', 'age' => '14', 'name' => 'Ян'])), []);
    _eq(validateRegistration(_good(['age' => ' 120 ', 'email' => 'i.petrenko+news@mail.ua'])), []);
});

_r("R3", function () {
    $e = validateRegistration([]);
    _eq(array_keys($e), ['name', 'email', 'password', 'age', 'agree']);
    _eq($e['name'], "Вкажіть ім'я");
    _eq($e['email'], "Вкажіть email");
    _eq($e['password'], "Вкажіть пароль");
    _eq($e['age'], "Вкажіть вік");
    _eq($e['agree'], "Потрібна згода з правилами");
});

_r("R4", function () {
    _eq(_errs(['name' => '   ']), ['name' => "Вкажіть ім'я"]);
    _eq(_errs(['name' => 'А']), ['name' => "Ім'я: від 2 до 30 символів"]);
    _eq(_errs(['name' => str_repeat('а', 31)]), ['name' => "Ім'я: від 2 до 30 символів"]);
    _eq(_errs(['name' => str_repeat('я', 30)]), []);
    _eq(_errs(['name' => 'Юр']), []);
    _eq(_errs(['name' => '  Олена   Коваль  ']), []);
});

_r("R5", function () {
    _eq(_errs(['email' => '']), ['email' => 'Вкажіть email']);
    foreach (['maria@', 'maria', '@example.com', 'ma ria@example.com', 'maria@@example.com', 'maria@example'] as $bad) {
        _eq(_errs(['email' => $bad]), ['email' => 'Некоректний email']);
    }
    _eq(_errs(['email' => ' maria@example.com ']), []);
});

_r("R6", function () {
    $e = validateRegistration(_good(['password' => '', 'password2' => '']));
    _eq($e, ['password' => 'Вкажіть пароль']);
    _eq(validateRegistration(_good(['password' => 'ab1', 'password2' => 'ab1'])), ['password' => 'Пароль: щонайменше 8 символів']);
    _eq(validateRegistration(_good(['password' => 'abc1234', 'password2' => 'abc1234'])), ['password' => 'Пароль: щонайменше 8 символів']);
    _eq(validateRegistration(_good(['password' => 'qwertyuiop', 'password2' => 'qwertyuiop'])), ['password' => 'Пароль має містити літеру й цифру']);
    _eq(validateRegistration(_good(['password' => '12345678', 'password2' => '12345678'])), ['password' => 'Пароль має містити літеру й цифру']);
    _eq(validateRegistration(_good(['password' => 'пароль2026', 'password2' => 'пароль2026'])), []);
    _eq(validateRegistration(_good(['password' => 'abcdefg1', 'password2' => 'abcdefg1'])), []);
});

_r("R7", function () {
    _eq(_errs(['password2' => 'qwerty124']), ['password2' => 'Паролі не збігаються']);
    _eq(_errs(['password2' => '']), ['password2' => 'Паролі не збігаються']);
    _eq(_errs(['password2' => 'QWERTY123']), ['password2' => 'Паролі не збігаються']);
});

_r("R8", function () {
    foreach (['14', '120', '35', ' 20 '] as $ok) _eq(_errs(['age' => $ok]), []);
    foreach (['13', '121', 'abc', '3.5', '-5', '0', '1e2', '+30'] as $bad) {
        _eq(_errs(['age' => $bad]), ['age' => 'Вік: ціле число від 14 до 120']);
    }
    _eq(_errs(['age' => '']), ['age' => 'Вкажіть вік']);
});

_r("R9", function () {
    _eq(_errs(['agree' => 'on']), []);
    _eq(_errs(['agree' => '1']), []);
    foreach (['', 'off', '0', 'yes', 'ON'] as $bad) _eq(_errs(['agree' => $bad]), ['agree' => 'Потрібна згода з правилами']);
    $p = _good();
    unset($p['agree']);
    _eq(validateRegistration($p), ['agree' => 'Потрібна згода з правилами']);
});

_r("R10", function () {
    _eq(errorsToHtml([]), "");
    _eq(errorsToHtml(['a' => 'Перша']), '<ul class="errors"><li>Перша</li></ul>');
    _eq(errorsToHtml(['a' => 'Перша', 'b' => 'Друга']), '<ul class="errors"><li>Перша</li><li>Друга</li></ul>');
    _eq(errorsToHtml(['x' => "Ім'я: від 2"]), '<ul class="errors"><li>Ім&#039;я: від 2</li></ul>');
    _eq(errorsToHtml(['x' => '<b>1</b> & "q"']), '<ul class="errors"><li>&lt;b&gt;1&lt;/b&gt; &amp; &quot;q&quot;</li></ul>');
});
`;

const hotelHarness = `${HELPERS}
function _hotel(): Hotel {
    $h = new Hotel();
    $h->addRoom(new Room(101, 'standard', 800));
    $h->addRoom(new Room(102, 'standard', 850.5));
    $h->addRoom(new Room(201, 'suite', 2000));
    return $h;
}

_r("R1", function () {
    $r = new Room(101, 'standard', 800);
    _eq($r->number, 101);
    _eq($r->type, 'standard');
    _eq($r->pricePerNight(), 800);
    _eq($r->costFor(3), 2400);
    _eq((new Room(5, 'suite', 99.99))->costFor(3), 299.97);
    _throws(Error::class, function () use ($r) { $r->number = 5; }, "зміна number");
    _throws(Error::class, function () use ($r) { $r->type = 'suite'; }, "зміна type");
});

_r("R2", function () {
    _throws(InvalidArgumentException::class, fn() => new Room(0, 'standard', 100), "номер 0");
    _throws(InvalidArgumentException::class, fn() => new Room(-3, 'standard', 100), "номер -3");
    _throws(InvalidArgumentException::class, fn() => new Room(1, 'penthouse', 100), "невідомий тип");
    _throws(InvalidArgumentException::class, fn() => new Room(1, 'standard', 0), "ціна 0");
    _throws(InvalidArgumentException::class, fn() => new Room(1, 'standard', -10), "ціна -10");
    _eq((new Room(7, 'suite', 1))->number, 7);
});

_r("R3", function () {
    $h = _hotel();
    _throws(BookingException::class, fn() => $h->addRoom(new Room(101, 'suite', 5000)), "дублікат номера");
    _eq($h->freeRooms('2026-12-01', '2026-12-02'), [101, 102, 201]);
    $h->addRoom(new Room(301, 'suite', 3000));
    _eq(count($h->freeRooms('2026-12-01', '2026-12-02')), 4);
});

_r("R4", function () {
    $h = _hotel();
    _eq($h->book(101, 'Марія', '2026-12-01', '2026-12-04'), 2400);
    _eq($h->book(102, 'Ігор', '2026-12-10', '2026-12-11'), 850.5);
    _eq($h->book(201, 'Ольга', '2026-02-27', '2026-03-02'), 6000);
    _eq($h->isFree(101, '2026-12-01', '2026-12-04'), false);
});

_r("R5", function () {
    $h = _hotel();
    _throws(BookingException::class, fn() => $h->book(999, 'А', '2026-12-01', '2026-12-02'), "номера немає");
    _throws(BookingException::class, fn() => $h->book(101, 'А', '2026-12-05', '2026-12-05'), "нуль ночей");
    _throws(BookingException::class, fn() => $h->book(101, 'А', '2026-12-05', '2026-12-01'), "виїзд раніше");
    _throws(BookingException::class, fn() => $h->book(101, 'А', '2026-13-01', '2027-02-01'), "13-й місяць");
    _throws(BookingException::class, fn() => $h->book(101, 'А', '2026-02-30', '2026-03-05'), "30 лютого");
    _throws(BookingException::class, fn() => $h->book(101, 'А', '01.12.2026', '04.12.2026'), "формат дати");
    _throws(BookingException::class, fn() => $h->book(101, 'А', 'вчора', 'завтра'), "не дата");
    _eq($h->bookingsOf('А'), []);
});

_r("R6", function () {
    $h = _hotel();
    $h->book(101, 'Марія', '2026-12-10', '2026-12-15');
    foreach ([['2026-12-12', '2026-12-13'], ['2026-12-08', '2026-12-11'], ['2026-12-14', '2026-12-20'], ['2026-12-01', '2026-12-30'], ['2026-12-10', '2026-12-15']] as [$a, $b]) {
        _throws(BookingException::class, fn() => $h->book(101, 'Інший', $a, $b), "перетин $a — $b");
    }
    _eq($h->book(101, 'До', '2026-12-05', '2026-12-10'), 4000);
    _eq($h->book(101, 'Після', '2026-12-15', '2026-12-16'), 800);
    _eq($h->book(102, 'Сусід', '2026-12-10', '2026-12-15'), 4252.5);
    _eq(count($h->bookingsOf('Інший')), 0);
});

_r("R7", function () {
    $h = _hotel();
    $h->addRoom(new Room(50, 'standard', 500));
    $h->book(101, 'Марія', '2026-12-10', '2026-12-15');
    $h->book(201, 'Ігор', '2026-12-12', '2026-12-14');
    _eq($h->isFree(101, '2026-12-15', '2026-12-17'), true);
    _eq($h->isFree(101, '2026-12-14', '2026-12-16'), false);
    _eq($h->isFree(777, '2026-12-14', '2026-12-16'), false);
    _eq($h->freeRooms('2026-12-11', '2026-12-13'), [50, 102]);
    _eq($h->freeRooms('2026-12-11', '2026-12-13', 'suite'), []);
    _eq($h->freeRooms('2026-12-14', '2026-12-16', 'suite'), [201]);
    _eq($h->freeRooms('2026-12-01', '2026-12-02', 'standard'), [50, 101, 102]);
    _eq($h->freeRooms('2026-12-20', '2026-12-21'), [50, 101, 102, 201]);
});

_r("R8", function () {
    $h = _hotel();
    $h->book(201, 'Марія', '2026-12-20', '2026-12-22');
    $h->book(101, 'Ігор', '2026-12-01', '2026-12-02');
    $h->book(102, 'Марія', '2026-12-01', '2026-12-04');
    _eq($h->bookingsOf('Марія'), [
        ['room' => 201, 'from' => '2026-12-20', 'to' => '2026-12-22', 'nights' => 2, 'cost' => 4000],
        ['room' => 102, 'from' => '2026-12-01', 'to' => '2026-12-04', 'nights' => 3, 'cost' => 2551.5],
    ]);
    _eq($h->bookingsOf('Ігор'), [['room' => 101, 'from' => '2026-12-01', 'to' => '2026-12-02', 'nights' => 1, 'cost' => 800]]);
    _eq($h->bookingsOf('Ніхто'), []);
});

_r("R9", function () {
    $h = _hotel();
    _eq($h->revenue(), 0);
    $h->book(201, 'Марія', '2026-12-20', '2026-12-22');
    $h->book(102, 'Ігор', '2026-12-01', '2026-12-04');
    try {
        $h->book(201, 'Спізнився', '2026-12-21', '2026-12-23');
    } catch (BookingException $e) {
    }
    _eq($h->revenue(), 6551.5);
    if (!is_float($h->revenue())) throw new Exception("revenue() має повертати float");
});
`;

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "php-cart",
    lang: "php",
    lesson: "php/6",
    title: "Проєкт: кошик покупок",
    xp: 50,
    context:
      "Кошик — це масив масивів, і з ним працює майже кожен інтернет-магазин: додати товар, об'єднати однакові, порахувати суму, застосувати промокод. Усе це чисті функції над масивами, без бази даних, тож їх легко перевіряти.",
    brief: [
      "Напишіть набір функцій для кошика. Кошик — звичайний масив рядків-товарів; кожна функція повертає <b>новий</b> масив, а не змінює глобальний стан.",
      "Некоректні дані (кількість менша за 1, від'ємна ціна, невідомий промокод) — це помилка програміста або користувача, а не «0 грн»: кидайте <code>InvalidArgumentException</code>.",
    ],
    contract: [
      "товар у кошику: <code>['sku' => 'M1', 'name' => 'Мишка', 'price' => 350.0, 'qty' => 2]</code>;",
      "<code>addToCart(array $cart, string $sku, string $name, float $price, int $qty = 1): array</code>: додає новий товар у кінець; якщо такий <code>sku</code> уже є, збільшує <code>qty</code>, а ім'я та ціна лишаються старими; <code>qty &lt; 1</code> або <code>price &lt; 0</code> — <code>InvalidArgumentException</code>;",
      "<code>removeFromCart(array $cart, string $sku): array</code>: прибирає товар; ключі нового масиву йдуть підряд (0, 1, 2…); невідомий <code>sku</code> нічого не змінює;",
      "<code>cartTotal(array $cart): float</code>: сума <code>price × qty</code>, округлена до 2 знаків;",
      "<code>applyPromo(float $total, string $code): float</code>: <code>SALE10</code> — мінус 10%, <code>SAVE50</code> — мінус 50 (не нижче 0); регістр і пробіли навколо коду не важливі; невідомий код — <code>InvalidArgumentException</code>; результат округлений до 2 знаків;",
      "<code>cartSummary(array $cart): string</code>: рядки <code>Назва × кількість = сума</code> (сума з двома знаками, за алфавітом назв), останній рядок <code>Разом: сума</code>; для порожнього кошика <code>Кошик порожній</code>; рядки розділені <code>\\n</code>;",
      "<code>topItems(array $cart, int $n): array</code>: назви <code>n</code> товарів із найбільшою сумою рядка, від більшої до меншої; при рівності за алфавітом.",
    ],
    requirements: [
      { id: "R1", text: "<code>addToCart</code> додає новий товар у кінець кошика; кількість за замовчуванням 1.", hint: "Новий елемент додається через <code>$cart[] = [...]</code>. Параметр із значенням за замовчуванням: <code>int $qty = 1</code>." },
      { id: "R2", text: "Якщо товар із таким <code>sku</code> уже є, <code>addToCart</code> збільшує його кількість; ім'я й ціна лишаються старими.", hint: "Пройдіться <code>foreach ($cart as $i => $item)</code> і змініть <code>$cart[$i]['qty']</code>. Масиви в PHP копіюються за значенням, тож вихідний кошик не зіпсується." },
      { id: "R3", text: "Кількість менша за 1 або від'ємна ціна кидають <code>InvalidArgumentException</code>; нульова ціна допустима.", hint: "<code>throw new InvalidArgumentException(\"…\");</code>. Перевірте дані на початку функції, до змін у кошику." },
      { id: "R4", text: "<code>removeFromCart</code> прибирає товар, перенумеровує ключі й не чіпає кошик, якщо <code>sku</code> невідомий.", hint: "<code>array_filter</code> зберігає старі ключі: загорніть результат у <code>array_values</code>." },
      { id: "R5", text: "<code>cartTotal</code> рахує суму <code>price × qty</code> усіх рядків, округлює до 2 знаків і завжди повертає <code>float</code> (для порожнього кошика <code>0.0</code>).", hint: "Початкове значення суми — <code>0.0</code>, наприкінці <code>round($sum, 2)</code>: так <code>0.1 × 3</code> не дасть хвоста з дев'ятками." },
      { id: "R6", text: "<code>applyPromo</code> застосовує <code>SALE10</code> і <code>SAVE50</code> без урахування регістру й крайніх пробілів, не опускається нижче 0 і кидає виняток для невідомого коду.", hint: "<code>strtoupper(trim($code))</code> + <code>match</code> або <code>switch</code>. Для «не нижче 0» підійде <code>max(0.0, …)</code>." },
      { id: "R7", text: "<code>cartSummary</code> повертає рядки <code>Назва × кількість = сума</code> за алфавітом, підсумок <code>Разом: …</code> і текст «Кошик порожній» для порожнього кошика.", hint: "<code>usort</code> із <code>strcmp</code> для сортування, <code>number_format($x, 2, '.', '')</code> для двох знаків без роздільника тисяч, <code>implode(\"\\n\", $lines)</code> для склеювання." },
      { id: "R8", text: "<code>topItems</code> повертає назви найдорожчих за сумою рядка товарів (при рівності за алфавітом) і коректно працює з <code>n = 0</code> та порожнім кошиком.", hint: "Відсортуйте копію кошика за сумою (оператор <code>&lt;=&gt;</code>), далі <code>array_column($cart, 'name')</code> і <code>array_slice</code>." },
    ],
    starter: `<?php
// Кошик: масив товарів виду ['sku' => 'M1', 'name' => 'Мишка', 'price' => 350.0, 'qty' => 2]

// TODO: новий товар у кінець, а для знайденого sku збільшити qty; qty < 1 або price < 0 — InvalidArgumentException
function addToCart(array $cart, string $sku, string $name, float $price, int $qty = 1): array
{
    return [];
}

// TODO: прибрати товар за sku, ключі підряд
function removeFromCart(array $cart, string $sku): array
{
    return $cart;
}

// TODO: сума price × qty, округлена до 2 знаків
function cartTotal(array $cart): float
{
    return -1.0;
}

// TODO: SALE10 — мінус 10%, SAVE50 — мінус 50 (не нижче 0), інакше InvalidArgumentException
function applyPromo(float $total, string $code): float
{
    return -1.0;
}

// TODO: «Мишка × 2 = 700.00» за алфавітом + «Разом: …»; порожній кошик — «Кошик порожній»
function cartSummary(array $cart): string
{
    return "";
}

// TODO: назви n найдорожчих рядків (при рівності за алфавітом)
function topItems(array $cart, int $n): array
{
    return ["?"];
}
`,
    harness: cartHarness,
  },
  {
    id: "php-form-validator",
    lang: "php",
    lesson: "php/6",
    title: "Проєкт: перевірка форми реєстрації",
    xp: 60,
    context:
      "Дані з форми не можна довіряти: їх може не бути, вони можуть бути порожніми, надто довгими або шкідливими. Серверна перевірка (валідація) і екранування виводу — основа безпеки будь-якого PHP-сайту.",
    brief: [
      "Напишіть перевірку форми реєстрації. У консолі немає браузера, тому дані форми приходять масивом, як <code>$_POST</code>: усі значення рядки, а деякі ключі можуть бути відсутні.",
      "Функція перевірки повертає асоціативний масив <code>поле =&gt; повідомлення</code> з <b>першою</b> помилкою кожного поля, у порядку полів форми. Порожній масив означає, що все гаразд. Повідомлення мають точний текст: за ним інтерфейс показуватиме помилки.",
    ],
    contract: [
      "<code>cleanText(string $s): string</code>: прибирає HTML-теги (<code>strip_tags</code>), стискає будь-які послідовності пробілів, табуляцій і переносів в один пробіл, обрізає краї;",
      "<code>validateRegistration(array $post): array</code> перевіряє поля в порядку <code>name</code>, <code>email</code>, <code>password</code>, <code>password2</code>, <code>age</code>, <code>agree</code>;",
      "<code>name</code> (після <code>cleanText</code>): порожнє — <code>Вкажіть ім'я</code>; довжина не від 2 до 30 символів (рахуйте символи, не байти) — <code>Ім'я: від 2 до 30 символів</code>;",
      "<code>email</code> (після <code>trim</code>): порожній — <code>Вкажіть email</code>; не проходить <code>filter_var(…, FILTER_VALIDATE_EMAIL)</code> — <code>Некоректний email</code>;",
      "<code>password</code>: порожній — <code>Вкажіть пароль</code>; коротший за 8 символів — <code>Пароль: щонайменше 8 символів</code>; немає літери або цифри — <code>Пароль має містити літеру й цифру</code>;",
      "<code>password2</code>: відсутній чи відмінний від <code>password</code> — <code>Паролі не збігаються</code>;",
      "<code>age</code> (після <code>trim</code>): порожній — <code>Вкажіть вік</code>; не ціле число від 14 до 120 — <code>Вік: ціле число від 14 до 120</code>;",
      "<code>agree</code>: лише значення <code>on</code> або <code>1</code>, інакше <code>Потрібна згода з правилами</code>;",
      "<code>errorsToHtml(array $errors): string</code>: порожній масив — порожній рядок, інакше <code>&lt;ul class=\"errors\"&gt;</code> із <code>&lt;li&gt;</code> для кожного повідомлення, текст екранований <code>htmlspecialchars</code> (<code>ENT_QUOTES</code>, UTF-8).",
    ],
    requirements: [
      { id: "R1", text: "<code>cleanText</code> прибирає теги, стискає пробіли й обрізає краї.", hint: "<code>trim(preg_replace('/\\s+/u', ' ', strip_tags($s)))</code>. Прапорець <code>u</code> потрібен для кирилиці." },
      { id: "R2", text: "Коректна форма дає порожній масив помилок: з різними значеннями, межами віку, крайніми пробілами в пошті.", hint: "Спочатку напишіть «щасливий шлях»: функція, що повертає порожній масив, коли все правильно." },
      { id: "R3", text: "Порожня форма (<code>[]</code>) дає помилки обов'язкових полів у порядку <code>name</code>, <code>email</code>, <code>password</code>, <code>age</code>, <code>agree</code> і не викликає попереджень про відсутні ключі.", hint: "Читайте значення через <code>$post['name'] ?? ''</code>. Оператор <code>??</code> не лається на відсутній ключ." },
      { id: "R4", text: "Ім'я: порожнє після очищення, коротше за 2 або довше за 30 символів — помилки; кирилиця рахується символами, зайві пробіли ігноруються.", hint: "<code>strlen</code> рахує байти: для кирилиці користуйтесь <code>mb_strlen($name)</code>." },
      { id: "R5", text: "Email: порожній і некоректний варіанти (без «@», подвійна «@», пробіли, без домену) дають різні повідомлення; пробіли по краях допустимі.", hint: "<code>filter_var($email, FILTER_VALIDATE_EMAIL)</code> повертає <code>false</code> для некоректної адреси." },
      { id: "R6", text: "Пароль: перевіряються порожнє значення, довжина щонайменше 8 символів, наявність літери (зокрема кирилиці) та цифри; у полі лишається лише перша помилка.", hint: "Літера будь-якої мови: <code>preg_match('/\\p{L}/u', $p)</code>. Перевіряйте умови через <code>elseif</code>, щоб лишалась перша помилка." },
      { id: "R7", text: "<code>password2</code> має збігатися з паролем точно, з урахуванням регістру; порожнє повторення при непорожньому паролі — теж помилка.", hint: "Порівнюйте строго: <code>(string)($post['password2'] ?? '') !== $password</code>." },
      { id: "R8", text: "Вік: ціле число від 14 до 120 (пробіли по краях допустимі); дробові, від'ємні, текстові й експоненційні записи відхиляються; порожній вік має окреме повідомлення.", hint: "З форми приходить рядок. <code>ctype_digit($age)</code> пропускає лише цифри, а потім порівняйте <code>(int)$age</code> із межами." },
      { id: "R9", text: "<code>agree</code> приймає лише <code>on</code> і <code>1</code>; відсутній ключ, порожній рядок, <code>off</code>, <code>0</code>, <code>yes</code> — помилка.", hint: "<code>in_array($post['agree'] ?? '', ['on', '1'], true)</code> із третім аргументом <code>true</code> для суворого порівняння." },
      { id: "R10", text: "<code>errorsToHtml</code> повертає порожній рядок без помилок, інакше список <code>ul.errors</code> зі екранованими повідомленнями.", hint: "<code>htmlspecialchars($m, ENT_QUOTES, 'UTF-8')</code>. Екранування виводу захищає від XSS: у повідомленні може виявитись текст із тегами." },
    ],
    starter: `<?php
// Дані форми приходять масивом, як $_POST: усі значення — рядки, деяких ключів може не бути.

// TODO: прибрати теги, стиснути пробіли, обрізати краї
function cleanText(string $s): string
{
    return $s;
}

// TODO: повернути ['поле' => 'повідомлення'] — перша помилка кожного поля; порожній масив — усе гаразд
function validateRegistration(array $post): array
{
    return ['form' => 'TODO'];
}

// TODO: '' для порожнього масиву, інакше <ul class="errors"><li>…</li></ul> з екрануванням
function errorsToHtml(array $errors): string
{
    return "TODO";
}
`,
    harness: formHarness,
  },
  {
    id: "php-hotel",
    lang: "php",
    lesson: "php/7",
    title: "Проєкт: бронювання номерів готелю",
    xp: 60,
    context:
      "Бронювання — приклад предметної області, яку природно описують класами: номер, готель, бронь. У ній є правила (дати, перетин, ціна), а порушення правил мають бути помітні: виняток замість тихого «не вийшло».",
    brief: [
      "Напишіть два класи й власний виняток: <code>Room</code> (номер, незмінні дані й вартість проживання), <code>Hotel</code> (реєстр номерів і броней) та <code>BookingException</code>. Дати — рядки <code>YYYY-MM-DD</code>; ніч рахується від дня заїзду до дня виїзду (день виїзду не рахується).",
      "Головне правило: бронювання одного номера не можуть перетинатися, але виїзд одного гостя й заїзд іншого в той самий день допустимі.",
    ],
    contract: [
      "<code>class BookingException extends Exception</code>;",
      "<code>Room</code>: конструктор <code>(int $number, string $type, float $pricePerNight)</code>; публічні лише для читання (<code>readonly</code>) властивості <code>number</code> і <code>type</code>; <code>type</code> — <code>standard</code> або <code>suite</code>; <code>number</code> більше 0, ціна більше 0, інакше <code>InvalidArgumentException</code>;",
      "<code>Room::pricePerNight(): float</code> та <code>Room::costFor(int $nights): float</code> (округлено до 2 знаків);",
      "<code>Hotel::addRoom(Room $room): void</code>: повторний номер — <code>BookingException</code>;",
      "<code>Hotel::book(int $number, string $guest, string $from, string $to): float</code>: повертає вартість; <code>BookingException</code>, якщо номера немає, дата не існує чи не у форматі <code>YYYY-MM-DD</code>, виїзд не пізніше за заїзд або є перетин із наявною бронню;",
      "<code>Hotel::isFree(int $number, string $from, string $to): bool</code> (невідомий номер вважається незвільним);",
      "<code>Hotel::freeRooms(string $from, string $to, ?string $type = null): array</code>: номери вільних кімнат за зростанням, за потреби лише вказаного типу;",
      "<code>Hotel::bookingsOf(string $guest): array</code>: список у порядку бронювання з елементами <code>['room' =&gt; 201, 'from' =&gt; '…', 'to' =&gt; '…', 'nights' =&gt; 2, 'cost' =&gt; 4000.0]</code>;",
      "<code>Hotel::revenue(): float</code>: сума вартостей усіх броней.",
    ],
    requirements: [
      { id: "R1", text: "<code>Room</code> зберігає <code>number</code> і <code>type</code> як властивості лише для читання, повертає ціну за ніч і вартість <code>costFor($nights)</code>.", hint: "Конструктор із промоцією: <code>public function __construct(public readonly int $number, public readonly string $type, private float $pricePerNight)</code>." },
      { id: "R2", text: "<code>Room</code> відхиляє номер ≤ 0, невідомий тип і ціну ≤ 0 винятком <code>InvalidArgumentException</code>.", hint: "Перевірки йдуть на початку конструктора: об'єкт не повинен створюватись у поганому стані." },
      { id: "R3", text: "<code>Hotel::addRoom</code> не дозволяє двох номерів з однаковим номером (<code>BookingException</code>), а нові номери одразу доступні для пошуку.", hint: "Зберігайте номери в масиві з ключем-номером: <code>$this-&gt;rooms[$room-&gt;number]</code>. Перевірка дубліката — <code>isset</code>." },
      { id: "R4", text: "<code>book</code> повертає вартість проживання (ночі × ціна) і реєструє бронь; рахунок ночей правильний і через кінець лютого.", hint: "<code>DateTimeImmutable::diff</code> дає <code>days</code>. Створюйте дати в UTC, щоб перехід на літній час не вкрав годину." },
      { id: "R5", text: "<code>book</code> кидає <code>BookingException</code> для невідомого номера, нуля або від'ємної кількості ночей, неіснуючих дат і неправильного формату; після невдалих спроб броней немає.", hint: "<code>DateTimeImmutable::createFromFormat('!Y-m-d', $s, $utc)</code> + порівняння <code>format('Y-m-d') === $s</code>: так відсікається «30 лютого», яке PHP інакше «перекотить» на березень." },
      { id: "R6", text: "Перетин періодів для одного номера заборонено в усіх варіантах (усередині, зліва, справа, ширше, збіг), але виїзд у день заїзду наступного гостя й інші номери — дозволені.", hint: "Періоди [from, to) перетинаються, коли <code>$from &lt; $existingTo &amp;&amp; $to &gt; $existingFrom</code>. Рядки <code>YYYY-MM-DD</code> порівнюються правильно навіть як рядки." },
      { id: "R7", text: "<code>isFree</code> і <code>freeRooms</code> враховують перетини й межі днів, фільтр за типом, сортують номери за зростанням; невідомий номер не вільний.", hint: "<code>freeRooms</code> може перебирати номери й викликати <code>isFree</code>. Не забудьте <code>ksort</code>/<code>sort</code>: порядок додавання номерів не гарантує порядок за номером." },
      { id: "R8", text: "<code>bookingsOf</code> повертає броні гостя в порядку бронювання з полями <code>room</code>, <code>from</code>, <code>to</code>, <code>nights</code>, <code>cost</code>; для невідомого гостя порожній масив.", hint: "Тримайте окремий масив броней і додавайте до нього запис в <code>book</code>, лише коли всі перевірки пройдено." },
      { id: "R9", text: "<code>revenue</code> повертає суму вартостей усіх успішних броней (<code>float</code>); відхилені броні не враховуються.", hint: "Підсумок можна рахувати з масиву броней, а не зберігати окремою змінною: тоді розбіжності не буде." },
    ],
    starter: `<?php
// Дати — рядки YYYY-MM-DD. Ніч рахується від дня заїзду до дня виїзду (день виїзду не рахується).

class BookingException extends Exception
{
}

class Room
{
    // TODO: конструктор з promotion: readonly number і type, приватна ціна за ніч; перевірки → InvalidArgumentException
    public function __construct(public int $number, public string $type, private float $pricePerNight)
    {
    }

    public function pricePerNight(): float
    {
        return -1.0;
    }

    // TODO: ціна за ніч × кількість ночей, округлено до 2 знаків
    public function costFor(int $nights): float
    {
        return -1.0;
    }
}

class Hotel
{
    // TODO: приватні властивості: номери й броні

    // TODO: додати номер; повторний номер — BookingException
    public function addRoom(Room $room): void
    {
    }

    // TODO: перевірити номер, дати, перетин; зберегти бронь; повернути вартість
    public function book(int $number, string $guest, string $from, string $to): float
    {
        return -1.0;
    }

    // TODO: чи вільний номер у період [from, to)
    public function isFree(int $number, string $from, string $to): bool
    {
        return true;
    }

    // TODO: номери вільних кімнат за зростанням, за потреби лише вказаного типу
    public function freeRooms(string $from, string $to, ?string $type = null): array
    {
        return [0];
    }

    // TODO: броні гостя: ['room' => 201, 'from' => '…', 'to' => '…', 'nights' => 2, 'cost' => 4000.0]
    public function bookingsOf(string $guest): array
    {
        return [['room' => 0]];
    }

    // TODO: сума вартостей усіх броней
    public function revenue(): float
    {
        return -1.0;
    }
}
`,
    harness: hotelHarness,
  },
];
