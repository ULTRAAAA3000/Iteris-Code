// Еталонні рішення завдань SQL, глава 01 (id завдання -> повний скрипт). У сайт не потрапляють
import { PRODUCTS } from "../../content/tasks/sql/data.ts";
const raw = String.raw;

export const SOLUTIONS_01 = {
  "sql-hello": raw`SELECT 'Привіт, SQL!';
SELECT 2 + 3;
`,
  "sql-select-columns": `${PRODUCTS}

SELECT name, price * 2 AS double_price FROM products;
SELECT DISTINCT category FROM products;
`,
  "sql-money-types": raw`CREATE TABLE prices (item TEXT, kopecks INTEGER);
INSERT INTO prices VALUES ('Хліб', 2550), ('Молоко', 4290);

SELECT item, kopecks / 100.0 AS uah FROM prices ORDER BY item;
SELECT typeof(2550 / 100), typeof(2550 / 100.0);
`,
};
