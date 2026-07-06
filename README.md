# Polaris Data Clients

Public client libraries and examples for Polaris Market Data.

The customer-facing market-data feeds are:

| Feed | Meaning |
| --- | --- |
| `swaps` | Enriched on-chain swap tape |
| `liquidity_book` | Full pair/profile liquidity book with aggregate and per-pool views |
| `quote_surface` | Immediate per-pool simulated quote surface |
| `depth` | Compact pair-level synthetic aggregate depth |

WebSocket is the first-class integration path for browser and lightweight server
clients. gRPC is available for typed streaming integrations.

The protobuf contract is mirrored from the canonical backend source in
`/home/polaris-pm/obsidian-polaris/misc/polaris-data-gateway-proto/protos/data_gateway.proto`.
Run `scripts/check-proto-sync.sh` before publishing changes.

Private partner update streams are not part of this public client workspace.

## WebSocket quickstart

Public liquidity book:

```bash
cd typescript
pnpm install
PUBLIC_POLARIS_DATA_WS_URL=wss://public-data.polarislab.xyz/ws/public \
  npx tsx ../examples/typescript/liquidity-book-sol-usdc.ts
```

Approved paid access:

```bash
cd typescript
pnpm install
POLARIS_DATA_WS_URL=wss://data.polarislab.xyz/ws \
POLARIS_DATA_API_KEY=YOUR_KEY \
POLARIS_DATA_FEED=swaps \
POLARIS_DATA_PAIR=SOL-USDC \
  npx tsx ../examples/typescript/paid-subscribe.ts
```

Do not put paid API keys in browser code. Public browser integrations should
use `wss://public-data.polarislab.xyz/ws/public`.
