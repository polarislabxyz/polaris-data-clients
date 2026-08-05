import { AnalyticsContractError } from "./errors.js";
import type {
  FoundationDocument,
  MarketsDocument,
  MethodologyDocument,
  PricesDocument,
  ScopeTimeseriesDocument,
} from "./types.js";

const UINT = /^[0-9]+$/;
const DECIMAL = /^-?[0-9]+(?:\.[0-9]+)?$/;
const PAIR = /^[0-9a-f]{64}$/;
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const LADDER = ["100", "1000", "10000", "100000", "250000", "1000000"];

type Document =
  | MarketsDocument
  | ScopeTimeseriesDocument
  | PricesDocument
  | MethodologyDocument
  | FoundationDocument;

export function validateDocument<T extends Document>(value: unknown): T {
  const document = record(value, "document");
  if (document.schema_version !== "polaris.analytics.v2") {
    throw new AnalyticsContractError("unsupported analytics schema_version");
  }
  if ("datasets" in document) validateTimeseries(document);
  if ("markets" in document) validateMarkets(document);
  if ("points" in document && "scope" in document) validatePrices(document);
  return value as T;
}

function validateTimeseries(document: Record<string, unknown>): void {
  uint(document.highest_revision, "highest_revision");
  uint(document.event_watermark_ms, "event_watermark_ms");
  const scope = record(document.scope, "scope");
  const identity = record(scope.identity, "scope.identity");
  if (scope.kind === "pair") {
    pair(identity.pair_id, "scope.identity.pair_id");
    mint(identity.base_mint, "scope.identity.base_mint");
    mint(identity.quote_mint, "scope.identity.quote_mint");
  } else if (scope.kind === "token") {
    mint(identity.mint, "scope.identity.mint");
  } else if (scope.kind !== "network" || identity.network !== "solana") {
    throw new AnalyticsContractError("unsupported analytics scope");
  }
  const datasets = record(document.datasets, "datasets");
  validatePoints(recordOrNull(datasets.activity, "datasets.activity")?.points, "activity");
  validateSeries(datasets.volume_composition, "volume_composition");
  validateSeries(datasets.venue_volume, "venue_volume");
  if (datasets.routed_liquidity !== null) {
    validateRouted(record(datasets.routed_liquidity, "datasets.routed_liquidity"));
  }
}

function validateMarkets(document: Record<string, unknown>): void {
  uint(document.highest_revision, "highest_revision");
  uint(document.event_watermark_ms, "event_watermark_ms");
  const network = record(document.network, "network");
  decimalOrNull(network.dex_volume_usd, "network.dex_volume_usd");
  decimalOrNull(network.economic_trade_volume_usd, "network.economic_trade_volume_usd");
  for (const field of ["dex_transactions", "economic_trade_count", "resolved_trader_count", "dex_count"] as const) {
    uint(network[field], `network.${field}`);
  }
  decimalOrNull(document.sol_price_usd, "sol_price_usd");
  for (const [index, item] of array(document.markets, "markets").entries()) {
    const market = record(item, `markets[${index}]`);
    const identity = record(market.pair, `markets[${index}].pair`);
    pair(identity.pair_id, `markets[${index}].pair.pair_id`);
    mint(identity.base_mint, `markets[${index}].pair.base_mint`);
    mint(identity.quote_mint, `markets[${index}].pair.quote_mint`);
    decimalOrNull(market.dex_volume_usd, `markets[${index}].dex_volume_usd`);
    uint(market.dex_transactions, `markets[${index}].dex_transactions`);
    if (market.routed_liquidity !== null) {
      const routed = record(market.routed_liquidity, `markets[${index}].routed_liquidity`);
      validateLadder(routed.size_usd);
      validateRoutedPoint(record(routed.point, "market.routed_liquidity.point"));
    }
  }
}

function validatePrices(document: Record<string, unknown>): void {
  const scope = record(document.scope, "scope");
  mint(scope.mint, "scope.mint");
  validatePoints(document.points, "prices");
  for (const [index, item] of array(document.points, "points").entries()) {
    const point = record(item, `points[${index}]`);
    for (const field of ["open_usd", "high_usd", "low_usd", "close_usd", "twap_usd"] as const) {
      decimalOrNull(point[field], `points[${index}].${field}`);
    }
  }
}

function validateSeries(value: unknown, name: string): void {
  if (value === null) return;
  for (const [index, item] of array(value, name).entries()) {
    validatePoints(record(item, `${name}[${index}]`).points, `${name}[${index}]`);
  }
}

function validatePoints(value: unknown, name: string): void {
  if (value === undefined) return;
  let previous: bigint | undefined;
  for (const [index, item] of array(value, `${name}.points`).entries()) {
    const point = record(item, `${name}.points[${index}]`);
    uint(point.bucket_start_ms, `${name}.points[${index}].bucket_start_ms`);
    const current = BigInt(point.bucket_start_ms as string);
    if (previous !== undefined && current <= previous) {
      throw new AnalyticsContractError(`${name} points are not strictly sorted`);
    }
    previous = current;
  }
}

function validateRouted(dataset: Record<string, unknown>): void {
  validateLadder(dataset.size_usd);
  validatePoints(dataset.points, "routed_liquidity");
  for (const point of array(dataset.points, "routed_liquidity.points")) {
    validateRoutedPoint(record(point, "routed_liquidity.point"));
  }
}

function validateRoutedPoint(point: Record<string, unknown>): void {
  const numberArrays = [
    "buy_cost_p50_bps",
    "buy_cost_p95_bps",
    "sell_cost_p50_bps",
    "sell_cost_p95_bps",
    "two_sided_cost_p50_bps",
    "two_sided_cost_p95_bps",
  ];
  for (const field of numberArrays) fixedSix(point[field], field);
  for (const field of ["supported_sample_count", "eligible_sample_count", "coverage_bps", "support"]) {
    fixedSix(point[field], field);
  }
  const support = array(point.support, "support");
  const costs = array(point.two_sided_cost_p50_bps, "two_sided_cost_p50_bps");
  for (let index = 0; index < 6; index += 1) {
    const item = record(support[index], `support[${index}]`);
    if (item.supported === false && costs[index] !== null) {
      throw new AnalyticsContractError(`unsupported routed rung ${index} has a cost`);
    }
  }
}

function validateLadder(value: unknown): void {
  const values = fixedSix(value, "size_usd");
  values.forEach((item, index) => {
    if (typeof item !== "string" || !DECIMAL.test(item) || Number(item) !== Number(LADDER[index])) {
      throw new AnalyticsContractError("routed size ladder is not canonical");
    }
  });
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AnalyticsContractError(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function recordOrNull(value: unknown, name: string): Record<string, unknown> | null {
  return value === null ? null : record(value, name);
}

function array(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) throw new AnalyticsContractError(`${name} must be an array`);
  return value;
}

function fixedSix(value: unknown, name: string): unknown[] {
  const values = array(value, name);
  if (values.length !== 6) throw new AnalyticsContractError(`${name} must contain six rungs`);
  return values;
}

function uint(value: unknown, name: string): void {
  if (typeof value !== "string" || !UINT.test(value)) {
    throw new AnalyticsContractError(`${name} must be an unsigned decimal string`);
  }
}

function decimalOrNull(value: unknown, name: string): void {
  if (value !== null && (typeof value !== "string" || !DECIMAL.test(value))) {
    throw new AnalyticsContractError(`${name} must be a decimal string or null`);
  }
}

function mint(value: unknown, name: string): void {
  if (typeof value !== "string" || !BASE58.test(value)) {
    throw new AnalyticsContractError(`${name} must be a canonical Solana mint`);
  }
}

function pair(value: unknown, name: string): void {
  if (typeof value !== "string" || !PAIR.test(value)) {
    throw new AnalyticsContractError(`${name} must be a canonical pair id`);
  }
}
