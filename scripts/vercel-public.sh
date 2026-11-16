#!/usr/bin/env bash
# Publish the demo at /, the player at /module/, and a /demo/ copy for absolute asset paths.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public
mkdir -p public/module public/demo
cp -a demo/. public/
cp -a demo/. public/demo/
cp -a module/. public/module/
rm -rf public/data/raw public/demo/data/raw
