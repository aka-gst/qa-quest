import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const root=new URL('../',import.meta.url);
test('campus exposes WORLD GRID as a first-class living-world branch',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['id="worldGrid"','data-campus-branch="world"','id="worldMap"','id="worldActions"','id="worldDeploy"','id="worldQbotLine"','id="worldShiftOpen"','id="worldCodeReveal"']) assert.ok(html.includes(token),token);
});

test('WORLD GRID stays tap-first and adaptive instead of requiring terminal syntax',async()=>{
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.world-map button\{[^}]*min-height:112px/s);
  assert.match(css,/@media\(max-width:760px\)[\s\S]*\.world-actions\{grid-template-columns:1fr\}/);
  const js=await fs.readFile(new URL('../src/game/world-grid.js',import.meta.url),'utf8');
  assert.match(js,/getMode\(\)==='compact'/);
  assert.match(js,/Не нужно знать ни одного термина/);
});


test('WORLD GRID 9.0 contains mastery state and an optional direct Python challenge route',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  for(const id of ['worldMode','worldMastery','worldDirectOpen','worldDirectPatch','worldDirectCode','worldDirectRun','worldDirectStatus','worldBlackBoxOpen']) assert.match(html,new RegExp(`id=["']${id}["']`),id);
  assert.match(css,/world-direct-open/);
  assert.match(css,/world-direct/);
  assert.match(css,/min-height:54px/);
});
