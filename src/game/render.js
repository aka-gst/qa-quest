import { MACHINE, PALLET, WORLD } from './config.js';

const prologueImage = new Image();
prologueImage.src = 'art/night2-hero.jpg';

function viewportTransform(ctx, viewport) {
  const scale = Math.min(viewport.width / WORLD.width, viewport.height / WORLD.height);
  const offsetX = (viewport.width - WORLD.width * scale) / 2;
  const offsetY = (viewport.height - WORLD.height * scale) / 2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
}

function drawCover(ctx, image, alpha = 1) {
  if (!image.complete || !image.naturalWidth) return;
  const scale = Math.max(WORLD.width / image.naturalWidth, WORLD.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, (WORLD.width - width) / 2, (WORLD.height - height) / 2, width, height);
  ctx.restore();
}

function drawGrid(ctx, color = '#1d4c57') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = .35;
  ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.width; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke();
  }
  for (let y = 0; y <= WORLD.height; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke();
  }
  ctx.restore();
}

function drawHero(ctx, state, color = '#64e9ff') {
  const { x, y, shieldUntil } = state.player;
  const carrying = state.player.carrying;
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -27);
  ctx.lineTo(19, 21);
  ctx.lineTo(0, 13);
  ctx.lineTo(-19, 21);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#e9e3d5';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(state.player.facingX * 32, state.player.facingY * 32); ctx.stroke();
  if (shieldUntil > state.elapsed) {
    ctx.strokeStyle = '#e9e3d5';
    ctx.lineWidth = 5;
    ctx.globalAlpha = .7;
    ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.stroke();
  }
  if (carrying) {
    ctx.fillStyle = '#ffc857';
    ctx.fillRect(-25, -64, 50, 34);
    ctx.strokeStyle = '#080b11';
    ctx.strokeRect(-19, -58, 38, 22);
  }
  ctx.restore();
}

function drawPrologue(ctx, state, now) {
  ctx.fillStyle = '#02060a';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  drawCover(ctx, prologueImage, .54);
  drawGrid(ctx);

  ctx.save();
  ctx.globalAlpha = .13;
  ctx.fillStyle = '#64e9ff';
  ctx.beginPath(); ctx.arc(800, 480, 420 + Math.sin(now / 1100) * 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  for (const enemy of state.prologue.enemies) {
    if (!enemy.alive) continue;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(now / 700 + Number(enemy.id.slice(-2)));
    ctx.shadowColor = '#ff4d5a';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = '#ff4d5a';
    ctx.lineWidth = 6;
    ctx.strokeRect(-22, -22, 44, 44);
    ctx.fillStyle = '#ff4d5a';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

  if (state.prologue.waveRadius > 0) {
    ctx.strokeStyle = '#ffc857';
    ctx.lineWidth = 8;
    ctx.globalAlpha = Math.min(1, state.prologue.waveRadius / 80);
    ctx.beginPath(); ctx.arc(state.player.x, state.player.y, 210 - state.prologue.waveRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  drawHero(ctx, state);
}

function drawConveyor(ctx) {
  ctx.fillStyle = '#111924';
  ctx.fillRect(15, 445, 390, 290);
  ctx.strokeStyle = '#334357';
  ctx.lineWidth = 10;
  ctx.strokeRect(15, 445, 390, 290);
  ctx.fillStyle = '#8993a1';
  for (let y = 475; y < 720; y += 46) ctx.fillRect(32, y, 350, 5);
}

function drawArm(ctx, state, now) {
  const awake = state.arm.awake;
  const watch = state.warehouse.manualDelivered * .14;
  const angle = awake ? Math.sin(now / 650) * .2 : watch;
  ctx.save();
  ctx.translate(MACHINE.x, MACHINE.y + 170);
  ctx.fillStyle = '#283444';
  ctx.fillRect(-70, 30, 140, 72);
  ctx.rotate(-1.15 + angle);
  ctx.fillStyle = '#59687a';
  ctx.fillRect(-22, -230, 44, 265);
  ctx.translate(0, -220);
  ctx.rotate(1.7 - angle * 1.4);
  ctx.fillStyle = '#718398';
  ctx.fillRect(-18, -160, 36, 180);
  ctx.fillStyle = awake ? '#64e9ff' : (state.warehouse.manualDelivered ? '#ffc857' : '#4c3032');
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(0, -165, 12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawWarehouse(ctx, state, now) {
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, '#101722');
  gradient.addColorStop(1, '#06090e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  drawGrid(ctx, '#273343');

  ctx.fillStyle = '#0b1018';
  ctx.fillRect(0, 0, WORLD.width, 170);
  ctx.fillStyle = '#182131';
  for (let x = 30; x < WORLD.width; x += 180) ctx.fillRect(x, 40, 120, 105);

  drawConveyor(ctx);
  ctx.fillStyle = '#4d3d25';
  ctx.fillRect(PALLET.x - 20, PALLET.y - 20, PALLET.width, PALLET.height);
  ctx.strokeStyle = '#ffc857';
  ctx.lineWidth = 5;
  ctx.strokeRect(PALLET.x - 20, PALLET.y - 20, PALLET.width, PALLET.height);
  ctx.fillStyle = '#ffc857';
  ctx.font = '700 23px ui-monospace, monospace';
  ctx.fillText('PALLET', PALLET.x, PALLET.y + 150);

  drawArm(ctx, state, now);

  for (const crate of state.warehouse.crates) {
    if (['carried', 'hidden'].includes(crate.status)) continue;
    const stack = crate.status === 'pallet' ? state.warehouse.crates.filter((item) => item.status === 'pallet').findIndex((item) => item.id === crate.id) : 0;
    const x = crate.status === 'pallet' ? PALLET.x + 8 + (stack % 3) * 52 : crate.x;
    const y = crate.status === 'pallet' ? PALLET.y + 52 - Math.floor(stack / 3) * 54 : crate.y;
    ctx.fillStyle = crate.kind === 'red' ? '#ff4d5a' : '#bb8440';
    ctx.fillRect(x - 23, y - 23, 46, 46);
    ctx.strokeStyle = '#e9e3d5';
    ctx.globalAlpha = .45;
    ctx.strokeRect(x - 18, y - 18, 36, 36);
    ctx.globalAlpha = 1;
  }

  drawHero(ctx, state, '#e9e3d5');

  ctx.fillStyle = '#8993a1';
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillText(`СМЕНА 03:17     ПЕРЕНЕСЕНО ${state.warehouse.manualDelivered}     ₽ ${state.warehouse.wage}`, 520, 825);
}

function drawCollapse(ctx, state) {
  const progress = Math.min(1, state.sceneTime / 2.5);
  drawPrologue(ctx, state, state.elapsed * 1000);
  ctx.fillStyle = `rgba(255, 77, 90, ${Math.sin(progress * Math.PI) * .42})`;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.save();
  ctx.translate((Math.random() - .5) * 30 * (1 - progress), 0);
  ctx.fillStyle = '#e9e3d5';
  ctx.font = '900 95px Arial Narrow, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(progress < .55 ? 'СИСТЕМА НЕ ОТВЕЧАЕТ' : 'ТЫ ВСЁ ЗАБЫЛ', 800, 470);
  ctx.restore();
}

export function renderGame(ctx, state, viewport, now) {
  ctx.save();
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  viewportTransform(ctx, viewport);
  if (state.scene === 'prologue') drawPrologue(ctx, state, now);
  else if (state.scene === 'collapse') drawCollapse(ctx, state);
  else drawWarehouse(ctx, state, now);
  ctx.restore();
}
