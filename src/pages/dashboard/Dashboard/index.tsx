import { useState } from 'react';

import { DashboardIcon, RefreshIcon } from '@/assets/icons';
import { Button } from '@/components/ui/Button';
import type { DashboardFiltersI } from '@/types/dashboard';

import ActiveFilters from '../components/ActiveFilters';
import DashboardFilters from '../components/DashboardFilters';
import ProfitChart from '../components/ProfitChart';

import StatCard from './components/StatCard';

export const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFiltersI>({
    configuration: '',
    liquidity: false,
    payout: false,
    ev: false,
    sport: '',
    market: '',
    bookmaker: '',
    period: {
      start: undefined,
      end: undefined,
    },
  });
  console.log(filters);

  return (
    <div className="relative z-20">
      <div className="flex items-center justify-between border-b px-8 pb-8">
        <div className="flex items-center gap-1.5">
          <DashboardIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">
            Tableau de bord
          </h1>
        </div>
        <Button
          iconLeft={<RefreshIcon className="size-[14px]" />}
          variant="secondary"
          size="sm"
        >
          Rafraichir
        </Button>
      </div>
      <div className="mt-[23px] px-7">
        <div className="grid grid-cols-4 gap-3">
          <StatCard title="ROI moyen" value="13.74%" />
          <StatCard title="Rendement moyen" value="--" />
          <StatCard title="Bankroll actualisée" value="--" />
          <StatCard title="Nombre de paris" value="390" />
        </div>
      </div>

      <DashboardFilters filters={filters} setFilters={setFilters} />
      <ActiveFilters filters={filters} setFilters={setFilters} />

      <ProfitChart />
    </div>
  );
};
