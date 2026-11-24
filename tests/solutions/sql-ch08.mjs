// Еталонні рішення завдань SQL, глава 08 (id завдання -> повний скрипт). У сайт не потрапляють
import { EMPLOYEES } from "../../content/tasks/sql/data.ts";
const raw = String.raw;

const SALES = raw`CREATE TABLE sales (id INTEGER PRIMARY KEY, rep TEXT, region TEXT, day TEXT, amount INTEGER);
INSERT INTO sales VALUES (1, 'Оля', 'Захід', '2026-11-01', 100), (2, 'Іван', 'Схід', '2026-11-02', 80), (3, 'Оля', 'Захід', '2026-11-03', 120), (4, 'Марія', 'Схід', '2026-11-04', 80), (5, 'Іван', 'Схід', '2026-11-05', 50), (6, 'Оля', 'Захід', '2026-11-06', 60);`;

export const SOLUTIONS_08 = {
  "sql-window": `${EMPLOYEES}

SELECT name, dept, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn FROM employees ORDER BY dept, rn;
SELECT dept, name FROM (
  SELECT name, dept, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn FROM employees
) WHERE rn = 1 ORDER BY dept;
`,
  "sql-window-lag": `${SALES}

SELECT day, amount, SUM(amount) OVER (ORDER BY day) AS running, amount - LAG(amount, 1, 0) OVER (ORDER BY day) AS diff FROM sales ORDER BY day;
`,
};
