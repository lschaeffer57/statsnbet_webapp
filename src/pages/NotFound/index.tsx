import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { RoutesEnum } from '@/enums/router';

export const NotFound = () => {
  const { isSignedIn } = useUser();
  const { t } = useTranslation('common');

  const target = isSignedIn ? RoutesEnum.DASHBOARD : RoutesEnum.LOGIN;
  const label = isSignedIn
    ? t('notFound.ctaDashboard')
    : t('notFound.ctaLogin');

  return (
    <div className="relative flex min-h-svh items-center justify-center px-6 py-16">
      <div className="fixed top-[30px] right-[30px]">
        <LanguageSwitcher />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/30 via-cyan-500/20 to-amber-400/30" />
      <div className="absolute top-1/2 left-1/2 -z-10 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_60%)] blur-2xl" />

      <div className="from-muted/40 mx-auto w-full max-w-xl rounded-2xl border bg-gradient-to-b to-transparent p-10 text-center backdrop-blur-[25px]">
        <div className="text-foreground/70 mb-6 inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs">
          {t('notFound.badge')}
        </div>
        <h1 className="font-instrument mb-3 text-5xl leading-tight font-semibold tracking-tight">
          {t('notFound.title')}
        </h1>
        <p className="text-muted-foreground mb-8 text-base">
          {t('notFound.description')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to={target}>
            <Button size="sm" variant="secondary">
              {label}
            </Button>
          </Link>
          <Link to={RoutesEnum.PUBLIC_DASHBOARD}>
            <Button size="sm" variant="ghost">
              {t('notFound.ctaPublic')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
