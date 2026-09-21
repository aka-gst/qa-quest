import test from 'node:test';
import assert from 'node:assert/strict';
import {createFirstShiftState,stepFirstShift,firstShiftBossLine,FIRST_SHIFT_PAY} from '../src/game/first-shift.js';

function deliverThreeCrates(){
  let s=createFirstShiftState();
  s=stepFirstShift(s,'briefing-done');
  for(const id of ['a','b','c']){
    s=stepFirstShift(s,{type:'pick',id});
    s=stepFirstShift(s,'drop');
  }
  return s;
}

test('first shift is briefing -> three physical crates -> report to boss -> confront -> talk -> chip',()=>{
  let s=deliverThreeCrates();
  assert.equal(s.delivered,3);
  assert.equal(s.phase,'report');
  assert.equal(s.delivered*FIRST_SHIFT_PAY,3600);
  s=stepFirstShift(s,'report-boss');
  assert.equal(s.phase,'confront');
  s=stepFirstShift(s,'talk');
  assert.equal(s.phase,'payday');
  s=stepFirstShift(s,'payday-done');
  assert.equal(s.phase,'choice');
  assert.equal(s.chipVisible,true);
  s=stepFirstShift(s,'chip');
  assert.equal(s.complete,true);
});

test('confront lets the player shove the boss instead of talking, and still reaches payday either way',()=>{
  let s=deliverThreeCrates();
  s=stepFirstShift(s,'report-boss');
  s=stepFirstShift(s,'fight-start');
  assert.equal(s.phase,'fight');
  assert.equal(s.fightMeter,50);
  assert.equal(s.fightWon,null);
  s=stepFirstShift(s,{type:'push',hit:false});
  assert.equal(s.fightMeter,41);
  assert.equal(s.phase,'fight');
});

test('fight resolves to a win when hits push the meter to 100, and continues to payday',()=>{
  let s=deliverThreeCrates();
  s=stepFirstShift(s,'report-boss');
  s=stepFirstShift(s,'fight-start');
  for(let i=0;i<4;i++)s=stepFirstShift(s,{type:'push',hit:true});
  assert.equal(s.phase,'fight-result');
  assert.equal(s.fightWon,true);
  assert.equal(s.fightMeter,100);
  s=stepFirstShift(s,'fight-done');
  assert.equal(s.phase,'payday');
  const [,line]=firstShiftBossLine('payday',true);
  assert.match(line,/между нами/);
});

test('fight resolves to a loss when misses drain the meter to 0, and still continues to payday',()=>{
  let s=deliverThreeCrates();
  s=stepFirstShift(s,'report-boss');
  s=stepFirstShift(s,'fight-start');
  for(let i=0;i<6;i++)s=stepFirstShift(s,{type:'push',hit:false});
  assert.equal(s.phase,'fight-result');
  assert.equal(s.fightWon,false);
  assert.equal(s.fightMeter,0);
  s=stepFirstShift(s,'fight-done');
  assert.equal(s.phase,'payday');
  const [,line]=firstShiftBossLine('payday',false);
  assert.doesNotMatch(line,/между нами/);
});

test('a push outside the fight phase is a no-op (negative control: firing the fight action from report does nothing)',()=>{
  let s=deliverThreeCrates();
  assert.equal(s.phase,'report');
  const before=JSON.stringify(s);
  s=stepFirstShift(s,{type:'push',hit:true});
  assert.equal(JSON.stringify(s),before);
});
