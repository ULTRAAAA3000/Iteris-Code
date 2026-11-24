// Практичні завдання курсу SQL, глава 04 «Агрегація» (уроки 12–14). Еталони: tests/solutions/sql-ch04.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { ORDERS_AGG, PAYMENTS } from "./data.ts";

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "sql-aggregates", lesson: "sql/12", xp: 25,
    title: "Підсумки замовлень і COUNT проти COUNT(стовпець)",
    context: "Кількість, сума, середнє, мінімум і максимум — основа будь-якого звіту. А різниця між COUNT(*) і COUNT(стовпець) часто спотворює цифри, коли в даних є порожні значення.",
    brief: [
      "Запит 1: за всією таблицею <code>orders</code> виведіть кількість замовлень, суму, середнє, найменше й найбільше значення <code>amount</code> (<code>COUNT(*)</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>).",
      "Запит 2: для таблиці <code>payments</code> виведіть <code>COUNT(*)</code> і <code>COUNT(amount)</code>, щоб побачити різницю через порожні суми.",
    ],
    starter: `${ORDERS_AGG}
${PAYMENTS}

SELECT * FROM orders;
-- TODO 2: COUNT(*) і COUNT(amount) для payments
`,
    checks: [
      { on: "stdout", name: "Підсумки: 6|360|60.0|20|120", has: "6|360|60.0|20|120", hint: "SELECT COUNT(*), SUM(amount), AVG(amount), MIN(amount), MAX(amount) FROM orders; рівно в такому порядку." },
      { on: "stdout", name: "payments: 4 рядки, 2 непорожні суми", has: "4|2", hint: "SELECT COUNT(*), COUNT(amount) FROM payments; COUNT(стовпець) пропускає NULL." },
      { on: "source", name: "Використано COUNT(*) і COUNT(amount)", matches: "COUNT\\(\\*\\)[\\s\\S]*COUNT\\(amount\\)", hint: "Другий запит має містити обидві форми COUNT." },
    ],
  },
  {
    ...base, id: "sql-group-by", lesson: "sql/13", xp: 30,
    title: "Групування замовлень за клієнтами",
    context: "GROUP BY збирає рядки в групи, а агрегатні функції (COUNT, SUM) підсумовують кожну групу. Так отримують виручку за клієнтом, категорією чи місяцем: основу будь-якого звіту.",
    brief: ["Для кожного клієнта виведіть ім'я, кількість замовлень і загальну суму, від найбільшої суми до найменшої: <code>GROUP BY customer</code>, <code>COUNT(*)</code>, <code>SUM(amount)</code>, <code>ORDER BY SUM(amount) DESC</code>."],
    starter: `${ORDERS_AGG}

-- TODO: customer, COUNT(*), SUM(amount) для кожного клієнта; від найбільшої суми
SELECT customer, amount FROM orders ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Іван: 2 замовлення на 180", has: "Іван|2|180", hint: "Іван зробив два замовлення (120 і 60): COUNT(*) дає 2, SUM(amount) дає 180." },
      { on: "stdout", name: "Порядок від найбільшої суми", has: "Іван|2|180\nОля|3|150\nМарія|1|30", hint: "Додайте ORDER BY SUM(amount) DESC після GROUP BY." },
      { on: "source", name: "Використано GROUP BY customer", matches: "GROUP\\s+BY\\s+customer", hint: "Після FROM напишіть GROUP BY customer." },
    ],
  },
  {
    ...base, id: "sql-having", lesson: "sql/14", xp: 30,
    title: "Клієнти із сумою понад 100: HAVING",
    context: "Умову на підсумок групи не можна написати у WHERE: сума ще не пораховано. Для цього є HAVING, і вміння розрізняти ці два розділи відрізняє впевнений запит від випадкового.",
    brief: ["Виведіть клієнтів, у яких загальна сума замовлень <b>більша за 100</b>: ім'я, кількість замовлень і суму, від найбільшої суми. Умову на суму напишіть у <code>HAVING SUM(amount) &gt; 100</code>."],
    starter: `${ORDERS_AGG}

SELECT customer, COUNT(*), SUM(amount) FROM orders GROUP BY customer ORDER BY SUM(amount) DESC;
-- TODO: залишити лише суми понад 100 через HAVING
`,
    checks: [
      { on: "stdout", name: "Іван і Оля", has: "Іван|2|180\nОля|3|150", hint: "Між GROUP BY і ORDER BY додайте HAVING SUM(amount) > 100." },
      { on: "stdout", name: "Марія (сума 30) відсіяна", has: "Марія|1|30", not: true, hint: "Марія замовила лише на 30. HAVING має прибрати її групу." },
      { on: "source", name: "Використано GROUP BY і HAVING", matches: "GROUP\\s+BY[\\s\\S]*HAVING\\s+SUM\\(amount\\)\\s*>\\s*100", hint: "Порядок розділів: GROUP BY, потім HAVING, потім ORDER BY." },
    ],
  },
];
