#!/usr/bin/env sh
# Выкладка QA Quest на aka-gst.ru/qa-quest/.
#
#   sh tools/deploy.sh            обновить локальное дерево сайта
#   sh tools/deploy.sh --deploy   и выложить на сервер
#
# Локальное дерево сайта (zakriva-site) — источник для выкладки; сюда
# копируется только то, что относится к QA Quest, остальной сайт не трогается.
# Если рядом лежит vendor/pyodide, он тоже уезжает: страница тогда работает
# без обращений к внешнему CDN.
set -eu

DEPLOY=no
[ "${1:-}" = "--deploy" ] && DEPLOY=yes
SSH_HOST="${SSH_HOST:-bonita}"
SITE_ROOT="${SITE_ROOT:-/opt/zakriva/caddy/site}"

HERE="$(cd "$(dirname "$0")/.." && pwd)"

# Дерево сайта переезжало, поэтому путь не зашит: ищем по кандидатам и даём
# переопределить через SITE_DIR. Жёсткий путь ломает выкладку при следующем
# переносе каталога, а это не та поломка, которую хочется искать в спешке.
find_site() {
  if [ -n "${SITE_DIR:-}" ]; then
    printf '%s' "$SITE_DIR"
    return 0
  fi
  for candidate in "$HOME/dev/aka-gst.ru" "$HOME/dev/zakriva-site" "$HOME/dev/Zakriva/zakriva-site"; do
    if [ -d "$candidate" ]; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

SITE_ROOT_LOCAL="$(find_site)" || {
  echo "ОШИБКА: не нашёл дерево сайта. Укажите его через SITE_DIR=..." >&2
  exit 1
}
SITE="$SITE_ROOT_LOCAL/qa-quest"
echo "дерево сайта: $SITE_ROOT_LOCAL"

echo "проверка содержания"
python3 "$HERE/tools/verify_content.py" >/dev/null || {
  echo "ОШИБКА: эталонные решения не проходят проверки, выкладка отменена" >&2
  exit 1
}

mkdir -p "$SITE"
rsync --archive --delete \
  --exclude '.git' --exclude '.gitignore' --exclude 'tools' --exclude 'docs' \
  --exclude 'README.md' --exclude 'vendor' --exclude 'practicum' \
  "$HERE/" "$SITE/"

if [ -d "$HERE/vendor/pyodide" ]; then
  mkdir -p "$SITE/vendor"
  rsync --archive --delete "$HERE/vendor/pyodide/" "$SITE/vendor/pyodide/"
  echo "локальная копия Pyodide включена в выкладку"
else
  echo "vendor/pyodide не найден — страница будет грузить Python с CDN"
  echo "  (sh tools/fetch-pyodide.sh, если нужен свой хостинг)"
fi

# practicum/ — локальная копия для разработки. На домене практикумы лежат в
# /praktikum/ и выкладываются отдельно (sync-portfolio.sh); копия туда не едет,
# иначе появится второй, устаревающий источник тех же уроков.
echo "локальное дерево обновлено: $SITE"
[ "$DEPLOY" = yes ] || exit 0

echo
echo "выкладка на $SSH_HOST:$SITE_ROOT/qa-quest"
REMOTE_SHELL="ssh -o BatchMode=yes -o ConnectTimeout=15"
if ! rsync -az --delete -e "$REMOTE_SHELL" "$SITE/" "$SSH_HOST:$SITE_ROOT/qa-quest/"; then
  echo "ОШИБКА: qa-quest не выложен" >&2
  exit 1
fi

failed=0
for path in /qa-quest/ /qa-quest/src/main.js /qa-quest/src/pyworker.js; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://aka-gst.ru$path" || echo "нет ответа")
  printf "  %-32s %s\n" "$path" "$code"
  [ "$code" = 200 ] || failed=1
done
[ "$failed" = 0 ] || { echo "ОШИБКА: не все файлы отвечают 200" >&2; exit 1; }

# Проверяем не только «отвечает 200», но и что на бою лежит именно та сборка
# Python. Без этого неполная выкладка тихо отправляет браузеры посетителей на
# чужой CDN, и узнать об этом можно только из консоли случайного посетителя.
expected=$(awk '$1 == "pyodide.mjs" { print $2; exit }' "$HERE/tools/fetch-pyodide.sh")
live=$(curl -s --max-time 60 "https://aka-gst.ru/qa-quest/vendor/pyodide/pyodide.mjs" \
  | { command -v sha256sum >/dev/null 2>&1 && sha256sum || shasum -a 256; } | cut -d' ' -f1)
if [ "$live" = "$expected" ]; then
  echo "  Python отдаётся со своего домена, сборка та самая"
else
  echo "ОШИБКА: на бою не та сборка Pyodide или её нет вовсе" >&2
  echo "        ожидали $expected" >&2
  echo "        получили $live" >&2
  echo "        сайт будет молча грузить Python с чужого CDN. Проверьте vendor/ и повторите выкладку." >&2
  exit 1
fi
