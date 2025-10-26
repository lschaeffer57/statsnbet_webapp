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
      <div
        style={{ position: 'relative', paddingTop: '36.25%', width: '100%' }}
      >
        <iframe
          title="video"
          src="https://iframe.mediadelivery.net/embed/510725/072af899-abb1-437c-ab30-dc2a3838fc2c?autoplay=true&loop=false&muted=false&preload=true&responsive=true"
          loading="lazy"
          style={{
            border: 0,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            height: '100%',
            width: '100%',
            maxWidth: '818px',
          }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowFullScreen={true}
        />
      </div>
    </div>
  );
};
