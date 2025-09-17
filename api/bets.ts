import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

interface MongoFilter {
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  configuration?: string;
  liquidity?: boolean;
  payout_rate?: boolean;
  ev?: boolean;
  sport?: string;
  market?: string;
  bookmaker?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const getStringValue = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) {
        return value.join(',');
      }
      return value || '';
    };

    const getBooleanValue = (value: string | string[] | undefined): boolean => {
      if (Array.isArray(value)) {
        return value.includes('true');
      }
      return value === 'true';
    };

    const page = getStringValue(req.query.page) || '1';
    const limit = getStringValue(req.query.limit) || '10';
    const search = getStringValue(req.query.search);
    const configuration = getStringValue(req.query.configuration);
    const liquidity = getBooleanValue(req.query.liquidity);
    const payout_rate = getBooleanValue(req.query.payout_rate);
    const ev = getBooleanValue(req.query.ev);
    const sport = getStringValue(req.query.sport);
    const market = getStringValue(req.query.market);
    const bookmaker = getStringValue(req.query.bookmaker);
    const periodStart = getStringValue(req.query.periodStart);
    const periodEnd = getStringValue(req.query.periodEnd);

    const filter: MongoFilter = {};

    if (search) {
      filter.$or = [
        { sport: { $regex: search, $options: 'i' } },
        { bookmaker: { $regex: search, $options: 'i' } },
        { match: { $regex: search, $options: 'i' } },
      ];
    }

    if (configuration) filter.configuration = configuration;
    if (liquidity) filter.liquidity = true;
    if (payout_rate) filter.payout_rate = true;
    if (ev) filter.ev = true;
    if (sport) filter.sport = sport;
    if (market) filter.market = market;
    if (bookmaker) filter.bookmaker = bookmaker;

    if (periodStart || periodEnd) {
      filter.date = {};
      if (periodStart) filter.date.$gte = new Date(periodStart);
      if (periodEnd) filter.date.$lte = new Date(periodEnd);
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await client
      .db('bilan')
      .collection('Bilan')
      .countDocuments(filter);

    const bets = await client
      .db('bilan')
      .collection('Bilan')
      .find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ sent_at: -1 })
      .toArray();

    return res.status(200).json({
      data: bets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch bets',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
