import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { userApi } from '@/api/userApi';
import { AccountIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { PerformanceParameters } from '@/components/PerformanceParameters';
import TelegramConnect from '@/components/TelegramConnect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { DEFAULT_PERFORMANCE_PARAMETERS } from '@/constants';
import type { AuthFormValues, TelegramUser } from '@/types';

import { useSettingsMutation } from './hooks/useSettingsMutation';
import { useUpdateUser } from './hooks/useUpdateUser';
import { getInitials, transformUserDataToParameters } from './utils';

export const SettingsPage = () => {
  const { t } = useTranslation('settings');
  const { user } = useUser();

  const [performanceParameters, setPerformanceParameters] = useState(
    DEFAULT_PERFORMANCE_PARAMETERS,
  );
  const [telegram, setTelegram] = useState<TelegramUser | undefined>(undefined);
  const [resetTrigger, setResetTrigger] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateUser, connectTelegram, deleteTelegram, error, isInvalidating } =
    useSettingsMutation(user?.id || '');
  const {
    handlePasswordChange,
    handleImageSelect,
    handleImageUpload,
    isUploadingImage,
    isChangingPassword,
    passwordError,
    selectedImage,
    imagePreview,
    passwordData,
    setSelectedImage,
    setImagePreview,
    setPasswordData,
  } = useUpdateUser();

  const { data: userData, isLoading } = useQuery({
    ...userApi.getUser(user?.id || ''),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (userData) {
      setPerformanceParameters(transformUserDataToParameters(userData));
      setTelegram(userData.telegram);
    }
  }, [userData]);

  if (!user) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <Spinner className="h-[50px] w-[50px]" />
      </div>
    );
  }

  const handleUpdateUser = (
    clerkId: string,
    performanceParameters: AuthFormValues,
  ) => {
    setPerformanceParameters(performanceParameters);
    updateUser.mutate({
      clerkId,
      performanceParameters,
    });
  };

  const handleReset = () => {
    if (userData) {
      setPerformanceParameters(transformUserDataToParameters(userData));
      setResetTrigger((prev) => prev + 1);
    }
  };

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
          <Card className="gap-5 p-5">
            <h2 className="text-foreground text-lg font-medium">
              {t('profile.title')}
            </h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.hasImage && user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="profile"
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="text-lg font-medium text-white">
                      {getInitials(user?.firstName, user?.lastName)}
                    </span>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  iconLeft={<Camera className="size-4" />}
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('profile.uploadImageButton')}
                </Button>

                {selectedImage && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                      size="sm"
                      variant="default"
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="text-foreground text-base font-medium">
                {t('profile.changePassword')}
              </h3>

              <Input
                type="password"
                placeholder={t('profile.currentPassword')}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="text-white"
                required
              />

              <Input
                type="password"
                placeholder={t('profile.newPassword')}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="text-white"
                required
              />

              <Input
                type="password"
                placeholder={t('profile.confirmPassword')}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="text-white"
                required
              />

              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full"
              >
                {isChangingPassword
                  ? 'Updating...'
                  : t('profile.updatePassword')}
              </Button>
            </form>

            {(passwordError || error) && (
              <p className="text-destructive text-sm">
                {passwordError || error}
              </p>
            )}
          </Card>

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
                25/08/2025
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-foreground/50 text-sm leading-5 -tracking-[.04em]">
                {t('subscription.endDate')}
              </p>
              <p className="text-foreground text-sm leading-5 font-medium -tracking-[.04em]">
                25/11/2025
              </p>
            </div>

            <div className="border-border-dashed w-full border-b border-dashed" />
          </Card>
        </div>
        <PerformanceParameters
          onReset={handleReset}
          resetTrigger={resetTrigger}
          className="!shadow-glass min-w-[500px] flex-1"
          performanceParameters={performanceParameters}
          isLoading={isLoading}
          setPerformanceParameters={(data) => handleUpdateUser(user.id, data)}
          showConfiguration={true}
        />
      </section>
    </div>
  );
};
