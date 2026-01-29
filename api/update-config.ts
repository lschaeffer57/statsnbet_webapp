import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type { AuthFormValues } from '@/types';

const parseNumericValue = (value: string): number => {
  const cleanedValue = value.replace(/[^\d.,-]/g, '');
  const normalizedValue = cleanedValue.replace(',', '.');
  return parseFloat(normalizedValue);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const { clerkId, configNumber, performanceParameters } = req.body;

    if (!clerkId || !configNumber || !performanceParameters) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const pp = performanceParameters as AuthFormValues;
    const db = client.db('Client_Data');

    // Construct update object based on AuthFormValues
    const updateData = {
      ev_min_pct: parseNumericValue(pp.evMin),
      trj_pct: parseNumericValue(pp.trj),
      'odds.min': parseNumericValue(pp.minCost),
      'odds.max': parseNumericValue(pp.maxCost),
      min_liquidity: parseNumericValue(pp.minLiquidity),
      bankroll_reference: parseNumericValue(pp.bankroll),
      'send_window.start': pp.time.start,
      'send_window.end': pp.time.end,
      bet_types: pp.betType,
      sports: pp.sport,
      percentage: pp.betIn === 'pct',
      markets: pp.market,
      bookmakers: pp.bookmaker,
      updated_at: new Date(),
    };

    const result = await db
      .collection(clerkId)
      .updateOne(
        { clerk_id: clerkId, config_number: configNumber },
        { $set: updateData },
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating config:', error);
    return res.status(500).json({ error: 'Update failed' });
  } finally {
    await client.close();
  }
}
