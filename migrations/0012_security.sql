-- Защита: версия сессий и жалобы на профили
ALTER TABLE users ADD COLUMN session_ver INTEGER DEFAULT 0;
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  nick TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (reporter_id, nick)
);
