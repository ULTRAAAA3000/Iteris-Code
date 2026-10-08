-- Миграция для уже созданной базы: поля подписки и журнал платёжных событий.
-- Выполнить один раз: npx wrangler d1 execute iteris-code --remote --file=migrations/0002_payments.sql
-- (для новой базы достаточно schema.sql: там эти поля уже есть)
ALTER TABLE users ADD COLUMN portal_url TEXT;
ALTER TABLE users ADD COLUMN subscription_id TEXT;
ALTER TABLE users ADD COLUMN billing_updated_at TEXT;

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,               -- уникальный ключ события: защита от повторной обработки
  provider TEXT NOT NULL,
  event_name TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
