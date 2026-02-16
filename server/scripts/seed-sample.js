const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: '.env.local' });
dotenv.config();

const shouldUseSsl = String(process.env.PGSSL || '').toLowerCase() === 'true';
const shouldReset = String(process.env.SEED_RESET || '').toLowerCase() === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || undefined,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE || undefined,
  user: process.env.PGUSER || undefined,
  password: process.env.PGPASSWORD || undefined,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

const readJson = (filename) => {
  const filePath = path.resolve(__dirname, '..', '..', 'src', 'mock', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const nowIso = () => new Date().toISOString();
const clampRating = (value) => Math.max(0, Math.min(5, Number(value || 0)));

const toUserType = (id = '') => {
  const lower = String(id).toLowerCase();
  if (lower.includes('seller') || lower.includes('satici')) return 'seller';
  return 'buyer';
};

const normalizeSellerId = (food) => food.cookId || food.sellerId || 'mock_seller_1';

const run = async () => {
  const users = readJson('users.json');
  const foods = readJson('foods.json');
  const orders = readJson('orders.json');
  const chats = readJson('chats.json');
  const messages = readJson('messages.json');
  const reviews = readJson('reviews.json');

  const userById = new Map(users.map((u) => [u.uid, u]));
  const foodById = new Map(foods.map((f) => [f.id, f]));
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const chatById = new Map(chats.map((c) => [c.id, c]));

  // Ensure FK-required users exist (many mock sellers exist only in foods/chats/reviews).
  const referencedUserIds = new Set();
  foods.forEach((f) => referencedUserIds.add(normalizeSellerId(f)));
  orders.forEach((o) => {
    referencedUserIds.add(o.buyerId);
    referencedUserIds.add(o.sellerId);
  });
  chats.forEach((c) => {
    referencedUserIds.add(c.buyerId);
    referencedUserIds.add(c.sellerId);
  });
  messages.forEach((m) => referencedUserIds.add(m.senderId));
  reviews.forEach((r) => {
    referencedUserIds.add(r.buyerId);
    referencedUserIds.add(r.sellerId);
  });

  const syntheticUsers = [];
  for (const userId of referencedUserIds) {
    if (!userId || userById.has(userId)) continue;
    const synthetic = {
      uid: userId,
      email: `${String(userId).replace(/[^a-zA-Z0-9_]/g, '_')}@seed.local`,
      password: '123456',
      displayName: String(userId).replace(/[_-]+/g, ' '),
      userType: toUserType(userId),
      allergicTo: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    syntheticUsers.push(synthetic);
    userById.set(userId, synthetic);
  }

  // Ensure FK-required foods exist.
  const syntheticFoods = [];
  const referencedFoodIds = new Set();
  orders.forEach((o) => referencedFoodIds.add(o.foodId));
  chats.forEach((c) => c.foodId && referencedFoodIds.add(c.foodId));
  reviews.forEach((r) => referencedFoodIds.add(r.foodId));
  for (const foodId of referencedFoodIds) {
    if (!foodId || foodById.has(foodId)) continue;
    const synthetic = {
      id: foodId,
      name: `Placeholder ${foodId}`,
      description: 'Auto-generated placeholder food for seed consistency.',
      price: 0,
      cookName: 'Placeholder Seller',
      cookId: 'mock_seller_1',
      category: 'other',
      imageUrl: '',
      ingredients: [],
      preparationTime: 0,
      servingSize: 0,
      isAvailable: false,
      rating: 0,
      reviewCount: 0,
      favoriteCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    syntheticFoods.push(synthetic);
    foodById.set(foodId, synthetic);
  }

  const allUsers = [...users, ...syntheticUsers];
  const allFoods = [...foods, ...syntheticFoods];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET search_path TO cazi, public');

    if (shouldReset) {
      await client.query(`
        TRUNCATE TABLE
          cazi.notification_events,
          cazi.payment_methods,
          cazi.wallet_transactions,
          cazi.wallet_accounts,
          cazi.user_settings,
          cazi.favorites,
          cazi.user_addresses,
          cazi.messages,
          cazi.chats,
          cazi.reviews,
          cazi.orders,
          cazi.foods,
          cazi.users
        RESTART IDENTITY CASCADE
      `);
    }

    let usersUpserted = 0;
    for (const user of allUsers) {
      await client.query(
        `INSERT INTO cazi.users (id, email, password_hash, display_name, user_type, allergic_to, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           display_name = EXCLUDED.display_name,
           user_type = EXCLUDED.user_type,
           allergic_to = EXCLUDED.allergic_to,
           is_active = EXCLUDED.is_active,
           updated_at = EXCLUDED.updated_at`,
        [
          user.uid,
          user.email || `${user.uid}@seed.local`,
          user.password || '123456',
          user.displayName || user.uid,
          user.userType || 'buyer',
          user.allergicTo || null,
          true,
          user.createdAt || nowIso(),
          user.updatedAt || nowIso(),
        ]
      );
      usersUpserted += 1;
    }

    let foodsUpserted = 0;
    for (const food of allFoods) {
      const sellerId = normalizeSellerId(food);
      await client.query(
        `INSERT INTO cazi.foods (
          id, seller_id, name, card_summary, description, recipe, category, country_code, price, image_url,
          ingredients, allergens, preparation_time_minutes, serving_size, delivery_fee, max_delivery_distance_km,
          available_delivery_options, current_stock, daily_stock, is_available, is_active, rating, review_count,
          favorite_count, created_at, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11::jsonb,$12::jsonb,$13,$14,$15,$16,
          $17::jsonb,$18,$19,$20,$21,$22,$23,
          $24,$25,$26
        )
        ON CONFLICT (id) DO UPDATE SET
          seller_id = EXCLUDED.seller_id,
          name = EXCLUDED.name,
          card_summary = EXCLUDED.card_summary,
          description = EXCLUDED.description,
          recipe = EXCLUDED.recipe,
          category = EXCLUDED.category,
          country_code = EXCLUDED.country_code,
          price = EXCLUDED.price,
          image_url = EXCLUDED.image_url,
          ingredients = EXCLUDED.ingredients,
          allergens = EXCLUDED.allergens,
          preparation_time_minutes = EXCLUDED.preparation_time_minutes,
          serving_size = EXCLUDED.serving_size,
          delivery_fee = EXCLUDED.delivery_fee,
          max_delivery_distance_km = EXCLUDED.max_delivery_distance_km,
          available_delivery_options = EXCLUDED.available_delivery_options,
          current_stock = EXCLUDED.current_stock,
          daily_stock = EXCLUDED.daily_stock,
          is_available = EXCLUDED.is_available,
          is_active = EXCLUDED.is_active,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          favorite_count = EXCLUDED.favorite_count,
          updated_at = EXCLUDED.updated_at`,
        [
          food.id,
          sellerId,
          food.name || food.id,
          food.cardSummary || null,
          food.description || '',
          food.recipe || null,
          food.category || 'other',
          food.country || null,
          Number(food.price || 0),
          food.imageUrl || (Array.isArray(food.images) ? food.images[0] : null) || null,
          JSON.stringify(food.ingredients || []),
          JSON.stringify(food.allergens || []),
          Number(food.preparationTime || 0),
          Number(food.servingSize || 0),
          food.deliveryFee == null ? null : Number(food.deliveryFee),
          food.maxDeliveryDistance == null ? null : Number(food.maxDeliveryDistance),
          JSON.stringify(food.availableDeliveryOptions || []),
          food.currentStock == null ? null : Number(food.currentStock),
          food.dailyStock == null ? null : Number(food.dailyStock),
          food.isAvailable !== false,
          food.isActive !== false,
          clampRating(food.rating),
          Number(food.reviewCount || 0),
          Number(food.favoriteCount || 0),
          food.createdAt || nowIso(),
          food.updatedAt || nowIso(),
        ]
      );
      foodsUpserted += 1;
    }

    let ordersUpserted = 0;
    for (const order of orders) {
      await client.query(
        `INSERT INTO cazi.orders (
          id, food_id, buyer_id, seller_id, quantity, total_price, status,
          delivery_address, estimated_delivery_time, order_date, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO UPDATE SET
          food_id = EXCLUDED.food_id,
          buyer_id = EXCLUDED.buyer_id,
          seller_id = EXCLUDED.seller_id,
          quantity = EXCLUDED.quantity,
          total_price = EXCLUDED.total_price,
          status = EXCLUDED.status,
          delivery_address = EXCLUDED.delivery_address,
          estimated_delivery_time = EXCLUDED.estimated_delivery_time,
          order_date = EXCLUDED.order_date,
          updated_at = EXCLUDED.updated_at`,
        [
          order.id,
          order.foodId,
          order.buyerId,
          order.sellerId,
          Number(order.quantity || 1),
          Number(order.totalPrice || 0),
          order.status || 'pending',
          order.deliveryAddress || '',
          order.estimatedDeliveryTime || null,
          order.orderDate || nowIso(),
          order.orderDate || nowIso(),
          nowIso(),
        ]
      );
      ordersUpserted += 1;
    }

    let chatsUpserted = 0;
    for (const chat of chats) {
      const orderIdValid = chat.orderId && orderById.has(chat.orderId) ? chat.orderId : null;
      const foodIdValid = chat.foodId && foodById.has(chat.foodId) ? chat.foodId : null;
      await client.query(
        `INSERT INTO cazi.chats (
          id, buyer_id, seller_id, order_id, food_id, buyer_name, seller_name, food_name,
          last_message, last_message_time, last_message_sender, buyer_unread_count, seller_unread_count,
          is_active, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (id) DO UPDATE SET
          buyer_id = EXCLUDED.buyer_id,
          seller_id = EXCLUDED.seller_id,
          order_id = EXCLUDED.order_id,
          food_id = EXCLUDED.food_id,
          buyer_name = EXCLUDED.buyer_name,
          seller_name = EXCLUDED.seller_name,
          food_name = EXCLUDED.food_name,
          last_message = EXCLUDED.last_message,
          last_message_time = EXCLUDED.last_message_time,
          last_message_sender = EXCLUDED.last_message_sender,
          buyer_unread_count = EXCLUDED.buyer_unread_count,
          seller_unread_count = EXCLUDED.seller_unread_count,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at`,
        [
          chat.id,
          chat.buyerId,
          chat.sellerId,
          orderIdValid,
          foodIdValid,
          chat.buyerName || null,
          chat.sellerName || null,
          chat.foodName || null,
          chat.lastMessage || '',
          chat.lastMessageTime || nowIso(),
          chat.lastMessageSender || null,
          Number(chat.buyerUnreadCount || 0),
          Number(chat.sellerUnreadCount || 0),
          chat.isActive !== false,
          chat.createdAt || nowIso(),
          nowIso(),
        ]
      );
      chatsUpserted += 1;
    }

    let messagesUpserted = 0;
    for (const message of messages) {
      if (!chatById.has(message.chatId)) continue;
      await client.query(
        `INSERT INTO cazi.messages (
          id, chat_id, sender_id, sender_name, sender_type, message, message_type, order_data, is_read, timestamp
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10)
        ON CONFLICT (id) DO UPDATE SET
          chat_id = EXCLUDED.chat_id,
          sender_id = EXCLUDED.sender_id,
          sender_name = EXCLUDED.sender_name,
          sender_type = EXCLUDED.sender_type,
          message = EXCLUDED.message,
          message_type = EXCLUDED.message_type,
          order_data = EXCLUDED.order_data,
          is_read = EXCLUDED.is_read,
          timestamp = EXCLUDED.timestamp`,
        [
          message.id,
          message.chatId,
          message.senderId,
          message.senderName || null,
          message.senderType || 'buyer',
          message.message || '',
          message.messageType || 'text',
          message.orderData ? JSON.stringify(message.orderData) : null,
          Boolean(message.isRead),
          message.timestamp || nowIso(),
        ]
      );
      messagesUpserted += 1;
    }

    let reviewsUpserted = 0;
    for (const review of reviews) {
      const orderIdValid = review.orderId && orderById.has(review.orderId) ? review.orderId : null;
      await client.query(
        `INSERT INTO cazi.reviews (
          id, food_id, buyer_id, seller_id, order_id, food_name, buyer_name, seller_name,
          buyer_avatar, rating, comment, images, helpful_count, report_count,
          is_verified_purchase, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17)
        ON CONFLICT (id) DO UPDATE SET
          food_id = EXCLUDED.food_id,
          buyer_id = EXCLUDED.buyer_id,
          seller_id = EXCLUDED.seller_id,
          order_id = EXCLUDED.order_id,
          food_name = EXCLUDED.food_name,
          buyer_name = EXCLUDED.buyer_name,
          seller_name = EXCLUDED.seller_name,
          buyer_avatar = EXCLUDED.buyer_avatar,
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          images = EXCLUDED.images,
          helpful_count = EXCLUDED.helpful_count,
          report_count = EXCLUDED.report_count,
          is_verified_purchase = EXCLUDED.is_verified_purchase,
          updated_at = EXCLUDED.updated_at`,
        [
          review.id,
          review.foodId,
          review.buyerId,
          review.sellerId,
          orderIdValid,
          review.foodName || null,
          review.buyerName || null,
          review.sellerName || null,
          review.buyerAvatar || null,
          clampRating(review.rating),
          review.comment || '',
          JSON.stringify(review.images || []),
          Number(review.helpfulCount || 0),
          Number(review.reportCount || 0),
          Boolean(review.isVerifiedPurchase),
          review.createdAt || nowIso(),
          review.updatedAt || nowIso(),
        ]
      );
      reviewsUpserted += 1;
    }

    // Minimal defaults for phase-2/3 tables.
    for (const user of allUsers) {
      await client.query(
        `INSERT INTO cazi.user_settings (user_id, language, country_code, theme_preference, notifications_enabled, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.uid, 'tr', 'TR', 'system', true, nowIso()]
      );
      await client.query(
        `INSERT INTO cazi.wallet_accounts (
          user_id, balance, pending_earnings, available_earnings, total_lifetime_earnings, total_lifetime_spent, updated_at
        ) VALUES ($1,0,0,0,0,0,$2)
        ON CONFLICT (user_id) DO NOTHING`,
        [user.uid, nowIso()]
      );
    }

    await client.query('COMMIT');

    console.log('✅ Sample seed completed');
    console.log(
      JSON.stringify(
        {
          usersUpserted,
          syntheticUsers: syntheticUsers.length,
          foodsUpserted,
          syntheticFoods: syntheticFoods.length,
          ordersUpserted,
          chatsUpserted,
          messagesUpserted,
          reviewsUpserted,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((error) => {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
});
