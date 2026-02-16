CREATE SCHEMA IF NOT EXISTS cazi;

CREATE TABLE IF NOT EXISTS cazi.wallet_accounts (
  user_id TEXT PRIMARY KEY REFERENCES cazi.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  available_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_lifetime_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_lifetime_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cazi.wallet_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cazi.users(id) ON DELETE CASCADE,
  order_id TEXT NULL REFERENCES cazi.orders(id),
  type TEXT NOT NULL CHECK (type IN ('earning', 'spending', 'withdrawal', 'refund')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_created
  ON cazi.wallet_transactions (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS cazi.payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cazi.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank')),
  brand TEXT NULL,
  last4 TEXT NOT NULL,
  expiry_month INT NULL,
  expiry_year INT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON cazi.payment_methods (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_payment_default_per_user
  ON cazi.payment_methods (user_id)
  WHERE is_default = TRUE;

CREATE TABLE IF NOT EXISTS cazi.notification_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cazi.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_events_user_created
  ON cazi.notification_events (user_id, created_at DESC);
