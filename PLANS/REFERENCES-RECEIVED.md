# Полученные референсы для улучшения QueQuest

В пакет не копируются сами книги/видео; здесь только индекс того, что уже прислано и как использовать при следующем проходе.

## Главные сейчас

1. **Steve Swink — Game Feel**
   - приоритет: высокий;
   - применять к скорости ответа, input/response, анимации руки, импульсам сборки кода, звуку true/false/error/success, ощущению физической машины.

2. **Jesse Schell — Искусство геймдизайна / Book of Lenses**
   - приоритет: высокий;
   - использовать для проверки каждой главы через цель игрока, выбор, обратную связь, кривую интереса и понятность метафоры.

3. **Scott Rogers — Level Up!**
   - приоритет: высокий;
   - использовать для pacing, tutorialization, подачи нового навыка через игровую проблему и награду.

4. **Naomi Ceder — Python. Экспресс-курс**
   - приоритет: высокий;
   - source для точной терминологии Python и проверки, что игровой порядок не оставляет фундаментальных дыр. Не копировать оглавление как кампанию.

5. **Romero & Sewell — Blueprints. Визуальный скриптинг UE5**
   - приоритет: высокий для визуализации;
   - использовать идеи event → condition → action, функции, переменные, структуры данных и видимые связи объектов; не копировать интерфейс Unreal.

6. **Видео «Алгоритмы и структуры данных за 15 минут»**
   - приоритет: высокий как визуальный референс;
   - принцип: один объект = одна мысль; указатель двигается; структуры данных меняются на глазах; абстракция объясняется движением.

7. **Factorio / видео об инженерной автоматизации**
   - применено как системный визуальный референс: весь поток виден сразу, накопление обозначает bottleneck, масштабирование меняет throughput;
   - не копировать интерфейс, рецепты, ассеты или конкретные механики Factorio.

8. **Andrew Harmel-Law — Программная архитектура**
   - использовать архитектуру как цепочку проверяемых решений с trade-off: источник, buffer, worker, shared state;
   - показывать зависимости и последствия решения прямо в системе, а не выдавать «правильную архитектуру» заранее.

## Позже

9. **Фабио Нелли — Параллельное программирование на Python**
   - применено в главе 8 только после того, как игрок физически получил очередь, два worker-а и общую память;
   - `asyncio`, очередь и синхронизация не используются как ранняя лекция.

10. **Искусственный интеллект в компьютерных играх**
   - использовать для поведения Q-Bot, союзников и противников; не превращать beginner-кампанию в лекцию про AI.

## Правило работы с референсами

Книга не определяет порядок глав. Сначала возникает игровая проблема, затем выбирается минимальная программная идея, которая красиво и честно её решает. Референсы используются для качества объяснения, game feel, pacing и технической точности.


## Получено для SIMNET / AI systems pass

11. **Авторские практикумы по локальным AI-агентам, Git и DevOps**
   - атомарные эксперименты с наблюдаемым evidence;
   - отдельные компоненты runtime вместо слова “агент” для всей системы;
   - local OpenAI-compatible gateway, bearer auth, allowlists, request-id, safe errors и streaming;
   - независимый review не заменяет тест; секреты не попадают в prompt/screenshot/commit/log.

12. **Учебный `ai-agent-service-lab`**
   - использован как reference ladder: model API → structured output → tool loop → memory → RAG → eval → FastAPI/service boundary → security/handoff;
   - health/readiness, bounded tool loop, backup/rollback и acceptance evidence перенесены как игровые failure modes, а не скопированный код.

13. **Айдоуби — MCP для систем ИИ**
   - host/client/server делаются физически разными узлами; discovery capabilities не означает permission; resources остаются DATA.

14. **Michael Albada / Mira Devlin / Vladimir Dronov — AI agents, RAG, reflection, LangChain**
   - agent decomposed into model/context/tools/memory/policy/evals; retrieval/provenance/reflection объясняются через уже знакомые игровые потоки.

15. **Andriy Burkov — Language Models**
   - использовать позже для более глубокой ветки embeddings/transformer/finetuning/eval, только когда игрок уже почувствовал ограничения предыдущих моделей.

16. **Ryan Day — Applied APIs; Bartosz Konieczny — Data Engineering patterns**
   - API contracts, data boundaries, pipeline observability and failure recovery становятся станциями/инцидентами SIMNET.

17. **Peter Corke — Robotics, Vision and Control**
   - зарезервирован для advanced multimodal/robotics branch после playtest; не тащить математику в beginner campaign раньше физической потребности.
