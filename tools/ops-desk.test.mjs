import test from 'node:test';
import assert from 'node:assert/strict';
import { OPS_DESK_CASES, evaluateOpsCase, generateOpsIncident, evaluateOpsIncident, normalizeDeskCommand, completeDeskCommand } from '../src/game/ops-desk.js';

test('OPS DESK authored cases can be solved from any three independent evidence items',()=>{
  for(const c of OPS_DESK_CASES){
    const evidence=Object.keys(c.evidence).slice(0,3);
    const result=evaluateOpsCase(c,{evidence,diagnosis:c.diagnosis,fix:c.fix});
    assert.equal(result.ok,true,c.id);
    assert.equal(result.found.length,3);
  }
});

test('OPS DESK refuses one-clue guessing even when diagnosis and fix happen to be correct',()=>{
  const c=OPS_DESK_CASES[0];
  const result=evaluateOpsCase(c,{evidence:['logs'],diagnosis:c.diagnosis,fix:c.fix});
  assert.equal(result.ok,false);
  assert.equal(result.enough,false);
  assert.match(result.message,/evidence/i);
});

test('terminal aliases and tab completion stay forgiving instead of requiring exact command syntax',()=>{
  assert.equal(normalizeDeskCommand('  MAIL '),'inbox');
  assert.equal(normalizeDeskCommand('log'),'logs');
  assert.equal(completeDeskCommand('tra'),'trace');
  assert.equal(completeDeskCommand(''),'');
  assert.equal(normalizeDeskCommand('nmap'),'','real hacking commands are intentionally outside this safe terminal');
});

test('generated desk shifts are deterministic and diagnosis/fix are independently checked',()=>{
  const a=generateOpsIncident(17),b=generateOpsIncident(17),c=generateOpsIncident(18);
  assert.deepEqual(a,b);
  assert.notDeepEqual(a,c);
  assert.equal(evaluateOpsIncident(a,{diagnosis:a.diagnosis,fix:a.fix}).ok,true);
  assert.equal(evaluateOpsIncident(a,{diagnosis:a.diagnosis,fix:a.fixes.find(x=>x!==a.fix)}).ok,false);
});
