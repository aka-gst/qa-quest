import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdaptiveCoach,
  getConceptBridge,
  getInterestBeat,
  getManualIncomeCopy,
  getSkillRecorderBeat,
  normalizeExplainMode,
  formatPythonFailure,
} from '../src/game/engagement-director.js';

test('first three crates visibly become a learned physical pattern', () => {
  assert.deepEqual(getSkillRecorderBeat(0).cells, [false, false, false]);
  assert.deepEqual(getSkillRecorderBeat(2).cells, [true, true, false]);
  const complete = getSkillRecorderBeat(3);
  assert.equal(complete.complete, true);
  assert.match(complete.copy, /ПАТТЕРН ПОЙМАН/);
  assert.match(getManualIncomeCopy(1), /маршрут/i);
  assert.match(getManualIncomeCopy(3), /машине/i);
});

test('concept bridge always starts in the physical world and ends in Python', () => {
  assert.deepEqual(getConceptBridge('machine'), {
    world: 'КНОПКИ НЕТ',
    meaning: 'нужно отправить машине сигнал',
    python: 'print("wake")',
    question: 'Как сказать машине одно короткое сообщение?',
  });
  assert.match(getConceptBridge('condition').meaning, /пропускать/);
  assert.match(getConceptBridge('queue').python, /while/);
  assert.match(getConceptBridge('function').python, /def/);
  assert.equal(getConceptBridge('warehouse'), null);
});

test('guided help appears earlier than compact help but neither interrupts active progress', () => {
  const base = { scene:'warehouse', carrying:false, manualDelivered:0, failedAttempts:0 };
  assert.equal(getAdaptiveCoach({ ...base, stalledMs:5000, mode:'guided' }), null);
  assert.ok(getAdaptiveCoach({ ...base, stalledMs:7000, mode:'guided' }));
  assert.equal(getAdaptiveCoach({ ...base, stalledMs:7000, mode:'compact' }), null);
  assert.ok(getAdaptiveCoach({ ...base, stalledMs:15000, mode:'compact' }));
});

test('repeated code failures can reveal a direct construction hint without punishing the player', () => {
  const coach = getAdaptiveCoach({ scene:'machine', machineOpen:true, failedAttempts:3, stalledMs:1000, mode:'guided' });
  assert.equal(coach.level, 2);
  assert.match(coach.text, /print\("wake"\)/);
});

test('experience setting is conservative and interest beats form a varied early curve', () => {
  assert.equal(normalizeExplainMode('anything'), 'guided');
  assert.equal(normalizeExplainMode('compact'), 'compact');
  assert.deepEqual([
    getInterestBeat({scene:'warehouse', manualDelivered:0}),
    getInterestBeat({scene:'warehouse', manualDelivered:1}),
    getInterestBeat({scene:'chip'}),
    getInterestBeat({scene:'automation'}),
    getInterestBeat({scene:'red-crate'}),
    getInterestBeat({scene:'condition'}),
  ], ['ACTION','PATTERN','DISCOVERY','PAYOFF','SURPRISE','CHOICE']);
});


test('guided Python failure adds the runtime hint while compact keeps raw evidence', () => {
  const guided = formatPythonFailure({ errorText: 'NameError: x', errorHint: 'Проверь имя.', fallback: 'fallback', mode: 'guided' });
  const compact = formatPythonFailure({ errorText: 'NameError: x', errorHint: 'Проверь имя.', fallback: 'fallback', mode: 'compact' });
  assert.match(guided, /NameError: x.*Проверь имя/);
  assert.equal(compact, 'NameError: x');
});
