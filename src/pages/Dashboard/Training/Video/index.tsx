import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';

import { courseApi } from '@/api/courseApi';
import { TrainingIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoutesEnum } from '@/enums/router';
import type { Locale } from '@/types';

export const TrainingVideo = () => {
  const { t } = useTranslation('training');
  const navigate = useNavigate();
  const locale = localStorage.getItem('lng') as Locale;
  const { videoId = '' } = useParams();
  const { state } = useLocation() as {
    state?: {
      moduleId: string;
      optionId: string;
      moduleTitle: string;
      optionTitle: string;
      videoUrl: string;
    };
  };

  const [first, ...rest] = useMemo(() => videoId.split('-'), [videoId]);
  const moduleId = state?.moduleId ?? first;
  const optionId = state?.optionId ?? rest.join('-');

  const { data } = useQuery({
    ...courseApi.getCoursesQueryOptions(),
    enabled: !state?.moduleTitle || !state?.optionTitle || !state?.videoUrl,
  });

  const moduleData = data?.find((m) => m.moduleId === moduleId);
  const optionData = moduleData?.options.find((o) => o.id === optionId);

  const title =
    state?.moduleTitle ?? moduleData?.title[locale] ?? 'Error module';
  const optionTitle =
    state?.optionTitle ?? optionData?.label[locale] ?? 'Not found';
  const videoUrl = state?.videoUrl ?? optionData?.videoUrl[locale];

  const handleBackToTraining = () => {
    navigate(RoutesEnum.TRAINING);
  };

  return (
    <div className="relative z-[9999]">
      <header className="flex items-center justify-between border-b px-8 pb-8">
        <div className="flex items-center gap-1.5">
          <TrainingIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">{t('title')}</h1>
        </div>
        <LanguageSwitcher />
      </header>

      <div className="px-8 py-6">
        <div className="space-y-6">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <button
              onClick={handleBackToTraining}
              className="flex cursor-pointer items-center gap-1"
            >
              {t('title')}
            </button>
            <ChevronLeft className="size-4 rotate-180" />
            {title ? (
              <span>{title}</span>
            ) : (
              <Skeleton className="h-[14px] w-1/2" />
            )}
          </div>

          <div className="space-y-4">
            {optionTitle ? (
              <h2 className="font-geist text-[16px] font-medium text-white">
                {optionTitle}
              </h2>
            ) : (
              <Skeleton className="h-[16px] w-1/2" />
            )}

            {videoUrl ? (
              <div className="relative flex w-full justify-center">
                <iframe
                  title="video"
                  src={videoUrl}
                  loading="lazy"
                  className="h-[360px] w-[720px] rounded-lg"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen={true}
                />
              </div>
            ) : (
              <Skeleton className="h-[360px] w-[720px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
