// Kalshi API response types

export interface KalshiMarketResponse {
  market: {
    ticker: string;
    yes_bid_dollars?: number;
    yes_ask_dollars?: number;
    last_price_dollars?: number;
    yes_sub_title?: string;
    volume?: number;
    volume_24h?: number;
    status: string;
    title?: string;
    event_ticker?: string;
    [key: string]: unknown;
  };
}

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  sub_title?: string;
  [key: string]: unknown;
}

export interface KalshiEventsResponse {
  events: KalshiEvent[];
  cursor?: string;
}

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  status: string;
  volume?: number;
  volume_24h?: number;
  yes_bid_dollars?: number;
  yes_ask_dollars?: number;
  last_price_dollars?: number;
  [key: string]: unknown;
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor?: string;
}
