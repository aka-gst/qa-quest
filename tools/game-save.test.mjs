import test from 'node:test';
import assert from 'node:assert/strict';

import { createGameState } from '../src/game/model.js';
import {
  loadCheckpoint,
  resetCheckpoint,
  saveCheckpoint,
} from '../src/game/save.js';

function fakeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('сброс удаляет только состояние новой игры', () => {
  const storage = fakeStorage({
    'qaquest.v2': 'старый прогресс',
    'quequest.game.v1': '{"checkpoint":"machine"}',
    neighbor: 'не трогать',
  });
  resetCheckpoint(storage);
  assert.equal(storage.getItem('quequest.game.v1'), null);
  assert.equal(storage.getItem('qaquest.v2'), 'старый прогресс');
  assert.equal(storage.getItem('neighbor'), 'не трогать');
});

test('подложенный старый прогресс не меняет новый старт', () => {
  const storage = fakeStorage({ 'qaquest.v2': JSON.stringify({ tasks: { done: true } }) });
  assert.deepEqual(loadCheckpoint(storage), { checkpoint: 'start' });
});

test('сохраняется только безопасная граница, а не летящий ящик', () => {
  const storage = fakeStorage();
  const state = createGameState({
    scene: 'machine',
    checkpoint: 'machine',
    arm: { active: { boxId: 'box-04', progress: 0.7 } },
  });
  saveCheckpoint(storage, state);
  const saved = JSON.parse(storage.getItem('quequest.game.v1'));
  assert.deepEqual(saved, { version: 1, checkpoint: 'machine' });
});

for (const broken of ['{', 'null', '{"version":9,"checkpoint":"reward"}', '{"version":1,"checkpoint":"unknown"}']) {
  test(`повреждённая запись ${broken} даёт чистый старт`, () => {
    const storage = fakeStorage({ 'quequest.game.v1': broken });
    assert.deepEqual(loadCheckpoint(storage), { checkpoint: 'start' });
  });
}
