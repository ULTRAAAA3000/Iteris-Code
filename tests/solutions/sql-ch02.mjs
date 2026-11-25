// Еталонні рішення завдань SQL, глава 02 (id завдання -> повний скрипт). У сайт не потрапляють
import { MENU, PRODUCTS, USERS } from "../../content/tasks/sql/data.ts";

export const SOLUTIONS_02 = {
  "sql-filter-sort": `${PRODUCTS}

SELECT name, price FROM products WHERE price > 30 ORDER BY id;
SELECT name FROM products WHERE category = 'випічка' ORDER BY id;
`,
  "sql-and-or-brackets": `${MENU}

SELECT name FROM menu
WHERE price < 100 AND (kind = 'суп' OR kind = 'напій')
ORDER BY id;
`,
  "sql-conditions": `${USERS}

SELECT name FROM users WHERE city IN ('Київ', 'Дніпро') AND age BETWEEN 20 AND 40 ORDER BY name;
SELECT name FROM users WHERE name LIKE 'О%' ORDER BY name;
SELECT name FROM users WHERE name LIKE '%ій';
`,
  "sql-null-hunt": `${USERS}

SELECT name FROM users WHERE email IS NULL ORDER BY name;
SELECT name FROM users WHERE city <> 'Київ' OR city IS NULL ORDER BY name;
`,
  "sql-page-two": `${PRODUCTS}

SELECT name, price FROM products ORDER BY price DESC LIMIT 2 OFFSET 2;
SELECT name, price FROM products ORDER BY price LIMIT 1;
`,
};
