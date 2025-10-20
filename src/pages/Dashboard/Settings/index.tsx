import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { userApi } from '@/api/userApi';
import { AccountIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { PerformanceParameters } from '@/components/PerformanceParameters';
import TelegramConnect from '@/components/TelegramConnect';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { DEFAULT_PERFORMANCE_PARAMETERS } from '@/constants';
import type { AuthFormValues, TelegramUser } from '@/types';

import EditClerkProfile from './components/EditClerkProfile';
import { useSettingsMutation } from './hooks/useSettingsMutation';
import { transformUserDataToParameters } from './utils';

export const SettingsPage = () => {
  const { t } = useTranslation('settings');
  const { user } = useUser();

  const [performanceParameters, setPerformanceParameters] = useState(
    DEFAULT_PERFORMANCE_PARAMETERS,
  );
  const [telegram, setTelegram] = useState<TelegramUser | undefined>(undefined);
  const [resetTrigger, setResetTrigger] = useState(0);

  const { data: userData, isLoading } = useQuery({
    ...userApi.getUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const currentConfig = useMemo(
    () => userData?.find((u) => u.active_config) || userData?.[0],
    [userData],
  );

  const [configuration, setConfiguration] = useState<string | undefined>(
    currentConfig?.config_number.toString(),
  );

  useEffect(() => {
    if (userData && currentConfig) {
      setConfiguration(currentConfig.config_number.toString());
      setPerformanceParameters(transformUserDataToParameters(currentConfig));
      setTelegram(userData[0].telegram);
    }
  }, [userData, currentConfig]);

  useEffect(() => {
    if (userData && configuration) {
      const selectedConfig = userData.find(
        (u) => u.config_number.toString() === configuration,
      );
      setPerformanceParameters(transformUserDataToParameters(selectedConfig));
    }
  }, [configuration, userData]);

  const { updateUser, connectTelegram, deleteTelegram, error, isInvalidating } =
    useSettingsMutation(user?.id || '');

  if (!user) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <Spinner className="h-[50px] w-[50px]" />
      </div>
    );
  }

  const handleUpdateUser = (
    clerkId: string,
    configNumber: string | undefined,
    performanceParameters: AuthFormValues,
  ) => {
    setPerformanceParameters(performanceParameters);
    if (configNumber) {
      updateUser.mutate({
        clerkId,
        configNumber: parseInt(configNumber),
        performanceParameters,
      });
    }
  };

  const handleReset = () => {
    if (userData) {
      setPerformanceParameters(DEFAULT_PERFORMANCE_PARAMETERS);
      setResetTrigger((prev) => prev + 1);
    }
  };

  const isPending =
    updateUser.isPending ||
    deleteTelegram.isPending ||
    connectTelegram.isPending;

  return (
    <div className="relative z-20">
      <header className="flex items-center justify-between border-b px-8 pb-8">
        <div className="flex items-center gap-1.5">
          <AccountIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">{t('title')}</h1>
        </div>
        <LanguageSwitcher />
      </header>
      <section className="mt-5 flex flex-wrap items-start gap-5 px-7">
        <div className="min-w-[350px] flex-1 space-y-5">
          <EditClerkProfile error={error} />

          <TelegramConnect
            telegramData={telegram}
            isLoading={isLoading || connectTelegram.isPending || isInvalidating}
            onDelete={() => {
              deleteTelegram.mutate(user.id);
            }}
            onConnect={(telegramUser) => {
              setTelegram(telegramUser);
              connectTelegram.mutate({
                telegramUser,
                userId: user.id,
              });
            }}
          />
          {isLoading ? (
            <Skeleton className="h-[184px] w-full" />
          ) : (
            <Card className="gap-5 p-5">
              <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
                {t('subscription.current')}
              </p>
              <div className="border-border-dashed w-full border-b border-dashed" />

              <div className="flex items-center justify-between">
                <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
                  {t('subscription.startDate')}
                </p>
                <p className="text-foreground text-sm leading-5 font-medium -tracking-[.04em]">
                  {userData?.[0]?.subscription?.begin
                    ? format(
                        new Date(userData[0].subscription.begin),
                        'dd/MM/yyyy',
                      )
                    : '25/08/2025'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
                  {t('subscription.endDate')}
                </p>
                <p className="text-foreground text-sm leading-5 font-medium -tracking-[.04em]">
                  {userData?.[0]?.subscription?.end
                    ? format(
                        new Date(userData[0].subscription.end),
                        'dd/MM/yyyy',
                      )
                    : '25/11/2025'}
                </p>
              </div>

              <div className="border-border-dashed w-full border-b border-dashed" />
            </Card>
          )}
        </div>
        <PerformanceParameters
          configuration={configuration}
          setConfiguration={setConfiguration}
          userData={userData}
          onReset={handleReset}
          resetTrigger={resetTrigger}
          className="!shadow-glass min-w-[500px] flex-1"
          performanceParameters={performanceParameters}
          isLoading={isLoading}
          isPending={isPending}
          setPerformanceParameters={(data) =>
            handleUpdateUser(user.id, configuration, data)
          }
          showConfiguration={true}
        />
      </section>
    </div>
  );
};
