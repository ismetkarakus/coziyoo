const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: '.env.local' });
dotenv.config();

const shouldUseSsl = String(process.env.PGSSL || '').toLowerCase() === 'true';
const searchPath = process.env.PG_SEARCH_PATH || 'public';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || undefined,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE || undefined,
  user: process.env.PGUSER || undefined,
  password: process.env.PGPASSWORD || undefined,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  options: `-c search_path=${searchPath}`,
});

const sellerNames = [
  { firstName: 'Elif', lastName: 'Aydin', nickname: 'Elifin Mutfagi', city: 'Istanbul' },
  { firstName: 'Mert', lastName: 'Kaya', nickname: 'Mert Usta', city: 'Ankara' },
  { firstName: 'Zeynep', lastName: 'Demir', nickname: 'Demir Sofrasi', city: 'Izmir' },
  { firstName: 'Ahmet', lastName: 'Yilmaz', nickname: 'Anadolu Lezzet', city: 'Bursa' },
  { firstName: 'Selin', lastName: 'Arslan', nickname: 'Selinden Tatlar', city: 'Antalya' },
  { firstName: 'Can', lastName: 'Celik', nickname: 'Celik Ocakbasi', city: 'Adana' },
  { firstName: 'Derya', lastName: 'Sahin', nickname: 'Derya Ev Yemekleri', city: 'Gaziantep' },
  { firstName: 'Burak', lastName: 'Koc', nickname: 'Usta Burak', city: 'Konya' },
  { firstName: 'Nisan', lastName: 'Polat', nickname: 'Nisanin Tenceresi', city: 'Eskisehir' },
  { firstName: 'Emre', lastName: 'Kurt', nickname: 'Kurt Mutfak', city: 'Samsun' },
  { firstName: 'Yasemin', lastName: 'Tas', nickname: 'Yaseminden Lezzetler', city: 'Trabzon' },
  { firstName: 'Baris', lastName: 'Aksoy', nickname: 'Aksoy Sofra', city: 'Kayseri' },
];

const foodTemplates = [
  { name: 'Antep Usulu Icli Kofte', category: 'Ana Yemek', price: 195, ingredients: ['Bulgur', 'Kiyma', 'Ceviz', 'Sogan'], allergens: ['Gluten'] },
  { name: 'Firinda Besamel Soslu Makarna', category: 'Ana Yemek', price: 170, ingredients: ['Makarna', 'Sut', 'Kasar Peyniri'], allergens: ['Gluten', 'Milk'] },
  { name: 'Hatay Tepsi Kebabi', category: 'Ana Yemek', price: 245, ingredients: ['Dana Kiyma', 'Biber', 'Maydanoz'], allergens: [] },
  { name: 'Tereyagli Iskender', category: 'Ana Yemek', price: 265, ingredients: ['Doner', 'Pide', 'Yogurt'], allergens: ['Gluten', 'Milk'] },
  { name: 'Ev Yapimi Mantı', category: 'Ana Yemek', price: 210, ingredients: ['Un', 'Kiyma', 'Yogurt', 'Sarimsak'], allergens: ['Gluten', 'Milk'] },
  { name: 'Karadeniz Pidesi', category: 'Ana Yemek', price: 190, ingredients: ['Hamur', 'Kasar', 'Yumurta'], allergens: ['Gluten', 'Milk', 'Egg'] },
  { name: 'Sebzeli Kisir Tabagi', category: 'Meze', price: 130, ingredients: ['Ince Bulgur', 'Domates', 'Nar Eksisi'], allergens: ['Gluten'] },
  { name: 'Cevizli Muhammara', category: 'Meze', price: 120, ingredients: ['Kirmizi Biber', 'Ceviz', 'Zeytinyagi'], allergens: ['Nuts'] },
  { name: 'Patlican Salatasi', category: 'Meze', price: 115, ingredients: ['Patlican', 'Yogurt', 'Sarimsak'], allergens: ['Milk'] },
  { name: 'Humus Tabagi', category: 'Meze', price: 110, ingredients: ['Nohut', 'Tahin', 'Limon'], allergens: ['Sesame'] },
  { name: 'Yogurtlu Semizotu', category: 'Meze', price: 105, ingredients: ['Semizotu', 'Yogurt'], allergens: ['Milk'] },
  { name: 'Mercimek Corbasi', category: 'Çorba', price: 95, ingredients: ['Kirmizi Mercimek', 'Havuc', 'Sogan'], allergens: [] },
  { name: 'Ezogelin Corbasi', category: 'Çorba', price: 95, ingredients: ['Mercimek', 'Bulgur', 'Nane'], allergens: ['Gluten'] },
  { name: 'Yayla Corbasi', category: 'Çorba', price: 98, ingredients: ['Yogurt', 'Pirinç', 'Nane'], allergens: ['Milk'] },
  { name: 'Domates Corbasi', category: 'Çorba', price: 92, ingredients: ['Domates', 'Tereyagi', 'Un'], allergens: ['Milk', 'Gluten'] },
  { name: 'Sebzeli Tarhana Corbasi', category: 'Çorba', price: 96, ingredients: ['Tarhana', 'Biber', 'Domates'], allergens: ['Gluten'] },
  { name: 'Izgara Tavuk But', category: 'Ana Yemek', price: 175, ingredients: ['Tavuk But', 'Baharat', 'Zeytinyagi'], allergens: [] },
  { name: 'Kori Soslu Tavuk', category: 'Ana Yemek', price: 185, ingredients: ['Tavuk Gogus', 'Krema', 'Kori'], allergens: ['Milk'] },
  { name: 'Etli Nohut', category: 'Ana Yemek', price: 205, ingredients: ['Kuzu Eti', 'Nohut', 'Domates'], allergens: [] },
  { name: 'Tas Kebabi', category: 'Ana Yemek', price: 225, ingredients: ['Dana Eti', 'Patates', 'Sogan'], allergens: [] },
  { name: 'Firinda Kofte Patates', category: 'Ana Yemek', price: 195, ingredients: ['Kiyma', 'Patates', 'Baharat'], allergens: [] },
  { name: 'Izmir Kofte', category: 'Ana Yemek', price: 198, ingredients: ['Kiyma', 'Patates', 'Domates'], allergens: [] },
  { name: 'Zeytinyagli Yaprak Sarma', category: 'Ana Yemek', price: 180, ingredients: ['Yaprak', 'Pirinç', 'Dolguluk Fistik'], allergens: ['Nuts'] },
  { name: 'Etli Yaprak Sarma', category: 'Ana Yemek', price: 210, ingredients: ['Yaprak', 'Kiyma', 'Pirinç'], allergens: [] },
  { name: 'Karnıyarik', category: 'Ana Yemek', price: 190, ingredients: ['Patlican', 'Kiyma', 'Biber'], allergens: [] },
  { name: 'Imam Bayildi', category: 'Ana Yemek', price: 175, ingredients: ['Patlican', 'Sogan', 'Zeytinyagi'], allergens: [] },
  { name: 'Taze Fasulye', category: 'Ana Yemek', price: 160, ingredients: ['Fasulye', 'Domates', 'Sogan'], allergens: [] },
  { name: 'Nohutlu Pilav', category: 'Ana Yemek', price: 145, ingredients: ['Pirinç', 'Nohut', 'Tereyagi'], allergens: ['Milk'] },
  { name: 'Tereyagli Bulgur Pilavi', category: 'Ana Yemek', price: 140, ingredients: ['Bulgur', 'Tereyagi', 'Domates'], allergens: ['Gluten', 'Milk'] },
  { name: 'Firin Sutlac', category: 'Tatlı', price: 105, ingredients: ['Sut', 'Pirinç', 'Seker'], allergens: ['Milk'] },
  { name: 'Supangle', category: 'Tatlı', price: 110, ingredients: ['Sut', 'Kakao', 'Cikolata'], allergens: ['Milk'] },
  { name: 'Magnolia', category: 'Tatlı', price: 120, ingredients: ['Sut', 'Biskuvi', 'Muz'], allergens: ['Milk', 'Gluten'] },
  { name: 'Revani', category: 'Tatlı', price: 98, ingredients: ['Irmik', 'Yumurta', 'Seker'], allergens: ['Egg', 'Gluten'] },
  { name: 'Gullac', category: 'Tatlı', price: 125, ingredients: ['Gullac Yapragi', 'Sut', 'Ceviz'], allergens: ['Milk', 'Nuts'] },
  { name: 'Acili Ezme', category: 'Meze', price: 95, ingredients: ['Domates', 'Biber', 'Maydanoz'], allergens: [] },
  { name: 'Haydari', category: 'Meze', price: 98, ingredients: ['Suzme Yogurt', 'Dereotu', 'Sarimsak'], allergens: ['Milk'] },
  { name: 'Cacik', category: 'Meze', price: 85, ingredients: ['Yogurt', 'Salatalik', 'Nane'], allergens: ['Milk'] },
  { name: 'Rus Salatasi', category: 'Meze', price: 100, ingredients: ['Patates', 'Havuc', 'Mayonez'], allergens: ['Egg'] },
  { name: 'Peynirli Borek', category: 'Kahvaltı', price: 130, ingredients: ['Yufka', 'Beyaz Peynir', 'Yumurta'], allergens: ['Gluten', 'Milk', 'Egg'] },
  { name: 'Patatesli Borek', category: 'Kahvaltı', price: 125, ingredients: ['Yufka', 'Patates', 'Baharat'], allergens: ['Gluten'] },
  { name: 'Menemen', category: 'Kahvaltı', price: 115, ingredients: ['Yumurta', 'Domates', 'Biber'], allergens: ['Egg'] },
  { name: 'Sahanda Yumurta', category: 'Kahvaltı', price: 90, ingredients: ['Yumurta', 'Tereyagi'], allergens: ['Egg', 'Milk'] },
  { name: 'Pogaca Tabaği', category: 'Kahvaltı', price: 110, ingredients: ['Un', 'Maya', 'Peynir'], allergens: ['Gluten', 'Milk'] },
  { name: 'Ton Balikli Salata', category: 'Salata', price: 145, ingredients: ['Ton Baligi', 'Marul', 'Mısır'], allergens: ['Fish'] },
  { name: 'Akdeniz Salata', category: 'Salata', price: 130, ingredients: ['Marul', 'Zeytin', 'Beyaz Peynir'], allergens: ['Milk'] },
  { name: 'Sezar Salata', category: 'Salata', price: 150, ingredients: ['Tavuk', 'Marul', 'Parmesan'], allergens: ['Milk', 'Egg'] },
  { name: 'Kinoali Salata', category: 'Salata', price: 155, ingredients: ['Kinoa', 'Avokado', 'Nar'], allergens: [] },
  { name: 'Limonata', category: 'İçecek', price: 55, ingredients: ['Limon', 'Seker', 'Nane'], allergens: [] },
  { name: 'Ev Yapimi Ayran', category: 'İçecek', price: 45, ingredients: ['Yogurt', 'Su', 'Tuz'], allergens: ['Milk'] },
  { name: 'Naneli Soguk Cay', category: 'İçecek', price: 50, ingredients: ['Cay', 'Nane', 'Limon'], allergens: [] },
];

const sanitizeIdPart = (value, fallback) => {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return normalized || fallback;
};

const buildFoodIdBase = (cookId, createdAt) => {
  const normalizedCookId = sanitizeIdPart(cookId, 'unknown');
  const cookBase = normalizedCookId.replace(/_\d{10,13}(?:_\d+)?$/, '') || 'unknown';
  return `${cookBase}_${new Date(createdAt).getTime()}`;
};

const nextUniqueFoodId = async (client, baseId) => {
  let candidate = baseId;
  let counter = 2;
  while (true) {
    const existing = await client.query('SELECT id FROM foods WHERE id = $1 LIMIT 1', [candidate]);
    if (!existing.rowCount) return candidate;
    candidate = `${baseId}_${counter}`;
    counter += 1;
  }
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sellersResult = await client.query(
      `SELECT uid, email, created_at, data
       FROM users
       WHERE user_type IN ('seller', 'both')
       ORDER BY created_at ASC, uid ASC`
    );

    if (!sellersResult.rowCount) {
      throw new Error('No seller accounts found.');
    }

    const sellers = sellersResult.rows.map((row, index) => {
      const profile = sellerNames[index % sellerNames.length];
      const cycle = Math.floor(index / sellerNames.length);
      const firstName = cycle > 0 ? `${profile.firstName}${cycle + 1}` : profile.firstName;
      const lastName = profile.lastName;
      const fullName = `${firstName} ${lastName}`;
      const nickname = cycle > 0 ? `${profile.nickname} ${cycle + 1}` : profile.nickname;

      return {
        uid: row.uid,
        email: row.email,
        createdAt: row.created_at,
        firstName,
        lastName,
        fullName,
        displayName: fullName,
        nickname,
        city: profile.city,
        data: row.data && typeof row.data === 'object' ? { ...row.data } : {},
      };
    });

    let sellersUpdated = 0;
    for (const seller of sellers) {
      const updatedData = {
        ...seller.data,
        uid: seller.uid,
        email: seller.email,
        firstName: seller.firstName,
        lastName: seller.lastName,
        fullName: seller.fullName,
        displayName: seller.displayName,
        sellerNickname: seller.nickname,
        sellerLocation: seller.city,
        updatedAt: new Date().toISOString(),
      };

      await client.query(
        `UPDATE users
         SET updated_at = NOW(),
             data = $1::jsonb
         WHERE uid = $2`,
        [JSON.stringify(updatedData), seller.uid]
      );
      sellersUpdated += 1;
    }

    const foodsToInsert = 50;
    let foodsInserted = 0;
    const now = Date.now();

    for (let i = 0; i < foodsToInsert; i += 1) {
      const seller = sellers[i % sellers.length];
      const template = foodTemplates[i % foodTemplates.length];
      const createdAt = new Date(now + i * 60000).toISOString();
      const idBase = buildFoodIdBase(seller.uid, createdAt);
      const foodId = await nextUniqueFoodId(client, idBase);
      const price = template.price + randomInt(-8, 12);
      const dailyStock = randomInt(8, 28);
      const currentStock = randomInt(2, dailyStock);
      const hasDelivery = Math.random() > 0.15;
      const hasPickup = true;
      const deliveryFee = hasDelivery ? randomInt(15, 45) : 0;
      const prepMinutes = randomInt(20, 75);

      const payload = {
        id: foodId,
        name: template.name,
        cardSummary: `${seller.nickname} ozel tarifi`,
        description: `${template.name}, ${seller.displayName} tarafindan gunluk taze malzemelerle hazirlanir.`,
        price,
        cookName: seller.displayName,
        cookId: seller.uid,
        sellerId: seller.uid,
        sellerName: seller.displayName,
        category: template.category,
        imageUrl: `https://picsum.photos/seed/coziyoo-food-${encodeURIComponent(foodId)}/600/400`,
        recipe: `${template.name} icin ozel sos ve dengeli baharat kullanilir.`,
        ingredients: template.ingredients,
        allergens: template.allergens,
        preparationTime: prepMinutes,
        prepTime: `${prepMinutes} dk`,
        servingSize: randomInt(1, 4),
        isAvailable: true,
        isActive: true,
        hasPickup,
        hasDelivery,
        availableDeliveryOptions: hasDelivery ? ['pickup', 'delivery'] : ['pickup'],
        deliveryFee,
        currentStock,
        dailyStock,
        distance: `${(Math.random() * 4 + 0.6).toFixed(1)} km`,
        rating: Number((Math.random() * 1.4 + 3.6).toFixed(1)),
        reviewCount: randomInt(2, 80),
        favoriteCount: randomInt(0, 35),
        country: 'TR',
        createdAt,
        updatedAt: createdAt,
      };

      await client.query(
        `INSERT INTO foods (id, cook_id, category, is_available, rating, review_count, created_at, updated_at, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [
          payload.id,
          payload.cookId,
          payload.category,
          true,
          Number(payload.rating || 0),
          Number(payload.reviewCount || 0),
          payload.createdAt,
          payload.updatedAt,
          JSON.stringify(payload),
        ]
      );
      foodsInserted += 1;
    }

    await client.query('COMMIT');
    console.log(
      JSON.stringify(
        {
          sellersFound: sellers.length,
          sellersUpdated,
          foodsInserted,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('seed-sellers-and-foods failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
