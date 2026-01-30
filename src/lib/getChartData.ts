import { format, parse, subDays } from 'date-fns';

import type { ChartData, DailyStats, FilteredBet } from '@/types';

export const getChartData = (data: FilteredBet[] | undefined): ChartData[] => {
  if (!data || data.length === 0) {
    // Return just the zero point if no data
    return [
      {
        date: format(new Date(), 'dd/MM/yyyy'),
        betNumber: 0,
        realGain: 0,
        theoreticalGain: 0,
      },
    ];
  }

  let cumulativeRealGain = 0;
  let cumulativeTheoreticalGain = 0;

  // Ensure bets are sorted by date ascending for the graph accumulation
  const sortedData = [...data].sort((a, b) => {
    // Assuming 'date' is DD/MM/YYYY. If it's a string, we might need to parse.
    // If the API returns them sorted, this is redundant but safe.
    const dateA = parse(a.date, 'dd/MM/yyyy', new Date());
    const dateB = parse(b.date, 'dd/MM/yyyy', new Date());
    return dateA.getTime() - dateB.getTime();
  });

  const chartData: ChartData[] = [
    {
      date: sortedData.length > 0 ? sortedData[0].date : '',
      betNumber: 0,
      realGain: 0,
      theoreticalGain: 0,
    },
  ];

  sortedData.forEach((bet, index) => {
    cumulativeRealGain += bet.pnl;

    // Theoretical Gain Formula: Stake * (EV% / 100)
    // If bet.ev is whole number (e.g., 5 for 5%), divide by 100.
    const theoreticalProfit = bet.stake * (bet.ev / 100);
    cumulativeTheoreticalGain += theoreticalProfit;

    chartData.push({
      date: bet.date,
      betNumber: index + 1,
      realGain: Number(cumulativeRealGain.toFixed(2)),
      theoreticalGain: Number(cumulativeTheoreticalGain.toFixed(2)),
    });
  });

  return chartData;
};

// ... (getDailyStats remains the same, just ensure it handles the 0 start if needed)
export const getDailyStats = (
  data: FilteredBet[] | undefined,
): DailyStats[] => {
  if (!data) return [];
  // ... existing logic ...
  // Ensure the logic already adds the initial 0 point in the existing code
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
  // If no data, default to today
  const firstDate = sorted.length > 0 ? new Date(sorted[0].date) : new Date();
  const initialDate = format(subDays(firstDate, 1), 'yyyy-MM-dd');

  // Explicit 0 start
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
