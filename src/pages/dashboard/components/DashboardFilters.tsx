import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterLinesIcon } from '@/assets/icons';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from '@/components/ui/Select';
import type { DashboardFiltersI } from '@/types/dashboard';

interface DashboardFiltersProps {
  filters: DashboardFiltersI;
  setFilters: Dispatch<SetStateAction<DashboardFiltersI>>;
}

const DashboardFilters = ({ filters, setFilters }: DashboardFiltersProps) => {
  const { t } = useTranslation('dashboard');

  const handleFilter = (value: string, filterKey: string) => {
    setFilters((prev: DashboardFiltersI) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  return (
    <div className="mt-16 flex flex-wrap gap-2.5 px-7">
      <Select
        value={filters.configuration}
        onValueChange={(value) => handleFilter(value, 'configuration')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.configuration')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="conf1">Conf 1</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        iconLeft={<FilterLinesIcon className="size-[14px]" />}
        size="sm"
        className="!shadow-glass from-input !bg-gradient-to-b to-transparent opacity-100"
        onClick={() =>
          setFilters((prev) => ({ ...prev, liquidity: !prev.liquidity }))
        }
      >
        {t('filters.liquidity')}
      </Button>

      <Button
        variant="secondary"
        iconLeft={<FilterLinesIcon className="size-[14px]" />}
        size="sm"
        className="!shadow-glass from-input !bg-gradient-to-b to-transparent opacity-100"
        onClick={() =>
          setFilters((prev) => ({ ...prev, payout: !prev.payout }))
        }
      >
        {t('filters.payout')}
      </Button>

      <Button
        variant="secondary"
        iconLeft={<FilterLinesIcon className="size-[14px]" />}
        size="sm"
        className="!shadow-glass from-input !bg-gradient-to-b to-transparent opacity-100"
        onClick={() => setFilters((prev) => ({ ...prev, ev: !prev.ev }))}
      >
        {t('filters.ev')}
      </Button>

      <Select
        value={filters.sport}
        onValueChange={(value) => handleFilter(value, 'sport')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.sport')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="soccer">Soccer</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.market}
        onValueChange={(value) => handleFilter(value, 'market')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.market')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="market1">Market 1</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.bookmaker}
        onValueChange={(value) => handleFilter(value, 'bookmaker')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.bookmaker')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="betclic">Betclic</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <DatePicker
          date={filters.period.start}
          setDate={(value) => {
            setFilters((prev) => ({
              ...prev,
              period: { ...prev.period, start: value },
            }));
          }}
          className="border-border rounded-r-none border"
        />
        <DatePicker
          date={filters.period.end}
          setDate={(value) => {
            setFilters((prev) => ({
              ...prev,
              period: { ...prev.period, end: value },
            }));
          }}
          className="border-border rounded-l-none border"
        />
      </div>
    </div>
  );
};

export default DashboardFilters;
