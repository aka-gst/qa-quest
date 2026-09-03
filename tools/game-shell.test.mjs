import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('страница запускает только новую игру', () => {
  assert.match(html, /src\/game\/main\.js/);
  assert.doesNotMatch(html, /src\/main\.js/);
  assert.doesNotMatch(html, /qaquest\.v2|lessonScreen|mapScreen/);
});

test('игровая оболочка содержит нужные органы управления', () => {
  for (const id of [
    'gameCanvas',
    'gameHud',
    'missionText',
    'actionButton',
    'powerDash',
    'powerPulse',
    'powerShield',
    'machinePanel',
    'codeInput',
    'runCode',
    'gameMessage',
    'soundToggle',
    'restartGame',
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `нет #${id}`);
  }
});

test('первый экран обещает игру, а не учебный курс', () => {
  assert.match(html, /Ты всё умел\. Теперь вспомни\./);
  assert.match(html, />\s*Двигайся\s*</);
  assert.doesNotMatch(html, /коротк|подробн|урок|обучени/i);
});
