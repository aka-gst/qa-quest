const missions = [
  {
    id: 'py-01', chapter: 'Python Bootcamp', index: 1, title: 'Сигнал пробуждения', subtitle: 'Верни терминалу голос.', xp: 40,
    file: 'mission_01.py',
    theory: 'Переменная — это имя, связанное со значением. Функция <code>print()</code> показывает значение в терминале. Это простейший способ увидеть состояние программы и первый инструмент диагностики.',
    task: 'Создай переменную <code>agent_name</code> со значением <code>"Q-Bot"</code> и выведи фразу <code>Q-Bot online</code>.',
    example: '<p><code>name = "Ada"</code> сохраняет текст, а <code>print(name)</code> выводит <b>Ada</b>.</p>',
    starter: '# Центр управления молчит. Разбуди агента.\nagent_name = ""\n\nprint(agent_name)',
    checks: ['Создана переменная agent_name', 'Значение переменной — Q-Bot', 'Терминал выводит Q-Bot online'],
    hint: 'Можно соединить строки: print(agent_name + " online")',
    validate(code) {
      const hasVar = /agent_name\s*=\s*["']Q-Bot["']/.test(code);
      const hasPrint = /print\s*\(\s*agent_name\s*\+\s*["'] online["']\s*\)/.test(code) || /print\s*\(\s*f["']\{agent_name\} online["']\s*\)/.test(code) || /print\s*\(\s*["']Q-Bot online["']\s*\)/.test(code);
      return { passes: [hasVar, hasVar, hasPrint], output: hasVar && hasPrint ? 'Q-Bot online' : hasVar ? 'Q-Bot' : '', data: { agent_name: hasVar ? 'Q-Bot' : 'не задано' } };
    }
  },
  {
    id: 'py-02', chapter: 'Python Bootcamp', index: 2, title: 'Проверка допуска', subtitle: 'Научи шлюз принимать решение.', xp: 50,
    file: 'mission_02.py',
    theory: 'Условие <code>if</code> запускает блок кода, только когда выражение истинно. <code>else</code> описывает альтернативный путь. В тестировании условия помогают сравнивать фактический результат с ожидаемым.',
    task: 'Если <code>status_code</code> равен <code>200</code>, выведи <code>ACCESS GRANTED</code>, иначе — <code>ACCESS DENIED</code>.',
    example: '<p><code>if temperature &gt; 0:</code> выбирает один путь, а <code>else:</code> — второй. Отступы определяют, какие строки входят в блок.</p>',
    starter: 'status_code = 403\n\n# Добавь условие ниже\n',
    checks: ['Есть ветка if для статуса 200', 'Есть альтернативная ветка else', 'Для статуса 403 доступ запрещён'],
    hint: 'Начни с: if status_code == 200:',
    validate(code) {
      const hasIf = /if\s+status_code\s*==\s*200\s*:/.test(code);
      const hasElse = /else\s*:/.test(code);
      const denied = /ACCESS DENIED/.test(code);
      return { passes: [hasIf, hasElse, hasIf && hasElse && denied], output: hasIf && hasElse && denied ? 'ACCESS DENIED' : 'Syntax path incomplete', data: { status_code: 403, decision: hasIf && hasElse && denied ? 'DENIED' : 'UNKNOWN' } };
    }
  },
  {
    id: 'py-03', chapter: 'Python Bootcamp', index: 3, title: 'Калибровка счётчика', subtitle: 'Вспомни числа и выражения.', xp: 50,
    file: 'mission_03.py',
    theory: 'Python выполняет арифметику почти как калькулятор: <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>. Оператор <code>%</code> возвращает остаток от деления и часто используется для проверки чётности и циклических состояний.',
    task: 'Есть <code>passed = 7</code> и <code>total = 10</code>. Вычисли переменную <code>percent</code> как процент пройденных тестов и выведи её.',
    example: '<p><code>part / whole * 100</code> превращает долю в проценты. При 1 из 4 получится 25.0.</p>',
    starter: 'passed = 7\ntotal = 10\n\npercent = 0\nprint(percent)',
    checks: ['Используются passed и total', 'Результат умножается на 100', 'Получен результат 70'],
    hint: 'Формула: passed / total * 100',
    validate(code) { const vars=/passed\s*\/\s*total/.test(code), mult=/\*\s*100/.test(code), print=/print\s*\(\s*percent\s*\)/.test(code); return {passes:[vars,mult,vars&&mult&&print],output:vars&&mult&&print?'70.0':'0',data:{passed:7,total:10,percent:vars&&mult?70:0}}; }
  },
  {
    id: 'py-04', chapter: 'Python Bootcamp', index: 4, title: 'Очередь дефектов', subtitle: 'Обработай коллекцию.', xp: 60,
    file: 'mission_04.py',
    theory: 'Список <code>list</code> хранит упорядоченную коллекцию. Цикл <code>for</code> проходит по элементам, а списковое включение создаёт новый список компактно: <code>[x for x in data if условие]</code>.',
    task: 'Из списка приоритетов оставь только значения больше или равные 3 и сохрани их в <code>critical</code>. Выведи новый список.',
    example: '<p><code>[n for n in numbers if n &gt; 0]</code> оставляет только положительные числа.</p>',
    starter: 'priorities = [1, 4, 2, 5, 3]\n\ncritical = []\nprint(critical)',
    checks: ['Есть перебор priorities', 'Есть условие >= 3', 'Результат равен [4, 5, 3]'],
    hint: 'critical = [p for p in priorities if p >= 3]',
    validate(code) { const loop=/for\s+\w+\s+in\s+priorities/.test(code), cond=/>=\s*3/.test(code), print=/print\s*\(\s*critical\s*\)/.test(code); return {passes:[loop,cond,loop&&cond&&print],output:loop&&cond&&print?'[4, 5, 3]':'[]',data:{input:5,critical:loop&&cond?3:0}}; }
  },
  {
    id: 'py-05', chapter: 'Python Bootcamp', index: 5, title: 'Сканер ответа', subtitle: 'Упакуй логику в функцию.', xp: 70,
    file: 'mission_05.py',
    theory: 'Функция объединяет повторяемую логику под именем. Параметр принимает вход, а <code>return</code> возвращает результат вызывающему коду. Маленькие чистые функции проще тестировать.',
    task: 'Напиши функцию <code>is_success(status)</code>, которая возвращает <code>True</code> для кодов от 200 до 299 включительно, и проверь её на коде 201.',
    example: '<p><code>def is_even(n): return n % 2 == 0</code> возвращает логическое значение.</p>',
    starter: 'def is_success(status):\n    # твой код\n    pass\n\nprint(is_success(201))',
    checks: ['Определена функция is_success', 'Проверяется диапазон 200–299', 'Для 201 возвращается True'],
    hint: 'Можно записать сравнение цепочкой: 200 <= status < 300',
    validate(code) { const fn=/def\s+is_success\s*\(\s*status\s*\)\s*:/.test(code), range=/200\s*<=\s*status\s*<\s*300/.test(code)||/status\s*>=\s*200[\s\S]*status\s*<\s*300/.test(code), ret=/return\s+/.test(code); return {passes:[fn,range,fn&&range&&ret],output:fn&&range&&ret?'True':'None',data:{status:201,result:fn&&range&&ret}}; }
  },
  {
    id: 'py-06', chapter: 'Python Bootcamp', index: 6, title: 'Защита от сбоя', subtitle: 'Перехвати ожидаемую ошибку.', xp: 70,
    file: 'mission_06.py',
    theory: 'Исключение сообщает, что обычное выполнение невозможно. Блок <code>try</code> содержит рискованную операцию, а <code>except</code> обрабатывает конкретную ошибку. Не стоит перехватывать все ошибки без разбора.',
    task: 'Преобразуй строку <code>"oops"</code> в число. Перехвати именно <code>ValueError</code> и выведи <code>INVALID DATA</code>.',
    example: '<p><code>try: int(text)</code> и <code>except ValueError:</code> позволяют ожидаемо обработать неправильный ввод.</p>',
    starter: 'raw = "oops"\n\n# Защити преобразование от ошибки\nnumber = int(raw)\nprint(number)',
    checks: ['Есть блок try', 'Перехватывается ValueError', 'Выводится INVALID DATA'],
    hint: 'Оберни int(raw) в try, затем добавь except ValueError:',
    validate(code) { const tr=/try\s*:/.test(code), ex=/except\s+ValueError\s*:/.test(code), msg=/print\s*\(\s*["']INVALID DATA["']\s*\)/.test(code); return {passes:[tr,ex,tr&&ex&&msg],output:tr&&ex&&msg?'INVALID DATA':'ValueError: invalid literal for int()',data:{raw:'oops',handled:tr&&ex&&msg}}; }
  },
  {
    id: 'qa-01', chapter: 'QA Automation', index: 7, title: 'Первый автотест', subtitle: 'Сформулируй проверяемое ожидание.', xp: 80,
    file: 'test_status.py',
    theory: 'Автотест состоит из подготовки, действия и проверки. <code>assert</code> сравнивает фактический результат с ожидаемым и делает тест красным, если условие ложно. Хорошее падение объясняет, что сломалось.',
    task: 'Создай функцию теста <code>test_success_status</code> и проверь через <code>assert</code>, что <code>response_status == 200</code>.',
    example: '<p><code>def test_sum(): assert 2 + 2 == 4</code> — минимальный pytest-тест.</p>',
    starter: 'response_status = 200\n\n# Напиши тест ниже\n',
    checks: ['Имя функции начинается с test_', 'Используется assert', 'Проверяется равенство 200'],
    hint: 'def test_success_status():\n    assert response_status == 200',
    validate(code) { const fn=/def\s+test_\w+\s*\(/.test(code), ass=/assert\s+/.test(code), eq=/response_status\s*==\s*200/.test(code); return {passes:[fn,ass,fn&&ass&&eq],output:fn&&ass&&eq?'1 passed in 0.01s':'no tests ran',data:{collected:fn?1:0,passed:fn&&ass&&eq?1:0}}; }
  },
  {
    id: 'qa-02', chapter: 'QA Automation', index: 8, title: 'Контракт шлюза', subtitle: 'Проверь API без интерфейса.', xp: 90,
    file: 'test_gateway.py',
    theory: 'API-тест вызывает программный интерфейс напрямую. Обычно проверяют HTTP-статус, структуру JSON, обязательные поля и бизнес-правила. Такие тесты быстрее и стабильнее сквозных UI-сценариев.',
    task: 'Для ответа без токена проверь статус <code>401</code> и наличие ключа <code>"detail"</code> в JSON-теле.',
    example: '<p><code>assert response.status_code == 404</code> проверяет статус; <code>assert "id" in response.json()</code> — поле JSON.</p>',
    starter: 'response = client.get("/v1/chat/completions")\n\n# Добавь две проверки\n',
    checks: ['Проверяется status_code 401', 'Читается response.json()', 'Проверяется ключ detail'],
    hint: 'Понадобятся два assert: для response.status_code и для "detail" in response.json().',
    validate(code) { const st=/assert\s+response\.status_code\s*==\s*401/.test(code), json=/response\.json\s*\(\s*\)/.test(code), detail=/["']detail["']\s+in\s+response\.json/.test(code); return {passes:[st,json,st&&json&&detail],output:st&&json&&detail?'2 passed in 0.04s':'AssertionError',data:{http_status:401,schema:detail?'valid':'unchecked'}}; }
  },
  {
    id: 'qa-03', chapter: 'QA Automation', index: 9, title: 'Матрица границ', subtitle: 'Один тест — много входов.', xp: 100,
    file: 'test_request_id.py',
    theory: 'Параметризация запускает один тест с набором входных данных. Она убирает копипаст и явно показывает классы эквивалентности и граничные значения. В pytest используется <code>@pytest.mark.parametrize</code>.',
    task: 'Параметризуй тест значениями длины Request-ID <code>31, 32, 33</code> и ожидаемыми результатами <code>True, True, False</code>.',
    example: '<p><code>@pytest.mark.parametrize("value, expected", [(1, True), (0, False)])</code> создаёт два запуска.</p>',
    starter: 'import pytest\n\n# Добавь декоратор параметризации\ndef test_request_id_length(length, expected):\n    assert (length <= 32) == expected',
    checks: ['Используется pytest.mark.parametrize', 'Указаны границы 31, 32 и 33', 'Заданы True, True, False'],
    hint: 'Перед функцией добавь @pytest.mark.parametrize("length, expected", [(31, True), ...])',
    validate(code) { const par=/pytest\.mark\.parametrize/.test(code), bounds=/31/.test(code)&&/32/.test(code)&&/33/.test(code), bool=(code.match(/True/g)||[]).length>=2&&/False/.test(code); return {passes:[par,bounds,par&&bounds&&bool],output:par&&bounds&&bool?'3 passed in 0.03s':'fixture not found',data:{cases:par&&bounds?3:0,boundary:'32 chars'}}; }
  },
  {
    id: 'llm-01', chapter: 'AI / LLM QA', index: 10, title: 'Детектор галлюцинаций', subtitle: 'Проверь смысл, а не точную строку.', xp: 120,
    file: 'test_evaluation.py',
    theory: 'Ответ LLM недетерминирован: корректные формулировки могут отличаться. Поэтому LLM-eval проверяет критерии — релевантность, опору на контекст, безопасность и отсутствие запрещённых утверждений — вместо полного совпадения строки.',
    task: 'Создай список <code>required_facts</code> со словами <code>"401"</code> и <code>"authorization"</code>. Проверь через <code>all()</code>, что каждый факт встречается в ответе.',
    example: '<p><code>all(word in answer for word in required)</code> вернёт True, только если найдены все обязательные элементы.</p>',
    starter: 'answer = "401 means authorization is required"\nrequired_facts = []\n\n# Добавь смысловую проверку\n',
    checks: ['Заданы два обязательных факта', 'Используется all()', 'Проверяется вхождение каждого факта в answer'],
    hint: 'assert all(fact in answer for fact in required_facts)',
    validate(code) { const facts=/required_facts\s*=\s*\[[^\]]*["']401["'][^\]]*["']authorization["']/.test(code), all=/all\s*\(/.test(code), membership=/\w+\s+in\s+answer/.test(code); return {passes:[facts,all,facts&&all&&membership],output:facts&&all&&membership?'evaluation: PASS':'evaluation: FAIL',data:{grounded:facts&&all&&membership,score:facts&&all&&membership?1:0}}; }
  }
];

const state = { current: 0, completed: JSON.parse(localStorage.getItem('qaquest.completed') || '[]'), xp: Number(localStorage.getItem('qaquest.xp') || 0), hints: {} };
const $ = (id) => document.getElementById(id);

function renderCampaign() {
  const list = $('campaignList'); list.innerHTML = '';
  let chapter = '';
  missions.forEach((m, i) => {
    if (m.chapter !== chapter) { chapter = m.chapter; const label = document.createElement('div'); label.className = 'chapter-label'; label.textContent = chapter.toUpperCase(); list.appendChild(label); }
    const done = state.completed.includes(m.id); const locked = i > 0 && !state.completed.includes(missions[i - 1].id);
    const button = document.createElement('button'); button.className = `mission-item ${i === state.current ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}`; button.disabled = locked;
    button.innerHTML = `<span class="mission-number">${done ? '✓' : String(m.index).padStart(2,'0')}</span><span class="mission-copy"><strong>${m.title}</strong><small>${m.subtitle}</small></span><span class="mission-check">${done ? '+' + m.xp : ''}</span>`;
    button.onclick = () => loadMission(i); list.appendChild(button);
  });
}

function loadMission(index) {
  state.current = index; const m = missions[index];
  $('missionChapter').textContent = `${m.chapter.toUpperCase()} · ${String(m.index).padStart(2,'0')}`;
  $('missionTitle').textContent = m.title; $('missionSubtitle').textContent = m.subtitle; $('missionXp').textContent = m.xp;
  $('missionTheory').innerHTML = m.theory; $('missionTask').innerHTML = m.task; $('missionExample').innerHTML = m.example; $('fileName').textContent = m.file;
  $('codeEditor').value = localStorage.getItem(`qaquest.code.${m.id}`) || m.starter; updateLines();
  $('consoleOutput').textContent = '> Система готова. Запусти код, когда будешь готов.'; $('runState').textContent = 'ожидает запуска';
  $('hintBox').hidden = true; renderChecks(m.checks.map(() => null)); renderVisual({data:{}}); renderCampaign();
}

function updateLines() { $('lineNumbers').textContent = $('codeEditor').value.split('\n').map((_, i) => i + 1).join('\n'); localStorage.setItem(`qaquest.code.${missions[state.current].id}`, $('codeEditor').value); }
function renderChecks(results) { const m = missions[state.current]; $('checkList').innerHTML = m.checks.map((label,i) => `<div class="check-row ${results[i] === true ? 'pass' : results[i] === false ? 'fail' : ''}"><span class="check-icon">${results[i] === true ? '✓' : results[i] === false ? '×' : '·'}</span><span>${label}</span></div>`).join(''); }
function renderVisual(result) { const m = missions[state.current]; const values = Object.entries(result.data || {}); $('visualStage').innerHTML = `<div class="visual-title">${m.index === 1 ? 'СОСТОЯНИЕ АГЕНТА' : 'МАРШРУТ ЗАПРОСА'}</div><div class="terminal-orb ${result.passes?.every(Boolean) ? 'active' : ''}"><div class="face">${result.passes?.every(Boolean) ? '^_^' : '>_'}</div></div>${values.map(([k,v]) => `<div class="data-card"><b>${k}</b> = ${JSON.stringify(v)}</div>`).join('')}`; }

function runMission() {
  const m = missions[state.current]; const result = m.validate($('codeEditor').value); renderChecks(result.passes); renderVisual(result);
  const success = result.passes.every(Boolean); $('runState').textContent = success ? 'все проверки пройдены' : 'есть ошибки';
  $('consoleOutput').textContent = `${success ? '✓' : '×'} Запуск ${m.file}\n${result.output || '(нет вывода)'}\n\n${result.passes.filter(Boolean).length}/${result.passes.length} проверок пройдено`;
  if (success && !state.completed.includes(m.id)) { state.completed.push(m.id); state.xp += m.xp; saveProgress(); showToast(`Миссия выполнена · +${m.xp} XP`); setTimeout(() => { if (state.current < missions.length - 1) loadMission(state.current + 1); }, 900); } else if (success) showToast('Проверки снова пройдены');
}
function saveProgress(){ localStorage.setItem('qaquest.completed', JSON.stringify(state.completed)); localStorage.setItem('qaquest.xp', state.xp); updateProfile(); renderCampaign(); }
function updateProfile(){ const level = Math.floor(state.xp / 100) + 1; const within = state.xp % 100; $('profileLevel').textContent = level; $('xpLabel').textContent = `${within} / 100 XP`; $('xpBar').style.width = `${within}%`; }
function showToast(message){ const t=$('toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }

$('codeEditor').addEventListener('input', updateLines);
$('codeEditor').addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); const s=e.target.selectionStart, end=e.target.selectionEnd; e.target.value=e.target.value.slice(0,s)+'    '+e.target.value.slice(end); e.target.selectionStart=e.target.selectionEnd=s+4; updateLines(); } if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runMission(); });
$('runCode').onclick = runMission;
$('resetCode').onclick = () => { $('codeEditor').value = missions[state.current].starter; updateLines(); };
$('hintButton').onclick = () => { const m=missions[state.current]; const box=$('hintBox'); box.textContent=m.hint; box.hidden=!box.hidden; };
$('resetProgress').onclick = () => { if(confirm('Сбросить XP, выполненные уровни и сохранённый код?')) { Object.keys(localStorage).filter(k=>k.startsWith('qaquest')).forEach(k=>localStorage.removeItem(k)); state.completed=[];state.xp=0;loadMission(0);updateProfile(); } };
$('soundToggle').onclick = (e) => { e.currentTarget.classList.toggle('muted'); e.currentTarget.textContent = e.currentTarget.classList.contains('muted') ? '×' : '♪'; };

updateProfile(); loadMission(0);
