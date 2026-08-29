#!/usr/bin/env sh
# Проверяет сами проверки: каждая обязана уметь провалиться.
#
#   sh tools/selftest.sh
#
# Зачем это отдельно от verify_content.py. Тот проверяет содержание курса, а
# здесь проверяется инструмент. Зелёная проверка ничего не значит, пока не
# видел её красной: за один день так «прошли» тест подмены контрольной суммы,
# который бил мимо строки, и проверка выкладки, смотревшая на 18 КБ из 13 МБ.
# Ниже каждая проверка ставится в условия, где она обязана упасть.
set -eu

HERE="$(cd "$(dirname "$0")/.." && pwd)"
failed=0

expect_failure() {
  label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "ПРОВАЛ  $label: проверка прошла там, где обязана была упасть"
    failed=$((failed + 1))
  else
    echo "ok      $label"
  fi
}

expect_success() {
  label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "ok      $label"
  else
    echo "ПРОВАЛ  $label: проверка упала там, где должна была пройти"
    failed=$((failed + 1))
  fi
}

# 1. Подменённая контрольная сумма обязана останавливать закачку Pyodide.
sed 's/^pyodide.mjs [0-9a-f]*/pyodide.mjs 0000000000000000000000000000000000000000000000000000000000000000/' \
  "$HERE/tools/fetch-pyodide.sh" > "$HERE/tools/_selftest_badsum.sh"
expect_failure "подменённая сумма Pyodide ловится" sh "$HERE/tools/_selftest_badsum.sh"
rm -f "$HERE/tools/_selftest_badsum.sh"

# 2. Версия в скрипте и в воркере обязана совпадать.
expect_failure "расхождение версий ловится" env PYODIDE_VERSION=0.0.1 sh "$HERE/tools/fetch-pyodide.sh"

# 3. Движок проверок обязан говорить «не сошлось» на неверном решении.
expect_success "движок отличает верное решение от неверного" python3 "$HERE/tools/selftest_engine.py"

# 4 и 5. Список разрешённого обязан работать в обе стороны, и это две разные
# способности. Не пустить новое на сайт — одна. Убрать с сайта то, что из
# списка вычеркнули, — другая, и её у нас не было: rsync по умолчанию не
# удаляет отсеянное фильтром, поэтому снятый с публикации og.png месяц лежал
# бы на публичном сервере при зелёной выкладке. Обе проверяются одним прогоном.
probe="$HERE/СЕКРЕТ-НЕ-ДЛЯ-САЙТА.txt"
echo "этот файл не должен оказаться на сайте" > "$probe"
rm -rf /tmp/qa-quest-selftest-site
mkdir -p /tmp/qa-quest-selftest-site/qa-quest
echo "выложен вчера, из списка вычеркнут" > /tmp/qa-quest-selftest-site/qa-quest/СНЯТО-С-ПУБЛИКАЦИИ.png
SITE_DIR=/tmp/qa-quest-selftest-site sh "$HERE/tools/deploy.sh" >/dev/null 2>&1 || true
rm -f "$probe"
if [ -e "/tmp/qa-quest-selftest-site/qa-quest/СЕКРЕТ-НЕ-ДЛЯ-САЙТА.txt" ]; then
  echo "ПРОВАЛ  посторонний файл уехал в выкладку"
  failed=$((failed + 1))
else
  echo "ok      посторонний файл в выкладку не попадает"
fi
if [ -e "/tmp/qa-quest-selftest-site/qa-quest/СНЯТО-С-ПУБЛИКАЦИИ.png" ]; then
  echo "ПРОВАЛ  снятый с публикации файл остался лежать на сайте"
  failed=$((failed + 1))
else
  echo "ok      снятый с публикации файл исчезает с сайта"
fi
# vendor/ в список не входит, но обязан пережить выкладку: иначе 13 МБ Python
# сносились и качались бы заново каждый раз, а на сайте между двумя шагами
# висела бы страница без среды исполнения.
if [ -e "/tmp/qa-quest-selftest-site/qa-quest/vendor/pyodide/pyodide.mjs" ]; then
  echo "ok      vendor переживает выкладку"
else
  echo "ПРОВАЛ  vendor снесён выкладкой"
  failed=$((failed + 1))
fi
rm -rf /tmp/qa-quest-selftest-site

echo
if [ "$failed" = 0 ]; then
  echo "все проверки умеют падать — им можно верить"
else
  echo "ПРОВАЛЕНО: $failed" >&2
  exit 1
fi
