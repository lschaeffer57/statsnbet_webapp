import { format, parse, subDays } from 'date-fns';

import type { ChartData, DailyStats, FilteredBet } from '@/types';

export const getChartData = (data: FilteredBet[] | undefined): ChartData[] => {
  if (!data) return [];
  let cumulativeRealGain = 0;
  let cumulativeTheoreticalGain = 0;

  const reversedData = [...data].reverse();

  const chartData: ChartData[] = [
    {
      date: reversedData.length > 0 ? reversedData[0].date : '',
      betNumber: 0,
      realGain: 0,
      theoreticalGain: 0,
    },
  ];

  reversedData.forEach((bet, index) => {
    cumulativeRealGain += bet.pnl;
    // Theoretical gain = stake * EV / 100
    cumulativeTheoreticalGain += bet.stake * (bet.ev / 100);

    chartData.push({
      date: bet.date,
      betNumber: index + 1,
      realGain: Number(cumulativeRealGain.toFixed(2)),
      theoreticalGain: Number(cumulativeTheoreticalGain.toFixed(2)),
    });
  });

  return chartData;
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
  const firstDate = sorted.length > 0 ? new Date(sorted[0].date) : new Date();
  const initialDate = format(subDays(firstDate, 1), 'yyyy-MM-dd');

  const stats: DailyStats[] = [
    {
      date: initialDate,
      lossTotal: 0,
      gainTotal: 0,
      betCount: 0,
      profit: 0,
      dailyProfit: 0,
    },
  ];

  sorted.forEach((day) => {
    const dailyProfit = day.gainTotal + day.lossTotal;
    cumulativeProfit += dailyProfit;
    stats.push({
      ...day,
      profit: Number(cumulativeProfit.toFixed(2)),
      dailyProfit: Number(dailyProfit.toFixed(2)),
    });
  });

  return stats;
};
