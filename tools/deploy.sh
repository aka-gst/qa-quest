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
# Исключается всё служебное. Скрытые каталоги перечислены поимённо, потому что
# --archive копирует их молча: .githooks однажды так и уехал на публичный сервер,
# где скрипт проверки секретов стал доступен по прямой ссылке.
# Выкладывается только перечисленное. Раньше здесь был список запрещённого, и
# он не работал по устройству: перечислить всё лишнее нельзя, а любой новый
# файл в корне уезжает на публичный сервер сам. Так уже уехали бы .githooks.
# Список разрешённого ошибается в безопасную сторону: забытое не публикуется,
# а не публикуется лишнее.
# --delete здесь недостаточно, и это стоило нам живого промаха. rsync по
# умолчанию не удаляет на приёмнике то, что отсеяно фильтром: файл считается
# «не нашим делом». То есть список разрешённого мешает выложить лишнее, но не
# убирает уже выложенное. Когда og.png сменился на og.jpg, старый og.png так и
# остался лежать на публичном сервере — выкладка при этом отчиталась зелёным.
# --delete-excluded говорит прямо: на сайте живёт ровно то, что в списке.
# vendor/ приходит следующим шагом и в список не входит, поэтому защищаем его
# от удаления отдельным правилом, иначе он сносился бы и качался каждый раз.
rsync --archive --delete --delete-excluded \
  --filter 'protect vendor/' \
  --include 'index.html' --include 'styles.css' --include 'favicon.svg' \
  --include 'og.jpg' --include 'apple-touch-icon.png' --include 'bg-grid.svg' \
  --include 'bg-night.jpg' \
  --include 'finale.jpg' \
  --include 'garage-finale.jpg' --include 'garage-bg.jpg' \
  --include 'garage-boot-1.jpg' --include 'garage-boot-2.jpg' \
  --include 'garage-boot-3.jpg' --include 'garage-boot-4.jpg' \
  --include 'ice-boot-1.jpg' --include 'ice-boot-2.jpg' \
  --include 'ice-boot-3.jpg' --include 'ice-boot-4.jpg' \
  --include 'tier-testing.jpg' --include 'tier-llm.jpg' \
  --include 'garage-panel.jpg' --include 'ice-panel.jpg' \
  --include 'garage-strip.jpg' --include 'ice-strip.jpg' \
  --include 'src/' --include 'src/**' \
  --exclude '*' \
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
sha256_of_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d' ' -f1
  else
    shasum -a 256 "$1" | cut -d' ' -f1
  fi
}

# Скачиваем в файл и смотрим на код возврата curl. Раньше здесь был конвейер
# curl | sha256, и он молча съедал две вещи сразу: код возврата терялся, а
# оборванная закачка досчитывалась до хеша как ни в чём не бывало. Один
# зависший запрос из-за связи — и выкладка кричала «на бою не та сборка
# Python», хотя на бою лежал ровно тот файл. Мы этот урок уже проходили на
# проверке кодов ответа: одиночный обрыв не поломка, а помеха.
fetch_to_file() {
  attempt=1
  while [ "$attempt" -le 3 ]; do
    if curl -sS --fail --max-time 300 -o "$2" "$1" 2>/dev/null; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 3
  done
  return 1
}

sums="$(mktemp)"
body="$(mktemp)"
trap 'rm -f "$sums" "$body"' EXIT
awk 'NF == 2 { gsub(/"/, "", $2); if ($2 ~ /^[0-9a-f]{64}$/) print $1, $2 }' \
  "$HERE/tools/fetch-pyodide.sh" > "$sums"

# Без конвейера: цикл читает из файла, поэтому переменная переживает цикл и
# скрипт умеет упасть по-настоящему, а не только напечатать про ошибку.
bad=0
while read -r file expected; do
  if ! fetch_to_file "https://aka-gst.ru/qa-quest/vendor/pyodide/$file" "$body"; then
    echo "ОШИБКА: $file не скачался с боя за три попытки — это связь, а не подмена" >&2
    echo "        сборку проверить не удалось; повторите выкладку" >&2
    bad=1
    continue
  fi
  live="$(sha256_of_file "$body")"
  if [ "$live" != "$expected" ]; then
    echo "ОШИБКА: на бою не та сборка Pyodide — $file" >&2
    echo "        ожидали $expected" >&2
    echo "        получили $live" >&2
    echo "        сайт будет молча грузить Python с чужого CDN. Проверьте vendor/ и повторите выкладку." >&2
    bad=1
    continue
  fi
  printf "  %-20s сборка та самая\n" "$file"
done < "$sums"
[ "$bad" = 0 ] || exit 1
echo "  Python целиком отдаётся со своего домена"
