#!/bin/sh
# Builds the game and publishes dist/app/ to the gh-pages branch (served by GitHub Pages).
set -eu
cd "$(dirname "$0")/.."
node build.js
if ! git diff --quiet -- dist || ! git diff --cached --quiet -- dist; then
  echo "dist/ changed after building. Commit it first, then deploy again." >&2
  exit 1
fi
git push origin main
git push origin "$(git subtree split --prefix dist/app main)":refs/heads/gh-pages --force
echo "Deployed. GitHub Pages updates within a minute or two."
