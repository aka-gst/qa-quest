import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTOMATION_ASYNC_SOURCE,
  FOUNDRY_ITEMS,
  resolveManualStation,
  resolvePipelineModule,
  resolveRaceChoice,
  resolveScaleChoice,
} from '../src/game/automation-foundry.js';

test('automation foundry uses visible file/text/table cargo', () => {
  assert.equal(FOUNDRY_ITEMS.length, 6);
  assert.deepEqual([...new Set(FOUNDRY_ITEMS.map(item => item.kind))], ['FILE', 'TEXT', 'TABLE']);
});

test('manual pipeline rewards the learned order without progress loss', () => {
  const wrong = resolveManualStation(0, 'save');
  assert.equal(wrong.ok, false);
  assert.equal(wrong.nextStep, 0);
  let step = 0;
  for (const station of ['read','route','save','read','route','save']) step = resolveManualStation(step, station).nextStep;
  assert.equal(step, 6);
  assert.equal(resolveManualStation(5, 'save').done, true);
});

test('pipeline wiring preserves the same physical order', () => {
  let selected = [];
  for (const node of ['read','route','save']) selected = resolvePipelineModule(selected, node).selected;
  assert.deepEqual(selected, ['read','route','save']);
  assert.equal(resolvePipelineModule(['read'], 'save').ok, false);
});

test('only adding a worker resolves throughput bottleneck', () => {
  assert.equal(resolveScaleChoice('source').ok, false);
  assert.equal(resolveScaleChoice('buffer').ok, false);
  const worker = resolveScaleChoice('worker');
  assert.equal(worker.ok, true);
  assert.equal(worker.throughput, '2/s');
  assert.ok(worker.queueAfter < worker.queueBefore);
});

test('only a lock protects shared ledger from the two-worker race', () => {
  assert.equal(resolveRaceChoice('sleep').ok, false);
  assert.equal(resolveRaceChoice('worker').ok, false);
  assert.equal(resolveRaceChoice('lock').ledgerSafe, true);
});

test('post-win source uses asyncio Queue, tasks, gather and Lock', () => {
  for (const token of ['asyncio.Queue()', 'asyncio.Lock()', 'asyncio.create_task', 'async with lock', 'queue.join()', 'asyncio.gather']) {
    assert.match(AUTOMATION_ASYNC_SOURCE, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

import fs from 'node:fs';
import { CHECKPOINTS } from '../src/game/config.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';

test('foundry and reward8 are resumable checkpoints with async skill gated by completion', () => {
  assert.ok(CHECKPOINTS.includes('foundry'));
  assert.ok(CHECKPOINTS.includes('reward8'));
  const foundry = createCheckpointState('foundry');
  assert.equal(foundry.learning.reliabilityUnlocked, true);
  assert.equal(foundry.learning.asyncUnlocked, false);
  const won = createCheckpointState('reward8');
  assert.equal(won.learning.asyncUnlocked, true);
});

test('chapter flow advances reward7 -> foundry -> reward8 without skipping the physical problem', () => {
  const finale = createCheckpointState('reward7');
  const foundry = applyGameAction(finale, { type: 'start-automation-foundry' });
  assert.equal(foundry.checkpoint, 'foundry');
  assert.equal(foundry.learning.asyncUnlocked, false);
  const reward = applyGameAction(foundry, { type: 'automation-foundry-complete' });
  assert.equal(reward.checkpoint, 'reward8');
  assert.equal(reward.learning.asyncUnlocked, true);
});

test('foundry DOM exposes queue, throughput, two workers, shared ledger and post-win code surface', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['automationFoundry','foundryQueue','foundryThroughput','foundryWorkerA','foundryWorkerB','foundryLedger','foundryCodeReveal']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /FILE/);
  assert.match(html, /TEXT/);
  assert.match(html, /TABLE/);
  assert.match(html, /id=["']foundryCodeReveal["'][^>]*hidden/);
});
