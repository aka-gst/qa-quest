# QueQuest 9.0 — release pass

## Цель прохода

Исправить фундаментальную проблему WORLD GRID 8.0: наблюдение полезно при первом знакомстве с причиной, но превращается в рутину после понимания. 9.0 вводит прогрессию **DISCOVERY → MASTERY → CODE**.

## Реализовано

- 7 mastery families: `flow`, `effects`, `knowledge`, `boundary`, `authority`, `resilience`, `stream`;
- authored WORLD stories остаются discovery-first и требуют наблюдаемой причинности;
- первое успешное решение семьи сохраняет mastery в campus profile;
- знакомый CITY SHIFT больше не требует inspection gate;
- для знакомого pattern появляется **DIRECT PATCH** — настоящий Python через общий Pyodide/CPython runner;
- 7 прямых Python-патчей имеют поведенческие проверки: burst buffer, apply-once, freshness, schema boundary, tool allowlist, degraded route, generator streaming;
- после 7/7 mastery открывается **BLACK BOX SHIFT**: симптом остаётся, подсветка больных узлов исчезает;
- direct-code и black-box seeds сохраняются merge-safe;
- campus profile / sync schema: v8, legacy v1–v7 / server v2–v7 поддерживаются при rollout;
- A+ и A− остаются одной игрой: различается amount of guidance, а не набор механик.

## TryHackMe reference pass

В 9.0 перенесён не cyber/offensive content, а учебный паттерн: guided/walkthrough практика должна постепенно уступать challenge-практике. Их публичные рекомендации также подчёркивают hands-on задачи вместо quiz-only и уменьшение guidance с ростом сложности.

Streaks/leagues/leaderboards не сделаны обязательным progression gate: QueQuest должен удерживать желанием сильнее влиять на мир, а не боязнью потерять серию дней.

## Проверки

Заполнить финальными цифрами после упаковки:

- Node regression: **300/300 PASS**
- negative controls: **PASS** (negative cases действительно падают)
- content verifier: **154 задач · 0 ошибок · 0 тривиальных**
- JS syntax: **71/71 PASS**
- DOM/selectors: **560 ID · 560 unique · 0 duplicate; 489 direct selector occurrences / 354 unique IDs · 0 missing**
- clean ZIP re-run: **300/300 PASS + selftest PASS + content 154/0/0**

## Human playtest — обязательно

Автоматика не доказывает:

- чувствуется ли DIRECT PATCH как награда за понимание;
- не открывается ли mastery слишком рано;
- хочется ли после guided story добровольно идти в BLACK BOX;
- понятен ли человеку без опыта сам момент перехода “теперь можешь сразу кодом”.

## Финальный clean-ZIP smoke

Финальный релизный ZIP был распакован в отдельную чистую папку. Из распакованной копии повторно выполнены полный Node regression (**300/300**), negative-control selftest (**PASS**) и content verifier (**154/0/0**).
