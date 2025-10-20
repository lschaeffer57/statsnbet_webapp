import type { ChartData, DailyStats, FilteredBet } from '@/types';

export const getChartData = (data: FilteredBet[] | undefined): ChartData[] => {
  if (!data) return [];
  return data.map((bet, index) => ({
    date: bet.date,
    betNumber: index + 1,
    realGain: bet.pnl,
    theoreticalGain: bet.theorical_gain ?? 0,
  }));
};

export const getDailyStats = (
  data: FilteredBet[] | undefined,
): DailyStats[] => {
  if (!data) return [];
  const groupedByDate = data.reduce(
    (acc, bet) => {
      const date = new Date(bet.date).toISOString().split('T')[0];
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
    {} as Record<string, DailyStats>,
  );
  return Object.values(groupedByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};
