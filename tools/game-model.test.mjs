import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyGameAction,
  createCheckpointState,
  createGameState,
  getNearbyAction,
  stepGame,
} from '../src/game/model.js';

test('шесть обезвреженных угроз запускают катастрофу', () => {
  let state = createGameState();
  for (let index = 0; index < 6; index += 1) {
    state = applyGameAction(state, { type: 'threat-neutralized' });
  }
  assert.equal(state.prologue.threats, 6);
  assert.equal(state.scene, 'collapse');
});

test('первые пять угроз не заканчивают пролог', () => {
  let state = createGameState();
  for (let index = 0; index < 5; index += 1) {
    state = applyGameAction(state, { type: 'threat-neutralized' });
  }
  assert.equal(state.scene, 'prologue');
});

test('три ручных ящика открывают машину, но не запускают её', () => {
  let state = createGameState({ scene: 'warehouse' });
  for (let index = 0; index < 3; index += 1) {
    state = applyGameAction(state, { type: 'manual-crate-delivered' });
  }
  assert.equal(state.scene, 'machine');
  assert.equal(state.warehouse.manualDelivered, 3);
  assert.equal(state.arm.awake, false);
});

test('способности дают разные последствия', () => {
  const base = createGameState();
  const dash = applyGameAction(base, { type: 'dash', x: 1, y: 0 });
  const pulse = applyGameAction(base, { type: 'pulse' });
  const shield = applyGameAction(base, { type: 'shield' });

  assert.ok(dash.player.x > base.player.x);
  assert.ok(pulse.prologue.waveRadius > base.prologue.waveRadius);
  assert.ok(shield.player.shieldUntil > base.player.shieldUntil);
});

test('движение меняет положение игрока, но не выпускает его из мира', () => {
  const start = createGameState();
  const moved = stepGame(start, { moveX: -1, moveY: 1 }, 0.05);
  assert.ok(moved.player.x < start.player.x);
  assert.ok(moved.player.y > start.player.y);

  const edge = stepGame(createGameState({ player: { x: 10, y: 890 } }), { moveX: -1, moveY: 1 }, 0.05);
  assert.ok(edge.player.x >= 40);
  assert.ok(edge.player.y <= 860);
});

test('пролог не может запереть новичка дольше тридцати секунд', () => {
  const timedOut = stepGame(createGameState({ sceneTime: 29.98 }), {}, 0.05);
  assert.equal(timedOut.scene, 'collapse');
});

test('катастрофа заканчивается складом с выключенными силами', () => {
  const collapsed = createGameState({ scene: 'collapse', sceneTime: 2.48 });
  const next = stepGame(collapsed, {}, 0.25);
  assert.equal(next.scene, 'warehouse');
  assert.deepEqual(next.powers, { dash: false, pulse: false, shield: false });
  assert.equal(next.checkpoint, 'warehouse');
});

test('шаг мира ограничивает большой скачок времени', () => {
  const next = stepGame(createGameState(), {}, 4);
  assert.equal(next.sceneTime, 0.05);
});

test('действие берёт только близкий обычный ящик', () => {
  const state = createGameState({ scene: 'warehouse' });
  const far = applyGameAction(state, { type: 'pick-crate', crateId: 'box-01', distance: 200 });
  assert.equal(far.player.carrying, null);

  const near = applyGameAction(state, { type: 'pick-crate', crateId: 'box-01', distance: 30 });
  assert.equal(near.player.carrying, 'box-01');
  assert.equal(near.warehouse.crates.find(({ id }) => id === 'box-01').status, 'carried');
});

test('подсказка появляется только рядом с физическим действием', () => {
  const far = createGameState({ scene: 'warehouse', player: { x: 800, y: 800 } });
  assert.equal(getNearbyAction(far), null);
  const near = createGameState({ scene: 'warehouse', player: { x: 265, y: 560 } });
  assert.deepEqual(getNearbyAction(near), { type: 'pick-crate', crateId: 'box-01', label: 'ВЗЯТЬ ЯЩИК' });
});

test('ящик засчитывается только после доставки на палету', () => {
  let state = createGameState({ scene: 'warehouse' });
  state = applyGameAction(state, { type: 'pick-crate', crateId: 'box-01', distance: 20 });
  state = applyGameAction(state, { type: 'drop-crate', target: 'floor', x: 700, y: 700 });
  assert.equal(state.warehouse.manualDelivered, 0);
  assert.equal(state.warehouse.crates.find(({ id }) => id === 'box-01').status, 'floor');

  state = applyGameAction(state, { type: 'pick-crate', crateId: 'box-01', distance: 20 });
  state = applyGameAction(state, { type: 'drop-crate', target: 'pallet-a' });
  assert.equal(state.warehouse.manualDelivered, 1);
  assert.equal(state.warehouse.crates.find(({ id }) => id === 'box-01').status, 'pallet');
});

test('пробуждение руки не переносит ни одного ящика', () => {
  const state = applyGameAction(createGameState({ scene: 'machine' }), { type: 'arm-awake' });
  assert.equal(state.scene, 'automation');
  assert.equal(state.arm.awake, true);
  assert.equal(state.warehouse.autoDelivered, 0);
  assert.deepEqual(state.arm.queue, []);
});

test('принятая команда сначала создаёт очередь, а не готовый результат', () => {
  const awake = applyGameAction(createGameState({ scene: 'machine' }), { type: 'arm-awake' });
  const queued = applyGameAction(awake, {
    type: 'automation-queued',
    events: [{ type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' }],
  });
  assert.equal(queued.warehouse.autoDelivered, 0);
  assert.deepEqual(queued.arm.queue.map((event) => event.boxId), ['box-04']);
});

test('одна законченная команда переносит ровно один физический ящик', () => {
  let state = createGameState({ scene: 'automation', arm: { awake: true } });
  state = applyGameAction(state, {
    type: 'automation-queued',
    events: [{ type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' }],
  });
  state = stepGame(state, {}, 0.05);
  assert.equal(state.warehouse.autoDelivered, 0);
  assert.equal(state.arm.active.boxId, 'box-04');
  state = applyGameAction(state, { type: 'arm-transfer-finished', boxId: 'box-04' });
  assert.equal(state.warehouse.autoDelivered, 1);
  assert.equal(state.warehouse.crates.find(({ id }) => id === 'box-04').status, 'pallet');
});

test('красный ящик останавливает обычный маршрут после шести переносов', () => {
  const state = createGameState({ scene: 'automation', warehouse: { autoDelivered: 5 }, arm: { awake: true, active: { boxId: 'box-09', progress: .9 } } });
  const next = applyGameAction(state, { type: 'arm-transfer-finished', boxId: 'box-09' });
  assert.equal(next.warehouse.autoDelivered, 6);
  assert.equal(next.scene, 'red-crate');
  assert.equal(next.arm.blocked, true);
  assert.equal(next.warehouse.crates.find(({ id }) => id === 'red-01').status, 'blocked');
});

test('награда открывается только после осмотра красного ящика', () => {
  const blocked = createGameState({ scene: 'red-crate', arm: { blocked: true } });
  const ignored = applyGameAction(createGameState({ scene: 'automation' }), { type: 'inspect-red-crate' });
  assert.equal(ignored.scene, 'automation');
  const reward = applyGameAction(blocked, { type: 'inspect-red-crate' });
  assert.equal(reward.scene, 'reward');
  assert.equal(reward.checkpoint, 'reward');
});

test('контрольная точка красного ящика восстанавливает мир, а не только название сцены', () => {
  const restored = createCheckpointState('red-crate');
  assert.equal(restored.scene, 'red-crate');
  assert.equal(restored.arm.awake, true);
  assert.equal(restored.arm.blocked, true);
  assert.equal(restored.warehouse.manualDelivered, 3);
  assert.equal(restored.warehouse.autoDelivered, 6);
  assert.equal(restored.warehouse.crates.find(({ id }) => id === 'red-01').status, 'blocked');
});
