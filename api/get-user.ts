import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const { clerkId } = req.query;

  if (!clerkId || typeof clerkId !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid clerkId',
      required: 'clerkId query parameter',
    });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db('Client_Data');
    const collectionName = clerkId;

    const user = await db
      .collection(collectionName)
      .find({ clerk_id: clerkId })
      .toArray();

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with clerkId ${clerkId} not found`,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
