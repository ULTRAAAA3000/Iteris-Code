// Еталонні рішення завдань SQL, глава 09 (id завдання -> повний скрипт). У сайт не потрапляють
import { USERS } from "../../content/tasks/sql/data.ts";
const raw = String.raw;

const FLAT = raw`CREATE TABLE orders_flat (id INTEGER PRIMARY KEY, customer TEXT, city TEXT, product TEXT, price INTEGER);
INSERT INTO orders_flat VALUES (1, 'Оля', 'Київ', 'Хліб', 25), (2, 'Оля', 'Київ', 'Сир', 180), (3, 'Іван', 'Дніпро', 'Молоко', 42);`;
const BANK = raw`CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER);
INSERT INTO accounts VALUES (1, 'Оля', 500), (2, 'Іван', 300);`;

export const SOLUTIONS_09 = {
  "sql-normalize": `${FLAT}

CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO customers (name, city) SELECT DISTINCT customer, city FROM orders_flat;

CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product TEXT, price INTEGER);
INSERT INTO orders (id, customer_id, product, price)
  SELECT f.id, c.id, f.product, f.price FROM orders_flat f JOIN customers c ON c.name = f.customer;

SELECT COUNT(*) FROM customers;
SELECT c.name, c.city, COUNT(*), SUM(o.price) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.name;
`,
  "sql-index": `${USERS}

CREATE INDEX idx_users_email ON users(email);

EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'olya@example.com';
`,
  "sql-explain": `${USERS}

CREATE INDEX idx_city_age ON users(city, age);

EXPLAIN QUERY PLAN SELECT * FROM users WHERE city = 'Київ' AND age > 20;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE age > 20;
`,
  "sql-transactions": `${BANK}

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
};
