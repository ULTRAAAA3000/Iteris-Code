// Практичні завдання глави «Початок» (уроки 1–5). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
// Скрипти самодостатні: дані в змінних, файли у тимчасовій папці (mktemp -d), без мережі й клавіатури, імена файлів у нижньому регістрі.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "bash-first-command", lesson: "bash/1", xp: 15,
    title: "Перша команда: слова й лапки",
    context: "Оболонка розрізає рядок на слова за пробілами, і від цього залежить кожна команда. Побачивши, як echo губить або зберігає пробіли, ви краще зрозумієте лапки, які ще не раз зустрінуться.",
    brief: [
      "Виведіть рядок <code>Привіт, Bash!</code> командою <code>echo</code>.",
      "Далі виведіть слова <code>Один Два Три</code>, написавши між ними в команді різну кількість пробілів без лапок: оболонка сама зведе їх до одного пробілу. Потім виведіть текст <code>А    Б</code> (чотири пробіли між літерами) так, щоб пробіли збереглися.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: виведіть Привіт, Bash!
# TODO 2: echo Один Два Три з різною кількістю пробілів, без лапок
# TODO 3: echo з лапками, щоб зберегти чотири пробіли між А і Б
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, Bash!»", has: "Привіт, Bash!", hint: "Додайте рядок echo \"Привіт, Bash!\"." },
      { on: "stdout", name: "Слова Один Два Три через одинарні пробіли", has: "Один Два Три", hint: "Напишіть echo Один   Два     Три без лапок: оболонка сама зіб'є зайві пробіли." },
      { on: "stdout", name: "Пробіли в лапках збережено", has: "А    Б", hint: "Візьміть текст у лапки: echo \"А    Б\" із чотирма пробілами між літерами." },
      { on: "stdout", name: "Рівно три рядки без зайвого", equals: "Привіт, Bash!\nОдин Два Три\nА    Б", hint: "Мають бути три рядки в такому порядку: привітання, слова, текст із пробілами." },
      { on: "source", name: "Між словами в команді кілька пробілів", matches: "Один\\s{2,}Два", hint: "Другу команду напишіть без лапок і з кількома пробілами між словами, щоб побачити, як їх зводить оболонка." },
    ],
  },
  {
    ...base, id: "bash-files-dirs", lesson: "bash/2", xp: 15,
    title: "Структура проєкту з командного рядка",
    context: "Перше, що роблять у терміналі: створюють папки, файли й дивляться, що вийшло. mkdir -p створює вкладені папки за один раз, touch створює порожній файл, ls показує вміст.",
    brief: [
      "У тимчасовій папці створіть структуру: папки <code>project/src</code> і <code>project/docs</code> (одним <code>mkdir -p</code>) та порожній файл <code>project/readme.md</code> (<code>touch</code>).",
      "Виведіть вміст папки <code>project</code> командою <code>ls</code>: має вийти <code>docs</code>, <code>readme.md</code>, <code>src</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO: створіть project/src, project/docs і файл project/readme.md, потім виведіть вміст project
`,
    checks: [
      { on: "stdout", name: "У project три елементи за алфавітом", has: "docs\nreadme.md\nsrc", hint: "Після створення виконайте ls project: має вивестися docs, readme.md, src." },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "docs\nreadme.md\nsrc", hint: "Виводьте лише результат ls project, без додаткових echo." },
      { on: "source", name: "Використано mkdir -p", matches: "mkdir\\s+-p", hint: "mkdir -p project/src project/docs створить і project, і обидві підпапки одразу." },
      { on: "source", name: "Файл створено через touch", matches: "touch\\s", hint: "Порожній файл створює touch project/readme.md." },
    ],
  },
  {
    ...base, id: "bash-tool-check", lesson: "bash/3", xp: 15,
    title: "Чи є потрібна програма: command -v і type",
    context: "Скрипт, що запускається без перевірки потрібних утиліт, падає посеред роботи з незрозумілою помилкою. command -v дозволяє перевірити це заздалегідь, а type -t показує, чим саме є команда.",
    brief: [
      "Для кожного з імен <code>bash</code>, <code>ls</code> і <code>no_such_tool_xyz</code> виведіть рядок <code>ім'я: є</code> або <code>ім'я: немає</code>. Наявність перевіряйте через <code>command -v ім'я &gt;/dev/null</code> і поєднайте з <code>&amp;&amp;</code> та <code>||</code>.",
      "Наприкінці виведіть рядок <code>cd: builtin</code>: спершу <code>echo -n \"cd: \"</code> (без нового рядка), потім <code>type -t cd</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# Для кожного імені виведіть "<ім'я>: є" або "<ім'я>: немає".
# Шаблон: command -v ім'я >/dev/null && echo "ім'я: є" || echo "ім'я: немає"

# TODO: bash
# TODO: ls
# TODO: no_such_tool_xyz

# TODO: виведіть "cd: " і результат type -t cd
`,
    checks: [
      { on: "stdout", name: "Три рядки про bash, ls і вигадану програму", has: "bash: є\nls: є\nno_such_tool_xyz: немає", hint: "Рядки мають іти в порядку bash, ls, no_such_tool_xyz; для вигаданої програми має спрацювати гілка ||." },
      { on: "stdout", name: "cd — вбудована команда", has: "cd: builtin", hint: "echo -n \"cd: \" не переносить рядок, а наступна команда type -t cd допише слово builtin." },
      { on: "stdout", name: "Рівно чотири рядки", equals: "bash: є\nls: є\nno_such_tool_xyz: немає\ncd: builtin", hint: "Зайвого виводу бути не повинно: чотири рядки, як у завданні." },
      { on: "source", name: "Наявність перевіряє command -v", matches: "command\\s+-v", hint: "Перевірка: command -v bash >/dev/null && echo ..." },
      { on: "source", name: "Тип команди дає type -t", matches: "type\\s+-t\\s+cd", hint: "Слово builtin має прийти з виводу type -t cd, а не бути вписане руками." },
    ],
  },
  {
    ...base, id: "bash-script-perms", lesson: "bash/4", xp: 25,
    title: "Перший скрипт і права доступу",
    context: "Щоб файл можна було запустити як програму, йому потрібні права на виконання (chmod +x) і рядок shebang на початку, що каже, чим його виконувати. Права 755 це власник усе, інші читання й виконання.",
    brief: [
      "У тимчасовій папці створіть файл <code>hello.sh</code> із shebang <code>#!/usr/bin/env bash</code> і командою <code>echo \"Привіт зі скрипта\"</code> (наприклад, через <code>printf '%s\\n' … &gt; hello.sh</code> або <code>cat &gt; hello.sh &lt;&lt;'EOF'</code>).",
      "Зробіть його виконуваним з правами <code>755</code> (<code>chmod 755</code>), запустіть <code>./hello.sh</code> і виведіть права командою <code>stat -c %a hello.sh</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO: створіть hello.sh, chmod 755, запустіть його і виведіть права (stat -c %a hello.sh)
`,
    checks: [
      { on: "stdout", name: "Скрипт запустився і привітався", has: "Привіт зі скрипта", hint: "Після chmod запустіть файл: ./hello.sh." },
      { on: "stdout", name: "Права файла: 755", has: "Привіт зі скрипта\n755", hint: "Права виведіть після запуску: stat -c %a hello.sh має надрукувати 755." },
      { on: "source", name: "Використано chmod", matches: "chmod\\s+(755|\\+x|a\\+x|u\\+x)", hint: "Права виконання додає chmod 755 hello.sh (або chmod +x)." },
      { on: "source", name: "У hello.sh є shebang", matches: "#!/(usr/)?bin/(env )?bash[\\s\\S]*#!/(usr/)?bin/(env )?bash", hint: "Перший рядок самого hello.sh має бути #!/usr/bin/env bash (окрім shebang вашого основного скрипта)." },
    ],
  },
  {
    ...base, id: "bash-redirect-pipe", lesson: "bash/5", xp: 20,
    title: "Перенаправлення й конвеєр: список фруктів",
    context: "Перенаправлення збирає дані у файли, а конвеєр передає їх далі без проміжних файлів. З цих двох прийомів складається більшість командного рядка: спершу зібрати, потім відсортувати, порахувати, відфільтрувати.",
    brief: [
      "У тимчасовій папці запишіть у файл <code>fruits.txt</code> слово <code>banana</code> через <code>&gt;</code>, а потім допишіть <code>cherry</code> і <code>apple</code> через <code>&gt;&gt;</code>.",
      "Виведіть відсортований вміст (<code>sort fruits.txt</code>), потім кількість рядків без імені файла (<code>wc -l &lt; fruits.txt</code>) і, нарешті, перший рядок відсортованого списку конвеєром (<code>sort fruits.txt | head -n 1</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: banana через >, cherry і apple через >>
# TODO 2: sort fruits.txt
# TODO 3: wc -l < fruits.txt
# TODO 4: sort fruits.txt | head -n 1
`,
    checks: [
      { on: "stdout", name: "Відсортований список із трьох фруктів", has: "apple\nbanana\ncherry", hint: "sort fruits.txt має вивести apple, banana, cherry в алфавітному порядку." },
      { on: "stdout", name: "Список, число 3 і перший фрукт", equals: "apple\nbanana\ncherry\n3\napple", hint: "Порядок виводу: відсортований список, число рядків, потім перший рядок після sort." },
      { on: "source", name: "Рядки дописано через >>", matches: ">>", hint: "Другий і третій фрукт допишіть через >>, інакше > перезапише файл." },
      { on: "source", name: "Число рядків без імені файла", matches: "wc\\s+-l\\s*<", hint: "Без імені файла число дає wc -l < fruits.txt." },
      { on: "source", name: "Перший рядок узято конвеєром", matches: "\\|\\s*head", hint: "Передайте sort у head: sort fruits.txt | head -n 1." },
    ],
  },
];
