// Еталонні рішення завдань Git, глава 01 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_01 = {
  "git-tool-check": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

command -v git >/dev/null && echo "git доступний"
git init -q
[ -d .git ] && echo "репозиторій створено"
`,
  "git-config-local": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main

git config user.name "Олена Коваль"
git config user.email "olena@example.com"
git commit -q --allow-empty -m "Старт"
git config user.name
git config user.email
git log -1 --format='%an <%ae>'
`,
  "git-init-status": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main

echo "# Проєкт" > README.md
mkdir src
echo 'echo hi' > src/app.sh
git status --short
git add README.md
git status --short
`,
  "git-first-commit": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main
git config user.name "Олена"
git config user.email "olena@example.com"

echo "# Проєкт" > README.md
echo 'echo hi' > app.sh
git add README.md app.sh
git commit -q -m "Перший коміт"
echo "Опис проєкту" >> README.md
git commit -q -am "Оновлення README"
git log --format=%s
git rev-list --count HEAD
[ -z "$(git status --porcelain)" ] && echo "чисто"
`,
  "git-commit-message": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main
git config user.name "Олена"
git config user.email "olena@example.com"
echo 'echo Привіт' > hello.sh
git add hello.sh

git commit -q -m "feat: додай привітання" -m "Скрипт друкує привітання користувачу."
git log -1 --format=%s
git log -1 --format=%b
`,
  "git-inside-dotgit": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
git init -q -b main
git config user.name "Олена"
git config user.email "olena@example.com"
echo "# Проєкт" > README.md
git add README.md
git commit -q -m "Перший коміт"

cat .git/HEAD
git cat-file -t HEAD
git cat-file -t HEAD:README.md
`,
};
