import type { RefSection } from "./types.ts";

const raw = String.raw;
const BT = "`";   // зворотний апостроф (у String.raw його не можна екранувати)
const D = "$";    // знак долара

export const bash: RefSection[] = [
  { t: "Навігація", items: [
    { t: "Де я й що тут", code: raw`pwd              # поточна папка
ls               # список файлів
ls -la           # з деталями й прихованими
cd projects      # увійти в папку
cd ..            # на рівень вище
cd ~             # у домашню папку`, note: "`~` це домашня папка користувача, `.` поточна, `..` батьківська." },
  ] },
  { t: "Файли й папки", items: [
    { t: "Створення, копіювання, видалення", code: raw`mkdir app                 # створити папку
mkdir -p a/b/c            # разом із вкладеними
touch notes.txt           # створити порожній файл
cp a.txt b.txt            # копіювати
mv b.txt docs/            # перемістити або перейменувати
rm notes.txt              # видалити файл
rm -r old/                # видалити папку`, note: "Видалення через `rm` безповоротне: кошика в терміналі немає. Двічі перевіряйте шлях." },
  ] },
  { t: "Перегляд вмісту", items: [
    { t: "cat, head, tail, less", code: raw`cat file.txt            # весь файл
head -n 5 file.txt      # перші 5 рядків
tail -n 5 file.txt      # останні 5 рядків
tail -f app.log         # стежити за новими рядками
less file.txt           # гортати (вихід: q)
wc -l file.txt          # кількість рядків`, note: "`tail -f` зручний для перегляду логів у реальному часі." },
  ] },
  { t: "Пошук", items: [
    { t: "grep і find", code: raw`grep "error" app.log          # рядки з текстом
grep -i -n "error" app.log    # без урахування регістру, з номерами
grep -r "TODO" src/           # у всіх файлах папки
find . -name "*.txt"          # пошук файлів за назвою
find . -type d -name "node_modules"`, note: "`grep` шукає текст усередині файлів, а `find` самі файли та папки." },
  ] },
  { t: "Потоки й конвеєри", items: [
    { t: "|, >, >>", code: raw`ls | wc -l                    # кількість файлів
cat log.txt | grep error | sort | uniq -c
echo "привіт" > out.txt       # записати (перезаписує)
echo "ще рядок" >> out.txt    # дописати в кінець
command 2> errors.txt         # помилки в файл`, note: "Конвеєр `|` передає вивід однієї команди на вхід наступної." },
  ] },
  { t: "Змінні", items: [
    { t: "Робота зі змінними", code: raw`name="Олена"
echo "Привіт, ${D}name"
echo "Файлів: ${D}(ls | wc -l)"
export APP_ENV=production    # доступна дочірнім програмам
echo ${D}HOME ${D}PATH`, note: "Навколо `=` пробілів немає. Команду в `$(...)` виконують, а її вивід підставляють." },
  ] },
  { t: "Скрипти", items: [
    { t: "Перший скрипт", code: raw`#!/bin/bash
# файл hello.sh
name="${D}1"
if [ -z "${D}name" ]; then
  echo "Вкажіть ім'я"
  exit 1
fi
echo "Привіт, ${D}name!"`, note: "Запуск: `chmod +x hello.sh`, потім `./hello.sh Олена`. Перший аргумент доступний як `$1`." },
    { t: "Умови й цикли", code: raw`if [ -f "config.txt" ]; then
  echo "є файл"
elif [ -d "config" ]; then
  echo "є папка"
else
  echo "нічого немає"
fi

for f in *.txt; do
  echo "Файл: ${D}f"
done

n=0
while [ ${D}n -lt 3 ]; do
  n=$((n + 1))
done`, note: "Усередині `[ ]` потрібні пробіли. Прапорці: `-f` файл, `-d` папка, `-z` порожній рядок, `-lt` менше." },
    { t: "Функції", code: raw`greet() {
  echo "Привіт, ${D}1"
}
greet "Олена"`, note: "Аргументи функції також доступні як `$1`, `$2` і так далі." },
  ] },
  { t: "Права доступу", items: [
    { t: "chmod і власник", code: raw`ls -l                  # -rwxr-xr--  власник група інші
chmod +x script.sh     # дозволити виконання
chmod 644 file.txt     # rw-r--r--
sudo command           # виконати від імені адміністратора`, note: "Цифри в `chmod`: 4 читання, 2 запис, 1 виконання (їх додають)." },
  ] },
  { t: "Корисне", items: [
    { t: "Допомога й історія", code: raw`man ls              # посібник (вихід: q)
ls --help
history             # раніше введені команди
clear               # очистити екран
Ctrl+C              # зупинити команду
Ctrl+R              # пошук в історії`, note: "Клавіша Tab доповнює назви файлів та команд." },
    { t: "Підстановка команд", code: raw`today=${BT}date +%F${BT}
echo "Сьогодні: ${D}today"
curl -s https://example.com | head -n 3`, note: "Запис із зворотними апострофами робить те саме, що й `$(...)`, але сучасніший `$(...)`." },
  ] },
];
