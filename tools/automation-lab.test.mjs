import test from 'node:test';
import assert from 'node:assert/strict';
import { AUTOMATION_MISSIONS, evaluateAutomationMission, AUTOMATION_PYTHON_SOURCE } from '../src/game/automation-lab.js';

test('real-world automation missions cover files csv http and model adapters',()=>{
  assert.deepEqual(AUTOMATION_MISSIONS.map(m=>m.id),['inbox','csv','http','provider']);
});

test('retry without idempotency stays dangerous after an unknown HTTP result',()=>{
  const mission=AUTOMATION_MISSIONS.find(m=>m.id==='http');
  const bad=evaluateAutomationMission(mission,['timeout','retry','log']);
  assert.equal(bad.ok,false);
  assert.equal(bad.hazard,true);
  const good=evaluateAutomationMission(mission,['timeout','retry','idempotency','log']);
  assert.equal(good.ok,true);
});

test('provider wrapper requires adapter schema redaction and budget without leaking demo secret',()=>{
  const mission=AUTOMATION_MISSIONS.find(m=>m.id==='provider');
  const bad=evaluateAutomationMission(mission,['adapter','schema','budget']);
  assert.equal(bad.ok,false);
  assert.match(bad.trace.join('\n'),/Bearer sk-demo/);
  const good=evaluateAutomationMission(mission,['adapter','schema','redact','budget']);
  assert.equal(good.ok,true);
  assert.doesNotMatch(good.trace.join('\n'),/sk-demo/);
});

test('post-win automation Python uses real standard-library boundaries and provider Protocol',()=>{
  assert.match(AUTOMATION_PYTHON_SOURCE,/Path/);
  assert.match(AUTOMATION_PYTHON_SOURCE,/csv\.DictReader/);
  assert.match(AUTOMATION_PYTHON_SOURCE,/Protocol/);
  assert.match(AUTOMATION_PYTHON_SOURCE,/idempotency_key/);
  assert.match(AUTOMATION_PYTHON_SOURCE,/Authorization/);
});
