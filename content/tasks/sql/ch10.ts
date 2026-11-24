// Практичні завдання курсу SQL, глава 10 «Практика» (урок 35). Завдання мовою Python (модуль sqlite3). Еталон: tests/solutions/sql-ch10.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "sql-in-python", lesson: "sql/35", xp: 40, lang: "python", file: "main.py", editorLang: "python",
    title: "SQL у Python: безпечні запити з параметрами",
    context: "Програма говорить із базою через бібліотеку (у Python це sqlite3). Головне правило: значення в запит підставляють через плейсхолдери ?, а не склеюють у рядок: склеювання відкриває двері SQL-ін'єкціям.",
    brief: [
      "Допишіть <code>add_users(conn, rows)</code>: вставте всі рядки одним викликом <code>conn.executemany</code> із плейсхолдерами <code>?</code>.",
      "Допишіть <code>find_adults(conn, min_age)</code>: поверніть список імен користувачів, чий вік не менший за <code>min_age</code>, за алфавітом. Значення <code>min_age</code> передайте параметром, а не вставляйте в рядок запиту.",
    ],
    starter: raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")


def add_users(conn, rows):
    # TODO: executemany із плейсхолдерами ?
    pass


def find_adults(conn, min_age):
    # TODO: SELECT name ... WHERE age >= ? ORDER BY name; повернути список імен
    return []


add_users(conn, [("Оля", 25), ("Іван", 17), ("Марія", 40)])
print(find_adults(conn, 18))
print(find_adults(conn, 30))
`,
    checks: [
      { on: "stdout", name: "Дорослі від 18: Марія й Оля", has: "['Марія', 'Оля']", hint: "SELECT name FROM users WHERE age >= ? ORDER BY name, параметр (min_age,); поверніть список імен, а не кортежів." },
      { on: "stdout", name: "Від 30: лише Марія", has: "['Марія']", hint: "Параметр має підставлятися з аргументу min_age: другий виклик із 30 дає лише Марію." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['Марія', 'Оля']\n['Марія']", hint: "Мають бути рівно два рядки виводу без зайвого тексту." },
      { on: "source", name: "Вставка через executemany", has: "executemany(", hint: "conn.executemany('INSERT INTO users (name, age) VALUES (?, ?)', rows)." },
      { on: "source", name: "Плейсхолдер ? у запиті", matches: "\\?", hint: "Значення передавайте через знак питання у тексті запиту." },
      { on: "source", name: "Значення не склеюються в рядок запиту (без f-рядків і %)", matches: "execute(many)?\\(\\s*f[\"']|execute\\([^)]*%\\s*\\(|execute\\([^)]*\\.format\\(", not: true, hint: "Не використовуйте f-рядки, % чи .format() у тексті запиту: це SQL-ін'єкція." },
    ],
  },
];
