CREATE TABLE IF NOT EXISTS cazi.categories (
  id TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON cazi.categories (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON cazi.categories (is_active);

INSERT INTO cazi.categories (id, name_tr, name_en, sort_order, is_active)
VALUES
  ('ana_yemek', 'Ana Yemek', 'Main Course', 1, TRUE),
  ('kahvalti', 'Kahvaltı', 'Breakfast', 2, TRUE),
  ('salata', 'Salata', 'Salad', 3, TRUE),
  ('meze', 'Meze', 'Mezes', 4, TRUE),
  ('corba', 'Corba', 'Soups', 5, TRUE),
  ('tatli', 'Tatli', 'Desserts', 6, TRUE),
  ('glutensiz', 'Glutensiz', 'Gluten Free', 7, TRUE),
  ('vejetaryen', 'Vejetaryen', 'Vegetarian', 8, TRUE),
  ('icecekler', 'Icecekler', 'Drinks', 9, TRUE)
ON CONFLICT (id) DO UPDATE
SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
