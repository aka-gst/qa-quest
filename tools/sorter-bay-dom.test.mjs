import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = () => readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = () => readFile(new URL('../styles.css', import.meta.url), 'utf8');
const main = () => readFile(new URL('../src/game/main.js', import.meta.url), 'utf8');

test('Sorter Bay is an optional play surface, not a gate in the main campaign', async () => {
  const [markup, runtime] = await Promise.all([html(), main()]);
  assert.match(markup, /id="sorterBonus"[^>]*hidden/);
  assert.match(markup, /id="continueGame"/);
  assert.match(runtime, /sorterBay\.open/);
  assert.match(runtime, /\['reward2','reward3','reward4'\]/);
});

test('Sorter Bay exposes physical source/pass/hold lanes and hides Python until a working rule', async () => {
  const markup = await html();
  assert.match(markup, /id="sorterSource"/);
  assert.match(markup, /id="sorterPass"/);
  assert.match(markup, /id="sorterHold"/);
  assert.match(markup, /id="sorterCode"[^>]*hidden/);
  assert.match(markup, /Python откроется только после работающей схемы/);
});

test('Sorter Bay stays touch friendly at narrow widths', async () => {
  const styles = await css();
  assert.match(styles, /\.sorter-rules button,.sorter-actions button \{ min-height:56px/);
  assert.match(styles, /@media\(max-width:760px\)/);
});
