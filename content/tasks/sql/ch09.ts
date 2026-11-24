// Практичні завдання курсу SQL, глава 09 «Проєктування й продуктивність» (уроки 31–34). Еталони: tests/solutions/sql-ch09.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { USERS } from "./data.ts";

const raw = String.raw;

const FLAT = raw`CREATE TABLE orders_flat (id INTEGER PRIMARY KEY, customer TEXT, city TEXT, product TEXT, price INTEGER);
INSERT INTO orders_flat VALUES (1, 'Оля', 'Київ', 'Хліб', 25), (2, 'Оля', 'Київ', 'Сир', 180), (3, 'Іван', 'Дніпро', 'Молоко', 42);`;
const BANK = raw`CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER);
INSERT INTO accounts VALUES (1, 'Оля', 500), (2, 'Іван', 300);`;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "sql-normalize", lesson: "sql/31", xp: 40,
    title: "Нормалізація: розділити широку таблицю",
    context: "У широкій таблиці замовлень ім'я й місто клієнта повторюються в кожному рядку, і їх легко розсинхронізувати. Нормалізація виносить клієнтів в окрему таблицю, і кожен факт живе в одному місці.",
    brief: [
      "Створіть таблицю <code>customers</code> (<code>id INTEGER PRIMARY KEY</code>, <code>name</code>, <code>city</code>) і заповніть її унікальними клієнтами з <code>orders_flat</code> (<code>INSERT … SELECT DISTINCT</code>).",
      "Створіть таблицю <code>orders</code> (<code>id</code>, <code>customer_id</code> з <code>REFERENCES customers(id)</code>, <code>product</code>, <code>price</code>) і перенесіть замовлення, знайшовши <code>customer_id</code> через <code>JOIN</code>. Перевірочні запити вже написані.",
    ],
    starter: `${FLAT}

-- TODO 1: CREATE TABLE customers + INSERT INTO customers (name, city) SELECT DISTINCT ...
-- TODO 2: CREATE TABLE orders (... REFERENCES customers(id) ...) + INSERT INTO orders ... SELECT ... JOIN customers

SELECT COUNT(*) FROM customers;
SELECT c.name, c.city, COUNT(*), SUM(o.price) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.name;
`,
    checks: [
      { on: "stdout", name: "Два унікальні клієнти", has: "2\n", hint: "INSERT INTO customers (name, city) SELECT DISTINCT customer, city FROM orders_flat;" },
      { on: "stdout", name: "Підсумки за клієнтами: Іван 1 на 42, Оля 2 на 205", has: "Іван|Дніпро|1|42\nОля|Київ|2|205", hint: "Для orders візьміть customer_id через JOIN customers c ON c.name = f.customer." },
      { on: "source", name: "Клієнти без повторів (DISTINCT)", matches: "INSERT\\s+INTO\\s+customers[\\s\\S]*SELECT\\s+DISTINCT", hint: "Без DISTINCT Оля потрапить у customers двічі." },
      { on: "source", name: "Зовнішній ключ на customers(id)", matches: "REFERENCES\\s+customers\\s*\\(\\s*id\\s*\\)", hint: "customer_id INTEGER REFERENCES customers(id)." },
    ],
  },
  {
    ...base, id: "sql-index", lesson: "sql/32", xp: 35,
    title: "Індекс і план запиту",
    context: "Без індексу база читає всю таблицю рядок за рядком (SCAN). З індексом знаходить потрібний рядок майже миттєво (SEARCH). EXPLAIN QUERY PLAN показує, який шлях вона обрала.",
    brief: ["Створіть індекс <code>idx_users_email</code> на стовпці <code>email</code> таблиці <code>users</code>. Нижче вже є запит <code>EXPLAIN QUERY PLAN</code>: після створення індексу в плані має з'явитись використання цього індексу замість повного перегляду таблиці."],
    starter: `${USERS}

-- TODO: CREATE INDEX idx_users_email ON users(email);

EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'olya@example.com';
`,
    checks: [
      { on: "stdout", name: "План використовує індекс idx_users_email", has: "USING INDEX idx_users_email", hint: "Створіть індекс до EXPLAIN: CREATE INDEX idx_users_email ON users(email);" },
      { on: "stdout", name: "Повного перегляду таблиці немає", has: "SCAN", not: true, hint: "Якщо в плані досі SCAN, індекс не створено або створено на іншому стовпці." },
      { on: "source", name: "Індекс створено командою CREATE INDEX", matches: "CREATE\\s+INDEX\\s+idx_users_email\\s+ON\\s+users\\s*\\(\\s*email\\s*\\)", hint: "CREATE INDEX idx_users_email ON users(email);" },
    ],
  },
  {
    ...base, id: "sql-explain", lesson: "sql/33", xp: 40,
    title: "Складений індекс: коли працює, а коли ні",
    context: "Складений індекс (city, age) допомагає запитам за city, а також за city і age разом, але не допомагає запиту лише за age. Це видно в плані запиту: SEARCH проти SCAN.",
    brief: [
      "Створіть складений індекс <code>idx_city_age</code> на <code>users(city, age)</code>.",
      "Нижче вже є два <code>EXPLAIN QUERY PLAN</code>: перший (за містом і віком) має використати ваш індекс, другий (лише за віком) лишиться повним переглядом.",
    ],
    starter: `${USERS}

-- TODO: CREATE INDEX idx_city_age ON users(city, age);

EXPLAIN QUERY PLAN SELECT * FROM users WHERE city = 'Київ' AND age > 20;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE age > 20;
`,
    checks: [
      { on: "stdout", name: "Запит за city і age використовує індекс", has: "USING INDEX idx_city_age", hint: "CREATE INDEX idx_city_age ON users(city, age); порядок стовпців: спершу city." },
      { on: "stdout", name: "Запит лише за age лишається повним переглядом", matches: "SCAN", hint: "Індекс не починається з age, тому другий план має містити SCAN: це правило лівого префікса." },
      { on: "source", name: "Складений індекс у правильному порядку", matches: "CREATE\\s+INDEX\\s+idx_city_age\\s+ON\\s+users\\s*\\(\\s*city\\s*,\\s*age\\s*\\)", hint: "Стовпці: (city, age), у такому порядку." },
    ],
  },
  {
    ...base, id: "sql-transactions", lesson: "sql/34", xp: 35,
    title: "Переказ коштів у транзакції",
    context: "Переказ це два UPDATE: зняти в одного, додати іншому. Якщо між ними станеться збій, гроші зникнуть. Транзакція робить обидві дії одним неподільним кроком: або виконаються обидві (COMMIT), або жодна (ROLLBACK).",
    brief: [
      "Перекажіть 100 з рахунку Олі (<code>id = 1</code>) на рахунок Івана (<code>id = 2</code>) в одній транзакції: <code>BEGIN</code>, два <code>UPDATE</code>, <code>COMMIT</code>.",
      "Потім продемонструйте скасування: у транзакції <code>BEGIN</code> видаліть усі рахунки (<code>DELETE FROM accounts</code>) і скасуйте командою <code>ROLLBACK</code>. Підсумкові запити вже написані.",
    ],
    starter: `${BANK}

-- TODO 1: BEGIN; два UPDATE; COMMIT;
-- TODO 2: BEGIN; DELETE FROM accounts; ROLLBACK;

SELECT name, balance FROM accounts ORDER BY id;
SELECT COUNT(*) FROM accounts;
`,
    checks: [
      { on: "stdout", name: "Після переказу: Оля|400 і Іван|400", has: "Оля|400\nІван|400", hint: "Зніміть 100 в Олі (id = 1) і додайте 100 Іванові (id = 2): два UPDATE між BEGIN і COMMIT." },
      { on: "stdout", name: "Після ROLLBACK рахунки на місці: 2", has: "Іван|400\n2", hint: "BEGIN; DELETE FROM accounts; ROLLBACK; відкат повертає обидва рахунки." },
      { on: "source", name: "Є COMMIT", matches: "COMMIT", hint: "Зафіксуйте переказ командою COMMIT." },
      { on: "source", name: "Є ROLLBACK", matches: "ROLLBACK", hint: "Скасуйте видалення командою ROLLBACK." },
    ],
  },
];
