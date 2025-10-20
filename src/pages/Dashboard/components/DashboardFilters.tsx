import { useQuery } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { bookmakersApi } from '@/api/bookmakersApi';
import { FilterLinesIcon } from '@/assets/icons';
import RangeFilter from '@/components/RangeFilter';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from '@/components/ui/Select';
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
    setFilters((prev: DashboardFiltersI) => ({
      ...prev,
      [filterKey]: value,
    }));
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
          className="from-input !shadow-glass !text-foreground to-muted bg-gradient-to-b"
        >
          <FilterLinesIcon className="size-[14px]" />
          <SelectValue placeholder={t('filters.sport')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="football">Football</SelectItem>
          <SelectItem value="tennis">Tennis</SelectItem>
          <SelectItem value="basketball">Basketball</SelectItem>
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
          <SelectItem value="moneyline">Moneyline</SelectItem>
          <SelectItem value="over/under">Over/under</SelectItem>
          <SelectItem value="handicap">Handicap</SelectItem>
          <SelectItem value="player-performance">Player performance</SelectItem>
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
          {bookmakers?.map((item) => (
            <SelectItem
              key={item.cloneName}
              value={item.cloneName.toLowerCase()}
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
    </div>
  );
};

export default DashboardFilters;
