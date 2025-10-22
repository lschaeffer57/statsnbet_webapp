import type { Dispatch, SetStateAction } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';

import { FilterLinesIcon } from '@/assets/icons';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import type { DashboardFiltersI } from '@/types';

interface RangeFilterProps {
  filterKey: keyof Pick<DashboardFiltersI, 'liquidity' | 'payout_rate' | 'ev'>;
  filters: DashboardFiltersI;
  setFilters: Dispatch<SetStateAction<DashboardFiltersI>>;
  translationKey: string;
}

const RangeFilter = ({
  filterKey,
  filters,
  setFilters,
  translationKey,
}: RangeFilterProps) => {
  const { t } = useTranslation('dashboard');

  const handleValueChange = (field: 'more' | 'less', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        [field]: value || '',
      },
    }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          iconLeft={<FilterLinesIcon className="size-[14px]" />}
          size="sm"
          className="!shadow-glass from-input !bg-gradient-to-b to-transparent opacity-100"
        >
          {t(translationKey)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-foreground/50 block text-sm">
              {t(translationKey)}
            </span>
            <span className="text-foreground/50 block text-sm">≥</span>
            <DebounceInput
              minLength={0}
              debounceTimeout={300}
              placeholder="Min"
              value={filters[filterKey].more || ''}
              onChange={(e) => handleValueChange('more', e.target.value)}
              element={Input}
              className="w-15 px-2.5 py-0.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-foreground/50 block text-sm">
              {t(translationKey)}
            </span>
            <span className="text-foreground/50 block text-sm">≤</span>
            <DebounceInput
              minLength={0}
              debounceTimeout={300}
              placeholder="Max"
              value={filters[filterKey].less || ''}
              onChange={(e) => handleValueChange('less', e.target.value)}
              element={Input}
              className="w-15 px-2.5 py-0.5"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RangeFilter;
