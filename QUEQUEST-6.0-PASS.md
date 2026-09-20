# QueQuest 6.0 — release pass

## Что изменено

- Factory Nexus получил физическую линию `SOURCE → BUFFER → WORKERS → OUTPUT`.
- `drops / duplicates / unsafe / quality miss` видны как разные состояния физических грузов.
- Добавлены 6 необязательных `BONUS ORDER`, не блокирующих основную прогрессию.
- Q-Bot в `A+` показывает человеческое состояние и memory-rack до технических метрик.
- Плохой reward по-прежнему может сделать Q-Bot увереннее в неправильной стратегии.
- Профиль мигрирован на v5; `remixMissions` merge-safe и награда выдаётся один раз.
- В Nexus добавлен небольшой CC0 UI click из Kenney Interface Sounds с локальной лицензией и synth fallback.
- `A−` сохраняет быстрый технический интерфейс; правила игры и симуляция в A+/A− одинаковы.

## Автоматические проверки

Финальные цифры этого файла обновляются после упаковки и повторной распаковки релиза.

- Node regression: `277/277 PASS`
- negative-control selftest: `PASS`
- content verifier: `154 задач / 0 ошибок / 0 тривиальных`
- JS syntax: `69/69 runtime JS PASS`
- main DOM duplicate IDs: `477 IDs / 477 unique / 0 duplicates`
- direct runtime ID selectors: `319 total; 310 main + 9 replay / 0 unresolved`
- replay selectors: `9/9 PASS`
- release ZIP re-unpack smoke: `PASS (full regression + selftest + content + syntax + DOM/assets)`

## Что автоматические проверки не доказывают

- реальный playtime;
- субъективную увлекательность;
- желание добровольно решать BONUS/следующий seed;
- читаемость и комфорт на конкретном физическом телефоне;
- качество звукового баланса на реальных динамиках/наушниках.

Эти пункты требуют human playtest.
