// Практичні завдання глави «Початок» (уроки 1–4). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
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
      { on: "stdout", name: "Виводить «Привіт, PHP!»", has: "Привіт, PHP!", hint: "Текст у лапках передайте в echo, а наприкінці додайте PHP_EOL." },
      { on: "stdout", name: "Виводить «2 + 3 = 5»", has: "2 + 3 = 5", hint: "Склейте текст «2 + 3 = » і вираз у дужках через крапку." },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, PHP!\n2 + 3 = 5", hint: "Рівно два рядки: порожній echo із заготовки треба замінити своїми виводами." },
      { on: "source", name: "Використано echo", has: "echo", hint: "Вивід у PHP робить команда echo." },
    ],
  },
  {
    ...base, id: "php-tags-template", lesson: "php/2", xp: 15,
    title: "Теги: шаблон із вставкою",
    context: "Поза тегами PHP текст виводиться як є, а тег виводу вставляє значення змінної. Так влаштовані шаблони сторінок.",
    brief: [
      "У заготовці є змінна <code>$price</code> і рядок тексту. Виведіть <code>Ціна: 120 грн</code>, вставивши значення змінної тегом <code>&lt;?= $price ?&gt;</code>, а наступним рядком через <code>echo</code> виведіть <code>Магазин відкрито</code>.",
      "Кінцевий перенос не важливий.",
    ],
    starter: raw`<?php
$price = 120;
?>
Ціна: TODO грн
<?php
// TODO: виведіть рядок «Магазин відкрито» через echo
`,
    checks: [
      { on: "stdout", name: "Рядок із ціною", has: "Ціна: 120 грн", hint: "Замість TODO вставте значення змінної тегом виводу." },
      { on: "stdout", name: "Рядок «Магазин відкрито»", has: "Магазин відкрито", hint: "Другий рядок виводить звичайна команда echo в блоці PHP." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Ціна: 120 грн\nМагазин відкрито", hint: "Після echo додайте \\n, щоб не було зайвого переносу посередині." },
      { on: "source", name: "Використано тег виводу", has: "<?=", hint: "Скорочений тег виводу пишеться як знак менше, питання й дорівнює." },
    ],
  },
  {
    ...base, id: "php-env-check", lesson: "php/3", xp: 15,
    title: "Режим запуску й версія",
    context: "Скрипт часто має знати, де його запустили: у терміналі чи у вебі, і чи достатньо нова версія PHP. Для цього є константи PHP_SAPI і PHP_VERSION_ID.",
    brief: [
      "Увімкніть показ усіх помилок: <code>error_reporting(E_ALL)</code>. Потім виведіть два рядки: <code>Режим: cli</code> (значення візьміть із <code>PHP_SAPI</code>) і <code>PHP 8.1+: так</code> або <code>PHP 8.1+: ні</code> за константою <code>PHP_VERSION_ID</code> (порівняйте з <code>80100</code>).",
    ],
    starter: raw`<?php
// TODO: error_reporting(E_ALL);
// TODO: виведіть «Режим: » і PHP_SAPI
// TODO: виведіть «PHP 8.1+: так» або «ні» за PHP_VERSION_ID
echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Режим запуску", has: "Режим: cli", hint: "Константа PHP_SAPI містить назву режиму, склейте її з текстом." },
      { on: "stdout", name: "Перевірка версії", has: "PHP 8.1+: так", hint: "Порівняйте PHP_VERSION_ID з числом 80100 за допомогою тернарного оператора." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Режим: cli\nPHP 8.1+: так", hint: "Рівно два рядки, без службового TODO." },
      { on: "source", name: "Увімкнено E_ALL", has: "E_ALL", hint: "Рівень помилок передається у error_reporting." },
    ],
  },
  {
    ...base, id: "php-version-gate", lesson: "php/4", xp: 20,
    title: "Сумісність версій через version_compare",
    context: "Перед запуском проєкту перевіряють, чи підходить версія PHP. Рядки версій не можна порівнювати як звичайний текст: для цього є функція version_compare.",
    brief: [
      "Допишіть функцію <code>compatible(string $version, string $required): bool</code> через <code>version_compare</code> (умова «не менша»). Для версій <code>7.4.33</code>, <code>8.1.0</code>, <code>8.10.2</code> із вимогою <code>8.1.0</code> виведіть рядки формату <code>7.4.33 ні</code>, <code>8.1.0 так</code>, <code>8.10.2 так</code>.",
    ],
    starter: raw`<?php
function compatible(string $version, string $required): bool
{
    // TODO: використайте version_compare
    return false;
}

foreach (['7.4.33', '8.1.0', '8.10.2'] as $v) {
    echo $v . ' ' . (compatible($v, '8.1.0') ? 'так' : 'ні') . "\n";
}
`,
    checks: [
      { on: "stdout", name: "7.4.33 не підходить", has: "7.4.33 ні", hint: "Стара версія менша за вимогу, умова має дати false." },
      { on: "stdout", name: "8.1.0 підходить", has: "8.1.0 так", hint: "Рівна версія теж підходить: оператор має бути «не менше»." },
      { on: "stdout", name: "8.10.2 підходить", has: "8.10.2 так", hint: "Десята мінорна версія новіша за першу; звичайне порівняння рядків тут помилиться." },
      { on: "source", name: "Використано version_compare", has: "version_compare(", hint: "Третім аргументом передайте оператор порівняння у лапках." },
    ],
  },
];
