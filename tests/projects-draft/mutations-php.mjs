// «Поломки» еталонів PHP: після заміни мають стати FAIL саме перелічені вимоги. Кожна вимога покрита хоч однією поломкою.
export default {
  "php-cart": [
    { fails: ["R1"], replace: [["$cart[] = ['sku' => $sku, 'name' => $name, 'price' => $price, 'qty' => $qty];", "array_unshift($cart, ['sku' => $sku, 'name' => $name, 'price' => $price, 'qty' => $qty]);"]] },
    { fails: ["R2"], replace: [["$cart[$i]['qty'] += $qty;", "$cart[$i]['qty'] = $qty;"]] },
    { fails: ["R3"], replace: [["if ($qty < 1) {", "if ($qty < 0) {"]] },
    // без array_values ключі після видалення йдуть не підряд
    { fails: ["R4"], replace: [["array_values(array_filter($cart, fn($item) => $item['sku'] !== $sku))", "array_filter($cart, fn($item) => $item['sku'] !== $sku)"]] },
    { fails: ["R5"], replace: [["return round($sum, 2);", "return $sum;"]] },
    { fails: ["R6"], replace: [["round($total * 0.9, 2)", "round($total * 0.8, 2)"]] },
    { fails: ["R7"], replace: [["    usort($cart, fn($a, $b) => strcmp($a['name'], $b['name']));\n", ""]] },
    // при рівності суми порядок лишається вхідним, а не алфавітним
    { fails: ["R8"], replace: [["return $d !== 0 ? $d : strcmp($a['name'], $b['name']);", "return $d;"]] },
    { fails: ["R8"], replace: [["$b['price'] * $b['qty'] <=> $a['price'] * $a['qty']", "$a['price'] * $a['qty'] <=> $b['price'] * $b['qty']"]] },
  ],
  "php-form-validator": [
    { fails: ["R1"], replace: [["strip_tags($s)", "$s"]] },
    { fails: ["R2"], replace: [["(int)$age > 120", "(int)$age >= 120"]] },
    { fails: ["R3"], replace: [['$errors[\'age\'] = "Вкажіть вік";', '$errors[\'age\'] = "Вкажіть вік!";']] },
    // strlen рахує байти: 30 літер кирилиці — це 60 байтів
    { fails: ["R4"], replace: [["mb_strlen($name) < 2 || mb_strlen($name) > 30", "mb_strlen($name) < 2 || strlen($name) > 30"]] },
    { fails: ["R5"], replace: [["!filter_var($email, FILTER_VALIDATE_EMAIL)", "strpos($email, '@') === false"]] },
    { fails: ["R6"], replace: [["mb_strlen($password) < 8", "mb_strlen($password) < 6"]] },
    { fails: ["R7"], replace: [["(string)($post['password2'] ?? '') !== $password", "strtolower((string)($post['password2'] ?? '')) !== strtolower($password)"]] },
    { fails: ["R8"], replace: [["!ctype_digit($age) || (int)$age < 14", "(int)$age < 14"]] },
    { fails: ["R9"], replace: [["['on', '1'], true)", "['on', '1', 'yes'], true)"]] },
    { fails: ["R10"], replace: [["htmlspecialchars($m, ENT_QUOTES, 'UTF-8')", "htmlspecialchars($m, ENT_NOQUOTES, 'UTF-8')"]] },
  ],
  "php-hotel": [
    { fails: ["R1"], replace: [["public readonly int $number,", "public int $number,"]] },
    { fails: ["R2"], replace: [["if ($number <= 0) {", "if ($number < 0) {"]] },
    { fails: ["R3"], replace: [["if (isset($this->rooms[$room->number])) {", "if (false) {"]] },
    { fails: ["R4"], replace: [["(int)$a->diff($b)->days]", "(int)$a->diff($b)->days + 1]"]] },
    // PHP «перекочує» 30 лютого на березень, якщо не звіряти дату після розбору
    { fails: ["R5"], replace: [["if ($d === false || $d->format('Y-m-d') !== $s) {", "if ($d === false) {"]] },
    // нестроге порівняння забороняє виїзд і заїзд в один день
    { fails: ["R6"], replace: [["$from < $b['to'] && $to > $b['from']", "$from <= $b['to'] && $to >= $b['from']"]] },
    { fails: ["R7"], replace: [["        sort($free);\n", ""]] },
    { fails: ["R7"], replace: [["if ($type !== null && $room->type !== $type) {", "if (false) {"]] },
    { fails: ["R8"], replace: [["'nights' => $b['nights'], 'cost' => $b['cost']];", "'nights' => $b['nights'] + 1, 'cost' => $b['cost']];"]] },
    { fails: ["R9"], replace: [["$sum += $b['cost'];", "$sum += $b['cost'] * 2;"]] },
  ],
};
