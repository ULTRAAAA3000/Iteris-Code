// Практичні завдання курсу SQL, глава 08 «Віконні функції» (уроки 29–30). Еталони: tests/solutions/sql-ch08.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { EMPLOYEES } from "./data.ts";

const raw = String.raw;

const SALES = raw`CREATE TABLE sales (id INTEGER PRIMARY KEY, rep TEXT, region TEXT, day TEXT, amount INTEGER);
INSERT INTO sales VALUES (1, 'Оля', 'Захід', '2026-11-01', 100), (2, 'Іван', 'Схід', '2026-11-02', 80), (3, 'Оля', 'Захід', '2026-11-03', 120), (4, 'Марія', 'Схід', '2026-11-04', 80), (5, 'Іван', 'Схід', '2026-11-05', 50), (6, 'Оля', 'Захід', '2026-11-06', 60);`;

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "sql-window", lesson: "sql/29", xp: 35,
    title: "Віконні функції: місце у відділі й топ-1",
    context: "Віконні функції рахують по «вікну» рядків, але не схлопують їх, як GROUP BY: кожен рядок лишається, а поруч з'являється його місце в рейтингу. Так розв'язують задачу «топ-N у кожній групі».",
    brief: [
      "Запит 1: ім'я, відділ, зарплата й місце за зарплатою всередині відділу (<code>ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)</code>), впорядковано за відділом і місцем.",
      "Запит 2: найбільше платний співробітник кожного відділу — той самий <code>ROW_NUMBER</code> у підзапиті й <code>WHERE rn = 1</code> зовні. Вивести відділ і ім'я, за відділом.",
    ],
    starter: `${EMPLOYEES}

-- TODO 1: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)
-- TODO 2: підзапит з rn, зовні WHERE rn = 1
SELECT name, dept, salary FROM employees ORDER BY dept, salary DESC;
`,
    checks: [
      { on: "stdout", name: "Місця у відділі HR", has: "Олег|HR|90|1\nМарія|HR|60|2", hint: "ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn; ORDER BY dept, rn." },
      { on: "stdout", name: "Місця у відділі IT", has: "Андрій|IT|120|1\nОля|IT|100|2\nІван|IT|80|3", hint: "Рядки відділу IT: від найбільшої зарплати до найменшої, з номерами 1, 2, 3." },
      { on: "stdout", name: "Топ-1 кожного відділу", has: "HR|Олег\nIT|Андрій", hint: "Віконну функцію не можна у WHERE: обгорніть у підзапит і відфільтруйте WHERE rn = 1." },
      { on: "source", name: "Використано ROW_NUMBER() OVER з PARTITION BY", matches: "ROW_NUMBER\\(\\)\\s+OVER\\s*\\(\\s*PARTITION\\s+BY", hint: "Вікно має бути розбите за відділом: OVER (PARTITION BY dept ORDER BY ...)." },
    ],
  },
  {
    ...base, id: "sql-window-lag", lesson: "sql/30", xp: 35,
    title: "Накопичувальна виручка і зміна за день",
    context: "Для виручки зазвичай показують два числа: скільки накопичено з початку періоду й наскільки день відрізняється від попереднього. Обидва рахуються віконними функціями без самозв'язків.",
    brief: [
      "Виведіть для кожного дня (за датою): дату, суму продажу, накопичену суму (<code>SUM(amount) OVER (ORDER BY day)</code>) і зміну проти попереднього дня (<code>amount - LAG(amount, 1, 0) OVER (ORDER BY day)</code>) під псевдонімами <code>running</code> і <code>diff</code>.",
    ],
    starter: `${SALES}

-- TODO: day, amount, SUM(amount) OVER (ORDER BY day) AS running, amount - LAG(amount, 1, 0) OVER (ORDER BY day) AS diff
SELECT day, amount FROM sales ORDER BY day;
`,
    checks: [
      { on: "stdout", name: "Накопичена сума: 100, 180, 300, 380, 430, 490", has: "2026-11-01|100|100|100\n2026-11-02|80|180|-20\n2026-11-03|120|300|40", hint: "running: SUM(amount) OVER (ORDER BY day); diff для першого дня дорівнює самому amount, бо LAG за замовчуванням 0." },
      { on: "stdout", name: "Кінець місяця: 490 і зміна +10", has: "2026-11-06|60|490|10", hint: "Останній день: накопичено 490, а 60 - 50 = 10." },
      { on: "source", name: "Використано SUM OVER та LAG OVER", matches: "SUM\\(amount\\)\\s+OVER[\\s\\S]*LAG\\(amount", hint: "Потрібні обидві віконні функції з ORDER BY day." },
    ],
  },
];
