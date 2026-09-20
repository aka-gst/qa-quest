# QueQuest 0.3 · visible-programming pass

## Что изменилось

- добавлена третья смена `LIST / QUEUE → WHILE`;
- Q-Bot получает ночную очередь с обычными и красными ящиками;
- программа выполняется настоящим CPython/Pyodide;
- `trace.visit` отделён от allowlisted world-events и служит только визуализации;
- терминал показывает массив/очередь, текущий `box`, IF-gate и `arm.move`;
- тот же указатель рисуется прямо в складе над физическими ящиками;
- дневник навыков расширен `LIST / QUEUE` и `WHILE`;
- `reward3` продолжает в уже существующий локальный friends-sandbox, не выдавая его за настоящий PvP/backend;
- исправлен поиск красного ящика во второй смене: интерактив теперь не привязан к старому id `red-01`.

## Проверка

- `node --test tools/*.test.mjs`;
- `sh tools/selftest.sh`;
- `python3 tools/verify_content.py`.

Live Chromium acceptance в этой среде недоступен: навигация headless Chromium к localhost/file URL блокируется администратором. Это инфраструктурное ограничение проверки, не игровой fallback. Mobile 390×844 всё ещё требует физического устройства.
