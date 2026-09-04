import test from 'node:test';
import assert from 'node:assert/strict';

import { getWakeFailureGuidance } from '../src/game/wake-help.js';

const nameError = {
  error: { type: 'NameError', text: "name 'WAKE' is not defined", line: 1 },
  checks: [],
};

test('первая ошибка не показывает новичку внутренности Python', () => {
  const guidance = getWakeFailureGuidance(1, nameError, 'print(WAKE)');
  assert.equal(guidance.message, 'Команда не распознана. Сверь знаки с тем, что видел на складе.');
  assert.doesNotMatch(guidance.message, /NameError|Python|строк|кавыч/i);
  assert.equal(guidance.prefill, null);
});

test('вторая ошибка подсказывает сверить форму, но не называет плакат', () => {
  const guidance = getWakeFailureGuidance(2, nameError, 'WAKE');
  assert.equal(guidance.message, 'Сигнал не совпал. Здесь важны все знаки, не только слово.');
  assert.doesNotMatch(guidance.message, /плакат|print\(|готов/i);
  assert.equal(guidance.prefill, null);
});

test('третья ошибка не стирает и не подменяет написанное игроком', () => {
  const guidance = getWakeFailureGuidance(3, nameError, 'WAKE');
  assert.equal(guidance.prefill, null);
  assert.equal(guidance.message, 'Почти. Сверь команду целиком и попробуй ещё раз.');
});
