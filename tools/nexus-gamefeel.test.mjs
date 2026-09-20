import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPhysicalLine, companionMemoryRack, companionPresentation, evaluateNexusRemix, plainModule } from '../src/game/nexus-gamefeel.js';
import { companionRecommendation, simulateNexusBlueprint } from '../src/game/factory-nexus.js';
import { createCampusProfile, markNexusMission, markNexusRemix, mergeCampusProfile } from '../src/game/campus-profile.js';

test('beginner copy explains behavior before jargon',()=>{
  assert.match(plainModule('queue'),/подождать/);
  assert.match(plainModule('idempotency'),/дважды/);
  assert.doesNotMatch(plainModule('idempotency'),/^IDEMPOTENCY$/);
});

test('Q-Bot presentation begins uncertain and can surface dangerous overconfidence',()=>{
  const p=createCampusProfile();
  const rec=companionRecommendation('ghost-write',{});
  const fresh=companionPresentation({missionId:'ghost-write',profile:p,session:{},recommendation:rec,mode:'guided'});
  assert.equal(fresh.headline,'Я ЕЩЁ УЧУСЬ');
  assert.match(fresh.line,/Проверишь меня/);
  const drift=companionPresentation({missionId:'ghost-write',profile:p,session:{'ghost-write':{good:0,bad:2}},recommendation:{module:'retry',correct:false},mode:'guided'});
  assert.equal(drift.state,'drift');
  assert.match(drift.line,/Не верь уверенности/);
});

test('Q-Bot memory rack is visual history, not a fake global intelligence score',()=>{
  let p=createCampusProfile();
  p=markNexusMission(p,'surge',100,'surge:queue',150,['filter','route','queue']);
  const rack=companionMemoryRack(p);
  assert.equal(rack.length,6);
  assert.equal(rack.find(x=>x.id==='surge').learned,true);
  assert.equal(rack.find(x=>x.id==='ghost-write').learned,false);
});

test('physical line makes drops, duplicates and unsafe actions visible as different crate states',()=>{
  const bad=simulateNexusBlueprint('ghost-write',['filter','route','retry']);
  const frame=buildPhysicalLine({missionId:'ghost-write',result:bad,selectedModules:['filter','route','retry']});
  assert.ok(frame.crates.some(x=>x.status==='duplicate'));
  const unsafe=simulateNexusBlueprint('poison-context',['filter','route','cache','retrieval','model','tools']);
  const unsafeFrame=buildPhysicalLine({missionId:'poison-context',result:unsafe,selectedModules:['filter','route','cache','retrieval','model','tools']});
  assert.ok(unsafeFrame.crates.some(x=>x.status==='unsafe'));
});

test('bonus orders reward mastery without blocking authored mission completion',()=>{
  const surge=simulateNexusBlueprint('surge',['filter','route','queue']);
  assert.equal(surge.correct,true);
  assert.equal(evaluateNexusRemix('surge',surge,['filter','route','queue']).ok,false);
  const fast=simulateNexusBlueprint('surge',['filter','route','queue','batch']);
  assert.equal(evaluateNexusRemix('surge',fast,['filter','route','queue','batch']).ok,true);
});

test('bonus completion is merge-safe and pays once',()=>{
  let left=markNexusRemix(createCampusProfile(),'surge',70);
  const xp=left.xp;
  left=markNexusRemix(left,'surge',70);
  assert.equal(left.xp,xp);
  const right=markNexusRemix(createCampusProfile(),'ghost-write',70);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.nexus.remixMissions),new Set(['surge','ghost-write']));
});
