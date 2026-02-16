CREATE SCHEMA IF NOT EXISTS cazi;

CREATE TABLE IF NOT EXISTS cazi.user_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cazi.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address_line TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON cazi.user_addresses (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_default_address
  ON cazi.user_addresses (user_id)
  WHERE is_default = TRUE;

CREATE TABLE IF NOT EXISTS cazi.favorites (
  user_id TEXT NOT NULL REFERENCES cazi.users(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES cazi.foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_food ON cazi.favorites (food_id);

CREATE TABLE IF NOT EXISTS cazi.user_settings (
  user_id TEXT PRIMARY KEY REFERENCES cazi.users(id) ON DELETE CASCADE,
  language TEXT NULL,
  country_code TEXT NULL,
  theme_preference TEXT NULL CHECK (theme_preference IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_user_addresses_updated_at ON cazi.user_addresses;
CREATE TRIGGER trg_user_addresses_updated_at
BEFORE UPDATE ON cazi.user_addresses
FOR EACH ROW EXECUTE FUNCTION cazi.set_updated_at();
