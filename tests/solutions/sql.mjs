// Еталонні рішення завдань SQL (id завдання -> скрипт). У сайт не потрапляють
const PRODUCTS = `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, category TEXT);
INSERT INTO products VALUES (1, 'Хліб', 25, 'випічка'), (2, 'Молоко', 42, 'молочне'), (3, 'Сир', 180, 'молочне'), (4, 'Булочка', 18, 'випічка'), (5, 'Йогурт', 35, 'молочне');`;
const USERS = `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, city TEXT, email TEXT);
INSERT INTO users VALUES (1, 'Оля', 25, 'Київ', 'olya@example.com'), (2, 'Іван', 31, 'Дніпро', NULL), (3, 'Олег', 19, 'Львів', 'oleg@example.com'), (4, 'Марія', 40, 'Київ', NULL), (5, 'Андрій', 28, NULL, 'andriy@example.com');`;
const EMPLOYEES = `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Оля', 'IT', 100), (2, 'Іван', 'IT', 80), (3, 'Марія', 'HR', 60), (4, 'Олег', 'HR', 90), (5, 'Андрій', 'IT', 120);`;

export const SQL = {
  "sql-hello": `SELECT 'Привіт, SQL!';
SELECT 2 + 3;
`,
  "sql-select-columns": `${PRODUCTS}

SELECT name, price * 2 AS double_price FROM products;
SELECT DISTINCT category FROM products;
`,
  "sql-filter-sort": `${PRODUCTS}

SELECT name, price FROM products WHERE price > 30 ORDER BY price DESC LIMIT 2;
`,
  "sql-conditions": `${USERS}

SELECT name FROM users WHERE city IN ('Київ', 'Дніпро') AND age BETWEEN 20 AND 40 AND email IS NULL ORDER BY name;
SELECT name FROM users WHERE name LIKE 'О%' ORDER BY name;
SELECT name FROM users WHERE city IS NULL;
`,
  "sql-case-coalesce": `${USERS}

SELECT name, COALESCE(city, 'невідомо') AS city, CASE WHEN age >= 30 THEN 'старший' ELSE 'молодший' END AS grp FROM users ORDER BY id;
`,
  "sql-group-by": `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, amount INTEGER);
INSERT INTO orders VALUES (1, 'Оля', 50), (2, 'Іван', 120), (3, 'Оля', 80), (4, 'Марія', 30), (5, 'Іван', 60), (6, 'Оля', 20);

SELECT customer, COUNT(*), SUM(amount) FROM orders GROUP BY customer HAVING SUM(amount) > 100 ORDER BY SUM(amount) DESC;
`,
  "sql-create-table": `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER CHECK (age >= 0));

INSERT INTO students VALUES (1, 'Оля', 20), (2, 'Іван', 22);
SELECT id, name, age FROM students ORDER BY id;
`,
  "sql-insert-update-delete": `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER);
INSERT INTO items VALUES (1, 'Яблуко', 5), (2, 'Слива', 0), (3, 'Вишня', 12);

INSERT INTO items VALUES (4, 'Груша', 7);
UPDATE items SET qty = qty + 10 WHERE name = 'Яблуко';
DELETE FROM items WHERE qty = 0;

SELECT id, name, qty FROM items ORDER BY id;
`,
  "sql-foreign-key": `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total INTEGER
);

INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);
SELECT c.name, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name ORDER BY c.name;
`,
  "sql-joins": `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван'), (3, 'Марія');
INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);

SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id ORDER BY o.id;
SELECT c.name, COALESCE(SUM(o.total), 0) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.id;
`,
  "sql-subquery-cte": `${EMPLOYEES}

SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY name;
WITH dept_avg AS (SELECT dept, AVG(salary) AS avg_salary FROM employees GROUP BY dept)
SELECT dept, avg_salary FROM dept_avg ORDER BY dept;
`,
  "sql-window": `${EMPLOYEES}

SELECT name, dept, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn FROM employees ORDER BY dept, rn;
SELECT name, SUM(salary) OVER (ORDER BY id) FROM employees ORDER BY id;
`,
  "sql-index": `${USERS}

CREATE INDEX idx_users_email ON users(email);

EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'olya@example.com';
`,
  "sql-transactions": `CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER);
INSERT INTO accounts VALUES (1, 'Оля', 500), (2, 'Іван', 300);

BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

BEGIN;
DELETE FROM accounts;
ROLLBACK;

SELECT name, balance FROM accounts ORDER BY id;
SELECT COUNT(*) FROM accounts;
`,
  "sql-in-python": `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")


def add_users(conn, rows):
    conn.executemany("INSERT INTO users (name, age) VALUES (?, ?)", rows)


def find_adults(conn, min_age):
    cur = conn.execute("SELECT name FROM users WHERE age >= ? ORDER BY name", (min_age,))
    return [row[0] for row in cur.fetchall()]


add_users(conn, [("Оля", 25), ("Іван", 17), ("Марія", 40)])
print(find_adults(conn, 18))
print(find_adults(conn, 30))
`,
};
