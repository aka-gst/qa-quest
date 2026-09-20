import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = () => readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = () => readFile(new URL('../styles.css', import.meta.url), 'utf8');
const main = () => readFile(new URL('../src/game/main.js', import.meta.url), 'utf8');
const render = () => readFile(new URL('../src/game/render.js', import.meta.url), 'utf8');

test('first screen explicitly reassures a total beginner without splitting the campaign', async () => {
  const source = await html();
  assert.match(source, /Я НИКОГДА НЕ ПРОГАЛ/);
  assert.match(source, /Это не тест на знания/);
  assert.match(source, /НАЧАТЬ СМЕНУ/);
  assert.doesNotMatch(source, /ВЫБЕРИ РЕЖИМ: НОВИЧОК/);
});

test('manual work is visibly recorded as a three-example pattern in UI and world', async () => {
  const [markup, renderer] = await Promise.all([html(), render()]);
  assert.match(markup, /skillRecorder/);
  assert.match(markup, /УЧИТСЯ НА ТВОИХ ДЕЙСТВИЯХ/);
  assert.match(renderer, /LEARNING PATH/);
  assert.match(renderer, /PATTERN READY/);
});

test('machine panel maps world to meaning to Python and compact mode removes only the middle explanation', async () => {
  const [markup, styles] = await Promise.all([html(), css()]);
  assert.match(markup, /conceptBridge/);
  assert.match(markup, /МИР/);
  assert.match(markup, /СМЫСЛ/);
  assert.match(markup, /PYTHON/);
  assert.match(styles, /data-explain="compact"/);
  assert.match(styles, /concept-bridge__meaning/);
});

test('adaptive coach is driven by stalled progress rather than a forced modal tutorial', async () => {
  const source = await main();
  assert.match(source, /getAdaptiveCoach/);
  assert.match(source, /engagementProgressAt/);
  assert.match(source, /currentEngagementProgressKey/);
  assert.doesNotMatch(source, /alert\(/);
});
