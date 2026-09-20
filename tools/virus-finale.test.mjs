import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIRUS_FAILURES,
  VIRUS_RESILIENCE_SOURCE,
  resolveVirusFailure,
} from '../src/game/virus-finale.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';
import { CHECKPOINTS } from '../src/game/config.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('finale breaks four software assumptions instead of using HP', () => {
  assert.equal(VIRUS_FAILURES.length, 4);
  assert.deepEqual(VIRUS_FAILURES.map(({ id }) => id), ['case-type', 'case-missing', 'case-timeout', 'case-order']);
  assert.match(html, /Вирус ломает не HP\. Он ломает предположения/);
  assert.match(html, /неверный тип, пропуск, таймаут и нарушенный порядок/i);
  assert.doesNotMatch(html, /ip-адрес|ssh|парол|логин|токен доступа|эксплойт/i);
});

test('each synthetic failure has one matching recovery and wrong choice retries', () => {
  for (const [index, failure] of VIRUS_FAILURES.entries()) {
    const correct = resolveVirusFailure(index, failure.recovery);
    assert.equal(correct.ok, true);
    assert.equal(correct.nextCase, index + 1);
    const wrong = VIRUS_FAILURES.find(({ recovery }) => recovery !== failure.recovery).recovery;
    const retried = resolveVirusFailure(index, wrong);
    assert.equal(retried.ok, false);
    assert.equal(retried.nextCase, index);
  }
  assert.equal(resolveVirusFailure(3, VIRUS_FAILURES[3].recovery).done, true);
});

test('post-win code connects tests, try/except and log to the recovered failures', () => {
  assert.match(VIRUS_RESILIENCE_SOURCE, /log = \[\]/);
  assert.match(VIRUS_RESILIENCE_SOURCE, /^\s+try:/m);
  assert.match(VIRUS_RESILIENCE_SOURCE, /^\s+except \(TypeError, KeyError, TimeoutError, ValueError\) as error:/m);
  assert.match(VIRUS_RESILIENCE_SOURCE, /log\.append/);
  assert.match(VIRUS_RESILIENCE_SOURCE, /^for case in tests:/m);
  assert.match(html, /tests[\s\S]{0,120}try\/except[\s\S]{0,120}log/i);
});

test('virus checkpoints resume and unlock reliability only after finale completion', () => {
  assert.ok(CHECKPOINTS.includes('virus'));
  assert.ok(CHECKPOINTS.includes('reward7'));
  const reward6 = createCheckpointState('reward6');
  const started = applyGameAction(reward6, { type: 'start-virus-finale' });
  assert.equal(started.checkpoint, 'virus');
  assert.equal(started.learning.chapter, 7);
  assert.equal(started.learning.reliabilityUnlocked, false);
  const finished = applyGameAction(started, { type: 'virus-finale-complete' });
  assert.equal(finished.checkpoint, 'reward7');
  assert.equal(finished.learning.reliabilityUnlocked, true);
  assert.equal(createCheckpointState('virus').learning.reliabilityUnlocked, false);
  assert.equal(createCheckpointState('reward7').learning.reliabilityUnlocked, true);
});
