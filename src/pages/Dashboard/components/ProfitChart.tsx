import { format } from 'date-fns';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

import { CustomTooltip, CustomLegend } from '@/components/ui/Chart';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { ChartData, DailyStats } from '@/types';

interface ProfitChartProps {
  isPublic?: boolean;
  data: ChartData[] | DailyStats[];
  cumulativeRealGain: number;
  isDate: boolean;
  setIsDate: (isDate: boolean) => void;
  setBankroll?: (bankroll: string) => void;
  bankroll?: string;
}

const ProfitChart = ({
  isPublic = false,
  data,
  isDate,
  setIsDate,
  cumulativeRealGain,
  setBankroll,
  bankroll,
}: ProfitChartProps) => {
  const { t } = useTranslation('dashboard');
  return (
    <section className="h-[400px] w-full px-7 py-6">
      <div className="flex items-start gap-6">
        <div className="mb-6 space-y-3">
          <h3 className="text-foreground/50 text-sm">
            {isPublic ? t('chart.simulation') : t('chart.totalProfit')}
          </h3>
          <p className="bg-gradient-to-b from-[#28FCE0] to-[#00CAAF] bg-clip-text text-xl font-medium text-transparent">
            {data.length === 0
              ? '--'
              : cumulativeRealGain.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
          </p>
        </div>
        {isPublic && (
          <DebounceInput
            minLength={0}
            debounceTimeout={300}
            placeholder={t('chart.baseBankroll')}
            value={bankroll}
            onChange={(e) => setBankroll?.(e.target.value)}
            element={Input}
            className={cn(
              'z-50 w-50',
              !bankroll && 'shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]',
            )}
          />
        )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            horizontalPoints={Array.from({ length: 30 }, (_, i) => i * 10)}
            verticalPoints={[0]}
          />
          <XAxis
            dataKey={isDate ? 'date' : 'betNumber'}
            stroke={'rgba(255,255,255,0.5)'}
            tick={{ fontSize: 12 }}
            tickCount={!isDate ? 31 : undefined}
            axisLine={false}
            tickLine={false}
            minTickGap={50}
            domain={!isDate ? ['dataMin', 'dataMax'] : undefined}
            tickFormatter={
              isDate
                ? (value) => {
                    const date = new Date(value);

                    if (isNaN(date.getTime())) return '';

                    return format(date, 'dd/MM/yy');
                  }
                : undefined
            }
          />

          <YAxis
            yAxisId="profit"
            stroke={'rgba(255,255,255,0.5)'}
            tick={{ fontSize: 12 }}
            dataKey={isDate ? 'profit' : 'realGain'}
            tickCount={8}
            axisLine={false}
            tickLine={false}
          />

          {isDate && (
            <YAxis
              yAxisId="bars"
              orientation="right"
              domain={[0, 'dataMax']}
              hide
            />
          )}

          {isDate ? (
            <>
              <Tooltip content={<CustomTooltip data={data} />} />

              <Line
                type="linear"
                yAxisId="profit"
                dataKey="profit"
                stroke="#3B4EE0"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />

              <Bar
                dataKey="gainTotal"
                yAxisId="bars"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
                activeBar={{
                  stroke: '#FFFFFF',
                  strokeWidth: 1,
                }}
              >
                {data.map((entry, index) => {
                  const netGain =
                    'gainTotal' in entry
                      ? entry.gainTotal - entry.lossTotal
                      : 0;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={netGain >= 0 ? '#42be4870' : '#be424270'}
                    />
                  );
                })}
              </Bar>
            </>
          ) : (
            <>
              <Line
                type="linear"
                dataKey="realGain"
                stroke="#3B4EE0"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                  fill: '#3B4EE0',
                }}
              />

              <Line
                type="linear"
                dataKey="theoreticalGain"
                stroke="#ffffff50"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                  fill: '#ffffff50',
                }}
              />
            </>
          )}

          <Legend
            content={<CustomLegend isDate={isDate} setIsDate={setIsDate} />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
};

export default ProfitChart;
