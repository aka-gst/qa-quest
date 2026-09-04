import { MACHINE, PALLET, WORLD } from './config.js';
import { getViewportTransform } from './viewport.js';

const prologueImage = new Image();
prologueImage.src = 'art/night2-hero.jpg';
const rewardImage = new Image();
rewardImage.src = 'art/garage-milestone-1.jpg';

function viewportTransform(ctx, viewport, player) {
  const { scale, offsetX, offsetY } = getViewportTransform(viewport, player);
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

function drawCombatHero(ctx, state, now) {
  const { x, y } = state.player;
  const recoil = state.sceneTime - state.prologue.lastShotAt < .1 ? 9 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = '#64e9ff';
  ctx.shadowBlur = 34;
  ctx.fillStyle = '#183d4b';
  ctx.strokeStyle = '#b9f6ff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-46, -72); ctx.lineTo(-78, -28); ctx.lineTo(-58, 30);
  ctx.lineTo(-30, 48); ctx.lineTo(30, 48); ctx.lineTo(58, 30);
  ctx.lineTo(78, -28); ctx.lineTo(46, -72); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#64e9ff';
  ctx.fillRect(-28, -54, 56, 12);
  ctx.fillStyle = '#e9e3d5';
  ctx.fillRect(-50, 45, 28, 54);
  ctx.fillRect(22, 45, 28, 54);
  ctx.fillStyle = '#283747';
  ctx.fillRect(-90, -38, 38, 72);
  ctx.fillRect(52, -38, 38, 72);
  ctx.fillStyle = '#ffc857';
  ctx.beginPath();
  ctx.arc(0, 2, 13 + Math.sin(now / 80) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#53657a';
  ctx.fillRect(64, -50, 98 - recoil, 28);
  ctx.fillStyle = '#ffdf7a';
  ctx.shadowColor = '#ffc857';
  ctx.shadowBlur = recoil ? 35 : 0;
  ctx.fillRect(162 - recoil, -45, recoil ? 34 : 8, 18);
  ctx.restore();
}

function drawWorker(ctx, state) {
  const { x, y, carrying } = state.player;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#cfa87c';
  ctx.beginPath(); ctx.arc(0, -54, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6f4c32';
  ctx.fillRect(-24, -43, 48, 9);
  ctx.fillStyle = '#d6a447';
  ctx.beginPath(); ctx.ellipse(0, 4, 43, 55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2d263';
  ctx.fillRect(-39, -26, 78, 12);
  ctx.fillStyle = '#303a47';
  ctx.fillRect(-31, 43, 24, 51);
  ctx.fillRect(7, 43, 24, 51);
  ctx.fillStyle = '#171e29';
  ctx.fillRect(-38, 88, 31, 11);
  ctx.fillRect(7, 88, 31, 11);
  if (carrying) {
    ctx.fillStyle = '#bb8440';
    ctx.fillRect(-42, -22, 84, 58);
    ctx.strokeStyle = '#e9e3d5';
    ctx.globalAlpha = .5;
    ctx.strokeRect(-35, -15, 70, 44);
  }
  ctx.restore();
}

function enemyNumber(enemy) {
  return Number(enemy.id.slice(-2)) || 1;
}

function drawDestroyedEnemy(ctx, enemy, state) {
  const seed = enemyNumber(enemy);
  const age = Math.max(0, state.sceneTime - (enemy.destroyedAt ?? state.sceneTime));
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = '#5a0715';
  ctx.globalAlpha = .65;
  ctx.beginPath();
  ctx.ellipse(0, 16, 28 + seed % 12, 10 + seed % 7, seed * .31, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = Math.max(0, 1 - age / 1.1);
  for (let index = 0; index < 7; index += 1) {
    const angle = seed * .73 + index * .91;
    const travel = 18 + age * (95 + (seed * index) % 70);
    ctx.fillStyle = index % 3 === 0 ? '#ff4d5a' : '#76869a';
    ctx.fillRect(Math.cos(angle) * travel - 5, Math.sin(angle) * travel - 3, 10, 6);
  }
  ctx.restore();
}

function drawDrone(ctx, enemy, now) {
  const seed = enemyNumber(enemy);
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(Math.sin(now / 420 + seed) * .13);
  ctx.shadowColor = '#ff4d5a';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#35131b';
  ctx.strokeStyle = '#ff7580';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-31, -9); ctx.lineTo(-12, -23); ctx.lineTo(18, -18);
  ctx.lineTo(33, 0); ctx.lineTo(18, 18); ctx.lineTo(-12, 23); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff4d5a';
  ctx.fillRect(-8, -5, 22, 10);
  ctx.strokeStyle = '#8c98a8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-17, 14); ctx.lineTo(-37, 34);
  ctx.moveTo(14, 15); ctx.lineTo(34, 35);
  ctx.stroke();
  ctx.restore();
}

function drawPrologue(ctx, state, now) {
  ctx.fillStyle = '#02060a';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  drawCover(ctx, prologueImage, .54);
  drawGrid(ctx);

  ctx.save();
  ctx.globalAlpha = .14;
  ctx.fillStyle = '#64e9ff';
  ctx.beginPath(); ctx.arc(state.player.x, state.player.y, 360 + Math.sin(now / 1100) * 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  for (const enemy of state.prologue.enemies) {
    if (enemy.alive) drawDrone(ctx, enemy, now);
    else drawDestroyedEnemy(ctx, enemy, state);
  }

  if (state.sceneTime - state.prologue.lastShotAt < .12) {
    const targetId = state.prologue.lastTargets[0];
    const target = state.prologue.enemies.find(({ id }) => id === targetId);
    if (target) {
      ctx.strokeStyle = '#ffe59a';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#ffc857';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.moveTo(state.player.x + 160, state.player.y - 36);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.fillStyle = '#fff4c2';
      ctx.beginPath(); ctx.arc(target.x, target.y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  if (state.prologue.waveRadius > 0) {
    ctx.strokeStyle = '#ffc857';
    ctx.lineWidth = 8;
    ctx.globalAlpha = Math.min(1, state.prologue.waveRadius / 80);
    ctx.beginPath(); ctx.arc(state.player.x, state.player.y, 210 - state.prologue.waveRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  drawCombatHero(ctx, state, now);
}

function drawTerminal(ctx, state, now) {
  const online = ['machine', 'automation', 'red-crate', 'reward'].includes(state.scene);
  ctx.save();
  ctx.fillStyle = '#202b39';
  ctx.fillRect(MACHINE.x - 88, MACHINE.y - 62, 176, 124);
  ctx.strokeStyle = online ? '#64e9ff' : '#4c3032';
  ctx.lineWidth = 5;
  ctx.strokeRect(MACHINE.x - 74, MACHINE.y - 48, 148, 76);
  ctx.fillStyle = online ? '#092d37' : '#160b0d';
  ctx.fillRect(MACHINE.x - 68, MACHINE.y - 42, 136, 64);
  ctx.fillStyle = online ? '#64e9ff' : '#5d3438';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = online ? 18 + Math.sin(now / 180) * 6 : 2;
  ctx.fillRect(MACHINE.x - 54, MACHINE.y - 25, online ? 78 : 32, 7);
  ctx.fillRect(MACHINE.x - 54, MACHINE.y - 7, online ? 48 : 22, 7);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#101721';
  ctx.fillRect(MACHINE.x - 18, MACHINE.y + 62, 36, 112);
  ctx.fillRect(MACHINE.x - 62, MACHINE.y + 170, 124, 22);
  ctx.restore();
}

function drawPoster(ctx, state) {
  const fallen = state.scene !== 'warehouse';
  const progress = fallen ? Math.min(1, state.sceneTime / .9) : 0;
  const x = 1180 - progress * 60;
  const y = 215 + progress * 495;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.03 + progress * 1.1);
  ctx.fillStyle = '#e9e3d5';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 18;
  ctx.fillRect(-118, -74, 236, 148);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#262c34';
  ctx.lineWidth = 7;
  ctx.strokeRect(-118, -74, 236, 148);
  ctx.fillStyle = '#111820';
  ctx.textAlign = 'center';
  if (!fallen) {
    ctx.font = '900 21px ui-monospace, monospace';
    ctx.fillText('РУКУ НЕ', 0, -12);
    ctx.fillText('ВКЛЮЧАТЬ', 0, 20);
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillText('приказ № 07', 0, 51);
  } else {
    ctx.font = '900 23px ui-monospace, monospace';
    ctx.fillText('print("WAKE")', 0, -25);
    ctx.strokeStyle = '#111820';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-45, 34); ctx.lineTo(-8, 4); ctx.lineTo(28, 31); ctx.lineTo(53, 6);
    ctx.stroke();
    for (const [px, py] of [[-45, 34], [-8, 4], [28, 31], [53, 6]]) {
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
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

function drawArm(ctx, state, now, { machineFocus = false, wakeProgress = 0 } = {}) {
  const awake = state.arm.awake;
  const watch = state.warehouse.manualDelivered * .14;
  const angle = awake ? Math.sin(now / 650) * .08 : watch;
  const active = state.arm.active;
  const source = active
    ? state.warehouse.crates.find((crate) => crate.id === active.boxId)
    : null;
  const progress = Math.max(0, Math.min(1, active?.progress ?? 0));
  const focusOffset = machineFocus && !active ? -330 : 0;
  const gesture = state.otherMind.phase === 'awake'
    ? 1
    : (state.otherMind.phase === 'waking' ? Math.min(1, wakeProgress * 1.25) : 0);
  const endX = active ? source.x + (PALLET.x - source.x) * progress : MACHINE.x - 70 + focusOffset - gesture * 95;
  const endY = active ? source.y + (PALLET.y - source.y) * progress - Math.sin(progress * Math.PI) * 330 : MACHINE.y - 55 - gesture * 40;
  const baseX = MACHINE.x + focusOffset;
  const baseY = MACHINE.y + 220;
  const elbowX = active ? (baseX + endX) / 2 : MACHINE.x - 25 + focusOffset - gesture * 30;
  const elbowY = active ? Math.min(baseY, endY) - 150 : MACHINE.y - 70 - gesture * 18;
  ctx.save();
  ctx.fillStyle = '#283444';
  ctx.fillRect(baseX - 70, baseY + 30, 140, 72);
  ctx.strokeStyle = awake ? '#718398' : '#59687a';
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(baseX, baseY + 34); ctx.lineTo(elbowX + angle * 30, elbowY); ctx.lineTo(endX, endY); ctx.stroke();
  ctx.fillStyle = '#263241';
  for (const [x, y] of [[baseX, baseY + 34], [elbowX + angle * 30, elbowY], [endX, endY]]) {
    ctx.beginPath(); ctx.arc(x, y, 29, 0, Math.PI * 2); ctx.fill();
  }
  if (state.otherMind.phase === 'waking') {
    const signal = Math.min(2.99, wakeProgress * 3);
    const joints = [[baseX, baseY + 34], [elbowX + angle * 30, elbowY], [endX, endY]];
    joints.forEach(([x, y], index) => {
      const strength = Math.max(0, 1 - Math.abs(signal - index));
      ctx.fillStyle = strength > .15 ? '#ffc857' : '#64e9ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10 + strength * 22;
      ctx.beginPath(); ctx.arc(x, y, 7 + strength * 9, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.fillStyle = awake ? '#64e9ff' : (state.warehouse.manualDelivered ? '#ffc857' : '#4c3032');
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(endX, endY, 12, 0, Math.PI * 2); ctx.fill();
  if (active) {
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#bb8440';
    ctx.fillRect(endX - 24, endY + 18, 48, 48);
  }
  ctx.restore();
}

function drawOtherMind(ctx, state, now, { reducedMotion = false, machineFocus = false, wakeProgress = 0 } = {}) {
  const { phase } = state.otherMind;
  const waking = phase === 'waking';
  const awake = phase === 'awake';
  const silent = phase === 'silent';
  const pulse = reducedMotion ? 0 : Math.min(1, wakeProgress);
  const bob = awake && !reducedMotion ? Math.sin(now / 650) * 4 : 0;
  const x = MACHINE.x + 145 + (machineFocus ? -330 : 0);
  const y = MACHINE.y + 20 + bob;

  ctx.save();
  ctx.translate(x, y);
  if (waking) {
    ctx.strokeStyle = '#ffc857';
    ctx.lineWidth = 4;
    ctx.globalAlpha = Math.max(.18, .82 - pulse * .62);
    for (const radius of [42 + pulse * 38, 58 + pulse * 66]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * .62, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.rotate(phase === 'sleeping' ? -.42 : 0);
  ctx.fillStyle = awake ? '#0a2b33' : '#151b24';
  ctx.strokeStyle = silent ? '#a98147' : (waking ? '#ffc857' : (awake ? '#64e9ff' : '#4c5868'));
  ctx.lineWidth = awake ? 5 : 3;
  if (silent) ctx.setLineDash([8, 7]);
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = awake || waking ? 24 : 5;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.bezierCurveTo(38, -28, 46, 9, 0, 36);
  ctx.bezierCurveTo(-46, 9, -38, -28, 0, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.shadowBlur = 0;
  if (awake || waking) {
    ctx.fillStyle = awake ? '#e9e3d5' : '#ffc857';
    ctx.beginPath();
    ctx.ellipse(0, 0, awake ? 22 : 12, awake ? 11 : 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#071017';
    ctx.beginPath();
    ctx.arc(awake ? Math.sin(now / 900) * 7 : 0, 0, awake ? 7 : 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = silent ? '#a98147' : '#4c5868';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(0, 8, 18, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWarehouse(ctx, state, now, options = {}) {
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
  drawTerminal(ctx, state, now);
  ctx.fillStyle = '#4d3d25';
  ctx.fillRect(PALLET.x - 20, PALLET.y - 20, PALLET.width, PALLET.height);
  ctx.strokeStyle = '#ffc857';
  ctx.lineWidth = 5;
  ctx.strokeRect(PALLET.x - 20, PALLET.y - 20, PALLET.width, PALLET.height);
  ctx.fillStyle = '#ffc857';
  ctx.font = '700 23px ui-monospace, monospace';
  ctx.fillText('PALLET', PALLET.x, PALLET.y + 150);

  drawArm(ctx, state, now, options);
  drawOtherMind(ctx, state, now, options);

  for (const crate of state.warehouse.crates) {
    if (['carried', 'hidden', 'arm'].includes(crate.status)) continue;
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

  drawWorker(ctx, state);
  drawPoster(ctx, state);

  ctx.fillStyle = '#8993a1';
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillText(`СМЕНА 03:17     ПЕРЕНЕСЕНО ${state.warehouse.manualDelivered}     ₽ ${state.warehouse.wage}`, 520, 825);
  if (state.scene === 'red-crate') {
    ctx.fillStyle = '#ff4d5a';
    ctx.font = '900 28px ui-monospace, monospace';
    ctx.fillText('ОШИБКА МАРШРУТА · ГРУЗ НЕ СОВПАДАЕТ', 590, 220);
  }
}

function drawReward(ctx, state, now) {
  ctx.fillStyle = '#04070b';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  drawCover(ctx, rewardImage, .68);
  const shade = ctx.createLinearGradient(0, 0, WORLD.width, 0);
  shade.addColorStop(0, '#05080de8');
  shade.addColorStop(.55, '#05080d55');
  shade.addColorStop(1, '#05080dcc');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.fillStyle = '#171e29';
  ctx.fillRect(940, 610, 510, 38);
  ctx.fillRect(990, 648, 24, 165);
  ctx.fillRect(1375, 648, 24, 165);
  ctx.strokeStyle = '#64e9ff';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#64e9ff';
  ctx.shadowBlur = 22;
  ctx.beginPath(); ctx.arc(1200, 545, 64 + Math.sin(now / 800) * 3, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#64e9ff';
  ctx.fillRect(1177, 535, 12, 8);
  ctx.fillRect(1211, 535, 12, 8);
  ctx.fillStyle = '#e9e3d5';
  ctx.font = '700 18px ui-monospace, monospace';
  ctx.fillText('Q-BOT // EMPTY SHELL', 1080, 690);
  ctx.fillStyle = '#ffc857';
  ctx.fillText(`ЗАРАБОТАНО: ₽ ${state.warehouse.wage}`, 1080, 725);
}

function drawCollapse(ctx, state) {
  const progress = Math.min(1, state.sceneTime / 1.55);
  drawPrologue(ctx, state, state.elapsed * 1000);
  ctx.fillStyle = `rgba(255, 77, 90, ${Math.sin(progress * Math.PI) * .42})`;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.save();
  ctx.translate(Math.sin(state.sceneTime * 92) * 18 * (1 - progress), Math.cos(state.sceneTime * 67) * 8 * (1 - progress));
  ctx.fillStyle = '#e9e3d5';
  ctx.font = '900 95px Arial Narrow, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(progress < .55 ? 'DISCONNECT' : 'ОПЯТЬ НА РАБОТУ', 800, 470);
  ctx.font = '700 22px ui-monospace, monospace';
  ctx.fillStyle = '#ffb4ba';
  ctx.fillText(progress < .55 ? 'SIGNAL LOST · MEMORY LINK FAILED' : 'СМЕНА 03:17 · СКЛАД-07', 800, 520);
  ctx.restore();
}

export function renderGame(ctx, state, viewport, now, options = {}) {
  ctx.save();
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  viewportTransform(ctx, viewport, state.player);
  if (state.scene === 'prologue') drawPrologue(ctx, state, now);
  else if (state.scene === 'collapse') drawCollapse(ctx, state);
  else if (state.scene === 'reward') drawReward(ctx, state, now);
  else drawWarehouse(ctx, state, now, options);
  ctx.restore();
}
