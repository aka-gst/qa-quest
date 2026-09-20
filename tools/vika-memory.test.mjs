import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIKA_MEMORY_STEPS,
  VIKA_STATE_SOURCE,
  resolveVikaMemory,
} from '../src/game/vika-memory.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';
import { CHECKPOINTS } from '../src/game/config.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const vikaHtml = html.match(/<section id="vikaMemory"[\s\S]*?<\/section>/)?.[0] ?? '';

test('Vika stays inside the preserved visual and dialogue boundary', () => {
  assert.match(html, /«А вот и ты»/);
  assert.match(html, /Синее парящее компьютерное лицо без тела/);
  assert.match(css, /\.vika-face/);
  assert.doesNotMatch(vikaHtml, /фамили|возраст|професси|романтич|сестра|подруга Вика/i);
});

test('three identical inputs require different actions because memory changes', () => {
  assert.equal(VIKA_MEMORY_STEPS.length, 3);
  assert.equal(new Set(VIKA_MEMORY_STEPS.map(({ signal }) => signal)).size, 1);
  assert.deepEqual(VIKA_MEMORY_STEPS.map(({ expectedAction }) => expectedAction), ['remember', 'verify', 'respond']);
  assert.deepEqual(VIKA_MEMORY_STEPS.map(({ before }) => before.seen), [0, 1, 2]);
  assert.deepEqual(VIKA_MEMORY_STEPS.map(({ before }) => before.trusted), [false, false, true]);
});

test('wrong memory action retries immediately and correct action advances state', () => {
  const wrong = resolveVikaMemory(0, 'verify');
  assert.equal(wrong.ok, false);
  assert.equal(wrong.nextStep, 0);
  assert.deepEqual(wrong.memory, { seen: 0, trusted: false });

  const first = resolveVikaMemory(0, 'remember');
  assert.equal(first.ok, true);
  assert.equal(first.nextStep, 1);
  assert.deepEqual(first.memory, { seen: 1, trusted: false });

  const last = resolveVikaMemory(2, 'respond');
  assert.equal(last.ok, true);
  assert.equal(last.done, true);
  assert.deepEqual(last.memory, { seen: 3, trusted: true });
});

test('dict syntax appears only as post-win representation of the physical memory panel', () => {
  assert.match(VIKA_STATE_SOURCE, /^memory = \{/m);
  assert.match(VIKA_STATE_SOURCE, /"seen": 0/);
  assert.match(VIKA_STATE_SOURCE, /"trusted": False/);
  assert.match(VIKA_STATE_SOURCE, /memory\["seen"\]/);
  assert.match(html, /физическая панель выше/);
  assert.match(html, /Q-BOT:[\s\S]*Вход был одинаковым\. Менялось то, что система уже знала/);
});

test('Vika checkpoints resume and unlock DICT only after completion', () => {
  assert.ok(CHECKPOINTS.includes('vika'));
  assert.ok(CHECKPOINTS.includes('reward6'));
  const reward5 = createCheckpointState('reward5');
  const started = applyGameAction(reward5, { type: 'start-vika-memory' });
  assert.equal(started.checkpoint, 'vika');
  assert.equal(started.learning.chapter, 6);
  assert.equal(started.learning.dictUnlocked, false);
  const finished = applyGameAction(started, { type: 'vika-memory-complete' });
  assert.equal(finished.checkpoint, 'reward6');
  assert.equal(finished.learning.dictUnlocked, true);
  assert.equal(createCheckpointState('vika').learning.dictUnlocked, false);
  assert.equal(createCheckpointState('reward6').learning.dictUnlocked, true);
});
