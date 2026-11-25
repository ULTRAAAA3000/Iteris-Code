// Практичні завдання курсу SQL, глава 03 «Функції та вирази» (уроки 9–11). Еталони: tests/solutions/sql-ch03.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { CONTACTS, ORDERS, USERS } from "./data.ts";

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "sql-case-coalesce", lesson: "sql/9", xp: 25,
    title: "CASE і COALESCE",
    context: "CASE це умова всередині запиту (мітка за віком, статус за сумою), а COALESCE підставляє значення замість NULL. Разом вони готують дані до показу без зайвого коду в програмі.",
    brief: ["Виведіть для кожного користувача (за зростанням <code>id</code>): ім'я, місто (де його немає, слово <code>невідомо</code> через <code>COALESCE</code>) і групу: <code>старший</code>, якщо вік від 30, інакше <code>молодший</code> (<code>CASE WHEN</code>)."],
    starter: `${USERS}

-- TODO: name, COALESCE(city, 'невідомо'), CASE WHEN age >= 30 ...
SELECT name, city, age FROM users ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Оля|Київ|молодший", has: "Оля|Київ|молодший", hint: "Третій стовпець: CASE WHEN age >= 30 THEN 'старший' ELSE 'молодший' END." },
      { on: "stdout", name: "Для порожнього міста: Андрій|невідомо|молодший", has: "Андрій|невідомо|молодший", hint: "Замість city напишіть COALESCE(city, 'невідомо')." },
      { on: "stdout", name: "Усі п'ять рядків у порядку id", has: "Оля|Київ|молодший\nІван|Дніпро|старший\nОлег|Львів|молодший\nМарія|Київ|старший\nАндрій|невідомо|молодший", hint: "Збережіть ORDER BY id і виведіть рівно три стовпці." },
      { on: "source", name: "Використано COALESCE і CASE", matches: "COALESCE[\\s\\S]*CASE|CASE[\\s\\S]*COALESCE", hint: "Потрібні обидва вирази: COALESCE для міста, CASE для групи." },
    ],
  },
  {
    ...base, id: "sql-string-funcs", lesson: "sql/10", xp: 25,
    title: "Очищення контактів: trim, replace, substr",
    context: "Дані з форм і файлів приходять брудними: зайві пробіли, дефіси в телефонах. Рядкові функції наводять лад ще в запиті, не чіпаючи таблицю.",
    brief: [
      "Для кожного контакту (за <code>id</code>) виведіть три стовпці: ім'я без зайвих пробілів (<code>trim</code>), телефон без дефісів (<code>replace(phone, '-', '')</code>) і код оператора, тобто перші три символи телефону (<code>substr(phone, 1, 3)</code>).",
    ],
    starter: `${CONTACTS}

-- TODO: trim(name), replace(phone, '-', ''), substr(phone, 1, 3)
SELECT name, phone FROM contacts ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Оля|0671112233|067", has: "Оля|0671112233|067", hint: "Ім'я Оля має пробіли з обох боків: trim(name). Дефіси прибирає replace." },
      { on: "stdout", name: "Іван|0504445566|050", has: "Оля|0671112233|067\nІван|0504445566|050", hint: "Рядки мають іти в порядку id, по три стовпці в кожному." },
      { on: "source", name: "Використано trim, replace і substr", matches: "trim\\([\\s\\S]*replace\\([\\s\\S]*substr\\(", hint: "У запиті мають бути всі три функції." },
    ],
  },
  {
    ...base, id: "sql-dates", lesson: "sql/11", xp: 30,
    title: "Листопадові замовлення й кінець місяця",
    context: "Звіти за місяць, терміни й відлік днів до події складаються з функцій дати. Дати в SQLite це текст РРРР-ММ-ДД, тож усе робиться через strftime, date і julianday.",
    brief: [
      "Запит 1: замовлення за листопад 2026 (<code>strftime('%Y-%m', placed) = '2026-11'</code>): <code>id</code>, <code>customer</code>, <code>placed</code>, за датою.",
      "Запит 2: останній день місяця для <code>2026-11-23</code> (<code>start of month</code>, <code>+1 month</code>, <code>-1 day</code>). Запит 3: скільки повних днів від <code>2026-11-23</code> до <code>2026-12-25</code> (<code>julianday</code> і <code>CAST … AS INTEGER</code>).",
    ],
    starter: `${ORDERS}

SELECT id, customer, placed FROM orders ORDER BY placed;
-- TODO 2: кінець місяця для 2026-11-23
-- TODO 3: днів від 2026-11-23 до 2026-12-25
`,
    checks: [
      { on: "stdout", name: "Листопад: замовлення 2, 3 і 4", has: "2|Іван|2026-11-02\n3|Оля|2026-11-15\n4|Марія|2026-11-23\n", hint: "Додайте WHERE strftime('%Y-%m', placed) = '2026-11' перед ORDER BY: жовтневе й груднєве мають зникнути." },
      { on: "stdout", name: "Кінець місяця: 2026-11-30", has: "2026-11-30", hint: "date('2026-11-23', 'start of month', '+1 month', '-1 day')." },
      { on: "stdout", name: "До Різдва 32 дні", has: "\n32", hint: "CAST(julianday('2026-12-25') - julianday('2026-11-23') AS INTEGER)." },
      { on: "source", name: "Використано strftime і julianday", matches: "strftime\\([\\s\\S]*julianday\\(", hint: "Потрібні strftime для місяця й julianday для різниці." },
    ],
  },
];
