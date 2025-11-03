import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type { UserDocument } from '@/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const { clerkId, configNumber }: { clerkId: string; configNumber: number } =
      req.body;

    if (!clerkId || !configNumber) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clerkId', 'configNumber'],
      });
    }

    if (typeof clerkId !== 'string' || clerkId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid clerkId' });
    }

    const db = client.db('Client_Data');
    const collectionName = clerkId;

    const existingConfig = await db
      .collection<UserDocument>(collectionName)
      .findOne({ clerk_id: clerkId, config_number: configNumber });

    if (!existingConfig) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    await db
      .collection<UserDocument>(collectionName)
      .updateMany({ clerk_id: clerkId }, { $set: { active_config: false } });

    const result = await db
      .collection<UserDocument>(collectionName)
      .updateOne(
        { clerk_id: clerkId, config_number: configNumber },
        { $set: { active_config: true, updated_at: new Date() } },
      );

    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Failed to switch configuration' });
    }

    return res.status(200).json({
      success: true,
      message: 'Configuration switched successfully',
      data: {
        clerk_id: clerkId,
        config_number: configNumber,
        switched_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error switching configuration:', error);
    return res.status(500).json({
      error: 'Failed to switch configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
