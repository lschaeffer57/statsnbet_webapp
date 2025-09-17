export interface DashboardFiltersI {
  configuration: string;
  liquidity: boolean;
  payout_rate: boolean;
  ev: boolean;
  sport: string;
  market: string;
  bookmaker: string;
  period: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

export interface BetI {
  _id: string;
  match: string;
  bet: string;
  date: string;
  bookmaker: string;
  sport: string;
  type: string;
  stake: number;
  odds: number;
  fair_odds: number;
  competition: string;
  payout_rate: number;
  liquidity: number;
  ev: number;
  status: string;
  result: string | null;
  user_id: number;
  sent_at: string;
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
