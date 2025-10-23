export const FILTER_LABELS = {
  configuration: 'filters.configuration',
  liquidity: 'filters.liquidity',
  payout_rate: 'filters.payout',
  ev: 'filters.ev',
  sport: 'filters.sport',
  market: 'filters.market',
  bookmaker: 'filters.bookmaker',
  period: 'filters.period',
};

export const DEFAULT_PERFORMANCE_PARAMETERS = {
  evMin: '1',
  trj: '99',
  minCost: '1.3',
  maxCost: '4',
  minLiquidity: '500',
  bankroll: '',
  time: {
    start: '00:00',
    end: '00:00',
  },
  betType: { live: true, prematch: true },
  sport: ['Football', 'Tennis', 'Basketball'],
  betIn: 'euro',
  market: {
    moneyline: true,
    over_under: true,
    handicap: true,
    player_performance: true,
  },
  bookmaker: ['1xBet', '4Kasino', 'Amunra'],
};

export const DEFAULT_FILTERS = {
  configuration: '',
  liquidity: {
    more: '',
    less: '',
  },
  payout_rate: {
    more: '',
    less: '',
  },
  ev: {
    more: '',
    less: '',
  },
  sport: '',
  market: '',
  bookmaker: '',
  period: {
    start: undefined,
    end: undefined,
  },
};
