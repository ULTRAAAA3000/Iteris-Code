-- Денна ціль: скільки кроків (уроків або завдань) на день хоче робити людина
CREATE TABLE IF NOT EXISTS user_goals (
  user_id TEXT PRIMARY KEY,
  daily_goal INTEGER NOT NULL,        -- 1 | 2 | 3 | 5
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
