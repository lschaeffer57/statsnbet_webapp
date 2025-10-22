import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { betsApi } from '@/api/betsApi';
import { PublicDashboardIcon, RefreshIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChartPlaceholder } from '@/components/ui/Skeleton';
import { getChartData, getDailyStats } from '@/lib/getChartData';
import type { DashboardFiltersI, FilteredBetsWithPagination } from '@/types';

import ActiveFilters from '../components/ActiveFilters';
import BetsTable from '../components/BetsTable';
import DashboardFilters from '../components/DashboardFilters';
import DashboardStats from '../components/DashboardStats';
import ProfitChart from '../components/ProfitChart';

export const PublicDashboard = () => {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDate, setIsDate] = useState(false);
  const [bankroll, setBankroll] = useState('');

  const [filters, setFilters] = useState<DashboardFiltersI>({
    configuration: '',
    liquidity: {
      more: '',
      less: '',
    },
    payout_rate: {
      more: '',
      less: '',
    },
    ev: {
      more: '',
      less: '',
    },
    sport: '',
    market: '',
    bookmaker: '',
    period: {
      start: undefined,
      end: undefined,
    },
  });

  // const tableData = useQuery({
  //   ...betsApi.getBetsQueryOptions({
  //     ...filters,
  //     search: search,
  //     page: currentPage,
  //     limit: 10,
  //   }),
  // });

  // const { data: chartData, isLoading } = useQuery({
  //   ...betsApi.getRecentBetsQueryOptions({
  //     ...filters,
  //     search: search,
  //   }),
  //   enabled: getData,
  // });

  const {
    data: filteredHistoryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...betsApi.getFilteredHistoryQueryOptions(bankroll, undefined, {
      ...filters,
      page_number: currentPage,
      page_size: 20,
      search: search,
    }),
    enabled: !!bankroll.trim(),
  });

  useEffect(() => {
    if (bankroll.trim().length === 0) return;
    refetch();
  }, [bankroll, refetch]);

  const tableData = useMemo(() => {
    if (!filteredHistoryData) return { data: undefined, isLoading };

    const data: FilteredBetsWithPagination = {
      data: filteredHistoryData?.page_rows,
      pagination: filteredHistoryData?.pagination,
    };

    return {
      data,
      isLoading,
    };
  }, [filteredHistoryData, isLoading]);

  const chartData = useMemo(
    () => getChartData(filteredHistoryData?.page_rows),
    [filteredHistoryData],
  );
  const dailyStats = useMemo(
    () => getDailyStats(filteredHistoryData?.page_rows),
    [filteredHistoryData],
  );

  return (
    <main className="px-4 py-3">
      <div className="border-border relative z-10 w-full flex-1 rounded-3xl border py-10">
        <div
          className="absolute inset-0 rounded-3xl bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: "url('/images/dashboard-bg.png')" }}
        />
        <div className="relative z-20">
          <header className="border-b px-7 pb-8">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between">
              <div className="flex items-center gap-1.5">
                <PublicDashboardIcon className="size-5" />
                <h1 className="text-xl leading-[23px] font-medium">
                  {t('public.title')}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  iconLeft={<RefreshIcon className="size-[14px]" />}
                  variant="secondary"
                  size="sm"
                >
                  {tCommon('refresh')}
                </Button>
                <LanguageSwitcher />
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-[1228px]">
            <div className="mt-[23px] w-full px-7">
              <Card className="shadow-glass-lg bg-input w-full flex-row items-center justify-between rounded-3xl px-7">
                <div className="space-y-2">
                  <p className="text-foreground max-w-[265px] text-base font-medium">
                    {t('public.cta.title')}
                  </p>
                  <p className="text-muted-foreground max-w-[265px] text-sm">
                    {t('public.cta.description')}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    window.open(
                      'https://app.iclosed.io/e/statsnbet/consulting-value-betting-1-1-offert',
                      '_blank',
                    )
                  }
                >
                  {t('public.cta.button')}
                </Button>
              </Card>
            </div>
            {filteredHistoryData && (
              <div className="mt-10 px-7">
                <DashboardStats
                  isLoading={isLoading}
                  roi={filteredHistoryData?.metrics.roi}
                  settled_stake_sum={
                    filteredHistoryData?.metrics.settled_stake_sum
                  }
                  total_profit={filteredHistoryData?.metrics.total_profit}
                  settled_count={filteredHistoryData?.metrics.settled_count}
                />
              </div>
            )}
            <DashboardFilters
              className="mt-10"
              isPublic
              filters={filters}
              setFilters={setFilters}
            />
            <ActiveFilters filters={filters} setFilters={setFilters} />

            {isLoading ? (
              <div className="px-7">
                <ChartPlaceholder />
              </div>
            ) : (
              <ProfitChart
                isPublic
                data={isDate ? dailyStats : chartData}
                cumulativeRealGain={
                  filteredHistoryData?.metrics.total_profit ?? 0
                }
                isDate={isDate}
                setIsDate={setIsDate}
                setBankroll={setBankroll}
                bankroll={bankroll}
              />
            )}

            <BetsTable
              tableData={tableData}
              search={search}
              setSearch={setSearch}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
            {error && (
              <p className="px-7 text-sm text-red-500">
                Error: {error.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
