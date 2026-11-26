// Практичні завдання глави «Старт: репозиторій і коміт» (уроки 1–6). Запускаються на сервері як скрипти Bash (runtime: "remote"), результат перевіряється за stdout.
// Скрипти самодостатні: репозиторій у тимчасовій папці (mktemp -d), автор задається локально, у виводі лише теми комітів, лічильники й статус (без хешів і дат).
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "git-tool-check", lesson: "git/1", xp: 15,
    title: "Чи є Git і перший репозиторій",
    context: "Скрипти розгортання й перевірки починаються з питання «чи є потрібна програма». А перший репозиторій — це звичайна папка, у якій з'являється службова підпапка .git із усією історією.",
    brief: [
      "Спершу через <code>command -v git</code> виведіть <code>git доступний</code>, якщо програма знайдена.",
      "Потім у тимчасовій папці створіть репозиторій командою <code>git init -q</code> і виведіть <code>репозиторій створено</code>, якщо там з'явилась папка <code>.git</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

# TODO 1: command -v git >/dev/null && echo "git доступний"
# TODO 2: git init -q, потім [ -d .git ] && echo "репозиторій створено"
`,
    checks: [
      { on: "stdout", name: "Git знайдено", has: "git доступний", hint: "command -v git >/dev/null && echo \"git доступний\"." },
      { on: "stdout", name: "Папку .git створено", has: "репозиторій створено", hint: "Після git init -q перевірте [ -d .git ] && echo \"репозиторій створено\"." },
      { on: "stdout", name: "Два рядки в потрібному порядку", equals: "git доступний\nрепозиторій створено", hint: "Спочатку повідомлення про git, потім про репозиторій." },
      { on: "source", name: "Використано git init", matches: "git\\s+init", hint: "Репозиторій створює команда git init." },
    ],
  },
  {
    ...base, id: "git-config-local", lesson: "git/2", xp: 20,
    title: "Автор комітів: локальні налаштування",
    context: "Ім'я та пошта автора записуються в кожен коміт назавжди. Локальний рівень налаштувань перекриває глобальний, і саме так задають окремого автора для одного проєкту.",
    brief: [
      "У репозиторії задайте локально <code>user.name</code> як <code>Олена Коваль</code> і <code>user.email</code> як <code>olena@example.com</code> (команда <code>git config</code> без <code>--global</code>).",
      "Створіть порожній коміт <code>git commit -q --allow-empty -m \"Старт\"</code> і виведіть три рядки: ім'я з налаштувань, пошту з налаштувань і автора коміту через <code>git log -1 --format='%an &lt;%ae&gt;'</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main

# TODO 1: git config user.name і user.email (локально)
# TODO 2: git commit -q --allow-empty -m "Старт"
# TODO 3: виведіть git config user.name, потім user.email, потім git log -1 --format='%an <%ae>'
`,
    checks: [
      { on: "stdout", name: "Ім'я й пошта з налаштувань", has: "Олена Коваль\nolena@example.com", hint: "git config user.name і git config user.email друкують збережені значення." },
      { on: "stdout", name: "Автор коміту збігається з налаштуваннями", has: "Олена Коваль <olena@example.com>", hint: "git log -1 --format='%an <%ae>' друкує автора останнього коміту." },
      { on: "stdout", name: "Рівно три рядки", equals: "Олена Коваль\nolena@example.com\nОлена Коваль <olena@example.com>", hint: "Порядок: ім'я, пошта, автор коміту." },
      { on: "source", name: "Налаштування задано командою git config", matches: "git\\s+config\\s+user\\.name", hint: "git config user.name \"Олена Коваль\" без --global діє лише в цьому репозиторії." },
    ],
  },
  {
    ...base, id: "git-init-status", lesson: "git/3", xp: 15,
    title: "git init і короткий статус",
    context: "Перед кожним комітом розробники дивляться статус, щоб не зафіксувати зайве. Короткий формат git status --short зручний для швидкого погляду, а позначки ?? і A показують стан кожного файла.",
    brief: [
      "У новому репозиторії створіть файл <code>README.md</code> і папку <code>src</code> із файлом <code>src/app.sh</code>. Виведіть <code>git status --short</code>.",
      "Потім додайте в індекс лише <code>README.md</code> (<code>git add README.md</code>) і виведіть короткий статус ще раз.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main

# TODO 1: створіть README.md і src/app.sh, виведіть git status --short
# TODO 2: git add README.md, потім ще раз git status --short
`,
    checks: [
      { on: "stdout", name: "Нові файли ще не відстежуються", has: "?? README.md\n?? src/", hint: "Одразу після створення файлів git status --short показує ?? для обох." },
      { on: "stdout", name: "README.md підготовлено, src/ ні", has: "A  README.md\n?? src/", hint: "Після git add README.md перед іменем з'являється A, а src/ лишається ??." },
      { on: "stdout", name: "Два статуси без зайвого", equals: "?? README.md\n?? src/\nA  README.md\n?? src/", hint: "Виведіть статус двічі: до й після git add README.md." },
      { on: "source", name: "Використано git add README.md", matches: "git\\s+add\\s+README\\.md", hint: "Індексуйте лише README.md, а не все: git add README.md." },
    ],
  },
  {
    ...base, id: "git-first-commit", lesson: "git/4", xp: 20,
    title: "Перші два коміти",
    context: "Повсякденний цикл Git: змінив, додав, зафіксував. Перший коміт створюють через add і commit, а швидкі правки вже відстежуваних файлів — через commit -am, яке пропускає окремий add.",
    brief: [
      "Створіть <code>README.md</code> і <code>app.sh</code>, додайте їх через <code>git add</code> і зробіть коміт <code>Перший коміт</code>.",
      "Допишіть рядок у <code>README.md</code> і зафіксуйте зміну однією командою <code>git commit -am \"Оновлення README\"</code>. Виведіть теми комітів (<code>git log --format=%s</code>), їх кількість (<code>git rev-list --count HEAD</code>) і слово <code>чисто</code>, якщо <code>git status --porcelain</code> нічого не показує.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main
git config user.name "Олена"
git config user.email "olena@example.com"

# TODO 1: README.md і app.sh, git add, коміт "Перший коміт"
# TODO 2: допишіть рядок у README.md, git commit -am "Оновлення README"
# TODO 3: git log --format=%s, git rev-list --count HEAD і "чисто", якщо статус порожній
`,
    checks: [
      { on: "stdout", name: "Теми комітів від новішого до старішого", has: "Оновлення README\nПерший коміт", hint: "git log --format=%s показує найновіший коміт першим." },
      { on: "stdout", name: "Два коміти й чиста папка", has: "Перший коміт\n2\nчисто", hint: "git rev-list --count HEAD має дати 2, а після коміту робоча папка чиста." },
      { on: "stdout", name: "Рівно чотири рядки", equals: "Оновлення README\nПерший коміт\n2\nчисто", hint: "Порядок: дві теми, число комітів, слово «чисто»." },
      { on: "source", name: "Використано commit -a", matches: "git\\s+commit\\s[^\\n]*-[a-z]*a", hint: "Для другої зміни: git commit -am \"Оновлення README\" без окремого add." },
    ],
  },
  {
    ...base, id: "git-commit-message", lesson: "git/5", xp: 20,
    title: "Коміт із темою й тілом",
    context: "Повідомлення коміту читають через місяці, тому пояснення «що й чому» записують прямо біля зміни. Тема коротка, тіло відокремлене, а повторення прапорця -m дає обидві частини без редактора.",
    brief: [
      "Файл <code>hello.sh</code> уже підготовлено в індексі. Створіть коміт із темою <code>feat: додай привітання</code> і тілом <code>Скрипт друкує привітання користувачу.</code> двома прапорцями <code>-m</code>.",
      "Виведіть тему (<code>git log -1 --format=%s</code>) і тіло (<code>git log -1 --format=%b</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main
git config user.name "Олена"
git config user.email "olena@example.com"
echo 'echo Привіт' > hello.sh
git add hello.sh

# TODO 1: git commit -q -m "тема" -m "тіло"
# TODO 2: виведіть %s і %b останнього коміту
`,
    checks: [
      { on: "stdout", name: "Тема коміту", has: "feat: додай привітання", hint: "Тема — перший -m: -m \"feat: додай привітання\"." },
      { on: "stdout", name: "Тема і тіло окремими рядками", equals: "feat: додай привітання\nСкрипт друкує привітання користувачу.", hint: "git log -1 --format=%s, потім git log -1 --format=%b." },
      { on: "source", name: "Два прапорці -m в одній команді", matches: "git\\s+commit[^\\n]*-m[^\\n]*-m", hint: "Другий -m додає абзац тіла: git commit -q -m \"тема\" -m \"тіло\"." },
    ],
  },
  {
    ...base, id: "git-inside-dotgit", lesson: "git/6", xp: 20,
    title: "Заглядаємо в .git",
    context: "Розуміння будови репозиторію допомагає, коли щось пішло не так: HEAD вказує на гілку, а об'єкти бувають трьох видів. Заглянути в них можна командами cat у файл і git cat-file.",
    brief: [
      "У заготовці вже є репозиторій з одним комітом і файлом <code>README.md</code>. Виведіть вміст <code>.git/HEAD</code> командою <code>cat</code>.",
      "Потім виведіть типи об'єктів через <code>git cat-file -t</code>: коміту <code>HEAD</code> та файла <code>HEAD:README.md</code>. Очікується <code>commit</code> і <code>blob</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main
git config user.name "Олена"
git config user.email "olena@example.com"
echo "# Проєкт" > README.md
git add README.md
git commit -q -m "Перший коміт"

# TODO 1: cat .git/HEAD
# TODO 2: git cat-file -t HEAD
# TODO 3: git cat-file -t HEAD:README.md
`,
    checks: [
      { on: "stdout", name: "HEAD вказує на гілку main", has: "ref: refs/heads/main", hint: "cat .git/HEAD друкує рядок ref: refs/heads/main." },
      { on: "stdout", name: "Типи об'єктів: commit і blob", has: "commit\nblob", hint: "git cat-file -t HEAD дає commit, а git cat-file -t HEAD:README.md дає blob." },
      { on: "stdout", name: "Рівно три рядки", equals: "ref: refs/heads/main\ncommit\nblob", hint: "Порядок: вміст HEAD, тип коміту, тип файла." },
      { on: "source", name: "Використано git cat-file -t", matches: "git\\s+cat-file\\s+-t", hint: "Тип об'єкта показує git cat-file -t ім'я." },
    ],
  },
];
