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

const dishTemplates = [
  {
    name: 'Manti',
    category: 'Ana Yemek',
    description: 'Traditional Turkish dumplings with yogurt and butter sauce.',
    ingredients: ['Un', 'Kiyma', 'Yogurt', 'Sarimsak'],
    allergens: ['Gluten', 'Milk'],
  },
  {
    name: 'Sarma',
    category: 'Ana Yemek',
    description: 'Hand-rolled vine leaves with aromatic rice and herbs.',
    ingredients: ['Yaprak', 'Pirinç', 'Sogan', 'Zeytinyagi'],
    allergens: [],
  },
  {
    name: 'Dolma',
    category: 'Ana Yemek',
    description: 'Stuffed vegetables prepared with home-style Turkish seasoning.',
    ingredients: ['Biber', 'Pirinç', 'Sogan', 'Domates'],
    allergens: [],
  },
  {
    name: 'Icli Kofte',
    category: 'Ana Yemek',
    description: 'Crispy bulgur shell with seasoned minced filling.',
    ingredients: ['Ince Bulgur', 'Kiyma', 'Sogan', 'Ceviz'],
    allergens: ['Gluten', 'Nuts'],
  },
  {
    name: 'Perde Pilav',
    category: 'Ana Yemek',
    description: 'Festive baked rice dish wrapped in pastry.',
    ingredients: ['Pirinç', 'Tavuk', 'Badem', 'Hamur'],
    allergens: ['Gluten', 'Nuts'],
  },
  {
    name: 'Borek',
    category: 'Kahvaltı',
    description: 'Freshly baked layered pastry with savory filling.',
    ingredients: ['Yufka', 'Beyaz Peynir', 'Yumurta'],
    allergens: ['Gluten', 'Milk', 'Egg'],
  },
];

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const foodsResult = await client.query(
      'SELECT id, data FROM foods ORDER BY created_at ASC, id ASC'
    );

    let updated = 0;

    for (let i = 0; i < foodsResult.rowCount; i += 1) {
      const row = foodsResult.rows[i];
      const current = row.data && typeof row.data === 'object' ? { ...row.data } : {};
      const dish = dishTemplates[i % dishTemplates.length];

      const nextData = {
        ...current,
        name: dish.name,
        category: dish.category,
        description: dish.description,
        cardSummary: `${dish.name} - populer Turk mutfagi`,
        ingredients: dish.ingredients,
        allergens: dish.allergens,
        country: 'Turk Mutfagi',
        kitchenName: 'Turk Mutfagi',
        updatedAt: new Date().toISOString(),
      };

      await client.query(
        `UPDATE foods
         SET category = $1,
             updated_at = NOW(),
             data = $2::jsonb
         WHERE id = $3`,
        [dish.category, JSON.stringify(nextData), row.id]
      );
      updated += 1;
    }

    const byNameResult = await client.query(
      `SELECT data->>'name' AS dish, COUNT(*)::int AS count
       FROM foods
       GROUP BY data->>'name'
       ORDER BY count DESC, dish ASC`
    );

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          foodsChecked: foodsResult.rowCount,
          foodsUpdated: updated,
          distribution: byNameResult.rows,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('update-foods-popular-turkish failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
