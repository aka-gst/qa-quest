# QueQuest 12.0 — индекс планов и long-game boundary

Эта упаковка сохраняет завершённую основную кампанию 1.0, но 2.0 больше не считает `reward8` концом продукта. После кампании открыт Инженерный кампус — расширяемая песочница Python, систем, AI и LLM.

## Реализовано в основной кампании

1. Ручной труд → Python-чип → физическая автоматизация без синтаксического экзамена.
2. Исчезнувшая кнопка → `print`; красный груз → `for + if`; ранний Q-Bot.
3. Живая очередь → `list/while`, физический указатель и trace.
4. Две линии → reusable `def route(batch)`.
5. Friends-defense → 3 временные AI-роли / 6 синтетических событий.
6. Вика → одинаковый вход, разный state → `dict/state`.
7. Virus finale → type/missing/timeout/order → `tests/try/except/log`.
8. Automation Foundry → `READ/ROUTE/SAVE`, queue, workers, bottleneck, race, `asyncio/Lock`.

## Реализовано в Инженерном кампусе 2.0

- **18 системных контрактов**: throughput, burst, idempotency, cache, dead-letter, Semaphore, ordering, timeout, batching, checkpoint, observability, interfaces.
- **Бесконечная смена**: детерминированные seed-сценарии, workers/buffer/lock, 16 видимых ticks, drops/collisions/score.
- **30 CPython-контрактов**: от коллекций до generators/dataclasses/context managers/typing/asyncio/tool registries/LLM boundaries.
- **AI-полигон**: прозрачный nearest-example classifier, hidden eval, новый label и reward-learning.
- **Model Workbench**: настоящий one-layer softmax, digits/letters/icons, epochs/loss/25 weights/noisy eval/data augmentation.
- **Агентный цех**: instruction/context/schema/tool allowlist/evals и provider-neutral Python Protocol wrapper.
- **Campus profile v3**: XP/ranks/mastery, уникальный award ledger, export/import, monotonic multi-device merge.
- **Будущий account sync**: отдельный `profile-sync.js` transport contract; login не нужен для игры.
- **SIMNET**: offline API/MCP/Git/Ops simulator, 5 authored stations + infinite incident seeds; реальный endpoint не нужен, но auth/policy/streaming/readiness/evidence ведут себя как отдельные границы.

## Чего 3.0 ещё не притворяется достигшим

- 20 часов не измерены реальными игроками; это target budget, а не маркетинговая цифра.
- Настоящие LLM provider adapters и хранение реальных ключей не включены по умолчанию: их интерфейсы симулирует SIMNET.
- SIMNET не притворяется настоящим интернетом, GitHub, почтой или MCP-сервером: он обучает контрактам и failure modes до выдачи реальных полномочий.
- Train/validation overfitting, более глубокие сети и полноценная multimodal robotics остаются advanced expansions, а не обязательной частью beginner-route.
- Физическая mobile acceptance 390×844 должна пройти на реальном устройстве.

Полный длинный roadmap: `../docs/QUEQUEST-LONG-GAME-2.0.md`.

## Архитектурные правила 2.x

1. Сначала физическая проблема, потом термин/код.
2. Каждый новый механизм должен иметь observable state и failure mode.
3. Ошибка даёт быстрый retry и полезный сигнал, а не штраф ожиданием.
4. Реальная модель/LLM никогда не получает полномочия только потому, что “так написано в тексте”; tools имеют отдельную policy/allowlist.
5. Secrets не входят в game save/profile/export.
6. Offline/local-first — базовый режим; backend только добавляет sync/convenience.
7. Повторяемые часы должны появляться из комбинирования систем, а не из копирования одинаковых вопросов.

## Источники старых планов

- `../docs/QUEQUEST-GAME-DESIGN-0.4.md` — game-first архитектура и исходный roadmap.
- `AUTHOR-SOURCES/КАК-ДОДЕЛАТЬ-QUEQUEST.md` — восстановленные авторские решения и ограничения.
- `AUTHOR-SOURCES/stages-2-3.md` — контракт импорта старых практикумов.
- `AUTHOR-SOURCES/README-original-course.md` — возможности QA Quest/Pyodide-курса.
- `../docs/REFERENCES-WANTED.md` и `REFERENCES-RECEIVED.md` — референсы и полученные материалы.


## 4.0 focus

4.0 не добавляет ещё одну обязательную «тему Python». Он усиливает первый час игры:
действие раньше термина, адаптивное объяснение без отдельной детской кампании,
видимое накопление паттерна и первая добровольная системная игрушка `SORTER BAY`.
Критерий успеха следующего playtest — не «правильно ответил», а добровольно
экспериментировал и смог своими словами объяснить, почему конкретный ящик ушёл не туда.

## 5.0 focus — Factory Nexus

- постоянный postgame-хаб вместо набора изолированных лабораторий;
- research tree как игровые способности;
- blueprint library и ограниченный Q-Bot fabrication;
- шесть authored-аварий + бесконечные seed-based Factory Shifts;
- profile v4 и Tier 7 CPython contracts.

## 6.0 focus — game feel + понятный Q-Bot

- физическая линия показывает drops/duplicates/unsafe/quality misses телом игры;
- шесть optional BONUS ORDER ремиксуют уже освоенные аварии;
- Q-Bot в A+ начинает с человеческих состояний и memory-rack, метрики раскрываются позже;
- profile v5 сохраняет bonus-orders merge-safe;
- минимальный CC0 audio asset-budget для tactile feedback, без зависимости обучения от звука;
- human playtest остаётся обязательной проверкой: интерес, pacing, читаемость Nexus на телефоне и желание сыграть ещё один seed не доказываются unit-тестами.


## 7.0–9.0 focus — расследование, живой мир и mastery

- **7.0 OPS DESK** — диетический рабочий стол расследований: dispatch/notes/trace/safe terminal, authored cases + infinite DESK SHIFT; claim не равен evidence.
- **8.0 WORLD GRID** — компании, сервисы, API, боты и люди связаны в одну карту; одна проблема может иметь несколько валидных архитектур с разными tradeoff.
- **9.0 DISCOVERY → MASTERY → CODE** — обязательное исследование только для нового класса причин; после mastery похожие CITY SHIFT можно решать сразу архитектурным планом или настоящим Python через DIRECT PATCH.
- После освоения семи семейств открывается **BLACK BOX SHIFT** без подсветки больных узлов: это challenge-практика вместо повторного tutorial.
- Основная retention-механика — рост реального контроля над миром. Daily streak/FOMO не используется как обязательный progression gate.


## 10.0 focus — Automation Commons

- знакомая проблема после mastery превращается в reusable automation, а не в повтор tutorial;
- визуальный builder: `WHEN → THEN → MEMORY`, причём действия раскрываются контекстно;
- любое рабочее решение принимается, оптимизация по cost/complexity/efficiency добровольна;
- сохранённые blueprints можно загрузить обратно, ремиксовать и включать/выключать;
- deterministic `CITY AUTOPILOT` смешивает знакомые события и вводит capacity;
- после двух успешных city-days открывается настоящий Python `autopilot(event, state)` на 7 behavioral contracts;
- campus profile v9 хранит blueprints/day seeds/code-deploy merge-safe;
- human playtest должен проверить главное: хочется ли добровольно улучшить уже рабочую схему и прожить ещё один city-day.


## 11.0 focus — Release Week / living code

- Automation Commons больше не финальная точка: сохранённый код начинает обслуживать город несколько смен подряд.
- Пять authored-релизов: schema evolution, load change, stale knowledge, new tool authority, combined release night.
- `PATCH → TEST → CANARY → OBSERVE → DEPLOY / ROLLBACK` сначала переживается как последствия для знакомых сервисов, а не как DevOps-словарь.
- Q-Bot может предлагать неправильный patch; его уверенность не заменяет evidence.
- Тесты отделены от deploy: зелёный стенд — доказательство, а не автоматическая победа.
- Canary ограничивает blast radius, rollback сохраняет управляемость и не считается поражением.
- После пяти историй — deterministic RELEASE RUN и Python release guard.
- Campus profile v10 хранит releases / rollback / runs / code guard merge-safe.
- Human playtest должен проверить: ощущается ли ответственность за уже знакомые сервисы эмоционально, а не как новый чеклист.


## 12.0 focus — City Chronicle / living history

- старые решения становятся частью будущих проблем, а не исчезают после релиза;
- игрок сначала восстанавливает причину и зависимых людей/сервисы, потом меняет систему;
- technical debt показывается как наблюдаемая цена совместимости, а не мораль «старое = плохо»;
- Q-Bot может переобобщить старый правильный lesson — counterexample/eval обновляют память без полного стирания;
- postmortem превращает инцидент в новый guardrail, а blame не считается системным улучшением;
- deterministic MAINTENANCE WINDOW даёт replay уже понятой причинности;
- после mastery открывается настоящий Python migration policy;
- campus profile v11 хранит chronicle progress merge-safe.

## 13.0–15.0 focus — живой город → длинные истории → QUEST GUILD

- **13.0 CITY WEAVE** — архитектурные решения влияют на trust / resilience / access / throughput и на bounded autonomy Q-Bot; город не сворачивается в один «правильный» score.
- **14.0 CITY THREADS** — 10-сменные цепочки, повторяющиеся люди, новые районы из прошлых успехов и delayed echoes; после mastery — stateful Python orchestrator.
- **15.0 QUEST GUILD** — большой нелинейный разворот: семь RPG-профессий, старые garage/server fantasies возвращены как самостоятельные career paths, десять story contracts на real-world engineering archetypes, deterministic paid WORK ORDER и локальные complementary-role raids.
- QUEST GUILD доступен как ранний свободный хаб и не требует пройти CITY THREADS; старый прогресс распознаётся как профессиональная биография.
- Security/vehicle фантазия остаётся только на собственных/синтетических/разрешённых стендах; реальные exploit-инструкции не входят в игровой контент.
- 3D не становится prerequisite в 15.0: сначала human playtest должен доказать, что guild-loop и специализация сами по себе удерживают игрока.
