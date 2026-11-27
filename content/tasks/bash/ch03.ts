// Практичні завдання глави «Умови й цикли» (уроки 18–28). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
// Рамки з циклом for чи функцією в заготовках дано готовими, коли урок ще не вчив їх: там дописують лише ту частину, що вчиться.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "bash-if-exit-code", lesson: "bash/18", xp: 15,
    title: "if за кодом завершення: пошук слова",
    context: "Умова в Bash — це команда, а її істина — код завершення нуль. grep -q не друкує нічого, а лише повертає код, тому саме його зручно ставити в if, щоб перевірити наявність слова у файлі.",
    brief: [
      "У файлі <code>notes.txt</code> лежить рядок <code>hello world</code>. Перевірте через <code>if grep -q слово notes.txt</code>, чи є в ньому слово <code>world</code>: виведіть <code>слово world є</code> або <code>слова world немає</code>.",
      "Те саме зробіть для слова <code>missing</code>: виведіть <code>слово missing є</code> або <code>слова missing немає</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf 'hello world\n' > notes.txt

# TODO 1: if grep -q world notes.txt; then ... else ... fi
# TODO 2: те саме для missing
`,
    checks: [
      { on: "stdout", name: "Слово world знайдено", has: "слово world є", hint: "if grep -q world notes.txt; then echo \"слово world є\"; else ... fi." },
      { on: "stdout", name: "Слова missing немає", has: "слова missing немає", hint: "Для missing grep -q повертає 1, тому спрацює гілка else." },
      { on: "stdout", name: "Рівно два рядки", equals: "слово world є\nслова missing немає", hint: "Спершу результат для world, потім для missing." },
      { on: "source", name: "Умова на grep -q", matches: "if\\s+grep\\s+-q", hint: "Умовою if служить сама команда: if grep -q world notes.txt; then." },
    ],
  },
  {
    ...base, id: "bash-test-brackets", lesson: "bash/19", xp: 20,
    title: "test і [ ]: чотири перевірки",
    context: "Квадратні дужки порівнюють рядки, числа й перевіряють файли. Пробіли навколо них обов'язкові, а змінні в лапках рятують від порожніх значень і значень із пробілами.",
    brief: [
      "У заготовці є змінні <code>name</code> (порожня) і <code>count</code> (12), файл <code>data.txt</code> (не порожній) та каталог <code>logs</code>. Через <code>[ ]</code> з <code>&amp;&amp; echo</code> виведіть чотири рядки: <code>ім'я порожнє</code> (<code>-z</code>), <code>count більше 10</code> (<code>-gt</code>), <code>data.txt — файл</code> (<code>-f</code>) і <code>logs — каталог</code> (<code>-d</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf 'дані\n' > data.txt
mkdir logs
name=""
count=12

# TODO: чотири перевірки через [ ] && echo "..."
`,
    checks: [
      { on: "stdout", name: "Порожня змінна name", has: "ім'я порожнє", hint: "[ -z \"$name\" ] && echo \"ім'я порожнє\"." },
      { on: "stdout", name: "Число більше 10", has: "count більше 10", hint: "[ \"$count\" -gt 10 ] && echo \"count більше 10\"." },
      { on: "stdout", name: "Файл і каталог", has: "data.txt — файл\nlogs — каталог", hint: "[ -f data.txt ] для файла і [ -d logs ] для каталогу." },
      { on: "stdout", name: "Рівно чотири рядки", equals: "ім'я порожнє\ncount більше 10\ndata.txt — файл\nlogs — каталог", hint: "Порядок: name, count, data.txt, logs." },
      { on: "source", name: "Використано -z, -gt, -f і -d", matches: "-z[\\s\\S]*-gt[\\s\\S]*-f[\\s\\S]*-d", hint: "Потрібні чотири оператори: -z, -gt, -f, -d." },
    ],
  },
  {
    ...base, id: "bash-double-brackets", lesson: "bash/20", xp: 20,
    title: "[[ ]]: шаблон, регулярний вираз і групи",
    context: "Подвійні дужки вміють порівнювати з шаблоном імен, з регулярним виразом і навіть виймати частини рядка в BASH_REMATCH. Усе це без запуску сторонніх програм і без побоювань щодо порожніх змінних.",
    brief: [
      "Для змінних <code>a=report.txt</code>, <code>b=12345</code> і <code>c=v2.15</code> виведіть три рядки: <code>a: текстовий файл</code> (шаблон <code>*.txt</code>), <code>b: число</code> (регулярний вираз <code>^[0-9]+$</code>) та <code>c: версія 2</code> (регулярний вираз <code>^v([0-9]+)\\.([0-9]+)$</code>, мажорну частину беріть із <code>BASH_REMATCH[1]</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
a=report.txt
b=12345
c=v2.15

# TODO 1: [[ $a == *.txt ]] && echo "a: текстовий файл"
# TODO 2: [[ $b =~ ^[0-9]+$ ]] && echo "b: число"
# TODO 3: [[ $c =~ ^v([0-9]+)\.([0-9]+)$ ]] && echo "c: версія ..."
`,
    checks: [
      { on: "stdout", name: "Текстовий файл за шаблоном", has: "a: текстовий файл", hint: "[[ $a == *.txt ]] && echo \"a: текстовий файл\"; шаблон без лапок." },
      { on: "stdout", name: "Число за регулярним виразом", has: "b: число", hint: "[[ $b =~ ^[0-9]+$ ]] && echo \"b: число\"." },
      { on: "stdout", name: "Мажорна версія з BASH_REMATCH", has: "c: версія 2", hint: "У echo візьміть ${BASH_REMATCH[1]} відразу після успішного =~." },
      { on: "stdout", name: "Рівно три рядки", equals: "a: текстовий файл\nb: число\nc: версія 2", hint: "Порядок: a, b, c." },
      { on: "source", name: "Використано == і =~ у [[ ]]", matches: "\\[\\[[^\\n]*==[\\s\\S]*\\[\\[[^\\n]*=~", hint: "Потрібні і == із шаблоном, і =~ з регулярним виразом." },
    ],
  },
  {
    ...base, id: "bash-arith-conditions", lesson: "bash/21", xp: 20,
    title: "(( )): парність і діапазон",
    context: "Числові умови в (( )) читаються як звичайна математика: порівняння, остача, логіка. Конструкція повертає істину, коли результат ненульовий, тож годиться і для if, і для <code>&amp;&amp;</code> та <code>||</code>.",
    brief: [
      "Для <code>n=18</code> виведіть три рядки через <code>(( ))</code>: <code>парне</code> (якщо <code>n % 2 == 0</code>), <code>у діапазоні</code> (якщо <code>n</code> від 1 до 20 включно) та <code>не більше 100</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
n=18

# TODO: (( n % 2 == 0 )) && echo "парне"
# TODO: (( n >= 1 && n <= 20 )) && echo "у діапазоні"
# TODO: (( n <= 100 )) && echo "не більше 100"
`,
    checks: [
      { on: "stdout", name: "Парне число", has: "парне", hint: "(( n % 2 == 0 )) && echo \"парне\": остача від ділення на 2 дорівнює нулю." },
      { on: "stdout", name: "У діапазоні 1–20", has: "парне\nу діапазоні", hint: "(( n >= 1 && n <= 20 )) && echo \"у діапазоні\"." },
      { on: "stdout", name: "Три рядки", equals: "парне\nу діапазоні\nне більше 100", hint: "Порядок: парне, у діапазоні, не більше 100." },
      { on: "source", name: "Використано (( ))", matches: "\\(\\(\\s*n", hint: "Умови пишіть у подвійних круглих дужках: (( n % 2 == 0 ))." },
    ],
  },
  {
    ...base, id: "bash-logic-loops", lesson: "bash/22", xp: 25,
    title: "Умова if, elif, else",
    context: "Скрипти стають корисними, коли в них з'являється логіка: умови вибирають гілку за значенням. У Bash порівняння чисел можна писати як -lt, -gt, -eq, а перша істинна гілка перемагає.",
    brief: [
      "Допишіть функцію <code>classify</code> (рамка вже готова: функції й цикл <code>for</code> ви розберете далі): для числа менше 10 вона має вивести <code>мало</code>, менше 100 — <code>середньо</code>, інакше — <code>багато</code> (<code>if / elif / else</code> із <code>-lt</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
classify() {
  # TODO: $1 < 10 -> мало; < 100 -> середньо; інакше багато
  echo "?"
}

for n in 5 50 500; do
  echo "$n $(classify "$n")"
done
`,
    checks: [
      { on: "stdout", name: "5 це «мало»", has: "5 мало", hint: "Перша гілка: if [ \"$1\" -lt 10 ]; then echo \"мало\"." },
      { on: "stdout", name: "50 це «середньо», 500 це «багато»", has: "50 середньо\n500 багато", hint: "elif [ \"$1\" -lt 100 ] дає «середньо», else — «багато»." },
      { on: "stdout", name: "Рівно три рядки", equals: "5 мало\n50 середньо\n500 багато", hint: "Виводити треба лише результати для 5, 50 і 500." },
      { on: "source", name: "Числа порівнюються через -lt", matches: "-lt", hint: "Порівняння чисел: [ \"$1\" -lt 10 ]." },
      { on: "source", name: "Використано elif", matches: "\\belif\\b", hint: "Друга перевірка — гілка elif, а не новий вкладений if." },
    ],
  },
  {
    ...base, id: "bash-case", lesson: "bash/23", xp: 20,
    title: "case: тип файла за розширенням",
    context: "Коли одне значення порівнюється з багатьма варіантами, case виглядає охайніше за ланцюжок elif. Шаблони в ньому працюють за правилами глобів, а гілка *) ловить усе, що лишилось.",
    brief: [
      "Рамка циклу <code>for</code> уже є, дописати треба оператор <code>case \"$f\" in … esac</code>. Для <code>*.txt</code> виведіть <code>текст</code>, для <code>*.jpg</code> і <code>*.png</code> — <code>зображення</code>, для <code>*.tar.gz</code> — <code>архів</code>, для решти — <code>невідомий тип</code>. Формат рядка: <code>report.txt: текст</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
for f in report.txt photo.jpg photo.png archive.tar.gz notes; do
  # TODO: case "$f" in ... esac, виводячи "$f: <тип>"
  echo "$f: ?"
done
`,
    checks: [
      { on: "stdout", name: "Текст і зображення", has: "report.txt: текст\nphoto.jpg: зображення\nphoto.png: зображення", hint: "*.jpg|*.png) echo \"$f: зображення\" ;; об'єднує два шаблони." },
      { on: "stdout", name: "Архів і невідомий тип", has: "archive.tar.gz: архів\nnotes: невідомий тип", hint: "*.tar.gz) для архівів, а *) ловить усе інше." },
      { on: "stdout", name: "П'ять рядків", equals: "report.txt: текст\nphoto.jpg: зображення\nphoto.png: зображення\narchive.tar.gz: архів\nnotes: невідомий тип", hint: "Порядок файлів зберігається: report, jpg, png, tar.gz, notes." },
      { on: "source", name: "Використано case з універсальною гілкою", matches: "\\bcase\\b[\\s\\S]*\\*\\)[\\s\\S]*\\besac\\b", hint: "Універсальну гілку *) ставте останньою перед esac." },
    ],
  },
  {
    ...base, id: "bash-for-loop", lesson: "bash/24", xp: 20,
    title: "for: файли за шаблоном і діапазон",
    context: "Цикл for проходить по списку, і найкорисніший список — це файли за шаблоном. Імена з пробілами безпечні, якщо змінну циклу взяти в лапки, а діапазон у фігурних дужках дає лічильник без зайвих команд.",
    brief: [
      "У тимчасовій папці вже створено <code>a.log</code>, <code>b.log</code>, <code>my notes.log</code> і <code>c.txt</code>. Циклом <code>for f in *.log</code> виведіть кожен лог у квадратних дужках: <code>[a.log]</code>. Імена беріть у лапки.",
      "Потім циклом <code>for i in {1..3}</code> виведіть <code>крок 1</code>, <code>крок 2</code>, <code>крок 3</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch a.log b.log "my notes.log" c.txt

# TODO 1: for f in *.log; do echo "[$f]"; done
# TODO 2: for i in {1..3}; do echo "крок $i"; done
`,
    checks: [
      { on: "stdout", name: "Усі три логи, зокрема з пробілом", has: "[a.log]\n[b.log]\n[my notes.log]", hint: "Змінну в тілі циклу беріть у лапки, тоді ім'я з пробілом лишиться цілим." },
      { on: "stdout", name: "Кроки 1–3", has: "крок 1\nкрок 2\nкрок 3", hint: "for i in {1..3}; do echo \"крок $i\"; done." },
      { on: "stdout", name: "Рівно шість рядків", equals: "[a.log]\n[b.log]\n[my notes.log]\nкрок 1\nкрок 2\nкрок 3", hint: "Спершу логи, потім кроки." },
      { on: "source", name: "Цикл по шаблону *.log", matches: "for\\s+\\w+\\s+in\\s+\\*\\.log", hint: "Список циклу — шаблон *.log, а не вивід ls." },
    ],
  },
  {
    ...base, id: "bash-for-c", lesson: "bash/25", xp: 20,
    title: "for у стилі C: відлік і сума",
    context: "Цикл із лічильником у стилі C має змінні межі й довільний крок, а також дозволяє йти назад. Типове його застосування — відлік і накопичення суми в змінній.",
    brief: [
      "Циклом <code>for (( i = 3; i &gt; 0; i-- ))</code> виведіть відлік <code>3</code>, <code>2</code>, <code>1</code> і слово <code>Старт!</code>.",
      "Потім іншим циклом пройдіть від 1 до 10 і накопичте суму в змінній <code>sum</code>. Виведіть <code>сума: 55</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: for (( i = 3; i > 0; i-- )) ... echo "$i"; потім echo "Старт!"
# TODO 2: sum=0; for (( i = 1; i <= 10; i++ )) ... (( sum += i )); echo "сума: $sum"
`,
    checks: [
      { on: "stdout", name: "Відлік 3, 2, 1 і Старт!", has: "3\n2\n1\nСтарт!", hint: "Лічильник зменшується: i-- з умовою i > 0." },
      { on: "stdout", name: "Сума від 1 до 10", has: "сума: 55", hint: "Накопичуйте (( sum += i )) і виведіть після циклу." },
      { on: "stdout", name: "П'ять рядків", equals: "3\n2\n1\nСтарт!\nсума: 55", hint: "Спершу відлік зі словом Старт!, потім сума." },
      { on: "source", name: "Цикл у стилі C", matches: "for\\s*\\(\\(", hint: "Форма: for (( ініціалізація; умова; крок )); do ... done." },
    ],
  },
  {
    ...base, id: "bash-while-until", lesson: "bash/26", xp: 20,
    title: "while, until і break: відлік і спроби",
    context: "Цикл while працює, поки умова істинна, а break дозволяє вийти достроково. З цих двох прийомів складаються відлік, очікування події й повторні спроби з лімітом.",
    brief: [
      "Циклом <code>while</code> виведіть відлік <code>3</code>, <code>2</code>, <code>1</code>, а потім <code>Старт!</code>.",
      "Далі змоделюйте спроби: змінну <code>attempt</code> збільшуйте в циклі, на третій спробі виведіть <code>спроба 3: успіх</code> і вийдіть через <code>break</code>; на попередніх виводьте <code>спроба N: невдача</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
i=3
# TODO 1: while (( i > 0 )); do echo "$i"; (( i-- )); done; echo "Старт!"

attempt=0
# TODO 2: while (( attempt < 5 )); do (( attempt++ )); ... break на третій спробі ... done
`,
    checks: [
      { on: "stdout", name: "Відлік зі словом Старт!", has: "3\n2\n1\nСтарт!", hint: "Тіло циклу має зменшувати i, інакше цикл нескінченний." },
      { on: "stdout", name: "Дві невдачі й успіх", has: "спроба 1: невдача\nспроба 2: невдача\nспроба 3: успіх", hint: "На третій спробі виведіть «успіх» і виконайте break." },
      { on: "stdout", name: "Рівно сім рядків", equals: "3\n2\n1\nСтарт!\nспроба 1: невдача\nспроба 2: невдача\nспроба 3: успіх", hint: "Після break цикл завершується, четвертої спроби немає." },
      { on: "source", name: "Використано while і break", matches: "\\bwhile\\b[\\s\\S]*\\bwhile\\b[\\s\\S]*\\bbreak\\b", hint: "Потрібні два цикли while, а в другому break." },
    ],
  },
  {
    ...base, id: "bash-while-read", lesson: "bash/27", xp: 25,
    title: "while read: повнолітні з таблиці",
    context: "Читання даних рядок за рядком із розбором полів — головне призначення циклу while read. Рядки подають із here-string, щоб цикл лишався в поточній оболонці й лічильник зберігся після done.",
    brief: [
      "Змінна <code>data</code> містить три рядки формату <code>ім'я:вік</code>. Циклом <code>while IFS=: read -r name age</code> (дані через <code>&lt;&lt;&lt; \"$data\"</code>) виведіть рядки <code>ім'я — вік</code> лише для тих, кому 18 і більше. Рахуйте їх у змінній і після циклу виведіть <code>дорослих: N</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
data="olena:30
bohdan:25
ira:17"
adults=0

# TODO: while IFS=: read -r name age; do ... done <<< "$data"
# у тілі: якщо age >= 18 — echo "$name — $age" і збільшити adults
echo "дорослих: $adults"
`,
    checks: [
      { on: "stdout", name: "Повнолітні виведені", has: "olena — 30\nbohdan — 25", hint: "(( age >= 18 )) && echo \"$name — $age\" всередині циклу." },
      { on: "stdout", name: "Підсумок після циклу", has: "дорослих: 2", hint: "Цикл читає here-string, а не конвеєр, тож змінна adults зберігається." },
      { on: "stdout", name: "Рівно три рядки", equals: "olena — 30\nbohdan — 25\nдорослих: 2", hint: "Ira (17) у виводі бути не має." },
      { on: "source", name: "Цикл while IFS=: read -r", matches: "while\\s+IFS=:\\s+read\\s+-r", hint: "Розділювач IFS=: діє лише на команду read." },
      { on: "source", name: "Дані подано через <<<", matches: "<<<", hint: "done <<< \"$data\" лишає цикл у поточній оболонці." },
    ],
  },
  {
    ...base, id: "bash-select", lesson: "bash/28", xp: 25,
    title: "select: вибір зі списку",
    context: "Select сам друкує нумероване меню й кладе вибраний пункт у змінну, а введене число зберігається в REPLY. У пісочниці немає клавіатури, тому вибір подають готовим рядком.",
    brief: [
      "Циклом <code>select item in яблуко груша слива</code> оберіть пункт, який відповідає введеному числу <code>2</code> (рядок уже подається через <code>&lt;&lt;&lt; 2</code>), виведіть <code>вибрано: груша</code> і <code>номер: 2</code> (з <code>REPLY</code>) та вийдіть через <code>break</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
PS3="Оберіть: "

# TODO: select item in яблуко груша слива; do ... break; done <<< 2 2>/dev/null
`,
    checks: [
      { on: "stdout", name: "Вибрано другий пункт", has: "вибрано: груша", hint: "Змінна циклу item отримає другий пункт: echo \"вибрано: $item\"." },
      { on: "stdout", name: "Номер із REPLY", equals: "вибрано: груша\nномер: 2", hint: "Введене число лежить у REPLY: echo \"номер: $REPLY\"." },
      { on: "source", name: "Використано select і break", matches: "\\bselect\\b[\\s\\S]*\\bbreak\\b", hint: "Без break цикл чекав би нового вводу." },
      { on: "source", name: "Ввід подано через <<<", matches: "<<<\\s*2", hint: "Завершіть цикл рядком done <<< 2 2>/dev/null, щоб меню не потрапило у вивід." },
    ],
  },
];
