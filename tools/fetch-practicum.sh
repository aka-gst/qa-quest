#!/usr/bin/env sh
# Кладёт локальные копии практикумов, чтобы ступени 2 и 3 работали при разработке.
#
#   sh tools/fetch-practicum.sh
#
# На домене эти файлы уже лежат соседней папкой (/praktikum/*/course.json), и
# приложение находит их само. Локально соседней папки нет, поэтому копия.
# Каталог не версионируется: единственный источник правды — генератор курса.
set -eu

HERE="$(cd "$(dirname "$0")/.." && pwd)"

# Дерево сайта переезжало, поэтому путь не зашит: ищем по кандидатам и даём
# переопределить через SITE_DIR. Жёсткий путь ломает выкладку при следующем
# переносе каталога, а это не та поломка, которую хочется искать в спешке.
find_site() {
  if [ -n "${SITE_DIR:-}" ]; then
    printf '%s' "$SITE_DIR"
    return 0
  fi
  for candidate in "$HOME/dev/zakriva-site" "$HOME/dev/Zakriva/zakriva-site"; do
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
SITE="$SITE_ROOT_LOCAL/praktikum"
TARGET="$HERE/practicum"

copied=0
for slug in testirovanie llm; do
  source_file="$SITE/$slug/course.json"
  if [ ! -f "$source_file" ]; then
    echo "пропущено: нет $source_file" >&2
    continue
  fi
  mkdir -p "$TARGET/$slug"
  cp "$source_file" "$TARGET/$slug/course.json"
  printf "  %-14s %s байт\n" "$slug" "$(wc -c < "$TARGET/$slug/course.json" | tr -d ' ')"
  copied=$((copied + 1))
done

if [ "$copied" = 0 ]; then
  echo "ничего не скопировано: проверь SITE_DIR" >&2
  exit 1
fi
echo "готово: practicum/ заполнен, ступени 2 и 3 покажут эксперименты"
