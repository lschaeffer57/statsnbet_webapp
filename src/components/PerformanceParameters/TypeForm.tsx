import { useUser } from '@clerk/clerk-react';
import { type FormikTouched, type FormikErrors } from 'formik';
import { Star, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronDownIcon } from '@/assets/icons';
import { BOOKMAKER_GROUPS } from '@/constants/bookmakerGroups';
import { cn } from '@/lib/utils';
import type { BookmakerI, AuthFormValues, UserDocument } from '@/types';

import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { Label } from '../ui/Label';

import { RateBookmakerModal } from './RateBookmakerModal';

interface TypeFormProps {
  bookmakers: BookmakerI[] | undefined;
  values: AuthFormValues;
  errors: FormikErrors<AuthFormValues> | undefined;
  touched: FormikTouched<AuthFormValues> | undefined;
  setFieldValue: (
    field: string,
    value: string | string[] | object | number,
  ) => void;
  isLoading?: boolean;
  isNewConfiguration?: boolean;
  userData?: UserDocument[];
  configuration?: string;
}

const TypeForm = ({
  bookmakers,
  values,
  errors,
  touched,
  setFieldValue,
  isLoading,
  isNewConfiguration,
  userData,
  configuration,
}: TypeFormProps) => {
  const { t } = useTranslation('auth');
  const { user } = useUser();

  // State for the rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBookmaker, setSelectedBookmaker] = useState<string | null>(
    null,
  );
  const [isRankingsVisible, setIsRankingsVisible] = useState(false);

  // Check if any bookmaker has been ranked for this configuration
  const hasRankings = useMemo(() => {
    if (!userData || !configuration) return false;
    const config = userData.find(
      (u) => u.config_number === parseInt(configuration),
    );
    return config?.ratings && Object.keys(config.ratings).length > 0;
  }, [userData, configuration]);

  // Helper to open rating modal
  const openRatingModal = (bookmaker: string) => {
    setSelectedBookmaker(bookmaker);
    setRatingModalOpen(true);
  };

  const groupedBookmakers = useMemo(() => {
    if (!bookmakers) return {};

    const groups: Record<string, BookmakerI[]> = {};
    const assignedIds = new Set<string>();

    Object.entries(BOOKMAKER_GROUPS).forEach(([groupName, aliases]) => {
      const found = bookmakers.filter((b) =>
        aliases.some(
          (alias) => alias.toLowerCase() === b.cloneName.toLowerCase(),
        ),
      );

      if (found.length > 0) {
        groups[groupName] = found.sort((a, b) =>
          a.cloneName.localeCompare(b.cloneName),
        );
        found.forEach((f) => assignedIds.add(f.id));
      }
    });

    const others = bookmakers.filter((b) => !assignedIds.has(b.id));
    if (others.length > 0) {
      groups['OTHERS'] = others.sort((a, b) =>
        a.cloneName.localeCompare(b.cloneName),
      );
    }

    return groups;
  }, [bookmakers]);

  return (
    <div className="space-y-6">
      {/* Bet Type */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.types.title')}
          </span>
          <div className="flex items-center gap-5">
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betType.live}
                onCheckedChange={(checked) =>
                  setFieldValue('betType', {
                    ...values.betType,
                    live: !!checked,
                  })
                }
              />
              {t('signup.performanceParameters.type.types.live')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betType.prematch}
                onCheckedChange={(checked) =>
                  setFieldValue('betType', {
                    ...values.betType,
                    prematch: !!checked,
                  })
                }
              />
              {t('signup.performanceParameters.type.types.prematch')}
            </Label>
          </div>
        </div>
        {errors?.betType && touched?.betType && (
          <span className="text-destructive text-xs">
            {typeof errors.betType === 'string'
              ? errors.betType
              : errors.betType.live || errors.betType.prematch}
          </span>
        )}
      </div>

      {/* Sport */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.sport.title')}
          </span>
          <div className="flex items-center gap-5">
            {['Football', 'Tennis', 'Basketball'].map((sport) => (
              <Label key={sport}>
                <Checkbox
                  isLoading={isLoading}
                  checked={values.sport.includes(sport)}
                  onCheckedChange={(checked) => {
                    const newSports = checked
                      ? [...values.sport, sport]
                      : values.sport.filter((item) => item !== sport);
                    setFieldValue('sport', newSports);
                  }}
                />
                {t(
                  `signup.performanceParameters.type.sport.${sport.toLowerCase()}`,
                )}
              </Label>
            ))}
          </div>
        </div>
        {errors?.sport && touched?.sport && (
          <span className="text-destructive text-xs">{errors.sport}</span>
        )}
      </div>

      {/* Bet Amount */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.betIn.title')}
          </span>
          <div className="flex items-center gap-5">
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betIn === 'euro'}
                onCheckedChange={(checked) =>
                  checked && setFieldValue('betIn', 'euro')
                }
              />
              {t('signup.performanceParameters.type.betIn.euro')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betIn === 'pct'}
                onCheckedChange={(checked) =>
                  checked && setFieldValue('betIn', 'pct')
                }
              />
              {t('signup.performanceParameters.type.betIn.percentage')}
            </Label>
          </div>
        </div>
      </div>

      {/* Market */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.market.title')}
          </span>
          <div className="flex max-w-2/3 flex-wrap items-center justify-end gap-5">
            {['moneyline', 'over_under', 'handicap', 'player_performance'].map(
              (market) => (
                <Label key={market}>
                  <Checkbox
                    isLoading={isLoading}
                    checked={
                      values.market[market as keyof typeof values.market]
                    }
                    onCheckedChange={(checked) =>
                      setFieldValue('market', {
                        ...values.market,
                        [market]: !!checked,
                      })
                    }
                  />
                  {t(
                    `signup.performanceParameters.type.market.${market === 'player_performance' ? 'performance' : market.replace('_', '')}`,
                  )}
                </Label>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Bookmaker Section */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="from-muted flex-1 !bg-gradient-to-b to-transparent py-1.5 pr-2.5 pl-2 opacity-100"
                size="sm"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/50">
                      {t('signup.performanceParameters.type.bookmaker.title')}
                      <span className="text-foreground/25">
                        {t(
                          'signup.performanceParameters.type.bookmaker.maxLimit',
                        )}
                      </span>
                    </span>
                    <span className="text-foreground max-w-[200px] truncate">
                      {values.bookmaker.length > 0
                        ? values.bookmaker
                            .map(
                              (name) =>
                                name.charAt(0).toUpperCase() + name.slice(1),
                            )
                            .join(', ')
                        : 'Select bookmakers'}
                    </span>
                  </div>
                  <ChevronDownIcon className="size-[14px]" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="max-h-[500px] w-[500px] overflow-y-auto"
              align="start"
            >
              {Object.entries(groupedBookmakers).map(([groupName, items]) => (
                <div key={groupName}>
                  <DropdownMenuLabel className="text-muted-foreground bg-card/95 border-border/50 sticky top-0 z-10 border-b py-2 text-xs font-bold tracking-widest uppercase">
                    {groupName}
                  </DropdownMenuLabel>
                  <div className="grid grid-cols-2 gap-x-2 p-1">
                    {items.map((bookmaker) => (
                      <DropdownMenuCheckboxItem
                        key={bookmaker.cloneName}
                        className="w-full pl-8"
                        disabled={
                          (values.bookmaker.length >= 3 &&
                            !values.bookmaker.includes(
                              bookmaker.cloneName.toLowerCase(),
                            )) ||
                          !bookmaker.running
                        }
                        checked={values.bookmaker.includes(
                          bookmaker.cloneName.toLowerCase(),
                        )}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(checked) => {
                          const name = bookmaker.cloneName.toLowerCase();
                          const newBookmakers = checked
                            ? [...values.bookmaker, name]
                            : values.bookmaker.filter((item) => item !== name);
                          setFieldValue('bookmaker', newBookmakers);
                        }}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{bookmaker.cloneName}</span>
                          </div>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* RANKING TOGGLE BUTTON */}
          {!isNewConfiguration &&
            values.bookmaker.length > 0 &&
            !hasRankings && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRankingsVisible(!isRankingsVisible)}
                className={cn(
                  'border-card-border shadow-glass h-9 gap-2 rounded-xl px-4 transition-all hover:bg-white/5',
                  isRankingsVisible && 'border-white/20 bg-white/5',
                )}
              >
                <Filter className="text-muted-foreground size-4" />
                <span className="text-xs font-medium">Rank Bookmakers</span>
              </Button>
            )}
        </div>

        {errors?.bookmaker && touched?.bookmaker && (
          <span className="text-destructive text-xs">{errors.bookmaker}</span>
        )}

        {/* IN-LINE RANKINGS SECTION */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isRankingsVisible
              ? 'mt-4 max-h-[500px] opacity-100'
              : 'max-h-0 opacity-0',
          )}
        >
          <div className="flex flex-col gap-2 p-1">
            {values.bookmaker.map((bm) => (
              <div
                key={bm}
                className="bg-card/50 group flex items-center justify-between rounded-lg border border-white/5 p-3 transition-colors hover:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-sm font-medium capitalize">{bm}</span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openRatingModal(bm)}
                  className="text-muted-foreground h-8 gap-1.5 text-xs transition-all hover:bg-yellow-400/10 hover:text-yellow-400"
                >
                  <Star className="size-3.5" />
                  <span>Rate</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-border-dashed mt-1 w-full border-b border-dashed" />

      {/* RATING MODAL */}
      {selectedBookmaker && user && (
        <RateBookmakerModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedBookmaker(null);
          }}
          userId={user.id}
          bookmaker={selectedBookmaker}
          currentRating={0}
        />
      )}
    </div>
  );
};

export default TypeForm;
