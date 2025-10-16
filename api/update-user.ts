import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type { AuthFormValues, UserDocument } from '../src/types';

const parseNumericValue = (value: string): number => {
  const cleanedValue = value.replace(/[^\d.,-]/g, '');
  const normalizedValue = cleanedValue.replace(',', '.');
  return parseFloat(normalizedValue);
};

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

    const {
      clerkId,
      configNumber,
      performanceParameters,
    }: {
      clerkId: string;
      configNumber: number;
      performanceParameters: Omit<AuthFormValues, 'betIn'>;
    } = req.body;

    if (!clerkId || !performanceParameters || !configNumber) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clerkId', 'performanceParameters'],
      });
    }

    if (typeof clerkId !== 'string' || clerkId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid clerkId' });
    }

    const evMin = parseNumericValue(performanceParameters.evMin);
    const trj = parseNumericValue(performanceParameters.trj);
    const minCost = parseNumericValue(performanceParameters.minCost);
    const maxCost = parseNumericValue(performanceParameters.maxCost);
    const minLiquidity = parseNumericValue(performanceParameters.minLiquidity);
    const bankroll = parseNumericValue(performanceParameters.bankroll);

    if (
      isNaN(evMin) ||
      isNaN(trj) ||
      isNaN(minCost) ||
      isNaN(maxCost) ||
      isNaN(minLiquidity) ||
      isNaN(bankroll)
    ) {
      return res.status(400).json({
        error: 'Invalid numeric values in performance parameters',
        details: 'All numeric fields must be valid numbers',
      });
    }

    const db = client.db('Client_Data');
    const collectionName = clerkId;

    await db
      .collection(collectionName)
      .updateMany({ clerk_id: clerkId }, { $set: { active_config: false } });

    const updateData: Partial<UserDocument> = {
      active_config: true,
      ev_min_pct: evMin,
      trj_pct: trj,
      odds: {
        min: minCost,
        max: maxCost,
      },
      min_liquidity: minLiquidity,
      send_window: {
        start: performanceParameters.time.start,
        end: performanceParameters.time.end,
      },
      bet_types: performanceParameters.betType,
      sports: performanceParameters.sport,
      markets: performanceParameters.market,
      bookmakers: performanceParameters.bookmaker,
      bankroll_reference: bankroll,
      updated_at: new Date(),
    };

    const result = await db
      .collection(collectionName)
      .updateOne(
        { clerk_id: clerkId, config_number: configNumber },
        { $set: updateData },
      );

    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with clerkId ${clerkId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        clerk_id: clerkId,
        updated_at: updateData.updated_at,
        updatedFields: Object.keys(updateData).filter(
          (key) => key !== 'updated_at',
        ),
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
