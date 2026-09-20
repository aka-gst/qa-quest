import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import { CHRONICLE_ARCS, CHRONICLE_SERVICES, MIGRATION_POLICY_CHECKS, buildHistoryEcho, evaluateChronicleDecision, generateMaintenanceWindow } from '../src/game/city-chronicle.js';
import { createCampusProfile, markChronicleArc, markChronicleWindow, markChronicleCode, mergeCampusProfile } from '../src/game/campus-profile.js';

test('CITY CHRONICLE makes history playable instead of teaching technical-debt vocabulary first',()=>{
  assert.equal(CHRONICLE_ARCS.length,5);
  assert.ok(CHRONICLE_SERVICES.length>=5);
  for(const arc of CHRONICLE_ARCS){
    assert.ok(arc.message.length>60);
    assert.ok(arc.clues.length>=3);
    assert.ok(arc.decisions.length>=3);
    assert.ok(arc.decisions.some(x=>x.good));
    assert.ok(arc.memory.length>50);
  }
});



test("chronicle echoes the player's actual previous release decisions when available",()=>{
  const profile=createCampusProfile({labs:{operations:{acceptedPatches:['schema-v2:adapter'],rollbackArcs:[]}}});
  const echo=buildHistoryEcho(profile,'old-door');
  assert.match(echo,/выпустил именно ты|compatibility-adapter/i);
  const generic=buildHistoryEcho(createCampusProfile(),'old-door');
  assert.notEqual(generic,echo);
});

test('player must inspect history before a maintenance decision can succeed',()=>{
  const arc=CHRONICLE_ARCS[0];
  const blind=evaluateChronicleDecision(arc,{decisionId:'sunset',clues:['why']});
  assert.equal(blind.ok,false);
  assert.equal(blind.phase,'investigate');
  const informed=evaluateChronicleDecision(arc,{decisionId:'sunset',clues:['why','now']});
  assert.equal(informed.ok,true);
  assert.ok(informed.debt<arc.startingDebt);
});

test('not every safe compromise must erase all legacy immediately',()=>{
  const arc=CHRONICLE_ARCS.find(x=>x.id==='ghost-client');
  const forever=evaluateChronicleDecision(arc,{decisionId:'adapter-forever',clues:['lastseen','owner']});
  assert.equal(forever.ok,true);
  assert.ok(forever.debt>arc.startingDebt,'explicitly keeping compatibility may preserve people while accepting visible debt');
  assert.ok(forever.trust>0);
});

test('blame does not count as learning from an incident',()=>{
  const arc=CHRONICLE_ARCS.find(x=>x.id==='postmortem-night');
  const blame=evaluateChronicleDecision(arc,{decisionId:'blame',clues:['timeline','guardrail']});
  assert.equal(blame.ok,false);
  assert.equal(blame.phase,'consequence');
  assert.ok(blame.trust<0);
  const guard=evaluateChronicleDecision(arc,{decisionId:'guardrail',clues:['timeline','guardrail','human']});
  assert.equal(guard.ok,true);
  assert.ok(guard.resilience>0);
});

test('maintenance windows are deterministic and remix authored history',()=>{
  assert.deepEqual(generateMaintenanceWindow(31),generateMaintenanceWindow(31));
  assert.notDeepEqual(generateMaintenanceWindow(31),generateMaintenanceWindow(32));
  assert.ok(generateMaintenanceWindow(31).recommended.length>=1);
});

test('chronicle progress, postmortems and windows merge without duplicate XP',()=>{
  let left=createCampusProfile();
  left=markChronicleArc(left,'old-door','sunset',1,'old-door:sunset',220);
  left=markChronicleWindow(left,7,108,120);
  left=markChronicleWindow(left,7,115,120);
  let right=createCampusProfile();
  right=markChronicleArc(right,'magic-number','config',2,'magic-number:config',220);
  right=markChronicleWindow(right,8,101,120);
  right=markChronicleCode(right,480);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.chronicle.completedArcs),new Set(['old-door','magic-number']));
  assert.deepEqual(new Set(merged.labs.chronicle.windowSeeds),new Set([7,8]));
  assert.equal(merged.labs.chronicle.codeDeployed,true);
  assert.equal(merged.labs.chronicle.bestDebt,1);
  assert.equal(left.awards['chronicle:window:7'],120);
});

test('migration policy reference passes real CPython behavioral checks',()=>{
  const source=String.raw`
def compatibility_policy(client_version,supported,sunset=False):
    current=max(supported)
    if client_version==current: return 'native'
    if client_version not in supported: return 'reject'
    if sunset: return 'reject'
    return 'adapter'
assert compatibility_policy(3,[2,3],False)=='native'
assert compatibility_policy(2,[2,3],False)=='adapter'
assert compatibility_policy(9,[2,3],False)=='reject'
assert compatibility_policy(2,[2,3],True)=='reject'
assert compatibility_policy(3,[2,3],True)=='native'
print('MIGRATION_POLICY_PASS')
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
  assert.match(proc.stdout,/MIGRATION_POLICY_PASS/);
  assert.equal(MIGRATION_POLICY_CHECKS.length,5);
});
