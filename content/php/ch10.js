// Глава 10 курсу PHP «Запити й сервіси», уроки 92–99. Веб-сервера, суперглобалів і сесій у пісочниці немає, тому запит, відповідь і сесію емулюємо масивами й класами.
export const LESSONS_10 = [
  {
    t: "Модель «запит-відповідь»: класи Request і Response",
    ch: "Запити й сервіси",
    easy: "Запит і відповідь схожі на замовлення в кафе: ви віддаєте касиру папірець зі стравами, а він повертає тацю й чек. Касир не знає, хто ви, бачить лише те, що написано на папірці.",
    p: [
      "Майже кожен PHP-застосунок у вебі робить одну й ту саму справу: отримує HTTP-запит і повертає HTTP-відповідь. Усе інше, від бази даних до шаблонів, лише допомагає цю відповідь скласти. Тому перш ніж писати маршрути й сервіси, варто чітко уявити обидва кінці цієї розмови.",
      "Модель у голові така. <b>Запит</b> містить метод (<code>GET</code>, <code>POST</code>), шлях (<code>/notes/5</code>), параметри рядка запиту, заголовки й тіло. <b>Відповідь</b> містить код статусу (<code>200</code>, <code>404</code>), заголовки й тіло. Звичайний PHP розкладає запит по суперглобальних масивах <code>$_GET</code>, <code>$_POST</code>, <code>$_SERVER</code>, а відповідь збирає з викликів <code>http_response_code()</code>, <code>header()</code> та <code>echo</code>. Це розкидані по програмі глобальні дані.",
      "Сучасний код загортає їх у два прості класи: <code>Request</code> і <code>Response</code>. Тоді обробник стає звичайною функцією <code>handle(Request): Response</code>: на вході об'єкт, на виході об'єкт, а ніяких глобальних змінних і виводу посеред логіки. У нашій пісочниці веб-сервера немає, тому ми й так створюємо запит вручну, і саме це робить код легко перевірюваним: подали <code>Request</code>, порівняли <code>Response</code>.",
      "Робіть обидва класи незмінними: властивості <code>public readonly</code>, а «зміна» повертає новий об'єкт, як у методі <code>withHeader()</code>. Так запит, що пройшов через п'ять обробників, не можна випадково зіпсувати. У PHP 8.1 <code>readonly</code> працює з типізованими властивостями, а спроба присвоїти значення вдруге кидає <code>Error</code>. Простий обхід, як <code>$this-&gt;headers['x'] = 1</code> усередині класу, теж заборонений.",
      "Пастки. Імена заголовків нечутливі до регістру, тому <code>Content-Type</code> і <code>content-type</code> це той самий заголовок: нормалізуйте регістр при збереженні, інакше пошук не знайде значення. Значення в рядку запиту завжди рядки: <code>?page=2</code> дасть <code>\"2\"</code>, а не число. Масиви в PHP копіюються за значенням, тож зміна <code>$headers</code> усередині методу не торкнеться оригіналу, і це саме те, що нам потрібно.",
      "Ідіоми. Статус зберігайте числом, а текст причини (<code>Not Found</code>) підбирайте окремо через <code>match</code>. Відповідь не друкуйте всередині обробника: окрема функція «надсилання» бере <code>Response</code> і виводить статусний рядок, заголовки та тіло. Вона й буде єдиним місцем, де програма взаємодіє зі світом, тому її легко замінити на заглушку для тестів.",
      "Один обробник на всі адреси швидко розростається в довгий <code>if</code>. Наступний крок: винести вибір обробника в таблицю відповідностей. Але спершу розберемо, як у запит потрапляють дані від користувача, адже саме форми й перевірка введення перша серйозна робота будь-якого сервісу.",
    ],
    code: [
      String.raw`<?php
// Запит і відповідь як звичайні масиви: так бачить HTTP будь-який сервер
function handle(array $request): array
{
    if ($request['path'] !== '/hello') {
        return ['status' => 404, 'body' => 'Not Found'];
    }
    $name = $request['query']['name'] ?? 'світе';
    return ['status' => 200, 'body' => "Привіт, $name!"];
}

$response = handle(['method' => 'GET', 'path' => '/hello', 'query' => ['name' => 'Оля']]);
echo $response['status'], ' ', $response['body'], "\n";

$response = handle(['method' => 'GET', 'path' => '/x', 'query' => []]);
echo $response['status'], ' ', $response['body'], "\n";`,
      String.raw`<?php
declare(strict_types=1);

final class Request
{
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query = [],
        public readonly array $headers = [],
    ) {}

    public function header(string $name, string $default = ''): string
    {
        return $this->headers[strtolower($name)] ?? $default;
    }
}

final class Response
{
    public function __construct(
        public readonly int $status = 200,
        public readonly string $body = '',
        public readonly array $headers = [],
    ) {}

    public function withHeader(string $name, string $value): self
    {
        return new self($this->status, $this->body, [...$this->headers, strtolower($name) => $value]);
    }
}

$req = new Request('GET', '/hello', ['page' => '2'], ['accept' => 'text/plain']);
echo $req->header('Accept'), "\n";   // регістр імені не важливий
var_dump($req->query['page']);       // рядок, а не число

$res = new Response(200, 'ok');
$res2 = $res->withHeader('X-Test', 'yes');
echo count($res->headers), ' ', count($res2->headers), "\n"; // оригінал не змінився`,
      String.raw`<?php
declare(strict_types=1);

final class Request
{
    public function __construct(public readonly string $method, public readonly string $path) {}
}

final class Response
{
    public function __construct(
        public readonly int $status = 200,
        public readonly string $body = '',
        public readonly array $headers = [],
    ) {}
}

function reason(int $status): string
{
    return match ($status) {
        200 => 'OK',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        default => 'Unknown',
    };
}

// Єдине місце, де «виводимо в мережу»: сервер зробив би те саме
function emit(Response $r): void
{
    echo "HTTP/1.1 {$r->status} " . reason($r->status) . "\n";
    foreach ($r->headers as $name => $value) {
        echo "$name: $value\n";
    }
    echo "\n", $r->body, "\n";
}

function handle(Request $req): Response
{
    if ($req->path !== '/ping') {
        return new Response(404, 'Нічого немає');
    }
    if ($req->method !== 'GET') {
        return new Response(405, '', ['allow' => 'GET']);
    }
    return new Response(200, 'pong', ['content-type' => 'text/plain; charset=utf-8']);
}

emit(handle(new Request('GET', '/ping')));
emit(handle(new Request('POST', '/ping')));
emit(handle(new Request('GET', '/other')));`,
      String.raw`<?php
// аварія: readonly-властивість не можна змінити після створення
final class Request
{
    public function __construct(public readonly string $path) {}
}

$req = new Request('/notes');
echo $req->path, "\n";
$req->path = '/admin';
echo $req->path, "\n";`,
    ],
    note: "Запит і відповідь це прості незмінні об'єкти, а обробник перетворює одне на інше: <code>handle(Request): Response</code>. Усі взаємодії зі світом (виведення, заголовки) зберіть в одному місці, і сервіс стане перевірюваним без веб-сервера.",
    work: "У Laravel, Symfony та Slim контролер приймає об'єкт запиту й повертає об'єкт відповіді. Такий поділ дозволяє перевіряти кожну дію звичайним викликом функції в тесті, без піднімання сервера й без справжніх мережевих запитів.",
    tasks: [
      "Чому відповідь краще робити незмінною та повертати новий об'єкт у методах на кшталт withHeader?",
      "Чому значення з рядка запиту завжди приходять рядками, навіть коли це число?",
    ],
  },
  {
    t: "Форми й суперглобали: імітація $_POST і filter_var",
    ch: "Запити й сервіси",
    easy: "Дані з форми схожі на анонімну записку в скриньці пропозицій: писати в ній може будь-хто й будь-що. Тому записку спершу читають уважно, перевіряють і лише тоді виставляють на загальний огляд.",
    p: [
      "Усе, що надійшло від користувача, ненадійне: це рядки, які можуть бути порожніми, надто довгими, неправильного типу або навіть шкідливими. Клієнтська перевірка в браузері лише зручність, а підробити запит можна одним рядком. Тому справжня перевірка завжди на сервері, і вона робиться у двох напрямах: <b>валідація</b> вхідних даних і <b>екранування</b> вихідних.",
      "Модель у голові: у звичайному PHP форма потрапляє в суперглобальний масив <code>$_POST</code> (рядок запиту в <code>$_GET</code>). У консолі й у нашій пісочниці веб-запиту немає, тож ми імітуємо його звичайним масивом <code>$post = ['name' =&gt; 'Оля', 'age' =&gt; '25']</code> і передаємо в функцію як аргумент. Це краще й для реального коду: функція від суперглобалу не залежить і тестується окремо.",
      "Значення в такому масиві завжди рядки, а ключа може просто не бути. Для безпечного читання використовуйте <code>??</code>: <code>$post['name'] ?? ''</code> не видасть попередження про відсутній ключ. Потім <code>trim()</code> прибере зайві пробіли. Для перевірки формату є <code>filter_var($value, $filter, $options)</code>: <code>FILTER_VALIDATE_EMAIL</code> перевіряє пошту, <code>FILTER_VALIDATE_INT</code> разом з <code>min_range</code> і <code>max_range</code> перевіряє ціле число в діапазоні, <code>FILTER_VALIDATE_BOOLEAN</code> розпізнає <code>yes</code>, <code>on</code>, <code>1</code>.",
      "Успіх <code>filter_var</code> повертає уже приведене значення (для <code>FILTER_VALIDATE_INT</code> це справжнє число), а невдача дає <code>false</code>. Тут і ховається головна пастка: <code>filter_var('0', FILTER_VALIDATE_INT)</code> повертає <code>0</code>, а <code>0</code> у нестрогій перевірці <code>if (!$v)</code> теж «хиба». Завжди порівнюйте з <code>false</code> строго: <code>=== false</code>. Якщо потрібно відрізнити «неправильно» від «false», додайте прапорець <code>FILTER_NULL_ON_FAILURE</code>: тоді невдача дає <code>null</code>.",
      "Друга половина захисту: екранування. Рядок, виведений у HTML без обробки, дозволяє вставити чужий <code>&lt;script&gt;</code> (це XSS). Функція <code>htmlspecialchars($s)</code> замінює спецсимволи на сутності, і браузер покаже їх як текст. Екрануйте <i>в момент виведення</i>, а не при збереженні: тоді дані лишаються чистими й придатними для будь-якого каналу, не лише HTML. У суворому режимі <code>htmlspecialchars(null)</code> дасть <code>TypeError</code>, тож спершу перетворіть значення на рядок.",
      "Ідіоми. Збирайте помилки в масив <code>['email' =&gt; 'Невірний email']</code>, а не зупиняйтеся на першій: користувач хоче виправити все за один раз. Валідацію виносьте в окрему функцію, що приймає масив і повертає масив помилок, порожній масив означає успіх. Повідомлення мають бути зрозумілими людині, а не технічними.",
      "Перевірена форма це вже «чисті» дані, які треба кудись спрямувати. Далі ми навчимося вибирати, який обробник отримає запит: від шляху й методу до таблиці маршрутів із параметрами.",
    ],
    code: [
      String.raw`<?php
// Імітація $_POST: у консолі веб-запиту немає, тож це звичайний масив
$post = ['name' => '  Оля ', 'age' => '25'];

$name = trim($post['name'] ?? '');
$phone = $post['phone'] ?? 'не вказано';   // ключа немає, але попередження теж немає
echo "Ім'я: [$name], телефон: $phone\n";

var_dump($post['age']);            // значення з форми це рядок
var_dump((int) $post['age'] + 1);`,
      String.raw`<?php
var_dump(filter_var('olya@example.com', FILTER_VALIDATE_EMAIL));
var_dump(filter_var('olya@', FILTER_VALIDATE_EMAIL));

$range = ['options' => ['min_range' => 18, 'max_range' => 120]];
var_dump(filter_var('25', FILTER_VALIDATE_INT, $range));
var_dump(filter_var('17', FILTER_VALIDATE_INT, $range));
var_dump(filter_var('abc', FILTER_VALIDATE_INT, FILTER_NULL_ON_FAILURE));
var_dump(filter_var('yes', FILTER_VALIDATE_BOOLEAN));`,
      String.raw`<?php
// Поведінка, що дивує: нуль це валідне число, але хибне значення
$count = filter_var('0', FILTER_VALIDATE_INT);
var_dump($count);

if (!$count) {
    echo "Нестрога перевірка: помилка, хоча нуль валідний\n";
}
if ($count === false) {
    echo "Сюди ми не потрапимо\n";
} else {
    echo "Строга перевірка: нуль прийнято\n";
}`,
      String.raw`<?php
declare(strict_types=1);

function validate(array $post): array
{
    $errors = [];
    if (trim($post['name'] ?? '') === '') {
        $errors['name'] = "Ім'я обов'язкове";
    }
    if (filter_var($post['email'] ?? '', FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = 'Невірний email';
    }
    $age = filter_var($post['age'] ?? '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 18]]);
    if ($age === false) {
        $errors['age'] = 'Вік має бути 18+';
    }
    return $errors;
}

function e(string $s): string
{
    return htmlspecialchars($s);
}

$errors = validate(['name' => '', 'email' => 'x', 'age' => '16']);
foreach ($errors as $field => $message) {
    echo "$field: $message\n";
}
echo validate(['name' => 'Оля', 'email' => 'o@example.com', 'age' => '30']) === [] ? "Форма коректна\n" : "Є помилки\n";

$comment = '<script>alert("hi")</script>';
echo e($comment), "\n";`,
      String.raw`<?php
// аварія: у суворому режимі null не перетворюється на рядок
declare(strict_types=1);

$post = ['name' => 'Оля'];
echo htmlspecialchars($post['name']), "\n";
echo htmlspecialchars($post['bio'] ?? null), "\n";`,
    ],
    note: "Усе з форми ненадійне: читайте через <code>??</code>, перевіряйте через <code>filter_var</code> і порівнюйте з <code>=== false</code>, а перед виводом у HTML екрануйте через <code>htmlspecialchars</code>. Помилки збирайте списком, а не зупиняйтеся на першій.",
    work: "Реєстрація, оформлення замовлення, коментарі, пошук: скрізь у вебі є форма й потреба її перевірити. Саме тут закривають більшість вразливостей, а відсутнє екранування виводу досі залишається однією з частих причин XSS.",
    tasks: [
      "Чому результат filter_var треба порівнювати з false строго, а не через знак оклику?",
      "Коли екранувати дані: при збереженні чи в момент виведення в HTML?",
    ],
  },
  {
    t: "Маршрутизація: таблиця маршрутів і параметри",
    ch: "Запити й сервіси",
    easy: "Маршрутизатор схожий на вахтера з довідником: людина називає, до кого йде, а він шукає в списку потрібні двері й показує дорогу. Якщо такого запису немає, він чесно каже, що тут нікого такого нема.",
    p: [
      "Коли запит уже є об'єктом, постає питання: який код його обробить? Довгий ланцюжок <code>if ($path === '/notes') … elseif …</code> швидко стає нечитабельним і ламається при кожному новому адресі. Робота маршрутизатора проста: за методом і шляхом знайти потрібний обробник та передати йому параметри з адреси.",
      "Модель у голові: <b>таблиця маршрутів</b>, тобто список записів «метод, шаблон, обробник». Шаблон <code>/notes/{id}</code> містить «дірку», у якій може стояти будь-яке значення. Маршрутизатор перетворює шаблон на регулярний вираз, перевіряє по черзі кожен запис і викликає обробник першого збігу. Порядок записів має значення: конкретніший маршрут <code>/notes/new</code> ставте перед загальним <code>/notes/{id}</code>.",
      "Перетворення шаблону робить <code>preg_replace</code>: частину <code>{id}</code> замінюємо на іменну групу <code>(?P&lt;id&gt;[^/]+)</code>. Тоді <code>preg_match</code> кладе в масив збігів і числові ключі, і ключі з іменами груп. Нам потрібні лише іменовані, тому відфільтровуємо рядкові ключі через <code>array_filter</code> з прапорцем <code>ARRAY_FILTER_USE_KEY</code>. Обробнику їх можна передати розпакуванням <code>$handler(...$params)</code>: рядкові ключі стають іменованими аргументами.",
      "Пастки. Параметр із адреси завжди рядок: <code>/notes/5</code> дасть <code>\"5\"</code>, а не число, і в суворому режимі функція з типом <code>int $id</code> кине <code>TypeError</code>. Тож приводьте типи явно або описуйте шаблон так, щоб приймати лише цифри: <code>(?P&lt;id&gt;\\d+)</code>. Друга пастка: якщо адреса знайдена, а метод інший, правильна відповідь не <code>404</code>, а <code>405 Method Not Allowed</code>. Збирайте дозволені методи під час проходу по таблиці.",
      "Третя пастка стосується безпеки: у шаблон не підставляйте дані користувача, а самі шаблони пишіть із потрібними обмеженнями (<code>\\d+</code>, <code>[a-z-]+</code>). Квантор <code>[^/]+</code> не захопить слеші, тож <code>/notes/1/2</code> не збіжиться з <code>/notes/{id}</code>. Якщо ж забути якорі <code>^</code> та <code>$</code>, маршрут <code>/notes</code> збігатиметься з будь-яким шляхом, що містить цей рядок.",
      "Ідіоми. Обробник це довільний <code>callable</code>: замикання, стрілкова функція, метод <code>[$controller, 'show']</code> чи <code>strlen(...)</code>. Маршрутизатор повертає відповідь, а не друкує її. Метод <code>dispatch()</code> завжди дає відповідь: або від обробника, або <code>404</code>, або <code>405</code>, і сторонній код ніколи не отримує «нічого».",
      "Маршрутизатор уміє вибрати обробник, але самі обробники поки що прості. У наступному уроці ми підключимо до нього справжню роботу: сховище нотаток у пам'яті й JSON-відповіді для створення, читання та видалення записів.",
    ],
    code: [
      String.raw`<?php
// Найпростіша таблиця: точний шлях -> обробник
$routes = [
    '/' => fn() => 'Головна',
    '/about' => fn() => 'Про нас',
];

foreach (['/', '/about', '/missing'] as $path) {
    $handler = $routes[$path] ?? null;
    echo $path, ' => ', $handler ? $handler() : '404 Not Found', "\n";
}`,
      String.raw`<?php
// Шаблон із параметром перетворюється на регулярний вираз
$pattern = '/notes/{id}';
$regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
echo $regex, "\n";

if (preg_match($regex, '/notes/42', $m) === 1) {
    print_r($m);
    $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
    print_r($params);
}
var_dump(preg_match($regex, '/notes/1/2'));`,
      String.raw`<?php
declare(strict_types=1);

final class Router
{
    /** @var list<array{string, string, callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
        $this->routes[] = [$method, $regex, $handler];
    }

    public function dispatch(string $method, string $path): array
    {
        $allowed = [];
        foreach ($this->routes as [$m, $regex, $handler]) {
            if (preg_match($regex, $path, $matches) !== 1) {
                continue;
            }
            if ($m !== $method) {
                $allowed[] = $m;
                continue;
            }
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            return [200, $handler(...$params)];
        }
        return $allowed === [] ? [404, 'Not Found'] : [405, 'Allow: ' . implode(', ', $allowed)];
    }
}

$router = new Router();
$router->add('GET', '/notes', fn() => 'список');
$router->add('GET', '/notes/{id}', fn(string $id) => "нотатка $id");
$router->add('DELETE', '/notes/{id}', fn(string $id) => "видалено $id");

foreach ([['GET', '/notes'], ['GET', '/notes/7'], ['POST', '/notes/7'], ['GET', '/nope']] as [$m, $p]) {
    [$status, $body] = $router->dispatch($m, $p);
    echo "$m $p -> $status $body\n";
}`,
      String.raw`<?php
// Поведінка, що дивує: без якорів маршрут збігається зі шляхом, що лише містить його
var_dump(preg_match('#/notes#', '/archive/notes/old'));
var_dump(preg_match('#^/notes$#', '/archive/notes/old'));

// Параметр з адреси це рядок
$matches = [];
preg_match('#^/notes/(?P<id>\d+)$#', '/notes/5', $matches);
var_dump($matches['id']);
var_dump((int) $matches['id'] + 1);`,
      String.raw`<?php
// аварія: параметр з адреси це рядок, а функція в суворому режимі чекає int
declare(strict_types=1);

function show(int $id): string
{
    return "нотатка $id";
}

preg_match('#^/notes/(?P<id>\d+)$#', '/notes/5', $m);
echo show((int) $m['id']), "\n";
echo show($m['id']), "\n";`,
    ],
    note: "Маршрутизатор шукає в таблиці перший запис, що збігся з методом і шляхом, і передає обробнику параметри з адреси. Невідомий шлях дає <code>404</code>, відомий шлях з іншим методом дає <code>405</code>, а параметри завжди приходять рядками.",
    work: "Кожен фреймворк, від Laravel до Slim, починається з таблиці маршрутів. Розуміючи її будову, ви легко читаєте чужі проєкти, налагоджуєте помилки 404 і 405 та пишете власні мікросервіси без важких залежностей.",
    tasks: [
      "Яку відповідь дати, якщо шлях існує, але метод запиту не дозволений?",
      "Чому параметр {id} з адреси треба явно перетворити на ціле число?",
    ],
  },
  {
    t: "JSON-API нотаток у пам'яті",
    ch: "Запити й сервіси",
    easy: "JSON-API схожий на віконце видачі в бібліотеці: ви подаєте чітко заповнений бланк, а у відповідь отримуєте картку із записом або ввічливу відмову з поясненням причини. Усе спілкування йде за суворими правилами.",
    p: [
      "Більшість сучасних сервісів говорять не HTML-сторінками, а <b>JSON</b>: простим текстовим форматом, який однаково розуміють браузер, мобільний застосунок і інший сервер. JSON-API нотаток це класичний навчальний приклад: створити нотатку, прочитати її, видалити. Ми зберігатимемо все в масиві в пам'яті, бо бази даних у нашій пісочниці немає, а суть API від цього не змінюється.",
      "Модель у голові: запит приходить з методом, шляхом і тілом-рядком JSON, а відповідь містить код статусу й тіло-рядок JSON. Між ними три кроки: розібрати тіло через <code>json_decode</code>, виконати дію над сховищем, зібрати відповідь через <code>json_encode</code>. Сховище окремий клас <code>NoteStore</code> з методами <code>add</code>, <code>find</code>, <code>all</code>, <code>delete</code>; він нічого не знає про HTTP.",
      "Коди статусу несуть зміст. <code>200</code> успішне читання, <code>201</code> нотатку створено, <code>204</code> успіх без тіла (видалення), <code>400</code> тіло не є правильним JSON, <code>404</code> нотатки немає, <code>422</code> JSON правильний, але дані не проходять перевірку. Клієнт реагує саме на код, тому підбирайте його уважно, а в тілі помилки віддавайте зрозуміле повідомлення, наприклад <code>{\"error\": \"title is required\"}</code>.",
      "Головна пастка: <code>json_decode</code> на некоректному JSON <b>мовчки повертає</b> <code>null</code>, і це неможливо відрізнити від справжнього JSON <code>null</code>. Завжди передавайте прапорець <code>JSON_THROW_ON_ERROR</code>: тоді замість тихого збою буде <code>JsonException</code>, яку API перетворює на відповідь <code>400</code>. Друга дрібниця: <code>json_decode($s, true)</code> дає асоціативні масиви, без <code>true</code> ви отримаєте об'єкти <code>stdClass</code>.",
      "Ще дві особливості <code>json_encode</code>. Українські літери за замовчуванням перетворюються на послідовності <code>\\u041e</code>, що коректно, але нечитабельно; прапорець <code>JSON_UNESCAPED_UNICODE</code> залишає їх як є. А порожній PHP-масив завжди кодується як <code>[]</code>, навіть якщо ви хотіли об'єкт <code>{}</code>: для цього є прапорець <code>JSON_FORCE_OBJECT</code> або приведення <code>(object) []</code>. Масив з ключами <code>0,1,2</code> стане списком, а з іншими ключами об'єктом.",
      "Ідіоми. Перевіряйте вхід: тіло має бути об'єктом, а поле <code>title</code> непорожнім рядком. Ідентифікатори видавайте сховищем, а не клієнтом. Єдину функцію <code>json(int $status, mixed $data)</code> використовуйте для всіх відповідей, щоб формат не розповзався. Видалення неіснуючої нотатки теж дає <code>404</code>, а не мовчазний успіх.",
      "API вже вміє приймати запит і відповідати, але вся логіка живе в одній функції. У наступному уроці ми винесемо наскрізні справи (журнал, перевірку доступу, обробку помилок) у middleware: невеликі об'єкти, що обгортають обробник, як шари цибулі.",
    ],
    code: [
      String.raw`<?php
$note = ['id' => 1, 'title' => 'Купити молоко', 'done' => false];

echo json_encode($note), "\n";
echo json_encode($note, JSON_UNESCAPED_UNICODE), "\n";

$decoded = json_decode('{"id": 2, "title": "Зателефонувати", "tags": ["дім", "терміново"]}', true);
echo $decoded['title'], ' / ', implode(', ', $decoded['tags']), "\n";
echo json_encode([]), ' ', json_encode((object) []), ' ', json_encode([1 => 'a', 2 => 'b']), "\n";`,
      String.raw`<?php
// Поведінка, що дивує: без прапорця помилка розбору мовчить
$result = json_decode('{"title": "зламаний');
var_dump($result);
echo json_last_error_msg(), "\n";

// Справжній null і помилка дають однаково null
var_dump(json_decode('null'));

try {
    json_decode('{"title": "зламаний', true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    echo 'JsonException: ', $e->getMessage(), "\n";
}`,
      String.raw`<?php
declare(strict_types=1);

final class NoteStore
{
    private array $notes = [];
    private int $nextId = 1;

    public function add(string $title): array
    {
        $note = ['id' => $this->nextId++, 'title' => $title];
        $this->notes[$note['id']] = $note;
        return $note;
    }

    public function find(int $id): ?array
    {
        return $this->notes[$id] ?? null;
    }

    public function all(): array
    {
        return array_values($this->notes);
    }

    public function delete(int $id): bool
    {
        $exists = isset($this->notes[$id]);
        unset($this->notes[$id]);
        return $exists;
    }
}

$store = new NoteStore();
$store->add('Перша');
$store->add('Друга');
$store->delete(1);
echo json_encode($store->all(), JSON_UNESCAPED_UNICODE), "\n";
var_dump($store->find(1));`,
      String.raw`<?php
declare(strict_types=1);

final class NoteApi
{
    private array $notes = [];
    private int $nextId = 1;

    /** @return array{int, string} статус і тіло JSON */
    public function handle(string $method, string $path, string $body = ''): array
    {
        if ($method === 'POST' && $path === '/notes') {
            try {
                $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                return $this->json(400, ['error' => 'invalid json']);
            }
            $title = is_array($data) ? trim((string) ($data['title'] ?? '')) : '';
            if ($title === '') {
                return $this->json(422, ['error' => 'title is required']);
            }
            $note = ['id' => $this->nextId++, 'title' => $title];
            $this->notes[$note['id']] = $note;
            return $this->json(201, $note);
        }
        if ($method === 'GET' && $path === '/notes') {
            return $this->json(200, array_values($this->notes));
        }
        if (preg_match('#^/notes/(\d+)$#', $path, $m) === 1) {
            $id = (int) $m[1];
            if (!isset($this->notes[$id])) {
                return $this->json(404, ['error' => 'not found']);
            }
            if ($method === 'GET') {
                return $this->json(200, $this->notes[$id]);
            }
            if ($method === 'DELETE') {
                unset($this->notes[$id]);
                return [204, ''];
            }
        }
        return $this->json(404, ['error' => 'no such route']);
    }

    private function json(int $status, array $data): array
    {
        return [$status, json_encode($data, JSON_UNESCAPED_UNICODE)];
    }
}

$api = new NoteApi();
$calls = [
    ['POST', '/notes', '{"title": "Купити хліб"}'],
    ['POST', '/notes', '{"title": ""}'],
    ['POST', '/notes', '{зламано'],
    ['GET', '/notes/1', ''],
    ['DELETE', '/notes/1', ''],
    ['GET', '/notes/1', ''],
];
foreach ($calls as [$method, $path, $body]) {
    [$status, $json] = $api->handle($method, $path, $body);
    echo "$method $path -> $status $json\n";
}`,
      String.raw`<?php
// аварія: некоректний JSON з прапорцем JSON_THROW_ON_ERROR кидає необроблену JsonException
$body = '{"title": "без закритої дужки"';
$data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
echo "Сюди ми не дійдемо\n";`,
    ],
    note: "JSON-API це три кроки: розібрати тіло через <code>json_decode</code> з <code>JSON_THROW_ON_ERROR</code>, виконати дію над сховищем, віддати відповідь через <code>json_encode</code> з точним кодом статусу: <code>201</code>, <code>404</code>, <code>422</code>.",
    work: "Мобільні застосунки, односторінкові сайти, інтеграції між сервісами й вебхуки платіжних систем розмовляють саме JSON. Уміння чітко обирати коди статусу й не губити помилки розбору економить години налагодження на стику систем.",
    tasks: [
      "Яка небезпека в json_decode без прапорця JSON_THROW_ON_ERROR?",
      "Який код статусу означає, що JSON правильний, але дані не пройшли перевірку?",
    ],
  },
  {
    t: "Middleware як викликані об'єкти",
    ch: "Запити й сервіси",
    easy: "Middleware схожий на кілька контрольних пунктів на шляху до концерту: спершу перевіряють квиток, потім оглядають сумку, потім ставлять штамп. Кожен може пропустити далі або зупинити вас на місці.",
    p: [
      "Крім основної логіки, кожен запит потребує наскрізних справ: записати його в журнал, перевірити, що користувач увійшов, перетворити виняток на відповідь <code>500</code>, додати службовий заголовок. Якщо копіювати це в кожен обробник, код розповзається. <b>Middleware</b> (проміжний шар) виносить такі справи в окремі маленькі об'єкти, які можна підключати й міняти місцями.",
      "Модель у голові: цибулина. У центрі обробник, навколо нього шари. Запит іде від зовнішнього шару до центру, відповідь повертається назад тим самим шляхом. Кожен шар отримує запит і функцію <code>$next</code>, тобто «решту ланцюжка». Він може змінити запит, викликати <code>$next($request)</code>, змінити відповідь, що повернулася, або взагалі не викликати <code>$next</code> і одразу відповісти самому, наприклад <code>401</code>.",
      "Викликаний об'єкт це клас із методом <code>__invoke</code>: його екземпляр можна викликати як функцію, і <code>callable</code> його приймає. Перевага перед замиканням: у такого об'єкта є власний стан і залежності через конструктор (журнал, список дозволених токенів), а в тестах його легко підмінити. Власне ланцюжок збирає <code>array_reduce</code>: проходимо шари з кінця й кожен загортаємо навколо вже зібраної решти.",
      "Пастка номер один: <b>порядок має значення</b>. Якщо перевірка доступу стоїть після журналу, відхилені запити теж потраплять у журнал; якщо перед, ні. Обробник винятків ставте найзовнішнім, щоб він ловив помилки всіх шарів. Пастка номер два: шар, який забув написати <code>return</code> перед <code>$next($request)</code>, повертає <code>null</code>, і при заданому типі результату це <code>TypeError</code>. Пастка номер три: <code>array_reduce</code> іде зліва направо, тому без <code>array_reverse</code> порядок виконання вийде навпаки.",
      "Ідіоми. Підпис однаковий для всіх шарів: <code>(array $request, callable $next): array</code>. Шар без стану можна записати стрілковою функцією, а зі станом класом. Короткозамкнення (відповісти, не викликаючи <code>$next</code>) це нормальний прийом, а не помилка. Не змінюйте запит «на місці»: масиви в PHP копіюються за значенням, тож передавайте наступному шару новий масив із доданим полем.",
      "Усе це схоже на композицію функцій: зібраний ланцюжок сам є звичайним <code>callable</code>, який приймає запит і повертає відповідь, тож його можна вкласти в інший ланцюжок. Кожен шар бачить лише вхід і вихід, тому його легко перевірити окремо, подавши масив і порівнявши результат.",
      "Далі в цій главі: безпека. Спершу складемо вхід користувача із хешу пароля й імітації сесії, а потім побачимо, як стандарт PSR-15 називає ці самі шари й закріплює їхній підпис для всієї спільноти PHP.",
    ],
    code: [
      String.raw`<?php
// Один шар: обгортає обробник і додає поведінку до нього та після нього
$core = fn(array $req): array => ['status' => 200, 'body' => 'Привіт, ' . $req['user']];

$shout = function (array $req, callable $next): array {
    $res = $next($req);
    $res['body'] = mb_strtoupper($res['body']);
    return $res;
};

$res = $shout(['user' => 'Оля'], $core);
echo $res['status'], ' ', $res['body'], "\n";`,
      String.raw`<?php
declare(strict_types=1);

// Викликаний об'єкт: має стан і працює як функція
final class CounterMiddleware
{
    private int $count = 0;

    public function __invoke(array $req, callable $next): array
    {
        $this->count++;
        $res = $next($req);
        $res['headers']['x-count'] = (string) $this->count;
        return $res;
    }
}

$mw = new CounterMiddleware();
$core = fn(array $req): array => ['status' => 200, 'body' => 'ok', 'headers' => []];

var_dump(is_callable($mw));
$mw(['path' => '/'], $core);
$res = $mw(['path' => '/'], $core);
echo $res['headers']['x-count'], "\n";`,
      String.raw`<?php
declare(strict_types=1);

/** Збирає ланцюжок: перший шар у списку виконується першим */
function pipeline(array $middlewares, callable $core): callable
{
    return array_reduce(
        array_reverse($middlewares),
        fn(callable $next, callable $mw): callable => fn(array $req): array => $mw($req, $next),
        $core,
    );
}

$log = [];
$a = function (array $req, callable $next) use (&$log): array {
    $log[] = 'A до';
    $res = $next($req);
    $log[] = 'A після';
    return $res;
};
$b = function (array $req, callable $next) use (&$log): array {
    $log[] = 'B до';
    $res = $next($req);
    $log[] = 'B після';
    return $res;
};

$app = pipeline([$a, $b], function (array $req) use (&$log): array {
    $log[] = 'обробник';
    return ['status' => 200, 'body' => 'ok'];
});
$app(['path' => '/']);
echo implode(' > ', $log), "\n";`,
      String.raw`<?php
declare(strict_types=1);

function pipeline(array $middlewares, callable $core): callable
{
    return array_reduce(
        array_reverse($middlewares),
        fn(callable $next, callable $mw): callable => fn(array $req): array => $mw($req, $next),
        $core,
    );
}

$errors = function (array $req, callable $next): array {
    try {
        return $next($req);
    } catch (Throwable $e) {
        return ['status' => 500, 'body' => 'Помилка: ' . $e->getMessage()];
    }
};

$auth = function (array $req, callable $next): array {
    if (($req['token'] ?? '') !== 'secret') {
        return ['status' => 401, 'body' => 'Потрібен вхід'];
    }
    return $next($req + ['user' => 'Оля']);
};

$app = pipeline([$errors, $auth], function (array $req): array {
    if ($req['path'] === '/boom') {
        throw new RuntimeException('щось зламалось');
    }
    return ['status' => 200, 'body' => 'Привіт, ' . $req['user']];
});

foreach ([['/', ''], ['/', 'secret'], ['/boom', 'secret']] as [$path, $token]) {
    $res = $app(['path' => $path, 'token' => $token]);
    echo $path, ' -> ', $res['status'], ' ', $res['body'], "\n";
}`,
      String.raw`<?php
// аварія: шар забув повернути результат $next, тому повертається null
declare(strict_types=1);

$forgetful = function (array $req, callable $next): array {
    $next($req);
};

$core = fn(array $req): array => ['status' => 200, 'body' => 'ok'];
$res = $forgetful(['path' => '/'], $core);
echo $res['status'], "\n";`,
    ],
    note: "Middleware це шар із підписом <code>(запит, $next) → відповідь</code>: він може змінити запит, викликати <code>$next</code> або відповісти сам. Ланцюжок збирає <code>array_reduce</code>, а порядок шарів визначає, що саме побачить кожен із них.",
    work: "Журнал запитів, перевірка токена, обмеження частоти, CORS, стиснення, обробка помилок у Laravel, Symfony і Slim зроблені саме як middleware. Розуміючи цю будову, ви легко пишете власні шари й правильно їх упорядковуєте.",
    tasks: [
      "Що станеться, якщо шар відповість сам і не викличе $next?",
      "Чому обробник винятків ставлять найзовнішнім шаром?",
    ],
  },
  {
    t: "Паролі й сесії: password_hash та емуляція сесії",
    ch: "Запити й сервіси",
    easy: "Хеш пароля схожий на відбиток пальця: за ним можна впізнати власника, але самого пальця з відбитка не відновиш. Сесія нагадує браслет на фестивалі: перевірили раз на вході, далі просто показуєте браслет.",
    p: [
      "Будь-який сервіс із входом має відповісти на два питання: як безпечно зберігати паролі та як «пам'ятати» користувача між запитами. HTTP сам по собі нічого не пам'ятає, кожен запит приходить, наче вперше. Тому пароль перевіряють один раз, а потім видають клієнтові короткий ідентифікатор сесії, за яким сервер знаходить дані користувача.",
      "Пароль <b>ніколи</b> не зберігають відкрито й не шифрують оборотно. Зберігають хеш: результат односторонньої функції, повільної навмисно, щоб підбір коштував дорого. У PHP для цього є пара: <code>password_hash($password, PASSWORD_DEFAULT)</code> створює хеш, у який уже вбудовано сіль і параметри алгоритму, а <code>password_verify($password, $hash)</code> перевіряє пароль проти нього. Хеш щоразу різний, навіть для того самого пароля, тому порівнювати їх через <code>===</code> не можна, лише через <code>password_verify</code>.",
      "Сесія в звичайному PHP працює так: <code>session_start()</code> читає cookie з ідентифікатором і наповнює суперглобальний масив <code>$_SESSION</code>, дані якого сервер тримає в себе. У консолі веб-запиту немає, тож ми емулюємо сесію масивом усередині невеликого класу з ідентифікатором. Логіка однакова: після успішного входу кладемо в сесію <code>user</code>, при виході очищаємо.",
      "Пастки паролів. Не використовуйте <code>md5</code> чи <code>sha1</code> для паролів: вони швидкі, а отже легко підбираються. Алгоритм bcrypt з <code>PASSWORD_DEFAULT</code> обробляє лише перші 72 байти пароля, тому дуже довгі паролі різняться лише початком. Хеші не порівнюйте нестрого: рядки <code>\"0e123\"</code> і <code>\"0e999\"</code> при <code>==</code> вважаються рівними, бо обидва виглядають як число нуль у степені. Для порівняння токенів є <code>hash_equals</code>, що працює за сталий час.",
      "Пастки сесій. Після входу змінюйте ідентифікатор сесії (<code>session_regenerate_id(true)</code>), інакше зловмисник, який підкинув жертві свій ідентифікатор, отримає її доступ: це фіксація сесії. Cookie сесії має бути з прапорцями <code>HttpOnly</code> і <code>Secure</code>, щоб скрипт на сторінці її не прочитав. Повідомлення про невдачу робіть однаковим для «немає такого користувача» й «хибний пароль»: так ви не підкажете, які імена існують.",
      "Ідіоми. Після успішної перевірки викликайте <code>password_needs_rehash</code>: якщо параметри алгоритму застаріли, збережіть новий хеш. Хеш завжди зберігайте в стовпці з запасом довжини (255 символів). Ніколи не друкуйте й не записуйте в журнал сам пароль чи його хеш. Логіку входу тримайте в сервісі, який отримує користувачів і сесію ззовні, тоді її легко перевірити без сервера.",
      "Тепер ми вміємо складати сервіс із маршрутів, шарів і входу. Наступний урок називає ці шари стандартними іменами: PSR-7 описує запит і відповідь як незмінні об'єкти, а PSR-15 фіксує інтерфейси middleware.",
    ],
    code: [
      String.raw`<?php
$hash = password_hash('secret123', PASSWORD_DEFAULT);

var_dump(password_verify('secret123', $hash));
var_dump(password_verify('wrong', $hash));
var_dump($hash !== 'secret123');
echo password_get_info($hash)['algoName'], "\n";

// Той самий пароль дає різні хеші, бо кожен містить власну сіль
var_dump(password_hash('secret123', PASSWORD_DEFAULT) === $hash);`,
      String.raw`<?php
// Дешевий cost лише для прикладу, у роботі лишайте значення за замовчуванням
$old = password_hash('secret123', PASSWORD_BCRYPT, ['cost' => 4]);

var_dump(password_needs_rehash($old, PASSWORD_BCRYPT, ['cost' => 4]));
var_dump(password_needs_rehash($old, PASSWORD_BCRYPT, ['cost' => 10]));

if (password_verify('secret123', $old) && password_needs_rehash($old, PASSWORD_BCRYPT, ['cost' => 10])) {
    $new = password_hash('secret123', PASSWORD_BCRYPT, ['cost' => 10]);
    echo "Хеш оновлено: ", password_get_info($new)['options']['cost'], "\n";
}`,
      String.raw`<?php
// Поведінка, що дивує: нестроге порівняння «магічних» рядків
var_dump('0e12345' == '0e99999');
var_dump('0e12345' === '0e99999');
var_dump(hash_equals('0e12345', '0e99999'));
var_dump('abc' == 0);`,
      String.raw`<?php
declare(strict_types=1);

// Імітація сесії: у консолі немає cookie й $_SESSION
final class Session
{
    private array $data = [];
    private int $generation = 1;

    public function id(): string { return 'sess-' . $this->generation; }
    public function set(string $key, mixed $value): void { $this->data[$key] = $value; }
    public function get(string $key): mixed { return $this->data[$key] ?? null; }
    public function regenerate(): void { $this->generation++; }
    public function destroy(): void { $this->data = []; }
}

final class Auth
{
    /** @param array<string, string> $users логін => хеш */
    public function __construct(private array $users, private Session $session) {}

    public function login(string $name, string $password): bool
    {
        $hash = $this->users[$name] ?? '';
        if ($hash === '' || !password_verify($password, $hash)) {
            return false;
        }
        $this->session->regenerate();
        $this->session->set('user', $name);
        return true;
    }

    public function user(): ?string
    {
        return $this->session->get('user');
    }

    public function logout(): void
    {
        $this->session->destroy();
    }
}

$session = new Session();
$auth = new Auth(['olya' => password_hash('secret123', PASSWORD_DEFAULT)], $session);

echo 'До входу: ', $auth->user() ?? 'гість', ' (', $session->id(), ")\n";
var_dump($auth->login('olya', 'wrong'));
var_dump($auth->login('nobody', 'secret123'));
var_dump($auth->login('olya', 'secret123'));
echo 'Після входу: ', $auth->user(), ' (', $session->id(), ")\n";
$auth->logout();
echo 'Після виходу: ', $auth->user() ?? 'гість', "\n";`,
      String.raw`<?php
// аварія: у суворому режимі число не приймається як пароль
declare(strict_types=1);

$hash = password_hash('12345', PASSWORD_DEFAULT);
var_dump(password_verify('12345', $hash));
var_dump(password_verify(12345, $hash));`,
    ],
    note: "Пароль зберігають лише як хеш від <code>password_hash</code> і перевіряють через <code>password_verify</code>, а не через <code>==</code>. Після входу міняйте ідентифікатор сесії, а про невдачу повідомляйте однаково для хибного логіна й хибного пароля.",
    work: "Вхід у кабінет, адмінка, ліміти спроб, скидання пароля: усе спирається на цю пару функцій та сесію. Витік бази з відкритими паролями це серйозний інцидент, а правильні хеші суттєво зменшують його наслідки для користувачів.",
    tasks: [
      "Чому хеші двох однакових паролів різні й чим їх тоді порівнювати?",
      "Навіщо змінювати ідентифікатор сесії одразу після успішного входу?",
    ],
  },
  {
    t: "PSR-7 і PSR-15: ідеї та інтерфейси",
    ch: "Запити й сервіси",
    adv: true,
    easy: "PSR це як стандарт розетки: неважливо, хто виготовив прилад, якщо вилка підходить. Так само фреймворки обмінюються запитами, відповідями й обробниками, бо всі домовилися про форму цих об'єктів.",
    p: [
      "Ми вже писали власні <code>Request</code>, <code>Response</code> і middleware. Кожен фреймворк робив так само, але зі своїми іменами методів, тому бібліотека для одного не підходила до іншого. Група PHP-FIG випустила рекомендації PSR (PHP Standards Recommendations), і дві з них описують саме нашу тему: PSR-7 визначає об'єкти HTTP-повідомлень, а PSR-15 визначає обробники й middleware.",
      "Модель у голові. PSR-7 це набір інтерфейсів у просторі імен <code>Psr\\Http\\Message</code>: <code>RequestInterface</code>, <code>ServerRequestInterface</code>, <code>ResponseInterface</code>, <code>StreamInterface</code>, <code>UriInterface</code>. Головна ідея: повідомлення <b>незмінні</b>. Метод <code>withHeader()</code> не міняє об'єкт, а повертає його копію з новим заголовком. PSR-15 додає два інтерфейси: <code>RequestHandlerInterface</code> з єдиним методом <code>handle(request): response</code> і <code>MiddlewareInterface</code> з методом <code>process(request, handler): response</code>.",
      "Зверніть увагу на зв'язок із попереднім уроком. Middleware отримує запит і <i>наступний обробник</i>, а не просто функцію <code>$next</code>. Решта ланцюжка сама є обробником: ви викликаєте <code>$handler-&gt;handle($request)</code>, щоб передати керування далі, або повертаєте власну відповідь і далі не йдете. Так вхід, журнал, CORS і ліміти запитів стають змінними деталями, які можна підключати до будь-якого сумісного фреймворку.",
      "Самі інтерфейси лежать у пакетах <code>psr/http-message</code> і <code>psr/http-server-handler</code>, які ставлять через Composer. У пісочниці пакетів немає, тому ми оголосимо спрощені інтерфейси з такою ж формою і самі їх реалізуємо. Це чесний спосіб побачити суть: справжні сигнатури довші (потоки, URI, версія протоколу), але принцип той самий.",
      "Пастки. Незмінність вимагає дисципліни: виклик <code>$request-&gt;withAttribute('user', $u)</code> без присвоєння результату нічого не змінить, бо оригінал лишається як був. Це найпоширеніша помилка новачків. Друга пастка: тіло в PSR-7 це потік, який читається один раз, тож після читання його треба перемотати. Третя: імена заголовків нечутливі до регістру, а значення зберігаються як масиви рядків.",
      "Ідіоми. Залежіть від інтерфейсів, а не від конкретних класів: параметр типу <code>ResponseInterface</code> прийме відповідь будь-якої бібліотеки. Для створення відповідей у PSR-17 існують фабрики, їх передають через конструктор. Не додавайте у власні реалізації публічних змінних методів: так ви зламаєте гарантію незмінності, на яку спираються інші. Також не залежіть від порядку заголовків у масиві: специфікація його не гарантує, а тести, що порівнюють рядки цілком, ламаються від найменшої перестановки. Перевіряйте окремі заголовки через <code>getHeaderLine</code> і порівнюйте їх значення, а не весь масив.",
      "Наступний урок використовує ці ідеї на практиці: відповідь, яку можна безпечно кешувати, бо вона описується заголовками <code>ETag</code> і <code>304</code>, а умовний запит повертає порожнє тіло, якщо дані не змінилися.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

// Спрощений аналог PSR-7: незмінне повідомлення з методами with*
final class Message
{
    public function __construct(private array $headers = []) {}

    public function withHeader(string $name, string $value): static
    {
        $copy = clone $this;
        $copy->headers[strtolower($name)] = [$value];
        return $copy;
    }

    public function getHeaderLine(string $name): string
    {
        return implode(', ', $this->headers[strtolower($name)] ?? []);
    }
}

$a = new Message();
$b = $a->withHeader('Content-Type', 'text/plain');

echo 'a: [', $a->getHeaderLine('content-type'), "]\n";
echo 'b: [', $b->getHeaderLine('CONTENT-TYPE'), "]\n";`,
      String.raw`<?php
declare(strict_types=1);

// Інтерфейси з тією ж формою, що й у PSR-15, але спрощені
interface RequestHandler
{
    public function handle(array $request): array;
}

interface Middleware
{
    public function process(array $request, RequestHandler $next): array;
}

final class App implements RequestHandler
{
    public function handle(array $request): array
    {
        return ['status' => 200, 'body' => 'Привіт, ' . ($request['user'] ?? 'гість')];
    }
}

final class AddUser implements Middleware
{
    public function process(array $request, RequestHandler $next): array
    {
        $request['user'] = 'Оля';
        return $next->handle($request);
    }
}

$mw = new AddUser();
$app = new App();
$res = $mw->process([], $app);
echo $res['status'], ' ', $res['body'], "\n";`,
      String.raw`<?php
declare(strict_types=1);

interface RequestHandler { public function handle(array $request): array; }
interface Middleware { public function process(array $request, RequestHandler $next): array; }

// Адаптер: обробник, що обгортає middleware та наступний обробник
final class Step implements RequestHandler
{
    public function __construct(private Middleware $mw, private RequestHandler $next) {}

    public function handle(array $request): array
    {
        return $this->mw->process($request, $this->next);
    }
}

final class Pipeline implements RequestHandler
{
    /** @param list<Middleware> $stack */
    public function __construct(private array $stack, private RequestHandler $app) {}

    public function handle(array $request): array
    {
        $handler = $this->app;
        foreach (array_reverse($this->stack) as $mw) {
            $handler = new Step($mw, $handler);
        }
        return $handler->handle($request);
    }
}

final class Tag implements Middleware
{
    public function __construct(private string $label) {}

    public function process(array $request, RequestHandler $next): array
    {
        $request['trail'][] = $this->label;
        $res = $next->handle($request);
        $res['body'] .= ' <' . $this->label;
        return $res;
    }
}

final class Echoer implements RequestHandler
{
    public function handle(array $request): array
    {
        return ['status' => 200, 'body' => implode('>', $request['trail'])];
    }
}

$pipe = new Pipeline([new Tag('A'), new Tag('B')], new Echoer());
echo $pipe->handle(['trail' => []])['body'], "\n";`,
      String.raw`<?php
// фрагмент: потрібен Composer і пакети psr/http-message та psr/http-server-handler
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class Hello implements RequestHandlerInterface
{
    public function __construct(private \Psr\Http\Message\ResponseFactoryInterface $factory) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $response = $this->factory->createResponse(200);
        $response->getBody()->write('Привіт');
        return $response->withHeader('Content-Type', 'text/plain');
    }
}`,
      String.raw`<?php
// аварія: незмінне повідомлення не можна переприсвоїти ззовні
declare(strict_types=1);

final class Msg
{
    public function __construct(public readonly string $body) {}
}

$m = new Msg('Привіт');
echo $m->body, "\n";
$m->body = 'Змінено';`,
    ],
    note: "PSR-7 описує незмінні запит і відповідь, PSR-15 описує обробник з методом <code>handle</code> та middleware з методом <code>process</code>. Методи <code>with*</code> повертають копію, тому їхній результат треба присвоювати.",
    work: "Slim, Laravel, Symfony та Mezzio вміють працювати з PSR-7 і PSR-15. Завдяки цьому middleware для авторизації, CORS чи журналу пишуть один раз і підключають у будь-який сумісний проєкт без переписування.",
    tasks: [
      "Чому метод withHeader повертає новий об'єкт, а не змінює поточний?",
      "Що middleware у PSR-15 отримує, крім запиту, і навіщо?",
    ],
  },
  {
    t: "Кеш відповіді: ETag і умовні запити",
    ch: "Запити й сервіси",
    adv: true,
    easy: "ETag схожий на штамп на чеку: клієнт приносить штамп і питає, чи змінилася страва. Якщо ні, кухар каже «те саме» й не готує знову, а відвідувач бере те, що вже має.",
    p: [
      "Найдешевша відповідь це та, яку не треба будувати й надсилати. Якщо клієнт уже має копію сторінки чи JSON, сервер може лише підтвердити, що вона актуальна. Це економить трафік і час, а на сервері дозволяє пропустити дороге формування тіла. Механізм називається умовними запитами.",
      "Модель у голові. Разом з відповіддю сервер надсилає заголовок <code>ETag</code>: ярлик поточної версії ресурсу, наприклад <code>\"a1b2\"</code>. Наступного разу клієнт додає до запиту <code>If-None-Match: \"a1b2\"</code>. Якщо ярлик збігається з поточним, сервер повертає статус <code>304 Not Modified</code> без тіла, і клієнт бере копію з кешу. Якщо ні, повертає повну відповідь <code>200</code> з новим ярликом.",
      "Як отримати ярлик. Найпростіше взяти хеш вмісту: <code>'\"' . md5($body) . '\"'</code>. Для швидкості його можна рахувати від версії запису чи часу оновлення, а не від усього тіла. Лапки є частиною значення за специфікацією. Слабкий ярлик має префікс <code>W/</code> і означає семантичну, а не байтову рівність. У нашій пісочниці заголовків немає, тому запит і відповідь це масиви, а логіка та сама.",
      "Пастки. Перша: ярлик мусить змінюватися разом із вмістом, інакше клієнти застрягнуть на застарілих даних. Друга: порівнюйте ярлики як <b>рядки</b> через <code>===</code> або <code>hash_equals</code>. Нестроге <code>==</code> вважає рівними різні рядки на кшталт <code>\"0e462...\"</code> і <code>\"0e830...\"</code>, бо читає їх як числа в експоненційному записі, а деякі md5-хеші саме так і виглядають. Третя: заголовок <code>If-None-Match</code> може містити кілька ярликів через кому або зірочку.",
      "Ще одна пастка: відповідь <code>304</code> не має тіла, тому не забудьте очистити його й залишити заголовок <code>ETag</code>. Для небезпечних методів, як-от <code>POST</code>, умовні запити працюють інакше (заголовок <code>If-Match</code> захищає від перезапису чужих змін), тож не змішуйте ці два випадки.",
      "Ідіоми. Винесіть логіку в окрему функцію чи middleware: вона бере готову відповідь, додає ярлик і за потреби підміняє її на <code>304</code>. Це зручно поєднувати з ланцюжком із попередніх уроків. До <code>ETag</code> можна додати <code>Cache-Control</code>, щоб керувати тим, як довго клієнт узагалі не питає сервер. Наприклад, <code>max-age=60</code> означає, що протягом хвилини клієнт бере копію без жодного запиту, а після цього вже надсилає умовний запит з <code>If-None-Match</code>. Разом ці два механізми дають і швидкість, і свіжість даних, бо сервер відповідає коротким «без змін», поки вміст не зміниться.",
      "Це завершує главу: ми склали запит, маршрути, API, middleware, вхід і кешування. У наступній главі ці частини розкладаються по шарах: контролер, сервіс і репозиторій.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

function etag(string $body): string
{
    return '"' . md5($body) . '"';
}

$tag = etag('{"id":1,"title":"Молоко"}');
echo strlen($tag), "\n";
var_dump($tag === etag('{"id":1,"title":"Молоко"}'));
var_dump($tag === etag('{"id":1,"title":"Хліб"}'));`,
      String.raw`<?php
declare(strict_types=1);

function etag(string $body): string
{
    return '"' . md5($body) . '"';
}

/** @return array{status: int, headers: array<string, string>, body: string} */
function respond(array $request, string $body): array
{
    $tag = etag($body);
    $headers = ['etag' => $tag];
    if (($request['if-none-match'] ?? null) === $tag) {
        return ['status' => 304, 'headers' => $headers, 'body' => ''];
    }
    return ['status' => 200, 'headers' => $headers, 'body' => $body];
}

$first = respond([], 'Список нотаток');
echo $first['status'], ' ', $first['body'], "\n";

$second = respond(['if-none-match' => $first['headers']['etag']], 'Список нотаток');
echo $second['status'], ' [', $second['body'], "]\n";

$third = respond(['if-none-match' => $first['headers']['etag']], 'Список змінено');
echo $third['status'], ' ', $third['body'], "\n";`,
      String.raw`<?php
declare(strict_types=1);

// Заголовок If-None-Match може містити кілька ярликів або зірочку
function matches(string $header, string $current): bool
{
    $header = trim($header);
    if ($header === '*') {
        return true;
    }
    foreach (explode(',', $header) as $candidate) {
        $candidate = trim($candidate);
        if (str_starts_with($candidate, 'W/')) {
            $candidate = substr($candidate, 2);
        }
        if (hash_equals($current, $candidate)) {
            return true;
        }
    }
    return false;
}

$cur = '"v2"';
var_dump(matches('"v1", "v2"', $cur));
var_dump(matches('W/"v2"', $cur));
var_dump(matches('"v3"', $cur));
var_dump(matches('*', $cur));`,
      String.raw`<?php
// Поведінка, що дивує: нестроге порівняння «магічних» md5-хешів
$a = md5('240610708');
$b = md5('QNKCDZO');

echo $a, "\n", $b, "\n";
var_dump($a == $b);
var_dump($a === $b);
var_dump(hash_equals($a, $b));`,
      String.raw`<?php
// аварія: у суворому режимі число не приймається як тіло відповіді
declare(strict_types=1);

function etag(string $body): string
{
    return '"' . md5($body) . '"';
}

echo strlen(etag('ok')), "\n";
echo etag(404), "\n";`,
    ],
    note: "Сервер віддає <code>ETag</code>, клієнт повертає його в <code>If-None-Match</code>, а збіг дає <code>304</code> без тіла. Ярлики порівнюйте як рядки через <code>===</code> чи <code>hash_equals</code>, а не нестрого.",
    work: "Умовні запити економлять трафік у каталогах, списках і API для мобільних застосунків: клієнт часто питає, чи змінилися дані, а відповідь майже завжди коротке «без змін». Так навантаження на сервер падає, а екрани відкриваються швидше.",
    tasks: [
      "Що повертає сервер, коли ETag із запиту збігається з поточним?",
      "Чому ярлики не можна порівнювати через нестроге ==?",
    ],
  },
  // @@END
];
