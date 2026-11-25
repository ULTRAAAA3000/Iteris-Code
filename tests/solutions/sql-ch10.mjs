// Еталонні рішення завдань SQL, глава 10 (id завдання -> повний скрипт). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_10 = {
  "sql-in-python": raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")


def add_users(conn, rows):
    conn.executemany("INSERT INTO users (name, age) VALUES (?, ?)", rows)


def find_adults(conn, min_age):
    cur = conn.execute("SELECT name FROM users WHERE age >= ? ORDER BY name", (min_age,))
    return [row[0] for row in cur.fetchall()]


add_users(conn, [("Оля", 25), ("Іван", 17), ("Марія", 40)])
print(find_adults(conn, 18))
print(find_adults(conn, 30))
`,
};
