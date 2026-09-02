import assert from 'node:assert/strict';
import test from 'node:test';

test('unavailable Python returns a failed run without output or passed checks', async () => {
  const originalWorker = globalThis.Worker;
  const instances = [];

  class UnavailableWorker {
    constructor() {
      instances.push(this);
    }

    postMessage(message) {
      if (message.type === 'init') {
        queueMicrotask(() => this.onmessage({
          data: { type: 'fatal', message: 'локальный Python недоступен' },
        }));
      }
    }

    terminate() {}
  }

  globalThis.Worker = UnavailableWorker;
  try {
    const runnerModule = await import(`../src/runner.js?unavailable=${Date.now()}`);
    const result = await runnerModule.runPython({
      source: 'print("ECU online")',
      checks: [{ kind: 'stdout', mode: 'equals', value: 'ECU online' }],
    });

    assert.equal(instances.length, 1);
    assert.equal(result.stdout, '');
    assert.equal(result.error.type, 'PythonUnavailable');
    assert.match(result.error.text, /локальный Python недоступен/);
    assert.deepEqual(result.checks, [{ ok: false, detail: '' }]);
  } finally {
    globalThis.Worker = originalWorker;
  }
});

test('a worker that fails after ready still returns a failed run', async () => {
  const originalWorker = globalThis.Worker;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;

  class FailingAfterReadyWorker {
    postMessage(message) {
      if (message.type === 'init') {
        queueMicrotask(() => this.onmessage({ data: { type: 'ready', version: '3.14.0' } }));
      }
      if (message.type === 'run') {
        queueMicrotask(() => this.onmessage({
          data: { type: 'fatal', message: 'Python остановился во время запуска' },
        }));
      }
    }

    terminate() {}
  }

  globalThis.Worker = FailingAfterReadyWorker;
  globalThis.setTimeout = () => 0;
  globalThis.clearTimeout = () => {};
  try {
    const runnerModule = await import(`../src/runner.js?after-ready=${Date.now()}`);
    const result = await runnerModule.runPython({
      source: 'print("ECU online")',
      checks: [{ kind: 'stdout', mode: 'equals', value: 'ECU online' }],
    });

    assert.equal(result.stdout, '');
    assert.equal(result.error.type, 'PythonUnavailable');
    assert.match(result.error.text, /остановился во время запуска/);
    assert.deepEqual(result.checks, [{ ok: false, detail: '' }]);
  } finally {
    globalThis.Worker = originalWorker;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});
