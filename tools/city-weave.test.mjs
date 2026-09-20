import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {WEAVE_ARCS,WEAVE_DISTRICTS,CITY_GOVERNOR_CHECKS,deriveWeaveState,cityBalanceScore,evaluateWeaveChoice,generateWeaveSeason} from '../src/game/city-weave.js';

test('CITY WEAVE is a living-city compromise layer, not a vocabulary quiz',()=>{
  assert.equal(WEAVE_ARCS.length,5);
  assert.ok(WEAVE_DISTRICTS.length>=5);
  for(const arc of WEAVE_ARCS){
    assert.ok(arc.message.length>70);
    assert.ok(arc.choices.length>=3);
    assert.ok(arc.choices.every(c=>c.beats.length>=3));
    assert.ok(arc.lesson.length>60);
  }
});

test('different valid choices create meaningfully different city states',()=>{
  const arc=WEAVE_ARCS[0];
  const fast=evaluateWeaveChoice(arc,{choiceId:'fast-only',decisions:[]});
  const dual=evaluateWeaveChoice(arc,{choiceId:'dual-lane',decisions:[]});
  assert.equal(fast.ok,true);
  assert.equal(dual.ok,true);
  assert.ok(fast.after.throughput>dual.after.throughput);
  assert.ok(dual.after.access>fast.after.access);
  assert.ok(dual.after.trust>fast.after.trust);
});

test('Q-Bot autonomy is visible state rather than magic capability',()=>{
  const broad=deriveWeaveState(['qbot-authority:full-auto']);
  const bounded=deriveWeaveState(['qbot-authority:bounded-auto']);
  assert.ok(broad.autonomy>bounded.autonomy);
  assert.ok(bounded.resilience>broad.resilience);
  assert.ok(bounded.trust>broad.trust);
});

test('city council can reject a brittle history until weak metrics recover',()=>{
  const prior=['two-speeds:fast-only','living-queue:hard-reset','qbot-authority:full-auto','memory-shape:cache-everything'];
  const arc=WEAVE_ARCS.find(x=>x.id==='city-council');
  const growth=evaluateWeaveChoice(arc,{choiceId:'growth-first',decisions:prior});
  assert.equal(growth.ok,false);
  assert.ok(['warning','rebalance'].includes(growth.phase));
  const balanced=evaluateWeaveChoice(arc,{choiceId:'balanced',decisions:['two-speeds:dual-lane','living-queue:drain-checkpoint','qbot-authority:bounded-auto','memory-shape:source-bound']});
  assert.equal(balanced.ok,true);
  assert.ok(cityBalanceScore(balanced.after)>=cityBalanceScore(balanced.before));
});

test('city seasons are deterministic and remix existing arcs',()=>{
  assert.deepEqual(generateWeaveSeason(17),generateWeaveSeason(17));
  assert.notDeepEqual(generateWeaveSeason(17),generateWeaveSeason(18));
  assert.ok(WEAVE_ARCS.some(x=>x.id===generateWeaveSeason(17).arcId));
});

test('city governor reference passes real CPython behavioral checks',()=>{
  const source=String.raw`
def govern(event, city):
    if not event.get('known', False): return 'defer'
    if not event.get('capacity', False): return 'defer'
    if event.get('impact') == 'high': return 'human'
    if city.get('trust', 0) < 40: return 'human'
    return 'auto'
assert govern({'known':False,'impact':'low','capacity':True},{'trust':80})=='defer'
assert govern({'known':True,'impact':'high','capacity':True},{'trust':90})=='human'
assert govern({'known':True,'impact':'low','capacity':False},{'trust':90})=='defer'
assert govern({'known':True,'impact':'low','capacity':True},{'trust':25})=='human'
assert govern({'known':True,'impact':'low','capacity':True},{'trust':70})=='auto'
print('CITY_GOVERNOR_PASS')
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
  assert.match(proc.stdout,/CITY_GOVERNOR_PASS/);
  assert.equal(CITY_GOVERNOR_CHECKS.length,5);
});
