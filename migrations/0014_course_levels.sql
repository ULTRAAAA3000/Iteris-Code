-- Рівень проходження курсу: базовий чи просунутий (поки лише для Go). Немає рядка: базовий
CREATE TABLE IF NOT EXISTS user_course_levels (
  user_id TEXT NOT NULL,
  course TEXT NOT NULL,
  level TEXT NOT NULL,                -- 'base' | 'adv'
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
