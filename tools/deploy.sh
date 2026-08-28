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

# Раньше здесь было предупреждение, и выкладка продолжалась. Это неверно:
# страница без vendor молча уходит за средой исполнения на чужой CDN, а
# предупреждение в терминале никто не читает. Проще добыть недостающее.
if [ ! -d "$HERE/vendor/pyodide" ]; then
  echo "vendor/pyodide отсутствует — качаю перед выкладкой"
  sh "$HERE/tools/fetch-pyodide.sh"
fi
mkdir -p "$SITE/vendor"
rsync --archive --delete "$HERE/vendor/pyodide/" "$SITE/vendor/pyodide/"
echo "локальная копия Pyodide включена в выкладку"

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

# Одиночный обрыв связи — не поломка выкладки. Без повтора случайная заминка
# выдаёт ложную тревогу и заставляет искать несуществующую причину.
check_url() {
  attempt=1
  while [ "$attempt" -le 3 ]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$1" || echo "000")
    [ "$code" = 200 ] && { printf '%s' "$code"; return 0; }
    attempt=$((attempt + 1))
    sleep 2
  done
  printf '%s' "$code"
  return 1
}

failed=0
for path in /qa-quest/ /qa-quest/src/main.js /qa-quest/src/pyworker.js; do
  code=$(check_url "https://aka-gst.ru$path") || failed=1
  printf "  %-32s %s\n" "$path" "$code"
done
[ "$failed" = 0 ] || { echo "ОШИБКА: не все файлы отвечают 200 после трёх попыток" >&2; exit 1; }

# Проверяем не только «отвечает 200», но и что на бою лежит именно та сборка
# Python. Сверять один pyodide.mjs было бы самообманом: это 18 КБ из 13 МБ, и
# если не доедет wasm на 9,6 МБ — ради которого всё и затевалось, — проверка
# осталась бы зелёной, а Python в браузере не запустился бы. Поэтому все пять.
sha256_of_stdin() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | cut -d' ' -f1
  else
    shasum -a 256 | cut -d' ' -f1
  fi
}

awk 'NF == 2 { gsub(/"/, "", $2); if ($2 ~ /^[0-9a-f]{64}$/) print $1, $2 }' \
  "$HERE/tools/fetch-pyodide.sh" | while read -r file expected; do
  live=$(curl -s --retry 2 --retry-delay 2 --max-time 300 \
    "https://aka-gst.ru/qa-quest/vendor/pyodide/$file" | sha256_of_stdin)
  if [ "$live" != "$expected" ]; then
    echo "ОШИБКА: на бою не та сборка Pyodide — $file" >&2
    echo "        ожидали $expected" >&2
    echo "        получили $live" >&2
    echo "        сайт будет молча грузить Python с чужого CDN. Проверьте vendor/ и повторите выкладку." >&2
    exit 1
  fi
  printf "  %-20s сборка та самая\n" "$file"
done
echo "  Python целиком отдаётся со своего домена"
