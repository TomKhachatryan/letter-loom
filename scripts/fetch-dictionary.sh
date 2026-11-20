#!/bin/sh
# Downloads the word lists levels/bonus.js uses to pick bonus words:
#   ENABLE (public domain), 12dicts 2of12inf (public domain / AGID licence) and
#   FrequencyWords en_50k (CC BY-SA 4.0, used only as a frequency filter).
set -eu
cd "$(dirname "$0")/.."
mkdir -p words
curl -sSfL -o words/enable1.txt https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
curl -sSfL -o words/en_50k.txt https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
tmp=$(mktemp -d)
curl -sSfL -o "$tmp/12dicts.zip" https://downloads.sourceforge.net/wordlist/12dicts-6.0.2.zip
unzip -o -q -j "$tmp/12dicts.zip" American/2of12inf.txt -d words
rm -rf "$tmp"
wc -l words/enable1.txt words/2of12inf.txt words/en_50k.txt
