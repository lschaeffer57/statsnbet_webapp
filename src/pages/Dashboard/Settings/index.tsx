import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { userApi } from '@/api/userApi';
import { AccountIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { PerformanceParameters } from '@/components/PerformanceParameters';
import TelegramConnect from '@/components/TelegramConnect';
import { Card } from '@/components/ui/Card';
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

  // Calculate the next available config number for "New Configuration"
  const maxConfigNumber = useMemo(() => {
    return userData?.reduce((max, u) => Math.max(max, u.config_number), 0) || 0;
  }, [userData]);

  const currentConfig = useMemo(
    () => userData?.find((u) => u.active_config) || userData?.[0],
    [userData],
  );

  const [configuration, setConfiguration] = useState<string | undefined>(
    currentConfig?.config_number.toString(),
  );

  // Sync state when data loads
  useEffect(() => {
    if (userData && currentConfig && !configuration) {
      const configNum = currentConfig.config_number.toString();
      setConfiguration(configNum);
      setPerformanceParameters(transformUserDataToParameters(currentConfig));
      setTelegram(userData.find((u) => u.telegram?.id)?.telegram);
    }
  }, [userData, currentConfig, configuration]);

  const {
    addConfig,
    switchConfig,
    updateConfig, // New mutation
    deleteConfig, // New mutation
    connectTelegram,
    deleteTelegram,
    error,
    isInvalidating,
    isPending,
  } = useSettingsMutation(user?.id || '');

  // Handle Dropdown Change - VIEW ONLY, DO NOT ACTIVATE
  const handleSetConfiguration = (newConfigId: string) => {
    setConfiguration(newConfigId);

    const isNew = parseInt(newConfigId) > maxConfigNumber;

    if (isNew) {
      setPerformanceParameters(DEFAULT_PERFORMANCE_PARAMETERS);
      setResetTrigger((prev) => prev + 1);
    } else {
      const selectedConfig = userData?.find(
        (u) => u.config_number.toString() === newConfigId,
      );
      if (selectedConfig) {
        setPerformanceParameters(transformUserDataToParameters(selectedConfig));
        // REMOVED: The auto-switch active_config logic
      }
    }
  };

  // NEW: Handle Toggle Favorite
  const handleToggleFavorite = () => {
    if (!user || !configuration) return;
    // Call the switch API to make THIS config the active one
    switchConfig.mutate(
      {
        clerkId: user.id,
        configNumber: parseInt(configuration),
      },
      {
        onSuccess: () => {
          toast.success(t('configSetAsDefault'));
        },
      },
    );
  };

  // Determine if current view is favorite
  const isCurrentFavorite = useMemo(() => {
    if (!userData || !configuration) return false;
    const config = userData.find(
      (u) => u.config_number.toString() === configuration,
    );
    return !!config?.active_config;
  }, [userData, configuration]);

  // Handle Save (Create OR Update)
  const handleSaveConfig = (data: AuthFormValues) => {
    if (!user || !configuration) return;

    const configNum = parseInt(configuration);
    const isNew = configNum > maxConfigNumber;

    if (isNew) {
      addConfig.mutate(
        {
          clerkId: user.id,
          configNumber: configNum,
          performanceParameters: data,
          userInfo: {
            email: user.emailAddresses[0].emailAddress || '',
            username: user.username || '',
            bot_activated: !!telegram,
            telegram,
            bankroll_current: null,
            subscription: {
              active: true,
              begin: new Date(),
              end: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              ), // Mock expiry
            },
          },
        },
        {
          onSuccess: () => {
            toast.success(t('configSavedSuccessfully'));
          },
        },
      );
    } else {
      updateConfig.mutate(
        {
          clerkId: user.id,
          configNumber: configNum,
          performanceParameters: data,
        },
        {
          onSuccess: () => {
            toast.success(t('configSavedSuccessfully'));
          },
        },
      );
    }
  };

  // Handle Delete
  const handleDeleteConfig = () => {
    if (!user || !configuration) return;
    if (confirm(t('deleteConfigConfirm'))) {
      deleteConfig.mutate(
        {
          clerkId: user.id,
          configNumber: parseInt(configuration),
        },
        {
          onSuccess: () => {
            toast.success(t('configDeletedSuccessfully'));
            // Reset to first available config or new config
            const remainingConfigs = userData?.filter(
              (u) => u.config_number.toString() !== configuration,
            );
            if (remainingConfigs && remainingConfigs.length > 0) {
              setConfiguration(remainingConfigs[0].config_number.toString());
            } else {
              // No configs left, create new one
              setConfiguration((maxConfigNumber + 1).toString());
            }
          },
        },
      );
    }
  };

  if (!user) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <Spinner className="h-[50px] w-[50px]" />
      </div>
    );
  }

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
            onDelete={() => deleteTelegram.mutate(user.id)}
            onConnect={(telegramUser) => {
              setTelegram(telegramUser);
              connectTelegram.mutate({ telegramUser, userId: user.id });
            }}
          />
          {/* Subscription Card (Static for now) */}
          <Card className="gap-5 p-5">
            {/* ... (Keep existing subscription card code) ... */}
            <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
              {t('subscription.current')}
            </p>
            <div className="border-border-dashed w-full border-b border-dashed" />
            <div className="flex items-center justify-between">
              <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
                {t('subscription.startDate')}
              </p>
              <p className="text-foreground text-sm leading-5 font-medium -tracking-[.04em]">
                29/01/2026
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
                {t('subscription.endDate')}
              </p>
              <p className="text-foreground text-sm leading-5 font-medium -tracking-[.04em]">
                01/01/2030
              </p>
            </div>
            <div className="border-border-dashed w-full border-b border-dashed" />
          </Card>
        </div>

        <PerformanceParameters
          configuration={configuration}
          setConfiguration={handleSetConfiguration}
          userData={userData}
          onReset={() => {
            setPerformanceParameters(DEFAULT_PERFORMANCE_PARAMETERS);
            setResetTrigger((prev) => prev + 1);
          }}
          resetTrigger={resetTrigger}
          className="!shadow-glass min-w-[500px] flex-1"
          performanceParameters={performanceParameters}
          isLoading={isLoading}
          isPending={isPending}
          setPerformanceParameters={handleSaveConfig} // Connected to Save
          onDelete={handleDeleteConfig} // Connected to Delete
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isCurrentFavorite}
          showConfiguration={true}
        />
      </section>
    </div>
  );
};
