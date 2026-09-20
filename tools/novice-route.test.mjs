import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckpointState, applyGameAction, stepGame, getNearbyAction } from '../src/game/model.js';
import { getInteractionTarget, navigateToTarget, placeWorldButton, buildWakeFragment } from '../src/game/wayfinding.js';
import { CRATE_LAYOUT, PALLET, CRATE_PAY } from '../src/game/config.js';
import { SOUND_RECIPES } from '../src/game/audio.js';
import { FUTURE_SCENES } from '../src/game/future-comic.js';
import { routePracticePacket } from '../src/game/friend-sandbox.js';

function walkAndUse(state, navigator = navigateToTarget) {
  for (let i = 0; i < 300; i++) {
    const target = getInteractionTarget(state);
    assert.ok(target, 'destination exists');
    const movement = navigator(state.player, target);
    if (movement.arrived) {
      const action = getNearbyAction(state);
      assert.equal(action?.type, target.type);
      return applyGameAction(state, { ...action, distance: 0 });
    }
    state = stepGame(state, movement, .05);
  }
  assert.fail('click-to-walk never arrived');
}

test('six object clicks carry three crates; empty floor never earns money', () => {
  let state = createCheckpointState('warehouse');
  for (let box = 1; box <= 3; box++) {
    state = walkAndUse(state);
    assert.ok(state.player.carrying);
    assert.equal(state.warehouse.wage, (box - 1) * CRATE_PAY);
    assert.equal(getNearbyAction(state), null, 'Space far from belt cannot dump cargo');
    state = walkAndUse(state);
    assert.equal(state.player.carrying, null);
    assert.equal(state.warehouse.manualDelivered, box);
    assert.equal(state.warehouse.wage, box * CRATE_PAY);
    assert.equal(state.warehouse.incomeSource, 'manual');
  }
  assert.equal(state.warehouse.bossEntrance, true);
  const unchanged = applyGameAction(state, { type: 'drop-crate', target: PALLET.id });
  assert.equal(unchanged.warehouse.wage, 3 * CRATE_PAY, 'duplicate drop has no payment');
});

test('negative control: the route verifier rejects a navigator that never moves', () => {
  assert.throws(() => walkAndUse(createCheckpointState('warehouse'), () => ({ moveX: 0, moveY: 0, arrived: false })), /never arrived/);
});

test('robot takes the same source and marks every paid delivery for the belt', () => {
  assert.ok(CRATE_LAYOUT.filter(c => c.kind === 'normal').every(c => c.x < 405 && c.y >= 445 && c.y <= 735));
  let state = applyGameAction(createCheckpointState('machine'), { type: 'first-command-accepted' });
  assert.equal(state.warehouse.autoDelivered, 0);
  for (let i = 0; i < 400 && !state.warehouse.autoDelivered; i++) state = stepGame(state, {}, .05);
  assert.equal(state.warehouse.autoDelivered, 1);
  assert.equal(state.warehouse.wage, 4 * CRATE_PAY);
  assert.equal(state.warehouse.incomeSource, 'robot');
  const delivered = state.warehouse.crates.find(c => c.id === 'box-04');
  assert.equal(delivered.x, PALLET.x);
  assert.ok(delivered.deliveredAt > 0);
  assert.equal(state.warehouse.incomeAt, delivered.deliveredAt);
  assert.ok(SOUND_RECIPES.cash.gain > SOUND_RECIPES.pickup.gain);
});

test('signal fragments form valid Python without asking for punctuation', () => {
  assert.equal(buildWakeFragment('', 'print'), 'print');
  assert.equal(buildWakeFragment('print', 'wake'), 'print("wake")');
  assert.equal(buildWakeFragment('bad', 'unknown'), 'bad');
});

test('offscreen object actions stay tappable and explicitly point to the destination', () => {
  for (const width of [320, 390, 844, 1440]) {
    for (const x of [-900, 200, 2000]) {
      const p = placeWorldButton({ x, y: 500 }, { scale: 1, offsetX: 0, offsetY: 0 }, { width, height: 844 });
      assert.ok(p.x >= 110 && p.x <= width - 110);
      assert.equal(p.direction, x < 122 ? 'left' : x > width - 122 ? 'right' : 'here');
    }
  }
});

test('future is three distinct ordered visions, not a disabled coming-soon button', () => {
  assert.deepEqual(FUTURE_SCENES.map(s => s.id), ['testing', 'pythonio', 'systems']);
  assert.equal(new Set(FUTURE_SCENES.map(s => s.image)).size, 3);
});

test('practice chat requires the right recipient and never uses real chats', () => {
  assert.equal(routePracticePacket('public').ok, false);
  assert.equal(routePracticePacket('unknown').ok, false);
  assert.equal(routePracticePacket('friends').ok, true);
});
