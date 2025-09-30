import { useTranslation } from 'react-i18next';

import type { ChartData, DailyStats } from '@/types';

import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Label } from './Label';

interface CustomTooltipProps {
  active?: boolean;
  payload?: unknown[];
  label?: string;
  data: ChartData[] | DailyStats[];
}

interface CustomLegendProps {
  isDate: boolean;
  setIsDate: (isDate: boolean) => void;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  data,
}: CustomTooltipProps) => {
  const { t } = useTranslation('dashboard');
  if (active && payload && payload.length && label) {
    const entry = data.find((item) => item.date === label);

    if (entry && 'gainTotal' in entry) {
      return (
        <Card className="text-foreground flex-row gap-[13px] rounded-[10px] px-2.5 py-1 backdrop-blur-md">
          <div className="space-y-0.5">
            <p className="text-foreground font-mediun text-sm">
              {entry.gainTotal.toFixed(0)}€
            </p>
            <p className="text-foreground/50 text-xs">
              {t('chart.tooltip.totalGain')}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-foreground font-mediun text-sm">
              {entry.lossTotal.toFixed(0)}€
            </p>
            <p className="text-foreground/50 text-xs">
              {t('chart.tooltip.totalLoss')}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-foreground font-mediun text-sm">
              {entry.betCount}
            </p>
            <p className="text-foreground/50 text-xs">
              {t('chart.tooltip.betCount')}
            </p>
          </div>
        </Card>
      );
    }
  }
  return null;
};

const CustomLegend = ({ isDate, setIsDate }: CustomLegendProps) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <Label>
          <Checkbox
            checked={!isDate}
            onCheckedChange={() => setIsDate(false)}
            className="rounded-full"
          />
          {t('chart.legend.numberOfBets')}
        </Label>
        <Label>
          <Checkbox
            checked={isDate}
            onCheckedChange={() => setIsDate(true)}
            className="rounded-full"
          />
          {t('chart.legend.dates')}
        </Label>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-[4px] bg-[#3B4EE0]" />
          <p className="text-foreground text-sm">
            {t('chart.legend.totalProfit')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-[4px] bg-[#FFFFFF40]" />
          <p className="text-foreground text-sm">
            {t('chart.legend.theoreticalGain')}
          </p>
        </div>
      </div>
    </div>
  );
};

export { CustomTooltip, CustomLegend };
