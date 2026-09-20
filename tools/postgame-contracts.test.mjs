import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SYSTEM_CONTRACTS, resolveSystemContract } from '../src/game/contract-board.js';
import { PYTHON_CONTRACTS } from '../src/game/python-contracts.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('postgame has enough authored systems and code contracts to form a repeatable campus', () => {
  assert.equal(SYSTEM_CONTRACTS.length, 18);
  assert.equal(PYTHON_CONTRACTS.length, 36);
  assert.ok(new Set(SYSTEM_CONTRACTS.map((c)=>c.id)).size === SYSTEM_CONTRACTS.length);
  assert.ok(new Set(PYTHON_CONTRACTS.map((c)=>c.id)).size === PYTHON_CONTRACTS.length);
  for (const contract of SYSTEM_CONTRACTS) assert.equal(resolveSystemContract(contract.id, contract.correct).ok, true);
});

test('campus DOM exposes systems, real Python, AI and LLM branches plus portable progress', () => {
  for (const id of ['engineerCampus','contractBoard','systemSandbox','pythonContracts','aiLab','modelWorkbench','neuralFoundry','llmWorkshop','retrievalWarehouse','botForge','automationLab','aiFactoryCapstone','simnetLab','factoryNexus','cityWeave','campusExport','campusImportBox']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.match(html, /18 КОНТРАКТОВ/);
  assert.match(html, /36 КОНТРАКТОВ/);
  assert.match(html, /TRAINING DATA/);
  assert.match(html, /ONE-LAYER MODEL/);
  assert.match(html, /INSTRUCTION/);
  assert.match(html, /REAL-WORLD AUTOMATION LAB/);
  assert.match(html, /MY AI FACTORY/);
  assert.match(html, /RUN HIDDEN EVAL/);
});

test('new postgame branches remain touch-friendly on narrow phones', () => {
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /min-height:58px/);
});


test('SIMNET extends the real-Python dock instead of remaining a button-only tutorial',()=>{
  const ids=new Set(PYTHON_CONTRACTS.map(c=>c.id));
  for(const id of ['py-25','py-26','py-27','py-28','py-29','py-30','py-31','py-32','py-33','py-34','py-35','py-36']) assert.ok(ids.has(id),id);
  const joined=PYTHON_CONTRACTS.filter(c=>Number(c.id.slice(3))>=25).map(c=>`${c.title} ${c.concept}`).join(' ');
  for(const token of ['секрет','readiness','request','MCP','idempotency','evidence']) assert.ok(joined.toLowerCase().includes(token.toLowerCase()),token);
});
