-- Миграция для уже созданной базы: вход по почте и паролю, письма с токенами, лимит попыток.
-- Выполнить один раз: npx wrangler d1 execute iteris-code --remote --file=migrations/0003_password_auth.sql
-- (для новой базы достаточно schema.sql: там это уже есть)
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 1;   -- существующие (Google) аккаунты считаются подтверждёнными

CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id, kind);

CREATE TABLE IF NOT EXISTS auth_throttle (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
