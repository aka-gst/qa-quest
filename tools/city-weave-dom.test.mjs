import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('campus exposes CITY WEAVE as living-city trust/resilience/autonomy gameplay',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['id="cityWeave"','data-campus-branch="weave"','id="weaveDistricts"','id="weaveTrustBar"','id="weaveResilienceBar"','id="weaveAccessBar"','id="weaveThroughputBar"','id="weaveAutonomy"','id="weaveChoices"','id="weaveBeats"','id="weaveCode"','id="weaveSkill"']) assert.ok(html.includes(token),token);
});

test('CITY WEAVE remains touch-first and reduced-motion safe',async()=>{
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.weave-choices button\{min-height:92px/);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*\.weave-choices button/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*weave-pulse/);
});
