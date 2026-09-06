import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = "document.querySelector('#homeLink').addEventListener";
const end = "document.querySelector('#journalToggle').addEventListener";
assert.equal(main.split(start).length, 2, 'home handler anchor is unique');
assert.equal(main.split(end).length, 2, 'following handler anchor is unique');
const exitCode = main.slice(main.indexOf(start), main.indexOf(end));

function exercise(started, code = exitCode) {
  const handlers = new Map();
  const nodes = new Map();
  let focused = null;
  const navigations = [];
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {
      hidden: true, inert: false,
      href: 'https://aka-gst.ru/',
      addEventListener: (event, handler) => handlers.set(`${id}:${event}`, handler),
      focus: () => { focused = id; },
    });
    return nodes.get(id);
  };
  const ctx = {
    started, exitOpen: false,
    game: { children: [node('#canvas'), node('#homeLink'), node('#exitDialog')] },
    document: { querySelector: node, get activeElement() { return node(focused); } },
    window: { location: { assign: url => navigations.push(url) } },
  };
  runInNewContext(code, ctx);
  let prevented = false;
  handlers.get('#homeLink:click')({ preventDefault() { prevented = true; }, currentTarget: node('#homeLink') });
  return { ctx, node, handlers, navigations, prevented, focused: () => focused };
}

function requireDirectExit(code = exitCode) {
  const result = exercise(false, code);
  assert.equal(result.prevented, true);
  assert.deepEqual(result.navigations, ['https://aka-gst.ru/']);
  assert.equal(result.node('#exitDialog').hidden, true);
  assert.equal(result.ctx.exitOpen, false);
}

test('actual main handler exits before play without opening a question', () => requireDirectExit());
test('active play opens a question; cancellation never navigates or restarts', () => {
  const result = exercise(true);
  assert.deepEqual(result.navigations, []);
  assert.equal(result.node('#exitDialog').hidden, false);
  assert.equal(result.ctx.exitOpen, true);
  assert.equal(result.node('#canvas').inert, true);
  assert.equal(result.focused(), '#stayInGame');
  result.handlers.get('#stayInGame:click')();
  assert.deepEqual(result.navigations, []);
  assert.equal(result.ctx.exitOpen, false);
  assert.equal(result.node('#canvas').inert, false);
  assert.equal(result.focused(), '#homeLink');
});
test('confirmation is an ordinary explicit link to the site', () => {
  assert.match(html, /<a id="confirmExit"[^>]*href="https:\/\/aka-gst\.ru\/"/);
  assert.match(html, /Прогресс может не сохраниться/);
});
test('exit verifier rejects an inverted pre-start condition (red control)', () => {
  assert.equal(exitCode.split('if (!started)').length, 2);
  assert.throws(() => requireDirectExit(exitCode.replace('if (!started)', 'if (started)')));
});
