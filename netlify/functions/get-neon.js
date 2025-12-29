const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const useSsl = Boolean(connectionString && /sslmode=require|ssl=true|:5432\/.+sslmode=require/i.test(connectionString));
const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const res = await pool.query('select id, name, email, page, created_at from clicks order by created_at desc limit 1000');
    return { statusCode: 200, body: JSON.stringify(res.rows) };
  } catch (err) {
    console.error('get-neon error', err);
    return { statusCode: 500, body: String(err) };
  }
};
