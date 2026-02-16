const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: '.env.local' });
dotenv.config();

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

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

const readMigrations = () => {
  const entries = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  return entries.map((name) => ({
    name,
    sql: fs.readFileSync(path.join(MIGRATIONS_DIR, name), 'utf-8'),
  }));
};

const ensureMigrationTable = async (client) => {
  await client.query('CREATE SCHEMA IF NOT EXISTS cazi');
  await client.query(`
    CREATE TABLE IF NOT EXISTS cazi.schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const getApplied = async (client) => {
  const result = await client.query('SELECT filename FROM cazi.schema_migrations');
  return new Set(result.rows.map((row) => row.filename));
};

const applyMigration = async (client, migration) => {
  await client.query('BEGIN');
  try {
    await client.query(migration.sql);
    await client.query(
      'INSERT INTO cazi.schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
      [migration.name]
    );
    await client.query('COMMIT');
    console.log(`✅ Applied ${migration.name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`${migration.name}: ${error.message}`);
  }
};

const run = async () => {
  const client = await pool.connect();
  try {
    await ensureMigrationTable(client);
    const applied = await getApplied(client);
    const migrations = readMigrations();

    for (const migration of migrations) {
      if (applied.has(migration.name)) {
        console.log(`⏭️  Skipped ${migration.name} (already applied)`);
        continue;
      }
      await applyMigration(client, migration);
    }

    console.log('🎉 Migration run completed');
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((error) => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});
