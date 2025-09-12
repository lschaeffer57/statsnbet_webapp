import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoutesEnum } from '@/enums/router';

export const Login = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[507px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            {t('login.title')}
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[90%] text-center text-base font-normal">
              {t('login.description')}
            </p>
          </div>
        </div>
        <div className="mx-auto w-[386px] space-y-9">
          <div className="space-y-5">
            <div className="space-y-3">
              <Input
                placeholder={t('login.emailPlaceholder')}
                className="w-full"
              />
              <Input
                placeholder={t('login.passwordPlaceholder')}
                className="w-full"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {t('login.forgotPassword')}{' '}
              <a
                href={RoutesEnum.FORGOT_PASSWORD}
                className="text-foreground text-sm font-medium"
              >
                {t('login.resetPasswordLink')}
              </a>
            </p>
            <div className="bg-border h-[1px] w-full" />
          </div>

          <Button className="w-full">{t('login.loginButton')}</Button>
        </div>
      </div>
    </div>
  );
};
