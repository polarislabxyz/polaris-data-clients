import assert from "node:assert/strict";
import test from "node:test";

import { AnalyticsClient } from "./client.js";
import { AnalyticsClientError, AnalyticsContractError, AnalyticsHttpError } from "./errors.js";

const pairId = "0".repeat(64);

function json(value: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

const coverage = {
  completeness_bps: 10_000,
  pricing_coverage_bps: 10_000,
  identity_coverage_bps: 10_000,
  reason: null,
};

function pairDocument() {
  return {
    schema_version: "polaris.analytics.v2",
    scope: {
      kind: "pair",
      identity: {
        pair_id: pairId,
        base_mint: "So11111111111111111111111111111111111111112",
        quote_mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        base_symbol: "SOL",
        quote_symbol: "USDC",
      },
    },
    query: {
      start_ms: "1785542400000",
      end_ms: "1785628800000",
      resolution: "5m",
      status: "final",
      included: ["activity"],
    },
    methodology_epoch: "epoch-v1",
    highest_revision: "18446744073709551615",
    event_watermark_ms: "1785628799999",
    coverage,
    datasets: {
      activity: { coverage, points: [] },
      volume_composition: null,
      venue_volume: null,
      routed_liquidity: null,
    },
  };
}

test("pair helpers make one bounded canonical request with sorted include and API key", async () => {
  let requested: URL | undefined;
  let apiKey: string | null = null;
  const client = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    apiKey: "secret",
    fetch: async (input, init) => {
      requested = new URL(input.toString());
      apiKey = new Headers(init?.headers).get("x-api-key");
      return json(pairDocument());
    },
  });
  const document = await client.getPairTimeseries(pairId, {
    start: "2026-08-01",
    end: "2026-08-02",
    resolution: "5m",
    status: "final",
    include: ["venue_volume", "activity", "activity"],
  });
  assert.equal(requested?.pathname, `/v2/analytics/pairs/${pairId}/timeseries`);
  assert.equal(requested?.searchParams.get("include"), "activity,venue_volume");
  assert.equal(apiKey, "secret");
  assert.equal(document.highest_revision, "18446744073709551615");
});

test("granular helper narrows include and returns the requested dataset", async () => {
  let include: string | null = null;
  const client = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    fetch: async (input) => {
      include = new URL(input.toString()).searchParams.get("include");
      return json(pairDocument());
    },
  });
  const activity = await client.getPairActivity(pairId, {
    start: "2026-08-01",
    end: "2026-08-02",
    resolution: "5m",
    status: "final",
  });
  assert.equal(include, "activity");
  assert.deepEqual(activity.points, []);
});

test("transport enforces declared and actual response byte caps", async () => {
  const declared = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    maxResponseBytes: 10,
    fetch: async () => json({}, { headers: { "content-length": "11" } }),
  });
  await assert.rejects(() => declared.getMarkets(), AnalyticsClientError);

  const actual = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    maxResponseBytes: 10,
    fetch: async () => json({ schema_version: "polaris.analytics.v2", markets: [] }),
  });
  await assert.rejects(() => actual.getMarkets(), AnalyticsClientError);
});

test("HTTP and schema failures remain structured", async () => {
  const failed = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    fetch: async () =>
      json(
        {
          schema_version: "polaris.analytics.v2",
          error: { code: "forbidden", message: "outside entitlement" },
        },
        { status: 403 },
      ),
  });
  await assert.rejects(
    () => failed.getMarkets(),
    (error: unknown) => error instanceof AnalyticsHttpError && error.code === "forbidden" && error.status === 403,
  );

  const drifted = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    fetch: async () => json({ schema_version: "polaris.analytics.v3", markets: [] }),
  });
  await assert.rejects(() => drifted.getMarkets(), AnalyticsContractError);
});

test("timeout aborts a stalled fetch", async () => {
  const client = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    timeoutMs: 5,
    fetch: (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
  });
  await assert.rejects(() => client.getMarkets(), AnalyticsClientError);
});

test("timeout remains active while a response body stalls", async () => {
  const client = new AnalyticsClient({
    baseUrl: "https://analytics.example",
    timeoutMs: 5,
    fetch: async (_input, init) =>
      new Response(
        new ReadableStream({
          start(controller) {
            init?.signal?.addEventListener("abort", () => controller.error(new DOMException("aborted", "AbortError")));
          },
        }),
      ),
  });
  await assert.rejects(() => client.getMarkets(), AnalyticsClientError);
});

test("rejects base URLs that could carry credentials or ambiguous path state", () => {
  assert.throws(() => new AnalyticsClient({ baseUrl: "https://user:secret@analytics.example" }), AnalyticsClientError);
  assert.throws(() => new AnalyticsClient({ baseUrl: "https://analytics.example/prefix" }), AnalyticsClientError);
  assert.throws(() => new AnalyticsClient({ baseUrl: "https://analytics.example?debug=1" }), AnalyticsClientError);
});
