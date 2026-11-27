// Еталонні рішення завдань Bash, глава 05 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_05 = {
  "bash-array-basic": sh`#!/usr/bin/env bash
fruits=(apple banana cherry)

echo "\${fruits[0]}"
echo "\${fruits[-1]}"
fruits[3]=date
echo "\${fruits[-1]}"
`,
  "bash-array-all": sh`#!/usr/bin/env bash
names=("Олена Коваль" Богдан "Ірина Мельник")

echo "\${#names[@]}"
printf '[%s]\n' "\${names[@]}"
( IFS=,; echo "\${names[*]}" )
`,
  "bash-array-modify": sh`#!/usr/bin/env bash
a=(a b c d e)

a+=(f g)
unset 'a[1]'
a=("\${a[@]}")
echo "\${a[*]}"
echo "\${!a[@]}"
echo "\${a[@]: -2}"
`,
  "bash-array-loop": sh`#!/usr/bin/env bash
nums=(5 12 7 3 4)
sum=0
max=\${nums[0]}
big=()

for n in "\${nums[@]}"; do
  (( sum += n ))
  (( n > max )) && max=$n
  (( n > 5 )) && big+=("$n")
done
echo "сума: $sum"
echo "максимум: $max"
echo "більші за 5: \${big[*]}"
`,
  "bash-mapfile": sh`#!/usr/bin/env bash
text="перший рядок
другий рядок
третій рядок"

mapfile -t lines <<< "$text"
echo "\${#lines[@]}"
echo "\${lines[-1]}"

work=$(mktemp -d)
cd "$work"
touch a.txt "my notes.txt" b.csv
shopt -s nullglob
txt=(*.txt)
echo "\${#txt[@]}"
`,
  "bash-assoc": sh`#!/usr/bin/env bash
declare -A capital
capital[France]=Paris
capital[Poland]=Warsaw
capital[Ukraine]=Kyiv

for k in $(printf '%s\n' "\${!capital[@]}" | sort); do
  echo "$k: \${capital[$k]}"
done
echo "записів: \${#capital[@]}"
[[ -v capital[Spain] ]] || echo "Spain немає"
`,
  "bash-word-frequency": sh`#!/usr/bin/env bash
text="to be or not to be"
declare -A count

for word in $text; do
  (( count[$word]++ ))
done
for w in "\${!count[@]}"; do
  echo "\${count[$w]} $w"
done | LC_ALL=C sort -k1,1nr -k2
`,
  "bash-array-function": sh`#!/usr/bin/env bash
longest() {
  local best="" w
  for w in "$@"; do
    (( \${#w} > \${#best} )) && best=$w
  done
  echo "$best"
}
append_to() {
  local -n _arr=$1
  _arr+=("$2")
}

words=(kiwi banana fig)
longest "\${words[@]}"

list=(a b)
append_to list c
echo "\${list[*]}"
`,
};
