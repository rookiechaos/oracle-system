#!/usr/bin/env bash
# Move local-only artifacts into do-not-upload/ before git push.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STASH="$ROOT/do-not-upload/uranai-pwa"
mkdir -p "$STASH"

if [ -d "$ROOT/uranai-pwa/node_modules" ]; then
  rm -rf "$STASH/node_modules"
  mv "$ROOT/uranai-pwa/node_modules" "$STASH/node_modules"
  echo "→ moved uranai-pwa/node_modules"
fi

if [ -d "$ROOT/uranai-pwa/dist" ]; then
  rm -rf "$STASH/dist-legacy"
  mv "$ROOT/uranai-pwa/dist" "$STASH/dist-legacy"
  echo "→ moved uranai-pwa/dist (legacy; build now uses do-not-upload/uranai-pwa/dist)"
fi

if [ -f "$ROOT/skills/uranai-demo.mp4" ]; then
  mkdir -p "$ROOT/do-not-upload/skills"
  mv "$ROOT/skills/uranai-demo.mp4" "$ROOT/do-not-upload/skills/"
  echo "→ moved skills/uranai-demo.mp4"
fi

echo "Done. Run 'cd uranai-pwa && npm install' before local dev."
