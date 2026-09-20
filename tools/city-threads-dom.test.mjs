import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('campus exposes CITY THREADS as recurring people, growing districts and future echoes',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['id="cityThreads"','data-campus-branch="threads"','id="threadsActors"','id="threadsDistricts"','id="threadsEchoes"','id="threadsContinuityBar"','id="threadsSlackBar"','id="threadsClarityBar"','id="threadsQbotBond"','id="threadsChoices"','id="threadsCode"','id="threadsSkill"']) assert.ok(html.includes(token),token);
  assert.match(html,/10 СМЕН/);
});

test('CITY THREADS remains touch-first, readable and reduced-motion safe',async()=>{
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.threads-choices button\{min-height:96px/);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*\.threads-choices button/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*threads-pulse/);
});
