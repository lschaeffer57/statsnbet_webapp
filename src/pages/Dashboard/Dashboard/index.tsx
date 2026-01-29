import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { betsApi } from '@/api/betsApi';
import { userApi } from '@/api/userApi';
import { DashboardIcon, RefreshIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChartPlaceholder } from '@/components/ui/Skeleton';
import { DEFAULT_FILTERS } from '@/constants';
import { getChartData, getDailyStats } from '@/lib/getChartData';
import type { DashboardFiltersI } from '@/types';

import ActiveFilters from '../components/ActiveFilters';
import BetsTable from '../components/BetsTable';
import DashboardFilters from '../components/DashboardFilters';
import DashboardStats from '../components/DashboardStats';
import ProfitChart from '../components/ProfitChart';

export const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDate, setIsDate] = useState(false);
  const { user } = useUser();

  const [filters, setFilters] = useState<DashboardFiltersI>(DEFAULT_FILTERS);

  // const { data, isLoading, error } = useQuery({
  //   ...betsApi.getUserBetsQueryOptions(userId, {
  //     ...filters,
  //     search: search,
  //   }),
  // });

  const {
    data: userData,
    error: userDataError,
    isLoading: isUserDataLoading,
  } = useQuery({
    ...userApi.getUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const collection =
    userData?.find((u) => u.telegram?.id)?.telegram?.id?.toString() ?? '';

  const {
    data,
    isLoading: isBetsLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    ...betsApi.getFilteredDashboardQueryOptions(undefined, {
      ...filters,
      bookmaker: filters.bookmaker,
      collection,
      search: search,
    }),
    enabled: !!collection,
  });

  const isLoading = isUserDataLoading || isBetsLoading || isRefetching;

  const showEmptyState =
    !isLoading && (!!error || !data?.bets || data.bets.length === 0);

  useEffect(() => {
    if (filters.configuration && userData) {
      const user = userData.find(
        (user) => user.config_number === parseInt(filters.configuration),
      );

      if (!user) return;

      setFilters((prev) => ({
        ...prev,
        liquidity: {
          ...prev.liquidity,
          more: user.min_liquidity.toString(),
        },
        ev: {
          ...prev.ev,
          more: user.ev_min_pct.toString(),
        },
        sport: user.sports.join(',') ?? '',
        market:
          Object.entries(user.markets)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(',') ?? '',
        bookmaker: user.bookmakers.join(',') ?? '',
      }));
    }
  }, [filters.configuration, userData]);

  const tableData = useMemo(() => {
    if (!data) return { data: undefined, isLoading };

    const startIndex = (currentPage - 1) * 10;
    const endIndex = currentPage * 10;
    const paginatedData = data?.bets.slice(startIndex, endIndex);

    return {
      data: {
        data: paginatedData,
        pagination: {
          page_count: Math.ceil(data.bets.length / 10),
          page_number: currentPage,
          page_size: 10,
          total_rows: data.bets.length,
        },
      },
      isLoading,
    };
  }, [data, currentPage, isLoading]);

  const chartData = useMemo(() => getChartData(data?.bets), [data]);
  const dailyStats = useMemo(() => getDailyStats(data?.bets), [data]);
  const bankrollReference = useMemo(() => {
    return userData?.find((u) => u.bankroll_reference && u.active_config)
      ?.bankroll_reference;
  }, [userData]);
  const totalProfit = useMemo(() => {
    return (data?.metrics.total_profit ?? 0) + Number(bankrollReference);
  }, [data?.metrics, bankrollReference]);

  return (
    <div className="relative z-20">
      <header className="flex items-center justify-between border-b px-8 pb-8">
        <div className="flex items-center gap-1.5">
          <DashboardIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            iconLeft={<RefreshIcon className="size-[14px]" />}
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
          >
            {tCommon('refresh')}
          </Button>
          <LanguageSwitcher />
        </div>
      </header>
      <section className="mt-[23px] px-7">
        <DashboardStats
          isLoading={isLoading || isUserDataLoading}
          roi={data?.metrics.roi}
          settled_stake_sum={(totalProfit / (bankrollReference ?? 0) - 1) * 100}
          total_profit={totalProfit}
          settled_count={data?.metrics.settled_count}
        />
      </section>

      <DashboardFilters
        filters={filters}
        setFilters={setFilters}
        userData={userData}
      />
      <ActiveFilters filters={filters} setFilters={setFilters} />

      {isLoading ? (
        <div className="px-7">
          <ChartPlaceholder />
        </div>
      ) : showEmptyState ? (
        <div className="px-7 py-10">
          <Card className="bg-muted/20 flex flex-col items-center justify-center gap-4 border-dashed p-10 text-center">
            <h3 className="text-foreground text-xl font-medium">
              No bets placed yet
            </h3>
            <p className="text-muted-foreground">
              Configure your bot and place your first bet to see your results
              here.
            </p>
          </Card>
        </div>
      ) : (
        <>
          <ProfitChart
            data={isDate ? dailyStats : chartData}
            isDate={isDate}
            setIsDate={setIsDate}
            cumulativeRealGain={data?.metrics.total_profit ?? 0}
          />
          <BetsTable
            configuration={filters.configuration}
            tableData={tableData}
            search={search}
            setSearch={setSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
      {(error || userDataError) && (
        <p className="hidden px-7 text-sm text-red-500">
          Error: {error?.message || userDataError?.message}
        </p>
      )}
    </div>
  );
};
