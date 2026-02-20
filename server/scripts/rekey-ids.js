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

const toTimestampPart = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return String(safe.getTime());
};

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

const buildUserIdBase = (prefix, fullName, displayName, createdAt) => {
  const source = String(fullName || '').trim() || String(displayName || '').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const firstName = sanitizeIdPart(parts[0] || 'user', 'user');
  const surname = sanitizeIdPart(parts[parts.length - 1] || 'user', 'user');
  return `${prefix}_${firstName}_${surname}_${toTimestampPart(createdAt)}`;
};

const buildFoodIdBase = (cookId, createdAt) => {
  const normalizedCookId = sanitizeIdPart(cookId, 'unknown');
  const cookBase = normalizedCookId.replace(/_\d{10,13}(?:_\d+)?$/, '') || 'unknown';
  return `${cookBase}_${toTimestampPart(createdAt)}`;
};

const makeUnique = (base, used) => {
  let candidate = base;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${base}_${i}`;
    i += 1;
  }
  used.add(candidate);
  return candidate;
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const rewriteDeep = (input, userMap, foodMap) => {
  if (Array.isArray(input)) {
    return input.map((item) => rewriteDeep(item, userMap, foodMap));
  }
  if (!input || typeof input !== 'object') return input;

  const obj = input;
  const out = {};

  for (const [key, rawValue] of Object.entries(obj)) {
    let value = rawValue;
    if (value && typeof value === 'object') {
      out[key] = rewriteDeep(value, userMap, foodMap);
      continue;
    }

    if (typeof value === 'string') {
      const lowerKey = key.toLowerCase();
      const userHint =
        lowerKey === 'uid' ||
        lowerKey.endsWith('userid') ||
        lowerKey.endsWith('_user_id') ||
        lowerKey.includes('buyerid') ||
        lowerKey.includes('sellerid') ||
        lowerKey.includes('cookid') ||
        lowerKey.includes('senderid') ||
        lowerKey.includes('owneruserid');
      const foodHint =
        lowerKey === 'foodid' ||
        lowerKey.endsWith('_food_id') ||
        lowerKey.includes('foodid');

      if ((userHint || lowerKey === 'id') && userMap.has(value)) {
        value = userMap.get(value);
      } else if ((foodHint || lowerKey === 'id') && foodMap.has(value)) {
        value = foodMap.get(value);
      }

      if (lowerKey === 'relatedentityid') {
        const relatedType = String(obj.relatedEntityType || '').toLowerCase();
        if ((relatedType.includes('user') || relatedType.includes('seller')) && userMap.has(value)) {
          value = userMap.get(value);
        }
        if (relatedType.includes('food') && foodMap.has(value)) {
          value = foodMap.get(value);
        }
      }
    }

    out[key] = value;
  }

  return out;
};

const tableExists = async (client, tableName) => {
  const result = await client.query(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = current_schema()
         AND table_name = $1
     ) AS exists`,
    [tableName]
  );
  return Boolean(result.rows[0]?.exists);
};

const getTableColumns = async (client, tableName) => {
  const result = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = current_schema()
       AND table_name = $1`,
    [tableName]
  );
  return new Set(result.rows.map((row) => row.column_name));
};

const applyIdMapOnColumn = async (client, tableName, columnName, map) => {
  if (!map.size) return 0;
  let updated = 0;
  for (const [oldId, newId] of map.entries()) {
    if (oldId === newId) continue;
    const result = await client.query(
      `UPDATE ${tableName} SET ${columnName} = $1 WHERE ${columnName} = $2`,
      [newId, oldId]
    );
    updated += result.rowCount || 0;
  }
  return updated;
};

const rewriteJsonColumn = async (client, tableName, idColumn, jsonColumn, userMap, foodMap) => {
  const rows = await client.query(`SELECT ${idColumn}, ${jsonColumn} FROM ${tableName}`);
  let changed = 0;
  for (const row of rows.rows) {
    const original = row[jsonColumn];
    if (!original || typeof original !== 'object') continue;
    const next = rewriteDeep(deepClone(original), userMap, foodMap);
    if (JSON.stringify(next) === JSON.stringify(original)) continue;
    await client.query(
      `UPDATE ${tableName} SET ${jsonColumn} = $1::jsonb WHERE ${idColumn} = $2`,
      [JSON.stringify(next), row[idColumn]]
    );
    changed += 1;
  }
  return changed;
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!(await tableExists(client, 'users')) || !(await tableExists(client, 'foods'))) {
      throw new Error('Required tables `users` and `foods` were not found in current schema.');
    }

    const userRowsResult = await client.query(
      'SELECT uid, user_type, created_at, data FROM users ORDER BY created_at ASC, uid ASC'
    );
    const userRows = userRowsResult.rows;

    const userMap = new Map();
    const usedUserIds = new Set();
    for (const row of userRows) {
      const type = String(row.user_type || '').toLowerCase();
      const prefix = ['seller', 'both'].includes(type) ? 's' : 'b';
      const data = row.data || {};
      const base = buildUserIdBase(prefix, data.fullName || '', data.displayName || '', data.createdAt || row.created_at);
      const next = makeUnique(base, usedUserIds);
      userMap.set(row.uid, next);
    }

    const foodRowsResult = await client.query(
      'SELECT id, cook_id, created_at, data FROM foods ORDER BY created_at ASC, id ASC'
    );
    const foodRows = foodRowsResult.rows;
    const foodMap = new Map();
    const usedFoodIds = new Set();
    for (const row of foodRows) {
      const data = row.data || {};
      const mappedCookId = userMap.get(row.cook_id) || row.cook_id;
      const base = buildFoodIdBase(mappedCookId, data.createdAt || row.created_at);
      const next = makeUnique(base, usedFoodIds);
      foodMap.set(row.id, next);
    }

    // Two-phase user PK update to avoid unique collisions.
    const userTempMap = new Map();
    let userTempCounter = 1;
    for (const [oldId, newId] of userMap.entries()) {
      if (oldId === newId) continue;
      const temp = `tmp_user_${userTempCounter}`;
      userTempCounter += 1;
      await client.query('UPDATE users SET uid = $1 WHERE uid = $2', [temp, oldId]);
      userTempMap.set(oldId, temp);
    }
    for (const [oldId, tempId] of userTempMap.entries()) {
      await client.query('UPDATE users SET uid = $1 WHERE uid = $2', [userMap.get(oldId), tempId]);
    }

    // Two-phase food PK update to avoid unique collisions.
    const foodTempMap = new Map();
    let foodTempCounter = 1;
    for (const [oldId, newId] of foodMap.entries()) {
      if (oldId === newId) continue;
      const temp = `tmp_food_${foodTempCounter}`;
      foodTempCounter += 1;
      await client.query('UPDATE foods SET id = $1 WHERE id = $2', [temp, oldId]);
      foodTempMap.set(oldId, temp);
    }
    for (const [oldId, tempId] of foodTempMap.entries()) {
      await client.query('UPDATE foods SET id = $1 WHERE id = $2', [foodMap.get(oldId), tempId]);
    }

    // Scalar columns.
    const tablesToUpdate = [
      { table: 'foods', cols: ['cook_id'] },
      { table: 'orders', cols: ['buyer_id', 'seller_id'] },
      { table: 'chats', cols: ['buyer_id', 'seller_id'] },
      { table: 'messages', cols: ['sender_id'] },
      { table: 'reviews', cols: ['food_id', 'buyer_id', 'seller_id'] },
      { table: 'favorites', cols: ['user_id', 'food_id'] },
      { table: 'user_addresses', cols: ['user_id'] },
      { table: 'wallets', cols: ['user_id'] },
      { table: 'media_assets', cols: ['owner_user_id'] },
    ];

    const columnUpdateCounts = {};
    for (const entry of tablesToUpdate) {
      if (!(await tableExists(client, entry.table))) continue;
      const columns = await getTableColumns(client, entry.table);
      for (const col of entry.cols) {
        if (!columns.has(col)) continue;
        const map = col.includes('food') ? foodMap : userMap;
        const count = await applyIdMapOnColumn(client, entry.table, col, map);
        columnUpdateCounts[`${entry.table}.${col}`] = count;
      }
    }

    // media_assets.related_entity_id depends on related_entity_type.
    if (await tableExists(client, 'media_assets')) {
      const mediaRows = await client.query(
        'SELECT id, related_entity_type, related_entity_id FROM media_assets WHERE related_entity_id IS NOT NULL'
      );
      for (const row of mediaRows.rows) {
        const type = String(row.related_entity_type || '').toLowerCase();
        let next = row.related_entity_id;
        if ((type.includes('user') || type.includes('seller')) && userMap.has(next)) {
          next = userMap.get(next);
        } else if (type.includes('food') && foodMap.has(next)) {
          next = foodMap.get(next);
        }
        if (next !== row.related_entity_id) {
          await client.query('UPDATE media_assets SET related_entity_id = $1 WHERE id = $2', [next, row.id]);
        }
      }
    }

    // admin_audit_logs entity_id.
    if (await tableExists(client, 'admin_audit_logs')) {
      const auditRows = await client.query('SELECT id, entity_type, entity_id FROM admin_audit_logs');
      for (const row of auditRows.rows) {
        if (!row.entity_id) continue;
        const type = String(row.entity_type || '').toLowerCase();
        let next = row.entity_id;
        if ((type.includes('user') || type.includes('seller')) && userMap.has(next)) {
          next = userMap.get(next);
        } else if (type.includes('food') && foodMap.has(next)) {
          next = foodMap.get(next);
        }
        if (next !== row.entity_id) {
          await client.query('UPDATE admin_audit_logs SET entity_id = $1 WHERE id = $2', [next, row.id]);
        }
      }
    }

    // JSONB columns.
    const jsonTargets = [
      ['users', 'uid', 'data'],
      ['foods', 'id', 'data'],
      ['orders', 'id', 'data'],
      ['chats', 'id', 'data'],
      ['messages', 'id', 'data'],
      ['reviews', 'id', 'data'],
    ];
    const jsonUpdateCounts = {};
    for (const [table, idCol, jsonCol] of jsonTargets) {
      if (!(await tableExists(client, table))) continue;
      const columns = await getTableColumns(client, table);
      if (!columns.has(idCol) || !columns.has(jsonCol)) continue;
      jsonUpdateCounts[`${table}.${jsonCol}`] = await rewriteJsonColumn(
        client,
        table,
        idCol,
        jsonCol,
        userMap,
        foodMap
      );
    }

    if (await tableExists(client, 'admin_audit_logs')) {
      const auditCols = await getTableColumns(client, 'admin_audit_logs');
      if (auditCols.has('id') && auditCols.has('before_json')) {
        jsonUpdateCounts['admin_audit_logs.before_json'] = await rewriteJsonColumn(
          client,
          'admin_audit_logs',
          'id',
          'before_json',
          userMap,
          foodMap
        );
      }
      if (auditCols.has('id') && auditCols.has('after_json')) {
        jsonUpdateCounts['admin_audit_logs.after_json'] = await rewriteJsonColumn(
          client,
          'admin_audit_logs',
          'id',
          'after_json',
          userMap,
          foodMap
        );
      }
    }

    await client.query('COMMIT');

    const summary = {
      sellersRemapped: Array.from(userMap.entries()).filter(([a, b]) => a !== b).length,
      foodsRemapped: Array.from(foodMap.entries()).filter(([a, b]) => a !== b).length,
      columnUpdateCounts,
      jsonUpdateCounts,
    };

    console.log('ID rekey completed:');
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ID rekey failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
