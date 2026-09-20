import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { validateWorldEvents } from '../src/game/events.js';

function automationScene(boxIds) {
  return {
    arm: { awake: true, queue: [], active: null },
    warehouse: {
      crates: boxIds.map((id) => ({ id, kind: 'normal', status: 'queued' })),
    },
  };
}

test('принимает только ящики текущей сцены и сохраняет порядок', () => {
  const result = validateWorldEvents([
    { type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' },
    { type: 'arm.move', boxId: 'box-05', targetId: 'pallet-a' },
  ], automationScene(['box-04', 'box-05']));
  assert.equal(result.ok, true);
  assert.deepEqual(result.events.map((event) => event.boxId), ['box-04', 'box-05']);
  assert.notEqual(result.events[0], result.events[1]);
});

const invalidCases = [
  null,
  'arm.move',
  [{ type: 'window.eval', boxId: 'box-04', targetId: 'pallet-a' }],
  [{ type: 'arm.move', boxId: 'unknown', targetId: 'pallet-a' }],
  [{ type: 'arm.move', boxId: 'box-04', targetId: 'other' }],
  [{ type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a', extra: true }],
  [
    { type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' },
    { type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' },
  ],
];

for (const raw of invalidCases) {
  test(`отклоняет событие ${JSON.stringify(raw)}`, () => {
    assert.equal(validateWorldEvents(raw, automationScene(['box-04'])).ok, false);
  });
}

test('не принимает больше событий, чем осталось физических ящиков', () => {
  const raw = Array.from({ length: 33 }, (_, index) => ({
    type: 'arm.move',
    boxId: `box-${index}`,
    targetId: 'pallet-a',
  }));
  assert.equal(validateWorldEvents(raw, automationScene(raw.map((event) => event.boxId))).ok, false);
});

test('Python-воркер ограничивает и сериализует события до передачи в мир', () => {
  const source = readFileSync(new URL('../src/pyworker.js', import.meta.url), 'utf8');
  assert.match(source, /eventVar/);
  assert.match(source, /len\(raw_events\) > 32/);
  assert.match(source, /json\.loads\(json\.dumps\(raw_events\)\)/);
});
