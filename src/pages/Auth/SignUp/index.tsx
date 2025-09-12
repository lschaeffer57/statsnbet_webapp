import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TelegramIcon } from '@/assets/icons';
import { PerformanceParameters } from '@/components/PerformanceParameters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export const SignUp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('auth');

  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[540px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            {t('signup.title')}
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[80%] text-center text-base font-normal">
              {t('signup.description')}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <Input
              placeholder={t('signup.form.namePlaceholder')}
              className="w-full"
            />
            <Input
              placeholder={t('signup.form.emailPlaceholder')}
              className="w-full"
            />
            <Input
              placeholder={t('signup.form.passwordPlaceholder')}
              className="w-full"
            />
          </div>
          <div className="bg-input h-[1px] w-full" />
          <Card className="shadow-glass-lg flex flex-row items-start gap-4">
            <div className="shadow-glass-lg bg-card rounded-full p-3">
              <TelegramIcon className="size-5 shrink-0" />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-base font-medium">
                {t('signup.telegram.title')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('signup.telegram.description')}
              </p>
            </div>
          </Card>
          <PerformanceParameters
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            showConfiguration={false}
          />

          <div className="bg-input h-[1px] w-full" />
          <Button className="w-full">{t('signup.createAccountButton')}</Button>
        </div>
      </div>
    </div>
  );
};
