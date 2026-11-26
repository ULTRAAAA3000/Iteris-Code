// Практичні завдання глави «Змінні, лапки й підстановки» (уроки 6–17). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "bash-variables-basic", lesson: "bash/6", xp: 15,
    title: "Змінні: привітання за шаблоном",
    context: "Скрипти тримають у змінних імена, пороги й шляхи, щоб змінити їх в одному місці. Головне правило Bash: у присвоєнні немає пробілів навколо знака дорівнює, а ім'я від суфікса відділяють фігурні дужки.",
    brief: [
      "Задайте змінні <code>name=Олена</code> і <code>count=3</code> та виведіть рядок <code>Привіт, Олена! Завдань: 3</code>, підставивши значення змінних.",
      "Другим рядком виведіть ім'я з суфіксом <code>_v2</code>: <code>Олена_v2</code>. Тут потрібні фігурні дужки, щоб оболонка не шукала змінну <code>name_v2</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: name=Олена і count=3, потім echo "Привіт, ...! Завдань: ..."
# TODO 2: виведіть ім'я з суфіксом _v2 (фігурні дужки)
`,
    checks: [
      { on: "stdout", name: "Привітання зі значеннями змінних", has: "Привіт, Олена! Завдань: 3", hint: "echo \"Привіт, $name! Завдань: $count\" після присвоєнь name=Олена та count=3." },
      { on: "stdout", name: "Ім'я із суфіксом _v2", has: "Олена_v2", hint: "Напишіть echo \"${name}_v2\": дужки відокремлюють ім'я змінної від _v2." },
      { on: "stdout", name: "Рівно два рядки", equals: "Привіт, Олена! Завдань: 3\nОлена_v2", hint: "Виведіть два рядки в такому порядку, без зайвого." },
      { on: "source", name: "Змінна name задана без пробілів навколо =", matches: "(^|\\n)name=", hint: "Присвоєння пишуть щільно: name=Олена, без пробілів навколо =." },
      { on: "source", name: "Використано ${name}", matches: "\\$\\{name\\}", hint: "Суфікс після імені змінної вимагає фігурних дужок: ${name}_v2." },
    ],
  },
  {
    ...base, id: "bash-quotes", lesson: "bash/7", xp: 15,
    title: "Лапки: рентген аргументів",
    context: "Змінна без лапок розпадається на слова за пробілами, і команда отримує зовсім не те, що ви мали на увазі. Правильні лапки рятують від цілого класу помилок з іменами файлів.",
    brief: [
      "У заготовці <code>printf '[%s]\\n' $file</code> показує, що змінна без лапок розпалась на два слова. Виправте рядок так, щоб вивелося одне слово: <code>[my notes.txt]</code>.",
      "Далі виведіть буквально <code>$HOME</code> (одинарні лапки), а потім рядок <code>Ціна: $5</code>, екранувавши знак долара зворотним слешем у подвійних лапках.",
    ],
    starter: sh`#!/usr/bin/env bash
file="my notes.txt"
printf '[%s]\n' $file

# TODO 2: виведіть буквально $HOME
# TODO 3: виведіть Ціна: $5 (екрануйте долар)
`,
    checks: [
      { on: "stdout", name: "Назва файла лишилась одним словом", has: "[my notes.txt]", hint: "Візьміть змінну в подвійні лапки: \"$file\"." },
      { on: "stdout", name: "$HOME виведено буквально", has: "$HOME", hint: "В одинарних лапках нічого не розкривається: echo '$HOME'." },
      { on: "stdout", name: "Три рядки без зайвого", equals: "[my notes.txt]\n$HOME\nЦіна: $5", hint: "Мають бути три рядки: [my notes.txt], $HOME і Ціна: $5." },
      { on: "source", name: "Змінна file взята в лапки", matches: "printf\\s+'\\[%s\\]\\\\n'\\s+\"\\$file\"", hint: "Рядок printf має виглядати так: printf '[%s]\\n' \"$file\"." },
      { on: "source", name: "Долар екрановано", matches: "\\\\\\$5", hint: "У подвійних лапках знак долара захищає зворотний слеш: \\$5." },
    ],
  },
  {
    ...base, id: "bash-command-substitution", lesson: "bash/8", xp: 20,
    title: "Підстановка команд: підрахунок і вибір",
    context: "Скрипти постійно підхоплюють результат команди: кількість рядків, перше значення, версію. Підстановка $(…) перетворює вивід програми на значення змінної, яке можна друкувати й порівнювати.",
    brief: [
      "У змінній <code>LIST</code> лежить три рядки. Через підстановку команд збережіть у <code>count</code> кількість рядків (<code>echo \"$LIST\" | wc -l</code>), а в <code>first</code> перший рядок після сортування (<code>sort</code> і <code>head -n 1</code>).",
      "Виведіть <code>Рядків: 3</code> та <code>Перший: apple</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
LIST='banana
apple
cherry'

# TODO: count=$(...) кількість рядків; first=$(...) перший рядок після sort
echo "Рядків: ?"
echo "Перший: ?"
`,
    checks: [
      { on: "stdout", name: "Кількість рядків: 3", has: "Рядків: 3", hint: "count=$(echo \"$LIST\" | wc -l), потім echo \"Рядків: $count\"." },
      { on: "stdout", name: "Перший після сортування: apple", has: "Перший: apple", hint: "first=$(echo \"$LIST\" | sort | head -n 1)." },
      { on: "stdout", name: "Рівно два рядки", equals: "Рядків: 3\nПерший: apple", hint: "Виведіть лише два рядки: кількість і перший." },
      { on: "source", name: "Використано підстановку $( )", matches: "=\\$\\(", hint: "Присвоєння має виглядати як змінна=$(команда)." },
    ],
  },
  {
    ...base, id: "bash-arithmetic", lesson: "bash/9", xp: 20,
    title: "Арифметика: п'ять дій над двома числами",
    context: "Лічильники, відсотки й розміри в скриптах рахують цілими числами прямо в оболонці. Результат ділення тут усікається, і важливо це бачити на власному виводі, щоб не чекати дробів.",
    brief: [
      "Для <code>a=17</code> та <code>b=5</code> виведіть п'ять рядків у вигляді <code>17 + 5 = 22</code>: сума, різниця, добуток, цілий результат ділення й остача.",
      "Результати обчислюйте через <code>$(( ))</code>, а не вписуйте числа руками.",
    ],
    starter: sh`#!/usr/bin/env bash
a=17
b=5
# TODO: п'ять рядків, наприклад: echo "$a + $b = ..."
echo "$a + $b = ?"
`,
    checks: [
      { on: "stdout", name: "Сума й різниця", has: "17 + 5 = 22\n17 - 5 = 12", hint: "echo \"$a + $b = $((a + b))\", потім те саме з мінусом." },
      { on: "stdout", name: "Добуток", has: "17 * 5 = 85", hint: "Вираз $((a * b)) у подвійних лапках зірочку не розкриє." },
      { on: "stdout", name: "Ціле ділення й остача", has: "17 / 5 = 3\n17 % 5 = 2", hint: "Ділення в Bash цілочислове: 17 / 5 дає 3, остача записується через %." },
      { on: "stdout", name: "Рівно п'ять рядків", equals: "17 + 5 = 22\n17 - 5 = 12\n17 * 5 = 85\n17 / 5 = 3\n17 % 5 = 2", hint: "Порядок: сума, різниця, добуток, частка, остача." },
      { on: "source", name: "Обчислення через $(( ))", matches: "\\$\\(\\(", hint: "Числа мають рахуватися виразом $((a + b)), а не вписуватися вручну." },
    ],
  },
  {
    ...base, id: "bash-env-path", lesson: "bash/10", xp: 20,
    title: "export і PATH",
    context: "Змінна середовища видна дочірнім процесам лише після export. PATH це список папок, у яких шукаються команди: додали свою папку, і ваші утиліти запускаються за іменем.",
    brief: [
      "Експортуйте змінну <code>GREETING</code> зі значенням <code>Привіт</code>, щоб її бачив дочірній процес <code>bash -c</code>.",
      "Додайте <code>/opt/tools/bin</code> у кінець <code>PATH</code> (<code>PATH=\"$PATH:/opt/tools/bin\"</code>). Перевірка внизу вже написана.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO: GREETING=Привіт з export; додати /opt/tools/bin до PATH

bash -c 'echo "У підоболонці: $GREETING"'

case ":$PATH:" in
  *:/opt/tools/bin:*) echo "PATH містить /opt/tools/bin" ;;
  *) echo "PATH не містить /opt/tools/bin" ;;
esac
`,
    checks: [
      { on: "stdout", name: "Підоболонка бачить GREETING", has: "У підоболонці: Привіт", hint: "Без export дочірній процес змінну не побачить: export GREETING=Привіт." },
      { on: "stdout", name: "PATH містить /opt/tools/bin", has: "PATH містить /opt/tools/bin", hint: "Допишіть папку в кінець: PATH=\"$PATH:/opt/tools/bin\"." },
      { on: "source", name: "Змінну експортовано", matches: "\\bexport\\b", hint: "Використайте слово export перед змінною." },
      { on: "source", name: "PATH доповнено", matches: "PATH=[\"']?\\$PATH:/opt/tools/bin|PATH=[\"']?\\$\\{PATH\\}:/opt/tools/bin", hint: "Старий PATH треба зберегти: PATH=\"$PATH:/opt/tools/bin\"." },
    ],
  },
  {
    ...base, id: "bash-exit-status", lesson: "bash/11", xp: 20,
    title: "Коди завершення: $? після команд",
    context: "CI й інші скрипти вирішують, що робити далі, за кодом завершення, а не за текстом. Код $? оновлюється після кожної команди, тому його читають одразу або зберігають у змінну.",
    brief: [
      "Виконайте <code>true</code>, <code>false</code> і <code>ls no_such_file 2&gt;/dev/null</code>, а після кожної виведіть код завершення у вигляді <code>true: 0</code>, <code>false: 1</code>, <code>ls: 2</code>.",
      "Потім знову виконайте <code>false</code>, збережіть код у змінну <code>rc</code> і виведіть <code>rc: 1</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO: після true, false і ls no_such_file 2>/dev/null виведіть "<команда>: <код>"
# TODO: false; rc=$?; виведіть "rc: $rc"
`,
    checks: [
      { on: "stdout", name: "Код true дорівнює 0", has: "true: 0", hint: "Одразу після true виконайте echo \"true: $?\"." },
      { on: "stdout", name: "Коди false і ls", has: "false: 1\nls: 2", hint: "Код читайте відразу після команди, бо наступна команда його перезапише." },
      { on: "stdout", name: "Збережений код rc", has: "rc: 1", hint: "false, потім rc=$?, і лише після цього echo \"rc: $rc\"." },
      { on: "stdout", name: "Рівно чотири рядки", equals: "true: 0\nfalse: 1\nls: 2\nrc: 1", hint: "Мають бути чотири рядки в такому порядку." },
      { on: "source", name: "Код збережено присвоєнням rc=$?", matches: "rc=\\$\\?", hint: "Збережіть код присвоєнням rc=$? прямо після false." },
    ],
  },
  {
    ...base, id: "bash-glob", lesson: "bash/12", xp: 20,
    title: "Глоби: відбір файлів за шаблоном",
    context: "Масове видалення логів, копіювання конфігів і обробка всіх CSV у папці спираються на шаблони імен файлів. Їх розкриває оболонка, тому корисно бачити, що саме отримає команда.",
    brief: [
      "У тимчасовій папці вже створено файли <code>a1.txt a2.txt b.txt c.csv d.log</code>. Виведіть <code>printf '%s\\n'</code> з шаблонами: усі <code>.txt</code>, потім ті, що мають вигляд <code>a?.txt</code>, потім усі файли, ім'я яких <b>не</b> починається з <code>a</code> (<code>[!a]*</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch a1.txt a2.txt b.txt c.csv d.log

# TODO 1: printf '%s\n' *.txt
# TODO 2: printf '%s\n' a?.txt
# TODO 3: printf '%s\n' [!a]*
`,
    checks: [
      { on: "stdout", name: "Усі .txt", has: "a1.txt\na2.txt\nb.txt", hint: "printf '%s\\n' *.txt друкує по одному імені в рядок." },
      { on: "stdout", name: "Файли за шаблоном a?.txt", has: "b.txt\na1.txt\na2.txt\nb.txt", hint: "a?.txt збігається з a1.txt і a2.txt, але не з b.txt." },
      { on: "stdout", name: "Усі, що не починаються з a", equals: "a1.txt\na2.txt\nb.txt\na1.txt\na2.txt\nb.txt\nc.csv\nd.log", hint: "Шаблон [!a]* дає b.txt, c.csv, d.log. Загалом має бути вісім рядків." },
      { on: "source", name: "Шаблон з ?", matches: "a\\?\\.txt", hint: "Знак питання замінює рівно один символ: a?.txt." },
      { on: "source", name: "Шаблон із запереченням [!a]", matches: "\\[!a\\]\\*", hint: "[!a]* означає «починається з будь-чого, крім a»." },
    ],
  },
  {
    ...base, id: "bash-brace-expansion", lesson: "bash/13", xp: 20,
    title: "Розкриття дужок: структура проєкту",
    context: "Створення типової структури проєкту й резервної копії файла одним рядком — місце, де розкриття дужок економить найбільше натискань. Воно текстове й працює навіть для файлів, яких ще немає.",
    brief: [
      "У тимчасовій папці одним <code>mkdir -p</code> створіть <code>app/src</code>, <code>app/tests</code> і <code>app/docs</code> (через <code>{src,tests,docs}</code>), а потім створіть файли <code>app/src/main.sh</code> і <code>app/src/util.sh</code> через <code>{main,util}.sh</code>.",
      "Зробіть резервну копію <code>app/src/main.sh</code> трюком <code>{,.bak}</code>. Виведіть <code>ls app</code> і <code>ls app/src</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: mkdir -p app/{src,tests,docs}
# TODO 2: touch app/src/{main,util}.sh
# TODO 3: cp app/src/main.sh{,.bak}
# TODO 4: ls app і ls app/src
`,
    checks: [
      { on: "stdout", name: "Три папки в app", has: "docs\nsrc\ntests", hint: "Після mkdir -p app/{src,tests,docs} команда ls app друкує docs, src, tests." },
      { on: "stdout", name: "Файли в app/src з копією", has: "main.sh\nmain.sh.bak\nutil.sh", hint: "У app/src мають бути main.sh, main.sh.bak і util.sh." },
      { on: "stdout", name: "Рівно шість рядків", equals: "docs\nsrc\ntests\nmain.sh\nmain.sh.bak\nutil.sh", hint: "Спершу ls app, потім ls app/src, без зайвого." },
      { on: "source", name: "Дужки з комами", matches: "\\{[^}]*,[^}]*\\}", hint: "Використайте розкриття на кшталт app/{src,tests,docs}." },
      { on: "source", name: "Копія трюком {,.bak}", matches: "\\{,\\.bak\\}", hint: "cp app/src/main.sh{,.bak} розкривається в cp main.sh main.sh.bak." },
    ],
  },
  {
    ...base, id: "bash-expansion-order", lesson: "bash/14", xp: 25,
    title: "Порядок розкриттів: що побачить команда",
    context: "Коли скрипт поводиться дивно, першою діагностикою є питання, що саме отримала команда після всіх підстановок. Знання порядку розкриттів і дії лапок пояснює більшість таких випадків.",
    brief: [
      "Виведіть <code>{a,b}$n</code> без лапок (дужки розкриються першими, потім змінна): <code>a2 b2</code>. Потім <code>$pattern</code> без лапок (розкриється глобом): <code>a.txt b.txt</code>, і те саме в лапках (залишиться буквальним): <code>*.txt</code>.",
      "Наприкінці виведіть <code>тильда розкрилась</code>, якщо <code>~</code> не дорівнює буквальному рядку <code>\"~\"</code> (<code>[ \"~\" != ~ ] &amp;&amp; echo …</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch a.txt b.txt c.log
n=2
pattern='*.txt'

# TODO 1: echo {a,b}$n
# TODO 2: echo $pattern (без лапок)
# TODO 3: echo "$pattern" (в лапках)
# TODO 4: [ "~" != ~ ] && echo "тильда розкрилась"
`,
    checks: [
      { on: "stdout", name: "Дужки до змінної: a2 b2", has: "a2 b2", hint: "echo {a,b}$n: спершу розкриваються дужки, потім підставляється n." },
      { on: "stdout", name: "Глоб без лапок і буквальний у лапках", has: "a.txt b.txt\n*.txt", hint: "echo $pattern розкриє шаблон, а echo \"$pattern\" залишить зірочку." },
      { on: "stdout", name: "Тильда розкрилась", has: "тильда розкрилась", hint: "[ \"~\" != ~ ] && echo \"тильда розкрилась\": порівнюється буквальна тильда з розкритою." },
      { on: "stdout", name: "Рівно чотири рядки", equals: "a2 b2\na.txt b.txt\n*.txt\nтильда розкрилась", hint: "Чотири рядки в порядку завдання." },
      { on: "source", name: "Змінну pattern взято без лапок хоча б раз", matches: "echo\\s+\\$pattern", hint: "Один раз виведіть $pattern без лапок, щоб побачити розкриття глобом." },
    ],
  },
  {
    ...base, id: "bash-heredoc", lesson: "bash/15", xp: 25,
    title: "Heredoc і here-string: конфіг і підрахунок",
    context: "Heredoc дозволяє записати конфіг чи скрипт прямо з іншого скрипта, а here-string подає змінну на вхід команди без зайвого конвеєра. Лапки навколо маркера вирішують, чи розкриватиметься долар.",
    brief: [
      "У тимчасовій папці створіть <code>config.ini</code> через <code>cat &gt; config.ini &lt;&lt;'EOF'</code> із двома рядками: <code>path=$HOME/bin</code> і <code>mode=fast</code>. Знак долара має потрапити у файл буквально. Виведіть файл через <code>cat</code>.",
      "Порахуйте слова в рядку <code>one two three four</code> (латиницею: <code>wc -w</code> у простій локалі не вважає кириличні байти словами) через here-string: <code>wc -w &lt;&lt;&lt; \"…\"</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: cat > config.ini <<'EOF' ... EOF з рядками path=$HOME/bin і mode=fast
# TODO 2: cat config.ini
# TODO 3: wc -w <<< "one two three four"
`,
    checks: [
      { on: "stdout", name: "Долар у файлі лишився буквальним", has: "path=$HOME/bin\nmode=fast", hint: "Візьміть маркер у лапки: <<'EOF', тоді $HOME не розкриється." },
      { on: "stdout", name: "Чотири слова", equals: "path=$HOME/bin\nmode=fast\n4", hint: "Спершу вміст config.ini, потім число 4 від wc -w <<< \"…\"." },
      { on: "source", name: "Маркер heredoc у лапках", matches: "<<-?\\s*['\"]\\w+['\"]", hint: "Пишіть cat > config.ini <<'EOF' з лапками навколо EOF." },
      { on: "source", name: "Використано here-string", matches: "<<<", hint: "Для останнього кроку: wc -w <<< \"one two three four\"." },
    ],
  },
  {
    ...base, id: "bash-read-ifs", lesson: "bash/16", xp: 25,
    title: "read і IFS: розбір запису",
    context: "Рядки конфігів, CSV і виводу утиліт зручно розкладати по змінних через read з потрібним роздільником. Це швидше за окремий процес cut на кожен рядок, і змінні лишаються в скрипті.",
    brief: [
      "У рядку <code>Олена:30:Дніпро:Python:Go</code> поля розділено двокрапкою. Розкладіть його через <code>IFS=: read -r name age city langs &lt;&lt;&lt; \"…\"</code>.",
      "Виведіть чотири рядки: <code>Ім'я: Олена</code>, <code>Вік: 30</code>, <code>Місто: Дніпро</code>, <code>Мови: Python:Go</code>. Останнє ім'я у <code>read</code> збирає весь залишок рядка.",
    ],
    starter: sh`#!/usr/bin/env bash
record="Олена:30:Дніпро:Python:Go"

# TODO: IFS=: read -r name age city langs <<< "$record"
echo "Ім'я: ?"
echo "Вік: ?"
echo "Місто: ?"
echo "Мови: ?"
`,
    checks: [
      { on: "stdout", name: "Ім'я та вік", has: "Ім'я: Олена\nВік: 30", hint: "Після read виведіть echo \"Ім'я: $name\" і echo \"Вік: $age\"." },
      { on: "stdout", name: "Місто й залишок у langs", has: "Місто: Дніпро\nМови: Python:Go", hint: "Остання змінна отримує весь залишок: Python:Go." },
      { on: "stdout", name: "Рівно чотири рядки", equals: "Ім'я: Олена\nВік: 30\nМісто: Дніпро\nМови: Python:Go", hint: "Чотири рядки в порядку завдання." },
      { on: "source", name: "Роздільник задано через IFS=:", matches: "IFS=:\\s+read", hint: "Присвоєння IFS перед read діє лише на цю команду: IFS=: read -r ..." },
      { on: "source", name: "Використано read -r", matches: "read\\s+-r", hint: "Пишіть read -r, щоб зворотні слеші не пропадали." },
    ],
  },
  {
    ...base, id: "bash-declare", lesson: "bash/17", xp: 25,
    title: "declare: ціле, верхній регістр і readonly",
    context: "Атрибути змінних роблять намір коду видимим: лічильник вважає арифметику, константа не дає себе змінити, а назва завжди великими літерами. Це допомагає ловити помилки на ранньому етапі.",
    brief: [
      "Оголосіть <code>declare -i total=0</code>, додайте <code>total+=5</code>, <code>total+=7</code>, а потім збільште вдвічі через <code>total=\"total * 2\"</code>. Виведіть <code>Сума: 24</code>.",
      "Через <code>declare -u title=iteris</code> виведіть <code>ITERIS</code>. Потім задайте <code>readonly VERSION=1.2</code> і спробуйте змінити її в підоболонці: <code>( VERSION=2 ) 2&gt;/dev/null || echo \"VERSION захищено\"</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: declare -i total=0; total+=5; total+=7; total="total * 2"; echo "Сума: $total"
# TODO 2: declare -u title=iteris; echo "$title"
# TODO 3: readonly VERSION=1.2; ( VERSION=2 ) 2>/dev/null || echo "VERSION захищено"
`,
    checks: [
      { on: "stdout", name: "Сума 24", has: "Сума: 24", hint: "З declare -i присвоєння рахується: 5 + 7 = 12, потім 12 * 2 = 24." },
      { on: "stdout", name: "Назва великими літерами", has: "ITERIS", hint: "declare -u title=iteris перетворює значення на верхній регістр." },
      { on: "stdout", name: "readonly захищає змінну", has: "VERSION захищено", hint: "Присвоєння readonly-змінній у підоболонці дає помилку, тому спрацює || echo." },
      { on: "stdout", name: "Рівно три рядки", equals: "Сума: 24\nITERIS\nVERSION захищено", hint: "Три рядки: сума, назва, повідомлення про захист." },
      { on: "source", name: "Атрибути -i і -u", matches: "declare\\s+-i[\\s\\S]*declare\\s+-u", hint: "Використайте declare -i для суми та declare -u для назви." },
    ],
  },
];
