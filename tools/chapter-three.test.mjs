import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyGameAction,
  createCheckpointState,
  stepGame,
} from '../src/game/model.js';
import { ARM_TRANSFER_DURATION, NIGHT_QUEUE_LAYOUT } from '../src/game/config.js';

function advance(state, seconds) {
  let next = state;
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.05) {
    next = stepGame(next, {}, 0.05);
  }
  return next;
}

test('третья смена начинается только после освоенных print/for/if и открывает живую очередь', () => {
  const reward = createCheckpointState('reward2');
  const queue = applyGameAction(reward, { type: 'start-third-shift' });

  assert.equal(queue.scene, 'queue');
  assert.equal(queue.checkpoint, 'queue');
  assert.equal(queue.learning.chapter, 3);
  assert.equal(queue.learning.printUnlocked, true);
  assert.equal(queue.learning.forUnlocked, true);
  assert.equal(queue.learning.ifUnlocked, true);
  assert.equal(queue.learning.whileUnlocked, false);
  assert.equal(queue.learning.listUnlocked, false);
  assert.equal(queue.warehouse.crates.length, NIGHT_QUEUE_LAYOUT.length);
});

test('очередь хранит обычные и красные ящики как один изменяемый список', () => {
  const state = createCheckpointState('queue');
  assert.equal(state.warehouse.crates.filter((crate) => crate.kind === 'normal').length, 4);
  assert.equal(state.warehouse.crates.filter((crate) => crate.kind === 'red').length, 2);
  assert.equal(state.warehouse.autoTarget, 4);
});

test('принятый while-trace становится частью состояния и запускает только разрешённые перемещения', () => {
  let state = createCheckpointState('queue');
  const trace = state.warehouse.crates.map((crate, index) => ({
    index,
    boxId: crate.id,
    kind: crate.kind,
    decision: crate.kind === 'red' ? 'skip' : 'move',
  }));
  const events = state.warehouse.crates
    .filter((crate) => crate.kind === 'normal')
    .map((crate) => ({ type: 'arm.move', boxId: crate.id, targetId: 'pallet-a' }));

  state = applyGameAction(state, { type: 'queue-command-accepted', events, trace });
  assert.equal(state.scene, 'automation');
  assert.equal(state.arm.startSource, 'queue');
  assert.equal(state.arm.queue.length, 4);
  assert.equal(state.learning.listUnlocked, true);
  assert.equal(state.learning.whileUnlocked, true);
  assert.deepEqual(state.learning.queueTrace, trace);
});

test('ночная очередь заканчивается reward3, а красные остаются на линии', () => {
  let state = createCheckpointState('queue');
  const trace = state.warehouse.crates.map((crate, index) => ({
    index,
    boxId: crate.id,
    kind: crate.kind,
    decision: crate.kind === 'red' ? 'skip' : 'move',
  }));
  const events = state.warehouse.crates
    .filter((crate) => crate.kind === 'normal')
    .map((crate) => ({ type: 'arm.move', boxId: crate.id, targetId: 'pallet-a' }));
  state = applyGameAction(state, { type: 'queue-command-accepted', events, trace });
  state = advance(state, 1 + ARM_TRANSFER_DURATION * 4 + .5);

  assert.equal(state.scene, 'reward');
  assert.equal(state.checkpoint, 'reward3');
  assert.equal(state.learning.listUnlocked, true);
  assert.equal(state.learning.whileUnlocked, true);
  assert.equal(state.learning.botUnlocked, true);
  assert.equal(state.warehouse.autoDelivered, 4);
  assert.equal(state.warehouse.crates.filter((crate) => crate.kind === 'red' && crate.status === 'queued').length, 2);
});
