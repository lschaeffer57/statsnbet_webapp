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
  getFilteredDashboardQueryOptions: (
    userId?: string,
    filters?: DashboardFiltersI & {
      collection?: string;
    },
  ) => {
    return queryOptions({
      queryKey: [betsApi.baseKey, 'filtered-dashboard', userId, filters],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();

        if (userId) searchParams.set('userId', userId);
        if (filters?.collection)
          searchParams.set('collection', filters.collection);

        if (filters?.liquidity?.more)
          searchParams.set('liquidity_min', filters.liquidity.more);

        if (filters?.payout_rate?.more)
          searchParams.set('payout_min', filters.payout_rate.more);

        if (filters?.ev?.more) searchParams.set('ev_min', filters.ev.more);

        if (filters?.sport) searchParams.set('sports', filters.sport);
        if (filters?.bookmaker)
          searchParams.set('bookmakers', filters.bookmaker);

        if (filters?.period?.start)
          searchParams.set(
            'date_min',
            format(filters.period.start, 'yyyy-MM-dd'),
          );
        if (filters?.period?.end)
          searchParams.set(
            'date_max',
            format(filters.period.end, 'yyyy-MM-dd'),
          );

        return jsonApiInstance<{
          filtered_doc: Record<string, unknown>;
          metrics: {
            total_profit: number;
            settled_count: number;
            settled_stake_sum: number;
          };
          source_id: string;
          bets: Array<Record<string, unknown>>;
        }>(`filter-dashboard?${searchParams}`, {
          signal,
        });
      },
    });
  },
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
          searchParams.set('periodStart', filters.period.start.toISOString());
        if (filters?.period?.end)
          searchParams.set('periodEnd', filters.period.end.toISOString());

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
  getFilteredHistoryQueryOptions: (
    collection?: string,
    userId?: string,
    filters?: DashboardFiltersI & {
      page_size?: number;
      page_number?: number;
    },
  ) => {
    return queryOptions({
      queryKey: [
        betsApi.baseKey,
        'filtered-history',
        collection,
        userId,
        filters,
      ],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();

        if (collection) searchParams.set('collection', collection);
        if (userId) searchParams.set('userId', userId);

        if (filters?.liquidity?.more)
          searchParams.set('liquidity_min', filters.liquidity.more);

        if (filters?.payout_rate?.more)
          searchParams.set('payout_min', filters.payout_rate.more);

        if (filters?.ev?.more) searchParams.set('ev_min', filters.ev.more);

        if (filters?.sport) searchParams.set('sports', filters.sport);
        if (filters?.bookmaker)
          searchParams.set('bookmakers', filters.bookmaker);

        if (filters?.period?.end)
          searchParams.set(
            'date_max',
            format(filters.period.end, 'yyyy-MM-dd'),
          );

        if (filters?.page_size)
          searchParams.set('page_size', filters.page_size.toString());
        if (filters?.page_number)
          searchParams.set('page_number', filters.page_number.toString());

        return jsonApiInstance<{
          page_rows: Array<Record<string, unknown>>;
          page_number: number;
          page_size: number;
          page_count: number;
          total_rows: number;
          metrics: {
            total_profit: number;
            settled_count: number;
            settled_stake_sum: number;
            roi: number;
          };
          bankroll_reference: number;
          filters: Record<string, unknown>;
          source_id: string;
        }>(`filter-history?${searchParams}`, {
          signal,
        });
      },
    });
  },
};
