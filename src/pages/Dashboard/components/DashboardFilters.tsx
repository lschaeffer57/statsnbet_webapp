import { useQuery } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { bookmakersApi } from '@/api/bookmakersApi';
import { FilterLinesIcon, XCircleIcon } from '@/assets/icons';
import RangeFilter from '@/components/RangeFilter';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from '@/components/ui/Select';
import { DEFAULT_FILTERS } from '@/constants';
import { cn } from '@/lib/utils';
import type { DashboardFiltersI, UserDocument } from '@/types';

interface DashboardFiltersProps {
  filters: DashboardFiltersI;
  setFilters: Dispatch<SetStateAction<DashboardFiltersI>>;
  className?: string;
  isPublic?: boolean;
  userData?: UserDocument[];
}

const DashboardFilters = ({
  filters,
  setFilters,
  className,
  isPublic = false,
  userData,
}: DashboardFiltersProps) => {
  const { t } = useTranslation('dashboard');

  const { data: bookmakers } = useQuery(
    bookmakersApi.getBookmakersQueryOptions(),
  );

  const handleFilter = (value: string, filterKey: string) => {
    setFilters((prev: DashboardFiltersI) => {
      if (
        filterKey === 'bookmaker' ||
        filterKey === 'sport' ||
        filterKey === 'market'
      ) {
        const currentValues = prev[filterKey] ? prev[filterKey].split(',') : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        return { ...prev, [filterKey]: newValues.join(',') };
      } else {
        return { ...prev, [filterKey]: value };
      }
    });
  };

  return (
    <div className={cn('mt-16 flex flex-wrap gap-2.5 px-7', className)}>
      {!isPublic && (
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
            {userData?.map((user) => (
              <SelectItem
                key={user.config_number}
                value={user.config_number.toString()}
              >
                {`${t('filters.configuration')} ${user.config_number}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <RangeFilter
        filterKey="liquidity"
        filters={filters}
        setFilters={setFilters}
        translationKey="filters.liquidity"
      />

      <RangeFilter
        filterKey="payout_rate"
        filters={filters}
        setFilters={setFilters}
        translationKey="filters.payout"
      />

      <RangeFilter
        filterKey="ev"
        filters={filters}
        setFilters={setFilters}
        translationKey="filters.ev"
      />

      <Select
        value={filters.sport}
        onValueChange={(value) => handleFilter(value, 'sport')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b capitalize"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.sport')}>
            {filters.sport
              ? `${t('filters.sport')} (${filters.sport.split(',').length})`
              : t('filters.sport')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {['football', 'tennis', 'basketball'].map((sport) => (
            <SelectItem
              isSelected={filters.sport.split(',').includes(sport)}
              value={sport}
              key={sport}
              className="capitalize"
            >
              {sport}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.market}
        onValueChange={(value) => handleFilter(value, 'market')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b capitalize"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.market')}>
            {filters.market
              ? `${t('filters.market')} (${filters.market.split(',').length})`
              : t('filters.market')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {['moneyline', 'over_under', 'handicap', 'player_performance'].map(
            (market) => (
              <SelectItem
                isSelected={filters.market.split(',').includes(market)}
                value={market}
                key={market}
                className="capitalize"
              >
                {market.split('_').join(' ')}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Select
        value={filters.bookmaker}
        onValueChange={(value) => handleFilter(value, 'bookmaker')}
      >
        <SelectTrigger
          size="sm"
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b capitalize"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.bookmaker')}>
            {filters.bookmaker
              ? `${t('filters.bookmaker')} (${filters.bookmaker.split(',').length})`
              : t('filters.bookmaker')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {bookmakers?.map((item) => (
            <SelectItem
              key={item.cloneName}
              value={item.cloneName.toLowerCase()}
              isSelected={filters.bookmaker
                .split(',')
                .includes(item.cloneName.toLowerCase())}
              className="capitalize"
            >
              {item.cloneName}
            </SelectItem>
          ))}
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
      {Object.entries(filters).some(
        ([key, value]) =>
          value !== DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS],
      ) && (
        <Button
          variant="secondary"
          size="sm"
          className="from-input !shadow-glass to-muted bg-gradient-to-b opacity-100"
          onClick={() => setFilters(DEFAULT_FILTERS)}
        >
          <XCircleIcon className="size-4" />
          {t('filters.clearAllFilters')}
        </Button>
      )}
    </div>
  );
};

export default DashboardFilters;
