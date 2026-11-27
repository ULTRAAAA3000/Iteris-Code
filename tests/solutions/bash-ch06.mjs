// Еталонні рішення завдань Bash, глава 06 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_06 = {
  "bash-pipes-log": sh`#!/usr/bin/env bash
LOG='INFO start
ERROR disk full
INFO ok
ERROR timeout
WARN slow
ERROR disk full'

echo "$LOG" | grep -c '^ERROR'
echo "$LOG" | grep '^ERROR' | cut -d' ' -f2- | sort | uniq -c | sort -rn
`,
  "bash-grep-basic": sh`#!/usr/bin/env bash
LOG='INFO start
ERROR disk full
INFO ok
WARN slow
ERROR timeout
info lower'

echo "$LOG" | grep -c ERROR
echo "$LOG" | grep -ci info
echo "$LOG" | grep -vn INFO
`,
  "bash-grep-regex": sh`#!/usr/bin/env bash
LOG='GET /a 200
GET /b 404
POST /c 500
GET /d 200'

echo "$LOG" | grep -E ' [45][0-9]{2}$'
echo "$LOG" | grep -cE ' 200$'
echo "order 123 shipped 45 items" | grep -Eo '[0-9]+'
`,
  "bash-cut-tr": sh`#!/usr/bin/env bash
DATA='olena,30,kyiv
bohdan,25,lviv
ira,17,dnipro'

echo "$DATA" | cut -d, -f2
echo "$DATA" | cut -d, -f3 | tr 'a-z' 'A-Z'
echo "a   b    c" | tr -s ' '
`,
  "bash-sort": sh`#!/usr/bin/env bash
DATA='pear,10
apple,9
fig,100
kiwi,9'

echo "$DATA" | LC_ALL=C sort -t, -k2,2nr -k1,1
`,
  "bash-uniq-wc": sh`#!/usr/bin/env bash
WORDS='b a b c a b'

echo "$WORDS" | tr ' ' '\n' | sort -u | wc -l
echo "$WORDS" | wc -w
echo "$WORDS" | tr ' ' '\n' | sort | uniq -c | sort -rn | head -n 1 | tr -s ' ' | cut -d' ' -f3
`,
  "bash-sed-replace": sh`#!/usr/bin/env bash
LOG='2026-11-27 ERROR disk full
2026-11-28 WARN slow'

echo "$LOG" | sed -E 's/([0-9]{4})-([0-9]{2})-([0-9]{2})/\3.\2.\1/'
`,
  "bash-sed-ranges": sh`#!/usr/bin/env bash
CONFIG='# comment
host=localhost

port=8080
# another
debug=true'

echo "$CONFIG" | sed -e '/^#/d' -e '/^$/d'
echo "$CONFIG" | sed -e '/^#/d' -e '/^$/d' | sed -n '2p'
`,
  "bash-text-processing": sh`#!/usr/bin/env bash
DATA='name,qty,price
хліб,2,25
сир,1,180
молоко,3,42'

echo "$DATA" | awk -F, 'NR>1 { s += $2 * $3 } END { print s }'
echo "$DATA" | cut -d, -f1 | tail -n +2 | paste -sd, -
`,
  "bash-awk-report": sh`#!/usr/bin/env bash
DATA='bread 2 25
cheese 1 180
milk 3 42'

echo "$DATA" | awk '
  { total += $2 * $3 }
  $3 > max { max = $3; name = $1 }
  END {
    print "items:", NR
    print "total:", total
    print "most expensive:", name
  }'
`,
  "bash-ssh-config": sh`#!/usr/bin/env bash
CONFIG='Host web
  HostName 203.0.113.10
  User deploy
  Port 2222
Host db
  HostName 203.0.113.20
  User admin'

ssh_cmd() {
  echo "$CONFIG" | awk -v h="$1" '
    $1 == "Host" { on = ($2 == h); next }
    on && $1 == "HostName" { host = $2 }
    on && $1 == "User" { user = $2 }
    on && $1 == "Port" { port = $2 }
    END { if (port == "") port = 22; printf "ssh -p %s %s@%s\n", port, user, host }'
}

ssh_cmd web
ssh_cmd db
`,
  "bash-find-xargs": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
mkdir sub
touch a.log "my notes.log" sub/b.log c.txt

find . -name '*.log' -type f | sort
find . -name '*.log' -type f -print0 | xargs -0 rm
find . -type f | sort
`,
  "bash-join-comm": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf '%s\n' "1 olena" "2 bohdan" "3 ira" > users.txt
printf '%s\n' "1 30" "2 25" "3 17" > ages.txt
printf '%s\n' x y z > a.txt
printf '%s\n' w y z > b.txt

join users.txt ages.txt
LC_ALL=C comm -12 a.txt b.txt
LC_ALL=C comm -23 a.txt b.txt
`,
  "bash-redirect-stderr": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

{ echo "ok"; ls no_such_file; } > out.txt 2> err.txt
wc -l < out.txt
wc -l < err.txt
printf '%s\n' a b | tee copy.txt | wc -l
wc -l < copy.txt
`,
  "bash-process-subst": sh`#!/usr/bin/env bash
one=$'b\na\nc'
two=$'c\nd\nb'

LC_ALL=C comm -12 <(sort <<< "$one") <(sort <<< "$two")
LC_ALL=C comm -23 <(sort <<< "$one") <(sort <<< "$two")
n=0
while read -r _; do
  (( n++ ))
done < <(LC_ALL=C comm -12 <(sort <<< "$one") <(sort <<< "$two"))
echo "$n"
`,
  "bash-log-report": sh`#!/usr/bin/env bash
LOG='10.0.0.1 GET /home 200
10.0.0.2 GET /about 200
10.0.0.1 GET /home 200
10.0.0.3 POST /login 500
10.0.0.2 GET /home 404
10.0.0.1 GET /about 200'

echo "запитів: $(echo "$LOG" | awk 'END { print NR }')"
echo "$LOG" | awk '{ c[$4]++ } END { for (k in c) print k ": " c[k] }' | LC_ALL=C sort -t: -k2,2nr -k1,1
echo "$LOG" | awk '{ p[$3]++ } END { for (k in p) print p[k], k }' | LC_ALL=C sort -k1,1nr -k2 | head -n 1 | awk '{ print "топ шлях: " $2 " (" $1 ")" }'
echo "унікальних IP: $(echo "$LOG" | awk '{ print $1 }' | sort -u | wc -l)"
`,
};
