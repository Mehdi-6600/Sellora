#!/usr/bin/env bash
# Apply all pending Prisma migrations against the configured DATABASE_URL.
# This is the production-safe command (never resets data, never dev-drift).
# Used by Vercel's post-build deploy hook and by ops.
set -euo pipefail
npx prisma migrate deploy
