import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import { type ChartData, type DailyStats } from '../src/types';

interface MongoFilter {
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  $and?: Array<Record<string, Record<string, unknown>>>;
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
  sent_at?: {
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

    try {
      await client.db('bilan').collection('Bilan').createIndex(
        {
          sent_at: -1,
          match: 1,
          bookmaker: 1,
          sport: 1,
          market: 1,
          odds: 1,
          stake: 1,
          ev: 1,
        },
        { background: true },
      );
    } catch (indexError) {
      console.log(
        'Index creation skipped:',
        indexError instanceof Error ? indexError.message : 'Unknown error',
      );
    }

    const getStringValue = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) {
        return value.join(',');
      }
      return value || '';
    };

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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const filter: MongoFilter = {
      sent_at: { $gte: sixMonthsAgo },
      $and: [
        { stake: { $ne: 0 } },
        { stake: { $ne: null } },
        { stake: { $exists: true } },
        { stake: { $type: 'number' } },
        { odds: { $ne: 0 } },
        { odds: { $ne: null } },
        { odds: { $exists: true } },
        { odds: { $type: 'number' } },
        { ev: { $ne: 0 } },
        { ev: { $ne: null } },
        { ev: { $exists: true } },
        { ev: { $type: 'number' } },
      ],
    };

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

    const bets = await client
      .db('bilan')
      .collection('Bilan')
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              sent_at: '$sent_at',
              match: '$match',
              bookmaker: '$bookmaker',
              sport: '$sport',
              market: '$market',
              odds: '$odds',
              stake: '$stake',
              ev: '$ev',
            },
            doc: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$doc' } },
        {
          $addFields: {
            dayDate: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$sent_at',
              },
            },
          },
        },
        {
          $group: {
            _id: '$dayDate',
            bets: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            _id: 1,
            bets: { $slice: ['$bets', 20] },
          },
        },
        { $unwind: '$bets' },
        { $replaceRoot: { newRoot: '$bets' } },
        { $sort: { sent_at: -1 } },
      ])
      .toArray();

    const chartData: ChartData[] = [];
    let cumulativeRealGain = 0;
    let cumulativeTheoreticalGain = 0;

    [...bets].reverse().forEach((bet, index) => {
      const theoreticalGain =
        bet.theoretical_gain ?? (bet.stake / 100) * bet.ev;

      const result = Math.random() < 0.5 ? 0 : 1;

      const realGainForBet =
        result === 1
          ? (bet.stake || 0) * (bet.odds || 1) - (bet.stake || 0)
          : -(bet.stake || 0);

      cumulativeRealGain += realGainForBet;
      cumulativeTheoreticalGain += theoreticalGain;

      chartData.push({
        date: bet.sent_at,
        betNumber: index + 1,
        realGain: cumulativeRealGain,
        theoreticalGain: cumulativeTheoreticalGain,
      });
    });

    const groupedByDate = bets.reduce(
      (acc, bet) => {
        const date = new Date(bet.sent_at).toISOString().split('T')[0];

        if (!acc[date]) {
          acc[date] = {
            date,
            lossTotal: 0,
            gainTotal: 0,
            betCount: 0,
          };
        }

        const result = Math.random() < 0.5 ? 0 : 1;

        const realGainForBet =
          result === 1
            ? (bet.stake || 0) * (bet.odds || 1) - (bet.stake || 0)
            : -(bet.stake || 0);

        if (realGainForBet >= 0) {
          acc[date].gainTotal += realGainForBet;
        } else {
          acc[date].lossTotal += Math.abs(realGainForBet);
        }

        acc[date].betCount += 1;

        return acc;
      },
      {} as Record<string, DailyStats>,
    );

    const dailyStats = Object.values(groupedByDate).sort(
      (a: DailyStats, b: DailyStats) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return res.status(200).json({
      bets,
      chartData,
      dailyStats,
      totalGain: cumulativeRealGain,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch recent bets',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
