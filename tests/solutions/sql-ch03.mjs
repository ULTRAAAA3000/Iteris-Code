// Еталонні рішення завдань SQL, глава 03 (id завдання -> повний скрипт). У сайт не потрапляють
import { CONTACTS, ORDERS, USERS } from "../../content/tasks/sql/data.ts";

export const SOLUTIONS_03 = {
  "sql-case-coalesce": `${USERS}

SELECT name, COALESCE(city, 'невідомо') AS city, CASE WHEN age >= 30 THEN 'старший' ELSE 'молодший' END AS grp FROM users ORDER BY id;
`,
  "sql-string-funcs": `${CONTACTS}

SELECT trim(name), replace(phone, '-', ''), substr(phone, 1, 3) FROM contacts ORDER BY id;
`,
  "sql-dates": `${ORDERS}

SELECT id, customer, placed FROM orders WHERE strftime('%Y-%m', placed) = '2026-11' ORDER BY placed;
SELECT date('2026-11-23', 'start of month', '+1 month', '-1 day');
SELECT CAST(julianday('2026-12-25') - julianday('2026-11-23') AS INTEGER);
`,
};
