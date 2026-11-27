/* Iteris Code — уроки. Кожен урок: t (назва), p (абзаци), code (блоки коду), note (важливе), tasks (завдання) */
import { C_LESSONS } from "./c/index.js";
import { GO_LESSONS } from "./go/index.js";
import { HTML_LESSONS } from "./html/index.js";
import { PYTHON_LESSONS } from "./python/index.js";
import { CPP_LESSONS } from "./cpp/index.js";
import { CSS_LESSONS } from "./css/index.js";
import { SQL_LESSONS } from "./sql/index.js";
import { JAVA_LESSONS } from "./java/index.js";
import { JS_LESSONS } from "./js/index.js";
const LESSONS = {
pascal: [
{ t: "Структура програми на Pascal",
  p: ["Програма на Pascal має чітку структуру: заголовок, розділ опису змінних і головний блок між <code>begin</code> та <code>end.</code>.", "Для виведення тексту є процедури <code>write</code> (без переходу на новий рядок) і <code>writeln</code> (з переходом)."],
  code: ["program Hello;\nbegin\n  writeln('Привіт, світе!');\n  write('2 + 3 = ');\n  writeln(2 + 3);\nend."],
  note: "Після останнього <code>end</code> стоїть крапка, а не крапка з комою.",
  tasks: ["Виведіть назву своєї школи у три рядки.", "Виведіть результат виразу 10 div 3 та 10 mod 3."] },
{ t: "Змінні та ввід-вивід",
  p: ["Змінні в Pascal описують у розділі <code>var</code> до початку програми. Основні типи: <code>integer</code>, <code>real</code>, <code>string</code>, <code>boolean</code>.", "Присвоювання записують як <code>:=</code>, а вводять дані процедурою <code>readln</code>."],
  code: ["var\n  a, b: integer;\n  s: real;\nbegin\n  write('Введіть два числа: ');\n  readln(a, b);\n  s := (a + b) / 2;\n  writeln('Середнє: ', s:0:2);\nend."],
  note: "Запис <code>s:0:2</code> задає формат: два знаки після коми.",
  tasks: ["Обчисліть периметр і площу прямокутника за двома сторонами.", "Поміняйте місцями значення двох змінних через третю."] },
{ t: "Умовний оператор і цикл for",
  p: ["Умовний оператор має вигляд <code>if ... then ... else</code>. Перед <code>else</code> крапка з комою не ставиться.", "Цикл <code>for i := 1 to n do</code> повторює дію відому кількість разів. Якщо дій кілька, їх беруть у <code>begin ... end</code>."],
  code: ["var\n  n, i, sum: integer;\nbegin\n  readln(n);\n  if n > 0 then\n    writeln('Додатне')\n  else\n    writeln('Не додатне');\n  sum := 0;\n  for i := 1 to n do\n    sum := sum + i;\n  writeln('Сума 1..n = ', sum);\nend."],
  note: "Для спадного циклу використовують <code>downto</code> замість <code>to</code>.",
  tasks: ["Виведіть квадрати чисел від 1 до 10.", "Визначте більше з двох введених чисел."] }
],
};

LESSONS.c = C_LESSONS;   // курс C: 110 уроків (80 базових + 30 просунутих), content/c/
LESSONS.go = GO_LESSONS;   // курс Go: 110 уроків (80 базових + 30 просунутих), content/go/
LESSONS.html = HTML_LESSONS;   // курс HTML: 30 уроків (23 базових + 7 просунутих), content/html/
LESSONS.python = PYTHON_LESSONS;   // курс Python: 110 уроків (80 базових + 30 просунутих), content/python/
LESSONS.cpp = CPP_LESSONS;   // курс C++: 110 уроків (80 базових + 30 просунутих), content/cpp/
LESSONS.css = CSS_LESSONS;   // курс CSS: 40 уроків (35 базових + 5 просунутих), content/css/
LESSONS.java = JAVA_LESSONS;   // курс Java: 110 уроків (80 базових + 30 просунутих), content/java/
LESSONS.js = JS_LESSONS;   // курс JavaScript: 110 уроків (80 базових + 30 просунутих), content/js/
LESSONS.sql = SQL_LESSONS;   // курс SQL: 35 уроків у 10 главах (30 базових + 5 просунутих), content/sql/
LESSONS.ts = [
{ t: "Від JavaScript до TypeScript",
  p: ["TypeScript — це JavaScript із типами. Будь-який код на JavaScript уже є правильним TypeScript, а типи додаються зверху й перевіряються до запуску програми.", "Типи записують після імені через двокрапку. Компілятор <code>tsc</code> знаходить помилки ще до виконання і перетворює файл <code>.ts</code> на звичайний <code>.js</code>."],
  code: [String.raw`// JavaScript: помилку видно лише під час запуску
function greet(name) {
  return "Привіт, " + name;
}

// TypeScript: ті самі дії, але з типами
function greetTyped(name: string): string {
  return "Привіт, " + name;
}

let age: number = 16;
let isStudent: boolean = true;
age = "шістнадцять"; // помилка: string не можна присвоїти number`],
  note: "Після компіляції типи зникають: у браузері виконується звичайний JavaScript.",
  tasks: ["Додайте типи до функції add(a, b), що повертає суму двох чисел.", "Спробуйте передати рядок замість числа й подивіться на повідомлення компілятора."] },
{ t: "Union-типи та літерали",
  p: ["Змінна може допускати кілька типів: їх перелічують через <code>|</code>. Усередині функції потрібно перевірити, який саме тип прийшов, і тоді компілятор дозволить відповідні дії.", "Літеральний тип обмежує значення конкретним набором, наприклад <code>\"ok\" | \"error\"</code>."],
  code: [String.raw`let id: number | string = 42;
id = "A-17";

function show(v: number | string): string {
  if (typeof v === "string") {
    return v.toUpperCase();
  }
  return v.toFixed(2);
}

type Status = "ok" | "error";
const s: Status = "ok";
// const bad: Status = "wait"; // помилка`],
  note: "Перевірка <code>typeof</code> звужує тип: у кожній гілці компілятор точно знає, з чим працює.",
  tasks: ["Напишіть функцію, що приймає число або рядок і повертає його довжину або саме число.", "Створіть тип Direction зі значеннями «up», «down», «left», «right»."] },
{ t: "Інтерфейси та об'єкти",
  p: ["Інтерфейс описує форму об'єкта: які в нього поля й яких вони типів. Поле зі знаком <code>?</code> необов'язкове.", "Так TypeScript ловить помилки на кшталт опечатки в назві поля, які в JavaScript залишилися б непоміченими."],
  code: [String.raw`interface User {
  id: number;
  name: string;
  email?: string;
}

const u: User = { id: 1, name: "Олена" };

function info(user: User): string {
  return user.id + ": " + user.name;
}

const list: User[] = [u, { id: 2, name: "Артем", email: "a@x.ua" }];
console.log(list.map(info));`],
  note: "Інтерфейси існують лише на етапі компіляції й не потрапляють у фінальний JavaScript.",
  tasks: ["Опишіть інтерфейс Product із назвою, ціною та необов'язковим описом.", "Напишіть функцію, що повертає загальну вартість масиву товарів."] },
{ t: "Узагальнення (generics)",
  p: ["Узагальнення дозволяють написати функцію або тип, що працює з будь-яким типом, але зберігає точну інформацію про нього. Тип-параметр записують у кутових дужках, зазвичай <code>T</code>.", "Компілятор сам виводить, чим є T, за переданими аргументами."],
  code: [String.raw`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);      // number | undefined
const s = first(["a", "b"]);     // string | undefined

interface Box<T> {
  value: T;
}
const b: Box<number> = { value: 5 };`],
  note: "Масив <code>number[]</code> можна записати також як <code>Array&lt;number&gt;</code>: це та сама ідея.",
  tasks: ["Напишіть узагальнену функцію last, що повертає останній елемент масиву.", "Створіть тип Pair<A, B> із двома полями різних типів."] }
];
const CHAPTERS = {
  pascal: [["Основи", 0], ["Керування програмою", 2]],
  ts: [["Типи", 0], ["Структури даних", 2], ["Узагальнення", 3]],
};
Object.keys(CHAPTERS).forEach(k => CHAPTERS[k].forEach(([name, from], i, a) => {
  const to = i + 1 < a.length ? a[i + 1][1] : LESSONS[k].length;
  for (let j = from; j < to; j++) LESSONS[k][j].ch = name;
}));

/* ===== PHP, Git, Bash ===== */
LESSONS.php = [
{ t: "Перша програма на PHP",
  p: ["PHP — мова для серверної частини сайтів: на ній працює WordPress та значна частина вебу. Код PHP виконується на сервері, а браузер отримує вже готовий HTML.", "PHP-код пишуть між тегами <code>&lt;?php</code> і <code>?&gt;</code>. Вивід на сторінку робить <code>echo</code>. Локальний сервер запускають командою <code>php -S localhost:8000</code>."],
  code: [String.raw`<?php
// це коментар
echo "Привіт, світе!";
echo "<p>2 + 3 = " . (2 + 3) . "</p>";
?>`],
  note: "Кожна інструкція завершується крапкою з комою, а склеювання рядків виконує крапка <code>.</code>, а не плюс.",
  tasks: ["Виведіть на сторінку заголовок і два абзаци за допомогою echo.", "Запустіть вбудований сервер і відкрийте файл у браузері."] },
{ t: "Змінні та типи даних",
  p: ["Імена змінних у PHP починаються зі знака долара. Тип визначається автоматично за значенням: <code>int</code>, <code>float</code>, <code>string</code>, <code>bool</code>.", "У рядках у подвійних лапках змінні підставляються прямо в текст, а в одинарних лапках виводиться буквальний текст."],
  code: [String.raw`<?php
$name = "Олена";
$age = 16;
$height = 1.75;
$isStudent = true;

echo "Привіт, $name! Вам $age років.<br>";
echo 'У одинарних лапках: $name<br>';
var_dump($age, $height, $isStudent);
echo gettype($name);
?>`],
  note: "Функція <code>var_dump</code> показує і значення, і тип. Це головний інструмент налагодження для початківця.",
  tasks: ["Обчисліть площу кола за радіусом і виведіть її з двома знаками (<code>round($s, 2)</code>).", "Виведіть тип значень 7, 7.0 і \"7\" через gettype."] },
{ t: "Умови та цикли",
  p: ["Умови записують через <code>if / elseif / else</code>. Цикли <code>for</code> і <code>while</code> працюють так само, як у C-подібних мовах.", "Для спрощення вибору з багатьох варіантів є <code>match</code>, який повертає значення."],
  code: [String.raw`<?php
$score = 85;

if ($score >= 90) {
    echo "Відмінно";
} elseif ($score >= 75) {
    echo "Добре";
} else {
    echo "Потрібно підтягнути";
}

for ($i = 1; $i <= 5; $i++) {
    echo "Крок $i<br>";
}

$day = 3;
echo match ($day) {
    1 => "Понеділок",
    2 => "Вівторок",
    3 => "Середа",
    default => "Інший день",
};
?>`],
  note: "Оператор <code>===</code> порівнює значення разом із типом, тому <code>0 === \"0\"</code> дає false.",
  tasks: ["Виведіть парні числа від 1 до 20.", "Визначте за номером місяця пору року через match."] },
{ t: "Масиви",
  p: ["Масив у PHP — універсальна структура. Індексований масив зберігає значення за номерами, асоціативний — за ключами-рядками.", "Перебирають масиви циклом <code>foreach</code>. Корисні функції: <code>count</code>, <code>in_array</code>, <code>array_map</code>, <code>sort</code>."],
  code: [String.raw`<?php
$langs = ["PHP", "Go", "Python"];
$langs[] = "Java";
echo count($langs);

$user = ["name" => "Олена", "age" => 16];
echo $user["name"];

foreach ($user as $key => $value) {
    echo "$key: $value<br>";
}

$nums = [3, 1, 2];
sort($nums);
$sq = array_map(fn($n) => $n * $n, $nums);
print_r($sq);
?>`],
  note: "Додати елемент у кінець масиву можна коротким записом <code>$arr[] = значення</code>.",
  tasks: ["Створіть асоціативний масив товару з назвою та ціною й виведіть його циклом.", "Підрахуйте суму чисел масиву за допомогою foreach."] },
{ t: "Функції та обробка форм",
  p: ["Функції оголошують словом <code>function</code>. Для типів параметрів і результату можна додавати анотації, це робить код надійнішим.", "Дані з форми приходять у суперглобальний масив <code>$_POST</code>. Будь-який введений користувачем текст перед виведенням обов'язково екранують функцією <code>htmlspecialchars</code>, щоб захиститись від XSS."],
  code: [String.raw`<?php
function greet(string $name): string {
    return "Привіт, " . htmlspecialchars($name) . "!";
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    echo $name !== "" ? greet($name) : "Введіть ім'я";
}
?>
<form method="post">
  <input type="text" name="name">
  <button>Надіслати</button>
</form>`],
  note: "Ніколи не виводьте дані користувача на сторінку без екранування: це одна з найпоширеніших вразливостей.",
  tasks: ["Зробіть форму з двома числами, що виводить їхню суму.", "Додайте перевірку, що поле не порожнє."] }
];
LESSONS.git = [
{ t: "Що таке Git і перші коміти",
  p: ["Git — система контролю версій: вона запам'ятовує всі зміни коду, дозволяє повернутися до будь-якого стану й працювати над проєктом удвох чи більше людей. Без Git не обходиться жодна команда розробників.", "Основний цикл простий: змінюєте файли, додаєте їх у індекс командою <code>add</code> і фіксуєте стан командою <code>commit</code>."],
  code: [String.raw`git config --global user.name "Ваше Ім'я"
git config --global user.email "you@example.com"

git init
echo "# Мій проєкт" > README.md
git status
git add README.md
git commit -m "Додав README"
git log --oneline`],
  note: "Повідомлення коміту має коротко пояснювати, що змінилося й навіщо. Це перше, що читають колеги.",
  tasks: ["Створіть репозиторій, додайте два файли двома окремими комітами.", "Виведіть історію командою <code>git log --oneline</code>."] },
{ t: "Гілки та злиття",
  p: ["Гілка — окрема лінія розвитку проєкту. Нову функцію пишуть у власній гілці, щоб не зламати основну <code>main</code>.", "Коли робота готова, гілку зливають в основну командою <code>merge</code>."],
  code: [String.raw`git switch -c feature-login
# ...змінюємо файли...
git add .
git commit -m "Додав форму входу"

git switch main
git merge feature-login
git branch -d feature-login
git branch`],
  note: "Перш ніж зливати, переконайтеся, що перебуваєте в тій гілці, у яку хочете влити зміни.",
  tasks: ["Створіть гілку, зробіть у ній коміт і злийте в main.", "Подивіться список гілок командою <code>git branch</code>."] },
{ t: "Віддалений репозиторій: GitHub",
  p: ["Віддалений репозиторій зберігає код на сервері, наприклад на GitHub. Копію проєкту отримують командою <code>clone</code>, відправляють зміни командою <code>push</code>, а забирають чужі зміни командою <code>pull</code>.", "Для зручності віддалений адрес отримує коротке ім'я, зазвичай <code>origin</code>."],
  code: [String.raw`git clone https://github.com/user/project.git
cd project

git remote -v
git pull
# ...змінюємо файли...
git add .
git commit -m "Виправив помилку у формі"
git push origin main`],
  note: "Перед <code>push</code> завжди виконуйте <code>pull</code>: так ви уникнете зайвих конфліктів.",
  tasks: ["Створіть репозиторій на GitHub, склонуйте його й відправте перший коміт.", "Змініть файл у браузері на GitHub і заберіть зміни командою pull."] },
{ t: "Командна робота: pull request і конфлікти",
  p: ["У командах зміни зазвичай не пушать у main напряму. Створюють гілку, відправляють її на GitHub і відкривають <b>pull request</b> — запит на злиття, який переглядають колеги.", "Якщо двоє змінили той самий рядок, виникає конфлікт. Git позначає його маркерами у файлі, а ви залишаєте правильний варіант і робите коміт."],
  code: [String.raw`git switch -c fix-header
git add .
git commit -m "Виправив шапку сайту"
git push -u origin fix-header
# далі відкрийте Pull Request на GitHub

# приклад маркерів конфлікту у файлі:
# <<<<<<< HEAD
# <h1>Привіт</h1>
# =======
# <h1>Вітаю</h1>
# >>>>>>> fix-header

git add index.html
git commit -m "Розв'язав конфлікт"

# файл .gitignore: що не потрапляє в репозиторій
# node_modules
# .env`],
  note: "Файли з паролями та ключами (наприклад <code>.env</code>) ніколи не додавайте в репозиторій. Занесіть їх у <code>.gitignore</code>.",
  tasks: ["Відкрийте pull request у своєму репозиторії зі зміною README.", "Спеціально створіть і розв'яжіть конфлікт у двох гілках."] }
];
LESSONS.bash = [
{ t: "Командний рядок: файли та папки",
  p: ["Командний рядок (термінал) — основний інструмент розробника. У ньому швидко переміщуються по папках, створюють і копіюють файли. На Linux і macOS це Bash, а на Windows його можна отримати через WSL або Git Bash.", "Найважливіші команди: <code>pwd</code> показує поточну папку, <code>ls</code> — вміст, <code>cd</code> переходить, <code>mkdir</code> створює папку."],
  code: [String.raw`pwd
ls -la
mkdir project
cd project
touch index.html style.css
cp index.html backup.html
mv backup.html old.html
rm old.html
cd ..`],
  note: "Команда <code>rm</code> видаляє назавжди, без кошика. Перш ніж запускати її, перевірте шлях двічі.",
  tasks: ["Створіть структуру папок site/css і site/js та по файлу в кожній.", "Скопіюйте папку разом з вмістом командою <code>cp -r</code>."] },
{ t: "Перегляд тексту, пошук і конвеєри",
  p: ["Вміст файлу показує <code>cat</code>, початок — <code>head</code>, кінець — <code>tail</code>. Пошук по тексту виконує <code>grep</code>.", "Символ <code>|</code> передає вивід однієї команди на вхід іншої, а <code>&gt;</code> записує результат у файл. З таких простих деталей збирають потужні команди."],
  code: [String.raw`cat notes.txt
head -n 5 notes.txt
tail -n 5 notes.txt

grep "error" server.log
grep -i -n "warning" server.log

ls | wc -l
cat server.log | grep "error" | wc -l
ls -la > files.txt`],
  note: "Прапорець <code>-i</code> у grep ігнорує регістр, а <code>-n</code> показує номери рядків.",
  tasks: ["Порахуйте кількість рядків із словом «error» у лог-файлі.", "Збережіть список файлів поточної папки у файл files.txt."] },
{ t: "Права доступу та перші скрипти",
  p: ["Кожен файл має права на читання, запис і виконання для власника, групи та інших. Змінити їх можна командою <code>chmod</code>.", "Скрипт — це файл із командами, який запускається одним викликом. Перший рядок <code>#!/bin/bash</code> каже системі, чим його виконувати."],
  code: [String.raw`#!/bin/bash
# файл backup.sh
name="project"
echo "Копіюю $name..."

for f in *.txt; do
    cp "$f" "backup_$f"
    echo "Скопійовано $f"
done

# запуск:
# chmod +x backup.sh
# ./backup.sh`],
  note: "Змінну у Bash створюють без пробілів навколо знака <code>=</code>: <code>name=\"x\"</code> працює, а <code>name = \"x\"</code> — ні.",
  tasks: ["Напишіть скрипт, що створює папку з поточною датою (<code>date +%F</code>).", "Додайте скрипту права на виконання й запустіть його."] }
];
Object.assign(CHAPTERS, {
  php: [["Основи", 0], ["Керування й дані", 2], ["Веб і форми", 4]],
  git: [["Основи Git", 0], ["Робота в команді", 2]],
  bash: [["Файли й папки", 0], ["Текст і скрипти", 1]]
});
["php", "git", "bash"].forEach(k => CHAPTERS[k].forEach(([name, from], i, a) => {
  const to = i + 1 < a.length ? a[i + 1][1] : LESSONS[k].length;
  for (let j = from; j < to; j++) LESSONS[k][j].ch = name;
}));

/* ===== TypeScript: 12 уроків ===== */
(function () {
  const N = {"setup": {"t": "Встановлення та налаштування", "p": ["TypeScript працює через компілятор: ви пишете файли <code>.ts</code>, а він перевіряє типи й створює звичайний JavaScript. Потрібен лише Node.js: після його встановлення компілятор додають у проєкт командами нижче.", "Налаштування компілятора зберігаються у файлі <code>tsconfig.json</code>. Найважливіший параметр — <code>\"strict\": true</code>: він вмикає суворі перевірки, які ловлять більшість помилок."], "code": ["# термінал\nmkdir ts-demo && cd ts-demo\nnpm init -y\nnpm install --save-dev typescript\nnpx tsc --init\n\n# hello.ts\nconst message: string = \"Привіт, TypeScript!\";\nconsole.log(message);\n\n# компіляція та запуск\nnpx tsc\nnode hello.js", "// tsconfig.json (скорочено)\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"module\": \"commonjs\",\n    \"outDir\": \"dist\",\n    \"strict\": true\n  },\n  \"include\": [\"src\"]\n}"], "note": "Для швидкого запуску без окремої компіляції можна скористатись командою <code>npx tsx hello.ts</code>.", "easy": "TypeScript — це перекладач із суворим коректором: ви пишете код із типами, він знаходить помилки й видає звичайний JavaScript.", "work": "У будь-якому робочому проєкті є <code>tsconfig.json</code>, а режим <code>strict</code> майже завжди увімкнений. Помилки компілятора читають так само уважно, як помилки в консолі: у них вказано файл, рядок і причину.", "tasks": ["Створіть проєкт, скомпілюйте hello.ts і запустіть результат.", "Увімкніть strict і подивіться, які помилки з'являються у вашому коді."]}, "basic": {"t": "Базові типи", "p": ["Прості типи — <code>string</code>, <code>number</code>, <code>boolean</code>. Масив записують як <code>number[]</code>, а кортеж — як масив фіксованої довжини з типом кожного елемента: <code>[string, number]</code>.", "Тип <code>any</code> вимикає перевірки й його варто уникати. Замість нього використовують <code>unknown</code>: значення невідомого типу, яке перед використанням потрібно перевірити. Типи часто не пишуть явно, бо TypeScript сам виводить їх зі значення."], "code": ["let title: string = \"Курс\";\nlet price: number = 199;\nlet isFree: boolean = false;\n\nconst tags: string[] = [\"ts\", \"js\"];\nconst point: [number, number] = [10, 20];\n\nenum Role { Admin, Editor, Viewer }\nconst r: Role = Role.Editor;\n\nlet inferred = 42;      // TypeScript сам визначив: number\n// inferred = \"сорок\";  // помилка", "let value: unknown = \"текст\";\n// console.log(value.length);  // помилка: тип невідомий\n\nif (typeof value === \"string\") {\n  console.log(value.length);   // тепер можна\n}\n\nfunction fail(msg: string): never {\n  throw new Error(msg);\n}"], "note": "Явні типи потрібні для параметрів функцій і публічних даних, а для звичайних локальних змінних їх зазвичай не вказують.", "easy": "Тип каже, що саме лежить у змінній: число, текст чи список. Якщо покласти не те, компілятор одразу підкаже.", "work": "Тип <code>any</code> на код-рев'ю викликає питання, тому в командах вважається поганим тоном. Якщо тип справді невідомий, беруть <code>unknown</code> і перевіряють його.", "tasks": ["Опишіть змінні для імені, віку та списку навичок з правильними типами.", "Перевірте, що буде, якщо присвоїти рядок змінній типу number."]}, "funcs": {"t": "Типізація функцій", "p": ["У функції типізують параметри та значення, що повертається. Необов'язковий параметр позначають знаком <code>?</code>, а значення за замовчуванням задають через <code>=</code>. Якщо функція нічого не повертає, її тип результату — <code>void</code>.", "Тип самої функції записують у вигляді <code>(a: number) =&gt; string</code>. Так описують колбеки, які передають в інші функції."], "code": ["function add(a: number, b: number): number {\n  return a + b;\n}\n\nfunction greet(name: string, greeting: string = \"Привіт\"): string {\n  return greeting + \", \" + name;\n}\n\nfunction log(msg: string, level?: string): void {\n  console.log((level ?? \"info\") + \": \" + msg);\n}", "type Mapper = (n: number) => string;\n\nfunction convert(list: number[], fn: Mapper): string[] {\n  return list.map(fn);\n}\nconsole.log(convert([1, 2, 3], n => \"№\" + n));\n\nconst sum = (...nums: number[]): number =>\n  nums.reduce((s, n) => s + n, 0);\nconsole.log(sum(1, 2, 3));"], "note": "Параметри стрілкових функцій у колбеках часто типізувати не треба: TypeScript бере тип із контексту.", "easy": "Типи в сигнатурі функції — це договір: що вона приймає на вході й що гарантовано поверне.", "work": "Читаючи чужий код, ви спершу дивитесь на сигнатури функцій: за ними видно, як ними користуватися, не заглядаючи всередину. Тому в командах просять завжди типізувати параметри та результат експортованих функцій.", "tasks": ["Напишіть функцію average(nums: number[]): number.", "Опишіть тип колбека для кнопки, що приймає рядок і нічого не повертає."]}, "narrow": {"t": "Звуження типів", "p": ["Коли значення має кілька можливих типів, TypeScript дозволяє лише спільні дії. Щоб скористатись конкретними, потрібно звузити тип перевіркою: <code>typeof</code>, <code>instanceof</code>, <code>in</code> або порівнянням.", "Особливо зручні розрізнювані об'єднання: кожен варіант має спільне поле-мітку (наприклад <code>kind</code>), за яким компілятор точно знає, з яким варіантом працює."], "code": ["type Circle = { kind: \"circle\"; radius: number };\ntype Square = { kind: \"square\"; side: number };\ntype Shape = Circle | Square;\n\nfunction area(s: Shape): number {\n  if (s.kind === \"circle\") {\n    return Math.PI * s.radius ** 2;\n  }\n  return s.side ** 2;\n}\n\nconsole.log(area({ kind: \"circle\", radius: 2 }));", "function process(v: string | string[] | null): string {\n  if (v === null) return \"порожньо\";\n  if (Array.isArray(v)) return v.join(\", \");\n  return v.toUpperCase();\n}\n\nfunction assertNever(x: never): never {\n  throw new Error(\"Невідомий варіант: \" + x);\n}"], "note": "Якщо додати новий варіант у об'єднання, а перевірку за <code>never</code> залишити, компілятор вкаже всі місця, які треба оновити.", "easy": "Звуження — це перевірка пропуску на вході: після неї компілятор точно знає, хто перед ним, і дозволяє відповідні дії.", "work": "Розрізнювані об'єднання — стандартний спосіб описати стани: «завантажується», «успіх», «помилка». Такий підхід широко застосовують у React-проєктах і при роботі з відповідями API.", "tasks": ["Опишіть тип Result із варіантами success (з даними) та error (з повідомленням) і функцію, що його обробляє.", "Додайте до Shape третій варіант і подивіться, що скаже компілятор."]}, "alias": {"t": "type та interface: розширення і перетини", "p": ["Псевдонім <code>type</code> дає ім'я будь-якому типу: об'єднанню, кортежу чи об'єкту. Інтерфейс <code>interface</code> описує тільки форму об'єкта, зате вміє розширюватись ключовим словом <code>extends</code>.", "Перетин <code>A &amp; B</code> створює тип, що має поля обох. Модифікатор <code>readonly</code> забороняє змінювати поле після створення."], "code": ["interface Entity {\n  readonly id: number;\n}\n\ninterface User extends Entity {\n  name: string;\n  email?: string;\n}\n\ntype Timestamps = { createdAt: Date; updatedAt: Date };\ntype UserRecord = User & Timestamps;\n\nconst rec: UserRecord = {\n  id: 1, name: \"Олена\",\n  createdAt: new Date(), updatedAt: new Date()\n};\n// rec.id = 2; // помилка: readonly", "type Id = number | string;\ntype Handler = (event: string) => void;\n\nconst scores: Record<string, number> = { anna: 90, taras: 75 };\nscores[\"olena\"] = 82;"], "note": "Правило для вибору: для об'єктів зазвичай беруть <code>interface</code>, для об'єднань, функцій та інших типів — <code>type</code>. Головне — дотримуватись одного стилю в проєкті.", "easy": "interface і type майже взаємозамінні: interface звик описувати об'єкти, а type — усе інше, зокрема варіанти «або».", "work": "Загальні поля (id, дати створення) виносять в окремий базовий тип і розширюють ним решту типів. Так не доводиться повторювати однаковий опис у десятках місць.", "tasks": ["Опишіть Product, що розширює базовий Entity, і додайте readonly-поле.", "Створіть тип-словник Record<string, boolean> для прапорців функцій."]}, "classes": {"t": "Класи в TypeScript", "p": ["У класах TypeScript поля та методи мають модифікатори доступу: <code>public</code> (за замовчуванням), <code>private</code> (лише всередині класу) і <code>protected</code> (у класі та нащадках). Модифікатор <code>readonly</code> забороняє змінювати поле.", "Параметри конструктора з модифікатором автоматично стають полями класу, тому код стає коротшим. Клас може реалізувати інтерфейс через <code>implements</code>: компілятор перевірить, що всі потрібні методи є."], "code": ["class Account {\n  private balance = 0;\n\n  constructor(public readonly owner: string) {}\n\n  deposit(amount: number): void {\n    if (amount <= 0) throw new Error(\"Сума має бути додатною\");\n    this.balance += amount;\n  }\n  getBalance(): number {\n    return this.balance;\n  }\n}\n\nconst acc = new Account(\"Олена\");\nacc.deposit(100);\nconsole.log(acc.getBalance());\n// acc.balance = 5; // помилка: private", "interface Logger {\n  log(message: string): void;\n}\n\nclass ConsoleLogger implements Logger {\n  log(message: string): void {\n    console.log(\"[LOG]\", message);\n  }\n}"], "note": "Модифікатор <code>private</code> діє лише на етапі компіляції. Для справжньої приватності на рівні JavaScript використовують поля з символом <code>#</code>.", "easy": "Модифікатори доступу — це замки на дверях класу: private відчиняється лише зсередини.", "work": "Класи з <code>private</code>-полями та інтерфейсами — основа backend-проєктів на TypeScript, зокрема Node.js фреймворків NestJS і Angular. Запис <code>constructor(private service: Service)</code> ви побачите в них на кожному кроці.", "tasks": ["Напишіть клас Timer з приватним полем лічильника та методами start і stop.", "Опишіть інтерфейс Storage і дві його реалізації: у пам'яті та в localStorage."]}, "utility": {"t": "Утилітарні типи", "p": ["Утилітарні типи — це готові «функції для типів», які створюють новий тип на основі наявного. <code>Partial&lt;T&gt;</code> робить усі поля необов'язковими, <code>Required&lt;T&gt;</code> — обов'язковими, <code>Readonly&lt;T&gt;</code> — незмінними.", "<code>Pick&lt;T, Keys&gt;</code> залишає лише вказані поля, <code>Omit&lt;T, Keys&gt;</code> прибирає їх, а <code>Record&lt;K, V&gt;</code> створює словник. Їхня головна цінність — не копіювати той самий тип вручну."], "code": ["interface User {\n  id: number;\n  name: string;\n  email: string;\n  password: string;\n}\n\ntype UserUpdate = Partial<User>;                      // усі поля необов'язкові\ntype PublicUser = Omit<User, \"password\">;             // без пароля\ntype UserPreview = Pick<User, \"id\" | \"name\">;\ntype UserMap = Record<number, PublicUser>;\n\nfunction update(id: number, changes: UserUpdate) {\n  console.log(\"Оновлюємо\", id, changes);\n}\nupdate(1, { name: \"Нове ім'я\" });", "const config: Readonly<{ url: string; retries: number }> = {\n  url: \"https://api.example.com\",\n  retries: 3\n};\n// config.retries = 5; // помилка\n\ntype Fn = (a: number) => string;\ntype Result = ReturnType<Fn>;   // string"], "note": "Утилітарні типи можна комбінувати: наприклад, <code>Partial&lt;Omit&lt;User, \"id\"&gt;&gt;</code> підходить для форми редагування.", "easy": "Утилітарні типи — це готові інструменти для перетворення вже наявних типів, як фільтри в фоторедакторі.", "work": "Для форм редагування, відповідей API без чутливих полів і словників даних утилітарні типи використовують постійно. Вони зменшують дублювання, а значить і ризик розбіжності між типами.", "tasks": ["Створіть тип для оновлення товару через Partial та Omit.", "Зробіть тип публічного профілю без поля email."]}, "apits": {"t": "TypeScript у реальному проєкті: API та модулі", "p": ["Дані із сервера TypeScript не перевіряє: метод <code>response.json()</code> повертає <code>any</code>. Тому форму відповіді описують інтерфейсом, а в критичних місцях додатково перевіряють дані під час виконання.", "Типи між файлами передають тими самими <code>export</code> та <code>import</code>. Для бібліотек на чистому JavaScript існують пакети з типами <code>@types/…</code>, які встановлюють як dev-залежність."], "code": ["// types.ts\nexport interface Post {\n  id: number;\n  title: string;\n  body: string;\n}\n\n// api.ts\nimport type { Post } from \"./types\";\n\nconst API = \"https://jsonplaceholder.typicode.com\";\n\nexport async function getPost(id: number): Promise<Post> {\n  const r = await fetch(API + \"/posts/\" + id);\n  if (!r.ok) throw new Error(\"Помилка: \" + r.status);\n  const data: unknown = await r.json();\n  if (!isPost(data)) throw new Error(\"Некоректна відповідь сервера\");\n  return data;\n}\n\nfunction isPost(v: unknown): v is Post {\n  return typeof v === \"object\" && v !== null &&\n    typeof (v as Post).id === \"number\" &&\n    typeof (v as Post).title === \"string\";\n}", "# термінал\nnpm install --save-dev @types/node\nnpm install axios        # у багатьох бібліотек типи вже вбудовані"], "note": "Функція з типом результату <code>v is Post</code> називається захисником типу: після її успішної перевірки компілятор вважає значення типом Post.", "easy": "Дані із сервера — це чорна скринька: TypeScript не знає, що в ній, доки ви не опишете й не перевірите вміст.", "work": "Розбіжність між типом на фронтенді та реальною відповіддю сервера — одна з найпоширеніших причин багів. У командах типи для API часто генерують із специфікації, а в невеликих проєктах описують вручну й перевіряють на вході.", "tasks": ["Опишіть інтерфейс користувача з jsonplaceholder і напишіть типізовану функцію getUser.", "Додайте захисник типу, що перевіряє наявність полів id та name."]}};
  const easyOld = {"Від JavaScript до TypeScript": "Типи — це етикетки на коробках: компілятор не дозволить покласти слова в коробку з написом «число».", "Union-типи та літерали": "Union — це «або»: значення може бути одним з кількох заздалегідь описаних варіантів.", "Інтерфейси та об'єкти": "Інтерфейс — це анкета-шаблон: які поля обов'язкові, які ні і якого типу кожне.", "Узагальнення (generics)": "Generic — це шаблон із порожнім місцем для типу: функцію пишуть один раз, а працює вона з будь-яким типом."};
  const workOld = {"Від JavaScript до TypeScript": "Більшість нових вакансій для веброзробників згадують TypeScript. Поступовий перехід нормальний: у проєкті файли <code>.js</code> і <code>.ts</code> можуть співіснувати, а типи додають по одному файлу.", "Union-типи та літерали": "Літеральні типи замінюють «магічні рядки»: замість довільного тексту статус замовлення можна обрати лише з дозволеного списку, а опечатку компілятор помітить одразу.", "Інтерфейси та об'єкти": "Інтерфейси — це документація для колег: за ними видно, які дані очікує компонент або функція, і не потрібно вгадувати форму об'єкта.", "Узагальнення (generics)": "Generics ви побачите в Promise&lt;T&gt;, Array&lt;T&gt; та в бібліотеках на кшталт React. Писати власні потрібно рідше, але читати їх обов'язково."};
  const byTitle = {};
  LESSONS.ts.forEach(l => { byTitle[l.t] = l; l.easy = easyOld[l.t]; l.work = workOld[l.t]; });
  const T = t => { if (!byTitle[t]) throw new Error("Немає уроку: " + t); return byTitle[t]; };
  LESSONS.ts = [N.setup, T("Від JavaScript до TypeScript"), N.basic, N.funcs, T("Union-типи та літерали"), N.narrow,
    T("Інтерфейси та об'єкти"), N.alias, N.classes, T("Узагальнення (generics)"), N.utility, N.apits];
  CHAPTERS.ts = [["Початок", 0], ["Типи", 2], ["Структури даних", 6], ["Просунуті можливості", 9]];
  CHAPTERS.ts.forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS.ts.length;
    for (let j = from; j < to; j++) LESSONS.ts[j].ch = name;
  });
})();


/* ===== GIT: 10 уроків ===== */
(function () {
  const N = {"setup": {"t": "Встановлення Git і налаштування", "p": ["Завантажте Git із git-scm.com і встановіть із типовими параметрами. На Windows разом із ним з'явиться термінал Git Bash. Перевірте установку командою <code>git --version</code>. Також створіть безкоштовний обліковий запис на GitHub: це місце, де зберігають код і працюють у команді.", "Одноразово вкажіть своє ім'я та пошту: вони потраплять у кожен ваш коміт. Для безпечної роботи з GitHub створіть SSH-ключ і додайте його публічну частину в налаштуваннях облікового запису (Settings → SSH keys). Так не доведеться вводити пароль при кожному відправленні змін."], "code": ["git --version\n\ngit config --global user.name \"Ваше Ім'я\"\ngit config --global user.email \"you@example.com\"\ngit config --global init.defaultBranch main\ngit config --global core.editor \"code --wait\"\ngit config --list\n\n# SSH-ключ для GitHub\nssh-keygen -t ed25519 -C \"you@example.com\"\ncat ~/.ssh/id_ed25519.pub     # цей рядок вставте в налаштування GitHub\nssh -T git@github.com"], "note": "Приватний ключ (файл без <code>.pub</code>) нікому не передавайте й не завантажуйте в репозиторій. У GitHub додають лише публічний.", "easy": "Git — це журнал змін вашого коду з машиною часу, а GitHub — хмарна бібліотека, куди цей журнал можна відправити й показати колегам.", "work": "На першому ж робочому дні вам видадуть доступ до репозиторію компанії, і перше, що потрібно, — налаштований Git і SSH-ключ. Пошта в налаштуваннях має збігатись із поштою в GitHub, інакше коміти не прив'яжуться до вашого профілю.", "tasks": ["Встановіть Git і налаштуйте ім'я та пошту.", "Створіть SSH-ключ, додайте його в GitHub і перевірте з'єднання."]}, "undo": {"t": "Перегляд і скасування змін", "p": ["Перш ніж фіксувати зміни, дивіться, що саме змінилося: <code>git status</code> показує список файлів, а <code>git diff</code> — самі рядки. Файли, які не мають потрапляти в репозиторій (паролі, залежності, зібрані файли), перераховують у <code>.gitignore</code>.", "Скасувати можна по-різному. <code>git restore</code> відновлює файл до останнього коміту, <code>git restore --staged</code> прибирає файл з індексу, <code>git commit --amend</code> виправляє останній коміт, а <code>git revert</code> створює новий коміт, що скасовує старий, і тому безпечний для спільної історії."], "code": ["git status\ngit diff                       # зміни, ще не додані в індекс\ngit diff --staged              # зміни, додані в індекс\n\ngit restore index.html         # відкинути зміни у файлі\ngit restore --staged style.css # прибрати з індексу, зміни лишаються\n\ngit commit --amend -m \"Виправлене повідомлення\"\n\ngit revert a1b2c3d             # новий коміт, що скасовує a1b2c3d\n\n# .gitignore\nnode_modules/\n.env\ndist/\n*.log"], "note": "Команда <code>git reset --hard</code> безповоротно видаляє незафіксовані зміни. Перед її запуском переконайтесь, що вони вам справді не потрібні.", "easy": "restore — це «відмінити останні правки у файлі», amend — «переписати останній запис у журналі», а revert — «додати новий запис, що скасовує старий».", "work": "Помилки трапляються з усіма, і вміння їх безболісно виправити відрізняє впевненого розробника. Золоте правило: якщо коміт уже відправлено в спільну гілку, не переписуйте його, а скасовуйте через revert.", "tasks": ["Змініть файл, перегляньте diff і відкотіть зміни через restore.", "Зробіть коміт із помилкою в повідомленні й виправте його через amend."]}, "stash": {"t": "Stash, cherry-pick та rebase", "p": ["Іноді потрібно терміново перемкнутись на іншу гілку, а поточна робота ще не готова до коміту. <code>git stash</code> ховає незафіксовані зміни «у шухляду», а <code>git stash pop</code> повертає їх. Команда <code>git cherry-pick</code> переносить один конкретний коміт в іншу гілку.", "<code>git rebase</code> перебудовує вашу гілку поверх свіжої версії іншої гілки, і історія виглядає лінійною, без зайвих злиттів. Інтерактивний режим (<code>rebase -i</code>) дозволяє об'єднати кілька дрібних комітів в один і виправити їхні повідомлення."], "code": ["# терміновий перехід, робота ще не готова\ngit stash\ngit switch hotfix\n# ...виправили, закомітили...\ngit switch feature-login\ngit stash pop\n\n# перенести один коміт\ngit cherry-pick a1b2c3d\n\n# оновити свою гілку відносно main\ngit switch feature-login\ngit fetch origin\ngit rebase origin/main\n\n# об'єднати останні три коміти в один\ngit rebase -i HEAD~3"], "note": "Ніколи не робіть rebase гілок, які вже відправлені й використовуються іншими: це переписує історію й ламає чужу роботу.", "easy": "stash — це шухляда для незакінченої роботи, cherry-pick — копіювання однієї сторінки з чужого зошита, а rebase — переписування вашої частини історії так, ніби ви почали з найсвіжішого стану.", "work": "У командах просять перед pull request оновити гілку відносно main і зібрати дрібні коміти «fix typo» в один змістовний. Це робить історію читабельною та спрощує пошук помилок.", "tasks": ["Сховайте незакінчені зміни через stash і поверніть їх.", "Об'єднайте три маленькі коміти в один через rebase -i."]}, "flow": {"t": "Процеси в командах: гілки та повідомлення комітів", "p": ["У командах домовляються про схему роботи з гілками. Найпростіша: головна гілка <code>main</code> завжди робоча, нова функція чи виправлення створюються в окремій гілці (наприклад, <code>feature/login</code> або <code>fix/header-bug</code>), після ревʼю гілка зливається через pull request.", "Повідомлення комітів теж мають формат. Популярний стандарт — Conventional Commits: тип, двокрапка і короткий опис (<code>feat</code>, <code>fix</code>, <code>docs</code>, <code>refactor</code>, <code>test</code>, <code>chore</code>)."], "code": ["git switch -c feature/user-profile\ngit commit -m \"feat: add user profile page\"\ngit commit -m \"fix: correct avatar size on mobile\"\ngit commit -m \"docs: describe profile settings in README\"\ngit push -u origin feature/user-profile\n# далі відкриваємо Pull Request на GitHub\n\n# хороше повідомлення відповідає на питання «що зроблено і навіщо»\n# погано: \"зміни\", \"fix\", \"123\"\n# добре:  \"fix: prevent double submit on payment form\" "], "note": "Один коміт — одна логічна зміна. Не змішуйте виправлення помилки й форматування половини проєкту в одному коміті.", "easy": "Гілка feature — це чернетка, а pull request — прохання колег прочитати її перед тим, як вона потрапить у чистову версію.", "work": "На співбесіді з Git часто питають «як ви працюєте в команді»: розкажіть про окремі гілки, pull request, ревʼю й зрозумілі повідомлення. Це показує, що ви знаєте реальний процес.", "tasks": ["Створіть гілку за схемою feature/…, зробіть два коміти за Conventional Commits і відправте її.", "Перепишіть три погані повідомлення комітів у зрозумілому форматі."]}, "release": {"t": "Теги, релізи та GitHub Actions", "p": ["Тег — це постійна позначка на конкретному коміті, найчастіше для версії програми: <code>v1.0.0</code>. Версії зазвичай нумерують за схемою SemVer: мажорна.мінорна.виправлення. На GitHub із тега створюють реліз із описом змін.", "GitHub Actions автоматично запускає завдання після подій у репозиторії: тести, перевірку коду, збирання, публікацію. Налаштування описують у файлі YAML у папці <code>.github/workflows</code>."], "code": ["git tag v1.0.0\ngit tag -a v1.1.0 -m \"Додано профіль користувача\"\ngit push origin --tags\ngit tag\n\n# .github/workflows/ci.yml\nname: CI\non:\n  push:\n    branches: [main]\n  pull_request:\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test"], "note": "Відступи в YAML значущі: використовуйте пробіли, не табуляцію, і стежте за вирівнюванням рядків.", "easy": "Тег — це закладка у книзі на версії, яку ви випустили. GitHub Actions — робот, що перевіряє ваш код щоразу, коли ви його оновлюєте.", "work": "У більшості компаній код перевіряється автоматично: pull request не можна злити, поки не пройшли тести. Прочитати та трохи поправити чужий файл workflow — типове завдання для початківця.", "tasks": ["Поставте тег v0.1.0 на свій репозиторій і відправте його.", "Додайте найпростіший workflow, що виводить «Hello» при кожному push."]}, "recover": {"t": "Пошук помилок та відновлення: log, blame, bisect, reflog", "p": ["Історію переглядають командою <code>git log</code> з зручними прапорцями. <code>git blame</code> показує, хто й коли змінив кожен рядок файлу. А <code>git bisect</code> двійковим пошуком швидко знаходить коміт, що вніс помилку: ви лише відповідаєте «добре» чи «погано».", "Якщо ви випадково видалили гілку чи зробили невдалий reset, допоможе <code>git reflog</code>. Він зберігає всі переміщення вказівника HEAD, і з нього можна відновити «втрачений» коміт."], "code": ["git log --oneline --graph --decorate\ngit log --author=\"Олена\" --since=\"2 weeks ago\"\ngit log -p -- src/app.js          # зміни конкретного файлу\ngit blame src/app.js\n\n# пошук коміту з помилкою\ngit bisect start\ngit bisect bad                    # поточна версія зламана\ngit bisect good v1.0.0            # ця версія працювала\n# Git переключає на проміжні коміти, ви тестуєте й відповідаєте:\ngit bisect good    # або   git bisect bad\ngit bisect reset\n\n# відновлення\ngit reflog\ngit switch -c rescue a1b2c3d"], "note": "Git майже ніколи не видаляє дані одразу: навіть «втрачені» коміти зазвичай живуть у reflog кілька тижнів.", "easy": "log — це журнал подій, blame — «хто це написав», bisect — гра в «гарячо-холодно» для пошуку зламаного коміту, а reflog — страховий запис усіх ваших кроків.", "work": "Коли в проєкті раптом щось зламалося, бісект швидко знаходить момент. Вміння відновити «пропалий» коміт через reflog рятує і нерви, і дедлайни.", "tasks": ["Знайдіть командою blame, хто останнім змінив певний рядок.", "Видаліть тестову гілку й відновіть її через reflog."]}};
  const easyOld = {"Що таке Git і перші коміти": "Коміт — це знімок вашого проєкту в певний момент. Git зберігає ланцюжок таких знімків, до яких можна повернутись будь-коли.", "Гілки та злиття": "Гілка — це паралельна лінія роботи: можна експериментувати, не ламаючи основну версію, а потім злити результат.", "Віддалений репозиторій: GitHub": "Віддалений репозиторій — це копія вашого проєкту на сервері: push відправляє туди зміни, а pull забирає чужі.", "Командна робота: pull request і конфлікти": "Pull request — це прохання «подивіться мої зміни й прийміть їх». Конфлікт — ситуація, коли двоє змінили той самий рядок і Git просить вас обрати правильний варіант."};
  const workOld = {"Що таке Git і перші коміти": "Без Git не працює жодна команда розробників. Дрібні й змістовні коміти потрібні, щоб історія була зрозумілою, а будь-яку зміну можна було знайти й скасувати.", "Гілки та злиття": "У реальних проєктах ніхто не працює безпосередньо в main. Для кожного завдання створюють окрему гілку, і це перше, чого очікують від новачка в команді.", "Віддалений репозиторій: GitHub": "Звичка перед початком роботи робити pull, а після завершення push — основа спільної роботи. GitHub також слугує вашим портфоліо, тож стежте за охайністю репозиторіїв.", "Командна робота: pull request і конфлікти": "Ревʼю коду — звичайна частина роботи. Конфлікти трапляються регулярно, і вміння спокійно їх розв'язати цінується більше, ніж страх перед ними."};
  const byTitle = {};
  LESSONS.git.forEach(l => { byTitle[l.t] = l; l.easy = easyOld[l.t]; l.work = workOld[l.t]; });
  const T = t => { if (!byTitle[t]) throw new Error("Немає уроку: " + t); return byTitle[t]; };
  LESSONS.git = [N.setup, T("Що таке Git і перші коміти"), N.undo, T("Гілки та злиття"), T("Віддалений репозиторій: GitHub"),
    T("Командна робота: pull request і конфлікти"), N.stash, N.flow, N.release, N.recover];
  CHAPTERS.git = [["Початок", 0], ["Щоденна робота", 2], ["GitHub і команда", 4], ["Просунуті прийоми", 6]];
  CHAPTERS.git.forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS.git.length;
    for (let j = from; j < to; j++) LESSONS.git[j].ch = name;
  });
})();

/* ===== BASH ===== */
(function () {
  const key = "bash";
  const N = {"find": {"t": "Пошук файлів і обробка тексту", "p": ["Команда <code>find</code> шукає файли за назвою, типом, розміром чи датою зміни. Для обробки тексту є невеликі утиліти, які поєднують конвеєром: <code>sort</code> сортує, <code>uniq</code> прибирає сусідні дублікати, <code>cut</code> вирізає стовпчики, <code>wc</code> рахує, <code>sed</code> замінює текст, <code>awk</code> обробляє таблиці.", "Із них складаються потужні однорядкові команди: наприклад, порахувати, скільки разів зустрівся кожен IP-адрес у лозі, одним рядком із кількох утиліт."], "code": ["find . -name \"*.log\"\nfind . -type f -size +10M\nfind . -name \"*.tmp\" -mtime +7 -delete\n\nsort names.txt | uniq -c | sort -rn | head -5\ncut -d',' -f2 students.csv\nsed 's/Python/Go/g' notes.txt\nawk -F',' '{ sum += $2 } END { print sum / NR }' students.csv\n\n# топ-5 адрес у лозі\ncut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -5"], "note": "Перед командою <code>find ... -delete</code> спершу запустіть її без <code>-delete</code>, щоб побачити, що саме буде видалено.", "easy": "Кожна утиліта — це простий інструмент: сортувальник, лічильник, ножиці. Конвеєр з'єднує їх у лінію, де кожна робить свій крок.", "work": "Розбір логів, швидка перевірка вмісту CSV, масова заміна в файлах — щоденні справи для адміністраторів і бекенд-розробників. Однорядкова команда часто економить години ручної роботи.", "tasks": ["Знайдіть усі файли .txt у папці та підпапках.", "Порахуйте, скільки унікальних значень у певному стовпчику CSV."]}, "env": {"t": "Змінні середовища та PATH", "p": ["Змінні середовища — це пари імен і значень, доступні всім програмам, що запускаються в терміналі. Їх виводить <code>printenv</code>, а значення читається через <code>$ІМ'Я</code>. Змінну для поточної сесії створюють командою <code>export</code>.", "Змінна <code>PATH</code> містить список папок, де система шукає виконувані файли. Тому команди <code>git</code> чи <code>python</code> запускаються з будь-якого місця. Постійні налаштування записують у файл <code>~/.bashrc</code>."], "code": ["echo $HOME\necho $PATH\nprintenv | head\n\nexport API_KEY=\"secret123\"\necho $API_KEY\n\nwhich python\nexport PATH=\"$PATH:$HOME/tools\"\n\n# постійно: додати у ~/.bashrc і перезавантажити\necho 'export EDITOR=nano' >> ~/.bashrc\nsource ~/.bashrc"], "note": "Секрети (ключі API, паролі) тримають у змінних середовища чи файлі <code>.env</code>, а не в коді, і не публікують у Git.", "easy": "PATH — це список полиць, на яких система шукає інструмент, коли ви вимовляєте його назву. Змінні середовища — записки, доступні всім програмам.", "work": "У будь-якому проєкті конфігурація (адреса бази, ключі) передається через змінні середовища. Помилка «command not found» зазвичай означає, що програми немає в PATH.", "tasks": ["Створіть змінну й виведіть її значення.", "Додайте свою папку зі скриптами до PATH."]}, "logic": {"t": "Умови, цикли та функції в скриптах", "p": ["Скрипти Bash підтримують гілки <code>if</code>, цикли <code>for</code> та <code>while</code>, а також функції. Умови пишуть у подвійних квадратних дужках: <code>[[ -f file ]]</code> (файл існує), <code>[[ $a -gt 5 ]]</code> (більше), <code>[[ $s == \"ok\" ]]</code> (рядки рівні).", "Скрипт отримує аргументи через <code>$1</code>, <code>$2</code>, а код завершення останньої команди зберігає <code>$?</code>: нуль означає успіх. Змінні в лапки беруть завжди: <code>\"$name\"</code>."], "code": ["#!/bin/bash\nset -e                       # зупинитись при першій помилці\n\ngreet() {\n  echo \"Привіт, $1!\"\n}\n\nif [[ $# -lt 1 ]]; then\n  echo \"Використання: $0 <ім'я>\"\n  exit 1\nfi\ngreet \"$1\"\n\nfor file in *.txt; do\n  if [[ -s \"$file\" ]]; then\n    echo \"$file не порожній\"\n  fi\ndone\n\ncount=1\nwhile [[ $count -le 3 ]]; do\n  echo \"Крок $count\"\n  ((count++))\ndone"], "note": "Забули лапки навколо змінної з пробілом у значенні — і Bash розіб'є її на кілька слів. Завжди пишіть <code>\"$var\"</code>.", "easy": "Скрипт — це рецепт для терміналу: ті самі команди, що ви вводили руками, зібрані в файл із розвилками й повторами.", "work": "Автоматизація — серце роботи DevOps: бекапи, розгортання, перевірка сервера. Початківцю дають змінити або розширити існуючий скрипт, тож треба вміти його прочитати.", "tasks": ["Напишіть скрипт, що приймає ім'я файлу й повідомляє, чи він існує.", "Створіть функцію, що виводить поточну дату й повідомлення."]}, "proc": {"t": "Процеси, сигнали та cron", "p": ["Кожна запущена програма — це процес. Список процесів показує <code>ps aux</code> та інтерактивний <code>top</code>. Команду можна запустити у фоні знаком <code>&amp;</code>, а зупинити за ідентифікатором командою <code>kill</code>. Сигнал <code>SIGTERM</code> просить завершитись, а <code>kill -9</code> примусово убиває процес.", "Для запуску за розкладом використовують <code>cron</code>. Розклад задають п'ятьма полями: хвилина, година, день місяця, місяць, день тижня."], "code": ["ps aux | grep python\ntop\nsleep 300 &                 # у фоні\njobs\nkill 12345                  # м'яко\nkill -9 12345               # примусово\n\n# crontab -e: щодня о 03:00 запускати резервну копію\n0 3 * * * /home/user/backup.sh >> /home/user/backup.log 2>&1\n# кожні 15 хвилин\n*/15 * * * * /home/user/check.sh"], "note": "Спершу використовуйте звичайний <code>kill</code> і лише якщо процес не реагує — <code>kill -9</code>: примусове завершення не дає програмі зберегти дані.", "easy": "Процес — це запущена програма, як працівник на заводі. kill — наказ йому піти, а cron — будильник, що запускає потрібну роботу за розкладом.", "work": "Зависла програма, зайнятий порт, завдання за розкладом на сервері — типові задачі. Умієте знайти процес і зупинити його — ви вже вирішили половину інцидентів.", "tasks": ["Запустіть команду у фоні й завершіть її через kill.", "Складіть запис cron для запуску скрипта щопонеділка о 9:00."]}, "net": {"t": "Мережа та SSH", "p": ["Для роботи з мережею в терміналі є <code>curl</code> (виконує запити й показує відповідь), <code>wget</code> (завантажує файли), <code>ping</code> (перевіряє доступність). Служба <code>ssh</code> дозволяє безпечно під'єднатися до віддаленого сервера й працювати в його терміналі.", "Копіювати файли на сервер і з нього можна через <code>scp</code>, а для постійного доступу без пароля використовують пару SSH-ключів."], "code": ["curl https://api.github.com/users/octocat\ncurl -s https://api.github.com/users/octocat | head -5\ncurl -X POST -H \"Content-Type: application/json\" \\\n     -d '{\"title\":\"Привіт\"}' https://jsonplaceholder.typicode.com/posts\nwget https://example.com/file.zip\nping -c 3 google.com\n\nssh user@192.168.1.10\nscp report.pdf user@192.168.1.10:/home/user/\nscp user@192.168.1.10:/var/log/app.log ."], "note": "Права на файл приватного ключа мають бути суворими: <code>chmod 600 ~/.ssh/id_ed25519</code>, інакше SSH відмовиться ним користуватись.", "easy": "curl — це браузер без вікна: він просить сторінку чи дані в сервера й виводить відповідь у термінал. ssh — захищений тунель до чужого комп'ютера.", "work": "Розробники роблять тестові запити до API через curl, підключаються по SSH до серверів і завантажують логи. Ці команди ви побачите в кожній інструкції з розгортання.", "tasks": ["Отримайте через curl дані з будь-якого відкритого API.", "Завантажте файл за допомогою wget і перевірте його."]}};
  const easyOld = {"Командний рядок: файли та папки": "Термінал — це текстове керування комп'ютером: замість мишки ви пишете команди, і система виконує їх.", "Перегляд тексту, пошук і конвеєри": "Конвеєр — це лінія на фабриці: вихід однієї команди одразу йде на вхід наступної.", "Права доступу та перші скрипти": "Права доступу — це ключі від кімнат: хто може читати, змінювати чи запускати файл. Скрипт — рецепт із команд."};
  const workOld = {"Командний рядок: файли та папки": "Більшість серверів не мають графічного інтерфейсу, тож уся робота з ними відбувається в терміналі. Швидка навігація й файлові команди — основа роботи розробника.", "Перегляд тексту, пошук і конвеєри": "grep і конвеєри використовують для пошуку помилок у логах — це перше, що роблять, коли на сервері щось пішло не так.", "Права доступу та перші скрипти": "Помилка «Permission denied» траплялась кожному. Розуміння прав і вміння написати простий скрипт — стандартні вимоги до початківця в DevOps та бекенді."};
  const byTitle = {};
  LESSONS[key].forEach(l => { byTitle[l.t] = l; l.easy = easyOld[l.t]; l.work = workOld[l.t]; });
  const T = t => { if (!byTitle[t]) throw new Error("Немає уроку: " + t); return byTitle[t]; };
  LESSONS[key] = [T("Командний рядок: файли та папки"), T("Перегляд тексту, пошук і конвеєри"), N.find, N.env, T("Права доступу та перші скрипти"), N.logic, N.proc, N.net];
  CHAPTERS[key] = [["Файли й текст", 0], ["Середовище та скрипти", 3], ["Система й мережа", 6]];
  CHAPTERS[key].forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS[key].length;
    for (let j = from; j < to; j++) LESSONS[key][j].ch = name;
  });
})();

/* ===== PHP ===== */
(function () {
  const key = "php";
  const N = {"strings": {"t": "Рядки та вбудовані функції", "p": ["У PHP багато готових функцій для роботи з рядками: <code>strlen</code> (довжина в байтах), <code>mb_strlen</code> (довжина в символах, правильна для кирилиці), <code>strtoupper</code>, <code>trim</code>, <code>str_replace</code>, <code>substr</code>, <code>strpos</code>, <code>explode</code> (рядок у масив) та <code>implode</code> (масив у рядок).", "Для кирилиці обирайте функції з префіксом <code>mb_</code>: звичайні рахують байти й ламають українські літери. Вивід чисел із форматуванням робить <code>number_format</code>, а дати — <code>date</code>."], "code": ["<?php\n$text = \"  Привіт, PHP!  \";\necho strlen($text), \" \", mb_strlen($text), \"<br>\";   // байти й символи\necho mb_strtoupper(trim($text)), \"<br>\";\necho str_replace(\"PHP\", \"світе\", $text), \"<br>\";\n\n$parts = explode(\",\", \"яблуко,груша,слива\");\necho count($parts), \" \", implode(\" | \", $parts), \"<br>\";\n\necho str_contains($text, \"PHP\") ? \"є\" : \"немає\", \"<br>\";\necho number_format(1234567.891, 2, \",\", \" \"), \"<br>\";   // 1 234 567,89\necho date(\"d.m.Y H:i\"), \"<br>\";\necho ucfirst(\"олена\"), \" \", mb_substr(\"Привіт\", 0, 3);\n?>"], "note": "Для рядків із кирилицею використовуйте лише функції з префіксом <code>mb_</code>, інакше текст може «зламатися».", "easy": "Рядкові функції — це набір ножиць, лінійок і клею для тексту: обрізати, склеїти, розбити, замінити.", "work": "Обробка введеного тексту (очищення, перевірка, форматування) трапляється в кожній формі й кожному звіті. Проблеми з кирилицею (<code>strlen</code> замість <code>mb_strlen</code>) — типова помилка початківців.", "tasks": ["Напишіть функцію, що перетворює ім'я на формат «Іван П.».", "Розбийте рядок із словами через explode і виведіть найдовше слово."]}, "oop": {"t": "Класи та об'єкти в PHP", "p": ["Клас описується словом <code>class</code>, а об'єкт створюється через <code>new</code>. Модифікатори доступу: <code>public</code>, <code>protected</code>, <code>private</code>. Конструктор — метод <code>__construct</code>. З PHP 8 властивості можна оголошувати прямо в параметрах конструктора.", "Наслідування працює через <code>extends</code>, а спільну поведінку описують інтерфейсами (<code>interface</code>) і трейтами. Простір імен <code>namespace</code> розділяє класи за папками, як у файловій системі."], "code": ["<?php\ndeclare(strict_types=1);\n\ninterface Describable {\n    public function describe(): string;\n}\n\nclass Product implements Describable {\n    public function __construct(\n        private string $title,\n        private float $price,\n    ) {}\n\n    public function getPrice(): float { return $this->price; }\n\n    public function withDiscount(int $percent): float {\n        return $this->price * (100 - $percent) / 100;\n    }\n\n    public function describe(): string {\n        return \"{$this->title}: {$this->price} грн\";\n    }\n}\n\nclass DigitalProduct extends Product {\n    public function describe(): string {\n        return parent::describe() . \" (цифровий)\";\n    }\n}\n\n$p = new DigitalProduct(\"Курс PHP\", 500.0);\necho $p->describe(), \"<br>\";\necho $p->withDiscount(20);\n?>"], "note": "Директива <code>declare(strict_types=1)</code> вмикає сувору перевірку типів аргументів: у сучасних проєктах вона стоїть на початку кожного файлу.", "easy": "Клас — це креслення, а об'єкт — виріб за ним. Модифікатори доступу — замки: private відчиняється лише зсередини.", "work": "Сучасний PHP — це в основному ООП: Laravel, Symfony і WordPress-плагіни складаються з класів. Розуміння класів, інтерфейсів і просторів імен потрібне на кожній PHP-вакансії.", "tasks": ["Опишіть клас User із приватними полями та методом, що повертає повне ім'я.", "Створіть клас-нащадок Admin і перевизначте метод опису."]}, "pdo": {"t": "База даних із PHP: PDO", "p": ["PDO (PHP Data Objects) — єдиний спосіб підключення до різних баз даних: MySQL, PostgreSQL, SQLite. Підключення створює об'єкт <code>PDO</code>. Запити виконують через підготовлені вирази: у текст запиту вставляють позначки <code>:name</code> або <code>?</code>, а значення передають окремо.", "Підготовлені вирази — головний захист від SQL-ін'єкцій: значення ніколи не вставляються в текст запиту напряму. Режим помилок <code>ERRMODE_EXCEPTION</code> змушує PDO кидати винятки замість мовчазних збоїв."], "code": ["<?php\n$pdo = new PDO(\"sqlite:app.db\");\n$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);\n\n$pdo->exec(\"CREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    email TEXT UNIQUE NOT NULL\n)\");\n\n$stmt = $pdo->prepare(\"INSERT INTO users (name, email) VALUES (:name, :email)\");\n$stmt->execute([\":name\" => \"Олена\", \":email\" => \"o@x.ua\"]);\n\n$stmt = $pdo->prepare(\"SELECT * FROM users WHERE email = :email\");\n$stmt->execute([\":email\" => \"o@x.ua\"]);\n$user = $stmt->fetch();\necho htmlspecialchars($user[\"name\"]);\n\nforeach ($pdo->query(\"SELECT id, name FROM users\") as $row) {\n    echo $row[\"id\"], \": \", htmlspecialchars($row[\"name\"]), \"<br>\";\n}\n?>"], "note": "Ніколи не збирайте SQL склеюванням рядків із даними користувача. Тільки <code>prepare</code> та <code>execute</code>.", "easy": "Підготовлений вираз — шаблон бланка з порожніми клітинками: значення вписують окремо, і база сприймає їх лише як дані, а не як команди.", "work": "Практично кожен PHP-проєкт працює з базою, а SQL-ін'єкції досі входять у топ вразливостей. Підготовлені вирази і екранування виводу (<code>htmlspecialchars</code>) — вимога на будь-якому ревʼю.", "tasks": ["Створіть таблицю товарів і додайте три записи через PDO.", "Виведіть усі записи у вигляді HTML-списку."]}, "auth": {"t": "Сесії, cookies та авторизація", "p": ["HTTP не пам'ятає користувача між запитами, тому використовують <b>сесії</b>: сервер зберігає дані й видає браузеру ідентифікатор у cookie. Сесію запускає <code>session_start()</code>, а дані лежать у масиві <code>$_SESSION</code>.", "Паролі не зберігають у відкритому вигляді. Функція <code>password_hash</code> створює безпечний хеш, а <code>password_verify</code> перевіряє пароль. Після входу в сесію записують id користувача, а після виходу знищують її."], "code": ["<?php\nsession_start();\n\n// реєстрація: зберігаємо лише хеш\n$hash = password_hash(\"MySecret123\", PASSWORD_DEFAULT);\n\n// вхід\nfunction login(PDO $pdo, string $email, string $password): bool {\n    $stmt = $pdo->prepare(\"SELECT id, password_hash FROM users WHERE email = :e\");\n    $stmt->execute([\":e\" => $email]);\n    $user = $stmt->fetch();\n    if ($user && password_verify($password, $user[\"password_hash\"])) {\n        session_regenerate_id(true);\n        $_SESSION[\"user_id\"] = $user[\"id\"];\n        return true;\n    }\n    return false;\n}\n\n// захищена сторінка\nif (!isset($_SESSION[\"user_id\"])) {\n    header(\"Location: /login.php\");\n    exit;\n}\n\n// вихід\n$_SESSION = [];\nsession_destroy();\n?>"], "note": "Після успішного входу викликайте <code>session_regenerate_id(true)</code>: це захищає від підміни сесії.", "easy": "Сесія — гардеробний номерок: сервер пам'ятає вміст, а у вас лише номер. password_hash — незворотний «відбиток» пароля: навіть адміністратор не прочитає оригінал.", "work": "Реєстрація і вхід — найчастіше завдання в тестових для PHP-розробників. Перевіряють, чи не зберігаєте ви паролі відкрито, чи використовуєте підготовлені вирази й екранування.", "tasks": ["Реалізуйте сторінки реєстрації та входу з password_hash.", "Додайте захищену сторінку, доступну лише після входу."]}, "composer": {"t": "Composer та структура проєкту", "p": ["Composer — менеджер залежностей PHP: він встановлює бібліотеки з packagist.org і налаштовує автозавантаження класів. Залежності описані в <code>composer.json</code>, а точні версії фіксує <code>composer.lock</code>. Папку <code>vendor</code> у Git не додають.", "Стандарт PSR-4 пов'язує простір імен із папкою: клас <code>App\\Models\\User</code> лежить у <code>src/Models/User.php</code>. Точка входу сайту зазвичай одна — <code>public/index.php</code>, а решта коду лежить поза публічною папкою."], "code": ["# термінал\ncomposer init\ncomposer require vlucas/phpdotenv\ncomposer require --dev phpunit/phpunit\ncomposer install        # встановити залежності з composer.lock\ncomposer dump-autoload\n\n# composer.json (скорочено)\n{\n  \"require\": { \"vlucas/phpdotenv\": \"^5.6\" },\n  \"autoload\": { \"psr-4\": { \"App\\\\\": \"src/\" } }\n}\n\n# структура\nproject/\n├── public/index.php\n├── src/Models/User.php\n├── .env\n├── composer.json\n└── vendor/\n\n// public/index.php\n<?php\nrequire __DIR__ . \"/../vendor/autoload.php\";\nuse App\\Models\\User;\n$user = new User(\"Олена\");"], "note": "Файл <code>.env</code> із паролями й ключами додайте в <code>.gitignore</code> і не публікуйте в репозиторій.", "easy": "Composer — це магазин бібліотек із чіткою накладною: composer.lock фіксує, яку саме версію кожного товару ви купили.", "work": "Жодна сучасна PHP-вакансія не обходиться без Composer і PSR-4. Laravel, Symfony і більшість бібліотек підключаються саме так, тому створення проєкту із застосуванням Composer — перше, що показують на роботі.", "tasks": ["Створіть проєкт через composer init і підключіть будь-яку бібліотеку.", "Розкладіть свої класи за PSR-4 і підключіть автозавантаження."]}};
  const easyOld = {"Перша програма на PHP": "PHP виконується на сервері: він збирає сторінку й віддає браузеру вже готовий HTML.", "Змінні та типи даних": "Змінна в PHP починається зі знака долара й сама визначає тип за вмістом.", "Умови та цикли": "if — розвилка, for і foreach — повтори. match — зручний перемикач із кількох варіантів.", "Масиви": "Масив у PHP — універсальна шафа: нумеровані полиці або полиці з назвами.", "Функції та обробка форм": "Функція — рецепт, а форма — спосіб отримати дані від людини. Дані від користувача завжди екрануємо."};
  const workOld = {"Перша програма на PHP": "У роботі PHP майже ніколи не пишуть «голим»: використовують фреймворки (Laravel, Symfony) та CMS (WordPress). Але базове розуміння того, що відбувається на сервері, потрібне всім.", "Змінні та типи даних": "У сучасних проєктах вмикають сувору типізацію та анотації типів: так помилки видно до запуску.", "Умови та цикли": "Умови й цикли — основа обробки даних із бази та форм. Читабельні умови (ранній вихід замість вкладених if) цінуються в рев'ю.", "Масиви": "Асоціативні масиви в PHP — це й словники, й записи з бази, і конфігурація. Функції <code>array_map</code>, <code>array_filter</code> використовують постійно.", "Функції та обробка форм": "Валідація й екранування даних форм — обов'язкові. XSS досі одна з найпоширеніших вразливостей, і її шукають на кожному ревʼю."};
  const byTitle = {};
  LESSONS[key].forEach(l => { byTitle[l.t] = l; l.easy = easyOld[l.t]; l.work = workOld[l.t]; });
  const T = t => { if (!byTitle[t]) throw new Error("Немає уроку: " + t); return byTitle[t]; };
  LESSONS[key] = [T("Перша програма на PHP"), T("Змінні та типи даних"), N.strings, T("Умови та цикли"), T("Масиви"), T("Функції та обробка форм"), N.oop, N.pdo, N.auth, N.composer];
  CHAPTERS[key] = [["Основи", 0], ["Функції та форми", 5], ["ООП і бази даних", 6], ["Авторизація та проєкт", 8]];
  CHAPTERS[key].forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS[key].length;
    for (let j = from; j < to; j++) LESSONS[key][j].ch = name;
  });
})();

/* ===== PASCAL ===== */
(function () {
  const key = "pascal";
  const N = {"setup": {"t": "Встановлення Free Pascal та Lazarus", "p": ["Pascal — навчальна мова з чіткою структурою, зручна для перших алгоритмів. Для роботи встановіть Free Pascal (<code>fpc</code>) або середовище Lazarus із freepascal.org. Є також онлайн-компілятори, які не потребують встановлення.", "Збирається програма командою <code>fpc</code>. Збережіть код у файл із розширенням <code>.pas</code>, скомпілюйте й запустіть результат."], "code": ["fpc -iV                      // версія компілятора\n\n// hello.pas\nprogram Hello;\nbegin\n  writeln('Привіт, Pascal!');\nend.\n\nfpc hello.pas\n./hello                      // на Windows: hello.exe"], "note": "Назва файлу має бути без пробілів і кирилиці. Якщо кирилиця в консолі Windows відображається некоректно, змініть кодування командою <code>chcp 1251</code>.", "easy": "Pascal — це мова-тренажер: вона не дозволяє розслабитись і вчить писати програми чітко та по порядку.", "work": "На роботі Pascal зустрічається рідко (здебільшого в старих системах і Delphi-проєктах). Але алгоритмічне мислення, яке ви тут тренуєте, переноситься на Python, C++ чи Java майже без змін.", "tasks": ["Встановіть Free Pascal і запустіть першу програму.", "Спробуйте онлайн-компілятор і виведіть своє ім'я."]}, "loops": {"t": "Цикли while та repeat", "p": ["Цикл <code>while умова do</code> виконується, поки умова істинна; умову перевіряють <b>перед</b> кожним проходом. Цикл <code>repeat ... until умова</code> виконується, поки умова хибна, а перевіряють її <b>після</b> проходу, тому тіло виконається щонайменше один раз.", "Складні умови комбінують операторами <code>and</code>, <code>or</code>, <code>not</code>, а кожну частину беруть у дужки. Для кількох дій у тілі потрібен блок <code>begin ... end</code>."], "code": ["var\n  n, sum: integer;\nbegin\n  // while: сума чисел, поки не введено 0\n  sum := 0;\n  readln(n);\n  while n <> 0 do\n  begin\n    sum := sum + n;\n    readln(n);\n  end;\n  writeln('Сума: ', sum);\n\n  // repeat: запит, поки не введено додатне число\n  repeat\n    write('Введіть додатне число: ');\n    readln(n);\n  until n > 0;\n  writeln('Дякую, ', n);\nend."], "note": "У умовах Pascal порівняння з логічними операторами обов'язково беруть у дужки: <code>(a &gt; 0) and (b &gt; 0)</code>.", "easy": "while перевіряє «чи можна заходити?» біля дверей, а repeat спершу заходить і лише потім питає «чи залишатись?».", "work": "Вибір між циклами з перевіркою до і після — класична тема алгоритмів. Розуміючи різницю тут, ви легко перенесете її в <code>while</code> і <code>do-while</code> інших мов.", "tasks": ["Знайдіть кількість цифр числа за допомогою while.", "Напишіть гру «вгадай число» з repeat."]}, "arrays": {"t": "Масиви", "p": ["Масив зберігає кілька значень одного типу під одним іменем. Його оголошують із діапазоном індексів: <code>a: array[1..10] of integer</code>. На відміну від багатьох мов, діапазон в Pascal задає сам програміст, і нумерація може починатись з будь-якого числа.", "Для обробки масивів використовують цикл <code>for</code>. Типові задачі: сума, пошук максимуму, пошук елемента, сортування. Двовимірний масив — це таблиця: <code>array[1..3, 1..3] of integer</code>."], "code": ["var\n  a: array[1..5] of integer;\n  i, max, sum: integer;\n  m: array[1..3, 1..3] of integer;\n  j: integer;\nbegin\n  for i := 1 to 5 do\n  begin\n    write('a[', i, '] = ');\n    readln(a[i]);\n  end;\n\n  max := a[1];\n  sum := 0;\n  for i := 1 to 5 do\n  begin\n    sum := sum + a[i];\n    if a[i] > max then max := a[i];\n  end;\n  writeln('Сума: ', sum, ', максимум: ', max);\n\n  for i := 1 to 3 do\n    for j := 1 to 3 do\n      m[i, j] := i * j;\n  writeln('m[2,3] = ', m[2, 3]);\nend."], "note": "Вихід за межі масиву (наприклад, <code>a[6]</code> для <code>array[1..5]</code>) призводить до помилки. Ввімкніть перевірку діапазонів: <code>{$R+}</code>.", "easy": "Масив — ряд нумерованих комірок. Алгоритм перебору (for) обходить усі комірки одну за одною.", "work": "Задачі на масиви — основа початкових співбесід: сума, максимум, пошук, розворот, сортування. Навичка, що тренується в Pascal, повністю переноситься в будь-яку мову.", "tasks": ["Знайдіть мінімальний елемент масиву та його номер.", "Відсортуйте масив методом «бульбашки»."]}, "procs": {"t": "Процедури та функції", "p": ["Підпрограми розбивають велику програму на частини. <b>Процедура</b> виконує дії й нічого не повертає, <b>функція</b> повертає значення (результат присвоюють змінній із назвою функції або <code>Result</code>). Параметри за замовчуванням передаються за значенням; ключове слово <code>var</code> перед параметром передає його за посиланням, і підпрограма може змінити оригінал.", "Підпрограми оголошують у розділі до головного блока <code>begin ... end.</code>. Змінні всередині підпрограми локальні й існують лише в ній."], "code": ["function Max(a, b: integer): integer;\nbegin\n  if a > b then Result := a\n  else Result := b;\nend;\n\nfunction IsEven(n: integer): boolean;\nbegin\n  Result := n mod 2 = 0;\nend;\n\nprocedure Swap(var a, b: integer);\nvar\n  t: integer;\nbegin\n  t := a;\n  a := b;\n  b := t;\nend;\n\nprocedure Greet(name: string);\nbegin\n  writeln('Привіт, ', name, '!');\nend;\n\nvar\n  x, y: integer;\nbegin\n  x := 3; y := 8;\n  writeln(Max(x, y), ' ', IsEven(x));\n  Swap(x, y);\n  writeln(x, ' ', y);          // 8 3\n  Greet('Олена');\nend."], "note": "Параметр без <code>var</code> — це копія значення: зміни всередині підпрограми не вплинуть на оригінал.", "easy": "Процедура — це «зроби щось», функція — «порахуй і поверни результат». var-параметр — це дати підпрограмі сам оригінал, а не копію.", "work": "Розбиття програми на малі підпрограми — головне правило охайного коду в будь-якій мові. На роботі довгі шматки «лапшою» просять розбити.", "tasks": ["Напишіть функцію, що перевіряє, чи число просте.", "Створіть процедуру, що виводить масив у зворотному порядку."]}, "strings": {"t": "Рядки та записи", "p": ["Тип <code>string</code> зберігає текст. Корисні функції: <code>Length</code>, <code>Copy</code> (частина рядка), <code>Pos</code> (пошук підрядка), <code>UpperCase</code>, <code>Delete</code>, <code>Insert</code>, а окремий символ доступний за індексом <code>s[1]</code>. Склеюють рядки знаком <code>+</code>.", "Запис (<code>record</code>) об'єднує кілька полів різних типів в один тип. Це «картка» з полями, як у анкеті. Масив записів — проста «таблиця даних»."], "code": ["type\n  TStudent = record\n    Name: string;\n    Age: integer;\n    Grade: real;\n  end;\n\nvar\n  s, word: string;\n  i, count: integer;\n  st: TStudent;\n  group: array[1..3] of TStudent;\nbegin\n  s := 'Привіт, Pascal!';\n  writeln(Length(s), ' ', Copy(s, 1, 6), ' ', Pos('Pascal', s));\n  writeln(UpperCase('hello'));\n\n  count := 0;\n  for i := 1 to Length(s) do\n    if s[i] = 'a' then count := count + 1;\n  writeln('Літер a: ', count);\n\n  st.Name := 'Олена';\n  st.Age := 16;\n  st.Grade := 11.5;\n  writeln(st.Name, ' ', st.Age, ' ', st.Grade:0:1);\n\n  for i := 1 to 3 do\n  begin\n    group[i].Name := 'Учень ' + IntToStr(i);\n    group[i].Grade := 8 + i;\n  end;\n  writeln(group[2].Name, ' ', group[2].Grade:0:0);\nend."], "note": "Для <code>IntToStr</code> підключіть модуль <code>SysUtils</code>: <code>uses SysUtils;</code> на початку програми.", "easy": "Запис — це анкета з полями різних типів, а масив записів — стос таких анкет.", "work": "Описувати об'єкт реального світу структурою з полями (користувач, товар, замовлення) — основа будь-якого програмування. У інших мовах це структури, класи чи словники.", "tasks": ["Опишіть запис «Книга» і виведіть масив із трьох книг.", "Порахуйте кількість слів у рядку."]}};
  const easyOld = {"Структура програми на Pascal": "Програма на Pascal має суворий порядок: заголовок, оголошення, потім блок команд між begin та end.", "Змінні та ввід-вивід": "Змінні в Pascal оголошуються заздалегідь, у розділі var. Це як перелік інструментів перед роботою.", "Умовний оператор і цикл for": "if вибирає шлях, а for повторює дію задану кількість разів."};
  const workOld = {"Структура програми на Pascal": "Порядок «оголошення, потім код» привчає думати наперед. У більшості сучасних мов така структура неявна, але звичка залишається.", "Змінні та ввід-вивід": "Явні типи й оголошення — гарна школа точності. Далі в Python чи JavaScript ви оціните, що вже розумієте, що відбувається з даними.", "Умовний оператор і цикл for": "Умови й цикли — універсальні будівельні блоки. Те, що ви тут вивчаєте, переноситься в будь-яку мову майже без змін."};
  const byTitle = {};
  LESSONS[key].forEach(l => { byTitle[l.t] = l; l.easy = easyOld[l.t]; l.work = workOld[l.t]; });
  const T = t => { if (!byTitle[t]) throw new Error("Немає уроку: " + t); return byTitle[t]; };
  LESSONS[key] = [N.setup, T("Структура програми на Pascal"), T("Змінні та ввід-вивід"), T("Умовний оператор і цикл for"), N.loops, N.arrays, N.procs, N.strings];
  CHAPTERS[key] = [["Початок", 0], ["Основи", 2], ["Дані та підпрограми", 5]];
  CHAPTERS[key].forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS[key].length;
    for (let j = from; j < to; j++) LESSONS[key][j].ch = name;
  });
})();

export { LESSONS, CHAPTERS };
