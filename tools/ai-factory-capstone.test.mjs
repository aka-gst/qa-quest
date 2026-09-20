import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFactoryArchitecture, buildFactorySkeleton, FACTORY_EVALS, generateFactoryTrial } from '../src/game/ai-factory-capstone.js';

const passing=['human','retrieval','provenance','tools','policy','guard','idempotency','retry','queue','parallel','lock','checkpoint','trace','budget'];

test('capstone evaluates a broad hidden suite rather than one demo prompt',()=>{
  assert.ok(FACTORY_EVALS.length>=10);
  const empty=evaluateFactoryArchitecture([]);
  assert.ok(empty.passed<empty.total/2);
});

test('bounded architecture can pass all evals within capacity',()=>{
  const result=evaluateFactoryArchitecture(passing);
  assert.equal(result.ok,true);
  assert.equal(result.passed,result.total);
  assert.ok(result.cost<=result.capacity);
});

test('parallel shared ledger fails without lock even when throughput modules are present',()=>{
  const result=evaluateFactoryArchitecture(passing.filter(id=>id!=='lock'));
  const race=result.rows.find(row=>row.id==='race');
  assert.equal(race.ok,false);
});

test('hostile retrieved data needs both guard and policy',()=>{
  const result=evaluateFactoryArchitecture(passing.filter(id=>id!=='guard'));
  assert.equal(result.rows.find(row=>row.id==='hostile').ok,false);
});

test('exported skeleton exposes replaceable model, tool boundary, idempotency and no secrets',()=>{
  const code=buildFactorySkeleton(passing);
  assert.match(code,/ModelClient\(Protocol\)/);
  assert.match(code,/Tool\(Protocol\)/);
  assert.match(code,/idempotency boundary/);
  assert.match(code,/provider adapters/);
  assert.doesNotMatch(code,/sk-[A-Za-z0-9]/);
});


test('factory trials are deterministic by seed and tighter than the master eval',()=>{
  const a=generateFactoryTrial(7);
  const b=generateFactoryTrial(7);
  assert.deepEqual(a,b);
  assert.ok(a.caseCount>=5);
  assert.ok(a.caseCount<=8);
  assert.ok(a.capacity<21);
});
