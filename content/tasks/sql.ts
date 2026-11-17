// Практичні завдання курсу SQL (діалект SQLite): по одному на кожен урок. Запускаються на сервері (runtime: "remote"):
// скрипт виконується на порожній базі в пам'яті, вивід це результати запитів (рядки, стовпці через |).
// Еталони: tests/solutions/sql.mjs. Дані (CREATE і INSERT) уже в заготовці, користувач дописує запити.
// Проміжні перевірки дивляться на наявність рядків у виводі (has), тому режим заголовків у пісочниці їх не ламає.
// Урок 15 (SQL у Python) виконується мовою Python: це завдання курсу sql із lang: "python".
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "sql", runtime: "remote", lang: "sql", file: "main.sql", editorLang: "sql", premium: false } as const;

const PRODUCTS = raw`CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, category TEXT);
INSERT INTO products VALUES (1, 'Хліб', 25, 'випічка'), (2, 'Молоко', 42, 'молочне'), (3, 'Сир', 180, 'молочне'), (4, 'Булочка', 18, 'випічка'), (5, 'Йогурт', 35, 'молочне');`;
const USERS = raw`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, city TEXT, email TEXT);
INSERT INTO users VALUES (1, 'Оля', 25, 'Київ', 'olya@example.com'), (2, 'Іван', 31, 'Дніпро', NULL), (3, 'Олег', 19, 'Львів', 'oleg@example.com'), (4, 'Марія', 40, 'Київ', NULL), (5, 'Андрій', 28, NULL, 'andriy@example.com');`;
const EMPLOYEES = raw`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Оля', 'IT', 100), (2, 'Іван', 'IT', 80), (3, 'Марія', 'HR', 60), (4, 'Олег', 'HR', 90), (5, 'Андрій', 'IT', 120);`;

export const SQL_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "sql-hello", lesson: "sql/1", xp: 15,
    title: "Перші запити: рядок і обчислення",
    context: "SELECT не обов'язково читає таблицю: він може просто обчислити вираз. Так швидко перевіряють, що база працює, і пробують функції без підготовки даних.",
    brief: ["Напишіть два запити <code>SELECT</code>: перший виводить рядок <code>Привіт, SQL!</code>, другий результат виразу <code>2 + 3</code> (число, не текст). Кожен запит закінчується крапкою з комою."],
    starter: raw`-- Виведіть рядок Привіт, SQL! і значення 2 + 3 (два окремі запити)
SELECT '';
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, SQL!»", has: "Привіт, SQL!" },
      { on: "stdout", name: "Другий результат дорівнює 5", has: "Привіт, SQL!\n5" },
      { on: "source", name: "Число обчислюється виразом 2 + 3", matches: "SELECT\\s+2\\s*\\+\\s*3" },
    ],
  },
  {
    ...base, id: "sql-select-columns", lesson: "sql/2", xp: 15,
    title: "Вибірка стовпців, псевдоніми та DISTINCT",
    context: "SELECT * зручний для огляду, але в робочому коді вибирають лише потрібні стовпці. Псевдонім (AS) називає обчислений стовпець, а DISTINCT прибирає повтори.",
    brief: [
      "Першим запитом виведіть назву товару та його ціну, помножену на 2 під псевдонімом <code>double_price</code> (<code>name, price * 2 AS double_price</code>).",
      "Другим запитом виведіть унікальні категорії (<code>SELECT DISTINCT category</code>).",
    ],
    starter: `${PRODUCTS}

-- TODO 1: name і price * 2 AS double_price
-- TODO 2: унікальні категорії
`,
    checks: [
      { on: "stdout", name: "Подвоєні ціни: Хліб|50, Молоко|84", has: "Хліб|50\nМолоко|84" },
      { on: "stdout", name: "Усі п'ять товарів у першому результаті", has: "Хліб|50\nМолоко|84\nСир|360\nБулочка|36\nЙогурт|70" },
      { on: "stdout", name: "Унікальні категорії без повторів", has: "Йогурт|70\nвипічка\nмолочне" },
      { on: "source", name: "Використано псевдонім AS", matches: "AS\\s+double_price" },
      { on: "source", name: "Використано DISTINCT", matches: "DISTINCT" },
    ],
  },
  {
    ...base, id: "sql-filter-sort", lesson: "sql/3", xp: 20,
    title: "Два найдорожчі товари",
    context: "WHERE відсікає зайве, ORDER BY впорядковує, LIMIT бере потрібну кількість. Разом це «топ-N»: найдорожчі товари, останні замовлення, найактивніші користувачі.",
    brief: ["Виведіть назву й ціну двох найдорожчих товарів, дорожчих за 30: <code>WHERE price &gt; 30</code>, <code>ORDER BY price DESC</code>, <code>LIMIT 2</code>."],
    starter: `${PRODUCTS}

-- TODO: name, price для товарів дорожчих за 30, від найдорожчого, лише два
`,
    checks: [
      { on: "stdout", name: "Найдорожчий: Сир|180", has: "Сир|180" },
      { on: "stdout", name: "Другий за ціною: Молоко|42", has: "Сир|180\nМолоко|42" },
      { on: "stdout", name: "Лише два рядки", has: "Йогурт|35", not: true },
      { on: "source", name: "Використано ORDER BY ... DESC і LIMIT", matches: "ORDER\\s+BY[^;]*DESC[^;]*LIMIT\\s+2" },
    ],
  },
  {
    ...base, id: "sql-conditions", lesson: "sql/4", xp: 25,
    title: "IN, BETWEEN, LIKE та NULL",
    context: "Реальні дані неповні: поля порожні (NULL), назви хочеться шукати за початком. Порівняння з NULL через = не працює, потрібен IS NULL, і це класичне джерело помилок.",
    brief: [
      "Запит 1: імена користувачів (за алфавітом), що живуть у Києві або Дніпрі (<code>IN</code>), мають вік від 20 до 40 (<code>BETWEEN</code>) і не вказали email (<code>IS NULL</code>).",
      "Запит 2: імена, що починаються на «О» (<code>LIKE 'О%'</code>), за алфавітом. Запит 3: імена користувачів, у яких місто не вказано.",
    ],
    starter: `${USERS}

-- TODO 1: IN + BETWEEN + IS NULL, ORDER BY name
-- TODO 2: LIKE 'О%', ORDER BY name
-- TODO 3: city IS NULL
`,
    checks: [
      { on: "stdout", name: "Запит 1: Іван і Марія", has: "Іван\nМарія" },
      { on: "stdout", name: "Запит 2: Олег і Оля", has: "Марія\nОлег\nОля" },
      { on: "stdout", name: "Запит 3: Андрій", has: "Оля\nАндрій" },
      { on: "source", name: "Використано IN, BETWEEN, LIKE і IS NULL", matches: "\\bIN\\s*\\([\\s\\S]*BETWEEN[\\s\\S]*LIKE[\\s\\S]*IS\\s+NULL" },
    ],
  },
  {
    ...base, id: "sql-case-coalesce", lesson: "sql/5", xp: 25,
    title: "CASE і COALESCE",
    context: "CASE це умова всередині запиту (мітка за віком, статус за сумою), а COALESCE підставляє значення замість NULL. Разом вони готують дані до показу без зайвого коду в програмі.",
    brief: ["Виведіть для кожного користувача (за зростанням <code>id</code>): ім'я, місто (де його немає, слово <code>невідомо</code> через <code>COALESCE</code>) і групу: <code>старший</code>, якщо вік від 30, інакше <code>молодший</code> (<code>CASE WHEN</code>)."],
    starter: `${USERS}

-- TODO: name, COALESCE(city, 'невідомо'), CASE WHEN age >= 30 ...
`,
    checks: [
      { on: "stdout", name: "Оля|Київ|молодший", has: "Оля|Київ|молодший" },
      { on: "stdout", name: "Для порожнього міста: Андрій|невідомо|молодший", has: "Андрій|невідомо|молодший" },
      { on: "stdout", name: "Усі п'ять рядків у порядку id", has: "Оля|Київ|молодший\nІван|Дніпро|старший\nОлег|Львів|молодший\nМарія|Київ|старший\nАндрій|невідомо|молодший" },
      { on: "source", name: "Використано COALESCE і CASE", matches: "COALESCE[\\s\\S]*CASE|CASE[\\s\\S]*COALESCE" },
    ],
  },
  {
    ...base, id: "sql-group-by", lesson: "sql/6", xp: 30,
    title: "Групування замовлень і HAVING",
    context: "GROUP BY збирає рядки в групи, а агрегатні функції (COUNT, SUM, AVG) підсумовують кожну групу. WHERE відсікає рядки до групування, HAVING відсікає самі групи після нього.",
    brief: ["Для кожного клієнта виведіть кількість замовлень і загальну суму, залишивши лише клієнтів із сумою понад 100, від найбільшої суми: <code>GROUP BY customer</code>, <code>HAVING SUM(amount) &gt; 100</code>."],
    starter: raw`CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, amount INTEGER);
INSERT INTO orders VALUES (1, 'Оля', 50), (2, 'Іван', 120), (3, 'Оля', 80), (4, 'Марія', 30), (5, 'Іван', 60), (6, 'Оля', 20);

-- TODO: customer, COUNT(*), SUM(amount); лише суми понад 100; від найбільшої
`,
    checks: [
      { on: "stdout", name: "Іван: 2 замовлення на 180", has: "Іван|2|180" },
      { on: "stdout", name: "Оля: 3 замовлення на 150", has: "Іван|2|180\nОля|3|150" },
      { on: "stdout", name: "Марія (сума 30) відсіяна", has: "Марія|1|30", not: true },
      { on: "source", name: "Використано GROUP BY і HAVING", matches: "GROUP\\s+BY[\\s\\S]*HAVING" },
    ],
  },
  {
    ...base, id: "sql-create-table", lesson: "sql/7", xp: 30,
    title: "Таблиця students з обмеженнями",
    context: "Структура таблиці це контракт: PRIMARY KEY гарантує унікальність рядка, NOT NULL забороняє порожнє ім'я, CHECK не пропустить від'ємний вік. Погані дані відсікаються на вході, а не відловлюються по всьому коду.",
    brief: ["Створіть таблицю <code>students</code>: <code>id</code> (<code>INTEGER PRIMARY KEY</code>), <code>name</code> (<code>TEXT NOT NULL</code>), <code>age</code> (<code>INTEGER</code> із <code>CHECK (age &gt;= 0)</code>). Дані й вибірка нижче вже написані: без таблиці вони дають помилку."],
    starter: raw`-- TODO: CREATE TABLE students (...)

INSERT INTO students VALUES (1, 'Оля', 20), (2, 'Іван', 22);
SELECT id, name, age FROM students ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "У таблиці два студенти", has: "1|Оля|20\n2|Іван|22" },
      { on: "source", name: "Первинний ключ PRIMARY KEY", matches: "PRIMARY\\s+KEY" },
      { on: "source", name: "Ім'я NOT NULL", matches: "name\\s+TEXT\\s+NOT\\s+NULL" },
      { on: "source", name: "Вік перевіряється через CHECK", matches: "CHECK\\s*\\(\\s*age\\s*>=\\s*0\\s*\\)" },
    ],
  },
  {
    ...base, id: "sql-insert-update-delete", lesson: "sql/8", xp: 30,
    title: "Додати, змінити, видалити",
    context: "INSERT, UPDATE і DELETE змінюють дані, і найнебезпечніша помилка тут це забутий WHERE: UPDATE без нього змінить усю таблицю, DELETE без нього спорожнить її.",
    brief: [
      "Додайте товар <code>(4, 'Груша', 7)</code>. Збільште кількість яблук на 10 (<code>UPDATE ... WHERE name = 'Яблуко'</code>). Видаліть позиції, яких не залишилось (<code>DELETE ... WHERE qty = 0</code>).",
      "Вибірка внизу вже написана.",
    ],
    starter: raw`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER);
INSERT INTO items VALUES (1, 'Яблуко', 5), (2, 'Слива', 0), (3, 'Вишня', 12);

-- TODO: INSERT, UPDATE з WHERE, DELETE з WHERE

SELECT id, name, qty FROM items ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Яблук стало 15", has: "1|Яблуко|15" },
      { on: "stdout", name: "Слива видалена, є груша", has: "1|Яблуко|15\n3|Вишня|12\n4|Груша|7" },
      { on: "source", name: "UPDATE із WHERE", matches: "UPDATE\\s+items\\s+SET[^;]*WHERE" },
      { on: "source", name: "DELETE із WHERE", matches: "DELETE\\s+FROM\\s+items\\s+WHERE" },
    ],
  },
  {
    ...base, id: "sql-foreign-key", lesson: "sql/9", xp: 30,
    title: "Зв'язок замовлень із клієнтами",
    context: "FOREIGN KEY не дає створити замовлення неіснуючого клієнта й не дає видалити клієнта, у якого є замовлення. База сама стежить за цілісністю даних.",
    brief: ["Створіть таблицю <code>orders</code>: <code>id</code> (<code>INTEGER PRIMARY KEY</code>), <code>customer_id</code> (<code>INTEGER NOT NULL</code>) із зовнішнім ключем на <code>customers(id)</code> (<code>REFERENCES customers(id)</code> або <code>FOREIGN KEY</code>) та <code>total</code> (<code>INTEGER</code>). Дані й підсумковий запит вже написані."],
    starter: raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван');

-- TODO: CREATE TABLE orders (id, customer_id із зовнішнім ключем на customers(id), total)

INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);
SELECT c.name, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name ORDER BY c.name;
`,
    checks: [
      { on: "stdout", name: "Іван: одне замовлення", has: "Іван|1" },
      { on: "stdout", name: "Оля: два замовлення", has: "Іван|1\nОля|2" },
      { on: "source", name: "Зовнішній ключ на customers(id)", matches: "(REFERENCES|FOREIGN\\s+KEY[^;]*REFERENCES)\\s+customers\\s*\\(\\s*id\\s*\\)" },
      { on: "source", name: "customer_id NOT NULL", matches: "customer_id\\s+INTEGER\\s+NOT\\s+NULL" },
    ],
  },
  {
    ...base, id: "sql-joins", lesson: "sql/10", xp: 35,
    title: "JOIN і LEFT JOIN",
    context: "Дані розкладені по таблицях, і JOIN збирає їх разом. INNER JOIN залишає лише збіги, LEFT JOIN зберігає всі рядки лівої таблиці, навіть якщо пари немає: клієнти без замовлень не зникають зі звіту.",
    brief: [
      "Запит 1: ім'я клієнта і сума кожного його замовлення (<code>JOIN</code>), у порядку id замовлень.",
      "Запит 2: для всіх клієнтів (у порядку id) загальна сума замовлень, а для тих, хто нічого не замовляв, <code>0</code> (<code>LEFT JOIN</code>, <code>COALESCE</code>, <code>GROUP BY</code>).",
    ],
    starter: raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван'), (3, 'Марія');
INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);

-- TODO 1: JOIN: ім'я і сума кожного замовлення
-- TODO 2: LEFT JOIN: сума замовлень кожного клієнта, 0 якщо немає
`,
    checks: [
      { on: "stdout", name: "Запит 1: замовлення з іменами", has: "Оля|100\nОля|50\nІван|70" },
      { on: "stdout", name: "Запит 2: суми по клієнтах", has: "Оля|150\nІван|70" },
      { on: "stdout", name: "Клієнт без замовлень не зник: Марія|0", has: "Марія|0" },
      { on: "source", name: "Використано JOIN і LEFT JOIN", matches: "JOIN[\\s\\S]*LEFT\\s+JOIN" },
    ],
  },
  {
    ...base, id: "sql-subquery-cte", lesson: "sql/11", xp: 35,
    title: "Підзапит і CTE",
    context: "Підзапит дозволяє порівнювати з обчисленим значенням (більше за середнє), а CTE (WITH) дає проміжному результату ім'я, і складний запит читається по кроках.",
    brief: [
      "Запит 1: імена співробітників із зарплатою вище за середню по компанії (підзапит <code>(SELECT AVG(salary) FROM employees)</code>), за алфавітом.",
      "Запит 2: через <code>WITH dept_avg AS (...)</code> виведіть відділ і середню зарплату відділу, за назвою відділу.",
    ],
    starter: `${EMPLOYEES}

-- TODO 1: salary > (SELECT AVG(salary) FROM employees), ORDER BY name
-- TODO 2: WITH dept_avg AS (...) SELECT dept, avg_salary ...
`,
    checks: [
      { on: "stdout", name: "Вище за середню: Андрій і Оля", has: "Андрій\nОля" },
      { on: "stdout", name: "Середнє по відділах: HR|75.0 і IT|100.0", has: "HR|75.0\nIT|100.0" },
      { on: "source", name: "Використано підзапит з AVG", matches: "\\(\\s*SELECT\\s+AVG" },
      { on: "source", name: "Використано CTE (WITH)", matches: "WITH\\s+dept_avg\\s+AS" },
    ],
  },
  {
    ...base, id: "sql-window", lesson: "sql/12", xp: 35,
    title: "Віконні функції: місце у відділі і наростальна сума",
    context: "Віконні функції рахують по «вікну» рядків, але не схлопують їх, як GROUP BY: кожен рядок лишається, а поруч з'являється його місце в рейтингу чи наростальний підсумок.",
    brief: [
      "Запит 1: ім'я, відділ, зарплата і місце за зарплатою всередині відділу (<code>ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)</code>), впорядковано за відділом і місцем.",
      "Запит 2: ім'я і наростальна сума зарплат за зростанням <code>id</code> (<code>SUM(salary) OVER (ORDER BY id)</code>).",
    ],
    starter: `${EMPLOYEES}

-- TODO 1: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)
-- TODO 2: SUM(salary) OVER (ORDER BY id)
`,
    checks: [
      { on: "stdout", name: "Місця у відділі HR", has: "Олег|HR|90|1\nМарія|HR|60|2" },
      { on: "stdout", name: "Місця у відділі IT", has: "Андрій|IT|120|1\nОля|IT|100|2\nІван|IT|80|3" },
      { on: "stdout", name: "Наростальна сума: 100, 180, 240, 330, 450", has: "Оля|100\nІван|180\nМарія|240\nОлег|330\nАндрій|450" },
      { on: "source", name: "Використано OVER", matches: "ROW_NUMBER\\(\\)\\s+OVER[\\s\\S]*SUM\\(salary\\)\\s+OVER" },
    ],
  },
  {
    ...base, id: "sql-index", lesson: "sql/13", xp: 35,
    title: "Індекс і план запиту",
    context: "Без індексу база читає всю таблицю рядок за рядком (SCAN). З індексом знаходить потрібний рядок майже миттєво (SEARCH). EXPLAIN QUERY PLAN показує, який шлях вона обрала.",
    brief: ["Створіть індекс <code>idx_users_email</code> на стовпці <code>email</code> таблиці <code>users</code>. Нижче вже є запит <code>EXPLAIN QUERY PLAN</code>: після створення індексу в плані має з'явитись використання цього індексу замість повного перегляду таблиці."],
    starter: `${USERS}

-- TODO: CREATE INDEX idx_users_email ON users(email);

EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'olya@example.com';
`,
    checks: [
      { on: "stdout", name: "План використовує індекс idx_users_email", has: "USING INDEX idx_users_email" },
      { on: "stdout", name: "Повного перегляду таблиці немає", has: "SCAN", not: true },
      { on: "source", name: "Індекс створено командою CREATE INDEX", matches: "CREATE\\s+INDEX\\s+idx_users_email\\s+ON\\s+users\\s*\\(\\s*email\\s*\\)" },
    ],
  },
  {
    ...base, id: "sql-transactions", lesson: "sql/14", xp: 35,
    title: "Переказ коштів у транзакції",
    context: "Переказ це два UPDATE: зняти в одного, додати іншому. Якщо між ними станеться збій, гроші зникнуть. Транзакція робить обидві дії одним неподільним кроком: або виконаються обидві (COMMIT), або жодна (ROLLBACK).",
    brief: [
      "Перекажіть 100 з рахунку Олі (<code>id = 1</code>) на рахунок Івана (<code>id = 2</code>) в одній транзакції: <code>BEGIN</code>, два <code>UPDATE</code>, <code>COMMIT</code>.",
      "Потім продемонструйте скасування: у транзакції <code>BEGIN</code> видаліть усі рахунки (<code>DELETE FROM accounts</code>) і скасуйте командою <code>ROLLBACK</code>. Підсумкові запити вже написані.",
    ],
    starter: raw`CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER);
INSERT INTO accounts VALUES (1, 'Оля', 500), (2, 'Іван', 300);

-- TODO 1: BEGIN; два UPDATE; COMMIT;
-- TODO 2: BEGIN; DELETE FROM accounts; ROLLBACK;

SELECT name, balance FROM accounts ORDER BY id;
SELECT COUNT(*) FROM accounts;
`,
    checks: [
      { on: "stdout", name: "Після переказу: Оля|400 і Іван|400", has: "Оля|400\nІван|400" },
      { on: "stdout", name: "Після ROLLBACK рахунки на місці: 2", has: "Іван|400\n2" },
      { on: "source", name: "Є COMMIT", matches: "COMMIT" },
      { on: "source", name: "Є ROLLBACK", matches: "ROLLBACK" },
    ],
  },
  {
    ...base, id: "sql-in-python", lesson: "sql/15", xp: 40, lang: "python", file: "main.py", editorLang: "python",
    title: "SQL у Python: безпечні запити з параметрами",
    context: "Програма говорить із базою через бібліотеку (у Python це sqlite3). Головне правило: значення в запит підставляють через плейсхолдери ?, а не склеюють у рядок: склеювання відкриває двері SQL-ін'єкціям.",
    brief: [
      "Допишіть <code>add_users(conn, rows)</code>: вставте всі рядки одним викликом <code>conn.executemany</code> із плейсхолдерами <code>?</code>.",
      "Допишіть <code>find_adults(conn, min_age)</code>: поверніть список імен користувачів, чий вік не менший за <code>min_age</code>, за алфавітом. Значення <code>min_age</code> передайте параметром, а не вставляйте в рядок запиту.",
    ],
    starter: raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")


def add_users(conn, rows):
    # TODO: executemany із плейсхолдерами ?
    pass


def find_adults(conn, min_age):
    # TODO: SELECT name ... WHERE age >= ? ORDER BY name; повернути список імен
    return []


add_users(conn, [("Оля", 25), ("Іван", 17), ("Марія", 40)])
print(find_adults(conn, 18))
print(find_adults(conn, 30))
`,
    checks: [
      { on: "stdout", name: "Дорослі від 18: Марія й Оля", has: "['Марія', 'Оля']" },
      { on: "stdout", name: "Від 30: лише Марія", has: "['Марія']" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['Марія', 'Оля']\n['Марія']" },
      { on: "source", name: "Вставка через executemany", has: "executemany(" },
      { on: "source", name: "Плейсхолдер ? у запиті", matches: "\\?" },
      { on: "source", name: "Значення не склеюються в рядок запиту (без f-рядків і %)", matches: "execute(many)?\\(\\s*f[\"']|execute\\([^)]*%\\s*\\(|execute\\([^)]*\\.format\\(", not: true },
    ],
  },
];
