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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  portal_url TEXT,                   -- ссылка на управление подпиской у платёжки
  subscription_id TEXT,
  billing_updated_at TEXT,           -- время последнего применённого платёжного события
  password_hash TEXT,                -- PBKDF2-SHA256 (вход по почте и паролю), NULL у Google-аккаунтов
  email_verified INTEGER DEFAULT 1,  -- 0 = регистрация по паролю, почта ещё не подтверждена
  nick TEXT,                         -- ник публичного профиля (a-z, 0-9, _), хранится в нижнем регистре, задаётся один раз
  avatar_id TEXT,                    -- выбранный герой-аватар (id из src/data/idols.ts); NULL = фото из входа или герой по умолчанию
  bio TEXT,                          -- о себе, до 160 символов, без ссылок
  profile_public INTEGER DEFAULT 0,  -- 1 = профиль открыт по адресу /u/<ник>; по умолчанию закрыт
  session_ver INTEGER DEFAULT 0      -- версия сессий: смена пароля и «выйти всюду» увеличивают её, старые cookie перестают действовать
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nick ON users(nick) WHERE nick IS NOT NULL;

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

-- Журнал платёжных событий (идемпотентность вебхука)
CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_name TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Одноразовые токены из писем: подтверждение почты и сброс пароля (хранится только SHA-256 токена)
CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,                -- verify | reset
  expires_at INTEGER NOT NULL,       -- unix-время, сек
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id, kind);

-- Ограничение частоты попыток (вход, регистрация, письма)
CREATE TABLE IF NOT EXISTS auth_throttle (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL          -- unix-время, сек
);

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

-- Жалобы на публичные профили (смотрим вручную: SELECT * FROM reports ORDER BY created_at DESC)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  nick TEXT NOT NULL,
  reason TEXT NOT NULL,              -- spam | abuse | personal | other
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (reporter_id, nick)         -- один человек жалуется на профиль один раз
);
