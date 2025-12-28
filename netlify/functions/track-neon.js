const { createPool } = require('@neondatabase/serverless');

const pool = createPool(process.env.NEON_DATABASE_URL);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const name = body.name || null;
    const email = body.email || null;
    const page = body.page || null;

    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO clicks (name, email, page, created_at) VALUES ($1, $2, $3, now())',
        [name, email, page]
      );
    } finally {
      client.release();
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('track-neon error', err);
    return { statusCode: 500, body: String(err) };
  }
};
