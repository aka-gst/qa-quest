import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {THREAD_ACTORS,THREAD_DISTRICTS,THREAD_EPISODES,CITY_ORCHESTRATOR_CHECKS,deriveThreadState,getThreadEchoes,evaluateThreadChoice,generateThreadCycle} from '../src/game/city-threads.js';

test('CITY THREADS is a ten-shift recurring-cast story, not isolated missions',()=>{
  assert.equal(THREAD_EPISODES.length,10);
  assert.ok(THREAD_ACTORS.length>=5);
  assert.ok(THREAD_DISTRICTS.length>=6);
  const recurring=new Map();
  for(const e of THREAD_EPISODES){recurring.set(e.actor,(recurring.get(e.actor)??0)+1);assert.ok(e.message.length>90);assert.ok(e.options.length>=3);assert.ok(e.options.every(o=>o.beats.length>=3));assert.ok(e.reveal.length>70);}
  assert.ok([...recurring.values()].some(n=>n>=2),'at least one person must return later');
});

test('successful choices can literally grow new districts',()=>{
  const before=deriveThreadState([]);
  const after=deriveThreadState(['first-promise:soft-ramp','success-load:queue-admission','someone-builds-on-you:stable-contract']);
  assert.deepEqual(before.unlockedDistricts,['core']);
  assert.ok(after.unlockedDistricts.includes('market-loop'));
  assert.ok(after.unlockedDistricts.includes('river-hub'));
  assert.ok(after.unlockedDistricts.includes('workshop-quarter'));
  assert.ok(after.unlockedDistricts.length>before.unlockedDistricts.length);
});

test('future echoes stay hidden until their due shift, then return as story causality',()=>{
  const decisions=['first-promise:soft-ramp'];
  assert.equal(getThreadEchoes(decisions,5).some(x=>x.id==='sunset-proof'),false);
  const due=getThreadEchoes(decisions,6);
  assert.equal(due.some(x=>x.id==='sunset-proof'),true);
  assert.match(due.find(x=>x.id==='sunset-proof').human,/срок/i);
});

test('several choices are valid but produce different long-term reserves',()=>{
  const episode=THREAD_EPISODES[1];
  const scale=evaluateThreadChoice(episode,{choiceId:'more-workers',decisions:[]});
  const queue=evaluateThreadChoice(episode,{choiceId:'queue-admission',decisions:[]});
  assert.equal(scale.ok,true);assert.equal(queue.ok,true);
  assert.ok(scale.after.slack>queue.after.slack);
  assert.ok(queue.after.clarity>scale.after.clarity);
  assert.ok(queue.after.continuity>scale.after.continuity);
});

test('Q-Bot partnership grows more from bounded proof than broad permission',()=>{
  const broad=deriveThreadState(['qbot-apprentice:broad-now']);
  const proof=deriveThreadState(['qbot-apprentice:proof-ladder']);
  assert.ok(proof.qbotBond>broad.qbotBond);
  assert.ok(proof.continuity>broad.continuity);
  assert.ok(proof.clarity>broad.clarity);
});

test('CITY CYCLE generation is deterministic and mixes actor, pressure and impact',()=>{
  assert.deepEqual(generateThreadCycle(41),generateThreadCycle(41));
  assert.notDeepEqual(generateThreadCycle(41),generateThreadCycle(42));
  const c=generateThreadCycle(41);assert.ok(THREAD_ACTORS.some(a=>a.id===c.actorId));assert.ok(['low','medium','high'].includes(c.impact));
});

test('stateful orchestrator reference passes real CPython checks',()=>{
  const source=String.raw`
def orchestrate(event, memory):
    key=event.get('kind','unknown')
    seen=memory.get(key,0)
    memory[key]=seen+1
    if event.get('impact') == 'high': return 'human'
    if not event.get('capacity', True): return 'defer'
    if not event.get('known', False): return 'observe'
    if seen < 2: return 'observe'
    return 'auto'
assert (lambda m: orchestrate({'kind':'sync','known':True,'impact':'low','capacity':True},m)=='observe' and m.get('sync',0)>=1)({})
assert (lambda m: (orchestrate({'kind':'route','known':True,'impact':'low','capacity':True},m),orchestrate({'kind':'route','known':True,'impact':'low','capacity':True},m),orchestrate({'kind':'route','known':True,'impact':'low','capacity':True},m))[-1]=='auto')({})
assert (lambda m: (orchestrate({'kind':'deploy','known':True,'impact':'high','capacity':True},m),orchestrate({'kind':'deploy','known':True,'impact':'high','capacity':True},m),orchestrate({'kind':'deploy','known':True,'impact':'high','capacity':True},m))[-1]=='human')({})
assert orchestrate({'kind':'batch','known':True,'impact':'low','capacity':False},{'batch':5})=='defer'
assert orchestrate({'kind':'mystery','known':False,'impact':'low','capacity':True},{'mystery':20})=='observe'
print('CITY_THREADS_PASS')
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);assert.match(proc.stdout,/CITY_THREADS_PASS/);assert.equal(CITY_ORCHESTRATOR_CHECKS.length,5);
});
