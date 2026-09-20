# QueQuest 5.0 — release pass

Дата сборки: 2026-09-19

## Что изменилось относительно 4.0

### Factory Nexus — постоянный игровой мир

- новый первый-class branch Инженерного кампуса;
- 6 authored аварийных арок: noise, burst, timeout-after-effect, hostile retrieval data, model overfit, bounded autonomy;
- исполняемый Blueprint Builder: `FILTER / ROUTE / QUEUE / BATCH / RETRY / IDEMPOTENCY / CACHE / RETRIEVAL / MODEL / EVAL / TOOLS / POLICY / LOCK / PLANNER`;
- ошибки показываются физическими последствиями `drops / duplicates / unsafe / quality`, а не одним красным ответом;
- после рабочего blueprint открывается provider-neutral Python shape;
- Research Tree с merge-safe исследовательскими ячейками, вычисляемыми из durable-прогресса;
- успешные схемы сохраняются в merge-safe Blueprint Library;
- бесконечные `Factory Shift #seed` с ограниченным resource capacity — overbuilding штрафуется;
- `A−` скрывает дополнительный hint, но не меняет правила или scoring.

### Персональный Q-Bot

- совет зависит от накопленной обратной связи;
- похвала плохого совета может повысить confidence неправильной стратегии;
- корректирующий feedback меняет следующий выбор;
- завершённые сюжетные уроки сохраняются в profile;
- после 6 арок Q-Bot может собирать 4 ограниченных артефакта только из реально исследованных узлов: Shift Monitor, Sorter Mini-Game, Repair Bot, Research Scout.

### Python

Кодовый док расширен с 30 до 36 контрактов. Tier 7 добавляет:

1. function composition / executable pipeline;
2. cache with observable hit;
3. circuit breaker state machine;
4. retrieval context with provenance;
5. separate eval harness;
6. bounded agent step: policy → tool → evidence.

Эталонные реализации этих шести задач отдельно исполняются системным CPython в release test.

### Профиль / будущий account sync

- campus profile: v4;
- sync envelope: `quequest.campus.v4`;
- миграция профилей v1/v2/v3;
- merge старых server envelope v2/v3;
- Nexus research/missions/trials/lessons/builds/blueprints объединяются монотонно;
- bearer/API keys по-прежнему не сериализуются в игровой профиль.

## Автоматические проверки

- `node --test tools/*.test.mjs` — **270 / 270 PASS**;
- `sh tools/selftest.sh` — **PASS**, negative controls действительно падают на подменённых/сломанных сборках;
- `python3 tools/verify_content.py` — **154 задач, 0 ошибок, 0 тривиальных**;
- `node --check` — **68 JS-файлов PASS**;
- основной `index.html` — **466 id / 466 unique / 0 duplicate**;
- прямые runtime `#id` selectors — **303 / 303 существуют**;
- replay page — **9 / 9 selectors существуют**;
- отдельные Factory Nexus logic tests — authored failures, retry/idempotency, hostile DATA/policy, research economy, deterministic trials, reward drift, profile merge, bounded fabrication;
- Tier-7 CPython references — **PASS**;
- mobile CSS contracts: Nexus reflows to one column, action/research/module controls >= 56px on narrow layout.

## Что автоматикой не доказано

- фактическая длительность 20+ часов для конкретного игрока;
- субъективная увлекательность первой и последующих Factory Shifts;
- читаемость плотного Nexus UI на конкретном физическом телефоне;
- эмоциональная выразительность Q-Bot как персонажа;
- реальная кривая интереса после нескольких часов повторяемого postgame.

Это должно проверяться human playtest. В 5.0 эти пункты намеренно не маркируются как «готово» только потому, что тесты зелёные.

## Release boundary

Игра остаётся local-first/offline. Factory Nexus, SIMNET и provider adapters работают как симуляции/контракты; реальный LLM/API/account не требуется для прохождения. Будущий backend может использовать versioned profile-sync поверх существующей модели без обязательной регистрации.
