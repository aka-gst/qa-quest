import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyGameAction,
  createGameState,
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
