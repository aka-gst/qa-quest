import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('campus exposes Automation Commons as a post-mastery reusable-systems branch',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['id="automationCommons"','data-campus-branch="commons"','id="commonsRules"','id="commonsEventTape"','id="commonsLibrary"','id="commonsDayOpen"','id="commonsCodeOpen"','id="commonsCodeRun"']) assert.ok(html.includes(token),token);
});

test('Automation Commons keeps touch-first building and explicitly makes optimization optional',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(html,/Любое рабочее решение принимается/);
  assert.match(css,/\.commons-rule select[^}]*min-height:44px/s);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*\.commons-rule\{grid-template-columns:1fr\}/);
  assert.match(css,/min-height:52px/);
});


test('builder asks WHEN before exposing context-specific actions and saved blueprints can be remixed',async()=>{
  const js=await fs.readFile(new URL('../src/game/automation-commons.js',import.meta.url),'utf8');
  assert.match(js,/СНАЧАЛА ВЫБЕРИ «КОГДА»/);
  assert.match(js,/commonsActionChoices\(when\.value\)/);
  assert.match(js,/renderBrief\(parseProgramSignature/);
  assert.match(js,/схема загружена/);
});
