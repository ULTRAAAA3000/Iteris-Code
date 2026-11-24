// Спільні набори даних для завдань курсу SQL (заготовки й еталони використовують однакові таблиці).
const raw = String.raw;

export const PRODUCTS = raw`CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, category TEXT);
INSERT INTO products VALUES (1, 'Хліб', 25, 'випічка'), (2, 'Молоко', 42, 'молочне'), (3, 'Сир', 180, 'молочне'), (4, 'Булочка', 18, 'випічка'), (5, 'Йогурт', 35, 'молочне');`;
export const USERS = raw`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, city TEXT, email TEXT);
INSERT INTO users VALUES (1, 'Оля', 25, 'Київ', 'olya@example.com'), (2, 'Іван', 31, 'Дніпро', NULL), (3, 'Олег', 19, 'Львів', 'oleg@example.com'), (4, 'Марія', 40, 'Київ', NULL), (5, 'Андрій', 28, NULL, 'andriy@example.com');`;
export const EMPLOYEES = raw`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Оля', 'IT', 100), (2, 'Іван', 'IT', 80), (3, 'Марія', 'HR', 60), (4, 'Олег', 'HR', 90), (5, 'Андрій', 'IT', 120);`;
export const MENU = raw`CREATE TABLE menu (id INTEGER PRIMARY KEY, name TEXT, kind TEXT, price INTEGER);
INSERT INTO menu VALUES (1, 'Борщ', 'суп', 90), (2, 'Окрошка', 'суп', 70), (3, 'Стейк', 'гаряче', 320), (4, 'Пюре', 'гарнір', 60), (5, 'Салат', 'закуска', 85), (6, 'Чай', 'напій', 25), (7, 'Кава', 'напій', 55), (8, 'Вино', 'напій', 180);`;
export const CONTACTS = raw`CREATE TABLE contacts (id INTEGER PRIMARY KEY, name TEXT, phone TEXT);
INSERT INTO contacts VALUES (1, '  Оля ', '067-111-22-33'), (2, 'Іван', '050-444-55-66');`;
export const ORDERS = raw`CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, amount INTEGER, placed TEXT);
INSERT INTO orders VALUES (1, 'Оля', 120, '2026-10-30'), (2, 'Іван', 75, '2026-11-02'), (3, 'Оля', 200, '2026-11-15'), (4, 'Марія', 50, '2026-11-23'), (5, 'Іван', 90, '2026-12-01');`;
