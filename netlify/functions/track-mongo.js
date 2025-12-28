const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'app';
const collName = process.env.MONGODB_COLLECTION || 'clicks';

if (!uri) console.error('Missing MONGODB_URI environment variable');

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const client = await clientPromise;
    const db = client.db(dbName);
    const col = db.collection(collName);

    const doc = {
      name: body.name || null,
      email: body.email || null,
      page: body.page || null,
      created_at: new Date()
    };

    await col.insertOne(doc);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('track-mongo error', err);
    return { statusCode: 500, body: String(err) };
  }
};
