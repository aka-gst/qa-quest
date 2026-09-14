# Как доделать QueQuest

## Что это и что проверено
QueQuest — сюжетная игра, где обучение программированию встроено в ремонт/защиту: первый эпизод — три ручных ящика, начальник, уход, падение чипа и его установка в видимый разъём. В репозитории есть браузерный game-first маршрут, localStorage сохраняет version/checkpoint; общий account/progress API для него не доказан.

## Сохранённые решения

- **Механики:** ящики, ручная работа, чип запускает машину; позже вырванная кнопка требует `print`, красные ящики требуют остановки и `if`.
- **История:** начальник, дверь и последовательный первый эпизод; не заменять его ранним PvP.
- **Вика/чип/вирус:** Вика и вирус — последующие сюжетные ступени после ясного первого эпизода.
- **Друзья-защита:** друзья-хакеры атакуют и защищают серверы с устойчивыми приёмами; это будущий дизайн.
- **Learning:** команды открываются через возникшую проблему, затем боты и автоматизация.
- **Account/mobile:** прогресс сейчас локальный; account sync и физический телефон требуют отдельной проверки.

## Неопределённости
Дизайн друзей, точная подача Вики/вируса, PvP правила, account backend и live acceptance не подтверждены. Планируемое не считать реализованным.

## Следующие результаты
1. Независимо принять первый эпизод с чипом и дверью.
2. Зафиксировать понятное появление ошибки/потребности в `print`.
3. Добавить красный ящик → остановка → `if` после design gate.
4. Спроектировать Вику и вирус как отдельную проверяемую ступень.
5. Спроектировать friends-defense без безличного PvP.
6. Проверить local save/resume на desktop и mobile.
7. Отдельно решить account/progress contract.
8. Только затем выбирать объём ботов и автоматизации.

Источники: `P-20260908-QUEQUEST-CHIP-FIRST-SLICE`, `P-20260908-QUEQUEST-LEARN-BY-NEED`, `P-20260908-QUEQUEST-FRIENDS-DEFENSE`, `P-20260909-QUEQUEST-EARLY-BOT`, `P-20260908-QUEQUEST-SAVE-DESIGN-FACTS`, `QUEQUEST-SERGEY-DOSLOVNO-20260907.md`.

## Coverage appendix: all archived QueQuest/QQuest rows (30 rows)

- `P-20260909-QUEQUEST-EARLY-BOT` — не начато; future/open decision; next/no-action: После разрешённого возобновления и приёмки первого эпизода спроектировать раннего бота; получить фактическую обратную связь друга, не считать запланированный показ состоявшимся.
- `P-20260909-QUEQUEST-CHIP-FIRST-SLICE` — заблокировано; blocked/preserve decision; next/no-action: Безопасная остановка по правилу52в: remaining20%. После разрешённого возобновления — независимый обычный путь desktop/phone; сцена двери и край разъёма390px. До этого без работ и п
- `P-20260908-QUEQUEST-FRIENDS-DEFENSE` — не начато; future/open decision; next/no-action: Отдельно согласовать характеры/приёмы/правила после складского эпизода; не добавлять в текущую реализацию и не превращать в безличный PvP.
- `P-20260908-QUEQUEST-LEARN-BY-NEED` — не начато; future/open decision; next/no-action: Продолжение P-20260908-QUEQUEST-SCENE-UX, не замена: вставка чипа запускает машину в первойцепочке; позже вырываюткнопку→ручнойprint; белыеящикипроносятся, красныене брать/отложить
- `P-20260908-QUEQUEST-CHIP-SOCKET` — не начато; future/open decision; next/no-action: После design gate реализовать: пустой разъём → чип входит и фиксируется → установленный чип остаётся в корпусе и ЗАПУСКАЕТ машину. Ручной print позже после вырванной кнопки. Провер
- `P-20260908-QUEQUEST-VIKA-FACE` — заблокировано; blocked/preserve decision; next/no-action: DESIGN_GATE: согласовать с Сергеем вид лица и привязку реплики (предложение Рота: bubble tail к лицу + малая подпись Вика, пока не утверждено). До gate не генерировать/кодить/публи
- `P-20260908-INBOUND-ACK-GUARD` — в работе; future/open decision; next/no-action: Подготовить узкийmechanicalguardсRED/GREEN/sourceboundaries послеRELEASEМозга; existingtests test_porucheniya.py/test_inbound_ack_guard.py, новые test_astra_* толькоexactdeclaredpa
- `P-20260908-POKEMON-2D-TO-3D-RECOVERED` — не начато; future/open decision; next/no-action: Только после текущего site finish: восстановить исходный референс/область, реализовать multiple moving2D→selected click→distinct3D; проверить промах/отсутствие клика (3D не открыва
- `P-20260906-QUEQUEST-FINALE-LAYOUT` — in_progress; future/open decision; next/no-action: Компоновка и погоня выпущены и проверены в браузере по полученным квитанциям. Для закрытия всей строки получить отдельный явный исход критерия (3): образ компьютерных вирусов во вс
- `P-20260906-QUEQUEST-EXIT` — готово; shipped evidence; next/no-action: Закрыто по живой версии e580f71: перед следующей сменой интерфейса повторить три исхода выхода и отдельно проверить на физическом iPhone; не выдавать это за проверку сохранения про
- `P-20260906-QUEQUEST-BEGINNER-UX` — in_progress; future/open decision; next/no-action: Проверить новичковый путь на актуальной опубликованной версии с фиксацией её SHA: человек без подсказок автора понимает действие, ввод команды, автоматизацию и награду; отдельно фи
- `P-20260905-QUE-UX` — готово; shipped evidence; next/no-action: Конкретный выпуск принят; другие поручения не закрывать этим результатом. При новой правке — новая сверка live и квитанция.
- `P-20260905-ASTRA` — готово; shipped evidence; next/no-action: Сергей выбирает пакет реализации по веб-отчёту; отдельно согласовать исправления, релизы и углублённую проверку защиты/восстановления.
- `P-20260904-06` — готово; shipped evidence; next/no-action: Открыть локальную HTML-сводку; при новом факте обновить соответствующую карточку, а не создавать второй отчёт.
- `P-20260906-28` — в работе; future/open decision; next/no-action: Получить квитанцию узкой CSS-починки AudioSurf: существующие цветовые переменные, читаемые текст/CTA, CTA/выход>=44px; независимая проверка и точечный выпуск без LOW/Tseh. Browser 
- `P-20260906-31` — готово; shipped evidence; next/no-action: Следующий отдельный срез — новое видео QQuest и Telegram-подобное распыление; текущую принятую читательскую механику не менять без новой жалобы. Physical iPhone и direct live-brows
- `P-20260906-32` — в работе; future/open decision; next/no-action: Новая командаделаем на конкретныйruleset:человек+3AI,6одновременныхраундов,вымышленныеатаки/защиты. Владелец сверяет текущийscope и финиш принятойосновы;один изолированныйматч,безр
- `P-20260907-SITE-QUEQUEST-PRAKTIKUM-TSEH` — готово; shipped evidence; next/no-action: Живой результат принят: открыть aka-gst.ru/#work и проверить карточку QueQuest; отдельные старые долги verify по qa-quest, psy-admin и birzha не смешивать с этой сдачей.
- `P-20260907-SITE-QUEQUEST-CARD` — готово; shipped evidence; next/no-action: Открыть живую карточку QueQuest и рассказ «Пуля в стакане»; дальнейшие правки только после живого просмотра Сергеем.
- `P-20260908-TEAM-SYSTEM-POST-AUDIT` — в работе; future/open decision; next/no-action: Разрешённаяранняяподготовка: существующаяАстра/root/astra_system_audit read-onlyinventory + solewriterузких2scripts/tests послеRELEASEМозга, не ждать7/7 дляэтогосреза. Общееобъявле
- `P-20260908-QUEQUEST-SAVE-DESIGN-FACTS` — готово; shipped evidence; next/no-action: Факты переданы автору частного HTML 01a05f4b-bd00-7bb1-8a95-8717938c9e27; реализацию не начинать до отдельного принятого дизайна и команды Сергея.
- `P-20260908-QUEQUEST-SCENE-UX` — заблокировано; blocked/preserve decision; next/no-action: FINAL USER DECISION08.09 заменяет старуюисторию: 3ручныхящика→начальникругаетзамедленнуюработу→уходит/хлопаетдверью→состеныпадаютчип+подсказка→игроквставляетчип→машинапереноситящик
- `P-20260908-AUTH-PROGRESS-RESEARCH` — в работе; future/open decision; next/no-action: Факты получены: currentlive QueQuest093b3ea accountcloudsaveНЕподключён, толькоlocalcheckpoint. Руки уточняют уже созданный privateHTML /Users/gst/Documents/aka-gst-private/reports
- `P-20260908-PROJECT-CANON-RECOVERY-GATE` — в работе; future/open decision; next/no-action: К18:00 восстановить полные CURRENT трёхпроектов:QueQuest/Торгаш/UNO, exactsources/date/revision/hash и supersession; до substantiveownerACK актуальнойревизии HARDSTOPimplementation
- `P-20260908-EXISTING-GAME-SAVE-PROVENANCE` — ready_for_acceptance; future/open decision; next/no-action: ИдентифицированаЛилаv1: siteownersourceпакет→независимаяread-onlyпроверкаисточников/commit/callchain и включениевprivateAUTHdocument. Не считатьисторическийoutboxтестдоказательство
- `P-20260908-QUEQUEST-EXISTING-SAVE-INTEGRATION` — заблокировано; blocked/preserve decision; next/no-action: Назначенные gates: G1Мозг — source-completeCURRENTrevision/hash+latestsource+ownerACK (запроспакетаРту, candidatebriefНЕканон); G2Рот — явное снятиеегоdocumentHARDSTOPпослеG1, недо
- `P-20260908-LIMIT20-DUKH-ONLY` — в работе; future/open decision; next/no-action: SAFE STOP применён к текущей работе сайта: writer прерван, активные задачи P-20260909-PATH-ASYMMETRIC-TRIO/COMIC-DENSITY-NAV/HOMEPAGE-SYNC-DEMO-TWEET/WORK-CAPTIONS-QUEQUEST-NEUTRAL
- `P-20260909-PATH-ASYMMETRIC-TRIO` — заблокировано; blocked/preserve decision; next/no-action: SAFE STOP: sole writer прерван при официальном remaining20% до завершения production-edit, build, rendered evidence, commit/push/deploy. После явного возобновления продолжить из со
- `P-20260909-WORK-CAPTIONS-QUEQUEST-NEUTRAL` — заблокировано; blocked/preserve decision; next/no-action: SAFE STOP remaining20%: после возобновления scoped tests/negative control и rendered desktop+390 sampled-color comparison; no commit/push/deploy до independent PASS.
- `P-20260909-QUEST-OPENCV-FUTURE-CAPABILITY` — не начато; future/open decision; next/no-action: После завершения текущего фокуса Orion и Дух отдельно определить один дешёвый вертикальный срез, устройство/камеру, правила приватности и критерий полезности для квеста; до этого н

## Exact design decisions preserved

Vika's future appearance is the blue floating half-human/female computer face without a body; the line «А вот и ты» is attributed to Sergey. The virus/finale visual remains a later story beat. The friends-defense episode is about distinct friends, attacks, defenses and teaching after victory, not generic PvP. The first bot should arrive early when a problem makes it necessary. Beginner UX must show the goal before teaching syntax. Save/account facts remain local-first and unproven for shared progress. Mobile acceptance needs ordinary touch at 390×844 and a wider phone path.

Already shipped: the current game-first browser route and local checkpoint behavior. Future: chip/first slice acceptance, Vika/virus/finale, friends defense, learn-by-need, early bot, account contract and mobile retest. Do not replace the first episode, invent a live backend, publish, or call planned design implemented.
