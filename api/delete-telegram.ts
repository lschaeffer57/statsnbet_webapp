import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { clerkId } = req.body;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  if (!clerkId) {
    return res.status(400).json({
      error: 'Missing required field',
      required: ['clerkId'],
    });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db('Client_Data');
    const collectionName = clerkId;

    const result = await db.collection(collectionName).updateOne(
      { clerk_id: clerkId, config_number: 1 },
      {
        $unset: { telegram: 1 },
      },
    );

    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Failed to remove Telegram data' });
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Telegram account disconnected successfully',
      data: {
        clerkId,
        disconnectedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to disconnect Telegram account' });
  } finally {
    await client.close();
  }
}
