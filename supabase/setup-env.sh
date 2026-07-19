#!/usr/bin/env bash
# Writes a known-good .env for the DataPilot Supabase backend, bypassing
# clipboard issues (the dashboard's masked key display copies as "eyJhbGci●●●●"
# bullets, which silently corrupts hand-pasted .env files).
#
# Usage:
#   bash supabase/setup-env.sh                      # URL + anon key (sign-in works)
#   bash supabase/setup-env.sh '<service_role_key>' # also enable in-app invites
#
# Only PUBLIC values are baked in (the anon key ships in the browser bundle by
# design; Row Level Security protects the data). The secret service_role key is
# never committed — pass it as an argument, copied via the dashboard's reveal +
# copy BUTTON (Project Settings → API keys), not by selecting the masked text.
set -euo pipefail
cd "$(dirname "$0")/.."

URL="https://yevtsrvyhioccwzmxlau.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldnRzcnZ5aGlvY2N3em14bGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTc2MDIsImV4cCI6MjEwMDAzMzYwMn0.FJbeHzllJ90xQzmeOaR6AztwKwEwF1WrR80lHCah6OA"

keep() { grep -E "^$1=" .env 2>/dev/null | head -1 | cut -d= -f2- || true; }
SERVICE="${1:-$(keep SUPABASE_SERVICE_ROLE_KEY)}"
GEMINI="$(keep GEMINI_API_KEY)"

# A real Supabase legacy JWT is pure ASCII (base64url + dots). Anything else —
# masking bullets, wrapped lines, ellipses — is clipboard corruption: drop it.
if [ -n "$SERVICE" ] && LC_ALL=C printf '%s' "$SERVICE" | grep -q '[^A-Za-z0-9._-]'; then
  echo "⚠ SUPABASE_SERVICE_ROLE_KEY contains invalid characters (masked-copy corruption) — clearing it."
  echo "  In-app invites stay disabled until you re-run with the real key as an argument."
  SERVICE=""
fi

cat > .env <<ENV
VITE_SUPABASE_URL=$URL
VITE_SUPABASE_ANON_KEY=$ANON
SUPABASE_SERVICE_ROLE_KEY=$SERVICE
GEMINI_API_KEY=$GEMINI
ENV

echo "✅ .env written:"
awk -F= '/=/{print "   " $1, "→", length($2), "chars"}' .env
echo "── backend reachability check ──"
if curl -sS -m 15 "$URL/auth/v1/health" -H "apikey: $ANON"; then
  echo
  echo "✅ Backend reachable and key accepted. Restart the dev server now:  npm run dev"
else
  echo "❌ Could not reach the backend — check your internet connection and retry."
fi
