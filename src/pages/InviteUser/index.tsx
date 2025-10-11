import { useAuth } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { userApi } from '@/api/userApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoutesEnum } from '@/enums/router';

export const InviteUser = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { getToken } = useAuth();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const inviteUserMutation = useMutation({
    mutationFn: userApi.inviteUser,
    onMutate: () => {
      setError('');
      setSuccess('');
    },
    onSuccess: () => {
      setEmail('');
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
    inviteUserMutation.mutate({ email, token });
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
          <div className="space-y-2">
            <Input
              type="email"
              placeholder={t('invite.form.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
            {success && <p className="text-xs text-green-500">{success}</p>}
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={!email || inviteUserMutation.isPending}
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
