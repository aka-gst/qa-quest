# QueQuest 3.0 — release pass

## Главный production pass

QueQuest 3.0 добавляет **SIMNET** — полностью офлайн-симулятор внешних систем. Он открывается после первого mastery `My AI Factory` и учит не конкретному SDK, а переносимым границам интеграции: auth, policy, request identity, streaming, MCP, executable evidence, readiness, recovery и privacy routing.

### 5 authored stations

1. **API Gateway** — `CLIENT → GATEWAY → PROVIDER → STREAM`: Bearer, model allowlist, request-id, deadline, streaming passthrough, secret redaction.
2. **MCP Switchyard** — `HOST → MCP CLIENT → MCP SERVER → RESOURCE / TOOL`: discovery отдельно от authority, hostile text остаётся untrusted DATA, side effects требуют policy/approval.
3. **Git / DevOps Evidence Loop** — `PLAN → BRANCH → DIFF → TEST → DRAFT PR`: фраза агента “tests passed” не является proof без command + exit code + output + status.
4. **Service Ops** — liveness `/health` отделён от dependency readiness `/ready`; backup, SHA-like checksum и rollback существуют как разные границы восстановления.
5. **Voice / Vision Privacy Route** — sensor permission, local route или sanitization, redacted trace.

### Infinite Incident Drills

После пяти станций открывается детерминированный `INCIDENT #seed`. Каталог включает:

- 401 auth mismatch;
- 400 model allowlist;
- 429 provider rate limit;
- upstream timeout / 502;
- streaming contract broken while HTTP succeeds;
- invalid structured output with HTTP 200;
- denied MCP tool / capability vs authority;
- `/health=200`, `/ready=503`;
- duplicate side effect after timeout;
- secret leakage through debug trace.

Игрок выбирает **слой отказа** (`CLIENT / GATEWAY / PROVIDER / MCP / SERVICE`) и затем исправление. XP начисляется только за впервые решённый seed и хранится merge-safe.

## Python depth

Кодовый док расширен с 24 до **30 CPython-контрактов**. Новые задания:

- `redact_headers`;
- `service_status` (`health != ready`);
- provider-neutral request envelope;
- MCP allowlist filter;
- idempotent webhook acceptance;
- executable evidence validation.

Для шести новых заданий отдельно прогнаны эталонные CPython-реализации.

## Progress / account boundary

Campus profile обновлён до **v3**:

- миграция local profile v1/v2;
- sync adapter принимает legacy v2 envelope во время rollout;
- SIMNET station mastery и incident seeds объединяются монотонно;
- unique reward ledger не дублирует XP;
- токен синхронизации остаётся только transport header и не входит в profile/export.

## References used as design constraints

Авторские практикумы и agent-service lab использованы как инженерные reference materials, а не как копируемый контент. В игру перенесены принципы атомарных наблюдаемых экспериментов, независимых компонентов, local gateway, allowlists, request-id, streaming, evidence, secret boundaries, health/readiness, bounded tools and rollback. MCP/agents/API/data-engineering books используются для терминологии и системных границ. Сами книги, практикумы и сторонний код в релиз не встраиваются.

## Verification

На рабочей release-копии:

- `node --test tools/*.test.mjs` → **240 / 240 PASS**;
- `sh tools/selftest.sh` → negative controls **PASS**;
- `python3 tools/verify_content.py` → **154 tasks / 0 errors / 0 trivial**;
- syntax check основных изменённых JS modules → PASS;
- main DOM audit → **400 IDs / 400 unique / 0 duplicates**;
- direct `src/game/*.js` `#id` selectors → **0 missing**.

## Known acceptance boundary

Автоматический браузерный visual smoke в текущей среде ранее блокировался административной политикой. Поэтому реальный phone/browser playtest остаётся отдельным human acceptance pass: pacing, readability, scroll/focus, tactile feel и момент, где игрок начинает brute-force включать модули вместо диагностики.
