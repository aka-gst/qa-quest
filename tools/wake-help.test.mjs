import test from 'node:test';
import assert from 'node:assert/strict';

import { getWakeFailureGuidance } from '../src/game/wake-help.js';

const nameError = {
  error: { type: 'NameError', text: "name 'WAKE' is not defined", line: 1 },
  checks: [],
};

test('первая ошибка объясняет причину, а не выдаёт готовый ответ', () => {
  const guidance = getWakeFailureGuidance(1, nameError, 'print(WAKE)');
  assert.match(guidance.message, /WAKE — это текст/);
  assert.match(guidance.message, /кавыч/);
  assert.doesNotMatch(guidance.message, /print\(["']WAKE["']\)/);
  assert.equal(guidance.prefill, null);
});

test('вторая ошибка возвращает игрока к упавшему плакату', () => {
  const guidance = getWakeFailureGuidance(2, nameError, 'WAKE');
  assert.match(guidance.message, /плакат/i);
  assert.equal(guidance.prefill, null);
});

test('третья ошибка оставляет игроку дописать команду самому', () => {
  const guidance = getWakeFailureGuidance(3, nameError, 'WAKE');
  assert.equal(guidance.prefill, 'print("');
  assert.match(guidance.message, /допиши/i);
});
