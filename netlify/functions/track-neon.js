const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const name = body.name || null;
    const email = body.email || null;
    const page = body.page || null;

    const res = await pool.query(
      'INSERT INTO clicks (name, email, page, created_at) VALUES ($1, $2, $3, now()) RETURNING id',
      [name, email, page]
    );

    return { statusCode: 200, body: JSON.stringify({ success: true, id: res.rows[0].id }) };
  } catch (err) {
    console.error('track-neon error', err);
    return { statusCode: 500, body: String(err) };
  }
};
