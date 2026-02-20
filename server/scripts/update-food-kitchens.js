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

const kitchens = [
  'Türk Mutfağı',
  'İtalyan Mutfağı',
  'Fransız Mutfağı',
  'Japon Mutfağı',
  'Meksika Mutfağı',
  'Hindistan Mutfağı',
  'Çin Mutfağı',
  'Lübnan Mutfağı',
  'Kore Mutfağı',
  'İspanya Mutfağı',
  'Hatay Mutfağı',
  'Trabzon Mutfağı',
  'Maraş Mutfağı',
  'Ege Mutfağı',
  'Akdeniz Mutfağı',
  'Balkan Mutfağı',
  'Karadeniz Mutfağı',
  'Anadolu Mutfağı',
  'Osmanlı Mutfağı',
  'Vegan Dünya Mutfağı',
];

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const foodsResult = await client.query(
      'SELECT id, data, created_at FROM foods ORDER BY created_at ASC, id ASC'
    );

    let updated = 0;

    for (let i = 0; i < foodsResult.rowCount; i += 1) {
      const row = foodsResult.rows[i];
      const data = row.data && typeof row.data === 'object' ? { ...row.data } : {};
      const nextKitchen = kitchens[i % kitchens.length];

      const changed = String(data.country || '') !== nextKitchen;
      if (!changed) continue;

      data.country = nextKitchen;
      data.updatedAt = new Date().toISOString();

      await client.query(
        `UPDATE foods
         SET updated_at = NOW(),
             data = $1::jsonb
         WHERE id = $2`,
        [JSON.stringify(data), row.id]
      );
      updated += 1;
    }

    const distinctResult = await client.query(
      `SELECT data->>'country' AS kitchen, COUNT(*)::int AS count
       FROM foods
       GROUP BY data->>'country'
       ORDER BY count DESC, kitchen ASC`
    );

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          foodsChecked: foodsResult.rowCount,
          foodsUpdated: updated,
          kitchenDistribution: distinctResult.rows,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('update-food-kitchens failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
