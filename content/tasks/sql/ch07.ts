// Практичні завдання курсу SQL, глава 07 «Підзапити, CTE й представлення» (уроки 25–28). Еталони: tests/solutions/sql-ch07.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { EMPLOYEES } from "./data.ts";

const raw = String.raw;

const TREE = raw`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Директор', NULL), (2, 'Оля', 1), (3, 'Іван', 1), (4, 'Марія', 2), (5, 'Олег', 4);`;

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "sql-subquery", lesson: "sql/25", xp: 30,
    title: "Підзапит: вище за середню і відділи з рекордом",
    context: "Підзапит дозволяє порівнювати з обчисленим значенням (більше за середнє) і відбирати рядки за результатом іншої вибірки. Так розв'язують задачі, де відповідь залежить від проміжного підрахунку.",
    brief: [
      "Запит 1: імена співробітників із зарплатою вище за середню по компанії (скалярний підзапит <code>(SELECT AVG(salary) FROM employees)</code>), за алфавітом.",
      "Запит 2: імена тих, хто працює у відділах, де хтось заробляє понад 100 (<code>dept IN (SELECT dept … WHERE salary &gt; 100)</code>), за алфавітом.",
    ],
    starter: `${EMPLOYEES}

-- TODO 1: salary > (SELECT AVG(salary) FROM employees), ORDER BY name
-- TODO 2: dept IN (SELECT dept FROM employees WHERE salary > 100), ORDER BY name
SELECT name FROM employees ORDER BY name;
`,
    checks: [
      { on: "stdout", name: "Вище за середню: Андрій і Оля", has: "Андрій\nОля\n", hint: "WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY name; середня зарплата дорівнює 90." },
      { on: "stdout", name: "Відділ IT: Іван, Андрій, Оля", has: "Іван\nАндрій\nОля", hint: "Відділ, де є зарплата понад 100, лише IT: підзапит поверне його, а IN відбере всіх із цього відділу." },
      { on: "source", name: "Підзапит із AVG", matches: "\\(\\s*SELECT\\s+AVG", hint: "Скалярний підзапит у дужках: (SELECT AVG(salary) FROM employees)." },
      { on: "source", name: "IN з підзапитом", matches: "\\bIN\\s*\\(\\s*SELECT", hint: "Другий запит: dept IN (SELECT dept FROM employees WHERE salary > 100)." },
    ],
  },
  {
    ...base, id: "sql-subquery-cte", lesson: "sql/26", xp: 35,
    title: "CTE: вище за середню у своєму відділі",
    context: "CTE (WITH) дає проміжному результату ім'я, і складний запит читається по кроках: спершу рахуємо середнє по відділах, потім порівнюємо кожного з ним. Так пишуть звіти, які потім легко перевіряти.",
    brief: [
      "Запит 1: через <code>WITH dept_avg AS (...)</code> виведіть відділ і середню зарплату відділу (<code>AVG(salary)</code> під псевдонімом <code>avg_salary</code>), за назвою відділу.",
      "Запит 2: імена співробітників із зарплатою <b>вище за середню у власному відділі</b>: з'єднайте <code>employees</code> з <code>dept_avg</code> за відділом. Вивести ім'я, відділ і середнє, за алфавітом.",
    ],
    starter: `${EMPLOYEES}

-- TODO 1: WITH dept_avg AS (...) SELECT dept, avg_salary FROM dept_avg ORDER BY dept
-- TODO 2: WITH dept_avg AS (...) SELECT e.name, e.dept, d.avg_salary ... JOIN ... WHERE e.salary > d.avg_salary
SELECT name FROM employees ORDER BY name;
`,
    checks: [
      { on: "stdout", name: "Середнє по відділах: HR|75.0 і IT|100.0", has: "HR|75.0\nIT|100.0", hint: "WITH dept_avg AS (SELECT dept, AVG(salary) AS avg_salary FROM employees GROUP BY dept) SELECT dept, avg_salary FROM dept_avg ORDER BY dept;" },
      { on: "stdout", name: "Вище за середню у своєму відділі: Андрій і Олег", has: "Андрій|IT|100.0\nОлег|HR|75.0", hint: "З'єднайте employees e з dept_avg d через ON d.dept = e.dept і додайте WHERE e.salary > d.avg_salary." },
      { on: "source", name: "Використано CTE (WITH dept_avg)", matches: "WITH\\s+dept_avg\\s+AS", hint: "Назвіть CTE dept_avg: WITH dept_avg AS (...)." },
      { on: "source", name: "CTE з'єднано з employees через JOIN", matches: "JOIN\\s+dept_avg", hint: "У другому запиті: FROM employees e JOIN dept_avg d ON d.dept = e.dept." },
    ],
  },
  {
    ...base, id: "sql-view", lesson: "sql/27", xp: 35,
    title: "Представлення dept_stats",
    context: "Представлення зберігає складний запит під ім'ям: його можна читати, як таблицю, і воно завжди показує актуальні дані. Звітні вибірки, якими користуються в багатьох місцях, виносять у VIEW.",
    brief: [
      "Створіть представлення <code>dept_stats</code>: для кожного відділу його назва (<code>dept</code>), кількість співробітників (<code>headcount</code>) і сума зарплат (<code>total_salary</code>), згруповано за відділом.",
      "Після створення вже написано додавання нового співробітника відділу HR і вибірку з представлення: воно має відобразити зміну саме.",
    ],
    starter: `${EMPLOYEES}

-- TODO: CREATE VIEW dept_stats AS SELECT dept, ... headcount, ... total_salary ... GROUP BY dept

INSERT INTO employees VALUES (6, 'Нова', 'HR', 70);
SELECT dept, headcount, total_salary FROM dept_stats ORDER BY dept;
`,
    checks: [
      { on: "stdout", name: "У HR стало троє, сума 220; в IT троє, сума 300", has: "HR|3|220\nIT|3|300", hint: "COUNT(*) AS headcount, SUM(salary) AS total_salary, GROUP BY dept: представлення порахує наново після вставки." },
      { on: "source", name: "Створено представлення dept_stats", matches: "CREATE\\s+VIEW\\s+dept_stats\\s+AS", hint: "CREATE VIEW dept_stats AS SELECT ..." },
      { on: "source", name: "Є псевдоніми headcount і total_salary", matches: "AS\\s+headcount[\\s\\S]*AS\\s+total_salary", hint: "COUNT(*) AS headcount, SUM(salary) AS total_salary." },
    ],
  },
  {
    ...base, id: "sql-recursive", lesson: "sql/28", xp: 40,
    title: "Рекурсивний CTE: календар і ієрархія",
    context: "Рекурсивний CTE генерує послідовності, яких немає в таблицях (дні для звіту), і обходить ієрархії будь-якої глибини (хто кому підпорядкований). Головне: якір, крок і умова зупинки.",
    brief: [
      "Запит 1: згенеруйте дати від <code>2026-11-01</code> до <code>2026-11-05</code> (<code>WITH RECURSIVE d(day) AS (…)</code>, крок <code>date(day, '+1 day')</code>, зупинка <code>WHERE day &lt; '2026-11-05'</code>).",
      "Запит 2: пройдіть ієрархію від директора (<code>manager_id IS NULL</code>) і виведіть ім'я та глибину рівня (<code>depth</code>), у порядку <code>depth, id</code>.",
    ],
    starter: `${TREE}

-- TODO 1: WITH RECURSIVE d(day) AS (...) SELECT day FROM d
-- TODO 2: WITH RECURSIVE chain(id, name, depth) AS (...) SELECT name, depth FROM chain ORDER BY depth, id
SELECT name, manager_id FROM employees ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "П'ять днів з 1 по 5 листопада", has: "2026-11-01\n2026-11-02\n2026-11-03\n2026-11-04\n2026-11-05", hint: "Якір SELECT '2026-11-01', крок SELECT date(day, '+1 day') FROM d WHERE day < '2026-11-05'." },
      { on: "stdout", name: "Ієрархія: Директор|0, Оля|1, Іван|1, Марія|2, Олег|3", has: "Директор|0\nОля|1\nІван|1\nМарія|2\nОлег|3", hint: "Якір: manager_id IS NULL, depth 0. Крок: JOIN chain c ON e.manager_id = c.id, depth c.depth + 1." },
      { on: "source", name: "Два рекурсивні CTE", matches: "WITH\\s+RECURSIVE[\\s\\S]*WITH\\s+RECURSIVE", hint: "Кожен із двох запитів починається з WITH RECURSIVE." },
    ],
  },
];
