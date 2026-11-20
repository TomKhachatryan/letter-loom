#!/bin/sh
# Downloads the public-domain ENABLE word list used for bonus words.
set -eu
cd "$(dirname "$0")/.."
mkdir -p words
curl -sSfL -o words/enable1.txt https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
wc -l words/enable1.txt
