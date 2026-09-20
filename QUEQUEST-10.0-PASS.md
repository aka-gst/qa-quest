# QueQuest 10.0 — release pass

Дата: 2026-09-19.

## Что изменено относительно 9.0

- добавлен `AUTOMATION COMMONS` как post-mastery слой reusable automation;
- четыре authored automation-истории: burst, duplicate side-effect, context/boundary,
  bounded night autopilot;
- builder `WHEN → THEN → MEMORY` с контекстным раскрытием 2–3 действий;
- working solution сразу считается победой, optimization необязательна;
- stateful `once` требует явной памяти `seen`;
- blueprint library сохраняет схемы и реально загружает их обратно для ремикса;
- deterministic `CITY AUTOPILOT` смешивает события и ограничивает capacity;
- library в city-mode позволяет включать/выключать blueprints;
- после двух успешных дней открывается настоящий Python `autopilot(event, state)`;
- семь behavioral Python-checks проверяют причины, а не совпадение исходного текста;
- campus profile обновлён до v9 и merge-safe хранит blueprints/day seeds/code deploy;
- добавлены два маленьких CC0 Kenney Game Icons и исправлен deploy whitelist для
  всего runtime `assets/` дерева;
- cache-bust/brand обновлены до 10.0.

## Автоматическая проверка рабочей копии

- `node --test tools/*.test.mjs`: **314 / 314 PASS**;
- `sh tools/selftest.sh`: **PASS**, все negative-controls действительно падают;
- `python3 tools/verify_content.py`: **154 задачи, 0 ошибок, 0 тривиальных**;
- JS syntax: **72 / 72 PASS**;
- основной DOM: **596 ID / 596 unique / 0 duplicates**;
- replay DOM: **9 / 9 unique / 0 duplicates**;
- прямые JS selectors: **530 uses / 375 unique / 0 missing**;
- 9 selector-id принадлежат отдельной `showcase-replay.html` и существуют там 9/9;
- runtime asset test подтверждает наличие CC0 notices и deploy whitelist для `assets/**`.

## Что ещё нельзя доказать автоматикой

- физический mobile playthrough 390×844 и более широкого телефона;
- субъективный pacing первой сессии;
- желание добровольно ремиксовать/оптимизировать рабочий blueprint;
- реальную длительность long-game;
- ощущение, что переход visual builder → Python даёт власть, а не экзамен.

Эти пункты остаются human-playtest boundary, а не скрываются под зелёными unit-тестами.

## Release archive

После упаковки архив должен быть распакован в чистый каталог и повторно пройти полный
Node regression + selftest + content verifier. Финальные цифры ZIP-smoke дописываются
после этой проверки.


## Проверка распакованного ZIP

Архив был распакован в отдельный чистый каталог, после чего проверки были запущены
повторно уже из него:

- full Node regression: **314 / 314 PASS**;
- negative-control selftest: **PASS**;
- content verifier: **154 / 0 / 0**;
- JS syntax: **72 / 72 PASS**;
- основной DOM: **596 / 596 unique, 0 duplicates**;
- replay DOM: **9 / 9 unique, 0 duplicates**;
- direct selectors: **530 uses / 375 unique / 0 missing**;
- 9 selector-id разрешаются только в отдельной replay-странице, как и задумано.

Это проверка переносимого релизного дерева, а не только development-каталога.
