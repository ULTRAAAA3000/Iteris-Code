// Практичні завдання курсу Bash: по одному на кожен урок. Запускаються на сервері (runtime: "remote"), перевірка за stdout і кодом.
// Еталони: tests/solutions/bash.mjs. Правила: скрипти самодостатні (дані в змінних, файли у тимчасовій папці mktemp -d),
// без мережі, без клавіатури; результат не залежить від локалі (назви файлів у нижньому регістрі).
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "bash", runtime: "remote", lang: "bash", file: "main.sh", editorLang: "shell", premium: false } as const;

export const BASH_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "bash-files-dirs", lesson: "bash/1", xp: 15,
    title: "Структура проєкту з командного рядка",
    context: "Перше, що роблять у терміналі: створюють папки, файли й дивляться, що вийшло. mkdir -p створює вкладені папки за один раз, touch створює порожній файл, ls показує вміст.",
    brief: [
      "У тимчасовій папці створіть структуру: папки <code>project/src</code> і <code>project/docs</code> (одним <code>mkdir -p</code>) та порожній файл <code>project/readme.md</code> (<code>touch</code>).",
      "Виведіть вміст папки <code>project</code> командою <code>ls</code>: має вийти <code>docs</code>, <code>readme.md</code>, <code>src</code>.",
    ],
    starter: raw`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO: створіть project/src, project/docs і файл project/readme.md, потім виведіть вміст project
`,
    checks: [
      { on: "stdout", name: "У project три елементи за алфавітом", has: "docs\nreadme.md\nsrc" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "docs\nreadme.md\nsrc" },
      { on: "source", name: "Використано mkdir -p", matches: "mkdir\\s+-p" },
      { on: "source", name: "Файл створено через touch", matches: "touch\\s" },
    ],
  },
  {
    ...base, id: "bash-pipes-log", lesson: "bash/2", xp: 20,
    title: "Конвеєр: аналіз журналу",
    context: "Сила командного рядка в конвеєрах: кожна команда робить одну просту справу, а | передає результат далі. Так за секунди відповідають на питання «що найчастіше ламається» без жодної програми.",
    brief: [
      "У змінній <code>LOG</code> лежить журнал. Виведіть кількість рядків з помилками (<code>grep -c '^ERROR'</code>).",
      "Потім виведіть, які повідомлення помилок зустрічаються і скільки разів, від найчастішого: <code>grep '^ERROR'</code>, <code>cut -d' ' -f2-</code> (відкинути слово ERROR), <code>sort</code>, <code>uniq -c</code>, <code>sort -rn</code>.",
    ],
    starter: raw`#!/usr/bin/env bash
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
      { on: "stdout", name: "Рядків ERROR: 3", has: "3\n" },
      { on: "stdout", name: "disk full двічі, timeout один раз", matches: "(?:^|\\n)3\\n\\s*2 disk full\\n\\s*1 timeout$" },
      { on: "source", name: "Використано конвеєр з uniq -c", matches: "\\|[^\\n]*uniq\\s+-c" },
    ],
  },
  {
    ...base, id: "bash-text-processing", lesson: "bash/3", xp: 20,
    title: "awk, cut і paste: розбір CSV",
    context: "awk читає текст по рядках і полях, тож порахувати суму стовпця чи вибрати колонки можна одним рядком. Це швидше, ніж вантажити таблицю в редактор, і працює на сервері, де редактора немає.",
    brief: [
      "У змінній <code>DATA</code> лежить CSV (перший рядок це заголовок). Виведіть загальну вартість: сума <code>qty * price</code> по всіх рядках, окрім заголовка (<code>awk -F,</code>, <code>NR &gt; 1</code>).",
      "Другим рядком виведіть назви товарів (перший стовпець без заголовка) через кому: <code>cut</code>, <code>tail -n +2</code> та <code>paste -sd,</code>.",
    ],
    starter: raw`#!/usr/bin/env bash
DATA='name,qty,price
хліб,2,25
сир,1,180
молоко,3,42'

# TODO 1: сума qty * price (awk -F, 'NR>1 ...')
# TODO 2: назви товарів через кому
echo "$DATA" | head -n 1
`,
    checks: [
      { on: "stdout", name: "Загальна вартість: 356", has: "356" },
      { on: "stdout", name: "Назви через кому: хліб,сир,молоко", has: "хліб,сир,молоко" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "356\nхліб,сир,молоко" },
      { on: "source", name: "Використано awk", matches: "\\bawk\\b" },
    ],
  },
  {
    ...base, id: "bash-env-path", lesson: "bash/4", xp: 20,
    title: "export і PATH",
    context: "Змінна середовища видна дочірнім процесам лише після export. PATH це список папок, у яких шукаються команди: додали свою папку, і ваші утиліти запускаються за іменем.",
    brief: [
      "Експортуйте змінну <code>GREETING</code> зі значенням <code>Привіт</code>, щоб її бачив дочірній процес <code>bash -c</code>.",
      "Додайте <code>/opt/tools/bin</code> у кінець <code>PATH</code> (<code>PATH=\"$PATH:/opt/tools/bin\"</code>). Перевірка внизу вже написана.",
    ],
    starter: raw`#!/usr/bin/env bash
# TODO: GREETING=Привіт з export; додати /opt/tools/bin до PATH

bash -c 'echo "У підоболонці: $GREETING"'

case ":$PATH:" in
  *:/opt/tools/bin:*) echo "PATH містить /opt/tools/bin" ;;
  *) echo "PATH не містить /opt/tools/bin" ;;
esac
`,
    checks: [
      { on: "stdout", name: "Підоболонка бачить GREETING", has: "У підоболонці: Привіт" },
      { on: "stdout", name: "PATH містить /opt/tools/bin", has: "PATH містить /opt/tools/bin" },
      { on: "source", name: "Змінну експортовано", matches: "\\bexport\\b" },
      { on: "source", name: "PATH доповнено", matches: "PATH=[\"']?\\$PATH:/opt/tools/bin|PATH=[\"']?\\$\\{PATH\\}:/opt/tools/bin" },
    ],
  },
  {
    ...base, id: "bash-script-perms", lesson: "bash/5", xp: 25,
    title: "Перший скрипт і права доступу",
    context: "Щоб файл можна було запустити як програму, йому потрібні права на виконання (chmod +x) і рядок shebang на початку, що каже, чим його виконувати. Права 755 це власник усе, інші читання й виконання.",
    brief: [
      "У тимчасовій папці створіть файл <code>hello.sh</code> із shebang <code>#!/usr/bin/env bash</code> і командою <code>echo \"Привіт зі скрипта\"</code> (через <code>cat &gt; hello.sh &lt;&lt;'EOF'</code>).",
      "Зробіть його виконуваним з правами <code>755</code> (<code>chmod 755</code>), запустіть <code>./hello.sh</code> і виведіть права командою <code>stat -c %a hello.sh</code>.",
    ],
    starter: raw`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO: створіть hello.sh, chmod 755, запустіть його і виведіть права (stat -c %a hello.sh)
`,
    checks: [
      { on: "stdout", name: "Скрипт запустився і привітався", has: "Привіт зі скрипта" },
      { on: "stdout", name: "Права файла: 755", has: "Привіт зі скрипта\n755" },
      { on: "source", name: "Використано chmod", matches: "chmod\\s+(755|\\+x|a\\+x|u\\+x)" },
      { on: "source", name: "У скрипті є shebang", matches: "#!/(usr/)?bin/(env )?bash" },
    ],
  },
  {
    ...base, id: "bash-logic-loops", lesson: "bash/6", xp: 25,
    title: "Функція, умова та цикл while",
    context: "Скрипти стають корисними, коли в них з'являється логіка: функції ховають повторюваний код, умови вибирають гілку, цикли повторюють дію. У Bash порівняння чисел пишуться як -lt, -gt, -eq.",
    brief: [
      "Допишіть функцію <code>classify</code>: для числа менше 10 виводить <code>мало</code>, менше 100 <code>середньо</code>, інакше <code>багато</code> (<code>if / elif / else</code> із <code>-lt</code>).",
      "Циклом <code>while</code> виведіть зворотний відлік <code>3</code>, <code>2</code>, <code>1</code>, а потім <code>Старт!</code>.",
    ],
    starter: raw`#!/usr/bin/env bash
classify() {
  # TODO: $1 < 10 -> мало; < 100 -> середньо; інакше багато
  echo "?"
}

for n in 5 50 500; do
  echo "$n $(classify "$n")"
done

# TODO: while: відлік 3 2 1, потім Старт!
`,
    checks: [
      { on: "stdout", name: "5 це «мало»", has: "5 мало" },
      { on: "stdout", name: "50 це «середньо», 500 це «багато»", has: "50 середньо\n500 багато" },
      { on: "stdout", name: "Відлік і старт", has: "500 багато\n3\n2\n1\nСтарт!" },
      { on: "source", name: "Використано цикл while", matches: "\\bwhile\\b" },
      { on: "source", name: "Числа порівнюються через -lt", matches: "-lt" },
    ],
  },
  {
    ...base, id: "bash-processes-signals", lesson: "bash/7", xp: 30,
    title: "Процеси та сигнали",
    context: "Кожна запущена програма це процес із номером (PID). Його можна перевірити, зупинити сигналом, дочекатися і дізнатися код завершення. А trap дозволяє самому скрипту реагувати на сигнали: прибрати за собою перед виходом.",
    brief: [
      "У заготовці запущено фоновий процес <code>sleep 30</code> з номером у <code>$pid</code>. Перевірте, що він живий (<code>kill -0 \"$pid\"</code>), і виведіть <code>процес живий</code>.",
      "Зупиніть його (<code>kill \"$pid\"</code>), дочекайтесь (<code>wait \"$pid\"</code>) і виведіть код завершення <code>код: 143</code> (128 + номер сигналу 15). А ще обробіть сигнал: <code>trap 'echo \"отримано сигнал\"' USR1</code> і надішліть його собі через <code>kill -USR1 $$</code>.",
    ],
    starter: raw`#!/usr/bin/env bash
sleep 30 &
pid=$!

# TODO 1: kill -0 "$pid" && echo "процес живий"
# TODO 2: trap для USR1 з повідомленням "отримано сигнал", kill -USR1 $$
# TODO 3: kill "$pid", wait "$pid", вивести "код: $?"
`,
    checks: [
      { on: "stdout", name: "Процес живий", has: "процес живий" },
      { on: "stdout", name: "Сигнал оброблено через trap", has: "процес живий\nотримано сигнал" },
      { on: "stdout", name: "Код завершення зупиненого процесу: 143", has: "отримано сигнал\nкод: 143" },
      { on: "source", name: "Використано trap", matches: "\\btrap\\b" },
    ],
  },
  {
    ...base, id: "bash-ssh-config", lesson: "bash/8", xp: 30,
    title: "Команда ssh із конфігурації",
    context: "Файл ~/.ssh/config зберігає імена серверів, користувачів і порти, щоб замість довгої команди писати ssh web. Тут мережі немає, тому тренуємо розбір такого конфігу: із тексту збираємо рядок команди.",
    brief: [
      "Допишіть функцію <code>ssh_cmd</code>: за ім'ям вузла (<code>$1</code>) знайдіть у змінній <code>CONFIG</code> його <code>HostName</code>, <code>User</code> і <code>Port</code> (якщо порту немає, то <code>22</code>) і виведіть <code>ssh -p &lt;порт&gt; &lt;користувач&gt;@&lt;хост&gt;</code>.",
      "Підказка: <code>awk -v h=\"$1\"</code> із ознакою «ми всередині потрібного блоку Host».",
    ],
    starter: raw`#!/usr/bin/env bash
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
      { on: "stdout", name: "web: ssh -p 2222 deploy@203.0.113.10", has: "ssh -p 2222 deploy@203.0.113.10" },
      { on: "stdout", name: "db: порт за замовчуванням 22", has: "ssh -p 22 admin@203.0.113.20" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ssh -p 2222 deploy@203.0.113.10\nssh -p 22 admin@203.0.113.20" },
      { on: "source", name: "Конфіг розбирається через awk", matches: "\\bawk\\b" },
    ],
  },
];
