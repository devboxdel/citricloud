#!/usr/bin/env bash
set -euo pipefail

# Purge Cloudflare cache for the zone. Requires CF_API_TOKEN and CF_ZONE_ID.
# Optionally set CF_EMAIL if using legacy auth (not recommended).

if [[ -z "${CF_API_TOKEN:-}" || -z "${CF_ZONE_ID:-}" ]]; then
  echo "Cloudflare purge skipped: CF_API_TOKEN and CF_ZONE_ID not set." >&2
  exit 2
fi

API="https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache"

# Purge everything
curl -sS -X POST "$API" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' | jq . || true

echo "Cloudflare cache purge requested for zone ${CF_ZONE_ID}."
