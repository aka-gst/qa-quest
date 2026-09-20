import test from 'node:test';
import assert from 'node:assert/strict';
import {createFirstShiftState,stepFirstShift,FIRST_SHIFT_PAY} from '../src/game/first-shift.js';

test('first shift is briefing -> three physical crates -> report to boss -> chip',()=>{
  let s=createFirstShiftState();
  assert.equal(s.phase,'briefing');
  s=stepFirstShift(s,'briefing-done');
  assert.equal(s.phase,'manual');
  for(const id of ['a','b','c']){
    s=stepFirstShift(s,{type:'pick',id});
    assert.equal(s.carrying,id);
    s=stepFirstShift(s,'drop');
  }
  assert.equal(s.delivered,3);
  assert.equal(s.phase,'report');
  assert.equal(s.delivered*FIRST_SHIFT_PAY,3600);
  s=stepFirstShift(s,'report-boss');
  assert.equal(s.phase,'payday');
  s=stepFirstShift(s,'payday-done');
  assert.equal(s.phase,'choice');
  assert.equal(s.chipVisible,true);
  s=stepFirstShift(s,'chip');
  assert.equal(s.complete,true);
});
