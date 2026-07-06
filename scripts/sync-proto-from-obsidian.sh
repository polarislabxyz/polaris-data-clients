#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="/home/polaris-pm/obsidian-polaris/misc/polaris-data-gateway-proto/protos/data_gateway.proto"
TARGET="${ROOT}/proto/polaris/data_gateway/v1/data_gateway.proto"

mkdir -p "$(dirname "${TARGET}")"
cp "${SOURCE}" "${TARGET}"
echo "synced ${TARGET}"
