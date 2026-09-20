import test from 'node:test';
import assert from 'node:assert/strict';
import { createLinearGate, trainLinearGate, evaluateGate, predictLinearGate, createXorNetwork, trainXorNetwork, evaluateXorNetwork, NEURAL_PYTHON_SOURCE } from '../src/game/neural-foundry.js';

test('linear gate cannot solve XOR even after training', () => {
  const model=trainLinearGate(createLinearGate(),1000);
  const result=evaluateGate(model,predictLinearGate);
  assert.ok(result.accuracy < 1);
});

test('hidden layer learns XOR through real gradient updates', () => {
  const before=evaluateXorNetwork(createXorNetwork());
  const model=trainXorNetwork(createXorNetwork(),200,.8);
  const after=evaluateXorNetwork(model);
  assert.ok(after.accuracy > before.accuracy);
  assert.equal(after.correct,4);
  assert.ok(model.loss < .12);
});

test('neural reveal names forward loss and backprop rather than pretending', () => {
  assert.match(NEURAL_PYTHON_SOURCE,/tanh\(W1 @ x/);
  assert.match(NEURAL_PYTHON_SOURCE,/binary_cross_entropy/);
  assert.match(NEURAL_PYTHON_SOURCE,/backprop/);
  assert.match(NEURAL_PYTHON_SOURCE,/W1 -=/);
});
