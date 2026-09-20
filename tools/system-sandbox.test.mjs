import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateSandboxScenario, simulateSandbox } from '../src/game/system-sandbox.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('sandbox scenarios are deterministic by seed', () => {
  assert.deepEqual(generateSandboxScenario(17), generateSandboxScenario(17));
  assert.notDeepEqual(generateSandboxScenario(17), generateSandboxScenario(18));
});

test('a shared writer with multiple workers exposes collisions until lock is enabled', () => {
  const scenario = { seed:1, sourceRate:4, serviceRate:2, burstEvery:0, burstSize:0, sharedWrite:true, ticks:16 };
  const unsafe = simulateSandbox(scenario, { workers:2, buffer:12, lock:false });
  const safe = simulateSandbox(scenario, { workers:2, buffer:12, lock:true });
  assert.ok(unsafe.collisions > 0);
  assert.equal(unsafe.stable, false);
  assert.equal(safe.collisions, 0);
  assert.equal(safe.dropped, 0);
  assert.equal(safe.stable, true);
});

test('buffer absorbs bursts but cannot replace sustained throughput', () => {
  const sustained = { seed:2, sourceRate:5, serviceRate:2, burstEvery:0, burstSize:0, sharedWrite:false, ticks:16 };
  const warehouseOnly = simulateSandbox(sustained, { workers:1, buffer:30, lock:false });
  const workers = simulateSandbox(sustained, { workers:3, buffer:8, lock:false });
  assert.equal(warehouseOnly.stable, false);
  assert.ok(warehouseOnly.dropped > 0 || warehouseOnly.queueEnd > sustained.sourceRate);
  assert.equal(workers.stable, true);
});

test('endless shift has visible controls, timeline and mobile touch targets', () => {
  for (const id of ['systemSandbox','contractSandboxOpen','sandboxWorkers','sandboxBuffer','sandboxLock','sandboxTimeline','sandboxRun','sandboxNext']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.match(css, /\.sandbox-timeline/);
  assert.match(css, /\.sandbox-actions button,.contract-board__meta #contractSandboxOpen\{min-height:58px\}/);
});
