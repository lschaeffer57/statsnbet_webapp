import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { betsApi } from '@/api/betsApi';
import { DashboardIcon, RefreshIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { ChartPlaceholder } from '@/components/ui/Skeleton';
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
  const collection = '2097730097';

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

  // const { data, isLoading, error } = useQuery({
  //   ...betsApi.getUserBetsQueryOptions(userId, {
  //     ...filters,
  //     search: search,
  //   }),
  // });

  const { data, isLoading, error } = useQuery({
    ...betsApi.getFilteredDashboardQueryOptions(undefined, {
      ...filters,
      collection,
    }),
  });

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
          >
            {tCommon('refresh')}
          </Button>
          <LanguageSwitcher />
        </div>
      </header>
      <section className="mt-[23px] px-7">
        <DashboardStats
          isLoading={isLoading}
          roi={data?.metrics.roi}
          settled_stake_sum={data?.metrics.settled_stake_sum}
          total_profit={data?.metrics.total_profit}
          settled_count={data?.metrics.settled_count}
        />
      </section>

      <DashboardFilters filters={filters} setFilters={setFilters} />
      <ActiveFilters filters={filters} setFilters={setFilters} />

      {isLoading ? (
        <div className="px-7">
          <ChartPlaceholder />
        </div>
      ) : (
        <ProfitChart
          data={isDate ? dailyStats : chartData}
          isDate={isDate}
          setIsDate={setIsDate}
          cumulativeRealGain={data?.metrics.total_profit ?? 0}
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
        <p className="px-7 text-sm text-red-500">Error: {error?.message}</p>
      )}
    </div>
  );
};
