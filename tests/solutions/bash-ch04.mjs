// Еталонні рішення завдань Bash, глава 04 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_04 = {
  "bash-function-basic": sh`#!/usr/bin/env bash
greet() { echo "Привіт"; }
separator() { echo "---"; }

greet
separator
greet
`,
  "bash-function-args": sh`#!/usr/bin/env bash
sum_all() {
  total=0
  for n in "$@"; do
    (( total += n ))
  done
  echo "$total"
}
greet() {
  echo "Привіт, \${1:-анонім}!"
}

sum_all 1 2 3 4
greet
greet Олена
`,
  "bash-function-return": sh`#!/usr/bin/env bash
is_even() {
  (( $1 % 2 == 0 ))
}
square() {
  echo $(( $1 * $1 ))
}

for n in 4 5; do
  if is_even "$n"; then
    echo "$n парне"
  else
    echo "$n непарне"
  fi
done
result=$(square 7)
echo "квадрат 7: $result"
`,
  "bash-function-local": sh`#!/usr/bin/env bash
total=100

compute() {
  local total
  total=5
  echo "всередині: $total"
}

compute
echo "після: $total"
`,
  "bash-source-lib": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

cat > lib.sh <<'EOF'
VERSION=1.0
greet() { echo "Привіт, $1!"; }
EOF
source ./lib.sh
greet Олена
echo "версія $VERSION"
`,
  "bash-subshell": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
start=$PWD
x=1

( cd / )
[ "$PWD" = "$start" ] && echo "папка не змінилась"

{ x=2; }
echo "x у групі: $x"

( x=3 )
echo "x після підоболонки: $x"
`,
  "bash-nameref": sh`#!/usr/bin/env bash
swap() {
  local -n _x=$1 _y=$2
  local _t=$_x
  _x=$_y
  _y=$_t
}

a=1
b=2
swap a b
echo "a=$a b=$b"
`,
};
