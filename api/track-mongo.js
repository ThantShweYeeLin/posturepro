const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'app';
const collName = process.env.MONGODB_COLLECTION || 'clicks';

if (!uri) console.error('Missing MONGODB_URI');

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  global._mongoClientPromise = client.connect();
}
const clientPromise = global._mongoClientPromise;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const body = req.body && Object.keys(req.body).length ? req.body : JSON.parse(req.rawBody || '{}');
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
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('track-mongo error', err);
    return res.status(500).json({ error: String(err) });
  }
};
