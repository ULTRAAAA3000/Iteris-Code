// Еталонні рішення завдань Bash (id завдання -> скрипт). У сайт не потрапляють
const raw = String.raw;

export const BASH = {
  "bash-files-dirs": raw`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

mkdir -p project/src project/docs
touch project/readme.md
ls project
`,
  "bash-pipes-log": raw`#!/usr/bin/env bash
LOG='INFO start
ERROR disk full
INFO ok
ERROR timeout
WARN slow
ERROR disk full'

echo "$LOG" | grep -c '^ERROR'
echo "$LOG" | grep '^ERROR' | cut -d' ' -f2- | sort | uniq -c | sort -rn
`,
  "bash-text-processing": raw`#!/usr/bin/env bash
DATA='name,qty,price
хліб,2,25
сир,1,180
молоко,3,42'

echo "$DATA" | awk -F, 'NR>1 { s += $2 * $3 } END { print s }'
echo "$DATA" | cut -d, -f1 | tail -n +2 | paste -sd, -
`,
  "bash-env-path": raw`#!/usr/bin/env bash
export GREETING=Привіт
PATH="$PATH:/opt/tools/bin"

bash -c 'echo "У підоболонці: $GREETING"'

case ":$PATH:" in
  *:/opt/tools/bin:*) echo "PATH містить /opt/tools/bin" ;;
  *) echo "PATH не містить /opt/tools/bin" ;;
esac
`,
  "bash-script-perms": raw`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

cat > hello.sh <<'EOF'
#!/usr/bin/env bash
echo "Привіт зі скрипта"
EOF
chmod 755 hello.sh
./hello.sh
stat -c %a hello.sh
`,
  "bash-logic-loops": raw`#!/usr/bin/env bash
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

i=3
while [ "$i" -gt 0 ]; do
  echo "$i"
  i=$((i - 1))
done
echo "Старт!"
`,
  "bash-processes-signals": raw`#!/usr/bin/env bash
sleep 30 &
pid=$!

kill -0 "$pid" && echo "процес живий"

trap 'echo "отримано сигнал"' USR1
kill -USR1 $$

kill "$pid"
wait "$pid" 2>/dev/null
echo "код: $?"
`,
  "bash-ssh-config": raw`#!/usr/bin/env bash
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
};
