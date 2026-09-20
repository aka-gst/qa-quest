const freeze=v=>Object.freeze(v);
export const CAREER_REALMS=freeze([
 freeze({id:'automation',glyph:'⟲',title:'ЛИНИЯ 03',subtitle:'AUTO · ПРОИЗВОДСТВЕННАЯ ИГРА',mechanic:'PIPELINE',run:'▶ ЗАПУСТИТЬ ЛИНИЮ',gate:['print','if','for'],prompt:'Пятничный поток вырос вдвое. Собери линию, которая не выбрасывает работу.',controls:[['buffer','Поставить буфер','QUEUE'],['worker','Добавить worker','CONCURRENCY'],['drop','Сбрасывать лишнее','DROP']],wins:[['buffer','worker'],['buffer']],skill:'automation',art:'robot'}),
 freeze({id:'vehicle',glyph:'▰',title:'ГАРАЖ · СИНЯЯ МАШИНА',subtitle:'VEH · DETECTIVE GARAGE',mechanic:'INVESTIGATE',run:'СОБРАТЬ ДИАГНОЗ →',gate:['print','if'],prompt:'Своя машина принимает сервисную команду даже без владельца. Осмотри точки доверия и найди, где команда получила лишнее право.',controls:[['owner','Осмотреть ключ владельца','OWNER'],['gateway','Проверить шлюз команд','GATEWAY'],['radio','Проверить магнитолу','INFOTAINMENT']],wins:[['owner','gateway']],skill:'vehicle',art:'car'}),
 freeze({id:'security',glyph:'⬡',title:'СВОЙ СЕРВЕР · НОЧНОЙ ШТУРМ',subtitle:'SEC · BUILD / DEFEND / RED-TEAM',mechanic:'FORTIFY',run:'▶ ЗАПУСТИТЬ СВОЙ RED-TEAM',gate:['print','if','for'],prompt:'Синтетическая красная команда идёт на твой сервер. Построй защиту и проверь её, не закрыв дверь нормальным игрокам.',controls:[['roles','Поставить явные роли','AUTH'],['negative','Добавить негативные тесты','TESTS'],['shutdown','Выключить сервер','OFFLINE']],wins:[['roles','negative']],skill:'security',art:'shield'}),
 freeze({id:'web',glyph:'▦',title:'МИКРО-СЕРВИС · ДЕНЬ ПРОДАЖ',subtitle:'WEB · MINI TYCOON',mechanic:'TYCOON',run:'▶ ОТКРЫТЬ ДЕНЬ',gate:['print','if','for'],prompt:'У тебя только 2 жетона бюджета. Пользователи пришли быстрее, чем ожидалось: вложись перед открытием и проживи день.',controls:[['cache','Кэш чтения · 1 CR','CACHE'],['queue','Очередь заказов · 1 CR','QUEUE'],['banner','Анимация баннера · 1 CR','COSMETIC']],wins:[['cache','queue']],skill:'web',art:'web'}),
 freeze({id:'ai',glyph:'◇',title:'Q-BOT · ТРЕНИРОВОЧНАЯ КОМНАТА',subtitle:'AI · COMPANION TRAINING',mechanic:'TRAIN',run:'▶ ДАТЬ НЕИЗВЕСТНЫЙ СЛУЧАЙ',gate:['print','if','for','func'],prompt:'Q-Bot уверен в двух похожих случаях и хочет обобщить правило. Измени его опыт, а потом дай неизвестный пример.',controls:[['examples','Дать контрпример','DATA'],['abstain','Научить говорить «не знаю»','ABSTAIN'],['authority','Дать больше прав','AUTHORITY']],wins:[['examples','abstain']],skill:'ai',art:'ai'}),
 freeze({id:'systems',glyph:'⌬',title:'ГОРОДСКАЯ СХЕМА · КАСКАД',subtitle:'SYS · INCIDENT GRAPH',mechanic:'GRAPH',run:'▶ ПРОВЕРИТЬ КАСКАД',gate:['print','if','for','while'],prompt:'Один общий узел дрожит, а пять сервисов уже краснеют. Меняй связи, а не отдельные симптомы.',controls:[['isolate','Изолировать зависимость','BULKHEAD'],['fallback','Добавить запасной путь','FALLBACK'],['retry','Все пусть повторяют быстрее','RETRY STORM']],wins:[['isolate','fallback'],['isolate']],skill:'systems',art:'grid'}),
 freeze({id:'lowlevel',glyph:'01',title:'НЕИЗВЕСТНАЯ МАШИНА',subtitle:'LOW · SIGNAL / STATE PUZZLE',mechanic:'BITS',run:'ПРОВЕРИТЬ СИГНАЛ →',gate:['print','if','for','func'],prompt:'На панели четыре бита. Дверь ждёт состояние 0011. Никаких названий регистров — сначала просто пойми машину.',controls:[['bit0','Переключить младший бит','BIT 0'],['bit1','Переключить второй бит','BIT 1'],['reset','Сбросить состояние','RESET']],wins:[['bit0','bit1']],skill:'lowlevel',art:'low'}),
]);

export function foundationStatus(learning={},realm){
 const keys={print:'printUnlocked',if:'ifUnlocked',for:'forUnlocked',while:'whileUnlocked',func:'funcUnlocked'};
 const missing=(realm.gate??[]).filter(k=>!learning[keys[k]]);
 return {ok:missing.length===0,missing};
}

export function createCareerSession(realmId){
 return {realmId,selected:[],events:[],budget:2,bits:[0,0,0,0],confidence:92,turns:0};
}

export function stepCareerSession(session,action){
 const s={...session,selected:[...(session.selected??[])],events:[...(session.events??[])],bits:[...(session.bits??[0,0,0,0])]};
 const realm=CAREER_REALMS.find(r=>r.id===session.realmId); if(!realm)return s;
 if(realm.id==='lowlevel'){
   if(action==='reset'){s.bits=[0,0,0,0];s.selected=[];s.events.push('Состояние очищено.');return s;}
   if(action==='bit0'){s.bits[3]=s.bits[3]?0:1;}
   if(action==='bit1'){s.bits[2]=s.bits[2]?0:1;}
   s.selected=['bit0','bit1'].filter((_,i)=>s.bits[i?2:3]);
   s.events.push(`Панель: ${s.bits.join('')}`); return s;
 }
 if(realm.id==='web'){
   if(s.selected.includes(action)){s.selected=s.selected.filter(x=>x!==action);s.budget=Math.min(2,s.budget+1);return s;}
   if(s.budget<=0){s.events.push('Бюджет кончился. Сними одно вложение.');return s;}
   s.selected.push(action);s.budget-=1;s.events.push(`Вложение: ${action}. Осталось ${s.budget} CR.`);return s;
 }
 if(realm.id==='ai'){
   if(!s.selected.includes(action))s.selected=[...s.selected,action].slice(-2);
   if(action==='examples')s.confidence=Math.max(55,s.confidence-18);
   if(action==='abstain')s.confidence=Math.max(45,s.confidence-12);
   if(action==='authority')s.confidence=Math.min(99,s.confidence+6);
   s.events.push(action==='authority'?'Права выросли. Знаний больше не стало.':'Опыт Q-Bot изменился.'); return s;
 }
 if(s.selected.includes(action))s.selected=s.selected.filter(x=>x!==action);else s.selected=[...s.selected,action].slice(-2);
 const lines={vehicle:{owner:'Ключ владельца валиден.',gateway:'Шлюз принимает сервисную команду без проверки владельца.',radio:'Музыка работает. Причина не здесь.'},security:{roles:'Появилась граница ролей.',negative:'Добавлены проверки запретного поведения.',shutdown:'Сервис выключен вместе с угрозой и нормальными игроками.'},automation:{buffer:'Поток получил место ждать.',worker:'Появился второй исполнитель.',drop:'Лишняя работа исчезает — вместе с заказами.'},systems:{isolate:'Общий узел перестал тянуть весь граф.',fallback:'Критичный поток получил запасной путь.',retry:'Повторы умножили давление на больной узел.'}};
 s.events.push(lines[realm.id]?.[action]??`Выбрано: ${action}`);return s;
}

export function evaluateCareerRealm(realmId,selected=[],session=null){
 const realm=CAREER_REALMS.find(r=>r.id===realmId); if(!realm)return {ok:false,reason:'unknown-realm'};
 const set=[...new Set(session?.selected??selected)];
 if(realmId==='lowlevel' && session?.bits){const ok=session.bits.join('')==='0011';return {ok,score:ok?100:20,skill:realm.skill,tech:ok?['BIT 0','BIT 1']:[]};}
 const forbidden=['drop','shutdown','banner','authority','retry'];
 const win=realm.wins.some(combo=>combo.every(x=>set.includes(x)) && !forbidden.some(x=>set.includes(x)));
 return {ok:win,score:win?Math.max(55,100-(set.length-realm.wins[0].length)*8):25,skill:realm.skill,tech:realm.controls.filter(c=>set.includes(c[0])).map(c=>c[2])};
}

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function visualHtml(realm){
 return {automation:'<div class="cw-belt"><i></i><i></i><i></i><i></i></div><b class="cw-caption">INPUT → ? → OUTPUT</b>',vehicle:'<div class="cw-car"><img src="assets/kenney16/garage/car_blue_3.png" alt="Синяя учебная машина"><button type="button" data-hotspot="owner">OWNER</button><button type="button" data-hotspot="gateway">GATEWAY</button><span data-hotspot-label>Щёлкни по точкам машины</span></div>',security:'<div class="cw-fort"><i>CLIENT</i><b>GATE</b><em>SERVER</em></div><div class="cw-raid-pips" aria-label="Синтетические импульсы"><i></i><i></i><i></i><i></i><i></i><i></i></div>',web:'<div class="cw-traffic"><i></i><i></i><i></i><b>USERS → SERVICE → CR</b><strong data-web-budget>БЮДЖЕТ 2 CR</strong></div>',ai:'<div class="cw-qbot"><img src="assets/kenney16/robot/robot_yellowBody.png" alt="Q-Bot"><b data-ai-state>Я УВЕРЕН НА 92%</b></div>',systems:'<div class="cw-graph"><i></i><i></i><b></b><i></i><i></i></div><strong class="cw-caption" data-graph-state>5 сервисов зависят от одного узла</strong>',lowlevel:'<div class="cw-bits"><b>0</b><b>0</b><b>0</b><b>0</b></div><strong class="cw-caption">TARGET 0011</strong>'}[realm.id];
}

export function createCareerWorlds(root,{getProfile=()=>({}),getLearning=()=>({}),onProfile=()=>{},onSound=()=>{},onClose=()=>{}}={}){
 if(!root)return{open(){},close(){}};
 let active=null, session=null;
 const grid=root.querySelector('#careerRealmGrid'), stage=root.querySelector('#careerStage');
 function wins(){return new Set(getProfile().labs?.guild?.realmWins??[]);}
 function renderGrid(){
  grid.innerHTML='';const done=wins(),learning=getLearning();
  for(const realm of CAREER_REALMS){const gate=foundationStatus(learning,realm),b=document.createElement('button');b.type='button';b.dataset.realm=realm.id;b.dataset.locked=String(!gate.ok);b.innerHTML=`<b>${realm.glyph}</b><span><small>${esc(realm.subtitle)}</small><strong>${esc(realm.title)}</strong><em>${done.has(realm.id)?'✓ ПРОЙДЕНО':gate.ok?'ВОЙТИ':'ВИДНО · ПОКА ЗАКРЫТО'}</em><i>${gate.ok?'':`Нужно открыть: ${gate.missing.join(' · ')}`}</i></span>`;b.addEventListener('click',()=>{if(!gate.ok){onSound('blocked');return;}openRealm(realm.id);});grid.append(b);}
 }
 function renderVisual(){
  if(!active||!session)return;
  const v=root.querySelector('#careerVisual');v.dataset.mechanic=active.mechanic;
  if(active.id==='lowlevel')v.querySelectorAll('.cw-bits b').forEach((b,i)=>{b.textContent=String(session.bits[i]);b.dataset.on=String(Boolean(session.bits[i]));});
  if(active.id==='web'){const b=v.querySelector('[data-web-budget]');if(b)b.textContent=`БЮДЖЕТ ${session.budget} CR`;}
  if(active.id==='ai'){const b=v.querySelector('[data-ai-state]');if(b)b.textContent=session.selected.includes('abstain')?`НЕИЗВЕСТНОЕ → «НЕ ЗНАЮ» · ${session.confidence}%`:`Я УВЕРЕН НА ${session.confidence}%`;}
  if(active.id==='vehicle'){for(const h of v.querySelectorAll('[data-hotspot]'))h.dataset.found=String(session.selected.includes(h.dataset.hotspot));const l=v.querySelector('[data-hotspot-label]');if(l)l.textContent=session.events.at(-1)??'Осмотри OWNER и GATEWAY';}
  if(active.id==='systems'){const l=v.querySelector('[data-graph-state]');if(l)l.textContent=session.selected.includes('isolate')?'Каскад ограничен одним сектором':session.selected.includes('retry')?'Давление растёт на всех ветках':'5 сервисов зависят от одного узла';}
  if(active.id==='security'){v.dataset.built=session.selected.join('-');}
  if(active.id==='automation'){v.dataset.modules=session.selected.join('-');}
 }
 function renderControls(){for(const b of root.querySelectorAll('[data-career-control]'))b.dataset.on=String(session?.selected.includes(b.dataset.careerControl));renderVisual();}
 function act(id){if(!active||!session)return;session=stepCareerSession(session,id);renderControls();const out=root.querySelector('#careerResult');out.textContent=session.events.at(-1)??'Мир изменился.';out.dataset.ok='false';onSound('ui-click');}
 function openRealm(id){
  active=CAREER_REALMS.find(r=>r.id===id);session=createCareerSession(active.id);stage.hidden=false;root.querySelector('#careerRealmList').hidden=true;root.dataset.realm=active.id;root.dataset.mechanic=active.mechanic;root.querySelector('#careerRealmTitle').textContent=active.title;root.querySelector('#careerRealmSubtitle').textContent=`${active.subtitle} · ${active.mechanic}`;root.querySelector('#careerRealmPrompt').textContent=active.prompt;root.querySelector('#careerVisual').innerHTML=visualHtml(active);const controls=root.querySelector('#careerControls');controls.innerHTML='';
  for(const [id,human,tech] of active.controls){const b=document.createElement('button');b.type='button';b.dataset.careerControl=id;b.innerHTML=`<strong>${esc(human)}</strong><small>${esc(tech)}</small>`;b.addEventListener('click',()=>act(id));controls.append(b);}
  if(active.id==='vehicle')root.querySelectorAll('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.hotspot)));
  root.querySelector('#careerRun').textContent=active.run;root.querySelector('#careerResult').textContent=active.id==='web'?'Выбери максимум два вложения: бюджет настоящий.':active.id==='vehicle'?'Сначала осмотри машину. Не угадывай fix по названию.':'Сделай действие — визуальный мир ответит.';renderControls();
 }
 root.querySelector('#careerRun').addEventListener('click',()=>{if(!active||!session)return;session={...session,turns:session.turns+1};const result=evaluateCareerRealm(active.id,session.selected,session),out=root.querySelector('#careerResult');const successCopy={automation:'✓ Ни один заказ не исчез. Линия выдержала поток.',vehicle:'✓ Причина доказана двумя точками: команда должна пройти границу владельца до gateway.',security:'✓ Свой red-team не прошёл, а нормальный игрок остался внутри.',web:'✓ День прожит: пользователи дождались, заказы не потерялись, CR пришли.',ai:'✓ На новом случае Q-Bot умеет сомневаться вместо уверенной выдумки.',systems:'✓ Отказ остался локальным вместо городского каскада.',lowlevel:'✓ Машина увидела 0011 и открыла дверь.'};out.textContent=result.ok?`${successCopy[active.id]} ${result.tech.length?`Потом это назовут: ${result.tech.join(' + ')}.`:''}`:'Мир показал контрпример. Поменяй систему и повтори — прогресс не отнимается.';out.dataset.ok=String(result.ok);root.querySelector('#careerVisual').dataset.result=result.ok?'pass':'counterexample';onSound(result.ok?'reward':'blocked');if(result.ok)onProfile({type:'guild-realm',id:active.id,score:result.score,skill:result.skill,skillGain:2,xp:170});});
 root.querySelector('#careerBack').addEventListener('click',()=>{stage.hidden=true;root.querySelector('#careerRealmList').hidden=false;active=null;session=null;renderGrid();});
 root.querySelector('#careerClose').addEventListener('click',()=>{root.hidden=true;onClose();});
 return {open(){root.hidden=false;stage.hidden=true;root.querySelector('#careerRealmList').hidden=false;renderGrid();root.querySelector('[data-realm]')?.focus({preventScroll:true});},close(){root.hidden=true;},refresh:renderGrid};
}
