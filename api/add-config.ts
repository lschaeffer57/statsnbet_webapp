import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type { AuthFormValues, UserDocument, UserInfo } from '@/types';

const parseNumericValue = (value: string): number => {
  const cleanedValue = value.replace(/[^\d.,-]/g, '');
  const normalizedValue = cleanedValue.replace(',', '.');
  return parseFloat(normalizedValue);
};

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

    const {
      clerkId,
      configNumber,
      performanceParameters,
      userInfo,
    }: {
      clerkId: string;
      configNumber: number;
      performanceParameters: AuthFormValues;
      userInfo: UserInfo;
    } = req.body;

    if (!clerkId || !performanceParameters || !configNumber || !userInfo) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: [
          'clerkId',
          'performanceParameters',
          'userInfo',
          'configNumber',
        ],
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

    const existingConfig = await db
      .collection<UserDocument>(collectionName)
      .findOne({ clerk_id: clerkId, config_number: configNumber });

    if (existingConfig) {
      return res.status(409).json({
        error:
          'Configuration already exists. Cannot modify existing configurations',
      });
    }

    await db
      .collection<UserDocument>(collectionName)
      .updateMany({ clerk_id: clerkId }, { $set: { active_config: false } });

    const newConfig: UserDocument = {
      clerk_id: clerkId,
      email: userInfo.email,
      username: userInfo.username,
      ...(userInfo.telegram && { telegram: userInfo.telegram }),
      bot_activated: userInfo.bot_activated,
      active_config: true,
      config_number: configNumber,
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
      percentage: performanceParameters.betIn === 'pct',
      markets: performanceParameters.market,
      bookmakers: performanceParameters.bookmaker,
      bankroll_reference: bankroll,
      updated_at: new Date(),
      created_at: new Date(),
      bankroll_current: userInfo.bankroll_current,
      subscription: {
        active: userInfo.subscription.active,
        begin: userInfo.subscription.begin,
        end: userInfo.subscription.end,
      },
    };

    const result = await db
      .collection<UserDocument>(collectionName)
      .insertOne(newConfig);

    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Failed to create configuration' });
    }

    return res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: {
        clerk_id: clerkId,
        config_number: configNumber,
        created_at: newConfig.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return res.status(500).json({
      error: 'Failed to create configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
