// Еталонні рішення завдань SQL, глава 05 (id завдання -> повний скрипт). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_05 = {
  "sql-create-table": raw`CREATE TABLE courses (id INTEGER, title TEXT, price REAL);

INSERT INTO courses VALUES (1, 'SQL', 199.5), (2, 'Python', 250);
SELECT id, title, price FROM courses ORDER BY id;
`,
  "sql-constraints": raw`CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER CHECK (age >= 0),
  status TEXT DEFAULT 'активний'
);

INSERT INTO students (name, email, age) VALUES ('Оля', 'olya@example.com', 20), ('Іван', 'ivan@example.com', 22);
SELECT id, name, status FROM students ORDER BY id;
`,
  "sql-insert-update-delete": raw`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER DEFAULT 0);
INSERT INTO items (name, qty) VALUES ('Яблуко', 5);

INSERT INTO items (name, qty) VALUES ('Груша', 7);
INSERT INTO items (name) VALUES ('Слива');

SELECT id, name, qty FROM items ORDER BY id;
`,
  "sql-update-delete": raw`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER);
INSERT INTO items VALUES (1, 'Яблуко', 5), (2, 'Слива', 0), (3, 'Вишня', 12);

UPDATE items SET qty = qty + 10 WHERE name = 'Яблуко';
DELETE FROM items WHERE qty = 0;

SELECT id, name, qty FROM items ORDER BY id;
`,
  "sql-upsert": raw`CREATE TABLE stock (item TEXT PRIMARY KEY, qty INTEGER);
INSERT INTO stock VALUES ('Яблуко', 5);

INSERT INTO stock VALUES ('Яблуко', 10) ON CONFLICT(item) DO UPDATE SET qty = qty + excluded.qty;
INSERT INTO stock VALUES ('Груша', 3) ON CONFLICT(item) DO UPDATE SET qty = qty + excluded.qty;

SELECT item, qty FROM stock ORDER BY item;
`,
};
