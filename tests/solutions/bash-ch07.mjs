// Еталонні рішення завдань Bash, глава 07 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_07 = {
  "bash-chmod-umask": sh`#!/usr/bin/env bash
umask 022
work=$(mktemp -d)
cd "$work"
touch a b c

chmod 600 a
chmod u+x b
chmod a=r c
stat -c %a a b c
`,
  "bash-mktemp": sh`#!/usr/bin/env bash
d=$(mktemp -d)
stat -c %a "$d"
f=$(mktemp "$d/data.XXXXXX")
stat -c %a "$f"
rm -rf "$d"
[ -e "$d" ] || echo "прибрано"
`,
  "bash-printf-tee": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

printf '%-8s|%5d\n' apple 10 kiwi 7 | tee table.txt
wc -l < table.txt
`,
  "bash-links": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
echo hello > data.txt

ln -s data.txt soft
ln data.txt hard
readlink soft
stat -c %h data.txt
rm data.txt
[ -e soft ] || echo "бите посилання"
cat hard
`,
  "bash-stat-du": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf 'hello world' > f.txt
mkdir d

stat -c %s f.txt
wc -c < f.txt
stat -c %F f.txt
stat -c %F d
`,
  "bash-tar": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
mkdir -p proj/sub
echo alpha > proj/a.txt
echo beta > proj/sub/b.txt

tar -czf proj.tar.gz proj
tar -tzf proj.tar.gz | sort
mkdir out
tar -xzf proj.tar.gz -C out
cat out/proj/sub/b.txt
`,
  "bash-paths": sh`#!/usr/bin/env bash
path=/var/log/app/error.log

name=\${path##*/}
echo "$name"
echo "\${path%/*}"
echo "\${name%.*}"
echo "\${name##*.}"
`,
  "bash-fd": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
printf '%s\n' 1 2 > nums.txt
printf '%s\n' a b > letters.txt

exec 3< nums.txt 4< letters.txt
while read -r -u 3 n && read -r -u 4 l; do
  echo "$n-$l"
done
exec 3<&- 4<&-
`,
  "bash-safe-names": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
touch -- "a b.txt" "-x.txt" c.txt

find . -type f -print0 | sort -z | while IFS= read -r -d '' f; do
  echo "[$f]"
done
`,
  "bash-atomic-lock": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"
echo "version=1" > config

tmp=$(mktemp ./config.XXXXXX)
echo "version=2" > "$tmp"
mv "$tmp" config
cat config
exec 9> lock
flock -n 9 && echo "перший отримав"
exec 8> lock
flock -n 8 || echo "другий не отримав"
`,
};
