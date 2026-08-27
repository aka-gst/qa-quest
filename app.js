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
