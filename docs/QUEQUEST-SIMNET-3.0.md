# QueQuest 3.0 — SIMNET design boundary

SIMNET — полностью офлайн-симулятор внешних интеграций. Его задача не изображать настоящий интернет, а дать игроку переносимую mental model до первого реального API key или OAuth consent.

## Core fantasy

AI Factory умеет решать задачи внутри лаборатории. SIMNET открывает “внешний контур”: чужие endpoints, сервисные границы, инструменты, Git и датчики. Игрок не получает новую магическую модель — он учится делать уже построенную систему наблюдаемой, ограниченной и восстанавливаемой.

## Five authored stations

1. API Gateway: Bearer, allowlist, request-id, timeout, streaming, redaction.
2. MCP Switchyard: host/client/server, capability discovery, DATA guard, tool policy, approval.
3. Evidence Loop: branch, small diff, executable test, exit/output evidence, status, Draft PR.
4. Service Ops: health vs readiness, dependency failure, backup checksum, rollback.
5. Voice/Vision Route: explicit permission, local route or sanitization, trace without private payload.

## Endless loop

After the five stations, deterministic Incident Drill seeds produce one symptom across CLIENT / GATEWAY / PROVIDER / MCP / SERVICE. The player must localize the layer before selecting the fix. More workers/retries/model swaps are deliberately wrong answers for incidents where they do not address the boundary.

## Safety boundary

- no real network calls;
- no real tokens or providers;
- demo secrets are synthetic and redacted in successful traces;
- resources and retrieved text are untrusted DATA;
- discovered tools are capabilities, not automatic authority;
- side effects require explicit policy/approval;
- progress export never includes auth secrets.

## Source-derived design principles

The author-provided practicals emphasize atomic experiments, observable evidence, separate runtime components, local gateways, allowlists, request IDs, streaming, manual/plan-first operation and keeping secrets out of prompts/logs. The MCP and agent books reinforce host/client/server separation, tool/resource boundaries, memory/RAG/policy/evaluation decomposition. QueQuest converts those ideas into visible mechanisms and failure states rather than reproducing source text or code.
