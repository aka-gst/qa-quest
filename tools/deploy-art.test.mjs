import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const deploy = readFileSync(new URL('./deploy.sh', import.meta.url), 'utf8');
const runtime = ['render.js', 'future-comic.js'].map(name => readFileSync(new URL(`../src/game/${name}`, import.meta.url), 'utf8')).join('\n');
const art = [...new Set([...runtime.matchAll(/['"]((?:art\/)?[^'"/]+\.(?:jpg|png|webp|svg))['"]/g)].map(match => match[1]))];
assert.equal(art.length, 5, 'currently five explicit runtime illustrations');

function probe(script) {
  const root = mkdtempSync(join(tmpdir(), 'qq-art-whitelist-'));
  const source = join(root, 'source');
  const target = join(root, 'target');
  try {
    mkdirSync(join(source, 'art'), { recursive: true });
    mkdirSync(join(target, 'art'), { recursive: true });
    for (const path of art) {
      assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `source exists: ${path}`);
      writeFileSync(join(source, path), `fixture for ${path}`);
    }
    writeFileSync(join(source, 'art/private-draft.txt'), 'must not publish');
    writeFileSync(join(target, 'art/retired.txt'), 'must be removed');
    const includes = [...script.matchAll(/--include '([^']+)'/g)].flatMap(match => ['--include', match[1]]);
    execFileSync('rsync', ['--archive', '--delete', '--delete-excluded', ...includes, '--exclude', '*', `${source}/`, `${target}/`]);
    for (const path of art) assert.ok(existsSync(join(target, path)), `runtime image omitted: ${path}`);
    assert.equal(existsSync(join(target, 'art/private-draft.txt')), false);
    assert.equal(existsSync(join(target, 'art/retired.txt')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('actual rsync whitelist delivers all runtime art and excludes private/retired files', () => probe(deploy));
test('art verifier rejects the previously omitted prologue picture (red control)', () => {
  assert.equal(deploy.split("--include 'art/night2-hero.jpg'").length, 2);
  assert.throws(() => probe(deploy.replace("--include 'art/night2-hero.jpg'", '')), /runtime image omitted/);
});
