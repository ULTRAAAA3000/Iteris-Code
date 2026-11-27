const raw = String.raw;

export const SOLUTIONS_10 = {
  "php-request-response": raw`<?php
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
        return new self($this->status, $this->body, [...$this->headers, strtolower($name) => $value]);
    }
}

function handle(Request $r): Response
{
    if ($r->path !== '/hello') {
        return new Response(404, 'Not Found');
    }
    $name = $r->query['name'] ?? 'світе';
    return new Response(200, "Привіт, $name!");
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
  "php-form-validate": raw`<?php
function validate(array $post): array
{
    $errors = [];
    if (trim($post['name'] ?? '') === '') {
        $errors[] = "Ім'я обов'язкове";
    }
    if (!filter_var($post['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Невірний email";
    }
    if ((int)($post['age'] ?? 0) < 18) {
        $errors[] = "Вік має бути 18+";
    }
    return $errors;
}

function safe(string $s): string
{
    return htmlspecialchars($s);
}

$bad = ['name' => '', 'email' => 'not-an-email', 'age' => '16'];
$good = ['name' => 'Оля', 'email' => 'olya@example.com', 'age' => '25'];

echo implode('; ', validate($bad)) . PHP_EOL;
echo (validate($good) === [] ? 'OK' : 'є помилки') . PHP_EOL;
echo safe('<b>Оля</b>') . PHP_EOL;
`,
  "php-router": raw`<?php
declare(strict_types=1);

final class Router
{
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

$requests = [['GET', '/notes'], ['GET', '/notes/7'], ['POST', '/notes/7'], ['DELETE', '/notes/7'], ['GET', '/nope']];
foreach ($requests as [$method, $path]) {
    [$status, $body] = $router->dispatch($method, $path);
    echo "$method $path -> $status $body\n";
}
`,
  "php-json-notes": raw`<?php
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
        if ($method === 'GET' && preg_match('#^/notes/(\d+)$#', $path, $m) === 1) {
            $id = (int) $m[1];
            return isset($this->notes[$id]) ? $this->json(200, $this->notes[$id]) : $this->json(404, ['error' => 'not found']);
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
  "php-middleware": raw`<?php
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
        if (($req['token'] ?? '') !== 'secret') {
            return ['status' => 401, 'body' => 'Потрібен вхід'];
        }
        return $next($req + ['user' => 'Оля']);
    }
}

function pipeline(array $middlewares, callable $core): callable
{
    return array_reduce(
        array_reverse($middlewares),
        fn(callable $next, callable $mw): callable => fn(array $req): array => $mw($req, $next),
        $core,
    );
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
  "php-password-auth": raw`<?php
function register(string $password): string
{
    return password_hash($password, PASSWORD_DEFAULT);
}

function login(string $password, string $hash): bool
{
    return password_verify($password, $hash);
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
  "php-psr-pipeline": raw`<?php
declare(strict_types=1);

interface Handler { public function handle(Req $r): Res; }
interface Middleware { public function process(Req $r, Handler $next): Res; }

final class Req
{
    private array $attributes = [];

    public function __construct(public readonly string $path) {}

    public function withAttribute(string $name, string $value): static
    {
        $copy = clone $this;
        $copy->attributes[$name] = $value;
        return $copy;
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
        if (str_starts_with($r->path, '/admin')) {
            return new Res(403, 'Заборонено');
        }
        return $next->handle($r->withAttribute('user', 'Оля'));
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
  "php-etag-cache": raw`<?php
declare(strict_types=1);

function etag(string $body): string
{
    return '"' . md5($body) . '"';
}

/** @return array{status: int, body: string} */
function respond(array $request, string $body): array
{
    if (($request['if-none-match'] ?? null) === etag($body)) {
        return ['status' => 304, 'body' => ''];
    }
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
  // @@END
};
