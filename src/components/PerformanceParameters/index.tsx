import { PlayIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { AuthFormValues } from '@/types';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';

import { PerformanceParametersVideoModal } from './PerformanceParametersVideoModal';
import PerformanceTabs from './PerformanceTabs';

interface PerformanceParametersProps {
  showConfiguration?: boolean;
  setPerformanceParameters: (data: AuthFormValues) => void;
  performanceParameters: AuthFormValues;
  onReset: () => void;
  resetTrigger: number;
  className?: string;
  isLoading?: boolean;
}

export const PerformanceParameters = memo(
  ({
    showConfiguration = true,
    setPerformanceParameters,
    performanceParameters,
    onReset,
    resetTrigger,
    className,
    isLoading,
  }: PerformanceParametersProps) => {
    const [configuration, setConfiguration] = useState('conf1');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const { t } = useTranslation('auth');

    return (
      <Card className={cn('shadow-glass-lg items-start gap-4', className)}>
        <h2 className="text-foreground text-base font-medium">
          {t('signup.performanceParameters.title')}
        </h2>
        <span className="text-muted-foreground text-sm font-normal">
          {t('signup.performanceParameters.openSettings')}
        </span>
        <div className="flex w-full justify-end">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              type="button"
              className="mr-1"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <PlayIcon className="size-3" />
            </Button>
            {showConfiguration && (
              <Select value={configuration} onValueChange={setConfiguration}>
                <SelectTrigger size="sm">
                  <SelectValue
                    placeholder={t(
                      'signup.performanceParameters.selectPlaceholder',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conf1">
                    {t('signup.performanceParameters.configurations.conf1')}
                  </SelectItem>
                  <SelectItem value="conf2">
                    {t('signup.performanceParameters.configurations.conf2')}
                  </SelectItem>
                  <SelectItem value="conf3">
                    {t('signup.performanceParameters.configurations.conf3')}
                  </SelectItem>
                  <SelectItem value="conf4">
                    {t('signup.performanceParameters.configurations.conf4')}
                  </SelectItem>
                  <SelectItem value="conf-init">
                    {t('signup.performanceParameters.configurations.confInit')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" type="button" onClick={onReset}>
              {t('signup.performanceParameters.reset')}
            </Button>
          </div>
        </div>

        <div className="border-border-dashed mt-1 w-full border-b border-dashed" />

        <PerformanceTabs
          isLoading={isLoading}
          setPerformanceParameters={setPerformanceParameters}
          resetTrigger={resetTrigger}
          performanceParameters={performanceParameters}
        />

        <PerformanceParametersVideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
        />
      </Card>
    );
  },
);

PerformanceParameters.displayName = 'PerformanceParameters';
