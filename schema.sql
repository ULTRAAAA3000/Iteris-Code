-- Iteris Code: схема Cloudflare D1 (SQLite)

-- Пользователи и статус подписки
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,               -- Google OAuth ID (sub)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_pro INTEGER DEFAULT 0,          -- 0 = Free, 1 = Pro
  pro_until DATETIME,
  streak_count INTEGER DEFAULT 0,
  last_active_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Прогресс прохождения уроков (lesson_id вида "python/3")
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT,
  lesson_id TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- История решений и отправленных тасков
CREATE TABLE IF NOT EXISTS task_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  task_id TEXT,
  code TEXT,
  is_passed INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_progress_user_time ON user_progress(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_submissions_user_time ON task_submissions(user_id, created_at);
