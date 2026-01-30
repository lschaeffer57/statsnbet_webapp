import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const { userId, bookmakerName, rating } = req.body;

    if (!userId || !bookmakerName || rating === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const db = client.db('Client_Data');

    // We update the rating in the active configuration for this user
    const result = await db.collection(userId).updateOne(
      { clerk_id: userId, active_config: true },
      {
        $set: {
          [`ratings.${bookmakerName}`]: rating,
          updated_at: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      // If no active config found, update the first one
      await db.collection(userId).updateOne(
        { clerk_id: userId },
        {
          $set: {
            [`ratings.${bookmakerName}`]: rating,
            updated_at: new Date(),
          },
        },
      );
    }

    return res
      .status(200)
      .json({ success: true, matchedCount: result.matchedCount });
  } catch (error: unknown) {
    console.error('Error saving rating:', error);
    return res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
  } finally {
    await client.close();
  }
}
