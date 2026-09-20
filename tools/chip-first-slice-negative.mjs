// Run the same acceptance tests against in-memory mutations, never the worktree.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root = new URL('../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');
const data = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const source = read('src/game/model.js').replace('./config.js?v=novice-1', new URL('src/game/config.js', root).href);
const mutations = [
  ['early boss', 'introComplete: true,\n    bossEntrance: false,\n    manualDelivered: 0,', 'introComplete: true,\n    bossEntrance: true,\n    manualDelivered: 0,'],
  ['motor before chip', 'arm: Object.freeze({ awake: false', 'arm: Object.freeze({ awake: true'],
  ['duplicate insert pays again', "case 'insert-python-chip': {", "case 'insert-python-chip': { if (state.scene === 'reward') return { ...state, warehouse: { ...state.warehouse, wage: state.warehouse.wage + 120 } };"],
];
for (const [name, needle, replacement] of mutations) {
  assert.equal(source.split(needle).length - 1, 1, `mutation anchor must be unique: ${name}`);
  const model = data(source.replace(needle, replacement));
  const tests = read('tools/chip-first-slice.test.mjs')
    .replace('../src/game/model.js', model)
    .replace('../src/game/viewport.js', new URL('src/game/viewport.js', root).href)
    .replace('../src/game/chip-scene.js', new URL('src/game/chip-scene.js', root).href);
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(data(tests))})`], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 1, `${name} must fail the acceptance suite`);
  assert.match(result.stdout + result.stderr, /AssertionError/);
  assert.doesNotMatch(result.stdout + result.stderr, /SyntaxError|ERR_MODULE_NOT_FOUND/);
  console.log(`REJECTED: ${name}`);
}
