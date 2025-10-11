import { format } from 'date-fns';
import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { TelegramUser } from '@/types';

import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Skeleton } from './ui/Skeleton';

interface TelegramConnectProps {
  isLoading?: boolean;
  telegramData: TelegramUser | undefined;
  onConnect: (userData: TelegramUser) => void;
  onDelete: () => void;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

const TelegramConnect = ({
  isLoading,
  telegramData,
  onConnect,
  onDelete,
}: TelegramConnectProps) => {
  const { t } = useTranslation('common');
  const widgetRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';

      window.onTelegramAuth = function (user: TelegramUser) {
        onConnect(user);
      };

      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute(
        'data-telegram-login',
        import.meta.env.VITE_TELEGRAM_BOT_USERNAME,
      );
      script.setAttribute('data-size', 'small');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');

      widgetRef.current.appendChild(script);
    }

    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [onConnect]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth <= 1) {
      setImageError(true);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[162px]" />;
  }

  return telegramData ? (
    <Card
      className="shadow-glass-lg flex flex-row items-start gap-4 cursor-pointer"
      onClick={() => {
        const widget = widgetRef.current;
        if (!widget) return;

        const button = widget.querySelector('iframe');
        if (button) {
          button.contentWindow?.focus();
          button.click?.();
        } else {
          const innerButton = widget.querySelector('script, div, a, button');
          if (innerButton) {
            (innerButton as HTMLElement).click?.();
          }
        }
      }}
    >

    <div className="flex flex-row items-center gap-4">
        {imageError ? (
          <div className="size-11 rounded-full">
            <img
              src={telegramData?.photo_url}
              alt="Telegram"
              className="w-full shrink-0 rounded-full"
              onLoad={handleImageLoad}
            />
          </div>
        ) : (
          <div className="shadow-glass-lg bg-background flex size-11 items-center justify-center rounded-full p-3">
            <span className="text-foreground block text-xl font-medium">
              {telegramData?.first_name?.[0]}
            </span>
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-foreground text-base font-medium">
            @{telegramData?.username}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('telegram.lastConnection')}{' '}
            {telegramData?.auth_date &&
              format(
                new Date(Number(telegramData.auth_date) * 1000),
                'dd/MM/yyyy',
              )}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        className="from-muted !bg-gradient-to-b to-transparent opacity-100"
        size="sm"
        onClick={onDelete}
      >
        {t('telegram.reconnect')}
      </Button>
    </Card>
  ) : (
    <Card className="shadow-glass-lg flex flex-row items-start gap-4">
      <div className="shadow-glass-lg bg-card rounded-full p-3">
        <div className="overflow-hidden rounded-full">
          <div
            ref={widgetRef}
            className="inset-0 z-100 w-5 -translate-x-1 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-foreground text-base font-medium">
          {t('telegram.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('telegram.description')}
        </p>
      </div>
    </Card>
  );
};

export default TelegramConnect;
