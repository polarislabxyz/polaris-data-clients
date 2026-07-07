#!/usr/bin/env python3
import pathlib
import re
import sys

if len(sys.argv) not in (2, 3):
    raise SystemExit(
        "usage: validate-public-proto.py PUBLIC_PROTO [CANONICAL_GATEWAY_PROTO]"
    )

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

if len(sys.argv) == 2:
    sys.exit(0)

canonical_path = pathlib.Path(sys.argv[2])
canonical_text = canonical_path.read_text()

MESSAGE_MAP = {
    "QuoteSurface": "PropAmmQuoteSurface",
    "QuoteLevel": "PropAmmQuoteLevel",
}

TYPE_MAP = {
    "QuoteSurface": "PropAmmQuoteSurface",
    "QuoteLevel": "PropAmmQuoteLevel",
}

IGNORE_ENUM_VALUES = {
    "Feed": {
        "FEED_DEPTH",
        "FEED_QUOTE_SURFACE",
        "FEED_SWAPS",
        "FEED_LIQUIDITY_BOOK",
    }
}


def strip_comments(source: str) -> str:
    return re.sub(r"//.*", "", source)


def collect_blocks(source: str):
    source = strip_comments(source)
    blocks = {}
    lines = source.splitlines()
    i = 0
    while i < len(lines):
        match = re.match(r"\s*(message|enum)\s+(\w+)\s*\{", lines[i])
        if not match:
            i += 1
            continue
        kind, name = match.groups()
        depth = lines[i].count("{") - lines[i].count("}")
        body = []
        i += 1
        while i < len(lines) and depth > 0:
            depth += lines[i].count("{") - lines[i].count("}")
            if depth > 0:
                body.append(lines[i])
            i += 1
        blocks[name] = (kind, body)
    return blocks


FIELD_RE = re.compile(
    r"^\s*(?:(optional|repeated)\s+)?([A-Za-z_][\w.]*)\s+([A-Za-z_]\w*)\s*=\s*(\d+)"
)
ENUM_RE = re.compile(r"^\s*([A-Z][A-Z0-9_]*)\s*=\s*(\d+)")


def fields(body):
    result = {}
    for line in body:
        match = FIELD_RE.match(line)
        if not match:
            continue
        label, field_type, name, number = match.groups()
        result[name] = (label or "", field_type, int(number))
    return result


def enum_values(body):
    result = {}
    for line in body:
        match = ENUM_RE.match(line)
        if match:
            name, number = match.groups()
            result[name] = int(number)
    return result


target_blocks = collect_blocks(text)
canonical_blocks = collect_blocks(canonical_text)

for target_name, (kind, target_body) in target_blocks.items():
    canonical_name = MESSAGE_MAP.get(target_name, target_name)
    if canonical_name not in canonical_blocks:
        raise SystemExit(
            f"public proto message/enum {target_name} has no canonical gateway match"
        )
    canonical_kind, canonical_body = canonical_blocks[canonical_name]
    if kind != canonical_kind:
        raise SystemExit(f"{target_name} kind mismatch: public {kind}, canonical {canonical_kind}")

    if kind == "enum":
        canonical_values = enum_values(canonical_body)
        for value_name, value_number in enum_values(target_body).items():
            if value_name in IGNORE_ENUM_VALUES.get(target_name, set()):
                expected = canonical_values.get(value_name)
                if expected != value_number:
                    raise SystemExit(
                        f"{target_name}.{value_name} number mismatch: "
                        f"public {value_number}, canonical {expected}"
                    )
                continue
            if canonical_values.get(value_name) != value_number:
                raise SystemExit(
                    f"{target_name}.{value_name} number mismatch: "
                    f"public {value_number}, canonical {canonical_values.get(value_name)}"
                )
        continue

    canonical_fields = fields(canonical_body)
    for field_name, (label, field_type, number) in fields(target_body).items():
        if field_name not in canonical_fields:
            raise SystemExit(
                f"{target_name}.{field_name} is not present in canonical gateway proto"
            )
        canonical_label, canonical_type, canonical_number = canonical_fields[field_name]
        mapped_type = TYPE_MAP.get(field_type, field_type)
        if (label, mapped_type, number) != (canonical_label, canonical_type, canonical_number):
            raise SystemExit(
                f"{target_name}.{field_name} drift: "
                f"public {(label, field_type, number)}, "
                f"canonical {(canonical_label, canonical_type, canonical_number)}"
            )

print(f"validated {path} against canonical {canonical_path}")
