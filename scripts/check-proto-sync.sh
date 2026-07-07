#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${ROOT}/proto/polaris/data_gateway/v1/data_gateway.proto"
DEFAULT_CANONICAL="/home/polaris-pm/obsidian-polaris/misc/polaris-data-gateway-proto/protos/data_gateway.proto"
CANONICAL="${POLARIS_GATEWAY_PROTO:-${DEFAULT_CANONICAL}}"

if [[ -f "${CANONICAL}" ]]; then
  python3 "${ROOT}/scripts/validate-public-proto.py" "${TARGET}" "${CANONICAL}"
else
  python3 "${ROOT}/scripts/validate-public-proto.py" "${TARGET}"
  echo "canonical gateway proto not found; set POLARIS_GATEWAY_PROTO to run drift check" >&2
fi
echo "public proto contract is valid"
