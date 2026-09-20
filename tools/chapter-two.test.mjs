import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyGameAction,
  createCheckpointState,
  stepGame,
} from '../src/game/model.js';
import {
  ARM_TRANSFER_DURATION,
  RED_CRATE_FAILURE_DURATION,
  WAKE_REVEAL_DURATION,
} from '../src/game/config.js';

function advance(state, seconds) {
  let next = state;
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.05) {
    next = stepGame(next, {}, 0.05);
  }
  return next;
}

test('вторая смена начинается с потерянной кнопки, а не с повторной ручной работы', () => {
  const firstReward = createCheckpointState('reward');
  const second = applyGameAction(firstReward, { type: 'start-second-shift' });

  assert.equal(second.scene, 'machine');
  assert.equal(second.checkpoint, 'shift2');
  assert.equal(second.learning.chapter, 2);
  assert.equal(second.learning.printUnlocked, false);
  assert.equal(second.arm.awake, false);
  assert.equal(second.arm.startSource, 'command');
  assert.equal(second.warehouse.crates.filter((crate) => crate.kind === 'normal' && crate.status === 'queued').length, 6);
});

test('снятая кнопка сначала физически щёлкает и ничего не запускает', () => {
  const second = createCheckpointState('shift2');
  const pressed = applyGameAction(second, { type: 'press-loose-button' });

  assert.equal(pressed.scene, 'machine');
  assert.equal(pressed.arm.awake, false);
  assert.equal(pressed.warehouse.looseButtonTried, true);
});

test('print запускает вторую смену только после снятой кнопки и открывает навык, но ещё не учит if', () => {
  const second = createCheckpointState('shift2');
  const bypass = applyGameAction(second, { type: 'first-command-accepted' });
  assert.equal(bypass.scene, 'machine');
  const pressed = applyGameAction(second, { type: 'press-loose-button' });
  const running = applyGameAction(pressed, { type: 'first-command-accepted' });

  assert.equal(running.scene, 'automation');
  assert.equal(running.learning.printUnlocked, true);
  assert.equal(running.learning.forUnlocked, false);
  assert.equal(running.learning.ifUnlocked, false);
  assert.equal(running.arm.startSource, 'command');
  assert.equal(running.arm.queue.length, 6);
});

test('слепая автоматизация физически доезжает до красного груза и останавливается', () => {
  let state = createCheckpointState('shift2');
  state = applyGameAction(state, { type: 'press-loose-button' });
  state = applyGameAction(state, { type: 'first-command-accepted' });
  state = advance(state, WAKE_REVEAL_DURATION + ARM_TRANSFER_DURATION * 6 + RED_CRATE_FAILURE_DURATION + .4);

  assert.equal(state.scene, 'red-crate');
  assert.equal(state.checkpoint, 'red2');
  assert.equal(state.arm.blocked, true);
  assert.equal(state.warehouse.autoDelivered, 6);
  assert.equal(state.warehouse.crates.find((crate) => crate.kind === 'red').status, 'blocked');
});

test('осмотр красного груза создаёт маленькую задачу на if с видимыми белыми и красными ящиками', () => {
  const red = createCheckpointState('red2');
  const condition = applyGameAction(red, { type: 'inspect-red-crate' });

  assert.equal(condition.scene, 'condition');
  assert.equal(condition.checkpoint, 'condition');
  assert.equal(condition.learning.printUnlocked, true);
  assert.equal(condition.learning.forUnlocked, false);
  assert.equal(condition.learning.ifUnlocked, false);
  assert.equal(condition.warehouse.autoTarget, 3);
  assert.equal(condition.warehouse.crates.filter((crate) => crate.kind === 'normal').length, 3);
  assert.equal(condition.warehouse.crates.filter((crate) => crate.kind === 'red').length, 2);
});

test('правильное if-правило переносит только белые ящики и открывает раннего Q-Bot', () => {
  let state = createCheckpointState('condition');
  const events = state.warehouse.crates
    .filter((crate) => crate.kind === 'normal')
    .map((crate) => ({ type: 'arm.move', boxId: crate.id, targetId: 'pallet-a' }));
  state = applyGameAction(state, { type: 'condition-command-accepted', events });
  state = advance(state, .9 + ARM_TRANSFER_DURATION * 3 + .3);

  assert.equal(state.scene, 'reward');
  assert.equal(state.checkpoint, 'reward2');
  assert.equal(state.learning.printUnlocked, true);
  assert.equal(state.learning.forUnlocked, true);
  assert.equal(state.learning.ifUnlocked, true);
  assert.equal(state.learning.botUnlocked, true);
  assert.equal(state.warehouse.autoDelivered, 3);
  assert.equal(state.warehouse.crates.filter((crate) => crate.kind === 'red' && crate.status === 'queued').length, 2);
});
