// Еталонні рішення завдань SQL, глава 07 (id завдання -> повний скрипт). У сайт не потрапляють
import { EMPLOYEES } from "../../content/tasks/sql/data.ts";
const raw = String.raw;

const TREE = raw`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Директор', NULL), (2, 'Оля', 1), (3, 'Іван', 1), (4, 'Марія', 2), (5, 'Олег', 4);`;

export const SOLUTIONS_07 = {
  "sql-subquery": `${EMPLOYEES}

SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY name;
SELECT name FROM employees WHERE dept IN (SELECT dept FROM employees WHERE salary > 100) ORDER BY name;
`,
  "sql-subquery-cte": `${EMPLOYEES}

WITH dept_avg AS (SELECT dept, AVG(salary) AS avg_salary FROM employees GROUP BY dept)
SELECT dept, avg_salary FROM dept_avg ORDER BY dept;

WITH dept_avg AS (SELECT dept, AVG(salary) AS avg_salary FROM employees GROUP BY dept)
SELECT e.name, e.dept, d.avg_salary FROM employees e JOIN dept_avg d ON d.dept = e.dept WHERE e.salary > d.avg_salary ORDER BY e.name;
`,
  "sql-view": `${EMPLOYEES}

CREATE VIEW dept_stats AS
  SELECT dept, COUNT(*) AS headcount, SUM(salary) AS total_salary FROM employees GROUP BY dept;

INSERT INTO employees VALUES (6, 'Нова', 'HR', 70);
SELECT dept, headcount, total_salary FROM dept_stats ORDER BY dept;
`,
  "sql-recursive": `${TREE}

WITH RECURSIVE d(day) AS (SELECT '2026-11-01' UNION ALL SELECT date(day, '+1 day') FROM d WHERE day < '2026-11-05')
SELECT day FROM d;

WITH RECURSIVE chain(id, name, depth) AS (
  SELECT id, name, 0 FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, c.depth + 1 FROM employees e JOIN chain c ON e.manager_id = c.id
)
SELECT name, depth FROM chain ORDER BY depth, id;
`,
};
