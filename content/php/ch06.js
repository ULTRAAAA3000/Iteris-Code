export const LESSONS_06 = [
  {
    t: "Попередження й сповіщення: error_reporting і set_error_handler",
    ch: "Помилки",
    easy: "PHP схожий на досвідченого колегу, який буркоче під ніс: «тут ключа немає», «це застаріло». Він не зупиняє роботу, але говорить. Ви вирішуєте, які зауваження чути, куди їх записати й чи реагувати на них.",
    p: [
      "Не кожна помилка в PHP зупиняє програму. Звернення до неіснуючого ключа масиву, неоголошена змінна, застаріла можливість мови: усе це дає повідомлення, але скрипт іде далі й повертає <code>null</code> чи порожній рядок. Якщо ці зауваження ігнорувати, код мовчки працює з хибними даними, і помилку знаходять там, де вона вже нічого не пояснює. Тому першим кроком до надійної програми є вміння бачити такі повідомлення й керувати ними.",
      "Модель у голові: у кожного повідомлення є рівень, число з набору бітових прапорців. <code>E_NOTICE</code> і <code>E_WARNING</code> це зауваження, <code>E_DEPRECATED</code> означає «так не робіть, у наступних версіях зникне», <code>E_ERROR</code> завершує програму. Окремі рівні <code>E_USER_NOTICE</code>, <code>E_USER_WARNING</code> і <code>E_USER_ERROR</code> належать вам: їх запускає <code>trigger_error()</code>. Функція <code>error_reporting()</code> задає маску: які рівні взагалі показувати. Маски складають побітово: <code>E_ALL &amp; ~E_DEPRECATED</code> означає «усе, крім застарілого».",
      "Другий важіль це <code>set_error_handler()</code>. Ви передаєте функцію, і PHP викликає її замість стандартного виводу для повідомлень, які дозволені маскою. Обробник отримує рівень, текст, файл і рядок. Якщо він повертає <code>true</code>, повідомлення вважається оброблене, а якщо <code>false</code>, далі спрацює стандартний механізм. Повернути попередній обробник можна викликом <code>restore_error_handler()</code>, тому тимчасове перехоплення легко зняти.",
      "Приклади сходинками: спершу перехопіть одне попередження й надрукуйте його, потім подивіться, як маска вимикає цілий рівень, а тоді зберіть усі повідомлення в масив, як це робить справжній логер. Зверніть увагу: звичайні помилки виконання, як-от виклик неіснуючої функції чи ділення на нуль, у сучасному PHP є не повідомленнями, а виключеннями, про них далі в главі, і обробник повідомлень їх не бачить.",
      "Пастки. Обробник не отримує фатальних помилок: <code>E_ERROR</code> і <code>E_USER_ERROR</code> без пощади завершують скрипт. Оператор <code>@</code> перед виразом глушить повідомлення, але його вживання підступне: воно ховає причину збою, а не усуває її, тому в новому коді його уникають. Якщо знизити маску до нуля, помилки зникнуть з екрана, а не з програми, і вона й далі працюватиме з <code>null</code> замість даних. Нарешті, обробник сам має бути обережним: повідомлення всередині нього легко породжує нескінченну рекурсію.",
      "Ідіоми. У розробці ставлять <code>error_reporting(E_ALL)</code> і показують усе, у проді повідомлення пишуть у лог, а на екран не виводять. Обробник у фреймворках зазвичай перетворює кожне повідомлення на виключення, щоб воно не загубилося. Для власних сигналів замість <code>echo</code> у бібліотеці краще <code>trigger_error()</code> з <code>E_USER_DEPRECATED</code>, коли ви позначаєте функцію як застарілу.",
      "Повідомлення покривають дрібні збої, а ось серйозні розгалуження логіки в PHP описують виключеннями. Наступний урок про них: як кинути, як перехопити й чому це надійніше за перевірку кожного рядка вручну.",
    ],
    code: [
      String.raw`<?php
set_error_handler(function (int $no, string $msg): bool {
    echo "перехоплено: $msg\n";
    return true;
});

$prices = ["кава" => 50];
$x = $prices["чай"];
var_dump($x);
echo "програма жива\n";`,
      String.raw`<?php
set_error_handler(function (int $no, string $msg): bool {
    echo "обробник: $msg\n";
    return true;
});

$a = [];
$v = $a["k"];
echo "до маски\n";

error_reporting(E_ALL & ~E_WARNING);
$v = $a["k"];
echo "після маски\n";
var_dump((error_reporting() & E_WARNING) === 0);`,
      String.raw`<?php
$log = [];
set_error_handler(function (int $no, string $msg) use (&$log): bool {
    $label = match ($no) {
        E_WARNING => "WARNING",
        E_USER_NOTICE => "NOTICE",
        E_USER_WARNING => "USER_WARNING",
        E_DEPRECATED => "DEPRECATED",
        default => "ІНШЕ",
    };
    $log[] = "$label: $msg";
    return true;
});

$list = [1, 2];
$z = $list[5];
trigger_error("кеш порожній", E_USER_NOTICE);
trigger_error("поле застаріло", E_USER_WARNING);
$n = strlen(null);

restore_error_handler();
echo implode("\n", $log), "\n";
echo count($log), " повідомлення\n";`,
      String.raw`<?php
// аварія: E_USER_ERROR є фатальною помилкою, скрипт завершується
echo "початок\n";
trigger_error("критичний збій", E_USER_ERROR);
echo "сюди не дійдемо\n";`,
    ],
    note: "Повідомлення не зупиняють програму, а лише сигналізують. <code>error_reporting()</code> вибирає рівні, <code>set_error_handler()</code> перехоплює їх. Фатальні помилки й оператор <code>@</code>: перші не перехопити, другий ховає причину.",
    work: "У проді повідомлення пишуть у лог, а не на екран, і стежать за ним у моніторингу. Фреймворки встановлюють власний обробник, що перетворює кожне повідомлення на виключення, тому нічого не губиться непоміченим.",
    tasks: [
      "Чим повідомлення типу E_WARNING відрізняється від фатальної помилки з погляду виконання програми?",
      "Що повертає обробник, щоб PHP вважав повідомлення вже обробленим?",
    ],
  },
  {
    t: "Виключення: try, catch і throw",
    ch: "Помилки",
    easy: "Виключення це пожежна сигналізація: той, хто помітив лихо, не гасить його сам, а дзвонить, і сигнал іде вгору по будинку, доки не знайдеться той, хто вміє діяти. Звичайний код працює, поки не продзвенить.",
    p: [
      "Функція, яка не може виконати завдання, має два шляхи: повернути спеціальне значення (<code>false</code>, <code>null</code>, код помилки) або кинути виключення. Перший шлях змушує кожен виклик перевіряти результат, а один пропущений <code>if</code> дає тихі хибні дані. Виключення розв'язують це: збій не можна проігнорувати випадково, він сам рухається вгору по стеку викликів.",
      "Модель у голові: <code>throw</code> створює об'єкт-виключення й негайно перериває поточну функцію. PHP піднімається викликами вгору і шукає найближчий блок <code>try</code>, чий <code>catch</code> підходить за типом. Знайшов: виконує його, а далі продовжує код після всього <code>try</code>. Не знайшов: програма завершується з повідомленням про необроблене виключення. Усе, що в <code>try</code> лишилося після місця кидання, не виконується, навіть якщо до кінця блока було ще кілька рядків, а виклики, які чекали на результат, так і не отримають його.",
      "Синтаксис: <code>try { ... } catch (InvalidArgumentException $e) { ... }</code>. Змінна <code>$e</code> тримає об'єкт, а методи <code>getMessage()</code>, <code>getCode()</code>, <code>getPrevious()</code> і <code>getTraceAsString()</code> розповідають про збій. Кілька типів можна об'єднати вертикальною рискою: <code>catch (TypeError | ValueError $e)</code>. Змінну в <code>catch</code> можна й опустити, якщо вона не потрібна: <code>catch (RuntimeException)</code>, це доступно з PHP 8.0.",
      "Кілька блоків <code>catch</code> перевіряються згори донизу, і виконується перший, що підійшов. Тому конкретніші типи пишуть вище, а загальніші нижче. Якщо поставити широкий тип першим, вужчі після нього стають недосяжними: PHP не поскаржиться, вони просто не спрацюють. Виключення, яке нікому не підійшло, піднімається далі, і це правильна поведінка: ловіть лише те, що вмієте обробити.",
      "Пастки. Порожній <code>catch</code>, що ковтає виключення без жодної дії, ховає помилку так само, як <code>@</code>, і шукати її потім дуже важко. Не використовуйте виключення для звичайного перебігу: «знайдено чи ні» краще виражати поверненням <code>null</code>. Також <code>throw</code> з 8.0 є виразом, тому можливий запис <code>$x = $v ?? throw new Exception('немає')</code>, зручний для коротких перевірок.",
      "Ідіоми. Кидайте виключення в місці, де знаєте причину, а ловіть там, де знаєте, що робити далі: повторити, показати користувачу чи записати в лог. Повідомлення робіть конкретними, з даними: «не число: abc» корисніше за «помилка», бо за ним одразу видно, що саме було не так і з яким значенням. Дрібний збій бібліотеки може бути перехоплений на межі вашого модуля й перетворений на зрозуміліший.",
      "Виключення бувають різних видів, і від того, чи це <code>Exception</code>, чи <code>Error</code>, залежить, що саме спіймає ваш <code>catch</code>. Про цю ієрархію наступний урок.",
    ],
    code: [
      String.raw`<?php
function check(int $age): void
{
    if ($age < 0) {
        throw new Exception("вік не може бути від'ємним");
    }
    echo "вік $age прийнято\n";
}

try {
    check(30);
    check(-5);
    echo "сюди не дійдемо\n";
} catch (Exception $e) {
    echo "помилка: ", $e->getMessage(), "\n";
}
echo "далі працюємо\n";`,
      String.raw`<?php
function parse(string $s): int
{
    if (!is_numeric($s)) {
        throw new InvalidArgumentException("не число: $s", 10);
    }
    if ((int) $s > 100) {
        throw new RangeException("завелике: $s", 20);
    }
    return (int) $s;
}

foreach (["7", "abc", "500"] as $input) {
    try {
        echo "ok ", parse($input), "\n";
    } catch (InvalidArgumentException $e) {
        echo "аргумент (", $e->getCode(), "): ", $e->getMessage(), "\n";
    } catch (RangeException | LengthException $e) {
        echo "діапазон (", $e->getCode(), "): ", $e->getMessage(), "\n";
    }
}`,
      String.raw`<?php
function load(array $config, string $key): string
{
    return $config[$key] ?? throw new OutOfBoundsException("немає ключа $key");
}

function boot(array $config): string
{
    return load($config, "host") . ":" . load($config, "port");
}

$config = ["host" => "localhost"];
try {
    echo boot($config), "\n";
} catch (OutOfBoundsException $e) {
    echo "конфігурація неповна: ", $e->getMessage(), "\n";
}

$config["port"] = "8080";
echo boot($config), "\n";`,
      String.raw`<?php
// аварія: виключення ніхто не перехопив
function risky(): void
{
    throw new RuntimeException("щось пішло не так");
}

echo "старт\n";
risky();
echo "кінець\n";`,
    ],
    note: "<code>throw</code> перериває функцію, і виключення піднімається вгору, поки не знайде підходящий <code>catch</code>. Ловіть лише те, що вмієте обробити; необроблене виключення завершує програму, а порожній <code>catch</code> ховає помилку.",
    work: "Валідація запиту, звернення до сервісу, читання конфігурації: у кожному місці кидають виключення з конкретним повідомленням, а на верхньому рівні, наприклад у контролері, його перетворюють на відповідь користувачу або запис у лог.",
    tasks: [
      "Що відбувається з рештою коду в блоці try після рядка, який кинув виключення?",
      "Чому конкретніший тип у catch має стояти вище за загальніший?",
    ],
  },
  {
    t: "Ієрархія: Throwable, Error й Exception",
    ch: "Помилки",
    easy: "Усі сигнали тривоги мають спільний роз'єм, але бувають двох видів: поломка в самій програмі, як зламаний механізм, і ситуація зовні, як відсутній інгредієнт. Ловити їх можна окремо чи разом.",
    p: [
      "У PHP 7 помилки рушія, раніше фатальні, перетворили на виключення, і з'явилися дві гілки. Тому <code>catch (Exception $e)</code> перестав ловити все підряд, і це частий здивувальний момент: ви написали обробник, а програма все одно впала з необробленою помилкою, хоча виглядало, що все передбачено. Те саме стосується коду, написаного ще для PHP 5. Щоб не гадати, треба знати дерево типів.",
      "Модель у голові: на вершині стоїть інтерфейс <code>Throwable</code>, його реалізують лише два класи: <code>Exception</code> і <code>Error</code>. Кинути можна тільки об'єкт, що реалізує <code>Throwable</code>, а власні класи успадковують один із цих двох. <code>Exception</code> призначений для ситуацій, які програма може очікувати й обробити: некоректний ввід, недоступний сервіс. <code>Error</code> позначає програмні помилки: неправильний тип, виклик неіснуючого методу, ділення на нуль.",
      "Під <code>Exception</code> стандартна бібліотека (SPL) тримає зручні підтипи: <code>LogicException</code> із <code>InvalidArgumentException</code> та <code>DomainException</code> для помилок логіки, які слід виправити в коді, і <code>RuntimeException</code> із <code>OutOfBoundsException</code> чи <code>UnexpectedValueException</code> для збоїв, що трапляються під час роботи. Під <code>Error</code> лежать <code>TypeError</code>, <code>ValueError</code>, <code>ArithmeticError</code> із дочірнім <code>DivisionByZeroError</code>, а також <code>ArgumentCountError</code> та інші.",
      "Звідси практичні правила. <code>catch (Exception $e)</code> не спіймає <code>TypeError</code> чи <code>DivisionByZeroError</code>, бо це гілка <code>Error</code>. <code>catch (Throwable $e)</code> спіймає все й доречний лише на самому верхньому рівні програми, де ви хочете записати збій у лог і показати чемну відповідь. Усередині бібліотечного коду <code>Throwable</code> ловити не варто: ви проковтнете помилки програмування, які мали б голосно виявитись.",
      "Пастки. Помилка в логіці не лікується обробником: якщо ви спіймали <code>TypeError</code> і приховали його, баг нікуди не зник. А ще <code>Error</code> і <code>Exception</code> не пов'язані між собою: через <code>instanceof Exception</code> ви не відрізните об'єкт <code>Error</code>. Нарешті, перевіряючи тип, дивіться на найточніший клас, а не на текст повідомлення: тексти змінюються між версіями PHP, а імена класів стабільні роками. Так само не розбирайте повідомлення регулярними виразами.",
      "Ідіоми. Для власних збоїв успадковуйте <code>RuntimeException</code> або <code>LogicException</code>, а не голий <code>Exception</code>, і так збережете семантику. У межових функціях ловіть вузький тип, у точці входу застосунку <code>Throwable</code>. Імена класів виводьте через <code>get_class($e)</code> або <code>$e::class</code>.",
      "Вбудованих типів вистачає не завжди: часто потрібне виключення з власною назвою й додатковими даними. Як його створити й прикріпити до нього першопричину, розкаже урок про власні виключення, але спершу треба навчитися гарантовано прибирати за собою, що робить <code>finally</code>.",
    ],
    code: [
      String.raw`<?php
foreach ([new Exception("e"), new InvalidArgumentException("i"), new TypeError("t"), new DivisionByZeroError("d")] as $obj) {
    $kind = $obj instanceof Exception ? "Exception" : "Error";
    printf("%-26s це %s\n", get_class($obj), $kind);
}
var_dump(new Exception() instanceof Throwable, new Error() instanceof Throwable);`,
      String.raw`<?php
$chain = class_parents(new DivisionByZeroError());
echo implode(" -> ", ["DivisionByZeroError", ...array_values($chain)]), "\n";

$chain = class_parents(new OutOfBoundsException());
echo implode(" -> ", ["OutOfBoundsException", ...array_values($chain)]), "\n";

var_dump(in_array("Throwable", class_implements("Error"), true));`,
      String.raw`<?php
declare(strict_types=1);

function risky(int $case): string
{
    return match ($case) {
        0 => throw new RuntimeException("збій сервісу"),
        1 => (string) intdiv(5, 0),
        2 => (fn(int $x): string => "x=$x")("abc"),
        default => "ок",
    };
}

foreach ([0, 1, 2, 3] as $case) {
    try {
        echo $case, ": ", risky($case), "\n";
    } catch (Exception $e) {
        echo $case, ": Exception ", get_class($e), "\n";
    } catch (Throwable $e) {
        echo $case, ": Error-гілка ", get_class($e), "\n";
    }
}`,
      String.raw`<?php
// аварія: Exception не ловить Error, тож DivisionByZeroError не перехоплено
try {
    echo intdiv(10, 0), "\n";
} catch (Exception $e) {
    echo "спіймано: ", $e->getMessage(), "\n";
}
echo "кінець\n";`,
    ],
    note: "Усе, що можна кинути, реалізує <code>Throwable</code>. Гілка <code>Exception</code> для очікуваних збоїв, гілка <code>Error</code> для помилок програми. <code>catch (Exception)</code> не бачить <code>Error</code>; <code>Throwable</code> ловіть лише на верхньому рівні.",
    work: "У точці входу застосунку ставлять один широкий <code>catch (Throwable)</code>: записати збій у лог і віддати чемну відповідь. Усередині модулів ловлять вузькі типи, щоб справжні помилки програмування не зникали мовчки.",
    tasks: [
      "Чому catch (Exception) не перехопить DivisionByZeroError?",
      "У якому місці програми доречно ловити саме Throwable?",
    ],
  },

  {
    t: "finally й очищення ресурсів",
    ch: "Помилки",
    easy: "Виходячи з кімнати, ви вимикаєте світло незалежно від того, чи вийшли спокійно, чи вибігли з криком. Блок finally це той вимикач біля дверей: він спрацьовує за будь-якого виходу з блока try.",
    p: [
      "Багато операцій беруть ресурс і мусять його повернути: відкритий файл чи потік, блокування, з'єднання, тимчасовий стан, який треба скинути. Якщо між «взяти» і «повернути» трапиться виключення, звичайний код до рядка з поверненням просто не дійде, і ресурс залишиться захопленим. На одноразовому скрипті це непомітно, а на довгому процесі ресурси витікають.",
      "Модель у голові: до <code>try</code> і <code>catch</code> можна додати <code>finally</code>. Його вміст виконується завжди, коли керування покидає <code>try</code> чи <code>catch</code>: після успіху, після перехопленого виключення, після <code>return</code>, <code>break</code> або <code>continue</code>, і навіть тоді, коли виключення не перехоплене й летить далі. Тому в <code>finally</code> кладуть прибирання, яке не залежить від того, як усе закінчилося: закрити потік, зняти блокування, скинути прапорець, записати в лог, що операцію завершено.",
      "Порядок виконання варто відчути руками. Нормальний шлях: <code>try</code>, потім <code>finally</code>. Збій: <code>try</code> до місця кидання, потім відповідний <code>catch</code>, потім <code>finally</code>. Збій без <code>catch</code>: <code>try</code>, потім <code>finally</code>, а вже після нього виключення продовжує підйом. Блок <code>try</code> може мати лише <code>finally</code> без жодного <code>catch</code>: тоді ви прибираєте, але вирішувати, що з помилкою, лишаєте комусь вище.",
      "Цікавіший випадок із <code>return</code>. Якщо в <code>try</code> стоїть <code>return $x</code>, значення вираховується відразу, потім виконується <code>finally</code>, і лише потім функція повертає вже обчислене значення. Зміна змінної в <code>finally</code> на це значення не вплине. Приклади сходинками: спершу порядок виводу, потім робота з потоком <code>php://memory</code>, який закривають у <code>finally</code>, і наприкінці поведінка, що дивує.",
      "Пастки. Якщо в самому <code>finally</code> стоїть <code>return</code>, він перебиває і повернене значення з <code>try</code>, і виключення, що летіло вгору: помилка зникає без сліду. Тому <code>return</code> у <code>finally</code> практично ніколи не пишуть. Так само виключення, кинуте всередині <code>finally</code>, замінює те, що було в польоті (старе стає попереднім у ланцюжку). Прибирання має бути простим і не кидати нових помилок.",
      "Ідіоми. Захопив ресурс, одразу відкрий <code>try</code> із <code>finally</code>, що його звільняє. Відкривати ресурс краще до блока <code>try</code>, тоді не доведеться перевіряти, чи він узагалі відкрився. У класах для того ж є деструктор, але <code>finally</code> явніший: звільнення видно прямо біля захоплення, і його порядок передбачуваний.",
      "Тепер ви вмієте кидати, ловити й гарантовано прибирати. Лишається вміння описувати збої мовою вашої предметної області: власні типи виключень, які несуть дані й пам'ятають першопричину. Це тема наступного уроку.",
    ],
    code: [
      String.raw`<?php
function run(bool $fail): void
{
    try {
        echo "try: початок\n";
        if ($fail) {
            throw new RuntimeException("збій");
        }
        echo "try: кінець\n";
    } catch (RuntimeException $e) {
        echo "catch: ", $e->getMessage(), "\n";
    } finally {
        echo "finally: завжди\n";
    }
}

run(false);
echo "--\n";
run(true);`,
      String.raw`<?php
function value(): string
{
    try {
        return "з try";
    } finally {
        echo "finally виконано до повернення\n";
    }
}

echo value(), "\n";

function counter(): int
{
    $n = 1;
    try {
        return $n;
    } finally {
        $n = 100;
    }
}
echo counter(), "\n";`,
      String.raw`<?php
function writeReport(array $lines): string
{
    $h = fopen("php://memory", "w+");
    try {
        foreach ($lines as $line) {
            if ($line === "") {
                throw new InvalidArgumentException("порожній рядок");
            }
            fwrite($h, $line . "\n");
        }
        rewind($h);
        return stream_get_contents($h);
    } finally {
        fclose($h);
        echo "потік закрито\n";
    }
}

echo writeReport(["раз", "два"]);
try {
    writeReport(["три", ""]);
} catch (InvalidArgumentException $e) {
    echo "помилка: ", $e->getMessage(), "\n";
}`,
      String.raw`<?php
// аварія: finally виконується, але необроблене виключення летить далі
function job(): void
{
    try {
        throw new LogicException("не перехоплено");
    } finally {
        echo "прибрано\n";
    }
}

job();
echo "сюди не дійдемо\n";`,
      String.raw`<?php
function surprise(): string
{
    try {
        throw new RuntimeException("важлива помилка");
    } finally {
        return "finally перебив виключення";
    }
}

echo surprise(), "\n";`,
    ],
    note: "<code>finally</code> виконується завжди, коли керування виходить із <code>try</code> чи <code>catch</code>: тут звільняють ресурси. <code>return</code> у <code>finally</code> перебиває і повернення, і виключення, тому його не пишуть.",
    work: "Закрити потік чи файл, зняти блокування, відкотити незавершену операцію, повернути глобальний стан у початкове значення: усе це роблять у <code>finally</code>, щоб за будь-якого збою довгоживучий процес не накопичував захоплених ресурсів.",
    tasks: [
      "У яких випадках виконується блок finally?",
      "Що станеться з виключенням, якщо в блоці finally стоїть return?",
    ],
  },
  {
    t: "Власні виключення й ланцюжок previous",
    ch: "Помилки",
    easy: "Лікар не пише в картці «щось не так». Він називає діагноз і додає, що було першопричиною. Так і власне виключення має точну назву, потрібні дані та посилання на те, що спричинило збій.",
    p: [
      "Вбудовані типи на кшталт <code>RuntimeException</code> загальні. Коли функція кидає просто <code>RuntimeException</code>, той, хто ловить, не може відрізнити «не вистачає коштів» від «базу вимкнено» інакше, ніж розбираючи текст повідомлення, а це крихко. Власний клас виключення робить збій частиною словника вашого коду: його можна спіймати окремо, і він несе дані.",
      "Модель у голові: власне виключення це звичайний клас, що успадковує <code>Exception</code> або одного з його нащадків. Конструктор базового класу приймає три параметри: повідомлення, числовий код і попереднє виключення <code>$previous</code>. У нащадка конструктор можна змінити, головне, викликати <code>parent::__construct(...)</code> зі складеним повідомленням. Додаткові дані зручно зберігати в публічних <code>readonly</code>-властивостях, оголошених через конструктор.",
      "Ланцюжок previous розв'язує іншу проблему. Низькорівневий збій, наприклад «не вдалося розібрати JSON», не повинен просочуватися на верхні рівні як є, бо там його не розуміють. Але й губити його не можна. Тому ви ловите низькорівневе виключення, кидаєте своє, зрозуміле для рівня вище, і передаєте перше третім аргументом. Метод <code>getPrevious()</code> повертає цей зв'язок, і в журналі видно весь ланцюг від поверхні до кореня.",
      "Приклади сходинками: простий клас без додаткових полів, клас із даними й іменованим статичним конструктором, і нарешті обгортка, що зберігає першопричину. Зверніть увагу, що <code>getMessage()</code>, <code>getCode()</code>, <code>getPrevious()</code> оголошені в базовому класі як <code>final</code>: їх не можна перевизначити, тож повідомлення формують у конструкторі.",
      "Пастки. Не варто ловити виключення, щоб кинути нове без <code>previous</code>: так губиться першопричина, і налагодження перетворюється на гадання. Ще одна пастка: власні класи не повинні розростатися, один виняток на кожну дрібницю робить код громіздким. Заводьте тип, коли хтось справді його ловитиме окремо. Нарешті, не кладіть у повідомлення секрети: паролі чи токени потраплять у лог.",
      "Ідіоми. Спільна база для виключень модуля, наприклад <code>PaymentException</code>, дозволяє ловити весь модуль одним <code>catch</code>, а конкретні підтипи розрізняти за потреби. Іменований статичний конструктор <code>InsufficientFunds::forAmount(...)</code> робить виклик виразним. Суфікс <code>Exception</code> у назві поширений і зрозумілий. Додавайте код (<code>getCode()</code>) лише тоді, коли його справді читатимуть, наприклад для відповіді API, а повідомлення пишіть так, щоб його можна було показати розробнику без додаткових пояснень.",
      "Ви тепер можете описати збої своєї предметної області. Далі йдуть просунуті уроки про вбудовані <code>TypeError</code> і <code>ValueError</code> та про перевірки, які знімають у проді: для надійної валідації вхідних даних це важливий інструмент.",
    ],
    code: [
      String.raw`<?php
class EmptyCartException extends RuntimeException {}

function checkout(array $cart): int
{
    if ($cart === []) {
        throw new EmptyCartException("кошик порожній");
    }
    return array_sum($cart);
}

try {
    echo checkout([100, 50]), "\n";
    echo checkout([]), "\n";
} catch (EmptyCartException $e) {
    echo get_class($e), ": ", $e->getMessage(), "\n";
}`,
      String.raw`<?php
class InsufficientFundsException extends DomainException
{
    public function __construct(
        public readonly int $balance,
        public readonly int $needed,
    ) {
        parent::__construct("не вистачає " . ($needed - $balance) . " грн", 402);
    }
}

function withdraw(int $balance, int $amount): int
{
    if ($amount > $balance) {
        throw new InsufficientFundsException($balance, $amount);
    }
    return $balance - $amount;
}

try {
    echo withdraw(500, 200), "\n";
    echo withdraw(100, 150), "\n";
} catch (InsufficientFundsException $e) {
    echo $e->getMessage(), " (код ", $e->getCode(), ", баланс ", $e->balance, ")\n";
}`,
      String.raw`<?php
class ConfigException extends Exception {}

function parseConfig(string $json): array
{
    try {
        return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        throw new ConfigException("некоректна конфігурація", 0, $e);
    }
}

try {
    $cfg = parseConfig('{"debug": true}');
    var_dump($cfg["debug"]);
    parseConfig("{не json");
} catch (ConfigException $e) {
    echo get_class($e), ": ", $e->getMessage(), "\n";
    for ($p = $e->getPrevious(); $p !== null; $p = $p->getPrevious()) {
        echo "  причина: ", get_class($p), "\n";
    }
}`,
      String.raw`<?php
// аварія: власне виключення не перехоплено, ланцюжок previous друкується в повідомленні
class SyncException extends RuntimeException {}

function fetch(): never
{
    throw new InvalidArgumentException("порожня адреса");
}

try {
    fetch();
} catch (InvalidArgumentException $e) {
    throw new SyncException("синхронізація зірвалась", 1, $e);
}`,
    ],
    note: "Власне виключення це клас-нащадок <code>Exception</code> із зрозумілою назвою та даними. Третій аргумент конструктора зберігає першопричину, а <code>getPrevious()</code> її повертає. Кидаючи нове, завжди передавайте старе.",
    work: "Шар сервісу ловить низькорівневі збої бази, мережі чи JSON і кидає виключення рівня предметної області: <code>OrderNotFound</code>, <code>PaymentFailed</code>. Контролер ловить лише їх, а в логах зберігається увесь ланцюжок до першопричини.",
    tasks: [
      "Для чого конструктору виключення передають третім аргументом попереднє виключення?",
      "Чому властивості-дані власного виключення зручно оголошувати readonly через конструктор?",
    ],
  },
  {
    t: "TypeError, ValueError і валідація вхідних даних",
    ch: "Помилки",
    adv: true,
    easy: "Вахтер перевіряє два різні речі: чи це взагалі пропуск, а не квиток у кіно, і чи він чинний на сьогодні. Так TypeError означає «не той вид даних», а ValueError «потрібний вид, але недопустиме значення».",
    p: [
      "Дані зовні ніколи не бувають гарантовано правильними: рядок із форми, число з параметра запиту, JSON від іншого сервісу. Поки вони не перевірені, їх не можна пускати вглиб програми. Хороша валідація відсікає сміття на вході, а решта коду працює з уже перевіреними значеннями й не мусить сумніватися.",
      "Модель у голові: помилки вхідних даних бувають двох видів, і PHP їх розрізняє. <code>TypeError</code> виникає, коли тип аргументу чи повернення не збігається з оголошеним, наприклад рядок <code>\"abc\"</code> там, де чекають <code>int</code>. <code>ValueError</code> (від PHP 8.0) означає, що тип правильний, але значення недопустиме для цієї функції: <code>str_repeat('x', -1)</code> чи <code>array_chunk($a, 0)</code>. Обидва успадковують <code>Error</code>, тож це помилки програмування, а не очікувані збої.",
      "Це розрізнення задає стратегію. Для типів у вашому коді працює <code>declare(strict_types=1)</code> і оголошені типи: PHP сам кине <code>TypeError</code> там, де без нього тихо перетворив би рядок <code>\"5\"</code> на число. Для значень потрібні явні перевірки: діапазон, формат, довжина. Тут ви самі кидаєте виключення. Для помилок користувача зазвичай обирають <code>InvalidArgumentException</code>, бо це очікувана ситуація; <code>ValueError</code> залишають для випадків, коли виклик із недопустимим значенням є хибою коду.",
      "Для зовнішніх рядків є <code>filter_var()</code>: <code>FILTER_VALIDATE_INT</code> повертає ціле або <code>false</code>, <code>FILTER_VALIDATE_EMAIL</code> перевіряє пошту, а прапорець <code>FILTER_NULL_ON_FAILURE</code> дає <code>null</code> замість <code>false</code>, коли це зручніше. Для JSON є прапорець <code>JSON_THROW_ON_ERROR</code>, що перетворює мовчазне <code>null</code> на <code>JsonException</code>. Усе це дає змогу відсікти погані дані в одному місці.",
      "Пастки. Рівність у стилі <code>if ($n == false)</code> змішує нуль, порожній рядок і недійсне значення: <code>filter_var('0', FILTER_VALIDATE_INT)</code> повертає <code>0</code>, і перевірка <code>if (!$n)</code> хибно визнає його помилкою. Порівнюйте з <code>false</code> лише строго: <code>=== false</code>. Без <code>strict_types</code> рядок <code>\"12\"</code> у параметр <code>int</code> тихо стане цілим, а <code>6.0</code> перетвориться на 6, що іноді небажано.",
      "Ідіоми. Валідуйте на межі: у контролері, у конструкторі об'єкта-значення, у фабриці. Усередині працюйте зі строгими типами й не перевіряйте повторно. Повідомлення робіть конкретними: що очікувалося й що прийшло. Збирайте всі помилки форми разом, а не зупиняйтеся на першій, якщо користувачу корисніше побачити повний список.",
      "Валідація на вході покриває дані ззовні, а внутрішні припущення програми, що «тут завжди так», перевіряють інакше: контрактами й твердженнями, і саме їх розбирає наступний урок.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

function double(int $n): int
{
    return $n * 2;
}

foreach ([4, "5", 6.5] as $input) {
    try {
        echo double($input), "\n";
    } catch (TypeError $e) {
        echo "TypeError для ", gettype($input), "\n";
    }
}`,
      String.raw`<?php
try {
    echo str_repeat("ab", -1);
} catch (ValueError $e) {
    echo get_class($e), ": ", $e->getMessage(), "\n";
}

try {
    array_chunk([1, 2, 3], 0);
} catch (ValueError $e) {
    echo get_class($e), " для array_chunk\n";
}

var_dump($e instanceof Error, $e instanceof Exception);`,
      String.raw`<?php
declare(strict_types=1);

function parseQty(string $raw): int
{
    $n = filter_var($raw, FILTER_VALIDATE_INT);
    if ($n === false) {
        throw new InvalidArgumentException("не ціле: $raw");
    }
    if ($n < 1 || $n > 10) {
        throw new ValueError("кількість поза діапазоном: $n");
    }
    return $n;
}

foreach (["3", "x", "0", "10", "007"] as $raw) {
    try {
        echo "ok ", parseQty($raw), "\n";
    } catch (InvalidArgumentException | ValueError $e) {
        echo get_class($e), ": ", $e->getMessage(), "\n";
    }
}`,
      String.raw`<?php
// аварія: у режимі strict_types тип не збігається, TypeError ніхто не ловить
declare(strict_types=1);

function total(int $a, int $b): int
{
    return $a + $b;
}

echo total(1, 2), "\n";
echo total("3", 4), "\n";`,
      String.raw`<?php
try {
    json_decode("{не json", true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    echo "JSON відхилено: ", get_class($e), "\n";
}

var_dump(json_decode("{не json", true));
var_dump(filter_var("0", FILTER_VALIDATE_INT));
var_dump(filter_var("абв", FILTER_VALIDATE_INT, FILTER_NULL_ON_FAILURE));`,
    ],
    note: "<code>TypeError</code> означає невідповідний тип, <code>ValueError</code> допустимий тип із недопустимим значенням. Для входу використовуйте <code>strict_types</code>, <code>filter_var</code> і явні перевірки; порівнюйте результат із <code>false</code> строго.",
    work: "У контролері чи конструкторі об'єкта-значення перевіряють параметри запиту: ціле в діапазоні, коректна пошта, розбір JSON із прапорцем <code>JSON_THROW_ON_ERROR</code>. Усередині програми далі працюють лише з валідними даними.",
    tasks: [
      "Чим TypeError відрізняється від ValueError?",
      "Чому результат filter_var з FILTER_VALIDATE_INT слід порівнювати з false строго?",
    ],
  },
  {
    t: "assert і контракти: передумови та постумови",
    ch: "Помилки",
    adv: true,
    easy: "Будівельник перед заливкою перевіряє рівнем, що опалубка стоїть рівно, а після робіт міряє, чи стіна вийшла прямою. Це не робота, а страховка: у готовому будинку рівень уже не носять.",
    p: [
      "Деякі припущення в коді настільки очевидні, що їх не пишуть, доки хтось не порушить їх через три тижні в іншому місці. «Список не порожній», «ціна не від'ємна», «результат лежить у межах». Якщо припущення хибне, програма не повинна рухатися далі й давати дивні відповіді: краще впасти одразу й показати, де саме порушено контракт.",
      "Модель у голові: контракт має передумову (що має бути правдою на вході функції) і постумову (що функція гарантує на виході). У PHP їх виражають функцією <code>assert()</code>. Вона перевіряє вираз, і якщо він хибний, кидає <code>AssertionError</code>. Другим аргументом передають пояснення: <code>assert($n &gt; 0, 'n має бути додатнім')</code>, або навіть власний об'єкт виключення.",
      "Ключова особливість: поведінку керує директива <code>zend.assertions</code>. Значення <code>1</code> вмикає перевірки (так у розробці), <code>0</code> вимикає їх під час роботи, а <code>-1</code> прибирає їх повністю, як ніби в коді їх ніколи не було, і тоді аргументи <code>assert()</code> навіть не обчислюються. У виробничій конфігурації зазвичай стоїть <code>-1</code>. Режим <code>-1</code> можна задати лише в <code>php.ini</code>, а між <code>0</code> і <code>1</code> перемикаються й під час виконання.",
      "З цього випливає головне правило: <code>assert</code> перевіряє помилки програмування, а не дані користувача. Якщо перевірку можна вимкнути в проді, вона не годиться для валідації вводу: у проді зловмисник просто пройшов би повз неї. Для такого вводу використовують явні <code>if</code> і виключення з попереднього уроку. А <code>assert</code> стверджує те, що вже має бути гарантоване кодом: інваріанти, умови між внутрішніми функціями, результати.",
      "Пастки. Не ховайте побічні дії в аргументі: <code>assert(array_pop($stack) !== null)</code> під <code>-1</code> не виконається, і програма поводитиметься по-різному в розробці та в проді. Пояснення варто завжди додавати: без нього повідомлення мало що каже. Також <code>assert</code> не замінює тестів: він ловить порушення в моменті, а тест охоплює сценарії заздалегідь.",
      "Ідіоми. Передумови пишуть на початку функції, постумови перед <code>return</code>. Для складних перевірок виносьте умову в зрозумілу змінну чи метод. Повідомлення формулюйте як факт, що мав виконуватися: «список не порожній». Ловити <code>AssertionError</code> у робочому коді не слід, це свідчення помилки, яку треба виправити.",
      "У главі ви пройшли шлях від повідомлень і виключень до контрактів. Далі курс переходить до генераторів та ітераторів: до того, як перебирати великі набори даних, не тримаючи їх у пам'яті цілком.",
    ],
    code: [
      String.raw`<?php
function average(array $nums): int
{
    assert(count($nums) > 0, "список не порожній");
    $avg = intdiv(array_sum($nums), count($nums));
    assert($avg >= min($nums) && $avg <= max($nums), "середнє між min і max");
    return $avg;
}

echo average([2, 4, 6]), "\n";
echo average([10, 20]), "\n";`,
      String.raw`<?php
function sqrtInt(int $n): int
{
    assert($n >= 0, "n не від'ємне");
    return (int) floor(sqrt($n));
}

try {
    echo sqrtInt(17), "\n";
    echo sqrtInt(-4), "\n";
} catch (AssertionError $e) {
    echo "порушено контракт: ", $e->getMessage(), "\n";
}`,
      String.raw`<?php
final class Stack
{
    private array $items = [];

    public function push(int $v): void
    {
        $this->items[] = $v;
        assert(count($this->items) > 0, "після push стек не порожній");
    }

    public function pop(): int
    {
        assert($this->items !== [], "pop із порожнього стека");
        return array_pop($this->items);
    }
}

$s = new Stack();
$s->push(1);
$s->push(2);
echo $s->pop(), $s->pop(), "\n";

try {
    $s->pop();
} catch (AssertionError $e) {
    echo "AssertionError: ", $e->getMessage(), "\n";
}

try {
    assert(false, new InvalidArgumentException("власний тип"));
} catch (InvalidArgumentException $e) {
    echo "кинуто власне: ", $e->getMessage(), "\n";
}`,
      String.raw`<?php
// аварія: порушення контракту без catch завершує програму
function percent(int $part, int $total): int
{
    assert($total > 0, "всього має бути додатнім");
    return intdiv($part * 100, $total);
}

echo percent(1, 4), "\n";
echo percent(1, 0), "\n";`,
      String.raw`<?php
echo "assert вимкнено на льоту: ";
ini_set("zend.assertions", "0");
assert(false, "цього не буде видно");
echo "програма пішла далі\n";

ini_set("zend.assertions", "1");
try {
    assert(1 + 1 === 3, "арифметика зламалась");
} catch (AssertionError $e) {
    echo "знову ввімкнено: ", $e->getMessage(), "\n";
}`,
    ],
    note: "<code>assert()</code> кидає <code>AssertionError</code>, коли контракт порушено, але його вмикає директива <code>zend.assertions</code>, у проді зазвичай <code>-1</code>. Тому перевіряйте ним помилки програмування, а не дані користувача, і без побічних дій у аргументі.",
    work: "У внутрішніх функціях ставлять передумови й постумови, щоб порушене припущення виявилося в розробці та на CI з увімкненими перевірками. Вхідні дані користувача натомість перевіряють звичайними <code>if</code> та виключеннями.",
    tasks: [
      "Яка директива вмикає чи вимикає перевірки assert і яке значення типове в проді?",
      "Чому assert не годиться для валідації даних користувача?",
    ],
  },
];
