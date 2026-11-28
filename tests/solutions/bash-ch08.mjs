// Еталонні рішення завдань Bash, глава 08 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_08 = {
  "bash-process-info": sh`#!/usr/bin/env bash
sleep 5 &
pid=$!

kill -0 "$pid" && echo "процес існує"
ps -o comm= -p "$pid"
ppid=$(ps -o ppid= -p "$pid" | tr -d ' ')
[ "$ppid" = "$$" ] && echo "батько — скрипт"

kill "$pid"
wait "$pid" 2>/dev/null || true
`,
  "bash-background": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

( sleep 0.1; echo a > a.txt ) &
( sleep 0.1; echo b > b.txt ) &
( sleep 0.1; echo c > c.txt ) &
wait
cat a.txt b.txt c.txt
bash -c 'exit 3' &
wait $!
echo "код: $?"
`,
  "bash-pipestatus": sh`#!/usr/bin/env bash
false | true | false
echo "\${PIPESTATUS[*]}"
grep -q x <<< "y"
rc=$?
echo "grep: $rc"
bash -c 'exit 7'
echo "дочірній: $?"
`,
  "bash-signals": sh`#!/usr/bin/env bash
sleep 30 &
p1=$!
sleep 30 &
p2=$!

kill "$p1"
wait "$p1" 2>/dev/null
echo "TERM: $?"
kill -9 "$p2"
wait "$p2" 2>/dev/null
echo "KILL: $?"
kill -l 2
`,
  "bash-processes-signals": sh`#!/usr/bin/env bash
sleep 30 &
pid=$!

kill -0 "$pid" && echo "процес живий"

trap 'echo "отримано сигнал"' USR1
kill -USR1 $$

kill "$pid"
wait "$pid" 2>/dev/null
echo "код: $?"
`,
  "bash-timeout": sh`#!/usr/bin/env bash
timeout 0.3 sleep 5
echo "тайм-аут: $?"
timeout 2 true
echo "швидка команда: $?"
timeout 2 bash -c 'exit 5'
echo "код команди: $?"
`,
  "bash-nohup": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

nohup bash -c 'echo виконано' > out.txt 2>&1 &
wait
cat out.txt
sleep 0.3 &
pid=$!
disown
echo "завдань після disown: $(jobs | wc -l)"

while kill -0 "\${pid:-0}" 2>/dev/null; do sleep 0.1; done
`,
  "bash-coproc": sh`#!/usr/bin/env bash
coproc UP { tr a-z A-Z; }
echo hello >&"\${UP[1]}"
exec {UP[1]}>&-
read -r line <&"\${UP[0]}"
echo "$line"
wait
`,
  "bash-parallel": sh`#!/usr/bin/env bash
printf '%s\n' 1 2 3 4 | xargs -P 4 -n 1 bash -c 'echo "job $0"' | sort
echo "готово"
`,
};
