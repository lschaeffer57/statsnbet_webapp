import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { courseApi } from '@/api/courseApi';
import { RefreshIcon, TrainingIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CourseItem, Course, Locale } from '@/types';

export const Training = () => {
  const { t } = useTranslation('training');
  const locale = (localStorage.getItem('lng') ?? 'en') as Locale;
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: questions, isLoading } = useQuery({
    ...courseApi.getCoursesQueryOptions(),
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && questions && questions.length > 0) {
      setOpenId(questions[0].moduleId);
      initializedRef.current = true;
    }
  }, [questions]);

  const handleVideoClick = (question: Course, option: CourseItem) => {
    const videoId = `${question.moduleId}-${option.id}`;
    navigate(`/training/video/${videoId}`, {
      state: {
        moduleId: question.moduleId,
        optionId: option.id,
        moduleTitle: question.title[locale],
        optionTitle: option.label[locale],
        videoUrl: option.videoUrl[locale],
      },
    });
  };

  return (
    <div>
      <header className="flex items-center justify-between border-b px-8 pb-8">
        <div className="flex items-center gap-1.5">
          <TrainingIcon className="size-5" />
          <h1 className="text-xl leading-[23px] font-medium">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            iconLeft={<RefreshIcon className="size-[14px]" />}
            variant="secondary"
            size="sm"
          >
            {t('common:refresh')}
          </Button>
          <LanguageSwitcher />
        </div>
      </header>
      <div className="px-8 py-6">
        <div className="flex flex-col gap-[12px]">
          {isLoading
            ? [0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-[72px] w-full" />
              ))
            : questions?.map((q) => {
                const isOpen = openId === q.moduleId;
                return (
                  <div
                    key={q.moduleId}
                    className="from-muted w-full rounded-[12px] border bg-gradient-to-b to-transparent backdrop-blur-[25px]"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 p-[24px] text-left"
                      onClick={() => setOpenId(isOpen ? null : q.moduleId)}
                    >
                      <span className="font-geist text-[16px] font-medium text-white">
                        {q.title[locale]}
                      </span>
                      <ChevronDown
                        className={`text-muted-foreground size-4 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className="overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-in-out"
                      style={{
                        maxHeight: isOpen
                          ? (contentRef.current?.scrollHeight ?? 0)
                          : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div ref={contentRef} className="p-[24px]">
                        <div className="flex flex-col gap-3">
                          {q.options.map((opt) => (
                            <Button
                              key={opt.id}
                              variant="outline"
                              className="font-geise h-auto justify-start p-4 text-left text-[14px] font-normal"
                              onClick={() => handleVideoClick(q, opt)}
                              iconLeft={
                                <div className="bg-[#1f2028] flex h-[20px] w-[20px] items-center justify-center rounded-full border border-white/30"></div>
                              }
                            >
                              <div className="flex flex-col items-start gap-1">
                                <span className="font-medium text-white">
                                  {opt.label[locale]}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};
