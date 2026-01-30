import { PlayIcon, Plus, Trash2, Star } from 'lucide-react';
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
  onDelete?: () => void;
  onToggleFavorite?: () => void; // Add this
  isFavorite?: boolean; // Add this
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
    onDelete,
    onToggleFavorite,
    isFavorite,
  }: PerformanceParametersProps) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const { t } = useTranslation('auth');

    const maxConfigurationNumber = useMemo(() => {
      return (
        userData?.reduce((max, user) => Math.max(max, user.config_number), 0) ||
        0
      );
    }, [userData]);

    const isNewConfiguration = useMemo(() => {
      if (!configuration) return true;
      return parseInt(configuration) > maxConfigurationNumber;
    }, [configuration, maxConfigurationNumber]);

    return (
      <Card className={cn('shadow-glass-lg items-start gap-4', className)}>
        <h2 className="text-foreground text-base font-medium">
          {t('signup.performanceParameters.title')}
        </h2>
        <div className="flex w-full justify-end">
          <div className="flex items-center gap-2">
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
                  className="w-[180px]"
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
                      <div className="flex w-full items-center justify-between gap-2">
                        <span>
                          {t('signup.performanceParameters.configuration')}{' '}
                          {user.config_number}
                        </span>
                        {user.active_config && (
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value={(maxConfigurationNumber + 1).toString()}>
                    <Plus className="text-foreground/50 size-3" />{' '}
                    {t('signup.performanceParameters.newConfiguration')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* FAVORITE BUTTON */}
            {!isNewConfiguration && onToggleFavorite && (
              <Button
                variant={isFavorite ? 'secondary' : 'outline'}
                size="icon"
                type="button"
                className={cn(
                  'size-8 rounded-[10px] transition-all',
                  isFavorite
                    ? 'shadow-glass border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20'
                    : 'border-card-border hover:bg-card text-muted-foreground hover:text-foreground',
                )}
                onClick={onToggleFavorite}
                disabled={isPending}
                title="Set as Default"
              >
                <Star
                  className={cn(
                    'size-4 transition-colors',
                    isFavorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground',
                  )}
                />
              </Button>
            )}

            {/* DELETE BUTTON */}
            {!isNewConfiguration && onDelete && (
              <Button
                variant="outline"
                size="icon"
                type="button"
                className="border-card-border shadow-glass size-8 rounded-[10px] border-red-500/50 bg-red-500/10 text-red-500 transition-all hover:border-red-500/70 hover:bg-red-500/20"
                disabled={isPending}
                onClick={onDelete}
                title="Delete configuration"
              >
                <Trash2 className="size-4" />
              </Button>
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
          isNewConfiguration={isNewConfiguration}
          userData={userData}
          configuration={configuration}
        />

        {isVideoModalOpen && (
          <PerformanceParametersVideoModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
          />
        )}
      </Card>
    );
  },
);

PerformanceParameters.displayName = 'PerformanceParameters';
