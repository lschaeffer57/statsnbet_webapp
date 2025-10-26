import { useTranslation } from 'react-i18next';

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '../ui/Modal';
import { ONBOARDING_VIDEO_URL } from '@/constants';

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
      <ModalContent className="max-h-[90%] max-w-4xl overflow-y-auto">
        <ModalHeader>
          <ModalTitle>
            {t('signup.performanceParameters.videoModal.title')}
          </ModalTitle>
          <ModalDescription>
            {t('signup.performanceParameters.videoModal.description')}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          <div className="flex h-auto w-full justify-center">
            <div className="relative w-full">
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  title="video"
                  src={ONBOARDING_VIDEO_URL}
                  loading="lazy"
                  style={{
                    border: 0,
                    position: 'absolute',
                    top: 0,
                    height: '100%',
                    width: '100%',
                  }}
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen={true}
                />
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
