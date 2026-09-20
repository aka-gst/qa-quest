import test from 'node:test';
import assert from 'node:assert/strict';

import { isWakeSignal, normalizeWakeSource } from '../src/game/machine.js';

test('первый сигнал принимает слово wake в любом регистре', () => {
  for (const output of ['WAKE\n', 'wake\n', 'Wake\n', 'wAkE\n']) {
    assert.equal(isWakeSignal(output), true, output);
  }
});

test('похожее слово не пробуждает машину', () => {
  for (const output of ['', 'awake', 'WAKE UP', 'wake wake']) {
    assert.equal(isWakeSignal(output), false, output);
  }
});

test('айфонные кавычки не ломают первое слово машины', () => {
  assert.equal(normalizeWakeSource('print(“wake”)'), 'print("wake")');
  assert.equal(normalizeWakeSource('print(«wake»)'), 'print("wake")');
  assert.equal(normalizeWakeSource('print("wake")'), 'print("wake")');
});
