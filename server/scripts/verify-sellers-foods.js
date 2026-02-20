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

const run = async () => {
  const client = await pool.connect();
  try {
    const sellers = await client.query(
      `SELECT uid,
              COALESCE(data->>'displayName', data->>'fullName', email) AS display_name,
              COALESCE(data->>'sellerNickname', '') AS nickname
       FROM users
       WHERE user_type IN ('seller', 'both')
       ORDER BY created_at ASC, uid ASC`
    );

    const foodsBySeller = await client.query(
      `SELECT cook_id, COUNT(*)::int AS food_count
       FROM foods
       GROUP BY cook_id
       ORDER BY food_count DESC, cook_id ASC`
    );

    const totalFoods = await client.query('SELECT COUNT(*)::int AS total FROM foods');

    console.log(
      JSON.stringify(
        {
          sellers: sellers.rows,
          foodsBySeller: foodsBySeller.rows,
          totalFoods: Number(totalFoods.rows[0]?.total || 0),
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('verify-sellers-foods failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
