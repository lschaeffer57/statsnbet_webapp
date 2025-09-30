import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { RoutesEnum } from '@/enums/router';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleAccessPlatform = () => {
    navigate(RoutesEnum.SIGN_UP);
  };

  return (
    <div className="mt-[112px] flex flex-col items-center gap-11">
      <div className="max-w-[520px] space-y-4">
        <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
          {t('onboarding.title')}
        </h1>
        <div className="flex justify-center">
          <p className="text-muted-foreground max-w-[90%] text-center text-base font-normal">
            {t('onboarding.description')}
          </p>
        </div>
      </div>
      <Button onClick={handleAccessPlatform}>
        {t('onboarding.accessPlatformButton')}
      </Button>
      <img
        src="/images/video.png"
        className="h-auto w-full max-w-[818px]"
        alt="video"
      />
    </div>
  );
};
