-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  event_ticker TEXT NOT NULL UNIQUE,
  series_ticker TEXT NOT NULL,
  title TEXT,
  sub_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
  id BIGSERIAL PRIMARY KEY,
  market_ticker TEXT NOT NULL UNIQUE,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create market_price_snapshots table
CREATE TABLE IF NOT EXISTS market_price_snapshots (
  id BIGSERIAL PRIMARY KEY,
  market_id BIGINT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  yes_bid NUMERIC,
  yes_ask NUMERIC,
  last_price_dollars NUMERIC,
  yes_sub_title TEXT,
  volume NUMERIC,
  volume_24h NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_event_ticker ON events(event_ticker);
CREATE INDEX IF NOT EXISTS idx_events_series_ticker ON events(series_ticker);
CREATE INDEX IF NOT EXISTS idx_markets_market_ticker ON markets(market_ticker);
CREATE INDEX IF NOT EXISTS idx_markets_event_id ON markets(event_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_snapshots_market_id ON market_price_snapshots(market_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON market_price_snapshots(timestamp);
