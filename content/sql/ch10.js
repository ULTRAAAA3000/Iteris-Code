// Курс SQL, глава 10 «Практика» (урок 35). Приклади мовою Python (модуль sqlite3 зі стандартної бібліотеки), кожен блок самодостатній.

export const LESSONS_10 = [
  {
    t: "SQL у програмі: Python і sqlite3",
    ch: "Практика",
    easy: "Програма розмовляє з базою через бібліотеку: відкриває з'єднання, відправляє запити, забирає рядки. Головне правило безпеки: значення передають окремо від тексту запиту, на місці знаків питання.",
    p: [
      "До цього ми писали SQL у «чистому» вигляді, але в реальному житті запити надсилає програма. Python має вбудований модуль <code>sqlite3</code>, який нічого не потрібно встановлювати. Робота починається зі з'єднання: <code>conn = sqlite3.connect('shop.db')</code> відкриває файл бази (або створює його), а <code>sqlite3.connect(':memory:')</code> створює базу в пам'яті, як у наших завданнях. Далі запити виконують методом <code>conn.execute(sql)</code>, який повертає <b>курсор</b> — об'єкт, що вміє віддавати рядки результату.",
      "Результат читають трьома способами: <code>fetchone()</code> повертає один рядок (або <code>None</code>, коли рядків немає), <code>fetchall()</code> повертає список усіх рядків, а сам курсор можна обійти циклом <code>for row in cursor</code>. Кожен рядок — кортеж значень у порядку стовпців: <code>('Оля', 25)</code>. Для читабельнішого доступу задають <code>conn.row_factory = sqlite3.Row</code>, і тоді до значень звертаються за іменем стовпця: <code>row['name']</code>. Для запитів, що змінюють дані, корисні <code>cursor.lastrowid</code> (номер доданого рядка) та <code>cursor.rowcount</code> (скільки рядків зачеплено).",
      "Тепер найважливіше. Значення з програми (від користувача, з форми, з файлу) <b>ніколи</b> не вставляють у текст запиту склеюванням рядків чи f-рядками: <code>\"... WHERE name = '\" + name + \"'\"</code>. Інакше ви відкриваєте двері <b>SQL-ін'єкції</b>: зловмисник вводить замість імені <code>x' OR '1'='1</code>, і запит перетворюється на «усі рядки таблиці». Через цю помилку витікали бази паролів, а в рейтингах вразливостей вона роками посідає перші місця. Помилка проста, а наслідки жахливі.",
      "Правильний спосіб — <b>параметризовані запити</b>. У тексті запиту на місці значення ставлять знак питання, а самі значення передають окремим аргументом-кортежем: <code>conn.execute('SELECT name FROM users WHERE age &gt;= ?', (18,))</code>. База отримує структуру запиту й значення <i>окремо</i> і ніколи не інтерпретує значення як код. Рядок <code>x' OR '1'='1</code> тоді шукається буквально як ім'я, якого немає, і результат порожній. Зверніть увагу на кому в кортежі з одним елементом: <code>(18,)</code>, а не <code>(18)</code>. Параметрами можна підставляти лише <i>значення</i>, але не імена таблиць чи стовпців.",
      "Кілька рядків вставляють методом <code>executemany(sql, список_кортежів)</code>: <code>conn.executemany('INSERT INTO users (name, age) VALUES (?, ?)', rows)</code>. Це швидше й чистіше, ніж цикл з окремих <code>execute</code>. Кількість значень у кортежі має збігатися з кількістю знаків питання, інакше Python викине <code>sqlite3.ProgrammingError</code> про неправильну кількість прив'язок. Є також іменовані параметри (<code>:name</code>) з передачею словника, що зручно, коли параметрів багато: <code>execute('… WHERE age &gt;= :min', {'min': 18})</code>.",
      "Зміни даних треба <b>зафіксувати</b>. Модуль <code>sqlite3</code> сам відкриває транзакцію перед <code>INSERT</code>, <code>UPDATE</code> та <code>DELETE</code>, а закрити її — ваше завдання: <code>conn.commit()</code> зберігає, <code>conn.rollback()</code> скасовує. Найзручніше й найнадійніше — менеджер контексту: блок <code>with conn:</code> автоматично викликає <code>commit</code> при успішному завершенні й <code>rollback</code>, якщо всередині виник виняток. Так вся група змін виконується за принципом «все або нічого», як у транзакціях, які ви вже вивчили.",
      "Помилки бази приходять як винятки Python: порушення <code>UNIQUE</code>, <code>NOT NULL</code> чи <code>CHECK</code> дає <code>sqlite3.IntegrityError</code>, помилка в тексті запиту — <code>sqlite3.OperationalError</code>. Їх ловлять через <code>try/except</code> і показують користувачеві зрозуміле повідомлення. Пам'ятайте ще про одну деталь з уроку про зв'язки: перевірку зовнішніх ключів потрібно вмикати на <b>кожному</b> з'єднанні командою <code>conn.execute('PRAGMA foreign_keys = ON')</code>. Закривають з'єднання командою <code>conn.close()</code>.",
      "Цим уроком завершується курс. Ви пройшли шлях від першого <code>SELECT</code> до проєктування схеми, індексів, транзакцій і роботи з базою з коду. Далі природно рухатись у бік серйозніших систем: PostgreSQL чи MySQL, де майже все вивчене працює так само, але є справжні типи даних, суворіша перевірка й нові можливості. Практикуйтесь на власних даних: розкладіть на таблиці свій список справ, фінанси або колекцію й напишіть до них запити, і SQL швидко стане робочим інструментом.",
    ],
    code: [
      String.raw`# Python: з'єднання, вставка з параметрами, читання результату
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
conn.executemany("INSERT INTO users (name, age) VALUES (?, ?)", [("Оля", 25), ("Іван", 17), ("Марія", 40)])
conn.commit()

rows = conn.execute("SELECT name, age FROM users WHERE age >= ? ORDER BY name", (18,)).fetchall()
print(rows)`,
      String.raw`# Python: SQL-ін'єкція проти параметризованого запиту
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
conn.executemany("INSERT INTO users (name) VALUES (?)", [("Оля",), ("Іван",), ("Марія",)])

evil = "x' OR '1'='1"
bad = conn.execute("SELECT name FROM users WHERE name = '" + evil + "'").fetchall()
good = conn.execute("SELECT name FROM users WHERE name = ?", (evil,)).fetchall()
print(len(bad), len(good))  # склеювання віддало всіх (3), параметр — нікого (0)`,
      String.raw`# Python: with conn — вся група змін фіксується разом або скасовується разом
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("INSERT INTO users (id, name) VALUES (1, 'Оля')")
conn.commit()

try:
    with conn:
        conn.execute("INSERT INTO users (name) VALUES (?)", ("Нова",))
        conn.execute("INSERT INTO users (id, name) VALUES (1, 'Дубль')")  # порушує PRIMARY KEY
except sqlite3.IntegrityError as e:
    print("помилка:", e)

print(conn.execute("SELECT COUNT(*) FROM users").fetchone()[0])  # 1: «Нова» теж скасовано`,
      String.raw`# Python: доступ за іменем стовпця, lastrowid і зовнішні ключі на з'єднанні
import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
cur = conn.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Оля", 25))
print(cur.lastrowid, cur.rowcount)

row = conn.execute("SELECT name, age FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
print(row["name"], row["age"])

print(conn.execute("PRAGMA foreign_keys").fetchone()[0])
conn.execute("PRAGMA foreign_keys = ON")
print(conn.execute("PRAGMA foreign_keys").fetchone()[0])`,
      String.raw`# помилка: значень менше, ніж знаків питання (ProgrammingError)
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
conn.execute("SELECT * FROM users WHERE age > ? AND name = ?", (1,))`,
    ],
    note: "Значення передавайте параметрами (?), а не склеюванням рядків: це єдиний надійний захист від SQL-ін'єкцій. Блок with conn фіксує зміни при успіху й скасовує при винятку. Зовнішні ключі вмикають на кожному з'єднанні.",
    work: "Майже кожен бекенд працює з базою через бібліотеку або ORM, а під капотом лежать саме параметризовані запити. SQL-ін'єкція належить до найчастіших вразливостей, тому «ніколи не склеюй запит» — перше правило, яке перевіряють на код-рев'ю.",
    tasks: [
      "Чому не можна вставляти значення від користувача в текст запиту склеюванням рядків? Що таке SQL-ін'єкція?",
      "Що робить блок with conn: у Python при успішному виконанні й при винятку всередині?",
    ],
  },
];
