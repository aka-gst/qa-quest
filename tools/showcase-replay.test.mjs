import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReplay } from '../src/game/showcase-replay.js';

test('replay begins with engine shots and shield, ends with two paid human deliveries', () => {
  const replay = buildReplay();
  assert.ok(replay.frames.length > 180, 'not a still image');
  const first = replay.frames[0].state;
  assert.equal(first.scene, 'prologue');
  assert.ok(first.prologue.threats > 0);
  assert.ok(first.player.shieldUntil > first.elapsed);
  assert.ok(first.prologue.lastTargets.length > 0, 'real engine shot has a victim');
  assert.ok(first.prologue.lastShotAt > 0, 'real autofire ran');
  const warehouse = replay.frames.filter(f => f.state.scene === 'warehouse');
  assert.ok(warehouse.some(f => f.state.player.carrying));
  const last = replay.frames.at(-1).state;
  assert.equal(last.scene, 'warehouse');
  assert.equal(last.warehouse.manualDelivered, 2);
  assert.equal(last.warehouse.wage, 240);
  assert.equal(last.warehouse.autoDelivered, 0);
  assert.equal(last.arm.awake, false);
  assert.equal(last.player.carrying, null);
  assert.equal(last.warehouse.crates.filter(c => c.status === 'pallet').length, 2);
});

test('all frames repeat exactly and motion does not teleport within either shot', () => {
  const a = buildReplay(), b = buildReplay();
  assert.deepEqual(a, b);
  assert.ok(a.frames.length > 0);
  for (let i = 1; i < a.frames.length; i++) {
    const prev = a.frames[i-1].state, next = a.frames[i].state;
    if (prev.scene !== next.scene) continue; // one declared editorial cut
    assert.ok(Math.hypot(next.player.x-prev.player.x, next.player.y-prev.player.y) <= 10.34);
  }
});

test('delivery receipts require an observed legal pickup and proximity to the belt', () => {
  const {events} = buildReplay();
  assert.equal(events.filter(e => e.type === 'drop-crate').length, 2);
  const held = new Set();
  for (const e of events) {
    if (e.type === 'pick-crate') { assert.ok(e.distance <= 92); held.add(e.crateId); }
    if (e.type === 'drop-crate') {
      assert.ok(held.has(e.crateId)); held.delete(e.crateId);
      assert.ok(e.distance <= 127);
      assert.equal(e.afterWage-e.beforeWage, 120);
    }
  }
});
