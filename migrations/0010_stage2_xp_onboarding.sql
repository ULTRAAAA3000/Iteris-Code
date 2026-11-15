-- Миграция Этапа 2 для уже созданной базы: XP-события и онбординг. Безопасно запускать повторно.
-- Выполнить: npx wrangler d1 execute iteris-code --remote --file=migrations/0010_stage2_xp_onboarding.sql
-- (для новой базы достаточно schema.sql: там это уже есть)

-- Этап 2: XP-события и выбор уровня/курсов при первой регистрации
CREATE TABLE IF NOT EXISTS xp_events (
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,              -- lesson | task | streak
  ref TEXT NOT NULL,                 -- id урока "js/3", id задания, число дней серии
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, reason, ref),   -- за одно и то же XP дважды не начисляется
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_xp_user_time ON xp_events(user_id, created_at);

CREATE TABLE IF NOT EXISTS user_onboarding (
  user_id TEXT PRIMARY KEY,
  level TEXT NOT NULL,               -- beginner | intermediate | advanced
  courses TEXT NOT NULL,             -- JSON-массив ключей курсов, например ["js","python"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
