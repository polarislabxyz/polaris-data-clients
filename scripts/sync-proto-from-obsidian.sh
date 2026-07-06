#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${ROOT}/proto/polaris/data_gateway/v1/data_gateway.proto"

cat >&2 <<'EOF'
The public proto is an allowlisted market-data contract, not a direct copy of
the backend customer API proto. Do not sync by copying the backend proto because
that would publish private partner update feeds.

Update proto/polaris/data_gateway/v1/data_gateway.proto deliberately, then run:

  bash scripts/check-proto-sync.sh
EOF

python3 "${ROOT}/scripts/validate-public-proto.py" "${TARGET}"
