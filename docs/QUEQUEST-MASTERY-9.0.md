# QueQuest 9.0 — DISCOVERY → MASTERY → CODE

## Зачем изменён WORLD GRID

8.0 требовал наблюдений даже от игрока, который уже понял класс поломки. Это было полезно для первого знакомства, но плохо для ощущения мастерства. 9.0 разделяет обучение на две фазы.

1. **DISCOVERY** — новый паттерн. Игрок смотрит на мир, трогает узлы, видит причинность и только потом узнаёт термин.
2. **MASTERY / CHALLENGE** — знакомый паттерн. Игра больше не требует повторно собирать те же улики. Можно сразу выбрать архитектурное вмешательство или открыть **DIRECT PATCH** и исправить систему настоящим Python.

Это сознательно вдохновлено различием guided/walkthrough и challenge-практики в hands-on учебных платформах, но без FOMO/streak-обязаловки. В QueQuest retention должен идти от желания стать сильнее в мире игры, а не от страха потерять серию дней.

## Mastery families

- `flow` — burst / очередь / batching / workers;
- `effects` — timeout после side effect / idempotency;
- `knowledge` — freshness / provenance / eval;
- `stream` — progressive output;
- `authority` — capability vs permission;
- `resilience` — cascade / breaker / degraded mode;
- `boundary` — schema validation.

Первое корректное решение семьи добавляет её в `masteredPatterns`. Для CITY SHIFT этой семьи больше нет обязательного inspection gate.

## DIRECT PATCH

После mastery у знакомого CITY SHIFT появляется Python-патч. Он запускается через тот же CPython/Pyodide runner, что Code Dock, и проверяется поведенческими тестами. Это не выбор готового ответа. Игрок сам пишет функцию.

Примеры: `apply_once`, `valid_payload`, `allow_tool`, generator streaming, degraded route, freshness.

## Что не доказано автоматикой

- насколько рано конкретному новичку захочется перейти в код;
- достаточно ли сильное ощущение «я теперь бог» после открытия DIRECT PATCH;
- не стоит ли mastery открывать после двух, а не одного успешного решения.

Это нужно проверять human playtest-ом.

## BLACK BOX

После освоения всех семи семейств открывается `BLACK BOX SHIFT`. У generated-инцидента больше нет подсвеченных больных узлов. Игрок получает только симптом и обычную карту связей. Он может исследовать её вручную или сразу использовать DIRECT PATCH. Это challenge-режим: неизвестность возвращается, но туториальная обязаловка — нет.
