import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckpointState, applyGameAction, stepGame, getNearbyAction } from '../src/game/model.js';
import { getSceneCameraTarget } from '../src/game/viewport.js';

function advance(state, seconds) {
  for (let i = 0; i < Math.ceil(seconds / .05); i++) state = stepGame(state, {}, .05);
  return state;
}

function deliver(state, id) {
  state = applyGameAction(state, { type: 'pick-crate', crateId: id, distance: 0 });
  return applyGameAction(state, { type: 'drop-crate', target: 'pallet-a' });
}

// Breaks caught: an early boss, a motor started without a chip, duplicate wages,
// or the obsolete terminal/red-crate gate interrupting the approved first episode.
test('three paid manual deliveries precede the boss; waiting never starts the motor', () => {
  let state = createCheckpointState('warehouse');
  for (let count = 0; count < 3; count++) {
    state = advance(state, 8);
    assert.equal(state.warehouse.bossEntrance, false);
    assert.equal(state.arm.awake, false);
    assert.equal(state.warehouse.autoDelivered, 0);
    assert.equal(applyGameAction(state, { type: 'insert-python-chip' }), state);
    state = deliver(state, `box-0${count + 1}`);
  }
  assert.equal(state.warehouse.wage, 3600);
  assert.equal(state.warehouse.bossEntrance, true);
  assert.equal(state.arm.chip, 'missing');
  state = advance(state, 8);
  assert.equal(state.scene, 'chip');
  state = advance(state, 12);
  assert.equal(state.arm.awake, false);
  assert.equal(state.warehouse.wage, 3600);
});

test('chip finishes exactly inside its socket; the boss leaves before the chip falls', async () => {
  const { getChipPose, getBossBeat } = await import('../src/game/chip-scene.js');
  const state = createCheckpointState('chip');
  const seated = { ...state, arm: { ...state.arm, chip: 'installed' } };
  const pose = getChipPose(seated);
  assert.deepEqual(pose, { x: 1010, y: 636, scale: .7, rotation: 0 });
  const nearEnd = getChipPose({ ...state, sceneTime: 1.049, arm: { chip: 'inserting' } });
  assert.ok(Math.hypot(nearEnd.x - pose.x, nearEnd.y - pose.y) < 1);
  assert.equal(getBossBeat(2).fall, 0);
  assert.ok(getBossBeat(2).speaking);
  assert.equal(getBossBeat(4.9).bossVisible, false);
  assert.equal(getBossBeat(4.9).fall, 0);
  assert.equal(getBossBeat(5.1).doorOpen, 0);
  assert.ok(getBossBeat(5.1).fall > 0);
  assert.equal(getBossBeat(6.5).fall, 1);
});

test('seated chip starts paid automation and reaches reward without any code or red-box task', () => {
  let state = createCheckpointState('chip');
  assert.equal(state.arm.chip, 'held');
  state.player.x = 1010; state.player.y = 636;
  state = applyGameAction(state, getNearbyAction(state));
  assert.equal(state.arm.chip, 'inserting');
  assert.equal(applyGameAction(state, { type: 'insert-python-chip' }), state);
  state = advance(state, .5);
  assert.equal(state.arm.awake, false);
  assert.equal(state.warehouse.wage, 3600);
  state = advance(state, .6);
  assert.equal(state.arm.chip, 'installed');
  assert.equal(state.scene, 'automation');
  assert.equal(state.arm.awake, true);
  assert.equal(state.arm.active, null, 'leave time to see the seated chip before work');
  assert.equal(applyGameAction(state, { type: 'insert-python-chip' }), state);
  state = advance(state, 20);
  assert.equal(state.scene, 'reward');
  assert.equal(state.warehouse.autoDelivered, 6);
  assert.equal(state.warehouse.wage, 10800);
  assert.equal(state.arm.failure, null);
  const paid = state.warehouse.wage;
  state = applyGameAction(state, { type: 'insert-python-chip' });
  state = applyGameAction(state, { type: 'arm-transfer-finished', boxId: 'box-09' });
  state = advance(state, 10);
  assert.equal(state.warehouse.wage, paid);
});

test('resuming the installed-chip checkpoint never opens the obsolete coding gate', () => {
  const state = createCheckpointState('machine');
  assert.equal(state.scene, 'automation');
  assert.equal(state.arm.chip, 'installed');
  assert.equal(state.arm.awake, true);
  assert.equal(getNearbyAction(state), null);
  assert.equal(advance(state, 20).scene, 'reward');
  const reward = createCheckpointState('reward');
  assert.equal(reward.arm.chip, 'installed');
  assert.equal(reward.arm.blocked, false);
  assert.equal(reward.arm.startSource, 'chip');
});

test('phone camera keeps the insertion in view instead of jumping back to the worker', () => {
  let state = createCheckpointState('chip');
  state.player.x = 1300;
  state = applyGameAction(state, { type: 'insert-python-chip' });
  assert.equal(getSceneCameraTarget(state).x, 850);
  state = advance(state, 1.1);
  assert.equal(getSceneCameraTarget(state).x, 1010);
});
