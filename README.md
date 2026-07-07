# Polaris Data Clients

Source examples and lightweight client helpers for Polaris Market Data.

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
