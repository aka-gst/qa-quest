import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html=()=>readFile(new URL('../index.html',import.meta.url),'utf8');
const css=()=>readFile(new URL('../styles.css',import.meta.url),'utf8');
const main=()=>readFile(new URL('../src/game/main.js',import.meta.url),'utf8');

test('OPS DESK is a first-class campus branch with diegetic apps, evidence graph and safe terminal',async()=>{
  const source=await html();
  for(const id of ['opsDesk','deskWindowTitle','deskEvidence','deskGraph','deskTerminalInput','deskTerminalOutput','deskDiagnoses','deskFixes','deskIncidentPanel']) assert.match(source,new RegExp(`id=["']${id}["']`),id);
  for(const app of ['dispatch','notes','map','terminal']) assert.match(source,new RegExp(`data-desk-app=["']${app}["']`),app);
  assert.match(source,/никаких реальных сетей и атак/i);
  assert.match(source,/data-campus-branch="desk"/);
});

test('OPS DESK keeps terminal hints visible, provides click alternatives and remains touch-safe',async()=>{
  const source=await html();
  for(const cmd of ['inbox','logs','trace','files','notes','help']) assert.match(source,new RegExp(`data-desk-command=["']${cmd}["']`));
  const styles=await css();
  assert.match(styles,/\.ops-choice-grid button[^}]*min-height:46px/);
  assert.match(styles,/@media\(max-width:680px\)/);
  assert.match(styles,/\.ops-choice-grid button,.ops-dispatch__actions button,.ops-incident-actions button\{min-height:56px\}/);
});

test('runtime wires OPS DESK into the shared campus profile',async()=>{
  const source=await main();
  assert.match(source,/createOpsDesk/);
  assert.match(source,/desk-complete/);
  assert.match(source,/desk-incident/);
  assert.doesNotMatch(source,/localStorage\.setItem\([^\n]*desk/i);
});
