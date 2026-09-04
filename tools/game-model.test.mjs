import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyGameAction,
  createCheckpointState,
  createGameState,
  getArmTransferPhase,
  getNearbyAction,
  stepGame,
} from '../src/game/model.js';
import {
  ARM_TRANSFER_DURATION,
  OTHER_MIND_AWAKE_HOLD_DURATION,
  REWARD_REVEAL_DURATION,
  WAKE_REVEAL_DURATION,
  WAREHOUSE_INTRO_DURATION,
} from '../src/game/config.js';

function advance(state, seconds, input = {}) {
  let next = state;
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.05) {
    next = stepGame(next, input, 0.05);
  }
  return next;
}

test('первая реплика Иного разума держится достаточно долго для чтения', () => {
  assert.ok(OTHER_MIND_AWAKE_HOLD_DURATION >= 1.3);
  assert.ok(OTHER_MIND_AWAKE_HOLD_DURATION <= 1.8);
});

test('Q-Bot получает чистый кадр до появления наградной панели', () => {
  assert.ok(REWARD_REVEAL_DURATION >= 1.5);
  assert.ok(REWARD_REVEAL_DURATION <= 2.2);
});

test('орудие само попадает в первую цель до половины секунды', () => {
  const beforeShot = advance(createGameState(), 0.3);
  assert.equal(beforeShot.prologue.threats, 0);

  const afterShot = advance(beforeShot, 0.2);
  assert.equal(afterShot.prologue.threats, 1);
  assert.equal(afterShot.prologue.lastTargets.length, 1);
  assert.ok(afterShot.prologue.lastShotAt >= 0.3);
});

test('автобой почти уничтожает рой и обрывается дисконнектом', () => {
  const disconnected = advance(createGameState(), 8.4);
  assert.equal(disconnected.scene, 'collapse');
  assert.equal(disconnected.prologue.threats, 22);
  assert.equal(disconnected.prologue.enemies.filter(({ alive }) => alive).length, 2);
});

test('между боем и складом есть заметный двухсекундный обрыв связи', () => {
  const disconnected = advance(createGameState({ scene: 'collapse' }), 2.3);
  assert.equal(disconnected.scene, 'collapse');

  const warehouse = advance(disconnected, 0.6);
  assert.equal(warehouse.scene, 'warehouse');
  assert.deepEqual(warehouse.powers, { dash: false, pulse: false, shield: false });
});

test('склад сначала разыгрывает вступление и не отдаёт управление раньше времени', () => {
  const start = createCheckpointState('warehouse');
  const frozen = advance(start, WAREHOUSE_INTRO_DURATION - 0.2, { moveX: 1 });
  assert.equal(frozen.player.x, start.player.x);
  assert.equal(getNearbyAction(frozen), null);

  const awake = advance(frozen, 0.3, { moveX: 1 });
  assert.equal(awake.warehouse.introComplete, true);
  assert.ok(awake.player.x > start.player.x);
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

test('катастрофа заканчивается складом с выключенными силами', () => {
  const collapsed = createGameState({ scene: 'collapse', sceneTime: 2.76 });
  const next = stepGame(collapsed, {}, 0.05);
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

test('после третьего ящика терминал открывается только рядом с ним', () => {
  const far = createCheckpointState('machine');
  assert.equal(getNearbyAction(far), null);

  const near = createCheckpointState('machine');
  near.player.x = 1010;
  near.player.y = 350;
  assert.deepEqual(getNearbyAction(near), { type: 'open-machine', label: 'ОТКРЫТЬ ТЕРМИНАЛ' });
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
  assert.equal(state.warehouse.lastDropDelivered, true);
  assert.equal(state.warehouse.lastDroppedId, 'box-01');
});

test('пробуждение руки не переносит ни одного ящика', () => {
  const state = applyGameAction(createGameState({ scene: 'machine' }), { type: 'arm-awake' });
  assert.equal(state.scene, 'automation');
  assert.equal(state.arm.awake, true);
  assert.equal(state.warehouse.autoDelivered, 0);
  assert.deepEqual(state.arm.queue, []);
});

test('первая принятая команда будит руку и ставит все оставшиеся ящики в очередь', () => {
  const machine = createCheckpointState('machine');
  const automated = applyGameAction(machine, { type: 'first-command-accepted' });

  assert.equal(automated.scene, 'automation');
  assert.equal(automated.arm.awake, true);
  assert.equal(automated.arm.wakeRevealRemaining, WAKE_REVEAL_DURATION);
  assert.equal(automated.warehouse.autoDelivered, 0);
  assert.deepEqual(
    automated.arm.queue.map(({ boxId, targetId }) => [boxId, targetId]),
    [
      ['box-04', 'pallet-a'],
      ['box-05', 'pallet-a'],
      ['box-06', 'pallet-a'],
      ['box-07', 'pallet-a'],
      ['box-08', 'pallet-a'],
      ['box-09', 'pallet-a'],
    ],
  );
});

test('после print wake машина сначала заметно просыпается и только потом берёт ящик', () => {
  let state = applyGameAction(createCheckpointState('machine'), { type: 'first-command-accepted' });
  state = advance(state, WAKE_REVEAL_DURATION - 0.2);
  assert.equal(state.arm.active, null);
  assert.equal(state.warehouse.autoDelivered, 0);

  state = advance(state, 0.25);
  assert.equal(state.arm.active?.boxId, 'box-04');
});

test('роборука движется читаемыми фазами и остаётся быстрее человека', () => {
  assert.ok(ARM_TRANSFER_DURATION >= 1.8 && ARM_TRANSFER_DURATION <= 2.4);
  assert.equal(getArmTransferPhase(0.1), 'pickup');
  assert.equal(getArmTransferPhase(0.5), 'carry');
  assert.equal(getArmTransferPhase(0.92), 'release');
});

test('шесть автоматических переносов видны по одному после отдельного пробуждения', () => {
  let state = applyGameAction(createCheckpointState('machine'), { type: 'first-command-accepted' });
  let elapsed = 0;
  const deliveryTimes = [];
  let delivered = 0;

  while (state.scene === 'automation' && elapsed < 20) {
    state = stepGame(state, {}, 1 / 60);
    elapsed += 1 / 60;
    if (state.warehouse.autoDelivered !== delivered) {
      delivered = state.warehouse.autoDelivered;
      deliveryTimes.push(elapsed);
    }
  }

  assert.equal(deliveryTimes.length, 6);
  assert.ok(deliveryTimes[0] >= WAKE_REVEAL_DURATION + ARM_TRANSFER_DURATION);
  const expected = WAKE_REVEAL_DURATION + ARM_TRANSFER_DURATION * 6;
  assert.ok(elapsed >= expected && elapsed <= expected + 0.25);
});

test('открытый терминал замораживает человека и роборуку', () => {
  const running = createGameState({
    scene: 'automation',
    player: { x: 900, y: 500 },
    arm: {
      awake: true,
      active: { type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a', progress: .25 },
    },
  });
  const paused = stepGame(running, { moveX: 1, moveY: 1 }, 1, { paused: true });

  assert.deepEqual(paused, running);
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

test('между автоматическими ящиками у руки нет кадра-телепорта в позу покоя', () => {
  const state = createGameState({
    scene: 'automation',
    warehouse: { autoDelivered: 0 },
    arm: {
      awake: true,
      wakeRevealRemaining: 0,
      active: { type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a', progress: .99 },
      queue: [{ type: 'arm.move', boxId: 'box-05', targetId: 'pallet-a' }],
    },
  });
  const next = stepGame(state, {}, .05);

  assert.equal(next.warehouse.autoDelivered, 1);
  assert.equal(next.arm.active?.boxId, 'box-05');
  assert.equal(next.arm.active?.progress, 0);
  assert.equal(next.warehouse.crates.find(({ id }) => id === 'box-05').status, 'arm');
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

test('иной разум просыпается только через наблюдаемую промежуточную фазу', () => {
  const base = createGameState({ scene: 'automation', arm: { awake: true } });
  assert.deepEqual(base.otherMind, { phase: 'sleeping', line: '' });

  const skipped = applyGameAction(base, {
    type: 'other-mind-awake',
    line: 'Я уже здесь.',
  });
  assert.deepEqual(skipped.otherMind, { phase: 'sleeping', line: '' });

  const waking = applyGameAction(base, { type: 'other-mind-waking', line: 'Я слышу' });
  assert.deepEqual(waking.otherMind, { phase: 'waking', line: 'Я слышу' });

  const awake = applyGameAction(waking, {
    type: 'other-mind-awake',
    line: 'Я слышу машину.',
  });
  assert.deepEqual(awake.otherMind, { phase: 'awake', line: 'Я слышу машину.' });
});

test('поздняя контрольная точка восстанавливает уже рождённое семя', () => {
  for (const checkpoint of ['red-crate', 'reward']) {
    const restored = createCheckpointState(checkpoint);
    assert.equal(restored.otherMind.phase, 'awake');
    assert.match(restored.otherMind.line, /слышу машину/i);
  }
});

test('молчание Gateway не превращается в ложное пробуждение', () => {
  const base = createGameState({ scene: 'automation', arm: { awake: true } });
  const waking = applyGameAction(base, { type: 'other-mind-waking' });
  const silent = applyGameAction(waking, {
    type: 'other-mind-silent',
    line: 'Разум сейчас молчит. Рука всё равно тебя услышала.',
  });
  assert.equal(silent.otherMind.phase, 'silent');
  assert.doesNotMatch(silent.otherMind.line, /token|body|stack|http/i);
});
