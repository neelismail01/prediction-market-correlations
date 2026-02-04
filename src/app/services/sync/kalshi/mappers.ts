/**
 * Mappers from Kalshi API types to Supabase insert payloads.
 * All mappers are pure (no I/O).
 */
import { parseNum } from '@/src/app/lib/utils/utils';
import type { TablesInsert } from '@/src/app/types/supabase';
import type { KalshiEvent, KalshiMarket, KalshiSeries } from '@/src/app/types/kalshi';

export type SupabaseMarketSnapshotInsert = TablesInsert<'market_snapshots'>;
export type SupabaseSeriesInsert = TablesInsert<'series'>;
export type SupabaseMarketInsert = TablesInsert<'markets'>;

export function kalshiMarketToSnapshotPayload(
  marketId: number,
  market: KalshiMarket
): SupabaseMarketSnapshotInsert {
  return {
    market_id: marketId,
    notional_value: parseNum(market.notional_value) ?? null,
    notional_value_dollars: parseNum(market.notional_value_dollars) ?? null,
    yes_bid: market.yes_bid ?? null,
    yes_bid_dollars: parseNum(market.yes_bid_dollars) ?? null,
    yes_ask: market.yes_ask ?? null,
    yes_ask_dollars: parseNum(market.yes_ask_dollars) ?? null,
    no_bid: market.no_bid ?? null,
    no_bid_dollars: parseNum(market.no_bid_dollars) ?? null,
    no_ask: market.no_ask ?? null,
    no_ask_dollars: parseNum(market.no_ask_dollars) ?? null,
    last_price: market.last_price ?? null,
    last_price_dollars: parseNum(market.last_price_dollars) ?? null,
    previous_yes_bid: market.previous_yes_bid ?? null,
    previous_yes_bid_dollars: parseNum(market.previous_yes_bid_dollars) ?? null,
    previous_yes_ask: market.previous_yes_ask ?? null,
    previous_yes_ask_dollars: parseNum(market.previous_yes_ask_dollars) ?? null,
    previous_price: market.previous_price ?? null,
    previous_price_dollars: parseNum(market.previous_price_dollars) ?? null,
    volume: market.volume ?? null,
    volume_fp: parseNum(market.volume_fp) ?? null,
    volume_24h: market.volume_24h ?? null,
    volume_24h_fp: parseNum(market.volume_24h_fp) ?? null,
    liquidity: market.liquidity ?? null,
    liquidity_dollars: parseNum(market.liquidity_dollars) ?? null,
    open_interest: market.open_interest ?? null,
    open_interest_fp: parseNum(market.open_interest_fp) ?? null,
  };
}

/** Pure: maps Kalshi series API response to Supabase series insert payload. */
export function kalshiSeriesToSeriesInsertPayload(
  exchangeId: number,
  kalshiSeries: KalshiSeries
): SupabaseSeriesInsert {
  return {
    exchange_id: exchangeId,
    ticker: kalshiSeries.ticker,
    frequency: kalshiSeries.frequency ?? null,
    title: kalshiSeries.title ?? null,
    category: kalshiSeries.category ?? null,
    contract_url: kalshiSeries.contract_url ?? null,
    contract_terms_url: kalshiSeries.contract_terms_url ?? null,
    fee_type: kalshiSeries.fee_type ?? null,
    fee_multiplier: parseNum(kalshiSeries.fee_multiplier) ?? null,
    volume: parseNum(kalshiSeries.volume) ?? null,
    volume_fp: kalshiSeries.volume_fp ?? null,
  };
}

/** Minimal series insert payload when Kalshi series fetch is unavailable. */
export function minimalSeriesInsertPayload(
  exchangeId: number,
  seriesTicker: string
): SupabaseSeriesInsert {
  return {
    exchange_id: exchangeId,
    ticker: seriesTicker,
    title: seriesTicker,
  };
}

/** Pure: maps Kalshi event to Supabase event insert payload. Use seriesId: null for standalone events. */
export function kalshiEventToEventInsertPayload(
  exchangeId: number,
  seriesId: number | null,
  event: KalshiEvent
): TablesInsert<'events'> {
  return {
    exchange_id: exchangeId,
    series_id: seriesId,
    ticker: event.event_ticker,
    title: event.title ?? null,
    sub_title: event.sub_title ?? null,
    collateral_return_type: event.collateral_return_type ?? null,
    mutually_exclusive: event.mutually_exclusive ?? false,
    available_on_brokers: event.available_on_brokers ?? false,
    strike_date: event.strike_date ?? null,
    strike_period: event.strike_period ?? null,
  };
}

export function buildMarketInsertPayload(
  eventId: number,
  market: KalshiMarket
): SupabaseMarketInsert {
  return {
    event_id: eventId,
    ticker: market.ticker,
    market_type: market.market_type ?? null,
    title: market.title ?? null,
    subtitle: market.subtitle ?? null,
    yes_sub_title: market.yes_sub_title ?? null,
    no_sub_title: market.no_sub_title ?? null,
    created_time: market.created_time ?? null,
    updated_time: market.updated_time ?? null,
    open_time: market.open_time ?? null,
    close_time: market.close_time ?? null,
    expiration_time: market.expiration_time ?? null,
    latest_expiration_time: market.latest_expiration_time ?? null,
    settlement_timer_seconds: market.settlement_timer_seconds ?? null,
    status: market.status ?? null,
    response_price_units: market.response_price_units ?? null,
    result: market.result ?? null,
    can_close_early: market.can_close_early ?? null,
    expiration_value: market.expiration_value ?? null,
    rules_primary: market.rules_primary ?? null,
    rules_secondary: market.rules_secondary ?? null,
    tick_size: market.tick_size ?? null,
    price_level_structure: market.price_level_structure ?? null,
    expected_expiration_time: market.expected_expiration_time ?? null,
    settlement_value_dollars: parseNum(market.settlement_value_dollars) ?? null,
    settlement_ts: market.settlement_ts ?? null,
    strike_type: market.strike_type ?? null,
    floor_strike: market.floor_strike ?? null,
    cap_strike: market.cap_strike ?? null,
    fee_waiver_expiration_time: market.fee_waiver_expiration_time ?? null,
    early_close_condition: market.early_close_condition ?? null,
    mve_collection_ticker: market.mve_collection_ticker ?? null,
    is_provisional: market.is_provisional ?? null,
  };
}
