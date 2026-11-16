#!/usr/bin/env bash
# Publish the demo at /, the player at /module/, and a /demo/ copy for absolute asset paths.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public
mkdir -p public/module public/demo public/docs public/api/docs public/demo/api/docs
cp -a demo/. public/
cp -a demo/. public/demo/
cp -a module/. public/module/
cp -f docs/le-hulum-srs.pdf docs/INTEGRATION.md public/docs/
cp -f demo/api-docs.html public/api/docs/index.html
cp -f demo/api-docs.html public/demo/api/docs/index.html
cp -f demo/404.html public/404.html
rm -rf public/data/raw public/demo/data/raw
