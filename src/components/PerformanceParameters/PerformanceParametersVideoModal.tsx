import { useTranslation } from 'react-i18next';

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '../ui/Modal';

interface PerformanceParametersVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceParametersVideoModal = ({
  isOpen,
  onClose,
}: PerformanceParametersVideoModalProps) => {
  const { t } = useTranslation('auth');

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-4xl">
        <ModalHeader>
          <ModalTitle>
            {t('signup.performanceParameters.videoModal.title')}
          </ModalTitle>
          <ModalDescription>
            {t('signup.performanceParameters.videoModal.description')}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          <div className="flex w-full h-auto justify-center">
            <div className="relative w-full">
              <img
                src="/images/video.png"
                className="h-full w-full rounded-lg"
                alt={t('signup.performanceParameters.videoModal.videoAlt')}
              />
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              {t('signup.performanceParameters.videoModal.explanation.evMin')}
            </p>
            <p>
              {t('signup.performanceParameters.videoModal.explanation.trj')}
            </p>
            <p>
              {t('signup.performanceParameters.videoModal.explanation.minCost')}
            </p>
            <p>
              {t('signup.performanceParameters.videoModal.explanation.maxCost')}
            </p>
            <p>
              {t('signup.performanceParameters.videoModal.explanation.minLiquidity')}
            </p>
            <p>
              {t('signup.performanceParameters.videoModal.explanation.bankroll')}
            </p>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
