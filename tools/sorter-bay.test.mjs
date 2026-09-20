import test from 'node:test';
import assert from 'node:assert/strict';
import { SORTER_RULES, evaluateSorterChoice, generateSorterScenario } from '../src/game/sorter-bay.js';

test('sorter scenarios are deterministic, observable and contain meaningful distractors', () => {
  const a = generateSorterScenario(77, 3);
  const b = generateSorterScenario(77, 3);
  assert.deepEqual(a, b);
  const correct = evaluateSorterChoice(a, a.targetId);
  assert.equal(correct.correct, true);
  assert.ok(correct.routes.some(route => route.actual === 'pass'));
  assert.ok(correct.routes.some(route => route.actual === 'hold'));
  assert.ok(a.choices.length >= 2);
  for (const id of a.choices.filter(id => id !== a.targetId)) {
    assert.equal(evaluateSorterChoice(a, id).correct, false, `${id} must create an observable counterexample`);
  }
});

test('difficulty progressively introduces compound boolean structure', () => {
  for (let seed = 1; seed < 20; seed += 1) {
    const easy = generateSorterScenario(seed, 1);
    assert.ok(SORTER_RULES.find(rule => rule.id === easy.targetId).difficulty <= 1);
    assert.ok(easy.choices.every(id => SORTER_RULES.find(rule => rule.id === id).difficulty <= 1));
  }
  const hardRules = SORTER_RULES.filter(rule => rule.difficulty === 3).map(rule => rule.code).join(' ');
  assert.match(hardRules, /\bor\b/);
  assert.match(hardRules, /\band\b/);
  assert.match(hardRules, /\bnot\b/);
});

test('wrong rule returns concrete misrouted boxes instead of a generic wrong answer', () => {
  const scenario = generateSorterScenario(91, 2);
  const wrongId = scenario.choices.find(id => id !== scenario.targetId);
  const result = evaluateSorterChoice(scenario, wrongId);
  assert.equal(result.correct, false);
  assert.ok(result.routes.some(route => route.actual !== route.expected));
  assert.ok(result.routes.every(route => route.box.id && route.actual && route.expected));
});
