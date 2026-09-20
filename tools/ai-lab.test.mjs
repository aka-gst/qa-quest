import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTraining, predictNearest, updateActionValue, AI_KNN_SOURCE, AI_REWARD_SOURCE } from '../src/game/ai-lab.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';

test('transparent pixel classifier fails on an unseen class, then improves after one labeled seven', () => {
  const before = evaluateTraining([{id:'0a',label:'0'},{id:'1a',label:'1'}]);
  assert.equal(before.correct, 6);
  assert.equal(before.total, 9);
  assert.equal(predictNearest('7c', [{id:'0a',label:'0'},{id:'1a',label:'1'}]), '1');
  const after = evaluateTraining([{id:'0a',label:'0'},{id:'1a',label:'1'},{id:'7a',label:'7'}]);
  assert.ok(after.accuracy > before.accuracy);
  assert.equal(after.correct, 9);
});

test('human reward actually changes action value in the direction of feedback', () => {
  assert.equal(updateActionValue(0, 1), .5);
  assert.equal(updateActionValue(0, -1), -.5);
  assert.ok(updateActionValue(.5, 1) > .5);
});

test('AI source reveal names real data/eval mechanics instead of claiming a neural net', () => {
  assert.match(AI_KNN_SOURCE, /distance/);
  assert.match(AI_KNN_SOURCE, /training\.append/);
  assert.match(AI_REWARD_SOURCE, /reward/);
  assert.doesNotMatch(AI_KNN_SOURCE, /neural|torch|tensorflow/i);
});

test('AI checkpoint gates MODEL skill until lab completion', () => {
  let state = createCheckpointState('reward8');
  state = applyGameAction(state, {type:'start-ai-lab'});
  assert.equal(state.checkpoint, 'ai-lab');
  assert.equal(state.learning.aiUnlocked, false);
  state = applyGameAction(state, {type:'ai-lab-complete'});
  assert.equal(state.checkpoint, 'reward9');
  assert.equal(state.learning.aiUnlocked, true);
});
