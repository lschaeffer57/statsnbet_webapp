import { format } from 'date-fns';
import { PlayIcon, Plus } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { AuthFormValues, UserDocument } from '@/types';

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
  configuration?: string | undefined;
  setConfiguration?: (data: string) => void;
  className?: string;
  isLoading?: boolean;
  isPending?: boolean;
  userData?: UserDocument[] | undefined;
}

export const PerformanceParameters = memo(
  ({
    showConfiguration = true,
    setPerformanceParameters,
    performanceParameters,
    onReset,
    resetTrigger,
    configuration,
    setConfiguration,
    className,
    isLoading,
    isPending,
    userData,
  }: PerformanceParametersProps) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const { t } = useTranslation('auth');

    const maxConfigurationNumber = useMemo(() => {
      return (
        userData?.reduce((max, user) => Math.max(max, user.config_number), 0) ||
        0
      );
    }, [userData]);

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
              disabled={isPending}
              onClick={() => setIsVideoModalOpen(true)}
            >
              <PlayIcon className="size-3" />
            </Button>
            {showConfiguration && (
              <Select value={configuration} onValueChange={setConfiguration}>
                <SelectTrigger
                  size="sm"
                  disabled={isPending}
                  isLoading={isLoading || !configuration}
                >
                  <SelectValue
                    placeholder={t(
                      'signup.performanceParameters.selectPlaceholder',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {userData?.map((user) => (
                    <SelectItem
                      key={user.config_number}
                      value={user.config_number.toString()}
                    >
                      {t('signup.performanceParameters.configuration')}{' '}
                      {user.config_number}{' '}
                      <span className="text-xs">
                        ({format(user.updated_at, 'dd/MM')})
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value={(maxConfigurationNumber + 1).toString()}>
                    <Plus className="text-foreground/50 size-3" />{' '}
                    {t('signup.performanceParameters.newConfiguration')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onReset}
              disabled={isPending}
            >
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
          isPending={isPending}
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
