import { createInput } from './input.js';
import { createAudioBus } from './audio.js';
import { prepareMachinePython, runAutomation, runWake } from './machine.js';
import {
  createFakeGateway,
  createMachineListeningEvent,
  createOtherMindRuntime,
} from './other-mind.js';
import {
  applyGameAction,
  createCheckpointState,
  createGameState,
  getNearbyAction,
  stepGame,
} from './model.js';
import { renderGame } from './render.js';
import { loadCheckpoint, resetCheckpoint, saveCheckpoint } from './save.js';
import { createTelemetry } from './telemetry.js';

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const game = document.querySelector('#game');
const hud = {
  chapter: document.querySelector('#chapterText'),
  mission: document.querySelector('#missionText'),
  message: document.querySelector('#gameMessage'),
  progress: document.querySelector('#missionProgress'),
  system: document.querySelector('#systemState'),
  sector: document.querySelector('#sectorState'),
  targets: document.querySelector('#targetState'),
  action: document.querySelector('#actionButton'),
  machine: document.querySelector('#machinePanel'),
  ending: document.querySelector('#endingPanel'),
  code: document.querySelector('#codeInput'),
  run: document.querySelector('#runCode'),
  feedback: document.querySelector('#codeFeedback'),
  machineTitle: document.querySelector('#machineTitle'),
  machineBrief: document.querySelector('#machineBrief'),
  otherMind: document.querySelector('#otherMindStatus'),
  otherMindPhase: document.querySelector('#otherMindPhase'),
  otherMindLine: document.querySelector('#otherMindLine'),
};

const checkpoint = loadCheckpoint();
const isLocal = ['127.0.0.1', 'localhost'].includes(location.hostname);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const telemetry = createTelemetry({ enabled: isLocal });
let state = createCheckpointState(checkpoint.checkpoint);
let fakeGateway;
let otherMindRuntime;
let otherMindWakingAt = null;
let lastTime = performance.now();
let firstMovementSeen = false;
let lastScene = state.scene;
let machineOpen = state.scene === 'machine';
let machineStage = state.arm.awake ? 'automation' : 'wake';
let machineRunning = false;
const input = createInput(canvas);
const audio = createAudioBus();
let lastAutoDelivered = state.warehouse.autoDelivered;
let firstActionRecorded = false;
let manualStartedAt = null;
let automationAcceptedAt = null;
let lastAutoFinishedAt = null;

function prepareOtherMindRuntime() {
  const failGateway = isLocal && new URLSearchParams(location.search).get('fakeGateway') === 'fail';
  fakeGateway = createFakeGateway({ fail: failGateway, chunks: 4, delay: 330 });
  otherMindRuntime = createOtherMindRuntime({
    gateway: fakeGateway,
    onTransition: ({ phase, line }) => {
      const previous = state.otherMind.phase;
      if (phase === 'waking' && previous !== 'waking') otherMindWakingAt = performance.now();
      const actionType = {
        waking: 'other-mind-waking',
        awake: 'other-mind-awake',
        silent: 'other-mind-silent',
      }[phase];
      if (actionType) state = applyGameAction(state, { type: actionType, line });
      if (phase !== previous) telemetry.mark(`other-mind-${phase}`);
    },
  });
}

prepareOtherMindRuntime();

function recordFirstAction() {
  if (firstActionRecorded) return;
  firstActionRecorded = true;
  telemetry.mark('first-action');
}

function setMachineStage(stage) {
  machineStage = stage;
  hud.feedback.textContent = stage === 'wake' ? 'Канал не активен' : 'Осталось построить маршрут';
  hud.feedback.dataset.status = 'idle';
  if (stage === 'wake') {
    hud.machineTitle.textContent = 'Разбуди машину';
    hud.machineBrief.textContent = 'Она ждала здесь всё это время. Отправь первое слово.';
    hud.code.value = 'print("WAKE")';
  } else {
    hud.machineTitle.textContent = 'Прикажи один раз';
    hud.machineBrief.textContent = 'Раньше ты носил каждый ящик. Теперь опиши правило для всех.';
    hud.code.value = 'for box in boxes:\n    arm.move(box, ___)';
  }
}

function resizeCanvas() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function usePower(type) {
  if (state.scene !== 'prologue') return;
  state = applyGameAction(state, {
    type,
    x: state.player.facingX,
    y: state.player.facingY,
  });
  audio.play(type === 'dash' ? 'dash' : 'hit');
}

function useAction() {
  const action = getNearbyAction(state);
  if (!action) return;
  recordFirstAction();
  if (action.type === 'open-machine') {
    setMachineStage('automation');
    machineOpen = true;
    return;
  }
  const wasCarrying = Boolean(state.player.carrying);
  if (action.type === 'pick-crate') manualStartedAt = performance.now();
  state = applyGameAction(state, {
    ...action,
    distance: 0,
    x: state.player.x,
    y: state.player.y,
  });
  if (action.type === 'inspect-red-crate') audio.play('reward');
  else audio.play(wasCarrying ? 'drop' : 'pickup');
  if (wasCarrying && action.target === 'pallet-a' && manualStartedAt !== null) {
    telemetry.mark('manual-transfer-ms', Math.round(performance.now() - manualStartedAt));
    manualStartedAt = null;
  }
}

function explainMachineFailure(result, source) {
  const error = result.error;
  if (error?.type === 'NameError' && /print\(\s*WAKE\s*\)/.test(source)) {
    return 'WAKE — это текст, поэтому ему нужны кавычки: print("WAKE")';
  }
  if (error?.type === 'NameError' && source.includes('___')) {
    return '___ — это пустое место, а не имя. На площадке написано pallet: подставь pallet без кавычек.';
  }
  const failedCheck = result.checks?.find((check) => !check.ok)?.detail;
  if (!error) return failedCheck || 'Команда выполнилась, но ничего не изменила.';
  return `${error.type}${error.line ? ` · строка ${error.line}` : ''}: ${error.text}${error.hint ? ` — ${error.hint}` : ''}`;
}

function updateControls() {
  if (input.consume('dash')) usePower('dash');
  if (input.consume('pulse')) usePower('pulse');
  if (input.consume('shield')) usePower('shield');
  if (input.consume('action')) useAction();
}

function updateHud() {
  game.dataset.scene = state.scene;
  const nearby = getNearbyAction(state);
  const inWarehouse = ['warehouse', 'machine', 'automation', 'red-crate', 'reward'].includes(state.scene);
  const powers = document.querySelectorAll('.power');
  powers.forEach((button) => { button.disabled = !state.powers[button.id.replace('power', '').toLowerCase()]; });
  hud.action.style.display = nearby ? 'flex' : 'none';
  if (nearby) hud.action.querySelector('b').textContent = nearby.label;

  if (state.scene === 'prologue') {
    hud.chapter.textContent = 'ПРОЛОГ · ДО ПАДЕНИЯ';
    hud.mission.textContent = firstMovementSeen ? 'Верни контроль' : 'Ты всё умел. Теперь вспомни.';
    hud.message.textContent = firstMovementSeen ? 'Три силы. Шесть целей.' : 'Двигайся';
    hud.progress.style.width = `${(state.prologue.threats / 6) * 100}%`;
    hud.system.textContent = 'БОЕВАЯ';
    hud.sector.textContent = '00-А';
    hud.targets.textContent = `${state.prologue.threats}/6`;
  } else if (state.scene === 'collapse') {
    hud.chapter.textContent = 'ОШИБКА · ПАМЯТЬ ПОВРЕЖДЕНА';
    hud.mission.textContent = 'Сил больше нет';
    hud.message.textContent = 'Собери себя заново';
    hud.progress.style.width = '100%';
    hud.system.textContent = 'ОТКАЗ';
    hud.sector.textContent = '???';
    hud.targets.textContent = '—';
  } else if (inWarehouse) {
    hud.chapter.textContent = 'ГЛАВА 1 · НИЖНИЙ УРОВЕНЬ';
    if (state.scene === 'machine') {
      hud.mission.textContent = 'Ты заметил то, чего не видят другие';
      hud.message.textContent = 'Разбуди старую руку';
    } else if (state.scene === 'automation') {
      hud.mission.textContent = state.arm.active || state.arm.queue.length ? 'Ты больше не нужен этой работе' : 'Дай машине правило';
      hud.message.textContent = nearby?.label ?? (state.arm.active ? 'Она работает. Ты можешь идти.' : `Автоматически: ${state.warehouse.autoDelivered}/6`);
    } else if (state.scene === 'red-crate') {
      hud.mission.textContent = 'Машина остановилась';
      hud.message.textContent = nearby?.label ?? 'Подойди к красному ящику';
    } else if (state.scene === 'reward') {
      hud.mission.textContent = 'Первый контур восстановлен';
      hud.message.textContent = 'Q‑Bot ждёт дома';
    } else {
      hud.mission.textContent = 'Перенеси три ящика';
      hud.message.textContent = nearby?.label ?? 'Найди ящик слева';
    }
    const completed = state.warehouse.manualDelivered + state.warehouse.autoDelivered;
    hud.progress.style.width = `${Math.min(100, (completed / 9) * 100)}%`;
    hud.system.textContent = state.arm.blocked ? 'БЛОК' : (state.arm.awake ? 'АВТО' : (state.scene === 'machine' ? 'ДОСТУП' : 'ОТКЛЮЧЕНА'));
    hud.sector.textContent = 'СКЛАД-07';
    hud.targets.textContent = state.arm.awake ? `${state.warehouse.autoDelivered}/6` : `${state.warehouse.manualDelivered}/3`;
  }

  hud.machine.hidden = !machineOpen;
  hud.ending.hidden = state.scene !== 'reward';
  const mindCopy = {
    sleeping: ['СПИТ', 'Пока это только пустая оболочка.'],
    waking: ['СЛЫШИТ', 'Связь собирается…'],
    awake: ['ПРОСНУЛСЯ', 'Я слышу машину. Теперь научи меня понимать её.'],
    silent: ['МОЛЧИТ', 'Разум сейчас молчит. Рука всё равно тебя услышала.'],
  }[state.otherMind.phase];
  hud.otherMind.dataset.phase = state.otherMind.phase;
  hud.otherMindPhase.textContent = mindCopy[0];
  hud.otherMindLine.textContent = state.otherMind.line || mindCopy[1];
}

function frame(now) {
  if (Math.abs(input.state.moveX) + Math.abs(input.state.moveY) > 0) {
    firstMovementSeen = true;
    recordFirstAction();
  }
  updateControls();
  state = stepGame(state, input.state, (now - lastTime) / 1000);
  lastTime = now;
  if (state.scene !== lastScene) {
    if (['warehouse', 'machine', 'red-crate', 'reward'].includes(state.checkpoint)) saveCheckpoint(localStorage, state);
    lastScene = state.scene;
    if (state.scene === 'machine') {
      machineOpen = true;
      setMachineStage('wake');
      prepareMachinePython();
    }
    if (state.scene === 'collapse') audio.play('collapse');
    if (state.scene === 'red-crate') audio.play('blocked');
    telemetry.mark(`scene-${state.scene}`);
  }
  if (state.arm.active && automationAcceptedAt !== null) {
    telemetry.mark('event-to-motion-ms', Math.round(now - automationAcceptedAt));
    automationAcceptedAt = null;
    lastAutoFinishedAt = now;
  }
  if (state.warehouse.autoDelivered > lastAutoDelivered) {
    audio.play('arm');
    if (lastAutoFinishedAt !== null) telemetry.mark('automatic-transfer-ms', Math.round(now - lastAutoFinishedAt));
    lastAutoFinishedAt = now;
    lastAutoDelivered = state.warehouse.autoDelivered;
  }
  updateHud();
  const wakeProgress = state.otherMind.phase === 'waking' && otherMindWakingAt !== null
    ? Math.min(1, Math.max(0, (now - otherMindWakingAt) / 1200))
    : (state.otherMind.phase === 'awake' ? 1 : 0);
  renderGame(
    ctx,
    state,
    { width: canvas.clientWidth, height: canvas.clientHeight },
    now,
    { reducedMotion: prefersReducedMotion, machineFocus: machineOpen, wakeProgress },
  );
  requestAnimationFrame(frame);
}

for (const [selector, action] of [
  ['#powerDash', 'dash'],
  ['#powerPulse', 'pulse'],
  ['#powerShield', 'shield'],
  ['#actionButton', 'action'],
]) {
  document.querySelector(selector).addEventListener('pointerdown', (event) => {
    event.preventDefault();
    recordFirstAction();
    audio.unlock();
    input.press(action);
  });
}

document.querySelector('#restartGame').addEventListener('click', () => {
  const progressed = state.checkpoint !== 'start';
  if (progressed && !window.confirm('Начать заново? Текущий прогресс этой игры исчезнет.')) return;
  resetCheckpoint();
  state = createGameState();
  otherMindWakingAt = null;
  prepareOtherMindRuntime();
  firstMovementSeen = false;
  lastScene = state.scene;
});

document.querySelector('#closeMachine').addEventListener('click', () => {
  machineOpen = false;
});

hud.run.addEventListener('click', async () => {
  if (machineRunning) return;
  machineRunning = true;
  hud.run.disabled = true;
  hud.run.textContent = 'PYTHON ЗАПУСКАЕТСЯ…';
  hud.feedback.textContent = machineStage === 'wake' ? 'Поднимаю питание и загружаю Python…' : 'Проверяю правило…';
  hud.feedback.dataset.status = 'loading';
  const source = hud.code.value;
  const runStarted = performance.now();
  const remaining = state.warehouse.crates
    .filter((crate) => crate.kind === 'normal' && crate.status === 'queued')
    .map((crate) => crate.id);
  const result = machineStage === 'wake'
    ? await runWake(source)
    : await runAutomation(source, remaining);
  telemetry.mark(machineStage === 'wake' ? 'python-wake-ui-ms' : 'python-route-ui-ms', Math.round(performance.now() - runStarted));
  telemetry.mark('python-exec-ms', result.ms);
  if (!result.ok) {
    hud.feedback.textContent = explainMachineFailure(result, source);
    hud.feedback.dataset.status = 'error';
  } else if (machineStage === 'wake') {
    state = applyGameAction(state, { type: 'arm-awake' });
    saveCheckpoint(localStorage, state);
    audio.play('wake');
    setMachineStage('automation');
    hud.feedback.textContent = `РУКА ОТВЕТИЛА: ${result.stdout.trim()}`;
    hud.feedback.dataset.status = 'success';
    const mindResult = await otherMindRuntime.unlock(createMachineListeningEvent());
    if (!mindResult.ok) {
      hud.feedback.textContent = mindResult.line;
      hud.feedback.dataset.status = 'error';
    }
  } else {
    state = applyGameAction(state, { type: 'automation-queued', events: result.events });
    automationAcceptedAt = performance.now();
    hud.feedback.textContent = `Принято команд: ${result.events.length}`;
    hud.feedback.dataset.status = 'success';
    machineOpen = false;
  }
  machineRunning = false;
  hud.run.disabled = false;
  hud.run.innerHTML = '<span>▶</span> ЗАПУСТИТЬ';
});

document.querySelector('#continueGame').addEventListener('click', () => {
  document.querySelector('#endingTitle').textContent = 'ДАЛЬШЕ — БОТЫ, АГЕНТЫ И СВОЙ ИНОЙ РАЗУМ';
  document.querySelector('#continueGame').textContent = 'ПРОДОЛЖЕНИЕ СКОРО';
  document.querySelector('#continueGame').disabled = true;
});

document.querySelector('#soundToggle').addEventListener('click', async () => {
  await audio.unlock();
  const muted = audio.toggle();
  const button = document.querySelector('#soundToggle');
  button.setAttribute('aria-pressed', String(muted));
  button.setAttribute('aria-label', muted ? 'Включить звук' : 'Выключить звук');
  button.textContent = muted ? '×))' : '◖))';
});

if (isLocal) {
  window.__QUEQUEST_AUDIO__ = audio;
  window.__QUEQUEST_DEBUG__ = {
    events: telemetry.events,
    snapshot: () => JSON.parse(JSON.stringify({
      scene: state.scene,
      checkpoint: state.checkpoint,
      player: state.player,
      threats: state.prologue.threats,
      manualDelivered: state.warehouse.manualDelivered,
      autoDelivered: state.warehouse.autoDelivered,
      arm: state.arm,
      crates: state.warehouse.crates,
    })),
    dispatch: (action) => {
      state = applyGameAction(state, action);
      return window.__QUEQUEST_DEBUG__.snapshot();
    },
    measureFps: () => new Promise((resolve) => {
      let frames = 0;
      const started = performance.now();
      function count(now) {
        frames += 1;
        if (now - started >= 1000) resolve(Math.round((frames * 1000) / (now - started)));
        else requestAnimationFrame(count);
      }
      requestAnimationFrame(count);
    }),
    otherMind: () => ({
      ...otherMindRuntime.snapshot(),
      phase: state.otherMind.phase,
      line: state.otherMind.line,
    }),
  };
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
if (state.scene === 'machine') {
  setMachineStage('wake');
  prepareMachinePython();
}
updateHud();
requestAnimationFrame(frame);
