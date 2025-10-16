import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { betsApi } from '@/api/betsApi';
import { userApi } from '@/api/userApi';
import { DashboardIcon, RefreshIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { ChartPlaceholder } from '@/components/ui/Skeleton';
import type { DashboardFiltersI } from '@/types';

import ActiveFilters from '../components/ActiveFilters';
import BetsTable from '../components/BetsTable';
import DashboardFilters from '../components/DashboardFilters';
import ProfitChart from '../components/ProfitChart';

import StatCard from './components/StatCard';

export const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDate, setIsDate] = useState(false);
  const { user } = useUser();
  const userId = '8106617828';

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

  const {
    data,
    refetch,
    isLoading: isBetsLoading,
    isRefetching,
    error,
  } = useQuery({
    ...betsApi.getUserBetsQueryOptions(userId, {
      ...filters,
      search: search,
    }),
  });

  // const { data: filteredData } = useQuery({
  //   ...betsApi.getFilteredDashboardQueryOptions(undefined, {
  //     ...filters,
  //     collection: '2097730097',
  //   }),
  // });
  // console.log(filteredData);

  // const { data: filteredHistoryData } = useQuery({
  //   ...betsApi.getFilteredHistoryQueryOptions(userId, undefined, {
  //     ...filters,
  //   }),
  // });
  // console.log(filteredHistoryData);

  const {
    data: userDataList,
    isLoading: isUserDataLoading,
    error: userDataError,
  } = useQuery({
    ...userApi.getUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const userData = useMemo(
    () => userDataList?.find((u) => u.active_config) || userDataList?.[0],
    [userDataList],
  );

  const tableData = useMemo(() => {
    if (!data) return { data: undefined, isLoading };
    const limit = 10;

    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const paginatedData = data?.bets.slice(startIndex, endIndex);

    return {
      data: {
        data: paginatedData,
        pagination: {
          totalPages: Math.ceil(data.bets.length / 10),
          page: currentPage,
          limit,
          total: data.bets.length,
        },
      },
      isLoading: isBetsLoading,
      isRefetching,
    };
  }, [data, currentPage, isBetsLoading, isRefetching]);

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
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            isLoading={isLoading}
            title={t('stats.averageRoi')}
            value={
              data?.totalStakes && data?.totalStakes > 0
                ? `${((data.totalGain / data.totalStakes) * 100).toFixed(2)}%`
                : '0.00%'
            }
          />
          <StatCard
            title={t('stats.averageReturn')}
            isLoading={isLoading}
            value={(() => {
              const bankrollAtStart =
                (data?.bankrollAtStartOfMonth ?? 0) +
                (userData?.bankroll_reference ?? 0);
              const bankrollAtEnd = bankrollAtStart + (data?.monthlyGain ?? 0);

              if (bankrollAtStart === 0) return '0.00%';

              const monthlyYield = (bankrollAtEnd / bankrollAtStart - 1) * 100;
              return `${monthlyYield.toFixed(2)}%`;
            })()}
          />
          <StatCard
            isLoading={isLoading}
            title={t('stats.updatedBankroll')}
            value={(
              (data?.totalGain ?? 0) + (userData?.bankroll_reference ?? 0)
            ).toFixed(0)}
          />
          <StatCard
            isLoading={isLoading}
            title={t('stats.numberOfBets')}
            value={data?.totalBets ?? 0}
          />
        </div>
      </section>

      <DashboardFilters filters={filters} setFilters={setFilters} />
      <ActiveFilters filters={filters} setFilters={setFilters} />

      {isLoading ? (
        <ChartPlaceholder />
      ) : (
        <ProfitChart
          data={isDate ? (data?.dailyStats ?? []) : (data?.chartData ?? [])}
          isDate={isDate}
          setIsDate={setIsDate}
          cumulativeRealGain={data?.totalGain ?? 0}
        />
      )}
      <BetsTable
        tableData={tableData}
        search={search}
        setSearch={setSearch}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      {(error || userDataError) && (
        <p className="px-7 text-sm text-red-500">
          Error: {error?.message || userDataError?.message}
        </p>
      )}
    </div>
  );
};
