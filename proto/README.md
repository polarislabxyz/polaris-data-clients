# Protocol Buffers

`proto/polaris/data_gateway/v1/data_gateway.proto` is the public market-data
subset of the Polaris Data Gateway V1 contract.

It intentionally includes only:

```text
swaps
liquidity_book
quote_surface
depth
```

Private market-maker operational streams are not part of this public proto.

Before publishing changes, run:

```bash
bash scripts/check-proto-sync.sh
```
