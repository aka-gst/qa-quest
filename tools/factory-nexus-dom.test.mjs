import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html=()=>readFile(new URL('../index.html',import.meta.url),'utf8');
const css=()=>readFile(new URL('../styles.css',import.meta.url),'utf8');
const main=()=>readFile(new URL('../src/game/main.js',import.meta.url),'utf8');

test('Factory Nexus is a first-class campus branch with research, blueprints, companion and infinite shifts',async()=>{
  const source=await html();
  for(const id of ['factoryNexus','nexusResearchGrid','nexusModuleGrid','nexusCompanion','nexusMissionTabs','nexusTrialsOpen','nexusFlowResult','nexusPythonReveal','nexusFinale','nexusPhysicalLine','nexusCrates','nexusRemixToggle','nexusRemixCopy','nexusCompanionHumanState','nexusMemoryRack','nexusMetricsToggle','nexusCompanionMetrics']) assert.match(source,new RegExp(`id=["']${id}["']`),id);
  assert.match(source,/FACTORY NEXUS/);
  assert.match(source,/data-campus-branch="nexus"/);
  assert.match(source,/SORTER MINI-GAME/);
  assert.match(source,/REPAIR BOT/);
});

test('Factory Nexus stays usable on narrow screens and completion is not encoded by color alone',async()=>{
  const styles=await css();
  assert.match(styles,/@media\(max-width:720px\)/);
  assert.match(styles,/nexus-module-grid button[^}]*min-height:56px/);
  assert.match(styles,/nexus-crate\[data-status="drop"\]/);
  assert.match(styles,/nexus-crate\[data-status="duplicate"\]/);
  assert.match(styles,/nexus-crate\[data-status="unsafe"\]/);
  const source=await html();
  assert.match(source,/DROPS/);
  assert.match(source,/BLUEPRINT/);
});

test('runtime wires Nexus into the same merge-safe campus profile rather than a parallel save',async()=>{
  const source=await main();
  assert.match(source,/createFactoryNexus/);
  assert.match(source,/nexus-research/);
  assert.match(source,/nexus-mission/);
  assert.match(source,/nexus-trial/);
  assert.match(source,/nexus-companion-build/);
  assert.match(source,/nexus-remix/);
  assert.doesNotMatch(source,/localStorage\.setItem\([^\n]*nexus/i);
});
