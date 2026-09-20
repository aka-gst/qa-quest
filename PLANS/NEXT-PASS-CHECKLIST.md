# QueQuest 4.0 — first-hour engagement pass + системные игрушки

## Закрыто в 2.0

- [x] основная game-first кампания из 8 глав;
- [x] Инженерный кампус после `reward8` вместо экрана coming soon;
- [x] XP/ranks и переносимый local-first профиль;
- [x] 18 системных authored contracts;
- [x] детерминированная бесконечная смена с queue/drops/race;
- [x] 30 real-CPython behavior contracts;
- [x] transparent AI lab: label/eval/reward;
- [x] Model Workbench: digits/letters/icons, epochs/loss/weights/augmentation;
- [x] LLM wrapper lab: instruction/context/schema/tools/evals;
- [x] provider-neutral Protocol boundary;
- [x] account-ready sync envelope без secrets;
- [x] multi-device XP merge через unique award ledger;
- [x] mobile layouts/touch target contracts для новых overlay;

## 2.1 — Neural Foundry · vertical slice закрыт

- [x] hidden layer как новая физическая возможность, а не ребрендинг linear model;
- [x] forward pass по рёбрам/нейронам виден пошагово;
- [x] loss и ошибка конкретного sample связаны визуально;
- [x] backprop показывает направление вклада в ошибку;
- [x] learning rate можно сломать слишком большим значением;
- [ ] train/validation split физически разделён;
- [ ] overfitting/early stopping можно увидеть, а не прочитать;
- [ ] noisy digits/letters/image families;
- [x] post-win Python формула остаётся компактной и проверяемой.

## 2.2 — Retrieval Warehouse / RAG · закрыт

- [x] documents → chunks как физический груз;
- [x] chunk size меняет качество retrieval;
- [x] embeddings/similarity визуализированы как близость, без ложного “понимания смысла”;
- [x] query → top-k → context → answer;
- [x] source/citation provenance виден на каждом chunk;
- [ ] context capacity / irrelevant chunks имеют цену;
- [x] hostile instructions внутри DATA не меняют system policy.

## 2.3 — Bot Forge · закрыт

- [x] planner/memory/retrieval/tools/policy/executor/evals как отдельные модули;
- [x] несколько допустимых архитектур на одну миссию;
- [ ] budget/timeout/retry/checkpoint как реальные ограничения;
- [x] бот чинит маленькую автоматизацию;
- [x] бот создаёт маленькую программу и прогоняет tests;
- [x] бот собирает правило мини-игры в sandbox;
- [x] два bounded bot-а координируются через очередь, а не скрытую магию;
- [x] human feedback меняет будущую стратегию и виден в state.

## 2.4 — Pythonio / real-world automation bridge · safe simulation закрыта

- [x] безопасные локальные file/folder задачи;
- [ ] CSV/text/image-metadata pipelines;
- [x] dry-run перед любым side effect;
- [x] HTTP/API sandbox до real credentials;
- [x] idempotency/retry/log/checkpoint встроены в blueprint;
- [ ] email/calendar/connectors только после явной авторизации;
- [x] ключи и OAuth token никогда не попадают в QueQuest profile/export.

## 2.5 — My AI Factory · закрыт

- [x] hidden eval по 10 разным отказам;
- [x] resource capacity вместо “включить все модули”;
- [x] модель или human fallback как допустимые альтернативы;
- [x] retrieval/provenance/tools/policy/DATA guard/reliability/queue/lock/checkpoint/trace/budget;
- [x] экспортируемый provider-neutral Python skeleton без secrets;
- [x] бесконечные deterministic Factory Trials;
- [x] XP за trial seed выдаётся один раз и merge-safe.

## Polish / playtest

- [ ] полный проход на 390×844 физическом телефоне;
- [ ] измерить реальное время основной кампании и каждого campus-модуля;
- [ ] найти места, где игрок нажимает по инструкции вместо понимания состояния;
- [ ] добавить skip для уже понятого объяснения, но не для ключевого действия;
- [ ] музыкальный payoff на крупных mastery, не на каждом маленьком успехе;
- [ ] pulse при сборке строки/модуля Python;
- [ ] проверить readability timelines/weights без цветового зрения;
- [ ] после пользовательской обратной связи переразложить difficulty/XP, не маскируя grind под content.


## 3.0 — SIMNET · external systems simulator закрыт

- [x] provider-neutral `CLIENT → GATEWAY → PROVIDER` без реального network call;
- [x] Bearer auth, model allowlist, request-id, timeout, streaming passthrough, secret redaction;
- [x] MCP `HOST → CLIENT → SERVER → RESOURCE/TOOL`, capability discovery отдельно от authority;
- [x] hostile instruction внутри resource остаётся DATA; side effect требует approval;
- [x] Git/DevOps evidence loop: branch → small diff → real test → status → evidence → Draft PR;
- [x] “agent says PASS” намеренно не считается доказательством;
- [x] `/health` и `/ready` разведены; backup + checksum + rollback видимы как разные границы;
- [x] voice/vision privacy route: permission + local route или sanitization;
- [x] бесконечные seeded incident drills: 401/400/429/502/stream/schema/tool/readiness/duplicate/secret leak;
- [x] campus profile v3 мигрирует v1/v2 и merge-safe хранит SIMNET stations/incidents;
- [ ] после playtest: добавить simulated webhook fan-out + dead-letter re-drive как authored story, если текущие incidents читаются слишком сухо;
- [ ] после playtest: настоящий opt-in adapter только как отдельный advanced toggle, не prerequisite.


## 4.0 — First-hour interest / zero-experience pass

- [x] первые три ручные доставки визуально записываются как `LEARNING PATH → PATTERN READY`;
- [x] ранние концепты получают мост `МИР → СМЫСЛ → PYTHON`, без лекции до физической проблемы;
- [x] одна кампания для новичка и опытного: `A+ / A−` меняет только плотность помощи;
- [x] adaptive coach появляется только после реального застоя и исчезает при любом новом прогрессе;
- [x] настоящие CPython errors сохраняются; `A+` добавляет runtime-hint, не переписывая код игрока;
- [x] `SORTER BAY` после IF — необязательная переигрываемая системная игрушка;
- [x] неправильное правило сортировки материализует конкретные контрпримеры вместо «неверно»;
- [x] та же игрушка после поздних навыков вводит два признака и `and / or / not`;
- [ ] playtest: человек, который никогда не программировал;
- [ ] playtest: человек с базовым Python;
- [ ] измерить first-action, first-automation-payoff, stall-time и добровольный replay Sorter Bay;
- [ ] вырезать любой ранний кусок, который игрок проходит по инструкции без желания экспериментировать.


## 10.0 — Automation Commons / reusable power

- [x] после mastery знакомые проблемы можно автоматизировать, а не расследовать заново;
- [x] builder начинает с человеческого `КОГДА?`, потом показывает 2–3 осмысленных действия вместо длинного списка терминов;
- [x] stateful idempotency физически требует видимой памяти;
- [x] рабочая схема считается победой без обязательной оптимизации;
- [x] сохранённый blueprint реально загружается обратно для ремикса;
- [x] несколько валидных решений дают разные cost/speed/trust;
- [x] blueprints комбинируются в deterministic CITY AUTOPILOT;
- [x] capacity заставляет выключать лишние автоматы, а не включать всё подряд;
- [x] после живых дней визуальный builder можно заменить настоящим Python-autopilot;
- [x] семь Python-проверок проверяют поведение, а не совпадение текста;
- [x] profile v9 хранит commons-progress merge-safe и не фармит XP повторным merge;
- [ ] human playtest: новичок понимает `КОГДА → ТОГДА` без терминов;
- [ ] human playtest: после первого рабочего решения игрок добровольно пробует оптимизацию или ремикс;
- [ ] human playtest: CITY AUTOPILOT ощущается как власть над миром, а не как меню переключателей.


## 11.0 — Release Week / code after deploy

- [x] живые сервисы зависят от ранее построенных автоматов;
- [x] пять связанных release-историй вместо набора терминов;
- [x] Q-Bot patch не считается доказательством сам по себе;
- [x] тестовый стенд не засчитывается как production deploy;
- [x] risky patch требует canary + observation;
- [x] regression можно поймать до города и откатить без потери основного прогресса;
- [x] rollback является валидным инженерным исходом, но не завершает миграцию;
- [x] deterministic RELEASE RUN после authored-недели;
- [x] Python `decide_release()` проверяется реальным CPython;
- [x] profile v10 merge-safe хранит release progress;
- [ ] human playtest: игрок понимает смысл canary до слова `canary`;
- [ ] human playtest: плохой Q-Bot patch вызывает желание проверить, а не ощущение случайной ловушки;
- [ ] human playtest: rollback ощущается как сохранённый контроль, а не наказание.

## 12.0 — City Chronicle / living history

- [x] прошлые решения возвращаются как новые игровые ограничения, а не как lore;
- [x] минимум две записи прошлого обязательны перед первым осмысленным вмешательством;
- [x] compatibility-adapter может быть временно правильным компромиссом — legacy не объявляется «плохим кодом» автоматически;
- [x] `LEGACY CABLES` показывает цену прошлого физически и не является моральной шкалой;
- [x] Q-Bot получает историю обучения: старый правильный lesson может стать слишком широким правилом после смены мира;
- [x] deprecation/sunset проживаются через редкого старого клиента, а не через терминологию;
- [x] postmortem не засчитывает blame как обучение; победа требует нового guardrail/test/runbook/contract;
- [x] deterministic MAINTENANCE WINDOW после пяти authored-историй;
- [x] master path — настоящий CPython `compatibility_policy()` вместо повторного visual tutorial;
- [x] campus profile v11 хранит chronicle arcs/windows/postmortems/code mastery merge-safe;
- [ ] human playtest: игроку действительно хочется открыть старые записи, а не воспринимать их как обязательный текст;
- [ ] human playtest: `LEGACY CABLES` читается как цена зависимости, а не как «плохой score»;
- [ ] human playtest: после пяти историй Python-policy ощущается как освобождение от UI, а не ещё одно задание;
- [ ] future: возвращать конкретные пользовательские blueprints/patches в новые события, если это не создаёт непредсказуемые тупики при sync.

## 13.0 — City Weave / living consequences

- [x] городские решения влияют на несколько независимых сигналов: trust / resilience / access / throughput;
- [x] UI не сворачивает город в одну моральную «happiness» шкалу;
- [x] пять authored-смен показывают социальные последствия через знакомые районы и сервисы;
- [x] несколько инженерных решений могут быть валидными, но иметь разную цену;
- [x] решение сначала проживается одну смену, а только потом может быть закреплено;
- [x] extreme/brittle история может заблокировать growth-first финал, пока не восстановлено слабое место;
- [x] Q-Bot autonomy является видимым состоянием и отделена от capability/confidence;
- [x] deterministic CITY SEASON после пяти authored-смен;
- [x] master path — настоящий CPython `govern(event, city)` с `auto / human / defer`;
- [x] profile v12 хранит decisions/seasons/code mastery merge-safe и мигрирует v11;
- [ ] human playtest: полный новичок понимает четыре городских сигнала без объяснения терминов;
- [ ] human playtest: разные компромиссы ощущаются как интересный выбор, а не «угадай мнение дизайнера»;
- [ ] human playtest: видимый рост свободы Q-Bot вызывает чувство совместного развития, а не тревогу от непредсказуемости;
- [ ] future: добавить долгие цепочки жителей/районов на 8–12 смен только после проверки, что текущие пять историй эмоционально читаются.

## 14.0 — City Threads / long causal stories

- [x] десять связанных смен вместо короткой линейной цепочки;
- [x] одни и те же люди возвращаются и помнят контекст;
- [x] успешная автоматизация может открыть новый район и создать новую зависимость;
- [x] delayed echoes скрыты до момента возвращения последствия;
- [x] Q-Bot partnership растёт через доказанную совместную работу, а не просто через широкие права;
- [x] stateful CPython `orchestrate(event, memory)` после story mastery;
- [x] profile v13 хранит episodes/decisions/districts/echoes/cycles/partnership/code mastery merge-safe;
- [ ] human playtest: игрок помнит причину хотя бы одного echo без перечитывания архива;
- [ ] human playtest: открытый район ощущается следствием собственного успеха, а не обычной наградой;
- [ ] human playtest: повторяющиеся персонажи действительно становятся эмоционально знакомыми.

## 15.0 — Quest Guild / RPG skills + many ways to matter

- [x] QUEST GUILD доступен без прохождения одной длинной prerequisite-цепочки;
- [x] семь профессий: automation / AI / systems / security / vehicle / web / low-level;
- [x] прошлый прогресс распознаётся как история профессии, а не обнуляется;
- [x] возвращены старые сильные fantasies: свой vehicle rig и build-then-break own server;
- [x] минимум десять story quests, большинство опирается на публично задокументированные real-world engineering archetypes;
- [x] security/vehicle quests используют только synthetic / own / authorized scope и не содержат operational attack commands;
- [x] один quest допускает разные approach и прокачивает разные skill-сочетания;
- [x] deterministic WORK ORDER выдаёт CR отдельно от XP;
- [x] два локальных party-raid требуют complementary roles вместо одного maxed class;
- [x] profile v14 хранит quests / jobs / raids / skillLedger / creditLedger merge-safe;
- [ ] human playtest: игрок после первого часа сам выбирает профессию, а не ищет «правильную следующую главу»;
- [ ] human playtest: минимум две профессии ощущаются как реально разные игры, а не разные тексты над одинаковой кнопкой;
- [ ] human playtest: CR вызывает желание взять ещё заказ и имеет понятный смысл до появления большой экономики;
- [ ] human playtest: garage/server quests дают безопасное ощущение «я реально понял, как такие системы ломаются/защищаются», не превращаясь в инструкцию против реальной цели;
- [ ] 16.x candidate: дать CR реальные расходы — workstation/rig/modules/compute/raid prep — только если currency loop понравится в playtest;
- [ ] 16.x candidate: party loadout + async ghost teammates before real networking;
- [ ] future: один маленький 3D garage/warehouse vertical slice только после доказанного 2D guild-loop.
