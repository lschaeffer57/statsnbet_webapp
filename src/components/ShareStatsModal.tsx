import html2canvas from 'html2canvas';
import {
  Download,
  Copy,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Gift,
  User,
  Star,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import ProfitChart from '@/pages/Dashboard/components/ProfitChart';
import type { ChartData } from '@/types';

interface ShareStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    roi: number;
    totalProfit: number;
    betCount: number;
  };
  chartData: ChartData[];
  username: string;
  imageUrl?: string;
  referralCode?: string;
}

export const ShareStatsModal = ({
  isOpen,
  onClose,
  metrics,
  chartData,
  username,
  imageUrl,
  referralCode = 'SB-USER',
}: ShareStatsModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const isPositive = metrics.totalProfit >= 0;
  const affiliateLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);

    // Slight delay to ensure everything is settled
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Use a more robust capture approach
      const element = document.getElementById('share-card-container');
      if (!element) throw new Error('Card element not found');

      const canvas = await html2canvas(element, {
        backgroundColor: '#050614',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('share-card-container');
          if (el) {
            el.style.position = 'relative';
            el.style.display = 'flex';
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        },
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Failed to create blob');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `StatsNBet_${username}_Stats.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Image saved!');
        },
        'image/png',
        1.0,
      );
    } catch (err) {
      console.error('Capture failed:', err);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Affiliate link copied!');
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="flex h-auto max-w-5xl flex-col overflow-hidden border-white/10 bg-[#01020C] p-0 outline-none md:h-[650px] md:flex-row">
        {/* LEFT SIDE: PREVIEW */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden border-b border-white/10 bg-[#01020C] p-4 md:border-r md:border-b-0 md:p-12">
          {/* BACKGROUND DECORATION */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
            <div
              className={cn(
                'absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full opacity-20 blur-[120px]',
                isPositive ? 'bg-emerald-500' : 'bg-red-500',
              )}
            />
            <div className="absolute -right-[10%] -bottom-[20%] h-[50%] w-[50%] rounded-full bg-blue-600 opacity-10 blur-[100px]" />
          </div>

          <div
            id="share-card-container"
            ref={cardRef}
            className="relative flex aspect-[4/5.5] w-full max-w-[360px] flex-col overflow-hidden rounded-[32px] border border-white/10 shadow-2xl"
            style={{
              background: '#050614',
            }}
          >
            {/* GLASS OVERLAY */}
            <div className="pointer-events-none absolute inset-0 bg-white/[0.02] backdrop-blur-[2px]" />

            {/* CONTENT */}
            <div className="relative z-10 flex h-full flex-col p-7">
              {/* Header */}
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-blue-500/80 to-purple-600/80 shadow-xl backdrop-blur-md">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={username}
                        className="size-full object-cover"
                      />
                    ) : (
                      <User className="size-6 text-white" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="mb-1 flex items-center gap-1.5 text-base leading-none font-bold text-white">
                      {username}
                      <Star className="size-3 fill-blue-400 text-blue-400" />
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                        Active Trader
                      </span>
                    </div>
                  </div>
                </div>
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-5 object-contain opacity-90"
                />
              </div>

              {/* Performance Section */}
              <div className="space-y-8">
                <div className="relative">
                  <p className="mb-2 ml-1 text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">
                    Overall ROI
                  </p>
                  <div className="flex items-center gap-4">
                    <h1
                      className={cn(
                        'text-6xl font-black tracking-tighter drop-shadow-2xl',
                        isPositive ? 'text-emerald-400' : 'text-red-400',
                      )}
                    >
                      {metrics.roi > 0 ? '+' : ''}
                      {metrics.roi.toFixed(2)}%
                    </h1>
                    <div
                      className={cn(
                        'flex size-12 items-center justify-center rounded-2xl border shadow-xl backdrop-blur-xl',
                        isPositive
                          ? 'border-emerald-500/20 bg-emerald-500/10'
                          : 'border-red-500/20 bg-red-500/10',
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="size-6 text-emerald-500" />
                      ) : (
                        <TrendingDown className="size-6 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-inner backdrop-blur-xl">
                    <p className="mb-1.5 text-[9px] font-black tracking-widest text-white/30 uppercase">
                      Profit
                    </p>
                    <p className="text-2xl font-black tracking-tight text-white">
                      {metrics.totalProfit.toFixed(0)}€
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-inner backdrop-blur-xl">
                    <p className="mb-1.5 text-[9px] font-black tracking-widest text-white/30 uppercase">
                      Total Bets
                    </p>
                    <p className="text-2xl font-black tracking-tight text-white">
                      {metrics.betCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sparkline Visual */}
              <div className="relative mt-8 min-h-[140px] flex-1 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]">
                <div className="absolute inset-0 z-0 opacity-60">
                  <ProfitChart
                    data={chartData}
                    isDate={false}
                    setIsDate={() => {}}
                    cumulativeRealGain={metrics.totalProfit}
                    isMinimal={true}
                  />
                </div>
                <div className="absolute right-4 bottom-3">
                  <p className="text-[9px] font-black tracking-tighter text-white/20 uppercase italic">
                    Performance Flow
                  </p>
                </div>
              </div>

              {/* Referral Footer */}
              <div className="mt-auto pt-8">
                <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-gradient-to-br from-blue-600 to-indigo-700 p-4 shadow-lg shadow-blue-900/20">
                  <div className="flex flex-col">
                    <span className="mb-0.5 text-[10px] font-bold tracking-wider text-white/70 uppercase">
                      Reference Link
                    </span>
                    <span className="text-xs font-black tracking-widest text-white uppercase">
                      {referralCode}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white px-5 py-2.5 text-[10px] font-black tracking-wider text-indigo-700 uppercase shadow-md transition-transform active:scale-95">
                    Join Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: ACTIONS */}
        <div className="custom-scrollbar flex w-full flex-col overflow-y-auto bg-[#050614]/50 p-8 backdrop-blur-sm md:w-[400px] md:p-10">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl leading-tight font-black text-white">
                Share Success
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Export your stats and invite friends.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-transparent p-3 transition-all hover:border-white/10 hover:bg-white/10"
            >
              <X className="size-5 text-white/60" />
            </button>
          </div>

          <div className="flex-1 space-y-10">
            {/* Rewards Card */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-full bg-blue-600/20 opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 p-4">
                  <Star className="size-20 -rotate-12 text-blue-500/10" />
                </div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-black text-white">
                  <Gift className="size-5 text-blue-400" />
                  Referral Rewards
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                      <Users className="size-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        20% Commission
                      </p>
                      <p className="text-xs text-white/40">
                        Earn for every subscription.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                      <Wallet className="size-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        Instant Payouts
                      </p>
                      <p className="text-xs text-white/40">
                        Directly to your crypto wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Affiliate Link */}
            <div className="space-y-4">
              <label
                htmlFor="affiliate-link"
                className="ml-1 text-xs font-black tracking-[0.2em] text-white/30 uppercase"
              >
                Personal Affiliate Link
              </label>
              <div className="flex gap-3">
                <Input
                  id="affiliate-link"
                  readOnly
                  value={affiliateLink}
                  className="h-14 rounded-2xl border-white/10 bg-white/[0.02] px-5 font-medium text-white/90 focus-visible:ring-blue-500/50"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-white/5 shadow-lg transition-all hover:scale-105 hover:bg-white/10 active:scale-95"
                >
                  <Copy className="size-5 text-white" />
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleDownload}
                disabled={isCapturing}
                className="group h-16 w-full rounded-2xl bg-white text-base font-black text-black shadow-2xl shadow-white/5 transition-all hover:scale-[1.02] hover:bg-gray-100 active:scale-[0.98]"
              >
                {isCapturing ? (
                  <Spinner className="mr-3 size-5" />
                ) : (
                  <Download className="mr-3 size-5 group-hover:animate-bounce" />
                )}
                Download Share Card
              </Button>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 opacity-20">
            <div className="h-px w-12 bg-white/50" />
            <p className="text-[9px] font-black tracking-[0.3em] text-white uppercase">
              Verified Stats&Bet Node
            </p>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
