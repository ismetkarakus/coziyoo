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

const PLACEHOLDER = '—';

const normalize = (value) => {
  const text = String(value || '').trim();
  return text ? text : PLACEHOLDER;
};

const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face',
];

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face',
];

const NEUTRAL_AVATARS = [
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=240&h=240&fit=crop&crop=face',
];

const hashString = (value) => {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const normalizeGenderBucket = (gender) => {
  const normalized = String(gender || '').trim().toLowerCase();
  if (['female', 'woman', 'kadin', 'kadın', 'f'].includes(normalized)) return 'female';
  if (['male', 'man', 'erkek', 'm'].includes(normalized)) return 'male';
  return 'neutral';
};

const resolveAvatarUri = (gender, keySeed) => {
  const bucket = normalizeGenderBucket(gender);
  const source = bucket === 'female' ? FEMALE_AVATARS : bucket === 'male' ? MALE_AVATARS : NEUTRAL_AVATARS;
  return source[hashString(keySeed) % source.length];
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query('SELECT uid, birth_date, gender, data FROM users');
    let updated = 0;

    for (const row of result.rows) {
      const data = row.data && typeof row.data === 'object' ? { ...row.data } : {};
      const nextBirthDate = normalize(row.birth_date || data.birthDate);
      const nextGender = normalize(row.gender || data.gender);
      const nextPhone = normalize(data.phone);
      const nextAvatarUri = resolveAvatarUri(nextGender, row.uid || data.email || data.displayName || data.fullName || 'default');

      const hasChanges =
        String(row.birth_date || '') !== nextBirthDate ||
        String(row.gender || '') !== nextGender ||
        String(data.birthDate || '') !== nextBirthDate ||
        String(data.gender || '') !== nextGender ||
        String(data.phone || '') !== nextPhone ||
        String(data.avatarUri || '') !== nextAvatarUri;

      if (!hasChanges) continue;

      data.birthDate = nextBirthDate;
      data.gender = nextGender;
      data.phone = nextPhone;
      data.avatarUri = nextAvatarUri;
      data.updatedAt = new Date().toISOString();

      await client.query(
        `UPDATE users
         SET birth_date = $1,
             gender = $2,
             updated_at = NOW(),
             data = $3::jsonb
         WHERE uid = $4`,
        [nextBirthDate, nextGender, JSON.stringify(data), row.uid]
      );

      updated += 1;
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({ usersChecked: result.rowCount, usersUpdated: updated }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Backfill failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
