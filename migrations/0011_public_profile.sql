-- Миграция этапа 4 для уже созданной базы: публичный профиль (ник, герой-аватар, о себе, открыт/закрыт).
-- Выполнить: npx wrangler d1 execute iteris-code --remote --file=migrations/0011_public_profile.sql
-- (для новой базы достаточно schema.sql; сайт также сам добавляет эти колонки при первом запросе к API)
-- Если одна из строк ALTER сообщит "duplicate column name", колонка уже есть: пропустите её.
ALTER TABLE users ADD COLUMN nick TEXT;
ALTER TABLE users ADD COLUMN avatar_id TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN profile_public INTEGER DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nick ON users(nick) WHERE nick IS NOT NULL;
