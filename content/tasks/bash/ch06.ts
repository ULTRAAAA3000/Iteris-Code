// Практичні завдання глави «Текстові конвеєри» (уроки 44–59). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
// Завдання bash-pipes-log, bash-text-processing і bash-ssh-config перенесено зі старого курсу з тими самими id, щоб не втратити прогрес.
// Сортування скрізь із LC_ALL=C, а імена й значення в даних латиницею там, де утиліта працює з байтами (tr, wc -w).
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "bash-pipes-log", lesson: "bash/44", xp: 20,
    title: "Конвеєр: аналіз журналу",
    context: "Сила командного рядка в конвеєрах: кожна команда робить одну просту справу, а | передає результат далі. Так за секунди відповідають на питання «що найчастіше ламається» без жодної програми.",
    brief: [
      "У змінній <code>LOG</code> лежить журнал. Виведіть кількість рядків з помилками (<code>grep -c '^ERROR'</code>).",
      "Потім виведіть, які повідомлення помилок зустрічаються і скільки разів, від найчастішого: <code>grep '^ERROR'</code>, <code>cut -d' ' -f2-</code> (відкинути слово ERROR), <code>sort</code>, <code>uniq -c</code>, <code>sort -rn</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
LOG='INFO start
ERROR disk full
INFO ok
ERROR timeout
WARN slow
ERROR disk full'

# TODO 1: скільки рядків ERROR
# TODO 2: частота повідомлень ERROR (від найчастішого)
echo "$LOG"
`,
    checks: [
      { on: "stdout", name: "Рядків ERROR: 3", has: "3\n", hint: "echo \"$LOG\" | grep -c '^ERROR' друкує кількість рядків, що починаються з ERROR." },
      { on: "stdout", name: "disk full двічі, timeout один раз", matches: "(?:^|\\n)3\\n\\s*2 disk full\\n\\s*1 timeout$", hint: "Після числа 3 виведіть таблицю: grep | cut -d' ' -f2- | sort | uniq -c | sort -rn." },
      { on: "source", name: "Використано конвеєр з uniq -c", matches: "\\|[^\\n]*uniq\\s+-c", hint: "Повтори рахує uniq -c, а перед ним потрібен sort." },
    ],
  },
  {
    ...base, id: "bash-grep-basic", lesson: "bash/45", xp: 20,
    title: "grep: кількість, регістр і інверсія",
    context: "Три ключі grep покривають більшість повсякденних запитів до журналу: -c рахує збіги, -i ігнорує регістр, а -v разом з -n показує пронумеровані рядки, що шаблону не відповідають.",
    brief: [
      "У змінній <code>LOG</code> шість рядків. Виведіть: кількість рядків із <code>ERROR</code> (<code>grep -c</code>), кількість рядків зі словом <code>info</code> у будь-якому регістрі (<code>grep -ci</code>) і пронумеровані рядки, у яких <b>немає</b> <code>INFO</code> (<code>grep -vn</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
LOG='INFO start
ERROR disk full
INFO ok
WARN slow
ERROR timeout
info lower'

# TODO 1: grep -c ERROR
# TODO 2: grep -ci info
# TODO 3: grep -vn INFO
`,
    checks: [
      { on: "stdout", name: "Два рядки з ERROR і три з info", has: "2\n3", hint: "grep -c ERROR дає 2, а grep -ci info (без урахування регістру) дає 3." },
      { on: "stdout", name: "Пронумеровані рядки без INFO", has: "2:ERROR disk full\n4:WARN slow\n5:ERROR timeout\n6:info lower", hint: "-v інвертує вибір, -n додає номери; рядок «info lower» не містить великого INFO." },
      { on: "stdout", name: "Рівно шість рядків", equals: "2\n3\n2:ERROR disk full\n4:WARN slow\n5:ERROR timeout\n6:info lower", hint: "Порядок: -c ERROR, -ci info, -vn INFO." },
      { on: "source", name: "Використано -c, -i і -v", matches: "grep\\s+-c[\\s\\S]*grep\\s+-ci[\\s\\S]*grep\\s+-vn", hint: "Потрібні три окремі виклики grep з ключами -c, -ci та -vn." },
    ],
  },
  {
    ...base, id: "bash-grep-regex", lesson: "bash/46", xp: 20,
    title: "grep -E і -o: відбір і вилучення",
    context: "Регулярні вирази описують форму тексту. Розширений режим -E дозволяє писати класи й повтори без екранування, а -o друкує лише збіглу частину: так з довільного рядка дістають числа чи коди.",
    brief: [
      "Із змінної <code>LOG</code> виведіть рядки, що закінчуються кодом відповіді 4xx або 5xx (<code>grep -E ' [45][0-9]{2}$'</code>), потім кількість рядків із кодом 200 (<code>grep -cE ' 200$'</code>).",
      "Із рядка <code>order 123 shipped 45 items</code> витягніть усі числа через <code>grep -Eo '[0-9]+'</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
LOG='GET /a 200
GET /b 404
POST /c 500
GET /d 200'

# TODO 1: рядки з кодом 4xx або 5xx
# TODO 2: кількість рядків із кодом 200
# TODO 3: числа з рядка "order 123 shipped 45 items" (grep -Eo)
`,
    checks: [
      { on: "stdout", name: "Помилкові запити", has: "GET /b 404\nPOST /c 500", hint: "Шаблон ' [45][0-9]{2}$' збігається з кодом 4xx чи 5xx наприкінці рядка." },
      { on: "stdout", name: "Два запити з кодом 200", has: "500\n2", hint: "grep -cE ' 200$' рахує рядки замість того, щоб друкувати їх." },
      { on: "stdout", name: "Числа з рядка", equals: "GET /b 404\nPOST /c 500\n2\n123\n45", hint: "grep -Eo '[0-9]+' друкує кожне число окремим рядком." },
      { on: "source", name: "Використано grep -E і -o", matches: "grep\\s+-[a-zA-Z]*E[\\s\\S]*grep\\s+-[a-zA-Z]*o", hint: "Розширені вирази — -E, вилучення збігу — -o (можна -Eo)." },
    ],
  },
  {
    ...base, id: "bash-cut-tr", lesson: "bash/47", xp: 20,
    title: "cut і tr: стовпці, регістр, пробіли",
    context: "Cut вирізає стовпці за роздільником, а tr змінює символи: регістр, коми, повтори пробілів. Разом вони готують дані до сортування й підрахунку.",
    brief: [
      "У змінній <code>DATA</code> три рядки формату <code>ім'я,вік,місто</code>. Виведіть другий стовпець (<code>cut -d, -f2</code>), потім третій у верхньому регістрі (<code>cut</code> і <code>tr 'a-z' 'A-Z'</code>).",
      "Наприкінці зведіть повтори пробілів у рядку <code>a   b    c</code> до одного (<code>tr -s ' '</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
DATA='olena,30,kyiv
bohdan,25,lviv
ira,17,dnipro'

# TODO 1: другий стовпець
# TODO 2: третій стовпець великими літерами
# TODO 3: echo "a   b    c" | tr -s ' '
`,
    checks: [
      { on: "stdout", name: "Вік зі стовпця 2", has: "30\n25\n17", hint: "echo \"$DATA\" | cut -d, -f2." },
      { on: "stdout", name: "Міста великими літерами", has: "KYIV\nLVIV\nDNIPRO", hint: "cut -d, -f3 | tr 'a-z' 'A-Z'." },
      { on: "stdout", name: "Рівно сім рядків", equals: "30\n25\n17\nKYIV\nLVIV\nDNIPRO\na b c", hint: "Порядок: вік, міста, рядок із зведеними пробілами." },
      { on: "source", name: "Використано cut і tr", matches: "\\bcut\\b[\\s\\S]*\\btr\\b", hint: "Потрібні і cut, і tr." },
    ],
  },
  {
    ...base, id: "bash-sort", lesson: "bash/48", xp: 20,
    title: "sort: числа за спаданням і за назвою",
    context: "Сортування за стовпцем із кількома ключами дає повністю передбачуваний порядок: спершу числа за спаданням, а за рівних значень за алфавітом. LC_ALL=C захищає від різниці локалей.",
    brief: [
      "У змінній <code>DATA</code> лежать пари <code>назва,кількість</code>. Відсортуйте їх за кількістю за спаданням (числово), а за рівної кількості за назвою за алфавітом: <code>LC_ALL=C sort -t, -k2,2nr -k1,1</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
DATA='pear,10
apple,9
fig,100
kiwi,9'

# TODO: LC_ALL=C sort -t, -k2,2nr -k1,1
echo "$DATA"
`,
    checks: [
      { on: "stdout", name: "Найбільша кількість першою", has: "fig,100\npear,10", hint: "-k2,2nr сортує за другим полем числово за спаданням: 100, 10, 9, 9." },
      { on: "stdout", name: "Рівні кількості за алфавітом", equals: "fig,100\npear,10\napple,9\nkiwi,9", hint: "Другий ключ -k1,1 розставляє apple перед kiwi." },
      { on: "source", name: "Використано sort -t, з ключами", matches: "sort\\s+-t,\\s+-k2,2nr\\s+-k1,1", hint: "Команда: LC_ALL=C sort -t, -k2,2nr -k1,1." },
    ],
  },
  {
    ...base, id: "bash-uniq-wc", lesson: "bash/49", xp: 20,
    title: "uniq, wc і head: статистика слів",
    context: "Для списку слів корисно знати, скільки з них різних, скільки всього й яке найчастіше. Ці три питання вирішують sort, uniq -c, wc і head без жодного скрипта.",
    brief: [
      "У змінній <code>WORDS</code> слова розділено пробілами. Виведіть кількість різних слів (<code>tr ' ' '\\n' | sort -u | wc -l</code>), загальну кількість слів (<code>wc -w</code>) і найчастіше слово.",
      "Найчастіше слово: <code>tr</code>, <code>sort</code>, <code>uniq -c</code>, <code>sort -rn</code>, <code>head -n 1</code>, а потім <code>tr -s ' ' | cut -d' ' -f3</code>, щоб відкинути лічильник і пробіли.",
    ],
    starter: sh`#!/usr/bin/env bash
WORDS='b a b c a b'

# TODO 1: кількість різних слів
# TODO 2: загальна кількість слів
# TODO 3: найчастіше слово
`,
    checks: [
      { on: "stdout", name: "Три різні слова, шість усього", has: "3\n6", hint: "sort -u лишає унікальні, wc -l їх рахує; wc -w рахує всі слова." },
      { on: "stdout", name: "Найчастіше слово b", equals: "3\n6\nb", hint: "sort | uniq -c | sort -rn | head -n 1 | tr -s ' ' | cut -d' ' -f3." },
      { on: "source", name: "Використано uniq -c", matches: "uniq\\s+-c", hint: "Частоту рахує uniq -c після sort." },
    ],
  },
  {
    ...base, id: "bash-sed-replace", lesson: "bash/50", xp: 20,
    title: "sed: формат дати з групами",
    context: "Перебудова формату — типове завдання для sed: групи у круглих дужках фіксують частини збігу, а \\1, \\2, \\3 вставляють їх у новому порядку. Так ISO-дата перетворюється на звичну.",
    brief: [
      "У змінній <code>LOG</code> два рядки зі датами у форматі <code>2026-11-27</code>. Перетворіть їх на <code>27.11.2026</code> командою <code>sed -E</code> з трьома групами й зворотними посиланнями <code>\\3.\\2.\\1</code>. Решта рядка має лишитися без змін.",
    ],
    starter: sh`#!/usr/bin/env bash
LOG='2026-11-27 ERROR disk full
2026-11-28 WARN slow'

# TODO: sed -E 's/(рік)-(місяць)-(день)/день.місяць.рік/'
echo "$LOG"
`,
    checks: [
      { on: "stdout", name: "Перший рядок із новою датою", has: "27.11.2026 ERROR disk full", hint: "s/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3.\\2.\\1/ ставить день першим." },
      { on: "stdout", name: "Обидва рядки", equals: "27.11.2026 ERROR disk full\n28.11.2026 WARN slow", hint: "Заміна застосовується до кожного рядка потоку." },
      { on: "source", name: "Використано sed -E із зворотними посиланнями", matches: "sed\\s+-E[^\\n]*\\\\3", hint: "Після ключа -E групи пишуть без слешів, а в заміні \\3.\\2.\\1." },
    ],
  },
  {
    ...base, id: "bash-sed-ranges", lesson: "bash/51", xp: 25,
    title: "sed: чистка конфігу й вибір рядка",
    context: "Адреси обмежують дію sed потрібними рядками. Видалення коментарів і порожніх рядків готує конфіг до розбору, а -n з p друкує лише вибраний рядок.",
    brief: [
      "У змінній <code>CONFIG</code> лежить конфіг із коментарями й порожнім рядком. Виведіть його без коментарів (<code>/^#/d</code>) і порожніх рядків (<code>/^$/d</code>) за допомогою двох <code>-e</code>.",
      "Потім виведіть лише другий рядок очищеного конфігу: <code>sed -n '2p'</code> у продовженні конвеєра.",
    ],
    starter: sh`#!/usr/bin/env bash
CONFIG='# comment
host=localhost

port=8080
# another
debug=true'

# TODO 1: sed -e '/^#/d' -e '/^$/d'
# TODO 2: те саме, а потім sed -n '2p'
echo "$CONFIG"
`,
    checks: [
      { on: "stdout", name: "Конфіг без коментарів і порожніх рядків", has: "host=localhost\nport=8080\ndebug=true", hint: "Адреса /^#/ вибирає коментарі, /^$/ — порожні рядки, d видаляє їх." },
      { on: "stdout", name: "Далі друкується другий рядок", equals: "host=localhost\nport=8080\ndebug=true\nport=8080", hint: "Другий рядок очищеного конфігу: ... | sed -n '2p'." },
      { on: "source", name: "Використано два -e і sed -n", matches: "-e[\\s\\S]*-e[\\s\\S]*sed\\s+-n", hint: "Дві команди видалення через -e -e, а вибір рядка — окремим sed -n '2p'." },
    ],
  },
  {
    ...base, id: "bash-text-processing", lesson: "bash/52", xp: 20,
    title: "awk, cut і paste: розбір CSV",
    context: "awk читає текст по рядках і полях, тож порахувати суму стовпця чи вибрати колонки можна одним рядком. Це швидше, ніж вантажити таблицю в редактор, і працює на сервері, де редактора немає.",
    brief: [
      "У змінній <code>DATA</code> лежить CSV (перший рядок це заголовок). Виведіть загальну вартість: сума <code>qty * price</code> по всіх рядках, окрім заголовка (<code>awk -F,</code>, <code>NR &gt; 1</code>).",
      "Другим рядком виведіть назви товарів (перший стовпець без заголовка) через кому: <code>cut</code>, <code>tail -n +2</code> та <code>paste -sd,</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
DATA='name,qty,price
хліб,2,25
сир,1,180
молоко,3,42'

# TODO 1: сума qty * price (awk -F, 'NR>1 ...')
# TODO 2: назви товарів через кому
echo "$DATA" | head -n 1
`,
    checks: [
      { on: "stdout", name: "Загальна вартість: 356", has: "356", hint: "awk -F, 'NR>1 { s += $2 * $3 } END { print s }' пропускає заголовок і накопичує добуток." },
      { on: "stdout", name: "Назви через кому: хліб,сир,молоко", has: "хліб,сир,молоко", hint: "cut -d, -f1 | tail -n +2 | paste -sd, - дає назви через кому." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "356\nхліб,сир,молоко", hint: "Спершу сума, потім назви: два рядки." },
      { on: "source", name: "Використано awk", matches: "\\bawk\\b", hint: "Суму рахуйте через awk." },
    ],
  },
  {
    ...base, id: "bash-awk-report", lesson: "bash/53", xp: 25,
    title: "awk: BEGIN, END і підсумки",
    context: "За один прохід awk накопичує кількість, суму й максимум, а в блоці END друкує звіт. Змінні стартують із нуля, тому жодних оголошень не потрібно.",
    brief: [
      "У змінній <code>DATA</code> лежать рядки <code>назва кількість ціна</code>. Однією програмою awk виведіть три рядки: <code>items: 3</code> (кількість рядків, <code>NR</code>), <code>total: 356</code> (сума <code>$2 * $3</code>) і <code>most expensive: cheese</code> (назва з найбільшою ціною).",
    ],
    starter: sh`#!/usr/bin/env bash
DATA='bread 2 25
cheese 1 180
milk 3 42'

# TODO: echo "$DATA" | awk '... END { print "items:", NR; print "total:", total; print "most expensive:", name }'
echo "$DATA"
`,
    checks: [
      { on: "stdout", name: "Кількість і сума", has: "items: 3\ntotal: 356", hint: "{ total += $2 * $3 } накопичує суму, а NR у END дає кількість рядків." },
      { on: "stdout", name: "Найдорожчий товар", has: "most expensive: cheese", hint: "$3 > max { max = $3; name = $1 } запам'ятовує найбільшу ціну й назву." },
      { on: "stdout", name: "Рівно три рядки", equals: "items: 3\ntotal: 356\nmost expensive: cheese", hint: "Три рядки в порядку items, total, most expensive." },
      { on: "source", name: "Використано awk із END", matches: "\\bawk\\b[\\s\\S]*\\bEND\\b", hint: "Підсумки друкуйте в блоці END." },
    ],
  },
  {
    ...base, id: "bash-ssh-config", lesson: "bash/54", xp: 30,
    title: "Команда ssh із конфігурації",
    context: "Файл ~/.ssh/config зберігає імена серверів, користувачів і порти, щоб замість довгої команди писати ssh web. Тут мережі немає, тому тренуємо розбір такого конфігу: із тексту збираємо рядок команди.",
    brief: [
      "Допишіть функцію <code>ssh_cmd</code>: за ім'ям вузла (<code>$1</code>) знайдіть у змінній <code>CONFIG</code> його <code>HostName</code>, <code>User</code> і <code>Port</code> (якщо порту немає, то <code>22</code>) і виведіть <code>ssh -p &lt;порт&gt; &lt;користувач&gt;@&lt;хост&gt;</code>.",
      "Підказка: <code>awk -v h=\"$1\"</code> із ознакою «ми всередині потрібного блоку Host».",
    ],
    starter: sh`#!/usr/bin/env bash
CONFIG='Host web
  HostName 203.0.113.10
  User deploy
  Port 2222
Host db
  HostName 203.0.113.20
  User admin'

ssh_cmd() {
  # TODO: awk по CONFIG: зібрати ssh -p <порт> <user>@<host>
  echo "?"
}

ssh_cmd web
ssh_cmd db
`,
    checks: [
      { on: "stdout", name: "web: ssh -p 2222 deploy@203.0.113.10", has: "ssh -p 2222 deploy@203.0.113.10", hint: "Рядок Host вмикає прапорець on, якщо $2 дорівнює шуканому вузлу; далі читайте HostName, User, Port, поки on істинний." },
      { on: "stdout", name: "db: порт за замовчуванням 22", has: "ssh -p 22 admin@203.0.113.20", hint: "У блоці db порту немає: у END напишіть if (port == \"\") port = 22." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ssh -p 2222 deploy@203.0.113.10\nssh -p 22 admin@203.0.113.20", hint: "Два рядки: спершу web, потім db." },
      { on: "source", name: "Конфіг розбирається через awk", matches: "\\bawk\\b", hint: "Розбір блоків зручно робити через awk -v h=\"$1\"." },
    ],
  },
  {
    ...base, id: "bash-find-xargs", lesson: "bash/55", xp: 20,
    title: "find і xargs: безпечне видалення",
    context: "Пошук за маскою й масова дія над знайденим — основа обслуговування файлів. Пара -print0 і xargs -0 безпечна для імен із пробілами, а список слід переглянути до видалення.",
    brief: [
      "У тимчасовій папці вже створено <code>a.log</code>, <code>my notes.log</code>, <code>sub/b.log</code> і <code>c.txt</code>. Спершу виведіть відсортований список логів (<code>find . -name '*.log' -type f | sort</code>).",
      "Потім видаліть їх усі через <code>-print0 | xargs -0 rm</code> і виведіть файли, що лишилися (<code>find . -type f | sort</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
mkdir sub
touch a.log "my notes.log" sub/b.log c.txt

# TODO 1: список .log-файлів (find | sort)
# TODO 2: видалити їх (find -print0 | xargs -0 rm)
# TODO 3: список файлів, що лишилися
`,
    checks: [
      { on: "stdout", name: "Усі три логи, зокрема з пробілом", has: "./a.log\n./my notes.log\n./sub/b.log", hint: "find . -name '*.log' -type f знаходить логи в усіх підпапках." },
      { on: "stdout", name: "Лишився тільки c.txt", equals: "./a.log\n./my notes.log\n./sub/b.log\n./c.txt", hint: "Після видалення логів find . -type f | sort друкує лише ./c.txt." },
      { on: "source", name: "Безпечна пара -print0 і xargs -0", matches: "-print0[^\\n]*xargs\\s+-0", hint: "Для імен із пробілами: find ... -print0 | xargs -0 rm." },
    ],
  },
  {
    ...base, id: "bash-join-comm", lesson: "bash/56", xp: 25,
    title: "join і comm: об'єднання й порівняння",
    context: "Join зливає два відсортовані файли за ключем, а comm показує спільне й унікальне в двох відсортованих списках. Обидві команди мовчки помиляються на несортованих даних.",
    brief: [
      "У тимчасовій папці вже є <code>users.txt</code> (<code>id ім'я</code>), <code>ages.txt</code> (<code>id вік</code>), <code>a.txt</code> та <code>b.txt</code> (відсортовані списки). Виведіть <code>join users.txt ages.txt</code>.",
      "Потім <code>LC_ALL=C comm -12 a.txt b.txt</code> (спільні рядки) і <code>LC_ALL=C comm -23 a.txt b.txt</code> (лише в першому).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf '%s\n' "1 olena" "2 bohdan" "3 ira" > users.txt
printf '%s\n' "1 30" "2 25" "3 17" > ages.txt
printf '%s\n' x y z > a.txt
printf '%s\n' w y z > b.txt

# TODO 1: join users.txt ages.txt
# TODO 2: comm -12 (спільні) і comm -23 (лише в a.txt)
`,
    checks: [
      { on: "stdout", name: "Злиті рядки за ключем", has: "1 olena 30\n2 bohdan 25\n3 ira 17", hint: "join з'єднує рядки з однаковим першим полем." },
      { on: "stdout", name: "Спільні й унікальні", equals: "1 olena 30\n2 bohdan 25\n3 ira 17\ny\nz\nx", hint: "comm -12 дає y і z, comm -23 дає x." },
      { on: "source", name: "Використано join і comm", matches: "\\bjoin\\b[\\s\\S]*\\bcomm\\s+-12[\\s\\S]*\\bcomm\\s+-23", hint: "Потрібні join, comm -12 і comm -23." },
    ],
  },
  {
    ...base, id: "bash-redirect-stderr", lesson: "bash/57", xp: 25,
    title: "stderr окремо від stdout і tee",
    context: "Результат і діагностика мають окремі канали, тому їх можна зберігати в різні файли. Команда tee дублює потік, дозволяючи і зберегти проміжний результат, і передати його далі.",
    brief: [
      "У тимчасовій папці виконайте групу <code>{ echo \"ok\"; ls no_such_file; }</code> так, щоб stdout потрапив у <code>out.txt</code>, а stderr у <code>err.txt</code>. Виведіть кількість рядків у кожному (<code>wc -l &lt; файл</code>).",
      "Потім конвеєром <code>printf '%s\\n' a b | tee copy.txt | wc -l</code> порахуйте рядки й ще раз виведіть кількість рядків у <code>copy.txt</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: { echo "ok"; ls no_such_file; } > out.txt 2> err.txt
# TODO 2: wc -l < out.txt і wc -l < err.txt
# TODO 3: printf '%s\n' a b | tee copy.txt | wc -l, потім wc -l < copy.txt
`,
    checks: [
      { on: "stdout", name: "По одному рядку в out.txt і err.txt", has: "1\n1", hint: "Групу { ...; } перенаправте двома потоками: > out.txt 2> err.txt." },
      { on: "stdout", name: "tee зберіг копію потоку", equals: "1\n1\n2\n2", hint: "Після tee і лічильника виведіть ще й wc -l < copy.txt: обидва числа 2." },
      { on: "source", name: "Окреме перенаправлення stderr", matches: "2>\\s*err\\.txt", hint: "stderr спрямовують записом 2> err.txt." },
      { on: "source", name: "Використано tee", matches: "\\|\\s*tee\\s+copy\\.txt", hint: "Конвеєр: printf ... | tee copy.txt | wc -l." },
    ],
  },
  {
    ...base, id: "bash-process-subst", lesson: "bash/58", xp: 25,
    title: "Підстановка процесів: порівняння без файлів",
    context: "Підстановка процесів дає вивід команди як файл, тому sort і comm працюють без тимчасових файлів. А цикл, що читає з <code>&lt;( )</code>, лишається в поточній оболонці й зберігає змінні.",
    brief: [
      "У змінних <code>one</code> та <code>two</code> лежать списки. Виведіть спільні рядки (<code>LC_ALL=C comm -12 &lt;(sort &lt;&lt;&lt; \"$one\") &lt;(sort &lt;&lt;&lt; \"$two\")</code>), потім ті, що є лише в першому (<code>comm -23</code>).",
      "Наприкінці порахуйте спільні рядки циклом <code>while read -r _; do ... done &lt; &lt;(...)</code> із лічильником <code>n</code> і виведіть <code>n</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
one=$'b\na\nc'
two=$'c\nd\nb'

# TODO 1: comm -12 <(sort <<< "$one") <(sort <<< "$two")
# TODO 2: comm -23 ...
# TODO 3: n=0; while read -r _; do (( n++ )); done < <(comm -12 ...); echo "$n"
`,
    checks: [
      { on: "stdout", name: "Спільні й унікальні рядки", has: "b\nc\na", hint: "comm -12 дає b і c, comm -23 дає a; обидва входи через <( sort ... )." },
      { on: "stdout", name: "Лічильник зберігся після циклу", equals: "b\nc\na\n2", hint: "Цикл читає з < <(...), тому змінна n лишається після done." },
      { on: "source", name: "Використано підстановку процесів", matches: "<\\(", hint: "Вхід для comm задайте так: <(sort <<< \"$one\")." },
      { on: "source", name: "Цикл читає з < <( )", matches: "done\\s*<\\s*<\\(", hint: "Для збереження змінної: done < <(команда)." },
    ],
  },
  {
    ...base, id: "bash-log-report", lesson: "bash/59", xp: 30,
    title: "Звіт із журналу доступу",
    context: "Типовий звіт під час інциденту: скільки запитів, які коди відповіді домінують, яка сторінка найпопулярніша й скільки різних клієнтів. Кожен підсумок це окремий невеликий конвеєр на awk і sort.",
    brief: [
      "У змінній <code>LOG</code> шість рядків формату <code>IP метод шлях код</code>. Виведіть звіт: <code>запитів: 6</code>; по рядку <code>код: кількість</code> для кожного коду (від найчастішого, за рівної кількості за кодом); <code>топ шлях: /home (3)</code>; <code>унікальних IP: 3</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
LOG='10.0.0.1 GET /home 200
10.0.0.2 GET /about 200
10.0.0.1 GET /home 200
10.0.0.3 POST /login 500
10.0.0.2 GET /home 404
10.0.0.1 GET /about 200'

# TODO: запитів, розподіл за кодами, топ шлях, унікальні IP
echo "$LOG" | head -n 1
`,
    checks: [
      { on: "stdout", name: "Кількість запитів", has: "запитів: 6", hint: "echo \"$LOG\" | awk 'END { print \"запитів:\", NR }'." },
      { on: "stdout", name: "Розподіл за кодами", has: "200: 4\n404: 1\n500: 1", hint: "awk { c[$4]++ } END { for (k in c) print k \": \" c[k] } і sort -t: -k2,2nr -k1,1." },
      { on: "stdout", name: "Топ шлях і унікальні IP", has: "топ шлях: /home (3)\nунікальних IP: 3", hint: "Частоти шляхів: awk { p[$3]++ }, потім sort -k1,1nr -k2 | head -n 1; унікальні IP: awk '{print $1}' | sort -u | wc -l." },
      { on: "stdout", name: "Повний звіт", equals: "запитів: 6\n200: 4\n404: 1\n500: 1\nтоп шлях: /home (3)\nунікальних IP: 3", hint: "Порядок рядків: запитів, коди, топ шлях, унікальні IP." },
      { on: "source", name: "Використано awk", matches: "\\bawk\\b", hint: "Підсумки зручно рахувати через awk." },
    ],
  },
];
