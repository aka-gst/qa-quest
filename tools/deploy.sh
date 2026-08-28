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
SITE="${SITE_DIR:-$HOME/dev/Zakriva/zakriva-site}/qa-quest"

if [ ! -d "$(dirname "$SITE")" ]; then
  echo "ОШИБКА: нет дерева сайта $(dirname "$SITE")" >&2
  exit 1
fi

echo "проверка содержания"
python3 "$HERE/tools/verify_content.py" >/dev/null || {
  echo "ОШИБКА: эталонные решения не проходят проверки, выкладка отменена" >&2
  exit 1
}

mkdir -p "$SITE"
rsync --archive --delete \
  --exclude '.git' --exclude 'tools' --exclude 'docs' --exclude 'README.md' \
  --exclude 'vendor' \
  "$HERE/" "$SITE/"

if [ -d "$HERE/vendor/pyodide" ]; then
  mkdir -p "$SITE/vendor"
  rsync --archive --delete "$HERE/vendor/pyodide/" "$SITE/vendor/pyodide/"
  echo "локальная копия Pyodide включена в выкладку"
else
  echo "vendor/pyodide не найден — страница будет грузить Python с CDN"
  echo "  (sh tools/fetch-pyodide.sh, если нужен свой хостинг)"
fi

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
