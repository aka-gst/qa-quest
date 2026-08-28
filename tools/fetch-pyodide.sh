#!/usr/bin/env sh
# Скачивает Pyodide в vendor/pyodide, чтобы сайт не зависел от чужого CDN.
#
#   sh tools/fetch-pyodide.sh
#
# Приложение само находит локальную копию: если vendor/pyodide/pyodide.mjs
# отвечает, воркер грузит Python оттуда, иначе идёт на jsDelivr.
# Каталог не версионируется — это 12 МБ бинарников, им не место в git.
set -eu

VERSION="${PYODIDE_VERSION:-314.0.6}"
BASE="https://cdn.jsdelivr.net/pyodide/v${VERSION}/full"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$HERE/vendor/pyodide"

mkdir -p "$TARGET"
echo "Pyodide $VERSION -> vendor/pyodide"

for file in pyodide.mjs pyodide.asm.mjs pyodide.asm.wasm python_stdlib.zip pyodide-lock.json; do
  if curl --fail --silent --show-error --location "$BASE/$file" --output "$TARGET/$file.new"; then
    mv "$TARGET/$file.new" "$TARGET/$file"
    printf "  %-20s %s\n" "$file" "$(wc -c < "$TARGET/$file" | tr -d ' ') байт"
  else
    rm -f "$TARGET/$file.new"
    echo "ОШИБКА: не скачался $file" >&2
    exit 1
  fi
done

echo "готово. Версия воркера задана в src/pyworker.js — держите её той же."
