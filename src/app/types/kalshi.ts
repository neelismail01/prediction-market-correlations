/** KALSHI SERIES TYPES */
export interface KalshiSettlementSource {
  name?: string;
  url?: string;
}

export interface KalshiSeries {
  ticker: string;
  frequency: string;
  title: string;
  category: string;
  tags: string[];
  settlement_sources: KalshiSettlementSource[];
  contract_url: string;
  contract_terms_url: string;
  product_metadata?: Record<string, unknown> | null;
  fee_type: string;
  fee_multiplier: number;
  additional_prohibitions: string[];
  /** Present when include_volume=true */
  volume?: number;
  /** Present when include_volume=true; fixed-point contract count (e.g. "10.00") */
  volume_fp?: string;
}

export interface KalshiGetSeriesResponse {
  series: KalshiSeries;
}

export interface KalshiGetSeriesOptions {
  /** If true, includes total volume traded across all events in the series. Default: false */
  includeVolume?: boolean;
}


/** KALSHI EVENT TYPES */
export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  sub_title: string;
  title: string;
  /** How collateral is returned when markets settle (e.g. "binary") */
  collateral_return_type: string;
  /** If true, only one market in this event can resolve to "yes" */
  mutually_exclusive: boolean;
  /** Event category (deprecated, use series-level category instead) */
  category: string;
  available_on_brokers: boolean;
  product_metadata: Record<string, unknown> | null;
  /** Date this event is based on; only when event uses a date strike */
  strike_date?: string | null;
  /** Time period this event covers (e.g. "week", "month"); only when event uses a period strike */
  strike_period?: string | null;
  /** Markets in this event; only populated when with_nested_markets=true */
  markets?: KalshiMarket[];
}

export interface KalshiGetEventResponse {
  event: KalshiEvent;
  /** Deprecated: use event.markets with with_nested_markets=true instead */
  markets: KalshiMarket[];
}

export interface KalshiGetEventOptions {
  /** If true, includes markets in the event response (event.markets). Default: false */
  withNestedMarkets?: boolean;
}

/** Event status filter for GET /events */
export type KalshiEventStatus = 'open' | 'closed' | 'settled';

export interface KalshiGetEventsOptions {
  /** Results per page. 1–200, default 200. */
  limit?: number;
  /** Pagination cursor from previous response. */
  cursor?: string;
  /** If true, each event includes a markets array. Default: false */
  withNestedMarkets?: boolean;
  /** If true, response includes a milestones array. Default: false */
  withMilestones?: boolean;
  /** Filter by event status. */
  status?: KalshiEventStatus;
  /** Filter by series ticker. */
  seriesTicker?: string;
  /** Filter events with at least one market with close timestamp (Unix seconds) greater than this. */
  minCloseTs?: number;
}

export interface KalshiMilestone {
  id: string;
  category: string;
  type: string;
  start_date: string;
  end_date?: string | null;
  related_event_tickers: string[];
  title: string;
  notification_message: string;
  source_id?: string | null;
  details: Record<string, unknown>;
  primary_event_tickers: string[];
  last_updated_ts: string;
}

export interface KalshiGetEventsResponse {
  events: KalshiEvent[];
  cursor: string;
  /** Present when with_milestones=true. */
  milestones?: KalshiMilestone[];
}

/** KALSHI MARKET TYPES */

/** Valid price range for orders on a market */
export interface KalshiPriceRange {
  start: string;
  end: string;
  step: string;
}

/** Market status in its lifecycle */
export type KalshiMarketStatus =
  | 'initialized'
  | 'inactive'
  | 'active'
  | 'closed'
  | 'determined'
  | 'disputed'
  | 'amended'
  | 'finalized';

/** Market result (after determination) */
export type KalshiMarketResult = 'yes' | 'no' | 'scalar' | '';

/** Market object returned by GET /markets/{ticker} */
export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: 'binary' | 'scalar';
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  created_time: string;
  updated_time: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: KalshiMarketStatus;
  response_price_units: string;
  notional_value: number;
  notional_value_dollars: string;
  yes_bid: number;
  yes_bid_dollars: string;
  yes_ask: number;
  yes_ask_dollars: string;
  no_bid: number;
  no_bid_dollars: string;
  no_ask: number;
  no_ask_dollars: string;
  last_price: number;
  last_price_dollars: string;
  previous_yes_bid: number;
  previous_yes_bid_dollars: string;
  previous_yes_ask: number;
  previous_yes_ask_dollars: string;
  previous_price: number;
  previous_price_dollars: string;
  volume: number;
  volume_fp: string;
  volume_24h: number;
  volume_24h_fp: string;
  liquidity: number;
  liquidity_dollars: string;
  open_interest: number;
  open_interest_fp: string;
  result: KalshiMarketResult;
  can_close_early: boolean;
  expiration_value: string;
  rules_primary: string;
  rules_secondary: string;
  tick_size: number;
  price_level_structure: string;
  price_ranges: KalshiPriceRange[];
  /** Time when this market is expected to expire */
  expected_expiration_time?: string | null;
  /** Settlement value of YES side in dollars (after determination) */
  settlement_value_dollars?: string | null;
  /** Timestamp when the market was settled */
  settlement_ts?: string | null;
  strike_type?: 'greater' | 'greater_or_equal' | 'less' | 'less_or_equal' | 'between' | 'functional' | 'custom' | 'structured';
  floor_strike?: number | null;
  cap_strike?: number | null;
  fee_waiver_expiration_time?: string | null;
  early_close_condition?: string | null;
  mve_collection_ticker?: string;
  is_provisional?: boolean;
}

export interface KalshiGetMarketResponse {
  market: KalshiMarket;
}