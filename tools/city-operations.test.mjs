import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import { OPS_ARCS, CITY_SERVICES, RELEASE_GUARD_CHECKS, evaluateOpsRelease, generateOpsShift } from '../src/game/city-operations.js';
import { createCampusProfile, markOperationsArc, markOperationsRollback, markOperationsShift, markOperationsCode, mergeCampusProfile } from '../src/game/campus-profile.js';

test('RELEASE WEEK is a multi-day living-system arc, not a terminology quiz',()=>{
  assert.equal(OPS_ARCS.length,5);
  assert.ok(CITY_SERVICES.length>=5);
  for(const arc of OPS_ARCS){
    assert.ok(arc.message.length>55);
    assert.ok(arc.symptom.length>20);
    assert.ok(arc.patches.length>=2);
    assert.ok(arc.patches.some(p=>p.good));
  }
});

test('a green test is evidence, not a successful production release',()=>{
  const arc=OPS_ARCS[0];
  const tested=evaluateOpsRelease(arc,{patchId:'adapter',tested:true});
  assert.equal(tested.ok,false);
  assert.equal(tested.phase,'tested');
  const shipped=evaluateOpsRelease(arc,{patchId:'adapter',tested:true,ship:true});
  assert.equal(shipped.ok,true);
  assert.equal(shipped.phase,'ship');
});

test('reckless Q-Bot patches can create blast radius while tests catch regression before city impact',()=>{
  const arc=OPS_ARCS[0];
  const direct=evaluateOpsRelease(arc,{patchId:'rename-hard',ship:true});
  assert.equal(direct.phase,'outage');
  assert.ok(direct.blast>=3);
  const tested=evaluateOpsRelease(arc,{patchId:'rename-hard',tested:true});
  assert.equal(tested.phase,'caught');
  assert.equal(tested.blast,0);
});

test('riskier good patches require canary and observation before full ship',()=>{
  const arc=OPS_ARCS[1];
  const noCanary=evaluateOpsRelease(arc,{patchId:'batch',tested:true,ship:true});
  assert.equal(noCanary.ok,false);
  assert.equal(noCanary.phase,'evidence');
  const canary=evaluateOpsRelease(arc,{patchId:'batch',tested:true,canary:true});
  assert.equal(canary.phase,'observe');
  const ready=evaluateOpsRelease(arc,{patchId:'batch',tested:true,canary:true,observed:true});
  assert.equal(ready.phase,'ready');
  const shipped=evaluateOpsRelease(arc,{patchId:'batch',tested:true,canary:true,observed:true,ship:true});
  assert.equal(shipped.ok,true);
});

test('generated release shifts are deterministic by seed',()=>{
  assert.deepEqual(generateOpsShift(41),generateOpsShift(41));
  assert.notDeepEqual(generateOpsShift(41),generateOpsShift(42));
});

test('operations progress is merge-safe and each durable reward is paid once',()=>{
  let left=createCampusProfile();
  left=markOperationsArc(left,'schema-v2','adapter',4,190);
  left=markOperationsRollback(left,'schema-v2',55);
  left=markOperationsShift(left,7,97,105);
  left=markOperationsShift(left,7,100,105);
  let right=createCampusProfile();
  right=markOperationsArc(right,'festival-load','batch',3,190);
  right=markOperationsShift(right,8,91,105);
  right=markOperationsCode(right,430);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.operations.completedArcs),new Set(['schema-v2','festival-load']));
  assert.deepEqual(new Set(merged.labs.operations.shiftSeeds),new Set([7,8]));
  assert.equal(merged.labs.operations.codeDeployed,true);
  assert.equal(left.awards['operations:shift:7'],105);
});

test('release guard reference satisfies real CPython behavioral checks',()=>{
  const source=String.raw`
def decide_release(patch,evidence):
    if evidence.get('tests') is False: return 'reject'
    if evidence.get('canary') is False: return 'rollback'
    if patch.get('risk',0)>=3 and evidence.get('canary') is None: return 'canary'
    if evidence.get('tests') is True and evidence.get('canary') is True: return 'deploy'
    return 'reject'
assert decide_release({'risk':1},{'tests':False,'canary':None}) in ('reject','rollback')
assert decide_release({'risk':5},{'tests':True,'canary':None})=='canary'
assert decide_release({'risk':3},{'tests':True,'canary':False})=='rollback'
assert decide_release({'risk':3},{'tests':True,'canary':True})=='deploy'
assert decide_release({'risk':1},{'tests':True,'canary':True})=='deploy'
print('RELEASE_GUARD_PASS')
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
  assert.match(proc.stdout,/RELEASE_GUARD_PASS/);
  assert.equal(RELEASE_GUARD_CHECKS.length,5);
});
