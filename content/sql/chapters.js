/* Курс SQL (розширений до 35 уроків, діалект SQLite): глави й уроки в порядку проходження. adv: true — урок лише для просунутого рівня.
   keep — id завдання зі старої версії курсу (15 уроків), яке переходить до цього уроку, щоб не губився прогрес. */
const ch = (id, name, lessons) => ({ id, name, lessons });
const L = (t, adv = false, keep) => ({ t, adv, ...(keep ? { keep } : {}) });

const CHAPTERS = [
  ch("01", "Початок", [
    L("Бази даних, таблиці й SQLite", false, "sql-hello"),
    L("SELECT: стовпці, псевдоніми й DISTINCT", false, "sql-select-columns"),
    L("Типи значень у SQLite і вирази"),
  ]),
  ch("02", "Фільтрація й сортування", [
    L("WHERE і порівняння", false, "sql-filter-sort"),
    L("AND, OR, NOT і порядок обчислення"),
    L("IN, BETWEEN і LIKE", false, "sql-conditions"),
    L("NULL і трійкова логіка"),
    L("ORDER BY, LIMIT і OFFSET"),
  ]),
  ch("03", "Функції та вирази", [
    L("CASE і COALESCE", false, "sql-case-coalesce"),
    L("Рядкові й числові функції"),
    L("Дата й час у SQLite", true),
  ]),
  ch("04", "Агрегація", [
    L("COUNT, SUM, AVG, MIN і MAX"),
    L("GROUP BY", false, "sql-group-by"),
    L("HAVING і порядок виконання запиту"),
  ]),
  ch("05", "Схема й зміна даних", [
    L("CREATE TABLE і типи даних", false, "sql-create-table"),
    L("Обмеження: PRIMARY KEY, NOT NULL, UNIQUE, CHECK і DEFAULT"),
    L("INSERT: додавання рядків", false, "sql-insert-update-delete"),
    L("UPDATE і DELETE"),
    L("UPSERT, ALTER TABLE і DROP", true),
  ]),
  ch("06", "Зв'язки й JOIN", [
    L("Зв'язки між таблицями й FOREIGN KEY", false, "sql-foreign-key"),
    L("INNER JOIN", false, "sql-joins"),
    L("LEFT JOIN і пошук відсутніх даних"),
    L("Кілька JOIN і з'єднання таблиці із собою"),
    L("UNION, INTERSECT і EXCEPT", true),
  ]),
  ch("07", "Підзапити, CTE й представлення", [
    L("Підзапити"),
    L("CTE: WITH", false, "sql-subquery-cte"),
    L("Представлення: VIEW"),
    L("Рекурсивні CTE", true),
  ]),
  ch("08", "Віконні функції", [
    L("OVER, PARTITION BY, ROW_NUMBER і RANK", false, "sql-window"),
    L("Накопичувальні суми, LAG і LEAD"),
  ]),
  ch("09", "Проєктування й продуктивність", [
    L("Нормалізація й проєктування схеми"),
    L("Індекси", false, "sql-index"),
    L("EXPLAIN QUERY PLAN", true),
    L("Транзакції", false, "sql-transactions"),
  ]),
  ch("10", "Практика", [
    L("SQL у програмі: Python і sqlite3", false, "sql-in-python"),
  ]),
];

let n = 0;
export const SQL_CHAPTERS = CHAPTERS.map((c) => {
  const from = n + 1;
  n += c.lessons.length;
  return { id: c.id, name: c.name, from, to: n, lessons: c.lessons.map((l, i) => ({ n: from + i, ...l })) };
});
export const SQL_OUTLINE = SQL_CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, ch: c.name })));
