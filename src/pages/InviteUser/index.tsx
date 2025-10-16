import { useAuth } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { userApi } from '@/api/userApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { RoutesEnum } from '@/enums/router';

export const InviteUser = () => {
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [subscriptionDuration, setSubscriptionDuration] = useState<
    number | null
  >(null);
  const [customDays, setCustomDays] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { getToken } = useAuth();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const subscriptionOptions = [
    { value: 30, label: t('invite.subscription.30days') },
    { value: 60, label: t('invite.subscription.60days') },
    { value: 90, label: t('invite.subscription.90days') },
    { value: 120, label: t('invite.subscription.120days') },
    { value: 180, label: t('invite.subscription.6months') },
    { value: 365, label: t('invite.subscription.1year') },
    { value: 'custom', label: t('invite.subscription.custom') },
  ];

  const roleOptions = [
    { value: 'user', label: t('invite.role.user') },
    { value: 'admin', label: t('invite.role.admin') },
  ];

  const inviteUserMutation = useMutation({
    mutationFn: userApi.inviteUser,
    onMutate: () => {
      setError('');
      setSuccess('');
    },
    onSuccess: () => {
      setEmail('');
      setUserRole('user');
      setSubscriptionDuration(null);
      setCustomDays('');
      setSelectedOption('');
      setSuccess(t('invite.form.successMessage'));
    },
    onError: (error) => {
      console.error(error);
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) {
      setError(t('invite.form.errorMessage'));
      return;
    }

    let finalDuration = subscriptionDuration;
    if (selectedOption === 'custom') {
      const customDaysNum = parseInt(customDays);
      if (isNaN(customDaysNum) || customDaysNum <= 0) {
        setError(t('invite.form.invalidCustomDays'));
        return;
      }
      finalDuration = customDaysNum;
    }

    if (finalDuration === null) {
      setError(t('invite.form.subscriptionRequiredMessage'));
      return;
    }

    inviteUserMutation.mutate({
      email,
      userRole,
      subscriptionDuration: finalDuration,
      token,
    });
  };

  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[507px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            {t('invite.title')}
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[90%] text-center text-base font-normal">
              {t('invite.description')}
            </p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('invite.form.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('invite.form.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('invite.form.roleLabel')}</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder={t('invite.form.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription">
                {t('invite.form.subscriptionLabel')}
              </Label>
              <Select
                value={selectedOption}
                onValueChange={(value) => {
                  setSelectedOption(value);
                  if (value !== 'custom') {
                    setSubscriptionDuration(parseInt(value));
                    setCustomDays('');
                  } else {
                    setSubscriptionDuration(null);
                  }
                }}
              >
                <SelectTrigger id="subscription" className="w-full">
                  <SelectValue
                    placeholder={t('invite.form.subscriptionPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOption === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customDays">
                    {t('invite.form.customDaysLabel')}
                  </Label>
                  <Input
                    id="customDays"
                    type="number"
                    placeholder={t('invite.form.customDaysPlaceholder')}
                    value={customDays}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === '' ||
                        (parseInt(value) > 0 && !isNaN(parseInt(value)))
                      ) {
                        setCustomDays(value);
                      }
                    }}
                    min="1"
                    className="[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              )}
            </div>
            {error && <p className="text-destructive text-xs">{error}</p>}
            {success && <p className="text-xs text-green-500">{success}</p>}
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={
              !email ||
              (!subscriptionDuration && selectedOption !== 'custom') ||
              (selectedOption === 'custom' && !customDays) ||
              inviteUserMutation.isPending
            }
            type="submit"
          >
            {t('invite.form.sendButton')}
          </Button>
        </form>
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RoutesEnum.DASHBOARD)}
            className="mt-4"
          >
            {t('invite.backToDashboard')}
          </Button>
        </div>
      </div>
    </div>
  );
};
