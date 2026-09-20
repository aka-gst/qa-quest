import test from 'node:test';
import assert from 'node:assert/strict';

import { FUNCTION_LAYOUT } from '../src/game/config.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';

const VALID_TRACE = FUNCTION_LAYOUT.map((crate, index) => ({
  index,
  boxId: crate.id,
  kind: crate.kind,
  line: crate.line,
  decision: crate.kind === 'red' ? 'skip' : 'move',
}));
const VALID_EVENTS = FUNCTION_LAYOUT
  .filter((crate) => crate.kind === 'normal')
  .map((crate) => ({ type: 'arm.move', boxId: crate.id, targetId: 'pallet-a' }));

test('четвёртая смена открывается только после reward3 и показывает две линии', () => {
  const reward = createCheckpointState('reward3');
  const next = applyGameAction(reward, { type: 'start-fourth-shift' });
  assert.equal(next.scene, 'function');
  assert.equal(next.checkpoint, 'function');
  assert.equal(next.learning.chapter, 4);
  assert.equal(next.learning.funcUnlocked, false);
  assert.deepEqual([...new Set(next.warehouse.crates.map((crate) => crate.line))].sort(), ['A', 'B']);
});

test('принятая функция запускает один модуль для обеих линий и сохраняет trace', () => {
  let state = createCheckpointState('function');
  state = applyGameAction(state, { type: 'function-command-accepted', events: VALID_EVENTS, trace: VALID_TRACE });
  assert.equal(state.scene, 'automation');
  assert.equal(state.arm.startSource, 'function');
  assert.equal(state.arm.queue.length, 4);
  assert.equal(state.learning.funcUnlocked, true);
  assert.deepEqual(state.learning.functionTrace, VALID_TRACE);
});

test('reward4 сохраняет красные ящики на линиях и разблокирует функцию', () => {
  const state = createCheckpointState('reward4');
  assert.equal(state.learning.funcUnlocked, true);
  assert.equal(state.warehouse.crates.filter((crate) => crate.kind === 'red' && crate.status === 'queued').length, 2);
  assert.equal(state.warehouse.crates.filter((crate) => crate.kind === 'normal' && crate.status === 'pallet').length, 4);
});
