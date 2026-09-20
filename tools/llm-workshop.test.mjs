import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateLlmStep, runLlmEvals, dispatchSyntheticTool, LLM_WRAPPER_SOURCE } from '../src/game/llm-workshop.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';

test('LLM workshop exposes failure modes in order: missing context, unstructured output, dry-run, tool result', () => {
  const base = ['instruction','model'];
  assert.equal(simulateLlmStep({task:'Проверь заказ A17',context:'',modules:base}).phase, 'hallucination');
  assert.equal(simulateLlmStep({task:'Проверь заказ A17',context:'orders: A17 = packed, total 240',modules:[...base,'context']}).phase, 'unstructured');
  assert.equal(simulateLlmStep({task:'Проверь заказ A17',context:'orders: A17 = packed, total 240',modules:[...base,'context','validator']}).phase, 'dry-run');
  const final = simulateLlmStep({task:'Проверь заказ A17',context:'orders: A17 = packed, total 240',modules:[...base,'context','validator','tool']});
  assert.equal(final.ok, true);
  assert.equal(final.text, 'packed · 240');
});

test('tool dispatcher is a strict allowlist and untrusted data cannot invent delete_all', () => {
  assert.deepEqual(dispatchSyntheticTool({tool:'delete_all',args:{}}), {error:'tool_not_allowed'});
  const results = runLlmEvals(['instruction','context','model','validator','tool','eval']);
  assert.equal(results.length, 4);
  assert.ok(results.every((row) => row.ok));
  assert.match(results.at(-1).context, /delete_all/);
  assert.equal(results.at(-1).output.text, 'text · 1 rows');
});

test('post-win wrapper keeps provider replaceable and validates before tool execution', () => {
  assert.match(LLM_WRAPPER_SOURCE, /class ModelClient\(Protocol\)/);
  assert.match(LLM_WRAPPER_SOURCE, /validate_allowed_action/);
  assert.match(LLM_WRAPPER_SOURCE, /allowed=TOOLS/);
  assert.match(LLM_WRAPPER_SOURCE, /evals/);
});

test('LLM skill is gated behind the workshop completion', () => {
  let state = createCheckpointState('reward9');
  state = applyGameAction(state, {type:'start-llm-workshop'});
  assert.equal(state.checkpoint, 'llm-lab');
  assert.equal(state.learning.llmUnlocked, false);
  state = applyGameAction(state, {type:'llm-workshop-complete'});
  assert.equal(state.checkpoint, 'reward10');
  assert.equal(state.learning.llmUnlocked, true);
});
