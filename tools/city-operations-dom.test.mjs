import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('campus exposes RELEASE WEEK with evidence, canary, rollback and code mastery surfaces',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['id="cityOperations"','data-campus-branch="operations"','id="opsPatchList"','id="opsReleaseTrack"','id="opsTest"','id="opsCanary"','id="opsObserve"','id="opsRollback"','id="opsGuardCode"','id="operationsSkill"']) assert.ok(html.includes(token),token);
});

test('release UI remains touch-first and visually distinguishes production failure from evidence',async()=>{
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.release-controls button\{min-height:50px/);
  assert.match(css,/data-state="outage"/);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*\.release-controls\{grid-template-columns:1fr\}/);
  assert.match(css,/min-height:54px/);
});
