import type { RefSection } from "./types.ts";

const raw = String.raw;

export const php: RefSection[] = [
  { t: "Основи", items: [
    { t: "Перший скрипт", code: raw`<?php
echo "Привіт, світе!";
echo 2 + 3;
// коментар
# теж коментар
/* багаторядковий */`, note: "PHP-код лежить між `<?php` та `?>`. Кожна інструкція закінчується крапкою з комою." },
    { t: "Запуск", code: raw`php index.php            # у терміналі
php -S localhost:8000    # вбудований сервер`, note: "PHP виконується на сервері, браузер отримує вже готовий HTML." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Змінні", code: raw`$name = "Олена";
$age = 16;
$price = 24.5;
$ok = true;
$nothing = null;
echo "Привіт, $name! Вам {$age} років.";
var_dump($age);`, note: "Назви змінних починаються зі знака `$`. Подвійні лапки підставляють значення змінних, одинарні ні." },
    { t: "Константи й операції", code: raw`const SITE = "Iteris";
define("VERSION", "1.0");
echo 7 % 2, 2 ** 10, intdiv(7, 2);
echo "Сума: " . (2 + 3);`, note: "Рядки склеюють крапкою `.`, а не плюсом." },
  ] },
  { t: "Умови й цикли", items: [
    { t: "if і match", code: raw`if ($age < 12) {
    echo "дитина";
} elseif ($age < 18) {
    echo "підліток";
} else {
    echo "дорослий";
}
$kind = match (true) {
    $age < 18 => "неповнолітній",
    default => "дорослий",
};`, note: "Порівнюйте через `===`: він перевіряє ще й тип." },
    { t: "Цикли", code: raw`for ($i = 0; $i < 3; $i++) {
    echo $i;
}
while ($n < 3) { $n++; }
foreach ([10, 20, 30] as $x) {
    echo $x;
}`, note: "Для масивів зазвичай використовують `foreach`." },
  ] },
  { t: "Масиви", items: [
    { t: "Індексований масив", code: raw`$nums = [3, 1, 2];
$nums[] = 5;
sort($nums);
echo count($nums), $nums[0];
echo implode(", ", $nums);`, note: "`$a[] = x` додає елемент у кінець." },
    { t: "Асоціативний масив", code: raw`$user = ["name" => "Олена", "age" => 16];
$user["city"] = "Дніпро";
echo $user["name"] ?? "немає";
foreach ($user as $key => $value) {
    echo "$key: $value\n";
}`, note: "Оператор `??` повертає запасне значення, якщо ключа немає." },
  ] },
  { t: "Рядки", items: [
    { t: "Функції рядків", code: raw`$s = "PHP мова";
echo strlen($s), strtoupper($s), str_replace("мова", "рулить", $s);
echo mb_strlen($s), mb_substr($s, 0, 3);
echo trim("  привіт  "), str_contains($s, "PHP");`, note: "Для українського тексту використовуйте функції з префіксом `mb_`." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення", code: raw`function add(int $a, int $b = 0): int {
    return $a + $b;
}
echo add(2, 3);
$sq = fn($x) => $x * $x;
echo $sq(4);`, note: "Типи параметрів і результату необов'язкові, але роблять код надійнішим." },
  ] },
  { t: "Форми та запити", items: [
    { t: "Обробка POST безпечно", code: raw`if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    if ($name === "") {
        echo "Введіть ім'я";
    } else {
        echo "Привіт, " . htmlspecialchars($name);
    }
}`, note: "Дані з форм завжди екрануйте через `htmlspecialchars` перед виводом у HTML: це захист від XSS." },
    { t: "GET і сесії", code: raw`$page = (int)($_GET["page"] ?? 1);
session_start();
$_SESSION["user"] = "Олена";`, note: "`$_GET` містить параметри адреси, `$_SESSION` дані користувача між запитами." },
  ] },
  { t: "Класи", items: [
    { t: "Клас і метод", code: raw`class Dog {
    public function __construct(private string $name) {}

    public function speak(): string {
        return "{$this->name}: гав!";
    }
}
$rex = new Dog("Рекс");
echo $rex->speak();`, note: "Через `->` звертаються до полів і методів об'єкта." },
  ] },
  { t: "База даних (PDO)", items: [
    { t: "Підготовлені запити", code: raw`$pdo = new PDO("sqlite:app.db");
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);`, note: "Ніколи не підставляйте дані користувача прямо в SQL: використовуйте `prepare` та `execute`." },
  ] },
  { t: "Помилки", items: [
    { t: "try / catch", code: raw`try {
    if ($b === 0) throw new InvalidArgumentException("Ділення на нуль");
    echo $a / $b;
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
}`, note: "Виняток кидають через `throw` та ловлять у `catch`." },
  ] },
];
