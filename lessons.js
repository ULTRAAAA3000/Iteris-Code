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
  note: "Перш ніж зливати, переконайтеся, що перебуваєте в тій гілці, У яку хочете влити зміни.",
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
