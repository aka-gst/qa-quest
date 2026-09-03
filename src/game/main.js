import { createGameState, stepGame } from './model.js';
import { loadCheckpoint, resetCheckpoint } from './save.js';

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const game = document.querySelector('#game');
const checkpoint = loadCheckpoint();
let state = createGameState(checkpoint.checkpoint === 'start'
  ? {}
  : { scene: checkpoint.checkpoint, checkpoint: checkpoint.checkpoint });
let lastTime = performance.now();

function resizeCanvas() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * scale);
  canvas.height = Math.round(canvas.clientHeight * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function renderPlaceholder(now) {
  const { clientWidth: width, clientHeight: height } = canvas;
  const glow = .5 + Math.sin(now / 900) * .08;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#080b11';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = .28;
  ctx.strokeStyle = '#2a7180';
  ctx.lineWidth = 1;
  const horizon = height * .62;
  for (let x = -width; x < width * 2; x += 56) {
    ctx.beginPath();
    ctx.moveTo(width / 2, horizon);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = horizon; y < height; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = `rgba(100, 233, 255, ${glow})`;
  ctx.shadowColor = '#64e9ff';
  ctx.shadowBlur = 32;
  ctx.beginPath();
  ctx.arc(width * .57, height * .58, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#64e9ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width * .57, height * .58, 30 + Math.sin(now / 400) * 3, 0, Math.PI * 2);
  ctx.stroke();
}

function frame(now) {
  state = stepGame(state, {}, (now - lastTime) / 1000);
  lastTime = now;
  game.dataset.scene = state.scene;
  renderPlaceholder(now);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resizeCanvas);
document.querySelector('#restartGame').addEventListener('click', () => {
  resetCheckpoint();
  state = createGameState();
});

resizeCanvas();
requestAnimationFrame(frame);
