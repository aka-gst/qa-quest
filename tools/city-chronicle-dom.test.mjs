import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('campus exposes CITY CHRONICLE as history/debt/postmortem gameplay',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['id="cityChronicle"','data-campus-branch="chronicle"','id="chronicleEcho"','id="chronicleClues"','id="chronicleDebtBar"','id="chronicleDecisions"','id="chronicleMemory"','id="chronicleCode"','id="chronicleSkill"']) assert.ok(html.includes(token),token);
});

test('chronicle is touch-first, responsive and keeps reduced-motion support',async()=>{
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.chronicle-decisions button\{min-height:80px/);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*\.chronicle-decisions\{grid-template-columns:1fr\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*chronicle-debt-track/);
});
