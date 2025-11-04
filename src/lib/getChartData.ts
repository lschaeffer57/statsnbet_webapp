import { format, parse } from 'date-fns';

import type { ChartData, DailyStats, FilteredBet } from '@/types';

export const getChartData = (data: FilteredBet[] | undefined): ChartData[] => {
  if (!data) return [];
  let cumulativeRealGain = 0;
  let cumulativeTheoreticalGain = 0;

  return data.reverse().map((bet, index) => {
    cumulativeRealGain += bet.pnl;
    cumulativeTheoreticalGain += bet.theorical_gain ?? 0;

    return {
      date: bet.date,
      betNumber: index + 1,
      realGain: cumulativeRealGain,
      theoreticalGain: cumulativeTheoreticalGain,
    };
  });
};

export const getDailyStats = (
  data: FilteredBet[] | undefined,
): DailyStats[] => {
  if (!data) return [];
  const groupedByDate = data.reduce(
    (acc, bet) => {
      const parsedDate = parse(bet.date, 'dd/MM/yyyy', new Date());
      const date = format(parsedDate, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          lossTotal: 0,
          gainTotal: 0,
          betCount: 0,
        };
      }
      acc[date].lossTotal += bet.pnl < 0 ? bet.pnl : 0;
      acc[date].gainTotal += bet.pnl > 0 ? bet.pnl : 0;
      acc[date].betCount += 1;
      return acc;
    },
    {} as Record<string, Omit<DailyStats, 'profit' | 'dailyProfit'>>,
  );
  const sorted = Object.values(groupedByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let cumulativeProfit = 0;
  return sorted.map((day) => {
    const dailyProfit = day.gainTotal + day.lossTotal;
    cumulativeProfit += dailyProfit;
    return {
      ...day,
      profit: Number(cumulativeProfit.toFixed(2)),
      dailyProfit: Number(dailyProfit.toFixed(2)),
    };
  });
};
