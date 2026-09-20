# QueQuest 15.0 · реальные истории → безопасные игровые квесты

Этот файл разделяет **что действительно сообщал источник** и **что QueQuest выдумывает для игры**. Квесты не являются реконструкциями атак и не предназначены для действий против реальных систем.

## 1. CrowdStrike · неудачный update → «ПЯТНИЦА»

**Публичный факт.** CrowdStrike описала инцидент 19 июля 2024 года: проблемное Rapid Response Content update для Windows hosts приводило к system crashes; изменение было позже откачено. Источник: CrowdStrike Preliminary Post Incident Review.  
https://www.crowdstrike.com/en-us/blog/falcon-content-update-preliminary-post-incident-report/

**Что переносим в игру.** Драматургию «маленькое изменение → огромный blast radius», staged rollout, contract test, canary и rollback.

**Что не переносим.** Реальные детали инфраструктуры/доступа CrowdStrike и любые инструкции по воздействию на чужие endpoints. В QueQuest это вымышленный городской update.

## 2. xz / CVE-2024-3094 · supply-chain provenance → «ПАКЕТ ИЗ ТЕНИ»

**Публичный факт.** В марте 2024 Red Hat предупредила о вредоносном коде в xz 5.6.0/5.6.1 и рекомендовала affected users прекратить использование затронутых версий. Источник: Red Hat security alert.  
https://www.redhat.com/en/blog/urgent-security-alert-fedora-40-and-rawhide-users

**Что переносим в игру.** Разницу source/release artifact, provenance, reproducible evidence и идею «популярная зависимость тоже является границей доверия».

**Что не переносим.** Exploit chain, реальные targets и operational payload. Квест работает только с синтетическими package artifacts QueQuest.

## 3. Mandiant / Snowflake customer instances · старые credentials → «КЛЮЧ, КОТОРЫЙ НЕ УМЕР»

**Публичный факт.** В исследовании UNC5537 Mandiant связала исследованные компрометации Snowflake customer instances с ранее украденными customer credentials; среди observed factors были отсутствие MFA у затронутых аккаунтов, долгоживущие/неотозванные credentials и отсутствие network allow lists. Mandiant отдельно указывала, что evidence не указывал на breach enterprise environment Snowflake. Источник: Google Cloud / Mandiant.  
https://cloud.google.com/blog/topics/threat-intelligence/unc5537-snowflake-data-theft-extortion

**Что переносим в игру.** MFA, rotation, ownership, allowlist, anomaly audit и мысль «правильный пароль не доказывает, что вход безопасен».

**Что не переносим.** Credential-stealing, malware, реальные account takeover шаги или реальные сервисы. Игрок получает только defensive synthetic login events.

## 4. Cloudflare · общая storage-зависимость → «ОДИН СКЛАД · ДЕСЯТЬ СЕРВИСОВ»

**Публичный факт.** Cloudflare сообщила, что 12 июня 2025 сбой infrastructure underlying Workers KV затронул несколько зависимых сервисов, включая Access, Gateway, WARP, Workers AI и другие; компания отдельно отметила ответственность за архитектурные dependency choices. Источник: Cloudflare outage report.  
https://blog.cloudflare.com/cloudflare-service-outage-june-12-2025/

**Что переносим в игру.** Shared dependency, blast radius, failure-domain split, cache/degraded mode и вопрос «десять продуктов — это точно десять независимых систем?».

**Что не переносим.** Конкретную production topology Cloudflare. Игровой «склад» — полностью вымышленная dependency graph.

## 5. Hyundai/Kia theft campaign + automotive research → «НОЧЬ В БОКСЕ»

**Публичный факт.** NHTSA в 2023 сообщала о free anti-theft software updates для миллионов Hyundai/Kia vehicles после волны thefts. Источник: NHTSA.  
https://www.nhtsa.gov/press-releases/hyundai-kia-campaign-prevent-vehicle-theft

**Дополнительный контекст.** Pwn2Own Automotive использует заранее определённые/разрешённые targets, включая automotive infotainment, EV chargers и связанные embedded categories. Официальный ресурс Zero Day Initiative:  
https://www.zerodayinitiative.com/blog/2024/1/23/pwn2own-automotive-2024-the-full-schedule

**Что переносим в игру.** Автомобиль как software-defined system, trust boundary владельца, безопасный диагностический стенд, build → test your own defense, firmware/state-machine thinking.

**Что не переносим.** Реальные марки как targets, CAN IDs/commands, theft bypass, эксплуатационные шаги. В QueQuest машина синтетическая и принадлежит игроку.

## 6. Air Canada chatbot decision · AI promise → «БОТ ПООБЕЩАЛ ЛИШНЕЕ»

**Публичный факт.** В деле Moffatt v. Air Canada (2024) tribunal рассматривал неправильную информацию, предоставленную chatbot на сайте Air Canada; публичное обсуждение решения подчёркивало, что организация не может просто отделить chatbot от собственного сервиса. Primary decision доступен через CanLII; обзор CanLII Blog:  
https://canlii.ca/t/k2spq

**Что переносим в игру.** Source/provenance, evals, escalation, abstention и ответственность системы за уверенный ответ.

**Что не переносим.** Юридический совет или вывод о том, как любой конкретный будущий суд решит похожее дело. В игре это вымышленная сервисная стойка.

## 7. GitHub Copilot coding agent · issue → PR/review → «Q-BOT ПРИНЁС PULL REQUEST»

**Публичный факт.** GitHub описывала coding agent, которому можно делегировать issue; агент работает в отдельной среде, создаёт changes и открывает draft pull request для review. Источник: GitHub.  
https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/

**Что переносим в игру.** Bounded scope, diff, tests, draft PR, evidence и human review.

**Что не переносим.** Доступ к реальному GitHub аккаунту игрока в обязательной кампании. Q-Bot работает в локальном synthetic repo QueQuest.

## 8. Реальный рынок automation/AI integration → «ПЕРВЫЙ ПЛАТНЫЙ ЗАКАЗ» и WORK ORDER

**Публичный факт.** Upwork в своём 2025 skills report называл Scripting & Automation самым быстрорастущим навыком в категории Coding & Web Development. В более поздних собственных marketplace reports Upwork также сообщал о росте интереса к AI integration / AI automation направлениям. Источники:  
https://www.upwork.com/press/releases/upwork-unveils-2025s-most-in-demand-skills

**Что переносим в игру.** Рутину действительно можно превращать в скрипты/workflows/API glue и получать за полезную работу отдельную награду `CR`.

**Что не переносим.** Обещание дохода, ставки, карьерные гарантии или тезис «AI = лёгкие деньги». `CR` — игровая экономика, а реальные источники используются только для подтверждения, что такие категории работы существуют.

## Принцип трансформации

Для каждого real-world inspired quest:

1. сохраняем наблюдаемую инженерную причинность;
2. заменяем реальные компании/targets на вымышленные системы QueQuest;
3. security/vehicle действия выполняются только на своём, синтетическом или явно разрешённом стенде;
4. не добавляем operational exploit commands, credential theft, реальные target instructions или обход чужого доступа;
5. победой считаем доказанное исправление/архитектуру/automation, а не сам факт «сломал»;
6. после игрового понимания показываем, какой реальный класс инженерной идеи игрок только что применил.

Так новости становятся **сюжетным сырьём для игры**, но не walkthrough по реальному инциденту.
