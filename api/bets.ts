import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

interface MongoFilter {
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  configuration?: string;
  liquidity?: {
    $gte?: number;
    $lte?: number;
  };
  payout_rate?: {
    $gte?: number;
    $lte?: number;
  };
  ev?: {
    $gte?: number;
    $lte?: number;
  };
  sport?: string;
  market?: string;
  bookmaker?: string;
  date?: {
    $gte?: string | Date;
    $lte?: string | Date;
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

    const page = getStringValue(req.query.page) || '1';
    const limit = getStringValue(req.query.limit) || '10';
    const search = getStringValue(req.query.search);
    const configuration = getStringValue(req.query.configuration);

    const liquidityMin = getStringValue(req.query.liquidityMin);
    const liquidityMax = getStringValue(req.query.liquidityMax);

    const payoutRateMin = getStringValue(req.query.payoutRateMin);
    const payoutRateMax = getStringValue(req.query.payoutRateMax);

    const evMin = getStringValue(req.query.evMin);
    const evMax = getStringValue(req.query.evMax);

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

    if (liquidityMin || liquidityMax) {
      filter.liquidity = {};
      if (liquidityMin) filter.liquidity.$gte = Number(liquidityMin);
      if (liquidityMax) filter.liquidity.$lte = Number(liquidityMax);
    }

    if (payoutRateMin || payoutRateMax) {
      filter.payout_rate = {};
      if (payoutRateMin) filter.payout_rate.$gte = Number(payoutRateMin);
      if (payoutRateMax) filter.payout_rate.$lte = Number(payoutRateMax);
    }

    if (evMin || evMax) {
      filter.ev = {};
      if (evMin) filter.ev.$gte = Number(evMin);
      if (evMax) filter.ev.$lte = Number(evMax);
    }

    if (sport) filter.sport = sport;
    if (market) filter.market = market;
    if (bookmaker) filter.bookmaker = bookmaker;

    if (periodStart || periodEnd) {
      if (periodStart && periodEnd) {
        filter.date = { $gte: periodStart, $lte: periodEnd };
      } else if (periodStart) {
        filter.date = { $gte: periodStart };
      } else if (periodEnd) {
        filter.date = { $lte: periodEnd };
      }
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
      .sort({ sent_at: -1 })
      .allowDiskUse(true)
      .skip(skip)
      .limit(limitNum)
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
