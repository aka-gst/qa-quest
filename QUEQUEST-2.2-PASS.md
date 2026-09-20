# QueQuest 2.2 — release pass

## Что добавлено после 1.0

- Инженерный кампус с общим local-first профилем, XP/ranks и merge-safe award ledger.
- 18 системных контрактов и бесконечные deterministic system shifts.
- 24 настоящих CPython/Pyodide behavior contracts.
- AI Lab: transparent nearest-example classifier + human reward.
- Model Workbench: one-layer softmax, 3 datasets, loss, 25 visible weights, noisy eval, augmentation.
- Neural Foundry: linear XOR limit → hidden layer → forward → loss → backprop → learning rate.
- LLM Workshop: instruction/context/schema/tool allowlist/evals + provider-neutral Protocol.
- Retrieval Warehouse: chunks, deterministic vectors, top-k, provenance, hostile DATA guard.
- Bot Forge: planner/memory/retrieval/tools/policy/evals/retry/budget/trace, feedback-driven strategy and four artifact types.
- Real-World Automation Lab: file/CSV/HTTP/model-adapter safety blueprints with dry-run, idempotency, checkpoint and secret redaction.
- My AI Factory: 10-case hidden eval, resource capacity, exportable Python skeleton and infinite deterministic Factory Trials.
- Account-ready progress transport remains optional: gameplay is still fully local-first and secrets are excluded from profile/export.

## Проверки

- `node --test tools/*.test.mjs`: **229/229 PASS**.
- `sh tools/selftest.sh`: **PASS**, включая negative controls.
- `python3 tools/verify_content.py`: **154 задач, 0 ошибок, 0 тривиальных**.
- Runtime JS: `node --check` PASS для `src/game/*.js` и `src/*.js`.
- Main DOM: **373 ID, 373 unique, 0 duplicates**.
- Прямые `#id` runtime selectors: все main-page selectors существуют; 9 replay-only selectors проверены отдельно в `showcase-replay.html` и дают 9/9.
- Mobile CSS для новых AI/automation overlays переводит grids в одну колонку/2 колонки и держит interactive targets минимум 58px на `<=820px`.

## Что сознательно не называется завершённым

- 20 часов — **design budget, а не измеренный playtime** до реального пользовательского прохождения.
- Реальный внешний LLM provider не обязателен и не подключён: локальная Q-Mini/симуляция остаётся безопасным default. Provider adapter стоит добавлять только opt-in, с ключами вне save/export.
- Live email/calendar/filesystem connectors требуют отдельной модели разрешений и явной авторизации.
- Нужен физический mobile playtest (ориентир 390×844) и баланс difficulty/XP по пользовательской обратной связи.

## Следующий лучший pass после playtest

Не добавлять ещё один слой терминов. Сначала измерить: где игрок угадывает кнопки, где добровольно переигрывает систему, сколько занимает каждая ветка, какие AI-визуализации он может объяснить своими словами после прохождения. Затем углублять именно самые “живые” механики.
