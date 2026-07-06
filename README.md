# Polaris Data Clients

Source examples and lightweight client helpers for Polaris Market Data.

The customer-facing market-data feeds are:

| Feed | Meaning |
| --- | --- |
| `swaps` | Enriched on-chain swap tape |
| `liquidity_book` | Full pair/profile liquidity book with aggregate and per-pool views |
| `quote_surface` | Immediate per-pool simulated quote surface |
| `depth` | Compact pair-level synthetic aggregate depth |

WebSocket is the first-class integration path for browser and lightweight server
clients. gRPC is available for typed streaming integrations.

The protobuf contract in `proto/polaris/data_gateway/v1/data_gateway.proto` is
the public market-data subset of `polaris.data_gateway.v1`.
Run `scripts/check-proto-sync.sh` before publishing changes.

Private partner update streams are not part of this public client workspace.
This repository is source-first for the current release; npm/crates.io packages
are not published yet.

## WebSocket quickstart

Public liquidity book:

```bash
cd typescript
pnpm install
PUBLIC_POLARIS_DATA_WS_URL=wss://public-data.polarislab.xyz/ws/public \
  pnpm example:liquidity-book
```

Approved paid access:

```bash
cd typescript
pnpm install
POLARIS_DATA_WS_URL=wss://data.polarislab.xyz/ws \
POLARIS_DATA_API_KEY=YOUR_KEY \
POLARIS_DATA_FEED=swaps \
POLARIS_DATA_PAIR=SOL-USDC \
  pnpm example:paid
```

Do not put paid API keys in browser code. Public browser integrations should
use `wss://public-data.polarislab.xyz/ws/public`.

## gRPC quickstart

Rust gRPC examples use `POLARIS_DATA_GRPC_URL`. If `POLARIS_DATA_API_KEY` is
set, the example sends it as bearer auth metadata.

```bash
cd rust
POLARIS_DATA_GRPC_URL=https://data.polarislab.xyz \
POLARIS_DATA_API_KEY=YOUR_KEY \
  cargo run --example grpc-subscribe-swaps
```
