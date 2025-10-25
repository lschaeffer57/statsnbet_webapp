import { useTranslation } from 'react-i18next';

import StatCard from '../Dashboard/components/StatCard';

interface DashboardStatsProps {
  isLoading: boolean;
  roi?: number;
  settled_stake_sum?: number;
  total_profit?: number;
  settled_count?: number;
}

const DashboardStats = ({
  isLoading,
  roi,
  settled_stake_sum,
  total_profit,
  settled_count,
}: DashboardStatsProps) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        isLoading={isLoading}
        title={t('stats.averageRoi')}
        value={`${(roi ?? 0).toFixed(2)}%`}
      />
      <StatCard
        title={t('stats.averageReturn')}
        isLoading={isLoading}
        value={`${(settled_stake_sum ?? 0).toFixed(2)}%`}
      />
      <StatCard
        isLoading={isLoading}
        title={t('stats.updatedBankroll')}
        value={`${(total_profit ?? 0).toFixed(2)}€`}
      />
      <StatCard
        isLoading={isLoading}
        title={t('stats.numberOfBets')}
        value={settled_count ?? 0}
      />
    </div>
  );
};

export default DashboardStats;
