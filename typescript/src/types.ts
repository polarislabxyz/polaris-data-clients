export const MARKET_DATA_CONTRACT_VERSION = "market_data.v1" as const;

export type MarketDataFeed = "swaps" | "liquidity_book" | "quote_surface" | "depth";

export type MarketDataProfile = "fast" | "dense";

export interface SubscribeOptions {
  endpoint: string;
  feed: MarketDataFeed;
  pair?: string;
  pool?: string;
  source?: string;
  profile?: MarketDataProfile;
  apiKey?: string;
}

export interface TokenQuantity {
  mint: string;
  symbol: string;
  decimals: number;
  amount: string;
  ui_amount: number;
  ui_amount_string: string;
}

export interface Trade {
  event_id: string;
  signature: string;
  slot: number;
  tx_index: number;
  instruction_index: number;
  instruction_path: string;
  fee_payer: string;
  source: string;
  amm_program?: string;
  amm?: string;
  amm_model?: string;
  pool_address?: string;
  processed_at_ms: number;
  pair: string;
  base: TokenQuantity;
  quote: TokenQuantity;
  taker_side: "buy_base" | "sell_base";
  price: number;
}

export interface SwapUpdateEvent {
  type: "swap";
  processed_at_ms: number;
  contract_version: typeof MARKET_DATA_CONTRACT_VERSION | string;
  trade: Trade;
}

export interface DepthLevel {
  level: number;
  base_size_raw: string | number;
  bid_price?: number;
  ask_price?: number;
  visible_bid_pool_count: number;
  visible_ask_pool_count: number;
  bid_base_size_raw: string | number;
  ask_base_size_raw: string | number;
}

export interface DepthSnapshot {
  timestamp_ms: number;
  slot: number;
  pair: string;
  surface_seq: number;
  levels: DepthLevel[];
  simulation_profile: MarketDataProfile | string;
}

export interface DepthEvent {
  type: "depth" | "depth_snapshot";
  processed_at_ms: number;
  snapshot: DepthSnapshot;
  contract_version?: typeof MARKET_DATA_CONTRACT_VERSION | string;
}

export interface QuoteSurfaceLevel {
  level: number;
  sim_base_amount_in: string | number;
  bid_price?: number;
  ask_price?: number;
  bid_success: boolean;
  ask_success: boolean;
  bid_base_amount_in: string | number;
  ask_base_amount_out: string | number;
}

export interface QuoteSurface {
  slot: number;
  timestamp_ms: number;
  pair: string;
  pool_address: string;
  program_id: string;
  update_seq: number;
  levels: QuoteSurfaceLevel[];
  simulation_profile: MarketDataProfile | string;
}

export interface QuoteSurfaceEvent {
  type: "quote_surface" | "quote_surface_snapshot";
  processed_at_ms: number;
  surface: QuoteSurface;
  contract_version?: typeof MARKET_DATA_CONTRACT_VERSION | string;
}

export interface LiquidityPoint {
  price: number;
  cumulative_base: number;
}

export interface SpreadAtDepth {
  base: number;
  abs: number;
  bps: number;
}

export interface SpreadSummary {
  best_abs?: number;
  best_bps?: number;
  by_depth: SpreadAtDepth[];
}

export interface LiquidityBook {
  id: string;
  label: string;
  display_name: string;
  bids: LiquidityPoint[];
  asks: LiquidityPoint[];
  spreads: SpreadSummary;
}

export interface LiquidityPool extends LiquidityBook {
  status: "live" | "stale" | "no_data" | string;
  last_update_slot?: number;
  slot_lag?: number;
  source_timestamp_ms?: number;
  source_age_ms?: number;
}

export interface LiquidityBookSnapshot {
  published_at_ms: number;
  source_timestamp_ms: number;
  source_age_ms: number;
  pair: string;
  profile: MarketDataProfile | string;
  current_slot: number;
  price?: number;
  aggregate: LiquidityBook;
  pools: LiquidityPool[];
  depth_bands: unknown[];
  contract_version: typeof MARKET_DATA_CONTRACT_VERSION | string;
}

export type LiquidityBookEvent = { type: "liquidity_book" } & LiquidityBookSnapshot;

export interface LiquidityBookSnapshotEvent {
  type: "liquidity_book_snapshot";
  snapshot: LiquidityBookSnapshot;
}

export interface HelloEvent {
  type: "hello";
  contract_version: typeof MARKET_DATA_CONTRACT_VERSION | string;
  feed_capabilities: MarketDataFeed[];
  depth_cached?: number;
  surface_cached?: number;
}

export interface SubscribedEvent {
  type: "subscribed";
  contract_version: typeof MARKET_DATA_CONTRACT_VERSION | string;
  filter: unknown;
}

export interface PongEvent {
  type: "pong";
}

export interface ErrorEvent {
  type: "error";
  error: string;
}

export type MarketDataEvent =
  | HelloEvent
  | SubscribedEvent
  | PongEvent
  | ErrorEvent
  | SwapUpdateEvent
  | LiquidityBookEvent
  | LiquidityBookSnapshotEvent
  | QuoteSurfaceEvent
  | DepthEvent;
