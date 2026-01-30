import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router'; // IMPORTANT IMPORT

import { betsApi } from '@/api/betsApi';
import { userApi } from '@/api/userApi';
import { DashboardIcon, RefreshIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ShareStatsModal } from '@/components/ShareStatsModal';
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
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { user } = useUser();
  const [searchParams] = useSearchParams();

  // GOD MODE LOGIC
  const paramUserId = searchParams.get('userId');
  const targetUserId = paramUserId || user?.id;
  const isGodMode = !!paramUserId;

  const [filters, setFilters] = useState<DashboardFiltersI>(DEFAULT_FILTERS);

  // 1. Fetch Target User Data (Configs)
  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    ...userApi.getUser(targetUserId || ''),
    enabled: !!targetUserId,
  });

  // 2. Derive Collection (Telegram ID)
  // Ensure we safely handle missing telegram/ids
  const collection =
    userData?.find((u) => u.telegram?.id)?.telegram?.id?.toString() ?? '';

  // 3. Fetch Bets
  const {
    data,
    isLoading: isBetsLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    // We pass targetUserId. API must handle userId param priority over Auth token if it supports admin overrides.
    ...betsApi.getFilteredDashboardQueryOptions(targetUserId, {
      ...filters,
      bookmaker: filters.bookmaker,
      collection,
      search: search,
    }),
    // CRITICAL FIX: Only fetch if we actually have a collection ID to avoid 500s
    enabled: !!collection,
  });

  const isLoading = isUserDataLoading || isBetsLoading || isRefetching;
  const showEmptyState =
    !isLoading && (!!error || !data?.bets || data.bets.length === 0);

  // Memo Logic...
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

  // Safe math for bankroll
  const bankrollReference = useMemo(() => {
    return (
      userData?.find((u) => u.bankroll_reference && u.active_config)
        ?.bankroll_reference || 0
    );
  }, [userData]);

  const totalProfit =
    (data?.metrics.total_profit ?? 0) + Number(bankrollReference || 0);

  return (
    <div className="relative z-20">
      {/* GOD MODE BANNER */}
      {isGodMode && (
        <div className="flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 py-2 text-xs font-medium text-amber-500">
          <Eye className="size-3" />
          <span>Viewing Client: {userData?.[0]?.username || targetUserId}</span>
          <Button
            variant="link"
            className="h-auto p-0 text-xs text-amber-500 underline"
            onClick={() => (window.location.href = '/')}
          >
            Exit
          </Button>
        </div>
      )}

      <header className="flex items-center justify-between border-b px-8 pt-6 pb-8">
        <div className="flex items-center gap-1.5">
          <DashboardIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            className="hidden md:flex"
          >
            <Share2 className="mr-2 size-4" />
            Share
          </Button>
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

      {/* Stats Section */}
      <section className="mt-[23px] px-7">
        <DashboardStats
          isLoading={isLoading || isUserDataLoading}
          roi={data?.metrics.roi}
          settled_stake_sum={
            bankrollReference && Number(bankrollReference) !== 0
              ? (totalProfit / Number(bankrollReference) - 1) * 100
              : 0
          }
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
              No bets found
            </h3>
            <p className="text-muted-foreground">
              {isGodMode
                ? "This user hasn't placed any bets or has no connected Telegram."
                : 'Configure your bot to see results.'}
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
      <ShareStatsModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        metrics={{
          roi: data?.metrics.roi ?? 0,
          totalProfit: totalProfit,
          betCount: data?.metrics.settled_count ?? 0,
        }}
        chartData={chartData}
        username={
          userData?.[0]?.username || user?.username || user?.firstName || 'User'
        }
        imageUrl={user?.imageUrl}
      />
    </div>
  );
};
