// Еталонні рішення завдань Bash, глава 02 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_02 = {
  "bash-variables-basic": sh`#!/usr/bin/env bash
name=Олена
count=3
echo "Привіт, $name! Завдань: $count"
echo "\${name}_v2"
`,
  "bash-quotes": sh`#!/usr/bin/env bash
file="my notes.txt"
printf '[%s]\n' "$file"

echo '$HOME'
echo "Ціна: \$5"
`,
  "bash-command-substitution": sh`#!/usr/bin/env bash
LIST='banana
apple
cherry'

count=$(echo "$LIST" | wc -l)
first=$(echo "$LIST" | sort | head -n 1)
echo "Рядків: $count"
echo "Перший: $first"
`,
  "bash-arithmetic": sh`#!/usr/bin/env bash
a=17
b=5
echo "$a + $b = $((a + b))"
echo "$a - $b = $((a - b))"
echo "$a * $b = $((a * b))"
echo "$a / $b = $((a / b))"
echo "$a % $b = $((a % b))"
`,
  "bash-env-path": sh`#!/usr/bin/env bash
export GREETING="Привіт"
PATH="$PATH:/opt/tools/bin"

bash -c 'echo "У підоболонці: $GREETING"'

case ":$PATH:" in
  *:/opt/tools/bin:*) echo "PATH містить /opt/tools/bin" ;;
  *) echo "PATH не містить /opt/tools/bin" ;;
esac
`,
  "bash-exit-status": sh`#!/usr/bin/env bash
true
echo "true: $?"
false
echo "false: $?"
ls no_such_file 2>/dev/null
echo "ls: $?"
false
rc=$?
echo "rc: $rc"
`,
  "bash-glob": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch a1.txt a2.txt b.txt c.csv d.log

printf '%s\n' *.txt
printf '%s\n' a?.txt
printf '%s\n' [!a]*
`,
  "bash-brace-expansion": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

mkdir -p app/{src,tests,docs}
touch app/src/{main,util}.sh
cp app/src/main.sh{,.bak}
ls app
ls app/src
`,
  "bash-expansion-order": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch a.txt b.txt c.log
n=2
pattern='*.txt'

echo {a,b}$n
echo $pattern
echo "$pattern"
[ "~" != ~ ] && echo "тильда розкрилась"
`,
  "bash-heredoc": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

cat > config.ini <<'EOF'
path=$HOME/bin
mode=fast
EOF
cat config.ini
wc -w <<< "one two three four"
`,
  "bash-read-ifs": sh`#!/usr/bin/env bash
record="Олена:30:Дніпро:Python:Go"

IFS=: read -r name age city langs <<< "$record"
echo "Ім'я: $name"
echo "Вік: $age"
echo "Місто: $city"
echo "Мови: $langs"
`,
  "bash-declare": sh`#!/usr/bin/env bash
declare -i total=0
total+=5
total+=7
total="total * 2"
echo "Сума: $total"
declare -u title=iteris
echo "$title"
readonly VERSION=1.2
( VERSION=2 ) 2>/dev/null || echo "VERSION захищено"
`,
};
