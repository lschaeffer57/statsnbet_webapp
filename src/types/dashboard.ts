export interface DashboardFiltersI {
  configuration: string;
  liquidity: boolean;
  payout: boolean;
  ev: boolean;
  sport: string;
  market: string;
  bookmaker: string;
  period: {
    start: Date | undefined;
    end: Date | undefined;
  };
}
