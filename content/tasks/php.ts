// Практичні завдання курсу PHP. Запускаються на сервері (runtime: "remote"), перевірка за stdout і кодом.
// Еталони: tests/solutions/php.mjs. Урок 8 (PDO) без завдання: у пісочниці немає бази даних (див. Documentation/task-runtime.md).
// Форми й сесії в консолі недоступні, тому дані форми імітуємо масивом, як у $_POST.
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "php", runtime: "remote", lang: "php", file: "main.php", editorLang: "php", premium: false } as const;

export const PHP_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "php-hello-calc", lesson: "php/1", xp: 15,
    title: "Перша програма: привітання й обчислення",
    context: "PHP-файл починається з тега <?php, а echo виводить текст. Крапка склеює рядки й значення виразів: так будують відповіді сторінок і повідомлення.",
    brief: [
      "Виведіть два рядки: <code>Привіт, PHP!</code> і <code>2 + 3 = 5</code>. Число в другому рядку обчисліть виразом (<code>\"2 + 3 = \" . (2 + 3)</code>), а не пишіть готову відповідь.",
      "Кожен рядок закінчуйте <code>PHP_EOL</code> (перенос рядка).",
    ],
    starter: raw`<?php
// Виведіть два рядки: Привіт, PHP! і 2 + 3 = 5
echo PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, PHP!»", has: "Привіт, PHP!" },
      { on: "stdout", name: "Виводить «2 + 3 = 5»", has: "2 + 3 = 5" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, PHP!\n2 + 3 = 5" },
      { on: "source", name: "Використано echo", has: "echo" },
    ],
  },
  {
    ...base, id: "php-order-total", lesson: "php/2", xp: 20,
    title: "Сума замовлення і типи змінних",
    context: "У PHP змінні починаються з $, а тип визначається значенням. Для грошей використовують number_format: вона округлює й додає знаки після коми.",
    brief: [
      "Виведіть <code>Разом: 59.70</code> (через <code>number_format($total, 2)</code>) і наступним рядком типи змінних через пробіл (<code>gettype</code>): <code>double integer</code>.",
    ],
    starter: raw`<?php
$price = 19.9;
$qty = 3;
$total = $price * $qty;

// TODO: Разом: 59.70 (number_format) і типи $price та $qty через gettype
echo "Разом: " . $total . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 59.70»", has: "Разом: 59.70" },
      { on: "stdout", name: "Типи: double integer", has: "double integer" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 59.70\ndouble integer" },
      { on: "source", name: "Використано number_format", has: "number_format(" },
    ],
  },
  {
    ...base, id: "php-strings-slug", lesson: "php/3", xp: 25,
    title: "Рядки: slug, великі літери, паліндром",
    context: "Із заголовка статті роблять адресу сторінки: прибрати зайві пробіли, перейти на малі літери, замінити пробіли дефісом. Регулярний вираз \\s+ ловить будь-яку кількість пробілів підряд.",
    brief: [
      "Допишіть <code>slugify($title)</code>: <code>trim</code>, <code>strtolower</code>, заміна пробілів на <code>-</code> через <code>preg_replace('/\\s+/', '-', ...)</code>.",
      "Допишіть <code>shout($s)</code>: великі літери (<code>strtoupper</code>) і знак оклику в кінці, і <code>isPalindrome($s)</code>: порівняйте рядок з <code>strrev</code> без урахування регістру (<code>strtolower</code>).",
    ],
    starter: raw`<?php
function slugify(string $title): string
{
    // TODO
    return $title;
}

function shout(string $s): string
{
    // TODO
    return $s;
}

function isPalindrome(string $s): bool
{
    // TODO
    return false;
}

echo slugify("  Hello   World From PHP ") . PHP_EOL;
echo shout("php") . PHP_EOL;
echo var_export(isPalindrome("Level"), true) . PHP_EOL;
echo var_export(isPalindrome("PHP8"), true) . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "slugify: hello-world-from-php", has: "hello-world-from-php" },
      { on: "stdout", name: "shout(\"php\") дає PHP!", has: "PHP!" },
      { on: "stdout", name: "Level це паліндром", has: "PHP!\ntrue" },
      { on: "stdout", name: "PHP8 не паліндром", has: "true\nfalse" },
      { on: "source", name: "Використано preg_replace", has: "preg_replace(" },
    ],
  },
  {
    ...base, id: "php-grade-loop", lesson: "php/4", xp: 25,
    title: "Оцінка за балами: elseif і foreach",
    context: "Умови й цикли керують виводом: який варіант показати користувачу і для скількох записів. foreach це основний спосіб пройти по масиву в PHP.",
    brief: [
      "Допишіть <code>grade(int $score)</code>: від 90 балів <code>A</code>, від 75 <code>B</code>, від 60 <code>C</code>, інакше <code>D</code>. Використайте <code>if / elseif / else</code> (або <code>match(true)</code>).",
      "Цикл <code>foreach</code> у <code>main</code> уже виводить оцінку для чотирьох результатів.",
    ],
    starter: raw`<?php
function grade(int $score): string
{
    // TODO: A від 90, B від 75, C від 60, інакше D
    return "?";
}

foreach ([95, 80, 61, 30] as $s) {
    echo $s . " " . grade($s) . PHP_EOL;
}
`,
    checks: [
      { on: "stdout", name: "95 балів: A", has: "95 A" },
      { on: "stdout", name: "80 балів: B", has: "80 B" },
      { on: "stdout", name: "61 бал: C", has: "61 C" },
      { on: "stdout", name: "30 балів: D", has: "30 D" },
      { on: "source", name: "Використано elseif або match", matches: "\\belseif\\b|\\bmatch\\s*\\(" },
    ],
  },
  {
    ...base, id: "php-arrays-products", lesson: "php/5", xp: 30,
    title: "Масиви: фільтр, сума і map",
    context: "Масиви в PHP це і списки, і словники. Вбудовані array_filter, array_map і array_sum замінюють цикли в типових задачах: відібрати, перетворити, підсумувати.",
    brief: [
      "Допишіть <code>evens(array $nums)</code> (<code>array_filter</code> + <code>array_values</code>, щоб ключі знову були 0, 1, 2...), <code>totalPrice(array $items)</code> (<code>array_sum(array_column(..., 'price'))</code>) і <code>names(array $items)</code> (<code>array_map</code>).",
    ],
    starter: raw`<?php
function evens(array $nums): array
{
    // TODO: array_filter і array_values
    return [];
}

function totalPrice(array $items): float
{
    // TODO: array_sum(array_column(...))
    return 0;
}

function names(array $items): array
{
    // TODO: array_map
    return [];
}

$products = [
    ['name' => 'Хліб', 'price' => 25.5],
    ['name' => 'Молоко', 'price' => 42],
    ['name' => 'Сир', 'price' => 180],
];

echo implode(' ', evens([5, 2, 9, 7, 4, 10, 3, 8])) . PHP_EOL;
echo totalPrice($products) . PHP_EOL;
echo implode(', ', names($products)) . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Парні числа: 2 4 10 8", has: "2 4 10 8" },
      { on: "stdout", name: "Сума цін: 247.5", has: "247.5" },
      { on: "stdout", name: "Назви товарів через кому", has: "Хліб, Молоко, Сир" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2 4 10 8\n247.5\nХліб, Молоко, Сир" },
      { on: "source", name: "Використано array_filter", has: "array_filter(" },
    ],
  },
  {
    ...base, id: "php-form-validate", lesson: "php/6", xp: 35,
    title: "Валідація форми й захист виводу",
    context: "Дані з форми не можна довіряти: їх перевіряють на сервері й екранують перед виводом у HTML. Тут форма імітується масивом, як $_POST. Перевірка email через filter_var, а екранування через htmlspecialchars захищає від XSS.",
    brief: [
      "Допишіть <code>validate(array $post): array</code>: повертає список помилок. Порожнє <code>name</code> дає <code>Ім'я обов'язкове</code>, некоректний <code>email</code> (<code>filter_var($post['email'], FILTER_VALIDATE_EMAIL)</code>) дає <code>Невірний email</code>, вік <code>age</code> менше 18 дає <code>Вік має бути 18+</code>.",
      "Допишіть <code>safe(string $s)</code>: екранування HTML через <code>htmlspecialchars</code>.",
    ],
    starter: raw`<?php
function validate(array $post): array
{
    $errors = [];
    // TODO: name порожнє -> "Ім'я обов'язкове"; email невалідний -> "Невірний email"; age < 18 -> "Вік має бути 18+"
    return $errors;
}

function safe(string $s): string
{
    // TODO: htmlspecialchars
    return $s;
}

$bad = ['name' => '', 'email' => 'not-an-email', 'age' => '16'];
$good = ['name' => 'Оля', 'email' => 'olya@example.com', 'age' => '25'];

echo implode('; ', validate($bad)) . PHP_EOL;
echo (validate($good) === [] ? 'OK' : 'є помилки') . PHP_EOL;
echo safe('<b>Оля</b>') . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Для порожньої форми три помилки", has: "Ім'я обов'язкове; Невірний email; Вік має бути 18+" },
      { on: "stdout", name: "Правильна форма проходить (OK)", has: "OK" },
      { on: "stdout", name: "HTML екранується", has: "&lt;b&gt;Оля&lt;/b&gt;" },
      { on: "source", name: "Email перевіряється через filter_var", has: "filter_var(" },
      { on: "source", name: "Вивід екранується через htmlspecialchars", has: "htmlspecialchars(" },
    ],
  },
  {
    ...base, id: "php-product-class", lesson: "php/7", xp: 35,
    title: "Клас Product із promoted-властивостями",
    context: "Клас описує сутність (товар, користувач, замовлення). У PHP 8 властивості можна оголошувати прямо в конструкторі, а магічний метод __toString задає, як об'єкт виглядає у виводі.",
    brief: [
      "Опишіть клас <code>Product</code>: конструктор із приватними властивостями <code>$name</code> (<code>string</code>) і <code>$price</code> (<code>float</code>) прямо в параметрах, метод <code>getPrice()</code> і <code>__toString()</code>, що повертає, наприклад, <code>Хліб: 25.50</code> (<code>number_format($price, 2)</code>).",
    ],
    starter: raw`<?php
// TODO: клас Product (promoted-властивості в конструкторі, getPrice(), __toString())

$products = [new Product('Хліб', 25.5), new Product('Молоко', 42), new Product('Сир', 180)];
$total = 0;
foreach ($products as $p) {
    echo $p . PHP_EOL;
    $total += $p->getPrice();
}
echo 'Разом: ' . number_format($total, 2) . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "__toString: Хліб: 25.50", has: "Хліб: 25.50" },
      { on: "stdout", name: "Усі три товари виведено", has: "Хліб: 25.50\nМолоко: 42.00\nСир: 180.00" },
      { on: "stdout", name: "Сума цін: 247.50", has: "Разом: 247.50" },
      { on: "source", name: "Описано клас Product", matches: "class\\s+Product\\b" },
      { on: "source", name: "Описано __toString", has: "__toString" },
    ],
  },
  {
    ...base, id: "php-password-auth", lesson: "php/9", xp: 40,
    title: "Паролі: password_hash і password_verify",
    context: "Пароль ніколи не зберігають відкрито. У базу кладуть хеш, а при вході перевіряють введений пароль проти хеша. У PHP для цього є готові password_hash і password_verify, а солі й алгоритм вони вибирають самі. (Сесії й cookies працюють у веб-запиті, тому тут тренуємо саму логіку входу.)",
    brief: [
      "Допишіть <code>register(string $password)</code>: повертає хеш пароля (<code>password_hash($password, PASSWORD_DEFAULT)</code>).",
      "Допишіть <code>login(string $password, string $hash)</code>: повертає <code>true</code>, якщо пароль підходить до хеша (<code>password_verify</code>).",
    ],
    starter: raw`<?php
function register(string $password): string
{
    // TODO: password_hash
    return $password;
}

function login(string $password, string $hash): bool
{
    // TODO: password_verify
    return false;
}

$hash = register('secret123');
echo (login('secret123', $hash) ? 'Вхід дозволено' : 'Відмовлено') . PHP_EOL;
echo (login('wrong', $hash) ? 'Вхід дозволено' : 'Відмовлено') . PHP_EOL;
echo ($hash !== 'secret123' ? 'Пароль не зберігається відкрито' : 'Пароль збережено відкрито!') . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Правильний пароль впускає", has: "Вхід дозволено\n" },
      { on: "stdout", name: "Неправильний пароль відхиляється", has: "Вхід дозволено\nВідмовлено" },
      { on: "stdout", name: "Пароль не зберігається відкрито", has: "Пароль не зберігається відкрито" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Вхід дозволено\nВідмовлено\nПароль не зберігається відкрито" },
      { on: "source", name: "Використано password_hash", has: "password_hash(" },
      { on: "source", name: "Використано password_verify", has: "password_verify(" },
    ],
  },
  {
    ...base, id: "php-psr4-path", lesson: "php/10", xp: 40,
    title: "Автозавантаження PSR-4: від класу до файла",
    context: "Composer знаходить файл класу за його простором імен за правилом PSR-4: префікс App\\ відповідає папці src/, а решта шляху це підпапки й ім'я файла. Це правило однакове для всіх сучасних PHP-проєктів.",
    brief: [
      "Допишіть <code>classToPath(string $class)</code>: прибрати префікс <code>App\\</code>, замінити <code>\\</code> на <code>/</code>, додати каталог <code>src/</code> на початку і розширення <code>.php</code> в кінці. Наприклад, <code>App\\Models\\User</code> дає <code>src/Models/User.php</code>.",
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
      { on: "stdout", name: "Повне ім'я класу береться через ::class", has: "App\\Models\\User\n" },
      { on: "stdout", name: "App\\Models\\User дає src/Models/User.php", has: "src/Models/User.php" },
      { on: "stdout", name: "App\\Services\\Mailer дає src/Services/Mailer.php", has: "src/Services/Mailer.php" },
      { on: "source", name: "Зворотні слеші замінюються на /", matches: "str_replace\\s*\\(" },
    ],
  },
];
