interface FilterRange {
  more: string;
  less: string;
}

export interface DashboardFiltersI {
  configuration: string;
  liquidity: FilterRange;
  payout_rate: FilterRange;
  ev: FilterRange;
  sport: string;
  market: string;
  bookmaker: string;
  period: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

interface BetDetails {
  match: string | null;
  selection: string | null;
  cut: string | null;
  type: string | null;
  market: string | null;
  sport: string | null;
  competition: string | null;
  bookmaker: string | null;
  url: string | null;
  odds: number | null;
  fair_odds: number | null;
  liquidity: number | null;
  stake: number | null;
}

export interface BetI {
  _id: string;
  match?: string;
  bet?: string | BetDetails;
  date?: string;
  bookmaker?: string;
  sport?: string;
  type?: string;
  stake?: number;
  odds?: number;
  market?: string;
  fair_odds?: number;
  competition?: string;
  payout_rate?: number;
  liquidity?: number;
  ev?: number;
  theoretical_gain?: number;
  status?: string;
  result?: string | null;
  user_id: number;
  sent_at: string;
}

export interface FilteredBet {
  idx: number;
  bet: string;
  bet_id: number;
  bookmaker: string;
  competition: string;
  date: string;
  ev: number;
  liquidity: number;
  match: string;
  match_url?: string;
  odds: string | number;
  payout_rate: number;
  sport: string;
  stake: number;
  status: string;
  theorical_gain: number;
  pnl: number;
}

export interface ChartData {
  date: string;
  betNumber: number;
  realGain: number;
  theoreticalGain: number;
}

export interface DailyStats {
  date: string;
  lossTotal: number;
  gainTotal: number;
  betCount: number;
  profit: number;
  dailyProfit: number;
}

export interface BetsApiResponse {
  data: BetI[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilteredBetsWithPagination {
  data: FilteredBet[];
  pagination: {
    page_number: number;
    page_size: number;
    page_count: number;
    total_rows: number;
  };
}

export interface BookmakerI {
  id: string;
  original: string;
  cloneName: string;
  users: number;
  running: boolean;
}

export interface AuthFormValues {
  evMin: string;
  trj: string;
  minCost: string;
  maxCost: string;
  minLiquidity: string;
  bankroll: string;
  time: {
    start: string;
    end: string;
  };
  betType: {
    live: boolean;
    prematch: boolean;
  };
  sport: string[];
  betIn: string;
  market: {
    moneyline: boolean;
    over_under: boolean;
    handicap: boolean;
    player_performance: boolean;
  };
  bookmaker: string[];
}

export interface CreateUserRequest {
  clerkId: string;
  email: string;
  username: string;
  performanceParameters: AuthFormValues;
  telegram?: TelegramUser;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface UserInfo {
  email: string;
  username: string;
  bot_activated: boolean;
  telegram?: TelegramUser;
  bankroll_current: number | null;
  subscription: {
    active: boolean;
    begin: Date;
    end: Date;
  };
}

export interface UserDocument {
  clerk_id: string;
  email: string;
  username: string;
  config_number: number;
  active_config: boolean;
  ev_min_pct: number;
  trj_pct: number;
  telegram?: TelegramUser;
  bot_activated?: boolean;
  odds: {
    min: number;
    max: number;
  };
  min_liquidity: number;
  send_window: {
    start: string;
    end: string;
  };
  bet_types: {
    live: boolean;
    prematch: boolean;
  };
  sports: string[];
  percentage: boolean;
  markets: {
    moneyline: boolean;
    over_under: boolean;
    handicap: boolean;
    player_performance: boolean;
  };
  bookmakers: string[];
  bankroll_reference: number;
  created_at: Date;
  updated_at: Date;
  bankroll_current: number | null;
  subscription: {
    active: boolean;
    begin: Date;
    end: Date;
  };
}

export type Locale = 'fr' | 'en' | 'de';

type Loaclization = Record<Locale, string>;

export interface CourseItem {
  id: string;
  label: Loaclization;
  videoUrl: Loaclization;
}

export interface Course {
  _id: string;
  moduleId: string;
  options: CourseItem[];
  title: Loaclization;
}
