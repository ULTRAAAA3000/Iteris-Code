// Практичні завдання курсу SQL, глава 05 «Схема й зміна даних» (уроки 15–19). Еталони: tests/solutions/sql-ch05.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "sql-create-table", lesson: "sql/15", xp: 25,
    title: "Створіть таблицю courses",
    context: "Таблиця — це структура: назви стовпців і їхні типи. Спершу створюють її командою CREATE TABLE, і лише тоді в неї можна вставляти рядки. Без таблиці будь-який INSERT дасть помилку.",
    brief: ["Створіть таблицю <code>courses</code> з трьома стовпцями: <code>id</code> (<code>INTEGER</code>), <code>title</code> (<code>TEXT</code>) і <code>price</code> (<code>REAL</code>). Вставка рядків і вибірка нижче вже написані: без таблиці вони дають помилку."],
    starter: raw`-- TODO: CREATE TABLE courses (...)

INSERT INTO courses VALUES (1, 'SQL', 199.5), (2, 'Python', 250);
SELECT id, title, price FROM courses ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "У таблиці два курси, ціна дробова", has: "1|SQL|199.5\n2|Python|250.0", hint: "Стовпець price має бути REAL: тоді 250 збережеться як 250.0." },
      { on: "source", name: "Таблиця називається courses", matches: "CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?courses\\s*\\(", hint: "Почніть із CREATE TABLE courses ( ... );" },
      { on: "source", name: "title має тип TEXT", matches: "title\\s+TEXT", hint: "Стовпець title оголосіть як title TEXT." },
      { on: "source", name: "price має тип REAL", matches: "price\\s+REAL", hint: "Стовпець price оголосіть як price REAL." },
    ],
  },
  {
    ...base, id: "sql-constraints", lesson: "sql/16", xp: 30,
    title: "Таблиця students з обмеженнями",
    context: "Структура таблиці це контракт: PRIMARY KEY гарантує унікальність рядка, NOT NULL забороняє порожнє ім'я, CHECK не пропустить від'ємний вік. Погані дані відсікаються на вході, а не відловлюються по всьому коду.",
    brief: ["Створіть таблицю <code>students</code>: <code>id</code> (<code>INTEGER PRIMARY KEY</code>), <code>name</code> (<code>TEXT NOT NULL</code>), <code>email</code> (<code>TEXT UNIQUE</code>), <code>age</code> (<code>INTEGER</code> із <code>CHECK (age &gt;= 0)</code>) і <code>status</code> (<code>TEXT DEFAULT 'активний'</code>). Дані й вибірка нижче вже написані."],
    starter: raw`-- TODO: CREATE TABLE students (...)

INSERT INTO students (name, email, age) VALUES ('Оля', 'olya@example.com', 20), ('Іван', 'ivan@example.com', 22);
SELECT id, name, status FROM students ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "id і status проставила база", has: "1|Оля|активний\n2|Іван|активний", hint: "id має бути INTEGER PRIMARY KEY, а status має DEFAULT 'активний'." },
      { on: "source", name: "Первинний ключ PRIMARY KEY", matches: "PRIMARY\\s+KEY", hint: "id INTEGER PRIMARY KEY." },
      { on: "source", name: "Ім'я NOT NULL", matches: "name\\s+TEXT\\s+NOT\\s+NULL", hint: "name TEXT NOT NULL." },
      { on: "source", name: "email UNIQUE", matches: "email\\s+TEXT\\s+UNIQUE", hint: "email TEXT UNIQUE." },
      { on: "source", name: "Вік перевіряється через CHECK", matches: "CHECK\\s*\\(\\s*age\\s*>=\\s*0\\s*\\)", hint: "age INTEGER CHECK (age >= 0)." },
    ],
  },
  {
    ...base, id: "sql-insert-update-delete", lesson: "sql/17", xp: 25,
    title: "Додати товари: INSERT",
    context: "INSERT додає рядки, а перелік стовпців робить його надійним: про решту подбає база. Стовпець без значення отримає DEFAULT, а числовий ключ проставиться сам.",
    brief: [
      "Додайте двома командами товари з переліком стовпців: <code>('Груша', 7)</code> і <code>('Слива')</code> без кількості, щоб спрацював <code>DEFAULT 0</code>.",
      "Вибірка внизу вже написана. Таблиця вже містить яблука.",
    ],
    starter: raw`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER DEFAULT 0);
INSERT INTO items (name, qty) VALUES ('Яблуко', 5);

-- TODO: INSERT INTO items (name, qty) для груші; INSERT INTO items (name) для сливи

SELECT id, name, qty FROM items ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Є груша з кількістю 7", has: "1|Яблуко|5\n2|Груша|7", hint: "INSERT INTO items (name, qty) VALUES ('Груша', 7);" },
      { on: "stdout", name: "Слива отримала qty = 0 за замовчуванням", has: "3|Слива|0", hint: "Для сливи вкажіть лише name: INSERT INTO items (name) VALUES ('Слива');" },
      { on: "source", name: "INSERT із переліком стовпців", matches: "INSERT\\s+INTO\\s+items\\s*\\(\\s*name", hint: "Перелічуйте стовпці: INSERT INTO items (name, qty) ..." },
    ],
  },
  {
    ...base, id: "sql-update-delete", lesson: "sql/18", xp: 30,
    title: "Змінити й видалити: UPDATE та DELETE",
    context: "UPDATE і DELETE змінюють дані, і найнебезпечніша помилка тут це забутий WHERE: UPDATE без нього змінить усю таблицю, DELETE без нього спорожнить її.",
    brief: [
      "Збільште кількість яблук на 10 (<code>UPDATE ... SET qty = qty + 10 WHERE name = 'Яблуко'</code>).",
      "Видаліть позиції, яких не залишилось (<code>DELETE ... WHERE qty = 0</code>). Вибірка внизу вже написана.",
    ],
    starter: raw`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER);
INSERT INTO items VALUES (1, 'Яблуко', 5), (2, 'Слива', 0), (3, 'Вишня', 12);

-- TODO: UPDATE з WHERE, DELETE з WHERE

SELECT id, name, qty FROM items ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Яблук стало 15", has: "1|Яблуко|15", hint: "UPDATE items SET qty = qty + 10 WHERE name = 'Яблуко';" },
      { on: "stdout", name: "Слива видалена, вишня на місці", has: "1|Яблуко|15\n3|Вишня|12", hint: "DELETE FROM items WHERE qty = 0; Сливи (qty 0) у таблиці лишитись не повинно." },
      { on: "source", name: "UPDATE із WHERE", matches: "UPDATE\\s+items\\s+SET[^;]*WHERE", hint: "Не забудьте WHERE у UPDATE: без нього зміняться всі рядки." },
      { on: "source", name: "DELETE із WHERE", matches: "DELETE\\s+FROM\\s+items\\s+WHERE", hint: "Не забудьте WHERE у DELETE: без нього таблиця спорожніє." },
    ],
  },
  {
    ...base, id: "sql-upsert", lesson: "sql/19", xp: 35,
    title: "Поповнення складу: UPSERT",
    context: "Лічильники й склад оновлюють «за ключем»: якщо позиція є, додати кількість, якщо немає, створити. UPSERT робить це одним оператором без гонки між перевіркою й вставкою.",
    brief: [
      "Поповніть склад двома командами <code>INSERT ... ON CONFLICT(item) DO UPDATE SET qty = qty + excluded.qty</code>: яблук на 10 (вони вже є) і груш на 3 (їх ще немає).",
      "Вибірка за назвою внизу вже написана.",
    ],
    starter: raw`CREATE TABLE stock (item TEXT PRIMARY KEY, qty INTEGER);
INSERT INTO stock VALUES ('Яблуко', 5);

-- TODO: INSERT ... ON CONFLICT(item) DO UPDATE для ('Яблуко', 10) і ('Груша', 3)

SELECT item, qty FROM stock ORDER BY item;
`,
    checks: [
      { on: "stdout", name: "Яблук 15, а груш 3", has: "Груша|3\nЯблуко|15", hint: "Для наявного ключа кількість додається, для нового рядок створюється." },
      { on: "source", name: "Використано ON CONFLICT … DO UPDATE", matches: "ON\\s+CONFLICT\\s*\\(\\s*item\\s*\\)\\s+DO\\s+UPDATE", hint: "INSERT INTO stock VALUES (...) ON CONFLICT(item) DO UPDATE SET ..." },
      { on: "source", name: "Кількість береться з excluded.qty", matches: "qty\\s*\\+\\s*excluded\\.qty", hint: "SET qty = qty + excluded.qty: excluded містить значення, яке ви намагались вставити." },
    ],
  },
];
