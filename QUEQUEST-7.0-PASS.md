# QueQuest 7.0 — release pass

## Что изменено

- Добавлен `OPS DESK` — безопасный diegetic desktop для расследования системных сбоев.
- Пять authored CASE: duplicate после timeout, stale retrieval, health/readiness, broken streaming, claim без evidence.
- Каждый CASE требует минимум 3 независимых evidence; случайное угадывание диагноза не закрывает задачу.
- Evidence можно получать через кликабельные приложения или `SAFE TERMINAL`.
- Терминал принимает короткие команды и алиасы, умеет unique-prefix TAB completion; реальные offensive-security команды отсутствуют.
- `NOTES` автоматически сохраняет найденные факты; отдельного ручного mission turn-in нет.
- Добавлена `TRACE MAP` внутренних синтетических сервисов; статусы различаются подписью/формой, а не только цветом.
- После 5/5 открываются детерминированные бесконечные `DESK SHIFT #seed`.
- Инженерный кампус получил отдельную ветку `OPS DESK`; skill journal — `TRACE / EVIDENCE / ROOT CAUSE`.
- Campus profile мигрирован на v6; старые v1–v5 профили поддерживаются, desk cases/seeds merge-safe.
- Sync envelope мигрирован на `quequest.campus.v6` и принимает v2–v5 во время rollout.
- HackHub использован только как геймдизайн-референс рабочего стола/расследования. Его ассеты, команды и контент в QueQuest не копировались.

## Автоматические проверки

- Node regression: `286/286 PASS`
- negative-control selftest: `PASS`
- content verifier: `154 задач / 0 ошибок / 0 тривиальных`
- JS syntax: `70/70 runtime JS PASS`
- main DOM duplicate IDs: `512 IDs / 512 unique / 0 duplicates`
- direct runtime ID selectors: `337 total; 328 main + 9 replay / 0 unresolved`
- replay selectors: `9/9 PASS`
- OPS DESK pure logic + DOM contracts: `PASS`
- profile v1–v5 → v6 migration + merge: `PASS`
- release ZIP re-unpack smoke: `PASS (full regression + selftest + content + syntax + DOM/selectors)`

## Что автоматические проверки не доказывают

- что CASE ощущается как расследование, а не форма с вариантами ответа;
- субъективную увлекательность terminal/window multitasking;
- желание сыграть ещё один `DESK SHIFT`;
- читаемость плотного рабочего стола на конкретном телефоне;
- реальный playtime всей игры.

Эти пункты требуют human playtest.
