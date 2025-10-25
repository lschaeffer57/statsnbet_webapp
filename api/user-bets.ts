import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type { ChartData, DailyStats } from '@/types';

interface MongoFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id?: { $not: any };
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

    const userId = getStringValue(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

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

    const filter: MongoFilter = {
      _id: { $not: /summary/i },
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

    if (periodStart || periodEnd) {
      if (periodStart && periodEnd) {
        filter.date = { $gte: periodStart, $lte: periodEnd };
      } else if (periodStart) {
        filter.date = { $gte: periodStart };
      } else if (periodEnd) {
        filter.date = { $lte: periodEnd };
      }
    }

    const bets = await client
      .db('userhistory')
      .collection(userId)
      .find(filter)
      .sort({ sent_at: -1 })
      .allowDiskUse(true)
      .toArray();

    const chartData: ChartData[] = [];
    let cumulativeRealGain = 0;
    let cumulativeTheoreticalGain = 0;
    let totalStakes = 0;
    let totalBets = 0;

    [...bets].reverse().forEach((bet) => {
      const theoreticalGain =
        bet.theoretical_gain ?? (bet.stake / 100) * bet.ev;

      const result = Math.random() < 0.5 ? 0 : 1;

      const realGainForBet =
        result === 1
          ? (bet.stake || 0) * (bet.odds || 1) - (bet.stake || 0)
          : -(bet.stake || 0);

      cumulativeRealGain += realGainForBet;
      cumulativeTheoreticalGain += theoreticalGain;
      totalStakes += bet.stake || 0;
      totalBets += 1;

      const betDate = new Date(bet.sent_at);
      if (!isNaN(betDate.getTime())) {
        chartData.push({
          date: bet.sent_at,
          betNumber: totalBets,
          realGain: cumulativeRealGain,
          theoreticalGain: cumulativeTheoreticalGain,
        });
      }
    });

    const groupedByDate = bets.reduce(
      (acc, bet) => {
        const betDate = new Date(bet.sent_at);
        if (isNaN(betDate.getTime())) {
          return acc;
        }

        const date: string = betDate.toISOString().split('T')[0];

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
      (a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        return dateA.getTime() - dateB.getTime();
      },
    );

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    const monthlyBets = bets.filter((bet) => {
      const betDate = new Date(bet.sent_at);
      if (isNaN(betDate.getTime())) {
        return false;
      }
      return betDate >= startOfMonth && betDate <= endOfMonth;
    });

    let monthlyGain = 0;
    monthlyBets.forEach((bet) => {
      const result = Math.random() < 0.5 ? 0 : 1;
      const realGainForBet =
        result === 1
          ? (bet.stake || 0) * (bet.odds || 1) - (bet.stake || 0)
          : -(bet.stake || 0);
      monthlyGain += realGainForBet;
    });

    let bankrollAtStartOfMonth = 0;
    if (monthlyBets.length > 0) {
      const firstBetDateObj = new Date(monthlyBets[monthlyBets.length - 1].sent_at);
      if (!isNaN(firstBetDateObj.getTime())) {
        const firstBetDate = firstBetDateObj.toISOString().split('T')[0];
        bankrollAtStartOfMonth =
          chartData.find((entry) =>
            Array.isArray(entry.date)
              ? entry.date[0].startsWith(firstBetDate)
              : entry.date.startsWith(firstBetDate),
          )?.realGain ?? 0;
      }
    }

    return res.status(200).json({
      bets,
      chartData,
      dailyStats,
      totalGain: cumulativeRealGain,
      totalStakes,
      totalBets,
      monthlyGain,
      bankrollAtStartOfMonth,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch user bets',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
