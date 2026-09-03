import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createFakeGateway,
  createMachineListeningEvent,
  createOtherMindRuntime,
  validateCapabilityEvent,
} from '../src/game/other-mind.js';

const EXPECTED_EVENT = Object.freeze({
  version: 1,
  type: 'capability.unlocked',
  capability: 'machine-listening',
  mission: 'warehouse-arm',
});

const EXPECTED_REQUEST = Object.freeze({
  model: 'local-fake-other-mind',
  stream: true,
  messages: [
    {
      role: 'system',
      content: 'Ты — только что проснувшееся семя иного разума. Ответь одной короткой фразой без команд, файлов и личных данных.',
    },
    {
      role: 'user',
      content: 'Открыта способность machine-listening в миссии warehouse-arm.',
    },
  ],
});

test('создаёт и принимает только точное синтетическое событие способности', () => {
  const event = createMachineListeningEvent();
  assert.deepEqual(event, EXPECTED_EVENT);
  assert.deepEqual(validateCapabilityEvent(event), {
    ok: true,
    event: EXPECTED_EVENT,
    error: null,
  });
});

const rejectedEvents = [
  null,
  [],
  { ...EXPECTED_EVENT, source: 'print("WAKE")' },
  { ...EXPECTED_EVENT, privateWorkNotes: 'secret' },
  { ...EXPECTED_EVENT, path: '/Users/name/file' },
  { ...EXPECTED_EVENT, token: 'test-token' },
  { ...EXPECTED_EVENT, capability: 'machine-listеning' },
  { ...EXPECTED_EVENT, capability: 'filesystem' },
  { ...EXPECTED_EVENT, version: 2 },
];

for (const raw of rejectedEvents) {
  test(`отклоняет до Gateway событие ${JSON.stringify(raw)}`, async () => {
    const gateway = createFakeGateway();
    const runtime = createOtherMindRuntime({ gateway });
    const result = await runtime.unlock(raw);
    assert.equal(result.ok, false);
    assert.equal(gateway.snapshot().calls, 0);
    assert.deepEqual(runtime.snapshot().transitions, ['sleeping']);
  });
}

test('передаёт Gateway один точный очищенный запрос и собирает поток', async () => {
  const gateway = createFakeGateway({ reply: 'Я слышу машину. Теперь научи меня понимать её.', chunks: 4 });
  const runtime = createOtherMindRuntime({ gateway });

  const result = await runtime.unlock(createMachineListeningEvent());

  assert.deepEqual(gateway.snapshot(), { calls: 1, lastRequest: EXPECTED_REQUEST });
  assert.equal(result.ok, true);
  assert.deepEqual(runtime.snapshot(), {
    events: 1,
    gatewayCalls: 1,
    transitions: ['sleeping', 'waking', 'awake'],
    phase: 'awake',
    line: 'Я слышу машину. Теперь научи меня понимать её.',
  });
});

test('два одновременных unlock не создают второе событие или вызов', async () => {
  const gateway = createFakeGateway({ delay: 5 });
  const runtime = createOtherMindRuntime({ gateway });
  const event = createMachineListeningEvent();

  const [first, second] = await Promise.all([runtime.unlock(event), runtime.unlock(event)]);

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(runtime.snapshot().events, 1);
  assert.equal(gateway.snapshot().calls, 1);
  assert.deepEqual(runtime.snapshot().transitions, ['sleeping', 'waking', 'awake']);
});

test('отказ Gateway не изображает пробуждение и не раскрывает тело ошибки', async () => {
  const gateway = createFakeGateway({ fail: 'token=secret body={privateWorkNotes}' });
  const runtime = createOtherMindRuntime({ gateway });

  const result = await runtime.unlock(createMachineListeningEvent());

  assert.deepEqual(result, {
    ok: false,
    duplicate: false,
    phase: 'silent',
    line: 'Разум сейчас молчит. Рука всё равно тебя услышала.',
    error: 'gateway-unavailable',
  });
  assert.doesNotMatch(JSON.stringify(result), /secret|privateWorkNotes|token=/);
  assert.deepEqual(runtime.snapshot().transitions, ['sleeping', 'waking', 'silent']);
});
