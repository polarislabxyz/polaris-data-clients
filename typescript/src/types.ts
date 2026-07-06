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

export interface Trade {
  canonical_event_id: string;
  signature: string;
  slot: number;
  tx_index: number;
  instruction_index: number;
  instruction_path: string;
  fee_payer: string;
  source: string;
  source_instruction: string;
  source_event_type: string;
  route_step_index?: number;
  amm_program: string;
  amm_label?: string;
  amm_model_type?: string;
  pool?: string;
  venue_label?: string;
  in_mint: string;
  out_mint: string;
  in_symbol?: string;
  out_symbol?: string;
  in_decimals?: number;
  out_decimals?: number;
  in_amount_raw: string | number;
  out_amount_raw: string | number;
  in_qty?: number;
  out_qty?: number;
  in_reserve_post_raw?: string | number;
  out_reserve_post_raw?: string | number;
  in_reserve_post_qty?: number;
  out_reserve_post_qty?: number;
  pair_label?: string;
  base_mint?: string;
  quote_mint?: string;
  base_symbol?: string;
  quote_symbol?: string;
  taker_side: "buy_base" | "sell_base" | "unspecified" | string;
  base_amount_raw?: string | number;
  quote_amount_raw?: string | number;
  base_qty?: number;
  quote_qty?: number;
  base_reserve_post_raw?: string | number;
  quote_reserve_post_raw?: string | number;
  base_reserve_post_qty?: number;
  quote_reserve_post_qty?: number;
  trade_price?: number;
  metadata_status: string;
}

export interface SwapUpdateEvent {
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
  snapshot: boolean;
  processed_at_ms: number;
  snapshot_data: DepthSnapshot;
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
  snapshot: boolean;
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

export interface LiquidityBookEvent {
  snapshot: boolean;
  processed_at_ms: number;
  book: LiquidityBookSnapshot;
}

export type MarketDataEvent =
  | { swap: SwapUpdateEvent }
  | { liquidity_book: LiquidityBookEvent }
  | { quote_surface: QuoteSurfaceEvent }
  | { depth: DepthEvent };
