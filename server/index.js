const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = Number(process.env.API_PORT || 4000);

const shouldUseSsl = String(process.env.PGSSL || '').toLowerCase() === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || undefined,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE || undefined,
  user: process.env.PGUSER || undefined,
  password: process.env.PGPASSWORD || undefined,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowIso = () => new Date().toISOString();

const sql = {
  init: `
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      user_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      cook_id TEXT NOT NULL,
      category TEXT NOT NULL,
      is_available BOOLEAN NOT NULL,
      rating NUMERIC NOT NULL,
      review_count INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      status TEXT NOT NULL,
      order_date TIMESTAMPTZ NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      is_active BOOLEAN NOT NULL,
      last_message_time TIMESTAMPTZ,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      is_read BOOLEAN NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL,
      rating NUMERIC NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      data JSONB NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users ((lower(email)));
    CREATE INDEX IF NOT EXISTS idx_foods_cook_id ON foods (cook_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders (buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders (seller_id);
    CREATE INDEX IF NOT EXISTS idx_chats_buyer_id ON chats (buyer_id);
    CREATE INDEX IF NOT EXISTS idx_chats_seller_id ON chats (seller_id);
    CREATE INDEX IF NOT EXISTS idx_chats_last_message_time ON chats (last_message_time DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp ASC);
    CREATE INDEX IF NOT EXISTS idx_reviews_food_id ON reviews (food_id);
  `,
};

const readJson = (filename) => {
  const filePath = path.resolve(__dirname, '..', 'src', 'mock', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const seedFromMockIfEmpty = async () => {
  const shouldSeed = String(process.env.AUTO_SEED_MOCK || 'true').toLowerCase() === 'true';
  if (!shouldSeed) return;

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count > 0) return;

  const users = readJson('users.json');
  const foods = readJson('foods.json');
  const orders = readJson('orders.json');
  const chats = readJson('chats.json');
  const messages = readJson('messages.json');
  const reviews = readJson('reviews.json');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const user of users) {
      const now = nowIso();
      const payload = {
        ...user,
        createdAt: user.createdAt || now,
        updatedAt: user.updatedAt || now,
      };
      await client.query(
        `INSERT INTO users (uid, email, password, user_type, created_at, updated_at, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
        [
          payload.uid,
          payload.email,
          payload.password || '',
          payload.userType || 'buyer',
          payload.createdAt,
          payload.updatedAt,
          JSON.stringify(payload),
        ]
      );
    }

    for (const food of foods) {
      const now = nowIso();
      const payload = {
        ...food,
        id: food.id || makeId('food'),
        cookId: food.cookId || food.sellerId || 'unknown',
        isAvailable: food.isAvailable ?? true,
        rating: food.rating ?? 0,
        reviewCount: food.reviewCount ?? 0,
        createdAt: food.createdAt || now,
        updatedAt: food.updatedAt || now,
      };
      await client.query(
        `INSERT INTO foods (id, cook_id, category, is_available, rating, review_count, created_at, updated_at, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [
          payload.id,
          payload.cookId,
          payload.category || 'other',
          Boolean(payload.isAvailable),
          Number(payload.rating || 0),
          Number(payload.reviewCount || 0),
          payload.createdAt,
          payload.updatedAt,
          JSON.stringify(payload),
        ]
      );
    }

    for (const order of orders) {
      const payload = {
        ...order,
        id: order.id || makeId('order'),
        orderDate: order.orderDate || nowIso(),
      };
      await client.query(
        `INSERT INTO orders (id, buyer_id, seller_id, status, order_date, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          payload.id,
          payload.buyerId,
          payload.sellerId,
          payload.status || 'pending',
          payload.orderDate,
          JSON.stringify(payload),
        ]
      );
    }

    for (const chat of chats) {
      const payload = {
        ...chat,
        id: chat.id || makeId('chat'),
        createdAt: chat.createdAt || nowIso(),
        lastMessageTime: chat.lastMessageTime || chat.createdAt || nowIso(),
        isActive: chat.isActive ?? true,
      };
      await client.query(
        `INSERT INTO chats (id, buyer_id, seller_id, is_active, last_message_time, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          payload.id,
          payload.buyerId,
          payload.sellerId,
          Boolean(payload.isActive),
          payload.lastMessageTime,
          JSON.stringify(payload),
        ]
      );
    }

    for (const message of messages) {
      const payload = {
        ...message,
        id: message.id || makeId('message'),
        timestamp: message.timestamp || nowIso(),
        isRead: message.isRead ?? false,
      };
      await client.query(
        `INSERT INTO messages (id, chat_id, sender_id, timestamp, is_read, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          payload.id,
          payload.chatId,
          payload.senderId,
          payload.timestamp,
          Boolean(payload.isRead),
          JSON.stringify(payload),
        ]
      );
    }

    for (const review of reviews) {
      const payload = {
        ...review,
        id: review.id || makeId('review'),
        createdAt: review.createdAt || nowIso(),
      };
      await client.query(
        `INSERT INTO reviews (id, food_id, rating, created_at, data)
         VALUES ($1, $2, $3, $4, $5::jsonb)`,
        [
          payload.id,
          payload.foodId,
          Number(payload.rating || 0),
          payload.createdAt,
          JSON.stringify(payload),
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seeded PostgreSQL from src/mock/*.json');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const send = (res, status, data, error) => {
  if (error) return res.status(status).json({ status, error });
  return res.status(status).json({ status, data });
};

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    send(res, 200, { ok: true, db: 'connected' });
  } catch (error) {
    send(res, 500, null, error.message);
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { uid, email, displayName, userType, password } = req.body || {};
    if (!email || !password) return send(res, 400, null, 'Email and password are required');

    const existing = await pool.query('SELECT uid FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
    if (existing.rowCount) return send(res, 400, null, 'Email already in use');

    const now = nowIso();
    const user = {
      uid: uid || makeId('user'),
      email,
      displayName: displayName || '',
      userType: userType || 'buyer',
      password,
      createdAt: now,
      updatedAt: now,
    };

    await pool.query(
      `INSERT INTO users (uid, email, password, user_type, created_at, updated_at, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [user.uid, user.email, user.password, user.userType, user.createdAt, user.updatedAt, JSON.stringify(user)]
    );

    return send(res, 201, user);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return send(res, 400, null, 'Email and password are required');

    const result = await pool.query('SELECT data, password FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
    if (!result.rowCount || result.rows[0].password !== password) {
      return send(res, 401, null, 'Invalid credentials');
    }
    return send(res, 200, result.rows[0].data);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.get('/auth/me/:uid', async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM users WHERE uid = $1 LIMIT 1', [req.params.uid]);
    if (!result.rowCount) return send(res, 404, null, 'User not found');
    return send(res, 200, result.rows[0].data);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.get('/foods', async (_req, res) => {
  try {
    const result = await pool.query('SELECT data FROM foods ORDER BY created_at DESC');
    return send(res, 200, result.rows.map((row) => row.data));
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.get('/foods/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM foods WHERE id = $1 LIMIT 1', [req.params.id]);
    if (!result.rowCount) return send(res, 404, null, 'Food not found');
    return send(res, 200, result.rows[0].data);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.post('/foods', async (req, res) => {
  try {
    const now = nowIso();
    const payload = {
      ...req.body,
      id: req.body?.id || makeId('food'),
      cookId: req.body?.cookId || 'unknown',
      category: req.body?.category || 'other',
      isAvailable: req.body?.isAvailable ?? true,
      rating: req.body?.rating ?? 0,
      reviewCount: req.body?.reviewCount ?? 0,
      createdAt: req.body?.createdAt || now,
      updatedAt: req.body?.updatedAt || now,
    };

    await pool.query(
      `INSERT INTO foods (id, cook_id, category, is_available, rating, review_count, created_at, updated_at, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        payload.id,
        payload.cookId,
        payload.category,
        Boolean(payload.isAvailable),
        Number(payload.rating || 0),
        Number(payload.reviewCount || 0),
        payload.createdAt,
        payload.updatedAt,
        JSON.stringify(payload),
      ]
    );
    return send(res, 201, payload);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.post('/orders', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      id: req.body?.id || makeId('order'),
      orderDate: req.body?.orderDate || nowIso(),
      status: req.body?.status || 'pending',
    };

    await pool.query(
      `INSERT INTO orders (id, buyer_id, seller_id, status, order_date, data)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        payload.id,
        payload.buyerId,
        payload.sellerId,
        payload.status,
        payload.orderDate,
        JSON.stringify(payload),
      ]
    );

    return send(res, 201, payload);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.get('/orders', async (req, res) => {
  try {
    const { userId, type } = req.query;
    if (!userId || !type) return send(res, 400, null, 'userId and type are required');
    const field = type === 'buyer' ? 'buyer_id' : 'seller_id';

    const result = await pool.query(
      `SELECT data FROM orders WHERE ${field} = $1 ORDER BY order_date DESC`,
      [userId]
    );
    return send(res, 200, result.rows.map((row) => row.data));
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return send(res, 400, null, 'status is required');

    const update = await pool.query(
      `UPDATE orders
       SET status = $1,
           data = jsonb_set(data, '{status}', to_jsonb($1::text), true)
       WHERE id = $2
       RETURNING id`,
      [status, req.params.id]
    );
    if (!update.rowCount) return send(res, 404, null, 'Order not found');
    return send(res, 200, { id: req.params.id, status });
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.get('/chats', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return send(res, 400, null, 'userId is required');
    const result = await pool.query(
      `SELECT data FROM chats WHERE buyer_id = $1 OR seller_id = $1 ORDER BY last_message_time DESC NULLS LAST`,
      [userId]
    );
    return send(res, 200, result.rows.map((row) => row.data));
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.post('/chats', async (req, res) => {
  try {
    const { buyerId, sellerId } = req.body || {};
    if (!buyerId || !sellerId) return send(res, 400, null, 'buyerId and sellerId are required');

    const existing = await pool.query(
      'SELECT data FROM chats WHERE buyer_id = $1 AND seller_id = $2 LIMIT 1',
      [buyerId, sellerId]
    );
    if (existing.rowCount) return send(res, 200, existing.rows[0].data);

    const now = nowIso();
    const payload = {
      ...req.body,
      id: req.body?.id || makeId('chat'),
      isActive: req.body?.isActive ?? true,
      createdAt: req.body?.createdAt || now,
      lastMessageTime: req.body?.lastMessageTime || now,
    };

    await pool.query(
      `INSERT INTO chats (id, buyer_id, seller_id, is_active, last_message_time, data)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        payload.id,
        payload.buyerId,
        payload.sellerId,
        Boolean(payload.isActive),
        payload.lastMessageTime,
        JSON.stringify(payload),
      ]
    );
    return send(res, 201, payload);
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.get('/chats/:id/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT data FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC',
      [req.params.id]
    );
    return send(res, 200, result.rows.map((row) => row.data));
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.post('/chats/:id/messages', async (req, res) => {
  const client = await pool.connect();
  try {
    const now = nowIso();
    const payload = {
      ...req.body,
      id: req.body?.id || makeId('message'),
      chatId: req.params.id,
      timestamp: req.body?.timestamp || now,
      isRead: req.body?.isRead ?? false,
    };

    await client.query('BEGIN');
    await client.query(
      `INSERT INTO messages (id, chat_id, sender_id, timestamp, is_read, data)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        payload.id,
        payload.chatId,
        payload.senderId,
        payload.timestamp,
        Boolean(payload.isRead),
        JSON.stringify(payload),
      ]
    );

    await client.query(
      `UPDATE chats
       SET last_message_time = $1,
           data = jsonb_set(
             jsonb_set(
               jsonb_set(data, '{lastMessage}', to_jsonb($2::text), true),
               '{lastMessageTime}', to_jsonb($1::text), true
             ),
             '{lastMessageSender}', to_jsonb($3::text), true
           )
       WHERE id = $4`,
      [payload.timestamp, payload.message || '', payload.senderId || '', payload.chatId]
    );
    await client.query('COMMIT');
    return send(res, 201, payload);
  } catch (error) {
    await client.query('ROLLBACK');
    return send(res, 500, null, error.message);
  } finally {
    client.release();
  }
});

app.post('/reviews', async (req, res) => {
  const client = await pool.connect();
  try {
    const now = nowIso();
    const payload = {
      ...req.body,
      id: req.body?.id || makeId('review'),
      createdAt: req.body?.createdAt || now,
      updatedAt: req.body?.updatedAt || now,
      rating: Number(req.body?.rating || 0),
    };

    await client.query('BEGIN');
    await client.query(
      `INSERT INTO reviews (id, food_id, rating, created_at, data)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [payload.id, payload.foodId, payload.rating, payload.createdAt, JSON.stringify(payload)]
    );

    const foodResult = await client.query(
      'SELECT id, rating, review_count, data FROM foods WHERE id = $1 FOR UPDATE',
      [payload.foodId]
    );

    if (foodResult.rowCount) {
      const food = foodResult.rows[0];
      const previousCount = Number(food.review_count || 0);
      const previousRating = Number(food.rating || 0);
      const newCount = previousCount + 1;
      const newRating = Math.round((((previousRating * previousCount) + payload.rating) / newCount) * 10) / 10;
      const newFoodData = {
        ...(food.data || {}),
        rating: newRating,
        reviewCount: newCount,
        updatedAt: nowIso(),
      };

      await client.query(
        `UPDATE foods
         SET rating = $1,
             review_count = $2,
             updated_at = NOW(),
             data = $3::jsonb
         WHERE id = $4`,
        [newRating, newCount, JSON.stringify(newFoodData), payload.foodId]
      );
    }

    await client.query('COMMIT');
    return send(res, 201, payload);
  } catch (error) {
    await client.query('ROLLBACK');
    return send(res, 500, null, error.message);
  } finally {
    client.release();
  }
});

app.get('/reviews', async (req, res) => {
  try {
    const { foodId } = req.query;
    if (!foodId) return send(res, 400, null, 'foodId is required');
    const result = await pool.query('SELECT data FROM reviews WHERE food_id = $1 ORDER BY created_at DESC', [foodId]);
    return send(res, 200, result.rows.map((row) => row.data));
  } catch (error) {
    return send(res, 500, null, error.message);
  }
});

app.use((_req, res) => send(res, 404, null, 'Endpoint not found'));

const start = async () => {
  try {
    await pool.query(sql.init);
    await seedFromMockIfEmpty();
    app.listen(PORT, () => {
      console.log(`✅ API server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
