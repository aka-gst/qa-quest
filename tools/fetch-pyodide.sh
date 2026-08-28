#!/usr/bin/env sh
# Скачивает Pyodide в vendor/pyodide, чтобы сайт не зависел от чужого CDN.
#
#   sh tools/fetch-pyodide.sh
#
# Приложение само находит локальную копию: если vendor/pyodide/pyodide.mjs
# отвечает, воркер грузит Python оттуда, иначе идёт на jsDelivr.
# Каталог не версионируется — это 13 МБ бинарников, им не место в git.
#
# Суммы зафиксированы вместе с версией и проверяются после скачивания. Это не
# формальность: 9,5 МБ wasm исполняются в браузере каждого посетителя, и
# «наверняка CDN отдал что надо» — не тот уровень уверенности, который здесь
# уместен. При смене версии обновите и версию, и все пять сумм.
set -eu

VERSION="${PYODIDE_VERSION:-314.0.6}"
BASE="https://cdn.jsdelivr.net/pyodide/v${VERSION}/full"
LICENSE_URL="https://raw.githubusercontent.com/pyodide/pyodide/${VERSION}/LICENSE"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$HERE/vendor/pyodide"

CHECKSUMS="
pyodide.mjs 69e3f6ccec3e14b465df60be577ca62f536251406b9a00cce019eac5252a2495
pyodide.asm.mjs 2ac5eba365ec12839c75c03b39b3be1dd63b798852cc460b014b52238be042f7
pyodide.asm.wasm 3a0a00dfeaa348ac20f9ef09904233d32d33f644339662d4af368f8a2010f37a
python_stdlib.zip 80c5be6babfe03297069703410c3c29404dcf2525d2b128746bae5536f94831f
pyodide-lock.json 3fdaef09e9e365c85e002737720f8d0ab8f278c1c244a2dde6a37663cf488ad4"

# Версия живёт в двух местах, и разъехаться им нельзя: воркер попросит одну
# сборку, а рядом будет лежать другая. Проверяем, а не просим помнить.
WORKER_VERSION=$(sed -n "s/^  version: '\([0-9][0-9.]*\)'.*/\1/p" "$HERE/src/pyworker.js" | head -1)
if [ "$WORKER_VERSION" != "$VERSION" ]; then
  echo "ОШИБКА: в src/pyworker.js версия $WORKER_VERSION, а скачивается $VERSION" >&2
  echo "        приведите их к одной, иначе воркер попросит несуществующую сборку" >&2
  exit 1
fi

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d' ' -f1
  else
    shasum -a 256 "$1" | cut -d' ' -f1
  fi
}

mkdir -p "$TARGET"
echo "Pyodide $VERSION -> vendor/pyodide"

echo "$CHECKSUMS" | while read -r file expected; do
  [ -n "$file" ] || continue
  if ! curl --fail --silent --show-error --location "$BASE/$file" --output "$TARGET/$file.new"; then
    rm -f "$TARGET/$file.new"
    echo "ОШИБКА: не скачался $file" >&2
    exit 1
  fi
  actual=$(sha256_of "$TARGET/$file.new")
  if [ "$actual" != "$expected" ]; then
    rm -f "$TARGET/$file.new"
    echo "ОШИБКА: $file не совпал с зафиксированной суммой" >&2
    echo "        ожидали $expected" >&2
    echo "        получили $actual" >&2
    echo "        файл удалён. Либо версия сменилась и суммы устарели, либо CDN отдал не то." >&2
    exit 1
  fi
  mv "$TARGET/$file.new" "$TARGET/$file"
  printf "  %-20s %s байт, сумма сошлась\n" "$file" "$(wc -c < "$TARGET/$file" | tr -d ' ')"
done

# Pyodide распространяется под MPL-2.0 и несёт внутри CPython под лицензией PSF.
# Раз мы раздаём эти файлы со своего домена, лицензия должна лежать рядом с ними.
if curl --fail --silent --show-error --location "$LICENSE_URL" --output "$TARGET/LICENSE.new"; then
  mv "$TARGET/LICENSE.new" "$TARGET/LICENSE"
  echo "  LICENSE              Mozilla Public License 2.0"
else
  rm -f "$TARGET/LICENSE.new"
  echo "ОШИБКА: не скачалась лицензия Pyodide" >&2
  exit 1
fi

cat > "$TARGET/NOTICE.md" <<NOTICE
# Что здесь лежит

Сборка [Pyodide](https://pyodide.org) $VERSION, скачанная как есть с
\`$BASE\` скриптом \`tools/fetch-pyodide.sh\`. Файлы не изменялись; их
контрольные суммы зафиксированы в скрипте и проверяются при каждом скачивании.

Pyodide распространяется под Mozilla Public License 2.0 — полный текст в файле
\`LICENSE\` рядом. Внутри \`python_stdlib.zip\` находится стандартная библиотека
CPython под [PSF License Agreement](https://docs.python.org/3/license.html).

Каталог не версионируется: он воспроизводится скриптом.
NOTICE
echo "  NOTICE.md            указано происхождение и лицензии"
echo "готово."
