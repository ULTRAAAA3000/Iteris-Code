// Практичні завдання глави «Процеси, коди завершення й сигнали» (уроки 70–78). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
// Завдання bash-processes-signals перенесено зі старого курсу з тим самим id. Перевіряються коди та вміст, а не PID чи час.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "bash-process-info", lesson: "bash/70", xp: 20,
    title: "Інформація про процес",
    context: "Кожен процес має номер, ім'я команди й батька. Їх можна дізнатись, не чіпаючи самого процесу: kill -0 перевіряє, що він живий, а ps -p PID -o ... друкує окремі поля без заголовка.",
    brief: [
      "У заготовці запущено фоновий <code>sleep 5</code> з номером у <code>$pid</code>. Виведіть <code>процес існує</code>, якщо <code>kill -0 \"$pid\"</code> успішний.",
      "Потім виведіть ім'я його команди (<code>ps -o comm= -p \"$pid\"</code>) і слова <code>батько — скрипт</code>, якщо номер батька (<code>ps -o ppid= -p \"$pid\"</code>, без пробілів) дорівнює <code>$$</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
sleep 5 &
pid=$!

# TODO 1: kill -0 "$pid" && echo "процес існує"
# TODO 2: ps -o comm= -p "$pid"
# TODO 3: ppid=$(ps -o ppid= -p "$pid" | tr -d ' '); якщо $ppid дорівнює $$ — "батько — скрипт"

kill "$pid"
wait "$pid" 2>/dev/null || true
`,
    checks: [
      { on: "stdout", name: "Процес існує", has: "процес існує", hint: "kill -0 \"$pid\" && echo \"процес існує\": сигнал 0 лише перевіряє існування." },
      { on: "stdout", name: "Ім'я команди — sleep", has: "процес існує\nsleep", hint: "ps -o comm= -p \"$pid\" друкує лише ім'я команди (знак = прибирає заголовок)." },
      { on: "stdout", name: "Батько — наш скрипт", equals: "процес існує\nsleep\nбатько — скрипт", hint: "Порівняйте [ \"$ppid\" = \"$$\" ] && echo \"батько — скрипт\"." },
      { on: "source", name: "Використано kill -0 і ps -o", matches: "kill\\s+-0[\\s\\S]*ps\\s+-o", hint: "Потрібні kill -0 для перевірки й ps -o для полів." },
    ],
  },
  {
    ...base, id: "bash-background", lesson: "bash/71", xp: 20,
    title: "Фонові задачі: wait і коди",
    context: "Фонові задачі виконуються паралельно, а wait дозволяє дочекатись їх і дізнатись код. Результати окремих задач передають через файли, бо змінні фонових процесів до скрипта не повертаються.",
    brief: [
      "У тимчасовій папці запустіть у фоні три групи команд, що пишуть у файли <code>a.txt</code>, <code>b.txt</code> і <code>c.txt</code> літери <code>a</code>, <code>b</code>, <code>c</code> (кожна з короткою паузою <code>sleep 0.1</code>). Дочекайтесь їх командою <code>wait</code> і виведіть вміст файлів у порядку a, b, c.",
      "Потім запустіть у фоні <code>bash -c 'exit 3'</code>, дочекайтесь саме її (<code>wait $!</code>) і виведіть <code>код: 3</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: три фонові задачі ( sleep 0.1; echo a > a.txt ) &  ... потім wait і cat a.txt b.txt c.txt
# TODO 2: bash -c 'exit 3' &  wait $!  echo "код: $?"
`,
    checks: [
      { on: "stdout", name: "Результати зібрано з файлів", has: "a\nb\nc", hint: "Після wait виведіть cat a.txt b.txt c.txt: порядок задаємо ми, а не час завершення." },
      { on: "stdout", name: "Код фонової задачі", equals: "a\nb\nc\nкод: 3", hint: "wait $! повертає код саме останньої фонової задачі: 3." },
      { on: "source", name: "Є фонові задачі й wait", matches: "&[\\s\\S]*\\bwait\\b[\\s\\S]*\\bwait\\s+\\$!", hint: "Спершу фонові групи й загальний wait, потім окремо bash -c 'exit 3' & і wait $!." },
    ],
  },
  {
    ...base, id: "bash-pipestatus", lesson: "bash/72", xp: 20,
    title: "PIPESTATUS і збереження коду",
    context: "Конвеєр повертає код останньої команди, а помилки попередніх ланок губляться. Масив PIPESTATUS зберігає код кожної ланки, а звичайний код слід прочитати одразу, бо наступна команда його перезапише.",
    brief: [
      "Виконайте конвеєр <code>false | true | false</code> і відразу виведіть коди всіх ланок через <code>${PIPESTATUS[*]}</code>: <code>1 0 1</code>.",
      "Далі <code>grep -q x &lt;&lt;&lt; \"y\"</code> з негайним збереженням коду в <code>rc</code> і виводом <code>grep: 1</code>, а також <code>bash -c 'exit 7'</code> з виводом <code>дочірній: 7</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: false | true | false; echo "\${PIPESTATUS[*]}"
# TODO 2: grep -q x <<< "y"; rc=$?; echo "grep: $rc"
# TODO 3: bash -c 'exit 7'; echo "дочірній: $?"
`,
    checks: [
      { on: "stdout", name: "Коди ланок конвеєра", has: "1 0 1", hint: "PIPESTATUS читайте одразу після конвеєра: echo \"${PIPESTATUS[*]}\"." },
      { on: "stdout", name: "Код grep і дочірнього процесу", equals: "1 0 1\ngrep: 1\nдочірній: 7", hint: "Код збережіть у rc одразу після команди, а exit 7 дочірнього bash читайте з $?." },
      { on: "source", name: "Використано PIPESTATUS", matches: "PIPESTATUS", hint: "Масив PIPESTATUS містить коди всіх ланок конвеєра." },
    ],
  },
  {
    ...base, id: "bash-signals", lesson: "bash/73", xp: 20,
    title: "Сигнали: TERM, KILL і коди",
    context: "Процес, убитий сигналом, завершується кодом 128 плюс номер сигналу. SIGTERM дає 143, SIGKILL дає 137, і за цими числами видно, чим саме його зупинили.",
    brief: [
      "У заготовці запущено два процеси <code>sleep 30</code> (<code>p1</code> і <code>p2</code>). Зупиніть перший сигналом TERM (<code>kill \"$p1\"</code>), дочекайтесь (<code>wait \"$p1\" 2&gt;/dev/null</code>) і виведіть <code>TERM: 143</code>.",
      "Другий зупиніть <code>kill -9</code>, дочекайтесь і виведіть <code>KILL: 137</code>. Наприкінці виведіть ім'я сигналу номер 2 командою <code>kill -l 2</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
sleep 30 &
p1=$!
sleep 30 &
p2=$!

# TODO 1: kill "$p1"; wait "$p1" 2>/dev/null; echo "TERM: $?"
# TODO 2: kill -9 "$p2"; wait "$p2" 2>/dev/null; echo "KILL: $?"
# TODO 3: kill -l 2
`,
    checks: [
      { on: "stdout", name: "SIGTERM: код 143", has: "TERM: 143", hint: "128 + 15 = 143: код процесу, убитого SIGTERM." },
      { on: "stdout", name: "SIGKILL: код 137", has: "KILL: 137", hint: "128 + 9 = 137: SIGKILL не перехоплюється." },
      { on: "stdout", name: "Рівно три рядки", equals: "TERM: 143\nKILL: 137\nINT", hint: "kill -l 2 друкує INT (сигнал Ctrl+C)." },
      { on: "source", name: "Використано kill -9", matches: "kill\\s+-9", hint: "Негайно знищити процес: kill -9 \"$p2\"." },
    ],
  },
  {
    ...base, id: "bash-processes-signals", lesson: "bash/74", xp: 30,
    title: "Процеси та сигнали",
    context: "Кожна запущена програма це процес із номером (PID). Його можна перевірити, зупинити сигналом, дочекатися і дізнатися код завершення. А trap дозволяє самому скрипту реагувати на сигнали: прибрати за собою перед виходом.",
    brief: [
      "У заготовці запущено фоновий процес <code>sleep 30</code> з номером у <code>$pid</code>. Перевірте, що він живий (<code>kill -0 \"$pid\"</code>), і виведіть <code>процес живий</code>.",
      "Зупиніть його (<code>kill \"$pid\"</code>), дочекайтесь (<code>wait \"$pid\"</code>) і виведіть код завершення <code>код: 143</code> (128 + номер сигналу 15). А ще обробіть сигнал: <code>trap 'echo \"отримано сигнал\"' USR1</code> і надішліть його собі через <code>kill -USR1 $$</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
sleep 30 &
pid=$!

# TODO 1: kill -0 "$pid" && echo "процес живий"
# TODO 2: trap для USR1 з повідомленням "отримано сигнал", kill -USR1 $$
# TODO 3: kill "$pid", wait "$pid", вивести "код: $?"
`,
    checks: [
      { on: "stdout", name: "Процес живий", has: "процес живий", hint: "kill -0 \"$pid\" перевіряє, що процес існує, і не надсилає сигнал." },
      { on: "stdout", name: "Сигнал оброблено через trap", has: "процес живий\nотримано сигнал", hint: "trap 'echo \"отримано сигнал\"' USR1, потім kill -USR1 $$ (процес надсилає сигнал сам собі)." },
      { on: "stdout", name: "Код завершення зупиненого процесу: 143", has: "отримано сигнал\nкод: 143", hint: "kill \"$pid\"; wait \"$pid\"; echo \"код: $?\". Код 143 = 128 + 15 (SIGTERM)." },
      { on: "source", name: "Використано trap", matches: "\\btrap\\b", hint: "Реакцію на сигнал задає команда trap." },
    ],
  },
  {
    ...base, id: "bash-timeout", lesson: "bash/75", xp: 20,
    title: "timeout: ліміт часу й коди",
    context: "Зовнішні виклики без ліміту часу здатні зависнути назавжди. timeout обмежує тривалість команди й повертає код 124, коли час вийшов, а інакше код самої команди.",
    brief: [
      "Виведіть три рядки: <code>тайм-аут: 124</code> після <code>timeout 0.3 sleep 5</code>, <code>швидка команда: 0</code> після <code>timeout 2 true</code> і <code>код команди: 5</code> після <code>timeout 2 bash -c 'exit 5'</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: timeout 0.3 sleep 5; echo "тайм-аут: $?"
# TODO 2: timeout 2 true; echo "швидка команда: $?"
# TODO 3: timeout 2 bash -c 'exit 5'; echo "код команди: $?"
`,
    checks: [
      { on: "stdout", name: "Код 124 при вичерпаному ліміті", has: "тайм-аут: 124", hint: "timeout повертає 124, коли команда не вклалась у ліміт." },
      { on: "stdout", name: "Коди швидких команд", equals: "тайм-аут: 124\nшвидка команда: 0\nкод команди: 5", hint: "Якщо команда вклалась, timeout повертає її власний код: 0 та 5." },
      { on: "source", name: "Використано timeout", matches: "timeout\\s+0\\.3\\s+sleep", hint: "timeout 0.3 sleep 5 зупиняє sleep через 0.3 секунди." },
    ],
  },
  {
    ...base, id: "bash-nohup", lesson: "bash/76", xp: 25,
    title: "nohup і disown",
    context: "Фонове завдання вмирає разом із сесією через SIGHUP. nohup запускає команду, що ігнорує його, а disown знімає завдання зі списку оболонки, щоб вона його не чіпала.",
    brief: [
      "Запустіть <code>nohup bash -c 'echo виконано' &gt; out.txt 2&gt;&amp;1 &amp;</code>, дочекайтесь (<code>wait</code>) і виведіть <code>out.txt</code>.",
      "Потім запустіть у фоні <code>sleep 0.3</code>, зніміть завдання зі списку (<code>disown</code>) і виведіть <code>завдань після disown: N</code>, де N — <code>jobs | wc -l</code>. Очікується 0.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: nohup bash -c 'echo виконано' > out.txt 2>&1 &  wait  cat out.txt
# TODO 2: sleep 0.3 &  pid=$!  disown  echo "завдань після disown: $(jobs | wc -l)"

while kill -0 "\${pid:-0}" 2>/dev/null; do sleep 0.1; done
`,
    checks: [
      { on: "stdout", name: "Вивід nohup збережено у файл", has: "виконано", hint: "nohup bash -c '...' > out.txt 2>&1 & потім wait і cat out.txt." },
      { on: "stdout", name: "Після disown списку завдань порожній", equals: "виконано\nзавдань після disown: 0", hint: "disown знімає останнє фонове завдання зі списку jobs." },
      { on: "source", name: "Використано nohup і disown", matches: "\\bnohup\\b[\\s\\S]*\\bdisown\\b", hint: "Потрібні обидві команди." },
    ],
  },
  {
    ...base, id: "bash-coproc", lesson: "bash/77", xp: 25,
    title: "coproc: діалог із фоновою програмою",
    context: "Співпроцес дозволяє скрипту надсилати програмі рядки й читати відповіді. Канал запису слід закрити, щоб програма побачила кінець вводу й видала результат.",
    brief: [
      "Запустіть співпроцес <code>coproc UP { tr a-z A-Z; }</code>, надішліть йому <code>hello</code> (<code>echo hello &gt;&amp;\"${UP[1]}\"</code>), закрийте канал запису (<code>exec {UP[1]}&gt;&amp;-</code>) і прочитайте відповідь у змінну (<code>read -r line &lt;&amp;\"${UP[0]}\"</code>). Виведіть її: <code>HELLO</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO: coproc UP { tr a-z A-Z; }
# надішліть hello у \${UP[1]}, закрийте його, прочитайте відповідь із \${UP[0]} і виведіть
`,
    checks: [
      { on: "stdout", name: "Відповідь співпроцесу", equals: "HELLO", hint: "Канал запису треба закрити: exec {UP[1]}>&-, інакше tr не видасть результат." },
      { on: "source", name: "Створено співпроцес", matches: "coproc\\s+UP", hint: "coproc UP { tr a-z A-Z; } створює двосторонній канал." },
      { on: "source", name: "Запис і читання через дескриптори", matches: ">&\"\\$\\{UP\\[1\\]\\}\"[\\s\\S]*<&\"\\$\\{UP\\[0\\]\\}\"", hint: "Запис: >&\"${UP[1]}\", читання: <&\"${UP[0]}\"." },
    ],
  },
  {
    ...base, id: "bash-parallel", lesson: "bash/78", xp: 25,
    title: "xargs -P: паралельні задачі",
    context: "Задачі, що не залежать одна від одної, виконують паралельно з обмеженням кількості процесів. Порядок завершення непередбачуваний, тож результат сортують, щоб звіт був відтворюваним.",
    brief: [
      "Для чисел <code>1 2 3 4</code> виконайте паралельно (до чотирьох одночасно) команду, що друкує <code>job N</code>: <code>printf '%s\\n' 1 2 3 4 | xargs -P 4 -n 1 bash -c 'echo \"job $0\"'</code>. Відсортуйте вивід (<code>| sort</code>), а наприкінці виведіть <code>готово</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO: printf '%s\n' 1 2 3 4 | xargs -P 4 -n 1 bash -c 'echo "job $0"' | sort
echo "готово"
`,
    checks: [
      { on: "stdout", name: "Усі чотири задачі виконано", has: "job 1\njob 2\njob 3\njob 4", hint: "xargs -n 1 передає по одному числу; bash -c '...' бачить його як $0." },
      { on: "stdout", name: "Відсортований вивід і слово «готово»", equals: "job 1\njob 2\njob 3\njob 4\nготово", hint: "Порядок завершення випадковий, тож перед виводом додайте | sort." },
      { on: "source", name: "Використано xargs -P", matches: "xargs\\s+-P\\s*4", hint: "Паралельність задає ключ -P: xargs -P 4." },
    ],
  },
];
