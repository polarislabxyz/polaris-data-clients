#!/usr/bin/env python3
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
text = path.read_text()

required = [
    "FEED_DEPTH",
    "FEED_QUOTE_SURFACE",
    "FEED_SWAPS",
    "FEED_LIQUIDITY_BOOK",
    "message DepthEvent",
    "message QuoteSurfaceEvent",
    "message SwapUpdateEvent",
    "message LiquidityBookEvent",
]

for token in required:
    if token not in text:
        raise SystemExit(f"missing public contract token: {token}")

forbidden_patterns = [
    r"FEED_FILL_UPDATE",
    r"FEED_INVENTORY_UPDATE",
    r"FEED_QUOTE_UPDATE",
    r"\bFillUpdate",
    r"\bInventoryUpdate",
    r"\bQuoteUpdate",
    r"PropAmm",
    r"prop_amm",
    r"trigger_account",
    r"trigger_signature",
    r"account_update_received_at_ms",
    r"simulation_started_at_ms",
    r"simulation_completed_at_ms",
    r"best_bid_pool",
    r"best_ask_pool",
]

for pattern in forbidden_patterns:
    if re.search(pattern, text):
        raise SystemExit(f"public proto contains private/internal token: {pattern}")

print(f"validated {path}")
