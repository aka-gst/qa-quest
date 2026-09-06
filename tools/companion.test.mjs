import test from 'node:test';
import assert from 'node:assert/strict';
import { stepCompanion } from '../src/game/companion.js';

test('companion starts at the center, independent of the warehouse player', () => {
  const p = stepCompanion(null, null, { x: 640, y: 360 }, { width: 1280, height: 720 }, .016);
  assert.equal(p.x, 640); assert.equal(p.y, 360); assert.equal(p.biting, false);
});
test('hover target attracts companion without a held mouse button; it bites when close', () => {
  let p = { x: 100, y: 100, biting: false };
  const target = { x: 300, y: 200 }, size = { width: 640, height: 480 };
  const first = stepCompanion(p, target, { x: 320, y: 240 }, size, .016);
  assert.ok(first.x > 100 && first.x < 300);
  for (let i = 0; i < 180; i++) p = stepCompanion(p, target, { x: 320, y: 240 }, size, .016);
  assert.ok(Math.hypot(p.x-target.x,p.y-target.y) < 10);
  assert.equal(p.biting, true);
});
test('pointer leave returns home, long frame cannot teleport, edge stays visible', () => {
  const size={width:390,height:844}, home={x:195,y:422};
  const p=stepCompanion({x:100,y:100},null,home,size,100);
  assert.ok(p.x>100 && p.x<150); assert.equal(p.biting,false);
  let edge=null;
  for(let i=0;i<240;i++) edge=stepCompanion(edge,{x:-200,y:1000},home,size,.016);
  assert.ok(edge.x>=36 && edge.y<=808);
});
