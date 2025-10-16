import { DEFAULT_PERFORMANCE_PARAMETERS } from '@/constants';
import type { AuthFormValues, UserDocument } from '@/types';

export const getInitials = (
  firstName?: string | null,
  lastName?: string | null,
) => {
  const firstInitial = firstName?.[0]?.toUpperCase() ?? '';
  const lastInitial = lastName?.[0]?.toUpperCase() ?? '';
  return firstInitial + lastInitial;
};

export const transformUserDataToParameters = (
  userData: UserDocument | undefined,
): AuthFormValues => ({
  evMin: userData?.ev_min_pct.toString() ?? '1',
  trj: userData?.trj_pct.toString() ?? '99',
  minCost: userData?.odds.min.toString() ?? '1.3',
  maxCost: userData?.odds.max.toString() ?? '4',
  minLiquidity: userData?.min_liquidity.toString() ?? '500',
  bankroll: userData?.bankroll_reference.toString() ?? '',
  time: {
    start: userData?.send_window?.start || '00:00',
    end: userData?.send_window?.end || '00:00',
  },
  betType: {
    live: userData?.bet_types?.live ?? true,
    prematch: userData?.bet_types?.prematch ?? true,
  },
  sport: userData?.sports ?? DEFAULT_PERFORMANCE_PARAMETERS.sport,
  betIn: ['euro'],
  market: {
    moneyline: userData?.markets?.moneyline ?? true,
    over_under: userData?.markets?.over_under ?? true,
    handicap: userData?.markets?.handicap ?? true,
    player_performance: userData?.markets?.player_performance ?? true,
  },
  bookmaker: userData?.bookmakers ?? DEFAULT_PERFORMANCE_PARAMETERS.bookmaker,
});
