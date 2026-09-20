import test from 'node:test';
import assert from 'node:assert/strict';

import { createTelemetry } from '../src/game/telemetry.js';

test('локальная телеметрия хранит только имя, время и числовое значение', () => {
  let now = 100;
  const telemetry = createTelemetry({ enabled: true, now: () => now });
  telemetry.mark('first-action');
  now = 180;
  telemetry.mark('python-ready', 80);
  assert.deepEqual(telemetry.events, [
    { name: 'first-action', at: 0 },
    { name: 'python-ready', at: 80, value: 80 },
  ]);
});

test('выключенная телеметрия не сохраняет даже имя события', () => {
  const telemetry = createTelemetry({ enabled: false });
  telemetry.mark('private-code', 12);
  assert.deepEqual(telemetry.events, []);
});

test('строки и объекты не проходят в поле value', () => {
  const telemetry = createTelemetry({ enabled: true });
  telemetry.mark('python-output', 'личный вывод');
  telemetry.mark('state', { player: 'name' });
  assert.equal('value' in telemetry.events[0], false);
  assert.equal('value' in telemetry.events[1], false);
});
