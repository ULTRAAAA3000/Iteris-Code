// Частина 08b курсу PHP (уроки 80–85)
export const LESSONS_08b = [
  {
    t: "Числа й випадковість: round, intdiv, mt_srand і random_int",
    ch: "Стандартна бібліотека",
    easy: "Дробові числа в комп'ютері схожі на лінійку з поділками: частину значень на ній не виміряти точно, лише підібратися близько. А генератор випадкових чисел це колода карт, яку можна перетасувати так само щоразу, якщо знати початкове розташування.",
    p: [
      "Майже кожна програма рахує: ціни, знижки, сторінки, відсотки. У PHP для цього є два типи, <code>int</code> і <code>float</code>, і купа функцій навколо них. Корисно знати, де ці функції надійні, а де дають сюрпризи, і коли потрібна справжня випадковість, а коли відтворювана.",
      "Модель у голові: цілі числа точні, а <code>float</code> це двійкове наближення. Для цілих є <code>intdiv($a, $b)</code> (ділення націло) і оператор <code>%</code> (остача, знак збігається зі знаком діленого, тож <code>-17 % 5</code> дає <code>-2</code>). Оператор <code>/</code> повертає <code>int</code>, лише якщо ділиться націло, інакше <code>float</code>. Для округлення є <code>round()</code> (до найближчого, половина від нуля: <code>round(2.5)</code> це <code>3</code>, <code>round(-2.5)</code> це <code>-3</code>), <code>floor()</code> і <code>ceil()</code>. Усі три повертають <code>float</code>, навіть коли число ціле.",
      "Пастка номер один: порівняння дробових чисел. Вираз <code>0.1 + 0.2 == 0.3</code> дає <code>false</code>, бо ні 0.1, ні 0.2 не представляються точно. Порівнюйте з допуском (<code>abs($a - $b) &lt; 1e-9</code>) або округляйте до потрібної кількості знаків. Гроші найкраще зберігати цілими, в копійках: тоді додавання й ділення точні, а до гривень переходять лише під час виведення через <code>number_format()</code>.",
      "Пастка номер два: переповнення. Коли результат виходить за <code>PHP_INT_MAX</code>, PHP мовчки переходить на <code>float</code> і втрачає точність, а не кидає помилку. Пастка номер три: ділення на нуль. <code>intdiv(1, 0)</code> і <code>1 % 0</code> кидають <code>DivisionByZeroError</code>, оператор <code>/</code> теж, а от <code>fdiv(1, 0)</code> чесно повертає <code>INF</code>. Тому дільник, що приходить ззовні, спершу перевіряють.",
      "Тепер випадковість. <code>random_int($min, $max)</code> бере байти з криптографічного джерела ОС: її не можна відтворити, зате вона підходить для токенів і кодів підтвердження. Якщо ж треба повторюваність (тест, демонстрація, генерація однакового поля гри), викликають <code>mt_srand($seed)</code>, і наступні <code>mt_rand()</code> дадуть ту саму послідовність за того самого зерна. Не використовуйте <code>mt_rand</code> для паролів чи токенів: за кількома значеннями її стан відновлюється.",
      "Ідіоми. Для діапазону пишіть <code>random_int(1, 6)</code>, а не <code>rand() % 6 + 1</code>: у другому випадку межі легко переплутати. Некоректний діапазон (<code>random_int(6, 1)</code>) кидає <code>ValueError</code>. Округлення на виході робіть один раз, наприкінці, а не після кожного кроку обчислення. У тестах не друкуйте самі випадкові числа, а перевіряйте властивості: потрапило в діапазон, однакове зерно дає однаковий результат.",
      "Ці функції ви використовуватимете разом із рядками й датами з попередніх уроків, коли формуєте звіти. Далі подивимось на готові структури даних із бібліотеки SPL, що розв'язують типові задачі без ручного керування масивами.",
    ],
    code: [
      String.raw`<?php
echo intdiv(17, 5), " ", 17 % 5, " ", -17 % 5, "\n";
echo round(2.5), " ", round(-2.5), " ", round(3.14159, 2), "\n";
echo floor(-1.5), " ", ceil(-1.5), "\n";
echo number_format(1234567.891, 2, ',', ' '), "\n";`,
      String.raw`<?php
// Поведінка, що дивує: дробові числа порівнюють нестрого
$sum = 0.1 + 0.2;
var_dump($sum == 0.3);
var_dump(abs($sum - 0.3) < 1e-9);
var_dump(round($sum, 2) == 0.3);
// Вихід за межі int дає float, а не помилку
var_dump(is_float(PHP_INT_MAX + 1));
// Гроші: цілі копійки, до гривень лише на виводі
$cents = 1999 * 3;
echo intdiv($cents, 100), ".", str_pad((string) ($cents % 100), 2, "0", STR_PAD_LEFT), "\n";`,
      String.raw`<?php
function rollDice(int $count, int $seed): array
{
    mt_srand($seed);
    $rolls = [];
    for ($i = 0; $i < $count; $i++) {
        $rolls[] = mt_rand(1, 6);
    }
    return $rolls;
}

$a = rollDice(5, 42);
$b = rollDice(5, 42);
var_dump($a === $b);
echo count($a), " кидків, усі від 1 до 6: ", min($a) >= 1 && max($a) <= 6 ? "так" : "ні", "\n";

$code = random_int(100000, 999999);
echo strlen((string) $code), " цифр у коді\n";`,
      String.raw`<?php
// аварія: ділення націло на нуль кидає DivisionByZeroError
$total = 10;
$people = 0;
echo "Починаємо\n";
echo intdiv($total, $people), "\n";`,
    ],
    note: "Дробові числа не порівнюють через <code>==</code>: округлюйте або порівнюйте з допуском, а гроші зберігайте цілими. <code>random_int</code> для секретів, <code>mt_srand</code> плюс <code>mt_rand</code> для відтворюваної випадковості. Дільник перевіряйте до <code>intdiv</code> і <code>%</code>.",
    work: "У магазинах ціни рахують у копійках, щоб не втрачати копійку при діленні, у звітах округлюють лише на виводі. Коди підтвердження й токени беруть із random_int, а в тестах фіксують зерно, щоб результат не мінявся від запуску до запуску.",
    tasks: [
      "Чому вираз 0.1 + 0.2 == 0.3 дає false і як порівняти ці числа правильно?",
      "Чим random_int відрізняється від mt_rand за зерном і в яких випадках кожна підходить?",
    ],
  },
  {
    t: "SPL: SplStack, SplQueue й SplObjectStorage",
    ch: "Стандартна бібліотека",
    easy: "Стопка тарілок і черга в касу це два способи впорядкувати елементи: з стопки беруть останню покладену, з черги перше за часом. SPL дає такі структури готовими, щоб не вигадувати їх на масивах.",
    p: [
      "Масив у PHP універсальний: він і список, і словник, і стек. Але коли в коді видно <code>array_shift</code> чи <code>array_pop</code>, читач мусить здогадатися, чи це черга, чи стопка. Бібліотека SPL (Standard PHP Library) вбудована в мову й дає структури з виразними назвами та методами, що прямо кажуть про намір.",
      "Модель у голові: <code>SplStack</code> працює за принципом LIFO (останнім прийшов, першим пішов). Ви кладете <code>push($x)</code>, дивитеся верхній елемент через <code>top()</code> і знімаєте його через <code>pop()</code>. <code>SplQueue</code> працює за FIFO: <code>enqueue($x)</code> додає в кінець, <code>dequeue()</code> бере з початку. Обидві успадковують <code>SplDoublyLinkedList</code>, тому мають <code>count()</code>, <code>isEmpty()</code> і вміють ітеруватися в <code>foreach</code>.",
      "Перша пастка: порядок обходу. <code>foreach</code> по <code>SplStack</code> іде від вершини до дна, тобто в зворотному порядку додавання, і це не збігається зі звичкою до масивів. Друга: <code>pop()</code>, <code>top()</code> і <code>dequeue()</code> на порожній структурі кидають <code>RuntimeException</code>, а не повертають <code>null</code>. Тому перед зняттям перевіряють <code>isEmpty()</code> або обробляють виняток.",
      "<code>SplObjectStorage</code> це множина об'єктів із можливістю прикріпити до кожного дані. Додають <code>attach($obj)</code> або <code>$storage[$obj] = $data</code>, перевіряють <code>contains($obj)</code>, видаляють <code>detach($obj)</code>. Один і той самий об'єкт у сховищі лежить лише раз, навіть якщо його додали двічі, а порівняння йде за ідентичністю, а не за вмістом: два однакових за полями об'єкти вважаються різними. Для масиву це було б неможливо, бо об'єкт не може бути ключем масиву.",
      "Типові застосування. Стек розв'язує задачі на вкладеність: балансування дужок, скасування дій (undo), обхід дерева вглиб. Черга годиться для обробки завдань по порядку й обходу вшир. <code>SplObjectStorage</code> тримає список підписників чи вже відвіданих вузлів без дублів. Усі три добре читаються: слово <code>enqueue</code> не потребує коментаря.",
      "Ідіоми. Не змішуйте методи: для стека користуйтеся лише <code>push</code>, <code>pop</code>, <code>top</code>, а <code>SplQueue</code> не мусить робити <code>pop</code>. Передавайте такі структури як залежності з опорою на їхні методи. Якщо потрібно лише раз пройтись і порядок неважливий, звичайного масиву достатньо, SPL варто брати тоді, коли потрібна саме семантика стека чи черги.",
      "У наступному уроці знайомимося з купами й чергою з пріоритетами: це черга, де порядок видачі визначає не час додавання, а важливість елемента.",
    ],
    code: [
      String.raw`<?php
$stack = new SplStack();
$stack->push('a');
$stack->push('b');
$stack->push('c');
echo $stack->top(), " ", count($stack), "\n";
echo $stack->pop(), $stack->pop(), "\n";

$queue = new SplQueue();
$queue->enqueue('перший');
$queue->enqueue('другий');
echo $queue->dequeue(), " ", $queue->count(), "\n";`,
      String.raw`<?php
// Поведінка, що дивує: foreach по стеку іде від вершини
$stack = new SplStack();
foreach ([1, 2, 3] as $n) {
    $stack->push($n);
}
foreach ($stack as $n) {
    echo $n, " ";
}
echo "\n";

$queue = new SplQueue();
foreach ([1, 2, 3] as $n) {
    $queue->enqueue($n);
}
foreach ($queue as $n) {
    echo $n, " ";
}
echo "\n";`,
      String.raw`<?php
function isBalanced(string $text): bool
{
    $pairs = [')' => '(', ']' => '[', '}' => '{'];
    $stack = new SplStack();
    foreach (str_split($text) as $ch) {
        if (in_array($ch, $pairs, true)) {
            $stack->push($ch);
        } elseif (isset($pairs[$ch])) {
            if ($stack->isEmpty() || $stack->pop() !== $pairs[$ch]) {
                return false;
            }
        }
    }
    return $stack->isEmpty();
}

foreach (['(a[b]{c})', '(]', '(('] as $s) {
    echo $s, ": ", isBalanced($s) ? "так" : "ні", "\n";
}

$subs = new SplObjectStorage();
$one = new stdClass();
$subs->attach($one);
$subs->attach($one);
$subs[new stdClass()] = 'дані';
echo count($subs), " ", $subs->contains($one) ? "є" : "немає", "\n";`,
      String.raw`<?php
// аварія: pop з порожнього стека кидає RuntimeException
$stack = new SplStack();
$stack->push(1);
echo $stack->pop(), "\n";
echo $stack->pop(), "\n";`,
    ],
    note: "<code>SplStack</code> це LIFO, <code>SplQueue</code> це FIFO, а <code>foreach</code> по стеку йде від вершини. Зняття з порожньої структури кидає <code>RuntimeException</code>, тож перевіряйте <code>isEmpty()</code>. <code>SplObjectStorage</code> порівнює об'єкти за ідентичністю й не тримає дублів.",
    work: "Стек стоїть у парсерах виразів, перевірці дужок і історії скасування дій, черга у фонових обробниках завдань та обході графів. SplObjectStorage зручний для списку підписників подій, де один обробник не має спрацьовувати двічі.",
    tasks: [
      "У якому порядку foreach віддає елементи SplStack і чим це відрізняється від SplQueue?",
      "Що станеться, якщо викликати pop на порожньому SplStack і як цього уникнути?",
    ],
  },
  {
    t: "SplHeap, SplPriorityQueue і SplFixedArray",
    ch: "Стандартна бібліотека",
    easy: "Купа схожа на приймальню лікаря, де першим кличуть не того, хто прийшов раніше, а того, кому найтерміновіше. Фіксований масив це шафа з пронумерованими комірками, кількість яких визначена наперед.",
    p: [
      "Стек і черга віддають елементи за часом додавання. Але багато задач вимагають іншого: завжди брати найменший, найдорожчий чи найтерміновіший елемент. Сортувати весь масив після кожної вставки дорого, а відсортований порядок потрібен лише для верхнього елемента. Для цього створено структуру даних «купа».",
      "Модель у голові: купа підтримує впорядкованість так, що верхній елемент завжди під рукою, а решта лежить у напівупорядкованому вигляді. Вставка <code>insert($x)</code> і вилучення верхнього <code>extract()</code> працюють швидко (логарифмічний час), а <code>top()</code> лише дивиться на вершину. У SPL є готові <code>SplMinHeap</code> (на вершині найменше), <code>SplMaxHeap</code> (найбільше) і абстрактний <code>SplHeap</code>, де порядок задає ваш метод <code>compare()</code>. Метод мусить мати сигнатуру <code>protected function compare(mixed $a, mixed $b): int</code>, інакше PHP 8.1 видасть застереження про тип повернення.",
      "<code>SplPriorityQueue</code> це купа, де кожен елемент має пріоритет: <code>insert($value, $priority)</code>. Спершу вилучається елемент із найбільшим пріоритетом. Пастка: за однакових пріоритетів порядок видачі не гарантований, і це не FIFO. Щоб зробити його стабільним, додайте до пріоритету лічильник у вигляді масиву <code>[$priority, -$seq]</code>: масиви порівнюються поелементно, тож за рівних пріоритетів раніше додані виходять першими.",
      "За замовчуванням <code>extract()</code> повертає лише значення. Якщо потрібен і пріоритет, викличте <code>setExtractFlags(SplPriorityQueue::EXTR_BOTH)</code>, і вилучення поверне масив із ключами <code>data</code> і <code>priority</code>. Обидві структури руйнівні: ітерація по купі через <code>foreach</code> вилучає елементи, тож після обходу купа порожня. Витягти з порожньої купи теж не можна, це <code>RuntimeException</code>.",
      "<code>SplFixedArray</code> це масив фіксованої довжини з цілими індексами від нуля. Розмір задають у конструкторі, <code>new SplFixedArray(3)</code>, змінюють через <code>setSize()</code>. Він швидший і економніший за звичайний масив, коли довжина відома заздалегідь, але не підтримує рядкових ключів, а звернення за межі діапазону кидає <code>RuntimeException</code>. Для порожніх комірок значення <code>null</code>. До звичайного масиву повертає <code>toArray()</code>.",
      "Ідіоми. Дейкстра, планувальники завдань, «k найбільших елементів» і злиття відсортованих списків пишуться через купу. <code>SplFixedArray</code> беруть для великих числових сіток, де відомий розмір. Але не пишіть їх на всі випадки: звичайний масив із <code>sort</code> простіший, поки даних небагато. Структуру обирайте, коли її поведінка (мінімум зверху, фіксований розмір) очевидно потрібна.",
      "Далі повертаємося до дат і подивимось, як працювати з часовими поясами й діапазонами днів, не помиляючись із літнім часом.",
    ],
    code: [
      String.raw`<?php
$min = new SplMinHeap();
foreach ([5, 1, 8, 3] as $n) {
    $min->insert($n);
}
echo $min->top(), " ", count($min), "\n";
while (!$min->isEmpty()) {
    echo $min->extract(), " ";
}
echo "\n";

$max = new SplMaxHeap();
foreach ([5, 1, 8, 3] as $n) {
    $max->insert($n);
}
echo $max->extract(), "\n";`,
      String.raw`<?php
// Власний порядок: найближчий термін на вершині
final class DeadlineHeap extends SplHeap
{
    protected function compare(mixed $a, mixed $b): int
    {
        return $b['due'] <=> $a['due'];
    }
}

$h = new DeadlineHeap();
$h->insert(['name' => 'звіт', 'due' => 20]);
$h->insert(['name' => 'реліз', 'due' => 5]);
$h->insert(['name' => 'ревю', 'due' => 12]);
foreach ($h as $task) {
    echo $task['name'], ":", $task['due'], " ";
}
echo "\n";
echo count($h), " залишилось\n";`,
      String.raw`<?php
// Стабільна черга з пріоритетами: пара [пріоритет, -номер]
$q = new SplPriorityQueue();
$seq = 0;
foreach ([['a', 1], ['b', 3], ['c', 3], ['d', 1]] as [$name, $prio]) {
    $q->insert($name, [$prio, -$seq++]);
}
$q->setExtractFlags(SplPriorityQueue::EXTR_BOTH);
$first = $q->extract();
echo $first['data'], " ", $first['priority'][0], "\n";
$q->setExtractFlags(SplPriorityQueue::EXTR_DATA);
while (!$q->isEmpty()) {
    echo $q->extract(), " ";
}
echo "\n";

$grid = new SplFixedArray(3);
$grid[0] = 10;
$grid[2] = 30;
echo json_encode($grid->toArray()), " ", $grid->getSize(), "\n";`,
      String.raw`<?php
// аварія: індекс поза межами SplFixedArray кидає RuntimeException
$arr = new SplFixedArray(2);
$arr[0] = 'x';
$arr[1] = 'y';
echo $arr[1], "\n";
$arr[2] = 'z';`,
    ],
    note: "Купа віддає елементи за порядком важливості, а не за часом, і <code>foreach</code> по ній спустошує її. У <code>SplPriorityQueue</code> рівні пріоритети виходять у довільному порядку: додайте лічильник. <code>SplFixedArray</code> має лише цілі індекси й фіксований розмір.",
    work: "Купи стоять у планувальниках завдань, у пошуку найкоротшого шляху та в задачах «k найбільших». Черга з пріоритетами розбирає листи за терміновістю, а SplFixedArray економить пам'ять у великих числових таблицях відомого розміру.",
    tasks: [
      "Чому за однакових пріоритетів SplPriorityQueue не гарантує FIFO і як зробити порядок стабільним?",
      "Що відбувається з купою після foreach по ній?",
    ],
    adv: true,
  },
  {
    t: "Часові пояси: DateTimeZone і DatePeriod",
    ch: "Стандартна бібліотека",
    easy: "Часові пояси схожі на кімнати з різними годинниками: момент той самий, а стрілки показують різне. Діапазон дат це календар, де ви гортаєте день за днем від одного числа до іншого.",
    p: [
      "Користувачі живуть у різних поясах, а сервер зберігає один момент часу. Якщо змішати «місцевий час» із «моментом», з'являються помилки на межі літнього часу й зсуви на годину. Для цього в PHP є <code>DateTimeZone</code>, а для перебору днів чи тижнів <code>DatePeriod</code>.",
      "Модель у голові: момент часу один, а подання залежить від поясу. Об'єкт <code>DateTimeImmutable</code> тримає і момент, і пояс. Метод <code>setTimezone(new DateTimeZone('Europe/Kyiv'))</code> повертає новий об'єкт з тим самим моментом, але іншим показом годин. Імена поясів це ідентифікатори бази IANA (<code>Europe/Kyiv</code>, <code>America/New_York</code>, <code>UTC</code>), а не скорочення на кшталт <code>EST</code>, бо ті неоднозначні. Формат <code>P</code> друкує зсув (<code>+03:00</code>), <code>c</code> дає повний ISO-запис.",
      "Золоте правило: зберігайте й передавайте час у <code>UTC</code>, а в поясі користувача показуйте лише на виводі. Тоді різниця між двома моментами завжди точна. Пояс завжди вказуйте явно: <code>new DateTimeImmutable('2025-07-01 12:00:00', new DateTimeZone('UTC'))</code>, а не покладайтеся на налаштування сервера, яке в різних середовищах різне.",
      "Пастки літнього часу. Київ щороку переходить на літній час: у 03:00 останньої неділі березня стрілки стають на 04:00. Часу 03:30 того дня просто не існує, і <code>new DateTimeImmutable('2025-03-30 03:30:00', $kyiv)</code> мовчки дає 04:30. Восени, навпаки, одна година повторюється двічі. Тому добу не рахують як 86400 секунд: різниця між «північ до північі» в такий день становить 23 або 25 годин.",
      "<code>DatePeriod</code> перебирає дати з кроком: <code>new DatePeriod($start, new DateInterval('P1D'), $end)</code>. Крок задає <code>DateInterval</code> (<code>P1D</code> день, <code>P1W</code> тиждень, <code>PT1H</code> година). Найчастіша помилка: кінцева дата <b>не входить</b> у діапазон, тож для включення останнього дня додайте ще один крок. Замість кінця можна передати кількість повторень (початкова дата йде першою, і далі стільки повторів), а прапорець <code>DatePeriod::EXCLUDE_START_DATE</code> прибирає початкову дату. Якщо старт це <code>DateTimeImmutable</code>, то й елементи циклу будуть такими.",
      "Ідіоми. Вихідні дні знаходять формат <code>N</code> (1 для понеділка, 7 для неділі): <code>(int) $d-&gt;format('N') &gt;= 6</code>. Невідомий пояс кидає <code>Exception</code>, тож ім'я поясу з введення користувача перевіряйте або ловіть виняток. Для тестів завжди беріть фіксовану дату, а не <code>now</code>, інакше вивід щодня інший.",
      "Наступний урок переходить від дат до потоків: як читати й писати дані в пам'яті, наприклад CSV, коли файлів немає.",
    ],
    code: [
      String.raw`<?php
$utc = new DateTimeImmutable('2025-07-01 12:00:00', new DateTimeZone('UTC'));
$kyiv = $utc->setTimezone(new DateTimeZone('Europe/Kyiv'));
$ny = $utc->setTimezone(new DateTimeZone('America/New_York'));
echo $utc->format('H:i P'), "\n";
echo $kyiv->format('H:i P'), "\n";
echo $ny->format('H:i P'), "\n";
var_dump($utc->getTimestamp() === $kyiv->getTimestamp());`,
      String.raw`<?php
// Поведінка, що дивує: не існуючий час зсувається, а доба має 23 години
$kyiv = new DateTimeZone('Europe/Kyiv');
$gap = new DateTimeImmutable('2025-03-30 03:30:00', $kyiv);
echo $gap->format('Y-m-d H:i P'), "\n";

$a = new DateTimeImmutable('2025-03-30 00:00:00', $kyiv);
$b = new DateTimeImmutable('2025-03-31 00:00:00', $kyiv);
echo ($b->getTimestamp() - $a->getTimestamp()) / 3600, " год у добі\n";`,
      String.raw`<?php
$utc = new DateTimeZone('UTC');
$period = new DatePeriod(
    new DateTimeImmutable('2025-03-03', $utc),
    new DateInterval('P1D'),
    new DateTimeImmutable('2025-03-10', $utc)
);
$workdays = [];
foreach ($period as $day) {
    if ((int) $day->format('N') <= 5) {
        $workdays[] = $day->format('D d.m');
    }
}
echo implode(", ", $workdays), "\n";
echo count($workdays), " робочих днів\n";

$weeks = new DatePeriod(new DateTimeImmutable('2025-01-01', $utc), new DateInterval('P1W'), 2);
foreach ($weeks as $w) {
    echo $w->format('Y-m-d'), "\n";
}`,
      String.raw`<?php
// аварія: невідомий пояс кидає виняток
echo "Створюємо пояс\n";
$tz = new DateTimeZone('Mars/Base');
echo $tz->getName(), "\n";`,
    ],
    note: "Зберігайте час у UTC і перетворюйте в пояс користувача лише на виводі. Пояс завжди вказуйте явно, імена беріть із бази IANA. Кінець <code>DatePeriod</code> не входить у діапазон, а доба на межі літнього часу має 23 або 25 годин.",
    work: "У календарях, розкладах і звітах час зберігають у UTC, а користувачеві показують у його поясі. DatePeriod будує список днів для графіків, розсилок за розкладом і підрахунку робочих днів, а помилки літнього часу ловлять тестами з фіксованою датою.",
    tasks: [
      "Чому час краще зберігати в UTC і в який момент його перетворюють у пояс користувача?",
      "Чи входить кінцева дата у DatePeriod і як включити останній день?",
    ],
    adv: true,
  },
  {
    t: "Потоки в пам'яті й CSV: php://memory і fgetcsv",
    ch: "Стандартна бібліотека",
    easy: "Потік у пам'яті схожий на чернетковий блокнот: ви пишете в нього так само, як у справжній файл, а потім гортаєте на початок і читаєте. Нічого не лишається на диску, а після роботи аркуші викидають.",
    p: [
      "У PHP багато функцій працюють із <i>потоками</i>: <code>fopen</code>, <code>fwrite</code>, <code>fgets</code>, <code>fputcsv</code>. Зазвичай потік це файл, але той самий інтерфейс мають і спеціальні адреси. <code>php://memory</code> це потік у пам'яті, <code>php://temp</code> теж, але переходить на тимчасовий файл після певного обсягу, а <code>php://output</code> веде у стандартний вивід. Це дає змогу тестувати код роботи з файлами без файлів і не залежати від диска.",
      "Модель у голові: потік має <b>позицію</b>, курсор читання й запису, спільний для обох дій. Після запису курсор стоїть у кінці. Тому щоб прочитати щойно записане, потрібно викликати <code>rewind($h)</code>, інакше читання нічого не поверне. Відкривайте в режимі <code>'w+'</code> (запис і читання), а все записане забирайте через <code>stream_get_contents($h)</code> або читайте рядок за рядком у циклі.",
      "CSV це текстова таблиця, де поля розділені комами. Здається, що вистачить <code>explode(',', $line)</code>, але справжні дані ламають таку схему: у полі може бути кома, лапки чи навіть перенос рядка. <code>fputcsv($h, $row)</code> правильно екранує поле: огортає його лапками й подвоює внутрішні лапки. <code>fgetcsv($h)</code> робить зворотне й повертає масив рядків. Для рядка в пам'яті є <code>str_getcsv($line)</code>.",
      "Пастки читання. По-перше, <code>fgetcsv</code> повертає <b>рядки</b>: <code>\"3\"</code>, а не <code>3</code>, тож числа перетворюйте самі. По-друге, порожній рядок у файлі дає масив <code>[null]</code>, а не порожній масив, і його треба пропускати. По-третє, на кінці файлу функція повертає <code>false</code>, тому цикл пишуть як <code>while (($row = fgetcsv($h)) !== false)</code> із суворим порівнянням. По-четверте, читання з закритого потоку (<code>fclose</code>) тепер кидає <code>TypeError</code>, а не мовчить.",
      "Параметр <code>$escape</code> історично спирається на символ зворотної скісної риски, і в PHP 8.4 покладатися на його значення за замовчуванням застаріло. Щоб код працював однаково в усіх версіях, передавайте його явно: <code>fputcsv($h, $row, ',', '\"', '')</code> і <code>fgetcsv($h, null, ',', '\"', '')</code>. Тоді поведінка відповідає стандарту RFC 4180: лапки екрануються подвоєнням.",
      "Ідіоми. Перший рядок часто заголовок: прочитайте його окремо й склейте з кожним рядком через <code>array_combine($header, $row)</code>, щоб отримати асоціативні масиви. Закривайте потік через <code>fclose</code>. Для великих даних читайте рядок за рядком, а не весь вміст одразу, і тоді пам'ять не росте. А для передачі структур (вкладених даних) краще підходить JSON, CSV хороший лише для плоских таблиць.",
      "Далі поговоримо про серіалізацію: як перетворити об'єкти й масиви на рядок, щоб зберегти їх або передати.",
    ],
    code: [
      String.raw`<?php
$h = fopen('php://memory', 'w+');
fwrite($h, "перший\nдругий\n");
rewind($h);
echo fgets($h);
echo stream_get_contents($h);
fclose($h);

$out = fopen('php://output', 'w');
fwrite($out, "прямо у вивід\n");
fclose($out);`,
      String.raw`<?php
// Поведінка, що дивує: без rewind читати нічого
$h = fopen('php://memory', 'w+');
fputcsv($h, ['a', 'b'], ',', '"', '');
var_dump(fgetcsv($h, null, ',', '"', ''));
rewind($h);
var_dump(fgetcsv($h, null, ',', '"', ''));
fclose($h);`,
      String.raw`<?php
$rows = [
    ['name', 'qty', 'note'],
    ['Apple', 3, 'say "hi", ok'],
    ['Pear', 5, "два\nрядки"],
];

$h = fopen('php://memory', 'w+');
foreach ($rows as $row) {
    fputcsv($h, $row, ',', '"', '');
}
rewind($h);

$header = fgetcsv($h, null, ',', '"', '');
$total = 0;
while (($row = fgetcsv($h, null, ',', '"', '')) !== false) {
    $item = array_combine($header, $row);
    $total += (int) $item['qty'];
    echo $item['name'], ": ", json_encode($item['note'], JSON_UNESCAPED_UNICODE), "\n";
}
fclose($h);
echo "Разом: $total\n";

print_r(str_getcsv('x,"y,z",', ',', '"', ''));`,
      String.raw`<?php
// аварія: читання із закритого потоку кидає TypeError
$h = fopen('php://memory', 'w+');
fputcsv($h, ['x', 'y'], ',', '"', '');
rewind($h);
echo implode("|", fgetcsv($h, null, ',', '"', '')), "\n";
fclose($h);
echo implode("|", fgetcsv($h, null, ',', '"', '')), "\n";`,
    ],
    note: "Після запису в потік повертайтеся на початок через <code>rewind</code>. CSV розбирайте через <code>fgetcsv</code> і <code>str_getcsv</code>, а не <code>explode</code>, передавайте <code>$escape</code> явно, цикл завершуйте перевіркою <code>!== false</code>. Усі значення приходять рядками.",
    work: "Експорт і імпорт таблиць у CSV це щоденна задача: вивантаження замовлень, завантаження прайсів. Потік у пам'яті дає змогу покрити такий код тестами без файлів, а php://output віддає CSV прямо у відповідь сервера.",
    tasks: [
      "Навіщо після fputcsv у потоці php://memory потрібен rewind перед fgetcsv?",
      "Чому для CSV не варто розбирати рядки через explode по комі?",
    ],
    adv: true,
  },
  {
    t: "Серіалізація: serialize, var_export і __serialize",
    ch: "Стандартна бібліотека",
    easy: "Серіалізація схожа на пакування меблів у коробку для переїзду: розібрали, поклали в одну коробку з описом, а на новому місці зібрали назад. Описом тут слугує рядок, який можна зберегти або передати.",
    p: [
      "Змінні живуть лише поки працює скрипт. Щоб зберегти масив чи об'єкт у кеш, у файл або передати іншому процесу, його потрібно перетворити на рядок, а потім відновити. PHP має для цього кілька інструментів: <code>serialize</code>, <code>json_encode</code> і <code>var_export</code>, і кожен підходить для свого випадку.",
      "Модель у голові: <code>serialize($value)</code> робить рядок у власному форматі PHP, наприклад <code>a:2:{i:0;i:1;i:1;s:1:\"a\";}</code>, де літера означає тип, а довжини рядків вказані в байтах. <code>unserialize($text)</code> відновлює значення з тими самими типами, зокрема <code>int</code>, <code>bool</code>, <code>null</code> і об'єкти класів. JSON цього не вміє: він не відрізняє об'єкт від масиву й не знає ваших класів, зате зрозумілий усім мовам. <code>var_export($value, true)</code> повертає PHP-код, який відтворює значення, і його зручно класти у файли конфігурації.",
      "Для об'єктів у сучасному PHP існують магічні методи <code>__serialize(): array</code> і <code>__unserialize(array $data): void</code>. Перший повертає масив тих даних, що потрібно зберегти, другий отримує цей масив і заповнює об'єкт. Так ви самі вирішуєте, що потрапить у рядок: пропускаєте кеші, з'єднання, службові поля, які не можна відновити. Старі <code>__sleep</code> і <code>__wakeup</code> роблять схоже, але менш гнучко.",
      "Головна пастка це безпека. Ніколи не викликайте <code>unserialize</code> на даних від користувача: рядок може описувати довільні об'єкти, і їхні магічні методи (<code>__destruct</code>, <code>__wakeup</code>) виконаються. Це відома вразливість «ін'єкція об'єктів». Якщо дані ззовні, беріть JSON, а якщо serialize неминучий, обмежте класи: <code>unserialize($s, ['allowed_classes' =&gt; false])</code> повертає замість об'єктів безпечні заглушки <code>__PHP_Incomplete_Class</code>.",
      "Друга пастка: не все можна серіалізувати. Замикання (<code>Closure</code>), відкриті ресурси (файли, потоки) та анонімні класи кидають виняток <code>Exception</code>. Третя: <code>unserialize</code> на пошкодженому рядку повертає <code>false</code> і видає попередження, тож відрізнити помилку від законного <code>false</code> можна лише порівнянням з результатом <code>serialize(false)</code>. Четверта: формат прив'язаний до імені класу, тож перейменування класу ламає старі збережені рядки.",
      "Ідіоми. Для кешу всередині одного застосунку <code>serialize</code> підходить, бо зберігає типи. Для обміну між системами обирайте JSON. Для конфігурацій і вбудованих у код констант беріть <code>var_export</code>: у об'єктів він пише <code>\\Клас::__set_state(array(...))</code>, тому для звичайних даних краще масиви. Додавайте версію в масив <code>__serialize</code>, щоб пізніше змінювати формат без поломки старих даних.",
      "На цьому глава про стандартну бібліотеку завершується. Далі перейдемо до тестування: як перевіряти, що написаний код працює, без ручного запуску.",
    ],
    code: [
      String.raw`<?php
$data = ['id' => 7, 'tags' => ['php', 'spl'], 'active' => true, 'note' => null];
$text = serialize($data);
echo $text, "\n";

$back = unserialize($text);
var_dump($back === $data);

echo var_export(['a' => 1, 'ok' => true], true), "\n";`,
      String.raw`<?php
// Поведінка, що дивує: JSON губить типи, serialize їх зберігає
$data = ['price' => 5, 'ids' => [1, 2], 'empty' => []];
$viaJson = json_decode(json_encode($data));
var_dump(is_array($viaJson));
var_dump($viaJson->empty === []);

$viaSerialize = unserialize(serialize($data));
var_dump($viaSerialize === $data);`,
      String.raw`<?php
final class User
{
    private array $cache = [];

    public function __construct(public string $name, public string $email) {}

    public function remember(string $k, string $v): void
    {
        $this->cache[$k] = $v;
    }

    public function cacheSize(): int
    {
        return count($this->cache);
    }

    public function __serialize(): array
    {
        return ['name' => $this->name, 'email' => $this->email];
    }

    public function __unserialize(array $data): void
    {
        $this->name = $data['name'];
        $this->email = $data['email'];
        $this->cache = [];
    }
}

$u = new User('Ola', 'ola@x.com');
$u->remember('k', 'v');
$s = serialize($u);
echo $s, "\n";

$copy = unserialize($s);
echo $copy->name, " ", $copy->cacheSize(), "\n";

$safe = unserialize($s, ['allowed_classes' => false]);
echo get_class($safe), "\n";`,
      String.raw`<?php
// аварія: замикання не можна серіалізувати
$handler = fn(int $x): int => $x + 1;
echo "Серіалізуємо масив\n";
echo serialize([1, 2]), "\n";
echo serialize(['callback' => $handler]), "\n";`,
    ],
    note: "<code>serialize</code> зберігає типи й об'єкти, JSON переносить між мовами. <code>__serialize</code> і <code>__unserialize</code> керують тим, що потрапить у рядок. Ніколи не робіть <code>unserialize</code> з даних користувача, а замикання й ресурси серіалізувати неможливо.",
    work: "Кеш і черги часто зберігають значення через serialize, а конфігурації вивантажують через var_export у PHP-файли, які потім підключає opcache. Дані від клієнтів приймають як JSON, бо unserialize на них небезпечний.",
    tasks: [
      "Чому unserialize не можна викликати на даних від користувача?",
      "Для чого потрібні методи __serialize і __unserialize в класі?",
    ],
    adv: true,
  },
];
