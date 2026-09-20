export const FIRST_SHIFT_PAY = 1200;

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wrapAngle = (value) => {
  let v = value;
  while (v > Math.PI) v -= TAU;
  while (v < -Math.PI) v += TAU;
  return v;
};

export function createFirstShiftState(){
  return {
    phase:'briefing', delivered:0, carrying:null, bossBeat:0, chipVisible:false, complete:false,
    player:{x:0,z:6.2,yaw:0},
    crates:[
      {id:'a',x:-5.1,z:-2.9,delivered:false},
      {id:'b',x:-4.0,z:-3.5,delivered:false},
      {id:'c',x:-2.9,z:-2.8,delivered:false},
    ],
  };
}

export function stepFirstShift(state, action){
  const s={...state,player:{...state.player},crates:state.crates.map(c=>({...c}))};
  if(action==='briefing-done' && s.phase==='briefing'){s.phase='manual';return s;}
  if(action?.type==='pick' && s.phase==='manual' && !s.carrying){s.carrying=action.id;return s;}
  if(action==='drop' && s.phase==='manual' && s.carrying){
    const crate=s.crates.find(c=>c.id===s.carrying);if(crate)crate.delivered=true;
    s.carrying=null;s.delivered=s.crates.filter(c=>c.delivered).length;
    if(s.delivered>=3){s.phase='report';s.bossBeat=0;}
    return s;
  }
  if(action==='report-boss' && s.phase==='report'){s.phase='payday';return s;}
  if(action==='payday-done' && s.phase==='payday'){s.phase='choice';s.chipVisible=true;return s;}
  if(action==='chip' && s.phase==='choice' && s.chipVisible && !s.carrying){s.phase='done';s.complete=true;return s;}
  return s;
}

export function firstShiftBossLine(phase='briefing'){
  if(phase==='payday') return [
    'НАЧАЛЬНИК',
    'Три есть. Я на погрузку. К вечеру палета должна быть полной. Рука 07 опять мёртвая — разберись как-нибудь.',
    'ХОРОШО',
  ];
  return [
    'НАЧАЛЬНИК',
    'Вася не пришёл. Тебя сняли с твоего участка и кинули сюда. Три ящика со стеллажа — на палету у ворот. Потом подойди ко мне.',
    'ПОНЯЛ',
  ];
}

function project(player, object, width, height){
  const dx=object.x-player.x;const dz=object.z-player.z;
  const sin=Math.sin(player.yaw);const cos=Math.cos(player.yaw);
  const forward=dx*sin+dz*(-cos);const right=dx*cos+dz*sin;
  if(forward<=.15)return null;
  const fov=Math.PI*70/180;const focal=width/(2*Math.tan(fov/2));
  const x=width/2+(right/forward)*focal;
  const horizon=height*.43;
  const baseY=horizon+(1.42/forward)*focal*.74;
  return {x,baseY,forward,scale:clamp(focal/forward/360,.22,3.2),angle:Math.atan2(right,forward)};
}

function drawBox(ctx,p,red=false,label=''){
  const w=110*p.scale;const h=90*p.scale;const x=p.x-w/2;const y=p.baseY-h;
  ctx.fillStyle=red?'#9f2730':'#8b5c31';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=red?'#ff6a73':'#c89558';ctx.lineWidth=Math.max(2,4*p.scale);ctx.strokeRect(x,y,w,h);
  ctx.strokeStyle=red?'#6f171d':'#5f3a20';ctx.beginPath();ctx.moveTo(x+8*p.scale,y+8*p.scale);ctx.lineTo(x+w-8*p.scale,y+h-8*p.scale);ctx.moveTo(x+w-8*p.scale,y+8*p.scale);ctx.lineTo(x+8*p.scale,y+h-8*p.scale);ctx.stroke();
  if(label&&p.scale>.48){ctx.fillStyle='#f4e5c9';ctx.font=`800 ${Math.round(12*p.scale)}px ui-monospace,monospace`;ctx.textAlign='center';ctx.fillText(label,p.x,y+h*.56);}
}

function drawPallet(ctx,p){
  const w=170*p.scale;const h=35*p.scale;ctx.fillStyle='#6f5e48';ctx.strokeStyle='#b4a17e';ctx.lineWidth=Math.max(2,3*p.scale);ctx.fillRect(p.x-w/2,p.baseY-h,w,h);ctx.strokeRect(p.x-w/2,p.baseY-h,w,h);
  ctx.fillStyle='#d2b26c';for(let i=-2;i<=2;i++)ctx.fillRect(p.x+i*w*.18-5*p.scale,p.baseY-h,10*p.scale,h);
}

function drawBoss(ctx,p){
  const h=238*p.scale;const x=p.x;const y=p.baseY;const s=p.scale;
  ctx.save();
  // Work boots + trousers.
  ctx.fillStyle='#20262b';ctx.fillRect(x-34*s,y-58*s,26*s,58*s);ctx.fillRect(x+8*s,y-58*s,26*s,58*s);
  ctx.fillStyle='#0f1214';ctx.fillRect(x-39*s,y-9*s,34*s,10*s);ctx.fillRect(x+5*s,y-9*s,34*s,10*s);
  // Dark jacket and high-visibility vest: readable silhouette, not a grey mannequin.
  ctx.fillStyle='#1a2025';ctx.fillRect(x-54*s,y-174*s,108*s,122*s);
  ctx.fillStyle='#d6a33e';ctx.fillRect(x-54*s,y-168*s,24*s,92*s);ctx.fillRect(x+30*s,y-168*s,24*s,92*s);ctx.fillRect(x-30*s,y-127*s,60*s,18*s);
  ctx.fillStyle='#f2d05d';ctx.fillRect(x-52*s,y-113*s,104*s,7*s);
  // Arms: one points toward the crates, the other holds a clipboard.
  ctx.strokeStyle='#20262b';ctx.lineCap='round';ctx.lineWidth=Math.max(7,18*s);ctx.beginPath();ctx.moveTo(x-47*s,y-157*s);ctx.lineTo(x-82*s,y-112*s);ctx.lineTo(x-108*s,y-104*s);ctx.stroke();
  ctx.strokeStyle='#e1b996';ctx.lineWidth=Math.max(5,12*s);ctx.beginPath();ctx.moveTo(x-108*s,y-104*s);ctx.lineTo(x-126*s,y-104*s);ctx.stroke();
  ctx.fillStyle='#68492f';ctx.save();ctx.translate(x+57*s,y-145*s);ctx.rotate(-.16);ctx.fillRect(0,0,48*s,66*s);ctx.fillStyle='#ded0aa';ctx.fillRect(5*s,7*s,38*s,48*s);ctx.fillStyle='#49351f';ctx.fillRect(17*s,-4*s,14*s,9*s);ctx.restore();
  // Head, hard hat, features.
  ctx.fillStyle='#e4c2a3';ctx.beginPath();ctx.arc(x,y-207*s,35*s,0,TAU);ctx.fill();
  ctx.fillStyle='#d79d32';ctx.beginPath();ctx.ellipse(x,y-225*s,42*s,15*s,0,Math.PI,TAU);ctx.fill();ctx.fillRect(x-37*s,y-228*s,74*s,10*s);
  ctx.fillStyle='#20262b';ctx.fillRect(x-15*s,y-210*s,8*s,5*s);ctx.fillRect(x+8*s,y-210*s,8*s,5*s);
  ctx.strokeStyle='#4c2e22';ctx.lineWidth=Math.max(1.5,2.5*s);ctx.beginPath();ctx.moveTo(x-14*s,y-193*s);ctx.quadraticCurveTo(x,y-188*s,x+16*s,y-195*s);ctx.stroke();
  ctx.fillStyle='#f0cfab';ctx.font=`900 ${Math.max(8,11*s)}px ui-monospace,monospace`;ctx.textAlign='center';if(s>.55)ctx.fillText('НАЧ. СМЕНЫ',x,y-137*s);
  ctx.restore();
}

function drawArm(ctx,p,awake=false){
  const baseW=105*p.scale;const baseH=80*p.scale;const bx=p.x;const by=p.baseY;
  ctx.fillStyle='#222a31';ctx.strokeStyle=awake?'#64e9ff':'#6b747c';ctx.lineWidth=Math.max(2,4*p.scale);ctx.fillRect(bx-baseW/2,by-baseH,baseW,baseH);ctx.strokeRect(bx-baseW/2,by-baseH,baseW,baseH);
  ctx.save();ctx.translate(bx,by-baseH);ctx.lineCap='round';ctx.strokeStyle='#7b858d';ctx.lineWidth=Math.max(8,20*p.scale);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-34*p.scale,-74*p.scale);ctx.lineTo(28*p.scale,-126*p.scale);ctx.stroke();ctx.fillStyle=awake?'#64e9ff':'#963f46';for(const [x,y] of [[0,0],[-34*p.scale,-74*p.scale],[28*p.scale,-126*p.scale]]){ctx.beginPath();ctx.arc(x,y,11*p.scale,0,TAU);ctx.fill();}ctx.restore();
}

function drawChip(ctx,p){
  const w=66*p.scale;const h=42*p.scale;ctx.save();ctx.shadowColor='#64e9ff';ctx.shadowBlur=22*p.scale;ctx.fillStyle='#15343d';ctx.strokeStyle='#78f4ff';ctx.lineWidth=Math.max(2,3*p.scale);ctx.fillRect(p.x-w/2,p.baseY-h,w,h);ctx.strokeRect(p.x-w/2,p.baseY-h,w,h);ctx.shadowBlur=0;ctx.fillStyle='#dffcff';ctx.font=`900 ${Math.max(9,Math.round(16*p.scale))}px ui-monospace,monospace`;ctx.textAlign='center';ctx.fillText('PY',p.x,p.baseY-h*.35);ctx.restore();
}

export function createFirstShift(root,{onComplete=()=>{},onSound=()=>{}}={}){
  if(!root) return {open(){},close(){},state:()=>createFirstShiftState()};
  const canvas=root.querySelector('#firstShiftCanvas');const ctx=canvas?.getContext('2d');
  const dialogue=root.querySelector('#firstShiftDialogue');const bossNext=root.querySelector('#firstShiftBossNext');
  const status=root.querySelector('#firstShiftStatus');const wallet=root.querySelector('#firstShiftPay');const prompt=root.querySelector('#firstShiftPrompt');
  let state=createFirstShiftState();let active=false;let raf=0;let last=performance.now();const held=new Set();let target=null;
  const boss={x:0,z:1.8};const pallet={x:5.2,z:-4.3};const arm={x:2.4,z:-6.1};const chip={x:1.45,z:-5.3};

  function resize(){if(!canvas)return;const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);}
  function setDialogue(){
    const show=state.phase==='briefing'||state.phase==='payday';dialogue.hidden=!show;
    if(show){const [speaker,line,button]=firstShiftBossLine(state.phase);root.querySelector('#firstShiftSpeaker').textContent=speaker;root.querySelector('#firstShiftLine').textContent=line;bossNext.textContent=button;}
  }
  function chooseTarget(width,height){
    const candidates=[];
    if(state.phase==='manual'&&!state.carrying){for(const crate of state.crates.filter(c=>!c.delivered)){const p=project(state.player,crate,width,height);if(p)candidates.push({kind:'crate',id:crate.id,p,distance:p.forward});}}
    if(state.phase==='manual'&&state.carrying){const p=project(state.player,pallet,width,height);if(p)candidates.push({kind:'pallet',p,distance:p.forward});}
    if(state.phase==='report'){const p=project(state.player,boss,width,height);if(p)candidates.push({kind:'boss',p,distance:p.forward});}
    if(state.phase==='choice'&&state.chipVisible){const p=project(state.player,chip,width,height);if(p)candidates.push({kind:'chip',p,distance:p.forward});}
    return candidates.filter(x=>Math.abs(x.p.angle)<.23&&x.distance<2.2).sort((a,b)=>a.distance-b.distance)[0]??null;
  }
  function action(){
    if(state.phase==='briefing'||state.phase==='payday')return;
    if(!target){onSound('blocked');return;}
    if(target.kind==='crate'){state=stepFirstShift(state,{type:'pick',id:target.id});onSound('pickup');}
    else if(target.kind==='pallet'){state=stepFirstShift(state,'drop');onSound('drop');}
    else if(target.kind==='boss'){state=stepFirstShift(state,'report-boss');onSound('ui-click');document.exitPointerLock?.();}
    else if(target.kind==='chip'){state=stepFirstShift(state,'chip');onSound('pickup');active=false;root.hidden=true;document.exitPointerLock?.();onComplete({delivered:state.delivered,extra:0});}
    renderText();setDialogue();
  }
  function renderText(){
    wallet.textContent=`НАЧИСЛЕНО · ${(state.delivered * FIRST_SHIFT_PAY).toLocaleString('ru-RU')} ₽`;
    if(state.phase==='briefing')status.textContent='Начальник ждёт перед линией.';
    else if(state.phase==='manual')status.textContent=state.carrying?'Ящик в руках. Дойди до палеты у ворот и положи его.':`Осталось перенести: ${3-state.delivered}.`;
    else if(state.phase==='report')status.textContent='Три ящика на месте. Вернись к начальнику у линии.';
    else if(state.phase==='payday')status.textContent='Начальник уже собирается уходить на погрузку.';
    else if(state.phase==='choice')status.textContent='Шесть ящиков ещё ждут. Был бы программистом — поднял бы эту руку и уже не таскал их сам. Под корпусом что-то мигает.';
    if(prompt){prompt.textContent=target?`${target.kind==='crate'?'E / ПРОБЕЛ · ВЗЯТЬ ЯЩИК':target.kind==='pallet'?'E / ПРОБЕЛ · ПОЛОЖИТЬ НА ПАЛЕТУ':target.kind==='boss'?'E / ПРОБЕЛ · ПОГОВОРИТЬ':'E / ПРОБЕЛ · ПОДНЯТЬ ЧИП'}`:'WASD · ИДТИ   МЫШЬ · СМОТРЕТЬ';prompt.dataset.hot=String(Boolean(target));}
  }
  function draw(){
    if(!ctx||!canvas)return;const width=canvas.clientWidth;const height=canvas.clientHeight;ctx.clearRect(0,0,width,height);
    const horizon=height*.43;const ceiling=ctx.createLinearGradient(0,0,0,horizon);ceiling.addColorStop(0,'#050607');ceiling.addColorStop(1,'#171b1e');ctx.fillStyle=ceiling;ctx.fillRect(0,0,width,horizon);
    const floor=ctx.createLinearGradient(0,horizon,0,height);floor.addColorStop(0,'#202429');floor.addColorStop(1,'#090b0d');ctx.fillStyle=floor;ctx.fillRect(0,horizon,width,height-horizon);
    ctx.strokeStyle='#454b4f';ctx.globalAlpha=.34;for(let i=-7;i<=7;i++){const x=width/2+i*width*.09;ctx.beginPath();ctx.moveTo(width/2,horizon);ctx.lineTo(x,height);ctx.stroke();}for(let i=1;i<=10;i++){const t=i/10;const y=horizon+(height-horizon)*(t*t);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}ctx.globalAlpha=1;
    ctx.fillStyle='#111518';ctx.fillRect(0,horizon-42,width,42);ctx.fillStyle='#30363b';for(let i=0;i<10;i++)ctx.fillRect(i*width/9-6,horizon-42,12,42);
    // Loading-bay door gives the boss an actual exit and makes the post-briefing
    // slam legible without another explanatory panel.
    const doorW=Math.min(190,width*.15),doorH=Math.min(300,height*.38),doorX=width-doorW-70,doorY=horizon-doorH*.25;
    ctx.fillStyle=state.phase==='choice'?'#0b0d0f':'#10161b';ctx.strokeStyle='#59636a';ctx.lineWidth=5;ctx.fillRect(doorX,doorY,doorW,doorH);ctx.strokeRect(doorX,doorY,doorW,doorH);
    ctx.fillStyle='#d6a33e';ctx.font='900 12px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('ПОГРУЗКА',doorX+doorW/2,doorY+24);
    if(state.phase==='choice'){ctx.strokeStyle='#d6a33e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(doorX+18,doorY+46);ctx.lineTo(doorX+doorW-18,doorY+46);ctx.stroke();}
    const objects=[];
    const add=(kind,obj)=>{const p=project(state.player,obj,width,height);if(p&&p.x>-240&&p.x<width+240)objects.push({kind,obj,p});};
    for(const crate of state.crates.filter(c=>!c.delivered&&c.id!==state.carrying))add('crate',crate);add('pallet',pallet);add('arm',arm);
    if(state.phase==='briefing'||state.phase==='report'||state.phase==='payday')add('boss',boss);if(state.phase==='choice'&&state.chipVisible)add('chip',chip);
    objects.sort((a,b)=>b.p.forward-a.p.forward);for(const item of objects){if(item.kind==='crate')drawBox(ctx,item.p,false,`ЯЩИК ${item.obj.id.toUpperCase()}`);else if(item.kind==='pallet')drawPallet(ctx,item.p);else if(item.kind==='boss')drawBoss(ctx,item.p);else if(item.kind==='arm')drawArm(ctx,item.p,false);else drawChip(ctx,item.p);}
    if(state.carrying){ctx.save();ctx.globalAlpha=.97;const p={x:width/2,baseY:height+20,scale:1.3};drawBox(ctx,p,false,'');ctx.restore();}
  }
  function update(now){
    if(!active)return;const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!dialogue.hidden){held.clear();}
    const forward=(held.has('KeyW')?1:0)-(held.has('KeyS')?1:0);const strafe=(held.has('KeyD')?1:0)-(held.has('KeyA')?1:0);const turn=(held.has('ArrowRight')?1:0)-(held.has('ArrowLeft')?1:0);
    state.player.yaw=wrapAngle(state.player.yaw+turn*dt*1.8);
    if(dialogue.hidden){const speed=3.2;const sin=Math.sin(state.player.yaw);const cos=Math.cos(state.player.yaw);state.player.x+=((sin*forward)+(cos*strafe))*speed*dt;state.player.z+=((-cos*forward)+(sin*strafe))*speed*dt;state.player.x=clamp(state.player.x,-7.2,7.2);state.player.z=clamp(state.player.z,-7.1,7.1);}
    target=chooseTarget(canvas.clientWidth,canvas.clientHeight);renderText();draw();raf=requestAnimationFrame(update);
  }
  function keyDown(event){if(!active)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight'].includes(event.code)){held.add(event.code);event.preventDefault();}if((event.code==='Space'||event.code==='KeyE')&&!event.repeat){event.preventDefault();action();}}
  function keyUp(event){held.delete(event.code);}
  function mouseMove(event){if(!active||document.pointerLockElement!==canvas)return;state.player.yaw=wrapAngle(state.player.yaw+event.movementX*.0024);}
  canvas?.addEventListener('click',()=>{if(active&&dialogue.hidden)canvas.requestPointerLock?.();});
  window.addEventListener('keydown',keyDown,{passive:false});window.addEventListener('keyup',keyUp);window.addEventListener('mousemove',mouseMove);
  bossNext.addEventListener('click',()=>{if(state.phase==='briefing'){state=stepFirstShift(state,'briefing-done');onSound('ui-click');}else if(state.phase==='payday'){state=stepFirstShift(state,'payday-done');onSound('door');}setDialogue();renderText();canvas?.focus({preventScroll:true});if(dialogue.hidden)canvas?.requestPointerLock?.();});
  window.addEventListener('resize',resize);
  function open(){state=createFirstShiftState();active=true;root.hidden=false;resize();setDialogue();renderText();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(update);bossNext.focus({preventScroll:true});}
  function close(){active=false;root.hidden=true;cancelAnimationFrame(raf);held.clear();if(document.pointerLockElement===canvas)document.exitPointerLock?.();}
  return {open,close,state:()=>JSON.parse(JSON.stringify(state))};
}
