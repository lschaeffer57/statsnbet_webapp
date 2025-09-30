import { queryOptions } from '@tanstack/react-query';
import { format } from 'date-fns';

import { jsonApiInstance } from '@/lib/apiInstance';
import type {
  BetI,
  BetsApiResponse,
  ChartData,
  DashboardFiltersI,
  DailyStats,
} from '@/types';

export const betsApi = {
  baseKey: 'bets',
  getBetsQueryOptions: (
    filters?: DashboardFiltersI & {
      search?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    return queryOptions({
      queryKey: [betsApi.baseKey, filters],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();

        if (filters?.page) searchParams.set('page', filters.page.toString());
        if (filters?.limit) searchParams.set('limit', filters.limit.toString());
        if (filters?.search) searchParams.set('search', filters.search);
        if (filters?.configuration)
          searchParams.set('configuration', filters.configuration);

        if (filters?.liquidity?.more)
          searchParams.set('liquidityMin', filters.liquidity.more);
        if (filters?.liquidity?.less)
          searchParams.set('liquidityMax', filters.liquidity.less);

        if (filters?.payout_rate?.more)
          searchParams.set('payoutRateMin', filters.payout_rate.more);
        if (filters?.payout_rate?.less)
          searchParams.set('payoutRateMax', filters.payout_rate.less);

        if (filters?.ev?.more) searchParams.set('evMin', filters.ev.more);
        if (filters?.ev?.less) searchParams.set('evMax', filters.ev.less);

        if (filters?.sport) searchParams.set('sport', filters.sport);
        if (filters?.market) searchParams.set('market', filters.market);
        if (filters?.bookmaker)
          searchParams.set('bookmaker', filters.bookmaker);
        if (filters?.period?.start)
          searchParams.set(
            'periodStart',
            format(filters.period.start, 'dd/MM/yyyy'),
          );
        if (filters?.period?.end)
          searchParams.set(
            'periodEnd',
            format(filters.period.end, 'dd/MM/yyyy'),
          );

        return jsonApiInstance<BetsApiResponse>(`bets?${searchParams}`, {
          signal,
        });
      },
    });
  },
  getUserBetsQueryOptions: (
    userId: string,
    filters?: DashboardFiltersI & {
      search?: string;
    },
  ) => {
    return queryOptions({
      queryKey: [betsApi.baseKey, 'user', userId, filters],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();
        searchParams.set('userId', userId);

        if (filters?.search) searchParams.set('search', filters.search);
        if (filters?.configuration)
          searchParams.set('configuration', filters.configuration);

        if (filters?.liquidity?.more)
          searchParams.set('liquidityMin', filters.liquidity.more);
        if (filters?.liquidity?.less)
          searchParams.set('liquidityMax', filters.liquidity.less);

        if (filters?.payout_rate?.more)
          searchParams.set('payoutRateMin', filters.payout_rate.more);
        if (filters?.payout_rate?.less)
          searchParams.set('payoutRateMax', filters.payout_rate.less);

        if (filters?.ev?.more) searchParams.set('evMin', filters.ev.more);
        if (filters?.ev?.less) searchParams.set('evMax', filters.ev.less);

        if (filters?.sport) searchParams.set('sport', filters.sport);
        if (filters?.market) searchParams.set('market', filters.market);
        if (filters?.bookmaker)
          searchParams.set('bookmaker', filters.bookmaker);
        if (filters?.period?.start)
          searchParams.set(
            'periodStart',
            format(filters.period.start, 'dd/MM/yyyy'),
          );
        if (filters?.period?.end)
          searchParams.set(
            'periodEnd',
            format(filters.period.end, 'dd/MM/yyyy'),
          );

        return jsonApiInstance<{
          bets: BetI[];
          chartData: ChartData[];
          dailyStats: DailyStats[];
          totalGain: number;
          totalStakes: number;
          totalBets: number;
          monthlyGain: number;
          bankrollAtStartOfMonth: number;
        }>(`user-bets?${searchParams}`, {
          signal,
        });
      },
    });
  },
  getRecentBetsQueryOptions: (
    filters?: DashboardFiltersI & {
      search?: string;
    },
  ) => {
    return queryOptions({
      queryKey: [betsApi.baseKey, filters],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();

        if (filters?.search) searchParams.set('search', filters.search);
        if (filters?.configuration)
          searchParams.set('configuration', filters.configuration);

        if (filters?.liquidity?.more)
          searchParams.set('liquidityMin', filters.liquidity.more);
        if (filters?.liquidity?.less)
          searchParams.set('liquidityMax', filters.liquidity.less);

        if (filters?.payout_rate?.more)
          searchParams.set('payoutRateMin', filters.payout_rate.more);
        if (filters?.payout_rate?.less)
          searchParams.set('payoutRateMax', filters.payout_rate.less);

        if (filters?.ev?.more) searchParams.set('evMin', filters.ev.more);
        if (filters?.ev?.less) searchParams.set('evMax', filters.ev.less);

        if (filters?.sport) searchParams.set('sport', filters.sport);
        if (filters?.market) searchParams.set('market', filters.market);
        if (filters?.bookmaker)
          searchParams.set('bookmaker', filters.bookmaker);
        if (filters?.period?.start)
          searchParams.set(
            'periodStart',
            format(filters.period.start, 'dd/MM/yyyy'),
          );
        if (filters?.period?.end)
          searchParams.set(
            'periodEnd',
            format(filters.period.end, 'dd/MM/yyyy'),
          );

        return jsonApiInstance<{
          chartData: ChartData[];
          dailyStats: DailyStats[];
          totalGain: number;
        }>(`recent-bets?${searchParams}`, {
          signal,
        });
      },
    });
  },
};
