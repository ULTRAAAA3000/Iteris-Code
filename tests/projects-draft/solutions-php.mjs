// Еталонні розв'язки чернеток проєктів PHP: повний код користувача (без harness).
const raw = String.raw;

export default {
  "php-cart": raw`<?php
function addToCart(array $cart, string $sku, string $name, float $price, int $qty = 1): array
{
    if ($qty < 1) {
        throw new InvalidArgumentException("кількість має бути не менше 1");
    }
    if ($price < 0) {
        throw new InvalidArgumentException("ціна не може бути від'ємною");
    }
    foreach ($cart as $i => $item) {
        if ($item['sku'] === $sku) {
            $cart[$i]['qty'] += $qty;
            return $cart;
        }
    }
    $cart[] = ['sku' => $sku, 'name' => $name, 'price' => $price, 'qty' => $qty];
    return $cart;
}

function removeFromCart(array $cart, string $sku): array
{
    return array_values(array_filter($cart, fn($item) => $item['sku'] !== $sku));
}

function cartTotal(array $cart): float
{
    $sum = 0.0;
    foreach ($cart as $item) {
        $sum += $item['price'] * $item['qty'];
    }
    return round($sum, 2);
}

function applyPromo(float $total, string $code): float
{
    switch (strtoupper(trim($code))) {
        case 'SALE10':
            return round($total * 0.9, 2);
        case 'SAVE50':
            return max(0.0, round($total - 50, 2));
        default:
            throw new InvalidArgumentException("невідомий промокод: " . $code);
    }
}

function cartSummary(array $cart): string
{
    if (!$cart) {
        return "Кошик порожній";
    }
    usort($cart, fn($a, $b) => strcmp($a['name'], $b['name']));
    $lines = [];
    foreach ($cart as $item) {
        $lines[] = $item['name'] . " × " . $item['qty'] . " = " . number_format($item['price'] * $item['qty'], 2, '.', '');
    }
    $lines[] = "Разом: " . number_format(cartTotal($cart), 2, '.', '');
    return implode("\n", $lines);
}

function topItems(array $cart, int $n): array
{
    usort($cart, function ($a, $b) {
        $d = $b['price'] * $b['qty'] <=> $a['price'] * $a['qty'];
        return $d !== 0 ? $d : strcmp($a['name'], $b['name']);
    });
    return array_slice(array_column($cart, 'name'), 0, max(0, $n));
}
`,

  "php-form-validator": raw`<?php
function cleanText(string $s): string
{
    return trim(preg_replace('/\s+/u', ' ', strip_tags($s)));
}

function validateRegistration(array $post): array
{
    $errors = [];

    $name = cleanText((string)($post['name'] ?? ''));
    if ($name === '') {
        $errors['name'] = "Вкажіть ім'я";
    } elseif (mb_strlen($name) < 2 || mb_strlen($name) > 30) {
        $errors['name'] = "Ім'я: від 2 до 30 символів";
    }

    $email = trim((string)($post['email'] ?? ''));
    if ($email === '') {
        $errors['email'] = "Вкажіть email";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "Некоректний email";
    }

    $password = (string)($post['password'] ?? '');
    if ($password === '') {
        $errors['password'] = "Вкажіть пароль";
    } elseif (mb_strlen($password) < 8) {
        $errors['password'] = "Пароль: щонайменше 8 символів";
    } elseif (!preg_match('/\p{L}/u', $password) || !preg_match('/\d/', $password)) {
        $errors['password'] = "Пароль має містити літеру й цифру";
    }

    if ((string)($post['password2'] ?? '') !== $password) {
        $errors['password2'] = "Паролі не збігаються";
    }

    $age = trim((string)($post['age'] ?? ''));
    if ($age === '') {
        $errors['age'] = "Вкажіть вік";
    } elseif (!ctype_digit($age) || (int)$age < 14 || (int)$age > 120) {
        $errors['age'] = "Вік: ціле число від 14 до 120";
    }

    if (!in_array($post['agree'] ?? '', ['on', '1'], true)) {
        $errors['agree'] = "Потрібна згода з правилами";
    }

    return $errors;
}

function errorsToHtml(array $errors): string
{
    if (!$errors) {
        return "";
    }
    $items = array_map(fn($m) => "<li>" . htmlspecialchars($m, ENT_QUOTES, 'UTF-8') . "</li>", array_values($errors));
    return '<ul class="errors">' . implode("", $items) . "</ul>";
}
`,

  "php-hotel": raw`<?php
class BookingException extends Exception
{
}

class Room
{
    public function __construct(public readonly int $number, public readonly string $type, private float $pricePerNight)
    {
        if ($number <= 0) {
            throw new InvalidArgumentException("номер має бути додатним");
        }
        if (!in_array($type, ['standard', 'suite'], true)) {
            throw new InvalidArgumentException("невідомий тип: " . $type);
        }
        if ($pricePerNight <= 0) {
            throw new InvalidArgumentException("ціна має бути додатною");
        }
    }

    public function pricePerNight(): float
    {
        return $this->pricePerNight;
    }

    public function costFor(int $nights): float
    {
        return round($this->pricePerNight * $nights, 2);
    }
}

class Hotel
{
    /** @var array<int, Room> */
    private array $rooms = [];
    private array $bookings = [];

    public function addRoom(Room $room): void
    {
        if (isset($this->rooms[$room->number])) {
            throw new BookingException("номер " . $room->number . " уже існує");
        }
        $this->rooms[$room->number] = $room;
    }

    private function parseDate(string $s): DateTimeImmutable
    {
        $d = DateTimeImmutable::createFromFormat('!Y-m-d', $s, new DateTimeZone('UTC'));
        if ($d === false || $d->format('Y-m-d') !== $s) {
            throw new BookingException("некоректна дата: " . $s);
        }
        return $d;
    }

    private function period(string $from, string $to): array
    {
        $a = $this->parseDate($from);
        $b = $this->parseDate($to);
        if ($b <= $a) {
            throw new BookingException("виїзд має бути пізніше за заїзд");
        }
        return [$a, $b, (int)$a->diff($b)->days];
    }

    public function isFree(int $number, string $from, string $to): bool
    {
        if (!isset($this->rooms[$number])) {
            return false;
        }
        $this->period($from, $to);
        foreach ($this->bookings as $b) {
            if ($b['room'] === $number && $from < $b['to'] && $to > $b['from']) {
                return false;
            }
        }
        return true;
    }

    public function book(int $number, string $guest, string $from, string $to): float
    {
        if (!isset($this->rooms[$number])) {
            throw new BookingException("номер " . $number . " не існує");
        }
        [, , $nights] = $this->period($from, $to);
        if (!$this->isFree($number, $from, $to)) {
            throw new BookingException("номер " . $number . " зайнятий");
        }
        $cost = $this->rooms[$number]->costFor($nights);
        $this->bookings[] = ['guest' => $guest, 'room' => $number, 'from' => $from, 'to' => $to, 'nights' => $nights, 'cost' => $cost];
        return $cost;
    }

    public function freeRooms(string $from, string $to, ?string $type = null): array
    {
        $this->period($from, $to);
        $free = [];
        foreach ($this->rooms as $number => $room) {
            if ($type !== null && $room->type !== $type) {
                continue;
            }
            if ($this->isFree($number, $from, $to)) {
                $free[] = $number;
            }
        }
        sort($free);
        return $free;
    }

    public function bookingsOf(string $guest): array
    {
        $out = [];
        foreach ($this->bookings as $b) {
            if ($b['guest'] === $guest) {
                $out[] = ['room' => $b['room'], 'from' => $b['from'], 'to' => $b['to'], 'nights' => $b['nights'], 'cost' => $b['cost']];
            }
        }
        return $out;
    }

    public function revenue(): float
    {
        $sum = 0.0;
        foreach ($this->bookings as $b) {
            $sum += $b['cost'];
        }
        return round($sum, 2);
    }
}
`,
};
