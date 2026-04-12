#!/bin/bash
# Nova Titans Baseball - Database Setup Script
# =============================================
# This script creates the database schema using the Supabase Management API.
# It requires a SUPABASE_ACCESS_TOKEN (personal access token).
#
# How to get your PAT:
# 1. Go to https://supabase.com/dashboard/account/tokens
# 2. Click "Generate new token"
# 3. Copy the token and set it: export SUPABASE_ACCESS_TOKEN="sbp_..."
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
#   bash scripts/setup-db.sh

set -e

PROJECT_ID="hxrucwregtzirnesvhrj"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN is not set."
  echo ""
  echo "Get your token from: https://supabase.com/dashboard/account/tokens"
  echo "Then run: export SUPABASE_ACCESS_TOKEN=\"sbp_...\""
  echo "And re-run this script."
  exit 1
fi

echo "🏟️  Nova Titans Baseball - Database Setup"
echo "=========================================="
echo "Project: $PROJECT_ID"
echo ""

# Read the schema SQL
SCHEMA_FILE="$(dirname "$0")/../supabase/schema.sql"
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Schema file not found: $SCHEMA_FILE"
  exit 1
fi

SQL=$(cat "$SCHEMA_FILE")

echo "📋 Running schema migration..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Schema created successfully!"
  echo ""
  echo "Next step: Run the data migration:"
  echo "  pip install requests"
  echo "  python3 scripts/migrate-data.py"
else
  echo "❌ Schema creation failed (HTTP $HTTP_CODE)"
  echo "$BODY"
  echo ""
  echo "💡 Alternative: Paste supabase/schema.sql into the SQL Editor:"
  echo "   https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
fi
