// Практичні завдання глави «Файли й каталоги» (уроки 60–69). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
// Усе в тимчасовій папці (mktemp -d). Перевірки використовують GNU stat (-c), розміри й права, а не дати чи імена користувачів.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "bash-chmod-umask", lesson: "bash/60", xp: 20,
    title: "chmod: числові й символьні права",
    context: "Права доступу можна задати числом (повний набір) або символами (зміна окремих прав). Спершу задана маска umask визначає, які права мають нові файли: 022 дає звичайним файлам 644.",
    brief: [
      "У тимчасовій папці під <code>umask 022</code> створено файли <code>a</code>, <code>b</code>, <code>c</code> (усі <code>644</code>). Задайте <code>a</code> права <code>600</code> числом, додайте <code>b</code> право виконання власнику (<code>u+x</code>) і зробіть <code>c</code> лише для читання всім (<code>a=r</code>).",
      "Виведіть права всіх трьох командою <code>stat -c %a a b c</code>: має вийти <code>600</code>, <code>744</code>, <code>444</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
umask 022
work=$(mktemp -d)
cd "$work"
touch a b c

# TODO: chmod 600 a; chmod u+x b; chmod a=r c
stat -c %a a b c
`,
    checks: [
      { on: "stdout", name: "Права a, b і c", equals: "600\n744\n444", hint: "a: chmod 600 a, b: chmod u+x b (644 стає 744), c: chmod a=r c." },
      { on: "source", name: "Числовий запис 600", matches: "chmod\\s+600\\s+a", hint: "chmod 600 a: лише власнику читання й запис." },
      { on: "source", name: "Символьні зміни u+x і a=r", matches: "u\\+x[\\s\\S]*a=r", hint: "chmod u+x b і chmod a=r c." },
    ],
  },
  {
    ...base, id: "bash-mktemp", lesson: "bash/61", xp: 20,
    title: "mktemp: безпечний тимчасовий каталог",
    context: "Тимчасовий каталог створюють mktemp -d: він унікальний і недоступний іншим користувачам. Файли всередині теж безпечні, а після роботи за собою треба прибрати.",
    brief: [
      "Створіть тимчасовий каталог <code>d</code> через <code>mktemp -d</code> і виведіть його права (<code>stat -c %a \"$d\"</code>). Усередині створіть файл за шаблоном <code>mktemp \"$d/data.XXXXXX\"</code> і виведіть його права.",
      "Видаліть каталог (<code>rm -rf \"$d\"</code>) і виведіть <code>прибрано</code>, якщо його вже немає.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: d=$(mktemp -d); stat -c %a "$d"
# TODO 2: f=$(mktemp "$d/data.XXXXXX"); stat -c %a "$f"
# TODO 3: rm -rf "$d"; [ -e "$d" ] || echo "прибрано"
`,
    checks: [
      { on: "stdout", name: "Каталог 700, файл 600", has: "700\n600", hint: "mktemp -d створює каталог із правами 700, а mktemp файл із 600." },
      { on: "stdout", name: "Каталог прибрано", equals: "700\n600\nприбрано", hint: "Після rm -rf перевірте: [ -e \"$d\" ] || echo \"прибрано\"." },
      { on: "source", name: "Використано mktemp -d і шаблон", matches: "mktemp\\s+-d[\\s\\S]*mktemp\\s+\"\\$d/data\\.XXXXXX\"", hint: "Файл за шаблоном: mktemp \"$d/data.XXXXXX\"." },
    ],
  },
  {
    ...base, id: "bash-printf-tee", lesson: "bash/62", xp: 20,
    title: "printf і tee: таблиця у файл",
    context: "printf вирівнює колонки специфікаторами %-8s і %5d, а tee водночас зберігає вивід у файл і передає далі. Так формують звіт і одразу бачать його на екрані.",
    brief: [
      "Виведіть таблицю з двох рядків: <code>printf '%-8s|%5d\\n' apple 10 kiwi 7</code> і збережіть її у <code>table.txt</code> через <code>tee</code>.",
      "Після цього виведіть кількість рядків файла <code>table.txt</code> (<code>wc -l &lt; table.txt</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: printf '%-8s|%5d\n' apple 10 kiwi 7 | tee table.txt
# TODO 2: wc -l < table.txt
`,
    checks: [
      { on: "stdout", name: "Таблиця з вирівнюванням", has: "apple   |   10\nkiwi    |    7", hint: "%-8s вирівнює ліворуч у полі з 8 символів, %5d праворуч у полі з 5." },
      { on: "stdout", name: "Таблиця й кількість рядків", equals: "apple   |   10\nkiwi    |    7\n2", hint: "tee також друкує потік, а wc -l < table.txt дає 2." },
      { on: "source", name: "Використано tee table.txt", matches: "\\|\\s*tee\\s+table\\.txt", hint: "Конвеєр: printf ... | tee table.txt." },
    ],
  },
  {
    ...base, id: "bash-links", lesson: "bash/63", xp: 20,
    title: "Жорстке й символічне посилання",
    context: "Символічне посилання зберігає шлях і ламається, якщо ціль зникла. Жорстке посилання це друге ім'я того самого файла, і дані живуть, доки є хоч одне ім'я.",
    brief: [
      "Створіть <code>data.txt</code> зі словом <code>hello</code>, символічне посилання <code>soft</code> (<code>ln -s</code>) і жорстке <code>hard</code> (<code>ln</code>). Виведіть, на що вказує <code>soft</code> (<code>readlink</code>), і кількість імен файла (<code>stat -c %h data.txt</code>).",
      "Видаліть <code>data.txt</code>. Виведіть <code>бите посилання</code>, якщо <code>soft</code> більше не відкривається (<code>[ -e soft ] || …</code>), і вміст <code>hard</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
echo hello > data.txt

# TODO 1: ln -s data.txt soft; ln data.txt hard; readlink soft; stat -c %h data.txt
# TODO 2: rm data.txt; [ -e soft ] || echo "бите посилання"; cat hard
`,
    checks: [
      { on: "stdout", name: "Ціль посилання і кількість імен", has: "data.txt\n2", hint: "readlink soft друкує data.txt, а stat -c %h показує 2 імені." },
      { on: "stdout", name: "М'яке посилання зламалось, жорстке живе", equals: "data.txt\n2\nбите посилання\nhello", hint: "Після rm data.txt soft висить, а hard має ті самі дані." },
      { on: "source", name: "Обидва види посилань", matches: "ln\\s+-s[\\s\\S]*ln\\s+data\\.txt\\s+hard", hint: "Символічне: ln -s data.txt soft, жорстке: ln data.txt hard." },
    ],
  },
  {
    ...base, id: "bash-stat-du", lesson: "bash/64", xp: 20,
    title: "stat і розмір файла",
    context: "Розмір файла у байтах можна отримати кількома способами, і вони збігаються для звичайних файлів. stat -c %F додатково показує тип об'єкта: файл чи каталог.",
    brief: [
      "У тимчасовій папці вже створено файл <code>f.txt</code> із текстом <code>hello world</code> (без перенесення рядка) і каталог <code>d</code>. Виведіть розмір файла двома способами: <code>stat -c %s f.txt</code> і <code>wc -c &lt; f.txt</code>.",
      "Потім виведіть типи об'єктів: <code>stat -c %F f.txt</code> і <code>stat -c %F d</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf 'hello world' > f.txt
mkdir d

# TODO 1: stat -c %s f.txt і wc -c < f.txt
# TODO 2: stat -c %F f.txt і stat -c %F d
`,
    checks: [
      { on: "stdout", name: "Розмір 11 байтів двома способами", has: "11\n11", hint: "hello world має 11 байтів, і stat -c %s та wc -c < файл збігаються." },
      { on: "stdout", name: "Типи об'єктів", equals: "11\n11\nregular file\ndirectory", hint: "stat -c %F f.txt дає regular file, а для d дає directory." },
      { on: "source", name: "Використано stat -c", matches: "stat\\s+-c\\s+%s[\\s\\S]*stat\\s+-c\\s+%F", hint: "Формат задає -c: %s розмір, %F тип." },
    ],
  },
  {
    ...base, id: "bash-tar", lesson: "bash/65", xp: 25,
    title: "tar: архів, перегляд і розпакування",
    context: "Резервні копії й релізи пакують у tar.gz. Перед розпакуванням корисно подивитись вміст, а розпаковувати можна в іншу папку ключем -C, не торкаючись поточної.",
    brief: [
      "У тимчасовій папці вже є <code>proj/a.txt</code> (<code>alpha</code>) і <code>proj/sub/b.txt</code> (<code>beta</code>). Упакуйте <code>proj</code> у <code>proj.tar.gz</code> (<code>tar -czf</code>) і виведіть відсортований список вмісту (<code>tar -tzf … | sort</code>).",
      "Розпакуйте архів у папку <code>out</code> через <code>-C out</code> і виведіть вміст <code>out/proj/sub/b.txt</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
mkdir -p proj/sub
echo alpha > proj/a.txt
echo beta > proj/sub/b.txt

# TODO 1: tar -czf proj.tar.gz proj; tar -tzf proj.tar.gz | sort
# TODO 2: mkdir out; tar -xzf proj.tar.gz -C out; cat out/proj/sub/b.txt
`,
    checks: [
      { on: "stdout", name: "Вміст архіву за списком", has: "proj/\nproj/a.txt\nproj/sub/\nproj/sub/b.txt", hint: "tar -tzf друкує каталоги зі скісною рискою наприкінці; sort впорядковує список." },
      { on: "stdout", name: "Розпакований файл", equals: "proj/\nproj/a.txt\nproj/sub/\nproj/sub/b.txt\nbeta", hint: "Після розпакування в out файл лежить за шляхом out/proj/sub/b.txt." },
      { on: "source", name: "Створення й розпакування архіву", matches: "tar\\s+-czf[\\s\\S]*tar\\s+-xzf[^\\n]*-C", hint: "Створення: tar -czf, розпакування: tar -xzf архів -C папка." },
    ],
  },
  {
    ...base, id: "bash-paths", lesson: "bash/66", xp: 20,
    title: "Шлях на частини",
    context: "Із шляху до файла часто треба дістати ім'я, каталог і розширення. Для цього є basename та dirname, а ще швидкі розкриття параметрів ${p##*/}, ${p%/*}, ${n%.*} без запуску процесів.",
    brief: [
      "Для <code>path=/var/log/app/error.log</code> виведіть чотири рядки: ім'я файла (<code>error.log</code>), каталог (<code>/var/log/app</code>), ім'я без розширення (<code>error</code>) і розширення (<code>log</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
path=/var/log/app/error.log

# TODO: basename / dirname або розкриття \${path##*/}, \${path%/*}, \${name%.*}, \${name##*.}
`,
    checks: [
      { on: "stdout", name: "Ім'я і каталог", has: "error.log\n/var/log/app", hint: "basename \"$path\" і dirname \"$path\"." },
      { on: "stdout", name: "Без розширення і розширення", equals: "error.log\n/var/log/app\nerror\nlog", hint: "${name%.*} відкидає розширення, ${name##*.} лишає тільки його." },
      { on: "source", name: "Використано розбір шляху", matches: "basename|##\\*/", hint: "Скористайтеся basename/dirname або розкриттям ${path##*/}." },
    ],
  },
  {
    ...base, id: "bash-fd", lesson: "bash/67", xp: 25,
    title: "Дескриптори: два файли паралельно",
    context: "Власні файлові дескриптори дозволяють тримати відкритими кілька файлів і читати з них по черзі. Так склеюють два списки рядок до рядка, чого не зробити одним циклом із перенаправленням.",
    brief: [
      "У тимчасовій папці створено <code>nums.txt</code> (<code>1 2</code>) і <code>letters.txt</code> (<code>a b</code>). Відкрийте їх дескрипторами 3 і 4 (<code>exec 3&lt; …</code>), у циклі <code>while read -r -u 3 n &amp;&amp; read -r -u 4 l</code> виведіть <code>1-a</code>, <code>2-b</code> і закрийте дескриптори.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf '%s\n' 1 2 > nums.txt
printf '%s\n' a b > letters.txt

# TODO: exec 3< nums.txt 4< letters.txt; цикл while read -r -u 3 n && read -r -u 4 l; виведіть "$n-$l"; закрийте 3 і 4
`,
    checks: [
      { on: "stdout", name: "Склеєні рядки", equals: "1-a\n2-b", hint: "У тілі циклу echo \"$n-$l\"; цикл читає по рядку з кожного файла." },
      { on: "source", name: "Дескриптори відкрито через exec", matches: "exec\\s+3<", hint: "exec 3< nums.txt 4< letters.txt відкриває файли як 3 і 4." },
      { on: "source", name: "Читання з дескрипторів", matches: "read\\s+-r\\s+-u\\s+3[\\s\\S]*read\\s+-r\\s+-u\\s+4", hint: "Для читання з 3 і 4: read -r -u 3 n та read -r -u 4 l." },
    ],
  },
  {
    ...base, id: "bash-safe-names", lesson: "bash/68", xp: 25,
    title: "Безпечні імена: -print0 і read -d ''",
    context: "Імена файлів можуть містити пробіли й починатися з дефіса. Нульовий роздільник у find -print0 і read -d '' витримує будь-які імена, тоді як розбір виводу ls їх ламає.",
    brief: [
      "У тимчасовій папці створено <code>a b.txt</code>, <code>-x.txt</code> і <code>c.txt</code>. Виведіть кожен знайдений файл у квадратних дужках, у відсортованому порядку: <code>find . -type f -print0 | sort -z | while IFS= read -r -d '' f</code> і <code>echo \"[$f]\"</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch -- "a b.txt" "-x.txt" c.txt

# TODO: find . -type f -print0 | sort -z | while IFS= read -r -d '' f; do echo "[$f]"; done
`,
    checks: [
      { on: "stdout", name: "Усі три імена цілі", equals: "[./-x.txt]\n[./a b.txt]\n[./c.txt]", hint: "Імена з пробілом і дефісом лишаються цілими, коли роздільником є нульовий байт." },
      { on: "source", name: "Нульовий роздільник у find і sort", matches: "-print0[^\\n]*sort\\s+-z", hint: "find ... -print0 | sort -z зберігає нульовий роздільник." },
      { on: "source", name: "Читання з -d ''", matches: "read\\s+-r\\s+-d\\s+''", hint: "while IFS= read -r -d '' f читає імена, розділені нулем." },
    ],
  },
  {
    ...base, id: "bash-atomic-lock", lesson: "bash/69", xp: 30,
    title: "Атомарний запис і блокування",
    context: "Конфіг, який читають інші процеси, оновлюють через тимчасовий файл і mv, щоб ніхто не побачив напівзаписаного вмісту. А від одночасних запусків захищає flock на відкритому дескрипторі.",
    brief: [
      "Оновіть файл <code>config</code> атомарно: створіть <code>tmp=$(mktemp ./config.XXXXXX)</code>, запишіть у нього <code>version=2</code>, перейменуйте через <code>mv \"$tmp\" config</code> і виведіть <code>config</code>.",
      "Потім продемонструйте блокування: відкрийте <code>exec 9&gt; lock</code> і візьміть <code>flock -n 9</code> (виведіть <code>перший отримав</code>), відкрийте <code>exec 8&gt; lock</code> і спробуйте <code>flock -n 8</code> (виведіть <code>другий не отримав</code> при невдачі).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
echo "version=1" > config

# TODO 1: tmp=$(mktemp ./config.XXXXXX); запис; mv "$tmp" config; cat config
# TODO 2: exec 9> lock; flock -n 9 && echo "перший отримав"
# TODO 3: exec 8> lock; flock -n 8 || echo "другий не отримав"
`,
    checks: [
      { on: "stdout", name: "Конфіг оновлено", has: "version=2", hint: "Спершу echo \"version=2\" > \"$tmp\", потім mv \"$tmp\" config." },
      { on: "stdout", name: "Друга спроба блокування невдала", equals: "version=2\nперший отримав\nдругий не отримав", hint: "Два відкриття одного файла блокуються між собою: перше flock -n 9 вдале, друге flock -n 8 повертає 1." },
      { on: "source", name: "Тимчасовий файл у тому ж каталозі й mv", matches: "mktemp\\s+\\./config\\.XXXXXX[\\s\\S]*mv\\s+\"\\$tmp\"\\s+config", hint: "mktemp ./config.XXXXXX створює файл поруч із цільовим, mv підмінює його атомарно." },
      { on: "source", name: "Використано flock -n", matches: "flock\\s+-n\\s+9[\\s\\S]*flock\\s+-n\\s+8", hint: "Блокування на двох дескрипторах: flock -n 9 і flock -n 8." },
    ],
  },
];
