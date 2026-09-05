import test from 'node:test';
import assert from 'node:assert/strict';

import { applyGameAction, createCheckpointState, createGameState } from '../src/game/model.js';
import * as checkpointModule from '../src/game/save.js';

const { loadCheckpoint, resetCheckpoint, saveCheckpoint } = checkpointModule;

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
  assert.deepEqual(saveCheckpoint(storage, state), { ok: true, operation: 'save' });
  const saved = JSON.parse(storage.getItem('quequest.game.v1'));
  assert.deepEqual(saved, { version: 1, checkpoint: 'machine' });
});

test('отказ записи не прерывает игру и возвращает управляемый результат', () => {
  const storage = {
    setItem() { throw new Error('simulated quota exceeded'); },
  };

  assert.doesNotThrow(() => saveCheckpoint(storage, createCheckpointState('reward')));
  assert.deepEqual(
    saveCheckpoint(storage, createCheckpointState('reward')),
    { ok: false, operation: 'save' },
  );
});

test('отказ сброса не прерывает новый старт и возвращает управляемый результат', () => {
  const storage = {
    removeItem() { throw new Error('simulated storage denial'); },
  };

  assert.doesNotThrow(() => resetCheckpoint(storage));
  assert.deepEqual(resetCheckpoint(storage), { ok: false, operation: 'reset' });
});

test('контракт сохранения предупреждает один раз при повторных отказах', () => {
  const failures = [];
  const storage = {
    setItem() { throw new Error('simulated quota exceeded'); },
    removeItem() { throw new Error('simulated storage denial'); },
  };
  const persistence = checkpointModule.createCheckpointPersistence({
    storage,
    onFailure: (failure) => failures.push(failure),
  });

  persistence.save(createCheckpointState('machine'));
  persistence.save(createCheckpointState('reward'));
  persistence.reset();

  assert.deepEqual(failures, [{ ok: false, operation: 'save' }]);
});

test('неудачная запись награды не позволяет получить её повторно в этой партии', () => {
  const persistence = checkpointModule.createCheckpointPersistence({
    storage: { setItem() { throw new Error('simulated quota exceeded'); } },
  });
  const blocked = createCheckpointState('red-crate');
  const rewarded = applyGameAction(blocked, { type: 'inspect-red-crate' });

  assert.equal(rewarded.scene, 'reward');
  assert.equal(persistence.save(rewarded).ok, false);
  assert.strictEqual(
    applyGameAction(rewarded, { type: 'inspect-red-crate' }),
    rewarded,
  );
  assert.equal(rewarded.warehouse.wage, blocked.warehouse.wage);
});

for (const broken of ['{', 'null', '{"version":9,"checkpoint":"reward"}', '{"version":1,"checkpoint":"unknown"}']) {
  test(`повреждённая запись ${broken} даёт чистый старт`, () => {
    const storage = fakeStorage({ 'quequest.game.v1': broken });
    assert.deepEqual(loadCheckpoint(storage), { checkpoint: 'start' });
  });
}
