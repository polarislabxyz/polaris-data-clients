import { AnalyticsClientError, AnalyticsContractError, AnalyticsHttpError } from "./errors.js";
import type {
  ActivityDataset,
  AnalyticsDataset,
  FoundationDocument,
  FoundationQuery,
  MarketsDocument,
  MethodologyDocument,
  PriceQuery,
  PricesDocument,
  RoutedLiquidityDataset,
  ScopeTimeseriesDocument,
  TimeseriesQuery,
  VenueVolumeSeries,
  VolumeCompositionSeries,
} from "./types.js";
import { validateDocument } from "./validate.js";

const PAIR = /^[0-9a-f]{64}$/;
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export interface AnalyticsClientOptions {
  baseUrl: string;
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  maxResponseBytes?: number;
}

export class AnalyticsClient {
  private readonly baseUrl: URL;
  private readonly apiKey?: string;
  private readonly fetch: typeof globalThis.fetch;
  private readonly timeoutMs: number;
  private readonly maxResponseBytes: number;

  constructor(options: AnalyticsClientOptions) {
    const baseUrl = new URL(options.baseUrl);
    if (!(["http:", "https:"] as const).includes(baseUrl.protocol as "http:" | "https:")) {
      throw new AnalyticsClientError("analytics baseUrl must use http or https");
    }
    if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash || !["", "/"].includes(baseUrl.pathname)) {
      throw new AnalyticsClientError("analytics baseUrl must be an origin without credentials, path, query, or fragment");
    }
    this.baseUrl = baseUrl;
    this.apiKey = options.apiKey;
    this.fetch = options.fetch ?? globalThis.fetch;
    if (!this.fetch) throw new AnalyticsClientError("a fetch implementation is required");
    this.timeoutMs = positive(options.timeoutMs ?? 10_000, "timeoutMs");
    this.maxResponseBytes = positive(options.maxResponseBytes ?? 8 * 1024 * 1024, "maxResponseBytes");
  }

  getMarkets(status: "provisional" | "final" | "restated" = "final"): Promise<MarketsDocument> {
    return this.get("/v2/analytics/markets", { status });
  }

  getNetworkTimeseries(query: TimeseriesQuery): Promise<ScopeTimeseriesDocument> {
    return this.get("/v2/analytics/network/solana/timeseries", timeseriesParams(query));
  }

  getTokenTimeseries(mint: string, query: TimeseriesQuery): Promise<ScopeTimeseriesDocument> {
    canonicalMint(mint);
    return this.get(`/v2/analytics/tokens/${encodeURIComponent(mint)}/timeseries`, timeseriesParams(query));
  }

  getPairTimeseries(pairId: string, query: TimeseriesQuery): Promise<ScopeTimeseriesDocument> {
    canonicalPair(pairId);
    return this.get(`/v2/analytics/pairs/${pairId}/timeseries`, timeseriesParams(query));
  }

  async getPairActivity(pairId: string, query: Omit<TimeseriesQuery, "include">): Promise<ActivityDataset> {
    const document = await this.getPairTimeseries(pairId, { ...query, include: ["activity"] });
    return requiredDataset(document.datasets.activity, "activity");
  }

  async getPairVolumeComposition(
    pairId: string,
    query: Omit<TimeseriesQuery, "include">,
  ): Promise<VolumeCompositionSeries[]> {
    const document = await this.getPairTimeseries(pairId, { ...query, include: ["volume_composition"] });
    return requiredDataset(document.datasets.volume_composition, "volume_composition");
  }

  async getPairVenueVolume(
    pairId: string,
    query: Omit<TimeseriesQuery, "include">,
  ): Promise<VenueVolumeSeries[]> {
    const document = await this.getPairTimeseries(pairId, { ...query, include: ["venue_volume"] });
    return requiredDataset(document.datasets.venue_volume, "venue_volume");
  }

  async getPairLiquidity(
    pairId: string,
    query: Omit<TimeseriesQuery, "include">,
  ): Promise<RoutedLiquidityDataset> {
    const document = await this.getPairTimeseries(pairId, { ...query, include: ["routed_liquidity"] });
    return requiredDataset(document.datasets.routed_liquidity, "routed_liquidity");
  }

  getAssetPrices(mint: string, query: PriceQuery): Promise<PricesDocument> {
    canonicalMint(mint);
    return this.get(`/v2/analytics/assets/${encodeURIComponent(mint)}/prices`, {
      start: query.start,
      end: query.end,
      resolution: query.resolution,
      status: query.status,
    });
  }

  getMethodology(): Promise<MethodologyDocument> {
    return this.get("/v2/analytics/methodology");
  }

  getFoundationMetrics(query: FoundationQuery): Promise<FoundationDocument> {
    return this.get("/v2/analytics/foundation/metrics", {
      metric: query.metric,
      start: query.start,
      end: query.end,
    });
  }

  private async get<T extends MarketsDocument | ScopeTimeseriesDocument | PricesDocument | MethodologyDocument | FoundationDocument>(
    path: string,
    query?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      let response: Response;
      try {
        response = await this.fetch(url, {
          method: "GET",
          headers: this.apiKey ? { "x-api-key": this.apiKey } : undefined,
          signal: controller.signal,
        });
      } catch (error) {
        throw new AnalyticsClientError("analytics request failed", { cause: error });
      }
      const bytes = await boundedBody(response, this.maxResponseBytes);
      let body: unknown;
      try {
        body = JSON.parse(new TextDecoder().decode(bytes));
      } catch (error) {
        throw new AnalyticsContractError("analytics response is not valid JSON", { cause: error });
      }
      if (!response.ok) {
        const error = httpError(body);
        throw new AnalyticsHttpError(response.status, error.code, error.message);
      }
      return validateDocument<T>(body);
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function boundedBody(response: Response, maximum: number): Promise<Uint8Array> {
  const declared = response.headers.get("content-length");
  if (declared !== null && Number(declared) > maximum) {
    throw new AnalyticsClientError("analytics response exceeds maxResponseBytes");
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) {
        await reader.cancel();
        throw new AnalyticsClientError("analytics response exceeds maxResponseBytes");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof AnalyticsClientError) throw error;
    throw new AnalyticsClientError("analytics response body failed", { cause: error });
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function timeseriesParams(query: TimeseriesQuery): Record<string, string> {
  if (query.include.length === 0) throw new AnalyticsClientError("include must not be empty");
  const include = [...new Set<AnalyticsDataset>(query.include)].sort();
  return { ...query, include: include.join(",") };
}

function requiredDataset<T>(value: T | null, name: string): T {
  if (value === null) throw new AnalyticsContractError(`analytics response omitted requested ${name}`);
  return value;
}

function httpError(value: unknown): { code: string; message: string } {
  if (typeof value !== "object" || value === null) return { code: "http_error", message: "analytics request failed" };
  const error = (value as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) return { code: "http_error", message: "analytics request failed" };
  const { code, message } = error as { code?: unknown; message?: unknown };
  return {
    code: typeof code === "string" ? code : "http_error",
    message: typeof message === "string" ? message : "analytics request failed",
  };
}

function canonicalMint(value: string): void {
  if (!BASE58.test(value)) throw new AnalyticsClientError("mint must be a canonical Solana public key");
}

function canonicalPair(value: string): void {
  if (!PAIR.test(value)) throw new AnalyticsClientError("pairId must be a lowercase 64-character hex identifier");
}

function positive(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) throw new AnalyticsClientError(`${name} must be a positive integer`);
  return value;
}
