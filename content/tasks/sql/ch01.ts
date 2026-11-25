// Практичні завдання курсу SQL, глава 01 «Початок» (уроки 1–3). Запускаються на сервері (runtime: "remote"):
// скрипт виконується на порожній базі в пам'яті, вивід — рядки результатів (стовпці через |). Еталони: tests/solutions/sql-ch01.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { PRODUCTS } from "./data.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "sql-hello", lesson: "sql/1", xp: 15,
    title: "Перші запити: рядок і обчислення",
    context: "SELECT не обов'язково читає таблицю: він може просто обчислити вираз. Так швидко перевіряють, що база працює, і пробують функції без підготовки даних.",
    brief: ["Напишіть два запити <code>SELECT</code>: перший виводить рядок <code>Привіт, SQL!</code>, другий — результат виразу <code>2 + 3</code> (число, не текст). Кожен запит закінчується крапкою з комою."],
    starter: raw`-- Виведіть рядок Привіт, SQL! і значення 2 + 3 (два окремі запити)
SELECT '';
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, SQL!»", has: "Привіт, SQL!", hint: "Текст беруть в одинарні лапки: SELECT 'Привіт, SQL!';" },
      { on: "stdout", name: "Другий результат дорівнює 5", has: "Привіт, SQL!\n5", hint: "Другий запит окремий: SELECT 2 + 3; Число пишіть без лапок, інакше це текст." },
      { on: "source", name: "Число обчислюється виразом 2 + 3", matches: "SELECT\\s+2\\s*\\+\\s*3", hint: "Не вписуйте 5 руками: нехай відповідь обчислить база." },
    ],
  },
  {
    ...base, id: "sql-select-columns", lesson: "sql/2", xp: 15,
    title: "Вибірка стовпців, псевдоніми та DISTINCT",
    context: "SELECT * зручний для огляду, але в робочому коді вибирають лише потрібні стовпці. Псевдонім (AS) називає обчислений стовпець, а DISTINCT прибирає повтори.",
    brief: [
      "Першим запитом виведіть назву товару та його ціну, помножену на 2 під псевдонімом <code>double_price</code> (<code>name, price * 2 AS double_price</code>).",
      "Другим запитом виведіть унікальні категорії (<code>SELECT DISTINCT category</code>).",
    ],
    starter: `${PRODUCTS}

-- TODO 1: name і price * 2 AS double_price
-- TODO 2: унікальні категорії
`,
    checks: [
      { on: "stdout", name: "Подвоєні ціни: усі п'ять товарів", has: "Хліб|50\nМолоко|84\nСир|360\nБулочка|36\nЙогурт|70", hint: "SELECT name, price * 2 AS double_price FROM products; Рядки мають іти в порядку таблиці." },
      { on: "stdout", name: "Унікальні категорії без повторів", has: "випічка\nмолочне", hint: "Другий запит: SELECT DISTINCT category FROM products; Кожна категорія має з'явитися один раз." },
      { on: "source", name: "Використано псевдонім AS", matches: "AS\\s+double_price", hint: "Дайте обчисленому стовпцю ім'я: price * 2 AS double_price." },
      { on: "source", name: "Використано DISTINCT", matches: "DISTINCT", hint: "Після SELECT другого запиту напишіть DISTINCT." },
    ],
  },
  {
    ...base, id: "sql-money-types", lesson: "sql/3", xp: 20,
    title: "Ціни з копійок у гривні",
    context: "Гроші зберігають цілими копійками, а при показі переводять у гривні. Якщо поділити ціле на ціле, SQLite відкине дріб, і сума 25,50 перетвориться на 25: типова помилка у звітах.",
    brief: [
      "Запит 1: для кожного товару виведіть назву й ціну в гривнях (<code>kopecks / 100.0</code> під псевдонімом <code>uah</code>), за назвою за зростанням. У заготовці ділення цілочисельне, тому дробу немає.",
      "Запит 2: виведіть класи значень <code>typeof(2550 / 100)</code> і <code>typeof(2550 / 100.0)</code>.",
    ],
    starter: raw`CREATE TABLE prices (item TEXT, kopecks INTEGER);
INSERT INTO prices VALUES ('Хліб', 2550), ('Молоко', 4290);

SELECT item, kopecks / 100 AS uah FROM prices ORDER BY item;
-- TODO 2: typeof(2550 / 100), typeof(2550 / 100.0)
`,
    checks: [
      { on: "stdout", name: "Ціни в гривнях з дробом", has: "Молоко|42.9\nХліб|25.5", hint: "Ділите на 100.0, а не на 100: дробове число змусить SQLite рахувати з дробом." },
      { on: "stdout", name: "typeof: integer для 100, real для 100.0", has: "integer|real", hint: "SELECT typeof(2550 / 100), typeof(2550 / 100.0); Результат: integer|real." },
      { on: "source", name: "Ділення на 100.0", matches: "kopecks\\s*/\\s*100\\.0", hint: "У першому запиті напишіть kopecks / 100.0 AS uah." },
    ],
  },
];
