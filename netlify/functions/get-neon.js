const { createPool } = require('@neondatabase/serverless');

const pool = createPool(process.env.NEON_DATABASE_URL);

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query('select id, name, email, page, created_at from clicks order by created_at desc limit 1000');
      return { statusCode: 200, body: JSON.stringify(res.rows) };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('get-neon error', err);
    return { statusCode: 500, body: String(err) };
  }
};
