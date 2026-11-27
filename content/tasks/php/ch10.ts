// Практичні завдання глави «Запити й сервіси», уроки 92–99. Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "php-request-response", lesson: "php/92", xp: 30,
    title: "Запит, відповідь і обробник",
    context: "Сервіс це функція, що перетворює запит на відповідь. Об'єкти запиту й відповіді роблять її перевірюваною без веб-сервера, а незмінність відповіді захищає від випадкових змін на шляху.",
    brief: [
      "Допишіть <code>Response::withHeader(string $name, string $value): self</code>: вона повертає <b>нову</b> відповідь з тим самим статусом і тілом та доданим заголовком (ім'я переведіть у нижній регістр через <code>strtolower</code>). Оригінал змінюватися не повинен.",
      "Допишіть <code>handle(Request $r): Response</code>: шлях <code>/hello</code> дає статус <code>200</code> і тіло <code>Привіт, {name}!</code>, де <code>name</code> береться з <code>$r-&gt;query['name']</code> (без нього <code>світе</code>); будь-який інший шлях дає <code>404</code> і тіло <code>Not Found</code>. Програма друкує <code>статус тіло</code> по рядку для трьох запитів, а далі рядок <code>кількість_заголовків_до кількість_після значення_x-test</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class Request
{
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query = [],
    ) {}
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
        // TODO: поверніть НОВУ відповідь із доданим заголовком (ім'я малими літерами)
        return $this;
    }
}

function handle(Request $r): Response
{
    // TODO: /hello -> 200 і привітання, інакше 404 «Not Found»
    return new Response(500, 'TODO');
}

$requests = [
    new Request('GET', '/hello', ['name' => 'Оля']),
    new Request('GET', '/hello'),
    new Request('GET', '/other'),
];
foreach ($requests as $r) {
    $res = handle($r);
    echo $res->status, ' ', $res->body, "\n";
}

$a = new Response(200, 'ok');
$b = $a->withHeader('X-Test', '1');
echo count($a->headers), ' ', count($b->headers), ' ', $b->headers['x-test'] ?? '-', "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "200 Привіт, Оля!\n200 Привіт, світе!\n404 Not Found\n0 1 1", hint: "Чотири рядки: три відповіді обробника й рядок про заголовки." },
      { on: "stdout", name: "Невідомий шлях дає 404", has: "404 Not Found", hint: "Для шляху, відмінного від /hello, поверніть статус 404." },
      { on: "stdout", name: "Оригінал не змінився", has: "0 1 1", hint: "Відповідь $a має лишитися без заголовків, а $b отримати один: це нова відповідь." },
      { on: "source", name: "Ім'я заголовка нормалізується", matches: "strtolower\\(", hint: "Імена заголовків нечутливі до регістру: зберігайте їх малими літерами." },
    ],
  },
  {
    ...base, id: "php-form-validate", lesson: "php/93", xp: 35,
    title: "Валідація форми й захист виводу",
    context: "Дані з форми не можна довіряти: їх перевіряють на сервері й екранують перед виводом у HTML. Тут форма імітується масивом, як $_POST. Перевірка email через filter_var, а екранування через htmlspecialchars захищає від XSS.",
    brief: [
      "Допишіть <code>validate(array $post): array</code>: повертає список помилок. Порожнє <code>name</code> дає <code>Ім'я обов'язкове</code>, некоректний <code>email</code> (<code>filter_var($post['email'], FILTER_VALIDATE_EMAIL)</code>) дає <code>Невірний email</code>, вік <code>age</code> менше 18 дає <code>Вік має бути 18+</code>.",
      "Допишіть <code>safe(string $s)</code>: екранування HTML через <code>htmlspecialchars</code>. Програма друкує помилки для поганої форми через <code>; </code>, потім <code>OK</code> для правильної й екранований рядок.",
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
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Ім'я обов'язкове; Невірний email; Вік має бути 18+\nOK\n&lt;b&gt;Оля&lt;/b&gt;", hint: "Три рядки: помилки через «; », слово OK, екранований HTML." },
      { on: "stdout", name: "Для порожньої форми три помилки", has: "Ім'я обов'язкове; Невірний email; Вік має бути 18+", hint: "Додавайте кожну помилку окремою перевіркою, не зупиняючись на першій." },
      { on: "stdout", name: "HTML екранується", has: "&lt;b&gt;Оля&lt;/b&gt;", hint: "Спецсимволи < і > має замінити htmlspecialchars." },
      { on: "source", name: "Email перевіряється через filter_var", has: "filter_var(", hint: "Для пошти є готовий фільтр FILTER_VALIDATE_EMAIL." },
      { on: "source", name: "Вивід екранується через htmlspecialchars", has: "htmlspecialchars(", hint: "Екранувати треба вбудованою функцією, а не власною заміною." },
    ],
  },
  {
    ...base, id: "php-router", lesson: "php/94", xp: 35,
    title: "Маршрутизатор із параметрами",
    context: "Маршрутизатор вибирає обробник за методом і шляхом та передає йому параметри з адреси. Ви напишете мінімальну версію: шаблони з {id}, відповідь 404 для невідомого шляху й 405 для неправильного методу.",
    brief: [
      "Допишіть <code>Router::add()</code>: перетворіть шаблон на регулярний вираз, замінивши кожне <code>{name}</code> на іменну групу <code>(?P&lt;name&gt;[^/]+)</code>, обгорніть його в <code>#^…$#</code> і збережіть разом з методом і обробником.",
      "Допишіть <code>Router::dispatch()</code>: повертає масив <code>[статус, тіло]</code>. Перший збіг за шляхом і методом викликає обробник з іменованими параметрами (<code>[200, …]</code>). Якщо шлях збігся, а метод ні, відповідь <code>[405, 'Allow: GET, DELETE']</code> із методами через кому й пробіл у порядку реєстрації; якщо шляху немає зовсім, <code>[404, 'Not Found']</code>. Програма друкує по рядку <code>метод шлях -&gt; статус тіло</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class Router
{
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        // TODO: перетворіть {name} на (?P<name>[^/]+) і збережіть [метод, регулярний вираз, обробник]
    }

    public function dispatch(string $method, string $path): array
    {
        // TODO: знайдіть маршрут; 200 від обробника, 405 з переліком методів або 404
        return [500, 'TODO'];
    }
}

$router = new Router();
$router->add('GET', '/notes', fn() => 'список');
$router->add('GET', '/notes/{id}', fn(string $id) => "нотатка $id");
$router->add('DELETE', '/notes/{id}', fn(string $id) => "видалено $id");

$requests = [['GET', '/notes'], ['GET', '/notes/7'], ['POST', '/notes/7'], ['DELETE', '/notes/7'], ['GET', '/nope']];
foreach ($requests as [$method, $path]) {
    [$status, $body] = $router->dispatch($method, $path);
    echo "$method $path -> $status $body\n";
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "GET /notes -> 200 список\nGET /notes/7 -> 200 нотатка 7\nPOST /notes/7 -> 405 Allow: GET, DELETE\nDELETE /notes/7 -> 200 видалено 7\nGET /nope -> 404 Not Found", hint: "П'ять рядків у форматі «метод шлях -> статус тіло»." },
      { on: "stdout", name: "Параметр з адреси доходить до обробника", has: "GET /notes/7 -> 200 нотатка 7", hint: "Іменовані групи з preg_match передайте обробнику через розпакування $handler(...$params)." },
      { on: "stdout", name: "Неправильний метод дає 405 з переліком", has: "405 Allow: GET, DELETE", hint: "Збирайте методи маршрутів, що збіглися за шляхом, але не за методом." },
      { on: "source", name: "Використано preg_match", has: "preg_match(", hint: "Збіг шляху з шаблоном перевіряйте регулярним виразом." },
    ],
  },
  {
    ...base, id: "php-json-notes", lesson: "php/95", xp: 35,
    title: "JSON-API нотаток",
    context: "JSON-API приймає тіло запиту як рядок JSON і віддає статус та JSON-відповідь. Ви напишете створення й читання нотаток у пам'яті з правильними кодами: 201, 400, 422 і 404.",
    brief: [
      "Допишіть <code>NoteApi::handle()</code>. <code>POST /notes</code>: розберіть тіло через <code>json_decode</code> з <code>JSON_THROW_ON_ERROR</code>; некоректний JSON дає <code>400</code> і <code>{\"error\":\"invalid json\"}</code>, порожній <code>title</code> дає <code>422</code> і <code>{\"error\":\"title is required\"}</code>, інакше нотатка отримує наступний <code>id</code>, зберігається, а відповідь <code>201</code> містить її.",
      "<code>GET /notes/{id}</code>: <code>200</code> з нотаткою або <code>404</code> і <code>{\"error\":\"not found\"}</code>. Програма друкує по рядку <code>метод шлях -&gt; статус json</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class NoteApi
{
    private array $notes = [];
    private int $nextId = 1;

    /** @return array{int, string} статус і тіло JSON */
    public function handle(string $method, string $path, string $body = ''): array
    {
        if ($method === 'POST' && $path === '/notes') {
            // TODO: розберіть $body через json_decode з JSON_THROW_ON_ERROR (JsonException -> 400 {"error":"invalid json"})
            // TODO: порожній title -> 422 {"error":"title is required"}; інакше збережіть нотатку й поверніть 201
            return $this->json(500, ['error' => 'TODO']);
        }
        if ($method === 'GET' && preg_match('#^/notes/(\d+)$#', $path, $m) === 1) {
            // TODO: 200 з нотаткою або 404 {"error":"not found"}
            return $this->json(500, ['error' => 'TODO']);
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
    ['GET', '/notes/9', ''],
    ['GET', '/other', ''],
];
foreach ($calls as [$method, $path, $body]) {
    [$status, $json] = $api->handle($method, $path, $body);
    echo "$method $path -> $status $json\n";
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "POST /notes -> 201 {\"id\":1,\"title\":\"Купити хліб\"}\nPOST /notes -> 422 {\"error\":\"title is required\"}\nPOST /notes -> 400 {\"error\":\"invalid json\"}\nGET /notes/1 -> 200 {\"id\":1,\"title\":\"Купити хліб\"}\nGET /notes/9 -> 404 {\"error\":\"not found\"}\nGET /other -> 404 {\"error\":\"no such route\"}", hint: "Шість рядків у форматі «метод шлях -> статус json», кирилиця без екранування." },
      { on: "stdout", name: "Нотатку створено зі статусом 201", has: "-> 201 {\"id\":1,\"title\":\"Купити хліб\"}", hint: "Після успішного створення поверніть 201 і збережену нотатку з id." },
      { on: "stdout", name: "Зламаний JSON дає 400", has: "-> 400 {\"error\":\"invalid json\"}", hint: "Перехопіть JsonException і поверніть 400." },
      { on: "source", name: "Використано JSON_THROW_ON_ERROR", has: "JSON_THROW_ON_ERROR", hint: "Без цього прапорця json_decode мовчки поверне null." },
    ],
  },
  {
    ...base, id: "php-middleware", lesson: "php/96", xp: 35,
    title: "Ланцюжок middleware",
    context: "Middleware обгортає обробник і вирішує, чи пропустити запит далі. Ви збираєте ланцюжок через array_reduce та пишете шар перевірки доступу, що відповідає 401 без виклику наступного шару.",
    brief: [
      "Допишіть <code>Auth::__invoke(array $req, callable $next): array</code>: якщо <code>$req['token']</code> не дорівнює <code>secret</code>, поверніть <code>['status' =&gt; 401, 'body' =&gt; 'Потрібен вхід']</code>, не викликаючи <code>$next</code>; інакше викличте <code>$next</code> із запитом, доповненим ключем <code>user</code> зі значенням <code>Оля</code>.",
      "Допишіть <code>pipeline(array $middlewares, callable $core): callable</code> через <code>array_reduce</code> так, щоб перший шар списку виконувався першим. Програма друкує <code>статус тіло</code> для двох запитів і рядок <code>журнал: …</code> із записів логера через <code> | </code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class Logger
{
    public array $lines = [];

    public function __invoke(array $req, callable $next): array
    {
        $this->lines[] = '> ' . $req['path'];
        $res = $next($req);
        $this->lines[] = '< ' . $res['status'];
        return $res;
    }
}

final class Auth
{
    public function __invoke(array $req, callable $next): array
    {
        // TODO: якщо $req['token'] !== 'secret', відповісти ['status' => 401, 'body' => 'Потрібен вхід'] без виклику $next;
        // інакше викликати $next із запитом, до якого додано 'user' => 'Оля'
        return $next($req);
    }
}

/** Перший шар у списку виконується першим; повертає callable(array): array */
function pipeline(array $middlewares, callable $core): callable
{
    // TODO: зберіть ланцюжок через array_reduce (не забудьте розвернути список шарів)
    return $core;
}

$logger = new Logger();
$app = pipeline([$logger, new Auth()], function (array $req): array {
    return ['status' => 200, 'body' => 'Привіт, ' . ($req['user'] ?? 'гість')];
});

foreach ([['/', ''], ['/home', 'secret']] as [$path, $token]) {
    $res = $app(['path' => $path, 'token' => $token]);
    echo $res['status'], ' ', $res['body'], "\n";
}
echo 'журнал: ', implode(' | ', $logger->lines), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "401 Потрібен вхід\n200 Привіт, Оля\nжурнал: > / | < 401 | > /home | < 200", hint: "Три рядки: відповідь для запиту без токена, відповідь із токеном і журнал." },
      { on: "stdout", name: "Запит без токена відхилено", has: "401 Потрібен вхід", hint: "Auth має відповісти сам і не викликати $next." },
      { on: "stdout", name: "Журнал бачить і відхилений запит", has: "журнал: > / | < 401 | > /home | < 200", hint: "Logger стоїть у списку першим, тож він зовнішній і бачить відповідь Auth." },
      { on: "source", name: "Використано array_reduce", has: "array_reduce(", hint: "Ланцюжок зручно скласти згортанням списку шарів." },
    ],
  },
  {
    ...base, id: "php-password-auth", lesson: "php/97", xp: 40,
    title: "Паролі: password_hash і password_verify",
    context: "Пароль ніколи не зберігають відкрито: у сховищі лежить хеш, а при вході введений пароль перевіряють проти нього. Сесію й cookies у консолі замінює масив, тож тренуємо саму логіку входу.",
    brief: [
      "Допишіть <code>register(string $password): string</code>, що повертає хеш через <code>password_hash($password, PASSWORD_DEFAULT)</code>, і <code>login(string $password, string $hash): bool</code>, що перевіряє пароль через <code>password_verify</code>. Самі хеші не друкуйте: вони щоразу різні.",
      "Решту програми (масив <code>$session</code> замість <code>$_SESSION</code> і п'ять рядків виводу) уже написано: після успішного входу в сесію потрапляє <code>user</code>, а далі друкуються стан сесії та результати двох спроб входу.",
    ],
    starter: raw`<?php
function register(string $password): string
{
    // TODO: поверніть хеш пароля через password_hash з PASSWORD_DEFAULT
    return $password;
}

function login(string $password, string $hash): bool
{
    // TODO: перевірте пароль проти хеша через password_verify
    return false;
}

$hash = register('secret123');
$session = [];   // імітація $_SESSION

if (login('wrong', $hash)) {
    $session['user'] = 'Оля';
}
echo (isset($session['user']) ? 'Сесія: ' . $session['user'] : 'Сесії немає') . "\n";

if (login('secret123', $hash)) {
    $session['user'] = 'Оля';
}
echo (isset($session['user']) ? 'Сесія: ' . $session['user'] : 'Сесії немає') . "\n";

echo (login('secret123', $hash) ? 'Вхід дозволено' : 'Відмовлено') . "\n";
echo (login('wrong', $hash) ? 'Вхід дозволено' : 'Відмовлено') . "\n";
echo ($hash !== 'secret123' ? 'Пароль не зберігається відкрито' : 'Пароль збережено відкрито!') . "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сесії немає\nСесія: Оля\nВхід дозволено\nВідмовлено\nПароль не зберігається відкрито", hint: "П'ять рядків: два про сесію, два про вхід і підсумок про зберігання пароля." },
      { on: "stdout", name: "Правильний пароль створює сесію", has: "Сесія: Оля", hint: "login має повертати true для пароля, з якого зроблено хеш." },
      { on: "stdout", name: "Неправильний пароль відхиляється", has: "Вхід дозволено\nВідмовлено", hint: "Хибний пароль не повинен проходити перевірку password_verify." },
      { on: "stdout", name: "Пароль не зберігається відкрито", has: "Пароль не зберігається відкрито", hint: "register має повертати не сам пароль, а його хеш." },
      { on: "source", name: "Використано password_hash", has: "password_hash(", hint: "Хеш створюють готовою функцією, а не md5 чи власним алгоритмом." },
      { on: "source", name: "Використано password_verify", has: "password_verify(", hint: "Хеші не порівнюють через ==, для цього є окрема функція." },
    ],
  },
  {
    ...base, id: "php-psr-pipeline", lesson: "php/98", xp: 40,
    title: "Незмінний запит і middleware",
    context: "Ідея PSR-7 і PSR-15 у мініатюрі: запит незмінний, метод with повертає копію, а middleware отримує наступний обробник і може не викликати його взагалі.",
    brief: [
      "Допишіть <code>Req::withAttribute()</code>: вона повертає <b>копію</b> запиту (через <code>clone</code>) з доданим атрибутом, а оригінал лишається без змін.",
      "Допишіть <code>Guard::process()</code>: якщо шлях починається з <code>/admin</code>, поверніть <code>new Res(403, 'Заборонено')</code> і <b>не викликайте</b> наступний обробник; інакше додайте атрибут <code>user</code> зі значенням <code>Оля</code> і передайте запит далі. Програма друкує п'ять рядків: <code>оригінал: …</code>, <code>копія: …</code> і три відповіді у вигляді <code>статус тіло</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

interface Handler { public function handle(Req $r): Res; }
interface Middleware { public function process(Req $r, Handler $next): Res; }

final class Req
{
    private array $attributes = [];

    public function __construct(public readonly string $path) {}

    public function withAttribute(string $name, string $value): static
    {
        // TODO: поверніть НОВИЙ запит (clone) з додатковим атрибутом, оригінал не чіпайте
        return $this;
    }

    public function getAttribute(string $name): ?string
    {
        return $this->attributes[$name] ?? null;
    }
}

final class Res
{
    public function __construct(public readonly int $status, public readonly string $body) {}
}

final class App implements Handler
{
    public function handle(Req $r): Res
    {
        return new Res(200, 'Привіт, ' . ($r->getAttribute('user') ?? 'гість'));
    }
}

final class Guard implements Middleware
{
    public function process(Req $r, Handler $next): Res
    {
        // TODO: для шляху, що починається з /admin, поверніть Res(403, 'Заборонено') і не викликайте $next;
        // в інших випадках додайте атрибут user = Оля і передайте запит далі
        return $next->handle($r);
    }
}

$req = new Req('/');
$copy = $req->withAttribute('user', 'Оля');
echo 'оригінал: ' . ($req->getAttribute('user') ?? 'немає') . "\n";
echo 'копія: ' . ($copy->getAttribute('user') ?? 'немає') . "\n";

$app = new App();
$guard = new Guard();
foreach ([$app->handle($req), $guard->process($req, $app), $guard->process(new Req('/admin'), $app)] as $res) {
    echo $res->status . ' ' . $res->body . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "оригінал: немає\nкопія: Оля\n200 Привіт, гість\n200 Привіт, Оля\n403 Заборонено", hint: "Оригінал без атрибута, копія з ним; далі три відповіді: напряму, через Guard і через Guard для /admin." },
      { on: "stdout", name: "Оригінал запиту не змінюється", has: "оригінал: немає", hint: "withAttribute має змінювати копію, а не $this." },
      { on: "stdout", name: "Guard ставить користувача", has: "200 Привіт, Оля", hint: "Передайте далі запит, повернений withAttribute, а не початковий." },
      { on: "stdout", name: "Guard зупиняє /admin", has: "403 Заборонено", hint: "Для шляху /admin повертайте відповідь одразу, без виклику $next." },
      { on: "source", name: "Використано clone", has: "clone", hint: "Копію незмінного об'єкта створюють через clone." },
    ],
  },
  {
    ...base, id: "php-etag-cache", lesson: "php/99", xp: 40,
    title: "ETag і відповідь 304",
    context: "Умовний запит економить трафік: клієнт приносить ярлик попередньої версії, а сервер, якщо вміст не змінився, відповідає статусом 304 без тіла.",
    brief: [
      "Допишіть <code>etag(string $body)</code>: ярлик це <code>md5</code> тіла, взятий у подвійні лапки.",
      "Допишіть <code>respond(array $request, string $body)</code>: якщо <code>$request['if-none-match']</code> <b>строго</b> дорівнює ярликові тіла, поверніть <code>['status' =&gt; 304, 'body' =&gt; '']</code>, інакше <code>['status' =&gt; 200, 'body' =&gt; $body]</code>. Програма друкує чотири рядки: <code>200 Список нотаток</code>, довжину ярлика, а потім відповіді на запити з ярликом.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function etag(string $body): string
{
    // TODO: поверніть md5-хеш тіла в подвійних лапках
    return '';
}

/** @return array{status: int, body: string} */
function respond(array $request, string $body): array
{
    // TODO: якщо if-none-match збігається з ярликом, поверніть статус 304 і порожнє тіло; інакше 200 і тіло
    return ['status' => 200, 'body' => $body];
}

$first = respond([], 'Список нотаток');
echo $first['status'] . ' ' . $first['body'] . "\n";

$tag = etag('Список нотаток');
echo 'Довжина ярлика: ' . strlen($tag) . "\n";

$second = respond(['if-none-match' => $tag], 'Список нотаток');
echo $second['status'] . ' [' . $second['body'] . "]\n";

$third = respond(['if-none-match' => $tag], 'Список змінено');
echo $third['status'] . ' ' . $third['body'] . "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "200 Список нотаток\nДовжина ярлика: 34\n304 []\n200 Список змінено", hint: "Ярлик це 32 символи md5 і дві лапки; збіг дає 304 з порожнім тілом." },
      { on: "stdout", name: "Ярлик має довжину 34", has: "Довжина ярлика: 34", hint: "md5 дає 32 символи, а до них додаються лапки з обох боків." },
      { on: "stdout", name: "Збіг ярликів дає 304", has: "304 []", hint: "Якщо ярлик у запиті збігається, тіло має бути порожнім." },
      { on: "stdout", name: "Змінений вміст віддається повністю", has: "200 Список змінено", hint: "Для іншого тіла ярлик відрізняється, тож потрібна відповідь 200." },
      { on: "source", name: "Строге порівняння ярликів", matches: "===", hint: "Ярлики порівнюють як рядки, суворо." },
    ],
  },
  // @@END
];
