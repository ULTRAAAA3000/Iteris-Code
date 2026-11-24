// Практичні завдання курсу SQL, глава 06 «Зв'язки й JOIN» (уроки 20–24). Еталони: tests/solutions/sql-ch06.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

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

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "sql-foreign-key", lesson: "sql/20", xp: 30,
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
      { on: "stdout", name: "Іван: одне замовлення, Оля: два", has: "Іван|1\nОля|2", hint: "Таблиця orders має містити стовпці id, customer_id і total у цьому порядку." },
      { on: "source", name: "Зовнішній ключ на customers(id)", matches: "(REFERENCES|FOREIGN\\s+KEY[^;]*REFERENCES)\\s+customers\\s*\\(\\s*id\\s*\\)", hint: "customer_id INTEGER NOT NULL REFERENCES customers(id)." },
      { on: "source", name: "customer_id NOT NULL", matches: "customer_id\\s+INTEGER\\s+NOT\\s+NULL", hint: "Замовлення без клієнта не має сенсу: додайте NOT NULL." },
    ],
  },
  {
    ...base, id: "sql-joins", lesson: "sql/21", xp: 30,
    title: "INNER JOIN: замовлення з іменами клієнтів",
    context: "Дані розкладені по таблицях, і JOIN збирає їх разом. INNER JOIN залишає лише збіги: рядок з'являється, лише коли в обох таблицях знайшлась пара за умовою ON.",
    brief: [
      "Запит 1: ім'я клієнта й сума кожного його замовлення (<code>JOIN … ON c.id = o.customer_id</code>), у порядку <code>id</code> замовлень.",
      "Запит 2: те саме, але лише замовлення на суму понад 60.",
    ],
    starter: `${SHOP}

-- TODO 1: JOIN: ім'я і сума кожного замовлення, ORDER BY o.id
-- TODO 2: те саме, лише o.total > 60
`,
    checks: [
      { on: "stdout", name: "Запит 1: замовлення з іменами", has: "Оля|100\nОля|50\nІван|70", hint: "SELECT c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id;" },
      { on: "stdout", name: "Запит 2: лише великі замовлення", has: "Іван|70\nОля|100\nІван|70", hint: "Додайте WHERE o.total > 60 до другого запиту: Оля|50 має зникнути." },
      { on: "stdout", name: "Марія без замовлень у вибірку не потрапила", has: "Марія", not: true, hint: "INNER JOIN залишає лише пари. Марія не має замовлень, тому її не повинно бути." },
      { on: "source", name: "Використано JOIN … ON", matches: "JOIN\\s+customers\\s+\\w+\\s+ON|JOIN\\s+orders\\s+\\w+\\s+ON", hint: "З'єднайте таблиці: JOIN ... ON c.id = o.customer_id." },
    ],
  },
  {
    ...base, id: "sql-left-join", lesson: "sql/22", xp: 35,
    title: "LEFT JOIN: клієнти без замовлень і суми з нулями",
    context: "LEFT JOIN зберігає всі рядки лівої таблиці, навіть коли пари немає: клієнти без замовлень не зникають зі звіту. Із IS NULL він знаходить, кого саме бракує.",
    brief: [
      "Запит 1: імена клієнтів, які ще <b>нічого не замовляли</b> (<code>LEFT JOIN</code> і <code>WHERE o.id IS NULL</code>).",
      "Запит 2: для всіх клієнтів (у порядку <code>id</code>) загальна сума замовлень, а для тих, хто нічого не замовляв, <code>0</code> (<code>LEFT JOIN</code>, <code>COALESCE</code>, <code>GROUP BY</code>).",
    ],
    starter: `${SHOP}

-- TODO 1: клієнти без замовлень (LEFT JOIN ... WHERE o.id IS NULL)
-- TODO 2: ім'я і сума замовлень кожного клієнта, 0 якщо немає
`,
    checks: [
      { on: "stdout", name: "Запит 1: Марія без замовлень", has: "Марія\nОля|150", hint: "FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL; результат — одне ім'я." },
      { on: "stdout", name: "Запит 2: суми по клієнтах", has: "Оля|150\nІван|70\nМарія|0", hint: "COALESCE(SUM(o.total), 0), GROUP BY c.id, ORDER BY c.id." },
      { on: "source", name: "Використано LEFT JOIN, IS NULL і COALESCE", matches: "LEFT\\s+JOIN[\\s\\S]*IS\\s+NULL[\\s\\S]*COALESCE", hint: "У коді мають бути LEFT JOIN, перевірка IS NULL і COALESCE." },
    ],
  },
  {
    ...base, id: "sql-multi-join", lesson: "sql/23", xp: 40,
    title: "Чеки замовлень: JOIN чотирьох таблиць",
    context: "Чек збирається з кількох таблиць: клієнт, замовлення, позиції та товар. Ланцюжок JOIN з агрегатом перетворює окремі позиції на суму кожного замовлення.",
    brief: [
      "Запит 1: для кожної позиції виведіть ім'я клієнта, назву товару й кількість, у порядку замовлення та товару (<code>ORDER BY o.id, p.id</code>).",
      "Запит 2: для кожного замовлення виведіть його номер, ім'я клієнта й суму (<code>SUM(p.price * i.qty)</code>, <code>GROUP BY o.id</code>).",
    ],
    starter: `${SHOP_FULL}

-- TODO 1: клієнт, товар, кількість (JOIN customers, orders, order_items, products)
-- TODO 2: номер замовлення, клієнт, SUM(p.price * i.qty) для кожного замовлення
`,
    checks: [
      { on: "stdout", name: "Запит 1: позиції замовлень", has: "Оля|Хліб|2\nОля|Молоко|1\nОля|Сир|1\nІван|Хліб|3", hint: "Чотири таблиці через три JOIN: customers → orders → order_items → products." },
      { on: "stdout", name: "Запит 2: суми чеків 92, 180, 75", has: "1|Оля|92\n2|Оля|180\n3|Іван|75", hint: "Сума замовлення 1: 25 * 2 + 42 * 1 = 92. Групуйте за o.id." },
      { on: "source", name: "Принаймні три JOIN", matches: "JOIN[\\s\\S]*JOIN[\\s\\S]*JOIN", hint: "Ланцюжок потребує трьох з'єднань для чотирьох таблиць." },
      { on: "source", name: "Сума через SUM і GROUP BY", matches: "SUM\\([\\s\\S]*GROUP\\s+BY", hint: "Для чека потрібні SUM(p.price * i.qty) та GROUP BY o.id." },
    ],
  },
  {
    ...base, id: "sql-union", lesson: "sql/24", xp: 35,
    title: "Клієнти й передплатники: UNION, INTERSECT, EXCEPT",
    context: "Два списки адрес із різних джерел треба зливати, знаходити спільні й шукати розбіжності. UNION, INTERSECT і EXCEPT роблять це без ручного зіставлення.",
    brief: [
      "Запит 1: усі різні адреси з обох таблиць за алфавітом (<code>UNION</code>). Запит 2: адреси, що є в обох (<code>INTERSECT</code>).",
      "Запит 3: адреси клієнтів, яких немає серед передплатників (<code>EXCEPT</code>), за алфавітом.",
    ],
    starter: `${MAILS}

-- TODO 1: UNION, ORDER BY email
-- TODO 2: INTERSECT
-- TODO 3: EXCEPT (клієнти без підписки), ORDER BY email
`,
    checks: [
      { on: "stdout", name: "UNION: чотири різні адреси", has: "ivan@x.com\nmaria@x.com\nolya@x.com\npetro@x.com", hint: "SELECT email FROM customers UNION SELECT email FROM subscribers ORDER BY email;" },
      { on: "stdout", name: "INTERSECT і EXCEPT: ivan, потім maria та olya", has: "petro@x.com\nivan@x.com\nmaria@x.com\nolya@x.com", hint: "Другий запит дає ivan@x.com, третій дає maria@x.com та olya@x.com (клієнти без підписки)." },
      { on: "source", name: "Використано UNION, INTERSECT і EXCEPT", matches: "UNION[\\s\\S]*INTERSECT[\\s\\S]*EXCEPT", hint: "Потрібні всі три операції в порядку завдання." },
    ],
  },
];
