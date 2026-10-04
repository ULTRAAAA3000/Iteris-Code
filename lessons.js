/* Iteris Code — уроки. Кожен урок: t (назва), p (абзаци), code (блоки коду), note (важливе), tasks (завдання) */
const LESSONS = {
python: [
{ t: "Перша програма: print і коментарі",
  p: ["Python читає програму зверху вниз і виконує кожен рядок по черзі. Найпростіша дія — вивести текст на екран функцією <code>print()</code>.", "Усе, що йде після знака <code>#</code>, Python ігнорує. Так у код додають пояснення для людей."],
  code: ['print("Привіт, світе!")\n# це коментар, його не видно у виводі\nprint(2 + 3)\nprint("2 + 3 =", 2 + 3)'],
  note: "Текст завжди беруть у лапки, а вирази без лапок обчислюються: <code>print(2 + 3)</code> виведе 5.",
  tasks: ["Виведіть своє ім'я та місто двома окремими print.", "Виведіть результат виразу 15 * 4 - 7."] },
{ t: "Змінні та типи даних",
  p: ["Змінна — це ім'я, під яким у пам'яті зберігається значення. Її створюють знаком <code>=</code>, окрема команда оголошення не потрібна.", "Основні типи: <code>int</code> (ціле), <code>float</code> (дробове), <code>str</code> (рядок) і <code>bool</code> (True або False). Дізнатися тип можна функцією <code>type()</code>."],
  code: ['age = 16\nheight = 1.75\nname = "Олена"\nis_student = True\n\nprint(name, age, height, is_student)\nprint(type(age), type(height), type(name))\n\nage = age + 1\nprint("Наступного року:", age)'],
  note: "Імена змінних не можуть починатися з цифри й не містять пробілів. Python розрізняє <code>age</code> і <code>Age</code>.",
  tasks: ["Збережіть у змінних свою вагу та зріст і виведіть їх.", "Перевірте type() для значень 7, 7.0 і \"7\"."] },
{ t: "Ввід даних і розгалуження",
  p: ["Функція <code>input()</code> зупиняє програму й чекає, поки користувач щось введе. Результат завжди рядок, тому для чисел його перетворюють через <code>int()</code> або <code>float()</code>.", "Конструкція <code>if / elif / else</code> дозволяє вибрати одну з гілок. Тіло гілки позначають відступом у чотири пробіли."],
  code: ['age = int(input("Скільки вам років? "))\n\nif age < 12:\n    print("Дитячий квиток")\nelif age < 18:\n    print("Підлітковий квиток")\nelse:\n    print("Дорослий квиток")'],
  note: "Порівняння записують так: <code>==</code> дорівнює, <code>!=</code> не дорівнює, <code>&lt;=</code> і <code>&gt;=</code> нестрогі нерівності.",
  tasks: ["Напишіть програму, що визначає, парне число чи непарне (підказка: <code>n % 2</code>).", "Додайте до квитків окрему гілку для віку від 65 років."] },
{ t: "Цикли for і while",
  p: ["Цикл повторює блок коду. <code>for</code> зручний, коли відомо, скільки разів повторювати, а <code>while</code> працює, поки умова істинна.", "Функція <code>range(a, b)</code> дає числа від a до b-1. Якщо умова у while ніколи не стане хибною, цикл не закінчиться."],
  code: ['for i in range(1, 6):\n    print("Крок", i)\n\nsum_ = 0\nn = 1\nwhile n <= 100:\n    sum_ += n\n    n += 1\nprint("Сума від 1 до 100:", sum_)'],
  note: "Запис <code>x += 1</code> — це скорочення від <code>x = x + 1</code>.",
  tasks: ["Виведіть таблицю множення на 7 від 1 до 10.", "За допомогою while знайдіть, скільки разів число 1000 ділиться на 2 націло."] }
],
cpp: [
{ t: "Перша програма на C++",
  p: ["C++ — компільована мова: спочатку код перетворюється на виконуваний файл, потім запускається. Кожна програма починається з функції <code>main</code>.", "Рядок <code>#include &lt;iostream&gt;</code> підключає бібліотеку вводу-виводу, а <code>cout</code> виводить дані в консоль."],
  code: ['#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Привіт, світе!" << endl;\n    cout << "2 + 3 = " << 2 + 3 << endl;\n    return 0;\n}'],
  note: "Кожна інструкція завершується крапкою з комою. Її відсутність — найчастіша помилка новачків.",
  tasks: ["Виведіть три рядки: ім'я, клас, улюблений предмет.", "Виведіть результат виразу (8 + 4) * 3."] },
{ t: "Змінні, типи та ввід",
  p: ["У C++ тип змінної потрібно вказати під час оголошення: <code>int</code> для цілих, <code>double</code> для дробових, <code>char</code> для символу, <code>string</code> для тексту.", "Читати значення з клавіатури допомагає <code>cin</code>."],
  code: ['#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n    cout << "Ім\'я: ";\n    cin >> name;\n    cout << "Вік: ";\n    cin >> age;\n    cout << name << ", через 5 років вам буде " << age + 5 << endl;\n    return 0;\n}'],
  note: "Ділення цілих чисел відкидає дробову частину: <code>7 / 2</code> дає 3, а <code>7 / 2.0</code> дає 3.5.",
  tasks: ["Прочитайте два числа й виведіть їхню суму та добуток.", "Обчисліть площу кола за радіусом (число пі візьміть як 3.14)."] },
{ t: "Умови та цикли",
  p: ["Умовний оператор <code>if</code> працює так само, як у інших мовах, а тіло гілки береться у фігурні дужки.", "Для повторень є <code>for</code> з трьома частинами (початок, умова, крок) і <code>while</code>."],
  code: ['#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        cout << "Парне" << endl;\n    } else {\n        cout << "Непарне" << endl;\n    }\n    for (int i = 1; i <= n; i++) {\n        cout << i << " ";\n    }\n    cout << endl;\n    return 0;\n}'],
  note: "Один знак <code>=</code> присвоює значення, два знаки <code>==</code> порівнюють.",
  tasks: ["Виведіть усі парні числа від 1 до n.", "Підрахуйте суму цифр числа за допомогою while (підказка: <code>% 10</code> і <code>/ 10</code>)."] }
],
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
html: [
{ t: "Структура HTML-документа",
  p: ["HTML описує зміст сторінки за допомогою тегів. Більшість тегів парні: відкривальний <code>&lt;p&gt;</code> і закривальний <code>&lt;/p&gt;</code>.", "Кожна сторінка має однакову основу: <code>head</code> містить службову інформацію, а <code>body</code> те, що бачить користувач."],
  code: ['<!DOCTYPE html>\n<html lang="uk">\n<head>\n  <meta charset="utf-8">\n  <title>Мій перший сайт</title>\n</head>\n<body>\n  <h1>Привіт, світе!</h1>\n  <p>Це мій перший абзац.</p>\n</body>\n</html>'],
  note: "Без <code>&lt;meta charset=\"utf-8\"&gt;</code> українські літери можуть відображатися некоректно.",
  tasks: ["Створіть сторінку з вашим іменем у заголовку та двома абзацами.", "Змініть заголовок вкладки браузера через тег title."] },
{ t: "Заголовки, списки та посилання",
  p: ["Заголовки <code>h1</code>–<code>h6</code> задають структуру тексту: h1 один на сторінку, далі за рівнями. Маркований список — <code>ul</code>, нумерований — <code>ol</code>, а кожен пункт — <code>li</code>.", "Посилання створює тег <code>a</code> з атрибутом <code>href</code>, а картинку — <code>img</code> з атрибутами <code>src</code> і <code>alt</code>."],
  code: ['<h2>Мої хобі</h2>\n<ul>\n  <li>Програмування</li>\n  <li>Футбол</li>\n</ul>\n\n<ol>\n  <li>Прокинутись</li>\n  <li>Написати код</li>\n</ol>\n\n<a href="https://developer.mozilla.org" target="_blank">Довідник MDN</a>'],
  note: "Атрибут <code>alt</code> у зображення обов'язковий: його читають програми екранного доступу.",
  tasks: ["Зробіть нумерований список зі своїх п'яти планів на тиждень.", "Додайте посилання на улюблений сайт, що відкривається в новій вкладці."] },
{ t: "Таблиці та форми",
  p: ["Таблицю будують із рядків <code>tr</code>, у яких стоять комірки <code>td</code> або заголовкові <code>th</code>.", "Форма збирає дані користувача. Кожне поле — це <code>input</code> із типом (<code>text</code>, <code>email</code>, <code>number</code>), а підпис прив'язується тегом <code>label</code>."],
  code: ['<table border="1">\n  <tr><th>Мова</th><th>Рік</th></tr>\n  <tr><td>Python</td><td>1991</td></tr>\n  <tr><td>JavaScript</td><td>1995</td></tr>\n</table>\n\n<form>\n  <label for="n">Ім\'я</label>\n  <input id="n" type="text" required>\n  <button type="submit">Надіслати</button>\n</form>'],
  note: "Зв'язок <code>label for</code> і <code>id</code> дає клік по підпису для фокусу на полі.",
  tasks: ["Створіть таблицю розкладу з трьох уроків.", "Додайте форму реєстрації з полями імені, пошти та віку."] }
],
css: [
{ t: "Підключення CSS і селектори",
  p: ["CSS описує зовнішній вигляд HTML-елементів. Правило складається з селектора та блоку властивостей у фігурних дужках.", "Селектор може бути за тегом (<code>p</code>), класом (<code>.card</code>) або id (<code>#main</code>). Файл стилів підключають у head."],
  code: ['<link rel="stylesheet" href="style.css">\n\n/* style.css */\nbody {\n  font-family: Arial, sans-serif;\n}\nh1 {\n  color: #2F5BEA;\n}\n.card {\n  background: #f4f6ff;\n  border-radius: 8px;\n}\n#main {\n  max-width: 600px;\n}'],
  note: "Клас можна застосувати до багатьох елементів, а id має бути унікальним на сторінці.",
  tasks: ["Змініть колір і розмір шрифту для всіх абзаців.", "Створіть клас <code>.warn</code> із червоним текстом і застосуйте його до одного елемента."] },
{ t: "Блочна модель",
  p: ["Кожен елемент — це прямокутна коробка з чотирьох шарів: вміст, внутрішній відступ (<code>padding</code>), рамка (<code>border</code>) і зовнішній відступ (<code>margin</code>).", "Властивість <code>box-sizing: border-box</code> змушує width враховувати padding і рамку, тому розміри стають передбачуваними."],
  code: ['* {\n  box-sizing: border-box;\n}\n.box {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #14213D;\n  margin: 16px auto;\n}'],
  note: "Значення <code>margin: 16px auto</code> центрує блок по горизонталі, якщо задана ширина.",
  tasks: ["Зробіть блок шириною 400px із рамкою й відступами та відцентруйте його.", "Поекспериментуйте: як зміниться розмір, якщо прибрати box-sizing?"] },
{ t: "Flexbox: розташування елементів",
  p: ["Flexbox вишиковує дочірні елементи в рядок або стовпчик. Достатньо задати батьківському елементу <code>display: flex</code>.", "Вирівнювання вздовж головної осі відповідає за <code>justify-content</code>, а впоперек — <code>align-items</code>. Властивість <code>gap</code> задає проміжок між елементами."],
  code: ['.menu {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.menu a {\n  flex: 1 1 120px;\n}'],
  note: "Щоб елементи йшли стовпчиком, додайте <code>flex-direction: column</code>.",
  tasks: ["Зробіть горизонтальне меню з чотирьох посилань.", "Розташуйте три картки в ряд, щоб на вузькому екрані вони переносились."] }
],
js: [
{ t: "Змінні та типи в JavaScript",
  p: ["JavaScript працює у браузері й оживляє сторінки. Змінні оголошують словами <code>let</code> (значення можна змінювати) та <code>const</code> (не можна).", "Основні типи: число, рядок, булеве значення, <code>null</code> і <code>undefined</code>. Вивід у консоль робить <code>console.log()</code>."],
  code: ['let age = 16;\nconst name = "Олена";\nconst isStudent = true;\n\nage = age + 1;\nconsole.log(name + " має " + age + " років");\nconsole.log(typeof age, typeof name, typeof isStudent);\nconsole.log(10 / 4, 10 % 4);'],
  note: "Для порівняння використовуйте <code>===</code>, а не <code>==</code>: він не змінює типи неявно.",
  tasks: ["Обчисліть площу трикутника за основою й висотою та виведіть у консоль.", "З'ясуйте, що виведе typeof для масиву [1, 2]."] },
{ t: "Функції",
  p: ["Функція — це іменований блок коду, який можна викликати багато разів. Вона приймає параметри й повертає результат через <code>return</code>.", "Крім класичного запису існує коротка стрілкова функція <code>(a, b) =&gt; a + b</code>."],
  code: ['function square(x) {\n  return x * x;\n}\n\nconst add = (a, b) => a + b;\n\nconsole.log(square(5));\nconsole.log(add(2, 3));\nconsole.log(square(add(1, 2)));'],
  note: "Функція без <code>return</code> повертає <code>undefined</code>.",
  tasks: ["Напишіть функцію max(a, b), що повертає більше число.", "Створіть стрілкову функцію, що перетворює градуси Цельсія на Фаренгейти (C × 9/5 + 32)."] },
{ t: "Масиви та цикли",
  p: ["Масив зберігає впорядкований набір значень. Індексація починається з нуля, а довжина доступна у <code>length</code>.", "Перебрати масив допомагає цикл <code>for...of</code>, а перетворити його — методи <code>map</code> і <code>filter</code>."],
  code: ['const nums = [3, 8, 1, 6];\nnums.push(10);\n\nfor (const n of nums) {\n  console.log(n);\n}\n\nconst doubled = nums.map(n => n * 2);\nconst big = nums.filter(n => n > 5);\nconsole.log(doubled, big, nums.length);'],
  note: "Методи <code>map</code> і <code>filter</code> не змінюють початковий масив, а повертають новий.",
  tasks: ["Порахуйте суму всіх елементів масиву циклом.", "Відфільтруйте з масиву лише парні числа."] },
{ t: "DOM і події",
  p: ["DOM — це дерево елементів сторінки, яким керує JavaScript. Знайти елемент можна через <code>document.querySelector</code>, а змінити текст — через <code>textContent</code>.", "Реакцію на дії користувача задає метод <code>addEventListener</code>."],
  code: ['<button id="btn">Натисни</button>\n<p id="out">0</p>\n\n<script>\n  let count = 0;\n  const btn = document.querySelector("#btn");\n  const out = document.querySelector("#out");\n  btn.addEventListener("click", () => {\n    count++;\n    out.textContent = count;\n  });\n</script>'],
  note: "Скрипт, що шукає елементи, розміщують після них у HTML або запускають після події <code>DOMContentLoaded</code>.",
  tasks: ["Зробіть кнопку, що змінює колір фону сторінки.", "Додайте другу кнопку, що скидає лічильник."] }
],
sql: [
{ t: "Вибірка даних: SELECT",
  p: ["SQL — мова запитів до реляційних баз даних. Дані лежать у таблицях зі стовпчиками та рядками, а запит <code>SELECT</code> вибирає потрібні стовпчики.", "Зірочка <code>*</code> означає всі стовпчики, а <code>DISTINCT</code> прибирає дублікати."],
  code: ['SELECT * FROM students;\n\nSELECT name, grade FROM students;\n\nSELECT DISTINCT city FROM students;'],
  note: "Ключові слова SQL не залежать від регістру, але їх прийнято писати великими літерами.",
  tasks: ["Виберіть лише імена та міста всіх учнів.", "Отримайте список унікальних класів."] },
{ t: "Фільтрація й сортування",
  p: ["Умову відбору задають у <code>WHERE</code> за допомогою порівнянь, <code>AND</code>, <code>OR</code>, <code>IN</code> і <code>LIKE</code>. Порядок рядків визначає <code>ORDER BY</code>.", "Обмежити кількість рядків можна ключовим словом <code>LIMIT</code>."],
  code: ["SELECT name, grade\nFROM students\nWHERE grade >= 10 AND city = 'Дніпро'\nORDER BY grade DESC, name ASC\nLIMIT 5;\n\nSELECT * FROM students\nWHERE name LIKE 'О%';"],
  note: "Текст у SQL беруть в одинарні лапки. Символ <code>%</code> у LIKE замінює будь-яку кількість літер.",
  tasks: ["Виберіть трьох учнів із найвищими оцінками.", "Знайдіть усіх, чиє ім'я закінчується на «а»."] },
{ t: "Групування та JOIN",
  p: ["Функції <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code> рахують підсумки. Разом з <code>GROUP BY</code> вони дають статистику по групах.", "Оператор <code>JOIN</code> об'єднує дві таблиці за спільним стовпчиком, наприклад за ідентифікатором."],
  code: ['SELECT city, COUNT(*) AS total, AVG(grade) AS avg_grade\nFROM students\nGROUP BY city;\n\nSELECT s.name, c.title\nFROM students s\nJOIN courses c ON c.id = s.course_id;'],
  note: "Умову на результат групування пишуть у <code>HAVING</code>, а не у WHERE.",
  tasks: ["Порахуйте, скільки учнів у кожному класі.", "Виведіть імена учнів разом із назвою курсу через JOIN."] }
]
};

/* ===== Нові уроки ===== */
LESSONS.python.push(
{ t: "Рядки",
  p: ["Рядок — це послідовність символів. Його довжину дає <code>len()</code>, а до окремих символів звертаються за індексом у квадратних дужках, починаючи з нуля.", "Від'ємний індекс рахує з кінця, а зріз <code>s[a:b]</code> бере частину рядка. Зручно вставляти значення в текст через f-рядки."],
  code: [String.raw`s = "Привіт, Python"
print(len(s), s.upper(), s.lower())
print(s[0], s[-1], s[0:6])
print(s.replace("Python", "світе"))

name = "Олена"
age = 16
print(f"{name} має {age} років")
print("a,b,c".split(","))`],
  note: "Рядки в Python незмінні: методи на кшталт <code>upper()</code> повертають новий рядок, а не змінюють старий.",
  tasks: ["Виведіть введене слово задом наперед (підказка: <code>s[::-1]</code>).", "Порахуйте, скільки разів літера «а» зустрічається в слові (метод <code>count</code>)."] },
{ t: "Списки",
  p: ["Список зберігає впорядковану колекцію елементів і може змінюватися. Створюють його квадратними дужками, а додають елементи методом <code>append</code>.", "Для перебору використовують <code>for</code>, а для швидкого створення нового списку — генератор списку у квадратних дужках."],
  code: [String.raw`nums = [5, 2, 9]
nums.append(7)
nums.sort()
print(nums, len(nums), nums[0])

for n in nums:
    print(n)

print([n * 2 for n in nums])
print(sum(nums), max(nums))`],
  note: "Метод <code>sort()</code> змінює сам список, а функція <code>sorted(list)</code> повертає новий відсортований.",
  tasks: ["Введіть п'ять чисел і виведіть їх у порядку спадання.", "Створіть список квадратів чисел від 1 до 10 одним генератором списку."] },
{ t: "Функції",
  p: ["Функція — іменований блок коду, який можна викликати багато разів. Її оголошують словом <code>def</code>, а результат повертають через <code>return</code>.", "Параметри можуть мати значення за замовчуванням, тоді їх можна не передавати під час виклику."],
  code: [String.raw`def square(x):
    return x * x

def greet(name="друже"):
    print("Привіт,", name)

print(square(5))
greet()
greet("Олена")`],
  note: "Змінні, створені всередині функції, існують лише в ній. Це називають локальною областю видимості.",
  tasks: ["Напишіть функцію, що повертає більше з двох чисел.", "Зробіть функцію is_even(n), що повертає True для парного числа."] }
);
LESSONS.js.push(
{ t: "Проміси, async та fetch",
  p: ["Деякі дії, наприклад запит до сервера, тривають довго. JavaScript не зупиняє сторінку, а повертає проміс — обіцянку результату, який з'явиться пізніше.", "Результат промісу обробляють методами <code>then</code> і <code>catch</code> або зручніше через <code>async/await</code>."],
  code: [String.raw`fetch("https://api.github.com/users/octocat")
  .then(r => r.json())
  .then(d => console.log(d.name))
  .catch(e => console.log("Помилка:", e));

async function load() {
  try {
    const r = await fetch("https://api.github.com/users/octocat");
    const d = await r.json();
    console.log(d.public_repos);
  } catch (e) {
    console.log("Помилка:", e);
  }
}
load();`],
  note: "Слово <code>await</code> можна використовувати лише всередині функції, оголошеної як <code>async</code>.",
  tasks: ["Виведіть у консоль кількість публічних репозиторіїв будь-якого користувача GitHub.", "Додайте обробку помилки на випадок, якщо мережі немає."] }
);
LESSONS.go = [
{ t: "Перша програма на Go",
  p: ["Go — проста й швидка мова від Google, яку люблять за зрозумілий синтаксис і вбудовану підтримку паралельності. Кожна програма належить до пакета: виконувані програми живуть у пакеті <code>main</code>.", "Бібліотеки підключає <code>import</code>, а виводить текст пакет <code>fmt</code>. Запуск: команда <code>go run main.go</code>."],
  code: [String.raw`package main

import "fmt"

func main() {
	fmt.Println("Привіт, світе!")
	fmt.Println("2 + 3 =", 2+3)
}`],
  note: "Якщо підключити пакет і не використати його, Go не скомпілює програму. Це свідоме правило мови.",
  tasks: ["Виведіть своє ім'я та вік двома рядками.", "Обчисліть і виведіть значення виразу (8 + 4) * 3."] },
{ t: "Змінні та типи",
  p: ["Змінну оголошують через <code>var</code> із типом або коротким записом <code>:=</code>, який сам визначає тип. Короткий запис працює лише всередині функцій.", "Основні типи: <code>int</code>, <code>float64</code>, <code>string</code>, <code>bool</code>. Тип змінної змінити не можна."],
  code: [String.raw`package main

import "fmt"

func main() {
	var age int = 16
	name := "Олена"
	height := 1.75
	isStudent := true

	fmt.Println(name, age, height, isStudent)
	fmt.Printf("%T %T %T\n", age, name, height)
}`],
  note: "Невикористана змінна теж викликає помилку компіляції. Для тимчасового значення використовують <code>_</code>.",
  tasks: ["Збережіть у змінних два числа й виведіть їхню суму та різницю.", "Виведіть тип змінної, створеної записом <code>x := 3.0</code>."] },
{ t: "Умови, цикли та функції",
  p: ["У Go є лише один цикл — <code>for</code>, але він замінює і while. Умови в <code>if</code> пишуть без круглих дужок.", "Функція може повертати кілька значень одразу. Так прийнято повертати результат разом із ознакою успіху або помилкою."],
  code: [String.raw`package main

import "fmt"

func divide(a, b int) (int, bool) {
	if b == 0 {
		return 0, false
	}
	return a / b, true
}

func main() {
	for i := 1; i <= 3; i++ {
		fmt.Println("Крок", i)
	}
	if res, ok := divide(10, 2); ok {
		fmt.Println("Результат:", res)
	} else {
		fmt.Println("Ділення на нуль")
	}
}`],
  note: "Відкриваючу фігурну дужку потрібно ставити в тому ж рядку, що й <code>if</code>, <code>for</code> або <code>func</code>.",
  tasks: ["Виведіть парні числа від 1 до 20.", "Напишіть функцію, що повертає суму й добуток двох чисел."] },
{ t: "Горутини та канали",
  p: ["Горутина — легкий потік виконання. Щоб запустити функцію паралельно, перед її викликом пишуть слово <code>go</code>.", "Горутини обмінюються даними через канали. <code>sync.WaitGroup</code> дозволяє дочекатися, поки всі горутини закінчать роботу."],
  code: [String.raw`package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	ch := make(chan int, 3)
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			ch <- n * n
		}(i)
	}
	wg.Wait()
	close(ch)
	for v := range ch {
		fmt.Println(v)
	}
}`],
  note: "Порядок виведення може відрізнятися між запусками: горутини виконуються паралельно й незалежно.",
  tasks: ["Запустіть три горутини, кожна з яких надсилає в канал своє число.", "Підсумуйте всі значення з каналу після завершення горутин."] }
];
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
LESSONS.java = [
{ t: "Перша програма на Java",
  p: ["Java — одна з найпоширеніших мов для великих застосунків і Android. Увесь код живе в класах, а запуск починається з методу <code>main</code>.", "Вивід у консоль робить <code>System.out.println</code>. Назва файлу має збігатися з назвою публічного класу."],
  code: [String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Привіт, світе!");
        System.out.println("2 + 3 = " + (2 + 3));
    }
}`],
  note: "Java чутлива до регістру: <code>Main</code> і <code>main</code> — це різні імена.",
  tasks: ["Виведіть три рядки: ім'я, клас, місто.", "Виведіть результат виразу 17 / 5 та 17 % 5."] },
{ t: "Змінні та ввід",
  p: ["Тип змінної вказують явно: <code>int</code>, <code>double</code>, <code>boolean</code>, <code>String</code>. Рядок <code>String</code> пишеться з великої літери, бо це клас.", "Читати дані з клавіатури допомагає клас <code>Scanner</code>."],
  code: [String.raw`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Ім'я: ");
        String name = sc.nextLine();
        System.out.print("Вік: ");
        int age = sc.nextInt();
        System.out.println(name + ", через 5 років вам буде " + (age + 5));
    }
}`],
  note: "Ділення двох цілих чисел дає ціле: для дробового результату хоча б одне з них має бути <code>double</code>.",
  tasks: ["Прочитайте два числа й виведіть їхню суму.", "Обчисліть площу прямокутника за введеними сторонами."] },
{ t: "Умови та цикли",
  p: ["Умовний оператор <code>if / else</code> і цикли <code>for</code> та <code>while</code> записуються так само, як у C++. Тіло блока беруть у фігурні дужки.", "Для перебору масиву існує зручний цикл <code>for-each</code>."],
  code: [String.raw`public class Main {
    public static void main(String[] args) {
        int[] nums = {4, 7, 1, 9};
        int sum = 0;
        for (int n : nums) {
            if (n % 2 == 1) {
                sum += n;
            }
        }
        System.out.println("Сума непарних: " + sum);

        int i = 1;
        while (i <= 3) {
            System.out.println("Крок " + i);
            i++;
        }
    }
}`],
  note: "Порівнювати рядки потрібно методом <code>equals</code>, а не знаком <code>==</code>.",
  tasks: ["Знайдіть найбільше число в масиві.", "Виведіть таблицю множення на 6."] }
];

const CHAPTERS = {
  python: [["Основи", 0], ["Керування програмою", 2], ["Рядки, списки, функції", 4]],
  cpp: [["Основи", 0], ["Керування програмою", 2]],
  pascal: [["Основи", 0], ["Керування програмою", 2]],
  html: [["Структура сторінки", 0], ["Вміст і форми", 1]],
  css: [["Основи стилів", 0], ["Макет", 1]],
  js: [["Основи", 0], ["Дані та браузер", 2], ["Асинхронність", 4]],
  sql: [["Вибірка даних", 0], ["Підсумки й зв'язки", 2]],
  go: [["Основи", 0], ["Керування й функції", 2], ["Паралельність", 3]],
  ts: [["Типи", 0], ["Структури даних", 2], ["Узагальнення", 3]],
  java: [["Основи", 0], ["Керування програмою", 2]]
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

/* ===== JavaScript: розширений курс ===== */
(function () {
  const o = LESSONS.js, N = {"cond": {"t": "Умови та оператори", "p": ["Умови дозволяють програмі приймати рішення. Порівняння дають булеве значення: <code>===</code> (дорівнює), <code>!==</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Умови комбінують логічними операторами <code>&amp;&amp;</code> (і), <code>||</code> (або), <code>!</code> (не).", "У умовах JavaScript будь-яке значення перетворюється на true або false. Хибними (falsy) є лише <code>false</code>, <code>0</code>, <code>\"\"</code>, <code>null</code>, <code>undefined</code> і <code>NaN</code>. Усе інше вважається істинним."], "code": ["const age = 17;\n\nif (age >= 18) {\n  console.log(\"Повнолітній\");\n} else if (age >= 14) {\n  console.log(\"Підліток\");\n} else {\n  console.log(\"Дитина\");\n}\n\nconst label = age >= 18 ? \"adult\" : \"minor\";\nconsole.log(label);\n\nconst day = 3;\nswitch (day) {\n  case 1: console.log(\"Понеділок\"); break;\n  case 2: console.log(\"Вівторок\"); break;\n  case 3: console.log(\"Середа\"); break;\n  default: console.log(\"Інший день\");\n}", "const user = { name: \"Олена\", address: null };\n\nconsole.log(user.address?.city);        // undefined, без помилки\nconsole.log(user.nickname ?? \"гість\");  // гість\nconsole.log(user.name && user.name.length);\n\nif (!user.name) {\n  console.log(\"Імені немає\");\n}"], "note": "Оператор <code>?.</code> зупиняє читання, якщо проміжне значення null або undefined, а <code>??</code> підставляє запасне значення лише для null і undefined (на відміну від <code>||</code>, який реагує і на 0).", "work": "У реальному коді дані часто приходять із сервера в неповному вигляді, тому <code>?.</code> і <code>??</code> зустрічаються постійно. Також прийнято спершу відсіювати некоректні випадки й виходити з функції раніше (так звані guard clauses), замість глибоких вкладених if.", "tasks": ["Напишіть програму, що за балом 0–100 виводить оцінку: A, B, C або F.", "Отримайте місто з об'єкта <code>{ address: { city: \"Київ\" } }</code> безпечно, навіть якщо address відсутній."]}, "loops": {"t": "Цикли", "p": ["Цикл повторює блок коду. Класичний <code>for</code> має три частини: початок, умову продовження та крок. Цикл <code>while</code> працює, поки умова істинна, а <code>do...while</code> виконується щонайменше раз.", "Інструкція <code>break</code> негайно виходить із циклу, а <code>continue</code> пропускає поточну ітерацію й переходить до наступної. Для перебору значень масиву зручний <code>for...of</code>."], "code": ["for (let i = 1; i <= 5; i++) {\n  console.log(\"Ітерація\", i);\n}\n\nlet n = 10;\nwhile (n > 0) {\n  n -= 3;\n}\nconsole.log(n);\n\nconst nums = [4, 9, 12, 7];\nfor (const x of nums) {\n  if (x % 2 === 1) continue;\n  console.log(\"Парне:\", x);\n}", "const prices = [120, 80, 300, 45];\nlet total = 0;\nlet firstExpensive = null;\n\nfor (const p of prices) {\n  total += p;\n  if (firstExpensive === null && p > 250) {\n    firstExpensive = p;\n  }\n}\nconsole.log(\"Разом:\", total, \"Перше дороге:\", firstExpensive);"], "note": "Цикл, умова якого ніколи не стане хибною, зависає вкладку браузера. Завжди перевіряйте, що змінна в умові змінюється.", "work": "У проєктах прості цикли <code>for</code> трапляються рідше, ніж методи масивів, але без них не обійтися, коли потрібен ранній вихід через <code>break</code> або складний крок. Для масивів за замовчуванням використовують <code>for...of</code>, а не індекси.", "tasks": ["Виведіть усі числа від 1 до 100, кратні 7.", "Знайдіть перше число в масиві, більше за 50, і зупиніть цикл через break."]}, "strings": {"t": "Рядки та числа", "p": ["Рядки мають багато корисних методів: <code>slice</code> бере частину, <code>includes</code> перевіряє наявність підрядка, <code>split</code> розбиває на масив, <code>trim</code> прибирає зайві пробіли, <code>toUpperCase</code> змінює регістр. Рядки незмінні, кожен метод повертає новий.", "Шаблонні рядки у зворотних лапках дозволяють вставляти значення через <code>${…}</code> і писати текст у кілька рядків. Для чисел важливі <code>Number()</code>, <code>parseInt</code>, <code>toFixed</code> та об'єкт <code>Math</code>."], "code": ["const title = \"  JavaScript для роботи  \";\nconsole.log(title.trim().toUpperCase());\nconsole.log(title.includes(\"робот\"));\nconsole.log(\"a,b,c\".split(\",\"));\nconsole.log(\"Привіт\".slice(0, 3));\n\nconst name = \"Олена\";\nconst total = 1234.5;\nconsole.log(`Клієнт: ${name}, сума: ${total.toFixed(2)} грн`);", "console.log(Number(\"42\"), Number(\"abc\"));\nconsole.log(parseInt(\"15px\"), parseFloat(\"3.14\"));\nconsole.log(Math.round(4.6), Math.floor(4.9), Math.max(3, 8, 1));\nconsole.log(0.1 + 0.2);                     // 0.30000000000000004\nconsole.log(Math.round((0.1 + 0.2) * 100) / 100);\nconsole.log(Number.isNaN(Number(\"abc\")));"], "note": "Дробові числа зберігаються з похибкою: <code>0.1 + 0.2</code> не дорівнює 0.3. Для грошей працюють із копійками як із цілими числами.", "work": "Користувацький ввід завжди приходить рядком, тому перетворення та перевірка чисел (<code>Number</code>, <code>Number.isNaN</code>) постійно трапляються у формах і API. Рядки для користувача у проєктах збирають шаблонними рядками, а не склеюванням через плюс.", "tasks": ["Напишіть функцію, що перетворює «іван петренко» на «Іван Петренко».", "Приймає рядок «12,5» і повертає число 12.5 (підказка: <code>replace</code>)."]}, "amethods": {"t": "Методи масивів: map, filter, reduce", "p": ["Основну роботу з масивами в сучасному JavaScript роблять методи вищого порядку. <code>map</code> перетворює кожен елемент, <code>filter</code> залишає потрібні, <code>find</code> знаходить перший відповідний, а <code>reduce</code> згортає масив до одного значення.", "Усі вони повертають новий результат і не змінюють початковий масив, а їх можна об'єднувати в ланцюжки. Метод <code>sort</code> змінює масив і потребує функції порівняння для чисел."], "code": ["const products = [\n  { id: 1, name: \"Зошит\", price: 40, inStock: true },\n  { id: 2, name: \"Ручка\", price: 15, inStock: false },\n  { id: 3, name: \"Рюкзак\", price: 650, inStock: true }\n];\n\nconst names = products.map(p => p.name);\nconst available = products.filter(p => p.inStock);\nconst bag = products.find(p => p.id === 3);\nconst total = available.reduce((sum, p) => sum + p.price, 0);\n\nconsole.log(names, available.length, bag.name, total);", "const cheapFirst = [...products].sort((a, b) => a.price - b.price);\nconsole.log(cheapFirst.map(p => p.name));\n\nconsole.log(products.some(p => p.price > 500));   // true\nconsole.log(products.every(p => p.price > 20));   // false\nconsole.log([1, 2, 3].includes(2));"], "note": "Щоб не змінити оригінальний масив під час сортування, робіть його копію через <code>[...arr]</code>.", "work": "Обробка списків (товари, користувачі, замовлення) — це найчастіша задача фронтенду. Код на кшталт «відфільтрувати, перетворити, порахувати» пишуть ланцюжком <code>filter().map().reduce()</code>, а на код-рев'ю не люблять ручні цикли з тимчасовими масивами.", "tasks": ["Із масиву товарів отримайте загальну вартість лише тих, що є в наявності.", "Відсортуйте масив користувачів за іменем, не змінюючи початковий масив."]}, "objects": {"t": "Об'єкти", "p": ["Об'єкт зберігає пари ключ-значення і описує одну сутність: користувача, товар, замовлення. До полів звертаються через крапку або квадратні дужки, а методи — це функції всередині об'єкта.", "Деструктуризація дістає потрібні поля в окремі змінні, а оператор розгортання <code>...</code> копіює об'єкт або об'єднує кілька. Методи <code>Object.keys</code>, <code>Object.values</code> і <code>Object.entries</code> перетворюють об'єкт на масив."], "code": ["const user = {\n  id: 7,\n  name: \"Олена\",\n  roles: [\"admin\", \"editor\"],\n  greet() { return \"Привіт, \" + this.name; }\n};\n\nconsole.log(user.name, user[\"id\"], user.greet());\n\nconst { name, roles } = user;\nconst copy = { ...user, name: \"Артем\" };\nconst withEmail = { ...user, email: \"o@x.ua\" };\nconsole.log(name, roles, copy.name, withEmail.email);", "const stock = { apples: 5, pears: 0, plums: 12 };\n\nfor (const [key, value] of Object.entries(stock)) {\n  console.log(key + \": \" + value);\n}\nconsole.log(Object.keys(stock).length);\nconsole.log(\"pears\" in stock, stock.kiwi === undefined);"], "note": "Копія через <code>{...obj}</code> неглибока: вкладені об'єкти й масиви в копії залишаються тими самими посиланнями.", "work": "Дані з API майже завжди приходять у вигляді масивів об'єктів, а вся робота з ними складається з деструктуризації, розгортання й методів масивів. Змінювати об'єкт «на місці» у спільному коді не люблять: створюють новий через <code>...</code> (це називають іммутабельністю).", "tasks": ["Опишіть об'єкт книги й виведіть його поля через Object.entries.", "Створіть копію об'єкта користувача зі зміненим email і переконайтеся, що оригінал не змінився."]}, "closure": {"t": "Область видимості та замикання", "p": ["Змінні, оголошені через <code>let</code> і <code>const</code>, видимі лише в блоці <code>{ }</code>, де їх створено. Змінні всередині функції недоступні ззовні, а внутрішня функція бачить змінні зовнішньої.", "Замикання виникає, коли функція «запам'ятовує» змінні з місця створення й користується ними навіть після завершення зовнішньої функції. Це основа приватних даних, фабрик функцій і багатьох бібліотек."], "code": ["function makeCounter() {\n  let count = 0;\n  return function () {\n    count++;\n    return count;\n  };\n}\n\nconst a = makeCounter();\nconst b = makeCounter();\nconsole.log(a(), a(), a());  // 1 2 3\nconsole.log(b());            // 1 — окремий лічильник", "function makeDiscount(percent) {\n  return price => price - price * percent / 100;\n}\nconst blackFriday = makeDiscount(30);\nconsole.log(blackFriday(200));  // 140\n\n{\n  const secret = 42;\n}\n// console.log(secret); // помилка: змінної немає поза блоком"], "note": "Старе ключове слово <code>var</code> має область видимості функції, а не блока, і піднімається нагору. Через це в нових проєктах його не використовують.", "work": "Про замикання питають і в кодовій базі, і на співбесідах, бо їх використовують обробники подій, <code>setTimeout</code>, хуки React та фабрики функцій. Типова помилка новачків — випадково зберегти застаріле значення змінної всередині такої функції.", "tasks": ["Напишіть makeMultiplier(n), що повертає функцію множення на n.", "Зробіть лічильник із методами increment, decrement та get, що ховає значення від прямого доступу."]}, "classes": {"t": "Класи та this", "p": ["Клас — це шаблон для створення однотипних об'єктів із даними й поведінкою. Метод <code>constructor</code> викликається під час створення екземпляра через <code>new</code>, а <code>this</code> вказує на цей екземпляр.", "Ключове слово <code>extends</code> дозволяє створити клас-нащадок, який успадковує поля й методи, а <code>super</code> викликає код батьківського класу. Статичні методи належать самому класу, а не екземпляру."], "code": ["class Account {\n  constructor(owner, balance = 0) {\n    this.owner = owner;\n    this.balance = balance;\n  }\n  deposit(amount) {\n    this.balance += amount;\n    return this;\n  }\n  describe() {\n    return this.owner + \": \" + this.balance + \" грн\";\n  }\n}\n\nconst acc = new Account(\"Олена\", 100);\nacc.deposit(50);\nconsole.log(acc.describe());", "class SavingsAccount extends Account {\n  constructor(owner, balance, rate) {\n    super(owner, balance);\n    this.rate = rate;\n  }\n  addInterest() {\n    this.balance += this.balance * this.rate;\n  }\n  static fromObject(o) {\n    return new SavingsAccount(o.owner, o.balance, o.rate);\n  }\n}\n\nconst s = SavingsAccount.fromObject({ owner: \"Артем\", balance: 1000, rate: 0.05 });\ns.addInterest();\nconsole.log(s.describe());"], "note": "Значення <code>this</code> залежить від того, як викликана функція. Якщо передати метод як окремий обробник, <code>this</code> втратиться: у таких випадках використовують стрілкові функції.", "work": "Класи в JavaScript застосовують помірно: у фронтенді частіше працюють функції й прості об'єкти, але у бекенді на Node.js, у TypeScript і в багатьох бібліотеках класи зустрічаються постійно. Прочитати чужий клас і зрозуміти <code>this</code> і <code>extends</code> — обов'язкова навичка.", "tasks": ["Створіть клас Product із методом, що рахує ціну зі знижкою.", "Додайте клас-нащадок DigitalProduct без доставки й перевизначте метод опису."]}, "errors": {"t": "Помилки та try/catch", "p": ["Помилки в роботі програм неминучі: недоступний сервер, некоректний ввід, відсутні дані. Блок <code>try/catch</code> перехоплює помилку, щоб програма не зупинялась, а <code>finally</code> виконується завжди.", "Власну помилку створюють через <code>throw new Error(\"повідомлення\")</code>. Типові повідомлення консолі, як-от <code>TypeError: Cannot read properties of undefined</code>, прямо вказують на рядок і причину, їх потрібно вміти читати."], "code": ["function parseAge(input) {\n  const age = Number(input);\n  if (Number.isNaN(age) || age < 0) {\n    throw new Error(\"Некоректний вік: \" + input);\n  }\n  return age;\n}\n\ntry {\n  console.log(parseAge(\"17\"));\n  console.log(parseAge(\"abc\"));\n} catch (e) {\n  console.log(\"Помилка:\", e.message);\n} finally {\n  console.log(\"Перевірка завершена\");\n}", "const raw = '{\"name\": \"Олена\"';   // зламаний JSON\ntry {\n  const data = JSON.parse(raw);\n  console.log(data);\n} catch (e) {\n  console.log(e.name);            // SyntaxError\n}\n\nconst user = undefined;\n// console.log(user.name);        // TypeError: Cannot read properties of undefined"], "note": "Не залишайте порожній блок <code>catch</code>. Принаймні виведіть помилку в консоль, інакше причину збою знайти буде майже неможливо.", "work": "Налагодження — до половини робочого часу розробника. Тому вчіться читати повідомлення про помилки та стек викликів у консолі браузера (F12), ставити точки зупину у вкладці Sources та передбачати помилки там, де працюєте з зовнішніми даними: JSON, мережа, ввід користувача.", "tasks": ["Напишіть функцію divide(a, b), що кидає помилку під час ділення на нуль, і обробіть її через try/catch.", "Спровокуйте TypeError і знайдіть у консолі рядок, що його викликав."]}, "modules": {"t": "Модулі та npm", "p": ["Реальні проєкти складаються з багатьох файлів. Модулі дозволяють розділити код: один файл експортує функції через <code>export</code>, інший підключає їх через <code>import</code>. Іменований експорт імпортують у фігурних дужках, а експорт за замовчуванням — без них.", "У браузері скрипт, що використовує модулі, підключають з атрибутом <code>type=\"module\"</code>. Сторонні бібліотеки встановлюють менеджером пакетів npm, який веде їхній список у файлі <code>package.json</code>."], "code": ["// math.js\nexport function add(a, b) {\n  return a + b;\n}\nexport const PI = 3.14159;\nexport default function square(x) {\n  return x * x;\n}\n\n// main.js\nimport square, { add, PI } from \"./math.js\";\nconsole.log(add(2, 3), square(4), PI);\n\n// index.html\n// <script type=\"module\" src=\"main.js\"></script>", "# термінал\nnpm init -y\nnpm install dayjs\nnpm install --save-dev prettier\nnpm run build"], "note": "Модулі працюють лише через веб-сервер (наприклад, <code>npx serve</code> або Live Server у VS Code), а не коли файл відкрито подвійним кліком.", "work": "У будь-якому робочому проєкті є <code>package.json</code>, папка <code>node_modules</code> (вона не потрапляє в Git) і розбиття коду на модулі. Уміння ініціалізувати проєкт, встановити залежність і зрозуміти скрипти з package.json очікують від кожного початківця.", "tasks": ["Винесіть дві функції в окремий файл і підключіть їх у main.js.", "Ініціалізуйте проєкт через npm і встановіть будь-яку бібліотеку на вибір."]}, "json": {"t": "JSON і localStorage", "p": ["JSON — текстовий формат обміну даними, який використовують майже всі API. Функція <code>JSON.stringify</code> перетворює об'єкт на рядок, а <code>JSON.parse</code> виконує зворотне перетворення.", "Браузер може зберігати дані між візитами в <code>localStorage</code>. Він зберігає лише рядки, тому об'єкти перед записом перетворюють через JSON."], "code": ["const todo = { id: 1, title: \"Вивчити JS\", done: false };\n\nconst text = JSON.stringify(todo);\nconsole.log(text);                 // {\"id\":1,\"title\":\"Вивчити JS\",\"done\":false}\n\nconst back = JSON.parse(text);\nconsole.log(back.title);", "function loadTodos() {\n  try {\n    return JSON.parse(localStorage.getItem(\"todos\")) ?? [];\n  } catch (e) {\n    return [];\n  }\n}\n\nfunction saveTodos(list) {\n  localStorage.setItem(\"todos\", JSON.stringify(list));\n}\n\nconst todos = loadTodos();\ntodos.push({ id: Date.now(), title: \"Новий пункт\", done: false });\nsaveTodos(todos);"], "note": "Не зберігайте в localStorage паролі й токени доступу: до нього може дістатися будь-який скрипт на сторінці.", "work": "Читання сховища завжди обгортають у try/catch, бо дані там можуть бути пошкоджені, а користувач може вимкнути сховище. Цей патерн «завантажити, змінити, зберегти» лежить в основі списків завдань, кошиків і налаштувань у більшості невеликих веб-застосунків.", "tasks": ["Збережіть налаштування теми (light/dark) у localStorage та прочитайте їх після перезавантаження.", "Додайте у список завдань видалення пункту з оновленням сховища."]}};
  o[0].work = "У командних проєктах за замовчуванням пишуть const, а let лише там, де значення справді змінюється. Слово var в новому коді не використовують. Імена змінних англійською в camelCase: userName, totalPrice.";
  o[1].work = "Функція має робити одну річ і мати зрозумілу назву-дієслово: calculateTotal, getUser. На код-рев'ю просять розбивати довгі функції на кілька коротких і не передавати занадто багато параметрів.";
  o[2].t = "Масиви"; o[2].work = "Масиви найчастіше містять об'єкти (список товарів, користувачів), тому майже кожну задачу з даними починають з перебору або перетворення масиву.";
  o[3].work = "У реальних проєктах на чистому DOM пишуть рідко: це основа, на якій тримаються React і Vue. Але розуміти querySelector і події треба, щоб налагоджувати будь-який фронтенд.";
  o[4].work = "Майже кожен запит до API у роботі пишеться через async/await з try/catch. Обов'язково перевіряють r.ok, бо fetch не кидає помилку на відповіді зі статусом 404 чи 500.";
  LESSONS.js = [o[0], N.cond, N.loops, o[1], N.strings, o[2], N.amethods, N.objects, N.closure, N.classes, N.errors, N.modules, o[3], N.json, o[4]];
  CHAPTERS.js = [["Основи", 0], ["Функції та дані", 3], ["Глибше в мову", 8], ["Браузер і мережа", 12]];
  CHAPTERS.js.forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS.js.length;
    for (let j = from; j < to; j++) LESSONS.js[j].ch = name;
  });
})();

/* ===== JavaScript: 22 уроки ===== */
(function () {
  const N = {"intro": {"t": "Де писати код: консоль, редактор, Node.js", "p": ["Перш ніж вчити мову, потрібно знати, де її запускати. JavaScript виконується в трьох місцях: у консолі браузера (клавіша F12, вкладка Console), у файлі на сторінці через тег <code>&lt;script&gt;</code> та в Node.js, який запускає код поза браузером.", "Для щоденної роботи встановіть редактор Visual Studio Code, а до нього розширення Live Server: воно відкриває сторінку в браузері й оновлює її після кожного збереження. Консоль зручна для швидких експериментів, а справжній код зберігають у файлах."], "code": ["// Вставте в консоль браузера (F12 → Console) і натисніть Enter\nconsole.log(\"Привіт, JavaScript!\");\n2 + 3\n\"Ім'я\".length", "<!-- index.html -->\n<!DOCTYPE html>\n<html lang=\"uk\">\n<head><meta charset=\"utf-8\"><title>Тест</title></head>\n<body>\n  <h1 id=\"title\">Привіт</h1>\n  <script src=\"script.js\"></script>\n</body>\n</html>\n\n// script.js\ndocument.getElementById(\"title\").textContent = \"Працює!\";\nconsole.log(\"Скрипт підключено\");"], "note": "Тег <code>&lt;script&gt;</code> зазвичай ставлять наприкінці <code>body</code>, щоб до запуску скрипта елементи вже існували на сторінці.", "easy": "Код — це список інструкцій для комп'ютера. Консоль браузера — це блокнот, куди можна записати одну інструкцію й одразу побачити, що вийшло.", "work": "Розробник щодня працює в трьох місцях: редактор коду (VS Code), браузер із відкритими DevTools і термінал. Навчіться швидко відкривати консоль і бачити в ній помилки: це перше, що роблять, коли «щось не працює».", "tasks": ["Відкрийте консоль і виведіть через console.log своє ім'я.", "Створіть index.html зі script.js і змініть текст заголовка зі скрипта."]}, "setmap": {"t": "Set і Map", "p": ["Окрім масивів і об'єктів, у JavaScript є дві корисні колекції. <code>Set</code> зберігає лише унікальні значення, тому дублікати зникають автоматично. <code>Map</code> — це словник, у якого ключем може бути будь-що, а не лише рядок.", "Обидві колекції мають методи <code>add</code>/<code>set</code>, <code>has</code>, <code>delete</code> і властивість <code>size</code>, а перебирати їх можна циклом <code>for...of</code>."], "code": ["const tags = new Set([\"js\", \"css\", \"js\", \"html\", \"css\"]);\nconsole.log(tags.size);          // 3\nconsole.log(tags.has(\"css\"));    // true\ntags.add(\"php\");\n\nconst unique = [...new Set([1, 2, 2, 3, 3, 3])];\nconsole.log(unique);             // [1, 2, 3]", "const users = new Map();\nusers.set(101, { name: \"Олена\" });\nusers.set(102, { name: \"Артем\" });\n\nconsole.log(users.get(101).name);\nconsole.log(users.has(103));\n\nfor (const [id, user] of users) {\n  console.log(id, user.name);\n}"], "note": "Найшвидший спосіб прибрати дублікати з масиву — перетворити його на Set і назад: <code>[...new Set(arr)]</code>.", "easy": "Set — це список без повторів, як перелік гостей, де кожне ім'я записують один раз. Map — словник: за ключем швидко знаходиться значення.", "work": "Set використовують, щоб прибирати дублікати та швидко перевіряти «чи вже є таке значення». Map зручний, коли дані шукають за ідентифікатором, наприклад користувачів за id: це швидше й чистіше, ніж щоразу шукати в масиві через find.", "tasks": ["Прибрайте дублікати з масиву імен, що містить повтори.", "Збережіть у Map три товари за їхнім id і знайдіть один із них."]}, "date": {"t": "Дата й час", "p": ["Для роботи з датами є вбудований об'єкт <code>Date</code>. Новий екземпляр без аргументів містить поточний момент, а з аргументом — вказану дату. Усередині дата зберігається як кількість мілісекунд від 1 січня 1970 року.", "Для виведення користувачу застосовують <code>toLocaleDateString</code> із мовою, а для передачі на сервер — формат ISO, який дає <code>toISOString</code>."], "code": ["const now = new Date();\nconsole.log(now.getFullYear(), now.getMonth() + 1, now.getDate());\n\nconst exam = new Date(\"2026-12-20\");\nconsole.log(exam.toLocaleDateString(\"uk-UA\", {\n  day: \"numeric\", month: \"long\", year: \"numeric\"\n}));\nconsole.log(now.toISOString());", "const day = 24 * 60 * 60 * 1000;\nconst left = Math.ceil((exam - now) / day);\nconsole.log(\"До іспиту днів:\", left);\n\nconst next = new Date(now);\nnext.setDate(next.getDate() + 7);\nconsole.log(\"Через тиждень:\", next.toLocaleDateString(\"uk-UA\"));"], "note": "Місяці в JavaScript нумеруються з нуля: січень — це 0, а грудень — 11. Саме тому до <code>getMonth()</code> додають 1.", "easy": "Дата в JavaScript — це просто велике число мілісекунд від 1 січня 1970 року. Усе інше — лише спосіб гарно її показати.", "work": "Дати постійно ходять між фронтендом і сервером: у запитах їх передають у форматі ISO, а користувачу показують у його мові та часовому поясі. Для складних обчислень у проєктах часто беруть бібліотеку на кшталт dayjs, але основу <code>Date</code> знати потрібно.", "tasks": ["Виведіть, скільки днів залишилось до вашого дня народження.", "Покажіть поточну дату у форматі «5 жовтня 2026»."]}, "forms": {"t": "Форми та делегування подій", "p": ["Подія <code>submit</code> форми за замовчуванням перезавантажує сторінку, тому в обробнику викликають <code>event.preventDefault()</code>. Значення полів зручно зібрати через <code>FormData</code>.", "Якщо в списку багато елементів, не вішають окремий обробник на кожен. Один обробник ставлять на батьківський елемент і дивляться, куди клікнули, через <code>event.target</code>. Це називають делегуванням подій."], "code": ["<form id=\"signup\">\n  <input name=\"email\" type=\"email\" required>\n  <input name=\"age\" type=\"number\" min=\"1\">\n  <button>Надіслати</button>\n</form>\n<p id=\"msg\"></p>\n\n<script>\n  const form = document.querySelector(\"#signup\");\n  form.addEventListener(\"submit\", e => {\n    e.preventDefault();\n    const data = Object.fromEntries(new FormData(form));\n    const msg = document.querySelector(\"#msg\");\n    msg.textContent = data.age < 14 ? \"Замало років\" : \"Дякуємо, \" + data.email;\n  });\n</script>", "<ul id=\"list\">\n  <li data-id=\"1\">Зошит <button class=\"del\">×</button></li>\n  <li data-id=\"2\">Ручка <button class=\"del\">×</button></li>\n</ul>\n\n<script>\n  document.querySelector(\"#list\").addEventListener(\"click\", e => {\n    const btn = e.target.closest(\".del\");\n    if (!btn) return;\n    btn.closest(\"li\").remove();\n  });\n</script>"], "note": "Список може змінюватися (елементи додаються й видаляються), а делегування працює і для нових елементів без додаткового коду.", "easy": "Делегування — це один сторож на весь коридор замість окремого сторожа біля кожних дверей: він бачить, у які двері постукали.", "work": "Форми — найчастіша задача веб-розробника: реєстрація, пошук, замовлення. Типовий процес: перехопити submit, зібрати дані, перевірити їх, показати помилки біля полів і лише потім надсилати на сервер.", "tasks": ["Зробіть форму входу, що виводить помилку, якщо пароль коротший за 6 символів.", "Додайте до списку кнопку видалення через делегування подій."]}, "eventloop": {"t": "Як працює асинхронність: таймери та черга подій", "p": ["JavaScript виконує код по одному рядку за раз, не вміючи робити дві речі одночасно. Довгі дії, наприклад таймер або запит до сервера, він передає браузеру й повертається до них, коли результат готовий.", "Функція <code>setTimeout</code> відкладає виконання коду, а колбек (функція, яку потрібно викликати пізніше) потрапляє в чергу й запускається лише тоді, коли основний код завершився. Саме тому <code>setTimeout(fn, 0)</code> усе одно виконається після решти поточного коду."], "code": ["console.log(\"1. Початок\");\n\nsetTimeout(() => {\n  console.log(\"3. Через таймер\");\n}, 0);\n\nconsole.log(\"2. Кінець\");\n// Порядок виводу: 1, 2, 3", "let seconds = 3;\nconst timer = setInterval(() => {\n  console.log(\"Залишилось:\", seconds);\n  seconds--;\n  if (seconds < 0) {\n    clearInterval(timer);\n    console.log(\"Старт!\");\n  }\n}, 1000);"], "note": "Таймер, який більше не потрібен, зупиняють через <code>clearTimeout</code> або <code>clearInterval</code>, інакше він працюватиме нескінченно.", "easy": "JavaScript — це кухар з однією парою рук. Довгі справи (запити, таймери) він віддає помічникові-браузеру й береться до них знову, коли ті готові.", "work": "Розуміння цього порядку виконання допомагає зрозуміти, чому дані «ще не прийшли», коли ви звертаєтесь до них, і чому код виконується не в тому порядку, у якому записаний. Це одне з найпоширеніших джерел помилок у початківців.", "tasks": ["Передбачте порядок виводу трьох console.log, один з яких у setTimeout, і перевірте себе.", "Зробіть таймер зворотного відліку від 10 до 0."]}, "api": {"t": "Запити до API: GET і POST", "p": ["API — це спосіб, яким фронтенд спілкується із сервером. Запит <code>GET</code> отримує дані, <code>POST</code> створює нові, <code>PUT</code>/<code>PATCH</code> оновлюють, а <code>DELETE</code> видаляє. Відповідь сервера має код статусу: 2xx означає успіх, 4xx — помилку у запиті, 5xx — помилку сервера.", "Для POST передають метод, заголовок <code>Content-Type</code> і тіло запиту у вигляді JSON-рядка. Найважливіше правило: завжди перевіряйте <code>response.ok</code>, бо fetch не вважає помилкою відповідь 404 чи 500."], "code": ["const API = \"https://jsonplaceholder.typicode.com\";\n\nasync function getPosts() {\n  const r = await fetch(API + \"/posts?_limit=3\");\n  if (!r.ok) throw new Error(\"Помилка сервера: \" + r.status);\n  return r.json();\n}\n\ngetPosts()\n  .then(posts => console.log(posts.map(p => p.title)))\n  .catch(e => console.log(e.message));", "async function createPost(title, body) {\n  const r = await fetch(API + \"/posts\", {\n    method: \"POST\",\n    headers: { \"Content-Type\": \"application/json\" },\n    body: JSON.stringify({ title, body, userId: 1 })\n  });\n  if (!r.ok) throw new Error(\"Не вдалося створити: \" + r.status);\n  return r.json();\n}\n\ncreatePost(\"Привіт\", \"Мій перший пост\")\n  .then(p => console.log(\"Створено, id:\", p.id))\n  .catch(e => console.log(e.message));"], "note": "Типові статуси: 200 — успіх, 201 — створено, 400 — некоректний запит, 401 — потрібна авторизація, 404 — не знайдено, 500 — збій на сервері.", "easy": "API — це меню ресторану: ви робите замовлення (запит) за правилами, а кухня (сервер) повертає страву (відповідь) або каже, що її немає.", "work": "Майже кожен фронтенд працює з API. У проєктах запити виносять в окремі функції чи модуль, обробляють помилки й показують користувачу повідомлення «Спробуйте пізніше», а також індикатор завантаження, поки чекають відповідь.", "tasks": ["Завантажте список користувачів із jsonplaceholder і виведіть їхні імена.", "Надішліть POST-запит і виведіть id створеного ресурсу."]}, "devtools": {"t": "Налагодження: DevTools у браузері", "p": ["DevTools відкриваються клавішею F12. Вкладка <code>Elements</code> показує структуру сторінки й стилі, <code>Console</code> — повідомлення та помилки, <code>Network</code> — усі запити з їхніми статусами й відповідями, <code>Sources</code> — код зі зручним налагоджувачем.", "Налагоджувати можна двома способами. Швидкий — вивести значення через <code>console.log</code>. Надійніший — поставити точку зупину: клікнути на номер рядка у вкладці Sources або написати в коді <code>debugger</code>. Виконання зупиниться, і ви побачите значення всіх змінних."], "code": ["const orders = [\n  { id: 1, customer: \"Олена\", total: 450 },\n  { id: 2, customer: \"Артем\", total: 120 }\n];\n\nconsole.table(orders);\nconsole.error(\"Це повідомлення про помилку\");\nconsole.warn(\"А це попередження\");\n\nfunction calc(items) {\n  let sum = 0;\n  for (const o of items) {\n    debugger;          // виконання зупиниться тут\n    sum += o.total;\n  }\n  return sum;\n}\nconsole.log(calc(orders));"], "note": "Після налагодження видаліть із коду всі <code>debugger</code> і зайві <code>console.log</code>: у готовому проєкті їм не місце.", "easy": "DevTools — це рентген для сторінки: ви бачите, що відбувається всередині коду, стилів і мережі, і знаходите, де саме зламалось.", "work": "Уміння налагоджувати відрізняє початківця від того, кого беруть на роботу. Типовий алгоритм: відкрити Console і прочитати помилку, у Network перевірити, чи пішов запит і що відповів сервер, а потім за допомогою точки зупину знайти рядок, де значення стало неправильним.", "tasks": ["Відкрийте будь-який сайт і в Network знайдіть запит, що повернув JSON.", "Поставте точку зупину у своєму циклі й подивіться значення змінної на кожній ітерації."]}};
  const easyOld = {"Змінні та типи в JavaScript": "Змінна — це підписана коробка, у яку кладуть значення. Коробка const запечатана назавжди, а коробку let можна відкрити й змінити вміст.", "Умови та оператори": "Умова — це розвилка на дорозі: якщо щось правда, ідемо в один бік, якщо ні — в інший.", "Цикли": "Цикл — це команда «повторюй ці дії», доки не виконається умова зупинки.", "Функції": "Функція — це рецепт: ви один раз записуєте кроки й потім готуєте за ним скільки завгодно разів, змінюючи інгредієнти (параметри).", "Рядки та числа": "Рядок — це текст, а метод — готова дія над ним, як кнопка на калькуляторі.", "Масиви": "Масив — це нумерований список, як перелік покупок, тільки нумерація починається не з одиниці, а з нуля.", "Методи масивів: map, filter, reduce": "map перетворює кожен елемент, filter залишає потрібні, а reduce зводить усе до одного підсумку, як касир, що рахує загальну суму чека.", "Об'єкти": "Об'єкт — це картка з полями, як анкета: ім'я, вік, пошта. Кожне поле має свою назву й значення.", "Область видимості та замикання": "Замикання — це рюкзак, який функція бере з собою з місця народження: у ньому лежать потрібні їй змінні.", "Класи та this": "Клас — це креслення, за яким можна зробити багато однакових предметів. <code>this</code> — це «саме цей предмет».", "Помилки та try/catch": "try/catch — це страхувальна сітка: якщо щось падає, програма не розбивається, а ловить помилку й продовжує.", "Модулі та npm": "Модуль — це окремий файл-інструмент, який підключають до основного коду, як шухляду з інструментами. npm — магазин, де можна взяти чужі інструменти.", "DOM і події": "DOM — це дерево елементів сторінки, а JavaScript — пульт, яким ними керують: змінюють текст, кольори, реагують на кліки.", "JSON і localStorage": "JSON — це текст, у який упаковані дані для передачі, як посилка. localStorage — шухляда браузера для невеликих речей.", "Проміси, async та fetch": "Проміс — це квитанція: результату ще немає, але його обіцяють видати пізніше. await означає «зачекай, поки видадуть»."};
  const byTitle = {};
  LESSONS.js.forEach(l => { byTitle[l.t] = l; if (easyOld[l.t]) l.easy = easyOld[l.t]; });
  const T = t => { if (!byTitle[t]) throw new Error("Немає уроку: " + t); return byTitle[t]; };
  LESSONS.js = [N.intro, T("Змінні та типи в JavaScript"), T("Умови та оператори"), T("Цикли"),
    T("Функції"), T("Рядки та числа"), T("Масиви"), T("Методи масивів: map, filter, reduce"), T("Об'єкти"), N.setmap, N.date,
    T("Область видимості та замикання"), T("Класи та this"), T("Помилки та try/catch"), T("Модулі та npm"),
    T("DOM і події"), N.forms, T("JSON і localStorage"),
    N.eventloop, T("Проміси, async та fetch"), N.api, N.devtools];
  CHAPTERS.js = [["Початок", 0], ["Функції та дані", 4], ["Глибше в мову", 11], ["Браузер", 15], ["Асинхронність і API", 18], ["Налагодження", 21]];
  CHAPTERS.js.forEach(([name, from], i, a) => {
    const to = i + 1 < a.length ? a[i + 1][1] : LESSONS.js.length;
    for (let j = from; j < to; j++) LESSONS.js[j].ch = name;
  });
})();

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
