import test from 'node:test';
import assert from 'node:assert/strict';
import {CAREER_REALMS,createCareerSession,evaluateCareerRealm,foundationStatus,stepCareerSession} from '../src/game/career-worlds.js';

test('career worlds expose seven distinct realms and seven micro-loop identities',()=>{
  assert.equal(CAREER_REALMS.length,7);
  assert.equal(new Set(CAREER_REALMS.map(x=>x.id)).size,7);
  assert.equal(new Set(CAREER_REALMS.map(x=>x.mechanic)).size,7);
});

test('foundation gates are visible and skill-based',()=>{
  const auto=CAREER_REALMS.find(x=>x.id==='automation');
  assert.equal(foundationStatus({printUnlocked:true,ifUnlocked:true,forUnlocked:false},auto).ok,false);
  assert.equal(foundationStatus({printUnlocked:true,ifUnlocked:true,forUnlocked:true},auto).ok,true);
});

test('realms reward robust choices and reject seductive bad shortcuts',()=>{
  assert.equal(evaluateCareerRealm('security',['roles','negative']).ok,true);
  assert.equal(evaluateCareerRealm('security',['roles','shutdown']).ok,false);
  assert.equal(evaluateCareerRealm('vehicle',['owner','gateway']).ok,true);
  assert.equal(evaluateCareerRealm('ai',['examples','authority']).ok,false);
});

test('WEB behaves like a tiny budget game instead of a generic multiple choice',()=>{
  let s=createCareerSession('web');
  s=stepCareerSession(s,'cache');s=stepCareerSession(s,'queue');
  assert.equal(s.budget,0);
  const before=[...s.selected];s=stepCareerSession(s,'banner');
  assert.deepEqual(s.selected,before,'third investment is blocked by budget');
  assert.equal(evaluateCareerRealm('web',s.selected,s).ok,true);
});

test('LOW LEVEL is a state puzzle with toggled bits',()=>{
  let s=createCareerSession('lowlevel');
  s=stepCareerSession(s,'bit0');s=stepCareerSession(s,'bit1');
  assert.equal(s.bits.join(''),'0011');
  assert.equal(evaluateCareerRealm('lowlevel',[],s).ok,true);
  s=stepCareerSession(s,'reset');
  assert.equal(s.bits.join(''),'0000');
});

test('AI training changes confidence while authority alone only makes confidence louder',()=>{
  let good=createCareerSession('ai');good=stepCareerSession(good,'examples');good=stepCareerSession(good,'abstain');
  let bad=createCareerSession('ai');bad=stepCareerSession(bad,'authority');
  assert.ok(good.confidence<92);
  assert.ok(bad.confidence>92);
  assert.equal(evaluateCareerRealm('ai',good.selected,good).ok,true);
  assert.equal(evaluateCareerRealm('ai',bad.selected,bad).ok,false);
});
