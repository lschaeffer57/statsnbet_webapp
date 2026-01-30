import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { userApi } from '@/api/userApi';
import { Button } from '@/components/ui/Button';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface RateBookmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  bookmaker: string;
  currentRating?: number;
}

export const RateBookmakerModal = ({
  isOpen,
  onClose,
  userId,
  bookmaker,
  currentRating = 0,
}: RateBookmakerModalProps) => {
  const [rating, setRating] = useState(currentRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  const rateMutation = useMutation({
    mutationFn: (newRating: number) =>
      userApi.rateBookmaker(userId, bookmaker, newRating),
    onSuccess: () => {
      toast.success(`Rated ${bookmaker} successfully`);
      // Invalidate queries if you fetch ratings elsewhere
      onClose();
    },
    onError: () => {
      toast.error('Failed to save rating');
    },
  });

  const handleSave = () => {
    if (rating > 0) {
      rateMutation.mutate(rating);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-sm border-white/10 bg-[#0A0B14] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Rate Experience</h3>
        </div>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="space-y-2 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <span className="text-xl font-bold text-white capitalize">
                {bookmaker.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white capitalize">
              {bookmaker}
            </h2>
            <p className="text-sm text-white/50">
              How is your betting experience with this bookmaker?
            </p>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    'size-8 transition-colors',
                    (hoveredRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                      : 'fill-transparent text-white/20',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={rating === 0 || rateMutation.isPending}
          >
            {rateMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              'Save Rating'
            )}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};
