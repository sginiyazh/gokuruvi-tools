-- GokuruviBot AI: accounts, rate-limit events and daily message counts.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,   -- base64 PBKDF2-SHA256 output
  salt TEXT NOT NULL,            -- base64, 16 random bytes
  iterations INTEGER NOT NULL,
  created_at INTEGER NOT NULL,   -- unix seconds
  last_login INTEGER
);

-- Failed logins and sign-ups, used to slow down guessing and mass sign-ups.
-- "key" is e.g. 'login:<email>', 'loginip:<ip>' or 'signup:<ip>'.
CREATE TABLE IF NOT EXISTS auth_events (
  key TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_events_key_at ON auth_events (key, at);

-- Chat messages sent per user per UTC day (user_id 0 = whole site).
CREATE TABLE IF NOT EXISTS usage (
  user_id INTEGER NOT NULL,
  day TEXT NOT NULL,             -- YYYY-MM-DD (UTC)
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
