import { format } from 'date-fns';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { XCircleIcon } from '@/assets/icons';
import { Separator } from '@/components/ui/Separator';
import { FILTER_LABELS } from '@/constants';
import type { DashboardFiltersI } from '@/types';

const ActiveFilters = ({
  filters,
  setFilters,
}: {
  filters: DashboardFiltersI;
  setFilters: Dispatch<SetStateAction<DashboardFiltersI>>;
}) => {
  const { t } = useTranslation('dashboard');

  const clearFilter = (key: keyof DashboardFiltersI) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (key === 'period') {
        newFilters.period = { start: undefined, end: undefined };
      } else if (typeof prev[key] === 'object') {
        (newFilters[key] as { more: string; less: string }) = {
          more: '',
          less: '',
        };
      } else {
        (newFilters[key] as string) = '';
      }

      return newFilters;
    });
  };

  return (
    <div className="mt-5 flex flex-wrap gap-1.5 px-7">
      {Object.entries(filters)
        .filter(([key, value]) => {
          if (key === 'period') {
            return value.start || value.end;
          } else if (typeof value === 'object') {
            return value.more || value.less;
          }
          return value;
        })
        .map(([key, value]) => {
          const filterKey = key as keyof typeof FILTER_LABELS;
          const translationKey = FILTER_LABELS[filterKey];

          return (
            <div
              key={key}
              className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] py-1 pr-3 pl-1.5"
            >
              <XCircleIcon
                className="size-4 cursor-pointer"
                onClick={() => clearFilter(key as keyof DashboardFiltersI)}
              />
              <span className="text-muted-foreground text-sm">
                {t(translationKey)}
              </span>
              {typeof value === 'string' ? (
                <>
                  <Separator orientation="vertical" />
                  <span className="text-foreground text-sm font-medium capitalize">
                    {value}
                  </span>
                </>
              ) : key === 'period' && (value.start || value.end) ? (
                <>
                  <Separator orientation="vertical" />
                  <span className="text-foreground text-sm font-medium">
                    {value.start && value.end
                      ? `${format(value.start, 'dd/MM')}-${format(value.end, 'dd/MM')}`
                      : value.start
                        ? `≥ ${format(value.start, 'dd/MM')}`
                        : `≤ ${format(value.end, 'dd/MM')}`}
                  </span>
                </>
              ) : typeof value === 'object' && (value.more || value.less) ? (
                <>
                  <Separator orientation="vertical" />
                  <span className="text-foreground text-sm font-medium">
                    {value.more && value.less
                      ? `${value.more} - ${value.less}`
                      : value.more
                        ? `≥ ${value.more}`
                        : `≤ ${value.less}`}
                  </span>
                </>
              ) : null}
            </div>
          );
        })}
    </div>
  );
};

export default ActiveFilters;
