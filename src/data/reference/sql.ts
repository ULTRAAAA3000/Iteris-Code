import type { RefSection } from "./types.ts";

const raw = String.raw;

export const sql: RefSection[] = [
  { t: "Основи", items: [
    { t: "Таблиця й запит", code: raw`-- коментар в SQL
SELECT name, age
FROM users;`, note: "Ключові слова зазвичай пишуть великими літерами, кожна команда закінчується крапкою з комою." },
    { t: "Створення таблиці", code: raw`CREATE TABLE users (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT UNIQUE,
  age   INTEGER DEFAULT 0
);`, note: "`PRIMARY KEY` унікально ідентифікує рядок, `NOT NULL` забороняє порожнє значення." },
  ] },
  { t: "Вибірка даних", items: [
    { t: "SELECT і WHERE", code: raw`SELECT * FROM users;
SELECT name FROM users WHERE age >= 18;
SELECT * FROM users WHERE city = 'Дніпро' AND age < 30;
SELECT * FROM users WHERE name LIKE 'О%';
SELECT * FROM users WHERE city IN ('Київ', 'Львів');
SELECT * FROM users WHERE email IS NULL;`, note: "Рядки беруть в одинарні лапки. Перевірку на порожнє значення роблять через `IS NULL`, а не `= NULL`." },
    { t: "Сортування й обмеження", code: raw`SELECT name, age FROM users
ORDER BY age DESC, name
LIMIT 10 OFFSET 20;
SELECT DISTINCT city FROM users;`, note: "`LIMIT` і `OFFSET` потрібні для сторінкового виводу, `DISTINCT` прибирає дублікати." },
  ] },
  { t: "Зміна даних", items: [
    { t: "INSERT, UPDATE, DELETE", code: raw`INSERT INTO users (name, age) VALUES ('Олена', 16);
UPDATE users SET age = 17 WHERE id = 1;
DELETE FROM users WHERE id = 1;`, note: "Завжди пишіть `WHERE` в `UPDATE` та `DELETE`, інакше зміниться вся таблиця." },
  ] },
  { t: "Агрегація", items: [
    { t: "Функції", code: raw`SELECT COUNT(*), AVG(age), MIN(age), MAX(age), SUM(age)
FROM users;`, note: "Агрегатні функції зводять багато рядків до одного значення." },
    { t: "GROUP BY і HAVING", code: raw`SELECT city, COUNT(*) AS total
FROM users
GROUP BY city
HAVING COUNT(*) > 5
ORDER BY total DESC;`, note: "`WHERE` фільтрує рядки до групування, а `HAVING` групи після нього." },
  ] },
  { t: "Об'єднання таблиць", items: [
    { t: "JOIN", code: raw`SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id;

SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;`, note: "`JOIN` залишає лише збіги, `LEFT JOIN` усі рядки лівої таблиці (навіть без пари)." },
    { t: "Зв'язок між таблицями", code: raw`CREATE TABLE orders (
  id      INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total   REAL
);`, note: "Зовнішній ключ `REFERENCES` гарантує, що замовлення належить існуючому користувачу." },
  ] },
  { t: "Підзапити й вирази", items: [
    { t: "Підзапит", code: raw`SELECT name FROM users
WHERE age > (SELECT AVG(age) FROM users);`, note: "Підзапит у дужках виконується першим і повертає значення чи список." },
    { t: "CASE", code: raw`SELECT name,
  CASE WHEN age < 18 THEN 'неповнолітній' ELSE 'дорослий' END AS kind
FROM users;`, note: "`CASE` працює як умова if/else всередині запиту." },
  ] },
  { t: "Структура й швидкодія", items: [
    { t: "ALTER, DROP, INDEX", code: raw`ALTER TABLE users ADD COLUMN city TEXT;
CREATE INDEX idx_users_email ON users(email);
DROP TABLE old_users;`, note: "Індекс прискорює пошук за стовпцем, але трохи сповільнює запис." },
    { t: "Транзакції", code: raw`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- або ROLLBACK, щоб скасувати`, note: "Транзакція виконується повністю або не виконується зовсім." },
  ] },
];
