import test from 'node:test';
import assert from 'node:assert/strict';
import { BOT_FORGE_MISSIONS, createForgePolicy, chooseForgeStrategy, updateForgePolicy, simulateBotForge } from '../src/game/bot-forge.js';

test('feedback changes the strategy selected for the same mission',()=>{
  let policy=createForgePolicy(); const id=BOT_FORGE_MISSIONS[0].id;
  assert.equal(chooseForgeStrategy(policy,id),'fast');
  policy=updateForgePolicy(policy,id,'fast',-1);
  assert.equal(chooseForgeStrategy(policy,id),'safe');
});

test('a generated program cannot pass without required modules and matching strategy',()=>{
  const mission=BOT_FORGE_MISSIONS[0]; let policy=createForgePolicy();
  assert.equal(simulateBotForge(mission,['planner'],policy).ok,false);
  policy=updateForgePolicy(policy,mission.id,'fast',-1);
  const pass=simulateBotForge(mission,['planner','tools','tests'],policy);
  assert.equal(pass.strategy,'safe'); assert.equal(pass.ok,true); assert.match(pass.artifact,/def normalize_files/);
});

test('two-bot mission requires explicit policy around shared tools',()=>{
  const mission=BOT_FORGE_MISSIONS[3]; let policy=createForgePolicy();
  policy=updateForgePolicy(policy,mission.id,'fast',-1);
  const required=mission.required.filter(id=>id!=='policy');
  assert.equal(simulateBotForge(mission,required,policy).ok,false);
  assert.ok(simulateBotForge(mission,required,policy).checks.some(check=>check.id==='authority'&&!check.ok));
});

test('forge artifacts cover programs, repairs, games and multi-bot blueprints',()=>{
  const kinds=BOT_FORGE_MISSIONS.map(m=>m.kind);
  assert.deepEqual(kinds,['python','repair','game','bots']);
});
