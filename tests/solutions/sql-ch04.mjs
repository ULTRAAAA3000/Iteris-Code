// Еталонні рішення завдань SQL, глава 04 (id завдання -> повний скрипт). У сайт не потрапляють
import { ORDERS_AGG, PAYMENTS } from "../../content/tasks/sql/data.ts";

export const SOLUTIONS_04 = {
  "sql-aggregates": `${ORDERS_AGG}
${PAYMENTS}

SELECT COUNT(*), SUM(amount), AVG(amount), MIN(amount), MAX(amount) FROM orders;
SELECT COUNT(*), COUNT(amount) FROM payments;
`,
  "sql-group-by": `${ORDERS_AGG}

SELECT customer, COUNT(*), SUM(amount) FROM orders GROUP BY customer ORDER BY SUM(amount) DESC;
`,
  "sql-having": `${ORDERS_AGG}

SELECT customer, COUNT(*), SUM(amount) FROM orders GROUP BY customer HAVING SUM(amount) > 100 ORDER BY SUM(amount) DESC;
`,
};
