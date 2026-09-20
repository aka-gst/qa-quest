import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {
  AUTOMATION_BRIEFS, COMMONS_FAMILIES, COMMONS_CODE_CHECKS, createEmptyProgram,
  evaluateAutomation, programSignature, parseProgramSignature, generateCommonsDay,
  evaluateCommonsDay, automationPython, commonsActionChoices,
} from '../src/game/automation-commons.js';

test('AUTOMATION COMMONS starts from human situations and composes reusable rules',()=>{
  assert.equal(AUTOMATION_BRIEFS.length,4);
  assert.equal(Object.keys(COMMONS_FAMILIES).length,7);
  assert.deepEqual(AUTOMATION_BRIEFS.map(x=>x.maxRules),[1,1,2,3]);
  for(const brief of AUTOMATION_BRIEFS){
    assert.ok(brief.brief.length>45);
    assert.ok(brief.events.length>=3);
  }
});



test('guided builder narrows actions to a few meaningful choices after the condition is known',()=>{
  const flow=commonsActionChoices('flow').map(x=>x.id);
  const effects=commonsActionChoices('effects').map(x=>x.id);
  assert.deepEqual(flow,['queue','scale','once']);
  assert.deepEqual(effects,['once','human','scale']);
  for(const family of Object.keys(COMMONS_FAMILIES)){
    const choices=commonsActionChoices(family);
    assert.ok(choices.length>=2 && choices.length<=3,`${family}: ${choices.length}`);
    for(const accepted of COMMONS_FAMILIES[family].accepted) assert.ok(choices.some(x=>x.id===accepted));
  }
});

test('a working visual automation passes without requiring optimization',()=>{
  const rush=AUTOMATION_BRIEFS[0];
  const program=[{when:'flow',action:'queue',memory:'none'}];
  const result=evaluateAutomation(rush,{program});
  assert.equal(result.ok,true);
  assert.equal(result.coverage,1);
  assert.ok(result.efficiency>0);
  const alternative=evaluateAutomation(rush,{program:[{when:'flow',action:'scale',memory:'none'}]});
  assert.equal(alternative.ok,true);
  assert.notEqual(alternative.cost,result.cost);
});

test('stateful idempotency requires the visible memory block',()=>{
  const brief=AUTOMATION_BRIEFS[1];
  const stateless=evaluateAutomation(brief,{program:[{when:'effects',action:'once',memory:'none'}]});
  assert.equal(stateless.ok,false);
  const stateful=evaluateAutomation(brief,{program:[{when:'effects',action:'once',memory:'seen'}]});
  assert.equal(stateful.ok,true);
});

test('saved blueprint signatures round-trip and combine into a city autopilot',()=>{
  const programs=[
    [{when:'flow',action:'queue',memory:'none'}],
    [{when:'effects',action:'once',memory:'seen'}],
    [{when:'knowledge',action:'refresh',memory:'none'},{when:'boundary',action:'validate',memory:'none'}],
    [{when:'authority',action:'policy',memory:'none'},{when:'resilience',action:'degraded',memory:'none'},{when:'stream',action:'stream',memory:'none'}],
  ];
  const sigs=programs.map((p,i)=>`b${i}|${programSignature(p)}`);
  assert.equal(programSignature(parseProgramSignature(programSignature(programs[2]))),programSignature(programs[2]));
  const day=generateCommonsDay(31);
  const result=evaluateCommonsDay(day,{blueprints:sigs});
  assert.equal(result.coverage,1);
  if(result.uniqueRules<=day.capacity) assert.equal(result.ok,true);
});

test('city days are deterministic and different seeds alter the live mix',()=>{
  assert.deepEqual(generateCommonsDay(9),generateCommonsDay(9));
  assert.notDeepEqual(generateCommonsDay(9),generateCommonsDay(10));
});

test('visual blueprint reveals an equivalent Python-shaped automation after meaning exists',()=>{
  const code=automationPython([{when:'effects',action:'once',memory:'seen'},{when:'flow',action:'queue',memory:'none'}]);
  assert.match(code,/def automation/);
  assert.match(code,/state\.setdefault\("seen", set\(\)\)/);
  assert.match(code,/return "queue"/);
});

test('master code autopilot reference can satisfy all seven behavioral contracts in CPython',()=>{
  const source=String.raw`
def autopilot(event, state):
    family=event.get("family")
    if family=="flow": return "queue"
    if family=="effects":
        seen=state.setdefault("seen",set()); event_id=event.get("id")
        if event_id in seen: return "ignore"
        seen.add(event_id); return "once"
    if family=="knowledge": return "provenance"
    if family=="boundary": return "validate"
    if family=="authority": return "policy"
    if family=="resilience": return "degraded"
    if family=="stream": return "stream"
    return "observe"
s={}; assert autopilot({"family":"flow"},s)=="queue"
s={}; assert (autopilot({"family":"effects","id":"A"},s),autopilot({"family":"effects","id":"A"},s))==("once","ignore")
assert autopilot({"family":"knowledge"},{})=="provenance"
assert autopilot({"family":"boundary"},{})=="validate"
assert autopilot({"family":"authority"},{})=="policy"
assert autopilot({"family":"resilience"},{})=="degraded"
assert autopilot({"family":"stream"},{})=="stream"
print("COMMONS_CODE_PASS")
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
  assert.match(proc.stdout,/COMMONS_CODE_PASS/);
  assert.equal(COMMONS_CODE_CHECKS.length,7);
});
