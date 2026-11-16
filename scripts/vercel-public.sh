#!/usr/bin/env bash
# Lay out the site the way nginx does: Savanna at /, the player at /module/, the demo at /demo/.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public
mkdir -p public
cp -a savanna/. public/
mkdir -p public/module public/demo
cp -a module/. public/module/
cp -a demo/. public/demo/
rm -rf public/demo/data/raw
