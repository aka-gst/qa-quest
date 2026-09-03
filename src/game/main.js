import { createInput } from './input.js';
import {
  applyGameAction,
  createGameState,
  getNearbyAction,
  stepGame,
} from './model.js';
import { renderGame } from './render.js';
import { loadCheckpoint, resetCheckpoint, saveCheckpoint } from './save.js';

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
};

const checkpoint = loadCheckpoint();
const sceneByCheckpoint = {
  warehouse: 'warehouse',
  machine: 'machine',
  'red-crate': 'red-crate',
  reward: 'reward',
};
let state = createGameState(checkpoint.checkpoint === 'start' ? {} : {
  scene: sceneByCheckpoint[checkpoint.checkpoint] ?? 'prologue',
  checkpoint: checkpoint.checkpoint,
  powers: checkpoint.checkpoint === 'start' ? undefined : { dash: false, pulse: false, shield: false },
  warehouse: checkpoint.checkpoint === 'machine' ? { manualDelivered: 3, wage: 360 } : undefined,
});
let lastTime = performance.now();
let firstMovementSeen = false;
let lastScene = state.scene;
const input = createInput(canvas);

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
}

function useAction() {
  const action = getNearbyAction(state);
  if (!action) return;
  state = applyGameAction(state, {
    ...action,
    distance: 0,
    x: state.player.x,
    y: state.player.y,
  });
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
    hud.mission.textContent = state.scene === 'machine' ? 'Ты заметил то, чего не видят другие' : 'Перенеси три ящика';
    hud.message.textContent = state.scene === 'machine' ? 'Подойди к машине' : (nearby?.label ?? 'Найди ящик слева');
    hud.progress.style.width = `${(state.warehouse.manualDelivered / 3) * 100}%`;
    hud.system.textContent = state.scene === 'machine' ? 'ДОСТУП' : 'ОТКЛЮЧЕНА';
    hud.sector.textContent = 'СКЛАД-07';
    hud.targets.textContent = `${state.warehouse.manualDelivered}/3`;
  }

  hud.machine.hidden = state.scene !== 'machine';
}

function frame(now) {
  if (Math.abs(input.state.moveX) + Math.abs(input.state.moveY) > 0) firstMovementSeen = true;
  updateControls();
  state = stepGame(state, input.state, (now - lastTime) / 1000);
  lastTime = now;
  if (state.scene !== lastScene) {
    if (['warehouse', 'machine', 'red-crate', 'reward'].includes(state.checkpoint)) saveCheckpoint(localStorage, state);
    lastScene = state.scene;
  }
  updateHud();
  renderGame(ctx, state, { width: canvas.clientWidth, height: canvas.clientHeight }, now);
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
    input.press(action);
  });
}

document.querySelector('#restartGame').addEventListener('click', () => {
  const progressed = state.checkpoint !== 'start';
  if (progressed && !window.confirm('Начать заново? Текущий прогресс этой игры исчезнет.')) return;
  resetCheckpoint();
  state = createGameState();
  firstMovementSeen = false;
  lastScene = state.scene;
});

document.querySelector('#closeMachine').addEventListener('click', () => {
  hud.machine.hidden = true;
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateHud();
requestAnimationFrame(frame);
