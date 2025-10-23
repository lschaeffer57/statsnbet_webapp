import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(_: VercelRequest, res: VercelResponse) {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db('Formation');
    const collection = db.collection('Modules');

    const data = await collection.find({}).sort({ moduleId: 1 }).toArray();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch course',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
