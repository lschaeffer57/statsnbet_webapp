import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {  useNavigate } from 'react-router';

import { TrainingIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { RoutesEnum } from '@/enums/router';

export const TrainingVideo = () => {
  const { t } = useTranslation('training');
  const navigate = useNavigate();

  const videoData = {
    title: '01 - Comprendre l\'environnement des paris',
    optionTitle: 'Bookmakers (définition, différents types, différences ANJ/HA...)',
    videoUrl: 'https://example.com/video/bookmakers',
  };

  const handleBackToTraining = () => {
    navigate(RoutesEnum.TRAINING);
  };

  return (
    <div className='relative z-[9999]'>
      <header className="flex items-center justify-between border-b px-8 pb-8">
        <div className="flex items-center gap-1.5">
          <TrainingIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">{t('title')}</h1>
        </div>
        <LanguageSwitcher />
      </header>

      <div className="px-8 py-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={handleBackToTraining}
              className="flex items-center gap-1 cursor-pointer"
            >
              {t('title')}
            </button>
            <ChevronLeft className="size-4 rotate-180" />
            <span>
              {videoData.optionTitle}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-[16px] font-medium font-geist text-white">
              {videoData.optionTitle}
            </h2>

            <div className="flex w-full h-auto justify-center">
              <div className="relative w-full">
                <img
                  src="/images/video.png"
                  className="h-full w-full rounded-lg"
                  alt="video"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
