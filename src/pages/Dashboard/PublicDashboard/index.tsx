import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { betsApi } from '@/api/betsApi';
import { PublicDashboardIcon, RefreshIcon } from '@/assets/icons';
import AppSidebar from '@/components/AppSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/Sidebar';
import { ChartPlaceholder } from '@/components/ui/Skeleton';
import { DEFAULT_FILTERS } from '@/constants';
import { getChartData, getDailyStats } from '@/lib/getChartData';
import { cn } from '@/lib/utils';
import type { DashboardFiltersI, FilteredBetsWithPagination } from '@/types';

import ActiveFilters from '../components/ActiveFilters';
import BetsTable from '../components/BetsTable';
import DashboardFilters from '../components/DashboardFilters';
import DashboardStats from '../components/DashboardStats';
import ProfitChart from '../components/ProfitChart';

export const PublicDashboard = () => {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const { isSignedIn } = useUser();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDate, setIsDate] = useState(false);
  const [bankroll, setBankroll] = useState('');

  const [filters, setFilters] = useState<DashboardFiltersI>(DEFAULT_FILTERS);

  const {
    data: filteredHistoryData,
    isLoading: isBetsLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    ...betsApi.getFilteredHistoryQueryOptions(bankroll, undefined, {
      ...filters,
      bookmaker: filters.bookmaker,
      is_percent: true,
      page_number: currentPage,
      page_size: 20,
      search: search,
    }),
    enabled: !!bankroll.trim(),
  });

  const {
    data: filteredChartData,
    isLoading: isChartDataLoading,
    error: chartError,
    refetch: chartRefetch,
    isRefetching: isChartRefetching,
  } = useQuery({
    ...betsApi.getFilteredHistoryQueryOptions(bankroll, undefined, {
      ...filters,
      bookmaker: filters.bookmaker,
      get_all: true,
      is_percent: true,
      search: search,
    }),
    enabled: !!bankroll.trim(),
  });

  const isLoading = isBetsLoading || isRefetching;
  const isChartLoading = isChartDataLoading || isChartRefetching;

  const showEmptyState =
    !isLoading &&
    (!!error ||
      !!chartError ||
      !filteredHistoryData?.page_rows ||
      filteredHistoryData.page_rows.length === 0);

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
    () => getChartData(filteredChartData?.page_rows),
    [filteredChartData],
  );
  const dailyStats = useMemo(
    () => getDailyStats(filteredChartData?.page_rows),
    [filteredChartData],
  );
  const totalProfit = useMemo(() => {
    return (filteredHistoryData?.metrics.total_profit ?? 0) + Number(bankroll);
  }, [filteredHistoryData?.metrics, bankroll]);

  const content = (
    <div className="relative z-20">
      <header className="border-b px-7 pb-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isSignedIn && <SidebarTrigger className="mr-2 -ml-1" />}
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
              onClick={() => {
                refetch();
                chartRefetch();
              }}
            >
              {tCommon('refresh')}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1228px]">
        <div className="mt-[23px] flex w-full flex-col gap-6 px-7 lg:flex-row">
          <Card className="shadow-glass-lg bg-input flex flex-1 flex-row items-center justify-between rounded-3xl px-7 py-6">
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

          <Card className="shadow-glass-lg bg-input flex min-w-[350px] flex-col justify-center gap-3 rounded-3xl px-7 py-6 transition-all hover:shadow-emerald-500/5">
            <h3 className="text-foreground text-sm font-medium">
              {t('chart.baseBankroll')}
            </h3>
            <div className="relative">
              <Input
                type="number"
                placeholder="e.g. 1000"
                value={bankroll}
                onChange={(e) => setBankroll(e.target.value)}
                className={cn(
                  'bg-background/50 border-border h-11 pl-9 text-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/20',
                  !bankroll && 'animate-pulse border-emerald-500/30',
                )}
              />
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-emerald-500/50">
                €
              </span>
            </div>
          </Card>
        </div>

        {filteredHistoryData && (
          <div className="mt-10 px-7">
            <DashboardStats
              isLoading={isLoading}
              roi={filteredHistoryData?.metrics.roi}
              settled_stake_sum={(totalProfit / Number(bankroll) - 1) * 100}
              total_profit={totalProfit}
              settled_count={filteredHistoryData?.pagination.total_rows}
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

        {isChartLoading ? (
          <div className="px-7">
            <ChartPlaceholder />
          </div>
        ) : showEmptyState ? (
          <div className="px-7 py-10">
            <Card className="bg-muted/20 flex flex-col items-center justify-center gap-4 border-dashed p-10 text-center">
              <h3 className="text-foreground text-xl font-medium">
                {!bankroll ? 'Enter your bankroll' : 'No data found'}
              </h3>
              <p className="text-muted-foreground">
                {!bankroll
                  ? 'Enter your starting bankroll above to backtest your strategy.'
                  : 'Try adjusting your filters or bankroll simulation.'}
              </p>
            </Card>
          </div>
        ) : (
          <>
            <ProfitChart
              isPublic
              data={isDate ? dailyStats : chartData}
              cumulativeRealGain={
                filteredHistoryData?.metrics.total_profit ?? 0
              }
              isDate={isDate}
              setIsDate={setIsDate}
            />
            <BetsTable
              configuration={undefined}
              tableData={tableData}
              search={search}
              setSearch={setSearch}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}

        {(error || chartError) && (
          <p className="hidden px-7 text-sm text-red-500">
            Error: {error?.message || chartError?.message}
          </p>
        )}
      </div>
    </div>
  );

  if (isSignedIn) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative overflow-x-hidden py-3 pr-3">
          <div className="border-border relative z-10 w-full flex-1 rounded-3xl border py-10">
            <div
              className="absolute inset-0 rounded-3xl bg-cover bg-top bg-no-repeat"
              style={{ backgroundImage: "url('/images/dashboard-bg.png')" }}
            />
            {content}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <main className="relative px-4 py-3">
      <div className="border-border relative z-10 w-full flex-1 rounded-3xl border py-10">
        <div
          className="absolute inset-0 rounded-3xl bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: "url('/images/dashboard-bg.png')" }}
        />
        {content}
      </div>
    </main>
  );
};
