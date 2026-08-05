# Polaris Data Clients

Source examples and lightweight client helpers for Polaris Market Data.

The TypeScript package deliberately exposes two separate products through one
client library: live market-data streams and bounded historical analytics.
The live data gateway remains stream-only; analytics uses the read-only
`polaris.analytics.v2` HTTP contract.

The customer-facing market-data feeds are:

| Feed | Meaning |
| --- | --- |
| `swaps` | Enriched on-chain swap tape |
| `liquidity_book` | Full pair/profile liquidity book with aggregate and per-pool views |
| `quote_surface` | Immediate per-pool simulated quote surface |
| `depth` | Compact pair-level synthetic aggregate depth |

WebSocket is the first-class integration path for lightweight server clients.
gRPC is available for typed streaming integrations.
WebSocket JSON messages use a top-level `type` discriminator, for example
`{ "type": "swap", ... }` or `{ "type": "liquidity_book", ... }`. Initial
`hello` / `subscribed` messages are control messages, not feed data.

The protobuf contract in `proto/polaris/data_gateway/v1/data_gateway.proto` is
the public market-data subset of `polaris.data_gateway.v1`.
Run `scripts/check-proto-sync.sh` before publishing changes.

Private partner update streams are not part of this public client workspace.
This repository is source-first for the current release; npm/crates.io packages
are not published yet.

## Historical analytics quickstart

```ts
import { AnalyticsClient } from "@polarislab/data-client/analytics";

const analytics = new AnalyticsClient({
  baseUrl: process.env.POLARIS_ANALYTICS_URL!,
  apiKey: process.env.POLARIS_DATA_API_KEY,
});

const pair = await analytics.getPairTimeseries(PAIR_ID, {
  start: "2026-08-01T00:00:00Z",
  end: "2026-08-02T00:00:00Z",
  resolution: "5m",
  status: "final",
  include: [
    "activity",
    "volume_composition",
    "venue_volume",
    "routed_liquidity",
  ],
});
```

The bundled pair call is optimized for dashboard pages. Granular helpers such
as `getPairActivity`, `getPairVenueVolume`, and `getPairLiquidity` use the same
HTTP route with a narrow dataset selection. This keeps future Solana Data
routes compatible without duplicating query or contract logic.

The client validates schema version, canonical IDs, precision-sensitive string
values, bucket ordering, and the fixed six-rung routed ladder. Configure an
explicit timeout and response-byte cap for untrusted networks. API keys belong
in server-side code, never browser bundles.

Generated analytics types come from the canonical backend OpenAPI:

```bash
cd typescript
POLARIS_ANALYTICS_OPENAPI=/path/to/obsidian-polaris/apps/polaris-analytics-api/openapi.yaml \
  pnpm check:analytics
```

## WebSocket quickstart

Approved data access:

```bash
cd typescript
pnpm install
POLARIS_DATA_WS_URL=wss://data.polarislab.xyz/ws \
POLARIS_DATA_API_KEY=YOUR_KEY \
POLARIS_DATA_FEED=swaps \
POLARIS_DATA_PAIR=SOL-USDC \
  pnpm example:paid
```

Do not put paid API keys in browser code. For browser/dashboard access, use a
server-side proxy or contact Polaris for an approved deployment-specific
browser endpoint.

## gRPC quickstart

Rust gRPC examples use `POLARIS_DATA_GRPC_URL`. If `POLARIS_DATA_API_KEY` is
set, the example sends it as bearer auth metadata.

```bash
cd rust
POLARIS_DATA_GRPC_URL=https://data.polarislab.xyz \
POLARIS_DATA_API_KEY=YOUR_KEY \
  cargo run --example grpc-subscribe-swaps
```
