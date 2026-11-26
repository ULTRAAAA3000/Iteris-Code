// Еталонні рішення завдань Bash, глава 01 (id завдання -> повний скрипт). У сайт не потрапляють
const sh = (s) => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");

export const SOLUTIONS_01 = {
  "bash-first-command": sh`#!/usr/bin/env bash
echo "Привіт, Bash!"
echo Один   Два     Три
echo "А    Б"
`,
  "bash-files-dirs": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

mkdir -p project/src project/docs
touch project/readme.md
ls project
`,
  "bash-tool-check": sh`#!/usr/bin/env bash
command -v bash >/dev/null && echo "bash: є" || echo "bash: немає"
command -v ls >/dev/null && echo "ls: є" || echo "ls: немає"
command -v no_such_tool_xyz >/dev/null && echo "no_such_tool_xyz: є" || echo "no_such_tool_xyz: немає"
echo -n "cd: "
type -t cd
`,
  "bash-script-perms": sh`#!/usr/bin/env bash
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
  "bash-redirect-pipe": sh`#!/usr/bin/env bash
work=$(mktemp -d)
cd "$work"

echo banana > fruits.txt
echo cherry >> fruits.txt
echo apple >> fruits.txt

sort fruits.txt
wc -l < fruits.txt
sort fruits.txt | head -n 1
`,
};
