import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('campus exposes SIMNET after AI Factory with all five infrastructure surfaces',()=>{
  for(const token of ['data-campus-branch="simnet"','id="simnetLab"','id="simnetRoute"','id="simnetIncidentPanel"','id="simnetPython"','id="simnetSkill"']) assert.match(html,new RegExp(token));
  for(const label of ['BEARER','ALLOWLIST','REQUEST ID','DISCOVER','DATA GUARD','EVIDENCE','HEALTH','READY','BACKUP','ROLLBACK','PERMISSION','LOCAL ROUTE']) assert.ok(html.includes(label),label);
});

test('SIMNET has touch-safe narrow layout and incident controls are not color-only',()=>{
  assert.match(css,/\.simnet-lab button\{min-height:58px\}/);
  assert.match(html,/ГДЕ СЛОМАЛОСЬ\?/);
  assert.match(html,/КАК ЛЕЧИТЬ\?/);
  assert.match(css,/button\[data-on="true"\]/);
});
