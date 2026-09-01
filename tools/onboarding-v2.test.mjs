import assert from 'node:assert/strict';
import test from 'node:test';

async function loadModule(path, label) {
  try {
    return await import(path);
  } catch (error) {
    assert.fail(`${label} is missing: ${error.code || error.message}`);
  }
}

test('story chooser keeps every story visible and marks exactly the selected one', async () => {
  const { buildStoryChoices } = await loadModule('../src/ui/onboarding-model.js', 'onboarding model');
  const themes = [
    { id: 'garage', name: 'Ночь в боксе', entryName: 'Автомобили', hook: 'car hook' },
    { id: 'ice', name: 'Взлом сети', entryName: 'Серверы и сети', hook: 'server hook' },
  ];

  assert.deepEqual(buildStoryChoices(themes, 'garage'), [
    { id: 'garage', name: 'Автомобили', hook: 'car hook', active: true },
    { id: 'ice', name: 'Серверы и сети', hook: 'server hook', active: false },
  ]);
});

test('automatic help stays quiet before failure three, then reveals hint and solution', async () => {
  const { autoHintLevel } = await loadModule('../src/ui/hint-policy.js', 'hint policy');

  assert.equal(autoHintLevel({ failedAttempts: 1, currentLevel: 0, hasSolution: true }), 0);
  assert.equal(autoHintLevel({ failedAttempts: 2, currentLevel: 0, hasSolution: true }), 0);
  assert.equal(autoHintLevel({ failedAttempts: 3, currentLevel: 0, hasSolution: true }), 1);
  assert.equal(autoHintLevel({ failedAttempts: 4, currentLevel: 0, hasSolution: true }), 1);
  assert.equal(autoHintLevel({ failedAttempts: 5, currentLevel: 0, hasSolution: true }), 2);
});

test('automatic help never hides manual help and never invents a missing solution', async () => {
  const { autoHintLevel } = await loadModule('../src/ui/hint-policy.js', 'hint policy');

  assert.equal(autoHintLevel({ failedAttempts: 1, currentLevel: 1, hasSolution: true }), 1);
  assert.equal(autoHintLevel({ failedAttempts: 5, currentLevel: 0, hasSolution: false }), 1);
  assert.equal(autoHintLevel({ failedAttempts: 20, currentLevel: 2, hasSolution: false }), 2);
});
