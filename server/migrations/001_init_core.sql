CREATE SCHEMA IF NOT EXISTS cazi;

CREATE TABLE IF NOT EXISTS cazi.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'seller', 'both')),
  allergic_to TEXT[] NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_user_type ON cazi.users (user_type);

CREATE TABLE IF NOT EXISTS cazi.foods (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES cazi.users(id),
  name TEXT NOT NULL,
  card_summary TEXT NULL,
  description TEXT NOT NULL DEFAULT '',
  recipe TEXT NULL,
  category TEXT NOT NULL,
  country_code TEXT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  allergens JSONB NOT NULL DEFAULT '[]'::jsonb,
  preparation_time_minutes INT NOT NULL DEFAULT 0,
  serving_size INT NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NULL,
  max_delivery_distance_km NUMERIC(6,2) NULL,
  available_delivery_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_stock INT NULL,
  daily_stock INT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  favorite_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_seller_id ON cazi.foods (seller_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON cazi.foods (category);
CREATE INDEX IF NOT EXISTS idx_foods_created_at_desc ON cazi.foods (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_foods_active_available ON cazi.foods (is_active, is_available);

CREATE TABLE IF NOT EXISTS cazi.orders (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL REFERENCES cazi.foods(id),
  buyer_id TEXT NOT NULL REFERENCES cazi.users(id),
  seller_id TEXT NOT NULL REFERENCES cazi.users(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  estimated_delivery_time TIMESTAMPTZ NULL,
  order_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_date ON cazi.orders (buyer_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_date ON cazi.orders (seller_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON cazi.orders (status, order_date DESC);

CREATE TABLE IF NOT EXISTS cazi.chats (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES cazi.users(id),
  seller_id TEXT NOT NULL REFERENCES cazi.users(id),
  order_id TEXT NULL REFERENCES cazi.orders(id),
  food_id TEXT NULL REFERENCES cazi.foods(id),
  buyer_name TEXT NULL,
  seller_name TEXT NULL,
  food_name TEXT NULL,
  last_message TEXT NOT NULL DEFAULT '',
  last_message_time TIMESTAMPTZ NULL,
  last_message_sender TEXT NULL,
  buyer_unread_count INT NOT NULL DEFAULT 0,
  seller_unread_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_chats_buyer_seller_order
  ON cazi.chats (buyer_id, seller_id, COALESCE(order_id, ''));
CREATE INDEX IF NOT EXISTS idx_chats_buyer_last ON cazi.chats (buyer_id, last_message_time DESC);
CREATE INDEX IF NOT EXISTS idx_chats_seller_last ON cazi.chats (seller_id, last_message_time DESC);

CREATE TABLE IF NOT EXISTS cazi.messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES cazi.chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES cazi.users(id),
  sender_name TEXT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'seller')),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'order_update')),
  order_data JSONB NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON cazi.messages (chat_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_time ON cazi.messages (sender_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS cazi.reviews (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL REFERENCES cazi.foods(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES cazi.users(id),
  seller_id TEXT NOT NULL REFERENCES cazi.users(id),
  order_id TEXT NULL REFERENCES cazi.orders(id),
  food_name TEXT NULL,
  buyer_name TEXT NULL,
  seller_name TEXT NULL,
  buyer_avatar TEXT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  helpful_count INT NOT NULL DEFAULT 0,
  report_count INT NOT NULL DEFAULT 0,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_food_created ON cazi.reviews (food_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_created ON cazi.reviews (seller_id, created_at DESC);

CREATE OR REPLACE FUNCTION cazi.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON cazi.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON cazi.users
FOR EACH ROW EXECUTE FUNCTION cazi.set_updated_at();

DROP TRIGGER IF EXISTS trg_foods_updated_at ON cazi.foods;
CREATE TRIGGER trg_foods_updated_at
BEFORE UPDATE ON cazi.foods
FOR EACH ROW EXECUTE FUNCTION cazi.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON cazi.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON cazi.orders
FOR EACH ROW EXECUTE FUNCTION cazi.set_updated_at();

DROP TRIGGER IF EXISTS trg_chats_updated_at ON cazi.chats;
CREATE TRIGGER trg_chats_updated_at
BEFORE UPDATE ON cazi.chats
FOR EACH ROW EXECUTE FUNCTION cazi.set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON cazi.reviews;
CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON cazi.reviews
FOR EACH ROW EXECUTE FUNCTION cazi.set_updated_at();
