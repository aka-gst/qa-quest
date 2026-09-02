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
