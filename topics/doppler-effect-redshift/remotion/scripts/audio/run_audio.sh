#!/usr/bin/env bash
# Rebuild the offline mix. Each stem runs in its own process (~1 GB sandbox).
set -euo pipefail
cd "$(dirname "$0")/../.."
for s in voice music amb sfx; do python3 scripts/audio/build_stems.py "$s"; done
python3 scripts/audio/mix.py
python3 scripts/audio/verify.py
