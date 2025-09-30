import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { RefreshIcon, TrainingIcon } from '@/assets/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';

export const Training = () => {
  const { t } = useTranslation('training');
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  type TrainingOption = {
    id: string;
    label: string;
    videoUrl: string;
  };

  type TrainingQuestion = {
    id: string;
    title: string;
    options: TrainingOption[];
  };

  const baseQuestion = {
    title: '01 - Comprendre l’environnement des paris',
    options: [
      {
        id: 'bookmakers',
        label:
          'Bookmakers (définition, différents types, différences ANJ/HA...)',
        videoUrl: 'https://example.com/video/bookmakers',
      },
      {
        id: 'cotes',
        label:
          "Côtes (définition, évolution, comment un bookmaker gagne de l'argent, introduction. marge et trj...)",
        videoUrl: 'https://example.com/video/cotes',
      },
    ],
  } satisfies Omit<TrainingQuestion, 'id'>;

  const questions: TrainingQuestion[] = Array.from({ length: 5 }, (_, i) => ({
    id: `q${String(i + 1).padStart(2, '0')}`,
    title: baseQuestion.title,
    options: baseQuestion.options,
  }));

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && questions.length > 0) {
      setOpenId(questions[0].id);
      initializedRef.current = true;
    }
  }, [questions]);



  const handleVideoClick = (questionId: string, optionId: string) => {
    const videoId = `${questionId}-${optionId}`;
    navigate(`/training/video/${videoId}`);
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
          {questions.map((q) => {
            const isOpen = openId === q.id;
            return (
              <div
                key={q.id}
                className="from-muted w-full rounded-[12px] border bg-gradient-to-b to-transparent backdrop-blur-[25px]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 p-[24px] text-left"
                  onClick={() => setOpenId(isOpen ? null : q.id)}
                >
                  <span className="text-[16px] font-geist font-medium text-white">
                    {q.title}
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
                          className="justify-start text-left text-[14px] font-geise font-normal h-auto p-4"
                          onClick={() => handleVideoClick(q.id, opt.id)}
                          iconLeft={
                            <div className="flex w-[20px] h-[20px] items-center justify-center rounded-full border border-white/30 bg-[#1f2028]z">
                            </div>
                          }
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium text-white">
                              {opt.label}
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
