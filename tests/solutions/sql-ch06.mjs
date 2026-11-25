// Еталонні рішення завдань SQL, глава 06 (id завдання -> повний скрипт). У сайт не потрапляють
const raw = String.raw;

const SHOP = raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван'), (3, 'Марія');
INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);`;
const SHOP_FULL = raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван'), (3, 'Марія');
INSERT INTO orders VALUES (1, 1), (2, 1), (3, 2);
INSERT INTO products VALUES (1, 'Хліб', 25), (2, 'Молоко', 42), (3, 'Сир', 180);
INSERT INTO order_items VALUES (1, 1, 2), (1, 2, 1), (2, 3, 1), (3, 1, 3);`;
const MAILS = raw`CREATE TABLE customers (email TEXT);
CREATE TABLE subscribers (email TEXT);
INSERT INTO customers VALUES ('olya@x.com'), ('ivan@x.com'), ('maria@x.com');
INSERT INTO subscribers VALUES ('ivan@x.com'), ('petro@x.com');`;

export const SOLUTIONS_06 = {
  "sql-foreign-key": raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван');

CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), total INTEGER);

INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);
SELECT c.name, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name ORDER BY c.name;
`,
  "sql-joins": `${SHOP}

SELECT c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id;
SELECT c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > 60 ORDER BY o.id;
`,
  "sql-left-join": `${SHOP}

SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;
SELECT c.name, COALESCE(SUM(o.total), 0) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.id;
`,
  "sql-multi-join": `${SHOP_FULL}

SELECT c.name, p.name, i.qty FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id ORDER BY o.id, p.id;
SELECT o.id, c.name, SUM(p.price * i.qty) FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id GROUP BY o.id ORDER BY o.id;
`,
  "sql-union": `${MAILS}

SELECT email FROM customers UNION SELECT email FROM subscribers ORDER BY email;
SELECT email FROM customers INTERSECT SELECT email FROM subscribers;
SELECT email FROM customers EXCEPT SELECT email FROM subscribers ORDER BY email;
`,
};
