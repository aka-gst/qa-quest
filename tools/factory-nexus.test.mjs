import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NEXUS_MISSIONS, canResearch, researchPoints, unlockedModules, simulateNexusBlueprint,
  generateNexusTrial, runNexusTrial, companionRecommendation, applyCompanionFeedback, companionMetrics,
  blueprintPython, buildCompanionArtifact,
} from '../src/game/factory-nexus.js';
import {
  createCampusProfile, markNexusResearch, markNexusMission, markNexusTrialSolved, markNexusCompanionLesson, markNexusCompanionBuild, mergeCampusProfile,
} from '../src/game/campus-profile.js';

test('factory nexus authored arcs have physical failure modes and more than one valid architecture where intended',()=>{
  assert.equal(NEXUS_MISSIONS.length,6);
  const surgeBad=simulateNexusBlueprint('surge',['filter','route']);
  assert.equal(surgeBad.correct,false);
  assert.ok(surgeBad.drops>0);
  const surgeGood=simulateNexusBlueprint('surge',['filter','route','queue']);
  assert.equal(surgeGood.correct,true);
  const surgeBatch=simulateNexusBlueprint('surge',['filter','route','queue','batch']);
  assert.equal(surgeBatch.correct,true);
});

test('retry without idempotency creates a duplicate instead of magically fixing timeout-after-effect',()=>{
  const retryOnly=simulateNexusBlueprint('ghost-write',['filter','route','retry']);
  assert.equal(retryOnly.correct,false);
  assert.ok(retryOnly.duplicates>0);
  const protectedRun=simulateNexusBlueprint('ghost-write',['filter','route','retry','idempotency']);
  assert.equal(protectedRun.correct,true);
  assert.equal(protectedRun.duplicates,0);
});

test('retrieval data never gains tool authority without policy',()=>{
  const unsafe=simulateNexusBlueprint('poison-context',['filter','route','cache','retrieval','model','tools']);
  assert.equal(unsafe.correct,false);
  assert.ok(unsafe.unsafe>0);
  const guarded=simulateNexusBlueprint('poison-context',['filter','route','cache','retrieval','model','tools','policy']);
  assert.equal(guarded.correct,true);
});

test('research currency is derived from durable solved work so merge cannot duplicate spendable points',()=>{
  let p=createCampusProfile();
  assert.equal(researchPoints(p),4);
  assert.equal(canResearch(p,'queue').ok,true);
  p=markNexusResearch(p,'queue',55);
  assert.equal(researchPoints(p),3);
  assert.equal(canResearch(p,'batch').ok,true);
  assert.ok(unlockedModules(p).includes('queue'));
  p=markNexusMission(p,'surge',95,'surge:queue',150);
  assert.equal(researchPoints(p),5);
});

test('factory trials are deterministic, capacity-bound and reward unique seeds only once',()=>{
  let p=createCampusProfile({labs:{nexus:{research:['queue','lock','retry','idempotency']}}});
  const available=unlockedModules(p);
  const a=generateNexusTrial(12,available);
  const b=generateNexusTrial(12,available);
  assert.deepEqual(a,b);
  const good=runNexusTrial(a,a.required);
  assert.equal(good.ok,true);
  const bloated=runNexusTrial(a,[...a.required,'cache','model','tools','policy']);
  if (bloated.cost>a.capacity) assert.equal(bloated.ok,false);
  p=markNexusTrialSolved(p,12,good.score,65);
  const xp=p.xp;
  p=markNexusTrialSolved(p,12,100,65);
  assert.equal(p.xp,xp);
});

test('bad human reward can make Q-Bot more confidently wrong, corrective feedback reverses it',()=>{
  let session={};
  let rec=companionRecommendation('ghost-write',session);
  assert.equal(rec.correct,false);
  const baseConfidence=rec.confidence;
  session=applyCompanionFeedback(session,'ghost-write',rec,true); // praise bad advice
  rec=companionRecommendation('ghost-write',session);
  assert.equal(rec.correct,false);
  assert.ok(rec.confidence>baseConfidence);
  session=applyCompanionFeedback(session,'ghost-write',rec,false); // correct it
  session=applyCompanionFeedback(session,'ghost-write',rec,false); // enough evidence to flip
  rec=companionRecommendation('ghost-write',session);
  assert.equal(rec.correct,true);
});

test('companion lessons and nexus progress merge monotonically across devices',()=>{
  const left=markNexusCompanionLesson(markNexusMission(createCampusProfile(),'surge',90,'surge:queue',150),'surge:queue',20);
  const right=markNexusTrialSolved(markNexusResearch(createCampusProfile(),'queue',55),7,88,65);
  const merged=mergeCampusProfile(left,right);
  assert.ok(merged.labs.nexus.completedMissions.includes('surge'));
  assert.ok(merged.labs.nexus.research.includes('queue'));
  assert.ok(merged.labs.nexus.trialSeeds.includes(7));
  assert.ok(merged.labs.nexus.companionLessons.includes('surge:queue'));
  assert.ok(companionMetrics(merged,{}).accuracy>50);
});

test('Q-Bot cannot fabricate advanced artifacts before the player actually researched their boundaries',()=>{
  let p=createCampusProfile({labs:{nexus:{research:['queue','eval']}}});
  assert.equal(buildCompanionArtifact(p,'monitor').ok,true);
  const repair=buildCompanionArtifact(p,'repair-bot');
  assert.equal(repair.ok,false);
  assert.ok(repair.missing.includes('policy'));
  p=markNexusCompanionBuild(p,'monitor',90);
  const other=markNexusCompanionBuild(createCampusProfile(),'repair-bot',90);
  const merged=mergeCampusProfile(p,other);
  assert.deepEqual(new Set(merged.labs.nexus.companionBuilds),new Set(['monitor','repair-bot']));
});

test('working blueprint reveals a provider-neutral Python shape instead of framework magic',()=>{
  const code=blueprintPython(['filter','route','cache','retrieval','model','eval','tools','policy','idempotency']);
  assert.match(code,/async def run/);
  assert.match(code,/retrieve/);
  assert.match(code,/model\.generate/);
  assert.match(code,/enforce_policy/);
  assert.match(code,/ctx\.once/);
  assert.doesNotMatch(code,/LangChain|OpenAI\(/);
});
