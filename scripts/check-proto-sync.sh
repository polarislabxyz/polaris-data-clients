#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${ROOT}/proto/polaris/data_gateway/v1/data_gateway.proto"

python3 "${ROOT}/scripts/validate-public-proto.py" "${TARGET}"
echo "public proto contract is valid"
