import { infiniteQueryOptions } from '@tanstack/react-query';

import { jsonApiInstance } from '@/lib/apiInstance';
import type { BetsApiResponse } from '@/types/dashboard';

export const betsApi = {
  baseKey: 'bets',
  getBetsInfiniteQueryOptions: (params?: {
    search?: string;
    configuration?: string;
    liquidity?: boolean;
    payout_rate?: boolean;
    ev?: boolean;
    sport?: string;
    market?: string;
    bookmaker?: string;
    periodStart?: Date;
    periodEnd?: Date;
    page?: number;
    limit?: number;
  }) => {
    return infiniteQueryOptions({
      queryKey: [betsApi.baseKey, params],
      queryFn: async ({ pageParam, signal }) => {
        const searchParams = new URLSearchParams();

        searchParams.set('page', pageParam.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.configuration)
          searchParams.set('configuration', params.configuration);
        if (params?.liquidity)
          searchParams.set('liquidity', params.liquidity.toString());
        if (params?.payout_rate)
          searchParams.set('payout_rate', params.payout_rate.toString());
        if (params?.ev) searchParams.set('ev', params.ev.toString());
        if (params?.sport) searchParams.set('sport', params.sport);
        if (params?.market) searchParams.set('market', params.market);
        if (params?.bookmaker) searchParams.set('bookmaker', params.bookmaker);
        if (params?.periodStart)
          searchParams.set('periodStart', params.periodStart.toISOString());
        if (params?.periodEnd)
          searchParams.set('periodEnd', params.periodEnd.toISOString());

        return jsonApiInstance<BetsApiResponse>(`/bets?${searchParams}`, {
          signal,
        });
      },
      getNextPageParam: (lastPage) => {
        const { pagination } = lastPage;
        return pagination.page < pagination.totalPages
          ? pagination.page + 1
          : undefined;
      },
      initialPageParam: 1,
    });
  },
};
