import { queryOptions } from '@tanstack/react-query';
import { format } from 'date-fns';

import { jsonApiInstance } from '@/lib/apiInstance';
import type {
  BetI,
  BetsApiResponse,
  ChartData,
  DashboardFiltersI,
  DailyStats,
  FilteredBet,
} from '@/types';

// Helper to clean params and prevent 500 errors on the backend
const appendIfValid = (
  params: URLSearchParams,
  key: string,
  value: string | number | boolean | null | undefined,
) => {
  if (value !== undefined && value !== null && value !== '') {
    params.set(key, value.toString());
  }
};

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
    bankroll: string,
    userId?: string,
    filters?: DashboardFiltersI & {
      page_size?: number;
      page_number?: number;
      search?: string;
      get_all?: boolean;
      is_percent?: boolean;
    },
  ) => {
    return queryOptions({
      queryKey: [
        betsApi.baseKey,
        'filtered-history',
        bankroll,
        userId,
        filters,
      ],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();

        appendIfValid(searchParams, 'bankroll', bankroll);
        appendIfValid(searchParams, 'userId', userId);
        appendIfValid(searchParams, 'search', filters?.search);

        // Odds Filter (New)
        if (filters?.odds?.more)
          appendIfValid(searchParams, 'odds_min', filters.odds.more);
        if (filters?.odds?.less)
          appendIfValid(searchParams, 'odds_max', filters.odds.less);

        if (filters?.liquidity?.more)
          appendIfValid(searchParams, 'liquidity_min', filters.liquidity.more);
        if (filters?.liquidity?.less)
          appendIfValid(searchParams, 'liquidity_max', filters.liquidity.less);

        if (filters?.payout_rate?.more)
          appendIfValid(searchParams, 'payout_min', filters.payout_rate.more);
        if (filters?.payout_rate?.less)
          appendIfValid(searchParams, 'payout_max', filters.payout_rate.less);

        if (filters?.ev?.more)
          appendIfValid(searchParams, 'ev_min', filters.ev.more);
        if (filters?.ev?.less)
          appendIfValid(searchParams, 'ev_max', filters.ev.less);

        if (filters?.sport)
          appendIfValid(searchParams, 'sports', filters.sport);
        if (filters?.market)
          appendIfValid(searchParams, 'markets', filters.market);
        if (filters?.bookmaker)
          appendIfValid(searchParams, 'bookmakers', filters.bookmaker);

        if (filters?.period?.end)
          appendIfValid(
            searchParams,
            'date_max',
            format(filters.period.end, 'yyyy-MM-dd'),
          );
        if (filters?.period?.start)
          appendIfValid(
            searchParams,
            'date_min',
            format(filters.period.start, 'yyyy-MM-dd'),
          );

        if (filters?.get_all)
          appendIfValid(searchParams, 'get_all', filters.get_all);
        if (filters?.is_percent)
          appendIfValid(searchParams, 'is_percent', filters.is_percent);
        if (filters?.page_size)
          appendIfValid(searchParams, 'page_size', filters.page_size);
        if (filters?.page_number)
          appendIfValid(searchParams, 'page_number', filters.page_number);

        return jsonApiInstance<{
          page_rows: FilteredBet[];
          pagination: {
            page_number: number;
            page_size: number;
            page_count: number;
            total_rows: number;
          };
          metrics: {
            total_profit: number;
            settled_count: number;
            settled_stake_sum: number;
            roi: number;
          };
          bankroll: number;
          filters: Record<string, unknown>;
          source_id: string;
        }>(`filter-history?${searchParams}`, {
          signal,
        });
      },
    });
  },
  getFilteredDashboardQueryOptions: (
    userId?: string,
    filters?: DashboardFiltersI & {
      collection?: string;
      search?: string;
    },
  ) => {
    return queryOptions({
      queryKey: [betsApi.baseKey, 'filtered-dashboard', userId, filters],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams();

        appendIfValid(searchParams, 'userId', userId);
        appendIfValid(searchParams, 'search', filters?.search);
        appendIfValid(searchParams, 'collection', filters?.collection);

        // Odds Filter (New)
        if (filters?.odds?.more)
          appendIfValid(searchParams, 'odds_min', filters.odds.more);
        if (filters?.odds?.less)
          appendIfValid(searchParams, 'odds_max', filters.odds.less);

        if (filters?.liquidity?.more)
          appendIfValid(searchParams, 'liquidity_min', filters.liquidity.more);
        if (filters?.liquidity?.less)
          appendIfValid(searchParams, 'liquidity_max', filters.liquidity.less);

        if (filters?.payout_rate?.more)
          appendIfValid(searchParams, 'payout_min', filters.payout_rate.more);
        if (filters?.payout_rate?.less)
          appendIfValid(searchParams, 'payout_max', filters.payout_rate.less);

        if (filters?.ev?.more)
          appendIfValid(searchParams, 'ev_min', filters.ev.more);
        if (filters?.ev?.less)
          appendIfValid(searchParams, 'ev_max', filters.ev.less);

        if (filters?.sport)
          appendIfValid(searchParams, 'sports', filters.sport);
        if (filters?.market)
          appendIfValid(searchParams, 'markets', filters.market);
        if (filters?.bookmaker)
          appendIfValid(searchParams, 'bookmakers', filters.bookmaker);

        if (filters?.period?.start)
          appendIfValid(
            searchParams,
            'date_min',
            format(filters.period.start, 'yyyy-MM-dd'),
          );
        if (filters?.period?.end)
          appendIfValid(
            searchParams,
            'date_max',
            format(filters.period.end, 'yyyy-MM-dd'),
          );

        return jsonApiInstance<{
          filtered_doc: Record<string, unknown>;
          metrics: {
            total_profit: number;
            settled_count: number;
            settled_stake_sum: number;
            roi: number;
          };
          source_id: string;
          bets: FilteredBet[];
        }>(`filter-dashboard?${searchParams}`, {
          signal,
        });
      },
    });
  },
};
