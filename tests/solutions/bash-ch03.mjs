// Еталонні рішення завдань Bash, глава 03 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_03 = {
  "bash-if-exit-code": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf 'hello world\n' > notes.txt

if grep -q world notes.txt; then
  echo "слово world є"
else
  echo "слова world немає"
fi
if grep -q missing notes.txt; then
  echo "слово missing є"
else
  echo "слова missing немає"
fi
`,
  "bash-test-brackets": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf 'дані\n' > data.txt
mkdir logs
name=""
count=12

[ -z "$name" ] && echo "ім'я порожнє"
[ "$count" -gt 10 ] && echo "count більше 10"
[ -f data.txt ] && echo "data.txt — файл"
[ -d logs ] && echo "logs — каталог"
`,
  "bash-double-brackets": sh`#!/usr/bin/env bash
a=report.txt
b=12345
c=v2.15

[[ $a == *.txt ]] && echo "a: текстовий файл"
[[ $b =~ ^[0-9]+$ ]] && echo "b: число"
[[ $c =~ ^v([0-9]+)\.([0-9]+)$ ]] && echo "c: версія \${BASH_REMATCH[1]}"
`,
  "bash-arith-conditions": sh`#!/usr/bin/env bash
n=18

(( n % 2 == 0 )) && echo "парне"
(( n >= 1 && n <= 20 )) && echo "у діапазоні"
(( n <= 100 )) && echo "не більше 100"
`,
  "bash-logic-loops": sh`#!/usr/bin/env bash
classify() {
  if [ "$1" -lt 10 ]; then
    echo "мало"
  elif [ "$1" -lt 100 ]; then
    echo "середньо"
  else
    echo "багато"
  fi
}

for n in 5 50 500; do
  echo "$n $(classify "$n")"
done
`,
  "bash-case": sh`#!/usr/bin/env bash
for f in report.txt photo.jpg photo.png archive.tar.gz notes; do
  case "$f" in
    *.txt)          echo "$f: текст" ;;
    *.jpg|*.png)    echo "$f: зображення" ;;
    *.tar.gz)       echo "$f: архів" ;;
    *)              echo "$f: невідомий тип" ;;
  esac
done
`,
  "bash-for-loop": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch a.log b.log "my notes.log" c.txt

for f in *.log; do
  echo "[$f]"
done
for i in {1..3}; do
  echo "крок $i"
done
`,
  "bash-for-c": sh`#!/usr/bin/env bash
for (( i = 3; i > 0; i-- )); do
  echo "$i"
done
echo "Старт!"

sum=0
for (( i = 1; i <= 10; i++ )); do
  (( sum += i ))
done
echo "сума: $sum"
`,
  "bash-while-until": sh`#!/usr/bin/env bash
i=3
while (( i > 0 )); do
  echo "$i"
  (( i-- ))
done
echo "Старт!"

attempt=0
while (( attempt < 5 )); do
  (( attempt++ ))
  if (( attempt == 3 )); then
    echo "спроба $attempt: успіх"
    break
  fi
  echo "спроба $attempt: невдача"
done
`,
  "bash-while-read": sh`#!/usr/bin/env bash
data="olena:30
bohdan:25
ira:17"
adults=0

while IFS=: read -r name age; do
  if (( age >= 18 )); then
    echo "$name — $age"
    (( adults++ ))
  fi
done <<< "$data"
echo "дорослих: $adults"
`,
  "bash-select": sh`#!/usr/bin/env bash
PS3="Оберіть: "

select item in яблуко груша слива; do
  echo "вибрано: $item"
  echo "номер: $REPLY"
  break
done <<< 2 2>/dev/null
`,
};
