# PostgreSQL Schema Plan (Coziyoo)

## 1) Entity Inventory (from current code)

Core API entities already used by services/controllers:
- `users` (`src/api/models/userModel.ts`)
- `foods` (`src/api/models/foodModel.ts`)
- `orders` (`src/api/models/orderModel.ts`)
- `chats` (`src/api/models/chatModel.ts`)
- `messages` (`src/api/models/messageModel.ts`)
- `reviews` (`src/api/models/reviewModel.ts`)

Local-only entities currently in AsyncStorage/UI that should be normalized next:
- `favorites` (`src/services/favoriteService.ts`)
- `addresses` (`src/features/buyer/screens/Addresses.tsx`)
- `wallet_data`, `transactions`, `payment_methods` (`src/context/WalletContext.tsx`)
- app/user settings (`language`, `country`, `theme` in contexts)

## 2) Target Design Principles

- Use UUID/text primary keys compatible with existing app ids.
- Keep strict relational fields for querying/indexing.
- Keep `metadata JSONB` only for flexible/extensible fields.
- Use `created_at`, `updated_at` (`TIMESTAMPTZ`) everywhere.
- Add foreign keys and selective `ON DELETE` rules.

## 3) Phase 1 (MVP Transactional Schema)

### 3.1 `users`
Fields:
- `id TEXT PRIMARY KEY` (maps from `uid`)
- `email TEXT NOT NULL UNIQUE`
- `password_hash TEXT NOT NULL` (replace plain password)
- `display_name TEXT NOT NULL`
- `user_type TEXT NOT NULL CHECK (user_type IN ('buyer','seller','both'))`
- `allergic_to TEXT[] NULL`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Indexes:
- unique `email`
- btree `user_type`

### 3.2 `foods`
Fields:
- `id TEXT PRIMARY KEY`
- `seller_id TEXT NOT NULL REFERENCES users(id)`
- `name TEXT NOT NULL`
- `card_summary TEXT NULL`
- `description TEXT NOT NULL DEFAULT ''`
- `recipe TEXT NULL`
- `category TEXT NOT NULL`
- `country_code TEXT NULL` (`TR`/`UK`)
- `price NUMERIC(10,2) NOT NULL CHECK (price >= 0)`
- `image_url TEXT NULL`
- `ingredients JSONB NOT NULL DEFAULT '[]'::jsonb`
- `allergens JSONB NOT NULL DEFAULT '[]'::jsonb`
- `preparation_time_minutes INT NOT NULL DEFAULT 0`
- `serving_size INT NOT NULL DEFAULT 0`
- `delivery_fee NUMERIC(10,2) NULL`
- `max_delivery_distance_km NUMERIC(6,2) NULL`
- `available_delivery_options JSONB NOT NULL DEFAULT '[]'::jsonb`
- `current_stock INT NULL`
- `daily_stock INT NULL`
- `is_available BOOLEAN NOT NULL DEFAULT TRUE`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `rating NUMERIC(3,2) NOT NULL DEFAULT 0`
- `review_count INT NOT NULL DEFAULT 0`
- `favorite_count INT NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Indexes:
- `seller_id`
- `category`
- partial index on `(is_active, is_available)`
- `created_at DESC`

### 3.3 `orders`
Fields:
- `id TEXT PRIMARY KEY`
- `food_id TEXT NOT NULL REFERENCES foods(id)`
- `buyer_id TEXT NOT NULL REFERENCES users(id)`
- `seller_id TEXT NOT NULL REFERENCES users(id)`
- `quantity INT NOT NULL CHECK (quantity > 0)`
- `total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0)`
- `status TEXT NOT NULL CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled'))`
- `delivery_address TEXT NOT NULL`
- `estimated_delivery_time TIMESTAMPTZ NULL`
- `order_date TIMESTAMPTZ NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Indexes:
- `(buyer_id, order_date DESC)`
- `(seller_id, order_date DESC)`
- `(status, order_date DESC)`

### 3.4 `chats`
Fields:
- `id TEXT PRIMARY KEY`
- `buyer_id TEXT NOT NULL REFERENCES users(id)`
- `seller_id TEXT NOT NULL REFERENCES users(id)`
- `order_id TEXT NULL REFERENCES orders(id)`
- `food_id TEXT NULL REFERENCES foods(id)`
- `buyer_name TEXT NULL`
- `seller_name TEXT NULL`
- `food_name TEXT NULL`
- `last_message TEXT NOT NULL DEFAULT ''`
- `last_message_time TIMESTAMPTZ NULL`
- `last_message_sender TEXT NULL`
- `buyer_unread_count INT NOT NULL DEFAULT 0`
- `seller_unread_count INT NOT NULL DEFAULT 0`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints/Indexes:
- unique `(buyer_id, seller_id, COALESCE(order_id,''))` (or app-level upsert policy)
- `(buyer_id, last_message_time DESC)`
- `(seller_id, last_message_time DESC)`

### 3.5 `messages`
Fields:
- `id TEXT PRIMARY KEY`
- `chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE`
- `sender_id TEXT NOT NULL REFERENCES users(id)`
- `sender_name TEXT NULL`
- `sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer','seller'))`
- `message TEXT NOT NULL`
- `message_type TEXT NOT NULL CHECK (message_type IN ('text','image','order_update'))`
- `order_data JSONB NULL`
- `is_read BOOLEAN NOT NULL DEFAULT FALSE`
- `timestamp TIMESTAMPTZ NOT NULL`

Indexes:
- `(chat_id, timestamp ASC)`
- `(sender_id, timestamp DESC)`

### 3.6 `reviews`
Fields:
- `id TEXT PRIMARY KEY`
- `food_id TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE`
- `buyer_id TEXT NOT NULL REFERENCES users(id)`
- `seller_id TEXT NOT NULL REFERENCES users(id)`
- `order_id TEXT NULL REFERENCES orders(id)`
- `food_name TEXT NULL`
- `buyer_name TEXT NULL`
- `seller_name TEXT NULL`
- `buyer_avatar TEXT NULL`
- `rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5)`
- `comment TEXT NOT NULL`
- `images JSONB NOT NULL DEFAULT '[]'::jsonb`
- `helpful_count INT NOT NULL DEFAULT 0`
- `report_count INT NOT NULL DEFAULT 0`
- `is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints/Indexes:
- optional unique `(buyer_id, food_id, order_id)` to prevent duplicate review per order
- `(food_id, created_at DESC)`
- `(seller_id, created_at DESC)`

## 4) Phase 2 (User Experience Entities)

### 4.1 `user_addresses`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `title TEXT NOT NULL`
- `address_line TEXT NOT NULL`
- `is_default BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraint:
- partial unique index: one default address per user (`WHERE is_default = true`)

### 4.2 `favorites`
- `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `food_id TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- PK `(user_id, food_id)`

Note:
- `foods.favorite_count` should be updated transactionally from favorites writes.

### 4.3 `user_settings`
- `user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`
- `language TEXT NULL`
- `country_code TEXT NULL`
- `theme_preference TEXT NULL CHECK (theme_preference IN ('light','dark','system'))`
- `notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

## 5) Phase 3 (Wallet/Payments/Notification Persistence)

### 5.1 `wallet_accounts`
- `user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`
- `balance NUMERIC(12,2) NOT NULL DEFAULT 0`
- `pending_earnings NUMERIC(12,2) NOT NULL DEFAULT 0`
- `available_earnings NUMERIC(12,2) NOT NULL DEFAULT 0`
- `total_lifetime_earnings NUMERIC(12,2) NOT NULL DEFAULT 0`
- `total_lifetime_spent NUMERIC(12,2) NOT NULL DEFAULT 0`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 5.2 `wallet_transactions`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `order_id TEXT NULL REFERENCES orders(id)`
- `type TEXT NOT NULL CHECK (type IN ('earning','spending','withdrawal','refund'))`
- `amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0)`
- `status TEXT NOT NULL CHECK (status IN ('pending','completed','failed'))`
- `description TEXT NULL`
- `created_at TIMESTAMPTZ NOT NULL`
- `completed_at TIMESTAMPTZ NULL`

### 5.3 `payment_methods`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `type TEXT NOT NULL CHECK (type IN ('card','bank'))`
- `brand TEXT NULL`
- `last4 TEXT NOT NULL`
- `expiry_month INT NULL`
- `expiry_year INT NULL`
- `is_default BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 5.4 `notification_events`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `type TEXT NOT NULL` (`order_update`, `new_message`, `low_stock`, etc.)
- `title TEXT NOT NULL`
- `body TEXT NOT NULL`
- `data JSONB NULL`
- `is_read BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

## 6) Migration Sequence

1. Create Phase 1 tables and indexes.
2. Backfill from existing `src/mock/*.json` into Phase 1.
3. Switch read-only traffic to PostgreSQL (foods/orders/chats/messages/reviews/auth).
4. Add Phase 2 tables (`favorites`, `addresses`, `user_settings`) and move AsyncStorage-backed flows.
5. Add Phase 3 wallet/notifications tables.
6. Add audit triggers (`updated_at`), then tighten constraints.

## 7) Data Integrity Rules

- Hash all passwords (`bcrypt`) before insert.
- Use transactions for:
  - `reviews` insert + `foods.rating/review_count` update
  - `messages` insert + `chats.last_message*` update
  - `favorites` toggle + `foods.favorite_count` update
- Enforce server-side ownership checks for updates/deletes.

## 8) API Compatibility Notes

- Keep current route contract stable:
  - `/auth/*`, `/foods*`, `/orders*`, `/chats*`, `/reviews*`
- Convert DB snake_case to existing camelCase in API responses until client-side model cleanup is done.
- Keep id format backward-compatible (`user_*`, `food_*`, etc.) to avoid breaking deep links/state.
