import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const { clerkId, configNumber } = req.body;

  if (!clerkId || configNumber === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('Client_Data');
    const collection = db.collection(clerkId);

    // Prevent deleting the only remaining configuration
    const count = await collection.countDocuments();
    if (count <= 1) {
      return res
        .status(400)
        .json({ error: 'Cannot delete the only configuration' });
    }

    const result = await collection.deleteOne({
      clerk_id: clerkId,
      config_number: configNumber,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // If we deleted the active config, make the most recent one active
    const hasActive = await collection.findOne({ active_config: true });
    if (!hasActive) {
      const mostRecent = await collection.findOne(
        {},
        { sort: { created_at: -1 } },
      );
      if (mostRecent) {
        await collection.updateOne(
          { _id: mostRecent._id },
          { $set: { active_config: true } },
        );
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting config:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
